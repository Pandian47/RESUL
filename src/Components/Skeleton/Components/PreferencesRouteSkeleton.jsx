import { memo } from 'react';
import { Container } from 'react-bootstrap';

import { PreferencesSectionsSkeleton } from './PreferencesPageContentSkeleton';
import { preferencesSkeletonCriticalCss } from './preferencesSkeletonCriticalCss';
import { BreadcrumbSkeleton, skeletonShellSharedCriticalCss } from './common';
import { CommonSkeleton } from './SkeletonOverall';

/** Matches PreferenceMain: RSPageHeader + page-content + section card grids (no tabs). */
const PreferencesRouteSkeleton = () => (
    <div className="page-content-holder preferences-skeleton-scope preferences-route-skeleton" aria-busy="true" aria-label="Loading preferences">
        <style>{skeletonShellSharedCriticalCss}</style>
        <style>{preferencesSkeletonCriticalCss}</style>
        <BreadcrumbSkeleton />
        <Container fluid className="main-heading-wrapper mb0">
            <Container className="mhw-container">
                <div className="mhwc-left">
                    <div className="heading-title-text">
                        <h1>
                            <CommonSkeleton box width={180} height={36} stopAnimation />
                        </h1>
                    </div>
                </div>
            </Container>
        </Container>
        <Container fluid>
            <div className="page-content">
                <Container className="px0">
                    <PreferencesSectionsSkeleton />
                </Container>
            </div>
        </Container>
    </div>
);

export default memo(PreferencesRouteSkeleton);
