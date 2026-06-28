import { memo } from 'react';
import { Container } from 'react-bootstrap';

import {
    BreadcrumbSkeleton,
    RSPageHeaderSkeleton,
    skeletonShellSharedCriticalCss,
} from '../../Components/common';
import GridLoadingSkeleton from 'Pages/KendoDocs/CommonComponents/ResKendoGrid/GridLoadingSkeleton';
import { DetailAnalyticsChannelPortletLoader, LineChartSkeleton, OverviewCardSkeleton } from '../../Components/SkeletonOverall';
import { detailAnalyticsSkeletonCriticalCss } from './detailAnalyticsSkeletonCriticalCss';

/** Inline holder style — matches live page offset before critical CSS paints. */
export const DETAIL_ANALYTICS_LOADING_HOLDER_STYLE = {
    boxSizing: 'border-box',
    backgroundColor: '#f5f7fc',
};

const DASK_BAR_H = 25;
const DASK_HEADER_H = 24;
const DASK_ICON = 24;
const DASK_METRIC_H = 37;
const DASK_LABEL_H = 15;

const barStyle = (width, height = DASK_HEADER_H) => ({
    width,
    height,
    borderRadius: 4,
});

const DaskBlock = ({ style = {}, className = '' }) => (
    <span className={`dask-block ${className}`.trim()} style={style} aria-hidden="true" />
);

const DetailAnalyticsOverviewHeaderSkeleton = () => (
    <div className="dask-overview-header" aria-hidden="true">
        <div className="dask-overview-header__left">
            <DaskBlock style={barStyle(87, DASK_BAR_H)} />
            <DaskBlock style={barStyle(183, DASK_BAR_H)} />
            <DaskBlock className="dask-block--circle" style={{ width: DASK_ICON, height: DASK_ICON }} />
        </div>
        <div className="dask-overview-header__right">
            <DaskBlock className="dask-block--circle" style={{ width: DASK_ICON, height: DASK_ICON }} />
        </div>
    </div>
);

const DASK_COLUMN_BAR_HEIGHTS = [170, 110, 290, 160, 230, 140, 210];
const DASK_GRID_ROWS = 5;
const DASK_GRID_COLS = 6;
const DASK_GRID_BODY_ROW_HEIGHT = 33;

const DaskPortletHeader = ({ titleWidth, titleHeight = 20, tabs = false, single = false }) => (
    <div className={`dask-portlet-header${single ? ' dask-portlet-header--single' : ''}`.trim()}>
        <DaskBlock style={barStyle(titleWidth, titleHeight)} />
        {tabs ? (
            <div className="dask-portlet-header__tabs">
                <DaskBlock style={barStyle(70, 23)} />
                <span className="dask-portlet-header__pipe">|</span>
                <DaskBlock style={barStyle(70, 23)} />
            </div>
        ) : null}
    </div>
);

const DaskColumnChartSkeleton = () => (
    <div className="dask-column-chart" aria-hidden="true">
        <div className="dask-column-chart__plot">
            {DASK_COLUMN_BAR_HEIGHTS.map((height, index) => (
                <DaskBlock key={index} className="dask-column-chart__bar" style={{ height, width: 33 }} />
            ))}
        </div>
    </div>
);

const DaskPieChartSkeleton = () => (
    <div className="dask-pie-chart" aria-hidden="true">
        <DaskBlock className="dask-pie-chart__circle dask-block--circle" style={{ width: 220, height: 220 }} />
        <div className="dask-pie-chart__legend">
            <DaskBlock style={barStyle(15, 15)} />
            <DaskBlock style={barStyle(40, 15)} />
            <DaskBlock style={barStyle(15, 15)} />
            <DaskBlock style={barStyle(40, 15)} />
            <DaskBlock style={barStyle(15, 15)} />
            <DaskBlock style={barStyle(40, 15)} />
        </div>
    </div>
);

