/** Shared store reference for post-login reducer injection (avoids circular imports). */
let storeInstance = null;
let persistorInstance = null;

export function setStoreInstance(store, persistor) {
    storeInstance = store;
    if (persistor) {
        persistorInstance = persistor;
    }
}

export function getStoreInstance() {
    return storeInstance;
}

export function getPersistorInstance() {
    return persistorInstance;
}
