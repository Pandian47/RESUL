/**
 * RSMobilePreview - shared utils, config, and channel handlers
 */

// ─── Channel Config ─────────────────────────────────────────────────────────
export const CHANNELS = { SMS: 'sms', MMS: 'mms', WHATSAPP: 'whatsapp', RCS: 'rcs', LINE: 'line', VIBER: 'viber' };

// ─── Preview source (replaces fromGallery) – which area is showing the preview ─
// Use these constants when passing previewSource; do not hardcode strings.
export const PREVIEW_SOURCE = {
    COMM_LISTING: 'comm_listing',
    AUTHORING: 'authoring',
    GALLERY: 'gallery',
    ANALYTICS_LISTING: 'analytics_Listing',
    CSR: 'csr',
    DETAIL_ANALYTICS: 'detail_analytics',
    LIVE_PREVIEW: 'live_preview',
    PLANNER: 'planner',
    MDC_PREVIEW: 'mdc_preview',
};

/** Config per preview source – used across all areas */
export const PREVIEW_SOURCE_CONFIG = {
    [PREVIEW_SOURCE.COMM_LISTING]: { showTimestamp: false, bubbleClass: 'gallery_whatsApp', isListing: true },
    [PREVIEW_SOURCE.AUTHORING]: { showTimestamp: true, bubbleClass: '', isListing: false },
    [PREVIEW_SOURCE.GALLERY]: { showTimestamp: false, bubbleClass: 'gallery_whatsApp', isListing: true },
    [PREVIEW_SOURCE.ANALYTICS_LISTING]: { showTimestamp: false, bubbleClass: 'gallery_whatsApp', isListing: true },
    [PREVIEW_SOURCE.CSR]: { showTimestamp: true, bubbleClass: '', isListing: false },
    [PREVIEW_SOURCE.DETAIL_ANALYTICS]: { showTimestamp: false, bubbleClass: 'gallery_whatsApp', isListing: true },
    [PREVIEW_SOURCE.LIVE_PREVIEW]: { showTimestamp: true, bubbleClass: '', isListing: false },
    [PREVIEW_SOURCE.PLANNER]: { showTimestamp: true, bubbleClass: '', isListing: false },
    [PREVIEW_SOURCE.MDC_PREVIEW]: { showTimestamp: true, bubbleClass: '', isListing: false },
};

export const getPreviewSourceConfig = (source) =>
    (source && PREVIEW_SOURCE_CONFIG[source]) || PREVIEW_SOURCE_CONFIG[PREVIEW_SOURCE.AUTHORING];

/**
 * Common prop names - all pages/callers can pass any of the aliases below.
 * normalizeProps maps everything to these single names for handlers.
 */
export const COMMON_PROPS = {
    CONTENT: 'content',
    SCHEDULE: 'schedule',
    HEADER: 'header',
    FOOTER: 'footer',
    HEADER_CONTENT: 'headerContent',
    PREVIEW_IMAGE: 'previewImage',
    IMAGE_PATH: 'imagePath',
    CAROUSEL_JSON: 'carouselJSON',
    CAROUSEL_CONTENT: 'carouselContent',
    CONTENT_JSON: 'contentJson',
    SENDER_NAME: 'senderName',
    SMS_CONTENT: 'smsContent',
};

// ─── Prop normalization ─────────────────────────────────────────────────────
// Maps all page-specific prop names to common names so handlers use one source
export const normalizeProps = (props) => {
    const channel = props.bubbleType?.type || props.channel || '';
    const schedule = props.schedule || props.scheduleDate;
    const content = props.content || props.bubbleContent || props.smsContent || '';
    const header = props.header || '';
    const footer = props.footer || '';
    const headerContent = props.headerContent || '';
    const previewImage = props.previewImage || props.imagePath || '';
    const imagePath = props.imagePath || props.previewImage || '';
    const carouselJSON = props.carouselJSON || props.carouselJson || '';
    const carouselContent = props.caruoselContent || props.carouselContent || null;
    const contentJsonRaw = props.contentJson ?? props.contentJSON ?? '';
    const contentJson = typeof contentJsonRaw === 'string' ? contentJsonRaw : (contentJsonRaw != null ? JSON.stringify(contentJsonRaw) : '');
    const senderName = props.senderName || props.smssenderName || '';
    const previewSource = props.previewSource || (props.fromGallery ? PREVIEW_SOURCE.GALLERY : PREVIEW_SOURCE.AUTHORING);
    const sourceConfig = getPreviewSourceConfig(previewSource);
    const fromGallery = !!props.fromGallery || sourceConfig.isListing;

    return {
        ...props,
        channel,
        schedule,
        content,
        header,
        footer,
        headerContent,
        previewImage,
        imagePath,
        carouselJSON,
        carouselContent,
        contentJson,
        senderName,
        smsContent: props.smsContent ?? content,
        isCarousel: !!props.isCarousel,
        fromGallery,
        previewSource,
        sourceConfig,
        mdcType: props.mdcType ?? '',
        customRenderContent: props.customRenderContent,
        customRenderClassName: props.customRenderClassName ?? 'mb15',
        mediaType: props.mediaType ?? '',
        locationDetails: props.locationDetails ?? undefined,
        locationName: props.locationName,
        locationAddress: props.locationAddress,
    };
};

