/**
 * Email Form Composite Selectors
 * Optimized selectors for SplitABTab and related email form components
 * 
 * This reduces multiple useSelector calls from 7+ down to 1-2, significantly
 * reducing re-renders and subscriptions to store changes.
 */

import { createSelector } from 'reselect';

/**
 * All session/user data needed for email forms
 * Combines department, client, user IDs and other auth data
 */
export const getEmailFormSessionSelector = createSelector(
  (state) => state.globalstate,
  (globalstate) => ({
    departmentId: globalstate?.departmentId ?? 0,
    clientId: globalstate?.clientId ?? 0,
    userId: globalstate?.userId ?? 0,
    parentClientId: globalstate?.parentClientId ?? 0,
    departmentName: globalstate?.departmentName ?? '',
    clientList: globalstate?.clientList ?? [],
  })
);

/**
 * Campaign and email-specific data
 * Selects campaign details, email footer, unsubscription settings
 */
export const getEmailFormDataSelector = createSelector(
  (state) => state.createCommunicationReducer,
  (communication) => ({
    personalization: communication?.personalization ?? [],
    listTypeWisePersonlization: communication?.listTypeWisePersonlization ?? [],
    campaignDetails: communication?.campaignDetails ?? {},
  })
);

/**
 * Email list data (footer, subscription settings)
 * Selects from email list reducer
 */
export const getEmailListDataSelector = createSelector(
  (state) => {
    // Assuming emailList state is part of createCommunicationReducer or separate
    return state.createCommunicationReducer?.emailData || {};
  },
  (emailData) => ({
    unSubscriptionList: emailData?.unSubscriptionList ?? [],
    emailFooter: emailData?.emailFooter ?? [],
  })
);

/**
 * COMBINED: All data needed for SplitABTab component
 * Instead of 7 useSelector calls, use just 1
 * 
 * Usage in component:
 * const emailFormState = useSelector(getCompleteSplitABTabDataSelector);
 * const {
 *   personalization,
 *   listTypeWisePersonlization,
 *   campaignDetails,
 *   approvalList,
 *   unSubscriptionList,
 *   emailFooter,
 *   sessionData: { departmentId, clientId, userId },
 *   clientList,
 * } = emailFormState;
 */
export const getCompleteSplitABTabDataSelector = createSelector(
  [(state) => state.createCommunicationReducer,
  (state) => state.globalstate],
  (communication, globalstate) => {
    
    return {
      // Form/Content Data
      personalization: communication?.personalization ?? [],
      listTypeWisePersonlization: communication?.listTypeWisePersonlization ?? [],
      campaignDetails: communication?.campaignDetails ?? {},

      // Approval & Permissions
      approvalList: globalstate?.approvalList ?? [],

      // Email-specific Data
      unSubscriptionList: communication?.emailList?.unSubscriptionList ?? [],
      emailFooter: communication?.emailList?.emailFooter ?? [],

      // Session/User Data
      sessionData: {
        departmentId: globalstate?.departmentId ?? 0,
        clientId: globalstate?.clientId ?? 0,
        userId: globalstate?.userId ?? 0,
        parentClientId: globalstate?.parentClientId ?? 0,
        departmentName: globalstate?.departmentName ?? '',
      },

      // Reference/Lookup Data
      clientList: globalstate?.clientList ?? [],
    }
  }
);

/**
 * Approval-specific data selector
 * Useful for components that only need approval list
 */
export const getEmailFormApprovalSelector = createSelector(
  (state) => state.globalstate,
  (globalstate) => ({
    approvalList: globalstate?.approvalList ?? [],
  })
);

/**
 * Minimal session selector for performance-critical components
 * Contains only essential IDs needed
 */
export const getEmailFormSessionMinimalSelector = createSelector(
  (state) => state.globalstate,
  (globalstate) => ({
    departmentId: globalstate?.departmentId ?? 0,
    clientId: globalstate?.clientId ?? 0,
    userId: globalstate?.userId ?? 0,
  })
);

export default {
  getEmailFormSessionSelector,
  getEmailFormDataSelector,
  getEmailListDataSelector,
  getCompleteSplitABTabDataSelector,
  getEmailFormApprovalSelector,
  getEmailFormSessionMinimalSelector,
};
