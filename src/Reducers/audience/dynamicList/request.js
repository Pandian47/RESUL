import { CREATE_DYNAMIC_LIST, DUPLICATE_DYNAMIC_LIST, DYNAMIC_LIST_DOWNLOAD,GET_COMMUNICATION_BYCHANNEL, DYNAMIC_LIST_DOWNLOAD_FILE, DYNAMIC_LIST_GET_CUSTOM_EVENTS_VALUE, DYNAMIC_LIST_GET_TRIGGER_ATTRIBUTES, DYNAMIC_LIST_GET_TRIGGER_ATTRIBUTES_VALUES, DYNAMIC_LIST_GET_TRIGGER_BASE_DDL, DYNAMIC_LIST_GET_TRIGGER_SOURCE, DYNAMIC_LIST_MORE_INFO, DYNAMIC_LIST_SEARCH_COUNT, DYNAMIC_LIST_SEARCH_NAME, DYNAMIC_TIME_ZONE_DETAILS, GET_DYNAMIC_LISTS, GET_DYNAMIC_LISTS_BY_ID, GET_DYNAMIC_LIST_SCHEDULE, GET_FULL_JSON_ATTRIBUTE_VALUES, GET_GEOFENCES_LISTS, IS_LIST_NAME_EXIST, RFA_DYNAMIC_LIST_APPROVE, RFA_DYNAMIC_LIST_REJECT, STOP_DYNAMIC_LIST_SCHEDULE } from 'Constants/EndPoints';
import request from 'Utils/Http';

import {
    get_dynamic_list,
    get_trigger_attribute_values_data,
    get_trigger_attributes_data,
    get_trigger_base_ddl_data,
    get_trigger_source_data,
    set_list_loading,
    set_list_failure,
} from './reducer';

const TWO_DIMENSIONAL_TRIGGER_SOURCE_IDS = new Set([13, 27, 18, 5]);
const TRIGGER_ATTR_IN_FLIGHT_TTL_MS = 1500;

export const buildDynamicListSessionKey = (payload = {}) =>
    `${payload?.clientId ?? ''}_${payload?.departmentId ?? ''}`;

export const isTwoDimensionalPayload = (payload = {}) =>
    payload?.fieldType === '2D' && TWO_DIMENSIONAL_TRIGGER_SOURCE_IDS.has(payload?.triggerSourceId);

const buildTriggerAttrKey = (payload = {}) =>
    JSON.stringify({
        attributeName: payload?.attributeName ?? '',
        triggerSourceId: payload?.triggerSourceId ?? '',
        fieldType: payload?.fieldType ?? '',
        levelNo: payload?.levelNo ?? '',
        formId: payload?.formId ?? '',
        columnName: payload?.columnName ?? '',
        dataAttributeId: payload?.dataAttributeId ?? '',
        triggerddlValue: payload?.triggerddlValue ?? '',
        departmentId: payload?.departmentId ?? '',
    });

export const buildAttributeCachePath = (payload = {}) => {
    const attributeName = payload?.attributeName ?? '';
    const triggerddlValue = payload?.triggerddlValue ?? '';

    if (isTwoDimensionalPayload(payload)) {
        if (payload?.levelNo === 1) {
            return { attributeName, cacheKey: `${triggerddlValue}::L1` };
        }
        return {
            attributeName,
            cacheKey: `${triggerddlValue}::L2::${payload?.formId ?? ''}::${payload?.columnName ?? ''}`,
        };
    }

    return { attributeName, cacheKey: String(triggerddlValue) };
};

/** Empty arrays are persisted on failure but must not block refetch. */
export const hasUsableTriggerListCache = (data) => Array.isArray(data) && data.length > 0;

export const getCachedTriggerAttributeValues = (state, payload) => {
    const sessionKey = buildDynamicListSessionKey(payload);
    const { attributeName, cacheKey } = buildAttributeCachePath(payload);
    const cached = state?.dynamicListReducer?.attributeValues?.[sessionKey]?.[attributeName]?.[cacheKey];
    return hasUsableTriggerListCache(cached) ? cached : undefined;
};