// ─── URL / Media helpers ────────────────────────────────────────────────────
export const isYoutubeOrVimeoUrl = (url) => {
    if (!url) return false;
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i;
    const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\//i;
    return youtubeRegex.test(url) || vimeoRegex.test(url);
};

export const toEmbedUrl = (url) => {
    if (!url) return url;
    try {
        const ytMatchShort = url.match(/youtu\.be\/([^?&#]+)/i);
        const ytMatchLong = url.match(/[?&]v=([^?&#]+)/i);
        if (ytMatchShort || ytMatchLong) {
            const id = (ytMatchShort ? ytMatchShort[1] : ytMatchLong[1]).trim();
            return `https://www.youtube.com/embed/${id}`;
        }
        const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
        if (vimeoMatch) {
            const id = vimeoMatch[1].trim();
            return `https://player.vimeo.com/video/${id}`;
        }
    } catch (e) {
        return url;
    }
    return url;
};

const VIDEO_EXT = ['mp4', 'mp3', 'wav', 'webm', 'ogg'];
const IMAGE_EXT = ['jpg', 'jpeg', 'gif', 'png', 'bmp', 'webp'];
const DOC_EXT = ['pdf', 'doc'];

export const getUrlFormat = (previewImage) => {
    if (!previewImage) return '';
    if (typeof previewImage === 'string' && previewImage.startsWith('data:image')) return 'image';
    // Listing APIs sometimes send bare JPEG/PNG base64 without a `data:` prefix.
    if (typeof previewImage === 'string') {
        const compact = previewImage.replace(/\s/g, '');
        if (
            /^[A-Za-z0-9+/=]+$/.test(compact) &&
            compact.length >= 24 &&
            (compact.startsWith('/9j') || compact.startsWith('iVBOR'))
        ) {
            return 'image';
        }
    }
    if (isYoutubeOrVimeoUrl(previewImage)) return 'embed';
    const ext = (previewImage.match(/\.([0-9a-z]+)(?:[?#]|$)/i)?.[1] || '').toLowerCase();
    if (VIDEO_EXT.includes(ext)) return 'video';
    if (IMAGE_EXT.includes(ext)) return 'image';
    if (DOC_EXT.includes(ext)) return 'doc';
    return '';
};

export const getMediaFormatFromUrl = (url) => {
    if (!url || typeof url !== 'string') return '';
    if (url.startsWith('data:image')) return 'image';
    return getUrlFormat(url);
};

export const getCarouselUrlFormat = (mediaValue) => {
    if (!mediaValue) return 'image';
    if (isYoutubeOrVimeoUrl(mediaValue)) return 'embed';
    const ext = (mediaValue.split('.').pop() || '').toLowerCase();
    if (['mp4', 'webm', 'ogg'].includes(ext)) return 'video';
    return 'image';
};

// ─── Channel config (date format, etc.) ─────────────────────────────────────
export const CHANNEL_CONFIG = {
    [CHANNELS.SMS]: { dateFormat: 'dateTime', label: 'SMS' },
    [CHANNELS.MMS]: { dateFormat: 'static', dateLabel: 'Today, 12:05 PM', label: 'SMS' },
    [CHANNELS.LINE]: { dateFormat: 'today', dateLabel: 'Today', label: null },
    [CHANNELS.VIBER]: { dateFormat: 'static', dateLabel: 'Today, 12:05 PM', label: 'SMS' },
    [CHANNELS.RCS]: { dateFormat: 'dateTime', label: null },
    [CHANNELS.WHATSAPP]: { dateFormat: 'dateTime', label: null },
};
