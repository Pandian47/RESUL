import { memo, useLayoutEffect } from 'react';
import { Container } from 'react-bootstrap';

import {
    BreadcrumbSkeleton,
    RSPageHeaderSkeleton,
    createPageLoadingScene,
} from '../../Components/common';
import {
    ColumnChartSkeletonNew,
    CommonSkeleton,
    DetailOverviewSkeleton,
    LineChartSkeleton,
    NoData,
    PerformanceBenchmarkSkeleton,
    PerformanceSnapshotSkeleton,
} from '../../Components/SkeletonOverall';
import RoiChartSkeleton from '../../Components/RoiChartSkeleton';
import {
    analyticsReportSkeletonCriticalCss,
    COMM_ANALYSIS_LINE_CHART_HEIGHT,
} from './analyticsReportSkeletonCriticalCss';
import { markAnalyticsReportRouteSkeleton } from './analyticsRouteSkeletonPhase';
import { SKELETON_PAGE_BG } from '../dashboard/dashboardSkeletonUtils';

/** Inline fallback so header/body align below RSHeader before critical CSS paints. */
export const ANALYTICS_REPORT_LOADING_HOLDER_STYLE = {
    paddingTop: 78,
    boxSizing: 'border-box',
    backgroundColor: SKELETON_PAGE_BG,
};

const COMM_ANALYSIS_CHART_BODY_HEIGHT = COMM_ANALYSIS_LINE_CHART_HEIGHT + 40;

/** Title bar widths — approximate live headings (shimmer only, no text). */
const GRID_CARD_TITLE_WIDTHS = [64, 140, 108, 100];
const EXPAND_PORTLET_TITLE_WIDTHS = [88, 132];
const COMM_ANALYSIS_TITLE_WIDTH = 248;
const COMM_TABLE_TITLE_WIDTH = 140;
const ROI_TITLE_WIDTH = 220;
const BENCHMARK_TITLE_WIDTH = 280;
const COMM_ANALYSIS_TAB_COUNT = 2;
const COMM_TABLE_TAB_WIDTHS = [100, 88, 92, 80];
const CHANNEL_METRICS_ROW_COUNT = 6;
const CHANNEL_METRICS_LEFT_LABEL_WIDTHS = [120, 88, 108, 96, 92, 88];
const CHANNEL_METRICS_RIGHT_LABEL_WIDTHS = [104, 96, 72, 80, 112, 88];
const CHANNEL_METRICS_VALUE_WIDTHS = [28, 24, 32, 24, 28, 36];
const INSIGHTS_BAR_COUNT = 7;
const ARSK_HEADER_BAR_HEIGHT = 24;
const ARSK_ICON_SIZE = 24;

const headerBarStyle = (width) => ({
    width,
    height: ARSK_HEADER_BAR_HEIGHT,
    borderRadius: 4,
});

const iconStyle = (square = false) => ({
    width: ARSK_ICON_SIZE,
    height: ARSK_ICON_SIZE,
    borderRadius: square ? 4 : '50%',
});

const Shimmer = ({ style = {}, className = '' }) => (
    <span className={`arsk-block ${className}`.trim()} style={style} aria-hidden="true" />
);

const AnalyticsReportGridCardSkeleton = ({ titleWidth = 80, children, className = '' }) => (
    <div className={`arsk-grid-card ${className}`.trim()} aria-hidden="true">
        <Shimmer style={headerBarStyle(titleWidth)} />
        {children}
    </div>
);

/** Matches live CSRDeviceSkeleton layout — left bar + right stacked blocks. */
const AnalyticsReportGridDeviceBody = () => (
    <div className="arsk-grid-device-body" aria-hidden="true">
        <Shimmer className="arsk-grid-device-body__left" />
        <div className="arsk-grid-device-body__right">
            <Shimmer className="arsk-grid-device-body__stack-top" />
            <Shimmer className="arsk-grid-device-body__stack-bottom" />
        </div>
    </div>
);

