import { normalizePreviewSrc } from 'Components/Previews/SocialPostMediaPreview/Preview';
/**
 * Gallery / listing APIs sometimes return `imagePath` as a stringified JSON array, e.g.
 * `["https://host/path.jpg"]`, instead of a bare URL.
 * @param {unknown} value
 * @returns {string} first http(s) URL or empty string
 */
export const resolveStringifiedMediaUrl = (value) => {
    if (value == null) return '';
    const s = String(value).trim();
    if (!s) return '';
    if (/^https?:\/\//i.test(s)) return s;
    if (s.startsWith('data:')) return s;
    if ((s.startsWith('[') && s.endsWith(']')) || (s.startsWith('{') && s.endsWith('}'))) {
        try {
            const parsed = JSON.parse(s);
            if (Array.isArray(parsed)) {
                const hit = parsed.find((x) => {
                    if (x == null) return false;
                    const u = String(x).trim();
                    return u && (/^https?:\/\//i.test(u) || u.startsWith('data:'));
                });
                return hit != null ? String(hit).trim() : '';
            }
            if (parsed && typeof parsed === 'object') {
                const u =
                    parsed.url ||
                    parsed.imagePath ||
                    parsed.imageUrl ||
                    parsed.mediaURL ||
                    parsed.filePath;
                if (u != null && String(u).trim()) return String(u).trim();
            }
        } catch {
            return '';
        }
    }
    return '';
};

/**
 * Same sources as {@link resolveStringifiedMediaUrl}, but returns **every** usable URL when
 * `imagePath` / `imageUrl` is a stringified JSON array (e.g. listing `GetListingPreviewImage`).
 * @param {unknown} value
 * @returns {string[]} normalized `src` values suitable for `Preview` `galleryImages` / carousel
 */
export const resolveStringifiedMediaUrlList = (value) => {
    if (value == null) return [];
    const s = String(value).trim();
    if (!s) return [];
    if ((s.startsWith('[') && s.endsWith(']')) || (s.startsWith('{') && s.endsWith('}'))) {
        try {
            const parsed = JSON.parse(s);
            if (Array.isArray(parsed)) {
                return parsed
                    .map((x) => (x == null ? '' : String(x).trim()))
                    .filter((u) => u && (/^https?:\/\//i.test(u) || u.startsWith('data:')))
                    .map((u) => normalizePreviewSrc(u, false))
                    .filter(Boolean);
            }
            if (parsed && typeof parsed === 'object') {
                const u =
                    parsed.url ||
                    parsed.imagePath ||
                    parsed.imageUrl ||
                    parsed.mediaURL ||
                    parsed.filePath;
                if (u != null && String(u).trim()) {
                    const n = normalizePreviewSrc(String(u).trim(), false);
                    return n ? [n] : [];
                }
            }
        } catch {
            return [];
        }
    }
    if (/^https?:\/\//i.test(s) || s.startsWith('data:')) {
        const n = normalizePreviewSrc(s, false);
        return n ? [n] : [];
    }
    return [];
};

/**
 * Prefer parsed `imagePath`, then `contentThumbnail` (often bare JPEG base64 `/9j/…`).
 * @param {unknown} imagePath
 * @param {unknown} contentThumbnail
 * @returns {string} safe `src` for `<img>` / preview helpers
 */
export const resolveGalleryBannerSrc = (imagePath, contentThumbnail) => {
    const fromPath = resolveStringifiedMediaUrl(imagePath);
    if (fromPath) return normalizePreviewSrc(fromPath, false);
    if (contentThumbnail != null && String(contentThumbnail).trim() !== '') {
        return normalizePreviewSrc(String(contentThumbnail).trim(), false);
    }
    return '';
};

/**
 * Social post listing / gallery preview: same resolution order as mobile channels.
 * @param {Record<string, unknown>} data
 * @returns {string}
 */
export const resolveGalleryMediaForSocialPreview = (data = {}) => {
    const fromPath = resolveStringifiedMediaUrl(data.imagePath ?? data.imageUrl);
    if (fromPath) return normalizePreviewSrc(fromPath, false);
    const fallbacks = [data.contentThumbnail, data.attachment, data.previewImage];
    for (const v of fallbacks) {
        if (v != null && String(v).trim() !== '') {
            const n = normalizePreviewSrc(String(v).trim(), false);
            if (n) return n;
        }
    }
    return '';
};

