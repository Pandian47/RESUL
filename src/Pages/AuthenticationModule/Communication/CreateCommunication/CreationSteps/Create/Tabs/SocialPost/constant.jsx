import { postTypeCardArticle, postTypeCardCarouselMultiImage, postTypeCardDocument, postTypeCardReel, postTypeCardSingleImage, postTypeCardStory, postTypeCardVideo } from 'Assets/Images';
import { getCreatedDate } from 'Utils/modules/dateTime';
import { bar_chart_medium, carousel_large, circle_play_medium, editor_image_medium, editor_pdf_medium, editor_video_medium, grid_medium, mobile_medium, text_document_medium } from 'Constants/GlobalConstant/Glyphicons';
import { handleAllChannelPayload, handleAllChannelTimeZonePayload, handleMDCExtraPayload } from '../../constant';
export const AGE_GROUP = [
    13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41,
    42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
];

/** Form fields cleared when resetting post type / uploaded social media. */
export const SOCIAL_POST_MEDIA_RESET_FIELDS = [
    'previewImage',
    'browserImage',
    'uploadImage',
    'uploadImageName',
    'previewName',
    'inputUrl',
    'multiImageAddByUrl',
    'editorText',
];

export const INITIAL_WATCH_STATE = [
    'isBoostPost',
    'postOnAudience',
    'postOnList',
    'boostPost.isSaved',
    'trendingTopics',
    'previewImage',
    'editorText',
    'previewName',
    'approvalList',
    'uploadImageName',
    'postType',
    'schedule',
];

export const INITIAL_FORM_STATE = {
    defaultValues: {
        postName: '',
        postOnList: [],
        postOnAudience: [],
        isBoostPost: false,
        schedule: null,
        trendingTopics: [],
        sendTimeRecommendation: '',
        daylightSavings: false,
        timezone: {},
        boostPost: {
            country: '',
            city: '',
            ageFrom: '',
            ageTo: '',
            gender: 'All',
        },
        approvalList: {
            name: [{ approverName: '', mandatory: false }],
            requestApproval: false,
            approvalFrom: 'All',
            approvalCount: '2',
            followHierarchy: false,
        },
        editorText: '',
        previewImage: '',
        previewName: '',
        socialMediaPostId: 0,
        browserImage: '',
        uploadImage: '',
        uploadImageName: '',
        inputUrl: '',
        postType: null,
        multiImageAddByUrl: '',
    },
    mode: 'onTouched',
};

/** Channels that use the visual post-type cards (Twitter/X also renders cards in UI; list kept for legacy checks). */
export const SOCIAL_POST_VISUAL_TYPE_CHANNELS = ['facebook', 'instagram', 'linkedIn', 'pinterest'];

export const POST_TYPE_CARD_TEXT_BY_LABEL_KEY = {
    'socialPost.card.facebook_single': { title: 'Single image', description: 'One photo in feed' },
    'socialPost.card.facebook_multi_carousel': { title: 'Carousel', description: 'Multiple photos in feed' },
    'socialPost.card.facebook_video': { title: 'Video', description: 'One video in feed' },
    'socialPost.card.facebook_story': { title: 'Story', description: 'Standard post in feed' },
    'socialPost.card.instagram_single': { title: 'Single image', description: 'One photo in feed' },
    'socialPost.card.instagram_carousel': { title: 'Carousel', description: '2–20 photos or videos in feed' },
    'socialPost.card.instagram_reel': { title: 'Reel', description: 'Vertical video in feed' },
    'socialPost.card.instagram_story': { title: 'Story', description: 'One photo or vertical video (24h)' },
    'socialPost.card.linkedin_image_post': { title: 'Image post', description: 'Up to 10 photos in feed • JPG, PNG, or GIF' },
    'socialPost.card.linkedin_video': { title: 'Video', description: 'Native video' },
    'socialPost.card.linkedin_pdf': { title: 'Document', description: 'PDF or slide deck in feed' },
    'socialPost.card.linkedin_article': { title: 'Article', description: 'Long-form content in feed' },
    'socialPost.card.twitter_single': { title: 'Single image', description: 'One photo in post' },
    'socialPost.card.twitter_multi': { title: 'Carousel', description: 'Multiple photos in post' },
    'socialPost.card.twitter_video': { title: 'Video', description: 'One video in post' },
    'socialPost.card.twitter_poll': { title: 'Poll', description: 'Question with choice options' },
    'socialPost.card.pinterest_single': { title: 'Single image', description: 'One image pin in feed' },
    'socialPost.card.pinterest_carousel': { title: 'Carousel', description: 'Multiple images in one pin' },
    'socialPost.card.pinterest_video': { title: 'Video', description: 'Video pin in feed' },
};

