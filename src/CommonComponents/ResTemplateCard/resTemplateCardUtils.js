/** Default iframe CSS injected into HTML email/push previews — disables interaction in card thumbnails. */
export const PREVIEW_IFRAME_CSS_EMAIL = `
    <style>
        table.main-column.social-table td { font-size: 0 !important; }
        table.main-column.social-table td table.pc-w620-width-auto {
            display: inline-block !important;
            width: auto !important;
            vertical-align: middle !important;
        }
        a, button, input, textarea, select, img {
            pointer-events: none !important;
            cursor: default !important;
        }
    </style>
`;

/** Push/landing preview — hides scrollbars and disables interaction. */
export const PREVIEW_IFRAME_CSS_PUSH = `
    <style>
        ::-webkit-scrollbar { display: none !important; }
        body {
            -ms-overflow-style: none !important;
            scrollbar-width: none !important;
        }
        a, button, input, textarea, select, img {
            pointer-events: none !important;
            cursor: default !important;
        }
    </style>
`;

/** Communication gallery card — scaled iframe with overflow lock. */
export const PREVIEW_IFRAME_CSS_COMMUNICATION = `
    <style>
        table.main-column.social-table td { font-size: 0 !important; }
        table.main-column.social-table td table.pc-w620-width-auto {
            display: inline-block !important;
            width: auto !important;
            vertical-align: middle !important;
        }
        a, button, input, textarea, select, img {
            pointer-events: none !important;
            cursor: default !important;
        }
        html { height: auto !important; overflow: hidden !important; }
        body { margin: 0; padding: 0; height: auto !important; overflow: hidden !important; }
    </style>
`;

const PREVIEW_CSS_BY_MODE = {
    email: PREVIEW_IFRAME_CSS_EMAIL,
    push: PREVIEW_IFRAME_CSS_PUSH,
    communication: PREVIEW_IFRAME_CSS_COMMUNICATION,
};

/**
 * Injects preview-safe CSS into HTML before rendering inside an iframe srcDoc.
 * Returns empty string when html is missing or invalid.
 */
export const injectPreviewCss = (html, mode = 'email') => {
    if (!html || typeof html !== 'string') return '';
    const css = PREVIEW_CSS_BY_MODE[mode] || PREVIEW_IFRAME_CSS_EMAIL;
    if (html.includes('</head>')) {
        return html.replace('</head>', `${css}</head>`);
    }
    return `${css}${html}`;
};

/**
 * Attempts to unwrap JSON-stringified HTML/content values from API payloads.
 * Returns the original value when parsing fails or value is not stringified JSON.
 */
export const parseStringifiedContent = (content) => {
    if (typeof content !== 'string' || !content.trim()) return content;

    const trimmed = content.trim();
    const looksLikeJson =
        trimmed.startsWith('{') ||
        trimmed.startsWith('[') ||
        (trimmed.startsWith('"') && trimmed.endsWith('"'));

    if (!looksLikeJson) return content;

    try {
        const parsed = JSON.parse(trimmed);
        return typeof parsed === 'string' ? parsed : content;
    } catch {
        return content;
    }
};

/** True when content is non-empty HTML markup. */
export const isHtmlContent = (content) =>
    typeof content === 'string' && content.trim().startsWith('<');

const escapeHtml = (value) =>
    String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

/** Plain text → scrollable HTML block for gallery `glb-text` / carousel text panel. */
export const formatGalleryTextHtml = (text) => {
    const normalized = String(text ?? '').trim();
    if (!normalized) return '';

    return `<p class="res-template-card__carousel-text-plain" style="margin:0;font-size:13px;line-height:1.45;white-space:pre-wrap;color:#333">${escapeHtml(normalized)}</p>`;
};

/** Bare JPEG/PNG base64 from listing APIs (`/9j/…`, `iVBOR…`). */
export const looksLikeGalleryBase64Thumbnail = (value) => {
    if (value == null) return false;
    const compact = String(value).trim().replace(/\s/g, '');
    if (!compact || compact.startsWith('<') || compact.startsWith('{') || compact.startsWith('[')) {
        return false;
    }

    const isB64Alphabet = /^[A-Za-z0-9+/=]+$/.test(compact);
    return (
        isB64Alphabet &&
        !compact.includes('://') &&
        (compact.length >= 80 ||
            (compact.length >= 24 && (compact.startsWith('/9j') || compact.startsWith('iVBOR'))))
    );
};

