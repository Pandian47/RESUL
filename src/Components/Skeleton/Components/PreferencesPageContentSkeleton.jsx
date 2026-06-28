import { memo } from 'react';
import PropTypes from 'prop-types';
import { Container } from 'react-bootstrap';

import { preferencesSkeletonCriticalCss } from './preferencesSkeletonCriticalCss';

const PREFERENCES_SKELETON_SECTIONS = [
    { count: 6 },
    { count: 6 },
    { count: 5 },
];

const PreferenceCardSkeleton = () => (
    <li>
        <div className="pref-skeleton-card" aria-hidden="true">
            <div className="pref-item-content">
                <span className="pref-icon skeleton-shimmer" />
                <div className="pref-item-text">
                    <div className="pref-sk-item-title-bar skeleton-shimmer" aria-hidden="true" />
                    <div className="pref-sk-item-desc-bar skeleton-shimmer" aria-hidden="true" />
                </div>
            </div>
        </div>
    </li>
);

/** Section grids only — wrap with PreferenceMain `page-content` / `Container px0`. */
export const PreferencesSectionsSkeleton = () => (
    <>
        {PREFERENCES_SKELETON_SECTIONS.map((section, sectionIndex) => (
            <div className="pref-card" key={sectionIndex}>
                <div className="pref-section-title pref-sk-section-title-bar skeleton-shimmer" aria-hidden="true" />
                <ul className="pp-row clearfix">
                    {Array.from({ length: section.count }, (_, index) => (
                        <PreferenceCardSkeleton key={`${sectionIndex}-${index}`} />
                    ))}
                </ul>
            </div>
        ))}
    </>
);

const PreferencesPageContentSkeleton = ({ inline = false, includeCriticalCss = true }) => (
    <div className={`preferences-skeleton-scope${inline ? ' pls-content' : ''}`}>
        {includeCriticalCss && <style>{preferencesSkeletonCriticalCss}</style>}
        {inline ? (
            <Container className="px0">
                <PreferencesSectionsSkeleton />
            </Container>
        ) : (
            <Container style={{padding: '0'}}>
                    <PreferencesSectionsSkeleton />
            </Container>
        )}
    </div>
);

PreferencesPageContentSkeleton.propTypes = {
    inline: PropTypes.bool,
    includeCriticalCss: PropTypes.bool,
};

export default memo(PreferencesPageContentSkeleton);
