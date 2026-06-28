import { memo } from 'react';
import PropTypes from 'prop-types';

import LiveTabSkeleton from '../_shared/LiveTabSkeleton';
import { DashboardPortletSkeleton } from '../_shared/dashboardShellSkeleton';
import {
    DbSkColumnChartSkeleton,
    DbSkHorizontalBarsSkeleton,
    DbSkPieChartSkeleton,
    DbSkRetentionTableSkeleton,
} from '../_shared/dashboardContentSkeletons';

const WebLiveTabExtraRows = () => (
    <>
        <div className="db-sk-row db-sk-row--pair">
            <div className="db-sk-col db-sk-col--half">
                <DashboardPortletSkeleton titleWidth={120} size="md">
                    <DbSkRetentionTableSkeleton />
                </DashboardPortletSkeleton>
            </div>
            <div className="db-sk-col db-sk-col--half">
                <DashboardPortletSkeleton titleWidth={160} size="md">
                    <DbSkPieChartSkeleton />
                </DashboardPortletSkeleton>
            </div>
        </div>
        <div className="db-sk-row db-sk-row--pair">
            <div className="db-sk-col db-sk-col--half">
                <DashboardPortletSkeleton titleWidth={140} size="md">
                    <DbSkHorizontalBarsSkeleton />
                </DashboardPortletSkeleton>
            </div>
            <div className="db-sk-col db-sk-col--half">
                <DashboardPortletSkeleton titleWidth={150} size="md">
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
                <DashboardPortletSkeleton titleWidth={150} size="md">
                    <DbSkColumnChartSkeleton />
                </DashboardPortletSkeleton>
            </div>
        </div>
        <div className="db-sk-row db-sk-row--pair">
            <div className="db-sk-col db-sk-col--half">
                <DashboardPortletSkeleton titleWidth={100} size="md">
                    <DbSkPieChartSkeleton />
                </DashboardPortletSkeleton>
            </div>
            <div className="db-sk-col db-sk-col--half">
                <DashboardPortletSkeleton titleWidth={130} withMenu={false} size="md">
                    <DbSkColumnChartSkeleton />
                </DashboardPortletSkeleton>
            </div>
        </div>
    </>
);

const WebLiveTabSkeleton = ({ injectCriticalCss = false }) => (
    <LiveTabSkeleton
        className="db-sk-live-tab db-sk-live-tab--web"
        injectCriticalCss={injectCriticalCss}
        variant="web"
    >
        <WebLiveTabExtraRows />
    </LiveTabSkeleton>
);

WebLiveTabSkeleton.propTypes = {
    injectCriticalCss: PropTypes.bool,
};

export default memo(WebLiveTabSkeleton);
