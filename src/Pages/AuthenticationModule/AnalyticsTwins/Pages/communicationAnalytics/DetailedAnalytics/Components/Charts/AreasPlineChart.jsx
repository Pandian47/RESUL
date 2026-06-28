import { hasNonZeroSeriesChartData } from 'Utils/modules/charts';
import { areasplineChartOptions } from 'Constants/Charts';
import RSHighchartsContainer from 'Components/Highcharts';
import ListAqusitionSekelton from 'Components/Skeleton/Components/ListAqusitionSekelton';
import { NoData } from 'Components/Skeleton/Skeleton';


const AreasPlineChartNoDataPlaceholder = () => (
    <div className="position-relative w-100">
        <ListAqusitionSekelton isChartSkeleton isCustom stopAnimation />
        <div
            className="position-absolute d-flex align-items-center justify-content-center"
            style={{ top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, pointerEvents: 'none' }}
        >
            <NoData text="No data available" />
        </div>
    </div>
);

const AreasPlineChart = ({ areaPlineDataList }) => {
    if (!hasNonZeroSeriesChartData(areaPlineDataList)) {
        return <AreasPlineChartNoDataPlaceholder />;
    }

    return (
        <div>
            <RSHighchartsContainer
                type="area"
                pClassName="x-axis-labels-performance"
                key="triger_chart"
                options={areasplineChartOptions(areaPlineDataList)}
            />
        </div>
    );
};

export default AreasPlineChart;
