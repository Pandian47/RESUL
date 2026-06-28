import { hasNonZeroSeriesChartData } from 'Utils/modules/charts';
import { formatPercentageDisplay } from 'Utils/modules/formatters';
import { columnChartOptions } from 'Constants/Charts';
import { memo, useMemo } from 'react';
import RSHighchartsContainer from 'Components/Highcharts';
import { ColumnChartSkeleton, NoData } from 'Components/Skeleton/Skeleton';


/** Conversion portlet no-data: column chart skeleton centered in portlet, "No data available" centered overlay. */
const ColumnChartNoDataPlaceholder = () => (
    <div className="column-chart-nodata position-relative w-100 mt-25">
        <div className="column-chart-nodata__skeleton w-100 d-flex align-items-center justify-content-center">
            <ColumnChartSkeleton isError hideInternalNoData />
        </div>
        <div
            className="position-absolute d-flex align-items-center justify-content-center"
        >
            <NoData text="No data available" />
        </div>
    </div>
);

const ColumnChart = ({ title, chartData, footerPercent, footerText }) => {
    const hasRenderableData = hasNonZeroSeriesChartData(chartData);

    const memoizedOptions = useMemo(() => {
        if (!hasRenderableData) {
            return null;
        }
        return columnChartOptions(chartData);
    }, [chartData, hasRenderableData]);

    const chartComponent = useMemo(() => {
        if (!memoizedOptions) {
            return <ColumnChartNoDataPlaceholder />;
        }
        return (
            <RSHighchartsContainer
                type="columnChart"
                options={memoizedOptions}
            />
        );
    }, [memoizedOptions]);

    return (
        <div className="portlet-container portlet-md pfooter">
            <div className="portlet-header">
                <h4>{title}</h4>
            </div>
            {!hasRenderableData ? (
                <div className="portlet-body">
                    <ColumnChartNoDataPlaceholder />
                </div>
            ) : (
                <>
                    <div className="portlet-body">
                        {chartComponent}
                    </div>
                    <div className="portlet-footer portlet-two-label">
                        <ul>
                            <li>
                                <span> {formatPercentageDisplay(footerPercent) || 0}</span>
                                <small>%</small>
                            </li>
                            <li>{footerText}</li>
                        </ul>
                    </div>
                </>
            )}
        </div>
    );
};

export default memo(ColumnChart);
