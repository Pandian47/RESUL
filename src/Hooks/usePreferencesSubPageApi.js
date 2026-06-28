import { useMemo } from 'react';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';

/** Preferences sub-pages use field skeletons instead of the global loader for edit/create fetches. */
export const PREFERENCES_SUBPAGE_LOADER_CONFIG = {
    create: LOADER_TYPE.FIELD,
    edit: LOADER_TYPE.FIELD,
};

/**
 * Wraps useApiLoader with preferences defaults (FIELD loader for edit/create).
 * Use `isPageLoading` with PreferencesSubPageSkeletonGate (covers idle + in-flight field fetch).
 * When `enabled` is false, `isPageLoading` is false — parent/bootstrap fetch owns the skeleton.
 */
const usePreferencesSubPageApi = ({
    enabled = true,
    autoFetch = true,
    loaderConfig,
    ...options
} = {}) => {
    const api = useApiLoader({
        ...options,
        enabled,
        autoFetch,
        loaderConfig: {
            ...PREFERENCES_SUBPAGE_LOADER_CONFIG,
            ...loaderConfig,
        },
    });

    const isPageLoading = useMemo(() => {
        if (!enabled) return false;
        if (api.isFetching || api.isLoading) return true;
        if (autoFetch) {
            return !(api.isSuccess || api.isError);
        }
        return false;
    }, [enabled, autoFetch, api.isFetching, api.isLoading, api.isSuccess, api.isError]);

    return useMemo(
        () => ({
            ...api,
            isPageLoading,
        }),
        [api, isPageLoading],
    );
};

export default usePreferencesSubPageApi;
