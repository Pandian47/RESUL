import { memo } from 'react';
import PropTypes from 'prop-types';
import { Col, Container, Row } from 'react-bootstrap';

import { BreadcrumbSkeleton, RSPageHeaderSkeleton, skeletonShellSharedCriticalCss } from '../../Components/common';
import SegmentAttributesSkeleton from '../../Components/SegmentAttributesSkeleton';
import SegmentCreateSkeleton from '../../Components/SegmentCreateSkeleton';
import { segmentSkeletonCriticalCss } from '../../Components/segmentSkeletonCriticalCss';
import { audienceTargetListCreationCriticalCss } from './audienceTargetListCreationCriticalCss';

const Shimmer = ({ style = {}, className = '' }) => (
    <span className={`skeleton-shimmer d-block ${className}`.trim()} style={style} aria-hidden="true" />
);

/** RSPageHeader row — matches live Target list create chrome. */
export const TargetListCreationPageShellSkeleton = ({ titleWidth = 165 }) => (
    <RSPageHeaderSkeleton
        variant="targetListCreation"
        titleWidth={titleWidth}
        className="target-list-creation-page-header-skeleton"
    />
);

/** Matches TargetListCreation — reusable SegmentAttributesSkeleton + SegmentCreateSkeleton (live page). */
export const TargetListCreationBodySkeleton = ({ isError = false, showFooter = true }) => (
    <div className="audience-tl-skeleton-body " aria-hidden="true">
        <div className="sticky audience-tl-create-left audience-tl-skeleton-left">
            <div className="rs-targetList-leftSide audience-tl-skeleton-left-attributes">
                <SegmentAttributesSkeleton isError={isError} injectCriticalCss={false} />
            </div>
        </div>
        <div className="rs-targetList-rightSide audience-tl-skeleton-right">
            <Row className="mb21 mx-0">
                <Col md={7} className="position-relative mt4 ps-0">
                    <Shimmer style={{ width: 540, maxWidth: '100%', height: 30, borderRadius: 4 }} />
                </Col>
                <Col md={5} className="d-flex align-items-end justify-content-end pe-0">
                    <Shimmer style={{ width: 220, height: 30, borderRadius: 4 }} />
                </Col>
            </Row>

            <div className="targetListGroupBlock audience-tl-skeleton-segment">
                <SegmentCreateSkeleton isError={isError} injectCriticalCss={false} />
            </div>

            <div className="audience-tl-skeleton-meta">
                <Shimmer style={{ width: 280, height: 20, borderRadius: 4 }} />
            </div>

            <Row className="audience-tl-skeleton-options mx-0">
                <Col md={8} className="ps-0">
                    <div className="d-flex gap-2 align-items-center">
                        <Shimmer style={{ width: 22, height: 22, borderRadius: 4 }} />
                        <Shimmer style={{ width: 160, height: 22, borderRadius: 4 }} />
                    </div>
                </Col>
                <Col md={4} className="pe-0">
                    <div className="d-flex gap-2 align-items-center justify-content-end mt10">
                        <Shimmer style={{ width: 22, height: 22, borderRadius: 4 }} />
                        <Shimmer style={{ width: 140, height: 22, borderRadius: 4 }} />
                    </div>
                </Col>
            </Row>

            {showFooter && !isError && (
                <div className="audience-tl-skeleton-footer buttons-holder d-flex justify-content-end gap-3">
                    <Shimmer style={{ width: 88, height: 36, borderRadius: 4 }} />
                    <Shimmer style={{ width: 100, height: 36, borderRadius: 4 }} />
                    <Shimmer style={{ width: 88, height: 36, borderRadius: 4 }} />
                </div>
            )}
        </div>
    </div>
);

/** Body + optional page shell — use shell when live RSPageHeader is not mounted yet. */
export const AudienceTargetListCreationLoadingBlock = ({
    showPageShell = false,
    titleWidth = 165,
    breadcrumbTabIndex,
    breadcrumbModuleLabel,
    breadcrumbTabLabel,
}) => (
    <>
        {showPageShell ? <style>{skeletonShellSharedCriticalCss}</style> : null}
        <style>{audienceTargetListCreationCriticalCss}</style>
        <style>{segmentSkeletonCriticalCss}</style>
        <div
            className={`targetListPage audience-target-list-creation-inline-skeleton${showPageShell ? ' audience-target-list-creation-inline-skeleton--with-shell' : ''
                }`}
        >
            {showPageShell ? (
                <>
                    <TargetListCreationPageShellSkeleton titleWidth={titleWidth} />
                    <BreadcrumbSkeleton
                        tabIndex={breadcrumbTabIndex ?? 1}
                        moduleLabel={breadcrumbModuleLabel}
                        tabLabel={breadcrumbTabLabel}
                    />
                </>
            ) : null}
            <TargetListCreationBodySkeleton />
        </div>
    </>
);

export const AudienceTargetListCreationSkeleton = ({
    titleWidth = 165,
    breadcrumbTabIndex,
    breadcrumbModuleLabel,
    breadcrumbTabLabel,
}) => (
    <div
        className="page-content-holder targetListPage audience-target-list-creation-skeleton audience-skeleton-scope"
        aria-busy="true"
        aria-label="Loading target list"
    >
        <style>{skeletonShellSharedCriticalCss}</style>
        <style>{audienceTargetListCreationCriticalCss}</style>
        <style>{segmentSkeletonCriticalCss}</style>
        <TargetListCreationPageShellSkeleton titleWidth={titleWidth} />
        <BreadcrumbSkeleton
            tabIndex={breadcrumbTabIndex ?? 1}
            moduleLabel={breadcrumbModuleLabel}
            tabLabel={breadcrumbTabLabel}
        />
        <Container fluid>
            <div className="page-content">
                <Container className="px0">
                    <TargetListCreationBodySkeleton />
                </Container>
            </div>
        </Container>
    </div>
);

AudienceTargetListCreationSkeleton.propTypes = {
    titleWidth: PropTypes.number,
    breadcrumbTabIndex: PropTypes.number,
    breadcrumbModuleLabel: PropTypes.string,
    breadcrumbTabLabel: PropTypes.string,
};

AudienceTargetListCreationLoadingBlock.propTypes = {
    showPageShell: PropTypes.bool,
    titleWidth: PropTypes.number,
    breadcrumbTabIndex: PropTypes.number,
    breadcrumbModuleLabel: PropTypes.string,
    breadcrumbTabLabel: PropTypes.string,
};

/** Route Suspense — same layout as TargetListCreationBodySkeleton. */
export const AudienceTargetListCreationSuspenseFallback = AudienceTargetListCreationSkeleton;

export default memo(AudienceTargetListCreationSkeleton);
