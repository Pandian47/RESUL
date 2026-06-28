import { checkTrigger, statusIdCheck } from 'Utils/modules/campaignUtils';
import { getmasterData } from 'Utils/modules/masterData';
import { getChannelId } from 'Utils/modules/communicationChannels';
import { encodeUrl } from 'Utils/modules/crypto';
import { formatName } from 'Utils/modules/formatters';
import { SELECT_ANALYTICS_PLATFORM } from 'Constants/GlobalConstant/ValidationMessage';
import { ANALYTIC_PLATFORM, CANCEL, CONVERSION, ENGAGEMENT, GOAL, IGNORE_CHANNEL, NEXT, OK, SAVE } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useRef, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useForm, FormProvider } from 'react-hook-form';
import _map from 'lodash/map';
import _get from 'lodash/get';
import useQueryParams from 'Hooks/useQueryParams';
import RSTabber from 'Components/RSTabber';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { formInitialState, secGoal, appGoalList, buildPayload, getInputType } from './constant';
import { resetCreateCommunication, updateTab, updateDirtyState } from 'Reducers/communication/createCommunication/create/reducer';
import { useNavigate } from 'react-router-dom';
import RSConfirmationModal from 'Components/ConfirmationModal';
import { useDispatch, useSelector } from 'react-redux';
import { availableTabs, getPreCampaignStatus } from '../../../constant';

import { getSessionId } from 'Reducers/globalState/selector';
import {
    getGeneratedLink,
    smartlinkEdit,
    screenListSelector,
    getMobileAppId,
} from 'Reducers/communication/createCommunication/smartlink/selectors';
import { getSmartUrl } from 'Reducers/communication/createCommunication/smartlink/request';
import SmartLinkEnable from '../../../Component/SmartLinkEnable/SmartLinkEnable';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';

