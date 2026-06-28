import { Fragment } from 'react';
import PropTypes from 'prop-types';

import ListAqusitionSekelton from 'Components/Skeleton/Components/ListAqusitionSekelton';
import ResKendoGridLoadingSkeleton from 'Pages/KendoDocs/CommonComponents/ResKendoGrid/GridLoadingSkeleton';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';

import { BUBBLE_CHART_PLACEHOLDERS, LIVE_RETENTION_BODY_CELL_HEIGHT, SKELETON_BG } from '../dashboardSkeletonUtils';
import DashboardSkeletonScope from '../DashboardSkeletonScope';

const RETENTION_COL_COUNT = 7;
const RETENTION_ROW_COUNT = 5;

const COLUMN_BAR_HEIGHTS = [170, 110, 290, 160, 230, 140, 210];

const SANKEY_BAR_COUNT = 7;

const PATH_ANALYSER_DEFAULT_FILTER_COUNT = 6;

const PathAnalyserFilterSkeleton = ({ count }) => (
    <div className="db-sk-path-analyser__filters">
        {Array.from({ length: count }, (_, index) => (
            <div key={index} className="db-sk-path-analyser__filter">
                <span className="db-sk-block db-sk-path-analyser__filter-field" aria-hidden="true" />
            </div>
        ))}
    </div>
);

PathAnalyserFilterSkeleton.propTypes = {
    count: PropTypes.number,
};

/** Path analyser header toolbar placeholders */
export const DbSkPathAnalyserActionsSkeleton = () => (
    <div className="db-sk-path-analyser__actions">
        <span className="db-sk-block db-sk-path-analyser__levels" aria-hidden="true" />
        <span className="db-sk-block db-sk-path-analyser__icon" aria-hidden="true" />
        <span className="db-sk-block db-sk-path-analyser__icon" aria-hidden="true" />
    </div>
);

const DbSkNoData = ({ className = '', message }) => (
    <NoDataAvailableRender className={`nodata-skeleton-con ${className}`.trim()} message={message} />
);

DbSkNoData.propTypes = {
    className: PropTypes.string,
    message: PropTypes.string,
};

/** Visitor status — circle + two metric columns */
export const DbSkUserStatusSkeleton = () => (
    <div className="db-sk-user-status">
        <span className="db-sk-block db-sk-user-status__avatar" aria-hidden="true" />
        <div className="db-sk-user-status__metrics">
            <div className="db-sk-user-status__metric">
                <span className="db-sk-block db-sk-user-status__line db-sk-user-status__line--sm" aria-hidden="true" />
                <span className="db-sk-block db-sk-user-status__line db-sk-user-status__line--lg" aria-hidden="true" />
            </div>
            <div className="db-sk-user-status__metric">
                <span className="db-sk-block db-sk-user-status__line db-sk-user-status__line--sm" aria-hidden="true" />
                <span className="db-sk-block db-sk-user-status__line db-sk-user-status__line--lg" aria-hidden="true" />
            </div>
        </div>
    </div>
);

const KeyMetricsSection = ({ columns = 2 }) => (
    <div className={`db-sk-keymetrics-section db-sk-keymetrics-section--${columns}`}>
        <div className={`db-sk-keymetrics-row db-sk-keymetrics-row--${columns}`}>
            {Array.from({ length: columns }, (_, index) => (
                <span key={`value-${index}`} className="db-sk-block db-sk-keymetrics__value" aria-hidden="true" />
            ))}
        </div>
        <div className={`db-sk-keymetrics-row db-sk-keymetrics-row--labels db-sk-keymetrics-row--${columns}`}>
            {Array.from({ length: columns }, (_, index) => (
                <span key={`label-${index}`} className="db-sk-block db-sk-keymetrics__label" aria-hidden="true" />
            ))}
        </div>
    </div>
);

KeyMetricsSection.propTypes = {
    columns: PropTypes.number,
};

/** Key metrics portlet body — 2 columns × 2 sections */
export const DbSkKeyMetricsBodySkeleton = ({ isError = false }) => (
    <div className="db-sk-keymetrics-body">
        {isError ? <DbSkNoData /> : null}
        <KeyMetricsSection columns={2} />
        <KeyMetricsSection columns={2} />
    </div>
);

DbSkKeyMetricsBodySkeleton.propTypes = {
    isError: PropTypes.bool,
};

