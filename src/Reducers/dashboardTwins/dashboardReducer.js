import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';

const dashboardReducer = createSlice({
    name: 'DASHBOARD_TWINS',
    initialState,
    reducers: {
        setChartDetails: (state, { payload: { field, data, chartField } }) => {
            // console.log('ConsoleCP. :::: ', field, data);
            return {
                ...state,

                [chartField]: {
                    ...state[chartField],
                    [field]: data,
                },
            };
        },
        get_dashboard_data: (state, { payload: { field, data } }) => {
            return {
                ...state,
                [field]: data,
            };
        },
        update_loading: (state, { payload: { field, data } }) => {
            return {
                ...state,
                [field]: {
                    ...state[field],
                    isLoading: data,
                },
            };
        },
        resetdashboardState: () => ({ ...initialState }),
        update_failure: (state, { payload: { field, data } }) => {
            return {
                ...state,
                [field]: {
                    ...state[field],
                    isFailure: data,
                },
            };
        },
    },
});

export const { setChartDetails, resetdashboardState, get_dashboard_data, update_failure, update_loading } =
    dashboardReducer.actions;

export default dashboardReducer.reducer;
