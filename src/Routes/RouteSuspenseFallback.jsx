import { memo } from 'react';
import { useLocation } from 'react-router-dom';

import MainPageSkeleton from 'Components/Skeleton/Components/MainPageSkeleton';
import { getRouteSuspenseFallback } from 'Components/Skeleton/registry/resolveRouteSkeleton';

const RouteSuspenseFallback = () => {
    const { pathname } = useLocation();
    const DedicatedFallback = getRouteSuspenseFallback(pathname);
    if (DedicatedFallback) {
        return <DedicatedFallback />;
    }
    return <MainPageSkeleton withAppShell />;
};

export default memo(RouteSuspenseFallback);
