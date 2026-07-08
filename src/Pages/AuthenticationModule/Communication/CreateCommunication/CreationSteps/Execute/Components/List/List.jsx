import { statusIdCheck } from 'Utils/modules/campaignUtils';
import { numberWithCommas, parseFormattedNumber } from 'Utils/modules/formatters';
import { ch_tertiary_grey } from 'Constants/GlobalConstant/Colors/colorsVariable';
import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { HorizontalSkeleton } from 'Components/Skeleton/Skeleton';
import { ADVANCED_ANALYTIC, ARE_YOU_SURE_DELETE, AUDIENCE, CONTROL_GROUP_TARGET, DELETE_USER_ROLE, EDIT, FREQUENCY_CAP, LIMIT_LIST_SPLIT_SCHEDULE, LIMIT_SCAN_BY, LIST, LIST_CONTROL, LIST_QUALITY, NA, OK, POTENTIAL_TARGET_AUDIENCE, REMOVE, SCRUBBED, SCRUBBED_BY_LIMIT_CAP, SCRUBBING_INPROGRESS, SERVICE_MANDATORY_TEXT, SPLIT_SCHEDULE, UNIQUE_AUDIENCE } from 'Constants/GlobalConstant/Placeholders';
import { channel_action_large, circle_info_large, circle_info_medium, circle_minus_fill_medium, pencil_edit_medium, user_calender_large, user_cgtg_large, user_list_large, user_settings_large } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Container } from 'react-bootstrap';

import { LIST_INITIAL_DATA, list } from './constant';


import RSTooltip from 'Components/RSTooltip';
import FrequencyCapModal from './Components/FrequencyCap/FrequencyCapModal';
import LimitListModal from './Components/LimitListModal/LimitListModal';
import SuppressionModal from './Components/SuppressionModal/SuppressionModal';
import SendMaxModal from './Components/SendMaxModal/SendMaxModal';
import AdvancedAnalyticsModal from './Components/AdvancedAnalyticsModal/AdvancedAnalyticsModal';
import ScrubbedModal from './Components/ScrubbedModal/ScrubbedModal';
import InfoContent from './Components/InfoContent/InfoContent';
import QRLimitListModal from './Components/QRLimitListModal/QRLimitListModal';
import RSAlert from 'Components/RSAlert';
import { RSPrimaryButton } from 'Components/Buttons';

import { useDispatch, useSelector } from 'react-redux';
import {
    deleteFrequencyCapping,
    getFrequencyCapData,
    getLimitListData,
    saveLimitList,
} from 'Reducers/communication/createCommunication/execute/request';
import { getSessionId } from 'Reducers/globalState/selector';
import useQueryParams from 'Hooks/useQueryParams';
import RSConfirmationModal from 'Components/ConfirmationModal';
import CGTGModal from './Components/CGTG/CGTGModal';

const ListQualitySkeletonBar = ({ width, height = 12, className = '' }) => (
    <span
        className={`skeleton-shimmer d-inline-block ${className}`.trim()}
        style={{ width, height, borderRadius: 4 }}
        aria-hidden="true"
    />
);

