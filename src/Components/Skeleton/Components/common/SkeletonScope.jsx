import { createElement, memo } from 'react';
import PropTypes from 'prop-types';

/**
 * Injects critical layout CSS for a page skeleton scope (audience, dashboard, MDM, etc.).
 */
const SkeletonScope = ({ children, scopeClass, criticalCss = '', className = '', injectCriticalCss = true }) =>
    createElement(
        'div',
        { className: `${scopeClass} ${className}`.trim() },
        injectCriticalCss && criticalCss ? createElement('style', null, criticalCss) : null,
        children,
    );

SkeletonScope.propTypes = {
    children: PropTypes.node,
    scopeClass: PropTypes.string.isRequired,
    criticalCss: PropTypes.string,
    className: PropTypes.string,
    injectCriticalCss: PropTypes.bool,
};

export default memo(SkeletonScope);
