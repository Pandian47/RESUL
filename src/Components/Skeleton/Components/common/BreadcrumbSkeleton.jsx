import { memo } from 'react';
import PropTypes from 'prop-types';
import { Container } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { capitalize as _capitalize } from 'Utils/modules/lodashReplacements';

import { pages_tab_config } from 'Components/RSHeader/constant';
import { getRouteTabIndex } from '../getRouteTabIndex';

const MODULE_FROM_PATH = [
    { key: 'communicationTwins', label: 'Communication' },
    { key: 'communication', label: 'Communication' },
    { key: 'audience', label: 'Audience' },
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'analytics', label: 'Analytics' },
    { key: 'preferences', label: 'Preferences' },
];

const resolveModule = (pathname = '') => {
    const normalized = (pathname || '').toLowerCase();
    const match = MODULE_FROM_PATH.find(({ key }) => normalized.includes(`/${key}`));
    return match?.key?.replace('Twins', '') ?? null;
};

const resolveModuleLabel = (moduleKey) =>
    MODULE_FROM_PATH.find(({ key }) => key.replace('Twins', '') === moduleKey)?.label ??
    _capitalize(moduleKey || '');

const resolveTabLabel = (pathname, search, tabIndex, moduleKey) => {
    const tabs = pages_tab_config[moduleKey];
    if (tabs?.[tabIndex]) return tabs[tabIndex];

    const segments = (pathname || '').split('/').filter(Boolean);
    const last = segments[segments.length - 1];
    if (!last || last === moduleKey) return null;
    return _capitalize(last.replace(/-/g, ' '));
};

/**
 * Matches RSHeader BreadCrumbs strip (fixed below top nav, right-aligned).
 */
const BreadcrumbSkeleton = ({
    tabIndex: tabIndexProp,
    moduleLabel: moduleLabelProp,
    tabLabel: tabLabelProp,
    className = '',
}) => {
    const { pathname, search } = useLocation();
    const tabIndex = tabIndexProp ?? getRouteTabIndex(pathname, search);
    const moduleKey = resolveModule(pathname);
    const moduleLabel = moduleLabelProp ?? resolveModuleLabel(moduleKey);
    const tabLabel =
        tabLabelProp ?? (moduleKey ? resolveTabLabel(pathname, search, tabIndex, moduleKey) : null);

    if (!moduleLabel) return null;

    return (
        <div className={`breadcrumbs page-breadcrumb-skeleton d-none ${className}`.trim()} aria-hidden="true">
            <div className="section-padding-x">
                <Container className="p0">
                    <ul className="breadcrumb">
                        <li>
                            <span>{moduleLabel}</span>
                        </li>
                        {tabLabel ? (
                            <li className="active">
                                <span>{tabLabel}</span>
                            </li>
                        ) : null}
                    </ul>
                </Container>
            </div>
        </div>
    );
};

BreadcrumbSkeleton.propTypes = {
    tabIndex: PropTypes.number,
    moduleLabel: PropTypes.string,
    tabLabel: PropTypes.string,
    className: PropTypes.string,
};

export default memo(BreadcrumbSkeleton);
