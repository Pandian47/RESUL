import { KeyMetricsNew, OverviewGrid, OverviewList } from '../../../Components';
import { COMMUNICATION_PERFORMANCE } from '../../../constants';
import { areasplineChartOptions, columnChartOptions, mapChartOptions, pieChartOptions, pieFlatOptions } from 'Constants/Charts';
import { user_mini } from 'Constants/GlobalConstant/Glyphicons';
import { createContext, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';

import { BootstrapDropdown } from 'Components/RSBootstrapDropDown';

import RSHighchartsContainer from 'Components/Highcharts';
import RSChartTabbar from 'Components/RSChartTabber';
import ClickMapModal from '../../../Components/ClickMapModal';
import LinksCsvModal from '../../../Components/LinksCsvModal';

import SocialAnalyticsData from '../data';

// require('highcharts/highcharts-more.js')(Highcharts);

export const GlobalStateReportEmail = createContext();

const SocialAnalyticsFbApp = ({ type, splitItem, typeOf }) => {

    const [isChartExpanded, setIsChartExpanded] = useState(false);
    const [states, setState] = useState({
        isLinkClickCSVModal: false,
        isCampaignCSVModal: false,
        isClickMapModal: false,
        com_status: '',
    });
    const { isCampaignCSVModal, isLinkClickCSVModal, isClickMapModal, com_status } = states;

    return (
        // Contend holder starts
        <GlobalStateReportEmail.Provider value={''}>
            {/* Main page heading block starts */}
            {/* Main page heading block ends */}

            {/* Main page content block starts */}
            <Container className="page-content px0">
                <div className="rs-csr-wrapper">
                    <OverviewGrid
                        channelType={type}
                        previewImage={''}
                        infoIcon={false}
                    />
                    <OverviewList dataObj={SocialAnalyticsData[typeOf][splitItem]?.overview_data} />

                    <Row>
                        <div className="portlet-heading">
                            <h3>{COMMUNICATION_PERFORMANCE}</h3>
                        </div>

                        <Col md={8} className="position-relative">
                            <RSChartTabbar
                                dynamicTab={`mb0 mini`}
                                defaultClass={`tabTransparent pt0`}
                                activeClass={`active`}
                                chartHeading="Engagement"
                                // footer
                                tabData={[
                                    {
                                        id: 'unique_visitors',
                                        text: 'Unique visitors',
                                        textClass: 'font-sm',
                                        component: () => (
                                            <RSHighchartsContainer
                                                pClassName={'x-axis-labels-performance'}
                                                key="overallll"
                                                options={areasplineChartOptions(
                                                    SocialAnalyticsData[typeOf][splitItem].chartData
                                                        .reach_areaspline_overall_chartData?.unique_visitors,
                                                )}
                                            />
                                        ),
                                    },
                                    {
                                        id: 'impressions',
                                        text: 'Impressions',
                                        textClass: 'font-sm',
                                        component: () => (
                                            <RSHighchartsContainer
                                                pClassName={'x-axis-labels-performance'}
                                                key="overall"
                                                options={areasplineChartOptions(
                                                    SocialAnalyticsData[typeOf][splitItem].chartData
                                                        .reach_areaspline_overall_chartData?.impressions,
                                                )}
                                            />
                                        ),
                                    },
                                ]}
                                className="rs-tabs row"
                                componentClassName={'mt30'}
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
                                chartHeading="Engagement"
                                footer
                                tabData={[
                                    {
                                        id: 'overall',
                                        text: 'Overall',
                                        textClass: 'font-sm',
                                        component: () => (
                                            <RSHighchartsContainer
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
                                                    <span>{SocialAnalyticsData.smEngagementOverAllPercent}</span>
                                                    <small>%</small>
                                                </li>
                                                <li>{SocialAnalyticsData.smEngagementoverAll}</li>
                                            </ul>
                                        ),
                                    },
                                    {
                                        id: 'insights ',
                                        text: 'Insights ',
                                        textClass: 'font-sm',
                                        component: () => (
                                            <RSHighchartsContainer
                                                key={'Impact_on_page_likes'}
                                                options={columnChartOptions(
                                                    SocialAnalyticsData[typeOf][splitItem]?.chartData
                                                        ?.engagement_column_insights_chartData,
                                                )}
                                            />
                                        ),
                                        footer: (
                                            <ul>
                                                <li>
                                                    <span>{SocialAnalyticsData.smEngagementOverAllPercent}</span>
                                                    <small>%</small>
                                                </li>
                                                <li>{SocialAnalyticsData.smEngagementoverAll}</li>
                                            </ul>
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
                                    <h4>Conversion</h4>
                                </div>
                                <div className="portlet-body">
                                    <RSHighchartsContainer
                                        options={columnChartOptions(
                                            SocialAnalyticsData[typeOf][splitItem]?.chartData
                                                ?.reach_areaspline_impressions_chartData,
                                        )}
                                    />
                                </div>

                                <div className="portlet-footer portlet-two-label">
                                    <ul>
                                        <li>
                                            <span>{SocialAnalyticsData.smEngagementImpactPercent}</span>
                                            <small>%</small>
                                        </li>
                                        <li>{SocialAnalyticsData.smConversionFBApp}</li>
                                    </ul>
                                </div>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <div className="portlet-heading">
                            <h3 className="mt0">User engagement</h3>
                        </div>
                        <Col md={6}>
                            <div className="portlet-container portlet-md pfooter">
                                <div className="portlet-header">
                                    <h4>By location</h4>
                                </div>
                                <div className="portlet-body">
                                    <RSHighchartsContainer
                                        constructorType="mapChart"
                                        options={mapChartOptions(
                                            SocialAnalyticsData[typeOf][splitItem]?.chartData?.byLocation_map_chartData,
                                        )}
                                    />
                                </div>
                                <div className="portlet-footer portlet-two-label">
                                    <ul>
                                        <li>
                                            <span>{SocialAnalyticsData.smLocationPercent}</span>
                                            <small>%</small>
                                        </li>
                                        <li>{SocialAnalyticsData.smLocation}</li>
                                    </ul>
                                </div>
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="portlet-container portlet-md pfooter">
                                <div className="portlet-header">
                                    <h4>By age</h4>
                                </div>
                                <div className="portlet-body">
                                    <div className="progressbar-list">
                                        {SocialAnalyticsData[typeOf][splitItem]?.chartData?.byAgeData?.map((item) => {
                                            return (
                                                <div className="progressbar">
                                                    <div className="progressbar-legend">
                                                        <div className="progressbar-dum" style={{ width: item.width }}>
                                                            <div className={`progressbar-percent ${item.maleColor}`}>
                                                                <i className={user_mini}></i>
                                                                <label>
                                                                    {item.male}
                                                                    <small>%</small>
                                                                </label>
                                                            </div>
                                                            <div className={`progressbar-percent ${item.femaleColor}`}>
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
                                <div className="portlet-footer portlet-two-label">
                                    <ul>
                                        <li>{SocialAnalyticsData.smByAge}</li>
                                    </ul>
                                </div>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                            <div className="d-flex justify-content-between">
                                <label>App performance</label>
                                <BootstrapDropdown
                                    data={SocialAnalyticsData.smAppPerfomanceOptions}
                                    defaultItem={'Login status'}
                                />
                            </div>
                            <div className="portlet-container portlet-md portlet-body">
                                <RSHighchartsContainer
                                    key={'overall'}
                                    options={areasplineChartOptions(
                                        SocialAnalyticsData[typeOf][splitItem]?.chartData?.appPerfomance,
                                    )}
                                />
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <div className="portlet-container portlet-md pfooter">
                                <div className="portlet-header">
                                    <h4>App internal referrers source</h4>
                                </div>
                                <div className="portlet-body">
                                    <RSHighchartsContainer
                                        options={pieFlatOptions(
                                            SocialAnalyticsData[typeOf][splitItem]?.chartData
                                                ?.app_internal_referrers_source_ChartData,
                                        )}
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
                                        options={pieChartOptions(
                                            SocialAnalyticsData[typeOf][splitItem]?.chartData
                                                ?.overall_sentiment_ChartData,
                                        )}
                                    />
                                    <p className="float-end color-primary-blue fs12">More</p>
                                </div>
                            </div>
                        </Col>
                    </Row>
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

export default SocialAnalyticsFbApp;
