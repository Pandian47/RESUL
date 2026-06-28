import { pieChartOptions } from 'Constants/Charts';
import { memo } from 'react';
import RSChartTabbar from 'Components/RSChartTabber';
import RSHighchartsContainer from 'Components/Highcharts';

const TabbarPieChart = (props) => {
    const { heading, footerStatus, overAllPercent, firstTabFooterPercent, firstTabData, secondTabData,
        secondTabFooterPercent, firstTabFooterText, secondTabFooterText, firstTabTitle, secondTabTitle } = props;
    return (
        <>
            <RSChartTabbar
                dynamicTab={`mb0 mini`}
                defaultClass={`tabTransparent pt0`}
                activeClass={`active`}
                chartHeading={heading}
                percentage={overAllPercent}
                footer={footerStatus}
                tabData={[
                    {
                        id: firstTabTitle,
                        text: firstTabTitle,
                        textClass: 'font-sm',
                        component: () => (
                            <RSHighchartsContainer
                                key={firstTabTitle}
                                options={pieChartOptions(firstTabData)}
                            />
                        ),
                        footer: (
                            <div className="portlet-footer portlet-two-label">
                                {
                                    footerStatus &&
                                    <ul>
                                        <li>
                                            <span>{firstTabFooterPercent || 0}</span>
                                            <small>%</small>
                                        </li>
                                        <li>{firstTabFooterText}</li>
                                    </ul>
                                }
                            </div>
                        ),
                    },
                    {
                        id: secondTabTitle,
                        text: secondTabTitle,
                        textClass: 'font-sm',
                        component: () => (
                            <RSHighchartsContainer
                                key={secondTabTitle}
                                options={pieChartOptions(secondTabData)}
                            />
                        ),
                        footer: (
                            <div className="portlet-footer portlet-two-label">
                                {
                                    footerStatus &&
                                    <ul>
                                        <li>
                                            <span>{secondTabFooterPercent || 0}</span>
                                            <small>%</small>
                                        </li>
                                        <li>{secondTabFooterText}</li>
                                    </ul>
                                }
                            </div>
                        ),
                    },
                ]}
                className="rs-tabs row"
                componentClassName={'mt30'}
            />
        </>
    );
};

export default memo(TabbarPieChart);