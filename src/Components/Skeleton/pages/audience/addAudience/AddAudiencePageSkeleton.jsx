import { memo } from 'react';
import { Container } from 'react-bootstrap';

import { BreadcrumbSkeleton, RSPageHeaderSkeleton, skeletonShellSharedCriticalCss } from '../../../Components/common';
import { addAudienceSkeletonCriticalCss } from './addAudienceSkeletonCriticalCss';
import AddAudienceFormSkeleton from './AddAudienceFormSkeleton';

export const AddAudienceLoadingBlock = () => (
    <>
        <style>{addAudienceSkeletonCriticalCss}</style>
        <div className="audience-add-audience-inline-skeleton">
            <AddAudienceFormSkeleton compact />
        </div>
    </>
);

export const AddAudiencePageSkeleton = () => (
    <div
        className="page-content-holder audience-add-audience-skeleton audience-skeleton-scope"
        aria-busy="true"
        aria-label="Loading add audience"
    >
        <style>{skeletonShellSharedCriticalCss}</style>
        <style>{addAudienceSkeletonCriticalCss}</style>
        <RSPageHeaderSkeleton variant="addAudience" className="add-audience-page-header-skeleton" />
        <BreadcrumbSkeleton tabIndex={1} />
        <Container fluid>
            <div className="page-content ">
                <Container className="px0">
                    <AddAudienceFormSkeleton compact />
                </Container>
            </div>
        </Container>
    </div>
);

export default memo(AddAudiencePageSkeleton);