const DaskGridPortletSkeleton = ({ variant = 'status' }) => (
    <div className={`dask-grid-portlet dask-grid-portlet--${variant}`} aria-hidden="true">
        <div className="dask-grid-portlet__header">
            <div className="dask-grid-portlet__header-left">
                <DaskBlock style={barStyle(180, 25)} />
                <DaskBlock className="dask-block--circle" style={{ width: DASK_ICON, height: DASK_ICON }} />
                <DaskBlock style={barStyle(160, 25)} />
            </div>
            <div className="dask-grid-portlet__header-right">
                {variant === 'status' ? (
                    <>
                        <DaskBlock style={barStyle(140, 25)} />
                        <DaskBlock className="dask-block--circle" style={{ width: DASK_ICON, height: DASK_ICON }} />
                    </>
                ) : (
                    <DaskBlock className="dask-block--circle" style={{ width: DASK_ICON, height: DASK_ICON }} />
                )}
            </div>
        </div>
        <div className="dask-grid-portlet__body">
            <div className="dask-grid-portlet__grid-wrap">
                <GridLoadingSkeleton
                    rows={DASK_GRID_ROWS}
                    columns={DASK_GRID_COLS}
                    hideLeftBorder
                    isLoading
                    injectCriticalCss={false}
                    wrapperClassName="p5"
                    bodyRowHeight={DASK_GRID_BODY_ROW_HEIGHT}
                />
            </div>
        </div>
    </div>
);

const DetailAnalyticsKeyMetricsSkeleton = () => (
    <div className="dask-key-metrics" aria-hidden="true">
        <div className="dask-key-metrics__row dask-key-metrics__row--pair">
            <div className="dask-key-metrics__cell">
                <DaskBlock style={barStyle(120, DASK_METRIC_H)} />
                <DaskBlock style={barStyle(80, DASK_LABEL_H)} />
            </div>
            <div className="dask-key-metrics__cell">
                <DaskBlock style={barStyle(120, DASK_METRIC_H)} />
                <DaskBlock style={barStyle(80, DASK_LABEL_H)} />
            </div>
        </div>
        <div className="dask-key-metrics__row dask-key-metrics__row--center">
            <DaskBlock style={barStyle(150, DASK_LABEL_H)} />
        </div>
        <div className="dask-key-metrics__row dask-key-metrics__row--triple">
            {[0, 1, 2].map((index) => (
                <div className="dask-key-metrics__cell" key={index}>
                    <DaskBlock style={{ width: '100%', height: DASK_METRIC_H, borderRadius: 4 }} />
                    <DaskBlock style={{ width: '100%', height: DASK_LABEL_H, borderRadius: 4 }} />
                </div>
            ))}
        </div>
        <div className="dask-key-metrics__row dask-key-metrics__row--pair">
            <div className="dask-key-metrics__cell">
                <DaskBlock style={barStyle(120, DASK_METRIC_H)} />
                <DaskBlock style={barStyle(80, DASK_LABEL_H)} />
            </div>
            <div className="dask-key-metrics__cell">
                <DaskBlock style={barStyle(120, DASK_METRIC_H)} />
                <DaskBlock style={barStyle(80, DASK_LABEL_H)} />
            </div>
        </div>
        <div className="dask-key-metrics__row dask-key-metrics__row--center">
            <DaskBlock style={barStyle(150, DASK_LABEL_H)} />
        </div>
        <div className="dask-key-metrics__row dask-key-metrics__row--triple">
            {[0, 1, 2].map((index) => (
                <div className="dask-key-metrics__cell" key={index}>
                    <DaskBlock style={{ width: '100%', height: DASK_METRIC_H, borderRadius: 4 }} />
                    <DaskBlock style={{ width: '100%', height: DASK_LABEL_H, borderRadius: 4 }} />
                </div>
            ))}
        </div>
    </div>
);