/** Matches live Demography pie empty state — centered circle. */
const AnalyticsReportGridPieBody = () => (
    <div className="arsk-grid-pie-body" aria-hidden="true">
        <Shimmer className="arsk-grid-pie-body__circle" />
    </div>
);

const AnalyticsReportPortletSkeleton = ({ titleWidth = 100, size = 'sm' }) => (
    <div className={`arsk-portlet arsk-portlet--${size}`} aria-hidden="true">
        <div className="arsk-portlet-header">
            <Shimmer style={headerBarStyle(titleWidth)} />
        </div>
        <div className="arsk-portlet-body">
            <Shimmer className="arsk-portlet-chart" style={{ width: '100%', height: '100%', borderRadius: 4 }} />
        </div>
    </div>
);

const AnalyticsReportInsightsBarsSkeleton = () => (
    <div className="arsk-insights-bars" aria-hidden="true">
        {Array.from({ length: INSIGHTS_BAR_COUNT }, (_, index) => (
            <Shimmer key={index} className="arsk-insights-bar" />
        ))}
    </div>
);

/** Overview sub-heading row — arsk shimmers (Overview label + as-on date + header icons). */
const AnalyticsReportOverviewHeaderSkeleton = () => (
    <div className="arsk-overview-header-inner" aria-hidden="true">
        <div className="arsk-overview-header-left">
            <Shimmer style={{ width: 87, height: 25, borderRadius: 4 }} />
            <Shimmer style={{ width: 183, height: 25, borderRadius: 4 }} />
            {/* <Shimmer className="arsk-portlet-header-icon" style={iconStyle()} /> */}
        </div>
        <div className="arsk-overview-header-right">
            <Shimmer className="arsk-portlet-header-icon" style={iconStyle()} />
            <Shimmer className="arsk-portlet-header-icon" style={iconStyle()} />
            <Shimmer className="arsk-portlet-header-icon" style={iconStyle()} />
            <Shimmer className="arsk-portlet-header-icon" style={iconStyle()} />
        </div>
    </div>
);

const AnalyticsReportInsightsPortletSkeleton = () => (
    <div className="arsk-portlet arsk-portlet--md arsk-portlet--insights" aria-hidden="true">
        <div className="arsk-portlet-header">
            <Shimmer style={headerBarStyle(72)} />
        </div>
        <div className="arsk-portlet-body arsk-portlet-body--insights">
            <AnalyticsReportInsightsBarsSkeleton />
        </div>
    </div>
);

const AnalyticsReportTabStripSkeleton = ({ count = 2 }) => (
    <div className="arsk-tab-strip" aria-hidden="true">
        {Array.from({ length: count }, (_, index) => (
            <Shimmer key={index} className="arsk-portlet-header-icon" style={iconStyle(true)} />
        ))}
    </div>
);

const AnalyticsReportPortletHeaderWithActionsSkeleton = ({ titleWidth }) => (
    <div className="arsk-portlet-header arsk-portlet-header--actions" aria-hidden="true">
        <Shimmer style={headerBarStyle(titleWidth)} />
        <div className="arsk-portlet-header-actions">
            <Shimmer style={headerBarStyle(140)} />
            <Shimmer style={headerBarStyle(120)} />
            <Shimmer style={headerBarStyle(100)} />
        </div>
    </div>
);

const AnalyticsReportCommAnalysisChartSkeleton = () => (
    <div className="arsk-portlet arsk-portlet--auto arsk-portlet--comm-chart" aria-hidden="true">
        <AnalyticsReportPortletHeaderWithActionsSkeleton titleWidth={COMM_ANALYSIS_TITLE_WIDTH} />
        <AnalyticsReportTabStripSkeleton count={COMM_ANALYSIS_TAB_COUNT} />
        <div className="arsk-portlet-body arsk-portlet-body--auto">
            <div className="arsk-comm-line-chart-wrap">
                <LineChartSkeleton stopAnimation={false} height={COMM_ANALYSIS_LINE_CHART_HEIGHT} />
            </div>
        </div>
    </div>
);

