import { memo } from 'react';
import { Container } from 'react-bootstrap';

import { setupCompleteSkeletonCriticalCss } from './setupCompleteSkeletonCriticalCss';

const SkelBar = ({ className = '', style }) => (
    <span className={`skeleton-shimmer ${className}`.trim()} style={style} aria-hidden="true" />
);

/** Route refresh — `/setup-complete` (account settings completed card). */
const SetupCompletePageSkeleton = () => (
    <>
        <style>{setupCompleteSkeletonCriticalCss}</style>
        <div className="page-content-holder setup-complete-skeleton-scope" aria-busy="true" aria-label="Loading setup complete">
            <Container fluid className="main-heading-wrapper mb0">
                <Container className="mhw-container">
                    <SkelBar className="setup-complete-skel-page-title" />
                </Container>
            </Container>
            <Container className="page-content px0">
                <div className="box-design mt20 setup-complete-skel-card">
                    <div className="setup-complete-skel-body">
                        <SkelBar className="setup-complete-skel-icon" />
                        <SkelBar className="setup-complete-skel-heading" />
                        <SkelBar className="setup-complete-skel-line" />
                        <SkelBar className="setup-complete-skel-line--short" />
                        <SkelBar className="setup-complete-skel-line--support" />
                    </div>
                    <SkelBar className="setup-complete-skel-countdown" />
                </div>
            </Container>
        </div>
    </>
);

export default memo(SetupCompletePageSkeleton);
