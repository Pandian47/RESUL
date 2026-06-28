import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';

const geofenceReducer = createSlice({
    name: 'GEOFENCE',
    initialState,
    reducers: {
        updateGeofence: (state, { payload: { field, payload } }) => ({
            ...state,
            [field]: payload,
        }),
        resetGeofence: () => ({ ...initialState }),
    },
});

export const { updateGeofence, resetGeofence } = geofenceReducer.actions;
export default geofenceReducer.reducer;