const writeTriggerAttributeCache = (dispatch, payload, data) => {
    const sessionKey = buildDynamicListSessionKey(payload);
    const { attributeName, cacheKey } = buildAttributeCachePath(payload);
    dispatch(get_trigger_attribute_values_data({ sessionKey, attributeName, cacheKey, data }));
};

const applyTriggerAttrData = (data, payload, setTriggerValues) => {
    if (data === undefined) return;
    if (data?.status) {
        if (isTwoDimensionalPayload(payload)) {
            if (payload?.levelNo === 1) {
                setTriggerValues((prev) => ({ ...prev, [payload?.attributeName]: data?.data }));
            } else {
                setTriggerValues((prev) => ({ ...prev, [payload?.attributeName + 2]: data?.data }));
            }
        } else {
            setTriggerValues(data?.data);
        }
    } else if (isTwoDimensionalPayload(payload)) {
        setTriggerValues((prev) => ({ ...prev, [payload?.attributeName + 2]: [] }));
    } else {
        setTriggerValues([]);
    }
};

export const getTriggerSource =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: DYNAMIC_LIST_GET_TRIGGER_SOURCE,
                payload,
                loading,
                ok: ({ data }) => {
                    if (data.status) dispatch(get_trigger_source_data(data?.data));
                    else dispatch(get_trigger_source_data([]))
                },
                fail: () => {
                    dispatch(get_trigger_source_data([]));
                    return { status: false, data: [] };
                },
            }),
        );

const TRIGGER_ATTRIBUTES_IN_FLIGHT_TTL_MS = 1500;
const triggerAttributesInFlight = new Map();
const triggerAttributesCache = new Map();

const buildTriggerAttributesKey = (payload = {}) =>
    JSON.stringify({
        triggerSourceId: payload?.triggerSourceId ?? '',
        triggerddlValue: payload?.triggerddlValue ?? '',
        clientId: payload?.clientId ?? '',
        departmentId: payload?.departmentId ?? '',
        userId: payload?.userId ?? '',
    });

export const buildTriggerAttributesCacheKey = (payload = {}) => String(payload?.triggerddlValue ?? '');

export const getCachedTriggerAttributes = (state, payload) => {
    const sessionKey = buildDynamicListSessionKey(payload);
    const triggerSourceId = payload?.triggerSourceId;
    const cacheKey = buildTriggerAttributesCacheKey(payload);
    const sessionEntry = state?.dynamicListReducer?.triggerAttributes?.[sessionKey];
    const entry = sessionEntry?.[triggerSourceId] ?? state?.dynamicListReducer?.triggerAttributes?.[triggerSourceId];
    if (Array.isArray(entry)) {
        return hasUsableTriggerListCache(entry) ? entry : undefined;
    }
    const cached = entry?.[cacheKey];
    return hasUsableTriggerListCache(cached) ? cached : undefined;
};

const writeTriggerAttributesCache = (dispatch, payload, data) => {
    dispatch(
        get_trigger_attributes_data({
            sessionKey: buildDynamicListSessionKey(payload),
            field: payload.triggerSourceId,
            cacheKey: buildTriggerAttributesCacheKey(payload),
            data,
        }),
    );
};

const fetchTriggerAttributesFromApi = (dispatch, payload, loading) =>
    new Promise((resolve) => {
            dispatch(
                request.post({
                    url: DYNAMIC_LIST_GET_TRIGGER_ATTRIBUTES,
                    payload,
                    loading,
                    ok: ({ data }) => {
                        const responseData = data?.data ?? [];
                        if (data.status) {
                            writeTriggerAttributesCache(dispatch, payload, [...responseData]);
                        } else {
                            writeTriggerAttributesCache(dispatch, payload, []);
                        }
                        resolve({ status: data.status, data: responseData });
                    },
                    fail: () => {
                        writeTriggerAttributesCache(dispatch, payload, []);
                        resolve({ status: false, data: [] });
                    },
                }),
        );
    });

