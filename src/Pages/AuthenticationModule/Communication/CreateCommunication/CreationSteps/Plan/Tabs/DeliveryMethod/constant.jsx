import {Fragment} from 'react';
import { get as _get, map as _map, filter as _filter, cloneDeep as _cloneDeep } from 'Utils/modules/lodashReplacements';
import Daily from 'Pages/AuthenticationModule/Components/Schedules/Daily';
import Weekly from 'Pages/AuthenticationModule/Components/Schedules/Weekly';
import Monthly from 'Pages/AuthenticationModule/Components/Schedules/Monthly';
import Shortly from 'Pages/AuthenticationModule/Components/Schedules/Shortly';
import {
    ANALYTICS_TOOTLTIP_TEXT,
    END_DATE_LATEST_BLAST_BOUND,
    START_DATE_EARLIEST_BLAST_BOUND,
} from 'Constants/GlobalConstant/Placeholders';


import { encodeUrl } from 'Utils/modules/crypto';
import { getYYMMDD } from 'Utils/modules/dateTime';
import { resetCreateCommunication } from 'Reducers/communication/createCommunication/create/reducer';
import { resetCommunicationPlan } from 'Reducers/communication/createCommunication/plan/reducer';
import { handleCampaignStatus } from 'Reducers/communication/createCommunication/plan/request';

export const REDUCER_INITIAL_STATE = {
    tags: [],
    primaryGoal: false,
    isTagsEnabled: false,
    secondaryGoal: false,
    isTimeZoneEdit: false,
    isOpenGoalModal: false,
    isTagEnabledModal: false,
    communicationReferenceData: [],
    isCommunicationReferenceModal: false,
    secondaryGoalConfirmation: false,
    isCommunicationReference: false,
    frequencyType: 4,
    primaryConversionTypes: [],
    secondaryConversionTypes: [],
    conversionTypes: {},
    defaultCommunicationReferenceConfigData: [],
    editCommunicationReferenceData: [],
    subProductError: {},
    edit: {},
    currentFrequencyTab: 0,
    isReferenceSaved: false,
    referenceDocketFileName: '',
};

export const getMetrixValue = (type) => {
    if (type === 'Reach') return 1;
    else if (type === 'Engagement') return 2;
    else return 3;
};

export const getCampaignBlastDetailRows = (campaignBlastDetails) => {
    const raw = campaignBlastDetails;
    if (!raw) return [];
    return Array.isArray(raw) ? raw : [raw];
};

export const validateStartDateAgainstCampaignBlast = (value, campaignBlastDetails, statusId) => {
    if (statusId === 5 || (statusId && ![0, 6, 7, 54].includes(Number(statusId)))) return true;
    if (value == null || value === '') return true;
    const minRows = getCampaignBlastDetailRows(campaignBlastDetails).filter(
        (r) => r?.isMin === true && r?.blastDateTime,
    );
    if (!minRows.length) return true;
    const blastStartLower = new Date(Math.max(...minRows.map((r) => new Date(r.blastDateTime).getTime())));
    const t = new Date(value).getTime();
    if (Number.isNaN(t)) return true;
    if (t > blastStartLower.getTime()) return START_DATE_EARLIEST_BLAST_BOUND;
    return true;
};

export const validateEndDateAgainstCampaignBlast = (value, campaignBlastDetails, statusId) => {
    if (statusId === 5 || (statusId && ![0, 6, 7, 54].includes(Number(statusId)))) return true;
    if (value == null || value === '') return true;
    const maxRows = getCampaignBlastDetailRows(campaignBlastDetails).filter(
        (r) => r?.isMin === false && r?.blastDateTime,
    );
    if (!maxRows.length) return true;
    const blastEndUpper = new Date(Math.min(...maxRows.map((r) => new Date(r.blastDateTime).getTime())));
    const t = new Date(value).getTime();
    if (Number.isNaN(t)) return true;
    if (t < blastEndUpper.getTime()) return END_DATE_LATEST_BLAST_BOUND;
    return true;
};

export const ANALYTICS_TYPES = [
    {
        id: [6],
        name: 'web',
        labelName: 'Web',
        text: 'Analyze the behavior of visitors on your website.',
        selected: true,
        disabled: false,
    },
    {
        id: [16],
        name: 'app',
        labelName: 'App',
        text: 'Analyze the behavior of visitors on your mobile app.',
        selected: false,
        disabled: false,
    },
    // {
    //     id: [5],
    //     name: 'socialmedia',
    //     labelName: 'Social media',
    //     text: 'Link your external domains to monitor communication conversion.',
    //     selected: false,
    //     disabled: false,
    // },
    {
        id: [4], //
        name: 'orm',
        labelName: 'Sentiment',
        text: 'Analyze the brand or communication sentiment on the web.',
        selected: false,
        disabled: true,
    },
    {
        id: [15],
        name: 'video',
        labelName: 'Video',
        text: 'Analyze the behavior of visitors on your videos.',
        selected: false,
        disabled: true,
    },
    {
        id: [13],
        name: 'Events',
        labelName: 'Events',
        text: 'Analyze the events.',
        selected: false,
        disabled: true,
    },
]