import { getAppAnalyticsContent, getMobileAnalyticsList, getWebAnalyticsFormList, saveMOBILEAnalyticsChannel } from 'Reducers/communication/createCommunication/Create/request';
import { showTabsSmartlink, updateEventTrack } from 'Reducers/communication/createCommunication/smartlink/reducer';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import { getConversionTypeList } from 'Reducers/communication/createCommunication/plan/request';
import GoalContent from '../WebAnalytics/Component/GoalContent/GoalContent';
import { get_formCSV_FormFields } from 'Reducers/preferences/FormGenerator/request';
import useApiLoader from 'Hooks/useApiLoader';
import AuthoringChannelEditSkeletonGate, {
    AUTHORING_EDIT_API_LOADER_CONFIG,
    AUTHORING_FIELD_LOADER_CONFIG,
    getAuthoringSaveButtonType,
    useAuthoringChannelEditLoader,
    useAuthoringChannelSaveLoader,
} from 'Components/Skeleton/pages/communication/authoring';
import { webAnalyticsContext } from '../WebAnalytics/WebAnalytics';
const AppAnalytics = () => {
    const {
        tabsState: { analytics: tabAnalyticsState },
        isDirty,
    } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const methods = useForm(formInitialState);
    const {
        control,
        handleSubmit,
        trigger,
        reset,
        watch,
        setValue,
        getValues,
        formState: { errors, dirtyFields, isValid },
    } = methods;
    const [navigate_confirm, setNavigate_confirm] = useState(false);
    const [analyticsPlatform, conversionCategory, goalEngagement, goalConversion, engagementCategory, domain, isEdit] =
        watch([
            'analyticsPlatform',
            'conversionCategory',
            'goalEngagement',
            'goalConversion',
            'engagementCategory',
            'domain',
            'isEdit',
        ]);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const state = useQueryParams('/communication');
    const isEngagement = state?.primaryGoal === 'Engagement' || state?.secondaryGoal === 'Engagement';
    const isConverison = state?.primaryGoal === 'Conversion' || state?.secondaryGoal === 'Conversion';
    const screenListTemp = useSelector((state) => screenListSelector(state));
    const { userId, clientId, departmentId, departmentName, isAgency } = useSelector((state) => getSessionId(state));
    const { smartLink1, smartLink2 } = useSelector((state) => getGeneratedLink(state));
    const edit = useSelector((state) => smartlinkEdit(state));
    const { savedChannelsId } = useSelector(({ communicationPlanReducer }) => communicationPlanReducer);
    const { showSmartLink } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const { customFields, mobileApps , eventTrackData } = useSelector(({ smartLinkReducer }) => smartLinkReducer);
    const { personalization } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer); 
    const smartLink = useSelector((state) => getGeneratedLink(state));
    const mobileAppId = useSelector((state) => getMobileAppId(state));
    const [isSmartLink, setIsSmartLink] = useState(false);
    const [appAnalytics, setAppAnalytics] = useState({
        mobileAppDomains: [],
        appAnalyticsContent: [],
        appScreenList: [],
    });
    const [goalDefault, setGoalDefault] = useState({
        isEngagement: false,
        isConverison: false,
    });
    const [goal, setGoal] = useState({
        E: [],
        C: [],
    });
    const [contentTypes, setContentTypes] = useState({
        engagement: [],
        conversion: [],
    });
    const [defaultTab, setDefaultTab] = useState(isEngagement ? 0 : isConverison ? 1 : 0);
    const { currencyMasterList } = getmasterData();
    const checkSave = savedChannelsId[16]?.includes(16) ?? false;
    const { showEditSkeleton, isSavedChannel, runEditFetch, finishEditSkeleton } = useAuthoringChannelEditLoader({
        channelId: 16,
        subChannelId: 16,
        shouldLoadEdit: checkSave,
    });
    const { runSave, isSaveLoading, isNextLoading, isSendLoading, isSubmitting } = useAuthoringChannelSaveLoader();
    const appLoaderConfig = checkSave ? AUTHORING_EDIT_API_LOADER_CONFIG : AUTHORING_FIELD_LOADER_CONFIG;
    const isAlreadyCalled = useRef(false);
    const [eventsDatainEdit,setEventsDatainEdit] = useState({
        engagement: [],
        conversion: [],
    })
    const appMode = (state?.campaignId ?? 0) > 0 ? 'edit' : 'create';
    const analyticsListLoader = useApiLoader({
        autoFetch: false,
        mode: appMode,
        loaderConfig: appLoaderConfig,
    });
    const goalTypeLoader = useApiLoader({
        autoFetch: false,
        mode: appMode,
        loaderConfig: appLoaderConfig,
    });
    const formListLoader = useApiLoader({
        autoFetch: false,
        mode: appMode,
        loaderConfig: appLoaderConfig,
    });
    async function getSmartLink() {
        const payload = {
            clientId,
            departmentId,
            userId,
            campaignId: state?.campaignId,
            departmentName,
            isAgency,
        };
        const res = await dispatch(
            getSmartUrl({ payload, listData: { mobileApps, personalization }, loading: false }),
        );
    }

    // useEffect(() => {
    // async function getSmartLink() {
    //     const payload = { clientId, departmentId, userId, campaignId: state?.campaignId };
    //     const res = await dispatch(getSmartUrl({ payload }));
    // if (!res?.status) {
    //     setIsSmartLink(true);
    //     dispatch(updateSmartLinkShow(false));
    // } else {
    //     setIsSmartLink(false);
    //     dispatch(updateSmartLinkShow(true));
    // }
    // }
    //     if (!smartLink1 || !smartLink2) {
    //         if (state && _get(state, 'campaignId', 0) > 0) getSmartLink();
    //     }
    // }, [state]);
     useEffect(() => {
            if (!isDirty && Object.keys(dirtyFields)?.length > 0) {
                dispatch(updateDirtyState(true));
            } else if (isDirty && Object.keys(dirtyFields)?.length === 0) {
                dispatch(updateDirtyState(false));
            }
    }, [JSON.stringify(dirtyFields)]);
    useEffect(() => {
        if (checkSave) {
            if (!mobileAppId || !smartLink1 || !Object.values(smartLink)[0]) setIsSmartLink(true);
            else setIsSmartLink(false);
        } else {
            if (!mobileAppId || !smartLink1 || !Object.values(smartLink)[0]) setIsSmartLink(true);
            else setIsSmartLink(false);
        }
    }, [smartLink1, smartLink, mobileAppId, showSmartLink]);

    let appGoalListTemp =
        state?.secondaryGoal === 'Engagement' || state?.secondaryGoal === 'Conversion'
            ? appGoalList.concat(secGoal)
            : appGoalList;
    useEffect(() => {
        let tempObject = edit?.smartLink1?.slice(1);
        const temp = {};

                let tempObjectEngagmentGoal = tempObject?.map((res,ind) => ({
            mobilePlatform: res?.mobilePlatform,
            mobileApp: res?.mobileApp?.appName,
            isURIParameter: res?.isURIParameter,
            deferredDeepLink: res?.deferredDeepLink,
            appScreen: res?.appScreen,
            appSubScreen: res?.subappScreen,
            customAppScreen: res?.customAppScreen,
            appScreenNew: res?.appScreenNew,
            subappScreenNew: res?.subappScreenNew,
            events: ind === 0 ? eventTrackData['engagementPrimaryGoal']?.length ? eventTrackData['engagementPrimaryGoal'] : [] : [],
            eventstemp: [],
            show: false,
            appGuid: res?.mobileApp?.appGuid,
        }));
        let tempObjectConversionGoal = tempObject?.map((res,ind) => ({
            mobilePlatform: res?.mobilePlatform,
            mobileApp: res?.mobileApp?.appName,
            isURIParameter: res?.isURIParameter,
            deferredDeepLink: res?.deferredDeepLink,
            appScreen: res?.appScreen,
            appSubScreen: res?.subappScreen,
            customAppScreen: res?.customAppScreen,
            appScreenNew: res?.appScreenNew,
            subappScreenNew: res?.subappScreenNew,
            events: ind === 0 ? eventTrackData['conversionPrimaryGoal']?.length ? eventTrackData['conversionPrimaryGoal'] : [] : [],
            eventstemp: [],
            show: false,
            appGuid: res?.mobileApp?.appGuid,
        }));
        // let tempanalyticsPlatform = appAnalytics?.mobileAppDomains?.filter(
        //     (action) => appAnalytics?.appAnalyticsContent[0]?.analyticsType === action?.domainType,
        // );
        // temp.primaryGoal = tempObjectGoal;

        reset((formState) => {
            // console.log('formState: ', formState, tempObjectGoal);
            return {
                ...formState,

                engagementPrimaryGoal: tempObjectEngagmentGoal,
                conversionPrimaryGoal: tempObjectConversionGoal,

                // ...temp,
                // analyticsPlatform: appAnalytics?.appAnalyticsContent?.length > 0 ? tempanalyticsPlatform[0] : [],
            };
        });
    }, [screenListTemp?.length > 0, edit, eventTrackData]);

    // useEffect(()=>{
    //     reset((formState) => {
    //         return {
    //             ...formState,
    //             engagementPrimaryGoal: [
    //                 {
    //                 ...formState.engagementPrimaryGoal,
    //                 events: eventTrackData['engagementPrimaryGoal']?.length ? eventTrackData['engagementPrimaryGoal'] : [] 
    //                 }      
    //             ],
    //            conversionPrimaryGoal: [{
    //                 ...formState.conversionPrimaryGoal,
    //                 events: eventTrackData['conversionPrimaryGoal']?.length ? eventTrackData['conversionPrimaryGoal'] : []
    //             }]

    //         }})
    // },[eventTrackData])

    useEffect(()=>{
       if( eventsDatainEdit.engagement?.length ||  eventsDatainEdit.conversion?.length) {
        const engagementPrimary = getValues('engagementPrimaryGoal')?.map((item, ind) => ({
            ...item,
            ...(ind === 0 ? { events: eventsDatainEdit.engagement } : {})
        }));
        const conversionPrimary = getValues('conversionPrimaryGoal')?.map((item, ind) => ({
            ...item,
            ...(ind === 0 ? { events: eventsDatainEdit.conversion } : {})
        }));
                
        reset((formState) => ({
         ...formState,
         engagementPrimaryGoal: engagementPrimary,
         conversionPrimaryGoal: conversionPrimary
        }))
            if(eventsDatainEdit.engagement?.length){
                dispatch(
                    updateEventTrack({
                        field: 'engagementPrimaryGoal',
                        data: eventsDatainEdit.engagement || [],
                    }),
                );
            }
            if(eventsDatainEdit.conversion?.length){
                dispatch(
                    updateEventTrack({
                        field: 'conversionPrimaryGoal',
                        data: eventsDatainEdit.conversion || [],
                    }),
                );
            }
       }
    },[eventsDatainEdit])

    // console.log('Edit  ::::::::::::::::::::::::::::: ', edit);
    async function getMADomainList(loaderConfig = AUTHORING_FIELD_LOADER_CONFIG) {
        const payload = { clientId, departmentId, userId, analyticsType: 'MA' };
        const res = await analyticsListLoader.refetch({
            fetcher: async () => dispatch(getMobileAnalyticsList({ payload, loading: false })),
            loaderConfig,
        });
        const { status, data } = res || {};
        if (status) {
            const filterData = data.filter((item)=> item?.analyticsDomainId !== 7 )
            setAppAnalytics((pre) => ({ ...pre, mobileAppDomains: filterData }));
        } else {
            setAppAnalytics((pre) => ({ ...pre, mobileAppDomains: [] }));
        }
    }

    const getFormValues = async (form) => {
            const payload = {
                departmentId,
                clientId,
                userId,
                formId: form?.formId,
                isRmNotifier: false
            };
    
            const res = await dispatch(get_formCSV_FormFields({ ...payload, loading: false }));
            if (res?.status) {
                let temp = res?.data?.FormFields?.map((item) => item?.ColumnName);
                // setFormValues(temp);
                return temp;
            }
        };
    const getAnalyticsContent = async () => {
            if (isAlreadyCalled.current) {
                return;
            }
            isAlreadyCalled.current = true;
            const payload = { clientId, departmentId, userId, campaignId: _get(state, 'campaignId', 0) };
            const nestedLoaderConfig = checkSave
                ? AUTHORING_EDIT_API_LOADER_CONFIG
                : AUTHORING_FIELD_LOADER_CONFIG;
            try {
            const response = checkSave
                ? await runEditFetch(
                      () => dispatch(getAppAnalyticsContent({ payload, loading: false })),
                      { releaseAfterFetch: false },
                  )
                : await dispatch(getAppAnalyticsContent({ payload, loading: false }));
            const { status, data } = response || {};

            if (status) {
                // setAppAnalytics((pre) => ({ ...pre, appAnalyticsContent: data }));
                // let tempanalyticsPlatform = appAnalytics?.mobileAppDomains?.filter(
                //     (action) => analyticsType === action?.domainType,
                // );
                // let tempObjectGoalEdit = edit?.smartLink1?.slice(1)?.map((res) => ({
                //     mobilePlatform: res?.mobilePlatform,
                //     mobileApp: res?.mobileApp?.appName,
                //     isURIParameter: res?.isURIParameter,
                //     deferredDeepLink: res?.deferredDeepLink,
                //     appScreen: res?.appScreen,
                //     appSubScreen: res?.subappScreen,
                //     events: eventGoalData?.fieldsInfo?.events,
                //     eventstemp: [],
                //     show: false,
                //     appGuid: res?.mobileApp?.appGuid,
                // }));
                // let payload = { field: 'MobileAnalytics', data };
                // dispatch(updateAnalytics(payload, 'MobileAnalytics'));
                // console.log('tempObjectGoalEdit: ', tempObjectGoalEdit);
                // reset({ analyticsPlatform: tempanalyticsPlatform[0], primaryGoal: tempObjectGoalEdit });
                const mobileAnalyticsCampaign = data;
                // let domainData = await getDomainListData(webAnalyticsCampaign?.domainType);
                let formList = await formListLoader.refetch({
                    fetcher: async () =>
                        dispatch(
                            getWebAnalyticsFormList({
                                payload: { clientId, departmentId, userId },
                                loading: false,
                            }),
                        ),
                    loaderConfig: nestedLoaderConfig,
                });
                let domainsList = await getMADomainList(nestedLoaderConfig);
                // let tempDomainType = domainsList?.filter(
                //     (item) => item?.domainType === appAnalytics?.mobileAppDomains?.domainType,
                // );
                let tempDomainType = appAnalytics?.mobileAppDomains?.filter(
                    (domain) =>
                        domain?.domainType?.toLowerCase() === mobileAnalyticsCampaign?.analyticsType?.toLowerCase(),
                );
                // let tempDomain = domainData?.filter(
                //     (action) => webAnalyticsCampaign?.domainUrlList?.[0]?.domainNameURL === action?.value,
                // );
                let tempGoalEngagementList =
                    mobileAnalyticsCampaign?.engagement?.engagementTypes?.length !== 0
                        ? await getGoalType('E', nestedLoaderConfig)
                        : [];

                let tempGoalConversionList =
                    mobileAnalyticsCampaign?.conversion?.conversionTypes?.length !== 0
                        ? await getGoalType('C', nestedLoaderConfig)
                        : [];
                let tempEngagementTypes = mobileAnalyticsCampaign?.engagement?.engagementTypes?.map((item) => {
                    let temp = tempGoalEngagementList?.filter(
                        (list) => list?.ConversionTypeID === item?.engagementTypeId,
                    )?.[0];
                    return temp;
                });
                let tempGoalEngagement = tempGoalEngagementList?.length !== 0;
                let tempGoalConversion = tempGoalConversionList?.length !== 0;
                setDefaultTab(tempGoalEngagement ? 0 : 1);
                setGoalDefault({
                    isEngagement: tempGoalEngagement,
                    isConverison: tempGoalConversion,
                });
                let tempContent = getInputType(tempEngagementTypes?.map((item) => item?.ConversionName));
                setContentTypes((prev) => ({
                    ...prev,
                    engagement: tempContent,
                }));

                let tempConversionTypes = mobileAnalyticsCampaign?.conversion?.conversionTypes?.map((item) => {
                    let temp = tempGoalConversionList?.filter(
                        (list) => list?.ConversionTypeID === item?.conversionTypeId,
                    )?.[0];
                    return temp;
                });
                let tempContentConversion = getInputType(tempConversionTypes?.map((item) => item?.ConversionName));
                setContentTypes((prev) => ({
                    ...prev,
                    conversion: tempContentConversion,
                }));
                let tempEngagementCustomEvents = [];
                let tempEngagementForm = '';
                let tempEngagementFormAction = '';
                let tempEngagementPages = [];
                let tempEngagementEventTracksData = [];
                let tempEngagementData =
                    mobileAnalyticsCampaign?.engagement?.data?.length !== 0
                        ? mobileAnalyticsCampaign?.engagement?.data?.map((item) => {
                              if (item?.type === 'CustomEvent') {
                                  tempEngagementCustomEvents = item?.eventName?.split(',');
                              } else if (item?.type === 'form') {
                                  tempEngagementForm = formList?.status
                                      ? formList?.data?.filter((form) => form?.formId === item?.formId)
                                      : '';
                                  tempEngagementFormAction = item?.actionName;
                              } else if (formatName(item.type) === 'landingpage') {
                                  if (item.deviceList?.length) {
                                      item.deviceList?.map((device) => {
                                          if (device.eventGoalData?.length) {
                                              tempEngagementEventTracksData = device.eventGoalData;
                                          }
                                      });
                                  }
                              } else {
                                  tempEngagementPages = item?.urls?.map((url) => ({ url: url?.pageurl }));
                              }
                          })
                        : [];
                let tempConversionCustomEvents = [];
                let tempConversionForm = '';
                let tempConversionFormAction = '';
                let tempConversionPages = [];
                let tempConversionEventTracksData = [];
                let tempConversionData =
                    mobileAnalyticsCampaign?.conversion?.data?.length !== 0
                        ? mobileAnalyticsCampaign?.conversion?.data?.map((item) => {
                              if (item?.type === 'CustomEvent') {
                                  tempConversionCustomEvents = item?.EventName?.split(',');
                              } else if (item?.type === 'form') {
                                  tempConversionForm = formList?.status
                                      ? formList?.data?.filter((form) => form?.formId === item?.formId)
                                      : '';
                                  tempConversionFormAction = item?.actionName;
                              } else if (formatName(item.type) === 'thankyoupage') {
                                  if (item.deviceList?.length) {
                                      item.deviceList?.map((device) => {
                                          if (device.eventGoalData?.length) {
                                              tempConversionEventTracksData = device.eventGoalData;
                                          }
                                      });
                                  }
                              } else {
                                  tempConversionPages = item?.urls?.map((url) => ({ url: url?.pageurl }));
                              }
                          })
                        : [];
                let formValues = tempConversionForm?.length !== 0 ? await getFormValues(tempConversionForm?.[0]) : [];

                let tempConversionCustomValues = mobileAnalyticsCampaign?.conversion?.conversionValue?.attributeName;
                let tempConversionPricing = !!mobileAnalyticsCampaign?.conversion?.conversionValue?.currency
                    ? currencyMasterList?.filter(
                          (item) => item?.currencyID === mobileAnalyticsCampaign?.conversion?.conversionValue?.currency,
                      )?.[0]
                    : '';
                let tempConversionManualValue = !!mobileAnalyticsCampaign?.conversion?.conversionValue?.manualValue
                    ? mobileAnalyticsCampaign?.conversion?.conversionValue?.manualValue
                    : '';
                let tempConversionValueType = mobileAnalyticsCampaign?.conversion?.conversionValue?.type;
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

                    setEventsDatainEdit({
                        engagement: tempEngagementEventTracksData,
                        conversion: tempConversionEventTracksData
                    })

                    let editForm = {
                        isEdit: true,
                        analyticsPlatform: tempDomainType?.[0],
                        // domain: tempDomain?.[0],
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
                }
            } else {
                setAppAnalytics((pre) => ({ ...pre, appAnalyticsContent: [] }));
            }
            } finally {
                if (checkSave) {
                    finishEditSkeleton();
                }
            }
    };

    useEffect(() => {
        let cancelled = false;
        async function initAppAnalytics() {
            await getMADomainList(appLoaderConfig);
            if (cancelled) {
                return;
            }
            if (checkSave && state?.campaignId) {
                await getAnalyticsContent();
            }
        }
        initAppAnalytics();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (isEngagement) {
            getGoalType('E');
            setValue('goalEngagement', true);
            setGoalDefault((prev) => ({
                ...prev,
                isEngagement: true,
            }));
            setDefaultTab(0); // Set to engagement tab
        }
        if (isConverison) {
            getGoalType('C');
            setValue('goalConversion', true);
            setGoalDefault((prev) => ({
                ...prev,
                isConverison: true,
            }));
            // Only set to conversion tab if engagement is not enabled
            if (!isEngagement) {
                setDefaultTab(1);
            }
        }
    }, [isEngagement, isConverison]);

    const handleNavigation = () => {
        let { analyticsTypes = [] } = state;
        let tempTabsIndex = [];
        const tabIndex = tabAnalyticsState?.currentTab + 1;
        const tempTabs = _map(analyticsTypes, (id) => {
            const { label } = getChannelId(id);
            const normalizedLabel = label.toLowerCase();
            if (normalizedLabel === 'app analytics') return 'app';
            if (normalizedLabel === 'webinar') return 'events';
            return normalizedLabel;
        });
        const tempTabsName = _map(availableTabs['analytics'], (index, value) => {
            if (tempTabs.includes(index)) {
                tempTabsIndex.push(value);
            }
        });
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
                    data: {
                        tabName: tempTabs[tempTabs.findIndex((id) => tabAnalyticsState.tabName == id) + 1], //tempTabs[tabIndex], //availableTabs['analytics'][tabIndex],
                        currentTab: tempTabsIndex[tempTabs.findIndex((id) => tabAnalyticsState.tabName == id) + 1], // tempTabsIndex[tabIndex], // tabIndex,
                    },
                }),
            );
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
        let conversionValue = getValues(`conversionManualType`) ? getValues(`conversionManualValue`) : getValues(`conversionCustomEventsValue`);
        let conversionPricing = getValues(`conversionPricing`);
        if (nameTypes?.length === 0) return false;
        if (nameTypes?.includes('URL')) {
            if (pages?.map((item) => item?.url)?.includes('')) {
                return false;
            }
        } else if (nameTypes?.includes('Forms')) {
            if (form === '' && action === '') return false;
        }
        // if (goalConversion) {
        //     if (conversionPricing === '') return false;
        //     if (conversionValue === '') return false;
        // }
        return true;
    };
    const formSubmitHandler = async (data, type) => {
        // debugger;
        //console.log('data: ', data);
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
        if (
            isValid &&
            ((checkGoals === 'Both' && checkResult?.[0] && checkResult?.[1]) ||
                (checkGoals === 'Engagement' && checkResult?.[0]) ||
                (checkGoals === 'Conversion' && checkResult?.[0]) ||
                (checkResult?.length === 0 && checkGoals === '' && !goalConversion && !goalEngagement))
        ) {
            const latestFormValues = getValues();
            data = {
                ...latestFormValues,
                ...data,
                clientId,
                userId,
                departmentId,
            };
            const payload = buildPayload(data, isEngagement, isConverison, state?.campaignId);
            // let tempGoalData = primaryGoal?.map((res) => ({
            //     MobileplatformType: res?.mobilePlatform,
            //     AndridSelectscreen: res?.mobilePlatform?.toLowerCase().includes('an')
            //         ? res?.appScreen?.activityName || ''
            //         : '',
            //     AndridSelectsSubcreen: res?.mobilePlatform?.toLowerCase().includes('an')
            //         ? res?.appSubScreen?.subScreenName || ''
            //         : '',
            //     IOSSelectscreen: res?.mobilePlatform?.toLowerCase().includes('an')
            //         ? ''
            //         : res?.appScreen?.activityName || '',
            //     IOSSelectsSubcreen: res?.mobilePlatform?.toLowerCase().includes('an')
            //         ? ''
            //         : res?.appSubScreen?.subScreenName || '',
            // }));
            // let tempEventGoal = [];
            // tempEventGoal.push({
            //     campaignId: state?.campaignId,
            //     appId:
            //         primaryGoal[0].appGuid !== undefined
            //             ? primaryGoal[0].appGuid
            //             : edit?.smartLink1?.slice(1)[0].mobileApp.appGuid,
            //     //primaryGoal[0].appGuid !== undefined ? primaryGoal[0].appGuid :
            //     deviceType: primaryGoal[0].mobilePlatform,
            //     deviceOs: primaryGoal[0].mobilePlatform?.toLowerCase().includes('an') ? 'Android' : 'iOS',
            //     imageData: primaryGoal[0]?.eventstemp?.imageData,
            //     goalType: 'P',
            //     fieldsInfo: {
            //         campaignStartDate: state?.startDate,
            //         campaignEndDate: state?.endDate,
            //         fieldCaptureList: primaryGoal[0]?.eventstemp?.selectControls,
            //         minDuration: primaryGoal[0]?.eventstemp?.screenTracking?.minDuration,
            //         minLength: primaryGoal[0]?.eventstemp?.screenTracking?.minLength,
            //         screenfilter: primaryGoal[0]?.eventstemp?.screenTracking?.screenTrackCond,
            //         events: primaryGoal[0]?.events,
            //         pageContent: { controls: primaryGoal[0]?.eventstemp?.controlsArray },
            //     },
            // });

            // const payload = {
            //     clientId,
            //     departmentId,
            //     userId,
            //     copy: false,
            //     campaignId: state?.campaignId,
            //     analyticsType: analyticsPlatform?.domainType,
            //     mobileAppGuid:
            //         primaryGoal[0].appGuid !== undefined
            //             ? primaryGoal[0].appGuid
            //             : edit?.smartLink1?.slice(1)[0].mobileApp.appGuid,
            //     recipientFormId: 0,
            //     deviceType: primaryGoal[0].mobilePlatform,
            //     deviceOs: primaryGoal[0].mobilePlatform?.toLowerCase().includes('an') ? 'Android' : 'iOS',
            //     mobileDataJSON: tempGoalData,
            //     goalType: 'P',
            //     eventGoalData: primaryGoal[0]?.eventstemp?.currentActivity?.length > 0 ? tempEventGoal[0] : [],
            // };
            // console.log('payload: ', payload);
             const { status } = await runSave(getAuthoringSaveButtonType(type), () =>
                dispatch(
                    saveMOBILEAnalyticsChannel({
                        payload: { ...payload, clientId, departmentId, userId, copy: false },
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
                } else {
                    handleNavigation();
                }
            }
        } else if (!checkResult?.[0]) {
            setDefaultTab(0);
            trigger();
        } else if (!checkResult?.[1]) {
            setDefaultTab(1);
            trigger();
        } else {
            trigger();
        }
    };

    useEffect(() => {
        if (smartLink1 && !showSmartLink && _get(state, 'campaignId', 0) > 0 ) {
            getSmartLink();
        }
    }, [showSmartLink ,state]);


    const appAnalyticsContextValue = {
        setShowWFTM: () => {},
        handleEditEvent: () => {},
        waMode: appMode,
        formListLoader,
        goalTypeLoader,
    };

    return (
        <webAnalyticsContext.Provider value={appAnalyticsContextValue}>
        <AuthoringChannelEditSkeletonGate channelId={16} isLoading={showEditSkeleton && (checkSave || isSavedChannel)}>
        <FormProvider {...methods}>
            <form
                onSubmit={handleSubmit((formState) => formSubmitHandler(formState, 'form'))}
                className="rsv-tabs-content tab-content position-relative"
            >
                <div className={`box-design bd-top-border ${checkTrigger(state?.campaignType, state?.endDate)
                        ? 'pe-none click-off'
                        : !statusIdCheck(state?.statusId)
                            ? 'pe-none click-off'
                            : ''
                    }`}>
                    {isSmartLink && (
                        <SmartLinkEnable
                            secondaryButton={false}
                            onSave={() => setIsSmartLink(false)}
                            onReject={() => {
                                dispatch(showTabsSmartlink(true));
                                setIsSmartLink(false);
                            }}
                            ignoreButton
                            onIgnore={() => {handleNavigation()}}
                        />
                    )}
                    <div className="form-group mt20">
                        <Row>
                            <Col sm={{ offset: 1, span: 2 }} className="pr0">
                                <label className="control-label-left">{ANALYTIC_PLATFORM}</label>
                            </Col>
                            <Col sm={6}>
                                <RSKendoDropDownList
                                    control={control}
                                    name={'analyticsPlatform'}
                                    label={ANALYTIC_PLATFORM}
                                    required
                                    isLoading={analyticsListLoader.isLoading}
                                    data={appAnalytics?.mobileAppDomains}
                                    textField={'analyticsDomainName'}
                                    dataItemKey={'analyticsDomainId'}
                                    rules={{
                                        required: SELECT_ANALYTICS_PLATFORM,
                                    }}
                                />
                            </Col>
                        </Row>
                    </div>
                    {!!analyticsPlatform && (
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
                                            if (e?.target?.checked) {
                                                getGoalType('E');
                                                setDefaultTab(0);
                                            } else {
                                                // Only switch to conversion tab if conversion is enabled
                                                if (goalConversion) {
                                                    setDefaultTab(1);
                                                }
                                            }
                                            if (!e?.target?.checked)
                                                setContentTypes({
                                                    engagement: [],
                                                    conversion: [],
                                                });
                                            setGoalDefault((prev) => ({
                                                ...prev,
                                                isEngagement: e?.target?.checked,
                                            }));
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
                                            if (e?.target?.checked) {
                                                getGoalType('C');
                                                setDefaultTab(1);
                                            } else {
                                                // Only switch to engagement tab if engagement is enabled
                                                if (goalEngagement) {
                                                    setDefaultTab(0);
                                                }
                                            }
                                            setGoalDefault((prev) => ({
                                                ...prev,
                                                isConverison: e?.target?.checked,
                                            }));
                                        }}
                                    />
                                </Col>
                            </Row>
                        </div>
                    )}

                    {/* {(isEngagement || isConverison) && edit?.smartLink1?.length > 0 && (
                        <div>
                            <RSTabber
                                dynamicTab={`res-content-tabs-split`}
                                activeClass={`active`}
                                defaultTab={0}
                                tabData={appGoalListTemp}
                            />
                        </div>
                    )} */}
                    {!!analyticsPlatform && (goalEngagement || goalConversion) && (
                        <div className="no-scroll-rs-content-tabs">
                        <RSTabber
                            // className="rs-tabs row"
                            // defaultClass={`col-md-6 `}
                            dynamicTab={`res-content-tabs-split`}
                            activeClass={`active`}
                            //heading={deliveryType}
                            // heading={''}
                            flatTabs
                            componentClassName={'mt41 w-100'}
                            // refresh
                            noMarginLeftRight
                            // isRefreshConfirmation={true}
                            // defaultTab={goalEngagement ? 0 : goalConversion ? 1 : undefined}
                            defaultTab={defaultTab}
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
                                            // conversionData={conversionData}
                                            goal={goal}
                                            url={domain}
                                            isAppAnalytics={true}
                                            contentTypes={contentTypes}
                                            setContentTypes={setContentTypes}
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
                                            // conversionData={conversionData}
                                            goal={goal}
                                            isAppAnalytics={true}
                                            url={domain}
                                            contentTypes={contentTypes}
                                            setContentTypes={setContentTypes}
                                        />
                                    ),
                                    disable: !goalConversion,

                                    // disable: type,
                                },
                            ]}
                            callBack={(data, tabIndex) => {
                                // console.log('Data :::: ', data, tabIndex);
                                setDefaultTab(tabIndex);
                            }}
                        />
                        </div>
                    )}
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
                        }}
                    >
                        {CANCEL}
                    </RSSecondaryButton>
                    <RSSecondaryButton
                        onClick={() => {
                            handleSubmit((data) => formSubmitHandler(data, 'save'))();
                        }}
                        className="color-primary-blue"
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
                    >
                        {NEXT}
                    </RSPrimaryButton>
                </div>
            </form>

            <RSConfirmationModal
                show={navigate_confirm}
                text={IGNORE_CHANNEL}
                primaryButtonText={OK}
                handleClose={() => {
                    setNavigate_confirm(false);
                }}
                handleConfirm={() => {
                    handleNavigation();
                    setNavigate_confirm(false);
                }}
            />
        </FormProvider>
        </AuthoringChannelEditSkeletonGate>
        </webAnalyticsContext.Provider>
    );
};

export default AppAnalytics;
