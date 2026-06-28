import { memo, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';

import DashboardSkeletonScope from '../DashboardSkeletonScope';
import { markDashboardCommTabSkeletonPhase } from '../dashboardRouteSkeletonPhase';
import { DashboardPortletSkeleton } from '../_shared/dashboardShellSkeleton';
import {
    DbSkBubbleChartSkeleton,
    DbSkColumnChartSkeleton,
    DbSkHorizontalBarsSkeleton,
    DbSkLineChartSkeleton,
    DbSkPieChartSkeleton,
} from '../_shared/dashboardContentSkeletons';
import RecentCommunicationGaugesSkeleton from './RecentCommunicationGaugesSkeleton';

const CommunicationTabSkeleton = ({ injectCriticalCss = false, includeGauges = false }) => {
    useLayoutEffect(() => {
        if (!includeGauges) {
            markDashboardCommTabSkeletonPhase();
        }
    }, [includeGauges]);

    return (
        <DashboardSkeletonScope className="db-sk-comm-tab" injectCriticalCss={injectCriticalCss}>
            {includeGauges ? (
                <div className="db-sk-row db-sk-row--gauges">
                    <div className="db-sk-col db-sk-col--full">
                        <RecentCommunicationGaugesSkeleton />
                    </div>
                </div>
            ) : null}
            <div className="db-sk-row db-sk-row--pair">
                <div className="db-sk-col db-sk-col--half">
                    <DashboardPortletSkeleton titleWidth={190} size="md">
                        <DbSkColumnChartSkeleton />
                    </DashboardPortletSkeleton>
                </div>
                <div className="db-sk-col db-sk-col--half">
                    <DashboardPortletSkeleton titleWidth={230} size="md">
                        <DbSkHorizontalBarsSkeleton />
                    </DashboardPortletSkeleton>
                </div>
            </div>
            <div className="db-sk-row db-sk-row--pair">
                <div className="db-sk-col db-sk-col--half">
                    <DashboardPortletSkeleton titleWidth={170} size="md">
                        <DbSkBubbleChartSkeleton />
                    </DashboardPortletSkeleton>
                </div>
                <div className="db-sk-col db-sk-col--half">
                    <DashboardPortletSkeleton titleWidth={220} size="md">
                        <DbSkHorizontalBarsSkeleton />
                    </DashboardPortletSkeleton>
                </div>
            </div>
            <div className="db-sk-row db-sk-row--pair">
                <div className="db-sk-col db-sk-col--half">
                    <DashboardPortletSkeleton titleWidth={120} size="md">
                        <DbSkPieChartSkeleton />
                    </DashboardPortletSkeleton>
                </div>
                <div className="db-sk-col db-sk-col--half">
                    <DashboardPortletSkeleton titleWidth={100} withMenu={false} size="md">
                        <DbSkLineChartSkeleton />
                    </DashboardPortletSkeleton>
                </div>
            </div>
            <div className="db-sk-row db-sk-row--pair">
                <div className="db-sk-col db-sk-col--half">
                    <DashboardPortletSkeleton titleWidth={150} withMenu={false} size="md">
                        <DbSkPieChartSkeleton />
                    </DashboardPortletSkeleton>
                </div>
                <div className="db-sk-col db-sk-col--half">
                    <DashboardPortletSkeleton titleWidth={190} withMenu={false} size="md">
                        <DbSkPieChartSkeleton />
                    </DashboardPortletSkeleton>
                </div>
            </div>
        </DashboardSkeletonScope>
    );
};

CommunicationTabSkeleton.propTypes = {
    injectCriticalCss: PropTypes.bool,
    includeGauges: PropTypes.bool,
};

export default memo(CommunicationTabSkeleton);
