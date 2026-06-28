import { hasNonZeroPieChartSeriesData } from 'Utils/modules/charts';
import { formatPercentageDisplay } from 'Utils/modules/formatters';
import { pieChartOptions } from 'Constants/Charts';
import { memo, useMemo } from 'react';
import RSHighchartsContainer from 'Components/Highcharts';
import { PieChartSkeleton } from 'Components/Skeleton/Skeleton';


const PieChart = ({ title, chartData = {}, footerPercent, footerText, keyIndex }) => {
    const hasRenderableData = hasNonZeroPieChartSeriesData(chartData);

    const memoizedOptions = useMemo(() => {
        if (!hasRenderableData) {
            return null;
        }
        return pieChartOptions(chartData);
    }, [chartData, hasRenderableData]);

    const chartComponent = useMemo(() => {
        if (!memoizedOptions) {
            return <PieChartSkeleton isError={true} customTop={true} />;
        }
        return (
            <RSHighchartsContainer
                type="pie"
                key={keyIndex}
                options={memoizedOptions}
            />
        );
    }, [memoizedOptions, keyIndex]);

    return (
        <div className="portlet-container portlet-md pfooter">
            <div className="portlet-header">
                <h4>{title}</h4>
            </div>
            <div className="portlet-body">
                {chartComponent}
            </div>
            {hasRenderableData ? (
                <div className="portlet-footer portlet-two-label">
                    <ul>
                        <li>
                            <span> {formatPercentageDisplay(footerPercent) || 0}</span>
                            <small>%</small>
                        </li>
                        <li><>{footerText}</></li>
                    </ul>
                </div>
            ) : null}
        </div>
    );
};

export default memo(PieChart);