export const POST_TYPE_CARD_COPY_BY_ID = {
    facebook_single_image: {
        labelKey: 'socialPost.card.facebook_single',
        badge: 'FEED',
        iconSrc: postTypeCardSingleImage,
    },
    facebook_multi_image: {
        labelKey: 'socialPost.card.facebook_multi_carousel',
        badge: '2-10',
        iconSrc: postTypeCardCarouselMultiImage,
    },
    facebook_video: {
        labelKey: 'socialPost.card.facebook_video',
        badge: 'MP4',
        iconSrc: postTypeCardVideo,
    },
    facebook_story: {
        labelKey: 'socialPost.card.facebook_story',
        badge: '24H',
        iconSrc: postTypeCardStory,
    },
    instagram_single_image: {
        labelKey: 'socialPost.card.instagram_single',
        badge: 'FEED',
        iconSrc: postTypeCardSingleImage,
    },
    instagram_carousel: {
        labelKey: 'socialPost.card.instagram_carousel',
        badge: '2-20',
        iconSrc: postTypeCardCarouselMultiImage,
    },
    instagram_reel: {
        labelKey: 'socialPost.card.instagram_reel',
        badge: '9-16',
        iconSrc: postTypeCardReel,
    },
    instagram_story: {
        labelKey: 'socialPost.card.instagram_story',
        badge: '24H',
        iconSrc: postTypeCardStory,
    },
    linkedin_single_image: {
        labelKey: 'socialPost.card.linkedin_image_post',
        badge: '1-10',
        iconSrc: postTypeCardCarouselMultiImage,
    },
    linkedin_video: {
        labelKey: 'socialPost.card.linkedin_video',
        badge: 'MP4',
        iconSrc: postTypeCardVideo,
    },
    linkedin_pdf: {
        labelKey: 'socialPost.card.linkedin_pdf',
        badge: 'PDF',
        iconSrc: postTypeCardDocument,
    },
    linkedin_article: {
        labelKey: 'socialPost.card.linkedin_article',
        badge: 'LONG',
        iconSrc: postTypeCardArticle,
    },
    twitter_single_image: {
        labelKey: 'socialPost.card.twitter_single',
        badge: 'FEED',
        iconSrc: postTypeCardSingleImage,
    },
    twitter_multi_image: {
        labelKey: 'socialPost.card.twitter_multi',
        badge: '2-10',
        iconSrc: postTypeCardCarouselMultiImage,
    },
    twitter_video: {
        labelKey: 'socialPost.card.twitter_video',
        badge: 'MP4',
        iconSrc: postTypeCardVideo,
    },
    twitter_poll: {
        labelKey: 'socialPost.card.twitter_poll',
        badge: 'POLL',
    },
    pinterest_single_pin: {
        labelKey: 'socialPost.card.pinterest_single',
        badge: '2:3',
        iconSrc: postTypeCardSingleImage,
    },
    pinterest_carousel_pin: {
        labelKey: 'socialPost.card.pinterest_carousel',
        badge: '2-5',
        iconSrc: postTypeCardCarouselMultiImage,
    },
    pinterest_video_pin: {
        labelKey: 'socialPost.card.pinterest_video',
        badge: 'PIN',
        iconSrc: postTypeCardVideo,
    },
};

export const getResolvedPostTypeCardCopy = (postTypeId) => {
    const meta = POST_TYPE_CARD_COPY_BY_ID[postTypeId];
    if (!meta) {
        return null;
    }
    const text = POST_TYPE_CARD_TEXT_BY_LABEL_KEY[meta.labelKey] || {};
    return {
        ...meta,
        title: text.title ?? '',
        description: text.description ?? '',
    };
};

export const POST_TYPE_OPTIONS_BY_CHANNEL = {
    facebook: [
        { id: 'facebook_single_image', label: 'Single Image' },
        { id: 'facebook_multi_image', label: 'Carousel' },
        { id: 'facebook_video', label: 'Video' },
        { id: 'facebook_story', label: 'Post', hidden: true },
    ],
    instagram: [
        { id: 'instagram_single_image', label: 'Single Image' },
        { id: 'instagram_carousel', label: 'Carousel' },
        { id: 'instagram_reel', label: 'Reel' },
        { id: 'instagram_story', label: 'Story' },
    ],
    linkedIn: [
        { id: 'linkedin_single_image', label: 'Image post' },
        { id: 'linkedin_video', label: 'Video' },
        { id: 'linkedin_pdf', label: 'Document', hidden: true },
        { id: 'linkedin_article', label: 'Article', hidden: true },
    ],
    twitter: [
        { id: 'twitter_single_image', label: 'Single Image' },
        { id: 'twitter_multi_image', label: 'Carousel' },
        { id: 'twitter_video', label: 'Video' },
        { id: 'twitter_poll', label: 'Poll', hidden: true },
    ],
    pinterest: [
        { id: 'pinterest_single_pin', label: 'Single Image' },
        { id: 'pinterest_carousel_pin', label: 'Carousel' },
        { id: 'pinterest_video_pin', label: 'Video' },
    ],
};

/** Options shown in the post-type card row (excludes `hidden: true`). Full list stays in {@link POST_TYPE_OPTIONS_BY_CHANNEL} for edit matching. */
export const getVisiblePostTypeOptions = (channelType) =>
    (POST_TYPE_OPTIONS_BY_CHANNEL[channelType] || []).filter((o) => o.hidden !== true);

export const isPostTypeOptionSelectable = (option) =>
    !!(option && option.disabled !== true && option.hidden !== true);

/** Glyphicon class per `postType.id` (keep in sync with `POST_TYPE_OPTIONS_BY_CHANNEL`). */
export const POST_TYPE_ICON_BY_ID = {
    facebook_single_image: editor_image_medium,
    facebook_multi_image: grid_medium,
    facebook_video: editor_video_medium,
    facebook_story: mobile_medium,
    instagram_single_image: editor_image_medium,
    instagram_carousel: carousel_large,
    instagram_reel: circle_play_medium,
    instagram_story: mobile_medium,
    linkedin_single_image: grid_medium,
    linkedin_video: editor_video_medium,
    linkedin_pdf: editor_pdf_medium,
    linkedin_article: text_document_medium,
    twitter_single_image: editor_image_medium,
    twitter_multi_image: grid_medium,
    twitter_video: editor_video_medium,
    twitter_poll: bar_chart_medium,
    pinterest_single_pin: editor_image_medium,
    pinterest_carousel_pin: grid_medium,
    pinterest_video_pin: editor_video_medium,
};

