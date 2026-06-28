/** Avoid duplicate list/gallery skeleton right after route Suspense fallback unmounts. */
let routeSkeletonPhase = false;

export const markCommunicationRouteSkeleton = () => {
    routeSkeletonPhase = true;
};

export const consumeCommunicationRouteSkeleton = () => {
    if (!routeSkeletonPhase) return false;
    routeSkeletonPhase = false;
    return true;
};