const List = ({ tab, tabConfig, handleCGTGValidated }) => {
    const [infoToggle, setInfoToggle] = useState(false);
    const state = useQueryParams('/communication');
    const dispatch = useDispatch();
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));

    const [show, setShow] = useState({
        frequencyCapModal: false,
        limitListModal: false,
        suppressionModal: false,
        adavancedAnalyticsModal: false,
        sendMaxModal: false,
        scrubbedModal: false,
        qrLimitListModal: false,
        CGTGListModal: false,
    });
    const [isDelete, setIsDelete] = useState(false);
    const [isDeletingLimitList, setIsDeletingLimitList] = useState(false);
    const [isDeletingFrequencyCap, setIsDeletingFrequencyCap] = useState(false);
    const [countValue, setCountValue] = useState({});
    const [isListPortletLoading, setIsListPortletLoading] = useState(false);
    const activeTabRef = useRef(tab);
    const [showLimitList, setShowLimitList] = useState(false);
    const [showFrequencyCap, setShowFrequencyCap] = useState(false);
    const [showScanLimit, setShowScanLimit] = useState(false);
    const [showDeleteWarning, setDeleteWarning] = useState({
        status: false,
        name: '',
    });
    const [splitDate, setSplitDate] = useState('');
    const [frequencyList, setFrequencyList] = useState({});
    const [isCgTgEnabled, setIsCgTGEnabled] = useState({});
    const [serviceManFlag, setServiceManFlag] = useState(false);

    const [modifiedInitialData, setModifiedInitialData] = useState({});
    const methods = useForm({
        defaultValues: modifiedInitialData,
        mode: 'onTouched',
    });
    const { watch, resetField, setValue, reset, control } = methods;

    const { channelDetails, campaignDetails, advancedAnalyticsData, advAnalyticsData } = useSelector(
        ({ communicationExecuteReducer }) => communicationExecuteReducer,
    );
    const campaignType = campaignDetails?.campaignType;
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const value = channelDetails?.[tab]?.contentDetail?.listquality;
    const channelId = channelDetails?.[tab]?.channelId;
    const listtype = channelDetails?.[tab]?.contentDetail?.listquality?.listTypes;
    const listTypes = Array.isArray(listtype) ? [...new Set(listtype)] : [];
    const listAllowed =
        (listTypes?.length === 1 && listTypes?.includes(5)) ||
        (listTypes?.length === 2 && listTypes?.includes(5) && listTypes.includes(3));
    const scrubEnable = channelDetails?.[tab]?.scrubRules?.length;
    const cgtgEnable = channelDetails?.[tab]?.TGCG;
    const scheduledDate = channelDetails?.[tab]?.contentDetail?.content?.[0]?.scheduleDate;
    const splitType = channelDetails?.[tab]?.contentDetail?.content?.[0]?.splitType;
    const advanceFieldList = channelDetails?.[tab]?.contentDetail?.listquality?.advancedFieldList;
    //const channelId = getChannelId(tab?.toLowerCase())?.id;
    const statusId = state?.campaignStatusId || null;
    const preCampJobStatus = channelDetails?.[tab]?.preCampJobStatus;
    const disableFrequencyCap_AdvAnalytics = channelId === 14 || channelId === 8;
    // console.log('tab.toLowerCase(): ', tab.toLowerCase());
    // console.log('channelId: ', channelId);
    // const value = {};
    const [
        limitCount,
        volumePerDay,
        frequencyCapList,
        selectFrequency,
        potentialAudience,
        limitAudience,
        baseVoume,
        volumePercentage,
        selectAdvancedAnalytics,
        advancedAnalyticsList,
        sendMaxList,
        scanCount,
        scanTime,
        limitScanBy,
        frequencyOkay,
        advancedAnalyticsOkay,
        audienceTimeData,
        limitListDate,
    ] = watch([
        `${tab}.limitCount`,
        `${tab}.volumePerDay`,
        `${tab}.frequencyCapList`,
        `${tab}.selectFrequency`,
        `${tab}.potentialAudience`,
        `${tab}.limitAudience`,
        `${tab}.baseVolume`,
        `${tab}.volumePercentage`,
        `${tab}.selectAdvancedAnalytics`,
        `${tab}.advancedAnalyticsList`,
        `${tab}.sendMaxList`,
        `${tab}.scanCount`,
        `${tab}.scanTime`,
        `${tab}.limitScanBy`,
        `${tab}.frequencyOkay`,
        `${tab}.advancedAnalyticsOkay`,
        `${tab}.audienceTimeData`,
        `${tab}.limitListDate`,
    ]);
    const [cgTgValues, setCgTgValues] = useState({});
    const showSplitScheduleInfo =
        infoToggle && Array.isArray(audienceTimeData) && audienceTimeData.length > 0;

    useLayoutEffect(() => {
        if (!tab) return;
        activeTabRef.current = tab;
        setInfoToggle(false);
        setShowLimitList(false);
        setShowFrequencyCap(false);
        setSplitDate('');
        setIsListPortletLoading(true);
    }, [tab]);

    useEffect(() => {
        if (!tab) return;

        // setPotentialAudience(numberWithCommas(list?.uniqueAudience - list?.scrubbed));
        setValue(`${tab}.potentialAudience`, list?.uniqueAudience - list?.scrubbed);

        const loadTabData = async () => {
            try {
                await getEditFlow(tab);
            } finally {
                if (activeTabRef.current === tab) {
                    setIsListPortletLoading(false);
                }
            }
        };

        loadTabData();
    }, [tab]);
    useEffect(() => {
        const initial = tabConfig?.reduce((acc, item) => {
            if (item?.text) {
                acc[item.text] = LIST_INITIAL_DATA?.defaultValues;
            }
            return acc;
        }, {});
        setModifiedInitialData(initial);
    }, [tabConfig]);
    useEffect(() => {
        if (campaignDetails?.isServiceMandatory) {
            setServiceManFlag(true);
        }
    }, [campaignDetails]);
    const deleteFrequencyCap = async () => {
        setIsDeletingFrequencyCap(true);
        const payload = {
            clientId,
            departmentId,
            userId,
            channelId: channelId,
            campaignId: state?.campaignId,
            isFrequencyCap: false,
        };
        try {
            const { status } = await dispatch(deleteFrequencyCapping(payload, { loading: false }));
            if (status) {
                setValue(`${tab}.frequencyOkay`, false);
                setValue(`${tab}.frequencyCapList`, false);
                resetField(`${tab}.selectFrequency`);
                resetField(`${tab}.frequencyCapList`);
                setShowFrequencyCap(false);
                setValue(`${tab}.potentialAudience`, potentialAudience + value?.frequencyCap);
                setFrequencyList([]);
            }
            setDeleteWarning({
                status: false,
                name: '',
            });
        } finally {
            setIsDeletingFrequencyCap(false);
        }
    };
    const getScrubbedByLimitCap = () =>
        parseFormattedNumber(value?.potentialTarget) +
        parseFormattedNumber(value?.miniListCount) -
        parseFormattedNumber(limitCount);

    const calculateData = (volume, volumePercentage, volumeType, activeTab = tab) => {
        const listQuality = channelDetails?.[activeTab]?.contentDetail?.listquality;
        const scheduleDate = channelDetails?.[activeTab]?.contentDetail?.content?.[0]?.scheduleDate;
        var currentDate = new Date(scheduleDate);
        if (volumeType === 'Equal') {
            const limit = parseFormattedNumber(listQuality?.potentialTarget);
            const audienceTimeData = [];
            let totalVolume = 0;
            const currVolumePerDay = parseFormattedNumber(volume);
            let currentDateCopy = new Date(currentDate);

            while (totalVolume < limit) {
                let nextVolume = currVolumePerDay;
                if (totalVolume + nextVolume > limit) {
                    nextVolume = limit - totalVolume;
                }

                audienceTimeData.push({
                    day: audienceTimeData?.length + 1,
                    // date: dateFormat(currentDateCopy),
                    date: getUserCurrentFormat(currentDateCopy)?.dateFormat,
                    audienceCount: nextVolume,
                });

                totalVolume += nextVolume;

                if (totalVolume >= limit) {
                    break;
                }

                currentDateCopy.setDate(currentDateCopy.getDate() + 1);
            }
            return audienceTimeData;
        } else {
            let audienceTimeData = [];
            const parsedVolume = parseFormattedNumber(volume);
            var addedValues = [parsedVolume];
            let limit = parseFormattedNumber(listQuality?.potentialTarget);
            let audienceVolume = parsedVolume;
            let incrementPercentage = parseFormattedNumber(volumePercentage);
            let endDate = new Date(state?.endDate);
            let currentDateCopy = new Date(currentDate);
            let totalVolume = 0;
            //debugger
            while (totalVolume < limit) {
                if (currentDateCopy > endDate) {
                    break;
                }

                let nextVolume = audienceVolume;
                if (totalVolume + nextVolume > limit) {
                    nextVolume = limit - totalVolume;
                }

                audienceTimeData.push({
                    day: audienceTimeData?.length + 1,
                    // date: dateFormat(currentDateCopy),
                    date: getUserCurrentFormat(currentDateCopy)?.dateFormat,
                    audienceCount: nextVolume,
                });

                totalVolume += nextVolume;

                if (totalVolume >= limit) {
                    break;
                }

                let addedVolume = Math.round(audienceVolume * (incrementPercentage / 100));
                addedValues.push(audienceVolume + addedVolume);
                audienceVolume += addedVolume;

                currentDateCopy.setDate(currentDateCopy.getDate() + 1);
            }

            if (totalVolume > limit && audienceTimeData.length > 0) {
                let lastEntry = audienceTimeData[audienceTimeData.length - 1];
                lastEntry.audienceCount -= totalVolume - limit;
                addedValues[addedValues.length - 1] -= totalVolume - limit;
                totalVolume = limit;
            }
            return audienceTimeData;
        }
    };

    const getEditFlow = async (activeTab = tab) => {
        const activeChannelId = channelDetails?.[activeTab]?.channelId;
        if (!activeTab || !activeChannelId) return;

        const payloadLimitList = {
            clientId,
            departmentId,
            userId,
            campaignId: state?.campaignId,
            channelId: activeChannelId,
        };
        const payloadFrequencyCap = {
            clientId,
            userId,
            campaignId: state?.campaignId,
            channelId: activeChannelId,
        };
        const [resLimitList, resFrequencyCap] = await Promise.all([
            dispatch(getLimitListData(payloadLimitList)),
            dispatch(getFrequencyCapData(payloadFrequencyCap)),
        ]);

        if (activeTabRef.current !== activeTab) return;

        const activeAdvanceFieldList =
            channelDetails?.[activeTab]?.contentDetail?.listquality?.advancedFieldList;
        let tempObj = modifiedInitialData?.[activeTab];
        if (resLimitList?.status) {
            let tempData = resLimitList?.data?.[0];
            // let scrubDate = dateFormat(tempData?.scrubEndDate);
            let scrubDate = getUserCurrentFormat(tempData?.scrubEndDate)?.dateFormat;

            const AudData =
                tempData?.limitAudienceType !== '1'
                    ? calculateData(
                          tempData?.baseValume,
                          tempData?.incrementalPercent,
                          tempData?.splitValueType === 'E' ? 'Equal' : 'Incremental',
                          activeTab,
                      )
                    : [];

            tempObj = {
                ...tempObj,
                volumePerDay: tempData?.baseValume,
                baseVolume: tempData?.baseValume,
                volumePercentage: tempData?.incrementalPercent,
                limitAudience: tempData?.limitAudienceType === '1' ? 'One time' : 'By day',
                limitCountAgree: tempData?.miniListAccept,
                limitCount: tempData?.miniListCnt,
                limitListDate:
                    tempData?.splitValueType === 'E'
                        ? `${tempData?.baseValume} per day, till ${scrubDate}`
                        : `Incremental of ${tempData?.incrementalPercent}% till ${scrubDate}`,
                volumeType: tempData?.splitValueType === 'E' ? 'Equal' : 'Incremental',
                audienceTimeData: AudData,
            };
            setShowLimitList(true);
            setSplitDate(scrubDate);
            setCountValue({
                volume: tempData?.baseValume,
                baseVolume: tempData?.baseValume,
                incremental: tempData?.incrementalPercent,
            });
        } else {
            setShowLimitList(false);
            setSplitDate('');
            tempObj = {
                ...tempObj,
                limitAudience: '',
                limitCount: '',
                limitCountAgree: '',
                limitListDate: '',
                volumeType: '',
                volumePerDay: '',
                baseVolume: '',
                volumePercentage: '',
                audienceTimeData: [],
            };
        }
        if (resFrequencyCap?.status) {
            tempObj = {
                ...tempObj,
                selectFrequency: resFrequencyCap?.data,
                frequencyOkay: true,
                frequencyCapList: true,
                isEditFrequency: true,
            };
            setShowFrequencyCap(true);
        }

        if (Object.keys(advAnalyticsData ?? {}).length === 0) {
            tempObj = {
                ...tempObj,
                advancedAnalyticsList: activeAdvanceFieldList ? true : false,
                advancedAnalyticsOkay: activeAdvanceFieldList ? true : false,
            };
        } else if (Object.keys(advAnalyticsData ?? {}).length > 0) {
            tempObj = {
                ...tempObj,
                advancedAnalyticsList: advAnalyticsData?.[activeTab]?.length ? true : false,
                advancedAnalyticsOkay: advAnalyticsData?.[activeTab]?.length ? true : false,
            };
        }

        if (Object.keys(isCgTgEnabled)?.length === 0) {
            for (var i = 0; i < campaignDetails?.channelDetails?.length; i++) {
                let name = campaignDetails?.channelDetails[i]?.channelName;
                let cgTg = campaignDetails?.channelDetails[i]?.TGCG;
                setIsCgTGEnabled((prev) => ({
                    ...prev,
                    [name]: cgTg?.isTGCGEnabled,
                }));
                setCgTgValues((prev) => ({
                    ...prev,
                    [name]: {
                        cgVal: cgTg?.isTGCGEnabled ? cgTg?.cG : 0,
                        tgVal: cgTg?.isTGCGEnabled ? cgTg?.tG : 100,
                    },
                }));
            }
        } else {
            setIsCgTGEnabled((prev) => ({
                ...prev,
                [activeTab]: isCgTgEnabled[activeTab] ? true : false,
            }));
        }

        reset((formState) => ({
            ...formState,
            [activeTab]: tempObj,
        }));
    };

    const renderListQualitySkeleton = () => (
        <div className="portlet-container portlet-md pfooter p0">
            <div className="p19">
                <div className="portlet-header">
                    <h4>{LIST_QUALITY}</h4>
                </div>
                <div className="portlet-body text-center">
                    <ul className="d-flex campaign-lists">
                        <li>
                            <ListQualitySkeletonBar width={64} />
                            <div className="mt5">
                                <ListQualitySkeletonBar width={48} height={28} />
                            </div>
                        </li>
                        <li>
                            <ListQualitySkeletonBar width={96} />
                            <div className="mt5">
                                <ListQualitySkeletonBar width={48} height={28} />
                            </div>
                        </li>
                    </ul>
                    <div className="text-center">
                        <hr className="my20 opacity-100" style={{ borderTopColor: ch_tertiary_grey }} />
                    </div>
                    <ul className="d-flex campaign-lists">
                        <li>
                            <ListQualitySkeletonBar width={56} />
                            <div className="align-items-center d-flex justify-content-center mt5">
                                <ListQualitySkeletonBar width={32} height={28} />
                                <ListQualitySkeletonBar width={18} height={18} className="ml5" />
                            </div>
                        </li>
                    </ul>
                    <div className="text-center">
                        <hr className="my20 opacity-100" style={{ borderTopColor: ch_tertiary_grey }} />
                    </div>
                    <ul className="d-flex campaign-lists">
                        <li>
                            <ListQualitySkeletonBar width={168} />
                            <div className="mt5">
                                <ListQualitySkeletonBar width={48} height={28} />
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="bg-tertiary-blue border-blr10 border-brr10 position-absolute w-100 bottom-0 left-0 py10">
                <ul className="d-flex align-items-center execute-list-footer justify-content-center">
                    {Array.from({ length: 3 }, (_, index) => (
                        <li key={index}>
                            <ListQualitySkeletonBar width={28} height={28} />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
    const deleteLimitList = async () => {
        setIsDeletingLimitList(true);
        const payload = {
            clientId,
            departmentId,
            userId,
            limitListDomain: {
                campaignId: state?.campaignId,
                channelId: channelId,
                miniListCount: 0,
                minilistAccept: false,
                limitAudienceType: '',
                splitValueType: '',
                baseVolume: 0,
                incrementalPercentage: 0,
                scrubEndDate: '',
            },
        };
        try {
            const res = await dispatch(saveLimitList(payload));
            if (res?.status) {
                if (limitAudience === 'One time')
                    setValue(
                        `${tab}.potentialAudience`,
                        parseFormattedNumber(potentialAudience) + parseFormattedNumber(limitCount),
                    );
                setIsDelete(true);
                reset((prev) => ({
                    ...prev,
                    [tab]: {
                        ...prev[tab],
                        limitAudience: '',
                        limitCount: '',
                        limitCountAgree: '',
                        limitListDate: '',
                        volumeType: '',
                        volumePerDay: '',
                        baseVolume: '',
                        volumePercentage: '',
                        audienceTimeData: [],
                    },
                }));
                setShowLimitList(false);
            }
            setDeleteWarning({
                status: false,
                name: '',
            });
        } finally {
            setIsDeletingLimitList(false);
        }
    };

    const handlePotentialTargetAudience = (value) => {
        if (Object.keys(cgTgValues)?.length) {
            const totalAudience = Number(value?.totalAudience) || 0;
            const tgValue = Math.round((Number(cgTgValues?.[tab]?.tgVal) || 0) / 100 * totalAudience);
            const cgValue = Math.round((Number(cgTgValues?.[tab]?.cgVal) || 0) / 100 * totalAudience);
            const finalTotalAudience = totalAudience - cgValue - (Number(value?.scrubbed) || 0);
            return numberWithCommas(finalTotalAudience);
        } else {
            return numberWithCommas(
                parseFormattedNumber(value?.potentialTarget) + parseFormattedNumber(value?.miniListCount),
            );
        }
    };

    return (
        <FormProvider {...methods}>
            {!!value ? (
                <div>
                    {isListPortletLoading ? (
                        renderListQualitySkeleton()
                    ) : showSplitScheduleInfo ? (
                        <div className="rs-columns-block p19 mb20 portlet-container portlet-md pfooter">
                            <InfoContent
                                show={true}
                                tab={tab}
                                handleClose={() => {
                                    //debugger
                                    setInfoToggle(false);
                                    //getEditFlow()
                                }}
                            />
                        </div>
                    ) : (
                        <div className="portlet-container portlet-md pfooter p0">
                            <div className="p19">
                                <div className="portlet-header">
                                    <h4>{LIST_QUALITY}</h4>
                                </div>
                                <div className="portlet-body text-center">
                                    <ul className="d-flex campaign-lists">
                                        <li>
                                            <p className="analytics-count">{AUDIENCE}</p>
                                            {tab === 'QR' ? (
                                                <h3>{numberWithCommas(list?.qrAudience)}</h3>
                                            ) : (
                                                <h3>
                                                    {' '}
                                                    {campaignType === 'T' && Number(value?.totalAudience) === 0
                                                        ? 'NA'
                                                        : numberWithCommas(value?.totalAudience)}
                                                </h3>
                                            )}
                                        </li>

                                        <li>
                                            <p className="analytics-count">{UNIQUE_AUDIENCE}</p>
                                            <h3>
                                                {campaignType === 'T' && Number(value?.totalUniqAudience) === 0
                                                    ? 'NA'
                                                    : numberWithCommas(value?.totalUniqAudience)}
                                            </h3>
                                        </li>
                                    </ul>
                                    <div className="text-center">
                                        <hr
                                            className="my20 opacity-100"
                                            style={{ borderTopColor: ch_tertiary_grey }}
                                        ></hr>
                                    </div>
                                    <ul className="d-flex campaign-lists">
                                        <li>
                                            {tab === 'QR' ? (
                                                <>
                                                    <h4>{LIST_CONTROL}</h4>
                                                    {scanCount !== '' ? (
                                                        <h3>
                                                            {numberWithCommas(scanCount)},{limitScanBy}(s), per{' '}
                                                            {scanTime}{' '}
                                                        </h3>
                                                    ) : (
                                                        <h1>{NA}</h1>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <p className="analytics-count">{preCampJobStatus ? SCRUBBING_INPROGRESS : SCRUBBED}</p>
                                                    <div className="align-items-center d-flex justify-content-center">
                                                        <h3>
                                                            {campaignType === 'T' && Number(value?.scrubbed) === 0
                                                                ? 'NA'
                                                                : campaignDetails?.isServiceMandatory
                                                                ? 0
                                                                : numberWithCommas(value?.scrubbed)}
                                                        </h3>
                                                        <RSTooltip
                                                            className="lh0"
                                                            position="top"
                                                            text={EDIT}
                                                        >
                                                            <i
                                                                id="rs_data_pencil_edit"
                                                                className={`${
                                                                    pencil_edit_medium
                                                                } icon-md color-primary-blue ml5 ${
                                                                    scrubEnable > 0 ? '' : 'click-off'
                                                                } ${
                                                                    campaignDetails?.isServiceMandatory
                                                                        ? 'click-off'
                                                                        : ''
                                                                }`}
                                                                onClick={() => {
                                                                    setShow((prev) => ({
                                                                        ...prev,
                                                                        scrubbedModal: true,
                                                                    }));
                                                                }}
                                                            ></i>
                                                        </RSTooltip>
                                                    </div>
                                                </>
                                            )}
                                        </li>

                                        {frequencyOkay && frequencyCapList && (
                                            <li>
                                                <div className="text-center">
                                                    <p className="analytics-count">{FREQUENCY_CAP}</p>
                                                    <div className="align-items-center d-flex justify-content-center">
                                                        <h3>{numberWithCommas(value?.frequencyCap)}</h3>
                                                        <RSTooltip className="lh0" text={REMOVE}>
                                                            <i
                                                                className={`${
                                                                    circle_minus_fill_medium
                                                                } icon-md color-primary-red ml5  ${
                                                                    !statusIdCheck(statusId) ? 'click-off' : ''
                                                                }`}
                                                                onClick={() => {
                                                                    setDeleteWarning({
                                                                        status: true,
                                                                        name: 'frequencyCap',
                                                                    });
                                                                    // deleteFrequencyCap();
                                                                }}
                                                            ></i>
                                                        </RSTooltip>
                                                    </div>
                                                    <div className="d-flex justify-content-lg-center">
                                                        {selectFrequency?.length ? (
                                                            <small className="px5 font-xs">{`(${selectFrequency
                                                                .map((data) => name ?? ruleName)
                                                                .join(', ')})`}</small>
                                                        ) : null}
                                                        <RSTooltip
                                                            className="lh0"
                                                            position="top"
                                                            text={EDIT}
                                                        >
                                                            <i
                                                                id="rs_data_pencil_edit"
                                                                className={`${
                                                                    pencil_edit_medium
                                                                } icon-md color-primary-blue position-relative top-3  ${
                                                                    !statusIdCheck(statusId) ? 'click-off' : ''
                                                                }`}
                                                                onClick={() => {
                                                                    setShow((prev) => ({
                                                                        ...prev,
                                                                        frequencyCapModal: true,
                                                                    }));
                                                                }}
                                                            ></i>
                                                        </RSTooltip>
                                                    </div>
                                                </div>
                                            </li>
                                        )}
                                    </ul>
                                    <div className="text-center">
                                        <hr
                                            className="my20 opacity-100"
                                            style={{ borderTopColor: ch_tertiary_grey }}
                                        ></hr>
                                    </div>
                                    {/* {showFrequencyCap && frequencyCapList && (
                                    <hr
                                        className="m0 opacity-100"
                                        style={{ borderTopColor: ch_tertiary_grey }}
                                    ></hr>
                                )} */}
                                    <ul className="d-flex campaign-lists">
                                        {showLimitList ? null : (
                                            <li>
                                                <p className="analytics-count">
                                                    {POTENTIAL_TARGET_AUDIENCE}
                                                </p>
                                                {tab === 'QR' ? (
                                                    <h3>{numberWithCommas(list?.qrAudience)}</h3>
                                                ) : (
                                                    <>
                                                        <h3>
                                                            {campaignType === 'T' &&
                                                            Number(value?.potentialTarget) === 0
                                                                ? 'NA'
                                                                : showScanLimit
                                                                ? numberWithCommas(value?.potentialTarget)
                                                                : handlePotentialTargetAudience(value)}
                                                        </h3>
                                                    </>
                                                )}
                                            </li>
                                        )}
                                        {/* <li className={showLimitList ? 'd-none' : ''}>
                                        <h5>Potential target audience</h5>
                                        {tab === 'QR' ? (
                                            <h1>{numberWithCommas(list?.qrAudience)}</h1>
                                        ) : (
                                            <h1>
                                                {showScanLimit
                                                    ? numberWithCommas(value?.potentialTarget)
                                                    : numberWithCommas(value?.totalUniqAudience)}
                                            </h1>
                                        )}
                                    </li> */}

                                        {tab === 'QR' && showScanLimit ? (
                                            <li>
                                                <div className="text-center">
                                                    <p className="analytics-count">{LIMIT_SCAN_BY}</p>
                                                    <h3>
                                                        {numberWithCommas(scanCount)}
                                                        <i
                                                            className={`${circle_minus_fill_medium} icon-md color-primary-red`}
                                                            onClick={() => {
                                                                resetField('limitScanBy');
                                                                resetField('scanCount');
                                                                resetField('scanTime');
                                                                setShowScanLimit(false);
                                                            }}
                                                        ></i>
                                                    </h3>

                                                    <small>
                                                        {limitScanBy}(s), per {scanTime}
                                                    </small>
                                                    <i
                                                        className={`${pencil_edit_medium} icon-md color-primary-blue`}
                                                        id="rs_data_pencil_edit"
                                                    />
                                                </div>
                                            </li>
                                        ) : (
                                            <>
                                                {showLimitList && state?.campaignType !== 'T' && (
                                                    <li>
                                                        <div className="text-center">
                                                            {limitAudience === 'One time' ? (
                                                                <p className="analytics-count">
                                                                    {SCRUBBED_BY_LIMIT_CAP}
                                                                </p>
                                                            ) : (
                                                                <p className="analytics-count">
                                                                    {SPLIT_SCHEDULE}
                                                                </p>
                                                            )}
                                                            <div className="align-items-center d-flex justify-content-center">
                                                                <h3>
                                                                    {limitAudience === 'One time'
                                                                        ? numberWithCommas(getScrubbedByLimitCap())
                                                                        : numberWithCommas(
                                                                              (countValue?.volume ?? volumePerDay) ||
                                                                                  (countValue?.baseValume ?? baseVoume),
                                                                          )}
                                                                </h3>

                                                                <RSTooltip
                                                                    text={REMOVE}
                                                                    className={`lh0 ${
                                                                        !statusIdCheck(statusId) ? 'click-off' : ''
                                                                    }`}
                                                                >
                                                                    <i
                                                                        className={`${circle_minus_fill_medium} icon-md color-primary-red ml5`}
                                                                        onClick={() => {
                                                                            // if (limitAudience === 'One time')
                                                                            //     setValue(
                                                                            //         'potentialAudience',
                                                                            //         Number(potentialAudience) +
                                                                            //             Number(
                                                                            //                 limitCount
                                                                            //                     .toString()
                                                                            //                     .replace(/,/g, ''),
                                                                            //             ),
                                                                            //     );
                                                                            // resetField('limitAudience');
                                                                            // resetField('baseVolume');
                                                                            // resetField('limitCount');
                                                                            // resetField('volumePerDay');
                                                                            // resetField('volumePercentage');
                                                                            // resetField('limitCountAgree');
                                                                            // resetField('volumeType');
                                                                            // setValue('audienceTimeData', []);
                                                                            // // resetField('limitListDate');
                                                                            // setValue('limitListDate', '');
                                                                            // reset((prev) => ({
                                                                            //     ...prev,
                                                                            //     limitAudience: '',
                                                                            //     limitCount: '',
                                                                            //     limitCountAgree: '',
                                                                            //     limitListDate: '',
                                                                            //     volumeType: 'Equal',
                                                                            //     volumePerDay: '',
                                                                            //     baseVolume: '',
                                                                            //     volumePercentage: '',
                                                                            //     audienceTimeData: [],
                                                                            // }));
                                                                            // setShowLimitList(false);
                                                                            setDeleteWarning({
                                                                                status: true,
                                                                                name: 'limitList',
                                                                            });
                                                                            //setLimitAudienceCount();
                                                                            //setCountValue();
                                                                            // deleteLimitList();
                                                                        }}
                                                                    ></i>
                                                                </RSTooltip>
                                                            </div>

                                                            {limitAudience === 'By day' && volumePerDay !== '' ? (
                                                                <small className="font-xs mt-5">{limitListDate}</small>
                                                            ) : (
                                                                <>
                                                                    {splitDate !== '' && (
                                                                        <small className="font-xs">
                                                                            {limitAudience === 'One time'
                                                                                ? ''
                                                                                : 'Incremental of ' +
                                                                                  //   volumePercentage +
                                                                                  //   ' % ' +
                                                                                  splitDate}
                                                                        </small>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </li>
                                                )}
                                            </>
                                        )}
                                        <li className={showLimitList ? '' : 'd-none'}>
                                            <p className="analytics-count">{POTENTIAL_TARGET_AUDIENCE}</p>
                                            {tab === 'QR' ? (
                                                <h1>{numberWithCommas(list?.qrAudience)}</h1>
                                            ) : (
                                                <h3>
                                                    {limitAudience === 'One time'
                                                        ? numberWithCommas(limitCount)
                                                        : numberWithCommas(value?.potentialTarget)}
                                                </h3>
                                            )}
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="text-center">
                                <hr
                                    className="m0 mt15 pb10 opacity-100 d-none"
                                    style={{ borderTopColor: ch_tertiary_grey }}
                                ></hr>
                            </div>
                            <div className="bg-tertiary-blue border-blr10 border-brr10 position-absolute w-100 bottom-0 left-0 py10">
                                <ul className="d-flex align-items-center execute-list-footer justify-content-center">
                                    <li>
                                        <RSTooltip text={FREQUENCY_CAP} position="top" className="lh0">
                                            <i
                                                className={`${!disableFrequencyCap_AdvAnalytics ? '' : 'click-off'}
                                                ${listAllowed ? '' : 'click-off'} ${campaignDetails?.isServiceMandatory ? 'click-off' : ''
                                                    } ${selectFrequency?.length !== 0 && frequencyCapList
                                                        ? `${user_calender_large} icon-lg color-primary-blue`
                                                        : `${user_calender_large} icon-lg color-secondary-grey`
                                                    }`}
                                                onClick={() => {
                                                    setShow((prev) => ({
                                                        ...prev,
                                                        frequencyCapModal: true,
                                                    }));
                                                }}
                                            ></i>
                                        </RSTooltip>
                                    </li>

                                    {state?.campaignType !== 'T' && (channelId === 1 || channelId === 2 || channelId === 21 || channelId === 41 || channelId === 8 || channelId === 14) && splitType === '' && (
                                        <li>
                                            <RSTooltip
                                                text={CONTROL_GROUP_TARGET}
                                                position="top"
                                                className="lh0"
                                            >
                                                <i
                                                    className={`
                                                            ${(listAllowed) ? '' : 'click-off'}
                                                            ${campaignDetails?.isServiceMandatory ? 'click-off' : ''} 
                                                       ${isCgTgEnabled[tab]
                                                            ? `${user_cgtg_large} icon-lg color-primary-blue`
                                                            : `${user_cgtg_large} icon-lg color-secondary-grey`
                                                        }
                                                    `}
                                                    onClick={() => {
                                                        setShow((prev) => ({
                                                            ...prev,
                                                            CGTGListModal: true,
                                                        }));
                                                    }}
                                                ></i>
                                            </RSTooltip>
                                        </li>
                                    )}
                                    {tab !== 'QR' &&
                                        state?.campaignType !== 'T' &&
                                        state?.campaignType !== 'M' &&
                                        Number(value?.totalUniqAudience) > 100 &&
                                        scheduledDate !== '' &&
                                        splitType === '' && (
                                            <li className={channelId === 1 || channelId === 2 || channelId === 21 || channelId === 41 ? '' : 'click-off'}>
                                                <RSTooltip
                                                    text={'Limit list/Split schedule'}
                                                    position="top"
                                                    className="lh0"
                                                >
                                                    <i
                                                        className={`
                                                            ${user_list_large}
                                                            icon-lg
                                                            ${showLimitList ? 'color-primary-blue click-off' : 'color-secondary-grey'}
                                                            ${value?.totalAudience > 100 ? '' : 'click-off'}
                                                            ${campaignDetails?.isServiceMandatory ? 'click-off' : ''}
                                                            `}
                                                        onClick={() =>
                                                            setShow((prev) => ({
                                                                ...prev,
                                                                limitListModal: true,
                                                            }))
                                                        }
                                                    ></i>
                                                </RSTooltip>
                                            </li>
                                        )}
                                    {tab === 'QR' && state?.campaignType !== 'T' && (
                                        <li>
                                            <RSTooltip
                                                text={LIMIT_LIST_SPLIT_SCHEDULE}
                                                position="top"
                                                className="lh0"
                                            >
                                                <i
                                                    className={`
                                                        ${user_settings_large}
                                                        icon-lg
                                                        ${scanCount !== '' ? 'color-primary-blue' : 'color-secondary-grey'}
                                                        ${campaignDetails?.isServiceMandatory ? 'click-off' : ''}
                                                        `}
                                                    onClick={() =>
                                                        setShow((prev) => ({
                                                            ...prev,
                                                            qrLimitListModal: true,
                                                        }))
                                                    }
                                                ></i>
                                            </RSTooltip>
                                        </li>
                                    )}
                                    <li>
                                        <RSTooltip text={ADVANCED_ANALYTIC} position="top" className="lh0">
                                            <i
                                                className={`${!disableFrequencyCap_AdvAnalytics ? '' : 'click-off'}
                                                ${listAllowed ? '' : 'click-off'}
                                                    ${
                                                        advancedAnalyticsOkay
                                                            ? `${channel_action_large} icon-lg color-primary-blue`
                                                            : `${channel_action_large} icon-lg color-secondary-grey`
                                                    }`}
                                                onClick={() => {
                                                    setShow((prev) => ({
                                                        ...prev,
                                                        adavancedAnalyticsModal: true,
                                                    }));
                                                }}
                                            ></i>
                                        </RSTooltip>
                                    </li>
                                    {/* {!audienceTimeData?.length !== 0 && (
                                        <li className="px15">
                                            <RSTooltip text={'Info'}>
                                                <i
                                                    className={`${circle_info_large} icon-lg color-primary-blue`}
                                                    onClick={() => setInfoToggle(true)}
                                                ></i>
                                            </RSTooltip>
                                        </li>
                                    )} */}
                                </ul>
                                {audienceTimeData?.length > 0 && limitAudience === 'By day' && (
                                    <div className="bottom5 lh0 position-absolute right5">
                                        <RSTooltip text={SPLIT_SCHEDULE}>
                                            <i
                                                className={`${circle_info_medium} icon-md color-primary-blue`}
                                                onClick={() => setInfoToggle(true)}
                                                id="rs_data_circle_info"
                                            ></i>
                                        </RSTooltip>
                                    </div>
                                )}
                            </div>
                            <FrequencyCapModal
                                show={show.frequencyCapModal}
                                handleClose={() =>
                                    setShow((prev) => ({
                                        ...prev,
                                        frequencyCapModal: false,
                                    }))
                                }
                                tab={tab}
                                frequencyList={frequencyList}
                                setFrequencyList={setFrequencyList}
                            />
                            {show.CGTGListModal && (
                                <CGTGModal
                                    show={show.CGTGListModal}
                                    handleClose={() =>
                                        setShow((prev) => ({
                                            ...prev,
                                            CGTGListModal: false,
                                        }))
                                    }
                                    tab={tab}
                                    data={channelDetails?.[tab]}
                                    control={control}
                                    cgTgValues={cgTgValues}
                                    setCgTgValues={setCgTgValues}
                                    setIsCgTgEnabled={setIsCgTGEnabled}
                                    isCgTgEnabled={isCgTgEnabled}
                                    handleCGTGValidated={handleCGTGValidated}
                                />
                            )}
                            <LimitListModal
                                show={show.limitListModal}
                                handleClose={() => {
                                    setShow((prev) => ({
                                        ...prev,
                                        limitListModal: false,
                                    }));
                                }}
                                setSplitDate={setSplitDate}
                                setShowLimitList={setShowLimitList}
                                tab={tab}
                                countValue={countValue}
                                setCountValue={setCountValue}
                                isDelete={isDelete}
                            />
                            <SuppressionModal
                                show={show.suppressionModal}
                                handleClose={() => {
                                    setShow((prev) => ({
                                        ...prev,
                                        suppressionModal: false,
                                    }));
                                }}
                            />
                            <ScrubbedModal
                                show={show.scrubbedModal}
                                handleClose={() => {
                                    setShow((prev) => ({
                                        ...prev,
                                        scrubbedModal: false,
                                    }));
                                }}
                                tab={tab}
                            />
                            <AdvancedAnalyticsModal
                                show={show.adavancedAnalyticsModal}
                                handleClose={() => {
                                    setShow((prev) => ({
                                        ...prev,
                                        adavancedAnalyticsModal: false,
                                    }));
                                }}
                                tab={tab}
                            />
                            <SendMaxModal
                                show={show.sendMaxModal}
                                handleClose={() => {
                                    setShow((prev) => ({
                                        ...prev,
                                        sendMaxModal: false,
                                    }));
                                }}
                                tab={tab}
                            />
                            <QRLimitListModal
                                show={show.qrLimitListModal}
                                handleClose={() => {
                                    setShow((prev) => ({
                                        ...prev,
                                        qrLimitListModal: false,
                                    }));
                                }}
                                setShowScanLimit={setShowScanLimit}
                                tab={tab}
                            />
                            <RSConfirmationModal
                                show={showDeleteWarning?.status}
                                text={ARE_YOU_SURE_DELETE}
                                primaryButtonText={OK}
                                isBorder
                                header={DELETE_USER_ROLE}
                                isLoading={
                                    (showDeleteWarning?.name === 'limitList' && isDeletingLimitList) ||
                                    (showDeleteWarning?.name === 'frequencyCap' && isDeletingFrequencyCap)
                                }
                                handleClose={() => {
                                    setDeleteWarning({
                                        status: false,
                                        name: '',
                                    });
                                }}
                                blockBodyPointerEvents={
                                    (showDeleteWarning?.name === 'limitList' && isDeletingLimitList) ||
                                    (showDeleteWarning?.name === 'frequencyCap' && isDeletingFrequencyCap)
                                }
                                handleConfirm={() => {
                                    if (showDeleteWarning?.name === 'limitList') {
                                        setIsDeletingLimitList(true);
                                        deleteLimitList();
                                    } else if (showDeleteWarning?.name === 'frequencyCap') {
                                        deleteFrequencyCap();
                                    }
                                }}
                            />
                        </div>
                    )}
                </div>
            ) : (
                <div className="portlet-container portlet-md ">
                    <div className="portlet-header">
                        <h4>{LIST}</h4>
                    </div>
                    <HorizontalSkeleton />
                </div>
            )}
            {serviceManFlag && (
                <>
                    <div className="rs-homepage-alert-wrapper">
                        <RSAlert
                            show={serviceManFlag}
                            header={false}
                            body={
                                <Container>
                                    <div className="d-flex align-items-center justify-content-center">
                                        <h3>{SERVICE_MANDATORY_TEXT}</h3>
                                        <RSPrimaryButton
                                            onClick={() => {
                                                setServiceManFlag(false);
                                            }}
                                        >
                                            {OK}
                                        </RSPrimaryButton>
                                    </div>
                                </Container>
                            }
                        />
                    </div>
                </>
            )}
            {getWarningPopupMessage(failureApiErrors, dispatch)}
        </FormProvider>
    );
};

export default List;
