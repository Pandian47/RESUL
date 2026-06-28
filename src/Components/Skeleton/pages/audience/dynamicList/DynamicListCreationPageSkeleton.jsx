import { memo } from 'react';
import { Container } from 'react-bootstrap';

import DynamicListCreationSkeleton from 'Components/Skeleton/Components/DynamicListCreationSkeleton';
import { BreadcrumbSkeleton, skeletonShellSharedCriticalCss } from '../../../Components/common';
import { RSPageHeaderSkeleton } from '../../../Components/common';
import { dynamicListCreationSkeletonCriticalCss } from './dynamicListCreationSkeletonCriticalCss';

const getDynamicListRouteFlags = () => {
    if (typeof window === 'undefined') {
        return { isEditRoute: false, isRfaRoute: false };
    }

    const searchParams = new URLSearchParams(window.location.search);

    return {
        isEditRoute: Boolean(searchParams.get('DynamicListId')),
        isRfaRoute: searchParams.get('rfa') === 'true',
    };
};

const DynamicListCreationContentSkeleton = () => {
    const { isRfaRoute } = getDynamicListRouteFlags();

    return (
        <div className="page-content CreateDynamicListCSS d-grid">
            <DynamicListCreationSkeleton showApproval={!isRfaRoute} injectCriticalCss={false} />
        </div>
    );
};

export const DynamicListCreationLoadingBlock = () => (
    <div className="audience-dynamic-list-inline-skeleton">
        <style>{dynamicListCreationSkeletonCriticalCss}</style>
        <DynamicListCreationContentSkeleton />
    </div>
);

export const DynamicListCreationPageSkeleton = ({ titleWidth }) => {
    const { isEditRoute } = getDynamicListRouteFlags();
    const resolvedTitleWidth = titleWidth ?? (isEditRoute ? 165 : 175);

    return (
        <div
            className="page-content-holder audience-dynamic-list-creation-skeleton audience-skeleton-scope"
            aria-busy="true"
            aria-label="Loading dynamic list"
        >
            <style>{skeletonShellSharedCriticalCss}</style>
            <style>{dynamicListCreationSkeletonCriticalCss}</style>
            <RSPageHeaderSkeleton
                variant="dynamicListCreation"
                titleWidth={resolvedTitleWidth}
                className="dynamic-list-creation-page-header-skeleton"
            />
            <BreadcrumbSkeleton tabIndex={2} />
            <Container fluid>
                <div className="page-content">
                    <Container className="px0">
                        <DynamicListCreationContentSkeleton />
                    </Container>
                </div>
            </Container>
        </div>
    );
};

export const DynamicListCreationSuspenseFallback = DynamicListCreationPageSkeleton;

export default memo(DynamicListCreationPageSkeleton);