export const CHANNEL_ORDER = [1, 33, 2, 21, 41, 8, 14, 7, 26, 10, 3, 6, 16];

export const SOCIAL_CHANNEL_ORDER = [1, 3, 6, 8, 5]; // Facebook, Twitter, Instagram, LinkedIn, Pinterest

export const PAID_MEDIA_CHANNEL_ORDER = [1, 2, 3, 4, 9]; // Google, Facebook, Twitter, LinkedIn, Digipop

export const getSortedChannels = (channels, channelIdKey = '', subChannelIdKey = '') => {
    if (!channels || !Array.isArray(channels)) return channels;

    const channelKey = channelIdKey || 'channelId';
    const subChannelKey = subChannelIdKey || 'socialPostChannelId';

    return [...channels].sort((channelA, channelB) => {
        const channelIdA = Number(
            Array.isArray(channelA.id)
                ? channelA.id[0]
                : channelA[channelKey] ?? channelA.id
        );

        const channelIdB = Number(
            Array.isArray(channelB.id)
                ? channelB.id[0]
                : channelB[channelKey] ?? channelB.id
        );

        const indexA = CHANNEL_ORDER.indexOf(channelIdA);
        const indexB = CHANNEL_ORDER.indexOf(channelIdB);

        const sortA = indexA === -1 ? 500 : indexA;
        const sortB = indexB === -1 ? 500 : indexB;

        if (sortA === sortB) {
            const subChannelIdA = Number(
                channelA[subChannelKey] ??
                channelA.subChannelId ??
                channelA.typeId ??
                0
            );

            const subChannelIdB = Number(
                channelB[subChannelKey] ??
                channelB.subChannelId ??
                channelB.typeId ??
                0
            );

            let subOrder = [];
            if (channelIdA === 7) subOrder = SOCIAL_CHANNEL_ORDER;
            else if (channelIdA === 10) subOrder = PAID_MEDIA_CHANNEL_ORDER;

            if (subOrder.length > 0) {
                const subIndexA = subOrder.indexOf(subChannelIdA);
                const subIndexB = subOrder.indexOf(subChannelIdB);
                return (subIndexA === -1 ? 500 : subIndexA) - (subIndexB === -1 ? 500 : subIndexB);
            }

            return subChannelIdA - subChannelIdB;
        }

        return sortA - sortB;
    });
};

export const CHANNEL_TYPES = [
    {
        id: [1],
        name: 'email',
        labelName: 'Email',
        selected: false,
        disabled: false,
    },
    {
        id: [2],
        name: 'messaging',
        labelName: 'Messaging',
        selected: false,
        disabled: false,
        checkAllChannelsExist: true,
        checkListChannel: [2, 21, 41],
        parentChannelId: [2],
    },
    {
        id: [8, 14],
        name: 'notifications',
        labelName: 'Notifications',
        selected: false,
        disabled: false,
        checkAllChannelsExist: true,
        checkListChannel: [8, 14],
        parentChannelId: [8, 14],
    },
    {
        id: [7],
        name: 'socialpost',
        labelName: 'Social post',
        selected: false,
        disabled: false,
    },
    {
        id: [26],
        name: 'voice',
        labelName: 'Voice',
        selected: false,
        disabled: false,
    },
    {
        id: [10], //
        name: 'ads',
        labelName: 'Paid media',
        selected: false,
        disabled: false,
    },
    {
        id: [3],
        name: 'qr',
        labelName: 'QR',
        selected: false,
        disabled: false,
    },
];

export const OFFLINE_CONVERSION_CODES = ['O', 'OSP'];

export const OFFLINE_CONVERSION_CHANNEL_WARNING =
    'Offline Conversion is not supported for the selected channel(s). Please change the goal or select a supported channel.';

export const CHANNEL_NAMES_UNSUPPORTED_FOR_OFFLINE_CONVERSION = [
    'notifications',
    'socialpost',
    'voice',
    'ads',
    'qr',
];

export const OFFLINE_CONVERSION_CHANNEL_DISABLED_TOOLTIP =
    'Offline conversion applies only to Email and Messaging. Clear offline conversion types or choose supported channels.';

export const isOfflineConversionGoalSelection = (goalType) => {
    if (!goalType) return false;
    const list = Array.isArray(goalType) ? goalType : [];
    if (!list.length) return false;
    return list.some(
        (goal) =>
            goal &&
            (OFFLINE_CONVERSION_CODES.includes(goal.ConversionName)));
};

export const hasOfflineConversionChannelConflict = (primaryGoalType, secondaryGoalType, channelTypes) => {
    const offlineSelected =
        isOfflineConversionGoalSelection(primaryGoalType) || isOfflineConversionGoalSelection(secondaryGoalType);
    if (!offlineSelected || !channelTypes?.length) return false;
    return channelTypes.some(
        (ch) =>
            !!ch?.selected &&
            ch?.name &&
            CHANNEL_NAMES_UNSUPPORTED_FOR_OFFLINE_CONVERSION.includes(ch.name),
    );
};

