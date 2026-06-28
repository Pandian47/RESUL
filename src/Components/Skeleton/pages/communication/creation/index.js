export {
    CommunicationCreationPageContentSkeleton,
    CommunicationCreationSuspenseFallback,
    CommunicationCreationRouteSkeleton,
    CommunicationCreationPlanLoadingBlock,
} from './CommunicationCreationPageSkeleton';

export { default as DeliveryTypeSelectSkeleton } from './DeliveryTypeSelectSkeleton';
export { default as DeliveryMethodTabsSkeleton } from './DeliveryMethodTabsSkeleton';
export { default as CommunicationCreationDeliverySkeleton } from './CommunicationCreationDeliverySkeleton';
export { default as PlanProgressStepsSkeleton } from './PlanProgressStepsSkeleton';
export { default as CampaignInfoSkeleton } from './CampaignInfoSkeleton';

export {
    COMMUNICATION_CREATION_SKELETON_PHASE,
    getCommunicationCreationSkeletonPhase,
    getDeliverySkeletonTypeFromTab,
} from './communicationCreationSkeletonUtils';
