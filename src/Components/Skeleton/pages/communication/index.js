/**
 * Communication module skeletons — list / gallery / planner tabs.
 * @example import { CommunicationSuspenseFallback } from 'Components/Skeleton/pages/communication';
 */
export {
    CommunicationPageContentSkeleton,
    CommunicationSuspenseFallback,
    CommunicationRouteSkeleton,
    CommunicationTabBodySkeleton,
    CommunicationPageHeaderSkeleton,
    CommunicationTabsSkeleton,
    default,
} from './CommunicationPageSkeleton';

export { ListTabSkeleton, CommunicationListTabSkeleton } from './list';
export { GalleryTabSkeleton, CommunicationGalleryTabSkeleton } from './gallery';
export { PlannerTabSkeleton, CommunicationPlannerTabSkeleton } from './planner';

export {
    communicationSkeletonCriticalCss,
    splitABSchedulerModalSkeletonCriticalCss,
} from './communicationSkeletonCriticalCss';
export { SplitABSchedulerModalSkeleton } from './CommunicationPageSkeleton';

export {
    CommunicationCreationPageContentSkeleton,
    CommunicationCreationSuspenseFallback,
    CommunicationCreationRouteSkeleton,
    CommunicationCreationPlanLoadingBlock,
    DeliveryTypeSelectSkeleton,
    DeliveryMethodTabsSkeleton,
    CommunicationCreationDeliverySkeleton,
    PlanProgressStepsSkeleton,
    CampaignInfoSkeleton,
    COMMUNICATION_CREATION_SKELETON_PHASE,
    getCommunicationCreationSkeletonPhase,
    getDeliverySkeletonTypeFromTab,
} from './creation';

export {
    AuthoringChannelFormSkeletonBlock,
    AuthoringChannelEditSkeletonGate,
    AuthoringCreateChannelSkeleton,
    AuthoringCreateChannelSkeletonBlock,
    CommunicationAuthoringPageContentSkeleton,
    CommunicationAuthoringSuspenseFallback,
    CommunicationAuthoringRouteSkeleton,
    AUTHORING_EDIT_API_LOADER_CONFIG,
    AUTHORING_VERTICAL_TAB_INDEX,
    getAuthoringVerticalIndexFromChannelId,
    isAuthoringChannelSaved,
    getAuthoringChannelIndex,
    getAuthoringSkeletonVariant,
    getAuthoringSkeletonVariantForChannelId,
    useAuthoringChannelEditLoader,
} from './authoring';

export {
    ExecuteAnalyzeBodySkeletonBlock,
    ExecutePageLoadingSkeletonBlock,
    ExecuteContentSkeleton,
    ExecuteMainPanelSkeleton,
    CommunicationExecutePageContentSkeleton,
    CommunicationExecuteSuspenseFallback,
    CommunicationExecuteRouteSkeleton,
} from './execute';
