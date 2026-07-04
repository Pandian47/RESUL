/**
 * Social media validation aligned with the RESUL Social Media Validation spec
 * (Facebook, Instagram, LinkedIn feed/story/reel/carousel/document/article).
 * Twitter keeps platform-level defaults where no post-type row applies.
 * Pinterest uses post-type rows (`pinterest_*`) plus platform fallbacks.
 */
import { getPostTypeDurationInfoValue } from './constant';

export const SOCIAL_MEDIA_PLATFORMS = {
    FACEBOOK: 'facebook',
    TWITTER: 'twitter',
    INSTAGRAM: 'instagram',
    LINKEDIN: 'linkedIn',
    PINTEREST: 'pinterest',
};

/** Base text limits; Facebook caption uses doc value for all FB post types via getTextLimit. */
export const TEXT_LIMITS = {
    [SOCIAL_MEDIA_PLATFORMS.FACEBOOK]: {
        postName: 100,
        textLength: 63206,
        postLink: 2000,
        trendingTopics: 100,
    },
    [SOCIAL_MEDIA_PLATFORMS.TWITTER]: {
        postName: 100,
        textLength: 280,
        textLengthPremiumMin: 4000,
        textLengthPremiumMax: 25000,
        postLink: 2000,
        trendingTopics: 100,
    },
    [SOCIAL_MEDIA_PLATFORMS.INSTAGRAM]: {
        postName: 100,
        textLength: 2200,
        postLink: 2000,
        trendingTopics: 100,
    },
    [SOCIAL_MEDIA_PLATFORMS.LINKEDIN]: {
        postName: 100,
        textLength: 3000,
        postLink: 2000,
        trendingTopics: 100,
    },
    [SOCIAL_MEDIA_PLATFORMS.PINTEREST]: {
        postName: 100,
        textLength: 500,
        postLink: 2000,
        trendingTopics: 100,
    },
};

/** LinkedIn article: body character limit (title uses post name field, max 150 in UI). */
export const LINKEDIN_ARTICLE_BODY_MAX = 110000;

/**
 * Image rules keyed by `postType.id` (Create Communication social post cards).
 */
export const SOCIAL_POST_TYPE_IMAGE_SPECS = {
    facebook_single_image: {
        aspectRatios: {
            landscape: { ratio: '1.91:1', width: 1200, height: 630, isDefault: true },
            square: { ratio: '1:1', width: 1080, height: 1080, isRecommended: true },
            portrait: { ratio: '4:5', width: 1080, height: 1350 },
        },
        maxFileSize: 30 * 1024 * 1024,
        formats: ['JPG','PNG'],
        formatExtensions: ['.jpg','.png'],
    },
    facebook_multi_image: {
        aspectRatios: {
            square: { ratio: '1:1', width: 1080, height: 1080, isDefault: true },
            portrait: { ratio: '4:5', width: 1080, height: 1350 },
            // landscape: { ratio: '1.91:1', width: 1200, height: 630 },
        },
        uniformMandatory: true, // All images in carousel must have same aspect ratio (v2 change)
        maxFileSize: 30 * 1024 * 1024,
        formats: ['JPG','PNG'],
        formatExtensions: ['.jpg','.png'],
    },
    facebook_story: {
        aspectRatios: {
            portrait: { ratio: '9:16', width: 1080, height: 1920 },
        },
        maxFileSize: 4 * 1024 * 1024 * 1024,
        formats: ['JPG','PNG'],
        formatExtensions: ['.jpg','.png'],
    },
    instagram_single_image: {
        aspectRatios: {
            square: { ratio: '1:1', width: 1080, height: 1080 },
            portrait: { ratio: '4:5', width: 1080, height: 1350 },
        },
        maxFileSize: 30 * 1024 * 1024,
        formats: ['JPG', 'PNG'],
        formatExtensions: ['.jpg', '.png'],
    },
    instagram_carousel: {
        aspectRatios: {
            square: { ratio: '1:1', width: 1080, height: 1080 },
            portrait: { ratio: '4:5', width: 1080, height: 1350 },
        },
        uniformMandatory: true, // All slides must have same aspect ratio (v2 change)
        maxFileSize: 30 * 1024 * 1024,
        formats: ['JPG', 'PNG', 'MP4'], // Now supports video (v2 change)
        formatExtensions: ['.jpg','.png', '.mp4'],
    },
    instagram_story: {
        aspectRatios: {
            portrait: { ratio: '9:16', width: 1080, height: 1920 },
        },
        maxFileSize: 4 * 1024 * 1024 * 1024,
        formats: ['JPG','PNG'],
        formatExtensions: ['.jpg','.png'],
    },
    linkedin_single_image: {
         aspectRatios: {
            square: { ratio: '1:1', width: 1080, height: 1080, isDefault: true },
            portrait: { ratio: '4:5', width: 1080, height: 1350 },
            landscape: { ratio: '1.91:1', width: 1200, height: 627 },
        },
        maxFileSize: 10 * 1024 * 1024,
        formats: ['JPG','PNG', 'GIF'],
        formatExtensions: ['.jpg','.png', '.gif'],
    },
    linkedin_multi_image: {
        aspectRatios: {
            square: { ratio: '1:1', width: 1080, height: 1080, isDefault: true },
            portrait: { ratio: '4:5', width: 1080, height: 1350 },
        },
        uniformMandatory: true, // All images must have same aspect ratio (v2 change)
        maxFileSize: 10 * 1024 * 1024,
        formats: ['JPG','PNG'],
        formatExtensions: ['.jpg', '.png'],
    },
    linkedin_article: {
        aspectRatios: {
            landscape: { ratio: '1.91:1', width: 1200, height: 627 },
        },
        maxFileSize: 5 * 1024 * 1024,
        formats: ['JPG','PNG'],
        formatExtensions: ['.jpg','.png'],
    },
    /** Standard Pin — enforce 2:3 to avoid feed cropping. */
    pinterest_single_pin: {
        aspectRatios: {
            portrait: { ratio: '2:3', width: 1000, height: 1500, minWidth: 600 },
        },
        maxFileSize: 20 * 1024 * 1024,
        formats: ['JPG','PNG'],
        formatExtensions: ['.jpg','.png'],
    },
    /** Carousel Pin — same per-slide rules as single pin (2–5 slides enforced in UI). */
    pinterest_carousel_pin: {
        aspectRatios: {
            portrait: { ratio: '2:3', width: 1000, height: 1500, minWidth: 600 },
        },
        maxFileSize: 20 * 1024 * 1024,
        formats: ['JPG','PNG'],
        formatExtensions: ['.jpg','.png'],
    },
};

