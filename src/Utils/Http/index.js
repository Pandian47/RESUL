import HTTPInterceptor from './HttpInterceptor';
import { baseURL, BASELIVEDASHBOARDURL } from '../../Constants/EndPoints';
import {
    decrement_global_loading,
    increment_global_loading,
    update_failures_API_Errors,
    updateSessionModal,
} from '../../Reducers/globalState/reducer';
import { getSessionId } from '../../Reducers/globalState/selector';
import { toast } from 'react-toastify';
import { getEndpointFriendlyName } from './constant';
import { getStoreInstance } from '../../Store/storeRef';
import { getToastCloseButton } from 'Utils';

/** True when axios/fetch aborted the request (AbortController / cancel token). */
export function isRequestAborted(error) {
    if (!error) return false;

    const code = String(error?.code || '').toUpperCase();
    const name = String(error?.name || '');

    if (code === 'ERR_CANCELED' || name === 'CanceledError' || name === 'AbortError') {
        return true;
    }

    const message = String(error?.message || '').toLowerCase();
    return message === 'canceled' || message.includes('aborted');
}

/** Pick the first AbortSignal from payload/meta objects (useApiLoader passes via meta.signal). */
export function pickRequestSignal(...sources) {
    for (let i = 0; i < sources.length; i += 1) {
        const signal = sources[i]?.signal;
        if (signal) return signal;
    }
    return undefined;
}

/** Merge an AbortSignal into axios config without mutating the original. */
export function withHttpSignal(config = {}, source = {}) {
    const signal = pickRequestSignal(source, config);
    if (!signal) return config;
    return { ...config, signal };
}

/**
 * Resolve AbortSignal from request options and strip it from POST body when nested in payload.
 * Priority: top-level signal → config.signal → payload.signal
 */
export function resolveRequestSignal({ signal, config = {}, payload } = {}) {
    let resolvedSignal = pickRequestSignal({ signal }, config, payload);
    let apiPayload = payload;

    if (
        payload != null &&
        typeof payload === 'object' &&
        !Array.isArray(payload) &&
        Object.prototype.hasOwnProperty.call(payload, 'signal')
    ) {
        const { signal: payloadSignal, ...rest } = payload;
        if (!resolvedSignal) resolvedSignal = payloadSignal;
        apiPayload = rest;
    }

    return {
        signal: resolvedSignal,
        payload: apiPayload,
        config: withHttpSignal(config, { signal: resolvedSignal }),
    };
}

export default class HTTPRequestHandler {
    static _request = new HTTPInterceptor(baseURL).getRequest();
    static _requestLive = new HTTPInterceptor(BASELIVEDASHBOARDURL).getRequest();

    static _isNetworkError(err) {
        // Axios network errors typically have no `response` and include message/code hints.
        if (!err) return false;
        if (err?.response) return false;

        const msg = String(err?.message || '').toLowerCase();
        const code = String(err?.code || '').toUpperCase();

        return (
            msg.includes('network') ||
            msg.includes('failed to fetch') ||
            msg.includes('timeout') ||
            code === 'ERR_NETWORK' ||
            code === 'ECONNABORTED' ||
            code === 'ETIMEDOUT'
        );
    }

    static _toastRequestFailed(err) {
        // const message = HTTPRequestHandler._isNetworkError(err)
        //     ? 'Check your internet connection and try again.'
        //     : 'Refresh the page and try again. If the issue continues, contact your admin.';

        // toast.error(message, {
        //     toastId: 'request-failed',
        //     closeOnClick: true,
        //     closeButton: getToastCloseButton,
        //     autoClose: 5000,
        //     pauseOnHover: true,
        //     hideProgressBar: false,
        // });
    }

    /** Refresh header unread / alert count when the user leaves a page (route or query change, or layout unmount). */
    static dispatchUnreadCountRefreshOnPageLeave(dispatch) {
        const store = getStoreInstance();
        const { globalstate } = store?.getState() ?? {};
        if (!globalstate?.isAuth) return;

        const { departmentId, clientId, userId } = getSessionId(store?.getState());

        import('../../Reducers/notifications/request').then(({ updateNotificationCountStatus }) => {
            dispatch(
                updateNotificationCountStatus({
                    payload: { departmentId, clientId, userId },
                }),
            );
        });
    }