const AnalyticsReportChannelTabsSkeleton = () => (
    <div className="arsk-detail-tabs-wrap" aria-hidden="true">
        <ul className="arsk-detail-tabs">
            {COMM_TABLE_TAB_WIDTHS.map((width, index) => (
                <li
                    key={index}
                    className={`arsk-detail-tabs__item`}
                >
                    <Shimmer style={{ width, height: 28, borderRadius: 4 }} />
                </li>
            ))}
        </ul>
    </div>
);

const AnalyticsReportChannelMetricsColumnSkeleton = ({ labelWidths }) => (
    <div className="arsk-channel-metrics-col">
        {Array.from({ length: CHANNEL_METRICS_ROW_COUNT }, (_, index) => (
            <div
                key={index}
                className={`arsk-channel-metrics-row${
                    index % 2 === 0 ? ' arsk-channel-metrics-row--stripe' : ''
                }`}
            >
                <Shimmer style={{ width: labelWidths[index], height: 14, borderRadius: 4 }} />
                <Shimmer
                    style={{
                        width: CHANNEL_METRICS_VALUE_WIDTHS[index],
                        height: 14,
                        borderRadius: 4,
                    }}
                />
            </div>
        ))}
    </div>
);

export const AnalyticsReportChannelAnalyticsBodySkeleton = () => (
    <div className="arsk-channel-analytics-body">
        <div className="arsk-channel-analytics-main">
            <div className="arsk-channel-analytics-metrics">
                <AnalyticsReportChannelMetricsColumnSkeleton
                    labelWidths={CHANNEL_METRICS_LEFT_LABEL_WIDTHS}
                />
                <AnalyticsReportChannelMetricsColumnSkeleton
                    labelWidths={CHANNEL_METRICS_RIGHT_LABEL_WIDTHS}
                />
            </div>
            <div className="arsk-channel-analytics-details">
                <Shimmer style={{ width: 56, height: 14, borderRadius: 4 }} />
            </div>
        </div>
        <div className="arsk-channel-analytics-preview">
            <div className="arsk-channel-preview-panel">
                <Shimmer className="arsk-channel-preview-panel__fill" />
            </div>
        </div>
    </div>
);

const AnalyticsReportCommAnalysisTableSkeleton = () => (
    <div className="arsk-portlet arsk-portlet--auto arsk-portlet--comm-table" aria-hidden="true">
        <div className="arsk-portlet-header arsk-portlet-header--channel">
            <Shimmer style={headerBarStyle(COMM_TABLE_TITLE_WIDTH)} />
            <Shimmer className="arsk-portlet-header-icon" style={iconStyle()} />
        </div>
        <div className="arsk-portlet-body arsk-portlet-body--auto">
            <AnalyticsReportChannelTabsSkeleton />
            <AnalyticsReportChannelAnalyticsBodySkeleton />
        </div>
    </div>
);

const AnalyticsReportRoiPortletSkeleton = () => (
    <div className="arsk-portlet arsk-portlet--auto arsk-portlet--roi" aria-hidden="true">
        <div className="arsk-portlet-header arsk-portlet-header--actions">
            <Shimmer style={headerBarStyle(ROI_TITLE_WIDTH)} />
            <Shimmer style={headerBarStyle(120)} />
        </div>
        <div className="arsk-portlet-body arsk-portlet-body--auto">
            <RoiChartSkeleton isError={false} />
        </div>
    </div>
);

const AnalyticsReportBenchmarkPortletSkeleton = () => (
    <div className="arsk-portlet arsk-portlet--auto arsk-portlet--benchmark" aria-hidden="true">
        <div className="arsk-portlet-header arsk-portlet-header--actions">
            <Shimmer style={headerBarStyle(BENCHMARK_TITLE_WIDTH)} />
            <div className="arsk-portlet-header-actions">
                <Shimmer style={headerBarStyle(100)} />
                <Shimmer className="arsk-portlet-header-icon" style={iconStyle(true)} />
                <Shimmer className="arsk-portlet-header-icon" style={iconStyle(true)} />
            </div>
        </div>
        <div className="arsk-portlet-body arsk-portlet-body--auto">
            <PerformanceBenchmarkSkeleton isError={false} />
        </div>
    </div>
);