/**
 * Video rules keyed by `postType.id`.
 */
export const SOCIAL_POST_TYPE_VIDEO_SPECS = {
    facebook_video: {
        aspectRatios: [
            { ratio: '16:9', description: 'Landscape' },
            { ratio: '1:1', description: 'Square' },
            { ratio: '9:16', description: 'Vertical' },
        ],
        resolution: {
            minShortSide: 720,
            minLongSide: 1280,
        },
        maxFileSize: 10 * 1024 * 1024 * 1024,
        formats: ['MP4', 'MOV'],
        formatExtensions: ['.mp4', '.mov'],
        duration: { min: 1, max: 240 * 60 },
        isSupported: true,
    },
    twitter_video: {
        aspectRatios: [
            { ratio: '16:9', description: 'Landscape' },
            { ratio: '1:1', description: 'Square' },
            { ratio: '4:5', description: 'Portrait' },
        ],
        resolution: {
            min: { width: 32, height: 32 },
            max: { width: 1920, height: 1200 },
        },
        frameRate: { min: 30, max: 60 },
        maxFileSize: 30 * 1024 * 1024,
        formats: ['MP4', 'MOV'],
        formatExtensions: ['.mp4', '.mov'],
        duration: {
            min: 0.5,
            max: 2 * 60 + 20,
        },
        isSupported: true,
    },
    instagram_reel: {
        aspectRatios: [{ ratio: '9:16', description: 'Vertical', width: 1080, height: 1920 }],
        maxFileSize: 1 * 1024 * 1024 * 1024,
        formats: ['MP4', 'MOV'],
        formatExtensions: ['.mp4', '.mov'],
        duration: { min: 3, max: 90 },
        isSupported: true,
    },
    instagram_story: {
        aspectRatios: [{ ratio: '9:16', description: 'Vertical', width: 1080, height: 1920 }],
        maxFileSize: 4 * 1024 * 1024 * 1024,
        formats: ['MP4'],
        formatExtensions: ['.mp4'],
        duration: { min: 0, max: 60 },
        isSupported: true,
    },
    /** Instagram carousel video slide (not the same size cap as images). */
    instagram_carousel: {
        aspectRatios: [
            { ratio: '1:1', description: 'Square', width: 1080, height: 1080 },
            { ratio: '4:5', description: 'Portrait', width: 1080, height: 1350 },
        ],
        maxFileSize: 30 * 1024 * 1024, // Per slide (v2 change: was 100MB, now 30MB per slide)
        maxFileSizeTotal: 100 * 1024 * 1024, // Total carousel (v2 change)
        formats: ['MP4'],
        formatExtensions: ['.mp4'],
        duration: { min: 3, max: 60 }, // Updated per v2 spec
        uniformMandatory: true, // All slides must have same aspect ratio
        isSupported: true,
    },
    linkedin_video: {
        aspectRatioRange: { min: 1 / 2.4, max: 2.4 },
        resolution: {
            min: { width: 256, height: 144 },
            max: { width: 4096, height: 2304 },
        },
        maxFileSize: 5 * 1024 * 1024 * 1024,
        formats: ['MP4', 'MOV'],
        formatExtensions: ['.mp4', '.mov'],
        duration: { min: 3, max: 10 * 60 },
        isSupported: true,
    },
    pinterest_video_pin: {
        aspectRatios: [
            { ratio: '2:3', description: 'Vertical pin' },
            { ratio: '1:1', description: 'Square' },
            { ratio: '9:16', description: 'Vertical' },
        ],
        resolution: {
            maxLongestEdge: 3840,
        },
        maxFileSize: 2 * 1024 * 1024 * 1024,
        formats: ['MP4', 'MOV', 'M4V'],
        formatExtensions: ['.mp4', '.mov', '.m4v'],
        duration: { min: 4, max: 15 * 60 },
        isSupported: true,
    },
};

