import { memo } from 'react';
import PropTypes from 'prop-types';
import { Container } from 'react-bootstrap';

import GridLoadingSkeleton from 'Pages/KendoDocs/CommonComponents/ResKendoGrid/GridLoadingSkeleton';
import {
    BreadcrumbSkeleton,
    RSPageHeaderSkeleton,
    skeletonShellSharedCriticalCss,
} from 'Components/Skeleton/Components/common';
import { addImportAudienceSkeletonCriticalCss } from 'Components/Skeleton/pages/audience/addImportAudience/addImportAudienceSkeletonCriticalCss';

const ADD_IMPORT_GRID_SKELETON_COLUMNS = 5;
const ADD_IMPORT_GRID_SKELETON_ROWS = 5;

const SkelBar = ({ width, height, circle = false, className = '' }) => (
    <span
        className={`skeleton-shimmer d-inline-block${circle ? ' rounded-circle' : ''} ${className}`.trim()}
        style={{ width, height, borderRadius: circle ? '50%' : 4 }}
        aria-hidden="true"
    />
);

export const AddImportAudienceBodySkeleton = () => (
    <>
        <div className="add-import-audience-skeleton__title-row">
            <SkelBar width={180} height={24} />
        </div>
        <div className="add-import-audience-skeleton__meta-row">
            <SkelBar width={420} height={18} />
            <SkelBar width={200} height={24} />
        </div>
        <div className="addImportAudienceMapAttributes add-import-audience-skeleton__grid rs-kendo-grid-table" aria-hidden="true">
            <GridLoadingSkeleton
                rows={ADD_IMPORT_GRID_SKELETON_ROWS}
                columns={ADD_IMPORT_GRID_SKELETON_COLUMNS}
                wrapperClassName="p0"
                hideLeftBorder
            />
        </div>
        <div className="add-import-audience-skeleton__footer-row">
            <SkelBar width={200} height={24} />
            <SkelBar width={300} height={24} />
        </div>
        <div className="add-import-audience-skeleton__actions">
            <SkelBar width={80} height={40} />
            <SkelBar width={80} height={40} />
        </div>
    </>
);

export const AddImportAudienceLoadingBlock = () => (
    <>
        <style>{addImportAudienceSkeletonCriticalCss}</style>
        <div className="audience-add-import-audience-inline-skeleton">
            <AddImportAudienceBodySkeleton />
        </div>
    </>
);

const AddImportAudienceSkeleton = ({ inline = false }) => (
    <div
        className={[
            'page-content-holder audience-add-import-audience-skeleton audience-skeleton-scope',
            inline && 'audience-add-import-audience-skeleton--inline',
        ]
            .filter(Boolean)
            .join(' ')}
        aria-busy="true"
        aria-label="Loading import audience"
    >
        <style>{skeletonShellSharedCriticalCss}</style>
        <style>{addImportAudienceSkeletonCriticalCss}</style>
        {!inline ? (
            <>
                <RSPageHeaderSkeleton
                    variant="addImportAudience"
                    className="add-import-audience-page-header-skeleton"
                />
                <BreadcrumbSkeleton tabIndex={1} />
            </>
        ) : null}
        <Container fluid>
            <div className="page-content">
                <Container className="px0">
                    <AddImportAudienceBodySkeleton />
                </Container>
            </div>
        </Container>
    </div>
);

AddImportAudienceSkeleton.propTypes = {
    /** True when page chrome is already mounted (API load) — body only, no top padding. */
    inline: PropTypes.bool,
};

export default memo(AddImportAudienceSkeleton);
