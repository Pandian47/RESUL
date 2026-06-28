import { charNumDotWithoutSpace } from 'Utils/modules/inputValidators';

import { campaignSchedule, checkRFAApproved, checkTrigger, diff_minutes, statusIdCheck, validateRFAMandatory } from 'Utils/modules/campaignUtils';
import { convertUserTimezoneToTarget, getYYMMDD } from 'Utils/modules/dateTime';
import { checkScheduleDate } from 'Utils/modules/display';
import { mapAudienceWithChannelLabels } from 'Utils/modules/formatters';
import { getmasterData } from 'Utils/modules/masterData';
import { EMAIL_RULES } from 'Constants/GlobalConstant/Rules';
import { ADJUST_SPLIT_SIZE, AUDIENCE, AUDIENCE_CHANGE_CONFIRMATION, AUDIENCE_COUNT_ZERO_ENABLE_AUTO_REFRESH, AUTO_REFRESH, AUTO_REFRESH_POP_HOVER_TEXT, AUTO_SCHEDULE_SPLITS, CANCEL, CHECK_START_DATE_AND_END_DATE, COMMUNICATION_SCHEDULED, EMAIL_FOOTER_WARNING_MSG, IGNORE_CHANNEL, LABLE_SPLIT_AB, LIVE_PREVIEW_SENT, MINIMUM_DIFFERENCE_SPLITS, NEXT, OK, REPLY_EMAIL, SAVE, SCHEDULE, SELECT_DOMAIN_NAME, SELECT_TEMPLATE, SENDER_EMAIL_ADDRESS, SENDER_NAME, SENDER_REPLY_EMAIL, SPLIT_AB_TOOLTIP_TEXT, SPLIT_AB_TURNOFF, TEST_PREVIEW_SENT, WARNING } from 'Constants/GlobalConstant/Placeholders';
import { encodeUrl, getUserDetails } from 'Utils/modules/crypto';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { buildPayload, formInitialState, getCommunicationPerformanceId, INITIAL_SPLIT_AB_STATE, initialState, refreshSplitABFields, renderItem, resetFieldsOnRefresh, SCHEDULE_START_TIME_MENU, stateReducer, syncDomainSenderDetailsIfChanged, watchList } from './constant';
import { ENTER_EDITOR_TEXT, ENTER_SENDER_NAME, ENTER_SENDEREMAILADDRESS, ENTER_SUBJECT_LINE, EXCEPTION_OCCURRED, SELECT_A_SCHEDULE_TIME, SELECT_CONTENT_TYPE, SELECT_DOMAIN_NAME as SELECT_DOMAIN_NAME_MSG, SELECT_IMPORT_URL, SELECT_ZIPFILE_URL, SUBJECTLINE_SHOULD_NOT_BE_SAME } from 'Constants/GlobalConstant/ValidationMessage';
import { adjust_split_medium, circle_minus_fill_medium, circle_plus_edge_medium, circle_plus_fill_edge_medium, circle_plus_fill_medium, circle_plus_medium, circle_question_mark_medium, circle_question_mark_mini, close_mini, refresh_medium, timer_medium, user_question_mark_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import _get from 'lodash/get';
import _map from 'lodash/map';
import _find from 'lodash/find';
import _isEmpty from 'lodash/isEmpty';
import _filter from 'lodash/filter';
import _forEach from 'lodash/forEach';
import _cloneDeep from 'lodash/cloneDeep';
import _uniqBy from 'lodash/uniqBy'
import { Col, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { FormProvider, useForm } from 'react-hook-form';

import { getContentSetupStatus, COMMUNICATION_CHANNEL_ID, handleUpdateEditAudienceCount, handleTotalAudienceCount, handleCGTGModalCheck, editActionIdFromCommunicationResponse } from '../../constant';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';
import EmailProvider from './context';
import RSConfirmationModal from 'Components/ConfirmationModal';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import RSInput from 'Components/FormFields/RSInput';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSSwitch from 'Components/FormFields/RSSwitch';
import RSPPophover from 'Components/RSPPophover';
import RSTabbar from 'Components/RSTabber';
import SplitABScheduleModal from '../../Component/SplitABScheduleModal';
import RSTooltip from 'Components/RSTooltip';
import SplitSlider from '../../Component/SplitSlider/SplitSlider';
import RequestApproval from 'Pages/AuthenticationModule/Components/RequestApproval/RequestApproval';
import SplitABTab from './Component/SplitABTab/SplitABTab';
import SmartLinkEnable from '../../Component/SmartLinkEnable/SmartLinkEnable';
import AuthoringChannelEditSkeletonGate, {
    AUTHORING_FIELD_LOADER_CONFIG,
    getAuthoringEditFieldLoaderConfig,
    getAuthoringSaveButtonType,
    useAuthoringChannelEditLoader,
    useAuthoringChannelSaveLoader,
} from 'Components/Skeleton/pages/communication/authoring';

import { SPLIT_AB_NAME, availableTabs, communicationChannels, handleAutoRefreshClickOff, handlePersonalization, handlePersonalizationFetchApiCall, calculateDefaultSplittedCount, AudienceFieldRenderComponent, audienceTypeList, handleMDCQueryParamsUpdate, handleCheckCTGT, getNextEligibleTabIndex, EMAIL_TAB_CHANNEL_MAP, validateAudienceCount, mergeChannelAudiences, getPastPlanDurationBlockedState, validatePastPlanDurationOnSubmit, PAST_PLAN_DURATION_CLICK_OFF_CLASS, shouldLoadMdcEditCampaignFromGenie, isGenie } from '../../constant';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import {
    updateDirtyState,
    updateEmail,
    updateTab,
    updateVerticalTab,
    resetCreateCommunication,
    updateEmailList,
    updateFilterAudience,
    updateMDCEditMode,
    updateAudience,
} from 'Reducers/communication/createCommunication/Create/reducer';
import { getRequestApprovalList, getSessionId } from 'Reducers/globalState/selector';
import { emailList, getAudience, getFilterAudience } from 'Reducers/communication/createCommunication/Create/selectors';
import {
    getEmailFooterList,
    getUnSubscriptionList,
    saveEmailCampaign,
    getEmailCommunicationById,
    getAudienceList,
    getSubjectLineAnalysisEnable,
    getDomainNameList,
    getPersonalizationFields,
} from 'Reducers/communication/createCommunication/Create/request';

import useComponentWillUnmount from 'Hooks/useComponentWillUnMount';
import useApiLoader from 'Hooks/useApiLoader';
import { getGeneratedLink } from 'Reducers/communication/createCommunication/smartlink/selectors';
import CommunicationSent from '../../Component/CommunicationSent/CommunicationSent';
import useQueryParams from 'Hooks/useQueryParams';
import { getSmartUrl } from 'Reducers/communication/createCommunication/smartlink/request';
import { updateSmartLinkShow } from 'Reducers/communication/createCommunication/execute/reducer';
import { showTabsSmartlink } from 'Reducers/communication/createCommunication/smartlink/reducer';
import { getUserListCampaign, getUtcTimeNow } from 'Reducers/globalState/request';
import { getUtcTimeData } from 'Reducers/globalState/selector';
import { isEmpty } from 'lodash';
import { updateTotalAudienceCount } from 'Reducers/communication/createCommunication/Create/reducer';
import { updateChannelAudiences } from 'Reducers/communication/createCommunication/plan/reducer';
import { getSplitIndex } from './Component/Template/constant';
let tempCampaignID = 0,
    tempcampaignDetails = {},
    userKeyInfo = [];
const Email = ({ type, mCampType }) => {
    const dispatch = useDispatch();
    const store = useStore();
    const navigate = useNavigate();
    const location = useQueryParams('/communication/create-communication');
    const tabberRef = useRef();
    const audienceRef = useRef();
    const formTypeRef = useRef(null);
    const rfaAutoNavTimeoutRef = useRef(null);
    const rfaManuallyClosedRef = useRef(false);
    const { timeZoneList } = getmasterData();
    const [campaign, setCampaign] = useState({});
    const approvalList = useSelector((state) => getRequestApprovalList(state));
    const utcTimeData = useSelector(getUtcTimeData);
    userKeyInfo = approvalList || [];
    const { checkSpam } = useSelector((state) => emailList(state));
    // navingate
    const [navigate_confirm, setNavigate_confirm] = useState(false);
    const [emailFooterWarning, setEmailFooterWarning] = useState(false);
    const [pendingEmailFooterParams, setPendingEmailFooterParams] = useState(null);
    const [unsubscribeDuplicateWarning, setUnsubscribeDuplicateWarning] = useState(false);
    const [pendingSubmitParams, setPendingSubmitParams] = useState(null);
    const [isAudienceChangeConfirm, setIsAudienceChangeConfirm] = useState(false);
    const [previousAudience, setPreviousAudience] = useState([]);
    const [isClickOff, setIsClickOff] = useState(false);
    const [nextButtonCGTGModal, setNextButtonCGTGModal] = useState(false);
    const [pendingNextSubmitParams, setPendingNextSubmitParams] = useState(null);
    const [audienceCountZeroWarning, setAudienceCountZeroWarning] = useState(false);
    // console.log('isClickOffPare: ', isClickOff);
    const [disableNext, setDisableNext] = useState(true);
    const [disableSubjectLine, setDisableSubjectLine] = useState(true);
    /* MDC variables start*/
    const [mdcContentSetupDetails, setMdcContentSetupDetails] = useState({});
    const [levelNumber, setLevelNumber] = useState(1);
    const [actionId, setActionId] = useState(0);
    const [mdcChannelDetailId, setMdcChannelDetailId] = useState(0);
    const [mdcAudience, setMdcAudience] = useState([]);
    const [dataSource, setDataSource] = useState('TL');
    const [mdcButtonText, setMdcButtonText] = useState(`Create`);
    /* MDC variables end*/

    const { smartLink1, smartLink2 } = useSelector((state) => getGeneratedLink(state));
    const {
        smtpSettings,
        campaignDetails,
        emailFooter,
        unSubscriptionList,
        senderid_email = [],
        domainNameList,
    } = useSelector((state) => emailList(state));
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    // console.log('domainNameList: ', domainNameList);
    tempcampaignDetails = campaignDetails;

    const {
        tabsState: { email: tabEmailState },
        activeTabs,
        verticalTab: { type: channelType, currentTab } = {},
        isDirty,
        personalization,
        listTypeWisePersonlization,
        isMDCEditMode,
    } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const { tabSmartLink_Flag, customFields, mobileApps, screenList, subScreenList } = useSelector(
        ({ smartLinkReducer }) => smartLinkReducer,
    );
    // const filteredPersonalization = personalization.filter((item) => {
    //     return item.attributeName.startsWith('Name') || item.attributeName.endsWith('Name');
    // });
    const audienceList = useSelector((state) => getAudience(state));
    const filterAudienceList = useSelector((state) => getFilterAudience(state));
    const { savedChannelsId, channelAudiences = {} } = useSelector(({ communicationPlanReducer }) => communicationPlanReducer);
    const [updateAudienceData, setUpdateAudienceData] = useState(audienceList);
    const editCallAuidenceRef = useRef(false);
    const editBindAuidenceRef = useRef(false);
    const isAlreadyEditCallRef = useRef(false);
    const [saveCampaigData, setSaveCampaigData] = useState(null);

    const [{ showSlider, splitTabList, isSmarkLink, ...state }, dispatchState] = useReducer(
        stateReducer,
        initialState,
    );
    const methods = useForm(formInitialState);
    const {
        control,
        watch,
        handleSubmit,
        formState: { errors, dirtyFields, isValid },
        setValue,
        clearErrors,
        trigger,
        setError,
        resetField,
        getValues,
        setFocus,
        reset,
        unregister,
    } = methods;
    // const senderNameValue = watch('senderName');
    let [
        audience,
        splitTest,
        currentPage = null,
        edmContent = '',
        isReplyMailEnabled = true,
        templateContent = '',
        edmDimension = 0,
        isAutoRefereshenabled,
        watchtotalAudience,
    ] = watch(watchList);
    const [isTestMail, setIsTestMail] = useState(false);
    const [emptySplitdate, setEmptySplitDate] = useState({
        text: '',
    });
    const isAlreadyUpdateLocationRef = useRef(false);
    const { failureApiErrors, isCurrentBURFAStatus } = useSelector(({ globalstate }) => globalstate);
    const dirty = { ...dirtyFields };

    const [splitAB, setSplitAB] = useState(INITIAL_SPLIT_AB_STATE);
    const [editAutoScheduleDetails, setEditAutoScheduleDetails] = useState({});
    if (_get(location, 'campaignType', 'S') === 'M') {
        audience = mdcAudience;
    }
    let calucateAudienceCount = useMemo(
        () => audience?.reduce((prev, cur) => Number(prev) + Number(cur.recipientCountEmail), 0),
        [audience],
    );

    const savedChannel = savedChannelsId[1]?.includes(1) ? true : false;
    const isTemplateFlow = (location?.templateId > 0 && location?.channelId === 1) || (location?.templateId && location?.templateChannelId === 1);
    const {
        showEditSkeleton,
        isSavedChannel,
        shouldShowEditSkeleton,
        beginEditSkeleton,
        finishEditSkeleton,
        runEditFetch,
        resetEditLoading,
    } = useAuthoringChannelEditLoader({
        channelId: 1,
        subChannelId: 1,
        shouldLoadEdit: isTemplateFlow || isMDCEditMode === 'edit' || mCampType === 'M',
    });

    const shouldFetchEditEmail =
        (!isTestMail || isTemplateFlow) &&
        ((_get(location, 'campaignType', '') === 'M' && (isMDCEditMode === 'edit' || isTemplateFlow)) ||
            (_get(location, 'campaignType', '') !== 'M' && (savedChannel || isTemplateFlow)));

    const needsEditEmailApi =
        savedChannel || isMDCEditMode === 'edit' || isTemplateFlow;
    const editEmailApiSettledRef = useRef(!needsEditEmailApi);
    const pendingEditSkeletonFinishRef = useRef(false);
    const skipEditEmailFetchRef = useRef(false);

    const editFieldLoaderConfig = getAuthoringEditFieldLoaderConfig({
        showEditSkeleton,
        mCampType,
        savedChannel,
        isTemplateFlow,
    });
    const audienceLoader = useApiLoader();
    const domainNameLoader = useApiLoader();
    const personalizationLoader = useApiLoader();
    const { runSave, beginSubmit, endSubmit, isSaveLoading, isNextLoading, isSendLoading, isSubmitting } =
        useAuthoringChannelSaveLoader();
    // const isSplitABEnable = calucateAudienceCount >= 100 && !Object.hasOwn(errors, 'audience');
    const isSplitABEnable = calucateAudienceCount >= 100;
    const importTabFieldName = splitTest
        ? splitTabList?.[state.currentSplitTab] ?? splitTabList?.[0] ?? 'splitA'
        : '';
    const isImportTabEnabled = getContentSetupStatus(watch(), importTabFieldName, {
        channelId: COMMUNICATION_CHANNEL_ID.EMAIL,
        splitTabList,
    });

    const lastSuccessfulSenderSyncRef = useRef(null);

    const syncSenderDetailsBeforeSave = useCallback(
        () =>
            syncDomainSenderDetailsIfChanged({
                getValues,
                dispatch,
                domainNameList,
                clientId,
                userId,
                departmentId,
                lastSuccessfulSenderSyncRef,
            }),
        [domainNameList, clientId, userId, departmentId],
    );

    // useComponentWillUnmount(() => {
    //     reset(_cloneDeep(formInitialState));
    //     reset();
    // });

    useEffect(() => {
        dispatch(updateTotalAudienceCount(calucateAudienceCount || 0));
    }, [calucateAudienceCount]);
    useEffect(() => {
        setValue('splitTabList', splitTabList);
    }, [splitTabList, watch('splitTest')]);

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
    console.log('isPastPlanDurationBlocked: ', isPastPlanDurationBlocked);
    const getUsersList = async () => {
        const usersRes = await dispatch(getUserListCampaign({ payload: { clientId, userId, loggedinusertype: 0 },loading: false }));
        let userList = usersRes?.status ? usersRes?.data : [];
        const users = _map(userList, (list) => ({ ...list, name: `${list.firstName} (${list.email})` }));
        userKeyInfo = users;
        return users;
    };

    useEffect(() => {
        if (!userKeyInfo || !userKeyInfo?.length) {
            getUsersList();
        }
    }, []);


    useEffect(() => {
        async function getSmartLink() {
            const payload = { clientId, departmentId, userId, campaignId: location?.campaignId };
            const res = await dispatch(
                getSmartUrl({
                    payload,
                    listData: { mobileApps, personalization },
                    screenListObj: { screenList, subScreenList },
                    reduceLoad: true,
                    loading: false
                }),
            );
            if (!res?.status) {
                dispatchState({ type: 'UPDATE', payload: true, field: 'isSmarkLink' });
                dispatch(updateSmartLinkShow(false));
            } else {
                dispatchState({ type: 'UPDATE', payload: false, field: 'isSmarkLink' });
                dispatch(updateSmartLinkShow(true));
            }
        }
        if (!smartLink1 && !tabSmartLink_Flag) {
            if (
                !statusIdCheck(Object.keys(campaignDetails)?.length > 1 ? campaignDetails?.content[0]?.statusId : null, location?.campaignType, campaignDetails)
            ) {
                dispatchState({ type: 'UPDATE', payload: true, field: 'isSmarkLink' });
                dispatch(updateSmartLinkShow(false));
                dispatch(showTabsSmartlink(true));
            } else {
                //if (location) getSmartLink();
            }
        }
    }, [location, campaignDetails]);
    useEffect(() => {
        return () => {
            resetEditLoading();
            dispatch(updateAudience([]));
            dispatch(updateFilterAudience([]));
            // reset(_cloneDeep(formInitialState));
            reset();
        };
    }, [dispatch, reset, resetEditLoading]);
    useEffect(() => {
        // reset(_cloneDeep(formInitialState));
        if (location !== null) {
            tempCampaignID = _get(location, 'campaignId', 0);

            const campaign = {
                campaignId: _get(location, 'campaignId', 0),
                campaignType: _get(location, 'campaignType', 'S'),
            };
            const mdcContentSetupDetails = _get(location, 'mdcContentSetupDetails', {});
            const levelNumber = _get(mdcContentSetupDetails, 'levelNumber', 1);
            const actionId = _get(mdcContentSetupDetails, 'actionId', 0);
            const mdcChannelDetailId = _get(mdcContentSetupDetails, 'channelDetailId', 0);
            const mdcAudience = _get(mdcContentSetupDetails, 'audience', []);
            const dataSource = _get(mdcContentSetupDetails, 'dataSource', []);
            const mdcIsCGTGEnabled = _get(mdcContentSetupDetails, 'isCGTGEnabled', false);
            const mdcButtonText = mdcChannelDetailId ? 'Update' : 'Create';
            setCampaign(campaign);
            setMdcContentSetupDetails(mdcContentSetupDetails);
            setLevelNumber(levelNumber);
            setActionId(actionId);
            setMdcAudience(mdcAudience);
            setMdcButtonText(mdcButtonText);
            setMdcChannelDetailId(mdcChannelDetailId);
            setDataSource(dataSource);

            // For MDC create mode (no channelDetailId), set isCGTGEnabled from mdcContentSetupDetails
            if (campaign.campaignType === 'M' && !mdcChannelDetailId) {
                setValue('isCGTGEnabled', mdcIsCGTGEnabled);
            }
        }
    }, [location]);

    useEffect(() => {
        if (_get(location, 'campaignType', '') === 'S' && audienceList?.length === 0) {
            audienceLoader.refetch({
                fetcher: ({ payload, isFilter = false } = {}) =>
                    dispatch(getAudienceList({ payload, isFilter, loading: false })),
                mode: savedChannel ? 'edit' : 'create',
                loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
                params: {
                    payload: {
                        clientId,
                        userId,
                        campaignId: campaign.campaignId,
                        departmentId,
                        searchText: '',
                        segmentIds: [],
                        channelType: 'E',
                    },
                    isFilter: false,
                },
            });
        }
        if (
            _get(location, 'campaignType', '') === 'S' ||
            _get(location, 'campaignType', '') === 'T' ||
            _get(location, 'campaignType', '') === 'M'
        ) {
            // (_get(location, 'campaignType', '') === 'M' &&
            //     _get(location, 'mdcContentSetupDetails.channelDetailId', 0) > 0)
            // dispatch(
            //     getEmailCommunicationById({
            //         payload: {
            //             ...user,
            //             departmentId,
            //             levelNumber: _get(location, 'mdcContentSetupDetails.levelNumber', 1),
            //             actionId: _get(location, 'mdcContentSetupDetails.actionId', 0),
            //             campaignId: location?.campaignId,
            //             edmChannelId: _get(location, 'mdcContentSetupDetails.channelDetailId', 0),
            //         },
            //     }),
            // );

            if (_get(location, 'campaignType', '') === 'M') {
                const isFromGenie = isGenie(location);
                const shouldLoadEditData = isFromGenie
                    ? shouldLoadMdcEditCampaignFromGenie({ location, isMDCEditMode, savedChannel })
                    : isMDCEditMode === 'edit';
                if (shouldLoadEditData && (!isFromGenie || !isAlreadyEditCallRef.current)) {
                    if (isFromGenie) {
                        isAlreadyEditCallRef.current = true;
                    }
                    getEmailCommunicationByIdData();
                }
            } else if (savedChannel) {
                getEmailCommunicationByIdData();
            }

            if (isTemplateFlow) {
                getEmailCommunicationByIdData();
            }
        }
    }, [location?.campaignId]);
    const [emailCommFail, setEmailCommFail] = useState(false);
    const getEmailCommunicationByIdData = async () => {
        if (skipEditEmailFetchRef.current) {
            editEmailApiSettledRef.current = true;
            return;
        }
        if (!needsEditEmailApi) {
            editEmailApiSettledRef.current = true;
            return;
        }
        editEmailApiSettledRef.current = false;
        if (!state?.isTestMailSent) {
            try {
                const res = await runEditFetch(
                    () =>
                        dispatch(
                            getEmailCommunicationById({
                                payload: {
                                    clientId,
                                    userId,
                                    departmentId,
                                    levelNumber: _get(location, 'mdcContentSetupDetails.levelNumber', 1),
                                    actionId: _get(location, 'mdcContentSetupDetails.actionId', 0),
                                    campaignId: location?.campaignId,
                                    edmChannelId: _get(location, 'mdcContentSetupDetails.channelDetailId', 0),
                                },
                                loading: false,
                            }),
                        ),
                    { releaseAfterFetch: false },
                );
                setEmailCommFail(!res?.status);
            } finally {
                editEmailApiSettledRef.current = true;
                if (pendingEditSkeletonFinishRef.current) {
                    pendingEditSkeletonFinishRef.current = false;
                    finishEditSkeleton();
                }
            }
        } else {
            editEmailApiSettledRef.current = true;
        }
    };

    const handleAudienceInEdit = async (segmentationList) => {
        if (!editCallAuidenceRef.current) {
            editCallAuidenceRef.current = true;
            await audienceLoader.refetch({
                fetcher: ({ payload, isFilter = false } = {}) =>
                    dispatch(getAudienceList({ payload, isFilter, loading: false })),
                mode: 'edit',
                loaderConfig: editFieldLoaderConfig,
                params: {
                    payload: {
                        clientId,
                        userId,
                        campaignId: campaign.campaignId,
                        departmentId,
                        searchText: '',
                        segmentIds: segmentationList,
                        channelType: 'E',
                    },
                    isFilter: true,
                },
            });
        }
    };
    const handleSubjectLine = async () => {
        const response = await dispatch(getSubjectLineAnalysisEnable({ payload: { clientId, userId, departmentId } }));
        setDisableSubjectLine(!response?.data);
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
        domainNameLoader.refetch({
            fetcher: ({ payload } = {}) =>
                dispatch(getDomainNameList({ payload, loading: false })),
            mode: savedChannel ? 'edit' : 'create',
            loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
            params: {
                payload: { clientId, userId, departmentId },
            },
        });
        //dispatch(getEmailSenderIdEmail({ payload: { ...user, departmentId: 0 } }));
        handleSubjectLine();
    }, []);
    useEffect(() => {
        if (!shouldFetchEditEmail) {
            return;
        }

        const fetchEditEmail = async () => {
            const shouldProcess =
                Object.keys(campaignDetails)?.length > 1 && !isEmpty(location);
            if (!shouldProcess) {
                return;
            }

            let didBind = false;
            try {
            const __rawSearch = new URLSearchParams(window.location.search);
            const __rawTemplateId = parseInt(__rawSearch.get('templateId')) || 0;
            const __rawChannelId = parseInt(__rawSearch.get('channelId')) || 0;
            const __rawTemplateChannelId = parseInt(__rawSearch.get('templateChannelId')) || 0;
            // This local variable shadows the outer isTemplateFlow for all logic below.
            const isTemplateFlow = (__rawTemplateId > 0 && __rawChannelId === 1) || (__rawTemplateId > 0 && __rawTemplateChannelId === 1);
            if (
                Object.keys(campaignDetails)?.length > 1 &&
                !isEmpty(location)
                // (_get(location, 'campaignType', '') === 'M' || audienceList?.length)
            ) {
                // console.log(campaignDetails, 'campaignDetails');

                const {
                    content,
                    targetListTargetAudience,
                    senderName,
                    senderEmail,
                    SenderemailDomain,
                    SenderemailUsername,
                    totalAudience,
                    replyEmail,
                    isSplitAB,
                    edmAutoSchedule,
                    isSendTimeOptEnable,
                    testCampaignEmailAddress: rawTestCampaignEmailAddress,
                    edmSplit,
                    requestForApproval,
                    isReplyMailEnabled,
                    isAutoRefereshenabled,
                    isCGTGEnabled,
                } = campaignDetails;
                const testCampaignEmailAddress = rawTestCampaignEmailAddress?.includes('|')
                    ? rawTestCampaignEmailAddress.split('|')[0]
                    : rawTestCampaignEmailAddress || '';
                const statusIdForReadOnly = content?.[0]?.statusId ?? null;
                const splitTabsIsClickOff =
                    checkTrigger(location?.campaignType, location?.endDate) ||
                    !statusIdCheck(statusIdForReadOnly, location?.campaignType, campaignDetails) ||
                    checkRFAApproved(statusIdForReadOnly, requestForApproval?.approvarList);
                let audience = _filter(audienceList, (aud) =>
                    targetListTargetAudience?.includes(aud.segmentationListId),
                );
                if (!audience?.length && targetListTargetAudience?.length) {
                    let tempAudienceData = [];
                    const filterAudienceResponse = await dispatch(
                        getAudienceList({
                            payload: {
                                userId,
                                clientId,
                                campaignId: campaign.campaignId,
                                departmentId,
                                searchText: '',
                                segmentIds: targetListTargetAudience,
                                channelType: 'E',
                            },
                            isFilter: true,
                            loading: false,
                        }),
                    );
                    const updateAudienceData = _map(filterAudienceResponse?.data, mapAudienceWithChannelLabels);
                    tempAudienceData.push(...updateAudienceData);
                    audience = tempAudienceData ?? [];
                }
                if (_get(location, 'campaignType', '') === 'M') {
                    audience = _get(location, 'mdcContentSetupDetails.audience', [])?.length ? _get(location, 'mdcContentSetupDetails.audience', []) : audience;
                } else if (_get(location, 'campaignType', '') === 'T') {
                    audience = [];
                }
                const state = {
                    selectedSendername: senderName?.startsWith('[') && senderName?.endsWith(']') ? senderName : '',
                    splitTabList: [],
                    isAlternateEmailInput: false,
                    splitABCount: {},
                };
                // calucateAudienceCount = totalAudience;
                // Update Redux state with the total audience count from campaign details
                dispatch(updateTotalAudienceCount(totalAudience || 0));
                let temp = {};
                temp.totalAudience = totalAudience || 0;
                let footerListForBinding = emailFooter;
                const campaignUsesEmailFooter =
                    isSplitAB && !_isEmpty(content)
                        ? content.some(({ isFooterEnabled }) => isFooterEnabled)
                        : Boolean(content?.[0]?.isFooterEnabled);
                if (campaignUsesEmailFooter) {
                    await dispatch(
                        getEmailFooterList({ payload: { clientId, userId, departmentId }, loading: false }),
                    );
                    footerListForBinding = emailList(store.getState()).emailFooter;
                }
                let unsubscriptionListForBinding = unSubscriptionList;
                const campaignUsesUnsubscription =
                    Boolean(location?.savedUnsubscribeId) ||
                    (isSplitAB && !_isEmpty(content)
                        ? content.some(({ isUnsubscribeEnabled }) => isUnsubscribeEnabled)
                        : Boolean(content?.[0]?.isUnsubscribeEnabled));
                if (campaignUsesUnsubscription) {
                    await dispatch(getUnSubscriptionList({ payload: { clientId, userId, departmentId } }));
                    unsubscriptionListForBinding = emailList(store.getState()).unSubscriptionList;
                }
                if (isSplitAB && !_isEmpty(content)) {
                    // console.log(content, '::content');
                    content?.forEach(
                        ({
                            textContent,
                            edmDimension,
                            localBlastDateTime,
                            timezoneId,
                            subjectLine,
                            contentType,
                            contentUrl,
                            inboxFirstLineMessage,
                            isViewinBrowser,
                            isFooterEnabled,
                            footerId,
                            unsubscribeSettingId,
                            isUnsubscribeEnabled,
                            splitType,
                            edmFileWeight,
                            ...restSplitContentItem
                        }) => {
                            const tempTab = {};
                            const findTimeZone = _find(timeZoneList, (time) => time.timeZoneID === timezoneId);
                            const findFooterId = _find(footerListForBinding, ['emailfooterId', footerId]);
                            const findUnsubcriptionMessage = _find(unsubscriptionListForBinding, [
                                'unsubscribeSettingId',
                                unsubscribeSettingId,
                            ]);
                            const tabConfig = {
                                R: 0,
                                Z: 1,
                                T: 2,
                            };

                            // Set content based on contentType
                            if (contentType === 'R') {
                                tempTab.editorText = textContent;
                                tempTab.edmContent = '';
                                tempTab.templateContent = '';
                            } else if (contentType === 'Z') {
                                tempTab.editorText = '';
                                tempTab.edmContent = textContent;
                                tempTab.templateContent = '';
                            } else if (contentType === 'T') {
                                tempTab.editorText = '';
                                tempTab.edmContent = '';
                                const isTargetSplit = isTemplateFlow && (
                                    location?.activeSplitName === `split${splitType}` ||
                                    !location?.activeSplitName
                                );
                                if (!isTargetSplit) {
                                    // Not the split being edited from the builder — use campaign data
                                    tempTab.templateContent = textContent;
                                    tempTab.templateId = restSplitContentItem?.templateId;
                                }
                            }
                            tempTab.edmDimension = edmDimension;
                            tempTab.schedule = localBlastDateTime
                                ? new Date(localBlastDateTime)
                                : getValues(`split${splitType}.schedule`) || '';
                            tempTab.timezone = findTimeZone;
                            tempTab.subjectLine = subjectLine;
                            //Need to update for other content type
                            tempTab.currentPage = tabConfig[contentType] ?? null;
                            tempTab.contentType = contentType;
                            tempTab.contentUrl = contentUrl;
                            tempTab.importType = contentUrl === '' ? 'import' : 'url';
                            tempTab.inboxLinePreview = inboxFirstLineMessage;
                            tempTab.viewInBrowser = isViewinBrowser;
                            tempTab.emailFooter = isFooterEnabled;
                            tempTab.unSubscription = isUnsubscribeEnabled;
                            tempTab.unsubscriptionMessage = findUnsubcriptionMessage;
                            tempTab.sampleEmailFooter = findFooterId;
                            temp[`split${splitType}`] = tempTab;
                            state.splitTabList.push(`split${splitType}`);
                            localStorage.setItem(`split${splitType}`, edmFileWeight);
                        },
                    );
                    const tempTabState = state.splitTabList.map((_, index, total) => {
                        const getSplitName = { ...SPLIT_AB_NAME[index] };
                        delete getSplitName.add;
                        return {
                            ...getSplitName,
                            component: () => (
                                <SplitABTab
                                    fieldName={_}
                                    key={getSplitName.id}
                                    isSplit
                                    campaignType={campaign?.campaignType}
                                    isSubjectLineEnable={disableSubjectLine}
                                    isClickOff={splitTabsIsClickOff}
                                />
                            ),
                            ...(total?.length < 4 && total?.length - 1 === index && { add: circle_plus_medium }),
                            ...(index > 1 &&
                                total?.length - 1 === index && {
                                remove: circle_minus_fill_medium,
                                isRemove: splitTabsIsClickOff,
                            }),
                        };
                    });
                    // console.log(tempTabState, '::tempTabState');
                    // if (tempTabState?.length === 2 || tempTabState?.length === 3)
                    //     tempTabState[tempTabState?.length - 1].add = circle_plus_edge_medium;

                    setSplitAB(tempTabState);
                    if (location?.activeSplitName) {
                        dispatchState({
                            type: 'UPDATE',
                            payload: getSplitIndex(location?.activeSplitName),
                            field: 'currentSplitTab',
                        });
                    }
                    else if (location?.splitType) {
                        const splitIndex = tempTabState?.findIndex((item) => item?.id === location?.splitType)
                        if (splitIndex !== -1 && splitIndex < tempTabState?.length) {
                            dispatchState({
                                type: 'UPDATE',
                                payload: splitIndex,
                                field: 'currentSplitTab',
                            });
                        }
                    }
                } else {
                    if (!content[0]) {
                        return;
                    }
                    const {
                        textContent,
                        edmDimension,
                        localBlastDateTime,
                        timezoneId,
                        subjectLine,
                        contentType,
                        contentUrl,
                        inboxFirstLineMessage,
                        isViewinBrowser,
                        isFooterEnabled,
                        isUnsubscribeEnabled,
                        unsubscribeSettingId,
                        footerId,
                        edmFileWeight,
                        templateId,
                    } = content[0];
                    const findTimeZone = _find(timeZoneList, (time) => time.timeZoneID === timezoneId);
                    const findFooterId = location?.savedFooterId
                        ? _find(footerListForBinding, ['emailfooterId', location?.savedFooterId])
                        : _find(footerListForBinding, ['emailfooterId', footerId]);
                    const findUnsubcriptionMessage = location?.savedUnsubscribeId
                        ? _find(unsubscriptionListForBinding, ['unsubscribeSettingId', location?.savedUnsubscribeId])
                        : _find(unsubscriptionListForBinding, ['unsubscribeSettingId', unsubscribeSettingId]);
                    // Set content based on contentType
                    if (contentType === 'R') {
                        temp.editorText = textContent;
                        temp.edmContent = '';
                        temp.templateContent = '';
                    } else if (contentType === 'Z') {
                        temp.editorText = '';
                        temp.edmContent = textContent;
                        temp.templateContent = '';
                    } else if (contentType === 'T') {
                        temp.editorText = '';
                        temp.edmContent = '';
                        if (!isTemplateFlow) {

                            temp.templateContent = textContent;
                            temp.templateId = templateId || 0;
                        }
                    }
                    temp.edmDimension = edmDimension;
                    temp.schedule = localBlastDateTime ? new Date(localBlastDateTime) : getValues('schedule') || '';
                    temp.timezone = findTimeZone;
                    temp.subjectLine = subjectLine;
                    //Need to update for other content type
                    temp.currentPage = contentType === 'R' ? 0 : contentType === 'T' ? 2 : 1;
                    temp.contentType = contentType;
                    temp.contentUrl = contentUrl;
                    temp.importUrl = contentUrl;
                    temp.importType = contentUrl === '' ? 'import' : 'url';
                    temp.inboxLinePreview = inboxFirstLineMessage;
                    temp.viewInBrowser = isViewinBrowser;
                    temp.emailFooter = isFooterEnabled;
                    temp.unSubscription = isUnsubscribeEnabled;
                    temp.unsubscriptionMessage = findUnsubcriptionMessage;
                    temp.sampleEmailFooter = findFooterId;
                    if (contentType !== 'T') {
                        temp.templateId = templateId || 0;
                    }
                    state.splitTabList = ['splitA', 'splitB'];
                    localStorage.setItem('edm', edmFileWeight);
                }
                if (edmAutoSchedule.autoSchedule) {
                    const tempSchedule = {};
                    const { autoSchedule, startIn, periodRange, performedBy } = edmAutoSchedule;
                    tempSchedule.autoSchedule = autoSchedule;
                    tempSchedule.time = _find(SCHEDULE_START_TIME_MENU, ['id', Number(periodRange)]);
                    tempSchedule.duration = startIn;
                    tempSchedule.communicationPerformanceBy = getCommunicationPerformanceId(performedBy);
                    temp.splitscehdule = tempSchedule;
                    setEditAutoScheduleDetails(tempSchedule);
                } else {
                    temp.splitscehdule = {
                        autoSchedule: false,
                        communicationPerformanceBy: 'Subject line',
                        duration: '8',
                        time: { id: 1, value: 'Hour(s)' },
                    };
                    setEditAutoScheduleDetails({
                        autoSchedule: false,
                        communicationPerformanceBy: 'Subject line',
                        duration: '8',
                        time: { id: 1, value: 'Hour(s)' },
                    });
                }
                if (edmSplit.splitAudience > 0) {
                    const tempSplitAudience = {};
                    const { splitAudience, splitPercentage, totalAudience: totalCount, splitWidth } = edmSplit;
                    tempSplitAudience.count = splitAudience;
                    tempSplitAudience.totalCount = totalCount;
                    tempSplitAudience.audienceCount = totalAudience;
                    tempSplitAudience.percentage = splitPercentage;
                    tempSplitAudience.width = splitWidth;
                    tempSplitAudience.tabs = _map(content, ({ splitType }) => `split${splitType}`);
                    state.splitABCount = tempSplitAudience;
                }
                const requestApproval = requestForApproval.isWorkflowEnabled;
                const testEmail = _find(approvalList, ['email', testCampaignEmailAddress]);
                const isApprovalInputEmail = !testEmail && testCampaignEmailAddress ? true : false; //testCampaignEmailAddress.includes(',');
                // let finalSenderEmail = location?.templateId ? senderEmail : senderEmail
                let finalSenderEmail = location?.templateId ? senderEmail : senderEmail;
                const emailUsername = finalSenderEmail?.split('@')?.[0] || '';
                const emailDomain = finalSenderEmail?.split('@')?.[1] || '';
                const matchAudienceType = audienceTypeList?.filter((typeList) =>
                    audience?.map((aud) => aud?.listType)?.includes(typeList?.id),
                );
                audience = _uniqBy(audience, 'segmentationListId')
                let updateAudienceState = handleUpdateEditAudienceCount({
                    channelId: COMMUNICATION_CHANNEL_ID.EMAIL,
                    audience,
                    savedAudienceCountList: campaignDetails?.savedAudienceCountList || [],
                    statusId: content[0]?.statusId,
                });
                reset((formState) => {
                    const resolvedTemp = { ...temp };


                    return {
                        ...formState,
                        audience: updateAudienceState,
                        audienceType: matchAudienceType?.length ? matchAudienceType : [audienceTypeList[0]],
                        editActionId: editActionIdFromCommunicationResponse(campaignDetails),
                        // SenderemailUsername: emailUsername,
                        // SenderemailDomain: { username: emailUsername, domainname: emailDomain },
                        isReplyMailEnabled: isReplyMailEnabled,
                        isAutoRefereshenabled: isAutoRefereshenabled,
                        replyEmail: !replyEmail?.length,
                        isCGTGEnabled: isCGTGEnabled ?? false,
                        // alternateEmailId: {
                        //     clientSMTPSenderId: 0,
                        //     senderEmailId: replyEmail,
                        // },
                        sendTimeRecommendation: isSendTimeOptEnable,
                        splitTest: isSplitAB,
                        approvalList: {
                            ...formState.approvalList,
                            ...(requestApproval && {
                                name: _map(requestForApproval.approvarList, ({ approvarName, flag }) => {
                                    const approver = _find(approvalList, ['email', approvarName]);
                                    const name = !approver ? approvarName : approver;
                                    const isMandatory = flag ? flag : false;
                                    return { approverName: name, mandatory: isMandatory, isCustom: !approver };
                                }),
                            }),

                            testEmail: isApprovalInputEmail ? testCampaignEmailAddress : testEmail,
                            requestApproval,
                            isApprovalInputEmail,
                            followHierarchy: requestForApproval.isFollowHierarchy,
                            approvalFrom: requestForApproval.approvalFrom,
                        },
                        ...resolvedTemp,
                    }
                });
                dispatchState({
                    type: 'UPDATE_EDIT_STATE',
                    payload: state,
                });
                location?.campaignType === 'M' && !isAlreadyUpdateLocationRef?.current && !isTemplateFlow &&
                    handleMDCQueryParamsUpdate(
                        {
                            ...mdcContentSetupDetails,
                            ...watch(),
                            ...campaignDetails
                        },
                        location,
                    );
                isAlreadyUpdateLocationRef.current = true;
                didBind = true;
                // if (campaignDetails?.approvalList?.testEmail) {
                //     setValue('approvalList.testEmail', campaignDetails?.approvalList?.testEmail);
                // }
            } else {
                //reset(_cloneDeep(formInitialState));
                // let reloadCount = parseInt(sessionStorage.getItem('reloadCount'));
                // if (reloadCount === 0) {
                //     window.location.reload();
                //     sessionStorage.removeItem('reloadCount');
                // }
            }
            } catch (error) {
                finishEditSkeleton();
                throw error;
            }

            if (didBind) {
                if (editEmailApiSettledRef.current) {
                    finishEditSkeleton();
                } else {
                    pendingEditSkeletonFinishRef.current = true;
                }
            }
        };

        fetchEditEmail();
    }, [campaignDetails, location, shouldFetchEditEmail, finishEditSkeleton, needsEditEmailApi]);
    useEffect(() => {
        if (!emailFooter?.length || !campaignDetails?.content?.length) return;

        const { isSplitAB, content } = campaignDetails;

        if (!isSplitAB) {
            const matchFooter = _find(emailFooter, { emailfooterId: content[0]?.footerId });
            if (matchFooter) {
                setValue('sampleEmailFooter', matchFooter);
            }
        } else {
            content.forEach((item) => {
                const matchFooter = _find(emailFooter, { emailfooterId: item?.footerId });
                if (matchFooter) {
                    setValue(`split${item.splitType}.sampleEmailFooter`, matchFooter);
                }
            });
        }
    }, [campaignDetails, emailFooter, location]);

    useEffect(() => {
        const fetchAudience = async () => {
            const { targetListTargetAudience } = campaignDetails;
            await handleAudienceInEdit(targetListTargetAudience);
            if (filterAudienceList?.length) {
                editBindAuidenceRef.current = true;
                reset((formState) => ({
                    ...formState,
                    audience: filterAudienceList,
                }));
            }
        };

        if (
            Object.keys(campaignDetails)?.length &&
            !editBindAuidenceRef?.current &&
            _get(location, 'campaignType', 'S') === 'S'
        ) {
            // fetchAudience();
        }
    }, [campaignDetails, editBindAuidenceRef, filterAudienceList]);

    const [smtpDomainListData, setSmtpDomainListData] = useState({
        domainList: [],
    });

    useEffect(() => {
        if (!_isEmpty(campaignDetails) && savedChannel && location) {
            const { senderEmail, senderName, replyEmail } = campaignDetails;
            const domain = senderEmail ? senderEmail?.split('@')[1] : '';
            const domainName = _find(domainNameList, ['domainName', domain]);
            const senderUserName = senderEmail ? senderEmail?.split('@')?.[0] : '';
            const replyMail = replyEmail ? replyEmail?.split('@')?.[0] : '';
            const alternateDomainName = replyEmail ? replyEmail?.split('@')[1] : '';
            const alternateDomain = _find(domainNameList, ['domainName', alternateDomainName]);
            setValue('SenderemailUsername', senderUserName);
            setValue('SenderemailDomain', domainName);
            setValue('senderName', senderName);
            setValue('alternateEmailIdText', replyEmail);
            setValue('alternateEmailDomain', alternateDomain);
            setValue('alternateEmailName', replyMail);
        } else {
            if (!_isEmpty(domainNameList) && location) {
                const lastDomain = domainNameList?.[domainNameList?.length - 1] || {};
                const { senderEmailID, senderName } = lastDomain;
                const senderEmail = senderEmailID ? senderEmailID?.split('@')?.[0] : '';
                const senderUserName = senderName || '';
                setValue('SenderemailUsername', senderEmail);
                setValue('SenderemailDomain', lastDomain);
                setValue('senderName', senderUserName);
            }
        }
    }, [campaignDetails, domainNameList, location]);

    // useEffect(() => {
    //     // if (smtpSettings?.length) {
    //     //     const email = _get(smtpSettings[0], 'smtpMail', '');
    //     //     setValue('senderEmailAddress', email);
    //     // }
    //     if (senderid_email?.length) {
    //         console.log('senderName: ', senderid_email);
    //         const email = _get(senderid_email[0], 'senderEmailId', '');
    //         setValue('senderEmailAddress', email);
    //         const emailsenderName = _get(senderid_email[0], 'senderName', '');
    //         setValue('senderName', emailsenderName);
    //     }
    // }, [smtpSettings, senderid_email]);

    useEffect(() => {
        if (!isDirty && Object.keys(dirty)?.length > 0) {
            dispatch(updateDirtyState(true));
        } else if (isDirty && Object.keys(dirty)?.length === 0) {
            dispatch(updateDirtyState(false));
        }
    }, [dirty]);

    useEffect(() => {
        if (!isSplitABEnable && splitTest) {
            disableSplitTabs();
        }
    }, [isSplitABEnable]);

    useEffect(() => {
        if (
            checkTrigger(location?.campaignType, location?.endDate) ||
            !statusIdCheck(Object.keys(campaignDetails)?.length > 1 ? campaignDetails?.content[0]?.statusId : null, location?.campaignType, campaignDetails) ||
            checkRFAApproved(
                Object.keys(campaignDetails)?.length > 1 ? campaignDetails?.content[0]?.statusId : null,
                campaignDetails?.requestForApproval?.approvarList,
            )
        ) {
            setIsClickOff(true);
        } else {
            setIsClickOff(false);
        }
    }, [location?.campaignType, location?.endDate, campaignDetails?.content?.[0]?.statusId]);
    useEffect(() => {
        if (mCampType === 'M' && isClickOff) {
            setDisableNext(false);
        } else {
            setDisableNext(true);
        }
    }, [isClickOff]);
    function disableSplitTabs(split = true) {
        reset(
            (formState) => ({
                ...formState,
                splitscehdule: {
                    autoSchedule: false,
                    communicationPerformanceBy: 'SubjectLine',
                    duration: '',
                    time: 'Hour(s)',
                },
                splitTest: !split,
                splitA: {
                    ..._cloneDeep(refreshSplitABFields),
                },
                splitB: {
                    ..._cloneDeep(refreshSplitABFields),
                },
                splitC: {
                    ..._cloneDeep(refreshSplitABFields),
                },
                splitD: {
                    ..._cloneDeep(refreshSplitABFields),
                },
            }),
            {
                keepDirty: true,
            },
        );
        dispatchState({
            type: 'UPDATE_SPLITAB',
            payload: { splitList: ['splitA', 'splitB'], splitModal: false, currentSplitTab: 0, splitABCount: {} },
        });
        const updateInitialSplitABState = INITIAL_SPLIT_AB_STATE.map((split) => {
            if (split.id === 'splitB' && !split.add) {
                return {
                    ...split,
                    add: circle_plus_medium,
                };
            } else {
                return split;
            }
        });
        setSplitAB(updateInitialSplitABState);
    }

    const updateTabChange = (temp) => {
        const newSplitTabs = _map(temp, 'id');
        dispatchState({
            type: 'UPDATE_TAB_CHANGE',
            payload: {
                currentSplitTab: temp?.length - 1,
                splitTabList: newSplitTabs,
            },
        });

        if (splitTest && newSplitTabs.length >= 2 && calucateAudienceCount > 0) {
            const defaultSplittedCount = calculateDefaultSplittedCount(
                newSplitTabs.length,
                calucateAudienceCount,
                newSplitTabs,
            );
            dispatchState({
                type: 'UPDATE_SLIDER',
                payload: {
                    splitABCount: defaultSplittedCount,
                    showSlider: false,
                },
            });
        } else {
            dispatchState({
                type: 'UPDATE_SLIDER',
                payload: {
                    splitABCount: {},
                    showSlider: false,
                },
            });
        }
    };

    const onAddTab = (index) => {
        const getSplitName = { ...SPLIT_AB_NAME[index] };
        const temp = [...splitAB];
        delete temp[temp?.length - 1].add;
        delete temp[temp?.length - 1].remove;
        temp.push({
            ...getSplitName,
            component: () => (
                <SplitABTab
                    fieldName={getSplitName.id}
                    key={getSplitName.id}
                    campaignType={campaign?.campaignType}
                    isSubjectLineEnable={disableSubjectLine}
                    isClickOff={isClickOff}
                />
            ),
            remove: circle_minus_fill_medium,
        });
        setSplitAB(temp);
        updateTabChange(temp);
        setValue('currentSplitTab', index);
    };

    const onRemoveTab = () => {
        // index > 1 && total?.length - 1 === index &&
        const temp = [...splitAB];
        const removedItem = temp.pop();
        resetField(removedItem.id);
        temp[temp?.length - 1] = {
            ...temp[temp?.length - 1],
            add: circle_plus_medium,
            ...(temp?.length >= 3 && { remove: circle_minus_fill_medium }),
        };
        reset(
            (formState) => ({
                ...formState,
                [removedItem?.id]: {
                    ..._cloneDeep({ ...refreshSplitABFields, subjectLine: '' }),
                },
            }),
            {
                keepDirty: true,
            },
        );
        setSplitAB(temp);
        updateTabChange(temp);
        setEmptySplitDate({
            text: '',
        });
        setValue('currentSplitTab', temp?.length - 1);
    };

    const checkFieldInSplitTabs = (formData, fieldPath, checkCallback = null) => {
        if (formData.splitTest) {
            const tabsToCheck = splitTabList && splitTabList.length > 0 ? splitTabList : ['splitA', 'splitB'];
            for (const tab of tabsToCheck) {
                const fieldValue = _get(formData, `${tab}.${fieldPath}`, null);
                if (checkCallback) {
                    if (checkCallback(fieldValue, formData, tab)) {
                        return true;
                    }
                } else {
                    if (fieldValue) {
                        return true;
                    }
                }
            }
            return false;
        } else {
            const fieldValue = _get(formData, fieldPath, null);
            if (checkCallback) {
                return checkCallback(fieldValue, formData, null);
            } else {
                return !!fieldValue;
            }
        }
    };

    const checkEmailFooterEnabled = (formData) => {
        if (formData.splitTest) {
            const tabsToCheck = splitTabList && splitTabList.length > 0 ? splitTabList : ['splitA', 'splitB'];
            for (const tab of tabsToCheck) {
                const emailFooter = _get(formData, `${tab}.emailFooter`, false);
                if (!emailFooter) {
                    return false;
                }
            }
            return true;
        } else {
            return _get(formData, 'emailFooter', false);
        }
    };

    const checkUnsubscribeDuplicate = (formData) => {
        let hasUnsubscribeInEditor = false;
        let hasUnsubscribeInFooter = false;
        let footerContent = '';

        if (formData.splitTest) {
            const tabsToCheck = splitTabList && splitTabList.length > 0 ? splitTabList : ['splitA', 'splitB'];
            for (const tab of tabsToCheck) {
                const tabCurrentPage = _get(formData, `${tab}.currentPage`, null);
                const isRichTextTab = tabCurrentPage === 0;

                if (!isRichTextTab) {
                    continue;
                }

                const editorText = _get(formData, `${tab}.editorText`, '');
                const emailFooter = _get(formData, `${tab}.emailFooter`, false);
                const sampleEmailFooter = _get(formData, `${tab}.sampleEmailFooter`, null);

                if (
                    editorText &&
                    (editorText.includes('{{#UNSUB}}') || editorText.toLowerCase().includes('unsubscribe'))
                ) {
                    hasUnsubscribeInEditor = true;
                }

                if (emailFooter && sampleEmailFooter) {
                    footerContent = _get(sampleEmailFooter, 'emailFooterRawcode', '');
                    if (footerContent && footerContent.toLowerCase().includes('unsubscribe')) {
                        hasUnsubscribeInFooter = true;
                        break;
                    }
                }
            }
        } else {
            const currentPage = formData.currentPage;
            const isRichTextTab = currentPage === 0;

            if (!isRichTextTab) {
                return false;
            }

            const editorText = _get(formData, 'editorText', '');
            const emailFooter = _get(formData, 'emailFooter', false);
            const sampleEmailFooter = _get(formData, 'sampleEmailFooter', null);

            if (editorText && (editorText.includes('{{#UNSUB}}') || editorText.toLowerCase().includes('unsubscribe'))) {
                hasUnsubscribeInEditor = true;
            }

            if (emailFooter && sampleEmailFooter) {
                footerContent = _get(sampleEmailFooter, 'emailFooterRawcode', '');
                if (footerContent && footerContent.toLowerCase().includes('unsubscribe')) {
                    hasUnsubscribeInFooter = true;
                }
            }
        }
        return hasUnsubscribeInEditor && hasUnsubscribeInFooter;
    };

    //TODO {Samben}: Need to Validate the logic again as per new changes
    async function formSubmitHandler(
        formState,
        type = 'form',
        isSchedule,
        locationsplit = '',
        proceedWithoutSchedule = false,
        passportId = '',
        isNewFooterCreation = false,
    ) {
        beginSubmit(getAuthoringSaveButtonType(type));
        const shouldRefreshEmailAfterSave = ['test preview', 'live', 'request for approval'].includes(type);
        if (shouldRefreshEmailAfterSave) {
            skipEditEmailFetchRef.current = true;
        }
        try {
        const utcTimeResponse = await dispatch(getUtcTimeNow(false));
        const currentUtcTimeData = utcTimeResponse || utcTimeData;
        const userKeyPersonInfo = userKeyInfo?.filter((e) => e.userId === userId);
        let statusId = Object.keys(campaignDetails)?.length > 1 ? campaignDetails?.content?.[0]?.statusId : null;

        if (
            location?.campaignType !== 'T' &&
            (!levelNumber || levelNumber < 2) &&
            validatePastPlanDurationOnSubmit({
                location,
                formState,
                setError,
                currentUtcTime: currentUtcTimeData?.utcTime,
                splitTest: formState?.splitTest,
                splitTabList,
            })
        ) {
            return;
        }

        if (!isClickOff) {
            if (type !== 'test preview') {
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
                let schedulerName = splitTest ? `${splitAB?.[state.currentSplitTab]?.id}.schedule`
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
            const mandatoryFields = ['subjectLine', 'schedule'];
            const textMandtoryFields = [...mandatoryFields, 'editorText'];
            const importMandatory = [...mandatoryFields];
            const temporarySubjectLine = [];
            let errorIndex, errorField;
            // console.log('forStste ::: ', formState);
            //Split A/B Scenario
            if (formState.splitTest) {
                const tempSplitTabsList = [...splitTabList];
                let nullCount = 0;
                let scheduleAll = [];
                for (let i = 0; i < tempSplitTabsList?.length; i++) {
                    // console.log('Split tabs ::::: list ::::::::::: ', tempSplitTabsList, formState);
                    let {
                        currentPage = null,
                        tabErrorText,
                        viewInbrowser,
                        sampleEmailFooter,
                        sendTimeRecommendation,
                        schedule,
                        contentInput,
                        importUrl,
                        zipFile,
                        ...currentTab
                    } = formState[tempSplitTabsList[i]];
                    // console.log('Split tab :::::::::: ', formState, tempSplitTabsList);
                    // if (currentTab === null) {
                    //     // console.log('Check asdasd', formState[`split${splitObj[i]}`]);
                    //     setError(`${tempSplitTabsList[i]}.tabErrorText`, {
                    //         type: 'custom',
                    //         message: 'Select content type to proceed',
                    //     });
                    //     trigger();
                    //     audienceRef.current.scrollIntoView({
                    //         behavior: 'smooth',
                    //     });
                    //     return;
                    // } else if (contentInput === 'import') {
                    //     if (importType === 'url' && importUrl === '') {
                    //         setError(`${tempSplitTabsList[i]}.importUrl`, {
                    //             type: 'custom',
                    //             message: 'Enter Communication URL',
                    //         });
                    //         setFocus('editorText');
                    //         return;
                    //     } else if (importType === 'import' && Object.keys(zipFile)?.length === 0 && !edmContent) {
                    //         setError(`${tempSplitTabsList[i]}.zipFile`, {
                    //             type: 'custom',
                    //             message: 'Select a file to proceed',
                    //         });
                    //         setFocus('editorText');
                    //         return;
                    //     }
                    // }
                    if (currentPage !== null && currentPage !== undefined && currentTab !== undefined) {
                        if (
                            currentPage === 0 &&
                            (currentTab['editorText'] === undefined || currentTab['editorText']?.length <= 7)
                        ) {
                            setError(`${tempSplitTabsList[i]}.editorText`, {
                                type: 'custom',
                                message: ENTER_EDITOR_TEXT,
                            });
                            dispatchState({
                                type: 'UPDATE',
                                payload: i,
                                field: 'currentSplitTab',
                            });
                            audienceRef.current.scrollIntoView({
                                behavior: 'smooth',
                            });
                            return;
                        }
                        for (const key in currentTab) {
                            const currentValue = currentTab[key];
                            if (currentPage === 0) {
                                if (key === 'editorText' && currentValue?.length <= 7) {
                                    //if (textMandtoryFields.includes(key) && (currentValue === '' || !currentValue)) {
                                    errorIndex = i;
                                    errorField = key;
                                    if (key === 'editorText' && currentValue?.length <= 7) {
                                        setError(`${tempSplitTabsList[i]}.editorText`, {
                                            type: 'custom',
                                            message: ENTER_EDITOR_TEXT,
                                        });
                                    }
                                    break;
                                }

                                if (key === 'subjectLine') {
                                    if (temporarySubjectLine.includes(currentValue)) {
                                        errorIndex = i;
                                        errorField = key;
                                        setError(`${tempSplitTabsList[i]}.subjectLine`, {
                                            type: 'custom',
                                            message: SUBJECTLINE_SHOULD_NOT_BE_SAME,
                                        });
                                    } else {
                                        temporarySubjectLine.push(currentValue);
                                    }
                                }
                            } else if (currentPage === 1) {
                                if (currentTab['importType'] === '' || currentTab['importType'] === undefined) {
                                    errorIndex = i;
                                    errorField = key;
                                    setError(`${tempSplitTabsList[i]}.zipFile`, {
                                        type: 'custom',
                                        message: SELECT_ZIPFILE_URL,
                                    });
                                    break;
                                } else if (
                                    currentTab['importType'] === 'import' &&
                                    currentTab['edmContent']?.length === 0
                                ) {
                                    errorIndex = i;
                                    errorField = key;
                                    setError(`${tempSplitTabsList[i]}.zipFile`, {
                                        type: 'custom',
                                        message: SELECT_ZIPFILE_URL,
                                    });
                                    break;
                                } else if (
                                    key === 'importUrl' &&
                                    currentTab['importType'] === 'url' &&
                                    !currentTab['importUrl']?.length
                                ) {
                                    errorIndex = i;
                                    errorField = key;
                                    setError(`${tempSplitTabsList[i]}.importUrl`, {
                                        type: 'custom',
                                        message: SELECT_IMPORT_URL,
                                    });
                                    break;
                                }
                                //  else if (
                                //     key === 'zipFile' &&
                                //     currentTab['importType'] === 'import' &&
                                //     !currentTab['zipFile']?.length
                                // ) {
                                //     errorIndex = i;
                                //     errorField = key;
                                //     setError(`${tempSplitTabsList[i]}.zipFile`, {
                                //         type: 'custom',
                                //         message: 'Select ZipFile Url to proceed',
                                //     });
                                //     break;
                                // }
                                else if (importMandatory.includes(key) && (currentValue === '' || !currentValue)) {
                                    errorIndex = i;
                                    errorField = key;
                                    break;
                                }
                            } else if (currentPage === 2) {
                                if (key === 'subjectLine') {
                                    if (!currentValue) {
                                        errorIndex = i;
                                        errorField = key;
                                        setError(`${tempSplitTabsList[i]}.subjectLine`, {
                                            type: 'custom',
                                            message: ENTER_SUBJECT_LINE,
                                        });
                                    } else {
                                        temporarySubjectLine.push(currentValue);
                                    }
                                }
                                if (key === 'templateContent') {
                                    if (!currentValue || !formState[tempSplitTabsList[i]]?.templateContent) {
                                        errorIndex = i;
                                        errorField = key;
                                        setError(`${tempSplitTabsList[i]}.tabErrorText`, {
                                            type: 'custom',
                                            message: 'Select template to proceed',
                                        });
                                    }
                                }
                            }
                            // if (currentTab.unSubscription && !currentTab.unsubscriptionMessage) {
                            //     errorIndex = i;
                            //     errorField = key;
                            //     break;
                            // }
                        }
                    } else {
                        dispatchState({
                            type: 'UPDATE_TAB',
                            payload: {
                                splitTab: i,
                                errorTab: tempSplitTabsList[i],
                                // tabErrorText: 'Select content type to proceed',
                            },
                        });
                        setError(`${tempSplitTabsList[i]}.tabErrorText`, {
                            type: 'required',
                            message: SELECT_CONTENT_TYPE,
                        });
                        errorIndex = i;
                        audienceRef.current.scrollIntoView({
                            behavior: 'smooth',
                        });
                        setTimeout(() => {
                            trigger(`${tempSplitTabsList[errorIndex]}`);
                            setFocus(`${tempSplitTabsList[errorIndex]}.${errorField}`);
                        }, 100);
                        break;
                    }
                    if (errorIndex !== undefined) {
                        dispatchState({
                            type: 'UPDATE_TAB',
                            payload: {
                                splitTab: errorIndex,
                                errorTab: tempSplitTabsList[errorIndex],
                                tabErrorText: state.tabErrorText,
                            },
                        });
                        setTimeout(() => {
                            trigger(`${tempSplitTabsList[errorIndex]}`);
                            setFocus(`${tempSplitTabsList[errorIndex]}.${errorField}`);
                        }, 100);
                        audienceRef.current.scrollIntoView({
                            behavior: 'smooth',
                        });
                        return;
                    }
                    if (!schedule) {
                        scheduleAll.push(null);
                        nullCount++;
                    } else {
                        scheduleAll.push(true);
                    }
                }
                if (location?.campaignType !== 'T' && getTestType() !== 2 && !proceedWithoutSchedule) {
                    formTypeRef.current = type;
                    if (nullCount === tempSplitTabsList?.length) {
                        dispatchState({
                            type: 'UPDATE',
                            payload: true,
                            field: 'showSchedulerModal',
                        });
                        return;
                    } else {
                        for (var j = 0; j < scheduleAll?.length; j++) {
                            // If any one SplitAB schedule exists, SplitAB is mandatory.
                            let checkAllSplitNoSchedule = Object.values(scheduleAll)?.every((schedule) => !schedule);
                            if (scheduleAll[j] === null && !checkAllSplitNoSchedule) {
                                dispatchState({
                                    type: 'UPDATE',
                                    payload: j,
                                    field: 'currentSplitTab',
                                });
                                setError(`${tempSplitTabsList[j]}.schedule`, {
                                    type: 'custom',
                                    message: SELECT_A_SCHEDULE_TIME,
                                });
                                return;
                            } else if (scheduleAll[j]) {
                                if (j > 0) {
                                    const { adjustedStartDate, adjustedEndDate } = getTimezoneAdjustedDateRange(
                                        tempSplitTabsList[j],
                                        formState[tempSplitTabsList[j]]?.timezone,
                                    );
                                    const ScheduleStatus = checkScheduleDate(
                                        formState[tempSplitTabsList[j]]?.schedule,
                                        adjustedStartDate,
                                        adjustedEndDate,
                                    );
                                    if (
                                        diff_minutes(
                                            formState[tempSplitTabsList[j]].schedule,
                                            formState[tempSplitTabsList[j - 1]].schedule,
                                        ) < 5
                                    ) {
                                        setError(`${tempSplitTabsList[j]}.schedule`, {
                                            type: 'required',
                                            message: MINIMUM_DIFFERENCE_SPLITS,
                                        });
                                        dispatchState({
                                            type: 'UPDATE',
                                            payload: j,
                                            field: 'currentSplitTab',
                                        });
                                        return;
                                    } else {
                                        let scheduleError = campaignSchedule(
                                            formState[tempSplitTabsList[j]]?.schedule,
                                            formState[tempSplitTabsList[j]]?.timezone?.gmtOffset,
                                            statusId,
                                            currentUtcTimeData?.utcTime,
                                        );
                                        const { adjustedStartDate, adjustedEndDate } = getTimezoneAdjustedDateRange(
                                            tempSplitTabsList[j],
                                        );
                                        const ScheduleStatus = checkScheduleDate(
                                            formState[tempSplitTabsList[j]]?.schedule,
                                            adjustedStartDate,
                                            adjustedEndDate,
                                        );
                                        if (ScheduleStatus) {
                                            dispatchState({
                                                type: 'UPDATE',
                                                payload: j,
                                                field: 'currentSplitTab',
                                            });
                                            setError(`${tempSplitTabsList[j]}.schedule`, {
                                                type: 'custom',
                                                // message: 'Select a date and time later than ' + scheduleError + '.',
                                                message: CHECK_START_DATE_AND_END_DATE,
                                            });
                                            return;
                                        }
                                        // if (scheduleError !== undefined) {
                                        if (!scheduleError) {
                                            dispatchState({
                                                type: 'UPDATE',
                                                payload: j,
                                                field: 'currentSplitTab',
                                            });
                                            const cityTime = convertUserTimezoneToTarget(
                                                currentUtcTimeData?.utcTime
                                                    ? new Date(currentUtcTimeData.utcTime.replace('Z', ''))
                                                    : new Date(),
                                                '(GMT+00:00) ',
                                                formState[tempSplitTabsList[j]]?.timezone?.gmtOffset,
                                            );
                                            // Add 15 minutes to cityTime
                                            const cityTimeWithBuffer = new Date(cityTime);
                                            cityTimeWithBuffer.setMinutes(cityTimeWithBuffer.getMinutes() + 15);
                                            const formattedCityTime = cityTimeWithBuffer.toLocaleString();
                                            setError(`${tempSplitTabsList[j]}.schedule`, {
                                                type: 'required',
                                                message: `Select a date & time later than ${formattedCityTime}`,
                                                // message: 'Select a date and time later than ' + scheduleError + '.',
                                            });

                                            return;
                                        }
                                    }
                                } else {
                                    let scheduleError = campaignSchedule(
                                        formState[tempSplitTabsList[j]]?.schedule,
                                        formState[tempSplitTabsList[j]]?.timezone?.gmtOffset,
                                        statusId,
                                        currentUtcTimeData?.utcTime,
                                    );
                                    const { adjustedStartDate, adjustedEndDate } = getTimezoneAdjustedDateRange(
                                        tempSplitTabsList[j],
                                    );
                                    const ScheduleStatus = checkScheduleDate(
                                        formState[tempSplitTabsList[j]]?.schedule,
                                        adjustedStartDate,
                                        adjustedEndDate,
                                    );
                                    if (ScheduleStatus) {
                                        dispatchState({
                                            type: 'UPDATE',
                                            payload: j,
                                            field: 'currentSplitTab',
                                        });
                                        setError(`${tempSplitTabsList[j]}.schedule`, {
                                            type: 'custom',
                                            // message: 'Select a date and time later than ' + scheduleError + '.',
                                            message: CHECK_START_DATE_AND_END_DATE,
                                        });
                                        return;
                                    }
                                    // if (scheduleError !== undefined) {
                                    if (!scheduleError) {
                                        dispatchState({
                                            type: 'UPDATE',
                                            payload: j,
                                            field: 'currentSplitTab',
                                        });
                                        const cityTime = convertUserTimezoneToTarget(
                                            currentUtcTimeData?.utcTime
                                                ? new Date(currentUtcTimeData.utcTime.replace('Z', ''))
                                                : new Date(),
                                            '(GMT+00:00) ',
                                            formState[tempSplitTabsList[j]]?.timezone?.gmtOffset,
                                        );
                                        // Add 15 minutes to cityTime
                                        const cityTimeWithBuffer = new Date(cityTime);
                                        cityTimeWithBuffer.setMinutes(cityTimeWithBuffer.getMinutes() + 15);
                                        const formattedCityTime = cityTimeWithBuffer.toLocaleString();
                                        setError(`${tempSplitTabsList[j]}.schedule`, {
                                            type: 'required',
                                            message: `Select a date & time later than ${formattedCityTime}`,
                                            // message: 'Select a date and time later than ' + scheduleError + '.',
                                        });

                                        return;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            //SplitTest Error Validtion
            if (errorIndex !== undefined) {
                return;
            }
            //If Not SplitA/B Just need to confirm Whether can proceed without scedule
            //NON SplitA/B Scenario and Scedule is selected
            if (!formState.splitTest) {
                const { currentPage, editorText, importUrl, importType, zipFile } = formState;
                if (currentPage !== null && currentPage !== undefined) {
                    // if (currentPage === 0 && editorText !== undefined ? editorText?.length <= 7 : true) {
                    if (
                        currentPage === 0 &&
                        (editorText === '' || editorText === undefined || editorText?.length <= 7)
                    ) {
                        setError(`editorText`, {
                            type: 'custom',
                            message: ENTER_EDITOR_TEXT,
                        });
                        audienceRef.current.scrollIntoView({
                            behavior: 'smooth',
                        });
                        return;
                    } else if (currentPage === 1) {
                        if (formState?.defaultValues?.importType === '') {
                            errorIndex = i;
                            errorField = key;
                            return;
                        } else if (
                            // key === 'importUrl' &&
                            formState?.importType === 'url' &&
                            !formState?.importUrl?.length
                        ) {
                            setError(`importUrl`, {
                                type: 'custom',
                                message: SELECT_IMPORT_URL,
                            });
                            return;
                        } else if (
                            formState?.importType === 'import' &&
                            formState?.edmContent?.length === 0
                            //||(formState?.importType === 'import' && !formState?.zipFile?.length)
                        ) {
                            setError(`zipFile`, {
                                type: 'custom',
                                message: SELECT_ZIPFILE_URL,
                            });
                            return;
                        }
                    }
                } else {
                    setError(`tabErrorText`, {
                        type: 'custom',
                        message: SELECT_CONTENT_TYPE,
                    });
                    trigger();
                    audienceRef.current.scrollIntoView({
                        behavior: 'smooth',
                    });
                    return;
                }
            }

            // formTypeRef.current = null;
            if (
                (location?.campaignType === 'S' && type !== 'test preview' && type !== 'live') ||
                (location?.campaignType === 'M' && dataSource === 'TL')
            ) {
                if (!formState.splitTest && !formState.schedule && isSchedule && levelNumber < 2) {
                    formTypeRef.current = type;
                    if (isNewFooterCreation) {
                        formState = {
                            ...campaignDetails,
                            ...formState,
                            ...campaign,
                            splitABCount: state.splitABCount,
                            splitTabList: splitTabList,
                            isSendTestMail: getTestType(),
                            clientId,
                            userId,
                            departmentId,
                            userKeyPersonInfo,
                            passportId,
                            tempcampaignDetails,
                            // edmContent: document.querySelector('iframe')?.contentDocument?.childNodes[1]?.innerHTML,
                            campaignId: locationsplit?.campaignId ? locationsplit?.campaignId : tempCampaignID,
                            ...(campaign['campaignType'] === 'M' && mdcContentSetupDetails),
                        };

                        const payload = buildPayload(formState, checkSpam, '', location);
                        syncSenderDetailsBeforeSave();
                        const { status, data, message } = await runSave(getAuthoringSaveButtonType(type), () =>
                            dispatch(saveEmailCampaign({ payload, savedChannelsId, loading: false })),
                        );
                        if (status) {
                            const selectedAudience = formState?.audience ?? [];
                            dispatch(updateChannelAudiences(mergeChannelAudiences('Email', selectedAudience, channelAudiences)));
                        }
                        return true;
                    } else {
                        if (formState?.currentPage === 2) {
                            if (!formState?.templateContent) {
                                setError(`tabErrorText`, {
                                    type: 'custom',
                                    message: SELECT_TEMPLATE,
                                });
                                setFocus('subjectLine');
                                return;
                            }
                        } else if(!proceedWithoutSchedule) {
                            dispatchState({
                                type: 'UPDATE',
                                payload: true,
                                field: 'showSchedulerModal',
                            });
                            return;
                        }
                    }
                } else {
                    if (!formState.splitTest && isSchedule && levelNumber < 2) {
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
                        let scheduleError = campaignSchedule(
                            formState?.schedule,
                            formState?.timezone?.gmtOffset,
                            statusId,
                            currentUtcTimeData?.utcTime,
                        );
                        // console.log('scheduleError: ', scheduleError);
                        // if (scheduleError !== undefined) {
                        if (!scheduleError) {
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

            // console.log('type: ', type);
            function getTestType() {
                let testType = 0;
                if ((type === 'form' || type === 'save') && !formState?.approvalList?.requestApproval) testType = 0;
                else if (type === 'request for approval') testType = 1;
                else if (type === 'test preview') testType = 2;
                else if (type === 'live') testType = 4;
                else if (formState?.approvalList?.requestApproval) testType = 1;

                testType = formState?.approvalList?.requestApproval && type === 'form' ? 1 : testType;
                return testType;
            }

            dispatch(
                updateEmail({
                    ...formState,
                    sliderConfig: state.splitABCount,
                    isAlternateEmailInput: state.isAlternateEmailInput,
                    splitTabList: splitTabList,
                    isScheduled: state.proceedWithoutSchedule,
                }),
            );
            // console.log('formStateformState', formState);
            formState = {
                ...campaignDetails,
                ...formState,
                ...campaign,
                splitABCount: state.splitABCount,
                splitTabList: splitTabList,
                isSendTestMail: getTestType(),
                clientId,
                userId,
                departmentId,
                userKeyPersonInfo,
                passportId,
                tempcampaignDetails,
                // edmContent: document.querySelector('iframe')?.contentDocument?.childNodes[1]?.innerHTML,
                campaignId: locationsplit?.campaignId ? locationsplit?.campaignId : tempCampaignID,
                dynamiclistId: campaign['campaignType'] === 'T' ? _get(location, 'dynamicListId', 0) : 0,
                ...(campaign['campaignType'] === 'M' && mdcContentSetupDetails),
            };
            // console.log('campaign ID: ', locationsplit?.campaignId ? locationsplit?.campaignId : location?.campaignId);
            if (
                formState?.schedule !== '' &&
                formState?.schedule !== null &&
                location?.campaignType !== 'T' &&
                dataSource === 'TL' &&
                (!levelNumber || levelNumber < 2)
            ) {
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
                let scheduleError = campaignSchedule(
                    formState?.schedule,
                    formState?.timezone?.gmtOffset,
                    statusId,
                    currentUtcTimeData?.utcTime,
                );
                if (!scheduleError) {
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
            const payload = buildPayload(formState, checkSpam, '', location);
            setIsTestMail(type === 'test preview');
            syncSenderDetailsBeforeSave();
            const {
                status,
                data,
                message = EXCEPTION_OCCURRED,
            } = await runSave(getAuthoringSaveButtonType(type), () =>
                dispatch(saveEmailCampaign({ payload, savedChannelsId, loading: false })),
            );
            setSaveCampaigData(data);
            if (status) {
                dispatch(updateMDCEditMode('edit'));
                const selectedAudience = formState?.audience ?? [];
                dispatch(updateChannelAudiences(mergeChannelAudiences('Email', selectedAudience, channelAudiences)));
            }
            if (status && getTestType() !== 0) {
                setValue('savedChannelResponseDetailId', edmChannelId ?? 0);
                await dispatch(
                    getEmailCommunicationById({
                        payload: {
                            clientId,
                            userId,
                            departmentId,
                            levelNumber,
                            actionId,
                            campaignId: formState?.campaignId, //location?.campaignId,
                            edmChannelId: edmChannelId,
                        },
                        ...(getTestType() === 2 && {
                            testCampaignPayload: {
                                testCampaignEmailAddress: payload.testCampaignEmailAddress,
                            },
                        }),
                        loading: false,
                    }),
                );
            } else {
                if (!status) {
                    dispatchState({
                        type: 'UPDATE',
                        payload: true,
                        field: 'isTestMailSent',
                    });

                    dispatchState({
                        type: 'UPDATE',
                        payload: message || '',
                        field: 'requestFalse',
                    });
                    setTimeout(() => {
                        dispatchState({
                            type: 'UPDATE',
                            payload: false,
                            field: 'isTestMailSent',
                        });

                        dispatchState({
                            type: 'UPDATE',
                            payload: false,
                            field: 'requestFalse',
                        });
                    }, 5000);
                    return;
                }
            }
            if (type === 'request for approval' || getTestType() === 1) {
                if (status) {
                    // Clear dirty state after successful save while keeping form values
                    reset(getValues(), { keepValues: true });
                    dispatch(updateDirtyState(false));

                    dispatchState({
                        type: 'UPDATE',
                        payload: true,
                        field: 'isTestMailSent',
                    });
                    dispatchState({
                        type: 'UPDATE',
                        payload: true,
                        field: 'rfaMsg',
                    });
                    if (rfaAutoNavTimeoutRef.current) clearTimeout(rfaAutoNavTimeoutRef.current);
                    rfaManuallyClosedRef.current = false;
                    rfaAutoNavTimeoutRef.current = setTimeout(() => {
                        if (rfaManuallyClosedRef.current) return;
                        dispatchState({
                            type: 'UPDATE',
                            payload: false,
                            field: 'isTestMailSent',
                        });
                        dispatchState({
                            type: 'UPDATE',
                            payload: false,
                            field: 'rfaMsg',
                        });
                        if (campaign.campaignType === 'M') {
                            handleMdcNavigation({ data });
                        } else {
                            handleNavigation();
                        }
                    }, 5000);
                }
            } else if (type === 'form' || type === 'save') {
                if (status) {

                    if (campaign.campaignType === 'M') {
                        handleMdcNavigation({ data });
                    } else if (type === 'save') {
                        dispatchState({
                            type: 'RESET',
                        });
                        dispatch(resetCreateCommunication());
                        navigate('/communication', {
                            index: 0,
                        });
                    } else {
                        handleNavigation();
                    }
                }
            } else {
                if (status) {
                    // Clear dirty state after successful save while keeping form values
                    reset(getValues(), { keepValues: true });
                    dispatch(updateDirtyState(false));

                    dispatchState({
                        type: 'UPDATE',
                        payload: true,
                        field: 'isTestMailSent',
                    });
                    dispatchState({
                        type: 'UPDATE',
                        payload:
                            type === 'test preview'
                                ? TEST_PREVIEW_SENT
                                : type === 'live'
                                    ? LIVE_PREVIEW_SENT
                                    : '',
                        field: 'testSentCommunicationModal',
                    });
                } else {
                    dispatchState({
                        type: 'UPDATE',
                        payload: true,
                        field: 'isTestMailSent',
                    });
                    dispatchState({
                        type: 'UPDATE',
                        payload: message || '',
                        field: 'testSentCommunicationModal',
                    });
                    dispatchState({
                        type: 'UPDATE',
                        payload: message || '',
                        field: 'requestFalse',
                    });
                }
                setTimeout(() => {
                    dispatchState({
                        type: 'UPDATE',
                        payload: false,
                        field: 'isTestMailSent',
                    });
                    dispatchState({
                        type: 'UPDATE',
                        payload: false,
                        field: 'testSentCommunicationModal',
                    });
                    dispatchState({
                        type: 'UPDATE',
                        payload: false,
                        field: 'requestFalse',
                    });
                }, 5000);

                //isTestMailSent
            }
        } else {
            if (campaign.campaignType === 'M') {
                handleMdcNavigation({ data });
            } else if (type === 'save') {
                if (formState?.isCGTGEnabled) {
                    let url = '/communication/execute';
                    const encryptState = encodeUrl(location);
                    navigate(`${url}?q=${encryptState}`, {
                        state: location,
                    });
                } else {
                    navigate('/communication', {
                        index: 0,
                    });
                }
            } else {
                handleNavigation();
            }
        }
        } finally {
            skipEditEmailFetchRef.current = false;
            endSubmit();
        }
    }

    const value = useMemo(
        () => ({
            tabErrorText: state.tabErrorText,
            currentSplitTab: state.currentSplitTab,
            dispatchState,
            formSubmitHandler,
            isClickOff: isClickOff,
        }),
        [state.tabErrorText, state.currentSplitTab, isClickOff],
    );
    const handleNavigation = () => {
        dispatch(updateEmailList({ data: {}, field: 'campaignDetails' }));
        window.scrollTo(0, 0);
        const tabIndex = tabEmailState.currentIndex + 1;
        const handleVertcialNextTab = () => {
            const nextChannel = communicationChannels.find(
                (chan, index) => channelType !== chan && Object.hasOwn(activeTabs, chan) && index > currentTab,
            );
            if (!!nextChannel) {
                dispatch(
                    updateVerticalTab({
                        tabs: activeTabs?.[nextChannel] || {
                            type: 'messaging',
                            currentTab: 1,
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

        const nextEmailTabIndex = getNextEligibleTabIndex({
            startIndex: tabIndex,
            campaignType: location?.campaignType,
            eligibleChannelIds: location?.eligibleChannelType?.[0] || [],
            availableTabList: availableTabs['email'],
            tabChannelMap: EMAIL_TAB_CHANNEL_MAP,
        });

        if (availableTabs['email']?.length === nextEmailTabIndex) {
            handleVertcialNextTab();
        } else {
            dispatch(
                updateTab({
                    field: 'email',
                    data: {
                        tabName: availableTabs['email'][nextEmailTabIndex],
                        currentIndex: nextEmailTabIndex,
                    },
                }),
            );
        }
    };

    const handleMdcNavigation = ({ data }) => {
        dispatch(updateEmailList({ data: {}, field: 'campaignDetails' }));
        reset({});
        const { edmChannelId: channelResponseDetailId } = data;
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
        dispatch(updateEmailList({ data: {}, field: 'campaignDetails' }));
        reset({});
        const mdcCanvasUrl = `/communication/mdc-workflow`;
        const state = { ...location };
        delete state.mdcContentSetupDetails;

        const encryptState = encodeUrl(state);
        navigate(`${mdcCanvasUrl}?q=${encryptState}`, {
            state,
        });
    };

    useEffect(() => {
        !splitTest &&
            setEmptySplitDate({
                text: '',
            });
    }, [splitTest]);

    const handleAutoScheduleModal = (error) => {
        if (Object.values(error)?.every((item) => item === false)) {
            dispatchState({
                type: 'UPDATE',
                payload: true,
                field: 'isShowScheduleModal',
            });
            setEmptySplitDate({
                text: '',
            });
        }
    };
    const getScheduleForTestPreview = (formState) => {
        //retain schedule date time when send test preview
        if (!formState.splitTest) {
            return formState.schedule;
        } else if (formState?.splitTest && formState?.splitTabList?.length) {
            let tmpSchedule = [];
            formState?.splitTabList.forEach((item) => {
                tmpSchedule = [...tmpSchedule, formState[item]['schedule']];
            });
            return tmpSchedule;
        }
    };

    const handleErrClose = () => {
        if (emailCommFail) {
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

    // useEffect(() => {
    //     if (filterAudienceList?.length) {
    //         setUpdateAudienceData((pre) => [...filterAudienceList, ...pre]);
    //     }
    // }, [filterAudienceList]);

    // useEffect(() => {
    //     setUpdateAudienceData([...audienceList]);
    // }, [audienceList]);

    const shouldDisableAutoRefresh = handleAutoRefreshClickOff(audience);
    useEffect(() => {
        if (shouldDisableAutoRefresh) {
            setValue('isAutoRefereshenabled', false);
        }
    }, [audience]);

    return (
        <FormProvider {...methods}>
            <AuthoringChannelEditSkeletonGate
                channelId={1}
                showEditSkeleton={showEditSkeleton}
                isSavedChannel={isSavedChannel}
            >
            <EmailProvider.Provider value={value}>
                <form
                    onSubmit={handleSubmit((data) => formSubmitHandler(data, 'form', true))}
                    className="rsv-tabs-content tab-content position-relative allow-copy"
                >
                    <div className={`box-design bd-top-border`}>
                        {/* {!smartLink1 && !tabSmartLink_Flag && ( */}
                        {!tabSmartLink_Flag && tabSmartLink_Flag !== null && !isClickOff && (
                            <SmartLinkEnable
                                onSave={() => dispatchState({ type: 'UPDATE', payload: false, field: 'isSmarkLink' })}
                                onReject={() => {
                                    dispatch(showTabsSmartlink(true));
                                    dispatchState({ type: 'UPDATE', payload: false, field: 'isSmarkLink' });
                                }}
                            />
                        )}
                        <div className="form-group mt20">
                            {/* BUG{SAM}: Pattern needs to be check it */}
                            <Row>
                                <Col sm={{ offset: 1, span: 2 }}>
                                    <label className="control-label-left">{SENDER_NAME}</label>
                                </Col>
                                <Col sm={6} className={` ${isClickOff ? 'pe-none click-off' : ''}`}>
                                    <RSInput
                                        control={control}
                                        id="rs_Email_senderName"
                                        name="senderName"
                                        placeholder={SENDER_NAME}
                                        required
                                        rules={{
                                            required: ENTER_SENDER_NAME,
                                            // validate: (data) => senderNameValidator(data, state.selectedSendername),
                                        }}
                                        isLoading={domainNameLoader.isLoading}
                                    // handleOnchange={(e) => {
                                    //     if (!e.target.value) {
                                    //         dispatchState({
                                    //             type: 'UPDATE',
                                    //             payload: '',
                                    //             field: 'selectedSendername',
                                    //         });
                                    //     }
                                    // }}
                                    // value={watch('senderName')}
                                    />
                                </Col>
                                <Col sm={1} className={`fg-icons-wrapper pl0 ${isClickOff ? 'pe-none click-off' : ''}`}>
                                    {/* <div className="fg-icons"> */}
                                    <div className="d-flex position-relative">
                                        {/* <RSTooltip text="Personalization"> */}
                                        {/* <RSKendoIconDropdown
                                                    data={personalization}
                                                    icon={` ${user_question_mark_medium} icon-md color-primary-blue cp`}
                                                    control={control}
                                                    dataItemKey={'dataAttributeId'}
                                                    textField={'key'}
                                                    name="sendernamePicker"
                                                    onItemClick={({ item }) => {
                                                        setValue('senderName', item.personalizationKey);
                                                        clearErrors('senderName');
                                                        dispatchState({
                                                            type: 'UPDATE',
                                                            payload: item.personalizationKey,
                                                            field: 'selectedSendername',
                                                        });
                                                    }}
                                                /> */}
                                        <Col sm={3} className="fg-icons-wrapper pl0 ">
                                            <div className="fg-icons d-flex top3">
                                                {/* <RSTooltip
                                                    text={'Add SMTP'}
                                                    className="h0 position-relative lh0"
                                                >
                                                    <i
                                                        onClick={() => {

                                                            navigate('/preferences/communication-settings', {
                                                                state: {
                                                                    tab: 0,
                                                                    subTab: 0,
                                                                    verticalTab: 0,
                                                                    mode: 'add',
                                                                    subfrom: 'WP',
                                                                    backAction: window.location.search,
                                                                    tabValueName: 'email',
                                                                    tabValue: 'email',
                                                                },
                                                            });
                                                        }}
                                                        id="rs_Messaging_Setting"
                                                        className={`${circle_plus_fill_edge_medium} icon-md color-primary-blue`}
                                                    />
                                                </RSTooltip> */}

                                                <RSBootstrapdown
                                                    onToggle={async (isOpen) => {
                                                        if (isOpen && (!personalization || personalization.length === 0)) {
                                                            await personalizationLoader.refetch({
                                                                fetcher: ({ payload } = {}) =>
                                                                    dispatch(getPersonalizationFields({ payload, loading: false })),
                                                                mode: savedChannel ? 'edit' : 'create',
                                                                loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
                                                                params: {
                                                                    payload: {
                                                                        departmentId,
                                                                        clientId,
                                                                        userId,
                                                                    },
                                                                },
                                                            });
                                                        }
                                                    }}
                                                    // data={personalization}
                                                    // icon={` ${user_question_mark_medium} icon-md color-primary-blue cp`}
                                                    data={personalizationLoader.isLoading ? [{ key: 'Loading...' }] : handlePersonalization(
                                                        personalization,
                                                        location?.audience?.length ? location?.audience : (watch('audience')?.length ? watch('audience') : audience),
                                                        listTypeWisePersonlization,
                                                    )}
                                                    alignRight={true}
                                                    flatIcon
                                                    isObject
                                                    fieldKey="key"
                                                    defaultItem={{
                                                        key: (
                                                            <RSTooltip text={'Personalization'} className="lh0">
                                                                <i
                                                                    id="rs_Email_personalization"
                                                                    className={`${user_question_mark_medium} icon-md`}
                                                                />
                                                            </RSTooltip>
                                                        ),
                                                    }}
                                                    control={control}
                                                    dataItemKey={'dataAttributeId'}
                                                    textField={'key'}
                                                    name="sendernamePicker"
                                                    className="no_caret"
                                                    onSelect={(data) => {
                                                        // Get sender name from RSInput
                                                        const personalizedSenderName = personalizationKey; // Concatenate sender name and personalized value
                                                        setValue('senderName', personalizedSenderName);
                                                        clearErrors('senderName');
                                                        dispatchState({
                                                            type: 'UPDATE',
                                                            payload: personalizedSenderName,
                                                            field: 'selectedSendername',
                                                        });
                                                    }}
                                                    showSearch
                                                />
                                                {/* <RSTooltip text={'Refresh'} className="lh0 " position="top">
                                                                                                    <i
                                                                                                        id="rs_data_refresh"
                                                                                                        className={`${refresh_medium} icon-md color-primary-blue`}
                                                                                                        onClick={() => {
                                                                                                            clearErrors();
                                                                                                            resetState()
                                                                                                        }}
                                                                                                    />
                                                                                                </RSTooltip> */}
                                            </div>
                                        </Col>

                                        {/* </RSTooltip> */}
                                        {/* </div> */}
                                    </div>
                                </Col>
                            </Row>
                        </div>
                        <div className="form-group">
                            <Row>
                                <Col sm={{ offset: 1, span: 2 }}>
                                    <label className="control-label-left">{SENDER_EMAIL_ADDRESS}</label>
                                </Col>
                                <Col sm={6} className={`${isClickOff ? 'pe-none click-off' : ''}`}>
                                    {/* <RSInput
                                        control={control}
                                        name="senderEmailAddress"
                                        placeholder={SENDER_EMAIL_ADDRESS}
                                        rules={EMAIL_RULES}
                                        id="rs_Email_senderEmailAddress"
                                        required
                                    /> */}
                                    <Row className="position-relative">
                                        <Col sm={6}>
                                            <RSInput
                                                control={control}
                                                name="SenderemailUsername"
                                                placeholder={SENDER_EMAIL_ADDRESS}
                                                required
                                                onKeyDown={charNumDotWithoutSpace}
                                                rules={{
                                                    required: ENTER_SENDEREMAILADDRESS,
                                                }}
                                                isLoading={domainNameLoader.isLoading}
                                            />
                                        </Col>
                                        <span className="emailDomain-symbol">@</span>

                                        <Col sm={6}>
                                            {/* Sender domain: custom footer row + filled plus (not NewAttributeFormBtn) */}
                                            <RSKendoDropDownList
                                                control={control}
                                                name="SenderemailDomain"
                                                dataItemKey="smtpDomainSettingId"
                                                textField="domainName"
                                                label={SELECT_DOMAIN_NAME}
                                                required
                                                isLoading={domainNameLoader.isLoading}
                                                rules={{
                                                    required: SELECT_DOMAIN_NAME_MSG,
                                                }}
                                                handleChange={(e) => {
                                                    const { senderName, senderUserName, domainName } = e.value || {};
                                                    setValue('senderName', senderName);
                                                    setValue('SenderemailUsername', senderUserName);
                                                    setValue('alternateEmailDomain', e.value);
                                                }}
                                                data={domainNameList}
                                                popupClass="email-sender-domain-dropdown"
                                                footer={
                                                    <div
                                                        className="d-flex align-items-center justify-content-between px-10 py-8 cp rs-kendo-footer-add-new"
                                                        onMouseDown={(e) => e.preventDefault()}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            navigate('/preferences/communication-settings', {
                                                                state: createCommunicationSettingsNavState('mail', {
                                                                        mode: 'add',
                                                                        subfrom: 'MP',
                                                                    mailTabId: MAIL_TAB_ID.SMTP,
                                                                        backAction: window.location.search,
                                                                        tabValueName: 'email',
                                                                        tabValue: 'email',
                                                                        from: 'email',
                                                                }, location, getValues),
                                                            });
                                                        }}
                                                    >
                                                        <span className="text-primary-blue">New domain</span>
                                                        <i
                                                            className={`${circle_plus_fill_medium} icon-md color-primary-blue`}
                                                            id="rs_email_domain_add_in_dropdown_footer"
                                                        />
                                                    </div>
                                                }
                                            />
                                        </Col>

                                        {/* Icon absolutely positioned next to the dropdown */}
                                    </Row>

                                    <RSCheckbox
                                        control={control}
                                        name="isReplyMailEnabled"
                                        labelName={REPLY_EMAIL}
                                        popover
                                        popover_icon={`${circle_question_mark_mini} icon-xs color-primary-blue`}
                                        popover_position="top"
                                        popover_content={SENDER_REPLY_EMAIL}
                                        handleChange={({ target: { checked } }) => {
                                            if (!checked) {
                                                setValue('alternateEmailId', smtpSettings[0]);
                                                setValue('alternateEmailDomain', getValues('SenderemailDomain'));
                                                setValue('alternateEmailName', '');
                                                clearErrors('alternateEmailId', '');
                                                setValue('alternateEmailIdText', '');
                                                clearErrors('alternateEmailIdText', '');
                                                dispatchState({
                                                    type: 'UPDATE',
                                                    payload: false,
                                                    field: 'isAlternateEmailInput',
                                                });
                                            } else {
                                                setValue('alternateEmailId', null);
                                                setValue('alternateEmailDomain', '');
                                                setValue('alternateEmailName', '');
                                            }
                                        }}
                                    />
                                </Col>
                            </Row>

                            {!isReplyMailEnabled && (
                                <Row>
                                    <Col sm={{ offset: 1, span: 2 }} className="mt30">
                                        <label className="control-label-left">{REPLY_EMAIL}</label>
                                    </Col>
                                    <Col
                                        sm={6}
                                        id="rs_Email_alternateemailid"
                                        className={`mt30 position-relative ${isClickOff ? 'pe-none click-off' : ''}`}
                                    >
                                        {' '}
                                        <div>
                                            {/* <Row className="position-relative">
                                            <Col sm={6}>
                                                <RSInput
                                                    control={control}
                                                    name="alternateEmailName"
                                                    placeholder={SENDER_EMAIL_ADDRESS}
                                                    required
                                                    rules={{
                                                        required: ENTER_SENDEREMAILADDRESS,
                                                    }}
                                                />
                                            </Col>
                                            <span className="emailDomain-symbol">@</span>

                                            <Col sm={6}>
                                                <RSKendoDropDownList
                                                    control={control}
                                                    name="alternateEmailDomain"
                                                    dataItemKey="smtpDomainSettingId"
                                                    textField="domainName"
                                                    label={SELECT_DOMAIN_NAME}
                                                    required
                                                    isLoading={domainNameLoader.isLoading}
                                                    rules={{
                                                        required: SELECT_DOMAIN_NAME_MSG,
                                                    }}
                                                    data={domainNameList}
                                                    onKeyDown={charNumDotWithoutSpace}
                                                    disabled
                                                />
                                            </Col>

                                        </Row> */}
                                            {false ? (
                                                <RSKendoDropDownList
                                                    control={control}
                                                    name={'alternateEmailId'}
                                                    data={[
                                                        ...senderid_email,
                                                        {
                                                            clientSMTPSenderId: 0,
                                                            senderEmailId: '',
                                                        },
                                                    ]}
                                                    dataItemKey={'clientSMTPSenderId'}
                                                    textField={'senderEmailId'}
                                                    label={'Alternate email'}
                                                    rules={EMAIL_RULES}
                                                    required
                                                    isCustomRender
                                                    itemRender={(props) =>
                                                        renderItem(props, () =>
                                                            dispatchState({
                                                                type: 'UPDATE',
                                                                payload: true,
                                                                field: 'isAlternateEmailInput',
                                                            }),
                                                        )
                                                    }
                                                />
                                            ) : (
                                                <Fragment>
                                                    <RSInput
                                                        control={control}
                                                        name="alternateEmailIdText"
                                                        id="rs_Email_alternateemailidText"
                                                        placeholder={REPLY_EMAIL}
                                                        rules={EMAIL_RULES}
                                                        handleOnBlur={(e) => {
                                                            if (!!e.target.value) {
                                                                setValue('alternateEmailId', e.target.value);
                                                            }
                                                        }}
                                                        required
                                                    />
                                                    {/* <i
                                                    className={`${close_mini} position-absolute top8 right16 zIndex2 color-primary-red`}
                                                    onClick={() => {
                                                        dispatchState({
                                                            type: 'UPDATE',
                                                            payload: false,
                                                            field: 'isAlternateEmailInput',
                                                        });
                                                        setValue('alternateEmailId', '');
                                                    }}
                                                    id="rs_Email_close"
                                                ></i> */}
                                                </Fragment>
                                            )}
                                        </div>
                                    </Col>
                                </Row>
                            )}
                        </div>
                        {campaign.campaignType !== 'T' && mCampType !== 'M' && (
                            <div className="form-group" ref={audienceRef}>
                                <AudienceFieldRenderComponent
                                    type={'email'}
                                    audienceList={audienceList}
                                    methods={methods}
                                    userDetails={{ departmentId, userId, clientId }}
                                    splitTabList={splitTabList}
                                    dispatchState={dispatchState}
                                    isAudienceLoading={audienceLoader.isLoading}
                                    children={
                                        <div className={`align-items-center d-flex justify-content-between`}>
                                            <span className={`${shouldDisableAutoRefresh ? 'click-off' : ''}`}>
                                                <RSCheckbox
                                                    control={control}
                                                    name="isAutoRefereshenabled"
                                                    labelName={AUTO_REFRESH}
                                                    popover
                                                    popover_icon={`${circle_question_mark_mini} icon-xs color-primary-blue top2`}
                                                    popover_position="top"
                                                    popover_content={AUTO_REFRESH_POP_HOVER_TEXT}
                                                    disabled={shouldDisableAutoRefresh || isClickOff}
                                                />
                                            </span>
                                            <small>
                                                {AUDIENCE}:{' '}
                                                {handleTotalAudienceCount(campaignDetails, watchtotalAudience, calucateAudienceCount)}
                                            </small>
                                        </div>
                                    }
                                    audienceFieldClassName={isClickOff ? 'pe-none click-off' : ''}
                                    handleAudienceFieldOnChange={() => {
                                        setTimeout(() => {
                                            if (splitTest && splitTabList?.length >= 2 && calucateAudienceCount > 0) {
                                                const defaultSplittedCount = calculateDefaultSplittedCount(
                                                    splitTabList.length,
                                                    calucateAudienceCount,
                                                    splitTabList,
                                                );
                                                dispatchState({
                                                    type: 'UPDATE_SLIDER',
                                                    payload: {
                                                        splitABCount: defaultSplittedCount,
                                                        showSlider: false,
                                                    },
                                                });
                                            }
                                        }, 0);
                                    }}
                                />
                            </div>
                        )}
                        {(campaign.campaignType === 'S' ||
                            (campaign.campaignType === 'M' && dataSource === 'TL' && levelNumber === 1)) && (
                                <div className={`form-group ${state.showSlider ? 'split-on mb0' : 'split-off'}`}>
                                    <Row>
                                        <Col sm={{ offset: 1, span: 2 }}>
                                            <label className="control-label-left">{LABLE_SPLIT_AB}</label>
                                        </Col>
                                        <Col
                                            sm={1}
                                            className={`${!isSplitABEnable ? 'pe-none click-off' : 'cp'} ${isClickOff ? 'pe-none click-off' : ''
                                                }`}
                                        >
                                            <div
                                                onClick={() => {
                                                    if (splitTest) {
                                                        dispatchState({
                                                            type: 'UPDATE',
                                                            payload: true,
                                                            field: 'splitOffConfirmationModal',
                                                        });
                                                    } else {
                                                        reset(
                                                            (formState) => ({
                                                                ...formState,
                                                                splitTest: true,
                                                                subjectLine: '',
                                                                ..._cloneDeep(resetFieldsOnRefresh),
                                                                splitA: {
                                                                    ..._cloneDeep(refreshSplitABFields),
                                                                },
                                                                splitB: {
                                                                    ..._cloneDeep(refreshSplitABFields),
                                                                },
                                                                splitC: {
                                                                    ..._cloneDeep(refreshSplitABFields),
                                                                },
                                                                splitD: {
                                                                    ..._cloneDeep(refreshSplitABFields),
                                                                },
                                                                //  ...resetFieldsOnRefresh,
                                                            }),
                                                            {
                                                                keepDirty: true,
                                                            },
                                                        );
                                                        setValue('currentSplitTab', 0);

                                                        // Initialize default splittedCount when split test is enabled
                                                        if (calucateAudienceCount > 0) {
                                                            const defaultSplittedCount = calculateDefaultSplittedCount(
                                                                2, // Initial split tabs count
                                                                calucateAudienceCount,
                                                                ['splitA', 'splitB'],
                                                            );
                                                            dispatchState({
                                                                type: 'UPDATE_SLIDER',
                                                                payload: {
                                                                    splitABCount: defaultSplittedCount,
                                                                    showSlider: false,
                                                                },
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
                                                <RSSwitch
                                                    control={control}
                                                    name="splitTest"
                                                    handleChange={(status) => {
                                                        //if (!status) resetField('splitscehdule');
                                                    }}
                                                    id="rs_Email_splitTest"
                                                    preventChange
                                                />
                                            </div>
                                        </Col>

                                        <Col
                                            sm={8}
                                            className={`pl0 d-flex   ${splitTest && emptySplitdate?.text ? '' : ''} 
                                        ${isClickOff ? '' : ''}`}
                                        >
                                            <div className="pl0 d-flex align-items-center">
                                                {splitTest && (
                                                    <Fragment>
                                                        {/* //Slider */}
                                                        <RSTooltip
                                                            text={ADJUST_SPLIT_SIZE}
                                                            className="lh0 mr15"
                                                        >
                                                            <i
                                                                className={`${adjust_split_medium} icon-md color-primary-blue`}
                                                                onClick={() =>
                                                                    dispatchState({
                                                                        type: 'UPDATE',
                                                                        payload: true,
                                                                        field: 'showSlider',
                                                                    })
                                                                }
                                                                id="rs_Email_caret"
                                                            />
                                                        </RSTooltip>
                                                        <RSTooltip
                                                            text={SCHEDULE}
                                                            position="top"
                                                            className="lh0 mr15"
                                                            innerContent={false}
                                                        >
                                                            <i
                                                                className={`${timer_medium} icon-md color-primary-blue`}
                                                                onClick={() => {
                                                                    let emptySplit = '';
                                                                    let isError = {};
                                                                    let tabs = splitAB?.map((item) => item?.id);
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
                                                                id="rs_Email_settings"
                                                            />
                                                        </RSTooltip>
                                                    </Fragment>
                                                )}
                                                <RSPPophover
                                                    pophover={SPLIT_AB_TOOLTIP_TEXT}
                                                // className="cp"
                                                >
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
                        {showSlider && (
                            <SplitSlider
                                show={true}
                                audienceCount={calucateAudienceCount}
                                sliderData={state.splitABCount}
                                splitTabs={splitTabList}
                                onSave={(data) => {
                                    dispatchState({
                                        type: 'UPDATE_SLIDER',
                                        payload: {
                                            splitABCount: data,
                                            showSlider: false,
                                        },
                                    });
                                }}
                                handleClose={() =>
                                    dispatchState({
                                        type: 'UPDATE',
                                        field: 'showSlider',
                                        payload: false,
                                    })
                                }
                                isClickOff={isClickOff}
                            />
                        )}
                        {splitTest ? (
                            <div className="no-scroll-rs-content-tabs sjfkhsihfi" ref={tabberRef}>
                                <RSTabbar
                                    dynamicTab={`res-content-tabs-split`}
                                    activeClass={`active`}
                                    flatTabs
                                    componentClassName ={'w-100'}
                                    tabData={splitAB}
                                    defaultTab={state.currentSplitTab}
                                    isRemoveConfirmation
                                    onRefresh={() => disableSplitTabs(false)}
                                    callBack={(_, index, isForceUpdate) => {
                                        // console.log('index, isForceUpdate: ', index, isForceUpdate);
                                        dispatchState({
                                            type: 'UPDATE',
                                            payload: index,
                                            field: 'currentSplitTab',
                                        });
                                        setValue('currentSplitTab', index);
                                        if (!isForceUpdate && !_isEmpty(errors))
                                            splitTabList.forEach((name) => {
                                                clearErrors(`${name}.tabErrorText`);
                                                clearErrors(`${name}.editorText`);
                                            });
                                    }}
                                    onAddMenu={(index) => onAddTab(index)}
                                    onRemoveMenu={onRemoveTab}
                                    customTooltipName={'Add split'}
                                />
                            </div>
                        ) : (
                            <SplitABTab
                                isSplit={false}
                                levelNumber={levelNumber}
                                campaignType={campaign?.campaignType}
                                dataSource={dataSource}
                                isSubjectLineEnable={disableSubjectLine}
                                isClickOff={isClickOff}
                            />
                        )}
                        {(isImportTabEnabled) && (
                            <div className={`${isClickOff || isPastPlanDurationBlocked ? PAST_PLAN_DURATION_CLICK_OFF_CLASS : ''}`}>
                                <RequestApproval
                                    name="approvalList.name"
                                    isSendButton
                                    parent="approvalList"
                                    isCustomapproval={false}
                                    isCustomEnterMail={true}
                                    onRequestApproval={(status) => {
                                        if (isPastPlanDurationBlocked) return;
                                        const type = !status ? 'test preview' : 'request for approval';
                                        handleSubmit((data) => {
                                            const hasDuplicateUnsubscribe = checkUnsubscribeDuplicate(data);
                                            if (hasDuplicateUnsubscribe) {
                                                setPendingSubmitParams({ type, isSchedule: false });
                                                setUnsubscribeDuplicateWarning(true);
                                            } else {
                                                void formSubmitHandler(data, type, false);
                                            }
                                        })();
                                    }}
                                    isApprovalSettings
                                    RfaCallBack={(isRFA) => {
                                        let schedulerName = splitTest
                                            ? `${splitAB?.[state.currentSplitTab]?.id}.schedule`
                                            : 'schedule';
                                        if (!isRFA) {
                                            const currentSchedule = getValues(schedulerName);
                                            unregister(schedulerName);
                                            if (currentSchedule) {
                                                setValue(schedulerName, currentSchedule, { shouldValidate: true });
                                            }
                                        }
                                    }}
                                    channelType={'email'}
                                    isClickOff={isClickOff || isPastPlanDurationBlocked || isSubmitting}
                                    isSendLoading={isSendLoading}
                                />
                            </div>
                        )}
                    </div>
                    <div className="buttons-holder">
                        <RSSecondaryButton
                            type="button"
                            onClick={() => {
                                if (mCampType === 'M') {
                                    const formState = getValues();
                                    const data = {
                                        data: {
                                            edmChannelId: formState?.savedChannelResponseDetailId ?? 0,
                                        },
                                    };
                                    if (formState?.savedChannelResponseDetailId && savedChannel) {
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
                            id="rs_Email_Cancel"
                        >
                            {CANCEL}
                        </RSSecondaryButton>
                        {disableNext && (
                            <>
                                <RSSecondaryButton
                                    className={`color-primary-blue ${isPastPlanDurationBlocked ? PAST_PLAN_DURATION_CLICK_OFF_CLASS : ''}`}
                                    type="button"
                                    onClick={() => {
                                        if (isPastPlanDurationBlocked) return;
                                        const formData = getValues();
                                        const isCTGTConfirm = handleCheckCTGT(formData.audience);
                                        const hasUserConfirmed = formData.isCGTGConfirm === true;

                                        // Only show modal if CG/TG conflict exists and user hasn't confirmed yet
                                        if (isCTGTConfirm && !hasUserConfirmed && !handleCGTGModalCheck(campaignDetails?.content?.[0]?.statusId)) {
                                            setPendingNextSubmitParams({ type: 'save', isSchedule: true });
                                            setNextButtonCGTGModal(true);
                                            return;
                                        }

                                        handleSubmit((data) => {
                                            const hasDuplicateUnsubscribe = checkUnsubscribeDuplicate(data);
                                            if (hasDuplicateUnsubscribe) {
                                                setPendingSubmitParams({ type: 'save', isSchedule: true });
                                                setUnsubscribeDuplicateWarning(true);
                                            } else {
                                                void formSubmitHandler(data, 'save', true);
                                            }
                                        })();
                                    }}
                                    id="rs_Email_Save"
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
                                        if (!isDirty && !isValid && (!getValues('splitTest') ? !getValues('subjectLine') : false)) {
                                            setNavigate_confirm(true);
                                        } else {
                                            if (isClickOff) {
                                                handleSubmit((data) => formSubmitHandler(data, 'form', true))();
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

                                            const isEmailFooterEnabled = checkEmailFooterEnabled(formData);

                                            if (!isEmailFooterEnabled) {
                                                setPendingEmailFooterParams({ type: 'form', isSchedule: true });
                                                setEmailFooterWarning(true);
                                            } else {
                                                handleSubmit((data) => {
                                                    const hasDuplicateUnsubscribe = checkUnsubscribeDuplicate(data);
                                                    if (hasDuplicateUnsubscribe) {
                                                        setPendingSubmitParams({ type: 'form', isSchedule: true });
                                                        setUnsubscribeDuplicateWarning(true);
                                                    } else {
                                                        void formSubmitHandler(data, 'form', true);
                                                    }
                                                })();
                                            }
                                        }
                                    }}
                                    id="rs_Email_Next"
                                >
                                    {mCampType === 'M'
                                        ? `${mdcButtonText} ${type.toLowerCase()} content`
                                        : NEXT}
                                </RSPrimaryButton>
                            </>
                        )}
                    </div>
                </form>
                {/* Modals */}
                <SplitABScheduleModal
                    tabs={splitAB?.map((item) => item?.id)}
                    isClickOff={isClickOff}
                    show={state.isShowScheduleModal}
                    handleClose={() => dispatchState({ type: 'UPDATE', payload: false, field: 'isShowScheduleModal' })}
                    editAutoScheduleDetails={editAutoScheduleDetails}
                />
                <RSConfirmationModal
                    show={state.showSchedulerModal || state.splitOffConfirmationModal}
                    text={
                        state.splitOffConfirmationModal
                            ? SPLIT_AB_TURNOFF
                            : COMMUNICATION_SCHEDULED
                    }
                    isBorder
                    // header={}
                    primaryButtonText={state.splitOffConfirmationModal ? OK : SAVE}
                    handleClose={() => {
                        if (state.splitOffConfirmationModal) {
                            dispatchState({ type: 'UPDATE', payload: false, field: 'splitOffConfirmationModal' });
                        } else {
                            dispatchState({
                                type: 'UPDATE_SCHEDULER',
                                payload: {
                                    showSchedulerModal: false,
                                    proceedWithoutSchedule: false,
                                },
                            });
                        }
                    }}
                    handleConfirm={() => {
                        if (state.splitOffConfirmationModal) {
                            disableSplitTabs();
                        } else {
                            dispatchState({
                                type: 'UPDATE_SCHEDULER',
                                payload: {
                                    showSchedulerModal: false,
                                    proceedWithoutSchedule: true,
                                },
                            });
                            handleSubmit((data) => formSubmitHandler(data, formTypeRef.current, false, '', true))();
                        }
                    }}
                />
                {state.isTestMailSent && (
                    <CommunicationSent
                        show={state.isTestMailSent}
                        status={state?.testSentCommunicationModal}
                        rfaMsg={state.rfaMsg || false}
                        requestFalse={state.requestFalse || ''}
                        handleClose={() => {
                            if (state.rfaMsg === true && state.rfaMsg != undefined) {
                                rfaManuallyClosedRef.current = true;
                                if (rfaAutoNavTimeoutRef.current) {
                                    clearTimeout(rfaAutoNavTimeoutRef.current);
                                    rfaAutoNavTimeoutRef.current = null;
                                }

                                dispatchState({
                                    type: 'UPDATE',
                                    payload: false,
                                    field: 'isTestMailSent',
                                });
                                dispatchState({
                                    type: 'UPDATE',
                                    payload: false,
                                    field: 'rfaMsg',
                                });
                                if (campaign.campaignType === 'M') {
                                    handleMdcNavigation({ data: saveCampaigData });
                                } else {
                                    handleNavigation();
                                }
                            } else {
                                dispatchState({
                                    type: 'UPDATE',
                                    payload: false,
                                    field: 'isTestMailSent',
                                });
                            }
                        }}
                    />
                )}
            </EmailProvider.Provider>
            </AuthoringChannelEditSkeletonGate>
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
            <RSConfirmationModal
                show={emailFooterWarning}
                text={EMAIL_FOOTER_WARNING_MSG}
                primaryButtonText="Yes, proceed"
                secondaryButtonText="Cancel"
                handleClose={() => {
                    setEmailFooterWarning(false);
                    setPendingEmailFooterParams(null);
                }}
                handleConfirm={() => {
                    setEmailFooterWarning(false);
                    if (pendingEmailFooterParams) {
                        handleSubmit((data) => {
                            const hasDuplicateUnsubscribe = checkUnsubscribeDuplicate(data);
                            if (hasDuplicateUnsubscribe) {
                                setPendingSubmitParams({
                                    type: pendingEmailFooterParams.type,
                                    isSchedule: pendingEmailFooterParams.isSchedule
                                });
                                setUnsubscribeDuplicateWarning(true);
                            } else {
                                void formSubmitHandler(
                                    data,
                                    pendingEmailFooterParams.type,
                                    pendingEmailFooterParams.isSchedule,
                                );
                            }
                        })();
                        setPendingEmailFooterParams(null);
                    }
                }}
            />
            <RSConfirmationModal
                show={unsubscribeDuplicateWarning}
                text="Unsubscribe is already enabled in the footer. Do you wish to continue?"
                primaryButtonText="Yes, continue"
                secondaryButtonText="Cancel"
                handleClose={() => {
                    setUnsubscribeDuplicateWarning(false);
                    setPendingSubmitParams(null);
                }}
                handleConfirm={() => {
                    setUnsubscribeDuplicateWarning(false);
                    if (pendingSubmitParams) {
                        handleSubmit((data) => {
                            void formSubmitHandler(data, pendingSubmitParams.type, pendingSubmitParams.isSchedule);
                        })();
                        setPendingSubmitParams(null);
                    }
                }}
            />
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
                        audience,
                        errors,
                        dispatch,
                        payloadParams,
                        listTypeWisePersonlization,
                    });
                    setPreviousAudience(audience);
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
                        const formData = getValues();
                        const isEmailFooterEnabled = checkEmailFooterEnabled(formData);

                        if (!isEmailFooterEnabled) {
                            setPendingEmailFooterParams({
                                type: pendingNextSubmitParams.type,
                                isSchedule: pendingNextSubmitParams.isSchedule
                            });
                            setEmailFooterWarning(true);
                        } else {
                            handleSubmit((data) => {
                                const hasDuplicateUnsubscribe = checkUnsubscribeDuplicate(data);
                                if (hasDuplicateUnsubscribe) {
                                    setPendingSubmitParams({
                                        type: pendingNextSubmitParams.type,
                                        isSchedule: pendingNextSubmitParams.isSchedule
                                    });
                                    setUnsubscribeDuplicateWarning(true);
                                } else {
                                    void formSubmitHandler(
                                        data,
                                        pendingNextSubmitParams.type,
                                        pendingNextSubmitParams.isSchedule,
                                    );
                                }
                            })();
                        }
                        setPendingNextSubmitParams(null);
                    }
                }}
            />
            {getWarningPopupMessage(failureApiErrors, dispatch, handleErrClose)}
        </FormProvider>
    );
};

export default Email;