/** Live summary card header shimmers — drop into existing .a-card-label / .a-card-dropdown-icon. */
export const AnalyticsReportSummaryCardLabelSkeleton = () => (
    <>
        <Shimmer style={headerBarStyle(70)} />
        <Shimmer className="arsk-portlet-header-icon" style={iconStyle()} />
    </>
);

export const AnalyticsReportSummaryCardActionsSkeleton = () => (
    <>
        <Shimmer className="arsk-portlet-header-icon" style={iconStyle()} />
        <Shimmer className="arsk-portlet-header-icon" style={iconStyle()} />
    </>
);

/** Live comm analysis chart body — line or bar variant inside existing Commuanalysis portlet + RSPTab. */
export const AnalyticsReportCommAnalysisChartBodySkeleton = ({
    variant = 'line',
    stopAnimation = false,
    isError = false,
}) => {
    const isColumn = variant === 'column';
    const wrapClassName = isColumn ? 'arsk-comm-bar-chart-wrap' : 'arsk-comm-line-chart-wrap';

    return (
        <div
            className={`arsk-portlet-body arsk-portlet-body--auto mt30${
                isError ? ' arsk-comm-chart-slot--nodata' : ''
            }`.trim()}
            aria-hidden={isError ? undefined : 'true'}
        >
            <div className={wrapClassName}>
                {isColumn ? (
                    <ColumnChartSkeletonNew
                        chartHeight={COMM_ANALYSIS_CHART_BODY_HEIGHT}
                        isError={isError}
                        nodata={isError}
                    />
                ) : (
                    <LineChartSkeleton
                        stopAnimation={stopAnimation || isError}
                        isError={isError}
                        height={COMM_ANALYSIS_LINE_CHART_HEIGHT}
                    />
                )}
            </div>
        </div>
    );
};

const AUDIENCE_DETAILS_SCRUBBED_ROW_COUNT = 6;
const AUDIENCE_DETAILS_AFTER_BLAST_ROW_COUNT = 2;

/** Live Communication audience details modal — matches .audience-details-modal-body layout. */
export const AnalyticsReportAudienceDetailsModalSkeleton = () => (
    <div className="audience-details-modal-body audience-details-modal-body--loading" aria-hidden="true">
        <div className="pre-blast-info-modal-header d-flex justify-content-between align-items-center mb20">
            <div className="d-flex align-items-center">
                <CommonSkeleton circle height={24} width={24} />
                <CommonSkeleton box height={20} width={160} className="ml10" />
            </div>
            <CommonSkeleton box height={32} width={96} />
        </div>
        <div className="detail-body detail-list">
            <ul>
                <li>
                    <CommonSkeleton box height={14} width={140} />
                    <CommonSkeleton box height={14} width={36} />
                </li>
            </ul>
            <h5 className="font-smd mb10">
                <CommonSkeleton box height={16} width={220} />
            </h5>
            <ul>
                {Array.from({ length: AUDIENCE_DETAILS_SCRUBBED_ROW_COUNT }, (_, index) => (
                    <li key={`audience-details-scrubbed-${index}`}>
                        <CommonSkeleton box height={14} width={96 + (index % 3) * 12} />
                        <CommonSkeleton box height={14} width={48} />
                    </li>
                ))}
            </ul>
            <p className="font-smd mb10">
                <CommonSkeleton box height={16} width={200} />
            </p>
            <ul>
                {Array.from({ length: AUDIENCE_DETAILS_AFTER_BLAST_ROW_COUNT }, (_, index) => (
                    <li key={`audience-details-after-${index}`}>
                        <CommonSkeleton box height={14} width={108} />
                        <CommonSkeleton box height={14} width={48} />
                    </li>
                ))}
            </ul>
        </div>
    </div>
);

