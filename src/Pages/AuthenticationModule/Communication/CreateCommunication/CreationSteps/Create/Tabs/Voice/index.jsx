import { campaignSchedule } from 'Utils/modules/campaignUtils';
import { convertUserTimezoneToTarget, getYYMMDD } from 'Utils/modules/dateTime';
import { checkScheduleDate } from 'Utils/modules/display';
import { getmasterData } from 'Utils/modules/masterData';
import { encodeUrl, getUserDetails } from 'Utils/modules/crypto';
import { numberWithCommas } from 'Utils/modules/formatters';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { ENTER_DESCRIPTION, SELECT_TEMPLATE_NAME, SELECT_VENDOR_NAME } from 'Constants/GlobalConstant/ValidationMessage';
import { ADD, ATTRIBUTES, AUDIENCE, AUDIENCE_CHANGE_CONFIRMATION, AUTO_REFRESH, AUTO_REFRESH_POP_HOVER_TEXT, CALL_CENTER_DESCRIPTION, CANCEL, CHECK_START_DATE_AND_END_DATE, COMMUNICATION_SCHEDULED, DESCRIPTION, I_AGREE_TO_TRANSFER_CALL_CENTER, IGNORE_CHANNEL, NEXT, OK, SAVE, SELECT_TEMPLATE, TEMPLATE, VENDOR_NAME } from 'Constants/GlobalConstant/Placeholders';
import { circle_plus_fill_medium, circle_question_mark_mini } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { get as _get, find as _find, isEmpty as _isEmpty, filter as _filter } from 'Utils/modules/lodashReplacements';
import { Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FormProvider, useForm } from 'react-hook-form';

import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
import Scheduler from '../../Component/Scheduler';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import RSTextarea from 'Components/FormFields/RSTextarea';
import RSTooltip from 'Components/RSTooltip';
import { availableTabs, communicationChannels, getPreCampaignStatus, handleAutoRefreshClickOff, handlePersonalizationFetchApiCall, AudienceFieldRenderComponent, audienceTypeList, handleCheckCTGT, handleCGTGModalCheck, getPastPlanDurationBlockedState, validatePastPlanDurationOnSubmit, PAST_PLAN_DURATION_CLICK_OFF_CLASS , shouldPromptSkipChannelConfirmation} from '../../constant';

import { getSessionId, getUtcTimeData } from 'Reducers/globalState/selector';
import { getUtcTimeNow } from 'Reducers/globalState/request';
import { formInitailState, buildPayload, voiceTypes } from './constant';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import {
    resetVoiceList,
    updateDirtyState,
    updateTab,
    updateVoice,
    resetCreateCommunication,
    updateVerticalTab,
} from 'Reducers/communication/createCommunication/Create/reducer';
import {
    getAudienceList,
    getCallCenter,
    saveCallCenter,
} from 'Reducers/communication/createCommunication/Create/request';
import {
    getAudience,
    getFilterAudience,
    getVoiceDetails,
} from 'Reducers/communication/createCommunication/Create/selectors';

import useComponentWillUnmount from 'Hooks/useComponentWillUnMount';
import RSConfirmationModal from 'Components/ConfirmationModal';
import useQueryParams from 'Hooks/useQueryParams';
import useApiLoader from 'Hooks/useApiLoader';
import { updateSaveChannelsId } from 'Reducers/communication/createCommunication/plan/reducer';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import { getWebhookAttributeList, getWebhookList } from 'Reducers/communication/createCommunication/Mdc/Canvas/request';
import SelectAttributeListboxModal from 'Components/SelectAttributeListboxModal';
import AuthoringChannelEditSkeletonGate, {
    AUTHORING_FIELD_LOADER_CONFIG,
    getAuthoringEditFieldLoaderConfig,
    getAuthoringSaveButtonType,
    resetAuthoringChannelEditSession,
    useAuthoringChannelEditLoader,
    useAuthoringChannelSaveLoader,
} from 'Components/Skeleton/pages/communication/authoring';

