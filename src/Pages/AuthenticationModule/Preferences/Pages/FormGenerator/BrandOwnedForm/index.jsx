import { HTTPS_REGEX, MAX_LENGTH50, URLPATTERN } from 'Constants/GlobalConstant/Regex';
import { DOMAIN_NOT_ONBOARDED, ENTER_PAGE_URL, ENTER_SECURED_WEBSITE } from 'Constants/GlobalConstant/ValidationMessage';
import { ARE_YOU_SURE_WANT_TO_RESET, BRAND_FORM_PAGE_URL, BRAND_OWNED_FORM, CANCEL, CLICK_TO_CONFIGURE, EDIT, OK, PAGE_URL, PLATFORM, PLATFORMNAME, RESET, RESET_PLATFORM, SAVE, SAVE_FORM_NAME, UPDATE, WAITING_FOR_EVENT_SET } from 'Constants/GlobalConstant/Placeholders';
import { event_tracking_medium, pencil_edit_medium, restart_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Col, Container, Row } from 'react-bootstrap';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import RSPageHeader from 'Components/RSPageHeader';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSTooltip from 'Components/RSTooltip';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSAlert from 'Components/RSAlert';
import RSModal from 'Components/RSModal';
import RSInput from 'Components/FormFields/RSInput';
import Icon from 'Components/Icon/Icon';
import RSConfirmationModal from 'Components/ConfirmationModal';

import { ScriptBlock } from 'Assets/Images';
import content from 'Constants/GlobalConstant/Content/content.json';
import WebFieldTrack from './Components/WebFieldTrackModal';
import BrandownFormTable from './Components/WebFieldTrackModal/BrandownFormTable';
import AppFieldTrack from './Components/AppFieldTrack/AppFieldTrack';
import { appDeviceList } from './Components/AppFieldTrack/constant';

import {
    checkSaveFormExist,
    getFormData,
    saveAndUpdateBrandOwnedForm,
} from 'Reducers/preferences/FormGenerator/request';
import { getTriggerBaseDDLData } from 'Reducers/audience/dynamicList/request';

import { GetMobilePush } from 'Reducers/preferences/CommunicationSettings/request';
import { getSessionId } from 'Reducers/globalState/selector';
import { buildPayload, buildAppFieldTrackPayload } from './Components/WebFieldTrackModal/constant';
import ListNameExists from 'Components/ListNameExists';
import useQueryParams from 'Hooks/useQueryParams';
import { MOBILE_BRAND_OWN_FORM_INITIAL_STATE } from './Components/AppFieldTrack/constant';

const normalizeBrandFormDeviceToken = (value) =>
    value == null || value === '' ? '' : String(value).toLowerCase().replace(/\s+/g, '');

/** Keys: normalized id and normalized label → dropdown row (built once). */
const BRAND_FORM_DEVICE_LOOKUP = appDeviceList.reduce((acc, item) => {
    acc.set(normalizeBrandFormDeviceToken(item.id), item);
    acc.set(normalizeBrandFormDeviceToken(item.value), item);
    return acc;
}, new Map());

const resolveAppDeviceEntry = (viewJson, row) => {
    const token =
        normalizeBrandFormDeviceToken(viewJson?.clientData?.deviceType) ||
        normalizeBrandFormDeviceToken(row?.deviceType);
    return token ? BRAND_FORM_DEVICE_LOOKUP.get(token) : undefined;
};

