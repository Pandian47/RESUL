/**
 * Header Component Composite Selectors
 * Optimized selectors for RSHeader and related header components
 * 
 * Reduces multiple useSelector calls from 5+ down to 1-2, improving
 * header performance and reducing unnecessary re-renders
 */

import { createSelector } from 'reselect';

/**
 * All data needed for RSHeader component
 * Combines auth, user, and UI state
 * 
 * Usage:
 * const headerState = useSelector(getHeaderDataSelector);
 * const { isAuth, profilePicture, userId, clientId, departmentId, ...} = headerState;
 */
export const getHeaderDataSelector = createSelector(
  [(state) => state.globalstate],
  (globalstate) => ({
    // Auth & Profile
    isAuth: globalstate?.isAuth ?? false,
    profilePicture: globalstate?.profilePicture ?? '',
    validUserEmailId: globalstate?.validUserEmailId ?? '',
    
    // Session IDs
    userId: globalstate?.userId ?? 0,
    clientId: globalstate?.clientId ?? 0,
    departmentId: globalstate?.departmentId ?? 0,
    departmentName: globalstate?.departmentName ?? '',
    parentClientId: globalstate?.parentClientId ?? 0,
    
    // License & Account
    updatedLicenseId: globalstate?.updatedLicenseId ?? 0,
    currentTabConfig: globalstate?.currentTabConfig ?? {},
    renewalData: globalstate?.renewalData ?? {},
    
    // Account Admin
    accountAdmin: globalstate?.accountAdmin ?? {},

    // UI State
    showSessionModal: globalstate?.showSessionModal ?? false,
  })
);

/**
 * Session/User data only selector
 * For components that only need user identification
 */
export const getHeaderSessionSelector = createSelector(
  [(state) => state.globalstate],
  (globalstate) => ({
    userId: globalstate?.userId ?? 0,
    clientId: globalstate?.clientId ?? 0,
    departmentId: globalstate?.departmentId ?? 0,
    departmentName: globalstate?.departmentName ?? '',
  })
);

/**
 * Auth & profile data selector
 * For auth-critical components
 */
export const getHeaderAuthSelector = createSelector(
  [(state) => state.globalstate],
  (globalstate) => ({
    isAuth: globalstate?.isAuth ?? false,
    profilePicture: globalstate?.profilePicture ?? '',
    accountAdmin: globalstate?.accountAdmin ?? {},
  })
);

/**
 * License & renewal data selector
 * For license/account management components
 */
export const getHeaderLicenseSelector = createSelector(
  [(state) => state.globalstate],
  (globalstate) => ({
    updatedLicenseId: globalstate?.updatedLicenseId ?? 0,
    currentTabConfig: globalstate?.currentTabConfig ?? {},
    renewalData: globalstate?.renewalData ?? {},
  })
);

/**
 * Notifications data selector
 * For notification badge and list
 */
export const getNotificationsDataSelector = createSelector(
  [(state) => state.globalstate],
  (globalstate) => ({
    userId: globalstate?.userId ?? 0,
    clientId: globalstate?.clientId ?? 0,
    departmentId: globalstate?.departmentId ?? 0,
    renewalData: globalstate?.renewalData ?? {},
  })
);

/**
 * Preview data selector
 * For mobile preview and similar components
 */
export const getPreviewDataSelector = createSelector(
  [(state) => state.globalstate],
  (globalstate) => ({
    clientId: globalstate?.clientId ?? 0,
  })
);

export default {
  getHeaderDataSelector,
  getHeaderSessionSelector,
  getHeaderAuthSelector,
  getHeaderLicenseSelector,
  getNotificationsDataSelector,
  getPreviewDataSelector,
};