export const getSelectedIncompatibleOfflineConversionChannelLabels = (channelTypes) => {
    if (!channelTypes?.length) return [];
    return channelTypes
        .filter(
            (ch) =>
                !!ch?.selected &&
                ch?.name &&
                CHANNEL_NAMES_UNSUPPORTED_FOR_OFFLINE_CONVERSION.includes(ch.name),
        )
        .map((ch) => ch.labelName || ch.name);
};

export const RESET_FREQUENCY = {
    shortly: {
        every_time: '',
        period: '',
    },
    daily: {
        days: '',
        hours: '',
    },
    weekly: {
        weekDays: [],
        hours: '',
        week: '',
    },
    monthly: {
        type: '',
        second_hours: '',
        second_months: '',
        second_days: '',
        second_frequency: '',
        first_hours: '',
        first_months: '',
        first_day: '',
    },
};

export const FORM_INITIAL_STATE = {
    defaultValues: {
        channelTypes: _cloneDeep(CHANNEL_TYPES),
        analyticsTypes: _cloneDeep(ANALYTICS_TYPES),
        primaryGoal: '',
        startdate: null,
        enddate: null,
        communicationName: '',
        testcampaign: '',
        subProductType: '',
        productType: '',
        communicationType: '',
        primaryGoalPercentage: '',
        primaryGoalType: [],
        secondaryGoal: '',
        secondaryGoalPercentage: '',
        secondaryGoalType: '',
        roi: false,
        dynamicList: {
            dynamicListId: 0,
            dynamicListName: '',
        },
        timezone: '',
        daylightSavings: false,
        shortly: {
            every_time: 0,
            period: '',
        },
        daily: {
            days: 0,
            hours: '',
        },
        weekly: {
            weekDays: [],
            hours: '',
            week: 0,
        },
        monthly: {
            type: '',
            second_hours: '',
            second_months: 0,
            second_days: { id: 1, name: 'mon', labelName: 'Monday', value: 'Monday' },
            second_frequency: { id: 1, label: 'First' },
            first_hours: '',
            first_months: 0,
            first_day: 0,
        },
        productSubcategoryTypeText: '',
        productcategoryTypeText:''
    },
    mode: 'onTouched',
    //mode: 'onChange',
};

export const stateReducer = (state, action) => {
    switch (action.type) {
        case 'UPDATE':
            return {
                ...state,
                [action.field]: action.payload,
            };
        case 'UPDATE_EDIT_FLOW':
            return {
                ...state,
                ...action.payload,
            };
        case 'UPDATE_EDIT':
            const { communicationReferenceData, secondaryGoal, tags } = action.payload;
            return {
                ...state,
                ...action.payload,
            };
        case 'UPDATE_COMMUNICATION_REFERENCE':
            const { payload } = action;
            return {
                ...state,
                communicationReferenceData: payload.communicationReferenceData,
                isCommunicationReferenceModal: payload.isCommunicationReferenceModal,
                isCommunicationReference: payload.isCommunicationReference,
                isReferenceSaved: payload.isSaved,
                referenceDocketFileName: payload.fileName,
            };
        case 'UPDATE_CONVERSION_TYPE':
            return {
                ...state,
                conversionTypes: {
                    ...state.conversionTypes,
                    [action.field]: action.payload,
                },
            };
        case 'UPDATE_REFERENCE_CONFIG':
            return {
                ...state,
                defaultCommunicationReferenceConfigData: action.payload,
            };
        case 'UPDATE_REFERENCE_EDIT_DATA':
            return {
                ...state,
                editCommunicationReferenceData: action.payload,
                communicationReferenceData: action.payload,
            };
        case 'RESET':
            return {
                ...state,
                channelTypes: _cloneDeep(CHANNEL_TYPES),
                analyticsTypes: _cloneDeep(ANALYTICS_TYPES),
                primarygoal: '',
                startdate: null,
                enddate: null,
                communicationName: '',
                testcampaign: '',
                subProductType: '',
                productType: '',
                communicationType: '',
                primarygoalPercentage: '',
                primaryGoalType: [],
                secondaryGoal: '',
                secondaryGoalPercentage: '',
                secondaryGoalType: null,
                roi: false,
                dynamicList: {
                    dynamicListId: '0',
                    dynamicListName: '',
                },
                timezone: 0,
                daylightSavings: false,
                shortly: {
                    every_time: 0,
                    period: '',
                },
                daily: {
                    days: 0,
                    hours: '',
                },
                weekly: {
                    weekDays: [],
                    hours: '',
                    week: 0,
                },
                monthly: {
                    type: '',
                    second_hours: '',
                    second_months: 0,
                    second_days: { id: 1, name: 'mon', labelName: 'Monday', value: 'Monday' },
                    second_frequency: { id: 1, label: 'First' },
                    first_hours: '',
                    first_months: 0,
                    first_day: 0,
                },
            };

        default:
            return state;
    }
};

