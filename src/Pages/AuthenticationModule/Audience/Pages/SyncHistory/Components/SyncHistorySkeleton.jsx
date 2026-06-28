import { memo } from 'react';
import PropTypes from 'prop-types';
import { Container } from 'react-bootstrap';
import GridLoadingSkeleton from 'Pages/KendoDocs/CommonComponents/ResKendoGrid/GridLoadingSkeleton';
import {
    BreadcrumbSkeleton,
    RSPageHeaderSkeleton,
    skeletonShellSharedCriticalCss,
} from 'Components/Skeleton/Components/common';
import { audienceSkeletonCriticalCss } from 'Components/Skeleton/pages/audience/audienceSkeletonCriticalCss';

const SYNC_HISTORY_GRID_SKELETON_COLUMNS = 8;
const SYNC_HISTORY_GRID_SKELETON_ROWS = 5;
const SYNC_HISTORY_PAGE_TITLE_WIDTH = 150;
const SYNC_HISTORY_TAB_COUNT = 2;

const SkelBar = ({ width, height, circle = false, className = '' }) => (
    <span
        className={`skeleton-shimmer d-inline-block${circle ? ' rounded-circle' : ''} ${className}`.trim()}
        style={{ width, height, borderRadius: circle ? '50%' : 4 }}
        aria-hidden="true"
    />
);

const SyncHistoryTabsSkeleton = () => (
    <ul className="rs-tabs row mb0 mini sync-history-tabs-skeleton__list list-unstyled m0" aria-hidden="true">
        {Array.from({ length: SYNC_HISTORY_TAB_COUNT }, (_, index) => (
            <li key={index} className="col-md-2 tabTransparent tabDefault sync-history-tabs-skeleton__tab" />
        ))}
    </ul>
);

const SyncHistorySkeleton = ({ inline = false }) => (
    <div
        className={[
            'page-content-holder audience-skeleton-scope sync-history-skeleton-scope',
            inline && 'sync-history-inline-skeleton',
        ]
            .filter(Boolean)
            .join(' ')}
        aria-busy="true"
        aria-label="Loading sync history"
    >
        <style>{skeletonShellSharedCriticalCss}</style>
        <style>{audienceSkeletonCriticalCss}</style>

        <RSPageHeaderSkeleton
            variant="tabber"
            titleWidth={SYNC_HISTORY_PAGE_TITLE_WIDTH}
            className="sync-history-page-header-skeleton"
        />
        <BreadcrumbSkeleton />

        <Container fluid>
            <div className="page-content">
                <Container className="px0">
                    <div>
                        <div className="flex-row justify-content-between top-sub-heading sync-history-subheading-skeleton">
                            <span className="d-flex align-items-baseline">
                                <SkelBar width={80} height={24} />
                                <SkelBar width={200} height={24} className="ml5" />
                            </span>
                            <ul className="rs-list-group-horizontal   d-flex align-items-center list-unstyled mb0 sync-history-toolbar-skeleton">
                                <li>
                                    <SkelBar width={220} height={24} />
                                </li>
                                <li className="pl15">
                                    <SkelBar width={24} height={24} circle />
                                </li>
                                <li>
                                    <SkelBar width={100} height={24} />
                                </li>
                                <li>
                                    <SkelBar width={100} height={24} />
                                </li>
                            </ul>
                        </div>

                        <div className="rs-tabs-align-top sync-history-tabs-panel-skeleton">
                            {/* <SyncHistoryTabsSkeleton /> */}
                            <div className="mb20 pb70">
                                <div className="rs-kendo-grid-table" aria-hidden="true">
                                    <GridLoadingSkeleton
                                        rows={SYNC_HISTORY_GRID_SKELETON_ROWS}
                                        columns={SYNC_HISTORY_GRID_SKELETON_COLUMNS}
                                        wrapperClassName="p0"
                                        hideLeftBorder
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>
        </Container>
    </div>
);

SyncHistorySkeleton.propTypes = {
    /** True when page chrome is already mounted (API load) — drops top padding. */
    inline: PropTypes.bool,
};

export default memo(SyncHistorySkeleton);
