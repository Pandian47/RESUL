import { EMPTY_ANALYTICS_SUMMARY_DATA } from 'Pages/AuthenticationModule/Analytics/analyticsDefaults';
const initialState = {
    data: { ...EMPTY_ANALYTICS_SUMMARY_DATA },
    totalCommunication: 0,
    isLoading: true,
    isGridLoading: false,
    isFailure: false,
    analyticsDetatils: {}
};

export default initialState;