export const FREQUENCY_TAB_CONFIG = [
    {
        id: 4,
        text: 'Immediate',
        component: () => <></>,
    },
    {
        id: 5,
        text: 'Shortly',
        component: () => <Shortly />,
    },
    { id: 1, text: 'Daily', component: () => <Daily /> },
    { id: 2, text: 'Weekly', component: () => <Weekly /> },
    { id: 3, text: 'Monthly', component: () => <Monthly /> },
];

export const weekcheckboxData = [
    { name: 'mon', labelName: 'Mon', value: 'Mon' },
    { name: 'tue', labelName: 'Tue', value: 'Tue' },
    { name: 'wed', labelName: 'Wed', value: 'Wed' },
    { name: 'thu', labelName: 'Thu', value: 'Thu' },
    { name: 'fri', labelName: 'Fri', value: 'Fri' },
    { name: 'sat', labelName: 'Sat', value: 'Sat' },
    { name: 'sun', labelName: 'Sun', value: 'Sun' },
];
export const WEEK_DAYS = [
    { name: 'mon', labelName: 'Monday', value: 'Monday' },
    { name: 'tue', labelName: 'Tuesday', value: 'Tuesday' },
    { name: 'wed', labelName: 'Wednesday', value: 'Wednesday' },
    { name: 'thu', labelName: 'Thursday', value: 'Thursday' },
    { name: 'fri', labelName: 'Friday', value: 'Friday' },
    { name: 'sat', labelName: 'Saturday', value: 'Saturday' },
    { name: 'sun', labelName: 'Sunday', value: 'Sunday' },
];

// export const hours = ['12:00 AM', '12:30 AM', '1:00 AM', '1:30 AM', '2:00 AM', '2:30 AM'];

export function getGoalType(type) {
    if (type === 'R') return 'Reach';
    else if (type === 'E') return 'Engagement';
    else if (type === 'C') return 'Conversion';
    return '';
}

export const formatGoalPercentageForForm = (value) =>
    value === null || value === undefined || value === '' ? '' : String(value);

export const buildRequestPayload = (formState, type, state, mode) => {
    const {
        primaryGoal,
        enddate,
        communicationName,
        frequencyType,
        primaryGoalPercentage,
        testCommunication = false,
        isServiceMandatoryComm = false,
        roi,
        startdate,
        primaryGoalType,
        timezone,
        dynamicList = '0',
        secondaryGoal,
        secondaryGoalPercentage,
        secondaryGoalType,
        channelTypes,
        analyticsTypes,
        isFrequency = false,
        subProductType,
        productType,
        communicationType,
        tags = '',
        isCommunicationReference,
        communicationReference,
        daylightSavings,
        daily,
        weekly,
        monthly,
        shortly,
        departmentId = 0,
        userId,
        clientId,
        campaignId,
        timeZoneId,
        templateId,
    } = formState;

    const getReferenceData = () => {
        let updateCommunicationRefData = [];

        if (isCommunicationReference) {
            updateCommunicationRefData = getUpdateCommunicationRefData(
                communicationReference,
                state?.communicationReferenceData?.docketFilename,
            );
        } else if (mode === 'edit') {
            // const refStatus = communicationReference?.every((ref) => ref.value);
            // if (refStatus)

            if (
                communicationReference &&
                communicationReference.length > 0 &&
                communicationReference.some((ref) => Object.keys(ref).length > 0)
            ) {
                const isSavedReferenceData = communicationReference.some((ref) => ref.value);

                if (isSavedReferenceData) {
                    updateCommunicationRefData = [...communicationReference];
                }
            }
            // else {
            //     updateCommunicationRefData = [];
            // }
        }

        return updateCommunicationRefData || [];
    };

    let payload = {
        departmentId,
        userId,
        clientId,
        campaignId,
        campaignName: communicationName,
        // isEmailChecked: tempChannelObj?.isEmailChecked,
        // isMessageChecked: tempChannelObj?.isMessageChecked,
        // isNotificationChecked: tempChannelObj?.isNotificationChecked,
        // isVoiceChecked: tempChannelObj?.isVoiceChecked,
        // isSocialPostChecked: tempChannelObj?.isSocialPostChecked,
        // isPaidAdsChecked: tempChannelObj?.isPaidAdsChecked,
        // isQRChecked: tempChannelObj?.isQRChecked,
        templateId: templateId || 0,
        templateChannelId: templateId && formState?.templateFlowChannelId ? (formState?.templateFlowChannelId || 0) : 0,
        primaryGoal: primaryGoal.substring(0, 1),
        primaryGoalPercentage: formatGoalPercentageForForm(primaryGoalPercentage),
        dynamicList: Number(_get(dynamicList, 'dynamicListId', '0')),
        startDate: getYYMMDD(startdate),
        endDate: getYYMMDD(enddate),
        testCommunication,
        isServiceMandatoryComm,
        communicationType: _get(communicationType, 'campaignAttributeId') || 0,
        productType: _get(productType, 'categoryId') || 0,
        subProductType: _get(subProductType, 'subCategoryId') || 0,
        tags: tags.toString(),
        communicationReference: getReferenceData(),
        primaryGoalType: _map(primaryGoalType, 'ConversionName').toString(),
        secondaryGoal: secondaryGoal?.substring(0, 1) || '',
        secondaryGoalPercentage:
            formatGoalPercentageForForm(secondaryGoalPercentage) || '0',
        secondaryGoalType: _map(secondaryGoalType, 'ConversionName').toString(),
        isFrequency,
        timeZoneId: timeZoneId,
        statusId: 6, //Draft
    };
    const getFrequecyPayload = (frequencyId) => {
        switch (frequencyId) {
            case 4:
                return {};
            case 1:
                return { frequencyId, ...daily };
            case 2:
                return { frequencyId, ...weekly };
            case 3:
                return { frequencyId, ...monthly };
            case 5:
                return { frequencyId, ...shortly };
        }
        return {};
    };
    const getFrequencyId = getFrequecyPayload(frequencyType);

    switch (type) {
        case 'single':
            return {
                ...payload,
                channelType: channelTypes,
                analyticsTypes,
                campaignType: 'S',
                recurrenceInfo: {},
                roi,
            };
        case 'multi':
            return {
                ...payload,
                campaignType: 'M',
                channelType: [],
                analyticsTypes: [],
                recurrenceInfo: {},
                roi: false,
            };
        case 'event':
            return {
                ...payload,
                campaignType: 'T',
                recurrenceInfo: buildReccurenceInfo(getFrequencyId),
                timeZoneId: _get(timezone, 'timeZoneID', 0) || 0,
                isDaylightSavings: !!daylightSavings,
                channelType: channelTypes,
                analyticsTypes,
                roi: false,
            };
    }
};

