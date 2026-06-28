import { createSelector } from 'reselect';
export const getUsersList = createSelector(
    (state) => state.userReducer.users,
    (state) => state,
);

export const getUserRoles = createSelector(
    (state) => state.userReducer.userRoles,
    (state) => state,
);

export const getUsersCount = createSelector(
    (state) => state.userReducer.usersCount,
    (state) => state,
);

export const getActiveUsersCount = createSelector(
    (state) => state.userReducer.users,
    (users) => Array.isArray(users) ? users.filter((u) => u.statusId === 1).length : 0,
);
