import { getStoreInstance } from './storeRef';

let mountPromise = null;

export function isFullReducerMounted() {
    return !!getStoreInstance()?.__fullReducerMounted;
}

/** Inject full app reducers after login or when restoring an existing session. */
export async function mountFullAppReducer() {
    const store = getStoreInstance();
    if (!store?.__setFullReducer) return;
    if (store.__fullReducerMounted) return;

    if (!mountPromise) {
        mountPromise = store.__setFullReducer().finally(() => {
            mountPromise = null;
        });
    }
    await mountPromise;
}
