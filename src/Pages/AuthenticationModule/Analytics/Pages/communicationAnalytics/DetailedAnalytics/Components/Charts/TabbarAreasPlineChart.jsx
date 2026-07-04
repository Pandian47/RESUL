import { hasNonZeroSeriesChartData } from 'Utils/modules/charts';
import { showPercentage } from 'Utils/modules/formatters';
import { areasplineChartOptions } from 'Constants/Charts';
import { memo } from 'react';
import RSChartTabbar from 'Components/RSChartTabber';
import RSHighchartsContainer from 'Components/Highcharts';
import ListAqusitionSekelton from 'Components/Skeleton/Components/ListAqusitionSekelton';
import { NoData } from 'Components/Skeleton/Skeleton';


/** Line-chart no-data placeholder: skeleton full width and centered, with "No data available" centered on top. */
const LineChartNoDataPlaceholder = () => (
    <>
            <ListAqusitionSekelton isChartSkeleton isCustom stopAnimation />
        <div
            className="position-absolute d-flex align-items-center justify-content-center"
            style={{ top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, pointerEvents: 'none' }}
        >
            <NoData text="No data available" />
        </div>
    </>
);

const TabbarAreasPlineChart = (props) => {
    const {
        heading,
        isChartExpanded,
        footerStatus,
        splitItem,
        overAllPercent,
        overAllText,
        first24HoursPercent,
        first24HoursText,
        expandViewStatus,
        expandChartAction,
        splitItemText,
        overAllTextData,
        first24HoursData,
        channelType,
        hideFirst24HoursTab = false,
    } = props;

    // Check if there's only one value in the chart (single data point)
    const hasSingleValue = overAllTextData?.categories?.length === 1 || 
                          (overAllTextData?.series?.length > 0 && 
                           overAllTextData?.series?.[0]?.length === 1);

    const hasOverallChartData = hasNonZeroSeriesChartData(overAllTextData);
    const hasFirst24HoursChartData = hasNonZeroSeriesChartData(first24HoursData);

    const tabData = [
        {
            id: 'overall',
            text: 'Overall',
            textClass: 'font-sm',
            component: () =>
                splitItem === 'controlGroup' || !hasOverallChartData ? (
                    <LineChartNoDataPlaceholder />
                ) : (
                    <RSHighchartsContainer
                        type="area"
                        pClassName="x-axis-labels-performance"
                        key="overall"
                        options={areasplineChartOptions(overAllTextData)}
                        content={props?.content}
                    />
                ),
            footer:
                !hasOverallChartData ? null : (
                    <div className="portlet-footer portlet-two-label">
                        {footerStatus && (
                            <ul>
                                <li>
                                    <span>{showPercentage(overAllPercent || 0)}</span>
                                    <small>%</small>
                                </li>
                                <li>{overAllText}</li>
                            </ul>
                        )}
                    </div>
                ),
        },
    ];

    // Only add First 24 hrs tab if hideFirst24HoursTab is false
    if (!hideFirst24HoursTab) {
        tabData.push({
            id: 'first_24_hr',
            text: 'First 24 hrs',
            textClass: 'font-sm',
            component: () =>
                !hasFirst24HoursChartData ? (
                    <LineChartNoDataPlaceholder />
                ) : (
                    <RSHighchartsContainer
                        type="area"
                        pClassName="x-axis-labels-performance"
                        key={'first_24_hr'}
                        options={areasplineChartOptions(first24HoursData)}
                    />
                ),
            disable: channelType === 'Social media' ? true : false,
            footer:
                !hasFirst24HoursChartData ? null : (
                    <div className="portlet-footer portlet-two-label">
                        {footerStatus && (
                            <ul>
                                <li>
                                    <span>{Number(first24HoursPercent || 0).toFixed(1)}</span>
                                    <small>%</small>
                                </li>
                                <li>{first24HoursText}</li>
                            </ul>
                        )}
                    </div>
                ),
        });
    }

    // Hide tab bar if there's only one tab and it's a single value
    const shouldHideTabs = tabData.length === 1 && hasSingleValue && hideFirst24HoursTab;

    return (
        <>
            <RSChartTabbar
                dynamicTab={`mb0 mini`}
                defaultClass={`tabTransparent pt0`}
                activeClass={`active`}
                chartHeading={heading}
                smallText={splitItemText}
                containerClass={`csr-chart-portlet expanded-view ${isChartExpanded ? 'chart-expanded' : ''}`}
                className="rs-tabs row"
                componentClassName={'mt30'}
                expandView={expandViewStatus}
                expandIcon={expandChartAction}
                isChartExpanded={isChartExpanded}
                footer={footerStatus}
                tabData={tabData}
                hideTabs={shouldHideTabs}
            />
        </>
    );
};

export default memo(TabbarAreasPlineChart);
