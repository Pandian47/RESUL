import { decryptWithAES } from 'Utils/modules/crypto';
const parseRouteQueryState = (param) => {
    if (!param) return null;

    try {
        const parsed = decodeLargeState(param);
        if (parsed != null && typeof parsed === 'object') return parsed;
    } catch {
        // fallback below
    }

    try {
        const normalizedParam = param.replaceAll(' ', '+');
        const decryptedState = decryptWithAES(decodeURIComponent(normalizedParam));
        const parsed = JSON.parse(decryptedState);
        if (parsed != null && typeof parsed === 'object') return parsed;
    } catch {
        // ignore decode errors
    }

    return null;
};

/** Reads `index` from encrypted `?q=` route state (dashboard, audience, analytics, communication). */
export const getRouteTabIndex = (pathname = '', search) => {
    if (typeof window === 'undefined') return 0;

    const query =
        search !== undefined && search !== null
            ? search
            : typeof window !== 'undefined'
              ? window.location.search
              : '';
    const param = new URLSearchParams(query).get('q');
    const parsed = parseRouteQueryState(param);
    if (parsed?.index !== undefined && parsed?.index !== null) {
        const index = Number(parsed.index);
        return Number.isFinite(index) ? index : 0;
    }

    return 0;
};

/** Execute step ROI flow (`roi` in encrypted `?q=`). */
export const isCommunicationExecuteRoiActive = (queryState) => {
    if (!queryState || typeof queryState !== 'object') return false;
    const { roi } = queryState;
    return roi === true || roi === 1 || String(roi).toLowerCase() === 'true' || String(roi).toLowerCase() === '1';
};

export const isCommunicationExecuteRoiFlow = (search = '') => {
    const query =
        search !== undefined && search !== null
            ? search
            : typeof window !== 'undefined'
              ? window.location.search
              : '';
    const param = new URLSearchParams(query).get('q');
    return isCommunicationExecuteRoiActive(parseRouteQueryState(param));
};