/** Active users portlet body — 3 columns × 2 sections */
export const DbSkActiveUsersBodySkeleton = ({ isError = false }) => (
    <div className="db-sk-keymetrics-body db-sk-keymetrics-body--3col">
        {isError ? <DbSkNoData /> : null}
        <KeyMetricsSection columns={3} />
        <KeyMetricsSection columns={3} />
    </div>
);

DbSkActiveUsersBodySkeleton.propTypes = {
    isError: PropTypes.bool,
};

/** Live traffic line chart — chart-only acquisition skeleton */
export const DbSkTrafficChartSkeleton = () => (
    <div className="db-sk-live-traffic">
        <ListAqusitionSekelton
            isChartSkeleton
            isCustom
            disableLegendAnimation
            isCommunicationSent
            injectCriticalCss={false}
        />
    </div>
);

/** Horizontal bar list placeholder */
export const DbSkHorizontalBarsSkeleton = ({ count = 7, barHeight = 34, isError = false }) => (
    <div className="db-sk-horizontal-bars">
        {isError ? <DbSkNoData /> : null}
        {Array.from({ length: count }, (_, index) => (
            <span
                key={index}
                className="db-sk-block db-sk-horizontal-bars__bar"
                style={{ height: barHeight }}
                aria-hidden="true"
            />
        ))}
    </div>
);

DbSkHorizontalBarsSkeleton.propTypes = {
    count: PropTypes.number,
    barHeight: PropTypes.number,
    isError: PropTypes.bool,
};

/** Path analyser sankey-style horizontal bars */
export const DbSkSankeySkeleton = ({ isError = false, fillChartSlot = false }) => (
    <div
        className={`db-sk-sankey-area${isError ? ' db-sk-sankey-area--error' : ''}`}
        style={fillChartSlot ? pathAnalyserChartSlotSankeyAreaStyle : undefined}
    >
        {isError ? <DbSkNoData /> : null}
        <div className="db-sk-sankey" style={fillChartSlot ? pathAnalyserChartSlotSankeyBarStackStyle : undefined}>
            {Array.from({ length: SANKEY_BAR_COUNT }, (_, index) => (
                <span
                    key={index}
                    className="db-sk-block db-sk-sankey__bar"
                    style={fillChartSlot ? getPathAnalyserChartSlotSankeyBarStyle() : { width: '100%' }}
                    aria-hidden="true"
                />
            ))}
        </div>
    </div>
);

DbSkSankeySkeleton.propTypes = {
    isError: PropTypes.bool,
    fillChartSlot: PropTypes.bool,
};

/** Path analyser portlet — title, toolbar, filter row, and sankey bars */
export const DbSkPathAnalyserSkeleton = ({
    isError = false,
    filterCount = PATH_ANALYSER_DEFAULT_FILTER_COUNT,
    withPortletShell = true,
    hideHeader = false,
    showFilters = true,
}) => {
    const header = (
        <div className={`db-sk-path-analyser__header${withPortletShell ? ' db-sk-portlet-header' : ''}`}>
            <span className="db-sk-block db-sk-path-analyser__title" aria-hidden="true" />
            <DbSkPathAnalyserActionsSkeleton />
        </div>
    );

    const body = (
        <div className={`db-sk-path-analyser__content${withPortletShell ? ' db-sk-portlet-body' : ''}`}>
            {showFilters ? <PathAnalyserFilterSkeleton count={filterCount} /> : null}
            <DbSkSankeySkeleton isError={isError} />
        </div>
    );

    const shellClassName = withPortletShell
        ? 'db-sk-path-analyser db-sk-portlet db-sk-portlet--lg'
        : 'db-sk-path-analyser db-sk-path-analyser--inline';

    return (
        <div className={shellClassName}>
            {!hideHeader ? header : null}
            {body}
        </div>
    );
};

DbSkPathAnalyserSkeleton.propTypes = {
    isError: PropTypes.bool,
    filterCount: PropTypes.number,
    withPortletShell: PropTypes.bool,
    hideHeader: PropTypes.bool,
    showFilters: PropTypes.bool,
};

/** Path analyser chart zone — fixed height matching live sankey (310 / 450 expanded). */
export const PATH_ANALYSER_CHART_HEIGHT = 310;
export const PATH_ANALYSER_CHART_HEIGHT_EXPANDED = 450;
export const PATH_ANALYSER_CHART_FOOTER_SPACE = 19;

const pathAnalyserChartSlotSankeyAreaStyle = {
    width: '100%',
    flex: '1 1 0',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
};

