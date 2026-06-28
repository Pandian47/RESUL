import { createSlice } from '@reduxjs/toolkit';
import _map from 'lodash/map';
import initialState from './initialState';
import { updateErrorArray } from 'Utils/modules/display';

const globalstate = createSlice({
    name: 'GLOBAL_STATE',
    initialState,
    reducers: {
        increment_global_loading(state) {
            state.loading = ++state.loading;
        },
        decrement_global_loading(state) {
            state.loading = state.loading === 0 ? 0 : --state.loading;
        },
        reset_global_loading(state) {
            state.loading = 0;
        },
        updateAuth(state, { payload }) {
            state.isAuth = payload;
        },
        update_Dashboard: (state, { payload }) => ({ ...state, isDashboardData: payload }),
        update_isMobileAppId: (state, { payload }) => ({ ...state, isMobileAppId: payload }),
        update_isWebAppId: (state, { payload }) => ({ ...state, isWebAppId: payload }),
        update_isMobileAppData: (state, { payload }) => ({ ...state, isMobileAppData: payload }),
        update_isWebAppData: (state, { payload }) => ({ ...state, isWebAppData: payload }),
        update_isMobileAppListReady: (state, { payload }) => ({ ...state, isMobileAppListReady: payload }),
        update_isWebDomainListReady: (state, { payload }) => ({ ...state, isWebDomainListReady: payload }),
        update_consumptionChannel: (state, { payload }) => ({ ...state, consumptionChannel: payload }),
        update_filteredChannels: (state, { payload }) => ({ ...state, filteredChannels: payload }),
        update_consumptionYear: (state, { payload }) => ({ ...state, consumptionYY: payload }),
        update_consumptionMonth: (state, { payload }) => ({ ...state, consumptionMM: payload }),
        latest_consumptionYear: (state, { payload }) => ({ ...state, u_consumptionYY: payload }),
        latest_consumptionMonth: (state, { payload }) => ({ ...state, u_consumptionMM: payload }),
        updateSessionModal: (state, { payload }) => ({ ...state, showSessionModal: payload }),
        updateRetry: (state, { payload }) => ({ ...state, retryTime: state.retryTime++, retryMethod: payload }),
        resetRetry: (state) => ({ ...state, retryTime: 0, retryMethod: null }),
        updateApprovalList: (state, { payload }) => {
            const approvalList = _map(payload, (list) => ({ ...list, name: `${list.firstName} (${list.email})` }));
            return { ...state, approvalList };
        },
        resetGlobalState: () => ({ ...initialState }),
        updateBuAndDepId: (state, { payload }) => {
            return {
            ...state,
            clientId: payload?.clientId || state.clientId,
            departmentId: payload?.departmentId || state.departmentId,
            parentClientId: payload?.parentClientId || state.parentClientId,
            isCurrentBURFAStatus: payload?.rfaStatus ?? false,
        }
        },
        updateAccountAdmin: (state, { payload }) => ({
            ...state,
            accountAdmin: payload,
        }),
        updateClientList: (state, { payload }) => ({
            ...state,
            clientList: payload,
        }),
        updateBUList: (state, { payload }) => ({
            ...state,
            departmentList: payload,
        }),
        updateBUByClientCompany: (state, { payload }) => ({
            ...state,
            company_clientId: payload?.company_clientId || state.company_clientId,
            company_departmentId: payload?.company_departmentId || state.company_departmentId,
            company_departmentList: payload?.company_departmentList || state.company_departmentList,
        }),
        updateBUByClient: (state, { payload }) => ({
            ...state,
            clientId: payload?.clientId !== undefined ? payload.clientId : state.clientId,
            departmentId: payload?.departmentId !== undefined ? payload.departmentId : state.departmentId,
            departmentList: payload?.departmentList !== undefined ? payload.departmentList : state.departmentList,
        }),
        getKeyUserInfo: (state, { payload: { field, data } }) => ({
            ...state,
            [field]: data,
        }),
         updateRenewalData: (state, { payload }) => ({
            ...state,
            renewalData: payload,
        }),
        
        reset_updateRenewalData: (state) => ({
            ...state,
            renewalData: {},
        }),
         getGlobalStateValue: (state, { payload: { field, data } }) => ({            
            ...state,
            [field]: data,
        }),
        updateCompanyList: (state, { payload }) => ({
            ...state,
            companyList: payload,
        }),
        updateProfilePicture: (state, { payload }) => ({ ...state, profilePicture: payload }),
        updateClientBranch: (state, { payload }) => ({ ...state, clientBranch: payload }),
        updateisClient: (state, { payload }) => ({ ...state, isClient: payload }),
        updateisClientID: (state, { payload }) => ({ ...state, isClientID: payload }),
        updateisCompanyClientID: (state, { payload }) => ({ ...state, company_clientId: payload }),
        updateisCompanyDepartID: (state, { payload }) => ({ ...state, company_departmentId: payload?.departmentId || state.departmentId }),
        updateisPassport: (state, { payload }) => ({ ...state, isPassport: payload }),
        updatedisLicenseId: (state, { payload }) => ({ ...state, updatedLicenseId: payload }),
        updateIndustryId: (state, { payload }) => ({ ...state, industryId: payload }),
        update_failures_API_Errors: (state, { payload: { field, message } }) => {
            state.failureApiErrors = updateErrorArray(state.failureApiErrors, field, message);
        },
        updateCurrentPageConfig: (state, { payload }) => ({
            ...state,
            currentPageConfig: payload,
        }),
        updateCurrTabConfig: (state, { payload: { field, data } }) => {
            return {
                ...state,
                currentTabConfig: {
                    ...state.currentTabConfig,
                    [field]: data,
                },
            };
        },
        reset_failures_API_Errors: (state) => ({
            ...state,
            failureApiErrors: [],
        }),
        update_user_email_id : (state ,{ payload }) =>({
            ...state,
            validUserEmailId :payload,
        }),
         updateCAPortalModal: (state, { payload }) => ({
            ...state,
            isShowCAPortal: {
                show: payload?.show,
                callbackFunc: payload?.callbackFunc,
            },
        }),
        updateUtcTimeData: (state, { payload }) => ({
            ...state,
            utcTimeData: {
                utcTime: payload?.utcTime || state.utcTimeData.utcTime,
                userAgent: payload?.userAgent || state.utcTimeData.userAgent,
            },
        }),
        setDepartmentChangePending: (state, { payload }) => ({
            ...state,
            departmentChangePending: Boolean(payload),
        }),
    },
});

