import PropTypes from 'prop-types';

import { SKELETON_LAYER } from './skeletonLayers';
import { SKELETON_KEYS, resolveSkeletonRouteKey } from './registry/skeletonRouteConfig';
import PreferencesLandingSkeleton from './Components/PreferencesLandingSkeleton';
import { getMainNavActiveIndex } from './Components/mainSkeletonVariants';

/**
 * Single entry for route-aware page skeletons.
 * Pass `layer` so bootstrap / route Suspense / in-page body use the same page design.
 */
export function resolvePageSkeletonElement(pathname = '', { layer = SKELETON_LAYER.ROUTE, activeNavIndex } = {}) {
    const key = resolveSkeletonRouteKey(pathname);
    const navIndex = activeNavIndex ?? getMainNavActiveIndex(pathname);

    if (key === SKELETON_KEYS.preferences) {
        return <PreferencesLandingSkeleton layer={layer} activeNavIndex={navIndex} />;
    }

    return null;
}

export const PageSkeleton = ({ pathname, layer = SKELETON_LAYER.ROUTE, activeNavIndex }) =>
    resolvePageSkeletonElement(pathname, { layer, activeNavIndex });

PageSkeleton.propTypes = {
    pathname: PropTypes.string,
    layer: PropTypes.oneOf(Object.values(SKELETON_LAYER)),
    activeNavIndex: PropTypes.number,
};

export { SKELETON_LAYER };
