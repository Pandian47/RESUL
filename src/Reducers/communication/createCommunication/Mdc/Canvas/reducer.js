import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';

const mdcCanvasFlowReducer = createSlice({
    name: 'MDC_CANVAS',
    initialState,
    reducers: {
        updateRecipientList: (state, { payload }) => ({ ...state, recipientList: [...payload,...state.recipientList] }),
        updateDynamicList: (state, { payload }) => ({ ...state, dynamicList: payload }),
        updateSelectedRecipientList: (state, { payload }) => ({ ...state, selectedRecipientList: payload }),
        updateMdcCanvasTemplateList: (state, { payload }) => ({ ...state, canvasTemplateList: payload }),
        setMdcContentPopupStatus: (state, { payload }) => ({ ...state, isContentPopupActive: payload }),
        setMdcFlowConfig: (state, { payload }) => ({ ...state, mdcFlowConfig: payload }),
        updateMiniMapPos: (state, { payload }) => ({ ...state, MiniMapPos: payload }),
        updateSubsegmentCompleted:(state, { payload }) => ({ ...state, isSubSegmentContentCompleted: payload }),
        resetMDC: () => ({ ...initialState }),
    },
});
export const {
    updateRecipientList,
    updateDynamicList,
    updateSelectedRecipientList,
    updateMdcCanvasTemplateList,
    setMdcContentPopupStatus,
    setMdcFlowConfig,
    resetMDC,
    updateMiniMapPos,
    updateSubsegmentCompleted,
} = mdcCanvasFlowReducer.actions;
export default mdcCanvasFlowReducer.reducer;
