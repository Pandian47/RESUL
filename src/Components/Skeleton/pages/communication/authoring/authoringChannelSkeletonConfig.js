import { getChanelName } from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Create/constant';
/** Vertical tab index on Create step (matches VERTICAL_TAB_CONFIG order). */
export const AUTHORING_VERTICAL_TAB_INDEX = {
    email: 0,
    messaging: 1,
    notifications: 2,
    socialpost: 3,
    voice: 4,
    ads: 5,
    qr: 6,
    analytics: 7,
};

/** Representative channel id per Create vertical tab (for route / inline skeleton). */
export const AUTHORING_VERTICAL_TAB_CHANNEL_IDS = [1, 2, 8, 7, 26, 10, 3, 6];

export const getAuthoringChannelIdFromVerticalIndex = (channelIndex = 0) => {
    const index = Number(channelIndex);
    if (Number.isFinite(index) && index >= 0 && index < AUTHORING_VERTICAL_TAB_CHANNEL_IDS.length) {
        return AUTHORING_VERTICAL_TAB_CHANNEL_IDS[index];
    }
    return AUTHORING_VERTICAL_TAB_CHANNEL_IDS[0];
};

const CHANNEL_ID_TO_VERTICAL_INDEX = {
    1: AUTHORING_VERTICAL_TAB_INDEX.email,
    33: AUTHORING_VERTICAL_TAB_INDEX.email,
    2: AUTHORING_VERTICAL_TAB_INDEX.messaging,
    21: AUTHORING_VERTICAL_TAB_INDEX.messaging,
    25: AUTHORING_VERTICAL_TAB_INDEX.messaging,
    41: AUTHORING_VERTICAL_TAB_INDEX.messaging,
    8: AUTHORING_VERTICAL_TAB_INDEX.notifications,
    14: AUTHORING_VERTICAL_TAB_INDEX.notifications,
    7: AUTHORING_VERTICAL_TAB_INDEX.socialpost,
    26: AUTHORING_VERTICAL_TAB_INDEX.voice,
    10: AUTHORING_VERTICAL_TAB_INDEX.ads,
    3: AUTHORING_VERTICAL_TAB_INDEX.qr,
    6: AUTHORING_VERTICAL_TAB_INDEX.analytics,
    16: AUTHORING_VERTICAL_TAB_INDEX.analytics,
};

/**
 * Suppress global/field RS loaders during edit fetch — authoring form skeleton is shown instead.
 */
export const AUTHORING_EDIT_API_LOADER_CONFIG = {
    create: 'none',
    edit: 'none',
};

/** Field loaders for create / first-time channel authoring (campaign may already exist from plan). */
export const AUTHORING_FIELD_LOADER_CONFIG = {
    create: 'field',
    edit: 'field',
};

/** Save / Next / RFA send — button spinner + body lock only (no global RS loader). */
export const AUTHORING_SAVE_LOADER_CONFIG = {
    create: 'none',
    edit: 'none',
};

/** Maps formSubmitHandler type to save-loader button key. */
export const getAuthoringSaveButtonType = (submitType) => {
    if (submitType === 'save') return 'save';
    if (submitType === 'test preview' || submitType === 'request for approval' || submitType === 'send' || submitType === 'live') {
        return 'send';
    }
    return 'form';
};

/** MDC workflow + MDC channel authoring — keep global RSLoader off; use route/field skeletons. */
export const MDC_SUPPRESS_GLOBAL_LOADER = Object.freeze({ loading: false });
export const MDC_SUPPRESS_ENABLE_LOADER = Object.freeze({ isEnableLoader: false });

export const isMdcCampaignAuthoring = (campaignType) => campaignType === 'M';

/**
 * Inner gate layout from campaign type (M = MDC canvas authoring, S/T = SDC create).
 * Route-level skeletons do not use this — only AuthoringChannelEditSkeletonGate.
 */
export const getAuthoringChannelSkeletonLayout = ({ campaignType, layout } = {}) => {
    if (layout === 'mdc' || layout === 'standard') {
        return layout;
    }
    return isMdcCampaignAuthoring(campaignType) ? 'mdc' : 'standard';
};

/**
 * @deprecated Gate uses `showEditSkeleton` directly; kept for callers that still import it.
 */
export const resolveAuthoringEditSkeletonGateLoading = ({ showEditSkeleton = false } = {}) =>
    Boolean(showEditSkeleton);

/** Suppress field loaders while inner edit skeleton is active (MDC uses showEditSkeleton). */
export const getAuthoringEditFieldLoaderConfig = ({ showEditSkeleton, mCampType, savedChannel, isTemplateFlow }) => {
    if (mCampType === 'M' || showEditSkeleton) {
        return getAuthoringEditApiLoaderConfig(Boolean(showEditSkeleton));
    }
    return getAuthoringEditApiLoaderConfig(Boolean(savedChannel || isTemplateFlow));
};

/** Suppress RS loaders only while the edit form skeleton is active. */
export const getAuthoringEditApiLoaderConfig = (suppressLoaders) =>
    suppressLoaders ? AUTHORING_EDIT_API_LOADER_CONFIG : AUTHORING_FIELD_LOADER_CONFIG;

/** Whether saved channel content exists for edit (supports ads/social sub-channel ids). */
/** Clear edit skeleton + allow edit API to run again (call from channel reset / unmount). */
export const resetAuthoringChannelEditSession = (editCallRef, resetEditLoading) => {
    if (editCallRef && Object.prototype.hasOwnProperty.call(editCallRef, 'current')) {
        editCallRef.current = false;
    }
    if (typeof resetEditLoading === 'function') {
        resetEditLoading();
    }
};

export const isAuthoringChannelSaved = (savedChannelsId, channelId, subChannelId = channelId) => {
    if (channelId == null || !savedChannelsId) {
        return false;
    }
    const key = Number(channelId);
    const saved = savedChannelsId[key];
    if (!Array.isArray(saved) || saved.length === 0) {
        return false;
    }
    const id = subChannelId != null ? Number(subChannelId) : key;
    return saved.includes(id);
};

/** Map API channel id → vertical tab index for skeleton variant (`full` = email tab). */
export const getAuthoringVerticalIndexFromChannelId = (channelId) => {
    const key = Number(channelId);
    if (Number.isFinite(key) && CHANNEL_ID_TO_VERTICAL_INDEX[key] != null) {
        return CHANNEL_ID_TO_VERTICAL_INDEX[key];
    }
    const tabName = getChanelName(key);
    if (tabName && AUTHORING_VERTICAL_TAB_INDEX[tabName] != null) {
        return AUTHORING_VERTICAL_TAB_INDEX[tabName];
    }
    return AUTHORING_VERTICAL_TAB_INDEX.email;
};