export const getMaxImagesForSocialPostType = (postType) => {
    const id = postType?.id;
    if (id === 'pinterest_carousel_pin') {
        return 5;
    }
    if (id === 'linkedin_single_image') {
        return 10;
    }
    if (id === 'instagram_carousel') {
        return 20;
    }
    if (id === 'facebook_multi_image' || id === 'twitter_multi_image') {
        return 10;
    }
    const label = postType?.label;
    if (!label) return 1;
    if (id === 'pinterest_video_pin' || ['Video', 'Reel', 'PDF', 'Document', 'Poll'].includes(label)) return 0;
    if (['Multi Image', 'Image post', 'Multi image – carousel'].includes(label)) return 10;
    return 1;
};

/**
 * `ImageUpload` variant for a single media asset (image / video / PDF / article cover).
 * `null` when the post type uses multi-image (`MultiImageUpload`) or non-file UI (e.g. Poll).
 */
export const getSocialPostImageUploadVariant = (postType) => {
    const label = postType?.label;
    const id = postType?.id;
    if (
        id === 'facebook_multi_image' ||
        id === 'twitter_multi_image' ||
        id === 'instagram_carousel' ||
        id === 'pinterest_carousel_pin' ||
        id === 'linkedin_single_image'
    ) {
        return null;
    }
    if (id === 'twitter_poll') {
        return null;
    }
    /** One asset: image (9:16) or video — `ImageUpload` uses `contentType="story"` + dual handlers. */
    if (id === 'instagram_story') {
        return 'story';
    }
    if (!label) {
        return 'image';
    }
    if (['Multi Image', 'Carousel', 'Single/Multi Image', 'Image post', 'Multi image – carousel'].includes(label)) {
        return null;
    }
    if (label === 'Poll') {
        return null;
    }
    if (label === 'PDF' || label === 'Document' || id === 'linkedin_pdf') {
        return 'pdf';
    }
    if (label === 'Video' || id === 'instagram_reel' || id === 'pinterest_video_pin') {
        return 'video';
    }
    if (label === 'Article') {
        return 'article';
    }
    return 'image';
};

export const isSocialPostCaptionEditorDisabled = (platformType, postType) => {
    const id = postType?.id;
    if (platformType === 'instagram' && id === 'instagram_story') {
        return true;
    }
    return false;
};

export const isCarouselOrMultiImagePostType = (postType) => {
    const id = postType?.id;
    if (
        id === 'facebook_multi_image' ||
        id === 'twitter_multi_image' ||
        id === 'instagram_carousel' ||
        id === 'pinterest_carousel_pin'
    ) {
        return true;
    }
    const label = postType?.label;
    return label === 'Multi Image' || label === 'Carousel' || label === 'Multi image – carousel';
};

/** Post-type ids that use one feed image (toolbar uses hidden trigger + auto-open upload on card select). */
export const isSingleImageSocialPostTypeId = (id) =>
    id === 'facebook_single_image' ||
    id === 'instagram_single_image' ||
    id === 'twitter_single_image' ||
    id === 'pinterest_single_pin';

/** Post-type ids that use multi-slide upload (auto-open upload modal on card select). */
export const isMultiSlideSocialPostTypeId = (id) =>
    id === 'facebook_multi_image' ||
    id === 'twitter_multi_image' ||
    id === 'instagram_carousel' ||
    id === 'pinterest_carousel_pin' ||
    id === 'linkedin_single_image';

export const isVideoSocialPostTypeId = (id) =>
    id === 'facebook_video' ||
    id === 'twitter_video' ||
    id === 'linkedin_video' ||
    id === 'instagram_reel' ||
    id === 'instagram_story' ||
    id === 'pinterest_video_pin';

export const isPdfSocialPostTypeId = (id) => id === 'linkedin_pdf';

export const shouldAutoOpenSocialPostMediaUploadOnPostTypeSelect = (id) =>
    isSingleImageSocialPostTypeId(id) ||
    isMultiSlideSocialPostTypeId(id) ||
    isVideoSocialPostTypeId(id) ||
    isPdfSocialPostTypeId(id);

/** ManageSocialMediaPost API `postType` (backend spelling: Carousal). */
export const getManageSocialMediaPostApiPostType = (postType, { mediaIsVideo, galleryCount } = {}) => {
    const id = postType?.id || '';
    const label = postType?.label || '';
    const count = typeof galleryCount === 'number' ? galleryCount : 0;

    if (label === 'Poll') {
        return 'Image';
    }

    if (id === 'instagram_story' || id === 'facebook_story') {
        return 'Story';
    }

    if (mediaIsVideo) {
        if (id === 'instagram_reel' || label === 'Reel') {
            return 'Reels';
        }
        return 'Video';
    }

    if (count > 1) {
        return 'Carousal';
    }
    if (count === 1 && isCarouselOrMultiImagePostType(postType)) {
        // LinkedIn: one image is still a normal image post (multi slot allows 1–10).
        if (id === 'linkedin_single_image') {
            return 'Image';
        }
        return 'Carousal';
    }

    return 'Image';
};

