import { campaignSchedule, checkRFAApproved, checkTrigger, diff_minutes, statusIdCheck, validateRFAMandatory } from 'Utils/modules/campaignUtils';
import { convertUserTimezoneToTarget, getYYMMDD } from 'Utils/modules/dateTime';
import { checkScheduleDate } from 'Utils/modules/display';
import { mapAudienceWithChannelLabels } from 'Utils/modules/formatters';
import { getmasterData } from 'Utils/modules/masterData';
import { createCommunicationSettingsNavState, MESSAGING_TAB_ID } from 'Utils/modules/navigation';
import { encodeUrl, getUserDetails } from 'Utils/modules/crypto';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { EXCEPTION_OCCURRED, Select_SENDER_NAME, SELECT_TEMPLATE_NAME } from 'Constants/GlobalConstant/ValidationMessage';
import { ADD_SENDER_ID, ADJUST_SPLIT_SIZE, ARE_YOU_SURE_WANT_TO_RESET, AUDIENCE, AUDIENCE_CHANGE_CONFIRMATION, AUDIENCE_COUNT_ZERO_ENABLE_AUTO_REFRESH, AUTO_REFRESH, AUTO_REFRESH_POP_HOVER_TEXT, AUTO_SCHEDULE_SPLITS, CANCEL, CHECK_START_DATE_AND_END_DATE, COMMUNICATION_SCHEDULED, COMMUNICATION_SUCCESSFULLY_SENT, CONFIRMATION, IGNORE_CHANNEL, LABLE_SPLIT_AB, LIVE_PREVIEW_SENT, MINIMUM_DIFFERENCE_SPLITS, NEXT, OK, RESET, SAVE, SENDER_NAME, SPLIT_AB_TOOLTIP_TEXT, SPLIT_AB_TURNOFF, TEMPLATE_NAME, TEST_PREVIEW_SENT, WARNING } from 'Constants/GlobalConstant/Placeholders';
import { adjust_split_medium, circle_minus_fill_large, circle_minus_fill_medium, circle_plus_edge_medium, circle_plus_medium, circle_question_mark_medium, circle_question_mark_mini, refresh_medium, restart_medium, timer_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Col, Row } from 'react-bootstrap';
import { get as _get, map as _map, isEmpty as _isEmpty, find as _find, filter as _filter, uniqBy as _uniqBy, cloneDeep as _cloneDeep, forEach as _forEach } from 'Utils/modules/lodashReplacements';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSDropdownFooterBtn from 'Components/DropdownFooterBtn';
import { get_Rcs_Content_Template, get_Rcs_Sendername, get_Rcs_Template, getContactByUserId, save_Rcs_Campaign, getAudienceList, Get_RCS_Campaign } from 'Reducers/communication/createCommunication/Create/request';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';

import { getAudience, getRcsList } from 'Reducers/communication/createCommunication/Create/selectors';
import useQueryParams from 'Hooks/useQueryParams';
import useApiLoader from 'Hooks/useApiLoader';
import useComponentWillUnmount from 'Hooks/useComponentWillUnMount';
import { getRequestApprovalList, getSessionId, getUtcTimeData } from 'Reducers/globalState/selector';
import { getUtcTimeNow, getUserListCampaign } from 'Reducers/globalState/request';
import RSCheckbox from 'Components/FormFields/RSCheckbox';

import { ensureArray, ensureObject, sanitizeChannelCount, sumAudienceCountByField, normalizeChannelCampaignData, ensureSegmentationListIds, getCampaignStatusId } from 'Pages/AuthenticationModule/Communication/CreateCommunication/communicationDefaults';
import {
    buildPayload,
    CONTENT_TAB_DATA,
    extractPlaceholders,
    INTERACTIVITY_DATA,
    RCS_CAROUSEL_NAME,
    rcsFieldName,
    rcsFormInitialState,
    sanitizeJsonString,
    SPLIT_TABS,
    SPLIT_AB_NAME,
    splitABRefreshFields,
    refreshFields,
} from './constant';
import { availableTabs, communicationChannels, getNextEligibleTabIndex, getChannelNavigationValues, handleAutoRefreshClickOff, handlePersonalizationFetchApiCall, MESSAGING_TAB_CHANNEL_MAP, calculateDefaultSplittedCount, AudienceFieldRenderComponent, audienceTypeList, handleMDCQueryParamsUpdate, handleCheckCTGT, validateAudienceCount, mergeChannelAudiences, handleUpdateEditAudienceCount,handleTotalAudienceCount, handleCGTGModalCheck, editActionIdFromCommunicationResponse, getPastPlanDurationBlockedState, validatePastPlanDurationOnSubmit, PAST_PLAN_DURATION_CLICK_OFF_CLASS , shouldPromptSkipChannelConfirmation} from '../../constant';
import RSTooltip from 'Components/RSTooltip';
import RSTabbar from 'Components/RSTabber';
import RSSwitch from 'Components/FormFields/RSSwitch/index';
import RSPPophover from 'Components/RSPPophover';
import { resetCreateCommunication, updateAudience, updateDirtyState, updateFilterAudience, updateRCSList, updateTab, updateVerticalTab, updateTotalAudienceCount, updateRCSEditorContent } from 'Reducers/communication/createCommunication/Create/reducer';
import TextContent from './Components/TextContent/TextContent';
import { COUNTRY_MASK } from '../VMS/constant';
import CommunicationSent from '../../Component/CommunicationSent/CommunicationSent';
import RSConfirmationModal from 'Components/ConfirmationModal';
import { updateSaveChannelsId, updateChannelAudiences } from 'Reducers/communication/createCommunication/plan/reducer';
import { showTabsSmartlink } from 'Reducers/communication/createCommunication/smartlink/reducer';
import SmartLinkEnable from '../../Component/SmartLinkEnable/SmartLinkEnable';
import AuthoringChannelEditSkeletonGate, {
    AUTHORING_FIELD_LOADER_CONFIG,
    getAuthoringEditFieldLoaderConfig,
    getAuthoringSaveButtonType,
    resetAuthoringChannelEditSession,
    useAuthoringChannelEditLoader,
    useAuthoringChannelSaveLoader,
} from 'Components/Skeleton/pages/communication/authoring';
import SplitAB from './Components/SplitAB/SplitAB';
import SplitSlider from '../../Component/SplitSlider/SplitSlider';
import SplitABScheduleModal from '../../Component/SplitABScheduleModal';
import RequestApproval from 'Pages/AuthenticationModule/Components/RequestApproval/RequestApproval';
// import { UpdateState } from 'Utils/modules/misc';
export const RCSProvider = createContext({
    carouselTabs: [],
    mask: [],
    country: '',
    setCountry: () => {},
    formSubmitHandler: () => {},
    fetchRCSTemplateContent: () => {},
    buildChannelPayload: () => ({}),
    isFailure: { status: false, message: '' },
    setIsFailure: () => {},
    preview: false,
    setPreview: () => {},
    type: 'rcs',
    dataSource: 'TL',
    levelNumber: 1,
    isTemplateListLoading: false,
    isTemplateContentLoading: false,
});

