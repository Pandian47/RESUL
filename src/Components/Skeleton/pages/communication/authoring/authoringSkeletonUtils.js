import { getAuthoringVerticalIndexFromChannelId } from './authoringChannelSkeletonConfig';
/** Create step vertical channel index from `hId` query (defaults to Email = 0). */
export const getAuthoringChannelIndex = (search = '') => {
    const hId = new URLSearchParams(search).get('hId');
    if (hId == null || hId === '') {
        return 0;
    }
    const parsed = parseInt(hId, 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

/** Horizontal icon sub-tab counts per vertical channel tab (Email, Messaging, …). */
const AUTHORING_HORIZONTAL_SUB_TAB_COUNTS = [2, 4, 2, 5, 0, 5, 8, 2];

/** Icon sub-tab strip count for a vertical channel index (0 when channel has no sub-tabs). */
export const getAuthoringHorizontalSubTabCount = (channelIndex = 0) => {
    const index = Number(channelIndex);
    if (!Number.isFinite(index) || index < 0 || index >= AUTHORING_HORIZONTAL_SUB_TAB_COUNTS.length) {
        return AUTHORING_HORIZONTAL_SUB_TAB_COUNTS[0];
    }
    return AUTHORING_HORIZONTAL_SUB_TAB_COUNTS[index];
};

/** Channel 0 (Email) uses full-page form skeleton; other channels use a lighter layout. */
export const getAuthoringSkeletonVariant = (channelIndex = 0) => (channelIndex === 0 ? 'full' : 'basic');

/** Skeleton variant for a channel tab from API channel id. */
export const getAuthoringSkeletonVariantForChannelId = (channelId) =>
    getAuthoringSkeletonVariant(getAuthoringVerticalIndexFromChannelId(channelId));
