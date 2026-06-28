import { UpdateState } from 'Utils/modules/misc';
import { campaignSchedule, checkRFAApproved, checkTrigger, diff_minutes, statusIdCheck, validateRFAMandatory } from 'Utils/modules/campaignUtils';
import { CHANNELS_LIST } from 'Utils/modules/communicationChannels';
import { convertUserTimezoneToTarget, getYYMMDD } from 'Utils/modules/dateTime';
import { checkScheduleDate } from 'Utils/modules/display';
import { numberWithCommas } from 'Utils/modules/formatters';
import { getmasterData } from 'Utils/modules/masterData';
import { createCommunicationSettingsNavState, MESSAGING_TAB_ID } from 'Utils/modules/navigation';
import { encodeUrl, getUserDetails } from 'Utils/modules/crypto';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { buildPayload, detectFileType, FORM_INITIAL_STATE, INITIAL_STATE, refreshFields, SPLIT_TABS, splitABRefreshFields } from './constant';
import { EXCEPTION_OCCURRED, Select_SENDER_NAME, SELECT_TEMPLATE_LANGUAGE, SELECT_TEMPLATE_NAME, SELECT_TEMPLATE_TYPE } from 'Constants/GlobalConstant/ValidationMessage';
import { ADD_SENDER_ID, ADJUST_SPLIT_SIZE, ARE_YOU_SURE_REFRESH, ARE_YOU_SURE_WANT_TO_RESET, AUDIENCE, AUDIENCE_CHANGE_CONFIRMATION, AUDIENCE_COUNT_ZERO_ENABLE_AUTO_REFRESH, AUTO_REFRESH, AUTO_REFRESH_POP_HOVER_TEXT, AUTO_SCHEDULE_SPLITS, CANCEL, CHECK_START_DATE_AND_END_DATE, COMMUNICATION_SCHEDULED, CONFIRMATION, GIVEN_DATE_IS_EXCEEDS, IGNORE_CHANNEL, LABLE_SPLIT_AB, LANGUAGE, MINIMUM_DIFFERENCE_SPLITS, MOBILE_NUMBER, NEXT, OK, RESET, SAVE, SENDER, SENDER_NAME, SPLIT_AB_TOOLTIP_TEXT, SPLIT_AB_TURNOFF, TEMPLATE_LANGUAGE, TEMPLATE_NAME, TEMPLATE_TYPE, WARNING } from 'Constants/GlobalConstant/Placeholders';
import { adjust_split_medium, circle_minus_fill_large, circle_minus_fill_medium, circle_plus_edge_medium, circle_plus_medium, circle_question_mark_medium, circle_question_mark_mini, restart_medium, timer_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import _map from 'lodash/map';
import _get from 'lodash/get';
import _find from 'lodash/find';
import _filter from 'lodash/filter';
import _uniqBy from 'lodash/uniqBy';
import _cloneDeep from 'lodash/cloneDeep';
import _forEach from 'lodash/forEach';
import { Col, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, FormProvider } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { PhoneNumberUtil } from 'google-libphonenumber';

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

import { ensureArray, ensureObject, sanitizeChannelCount, sumAudienceCountByField, normalizeChannelCampaignData, hasCampaignDetails, getCampaignStatusId } from 'Pages/AuthenticationModule/Communication/CreateCommunication/communicationDefaults';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { SPLIT_AB_NAME, availableTabs, communicationChannels, getNextEligibleTabIndex, MESSAGING_TAB_CHANNEL_MAP, handleAutoRefreshClickOff, handlePersonalizationFetchApiCall, calculateDefaultSplittedCount, AudienceFieldRenderComponent, audienceTypeList, handleMDCQueryParamsUpdate, handleCheckCTGT, validateAudienceCount, mergeChannelAudiences, handleUpdateEditAudienceCount, handleTotalAudienceCount, handleCGTGModalCheck, editActionIdFromCommunicationResponse, getPastPlanDurationBlockedState, validatePastPlanDurationOnSubmit, PAST_PLAN_DURATION_CLICK_OFF_CLASS, getMdcChannelDetailIdFromLocation, getIsMDChannelDetailForMdcEdit, shouldHandleEditCallApi, isGenie } from '../../constant';
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
  updateTotalAudienceCount } from
'Reducers/communication/createCommunication/Create/reducer';
import { getAudienceList, getTemplateLanguage, getSenderName, getContactByUserId, getHsmTemplateNew, saveMessagingCampaignNew, getMessagingCampaignByIdNew } from 'Reducers/communication/createCommunication/Create/request';
import { updateChannelAudiences } from 'Reducers/communication/createCommunication/plan/reducer';
import { getRequestApprovalList, getSessionId } from 'Reducers/globalState/selector';
import { getAudience, getFilterAudience, smsList } from 'Reducers/communication/createCommunication/Create/selectors';
import { getGeneratedLink, getSmartLinksListWithLabels } from 'Reducers/communication/createCommunication/smartlink/selectors';
import { getSmartUrl } from 'Reducers/communication/createCommunication/smartlink/request';
import { updateSmartLinkShow } from 'Reducers/communication/createCommunication/execute/reducer';
import useQueryParams from 'Hooks/useQueryParams';
import useApiLoader from 'Hooks/useApiLoader';
import { showTabsSmartlink } from 'Reducers/communication/createCommunication/smartlink/reducer';
import { extractPlaceholders } from '../RCS/constant';
import WATextEditor from './Component/WATextEditor/WATextEditor';

