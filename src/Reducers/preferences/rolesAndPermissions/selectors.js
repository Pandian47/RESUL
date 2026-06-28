import { createSelector } from 'reselect';
export const securityUsersList = createSelector(
    (state) => state.rolesAndPermissionsReducer,
    ({ isFailure, roles, isLoading }) => ({
        roles,
        isFailure,
        isLoading,
    }),
);
