import { memo } from 'react';
import PropTypes from 'prop-types';

import GridLoadingSkeleton from 'Pages/KendoDocs/CommonComponents/ResKendoGrid/GridLoadingSkeleton';
import { CommunicationListCardSkeleton } from 'Pages/KendoDocs/CommonComponents/ResGrid/GridSkeleton';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';
import {
    AudienceDetailSkeleton,
    AudienceReportSkeleton,
    BubbleChartSkeleton,
    PathToConversionFlowChartSkeleton,
} from 'Components/Skeleton/Skeleton';
import { createPageLoadingScene } from '../../Components/common';
import { analyticsSkeletonCriticalCss } from './analyticsSkeletonCriticalCss';
import { markAnalyticsRouteSkeleton } from './analyticsRouteSkeletonPhase';
import { skeletonBlockStyle, LIVE_PORTLET_MD_BODY_HEIGHT } from '../dashboard/dashboardSkeletonUtils';

const ANALYTICS_TAB_COUNT = 3;
const ANALYTICS_LIST_ROW_COUNT = 5;
const A360_CHANNEL_COUNT = 5;
const AUDIT_GRID_ROWS = 5;
const AUDIT_GRID_COLUMNS = 4;

export const AnalyticsPageHeaderSkeleton = () => (
    <div className="an-sk-header">
        <div className="an-sk-header-left">
            <div className="an-sk-block" style={skeletonBlockStyle({ width: 220, height: 32, radius: 4 })} />
        </div>
        <div className="an-sk-header-right">
            <div className="an-sk-block" style={skeletonBlockStyle({ width: 120, height: 24, radius: 4 })} />
            <div className="an-sk-block" style={skeletonBlockStyle({ width: 100, height: 24, radius: 4 })} />
        </div>
    </div>
);

const AnalyticsBreadcrumbSkeleton = () => <div className="an-sk-breadcrumb" aria-hidden="true" />;

export const AnalyticsTabsSkeleton = ({ activeTabIndex = 0 }) => (
    <div className="an-sk-tabs-wrap">
        <div className="an-sk-tabs">
            {Array.from({ length: ANALYTICS_TAB_COUNT }, (_, index) => (
                <div
                    key={index}
                    className={`an-sk-tab${index === activeTabIndex ? ' an-sk-tab--active' : ''}`}
                    aria-hidden="true"
                />
            ))}
        </div>
    </div>
);

AnalyticsTabsSkeleton.propTypes = {
    activeTabIndex: PropTypes.number,
};

const AnalyticsPortletSkeleton = ({ titleWidth = 150, withMenu = true, bodyMinHeight, children, className = '' }) => (
    <div className={`an-sk-portlet ${className}`.trim()}>
        <div className="an-sk-portlet-header">
            <div className="an-sk-block" style={skeletonBlockStyle({ width: titleWidth, height: 24, radius: 4 })} />
            {withMenu ? (
                <div className="an-sk-block" style={skeletonBlockStyle({ width: 24, height: 24, circle: true })} />
            ) : null}
        </div>
        <div
            className={`an-sk-portlet-body${bodyMinHeight == null ? ' an-sk-portlet-body--auto' : ''}`}
            style={bodyMinHeight != null ? { minHeight: bodyMinHeight } : undefined}
        >
            {children}
        </div>
    </div>
);

AnalyticsPortletSkeleton.propTypes = {
    titleWidth: PropTypes.number,
    withMenu: PropTypes.bool,
    bodyMinHeight: PropTypes.number,
    children: PropTypes.node,
    className: PropTypes.string,
};

/** List rows only — ResGrid CommunicationListCardSkeleton (104px cards, 21px gap). */
export const AnalyticsListRowsSkeleton = ({ count = ANALYTICS_LIST_ROW_COUNT, injectCriticalCss = true }) => (
    <div className="an-sk-list-rows-wrap rs-grid-listing" aria-hidden="true">
        {injectCriticalCss ? <style>{analyticsSkeletonCriticalCss}</style> : null}
        <div className="resgrid resgrid-listing">
            <div className="resgrid--skeleton-list" role="status" aria-label="Loading analytics list">
                {Array.from({ length: count }, (_, index) => (
                    <CommunicationListCardSkeleton key={`analytics-list-row-skel-${index}`} animated />
                ))}
            </div>
        </div>
    </div>
);

