import { memo } from 'react';
import PropTypes from 'prop-types';

import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';

const RecentGaugeCardSkeleton = ({ isError = false }) => (
    <div className="db-sk-gauge-card">
        <span className="db-sk-gauge-card__title" aria-hidden="true" />
        <div className="db-sk-gauge-card__body">
            {isError ? <NoDataAvailableRender className="nodata-skeleton-con" /> : null}
            <div className="db-sk-gauge-card__left">
                <span className="db-sk-gauge-card__line" aria-hidden="true" />
                <span className="db-sk-gauge-card__line db-sk-gauge-card__line--short" aria-hidden="true" />
            </div>
            <div className="db-sk-gauge-card__gauge">
                <span className="db-sk-gauge-card__arc" aria-hidden="true" />
            </div>
        </div>
        <div className="db-sk-gauge-card__footer pr0">
            <span className="db-sk-gauge-card__date" aria-hidden="true" />
        </div>
    </div>
);

RecentGaugeCardSkeleton.propTypes = {
    isError: PropTypes.bool,
};

export default memo(RecentGaugeCardSkeleton);