export const getTriggerAttributes =
    ({ payload, loading = false }) =>
    async (dispatch, getState) => {
        const key = buildTriggerAttributesKey(payload);

        const reduxCached = getCachedTriggerAttributes(getState(), payload);
        if (reduxCached !== undefined) {
            return { status: true, data: reduxCached };
        }

        const l1Cached = triggerAttributesCache.get(key);
        if (l1Cached && Date.now() - l1Cached.ts < TRIGGER_ATTRIBUTES_IN_FLIGHT_TTL_MS) {
            const list = l1Cached.data?.data ?? l1Cached.data;
            if (hasUsableTriggerListCache(list)) {
                return l1Cached.data;
            }
        }

        if (triggerAttributesInFlight.has(key)) {
            return triggerAttributesInFlight.get(key);
        }

        const inFlight = fetchTriggerAttributesFromApi(dispatch, payload, loading)
            .then((response) => {
                triggerAttributesCache.set(key, { data: response, ts: Date.now() });
                return response;
            })
            .finally(() => {
                triggerAttributesInFlight.delete(key);
            });

        triggerAttributesInFlight.set(key, inFlight);
        return inFlight;
    };

const TRIGGER_BASE_DDL_IN_FLIGHT_TTL_MS = 1500;
const triggerBaseDDLInFlight = new Map();
const triggerBaseDDLCache = new Map();

const buildTriggerBaseDDLKey = (payload = {}) =>
    JSON.stringify({
        triggerSourceId: payload?.triggerSourceId ?? '',
        clientId: payload?.clientId ?? '',
        departmentId: payload?.departmentId ?? '',
        userId: payload?.userId ?? '',
    });

export const getCachedTriggerBaseDDL = (state, payload) => {
    const sessionKey = buildDynamicListSessionKey(payload);
    const triggerSourceId = typeof payload === 'object' ? payload?.triggerSourceId : payload;
    const sessionEntry = state?.dynamicListReducer?.triggerBaseDDL?.[sessionKey];
    const cached =
        sessionEntry?.[triggerSourceId] ?? state?.dynamicListReducer?.triggerBaseDDL?.[triggerSourceId];
    return cached !== undefined ? cached : undefined;
};

const fetchTriggerBaseDDLFromApi = (dispatch, payload, loading) =>
    new Promise((resolve) => {
            dispatch(
                request.post({
                    url: DYNAMIC_LIST_GET_TRIGGER_BASE_DDL,
                    payload,
                    loading,
                    ok: ({ data }) => {
                        const sessionKey = buildDynamicListSessionKey(payload);
                        if (data.status) {
                            dispatch(
                                get_trigger_base_ddl_data({
                                    sessionKey,
                                    field: payload.triggerSourceId,
                                    data: data?.data,
                                }),
                            );
                        } else {
                            dispatch(
                                get_trigger_base_ddl_data({
                                    sessionKey,
                                    field: payload.triggerSourceId,
                                    data: [],
                                }),
                            );
                        }
                        resolve({ status: data.status, data: data.data ?? [] });
                    },
                    fail: () => {
                        dispatch(
                            get_trigger_base_ddl_data({
                                sessionKey: buildDynamicListSessionKey(payload),
                                field: payload.triggerSourceId,
                                data: [],
                            }),
                        );
                        resolve({ status: false, data: [] });
                    },
                }),
        );
    });

export const getTriggerBaseDDLData =
    ({ payload, isPageHeader = false, loading }) =>
    async (dispatch, getState) => {
        const resolvedLoading = loading !== undefined ? loading : !isPageHeader;
        const key = buildTriggerBaseDDLKey(payload);

        const reduxCached = getCachedTriggerBaseDDL(getState(), payload);
        if (reduxCached !== undefined) {
            return { status: true, data: reduxCached };
        }

        const l1Cached = triggerBaseDDLCache.get(key);
        if (l1Cached && Date.now() - l1Cached.ts < TRIGGER_BASE_DDL_IN_FLIGHT_TTL_MS) {
            return l1Cached.data;
        }

        if (triggerBaseDDLInFlight.has(key)) {
            return triggerBaseDDLInFlight.get(key);
        }

        const inFlight = fetchTriggerBaseDDLFromApi(dispatch, payload, resolvedLoading)
            .then((response) => {
                triggerBaseDDLCache.set(key, { data: response, ts: Date.now() });
                return response;
            })
            .finally(() => {
                triggerBaseDDLInFlight.delete(key);
            });

        triggerBaseDDLInFlight.set(key, inFlight);
        return inFlight;
    };

