import { memo } from 'react';
import PropTypes from 'prop-types';
import { Container } from 'react-bootstrap';

import {
    BreadcrumbSkeleton,
    RSPageHeaderSkeleton,
    TabBarViewSkeleton,
    createPageLoadingScene,
} from '../../Components/common';
import { audienceSkeletonCriticalCss } from './audienceSkeletonCriticalCss';
import { markAudienceRouteSkeleton } from './audienceRouteSkeletonPhase';
import { AudienceMdmTabSkeleton, AudienceTargetListTabSkeleton } from './audienceTabBodies';

const AUDIENCE_TAB_COUNT = 3;
export const AudiencePageHeaderSkeleton = () => (
    <RSPageHeaderSkeleton variant="audience" className="audience-page-header-skeleton" />
);

const AudienceTabsSkeleton = (props) => (
    <TabBarViewSkeleton
        tabCount={AUDIENCE_TAB_COUNT}
        scopeClass="audience-tabs-skeleton"
        tabsListClass="audience-tabs-skeleton__list"
        containerClass="audience-tabs-skeleton__container px0"
        wrapperClassName="fullWhiteBackground audience-tabs-skeleton mb0 mt7"
        omitColClass
        {...props}
    />
);

export const AudienceTabBodySkeleton = ({
    tabIndex = 0,
    hideListActivity = false,
    showTabs = false,
    showOverviewHeader = true,
    showToolbar = true,
}) => {
    if (tabIndex === 1 || tabIndex === 2) {
        return <AudienceTargetListTabSkeleton showToolbar={showToolbar} />;
    }
    return (
        <AudienceMdmTabSkeleton
            activeTabIndex={0}
            hideListActivity={hideListActivity}
            showTabs={showTabs}
            showOverviewHeader={showOverviewHeader}
        />
    );
};

AudienceTabBodySkeleton.propTypes = {
    tabIndex: PropTypes.number,
    hideListActivity: PropTypes.bool,
    showTabs: PropTypes.bool,
    showOverviewHeader: PropTypes.bool,
    showToolbar: PropTypes.bool,
};

const AudiencePageShellSkeleton = ({ tabIndex = 0, children }) => (
    <>
        <AudiencePageHeaderSkeleton />
        <BreadcrumbSkeleton tabIndex={tabIndex} />
        <Container fluid>
            <div className="page-content audience-page-shell-skeleton__content">
                <AudienceTabsSkeleton activeTabIndex={tabIndex} />
                <Container className="px0 audience-tab-panel-skeleton">{children}</Container>
            </div>
        </Container>
    </>
);

const audienceLoadingScene = createPageLoadingScene({
    scopeClass: 'audience-skeleton-scope',
    suspenseFallbackClass: 'audience-suspense-fallback',
    ariaLabel: 'Loading audience',
    pageCriticalCss: audienceSkeletonCriticalCss,
    markRouteSkeleton: markAudienceRouteSkeleton,
    TabBodySkeleton: AudienceTabBodySkeleton,
    PageShellSkeleton: AudiencePageShellSkeleton,
    getTabBodyProps: (tabIndex) => ({
        showTabs: false,
        showOverviewHeader: tabIndex === 0,
        showToolbar: tabIndex === 1 || tabIndex === 2,
    }),
});

export const AudiencePageContentSkeleton = audienceLoadingScene.PageContentSkeleton;
export const AudienceRouteSkeleton = audienceLoadingScene.RouteSkeleton;
export const AudienceSuspenseFallback = audienceLoadingScene.SuspenseFallback;

export { AudiencePageShellSkeleton, AudienceTabsSkeleton };
export default memo(AudiencePageContentSkeleton);

AudienceRouteSkeleton.propTypes = {
    activeTabIndex: PropTypes.number,
    withAppShell: PropTypes.bool,
    activeNavIndex: PropTypes.number,
    contentOnly: PropTypes.bool,
    layer: PropTypes.string,
};
