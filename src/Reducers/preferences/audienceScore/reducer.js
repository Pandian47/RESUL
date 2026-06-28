import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';

const audienceScoreReducer = createSlice({
    name: 'AUDIENCE_SCORE',
    initialState,
    reducers: {
        setAudienceScoreTab: (state, action) => {
            state.activeTab = action.payload;
        }, setAudienceScoreClientType: (state, action) => {
            state.clientType = action.payload;
        },
        setFlag: (state, action) => {
            const { name, value } = action.payload;
            state.audienceCardCollapse[name + 'Collapse'] = value;
        },
    },
});

export const { setAudienceScoreTab, setFlag,setAudienceScoreClientType } = audienceScoreReducer.actions;

export default audienceScoreReducer.reducer;