import { AUTHORING_FIELD_LOADER_CONFIG } from 'Components/Skeleton/pages/communication/authoring';
let userKeyInfo = [];
const Messaging = ({ type = 'whatsapp', mCampType, channelId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useQueryParams('/communication');
  //const dialCode = useRef('');
  // const phoneNumber = useRef();
  const formTypeRef = useRef(null);
  const isAlreadyEditCallRef = useRef(false);
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
  const [emptySplitdate, setEmptySplitDate] = useState({
    text: ''
  });
  const [isFailure, setIsFailure] = useState({
    status: false,
    message: ''
  });
  const [preview, setPreview] = useState(false);
  const [editAutoScheduleDetails, setEditAutoScheduleDetails] = useState({});
  const [carouselTabs, setCarouselTabs] = useState({});
  const [isAudienceChangeConfirm, setIsAudienceChangeConfirm] = useState(false);
  const [previousAudience, setPreviousAudience] = useState([]);
  const [nextButtonCGTGModal, setNextButtonCGTGModal] = useState(false);
  const [audienceCountZeroWarning, setAudienceCountZeroWarning] = useState(false);
  const [pendingNextSubmitParams, setPendingNextSubmitParams] = useState(null);
  const [saveCampaigData, setSaveCampaigData] = useState(null);

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
    listTypeWisePersonlization
  } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
  const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
  const {
    campaignDetails = {},
    senderName: senderNameList,
    templateLanguage: templateLanguageList
  } = useSelector((state) => smsList(state));

  const { smartLink1, smartLink2 } = useSelector((state) => getGeneratedLink(state));
  const smartLink = useSelector((state) => getGeneratedLink(state));
  // console.log('MMMM ::::::::::::::: ', smartLink);
  const { tabSmartLink_Flag, customFields, mobileApps, screenList, subScreenList } = useSelector(
    ({ smartLinkReducer }) => smartLinkReducer
  );
  const smartLinks = useSelector((state) => getSmartLinksListWithLabels(state));
  let audienceList = useSelector((state) => getAudience(state));

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
    unregister,
    resetField,
    getValues,
    setFocus,
    trigger
  } = methods;
  // console.log('watch: ', watch());

  // const dirty = { ...dirtyFields };
  // console.log('getValues: ', getValues());
  const audienceRef = useRef();
  const tabberRef = useRef();

  const [state, setState] = useState(INITIAL_STATE);
  const [templateName, setTemplateName] = useState(0);
  const [templatePhone, setTemplatePhone] = useState({});
  const [splitTabs, setSplitTabs] = useState(SPLIT_TABS);
  const [isEditMessagingFail, setIsEditMessaging] = useState(false);
  const [isClickOff, setIsClickOff] = useState(false);
  const [splitTabConfig, setSplitTabConfig] = useState({
    currentTab: 0,
    splitTabs: ['splitA', 'splitB']
  });
  const splitObj = {
    0: 'A',
    1: 'B',
    2: 'C',
    3: 'D',
    4: 'E'
  };
  const [smsPreview, setSmsPreview] = useState(false);
  const [sliderState, setSliderState] = useState({
    show: false,
    splittedCount: {}
  });
  let [
  splitTest,
  audience,
  isRequestApproval,
  templateLanguage,
  senderName,
  template,
  phoneNumber,
  err,
  dailCode,
  templateType,
  watchtotalAudience] =
  watch([
  'splitTest',
  'audience',
  'approvalList.requestApproval',
  'templateLanguage',
  'senderName',
  'templateName',
  'phoneNumber',
  'err',
  'approvalList.dialCode',
  'templateType',
  'totalAudience']
  );
  // console.log('getCountryVal: ', getCountryVal);
  const [disableNext, setDisableNext] = useState(true);

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

    const senderNameLoader = useApiLoader();
    const audienceLoader = useApiLoader();
    const contactLoader = useApiLoader();
    const templateLanguageLoader = useApiLoader();
    const hsmTemplateLoader = useApiLoader();
    const { runSave, beginSubmit, endSubmit, isSaveLoading, isNextLoading, isSendLoading, isSubmitting } =
        useAuthoringChannelSaveLoader();

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

  if (campaign.campaignType === 'M') {
    audience = ensureArray(mdcAudience);
  }
  let calucateAudienceCount = useMemo(
    () => sumAudienceCountByField(audience, 'recipientCountMobile'),
    [audience]
  );

  const isSplitABEnable = calucateAudienceCount >= 100;
  //&& !Object.hasOwn(errors, 'audience');

  useEffect(() => {
    dispatch(updateTotalAudienceCount(calucateAudienceCount || 0));
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
        adjustedEndDate: location?.endDate
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
        adjustedEndDate: location?.endDate
      };
    }

    // Convert original start and end dates from profile timezone to selected timezone
    const originalStartDate = new Date(location?.startDate);
    const originalEndDate = new Date(location?.endDate);

    const adjustedStartDate = convertUserTimezoneToTarget(
      originalStartDate,
      profileTimezone.gmtOffset,
      selectedTimezone.gmtOffset,
      false
    );

    const adjustedEndDate = convertUserTimezoneToTarget(
      originalEndDate,
      profileTimezone.gmtOffset,
      selectedTimezone.gmtOffset,
      false
    );

        return {
            adjustedStartDate: getYYMMDD(adjustedStartDate),
            adjustedEndDate: getYYMMDD(adjustedEndDate),
        };
    };
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
                }),
            );
            if (!res?.status) {
                if (!statusIdCheck(location?.statusId, _get(location, 'campaignType', 'S'), campaignDetails)) {
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
                        getCampaignStatusId(campaignDetails),
                        _get(location, 'campaignType', 'S'),
                        campaignDetails,
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
      campaignType: _get(location, 'campaignType', 'S')
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
    setMdcAudience(mdcAudience);
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

    const handleEditCallApi = () => shouldHandleEditCallApi(location, savedChannel);

    function numberToLetter(n) {
        if (n < 1 || n > 26) return null;
        return String.fromCharCode(96 + n);
    }

    useEffect(() => {
        async function fetchEditFlow() {
            const payload = {
                userId,
                clientId,
                departmentId,
                campaignId: _get(location, 'campaignId', 0),
            };
            const isFromGenie = isGenie(location);
            const editPayload = {
                ...payload,
                levelNumber,
                actionId,
                waChannelDetailId: isFromGenie
                    ? getMdcChannelDetailIdFromLocation(location)
                    : mdcChannelDetailId,
            };
            const isMDChannelDetail = getIsMDChannelDetailForMdcEdit(location, isMDCEditMode, mdcChannelDetailId);
            if (
                _get(location, 'campaignId', 0) > 0 &&
                formTypeRef.current === null &&
                !isAlreadyEditCallRef.current &&
                isMDChannelDetail
            ) {
                const shouldCallEditApi = handleEditCallApi();
                if (isFromGenie) {
                    if (shouldCallEditApi) {
                        isAlreadyEditCallRef.current = true;
                    }
                } else {
                    isAlreadyEditCallRef.current = true;
                }
                if (isSavedChannel && shouldCallEditApi) {
                    beginEditSkeleton();
                }
                try {
                    const editApiResult = await Promise.all([
                        senderNameLoader.refetch({
                            fetcher: ({ payload: senderPayload } = {}) =>
                                dispatch(getSenderName({ payload: senderPayload, loading: false })),
                            mode: savedChannel ? 'edit' : 'create',
                            loaderConfig: editFieldLoaderConfig,
                            params: { payload: { ...payload, senderId: 0 } },
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
                                        channelType: 'WA',
                                    },
                                },
                            }),

                        shouldCallEditApi &&
                            dispatch(
                                getMessagingCampaignByIdNew({
                                    payload: editPayload,
                                    type,
                                    campaignType: _get(location, 'campaignType', 'S'),
                                    isEnableLoader: false,
                                }),
                            ),
                    ]);
                    const [{ data: smsSenderList } = {}, { data: audienceData } = {}, { status, data } = {}] =
                        editApiResult || [];
                    if (status && hasCampaignDetails(data)) {
                    const normalizedData = normalizeChannelCampaignData(data, ['smsSplit', 'smsAutoSchedule', 'waSplit', 'waAutoSchedule']);
                    // console.log(data, 'data');
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
                        content,
                        smsAutoSchedule,
                        smsSplit,
                        requestForApproval,
                        isAutoRefereshenabled,
                        testWaMobileNo,
                        countryCodeMobile,
                        isSplitAbEnabled,
                        waSplit,
                        waAutoSchedule,
                        isCGTGEnabled,
                    } = normalizedData;
                    let temp = {};
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
                                channelType: 'WA',
                            },
                            isFilter: true,
                        },
                    });
                    [audienceData ?? audienceList, filterAudienceResponse?.data ?? []]?.forEach((item) => {
                        const updateAudienceData = _map(item, (audience) => ({
                            ...audience,
                            audienceEmail: `${audience.recipientsBunchName}(${numberWithCommas(
                                audience.recipientCountEmail,
                            )})`,
                            audienceMobile: `${audience.recipientsBunchName}(${numberWithCommas(
                                audience.recipientCountMobile,
                            )})`,
                            audiencWhatsapp: `${audience.recipientsBunchName}(${numberWithCommas(
                                audience.recipientCountMobile,
                            )})`,
                            audienceName: `${audience.recipientsBunchName}(${numberWithCommas(
                                audience.recipientCountEmail,
                            )})`,
                            audiencRCS: `${audience.recipientsBunchName} (${numberWithCommas(
                                audience.recipientCountRCS,
                            )})`,
                        }));
                        tempAudienceData.push(updateAudienceData);
                    });

          let [defaultAudience, filterAudience] = tempAudienceData;
          let audience = _filter(defaultAudience, (aud) =>
          segmentationListId?.includes(aud.segmentationListId)
          );

          if (!audience?.length && filterAudience?.length && segmentationListId?.length) {
            audience = filterAudience;
          }

          if (_get(location, 'campaignType', '') === 'T') {
            audience = [];
          }
          temp.totalAudience = sanitizeChannelCount(totalAudience, 0);
          dispatch(updateTotalAudienceCount(sanitizeChannelCount(totalAudience, 0)));
          if (isSplitAbEnabled) {
            // content?.forEach(({ body, localBlastDateTime, splitType, timeZoneId, templateId }) => {
            //     const tempTab = {};
            //     const findTimeZone = _find(timeZoneList, ['timeZoneID', timeZoneId]);
            //     tempTab.editorText = body;
            //     tempTab.schedule = localBlastDateTime ? new Date(localBlastDateTime) : '';
            //     tempTab.timezone = findTimeZone;
            //     tempTab.templateId = templateId;
            //     temp[`split${numberToLetter(i + 1)?.toUpperCase()}`] = tempTab;
            //     handleTemplate(finalTempalte);
            //     state.splitTabList.push(`split${splitType}`);
            // });

            const language = await fetchTemplateLanguge(senderId);
            let languageList = [];
            let templateObj = {};
            if (language.status) languageList = language.data;

            for (const [ind, item] of content.entries()) {
              let tempTab = {};
              const { contentJSON = {}, languageId = '', waTemplateId, localBlastDateTime } = item;

              let templateList = [];
              const template = await fetchTemplate(languageId, senderId);
              if (template.status) templateObj[languageId] = template.data;

              const findTemplateName = _find(templateObj[languageId], ['waTemplateId', waTemplateId]);
              tempTab.templateLanguage = _find(languageList, ['languageCode', languageId]);
              tempTab.templateName = findTemplateName;
              tempTab.schedule = !!localBlastDateTime ? new Date(localBlastDateTime) : '';

              const finalTemplate = { ...contentJSON };
              const templateTypes =
              handleTemplateType(
                templateObj,
                isSplitAbEnabled,
                `split${numberToLetter(ind + 1)?.toUpperCase()}`,
                tempTab.templateLanguage,
                true
              )?.availableTypes || [];

              tempTab.templateType = item?.isCarousel ?
              _find(templateTypes, ['templateType', 'carousel']) :
              _find(templateTypes, ['templateType', 'basic']);
              let formData = handleTemplate(
                finalTemplate,
                isSplitAbEnabled,
                `split${numberToLetter(ind + 1)?.toUpperCase()}`,
                true,
                item
              );
              tempTab = { ...tempTab, ...formData };
              temp = {
                ...temp,
                [`split${numberToLetter(ind + 1)?.toUpperCase()}`]: tempTab
              };
              state.splitTabList.push(`split${numberToLetter(ind + 1)?.toUpperCase()}`);
            }

            const tempTabState = state.splitTabList.map((_, index, total) => {
              const getSplitName = { ...SPLIT_AB_NAME[index] };
              delete getSplitName.add;
              return {
                ...getSplitName,
                component: () =>
                <SplitAB
                  fieldName={_}
                  key={getSplitName.id}
                  isSplitTabs
                  campaignType={campaign.campaignType} />,


                ...(total?.length < 4 &&
                total?.length - 1 === index && { add: circle_plus_medium }),
                ...(index > 1 &&
                total?.length - 1 === index && {
                  remove: circle_minus_fill_medium
                })
              };
            });

            // if (tempTabState?.length === 2 || tempTabState?.length === 3)
            //     tempTabState[tempTabState?.length - 1].add = circle_plus_edge_medium;

            setSplitTabs(tempTabState);
            let splitIndex = 0;
            if (location?.splitType) {
              const splitInd = tempTabState?.findIndex((item) => item?.id === location?.splitType);
              if (splitInd !== -1 && splitInd < tempTabState?.length) {
                splitIndex = splitInd;
              }
            }
            setSplitTabConfig({
              currentTab: splitIndex,
              splitTabs: tempTabState?.map((item) => item?.id)
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
              contentJSON,
              isCarousel
            } = content?.[0] || {};
            const findTimeZone = _find(timeZoneList, ['timeZoneID', timeZoneId]);
            // debugger;
            // temp.schedule = localBlastDateTime ? new Date(localBlastDateTime) : '';
            // temp.timezone = findTimeZone;
            temp = {
              ...temp,
              schedule: !!localBlastDateTime ? new Date(localBlastDateTime) : '',
              timezone: findTimeZone
            };
            schedule = !!localBlastDateTime ? new Date(localBlastDateTime) : '';

            let templateList = [],
              languageList = [];
            let templateObj = {};
            const language = await fetchTemplateLanguge(senderId);
            const template = await fetchTemplate(languageId, senderId);
            if (template.status) {
              templateList = template.data;
              templateObj[languageId] = template.data;
            }
            if (language.status) languageList = language.data;
            const findTemplateName = _find(templateObj[languageId], ['waTemplateId', waTemplateId]);
            temp.templateLanguage = _find(languageList, ['languageCode', languageId]);
            temp.templateName = findTemplateName;
            let finalTempalte = { ...contentJSON };
            if (finalTempalte?.carousel?.length > 0 && finalTempalte?.isCarousel) {
              finalTempalte.carousel = finalTempalte?.carousel?.map((item, ind) => {
                return {
                  ...item,
                  bodyMaxLength: findTemplateName?.carousel?.[ind]?.bodyMaxLength
                };
              });
            }
            const templateTypes =
            handleTemplateType(templateObj, isSplitAbEnabled, '', temp.templateLanguage, true)?.
            availableTypes || [];

            temp.templateType = isCarousel ?
            _find(templateTypes, ['templateType', 'carousel']) :
            _find(templateTypes, ['templateType', 'basic']);
            let formData = handleTemplate(finalTempalte, false, '', true, content?.[0]);
            temp = {
              ...temp,
              ...formData
            };

            setTemplateName(findTemplateName);
          }

          const isWorkflowEnabled = _get(requestForApproval, 'isWorkflowEnabled', false);
          const approvarList = _get(requestForApproval, 'approvarList', []);
          const senderName = _find(smsSenderList, ['clientWASenderId', senderId]);
          temp.senderName = senderName;

                    // Handle test phone number from API response
                    let testPhoneNumberToSet = '';
                    let dialCode = ''
                    if (testWaMobileNo && countryCodeMobile) {
                        dialCode = countryCodeMobile?.includes('+') ? countryCodeMobile : `+${countryCodeMobile}`;
                        testPhoneNumberToSet = `${dialCode} ${testWaMobileNo}`;
                    }
                    if (waAutoSchedule?.autoSchedule) {
                        const tempSchedule = {};
                        const { autoSchedule, startIn, periodRange } = waAutoSchedule;
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
                    if (sanitizeChannelCount(waSplit?.splitAudience, 0) > 0) {
                        const tempSplitAudience = {};
                        const { splitAudience, splitPercentage, totalAudience: totalCount, splitWidth } =
                            ensureObject(waSplit);
                        tempSplitAudience.count = sanitizeChannelCount(splitAudience, 0);
                        tempSplitAudience.totalCount = sanitizeChannelCount(totalCount, 0);
                        tempSplitAudience.audienceCount = sanitizeChannelCount(totalAudience, 0);
                        tempSplitAudience.percentage = sanitizeChannelCount(splitPercentage, 0);
                        tempSplitAudience.width = sanitizeChannelCount(splitWidth, 0);
                        tempSplitAudience.tabs = _map(ensureArray(content), ({ splitType }) => `split${splitType}`);
                        setSliderState((prev) => ({ ...prev, splittedCount: tempSplitAudience }));
                    }
                    const matchAudienceType = audienceTypeList?.filter((typeList) =>
                        ensureArray(audience)?.map((aud) => aud?.listType)?.includes(typeList?.id),
                    );
                    audience = _uniqBy(ensureArray(audience), 'segmentationListId');
                    audience = handleUpdateEditAudienceCount({
                        channelId: 21,
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
                                name: _map(approvarList, ({ approvarName, flag }) => {
                                    const approver = _find(approvalList, ['email', approvarName]);
                                    const name = !approver ? approvarName : approver;
                                    const isMandatory = flag ? flag : false;
                                    return { approverName: name, mandatory: isMandatory, isCustom: !approver };
                                }),
                            }),
                            followHierarchy: requestForApproval?.isFollowHierarchy,
                            requestApproval: isWorkflowEnabled,
                            approvalFrom: requestForApproval.approvalFrom,
                            ...(testPhoneNumberToSet
                                ? { testPhoneNumber: testPhoneNumberToSet, dialCode: dialCode }
                                : { testPhoneNumber: '', dialCode: '' }),
                        },
                        ...temp,
                    }));
                    dispatch(updateDirtyState(false));
                    location?.campaignType === 'M' &&
                        handleMDCQueryParamsUpdate(
                            {
                                ...mdcContentSetupDetails,
                                ...watch(),
                                ...campaignDetails,
                                ...data,
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
        // reset(FORM_INITIAL_STATE.defaultValues);
        setSplitTabs(SPLIT_TABS);
        setCarouselTabs({});
        setState(_cloneDeep(INITIAL_STATE));
        if (resetCampaign) {
            dispatch(updateSmsList({ data: {}, field: 'campaignDetails' }));
        }
        setSliderState({
            show: false,
            splittedCount: {},
        });
        setSplitTabConfig({
            currentTab: 0,
            splitTabs: ['splitA', 'splitB'],
        });
        setTemplateName(0);
        dispatch(updateAudience([]));
        dispatch(updateFilterAudience([]));
    };

  useEffect(() => {
    if (!isSplitABEnable && splitTest) refreshSplitABTab();
  }, [isSplitABEnable]);

  useEffect(() => {
    if (
    mCampType === 'M' && (
    checkTrigger(location?.campaignType, location?.endDate) ||
    !statusIdCheck(
      getCampaignStatusId(campaignDetails),
      _get(location, 'campaignType', 'S'),
      campaignDetails
    )))
    {
      setDisableNext(false);
    } else {
      setDisableNext(true);
    }
  }, [location?.campaignType, location?.endDate, campaignDetails?.content?.[0]?.statusId]);

  const updateSplittedCount = () => {
    if (splitTest && splitTabConfig?.splitTabs?.length >= 2 && calucateAudienceCount > 0) {
      const defaultSplittedCount = calculateDefaultSplittedCount(
        splitTabConfig?.splitTabs.length,
        calucateAudienceCount,
        splitTabConfig?.splitTabs
      );
      // Only update if splittedCount is empty or doesn't have the expected structure
      if (!sliderState.splittedCount || !sliderState.splittedCount.count) {
        setSliderState((prev) => ({
          ...prev,
          splittedCount: defaultSplittedCount
        }));
      }
    }
  };

  const updateCurrentTab = (tabList = []) => {
    setSplitTabs(tabList);
    const newSplitTabs = _map(tabList, 'id');
    setSplitTabConfig(() => ({
      currentTab: tabList?.length - 1,
      splitTabs: newSplitTabs
    }));

    // Recalculate splittedCount when tabs change
    if (splitTest && newSplitTabs.length >= 2 && calucateAudienceCount > 0) {
      const defaultSplittedCount = calculateDefaultSplittedCount(
        newSplitTabs.length,
        calucateAudienceCount,
        newSplitTabs
      );
      setSliderState({
        show: false,
        splittedCount: defaultSplittedCount
      });
    } else {
      setSliderState({
        show: false,
        splittedCount: {}
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
      ...(temp?.length >= 3 && { remove: circle_minus_fill_large })
    };
    updateCurrentTab(temp);
    setEmptySplitDate({
      text: ''
    });
  };

  const addSplitTabs = (index) => {
    const getSplitName = SPLIT_AB_NAME[index];
    const temp = [...splitTabs];
    delete temp[temp?.length - 1].add;
    delete temp[temp?.length - 1].remove;
    temp.push({
      ...getSplitName,
      component: () =>
      <SplitAB
        fieldName={getSplitName.id}
        key={getSplitName.id}
        campaignType={campaign.campaignType}
        isSplitTabs />,


      remove: circle_minus_fill_large,
      ...(temp?.length < 3 && { add: circle_plus_edge_medium })
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
          time: 'Hour(s)'
        },
        splitTest: false,
        splitA: {
          ..._cloneDeep(splitABRefreshFields)
        },
        splitB: {
          ..._cloneDeep(splitABRefreshFields)
        },
        splitC: {
          ..._cloneDeep(splitABRefreshFields)
        },
        splitD: {
          ..._cloneDeep(splitABRefreshFields)
        }
      }),
      {
        keepDirty: true
      }
    );
    if (isPopup) UpdateState(setState, 'issplitOffConfirmationModal', false);
  };
  const scrollToHeaderError = (errs) => {
    const hasHeaderTypeError =
    errs?.headerType ||
    Object.keys(errs || {}).some((key) =>
    key.startsWith('split') &&
    errs[key]?.headerType
    );
    if (hasHeaderTypeError) {
      const uploadWrapper = document.querySelector('.whatsapp-image-upload-wrapper');
      if (uploadWrapper) {
        uploadWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  function handleNavigation() {
    resetState(true);
    window.scrollTo(0, 0);
    const tabIndex = messagingTabState.currentIndex + 1;

    const handleVertcialNextTab = () => {
      const nextChannel = communicationChannels.find(
        (chan, index) => channelType !== chan && Object.hasOwn(activeTabs, chan) && index > currentTab
      );
      if (!!nextChannel) {
        dispatch(
          updateVerticalTab({
            tabs: activeTabs?.[nextChannel] || {
              type: 'notification',
              currentTab: 2
            }
          })
        );
      } else {
        let url = '/communication/execute';
        const encryptState = encodeUrl(location);
        dispatch(resetCreateCommunication());
        navigate(`${url}?q=${encryptState}`, {
          state: location
        });
      }
    };

    const nextMessagingTabIndex = getNextEligibleTabIndex({
      startIndex: tabIndex,
      campaignType: location?.campaignType,
      eligibleChannelIds: location?.eligibleChannelType?.[2] || [],
      availableTabList: availableTabs['messaging'],
      tabChannelMap: MESSAGING_TAB_CHANNEL_MAP
    });

    if (availableTabs['messaging']?.length === nextMessagingTabIndex) {
      handleVertcialNextTab();
    } else {
      dispatch(
        updateTab({
          field: 'messaging',
          data: {
            tabName: availableTabs['messaging'][nextMessagingTabIndex],
            currentIndex: nextMessagingTabIndex
          }
        })
      );
    }
  }

  const handleMdcNavigation = ({ data }) => {
    resetState(true);
    const { waChannelDetailId } = data;
    const channelResponseDetailId = waChannelDetailId;
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
      state
    });
  };
  const handleMdcCancel = () => {
    resetState(true);
    const mdcCanvasUrl = `/communication/mdc-workflow`;
    const state = { ...location };
    delete state.mdcContentSetupDetails;

    const encryptState = encodeUrl(state);
    navigate(`${mdcCanvasUrl}?q=${encryptState}`, {
      state
    });
  };
  const handleUpdateChannelDetailId = (data) => {
    const { waChannelDetailId } = data;
    const channelResponseDetailId = waChannelDetailId;
    setMdcChannelDetailId(channelResponseDetailId);
  };
  const handleError = (message) => {
    setState((prevState) => ({
      ...prevState,
      isWhatsAppError: {
        message,
        show: true
      }
    }));
  };
  const formSubmitHandler = async (
  formState,
  formType = 'form',
  isScheduled,
  proceedWithoutSchedule = false,
  passportID = '') =>
  {
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
        splitTabList: splitTabConfig?.splitTabs,
      })
    ) {
      return;
    }

    if (
      !checkTrigger(location?.campaignType, location?.endDate) &&
    statusIdCheck(
      getCampaignStatusId(campaignDetails),
      _get(location, 'campaignType', 'S'),
      campaignDetails
    ) &&
    !checkRFAApproved(
      getCampaignStatusId(campaignDetails),
      campaignDetails?.requestForApproval?.approvarList
    ))
    {
      if (formType !== 'test preview') {
        if (!handleAutoRefreshClickOff(audience)) {
          const audienceCountValid = validateAudienceCount({
            audienceCount: calucateAudienceCount ?? 0,
            isAutoRefereshenabled: getValues('isAutoRefereshenabled') ?? false,
            campaignType: location?.campaignType ?? 'S',
            levelNumber: levelNumber ?? 1
          });
          if (!audienceCountValid.valid) {
            setAudienceCountZeroWarning(true);
            return;
          }
        }
        let schedulerName = splitTest ? `${splitTabs?.[splitTabConfig?.currentTab]?.id}.schedule` : 'schedule';
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
      let statusId = getCampaignStatusId(campaignDetails);
      if (formState.splitTest) {
        let errorIndex;
        let errorField = null;
        let mediaType = '';
        const tempSplitTabsList = [...splitTabConfig?.splitTabs];
        let scheduleAll = [];
        let nullCount = 0;
        for (let i = 0; i < tempSplitTabsList?.length; i++) {
          let currentTab = formState[tempSplitTabsList[i]];

          if (!currentTab?.templateLanguage) {
            errorIndex = i;
            errorField = 'templateLanguage';
            break;
          }

          if (!currentTab?.templateType) {
            errorIndex = i;
            errorField = 'templateType';
            break;
          }

          if (!currentTab?.templateName) {
            errorIndex = i;
            errorField = 'templateName';
            break;
          }

          // Validate header image preview for split tabs
          if (currentTab?.templateName) {
            let { isHeader, isHeaderEditable, isHeaderType, isCarousel } = currentTab?.templateName;
            isHeaderEditable = true;
            let mediaHeader = isHeaderType !== 'text';
            const isLocationHeader = currentTab?.templateName?.mediaType === 'location';
            const hasPreviewImage = !!currentTab?.previewImage;
            const hasLocationData =
            isLocationHeader &&
            currentTab?.headerType && (
            currentTab.headerType.latitude != null ||
            currentTab.headerType.longitude != null ||
            currentTab.headerType.locationName ||
            currentTab.headerType.locationAddress);

            if (
            isHeader &&
            isHeaderEditable &&
            mediaHeader &&
            !isCarousel && (
            isLocationHeader ? !hasLocationData : !hasPreviewImage))
            {
              errorIndex = i;
              errorField = 'previewImage';
              mediaType = isHeaderType;
              break;
            }
          }

          if (!formState[tempSplitTabsList[i]].schedule) {
            scheduleAll.push(null);
            nullCount++;
          } else {
            scheduleAll.push(true);
          }
        }

        if (errorIndex !== undefined && errorField) {
          setSplitTabConfig((prev) => ({
            ...prev,
            currentTab: errorIndex
          }));

          const errorMessages = {
            templateLanguage: SELECT_TEMPLATE_LANGUAGE,
            templateType: SELECT_TEMPLATE_TYPE,
            templateName: SELECT_TEMPLATE_NAME,
            previewImage: `Enter ${mediaType} url`
          };

          setTimeout(() => {
            if (errorField === 'previewImage' && mediaType) {
              if (mediaType === 'location') {
                setError(`${tempSplitTabsList[errorIndex]}.headerType.latitude`, {
                  type: 'custom',
                  message: 'Fill location details (name, address, latitude, longitude)'
                });
                setFocus(`${tempSplitTabsList[errorIndex]}.headerType.latitude`);
              } else {
                setValue(`${tempSplitTabsList[errorIndex]}.headerType.selectImport`, false);
                setValue(`${tempSplitTabsList[errorIndex]}.headerType.imageType`, '');
                setError(`${tempSplitTabsList[errorIndex]}.headerType.${mediaType}Url`, {
                  type: 'custom',
                  message: errorMessages[errorField] || 'Enter url'
                });
                setFocus(`${tempSplitTabsList[errorIndex]}.templateName`);
              }
            } else {
              setError(`${tempSplitTabsList[errorIndex]}.${errorField}`, {
                type: 'custom',
                message: errorMessages[errorField] || 'This field is required'
              });
              setFocus(`${tempSplitTabsList[errorIndex]}.${errorField}`);
            }
            audienceRef?.current?.scrollIntoView({
              behavior: 'smooth'
            });
          }, 100);
          return;
        }

        if (
        location?.campaignType !== 'T' &&
        !proceedWithoutSchedule && (
        location?.campaignType === 'S' || location?.campaignType === 'M' && levelNumber < 2) &&
        formType !== 'test preview')
        {
          // If ALL splits are not scheduled, show modal to proceed without schedule
          if (nullCount === tempSplitTabsList?.length) {
            UpdateState(setState, 'showSchedulerModal', true);
            formTypeRef.current = formType;
            return;
          }

          // If ANY split is scheduled, ALL splits must be scheduled
          if (nullCount > 0 && nullCount < tempSplitTabsList?.length) {
            // Find first unscheduled tab and show error
            for (let k = 0; k < scheduleAll?.length; k++) {
              if (scheduleAll[k] === null) {
                setValue('currentSplitTab', k);
                setSplitTabConfig((prev) => ({
                  ...prev,
                  currentTab: k
                }));
                setTimeout(() => {
                  setError(`${tempSplitTabsList[k]}.schedule`, {
                    type: 'custom',
                    message: 'Select date and time'
                  });
                  setFocus(`${tempSplitTabsList[k]}.schedule`);
                }, 100);
                return;
              }
            }
          }

          for (var k = 0; k < scheduleAll?.length; k++) {
            if (scheduleAll[k]) {
              // For splits after the first one, check 5-minute difference
              if (k > 0) {
                const timeDiff = diff_minutes(
                  formState[tempSplitTabsList[k]]?.schedule,
                  formState[tempSplitTabsList[k - 1]]?.schedule
                );

                if (timeDiff < 5) {
                  setSplitTabConfig((prev) => ({
                    ...prev,
                    currentTab: k
                  }));

                  setTimeout(() => {
                    setError(`${tempSplitTabsList[k]}.schedule`, {
                      type: 'custom',
                      message: MINIMUM_DIFFERENCE_SPLITS
                    });
                    setFocus(`${tempSplitTabsList[k]}.schedule`);
                  }, 100);
                  return;
                }
              }

              let scheduleError = campaignSchedule(
                formState[tempSplitTabsList[k]]?.schedule,
                formState[tempSplitTabsList[k]]?.timezone?.gmtOffset,
                statusId,
                currentUtcTimeData?.utcTime
              );

              const { adjustedStartDate, adjustedEndDate } = getTimezoneAdjustedDateRange(
                tempSplitTabsList[k],
                formState[tempSplitTabsList[k]]?.timezone
              );
              const ScheduleStatus = checkScheduleDate(
                formState[tempSplitTabsList[k]]?.schedule,
                adjustedStartDate,
                adjustedEndDate
              );
              if (ScheduleStatus) {
                setSplitTabConfig((prev) => ({
                  ...prev,
                  currentTab: k
                }));

                setTimeout(() => {
                  setError(`${tempSplitTabsList[k]}.schedule`, {
                    type: 'custom',
                    message: CHECK_START_DATE_AND_END_DATE
                  });
                  setFocus(`${tempSplitTabsList[k]}.schedule`);
                }, 100);
                return;
              }

              // Check if schedule is at least 15 minutes in the future
              if (!scheduleError) {
                const cityTime = convertUserTimezoneToTarget(
                  currentUtcTimeData?.utcTime ?
                  new Date(currentUtcTimeData.utcTime.replace('Z', '')) :
                  new Date(),
                  '(GMT+00:00) ',
                  formState[tempSplitTabsList[k]]?.timezone?.gmtOffset
                );
                const cityTimeWithBuffer = new Date(cityTime);
                cityTimeWithBuffer.setMinutes(cityTimeWithBuffer.getMinutes() + 15);
                const formattedCityTime = cityTimeWithBuffer.toLocaleString();

                setSplitTabConfig((prev) => ({
                  ...prev,
                  currentTab: k
                }));

                setTimeout(() => {
                  setError(`${tempSplitTabsList[k]}.schedule`, {
                    type: 'custom',
                    message: `Select a date & time later than ${formattedCityTime}`
                  });
                  setFocus(`${tempSplitTabsList[k]}.schedule`);
                }, 100);
                return;
              }
            }
          }
        }
      } else {
        if (
        location?.campaignType === 'S' && formType !== 'test preview' ||
        location?.campaignType === 'M' && dataSource === 'TL' && getTestType() !== 2)
        {
          if (
          !formState.schedule &&
          !state.isScheduled &&
          levelNumber < 2 &&
          isScheduled &&
          !formState.splitTest)
          {
            UpdateState(setState, 'showSchedulerModal', true);
            formTypeRef.current = formType;
            return;
          } else {
            if (!formState.splitTest && isScheduled && (!levelNumber || levelNumber < 2)) {
              let scheduleError = campaignSchedule(
                formState?.schedule,
                formState?.timezone?.gmtOffset,
                statusId,
                currentUtcTimeData?.utcTime
              );
              const { adjustedStartDate, adjustedEndDate } = getTimezoneAdjustedDateRange(
                null,
                formState?.timezone
              );
              const ScheduleStatus = checkScheduleDate(
                formState?.schedule,
                adjustedStartDate,
                adjustedEndDate
              );
              if (ScheduleStatus) {
                setError(`schedule`, {
                  type: 'custom',
                  // message: 'Select a date and time later than ' + scheduleError + '.',
                  message: CHECK_START_DATE_AND_END_DATE
                });
                return;
              }
              if (!scheduleError && levelNumber < 2) {
                const cityTime = convertUserTimezoneToTarget(
                  currentUtcTimeData?.utcTime ?
                  new Date(currentUtcTimeData.utcTime.replace('Z', '')) :
                  new Date(),
                  '(GMT+00:00) ',
                  formState?.timezone?.gmtOffset
                );
                // Add 15 minutes to cityTime
                const cityTimeWithBuffer = new Date(cityTime);
                cityTimeWithBuffer.setMinutes(cityTimeWithBuffer.getMinutes() + 15);
                const formattedCityTime = cityTimeWithBuffer.toLocaleString();
                setError(`schedule`, {
                  type: 'custom',
                  // message: 'Select a date and time later than ' + scheduleError + '.',
                  message: `Select a date & time later than ${formattedCityTime}`
                });
                return;
              }
            }
          }
        }
      }
      // if (type === 'whatsapp') {
      //     if (
      //         (formState?.templateName?.templateType === 4 || formState?.templateName?.templateType === 8) &&
      //         formState?.previewImage === ''
      //     ) {
      //         handleError('Select/Upload video to proceed');
      //         return;
      //     } else if (
      //         (formState?.templateName?.templateType === 2 || formState?.templateName?.templateType === 6) &&
      //         formState?.previewImage === ''
      //     ) {
      //         handleError('Select/Upload image to proceed');
      //         return;
      //     } else if (
      //         (formState?.templateName?.templateType === 3 || formState?.templateName?.templateType === 7) &&
      //         formState?.previewImage === ''
      //     ) {
      //         handleError('Select PDF file to proceed');
      //         return;
      //     }
      // }
      dispatch(
        updateMessaging({
          field: type,
          data: { ...formState, sliderData: sliderState.splittedCount, splitTabConfig }
        })
      );

      function getTestType() {
        if (formType === 'form' && formState?.approvalList?.requestApproval) return 1;
        if (formType === 'form' || formType === 'save') return 0;
        if (formType === 'request for approval') return 1;
        if (formType === 'test preview') return 2;
        if (formType === 'live') return 4;
        return 0;
      }
      const userKeyPersonInfo = userKeyInfo?.filter((e) => e.userId === userId);
      formState = {
        ...campaignDetails,
        ...formState,
        ...campaign,
        carouselTabs,
        splitTabs: splitTabConfig?.splitTabs,
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
        audience: audience?.length ? audience : location?.audience || []
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
      const payload = buildPayload(formState, type, location);
      const {
        status,
        data,
        message = EXCEPTION_OCCURRED
      } = await runSave(getAuthoringSaveButtonType(formType), () =>
        dispatch(saveMessagingCampaignNew({ payload, type, savedChannelsId, channelId, loading: false })),
      );
      setSaveCampaigData(data);
      if (status) {
        dispatch(updateMDCEditMode('edit'));
        const selectedAudience = formState?.audience ?? [];
        dispatch(updateChannelAudiences(mergeChannelAudiences('Whatsapp', selectedAudience, channelAudiences)));
      }
      if (status && getTestType() > 1) {
        setValue('savedChannelResponseDetailId', {
          smsChannelDetailId: data?.SMSChannelDetailID ?? 0,
          waChannelDetailId: data?.waChannelDetailId ?? 0
        });
        // setValue('schedule', '');
        const channelDetailIdObj = { waChannelDetailId: data?.waChannelDetailId };
        await dispatch(
          getMessagingCampaignByIdNew({
            payload: {
              clientId,
              userId,
              departmentId,
              levelNumber,
              actionId,
              campaignId: location?.campaignId,
              // smsChannelDetailId: 0,
              ...channelDetailIdObj
            },
            type,
            campaignType: _get(location, 'campaignType', 'S'),
          })
        );
        formTypeRef.current = null;
      } else if (!status && message?.includes('exceeds')) {
        setError(`schedule`, {
          type: 'custom',
          message: GIVEN_DATE_IS_EXCEEDS
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
          dispatch(resetCreateCommunication());
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
                  index: 0
                });
              }
            }, 5000);
          } else {
            if (campaign.campaignType === 'M') {
              handleMdcNavigation({ data });
            } else {
              navigate('/communication', {
                index: 0
              });
            }
          }
        } else {
          setError(`schedule`, {
            type: 'custom',
            message
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
            [false, true, '']
          );
        } else {
          UpdateState(
            setState,
            ['isScheduled', 'sentCommunicationModal', 'testSentCommunicationModal'],
            [false, true, message]
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
          index: 0
        });
      } else {
        handleNavigation();
      }
    }
    } finally {
      endSubmit();
    }
  };

  const fetchTemplate = async (languageId, senderId) => {
    const payload = {
      senderId,
      languageId,
      departmentId,
      userId,
      clientId
    };

        const response = await hsmTemplateLoader.refetch({
            fetcher: ({ payload: hsmPayload } = {}) =>
                dispatch(
                    getHsmTemplateNew({
                        payload: hsmPayload,
                        loading: false,
                    }),
                ),
            mode: savedChannel ? 'edit' : 'create',
            loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
            params: { payload },
        });
        return response;
    };

    const fetchTemplateLanguge = async (senderId) => {
        const payload = {
            senderId,
            departmentId,
            clientId,
            userId,
        };
        const response = await templateLanguageLoader.refetch({
            fetcher: ({ payload: languagePayload } = {}) =>
                dispatch(
                    getTemplateLanguage({
                        payload: languagePayload,
                        loading: false,
                    }),
                ),
            mode: savedChannel ? 'edit' : 'create',
            loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
            params: { payload },
        });
        return response;
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
      totalCount
    });

    setTemplatePhone({
      code: phone,
      value: value,
      formattedvalue: formattedvalue,
      formatCode: value.format.slice(formattedvalue?.length + 1 - value.format?.length),
      totalCount
    });
    setValue('mobile', formattedvalue);
    dialCode.current = phone;
  };
  //  console.log('mobile: ', mobile);
  const handleTemplateType = (
  templatesObj = {},
  isSplitAB = false,
  fieldName = '',
  langCode = '',
  isEdit = false) =>
  {
    const currentType = isEdit ?
    langCode :
    isSplitAB ?
    getValues(`${fieldName}.templateType`) :
    getValues('templateType');
    const currentLanguage = isEdit ?
    langCode :
    isSplitAB ?
    getValues(`${fieldName}.templateLanguage`) :
    getValues('templateLanguage');
    const templates = templatesObj[currentLanguage?.languageCode];
    if (!templates || !Array.isArray(templates)) {
      return { availableTypes: [], availableTemplateData: [] };
    }
    const typewiseData = {
      basic: [],
      carousel: []
    };

    templates.forEach((template, index) => {
      try {
        if (!template || Object.keys(template).length === 1) {
          return;
        }
        if (Array.isArray(template.carousel) && template.carousel.length > 0) {
          typewiseData.carousel.push(template);
        } else {
          // Empty and null template and waTemplateId
          if (template?.waTemplateId && template?.templateName) {
            typewiseData.basic.push(template);
          }
        }
      } catch (error) {
      }
    });
    const capitalizeFirstLetter = (str) => {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    const availableTypes = Object.entries(typewiseData).
    filter(([_, value]) => Array.isArray(value) && value.length > 0).
    map(([key], index) => ({
      templateTypeId: key,
      templateType: key,
      labelText: capitalizeFirstLetter(key)
    }));

    const availableTemplateData = typewiseData[currentType?.templateType] || [];

    return {
      availableTypes,
      availableTemplateData
    };
  };
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
        text: ''
      });
    }
  };

  useEffect(() => {
    !splitTest &&
      setEmptySplitDate({
        text: ''
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
          state
        });
      } else {
        navigate('/communication', {
          index: 0
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
                        channelType: 'WA',
                    },
                    isFilter: true,
                },
            });
        }
    };

  const fetchAudience = async () => {
    const { segmentationListId } = campaignDetails;
    await handleAudienceInEdit(segmentationListId);
    if (filterAudienceList?.length) {
      reset((formState) => ({
        ...formState,
        audience: filterAudienceList
      }));
    }
  };
  useEffect(() => {
    if (
    checkTrigger(location?.campaignType, location?.endDate) ||
    !statusIdCheck(
      hasCampaignDetails(campaignDetails) && validateChannel() && campaignDetails?.content?.length ?
      getCampaignStatusId(campaignDetails) :
      null,
      _get(location, 'campaignType', 'S'),
      campaignDetails
    ) ||
    checkRFAApproved(
      getCampaignStatusId(campaignDetails),
      campaignDetails?.requestForApproval?.approvarList
    ))
    {
      setIsClickOff(true);
    } else {
      setIsClickOff(false);
    }
  }, [location?.campaignType, location?.endDate, campaignDetails?.content?.[0]?.statusId]);
  useEffect(() => {
    if (hasCampaignDetails(campaignDetails) && type && savedChannel && location?.campaignType === 'S') {

      // fetchAudience();
    }}, [campaignDetails, editBindAuidenceRef, filterAudienceList, type]);

  const shouldDisableAutoRefresh = handleAutoRefreshClickOff(audience);
  useEffect(() => {
    if (shouldDisableAutoRefresh) {
      setValue('isAutoRefereshenabled', false);
    }
  }, [audience]);
  function numberToLetter(n) {
    if (n < 1 || n > 26) return null;
    return String.fromCharCode(96 + n);
  }
  function handleTemplate(templateDetails = {}, isSplitAB = false, fieldName = '', isEdit = false, content) {
    const {
      actions,
      bodyMaxLength,
      bodyTags,
      carousel,
      footer,
      footerMaxLength,
      footerTags,
      header,
      headerMaxLength,
      headerTags,
      isAction,
      isBodyEditable,
      isCarousel,
      isFooter,
      isFooterEditable,
      isHeader,
      isHeaderEditable,
      isMedia,
      isHeaderType,
      isMediaTypeEditable,
      isUnicode,
      languageId,
      mediaSizeInMB,
      mediaType: selectTemplateMediaType,
      mediaURL: selectTemplate,
      mediaURLTags,
      mediaUrlMaxLength,
      templateContent,
      templateName: selectTemplateName,
      templateType: selectTemplateType,
      waTemplateId,
      mediaURL
    } = templateDetails;

    // 1. Build your complete form data structure first

    function mbToBytes(mb, useDecimal = false) {
      const factor = useDecimal ? 1000 * 1000 : 1024 * 1024;
      return mb * factor;
    }

    const formData = {};
    if (isCarousel) {
      const cTabs = [];
      const tempCarouselTabs = [];

      carousel?.forEach((item, ind) => {
        const tabKey = `carousel${numberToLetter(ind + 1)?.toUpperCase()}`;
        const { cardBody, actions, mediaValue, actionType } = item;

        formData[tabKey] = {
          editorText: cardBody || '',
          actions:
          actions?.map((action, id) => ({
            actionName: action?.actionName,
            actionValue: action?.value,
            actionControls: action,
            actionType: {
              text: action?.actionType,
              value: id
            }
          })) || [],
          interactivity: !!actions?.length,
          previewImage: mediaValue,
          customParams:
          extractPlaceholders(cardBody)?.map((param) => ({
            value: '',
            placeholder: param.placeholder,
            startPosition: param.start,
            endPosition: param.end
          })) || []
        };

        cTabs.push(tabKey);

        tempCarouselTabs.push({
          id: ind + 1,
          text: `Carousel ${numberToLetter(ind + 1)?.toUpperCase()}`,
          disable: false,
          data: item,
          splitName: isSplitAB ? fieldName : '',
          carouselName: tabKey || '',
          component: () =>
          <WATextEditor
            templateResponse={{ ...templateDetails, currData: item }}
            fieldName={isSplitAB ? `${fieldName}.${tabKey}` : tabKey}
            isCarousel
            key={tabKey}
            index={ind}
            isSplitTabs={isSplitAB}
            splitName={isSplitAB ? fieldName : ''} />


        });
      });

      formData.editorText = templateContent || '';
      formData.templateContentParams =
      extractPlaceholders(templateContent)?.map((param) => ({
        value: '',
        placeholder: param.placeholder,
        startPosition: param.start,
        endPosition: param.end
      })) || [];
      formData.header = '';
      formData.footer = '';
      //setCarouselTabs(tempCarouselTabs);
      if (isSplitAB) {
        setCarouselTabs((prev) => {
          const { carousel, ...rest } = prev;
          return {
            ...rest,
            [fieldName]: tempCarouselTabs
          };
        });
      } else {
        setCarouselTabs((prev) => ({
          carousel: tempCarouselTabs
        }));
      }
    } else {
      let finalHeaderType = [`${isHeaderType}Url`];
      if (isEdit && content?.waMediaURL) {
        let mediaTypeKey = detectFileType(content?.waMediaURL);
        if (mediaTypeKey) {
          finalHeaderType = [`${mediaTypeKey}Url`];
        } else {
          finalHeaderType = [`${isHeaderType}Url`];
        }
      }
      formData.editorText = templateContent || '';
      formData.actions =
      actions?.map((action, id) => ({
        actionName: action?.actionName || '',
        actionValue: action?.value || '',
        actionControls: action || '',
        actionType: {
          text: action?.actionType,
          value: id
        }
      })) || [];
      formData.interactivity = isAction || false;
      formData.header = isHeader ? header : '';
      formData.footer = isFooter ? footer : '';
      formData.templateContentParams =
      extractPlaceholders(templateContent)?.map((param) => ({
        value: '',
        placeholder: param.placeholder,
        startPosition: param.start,
        endPosition: param.end
      })) || [];
      const isLocationType = selectTemplateMediaType === 'location';
      let parsedLocation = {};
      let locationValue = content?.mediaValue || content?.waMediaURL || content?.waImagePath;
      if (isLocationType && isEdit && locationValue) {
        try {
          parsedLocation = typeof locationValue === 'string' ? JSON.parse(locationValue) : locationValue;
        } catch (_) {
          parsedLocation = {};
        }
      }
      formData.previewImage =
      isLocationType ?
      '' :
      isEdit && content?.waMediaURL ?
      content?.waMediaURL :
      isHeaderType && isHeaderType !== 'text' ?
      header || mediaURL :
      '';
      formData.headerType = isLocationType ?
      {
        defaultPreview: false,
        image: undefined,
        imageType: 'Url',
        selectImport: false,
        isHeaderEditable: true,
        mediaSize: mbToBytes(mediaSizeInMB || 0),
        locationName: parsedLocation.name ?? '',
        locationAddress: parsedLocation.address ?? '',
        latitude: parsedLocation.latitude ?? '',
        longitude: parsedLocation.longitude ?? ''
      } :
      {
        defaultPreview: false,
        image: undefined,
        imageType: 'Url',
        selectImport: false,
        [finalHeaderType]:
        isEdit && content?.waMediaURL ?
        content?.waMediaURL :
        isHeaderType && isHeaderType !== 'text' ?
        header || mediaURL :
        '',
        isHeaderEditable: true, //isHeaderEditable,
        mediaSize: mbToBytes(mediaSizeInMB || 0)
      };
      if (isHeader) {
        formData.headerParams =
        extractPlaceholders(header)?.map((param) => ({
          value: '',
          placeholder: param.placeholder,
          startPosition: param.start,
          endPosition: param.end
        })) || [];
      }

      if (isFooter) {
        formData.footerParam =
        extractPlaceholders(footer)?.map((param) => ({
          value: '',
          placeholder: param.placeholder,
          startPosition: param.start,
          endPosition: param.end
        })) || [];
      }
      const keyName = isSplitAB ? fieldName : 'carousel';
      carouselTabs?.[keyName]?.forEach((key) => {
        setValue(`${keyName}.${key?.carouselName}`, {});
      });
      if (isSplitAB) {
        setCarouselTabs((prev) => {
          const { carousel, ...rest } = prev;
          return {
            ...rest,
            [fieldName]: []
          };
        });
      } else {
        setCarouselTabs((prev) => ({
          carousel: []
        }));
      }
    }

    if (!isEdit) {
      Object.entries(formData).forEach(([name, value]) => {
        const keyName = isSplitAB ? `${fieldName}.${name}` : name;
        setValue(keyName, value, {
          shouldDirty: true,
          shouldTouch: false,
          shouldValidate: false
        });
      });
    }
    return formData;
    // reset((formState) => ({
    //     ...formState,
    //     ...temp,
    // }));
  }
  const buildChannelPayload = (content) => {
    const mdcDetails = _get(location, 'mdcContentSetupDetails', {});
    const isMDCCampaign = campaign?.campaignType === 'M';
    const channelName = isMDCCampaign ? '' : _get(mdcDetails, 'name', '').toLowerCase();

    return {
      departmentId,
      clientId,
      userId,
      campaignId: campaign?.campaignId,
      blastType: splitTest ? splitObj?.[splitTabConfig?.currentTab ?? 0] : '',
      channelId: 21,
      goalNo: content?.goalNo ?? 0,
      blastNo: isMDCCampaign ? _get(mdcDetails, 'levelNumber', '') : 1,
      parentChannelDetailId: isMDCCampaign ? _get(mdcDetails, 'parentChannelDetailId', 0) : 0,
      actionId: isMDCCampaign ? _get(mdcDetails, 'actionId', 0) : 1,
      senderId: senderName?.senderName,
      subSegmentId: _get(mdcDetails, 'subSegmentId', 0)
    };
  };

    const contextValue = useMemo(
        () => ({
            type,
            smsPreview,
            carouselTabs,
            levelNumber,
            smartLinks,
            preview,
            campaign,
            isFailure,
            dataSource,
            setSmsPreview,
            formSubmitHandler,
            setCarouselTabs,
            setPreview,
            setCampaign,
            setIsFailure,
            isClickOff,
            buildChannelPayload,
            handleTemplate,
            handleTemplateType,
            fetchTemplate,
            isTemplateLanguageLoading: templateLanguageLoader.isLoading,
            isHsmTemplateLoading: hsmTemplateLoader.isLoading,
        }),
        [
            carouselTabs,
            type,
            smsPreview,
            levelNumber,
            preview,
            campaign,
            isFailure,
            smartLinks,
            isClickOff,
            dataSource, splitTabConfig,
            templateLanguageLoader.isLoading,
            hsmTemplateLoader.isLoading,
        ],
    );

  const confiramationModalConfig = [
  {
    key: 'issplitOffConfirmationModal',
    show: state.issplitOffConfirmationModal,
    text: SPLIT_AB_TURNOFF,
    primaryButtonText: OK,
    handleClose: () => UpdateState(setState, 'issplitOffConfirmationModal', false),
    handleConfirm: () => refreshSplitABTab(true),
    primaryButton: true
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
    primaryButton: true
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
    primaryButton: true
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
    primaryButton: true
  },
  {
    key: 'isWhatsAppError',
    show: state.isWhatsAppError?.show,
    text: state.isWhatsAppError.message,
    handleClose: () => UpdateState(setState, 'isWhatsAppError', { message: '', show: false }),
    handleConfirm: () => {},
    primaryButton: false
  }];


    return (
        <MessagingContext.Provider value={contextValue}>
            <AuthoringChannelEditSkeletonGate
                channelId={channelId}
                showEditSkeleton={showEditSkeleton}
                isSavedChannel={isSavedChannel}
            >
            <FormProvider {...methods}>
                <form
          className="rsv-tabs-content position-relative allow-copy"
          onSubmit={handleSubmit((data) => formSubmitHandler(data))}>
          
                    <div className={`box-design bd-top-border  ${isClickOff ? 'pe-none click-off' : ''}`}>
                        {/* {!smartLink1 && !tabSmartLink_Flag && state?.isSmartLink && ( */}
                        {!tabSmartLink_Flag && tabSmartLink_Flag !== null && !isClickOff && levelNumber < 2 &&
            <SmartLinkEnable
              onSave={() => UpdateState(setState, 'isSmartLink', false)}
              onReject={() => {
                dispatch(showTabsSmartlink(true));
                UpdateState(setState, 'isSmartLink', false);
              }} />

            }
                        <div className="form-group mt20">
                                <Row>
                                    <Col sm={{ offset: 1, span: 2 }}>
                                        <label className="control-label-left">
                                            {SENDER} name
                                        </label>
                                    </Col>
                                    <Col sm={6} id="rs_Messaging_SenderId">
                                        <div>
                                            <RSKendoDropDownList
                                                control={control}
                                                name="senderName"
                                                data={senderNameList}
                                                dataItemKey="clientWASenderId"
                                                textField="senderName"
                                                label={SENDER_NAME}
                                                isLoading={senderNameLoader.isLoading}
                                                rules={{
                                                    required: Select_SENDER_NAME,
                                                }}
                                                handleChange={({ value }) => {
                                                    fetchTemplateLanguge(_get(value, 'clientWASenderId', 0));
                                                    setValue('templateLanguage', '');
                                                    setValue('templateName', '');
                                                }}
                                                required
                                                disabled={!!senderName}
                                                footer={
                                                    <span id="rs_Messaging_Setting">
                                                        <RSDropdownFooterBtn
                          title={ADD_SENDER_ID}
                          handleClick={() =>
                          navigate('/preferences/communication-settings', {
                            state: createCommunicationSettingsNavState('messaging', {
                              mode: 'add',
                              subfrom: 'MP',
                              messagingTabId: MESSAGING_TAB_ID.WHATSAPP,
                              backAction: window.location.search,
                              tabValueName: 'messaging',
                              tabValue: 'whats app',
                            }, location, getValues),
                          })
                          } />
                        
                                                    </span>
                      } />
                    
                                        </div>
                                    </Col>
                                    <Col sm={3} className="rs_input_icons_groups">
                                                {!!senderName &&
                  <RSTooltip text={RESET} className="input_icon" position="top">
                                                        <i
                      id="rs_data_refresh"
                      className={`${restart_medium} icon-md color-primary-blue`}
                      onClick={() => {
                        UpdateState(setState, 'isRefresh', true);
                      }} />
                    
                                                    </RSTooltip>
                  }
                                        </Col>
                                </Row>
                            </div>
                        {campaign.campaignType === 'S' &&
            <div className="form-group" ref={audienceRef}>
                                <AudienceFieldRenderComponent
                                    type="whatsapp"
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
                      popover_content={AUTO_REFRESH_POP_HOVER_TEXT} />
                    
                                            </span>
                                            <small>
                                                
                                                {AUDIENCE}:  {handleTotalAudienceCount(campaignDetails, watchtotalAudience, calucateAudienceCount)}
                                            </small>
                                        </div>
                }
                audienceTextField="audienceWhatsapp"
                handleAudienceFieldOnChange={() => {
                  setTimeout(() => {
                    if (
                    splitTest &&
                    splitTabConfig?.splitTabs?.length >= 2 &&
                    calucateAudienceCount > 0)
                    {
                      const defaultSplittedCount = calculateDefaultSplittedCount(
                        splitTabConfig?.splitTabs.length,
                        calucateAudienceCount,
                        splitTabConfig?.splitTabs
                      );
                      setSliderState((prev) => ({
                        ...prev,
                        splittedCount: defaultSplittedCount
                      }));
                    }
                  }, 0);
                }} />
              
                            </div>
            }
                        {(campaign.campaignType === 'S' ||
            campaign.campaignType === 'M' && dataSource === 'TL' && levelNumber === 1) &&
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
                                                        const initialSplitTabs = ['splitA', 'splitB'];
                                                        setSplitTabConfig({
                                                            currentTab: 0,
                                                            splitTabs: initialSplitTabs,
                                                        });

                                                        if (calucateAudienceCount > 0) {
                                                            const defaultSplittedCount = calculateDefaultSplittedCount(
                                                                initialSplitTabs.length,
                                                                calucateAudienceCount,
                                                                initialSplitTabs,
                                                            );
                                                            setSliderState((prev) => ({
                                                                ...prev,
                                                                splittedCount: defaultSplittedCount,
                                                            }));
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
                                                {splitTest &&
                    <Fragment>
                                                        <RSTooltip text={ADJUST_SPLIT_SIZE} className="lh0 mr15">
                                                            <i
                          className={`${adjust_split_medium} icon-md color-primary-blue`}
                          onClick={() =>
                          setSliderState((prev) => ({
                            ...prev,
                            show: true
                          }))
                          } />
                        
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
                                  text: `Schedule  ${emptySplit} `
                                }));
                                setTimeout(() => {
                                  setEmptySplitDate(() => ({
                                    text: ``
                                  }));
                                }, 3000);
                                isError[tab] = true;
                              } else {
                                isError[tab] = false;
                              }
                            });
                            handleAutoScheduleModal(isError);
                          }}>
                        </i>
                                                        </RSTooltip>
                                                    </Fragment>
                    }
                                                <RSPPophover text={SPLIT_AB_TOOLTIP_TEXT}>
                                                    {!splitTest ?
                      <i
                        className={`${circle_question_mark_mini} icon-xs color-primary-blue position-relative`}
                        id="circle_question_mark">
                      </i> :

                      <i
                        className={`${circle_question_mark_medium} icon-md color-primary-blue`}
                        id="circle_question_mark">
                      </i>
                      }
                                                </RSPPophover>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
            }
                        {/* {isWhatsapp && senderName && (
                 <div className={`form-group `}>
                     <Row>
                         <Col sm={{ offset: 1, span: 2 }}>
                             <label className="control-label-left">{LANGUAGE}</label>
                         </Col>
                         <Col sm={6} id="rs_Messaging_templatelanguage">
                             <RSKendoDropDownList
                                 control={control}
                                 name={'templateLanguage'}
                                 data={templateLanguageList}
                                 dataItemKey={'waTemplateId'}
                                 textField={'languageCode'}
                                 label={TEMPLATE_LANGUAGE}
                                 required
                                 rules={{
                                     required: SELECT_TEMPLATE_LANGUAGE,
                                 }}
                                 handleChange={({ value }) =>
                                     fetchTemplate(
                                         _get(value, 'languageCode', 'en'),
                                         _get(getValues('senderName'), 'clientWASenderId', 0),
                                     )
                                 }
                             />
                         </Col>
                     </Row>
                 </div>
              )} */}

                        {/* {isWhatsapp && templateLanguage && (
                 <div className={`form-group`}>
                     <Row>
                         <Col sm={{ offset: 1, span: 2 }}>
                             <label className="control-label-left">{TEMPLATE_TYPE}</label>
                         </Col>
                         <Col sm={6} id="rs_Messaging_templateName">
                             <RSKendoDropDownList
                                 control={control}
                                 name={'templateType'}
                                 label={TEMPLATE_TYPE}
                                 dataItemKey={'templateTypeId'}
                                 textField={'labelText'}
                                 data={categorizeTemplates?.availableTypes ?? []}
                                 required
                                 rules={{
                                     required: SELECT_TEMPLATE_TYPE,
                                 }}
                                 handleChange={({ value }) => {
                                     setValue('previewImage', '');
                                     setValue('templateName', '');
                                     setValue('waMediaURL', '');
                                     setValue('waMediaURLType', '');
                                     setValue('browserImage', '');
                                     setValue(`previewImage`, '');
                                     setValue(`uploadImage`, '');
                                 }}
                             />
                         </Col>
                     </Row>
                 </div>
              )}
               {templateLanguage && templateType && (
                 <div className={`form-group`}>
                     <Row>
                         <Col sm={{ offset: 1, span: 2 }}>
                             <label className="control-label-left">{TEMPLATE_NAME}</label>
                         </Col>
                         <Col sm={6} id="rs_Messaging_templateName">
                             <RSKendoDropDownList
                                 control={control}
                                 name={'templateName'}
                                 label={TEMPLATE_NAME}
                                 dataItemKey={'waTemplateId'}
                                 textField={'templateName'}
                                 data={categorizeTemplates?.availableTemplateData ?? []}
                                 required
                                 rules={{
                                     required: SELECT_TEMPLATE_NAME,
                                 }}
                                 handleChange={({ value }) => {
                                     // debugger;
                                     setTemplateName(value);
                                     handleTemplate(value);
                                     clearErrors()
                                     // setValue('editorText', value.templateContent);
                                     // setValue('previewImage', '');
                                     // setValue('waMediaURL', '');
                                     // setValue('waMediaURLType', '');
                                     // setValue('browserImage', '');
                                     // setValue(`previewImage`, '');
                                     // setValue(`uploadImage`, '');
                                 }}
                             />
                         </Col>
                     </Row>
                 </div>
              )} */
            }

                        {sliderState.show &&
            <SplitSlider
              audienceCount={calucateAudienceCount}
              splitTabs={splitTabConfig?.splitTabs}
              sliderData={sliderState.splittedCount}
              onSave={(slider) => {
                setSliderState({
                  show: false,
                  splittedCount: slider
                });
              }}
              handleClose={() =>
              setSliderState((prev) => ({
                ...prev,
                show: false
              }))
              } />

            }
                        {splitTest &&
            <div className="no-scroll-rs-content-tabs" ref={tabberRef}>
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
                    currentTab: index
                  }));
                  setValue('channelType', type);
                }}
                onAddMenu={(index) => addSplitTabs(index)}
                onRemoveMenu={removeSplitTabs}
                onRefresh={refreshSplitABTab} />
              
                            </div>
            }
                        {!splitTest &&
            <SplitAB
              isSplitTabs={false}
              levelNumber={levelNumber}
              channelTabName={type}
              campaignType={campaign.campaignType}
              templateType={templateName?.templateType}
              waSelectedTemplate={templateName}
              // smsPreview={smsPreview}
              // setSmsPreview={setSmsPreview}
            />
            }
                        {/* levelNumber added for MDC --- if levelNumber gerater than 1 disable schedule  */}

                        {/* <div className={`form-group mb0`}>
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
              </div> */

            }

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
                            isPhoneLoading={contactLoader.isLoading}
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
                                testEmail: true,
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
                  const savedChannelResponseDetailId = waChannelDetailId;

                  const data = {
                    data: {
                      SMSChannelDetailID: smsChannelDetailId,
                      waChannelDetailId: waChannelDetailId
                    }
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
                      index: 0
                    }
                  });
                }
              }}
              id="rs_Messaging_Cancel">
              
                            {CANCEL}
                        </RSSecondaryButton>
                        {disableNext &&
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

                  // Only show modal if CG/TG conflict exists and user hasn't confirmed yet (skip in RUN env - handled in audience)
                  if (isCTGTConfirm && !hasUserConfirmed && !handleCGTGModalCheck(campaignDetails?.content?.[0]?.statusId)) {
                    setPendingNextSubmitParams({ type: 'save', isSchedule: true });
                    setNextButtonCGTGModal(true);
                    return;
                  }

                  handleSubmit(
                    (data) => formSubmitHandler(data, 'save', true),
                    (errs) => scrollToHeaderError(errs)
                  )();
                }}
                id="rs_Messaging_Save"
                isLoading={isSaveLoading}
                blockBodyPointerEvents
                disabledClass={isSubmitting ? 'pe-none click-off' : ''}>
                
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
                  !hasCampaignDetails(campaignDetails))
                  {
                    UpdateState(setState, 'isNavigationConfirmation', true);
                    return;
                  } else if (Object.keys(errors).includes('approvalList')) {
                    return;
                  }
                  const formData = getValues();
                  const isCTGTConfirm = handleCheckCTGT(formData.audience);
                  const hasUserConfirmed = formData.isCGTGConfirm === true;

                  // Only show modal if CG/TG conflict exists and user hasn't confirmed yet (skip in RUN env - handled in audience)
                  if (isCTGTConfirm && !hasUserConfirmed && !handleCGTGModalCheck(campaignDetails?.content?.[0]?.statusId)) {
                    setPendingNextSubmitParams({ type: 'form', isSchedule: true });
                    setNextButtonCGTGModal(true);
                    return;
                  }

                  handleSubmit(
                    (data) => formSubmitHandler(data, 'form', true),
                    (errs) => scrollToHeaderError(errs)
                  )();
                }}
                id="rs_Messaging_Next">
                
                                    {mCampType === 'M' ?
                `${mdcButtonText} WhatsApp content` :
                NEXT}
                                </RSPrimaryButton>
                            </>
            }
                    </div>
                </form>
                {/* Modals */}
                <SplitABScheduleModal
          tabs={splitTabConfig?.splitTabs}
          type="messaging"
          show={state.isShowScheduleModal}
          handleClose={() => UpdateState(setState, 'isShowScheduleModal', false)}
          editAutoScheduleDetails={editAutoScheduleDetails} />
        
                {confiramationModalConfig.map((modal) =>
        <RSConfirmationModal
          key={modal?.key || modal?.text}
          header={modal?.key === 'isRefresh' ? RESET : CONFIRMATION}
          show={modal.show}
          text={modal.text}
          primaryButtonText={modal.primaryButtonText}
          handleClose={modal.handleClose}
          handleConfirm={modal.handleConfirm}
          primaryButton={modal?.primaryButton} />

        )}
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
          )}
          <RSConfirmationModal
             show={state.isRefresh}
             text={ARE_YOU_SURE_REFRESH}
             handleClose={() => {
                 UpdateState(setState, 'isRefresh', false);
             }}
             handleConfirm={() => {
                 clearErrors();
                 resetState();
                 UpdateState(setState, 'isRefresh', false);
             }}
          /> */
        }
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
              campaign.campaignType === 'M' ?
              handleMdcNavigation({ data: saveCampaigData }) :
              handleNavigation();
            }
            UpdateState(
              setState,
              ['sentCommunicationModal', 'rfaMsg', 'requestFalse'],
              [false, false, '']
            );
          }} />
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
              userId
            };
            await handlePersonalizationFetchApiCall({
              audience: watch('audience'),
              errors,
              dispatch,
              payloadParams,
              listTypeWisePersonlization
            });
            setIsAudienceChangeConfirm(false);
          }} />
        
                <RSConfirmationModal
          show={audienceCountZeroWarning}
          text={AUDIENCE_COUNT_ZERO_ENABLE_AUTO_REFRESH}
          primaryButtonText="OK"
          handleClose={() => setAudienceCountZeroWarning(false)}
          handleConfirm={() => setAudienceCountZeroWarning(false)}
          secondaryButton={false}
          header={WARNING} />
        
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
          }} />
        
            </FormProvider>
            </AuthoringChannelEditSkeletonGate>
        </MessagingContext.Provider>
    );
};

export default Messaging;