    static get =
        ({
            url,
            signal,
            config = {},
            loading = false,
            ok = () => {},
            fail = () => {},
            isToast = false,
        }) =>
        async (dispatch) => {
            if (!url) {
                console.warn('HTTP request prevented: url is empty or undefined');
                return;
            }
            const { config: axiosConfig } = resolveRequestSignal({ signal, config });
            const configration = {
                ...axiosConfig,
                headers: {
                    reqs: `${localStorage.getItem('accessToken')}` || null,
                    'X-Forwarded-For':  `${localStorage.getItem('uuiD')}` || null,
                    Authorization: `Bearer ${localStorage.getItem('jwtToken') || null}` || null,
                    ...(axiosConfig.headers || {}),
                },
            };
            try {
                if (loading) dispatch(increment_global_loading());
                const request = await HTTPRequestHandler._request.get(url, configration);
                if (request.status >= 200 && request.status < 300) {
                    await Promise.resolve(ok(request));
                    return await request?.data;
                } else {
                    throw new Error('Unable to fetch');
                }
            } catch (err) {
                if (isRequestAborted(err)) throw err;

                const { status, response, message } = err;

                // Call custom event for API failure (skip if localhost and 401 status)
                if (window.ReWebSDK && window.ReWebSDK.customEvent && !window.location.hostname.includes('localhost') && status !== 401) {
                    window.ReWebSDK.customEvent({
                        eventName: url,
                        data: {
                            statusCode: status,
                            requestURL: `${baseURL}${url}`,
                            payload: null, // GET requests don't have payload
                            response: response?.data || message
                        }
                    });
                }
                
                if (response?.status === 401) {
                    dispatch(updateSessionModal(true));
                    return false;
                }
                fail(err);
                HTTPRequestHandler._toastRequestFailed(err);

                if (loading) dispatch(decrement_global_loading());
                return (await response?.data) || message;
            } finally {
                if (loading) dispatch(decrement_global_loading());
            }
        };

    // static post = (url, payload, config = {}) => HTTPRequestHandler._request.post(url, payload, config);

