/** Avoid duplicate comm-tab skeleton immediately after route Suspense fallback. */
let routeSkeletonPhase = false;
/** Set while CommunicationTabSkeleton is on screen (page-level dashboard load). */
let commTabSkeletonPhase = false;

export const markDashboardRouteSkeleton = () => {
    routeSkeletonPhase = true;
};

export const consumeDashboardRouteSkeleton = () => {
    if (!routeSkeletonPhase) return false;
    routeSkeletonPhase = false;
    return true;
};

export const markDashboardCommTabSkeletonPhase = () => {
    commTabSkeletonPhase = true;
};

export const consumeDashboardCommTabSkeletonPhase = () => {
    if (!commTabSkeletonPhase) return false;
    commTabSkeletonPhase = false;
    return true;
};
