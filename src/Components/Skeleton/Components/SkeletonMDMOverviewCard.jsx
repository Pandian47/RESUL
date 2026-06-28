import { memo } from 'react';
import PropTypes from 'prop-types';

import MdmOverviewRowSkeleton from 'Components/Skeleton/pages/audience/mdm/MdmOverviewRowSkeleton';
import { mdmOverviewSkeletonCriticalCss } from 'Components/Skeleton/pages/audience/mdm/mdmSkeletonCriticalCss';

/** Mirrors Overview.jsx: chart + 2×2 profile cards, equal column height. */
const SkeletonMDMOverviewCard = ({ injectCriticalCss = true }) => (
    <div className="mdm-page-skeleton" aria-hidden="true">
        {injectCriticalCss ? <style>{mdmOverviewSkeletonCriticalCss}</style> : null}
        <MdmOverviewRowSkeleton />
    </div>
);

SkeletonMDMOverviewCard.propTypes = {
    injectCriticalCss: PropTypes.bool,
};

export default memo(SkeletonMDMOverviewCard);
