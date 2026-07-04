import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Row, Col } from 'react-bootstrap';
import KendoGrid from 'Components/RSKendoGrid';
import RSInput from 'Components/FormFields/RSInput';
import * as placeholder from 'Constants/GlobalConstant/Placeholders';
import * as icons from 'Constants/GlobalConstant/Glyphicons';

import usePermission from 'Hooks/usePersmission';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { FORM_INITIAL_STATE } from '../../../constant';

import { getSessionId } from 'Reducers/globalState/selector';
import {
    GetWebPushbyID,
    UpsertWebPushSettings,
} from 'Reducers/preferences/CommunicationSettings/request';
import { getTriggerBaseDDLData } from 'Reducers/audience/dynamicList/request';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { encryptWithAES } from 'Utils/index';
import IntegrationSuccessModal from '../../../../../Components/IntegrationSuccessModal';
import RSTooltip from 'Components/RSTooltip';
import RSModal from 'Components/RSModal';
import RSAlert from 'Components/RSAlert';
import { ScriptBlock } from 'Assets/Images';

const extractDomain = (url) => {
    if (!url) return '';
    let domain = url.trim().toLowerCase();
    domain = domain.replace(/^https?:\/\//, '');
    const slashIndex = domain.indexOf('/');
    if (slashIndex !== -1) {
        domain = domain.substring(0, slashIndex);
    }
    const colonIndex = domain.indexOf(':');
    if (colonIndex !== -1) {
        domain = domain.substring(0, colonIndex);
    }
    domain = domain.replace(/^www\./, '');
    return domain;
};

const PushWebCreate = ({ type, handleCancel, config, setFailedApi }) => {
    const methods = useForm(FORM_INITIAL_STATE);
    const { state } = useLocation();
    const navigate = useNavigate();
    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = methods;
    const { permissions } = usePermission();
    const { addAccess } = permissions || {};
    const dispatch = useDispatch();
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));

    const [onboardedDomains, setOnboardedDomains] = React.useState([]);
    const [showSuccessModal, setShowSuccessModal] = React.useState(false);
    const [showTrackingAgreement, setShowTrackingAgreement] = React.useState(false);
    const [isShowAlert, setShowAlert] = React.useState(false);

    const [viewGridData, setViewGridData] = React.useState([]);
    const [propertiesGridData, setPropertiesGridData] = React.useState([]);
    const [initialPagination, setInitialPagination] = React.useState(false);
    const [anyCount, setAnyCount] = React.useState(null);
    const triggerLogic = watch('triggerLogic');

    const viewColumns = React.useMemo(() => [
        {
            field: 'trigger',
            title: 'Trigger',
            filter: 'text',
        },
        {
            field: 'valueType',
            title: 'Value Type',
            filter: 'text',
        },
        {
            field: 'operator',
            title: 'Operator',
            filter: 'text',
        },
        {
            field: 'value',
            title: 'Value',
            filter: 'text',
        }
    ], []);

    const propertiesColumns = React.useMemo(() => [
        {
            field: 'attributeName',
            title: 'Attribute Name',
            filter: 'text',
        },
        {
            field: 'source',
            title: 'Source',
            filter: 'text',
        },
        {
            field: 'identification',
            title: 'Identification',
            filter: 'text',
        }
    ], []);

    React.useEffect(() => {
        if (type === 'view' && config) {
            let viewJsonData = {};
            try {
                if (config.viewJson) {
                    viewJsonData = JSON.parse(JSON.parse(config.viewJson));
                }
            } catch (err) {
                try {
                    viewJsonData = JSON.parse(config.viewJson);
                } catch (e) {
                    viewJsonData = {};
                }
            }
            const conditions = viewJsonData?.triggerConditions?.conditions || [];
            setViewGridData(conditions);

            let properties = [];
            if (viewJsonData?.eventProperties) {
                if (Array.isArray(viewJsonData.eventProperties)) {
                    properties = viewJsonData.eventProperties;
                } else if (typeof viewJsonData.eventProperties === 'object') {
                    properties = Object.entries(viewJsonData.eventProperties).map(([key, val]) => ({
                        attributeName: key,
                        source: val?.source || '',
                        identification: val?.identification || '',
                    }));
                }
            }
            setPropertiesGridData(properties);

            const sessionMode = viewJsonData?.sessionTrigger?.mode || '';
            const triggerLogicVal = viewJsonData?.triggerConditions?.logic || '';
            const anyCountVal = viewJsonData?.triggerConditions?.anyCount;
            setAnyCount(anyCountVal);

            reset({
                domainName: config.CustomEventName || config.domainName,
                domainUrl: config.DomainName || config.domainURL || '',
                sessionTriggerMode: sessionMode,
                triggerLogic: triggerLogicVal,
            });
        }
    }, [type, config]);

    const openedTabRef = React.useRef(null);
    const tabClosePollRef = React.useRef(null);

    React.useEffect(() => {
        return () => {
            if (tabClosePollRef.current) {
                window.clearInterval(tabClosePollRef.current);
                tabClosePollRef.current = null;
            }
        };
    }, []);

    const domainUrlValue = watch('domainUrl');
    const getIsDomainValid = (url) => {
        if (!url || url === 'https://') return false;
        const extracted = extractDomain(url);
        if (!extracted) return false;
        return onboardedDomains.some(item => {
            const onboardedDom = extractDomain(item.value || item || '');
            return onboardedDom === extracted;
        });
    };
    const isConfigEnabled = getIsDomainValid(domainUrlValue);

    React.useEffect(() => {
        const fetchOnboardedDomains = async () => {
            const result = await dispatch(
                getTriggerBaseDDLData({
                    payload: {
                        clientId,
                        departmentId,
                        userId,
                        triggerSourceId: 1,
                    },
                })
            );
            const responseData = result?.data || result;
            if (result?.status && Array.isArray(responseData)) {
                setOnboardedDomains(responseData);
            }
        };
        fetchOnboardedDomains();
    }, [clientId, userId, departmentId, dispatch]);

    React.useEffect(() => {
        if (type === 'edit' && config?.webNotifySettingId) {
            getData();
        }
    }, [type, config?.webNotifySettingId]);

    const getData = async () => {
        const { status, data } = await dispatch(
            GetWebPushbyID({ clientId, userId, departmentId, webnotifySettingId: config?.webNotifySettingId }),
        );
        if (status) {
            reset({
                // domainName: data?.domainName,
                domainUrl: data?.domainUrl,
            });
        } else {
            setFailedApi('GetWebPushbyID');
        }
    };

    const handleEventTrackSubmit = () => {
        const getUrl = watch('domainUrl')?.value || watch('domainUrl') || '';
        if (getUrl) {
            localStorage.setItem('__brandOwnedFormData', JSON.stringify({
                // formName: watch('domainName'),
                platform: { id: 'web', value: 'Web' },
                eventTrackingUrl: getUrl
            }));
            setShowAlert(true);
            let campaignId = Math.floor(Math.random() * 1000 + 1);
            const reqs = localStorage.getItem('accessToken') || '';
            // const formName = watch('domainName') || '';
            const formName = '';
            const domain = window.location.host;
            const redurl = `${domain}/preferences/communication-settings`;
            let path = `/preferences/communication-settings`;
            const formId = config?.webNotifySettingId || 0;
            const paramsToEncrypt = `cevent|${reqs}|${formId}|${departmentId}|${formName}|${redurl}`;
            const encryptedParams = 'rfg' + btoa(paramsToEncrypt) + 'rd';
            const cleanUrl = getUrl.replace(/\/$/, '');
            let urlStr = `${cleanUrl}?_sdxFormId=${btoa(campaignId.toString())}&sdk_mode=${encryptedParams}&path=${encodeURIComponent(path)}&webft=true&bofadd=true`;
            localStorage.setItem('fdomain', urlStr);
            const opened = window.open(urlStr, '_blank');
            opened?.focus();
            openedTabRef.current = opened || null;

            if (tabClosePollRef.current) {
                window.clearInterval(tabClosePollRef.current);
                tabClosePollRef.current = null;
            }

            if (openedTabRef.current) {
                tabClosePollRef.current = window.setInterval(() => {
                    if (!openedTabRef.current || openedTabRef.current.closed) {
                        if (tabClosePollRef.current) {
                            window.clearInterval(tabClosePollRef.current);
                            tabClosePollRef.current = null;
                        }
                        openedTabRef.current = null;
                        setShowAlert(false);
                        handleCancel(true);
                    }
                }, 1000);
            }
        }
    };

    const handleFormSubmit = (formState) => {
        const selectedUrl = formState?.domainUrl?.value || formState?.domainUrl || '';
        const payload = {
            clientId,
            userId,
            departmentId,
            webnotifySettingId: type === 'edit' ? config?.webNotifySettingId : 0,
            domainName: '', // formState?.domainName,
            domainUrl: selectedUrl,
            framework: '',
            imagePath: '',
            imageName: '',
            isV1: true,
            V1Http: {
                jsonName: '',
                jsonPath: '',
            },
            Fcm: {
                fcmsenderId: '',
                fcmserverkey: '',
            },
            Firebase: {
                apiKey: '',
                authDomain: '',
                databaseUrl: '',
                projectId: '',
                storageBucket: '',
                messagingSenderId: '',
                vapid: '',
                appId: '',
            },
            isAppAnalytics: false,
            AppAnalytics: [],
            createdBy: userId,
        };

        dispatch(UpsertWebPushSettings(payload)).then((result) => {
            if (result?.status) {
                if (type === 'edit') {
                    handleSuccessModalOkay();
                    return;
                }
                setShowSuccessModal(true);
            }
        });
    };

    const handleSuccessModalOkay = () => {
        setShowSuccessModal(false);
        if (state?.from === 'WN') {
            const locationState = state?.locationState;
            const encryptState = encodeURIComponent(
                encryptWithAES(JSON.stringify(locationState).replace(/\+/g, '%2B')),
            );
            navigate(`/communication/create-communication?q=${encryptState}`);
        }
        handleCancel(true);
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <>
                    <div className="rs-sub-heading">
                        <div className="rss-left">
                            <h4>Custom event setup</h4>
                        </div>
                        {/* <div className="form-group">
                            <Row>
                                <Col sm={{ offset: 1, span: 3 }}>
                                    <label className="control-label-left float-end">{placeholder.CUSTOM_EVENT_NAME}</label>
                                </Col>
                                <Col sm={6}>
                                    <ListNameExists
                                        name={'domainName'}
                                        field="domainName"
                                        isDomain
                                        apiCallback={getWebPushDomainNameExist}
                                        condition={(status) => {
                                            return !status?.status;
                                        }}
                                        maxLength={regex.MAX_LENGTH25}
                                        placeholder={placeholder.CUSTOM_EVENT_NAME}
                                        rules={rules.LIST_NAME_RULES(error.ENTER_CUSTOM_EVENT_NAME)}
                                        customErrorMessage={error.ENTER_CUSTOM_EVENT_NAME}
                                    />
                                </Col>
                            </Row>
                        </div> */}
                        <div className="form-group">
                            <Row>
                                <Col sm={{ offset: 1, span: 3 }}>
                                    <label className="control-label-left float-end">{placeholder.DOMAIN_URL}</label>
                                </Col>
                                <Col sm={6} className="position-relative">
                                    <RSInput
                                        name={'domainUrl'}
                                        control={control}
                                        required
                                        disabled={type === 'view'}
                                        placeholder={'Enter domain URL'}
                                        onChange={(e) => {
                                            let val = e.target.value || '';
                                            const cleanedVal = val.replace(/^(https?:\/\/)(https?:\/\/)/, '$2');
                                            if (val !== cleanedVal) {
                                                methods.setValue('domainUrl', cleanedVal, { shouldValidate: true, shouldDirty: true });
                                            }
                                        }}
                                        isNewTheme={false}
                                        className="form-control text-left"
                                        rules={{
                                            required: 'Domain URL is required',
                                            validate: (val) => {
                                                const url = val?.value || val || '';
                                                const extractedDomain = extractDomain(url);
                                                if (!extractedDomain) return 'Invalid URL';

                                                const domainExists = onboardedDomains.some(item => {
                                                    const onboardedDom = extractDomain(item.value || item || '');
                                                    return onboardedDom === extractedDomain;
                                                });

                                                if (!domainExists) {
                                                    return 'Domain not found in the configured domain list.';
                                                }
                                                return true;
                                            }
                                        }}
                                    />
                                    {errors?.domainUrl && (
                                        <div className="validation-message text-left" style={{ left: '15px' }}>
                                            {errors.domainUrl.message}
                                        </div>
                                    )}
                                </Col>
                                <Col sm={1} className="pl0 align-items-center d-flex">
                                    {type !== 'view' && (
                                        <RSTooltip text={placeholder.CLICK_TO_CONFIGURE} className="d-inline-flex lh0">
                                            <div className={isConfigEnabled ? '' : 'pe-none click-off'}>
                                                <i
                                                    className={`${icons.event_tracking_medium} icon-md color-primary-blue cursor-pointer`}
                                                    onClick={() => setShowTrackingAgreement(true)}
                                                />
                                            </div>
                                        </RSTooltip>
                                    )}
                                </Col>
                            </Row>
                        </div>
                        {type === 'view' && (
                            <>
                                <div className="form-group">
                                    <Row>
                                        <Col sm={{ offset: 1, span: 3 }}>
                                            <label className="control-label-left float-end">Trigger Logic</label>
                                        </Col>
                                        <Col sm={6} className="d-flex align-items-center">
                                            <div className="flex-grow-1">
                                                <RSInput
                                                    type="text"
                                                    name="triggerLogic"
                                                    className="form-control text-left"
                                                    control={control}
                                                    disabled
                                                    isNewTheme={false}
                                                />
                                            </div>
                                            {triggerLogic?.toUpperCase() === 'ANY' && anyCount !== undefined && anyCount !== null && (
                                                <span className="ml10 font-semi-bold">{anyCount}</span>
                                            )}
                                        </Col>
                                    </Row>
                                </div>
                                <div className="form-group">
                                    <Row>
                                        <Col sm={{ offset: 1, span: 3 }}>
                                            <label className="control-label-left float-end">Trigger Mode</label>
                                        </Col>
                                        <Col sm={6}>
                                            <RSInput
                                                type="text"
                                                name="sessionTriggerMode"
                                                className="form-control text-left"
                                                control={control}
                                                disabled
                                                isNewTheme={false}
                                            />
                                        </Col>
                                    </Row>
                                </div>
                            </>
                        )}
                        {type === 'view' && (
                            <div className="mt20 p-3">
                                {propertiesGridData.length > 0 && (
                                    <div className="mb30">
                                        <h5 className="font-semi-bold mb15">Event Properties</h5>
                                        <KendoGrid
                                            data={propertiesGridData}
                                            settings={{ total: propertiesGridData.length }}
                                            isFailure={!propertiesGridData.length}
                                            noBoxShadow
                                            isCustomBox
                                            column={propertiesColumns}
                                            pagerChange={initialPagination}
                                            setInitialPagination={setInitialPagination}
                                            isLoading={false}
                                        />
                                    </div>
                                )}
                                <div className="mb30">
                                    <h5 className="font-semi-bold mb15">Trigger Conditions</h5>
                                    <KendoGrid
                                        data={viewGridData}
                                        settings={{ total: viewGridData.length }}
                                        isFailure={!viewGridData.length}
                                        noBoxShadow
                                        isCustomBox
                                        column={viewColumns}
                                        pagerChange={initialPagination}
                                        setInitialPagination={setInitialPagination}
                                        isLoading={false}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </>
                <div className="buttons-holder pref-cs-buttons-outside mb0">
                    <RSSecondaryButton
                        id="rs_PushWebCreate_Cancel"
                        type="button"
                        onClick={() => {
                            if (state?.from === 'WN') {
                                const locationState = state?.locationState;
                                const encryptState = encodeURIComponent(
                                    encryptWithAES(JSON.stringify(locationState).replace(/\+/g, '%2B')),
                                );
                                navigate(`/communication/create-communication?q=${encryptState}`);
                            }
                            handleCancel(true);
                        }}
                    >
                        Cancel
                    </RSSecondaryButton>
                    {/* {addAccess && type !== 'view' && (
                        <RSPrimaryButton type="submit" id="rs_PushWebCreate_submit">
                            {type === 'edit' ? 'Update' : 'Save'}
                        </RSPrimaryButton>
                    )} */}
                </div>
            </form>

            <IntegrationSuccessModal
                show={showSuccessModal}
                settingsId={81}
                type="web"
                domainName={''} // watch('domainName')
                framework={''}
                onClose={handleSuccessModalOkay}
            />

            <RSModal
                show={showTrackingAgreement}
                handleClose={() => setShowTrackingAgreement(false)}
                header={'Custom event tracking'}
                size="lg"
                body={
                    <p>
                        By proceeding, you acknowledge that Custom event tracking is supported only with static IDs.
                        Dynamic IDs are not supported and may result in unreliable event tracking.
                        You are solely responsible for the accuracy and integrity of all captured data and events.
                    </p>
                }
                footer={
                    <>
                        <RSSecondaryButton
                            type="button"
                            onClick={() => setShowTrackingAgreement(false)}
                        >
                            Disagree
                        </RSSecondaryButton>
                        <RSPrimaryButton
                            type="button"
                            onClick={() => {
                                setShowTrackingAgreement(false);
                                handleEventTrackSubmit();
                            }}
                        >
                            I Agree
                        </RSPrimaryButton>
                    </>
                }
            />

            <RSAlert
                show={isShowAlert}
                header={false}
                containerClass="py0"
                body={
                    <div className="d-flex align-items-center justify-content-center">
                        <div>
                            <img src={ScriptBlock} alt="scriptBlock" width={100} height={100} />
                        </div>
                        <div className="my20">
                            <h1 className="mb0">{placeholder.WAITING_FOR_EVENT_SET}</h1>
                        </div>
                        <div className="ml30">
                            <RSPrimaryButton
                                id=""
                                onClick={() => {
                                    setShowAlert(false);
                                }}
                            >
                                Proceed
                            </RSPrimaryButton>
                        </div>
                    </div>
                }
            />
        </FormProvider>
    );
};

export default PushWebCreate;