/** Text body from API — not HTML, JSON, or image base64. */
export const isGalleryPlainTextContent = (value) => {
    if (value == null) return false;
    const trimmed = String(value).trim();
    if (!trimmed) return false;
    if (isHtmlContent(trimmed)) return false;
    if (looksLikeGalleryBase64Thumbnail(trimmed)) return false;
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) return false;
    return true;
};

const resolveStringifiedMediaUrl = (value) => {
    if (value == null) return '';
    const normalized = String(value).trim();
    if (!normalized) return '';
    if (/^https?:\/\//i.test(normalized) || normalized.startsWith('data:')) return normalized;

    if (
        (normalized.startsWith('[') && normalized.endsWith(']')) ||
        (normalized.startsWith('{') && normalized.endsWith('}'))
    ) {
        try {
            const parsed = JSON.parse(normalized);
            if (Array.isArray(parsed)) {
                const hit = parsed.find((entry) => {
                    const candidate = String(entry ?? '').trim();
                    return candidate && (/^https?:\/\//i.test(candidate) || candidate.startsWith('data:'));
                });
                return hit != null ? String(hit).trim() : '';
            }
        } catch {
            return '';
        }
    }

    return '';
};

/**
 * Listing gallery media — mirrors Communication `resolveGalleryBannerSrc`.
 * Prefers `imagePath` URL, then bare base64 in `contentThumbnail`.
 */
export const resolveGalleryListingMediaSrc = (imagePath = '', contentThumbnail = '') => {
    const fromPath = resolveStringifiedMediaUrl(imagePath);
    if (fromPath) return fromPath;

    const thumb = String(contentThumbnail ?? '').trim();
    if (!thumb) return '';

    if (looksLikeGalleryBase64Thumbnail(thumb)) {
        const mime = thumb.replace(/\s/g, '').startsWith('iVBOR') ? 'image/png' : 'image/jpeg';
        return `data:${mime};base64,${thumb.replace(/\s/g, '')}`;
    }

    if (/^https?:\/\//i.test(thumb) || thumb.startsWith('data:') || thumb.startsWith('/')) {
        return thumb;
    }

    return '';
};

const mapGalleryDeliveryMethodLabel = (deliveryMethod) => {
    if (deliveryMethod === 'S') return 'Single dimension';
    if (deliveryMethod === 'M') return 'Multi dimension';
    return 'Event trigger';
};

const mapGalleryStatusAccentClass = (statusId) => {
    const statusMap = {
        5: 'inprogress',
        6: 'drafted',
        7: 'scheduled',
        8: 'scheduled',
        9: 'completed',
        12: 'alerted',
        20: 'inprogress',
        26: 'alerted',
        52: 'alerted',
    };

    return statusMap[Number(statusId)] || 'scheduled';
};

/**
 * One API `campaigns[]` row → carousel slide (image + bound text).
 */
export const mapGalleryCampaignToCarouselSlide = (campaign = {}, options = {}) => {
    const { channelId } = options;
    const imageSrc = resolveGalleryListingMediaSrc(campaign.imagePath, campaign.contentThumbnail);
    const textSource =
        (isGalleryPlainTextContent(campaign.campaigncontent) && campaign.campaigncontent) ||
        (isGalleryPlainTextContent(campaign.contentThumbnail) && !imageSrc && campaign.contentThumbnail) ||
        '';

    const slide = {
        key: campaign.blastScheduleGuid || campaign.campaignGuid,
        imageSrc: imageSrc || undefined,
        imageAlt: campaign.campaignName || 'Campaign preview',
    };

    if (isHtmlContent(campaign.campaigncontent)) {
        slide.html = campaign.campaigncontent;
        slide.previewMode = channelId === 8 ? 'push' : 'communication';
    } else if (textSource) {
        slide.text = formatGalleryTextHtml(textSource);
    }

    if (!slide.imageSrc && !slide.text && !slide.html) {
        return null;
    }

    return slide;
};

/**
 * Communication listing `items[]` entry → `carouselSlides` for ResTemplateCard.
 */
export const buildCommunicationGalleryCarouselSlides = (listItem = {}) => {
    const campaigns = Array.isArray(listItem.campaigns) ? listItem.campaigns : [];

    return campaigns
        .map((campaign) =>
            mapGalleryCampaignToCarouselSlide(campaign, { channelId: listItem.channelId }),
        )
        .filter(Boolean);
};

/**
 * Builds ResTemplateCardBody props from a Communication gallery API list row.
 */
export const buildCommunicationGalleryBodyProps = (listItem = {}) => {
    const carouselSlides = buildCommunicationGalleryCarouselSlides(listItem);
    const firstCampaign = listItem.campaigns?.[0] || {};
    const templateName = listItem.campaignName || '';
    const previewMode = listItem.channelId === 8 ? 'push' : 'communication';

    if (carouselSlides.length) {
        return {
            contentVariant: 'carousel',
            slides: carouselSlides,
            templateName,
        };
    }

    if (isHtmlContent(firstCampaign.campaigncontent)) {
        return {
            contentVariant: 'iframe',
            html: firstCampaign.campaigncontent,
            templateName,
            previewMode,
        };
    }

    const imageSrc = resolveGalleryListingMediaSrc(
        firstCampaign.imagePath,
        firstCampaign.contentThumbnail,
    );

    if (imageSrc) {
        return {
            contentVariant: 'image',
            thumbnailPath: firstCampaign.imagePath || imageSrc,
            contentThumbnail: looksLikeGalleryBase64Thumbnail(firstCampaign.contentThumbnail)
                ? firstCampaign.contentThumbnail
                : '',
            templateName,
            previewMode,
        };
    }

    const textSource =
        (isGalleryPlainTextContent(firstCampaign.campaigncontent) && firstCampaign.campaigncontent) ||
        (isGalleryPlainTextContent(firstCampaign.contentThumbnail) && firstCampaign.contentThumbnail) ||
        '';

    return {
        contentVariant: 'text',
        text: textSource,
        templateName,
    };
};

/**
 * Maps Communication gallery API list row → ResTemplateCard shell props + bodyConfig.
 */
export const mapCommunicationGalleryItemToTemplateCardProps = (listItem = {}, options = {}) => {
    const {
        col = 3,
        variant = 'gallery',
        showInfo = false,
        infoMetrics = null,
    } = options;

    const info = showInfo
        ? {
              topItems: [
                  { label: 'Delivery method', value: mapGalleryDeliveryMethodLabel(listItem.deliveryMethod) },
                  { label: 'Communication type', value: listItem.attributeName || '—' },
              ],
              metrics: infoMetrics || [
                  { label: 'Total audience', value: 'NA' },
                  { label: 'Reach', value: 'NA' },
                  { label: 'Engagement', value: 'NA' },
                  { label: 'Conversion', value: 'NA' },
              ],
          }
        : undefined;

    return {
        col,
        variant,
        title: listItem.campaignName,
        statusClass: mapGalleryStatusAccentClass(listItem.statusId),
        createdDate: listItem.createdDate,
        bodyConfig: buildCommunicationGalleryBodyProps(listItem),
        info,
    };
};

/**
 * Resolves a displayable image src from thumbnailPath / contentThumbnail fields.
 * Handles absolute URLs, data URLs, base64 blobs, and run.resulticks.com paths.
 */
export const resolveTemplateThumbnailSrc = ({
    thumbnailPath = '',
    contentThumbnail = '',
    preferRemotePath = false,
    useRawThumbnailPath = false,
} = {}) => {
    const normalizedPath = (thumbnailPath || '').trim();

    if (normalizedPath && useRawThumbnailPath) {
        return normalizedPath;
    }

    if (normalizedPath) {
        if (
            /^https?:\/\//i.test(normalizedPath) ||
            normalizedPath.startsWith('data:') ||
            normalizedPath.startsWith('/')
        ) {
            if (preferRemotePath && contentThumbnail) {
                return `data:image/png;base64,${contentThumbnail}`;
            }
            return normalizedPath;
        }

        if (!preferRemotePath) {
            return `data:image/png;base64,${contentThumbnail ?? normalizedPath}`;
        }

        const sanitizedPath = normalizedPath.replace(/^\/+/, '');
        return `https://run.resulticks.com/${sanitizedPath}`;
    }

    if (contentThumbnail) {
        if (looksLikeGalleryBase64Thumbnail(contentThumbnail)) {
            const compact = String(contentThumbnail).trim().replace(/\s/g, '');
            const mime = compact.startsWith('iVBOR') ? 'image/png' : 'image/jpeg';
            return `data:${mime};base64,${compact}`;
        }

        return `data:image/png;base64,${contentThumbnail}`;
    }

    return '';
};

/** Scroll animation threshold for tall thumbnail images (px). */
export const TEMPLATE_CARD_IMAGE_SCROLL_THRESHOLD = 240;

/** Fixed card heights for standard gallery grid columns. */
export const TEMPLATE_CARD_HEIGHT_COL_3 = 400;
export const TEMPLATE_CARD_HEIGHT_COL_4 = 400;

/** Bootstrap `col` (sm) → card shell height (px). */
export const TEMPLATE_CARD_HEIGHT_BY_COL = {
    3: TEMPLATE_CARD_HEIGHT_COL_3,
    4: TEMPLATE_CARD_HEIGHT_COL_4,
};

/** Cards per Bootstrap row (12-grid). */
export const TEMPLATE_CARD_CARDS_PER_ROW_BY_COL = {
    3: 4,
    4: 3,
};

export const TEMPLATE_CARD_DEFAULT_COL = 3;

export const TEMPLATE_CARD_DEFAULT_PADDING = 19;

export const getTemplateCardColClassName = (col = TEMPLATE_CARD_DEFAULT_COL) =>
    `res-template-card--col-${col}`;

/**
 * Card height from Bootstrap `col` only; optional `cardHeight` prop overrides for legacy callers.
 */
export const resolveTemplateCardHeight = ({ col = TEMPLATE_CARD_DEFAULT_COL, cardHeight } = {}) => {
    if (cardHeight != null) return cardHeight;

    const normalizedCol = Number(col);
    if (TEMPLATE_CARD_HEIGHT_BY_COL[normalizedCol] != null) {
        return TEMPLATE_CARD_HEIGHT_BY_COL[normalizedCol];
    }

    return TEMPLATE_CARD_HEIGHT_BY_COL[TEMPLATE_CARD_DEFAULT_COL];
};

/** Behaviour flags per variant — height/padding come from `col` + props, not class names. */
export const TEMPLATE_CARD_VARIANT_CONFIG = {
    gallery: {
        showStatusAccent: true,
    },
    communication: {
        showStatusAccent: false,
    },
};

export const resolveTemplateCardPadding = ({ cardPadding } = {}) =>
    cardPadding ?? TEMPLATE_CARD_DEFAULT_PADDING;

/**
 * Resolves whether the bottom status accent bar is visible.
 * showStatusAccent defaults to true; hideBottomAccent is a legacy inverse alias.
 */
export const resolveShowStatusAccent = ({
    showStatusAccent,
    hideBottomAccent,
    variant = 'gallery',
} = {}) => {
    if (hideBottomAccent != null) return !hideBottomAccent;
    if (showStatusAccent != null) return showStatusAccent;

    const preset = TEMPLATE_CARD_VARIANT_CONFIG[variant] || TEMPLATE_CARD_VARIANT_CONFIG.gallery;
    return preset.showStatusAccent ?? true;
};

const PREVIEW_SCALE_BY_MODE = {
    email: 0.4,
    push: 0.4,
    communication: 0.5,
};

/**
 * Builds CSS custom properties for ResTemplateCard root — single source for sizing and preview scale.
 * Props override variant presets; merged into inline style on the card root.
 */
export const buildTemplateCardCssVars = ({
    variant = 'gallery',
    col = 3,
    cardHeight,
    cardPadding,
    cardMinHeight = 0,
    showStatusAccent,
    hideBottomAccent,
} = {}) => {
    const resolvedHeight = resolveTemplateCardHeight({ col, cardHeight });
    const resolvedPadding = resolveTemplateCardPadding({ cardPadding });
    const resolvedShowStatusAccent = resolveShowStatusAccent({
        showStatusAccent,
        hideBottomAccent,
        variant,
    });
    const previewScale =
        variant === 'communication'
            ? PREVIEW_SCALE_BY_MODE.communication
            : PREVIEW_SCALE_BY_MODE.email;

    return {
        '--rtc-col': String(col),
        '--rtc-card-height': `${resolvedHeight}px`,
        '--rtc-card-min-height': cardMinHeight ? `${cardMinHeight}px` : '0px',
        '--rtc-card-padding': `${resolvedPadding}px`,
        '--rtc-card-margin-bottom': '0px',
        '--rtc-header-gap': '10px',
        '--rtc-title-gap': '8px',
        '--rtc-accent-display': resolvedShowStatusAccent ? 'block' : 'none',
        '--rtc-preview-scale': String(previewScale),
        '--rtc-preview-iframe-width': '250%',
        '--rtc-preview-iframe-height': '700px',
        '--rtc-preview-comm-scale': String(PREVIEW_SCALE_BY_MODE.communication),
        '--rtc-preview-comm-size': '200%',
        '--rtc-menu-offset': '-8px',
        '--rtc-info-trigger-bottom': '13px',
        '--rtc-info-trigger-right': '10px',
    };
};