export const buildReccurenceInfo = (formState) => {
    const {
        frequencyId = 4,
        days = 0,
        hours = '',
        weekDays = {},
        hours: weeklyHours = '',
        week = 0,
        second_hours = '',
        second_months = 0,
        second_days = 0,
        second_frequency = 0,
        first_hours = '',
        first_months = 0,
        first_day = 0,
        every_time = 0,
        period = 0,
        type,
    } = formState;

    function setTimeformat(time) {
        let amorpm = time?.split(' ');
        let tempTime = amorpm?.[0]?.split(':');
        return tempTime?.[0] + ':' + tempTime?.[1] + ' ' + amorpm?.[1];
    }

    function setTime() {
        if (frequencyId === 1) return setTimeformat(hours.trim());
        else if (frequencyId === 2) return setTimeformat(weeklyHours.trim());
        else if (frequencyId === 3 && type === 'Day(s)') return setTimeformat(first_hours.trim());
        else if (frequencyId === 3 && type === 'Month(s)') return setTimeformat(second_hours.trim());
        return every_time;
    }
    function setTime1() {
        if (frequencyId === 1) return setTimeformat(hours?.toLocaleTimeString().trim());
        else if (frequencyId === 2) return setTimeformat(weeklyHours?.toLocaleTimeString().trim());
        else if (frequencyId === 3 && type === 'Day(s)') return setTimeformat(first_hours?.toLocaleTimeString().trim());
        else if (frequencyId === 3 && type === 'Month(s)')
            return setTimeformat(second_hours?.toLocaleTimeString().trim());
        return every_time;
    }

    function setDay() {
        if (frequencyId === 2) return parseInt(week, 10);
        else if (frequencyId === 1) return parseInt(days, 10);
        else if (frequencyId === 3 && formState.monthly?.type === 'Day(s)') return parseInt(first_day, 10);
        else if (frequencyId === 3 && formState.monthly?.type === 'Month(s)') return _get(second_frequency, 'id');
        // else if (frequencyId === 3) return first_day;
        return 0;
    }
    function settimeSubsetId() {
        if (frequencyId === 3 && formState.type === 'Month(s)') return 5;
        else if (frequencyId === 3 && formState.type !== 'Month(s)') return 4;
        return 0;
    }
    function reccursDayMonthly() {
        if (formState?.type === 'Month(s)') {
            // console.log('second_months, ', parseInt(second_months));
            return parseInt(second_months, 10);
        } else if (formState.monthly?.type !== 'Month(s)') return parseInt(first_day, 10);
        else return 0;
    }

    return {
        recurrenceId: 0,
        campaignId: formState.campaignId || 0,
        frequencyId: frequencyId,
        reccursEvery: '',
        recurrsTime: '',
        timeSubsetId: settimeSubsetId(),
        reccursEveryDaily: frequencyId === 1 ? setDay() : 0,
        reccursEveryWeekly: frequencyId === 2 ? setDay() : 0,
        reccursEveryMonthly: frequencyId === 3 ? parseInt(first_months, 10) || 0 : 0,
        reccursOn: frequencyId === 5 ? every_time : String(_get(period, 'id', '')),
        recurrenceTimeDaily: frequencyId === 1 ? setTime() : '',
        recurrenceTimeWeekly: frequencyId === 2 ? setTime() : '',
        recurrenceTimeMonthly: frequencyId === 3 ? first_hours.trim() || '' : '',
        reccursDayMonthly: frequencyId === 3 ? reccursDayMonthly() : 0,

        reccursDayMonthlyselByWeek: _get(second_frequency, 'id') || 0,
        reccursDayMonthlyselByDay: frequencyId === 5 ? String(_get(period, 'id', '')) : _get(second_days, 'id', 0),
        reccursDayMonthlytimePicker: frequencyId === 3 ? second_hours.trim() || '' : '',
        recurrsEveryTimeId: _get(second_days, 'id', 0),
        isMonday: _get(weekDays, 'mon', false),
        isTuesday: _get(weekDays, 'tue', false),
        isWednesday: _get(weekDays, 'wed', false),
        isThrusday: _get(weekDays, 'thu', false),
        isFriday: _get(weekDays, 'fri', false),
        isSaturday: _get(weekDays, 'sat', false),
        isSunday: _get(weekDays, 'sun', false),
        isDay: false,
        isWeekDay: false,
        isWeekEnd: false,
    };

    // return {
    //     recurrenceId: 0,
    //     campaignId: formState.campaignId || 0,
    //     frequencyId: frequencyId,
    //     timeSubsetId: settimeSubsetId(), //frequencyId === 3 && formState.monthly?.type === 'Month(s)' ? 5 : 4,
    //     reccursEveryDaily: frequencyId === 1 ? setDay() : 0,
    //     reccursEveryWeekly: frequencyId === 2 ? setDay() : 0,
    //     reccursEveryMonthly: 0,
    //     reccursOn: first_months || second_months || String(_get(period, 'id', '')),
    //     recurrenceTimeDaily: frequencyId === 1 ? setTime() : '',
    //     recurrenceTimeWeekly: frequencyId === 2 ? setTime() : '',
    //     recurrenceTimeMonthly: '',
    //     reccursDayMonthly:
    //         frequencyId === 3 && formState.monthly?.type === 'Month(s)' ? parseInt(second_months) || 0 : 0,
    //     reccursDayMonthlyselByWeek: frequencyId === 3 ? setDay() : 0,
    //     reccursDayMonthlyselByDay: _get(second_days, 'id', 0),
    //     reccursDayMonthlytimePicker: frequencyId === 3 ? setTime() : '',
    //     recurrsEveryTimeId: _get(second_days, 'id', 0),
    //     isMonday: _get(weekDays, 'mon', false),
    //     isTuesday: _get(weekDays, 'tue', false),
    //     isWednesday: _get(weekDays, 'wed', false),
    //     isThrusday: _get(weekDays, 'thu', false),
    //     isFriday: _get(weekDays, 'fri', false),
    //     isSaturday: _get(weekDays, 'sat', false),
    //     isSunday: _get(weekDays, 'sun', false),
    //     isDay: false,
    //     isWeekDay: false,
    //     isWeekEnd: false,
    // };
};

