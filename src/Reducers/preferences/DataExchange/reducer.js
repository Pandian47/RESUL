// reducer
import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';

const dataExchangeReducer = createSlice({
    name: 'DATA_EXCHANGE',
    initialState,
    reducers: {  
         
        updateIntegartedSytem: (state, { payload: { field, data } }) => ({
            ...state,
            [field]: data
        }), 
    },
});

export const { updateIntegartedSytem  } = dataExchangeReducer.actions;

export default dataExchangeReducer.reducer;