/** Live channel analytics block — fits inside existing portlet-fluid-tab. */
export const AnalyticsReportChannelAnalyticsSkeleton = ({ nodata = false }) => (
    <div
        className={`arsk-channel-analytics-slot${nodata ? ' arsk-channel-analytics-slot--nodata' : ''}`.trim()}
        aria-hidden={nodata ? undefined : 'true'}
    >
        {nodata ? <NoData /> : null}
        <div className="portlet-header arsk-portlet-header arsk-portlet-header--channel d-flex justify-content-inherit align-items-center">
            <Shimmer style={headerBarStyle(COMM_TABLE_TITLE_WIDTH)} />
            <Shimmer className="arsk-portlet-header-icon" style={iconStyle()} />
        </div>
        <div className="arsk-portlet-body arsk-portlet-body--auto">
            <AnalyticsReportChannelTabsSkeleton />
            <AnalyticsReportChannelAnalyticsBodySkeleton />
        </div>
    </div>
);

/** CSR report body — matches Overview + expand viewers + Performance + Insights. */
export const AnalyticsReportBodySkeleton = () => (
    <div
        className="arsk-body analytics-report-skeleton-body arsk-scope analytics-report-skeleton-scope"
        aria-hidden="true"
    >
        <div className="arsk-overview-header">
            <AnalyticsReportOverviewHeaderSkeleton />
        </div>

        <div className="arsk-row arsk-row--overview">
            <div className="arsk-col arsk-col-7">
                <div className="arsk-summary-card">
                    <div className="arsk-summary-card-header">
                        <div className="arsk-summary-card-label">
                            <Shimmer style={headerBarStyle(70)} />
                            <Shimmer className="arsk-portlet-header-icon" style={iconStyle()} />
                        </div>
                        <div className="arsk-summary-card-actions">
                            <Shimmer className="arsk-portlet-header-icon" style={iconStyle()} />
                            <Shimmer className="arsk-portlet-header-icon" style={iconStyle()} />
                        </div>
                    </div>
                    <DetailOverviewSkeleton isError={false} />
                </div>
            </div>
            <div className="arsk-col arsk-col-5">
                <div className="arsk-row arsk-row--grid">
                    <div className="arsk-col arsk-col-6 arsk-grid-item">
                        <AnalyticsReportGridCardSkeleton titleWidth={GRID_CARD_TITLE_WIDTHS[0]}>
                            <AnalyticsReportGridDeviceBody />
                        </AnalyticsReportGridCardSkeleton>
                    </div>
                    <div className="arsk-col arsk-col-6 arsk-grid-item">
                        <AnalyticsReportGridCardSkeleton titleWidth={GRID_CARD_TITLE_WIDTHS[1]}>
                            <AnalyticsReportGridDeviceBody />
                        </AnalyticsReportGridCardSkeleton>
                    </div>
                    <div className="arsk-col arsk-col-6 arsk-grid-item">
                        <AnalyticsReportGridCardSkeleton titleWidth={GRID_CARD_TITLE_WIDTHS[2]}>
                            <AnalyticsReportGridPieBody />
                        </AnalyticsReportGridCardSkeleton>
                    </div>
                    <div className="arsk-col arsk-col-6 arsk-grid-item">
                        <AnalyticsReportGridCardSkeleton titleWidth={GRID_CARD_TITLE_WIDTHS[3]}>
                            <AnalyticsReportGridDeviceBody />
                        </AnalyticsReportGridCardSkeleton>
                    </div>
                </div>
            </div>
        </div>

        {/* <div className="arsk-row arsk-row--expand">
            <div className="arsk-col arsk-col-6 arsk-expand-item">
                <AnalyticsReportPortletSkeleton titleWidth={EXPAND_PORTLET_TITLE_WIDTHS[0]} size="sm" />
            </div>
            <div className="arsk-col arsk-col-6 arsk-expand-item">
                <AnalyticsReportPortletSkeleton titleWidth={EXPAND_PORTLET_TITLE_WIDTHS[1]} size="sm" />
            </div>
        </div> */}

        <div className="arsk-row arsk-row--perf-insights">
            <div className="arsk-col arsk-col-6">
                <div className="arsk-portlet arsk-portlet--md arsk-portlet--perf-snap">
                    <div className="arsk-portlet-body">
                        <PerformanceSnapshotSkeleton isError={false} />
                    </div>
                </div>
            </div>
            <div className="arsk-col arsk-col-6">
                <AnalyticsReportInsightsPortletSkeleton />
            </div>
        </div>

        <div className="arsk-row arsk-row--section">
            <div className="arsk-col arsk-col-12">
                <AnalyticsReportCommAnalysisChartSkeleton />
            </div>
        </div>

        <div className="arsk-row arsk-row--section">
            <div className="arsk-col arsk-col-12">
                <AnalyticsReportCommAnalysisTableSkeleton />
            </div>
        </div>

        <div className="arsk-row arsk-row--section">
            <div className="arsk-col arsk-col-12">
                <AnalyticsReportRoiPortletSkeleton />
            </div>
        </div>

        <div className="arsk-row arsk-row--section">
            <div className="arsk-col arsk-col-12">
                <AnalyticsReportBenchmarkPortletSkeleton />
            </div>
        </div>
    </div>
);