const RCS = ({ channelId, mCampType }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useQueryParams('/communication');

    const {
        senderName: senderNameList,
        templateList,
        templateContentDetail,
        campaignDetails,
        editorContent,
    } = useSelector((state) => getRcsList(state) ?? {});
    const approvalList = useSelector((state) => getRequestApprovalList(state));
    let audienceList = useSelector((state) => getAudience(state)) ?? [];
    const { failureApiErrors, isCurrentBURFAStatus } = useSelector(({ globalstate = {} }) => globalstate);
    const { savedChannelsId, channelAudiences = {} } = useSelector(
        ({ communicationPlanReducer = {} }) => communicationPlanReducer ?? {},
    );
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state) ?? {});
    const utcTimeData = useSelector(getUtcTimeData);
    const {
        tabsState: { messaging: messagingTabState = {} } = {},
        activeTabs,
        verticalTab: { type: channelType, currentTab: currentVerticalTab } = {},
        isDirty,
        isMDCEditMode,
        personalization,
        listTypeWisePersonlization,
    } = useSelector(({ createCommunicationReducer = {} }) => createCommunicationReducer ?? {});
    const { tabSmartLink_Flag } = useSelector(({ smartLinkReducer = {} }) => smartLinkReducer ?? {});

    const { isMounted } = useComponentWillUnmount();
    const isEditCallRef = useRef(false);
    const formTypeRef = useRef(null);
    const rfaAutoNavTimeoutRef = useRef(null);
    const rfaManuallyClosedRef = useRef(false);
    const audienceRef = useRef();

    const [campaignTypeAndId, setCampaignTypeAndId] = useState({});
    const [updateTabData, setUpdateTabData] = useState([]);
    const [carouselTabs, setCarouselTabs] = useState({});
    const [cTabState, setCTabState] = useState([]);
    const [mask, setMask] = useState(COUNTRY_MASK);
    const [country, setCountry] = useState('');
    const [isTestCommSent, setisTestComSent] = useState({
        show: false,
        message: 'Falied',
        isRFA: false,
        status: false,
        smsPreview: false,
    });
    const [navigate_confirm, setNavigate_confirm] = useState(false);
    const [isAudienceChangeConfirm, setIsAudienceChangeConfirm] = useState(false);
    const [previousAudience, setPreviousAudience] = useState([]);
    const [levelNumber, setLevelNumber] = useState(1);
    const [isNotScheduled, setIsNotScheduled] = useState(false);
    const [isClickOff, setIsClickOff] = useState(false);
    const [isReset, setIsReset] = useState(false);
    const [isFailure, setIsFailure] = useState({
        status: false,
        message: '',
    });
    const [preview, setPreview] = useState(false);
    const [mdcContentSetupDetails, setMdcContentSetupDetails] = useState({
        levelNumber: 1,
        actionId: 0,
        dataSource: 'TL',
        mdcButtonText: 'Create',
    });
    const [splitTabs, setSplitTabs] = useState(SPLIT_TABS);
    const [splitTabConfig, setSplitTabConfig] = useState({
        currentTab: 0,
        splitTabs: ['splitA', 'splitB'],
    });
    const [sliderState, setSliderState] = useState({
        show: false,
        splittedCount: {},
    });
    const [emptySplitdate, setEmptySplitDate] = useState({
        text: '',
    });
    const [editAutoScheduleDetails, setEditAutoScheduleDetails] = useState({});
    const [issplitOffConfirmationModal, setIsSplitOffConfirmationModal] = useState(false);
    const [isShowScheduleModal, setIsShowScheduleModal] = useState(false);
    const [nextButtonCGTGModal, setNextButtonCGTGModal] = useState(false);
    const [audienceCountZeroWarning, setAudienceCountZeroWarning] = useState(false);
    const [pendingNextSubmitParams, setPendingNextSubmitParams] = useState(null);
    const [userKeyInfo, setUserInfo] = useState(approvalList);
    const [saveCampaigData, setSaveCampaigData] = useState(null);

    const methods = useForm(rcsFormInitialState);
    const {
        control,
        handleSubmit,
        getValues,
        watch,
        setError,
        setFocus,
        clearErrors,
        setValue,
        reset,
        resetField,
        trigger,
        unregister,
        formState: { dirtyFields, isValid, errors },
    } = methods;
    const [
        watchSenderName,
        watchAudience,
        watchTemplateName,
        currentTabIndex,
        watchPhoneNumber,
        watchApprovalList,
        watchSplitTest,
    ] = watch([...Object.values(rcsFieldName)]);
    const watchtotalAudience = watch('totalAudience');
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
    const calucateAudienceCount = useMemo(
        () => sumAudienceCountByField(watchAudience, 'recipientCountRCS'),
        [watchAudience],
    );
    const isSplitABEnable = calucateAudienceCount >= 100;
    const shouldDisableAutoRefresh = useMemo(() => handleAutoRefreshClickOff(watchAudience), [watchAudience]);

    const { timeZoneList } = getmasterData();

    const { showEditSkeleton, isSavedChannel, beginEditSkeleton, finishEditSkeleton, resetEditLoading } =
        useAuthoringChannelEditLoader({
        channelId,
        subChannelId: channelId,
        shouldLoadEdit: mCampType === 'M',
    });
    const savedChannel = isSavedChannel;
    const editFieldLoaderConfig = getAuthoringEditFieldLoaderConfig({
        showEditSkeleton,
        mCampType,
        savedChannel,
    });
    const { runSave, beginSubmit, endSubmit, isSaveLoading, isNextLoading, isSendLoading, isSubmitting } =
        useAuthoringChannelSaveLoader();

    const senderNameLoader = useApiLoader();
    const audienceLoader = useApiLoader();
    const contactLoader = useApiLoader();
    const templateListLoader = useApiLoader();
    const templateContentLoader = useApiLoader();

    useEffect(() => {
        if (!userKeyInfo?.length || !userKeyInfo) {
            getUsersList();
        }
    }, []);

    useEffect(() => {
        const isEditMode =
            _get(location, 'campaignType', 'S') === 'M'
                ? isMDCEditMode?.toLowerCase() === 'edit'
                : savedChannel;
        if (isEditMode) return;
        if (!watchApprovalList?.testPhoneNumber) {
            contactLoader
                .refetch({
                    fetcher: ({ payload } = {}) =>
                        dispatch(getContactByUserId({ payload, loading: false })),
                    mode: savedChannel ? 'edit' : 'create',
                    loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
                    params: { payload: { userId, clientId, departmentId } },
                })
                .then((rslt) => {
                    if (!isMounted.current || !rslt) return;
                    const {
                        status,
                        data: { phoneNo, countryCode } = {},
                    } = rslt;
                    if (status && countryCode) {
                        const tempCode = countryCode.includes('+') ? countryCode : `+${countryCode}`;
                        if (tempCode) {
                            const num = `${tempCode} ${phoneNo}`;
                            setValue('approvalList.testPhoneNumber', num);
                            setValue('approvalList.dialCode', tempCode);
                        }
                    }
                })
                .catch(() => {});
        }
    }, []);

    useEffect(() => {
        dispatch(updateTotalAudienceCount(calucateAudienceCount || 0));
    }, [calucateAudienceCount, dispatch]);

    useEffect(() => {
        if (!isSplitABEnable && watchSplitTest) refreshSplitABTab();
    }, [isSplitABEnable]);

    useEffect(() => {
        !watchSplitTest &&
            setEmptySplitDate({
                text: '',
            });
    }, [watchSplitTest]);

    useEffect(() => {
        if (location) {
            setCampaignTypeAndId({
                campaignType: _get(location, 'campaignType', 'S'),
                campaignId: _get(location, 'campaignId', 0),
                dynamiclistId: location?.campaignType === 'T' ? _get(location, 'dynamicListId', 0) : 0,
            });
            if (_get(location, 'campaignType', 'S') === 'M') {
                const mdcDetails = _get(location, 'mdcContentSetupDetails', {});
                const mdcLevelNumber = _get(mdcDetails, 'levelNumber', 1);
                const actionId = _get(mdcDetails, 'actionId', 0);
                const mdcChannelDetailId = _get(mdcDetails, 'channelDetailId', 0);
                const mdcAudience = _get(mdcDetails, 'audience', []);
                const dataSource = _get(mdcDetails, 'dataSource', []);
                const mdcIsCGTGEnabled = _get(mdcDetails, 'isCGTGEnabled', false);
                const mdcButtonText = mdcChannelDetailId ? 'Update' : 'Create';
                setMdcContentSetupDetails((pre) => ({
                    ...pre,
                    ...mdcDetails,
                    levelNumber: mdcLevelNumber,
                    actionId: actionId,
                    dataSource: dataSource,
                    mdcButtonText: mdcButtonText,
                    mdcAudience: mdcAudience,
                }));
                setLevelNumber(mdcLevelNumber);

                if (!mdcChannelDetailId) {
                    setValue('isCGTGEnabled', mdcIsCGTGEnabled);
                }
            }
        }
    }, [location]);

    useEffect(() => {
        if (
            checkTrigger(location?.campaignType, location?.endDate) ||
            !statusIdCheck(getCampaignStatusId(campaignDetails), location?.campaignType, campaignDetails) ||
            checkRFAApproved(
                getCampaignStatusId(campaignDetails),
                campaignDetails?.requestForApproval?.approvarList,
            )
        ) {
            setIsClickOff(true);
        } else {
            setIsClickOff(false);
        }
    }, [location?.campaignType, location?.endDate, campaignDetails?.content?.[0]?.statusId]);

    useEffect(() => {
        return () => {
            resetState(true);
            dispatch(updateAudience([]));
            dispatch(updateFilterAudience([]));
            resetAuthoringChannelEditSession(isEditCallRef, resetEditLoading);
        };
    }, [dispatch, resetEditLoading]);

    useEffect(() => {
        if (!_isEmpty(location) && !isEditCallRef?.current) {
            const isEditMode = handleEditCallApi();
            if (isEditMode) {
                isEditCallRef.current = true;
            }
            getRcsDetails();
        }
    }, [JSON.stringify(location)]);

    useEffect(() => {
        if (!isDirty && Object.keys(dirtyFields)?.length > 0) {
            dispatch(updateDirtyState(true));
        } else if (isDirty && Object.keys(dirtyFields)?.length === 0 && Object.keys(editorContent ?? {})?.length === 0) {
            dispatch(updateDirtyState(false));
        }
    }, [JSON.stringify(dirtyFields)]);

    useEffect(() => {
        if (shouldDisableAutoRefresh) {
            setValue('isAutoRefereshenabled', false);
        }
    }, [watchAudience, shouldDisableAutoRefresh]);

    const fetchSenderName = async (payload) => {
        try {
            return await senderNameLoader.refetch({
                fetcher: ({ payload: senderPayload } = {}) =>
                    dispatch(get_Rcs_Sendername({ payload: senderPayload, loading: false })),
                mode: savedChannel ? 'edit' : 'create',
                loaderConfig: editFieldLoaderConfig,
                params: {
                    payload: {
                        ...payload,
                        campaignId: _get(location, 'campaignId', 0),
                        senderId: 0,
                    },
                },
            });
        } catch {
            return { status: false };
        }
    };

    const fetchRCSTempateList = async (value) => {
        try {
            const payload = {
                userId,
                clientId,
                departmentId,
                campaignId: _get(location, 'campaignId', 0),
                senderId: value,
            };
            return await templateListLoader.refetch({
                fetcher: ({ payload: templatePayload } = {}) =>
                    dispatch(get_Rcs_Template({ payload: templatePayload, loading: false })),
                mode: savedChannel ? 'edit' : 'create',
                loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
                params: { payload },
            });
        } catch {
            return { status: false };
        }
    };
    const fetchAudienceList = async (payload) => {
        try {
            return await audienceLoader.refetch({
                fetcher: ({ payload: audPayload, isFilter = false } = {}) =>
                    dispatch(getAudienceList({ payload: audPayload, isFilter, loading: false })),
                mode: savedChannel ? 'edit' : 'create',
                loaderConfig: editFieldLoaderConfig,
                params: {
                    payload: {
                        searchText: '',
                        segmentIds: [],
                        channelType: 'RCS',
                        ...payload,
                    },
                },
            });
        } catch {
            return { status: false };
        }
    };
    const fetchRCSCampaign = async (payload, { enableGlobalLoader = false } = {}) => {
        const isMDCCampaign = _get(location, 'campaignType', 'S') === 'M';
        try {
            return await dispatch(
                Get_RCS_Campaign({
                    payload: {
                        ...payload,
                        campaignId: _get(location, 'campaignId', 0),
                        levelNumber: isMDCCampaign ? _get(location, 'mdcContentSetupDetails.levelNumber', 1) : 1,
                        actionId: isMDCCampaign ? _get(location, 'mdcContentSetupDetails.actionId', 0) : 1,
                        rcsChannelDetailId: _get(location, 'mdcContentSetupDetails.channelDetailId', 0),
                    },
                    loading: enableGlobalLoader,
                }),
            );
        } catch {
            return { status: false };
        }
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
    const fetchRCSTemplateContent = async (value, isSplit = false, fieldName = '') => {
        try {
            const payload = {
                userId,
                clientId,
                departmentId,
                campaignId: _get(location, 'campaignId', 0),
                templateId: value?.rcsTemplateId,
                templateType: value?.templateType,
            };
            const res = await templateContentLoader.refetch({
                fetcher: ({ payload: templatePayload } = {}) =>
                    dispatch(get_Rcs_Content_Template({ payload: templatePayload, loading: false })),
                mode: savedChannel ? 'edit' : 'create',
                loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
                params: { payload },
            });
            if (!isMounted.current) return;
            handleTemplate(res, value?.templateType, 'template', isSplit, fieldName);
        } catch {
            // template fetch failures are surfaced via failureApiErrors popup
        }
    };

    // Split AB tab management functions
    function numberToLetter(n) {
        if (n < 1 || n > 26) return null;
        return String.fromCharCode(96 + n);
    }

    const updateCurrentTab = (tabList = []) => {
        const newSplitTabs = _map(tabList, 'id');
        setSplitTabs(tabList);
        setSplitTabConfig(() => ({
            currentTab: tabList?.length - 1,
            splitTabs: newSplitTabs,
        }));

        // Recalculate splittedCount when tabs change
        const watchSplitTest = watch('splitTest');
        if (watchSplitTest && newSplitTabs.length >= 2 && calucateAudienceCount > 0) {
            const defaultSplittedCount = calculateDefaultSplittedCount(
                newSplitTabs.length,
                calucateAudienceCount,
                newSplitTabs,
            );
            setSliderState({
                show: false,
                splittedCount: defaultSplittedCount,
            });
        } else {
            setSliderState({
                show: false,
                splittedCount: {},
            });
        }
    };

    const removeSplitTabs = () => {
        const temp = [...splitTabs];
        const deleteTab = temp.pop();
        resetField(deleteTab.id);
        temp[temp?.length - 1] = {
            ...temp[temp?.length - 1],
            add: circle_plus_edge_medium,
            ...(temp?.length >= 3 && { remove: circle_minus_fill_large }),
        };
        updateCurrentTab(temp);
        setEmptySplitDate({
            text: '',
        });
    };

    const addSplitTabs = (index) => {
        const getSplitName = SPLIT_AB_NAME[index];
        const temp = [...splitTabs];
        delete temp[temp?.length - 1].add;
        delete temp[temp?.length - 1].remove;
        temp.push({
            ...getSplitName,
            component: () => <SplitAB fieldName={getSplitName.id} key={getSplitName.id} isSplitTabs />,
            remove: circle_minus_fill_large,
            ...(temp?.length < 3 && { add: circle_plus_edge_medium }),
        });
        updateCurrentTab(temp);
    };

    const refreshSplitABTab = (isPopup = false) => {
        reset(
            (formState) => ({
                ...formState,
                splitscehdule: {
                    autoSchedule: false,
                    communicationPerformanceBy: 'Content',
                    duration: '',
                    time: 'Hour(s)',
                },
                splitTest: false,
                splitA: {
                    ..._cloneDeep(splitABRefreshFields),
                },
                splitB: {
                    ..._cloneDeep(splitABRefreshFields),
                },
                splitC: {
                    ..._cloneDeep(splitABRefreshFields),
                },
                splitD: {
                    ..._cloneDeep(splitABRefreshFields),
                },
            }),
            {
                keepDirty: true,
            },
        );
        if (isPopup) setIsSplitOffConfirmationModal(false);
    };

    const handleAutoScheduleModal = (error) => {
        if (Object.values(error)?.every((item) => item === false)) {
            setIsShowScheduleModal(true);
            setEmptySplitDate({
                text: '',
            });
        }
    };
    const getUsersList = async () => {
        try {
            const usersRes = await dispatch(
                getUserListCampaign({ payload: { clientId, userId, loggedinusertype: 0 }, loading: false }),
            );
            const userList = usersRes?.status ? usersRes?.data : [];
            const users = _map(ensureArray(userList), (list) => ({
                ...list,
                name: `${list.firstName} (${list.email})`,
            }));
            if (!isMounted.current) return users;
            setUserInfo(users);
            return users;
        } catch {
            if (isMounted.current) setUserInfo([]);
            return [];
        }
    };

    const handleEditCallApi = () => {
        const isMDC = _get(location, 'campaignType', 'S') === 'M';
        if (savedChannel || isMDC) {
            if (_get(location, 'campaignType', 'S') === 'S' || _get(location, 'campaignType', 'S') === 'T') {
                return true;
            } else {
                if (_get(location, 'mode', 'create') === 'edit') {
                    return true;
                } else {
                    return false;
                }
            }
        } else {
            return false;
        }
    };

    async function getRcsDetails() {
        const isEditMode = handleEditCallApi();
        if (isEditMode && isSavedChannel) {
            beginEditSkeleton();
        }
        try {
            const payload = {
                userId,
                clientId,
                departmentId,
            };
            const promises = [];
            promises.push(
                _get(location, 'campaignType', 'S') === 'S' && audienceList?.length === 0
                    ? fetchAudienceList(payload)
                    : Promise.resolve({ status: false }),
            );
            promises.push(fetchSenderName(payload));
            promises.push(isEditMode ? fetchRCSCampaign(payload) : Promise.resolve({ status: false }));
            const editApiResult = await Promise.all(promises);
            if (!isMounted.current) return;
            let [rcsAudience, rcsSenderData, rcsCampaignData] = editApiResult || [];

        if (rcsCampaignData?.status && !_isEmpty(ensureObject(rcsCampaignData?.data))) {
            const normalizedData = normalizeChannelCampaignData(rcsCampaignData?.data, ['rcsSplit', 'rcsAutoSchedule']);
            let audience;
            const {
                segmentationListId,
                senderId,
                content,
                templateType,
                totalAudience,
                rcsSplit,
                rcsAutoSchedule,
                requestForApproval,
                isSplitAbEnabled = false,
                countryCodeMobile = '',
                testRCSMobileNo = '',
                isCGTGEnabled,
            } = normalizedData;
            const { rcsTemplateId, languageId, templateContent, localBlastDateTime, rcsChannelDetailId, timeZoneId } =
                ensureArray(content)?.[0] || {};
            let RCSAudList = [];
            if (rcsAudience?.status) {
                RCSAudList = _map(ensureArray(rcsAudience?.data), mapAudienceWithChannelLabels);
            }
            let tempAudienceList = ensureArray(audienceList)?.length ? audienceList : RCSAudList;
            const matchAudienceList = _filter(tempAudienceList, (aud) =>
                ensureSegmentationListIds(segmentationListId)?.includes(aud?.segmentationListId),
            );
            audience = matchAudienceList;
            if (!matchAudienceList?.length && ensureSegmentationListIds(segmentationListId)?.length) {
                const payload = {
                    userId,
                    clientId,
                    departmentId,
                    searchText: '',
                    segmentIds: segmentationListId,
                    channelType: 'RCS',
                    campaignId: _get(location, 'campaignId', 0),
                };
                const filterAudienceResponse = await fetchAudienceList(payload);
                if (!isMounted.current) return;
                let tempAudienceData = [];
                if (filterAudienceResponse?.data) {
                    tempAudienceData = _map(ensureArray(filterAudienceResponse?.data), mapAudienceWithChannelLabels);
                }
                audience = tempAudienceData;
            }

            let contentDetails = _map(ensureArray(content), (item, ind) => {
                let carousel =
                    templateType === 3
                        ? JSON?.parse(sanitizeJsonString(item?.templateContent))?.[ind]?.['carousel']
                        : undefined;
                return {
                    ...item,
                    ...(templateType === 3 && { Carousel: carousel }),
                    LanguageCode: item?.languageId,
                    RCSTemplateID: item?.rcsTemplateId,
                };
            });
            dispatch(updateRCSList({ data: contentDetails, field: 'templateContentDetail' }));
            const template = await fetchRCSTempateList(senderId);
            if (!isMounted.current) return;
            let templateList;
            let senderList;
            if (template.status) templateList = template?.data;
            if (rcsSenderData?.status) senderList = rcsSenderData?.data;
            const findTimeZone = _find(timeZoneList, ['timeZoneID', timeZoneId || 64]);
            audience = _uniqBy(ensureArray(audience), 'segmentationListId');
            audience = handleUpdateEditAudienceCount({
                channelId: 41,
                audience,
                savedAudienceCountList: ensureArray(normalizedData?.savedAudienceCountList),
                statusId: content?.[0]?.statusId,
            });
            let temp = {};
            temp.senderName = _find(senderList, ['clientRCSSenderId', senderId]);
            temp.templateName = _find(templateList, ['rcsTemplateId', rcsTemplateId]);
            temp.audience = audience;
            temp.totalAudience = sanitizeChannelCount(totalAudience, 0);
            temp.rcsChannelDetailId = rcsChannelDetailId || 0;
            const isWorkflowEnabled = _get(requestForApproval, 'isWorkflowEnabled', false);
            const approvarList = ensureArray(_get(requestForApproval, 'approvarList', []));
            let testPhoneNumberToSet = '';
            let dialCode = ''
            if (testRCSMobileNo && countryCodeMobile) {
                dialCode = countryCodeMobile?.includes('+') ? countryCodeMobile : `+${countryCodeMobile}`;
                testPhoneNumberToSet = `${dialCode} ${testRCSMobileNo}`;
            }
            const rfaDetails = {
                ...getValues('approvalList'),
                ...(isWorkflowEnabled && {
                    name: _map(approvarList, ({ approvarName, flag }) => {
                        const approver = _find(approvalList, ['email', approvarName]);
                        const name = !approver ? approvarName : approver;
                        const isMandatory = flag ? flag : false;
                        return { approverName: name, mandatory: isMandatory, isCustom: !approver };
                    }),
                }),
                followHierarchy: requestForApproval?.isFollowHierarchy,
                requestApproval: isWorkflowEnabled,
                approvalFrom: requestForApproval?.approvalFrom,
                isApprovalInputEmail: false,
                isEmail: false,
                testEmail: '',
                ...(testPhoneNumberToSet
                    ? { testPhoneNumber: testPhoneNumberToSet, dialCode: dialCode }
                    : { testPhoneNumber: '', dialCode: '' }),
            };
            temp.approvalList = rfaDetails;
            // Handle Split AB in edit mode
            if (isSplitAbEnabled && content?.length > 1) {
                temp.splitTest = true;
                const state = {
                    splitTabList: [],
                };

                // Load each split content
                for (const [ind, item] of content.entries()) {
                    let tempTab = {};
                    const { templateContent, localBlastDateTime, timeZoneId } = item;

                    tempTab.templateName = _find(templateList, ['rcsTemplateId', item.rcsTemplateId]);
                    tempTab.schedule = !!localBlastDateTime ? new Date(localBlastDateTime) : '';
                    tempTab.timezone = _find(timeZoneList, ['timeZoneID', timeZoneId || 64]);

                    const parsedContent = templateContent ? JSON.parse(sanitizeJsonString(templateContent)) || {} : {};

                    const splitKey = `split${numberToLetter(ind + 1)?.toUpperCase()}`;

                    // Set schedule and timezone first before calling handleTemplate
                    if (tempTab.schedule) {
                        setValue(`${splitKey}.schedule`, tempTab.schedule);
                    }
                    if (tempTab.timezone) {
                        setValue(`${splitKey}.timezone`, tempTab.timezone);
                    }

                    // For carousel (templateType === 3), pass as array; for text/rich text, pass as object
                    const templateData = (item.templateType || templateType) === 3 ? parsedContent : parsedContent;
                    const formData = handleTemplate(
                        templateData,
                        item.templateType || templateType,
                        'edit',
                        true,
                        splitKey,
                    );

                    temp[splitKey] = {
                        ...tempTab,
                        ...formData,
                        schedule: tempTab.schedule, // Ensure schedule is preserved
                        timezone: tempTab.timezone, // Ensure timezone is preserved
                        templateName: _find(templateList, ['rcsTemplateId', item.rcsTemplateId]),
                    };
                    state.splitTabList.push(splitKey);
                }

                // Build split tabs
                const tempTabState = state.splitTabList
                    .map((_, index, total) => {
                        const splitConfig = SPLIT_AB_NAME[index];
                        if (!splitConfig) return null;
                        const getSplitName = { ...splitConfig };
                    delete getSplitName.add;
                    return {
                        ...getSplitName,
                        component: () => <SplitAB fieldName={_} key={getSplitName.id} isSplitTabs />,
                        ...(total?.length < 4 && total?.length - 1 === index && { add: circle_plus_medium }),
                        ...(index > 1 &&
                            total?.length - 1 === index && {
                                remove: circle_minus_fill_medium,
                            }),
                    };
                    })
                    .filter(Boolean);

                setSplitTabs(tempTabState);
                let splitIndex = 0
                    if(location?.splitType){
                        const splitInd = tempTabState?.findIndex((item) => item?.id === location?.splitType)
                            if(splitInd !== -1 && splitInd < tempTabState?.length){
                                splitIndex = splitInd
                            }
                    }
                setSplitTabConfig({
                    currentTab: splitIndex,
                    splitTabs: tempTabState?.map((item) => item?.id),
                });

                // Load split AB audience count
                    if (sanitizeChannelCount(rcsSplit?.splitAudience, 0) > 0) {
                        const tempSplitAudience = {};
                        const { splitAudience, splitPercentage, totalAudience: totalCount, splitWidth } =
                            ensureObject(rcsSplit);
                        tempSplitAudience.count = sanitizeChannelCount(splitAudience, 0);
                        tempSplitAudience.totalCount = sanitizeChannelCount(totalCount, 0);
                        tempSplitAudience.audienceCount = sanitizeChannelCount(totalAudience, 0);
                        tempSplitAudience.percentage = sanitizeChannelCount(splitPercentage, 0);
                        tempSplitAudience.width = sanitizeChannelCount(splitWidth, 0);
                    tempSplitAudience.tabs = _map(content, ({ splitType }) => `split${splitType}`);
                    setSliderState((prev) => ({ ...prev, splittedCount: tempSplitAudience }));
                }

                // Load auto-schedule details
                if (rcsAutoSchedule?.autoSchedule) {
                    const tempSchedule = {};
                    const { autoSchedule, startIn, periodRange } = rcsAutoSchedule;
                    tempSchedule.autoSchedule = autoSchedule;
                    tempSchedule.time = {
                        id: periodRange,
                        value: periodRange === 1 ? 'Hour(s)' : periodRange === 2 ? 'Day(s)' : 'Week(s)',
                    };
                    tempSchedule.duration = startIn;
                    tempSchedule.communicationPerformanceBy = 'Content';
                    temp.splitscehdule = tempSchedule;
                    setEditAutoScheduleDetails(tempSchedule);
                } else {
                    temp.splitscehdule = {
                        autoSchedule: false,
                        communicationPerformanceBy: 'Content',
                        duration: '8',
                        time: { id: 1, value: 'Hour(s)' },
                    };
                    setEditAutoScheduleDetails({
                        autoSchedule: false,
                        communicationPerformanceBy: 'Content',
                        duration: '8',
                        time: { id: 1, value: 'Hour(s)' },
                    });
                }
            } else {
                // Non-split AB edit mode
                temp.schedule = !!localBlastDateTime ? new Date(localBlastDateTime) : '';
                temp.timezone = findTimeZone;
                temp.splitTest = false;

                const parsedContent = content?.[0]?.templateContent
                    ? JSON.parse(sanitizeJsonString(content[0].templateContent)) || {}
                    : {};
                const formData = handleTemplate(parsedContent, templateType, 'edit');
                temp = {
                    ...temp,
                    ...formData,
                };
            }

            // Update total audience count from campaign details
            dispatch(updateTotalAudienceCount(totalAudience || 0));

            const matchAudienceType = audienceTypeList?.filter((typeList) =>
                audience?.map((aud) => aud?.listType)?.includes(typeList?.id),
            );
            temp.isCGTGEnabled = isCGTGEnabled ?? false;
            if (!isMounted.current) return;
            reset((formState) => ({
                ...formState,
                ...temp,
                audienceType: matchAudienceType?.length ? matchAudienceType : [audienceTypeList[0]],
                editActionId: editActionIdFromCommunicationResponse(rcsCampaignData?.data),
            }));
            if (!isEditMode) {
                isEditCallRef.current = true;
            }
            location?.campaignType === 'M' &&
                handleMDCQueryParamsUpdate(
                    {
                        ...mdcContentSetupDetails,
                        ...watch(),
                        ...campaignDetails,
                        ...rcsCampaignData?.data
                    },
                    location,
                );
            } else {
                if (!isEditMode) {
                    isEditCallRef.current = false;
                }
            }
        } catch {
            if (isMounted.current) {
                dispatch(updateRCSList({ data: {}, field: 'campaignDetails' }));
            }
        } finally {
            if (isEditMode) {
                finishEditSkeleton();
            }
        }
    }
    function handleTemplate(templateContentDetail, templateType, mode = 'template', isSplit = false, fieldName = '') {
        const currentTabData = CONTENT_TAB_DATA.map((item) => ({
            ...item,
            disable: parseInt(item.id, 10) !== parseInt(templateType, 10),
        }));
        setUpdateTabData(currentTabData);
        if (!_isEmpty(templateContentDetail)) {
            let temp = {};
            if (templateType === 3) {
                //Carousel
                let cTabs = [];
                // Build an editorContent map that works for both split and non-split consumers
                let editorContentMap = {};
                templateContentDetail?.forEach((item, i) => {
                    let tempTabs = {};
                    let rcsContent =
                        mode === 'edit' ? item : JSON.parse(sanitizeJsonString(item?.TemplateContent)) || {};
                    const { actions, cardDesctiption, cardTitle, carousel, bannerValue, bannerTags, bannerType } =
                        rcsContent;

                    tempTabs.titleText = cardTitle;
                    (tempTabs.editorText = cardDesctiption),
                        (tempTabs.customParams =
                            extractPlaceholders(cardDesctiption)?.map((param) => ({
                                value: '',
                                placeholder: param.placeholder,
                                startPosition: param.start,
                                endPosition: param.end,
                            })) || []);
                    tempTabs.cardTitle = cardTitle;
                    tempTabs.bannerType = bannerType; // Add this line
                    tempTabs.interactivity = !!actions?.length;
                    temp.currentTabIndex = templateType - 1;
                    tempTabs.previewImage = mode === 'edit' ? bannerValue : !!bannerTags ? '' : bannerValue;
                    tempTabs.actions =
                        actions?.map((action) => ({
                            actionType: {
                                ...action,
                                ..._find(INTERACTIVITY_DATA, { text: action?.actionType }),
                            },
                            actionName: action?.actionName || actionNameTags,
                            actionUrl: action?.actionURL || '',
                        })) || [];
                    const editorKey = `carousel${numberToLetter(i + 1)?.toUpperCase()}`;
                    editorContentMap[editorKey] = {
                        cardDesctiption: cardDesctiption,
                        titleText: cardTitle,
                        bannerTags,
                        bannerType,
                    };
                    const carouselKey = `carousel${numberToLetter(i + 1)?.toUpperCase()}`;
                    if (isSplit && fieldName) {
                        temp[carouselKey] = tempTabs;
                    } else {
                        temp[carouselKey] = tempTabs;
                    }
                    cTabs.push(carouselKey);
                });
                // reset non carousel values
                temp.carouselIndex = 0;
                temp.customParams = [];
                temp.editorText = '';
                temp.titleText = '';
                temp.bannerImage = '';
                temp.previewImage = '';
                const tempCarouselTabs = templateContentDetail.map((tempValue, i) => {
                    const tempContent =
                        mode === 'edit' ? tempValue : JSON.parse(sanitizeJsonString(tempValue?.TemplateContent)) || {};
                    const tabKey = `carousel${numberToLetter(i + 1)?.toUpperCase()}`;

                    return {
                        id: i + 1,
                        text: `Carousel ${numberToLetter(i + 1)?.toUpperCase()}`,
                        disable: false,
                        data: tempContent,
                        splitName: isSplit ? fieldName : '',
                        carouselName: tabKey || '',
                        component: () => (
                            <TextContent
                                value={tempContent}
                                fieldName={isSplit ? `${fieldName}.${tabKey}` : tabKey}
                                isSplitAB={isSplit}
                                isCarousel={true}
                                index={i}
                                key={tabKey}
                                splitName={fieldName}
                            />
                        ),
                    };
                });

                setCTabState(cTabs);

                // Store carousel tabs with proper structure for split vs non-split
                if (isSplit) {
                    setCarouselTabs((prev) => {
                        const { carousel, ...rest } = prev;
                        return {
                            ...rest,
                            [fieldName]: tempCarouselTabs,
                        };
                    });
                    dispatch(
                        dispatch(
                            updateRCSEditorContent({
                                data: {
                                    [fieldName]: editorContentMap,
                                },
                                reset: false,
                            }),
                        ),
                    );
                } else {
                    setCarouselTabs((prev) => ({
                        carousel: tempCarouselTabs,
                    }));
                    dispatch(
                        updateRCSEditorContent({
                            data: editorContentMap,
                            reset: true,
                        }),
                    );
                }

                if (mode !== 'edit') {
                    Object.entries(temp).forEach(([name, value]) => {
                        const keyName = isSplit && fieldName ? `${fieldName}.${name}` : name;
                        setValue(keyName, value, {
                            shouldDirty: true,
                            shouldTouch: false,
                            shouldValidate: false,
                        });
                    });
                }
            } else {
                let rcsContent =
                    mode === 'edit'
                        ? templateContentDetail
                        : JSON.parse(sanitizeJsonString(templateContentDetail[0]?.TemplateContent)) || {};
                const { actions, cardDesctiption, cardTitle = '', bannerValue, bannerTags, bannerType } = rcsContent;

                // Update editorContent for both split and non-split flows
                if (isSplit) {
                    dispatch(
                        updateRCSEditorContent({
                            data: {
                                [fieldName]: {
                                    cardDesctiption: cardDesctiption,
                                    titleText: cardTitle,
                                    bannerTags,
                                    bannerType,
                                },
                            },
                            reset: false,
                        }),
                    );
                } else {
                    dispatch(
                        updateRCSEditorContent({
                            data: {
                                cardDesctiption: cardDesctiption,
                                titleText: cardTitle,
                                bannerTags,
                                bannerType: bannerType,
                            },
                            reset: true,
                        }),
                    );
                }

                temp.titleText = cardTitle;
                (temp.editorText = cardDesctiption),
                    (temp.interactivity = !!actions?.length),
                    (temp.actions = actions?.map((action) => ({
                        actionType: {
                            ...action,
                            ..._find(INTERACTIVITY_DATA, { text: action?.actionType }),
                        },
                        actionName: action?.actionName,
                        actionUrl:
                            action?.actionURL ||
                            '',
                    })));
                temp.customParams =
                    extractPlaceholders(cardDesctiption)?.map((param) => ({
                        value: '',
                        placeholder: param.placeholder,
                        startPosition: param.start,
                        endPosition: param.end,
                    })) || [];
                temp.carouselIndex = null;
                temp.bannerImage = '';
                temp.currentTabIndex = templateType - 1;
                temp.previewImage = mode === 'edit' ? bannerValue : !!bannerTags ? '' : bannerValue;
                let currentState = getValues();
                Object.keys(RCS_CAROUSEL_NAME).forEach((key) => {
                    delete currentState[RCS_CAROUSEL_NAME[key].id];
                });
                temp = { ...temp };

                // Clear carousel tabs properly based on split vs non-split
                if (isSplit) {
                    setCarouselTabs((prev) => {
                        const { carousel, ...rest } = prev;
                        return {
                            ...rest,
                            [fieldName]: [],
                        };
                    });
                } else {
                    setCarouselTabs((prev) => ({
                        carousel: [],
                    }));
                }
                setCTabState([]);

                if (mode !== 'edit') {
                    Object.entries(temp).forEach(([name, value]) => {
                        const keyName = isSplit && fieldName ? `${fieldName}.${name}` : name;
                        setValue(keyName, value, {
                            shouldDirty: true,
                            shouldTouch: false,
                            shouldValidate: false,
                        });
                    });
                }
            }
            return mode === 'edit' ? temp : undefined;
        }
    }

    const handleMdcNavigation = ({ data }) => {
        resetState(true);
        const { rcsChannelDetailId: channelResponseDetailId } = data;
        const mdcCanvasUrl = `/communication/mdc-workflow`;
        const state = { ...location, channelResponseDetailId, mode: `update` };
        const encryptState = encodeUrl(state);

        channelResponseDetailId &&
            navigate(`${mdcCanvasUrl}?q=${encryptState}`, {
                state,
            });
    };

    const handleMdcCancel = () => {
        resetState(true);
        const mdcCanvasUrl = `/communication/mdc-workflow`;
        const state = { ...location };
        delete state.mdcContentSetupDetails;

        const encryptState = encodeUrl(state);
        navigate(`${mdcCanvasUrl}?q=${encryptState}`, {
            state,
        });
    };

    function handleNavigation() {
        window.scrollTo(0, 0);
        const tabIndex = (messagingTabState?.currentIndex ?? 0) + 1;
        const handleVertcialNextTab = () => {
            const nextChannel = communicationChannels.find(
                (chan, index) => channelType !== chan && Object.hasOwn(activeTabs, chan) && index > currentVerticalTab,
            );
            if (!!nextChannel) {
                dispatch(
                    updateVerticalTab({
                        tabs: activeTabs?.[nextChannel] || {
                            type: 'notification',
                            currentTab: 2,
                        },
                        activeTabs,
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

        const nextMessagingTabIndex = getNextEligibleTabIndex({
            startIndex: tabIndex,
            campaignType: location?.campaignType,
            eligibleChannelIds: location?.eligibleChannelType?.[2] || [],
            availableTabList: availableTabs['messaging'],
            tabChannelMap: MESSAGING_TAB_CHANNEL_MAP,
        });

        if (availableTabs['messaging']?.length === nextMessagingTabIndex) {
            handleVertcialNextTab();
        } else {
            dispatch(
                updateTab({
                    field: 'messaging',
                    data: {
                        tabName: availableTabs['messaging'][nextMessagingTabIndex],
                        currentIndex: nextMessagingTabIndex,
                    },
                    activeTabs
                }),
            );
        }
        resetState(true);
    }

    const handleSaveChannelIds = () => {
        const finalSavedChannelId = { ...savedChannelsId };
        if (savedChannelsId[channelId]?.includes(channelId)) {
            finalSavedChannelId[channelId] = [...savedChannelsId[channelId]];
        } else {
            finalSavedChannelId[channelId] = [...(savedChannelsId[channelId] || []), channelId];
        }
        dispatch(updateSaveChannelsId(finalSavedChannelId));
    };
    const formSubmitHandler = async (
        formState,
        formType = 'form',
        isScheduled,
        proceedWithoutSchedule = false,
        passportID = '',
    ) => {
        beginSubmit(getAuthoringSaveButtonType(formType));
        try {
        const utcTimeResponse = await dispatch(getUtcTimeNow(false));
        if (!isMounted.current) return;
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
                splitTabList: splitTabConfig?.splitTabs,
            })
        ) {
            return;
        }
        let statusId = getCampaignStatusId(campaignDetails);

        if (!isClickOff) {
            
            if (formType !== 'test preview') {
                if (!handleAutoRefreshClickOff(watchAudience)) {
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
                let schedulerName = watchSplitTest
                                    ? `${splitTabs?.[splitTabConfig?.currentTab]?.id}.schedule`
                                    : 'schedule';
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
                    dataSource: mdcContentSetupDetails?.dataSource,
                    triggerPlayPauseStatus: campaignDetails?.triggerPlayPauseStatus
                });
                
                if (!isRFAValid) {
                    return;
                }
            }
            function getTestType() {
                if (formType === 'form' && formState?.approvalList?.requestApproval) return 1;
                if (formType === 'form' || formType === 'save') return 0;
                if (formType === 'request for approval') return 1;
                if (formType === 'test preview') return 2;
                if (formType === 'live') return 4;
                return 0;
            }
            // Split AB validation
            if (formState.splitTest) {
                let errorIndex;
                let errorField = null;
                const tempSplitTabsList = [...splitTabConfig?.splitTabs];
                let scheduleAll = [];
                let nullCount = 0;

                // Validate template name for each split
                for (let i = 0; i < tempSplitTabsList?.length; i++) {
                    let currentTab = formState[tempSplitTabsList[i]];

                    if (!currentTab?.templateName) {
                        errorIndex = i;
                        errorField = 'templateName';
                        break;
                    }

                    // Track schedule presence
                    if (!currentTab?.schedule) {
                        scheduleAll.push(null);
                        nullCount++;
                    } else {
                        scheduleAll.push(true);
                    }
                }

                if (errorIndex !== undefined && errorField) {
                    setSplitTabConfig((prev) => ({ ...prev, currentTab: errorIndex }));
                    setTimeout(() => {
                        setError(`${tempSplitTabsList[errorIndex]}.${errorField}`, {
                            type: 'custom',
                            message: SELECT_TEMPLATE_NAME,
                        });
                        setFocus(`${tempSplitTabsList[errorIndex]}.${errorField}`);
                        audienceRef?.current?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                    return;
                }

                // Schedule validation for Split AB
                if (
                    location?.campaignType !== 'T' &&
                    !proceedWithoutSchedule &&
                    (location?.campaignType === 'S' || (location?.campaignType === 'M' && levelNumber < 2))
                ) {
                    // Case 1: None of the splits are scheduled
                    if (nullCount === tempSplitTabsList?.length) {
                        formTypeRef.current = formType;
                        setIsNotScheduled(true);
                        return;
                    }

                    // Case 2: Some splits scheduled, some not → invalid
                    if (nullCount > 0 && nullCount < tempSplitTabsList?.length) {
                        for (let k = 0; k < scheduleAll?.length; k++) {
                            if (scheduleAll[k] === null) {
                                setValue('currentSplitTab', k);
                                setSplitTabConfig((prev) => ({ ...prev, currentTab: k }));
                                setTimeout(() => {
                                    setError(`${tempSplitTabsList[k]}.schedule`, {
                                        type: 'custom',
                                        message: 'Select date and time',
                                    });
                                    setFocus(`${tempSplitTabsList[k]}.schedule`);
                                    audienceRef?.current?.scrollIntoView({ behavior: 'smooth' });
                                }, 100);
                                return;
                            }
                        }
                    }

                    // Case 3: Validate each scheduled split
                    for (let k = 0; k < scheduleAll?.length; k++) {
                        if (!scheduleAll[k]) continue;

                        // Validate 5-min difference between consecutive splits
                        if (k > 0) {
                            const timeDiff = diff_minutes(
                                formState[tempSplitTabsList[k]]?.schedule,
                                formState[tempSplitTabsList[k - 1]]?.schedule,
                            );
                            if (timeDiff < 5) {
                                setSplitTabConfig((prev) => ({ ...prev, currentTab: k }));
                                setTimeout(() => {
                                    setError(`${tempSplitTabsList[k]}.schedule`, {
                                        type: 'custom',
                                        message: MINIMUM_DIFFERENCE_SPLITS,
                                    });
                                    setFocus(`${tempSplitTabsList[k]}.schedule`);
                                    audienceRef?.current?.scrollIntoView({ behavior: 'smooth' });
                                }, 100);
                                return;
                            }
                        }

                        // Validate schedule time and campaign window
                        let scheduleError = campaignSchedule(
                            formState[tempSplitTabsList[k]]?.schedule,
                            formState[tempSplitTabsList[k]]?.timezone?.gmtOffset,
                            statusId,
                            currentUtcTimeData?.utcTime,
                        );

                        const { adjustedStartDate, adjustedEndDate } = getTimezoneAdjustedDateRange(
                            tempSplitTabsList[k],
                            formState[tempSplitTabsList[k]]?.timezone,
                        );
                        const ScheduleStatus = checkScheduleDate(
                            formState[tempSplitTabsList[k]]?.schedule,
                            adjustedStartDate,
                            adjustedEndDate,
                        );

                        if (ScheduleStatus) {
                            setSplitTabConfig((prev) => ({ ...prev, currentTab: k }));
                            setTimeout(() => {
                                setError(`${tempSplitTabsList[k]}.schedule`, {
                                    type: 'custom',
                                    message: CHECK_START_DATE_AND_END_DATE,
                                });
                                setFocus(`${tempSplitTabsList[k]}.schedule`);
                                audienceRef?.current?.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                            return;
                        }

                        // Validate schedule at least 15 mins ahead
                        if (!scheduleError) {
                            const cityTime = convertUserTimezoneToTarget(
                                currentUtcTimeData?.utcTime
                                    ? new Date(currentUtcTimeData.utcTime.replace('Z', ''))
                                    : new Date(),
                                '(GMT+00:00) ',
                                formState[tempSplitTabsList[k]]?.timezone?.gmtOffset,
                            );
                            const cityTimeWithBuffer = new Date(cityTime);
                            cityTimeWithBuffer.setMinutes(cityTimeWithBuffer.getMinutes() + 15);
                            const formattedCityTime = cityTimeWithBuffer.toLocaleString();

                            setSplitTabConfig((prev) => ({ ...prev, currentTab: k }));
                            setTimeout(() => {
                                setError(`${tempSplitTabsList[k]}.schedule`, {
                                    type: 'custom',
                                    message: `Select a date & time later than ${formattedCityTime}`,
                                });
                                setFocus(`${tempSplitTabsList[k]}.schedule`);
                                audienceRef?.current?.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                            return;
                        }
                    }
                }
            }

            if (formState.splitTest) {
                for (let s = 0; s < splitTabConfig?.splitTabs?.length; s++) {
                    const splitName = splitTabConfig?.splitTabs[s];
                    const splitTemplateType = _get(formState, `${splitName}.templateName.templateType`, 0);

                    if (splitTemplateType === 3) {
                        // Carousel case
                        const tabs = carouselTabs?.[splitName] || [];
                        for (let i = 0; i < tabs.length; i++) {
                            const { carouselName } = tabs[i] || {};
                            const cv = _get(formState, `${splitName}.${carouselName}`, {});
                            const needsImage =
                                cv?.bannerType === 'Image' || !!editorContent?.[carouselName]?.bannerTags;

                            if (needsImage && !cv?.previewImage) {
                                setValue(`${splitName}.carouselIndex`, i);
                                setSplitTabConfig((prev) => ({ ...prev, currentTab: s }));
                                setValue('currentSplitTab', s);
                                setError(`${splitName}.${carouselName}.editorText`, {
                                    type: 'custom',
                                    message: 'Select/Upload image to proceed',
                                });
                                setTimeout(() => {
                                    setFocus(`${splitName}.${carouselName}.editorText`);
                                    audienceRef?.current?.scrollIntoView({ behavior: 'smooth' });
                                }, 10);
                                return;
                            }
                        }
                    } else {
                        // Non-carousel split
                        const needsImage = !!editorContent?.bannerTags;
                        if (needsImage && !_get(formState, `${splitName}.previewImage`)) {
                            setSplitTabConfig((prev) => ({ ...prev, currentTab: s }));
                            setValue('currentSplitTab', s);
                            setError(`${splitName}.editorText`, {
                                type: 'custom',
                                message: 'Select/Upload image to proceed',
                            });
                            setTimeout(() => {
                                setFocus(`${splitName}.editorText`);
                                audienceRef?.current?.scrollIntoView({ behavior: 'smooth' });
                            }, 10);
                            return;
                        }
                    }
                }
            } else {
                // Non-split validation
                if (formState?.templateName?.templateType === 3) {
                    const nonSplitTabs = carouselTabs?.['carousel'] || [];
                    for (let i = 0; i < nonSplitTabs?.length; i++) {
                        const tabKey = nonSplitTabs[i]?.carouselName;
                        const cv = formState?.[tabKey];
                        const needsImage = cv?.bannerType === 'Image' || !!editorContent?.[tabKey]?.bannerTags;

                        if (needsImage && !cv?.previewImage) {
                            setValue('carouselIndex', i);
                            setError(`${tabKey}.editorText`, {
                                type: 'custom',
                                message: 'Select/Upload image to proceed',
                            });
                            setTimeout(() => setFocus(`${tabKey}.editorText`), 10);
                            return;
                        }
                    }
                } else {
                    const needsImage = !!editorContent?.bannerTags;
                    if (needsImage && !formState?.previewImage) {
                        setError(`editorText`, {
                            type: 'custom',
                            message: 'Select/Upload image to proceed',
                        });
                        setFocus(`editorText`);
                        return;
                    }
                }
            }

            if (
                !formState.splitTest &&
                !formState.schedule &&
                getTestType() < 1 &&
                location.campaignType !== 'T' &&
                isScheduled &&
                levelNumber === 1 &&
                mdcContentSetupDetails?.dataSource === 'TL' &&
                !mdcContentSetupDetails?.isCGTGEnabled
            ) {
                formTypeRef.current = formType;
                setIsNotScheduled(true);
                return;
            }

            if (
                !formState.splitTest &&
                formState?.schedule &&
                location?.campaignType !== 'T' &&
                levelNumber === 1 &&
                mdcContentSetupDetails?.dataSource === 'TL'
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
                        message: CHECK_START_DATE_AND_END_DATE,
                    });
                    return;
                }

                if (!scheduleError) {
                    const cityTime = convertUserTimezoneToTarget(
                        utcTimeData?.utcTime ? new Date(utcTimeData.utcTime.replace('Z', '')) : new Date(),
                        '(GMT+00:00) ',
                        formState?.timezone?.gmtOffset,
                    );
                    const cityTimeWithBuffer = new Date(cityTime);
                    cityTimeWithBuffer.setMinutes(cityTimeWithBuffer.getMinutes() + 15);
                    const formattedCityTime = cityTimeWithBuffer.toLocaleString();
                    setError(`schedule`, {
                        type: 'custom',
                        message: `Select a date & time later than ${formattedCityTime}`,
                    });
                    return;
                }
            }

            formTypeRef.current = formType;
            const splitExtras = formState.splitTest
                ? { splitTabs: splitTabConfig?.splitTabs, splitABCount: sliderState.splittedCount }
                : {};
            const userKeyPersonInfo = userKeyInfo?.filter((e) => e.userId === userId);
            formState = {
                ...formState,
                templateContentDetail,
                isSendTestRCS: getTestType(),
                clientId,
                departmentId,
                userId,
                carouselTabs,
                passportID,
                userKeyPersonInfo,
                ...splitExtras,
                campaignType: location['campaignType'],
                campaignId: location?.campaignId,
                ...campaignDetails,
                ...campaignTypeAndId,
                dynamiclistId:
                    location['campaignType'] === 'T'
                        ? savedChannel
                            ? _get(campaignDetails, 'dynamiclistId', 0)
                            : _get(location, 'dynamicListId', 0)
                        : 0,
                ...(location['campaignType'] === 'M' && mdcContentSetupDetails),
                audience: watchAudience?.length ? watchAudience : location?.audience || []
            };

            const payloadData = buildPayload(formState, formType, location);
            const {
                status,
                message = EXCEPTION_OCCURRED,
                data,
            } = await runSave(getAuthoringSaveButtonType(formType), () =>
                dispatch(save_Rcs_Campaign({ payload: payloadData, loading: false })),
            );
            if (!isMounted.current) return;
            setSaveCampaigData(data);
            if (status) {
                await handleSaveChannelIds();
                const selectedAudience = formState?.audience ?? [];
                dispatch(updateChannelAudiences(mergeChannelAudiences('RCS', selectedAudience, channelAudiences)));
                if (getTestType() > 1) {
                    setValue('rcsChannelDetailId', data?.rcsChannelDetailId);
                    const isMDCCampaign = _get(location, 'campaignType', 'S') === 'M';
                    await dispatch(
                        Get_RCS_Campaign({
                            payload: {
                                userId,
                                clientId,
                                departmentId,
                                campaignId: _get(location, 'campaignId', 0),
                                levelNumber: isMDCCampaign ? _get(location, 'mdcContentSetupDetails.levelNumber', 0) : 1,
                                actionId: isMDCCampaign ? _get(location, 'mdcContentSetupDetails.actionId', 0) : 1,
                                rcsChannelDetailId: data?.rcsChannelDetailId,
                            },
                            loading: false,
                        }),
                    );
                    if (!isMounted.current) return;
                    formTypeRef.current = null;
                }

                // Handle different submission types
                if (formType === 'form') {
                    if (formState?.approvalList?.requestApproval) {
                        setisTestComSent({
                            show: true,
                            message: COMMUNICATION_SUCCESSFULLY_SENT,
                            status: true,
                            isRFA: true,
                        });
                        if (rfaAutoNavTimeoutRef.current) clearTimeout(rfaAutoNavTimeoutRef.current);
                        rfaManuallyClosedRef.current = false;
                        rfaAutoNavTimeoutRef.current = setTimeout(() => {
                            if (rfaManuallyClosedRef.current) return;
                            setisTestComSent({ show: false, message: '', status: false, isRFA: false });
                            location.campaignType === 'M' ? handleMdcNavigation({ data }) : handleNavigation();
                        }, 3000);
                        return;
                    } else {
                        if (location?.campaignType === 'M') {
                            handleMdcNavigation({ data });
                        } else {
                            handleNavigation();
                        }
                    }
                } else if (formType === 'save') {
                    if (formState?.approvalList?.requestApproval) {
                        setisTestComSent({
                            show: true,
                            message: COMMUNICATION_SUCCESSFULLY_SENT,
                            status: true,
                            isRFA: true,
                        });
                        if (rfaAutoNavTimeoutRef.current) clearTimeout(rfaAutoNavTimeoutRef.current);
                        rfaManuallyClosedRef.current = false;
                        rfaAutoNavTimeoutRef.current = setTimeout(() => {
                            if (rfaManuallyClosedRef.current) return;
                            setisTestComSent({ show: false, message: '', status: false, isRFA: false });
                            if (location.campaignType === 'M') {
                                handleMdcNavigation({ data });
                            } else {
                                resetState(true);
                                navigate('/communication', { index: 0 });
                            }
                        }, 3000);
                        return;
                    } else {
                        if (location.campaignType === 'M') {
                            handleMdcNavigation({ data });
                        } else {
                            resetState(true);
                            navigate('/communication', { index: 0 });
                        }
                    }
                } else if (formType === 'test preview') {
                    // Clear dirty state after successful test preview save while keeping form values
                    reset(getValues(), { keepValues: true });
                    dispatch(updateDirtyState(false));

                    setisTestComSent({
                        show: true,
                        message: TEST_PREVIEW_SENT,
                        status: true,
                        isRFA: false,
                    });
                    setTimeout(() => setisTestComSent({ show: false, message: '', status: false, isRFA: false }), 5000);
                } else if (formType === 'request for approval') {
                    // Clear dirty state after successful save while keeping form values
                    reset(getValues(), { keepValues: true });
                    dispatch(updateDirtyState(false));

                    setisTestComSent({
                        show: true,
                        message: COMMUNICATION_SUCCESSFULLY_SENT,
                        status: true,
                        isRFA: true,
                    });
                    if (rfaAutoNavTimeoutRef.current) clearTimeout(rfaAutoNavTimeoutRef.current);
                    rfaManuallyClosedRef.current = false;
                    rfaAutoNavTimeoutRef.current = setTimeout(() => {
                        if (rfaManuallyClosedRef.current) return;
                        setisTestComSent({ show: false, message: '', status: false, isRFA: false });
                        location.campaignType === 'M' ? handleMdcNavigation({ data }) : handleNavigation();
                    }, 3000);
                    return;
                } else if (formType === 'live') {
                    setisTestComSent({
                        show: true,
                        message: LIVE_PREVIEW_SENT,
                        status: true,
                        isRFA: false,
                        smsPreview: true,
                    });
                    setTimeout(() => setisTestComSent({ show: false, message: '', status: false, isRFA: false, smsPreview: false }), 5000);
                    return;
                }

                formTypeRef.current = null;
            } else {
                setisTestComSent({
                    show: true,
                    message: message || 'Failed',
                    status: false,
                    isRFA: false,
                });
            }
        } else {
            // Handle click-off case
            if (location?.campaignType === 'M') {
                handleMdcNavigation({ data });
            } else if (formType === 'save') {
                navigate('/communication', { index: 0 });
                resetState(true);
            } else {
                handleNavigation();
            }
        }
        } finally {
            endSubmit();
        }
    };

    const buildChannelPayload = useCallback(
        (content) => {
            const mdcDetails = _get(location, 'mdcContentSetupDetails', {});
            const isMDCCampaign = location?.campaignType === 'M';
            const splitTabIndex = getValues('currentSplitTab');
            const splitTabList = getValues('splitTabs') || [];

            return {
                departmentId,
                clientId,
                userId,
                campaignId: location?.campaignId ?? campaignTypeAndId?.campaignId ?? 0,
                blastType: getValues('splitTest') && splitTabList?.length ? splitTabList[splitTabIndex] : '',
                channelId: 41,
                goalNo: content?.goalNo ?? 0,
                blastNo: isMDCCampaign ? _get(mdcDetails, 'levelNumber', '') : 1,
                parentChannelDetailId: isMDCCampaign ? _get(mdcDetails, 'parentChannelDetailId', 0) : 0,
                actionId: isMDCCampaign ? _get(mdcDetails, 'actionId', 0) : 1,
                senderId: watchSenderName?.senderName,
                subSegmentId: _get(mdcDetails, 'subSegmentId', 0),
            };
        },
        [departmentId, clientId, userId, location, campaignTypeAndId, watchSenderName, getValues],
    );

    const value = useMemo(
        () => ({
            carouselTabs,
            setCountry,
            country,
            mask,
            formSubmitHandler,
            mdcContentSetupDetails,
            campaignTypeAndId,
            cTabState,
            isClickOff,
            fetchRCSTemplateContent,
            buildChannelPayload,
            isFailure,
            setIsFailure,
            preview,
            setPreview,
            type: 'rcs',
            dataSource: mdcContentSetupDetails?.dataSource || 'TL',
            levelNumber: mdcContentSetupDetails?.levelNumber || 1,
            isTemplateListLoading: templateListLoader.isLoading,
            isTemplateContentLoading: templateContentLoader.isLoading,
        }),
        [
            carouselTabs,
            mask,
            country,
            mdcContentSetupDetails,
            campaignTypeAndId,
            cTabState,
            isClickOff,
            buildChannelPayload,
            isFailure,
            preview,
            templateListLoader.isLoading,
            templateContentLoader.isLoading,
            splitTabConfig
        ],
    );
    const resetState = (resetCampaign = false) => {
        resetAuthoringChannelEditSession(isEditCallRef, resetEditLoading);
        let initialState = rcsFormInitialState?.defaultValues;
        reset((formState) => ({
            ...formState,
            ...initialState,
            approvalList: {
                ...initialState?.approvalList,
                dialCode: formState?.approvalList?.dialCode,
                testPhoneNumber: formState?.approvalList?.testPhoneNumber,
            },
        }));
        if (resetCampaign) {
            dispatch(updateRCSList({ data: {}, field: 'campaignDetails' }));
        }
        dispatch(updateRCSList({ data: {}, field: 'editorContent' }));
        clearErrors();
        setCTabState([]);
        setCarouselTabs({});
        setSplitTabs(SPLIT_TABS);
        setSplitTabConfig({
            currentTab: 0,
            splitTabs: ['splitA', 'splitB'],
        });
        setSliderState({
            show: false,
            splittedCount: {},
        });
    };
    const ModalConfig = [
        {
            header: 'Confirmation',
            key: 'navigate_confirm',
            show: navigate_confirm,
            text: IGNORE_CHANNEL,
            primaryButtonText: OK,
            handleClose: () => setNavigate_confirm(false),
            handleConfirm: () => {
                setNavigate_confirm(false);
                handleNavigation();
            },
            primaryButton: true,
            secondaryButton: true,
        },
        {
            header: 'Confirmation',
            key: 'isNotScheduled',
            show: isNotScheduled,
            text: COMMUNICATION_SCHEDULED,
            primaryButtonText: SAVE,
            handleClose: () => setIsNotScheduled(false),
            handleConfirm: () => {
                setIsNotScheduled(false);
                handleSubmit((data) => formSubmitHandler(data, formTypeRef.current, false, true))();
            },
            primaryButton: true,
            secondaryButton: true,
        },
        {
            header: 'Reset',
            key: 'isRefresh',
            show: isReset,
            text: ARE_YOU_SURE_WANT_TO_RESET,
            handleClose: () => setIsReset(false),
            handleConfirm: () => {
                resetState(false);
                setIsReset(false);
            },
            primaryButton: true,
            secondaryButton: true,
        },
        {
            header: CONFIRMATION,
            key: 'issplitOffConfirmationModal',
            show: issplitOffConfirmationModal,
            text: SPLIT_AB_TURNOFF,
            primaryButtonText: OK,
            handleClose: () => setIsSplitOffConfirmationModal(false),
            handleConfirm: () => refreshSplitABTab(true),
            primaryButton: true,
            secondaryButton: true,
        },
    ];
    return (
        <RCSProvider.Provider value={value}>
            <AuthoringChannelEditSkeletonGate
                channelId={channelId}
                showEditSkeleton={showEditSkeleton}
                isSavedChannel={isSavedChannel}
            >
            <FormProvider {...methods}>
                <form
                    className="rsv-tabs-content position-relative allow-copy"
                    // onSubmit={handleSubmit((data) => formSubmitHandler(data))}
                >
                    <div className={`box-design bd-top-border ${isClickOff ? 'pe-none click-off' : ''}`}>
                        {!tabSmartLink_Flag && tabSmartLink_Flag !== null && levelNumber < 2 && !isClickOff && (
                            <SmartLinkEnable
                                // onSave={() => UpdateState(setState, 'isSmartLink', false)}
                                onReject={() => {
                                    dispatch(showTabsSmartlink(true));
                                    //UpdateState(setState, 'isSmartLink', false);
                                }}
                            />
                        )}
                        <div className="form-group mt20">
                            <Row>
                                <Col sm={{ offset: 1, span: 2 }}>
                                    <label className="control-label-left">{SENDER_NAME}</label>
                                </Col>
                                <Col sm={6} id="rs_Messaging_SenderId">
                                    <div>
                                        <RSKendoDropDownList
                                            control={control}
                                            name={rcsFieldName?.senderName}
                                            data={senderNameList}
                                            dataItemKey={'clientRCSSenderId'}
                                            textField={'senderName'}
                                            label={SENDER_NAME}
                                            isLoading={senderNameLoader.isLoading}
                                            rules={{
                                                required: Select_SENDER_NAME,
                                            }}
                                            handleChange={({ value }) => {
                                                fetchRCSTempateList(value?.clientRCSSenderId);
                                            }}
                                            required
                                            disabled={!!watchSenderName}
                                            footer={
                                                <span id="rs_Messaging_Setting">
                                                    <RSDropdownFooterBtn
                                                        title={ADD_SENDER_ID}
                                                        handleClick={() => {
                                                            const nav = getChannelNavigationValues('rcs');
                                                            const navState = createCommunicationSettingsNavState(
                                                                'messaging',
                                                                {
                                                                    mode: 'add',
                                                                    from: 'CreateCommunication',
                                                                    campaignType: location?.campaignType,
                                                                    messagingTabId: MESSAGING_TAB_ID.RCS,
                                                                    rcsTabId: 'vendor',
                                                                    backAction: window.location.search,
                                                                    tabValueName: nav.tabValueName,
                                                                    tabValue: nav.tabValue,
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
                                    </div>
                                </Col>
                                {!!watchSenderName && (
                                    <Col sm={3} className="rs_input_icons_groups">
                                            <RSTooltip text={RESET} className="input_icon" position="top">
                                                <i
                                                    id="rs_data_refresh"
                                                    className={`${restart_medium} icon-md color-primary-blue`}
                                                    onClick={() => {
                                                        setIsReset(true);
                                                    }}
                                                />
                                            </RSTooltip>
                                    </Col>
                                )}
                                {/* <Col sm={3} className="fg-icons-wrapper pl0">
                                        <div className="fg-icons d-flex">
                                            <RSTooltip text={'Refresh'} className="lh0 " position="top">
                                                <i
                                                    id="rs_data_refresh"
                                                    className={`${refresh_medium} icon-md color-primary-blue`}
                                                    onClick={() => {
                                                        clearErrors();
                                                        reset(rcsFormInitialState?.defaultValues);
                                                    }}
                                                />
                                            </RSTooltip>
                                        </div>
                                    </Col> */}
                            </Row>
                        </div>
                        {campaignTypeAndId?.campaignType === 'S' && (
                            <div className="form-group" ref={audienceRef}>
                                <AudienceFieldRenderComponent
                                    type={'rcs'}
                                    audienceList={audienceList}
                                    methods={methods}
                                    userDetails={{ departmentId, userId, clientId }}
                                    name={rcsFieldName.audience}
                                    campaignId={campaignTypeAndId?.campaignId}
                                    isAudienceLoading={audienceLoader.isLoading}
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
                                                 {AUDIENCE}:  {handleTotalAudienceCount(campaignDetails,watchtotalAudience,calucateAudienceCount)}
                                            </small>
                                        </div>
                                    }
                                    audienceTextField={'audienceRCS'}
                                    handleAudienceFieldOnChange={() => {
                                        setTimeout(() => {
                                            if (
                                                watchSplitTest &&
                                                splitTabConfig?.splitTabs?.length >= 2 &&
                                                calucateAudienceCount > 0
                                            ) {
                                                const defaultSplittedCount = calculateDefaultSplittedCount(
                                                    splitTabConfig?.splitTabs.length,
                                                    calucateAudienceCount,
                                                    splitTabConfig?.splitTabs,
                                                );
                                                setSliderState((prev) => ({
                                                    ...prev,
                                                    splittedCount: defaultSplittedCount,
                                                }));
                                            }
                                        }, 0);
                                    }}
                                />
                            </div>
                        )}

                        {(campaignTypeAndId.campaignType === 'S' ||
                            (campaignTypeAndId.campaignType === 'M' &&
                                mdcContentSetupDetails?.dataSource === 'TL' &&
                                levelNumber === 1)) && (
                                <div className="form-group">
                                    <Row>
                                        <Col sm={{ offset: 1, span: 2 }}>
                                            <label className="control-label-left">{LABLE_SPLIT_AB}</label>
                                        </Col>
                                        <Col
                                            sm={1}
                                            className={`${!isSplitABEnable ? 'pe-none click-off' : 'cp'}`}
                                        >
                                            <div
                                                onClick={() => {
                                                    if (watchSplitTest) {
                                                        setIsSplitOffConfirmationModal(true);
                                                    } else {
                                                        const {
                                                            approvalList: { testPhoneNumber, dialCode },
                                                        } = getValues();
                                                        const { approvalList, ...restRefreshFields } = refreshFields;
                                                        reset(
                                                            (formState) => ({
                                                                ...formState,
                                                                splitTest: true,
                                                                ...restRefreshFields,
                                                            }),
                                                            {
                                                                keepDirty: true,
                                                            },
                                                        );
                                                        setEmptySplitDate({
                                                            text: '',
                                                        });
                                                        const splitTabs = _cloneDeep(SPLIT_TABS);
                                                        const modifiedTabs = splitTabs?.map((tab, index) => {
                                                            if (splitTabs?.length - 1 === index) {
                                                                return {
                                                                    ...tab,
                                                                    add: circle_plus_edge_medium,
                                                                };
                                                            } else {
                                                                return {
                                                                    ...tab,
                                                                };
                                                            }
                                                        });
                                                        setSplitTabs(modifiedTabs);
                                                        setSplitTabConfig({
                                                            currentTab: 0,
                                                            splitTabs: ['splitA', 'splitB'],
                                                        });

                                                        // Initialize default splittedCount when split test is enabled
                                                        if (calucateAudienceCount > 0) {
                                                            const defaultSplittedCount = calculateDefaultSplittedCount(
                                                                2, // Initial split tabs count
                                                                calucateAudienceCount,
                                                                ['splitA', 'splitB'],
                                                            );
                                                            setSliderState({
                                                                show: false,
                                                                splittedCount: defaultSplittedCount,
                                                            });
                                                        }
                                                    }
                                                    dispatch(updateRCSList({ data: {}, field: 'editorContent' }));
                                                }}
                                            >
                                                {watchSplitTest && emptySplitdate?.text && (
                                                    <small className="alert alert-danger d-block color-primary-red position-absolute px7 top-35 splitab-error-text">
                                                        {AUTO_SCHEDULE_SPLITS}
                                                    </small>
                                                )}
                                                <RSSwitch control={control} name={rcsFieldName.splitTest} preventChange />
                                            </div>
                                        </Col>
                                        <Col sm={8} className="pl0 d-flex">
                                            <div className="pl0 d-flex align-items-center">
                                                {watchSplitTest && (
                                                    <Fragment>
                                                        <RSTooltip
                                                            text={ADJUST_SPLIT_SIZE}
                                                            className="lh0 mr15"
                                                        >
                                                            <i
                                                                className={`${adjust_split_medium} icon-md color-primary-blue`}
                                                                onClick={() =>
                                                                    setSliderState((prev) => ({
                                                                        ...prev,
                                                                        show: true,
                                                                    }))
                                                                }
                                                            />
                                                        </RSTooltip>
                                                        <RSTooltip text={'Schedule'} className="lh0 mr15">
                                                            <i
                                                                className={`${timer_medium} icon-md  color-primary-blue `}
                                                                onClick={() => {
                                                                    let emptySplit = '';
                                                                    let isError = {};
                                                                    let tabs = splitTabConfig?.splitTabs;
                                                                    const formState = getValues();
                                                                    _forEach(tabs, (tab) => {
                                                                        const date =
                                                                            formState[tab]?.['schedule'] || null;
                                                                        if (!date) {
                                                                            emptySplit += emptySplit ? `, ${tab}` : tab;
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
                                                <RSPPophover text={SPLIT_AB_TOOLTIP_TEXT}>
                                                    {!watchSplitTest ? (
                                                        <i
                                                            className={`${circle_question_mark_mini} icon-xs  color-primary-blue position-relative`}
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
                            )}

                        {sliderState.show && (
                            <SplitSlider
                                audienceCount={calucateAudienceCount}
                                splitTabs={splitTabConfig?.splitTabs}
                                sliderData={sliderState.splittedCount}
                                onSave={(slider) => {
                                    setSliderState({
                                        show: false,
                                        splittedCount: slider,
                                    });
                                }}
                                handleClose={() =>
                                    setSliderState((prev) => ({
                                        ...prev,
                                        show: false,
                                    }))
                                }
                            />
                        )}

                        {watchSplitTest && (
                            <div className="no-scroll-rs-content-tabs">
                                <RSTabbar
                                    dynamicTab={`res-content-tabs-split`}
                                    componentClassName ={'w-100'}
                                    activeClass={`active`}
                                    flatTabs
                                    tabData={splitTabs}
                                    defaultTab={splitTabConfig?.currentTab}
                                    isRemoveConfirmation
                                    callBack={(_, index) => {
                                        setValue('currentSplitTab', index);
                                        setSplitTabConfig((prev) => ({
                                            ...prev,
                                            currentTab: index,
                                        }));
                                    }}
                                    onAddMenu={(index) => addSplitTabs(index)}
                                    onRemoveMenu={removeSplitTabs}
                                    onRefresh={refreshSplitABTab}
                                />
                            </div>
                        )}

                        {/* {!watchSplitTest && watchSenderName && (
                            <div className={`form-group`}>
                                <Row>
                                    <Col sm={{ offset: 1, span: 2 }}>
                                        <label className="control-label-left">{TEMPLATE_NAME}</label>
                                    </Col>
                                    <Col sm={6} id="rs_Messaging_templateName">
                                        <RSKendoDropDownList
                                            control={control}
                                            name={rcsFieldName.templateName}
                                            label={TEMPLATE_NAME}
                                            dataItemKey={'rcsTemplateId'}
                                            textField={'templateName'}
                                            data={templateList}
                                            isLoading={
                                                templateListLoader.isLoading ||
                                                templateContentLoader.isLoading
                                            }
                                            required
                                            rules={{
                                                required: SELECT_TEMPLATE_NAME,
                                            }}
                                            handleChange={({ value }) => {
                                                fetchRCSTemplateContent(value);
                                            }}
                                        />
                                    </Col>
                                </Row>
                            </div>
                        )} */}
                        {!watchSplitTest && (
                            <SplitAB
                                isSplitTabs={false}
                                fieldName={''}
                                // levelNumber={levelNumber}
                                // channelTabName={type}
                                // campaignType={campaign.campaignType}
                                // templateType={isWhatsapp ? templateName?.templateType : 0}
                                // waSelectedTemplate={templateName}
                                // smsPreview={smsPreview}
                                // setSmsPreview={setSmsPreview}
                            />
                        )}
                        {/* {!watchSplitTest && !!watchTemplateName && (
                            <>
                                {watchTemplateName?.templateType === 3 ? (
                                    <div className="form-group">
                                        <>
                                            <Col sm={{ offset: 0, span: 11 }} className="ml19">
                                        <RSTabbar
                                            dynamicTab={`rs-content-tabs-flat col-sm-9`}
                                            extraClassName={'col-sm-10 offset-sm-1'}
                                            activeClass={`active`}
                                            heading="RCS content"
                                            flatTabs
                                            defaultTab={currentTabIndex}
                                            tabData={updateTabData}
                                            callBack={(_, index) => {}}
                                        />
                                    </Col>
                                            <Carousel />
                                        </>
                                    </div>
                                ) : (
                                    <>
                                        <TextContent isSplitAB={false} fieldName={''} />
                                    </>
                                )}
                            </>
                        )} */}

                        <div className={isPastPlanDurationBlocked ? PAST_PLAN_DURATION_CLICK_OFF_CLASS : ''}>
                        <RequestApproval
                            name="approvalList.name"
                            parent="approvalList"
                            isCustomapproval={false}
                            isCustomEnterMail={true}
                            isSendButton
                            isPhoneLoading={contactLoader.isLoading}
                            isClickOff={isPastPlanDurationBlocked || isSubmitting}
                            isSendLoading={isSendLoading}
                            onRequestApproval={(status) => {
                                if (isPastPlanDurationBlocked || Object.keys(errors).includes('approvalList')) return;
                                const type = !status ? 'test preview' : 'request for approval';
                                handleSubmit((data) => formSubmitHandler(data, type, false, type === 'test preview'))();
                            }}
                            testPreviewConfigDetail={{
                                fieldType: 'phoneInput',
                                fieldLabel: 'Test message',
                                fieldName: 'approvalList.testPhoneNumber',
                                testEmail: true,
                            }}
                            getCountry={(country) => {
                                setCountry(country);
                            }}
                            RfaCallBack={(isRFA) => {
                                let schedulerName = watchSplitTest
                                    ? `${splitTabs?.[splitTabConfig?.currentTab]?.id}.schedule`
                                    : 'schedule';
                                if (!isRFA) {
                                    const currentSchedule = getValues(schedulerName);
                                    unregister(schedulerName);
                                    if (currentSchedule) {
                                        setValue(schedulerName, currentSchedule, { shouldValidate: true });
                                    }
                                }
                            }}
                            channelType={'rcs'}
                        />
                        </div>
                    </div>
                    <div className="buttons-holder">
                        <RSSecondaryButton
                            type="button"
                            onClick={() => {
                                if (_get(location, 'campaignType', 'S') === 'M') {
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
                            id="rs_Messaging_Cancel"
                        >
                            {CANCEL}
                        </RSSecondaryButton>
                        <>
                            {' '}
                            {(!isClickOff && location?.campaignType === 'M') ||  location?.campaignType !== 'M' ? (
                                <>
                                    {' '}
                                    <RSSecondaryButton
                                        className={`color-primary-blue ${isPastPlanDurationBlocked ? PAST_PLAN_DURATION_CLICK_OFF_CLASS : ''}`}
                                        onClick={() => {
                                            if (isPastPlanDurationBlocked || Object.keys(errors).includes('approvalList')) {
                                                return;
                                            }
                                            const formData = getValues();
                                            const isCTGTConfirm = handleCheckCTGT(formData[rcsFieldName.audience]);
                                            const hasUserConfirmed = formData.isCGTGConfirm === true;

                                            // Only show modal if CG/TG conflict exists and user hasn't confirmed yet (skip in RUN env - handled in audience)
                                            if (isCTGTConfirm && !hasUserConfirmed  && !handleCGTGModalCheck(campaignDetails?.content?.[0]?.statusId)) {
                                                setPendingNextSubmitParams({ type: 'save', isSchedule: true });
                                                setNextButtonCGTGModal(true);
                                                return;
                                            }

                                            handleSubmit((data) => formSubmitHandler(data, 'save', true))();
                                        }}
                                        id="rs_Messaging_Save"
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
                                            if (!isDirty && !isValid && location?.campaignType !== 'M') {
                                                if (!shouldPromptSkipChannelConfirmation()) {
                                    handleNavigation();
                                    return;
                                }
                                                setNavigate_confirm(true);
                                            } else if (Object.keys(errors).includes('approvalList')) {
                                                return;
                                            } else {
                                                const formData = getValues();
                                                const isCTGTConfirm = handleCheckCTGT(formData[rcsFieldName.audience]);
                                                const hasUserConfirmed = formData.isCGTGConfirm === true;

                                                // Only show modal if CG/TG conflict exists and user hasn't confirmed yet (skip in RUN env - handled in audience)
                                                if (isCTGTConfirm && !hasUserConfirmed   && !handleCGTGModalCheck(campaignDetails?.content?.[0]?.statusId)) {
                                                    setPendingNextSubmitParams({ type: 'form', isSchedule: true });
                                                    setNextButtonCGTGModal(true);
                                                    return;
                                                }

                                                handleSubmit((data) => formSubmitHandler(data, 'form', true))();
                                            }
                                        }}
                                        id="rs_Messaging_Next"
                                    >
                                        {location?.campaignType === 'M'
                                            ? `${mdcContentSetupDetails?.mdcButtonText} ${'RCS'} content`
                                            : NEXT}
                                    </RSPrimaryButton>{' '}
                                </>
                            ) : null}
                        </>
                    </div>
                </form>

                <SplitABScheduleModal
                    tabs={splitTabConfig?.splitTabs}
                    type="messaging"
                    show={isShowScheduleModal}
                    handleClose={() => setIsShowScheduleModal(false)}
                    editAutoScheduleDetails={editAutoScheduleDetails}
                />

                {ModalConfig.map((modal) => (
                    <RSConfirmationModal
                        header={modal.header}
                        key={modal.key}
                        show={modal.show}
                        text={modal.text}
                        primaryButtonText={modal.primaryButtonText}
                        handleClose={modal.handleClose}
                        handleConfirm={modal.handleConfirm}
                        primaryButton={modal?.primaryButton}
                        secondaryButton={modal?.secondaryButton}
                    />
                ))}
                {isTestCommSent?.show && (
                    <CommunicationSent
                        show={isTestCommSent?.show}
                        rfaMsg={isTestCommSent.isRFA || false}
                        isCloseButton={isTestCommSent.isRFA ? false : true}
                        handleClose={() => {
                            if (isTestCommSent?.isRFA === true) {
                                rfaManuallyClosedRef.current = true;
                                if (rfaAutoNavTimeoutRef.current) {
                                    clearTimeout(rfaAutoNavTimeoutRef.current);
                                    rfaAutoNavTimeoutRef.current = null;
                                }
                                setisTestComSent({ show: false, message: '', status: false, isRFA: false });
                                location.campaignType === 'M'
                                    ? handleMdcNavigation({ data: saveCampaigData })
                                    : handleNavigation();
                                return;
                            }
                            setisTestComSent({ show: false, message: '', status: false, isRFA: false });
                        }}
                        requestFalse={isTestCommSent?.status ? '' : isTestCommSent?.message}
                        smsPreview={isTestCommSent?.smsPreview || false}
                    />
                )}

                {getWarningPopupMessage(failureApiErrors, dispatch)}
                <RSConfirmationModal
                    show={isAudienceChangeConfirm}
                    text={AUDIENCE_CHANGE_CONFIRMATION}
                    primaryButtonText="Yes, proceed"
                    secondaryButtonText="Cancel"
                    handleClose={() => {
                        // Reset audience to previous value when user cancels
                        setValue(rcsFieldName.audience, previousAudience);
                        setIsAudienceChangeConfirm(false);
                    }}
                    handleConfirm={async () => {
                        try {
                            const payloadParams = {
                                departmentId,
                                clientId,
                                userId,
                            };
                            await handlePersonalizationFetchApiCall({
                                audience: watch(rcsFieldName.audience),
                                errors,
                                dispatch,
                                payloadParams,
                                listTypeWisePersonlization,
                            });
                            if (!isMounted.current) return;
                            setIsAudienceChangeConfirm(false);
                        } catch {
                            if (isMounted.current) setIsAudienceChangeConfirm(false);
                        }
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
                            handleSubmit((data) =>
                                formSubmitHandler(
                                    data,
                                    pendingNextSubmitParams.type,
                                    pendingNextSubmitParams.isSchedule,
                                ),
                            )();
                        }
                        setPendingNextSubmitParams(null);
                    }}
                />
            </FormProvider>
            </AuthoringChannelEditSkeletonGate>
        </RCSProvider.Provider>
    );
};

export default RCS;
