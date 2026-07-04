import { getmasterData } from 'Utils/modules/masterData';
import { MAXL_LENGTH2048, WEB_URL_REGEX } from 'Constants/GlobalConstant/Regex';
import { ENTER_AN_URL, ENTER_VALID_WEBSITE, SELECT_SUBSCRPTION_FORM } from 'Constants/GlobalConstant/ValidationMessage';
import { ADD_URL, EDIT, EVENT_TRACKING, REMOVE_URL, RESET, URL, WAITING_FOR_EVENT_SET } from 'Constants/GlobalConstant/Placeholders';
import { circle_minus_fill_medium, circle_plus_fill_medium, close_mini, event_tracking_medium, pencil_edit_medium, restart_medium } from 'Constants/GlobalConstant/Glyphicons';
import RSInput from 'Components/FormFields/RSInput';
import { Fragment, useContext, useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useFieldArray, useFormContext } from 'react-hook-form';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { getTriggerAttributeValuesData } from 'Reducers/audience/dynamicList/request';
import useApiLoader from 'Hooks/useApiLoader';
import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
import RSTooltip from 'Components/RSTooltip';

import { get_formCSV_FormFields } from 'Reducers/preferences/FormGenerator/request';
import { getGeneratedLink, getMobileAppId } from 'Reducers/communication/createCommunication/smartlink/selectors';
import useQueryParams from 'Hooks/useQueryParams';
import { get as _get } from 'Utils/modules/lodashReplacements';
import RSAlert from 'Components/RSAlert';
import { Timer } from 'Assets/Images';
import { Container } from 'react-bootstrap';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSModal from 'Components/RSModal';

