import { KeyMetricsNew, OverviewGrid, OverviewList } from '../../../Components';
import { COMMUNICATION_PERFORMANCE } from '../../../constants';
import { areasplineChartOptions, bubbleChartOptions, columnChartOptions, gaugeChartOptions, mapChartOptions, pieChartOptions, pieFlatOptions, variablePieChartOptions } from 'Constants/Charts';
import { ch_color1, ch_color2, ch_color3 } from 'Constants/GlobalConstant/Colors/colorsVariable';
import { user_mini, zip_medium } from 'Constants/GlobalConstant/Glyphicons';
import { createContext, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';

import RSHighchartsContainer from 'Components/Highcharts';
import RSChartTabbar from 'Components/RSChartTabber';
import ClickMapModal from '../../../Components/ClickMapModal';
import LinksCsvModal from '../../../Components/LinksCsvModal';

import SocialAnalyticsData from '../data';

export const GlobalStateReportEmail = createContext();

const SocialAnalyticsPage = ({ type = 'post', splitItem = 'Split A', typeOf, infoIcon }) => {
    const [chartTabIndex, setChartTabIndex] = useState({
        reach: 0,
        engagement: 0,
        emailopens: 0,
    });
    const [isChartExpanded, setIsChartExpanded] = useState(false);
    const [isInfoIcon, setIsInfoIcon] = useState(infoIcon);
    const [linkClickGroups, setLinkClickGroups] = useState('Offers');
    const [states, setState] = useState({
        isLinkClickCSVModal: false,
        isCampaignCSVModal: false,
        isClickMapModal: false,
        com_status: '',
    });
    const { isCampaignCSVModal, isLinkClickCSVModal, isClickMapModal, com_status } = states;

    // console.log(  socialMediaConstant.OVERALL_DATAS_PAGE['Split A'][0].chartData.reach_areaspline_overall_chartData,"--  socialMediaConstant.OVERALL_DATAS_PAGE['Split A'][0].chartData.reach_areaspline_overall_chartData")

    return (
        // Contend holder starts
        <GlobalStateReportEmail.Provider value={''}>
            {/* Main page heading block starts */}
            {/* Main page heading block ends */}

            {/* Main page content block starts */}
            <Container className="page-content px0">
                <div className="rs-csr-wrapper">
                    <OverviewGrid channelType={type} previewImage={''} infoIcon={false} />
                    <OverviewList dataObj={SocialAnalyticsData[typeOf][splitItem]?.overview_data} />

                    <Row>
                        <div className="portlet-heading">
                            <h3>{COMMUNICATION_PERFORMANCE}</h3>
                        </div>

                        <Col md={8} className="position-relative">
                            <RSChartTabbar
                                chartHeading="Page likes"
                                containerClass={`csr-chart-portlet expanded-view ${
                                    isChartExpanded ? 'chart-expanded' : ''
                                }`}
                                tabData={[
                                    {
                                        text: '',
                                        textClass: '',
                                        component: () => (
                                            <RSHighchartsContainer
                                                type="columnChart"
                                                pClassName={'x-axis-labels-performance'}
                                                options={columnChartOptions(
                                                    SocialAnalyticsData[typeOf][splitItem].chartData
                                                        .reach_areaspline_overall_chartData,
                                                )}
                                            />
                                        ),
                                    },
                                ]}
                                expandView
                                expandIcon={() => setIsChartExpanded(!isChartExpanded)}
                                isChartExpanded={isChartExpanded}
                            />
                        </Col>
                        <Col md={4}>
                            <KeyMetricsNew data={SocialAnalyticsData[typeOf][splitItem]?.keyMetrics} />
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6} className="x-axis-labels-performance">
                            <RSChartTabbar
                                dynamicTab={`mb0 mini`}
                                defaultClass={`tabTransparent pt0`}
                                activeClass={`active`}
                                chartHeading="Reach"
                                footer
                                tabData={[
                                    {
                                        id: 'overall',
                                        text: 'Overall',
                                        textClass: 'font-sm',
                                        component: () => (
                                            <RSHighchartsContainer
                                                type="area"
                                                key={'overall'}
                                                options={areasplineChartOptions(
                                                    SocialAnalyticsData[typeOf][splitItem]?.chartData
                                                        ?.reach_areaspline_overall_chartData,
                                                )}
                                            />
                                        ),
                                        footer: (
                                            <ul>
                                                <li>
                                                    <span>52</span>
                                                    <small>%</small>
                                                </li>
                                                <li>in total reach(Vision Bank) when compared to previous week</li>
                                            </ul>
                                        ),
                                    },
                                    {
                                        id: 'impressions',
                                        text: 'Impressions',
                                        textClass: 'font-sm',
                                        component: () => (
                                            <RSHighchartsContainer
                                                type="area"
                                                key={'impressions'}
                                                options={areasplineChartOptions(
                                                    SocialAnalyticsData[typeOf][splitItem]?.chartData
                                                        ?.reach_areaspline_impressions_chartData,
                                                )}
                                            />
                                        ),
                                        footer: (
                                            <ul>
                                                <li>
                                                    <span>42</span>
                                                    <small>%</small>
                                                </li>
                                                <li>in total reach(Vision Bank) when compared to previous week</li>
                                            </ul>
                                        ),
                                    },
                                ]}
                                className="rs-tabs row"
                                componentClassName={'mt30'}
                            />
                        </Col>
                        <Col md={6} className="x-axis-labels-performance">
                            <RSChartTabbar
                                dynamicTab={`mb0 mini`}
                                defaultClass={`tabTransparent pt0`}
                                activeClass={`active`}
                                chartHeading="Engagement"
                                footer
                                tabData={[
                                    {
                                        id: 'overall',
                                        text: 'Overall',
                                        textClass: 'font-sm',
                                        component: () => (
                                            <RSHighchartsContainer
                                                type="area"
                                                key={'overall'}
                                                options={areasplineChartOptions(
                                                    SocialAnalyticsData[typeOf][splitItem]?.chartData
                                                        ?.engagement_areaspline_overall_chartData,
                                                )}
                                            />
                                        ),
                                        footer: (
                                            <ul>
                                                <li>
                                                    <span>52</span>
                                                    <small>%</small>
                                                </li>
                                                <li>
                                                    in total page engagement(Vision Bank) when compared to previous week
                                                </li>
                                            </ul>
                                        ),
                                    },
                                    {
                                        id: 'insights',
                                        text: 'Insights',
                                        textClass: 'font-sm',
                                        component: () => (
                                            <RSHighchartsContainer
                                                type="columnChart"
                                                key={'impressions'}
                                                options={columnChartOptions(
                                                    SocialAnalyticsData[typeOf][splitItem]?.chartData
                                                        ?.engagement_column_insights_chartData,
                                                )}
                                            />
                                        ),
                                        footer: (
                                            <ul>
                                                <li>
                                                    <span>52</span>
                                                    <small>%</small>
                                                </li>
                                                <li>
                                                    in total page engagement(Vision Bank) when compared to previous week
                                                </li>
                                            </ul>
                                        ),
                                    },
                                ]}
                                className="rs-tabs row"
                                componentClassName={'mt30'}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <div className="portlet-heading">
                            <h3 className="mt0">User engagement</h3>
                        </div>
                        <Col md={6}>
                            <RSChartTabbar
                                dynamicTab={`mb0 mini`}
                                defaultClass={`tabTransparent pt0`}
                                activeClass={`active`}
                                chartHeading=""
                                footer={true}
                                tabData={[
                                    {
                                        id: 'by_days',
                                        text: 'By days',
                                        textClass: 'font-sm',
                                        component: () => (
                                            <RSHighchartsContainer
                                                type="bubble"
                                                key={'by_days'}
                                                options={bubbleChartOptions(
                                                    SocialAnalyticsData[typeOf][splitItem]?.chartData?.bubble_chartData,
                                                )}
                                            />
                                        ),
                                        footer: (
                                            <ul>
                                                <li>
                                                    Saturday & Sunday has the highest engagement rate when compared to
                                                    other days
                                                </li>
                                            </ul>
                                        ),
                                    },
                                    {
                                        id: 'by_hours',
                                        text: 'By hours',
                                        textClass: 'font-sm',
                                        component: () => (
                                            <RSHighchartsContainer
                                                type="gauge"
                                                key={'by_hours'}
                                                options={gaugeChartOptions(
                                                    SocialAnalyticsData[typeOf][splitItem]?.chartData?.gauge_chartData,
                                                )}
                                            />
                                        ),
                                        footer: (
                                            <ul>
                                                <li>
                                                    <span>42</span>
                                                    <small>%</small>
                                                </li>
                                                <li>of users from North America have highest engagement rate</li>
                                            </ul>
                                        ),
                                    },
                                ]}
                                className="rs-tabs row"
                                componentClassName={'mt30'}
                            />
                        </Col>
                        <Col md={6}>
                            <RSChartTabbar
                                dynamicTab={`mb0 mini`}
                                defaultClass={`tabTransparent pt0`}
                                activeClass={`active`}
                                chartHeading=""
                                // percentage={channelData?.reach?.uniqueOpens}
                                footer={true}
                                tabData={[
                                    {
                                        id: 'by_location',
                                        text: 'By location',
                                        textClass: 'font-sm',
                                        component: () => (
                                            <RSHighchartsContainer
                                                type="map"
                                                constructorType="mapChart"
                                                options={mapChartOptions(
                                                    SocialAnalyticsData[typeOf][splitItem]?.chartData
                                                        ?.byLocation_map_chartData,
                                                )}
                                            />
                                        ),
                                        footer: (
                                            <ul>
                                                <li>
                                                    <div className="font-bold">North America</div>
                                                    &nbsp;have the highest engagement rate
                                                </li>
                                            </ul>
                                        ),
                                    },
                                    {
                                        id: 'by_age',
                                        text: 'By age',
                                        textClass: 'font-sm',
                                        component: () => (
                                            <div className="portlet-body">
                                                <div className="progressbar-list">
                                                    {byAgeData?.map((item) => {
                                                        return (
                                                            <div className="progressbar">
                                                                <div className="progressbar-legend">
                                                                    <div
                                                                        className="progressbar-dum"
                                                                        style={{ width: item.width }}
                                                                    >
                                                                        <div
                                                                            className={`progressbar-percent ${item.maleColor}`}
                                                                        >
                                                                            <i className={user_mini}></i>
                                                                            <label>
                                                                                {item.male}
                                                                                <small>%</small>
                                                                            </label>
                                                                        </div>
                                                                        <div
                                                                            className={`progressbar-percent ${item.femaleColor}`}
                                                                        >
                                                                            <label>
                                                                                {item.female}
                                                                                <small>%</small>
                                                                            </label>
                                                                            <i className={user_mini}></i>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="progressbar-label">
                                                                    <span>{item.age}</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ),
                                        footer: (
                                            <ul>
                                                <li>
                                                    User belonging to age group 18-24 has the highest engagement rate
                                                    which contributes 42% in overall engagement
                                                </li>
                                            </ul>
                                        ),
                                    },
                                ]}
                                className="rs-tabs row"
                                componentClassName={'mt30'}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6} className="x-axis-labels-performance">
                            <RSChartTabbar
                                dynamicTab={`mb0 mini`}
                                defaultClass={`tabTransparent pt0`}
                                activeClass={`active`}
                                chartHeading=""
                                tabData={[
                                    {
                                        id: 'trending_topics',
                                        text: 'Trending topics',
                                        textClass: 'font-sm',
                                        component: () => (
                                            <RSHighchartsContainer
                                                type="pie"
                                                key={'trending_topics'}
                                                options={variablePieChartOptions(
                                                    SocialAnalyticsData[typeOf][splitItem]?.chartData
                                                        ?.TrendingTopics_variablePie_chartData,
                                                )}
                                            />
                                        ),
                                    },
                                    {
                                        id: 'interest',
                                        text: 'Interest',
                                        textClass: 'font-sm',
                                        component: () => (
                                            <RSHighchartsContainer
                                                type="pie"
                                                key={'interest'}
                                                options={pieChartOptions(
                                                    SocialAnalyticsData[typeOf][splitItem]?.chartData
                                                        ?.interest_pie_chartData,
                                                )}
                                            />
                                        ),
                                    },
                                ]}
                                className="rs-tabs row"
                                componentClassName={'mt30'}
                            />
                        </Col>
                        <Col md={6}>
                            <div className="portlet-container portlet-md pfooter">
                                <div className="portlet-header">
                                    <h4>Page and tab visits</h4>
                                </div>
                                <div className="portlet-body">
                                    <RSHighchartsContainer
                                        type="columnChart"
                                        options={columnChartOptions(
                                            SocialAnalyticsData[typeOf][splitItem]?.chartData
                                                ?.visits_multi_stacked_chartData,
                                        )}
                                    />
                                </div>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <div className="portlet-container portlet-md pfooter">
                                <div className="portlet-header">
                                    <h4>Page external referrers</h4>
                                </div>
                                <div className="portlet-body">
                                    {/* <RSHighchartsContainer
                                            options={pieChartOptions(
                                                chartData.SMS_DATA.communicationStatus_pie_chartData,
                                            )}
                                        /> */}
                                    <RSHighchartsContainer
                                        type="pie"
                                        options={pieFlatOptions([
                                            { name: 'Hospitality', color: ch_color1, y: 10, legendIndex: 0 },
                                            {
                                                name: 'Education',
                                                color: ch_color2,
                                                y: 20,
                                                sliced: true,
                                                selected: true,
                                                legendIndex: 1,
                                            },
                                            {
                                                name: 'Banking',
                                                color: ch_color3,
                                                y: 70,
                                                sliced: true,
                                                selected: true,
                                                legendIndex: 2,
                                            },
                                        ])}
                                    />
                                </div>
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="portlet-container portlet-md pfooter">
                                <div className="portlet-header">
                                    <h4>Overall sentiment</h4>
                                </div>
                                <div className="portlet-body">
                                    <RSHighchartsContainer
                                        type="pie"
                                        options={pieChartOptions(
                                            SocialAnalyticsData[typeOf][splitItem]?.chartData
                                                ?.overall_sentiment_pie_chartData,
                                        )}
                                    />
                                </div>
                            </div>
                        </Col>
                    </Row>
                    {SocialAnalyticsData[typeOf][splitItem]?.gridData?.totalLinkClicks && (
                        <Row>
                            <Col md={12}>
                                <RSChartTabbar
                                    containerClass={'pb0'}
                                    dynamicTab={`mb0 mini`}
                                    defaultClass={`tabTransparent pt0`}
                                    activeClass={`active`}
                                    chartHeading=""
                                    autoHeight
                                    // headerIcon={(<i
                                    //     className={`${zip_medium} icon-md ml10 color-primary-blue`}
                                    //     onClick={() =>
                                    //         setState((prev) => ({
                                    //             ...prev,
                                    //             isCampaignCSVModal: true,
                                    //         }))
                                    //     }
                                    // ></i>)}
                                    tabData={[
                                        {
                                            id: 'top_key_inflencers',
                                            text: 'Top key inflencers',
                                            textClass: 'font-sm',
                                            component: () => (
                                                <Row>
                                                    {SocialAnalyticsData[typeOf][splitItem]?.topKeyInflencers?.map(
                                                        (item, index) => {
                                                            return (
                                                                <div className="col-sm-4 col-xs-12">
                                                                    <div className="portlet-container inflencers shadow-none">
                                                                        <div className="d-flex align-items-center p10">
                                                                            <div className="user-img">
                                                                                <img src={item?.profile}></img>
                                                                            </div>
                                                                            <div className="user-name">
                                                                                <h5>{item?.username}</h5>
                                                                            </div>
                                                                        </div>
                                                                        <ul className="d-flex justify-content-around text-center p10">
                                                                            {item?.sentiment?.map((items, i) => {
                                                                                return (
                                                                                    <li>
                                                                                        <h3>{items?.count}</h3>
                                                                                        <small>{items?.text}</small>
                                                                                    </li>
                                                                                );
                                                                            })}
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            );
                                                        },
                                                    )}
                                                </Row>
                                            ),
                                        },
                                        {
                                            id: 'competitor_brand',
                                            text: 'Competitor brand',
                                            textClass: 'font-sm',
                                            component: () => (
                                                <Row>
                                                    {SocialAnalyticsData[typeOf][splitItem]?.competitorBrand?.map(
                                                        (item, index) => {
                                                            return (
                                                                <div className="col-sm-4 col-xs-12">
                                                                    <div className="portlet-container inflencers shadow-none">
                                                                        <div className="d-flex align-items-center p10">
                                                                            <div className="user-img">
                                                                                <img src={item?.profile}></img>
                                                                            </div>
                                                                            <div className="user-name">
                                                                                <h5>{item?.username}</h5>
                                                                            </div>
                                                                        </div>
                                                                        <ul className="d-flex justify-content-around text-center p10">
                                                                            {item?.sentiment?.map((items, i) => {
                                                                                return (
                                                                                    <li>
                                                                                        <h3>{items?.count}</h3>
                                                                                        <small>{items?.text}</small>
                                                                                    </li>
                                                                                );
                                                                            })}
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            );
                                                        },
                                                    )}
                                                </Row>
                                            ),
                                        },
                                    ]}
                                    className="rs-tabs row"
                                    componentClassName={'mt30'}
                                />
                            </Col>
                        </Row>
                    )}
                  
                    {/* Modals */}
                    <LinksCsvModal
                        show={isCampaignCSVModal || isLinkClickCSVModal}
                        handleClose={() => {
                            if (isCampaignCSVModal) {
                                setState((prev) => ({
                                    ...prev,
                                    isCampaignCSVModal: false,
                                }));
                            } else {
                                setState((prev) => ({
                                    ...prev,
                                    isLinkClickCSVModal: false,
                                }));
                            }
                        }}
                        confirm={() => {
                            if (isCampaignCSVModal) {
                                setState((prev) => ({
                                    ...prev,
                                    isCampaignCSVModal: false,
                                }));
                            } else {
                                setState((prev) => ({
                                    ...prev,
                                    isLinkClickCSVModal: false,
                                }));
                            }
                        }}
                    />
                    <ClickMapModal
                        show={isClickMapModal}
                        handleClose={() =>
                            setState((prev) => ({
                                ...prev,
                                isClickMapModal: false,
                            }))
                        }
                    />
                </div>
            </Container>
            {/* Main page content block ends */}
        </GlobalStateReportEmail.Provider>
        // Content holder ends
    );
};

export default SocialAnalyticsPage;

const byAgeData = [
    {
        male: 40,
        female: 30,
        age: '18 - 24',
        maleColor: 'bg-primary-green',
        femaleColor: 'bg-secondary-green',
        width: '100%',
    },
    {
        male: 13,
        female: 10,
        age: '25 - 34',
        maleColor: 'bg-primary-blue',
        femaleColor: 'bg-secondary-blue',
        width: '80%',
    },
    {
        male: 4,
        female: 9,
        age: '35 - 44',
        maleColor: 'bg-red-dark',
        femaleColor: 'bg-red-medium',
        width: '60%',
    },
    {
        male: 8,
        female: 5,
        age: '45+',
        maleColor: 'bg-primary-orange',
        femaleColor: 'bg-secondary-orange',
        width: '40%',
    },
];