export const TOOLTIP_TEXT_ANALYTICS_TYPES = (
    <Fragment>
        <ul className="rs-tooltip-text-multi">
            {/* <li>
                <b>Web: </b>
                <span>Analyze the behavior of visitors on your website.</span>
            </li>
            <li>
                <b>App: </b>
                <span>Analyze the behavior of visitors on your mobile app.</span>
            </li> */}
            {/* <li>
                <b>Social media:</b>
                <span>Link your external domains to monitor communication conversion.</span>
            </li> */}
            {/* <li>
                <b>Sentiment: </b>
                <span>Analyze the brand or communication sentiment on the web.</span>
            </li> */}
            {/* <li>
                <b>Video:</b>
                <span>Analyze the behavior of visitors on your videos.</span>
            </li> */}
            <li>
                <span>{ANALYTICS_TOOTLTIP_TEXT}</span>
            </li>
        </ul>
    </Fragment>
);

export const handleReferenceData = (referenceData, referenceList, version, docketFile) => {
    // console.log('referenceData:@@@ ', referenceData);

    let priority = {};
    let grouping = {};
    let reference = [];
    let docketFilename = docketFile;

    const covertReferenceFormatData = referenceList?.map((list) => {
        const referenceObj = referenceData?.[0] || {};
        const normalizedListKey = list?.columnValue?.replace(/\s+/g, '').toLowerCase();

        const matchedKey = Object.keys(referenceObj).find((key) =>
            key.replace(/\s+/g, '').toLowerCase()?.includes(normalizedListKey),
        );

        const matchedValue = matchedKey ? referenceObj[matchedKey] : undefined;

        return {
            ...list,
            value: matchedValue !== undefined ? matchedValue : list?.value ?? '',
        };
    });

    const finalFormatReferenceData = version === '4.8' ? covertReferenceFormatData : referenceData;

    if (finalFormatReferenceData?.length > 0) {
        docketFilename = referenceData?.find((ref) => ref.columnValue?.toLowerCase().includes('docket'))?.fileName;
        finalFormatReferenceData.forEach((ref) => {
            if (ref.columnValue === 'Priority') {
                priority = ref;
            } else if (ref.columnValue === 'Communication Grouping ID') {
                grouping = ref;
            } else {
                reference.push(ref);
            }
        });
    } else {
        referenceList?.length &&
            referenceList.forEach((ref) => {
                if (ref.columnValue === 'Priority') {
                    priority = ref;
                } else if (ref.columnValue === 'Communication Grouping ID') {
                    grouping = ref;
                } else {
                    reference.push(ref);
                }
            });
    }

    docketFilename = docketFilename ? docketFilename : docketFile;

    return {
        priority,
        grouping,
        reference,
        docketFilename,
    };
};

