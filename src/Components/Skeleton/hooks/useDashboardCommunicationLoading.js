import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

const DASHBOARD_API_KEYS = [
    'recentCampaigns',
    'channelPerformance',
    'topPerformances',
    'audienceBehaviour',
    'topEarnings',
    'roiData',
    'leadsData',
    'avgTimeData',
    // 'segmentindustry',
];

/**
 * Single loading flag for Communication dashboard — avoids mixed per-widget skeletons on first load.
 * @param {string} reducerKey — Redux slice key (`dashboardReducer` or `dashboardTwinsReducer`)
 */
const useDashboardCommunicationLoading = (reducerKey = 'dashboardReducer') => {
    const dashboardState = useSelector((state) => state[reducerKey] ?? {});

    const [hydrating, setHydrating] = useState(true);
    /** True only after at least one dashboard API has entered isLoading — avoids clearing hydrating before fetch starts. */
    const hasSeenLoadingRef = useRef(false);

    const isAnyApiLoading = DASHBOARD_API_KEYS.some((key) => dashboardState[key]?.isLoading === true);

    useEffect(() => {
        if (isAnyApiLoading) {
            hasSeenLoadingRef.current = true;
            return;
        }
        if (hasSeenLoadingRef.current) {
            setHydrating(false);
        }
    }, [isAnyApiLoading]);

    const beginDashboardLoad = useCallback(() => {
        setHydrating(true);
        hasSeenLoadingRef.current = false;
    }, []);

    const skipDashboardLoad = useCallback(() => {
        setHydrating(false);
        hasSeenLoadingRef.current = true;
    }, []);

    // Full-page skeleton only during initial hydrate (beginDashboardLoad → all APIs settled).
    // Per-widget refreshes (e.g. segment/industry dropdown) must not remount the whole tab.
    const isDashboardPageLoading = hydrating;

    return {
        isDashboardPageLoading,
        beginDashboardLoad,
        skipDashboardLoad,
    };
};

export default useDashboardCommunicationLoading;
