/** Avoid duplicate MDM / list body skeleton right after route Suspense fallback unmounts. */

let routeSkeletonPhase = false;



export const markAudienceRouteSkeleton = () => {

    routeSkeletonPhase = true;

};



export const consumeAudienceRouteSkeleton = () => {

    if (!routeSkeletonPhase) return false;

    routeSkeletonPhase = false;

    return true;

};