/** Self-contained body — tab, split header, overview cards, chart + key metrics (matches live detail analytics). */
export const DetailAnalyticsContentSkeleton = () => (
    <div
        className="dask-body dask-scope analytics-detail-skeleton-scope analytics-detail-inline-skeleton"
        aria-hidden="true"
    >
        <div className="dask-tab-wrap">
            <ul className="dask-tab-strip">
                <li className="dask-tab-strip__item">
                    <DaskBlock style={barStyle(120, 28)} />
                </li>
            </ul>
        </div>

        <div className="dask-split-header">
            <div className="dask-split-header__inner">
                <DaskBlock style={barStyle(180, DASK_HEADER_H)} />
                <DaskBlock className="dask-block--circle" style={{ width: 20, height: 20 }} />
                <DaskBlock className="dask-block--circle" style={{ width: 20, height: 20 }} />
            </div>
        </div>

        <DetailAnalyticsOverviewHeaderSkeleton />

        <div className="dask-row dask-row--gap dask-row--overview-cards">
            <div className="dask-col dask-col-4">
                <OverviewCardSkeleton stopAnimation={false} />
            </div>
            <div className="dask-col dask-col-4">
                <OverviewCardSkeleton stopAnimation={false} />
            </div>
            <div className="dask-col dask-col-4">
                <OverviewCardSkeleton stopAnimation={false} />
            </div>
        </div>

        <DaskBlock className="dask-section-heading" style={barStyle(220, 20)} />

        <div className="dask-row dask-row--gap dask-row--chart-metrics">
            <div className="dask-col dask-col-8">
                <div className="dask-portlet dask-portlet--md">
                    <DaskPortletHeader titleWidth={50} titleHeight={23} tabs />
                    <div className="dask-portlet-chart">
                        <LineChartSkeleton stopAnimation={false} />
                    </div>
                </div>
            </div>
            <div className="dask-col dask-col-4">
                <div className="dask-portlet dask-portlet--md">
                    <DaskPortletHeader titleWidth={120} single />
                    <div className="dask-portlet-body">
                        <DetailAnalyticsKeyMetricsSkeleton />
                    </div>
                </div>
            </div>
        </div>

        <div className="dask-row dask-row--gap dask-row--split-charts">
            <div className="dask-col dask-col-6">
                <div className="dask-portlet dask-portlet--md">
                    <DaskPortletHeader titleWidth={100} single />
                    <div className="dask-portlet-chart">
                        <LineChartSkeleton stopAnimation={false} />
                    </div>
                </div>
            </div>
            <div className="dask-col dask-col-6">
                <div className="dask-portlet dask-portlet--md">
                    <DaskPortletHeader titleWidth={100} single />
                    <div className="dask-portlet-chart dask-portlet-chart--column">
                        <DaskColumnChartSkeleton />
                    </div>
                </div>
            </div>
        </div>

        <div className="dask-row">
            <div className="dask-col dask-col-12">
                <DaskBlock className="dask-section-heading dask-section-heading--lg" style={barStyle(180, 24)} />
            </div>
        </div>

        <div className="dask-row dask-row--gap dask-row--pie-charts">
            <div className="dask-col dask-col-6">
                <div className="dask-portlet dask-portlet--md">
                    <DaskPortletHeader titleWidth={140} single />
                    <div className="dask-portlet-chart dask-portlet-chart--pie">
                        <DaskPieChartSkeleton />
                    </div>
                </div>
            </div>
            <div className="dask-col dask-col-6">
                <div className="dask-portlet dask-portlet--md">
                    <DaskPortletHeader titleWidth={140} single />
                    <div className="dask-portlet-chart dask-portlet-chart--pie">
                        <DaskPieChartSkeleton />
                    </div>
                </div>
            </div>
        </div>

        <div className="dask-row dask-row--grid-portlets">
            <div className="dask-col dask-col-12">
                <DaskGridPortletSkeleton variant="links" />
                <DaskGridPortletSkeleton variant="status" />
            </div>
        </div>
    </div>
);

/** PDF export overlay — same container shell as live detail analytics page body. */
export const DetailAnalyticsPdfExportSkeleton = () => (
    <Container fluid>
        <div className="page-content pc-analytics">
            <Container className="px0">
                <DetailAnalyticsContentSkeleton />
            </Container>
        </div>
    </Container>
);

export const DetailAnalyticsLoadingBlock = () => (
    <>
        <style>{detailAnalyticsSkeletonCriticalCss}</style>
        <DetailAnalyticsContentSkeleton />
    </>
);

/** Lazy tab body — tabs/header already visible; portlet skeleton only (no tab bar). */
export const DetailAnalyticsTabContentLoadingBlock = () => (
    <>
        <style>{detailAnalyticsSkeletonCriticalCss}</style>
        <Container className="px0">
            <DetailAnalyticsChannelPortletLoader hideTabbarSkeleton />
        </Container>
    </>
);

export const DetailAnalyticsPageSkeleton = () => (
    <div
        className="page-content-holder analytics-detail-skeleton analytics-detail-skeleton-scope dask-scope analytics-skeleton-scope"
        style={DETAIL_ANALYTICS_LOADING_HOLDER_STYLE}
        aria-busy="true"
        aria-label="Loading detail analytics"
    >
        <style>{skeletonShellSharedCriticalCss}</style>
        <style>{detailAnalyticsSkeletonCriticalCss}</style>
        <BreadcrumbSkeleton />
        <Container fluid>
            <div className="page-content pc-analytics">
                <Container className="px0">
                    <RSPageHeaderSkeleton variant="detail" embedInPageShell />
                    <DetailAnalyticsContentSkeleton />
                </Container>
            </div>
        </Container>
    </div>
);

export const DetailAnalyticsSuspenseFallback = DetailAnalyticsPageSkeleton;

export default memo(DetailAnalyticsPageSkeleton);
