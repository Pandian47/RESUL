import { createSelector } from 'reselect';
export const selectCreateCommunicationState = (state) => state.createCommunicationReducer ?? {};

export const smsList = createSelector(
    selectCreateCommunicationState,
    (state) => state.smsList,
);

export const emailList = createSelector(
    selectCreateCommunicationState,
    (state) => state.emailList,
);

export const getAudience = createSelector(
    selectCreateCommunicationState,
    (state) => state.audience,
);
export const getFilterAudience = createSelector(
    selectCreateCommunicationState,
    (state) => state.filterAudience,
);

export const getSmsCampaignListById = createSelector(
    selectCreateCommunicationState,
    (state) => state.smsList?.campaignDetails,
);

export const getVoiceDetails = createSelector(
    selectCreateCommunicationState,
    (state) => state.voiceList,
);

export const getVmsDetails = createSelector(
    selectCreateCommunicationState,
    (state) => state.vmsList,
);
export const getAppAnalytics = createSelector(
    selectCreateCommunicationState,
    (state) => state.analytics,
);
export const getRcsList = createSelector(
    selectCreateCommunicationState,
    (state) => state.rcsList,
);

export const getDirectMailDetails = createSelector(
    selectCreateCommunicationState,
    (state) => state.directMailList,
);