const pathAnalyserChartSlotSankeyBarStackStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    flex: '1 1 0',
    minHeight: 0,
    height: '100%',
    width: '100%',
    boxSizing: 'border-box',
};

const getPathAnalyserChartSlotInnerStyle = () => ({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    flex: '1 1 0',
    minHeight: 0,
    boxSizing: 'border-box',
});

const pathAnalyserChartSlotFooterStyle = {
    flex: '0 0 19px',
    flexShrink: 0,
    height: PATH_ANALYSER_CHART_FOOTER_SPACE,
    width: '100%',
};

const getPathAnalyserChartSlotSankeyBarStyle = () => ({
    flex: '1 1 0',
    width: '100%',
    minHeight: 28,
    backgroundColor: SKELETON_BG,
    borderRadius: 5,
});

export const getPathAnalyserChartSlotStyle = () => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    flex: '1 1 0',
    minHeight: 0,
    boxSizing: 'border-box',
    overflow: 'hidden',
});

export const getPathAnalyserChartSlotOverlayStyle = () => ({
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    width: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 2,
    background: '#ffffff',
});

/** Path analyser sankey area only — used inside `.db-sk-path-analyser-chart-slot` while refreshing */
export const DbSkPathAnalyserSankeySkeleton = () => <DbSkSankeySkeleton fillChartSlot />;

DbSkPathAnalyserSankeySkeleton.propTypes = {};

/** Path analyser chart slot — keeps chart mounted for stable height; skeleton overlays while loading */
export const DbSkPathAnalyserChartSlot = ({ isExpanded = false, isLoading = false, isError = false, children }) => (
    <div
        className={`db-sk-path-analyser-chart-slot${
            isExpanded ? ' db-sk-path-analyser-chart-slot--expanded' : ''
        }`}
        style={getPathAnalyserChartSlotStyle()}
    >
        <div className="db-sk-path-analyser-chart-slot__chart">
            <div
                className="db-sk-path-analyser-chart-slot__mount"
                aria-hidden={isLoading || undefined}
                style={
                    isLoading
                        ? { opacity: 0, pointerEvents: 'none', userSelect: 'none' }
                        : undefined
                }
            >
                {children}
            </div>
            {isLoading || isError ? (
                <DashboardSkeletonScope
                    className="db-sk-portlet-inline db-sk-path-analyser-chart-slot__overlay"
                    injectCriticalCss
                    style={getPathAnalyserChartSlotOverlayStyle()}
                >
                    <div className="db-sk-path-analyser-chart-slot__inner" style={getPathAnalyserChartSlotInnerStyle()}>
                        <DbSkSankeySkeleton isError={isError} fillChartSlot />
                        <div
                            className="db-sk-path-analyser-chart-slot__footer"
                            style={pathAnalyserChartSlotFooterStyle}
                            aria-hidden="true"
                        />
                    </div>
                </DashboardSkeletonScope>
            ) : null}
        </div>
    </div>
);

DbSkPathAnalyserChartSlot.propTypes = {
    isExpanded: PropTypes.bool,
    isLoading: PropTypes.bool,
    isError: PropTypes.bool,
    children: PropTypes.node,
};

/** Pie / donut chart with legend */
export const DbSkPieChartSkeleton = ({ isError = false, withLegend = true, size = 220, offsetTop = false }) => (
    <div className={`db-sk-pie-chart${offsetTop ? ' db-sk-pie-chart--offset-top' : ''}`}>
        {isError ? <DbSkNoData /> : null}
        <span
            className="db-sk-block db-sk-pie-chart__circle"
            style={{ width: size, height: size }}
            aria-hidden="true"
        />
        {withLegend ? (
            <div className="db-sk-pie-chart__legend">
                {[0, 1, 2].map((index) => (
                    <Fragment key={index}>
                        <span className="db-sk-block db-sk-pie-chart__legend-dot" aria-hidden="true" />
                        <span className="db-sk-block db-sk-pie-chart__legend-text" aria-hidden="true" />
                    </Fragment>
                ))}
            </div>
        ) : null}
    </div>
);

DbSkPieChartSkeleton.propTypes = {
    isError: PropTypes.bool,
    withLegend: PropTypes.bool,
    size: PropTypes.number,
    offsetTop: PropTypes.bool,
};

