// reducer
import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';
 
const emailBuilderReducer = createSlice({
    name: 'FORM_GENERATOR',
    initialState,
    reducers: {
        emailBuilder: (state, { payload: { field, data } }) => ({
            ...state,
            [field]: data,
        }),
        clearEmailBuilder: (state) => {
            return {};
        },
        setTemplateCategories: (state, action) => {
            state.templateCategories = action.payload;
        },
        addSavedVersion: (state, action) => {
            // If we already have 20 items, remove the first (oldest) one
            if (state.savedVersions.length >= 20) {
                state.savedVersions.shift(); // Remove the first item
            }
            state.savedVersions.push(action.payload);
        },
        setSavedVersions: (state, action) => {
            state.savedVersions = action.payload;
        },
        clearSavedVersions: (state) => {
            state.savedVersions = [];
        },
        resetEmailBuilderReducer: (state) => {
            return initialState;
        }
    },
});
 
export const { emailBuilder, clearEmailBuilder, setTemplateCategories, addSavedVersion, setSavedVersions, clearSavedVersions, resetEmailBuilderReducer } = emailBuilderReducer.actions;
 
export default emailBuilderReducer.reducer;