// Per-component guards reset on remount; join in-flight identical requests and keep a short L1 TTL.
const triggerAttrInFlight = new Map();
const triggerAttrCache = new Map();

const fetchTriggerAttributeValuesFromApi = (dispatch, payload, loading) =>
    new Promise((resolve) => {
            dispatch(
                request.post({
                    url: DYNAMIC_LIST_GET_TRIGGER_ATTRIBUTES_VALUES,
                    payload,
                    loading,
                    ok: ({ data }) => resolve(data),
                    fail: () => resolve(undefined),
                }),
        );
    });

export const resolveTriggerAttributeValues = async ({
    dispatch,
    getState,
    payload,
    setTriggerValues = () => {},
    loading = false,
}) => {
    const cached = getCachedTriggerAttributeValues(getState(), payload);
    if (cached !== undefined) {
        applyTriggerAttrData({ status: true, data: cached }, payload, setTriggerValues);
        return { status: true, data: cached, isCacheHit: true };
    }

    const result = await dispatch(
        getTriggerAttributeValuesData({ payload, setTriggerValues, loading }),
    );
    return { status: result?.status, data: result?.data ?? [], isCacheHit: false };
};

export const getTriggerAttributeValuesData =
    ({ payload, setTriggerValues = () => {}, loading = false }) =>
    async (dispatch, getState) => {
        const key = buildTriggerAttrKey(payload);

        const reduxCached = getCachedTriggerAttributeValues(getState(), payload);
        if (reduxCached !== undefined) {
            applyTriggerAttrData({ status: true, data: reduxCached }, payload, setTriggerValues);
            return { status: true, data: reduxCached };
        }

        const l1Cached = triggerAttrCache.get(key);
        if (l1Cached && Date.now() - l1Cached.ts < TRIGGER_ATTR_IN_FLIGHT_TTL_MS) {
            const list = l1Cached.data?.data ?? l1Cached.data;
            if (hasUsableTriggerListCache(list)) {
                applyTriggerAttrData(l1Cached.data, payload, setTriggerValues);
                return l1Cached.data;
            }
        }

        if (triggerAttrInFlight.has(key)) {
            const data = await triggerAttrInFlight.get(key);
            applyTriggerAttrData(data, payload, setTriggerValues);
            return data;
        }

        const inFlight = fetchTriggerAttributeValuesFromApi(dispatch, payload, loading).finally(() => {
            triggerAttrInFlight.delete(key);
        });

        triggerAttrInFlight.set(key, inFlight);
        const data = await inFlight;

        if (data !== undefined) {
            triggerAttrCache.set(key, { data, ts: Date.now() });
            if (data?.status) {
                writeTriggerAttributeCache(dispatch, payload, data?.data ?? []);
            }
        }

        applyTriggerAttrData(data, payload, setTriggerValues);
        return data;
    };

export const clearDynamicListApiCaches = () => {
    triggerAttrInFlight.clear();
    triggerAttrCache.clear();
    triggerAttributesInFlight.clear();
    triggerAttributesCache.clear();
    triggerBaseDDLInFlight.clear();
    triggerBaseDDLCache.clear();
};

export const getWebDomains =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: DYNAMIC_LIST_GET_TRIGGER_BASE_DDL,
                payload,
                loading,
                ok: ({ data }) => {
                    return { status: data.status, data: data.data ?? [] };
                },
                fail: () => {
                    return { status: false, data: [] };
                },
            }),
        );


        
        export const getTrrAttributeValues =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: DYNAMIC_LIST_GET_TRIGGER_ATTRIBUTES_VALUES,
                payload,
                loading,
                ok: ({ data }) => {
                    if (data.status) {
                    } else {

                    }
                    return { status: data.status, data: data.data ?? [] };
                },
                fail: () => {
                    return { status: false, data: [] };
                },
            }),
        );
