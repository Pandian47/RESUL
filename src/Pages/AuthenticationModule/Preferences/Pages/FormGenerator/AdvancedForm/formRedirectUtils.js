/** Parse GetFormEditURL / GetFormAnalyticsURL response (URL may be nested or JSON string). */
export const extractFormRedirectUrlFromResponse = (res, depth = 0) => {
    const tryUrl = (v) =>
        typeof v === 'string' && /^https?:\/\//i.test(v.trim()) ? v.trim() : null;
    if (typeof res === 'string') {
        return tryUrl(res);
    }
    if (!res || typeof res !== 'object' || depth > 4) return null;
    const direct =
        tryUrl(res.redirectUrl) ||
        tryUrl(res.redirect_url) ||
        tryUrl(res.url) ||
        tryUrl(res.editUrl);
    if (direct) return direct;
    const fromDataObj =
        tryUrl(res.data?.redirectUrl) ||
        tryUrl(res.data?.redirect_url) ||
        tryUrl(res.data?.url) ||
        tryUrl(res.data?.editUrl);
    if (fromDataObj) return fromDataObj;
    if (typeof res.data === 'string') {
        const s = res.data.trim();
        const asUrl = tryUrl(s);
        if (asUrl) return asUrl;
        try {
            return extractFormRedirectUrlFromResponse(JSON.parse(res.data), depth + 1);
        } catch {
            return null;
        }
    }
    if (res.data && typeof res.data === 'object') {
        return extractFormRedirectUrlFromResponse(res.data, depth + 1);
    }
    return null;
};

/** Parse GetNewFormRedirectURL response. */
export const extractNewFormRedirectUrl = (res, depth = 0) => {
    return extractFormRedirectUrlFromResponse(res, depth);
};

export const getAdvancedFormId = (dataItem) =>
    dataItem?.recipientFormId ?? dataItem?.formId ?? dataItem?.FormId ?? null;
