import { memo } from 'react';
import PropTypes from 'prop-types';

import { SkeletonScope } from '../../../Components/common';
import { audienceSkeletonCriticalCss } from '../audienceSkeletonCriticalCss';

/** MDM panel scope — audience layout CSS. */
const MdmSkeletonScope = ({ children, className = '', injectCriticalCss = true }) => (
    <SkeletonScope
        scopeClass="audience-skeleton-scope"
        criticalCss={audienceSkeletonCriticalCss}
        className={className}
        injectCriticalCss={injectCriticalCss}
    >
        {children}
    </SkeletonScope>
);

MdmSkeletonScope.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    injectCriticalCss: PropTypes.bool,
};

export default memo(MdmSkeletonScope);