export const getCustomEventsValueData =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: DYNAMIC_LIST_GET_CUSTOM_EVENTS_VALUE,
                payload,
                loading,
                ok: ({ data }) => {
                    const shouldUpdateCustomAttributesState = !payload?.attributevalue;

                    if (data.status) {
                        if (shouldUpdateCustomAttributesState) {
                            dispatch(
                                get_dynamic_list({
                                    field: 'customAttributes',
                                    data: { field: payload.columnName, data: data?.data },
                                }),
                            );
                        }
                    } else if (shouldUpdateCustomAttributesState) {
                        dispatch(
                            get_dynamic_list({
                                field: 'customAttributes',
                                data: { field: payload.columnName, data: [] },
                            }),
                        );
                    }
                    return { status: data.status, data: data.data ?? [] };
                },
                fail: () => {
                    if (!payload?.attributevalue) {
                        dispatch(
                            get_dynamic_list({
                                field: 'customAttributes',
                                data: { field: payload.columnName, data: [] },
                            }),
                        );
                    }
                    return { status: false, data: [] };
                },
            }),
        );

export const getGeoFencesLists = (payload) => async (dispatch) => {
    return dispatch(
            request.post({
            url: GET_GEOFENCES_LISTS,
                payload,
            // loading: true,
                ok: ({ data }) => {
                const { status, data: res } = data;
                if (!status) {
                    dispatch(updateGeofence({ field: 'list', payload: [] }));
                    return;
                }
                const list = Array.isArray(res)
                    ? res
                    : Array.isArray(res?.data)
                      ? res.data
                      : Array.isArray(res?.list)
                        ? res.list
                        : [];
                dispatch(updateGeofence({ field: 'list', payload: list }));
                },
            fail: () => dispatch(updateGeofence({ field: 'list', payload: [] })),
            }),
        );
};

export const getCustomEventsAttributesData =
    ({ payload, setTriggerValues, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: DYNAMIC_LIST_GET_CUSTOM_EVENTS_VALUE,
                payload,
                loading,
                ok: ({ data }) => {
                    if (data.status) {
                        setTriggerValues([...(data?.data || [])]);
                    } else {
                        setTriggerValues([]);
                    }
                    return { status: data.status, data: data.data ?? [] };
                },
                fail: () => {
                    setTriggerValues([]);
                    return { status: false, data: [] };
                },
            }),
        );

export const createDynamicList =
    ({ payload , loading = false}) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: CREATE_DYNAMIC_LIST,
                payload,
                loading: loading,
                isFailureCheck: true,
                ok: ({ data }) => {
                     
                },
                fail: ({response}) => {
                    
                },
            }),
        );

export const getDynamicListsData = (payload) => async (dispatch) => {
    dispatch(set_list_loading(true));
    dispatch(set_list_failure(false));
    return dispatch(
        request.post({
            url: GET_DYNAMIC_LISTS,
            payload,
            loading: false,
            ok: ({ data }) => {
                if (data.status) {
                    if(data?.data?.listData?.length > 0) {
                        dispatch(set_list_failure(false));
                        dispatch(get_dynamic_list({ field: 'dynamicListView', data: data?.data }));
                    } else {
                        dispatch(set_list_failure(true));
                        dispatch(get_dynamic_list({ field: 'dynamicListView', data: { list: [], count: 0 } }));
                    }
                } else {
                    dispatch(set_list_failure(true));
                    dispatch(get_dynamic_list({ field: 'dynamicListView', data: { list: [], count: 0 } }));
                }
            },
            fail: () => {
                dispatch(set_list_failure(true));
            },
            final: () => dispatch(set_list_loading(false)),
        }),
    );
};

export const isListNameExist =
    ({ payload, loading = false }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: IS_LIST_NAME_EXIST,
                payload,
                loading,
                isToast: false,
                ok: () => {},
                fail: (err) => {
                                    },
            }),
        );
    };