export const getUpdateCommunicationRefData = (refdata, file) => {
    const filterFinalReferenceData = refdata?.filter((ref) => ref?.columnValue); /// Filter value only with column Value
    const modifiedData = filterFinalReferenceData?.map((data) => {
        if (data?.columnValue === 'Communication Docket') {
            return { ...data, fileName: file };
        } else {
            return { ...data };
        }
    });
    return modifiedData;
};

export const isFullMonthDifference = (startDate, endDate, months) => {
    if (!startDate || !endDate) {
        return false;
    }
    //debugger
    const startDay = startDate.getDate();
    const endDay = endDate.getDate();
    const startMonth = startDate.getMonth();
    const endMonth = endDate.getMonth();
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();

    const diffYears = endYear - startYear;
    const diffMonths = endMonth - startMonth + diffYears * 12;
    if (diffMonths === 0) {
        return true;
    } else if (diffMonths === 1 && startDay > endDay) {
        return true;
    }
    if (diffMonths === months && startDay > endDay) {
        return true;
    } else if (diffMonths < months) {
        return true;
    }
    return false;
};

export const flattenPlanChannelAnalytics = ({ formState, savedDynamicListChannel, campaignId }) => {
    const analyticsTypes = _map(
        _filter(formState?.analyticsTypes ?? [], (list) => list?.selected),
        'id',
    ).flat();
    const isWeb = analyticsTypes?.includes(6);
    const isApp = analyticsTypes?.includes(16);
    let channelTypes = _map(
        _filter(formState?.channelTypes ?? [], (list) => list?.selected),
        'id',
    ).flat();

    const isNotificationChecked = (formState?.channelTypes ?? []).some(
        (list) => list?.selected && list?.name === 'notifications',
    );

    if (isNotificationChecked) {
        let filteredChannels = channelTypes;
        if (!isWeb) {
            filteredChannels = filteredChannels.filter((id) => id !== 8);
        }
        if (!isApp) {
            filteredChannels = filteredChannels.filter((id) => id !== 14);
        }
        channelTypes = filteredChannels?.length === 0 ? channelTypes : filteredChannels;
    }

    return { channelTypes, analyticsTypes };
};

export const buildPlanSubmitPayload = ({
    formState,
    type,
    reducerState,
    mode,
    locationState,
    departmentId,
    userId,
    clientId,
    tags,
    isSecondaryGoal,
    isCommunicationReference,
    communicationReferenceData,
    savedDynamicListChannel,
}) => {
    const { channelTypes, analyticsTypes } = flattenPlanChannelAnalytics({
        formState,
        savedDynamicListChannel,
        campaignId: _get(locationState, 'campaignId', 0),
    });

    const preparedFormState = {
        ...formState,
        channelTypes,
        analyticsTypes,
        isSecondaryGoal,
        tags,
        isCommunicationReference,
        templateId: locationState?.edmTemplateId,
        templateFlowChannelId: locationState?.templateChannelId,
        communicationReference:
            communicationReferenceData?.length === 0
                ? []
                : [
                      communicationReferenceData?.grouping,
                      communicationReferenceData?.priority,
                      ...(communicationReferenceData?.reference ?? []),
                  ],
        frequencyType: reducerState?.frequencyType,
        departmentId,
        userId,
        clientId,
        campaignId: _get(locationState, 'campaignId', 0),
    };

    return buildRequestPayload(preparedFormState, type, reducerState, mode);
};

const normalizePlanPayloadForComparison = (payload) => {
    if (!payload) return null;

    const {
        communicationReference: _communicationReference,
        recurrenceInfo,
        channelType,
        analyticsTypes,
        isUpdate: _isUpdate,
        ...scalarFields
    } = payload;

    return {
        ...scalarFields,
        channelType: [...(channelType ?? [])].sort((a, b) => Number(a) - Number(b)),
        analyticsTypes: [...(analyticsTypes ?? [])].sort((a, b) => Number(a) - Number(b)),
        recurrenceInfo: JSON.stringify(recurrenceInfo ?? {}),
    };
};