/** Column chart with axis */
export const DbSkColumnChartSkeleton = ({ isError = false, withTopOffset = false, message }) => (
    <div className={`db-sk-column-chart${withTopOffset ? ' db-sk-column-chart--offset-top' : ''}`}>
        {isError ? <DbSkNoData message={message} /> : null}
        <div className="db-sk-column-chart__plot">
            <div className="db-sk-column-chart__bars">
                {COLUMN_BAR_HEIGHTS.map((height, index) => (
                    <span
                        key={index}
                        className="db-sk-block db-sk-column-chart__bar"
                        style={{ height }}
                        aria-hidden="true"
                    />
                ))}
            </div>
        </div>
    </div>
);

DbSkColumnChartSkeleton.propTypes = {
    isError: PropTypes.bool,
    withTopOffset: PropTypes.bool,
    message: PropTypes.string,
};

/** Usage behaviour by hours — circular 24h gauge placeholder */
export const DbSkGaugeChartSkeleton = ({ isError = false, size = 220 }) => (
    <div className="db-sk-gauge-chart">
        {isError ? <DbSkNoData /> : null}
        <div className="db-sk-gauge-chart__plot">
            <span
                className="db-sk-block db-sk-gauge-chart__ring"
                style={{ width: size, height: size }}
                aria-hidden="true"
            />
            <span className="db-sk-block db-sk-gauge-chart__center" aria-hidden="true" />
        </div>
    </div>
);

DbSkGaugeChartSkeleton.propTypes = {
    isError: PropTypes.bool,
    size: PropTypes.number,
};

/** Bubble chart */
export const DbSkBubbleChartSkeleton = ({ isError = false }) => (
    <div className="db-sk-bubble-chart">
        {isError ? <DbSkNoData className="db-sk-bubble-chart__nodata" /> : null}
        <div className="db-sk-bubble-chart__plot">
            <div className="db-sk-bubble-chart__plot-inner">
                {BUBBLE_CHART_PLACEHOLDERS.map((bubble) => (
                    <span
                        key={`${bubble.left}-${bubble.top}`}
                        className="db-sk-block db-sk-bubble-chart__bubble"
                        style={{
                            left: bubble.left,
                            top: bubble.top,
                            width: bubble.width,
                            height: bubble.height,
                            borderRadius: '50%',
                        }}
                        aria-hidden="true"
                    />
                ))}
            </div>
        </div>
    </div>
);

DbSkBubbleChartSkeleton.propTypes = {
    isError: PropTypes.bool,
};

/** Line chart — full acquisition skeleton */
export const DbSkLineChartSkeleton = ({ isError = false }) => (
    <div className="db-sk-line-chart">
        {isError ? <DbSkNoData /> : null}
        <ListAqusitionSekelton
            isChartSkeleton
            isCustom
            injectCriticalCss={false}
            stopAnimation={isError}
        />
    </div>
);

DbSkLineChartSkeleton.propTypes = {
    isError: PropTypes.bool,
};

const RetentionGridSkeleton = ({ isError = false }) => (
    <div className="db-sk-retention-grid">
        <div className="reskendogrid">
            <div className="reskendogrid-table rs-kendo-grid-table grid-loading-state">
                <div className="k-grid rs-kendo-scrollable-grid grid-loading-state">
                    <div className="k-grid-norecords">
                        <ResKendoGridLoadingSkeleton
                            rows={RETENTION_ROW_COUNT}
                            columns={RETENTION_COL_COUNT}
                            isLoading={!isError}
                            showNoData={isError}
                            wrapperClassName=""
                            injectCriticalCss={false}
                            bodyRowHeight={LIVE_RETENTION_BODY_CELL_HEIGHT}
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

RetentionGridSkeleton.propTypes = {
    isError: PropTypes.bool,
};

/** Retention table grid skeleton */
export const DbSkRetentionTableSkeleton = ({ isError = false, withPortletBox = true }) => {
    const gridSkeleton = <RetentionGridSkeleton isError={isError} />;

    if (!withPortletBox) {
        return gridSkeleton;
    }

    return (
        <div className="portlet-box-theme border">
            <div className="tabs-content rs-table-wrapper shadow-none border-0">{gridSkeleton}</div>
        </div>
    );
};

DbSkRetentionTableSkeleton.propTypes = {
    isError: PropTypes.bool,
    withPortletBox: PropTypes.bool,
};

/** Inline portlet skeleton scope — injects critical CSS for db-sk-* layout inside live portlets */
export const DbSkPortletInlineSkeleton = ({ children }) => (
    <DashboardSkeletonScope className="db-sk-portlet-inline" injectCriticalCss>
        {children}
    </DashboardSkeletonScope>
);

DbSkPortletInlineSkeleton.propTypes = {
    children: PropTypes.node,
};
