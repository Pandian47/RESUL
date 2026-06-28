const initialState = {
    loading: false,
    // groupedCampaigns: [],
    recentCampaigns: {
        groupedCampaigns: [],
        isLoading: false,
        isFailure: false,
    },
    roiData: {
        data: {},
        isLoading: false,
        isFailure: false,
    },
    channelPerformance: {
        data: {},
        isLoading: false,
        isFailure: false,
    },
    audienceBehaviour: {
        data: {},
        isLoading: false,
        isFailure: false,
    },
    topPerformances: {
        data: {},
        isLoading: false,
        isFailure: false,
    },
    topEarnings: {
        data: [],
        isLoading: false,
        isFailure: false,
    },
    avgTimeData: {
        data: [],
        isLoading: false,
        isFailure: false,
    },
    leadsData: {
        data: [],
        isLoading: false,
        isFailure: false,
    },
    segmentindustry: {
        data: {},
        isLoading: false,
        isFailure: false,
    },
    customersPropensity: {},
    allPerformanceCampaigns: {},
    allEarningCampaigns: {},
    allChannelPerformance: {},
    allRecentCampaigns: {},
};

export default initialState;
