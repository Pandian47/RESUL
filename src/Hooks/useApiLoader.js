import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
    decrement_global_loading,
    increment_global_loading,
} from 'Reducers/globalState/reducer';
import { isRequestAborted } from 'Utils/Http';
import { LOADER_TYPE, DEFAULT_LOADER_CONFIG } from './loaderTypes';

export { isRequestAborted, pickRequestSignal, withHttpSignal, resolveRequestSignal } from 'Utils/Http';

export { LOADER_TYPE, DEFAULT_LOADER_CONFIG, FIELD_BOTH_LOADER_CONFIG, FIELD_LOADER_CONFIG, NONE_LOADER_CONFIG } from './loaderTypes';

export const API_STATUS = Object.freeze({
    IDLE: 'idle',
    LOADING: 'loading',
    SUCCESS: 'success',
    ERROR: 'error',
    ABORTED: 'aborted',
});

const EMPTY_OBJECT = Object.freeze({});

const buildActionCreatorArgs = (extraPayload, baseParams, signal) => {
    const merged = { ...extraPayload, ...baseParams };
    if (!signal) {
        return merged;
    }
    if (Object.prototype.hasOwnProperty.call(merged, 'payload')) {
        const { payload, ...rest } = merged;
        const payloadWithSignal =
            payload != null && typeof payload === 'object' && !Array.isArray(payload)
                ? { ...payload, signal }
                : payload;

        return { ...rest, payload: payloadWithSignal };
    }
    return { ...merged, signal };
};

const resolveLoaderType = (mode, loaderConfig) => {
    const cfg = { ...DEFAULT_LOADER_CONFIG, ...(loaderConfig || {}) };
    return cfg[mode] || LOADER_TYPE.FIELD;
};

const REFETCH_CONFIG_KEYS = ['fetcher', 'mode', 'loaderConfig', 'params', 'onSuccess', 'onError', 'onSettled'];

const normalizeRefetchOptions = (args) => {
    const isConfigObject =
        args &&
        typeof args === 'object' &&
        REFETCH_CONFIG_KEYS.some((key) => Object.prototype.hasOwnProperty.call(args, key));

    if (isConfigObject) {
        return {
            fetcher: args.fetcher,
            mode: args.mode,
            loaderConfig: args.loaderConfig,
            params: args.params,
            onSuccess: args.onSuccess,
            onError: args.onError,
            onSettled: args.onSettled,
        };
    }

    return { params: args };
};

/**
 * Wraps a Redux request thunk so useApiLoader can pass meta.signal automatically.
 *
 * @example
 * useApiLoader({
 *   actionCreator: getCountryCoordinates,
 *   abortable: true,
 * });
 */
export const createAbortAwareFetcher = (dispatch, actionCreator, extraPayload = {}) => {
    if (typeof dispatch !== 'function' || typeof actionCreator !== 'function') {
        return async () => undefined;
    }

    return (params, meta = {}) => {
        const baseParams =
            params != null && typeof params === 'object' && !Array.isArray(params) ? params : { params };

        const dispatched = dispatch(
            actionCreator(buildActionCreatorArgs(extraPayload, baseParams, meta?.signal)),
        );

        return Promise.resolve(dispatched).catch((err) => {
            if (isRequestAborted(err)) return undefined;
            throw err;
        });
    };
};

/**
 * @param {object} [options]
 * @param {Function} [options.fetcher] - Custom async (params, meta) => response
 * @param {Function} [options.actionCreator] - Redux thunk; builds fetcher when fetcher is omitted
 * @param {object} [options.extraPayload] - Merged into every actionCreator dispatch
 * @param {boolean} [options.abortable=true] - Abort in-flight requests on unmount / supersede
 */
