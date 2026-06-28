import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';

const companiesReducer = createSlice({
    name: 'COMPANIES',
    initialState,
    reducers: {
        updateCompaniesList: (state, { payload }) => ({
            ...state,
            companies: payload,
            isFailure: false,
        }),
        updateLoadingCompany: (state, { payload }) => ({
            ...state,
            isLoading: payload,
            isFailure: payload ? false : state.isFailure,
        }),
        updateFailureCompany: (state, { payload }) => ({
            ...state,
            isFailure: payload,
        }),
        updateClientDetails: (state, { payload }) => ({
            ...state,
            clientDetails: payload,
        }),
        updateLocalizationDetails: (state, { payload }) => ({
            ...state,
            localizationSettings: payload
        }),
        updateshareBus: (state, { payload }) => ({
            ...state,
            shareBus: payload
        }),
        updateCompanyAddSupportDatas: (state, { payload }) => ({
            ...state,
            companyAddSupportDatas: payload
        }),
        updateIsCompany: (state, { payload }) => ({
            ...state,
            isCompany: payload
        }),
        resetCompaniesReducer: () => ({ ...initialState }),
    },
});

export const {
    updateCompaniesList,
    updateLoadingCompany,
    updateClientDetails,
    updateFailureCompany,
    resetCompaniesReducer,
    updateLocalizationDetails,
    updateshareBus,
    updateCompanyAddSupportDatas,
    updateIsCompany
} = companiesReducer.actions;

export default companiesReducer.reducer;
