import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';

const dynamicListReducer = createSlice({
    name: 'CREATE_DYNAMIC_LIST',
    initialState,
    reducers: {
        update_dynamicList_data: (state, { payload }) => {
            return {
                ...state,
                ...payload,
            };
        },
        get_trigger_source_data: (state, { payload }) => {
            return {
                ...state,
                triggerSourceData: payload,
            };
        },
        get_trigger_attributes_data: (state, { payload }) => {
            const { sessionKey, field, cacheKey = '', data } = payload ?? {};
            return {
                ...state,
                triggerAttributes: {
                    ...state.triggerAttributes,
                    [sessionKey]: {
                        ...(state.triggerAttributes?.[sessionKey] || {}),
                        [field]: {
                            ...(state.triggerAttributes?.[sessionKey]?.[field] || {}),
                            [cacheKey]: data,
                        },
                    },
                },
            };
        },
        get_trigger_base_ddl_data: (state, { payload }) => {
            const { sessionKey, field, data } = payload ?? {};
            return {
                ...state,
                triggerBaseDDL: {
                    ...state.triggerBaseDDL,
                    [sessionKey]: {
                        ...(state.triggerBaseDDL?.[sessionKey] || {}),
                        [field]: data,
                    },
                },
            };
        },
        get_trigger_attribute_values_data: (state, { payload }) => {
            const { sessionKey, attributeName, cacheKey, data } = payload ?? {};
            return {
                ...state,
                attributeValues: {
                    ...state.attributeValues,
                    [sessionKey]: {
                        ...(state.attributeValues?.[sessionKey] || {}),
                        [attributeName]: {
                            ...(state.attributeValues?.[sessionKey]?.[attributeName] || {}),
                            [cacheKey]: data,
                        },
                    },
                },
            };
        },
        get_dynamic_list: (state, { payload: { field, data } }) => {
            return {
                ...state,
                [field]: data,
            };
        },
        set_list_loading: (state, { payload }) => {
            return {
                ...state,
                listLoading: payload,
            };
        },
        set_list_failure: (state, { payload }) => {
            return {
                ...state,
                listFailure: payload,
            };
        },
        resetDynamicListState: () => ({ ...initialState }),
        // resetDynamicListState: () => initialState,
        // get_dynamic_list: (state, { payload: { field, data } }) => ({
        //     ...state,
        //     [field]: data,
        // }),
    },
});
export const {
    update_dynamicList_data,
    get_trigger_source_data,
    get_trigger_attributes_data,
    get_trigger_base_ddl_data,
    get_trigger_attribute_values_data,
    get_dynamic_list,
    resetDynamicListState,
    set_list_loading,
    set_list_failure,
} = dynamicListReducer.actions;

export default dynamicListReducer.reducer;