AnalyticsListRowsSkeleton.propTypes = {
    count: PropTypes.number,
    injectCriticalCss: PropTypes.bool,
};

const AnalyticsListToolbarSkeleton = () => (
    <div className="an-sk-list-toolbar" aria-hidden="true">
        <div className="an-sk-list-toolbar-actions">
            <div className="an-sk-block" style={skeletonBlockStyle({ width: 280, height: 24, radius: 4 })} />
            <div className="an-sk-block" style={skeletonBlockStyle({ width: 160, height: 24, radius: 4 })} />
            <div className="an-sk-block" style={skeletonBlockStyle({ width: 24, height: 24, circle: true })} />
            <div className="an-sk-block" style={skeletonBlockStyle({ width: 24, height: 24, circle: true })} />
        </div>
    </div>
);

export const AnalyticsListTabSkeleton = ({ count = ANALYTICS_LIST_ROW_COUNT }) => (
    <div className="an-sk-list-tab" aria-hidden="true">
        <AnalyticsListToolbarSkeleton />
        <AnalyticsListRowsSkeleton count={count} injectCriticalCss={false} />
    </div>
);

AnalyticsListTabSkeleton.propTypes = {
    count: PropTypes.number,
};

const A360_ACTIVITY_LEVEL_HEIGHT = 409;

const A360NoData = ({ className = '' }) => (
    <NoDataAvailableRender className={`nodata-skeleton-con ${className}`.trim()} />
);

/** Activity level — critical-CSS block (route + live portlet loading / no-data). */
export const A360ActivityLevelBodySkeleton = ({ isError = false }) => (
    <div className={`an-sk-a360-slot an-sk-a360-activity-slot${isError ? ' an-sk-static' : ''}`}>
        {isError ? <A360NoData /> : null}
        <div className="an-sk-block an-sk-a360-activity-level" style={{ width: '100%', borderRadius: 4 }} aria-hidden="true" />
    </div>
);

A360ActivityLevelBodySkeleton.propTypes = {
    isError: PropTypes.bool,
};

/** Top 5 channels — critical-CSS channel row (route + live portlet loading / no-data). */
export const A360Top5ChannelsBodySkeleton = ({ isError = false }) => (
    <div className={`an-sk-a360-slot an-sk-a360-channels-slot${isError ? ' an-sk-static' : ''}`}>
        {isError ? <A360NoData /> : null}
        <div className="an-sk-a360-channels">
            {Array.from({ length: A360_CHANNEL_COUNT }, (_, index) => (
                <div key={index} className="an-sk-a360-channel">
                    <span className="an-sk-a360-channel__body an-sk-block" aria-hidden="true" />
                </div>
            ))}
        </div>
    </div>
);

A360Top5ChannelsBodySkeleton.propTypes = {
    isError: PropTypes.bool,
};

/** Audience behavior bubble — critical-CSS (route + live portlet loading / no-data). */
export const A360AudienceBehaviorBodySkeleton = ({ isError = false }) => (
    <BubbleChartSkeleton connected isError={isError} />
);

A360AudienceBehaviorBodySkeleton.propTypes = {
    isError: PropTypes.bool,
};

