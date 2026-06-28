import { ensureArray, ensureObject, sanitizeMdmMetric } from 'Pages/AuthenticationModule/Audience/audienceDefaults';
import { getEnvironment } from 'Utils/modules/environment';
export { ensureArray, ensureObject };

/** Tab keys for communication authoring — kept here so RSPageHeader does not import Create/constant. */
export const COMMUNICATION_AVAILABLE_TABS = {
    email: getEnvironment() === 'RUN' ? ['email'] : ['email', 'directmail'],
    messaging: ['sms', 'whats app', 'vms', 'rcs'],
    notification: ['web', 'mobile'],
    socialPost: ['facebook', 'twitter', 'instagram', 'linked in', 'pinterest'],
    voice: ['call center'],
    ads: ['google ads', 'facebook ads', 'twitter ads', 'linkedin ads', 'digipop'],
    qr: ['url', 'sms'],
    analytics: ['web analytics', 'app', 'offlineConversion', 'orm', 'video', 'events'],
};

/** Channel audience/split counts: null, NaN, and negatives become fallback. */
export const sanitizeChannelCount = sanitizeMdmMetric;

export const sumAudienceCountByField = (audienceList, field = 'recipientCountMobile') =>
    ensureArray(audienceList).reduce(
        (total, item) => total + sanitizeChannelCount(item?.[field], 0),
        0,
    );

export const ensureCampaignContent = (content) => ensureArray(content);

export const ensureSegmentationListIds = (value) =>
    ensureArray(value).filter((id) => id != null && id !== '');

/** Normalize edit-fetch campaign payload for any communication channel. */
export const normalizeChannelCampaignData = (data, nestedObjectKeys = []) => {
    const safe = ensureObject(data);
    if (!Object.keys(safe).length) return safe;
    const normalized = {
        ...safe,
        content: ensureCampaignContent(safe.content),
        segmentationListId: ensureSegmentationListIds(safe.segmentationListId),
        savedAudienceCountList: ensureArray(safe.savedAudienceCountList),
        totalAudience: sanitizeChannelCount(safe.totalAudience, 0),
        requestForApproval: ensureObject(safe.requestForApproval),
    };
    nestedObjectKeys.forEach((key) => {
        if (key in safe) normalized[key] = ensureObject(safe[key]);
    });
    return normalized;
};

export const hasCampaignDetails = (campaignDetails) =>
    Object.keys(ensureObject(campaignDetails)).length > 0;

export const getCampaignStatusId = (campaignDetails) =>
    ensureCampaignContent(campaignDetails?.content)?.[0]?.statusId ?? null;

/** Loads Create/constant only when returning from data-exchange social setup to communication authoring. */
export const navigateBackToCommunicationSocialPostAsync = async (dispatch, navigate, queries = {}) => {
    const { navigateBackToCommunicationSocialPost } = await import('./CreationSteps/Create/constant');
    navigateBackToCommunicationSocialPost(dispatch, navigate, queries);
};
