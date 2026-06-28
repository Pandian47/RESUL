const initialState = {
    // Overview
    bindAudience: [],
    chartAttr: '',
    audienceOverview: {},

    // List Activity
    listAcquisitionChart: {},
    recipientAcquisition: [],
    listAcquisitionApiData: null,
    isListAcquisitionApiSuccess: false,

    // Audience List
    audienceList: [],
    audienceListAttrs: [],
    audienceGrid: {},

    // Errors
    errors: {},

    //failure api error 
    masterDataFailureApiErrors: [],

    // Local data
    localData: {},

    // loadings
    audienceOverviewLoading: false,
    bindAudienceLoading: false,
    listAcquisitionChartLoading: false,
    audienceGridLoading: false
};

export default initialState;