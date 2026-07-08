import { UpdateState } from 'Utils/modules/misc';
import { campaignSchedule, checkRFAApproved, checkTrigger, diff_minutes, statusIdCheck, validateRFAMandatory } from 'Utils/modules/campaignUtils';
import { convertUserTimezoneToTarget, getYYMMDD } from 'Utils/modules/dateTime';
import { checkScheduleDate } from 'Utils/modules/display';
import { getmasterData } from 'Utils/modules/masterData';
import { encodeUrl, getUserDetails } from 'Utils/modules/crypto';
import { getEnvironment } from 'Utils/modules/environment';
import { numberWithCommas } from 'Utils/modules/formatters';
import { createCommunicationSettingsNavState, NOTIFICATION_TAB_ID } from 'Utils/modules/navigation';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { AUDIENCE_TOOLTIP_TEXT, buildInPageSplitInitFromForm, buildPayload, CAUROSEL_NAME, DELIVERY_TYPE, FORM_INITIAL_STATE, getCreateContentRenderConfig, getEditFormData, getNotificationContentClickOffClass, getSplitImportValidationError, getSplitTabKeysForValidation, handleFieldValueCheck, hasWebImportFileContent, IN_PAGE_SPLIT_CONTENT_DEFAULTS, INITIAL_CAROUSEL_STATE, INITIAL_SPLIT_AB_STATE, isInPageBannerSelected, isNotificationContentVisible, LAYOUT_POSITION, MODAL_POSISTION, refreshFieldsOnSplitAB, refreshLayoutPosition, shouldEnableSplitSize, shouldShowSplitABSwitch, splitObj, WATCHLIST } from './constant';
import { COMMUNICATION_URL, ENTER_COMUNICATION_TEXT, ENTER_HASHTAG, ENTER_INBOX_CLASSIFICATION, SELECT_DELIVERYTYPE, SELECT_INBOX_CLASSIFICATION, SELECT_LAYOUT_POSITION, SELECT_POSITION, SELECT_WEB_URL } from 'Constants/GlobalConstant/ValidationMessage';
import { ADD_DOMAIN, ADJUST_SPLIT_SIZE, ARE_YOU_SURE_WANT_TO_RESET, AUDIENCE, AUDIENCE_CHANGE_CONFIRMATION, AUDIENCE_COUNT_ZERO_ENABLE_AUTO_REFRESH, AUTO_REFRESH, AUTO_REFRESH_POP_HOVER_TEXT, AUTO_SCHEDULE, AUTO_SCHEDULE_SPLITS, CANCEL, CHECK_START_DATE_AND_END_DATE, CLOSE, COMMUNICATION_LIST_SCREEN, COMMUNICATION_SCHEDULED, IGNORE_CHANNEL, INBOX_CLASSIFICATION, INBOX_CLASSIFICATION_NAME, LAYOUT, LAYOUT_POSITION as LAYOUT_POSITION_PH, MINIMUM_DIFFERENCE_SPLITS, NEXT, OK, POSITION, RESET, RESET_DOMAIN, SAVE, SELECT_A_FILE_TO_PROCEED, SELECT_CONTENT_PROCEED, SELECT_DATE_TIME, SELECT_SCHEDULE_TIME, SPLIT_AB_TEST_REQUIRES, SPLIT_AB_TEST_TEXT, SPLIT_AB_TURNOFF, TEST_PREVIEW_SENT, UPLOAD_MEDIA, WARNING, YES } from 'Constants/GlobalConstant/Placeholders';
import { adjust_split_medium, circle_minus_fill_medium, circle_plus_fill_medium, circle_plus_medium, circle_question_mark_medium, circle_question_mark_mini, close_medium, close_mini, restart_medium, save_mini, shield_medium, shield_tick_medium, timer_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { map as _map, get as _get, find as _find, forEach as _forEach, cloneDeep as _cloneDeep, isEmpty as _isEmpty } from 'Utils/modules/lodashReplacements';
import { Row, Col } from 'react-bootstrap';
import { useForm, FormProvider } from 'react-hook-form';

import NotificationProvider from './context';
import RSTooltip from 'Components/RSTooltip';
import RSSwitch from 'Components/FormFields/RSSwitch';
import RSPPophover from 'Components/RSPPophover';
import RSTabbar from 'Components/RSTabber';
import SplitAB from './Component/SplitAB/SplitAB';
import RSConfirmationModal from 'Components/ConfirmationModal';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import SplitABScheduleModal from '../../Component/SplitABScheduleModal';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSDropdownFooterBtn from 'Components/DropdownFooterBtn';
import SplitSlider from '../../Component/SplitSlider/SplitSlider';
import useQueryParams from 'Hooks/useQueryParams';
import useApiLoader from 'Hooks/useApiLoader';
import SmartLinkEnable from '../../Component/SmartLinkEnable/SmartLinkEnable';
import AuthoringChannelEditSkeletonGate, {
    getAuthoringEditFieldLoaderConfig,
    getAuthoringSaveButtonType,
    useAuthoringChannelEditLoader,
    useAuthoringChannelSaveLoader,
} from 'Components/Skeleton/pages/communication/authoring';


import {
    availableTabs,
    communicationChannels,
    debouncedHandleAudienceWebMobileFilterChange,
    handleAutoRefreshClickOff,
    SPLIT_AB_NAME,
    handlePersonalizationFetchApiCall,
    getNextEligibleTabIndex,
    NOTIFICATION_TAB_CHANNEL_MAP,
    calculateDefaultSplittedCount,
    sumAudienceRecipientCount,
    AudienceFieldRenderComponent,
    handleMDCQueryParamsUpdate,
    handleCheckCTGT,
    handleCGTGModalCheck,
    validateAudienceCount,
    mergeChannelAudiences,
    getContentSetupStatus,
    COMMUNICATION_CHANNEL_ID,
    hasTemplateTabContent,
    handleTotalAudienceCount,
    getPastPlanDurationBlockedState,
    validatePastPlanDurationOnSubmit,
    PAST_PLAN_DURATION_CLICK_OFF_CLASS,
    shouldPromptSkipChannelConfirmation,
} from '../../constant';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { refreshFields } from './constant';
import { useDispatch, useSelector } from 'react-redux';
import {
    updateNotificationWeb,
    updateVerticalTab,
    updateTab,
    updateDirtyState,
    resetCreateCommunication,
    updateTotalAudienceCount,
} from 'Reducers/communication/createCommunication/Create/reducer';
import { getSmartUrl } from 'Reducers/communication/createCommunication/smartlink/request';
import { getRequestApprovalList, getSessionId, getUtcTimeData } from 'Reducers/globalState/selector';
import { updateSmartLinkShow } from 'Reducers/communication/createCommunication/execute/reducer';
import { getGeneratedLink, getMobileAppId, getSmartLinksListWithLabels, selectIsSmartLinkFetchResolved } from 'Reducers/communication/createCommunication/smartlink/selectors';
import {
    getAudioListByApp,
    getInboxClassification,
    getNotificationWebPush,
    getRecipientForNotification,
    getWebPushById,
    saveWebPush,
} from 'Reducers/communication/createCommunication/Create/request';
import { updateChannelAudiences } from 'Reducers/communication/createCommunication/plan/reducer';
import { useNavigate } from 'react-router-dom';
import { getUserListCampaign, getUtcTimeNow } from 'Reducers/globalState/request';
import { showTabsSmartlink } from 'Reducers/communication/createCommunication/smartlink/reducer';
import CommunicationSent from '../../Component/CommunicationSent/CommunicationSent';
import RSInput from 'Components/FormFields/RSInput';
import RequestApproval from 'Pages/AuthenticationModule/Components/RequestApproval/RequestApproval';
import InpageContainer from './Component/InPageContainer/InPageContainer';
import { getSplitIndex } from '../Email/Component/Template/constant';

const Notification = ({ type = 'web', mCampType }) => {
    const tabberRef = useRef();
    const audienceRef = useRef();
    const methods = useForm(FORM_INITIAL_STATE);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const approvalList = useSelector((state) => getRequestApprovalList(state));

    const [mdcContentSetupDetails, setMdcContentSetupDetails] = useState({});
    const [levelNumber, setLevelNumber] = useState(1);
    const [actionId, setActionId] = useState(0);
    const [mdcChannelDetailId, setMdcChannelDetailId] = useState(0);
    const [mdcAudience, setMdcAudience] = useState([]);
    const [dataSource, setDataSource] = useState('TL');
    const [notificationEditData, setNotificationEditData] = useState({});
    const [isCommunicationEditable, setIsCommunicationEditable] = useState(true);
    const isAlReadyCalled = useRef(false);
    const [domainState, setDomainState] = useState({
        loading: false,
        isValid: false,
    });
    const [isAudienceChangeConfirm, setIsAudienceChangeConfirm] = useState(false);
    const [previousAudience, setPreviousAudience] = useState([]);
    const [nextButtonCGTGModal, setNextButtonCGTGModal] = useState(false);
    const [pendingNextSubmitParams, setPendingNextSubmitParams] = useState(null);
    const [audienceCountZeroWarning, setAudienceCountZeroWarning] = useState(false);
    const location = useQueryParams('/communication');
    const params = new URLSearchParams(window.location.search);
    const channelId = params.get('channelId');
    const [saveCampaigData, setSaveCampaigData] = useState(null);

    const webDomainLoader = useApiLoader();
    const audienceLoader = useApiLoader();
    const inboxClassificationLoader = useApiLoader();

    //    const { verticalTab } = useSelector((createCommunicationReducer) => createCommunicationReducer);
    const {
        notification,
        tabsState: { notification: notificationTabState },
        activeTabs,
        verticalTab: { type: channelType, currentTab },
        isDirty,
        isMDCEditMode,
        personalization,
        listTypeWisePersonlization,
    } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    // console.log('verticalTab:::::: ', verticalTab);

    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const utcTimeData = useSelector(getUtcTimeData);
    const { smartLink1, smartLink2 } = useSelector((state) => getGeneratedLink(state));
    const { showSmartLink } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const { savedChannelsId, channelAudiences = {} } = useSelector(({ communicationPlanReducer }) => communicationPlanReducer);
    const formTypeRef = useRef(null);

    const smartLink = useSelector((state) => getGeneratedLink(state));
    const { failureApiErrors, isCurrentBURFAStatus } = useSelector(({ globalstate }) => globalstate);
    const [isWPFail, setIsWPFail] = useState(false);
    const smartLinksWithLabels = useSelector((state) => getSmartLinksListWithLabels(state));
    const mobileAppId = useSelector((state) => getMobileAppId(state));
    const isSmartLinkFetchResolved = useSelector(selectIsSmartLinkFetchResolved);

    const { timeZoneList } = getmasterData();
    const { timeZoneId } = getUserDetails();
    const timeZone = _find(timeZoneList, ['timeZoneID', timeZoneId]);

    const {
        control,
        watch,
        setError,
        trigger,
        setFocus,
        setValue,
        formState: { errors, dirtyFields, isValid },
        resetField,
        handleSubmit,
        reset,
        getValues,
        clearErrors,
        unregister,
    } = methods;

    let [
        sendwebPushTo,
        deliveryType,
        layoutPosition,
        audience,
        splitTest,
        inboxClassification,
        approvalListName,
        mobileApp,
        domain,
        newInbox,
        isAutoRefereshenabled,
        position,
        inPageBanner,
        watchTotalAudience
    ] = watch(WATCHLIST);


    // console.log('audience: ', audience);

    const [navigate_confirm, setNavigate_confirm] = useState(false);

    const dirty = { ...dirtyFields };
    const [isSecureMessage, setSecureMessages] = useState(false);
    const [dirtyReset, setDirtyReset] = useState(false);

    const [splitTabs, setSplitTabs] = useState(INITIAL_SPLIT_AB_STATE(setDirtyReset));
    const [scheduleModal, setShowScheduleModal] = useState(false);
    const [modal, setModal] = useState({
        isRefresh: false,
        scheduleConfirmModal: false,
        sendConfirmModal: false,
        testSentCommunicationModal: false,
        status: '',
        isRFA: false,
    });
    const [isSaved, setIsSaved] = useState(false);
    const rfaAutoNavTimeoutRef = useRef(null);
    const rfaManuallyClosedRef = useRef(false);

    const [sliderState, setSliderState] = useState({
        show: false,
        splittedCount: {},
    });
    const [domainURLNew, setDomainURLNew] = useState(false);
    const [saveTypeTerm, setSaveTypeTerm] = useState('');
    const [isEdit, setIsEdit] = useState(false);
    const [clickOff, setClickOff] = useState(true);
    const [emptySplitdate, setEmptySplitDate] = useState({
        text: '',
    });
    const [disableNext, setDisableNext] = useState(true);
    const scheduleTimezone = watch('timezone');
    const isPastPlanDurationBlocked = useMemo(() => {
        if (levelNumber >= 2 || location?.campaignType === 'T') return false;
        return getPastPlanDurationBlockedState({
            location,
            timezone: scheduleTimezone,
            currentUtcTime: utcTimeData?.utcTime,
        });
    }, [
        levelNumber,
        location?.campaignType,
        location?.startDate,
        location?.endDate,
        scheduleTimezone?.gmtOffset,
        utcTimeData?.utcTime,
    ]);
    const [editAutoScheduleDetails, setEditAutoScheduleDetails] = useState({});
    const [calucateAudienceCount, setCalucateAudienceCount] = useState(0);
    const getAlertSoundValues = async (mobile) => {
        const payload = {
            departmentId,
            userId,
            clientId,
            appId: mobile?.appGuId,
        };
        const res = await dispatch(getAudioListByApp({ payload, loading: false }));
        if (res?.status) {
            // setAudioList(res?.data);
            return res?.data;
        } else return [];
    };

    /**
     * Get timezone-adjusted start and end dates for schedule validation
     * @param {string} fieldName - Field name for split tabs (e.g., 'split1') or null for regular campaign
     * @param {Object} customTimezone - Custom timezone object with gmtOffset property
     * @returns {Object} - { adjustedStartDate, adjustedEndDate } in YYYY-MM-DD format
     */
    const getTimezoneAdjustedDateRange = (fieldName = null, customTimezone = null) => {
        const formValues = getValues();
        let selectedTimezone;

        if (customTimezone) {
            // Use custom timezone if provided
            selectedTimezone = customTimezone;
        } else if (fieldName) {
            // For split AB tabs, get timezone from the specific field
            selectedTimezone = formValues[fieldName]?.timezone;
        } else {
            // For regular campaign, get timezone from main form
            selectedTimezone = formValues.timezone;
        }

        // If no timezone is selected, use original dates
        if (!selectedTimezone?.gmtOffset) {
            return {
                adjustedStartDate: location?.startDate,
                adjustedEndDate: location?.endDate,
            };
        }

        // Get user profile timezone
        const { timeZoneId } = getUserDetails();
        const { timeZoneList } = getmasterData();
        const profileTimezone = _find(timeZoneList, ['timeZoneID', timeZoneId]);

        // If no profile timezone found, use original dates
        if (!profileTimezone?.gmtOffset) {
            return {
                adjustedStartDate: location?.startDate,
                adjustedEndDate: location?.endDate,
            };
        }

        // Convert original start and end dates from profile timezone to selected timezone
        const originalStartDate = new Date(location?.startDate);
        const originalEndDate = new Date(location?.endDate);

        const adjustedStartDate = convertUserTimezoneToTarget(
            originalStartDate,
            profileTimezone.gmtOffset,
            selectedTimezone.gmtOffset,
            false,
        );

        const adjustedEndDate = convertUserTimezoneToTarget(
            originalEndDate,
            profileTimezone.gmtOffset,
            selectedTimezone.gmtOffset,
            false,
        );

        return {
            adjustedStartDate: getYYMMDD(adjustedStartDate),
            adjustedEndDate: getYYMMDD(adjustedEndDate),
        };
    };

    const [tabs, setTabs] = useState({
        currentTab: 0,
        splitTabsList: ['splitA', 'splitB'],
        confirmationModal: false,
    });
    useEffect(() => {
        setValue('splitTabList', tabs?.splitTabsList || ['splitA', 'splitB']);
    }, [tabs?.splitTabsList, watch('splitTest')]);
    const [mobileAppIdState, setMobileAppIdState] = useState('');

    const contentSetupWatchFields = watch([
        'currentTabIndex',
        'contentInput',
        'importUrl',
        'edmContent',
        'zipFileText',
        'templateContent',
        'currentSplitTab',
        'splitA',
        'splitB',
        'splitC',
        'splitD',
    ]);

    const isLayoutPositionModal = layoutPosition?.value === 'Modal' || layoutPosition?.value === 'Carousel';
    const isLayoutCarousel = layoutPosition?.value === 'Carousel';
    const isDeliverTypeOverlay = deliveryType?.value === 'In-page overlay';
    const isTemplateFlow = !!location?.templateId && location?.templateChannelId === 8;
    const checkSave =
        (savedChannelsId[8]?.includes(8) ||
            (location?.templateId && (location?.templateChannelId === 8 || location?.templateChannelId === 14)) ||
            (location?.isSavedWebPushChannel && location?.fromSource === 'communication')) ??
        false;
    const { showEditSkeleton, isSavedChannel, runEditFetch, finishEditSkeleton } = useAuthoringChannelEditLoader({
        channelId: 8,
        subChannelId: 8,
        shouldLoadEdit: checkSave || isMDCEditMode === 'edit' || isTemplateFlow || mCampType === 'M',
    });
    const editFieldLoaderConfig = getAuthoringEditFieldLoaderConfig({
        showEditSkeleton,
        mCampType,
        savedChannel: isSavedChannel,
    });
    const { runSave, beginSubmit, endSubmit, isSaveLoading, isNextLoading, isSendLoading, isSubmitting } =
        useAuthoringChannelSaveLoader();

    const isContentSetupForRfa = useMemo(() => {
        const formValsForContent = getValues();
        const splitTabListForRfa =
            formValsForContent.splitTabList?.length > 0
                ? formValsForContent.splitTabList
                : tabs?.splitTabsList || ['splitA', 'splitB'];
        const isSplitContentMode =
            !!formValsForContent.splitTest || formValsForContent?.layoutPosition?.value === 'Carousel';
        const splitIdxForRfa = tabs?.currentTab ?? formValsForContent.currentSplitTab ?? 0;
        const rfaContentFieldName = isSplitContentMode
            ? splitTabListForRfa?.[splitIdxForRfa] ?? splitTabListForRfa?.[0] ?? 'splitA'
            : '';
        return getContentSetupStatus(formValsForContent, rfaContentFieldName, {
            channelId: COMMUNICATION_CHANNEL_ID.WEB_NOTIFICATION,
            splitTabList: splitTabListForRfa,
        });
    }, [contentSetupWatchFields, tabs?.currentTab, tabs?.splitTabsList, getValues]);

    const bannerName = notification?.web?.inPageBanner?.bannerName;
    const bannerId = notification?.web?.inPageBanner?.bannerId;
    const isInPageBannerReady = isInPageBannerSelected(inPageBanner);
    const isNotificationContentShown = isNotificationContentVisible({
        deliveryType,
        inPageBanner,
    });
    const contentClickOffClass = getNotificationContentClickOffClass({
        deliveryType,
        layoutPosition,
        isTemplateFlow,
    });
    const isBannerSelected =
        deliveryType?.id !== 5 || isInPageBannerReady;
    useEffect(() => {
        if (deliveryType?.id === 5) {
            return;
        }

        const hasBanner = !!(bannerId || isBannerSelected);
        if (hasBanner) {
            const emptyBanner = { bannerId: '', bannerName: '' };
            setValue('inPageBanner', null);
            dispatch(updateNotificationWeb({ field: 'inPageBanner', data: emptyBanner }));
        }
    }, [bannerId, dispatch, deliveryType, isBannerSelected, setValue]);

    useEffect(() => {
        if (deliveryType?.id === 5) {
            // Automatically check Request for approval checkbox when deliveryType.id === 5
            setValue('approvalList.requestApproval', true);
            const nameArray = getValues('approvalList.name');
            if (!nameArray || !Array.isArray(nameArray) || nameArray.length === 0) {
                setValue('approvalList.name', [{ approverName: '', mandatory: false }]);
            }
        }
    }, [deliveryType?.id, setValue, getValues]);

    if (_get(location, 'campaignType', 'S') === 'M') {
        audience = mdcAudience;
    }
    useEffect(() => {

        let totalCount = 0;

        if (_get(location, 'campaignType', 'S') === 'M') {
            const audienceList = notification?.web?.audienceList || [];

            const filteredArr = audienceList.filter((item) =>
                location?.selectedSegementIds?.includes(item?.segmentationListId),
            );

            totalCount = filteredArr.reduce((total, audienceItem) => {
                return total + (audienceItem?.recipientCountWebPush || 0);
            }, 0);

        } else {
            totalCount =
                audience && audience?.reduce(
                    (prev, cur) =>
                        Number(prev) + Number(cur?.recipientCountWebPush),
                    0,
                ) || 0;
        }

        setCalucateAudienceCount(totalCount);
    }, [audience, domain, location?.campaignType, location?.selectedSegementIds, notification]);

    const isSplitABEnable = deliveryType?.id === 5 ? true : !isNaN(calucateAudienceCount) ? calucateAudienceCount >= 100 : true; // && !Object.hasOwn(errors, 'audience');
    const isSplitSizeEnable = shouldEnableSplitSize({
        deliveryTypeId: deliveryType?.id,
        audienceCount: calucateAudienceCount,
    });

    useEffect(() => {
        dispatch(updateTotalAudienceCount(calucateAudienceCount || 0));
    }, [calucateAudienceCount, dispatch]);

    useEffect(() => {
        if (!splitTest) {
            return;
        }
        const splitTabList = getValues('splitTabList');
        const resolvedSplitTabs =
            Array.isArray(splitTabList) && splitTabList.length > 0 ? splitTabList : tabs?.splitTabsList;
        if (!resolvedSplitTabs || resolvedSplitTabs.length < 2) {
            return;
        }
        if (calucateAudienceCount > 0) {
            const defaultSplittedCount = calculateDefaultSplittedCount(
                resolvedSplitTabs.length,
                calucateAudienceCount,
                resolvedSplitTabs,
            );
            setSliderState((prev) => ({
                ...prev,
                splittedCount: defaultSplittedCount,
            }));
            setValue('sliderSplitter', defaultSplittedCount);
        } else {
            setValue('sliderSplitter', {});
            setSliderState((prev) => ({
                ...prev,
                splittedCount: {},
            }));
        }
    }, [calucateAudienceCount, splitTest, tabs?.splitTabsList]);

    useEffect(() => {
        if (!isSplitABEnable && (splitTest || isLayoutCarousel)) {
            disableSplitTabs();
        }
    }, [isSplitABEnable]);

    useEffect(() => {
        if (!isSplitSizeEnable) {
            setSliderState((prev) => (prev.show ? { ...prev, show: false } : prev));
        }
    }, [isSplitSizeEnable]);

    useEffect(() => {
        let rslt = statusIdCheck(
            notificationEditData?.content?.[0]?.statusId || null,
            location?.campaignType,
            notificationEditData,
        );
        setIsCommunicationEditable(rslt);
        const checkRFAClickOff = checkRFAApproved(
            Object.keys(notificationEditData)?.length > 1 ? notificationEditData?.content?.[0]?.statusId : null,
            notificationEditData?.requestForApproval?.approvarList,
        );
        if (checkRFAClickOff) setIsCommunicationEditable(false);
    }, [notificationEditData, location?.statusId]);
    const getSmartLink = async () => {
        const payload = { clientId, departmentId, userId, campaignId: _get(location, 'campaignId', 0) };
        const res = await dispatch(getSmartUrl({ payload, reduceLoad: true }));
        if (!res?.status) {
            dispatch(updateSmartLinkShow(false));
            return '';
        }
        const temp = res?.data?.map((item) => {
            return JSON.parse(item?.smartAppStoreUrl)?.[1]?.MobileApp;
        });
        setMobileAppIdState(temp?.[0]);
        dispatch(updateSmartLinkShow(true));
        return temp?.[0];
    };

    // useEffect(() => {
    //     // while (true) {
    //     debugger;

    //     console.log('location@@@: ', location);
    //     if (!smartLink1 || !showSmartLink) {
    //         if (location && _get(location, 'campaignId', 0) > 0) {
    //             getSmartLink();
    //         }
    //     }
    //     // }
    // }, [location, smartLink1, showSmartLink]);

    useEffect(() => {
        const checkSave = (savedChannelsId[8]?.includes(8) || savedChannelsId[14]?.includes(14)) ?? false;

        if (checkSave) {
            setIsSaved(true);
        } else {
            const checkReducerSave = savedChannelsId[8]?.includes(8) ?? false;
            if (checkReducerSave) {
                setIsSaved(true);
            } else {
                setIsSaved(false);
            }
        }
    }, [savedChannelsId?.[8]]);

    useEffect(() => {
        if (location && Object.keys(location)?.length) {
            /* MDC variables start*/

            const mdcContentSetupDetails = _get(location, 'mdcContentSetupDetails', {});
            const levelNumber = _get(mdcContentSetupDetails, 'levelNumber', 1);
            const actionId = _get(mdcContentSetupDetails, 'actionId', 0);
            const mdcChannelDetailId = _get(mdcContentSetupDetails, 'channelDetailId', 0);
            const mdcAudience = _get(mdcContentSetupDetails, 'audience', []);
            const dataSource = _get(mdcContentSetupDetails, 'dataSource', 'TL');
            const mdcIsCGTGEnabled = _get(mdcContentSetupDetails, 'isCGTGEnabled', false);
            setMdcContentSetupDetails(mdcContentSetupDetails);
            setLevelNumber(levelNumber);
            setActionId(actionId);
            setMdcChannelDetailId(mdcChannelDetailId);
            setMdcAudience(mdcAudience);
            setDataSource(dataSource);

            // For MDC create mode (no channelDetailId), set isCGTGEnabled from mdcContentSetupDetails
            if (location?.campaignType === 'M' && !mdcChannelDetailId) {
                setValue('isCGTGEnabled', mdcIsCGTGEnabled);
            }
            /* MDC variables end*/
        }
    }, [location]);
    const value = useMemo(
        () => ({
            type,
        }),
        [type],
    );

    useEffect(() => {
        if (!isDirty && Object.keys(dirtyFields)?.length > 0) {
            dispatch(updateDirtyState(true));
        } else if (isDirty && Object.keys(dirtyFields)?.length === 0) {
            dispatch(updateDirtyState(false));
        }
    }, [dirty]);

    const handleAudienceResetInMDC = (audienceList) => {
        if (_get(location, 'campaignType', 'S') === 'M') {
            const filteredArr = audienceList?.filter((item) =>
                location?.selectedSegementIds?.includes(item?.segmentationListId),
            );
            if (filteredArr?.length) {
                setValue('audience', filteredArr)
            }
        }
    }

    useEffect(() => {
        // debugger;
        if (!_isEmpty(notification[type]?.result)) {
            const formState = notification[type]?.result;
            const { sliderData, isSecureMessage, splitTabsConfig } = formState;
            const isLayoutCarousel = formState.layoutPosition === 'Carousel';
            if (formState.splitTest || isLayoutCarousel) {
                const temp = splitTabsConfig?.splitTabsList.map((_, index) => {
                    const getSplitName = isLayoutCarousel ? CAUROSEL_NAME[index] : SPLIT_AB_NAME[index];
                    delete getSplitName.add;
                    return {
                        ...getSplitName,
                        component: () => (
                            <SplitAB
                                fieldName={_}
                                key={getSplitName?.id}
                                index={index}
                                isSplit={true}
                                campaignType={location?.campaignType}
                                setDirtyReset={setDirtyReset}
                            />
                        ),
                    };
                });
                if (temp?.length === 2 || temp?.length === 3) temp[temp?.length - 1].add = circle_plus_medium;
                setSplitTabs(temp);
            }
            setSliderState((prev) => ({ ...prev, splittedCount: sliderData }));
            setSecureMessages(isSecureMessage);
            setTabs(splitTabsConfig);
            reset(formState?.result);
        } else {
            reset(_cloneDeep(FORM_INITIAL_STATE.defaultValues));
            setSliderState({ show: false, splittedCount: {} });
            setSecureMessages(false);
            setTabs({
                currentTab: 0,
                splitTabsList: ['splitA', 'splitB'],
                confirmationModal: false,
            });
            setSplitTabs([...INITIAL_SPLIT_AB_STATE(setDirtyReset)]);
        }
        setDirtyReset(false);
    }, [type]);

    const getAudienceData = async (domain, segmentIDs, fromDomainChange = false) => {
        if (domain?.domainUrl) {
            const payload = {
                userId,
                clientId,
                departmentId,
                searchText: '',
                channelType: 'WN',
                campaignType: _get(location, 'campaignType', 'S'),
                domainURL: domain?.domainUrl,
                appGuId: '',
                segmentIds: segmentIDs ? segmentIDs : [],
            };
            const savedChannel = savedChannelsId[8]?.includes(8) ? true : false;
            const res = await audienceLoader.refetch({
                fetcher: ({ payload: audPayload, fromDomainChange: fromDomChg = false } = {}) =>
                    dispatch(
                        getRecipientForNotification({
                            payload: audPayload,
                            fromDomainChange: fromDomChg,
                            loading: false,
                        }),
                    ),
                mode: savedChannel ? 'edit' : 'create',
                loaderConfig: editFieldLoaderConfig,
                params: { payload, fromDomainChange },
            });
            if (res?.status) {
                setValue('audience', '');
                handleAudienceResetInMDC(res?.data)
                return res?.data;
            }
        }
    };

    const getInboxClassificationData = async (data, newName, edit) => {
        let result =
            notification?.web?.inboxClassifications === undefined ||
            notification?.web?.inboxClassifications?.length === 0;
        if (result || !!newName || !!edit || isDomainChange) {
            var tempDomain;
            if (edit === true) {
                tempDomain = domain;
            } else if (data === undefined) {
                tempDomain = domain;
            }
            const payload = {
                userId,
                clientId,
                departmentId,
                searchText: '',
                channelType: 'WN',
                domainURL: tempDomain?.domainUrl,
                appGuId: '',
                classificationName: !!newName ? newName : '',
                isInsertclassificationName: edit === 'save' ? true : false,
            };
            setDomainState({
                isValid: false,
                loading: false,
            });
            const savedChannel = savedChannelsId[8]?.includes(8) ? true : false;
            const res = await inboxClassificationLoader.refetch({
                fetcher: ({ payload: inboxPayload, edit: inboxEdit } = {}) =>
                    dispatch(
                        getInboxClassification({
                            payload: inboxPayload,
                            edit: inboxEdit,
                            loading: false,
                        }),
                    ),
                mode: savedChannel ? 'edit' : 'create',
                loaderConfig: editFieldLoaderConfig,
                params: {
                    payload,
                    edit: edit !== 'submit save' ? edit : undefined,
                },
            });
            if (res?.status) {
                if (!!newName && res?.message !== 'Classification name inserted successfully') {
                    setError('newInboxName', {
                        type: 'custom',
                        message: INBOX_CLASSIFICATION_NAME,
                    });
                    setClickOff(true);
                    setDomainState({
                        isValid: false,
                        loading: false,
                    });
                } else if (res?.message === 'Classification name inserted successfully') {
                    // dispatch(updateNotificationWeb({ data: res?.data, field: 'inboxClassifications' }));
                    setValue('newInbox', false);
                    setValue('newInboxName', '');
                    const latestClassifications = await getInboxClassificationData(undefined, undefined, 'submit save');
                    const selectedClassification = (latestClassifications || []).find(
                        (item) => item?.classificationId === newName,
                    );
                    if (selectedClassification) {
                        setValue('inboxClassification', selectedClassification);
                    }
                    clearErrors('newInboxName');
                    // return res?.data;
                    setDomainState({
                        isValid: true,
                        loading: false,
                    });
                } else if (edit !== 'save') return res?.data;
            } else {
                const isDuplicateClassificationName =
                    String(res?.message || '').toLowerCase() === 'classification name already exists';
                if (
                    res?.message !== 'Classification Name is not exist' &&
                    res?.message !== 'GetInBoxClassifications is not available'
                )
                    setError('newInboxName', {
                        type: 'custom',
                        message: res?.message,
                    });
                setClickOff(isDuplicateClassificationName ? true : false);
                setDomainState({
                    isValid: false,
                    loading: false,
                });
            }
        } else {
            return notification?.web?.inboxClassifications;
            setDomainState({
                isValid: false,
                loading: false,
            });
        }
    };

    const getUpdatedData = async (WebNotificationChannelDetailId = 0, callType = 'edit', formState) => {
        isAlReadyCalled.current = true;
        let campaignId = _get(location, 'campaignId', 0);
        if (!campaignId) return;
        try {
            const payloadEdit = {
                userId,
                clientId,
                departmentId,
                campaignId: campaignId,
                levelNumber: _get(location, 'mdcContentSetupDetails.levelNumber', 1),
                actionId: _get(location, 'mdcContentSetupDetails.actionId', 0),
                webNotifyChannelId:
                    _get(location, 'mdcContentSetupDetails.channelDetailId', _get(location, 'channelDetailId', 0)) || WebNotificationChannelDetailId,
            };
            const res = await runEditFetch(
                () => dispatch(getWebPushById({ payload: payloadEdit, loading: false })),
                { releaseAfterFetch: false },
            );
            if (res?.status) {
                setNotificationEditData(res?.data);
                var users = approvalList?.length > 0 ? approvalList : await getUsersList();
                // console.log('Users length :::::::::::::::::::::::::::::::::: ', users);

                // console.log('Status ::::::::::::::::::::: ', users);
                let tempEdit = await getEditFormData(
                    res?.data,
                    getAudienceData,
                    handleSendPushTo,
                    getInboxClassificationData,
                    updateTabState,
                    users,
                    notification?.web?.inboxClassifications,
                    smartLinksWithLabels,
                    notification?.web?.audienceList,
                    setDirtyReset,
                    setEditAutoScheduleDetails,
                );
                setSecureMessages(res?.data?.isSecureMessageON);
                //let schedulee;
                let newValues = { ...tempEdit };
                if (callType === 'testNotif') {
                    if (!res?.data?.isSplitAbEnabled) {
                        newValues.schedule = formState?.schedule ? new Date(formState.schedule) : '';
                    } else {
                        const tabsCopy = [...(splitTabs || [])];
                        tabsCopy.forEach((item) => {
                            if (item?.id) {
                                newValues[item?.id]['schedule'] = formState[item?.id]?.schedule
                                    ? new Date(formState[item?.id]?.schedule)
                                    : '';
                            }
                        });
                    }
                }
                reset(() => {
                    return newValues;
                });
                if (newValues?.approvalList) {
                    setTimeout(() => {
                        const approvalListData = newValues.approvalList;
                        setValue('approvalList.requestApproval', approvalListData.requestApproval);
                        setValue('approvalList.approvalFrom', approvalListData.approvalFrom);
                        setValue('approvalList.approvalCount', String(approvalListData.approvalCount || ''));
                        setValue('approvalList.followHierarchy', approvalListData.followHierarchy);
                        if (approvalListData.name && Array.isArray(approvalListData.name)) {
                            approvalListData.name.forEach((approver, index) => {
                                setValue(`approvalList.name[${index}].approverName`, approver.approverName);
                                setValue(`approvalList.name[${index}].mandatory`, approver.mandatory);
                                setValue(`approvalList.name[${index}].isCustom`, approver.isCustom);
                            });
                        }
                    }, 50);
                }
                const isInPageDelivery = parseInt(newValues?.deliveryType?.id, 10) === 5;
                if (isInPageDelivery) {
                    const banner = newValues?.inPageBanner;
                    if (isInPageBannerSelected(banner)) {
                        dispatch(updateNotificationWeb({ field: 'inPageBanner', data: banner }));
                    }
                }
                location?.campaignType === 'M' &&
                    handleMDCQueryParamsUpdate(
                        {
                            ...mdcContentSetupDetails,
                            ...getValues(),
                            ...res?.data,
                            dataSource: res?.data?.dataSource || mdcContentSetupDetails?.dataSource || dataSource,
                        },
                        location,
                    );
                return true;
            } else {
                reset(_cloneDeep(FORM_INITIAL_STATE.defaultValues));
                return false;
            }
        } finally {
            finishEditSkeleton();
        }
    };

    const getUsersList = async () => {
        const usersRes = await dispatch(
            getUserListCampaign({ payload: { clientId, userId, loggedinusertype: 0 }, loading: false }),
        );
        let userList = usersRes?.status ? usersRes?.data : [];
        return _map(userList, (list) => ({ ...list, name: `${list.firstName} (${list.email})` }));
    };

    // useEffect(() => {
    //     // getAudienceData();
    //     // getUpdatedData();
    //     // getInboxClassificationData();
    //     if(isEdit)
    //     handleSendPushTo();
    // }, [location]);
    useEffect(() => {
        // getUsersList();
        async function getData() {
            if (
                location &&
                Object.keys(location)?.length &&
                checkSave &&
                !isAlReadyCalled?.current &&
                isSmartLinkFetchResolved
            ) {
                if (_get(location, 'campaignType', 'S') === 'M') {
                    if (isMDCEditMode === 'edit' || isTemplateFlow) {
                        await getUpdatedData(0, 'edit', {});
                        setIsEdit(false);
                    }
                } else {
                    await getUpdatedData(0, 'edit', {});
                    setIsEdit(false);
                }
            }
        }
        getData();
    }, [location?.campaignId, isSmartLinkFetchResolved, isAlReadyCalled, checkSave, isMDCEditMode]);

    useEffect(() => {
        if (checkSave) return;
        if ((!isSaved && location?.campaignType !== 'M') || location?.campaignType === 'M') {
            handleSendPushTo();
        }
    }, [isSaved, location?.campaignType, checkSave]);

    function disableSplitTabs() {
        reset(
            (formState) => {
                const nextState = {
                    ...formState,
                    splitscehdule: {
                        autoSchedule: false,
                        communicationPerformanceBy: 'SubjectLine',
                        duration: '',
                        time: 'Hour(s)',
                    },
                    splitTest: false,
                    splitA: {
                        ..._cloneDeep(refreshFieldsOnSplitAB),
                    },
                    splitB: {
                        ..._cloneDeep(refreshFieldsOnSplitAB),
                    },
                    splitC: {
                        ..._cloneDeep(refreshFieldsOnSplitAB),
                    },
                    splitD: {
                        ..._cloneDeep(refreshFieldsOnSplitAB),
                    },
                };
                if (deliveryType?.id === 5) {
                    return {
                        ...nextState,
                        ...IN_PAGE_SPLIT_CONTENT_DEFAULTS,
                        inPageBanner: formState?.inPageBanner || null,
                    };
                }
                return nextState;
            },
            {
                keepDirty: true,
            },
        );
        setDirtyReset(true);

        setTabs({
            currentTab: 0,
            splitTabsList: ['splitA', 'splitB'],
            confirmationModal: false,
        });
    }

    const updateTabState = (state, isEdit = false) => {
        setSplitTabs([...state]);
        const newSplitTabs = _map(state, layoutPosition?.value === 'Carousel' ? 'key' : 'id');
        setTabs((prev) => ({
            ...prev,
            currentTab: (isEdit && getSplitIndex(location?.activeSplitName)) ? getSplitIndex(location?.activeSplitName) : state?.length - 1,
            splitTabsList: newSplitTabs,
        }));

        if (splitTest && newSplitTabs.length >= 2 && calucateAudienceCount > 0) {
            const defaultSplittedCount = calculateDefaultSplittedCount(
                newSplitTabs.length,
                calucateAudienceCount,
                newSplitTabs,
            );
            setSliderState({
                show: false,
                splittedCount: defaultSplittedCount,
            });
            setValue('sliderSplitter', defaultSplittedCount);
        } else {
            setSliderState({
                show: false,
                splittedCount: {},
            });
            setValue('sliderSplitter', {});
        }
    };

    const onAddTab = (index, type = isLayoutCarousel) => {
        const getSplitName = type ? CAUROSEL_NAME[index] : SPLIT_AB_NAME[index];
        const temp = [...splitTabs];
        delete temp[temp?.length - 1].add;
        delete temp[temp?.length - 1].remove;
        temp.push({
            ...getSplitName,
            component: () => (
                <SplitAB
                    fieldName={getSplitName?.key || getSplitName.id}
                    index={index}
                    key={getSplitName.id}
                    isSplit={true}
                    campaignType={location?.campaignType}
                    setDirtyReset={setDirtyReset}
                />
            ),
            ...(temp?.length >= 2 && { remove: circle_minus_fill_medium }),
        });

        updateTabState(temp);
        setValue('currentSplitTab', index);
    };

    const onRemoveTab = () => {
        const temp = [...splitTabs];
        const removedItem = temp.pop();
        resetField(removedItem.id);
        if (temp?.length > 2) {
            temp[temp?.length - 1] = {
                ...temp[temp?.length - 1],
                add: circle_plus_medium,
                remove: circle_minus_fill_medium,
            };
        } else {
            temp[temp?.length - 1] = {
                ...temp[temp?.length - 1],
                add: circle_plus_medium,
            };
        }
        reset(
            (formState) => ({
                ...formState,
                [removedItem[layoutPosition?.value === 'Carousel' ? 'key' : 'id']]: {
                    ..._cloneDeep(refreshFieldsOnSplitAB),
                },
            }),
            {
                keepDirty: true,
            },
        );
        updateTabState(temp);
        setEmptySplitDate({
            text: '',
        });
        setValue('currentSplitTab', temp?.length - 1);
    };
    useEffect(() => {
        if (
            mCampType === 'M' &&
            (checkTrigger(location?.campaignType, location?.endDate) ||
                !statusIdCheck(
                    Object.keys(notificationEditData)?.length > 1 ? notificationEditData?.content?.[0]?.statusId : null,
                    location?.campaignType,
                    notificationEditData,
                ))
        ) {
            setDisableNext(false);
        } else {
            setDisableNext(true);
        }
    }, [location?.campaignType, location?.endDate, notificationEditData?.content?.[0]?.statusId]);

    const checkErrors = () => {
        // console.log(
        //     'Check errors ::::::::::::::::::::::::::::::::::::::::::::::::::::::: ',
        //     Object.keys(errors)?.length === 0,
        // );
        if (Object.keys(errors)?.length === 0) return true;
        else {
            window.scrollTo(0, 600);
            return false;
        }
    };

    // const handleSaveChannelsId = async () => {
    //     const finalSavedChannelId = { ...savedChannelsId };
    //     if (savedChannelsId[8]?.includes(8) || location?.savedChannelsId[8]?.includes(8)) {
    //         finalSavedChannelId
    //     } else {
    //         finalSavedChannelId[8] = [8];
    //     }
    //     await dispatch(updateSaveChannelsId(finalSavedChannelId));
    // };

    // TODO {Samben}: Verify the logic of submit as per new updates
    const onFormSubmit = async (formState, formType = 'form', saveType, isScheduled = true) => {
        beginSubmit(getAuthoringSaveButtonType(formType));
        try {
            const utcTimeResponse = await dispatch(getUtcTimeNow(false));
            const currentUtcTimeData = utcTimeResponse || utcTimeData;

            if (
                location?.campaignType !== 'T' &&
                (!levelNumber || levelNumber < 2) &&
                validatePastPlanDurationOnSubmit({
                    location,
                    formState,
                    setError,
                    currentUtcTime: currentUtcTimeData?.utcTime,
                    splitTest: formState?.splitTest,
                    splitTabList: tabs?.splitTabsList,
                })
            ) {
                return;
            }

            if (
                !checkTrigger(location?.campaignType, location?.endDate) &&
                statusIdCheck(
                    Object.keys(notificationEditData)?.length > 1 ? notificationEditData?.content?.[0]?.statusId : null,
                    location?.campaignType,
                    notificationEditData,
                ) &&
                !checkRFAApproved(
                    Object.keys(notificationEditData)?.length > 1 ? notificationEditData?.content?.[0]?.statusId : null,
                    notificationEditData?.requestForApproval?.approvarList,
                )
            ) {
                if (formType !== 'send') {
                    if (!handleAutoRefreshClickOff(audience)) {
                        const audienceCountValid = validateAudienceCount({
                            audienceCount: calucateAudienceCount ?? 0,
                            isAutoRefereshenabled: getValues('isAutoRefereshenabled') ?? false,
                            campaignType: location?.campaignType ?? 'S',
                            levelNumber: levelNumber ?? 1,
                        });
                        if (!audienceCountValid.valid) {
                            setAudienceCountZeroWarning(true);
                            return;
                        }
                    }
                    let schedulerName = splitTest ? `${tabs?.splitTabsList?.[tabs?.currentTab]}.schedule` : 'schedule';
                    const currentSchedule = getValues(schedulerName) || null;
                    const isRFAValid = validateRFAMandatory({
                        isCurrentBURFAStatus,
                        getValues,
                        setValue,
                        setError,
                        trigger,
                        isCommunication: true,
                        currentSchedule: currentSchedule,
                        levelNumber: levelNumber,
                        campaignType: location?.campaignType,
                        dataSource: dataSource,
                        triggerPlayPauseStatus: notificationEditData?.triggerPlayPauseStatus,
                    });

                    if (!isRFAValid) {
                        return;
                    }
                }
                const mandatoryFields = ['hashtag', 'schedule'];
                const textMandtoryFields = ['titleText', 'editorText', ...mandatoryFields];
                let statusId =
                    Object.keys(notificationEditData)?.length > 1 ? notificationEditData?.content?.[0]?.statusId : null;
                let errorIndex, errorField;
                // debugger;
                // console.log('Submit data ::::::::::: ', formState, formType, errorIndex);
                //Split A/B Scenario

                //SplitTest Error Validtion
                if (errorIndex !== undefined) {
                    return;
                }
                if (Object.keys(errors)?.length !== 0) {
                    trigger();
                    return;
                }
                //debugger
                //NON SplitA/B Scenario and Scedule is selected
                if (!formState.splitTest && formState.layoutPosition?.value !== 'Carousel') {
                    if (formState.currentTabIndex !== null && formState.currentTabIndex !== undefined) {
                        // if (formState.hashtag?.length === 0) {
                        //     setError(`hashtag`, {
                        //         type: 'custom',
                        //         message: ENTER_HASHTAG,
                        //     });
                        //     setFocus('editorText');
                        //     return;
                        // } else
                        if (
                            formState?.contentInput === 'import' ||
                            (formState?.deliveryType?.id === 5 && formState?.currentTabIndex === 1)
                        ) {
                            if (
                                formState?.deliveryType?.id !== 5 &&
                                formState?.importType === 'url' &&
                                !(formState?.importUrl && String(formState.importUrl).trim()) &&
                                !hasWebImportFileContent(formState)
                            ) {
                                setError(`importUrl`, {
                                    type: 'custom',
                                    message: COMMUNICATION_URL,
                                });
                                setFocus('importUrl');
                                return;
                            }
                            if (!hasWebImportFileContent(getValues() || formState)) {
                                const uploadMessage =
                                    formState?.deliveryType?.id === 5
                                        ? UPLOAD_MEDIA
                                        : SELECT_A_FILE_TO_PROCEED;
                                setError(`zipFile`, {
                                    type: 'custom',
                                    message: uploadMessage,
                                });
                                if (formState?.deliveryType?.id === 5) {
                                    setError(`tabErrorText`, {
                                        type: 'custom',
                                        message: uploadMessage,
                                    });
                                }
                                setFocus('zipFile');
                                trigger(['zipFile', 'tabErrorText']);
                                return;
                            }
                        } else if (formState?.contentInput === 'template' || formState?.currentTabIndex === 2) {
                            if (!hasTemplateTabContent(formState)) {
                                setError(`tabErrorText`, {
                                    type: 'custom',
                                    message: 'Select template to proceed',
                                });
                                trigger();
                                audienceRef.current.scrollIntoView({
                                    behavior: 'smooth',
                                });
                                return;
                            }
                        }
                    } else if (formState.currentTabIndex === null || formState.currentTabIndex === undefined) {
                        setError(`tabErrorText`, {
                            type: 'custom',
                            message: SELECT_CONTENT_PROCEED,
                        });
                        trigger();
                        audienceRef.current.scrollIntoView({
                            behavior: 'smooth',
                        });
                        return;
                    }
                    // if (formState?.editorTextLength > 350) {
                    //     return;
                    // }
                    if (
                        !(formType === 'schedule') &&
                        !(formType === 'send') &&
                        levelNumber === 1 &&
                        dataSource !== 'DL' &&
                        location?.campaignType !== 'T' &&
                        isScheduled
                    ) {
                        // for (var j = 0; j < tabs?.splitTabsList?.length; j++) {
                        if (!formState?.schedule) {
                            UpdateState(setModal, 'scheduleConfirmModal', true);
                            formTypeRef.current = formType;
                            return;
                            // setTabs((prev) => ({
                            //     ...prev,
                            //     currentTab: i,
                            // }));
                        }
                        // }
                    }
                } else if (formState.splitTest || formState.layoutPosition?.value === 'Carousel') {
                    const splitKeys = getSplitTabKeysForValidation(formState, tabs?.splitTabsList);
                    for (var i = 0; i < splitKeys.length; i++) {
                        const splitKey = splitKeys[i];
                        const splitTabState = getValues(splitKey) || formState[splitKey];
                        if (
                            splitTabState?.currentTabIndex === null ||
                            splitTabState?.currentTabIndex === undefined
                        ) {
                            setError(`${splitKey}.tabErrorText`, {
                                type: 'custom',
                                message: SELECT_CONTENT_PROCEED,
                            });
                            setTabs((prev) => ({
                                ...prev,
                                currentTab: i,
                            }));
                            trigger();
                            if (tabberRef?.current) {
                                tabberRef.current.scrollIntoView({ behavior: 'smooth' });
                            } else {
                                audienceRef.current.scrollIntoView({ behavior: 'smooth' });
                            }
                            return;
                        }
                        const importValidationError = getSplitImportValidationError({
                            splitTabState,
                            splitKey,
                            deliveryTypeId: formState?.deliveryType?.id,
                        });
                        if (importValidationError) {
                            const importMessage =
                                importValidationError.type === 'url'
                                    ? COMMUNICATION_URL
                                    : formState?.deliveryType?.id === 5
                                        ? UPLOAD_MEDIA
                                        : SELECT_A_FILE_TO_PROCEED;
                            setError(importValidationError.field, {
                                type: 'custom',
                                message: importMessage,
                            });
                            if (formState?.deliveryType?.id === 5) {
                                setError(`${splitKey}.tabErrorText`, {
                                    type: 'custom',
                                    message: importMessage,
                                });
                            }
                            setTabs((prev) => ({
                                ...prev,
                                currentTab: i,
                            }));
                            setFocus(importValidationError.focusField);
                            trigger([importValidationError.field, `${splitKey}.tabErrorText`]);
                            if (tabberRef?.current) {
                                tabberRef.current.scrollIntoView({ behavior: 'smooth' });
                            }
                            return;
                        }
                        if (
                            splitTabState?.contentInput === 'template' || splitTabState?.currentTabIndex === 2
                        ) {
                            if (!hasTemplateTabContent(splitTabState)) {
                                setTabs((prev) => ({
                                    ...prev,
                                    currentTab: i,
                                }));
                                setError(`${splitKey}.tabErrorText`, {
                                    type: 'custom',
                                    message: 'Select template to proceed',
                                });
                                trigger();
                                audienceRef.current.scrollIntoView({
                                    behavior: 'smooth',
                                });
                                return;
                            }
                        }
                        if (
                            formState[`split${splitObj[i]}`]?.contentInput === 'create' &&
                            formState[`split${splitObj[i]}`]?.editorTextLength > 350
                        ) {
                            return;
                        }
                        if (
                            formState[`split${splitObj[i]}`]?.contentInput === 'create' &&
                            (!formState[`split${splitObj[i]}`]?.title?.text ||
                                !formState[`split${splitObj[i]}`]?.editorText)
                        ) {
                            setTabs((prev) => ({
                                ...prev,
                                currentTab: i,
                            }));
                            if (!formState[`split${splitObj[i]}`]?.editorText) {
                                setError(`split${splitObj[i]}.editorText`, {
                                    type: 'custom',
                                    message: ENTER_COMUNICATION_TEXT,
                                });
                            }
                            trigger(`split${splitObj[i]}.title`);

                            audienceRef.current.scrollIntoView({
                                behavior: 'smooth',
                            });
                            return;
                        }
                        // check carousel interacivity field
                        const interActivityStatus = handleFieldValueCheck(
                            formState[`split${splitObj[i]}`],
                            i,
                            `split${splitObj[i]}`,
                            'interactivity',
                            setTabs,
                            audienceRef,
                            setError,
                        );
                        if (!interActivityStatus) {
                            setTimeout(() => {
                                trigger();
                            }, 1000);
                            return;
                        }
                    }

                    if (
                        !(formType === 'schedule') &&
                        !(formType === 'send') &&
                        formState.layoutPosition?.value !== 'Carousel'
                    ) {
                        let scheduleAll = [];
                        let nullCount = 0;
                        for (var j = 0; j < tabs?.splitTabsList?.length; j++) {
                            if (!formState[`split${splitObj[j]}`]?.schedule) {
                                scheduleAll.push(null);
                                // UpdateState(setModal, 'scheduleConfirmModal', true);
                                // return;
                                // setTabs((prev) => ({
                                //     ...prev,
                                //     currentTab: i,
                                // }));
                                nullCount++;
                            } else {
                                scheduleAll.push(true);
                            }
                        }
                        // console.log(
                        //     'ScheduleALL [[][[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]]]]]]][ ::::: ',
                        //     scheduleAll,
                        //     nullCount,
                        // );
                        if (nullCount === tabs?.splitTabsList?.length && isScheduled) {
                            UpdateState(setModal, 'scheduleConfirmModal', true);
                            formTypeRef.current = formType;
                            return;
                        } else {
                            for (var k = 0; k < scheduleAll?.length; k++) {
                                // If any one SplitAB schedule exists, SplitAB is mandatory.
                                let checkAllSplitNoSchedule = Object.values(scheduleAll)?.every((schedule) => !schedule);
                                if (scheduleAll[k] === null && !checkAllSplitNoSchedule) {
                                    // console.log(
                                    //     'ScheduleALL [[][[[[[[[[[[[[kjdnasdkjnjakdasd[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]]]]]]][ ::::: ',
                                    //     scheduleAll,
                                    // ); name="splitB.schedule"
                                    // console.log('${splitObj[k]}', `split${splitObj[k]}`);
                                    setError(`split${splitObj[k]}.schedule`, {
                                        type: 'custom',
                                        message: SELECT_SCHEDULE_TIME,
                                    });
                                    setTabs((prev) => ({
                                        ...prev,
                                        currentTab: k,
                                    }));
                                    setValue('scheduleAlert', true);
                                    // setValue(`split${splitObj[k]}.schedule`, new Date());
                                    //trigger(`split${splitObj[k]}.schedule`);
                                    return;
                                } else if (scheduleAll[k]) {
                                    // console.log('ASdasdad ::: ', formState[tabs?.splitTabsList?.[k]], formState);
                                    if (k > 0) {
                                        if (
                                            diff_minutes(
                                                formState[tabs?.splitTabsList[k]]?.schedule,
                                                formState[tabs?.splitTabsList[k - 1]]?.schedule,
                                            ) < 5
                                        ) {
                                            setError(`${tabs?.splitTabsList[k]}.schedule`, {
                                                type: 'required',
                                                message: MINIMUM_DIFFERENCE_SPLITS,
                                            });

                                            setTabs((prev) => ({
                                                ...prev,
                                                currentTab: k,
                                            }));

                                            return;
                                        } else {
                                            let scheduleError = campaignSchedule(
                                                formState[tabs?.splitTabsList[k]]?.schedule,
                                                formState[tabs?.splitTabsList[k]]?.timezone?.gmtOffset,
                                                statusId,
                                                currentUtcTimeData?.utcTime,
                                            );
                                            const { adjustedStartDate, adjustedEndDate } = getTimezoneAdjustedDateRange(
                                                tabs?.splitTabsList[k],
                                                formState[tabs?.splitTabsList[k]]?.timezone,
                                            );
                                            const ScheduleStatus = checkScheduleDate(
                                                formState[tabs?.splitTabsList[k]]?.schedule,
                                                adjustedStartDate,
                                                adjustedEndDate,
                                            );
                                            if (ScheduleStatus) {
                                                setError(`${tabs?.splitTabsList[k]}.schedule`, {
                                                    type: 'custom',
                                                    // message: 'Select a date and time later than ' + scheduleError + '.',
                                                    message: CHECK_START_DATE_AND_END_DATE,
                                                });
                                                return;
                                            }
                                            // if (scheduleError !== undefined) {
                                            if (!scheduleError) {
                                                setError(`${tabs?.splitTabsList[k]}.schedule`, {
                                                    type: 'required',
                                                    message: SELECT_DATE_TIME,
                                                    // message: 'Select a date and time later than ' + scheduleError + '.',
                                                });

                                                setTabs((prev) => ({
                                                    ...prev,
                                                    currentTab: k,
                                                }));

                                                return;
                                            }
                                        }
                                    } else {
                                        let scheduleError = campaignSchedule(
                                            formState[tabs?.splitTabsList[k]]?.schedule,
                                            formState[tabs?.splitTabsList[k]]?.timezone?.gmtOffset,
                                            statusId,
                                            utcTimeData?.utcTime,
                                        );

                                        const { adjustedStartDate, adjustedEndDate } = getTimezoneAdjustedDateRange(
                                            tabs?.splitTabsList[k],
                                            formState[tabs?.splitTabsList[k]]?.timezone,
                                        );
                                        const ScheduleStatus = checkScheduleDate(
                                            formState[tabs?.splitTabsList[k]]?.schedule,
                                            adjustedStartDate,
                                            adjustedEndDate,
                                        );
                                        if (ScheduleStatus) {
                                            setError(`${tabs?.splitTabsList[k]}.schedule`, {
                                                type: 'custom',
                                                // message: 'Select a date and time later than ' + scheduleError + '.',
                                                message: CHECK_START_DATE_AND_END_DATE,
                                            });
                                            return;
                                        }
                                        // if (scheduleError !== undefined) {
                                        if (!scheduleError) {
                                            setError(`${tabs?.splitTabsList[k]}.schedule`, {
                                                type: 'required',
                                                message: SELECT_DATE_TIME,
                                                // message: 'Select a date and time later than ' + scheduleError + '.',
                                            });

                                            setTabs((prev) => ({
                                                ...prev,
                                                currentTab: k,
                                            }));

                                            return;
                                        }
                                    }
                                }
                            }
                        }
                    } else if (
                        !(formType === 'schedule') &&
                        !(formType === 'send') &&
                        location?.campaignType !== 'T' &&
                        isScheduled
                    ) {
                        if (!formState?.schedule && levelNumber === 1) {
                            UpdateState(setModal, 'scheduleConfirmModal', true);
                            formTypeRef.current = formType;
                            return;
                            // setTabs((prev) => ({
                            //     ...prev,
                            //     currentTab: i,
                            // }));
                        }
                    }
                }

                //If Not SplitA/B Just need to confirm Whether can proceed without scedule
                // if (
                //     !formState.splitTest &&
                //     formState.layoutPosition?.value !== 'Carousel' &&
                //     !formState.schedule
                //     // formType === 'form'
                // ) {
                //     // UpdateState(setProceedWithoutSchedule, 'showModal', true);
                //     UpdateState(setModal, 'scheduleConfirmModal', true);
                //     return;
                // }
                function getTestType() {
                    let testType = 0;
                    if ((formType === 'form' || formType === 'save') && !formState?.approvalList?.requestApproval)
                        testType = 0;
                    else if (formType === 'request for approval') testType = 1;
                    else if (formType === 'send') testType = 2;
                    else if (formState?.approvalList?.requestApproval) testType = 1;

                    testType = formState?.approvalList?.requestApproval && formType === 'form' ? 1 : testType;
                    return testType;
                }
                const splitTabsFromForm = getValues('splitTabList');
                const resolvedSplitTabs =
                    Array.isArray(splitTabsFromForm) && splitTabsFromForm.length > 0
                        ? splitTabsFromForm
                        : ['splitA', 'splitB'];
                formState = {
                    ...formState,
                    splitTabs: resolvedSplitTabs,
                    splitABCount: sliderState.splittedCount,
                    isSecureMessage,
                    isScheduled: !(
                        !formState.splitTest &&
                        formState.layoutPosition?.value !== 'Carousel' &&
                        !formState.schedule &&
                        formType === 'schedule'
                    ),
                    dataSource: location['campaignType'] === 'T' ? 'DL' : 'TL',
                    dynamiclistId: location['campaignType'] === 'T' ? _get(location, 'dynamicListId', 0) : 0,
                    ...(location['campaignType'] === 'M' && mdcContentSetupDetails),
                    campaignType: location?.campaignType,
                    isSendTestMail: getTestType(),
                };
                // console.log('ASdasad :::::::::::: ', formType);
                dispatch(updateNotificationWeb({ data: formState, field: 'result' }));
                if (
                    formState?.schedule !== '' &&
                    formState?.schedule !== null &&
                    location?.campaignType !== 'T' &&
                    dataSource === 'TL'
                ) {
                    let scheduleError = campaignSchedule(
                        formState?.schedule,
                        formState?.timezone?.gmtOffset,
                        statusId,
                        utcTimeData?.utcTime,
                    );
                    const { adjustedStartDate, adjustedEndDate } = getTimezoneAdjustedDateRange(null, formState?.timezone);
                    const ScheduleStatus = checkScheduleDate(formState?.schedule, adjustedStartDate, adjustedEndDate);
                    if (ScheduleStatus) {
                        setError(`schedule`, {
                            type: 'custom',
                            // message: 'Select a date and time later than ' + scheduleError + '.',
                            message: CHECK_START_DATE_AND_END_DATE,
                        });
                        return;
                    }
                    if (!scheduleError && location.statusId !== 5) {
                        const cityTime = convertUserTimezoneToTarget(
                            currentUtcTimeData?.utcTime
                                ? new Date(currentUtcTimeData.utcTime.replace('Z', ''))
                                : new Date(),
                            '(GMT+00:00) ',
                            formState?.timezone?.gmtOffset,
                        );
                        // Add 15 minutes to cityTime
                        const cityTimeWithBuffer = new Date(cityTime);
                        cityTimeWithBuffer.setMinutes(cityTimeWithBuffer.getMinutes() + 15);
                        const formattedCityTime = cityTimeWithBuffer.toLocaleString();
                        setError(`schedule`, {
                            type: 'custom',
                            // message: 'Select a date and time later than ' + scheduleError + '.',
                            message: `Select a date & time later than ${formattedCityTime}`,
                        });
                        return;
                    }
                }

                const payload = buildPayload(formState, type, timeZoneId, mobileApp, location, notificationEditData);


                // console.log(payload, communicationChannels, '--payload');

                const payloadSubmit = {
                    clientId: Number(clientId),
                    departmentId: Number(departmentId),
                    userId: Number(userId),
                    createdBy: Number(userId),
                    campaignId: Number(_get(location, 'campaignId', 0)),
                    campaignType: String(location?.campaignType),
                    edmGuid: notification?.web?.edmGuid || '',
                    campaignGuid: notification?.web?.campaignGuId || '',
                    audienceCount: calucateAudienceCount || sumAudienceRecipientCount(formState?.audience, 'recipientCountWebPush'),
                    ...payload,
                };

                const response = await runSave(getAuthoringSaveButtonType(formType), () =>
                    dispatch(saveWebPush({ payload: payloadSubmit, savedChannelsId, loading: false })),
                );
                setSaveCampaigData(response);
                // console.log('Rsponse for submit :::: ', response);
                if (response?.status) {
                    const selectedAudience = formState?.audience ?? [];
                    dispatch(updateChannelAudiences(mergeChannelAudiences('Notification', selectedAudience, channelAudiences)));
                    // setEditId(response?.WebPushNotifyChannelDetailID);
                    let WebNotificationChannelDetailId = response?.data?.WebPushNotifyChannelDetailID;
                    if (formType === 'form') {
                        if (formState?.approvalList?.requestApproval) {
                            // Clear dirty state after successful save while keeping form values
                            reset(getValues(), { keepValues: true });
                            dispatch(updateDirtyState(false));

                            setModal((prev) => ({
                                ...prev,
                                sendConfirmModal: true,
                                isRFA: true,
                            }));
                            if (rfaAutoNavTimeoutRef.current) clearTimeout(rfaAutoNavTimeoutRef.current);
                            rfaManuallyClosedRef.current = false;
                            rfaAutoNavTimeoutRef.current = setTimeout(() => {
                                if (rfaManuallyClosedRef.current) return;
                                setModal((prev) => ({
                                    ...prev,
                                    sendConfirmModal: false,
                                    isRFA: false,
                                }));
                                location['campaignType'] === 'M' ? handleMdcNavigation(response) : handleNavigation();
                            }, 5000);
                        } else {
                            if (location['campaignType'] === 'M') {
                                handleMdcNavigation(response);
                            } else {
                                handleNavigation();
                            }
                            getSmartLink();
                            // handleNavigation();
                        }
                    } else if (formType === 'request for approval') {
                        // Clear dirty state after successful save while keeping form values
                        reset(getValues(), { keepValues: true });
                        dispatch(updateDirtyState(false));

                        setModal((prev) => ({
                            ...prev,
                            sendConfirmModal: true,
                            isRFA: true,
                        }));
                        if (rfaAutoNavTimeoutRef.current) clearTimeout(rfaAutoNavTimeoutRef.current);
                        rfaManuallyClosedRef.current = false;
                        rfaAutoNavTimeoutRef.current = setTimeout(() => {
                            if (rfaManuallyClosedRef.current) return;
                            setModal((prev) => ({
                                ...prev,
                                sendConfirmModal: false,
                                isRFA: false,
                            }));
                            location['campaignType'] === 'M' ? handleMdcNavigation(response) : handleNavigation();
                        }, 5000);
                        return;
                    } else if (formType === 'send') {
                        // Clear dirty state after successful test preview save while keeping form values
                        reset(getValues(), { keepValues: true });
                        dispatch(updateDirtyState(false));

                        await getUpdatedData(WebNotificationChannelDetailId, 'testNotif', formState);
                        setModal((prev) => ({
                            ...prev,
                            sendConfirmModal: true,
                            status: TEST_PREVIEW_SENT || '',
                        }));
                        setTimeout(() => {
                            setModal((prev) => ({
                                ...prev,
                                sendConfirmModal: false,
                                status: '',
                            }));

                        }, 5000)

                    } else if (formType === 'schedule') {
                        if (saveType) {
                            navigate('/communication', {
                                state: {
                                    index: 0,
                                },
                            });
                        } else {
                            if (location['campaignType'] === 'M') {
                                handleMdcNavigation(response);
                            } else {
                                handleNavigation();
                            }
                        }
                    } else if (formType === 'save') {
                        if (formState?.approvalList?.requestApproval) {
                            setModal((prev) => ({
                                ...prev,
                                sendConfirmModal: true,
                                isRFA: true,
                            }));
                            if (rfaAutoNavTimeoutRef.current) clearTimeout(rfaAutoNavTimeoutRef.current);
                            rfaManuallyClosedRef.current = false;
                            rfaAutoNavTimeoutRef.current = setTimeout(() => {
                                if (rfaManuallyClosedRef.current) return;
                                setModal((prev) => ({
                                    ...prev,
                                    sendConfirmModal: false,
                                    isRFA: false,
                                }));
                                if (location['campaignType'] === 'M') {
                                    handleMdcNavigation(response);
                                } else if (formState?.isCGTGEnabled) {
                                    let url = '/communication/execute';
                                    const encryptState = encodeUrl(location);
                                    navigate(`${url}?q=${encryptState}`, {
                                        state: location,
                                    });
                                } else {
                                    navigate('/communication', {
                                        state: {
                                            index: 0,
                                        },
                                    });
                                }
                            }, 5000);
                        } else {
                            if (location['campaignType'] === 'M') {
                                handleMdcNavigation(response);
                            } else if (formState?.isCGTGEnabled) {
                                let url = '/communication/execute';
                                const encryptState = encodeUrl(location);
                                navigate(`${url}?q=${encryptState}`, {
                                    state: location,
                                });
                            } else {
                                navigate('/communication', {
                                    state: {
                                        index: 0,
                                    },
                                });
                            }
                        }
                    }
                } else {
                    if (formType === 'send') {
                        setModal((prev) => ({
                            ...prev,
                            sendConfirmModal: true,
                            testSentCommunicationModal: true,
                            status: response.message || '',
                        }));
                        setTimeout(() => {
                            setModal((prev) => ({
                                ...prev,
                                sendConfirmModal: false,
                                testSentCommunicationModal: false,
                                status: '',
                            }));
                        }, 5000);
                    } else {
                        setModal((prev) => ({
                            ...prev,
                            sendConfirmModal: true,
                            testSentCommunicationModal: true,
                            status: response.message || '',
                        }));
                    }
                }

                // window.scrollTo(0, 0);
                // const tabIndex = notificationTabState.currentIndex + 1;
                // if (availableTabs['notification']?.length === tabIndex) {
                //     const nextChannel = communicationChannels.find(
                //         (chan, index) => channelType !== chan && Object.hasOwn(activeTabs, chan) && index > currentTab,
                //     );
                //     dispatch(
                //         updateVerticalTab({
                //             tabs: activeTabs?.[nextChannel] || {
                //                 type: 'socialPost',
                //                 currentTab: 3,
                //             },
                //         }),
                //     );
                // } else {
                //     dispatch(
                //         updateTab({
                //             field: 'notification',
                //             data: {
                //                 tabName: availableTabs['notification'][tabIndex],
                //                 currentIndex: tabIndex,
                //             },
                //         }),
                //     );
                // }
            } else {
                const tempResponse = {
                    data: { WebPushNotifyChannelDetailID: notificationEditData?.content?.[0]?.pushNotifyChannelDetailId },
                };
                if (formType === 'form') {
                    getSmartLink();
                    if (location['campaignType'] === 'M') {
                        handleMdcNavigation(tempResponse);
                    } else {
                        handleNavigation();
                    }
                } else if (formType === 'save') {
                    if (location['campaignType'] === 'M') {
                        handleMdcNavigation(tempResponse);
                    } else if (formState?.isCGTGEnabled) {
                        let url = '/communication/execute';
                        const encryptState = encodeUrl(location);
                        navigate(`${url}?q=${encryptState}`, {
                            state: location,
                        });
                    } else {
                        navigate('/communication', {
                            state: {
                                index: 0,
                            },
                        });
                    }
                }
            }
        } finally {
            endSubmit();
        }
    };
    const handleNavigation = () => {
        window.scrollTo(0, 0);
        const tabIndex = notificationTabState.currentIndex + 1;

        const handleVertcialNextTab = () => {
            const nextChannel = communicationChannels.find(
                (chan, index) => channelType !== chan && Object.hasOwn(activeTabs, chan) && index > currentTab,
            );
            if (!!nextChannel) {
                dispatch(
                    updateVerticalTab({
                        tabs: activeTabs?.[nextChannel] || {
                            type: 'socialPost',
                            currentTab: 3,
                        },
                    }),
                );
            } else {
                let url = '/communication/execute';
                const encryptState = encodeUrl(location);
                dispatch(resetCreateCommunication());
                navigate(`${url}?q=${encryptState}`, {
                    state: location,
                });
            }
        };
        let eligibleChannelIds = [];
        if (location?.campaignType === 'T') {
            eligibleChannelIds = [
                ...(location?.eligibleChannelType?.[8] || []),
                ...(location?.eligibleChannelType?.[14] || []),
            ];
            if (
                location?.analyticsTypes?.includes(16) &&
                location?.analyticsTypes?.includes(6) &&
                eligibleChannelIds?.includes(8) &&
                eligibleChannelIds?.includes(14)
            ) {
                eligibleChannelIds = [8, 14];
            } else if (location?.analyticsTypes?.includes(16) && eligibleChannelIds?.includes(14)) {
                eligibleChannelIds = [14];
            } else if (location?.analyticsTypes?.includes(6) && eligibleChannelIds?.includes(8)) {
                eligibleChannelIds = [8];
            }
        } else {
            if (location?.analyticsTypes?.includes(16) && location?.analyticsTypes?.includes(6)) {
                eligibleChannelIds = [8, 14];
            } else if (location?.analyticsTypes?.includes(16)) {
                eligibleChannelIds = [14];
            } else if (location?.analyticsTypes?.includes(6)) {
                eligibleChannelIds = [8];
            }
        }

        const nextNotificationTabIndex = getNextEligibleTabIndex({
            startIndex: tabIndex,
            campaignType: location?.campaignType,
            eligibleChannelIds: eligibleChannelIds,
            availableTabList: availableTabs['notification'],
            tabChannelMap: NOTIFICATION_TAB_CHANNEL_MAP,
        });

        if (availableTabs['notification']?.length === nextNotificationTabIndex) {
            handleVertcialNextTab();
        } else {
            dispatch(
                updateTab({
                    field: 'notification',
                    data: {
                        tabName: availableTabs['notification'][nextNotificationTabIndex],
                        currentIndex: nextNotificationTabIndex,
                    },
                }),
            );
            // reset(_cloneDeep(FORM_INITIAL_STATE.defaultValues));
        }
    };

    const handleSendPushTo = async (value) => {
        // debugger;
        if (
            !!location?.campaignId &&
            (notification?.web?.domainsList?.length === 0 || notification?.web?.domainsList === undefined)
        ) {
            const savedChannel = savedChannelsId[8]?.includes(8) ? true : false;
            const res = await webDomainLoader.refetch({
                fetcher: ({ payload } = {}) =>
                    dispatch(getNotificationWebPush({ payload, loading: false })),
                mode: savedChannel ? 'edit' : 'create',
                loaderConfig: editFieldLoaderConfig,
                params: {
                    payload: {
                        clientId,
                        departmentId,
                        userId,
                        campaignId: _get(location, 'campaignId', 0),
                    },
                },
            });
            // console.log('Result :::: ', res);
            if (res?.status) return res?.data;
        } else {
            return { webNotifydomain: notification?.web?.domainsList };
        }
    };
    // console.log('Notifications :::::: ', errors);

    const handleMdcNavigation = ({ data }) => {
        const channelResponseDetailId = WebPushNotifyChannelDetailID;
        const mdcCanvasUrl = `/communication/mdc-workflow`;
        const state = {
            ...location,
            templateId: '',
            templateChannelId: '',
            channelResponseDetailId,
            mode: `update`
        };
        const encryptState = encodeUrl(state);
        channelResponseDetailId &&
            navigate(`${mdcCanvasUrl}?q=${encryptState}`, {
                state,
            });
    };

    const handleMdcCancel = () => {
        const mdcCanvasUrl = `/communication/mdc-workflow`;
        const state = { ...location };
        delete state.mdcContentSetupDetails;

        const encryptState = encodeUrl(state);
        navigate(`${mdcCanvasUrl}?q=${encryptState}`, {
            state,
        });
    };

    const tabsData = tabs?.splitTabsList;

    const handleFailureNavigation = () => {
        if (isWPFail) {
            if (location['campaignType'] === 'M') {
                handleMdcCancel();
            } else {
                navigate('/communication', {
                    index: 0,
                });
            }
        }
    };

    useEffect(() => {
        !splitTest &&
            setEmptySplitDate({
                text: '',
            });
    }, [splitTest]);

    const handleAutoScheduleModal = (error) => {
        if (Object.values(error)?.every((item) => item === false)) {
            setShowScheduleModal(true);
            setEmptySplitDate({
                text: '',
            });
        }
    };

    useEffect(() => {
        if (isLayoutCarousel && !notificationEditData?.content?.length) {
            setSplitTabs([...INITIAL_CAROUSEL_STATE(setDirtyReset)]);
        }
    }, [isLayoutCarousel, notificationEditData]);

    const shouldDisableAutoRefresh = handleAutoRefreshClickOff(audience);
    useEffect(() => {
        if (shouldDisableAutoRefresh) {
            setValue('isAutoRefereshenabled', false);
        }
    }, [audience]);

    let contentConfig = getCreateContentRenderConfig(
        deliveryType,
        layoutPosition,
        position,
        splitTest,
        location,
    );

    return (
        <FormProvider {...methods}>
            <AuthoringChannelEditSkeletonGate
                channelId={8}
                showEditSkeleton={showEditSkeleton}
                isSavedChannel={isSavedChannel}
                checkSave={checkSave}
            >
                <NotificationProvider.Provider value={value}>
                    <div className="rsv-tabs-content  position-relative">
                        <form onSubmit={handleSubmit((data) => onFormSubmit(data))} className='allow-copy'>
                            {/* <div className="box-design bd-top-border"> */}
                            <div
                                className={`box-design bd-top-border ${checkTrigger(location?.campaignType, location?.endDate)
                                    ? 'pe-none click-off'
                                    : !isCommunicationEditable
                                        ? 'pe-none click-off'
                                        : ''
                                    }`}
                            >
                                <SmartLinkEnable
                                    requiresWebSmartLink
                                    secondaryButton={false}
                                    isClickOff={!isCommunicationEditable}
                                    isChannelLoading={showEditSkeleton}
                                    onReject={() => {
                                        dispatch(showTabsSmartlink(true));
                                    }}
                                    ignoreButton
                                    onIgnore={() => { handleNavigation() }}
                                />
                                <div className="form-group mt20">
                                    <Row>
                                        <Col sm={{ offset: 1, span: 2 }}>
                                            <label className="control-label-left">
                                                Send push to
                                            </label>
                                        </Col>

                                        {/* {sendwebPushTo?.value === 'Domain' && !!sendwebPushTo && ( */}
                                        <Col sm={6} id="rs_Notification_name">
                                            <RSKendoDropDownList
                                                control={control}
                                                // data={['https://resulticks.team/']}
                                                data={notification?.web?.domainsList}
                                                textField={'labelDomainUrl'}
                                                dataItemKey={'webNotifySettingId'}
                                                name={'domain'}
                                                label={'Web URL'}
                                                required
                                                isLoading={webDomainLoader.isLoading}
                                                rules={{
                                                    required: SELECT_WEB_URL,
                                                }}
                                                handleChange={(e) => {
                                                    // console.log('E ::: ', e);
                                                    if (e?.value?.domainUrl === 'Enter domain URL') {
                                                        setValue('domain', '');
                                                        setDomainURLNew(true);
                                                    } else {
                                                        getAudienceData(e?.value, '', true);
                                                        getInboxClassificationData({
                                                            domain: {
                                                                domainUrl: e?.value?.domainUrl,
                                                            },
                                                            edit: true,
                                                            isDomainChange: true,
                                                        });
                                                        dispatch(
                                                            updateNotificationWeb({
                                                                field: 'webPushDomain',
                                                                data: e?.value,
                                                            }),
                                                        );
                                                        if (deliveryType?.id === 5) {
                                                            const emptyBanner = { bannerId: '', bannerName: '' };
                                                            setValue('inPageBanner', null);
                                                            dispatch(
                                                                updateNotificationWeb({
                                                                    field: 'inPageBanner',
                                                                    data: emptyBanner,
                                                                }),
                                                            );
                                                        }
                                                    }
                                                }}
                                                footer={
                                                    <span id="rs_data_circle_plus_fill">
                                                        <RSDropdownFooterBtn
                                                            title={ADD_DOMAIN}
                                                            handleClick={() => {
                                                                const navState = createCommunicationSettingsNavState(
                                                                    'notification',
                                                                    {
                                                                        mode: 'add',
                                                                        from: 'CreateCommunication',
                                                                        campaignType: location?.campaignType,
                                                                        notificationTabId: NOTIFICATION_TAB_ID.WEB,
                                                                        webTabId: 'web',
                                                                        backAction: window.location.search,
                                                                        tabValueName: 'notification',
                                                                        tabValue: 'web',
                                                                    },
                                                                    location,
                                                                );
                                                                navigate(
                                                                    `/preferences/communication-settings?q=${encodeUrl(navState)}`,
                                                                    { state: {} },
                                                                );
                                                            }}
                                                        />
                                                    </span>
                                                }
                                            />
                                        </Col>
                                        <Col sm={3} className="p0 d-flex">
                                            <div className="fg-icons">
                                                {domainURLNew && (
                                                    <RSTooltip text={RESET_DOMAIN}>
                                                        <i
                                                            onClick={() => {
                                                                setValue('domain', '');
                                                                setDomainURLNew(false);
                                                            }}
                                                            className={`${close_medium} icon-md color-primary-red`}
                                                            id="rs_Notification_close"
                                                        />
                                                    </RSTooltip>
                                                )}
                                            </div>
                                        </Col>
                                        {/* )} */}
                                    </Row>
                                </div>

                                {location?.campaignType !== 'T' && location?.campaignType !== 'M' && (
                                    <div className="form-group fg-wl-radio mt15" ref={audienceRef}>
                                        <AudienceFieldRenderComponent
                                            type={'notification'}
                                            audienceList={notification?.web?.audienceList}
                                            isAudienceLoading={audienceLoader.isLoading}
                                            methods={methods}
                                            userDetails={{ departmentId, userId, clientId }}
                                            campaignId={_get(location, 'campaignId', 0)}
                                            audienceTextField={'recipientsBunchName'}
                                            audienceValidatorParam={true}
                                            customHandleFilterChange={debouncedHandleAudienceWebMobileFilterChange}
                                            customFilterPayload={(event) => ({
                                                userId,
                                                clientId,
                                                departmentId,
                                                channelType: 'WN',
                                                campaignType: _get(location, 'campaignType', 'S'),
                                                domainURL: domain?.domainUrl,
                                                appGuId: '',
                                                searchText: event?.filter?.value ?? '',
                                                segmentIds: [],
                                            })}
                                            handleAudienceFieldOnChange={() => {
                                                setTimeout(() => {
                                                    const splitTabList = getValues('splitTabList');
                                                    const resolvedSplitTabs =
                                                        Array.isArray(splitTabList) && splitTabList.length > 0
                                                            ? splitTabList
                                                            : tabs?.splitTabsList;
                                                    const freshCount = sumAudienceRecipientCount(
                                                        getValues('audience'),
                                                        'recipientCountWebPush',
                                                    );
                                                    if (
                                                        getValues('splitTest') &&
                                                        resolvedSplitTabs?.length >= 2 &&
                                                        freshCount > 0
                                                    ) {
                                                        const defaultSplittedCount = calculateDefaultSplittedCount(
                                                            resolvedSplitTabs.length,
                                                            freshCount,
                                                            resolvedSplitTabs,
                                                        );
                                                        setSliderState({
                                                            show: false,
                                                            splittedCount: defaultSplittedCount,
                                                        });
                                                        setValue('sliderSplitter', defaultSplittedCount);
                                                    }
                                                }, 0);
                                            }}
                                            children={
                                                <div className="d-flex justify-content-between">
                                                    <span className={`${shouldDisableAutoRefresh ? 'click-off' : ''}`}>
                                                        <RSCheckbox
                                                            control={control}
                                                            name="isAutoRefereshenabled"
                                                            labelName={AUTO_REFRESH}
                                                            popover
                                                            popover_icon={`${circle_question_mark_mini} icon-xs color-primary-blue top2`}
                                                            popover_position="top"
                                                            popover_content={AUTO_REFRESH_POP_HOVER_TEXT}
                                                        />
                                                    </span>
                                                    <small>
                                                        {AUDIENCE}:{' '}
                                                        {handleTotalAudienceCount(notificationEditData, watchTotalAudience, calucateAudienceCount)}
                                                    </small>
                                                </div>
                                            }
                                        />
                                        {/* <Col sm={3} className="pr0">
                                            <ul className="flex-list fl-space-10 position-relative top8">
                                                <li>
                                                    <RSTooltip text={AUDIENCE_TOOLTIP_TEXT}>
                                                        <i
                                                            className={`${circle_question_mark_medium} icon-md color-primary-blue`}
                                                        />
                                                    </RSTooltip>
                                                </li>
                                                <li>
                                                    <RSTooltip text="Create target list">
                                                        <i
                                                            onClick={() => {
                                                                navigate('/audience/create-target-list', {
                                                                    state: { mode: 'add' },
                                                                });
                                                            }}
                                                            className={`${circle_plus_fill_medium} icon-md color-primary-blue`}
                                                        />
                                                    </RSTooltip>
                                                </li>
                                                <li>
                                                    <small className="position-relative top-3 fs14">
                                                        Audience:{' '}
                                                        {!isNaN(calucateAudienceCount)
                                                            ? numberWithCommas(calucateAudienceCount)
                                                            : 0}
                                                    </small>
                                                </li>
                                            </ul>
                                        </Col> */}
                                    </div>
                                )}
                                <div className="form-group">
                                    <Row>
                                        <Col sm={{ offset: 1, span: 2 }}>
                                            <label className="control-label-left">
                                                Delivery type
                                            </label>
                                        </Col>
                                        <Col sm={6}>
                                            <Row>
                                                <Col
                                                    sm={6}
                                                    id="rs_Notification_deliverType"
                                                    className={`${deliveryType ? 'click-off' : ''}`}
                                                >
                                                    <RSKendoDropDownList
                                                        required
                                                        control={control}
                                                        data={(() => {
                                                            const list = ['M', 'T'].includes(_get(location, 'campaignType', 'S'))
                                                                ? DELIVERY_TYPE?.filter((item) => item.id !== 5)
                                                                : DELIVERY_TYPE;
                                                            return getEnvironment() === 'RUN'
                                                                ? list?.filter((item) => item.id !== 5) ?? list
                                                                : list;
                                                        })()}
                                                        name={'deliveryType'}
                                                        label="Delivery type"
                                                        dataItemKey={'id'}
                                                        textField={'value'}
                                                        disabled={
                                                            !!deliveryType || (!!deliveryType && !!inboxClassification)
                                                        }
                                                        rules={{
                                                            required: SELECT_DELIVERYTYPE,
                                                        }}
                                                        handleChange={(e) => {
                                                            // For template-based edit flow, preserve existing content/tab.
                                                            if (e?.value?.value === 'Alert/rich push') {
                                                                setValue('currentTabIndex', 0);
                                                            } else {
                                                                if (isTemplateFlow && getValues('templateContent')) {
                                                                    if (e?.value?.id !== 5) {
                                                                        setValue('currentTabIndex', 2);
                                                                    } else {
                                                                        setValue('currentTabIndex', 0);
                                                                        setValue('edmContent', '');
                                                                        setValue('importUrl', '');
                                                                    }
                                                                }
                                                            }
                                                        }}
                                                    // handleChange={() => {
                                                    //     getInboxClassificationData();
                                                    // }}
                                                    />
                                                </Col>
                                                <Col sm={6} className="position-relative">
                                                    {newInbox ? (
                                                        <Fragment>
                                                            <RSInput
                                                                name={'newInboxName'}
                                                                control={control}
                                                                id="rs_Notification_newinboxname"
                                                                label={INBOX_CLASSIFICATION}
                                                                rules={
                                                                    newInbox
                                                                        ? { required: ENTER_INBOX_CLASSIFICATION }
                                                                        : {}
                                                                }
                                                                handleOnBlur={(e) => {
                                                                    // debugger;
                                                                    if (!!e.target.value) {
                                                                        setValue('inboxClassification', {
                                                                            cdId: 0,
                                                                            classificationId: e.target.value,
                                                                        });
                                                                        getInboxClassificationData(
                                                                            undefined,
                                                                            e.target.value,
                                                                            'notSave',
                                                                        );
                                                                    }
                                                                }}
                                                                isCustomDoubleIcon
                                                                isLoading={inboxClassificationLoader.isLoading || domainState.loading}
                                                                isValidIcon={domainState.isValid}
                                                            />
                                                            {!(inboxClassificationLoader.isLoading || domainState.loading) && (
                                                                <div className="align-items-center d-flex justify-content-between position-absolute top4 right5 zIndex2">
                                                                    <RSTooltip
                                                                        position="top"
                                                                        text={SAVE}
                                                                        className="position-absolute right40 top5 lh0"
                                                                    >
                                                                        <i
                                                                            onClick={() => {
                                                                                // saveCategoryData();
                                                                                getInboxClassificationData(
                                                                                    undefined,
                                                                                    getValues('newInboxName'),
                                                                                    'save',
                                                                                );
                                                                            }}
                                                                            className={`${save_mini} ${clickOff ? 'pe-none click-off' : ''
                                                                                } icon-xs color-primary-blue `}
                                                                            id="rs_Notification_savesnewinbox"
                                                                        ></i>
                                                                    </RSTooltip>
                                                                    <RSTooltip
                                                                        position="top"
                                                                        text={CLOSE}
                                                                        className="position-absolute top4 right12 zIndex2 lh0"
                                                                    >
                                                                        <i
                                                                            className={`${close_mini} color-primary-red icon-xs`}
                                                                            onClick={() => {
                                                                                // console.log('AASDASASD  :::: ', watch());
                                                                                setValue('newInbox', false);
                                                                                clearErrors('newInboxName');
                                                                                // setAudioList( );
                                                                                setClickOff(true);
                                                                                setValue('inboxClassification', '');
                                                                                setValue('newInboxName', '');
                                                                                //getInboxClassificationData();
                                                                            }}
                                                                            id="rs_Notification_closenewinbox"
                                                                        ></i>
                                                                    </RSTooltip>
                                                                </div>
                                                            )}
                                                            {/* <RSInput
                                                            control={control}
                                                            name={'newInboxName'}
                                                            required
                                                            label={'New inbox classification'}
                                                            rules={{
                                                                required: 'Enter new inbox classification',
                                                            }}
                                                            handleOnBlur={(e) => {
                                                                // debugger;
                                                                if (!!e.target.value) {
                                                                    setValue('inboxClassification', {
                                                                        cdId: 0,
                                                                        classificationId: e.target.value,
                                                                    });
                                                                    getInboxClassificationData(
                                                                        undefined,
                                                                        e.target.value,
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                        <RSTooltip
                                                            position="top"
                                                            text="Close"
                                                            className="lh0 position-absolute right16 top5 cp zIndex2"
                                                        >
                                                            <i
                                                                className={`${close_mini} color-primary-red icon-xs`}
                                                                onClick={() => {
                                                                    setValue('newInbox', false);
                                                                    // setAudioList( );
                                                                    setValue('inboxClassification', '');
                                                                }}
                                                            />
                                                        </RSTooltip> */}
                                                        </Fragment>
                                                    ) : (
                                                        <RSKendoDropDownList
                                                            // required
                                                            control={control}
                                                            data={notification?.web?.inboxClassifications}
                                                            name={'inboxClassification'}
                                                            label={INBOX_CLASSIFICATION}
                                                            dataItemKey={'cdId'}
                                                            textField={'classificationId'}
                                                            disabled={!domain?.domainUrl || (!!deliveryType && !!inboxClassification)}
                                                            isLoading={inboxClassificationLoader.isLoading}
                                                            // rules={{
                                                            //     required: SELECT_INBOX_CLASSIFICATION,
                                                            // }}
                                                            footer={
                                                                <RSDropdownFooterBtn
                                                                    title="New inbox classification"
                                                                    handleClick={() => {
                                                                        if (!domain?.domainUrl) return;
                                                                        setDomainState({
                                                                            isValid: false,
                                                                            loading: false,
                                                                        });
                                                                        setValue('newInbox', true);
                                                                        setClickOff(true);
                                                                    }}
                                                                />
                                                            }
                                                        />
                                                    )}
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Col sm={2} className="fg-icons-wrapper pl0">
                                            <div className="fg-icons d-flex">
                                                <RSTooltip text={`Secure message ${isSecureMessage ? 'ON' : 'OFF'}`}>
                                                    <i
                                                        className={`${isSecureMessage
                                                            ? shield_tick_medium + ' color-primary-green'
                                                            : shield_medium + ' color-primary-blue'
                                                            } icon-md `}
                                                        onClick={() => setSecureMessages(!isSecureMessage)}
                                                    />
                                                </RSTooltip>
                                                {!!deliveryType && (
                                                    <RSTooltip text={RESET}>
                                                        <i
                                                            id="rs_data_refresh"
                                                            className={`${restart_medium} icon-md color-primary-blue `}
                                                            onClick={() => UpdateState(setModal, 'isRefresh', true)}
                                                        />
                                                    </RSTooltip>
                                                )}

                                                {/* <RSTooltip text={`Add inbox classification`}>
                                                        <i
                                                            className={`${circle_plus_fill_medium} icon-md color-primary-blue`}
                                                            onClick={() => {}}
                                                        />
                                                    </RSTooltip> */}
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                                {deliveryType?.id === 5 && (
                                    <InpageContainer
                                        data={{
                                            appId: notification?.web?.mobileAppId || mobileAppIdState,
                                            domainName: notification?.web?.webPushDomain?.domainUrl || domain?.domainUrl,
                                            bannerDetails: notification?.web?.inPageBanner,
                                            editDetails: {
                                                bannerId: notificationEditData?.bannerId || 0,
                                                bannerName: notificationEditData?.bannerName || '',
                                            },
                                        }}
                                        type="web"
                                        onBannerSelect={(selectedBanner) => {
                                            dispatch(
                                                updateNotificationWeb({
                                                    field: 'inPageBanner',
                                                    data: selectedBanner,
                                                }),
                                            );
                                        }}
                                    />
                                )}
                                {!!deliveryType && (
                                    <Fragment>
                                        {isDeliverTypeOverlay &&
                                            deliveryType?.value !== 'In-app inbox' &&
                                            deliveryType?.id !== 5 && (
                                                <div className="form-group">
                                                    <Row>
                                                        <Col sm={{ offset: 1, span: 2 }}>
                                                            <label className="control-label-left">
                                                                {LAYOUT_POSITION_PH}
                                                            </label>
                                                        </Col>
                                                        <Col sm={isLayoutPositionModal ? 3 : 6}>
                                                            <RSKendoDropDownList
                                                                control={control}
                                                                data={LAYOUT_POSITION}
                                                                name={'layoutPosition'}
                                                                label={LAYOUT}
                                                                dataItemKey={'id'}
                                                                textField={'value'}
                                                                rules={{
                                                                    required: SELECT_LAYOUT_POSITION,
                                                                }}
                                                                required
                                                                handleChange={(e) => {
                                                                    const { value } = e;
                                                                    if (value?.value === 'Carousel') {
                                                                        setSplitTabs([
                                                                            ...INITIAL_CAROUSEL_STATE(
                                                                                setDirtyReset,
                                                                            ),
                                                                        ]);
                                                                        setTabs({
                                                                            currentTab: 0,
                                                                            splitTabsList: ['splitA', 'splitB'],
                                                                            confirmationModal: false,
                                                                        });
                                                                    } else {
                                                                        setValue('splitTest', false);
                                                                        setSplitTabs([
                                                                            ...INITIAL_SPLIT_AB_STATE(
                                                                                setDirtyReset,
                                                                            ),
                                                                        ]);
                                                                    }

                                                                    if (splitTest || isLayoutCarousel) {
                                                                        setValue('splitTest', true);
                                                                        setSliderState({
                                                                            show: false,
                                                                            splittedCount: {},
                                                                        });
                                                                        setSecureMessages(false);
                                                                        // setTabs({
                                                                        //     currentTab: 0,
                                                                        //     splitTabsList: ['splitA', 'splitB'],
                                                                        //     confirmationModal: false,
                                                                        // });
                                                                        setSplitTabs([
                                                                            ...INITIAL_SPLIT_AB_STATE(
                                                                                setDirtyReset,
                                                                            ),
                                                                        ]);
                                                                    }
                                                                    reset(
                                                                        ({
                                                                            audience,
                                                                            mobileApp,
                                                                            sendwebPushTo,
                                                                            domain,
                                                                            pushNotifyChannelDetailId,
                                                                            deliveryType,
                                                                            inboxClassification,
                                                                            layoutPosition,
                                                                            splitA,
                                                                            splitB,
                                                                            splitC,
                                                                            splitD,
                                                                            templateContent,
                                                                            contentType,
                                                                            contentInput,
                                                                            currentTabIndex,
                                                                        }) => ({
                                                                            ..._cloneDeep(
                                                                                FORM_INITIAL_STATE.defaultValues,
                                                                            ),
                                                                            ...(isTemplateFlow && templateContent && {
                                                                                contentType,
                                                                                contentInput,
                                                                                templateContent,
                                                                                currentTabIndex: deliveryType?.id === 1 || deliveryType?.id === 5 ? 0 : currentTabIndex,
                                                                            }),
                                                                            audience,
                                                                            mobileApp,
                                                                            domain,
                                                                            sendwebPushTo,
                                                                            pushNotifyChannelDetailId,
                                                                            deliveryType,
                                                                            inboxClassification,
                                                                            layoutPosition: value,
                                                                            splitTest: false,
                                                                            splitA: {
                                                                                ..._cloneDeep(
                                                                                    FORM_INITIAL_STATE
                                                                                        .defaultValues.splitA,
                                                                                ),
                                                                                pushNotifyChannelDetailId:
                                                                                    splitA.pushNotifyChannelDetailId,
                                                                            },
                                                                            splitB: {
                                                                                ..._cloneDeep(
                                                                                    FORM_INITIAL_STATE
                                                                                        .defaultValues.splitB,
                                                                                ),
                                                                                pushNotifyChannelDetailId:
                                                                                    splitB.pushNotifyChannelDetailId,
                                                                            },
                                                                            splitC: {
                                                                                ..._cloneDeep(
                                                                                    FORM_INITIAL_STATE
                                                                                        .defaultValues.splitC,
                                                                                ),
                                                                                pushNotifyChannelDetailId:
                                                                                    splitC.pushNotifyChannelDetailId,
                                                                            },
                                                                            splitD: {
                                                                                ..._cloneDeep(
                                                                                    FORM_INITIAL_STATE
                                                                                        .defaultValues.splitD,
                                                                                ),
                                                                                pushNotifyChannelDetailId:
                                                                                    splitD.pushNotifyChannelDetailId,
                                                                            },
                                                                        }),
                                                                        {
                                                                            keepDirty: true,
                                                                        },
                                                                    );
                                                                    setDirtyReset(true);
                                                                    // debugger;
                                                                    // reset((formState) => ({
                                                                    //     ...formState,
                                                                    //     ..._cloneDeep(refreshLayoutPosition),
                                                                    // }));
                                                                }}
                                                            />
                                                        </Col>
                                                        {isLayoutPositionModal && (
                                                            <Col md={3}>
                                                                <RSKendoDropDownList
                                                                    control={control}
                                                                    data={MODAL_POSISTION}
                                                                    name={'position'}
                                                                    label={POSITION}
                                                                    dataItemKey={'id'}
                                                                    textField={'value'}
                                                                    required
                                                                    rules={{
                                                                        required: SELECT_POSITION,
                                                                    }}
                                                                    handleChange={() => {
                                                                        if (isLayoutCarousel) {
                                                                            setValue('splitTest', true);
                                                                        }
                                                                    }}
                                                                />
                                                            </Col>
                                                        )}
                                                    </Row>
                                                </div>
                                            )}

                                        {shouldShowSplitABSwitch({
                                            isLayoutCarousel,
                                            campaignType: _get(location, 'campaignType', 'S'),
                                            dataSource,
                                            levelNumber,
                                            deliveryTypeId: deliveryType?.id,
                                        }) ? (
                                            <div className="form-group">
                                                <Row>
                                                    <Col sm={{ offset: 1, span: 2 }}>
                                                        <label className="control-label-left">
                                                            {SPLIT_AB_TEST_TEXT}
                                                        </label>
                                                    </Col>

                                                    <Col sm={1} className={!isSplitABEnable ? 'pe-none click-off' : 'cp'}>
                                                        <div
                                                            onClick={() => {
                                                                if (splitTest) {
                                                                    UpdateState(setTabs, 'confirmationModal', true);
                                                                } else {
                                                                    reset(
                                                                        (formState) => {
                                                                            const nextState = {
                                                                                ...formState,
                                                                                splitTest: true,
                                                                                ..._cloneDeep(refreshFields),
                                                                            };
                                                                            if (deliveryType?.id === 5) {
                                                                                const splitInit =
                                                                                    buildInPageSplitInitFromForm(formState);
                                                                                return {
                                                                                    ...nextState,
                                                                                    ...splitInit,
                                                                                    inPageBanner: formState.inPageBanner || null,
                                                                                };
                                                                            }
                                                                            return nextState;
                                                                        },
                                                                        {
                                                                            keepDirty: true,
                                                                        },
                                                                    );

                                                                    setSplitTabs([
                                                                        ...INITIAL_SPLIT_AB_STATE(setDirtyReset),
                                                                    ]);

                                                                    if (calucateAudienceCount > 0) {
                                                                        const defaultSplittedCount =
                                                                            calculateDefaultSplittedCount(
                                                                                2,
                                                                                calucateAudienceCount,
                                                                                ['splitA', 'splitB'],
                                                                            );
                                                                        setSliderState({
                                                                            show: false,
                                                                            splittedCount: defaultSplittedCount,
                                                                        });
                                                                        setValue('sliderSplitter', defaultSplittedCount);
                                                                    } else {
                                                                        setSliderState({
                                                                            show: false,
                                                                            splittedCount: {},
                                                                        });
                                                                        setValue('sliderSplitter', {});
                                                                    }
                                                                }
                                                            }}
                                                        >
                                                            {splitTest && emptySplitdate?.text && (
                                                                <small className="alert alert-danger d-block color-primary-red position-absolute px7 top-35 splitab-error-text">
                                                                    {AUTO_SCHEDULE_SPLITS}
                                                                </small>
                                                            )}
                                                            <RSSwitch
                                                                control={control}
                                                                name={'splitTest'}
                                                                preventChange
                                                            />
                                                        </div>
                                                    </Col>
                                                    <Col sm={8} className="pl0 d-flex">
                                                        <div className="pl0 d-flex align-items-center">
                                                            {splitTest && (
                                                                <Fragment>
                                                                    <RSTooltip
                                                                        text={ADJUST_SPLIT_SIZE}
                                                                        className={`lh0 mr15 ${!isSplitSizeEnable ? 'click-off' : ''}`}
                                                                    >
                                                                        <i
                                                                            className={`${adjust_split_medium} icon-md color-primary-blue ${!isSplitSizeEnable ? 'click-off' : ''}`}
                                                                            onClick={() => {
                                                                                if (!isSplitSizeEnable) return;
                                                                                setSliderState((prev) => ({
                                                                                    ...prev,
                                                                                    show: true,
                                                                                }));
                                                                            }}
                                                                        />
                                                                    </RSTooltip>
                                                                    <RSTooltip
                                                                        text={AUTO_SCHEDULE}
                                                                        className="lh0 mr15"
                                                                    >
                                                                        <i
                                                                            className={`${timer_medium} icon-md  color-primary-blue `}
                                                                            onClick={() => {
                                                                                // debugger;
                                                                                let emptySplit = '';
                                                                                let isError = {};
                                                                                const formState = getValues();
                                                                                _forEach(tabsData, (tab) => {
                                                                                    const date =
                                                                                        formState[tab]?.['schedule'] ||
                                                                                        null;
                                                                                    if (!date) {
                                                                                        emptySplit += emptySplit
                                                                                            ? `, ${tab}`
                                                                                            : tab;
                                                                                        setEmptySplitDate(() => ({
                                                                                            text: `Schedule  ${emptySplit} `,
                                                                                        }));
                                                                                        setTimeout(() => {
                                                                                            setEmptySplitDate(() => ({
                                                                                                text: ``,
                                                                                            }));
                                                                                        }, 3000);
                                                                                        isError[tab] = true;
                                                                                    } else {
                                                                                        isError[tab] = false;
                                                                                    }
                                                                                });
                                                                                handleAutoScheduleModal(isError);
                                                                            }}
                                                                        ></i>
                                                                    </RSTooltip>
                                                                </Fragment>
                                                            )}
                                                            <RSPPophover
                                                                pophover={
                                                                    <>
                                                                        <ul className="rs-tooltip-text-multi">
                                                                            <li>{SPLIT_AB_TEST_REQUIRES}</li>
                                                                            <li>{COMMUNICATION_LIST_SCREEN}</li>
                                                                        </ul>
                                                                    </>
                                                                }
                                                            >
                                                                {!splitTest ? (
                                                                    <i
                                                                        className={`${circle_question_mark_mini} icon-xs top6 left-5 color-primary-blue position-relative`}
                                                                        id="circle_question_mark"
                                                                    ></i>
                                                                ) : (
                                                                    <i
                                                                        className={`${circle_question_mark_medium} icon-md color-primary-blue`}
                                                                        id="circle_question_mark"
                                                                    ></i>
                                                                )}
                                                            </RSPPophover>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </div>
                                        ) : null}
                                        {sliderState.show && isSplitSizeEnable && (
                                            <SplitSlider
                                                audienceCount={calucateAudienceCount}
                                                splitTabs={tabs.splitTabsList}
                                                sliderData={sliderState.splittedCount}
                                                onSave={(slider) => {
                                                    setSliderState({
                                                        show: false,
                                                        splittedCount: slider,
                                                    });
                                                    setValue(`sliderSplitter`, slider);
                                                }}
                                                handleClose={() =>
                                                    setSliderState((prev) => ({
                                                        ...prev,
                                                        show: false,
                                                    }))
                                                }
                                            />
                                        )}
                                        {contentConfig?.status ? (
                                            contentConfig?.isSplitAB ? (
                                                isNotificationContentShown && (
                                                    <div
                                                        ref={tabberRef}
                                                        className={`${contentClickOffClass} no-scroll-rs-content-tabs`}
                                                    >
                                                        <RSTabbar
                                                            dynamicTab={`res-content-tabs-split mb30`}
                                                            componentClassName={'w-100'}
                                                            flatTabs
                                                            tabData={splitTabs}
                                                            defaultTab={tabs?.currentTab}
                                                            isRemoveConfirmation
                                                            callBack={(_, index, isForceUpdate) => {
                                                                // setTabs((prev) => ({
                                                                //     ...prev,
                                                                //     currentTab: index,
                                                                // }));
                                                                let updateObj = { ...tabs, currentTab: index };
                                                                setTabs(updateObj);
                                                                setValue('currentSplitTab', index);
                                                                setValue('currentTab', index);
                                                                setValue('channelType', type);
                                                                // if (Object.keys(errors)?.length) clearErrors();
                                                                if (!isForceUpdate && !_isEmpty(errors))
                                                                    tabs?.splitTabsList.forEach((name) => {
                                                                        clearErrors(`${name}.tabErrorText`);
                                                                    });
                                                            }}
                                                            onAddMenu={(index) => onAddTab(index)}
                                                            onRemoveMenu={onRemoveTab}
                                                        />
                                                    </div>
                                                )
                                            ) : (
                                                isNotificationContentShown && (
                                                    <div className={contentClickOffClass}>
                                                        <SplitAB
                                                            key={'noSplitAb'}
                                                            type={type}
                                                            campaignType={location?.campaignType}
                                                            levelNumber={levelNumber}
                                                            setDirtyReset={setDirtyReset}
                                                        />
                                                    </div>
                                                )
                                            )
                                        ) : null}

                                        {/* <RequestApproval name="approvalList.name" parent="approvalList" /> */}
                                        {/* <RFA
                                        name="approvalList.name"
                                        isSendButton
                                        parent="approvalList"
                                        isCustomapproval={false}
                                        isCustomEnterMail={true}
                                        isRequestApprovalCheck={false}
                                        onRequestApproval={(status) => {
                                            const type = status ? 'test preview' : 'request for approval';
                                            setValue('isSendTestMail', 2);
                                            handleSubmit((data) => onFormSubmit(data, 'send', false))();
                                        }}
                                    /> */}
                                        {deliveryType?.id !== 4 && isContentSetupForRfa && (
                                            <div className={isPastPlanDurationBlocked ? PAST_PLAN_DURATION_CLICK_OFF_CLASS : ''}>
                                                <RequestApproval
                                                    name="approvalList.name"
                                                    isSendButton
                                                    parent="approvalList"
                                                    isCustomapproval={false}
                                                    isCustomEnterMail={true}
                                                    isClickOff={isPastPlanDurationBlocked || isSubmitting}
                                                    isSendLoading={isSendLoading}
                                                    onRequestApproval={(status) => {
                                                        if (isPastPlanDurationBlocked) return;
                                                        const type = !status ? 'send' : 'request for approval';
                                                        setValue('isSendTestMail', !status ? 2 : 4);
                                                        handleSubmit((data) => onFormSubmit(data, type, false, false))();
                                                    }}
                                                    isApprovalSettings
                                                    channelType={'notif'}
                                                    testPreviewConfigDetail={{
                                                        fieldType: 'kendoDropdown',
                                                        fieldLabel: 'Test notification',
                                                        fieldName: 'approvalList.testEmail',
                                                        testEmail: false,
                                                    }}
                                                    RfaCallBack={(isRFA) => {
                                                        let schedulerName = splitTest
                                                            ? `${tabs?.splitTabsList?.[tabs?.currentTab]}.schedule`
                                                            : 'schedule';
                                                        if (!isRFA) {
                                                            const currentSchedule = getValues(schedulerName);
                                                            unregister(schedulerName);
                                                            if (currentSchedule) {
                                                                setValue(schedulerName, currentSchedule, {
                                                                    shouldValidate: true,
                                                                });
                                                            } else {
                                                                setValue(schedulerName, '', { shouldValidate: true });
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </Fragment>
                                )}
                            </div>
                            <div className="buttons-holder">
                                <RSSecondaryButton
                                    onClick={() => {
                                        if (location?.campaignType === 'M') {
                                            handleMdcCancel();
                                        } else {
                                            dispatch(resetCreateCommunication());
                                            navigate('/communication', {
                                                replace: true,
                                                state: {
                                                    index: 0,
                                                },
                                            });
                                        }
                                    }}
                                >
                                    {CANCEL}
                                </RSSecondaryButton>
                                {disableNext && (
                                    <>
                                        <RSSecondaryButton
                                            className={`color-primary-blue ${isPastPlanDurationBlocked ? PAST_PLAN_DURATION_CLICK_OFF_CLASS : ''}`}
                                            onClick={() => {
                                                if (isPastPlanDurationBlocked) return;
                                                const formData = getValues();
                                                const isCTGTConfirm = handleCheckCTGT(formData.audience);
                                                const hasUserConfirmed = formData.isCGTGConfirm === true;

                                                // Only show modal if CG/TG conflict exists and user hasn't confirmed yet
                                                if (isCTGTConfirm && !hasUserConfirmed && !handleCGTGModalCheck(notificationEditData?.content?.[0]?.statusId)) {
                                                    setPendingNextSubmitParams({ type: 'save', isSchedule: true });
                                                    setNextButtonCGTGModal(true);
                                                    return;
                                                }

                                                setSaveTypeTerm('save');
                                                setValue('isSendTestMail', 0);
                                                handleSubmit((data) => onFormSubmit(data, 'save', true))();
                                            }}
                                            isLoading={isSaveLoading}
                                            blockBodyPointerEvents
                                            disabledClass={isSubmitting ? 'pe-none click-off' : ''}
                                        >
                                            {SAVE}
                                        </RSSecondaryButton>
                                        <RSPrimaryButton
                                            className={isPastPlanDurationBlocked ? PAST_PLAN_DURATION_CLICK_OFF_CLASS : ''}
                                            isLoading={isNextLoading}
                                            blockBodyPointerEvents
                                            disabledClass={isSubmitting ? 'pe-none click-off' : ''}
                                            onClick={() => {
                                                if (isPastPlanDurationBlocked) return;
                                                const hasWebUrl = !!domain && !!domain.domainUrl;
                                                if (
                                                    !isDirty &&
                                                    !dirtyReset &&
                                                    !isValid &&
                                                    location?.campaignType !== 'M' &&
                                                    !hasWebUrl
                                                ) {
                                                    if (!shouldPromptSkipChannelConfirmation()) {
                                                        handleNavigation();
                                                        return;
                                                    }
                                                    setNavigate_confirm(true);
                                                } else {
                                                    const formData = getValues();
                                                    const isCTGTConfirm = handleCheckCTGT(formData.audience);
                                                    const hasUserConfirmed = formData.isCGTGConfirm === true;

                                                    // Only show modal if CG/TG conflict exists and user hasn't confirmed yet
                                                    if (isCTGTConfirm && !hasUserConfirmed && !handleCGTGModalCheck(notificationEditData?.content?.[0]?.statusId)) {
                                                        setPendingNextSubmitParams({ type: 'form', isSchedule: false });
                                                        setNextButtonCGTGModal(true);
                                                        return;
                                                    }

                                                    setSaveTypeTerm('next');
                                                    setValue('isSendTestMail', 0);
                                                    handleSubmit((data) => onFormSubmit(data, 'form', false))();
                                                }
                                            }}
                                        >
                                            {location?.campaignType === 'M' && mdcChannelDetailId > 0
                                                ? 'Update notification content'
                                                : location?.campaignType === 'M' && mdcChannelDetailId === 0
                                                    ? 'Create notification content'
                                                    : NEXT}
                                        </RSPrimaryButton>
                                    </>
                                )}
                            </div>
                            <RSConfirmationModal
                                show={modal?.scheduleConfirmModal || tabs?.confirmationModal}
                                text={
                                    tabs?.confirmationModal
                                        ? SPLIT_AB_TURNOFF
                                        : COMMUNICATION_SCHEDULED
                                }
                                primaryButtonText={tabs?.confirmationModal ? OK : SAVE}
                                handleClose={() => {
                                    if (tabs?.confirmationModal) {
                                        UpdateState(setTabs, 'confirmationModal', false);
                                    } else {
                                        UpdateState(setModal, 'scheduleConfirmModal', false);
                                    }
                                }}
                                handleConfirm={() => {
                                    if (tabs?.confirmationModal) {
                                        disableSplitTabs();
                                    } else {
                                        // UpdateState(setModal, 'scheduleConfirmModal', false);
                                        // debugger;
                                        setModal((prev) => ({
                                            ...prev,
                                            scheduleConfirmModal: false,
                                        }));
                                        if (false)
                                            handleSubmit((data) => onFormSubmit(data, formTypeRef.current, true, false))();
                                        else {
                                            handleSubmit((data) => onFormSubmit(data, formTypeRef.current, false, false))();
                                        }

                                        // console.log('AASDASDAS');

                                        // handleNavigation();
                                    }
                                }}
                            />
                        </form>
                    </div>
                    {/* //Modals */}
                    <SplitABScheduleModal
                        tabs={tabs?.splitTabsList}
                        show={scheduleModal}
                        type="notification"
                        handleClose={() => setShowScheduleModal(false)}
                        editAutoScheduleDetails={editAutoScheduleDetails}
                    />

                    {modal.sendConfirmModal &&
                        <CommunicationSent
                            show={modal.sendConfirmModal}
                            status={modal?.status}
                            handleClose={() => {
                                if (modal?.isRFA != undefined && modal?.isRFA == true) {
                                    rfaManuallyClosedRef.current = true;
                                    if (rfaAutoNavTimeoutRef.current) {
                                        clearTimeout(rfaAutoNavTimeoutRef.current);
                                        rfaAutoNavTimeoutRef.current = null;
                                    }
                                    setModal((prev) => ({
                                        ...prev,
                                        sendConfirmModal: false,
                                        isRFA: false,
                                    }));
                                    location['campaignType'] === 'M'
                                        ? handleMdcNavigation({ data: saveCampaigData })
                                        : handleNavigation();
                                } else {
                                    setModal((prev) => ({
                                        ...prev,
                                        sendConfirmModal: false,
                                        testSentCommunicationModal: false,
                                        status: '',
                                    }))
                                }
                            }
                            }
                            rfaMsg={modal?.isRFA}
                            isCloseButton={modal?.isRFA ? false : true}
                        />}

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
                            setDirtyReset(false);
                        }}
                    />
                    <RSConfirmationModal
                        header={RESET}
                        show={modal.isRefresh}
                        text={ARE_YOU_SURE_WANT_TO_RESET}
                        primaryButtonText={YES}
                        handleClose={() => UpdateState(setModal, 'isRefresh', false)}
                        handleConfirm={() => {
                            if (splitTest || isLayoutCarousel) {
                                setSliderState({ show: false, splittedCount: {} });
                                setSecureMessages(false);
                                setTabs({
                                    currentTab: 0,
                                    splitTabsList: ['splitA', 'splitB'],
                                    confirmationModal: false,
                                });
                                setSplitTabs([...INITIAL_SPLIT_AB_STATE(setDirtyReset)]);
                            }
                            reset(
                                ({
                                    audience,
                                    mobileApp,
                                    sendwebPushTo,
                                    domain,
                                    pushNotifyChannelDetailId,
                                    splitA,
                                    splitB,
                                    splitC,
                                    splitD,
                                    contentType,
                                    contentInput,
                                    templateContent,
                                    currentTabIndex,
                                }) => ({
                                    ..._cloneDeep(FORM_INITIAL_STATE.defaultValues),
                                    ...(isTemplateFlow && templateContent && {
                                        contentType,
                                        contentInput,
                                        templateContent,
                                        currentTabIndex: deliveryType?.id === 1 || deliveryType?.id === 5 ? 0 : templateContent ? currentTabIndex : 0
                                    }),
                                    audience,
                                    mobileApp,
                                    domain,
                                    sendwebPushTo,
                                    pushNotifyChannelDetailId,
                                    inPageBanner: null,
                                    splitA: {
                                        ..._cloneDeep(FORM_INITIAL_STATE.defaultValues.splitA),
                                        pushNotifyChannelDetailId: splitA.pushNotifyChannelDetailId,
                                    },
                                    splitB: {
                                        ..._cloneDeep(FORM_INITIAL_STATE.defaultValues.splitB),
                                        pushNotifyChannelDetailId: splitB.pushNotifyChannelDetailId,
                                    },
                                    splitC: {
                                        ..._cloneDeep(FORM_INITIAL_STATE.defaultValues.splitC),
                                        pushNotifyChannelDetailId: splitC.pushNotifyChannelDetailId,
                                    },
                                    splitD: {
                                        ..._cloneDeep(FORM_INITIAL_STATE.defaultValues.splitD),
                                        pushNotifyChannelDetailId: splitD.pushNotifyChannelDetailId,
                                    },
                                }),
                                {
                                    keepDirty: true,
                                },
                            );
                            const emptyBanner = { bannerId: '', bannerName: '' };
                            dispatch(updateNotificationWeb({ field: 'inPageBanner', data: emptyBanner }));
                            setValue('inPageBanner', null);
                            setNotificationEditData((prev) => ({ ...prev, bannerId: 0, bannerName: '' }));
                            UpdateState(setModal, 'isRefresh', false);
                            setDirtyReset(true);
                        }}
                    />
                    {getWarningPopupMessage(failureApiErrors, dispatch, handleFailureNavigation)}
                    <RSConfirmationModal
                        show={isAudienceChangeConfirm}
                        text={AUDIENCE_CHANGE_CONFIRMATION}
                        primaryButtonText="Yes, proceed"
                        secondaryButtonText="Cancel"
                        handleClose={() => {
                            setValue('audience', previousAudience);
                            setIsAudienceChangeConfirm(false);
                        }}
                        handleConfirm={async () => {
                            const payloadParams = {
                                departmentId,
                                clientId,
                                userId,
                            };
                            await handlePersonalizationFetchApiCall({
                                audience: watch('audience'),
                                errors,
                                dispatch,
                                payloadParams,
                                listTypeWisePersonlization,
                            });
                            setIsAudienceChangeConfirm(false);
                        }}
                    />
                    <RSConfirmationModal
                        show={audienceCountZeroWarning}
                        text={AUDIENCE_COUNT_ZERO_ENABLE_AUTO_REFRESH}
                        primaryButtonText="OK"
                        handleClose={() => setAudienceCountZeroWarning(false)}
                        handleConfirm={() => setAudienceCountZeroWarning(false)}
                        secondaryButton={false}
                        header={WARNING}
                    />
                    <RSConfirmationModal
                        show={nextButtonCGTGModal}
                        header="Mixed Control Group Settings Detected"
                        text="Selected lists have different Control Group settings and won't be applied now. Enable it in Pre-Campaign Summary to apply to all lists."
                        primaryButtonText="Proceed"
                        secondaryButtonText="Cancel"
                        handleClose={() => {
                            setNextButtonCGTGModal(false);
                            setPendingNextSubmitParams(null);
                        }}
                        handleConfirm={async () => {
                            setNextButtonCGTGModal(false);
                            setValue('isCGTGConfirm', true);
                            setValue('isCGTGEnabled', false);

                            if (pendingNextSubmitParams) {
                                setSaveTypeTerm(pendingNextSubmitParams.type === 'form' ? 'next' : 'save');
                                setValue('isSendTestMail', 0);
                                handleSubmit((data) =>
                                    onFormSubmit(data, pendingNextSubmitParams.type, pendingNextSubmitParams.isSchedule),
                                )();
                            }
                            setPendingNextSubmitParams(null);
                        }}
                    />
                </NotificationProvider.Provider>
            </AuthoringChannelEditSkeletonGate>
        </FormProvider>
    );
};

export default Notification;