const BrandOwnedForm = () => {
    const navigate = useNavigate();
    const disPatch = useDispatch();
    const methods = useForm({
        defaultValues: { ...MOBILE_BRAND_OWN_FORM_INITIAL_STATE },
        mode: 'onTouched',
    });
    const { control, handleSubmit, getValues, watch, reset, setValue, clearErrors, formState: { errors } } = methods;
    const [isShowAlert, setShowAlert] = useState(false);
    const [showTrackingAgreement, setShowTrackingAgreement] = useState(false);
    const [isShowWFTM, setShowWFTM] = useState(false);
    const [webFieldTrackEditData, setWebFieldTrackEditData] = useState({});
    const [platform, setplatform] = useState('');
    const [webFieldTableData, setWebFieldTableData] = useState([]);
    const [isEnableSave, setEnableSave] = useState(false);
    const [appFieldTrackData, setAppFieldTrackData] = useState([]);
    const [isAppEdit, setIsAppEdit] = useState(false);
    const [isReset, setReset] = useState(false);
    const [appList, setApplist] = useState([]);
    const [mobileAppId, setMobileAppId] = useState(null);
    const [showResetConfirmation, setShowResetConfirmation] = useState(false);
    const [showRefreshConfirmation, setShowRefreshConfirmation] = useState(false);
    const [domainList, setDomainList] = useState([]);
    const [isDomainValidating, setIsDomainValidating] = useState(false);
    const [isFormNameValid, setIsFormNameValid] = useState(false);
    const [currentFormId, setCurrentFormId] = useState(0);
    const skipNextMobileFetchRef = useRef(false);
    const { departmentId, clientId, userId, departmentName } = useSelector((state) => getSessionId(state));

    const platFormList = [
        { id: 'web', value: 'Web' },
        { id: 'mobile', value: 'Mobile' },
    ];
    useEffect(() => {
        let params = new URLSearchParams(document.location.search);
        if (params?.get('webft')) setShowWFTM(true);
        restoreFormData();
        getDomainListData();
        return () => {
            localStorage.removeItem('__webFieldTrackEventData');
            localStorage.removeItem('__brandOwnedFormData');
        };
    }, []);

    useEffect(() => {
        if (platform === 'mobile') {
            if (skipNextMobileFetchRef.current) {
                skipNextMobileFetchRef.current = false;
                return;
            }
            getData();
        }
    }, [platform]);

    const restoreFormData = () => {
        const saved = localStorage.getItem('__brandOwnedFormData');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (data.formName) setValue('formName', data.formName);
                if (data.platform?.id) {
                    setValue('platform', data.platform);
                    setplatform(data.platform.id);
                }
                if (data.eventTrackingUrl) setValue('eventTrackingUrl', data.eventTrackingUrl);
            } catch (e) {}
        }
    };

    const getData = async () => {
        const { status, data } = await disPatch(
            GetMobilePush({ clientId, userId, departmentId }, { loading: true }),
        );
        // console.log('data: ', data);
        let finalAppList;
        if (status) {
            //console.log('data: ', data);
            setApplist(data);
            finalAppList = data;
            if (mobileAppId) {
                let app = data.filter((item) => item?.appId === mobileAppId);
                setValue('appName', app?.[0]);
            }
        }
        return finalAppList;
    };

    const getDomainListData = async () => {
        setIsDomainValidating(true);
        const payload = {
            clientId: clientId,
            departmentId: departmentId || 0,
            userId,
            triggerSourceId: 1,
        };
        const { status, data } = await disPatch(getTriggerBaseDDLData({ payload, isPageHeader: true }));
        if (status && data) {
            setDomainList(data);
            // Re-validate the current URL if it exists
            const currentUrl = getValues('eventTrackingUrl');
            if (currentUrl) {
                // Trigger re-validation by clearing and setting the value
                setValue('eventTrackingUrl', currentUrl, { shouldValidate: true });
            }
        }
        setIsDomainValidating(false);
    };

    const validateDomain = (url) => {
        if (!url || !domainList.length) return true;
        
        try {
            const urlObj = new URL(url);
            const enteredDomain = urlObj.hostname.toLowerCase();
            
            // Check if the entered domain matches any domain in the list
            const isDomainValid = domainList.some(domain => {
                const domainValue = domain.value?.toLowerCase().replace(/\/$/, ''); // Remove trailing slash
                const domainId = domain.id?.toLowerCase();
                
                return enteredDomain === domainValue || 
                       enteredDomain === domainId ||
                       enteredDomain.includes(domainValue) ||
                       domainValue.includes(enteredDomain);
            });
            
            return isDomainValid;
        } catch (error) {
            return false;
        }
    };
    const handleEventTrackSubmit = (formId = 0) => {
        const getUrl = getValues('eventTrackingUrl');
        if (getUrl) {
            localStorage.setItem('__brandOwnedFormData', JSON.stringify({
                formName: getValues('formName'),
                platform: getValues('platform'),
                eventTrackingUrl: getValues('eventTrackingUrl')
            }));
            setShowAlert(true);
            const searchParams = new URLSearchParams(location.search);
            const param = searchParams.get('q');
            let campaignId = Math.floor(Math.random() * 1000 + 1);
            const reqs = localStorage.getItem('accessToken') || '';
            const formName = getValues('formName') || '';
            const domain = window.location.host;
            const redurl = `${domain}/preferences/template-gallery/form-generator`;
            let path = `/preferences/template-gallery/brand-owned-form-generator`;
            const paramsToEncrypt = `bof|${reqs}|${formId}|${departmentId}|${formName}|${redurl}`;
            const encryptedParams = 'rfg' + btoa(paramsToEncrypt) + 'rd';
            const cleanUrl = getUrl.replace(/\/$/, '');
            let urlStr = `${cleanUrl}?_sdxFormId=${btoa(campaignId.toString())}&sdk_mode=${encryptedParams}&path=${encodeURIComponent(path)}&webft=true&bofadd=true`;
            localStorage.setItem('fdomain', urlStr);
            window.open(urlStr, '_blank').focus();
        }
    };
    const handleTrackingAgreement = (isAgree) => {
        setShowTrackingAgreement(false);
        if (isAgree) {
            handleEventTrackSubmit(0);
        } else {
            localStorage.removeItem('__webFieldTrackEventData');
            localStorage.removeItem('__brandOwnedFormData');
            navigate('/preferences/form-generator');
        }
    };

    const handleWebFieldTrackSubmit = async ({ data }) => {
        localStorage.setItem('__webFieldTrackEventData', JSON.stringify(data));
                setWebFieldTrackEditData(data);
        setShowWFTM(false);
        setWebFieldTableData(data?.eventList);
        setEnableSave(true);
    };

    const updateWebFieldTrackEventData = (data) => {
                localStorage.setItem('__webFieldTrackEventData', JSON.stringify(data));
        setWebFieldTrackEditData(data);
        setWebFieldTableData(data?.eventList);
        setReset(true);
    };

    const handleBrandOwnFormSubmit = async (formData) => {
        let formId = fromId?.recipientFormId || 0;
        if (platform === 'mobile') {
            let appFieldTrackPayload = buildAppFieldTrackPayload(appFieldTrackData, formData, formId);
                        // return false;
            const payload = { clientId, departmentId, userId, ...appFieldTrackPayload };
            
            let { data, status } = await disPatch(saveAndUpdateBrandOwnedForm(payload));
            // navigate('/preferences/form-generator');
            if (status) {
                navigate('/preferences/form-generator');
            } else {
                            }
        } else {
                        let fieldTrackData = {};
            if (localStorage?.__webFieldTrackEventData) {
                fieldTrackData = JSON.parse(localStorage?.__webFieldTrackEventData);
            } else if (isAppEdit) {
                fieldTrackData = webFieldTrackEditData;
            }
                        let formPayload = buildPayload(fieldTrackData, formData, formId);
            
            const payload = { clientId, departmentId, userId, ...formPayload };
            let { data, status } = await disPatch(saveAndUpdateBrandOwnedForm(payload));
            if (status) {
                localStorage.removeItem('__webFieldTrackEventData');
                localStorage.removeItem('__brandOwnedFormData');
                navigate('/preferences/form-generator');
            } else {
                            }
        }
    };
    const fromId = useQueryParams('/preferences/form-generator');
    useEffect(() => {
        async function getEdit() {
            if (!!fromId) {
                let payload = { departmentId, clientId, userId, recipientFormId: fromId?.recipientFormId || 0 };
                let { data, status } = await disPatch(getFormData(payload));
                if (status) {
                    let viewJson = {};
                    try {
                        if (data[0]?.jsonData) viewJson = JSON.parse(data[0].jsonData);
                    } catch (_e) {
                        viewJson = {};
                    }
                    let currentPlatform = {};
                    let currentDevice = {};
                    const resultArray = Object.keys(viewJson)
                        .filter((key) => !isNaN(key))
                        .map((key) => viewJson[key]);
                    let finalApplist = [];
                    if (data[0]?.appId) {
                        finalApplist = appList?.length ? appList : await getData();
                    }
                    const appDetails = finalApplist?.find((x) => x?.appId === data[0]?.appId);
                    if (data[0]?.appId) {
                        currentPlatform = { ...platFormList[1] };
                        skipNextMobileFetchRef.current = true;
                        setplatform(platFormList[1]?.id);
                        setIsAppEdit(true);
                        setIsFormNameValid(true);
                        setAppFieldTrackData({ eventsSocketData: viewJson, events: data[0]?.formGenerationColumn });
                        currentDevice = resolveAppDeviceEntry(viewJson, data[0]);
                        setMobileAppId(data[0]?.appId);
                        reset({
                            formName: data[0]?.formName,
                            platform: currentPlatform,
                            deviceType: currentDevice,
                            mobileForm: [
                                {
                                    appName: {
                                        appId: data[0]?.appId,
                                        appName: appDetails?.appName,
                                        createdBy: data[0]?.createdBy,
                                        createdDate: data[0]?.createdDate,
                                        device: [
                                            {
                                                analyticsPlatforms: '',
                                                appDevice: 'Android Phone',
                                                language: '',
                                                pushNotifyappstoreId: 1,
                                            },
                                            {
                                                analyticsPlatforms: '',
                                                appDevice: 'iphone',
                                                language: '',
                                                pushNotifyappstoreId: 2,
                                            },
                                        ],
                                        isActive: true,
                                        isEnabled: 'NA',
                                        pushNotifySettingId: 1,
                                    },
                                    data: viewJson,
                                    deviceType: currentDevice,
                                    events: resultArray,
                                    modalShow: false,
                                },
                            ],
                        });
                    } else {
                        setIsAppEdit(true);
                        setIsFormNameValid(true);
                        currentPlatform = { ...platFormList[0] };
                        const formId = data[0]?.recipientFormId || 0;
                        setCurrentFormId(formId);
                        const transformedEventList = viewJson?.fields?.map((field) => ({
                            eventname: field?.eventName || field?.fieldName,
                            attributeType: {
                                attributeName: field?.fieldAttName || field?.fieldName,
                                attrName: field?.fieldAttName || field?.fieldName,
                                dataAttributeId: field?.dataAttributeId,
                            },
                            elementtype: field?.captureType || field?.fieldType,
                            trackingType: field?.captureType || field?.fieldType,
                            mandatory: field?.requiredfield || false,
                            markAsGoal: field?.markAsSubmit || false,
                            identifier: field?.identifier,
                            fieldType: field?.fieldType,
                            apiKey: field?.apiKey,
                            screenName: field?.screenName,
                        })) || [];
                        
                        reset({
                            formName: data[0]?.formName,
                            platform: currentPlatform,
                            eventTrackingUrl: viewJson?.eventTrackingUrl || data[0]?.domainName,
                        });
                        setplatform(platFormList[0]?.id);
                        setWebFieldTableData(transformedEventList);
                        
                        const editData = {
                            ...viewJson,
                            eventList: transformedEventList,
                        };
                        setWebFieldTrackEditData(editData);
                        localStorage.setItem('__webFieldTrackEventData', JSON.stringify(editData));
                    }
                    setEnableSave(true);
                }
            }
        }
        getEdit();
    }, [fromId]);

    const updateAppFieldTrackData = ({ eventsSocketData, events }) => {
        if (events?.length) {
            setAppFieldTrackData({ eventsSocketData, events });
            setEnableSave(true);
        }
    };

    const handleRefresh = () => {
        setWebFieldTrackEditData({});
        // setValue('platform', {});
        setValue('eventTrackingUrl', '');
        setWebFieldTableData([]);
        setIsAppEdit(false);
        setEnableSave(false);
        setReset(false);
    };
    const handleAppRefresh = () => {
        setShowRefreshConfirmation(true);
    };

    const confirmAppRefresh = () => {
        setAppFieldTrackData({});
        // setValue('platform', {});
        setValue('mobileForm[0].deviceType', {});
        setValue('mobileForm[0].appName', {});
        setValue('mobileForm[0].events', []);
        setValue('mobileForm[0].data', {});
        setValue('mobileForm[0].modalShow', false);
        setWebFieldTableData([]);
        setIsAppEdit(false);
        setEnableSave(false);
        setReset(false);
        setShowRefreshConfirmation(false);
    };

    const handleRefreshCancel = () => {
        setShowRefreshConfirmation(false);
    };

    const handlePlatformReset = () => {
        setShowResetConfirmation(true);
    };

    const confirmPlatformReset = () => {
        setValue('platform', {});
        setplatform('');
        setValue('eventTrackingUrl', '');
        setValue('mobileForm[0].deviceType', {});
        setValue('mobileForm[0].appName', {});
        setValue('mobileForm[0].events', []);
        setValue('mobileForm[0].data', {});
        setValue('mobileForm[0].modalShow', false);
        setWebFieldTrackEditData({});
        setWebFieldTableData([]);
        setAppFieldTrackData({});
        setIsAppEdit(false);
        setEnableSave(false);
        setReset(false);
        setMobileAppId(null);
        setIsFormNameValid(true);
        clearErrors();
        setShowResetConfirmation(false);
    };

    const handleResetCancel = () => {
        setShowResetConfirmation(false);
    };
    const isLoading = watch('isLoadingListName');
    const pointerNone = isLoading ? 'pe-none' : '';
    return (
        <div className="page-content-holder">
            {/* Main page heading block starts */}
            <RSPageHeader
                title={BRAND_OWNED_FORM}
                isBack
                backPath="/preferences/form-generator"
                rightCommonMenus={false}
                isHeaderLine
            />
            <Container className="col-12">
                <FormProvider {...methods}>
                    <form className="rsv-tabs-content position-relative">
                        <div className={`box-design bd-top-border`}>
                            <div className="form-group mt30">
                                <Row>
                                    <Col sm={{ offset: 1, span: 3 }}>
                                        <label className="control-label-left float-end">{SAVE_FORM_NAME}</label>
                                    </Col>
                                    <Col sm={6}>
                                        {/* <RSInput
                                        control={control}
                                        name={`formName`}
                                        label={'Form name'}
                                        required
                                        rules={{
                                            required: 'Enter form name',
                                        }}
                                    /> */}

                                        <ListNameExists
                                            name={'formName'}
                                            field="formName"
                                            control={control}
                                            placeholder={SAVE_FORM_NAME}
                                            rules={{ required: FORM_NAME }}
                                            customErrorMessage={FORM_NAME}
                                            apiCallback={checkSaveFormExist}
                                            maxLength={MAX_LENGTH50}
                                            condition={(data) => {
                                                const { status, message } = data;
                                                if (status) {
                                                    setIsFormNameValid(false);
                                                    return false;
                                                } else if (!status) {
                                                    setIsFormNameValid(true);
                                                    return true;
                                                } else {
                                                    setIsFormNameValid(false);
                                                    return false;
                                                }
                                            }}
                                            disabled={isAppEdit}
                                        />
                                    </Col>
                                </Row>
                                  </div>
                                {(isAppEdit || isFormNameValid) && (
                                <div className="form-group">
                                <Row>
                                    <Col sm={{ offset: 1, span: 3 }}>
                                        <label className="control-label-left float-end">{PLATFORM}</label>
                                    </Col>
                                    <Col sm={6}>
                                        <RSKendoDropDownList
                                            control={control}
                                            name={`platform`}
                                            data={platFormList}
                                            dataItemKey={'id'}
                                            textField={'value'}
                                            label={PLATFORM}
                                            required
                                            rules={{ required: PLATFORMNAME }}
                                            handleChange={({ value }) => {
                                                setplatform(value.id);
                                            }}
                                            disabled={isAppEdit || isReset || platform || (!isAppEdit && !isFormNameValid) ? true : false}
                                        />
                                    </Col>
                                    {platform && (
                                        <Col sm={1} className="d-flex align-items-center pl0">
                                            <RSTooltip text={RESET} position="top">
                                                <Icon
                                                    icon={restart_medium}
                                                    size="md"
                                                    mainClass="color-primary-blue cursor-pointer"
                                                    callBack={handlePlatformReset}
                                                />
                                            </RSTooltip>
                                        </Col>
                                    )}
                                </Row>
                                </div>
                                )}
                                {platform === 'web' && (
                                <div className="form-group">
                                    <Row>
                                        <Col sm={{ offset: 1, span: 3 }}>
                                            <label className="control-label-left float-end">{BRAND_FORM_PAGE_URL}</label>
                                        </Col>
                                        <Col sm={6}>
                                            <RSInput
                                                control={control}
                                                name={`eventTrackingUrl`}
                                                // name={`conversionUrl`}
                                                label={PAGE_URL}
                                                required
                                                rules={{
                                                    required: ENTER_PAGE_URL,
                                                    pattern: {
                                                        value: HTTPS_REGEX,
                                                        message: ENTER_SECURED_WEBSITE,
                                                    },
                                                    validate: {
                                                        domainValidation: (value) => {
                                                            if (!value) return true;
                                                            if (isDomainValidating) return true;
                                                            return validateDomain(value) || DOMAIN_NOT_ONBOARDED;
                                                        }
                                                    }
                                                }}
                                                disabled={isAppEdit || isReset ? true : false}
                                            />
                                        </Col>

                                        <Col sm={1} className={`fg-icons-wrapper pl0 d-flex`}>
                                            {webFieldTableData?.length && (isAppEdit || isReset) ? (
                                                <div className={`fg-icons d-flex ${platform === 'mobile'  ? '': 'mr15'}`}>
                                                    <RSTooltip text={EDIT} position="top">
                                                        <div   className={`${
                                                                URLPATTERN.test(watch('eventTrackingUrl')) &&
                                                                !errors?.eventTrackingUrl
                                                                    ? ''
                                                                    : 'pe-none click-off'
                                                            }`}>
                                                        <i
                                                            className={`${
                                                                pencil_edit_medium
                                                            } icon-md color-primary-blue`}
                                                            onClick={() => {
                                                                                                                                handleEventTrackSubmit(currentFormId);
                                                            }}
                                                        /></div>
                                                    </RSTooltip>
                                                </div>
                                            ) : null}
                                            <div className="fg-icons d-flex pl0">
                                                {isEnableSave || isAppEdit || isReset ? (
                                                    <RSTooltip text={RESET}>
                                                        <i
                                                            className={`${restart_medium} icon-md color-primary-blue`}
                                                            onClick={handleRefresh}
                                                        />
                                                    </RSTooltip>
                                                ) : (
                                                    <RSTooltip text={CLICK_TO_CONFIGURE}>
                                                        <div    className={`${
                                                                URLPATTERN.test(watch('eventTrackingUrl')) 
                                                                && 
                                                                !errors?.eventTrackingUrl
                                                                    ? ''
                                                                    : 'pe-none click-off'
                                                            }`}>
                                                        <i
                                                            className={`${
                                                                event_tracking_medium
                                                            } icon-md color-primary-blue`}
                                                            onClick={() => {
                                                                setShowTrackingAgreement(true);
                                                            }}
                                                        />
                                                        </div>
                                                    </RSTooltip>
                                                )}
                                            </div>
                                        </Col>
                                    </Row>
                                    </div>
                                )}
                                {webFieldTableData?.length ? (
                                    <BrandownFormTable webFieldTableData={webFieldTableData} />
                                ) : null}
<Row>
                                  <Col sm={{ offset: 4, span: 6 }}>
                                  {platform === 'mobile' ? (
                                    <AppFieldTrack
                                        updateData={(data) => {
                                            updateAppFieldTrackData(data);
                                        }}
                                        isAppEdit={isAppEdit}
                                        editData={appFieldTrackData}
                                        appDeviceList={appDeviceList}
                                        appList={appList}
                                        onRefresh={handleAppRefresh}
                                    />
                                ) : null}
                              </Col>
</Row>
                              
                          
                        </div>
                          <div className={`buttons-holder ${pointerNone}`}>
                                    <RSSecondaryButton
                                        type="button"
                                        onClick={() => {
                                            localStorage.removeItem('__webFieldTrackEventData');
                                            localStorage.removeItem('__brandOwnedFormData');
                                            navigate('/preferences/form-generator');
                                        }}
                                    >
                                        {CANCEL}
                                    </RSSecondaryButton>

                                    {!(platform === 'web' && isAppEdit) && (
                                        <RSPrimaryButton
                                            className={`${!isEnableSave ? 'click-off' : ''}`}
                                            onClick={handleSubmit(handleBrandOwnFormSubmit)}
                                        >
                                            {isAppEdit ? UPDATE : SAVE}
                                        </RSPrimaryButton>
                                    )}
                                </div>
                    </form>
                </FormProvider>
                <RSModal
                    show={showTrackingAgreement}
                    handleClose={() => setShowTrackingAgreement(false)}
                    header={'Brand owned form'}
                    size="lg"
                    body={
                        <>
                            <div className="my10">
                                <p className="mb10 d-block">
                                    By proceeding, you acknowledge that form tracking is supported only with static IDs.
                                    Dynamic IDs are not supported and may result in unreliable event tracking.
                                    You are solely responsible for the accuracy and integrity of all captured data and events.
                                </p>
                            </div>
                        </>
                    }
                    footer={
                        <>
                            <RSSecondaryButton
                                type="button"
                                onClick={() => handleTrackingAgreement(false)}
                            >
                                Disagree
                            </RSSecondaryButton>
                            <RSPrimaryButton
                                type="button"
                                onClick={() => handleTrackingAgreement(true)}
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
                        <>
                            <div className="d-flex align-items-center justify-content-center">
                                <div>
                                    <img src={ScriptBlock} alt="scriptBlock" width={100} height={100} />
                                </div>
                                <div className="my20">
                                    <h1 className="mb0">{WAITING_FOR_EVENT_SET}</h1>
                                </div>
                                <div className="ml30">
                                    <RSPrimaryButton
                                        id=""
                                        onClick={() => {
                                            let data = {};
                                            if (localStorage?.__webFieldTrackEventData)
                                                data = JSON.parse(localStorage?.__webFieldTrackEventData);
                                            restoreFormData();
                                            setShowAlert(false);
                                            if (data && Object.keys(data)?.length) {
                                                setEnableSave(true);
                                                updateWebFieldTrackEventData(data);
                                            }
                                        }}
                                    >
                                        {content.proceed}
                                    </RSPrimaryButton>
                                </div>
                            </div>
                        </>
                    }
                />

                {isShowWFTM && (
                    <WebFieldTrack
                        show={isShowWFTM}
                        onWebFieldTrackSubmit={(data) => {
                            handleWebFieldTrackSubmit({ data });
                        }}
                        editEventList={webFieldTrackEditData}
                        handleModalClose={() => setShowWFTM(false)}
                    />
                )}

                <RSConfirmationModal
                    show={showResetConfirmation}
                    text={ARE_YOU_SURE_WANT_TO_RESET}
                    header={RESET_PLATFORM}
                    handleConfirm={confirmPlatformReset}
                    handleClose={handleResetCancel}
                    primaryButtonText={OK}
                    secondaryButtonText={CANCEL}
                />

                <RSConfirmationModal
                    show={showRefreshConfirmation}
                    text={ARE_YOU_SURE_WANT_TO_RESET}
                    header={RESET}
                    handleConfirm={confirmAppRefresh}
                    handleClose={handleRefreshCancel}
                    primaryButtonText={OK}
                    secondaryButtonText={CANCEL}
                />
            </Container>
        </div>
    );
};

export default BrandOwnedForm;
