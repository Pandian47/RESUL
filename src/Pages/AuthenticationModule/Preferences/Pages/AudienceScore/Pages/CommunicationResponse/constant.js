const BRAND_SENTIMENT = [
    {
        id: 1,
        name: 'positive',
        lable: 'Positive',
    },
    {
        id: 2,
        name: 'neutral',
        lable: 'Neutral',
    },
    {
        id: 3,
        name: 'negative',
        lable: 'Negative',
    },
];
const FREQUENCY_TIME = ['week', 'month', 'quarter', 'half year'];
const CAMPAIN_DATA = ['A', 'B', 'C', 'D', 'E'];

export const CAMPAIN_DATAs = [
    { title: 'Age', value: '145' },
    { title: 'EmailID', value: '143' },
    { title: 'Gender', value: '147' },
    { title: 'Channel', value: '141' },
    { title: 'City', value: '154' },
    { title: 'Name', value: '184' },
    { title: 'Segment', value: '984' },
    { title: 'MobileNo', value: '144' },
    { title: 'Dfg', value: '3634' },
    { title: 'Country', value: '156' },
    { title: 'Regular Data temp', value: '3576' },
];

const INITIAL_STATE = {
    // defaultValues: {
    //     reach: [
    //         { reachData: 'A', reachValue: '10' },
    //         { reachData: 'B', reachValue: '15' },
    //         { reachData: 'C', reachValue: '20' },
    //     ],
    //     engagement: [
    //         { engagementData: 'A', engagementValue: '10' },
    //         { engagementData: 'B', engagementValue: '15' },
    //         { engagementData: 'C', engagementValue: '20' },
    //     ],
    //     conversion: [
    //         { conversionData: 'A', conversionValue: '10' },
    //         { conversionData: 'B', conversionValue: '15' },
    //         { conversionData: 'C', conversionValue: '20' },
    //     ],
    //     campaignDetails: [
    //         { campaignDetailsData: 'A', campaignDetailsValue: '10' },
    //         { campaignDetailsData: 'B', campaignDetailsValue: '15' },
    //         { campaignDetailsData: 'C', campaignDetailsValue: '20' },
    //     ],
    //     goal: [{ less: '10', more: '15', score: '20' }], // check
    //     goalMoreThan: '30',
    //     goalOnce: '10',
    //     brandSentiment: {
    //         positive: '20',
    //         neutral: '25',
    //         negative: '-24',
    //     },
    //     goalbetweenData: {
    //         lessValue: '5',
    //         moreValue: '50',
    //         lessScore: '150',
    //         moreScore: '30',
    //     },
    // },
    mode: 'onBlur',
};
export { BRAND_SENTIMENT, FREQUENCY_TIME, INITIAL_STATE, CAMPAIN_DATA };

export const commuResponseChannelData = (allData, channelData) => {
    const customData = allData.map((item) => {
        if (item?.campaignSegment === 'Conversion') {
            return { ...item, campaignSegment: 'Leads' };
        }
        return item;
    });

    const filteredChannel = customData.filter((item) =>
        channelData.some((ele) => item?.campaignSegment === ele?.campaignTarget),
    );

    const campaignSegmentRuleData = filteredChannel[0]?.campaignSegmentRule;

    if (!campaignSegmentRuleData) {
        return [];
    }
    const filtercGId = channelData.filter((item) =>
        Object.keys(campaignSegmentRuleData).includes(item?.cGId.toString()),
    );

    // console.log(filtercGId, "filtercGId");

    const finalData = filtercGId.map((item) => ({
        title: item?.Text,
        value: campaignSegmentRuleData[item?.cGId] || 0,
        id: item?.cGId
    }));

    return finalData;
};

export const getCommuAttribute = (data) => {
    const customData = data?.map((item) => {
        return {
            title: item?.attributename,
            value: '',
            id: item?.campaignAttributeId
        };
    });
    return customData;
};

export const customDropdownData = (data) => {
    const customData = data?.map((item) => {
        return {
            title: item?.Text,
            value: '',
            id: item?.cGId
        };
    });
    return customData;
};

