// reducer
import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';

const auditLogReducer = createSlice({
    name: 'AUDIT_LOG_DATA',
    initialState,
    reducers: {
        getAuditLogLoading: (state, { payload }) => ({ ...state, isLoading: payload, isFailure: false }),
        getAuditLogFailure: (state, { payload }) => ({ ...state, isFailure: payload }),
        // resetAuditLogState: () => initialState,
        resetAuditLogState: () => ({ ...initialState }),
    },
});

export const { getAuditLogLoading, getAuditLogFailure, resetAuditLogState } = auditLogReducer.actions;

export default auditLogReducer.reducer;
