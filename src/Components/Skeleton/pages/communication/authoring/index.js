/** SDC route shells (planner + vertical tabs) — not inner edit gate. */
export {
    AuthoringCreateChannelSkeleton,
    AuthoringCreateChannelSkeletonBlock,
    CommunicationAuthoringPageContentSkeleton,
    CommunicationAuthoringSuspenseFallback,
    CommunicationAuthoringRouteSkeleton,
} from './CommunicationAuthoringPageSkeleton';

/** Inner edit — layouts + host in authoringChannelInnerSkeletonLayouts.jsx; gate in AuthoringChannelEditSkeletonGate.jsx */
export { default, default as AuthoringChannelEditSkeletonGate } from './AuthoringChannelEditSkeletonGate';
export {
    default as AuthoringChannelEditSkeletonHost,
    AuthoringChannelFormSkeletonBlock,
    AuthoringChannelInnerSkeletonLayout,
} from './authoringChannelInnerSkeletonLayouts';
export {
    AUTHORING_CHANNEL_INNER_VARIANT,
    getAuthoringChannelInnerVariant,
    getAuthoringChannelEditSkeletonProfile,
} from './authoringChannelEditSkeletonProfiles';

export {
    AUTHORING_EDIT_API_LOADER_CONFIG,
    AUTHORING_FIELD_LOADER_CONFIG,
    AUTHORING_SAVE_LOADER_CONFIG,
    getAuthoringSaveButtonType,
    MDC_SUPPRESS_GLOBAL_LOADER,
    MDC_SUPPRESS_ENABLE_LOADER,
    isMdcCampaignAuthoring,
    getAuthoringChannelSkeletonLayout,
    resolveAuthoringEditSkeletonGateLoading,
    getAuthoringEditFieldLoaderConfig,
    AUTHORING_VERTICAL_TAB_INDEX,
    AUTHORING_VERTICAL_TAB_CHANNEL_IDS,
    getAuthoringChannelIdFromVerticalIndex,
    getAuthoringEditApiLoaderConfig,
    getAuthoringVerticalIndexFromChannelId,
    isAuthoringChannelSaved,
    resetAuthoringChannelEditSession,
} from './authoringChannelSkeletonConfig';

/** MDC route shell only (no vertical tabs). */
export {
    MdcAuthoringPageContentSkeleton,
    MdcAuthoringSuspenseFallback,
    MdcAuthoringRouteSkeleton,
} from '../mdcAuthoring';

export {
    getAuthoringChannelIndex,
    getAuthoringSkeletonVariant,
    getAuthoringSkeletonVariantForChannelId,
} from './authoringSkeletonUtils';
export { default as useAuthoringChannelEditLoader, useAuthoringChannelSaveLoader } from '../../../hooks/useAuthoringChannelEditLoader';