const getCustomPayload = (data, channel) => {
    // console.log(data, channel, allChannel, "nbnb");
    const campaignSegmentRule = channel?.reduce((acc, item) => {
        const matchingData = data?.find((ele) => ele?.title === item?.Text);
        if (matchingData) {
            acc[item?.cGId] = Number(matchingData?.value);
        }
        return acc;
    }, {});
    return campaignSegmentRule;
};

export const goalFrequencypayload = (goal, less, more) => {
    const result = { Once: less, 'More than,5': more };
    goal.forEach((obj) => {
        const key = `${obj.less},${obj.more}`;
        result[key] = parseInt(obj.score,10);
    });
    return result;
};

export const getCommnicationDetail = (data, attribute) => {
    const commuDetail = attribute?.reduce((acc, item) => {
        const matchingData = data?.find((ele) => ele?.title === item?.attributename);
        if (matchingData) {
            acc[item?.campaignAttributeId] = Number(matchingData?.value);
        }
        return acc;
    }, {});
    return commuDetail;
};

export const buildPayload = (
    departmentId,
    clientId,
    userId,
    formState,
    allChannel,
    reach,
    engagement,
    conversion,
    commuAttribute,
) => {
    // console.log(departmentId, clientId, userId, formState, allChannel, reach, engagement, conversion);

    const reachPayload = getCustomPayload(formState?.reachValues, reach, allChannel);
    const engagementPayload = getCustomPayload(formState?.engagementValues, engagement, allChannel);
    const conversionPayload = getCustomPayload(formState?.conversionValues, conversion, allChannel);
    const goalPayload = goalFrequencypayload(
        formState?.goal,
        Number(formState?.goalbetweenData?.lessScore),
        Number(formState?.goalbetweenData?.moreScore),
    );
    const communicationDetailPayload = getCommnicationDetail(formState?.CampaingDetailsValues, commuAttribute);

    return {
        departmentId: departmentId,
        clientId: clientId,
        userId: userId,
        campaignresponse: [
            {
                campaignResponseId: 1,
                campaignSegment: 'Reach',
                campaignSegmentRule: reachPayload,
                responseScore: formState?.reachValues['Total'],
                campaignGoalPeriodRange: '',
            },
            {
                campaignResponseId: 2,
                campaignSegment: 'Engagement',
                campaignSegmentRule: engagementPayload,
                responseScore: Number(formState?.engagementValues['Total']),
                campaignGoalPeriodRange: '',
            },
            {
                campaignResponseId: 3,
                campaignSegment: 'Conversion',
                campaignSegmentRule: conversionPayload,
                responseScore: Number(formState?.conversionValues['Total']),
                campaignGoalPeriodRange: '',
            },
            {
                campaignResponseId: 4,
                campaignSegment: 'CampaingDetails',
                campaignSegmentRule: communicationDetailPayload,
                responseScore: Number(formState?.CampaingDetailsValues['Total']),
                campaignGoalPeriodRange: '',
            },
            {
                campaignResponseId: 5,
                campaignSegment: 'Goalfrequency',
                campaignSegmentRule: goalPayload,
                responseScore: Number(formState?.goalTotal),
                campaignGoalPeriodRange: formState?.goalpriority,
            },
            {
                campaignResponseId: 6,
                campaignSegment: 'Brandsentiment',
                campaignSegmentRule: {
                    Positive: Number(formState?.brandSentiment[0]?.value),
                    Negative: Number(formState?.brandSentiment[1]?.value),
                    Neutral: Number(formState?.brandSentiment[2]?.value),
                },
                responseScore: Number(formState?.brandSentiment['Total']),
                campaignGoalPeriodRange: '',
            },
            {
                campaignResponseId: 7,
                campaignSegment: 'Lead Score Depreciation',
                campaignSegmentRule: {
                    Percentage: Number(formState?.depreciation),
                },
                responseScore: 0,
                campaignGoalPeriodRange: formState?.priority,
            },
        ],
    };
};
