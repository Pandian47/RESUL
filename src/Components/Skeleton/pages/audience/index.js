/**
 * Audience skeletons — shell + target list; MDM in ./mdm
 * @example import { AudienceSuspenseFallback, AudienceMdmPanelSkeleton } from 'Components/Skeleton/pages/audience';
 */
export {
    AudiencePageContentSkeleton,
    AudiencePageHeaderSkeleton,
    AudienceRouteSkeleton,
    AudienceSuspenseFallback,
    AudienceTabBodySkeleton,
    AudiencePageShellSkeleton,
    AudienceTabsSkeleton,
    default,
} from './AudiencePageSkeleton';

export { markAudienceRouteSkeleton, consumeAudienceRouteSkeleton } from './audienceRouteSkeletonPhase';

export { default as AudienceTargetListToolbarSkeleton } from './AudienceTargetListToolbarSkeleton';

export { AudienceTargetListTabSkeleton, AudienceMdmTabSkeleton } from './audienceTabBodies';
export {
    AudienceTargetListCreationSkeleton,
    AudienceTargetListCreationLoadingBlock,
    AudienceTargetListCreationSuspenseFallback,
    TargetListCreationBodySkeleton,
    TargetListCreationPageShellSkeleton,
} from './AudienceTargetListCreationSkeleton';

export { default as TargetListCreationPageHeaderSkeleton } from './TargetListCreationPageHeaderSkeleton';

export { audienceSkeletonCriticalCss } from './audienceSkeletonCriticalCss';
export { audienceTargetListCreationCriticalCss } from './audienceTargetListCreationCriticalCss';
export { segmentSkeletonCriticalCss } from '../../Components/segmentSkeletonCriticalCss';

export { AddAudiencePageSkeleton, AddAudienceLoadingBlock, AddAudienceFormSkeleton, addAudienceSkeletonCriticalCss } from './addAudience';

export {
    DynamicListCreationPageSkeleton,
    DynamicListCreationLoadingBlock,
    DynamicListCreationSuspenseFallback,
    DynamicListCreationFormSkeleton,
    dynamicListCreationSkeletonCriticalCss,
} from './dynamicList';

export * from './mdm';