export const isPlanPayloadEqual = (current, bound) => {
    if (!current || !bound) return false;
    return (
        JSON.stringify(normalizePlanPayloadForComparison(current)) ===
        JSON.stringify(normalizePlanPayloadForComparison(bound))
    );
};

export const handleWithoutAPICallNavigation = async ({
    payload,
    props,
    locationState,
    dispatch,
    navigate,
    forceNavigateWithoutApi = false,
}) => {
    // 5-inprogress,9-completed,52-alert
    const campaignTypeWiseStatusIdCheck = {
        T: [9,52],
        S: [9,52],
        M: [9,52],
    };
    const shouldNavigateWithoutApi =
        forceNavigateWithoutApi ||
        ((payload?.campaignType === 'T' || payload?.campaignType === 'S') &&
            (campaignTypeWiseStatusIdCheck[payload?.campaignType] || [])?.includes(parseInt(props?.statusId, 10)));
    if (shouldNavigateWithoutApi) {
        if (props?.buttonType === 'save') {
            dispatch(resetCommunicationPlan());
            dispatch(resetCreateCommunication());
            navigate('/communication', {
                index: 0,
            });
        } else {
            dispatch(resetCreateCommunication());
            dispatch(resetCommunicationPlan());
            sessionStorage.setItem('reloadCount', 0);
            let url = '/communication/create-communication';
            if (payload.campaignType === 'M') url = '/communication/mdc-workflow';
            const tempSavedChannelsId = await handleCampaignStatus(
                payload,
                locationState?.campaignId || 0,
                dispatch,
                false,
            );
            const state = {
                campaignId: locationState?.campaignId || 0,
                campaignType: payload.campaignType,
                channels: props.channelType,
                startDate: payload.startDate,
                endDate: payload.endDate,
                campaignName: payload.campaignName,
                communicationType: props.communicationType.attributename,
                productType: props.productType.categoryname,
                primaryGoal: props.primaryGoal,
                secondaryGoal: props.secondaryGoal,
                analyticsTypes: props.analyticsTypes,
                roi: payload?.roi,
                offlineConversion: props?.offlineConversion,
                dynamicListId: payload?.dynamicList || 0,
                isEditable: props?.isEditable ?? true,
                primaryGoalType: payload?.primaryGoalType,
                secondaryGoalType: payload?.secondaryGoalType,
                statusId: props?.statusId,
                savedChannelsId: tempSavedChannelsId || {},
                timeZoneId: props?.timeZoneId?.timeZoneID,
                templateId: props.templateId || 0,
                isMiniDuration: props?.diffDays <= 3 ? true : false,
                eligibleChannelType: props.eligibleChannelType || {},
                campaignStatusId: props?.statusId || null
            };
            const encryptState = encodeUrl(state);
            navigate(`${url}?q=${encryptState}`, {
                state,
            });
        }
        return true;
    } else {
        return false;
    }
};

const checkAllChannelsExist = (checkListChannel, savedChannelList, channelId, parentChannelId) => {
    const filterChannelList = savedChannelList?.map((list) => list?.channelId) || [];
    const checkStatus = checkListChannel.every((id) => filterChannelList.includes(id));
    if (checkStatus) {
        // let finalSaveChannelList = savedChannelList.filter((list) => !checkListChannel.includes(list?.channelId));
        // finalSaveChannelList.push({
        //     campaignId: savedChannelList[0]?.campaignId || 0,
        //     channelId: parentChannelId[0] || channelId,
        // });
        return savedChannelList;
    } else if (!checkStatus && filterChannelList?.some((id) => parentChannelId.includes(id))) {
        savedChannelList = savedChannelList.filter((list) => !parentChannelId.includes(list?.channelId));
        return savedChannelList;
    }
    return savedChannelList;
};

export const checkAllChannelsSaved = (channelId, savedChannelList, channelConfig) => {
    switch (channelId) {
        case 2:
        case 21:
        case 41:
            const finalData = checkAllChannelsExist(channelConfig?.checkListChannel ?? [], savedChannelList, channelId, channelConfig?.parentChannelId ?? 0);
            return finalData;
        case 8:
        case 14: {
             const finalData = checkAllChannelsExist(channelConfig?.checkListChannel ?? [], savedChannelList, channelId, channelConfig?.parentChannelId ?? 0);
            return finalData;
        }
        default:
            return savedChannelList;
    }
};

export const getEligibleChannelIds = (savedChannelList, channelId, campaignId) => {

    const otherCampaignChannels =
        savedChannelList
            ?.filter(item => item.campaignId !== campaignId)
            ?.map(item => item?.channelId) || [];

    switch (channelId) {
        case 2:
        case 21:
        case 41: {
              const availableChannelIds = [2, 21, 41];
            return availableChannelIds.filter(ch => !otherCampaignChannels.includes(ch));
        }
        case 8:
        case 14: {
            const availableChannelIds = [8,14];
            return availableChannelIds.filter(ch => !otherCampaignChannels.includes(ch));
        }
        default:
            return [];
    }
};