export const getDynamicListById =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_DYNAMIC_LISTS_BY_ID,
                payload,
                loading: loading,
                ok: ({ data }) => {
                    if (data?.status) {
                        dispatch(get_dynamic_list({ field: 'editList', data: data?.data }));
                        return { status: true, data: data?.data };
                    }
                    dispatch(get_dynamic_list({ field: 'editList', data: [] }));
                    return { status: false, data: {} };
                },
                fail: () => {
                    dispatch(get_dynamic_list({ field: 'editList', data: [] }));
                    return { status: false, data: {} };
                },
            }),
        );

export const postDuplicateDynamicList =
    ({ payload, params, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: DUPLICATE_DYNAMIC_LIST,
                payload,
                loading,
                isFailureCheck: true,
                ok: ({ data }) => {
                    if (data.status) dispatch(getDynamicListsData(params));
                },
                fail: ({response}) => {
                },
            }),
        );

export const getListMoreInfo =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: DYNAMIC_LIST_MORE_INFO,
                payload,
                loading,
                ok: ({ data }) => {
                    if (data?.status) {
                        return { status: true, data: data?.data ?? {} };
                    }
                    return { status: false, data: {} };
                },
                fail: () => ({ status: false, data: {} }),
            }),
        );

export const getSearchDropdownData =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: DYNAMIC_LIST_SEARCH_NAME,
                payload,
                loading,
                ok: ({ data }) => {
                    if (data.status) {
                        dispatch(get_dynamic_list({ field: 'advSearchDropdown', data: data.data }));
                    } else {
                        dispatch(get_dynamic_list({ field: 'advSearchDropdown', data: [] }));

                    }
                },
                fail: (err) => {
                                    },
            }),
        );

export const approveDynamicList =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: RFA_DYNAMIC_LIST_APPROVE,
                payload,
                loading: false,
                ok: ({ data }) => {},
                fail: (err) => {
                                    },
            }),
        );
export const rejectDynamicList =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: RFA_DYNAMIC_LIST_REJECT,
                payload,
                loading: false,
                ok: ({ data }) => {},
                fail: (err) => {
                                    },
            }),
        );
export const dynamicList_Comm_count =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: DYNAMIC_LIST_SEARCH_COUNT,
                payload,
                loading: loading,
                ok: ({ data }) => {},
                fail: (err) => {
                                    },
            }),
        );

export const downloadDynamicListFiles_Save = (payload, loading = true) => async (dispatch) => {
    return dispatch(
        request.post({
            url: DYNAMIC_LIST_DOWNLOAD,
            payload,
            loading,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
                                if (status) {
                }
            },
            fail: (err) => {
                            },
        }),
    );
};

export const getDynamicListScheduleDetails = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_DYNAMIC_LIST_SCHEDULE,
            payload,
            loading: false,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
                if (status) {
                }
            },
            fail: (err) => {},
        }),
    );
};

export const stopDynamicListSchedule = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: STOP_DYNAMIC_LIST_SCHEDULE,
            payload,
            loading,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
                if (status) {
                }
            },
            fail: (err) => {},
        }),
    );
};

export const downloadDynamicListFiles_csv = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: DYNAMIC_LIST_DOWNLOAD_FILE,
            payload,
            loading: true,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
                                if (status) {
                }
            },
            fail: (err) => {
                            },
        }),
    );
};
export const getTimezoneDetails = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: DYNAMIC_TIME_ZONE_DETAILS,
            payload,
            loading: false,
            ok: (res) => {},
            fail: (err) => {
                            },
        }),
    );
};

export const getTrrComm_ChannelValues =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_COMMUNICATION_BYCHANNEL,
                payload,
                loading,
                ok: ({ data }) => {
                    if (data.status) {
                    } else {

                    }
                    return { status: data.status, data: data.data ?? [] };
                },
                fail: () => {
                    return { status: false, data: [] };
                },
            }),
        );


export const getDynamicListFullAttributeJSONValues =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_FULL_JSON_ATTRIBUTE_VALUES,
                payload,
                loading,
            }),
        );
