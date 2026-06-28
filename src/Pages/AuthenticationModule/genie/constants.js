import { getUserDateTimeFormat } from 'Utils/modules/dateTime';
/**
 * RESUL Genie — host-only: `baseURL`, `getAuthHeaders`, and transport wiring.
 * Genie path strings live in `resul-genie-ui` (`RESUL_GENIE_DEFAULT_ENDPOINT_PATHS`); override per host if needed.
 */

import { baseURL } from 'Constants/EndPoints';

import {
    RESUL_GENIE_DEFAULT_ENDPOINT_PATHS,
    createMapPreviousPromptGroups,
    createResulGenieTransport,
} from 'resul-genie-ui';

import { getStoreInstance } from 'Store/storeRef';
import { updateSessionModal } from 'Reducers/globalState/reducer';

export {
    SEGMENT_CATEGORY_GALLERY,
    GENIE_PROMPT_GROUP_MY,
    GENIE_PROMPT_GROUP_TOP,
    FALLBACK_DATE_RANGE_MIN,
    FALLBACK_DATE_RANGE_MAX,
    toGenieDateYmd,
    normalizeGeniePromptGroup,
    extractPromptTypesFromGenieResponse,
    defaultSegmentCategoryFromPromptTypes,
    segmentCategoryForPromptTypeId,
    hasSessionForGenie,
    getGenieFetchSpaceIdDataError,
    pickArrayDeep,
    mapPrompt,
    galleryItemsFromApiResponse,
    mergeGalleryById,
    text,
} from 'resul-genie-ui';

export {
    GENIE_LAST_ACTIVE_SPACE_QUERY_PARAM,
    GENIE_LAST_ACTIVE_SPACE_STORAGE_KEY,
    GENIE_LAST_ACTIVE_SPACE_CLEARED_EVENT,
    GENIE_DEV_EMPTY_SPACE_PLACEHOLDER,
    pickSpaceIdFromCreateResponse,
} from 'resul-genie-ui';

/**
 * Genie UI `environment` flag (see `resul-genie-ui`):
 * - **`DEV`** — real host APIs.
 * - **`PROTO`** — mock assistant replies where applicable.
 */
export const GENIE_ENVIRONMENT = 'DEV';

export const GENIE_SYSTEM_PROMPT =
    'You are a healthcare AI assistant. Only answer patient-care related queries.';

export const getAuthHeaders = () => {
    const accessToken = localStorage.getItem('accessToken') || '';
    const jwtToken = localStorage.getItem('jwtToken') || '';
    const uuiD = localStorage.getItem('uuiD') || '';

    return {
        accessToken,
        reqs: accessToken,
        'X-Forwarded-For': uuiD,
        Authorization: jwtToken ? `Bearer ${jwtToken}` : '',
        'Content-Type': 'application/json',
        accept: 'application/json, text/plain, */*',
    };
};

const transport = createResulGenieTransport({
    baseURL,
    getAuthHeaders,
    endpoints: RESUL_GENIE_DEFAULT_ENDPOINT_PATHS,
});

const with401Check = (fn) => {
    if (typeof fn !== 'function') return fn;
    return async (...args) => {
        const handle401 = () => {
            const store = getStoreInstance();
            if (store) {
                store.dispatch(updateSessionModal(true));
                localStorage.setItem('sessionModal', true);
            }
        };

        try {
            const res = await fn(...args);
            if (res?.status === 401 || res?.response?.status === 401 || res?.statusCode === 401) {
                handle401();
            }
            return res;
        } catch (err) {
            const is401 = err?.response?.status === 401 || err?.status === 401 || err?.statusCode === 401 || String(err?.message || '').includes('401');
            if (is401) {
                handle401();
            }
            throw err;
        }
    };
};

export const post = with401Check(transport.post);
export const postInsights = with401Check(transport.postInsights);

// createGenieStaticApi returns an object of functions, so we wrap the return value
export const createGenieStaticApi = (...args) => {
    const api = transport.createGenieStaticApi(...args);
    if (!api || typeof api !== 'object') return api;
    const wrappedApi = {};
    for (const key of Object.keys(api)) {
        wrappedApi[key] = with401Check(api[key]);
    }
    return wrappedApi;
};

export const fetchPromptGalleryApi = with401Check(transport.fetchPromptGalleryApi);
export const getGenieChatID = with401Check(transport.getGenieChatID);
export const getGenieChat = with401Check(transport.getGenieChat);
export const getDateRangeGenie = with401Check(transport.getDateRangeGenie);
export const getPromptTypeGenie = with401Check(transport.getPromptTypeGenie);
export const getTokenUsages = with401Check(transport.getTokenUsages);
export const getTokens = with401Check(transport.getTokens);
export const getGenieTemplates = with401Check(transport.getGenieTemplates);

export const mapPreviousPrompts = createMapPreviousPromptGroups((d) => {
    try {
        const s = getUserDateTimeFormat(d, 'formatDateTime');
        return s && String(s).trim() ? s : null;
    } catch {
        return null;
    }
});
