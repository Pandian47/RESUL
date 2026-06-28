import { decodeLargeState, encodeUrl } from './crypto';
export function queryString(data) {
    return Object.keys(data)
        .map((key) => key + '=' + encodeURIComponent(data[key]))
        .join('&');
}

export const validateHttpsUrl = {
    formatUrl: (value) => {
        const protocol = 'https://';
        let val = value;
        if (!val.startsWith(protocol)) {
            val = protocol + val.replace(/^https?:\/\//, '');
        }
        return val.length < protocol.length ? protocol : val;
    },

    handleKeyDown: (e) => {
        const input = e.target;
        const { selectionStart, selectionEnd, value } = input;
        const protocol = 'https://';
        const protocolLength = protocol.length;
        const isDeleteKey = e.key === 'Backspace' || e.key === 'Delete';

        if (!isDeleteKey) return { preventDefault: false };

        if (selectionStart === 0 && selectionEnd === value.length) {
            return {
                preventDefault: true,
                value: protocol,
                selectionStart: protocolLength,
                selectionEnd: protocolLength,
            };
        }

        if (selectionStart < protocolLength || selectionEnd <= protocolLength) {
            return {
                preventDefault: true,
                selectionStart: protocolLength,
                selectionEnd: protocolLength,
            };
        }

        const selStart = Math.max(selectionStart, protocolLength);
        const selEnd = Math.max(selectionEnd, protocolLength);
        const domainPart = value.substring(protocolLength);
        const isBackspace = e.key === 'Backspace';

        if (selStart === selEnd) {
            const deleteIndex = selStart - protocolLength - (isBackspace ? 1 : 0);
            if (deleteIndex >= 0 && deleteIndex < domainPart.length) {
                const updatedDomain = domainPart.slice(0, deleteIndex) + domainPart.slice(deleteIndex + 1);
                const newCursor = selStart + (isBackspace ? -1 : 0);
                return {
                    preventDefault: true,
                    value: protocol + updatedDomain,
                    selectionStart: newCursor,
                    selectionEnd: newCursor,
                };
            }
        } else {
            const start = selStart - protocolLength;
            const end = selEnd - protocolLength;
            const updatedDomain = domainPart.slice(0, start) + domainPart.slice(end);
            return {
                preventDefault: true,
                value: protocol + updatedDomain,
                selectionStart: selStart,
                selectionEnd: selStart,
            };
        }

        return { preventDefault: false };
    },

    handlePaste: (e) => {
        const pasted = e.clipboardData.getData('text/plain').trim();
        return validateHttpsUrl.formatUrl(pasted);
    },
};

export function decodeJwt(tokenOrUrl) {
    try {
        let token = tokenOrUrl;
        if (tokenOrUrl.includes('code=')) {
            const url = new URL(tokenOrUrl);
            token = url.hash.split('code=')[1].split('&')[0];
        }
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid JWT format - expected 3 parts');
        }
        const decodeBase64Url = (base64Url) => {
            let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const padLength = (4 - (base64.length % 4)) % 4;
            base64 += '='.repeat(padLength);

            const decoded = atob(base64);
            try {
                return JSON.parse(decoded);
            } catch {
                return decoded;
            }
        };
        return {
            header: decodeBase64Url(parts[0]),
            payload: decodeBase64Url(parts[1]),
            signature: parts[2],
            status: true,
        };
    } catch (error) {
        return {
            status: false,
            message: error?.message,
            rawToken: tokenOrUrl,
        };
    }
}

export const EligibleReimderUrl = ['run.resulticks.com', 'run19.resulticks.com'];

export function removeQueryParams(params) {
    const url = new URL(window.location.href);
    params.forEach((param) => url.searchParams.delete(param));
    window.history.replaceState({}, document.title, url.toString());
}
export function updateQueryParams(params) {
    const url = new URL(window.location.href);
    const searchParams = url.searchParams;

    const currentQParam = searchParams.get('q');
    let currentState = {};

    if (currentQParam) {
        try {
            const decoded = decodeLargeState(currentQParam);
            if (decoded) {
                currentState = decoded;
            }
        } catch (err) {
        }
    }
    const mergedState = {
        ...currentState,
        ...params,
    };

    Object.keys(mergedState).forEach((key) => {
        if (mergedState[key] === null || mergedState[key] === undefined) {
            delete mergedState[key];
        }
    });

    const encodedState = encodeUrl(mergedState);
    searchParams.set('q', encodedState);

    window.history.pushState({}, '', url);

    window.dispatchEvent(new Event('queryparamschange'));
}
