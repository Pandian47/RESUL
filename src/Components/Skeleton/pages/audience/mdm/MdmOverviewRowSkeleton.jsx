import { memo } from 'react';
import MdmProfileCardSkeleton from './MdmProfileCardSkeleton';
import MdmOverviewBubbleSkeleton from './MdmOverviewChartSkeleton';
import { skeletonBlockStyle } from './mdmSkeletonUtils';

const MdmOverviewRowSkeleton = () => (
    <div className="mdm-sk-overview-row">
        <div className="mdm-sk-overview-chart-col">
            <div className="mdm-sk-chart-portlet">
                <div className="mdm-sk-chart-portlet-header">
                    <div className="mdm-sk-block" style={skeletonBlockStyle({ width: 100, height: 18 })} />
                    <div className="mdm-sk-block" style={skeletonBlockStyle({ width: 18, height: 18, circle: true })} />
                </div>
                <div className="mdm-sk-chart-portlet-body">
                    <MdmOverviewBubbleSkeleton />
                </div>
            </div>
        </div>
        <div className="mdm-sk-overview-cards-col">
            <div className="mdm-sk-cards-grid">
                <div className="mdm-sk-overview-card-col mdm-sk-overview-card-col--spaced mdm-sk-overview-card-col--pl0">
                    <MdmProfileCardSkeleton />
                </div>
                <div className="mdm-sk-overview-card-col mdm-sk-overview-card-col--spaced mdm-sk-overview-card-col--pr0">
                    <MdmProfileCardSkeleton />
                </div>
                <div className="mdm-sk-overview-card-col mdm-sk-overview-card-col--pl0">
                    <MdmProfileCardSkeleton />
                </div>
                <div className="mdm-sk-overview-card-col mdm-sk-overview-card-col--pr0">
                    <MdmProfileCardSkeleton />
                </div>
            </div>
        </div>
    </div>
);

export default memo(MdmOverviewRowSkeleton);