const useApiLoader = ({
    fetcher: fetcherOption,
    actionCreator,
    extraPayload,
    abortable = true,
    mode = 'create',
    loaderConfig: loaderConfigOption,
    enabled = true,
    deps = [],
    autoFetch = false,
    onSuccess,
    onError,
    onSettled,
    initialData = null,
} = {}) => {
    const dispatch = useDispatch();
    const stableExtraPayload = extraPayload ?? EMPTY_OBJECT;

    const actionFetcher = useMemo(
        () => (actionCreator ? createAbortAwareFetcher(dispatch, actionCreator, stableExtraPayload) : undefined),
        [dispatch, actionCreator, stableExtraPayload],
    );

    const loaderConfig = loaderConfigOption;
    const resolvedFetcher = fetcherOption ?? actionFetcher;

    const [data, setData] = useState(initialData);
    const [status, setStatus] = useState(API_STATUS.IDLE);
    const [error, setError] = useState(null);

    const requestIdRef = useRef(0);
    const activeGlobalLoaderRef = useRef(0);
    const abortControllerRef = useRef(null);
    const apiRef = useRef(null);

    const fetcherRef = useRef(resolvedFetcher);
    const onSuccessRef = useRef(onSuccess);
    const onErrorRef = useRef(onError);
    const onSettledRef = useRef(onSettled);
    const abortableRef = useRef(abortable);

    useEffect(() => {
        fetcherRef.current = resolvedFetcher;
        onSuccessRef.current = onSuccess;
        onErrorRef.current = onError;
        onSettledRef.current = onSettled;
        abortableRef.current = abortable;
    }, [resolvedFetcher, onSuccess, onError, onSettled, abortable]);

    const abortActiveRequest = useCallback((reason) => {
        const controller = abortControllerRef.current;
        if (!controller) return;
        abortControllerRef.current = null;
        controller.abort(reason);
    }, []);

    useEffect(() => {
        return () => {
            if (abortableRef.current) {
                abortActiveRequest('component-unmount');
            }
            if (activeGlobalLoaderRef.current > 0) {
                for (let i = 0; i < activeGlobalLoaderRef.current; i += 1) {
                    dispatch(decrement_global_loading());
                }
                activeGlobalLoaderRef.current = 0;
            }
        };
    }, [abortActiveRequest, dispatch]);

    const defaultLoaderType = useMemo(
        () => resolveLoaderType(mode, loaderConfig),
        [mode, loaderConfig?.create, loaderConfig?.edit, loaderConfig?.none],
    );
    const [activeLoaderType, setActiveLoaderType] = useState(defaultLoaderType);
    const defaultLoaderTypeRef = useRef(defaultLoaderType);

    useEffect(() => {
        defaultLoaderTypeRef.current = defaultLoaderType;
        setActiveLoaderType(defaultLoaderType);
    }, [defaultLoaderType]);

    const abort = useCallback(
        (reason = 'manual-abort') => {
            if (!abortableRef.current) return;
            abortActiveRequest(reason);
            requestIdRef.current += 1;
            setActiveLoaderType(defaultLoaderTypeRef.current);
            setStatus(API_STATUS.ABORTED);
            setError(null);
        },
        [abortActiveRequest],
    );

    const refetch = useCallback(
        async (args) => {
            const options = normalizeRefetchOptions(args);
            const currentMode = options.mode || mode;
            const currentLoaderConfig = options.loaderConfig || loaderConfig;
            const currentLoaderType = resolveLoaderType(currentMode, currentLoaderConfig);
            const fn = options.fetcher || fetcherRef.current;
            if (typeof fn !== 'function') return undefined;

            const shouldAbort = abortableRef.current;
            if (shouldAbort) {
                abortActiveRequest('superseded-request');
            }

            const abortController = shouldAbort ? new AbortController() : null;
            if (shouldAbort) {
                abortControllerRef.current = abortController;
            }

            const useGlobal = currentLoaderType === LOADER_TYPE.GLOBAL;
            const requestId = requestIdRef.current + 1;
            requestIdRef.current = requestId;
            setActiveLoaderType(currentLoaderType);
            setStatus(API_STATUS.LOADING);
            setError(null);

            if (useGlobal) {
                dispatch(increment_global_loading());
                activeGlobalLoaderRef.current += 1;
            }

            let settledData;
            let settledError;
            let isAborted = false;

            try {
                const response = await fn(options.params, {
                    loaderType: currentLoaderType,
                    mode: currentMode,
                    signal: abortController?.signal,
                    requestId,
                });
                settledData = response;

                if (requestId !== requestIdRef.current) return response;

                setData(response);
                setActiveLoaderType(defaultLoaderTypeRef.current);
                setStatus(API_STATUS.SUCCESS);
                (options.onSuccess || onSuccessRef.current)?.(response, options.params);
                return response;
            } catch (err) {
                settledError = err;
                isAborted = isRequestAborted(err);

                if (requestId !== requestIdRef.current || isAborted) {
                    if (requestId === requestIdRef.current && isAborted) {
                        setActiveLoaderType(defaultLoaderTypeRef.current);
                        setStatus(API_STATUS.ABORTED);
                        setError(null);
                    }
                    return undefined;
                }

                setError(err);
                setActiveLoaderType(defaultLoaderTypeRef.current);
                setStatus(API_STATUS.ERROR);
                (options.onError || onErrorRef.current)?.(err, options.params);
                return undefined;
            } finally {
                if (abortController && abortControllerRef.current === abortController) {
                    abortControllerRef.current = null;
                }

                if (useGlobal && activeGlobalLoaderRef.current > 0) {
                    dispatch(decrement_global_loading());
                    activeGlobalLoaderRef.current -= 1;
                }

                const isStale = requestId !== requestIdRef.current;
                (options.onSettled || onSettledRef.current)?.({
                    data: isStale || isAborted ? undefined : settledData,
                    error: isStale || isAborted ? undefined : settledError,
                    params: options.params,
                    isStale,
                    isAborted,
                    requestId,
                });
            }
        },
        [abortActiveRequest, dispatch, loaderConfig, mode],
    );

    const reset = useCallback(() => {
        if (abortableRef.current) {
            abortActiveRequest('reset');
        }
        requestIdRef.current += 1;
        setData(initialData);
        setActiveLoaderType(defaultLoaderTypeRef.current);
        setStatus(API_STATUS.IDLE);
        setError(null);
    }, [abortActiveRequest, initialData]);

    useEffect(() => {
        if (!autoFetch || !enabled) return;
        refetch();
    }, [autoFetch, enabled, ...deps]);

    const isFetching = status === API_STATUS.LOADING;

    if (!apiRef.current) {
        apiRef.current = {};
    }

    Object.assign(apiRef.current, {
        data,
        status,
        isLoading: isFetching && activeLoaderType === LOADER_TYPE.FIELD,
        isFetching,
        isError: status === API_STATUS.ERROR,
        isSuccess: status === API_STATUS.SUCCESS,
        isIdle: status === API_STATUS.IDLE,
        isAborted: status === API_STATUS.ABORTED,
        error,
        loaderType: activeLoaderType,
        refetch,
        reset,
        abort,
    });

    return apiRef.current;
};

/** Cancel in-flight requests for one or more useApiLoader instances. */
export const resetAbortableRequests = (...requests) => {
    requests.forEach((request) => request?.reset?.());
};

export default useApiLoader;
