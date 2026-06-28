// reducer
import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';

const benchmarkOverview = createSlice({
    name: 'BENCHMARK_AND_GOLS',
    initialState,
    reducers: {
        updateBenchmarkOverview: (state, { payload: { field, data } }) => ({
            ...state,
            [field]: data,
        }),
        resetBenchmartGoal: () => ({ ...initialState }),
    },
});

export const { updateBenchmarkOverview, resetBenchmartGoal } = benchmarkOverview.actions;

export default benchmarkOverview.reducer;
