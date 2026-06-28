import { memo } from 'react';
import PropTypes from 'prop-types';

import AudienceListSkeleton from 'Components/Skeleton/Components/AudienceListSkeleton';
import ListAqusitionSekelton from 'Components/Skeleton/Components/ListAqusitionSekelton';
import { mdmPageSkeletonCriticalCss } from './mdmSkeletonCriticalCss';
import MdmOverviewHeaderSkeleton from './MdmOverviewHeaderSkeleton';
import MdmOverviewRowSkeleton from './MdmOverviewRowSkeleton';

/**
 * MDM page body layout (overview + bubble/cards + chart + grid).
 * Spacing via mdm-sk-* classes in critical CSS — no page utility classes.
 */
const MdmPageSkeleton = ({ showOverviewHeader = true, hideListActivity = false, injectCriticalCss = true }) => (
    <div className="mdm-page-skeleton" aria-hidden="true">
        {injectCriticalCss ? <style>{mdmPageSkeletonCriticalCss}</style> : null}
        {showOverviewHeader ? <MdmOverviewHeaderSkeleton /> : null}
        <MdmOverviewRowSkeleton />
        {!hideListActivity ? (
            <div className="mdm-sk-list-activity-wrap">
                <ListAqusitionSekelton removeOffset disableLegendAnimation injectCriticalCss={false} />
            </div>
        ) : null}
        <AudienceListSkeleton injectCriticalCss={false} />
    </div>
);

MdmPageSkeleton.propTypes = {
    showOverviewHeader: PropTypes.bool,
    hideListActivity: PropTypes.bool,
    injectCriticalCss: PropTypes.bool,
};

export default memo(MdmPageSkeleton);
