/** Avoid duplicate analytics list skeleton right after route Suspense fallback. */
let routeSkeletonPhase = false;

/** CSR analytics report — bootstrap / Suspense / in-page share one shell. */
let analyticsReportRouteSkeletonPhase = false;

export const markAnalyticsRouteSkeleton = () => {
    routeSkeletonPhase = true;
};

export const consumeAnalyticsRouteSkeleton = () => {
    if (!routeSkeletonPhase) return false;
    routeSkeletonPhase = false;
    return true;
};

export const markAnalyticsReportRouteSkeleton = () => {
    analyticsReportRouteSkeletonPhase = true;
};

export const consumeAnalyticsReportRouteSkeleton = () => {
    if (!analyticsReportRouteSkeletonPhase) return false;
    analyticsReportRouteSkeletonPhase = false;
    return true;
};
