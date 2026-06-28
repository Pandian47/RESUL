import { memo } from 'react';
import PropTypes from 'prop-types';

import DashboardSkeletonScope from '../DashboardSkeletonScope';
import { DashboardPortletSkeleton } from './dashboardShellSkeleton';
import { skeletonBlockStyle } from '../dashboardSkeletonUtils';
import {
    DbSkActiveUsersBodySkeleton,
    DbSkColumnChartSkeleton,
    DbSkKeyMetricsBodySkeleton,
    DbSkPathAnalyserSkeleton,
    DbSkPieChartSkeleton,
    DbSkTrafficChartSkeleton,
    DbSkUserStatusSkeleton,
} from './dashboardContentSkeletons';
import { LIVE_PATH_ANALYSER_FILTER_COUNT_MOBILE, LIVE_PATH_ANALYSER_FILTER_COUNT_WEB } from '../dashboardSkeletonUtils';

const LiveTabSkeleton = ({
    className = 'db-sk-live-tab',
    injectCriticalCss = false,
    variant = 'web',
    children = null,
}) => (
    <DashboardSkeletonScope className={className} injectCriticalCss={injectCriticalCss}>
        <div className="db-sk-row db-sk-row--top">
            <div className="db-sk-col db-sk-col--4">
                <DashboardPortletSkeleton titleWidth={180} size="sm">
                    <DbSkUserStatusSkeleton />
                </DashboardPortletSkeleton>
            </div>
            <div className="db-sk-col db-sk-col--8">
                <DashboardPortletSkeleton titleWidth={220} size="sm">
                    <DbSkTrafficChartSkeleton />
                </DashboardPortletSkeleton>
            </div>
        </div>
        <div className="db-sk-row db-sk-row--metrics">
            <div className="db-sk-col db-sk-col--4">
                <div className="db-sk-keymetrics">
                    <div className="db-sk-keymetrics__title mb15">
                        <div className="db-sk-block" style={skeletonBlockStyle({ width: 120, height: 20 })} />
                    </div>
                    <DbSkKeyMetricsBodySkeleton />
                </div>
            </div>
            <div className="db-sk-col db-sk-col--8">
                <div className="db-sk-keymetrics">
                    <div className="db-sk-keymetrics__title mb15">
                        <div className="db-sk-block" style={skeletonBlockStyle({ width: 110, height: 20 })} />
                    </div>
                    <DbSkActiveUsersBodySkeleton />
                </div>
            </div>
        </div>
        <div className="db-sk-row db-sk-row--path">
            <div className="db-sk-col db-sk-col--full">
                <DbSkPathAnalyserSkeleton
                    filterCount={
                        variant === 'mobile'
                            ? LIVE_PATH_ANALYSER_FILTER_COUNT_MOBILE
                            : LIVE_PATH_ANALYSER_FILTER_COUNT_WEB
                    }
                />
            </div>
        </div>
        <div className="db-sk-row db-sk-row--audience">
            <div className="db-sk-col db-sk-col--half">
                <DashboardPortletSkeleton titleWidth={130} size="md">
                    <DbSkPieChartSkeleton />
                </DashboardPortletSkeleton>
            </div>
            <div className="db-sk-col db-sk-col--half">
                <DashboardPortletSkeleton titleWidth={160} size="md">
                    <DbSkColumnChartSkeleton />
                </DashboardPortletSkeleton>
            </div>
        </div>
        {children}
    </DashboardSkeletonScope>
);

LiveTabSkeleton.propTypes = {
    className: PropTypes.string,
    injectCriticalCss: PropTypes.bool,
    variant: PropTypes.oneOf(['web', 'mobile']),
    children: PropTypes.node,
};

export default memo(LiveTabSkeleton);
