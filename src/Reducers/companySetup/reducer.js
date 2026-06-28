import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';

const companyCreation = createSlice({
    name: 'NEW_COMPANY',
    initialState,
    reducers: {
        update_new_company_data(state, { payload }) {
            return {
                ...state,
                ...payload,
            };
        },
        update_company_data(state, { payload: {field, data} }) {
            return {
                ...state,
                [field]: data,
            };
        },
        updateCompanyCountryDetails: (state, { payload }) => ({ ...state, countryLocation: payload }),
        resetNewCompanyData: () => ({ ...initialState }),
        // resetNewCompanyData: () => initialState,
    },
});

export const { update_new_company_data, resetNewCompanyData, updateCompanyCountryDetails, update_company_data } = companyCreation.actions;

export default companyCreation.reducer;