export const INSTAGRAM_CAROUSEL_BATCH_VIDEO_UPLOAD_MAX_SIZE = 30 * 1024 * 1024;

/** RESUL upload API cap — modal label and client validation for single/multi image uploads. */
export const SOCIAL_PLATFORM_CLIENT_UPLOAD_MAX_BYTES = 30 * 1024 * 1024;

export const DOCUMENT_SPECS = {
    linkedin_pdf: {
        maxFileSize: 100 * 1024 * 1024,
        maxPages: 300,
        formats: ['PDF'],
        formatExtensions: ['.pdf'],
    },
};

/** Fallback image specs when no post-type card is selected (e.g. Twitter). */
export const IMAGE_SPECS = {
    [SOCIAL_MEDIA_PLATFORMS.FACEBOOK]: {
        aspectRatios: {
            landscape: { ratio: '1.91:1', width: 1200, height: 630 },
        },
        maxFileSize: 30 * 1024 * 1024,
        formats: ['JPG','PNG'],
        formatExtensions: ['.jpg','.png'],
        isRequired: false,
    },
    [SOCIAL_MEDIA_PLATFORMS.TWITTER]: {
        aspectRatios: {
            landscape: { ratio: '16:9', width: 1200, height: 627, min: { width: 600, height: 335 }, max: { width: 1600, height: 900 } },
            square: { ratio: '1:1', width: 1080, height: 1080 },
        },
        maxFileSize: 5 * 1024 * 1024,
        formats: ['JPG','PNG'],
        formatExtensions: ['.jpg','.png'],
        isRequired: false,
    },
    [SOCIAL_MEDIA_PLATFORMS.INSTAGRAM]: {
        aspectRatios: {
            square: { ratio: '1:1', width: 1080, height: 1080 },
            portrait: { ratio: '4:5', width: 1080, height: 1350 },
        },
        maxFileSize: 30 * 1024 * 1024,
        formats: ['JPG','PNG'],
        formatExtensions: ['.jpg','.png'],
        isRequired: true,
    },
    [SOCIAL_MEDIA_PLATFORMS.LINKEDIN]: {
        aspectRatios: {
            landscape: { ratio: '1.91:1', width: 1200, height: 627 },
            square: { ratio: '1:1', width: 1080, height: 1080 },
        },
        maxFileSize: 10 * 1024 * 1024,
        formats: ['JPG','PNG', 'GIF'],
        formatExtensions: ['.jpg','.png', '.gif'],
        isRequired: false,
    },
    [SOCIAL_MEDIA_PLATFORMS.PINTEREST]: {
        aspectRatios: {
            portrait: { ratio: '2:3', width: 1000, height: 1500, minWidth: 600 },
        },
        maxFileSize: 20 * 1024 * 1024,
        formats: ['JPG','PNG'],
        formatExtensions: ['.jpg','.png'],
        isRequired: false,
    },
};

/** Fallback video specs when no post-type row applies. */
export const VIDEO_SPECS = {
    [SOCIAL_MEDIA_PLATFORMS.FACEBOOK]: SOCIAL_POST_TYPE_VIDEO_SPECS.facebook_video,
    [SOCIAL_MEDIA_PLATFORMS.TWITTER]: SOCIAL_POST_TYPE_VIDEO_SPECS.twitter_video,
    [SOCIAL_MEDIA_PLATFORMS.INSTAGRAM]: SOCIAL_POST_TYPE_VIDEO_SPECS.instagram_reel,
    [SOCIAL_MEDIA_PLATFORMS.LINKEDIN]: SOCIAL_POST_TYPE_VIDEO_SPECS.linkedin_video,
    [SOCIAL_MEDIA_PLATFORMS.PINTEREST]: SOCIAL_POST_TYPE_VIDEO_SPECS.pinterest_video_pin,
};

const ASPECT_TOLERANCE = 0.05;

const mergeImageSpecsWithPlatformFlags = (baseSpecs, platform) => {
    const platformDefaults = IMAGE_SPECS[platform] || {};
    return {
        ...baseSpecs,
        isRequired: platformDefaults.isRequired,
    };
};

export const getImageSpecs = (platform, postType = null) => {
    const id = postType?.id;
    if (id && SOCIAL_POST_TYPE_IMAGE_SPECS[id]) {
        return mergeImageSpecsWithPlatformFlags(SOCIAL_POST_TYPE_IMAGE_SPECS[id], platform);
    }
    return IMAGE_SPECS[platform] || IMAGE_SPECS[SOCIAL_MEDIA_PLATFORMS.FACEBOOK];
};

export const getVideoSpecs = (platform, postType = null) => {
    const id = postType?.id;
    if (id && SOCIAL_POST_TYPE_VIDEO_SPECS[id]) {
        return SOCIAL_POST_TYPE_VIDEO_SPECS[id];
    }
    return VIDEO_SPECS[platform] || VIDEO_SPECS[SOCIAL_MEDIA_PLATFORMS.FACEBOOK];
};

