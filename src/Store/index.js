import storage from 'redux-persist/lib/storage/session';
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import createLoginReducer from '../Reducers/loginRoot';
import { setStoreInstance } from './storeRef';

const loginPersistConfig = {
    key: 'login',
    storage,
    stateReconciler: autoMergeLevel2,
    whitelist: ['globalstate'],
};

const appPersistConfig = {
    key: 'root',
    storage,
    stateReconciler: autoMergeLevel2,
    whitelist: ['globalstate', 'communicationPlanReducer'],
};

let appReducerModulePromise = null;

function loadAppReducer() {
    if (!appReducerModulePromise) {
        appReducerModulePromise = import('../Reducers/appRoot').then((mod) => mod.default());
    }
    return appReducerModulePromise;
}

export default async function createReduxStore() {
    const loginReducer = createLoginReducer();
    const persistedLoginReducer = persistReducer(loginPersistConfig, loginReducer);

    const store = configureStore({
        reducer: persistedLoginReducer,
        devTools: process.env.NODE_ENV !== 'production',
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: {
                    ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
                    ignoredActionPaths: ['register', 'rehydrate', 'payload.register', 'payload.rehydrate'],
                    ignoredPaths: [
                        'globalstate.retryMethod',
                        'globalstate.isShowCAPortal.callbackFunc',
                    ],
                },
            }),
    });

    const persistor = persistStore(store);
    setStoreInstance(store, persistor);

    let fullReducerMounted = false;

    const setFullReducer = async () => {
        if (fullReducerMounted || !store) return;
        const appReducer = await loadAppReducer();
        if (!appReducer) return;
        store.replaceReducer(persistReducer(appPersistConfig, appReducer));
        fullReducerMounted = true;
        store.__fullReducerMounted = true;
        persistor.persist();
        window.dispatchEvent(new CustomEvent('resul:full-reducer-mounted'));
    };

    store.__setFullReducer = setFullReducer;

    return { store, persistor, setFullReducer };
}
