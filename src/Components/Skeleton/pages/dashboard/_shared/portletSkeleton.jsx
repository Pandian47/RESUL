import { skeletonBlockStyle } from '../dashboardSkeletonUtils';
import { DashboardPortletSkeleton } from './dashboardShellSkeleton';

export const PortletHeader = ({ width = 200, withMenu = true }) => (
    <div className="db-sk-portlet-header">
        <div className="db-sk-block" style={skeletonBlockStyle({ width, height: 20 })} />
        {withMenu ? (
            <div className="db-sk-block" style={skeletonBlockStyle({ width: 22, height: 22, circle: true })} />
        ) : null}
    </div>
);

export const PortletMd = ({ titleWidth, withMenu = true, children, className = '' }) => (
    <DashboardPortletSkeleton titleWidth={titleWidth} withMenu={withMenu} size="md" className={className}>
        {children}
    </DashboardPortletSkeleton>
);
