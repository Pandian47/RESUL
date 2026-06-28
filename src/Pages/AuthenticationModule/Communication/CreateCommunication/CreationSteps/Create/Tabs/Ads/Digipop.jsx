import { checkTrigger } from 'Utils/modules/campaignUtils';
import { ACHIEVED_IMPRESSIONS, AUDIENCE, AUDIENCE_LIST, CANCEL, CHANNEL, CLICK_URL, DEFAULT_CLICK_URL, DEVICE_TYPE_OPTIONS, END_DATE, END_TIME, ENTER_DESCRIPTION, IGNORE_CHANNEL, MAX_IMPRESSION, NEXT, OK, REMAINING_IMPRESSION, SAVE, START_DATE, START_TIME, STATE, STATE_LABEL, SUPPLY_TYPE_OPTIONS, TYPE, URL } from 'Constants/GlobalConstant/Placeholders';
import { editor_smart_link_medium } from 'Constants/GlobalConstant/Glyphicons';
import { encodeUrl } from 'Utils/modules/crypto';
import { numberWithCommas } from 'Utils/modules/formatters';
import { charNumUnderScore, onlyNumbers } from 'Utils/modules/inputValidators';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { MAX_LENGTH150, MAX_LENGTH8 } from 'Constants/GlobalConstant/Regex';
import { DIGIPOP_CLICK, DIGIPOP_IMPRESSION, ENTER_URL, SELECT_AUDIENCE_LIST, SELECT_END_DATE, SELECT_START_DATE } from 'Constants/GlobalConstant/ValidationMessage';
import { useEffect, useMemo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';

import { updateSaveChannelsId } from 'Reducers/communication/createCommunication/plan/reducer';
import { getSessionId } from 'Reducers/globalState/selector';
import useQueryParams from 'Hooks/useQueryParams';
import { getGeneratedLink } from 'Reducers/communication/createCommunication/smartlink/selectors';
import { getSmartUrlDetailByChannel } from 'Reducers/communication/createCommunication/smartlink/request';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';

import { useNavigate } from 'react-router-dom';
import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import RSInput from 'Components/FormFields/RSInput';
import RSTextarea from 'Components/FormFields/RSTextarea';
import RSSwitch from 'Components/FormFields/RSSwitch';
import {
    buildDigipopPayload,
    DIGIPOP_INITIAL_STATE,
    digipopChannel,
    digipopChannelType,
    getPostChannelId,
    RESET_ON_TYPECHANGE,
    RESET_WEEKDAYS,
} from './constant';
import { weekcheckboxData } from 'Pages/AuthenticationModule/Components/Schedules/Constants';
import RSTimePicker from 'Components/FormFields/RSTimePicker';
import Creatives from './Component/Creatives/Creatives';
import {
    get_digipop_Audience,
    get_digipop_BalanceImpression,
    get_digipop_Communication,
    save_digipop_Communication,
    update_digipop_Communication,
} from 'Reducers/communication/createCommunication/Create/request';
import RSConfirmationModal from 'Components/ConfirmationModal';
import {
    resetCreateCommunication,
    updateDirtyState,
    updateTab,
    updateVerticalTab,
} from 'Reducers/communication/createCommunication/Create/reducer';
import { availableTabs, communicationChannels, getPreCampaignStatus } from '../../constant';
import { GetDigiPop_grid } from 'Reducers/preferences/CommunicationSettings/request';
import { digipopType } from 'Pages/AuthenticationModule/Preferences/Pages/CommunicationSettings/Pages/ChannelSettings/Pages/Ads/Tabs/Digipop/constant';
import RSRadioButton from 'Components/FormFields/RSRadioButton';
import AuthoringChannelEditSkeletonGate, {
    getAuthoringSaveButtonType,
    useAuthoringChannelEditLoader,
    useAuthoringChannelSaveLoader,
} from 'Components/Skeleton/pages/communication/authoring';

const DigipopCommunication = ({ type }) => {
    const locationAds = useQueryParams('/communication');

    const dispatch = useDispatch();
    const {
        ads,
        tabsState: { ads: adsTabState },
        activeTabs,
        verticalTab: { type: channelType, currentTab },
        isDirty,
    } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const { smartLink1, smartLink2 } = useSelector((state) => getGeneratedLink(state));
    const smartLink = useSelector((state) => getGeneratedLink(state));
    const subChannelId = getPostChannelId(type);

    const { savedChannelsId } = useSelector(({ communicationPlanReducer }) => communicationPlanReducer);
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const { userId, departmentId, clientId } = useSelector((state) => getSessionId(state));
    const [audienceData, setAudienceData] = useState([]);
    const [navigate_confirm, setNavigate_confirm] = useState(false);
    const [impressionModal, setImpressioModal] = useState(false);
    const [isCommunicationEditable, setIsCommunicationEditable] = useState(true);
    const [deviceTypeData, setDeviceTypeData] = useState({});
    const [editAudienceData, setEditAudienceData] = useState([]);
    const [isDigipopFail, setIsDigipopFail] = useState(false);
    const [isSmartLink, setIsSmartLink] = useState(false);
    const [balanceCount, setBalanceCount] = useState(0);
    const methods = useForm(DIGIPOP_INITIAL_STATE);
    const channelId = 10;
    const { showEditSkeleton, isSavedChannel, beginEditSkeleton, finishEditSkeleton } = useAuthoringChannelEditLoader({
        channelId,
        subChannelId,
    });
    const { runSave, isSaveLoading, isNextLoading, isSendLoading, isSubmitting } = useAuthoringChannelSaveLoader();
    const savedChannel = isSavedChannel;
    const {
        control,
        reset,
        formState: { dirtyFields, isValid },
        handleSubmit,
        watch,
        setValue,
        resetField,
        setError,
        clearErrors,
        getValues,
    } = methods;
    const navigate = useNavigate();
    const dirty = { ...dirtyFields };
    const [weekdayEnabled, audience, startTimeAt, channelWatch, channelTypeWatch] = watch([
        'timing.weekdayEnabled',
        'audience',
        'timing.startedTimeAt',
        'channel',
        'channelType',
    ]);

    let calucateAudienceCount = useMemo(
        () => audience?.reduce((prev, cur) => Number(prev) + Number(cur.recipientCount), 0),
        [audience],
    );
    const { fields, append, remove, update } = useFieldArray({
        control,
        name: 'creatives',
    });
    useEffect(() => {
        if (!isDirty && Object.keys(dirty)?.length > 0) {
            dispatch(updateDirtyState(true));
        } else if (isDirty && Object.keys(dirty)?.length === 0) {
            dispatch(updateDirtyState(false));
        }
    }, [dirty]);

    const getDigiPopAudience = async () => {
        const payload = {
            userId,
            clientId,
            departmentId,
            partnerId: 41,
            channelId: 10,
            subChannelId: 9,
        };
        const { status, data } = await dispatch(get_digipop_Audience(payload));
        const { status: balanceStatus, data: balanceData } = await dispatch(get_digipop_BalanceImpression(payload));
        if (balanceStatus) {
            setBalanceCount(balanceData);
            setImpressioModal(balanceData < 12000);
        } else {
            setImpressioModal(true);
            setBalanceCount(0);
            setIsDigipopFail(true);
        }
        if (status) {
            setAudienceData(data);
        } else {
            setAudienceData([]);
        }
    };
    const getDigipopComm = async () => {
        const payload = {
            userId,
            clientId,
            departmentId,
            partnerId: 41,
            campaignId: locationAds?.campaignId,
            subChannelId: subChannelId,
            channelId: 10,
        };
        const { status, data } = await dispatch(get_digipop_Communication({ ...payload, loading: false }));
        if (status) {
            const {
                achievedImpression,
                channel,
                clickUrl,
                defaultClickUrl,
                description,
                maxImpression,
                remainingImpression,
                spentDistribution,
                supplyTypeOptions,
                timing,
                weekdayEnabled,
                deviceTypeOptions,
                creatives,
                ott,
                audiences,
                subChannelType,
                sourceType,
            } = data;
            let temp = {
                achievedImpression,
                channel: digipopChannel?.find((item) => item.type === channel),
                url: clickUrl,
                defaultClickUrl,
                description,
                maxImpression,
                remainingImpression,
                spentDistribution,
                supplyTypeOptions,
                deviceTypeOptions,
                weekdayEnabled,
                ott: ott === 1 ? true : false,
            };
            // debugger
            let editCreative = [];
            if (creatives?.length) {
                if (status) {
                    let creativeDataaa = [];
                    let typee = sourceType;

                    let typees = [...new Set(typee.split(',').map((item) => item.toLowerCase()))];
                    for (let i = 0; i < typees?.length; i++) {
                        let payloadCreative = {
                            ...payload,
                            type: typees[i],
                        };
                        const { status, data: creativeData } = await dispatch(GetDigiPop_grid(payloadCreative));
                        if (status) {
                            creativeDataaa.push(...creativeData);
                        }
                    }

                    for (let i = 0; i < creatives?.length; i++) {
                        let avlCreatives = creativeDataaa?.find((item) => item?.creativeId === creatives[i]);
                        let type = avlCreatives?.requestBody?.type;
                        let name = avlCreatives?.requestBody?.name;
                        let creativeId = avlCreatives?.creativeId;
                        let digType = digipopType?.find((item) => item?.type == type);
                        let field = {
                            type: digType,
                            typeVal: {
                                creativeId,
                                name,
                                type,
                            },
                        };
                        editCreative?.push(field);
                        // debugger
                        let categoryTypeData = creativeDataaa?.filter((item) => item?.requestBody?.type === type) || [];
                        setDeviceTypeData((prevState) => ({
                            ...prevState,
                            [i]: categoryTypeData,
                        }));
                    }
                }
            }
            const timingObj = Array.isArray(timing) && timing?.length > 0 ? timing[0] : {};
            let timingData = {
                mon: timingObj?.monday,
                tue: timingObj?.tuesday,
                wed: timingObj?.wednesday,
                thu: timingObj?.thursday,
                fri: timingObj?.friday,
                sat: timingObj?.saturday,
                sun: timingObj?.sunday,
                weekdayEnabled: weekdayEnabled,
                finishedTimeAt: (() => {
                    if (!timingObj?.finishedTimeAt) return null;
                    let date = new Date();
                    let [hours, minutes] = timingObj.finishedTimeAt?.split(':')?.map(Number);
                    date.setHours(hours, minutes, 0, 0);
                    return date;
                })(),
                startedTimeAt: (() => {
                    if (!timingObj?.startedTimeAt) return null;
                    let date = new Date();
                    let [hours, minutes] = timingObj?.startedTimeAt?.split(':')?.map(Number);
                    date.setHours(hours, minutes, 0, 0);
                    return date;
                })(),
            };
            setEditAudienceData(audiences);
            let channelTypeData = digipopChannelType?.find((item) => item?.name === subChannelType) || '';
            temp.creatives = editCreative;
            temp.timing = timingData;
            temp.channelType = channelTypeData;
            reset((prev) => ({
                ...prev,
                ...temp,
            }));
        } else {
            setIsDigipopFail(true);
        }
    };

    const handleSmartLinkValue = async () => {
        const response = await handleSmartLink();
        const { blastSC = '', smartCode = '', urlName = '' } = await response;
        setValue('url', blastSC && smartCode && urlName ? `${urlName}${smartCode}${blastSC}` : smartLink1);
    };

    useEffect(() => {
        if (!locationAds) return;
        (async () => {
            if (savedChannel) {
                beginEditSkeleton();
            }
            try {
                await getDigiPopAudience();
                if (savedChannel) {
                    await getDigipopComm();
                }
            } finally {
                if (savedChannel) {
                    finishEditSkeleton();
                }
            }
        })();
    }, [locationAds]);

    useEffect(() => {
        if (locationAds && smartLink1) {
            handleSmartLinkValue();
        }
    }, [locationAds,smartLink1]);

    const handleSmartLink = async (paramsPayload = {}) => {
        let payload = {
            clientId,
            departmentId,
            userId,
            blastType: '',
            campaignId: locationAds?.campaignId ?? 0,
            channelId: 38,
            goalNo: 1,
            blastNo: locationAds?.campaignType === 'S' || locationAds?.campaignType === 'T' ? 1 : 0,
            parentChannelDetailId: 0,
            actionId: 0,
            subSegmentId: 0,
            ...paramsPayload,
        };
        const { status, data } = await dispatch(getSmartUrlDetailByChannel({ payload }));
        if (status) {
            return data;
        } else {
            return {};
        }
    };

    useEffect(() => {
        if (savedChannel) {
            const filteredAudData = audienceData?.filter((item) => editAudienceData?.includes(item?.audienceID));
            reset((prev) => ({
                ...prev,
                audience: filteredAudData,
            }));
        }
    }, [editAudienceData, audienceData]);
    const handleSaveChannelsId = async () => {
        const finalSavedChannelId = { ...savedChannelsId };
        const channelID = 10;
        if (savedChannelsId[channelID]?.includes(subChannelId)) {
            finalSavedChannelId[channelID] = [...savedChannelsId[channelID]];
        } else {
            finalSavedChannelId[channelID] = [...(savedChannelsId[channelID] || []), subChannelId];
        }
        await dispatch(updateSaveChannelsId(finalSavedChannelId));
    };
    const onFormSubmit = async (formState, type) => {
        const payload = buildDigipopPayload(formState);
        const finalPayload = {
            ...payload,
            userId,
            departmentId,
            clientId,
            name: locationAds?.campaignName,
            partnerId: 41,
            campaignId: locationAds?.campaignId || 0,
            startDate: locationAds?.startDate,
            endDate: locationAds?.endDate,
            channelId: 10,
            subChannelId: subChannelId,
        };
        const saveApi = savedChannel ? update_digipop_Communication : save_digipop_Communication;
        const { status, message } = await runSave(getAuthoringSaveButtonType(type), () =>
            dispatch(
                savedChannel
                    ? saveApi(finalPayload)
                    : saveApi(finalPayload, { loading: false }),
            ),
        );

        if (status) {
            await handleSaveChannelsId();
            if (type === 'save') {
                dispatch(resetCreateCommunication());
                navigate('/communication', {
                    index: 0,
                });
            } else {
                handleNavigation();
            }
        }
    };
    const handleNavigation = () => {
        const tabIndex = adsTabState.currentIndex + 1;
        if (availableTabs['ads']?.length === tabIndex) {
            const nextChannel = communicationChannels.find(
                (chan, index) => channelType !== chan && Object.hasOwn(activeTabs, chan) && index > currentTab,
            );
            // console.log('NExt channe ::: ', nextChannel);
            const isValidActiveTabs = (activeTabs) => {
                const allowedKeys = ['ads', 'analytics'];
                const keys = Object.keys(activeTabs);
                return keys.every((key) => allowedKeys.includes(key)) && keys.includes('ads');
            };
            const savedChannel = savedChannelsId[10];
            let isOnlyDigipop = savedChannel?.length === 1 && savedChannel[0] === 9;
            if (isOnlyDigipop && nextChannel === 'analytics' && isValidActiveTabs(activeTabs)) {
                navigate('/communication', {
                    index: 0,
                });
            } else if (!!nextChannel) {
                dispatch(
                    updateVerticalTab({
                        tabs: activeTabs?.[nextChannel] || {
                            type: 'qr',
                            currentTab: 6,
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
                    const encryptState = encodeUrl(locationAds);
                    dispatch(resetCreateCommunication());
                    navigate(`${url}?q=${encryptState}`, {
                        state: locationAds,
                    });
                }
            }
        } else {
            dispatch(
                updateTab({
                    field: 'ads',
                    data: {
                        tabName: availableTabs['ads'][tabIndex],
                        currentIndex: tabIndex,
                    },
                }),
            );
        }
    };
    const handleErrClose = () => {
        if (isDigipopFail) {
            navigate('/communication', {
                index: 0,
            });
        }
        setIsDigipopFail(false);
    };
    const handleChannelChange = () => {
        reset((prev) => ({
            ...prev,
            ...RESET_ON_TYPECHANGE,
        }));
        clearErrors('channelType');
        setValue('channelType', '');
    };
    const handleChannelTypeChange = () => {
        setValue('creatives', [{ type: '', typeVal: '' }]);
        reset((prev) => ({
            ...prev,
            ...RESET_ON_TYPECHANGE,
        }));
        clearErrors('creatives');
        clearErrors('maxImpression');
    };

    useEffect(() => {
        if (!smartLink1) {
            setIsSmartLink(true);
        } else {
            setIsSmartLink(false);
        }
    }, [smartLink1]);
    return (
        <AuthoringChannelEditSkeletonGate channelId={channelId} isLoading={showEditSkeleton && isSavedChannel}>
        <FormProvider {...methods}>
            <form
                onSubmit={handleSubmit((data) => onFormSubmit(data, 'form'))}
                className="rsv-tabs-content  position-relative"
            >
                <div className={`box-design bd-top-border`}>
                    <div
                        className={`form-group mt20 ${
                            checkTrigger(locationAds?.campaignType, locationAds?.endDate)
                                ? 'pe-none click-off'
                                : !isCommunicationEditable
                                ? 'pe-none click-off'
                                : ''
                        }`}
                    >
                        <div className="form-group">
                            <Row>
                                <Col sm={{ offset: 1, span: 2 }}>
                                    <label className="control-label-left">{AUDIENCE}</label>
                                </Col>
                                <Col sm={6} id="rs_Email_audienceemail" className={`position-relative `}>
                                    <RSMultiSelect
                                        control={control}
                                        name="audience"
                                        dataItemKey={'audienceID'}
                                        textField={'listName'}
                                        data={audienceData}
                                        abel={AUDIENCE_LIST}
                                        required
                                        rules={{
                                            required: SELECT_AUDIENCE_LIST,
                                            // validate: (audience) => audienceListValidator(audience, false),
                                            // validate: audienceListValidator,
                                        }}
                                        isCustomOnchange
                                        setError={setError}
                                        handleChange={(e) => {}}
                                        handleFilterChange={(event) => {}}
                                        clearErrors={clearErrors}
                                    />

                                    <small className="position-absolute right15">
                                        Audience: {numberWithCommas(calucateAudienceCount) || 0}
                                    </small>
                                </Col>
                            </Row>
                        </div>
                        <div className="form-group">
                            <Row>
                                <Col sm={{ offset: 1, span: 2 }}>
                                    <label className="control-label-left">Description</label>
                                </Col>
                                <Col sm={6}>
                                    <RSTextarea
                                        name="description"
                                        control={control}
                                        required
                                        placeholder={ENTER_DESCRIPTION}
                                        maxLength={MAX_LENGTH150}
                                        onKeyDown={charNumUnderScore}
                                    />
                                    <small>Max. 150 characters.</small>
                                </Col>
                            </Row>
                        </div>
                        {/* <div className="form-group">
                            <Row>
                                <Col sm={{ offset: 1, span: 2 }}>
                                    <label className="control-label-left">Url</label>
                                </Col>
                                <Col sm={6} className={`${smartLink?.smartLink1 ? 'click-off' : ''}`}>
                                    <RSInput
                                        control={control}
                                        name={'url'}
                                        label={URL}
                                        rules={{
                                            required: ENTER_URL,
                                        }}
                                        required
                                    />
                                </Col>
                                <Col sm={1} className={Object.keys(smartLink)?.length <= 1 ? 'click-off' : ''}>
                                    <RSTooltip text="Smart link">
                                        <RSBootstrapdown
                                            flatIcon={true}
                                            className="no_caret"
                                            showUpdate={false}
                                            data={Object.keys(smartLink)}
                                            isCustomDefaultIcon={true}
                                            isActive
                                            defaultItem={<i className={`${editor_smart_link_medium} icon-md `} />}
                                            onSelect={async (value) => {
                                                const lastSmartLinkValue = value.match(/^([a-zA-Z]+)(\d+)$/)?.[2];
                                                const payload = {
                                                    goalNo: parseInt(lastSmartLinkValue, 10),
                                                };
                                                const response = await handleSmartLink(payload);
                                                const { blastSC, smartCode, urlName } = response;
                                                setValue(
                                                    'url',
                                                    blastSC && smartCode && urlName
                                                        ? `${urlName}${smartCode}${blastSC}`
                                                        : smartLink[value],
                                                );
                                            }}
                                        />
                                    </RSTooltip>
                                </Col>
                            </Row>
                        </div> */}
                        {/* {!smartLink?.smartLink1 && (
                            <SmartLinkEnable
                                secondaryButton={false}
                                onSave={() => setIsSmartLink(false)}
                                onReject={() => {
                                    dispatch(showTabsSmartlink(true));
                                    setIsSmartLink(true);
                                }}
                                isSmartLink={isSmartLink}
                            />
                        )} */}
                        <div className="form-group">
                            <Row>
                                <Col sm={{ offset: 1, span: 2 }}>
                                    <label className="control-label-left">Channel</label>
                                </Col>
                                <Col sm={channelWatch?.id === 1 ? 3 : 6}>
                                    <RSKendoDropDownList
                                        control={control}
                                        name={'channel'}
                                        data={digipopChannel}
                                        label={CHANNEL}
                                        rules={{
                                            required: ENTER_CHANNEL,
                                        }}
                                        required
                                        textField={'name'}
                                        dataItemKey={'id'}
                                        handleChange={handleChannelChange}
                                    />
                                </Col>
                                {channelWatch?.type === 'programmatic' && (
                                    <Col sm={3}>
                                        <RSKendoDropDownList
                                            control={control}
                                            name={'channelType'}
                                            data={digipopChannelType}
                                            label={TYPE}
                                            rules={{
                                                required: ENTER_CHANNEL,
                                            }}
                                            required
                                            textField={'name'}
                                            dataItemKey={'id'}
                                            handleChange={handleChannelTypeChange}
                                        />
                                    </Col>
                                )}
                            </Row>
                        </div>
                        {/* <div className="form-group">
                            <Row>
                                <Col sm={{ offset: 1, span: 2 }}>
                                    <label className="control-label-left">Device type</label>
                                </Col>
                                <Col sm={6} className={`position-relative `}>
                                    <RSMultiSelect
                                        control={control}
                                        name="deviceTypeOptions"
                                        //dataItemKey={'segmentationListId'}
                                        data={['phone', 'desktop']}
                                        label={DEVICE_TYPE_OPTIONS}
                                        handleChange={(e) => {}}
                                    />
                                </Col>
                            </Row>
                        </div> */}

                        <div className="form-group mt30">
                            <Row>
                                <Col sm={{ offset: 1, span: 2 }}>
                                    <label className="control-label-left">
                                        {channelTypeWatch?.type === 'pushnotif' ? 'Click' : 'Impression'}
                                    </label>
                                </Col>
                                <Col sm={6} className={``}>
                                    <RSInput
                                        control={control}
                                        name="maxImpression"
                                        placeholder={
                                            channelTypeWatch?.type === 'pushnotif'
                                                ? CLICK_URL
                                                : MAX_IMPRESSION
                                        }
                                        onKeyDown={onlyNumbers}
                                        maxLength={MAX_LENGTH8}
                                        handleOnchange={(e) => {}}
                                        required
                                        rules={{
                                            required:
                                                channelTypeWatch?.type === 'pushnotif'
                                                    ? DIGIPOP_CLICK
                                                    : DIGIPOP_IMPRESSION,
                                            validate: (val) => {
                                                let impVal = Number(val);
                                                if (impVal < 12000) {
                                                    return 'Minimum 12000';
                                                }
                                                // else if(impVal > balanceCount){
                                                //     return `Maximun ${balanceCount}`
                                                // }
                                                else {
                                                    return true;
                                                }
                                            },
                                        }}
                                    />
                                </Col>
                            </Row>
                        </div>

                        {channelTypeWatch?.type !== 'pushnotif' && channelWatch?.type !== 'metaads' && (
                            <section>
                                <div className="form-group mt10">
                                    <Row>
                                        <Col sm={{ offset: 1, span: 2 }}>
                                            <label className="control-label-left">Custom timing</label>
                                        </Col>
                                        <Col sm={1}>
                                            <div className="form-group">
                                                <RSSwitch
                                                    control={control}
                                                    name={`timing.weekdayEnabled`}
                                                    handleChange={(status) => {
                                                        RESET_WEEKDAYS?.forEach((day) =>
                                                            setValue(`timing.${day}`, status),
                                                        );
                                                        clearErrors(`timing.startedTimeAt`);
                                                        clearErrors(`timing.finishedTimeAt`);

                                                        if (!status) {
                                                            setValue(`timing.startedTimeAt`, '');
                                                            setValue(`timing.finishedTimeAt`, '');
                                                        } else {
                                                            setValue(
                                                                `timing.startedTimeAt`,
                                                                getValues(`timing.startedTimeAt`) ||
                                                                    new Date(new Date().setHours(19, 0, 0, 0)),
                                                            );
                                                            setValue(
                                                                `timing.finishedTimeAt`,
                                                                getValues(`timing.finishedTimeAt`) ||
                                                                    new Date(new Date().setHours(23, 0, 0, 0)),
                                                            );
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </Col>

                                        <Col sm={5} className="pl3">
                                            <ul className="flex-vertical-center">
                                                {weekcheckboxData.map((days, index) => {
                                                    return (
                                                        <li key={days.name}>
                                                            <RSCheckbox
                                                                control={control}
                                                                name={`timing.${days.name}`}
                                                                labelName={days.labelName}
                                                                value={days.value}
                                                                rules={{}}
                                                                handleChange={({ target: { checked, value } }) => {
                                                                    let weekdays = weekcheckboxData
                                                                        .map((item) => item.value)
                                                                        .filter(
                                                                            (day) => day !== 'Sat' && day !== 'Sun',
                                                                        );

                                                                    let selectedDays = weekdays.filter((day) =>
                                                                        getValues(`timing.${day.toLowerCase()}`),
                                                                    );
                                                                    if (!checked && weekdays.includes(value)) {
                                                                        setValue('timing.weekdayEnabled', false);
                                                                    } else if (checked && weekdays.includes(value)) {
                                                                        if (
                                                                            selectedDays?.length + 1 ===
                                                                            weekdays?.length
                                                                        ) {
                                                                            setValue('timing.weekdayEnabled', true);
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </Col>
                                    </Row>
                                </div>
                                <div className="form-group mt-30">
                                    <Row>
                                        <Col sm={{ offset: 1, span: 2 }}>
                                            <label className="control-label-left">From</label>
                                        </Col>
                                        <Col sm={2} className="time-start pl0 pr0">
                                            <RSTimePicker
                                                name={`timing.startedTimeAt`}
                                                control={control}
                                                format={'HH:mm'}
                                                label={START_TIME}
                                                steps={{
                                                    hour: 1,
                                                    minute: 5,
                                                }}
                                                defaultValue={new Date().setHours(19, 0, 0, 0)}
                                                handleChange={() => {
                                                    setValue(`timing.finishedTimeAt`, '');
                                                    clearErrors(`timing.finishedTimeAt`);
                                                }}
                                            />
                                        </Col>
                                        <Col sm={{ span: 1 }}>
                                            <p className="text-center">To</p>
                                        </Col>
                                        <Col sm={2} className="time-start pl0 pr0">
                                            <RSTimePicker
                                                disabled={!startTimeAt}
                                                name={`timing.finishedTimeAt`}
                                                control={control}
                                                label={END_TIME}
                                                steps={{
                                                    hour: 1,
                                                    minute: 5,
                                                }}
                                                format={'HH:mm'}
                                                defaultValue={new Date().setHours(23, 0, 0, 0)}
                                                rules={{
                                                    validate: (value) => {
                                                        if (value && value < startTimeAt) {
                                                            return 'Enter greater value';
                                                        } else {
                                                            return true;
                                                        }
                                                    },
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                </div>
                                <div className="form-group">
                                    <Row>
                                        <Col sm={{ offset: 1, span: 2 }}>
                                            <label className="control-label-left">Custom OTT</label>
                                        </Col>
                                        <Col sm={1}>
                                            <div>
                                                <span className="">
                                                    <RSSwitch
                                                        control={control}
                                                        name="ott"
                                                        handleChange={(status) => {
                                                            //if (!status) resetField('splitscehdule');
                                                        }}
                                                    />
                                                </span>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            </section>
                        )}
                        {/* <div className="form-group mt50">
                            <Row>
                                <Col sm={{ offset: 1, span: 2 }}>
                                    <label className="control-label-left">Supply type</label>
                                </Col>
                                <Col sm={6} className={`position-relative `}>
                                    <RSMultiSelect
                                        control={control}
                                        name="supplyTypeOptions"
                                        //dataItemKey={'segmentationListId'}
                                        data={['Web', 'App']}
                                        label={SUPPLY_TYPE_OPTIONS}
                                        handleChange={(e) => {}}
                                    />
                                </Col>
                            </Row>
                        </div> */}
                        {channelTypeWatch?.type !== 'pushnotif' && channelWatch?.type !== 'metaads' && (
                            <div className="form-group">
                                <Row>
                                    <Col sm={{ offset: 1, span: 2 }}>
                                        <label className="control-label-left">Spent distribution</label>
                                        {/* 'Uniform', 'Asap' */}
                                    </Col>
                                    <Col sm={6} className={``}>
                                        <Row>
                                            <Col sm={3}>
                                                <RSRadioButton
                                                    id="Uniform"
                                                    name="spentDistribution"
                                                    control={control}
                                                    labelName={'Uniform'}
                                                />
                                            </Col>
                                            <Col sm={3}>
                                                <RSRadioButton
                                                    name="spentDistribution"
                                                    labelName={'Asap'}
                                                    id="Asap"
                                                    control={control}
                                                />
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </div>
                        )}

                        {(!!channelWatch || !!channelTypeWatch) && (
                            <Row>
                                <Col>
                                    <Creatives
                                        fieldName={'creatives'}
                                        // formState={adsName}
                                        fields={fields}
                                        append={append}
                                        remove={remove}
                                        deviceTypeData={deviceTypeData}
                                        setDeviceTypeData={setDeviceTypeData}
                                    />
                                </Col>
                            </Row>
                        )}

                        {/* <div className="form-group">
                            <Row>
                                <Col sm={{ offset: 1, span: 2 }}>
                                    <label className="control-label-left">Click URL</label>
                                </Col>
                                <Col sm={6} className={``}>
                                    <RSInput
                                        control={control}
                                        name="clickUrl"
                                        placeholder={CLICK_URL}
                                        handleOnchange={(e) => {}}
                                        rules={{
                                            validate: (value) => {
                                                return value?.length && IsValidURL(value);
                                            },
                                        }}
                                    />
                                </Col>
                            </Row>
                        </div>
                        <div className="form-group">
                            <Row>
                                <Col sm={{ offset: 1, span: 2 }}>
                                    <label className="control-label-left">Default click URL</label>
                                </Col>
                                <Col sm={6} className={``}>
                                    <RSInput
                                        control={control}
                                        name="defaultClickUrl"
                                        placeholder={DEFAULT_CLICK_URL}
                                        handleOnchange={(e) => {}}
                                        rules={{
                                            validate: (value) => {
                                                return value?.length && IsValidURL(value);
                                            },
                                        }}
                                    />
                                </Col>
                            </Row>
                        </div> */}
                        {/* <div className="form-group">
                            <Row>
                                <Col sm={{ offset: 1, span: 2 }}>
                                    <label className="control-label-left">Achieved impression</label>
                                </Col>
                                <Col sm={6} className={``}>
                                    <RSInput
                                        control={control}
                                        name="achievedImpression"
                                        placeholder={ACHIEVED_IMPRESSIONS}
                                        handleOnchange={(e) => {}}
                                        onKeyDown={onlyNumbers}
                                        maxLength={MAX_LENGTH8}
                                    />
                                </Col>
                            </Row>
                        </div> */}

                        {/* <Row>
                        <Col sm={{ offset: 1, span: 2 }}>
                            <label className="control-label-left">Communication period</label>
                        </Col>
                        <Col md={3}>
                            <RSDatePicker
                                placeholder={START_DATE}
                                control={control}
                                name="startdate"
                                required
                                // min={isEditable ? new Date(editModeStartDateRef.current) : new Date()}
                                min={new Date()}
                                max={getDateBasedonMonth(6)}
                                rules={{
                                    required: SELECT_START_DATE,
                                }}
                                handleChange={() => {}}
                            />
                        </Col>
                        <Col md={3} className={''}>
                            <div>
                                <RSDatePicker
                                    placeholder={END_DATE}
                                    control={control}
                                    name="enddate"
                                    required
                                    min={addDaysToDate(new Date(), 3)}
                                    max={getDateBasedonMonth(6, new Date())}
                                    rules={{
                                        required: SELECT_END_DATE,
                                    }}
                                />
                            </div>
                        </Col>
                    </Row> */}

                        {/* <div className="form-group">
                            <Row>
                                <Col sm={{ offset: 1, span: 2 }}>
                                    <label className="control-label-left">Remaining impression</label>
                                </Col>
                                <Col sm={6} className={``}>
                                    <RSInput
                                        control={control}
                                        name="remainingImpression"
                                        placeholder={REMAINING_IMPRESSION}
                                        handleOnchange={(e) => {}}
                                        onKeyDown={onlyNumbers}
                                        maxLength={MAX_LENGTH8}
                                    />
                                </Col>
                            </Row>
                        </div> */}

                        {/* <Row className="mt50">
                            <Col sm={{ offset: 1, span: 2 }}>
                                <label className="control-label-left">State</label>
                            </Col>
                            <Col sm={6} className={``}>
                                <RSInput
                                    control={control}
                                    name="state"
                                    placeholder={STATE}
                                    handleOnchange={(e) => {}}
                                />
                            </Col>
                        </Row>

                        <Row className="mt50">
                            <Col sm={{ offset: 1, span: 2 }}>
                                <label className="control-label-left">State Label</label>
                            </Col>
                            <Col sm={6} className={``}>
                                <RSInput
                                    control={control}
                                    name="stateLabel"
                                    placeholder={STATE_LABEL}
                                    handleOnchange={(e) => {}}
                                />
                            </Col>
                        </Row> */}
                    </div>
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
                        id="rs_Ads_Cancel"
                    >
                        {CANCEL}
                    </RSSecondaryButton>
                    <RSSecondaryButton
                        className="color-secondary-blue"
                        onClick={() => {
                            handleSubmit((data) => onFormSubmit(data, 'save'))();
                        }}
                        name="saveButton"
                        id="rs_Ads_Save"
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
                            if (!isDirty && !isValid) {
                                setNavigate_confirm(true);
                            } else {
                                handleSubmit((data) => onFormSubmit(data, 'next'))();
                            }
                        }}
                        name="nextButton"
                        id="rs_Ads_Next"
                    >
                        {NEXT}
                    </RSPrimaryButton>
                </div>
            </form>{' '}
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
                show={impressionModal}
                text={`Impression count is ${balanceCount}, do you want to continue?`}
                primaryButtonText={OK}
                handleClose={() => {
                    setImpressioModal(false);
                    navigate('/communication', {
                        replace: true,
                        state: {
                            index: 0,
                        },
                    });
                }}
                handleConfirm={() => {
                    setImpressioModal(false);
                }}
                isCloseButton={false}
            />
            {getWarningPopupMessage(failureApiErrors, dispatch, handleErrClose)}
        </FormProvider>
        </AuthoringChannelEditSkeletonGate>
    );
};

export default DigipopCommunication;