const Voice = ({ type, mCampType }) => {
    const channelId = 26;
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { timeZoneList } = getmasterData();
    const [navigate_confirm, setNavigate_confirm] = useState(false);
    const [isAudienceChangeConfirm, setIsAudienceChangeConfirm] = useState(false);
    const [previousAudience, setPreviousAudience] = useState([]);
    const [nextButtonCGTGModal, setNextButtonCGTGModal] = useState(false);
    const [pendingNextSubmitParams, setPendingNextSubmitParams] = useState(null);
    const [selectedColumnsData, setSelectedColumnData] = useState({ leftAttributes: [], rightAttributes: [] });

    const [mdcContentSetupDetails, setMdcContentSetupDetails] = useState({});
    const [levelNumber, setLevelNumber] = useState(1);
    const [actionId, setActionId] = useState(0);
    const [mdcChannelDetailId, setMdcChannelDetailId] = useState(0);
    const [mdcAudience, setMdcAudience] = useState([]);
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const { savedChannelsId } = useSelector(({ communicationPlanReducer }) => communicationPlanReducer);
    const [attrModal, setAttModal] = useState(false);
    const {
        voice,
        activeTabs,
        verticalTab: { type: channelType, currentTab },
        tabsState: { voice: tabState },
        isDirty,
        personalization,
        listTypeWisePersonlization
    } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const utcTimeData = useSelector(getUtcTimeData);
    const { parentClientId, ...user } = useSelector((state) => getSessionId(state));
    const audienceList = useSelector((state) => getAudience(state));
    const { campaignDetails, vendorList } = useSelector((state) => getVoiceDetails(state));
    const filterAudienceList = useSelector((state) => getFilterAudience(state));
    const [isGetVoiceFail, setGetIsVoiceFail] = useState(false);
    const location = useQueryParams('/communication');
    const isAlreadyEditCallRef = useRef(false);
    const { showEditSkeleton, isSavedChannel, runEditFetch, resetEditLoading } = useAuthoringChannelEditLoader({
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

    const vendorLoader = useApiLoader();
    const audienceLoader = useApiLoader();
    const { runSave, beginSubmit, endSubmit, isSaveLoading, isNextLoading, isSendLoading, isSubmitting } =
        useAuthoringChannelSaveLoader();

    // const location = useLocation();
    const campaign = {
        campaignId: _get(location, 'campaignId', 0),
        campaignType: _get(location, 'campaignType', 'S'),
    };
    const methods = useForm(formInitailState);

    const {
        control,
        reset,
        formState: { dirtyFields, isValid,errors },
        watch,
        handleSubmit,
        setError,
        clearErrors,
        setValue,
        getValues,
    } = methods;

    const dirty = { ...dirtyFields };

    const audience = watch('audience');
    const description = watch('audience');
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
    const [state, setState] = useState({
        isScheduled: false,
        scheduled: false,
    });

    const [isScheduled, setScheduled] = useState(false);

    let calucateAudienceCount = useMemo(
        () => audience?.reduce((prev, cur) => Number(prev) + Number(cur.recipientCountEmail), 0),
        [audience],
    );

    useEffect(() => {
        if (!_isEmpty(voice[type])) {
            reset(voice[type]);
        } else {
            reset();
        }
        return () => {
            dispatch(resetVoiceList());
        };
    }, [type]);
    useEffect(() => {
        const payload = {
            clientId,
            userId,
            departmentId,
            type: voiceTypes[type],
        };
        vendorLoader.refetch({
            fetcher: ({ payload: vendorPayload } = {}) =>
                dispatch(getWebhookList({ payload: vendorPayload, loading: false })),
            mode: savedChannel ? 'edit' : 'create',
            loaderConfig: editFieldLoaderConfig,
            params: { payload },
        });
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (!campaign?.campaignId || isAlreadyEditCallRef.current) {
                return;
            }
            isAlreadyEditCallRef.current = true;
            const payload = {
                clientId,
                userId,
                recipientListId: 0,
                searchText: '',
                segmentIds: [],
                campaignId: 0,
                channelType: 'CC',
                departmentId,
            };
            const getVoicePayload = {
                ...user,
                campaignId: campaign?.campaignId,
                levelNumber: 1,
                actionId: 1,
                channelDetailId: 0,
            };

            await runEditFetch(async () => {
                if (savedChannel) {
                    const res = await dispatch(
                        getCallCenter({ payload: getVoicePayload, loading: false }),
                    );
                    setGetIsVoiceFail(!res?.status);
                }
                if (_get(location, 'campaignType', 'S') === 'S') {
                    await audienceLoader.refetch({
                        fetcher: ({ payload: audPayload, isFilter = false } = {}) =>
                            dispatch(getAudienceList({ payload: audPayload, isFilter, loading: false })),
                        mode: savedChannel ? 'edit' : 'create',
                        loaderConfig: editFieldLoaderConfig,
                        params: { payload },
                    });
                }
            });
        };
        fetchData();
    }, [campaign?.campaignId]);

    useComponentWillUnmount(() => {
        resetAuthoringChannelEditSession(isAlreadyEditCallRef, resetEditLoading);
        dispatch(resetVoiceList());
    });

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
            adjustedEndDate: getYYMMDD(adjustedEndDate)
        };
    };

    useEffect(() => {
        if (!isDirty && Object.keys(dirtyFields)?.length > 0) {
            dispatch(updateDirtyState(true));
        } else if (isDirty && Object.keys(dirtyFields)?.length === 0) {
            dispatch(updateDirtyState(false));
        }
    }, [dirty]);

    const handleAudienceInEdit = async (segmentationList) => {
        if (_get(location, 'campaignType', 'S') !== 'S') return;
        await audienceLoader.refetch({
            fetcher: ({ payload: audPayload, isFilter = true } = {}) =>
                dispatch(getAudienceList({ payload: audPayload, isFilter, loading: false })),
            mode: savedChannel ? 'edit' : 'create',
            loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
            params: {
                payload: {
                    userId,
                    clientId,
                    campaignId: campaign.campaignId,
                    departmentId,
                    searchText: '',
                    segmentIds: segmentationList,
                    channelType: 'CC',
                },
                isFilter: true,
            },
        });
    };

    useEffect(() => {
        if (!_isEmpty(campaignDetails)) {
                        const { content, segmentationListId, isCGTGEnabled } = campaignDetails;
            const audience = _filter(audienceList, (aud) => segmentationListId?.includes(aud.segmentationListId));
            handleAudienceInEdit(segmentationListId);
            const temp = {};
          const matchAudienceType =  audienceTypeList?.filter((typeList)=> audience?.map((aud)=>aud?.listType)?.includes(typeList?.id)) 
            const { content: description, timeZoneId, localBlastDateTime } = content?.[0];
            const findTimeZone = _find(timeZoneList, ['timeZoneID', timeZoneId]);

            temp.description = description;
            temp.timezone = findTimeZone;
            temp.schedule = localBlastDateTime ? new Date(localBlastDateTime) : '';
            temp.audience = audience;
            temp.audienceType = matchAudienceType?.length ? matchAudienceType : [audienceTypeList[0]]
            temp.isCGTGEnabled = isCGTGEnabled ?? false;
            reset((formState) => ({ ...formState, ...temp }));
        }
    }, [campaignDetails]);

    useEffect(() => {
        if (filterAudienceList?.length) {
            reset((formState) => ({
                ...formState,
                audience: filterAudienceList,
            }));
        }
    }, [filterAudienceList]);

    useEffect(() => {
        if (location && Object.keys(location)?.length) {
            /* MDC variables start*/

            const mdcContentSetupDetails = _get(location, 'mdcContentSetupDetails', {});
            const levelNumber = _get(mdcContentSetupDetails, 'levelNumber', 1);
            const actionId = _get(mdcContentSetupDetails, 'actionId', 0);
            const mdcChannelDetailId = _get(mdcContentSetupDetails, 'channelDetailId', 0);
            const mdcAudience = _get(mdcContentSetupDetails, 'audience', []);
            const mdcIsCGTGEnabled = _get(mdcContentSetupDetails, 'isCGTGEnabled', false);

            setMdcContentSetupDetails(mdcContentSetupDetails);
            setLevelNumber(levelNumber);
            setActionId(actionId);
            setMdcChannelDetailId(mdcChannelDetailId);
            setMdcAudience(mdcAudience);
            
            // For MDC create mode (no channelDetailId), set isCGTGEnabled from mdcContentSetupDetails
            if (location?.campaignType === 'M' && !mdcChannelDetailId) {
                setValue('isCGTGEnabled', mdcIsCGTGEnabled);
            }
            /* MDC variables end*/
        }
    }, [location]);

    const handleSaveChannelsId = async () => {
        const finalSavedChannelId = { ...savedChannelsId };
        if (savedChannelsId[channelId]?.includes(channelId)) {
            finalSavedChannelId[channelId] = [...savedChannelsId[channelId]];
        } else {
            finalSavedChannelId[channelId] = [...(savedChannelsId[channelId] || []), channelId];
        }
        await dispatch(updateSaveChannelsId(finalSavedChannelId));
    };
    const onFormSubmit = async (formState, formType, sceheduled) => {
        beginSubmit(getAuthoringSaveButtonType(formType));
        try {
        const utcTimeResponse = await dispatch(getUtcTimeNow(false));
        const currentUtcTimeData = utcTimeResponse || utcTimeData;
        formState = {
            ...campaignDetails,
            ...formState,
            ...user,
            ...campaign,
            ...(campaign['campaignType'] === 'M' && mdcContentSetupDetails),
            ...selectedColumnsData,
        };
        if (
            location?.campaignType !== 'T' &&
            levelNumber < 2 &&
            validatePastPlanDurationOnSubmit({
                location,
                formState,
                setError,
                currentUtcTime: currentUtcTimeData?.utcTime,
            })
        ) {
            return;
        }
        if (!formState.schedule && !sceheduled && levelNumber === 1) {
            setScheduled(true);
            return;
        }
        if (isScheduled) setScheduled(false);
        if (formState?.schedule !== '' && formState?.schedule !== null) {
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
            let scheduleError = campaignSchedule(formState?.schedule, formState?.timezone?.gmtOffset, null, currentUtcTimeData?.utcTime);
            if (!scheduleError) {
                const cityTime = convertUserTimezoneToTarget(
                    currentUtcTimeData?.utcTime ? new Date(currentUtcTimeData.utcTime.replace('Z', '')) : new Date(),
                    "(GMT+00:00) ",
                    formState?.timezone?.gmtOffset,
                    true
                );
                // Add 15 minutes to cityTime
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
        const payload = buildPayload(formState, location);
        const { status, data } = await runSave(getAuthoringSaveButtonType(formType), () =>
            dispatch(saveCallCenter({ payload, loading: false })),
        );
        if (status) {
            await handleSaveChannelsId();
            if (formType === 'save') {
                if (levelNumber > 1) {
                    return handleMdcNavigation(data);
                }
                dispatch(resetCreateCommunication());
                navigate('/communication', {
                    index: 0,
                });
            } else {
                if (levelNumber > 1) {
                    return handleMdcNavigation(data);
                }
                dispatch(updateVoice(formState));
                handleNavigation();
            }
        }
        } finally {
            endSubmit();
        }
    };
    const handleNavigation = () => {
        window.scrollTo(0, 0);
        const tabIndex = tabState.currentIndex + 1;
        if (availableTabs['voice']?.length === tabIndex) {
            const nextChannel = communicationChannels.find(
                (chan, index) => channelType !== chan && Object.hasOwn(activeTabs, chan) && index > currentTab,
            );
            if (!!nextChannel) {
                dispatch(
                    updateVerticalTab({
                        tabs: activeTabs?.[nextChannel] || {
                            type: 'ads',
                            currentTab: 5,
                        },
                    }),
                );
            } else {
                const status = getPreCampaignStatus(savedChannelsId);
                if (status) {
                    navigate('/communication', {
                        index: 0,
                    });
                } else {
                    let url = '/communication/execute';
                    const encryptState = encodeUrl(location);
                    dispatch(resetCreateCommunication());
                    navigate(`${url}?q=${encryptState}`, {
                        state: location,
                    });
                }
            }
        } else {
            dispatch(
                updateTab({
                    field: 'voice',
                    data: {
                        tabName: availableTabs['voice'][tabIndex],
                        currentIndex: tabIndex,
                    },
                }),
            );
        }
    };

    const handleMdcNavigation = (data) => {
        const { VCCChannelDetailId: channelResponseDetailId } = data;
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
    const handleErrClose = () => {
        if (isGetVoiceFail) {
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
    {
    }

    const shouldDisableAutoRefresh = handleAutoRefreshClickOff(audience);
    useEffect(() => {
        if (shouldDisableAutoRefresh) {
            setValue('isAutoRefereshenabled', false);
        }
    }, [audience]);
    const handleAttrs = async () => {
        const payload = {
            clientId,
            userId,
            departmentId,
            type: voiceTypes[type],
        };
        let res = await dispatch(getWebhookAttributeList({ payload }));
        if (res?.status) {
            setSelectedColumnData((prev) => ({ ...prev, leftAttributes: res?.data, rightAttributes: [] }));
            setAttModal(true);
        }
    };
    return (
        <FormProvider {...methods}>
            <AuthoringChannelEditSkeletonGate
                channelId={channelId}
                showEditSkeleton={showEditSkeleton}
                isSavedChannel={isSavedChannel}
            >
            <form
                className="rsv-tabs-content  position-relative"
                onSubmit={handleSubmit((data) => onFormSubmit(data, 'submit', false))}
            >
                <div className="box-design bd-top-border">
                    {mCampType !== 'M' && (
                        <div className="form-group mt20">
                            <Row>
                                <Col sm={{ span: 2, offset: 1 }}>
                                    <label className="control-label-left">{VENDOR_NAME}</label>
                                </Col>
                                <Col sm={6} className="position-relative">
                                    <RSKendoDropdown
                                        control={control}
                                        name={'vendorName'}
                                        dataItemKey={'webHookSettingId'}
                                        textField={'webHookName'}
                                        data={vendorList}
                                        label={VENDOR_NAME}
                                        isLoading={vendorLoader.isLoading}
                                        rules={{
                                            required: SELECT_VENDOR_NAME,
                                        }}
                                    />
                                </Col>
                            </Row>
                        </div>
                    )}
                    {mCampType !== 'M' && (
                        <div className="form-group mt30">
                                <AudienceFieldRenderComponent
                                    type={'callCenter'}
                                    audienceList={audienceList}
                                    isAudienceLoading={audienceLoader.isLoading}
                                    methods={methods}
                                    userDetails={{ departmentId, userId, clientId }}
                                    campaignId={campaign?.campaignId ?? 0}
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
                                                {AUDIENCE}: {numberWithCommas(calucateAudienceCount) || 0}
                                            </small>
                                        </div>
                                    }
                                />
                        </div>
                    )}
                    <div className="form-group mt20">
                        <Row>
                            <Col sm={{ offset: 1, span: 2 }}>
                                <label className="control-label-left">{ATTRIBUTES}</label>
                            </Col>

                            <Col sm={6}>
                                <>
                                    <>
                                        {/* <div className="tag-list-block box-design primary-box-shadow height-100per">
                                            <ul>
                                                {_map(selectedColumnsData?.rightAttributes, (attr) => {
                                                    return <li key={attr?.dataAttributeId}>{attr?.uiPrintableName}</li>;
                                                })}
                                            </ul>
                                        </div> */}
                                        <div className="pe-none voice-tag-list">
                                            <RSMultiSelect  control={control} name={'attributeList'} label={'Attribute'} data={selectedColumnsData?.rightAttributes} textField={'uiPrintableName'} dataItemKey={'dataAttributeId'}/>
                                        </div>
                                    </>
                                </>
                            </Col>
                            <Col md={1} className="fg-icons-wrapper pl0 align-content-end">
                                <div className="fg-icons">
                                    <RSTooltip text={ADD}>
                                        <i
                                            className={`${circle_plus_fill_medium} icon-md color-primary-blue`}
                                            id="rs_data_circle_plus_fill"
                                            onClick={() => {
                                                if (!selectedColumnsData?.rightAttributes?.length) {
                                                    handleAttrs();
                                                } else {
                                                    setAttModal(true);
                                                }
                                            }}
                                        />
                                    </RSTooltip>
                                </div>
                            </Col>
                        </Row>
                    </div>

                    {type !== 'callCenter' && mCampType !== 'M' && (
                        <div className="form-group">
                            <Row>
                                <Col sm={{ span: 2, offset: 1 }}>
                                    <label className="control-label-left">{SELECT_TEMPLATE}</label>
                                </Col>
                                <Col sm={6}>
                                    <RSMultiSelect
                                        control={control}
                                        name={'template'}
                                        data={['One_Clip_One_Option', 'Two_Clip_One_Option']}
                                        label={TEMPLATE}
                                        rules={{
                                            required: SELECT_TEMPLATE_NAME,
                                        }}
                                    />
                                </Col>
                            </Row>
                        </div>
                    )}
                    <div className="form-group">
                        <Row>
                            <Col sm={{ span: 2, offset: 1 }}>
                                <label className="control-label-left">{DESCRIPTION}</label>
                            </Col>
                            <Col sm={6}>
                                <RSTextarea
                                    control={control}
                                    name={'description'}
                                    placeholder={CALL_CENTER_DESCRIPTION}
                                    rules={{ required: ENTER_DESCRIPTION }}
                                    customErrorClassName='pl0'
                                />
                            </Col>
                        </Row>
                    </div>
                    <div className="form-group">
                        <Row>
                            <Col sm={{ offset: 3, span: 6 }}>
                                <RSCheckbox
                                    control={control}
                                    name="transferAgree"
                                    type="checkbox"
                                    labelName={I_AGREE_TO_TRANSFER_CALL_CENTER}
                                    className="remember-lable"
                                />
                            </Col>
                        </Row>
                    </div>
                    {levelNumber === 1 && (
                        <div className="form-group">
                            <Scheduler utcTime_Data = {utcTimeData} isSendTimeRecommendation={false} isRequired={false} withFormAlign />
                        </div>
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
                        id="rs_Voice_Cancel"
                    >
                        {CANCEL}
                    </RSSecondaryButton>
                    <RSSecondaryButton
                        color="blue"
                        className={isPastPlanDurationBlocked ? PAST_PLAN_DURATION_CLICK_OFF_CLASS : ''}
                        onClick={() => {
                            if (isPastPlanDurationBlocked) return;
                            const formData = getValues();
                            const isCTGTConfirm = handleCheckCTGT(formData.audience);
                            const hasUserConfirmed = formData.isCGTGConfirm === true;
                            
                            // Only show modal if CG/TG conflict exists and user hasn't confirmed yet
                            if (isCTGTConfirm && !hasUserConfirmed && !handleCGTGModalCheck(campaignDetails?.content?.[0]?.statusId)) {
                                setPendingNextSubmitParams({ type: 'save', isSchedule: false });
                                setNextButtonCGTGModal(true);
                                return;
                            }
                            
                            handleSubmit((data) => onFormSubmit(data, 'save', false))();
                        }}
                        id="rs_Voice_save"
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
                            if (!isDirty && !isValid && levelNumber === 1) {
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
                                    setPendingNextSubmitParams({ type: 'form', isSchedule: false });
                                    setNextButtonCGTGModal(true);
                                    return;
                                }
                                
                                handleSubmit((data) => onFormSubmit(data, 'form', false))();
                            }
                        }}
                        id="rs_Voice_Next"
                    >
                        {mCampType === 'M' ? 'Create callcenter content' : NEXT}
                    </RSPrimaryButton>
                </div>
            </form>
            <RSConfirmationModal
                show={isScheduled}
                text={COMMUNICATION_SCHEDULED}
                primaryButtonText={SAVE}
                handleClose={() => setScheduled(false)}
                handleConfirm={() => {
                    handleSubmit((data) => onFormSubmit(data, 'schedule', true))();
                }}
            />
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
            <SelectAttributeListboxModal
                getSelectedData={(data) => {
                       setSelectedColumnData({
                        leftAttributes: data?.leftAttributes,
                        rightAttributes: data?.rightAttributes,
                    });
                    setValue('attributeList',data?.rightAttributes)
                    setAttModal(false);
                }}
                leftAttributes={selectedColumnsData.leftAttributes}
                rightAttributes={selectedColumnsData.rightAttributes}
                show={attrModal}
                handleClose={(status) => setAttModal(false)}
                textField={'uiPrintableName'}
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
                        errors: {},
                        dispatch,
                        payloadParams,
                        listTypeWisePersonlization,
                    });
                        setIsAudienceChangeConfirm(false);
                    }}
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
                            handleSubmit((data) => onFormSubmit(data, pendingNextSubmitParams.type, pendingNextSubmitParams.isSchedule))();
                        }
                        setPendingNextSubmitParams(null);
                    }}
                />
            </AuthoringChannelEditSkeletonGate>
        </FormProvider>
    );
};

export default Voice;