export const getDocumentSpecs = (platform, postType = null) => {
    if (postType?.id === 'linkedin_pdf') {
        return DOCUMENT_SPECS.linkedin_pdf;
    }
    return {
        maxFileSize: getImageSpecs(platform, postType).maxFileSize,
        formats: ['PDF'],
        formatExtensions: ['.pdf'],
    };
};

export const getTextLimit = (platform, postType = null) => {
    if (platform === SOCIAL_MEDIA_PLATFORMS.FACEBOOK) {
        return TEXT_LIMITS[SOCIAL_MEDIA_PLATFORMS.FACEBOOK].textLength;
    }
    if (platform === SOCIAL_MEDIA_PLATFORMS.LINKEDIN && postType?.id === 'linkedin_article') {
        return LINKEDIN_ARTICLE_BODY_MAX;
    }
    return TEXT_LIMITS[platform]?.textLength || 2200;
};

export const isVideoSupported = (platform, postType = null) => {
    const specs = getVideoSpecs(platform, postType);
    return specs?.isSupported !== false;
};

export const isMediaRequired = (platform) => {
    const specs = IMAGE_SPECS[platform];
    return specs?.isRequired === true;
};

const ratioMatchesEntry = (wh, entry) => {
    const parts = String(entry.ratio).split(':').map(Number);
    if (parts.length !== 2 || !parts[1]) return false;
    const expected = parts[0] / parts[1];
    return Math.abs(wh - expected) / expected <= ASPECT_TOLERANCE;
};

export const validateImageAspectRatio = (width, height, platform, postType = null) => {
    const specs = getImageSpecs(platform, postType);
    const aspectRatio = width / height;
    const ratios = specs.aspectRatios;

    for (const [, value] of Object.entries(ratios)) {
        const expectedRatio = value.width / value.height;
        if (Math.abs(aspectRatio - expectedRatio) / expectedRatio <= ASPECT_TOLERANCE) {
            if (value.minWidth != null && width < value.minWidth) {
                return {
                    isValid: false,
                    message: `Image width must be at least ${value.minWidth}px (current: ${width}px)`,
                };
            }
            return { isValid: true, message: '' };
        }
    }

    const dimensionsList = Object.entries(ratios).map(([key, value]) => {
        const label = key.charAt(0).toUpperCase() + key.slice(1);
        const ratioPart = value.ratio ? `${value.ratio} ` : '';
        return `${label} ${ratioPart}(~${value.width}×${value.height}px)`;
    }).join(' or ');

    const minWidths = [
        ...new Set(
            Object.values(ratios)
                .map((v) => v.minWidth)
                .filter((w) => w != null),
        ),
    ];
    const minWidthNote =
        minWidths.length > 0
            ? ` After the image matches that proportion, its width must be at least ${Math.min(...minWidths)}px.`
            : '';

    return {
        isValid: false,
        message: `${width}×${height}px is not a supported aspect ratio for ${getPlatformDisplayName(platform)}. Use ${dimensionsList}.${minWidthNote}`,
    };
};

export const validateImageFileSize = (fileSize, platform, postType = null) => {
    const specs = getImageSpecs(platform, postType);
    const maxSize = specs.maxFileSize;

    if (fileSize > maxSize) {
        const maxSizeMB = maxSize >= 1024 * 1024 * 1024
            ? `${Math.round(maxSize / (1024 * 1024 * 1024))} GB`
            : `${Math.round(maxSize / (1024 * 1024))} MB`;
        const actualSizeMB = Math.round(fileSize / (1024 * 1024));
        return {
            isValid: false,
            message: `${getPlatformDisplayName(platform)} image size max ${maxSizeMB}. Current: ${actualSizeMB} MB`,
        };
    }

    return { isValid: true, message: '' };
};

export const validateImageFormat = (fileName, platform, postType = null) => {
    const specs = getImageSpecs(platform, postType);
    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));

    if (!specs.formatExtensions.includes(extension)) {
        return {
            isValid: false,
            message: `${getPlatformDisplayName(platform)} supports ${specs.formats.join(', ')} formats only`,
        };
    }

    return { isValid: true, message: '' };
};

