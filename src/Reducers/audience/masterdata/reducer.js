import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';
import { updateErrorArray } from 'Utils/modules/display';
import { parseAudienceJson } from 'Pages/AuthenticationModule/Audience/audienceDefaults';

const masterDataReducer = createSlice({
    name: 'MASTER_DATA',
    initialState,
    reducers: {
        update_master_audience_data: (state, { payload }) => {
            const safePayload = payload && typeof payload === 'object' ? payload : {};
            return {
                ...state,
                audienceOverview: safePayload?.audienceDashboardJson ?? {},
                audienceList: safePayload?.audienceGridDataJSON
                    ? parseAudienceJson(safePayload.audienceGridDataJSON, {})
                    : {},
            };
        },
        update_MDM_field: (state, { payload: { field, data } }) => {
            if (!field) return state;
            return {
                ...state,
                [field]: data,
                errors: {
                    ...state.errors,
                    [field]: null,
                },
            };
        },
        update_errors: (state, { payload: { field, error } }) => ({
            ...state,
            [field]: initialState[field] ?? (Array.isArray(state[field]) ? [] : {}),
            errors: {
                ...state.errors,
                [field]: error,
            },
        }),

        update_failures_API_MasterData: (state, { payload: { field, message } }) => {
            state.masterDataFailureApiErrors = updateErrorArray(state.masterDataFailureApiErrors, field, message);
        },

        update_MDM_loading: (state, { payload: { field, status } }) => ({
            ...state,
            [field]: status,
        }),
        reset_mdm: () => ({ ...initialState }),
    },
});

export const {
    update_master_audience_data,
    update_MDM_loading,
    update_MDM_field,
    update_errors,
    reset_mdm,
    update_failures_API_MasterData,
} = masterDataReducer.actions;
export default masterDataReducer.reducer;