import content from 'Constants/GlobalConstant/Content/content.json';
import {
    getWebAnalyticsFormList,
    saveWebAnalyticsChannel,
} from 'Reducers/communication/createCommunication/Create/request';
import { buildPayload } from '../../constant';
import { webAnalyticsContext } from '../../WebAnalytics';
import { AUTHORING_FIELD_LOADER_CONFIG } from 'Components/Skeleton/pages/communication/authoring';
const RenderInput = ({
    type,
    url,
    nameType,
    name,
    setGoalPayload,
    isAppAnalytics,
    updateWebFieldTrackEventData,
    webFieldTrackEventList,
}) => {
    const {
        control,
        watch,
        trigger,
        formState: { isValid },
        setValue,
        getValues,
        unregister,
        reset,
        resetField,
        getFieldState,
    } = useFormContext();
    const dispatch = useDispatch();
    const locationState = useQueryParams('/communication');
    const {
        tabsState: { analytics: tabAnalyticsState },
        activeTabs,
        isDirty,
        WebAnalytics,
        analytics,
    } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const smartLink = useSelector((state) => getGeneratedLink(state));

    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const { savedChannelsId } = useSelector(({ communicationPlanReducer }) => communicationPlanReducer);
    const savedChannel = savedChannelsId[isAppAnalytics ? 16 : 6]?.includes(isAppAnalytics ? 16 : 6) ? true : false;
    const mobileAppId = useSelector((state) => getMobileAppId(state));
    const [customeventsData, setCustomEventsData] = useState([]);
    const [customValues, setCustomValues] = useState(['Enter manual value']);
    const [pagesList, setPagesList] = useState([]);
    const { currencyMasterList } = getmasterData();
    const [isShowAlert, setShowAlert] = useState(false);
    const [showTrackingAgreement, setShowTrackingAgreement] = useState(false);
    const [pendingUrlVal, setPendingUrlVal] = useState(null);
    const { fields, append, remove } = useFieldArray({ control, name: `${name}Pages` });
    const [pages, customEvents = [], manualType, action, formValues = [], customEventsData] = watch([
        `${name}Pages`,
        `${name}CustomEvents`,
        `${name}ManualType`,
        `${name}Action`,
        `${name}FormValues`,
        `customEventsData`,
    ]);

    const isEngagement = locationState?.primaryGoal === 'Engagement' || locationState?.secondaryGoal === 'Engagement';
    const isConverison = locationState?.primaryGoal === 'Conversion' || locationState?.secondaryGoal === 'Conversion';
    const webContextValue = useContext(webAnalyticsContext);
    const { setShowWFTM, handleEditEvent, waMode, formListLoader } = webContextValue;
    const customEventsLoader = useApiLoader({
        autoFetch: false,
        mode: waMode || 'create',
        loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
    });
    const subscriptionFormLoading = formListLoader?.isLoading;
    useEffect(() => {
        async function getCustomEventsValue() {
            const payload = {
                triggerddlValue: isAppAnalytics ? mobileAppId || '' : url?.id || '',
                attributeName: 'Custom events',
                triggerSourceId: isAppAnalytics ? 5 : 1,
                fieldType: 'D',
                departmentId,
                clientId,
                userId,
                levelNo: 1,
                formId: '',
                columnName: '',
            };
            const res = await customEventsLoader.refetch({
                fetcher: async () => dispatch(getTriggerAttributeValuesData({ payload, loading: false })),
            });
            if (res?.status) {
                setCustomEventsData(res?.data);
                res?.data?.length ? setValue(`customEventsData`, res?.data) : setValue(`customEventsData`, []);
            } else {
                setCustomEventsData([]);
                setValue(`customEventsData`, []);
            }
        }
        const getFormList = () => {
            const payload = { clientId, departmentId, userId };
            if (formListLoader) {
                formListLoader.refetch({
                    fetcher: async () => dispatch(getWebAnalyticsFormList({ payload, loading: false })),
                });
            } else {
                dispatch(getWebAnalyticsFormList({ payload }));
            }
        }

        if (type === 'Custom events' && !!nameType) {
            getCustomEventsValue();
        } else if (type === 'Forms' && (WebAnalytics?.webAnalyticsFormList?.length === 0 ||
            WebAnalytics?.webAnalyticsFormList === undefined)) {
            getFormList()
        }
    }, [type]);

    useEffect(() => {
        if (customEventsData) {
            setCustomEventsData((prev) => ({
                ...prev,
                customEventsData,
            }));
        }
    }, [customEventsData]);

    useEffect(() => {
        const smarlinkEntries = Object.entries(smartLink);

        let temp = smarlinkEntries?.map((item, idx) => {
            return {
                url: item?.[1],
            };
        });
        // resetField(`${name}Pages`);
        // setValue(`${name}Pages`, temp);
        setPagesList(temp);
        // debugger;
        // const newTabState = tab.map((tabs, index) => {
        //     if (index > 0) {
        //         const [key = '', value = ''] = smarlinkEntries?.[index] || [];
        //         tabs.isAdd = value === '';
        //         console.log('value: ', value);
        //     } else {
        //         tabs.isAdd = smarlinkEntries?.[0]?.[1] === '';
        //     }
        //     return tabs;
        // });
    }, [smartLink]);

    const addUrl = (idx) => {
        let arr = pages?.map((item) => item?.url);
        // debugger;
        let temp = pages?.map((item) => item?.url);
        // console.log('temp ::: ', temp, temp?.length);
        let duplicate = [];
        if (temp?.length > 1) {
            duplicate = temp?.filter((item, idx, arr) => arr.indexOf(item) !== idx);
            // console.log('check :::: ', duplicate);
        }
        if (arr.includes('') || duplicate?.length !== 0) {
            trigger((pages ?? []).map((_, index) => `${name}Pages.${index}.url`));
        } else {
            append({ url: '' });
        }
    };

    const getFormValues = async (form) => {
        const payload = {
            departmentId,
            clientId,
            userId,
            formId: form?.formId,
            isRmNotifier: false
        };

        const res = await dispatch(get_formCSV_FormFields(payload));
        if (res?.status) {
            let temp = res?.data?.FormFields?.map((item) => item?.ColumnName);
            // setFormValues(temp);
            setValue(`${name}FormValues`, temp);
        }
    };
    // console.log('Check ::::: status::  ', getFieldState(`${name}Pages`), pagesList);

    const handleWebFieldTrackRedirect = async (urlVal) => {
        const data = getValues();
        const payload = buildPayload(data, isEngagement, isConverison, locationState?.campaignId, userId);
        const response = await dispatch(
            saveWebAnalyticsChannel({
                payload: { ...payload, clientId, userId, departmentId, copy: false },
                savedChannelsId,
            }),
        );
        if (response?.status) {
            const getUrl = getValues(urlVal);
            if (getUrl) {
                setShowAlert(true);
                const searchParams = new URLSearchParams(location.search);
                const param = searchParams.get('q');
                let campaignId = _get(locationState, 'campaignId', 0);
                let path = `/communication/create-communication?q=${param}`;

                // let urlStr = `${getUrl}/?_sdxId=${btoa(campaignId)}&path=${path}&type=${name}&webft=true`;

                const reqs = localStorage.getItem('accessToken') || '';
                const formName = '';
                const domain = window.location.host;
                const redurl = `${domain}/communication/create-communication`;
                const formId = 0;
                const paramsToEncrypt = `cevent|${reqs}|${formId}|${departmentId}|${formName}|${redurl}`;
                const encryptedParams = 'rfg' + btoa(paramsToEncrypt) + 'rd';
                const cleanUrl = getUrl.replace(/\/$/, '');
                let urlStr = `${cleanUrl}?_sdxFormId=${btoa(campaignId.toString())}&_sdxId=${btoa(campaignId)}&sdk_mode=${encryptedParams}&path=${encodeURIComponent(path)}&type=${name}&webft=true&bofadd=true`;

                localStorage.setItem('fdomain', urlStr);
                window.open(urlStr, '_blank')
            }
        }
    };
    switch (type) {
        case 'URL':
            return (
                <Fragment>
                    {!isAppAnalytics && (
                        <div className="form-group">
                            <Row>
                                <>
                                    {fields?.map((item, idx) => {

                                        return (
                                            <Fragment key={item?.id ?? `${name}-url-${idx}`}>
                                                {idx === 0 ? (
                                                    <Col sm={{ offset: 1, span: 2 }}>
                                                        <label className="control-label-left">{`${name === 'engagement' ? "Landing page" : "Thank you page"} ${URL}`}</label>
                                                    </Col>
                                                ) : (
                                                    <Col sm={{ offset: 1, span: 2 }}>
                                                        <label className="control-label-left"></label>
                                                    </Col>
                                                )}
                                                <Col sm={6} className={`${idx !== 0 ? 'mt30' : ''}`}>
                                                    <RSInput
                                                        control={control}
                                                        name={`${name}Pages.${idx}.url`}
                                                        required
                                                        placeholder={URL}
                                                        // defaultValue={pagesList?.[idx]?.url}
                                                        maxLength={MAXL_LENGTH2048}
                                                        rules={{
                                                            required: ENTER_AN_URL,
                                                            pattern: {
                                                                value: WEB_URL_REGEX,
                                                                message: ENTER_VALID_WEBSITE,
                                                            },
                                                            validate: (data) => {
                                                                let temp = pages?.map((item) => item?.url);
                                                                // console.log('temp ::: ', temp, temp?.length);
                                                                if (temp?.length > 1) {
                                                                    let duplicate = temp?.filter(
                                                                        (item, idx, arr) => arr.indexOf(item) !== idx,
                                                                    );
                                                                    // console.log('check :::: ', duplicate);
                                                                    if (duplicate?.length === 0) return true;
                                                                    else return 'No repeated values';
                                                                }

                                                                // let urls = temp?.splice(temp?.length - 2, 1);
                                                                // ?.map((item) => item?.url);

                                                                // console.log(
                                                                //     urls,
                                                                //     // urls.includes(data),
                                                                //     ' ::: asdsadasd ',
                                                                //     data,
                                                                //     urls,
                                                                //     temp,
                                                                // );
                                                                // if (urls?.includes(data) && urls?.length !== 1) {
                                                                //     return 'No repeated values';
                                                                // } else return true;
                                                                return true;
                                                            },
                                                        }}
                                                    />
                                                </Col>
                                                <Col sm={1} className="fg-icons d-flex pl0">
                                                    {idx === 0 ? (
                                                        <div className="d-flex justify-content-center pt10">
                                                            <RSTooltip
                                                                text={EVENT_TRACKING}
                                                                className={`${!isAppAnalytics && webFieldTrackEventList && Object.keys(webFieldTrackEventList)?.length && webFieldTrackEventList[name]?.length
                                                                    ? 'click-off'
                                                                    : ''
                                                                    }`}
                                                            >
                                                                <i
                                                                    className={`${event_tracking_medium
                                                                        } icon-md color-primary-blue ${getValues(`${name}Pages.${idx}.url`) &&
                                                                        WEB_URL_REGEX.test(pages[0]?.url)
                                                                            ? ''
                                                                            : 'click-off'
                                                                        } ${pages?.length > 1 ? 'click-off' : ''}`}
                                                                    onClick={() => {
                                                                        setPendingUrlVal(`${name}Pages.${idx}.url`);
                                                                        setShowTrackingAgreement(true);
                                                                    }}
                                                                />
                                                            </RSTooltip>
                                                            {!isAppAnalytics && webFieldTrackEventList && Object.keys(webFieldTrackEventList)?.length && webFieldTrackEventList[name]?.length ? (
                                                                <RSTooltip text={EDIT}>
                                                                    <i
                                                                        className={`${pencil_edit_medium} icon-md color-primary-blue`}
                                                                        onClick={() => {
                                                                            if (handleEditEvent) {
                                                                                handleEditEvent('P', name);
                                                                            } else {
                                                                                setShowWFTM(true);
                                                                            }
                                                                        }}
                                                                    />
                                                                </RSTooltip>
                                                            ) : null}
                                                            {!isAppAnalytics && webFieldTrackEventList && webFieldTrackEventList[name]?.length && !savedChannel ? (
                                                                <RSTooltip text={RESET}>
                                                                    <i
                                                                        className={`${restart_medium} icon-md color-primary-blue`}
                                                                        onClick={() => {
                                                                            localStorage.removeItem('__webFieldTrackEventData')
                                                                        }}
                                                                    />
                                                                </RSTooltip>
                                                            ) : null}
                                                            <RSTooltip text={ADD_URL}>
                                                                <i
                                                                    id="rs_data_circle_plus_fill"
                                                                    className={`${circle_plus_fill_medium
                                                                        } icon-md color-primary-blue ${pages?.length > 4 ? 'click-off' : ''
                                                                        }`}
                                                                    onClick={() => addUrl(idx)}
                                                                />
                                                            </RSTooltip>
                                                        </div>
                                                    ) : (
                                                        <RSTooltip text={REMOVE_URL} className="mt30">
                                                            <i
                                                                className={`${circle_minus_fill_medium} icon-md color-primary-red`}
                                                                onClick={() => remove(idx)}
                                                            />
                                                        </RSTooltip>
                                                    )}
                                                </Col>

                                                <RSAlert
                                                    show={isShowAlert}
                                                    header={false}
                                                    containerClass='py15'
                                                    body={
                                                        <>
                                                            <Container>
                                                                <div className="d-flex align-items-center justify-content-center">
                                                                    <div>
                                                                        <img
                                                                            src={Timer}
                                                                            alt="scriptBlock"
                                                                            width={80}
                                                                            height={80}
                                                                        />
                                                                    </div>
                                                                    <div className="ml10">
                                                                        <h3 className='white'>{WAITING_FOR_EVENT_SET}</h3>
                                                                    </div>
                                                                    <div className="ml30">
                                                                        <RSPrimaryButton
                                                                            id=""
                                                                            onClick={() => {
                                                                                setShowAlert(false);
                                                                                let data = JSON.parse(
                                                                                    localStorage.__webFieldTrackEventData,
                                                                                );
                                                                                updateWebFieldTrackEventData(data);
                                                                            }}
                                                                        >
                                                                            {content.proceed}
                                                                        </RSPrimaryButton>
                                                                    </div>
                                                                </div>
                                                            </Container>
                                                        </>
                                                    }
                                                />

                                            </Fragment>
                                        );
                                    })}
                                </>
                            </Row>
                        </div>
                    )}
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
                                        if (pendingUrlVal) {
                                            handleWebFieldTrackRedirect(pendingUrlVal);
                                        }
                                    }}
                                >
                                    I Agree
                                </RSPrimaryButton>
                            </>
                        }
                    />
                </Fragment>
            );
        case 'Forms':
            return (
                <Fragment>
                    <div className="form-group">
                        <Row>
                            <Col sm={{ offset: 1, span: 2 }}>
                                <label className="control-label-left">Subscription form</label>
                            </Col>
                            <Col sm={6}>
                                <RSKendoDropDownList
                                    control={control}
                                    name={`${name}SubscriptionForm`}
                                    label={'Subscription form'}
                                    rules={{
                                        required: SELECT_SUBSCRPTION_FORM,
                                    }}
                                    required
                                    isLoading={subscriptionFormLoading}
                                    textField={'formName'}
                                    dataItemKey={'formId'}
                                    data={WebAnalytics?.webAnalyticsFormList}
                                    handleChange={(e) => {
                                        // getFormValues(e?.value);
                                    }}
                                />
                            </Col>
                        </Row>
                    </div>
                    <div className="form-group">
                        <Row>
                            <Col sm={{ offset: 1, span: 2 }}>
                                <label className="control-label-left">Action</label>
                            </Col>
                            <Col sm={6}>
                                <RSKendoDropDownList
                                    control={control}
                                    name={`${name}Action`}
                                    label={'Select action'}
                                    rules={{
                                        required: 'Select action',
                                    }}
                                    required
                                    data={['Submitted', 'Not submitted', 'Partially submitted']}
                                    handleChange={(e) => {
                                        setCustomValues([...customValues, e?.value]);
                                    }}
                                />
                            </Col>
                        </Row>
                    </div>
                </Fragment>
            );
        case 'Offline':
            return <></>;
        case 'Custom events':
            return (
                <Fragment>
                    <div className="form-group">
                        <Row>
                            <Col sm={{ offset: 1, span: 2 }}>
                                <label className="control-label-left">Custom events</label>
                            </Col>
                            <Col sm={6}>
                                <RSMultiSelect
                                    control={control}
                                    name={`${name}CustomEvents`}
                                    label={'Select | Enter custom events'}
                                    allowCustom
                                    isLoading={customEventsLoader.isLoading}
                                    // rules={{
                                    //     required: 'Select | Enter custom events',
                                    // }}
                                    // required
                                    data={customEventsData}
                                    handleOnBlur={(e) => {

                                        setCustomValues([...customValues, ...e?.value]);
                                    }}
                                />
                            </Col>
                        </Row>
                    </div>
                    {/* {name === 'conversion' && (
                        <div className="form-group">
                            <Row>
                                <Col sm={{ offset: 1, span: 2 }}>
                                    <label className="control-label-left">Custom value</label>
                                </Col>
                                <Col sm={3} className="position-relative">
                                    {manualType ? (
                                        <Fragment>
                                            <RSInput
                                                control={control}
                                                name={`${name}ManualValue`}
                                                required
                                                label={'Enter custom value'}
                                                rules={{
                                                    required: 'Enter custom value',
                                                }}
                                            />
                                            <i
                                                className={`${close_mini} icon-sm color-primary-red position-absolute right16 top3 z-2`}
                                                onClick={() => {
                                                    setValue(`${name}ManualType`, false);
                                                    setValue(`${name}CustomEventsValue`, []);
                                                    unregister(`${name}ManualValue`);
                                                }}
                                            />
                                        </Fragment>
                                    ) : (
                                        <RSKendoDropDownList
                                            control={control}
                                            name={`${name}CustomEventsValue`}
                                            label={'Select custom events'}
                                            allowCustom
                                            rules={{
                                                required: 'Select custom values',
                                            }}
                                            required
                                            data={
                                                formValues?.length !== 0
                                                    ? [...customEvents, ...formValues, 'Enter value manually']
                                                    : [...customEvents, 'Enter value manually']
                                            }
                                            handleChange={(e) => {
                                                if (e?.value === 'Enter value manually') {
                                                    setValue(`${name}ManualType`, true);
                                                    setValue(`${name}CustomValueType`, 'manualValue');
                                                } else if (formValues.includes(e?.value)) {
                                                    setValue(`${name}CustomValueType`, 'Form');
                                                } else {
                                                    setValue(`${name}CustomValueType`, 'customevent');
                                                }
                                            }}
                                        />
                                    )}
                                </Col>
                                <Col sm={3}>
                                    <RSKendoDropDownList
                                        control={control}
                                        name={`${name}Pricing`}
                                        label={'Select pricing'}
                                        rules={{
                                            required: 'Select pricing',
                                        }}
                                        required
                                        data={currencyMasterList}
                                        dataItemKey={'currencyID'}
                                        textField={'currencyName'}
                                    />
                                </Col>
                            </Row>
                        </div>
                    )} */}
                </Fragment>
            );
    }
};

export default RenderInput;
