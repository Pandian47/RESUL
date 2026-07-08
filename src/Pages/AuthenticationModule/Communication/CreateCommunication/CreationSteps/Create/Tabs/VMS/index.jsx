import { checkRFAApproved, checkTrigger, statusIdCheck } from 'Utils/modules/campaignUtils';
import { getmasterData } from 'Utils/modules/masterData';
import { createCommunicationSettingsNavState, MESSAGING_TAB_ID } from 'Utils/modules/navigation';
import { encodeUrl } from 'Utils/modules/crypto';

import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { buildPayload, FORM_INITIAL_STATE, PROVIDER_POPOVER_TEXT, VMS_CONTENT_TAB_CONFIG } from './constant';
import { SELECT_PROVIDER } from 'Constants/GlobalConstant/ValidationMessage';
import { AUDIENCE_CHANGE_CONFIRMATION, AUDIENCE_COUNT_ZERO_ENABLE_AUTO_REFRESH, AUTO_REFRESH, AUTO_REFRESH_POP_HOVER_TEXT, CANCEL, COMMUNICATION_SCHEDULED, IGNORE_CHANNEL, OK, PROVIDER, SAVE, SEND, VMS_CONTENT, VOICE_MESSAGE, WARNING } from 'Constants/GlobalConstant/Placeholders';
import { circle_question_mark_mini, refresh_medium, restart_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { get as _get, find as _find, isEmpty as _isEmpty, cloneDeep as _cloneDeep } from 'Utils/modules/lodashReplacements';
import { Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FormProvider, useForm } from 'react-hook-form';

import RSTabber from 'Components/RSTabber';
import RSPPophover from 'Components/RSPPophover';
import Scheduler from '../../Component/Scheduler';
import RSReactPhoneInput from 'Components/FormFields/RSPhoneInput/RSReactPhoneInput';
import RSConfirmationModal from 'Components/ConfirmationModal';
import RSKendoDropDown from 'Components/FormFields/RSKendoDropdown';
import RSDropdownFooterBtn from 'Components/DropdownFooterBtn';
import CommunicationSent from '../../Component/CommunicationSent/CommunicationSent';
import AuthoringChannelEditSkeletonGate, {
    AUTHORING_FIELD_LOADER_CONFIG,
    getAuthoringEditFieldLoaderConfig,
    getAuthoringSaveButtonType,
    resetAuthoringChannelEditSession,
    useAuthoringChannelEditLoader,
    useAuthoringChannelSaveLoader,
} from 'Components/Skeleton/pages/communication/authoring';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { resetCreateCommunication, updateDirtyState, updateTab, updateVerticalTab, updateVmsList, updateAudience, updateFilterAudience, updateTotalAudienceCount } from 'Reducers/communication/createCommunication/Create/reducer';
import { availableTabs, communicationChannels, handleAutoRefreshClickOff, handlePersonalizationFetchApiCall, AudienceFieldRenderComponent, audienceTypeList, handleMDCQueryParamsUpdate, handleCheckCTGT, validateAudienceCount, mergeChannelAudiences, handleUpdateEditAudienceCount,handleTotalAudienceCount, handleCGTGModalCheck, getPastPlanDurationBlockedState, validatePastPlanDurationOnSubmit, PAST_PLAN_DURATION_CLICK_OFF_CLASS , shouldPromptSkipChannelConfirmation} from '../../constant';
import {
    ensureArray,
    ensureObject,
    normalizeChannelCampaignData,
    ensureSegmentationListIds,
    sumAudienceCountByField,
    hasCampaignDetails,
    getCampaignStatusId,
} from 'Pages/AuthenticationModule/Communication/CreateCommunication/communicationDefaults';
import { getSessionId, getUtcTimeData } from 'Reducers/globalState/selector';
import { getUtcTimeNow } from 'Reducers/globalState/request';
import {
    getAudience,
    getFilterAudience,
    getVmsDetails,
} from 'Reducers/communication/createCommunication/Create/selectors';
import {
    getAudienceList,
    getVmsLanguage,
    getVMSTemplate,
    getVmsCampaign,
    getVmsSenderName,
    saveVms,
} from 'Reducers/communication/createCommunication/Create/request';

import useQueryParams from 'Hooks/useQueryParams';
import useApiLoader from 'Hooks/useApiLoader';
import VMSContext from './context';
import { COUNTRY_MASK, getTestType } from './constant';
import { updateSaveChannelsId, updateChannelAudiences } from 'Reducers/communication/createCommunication/plan/reducer';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import RSTooltip from 'Components/RSTooltip';
const VMS = ({ mCampType, channelId }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    // const location = useLocation();
    const location = useQueryParams('/communication');
    // const dialCode = useRef('');
    // const phoneNumber = useRef();
    const formTypeRef = useRef();
    const isAlreadyEditCallRef = useRef(false);
    const [defaultTab, setTab] = useState(null);
    const [navigate_confirm, setNavigate_confirm] = useState(false);
    const [isAudienceChangeConfirm, setIsAudienceChangeConfirm] = useState(false);
    const [previousAudience, setPreviousAudience] = useState([]);
    const [nextButtonCGTGModal, setNextButtonCGTGModal] = useState(false);
    const [pendingNextSubmitParams, setPendingNextSubmitParams] = useState(null);
    const [audienceCountZeroWarning, setAudienceCountZeroWarning] = useState(false);
    const [campaign, setCampaign] = useState({});
    const [mdcContentSetupDetails, setMdcContentSetupDetails] = useState({});
    const [levelNumber, setLevelNumber] = useState(1);
    const [actionId, setActionId] = useState(0);
    const [mdcChannelDetailId, setMdcChannelDetailId] = useState(0);
    const [mdcAudience, setMdcAudience] = useState([]);
    const [dataSource, setDataSource] = useState('TL');
    const { timeZoneList } = getmasterData();
    const [isEditVMSFail, setIsEditVMSFail] = useState(false);
    const [isClickOff, setIsClickOff] = useState(false);

    const [mask, setMask] = useState(COUNTRY_MASK);
    const [country, setCountry] = useState('');
    const [longNumber, setLongNumber] = useState(52);
    const [isMobielValidate, setMobileValidate] = useState(false);

    // const { timeZoneList } = getUserDetails();
    const [requestFalse, setRequestFalse] = useState('');
    const [isScheduled, setScheduled] = useState(false);
    const [isComSent, setComSent] = useState(false);
    const [testSentCommunicationModal, settestSentCommunicationModal] = useState(false);

    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const { parentClientId, ...user } = useSelector((state) => getSessionId(state));
    const utcTimeData = useSelector(getUtcTimeData);

    const { senderName, campaignDetails, template, language } = useSelector((state) => getVmsDetails(state));
    const {
        voice,
        tabsState: { messaging: messagingTabState },
        activeTabs,
        verticalTab: { type: channelType, currentTab: currentVerticalTab },
        isDirty,
        personalization,
        listTypeWisePersonlization
    } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const { savedChannelsId, channelAudiences = {} } = useSelector(({ communicationPlanReducer }) => communicationPlanReducer);
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    // console.log(messagingTabState, 'messagingTabState');
    const filterAudienceList = useSelector((state) => getFilterAudience(state));

    const methods = useForm(_cloneDeep(FORM_INITIAL_STATE));
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

    const providerLoader = useApiLoader();
    const audienceLoader = useApiLoader();
    const templateLoader = useApiLoader();
    const languageLoader = useApiLoader();

    const {
        control,
        setError,
        formState: { defaultValues, dirtyFields, isValid, errors, ...formState },
        clearErrors,
        reset,
        handleSubmit,
        watch,
        setValue,
        getValues,
        trigger,
    } = methods;
    const [templatePhone, setTemplatePhone] = useState({});

    const dirty = { ...dirtyFields };
    let [audience, currentTab, provider, phoneNumber, err, editorText, scheduleTimezone] = watch([
        'audience',
        'currentTab',
        'provider',
        'phoneNumber',
        'err',
        'editorText',
        'timezone',
    ]);
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
    if (campaign?.campaignType === 'M' && levelNumber === 1) {
        audience = mdcAudience;
    }
    const audienceList = useSelector((state) => getAudience(state));
    const [vmsContent, setVmContent] = useState(false);

    let calucateAudienceCount = useMemo(
        () => sumAudienceCountByField(audience, 'recipientCountEmail'),
        [audience],
    );

    useEffect(() => {
        dispatch(updateTotalAudienceCount(calucateAudienceCount || 0));
    }, [calucateAudienceCount, dispatch]);

    useEffect(() => {
        if (!_isEmpty(voice['vms'])) reset(voice['vms']);
    }, []);
    useEffect(() => { }, [phoneNumber]);
    useEffect(() => {
        if (location && Object.keys(location)?.length) {
            /* MDC variables start*/
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
            setCampaign(campaign);
            setMdcContentSetupDetails(mdcContentSetupDetails);
            setLevelNumber(levelNumber);
            setActionId(actionId);
            setMdcChannelDetailId(mdcChannelDetailId);
            setMdcAudience(mdcAudience);
            setDataSource(dataSource);

            // For MDC create mode (no channelDetailId), set isCGTGEnabled from mdcContentSetupDetails
            if (campaign.campaignType === 'M' && !mdcChannelDetailId) {
                setValue('isCGTGEnabled', mdcIsCGTGEnabled);
            }
            /* MDC variables end*/
        }
    }, [location]);

    const getCampaignById = async (payload) => {
        if (mCampType === 'M' && mdcChannelDetailId < 1) {
            return { status: false };
        }
        return await dispatch(
            getVmsCampaign({
                payload: {
                    ...payload,
                    levelNumber,
                    actionId,
                    campaignId: _get(location, 'campaignId', 0),
                    channelDetailId: mdcChannelDetailId,
                },
                loading: false,
            }),
        );
    };
    const getRecipientList = async (payload) => {
        if (_get(location, 'campaignType', 'S') === 'M' || _get(location, 'campaignType', 'S') === 'T') {
            return [];
        }
        return await audienceLoader.refetch({
            fetcher: ({ payload: audPayload, isFilter = false } = {}) =>
                dispatch(getAudienceList({ payload: audPayload, isFilter, loading: false })),
            mode: savedChannel ? 'edit' : 'create',
            loaderConfig: editFieldLoaderConfig,
            params: {
                payload: {
                    ...payload,
                    // campaignId: _get(location, 'campaignId', 0),
                    // recipientListId: 0,
                    searchText: '',
                    segmentIds: [],
                    channelType: 'VMS',
                },
            },
        });
    };
    const getVmsSenderList = async (payload) => {
        return await providerLoader.refetch({
            fetcher: ({ payload: providerPayload } = {}) =>
                dispatch(getVmsSenderName({ payload: providerPayload, loading: false })),
            mode: savedChannel ? 'edit' : 'create',
            loaderConfig: editFieldLoaderConfig,
            params: { payload },
        });
    };
    const fetchEditFlow = async () => {
        const payload = {
            ...user,
        };
        if (_get(location, 'campaignId', 0) > 0 && !isAlreadyEditCallRef.current) {
            isAlreadyEditCallRef.current = true;
            if (savedChannel) {
                beginEditSkeleton();
            }
            try {
                const editApiResult = await Promise.all([
                    _get(location, 'campaignType', 'S') === 'S' && !audienceList?.length && getRecipientList(payload),
                    getVmsSenderList(payload),
                    savedChannel && getCampaignById(payload),
                ]);
                let [vmsRecipientData, vmsSenderData, vmsCampaignData] = editApiResult || [];
            const { status, data } = ensureObject(vmsCampaignData);
            if (status && hasCampaignDetails(data)) {
                const normalizedData = normalizeChannelCampaignData(data);
                const { segmentationListId, senderId, content, isCGTGEnabled } = normalizedData;
                const {
                    vmsTemplateId,
                    languageId,
                    audioFilePath,
                    content: editorText,
                    voiceRepeatCount,
                    localBlastDateTime,
                    vmsChannelDetailId,
                    timeZoneId,
                    retryCount,
                } = ensureArray(content)?.[0] || {};
                const temp = {};
                let templateList = [],
                    languageList = [];
                const provider = _find(ensureArray(vmsSenderData?.data), ['clientVMSSettingId', senderId]);
                const currentTab = audioFilePath?.length > 0 ? 1 : 0;
                const template = await fetchVMSTemplate(senderId);
                const language = await fetchVMSLanguge();
                const findTimeZone = _find(timeZoneList, ['timeZoneID', timeZoneId || 1]);
                if (template.status) templateList = template.data;
                if (language.status) languageList = language.data;
                temp.provider = provider;
                temp.audience = audience;
                temp.templateName = _find(templateList, ['vmsTemplateId', vmsTemplateId]);
                temp.language = _find(languageList, ['vMSLanguageId', languageId]);
                temp.currentTab = currentTab;
                temp.channelDetailId = vmsChannelDetailId;
                temp.editorText = `${editorText}`;
                temp.audioFilePath = audioFilePath;
                temp.audioPath = audioFilePath;
                temp.audioFile = audioFilePath;
                temp.repeat = audioFilePath?.length > 0 ? voiceRepeatCount : retryCount;
                temp.timezone = findTimeZone;
                temp.schedule = localBlastDateTime
                    ? new Date(localBlastDateTime)
                    : formState?.schedule
                        ? new Date(formState.schedule)
                        : '';
                temp.isCGTGEnabled = isCGTGEnabled ?? false;
                setTab(currentTab);
                const matchAudienceType = audienceTypeList?.filter((typeList) =>
                    ensureArray(audience)?.map((aud) => aud?.listType)?.includes(typeList?.id),
                );
                reset((formState) => ({
                    ...formState,
                    ...temp,
                    audienceType: matchAudienceType?.length ? matchAudienceType : [audienceTypeList[0]],
                }));
                location?.campaignType === 'M' &&
                    handleMDCQueryParamsUpdate({
                        ...mdcContentSetupDetails,
                        ...watch(),
                        ...campaignDetails,
                        ...data
                    }, location);
                _get(location, 'campaignType', 'S') === 'S' && (await handleAudienceInEdit(ensureSegmentationListIds(segmentationListId)));
                } else {
                    setIsEditVMSFail(true);
                }
            } catch {
                dispatch(updateVmsList({ data: {}, field: 'campaignDetails' }));
                setIsEditVMSFail(true);
            } finally {
                finishEditSkeleton();
            }
        }
    };
    useEffect(() => {
        if (campaign?.campaignId) fetchEditFlow();
    }, [campaign?.campaignId, mdcChannelDetailId]);

    // useEffect(() => {
    //     if (!_isEmpty(campaignDetails)) {
    //         const { content, segmentalocationaudtionListId, senderId } = campaignDetails;
    //         const temp = {};
    //         const audience = _filter(audienceList, (aud) => segmentationListId?.includes(aud.segmentationListId));
    //         const provider = _find(senderName, ['clientVMSSettingId', senderId]);
    //         const { localBlastDateTime, timeZoneId } = content;
    //         const timezone = _find(timeZoneList, ['timeZoneID', timeZoneId]);
    //         temp.schedule = localBlastDateTime ? new Date(localBlastDateTime) : '';
    //         temp.timezone = timezone;
    //         reset((formState) => ({ ...formState, audience, provider }));
    //     }
    // }, [campaignDetails]);

    // useEffect(() => {
    //     if (mdcChannelDetailId > 0 && !_isEmpty(campaignDetails) && !_isEmpty(senderName)) {
    //         const {
    //             senderId,
    //             content: [{ audioFilePath, content: editorText, retryCount, localBlastDateTime } = ary1],
    //         } = campaignDetails;
    //         const provider = _find(senderName, ['clientVMSSettingId', senderId]);
    //         const currentTab = audioFilePath ? 1 : 0;
    //         const schedule = localBlastDateTime ? new Date(localBlastDateTime) : '';
    //         setValue('provider', provider);
    //         setValue('currentTab', currentTab);
    //         setTab(currentTab);
    //         handleProviderChange({ value: provider });
    //         setValue('editorText', editorText);
    //         setValue('repeat', retryCount);
    //         setValue('schedule', schedule);
    //         //reset((formState) => ({ ...formState, audience, provider, currentTab }));
    //     }
    // }, [mdcChannelDetailId, campaignDetails, senderName]);

    // useEffect(() => {
    //     if (mdcChannelDetailId > 0 && !_isEmpty(campaignDetails) && !_isEmpty(senderName)) {
    //         const { timeZoneList } = getmasterData();
    //         const {
    //             content: [{ vmsTemplateId, languageId, timeZoneId } = ary1],
    //         } = campaignDetails;
    //         const templateName = _find(template, ['vmsTemplateId', vmsTemplateId]);
    //         const displayLanguage = _find(language, ['vMSLanguageId', languageId]);
    //         const timezone = _find(timeZoneList, ['timeZoneID', timeZoneId]);
    //         setValue('templateName', templateName);
    //         setValue('language', displayLanguage);
    //         setValue('timezone', timezone);
    //     }
    // }, [template, language]);

    useEffect(() => {
        if (!isDirty && Object.keys(dirtyFields)?.length > 0) {
            dispatch(updateDirtyState(true));
        } else {
            dispatch(updateDirtyState(false));
        }
    }, [JSON.stringify(isDirty)]);

    useEffect(() => {
        return () => {
            resetAuthoringChannelEditSession(isAlreadyEditCallRef, resetEditLoading);
            dispatch(updateAudience([]));
            dispatch(updateFilterAudience([]));
            dispatch(updateDirtyState(false));
        };
    }, [dispatch, resetEditLoading]);
    async function handleProviderChange({ value }) {
        const senderId = _get(value, 'clientVMSSettingId', 0);
        const payload = {
            ...user,
        };
        templateLoader.refetch({
            fetcher: () =>
                dispatch(
                    getVMSTemplate({
                        payload: { ...payload, vmsSettingid: senderId },
                        loading: false,
                    }),
                ),
            mode: savedChannel ? 'edit' : 'create',
            loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
        });
        languageLoader.refetch({
            fetcher: () => dispatch(getVmsLanguage({ payload, loading: false })),
            mode: savedChannel ? 'edit' : 'create',
            loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
        });
    }

    function handleNavigation() {
        resetAuthoringChannelEditSession(isAlreadyEditCallRef, resetEditLoading);
        reset(FORM_INITIAL_STATE.defaultValues);
        window.scrollTo(0, 0);
        //debugger;
        const tabIndex = messagingTabState.currentIndex + 1;
        if (availableTabs['messaging']?.length === tabIndex) {
            // dispatch(updateVoice({ field: 'vms', data: formState }));
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
        } else {
            dispatch(
                updateTab({
                    field: 'messaging',
                    data: {
                        tabName: availableTabs['messaging'][tabIndex],
                        currentIndex: tabIndex,
                    },
                }),
            );
        }
    }

    const handleMdcNavigation = ({ data }) => {
        dispatch(updateVmsList({ data: {}, field: 'campaignDetails' }));
        reset({});
        const { vmsChannelDetailId: channelResponseDetailId } = data;
        const mdcCanvasUrl = `/communication/mdc-workflow`;
        const state = { ...location, channelResponseDetailId, mode: `update` };
        const encryptState = encodeUrl(state);

        channelResponseDetailId &&
            navigate(`${mdcCanvasUrl}?q=${encryptState}`, {
                state,
            });
    };
    const handleMdcCancel = () => {
        dispatch(updateVmsList({ data: {}, field: 'campaignDetails' }));
        reset({});
        const mdcCanvasUrl = `/communication/mdc-workflow`;
        const state = { ...location };
        delete state.mdcContentSetupDetails;

        const encryptState = encodeUrl(state);
        navigate(`${mdcCanvasUrl}?q=${encryptState}`, {
            state,
        });
    };
    const handleSaveChannelIds = () => {
        const finalSavedChannelId = { ...savedChannelsId };
        if (savedChannelsId[channelId]?.includes(channelId)) {
            finalSavedChannelId[channelId] = [...savedChannelsId[channelId]];
        } else {
            finalSavedChannelId[channelId] = [...(savedChannelsId[channelId] || []), channelId];
        }
        dispatch(updateSaveChannelsId(finalSavedChannelId));
    };
    const onFormSubmit = async (formState, type, schedule) => {
        beginSubmit(getAuthoringSaveButtonType(type));
        try {
        const utcTimeResponse = await dispatch(getUtcTimeNow(false));
        const currentUtcTimeData = utcTimeResponse || utcTimeData;
        if (
            location?.campaignType !== 'T' &&
            levelNumber < 2 &&
            getTestType(type) !== 2 &&
            validatePastPlanDurationOnSubmit({
                location,
                formState,
                setError,
                currentUtcTime: currentUtcTimeData?.utcTime,
            })
        ) {
            return;
        }
        if ((!!audience?.length || !provider) && currentTab === null) {
            setVmContent(true);
            return;
        }
        if (getTestType(type) !== 2) {
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
        }
        if (getTestType(type) === 2) {
            let phNo = formState.mobile.slice(formState?.dialCode?.length + 1);
            let phAry = phNo?.length ? phNo.split(',') : [];
            let result = new Set(phAry.filter((v, i, a) => a.indexOf(v) !== i));
            result = Array.from(result);

            if (result?.length) {
                return setError('phoneNumber', { type: 'custom', message: 'Duplicate number' });
            } else if (!phAry?.length) {
                return setError('phoneNumber', { type: 'custom', message: 'Invalid number' });
            } else if (phAry?.length) {
                let maskWithOutCountryCode = formState?.maskDetail?.slice(formState?.dialCode?.length + 1);
                let countryPhoneLength = maskWithOutCountryCode?.split(',')[0]?.length;
                let valid = true;
                phAry.forEach((item) => {
                    if (item?.length !== countryPhoneLength) {
                        valid = false;
                    }
                });
                if (!valid) {
                    return setError('phoneNumber', { type: 'custom', message: 'Invalid number' });
                }
            }
        }
        formTypeRef.current = null;
        // if (formState.schedule === '' && !isScheduled && levelNumber === 1) {
        if (
            (formState.schedule === '' || formState.schedule === null) &&
            location.campaignType !== 'T' &&
            schedule &&
            levelNumber === 1
        ) {
            setScheduled(true);
            formTypeRef.current = type;
            return;
        }
        formState = {
            ...campaignDetails,
            ...formState,
            ...campaign,
            ...user,
            ...(campaign['campaignType'] === 'M' && mdcContentSetupDetails),
        };

        const payload = buildPayload(formState, type, location);
        const { status, data, message } = await runSave(getAuthoringSaveButtonType(type), () =>
            dispatch(saveVms({ payload, loading: false })),
        );
        if (status) {
            await handleSaveChannelIds();
            const selectedAudience = formState?.audience ?? [];
            dispatch(updateChannelAudiences(mergeChannelAudiences('VMS', selectedAudience, channelAudiences)));
        }
        if (!status) {
            setComSent(true);
            setRequestFalse(message);
            return;
        } else if (type === 'form') {
            if (status) {
                //dispatch(updateVoice({ field: 'vms', data: formState }));
                mCampType === 'M' ? handleMdcNavigation({ data }) : handleNavigation();
            }
        } else if (type === 'save') {
            dispatch(resetCreateCommunication());
            if (mCampType === 'M') {
                handleMdcNavigation({ data });
            } else {
                navigate('/communication', {
                    index: 0,
                });
            }
        } else {
            const { vmsChannelDetailId } = data;
            setMdcChannelDetailId(vmsChannelDetailId);
            setMdcContentSetupDetails({ ...mdcContentSetupDetails, channelDetailId: vmsChannelDetailId });
            fetchEditFlow();
            setScheduled(false);
            setNavigate_confirm(false);
            if (status) {
                setComSent(true);
            } else {
                setComSent(true);
                settestSentCommunicationModal(true);
            }

            setTimeout(() => {
                setComSent(false);
                settestSentCommunicationModal(false);
            }, 5000);
        }
        } finally {
            endSubmit();
        }
    };

    const fetchVMSTemplate = async (senderId) => {
        const payload = {
            ...user,
            vmsSettingid: senderId,
        };

        const response = await templateLoader.refetch({
            fetcher: () => dispatch(getVMSTemplate({ payload, loading: false })),
            mode: savedChannel ? 'edit' : 'create',
            loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
        });
        return response;
    };

    const fetchVMSLanguge = async () => {
        const payload = {
            ...user,
        };
        const response = await languageLoader.refetch({
            fetcher: () => dispatch(getVmsLanguage({ payload, loading: false })),
            mode: savedChannel ? 'edit' : 'create',
            loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
        });
        return response;
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

    const handlePhoneInput = ({ phone, value, formattedValue }) => {
        const { dialCode, countryCode, format } = value;
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
    };
    function getformat(number) {
        let { totalCount, formatCode } = getCountryVal;
        let tempValue = templatePhone;
        let temptotalCount = getCountryVal.totalCount?.length > 0 ? totalCount : tempValue.totalCount;
        let tempformatCode = getCountryVal.formatCode?.length > 0 ? formatCode : tempValue.formatCode;

        if (number?.length > 0) {
            if (!(number?.length <= temptotalCount)) {
                setValue('err', 'Invalid number');
            } else {
                if (number?.length !== temptotalCount) {
                    setValue('err', 'Invalid number');
                } else {
                    setValue('err', '');
                }
            }

            if (number?.length === temptotalCount) {
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

    const handleErrClose = () => {
        if (isEditVMSFail) {
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
        const response =
            segmentationList?.length &&
            (await audienceLoader.refetch({
                fetcher: ({ payload: audPayload, isFilter = false } = {}) =>
                    dispatch(getAudienceList({ payload: audPayload, isFilter, loading: false })),
                mode: 'edit',
                loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
                params: {
                    payload: {
                        clientId,
                        userId,
                        campaignId: campaign?.campaignId ?? 0,
                        departmentId,
                        searchText: '',
                        segmentIds: segmentationList,
                        channelType: 'VMS',
                    },
                    isFilter: true,
                },
            }));
    };

    useEffect(() => {
        if (filterAudienceList?.length && savedChannel) {
            const updatedAudience = handleUpdateEditAudienceCount({
                channelId: 25,
                audience: filterAudienceList,
                savedAudienceCountList: campaignDetails?.savedAudienceCountList || [],
                statusId: campaignDetails?.content?.[0]?.statusId,
            });
            reset((formState) => ({
                ...formState,
                audience: updatedAudience,
            }));
        }
    }, [filterAudienceList]);

    const shouldDisableAutoRefresh = handleAutoRefreshClickOff(audience);
    useEffect(() => {
        if (shouldDisableAutoRefresh) {
            setValue('isAutoRefereshenabled', false);
        }
    }, [audience]);

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

    const vmsContextValue = useMemo(
        () => ({
            isTemplateLoading: templateLoader.isLoading,
            isLanguageLoading: languageLoader.isLoading,
        }),
        [templateLoader.isLoading, languageLoader.isLoading],
    );

    return (
        <FormProvider {...methods}>
            <VMSContext.Provider value={vmsContextValue}>
            <AuthoringChannelEditSkeletonGate
                channelId={channelId}
                showEditSkeleton={showEditSkeleton}
                isSavedChannel={isSavedChannel}
            >
            <form className="rsv-tabs-content position-relative">
                <div className={`box-design bd-top-border ${isClickOff ? 'pe-none click-off' : ''}`}>
                    <div className="form-group mt30">
                        <Row>
                            <Col sm={{ offset: 1, span: 2 }}>
                                <label className="control-label-left">{PROVIDER}</label>
                            </Col>
                            <Col sm={6}>
                                <RSKendoDropDown
                                    control={control}
                                    name={'provider'}
                                    data={senderName}
                                    label={PROVIDER}
                                    textField={'clientFriendlyName'}
                                    dataItemKey={'clientVMSSettingId'}
                                    required
                                    isLoading={providerLoader.isLoading}
                                    rules={{
                                        required: SELECT_PROVIDER,
                                    }}
                                    handleChange={handleProviderChange}
                                    footer={
                                        <span id="rs_Messaging_Setting">
                                            <RSDropdownFooterBtn
                                                title="New sender ID"
                                                handleClick={() => {
                                                    const navState = createCommunicationSettingsNavState(
                                                        'messaging',
                                                        {
                                                            mode: 'add',
                                                            from: 'CreateCommunication',
                                                            campaignType: location?.campaignType,
                                                            messagingTabId: MESSAGING_TAB_ID.VMS,
                                                            backAction: window.location.search,
                                                            tabValueName: 'messaging',
                                                            tabValue: 'vms',
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
                            <Col sm={3} className="rs_input_icons_groups">
                                <RSTooltip text={'Reset'} className="input_icon" position="top">
                                    <i
                                        id="rs_data_refresh"
                                        className={`${restart_medium} icon-md color-primary-blue`}
                                        onClick={() => {
                                            clearErrors();
                                            reset();
                                        }}
                                    />
                                </RSTooltip>

                            </Col>
                            {/* <Col sm={3} className="fg-icons-wrapper pl0">
                                <div className="fg-icons d-flex">
                                    <RSTooltip text={'Refresh'} className="lh0 " position="top">
                                        <i
                                            id="rs_data_refresh"
                                            className={`${refresh_medium} icon-md color-primary-blue`}
                                            onClick={() => {
                                                clearErrors();
                                                reset();
                                            }}
                                        />
                                    </RSTooltip>
                                </div>
                            </Col> */}
                        </Row>
                        <Row>
                             <Col sm={{ offset: 3, span: 6 }} className='text-right lh0 position-relative top5'>
                              <RSPPophover text={PROVIDER_POPOVER_TEXT}>
                                <i
                                    className={`${circle_question_mark_mini} color-primary-blue icon-xs`}
                                    id="circle_question_mark"
                                ></i>
                            </RSPPophover>
                             </Col>
                        </Row>
                    </div>
                    {!mCampType && campaign.campaignType !== 'T' && (
                        <div className="form-group">
                            <AudienceFieldRenderComponent
                                type={'vms'}
                                audienceList={audienceList}
                                methods={methods}
                                userDetails={{ departmentId, userId, clientId }}
                                campaignId={campaign?.campaignId ?? 0}
                                audienceTextField="audiencWhatsapp"
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
                                        <small>Audience:  {handleTotalAudienceCount(campaignDetails,campaignDetails?.content?.[0]?.totalAudience,calucateAudienceCount)}</small>
                                    </div>
                                }
                            />
                        </div>
                    )}
                    {provider && (
                        <Row>
                            <Col sm={{span:10, offset:1}}>
                            <RSTabber
                                refresh
                                flatTabs
                                disableOtherTabs
                                defaultTab={defaultTab}
                                heading="VMS content"
                             //   extraClassName="col-sm-12"
                                isRefreshConfirmation
                                activeClass={`active`}
                                onRefresh={() => {
                                    reset(
                                        (formState) => ({
                                            // ..._cloneDeep(defaultValues),
                                            audience: formState.audience,
                                            provider: formState.provider,
                                        }),
                                        {
                                            keepDirty: true,
                                        },
                                    );
                                }}
                                tabData={VMS_CONTENT_TAB_CONFIG}
                                dynamicTab={`rs-content-tabs-flat col-sm-9`}
                                callBack={(_, index) => {
                                    setValue('currentTab', index);
                                }}
                                extraClassName={'mx0'}
                            /></Col>
                        </Row>
                    )}
                    {currentTab !== null && (
                        <Fragment>
                            <div className="mt20 mb30">
                                {levelNumber === 1 &&
                                    (campaign.campaignType === 'S' ||
                                        (campaign.campaignType === 'M' && dataSource === 'TL')) && (
                                        <Scheduler isRequired={false} isSendTimeRecommendation={false} />
                                    )}
                            </div>
                            <div className="form-group d-none">
                                <Row>
                                    <Col sm={{ offset: 1, span: 2 }}>
                                        <label className="control-label-left">{VOICE_MESSAGE}</label>
                                    </Col>
                                    <Col sm={6}>
                                        <RSReactPhoneInput
                                            control={control}
                                            name={'phoneNumber'}
                                            //  inputStyle={{ display: 'none' }}
                                            onMount={(value, data, formattedValue) => {
                                            }}
                                            handleOnchange={(phone, value, e, formattedValue) => {
                                                handlePhoneInput({ phone, value, formattedValue });
                                            }}
                                            value={phoneNumber ? phoneNumber : ''}
                                            countryCodeEditable={false}
                                            enableLongNumbers={longNumber}
                                            placeholder={''}
                                            onClick={(event, data) => {
                                            }}
                                            country={country}
                                            masks={{ ...mask }}
                                            setError={setError}
                                            clearErrors={clearErrors}
                                        />

                                        {/* <RSInput
                                                        control={control}
                                                        name={'mobile'}
                                                        placeholder={'mobile'}
                                                        handleOnBlur={(e) => {
                                                            e.preventDefault();
                                                            setValue('err', '');
                                                            let {
                                                                target: { value },
                                                            } = e;
                                                            let templatePhoneValue = templatePhone;
                                                            let { formattedvalue } = getCountryVal;
                                                            let tempValue =
                                                                getCountryVal.formattedvalue?.length > 0
                                                                    ? formattedvalue
                                                                    : templatePhoneValue.formattedvalue;
                                                            let fullnumber = value
                                                                .slice(tempValue?.length)
                                                                .split(' ')
                                                                .join('');
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
                                                    /> */}
                                    </Col>
                                    <Col md={2}>
                                        <RSPrimaryButton
                                            className={`position-relative top-10 ${isPastPlanDurationBlocked ? PAST_PLAN_DURATION_CLICK_OFF_CLASS : ''}`}
                                            onClick={() => {
                                                if (isPastPlanDurationBlocked) return;
                                                clearErrors('phoneNumber');
                                                setMobileValidate(true);
                                                handleSubmit((data) => onFormSubmit(data, 'test preview', false))();
                                            }}
                                        >
                                            {SEND}
                                        </RSPrimaryButton>
                                    </Col>
                                </Row>
                            </div>
                        </Fragment>
                    )}
                </div>

                <div className="buttons-holder">
                    <RSSecondaryButton
                        onClick={() => {
                            if (mCampType === 'M') {
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
                        id="rs_VMS_Cancel"
                    >
                        {CANCEL}
                    </RSSecondaryButton>
                    <RSSecondaryButton
                        color="blue"
                        className={`${editorText?.length > 500 ? 'click-off' : ''} ${isPastPlanDurationBlocked || isClickOff ? PAST_PLAN_DURATION_CLICK_OFF_CLASS : ''}`}
                        onClick={() => {
                            if (isPastPlanDurationBlocked || isClickOff) return;
                            clearErrors('phoneNumber');
                            const formData = getValues();
                            const isCTGTConfirm = handleCheckCTGT(formData.audience);
                            const hasUserConfirmed = formData.isCGTGConfirm === true;

                            // Only show modal if CG/TG conflict exists and user hasn't confirmed yet
                            if (isCTGTConfirm && !hasUserConfirmed && !handleCGTGModalCheck(campaignDetails?.content?.[0]?.statusId)) {
                                setPendingNextSubmitParams({ type: 'save', isSchedule: true });
                                setNextButtonCGTGModal(true);
                                return;
                            }

                            handleSubmit((data) => onFormSubmit(data, 'save', true))();
                        }}
                        id="rs_VMS_Save"
                        isLoading={isSaveLoading}
                        blockBodyPointerEvents
                        disabledClass={isSubmitting ? 'pe-none click-off' : ''}
                    >
                        {SAVE}
                    </RSSecondaryButton>
                    <RSPrimaryButton
                        type="button"
                        className={`${editorText?.length > 500 ? 'click-off' : ''} ${isPastPlanDurationBlocked ? PAST_PLAN_DURATION_CLICK_OFF_CLASS : ''}`}
                        isLoading={isNextLoading}
                        blockBodyPointerEvents
                        disabledClass={isSubmitting ? 'pe-none click-off' : ''}
                        onClick={() => {
                            if (isPastPlanDurationBlocked) return;
                            if (isClickOff && isDirty) return;
                            if (!isDirty && !isValid && mCampType !== 'M') {
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
                                if (isCTGTConfirm && !hasUserConfirmed && !handleCGTGModalCheck(campaignDetails?.content?.[0]?.statusId)) {
                                    setPendingNextSubmitParams({ type: 'form', isSchedule: true });
                                    setNextButtonCGTGModal(true);
                                    return;
                                }

                                setMobileValidate(false);
                                handleSubmit((data) => onFormSubmit(data, 'form', true))();
                            }
                        }}
                        id="rs_VMS_Next"
                    >
                        {mCampType === 'M' && !_get(location, 'mdcContentSetupDetails.channelDetailId', 0)
                            ? `Create VMS content`
                            : mCampType === 'M' && _get(location, 'mdcContentSetupDetails.channelDetailId', 0)
                                ? `Update VMS content`
                                : 'Next'}
                    </RSPrimaryButton>
                </div>
            </form>
            </AuthoringChannelEditSkeletonGate>
            <RSConfirmationModal
                show={isScheduled || navigate_confirm}
                text={
                    navigate_confirm
                        ? IGNORE_CHANNEL
                        : COMMUNICATION_SCHEDULED
                }
                primaryButtonText={OK}
                handleClose={() => {
                    setScheduled(false);
                    setNavigate_confirm(false);
                }}
                handleConfirm={() => {
                    if (navigate_confirm) {
                        handleNavigation();
                        setNavigate_confirm(false);
                    } else {
                        setScheduled(true);
                        handleSubmit((data) => onFormSubmit(data, formTypeRef.current, false))();
                    }
                }}
            />
            <RSConfirmationModal
                show={vmsContent}
                text={VMS_CONTENT}
                primaryButtonText={OK}
                handleClose={() => {
                    setVmContent(false);
                }}
                handleConfirm={() => {
                    setVmContent(false);
                }}
            />

            <CommunicationSent
                show={isComSent}
                status={testSentCommunicationModal}
                requestFalse={requestFalse}
                handleClose={() => {
                    setComSent(false);
                    setRequestFalse('');
                }}
            />
            {getWarningPopupMessage(failureApiErrors, dispatch, handleErrClose)}
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
                        if (pendingNextSubmitParams.type === 'form') {
                            setMobileValidate(false);
                        } else {
                            clearErrors('phoneNumber');
                        }
                        handleSubmit((data) => onFormSubmit(data, pendingNextSubmitParams.type, pendingNextSubmitParams.isSchedule))();
                    }
                    setPendingNextSubmitParams(null);
                }}
            />
            </VMSContext.Provider>
        </FormProvider>
    );
};

export default VMS;