const renderAnalyticsReportFullPage = (body) => (
    <>
        <BreadcrumbSkeleton />
        <Container fluid>
            <div className="page-content analytics-report-skeleton-scope">
                <Container className="px0">
                    <RSPageHeaderSkeleton variant="csr" embedInPageShell />
                    {body}
                </Container>
            </div>
        </Container>
    </>
);

const analyticsReportLoadingScene = createPageLoadingScene({
    scopeClass: 'arsk-scope analytics-report-skeleton-scope analytics-skeleton-scope',
    suspenseFallbackClass: 'analytics-report-suspense-fallback',
    ariaLabel: 'Loading analytics report',
    pageCriticalCss: analyticsReportSkeletonCriticalCss,
    markRouteSkeleton: markAnalyticsReportRouteSkeleton,
    loadingHolderStyle: ANALYTICS_REPORT_LOADING_HOLDER_STYLE,
    BodySkeleton: AnalyticsReportBodySkeleton,
    renderFullPage: renderAnalyticsReportFullPage,
    InlineBlock: () => (
        <>
            <style>{analyticsReportSkeletonCriticalCss}</style>
            <div className="analytics-report-inline-skeleton arsk-scope analytics-report-skeleton-scope">
                <AnalyticsReportBodySkeleton />
            </div>
        </>
    ),
});

export const AnalyticsReportPageContentSkeleton = analyticsReportLoadingScene.PageContentSkeleton;

const AnalyticsReportRouteSkeletonBase = analyticsReportLoadingScene.RouteSkeleton;
const AnalyticsReportSuspenseFallbackBase = analyticsReportLoadingScene.SuspenseFallback;

/** Bootstrap shell — mark phase so in-page loading reuses the same skeleton shell. */
export const AnalyticsReportRouteSkeleton = (props) => {
    useLayoutEffect(() => {
        markAnalyticsReportRouteSkeleton();
    }, []);

    return <AnalyticsReportRouteSkeletonBase {...props} />;
};

export const AnalyticsReportSuspenseFallback = (props) => (
    <AnalyticsReportSuspenseFallbackBase {...props} />
);

export const AnalyticsReportLoadingBlock = () => (
    <AnalyticsReportPageContentSkeleton inline />
);

export const AnalyticsReportPageSkeleton = () => (
    <div
        className="page-content-holder arsk-page analytics-report-skeleton arsk-scope analytics-report-skeleton-scope analytics-skeleton-scope"
        aria-busy="true"
        aria-label="Loading analytics report"
    >
        <AnalyticsReportPageContentSkeleton wrapScope={false} />
    </div>
);

export default memo(AnalyticsReportPageSkeleton);
