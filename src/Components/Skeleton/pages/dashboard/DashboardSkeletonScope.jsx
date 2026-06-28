import { memo } from 'react';
import PropTypes from 'prop-types';

import { dashboardSkeletonCriticalCss } from './dashboardSkeletonCriticalCss';

/** Dashboard panel scope — layout via db-sk-* critical CSS only. */
const DashboardSkeletonScope = ({ children, className = '', injectCriticalCss = true, style }) => (
    <div className={`db-sk-scope dashboard-skeleton-scope ${className}`.trim()} style={style} aria-hidden="true">
        {injectCriticalCss ? <style>{dashboardSkeletonCriticalCss}</style> : null}
        {children}
    </div>
);

DashboardSkeletonScope.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    injectCriticalCss: PropTypes.bool,
    style: PropTypes.object,
};

export default memo(DashboardSkeletonScope);