    static post =
        ({
            url,
            signal,
            baseURLConnect=false,
            config = {},
            payload = {},
            loading = false,
            ok = () => {},
            fail = () => {},
            retry = 0,
            final = () => {},
            isToast = false,
            isFailureCheck = false,
            suppressErrorToast = false,
            isCustomHeadConfig = false,
            customHeadConfig = {},
        }) =>
        async (dispatch) => {
            if (!url) {
                console.warn('HTTP request prevented: url is empty or undefined');
                return;
            }
            const {
                signal: abortSignal,
                payload: requestPayload,
                config: axiosConfig,
            } = resolveRequestSignal({ signal, config, payload });
            const hasAuthToken = !!localStorage.getItem('accessToken');
            if (hasAuthToken) {
            const sessionModalInLocalStorage = localStorage.getItem('sessionModal');
                let sessionModalFromStorage = false;
                try {
                    sessionModalFromStorage = sessionModalInLocalStorage
                        ? JSON.parse(sessionModalInLocalStorage)
                        : false;
                } catch {
                    sessionModalFromStorage = sessionModalInLocalStorage === 'true';
                }
                if (sessionModalFromStorage) return;
            }
            const configration = {
                ...axiosConfig,
                headers: {
                    reqs: `${localStorage.getItem('accessToken')}` || null,
                    'X-Forwarded-For': `${localStorage.getItem('uuiD')}` || null,
                Authorization: `Bearer ${localStorage.getItem('jwtToken') || null}` || null,
                    ...(isCustomHeadConfig ? customHeadConfig : {}),
                    ...(axiosConfig.headers || {}),
                },
            };
            let wasAborted = false;
            try {
                if (loading) dispatch(increment_global_loading());
                let request;
                if(baseURLConnect){
                    request = await HTTPRequestHandler._requestLive.post(url, requestPayload, configration);
                }
              
                else{
                request = await HTTPRequestHandler._request.post(url, requestPayload, configration);
                }               
                if (request.status >= 200 && request.status < 300) {
                    //  dispatch(updateSessionModal(true));
                    if (!request?.data?.status) {
                        if(isFailureCheck) {
                            // Call custom event for API failure (business logic failure) - skip if localhost
                            if (window.ReWebSDK && window.ReWebSDK.customEvent && !window.location.hostname.includes('localhost')) {
                                const requestURL = baseURLConnect ? `${BASELIVEDASHBOARDURL}${url}` : `${baseURL}${url}`;
                                window.ReWebSDK.customEvent({
                                    eventName: url,
                                    data: {
                                        statusCode: request.status,
                                        requestURL: requestURL,
                                        payload: requestPayload,
                                        response: request?.data
                                    }
                                });
                            }
                        }

                        if (isFailureCheck && !request?.data?.status) {
                            dispatch(
                                update_failures_API_Errors({
                                    field: getEndpointFriendlyName(url),
                                    message: request?.data?.message || 'No data available',
                                }),
                            );
                            HTTPRequestHandler._toastRequestFailed();
                            return await request?.data;
                        }
                        if (isToast) {
                            HTTPRequestHandler._toastRequestFailed();
                        }
                    }

                    // toast.error(`${request?.data?.message ?? 'Something went wrong'} `);
                    await Promise.resolve(ok(request));
                    return await request?.data;
                } else {
                    const { data } = request;
                    
                    // Call custom event for API failure (non-2xx status codes except 401) - skip if localhost and 401 status
                    if (window.ReWebSDK && window.ReWebSDK.customEvent && !window.location.hostname.includes('localhost') && request.status !== 401) {
                        const requestURL = baseURLConnect ? `${BASELIVEDASHBOARDURL}${url}` : `${baseURL}${url}`;
                        window.ReWebSDK.customEvent({
                            eventName: url,
                            data: {
                                statusCode: request.status,
                                requestURL: requestURL,
                                payload: requestPayload,
                                response: data
                            }
                        });
                    }

                    if (isFailureCheck && !data?.status) {
                        dispatch(
                            update_failures_API_Errors({
                                field: getEndpointFriendlyName(url),
                                message: data?.message || 'No data available',
                            }),
                        );
                        HTTPRequestHandler._toastRequestFailed();
                        return;
                    }
                    throw new Error();
                }
            } catch (err) {
                if (isRequestAborted(err)) {
                    wasAborted = true;
                    throw err;
                }

                const { status, response, message } = err;

                // Call custom event for API failure - skip if localhost and 401 status
                if (window.ReWebSDK && window.ReWebSDK.customEvent && !window.location.hostname.includes('localhost') && status !== 401) {
                    const requestURL = baseURLConnect ? `${BASELIVEDASHBOARDURL}${url}` : `${baseURL}${url}`;
                    window.ReWebSDK.customEvent({
                        eventName: url,
                        data: {
                            statusCode: status,
                            requestURL: requestURL,
                            payload: requestPayload,
                            response: response?.data || message
                        }
                    });
                }
                
                if (response?.status === 401) {
                    dispatch(updateSessionModal(true));
                    localStorage.setItem('sessionModal', true);
                    return false;
                }
                fail(err);
                if (!suppressErrorToast) {
                    HTTPRequestHandler._toastRequestFailed(err);
                }
                // if (isFailureCheck && !response?.data?.status || response?.status === 500 ) {
                if (isFailureCheck && !response?.data?.status ) {
                    dispatch(
                        update_failures_API_Errors({
                            field: getEndpointFriendlyName(url),
                            message: response?.data?.message || 'No data available',
                        }),
                    );
                    return (await response?.data) || message;;
                }
                //  toast.error(`${response?.data?.message ?? 'Something went wrong'}`);
                return (await response?.data) || message;
            } finally {
                if (loading) dispatch(decrement_global_loading());
                if (!wasAborted) final();
            }
        };

    static put = (url, payload, config = {}) => {
        if (!url) {
            console.warn('HTTP request prevented: url is empty or undefined');
            return Promise.resolve();
        }
        const configration = {
            ...config,
            headers: {
                reqs: `${localStorage.getItem('accessToken')}` || null,
                'X-Forwarded-For': `${localStorage.getItem('uuiD')}` || null,
              Authorization: `Bearer ${localStorage.getItem('jwtToken') || null}` || null,
                ...(config.headers || {}),
            },
        };
        return HTTPRequestHandler._request.put(url, payload, configration);
    };

    static delete = (url, payload, config = {}) => {
        if (!url) {
            console.warn('HTTP request prevented: url is empty or undefined');
            return Promise.resolve();
        }
        const configration = {
            ...config,
            headers: {
                reqs: `${localStorage.getItem('accessToken')}` || null,
                'X-Forwarded-For': `${localStorage.getItem('uuiD')}` || null,
                Authorization: `Bearer ${localStorage.getItem('jwtToken') || null}` || null,
                ...(config.headers || {}),
            },
        };
        return HTTPRequestHandler._request.delete(url, payload, configration);
    };
}

