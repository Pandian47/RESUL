import { createSelector } from 'reselect';
export const getCSSMSGrid = createSelector(
    (state) => state.communicationSettingsReducer,
    (state) => state.smsData,
);

export const getCSServiceProvidersData = createSelector(
    (state) => state.communicationSettingsReducer,
    (state) => state.RCSsettingsProviders,
);

export const getCSWAGrid = createSelector(
    (state) => state.communicationSettingsReducer,
    (state) => state.whatsAppGrid,
);

export const getCSRCSGrid = createSelector(
    (state) => state.communicationSettingsReducer,
    (state) => state.rcsGrid,
);

export const getCSSubscribe = createSelector(
    (state) => state.communicationSettingsReducer,
    (state) => state.subscribeData,
);

export const getCSSubscribeEditData = createSelector(
    (state) => state.communicationSettingsReducer,
    (state) => state.subscribeUpdateData,
);

export const isCreatedValue = createSelector(
    (state) => state.communicationSettingsReducer,
    (state) => state.isCreated,
);

export const getCSUnSubscribe = createSelector(
    (state) => state.communicationSettingsReducer,
    (state) => state.unSubscribeData,
);

export const getVMSSelector = createSelector(
    (state) => state.communicationSettingsReducer,
    (state) => state.vmsData,
);
export const getLineSelector = createSelector(
    (state) => state.communicationSettingsReducer,
    (state) => state.lineData,
);

