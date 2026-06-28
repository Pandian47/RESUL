import { checkTrigger, statusIdCheck } from 'Utils/modules/campaignUtils';
import { getmasterData } from 'Utils/modules/masterData';
import { getChannelId } from 'Utils/modules/communicationChannels';
import { encodeUrl } from 'Utils/modules/crypto';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { buildPayload, DOMAIN_HOVER_TEXT, FORM_INITIAL_STATE, getInputType, goalContentFields } from './constant';
import { WEBSITE_REGEX } from 'Constants/GlobalConstant/Regex';
import { DUPLICATE_VALUE, ENTER_CONVERSION_URL, ENTER_VALID_CONVERSION_URL, SELECT_ANALYTICS_PLATFORM, SELECT_CONVERSION_CATEGORY, SELECT_DOMAIN, SELECT_SUBSCRPTION_FORM } from 'Constants/GlobalConstant/ValidationMessage';
import { ANALYTIC_PLATFORM, CANCEL, CONVERSION, DOMAIN, ENGAGEMENT, GOAL, IGNORE_WEB_ANALYTICS, NEXT, OK, SAVE } from 'Constants/GlobalConstant/Placeholders';
import { circle_plus_fill_medium, circle_question_mark_mini } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, createContext, useEffect, useState } from 'react';
import _get from 'lodash/get';

import _map from 'lodash/map';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FormProvider, useForm, useFieldArray, useWatch } from 'react-hook-form';

import RSPPophover from 'Components/RSPPophover';
import SmartLinkEnable from '../../../Component/SmartLinkEnable/SmartLinkEnable';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import usePermission from 'Hooks/usePersmission';
import {
    updateTab,
    resetCreateCommunication,
    updateDirtyState,
} from 'Reducers/communication/createCommunication/create/reducer';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { getSessionId } from 'Reducers/globalState/selector';
import { getGeneratedLink } from 'Reducers/communication/createCommunication/smartlink/selectors';
import { getSmartUrl } from 'Reducers/communication/createCommunication/smartlink/request';
import { getWebAnalyticsList, saveWebAnalyticsChannel, getWebAnalyticsFormList, getWebAnalyticsData, saveWebAnalyticsCaptureFields, getAnalyticsCaptureData } from 'Reducers/communication/createCommunication/Create/request';
import { getConversionCategory } from 'Reducers/communication/createCommunication/Mdc/Canvas/request';
import { updateSmartLinkShow } from 'Reducers/communication/createCommunication/execute/reducer';