/** True when URL/path looks like a video file (not derived from UI `mediaType` state). */
export const inferSocialPostUrlIsVideo = (urlOrPath) => {
    const s = String(urlOrPath || '').trim();
    if (!s) return false;
    const head = s.slice(0, 200).toLowerCase();
    if (head.startsWith('data:video/')) return true;
    if (head.startsWith('data:image/')) return false;
    return /\.(mp4|mov|m4v|webm)(\?|#|$)/i.test(s);
};

/**
 * Whether ManageSocialMediaPost should treat attached media as video.
 * Uses gallery metadata / file MIME / URL extension — not React `mediaType`, which can stay "Video"
 * after edit load or a prior upload when the user later adds an image.
 */
export const inferPayloadMediaIsVideo = (pageImageUrls = [], galleryImages = []) => {
    const urls = (Array.isArray(pageImageUrls) ? pageImageUrls : []).map((u) => String(u || '').trim()).filter(Boolean);
    const gallery = Array.isArray(galleryImages) ? galleryImages : [];

    const slideKind = (item) => {
        if (!item || typeof item !== 'object') return 'image';
        if (item.mediaKind === 'video') return 'video';
        if (item.mediaKind === 'image') return 'image';
        const f = item.file;
        if (f?.type?.startsWith('video/')) return 'video';
        if (f?.type?.startsWith('image/')) return 'image';
        const pathStr = `${item.src || ''}${item.name || ''}`;
        return inferSocialPostUrlIsVideo(pathStr) ? 'video' : 'image';
    };

    if (gallery.length > 0) {
        const kinds = gallery.map(slideKind);
        const anyVideo = kinds.some((k) => k === 'video');
        const anyImage = kinds.some((k) => k === 'image');
        const multi = gallery.length > 1 || urls.length > 1;
        if (multi) {
            if (anyVideo && !anyImage) return true;
            return false;
        }
        return kinds[0] === 'video';
    }

    if (urls.length === 0) return false;
    if (urls.length === 1) {
        return inferSocialPostUrlIsVideo(urls[0]);
    }
    const flags = urls.map(inferSocialPostUrlIsVideo);
    if (flags.every(Boolean)) return true;
    return false;
};

/** `pageImage` must be a JSON string of URL array, e.g. '["https://..."]'. */
export const serializeSocialPostPageImage = (urls) => {
    const list = (Array.isArray(urls) ? urls : [urls]).filter((u) => u && String(u).trim());
    if (!list.length) {
        return '';
    }
    return JSON.stringify(list);
};

/** Parse API/store `pageImage`: JSON array string, single URL, or other non-empty string. */
export const parseSocialPostPageImageUrls = (pageImage) => {
    if (pageImage == null) {
        return [];
    }
    const s = String(pageImage).trim();
    if (!s) {
        return [];
    }
    if (s.startsWith('[')) {
        try {
            const parsed = JSON.parse(s);
            if (Array.isArray(parsed)) {
                return parsed.map((x) => String(x).trim()).filter(Boolean);
            }
        } catch {
            /* treat as plain string below */
        }
    }
    return [s];
};

const filenameFromUrl = (url) => {
    try {
        const path = String(url).split('?')[0];
        const seg = path.split('/').filter(Boolean).pop();
        return seg || '';
    } catch {
        return '';
    }
};

/** Shapes used by MultiImageUpload / preview: `{ name, src, mediaKind? }` with remote `src`. */
export const buildGalleryImagesFromUrls = (urls) =>
    (Array.isArray(urls) ? urls : []).map((url, idx) => {
        const src = String(url || '').trim();
        const isVideo = /\.(mp4|mov|m4v|webm)(\?|#|$)/i.test(src);
        return {
            name: filenameFromUrl(url) || `Image ${idx + 1}`,
            src,
            ...(isVideo ? { mediaKind: 'video' } : {}),
        };
    });

/**
 * Map saved ManageSocialMediaPost `postType` (+ image count) back to the channel post-type dropdown option.
 */
export const matchPostTypeOptionForEdit = (channelType, apiPostType, imageUrlCount = 0) => {
    const opts = POST_TYPE_OPTIONS_BY_CHANNEL[channelType];
    if (!opts?.length) {
        return null;
    }

    const firstSelectable = () =>
        opts.find((o) => o.disabled !== true && o.hidden !== true) ??
        opts.find((o) => o.disabled !== true) ??
        opts[0] ??
        null;
    const pick = (candidate) => (candidate && candidate.disabled !== true ? candidate : firstSelectable());

    const t = String(apiPostType || '').trim();
    const multi = imageUrlCount > 1;

    if (multi) {
        if (channelType === 'instagram') {
            return pick(opts.find((o) => o.id === 'instagram_carousel'));
        }
        if (channelType === 'facebook') {
            return pick(opts.find((o) => o.id === 'facebook_multi_image'));
        }
        if (channelType === 'twitter') {
            return pick(opts.find((o) => o.id === 'twitter_multi_image'));
        }
        if (channelType === 'pinterest') {
            return pick(opts.find((o) => o.id === 'pinterest_carousel_pin'));
        }
        if (channelType === 'linkedIn') {
            return pick(opts.find((o) => o.id === 'linkedin_single_image'));
        }
    }

    if (t === 'Carousal') {
        if (channelType === 'instagram') {
            return pick(opts.find((o) => o.id === 'instagram_carousel'));
        }
        if (channelType === 'facebook') {
            return pick(opts.find((o) => o.id === 'facebook_multi_image'));
        }
        if (channelType === 'twitter') {
            return pick(opts.find((o) => o.id === 'twitter_multi_image'));
        }
        if (channelType === 'pinterest') {
            return pick(opts.find((o) => o.id === 'pinterest_carousel_pin'));
        }
        if (channelType === 'linkedIn') {
            return pick(opts.find((o) => o.id === 'linkedin_single_image'));
        }
    }

    if (t === 'Video') {
        return pick(opts.find((o) => o.label === 'Video') || opts.find((o) => o.id?.endsWith('_video')));
    }

    if (t === 'Reels') {
        return pick(opts.find((o) => o.id === 'instagram_reel') || opts.find((o) => o.label === 'Reel'));
    }

    if (t === 'Story') {
        return pick(
            opts.find((o) => o.label === 'Story') ||
            opts.find((o) => o.id === 'instagram_story') ||
            opts.find((o) => o.id === 'facebook_story'),
        );
    }

    return pick(
        opts.find((o) => o.id === 'linkedin_single_image') ||
        opts.find((o) => o.label === 'Image post') ||
        opts.find((o) => o.label === 'Single/Multi Image') ||
        opts.find((o) => o.label === 'Single Image'),
    );
};

const LISTING_POST_TYPE_LABEL_BY_API = {
    Image: 'Single',
    Carousal: 'Carousel',
    Carousel: 'Carousel',
    Video: 'Video',
    Reels: 'Reel',
    Story: 'Story',
    Document: 'Document',
    PDF: 'Document',
    Article: 'Article',
};

const LISTING_POST_TYPE_LABEL_BY_OPTION_LABEL = {
    'Single Image': 'Single',
    'Image post': 'Single',
    'Single/Multi Image': 'Single',
    Carousel: 'Carousel',
    Document: 'Document',
    Video: 'Video',
    Reel: 'Reel',
    Story: 'Story',
    Article: 'Article',
    Poll: 'Poll',
};

const SOCIAL_POST_CHANNEL_ID_TO_TYPE = {
    1: 'facebook',
    3: 'twitter',
    5: 'pinterest',
    6: 'instagram',
    8: 'linkedIn',
};

const getSocialPostTypeListingLabel = (channelType, apiPostType, imageUrlCount = 0) => {
    const t = String(apiPostType || '').trim();

    if (t) {
        if (LISTING_POST_TYPE_LABEL_BY_API[t]) {
            return LISTING_POST_TYPE_LABEL_BY_API[t];
        }
        const option = matchPostTypeOptionForEdit(channelType, t, 0);
        if (option?.label) {
            return LISTING_POST_TYPE_LABEL_BY_OPTION_LABEL[option.label] || option.label;
        }
        return t;
    }

    const count = Number(imageUrlCount) || 0;
    if (count <= 0) {
        return 'Single';
    }

    if (count > 1) {
        return 'Carousel';
    }

    const option = matchPostTypeOptionForEdit(channelType, '', count);
    if (option?.label) {
        return LISTING_POST_TYPE_LABEL_BY_OPTION_LABEL[option.label] || option.label;
    }

    return 'Single';
};

export const getSocialPostTypeLabelForListing = (content, tabName = '') => {
    if (content?.channelId !== 7) {
        return '';
    }

    const channelType =
        tabName ||
        SOCIAL_POST_CHANNEL_ID_TO_TYPE[Number(content?.socialPostChannelId ?? content?.subChannelId)] ||
        '';
    if (!channelType) {
        return '';
    }

    const apiPostType = String(content?.postType ?? content?.PostType ?? '').trim();
    if (apiPostType) {
        return getSocialPostTypeListingLabel(channelType, apiPostType) || 'Single';
    }

    let imageCount = Number(content?.imageCount ?? content?.imageUrlCount ?? 0) || 0;
    if (!imageCount) {
        const imageSource =
            content?.pageImage ?? content?.postImagePath ?? content?.imageUrl ?? content?.imagePath;
        if (imageSource) {
            imageCount = parseSocialPostPageImageUrls(imageSource).length || 1;
        } else if (content?.isCarousel) {
            imageCount = 2;
        }
    }

    return getSocialPostTypeListingLabel(channelType, '', imageCount) || 'Single';
};

export const shouldShowCarouselMultiImageSpecInfo = (channelType, postType) => {
    if (channelType === 'twitter') return false;
    if (channelType === 'linkedIn' && postType?.id === 'linkedin_single_image') {
        return true;
    }
    return isCarouselOrMultiImagePostType(postType);
};

export const getCarouselMultiImageSpecModalTitle = (channelType, postType) => {
    const channelName =
        channelType === 'linkedIn'
            ? 'LinkedIn'
            : channelType === 'facebook'
                ? 'Facebook'
                : channelType === 'instagram'
                    ? 'Instagram'
                    : channelType === 'pinterest'
                        ? 'Pinterest'
                        : channelType
                            ? channelType.charAt(0).toUpperCase() + channelType.slice(1)
                            : 'Social';
    const suffix =
        postType?.id === 'pinterest_carousel_pin'
            ? 'Carousel pin'
            : postType?.id === 'linkedin_single_image'
                ? 'Image post'
                : postType?.label === 'Carousel'
                    ? 'Carousel'
                    : 'Multi image';
    return 'Specification';
};

// const POST_TYPE_SPECS = {
//     //  FACEBOOK
//     facebook_single_image: [
//         { label: 'Images', value: '1' },
//         { label: 'Size', value: '1200×630' },
//         { label: 'Ratio', value: '1.91:1' },
//         { label: 'Format', value: 'JPG, PNG' },
//         { label: 'File size', value: '≤ 30 MB' },
//         { label: 'Caption', value: '≤ 63,206 characters' },
//     ],

//     facebook_multi_image: [
//         { label: 'Images', value: '2–10' },
//         { label: 'Size', value: '1080×1080' },
//         { label: 'Ratio', value: '1:1' },
//         { label: 'Format', value: 'JPG, PNG' },
//         { label: 'File size', value: '≤ 30 MB each' },
//         { label: 'Caption', value: '≤ 63,206 characters' },
//     ],

//     facebook_video: [
//         { label: 'Videos', value: '1' },
//         { label: 'Ratio', value: '16:9, 1:1, 9:16' },
//         { label: 'Format', value: 'MP4, MOV' },
//         { label: 'File size', value: '≤ 10 GB' },
//         { label: 'Duration', value: '1 sec – 240 min' },
//     ],

//     facebook_story: [
//         { label: 'Slides', value: '1+' },
//         { label: 'Size', value: '1080×1920' },
//         { label: 'Ratio', value: '9:16' },
//         { label: 'Format', value: 'JPG, PNG, MP4' },
//         { label: 'Duration', value: '≤ 60 sec/video' },
//     ],

//     //  INSTAGRAM
//     instagram_single_image: [
//         { label: 'Images', value: '1' },
//         { label: 'Size', value: '1080×1080 or 1080×1350' },
//         { label: 'Ratio', value: '1:1 or 4:5' },
//         { label: 'Format', value: 'JPG, PNG' },
//         { label: 'File size', value: '≤ 30 MB' },
//         { label: 'Caption', value: '≤ 2,200 characters' },
//     ],

//     instagram_carousel: [
//         { label: 'Slides', value: '2–10' },
//         { label: 'Size', value: '1080×1080 or 1080×1350' },
//         { label: 'Ratio', value: '1:1 or 4:5 (uniform)' },
//         { label: 'Format', value: 'Images: JPG, PNG | Videos: MP4, MOV' },
//         { label: 'File size', value: '≤ 30 MB image / ≤ 100 MB video' },
//         { label: 'Video', value: '3–60 sec' },
//         { label: 'Caption', value: '≤ 2,200 characters' },
//     ],

//     instagram_reel: [
//         { label: 'Videos', value: '1' },
//         { label: 'Size', value: '1080×1920' },
//         { label: 'Ratio', value: '9:16' },
//         { label: 'Format', value: 'MP4, MOV' },
//         { label: 'File size', value: '≤ 1 GB' },
//         { label: 'Duration', value: '3–90 sec' },
//     ],

//     instagram_story: [
//         { label: 'Slides', value: '1+' },
//         { label: 'Size', value: '1080×1920' },
//         { label: 'Ratio', value: '9:16' },
//         { label: 'Format', value: 'JPG, PNG, MP4' },
//         { label: 'Duration', value: '≤ 60 sec' },
//     ],

//     //  LINKEDIN
//     linkedin_single_image: [
//         { label: 'Images', value: '1–10' },
//         { label: 'Size', value: '1200×627 or 1080×1080' },
//         { label: 'Ratio', value: '1.91:1 or 1:1' },
//         { label: 'Format', value: 'JPG, PNG, GIF' },
//         { label: 'File size', value: '≤ 10 MB each' },
//         { label: 'Caption', value: '≤ 3,000 characters' },
//     ],

//     linkedin_video: [
//         { label: 'Videos', value: '1' },
//         { label: 'Format', value: 'MP4, MOV, WMV' },
//         { label: 'File size', value: '≤ 5 GB' },
//         { label: 'Duration', value: '3 sec – 10 min' },
//     ],

//     //  PINTEREST
//     pinterest_carousel_pin: [
//         { label: 'Slides', value: '2–5' },
//         { label: 'Size', value: '1000×1500' },
//         { label: 'Ratio', value: '2:3' },
//         { label: 'Format', value: 'JPG, PNG' },
//         { label: 'File size', value: '≤ 20 MB each' },
//         { label: 'Title', value: '≤ 100 chars' },
//         { label: 'Description', value: '≤ 500 chars' },
//     ],

//     pinterest_video_pin: [
//         { label: 'Videos', value: '1' },
//         { label: 'Format', value: 'MP4, MOV, M4V' },
//         { label: 'File size', value: '≤ 2 GB' },
//         { label: 'Duration', value: '4 sec – 15 min' },
//     ],

//     // TWITTER (X)
//     twitter_multi_image: [
//         { label: 'Images', value: '1–4' },
//         { label: 'Size', value: '1200×675 or 1080×1080' },
//         { label: 'Ratio', value: '16:9 or 1:1' },
//         { label: 'Format', value: 'JPG, PNG' },
//         { label: 'File size', value: '≤ 5 MB' },
//         { label: 'Caption', value: '≤ 280 characters' },
//     ],
// };

const POST_TYPE_SPECS = {
  // =========================
  // FACEBOOK
  // =========================

  facebook_single_image: [
    { label: 'Image', value: '1' },
    { label: 'Size', value: '1080×1080, 1080×1350, 1200×630' },
    { label: 'Ratio', value: '1:1, 4:5, 1.91:1' },
    { label: 'Format', value: 'JPG, PNG' },
    { label: 'File size', value: '≤ 30 MB' },
    { label: 'Caption', value: '≤ 63,206 characters' },
  ],

  facebook_multi_image: [
    { label: 'Images', value: '2–10' },
    { label: 'Size', value: '1080×1080, 1080×1350' },
    { label: 'Ratio', value: '1:1, 4:5' },
    { label: 'Format', value: 'JPG, PNG' },
    { label: 'File size', value: '≤ 30 MB each' },
    { label: 'Caption', value: '≤ 63,206 characters' },
  ],

  facebook_video: [
    { label: 'Video', value: '1' },
    { label: 'Resolution', value: '≥ 1280×720' },
    { label: 'Ratio', value: '16:9, 1:1, 9:16' },
    { label: 'Format', value: 'MP4, MOV' },
    { label: 'File size', value: '≤ 10 GB each' },
    { label: 'Duration', value: '1 sec – 240 min' },
    { label: 'Caption', value: '≤ 63,206 characters' },
  ],

  facebook_story: [
    { label: 'Image/Video', value: '1' },
    { label: 'Size', value: '1080×1920' },
    { label: 'Ratio', value: '9:16' },
    { label: 'Format', value: 'JPG, PNG, MP4' },
    { label: 'Duration', value: '≤ 60 sec (video)' },
    // { label: 'Extras', value: 'Stickers / overlay supported' },
  ],

  // =========================
  // INSTAGRAM
  // =========================

  instagram_single_image: [
    { label: 'Image', value: '1' },
    { label: 'Size', value: '1080×1080, 1080×1350' },
    { label: 'Ratio', value: '1:1, 4:5' },
    { label: 'Format', value: 'JPG, PNG' },
    { label: 'File size', value: '≤ 30 MB' },
    { label: 'Caption', value: '≤ 2,200 characters' },
  ],

  instagram_carousel: [
    { label: 'Slides', value: '2–20' },
    { label: 'Size', value: '1080×1080, 1080×1350' },
    { label: 'Ratio', value: '1:1, 4:5' },
    { label: 'Format', value: 'Images: JPG, PNG | Videos: MP4' },
    { label: 'File size', value: '≤ 30 MB (img) | ≤ 100 MB (video)' },
    { label: 'Video duration', value: '3–60 sec' },
    { label: 'Caption', value: '≤ 2,200 characters' },
  ],

  instagram_reel: [
    { label: 'Reel', value: '1' },
    { label: 'Size', value: '1080×1920' },
    { label: 'Ratio', value: '9:16' },
    { label: 'Format', value: 'MP4, MOV' },
    { label: 'File size', value: '≤ 1 GB' },
    { label: 'Duration', value: '3–90 sec' },
  ],

  instagram_story: [
    { label: 'Image/Video', value: '1' },
    { label: 'Size', value: '1080×1920' },
    { label: 'Ratio', value: '9:16' },
    { label: 'Format', value: 'JPG, PNG, MP4' },
    { label: 'Duration', value: '≤ 60 sec (video)' },
    // { label: 'Extras', value: 'Sticker overlay supported' },
  ],

  // =========================
  // LINKEDIN
  // =========================

  linkedin_single_image: [
    { label: 'Images', value: '1 -10' },
    { label: 'Size', value: '1080×1080, 1080×1350, 1200×627' },
    { label: 'Ratio', value: '1:1, 4.5, 1.91:1' },
    { label: 'Format', value: 'JPG, PNG, GIF' },
    { label: 'File size', value: '≤ 10 MB' },
    { label: 'Caption', value: '≤ 3,000 characters' },
  ],

  linkedin_multi_image: [
    { label: 'Images', value: '2–10' },
    { label: 'Size', value: '1080×1080, 1080×1350' },
    { label: 'Ratio', value: '1:1, 4:5' },
    { label: 'Format', value: 'JPG, PNG' },
    { label: 'File size', value: '≤ 10 MB each' },
    { label: 'Caption', value: '≤ 3,000 characters' },
  ],

  linkedin_video: [
    { label: 'Videos', value: '1–5' },
    { label: 'Resolution', value: '256×144, 4096×2304' },
    { label: 'Ratio', value: '1:2.4, 2.4:1' },
    { label: 'Format', value: 'MP4, MOV' },
    { label: 'File size', value: '≤ 5 GB each' },
    { label: 'Duration', value: '3 sec – 10 min' },
    { label: 'Caption', value: '≤ 3,000 characters' },
  ],

  linkedin_document: [
    { label: 'File', value: '1 PDF' },
    { label: 'Size', value: 'Up to A4 / Letter' },
    { label: 'Pages', value: '≤ 300 pages' },
    { label: 'File size', value: '≤ 100 MB' },
    { label: 'Caption', value: '≤ 3,000 characters' },
  ],

  linkedin_article: [
    { label: 'Format', value: 'Rich text + cover image' },
    { label: 'Cover size', value: '1200×627' },
    { label: 'Ratio', value: '1.91:1' },
    { label: 'Title', value: '≤ 150 characters' },
    { label: 'Body', value: '≤ 110,000 characters' },
  ],

  // =========================
  // PINTEREST
  // =========================

  pinterest_single_pin: [
  { label: 'Image', value: '1' },
  { label: 'Size', value: '1000×1500' },
  { label: 'Ratio', value: '2:3' },
  { label: 'Format', value: 'JPG, PNG' },
  { label: 'File size', value: '≤ 20 MB' },
  { label: 'Title', value: '≤ 100 characters' },
  { label: 'Description', value: '≤ 500 characters' },
],

  pinterest_carousel_pin: [
    { label: 'Slides', value: '2–5' },
    { label: 'Size', value: '1000×1500' },
    { label: 'Ratio', value: '2:3' },
    { label: 'Format', value: 'JPG, PNG' },
    { label: 'File size', value: '≤ 20 MB each' },
    { label: 'Title', value: '≤ 100 characters' },
    { label: 'Description', value: '≤ 500 characters' },
  ],

  pinterest_video_pin: [
    { label: 'Video', value: '1' },
    { label: 'Format', value: 'MP4, MOV, M4V' },
    { label: 'File size', value: '≤ 2 GB' },
    { label: 'Duration', value: '4 sec – 15 min' },
  ],

  // =========================
  // TWITTER (X)
  // =========================

  twitter_single_image: [
  { label: 'Image', value: '1' },
  { label: 'Size', value: '1200×675 (landscape), 1080×1080 (square)' },
  { label: 'Ratio', value: '16:9, 1:1' },
  { label: 'Format', value: 'JPG, PNG' },
  { label: 'File size', value: '≤ 5 MB' },
  { label: 'Caption', value: '≤ 280 characters' },
],

  twitter_video: [
  { label: 'Videos', value: '1' },
  { label: 'Resolution', value: '32×32, 1920×1200' },
  { label: 'Ratio', value: '16:9, 1:1, 4:5' },
  { label: 'Format', value: 'MP4, MOV' },
  { label: 'File size', value: '≤ 30 MB' },
  { label: 'Frame rate', value: '30–60 FPS' },
  { label: 'Duration', value: '0.5 sec – 2 min 20 sec' },
  { label: 'Caption', value: '≤ 280 characters' },
],

  twitter_multi_image: [
    { label: 'Images', value: '1–4' },
    { label: 'Size', value: '1200×675, 1080×1080' },
    { label: 'Ratio', value: '16:9, 1:1' },
    { label: 'Format', value: 'JPG, PNG' },
    { label: 'File size', value: '≤ 5 MB each' },
    { label: 'Caption', value: '≤ 280 characters' },
  ],
}

export const getCarouselMultiImageSpecRows = (channelType, postType) => {
    return POST_TYPE_SPECS[postType?.id] || [];
};

export const getPostTypeDurationInfoValue = (postType) => {
    const rows = POST_TYPE_SPECS[postType?.id] || [];
    const durationRow = rows.find((row) =>
        String(row?.label || '')
            .toLowerCase()
            .includes('duration'),
    );
    return String(durationRow?.value || '').trim();
};

export const buildPayloadForSaveData = (
    values,
    userId,
    clientId,
    departmentId,
    campid = campaignId,
    type,
    campaignType,
    timeZone,
    boostPostAry,
    locationAds,
    { pageImageUrls = [], mediaIsVideo = false } = {},
) => {
    const trendingTags = values?.trendingTopics?.join(', ');
    const segmentIdList = values?.postOnAudience?.length
        ? values?.postOnAudience?.map((item) => item.segmentationListId)
        : '';
    const localBlastDateTime = getCreatedDate(values?.schedule, 'campaign');
    const fromTab = getFromTab(type);
    const manageSocialPostType = getManageSocialMediaPostApiPostType(values?.postType, {
        mediaIsVideo,
        galleryCount: pageImageUrls.length,
    });
    const pageImageSerialized = serializeSocialPostPageImage(pageImageUrls);

    const payload = {
        dataSource: campaignType === 'T' ? 'DL' : 'TL',
        departmentId,
        clientId,
        copy: false,
        createdBy: userId,
        socialMediaPostList: {
            campaignType: campaignType,
            dynamiclistId: 0,
            totalAudience: 0,
            isSendTestSocialPost: 0,
            postName: values?.postName,
            postText: values?.editorText,
            trendingTopic: trendingTags || '',
            postShortCode: type?.[0]?.toUpperCase(),
            socialMediaPostId: 0,
            isApporvalRequired: false,
            isBoostPostEnabled: values?.isBoostPost || false,
            isDaylight: values?.daylightSavings || false,
            targetInterest: values?.boostPost?.isSaved ? 'yes' : 'no',
            targetAgeFrom: values?.isBoostPost && boostPostAry?.length > 0 ? boostPostAry[1] : '',
            targetAgeTo: values?.isBoostPost && boostPostAry?.length > 0 ? boostPostAry[2] : '',
            targetGender: values?.isBoostPost && boostPostAry?.length > 0 ? boostPostAry[3] : 'All',
            timeZoneId: handleAllChannelTimeZonePayload(
                campaignType,
                locationAds?.timeZoneId,
                values?.timezone,
                timeZone?.timeZoneId,
                locationAds
            ),
            targetRegion: values?.isBoostPost && boostPostAry?.length > 0 ? boostPostAry[0]?.fBCountryCode : '',
            campaignId: campid,
            socialMediaSetupId: values?.postOnList?.socialMediaSetupId || '',
            socialMediaChannelId: fromTab,
            socialMediaPostPageName: values?.postOnList?.pageName,
            localBlastDateTime: localBlastDateTime === 'Invalid date' ? '' : localBlastDateTime,
            parentChannelDetailType: '',
            parentChannelDetailId: 0,
            levelNumber: 1,
            domId: '',
            addOnLevel: 0,
            isALLorAny: '',
            actionId: '',
            actionTime: '',
            actionTimeDuration: '',
            postLink: values?.postLink || '',
            postType: manageSocialPostType,
            pageImage: pageImageSerialized,
            postImagePath: pageImageSerialized,
            isDaylightSavings: values?.daylightSavings || false,
        },
        userId,
        segmentationListId: segmentIdList || [],
        requestForApproval: {
            isWorkflowEnabled: false,
            approvarList: [],
        },
        ...handleMDCExtraPayload(locationAds),
        ...handleAllChannelPayload('socialPost', values),
    };

    return payload;
};

export const getFromTab = (tab) => {
    switch (tab) {
        case 'facebook':
            return 1;
        case 'twitter':
            return 3;
        case 'instagram':
            return 6;
        case 'linkedIn':
            return 8;
        case 'pinterest':
            return 5;
    }
};

export const buildForGetPostOnDropDownAndAudience = (val, clientId = '', userId = '', departmentId = '') => {
    const postOn = {
        socialMediaChannelId: 1,
    };
    const audience = {
        clientId,
        userId,
        departmentId,
        recipientListId: 0,
        searchText: '',
        segmentIds: [],
        campaignId: 0,
        channelType: '',
    };
    return val == 'audience' ? audience : postOn;
};
