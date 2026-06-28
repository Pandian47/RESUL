import { memo } from 'react';
import PropTypes from 'prop-types';

import { TabBarViewSkeleton } from '../../../Components/common';
import MdmPageSkeleton from './MdmPageSkeleton';
import MdmSkeletonScope from './MdmSkeletonScope';

const AUDIENCE_TAB_COUNT = 3;

/**
 * Single MDM loading UI — edit this file to change MDM skeleton everywhere.
 *
 * @param showTabs - false when real RSTabbarFluid tabs are already on screen (/audience).
 * @param showOverviewHeader - Overview row + action icons (matches loaded MasterData).
 */
const AudienceMdmPanelSkeleton = ({
    activeTabIndex = 0,
    hideListActivity = false,
    showOverviewHeader = true,
    showTabs = true,
    injectCriticalCss = true,
}) => (
    <MdmSkeletonScope
        className="audience-mdm-panel-skeleton audience-skeleton-scope--route-content"
        injectCriticalCss={injectCriticalCss}
    >
        {showTabs && (
            <TabBarViewSkeleton
                activeTabIndex={activeTabIndex}
                tabCount={AUDIENCE_TAB_COUNT}
                scopeClass="audience-tabs-skeleton"
                tabsListClass="audience-tabs-skeleton__list"
                containerClass="audience-tabs-skeleton__container px0"
                wrapperClassName="fullWhiteBackground audience-tabs-skeleton mb0"
            />
        )}
        <div className="audience-mdm-tab-skeleton">
            <MdmPageSkeleton
                showOverviewHeader={showOverviewHeader}
                hideListActivity={hideListActivity}
            />
        </div>
    </MdmSkeletonScope>
);

AudienceMdmPanelSkeleton.propTypes = {
    activeTabIndex: PropTypes.number,
    hideListActivity: PropTypes.bool,
    showOverviewHeader: PropTypes.bool,
    showTabs: PropTypes.bool,
    injectCriticalCss: PropTypes.bool,
};

export default memo(AudienceMdmPanelSkeleton);