export const validateVideoFileSize = (fileSize, platform, postType = null) => {
    const specs = getVideoSpecs(platform, postType);
    const maxSize = specs.maxFileSize;
    const minSize = specs.minFileSize;
    const toGbLabel = (bytes) => `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;

    if (minSize && fileSize < minSize) {
        return {
            isValid: false,
            message: `${getPlatformDisplayName(platform)} video size min ${toGbLabel(minSize)}`,
        };
    }

    if (fileSize > maxSize) {
        return {
            isValid: false,
            message: `${getPlatformDisplayName(platform)} video size max ${toGbLabel(maxSize)}`,
        };
    }

    return { isValid: true, message: '' };
};

export const validateVideoFormat = (fileName, platform, postType = null) => {
    const specs = getVideoSpecs(platform, postType);
    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));

    if (!specs.formatExtensions.includes(extension)) {
        return {
            isValid: false,
            message: `${getPlatformDisplayName(platform)} supports ${specs.formats.join(', ')} video formats only`,
        };
    }

    return { isValid: true, message: '' };
};

/**
 * Read width/height/duration (seconds) from a temporary HTMLVideoElement.
 * Long files may report `duration === Infinity` until more data is parsed; we wait briefly for `durationchange` / `loadeddata`.
 * @param {string} src — blob:, data:, or https: URL
 * @param {{ revokeIfBlobUrl?: boolean; maxWaitMs?: number }} [opts]
 * @returns {Promise<{ w: number; h: number; d: number } | null>} `null` on load error; `d` may be 0 if still unknown after wait.
 */
export const probeVideoForSocialValidation = (src, opts = {}) =>
    new Promise((resolve) => {
        const { revokeIfBlobUrl = false, maxWaitMs = 15000 } = opts;
        const v = document.createElement('video');
        v.preload = 'metadata';
        v.muted = true;
        let settled = false;
        let timeoutId = 0;

        const revoke = () => {
            if (revokeIfBlobUrl && typeof src === 'string' && src.startsWith('blob:')) {
                URL.revokeObjectURL(src);
            }
        };

        const cleanup = (timeoutId) => {
            clearTimeout(timeoutId);
            v.removeEventListener('durationchange', onDurationChange);
            v.removeEventListener('loadeddata', onLoadedData);
        };

        const finish = (payload, timeoutId) => {
            if (settled) return;
            settled = true;
            cleanup(timeoutId);
            revoke();
            resolve(payload);
        };

        const tryEmit = (timeoutId) => {
            const w = v.videoWidth;
            const h = v.videoHeight;
            const dur = v.duration;
            if (!w || !h) return false;
            if (!Number.isFinite(dur) || dur <= 0) return false;
            finish({ w, h, d: dur }, timeoutId);
            return true;
        };

        const onDurationChange = () => {
            if (settled) return;
            tryEmit(timeoutId);
        };
        const onLoadedData = () => {
            if (settled) return;
            tryEmit(timeoutId);
        };

        v.onloadedmetadata = () => {
            if (tryEmit(timeoutId)) return;
            v.addEventListener('durationchange', onDurationChange);
            v.addEventListener('loadeddata', onLoadedData);
            timeoutId = window.setTimeout(() => {
                if (settled) return;
                const w = v.videoWidth;
                const h = v.videoHeight;
                const dur = v.duration;
                const d = Number.isFinite(dur) && !Number.isNaN(dur) && dur > 0 ? dur : 0;
                if (w && h) {
                    finish({ w, h, d }, timeoutId);
                } else {
                    finish(null, timeoutId);
                }
            }, maxWaitMs);
        };

        v.onerror = () => {
            finish(null, timeoutId);
        };

        v.src = src;
    });

const formatDurationToken = (seconds) => {
    if (seconds == null || !Number.isFinite(seconds)) return '';
    if (seconds < 60 || seconds % 60 !== 0) {
        return Number.isInteger(seconds) ? `${seconds} sec` : `${seconds.toFixed(1)} sec`;
    }
    if (seconds % 60 === 0) {
        const minutes = seconds / 60;
        return minutes === 1 ? '1 min' : `${minutes} min`;
    }
    return `${seconds} sec`;
};

const formatDurationRangeLabel = (minSec, maxSec) => {
    const min = formatDurationToken(minSec);
    const max = formatDurationToken(maxSec);
    if (min.endsWith(' sec') && max.endsWith(' sec')) {
        return `${min.replace(' sec', '')}-${max}`;
    }
    if (min && max) return `${min}-${max}`;
    return max || min || '';
};

export const validateVideoDuration = (duration, platform, postType = null) => {
    const specs = getVideoSpecs(platform, postType);
    const durationRangeLabel = formatDurationRangeLabel(specs.duration?.min, specs.duration?.max);
    const durationInfoLabel = getPostTypeDurationInfoValue(postType) || durationRangeLabel;

    if (
        (specs.duration?.min != null || specs.duration?.max != null) &&
        (!Number.isFinite(duration) || Number.isNaN(duration))
    ) {
        return {
            isValid: false,
            message: `${getPlatformDisplayName(platform)} could not determine video duration${durationInfoLabel ? ` (required: ${durationInfoLabel})` : ''
                }`,
        };
    }

    if ((specs.duration?.min != null && duration < specs.duration.min) || (specs.duration?.max != null && duration > specs.duration.max)) {
        return {
            isValid: false,
            message: `${getPlatformDisplayName(platform)} video duration must be ${durationInfoLabel}`,
        };
    }

    return { isValid: true, message: '' };
};

/**
 * Resolution + aspect checks after video metadata is available (HTMLVideoElement).
 */
export const validateSocialPostVideoMetadata = (width, height, durationSec, platform, postType = null) => {
    const specs = getVideoSpecs(platform, postType);
    if (!specs?.isSupported) {
        return { isValid: true, message: '' };
    }

    const dur = validateVideoDuration(durationSec, platform, postType);
    if (!dur.isValid) {
        return dur;
    }

    if (!width || !height) {
        return {
            isValid: false,
            message: `${getPlatformDisplayName(platform)} could not read video dimensions`,
        };
    }

    const wh = width / height;

    if (specs.aspectRatioRange) {
        const { min, max } = specs.aspectRatioRange;
        if (wh < min - 1e-6 || wh > max + 1e-6) {
            return {
                isValid: false,
                message: `${getPlatformDisplayName(platform)} video aspect ratio must be between 1:2.4 and 2.4:1`,
            };
        }
        const rw = specs.resolution;
        if (rw?.min && rw?.max) {
            if (width < rw.min.width || height < rw.min.height || width > rw.max.width || height > rw.max.height) {
                return {
                    isValid: false,
                    message: `${getPlatformDisplayName(platform)} video resolution must be within 256×144 to 4096×2304 px`,
                };
            }
        }
        return { isValid: true, message: '' };
    }

    if (specs.resolution?.minShortSide != null && specs.resolution?.minLongSide != null) {
        const shortSide = Math.min(width, height);
        const longSide = Math.max(width, height);
        if (shortSide < specs.resolution.minShortSide || longSide < specs.resolution.minLongSide) {
            return {
                isValid: false,
                message: `${getPlatformDisplayName(platform)} video min resolution 1280×720 (longest side ≥1280, shortest ≥720 px)`,
            };
        }
    }

    if (specs.aspectRatios?.length) {
        const ok = specs.aspectRatios.some((entry) => ratioMatchesEntry(wh, entry));
        if (!ok) {
            const list = specs.aspectRatios.map((r) => r.ratio).join(', ');
            return {
                isValid: false,
                message: `${getPlatformDisplayName(platform)} video aspect ratio must be one of: ${list}`,
            };
        }
    }

    if (specs.resolution?.maxLongestEdge != null) {
        const longest = Math.max(width, height);
        if (longest > specs.resolution.maxLongestEdge) {
            return {
                isValid: false,
                message: `${getPlatformDisplayName(platform)} video max resolution ${specs.resolution.maxLongestEdge}px on the longest side (current ${longest}px)`,
            };
        }
    }

    return { isValid: true, message: '' };
};

export const isVideoUrlByExtension = (urlOrFileName, platform, postType = null) => {
    if (!urlOrFileName || typeof urlOrFileName !== 'string') return false;
    const specs = getVideoSpecs(platform, postType);
    const ext = urlOrFileName.toLowerCase().trim();
    const extension = ext.includes('.') ? ext.substring(ext.lastIndexOf('.')) : `.${ext}`;
    return specs.formatExtensions.includes(extension);
};

export const getPlatformDisplayName = (platform) => {
    const names = {
        [SOCIAL_MEDIA_PLATFORMS.FACEBOOK]: 'Facebook',
        [SOCIAL_MEDIA_PLATFORMS.TWITTER]: 'Twitter',
        [SOCIAL_MEDIA_PLATFORMS.INSTAGRAM]: 'Instagram',
        [SOCIAL_MEDIA_PLATFORMS.LINKEDIN]: 'LinkedIn',
        [SOCIAL_MEDIA_PLATFORMS.PINTEREST]: 'Pinterest',
    };
    return names[platform] || platform;
};

const MIME_BY_IMAGE_EXT = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
};

/** Used by ImageUpload for social channel drag/drop + picker MIME allowlist. */
export const getSocialImageAcceptMimeTypes = (platform, postType = null) => {
    const specs = getImageSpecs(platform, postType);
    const mimes = specs.formatExtensions.map((ext) => MIME_BY_IMAGE_EXT[ext.toLowerCase()]).filter(Boolean);
    return mimes.length ? mimes : ['image/png', 'image/jpeg', 'image/jpg'];
};

export const getSocialImageAcceptAttribute = (platform, postType = null) =>
    getImageSpecs(platform, postType)
        .formatExtensions.map((e) => e.replace(/^\./, '').toLowerCase())
        .map((e) => `.${e}`)
        .join(',');

export const getSocialImageFormatHint = (platform, postType = null) =>
    getImageSpecs(platform, postType)
        .formatExtensions.map((e) => e.replace(/^\./, '').toLowerCase())
        .map((e) => (e === 'jpeg' ? 'jpg' : e))
        .filter((v, i, a) => a.indexOf(v) === i)
        .join(', ');

const VIDEO_EXT_MIME = {
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.m4v': 'video/x-m4v',
    '.wmv': 'video/x-ms-wmv',
};

/** MIME map for extensions in HTML `accept`; extends image + video + PDF tokens. */
const FILE_INPUT_EXT_TO_MIME = {
    ...MIME_BY_IMAGE_EXT,
    ...VIDEO_EXT_MIME,
    '.pdf': 'application/pdf',
};

export const getSocialVideoAcceptMimeTypes = (platform, postType = null) => {
    const specs = getVideoSpecs(platform, postType);
    return specs.formatExtensions.map((ext) => VIDEO_EXT_MIME[ext.toLowerCase()]).filter(Boolean);
};

export const getSocialVideoAcceptExtensions = (platform, postType = null) =>
    getVideoSpecs(platform, postType).formatExtensions.map((e) => e.replace(/^\./, '').toLowerCase());

/**
 * Non-social / generic HTML `<input accept>` strings (comma-separated, leading dots).
 * Adjust here to change defaults for non-social {@link ImageUpload} flows in one place.
 */
export const GENERIC_FILE_INPUT_ACCEPT = {
    IMAGE: '.png,.jpg,.jpeg',
    IMAGE_AND_GIF: '.png,.jpg,.jpeg,.gif',
    MIXED_IMAGE_VIDEO: '.png,.jpg,.jpeg,.mp4,.mov',
    MIXED_IMAGE_VIDEO_WITH_GIF: '.png,.jpg,.jpeg,.gif,.mp4,.mov',
    PDF: '.pdf',
    VIDEO: '.mp4,.mov',
};

/** URL / filename checks for likely video extensions (carousel + uploads). Single place to extend. */
export const VIDEO_LIKE_DOT_EXTENSIONS = ['.mp4', '.mov', '.m4v', '.webm', '.wmv'];

/** Social `accept` from specs only (no duplicated logic in upload components). */
export const getSocialFileInputAcceptAttribute = (contentType, platform, postType = null) => {
    const ct = String(contentType || 'img').toLowerCase();
    const imageAttr = getSocialImageAcceptAttribute(platform, postType);
    const videoAttr = getSocialVideoAcceptExtensions(platform, postType)
        .map((e) => `.${e}`)
        .join(',');

    if (ct === 'story' || ct === 'img/video') {
        return `${imageAttr},${videoAttr}`;
    }
    if (ct === 'video') return videoAttr;
    if (ct === 'pdf') return GENERIC_FILE_INPUT_ACCEPT.PDF;
    return imageAttr;
};

/**
 * Single entry for ImageUpload `accept`: social → config; otherwise → {@link GENERIC_FILE_INPUT_ACCEPT}.
 */
export const getCommunicationImageUploadAcceptAttribute = ({
    channelType,
    platformType,
    socialPostType,
    contentType,
    isCustomFormat = false,
}) => {
    const useSocial = channelType === 'socialMedia' && !!platformType;
    if (useSocial) {
        return getSocialFileInputAcceptAttribute(contentType, platformType, socialPostType);
    }
    const ct = String(contentType || 'img').toLowerCase();
    if (ct === 'img/video' && isCustomFormat) {
        return GENERIC_FILE_INPUT_ACCEPT.MIXED_IMAGE_VIDEO_WITH_GIF;
    }
    if (ct === 'story' || ct === 'img/video') return GENERIC_FILE_INPUT_ACCEPT.MIXED_IMAGE_VIDEO;
    if (ct === 'video') return GENERIC_FILE_INPUT_ACCEPT.VIDEO;
    if (ct === 'pdf') return GENERIC_FILE_INPUT_ACCEPT.PDF;
    if (isCustomFormat) return GENERIC_FILE_INPUT_ACCEPT.IMAGE_AND_GIF;
    return GENERIC_FILE_INPUT_ACCEPT.IMAGE;
};

/** Post types where multi-upload mixes images + video slides (Instagram carousel). */
export const SOCIAL_MULTI_MIXED_MEDIA_POST_TYPE_IDS = ['instagram_carousel'];

export const socialMultiUploadAllowsVideoSlides = (postType) =>
    Boolean(postType?.id && SOCIAL_MULTI_MIXED_MEDIA_POST_TYPE_IDS.includes(postType.id));

/** Split comma-separated `accept` value into normalized `.ext` tokens. */
export const parseAcceptAttributeToDotExtensions = (acceptString) =>
    String(acceptString || '')
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

/**
 * MIME types aligned with {@link getCommunicationImageUploadAcceptAttribute} (drag/drop + validation).
 */
export const getCommunicationImageUploadAcceptMimeTypes = (params) => {
    const acceptStr = getCommunicationImageUploadAcceptAttribute(params);
    const exts = parseAcceptAttributeToDotExtensions(acceptStr);
    const mimes = exts
        .map((ext) => {
            const key = ext.startsWith('.') ? ext : `.${ext}`;
            return FILE_INPUT_EXT_TO_MIME[key];
        })
        .filter(Boolean);
    return [...new Set(mimes)];
};

/** Display tokens for hints/errors (comma-separated extensions, jpeg→jpg dedup). */
export const getCommunicationImageUploadFormatsHintText = (params) => {
    const acceptStr = getCommunicationImageUploadAcceptAttribute(params);
    return parseAcceptAttributeToDotExtensions(acceptStr)
        .map((e) => e.replace(/^\./, '').toLowerCase())
        .map((e) => (e === 'jpeg' ? 'jpg' : e))
        .filter((v, i, a) => a.indexOf(v) === i)
        .join(', ');
};

/** Reusable invalid file-type sentence for non-social (social should use {@link getSocialInvalidFileTypeError}). */
export const getCommunicationImageUploadInvalidTypeMessage = (params) => {
    const tokens = parseAcceptAttributeToDotExtensions(getCommunicationImageUploadAcceptAttribute(params))
        .map((e) => e.replace(/^\./, '').toLowerCase())
        .map((e) => (e === 'jpeg' ? 'jpg' : e));
    const unique = [...new Set(tokens)];
    return `Only ${unique.join(', ')} files are supported`;
};

export const GENERIC_MULTI_UPLOAD_MIME_TYPES = parseAcceptAttributeToDotExtensions(
    GENERIC_FILE_INPUT_ACCEPT.IMAGE_AND_GIF,
)
    .map((ext) => MIME_BY_IMAGE_EXT[ext.startsWith('.') ? ext.toLowerCase() : `.${ext}`])
    .filter(Boolean);

/**
 * Multi carousel `accept` for social: image-only vs image+video from specs (single source).
 */
export const getSocialMultiUploadInputAcceptAttribute = (platform, postType = null) => {
    const p = platform || 'facebook';
    if (!postType?.id) {
        return GENERIC_FILE_INPUT_ACCEPT.IMAGE_AND_GIF;
    }
    const contentKind = socialMultiUploadAllowsVideoSlides(postType) ? 'story' : 'img';
    return getSocialFileInputAcceptAttribute(contentKind, p, postType);
};

export const getSocialMultiUploadAcceptMimeTypes = (platform, postType = null) => {
    const p = platform || 'facebook';
    if (!postType?.id) {
        return [...GENERIC_MULTI_UPLOAD_MIME_TYPES];
    }
    const imageMimes = getSocialImageAcceptMimeTypes(p, postType);
    if (!socialMultiUploadAllowsVideoSlides(postType)) {
        return [...new Set(imageMimes)];
    }
    const videoMimes = getSocialVideoAcceptMimeTypes(p, postType);
    return [...new Set([...imageMimes, ...videoMimes])];
};

/**
 * Multi-upload `accept` string: social post types use specs; otherwise generic image(+gif).
 * Platform falls back to facebook for spec resolution when omitted.
 */
export const getCommunicationMultiUploadAcceptAttribute = (platformType, socialPostType) => {
    if (socialPostType?.id) {
        return getSocialMultiUploadInputAcceptAttribute(platformType || 'facebook', socialPostType);
    }
    return GENERIC_FILE_INPUT_ACCEPT.IMAGE_AND_GIF;
};

export const getCommunicationMultiUploadAcceptExtensionsList = (platformType, socialPostType) =>
    parseAcceptAttributeToDotExtensions(
        getCommunicationMultiUploadAcceptAttribute(platformType, socialPostType),
    );

/** Extension list for supported-formats UI (matches {@link getCommunicationMultiUploadAcceptAttribute}). */
export const getMultiUploadSupportedFormatsExtensionText = (platformType, socialPostType) => {
    if (socialPostType?.id) {
        const p = platformType || 'facebook';
        const kind = socialMultiUploadAllowsVideoSlides(socialPostType) ? 'story' : 'img';
        return getSocialSupportedFormatsText(kind, p, socialPostType);
    }
    return parseAcceptAttributeToDotExtensions(GENERIC_FILE_INPUT_ACCEPT.IMAGE_AND_GIF)
        .map((t) => t.replace(/^\./, ''))
        .join(', ');
};

export const getGenericMultiUploadInvalidTypeMessage = () => {
    const exts = parseAcceptAttributeToDotExtensions(GENERIC_FILE_INPUT_ACCEPT.IMAGE_AND_GIF).join(', ');
    return `Selected file(s): Only ${exts} files are supported`;
};

const normalizeExtToken = (value) =>
    String(value || '')
        .trim()
        .toLowerCase()
        .replace(/^\./, '');

const uniqueFormatTokens = (values = []) => {
    const out = [];
    values.forEach((value) => {
        const token = normalizeExtToken(value);
        if (!token) return;
        if (!out.includes(token)) out.push(token);
    });
    return out;
};

export const getSocialSupportedFormatsText = (contentType, platform, postType = null) => {
    const type = String(contentType || '').toLowerCase();
    const imageTokens = uniqueFormatTokens(getSocialImageFormatHint(platform, postType).split(','));
    const videoTokens = uniqueFormatTokens(getSocialVideoAcceptExtensions(platform, postType));

    if (type === 'story' || type === 'img/video') {
        return uniqueFormatTokens([...imageTokens, ...videoTokens]).join(', ');
    }
    if (type === 'video') {
        return videoTokens.join(', ');
    }
    if (type === 'pdf') {
        return '.pdf';
    }
    return imageTokens.join(', ');
};

export const getSocialInvalidFileTypeError = (contentType, platform, postType = null) =>
    `Only ${getSocialSupportedFormatsText(contentType, platform, postType)} files are supported`;

export const getSocialMaxSizeError = (contentType, maxBytes) => {
    const maxMb = Math.round(Number(maxBytes || 0) / (1024 * 1024));
    const type = String(contentType || '').toLowerCase();
    if (type === 'video') return `Video size max. ${maxMb} MB`;
    if (type === 'pdf') return `Document size max. ${maxMb} MB`;
    return `Image size max. ${maxMb} MB`;
};
