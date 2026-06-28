import { baseURL } from 'Constants/EndPoints';
/**
 * Navigate to FormForge in the same tab with return context (returnUrl query + cookie).
 * Cookie name must match FormForge `RESUL_RETURN_COOKIE_NAME` (`ff_resul_return`).
 */

const getCleanBaseURL = () => {
    let cleanURL = baseURL || '';
    if (cleanURL.endsWith('/')) {
        cleanURL = cleanURL.slice(0, -1);
    }
    return cleanURL;
};

/**
 * Append `embed=1` (chromeless analytics) and optional `returnUrl` for FormForge Back navigation.
 */
export const appendEmbedParamToFormForgeUrl = (formForgeUrl, returnTo) => {
    if (!formForgeUrl || typeof formForgeUrl !== 'string') return formForgeUrl;
    const ret =
        returnTo != null && typeof returnTo === 'string' && returnTo.trim()
            ? returnTo.trim()
            : '';
    const cleanBaseURL = getCleanBaseURL();
    try {
        const u = new URL(formForgeUrl);
        u.searchParams.set('embed', '1');
        if (ret) u.searchParams.set('returnUrl', ret);
        if (cleanBaseURL) u.searchParams.set('exchangeUrl', cleanBaseURL);
        return u.toString();
    } catch {
        const sep = formForgeUrl.includes('?') ? '&' : '?';
        let out = `${formForgeUrl}${sep}embed=1`;
        if (ret) {
            out += `&returnUrl=${encodeURIComponent(ret)}`;
        }
        if (cleanBaseURL) {
            out += `&exchangeUrl=${encodeURIComponent(cleanBaseURL)}`;
        }
        return out;
    }
};

/** Same cookie name as FormForge `RESUL_RETURN_COOKIE_NAME` (`ff_resul_return`). */
export const setResulReturnCookieForFormForge = (returnTo) => {
    if (!returnTo || typeof returnTo !== 'string' || !returnTo.trim()) return;
    try {
        document.cookie = `ff_resul_return=${encodeURIComponent(returnTo.trim())};path=/;max-age=900;SameSite=Lax`;
    } catch (_) {
        /* ignore */
    }
};

export const appendReturnUrlToFormForge = (editUrl, returnTo) => {
    if (!editUrl || typeof editUrl !== 'string') return editUrl;
    const cleanBaseURL = getCleanBaseURL();
    try {
        const u = new URL(editUrl);
        if (returnTo) u.searchParams.set('returnUrl', returnTo);
        if (cleanBaseURL) u.searchParams.set('exchangeUrl', cleanBaseURL);
        return u.toString();
    } catch {
        let out = editUrl;
        if (returnTo) {
            const sep = out.includes('?') ? '&' : '?';
            out += `${sep}returnUrl=${encodeURIComponent(returnTo)}`;
        }
        if (cleanBaseURL) {
            const sep = out.includes('?') ? '&' : '?';
            out += `${sep}exchangeUrl=${encodeURIComponent(cleanBaseURL)}`;
        }
        return out;
    }
};

/**
 * @param {string} formForgeUrl - URL from GetFormEditURL / GetNewFormRedirectURL
 * @param {string} returnTo - Full RESUL URL to return on FormForge Cancel
 */
export const openFormForgeWithReturn = (formForgeUrl, returnTo) => {
    const urlWithReturn = appendReturnUrlToFormForge(formForgeUrl, returnTo);
    setResulReturnCookieForFormForge(returnTo);
    window.location.assign(urlWithReturn);
};