import useQueryParams from 'Hooks/useQueryParams';
import useApiLoader from 'Hooks/useApiLoader';
import AuthoringChannelEditSkeletonGate, {
    AUTHORING_EDIT_API_LOADER_CONFIG,
    getAuthoringSaveButtonType,
    useAuthoringChannelEditLoader,
    useAuthoringChannelSaveLoader,
} from 'Components/Skeleton/pages/communication/authoring';
import { availableTabs, getPreCampaignStatus } from '../../../constant';
import RSConfirmationModal from 'Components/ConfirmationModal';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import { getConversionTypeList } from 'Reducers/communication/createCommunication/plan/request';
import RSTabber from 'Components/RSTabber';
import GoalContent from './Component/GoalContent/GoalContent';
import { getTriggerBaseDDLData } from 'Reducers/audience/dynamicList/request';
import { get_formCSV_FormFields } from 'Reducers/preferences/FormGenerator/request';
import WebFieldTrack from '../../../Component/WebFieldTrackModal';
import { showTabsSmartlink } from 'Reducers/communication/createCommunication/smartlink/reducer';
import { AUTHORING_FIELD_LOADER_CONFIG } from 'Components/Skeleton/pages/communication/authoring';
export const webAnalyticsContext = createContext({
    setShowWFTM: () => {},
    handleEditEvent: () => {},
    waMode: 'create',
    formListLoader: null,
    goalTypeLoader: null,
});
const WebAnalytics = () => {
    const navigate = useNavigate();
    const state = useQueryParams('/communication');
    const { permissions } = usePermission();
    const { addAccess } = permissions || {};
    // const { primarygoal, secondaryGoal } = useSelector(({ communicationPlanReducer }) => communicationPlanReducer);
    const {
        tabsState: { analytics: tabAnalyticsState },
        activeTabs,
        isDirty,
        WebAnalytics,
        analytics,
        isSmartLinkCreated,
    } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const { notification } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const { smartLink1, smartLink2 } = useSelector((state) => getGeneratedLink(state));
    const { tabSmartLink_Flag } = useSelector(({ smartLinkReducer }) => smartLinkReducer);
    const { savedChannelsId } = useSelector(({ communicationPlanReducer }) => communicationPlanReducer);
    const { showEditSkeleton, isSavedChannel, runEditFetch, finishEditSkeleton } = useAuthoringChannelEditLoader({
        channelId: 6,
        subChannelId: 6,
    });
    const { runSave, isSaveLoading, isNextLoading, isSendLoading, isSubmitting } = useAuthoringChannelSaveLoader();
    const savedChannel = isSavedChannel;
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);

    const methods = useForm(FORM_INITIAL_STATE);
    const {
        control,
        watch,
        handleSubmit,
        setValue,
        trigger,
        reset,
        getValues,
        getFieldState,
        clearErrors,
        formState: { errors, dirtyFields, isValid, isDirty: formIsDirty },
    } = methods;
    const dispatch = useDispatch();
    const { currencyMasterList } = getmasterData();
    const dirty = { ...dirtyFields };
    const waMode = (state?.campaignId ?? 0) > 0 ? 'edit' : 'create';
    const analyticsListLoader = useApiLoader({
        autoFetch: false,
        mode: waMode,
        loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
    });
    const domainLoader = useApiLoader({
        autoFetch: false,
        mode: waMode,
        loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
    });
    const goalTypeLoader = useApiLoader({
        autoFetch: false,
        mode: waMode,
        loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
    });
    const formListLoader = useApiLoader({
        autoFetch: false,
        mode: waMode,
        loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
    });
    const [goalDefault, setGoalDefault] = useState({
        isEngagement: false,
        isConverison: false,
    });
    let tempCurrentyData = currencyMasterList?.map((e) => e.currencyName + ' (' + e.currencyFormat + ')');

    const currencyObjects = tempCurrentyData?.map((currency, index) => {
        return {
            id: index + 1,
            currency: currency,
        };
    });
    const [isSmartLink, setIsSmartLink] = useState(false);
    const [navigate_confirm, setNavigate_confirm] = useState(false);
    const [conversionData, setConversionData] = useState([]);
    const [contentTypes, setContentTypes] = useState({
        engagement: [],
        conversion: [],
    });
    const [defaultTab, setDefaultTab] = useState(0);
    const [isShowWFTM, setShowWFTM] = useState(false);
    const [isWAFail, setIsWAFail] = useState(false);
    const [webFieldTrackEditData, setWebFieldTrackEditData] = useState(() => {
        const webFieldTrackEvent = localStorage.getItem('__webFieldTrackEventData');
        const fieldData = webFieldTrackEvent ? JSON.parse(webFieldTrackEvent) : {};
        return {
            engagement: fieldData?.engagement,
            conversion: fieldData?.conversion,
        };
    });
    const [
        analyticsPlatform,
        conversionCategory,
        goalEngagement,
        goalConversion,
        engagementCategory,
        domain,
        isEdit,
        conversionPages,
        engagementPages,
        goalDefaultTab,
    ] = watch([
        'analyticsPlatform',
        'conversionCategory',
        'goalEngagement',
        'goalConversion',
        'engagementCategory',
        'domain',
        'isEdit',
        'conversionPages',
        'engagementPages',
        'goalDefaultTab',
    ]);
    const [alert_flag, setAlert_flag] = useState(false);
    const [goal, setGoal] = useState({
        E: [],
        C: [],
    });
    const [domains, setDomains] = useState([]);
    const isEngagement = state?.primaryGoal === 'Engagement' || state?.secondaryGoal === 'Engagement';
    const isConverison = state?.primaryGoal === 'Conversion' || state?.secondaryGoal === 'Conversion';
    const webFieldTrackEvent = localStorage.getItem('__webFieldTrackEventData');
    const parseWebFieldTrackEvent = webFieldTrackEvent ? JSON.parse(webFieldTrackEvent) : {};

    useEffect(() => {
        if (!isDirty && Object.keys(dirtyFields)?.length > 0) {
            dispatch(updateDirtyState(true));
        } else if (isDirty && Object.keys(dirtyFields)?.length === 0) {
            dispatch(updateDirtyState(false));
        }
    }, [JSON.stringify(dirtyFields)]);

    useEffect(() => {
        async function getSmartLink() {
            const payload = { clientId, departmentId, userId, campaignId: _get(state, 'campaignId', 0) };
            const res = await dispatch(getSmartUrl({ payload, reduceLoad: true }));
            if (!res?.status) {
                setIsSmartLink(true);
                dispatch(updateSmartLinkShow(false));
            } else {
                setIsSmartLink(false);
                dispatch(updateSmartLinkShow(true));
            }
        }
        if (!smartLink1) {
            // if (state && _get(state, 'campaignId', 0) > 0) {
            //     //getSmartLink();
            //     dispatch(showTabsSmartlink(false));
            // }
        }
    }, [state]);
    const getWADomainList = async (loaderConfig = AUTHORING_FIELD_LOADER_CONFIG) => {
        const cachedList = WebAnalytics?.webAnalyticsList;
        if (!Array.isArray(cachedList) || cachedList.length === 0) {
            const payload = { clientId, departmentId, userId, analyticsType: 'WA' };
            const res = await analyticsListLoader.refetch({
                fetcher: async () => dispatch(getWebAnalyticsList({ payload, loading: false })),
                loaderConfig,
            });
            if (res?.status && Array.isArray(res?.data)) {
                return res.data;
            }
            return [];
        }
        return cachedList;
    };

    useEffect(() => {
        if (!savedChannel) {
            getWADomainList();
        }
        // fetchConversionCategory();
        // debugger;

        if (
            !isEdit &&
            notification?.web?.webPushDomain?.webNotifySettingId &&
            notification?.web?.webPushDomain?.domainUrl
        ) {
            let domain = {
                id: notification?.web?.webPushDomain?.webNotifySettingId || '',
                value: notification?.web?.webPushDomain?.domainUrl || '',
            };
            setValue('domain', domain);
        }
    }, []);
    // useEffect(() => {
    //     fetchConversionCategory();
    // }, [state]);

    useEffect(() => {
        let params = new URLSearchParams(document.location.search);
        if (params?.get('webft')) setShowWFTM(true);

        // return () => {
        //     localStorage.removeItem('__webFieldTrackEventData');
        // };
    }, []);
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
            setValue(`conversionFormValues`, temp);
            return temp;
        }
    };
    const [statusIDCheck, setstatusIDCheck] = useState(state?.statusId || null);
    useEffect(() => {
        async function getWAContent() {
            const payload = { clientId, departmentId, userId, campaignId: state?.campaignId };
            const nestedLoaderConfig = savedChannel
                ? AUTHORING_EDIT_API_LOADER_CONFIG
                : AUTHORING_FIELD_LOADER_CONFIG;
            try {
            const response = savedChannel
                ? await runEditFetch(
                      () => dispatch(getWebAnalyticsData({ payload, loading: false })),
                      { releaseAfterFetch: false },
                  )
                : await dispatch(getWebAnalyticsData({ payload, loading: false }));
            const { status, data } = response || {};
            if (status) {
                // debugger;

                const { webAnalyticsCampaign } = data;

                let engagementFieldTrackData = null;
                let conversionFieldTrackData = null;

                const engagementFieldTrackInfo = webAnalyticsCampaign?.engagement?.data?.[0]?.urls?.[0]?.fieldTrackInfo;
                if (engagementFieldTrackInfo && engagementFieldTrackInfo.trim() !== '') {
                    try {
                        engagementFieldTrackData = JSON.parse(engagementFieldTrackInfo);
                    } catch (e) {
                    }
                }

                const conversionFieldTrackInfo = webAnalyticsCampaign?.conversion?.data?.[0]?.urls?.[0]?.fieldTrackInfo;
                if (conversionFieldTrackInfo && conversionFieldTrackInfo.trim() !== '') {
                    try {
                        conversionFieldTrackData = JSON.parse(conversionFieldTrackInfo);
                    } catch (e) {
                    }
                }

                const webFieldTrackData = {
                    engagement: engagementFieldTrackData || parseWebFieldTrackEvent?.engagement || {},
                    conversion: conversionFieldTrackData || parseWebFieldTrackEvent?.conversion || {},
                };

                localStorage.setItem('__webFieldTrackEventData', JSON.stringify(webFieldTrackData));
                setWebFieldTrackEditData(webFieldTrackData);
                setstatusIDCheck(state?.statusId);
                let domainData = await getDomainListData(webAnalyticsCampaign?.domainType, nestedLoaderConfig);
                const ress = getInputType(
                    webAnalyticsCampaign?.conversion?.conversionTypes?.map(
                        (item) => item?.ConversionName || item?.conversionName,
                    ),
                );
                let formList = { status: false, data: [] };
                if (ress?.includes('Forms')) {
                    formList = await formListLoader.refetch({
                        fetcher: async () =>
                            dispatch(
                                getWebAnalyticsFormList({
                                    payload: { clientId, departmentId, userId },
                                    loading: false,
                                }),
                            ),
                        loaderConfig: nestedLoaderConfig,
                    });
                }
                let domainsList = await getWADomainList(nestedLoaderConfig);
                let tempDomainType = domainsList?.filter(
                    (item) => item?.domainType === webAnalyticsCampaign?.domainType,
                );
                let tempDomain = domainData?.filter(
                    (action) => webAnalyticsCampaign?.domainUrlList?.[0]?.domainNameURL === action?.value,
                );

                let tempGoalEngagementList =
                    webAnalyticsCampaign?.engagement?.engagementTypes?.length > 0
                        ? await getGoalType('E', nestedLoaderConfig)
                        : [];

                let tempGoalConversionList =
                    webAnalyticsCampaign?.conversion?.conversionTypes?.length > 0
                        ? await getGoalType('C', nestedLoaderConfig)
                        : [];
                let tempEngagementTypes = webAnalyticsCampaign?.engagement?.engagementTypes?.map((item) => {
                    let temp = tempGoalEngagementList?.filter(
                        (list) => parseInt(list?.ConversionTypeID, 10) === parseInt(item?.engagementTypeId, 10),
                    )?.[0];
                    tempGoalEngagementList?.filter(
                        (tempList) =>
                            Number(tempList.ConversionTypeID) ===
                            Number(webAnalyticsCampaign?.conversion?.conversionTypes[0]?.conversiontypeId),
                    );
                    return temp;
                });
                let tempGoalEngagement = tempGoalEngagementList?.length !== 0;
                let tempGoalConversion = tempGoalConversionList?.length !== 0;
                setGoalDefault({
                    isEngagement: tempGoalEngagement,
                    isConverison: tempGoalConversion,
                });
                let tempContent = getInputType(tempEngagementTypes?.map((item) => item?.ConversionName));
                setContentTypes((prev) => ({
                    ...prev,
                    engagement: tempContent,
                }));

                // let tempConversionTypes = webAnalyticsCampaign?.conversion?.conversionTypes?.map((item) => {
                //     let temp = tempGoalConversionList?.filter(
                //         (list) => list?.ConversionTypeID === item?.conversiontypeId,
                //     )?.[0];
                //     return temp;
                // });
                let tempConversionTypes = tempGoalConversionList?.filter((tempList) =>
                    webAnalyticsCampaign?.conversion?.conversionTypes
                        ?.map((item) => Number(item.conversionTypeId))
                        .includes(Number(tempList.ConversionTypeID)),
                );

                let tempContentConversion = getInputType(
                    tempConversionTypes?.map((item) => item?.ConversionName),
                );
                setContentTypes((prev) => ({
                    ...prev,
                    conversion: tempContentConversion,
                }));
                let tempEngagementCustomEvents = [];
                let tempEngagementForm = '';
                let tempEngagementFormAction = '';
                let tempEngagementPages = [];
                let tempEngagementData =
                    webAnalyticsCampaign?.engagement?.data?.length !== 0
                        ? webAnalyticsCampaign?.engagement?.data?.map((item) => {
                              if (item?.type === 'CustomEvent') {
                                  // Avoid [''] when EventName is empty
                                  tempEngagementCustomEvents = (item?.EventName || '')
                                      .split(',')
                                      .map((v) => v.trim())
                                      .filter(Boolean);
                              } else if (item?.type === 'form') {
                                  tempEngagementForm = formList?.status
                                      ? formList?.data?.filter((form) => form?.formId === item?.formId)
                                      : '';
                                  tempEngagementFormAction = item?.actionName;
                              } else {
                                  tempEngagementPages = item?.urls?.map((url) => ({ url: url?.pageurl }));
                              }
                          })
                        : [];
                let tempConversionCustomEvents = [];
                let tempConversionForm = '';
                let tempConversionFormAction = '';
                let tempConversionPages = [];
                let tempConversionData =
                    webAnalyticsCampaign?.conversion?.data?.length !== 0
                        ? webAnalyticsCampaign?.conversion?.data?.map((item) => {
                              if (item?.type === 'CustomEvent') {
                                  // Avoid [''] when EventName is empty
                                  tempConversionCustomEvents = (item?.EventName || '')
                                      .split(',')
                                      .map((v) => v.trim())
                                      .filter(Boolean);
                              } else if (item?.type === 'form') {
                                  tempConversionForm = formList?.status
                                      ? formList?.data?.filter((form) => form?.formId === item?.formId)
                                      : '';
                                  tempConversionFormAction = item?.actionName;
                              } else {
                                  tempConversionPages = item?.urls?.map((url) => ({ url: url?.pageurl }));
                              }
                          })
                        : [];
                let formValues = tempConversionForm?.length !== 0 ? await getFormValues(tempConversionForm?.[0]) : [];

                let tempConversionCustomValues = webAnalyticsCampaign?.conversion?.conversionValue?.attributeName;
                // let tempConversionPricing = !!webAnalyticsCampaign?.conversion?.conversionValue?.currency
                //     ? currencyMasterList?.filter(
                //           (item) =>
                //               item?.currencyFormat + item?.currenySymbol ===
                //               webAnalyticsCampaign?.conversion?.conversionValue?.currency,
                //       )?.[0]
                //     : '';
                let tempConversionPricing = !!webAnalyticsCampaign?.conversion?.conversionValue?.currency
                    ? currencyMasterList?.filter(
                          (item) => item.currencyID === webAnalyticsCampaign?.conversion?.conversionValue?.currency,
                      )?.[0]
                    : '';
                let tempConversionManualValue = !!webAnalyticsCampaign?.conversion?.conversionValue?.manualValue
                    ? webAnalyticsCampaign?.conversion?.conversionValue?.manualValue
                    : '';
                let tempConversionValueType = webAnalyticsCampaign?.conversion?.conversionValue?.type;
                let tempConversionCustomEventsValue = '';
                if (tempConversionValueType === 'Form') {
                    // let formValues = await getFormValues(tempConversionForm?.[0]);
                    tempConversionCustomEventsValue = formValues?.filter((item) => item === tempConversionCustomValues);
                } else {
                    tempConversionCustomEventsValue = tempConversionCustomValues;
                }
                // let tempDomainName = domainData?.filter(
                //     (action) => webAnalyticsCampaign?.domainUrlList?.[0]?.analyticsSettingId === action?.domainNameURL,
                // );

                // let tempconversionData = conversionData?.filter(
                //     (action) => webAnalyticsCampaign?.conversionCategoryId === action?.conversionCategoryId,
                // );
                // let tempSubFormData = WebAnalytics?.webAnalyticsFormList?.filter(
                //     (action) => webAnalyticsCampaign?.subscriptionFormId === action?.formId,
                // );
                // let tempeventTrackingData = webAnalyticsCampaign?.conversionURL[0]?.primaryGoal.map((item) => {
                //     return {
                //         conversionUrl: item,
                //         isDelete: false,
                //     };
                // });
                // let tempeventSecGoalData = webAnalyticsCampaign?.conversionURL[0]?.secondaryGoal.map((item) => {
                //     return {
                //         conversionUrl: item,
                //         isDelete: false,
                //     };
                // });

                if (
                    tempDomain &&
                    tempDomainType
                    // tempDomainName &&
                    // tempconversionData &&
                    // tempSubFormData &&
                    // tempeventTrackingData &&
                    // tempeventSecGoalData
                ) {
                    // const temp = {};
                    // temp.analyticsPlatform = tempDomain[0];
                    // temp.domain = tempDomainName[0];
                    // temp.conversionCategory = tempconversionData[0];
                    // temp.subscriptionForm = tempSubFormData[0];
                    // temp.eventTracking = tempeventTrackingData;
                    // temp.eventSecGoal = tempeventSecGoalData;

                    // console.log(temp, '::temp');
                    let editForm = {
                        isEdit: true,
                        analyticsPlatform: tempDomainType?.[0],
                        domain: tempDomain?.[0],
                        goalEngagement: tempGoalEngagement,
                        goalConversion: tempGoalConversion,
                        engagementType: tempEngagementTypes,
                        conversionType: tempConversionTypes,
                        conversionCategory: '',
                        engagementSubscriptionForm: tempEngagementForm?.[0] || '',
                        engagementAction: tempEngagementFormAction || '',
                        engagementCustomEvents: tempEngagementCustomEvents || [],
                        engagementCategory: '',
                        conversionSubscriptionForm: tempConversionForm?.[0] || '',
                        conversionAction: tempConversionFormAction || '',
                        engagementPages: tempEngagementPages?.length === 0 ? [{ url: '' }] : tempEngagementPages,
                        conversionPages: tempConversionPages?.length === 0 ? [{ url: '' }] : tempConversionPages,
                        conversionPricing: tempConversionPricing,
                        conversionCustomEventsValue: tempConversionCustomEventsValue,
                        conversionManualType: !!tempConversionManualValue,
                        conversionManualValue: tempConversionManualValue,
                        conversionCustomEvents: tempConversionCustomEvents || [],
                        engagementUrl: [],
                        eventTracking: [{ eventname: '', trackingType: '', inputType: '', description: '' }],
                        eventSecGoal: [{ conversionUrl: '', isDelete: false }],
                    };
                    
                    reset((formState) => ({ ...formState, ...editForm }));
                    // webFieldTrackEditData is already set above with processed data from webAnalyticsCampaign
                }
            }
            } finally {
                if (savedChannel) {
                    finishEditSkeleton();
                }
            }
        }
        let savedChannelInLS = localStorage.getItem('savedChannel');
        let parseSavedChannelInLs = JSON.parse(savedChannelInLS);
        const checkStatusSavedChannelInLS = parseSavedChannelInLs?.[6]?.includes(6) ? true : false;
        if (!!state?.campaignId && (savedChannel || checkStatusSavedChannelInLS) && !isShowWFTM) getWAContent();
        // return ()=>{
        //     localStorage.removeItem('savedChannel')
        // }
    }, [state, isShowWFTM]);

    useEffect(() => {
        if (isEngagement) {
            getGoalType('E');
            setValue('goalEngagement', true);
            setGoalDefault((prev) => ({
                ...prev,
                isEngagement: true,
            }));
        }
        if (isConverison) {
            getGoalType('C');
            setValue('goalConversion', true);
            setGoalDefault((prev) => ({
                ...prev,
                isConverison: true,
            }));
        }
    }, [isEngagement, isConverison]);

    const fetchConversionCategory = async (e) => {
        if (!!state?.campaignId) {
            const payload = {
                clientId,
                departmentId,
                userId,
                conversionTypeId: 1, // - Static 1, webex/gotometting/webinar-2,  Dynamic: conversionCategory?.conversionCategoryId,
                campaignId: state?.campaignId,
            };
            const { status, data } = await dispatch(getConversionCategory({ payload }));
            if (status) {
                setConversionData(category);
                const payload = { clientId, departmentId, userId };
                if (
                    WebAnalytics?.webAnalyticsFormList?.length === 0 ||
                    WebAnalytics?.webAnalyticsFormList === undefined
                )
                    formListLoader.refetch({
                        fetcher: async () => dispatch(getWebAnalyticsFormList({ payload, loading: false })),
                    });
            }
        }
    };
    const getDomainListData = async (e, loaderConfig = AUTHORING_FIELD_LOADER_CONFIG) => {
        // debugger;
        // if (WebAnalytics?.webAnalyticsDomainList?.length === 0 || WebAnalytics?.webAnalyticsDomainList === undefined) {
        // const payload = { clientId, departmentId, userId, domainType: e };
        const payload = { clientId, departmentId, userId, triggerSourceId: 1 };
        // debugger;
        const res = await domainLoader.refetch({
            fetcher: async () => dispatch(getTriggerBaseDDLData({ payload, loading: false })),
            loaderConfig,
        });
        const data = res?.status ? res?.data : [];
        setDomains(data);
        return data;

        // } else {
        //return WebAnalytics?.webAnalyticsDomainList;
        // }
    };
    const handleNavigation = () => {
        let { analyticsTypes = [] } = state;
        let tempTabsIndex = [];
        const tabIndex = tabAnalyticsState?.currentTab + 1;
        const tempTabs = _map(analyticsTypes, (id) => {
            const { label } = getChannelId(id === 1001 ? 'offline conversion' : id);
            const normalizedLabel = label.toLowerCase();
            if (normalizedLabel === 'app analytics') return 'app';
            if (normalizedLabel === 'webinar') return 'events';
            return normalizedLabel;
        });
        if (state?.offlineConversion && !tempTabs.includes('offlineconversion')) {
            tempTabs.push('offlineconversion');
        }
        const tempTabsName = _map(availableTabs['analytics'], (index, value) => {
            if (tempTabs.includes(index?.toLowerCase())) {
                tempTabsIndex.push(value);
            }
        });
        localStorage.removeItem('__webFieldTrackEventData');
        localStorage.removeItem('savedChannel');
        if (tempTabs?.length === tempTabs.findIndex((id) => tabAnalyticsState.tabName == id) + 1) {
                        const status = getPreCampaignStatus(savedChannelsId);
            if (status) {
                navigate('/communication', {
                    replace: true,
                    state: {
                        index: 0,
                    },
                });
            } else {
                let url = '/communication/execute';
                const encryptState = encodeUrl(state);
                dispatch(resetCreateCommunication());
                navigate(`${url}?q=${encryptState}`, {
                    state,
                });
            }
        } else {
            dispatch(
                updateTab({
                    field: 'analytics',
                    // data: {
                    //     tabName: tempTabs[tabIndex], // availableTabs['analytics'][tabIndex],
                    //     currentTab: tempTabsIndex[tabIndex],
                    // },
                    data: {
                        tabName: tempTabs[tempTabs.findIndex((id) => tabAnalyticsState.tabName == id) + 1], //tempTabs[tabIndex], //availableTabs['analytics'][tabIndex],
                        currentTab: tempTabsIndex[tempTabs.findIndex((id) => tabAnalyticsState.tabName == id) + 1], // tempTabsIndex[tabIndex], // tabIndex,
                    },
                }),
            );
        }
    };
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'eventSecGoal',
    });
    const eventSecGoalWatch = useWatch({
        control,
        name: 'eventSecGoal',
    });
    const addeventSecGoal = (index) => {
        if (index === 0) {
            const WebSecAnalyticsSettingsState = getFieldState(`eventSecGoal`);
            let validationState = eventSecGoalWatch.findIndex((list) => {
                let values = Object.values(list);
                                // if (list.conversionUrl === '') {
                //     return true;
                // }
                if (WEBSITE_REGEX.test(list?.conversionUrl)) {
                    return false;
                } else {
                    return values.includes('');
                }
            });
            if (validationState === -1 && !WebSecAnalyticsSettingsState.invalid) {
                append({ conversionUrl: '', isDelete: false });
            } else {
                trigger(`eventSecGoal[${validationState}]`);
            }
        } else {
            let temp = eventSecGoalWatch[index];
            temp.isDelete = true;

            //setEventTrackingActions(temp.hasOwnProperty('lifeTimeCapUniqueId') && [...lifeTimeActions, temp]);

            remove(index);
        }
    };

    const getGoalType = async (type, loaderConfig = AUTHORING_FIELD_LOADER_CONFIG) => {
        const payload = {
            userId,
            clientId,
            departmentId,
            goal: type,
        };

        const res = await goalTypeLoader.refetch({
            fetcher: async () => dispatch(getConversionTypeList({ payload, loading: false })),
            loaderConfig,
        });
        if (res?.status) {
            setGoal((prev) => ({
                ...prev,
                [type]: res?.data,
            }));
            if (type === 'E') {
                setValue('engagementType', '');

                setValue('engagementSubscriptionForm', '');
                setValue('engagementCategory', '');

                setValue('engagementPages', [{ url: '' }]);
            } else {
                setValue('conversionType', '');
                setValue('conversionCategory', '');
                setValue('conversionSubscriptionForm', '');
                setValue('conversionPages', [{ url: '' }]);
            }
            return res?.data;
        }
    };
    const checkAllValues = (name) => {
        // debugger;
        let nameTypes = getValues(`${name}Type`);
        let customValues = getValues(`${name}CustomEvents`);
        let pages = getValues(`${name}Pages`);
        let form = getValues(`${name}SubscriptionForm`);
        let action = getValues(`${name}Action`);
        let conversionValue = getValues(`conversionCustomEventsValue`);
        let conversionPricing = getValues(`conversionPricing`);
        let manualValue = getValues(`${name}ManualValue`);
        let manualType = getValues(`${name}ManualType`);

        // Check if nameTypes is required and filled
        if (!nameTypes || nameTypes?.length === 0) return false;

        // Check content type specific validations
        const contentType = contentTypes[name];

        // Check URL type validation
        if (contentType?.includes('URL')) {
            if (!pages || pages?.length === 0 || pages?.map((item) => item?.url)?.includes('')) {
                return false;
            }
        }

        // Check Forms type validation
        if (contentType?.includes('Forms')) {
            if (!form || form === '' || !action || action === '') return false;
        }

        // Check conversion specific validations
        // if (name === 'conversion' && goalConversion) {
        //     if (conversionPricing === '') return false;
        //     if (manualType) {
        //         if (manualValue === '') return false;
        //     } else {
        //         if (conversionValue === '') return false;
        //     }
        // }

        return true;
    };
    const formSubmitHandler = async (data, type) => {
        // debugger;
        let checkResult = [];
        let checkGoals = '';

        if (goalEngagement) {
            checkResult.push(checkAllValues('engagement'));
            checkGoals = 'Engagement';
        }
        if (goalConversion) {
            checkResult.push(checkAllValues('conversion'));
            checkGoals = 'Conversion';
        }
        if (goalConversion && goalEngagement) checkGoals = 'Both';

        // Trigger validation for all fields before checking
        const validationResult = await trigger();

        if (
            validationResult &&
            isValid &&
            ((checkGoals === 'Both' && checkResult?.[0] && checkResult?.[1]) ||
                (checkGoals === 'Engagement' && checkResult?.[0]) ||
                (checkGoals === 'Conversion' && checkResult?.[0]) ||
                checkGoals === '')
        ) {
            // debugger;
            const payload = buildPayload(data, isEngagement, isConverison, state?.campaignId, userId);
            // localStorage.removeItem('__webFieldTrackEventData');
            // let tempConversionURL = eventTracking[0]?.conversionUrl;
            // let primaryGoal = eventTracking.map((a) => a.conversionUrl);
            // let secondaryGoal = eventSecGoal.map((a) => a.conversionUrl);
            // if (state.primaryGoal === 'Reach') {
            //     primaryGoal = [];
            // }
            // if (state?.secondaryGoal === 'Reach') {
            //     secondaryGoal = [];
            // }
            // const payload = {
            //     clientId,
            //     departmentId,
            //     userId,
            //     copy: false,
            //     webanalyticsCampaign: {
            //         domainUrlList: [
            //             {
            //                 analyticsSettingsId: domain?.analyticsSettingId,
            //                 domainNameURL: domain?.domainName,
            //             },
            //         ],
            //         campaignId: state?.campaignId,
            //         domainType: analyticsPlatform?.domainType,
            //         channelId: '6',
            //         subscriptionformId: subscriptionForm?.formId || 0,
            //         //  trackedKeywords: null,
            //         secondaryDomainUrlList: [],
            //         engagementCategoryId: engagementCategory?.engagementCategory || 1,
            //         conversionCategoryId: conversionCategory?.conversionCategoryId || 1,
            //         conversionurl: [
            //             {
            //                 primaryGoal: primaryGoal?.length > 0 ? primaryGoal : [],
            //                 secondaryGoal: secondaryGoal?.length > 0 ? secondaryGoal : [],
            //             },
            //         ],
            //     },
            // };
            const { status } = await runSave(getAuthoringSaveButtonType(type), () =>
                dispatch(
                    saveWebAnalyticsChannel({
                        payload: { ...payload, clientId, userId, departmentId, copy: false },
                        savedChannelsId,
                        loading: false,
                    }),
                ),
            );

            if (status) {
                if (type === 'save') {
                    dispatch(resetCreateCommunication());
                    navigate('/communication', {
                        index: 0,
                    });
                } else if (type === 'url') {
                    window.open(
                        tempConversionURL +
                            '/?_sdxFormId=123&path=' +
                            window.location.pathname +
                            window.location.search,
                    );
                    setAlert_flag(true);
                } else {
                    handleNavigation();
                }
            }
        } else {
            // Check which tab has validation errors and switch to it
            if (goalEngagement && goalConversion) {
                // Both tabs are enabled
                if (!checkResult?.[0]) {
                    // Engagement tab has issues, switch to it
                    setValue('goalDefaultTab', 0);
                } else if (!checkResult?.[1]) {
                    // Conversion tab has issues, switch to it
                    setValue('goalDefaultTab', 1);
                }
            } else if (goalEngagement && !checkResult?.[0]) {
                // Only engagement is enabled and has issues
                setValue('goalDefaultTab', 0);
            } else if (goalConversion && !checkResult?.[0]) {
                // Only conversion is enabled and has issues
                setValue('goalDefaultTab', 1);
            }

            setTimeout(() => {
                trigger();
            }, 500);
        }
    };
    // console.log('Eng ::: ', isEngagement, isConverison);

    const handleWebFieldTrackSubmit = async ({ data, events }) => {
        // console.log(data);
        // debugger
        const domainUrl = localStorage.getItem('fdomain');
        const urlParams = new URLSearchParams(domainUrl);
        const type = urlParams.get('type');

        const { elementArray, ...othereData } = data;

        const updateCurrentSavedData = {
            ...othereData,
            elementArray: events,
        };

        const previousLSEventTrackData = localStorage.getItem('__webFieldTrackEventData');
        const parsePreviousLSEventTrackData = JSON.parse(previousLSEventTrackData);

        let finalUpdateData;
        if (
            parsePreviousLSEventTrackData &&
            parsePreviousLSEventTrackData[type === 'conversion' ? 'engagement' : 'conversion']
        ) {
            finalUpdateData = parsePreviousLSEventTrackData[type === 'conversion' ? 'engagement' : 'conversion'];
        }

        const updateFinalSavedLSData = {
            [type]: events?.length ? updateCurrentSavedData : {} || {},
            [type === 'conversion' ? 'engagement' : 'conversion']: finalUpdateData || {},
        };

        localStorage.setItem('__webFieldTrackEventData', JSON.stringify(updateFinalSavedLSData));

        const fieldCaptureList = events?.map((event) => ({
            eventname: event?.eventname || '',
            trackingType: event?.trackingType || event?.elementtype || '',
            inputType: event?.inputType || event?.elementaction || '',
            description: event?.description || '',
            markAsGoal: event?.markAsGoal || false,
            screenTracking: event?.screenTracking || {},
            viewId: event?.viewId || '',
        }));

        const goalType = type;

        const apiPayload = {
            campaignId: state?.campaignId || '',
            deviceType: 'Web',
            domainName: domainUrl || currentActivity || '',
            deviceOs: '',
            imageData: {
                imageData: imageData?.imageData || '',
                width: imageData?.width || '',
                height: imageData?.height || '',
            },
            goalType: goalType,
            fieldTrackInfo: {
                campaignStartDate: state?.startDate || '',
                campaignEndDate: state?.endDate || '',
                fieldCaptureList: fieldCaptureList || [],
                minDuration: screenTracking?.minDuration || '',
                minLength: screenTracking?.minLength || '',
                screenfilter: screenTracking?.screenTrackCond || '',
                pageContent: {
                    controls: controlsArray || [],
                },
            },
        };

        // Call the API
        try {
            const response = await dispatch(saveWebAnalyticsCaptureFields({ payload: apiPayload }));
            if (response?.status) {
                            } else {
            }
        } catch (error) {
        }

        if (webFieldTrackEditData?.['elementArray']?.length) {
            setShowWFTM(false);
        } else if (data && data?.['elementArray']?.length) {
            setShowWFTM(false);
        } else {
            // window.close();
            setShowWFTM(false);
        }
    };

    const handleEditEvent = async (goalType = 'P', fieldName = 'engagement') => {
        const calculatedGoalType = fieldName;
        try {
            const payload = {
                campaignId: state?.campaignId?.toString() || '',
                deviceOs: 'Web',
                deviceType: 'Web',
                goalType: calculatedGoalType,
            };
            const response = await dispatch(getAnalyticsCaptureData({ payload }));
            if (response?.status && response?.data && response?.data?.length > 0) {
                const apiDataItem = response?.data[0];
                const parsedJsonData =
                    typeof apiDataItem.jsondata === 'string' ? JSON.parse(apiDataItem.jsondata) : apiDataItem.jsondata;
                setWebFieldTrackEditData({
                    jsondata: parsedJsonData,
                    fieldName: fieldName,
                });
            } else {
                setWebFieldTrackEditData({
                    fieldName: fieldName,
                });
            }

            setShowWFTM(true);
        } catch (error) {
            setWebFieldTrackEditData({
                fieldName: fieldName,
            });
            setShowWFTM(true);
        }
    };
    const handleErrClose = () => {
        if (isWAFail) {
            navigate('/communication', {
                index: 0,
            });
        }
    };

    useEffect(() => {
        if (goalDefaultTab === 1) {
            if (goalConversion) {
                setValue('goalDefaultTab', 1);
            } else if (goalEngagement) {
                setValue('goalDefaultTab', 0);
            } else {
                setValue('goalDefaultTab', 0);
            }
        } else {
            if (goalEngagement) {
                setValue('goalDefaultTab', 0);
            } else if (goalConversion) {
                setValue('goalDefaultTab', 1);
            } else {
                setValue('goalDefaultTab', 0);
            }
        }
    }, [goalEngagement, goalConversion]);

    const contextValue = {
        setShowWFTM,
        handleEditEvent,
        waMode,
        formListLoader,
        goalTypeLoader,
    };

    return (
        <webAnalyticsContext.Provider value={contextValue}>
            <AuthoringChannelEditSkeletonGate channelId={6} isLoading={showEditSkeleton && isSavedChannel}>
            <FormProvider {...methods}>
                <form
                    onSubmit={handleSubmit((data) => formSubmitHandler(data, 'form'))}
                    className="rsv-tabs-content tab-content position-relative"
                >
                    <div
                        className={`box-design bd-top-border ${
                            checkTrigger(state?.campaignType, state?.endDate)
                                ? 'pe-none click-off'
                                : !statusIdCheck(statusIDCheck || state?.statusId)
                                ? 'pe-none click-off'
                                : ''
                        }`}
                    >
                        {/* { !smartLink1 && ( */}
                        {!tabSmartLink_Flag &&
                            tabSmartLink_Flag !== null &&
                            statusIdCheck(statusIDCheck || state?.statusId) && (
                                <SmartLinkEnable
                                    secondaryButton
                                    onSave={() => setIsSmartLink(false)}
                                    onReject={() => {
                                        dispatch(showTabsSmartlink(true));
                                        setIsSmartLink(false);
                                    }}
                                    ignoreButton
                                    onIgnore={() => {
                                        handleNavigation();
                                    }}
                                />
                            )}
                        <div className="form-group mt20">
                            <Row>
                                <Col sm={{ offset: 1, span: 2 }} className="pr0">
                                    <label className="control-label-left">{ANALYTIC_PLATFORM}</label>
                                </Col>
                                <Col sm={6} id="rs_WebAnalytics_analyticsplatform">
                                    <RSKendoDropDownList
                                        control={control}
                                        name={'analyticsPlatform'}
                                        label={ANALYTIC_PLATFORM}
                                        rules={{
                                            required: SELECT_ANALYTICS_PLATFORM,
                                        }}
                                        required
                                        isLoading={analyticsListLoader.isLoading}
                                        data={
                                            !!WebAnalytics?.webAnalyticsList?.length
                                                ? WebAnalytics?.webAnalyticsList
                                                : []
                                        }
                                        textField={'analyticsDomainName'}
                                        dataItemKey={'analyticsDomainId'}
                                        handleChange={(e) => {
                                            getDomainListData(e.value.domainType);
                                            // fetchConversionCategory(e.value.analyticsDomainId);
                                        }}
                                    />
                                </Col>
                            </Row>
                        </div>
                        {!!analyticsPlatform && (
                            <div className="form-group">
                                <Row>
                                    <Col sm={{ offset: 3, span: 6 }} id="rs_WebAnalytics_Domain">
                                        <RSKendoDropDownList
                                            control={control}
                                            label={DOMAIN}
                                            name={'domain'}
                                            textField={'value'}
                                            dataItemKey={'id'}
                                            required
                                            isLoading={domainLoader.isLoading}
                                            data={domains || []}
                                            rules={{
                                                required: SELECT_DOMAIN,
                                            }}
                                        />
                                        <div className="fg-icons d-flex lh0 float-end">
                                            <RSPPophover text={DOMAIN_HOVER_TEXT}>
                                                <i
                                                    className={`${circle_question_mark_mini} icon-xs color-primary-blue position-relative top-1`}
                                                    id="circle_question_mark"
                                                />
                                            </RSPPophover>
                                            {/* <RSTooltip text={'Add domain name'}>
                                                <i
                                                    className={`${circle_plus_fill_medium} icon-md color-primary-blue top2 `}
                                                    id="rs_data_circle_plus_fill"
                                                />
                                            </RSTooltip> */}
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        )}
                        {!!analyticsPlatform && domain && (
                            <div className="form-group">
                                <Row>
                                    <Col sm={{ offset: 1, span: 2 }}>
                                        <label className="control-label-left">{GOAL}</label>
                                    </Col>
                                    <Col sm={2} className={isEngagement ? 'click-off' : ''}>
                                        <RSCheckbox
                                            control={control}
                                            name={'goalEngagement'}
                                            labelName={ENGAGEMENT}
                                            checked={goalDefault?.isEngagement}
                                            handleChange={(e) => {
                                                if (e?.target?.checked) getGoalType('E');
                                                setGoalDefault((prev) => ({
                                                    ...prev,
                                                    isEngagement: e?.target?.checked,
                                                }));
                                                if (
                                                    (goalEngagement && goalEngagement) ||
                                                    (goalEngagement && !goalConversion)
                                                ) {
                                                    setDefaultTab(0);
                                                }
                                                if (!e?.target?.checked) {
                                                    goalContentFields?.forEach((fieldName) => {
                                                        setValue(`engagement${fieldName}`, '');
                                                        clearErrors(`engagement${fieldName}`);
                                                    });
                                                }
                                            }}
                                        />
                                    </Col>
                                    <Col sm={2} className={isConverison ? 'click-off' : ''}>
                                        <RSCheckbox
                                            control={control}
                                            name={'goalConversion'}
                                            labelName={CONVERSION}
                                            checked={goalDefault?.isConverison}
                                            handleChange={(e) => {
                                                if (e?.target?.checked) getGoalType('C');
                                                setGoalDefault((prev) => ({
                                                    ...prev,
                                                    isConverison: e?.target?.checked,
                                                }));
                                                if (goalConversion && !goalEngagement) {
                                                    setDefaultTab(1);
                                                } else if (goalConversion && goalEngagement) {
                                                    setDefaultTab(0);
                                                }
                                                if (!e?.target?.checked) {
                                                    goalContentFields?.forEach((fieldName) => {
                                                        setValue(`conversion${fieldName}`, '');
                                                        clearErrors(`conversion${fieldName}`);
                                                    });
                                                }
                                            }}
                                        />
                                    </Col>
                                </Row>
                            </div>
                        )}
                        {!!analyticsPlatform && domain && (goalEngagement || goalConversion) && (
                            <div className="no-scroll-rs-content-tabs">
                                <RSTabber
                                    className="res-content-tabs-split"
                                    // defaultClass={`col-md-6 `}
                                    dynamicTab={`mb0 mini`}
                                    componentClassName={'mt41 w-100'}
                                    activeClass={`active`}
                                    //heading={deliveryType}
                                    // heading={''}
                                    flatTabs
                                    // refresh
                                    noMarginLeftRight
                                    // isRefreshConfirmation={true}
                                    defaultTab={
                                        goalDefaultTab
                                        // isEdit
                                        //     ? defaultTab
                                        // goalEngagement ? 0 : goalConversion ? 1 : goalConversion && goalEngagement && 0
                                    }
                                    // defaultTab={defaultTab}
                                    // disableOtherTabs={currentPage !== null}

                                    tabData={[
                                        {
                                            id: 'engagment',
                                            text:
                                                state?.primaryGoal === 'Reach'
                                                    ? 'Engagement'
                                                    : state?.primaryGoal === 'Engagement'
                                                    ? 'Engagement (Primary)'
                                                    : state?.secondaryGoal === 'Engagement'
                                                    ? 'Engagement (Secondary)'
                                                    : 'Engagement',
                                            component: () => (
                                                <GoalContent
                                                    key={`engagement`}
                                                    name={'engagement'}
                                                    conversionData={conversionData}
                                                    goal={goal}
                                                    url={engagementPages?.url}
                                                    isAppAnalytics={false}
                                                    contentTypes={contentTypes}
                                                    setContentTypes={setContentTypes}
                                                    editEventList={
                                                        webFieldTrackEditData?.engagement?.elementArray || []
                                                    }
                                                    handleEditEvent={handleEditEvent}
                                                />
                                            ),
                                            disable: !goalEngagement,
                                        },
                                        {
                                            id: 'conversion',
                                            text:
                                                state?.primaryGoal === 'Reach'
                                                    ? 'Conversion'
                                                    : state?.primaryGoal === 'Conversion'
                                                    ? 'Conversion (Primary)'
                                                    : state?.secondaryGoal === 'Conversion'
                                                    ? 'Conversion (Secondary)'
                                                    : 'Conversion',
                                            component: () => (
                                                <GoalContent
                                                    key={`conversion`}
                                                    name={'conversion'}
                                                    conversionData={conversionData}
                                                    goal={goal}
                                                    isAppAnalytics={false}
                                                    url={conversionPages?.url}
                                                    contentTypes={contentTypes}
                                                    setContentTypes={setContentTypes}
                                                    editEventList={
                                                        webFieldTrackEditData?.conversion?.elementArray || []
                                                    }
                                                    handleEditEvent={handleEditEvent}
                                                />
                                            ),
                                            disable: !goalConversion,

                                            // disable: type,
                                        },
                                    ]}
                                    callBack={(data, tabIndex) => {
                                        if (id === 'conversion' && goal.C?.length === 0) {
                                            getGoalType('C');
                                        }
                                        if (id === 'engagement' && goal.C?.length === 0) {
                                            getGoalType('E');
                                        }
                                        setValue('goalDefaultTab', tabIndex);
                                        // console.log('Data :::: ', data, tabIndex);
                                    }}
                                />
                            </div>
                        )}
                        {/* {goalEngagement && !!analyticsPlatform && (
                        <Fragment>
                            <div className="form-group">
                                <Row>
                                    <Col sm={4} className="text-right">
                                        <label className="control-label-left">Engagement type</label>
                                    </Col>
                                    <Col sm={7}>
                                        <RSKendoDropDownList
                                            control={control}
                                            name={'engagementType'}
                                            label={'Engagement Type'}
                                            textField={'FriendlyName'}
                                            dataItemKey={'ConversionTypeID'}
                                            required
                                            rules={{
                                                required: 'Please select engagement type',
                                            }}
                                            data={goal?.E}
                                        />
                                    </Col>
                                </Row>
                            </div>
                            <div className="form-group">
                                <Row>
                                    <Col sm={4} className="text-right">
                                        <label className="control-label-left">Engagement category</label>
                                    </Col>
                                    <Col sm={7}>
                                        <RSKendoDropDownList
                                            control={control}
                                            name={'engagementCategory'}
                                            label={'Engagement category'}
                                            textField={'categoryName'}
                                            dataItemKey={'conversionCategoryId'}
                                            required
                                            rules={{
                                                required: SELECT_CONVERSION_CATEGORY,
                                            }}
                                            data={conversionData?.length > 0 ? conversionData : []}
                                        />
                                    </Col>
                                </Row>
                            </div>
                        </Fragment>
                    )}
                    {!!engagementCategory && isEngagement && (
                        <div className="form-group">
                            <Row>
                                <Col sm={4} className="text-right">
                                    <label className="control-label-left">Subscription form</label>
                                </Col>
                                <Col sm={7}>
                                    <RSKendoDropDownList
                                        control={control}
                                        name={'subscriptionFormEngagement'}
                                        label={'Subscription form'}
                                        rules={{
                                            required: SELECT_SUBSCRPTION_FORM,
                                        }}
                                        required
                                        textField={'formName'}
                                        dataItemKey={'formId'}
                                        data={WebAnalytics?.webAnalyticsFormList}
                                    />
                                </Col>
                            </Row>
                        </div>
                    )}
                    {goalConversion && !!analyticsPlatform && (
                        <Fragment>
                            <div className="form-group">
                                <Row>
                                    <Col sm={4} className="text-right">
                                        <label className="control-label-left">Conversion type</label>
                                    </Col>
                                    <Col sm={7}>
                                        <RSKendoDropDownList
                                            control={control}
                                            name={'conversionType'}
                                            label={'Conversion Type'}
                                            textField={'FriendlyName'}
                                            dataItemKey={'ConversionTypeID'}
                                            required
                                            rules={{
                                                required: 'Please select engagement type',
                                            }}
                                            data={goal?.E}
                                        />
                                    </Col>
                                </Row>
                            </div>
                            <div className="form-group">
                                <Row>
                                    <Col sm={4} className="text-right">
                                        <label className="control-label-left">Conversion category</label>
                                    </Col>
                                    <Col sm={7}>
                                        <RSKendoDropDownList
                                            control={control}
                                            name={'conversionCategory'}
                                            label={'Conversion category'}
                                            textField={'categoryName'}
                                            dataItemKey={'conversionCategoryId'}
                                            required
                                            rules={{
                                                required: SELECT_CONVERSION_CATEGORY,
                                            }}
                                            data={conversionData?.length > 0 ? conversionData : []}
                                        />
                                    </Col>
                                </Row>
                            </div>
                        </Fragment>
                    )}
                    {!!conversionCategory && isConverison && (
                        <div className="form-group">
                            <Row>
                                <Col sm={4} className="text-right">
                                    <label className="control-label-left">Subscription form</label>
                                </Col>
                                <Col sm={7}>
                                    <RSKendoDropDownList
                                        control={control}
                                        name={'subscriptionFormConversion'}
                                        label={'Subscription form'}
                                        rules={{
                                            required: SELECT_SUBSCRPTION_FORM,
                                        }}
                                        required
                                        textField={'formName'}
                                        dataItemKey={'formId'}
                                        data={WebAnalytics?.webAnalyticsFormList}
                                    />
                                </Col>
                            </Row>
                        </div>
                    )} */}
                        {/* {goalEngagement && !!analyticsPlatform && (
                        <EventTracking
                            events={events}
                            setAlert_flag={setAlert_flag}
                            setEvents={setEvents}
                            handleSubmit={handleSubmit((data) => formSubmitHandler(data, 'url'))}
                        />
                    )} */}
                        {/* {goalConversion && !!analyticsPlatform && (
                        <EventTracking
                            events={events}
                            setAlert_flag={setAlert_flag}
                            setEvents={setEvents}
                            handleSubmit={handleSubmit((data) => formSubmitHandler(data, 'url'))}
                        />
                    )} */}
                        {/* {(state?.secondaryGoal === 'Engagement' || state?.secondaryGoal === 'Conversion') &&
                        !!analyticsPlatform && (
                            <div className="form-group">
                                <Row>
                                <Col sm={{ offset: 1, span: 2 }}>
                                        <label className="control-label-left">Secondary goal</label>
                                    </Col>
                                    {fields.map((field, index) => {
                                        return (
                                            <>
                                                <Col sm={6} className={`${index > 0 && 'offset-4 mt41'}`}>
                                                    <RSInput
                                                        control={control}
                                                        name={`eventSecGoal[${index}].conversionUrl`}
                                                        // name={`conversionUrl`}
                                                        label={'Conversion URL'}
                                                        required
                                                        rules={{
                                                            required: ENTER_CONVERSION_URL,
                                                            pattern: {
                                                                value: WEBSITE_REGEX,
                                                                message: ENTER_VALID_CONVERSION_URL,
                                                            },
                                                            validate: () => {
                                                                const [status, _] = findDuplicates(
                                                                    eventSecGoalWatch,
                                                                    'conversionUrl',
                                                                );
                                                                return status ? DUPLICATE_VALUE : true;
                                                            },
                                                        }}
                                                    />
                                                </Col>
                                                <Col sm={1} className={`fg-icons-wrapper pl0 ${index > 0 && 'mt41'}`}>
                                                    <div className="fg-icons d-flex">
                                                        <RSTooltip text={index === 0 ? 'Add' : 'Delete'} position="top">
                                                            <i
                                                                onClick={() => {
                                                                    if (addAccess) addeventSecGoal(index);
                                                                }}
                                                                className={`${selectIcon(index)} icon-md cp ${
                                                                    fields?.length > 4 && index == 0 ? 'click-off' : ''
                                                                } ${!addAccess ? 'click-off' : ''}`}
                                                            ></i>
                                                        </RSTooltip>
                                                    </div>
                                                </Col>
                                            </>
                                        );
                                    })}
                                </Row>
                            </div>
                        )} */}
                    </div>
                    <div className="buttons-holder">
                        <RSSecondaryButton
                            onClick={() => {
                                dispatch(resetCreateCommunication());
                                navigate('/communication', {
                                    replace: true,
                                    state: {
                                        index: 0,
                                    },
                                });
                                localStorage.removeItem('savedChannel');
                                localStorage.removeItem('__webFieldTrackEventData');
                            }}
                            id="rs_WebAnalytics_cancel"
                        >
                            {CANCEL}
                        </RSSecondaryButton>
                        <RSSecondaryButton
                            className="color-primary-blue"
                            //type="submit"
                            onClick={() => {
                                handleSubmit((data) => formSubmitHandler(data, 'save'))();
                            }}
                            id="rs_WebAnalytics_Save"
                            isLoading={isSaveLoading}
                            blockBodyPointerEvents
                            disabledClass={isSubmitting ? 'pe-none click-off' : ''}
                        >
                            {SAVE}
                        </RSSecondaryButton>
                        <RSPrimaryButton
                            isLoading={isNextLoading}
                            blockBodyPointerEvents
                            disabledClass={isSubmitting ? 'pe-none click-off' : ''}
                            onClick={() => {
                                // debugger;
                                // if (!isValid) trigger();
                                if (!isDirty && !isValid) {
                                    setNavigate_confirm(true);
                                } else {
                                    handleSubmit((data) => formSubmitHandler(data, 'form', false))();
                                }
                                // if (isValid) {
                                //     handleSubmit((data) => formSubmitHandler(data, 'form', false))();
                                // } else {
                                //     trigger();
                                // }
                            }}
                            id="rs_WebAnalytics_next"
                        >
                            {NEXT}
                        </RSPrimaryButton>
                    </div>
                </form>
                <RSConfirmationModal
                    show={navigate_confirm}
                    text={IGNORE_WEB_ANALYTICS}
                    primaryButtonText={OK}
                    handleClose={() => {
                        setNavigate_confirm(false);
                    }}
                    handleConfirm={() => {
                        setNavigate_confirm(false);
                        window.setTimeout(() => handleNavigation(), 0);
                    }}
                />
            </FormProvider>
            </AuthoringChannelEditSkeletonGate>

            {isShowWFTM && (
                <WebFieldTrack
                    show={isShowWFTM}
                    onWebFieldTrackSubmit={(data, events) => {
                        handleWebFieldTrackSubmit({ data, events });
                    }}
                    editEventList={webFieldTrackEditData}
                    handleModalClose={() => setShowWFTM(false)}
                />
            )}
            {getWarningPopupMessage(failureApiErrors, dispatch, handleErrClose)}
        </webAnalyticsContext.Provider>
    );
};

export default WebAnalytics;
