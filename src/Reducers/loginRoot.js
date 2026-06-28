/**
 * Minimal Redux root for login / unauthenticated boot.
 * Loaded synchronously — avoids pulling 40+ feature reducers on `/`.
 */
import storage from 'redux-persist/lib/storage';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import { persistReducer } from 'redux-persist';
import { combineReducers } from 'redux';

import globalstate from './globalState/reducer';
import loginReducer from './login/existingUser/reducer';
import newUserReducer from './login/newUser/reducer';
import companyCreation from './companySetup/reducer';
import notificationsReducer from './Notifications/reducer';

const globalStatePersistorConfig = {
    key: 'global',
    storage,
    stateReconciler: autoMergeLevel2,
    blacklist: ['loading', 'approvalList'],
};

export default function createLoginReducer() {
    return combineReducers({
        globalstate: persistReducer(globalStatePersistorConfig, globalstate),
        loginReducer,
        newUserReducer,
        companyCreation,
        notificationsReducer,
    });
}