export const AnalyticsAudience360TabSkeleton = () => (
    <div className="an-sk-a360-tab audienceAnalytics360PageCSS" aria-hidden="true">
        <div className="an-sk-a360-header audiance-analytics-header">
            <div className="an-sk-block" style={skeletonBlockStyle({ width: 100, height: 22, radius: 4 })} />
            <ul className="an-sk-a360-header-actions">
                {Array.from({ length: 3 }, (_, index) => (
                    <li key={index}>
                        <div className="an-sk-block" style={skeletonBlockStyle({ width: 32, height: 32, circle: true })} />
                    </li>
                ))}
            </ul>
        </div>

        <AnalyticsPortletSkeleton titleWidth={120} withMenu={false} bodyMinHeight={A360_ACTIVITY_LEVEL_HEIGHT}>
            <A360ActivityLevelBodySkeleton />
        </AnalyticsPortletSkeleton>

        <AnalyticsPortletSkeleton titleWidth={150} className="pref-a360-skel-channels" bodyMinHeight={211}>
            <A360Top5ChannelsBodySkeleton />
        </AnalyticsPortletSkeleton>

        <AnalyticsPortletSkeleton
            titleWidth={150}
            className="pref-a360-skel-behavior areaspline-x-axis-labels portlet-md"
            bodyMinHeight={LIVE_PORTLET_MD_BODY_HEIGHT}
        >
            <div className="portlet-body bubble-audience-behaviour-del">
                <A360AudienceBehaviorBodySkeleton />
            </div>
        </AnalyticsPortletSkeleton>

        <AnalyticsPortletSkeleton titleWidth={240} className="pathConversion">
            <PathToConversionFlowChartSkeleton />
        </AnalyticsPortletSkeleton>

        <AudienceReportSkeleton />

        <AudienceDetailSkeleton hideTitle />
    </div>
);

export const AnalyticsAuditTabSkeleton = ({ rows = AUDIT_GRID_ROWS }) => (
    <div className="an-sk-audit-tab" aria-hidden="true">
        <div className="an-sk-audit-toolbar">
            <div className="an-sk-block" style={skeletonBlockStyle({ width: 200, height: 32, radius: 4 })} />
        </div>
        <div className="an-sk-audit-grid">
            <GridLoadingSkeleton
                rows={rows}
                columns={AUDIT_GRID_COLUMNS}
                isLoading
                injectCriticalCss={false}
                wrapperClassName=""
            />
        </div>
    </div>
);

AnalyticsAuditTabSkeleton.propTypes = {
    rows: PropTypes.number,
};

export const AnalyticsTabBodySkeleton = ({ tabIndex = 0 }) => {
    if (tabIndex === 1) return <AnalyticsAudience360TabSkeleton />;
    if (tabIndex === 2) return <AnalyticsAuditTabSkeleton />;
    return <AnalyticsListTabSkeleton />;
};

AnalyticsTabBodySkeleton.propTypes = { tabIndex: PropTypes.number };

export const AnalyticsPageShellSkeleton = ({ tabIndex = 0, children }) => (
    <div className="an-sk-shell">
        <AnalyticsPageHeaderSkeleton />
        <AnalyticsBreadcrumbSkeleton />
        <div className="an-sk-shell-body">
            <AnalyticsTabsSkeleton activeTabIndex={tabIndex} />
            <div className="an-sk-tab-panel">{children}</div>
        </div>
    </div>
);

AnalyticsPageShellSkeleton.propTypes = {
    tabIndex: PropTypes.number,
    children: PropTypes.node,
};

/** Route / in-page A360 body — same critical-CSS pieces as live portlets. */
export const AudienceAnalytics360PageSkeleton = AnalyticsAudience360TabSkeleton;

const analyticsLoadingScene = createPageLoadingScene({
    scopeClass: 'analytics-skeleton-scope an-sk-scope',
    suspenseFallbackClass: 'analytics-suspense-fallback',
    ariaLabel: 'Loading analytics',
    pageCriticalCss: analyticsSkeletonCriticalCss,
    markRouteSkeleton: markAnalyticsRouteSkeleton,
    TabBodySkeleton: AnalyticsTabBodySkeleton,
    PageShellSkeleton: AnalyticsPageShellSkeleton,
    skipSharedCriticalCss: true,
});

export const AnalyticsPageContentSkeleton = analyticsLoadingScene.PageContentSkeleton;
export const AnalyticsRouteSkeleton = analyticsLoadingScene.RouteSkeleton;
export const AnalyticsSuspenseFallback = analyticsLoadingScene.SuspenseFallback;

export default memo(AnalyticsPageContentSkeleton);

AnalyticsRouteSkeleton.propTypes = {
    activeTabIndex: PropTypes.number,
    withAppShell: PropTypes.bool,
    activeNavIndex: PropTypes.number,
    contentOnly: PropTypes.bool,
    layer: PropTypes.string,
};
