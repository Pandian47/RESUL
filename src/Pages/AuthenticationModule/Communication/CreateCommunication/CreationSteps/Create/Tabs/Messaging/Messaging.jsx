import { UpdateState } from 'Utils/modules/misc';
import { campaignSchedule, checkRFAApproved, checkTrigger, diff_minutes, statusIdCheck, validateRFAMandatory } from 'Utils/modules/campaignUtils';
import { CHANNELS_LIST } from 'Utils/modules/communicationChannels';
import { convertUserTimezoneToTarget, getYYMMDD } from 'Utils/modules/dateTime';
import { checkScheduleDate } from 'Utils/modules/display';
import { mapAudienceWithChannelLabels } from 'Utils/modules/formatters';
import { getmasterData } from 'Utils/modules/masterData';
import { createCommunicationSettingsNavState, MESSAGING_TAB_ID } from 'Utils/modules/navigation';
import { encodeUrl, getUserDetails } from 'Utils/modules/crypto';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { buildPayload, FORM_INITIAL_STATE, INITIAL_STATE, refreshFields, SPLIT_TABS, splitABRefreshFields } from './constant';
import { ENTER_LANGUAGE, EXCEPTION_OCCURRED, SELECT_SENDER_ID } from 'Constants/GlobalConstant/ValidationMessage';
import { ADD_SENDER_ID, ADJUST_SPLIT_SIZE, ARE_YOU_SURE_WANT_TO_RESET, AUDIENCE, AUDIENCE_CHANGE_CONFIRMATION, AUDIENCE_COUNT_ZERO_ENABLE_AUTO_REFRESH, AUTO_REFRESH, AUTO_REFRESH_POP_HOVER_TEXT, AUTO_SCHEDULE_SPLITS, CANCEL, CHECK_START_DATE_AND_END_DATE, COMMUNICATION_SCHEDULED, CONFIRMATION, IGNORE_CHANNEL, LABLE_SPLIT_AB, LANGUAGE, MESSAGING_LANGUAGE, MINIMUM_DIFFERENCE_SPLITS, MOBILE_NUMBER, NEXT, OK, RESET, SAVE, SCHEDULE, SELECT_SCHEDULE_TIME, SENDER, SENDER_ID, SPLIT_AB_TOOLTIP_TEXT, SPLIT_AB_TURNOFF, WARNING } from 'Constants/GlobalConstant/Placeholders';
import { adjust_split_medium, circle_minus_fill_medium, circle_plus_edge_medium, circle_plus_medium, circle_question_mark_medium, circle_question_mark_mini, timer_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { map as _map,forEach as _forEach,  get as _get,find as _find,filter as _filter,cloneDeep as _cloneDeep,uniqBy as _uniqBy} from 'Utils/modules/lodashReplacements';
import { Col, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, FormProvider } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { PhoneNumberUtil } from 'google-libphonenumber';

import {
    sumMobileAudienceCount,
    sanitizeMessagingCount,
    ensureMessagingContent,
    ensureSegmentationListIds,
    normalizeMessagingCampaignData,
    getMessagingCampaignStatusId,
    hasMessagingCampaignDetails,
} from './constant';
import MessagingContext from './context';
import RSTabbar from 'Components/RSTabber';
import RSTooltip from 'Components/RSTooltip';
import RSPPophover from 'Components/RSPPophover';
import SplitAB from './Component/SplitAB/SplitAB';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import RSSwitch from 'Components/FormFields/RSSwitch/index';
import RSConfirmationModal from 'Components/ConfirmationModal';
import SplitSlider from '../../Component/SplitSlider/SplitSlider';
import SplitABScheduleModal from '../../Component/SplitABScheduleModal';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSDropdownFooterBtn from 'Components/DropdownFooterBtn';
import CommunicationSent from '../../Component/CommunicationSent/CommunicationSent';
import RequestApproval from 'Pages/AuthenticationModule/Components/RequestApproval/RequestApproval';
import SmartLinkEnable from '../../Component/SmartLinkEnable/SmartLinkEnable';
import AuthoringChannelEditSkeletonGate, {
    getAuthoringEditFieldLoaderConfig,
    getAuthoringSaveButtonType,
    resetAuthoringChannelEditSession,
    useAuthoringChannelEditLoader,
    useAuthoringChannelSaveLoader,
} from 'Components/Skeleton/pages/communication/authoring';
import { getUserListCampaign, getUtcTimeNow } from 'Reducers/globalState/request';
import { getUtcTimeData } from 'Reducers/globalState/selector';

import { SCHEDULE_START_TIME_MENU } from '../Email/constant';

import { ensureArray, ensureObject } from 'Pages/AuthenticationModule/Audience/audienceDefaults';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { SPLIT_AB_NAME, availableTabs, communicationChannels, getNextEligibleTabIndex, MESSAGING_TAB_CHANNEL_MAP, handleAutoRefreshClickOff, handlePersonalizationFetchApiCall, calculateDefaultSplittedCount, AudienceFieldRenderComponent, audienceTypeList, handleMDCQueryParamsUpdate, handleCheckCTGT, validateAudienceCount, mergeChannelAudiences, handleUpdateEditAudienceCount,handleTotalAudienceCount, handleCGTGModalCheck, editActionIdFromCommunicationResponse, getPastPlanDurationBlockedState, validatePastPlanDurationOnSubmit, PAST_PLAN_DURATION_CLICK_OFF_CLASS } from '../../constant';
import { COUNTRY_MASK } from '../VMS/constant';
import {
    updateDirtyState,
    updateMessaging,
    updateSmsList,
    updateTab,
    updateVerticalTab,
    resetCreateCommunication,
    updateMDCEditMode,
    updateFilterAudience,
    updateAudience,
    updateTotalAudienceCount,
} from 'Reducers/communication/createCommunication/Create/reducer';
import { getAudienceList, saveMessagingCampaign, getMessagingCampaignById, getContactByUserId, getSMSTemplateLanguage } from 'Reducers/communication/createCommunication/Create/request';
import { updateChannelAudiences } from 'Reducers/communication/createCommunication/plan/reducer';
import { getSmsTemplateList } from 'Reducers/preferences/CommunicationSettings/request';
import { getRequestApprovalList, getSessionId } from 'Reducers/globalState/selector';
import { getAudience, getFilterAudience, smsList } from 'Reducers/communication/createCommunication/Create/selectors';
import { getGeneratedLink } from 'Reducers/communication/createCommunication/smartlink/selectors';
import { getSmartUrl } from 'Reducers/communication/createCommunication/smartlink/request';
import { updateSmartLinkShow } from 'Reducers/communication/createCommunication/execute/reducer';
import useQueryParams from 'Hooks/useQueryParams';
import useApiLoader from 'Hooks/useApiLoader';
import { showTabsSmartlink } from 'Reducers/communication/createCommunication/smartlink/reducer';
import { getSmsSettingsDetail } from 'Reducers/communication/createCommunication/Create/request';
import { AUTHORING_FIELD_LOADER_CONFIG } from 'Components/Skeleton/pages/communication/authoring';
let userKeyInfo = [];
const Messaging = ({ type = 'SMS', mCampType, channelId }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useQueryParams('/communication');
    //const dialCode = useRef('');
    // const phoneNumber = useRef();
    const formTypeRef = useRef(null);
    const isAlreadyEditCallRef = useRef(false);
    const skipEditSmsFetchRef = useRef(false);
    const rfaAutoNavTimeoutRef = useRef(null);
    const rfaManuallyClosedRef = useRef(false);
    const { languageMasterList, timeZoneList } = getmasterData();
    const [campaign, setCampaign] = useState({});

    const approvalList = useSelector((state) => getRequestApprovalList(state));
    const [mdcContentSetupDetails, setMdcContentSetupDetails] = useState({});
    const [levelNumber, setLevelNumber] = useState(1);
    const [actionId, setActionId] = useState(0);
    const [mdcChannelDetailId, setMdcChannelDetailId] = useState(0);
    const [mdcAudience, setMdcAudience] = useState([]);
    const [dataSource, setDataSource] = useState('TL');
    const [mdcButtonText, setMdcButtonText] = useState(`Create`);
    const [mask, setMask] = useState(COUNTRY_MASK);
    const [country, setCountry] = useState('');
    const [longNumber, setLongNumber] = useState(52);
    const [smsTemplateList, setSmsTemplateList] = useState([]);
    const [emptySplitdate, setEmptySplitDate] = useState({
        text: '',
    });
    const [editAutoScheduleDetails, setEditAutoScheduleDetails] = useState({});
    const [isAudienceChangeConfirm, setIsAudienceChangeConfirm] = useState(false);
    const [previousAudience, setPreviousAudience] = useState([]);
    const [nextButtonCGTGModal, setNextButtonCGTGModal] = useState(false);
    const [audienceCountZeroWarning, setAudienceCountZeroWarning] = useState(false);
    const [pendingNextSubmitParams, setPendingNextSubmitParams] = useState(null);
    const { failureApiErrors, isCurrentBURFAStatus } = useSelector(({ globalstate }) => globalstate);
    const { savedChannelsId, channelAudiences = {} } = useSelector(({ communicationPlanReducer }) => communicationPlanReducer);
    const utcTimeData = useSelector(getUtcTimeData);
    userKeyInfo = approvalList || [];
    const filterAudienceList = useSelector((state) => getFilterAudience(state));
    const {
        tabsState: { messaging: messagingTabState },
        activeTabs,
        verticalTab: { type: channelType, currentTab },
        isDirty,
        isMDCEditMode,
        personalization,
        listTypeWisePersonlization,
    } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const {
        smsSettings,
        campaignDetails = {},
        templateSMSLanguage: templateSMSLanguageList,
    } = useSelector((state) => smsList(state));

    const { smartLink1, smartLink2 } = useSelector((state) => getGeneratedLink(state));
    const smartLink = useSelector((state) => getGeneratedLink(state));
    // console.log('MMMM ::::::::::::::: ', smartLink);
    const { tabSmartLink_Flag, customFields, mobileApps, screenList, subScreenList } = useSelector(
        ({ smartLinkReducer }) => smartLinkReducer,
    );

    let audienceList = useSelector((state) => getAudience(state)) ?? [];

    const editBindAuidenceRef = useRef(false);
    const editCallAuidenceRef = useRef(false);

    const methods = useForm(FORM_INITIAL_STATE);
    const {
        control,
        setError,
        watch,
        setValue,
        clearErrors,
        formState: { errors, dirtyFields, isValid },
        handleSubmit,
        reset,
        trigger,
        resetField,
        getValues,
        unregister,
    } = methods;
        
    // const dirty = { ...dirtyFields };
    // console.log('getValues: ', getValues());

    const [state, setState] = useState(INITIAL_STATE);
    const [templateName, setTemplateName] = useState(0);
    const [templatePhone, setTemplatePhone] = useState({});
    const [splitTabs, setSplitTabs] = useState(SPLIT_TABS);
    const [isEditMessagingFail, setIsEditMessaging] = useState(false);
    const [isClickOff, setIsClickOff] = useState(false);
    const [splitTabConfig, setSplitTabConfig] = useState({
        currentTab: 0,
        splitTabs: ['splitA', 'splitB'],
    });
    const [smsPreview, setSmsPreview] = useState(false);
    const [sliderState, setSliderState] = useState({
        show: false,
        splittedCount: {},
    });
    let [
        splitTest,
        audience,
        isRequestApproval,
        senderName,
        senderId,
        phoneNumber,
        err,
        dailCode,
        watchtotalAudience
    ] = watch([
        'splitTest',
        'audience',
        'approvalList.requestApproval',
        'senderName',
        'senderId',
        'phoneNumber',
        'err',
        'approvalList.dialCode',
        'totalAudience'
    ]);
    // console.log('getCountryVal: ', getCountryVal);
    const [disableNext, setDisableNext] = useState(true);
    const [saveCampaigData , setSaveCampaigData] = useState(null);
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

    const { showEditSkeleton, isSavedChannel, beginEditSkeleton, finishEditSkeleton, resetEditLoading } =
        useAuthoringChannelEditLoader({
        channelId,
        subChannelId: channelId,
        shouldLoadEdit: (isMDCEditMode === 'edit' && mdcChannelDetailId > 0) || mCampType === 'M',
    });
    const savedChannel = isSavedChannel;
    const editFieldLoaderConfig = getAuthoringEditFieldLoaderConfig({
        showEditSkeleton,
        mCampType,
        savedChannel,
    });

    const senderIdLoader = useApiLoader();
    const audienceLoader = useApiLoader();
    const contactLoader = useApiLoader();
    const templateListLoader = useApiLoader();
    const { runSave, beginSubmit, endSubmit, isSaveLoading, isNextLoading, isSendLoading, isSubmitting } =
        useAuthoringChannelSaveLoader();

    if (campaign.campaignType === 'M') {
        audience = ensureArray(mdcAudience);
    }
    let calucateAudienceCount = useMemo(() => sumMobileAudienceCount(audience), [audience]);

    const isSplitABEnable = calucateAudienceCount >= 100;
    //&& !Object.hasOwn(errors, 'audience');

    useEffect(() => {
        dispatch(updateTotalAudienceCount(calucateAudienceCount ?? 0));
    }, [calucateAudienceCount, dispatch]);
    const getUsersList = async () => {
        try {
            const usersRes = await dispatch(
                getUserListCampaign({ payload: { clientId, userId, loggedinusertype: 0 }, loading: false }),
            );
            let userList = ensureArray(usersRes?.status ? usersRes?.data : []);
            const users = _map(userList, (list) => ({ ...list, name: `${list.firstName} (${list.email})` }));
            userKeyInfo = users;
            return users;
        } catch {
            userKeyInfo = [];
            return [];
        }
    };
    useEffect(() => {
        if (!userKeyInfo?.length || !userKeyInfo) {
            getUsersList();
        }
    }, []);

    // Call UTC time API on component mount
    // useEffect(() => {
    //     dispatch(getUtcTimeNow());
    // }, [dispatch]);
    useEffect(() => {
        contactLoader
            .refetch({
                fetcher: ({ payload } = {}) =>
                    dispatch(getContactByUserId({ payload, loading: false })),
                mode: savedChannel ? 'edit' : 'create',
                loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
                params: { payload: { userId, clientId, departmentId } },
            })
            .then((rslt) => {
                if (!rslt) return;
                const {
                    status,
                    data: { phoneNo, countryCode } = {},
                } = rslt;
                if (status && countryCode) {
                    let tempCode = countryCode.includes('+') ? countryCode : `+${countryCode}`;
                    if (tempCode) {
                        const num = `${tempCode} ${phoneNo}`;
                        setValue('approvalList.testPhoneNumber', num);
                        setValue('approvalList.dialCode', tempCode);
                    }
                }
            });
    }, []);
    useEffect(() => {
        async function getSmartLink() {
            const payload = { clientId, departmentId, userId, campaignId: _get(location, 'campaignId', 0) };
            const res = await dispatch(
                getSmartUrl({
                    payload,
                    listData: { mobileApps, personalization },
                    screenListObj: { screenList, subScreenList },
                    reduceLoad: true,
                    loading: mCampType === 'M' ? false : undefined,
                }),
            );
            if (!res?.status) {
                if (!statusIdCheck(location?.statusId)) {
                    UpdateState(setState, 'isSmartLink', false);
                    dispatch(updateSmartLinkShow(true));
                } else {
                    UpdateState(setState, 'isSmartLink', true);
                    dispatch(updateSmartLinkShow(false));
                }
            } else {
                UpdateState(setState, 'isSmartLink', false);
                dispatch(updateSmartLinkShow(true));
            }
        }
        if (!smartLink1 && !tabSmartLink_Flag) {
            let smartLinks = [...Object.keys(ensureObject(smartLink))];
            if (location && _get(location, 'campaignId', 0) > 0 && smartLinks?.length === 0) {
                if (
                    !statusIdCheck(
                        getMessagingCampaignStatusId(campaignDetails),
                    )
                ) {
                    UpdateState(setState, 'isSmartLink', false);
                    dispatch(updateSmartLinkShow(true));
                    dispatch(showTabsSmartlink(true));
                } else {
                    //getSmartLink();
                }
            }
        }
    }, [location, campaignDetails]);

    useEffect(() => {
        const campaign = {
            campaignId: _get(location, 'campaignId', 0),
            campaignType: _get(location, 'campaignType', 'S'),
        };
        const mdcContentSetupDetails = _get(location, 'mdcContentSetupDetails', {});
        const levelNumber = _get(mdcContentSetupDetails, 'levelNumber', 1);
        const actionId = _get(mdcContentSetupDetails, 'actionId', 0);
        const mdcChannelDetailId = _get(mdcContentSetupDetails, 'channelDetailId', 0);
        const mdcAudience = _get(mdcContentSetupDetails, 'audience', []);
        const dataSource = _get(mdcContentSetupDetails, 'dataSource', 'TL');
        const mdcIsCGTGEnabled = _get(mdcContentSetupDetails, 'isCGTGEnabled', false);
        const mdcButtonText = mdcChannelDetailId ? 'Update' : 'Create';

        setDataSource(dataSource);
        setCampaign(campaign);
        setMdcContentSetupDetails(mdcContentSetupDetails);
        setLevelNumber(levelNumber);
        setActionId(actionId);
        setMdcAudience(ensureArray(mdcAudience));
        setMdcButtonText(mdcButtonText);
        setMdcChannelDetailId(mdcChannelDetailId);
        
        // For MDC create mode (no channelDetailId), set isCGTGEnabled from mdcContentSetupDetails
        if (campaign.campaignType === 'M' && !mdcChannelDetailId) {
            setValue('isCGTGEnabled', mdcIsCGTGEnabled);
        }
    }, [location]);
    useEffect(() => {
        if (!isDirty && Object.keys(dirtyFields)?.length > 0) {
            dispatch(updateDirtyState(true));
        } else if (isDirty && Object.keys(dirtyFields)?.length === 0) {
            dispatch(updateDirtyState(false));
        }
    }, [JSON.stringify(dirtyFields)]);

    useEffect(() => {
        return () => {
            resetState(true);
        };
    }, []);

    const handleEditCallApi = () => {
        const isMDC = _get(location, 'campaignType', 'S') === 'M'
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

    useEffect(() => {
        async function fetchEditFlow() {
            if (skipEditSmsFetchRef.current) {
                return;
            }
            let shouldCallEditApi = false;
            const payload = {
                userId,
                clientId,
                departmentId,
                campaignId: _get(location, 'campaignId', 0),
            };
            const editPayload = {
                ...payload,
                levelNumber,
                actionId,
                smsChannelDetailId: mdcChannelDetailId,
            };
            let isMDChannelDetail;
            if (_get(location, 'campaignType', 'S') === 'M') {
                if (isMDCEditMode === 'edit') {
                    if (mdcChannelDetailId > 0) {
                        isMDChannelDetail = true;
                    } else {
                        isMDChannelDetail = false;
                    }
                } else {
                    isMDChannelDetail = true;
                }
            } else {
                isMDChannelDetail = true;
            }
            if (
                _get(location, 'campaignId', 0) > 0 &&
                formTypeRef.current === null &&
                !isAlreadyEditCallRef.current &&
                isMDChannelDetail
            ) {
                shouldCallEditApi = handleEditCallApi();
               
                isAlreadyEditCallRef.current = true;
                if (isSavedChannel && shouldCallEditApi) {
                    beginEditSkeleton();
                }
                try {
                    const editApiResult = await Promise.all([
                        senderIdLoader.refetch({
                            fetcher: ({ payload: senderPayload } = {}) =>
                                dispatch(getSmsSettingsDetail({ payload: senderPayload, loading: false })),
                            mode: savedChannel ? 'edit' : 'create',
                            loaderConfig: editFieldLoaderConfig,
                            params: { payload },
                        }),

                    location?.campaignType === 'S' &&
                        audienceList?.length === 0 &&
                            audienceLoader.refetch({
                                fetcher: ({ payload: audPayload, isFilter = false } = {}) =>
                                    dispatch(getAudienceList({ payload: audPayload, isFilter, loading: false })),
                                mode: savedChannel ? 'edit' : 'create',
                                loaderConfig: editFieldLoaderConfig,
                                params: {
                                payload: {
                                    ...payload,
                                    searchText: '',
                                    segmentIds: [],
                                    channelType: 'S',
                                    },
                                },
                            }),

                        shouldCallEditApi &&
                        dispatch(
                            getMessagingCampaignById({
                                payload: editPayload,
                                type,
                                campaignType: _get(location, 'campaignType', 'S'),
                                    isEnableLoader: false,
                            }),
                        ),
                ]);
                    const [{ data: smsSenderList } = {}, { data: audienceData } = {}, { status, data } = {}] =
                        editApiResult || [];
                if (status && !!Object.keys(ensureObject(data))?.length) {
                    const normalizedData = normalizeMessagingCampaignData(data);
                    const state = {
                        splitTabList: [],
                    };
                    var schedule = '';
                    const {
                        segmentationListId,
                        senderId,
                        languageId,
                        totalAudience,
                        isFlashMessageEnabled,
                        isSendTimeOptEnable,
                        isSplitAbEnabled = false,
                        content,
                        smsAutoSchedule,
                        smsSplit,
                        requestForApproval,
                        isAutoRefereshenabled,
                        testSmsMobileNo,
                        countryCodeMobile,
                        isCGTGEnabled,
                    } = normalizedData;
                    var temp = {};
                    let tempAudienceData = [];
                    const filterAudienceResponse = await audienceLoader.refetch({
                        fetcher: ({ payload: audPayload, isFilter = false } = {}) =>
                            dispatch(getAudienceList({ payload: audPayload, isFilter, loading: false })),
                        mode: 'edit',
                        loaderConfig: editFieldLoaderConfig,
                        params: {
                            payload: {
                                userId,
                                clientId,
                                campaignId: campaign.campaignId,
                                departmentId,
                                searchText: '',
                                segmentIds: segmentationListId,
                                channelType: 'S',
                            },
                            isFilter: true,
                        },
                    });
                    [ensureArray(audienceData ?? audienceList), ensureArray(filterAudienceResponse?.data)].forEach(
                        (item) => {
                            const updateAudienceData = _map(ensureArray(item), mapAudienceWithChannelLabels);
                        tempAudienceData.push(updateAudienceData);
                        },
                    );

                    let [defaultAudience, filterAudience] = tempAudienceData;
                    defaultAudience = ensureArray(defaultAudience);
                    filterAudience = ensureArray(filterAudience);
                    let audience = _filter(defaultAudience, (aud) =>
                        ensureSegmentationListIds(segmentationListId)?.includes(aud?.segmentationListId),
                    );

                    if (!audience?.length && filterAudience?.length && ensureSegmentationListIds(segmentationListId)?.length) {
                        audience = filterAudience;
                    }

                    if (_get(location, 'campaignType', '') === 'T') {
                        audience = [];
                    }
                    let templateList = []
                    {
                        let languageList = [];
                        const sender = _find(smsSenderList, ['clientSmsSettingId', senderId]);
                        // console.log('sender: ', sender);
                        temp.senderId = sender;
                        temp.isAutoRefereshenabled = isAutoRefereshenabled;
                       templateList = await fetchSMSTemplateList(sender?.senderId);
                        const findTemplate = _find(templateList, (item) => String(item.dltTemplateID) === String(data?.content?.[0]?.templateId));
                        temp.templateId = findTemplate || data?.content?.[0]?.templateId;
                        temp.isCustomTemplateId = findTemplate ? false : true
                        // const language = await fetchSMSTemplateLanguge();
                        // if (language.status) languageList = language.data;
                        // const language = _find(languageMasterList, ['languageID', languageId]);

                        // console.log('language: ', language);
                        // temp.language = _find(languageList, ['languageCode', languageId]); //language;
                    }
                    temp.totalAudience = sanitizeMessagingCount(totalAudience, 0);
                    dispatch(updateTotalAudienceCount(sanitizeMessagingCount(totalAudience, 0)));
                    if (isSplitAbEnabled) {
                        ensureMessagingContent(content).forEach(
                            ({ body, localBlastDateTime, splitType, timeZoneId, templateId }) => {
                            const tempTab = {};
                            const findTimeZone = _find(timeZoneList, ['timeZoneID', timeZoneId]);
                            tempTab.editorText = body;
                            tempTab.schedule = localBlastDateTime ? new Date(localBlastDateTime) : '';
                            tempTab.timezone = findTimeZone;
                             tempTab.templateId = _find(templateList, (item) => String(item.dltTemplateID) === String(templateId)) || templateId;
                            tempTab.isCustomTemplateId =  _find(templateList, (item) => String(item.dltTemplateID) === String(templateId))  ? false : true
                            temp[`split${splitType}`] = tempTab;
                            state.splitTabList.push(`split${splitType}`);
                            },
                        );
                        const tempTabState = state.splitTabList
                            .map((_, index, total) => {
                                const splitConfig = SPLIT_AB_NAME[index];
                                if (!splitConfig) return null;
                                const getSplitName = { ...splitConfig };
                            delete getSplitName.add;
                            return {
                                ...getSplitName,
                                component: () => (
                                    <SplitAB
                                        fieldName={_}
                                        key={getSplitName.id}
                                        isSplitTabs
                                        campaignType={campaign.campaignType}
                                    />
                                ),
                                ...(total?.length < 4 &&
                                    total?.length - 1 === index && { add: circle_plus_medium }),
                                ...(index > 1 &&
                                    total?.length - 1 === index && {
                                        remove: circle_minus_fill_medium,
                                    }),
                            };
                            })
                            .filter(Boolean);
                        // if (tempTabState?.length === 2 || tempTabState?.length === 3)
                        //     tempTabState[tempTabState?.length - 1].add = circle_plus_edge_medium;
                        let splitIndex = 0;
                        if (location?.splitType) {
                            const splitInd = tempTabState?.findIndex((item) => item?.id === location?.splitType);
                            if (splitInd !== -1 && splitInd < tempTabState?.length) {
                                splitIndex = splitInd;
                            }
                        }
                        setSplitTabs(tempTabState);
                        setSplitTabConfig({
                            currentTab: splitIndex,
                            splitTabs: tempTabState?.map((item) => item?.id),
                        });
                    } else {
                        const {
                            languageId,
                            body,
                            localBlastDateTime,
                            templateId,
                            timeZoneId,
                            templateContent,
                            waMediaURL,
                            waImagePath,
                            waTemplateId,
                            waMediaURLType,
                        } = content?.[0] || {};
                        const findTimeZone = _find(timeZoneList, ['timeZoneID', timeZoneId]);
                        // debugger;
                        // temp.schedule = localBlastDateTime ? new Date(localBlastDateTime) : '';
                        // temp.timezone = findTimeZone;
                        temp = {
                            ...temp,
                            schedule: !!localBlastDateTime ? new Date(localBlastDateTime) : '',
                            timezone: findTimeZone,
                        };
                        schedule = !!localBlastDateTime ? new Date(localBlastDateTime) : '';
                        temp.editorText = body;
                    }
                    if (ensureObject(smsAutoSchedule)?.autoSchedule) {
                        const tempSchedule = {};
                        const { autoSchedule, startIn, periodRange } = ensureObject(smsAutoSchedule);
                        tempSchedule.autoSchedule = autoSchedule;
                        tempSchedule.time = _find(SCHEDULE_START_TIME_MENU, ['id', Number(periodRange)]);
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
                    if (sanitizeMessagingCount(smsSplit?.splitAudience, 0) > 0) {
                        const tempSplitAudience = {};
                        const { splitAudience, splitPercentage, totalAudience: totalCount, splitWidth } =
                            smsSplit || {};
                        tempSplitAudience.count = sanitizeMessagingCount(splitAudience, 0);
                        tempSplitAudience.totalCount = sanitizeMessagingCount(totalCount, 0);
                        tempSplitAudience.audienceCount = sanitizeMessagingCount(totalAudience, 0);
                        tempSplitAudience.percentage = sanitizeMessagingCount(splitPercentage, 0);
                        tempSplitAudience.width = sanitizeMessagingCount(splitWidth, 0);
                        tempSplitAudience.tabs = _map(ensureMessagingContent(content), ({ splitType }) => `split${splitType}`);
                        setSliderState((prev) => ({ ...prev, splittedCount: tempSplitAudience }));
                    }
                    const isWorkflowEnabled = _get(requestForApproval, 'isWorkflowEnabled', false);
                    const approvarList = ensureArray(_get(requestForApproval, 'approvarList', []));

                    // Handle test phone number from API response
                    let testPhoneNumberToSet = '';
                    let dialCode = ''
                    if (testSmsMobileNo && countryCodeMobile) {
                        dialCode = countryCodeMobile?.includes('+') ? countryCodeMobile : `+${countryCodeMobile}`;
                        testPhoneNumberToSet = `${dialCode} ${testSmsMobileNo}`;
                    }
                 

                    const matchAudienceType = audienceTypeList?.filter((typeList) =>
                        ensureArray(audience)?.map((aud) => aud?.listType)?.includes(typeList?.id),
                    );
                    audience = _uniqBy(ensureArray(audience), 'segmentationListId');
                    audience = handleUpdateEditAudienceCount({
                        channelId: 2,
                        audience,
                        savedAudienceCountList: ensureArray(normalizedData?.savedAudienceCountList),
                        statusId: content?.[0]?.statusId,
                    });
                    reset((formState) => ({
                        ...formState,
                        editActionId: editActionIdFromCommunicationResponse(data),
                        audience,
                        audienceType: matchAudienceType?.length ? matchAudienceType : [audienceTypeList[0]],
                        isAutoRefereshenabled,
                        flashMessage: isFlashMessageEnabled,
                        sendTimeRecommendation: isSendTimeOptEnable,
                        splitTest: isSplitAbEnabled,
                        isCGTGEnabled: isCGTGEnabled ?? false,
                        approvalList: {
                            ...formState.approvalList,
                            ...(isWorkflowEnabled && {
                                name: _map(approvarList, ({ approvarName, flag } = {}) => {
                                    const approver = _find(approvalList, ['email', approvarName]);
                                    const name = !approver ? approvarName : approver;
                                    const isMandatory = flag ? flag : false;
                                    return { approverName: name, mandatory: isMandatory, isCustom: !approver };
                                }),
                            }),
                            followHierarchy: requestForApproval?.isFollowHierarchy,
                            requestApproval: isWorkflowEnabled,
                            approvalFrom: requestForApproval?.approvalFrom,
                            ...(testPhoneNumberToSet
                                ? { testPhoneNumber: testPhoneNumberToSet, dialCode: dialCode }
                                : { testPhoneNumber: '', dialCode: '' }),
                        },
                        ...temp,
                    }));
                    setValue('schedule', schedule);
                    dispatch(updateDirtyState(false));
                    location?.campaignType === 'M' &&
                        handleMDCQueryParamsUpdate(
                            {
                                ...mdcContentSetupDetails,
                                ...watch(),
                                ...data
                            },
                            location,
                        );
                } else {
                    setIsEditMessaging(true);
                    }
                } catch {
                    dispatch(updateSmsList({ data: {}, field: 'campaignDetails' }));
                    setIsEditMessaging(true);
                } finally {
                    finishEditSkeleton();
                }
            }
        }
        fetchEditFlow();
    }, [
        location,
        mdcChannelDetailId,
        type,
        // audienceList?.length,
        // mdcChannelDetailId,
        // smsSettings?.length,
        // senderName?.length,
        isAlreadyEditCallRef,
    ]);
    // console.log('Messaging ::::: ', watch());
    const resetState = (resetCampaign = false) => {
        resetAuthoringChannelEditSession(isAlreadyEditCallRef, resetEditLoading);
        let initialState = FORM_INITIAL_STATE.defaultValues;
        reset((formState) => ({
            ...formState,
            ...initialState,
            approvalList: {
                ...initialState?.approvalList,
                dialCode: formState?.approvalList?.dialCode,
                testPhoneNumber: formState?.approvalList?.testPhoneNumber,
            },
        }));
        setSplitTabs(SPLIT_TABS);
        setState(_cloneDeep(INITIAL_STATE));
        setSliderState({
            show: false,
            splittedCount: {},
        });
        if (resetCampaign) {
            dispatch(updateSmsList({ data: {}, field: 'campaignDetails' }));
        }
        setSplitTabConfig({
            currentTab: 0,
            splitTabs: ['splitA', 'splitB'],
        });
        setTemplateName(0);
        //dispatch(updateSmsList({ data: {}, field: 'campaignDetails' }));
        dispatch(updateAudience([]));
        dispatch(updateFilterAudience([]));
    };

    useEffect(() => {
        if (!isSplitABEnable && splitTest) refreshSplitABTab();
    }, [isSplitABEnable]);

    useEffect(() => {
        if (
            mCampType === 'M' &&
            (checkTrigger(location?.campaignType, location?.endDate) ||
                !statusIdCheck(getMessagingCampaignStatusId(campaignDetails), _get(location, 'campaignType', 'S'), campaignDetails))
        ) {
            setDisableNext(false);
        } else {
            setDisableNext(true);
        }
    }, [location?.campaignType, location?.endDate, campaignDetails?.content?.[0]?.statusId]);
    const updateCurrentTab = (tabList = []) => {
        const newSplitTabs = _map(tabList, 'id');
        setSplitTabs(tabList);
        setSplitTabConfig(() => ({
            currentTab: tabList?.length - 1,
            splitTabs: newSplitTabs,
        }));

        // Recalculate splittedCount when tabs change
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
        if (deleteTab?.id) {
            resetField(deleteTab.id);
        }
        const lastIndex = temp.length - 1;
        if (lastIndex >= 0 && temp[lastIndex]) {
            temp[lastIndex] = {
                ...temp[lastIndex],
                add: circle_plus_medium,
                ...(temp.length >= 3 && { remove: circle_minus_fill_medium }),
            };
        }
        updateCurrentTab(temp);
        setEmptySplitDate({
            text: '',
        });
    };

    const addSplitTabs = (index) => {
        const getSplitName = SPLIT_AB_NAME[index];
        if (!getSplitName) return;
        const temp = [...splitTabs];
        const lastTab = temp[temp.length - 1];
        if (lastTab) {
            delete lastTab.add;
            delete lastTab.remove;
        }
        temp.push({
            ...getSplitName,
            component: () => (
                <SplitAB fieldName={getSplitName.id} key={getSplitName.id} campaignType={campaign.campaignType} />
            ),
            remove: circle_minus_fill_medium,
            ...(temp.length < 3 && { add: circle_plus_medium }),
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
        if (isPopup) UpdateState(setState, 'issplitOffConfirmationModal', false);
    };

    function handleNavigation() {
       resetState(true);
        window.scrollTo(0, 0);
        const tabIndex = messagingTabState.currentIndex + 1;

        const handleVertcialNextTab = () => {
            const nextChannel = communicationChannels.find(
                (chan, index) => channelType !== chan && Object.hasOwn(activeTabs, chan) && index > currentTab,
            );
            if (!!nextChannel) {
                dispatch(
                    updateVerticalTab({
                        tabs: activeTabs?.[nextChannel] || {
                            type: 'notification',
                            currentTab: 2,
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
                }),
            );
        }
    }

    const handleMdcNavigation = ({ data }) => {
        resetState(true);
        const { SMSChannelDetailID } = data;
        const channelResponseDetailId = SMSChannelDetailID;
        // channelResponseDetailId &&
        //     navigate('/communication/mdc-workflow', {
        //         ...location,
        //         state: { ...location.state, channelResponseDetailId, mode: 'update' },
        //     });
        const mdcCanvasUrl = `/communication/mdc-workflow`;
        const state = { ...location, channelResponseDetailId, mode: `update` };
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
    const handleUpdateChannelDetailId = (data) => {
        const { SMSChannelDetailID } = data;
        const channelResponseDetailId = SMSChannelDetailID;
        setMdcChannelDetailId(channelResponseDetailId);
    };
    const handleError = (message) => {
        setState((prevState) => ({
            ...prevState,
            isWhatsAppError: {
                message,
                show: true,
            },
        }));
    };
    const formSubmitHandler = async (
        formState,
        formType = 'form',
        isScheduled,
        proceedWithoutSchedule = false,
        passportID = '',
    ) => {
        beginSubmit(getAuthoringSaveButtonType(formType));
        const shouldRefreshSmsAfterSave = ['test preview', 'live', 'request for approval'].includes(formType);
        if (shouldRefreshSmsAfterSave) {
            skipEditSmsFetchRef.current = true;
        }
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
                splitTabList: splitTabConfig?.splitTabs,
            })
        ) {
            return;
        }

        if (
            !checkTrigger(location?.campaignType, location?.endDate) &&
            statusIdCheck(getMessagingCampaignStatusId(campaignDetails), _get(location, 'campaignType', 'S'), campaignDetails) &&
            !checkRFAApproved(
                getMessagingCampaignStatusId(campaignDetails),
                campaignDetails?.requestForApproval?.approvarList,
            )
        ) {
            if (formType !== 'test preview') {
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
                let schedulerName = splitTest
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
                    dataSource: dataSource,
                    triggerPlayPauseStatus: campaignDetails?.triggerPlayPauseStatus
                });
                
                if (!isRFAValid) {
                    return;
                }
            }
            let statusId = getMessagingCampaignStatusId(campaignDetails);
            if (formState.splitTest) {
                let errorIndex;
                const tempSplitTabsList = [...ensureArray(splitTabConfig?.splitTabs)];
                let scheduleAll = [];
                let nullCount = 0;
                for (let i = 0; i < tempSplitTabsList?.length; i++) {
                    let currentTab = formState?.[tempSplitTabsList[i]];
                    if (!currentTab?.editorText || !currentTab?.templateId) {
                        errorIndex = i;
                        break;
                    }
                    if (!formState?.[tempSplitTabsList[i]]?.schedule) {
                        scheduleAll.push(null);
                        nullCount++;
                    } else {
                        scheduleAll.push(true);
                    }
                }
                if (
                    location?.campaignType !== 'T' &&
                    !proceedWithoutSchedule &&
                    (location?.campaignType === 'M' ? levelNumber < 2 : true)
                ) {
                    if (nullCount === tempSplitTabsList?.length) {
                        UpdateState(setState, 'showSchedulerModal', true);
                        formTypeRef.current = formType;
                        return;
                    } else {
                        for (var k = 0; k < scheduleAll?.length; k++) {
                            // If any one SplitAB schedule exists, SplitAB is mandatory.
                            let checkAllSplitNoSchedule = Object.values(scheduleAll)?.every((schedule) => !schedule);
                            if (scheduleAll[k] === null && !checkAllSplitNoSchedule) {
                                setValue('currentSplitTab', k);
                                setSplitTabConfig((prev) => ({
                                    ...prev,
                                    currentTab: k,
                                }));
                                setError(`${tempSplitTabsList[k]}.schedule`, {
                                    type: 'custom',
                                    message: SELECT_SCHEDULE_TIME,
                                });
                                return;
                            } else if (scheduleAll[k]) {
                                if (k > 0) {
                                    if (
                                        diff_minutes(
                                            formState[tempSplitTabsList[k]]?.schedule,
                                            formState[tempSplitTabsList[k - 1]]?.schedule,
                                        ) < 5
                                    ) {
                                        setValue('currentSplitTab', k);
                                        setSplitTabConfig((prev) => ({
                                            ...prev,
                                            currentTab: k,
                                        }));
                                        setError(`${tempSplitTabsList[k]}.schedule`, {
                                            type: 'required',
                                            message: MINIMUM_DIFFERENCE_SPLITS,
                                        });

                                        return;
                                    } else {
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
                                            setError(`${tempSplitTabsList[k]}.schedule`, {
                                                type: 'custom',
                                                // message: 'Select a date and time later than ' + scheduleError + '.',
                                                message: CHECK_START_DATE_AND_END_DATE,
                                            });
                                            return;
                                        }

                                        // if (scheduleError !== undefined) {
                                        if (!scheduleError) {
                                            const cityTime = convertUserTimezoneToTarget(
                                                currentUtcTimeData?.utcTime
                                                    ? new Date(currentUtcTimeData.utcTime.replace('Z', ''))
                                                    : new Date(),
                                                '(GMT+00:00) ',
                                                formState[tempSplitTabsList[k]]?.timezone?.gmtOffset,
                                            );
                                            // Add 15 minutes to cityTime
                                            const cityTimeWithBuffer = new Date(cityTime);
                                            cityTimeWithBuffer.setMinutes(cityTimeWithBuffer.getMinutes() + 15);
                                            const formattedCityTime = cityTimeWithBuffer.toLocaleString();
                                            setError(`${tempSplitTabsList[k]}.schedule`, {
                                                type: 'required',
                                                message: `Select a date & time later than ${formattedCityTime}`,
                                                // message: 'Select a date and time later than ' + scheduleError + '.',
                                            });

                                            setSplitTabConfig((prev) => ({
                                                ...prev,
                                                currentTab: k,
                                            }));

                                            return;
                                        }
                                    }
                                } else {
                                    let scheduleError = campaignSchedule(
                                        formState[tempSplitTabsList[k]]?.schedule,
                                        formState[tempSplitTabsList[k]]?.timezone?.gmtOffset,
                                        statusId,
                                        currentUtcTimeData?.utcTime,
                                    );
                                    // if (scheduleError !== undefined) {
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
                                        setError(`${tempSplitTabsList[k]}.schedule`, {
                                            type: 'custom',
                                            // message: 'Select a date and time later than ' + scheduleError + '.',
                                            message: CHECK_START_DATE_AND_END_DATE,
                                        });
                                        return;
                                    }

                                    if (!scheduleError) {
                                        const cityTime = convertUserTimezoneToTarget(
                                            currentUtcTimeData?.utcTime
                                                ? new Date(currentUtcTimeData.utcTime.replace('Z', ''))
                                                : new Date(),
                                            '(GMT+00:00) ',
                                            formState[tempSplitTabsList[k]]?.timezone?.gmtOffset,
                                        );
                                        // Add 15 minutes to cityTime
                                        const cityTimeWithBuffer = new Date(cityTime);
                                        cityTimeWithBuffer.setMinutes(cityTimeWithBuffer.getMinutes() + 15);
                                        const formattedCityTime = cityTimeWithBuffer.toLocaleString();
                                        setError(`${tempSplitTabsList[k]}.schedule`, {
                                            type: 'required',
                                            message: `Select a date & time later than ${formattedCityTime}`,
                                            // message: 'Select a date and time later than ' + scheduleError + '.',
                                        });
                                        setSplitTabConfig((prev) => ({
                                            ...prev,
                                            currentTab: k,
                                        }));
                                        return;
                                    }
                                }
                            }
                        }
                    }
                }
                if (errorIndex !== undefined) {
                    setSplitTabConfig((prev) => ({
                        ...prev,
                        currentTab: errorIndex,
                    }));
                    setTimeout(() => trigger(`${tempSplitTabsList[errorIndex]}`), 100);
                    return;
                }
            } else {
                if (
                    (location?.campaignType === 'S' && formType !== 'test preview') ||
                    (location?.campaignType === 'M' && dataSource === 'TL' && getTestType() !== 2)
                ) {
                    if (!formState.schedule && !state.isScheduled && levelNumber < 2 && isScheduled) {
                        UpdateState(setState, 'showSchedulerModal', true);
                        formTypeRef.current = formType;
                        return;
                    } else {
                        if (!formState.splitTest && isScheduled && (!levelNumber || levelNumber < 2)) {
                            let scheduleError = campaignSchedule(
                                formState?.schedule,
                                formState?.timezone?.gmtOffset,
                                statusId,
                                currentUtcTimeData?.utcTime,
                            );
                            const { adjustedStartDate, adjustedEndDate } = getTimezoneAdjustedDateRange(
                                null,
                                formState?.timezone,
                            );
                            const ScheduleStatus = checkScheduleDate(
                                formState?.schedule,
                                adjustedStartDate,
                                adjustedEndDate,
                            );
                            if (ScheduleStatus) {
                                setError(`schedule`, {
                                    type: 'custom',
                                    // message: 'Select a date and time later than ' + scheduleError + '.',
                                    message: CHECK_START_DATE_AND_END_DATE,
                                });
                                return;
                            }
                            if (!scheduleError && levelNumber < 2) {
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
                    }
                }
            }
            dispatch(
                updateMessaging({
                    field: type,
                    data: { ...formState, sliderData: sliderState.splittedCount, splitTabConfig },
                }),
            );

            function getTestType() {
                if (formType === 'form' && formState?.approvalList?.requestApproval) return 1;
                if (formType === 'form' || formType === 'save') return 0;
                if (formType === 'request for approval') return 1;
                if (formType === 'test preview') return 2;
                if (formType === 'live') return 4;
                return 0;
            }
            const userKeyPersonInfo = ensureArray(userKeyInfo).filter((e) => e?.userId === userId);
            formState = {
                ...campaignDetails,
                ...formState,
                ...campaign,
                splitTabs: ensureArray(splitTabConfig?.splitTabs),
                splitABCount: sliderState.splittedCount,
                isSendTestSMS: getTestType(),
                clientId,
                departmentId,
                userId,
                userKeyPersonInfo,
                passportID,
                dynamiclistId: campaign['campaignType'] === 'T' ? _get(location, 'dynamicListId', 0) : 0,
                dataSource: campaign['campaignType'] === 'T' ? 'DL' : 'TL',
                ...(campaign['campaignType'] === 'M' && mdcContentSetupDetails),
                audience: ensureArray(formState?.audience?.length ? formState?.audience : location?.audience),
            };
            // if (
            //     formState?.schedule !== '' &&
            //     formState?.schedule !== null &&
            //     location?.campaignType !== 'T' &&
            //     dataSource === 'TL'
            // ) {
            //     let scheduleError = campaignSchedule(formState?.schedule, formState?.timezone?.gmtOffset, statusId);
            //     const ScheduleStatus = checkScheduleDate(formState?.schedule, location?.startDate, location?.endDate);
            //     if (ScheduleStatus) {
            //         setError(`schedule`, {
            //             type: 'custom',
            //             // message: 'Select a date and time later than ' + scheduleError + '.',
            //             message: CHECK_START_DATE_AND_END_DATE,
            //         });
            //         return;
            //     }
            //     if (!scheduleError) {
            //         const cityTime = getCityTime(formState?.timezone?.gmtOffset);
            //         setError(`schedule`, {
            //             type: 'custom',
            //             // message: 'Select a date and time later than ' + scheduleError + '.',
            //             message: `Select a date & time later than ${cityTime}`,
            //         });
            //         return;
            //     }
            // }
            let payload;
            try {
                payload = buildPayload(formState, type, location);
            } catch {
                UpdateState(setState, ['sentCommunicationModal'], [true]);
                UpdateState(setState, ['requestFalse'], [EXCEPTION_OCCURRED]);
                return;
            }
            const {
                status,
                data,
                message = EXCEPTION_OCCURRED,
            } = await runSave(getAuthoringSaveButtonType(formType), () =>
                dispatch(saveMessagingCampaign({ payload, type, savedChannelsId, channelId, loading: false })),
            );
            setSaveCampaigData(data)
            if (status) {
                dispatch(updateMDCEditMode('edit'));
                const selectedAudience = formState?.audience ?? [];
                dispatch(updateChannelAudiences(mergeChannelAudiences('SMS', selectedAudience, channelAudiences)));
            }
            if (status && getTestType() > 1) {
                setValue('savedChannelResponseDetailId', {
                    smsChannelDetailId: data?.SMSChannelDetailID ?? 0,
                    waChannelDetailId: data?.waChannelDetailId ?? 0,
                });
                // setValue('schedule', '');
                const channelDetailIdObj = { smsChannelDetailId: data?.SMSChannelDetailID };
                await dispatch(
                    getMessagingCampaignById({
                        payload: {
                            clientId,
                            userId,
                            departmentId,
                            levelNumber,
                            actionId,
                            campaignId: location?.campaignId,
                            // smsChannelDetailId: 0,
                            ...channelDetailIdObj,
                        },
                        type,
                        campaignType: _get(location, 'campaignType', 'S'),
                    }),
                );
                formTypeRef.current = null;
            } else if (!status && message?.includes('exceeds')) {
                setError(`schedule`, {
                    type: 'custom',
                    message: 'Given date is exceeds the actual communication end date',
                });
            } else if (!status) {
                UpdateState(setState, ['sentCommunicationModal'], [true]);
                UpdateState(setState, ['requestFalse'], [message]);
                return;
            }
            if (formType === 'form') {
                if (status) {
                    if (formState?.approvalList?.requestApproval) {
                        UpdateState(setState, ['rfaMsg', 'sentCommunicationModal'], [true, true]);
                        if (rfaAutoNavTimeoutRef.current) clearTimeout(rfaAutoNavTimeoutRef.current);
                        rfaManuallyClosedRef.current = false;
                        rfaAutoNavTimeoutRef.current = setTimeout(() => {
                            if (rfaManuallyClosedRef.current) return;
                            UpdateState(setState, ['rfaMsg', 'sentCommunicationModal'], [false, false]);
                            campaign.campaignType === 'M' ? handleMdcNavigation({ data }) : handleNavigation();
                        }, 5000);
                    } else {
                        if (campaign.campaignType === 'M') {
                            handleMdcNavigation({ data });
                        } else {
                            handleNavigation();
                        }
                    }
                    //campaign.campaignType === 'M' ? handleMdcNavigation({ data }) : handleNavigation();
                }
            } else if (formType === 'request for approval') {
                if (status) {
                    // Clear dirty state after successful save while keeping form values
                    reset(getValues(), { keepValues: true });
                    dispatch(updateDirtyState(false));

                    UpdateState(setState, ['rfaMsg', 'sentCommunicationModal'], [true, true]);
                    if (rfaAutoNavTimeoutRef.current) clearTimeout(rfaAutoNavTimeoutRef.current);
                    rfaManuallyClosedRef.current = false;
                    rfaAutoNavTimeoutRef.current = setTimeout(() => {
                        if (rfaManuallyClosedRef.current) return;
                        UpdateState(setState, ['rfaMsg', 'sentCommunicationModal'], [false, false]);
                        campaign.campaignType === 'M' ? handleMdcNavigation({ data }) : handleNavigation();
                    }, 5000);
                    return;
                }
            } else if (formType === 'save') {
                if (status) {
                    if (formState?.approvalList?.requestApproval) {
                        UpdateState(setState, ['rfaMsg', 'sentCommunicationModal'], [true, true]);
                        if (rfaAutoNavTimeoutRef.current) clearTimeout(rfaAutoNavTimeoutRef.current);
                        rfaManuallyClosedRef.current = false;
                        rfaAutoNavTimeoutRef.current = setTimeout(() => {
                            if (rfaManuallyClosedRef.current) return;
                            UpdateState(setState, ['rfaMsg', 'sentCommunicationModal'], [false, false]);
                            if (campaign.campaignType === 'M') {
                                handleMdcNavigation({ data });
                            } else {
                                navigate('/communication', {
                                    index: 0,
                                });
                            }
                        }, 5000);
                    } else {
                        if (campaign.campaignType === 'M') {
                            handleMdcNavigation({ data });
                        } else {
                            navigate('/communication', {
                                index: 0,
                            });
                        }
                    }
                    dispatch(resetCreateCommunication());
                } else {
                    setError(`schedule`, {
                        type: 'custom',
                        message,
                    });
                    return;
                }
            } else {
                if (status && campaign.campaignType === 'M') {
                    handleUpdateChannelDetailId(data);
                }
                formTypeRef.current = getTestType();
                if (status) {
                    // Clear dirty state after successful test preview save while keeping form values
                    reset(getValues(), { keepValues: true });
                    dispatch(updateDirtyState(false));

                    UpdateState(
                        setState,
                        ['isScheduled', 'sentCommunicationModal', 'testSentCommunicationModal'],
                        [false, true, ''],
                    );
                } else {
                    UpdateState(
                        setState,
                        ['isScheduled', 'sentCommunicationModal', 'testSentCommunicationModal'],
                        [false, true, message],
                    );
                }
                setTimeout(() => {
                    UpdateState(setState, ['testSentCommunicationModal', 'sentCommunicationModal'], [false, false]);
                    UpdateState(setState, ['testSentCommunicationModal', 'sentCommunicationModal'], [false, false]);
                    setSmsPreview(false);
                }, 5000);
                return;
            }

            formTypeRef.current = null;
            //if ((!formState.splitTest || type !== 'sms') && !formState.schedule && !state.isScheduled && levelNumber < 2) {
        } else {
            if (campaign.campaignType === 'M') {
                handleMdcNavigation({ data });
            } else if (formType === 'save') {
                navigate('/communication', {
                    index: 0,
                });
            } else {
                handleNavigation();
            }
        }
        } finally {
            skipEditSmsFetchRef.current = false;
            endSubmit();
        }
    };

    const fetchSMSTemplateLanguge = async () => {
        const payload = {
            departmentId,
            clientId,
            userId,
        };
        const response = await dispatch(
            getSMSTemplateLanguage({
                payload,
            }),
        );
        return response;
    };

    const resetTemplateOnSenderChange = () => {
        const clearTemplateFields = (prefix = '') => {
            const field = (key) => (prefix ? `${prefix}.${key}` : key);
            setValue(field('templateId'), '');
            setValue(field('editorText'), '');
            setValue(field('isCustomTemplateId'), false);
            clearErrors(field('templateId'));
            clearErrors(field('editorText'));
        };

        clearTemplateFields();

        if (splitTest) {
            ensureArray(splitTabConfig?.splitTabs).forEach((tab) => clearTemplateFields(tab));
        }
    };

    const fetchSMSTemplateList = async (senderId) => {
        try {
            const id = typeof senderId === 'string' ? senderId.split('(')[0] : senderId;
            const payload = {
                departmentId,
                clientId,
                userId,
                senderId: id,
            };
            const response = await templateListLoader.refetch({
                fetcher: ({ payload: templatePayload } = {}) => dispatch(getSmsTemplateList(templatePayload, false)),
                mode: savedChannel ? 'edit' : 'create',
                loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
                params: { payload },
            });
            let finalResponse;
            if (response?.status) {
                const templateIdName = 'templateId';
                unregister(templateIdName);
                finalResponse = ensureArray(response?.data).map((data) => ({ ...data, subLabel: data?.dltTemplateID }));
                setSmsTemplateList(finalResponse || []);
            } else {
                setSmsTemplateList([]);
            }
            return response?.status ? finalResponse : [];
        } catch {
            setSmsTemplateList([]);
            return [];
        }
    };

    const handlePhoneInput = ({ phone, value, formattedValue }) => {
        const { dialCode, countryCode, format } = value;
        const phoneUtil = PhoneNumberUtil.getInstance();

        // console.log(phone);
        // console.log(value);
        // console.log(formattedValue);
        setValue('dialCode', `+${dialCode}`);
        setValue('mobile', formattedValue);
        setValue('maskDetail', format);
        if (format) {
            let str = format;
            let formatStr = str.substring(str.indexOf(' ') + 1);
            let maskAry = formatStr.match(/\./g);
            let maskString = maskAry.join('');
            let len = parseInt(maskString?.length, 10) + parseInt(dialCode?.length, 10);
            setLongNumber(len);
        }
        let validationDialCode = `+${dialCode}`;
        let phNo = formattedValue.slice(validationDialCode?.length + 1);
        let phAry = phNo?.length ? phNo.split(',') : [];
        let result = new Set(phAry.filter((v, i, a) => a.indexOf(v) !== i));
        result = Array.from(result);

        if (result?.length) {
            return setError('phoneNumber', { type: 'custom', message: 'Duplicate number' });
        } else if (!phAry?.length) {
            return setError('phoneNumber', { type: 'custom', message: 'Invalid number' });
        } else if (phAry?.length) {
            let maskWithOutCountryCode = format?.slice(validationDialCode?.length + 1);
            let countryPhoneLength = maskWithOutCountryCode?.split(',')[0]?.length;
            let valid = true;
            phAry.forEach((item) => {
                if (item?.length === countryPhoneLength) {
                    const number = phoneUtil.parseAndKeepRawInput(`${item}`, `${countryCode}`);
                    const isValidNumber = phoneUtil.isValidNumberForRegion(number, `${countryCode}`);
                    if (!isValidNumber) {
                        valid = isValidNumber;
                    }
                } else {
                    valid = false;
                }
            });
            if (!valid) {
                return setError('phoneNumber', { type: 'custom', message: 'Enter valid mobile number' });
            } else {
                return clearErrors('phoneNumber');
            }
        }
    };
    const handleChangePhone = (phone, value, formattedvalue) => {
        let totalCount = Array.from(value?.format).filter((e) => e === '.')?.length - phone?.length;
        setValue('getCountryVal', {
            code: phone,
            value: value,
            formattedvalue: formattedvalue,
            formatCode: value.format.slice(formattedvalue?.length + 1 - value.format?.length),
            totalCount,
        });

        setTemplatePhone({
            code: phone,
            value: value,
            formattedvalue: formattedvalue,
            formatCode: value.format.slice(formattedvalue?.length + 1 - value.format?.length),
            totalCount,
        });
        setValue('mobile', formattedvalue);
        dialCode.current = phone;
    };
    //  console.log('mobile: ', mobile);

    function getformat(number) {
        let { totalCount, formatCode } = getCountryVal;
        let tempValue = templatePhone;
        let temptotalCount = getCountryVal.totalCount?.length > 0 ? totalCount : tempValue.totalCount;
        let tempformatCode = getCountryVal.formatCode?.length > 0 ? formatCode : tempValue.formatCode;
        if (number?.length > 0) {
            if (!(number?.length <= temptotalCount)) {
                setValue('err', 'Invalid mobile number');
            } else if (number?.length !== temptotalCount) {
                setValue('err', 'Invalid mobile number');
            } else if (number?.length === temptotalCount) {
                setValue('err', '');
            } else {
                setValue('err', '');
            }
        } else {
            setValue('err', '');
        }
        let val = '';
        for (let i = 0; i < temptotalCount; i++) {
            if (number[i] === undefined) break;
            if (tempformatCode[i] === '.') {
                val = val + number[i];
            } else {
                val = val + '' + number[i];
            }
        }
        return number;
    }

    const validateChannel = () => {
        if (campaignDetails?.channelId) {
            let curChannel = campaignDetails?.channelId.split('ch00')[1];
            let channelName = CHANNELS_LIST.filter((item) => parseInt(item.id, 10) == parseInt(curChannel, 10));
            return channelName?.[0]?.lable?.toLowerCase() === type.toLowerCase() ? true : false;
        }
    };

    // useEffect(() => {
    //     !splitTest &&
    //         setEmptySplitDate({
    //             text: '',
    //         });
    //     const splitTabs = _cloneDeep(SPLIT_TABS);
    //     const modifiedTabs = splitTabs?.map((tab, index) => {
    //         if (splitTabs?.length - 1 === index) {
    //             return {
    //                 ...tab,
    //                 add: circle_plus_edge_medium,
    //             };
    //         } else {
    //             return {
    //                 ...tab,
    //             };
    //         }
    //     });
    //     setSplitTabs(modifiedTabs);
    // }, [splitTest]);

    const handleAutoScheduleModal = (error) => {
        if (Object.values(error)?.every((item) => item === false)) {
            UpdateState(setState, 'isShowScheduleModal', true);
            setEmptySplitDate({
                text: '',
            });
        }
    };

    useEffect(() => {
        !splitTest &&
            setEmptySplitDate({
                text: '',
            });
    }, [splitTest]);
    const handleErrClose = () => {
        if (isEditMessagingFail) {
            if (campaign.campaignType === 'M') {
                const mdcCanvasUrl = `/communication/mdc-workflow`;
                const state = { ...location };
                delete state.mdcContentSetupDetails;
                const encryptState = encodeUrl(state);
                navigate(`${mdcCanvasUrl}?q=${encryptState}`, {
                    state,
                });
            } else {
                navigate('/communication', {
                    index: 0,
                });
            }
        }
    };

    const handleAudienceInEdit = async (segmentationList) => {
        if (!editCallAuidenceRef.current) {
            editCallAuidenceRef.current = true;
            await audienceLoader.refetch({
                fetcher: ({ payload: audPayload, isFilter = false } = {}) =>
                    dispatch(getAudienceList({ payload: audPayload, isFilter, loading: false })),
                mode: 'edit',
                loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
                params: {
                    payload: {
                        userId,
                        clientId,
                        campaignId: campaign.campaignId,
                        departmentId,
                        searchText: '',
                        segmentIds: segmentationList,
                        channelType: 'S',
                    },
                    isFilter: true,
                },
            });
        }
    };

    const fetchAudience = async () => {
        const { segmentationListId } = ensureObject(campaignDetails);
        await handleAudienceInEdit(ensureSegmentationListIds(segmentationListId));
        if (filterAudienceList?.length) {
            reset((formState) => ({
                ...formState,
                audience: ensureArray(filterAudienceList),
            }));
        }
    };

    useEffect(() => {
        if (hasMessagingCampaignDetails(campaignDetails) && type && savedChannel && location?.campaignType === 'S') {
            // fetchAudience();
        }
    }, [campaignDetails, editBindAuidenceRef, filterAudienceList, type]);

    useEffect(() => {
        if (
            checkTrigger(location?.campaignType, location?.endDate) ||
            !statusIdCheck(
                hasMessagingCampaignDetails(campaignDetails) && validateChannel() && campaignDetails?.content?.length
                    ? getMessagingCampaignStatusId(campaignDetails)
                    : null,
                _get(location, 'campaignType', 'S'),
                campaignDetails,
            ) ||
            checkRFAApproved(
                getMessagingCampaignStatusId(campaignDetails),
                campaignDetails?.requestForApproval?.approvarList,
            )
        ) {
            setIsClickOff(true);
        } else {
            setIsClickOff(false);
        }
    }, [location?.campaignType, location?.endDate, campaignDetails?.content?.[0]?.statusId]);

    const shouldDisableAutoRefresh = handleAutoRefreshClickOff(audience);
    useEffect(() => {
        if (shouldDisableAutoRefresh) {
            setValue('isAutoRefereshenabled', false);
        }
    }, [audience]);

    const confiramationModalConfig = [
        {
            key: 'issplitOffConfirmationModal',
            show: state.issplitOffConfirmationModal,
            text: SPLIT_AB_TURNOFF,
            primaryButtonText: OK,
            handleClose: () => UpdateState(setState, 'issplitOffConfirmationModal', false),
            handleConfirm: () => refreshSplitABTab(true),
            primaryButton: true,
            secondaryButton: true,
        },
        {
            key: 'isNavigationConfirmation',
            show: state.isNavigationConfirmation,
            text: IGNORE_CHANNEL,
            primaryButtonText: OK,
            handleClose: () => UpdateState(setState, 'isNavigationConfirmation', false),
            handleConfirm: () => {
                UpdateState(setState, 'isNavigationConfirmation', false);
                handleNavigation();
            },
            primaryButton: true,
            secondaryButton: true,
        },
        {
            key: 'showSchedulerModal',
            show: state.showSchedulerModal,
            text: COMMUNICATION_SCHEDULED,
            primaryButtonText: SAVE,
            handleClose: () => UpdateState(setState, ['showSchedulerModal', 'isScheduled'], [false, false]),
            handleConfirm: () => {
                UpdateState(setState, ['showSchedulerModal', 'isScheduled'], [false, false]);
                handleSubmit((data) => formSubmitHandler(data, formTypeRef.current, false, true))();
            },
            primaryButton: true,
            secondaryButton: true,
        },
        {
            key: 'isRefresh',
            show: state.isRefresh,
            text: ARE_YOU_SURE_WANT_TO_RESET,
            handleClose: () => UpdateState(setState, 'isRefresh', false),
            handleConfirm: () => {
                clearErrors();
                resetState(false);
                UpdateState(setState, 'isRefresh', false);
            },
            primaryButton: true,
            secondaryButton: true,
        },
        {
            key: 'isWhatsAppError',
            show: state.isWhatsAppError?.show,
            text: state.isWhatsAppError.message,
            handleClose: () => UpdateState(setState, 'isWhatsAppError', { message: '', show: false }),
            handleConfirm: () => UpdateState(setState, 'isWhatsAppError', { message: '', show: false }),
            primaryButton: true,
            secondaryButton: false,
        },
    ];
    const memoizedContextValue = useMemo(
        () => ({
            formSubmitHandler,
            type,
            smsPreview,
            setSmsPreview,
            smsTemplateList,
            isSmsTemplateListLoading: templateListLoader.isLoading,
        }),
        [formSubmitHandler, type, smsPreview, setSmsPreview, smsTemplateList, templateListLoader.isLoading]
    );

    return (
        <MessagingContext.Provider
            value={memoizedContextValue}
        >
            <AuthoringChannelEditSkeletonGate
                channelId={channelId}
                showEditSkeleton={showEditSkeleton}
                isSavedChannel={isSavedChannel}
            >
            <FormProvider {...methods}>
                <form
                    className="rsv-tabs-content position-relative allow-copy"
                    onSubmit={handleSubmit((data) => formSubmitHandler(data))}
                >
                    <div className={`box-design bd-top-border ${isClickOff ? 'pe-none click-off' : ''}`}>
                        {/* {!smartLink1 && !tabSmartLink_Flag && state?.isSmartLink && ( */}
                        {!tabSmartLink_Flag && tabSmartLink_Flag !== null && !isClickOff && levelNumber < 2 && (
                            <SmartLinkEnable
                                onSave={() => UpdateState(setState, 'isSmartLink', false)}
                                onReject={() => {
                                    dispatch(showTabsSmartlink(true));
                                    UpdateState(setState, 'isSmartLink', false);
                                }}
                            />
                        )}
                        <div className="form-group mt20">
                                <Row>
                                    <Col sm={{ offset: 1, span: 2 }}>
                                        <label className="control-label-left">
                                            {SENDER} ID
                                        </label>
                                    </Col>
                                    <Col sm={6} id="rs_Messaging_SenderId">
                                        <div>
                                            <RSKendoDropDownList
                                                control={control}
                                                name="senderId"
                                                data={ensureArray(smsSettings)}
                                                dataItemKey="clientSmsSettingId"
                                                textField="senderId"
                                                label={SENDER_ID}
                                                isLoading={senderIdLoader.isLoading}
                                                rules={{
                                                    required: SELECT_SENDER_ID,
                                                }}
                                                handleChange={({ value }) => {
                                                    const selectedSenderId = _get(value, 'senderId', '');
                                                    resetTemplateOnSenderChange();
                                                    fetchSMSTemplateList(selectedSenderId);
                                                }}
                                                required
                                                disabled={!!senderName}
                                                footer={
                                                    <RSDropdownFooterBtn
                                                        title={ADD_SENDER_ID}
                                                        handleClick={() => {
                                                            let navState = createCommunicationSettingsNavState('messaging', {
                                                                    mode: 'add',
                                                                    subfrom: 'MP',
                                                                    messagingTabId: MESSAGING_TAB_ID.SMS,
                                                                    backAction: window.location.search,
                                                                    tabValueName: 'messaging',
                                                                    tabValue: 'sms',
                                                                    addType: 'addSenderId'
                                                                }, location, getValues)
                                                              const encryptState = encodeUrl(navState); 
                                                                navigate(`/preferences/communication-settings?q=${encryptState}`, {
                                                                    state: {},
                                                                });
                                                        }
                                                            
                                                        }
                                                    />
                                                }
                                            />
                                        </div>
                                    </Col>
                                </Row>
                                <Row>
                                     <Col sm={{ offset: 3, span: 6 }}>
                                       <RSCheckbox
                                                control={control}
                                                name={'flashMessage'}
                                                labelName={'Flash message'}
                                            />
                                     </Col>
                                </Row>
                            </div>
                        {campaign.campaignType === 'S' && (
                            <div className="form-group">
                                <AudienceFieldRenderComponent
                                    type={type}
                                    audienceList={audienceList}
                                    methods={methods}
                                    userDetails={{ departmentId, userId, clientId }}
                                    campaignId={campaign.campaignId}
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
                                            <small> {AUDIENCE}:  {handleTotalAudienceCount(campaignDetails,watchtotalAudience,calucateAudienceCount)}</small>
                                        </div>
                                    }
                                    audienceTextField="audienceMobile"
                                    handleAudienceFieldOnChange={() => {
                                        setTimeout(() => {
                                            if (
                                                splitTest &&
                                                splitTabConfig?.splitTabs?.length >= 2 &&
                                                calucateAudienceCount > 0
                                            ) {
                                                const defaultSplittedCount = calculateDefaultSplittedCount(
                                                    splitTabConfig?.splitTabs?.length,
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
                        {/* {(type === 'sms' || type === 'line') && (
                            <div className="form-group">
                                <Row>
                                    <Col sm={{ offset: 1, span: 2 }}>
                                        <label className="control-label-left">{LANGUAGE}</label>
                                    </Col>
                                    <Col sm={6} id="rs_Messaging_language">
                                        <RSKendoDropDownList
                                            control={control}
                                            name={'language'}
                                            data={languageMasterList}
                                            dataItemKey={'languageID'}
                                            textField={'languageName'}
                                            data={templateSMSLanguageList}
                                            dataItemKey={'languageCode'}
                                            textField={'language'}
                                            label={LANGUAGE}
                                            required
                                            rules={{
                                                required: ENTER_LANGUAGE,
                                            }}
                                        />
                                        <div className="fg-icons float-end top5">
                                            <RSPPophover
                                                text={MESSAGING_LANGUAGE}
                                            >
                                                <i
                                                    className={`${circle_question_mark_mini} color-primary-blue icon-xs`}
                                                    id="circle_question_mark"
                                                />
                                            </RSPPophover>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        )} */}
                        {(campaign.campaignType === 'S' ||
                            (campaign.campaignType === 'M' && dataSource === 'TL' && levelNumber === 1)) && (
                            <div className="form-group">
                                <Row>
                                    <Col sm={{ offset: 1, span: 2 }}>
                                        <label className="control-label-left">{LABLE_SPLIT_AB}</label>
                                    </Col>
                                    <Col sm={1} className={`${!isSplitABEnable ? 'pe-none click-off' : 'cp'}`}>
                                        <div
                                            onClick={() => {
                                                if (splitTest)
                                                    UpdateState(setState, 'issplitOffConfirmationModal', true);
                                                else {
                                                    const {
                                                        approvalList: { testPhoneNumber, dialCode },
                                                    } = getValues();
                                                    const { approvalList, ...restRefreshFields } =
                                                        refreshFields;
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
                                                    setValue('type', type);
                                                    // setValue('approvalList.testPhoneNumber', testPhoneNumber);
                                                    // setValue('approvalList.dialCode', dialCode);
                                                    setEmptySplitDate({
                                                        text: '',
                                                    });
                                                    const splitTabs = _cloneDeep(SPLIT_TABS);
                                                    const modifiedTabs = splitTabs?.map((tab, index) => {
                                                        if (splitTabs?.length - 1 === index) {
                                                            return {
                                                                ...tab,
                                                                add: circle_plus_medium,
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
                                            }}
                                        >
                                            {splitTest && emptySplitdate?.text && (
                                                <small className="alert alert-danger d-block color-primary-red position-absolute px7 top-35 splitab-error-text">
                                                    {AUTO_SCHEDULE_SPLITS}
                                                </small>
                                            )}
                                            <RSSwitch control={control} name={'splitTest'} preventChange />
                                        </div>
                                    </Col>
                                    <Col sm={8} className="pl0 d-flex">
                                        <div className="pl0 d-flex align-items-center">
                                            {splitTest && (
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
                                                    <RSTooltip text={SCHEDULE} className="lh0 mr15">
                                                        <i
                                                            className={`${timer_medium} icon-md  color-primary-blue `}
                                                            onClick={() => {
                                                                let emptySplit = '';
                                                                let isError = {};
                                                                let tabs = splitTabConfig?.splitTabs;
                                                                const formState = getValues();
                                                                _forEach(tabs, (tab) => {
                                                                    const date = formState[tab]?.['schedule'] || null;
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
                                                {!splitTest ? (
                                                    <i
                                                        className={`${circle_question_mark_mini} icon-xs color-primary-blue position-relative`}
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
                        {splitTest && (
                            <div className="no-scroll-rs-content-tabs">
                                <RSTabbar
                                    dynamicTab={`res-content-tabs-split`}
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
                                        setValue('channelType', type);
                                    }}
                                    onAddMenu={(index) => addSplitTabs(index)}
                                    onRemoveMenu={removeSplitTabs}
                                    onRefresh={refreshSplitABTab}
                                    componentClassName ={'w-100'}
                                />
                            </div>
                        )}
                        {!splitTest && (
                            <SplitAB
                                isSplitTabs={false}
                                levelNumber={levelNumber}
                                channelTabName={type}
                                campaignType={campaign.campaignType}
                                templateType={0}
                                waSelectedTemplate={templateName}
                                // smsPreview={smsPreview}
                                // setSmsPreview={setSmsPreview}
                            />
                        )}
                        {/* levelNumber added for MDC --- if levelNumber gerater than 1 disable schedule  */}

                        {/* <div className={`form-group ${!isWhatsapp ? 'mb0' : ''}`}>
                            <Row>
                                <Col sm={{ offset: 1, span: 2 }}>
                                    <label className="control-label-left">Test message</label>
                                </Col>
                                <Col sm={6}>
                                    <RSReactPhoneInput
                                        control={control}
                                        name={'phoneNumber'}
                                         inputStyle={{ display: 'none' }}
                                        onMount={(value, data, formattedValue) => {
                                            setCountry(formattedValue);
                                        }}
                                        handleOnchange={(phone, value, e, formattedValue) => {
                                            handlePhoneInput({ phone, value, formattedValue });
                                        }}
                                        value={phoneNumber ? phoneNumber : ''}
                                        countryCodeEditable={true}
                                        enableLongNumbers={longNumber}
                                        placeholder={''}
                                        onClick={(event, data) => {
                                        }}
                                        country={country}
                                        masks={{ ...mask }}
                                        setError={setError}
                                        clearErrors={clearErrors}
                                    />
                                    <div className="rs-phone-input-wrapper-2">
                                        <span className="rsp-error">{err}</span>
                                        <RSPhoneInput
                                            control={control}
                                            name={'phoneNumber'}
                                            inputStyle={{ display: 'none' }}
                                            onMount={(phone, value, formattedvalue) => {
                                                handleChangePhone(phone, value, formattedvalue);
                                            }}
                                            handleOnchange={(phone, value, e, formattedvalue) => {
                                                handleChangePhone(phone, value, formattedvalue);
                                            }}
                                        />
                                        <RSInput
                                            control={control}
                                            name={'mobile'}
                                            placeholder={'Mobile number'}
                                            handleOnBlur={(e) => {
                                                //  handleOnchange={(e) => {
                                                e.preventDefault();
                                                let {
                                                    target: { value },
                                                } = e;
                                                let templatePhoneValue = templatePhone;
                                                // let temptotalCount = getCountryVal.totalCount?.length > 0 ? totalCount : templatePhoneValue.totalCount;
                                                // let tempformatCode = getCountryVal.formatCode?.length > 0 ? formatCode : templatePhoneValue.formatCode;

                                                let { formattedvalue } = getCountryVal;
                                                let tempValue =
                                                    getCountryVal.formattedvalue?.length > 0
                                                        ? formattedvalue
                                                        : templatePhoneValue.formattedvalue;
                                                let fullnumber = value.slice(tempValue?.length).split(' ').join('');
                                                let currNum = fullnumber.split(',');

                                                let arr = currNum.map((e) => getformat(e));
                                                if (arr?.length < 6) {
                                                    setTimeout(() => {
                                                        setValue('mobile', tempValue + ' ' + arr.join(','));
                                                    }, 0);
                                                } else {
                                                    setValue('err', 'Minimum 5 numbers only');
                                                }
                                            }}
                                        />
                                    </div>
                                </Col>
                                <Col sm={6}>
                                    <div>
                                        <RSPhoneInput
                                            control={control}
                                            name={'phoneNumber'}
                                            setError={setError}
                                            label={MOBILE_NUMBER}
                                            setValue={setValue}
                                            clearErrors={clearErrors}
                                            errors={errors}
                                            handleOnBlur={(_, { dialCode: code, format: phoneFormat, ...rest }) => {
                                                dialCode.current = code;
                                                phoneNumber.current = {
                                                    value: _.target.value,
                                                    format: phoneFormat,
                                                };
                                            }}
                                        />
                                    </div>
                                </Col>
                                {!isRequestApproval && (
                                    <Col md={2}>
                                        <div className="mt-12">
                                            <RSPrimaryButton
                                                className={
                                                    phoneNumber || phoneNumber?.length == 0 ? 'click-off' : ''
                                                }
                                                onClick={() => {
                                                    handleSubmit((data) =>
                                                        formSubmitHandler(data, 'test preview', false),
                                                    )();
                                                }}
                                                id="rs_rs_Messaging_Send"
                                            >
                                                Send
                                            </RSPrimaryButton>
                                        </div>
                                    </Col>
                                )}
                            </Row>
                        </div> */}

                        {/* {!isWhatsapp ? ( */}
                        <div className={isPastPlanDurationBlocked ? PAST_PLAN_DURATION_CLICK_OFF_CLASS : ''}>
                        <RequestApproval
                            name="approvalList.name"
                            // isSettings={false}
                            parent="approvalList"
                            // isCustomapproval
                            isCustomapproval={false}
                            isCustomEnterMail={true}
                            isSendButton
                            isClickOff={isPastPlanDurationBlocked || isSubmitting}
                            isSendLoading={isSendLoading}
                            // isPlus={false}
                            onRequestApproval={(status) => {
                                if (isPastPlanDurationBlocked || Object.keys(errors).includes('approvalList')) return;
                                const type = !status ? 'test preview' : 'request for approval';
                                handleSubmit((data) => formSubmitHandler(data, type, false))();
                            }}
                            testPreviewConfigDetail={{
                                fieldType: 'phoneInput',
                                fieldLabel: 'Test message',
                                fieldName: 'approvalList.testPhoneNumber',
                                testEmail: false,
                            }}
                            getCountry={(country) => {
                                setCountry(country);
                            }}
                            RfaCallBack={(isRFA) => {
                                let schedulerName = splitTest
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
                            channelType={type}
                        />
                        </div>
                        {/* ) : (
                            <RequestApproval
                                name="approvalList.name"
                                isSettings={false}
                                parent="approvalList"
                                isCustomapproval={false}
                                isSendButton
                                isPlus={false}
                                onRequestApproval={(status) => {
                                    const type = !status ? 'test preview' : 'request for approval';
                                    handleSubmit((data) => formSubmitHandler(data, type, false))();
                                }}
                                testPreviewConfigDetail={{
                                    fieldType: 'phoneInput',
                                    fieldLabel: 'Test message',
                                    fieldName: 'approvalList.testPhoneNumber',
                                }}
                            />
                        )} */}
                    </div>
                    <div className="buttons-holder">
                        <RSSecondaryButton
                            type="button"
                            onClick={() => {
                                if (mCampType === 'M') {
                                    const formState = getValues();
                                    const smsChannelDetailId =
                                        formState?.savedChannelResponseDetailId?.smsChannelDetailId ?? 0;
                                    const waChannelDetailId =
                                        formState?.savedChannelResponseDetailId?.waChannelDetailId ?? 0;
                                    const savedChannelResponseDetailId = smsChannelDetailId;

                                    const data = {
                                        data: {
                                            SMSChannelDetailID: smsChannelDetailId,
                                            waChannelDetailId: waChannelDetailId,
                                        },
                                    };
                                    if (savedChannelResponseDetailId && savedChannel) {
                                        handleMdcNavigation(data);
                                    } else {
                                        handleMdcCancel();
                                    }
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
                        {disableNext && (
                            <>
                                <RSSecondaryButton
                                    className={`color-primary-blue ${isPastPlanDurationBlocked ? PAST_PLAN_DURATION_CLICK_OFF_CLASS : ''}`}
                                    onClick={() => {
                                        if (isPastPlanDurationBlocked || Object.keys(errors).includes('approvalList')) {
                                            return;
                                        }
                                        const formData = getValues();
                                        const isCTGTConfirm = handleCheckCTGT(formData.audience);
                                        const hasUserConfirmed = formData.isCGTGConfirm === true;
                                        
                                        // Only show modal if CG/TG conflict exists and user hasn't confirmed yet
                                        if (isCTGTConfirm && !hasUserConfirmed && !handleCGTGModalCheck(campaignDetails?.content?.[0]?.statusId)) {
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
                                        if (
                                            !isDirty &&
                                            campaign.campaignType !== 'M' &&
                                            !hasMessagingCampaignDetails(campaignDetails)
                                        ) {
                                            UpdateState(setState, 'isNavigationConfirmation', true);
                                            return;
                                        } else if (Object.keys(errors).includes('approvalList')) {
                                            return;
                                        }
                                        const formData = getValues();
                                        const isCTGTConfirm = handleCheckCTGT(formData.audience);
                                        const hasUserConfirmed = formData.isCGTGConfirm === true;
                                        
                                        // Only show modal if CG/TG conflict exists and user hasn't confirmed yet
                                        if (isCTGTConfirm && !hasUserConfirmed && !handleCGTGModalCheck(campaignDetails?.content?.[0]?.statusId)) {
                                            setPendingNextSubmitParams({ type: 'form', isSchedule: true });
                                            setNextButtonCGTGModal(true);
                                            return;
                                        }
                                        
                                        handleSubmit((data) => formSubmitHandler(data, 'form', true))();
                                    }}
                                    id="rs_Messaging_Next"
                                >
                                    {mCampType === 'M'
                                        ? `${mdcButtonText} SMS content`
                                        : NEXT}
                                </RSPrimaryButton>
                            </>
                        )}
                    </div>
                </form>
                {/* Modals */}
                {confiramationModalConfig.map((modal) => (
                    <RSConfirmationModal
                        header={modal?.key === 'isRefresh' ? RESET : CONFIRMATION}
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
                <SplitABScheduleModal
                    tabs={splitTabConfig?.splitTabs}
                    type="messaging"
                    show={state.isShowScheduleModal}
                    handleClose={() => UpdateState(setState, 'isShowScheduleModal', false)}
                    editAutoScheduleDetails={editAutoScheduleDetails}
                />
                {/* <RSConfirmationModal
                    show={state.issplitOffConfirmationModal}
                    text={SPLIT_AB_TURNOFF}
                    primaryButtonText={OK}
                    handleClose={() => UpdateState(setState, 'issplitOffConfirmationModal', false)}
                    handleConfirm={() => refreshSplitABTab(true)}
                />

                <RSConfirmationModal
                    show={state.isNavigationConfirmation}
                    text={IGNORE_CHANNEL}
                    primaryButtonText={OK}
                    handleClose={() => UpdateState(setState, 'isNavigationConfirmation', false)}
                    handleConfirm={() => {
                        UpdateState(setState, 'isNavigationConfirmation', false);
                        handleNavigation();
                    }}
                />
                <RSConfirmationModal
                    show={state.showSchedulerModal}
                    text={COMMUNICATION_SCHEDULED}
                    primaryButtonText={SAVE}
                    handleClose={() => UpdateState(setState, ['showSchedulerModal', 'isScheduled'], [false, false])}
                    handleConfirm={() => {
                        UpdateState(setState, ['showSchedulerModal', 'isScheduled'], [false, false]);
                        // UpdateState(setState, 'isScheduled', true);
                        // setState((prev) => ({
                        //     isScheduled: true,
                        //     showSchedulerModal: false,
                        // }));
                        handleSubmit((data) => formSubmitHandler(data, formTypeRef.current, false, true))();
                    }}
                />
                {state.isWhatsAppError && (
                    <RSConfirmationModal
                        show={state.isWhatsAppError.show}
                        text={state.isWhatsAppError.message}
                        primaryButton={false}
                        handleClose={() => {
                            UpdateState(setState, 'isWhatsAppError', { message: '', show: false });
                        }}
                    />
                )} */}
                {state.sentCommunicationModal &&
                    <CommunicationSent
                        show={state.sentCommunicationModal}
                        status={state?.testSentCommunicationModal}
                        requestFalse={state?.requestFalse}
                        rfaMsg={state.rfaMsg || false}
                        handleClose={() => {
                            if (state?.rfaMsg === true) {
                                rfaManuallyClosedRef.current = true;
                                if (rfaAutoNavTimeoutRef.current) {
                                    clearTimeout(rfaAutoNavTimeoutRef.current);
                                    rfaAutoNavTimeoutRef.current = null;
                                }
                                campaign.campaignType === 'M'
                                    ? handleMdcNavigation({ data: saveCampaigData })
                                    : handleNavigation();
                            }
                            UpdateState(
                                setState,
                                ['sentCommunicationModal', 'rfaMsg', 'requestFalse'],
                                [false, false, ''],
                            );
                        }}
                        smsPreview={smsPreview}
                        isCloseButton={state.rfaMsg ? false : true}
                    />
                }
                {getWarningPopupMessage(failureApiErrors, dispatch, handleErrClose)}
                <RSConfirmationModal
                    show={isAudienceChangeConfirm}
                    text={AUDIENCE_CHANGE_CONFIRMATION}
                    primaryButtonText="Yes, proceed"
                    secondaryButtonText="Cancel"
                    handleClose={() => {
                        // Reset audience to previous value when user cancels
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
                            handleSubmit((data) => formSubmitHandler(data, pendingNextSubmitParams.type, pendingNextSubmitParams.isSchedule))();
                        }
                        setPendingNextSubmitParams(null);
                    }}
                />
            </FormProvider>
            </AuthoringChannelEditSkeletonGate>
        </MessagingContext.Provider>
    );
};

export default Messaging;