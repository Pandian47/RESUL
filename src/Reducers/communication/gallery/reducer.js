// reducer
import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';

const galleryReducer = createSlice({
    name: 'COMMUNICATION_GALLERY',
    initialState,
    reducers: {
        updateGallery: (state, { payload: { field, data } }) => ({
            ...state,
            [field]: data,
        }),
        resetGallery: () => ({ ...initialState }),
        setLoading: (state, { payload }) => ({ ...state, isLoading: payload }),
        setFailure: (state, { payload }) => ({ ...state, isFailure: payload }),
    },
});

export const { updateGallery, resetGallery, setLoading, setFailure } = galleryReducer.actions;

export default galleryReducer.reducer;
