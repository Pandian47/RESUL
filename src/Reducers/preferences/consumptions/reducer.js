import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';

const consumptionReducer = createSlice({
    name: 'CONSUMPTION',
    initialState,
    reducers: {
        consumptionData: (state, { payload }) => {
            return {
                ...state,
                data: payload,
                isFailure: false,
            };
        },

        setConsumptionChannelLoading: (state, { payload }) => {
            return {
                ...state,
                loading: {
                    ...state.loading,
                    consumption_channel_detail: payload,
                },
            };
        },

        restConsumptionData: () => ({ ...initialState }),
    },
});

export const { restConsumptionData, consumptionData, setConsumptionChannelLoading } = consumptionReducer.actions;

export default consumptionReducer.reducer;