export const {
    decrement_global_loading,
    increment_global_loading,
    reset_global_loading,
    update_consumptionYear,
    update_consumptionChannel,
    update_consumptionMonth,
    resetGlobalState,
    updateAuth,
    updateSessionModal,
    updateRetry,
    resetRetry,
    updateBuAndDepId,
    updateApprovalList,
    updateAccountAdmin,
    updateClientList,
    updateBUList,
    updateBUByClient,
    updateBUByClientCompany,
    updateisCompanyClientID,
    updateisCompanyDepartID,
    updateProfilePicture,
    getKeyUserInfo,
    updateClientBranch,
    updateisClient,
    updateisClientID,
    update_Dashboard,
    update_isMobileAppId,
    update_isWebAppId,
    update_isMobileAppData,
    update_isWebAppData,
    update_isMobileAppListReady,
    update_isWebDomainListReady,
    latest_consumptionYear,
    latest_consumptionMonth,
    updateisPassport,
    updatedisLicenseId,
    update_failures_API_Errors,
    reset_failures_API_Errors,
    updateIndustryId,
    update_filteredChannels,
    updateCurrentPageConfig,
    updateCurrTabConfig,
    update_user_email_id,
    updateCompanyList,
    getGlobalStateValue,
    updateRenewalData,
    updateCAPortalModal,
    updateUtcTimeData,
    reset_updateRenewalData,
    setDepartmentChangePending,
} = globalstate.actions;

export default globalstate.reducer;
