import { memo } from 'react';
import { skeletonBlockStyle } from '../dashboardSkeletonUtils';
import GaugesCarouselSkeleton from './GaugesCarouselSkeleton';

const RecentCommunicationGaugesSkeleton = () => (
    <div className="db-sk-comm-gauges">
        <div className="db-sk-gauges-toolbar">
            <div className="db-sk-block" style={skeletonBlockStyle({ width: 200, height: 21 })} />
        </div>
        <GaugesCarouselSkeleton isLoading />
    </div>
);

export default memo(RecentCommunicationGaugesSkeleton);
