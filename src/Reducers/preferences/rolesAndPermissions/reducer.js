import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';

const rolesAndPermissionsReducer = createSlice({
    name: 'ROLESANDPERMISSION',
    initialState,
    reducers: {
        updateSecurityList: (state, { payload }) => ({ ...state, securityList: payload }),
        updateRoles: (state, { payload }) => ({ ...state, roles: payload, isFailure: false }),
        updateRolesLoadingState: (state, { payload }) => ({
            ...state,
            isLoading: payload,
            isFailure: payload ? false : state.isFailure,
        }),
        updateRolesFailureState: (state, { payload }) => ({ ...state, isFailure: payload }),
        resetRolePermission: () => ({ ...initialState }),
    },
});

export const {
    resetRolePermission,
    updateSecurityList,
    updateRoles,
    updateRolesLoadingState,
    updateRolesFailureState,
} = rolesAndPermissionsReducer.actions;

export default rolesAndPermissionsReducer.reducer;
