import { memo } from 'react';
import PropTypes from 'prop-types';

import RecentGaugeCardSkeleton from './RecentGaugeCardSkeleton';

const GaugesCarouselSkeleton = ({ isLoading = true }) => (
    <div className="db-sk-gauges-row" aria-hidden="true">
        {[0, 1, 2].map((index) => (
            <div key={index} className="db-sk-gauge-slot">
                <RecentGaugeCardSkeleton isError={!isLoading} />
            </div>
        ))}
    </div>
);

GaugesCarouselSkeleton.propTypes = {
    isLoading: PropTypes.bool,
};

export default memo(GaugesCarouselSkeleton);
