import PropTypes from 'prop-types';

import { skeletonBlockStyle } from '../dashboardSkeletonUtils';

const DASHBOARD_TAB_COUNT = 3;

export const DashboardHeaderSkeleton = () => (
    <div className="db-sk-header">
        <div className="db-sk-header-left mt-7">
            {/* <div className="db-sk-block" style={skeletonBlockStyle({ width: 150, height: 12, radius: 4 })} /> */}
            <div className="db-sk-block" style={skeletonBlockStyle({ width: 220, height: 32, radius: 4 })} />
        </div>
        <div className="db-sk-header-right">
            <div className="db-sk-block" style={skeletonBlockStyle({ width: 120, height: 24, radius: 4 })} />
            <div className="db-sk-block" style={skeletonBlockStyle({ width: 100, height: 24, radius: 4 })} />
            <div className="db-sk-block" style={skeletonBlockStyle({ width: 90, height: 24, radius: 4 })} />
        </div>
    </div>
);

export const DashboardBreadcrumbSkeleton = () => (
    <div className="db-sk-breadcrumb">
        {/* <div className="db-sk-block" style={skeletonBlockStyle({ width: 180, height: 14, radius: 4 })} /> */}
    </div>
);

export const DashboardTabsSkeleton = ({ activeTabIndex = 0 }) => (
    <div className="db-sk-tabs-wrap">
        <div className="db-sk-tabs">
            {Array.from({ length: DASHBOARD_TAB_COUNT }, (_, index) => (
                <div
                    key={index}
                    className={`db-sk-tab${index === activeTabIndex ? ' db-sk-tab--active' : ''}`}
                >
                </div>
            ))}
        </div>
    </div>
);

DashboardTabsSkeleton.propTypes = {
    activeTabIndex: PropTypes.number,
};

export const DashboardPortletSkeleton = ({
    titleWidth = 200,
    withMenu = true,
    size = 'md',
    children,
    className = '',
}) => (
    <div className={`db-sk-portlet db-sk-portlet--${size} ${className}`.trim()}>
        <div className="db-sk-portlet-header">
            <div className="db-sk-block" style={skeletonBlockStyle({ width: titleWidth, height: 24, radius: 4 })} />
            {withMenu ? (
                <div className="db-sk-block" style={skeletonBlockStyle({ width: 22, height: 24, circle: true })} />
            ) : null}
        </div>
        <div className="db-sk-portlet-body">{children}</div>
    </div>
);

DashboardPortletSkeleton.propTypes = {
    titleWidth: PropTypes.number,
    withMenu: PropTypes.bool,
    size: PropTypes.oneOf(['sm', 'md', 'lg', 'geo']),
    children: PropTypes.node,
    className: PropTypes.string,
};

export const DashboardPageShellSkeleton = ({ tabIndex = 0, children }) => (
    <div className="db-sk-shell">
        <DashboardHeaderSkeleton />
        <DashboardBreadcrumbSkeleton />
        <div className="db-sk-shell-body">
            <DashboardTabsSkeleton activeTabIndex={tabIndex} />
            <div className="db-sk-tab-panel">{children}</div>
        </div>
    </div>
);

DashboardPageShellSkeleton.propTypes = {
    tabIndex: PropTypes.number,
    children: PropTypes.node,
};
