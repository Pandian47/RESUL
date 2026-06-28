import { bubbleChartOptions, gaugeChartOptions } from 'Constants/Charts';
import { memo } from 'react';
import RSChartTabbar from 'Components/RSChartTabber';
import RSHighchartsContainer from 'Components/Highcharts';
import { BubbleChartSkeleton, PieChartSkeleton } from 'Components/Skeleton/Skeleton';
const DaysAndHoursChart = (props) => {
    const {
        heading,
        isChartExpanded,
        footerStatus,
        splitItem,
        dayPercent,
        dayText,
        hoursPercent,
        hoursText,
        expandViewStatus,
        expandChartAction,
        splitItemText,
        dayData,
        hoursData,
    } = props;


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
                tabData={[
                    {
                        id: 'days',
                        text: 'By days',
                        textClass: 'font-sm',
                        component: () =>
                            splitItem !== 'controlGroup' && (Object.keys(dayData)?.length || dayData?.length) ? (
                                <>
                                    <RSHighchartsContainer
                                        type="bubble"
                                        pClassName="x-axis-labels-performance mt25"
                                        key="overall"
                                        className="mt-40"
                                        options={bubbleChartOptions({ isCustomSeries: true, ...dayData })}
                                    />
                                    {dayData?.series?.length > 0 && (
                                        <div className="portlet-footer portlet-two-label">
                                            <ul>
                                                {dayPercent && (
                                                    <li>
                                                        <span>{dayPercent}</span>
                                                        <small>%</small>
                                                    </li>
                                                )}
                                                <li>{dayText}</li>
                                            </ul>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <BubbleChartSkeleton isError />
                            ),
                        // footer: (
                        //     <div className="portlet-footer portlet-two-label">
                        //         {footerStatus && (
                        //             <ul>
                        //                 <li>
                        //                     <span>{dayPercent}</span>
                        //                     <small>%</small>
                        //                 </li>
                        //                 <li>{dayText}</li>

                        //             </ul>
                        //         )}
                        //     </div>
                        // ),
                    },
                    {
                        id: 'hours',
                        text: 'By hours',
                        textClass: 'font-sm',
                        component: () =>
                            Object.keys(hoursData)?.length || hoursData?.length ? (
                                <>
                                    <RSHighchartsContainer
                                        type="gauge"
                                        pClassName="x-axis-labels-performance mt25"
                                        key={'first_24_hr'}
                                        options={gaugeChartOptions(hoursData)}
                                    />
                                    {hoursData?.series?.length > 0 && (
                                        <div className="portlet-footer portlet-two-label">
                                            <ul>
                                                <li>
                                                    <span>{hoursPercent || 0}</span>
                                                    <small>%</small>
                                                </li>
                                                <li>{hoursText}</li>
                                            </ul>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <PieChartSkeleton isError noLegend customTop/>
                            ),
                        // footer: (
                        //     <div className="portlet-footer portlet-two-label">
                        //         {footerStatus && (
                        //             <ul>
                        //                 <li>
                        //                     <span>{hoursPercent || 0}</span>
                        //                     <small>%</small>
                        //                 </li>
                        //                 <li>{hoursText}</li>
                        //             </ul>
                        //         )}
                        //     </div>
                        // ),
                    },
                ]}
            />
        </>
    );
};

export default memo(DaysAndHoursChart);
