import { KeyMetricsNew, OverviewGrid, OverviewList } from '../../../Components';
import { COMMUNICATION_PERFORMANCE, POST_SUMMARY_OTHERS_GRID_COLUMN_DATA, POST_SUMMARY_OTHERS_GRID_DATA, POST_SUMMARY_RESULTICKS_GRID_COLUMN_DATA, POST_SUMMARY_RESULTICKS_GRID_DATA } from '../../../constants';
import { areasplineChartOptions, columnChartOptions, mapChartOptions } from 'Constants/Charts';
import { user_mini, zip_medium } from 'Constants/GlobalConstant/Glyphicons';
import { createContext, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';

import RSHighchartsContainer from 'Components/Highcharts';
import KendoGrid from 'Components/RSKendoGrid';
import RSChartTabbar from 'Components/RSChartTabber';
import ClickMapModal from '../../../Components/ClickMapModal';
import LinksCsvModal from '../../../Components/LinksCsvModal';

import SocialAnalytics from '../data';

// require('highcharts/highcharts-more.js')(Highcharts);

export const GlobalStateReportEmail = createContext();
const progressbarData = [
    { name: 'Organic', value: 25, cls: 'pending' },
    { name: 'Boost post', value: 10, cls: 'rejected' },
];

const SocialAnalytics3 = ({ type = 'post', splitValue = 'Split A', key, infoIcon }) => {
    const splitItem = splitValue;
    const [chartTabIndex, setChartTabIndex] = useState({
        reach: 0,
        engagement: 0,
        emailopens: 0,
    });
    const [isChartExpanded, setIsChartExpanded] = useState(false);
    const [isInfoIcon, setIsInfoIcon] = useState(infoIcon);
    const [linkClickGroups, setLinkClickGroups] = useState('Offers');
    const [campaignStatusDropdown, setCampaignStatusDropdown] = useState('Opens and clicks');
    const [states, setState] = useState({
        isLinkClickCSVModal: false,
        isCampaignCSVModal: false,
        isClickMapModal: false,
        com_status: '',
    });
    const { isCampaignCSVModal, isLinkClickCSVModal, isClickMapModal, com_status } = states;

    // console.log(  socialMediaConstant.OVERALL_DATAS['Split A'][0].chartData.reach_areaspline_overall_chartData,"--  socialMediaConstant.OVERALL_DATAS['Split A'][0].chartData.reach_areaspline_overall_chartData")

    return (
        // Contend holder starts
        <GlobalStateReportEmail.Provider value={''}>
            {/* Main page heading block starts */}
            {/* Main page heading block ends */}

            {/* Main page content block starts */}
            <Container className="page-content px0">
                <div className="rs-csr-wrapper">
                    <OverviewGrid channelType={type} previewImage={''} infoIcon={false} />
                    <OverviewList dataObj={SocialAnalytics[key][splitItem]?.overview_data} />

                    <Row>
                        <div className="portlet-heading">
                            <h3>{COMMUNICATION_PERFORMANCE}</h3>
                        </div>

                        <Col md={8} className="position-relative">
                            <RSChartTabbar
                                chartHeading="Reach"
                                containerClass={`csr-chart-portlet expanded-view ${
                                    isChartExpanded ? 'chart-expanded' : ''
                                }`}
                                tabData={[
                                    {
                                        id: 'overall',
                                        text: '',
                                        textClass: '',
                                        component: () => (
                                            <RSHighchartsContainer
                                                pClassName={'x-axis-labels-performance'}
                                                key="overall"
                                                options={areasplineChartOptions(
                                                    SocialAnalytics[key][splitItem].chartData
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
                            <KeyMetricsNew data={SocialAnalytics[key][splitItem]?.keyMetrics} />
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
                                                    SocialAnalytics[key][splitItem]?.chartData
                                                        ?.engagement_areaspline_overall_chartData,
                                                )}
                                            />
                                        ),
                                        footer: (
                                            <ul>
                                                <li>
                                                    <span>72</span>
                                                    <small>%</small>
                                                </li>
                                                <li>
                                                    total reach occurred with 52
                                                    <small>%&nbsp;</small> engagement happened during this period
                                                </li>
                                            </ul>
                                        ),
                                    },
                                    {
                                        id: 'Impact_on_page_likes ',
                                        text: 'Impact on page likes ',
                                        textClass: 'font-sm',
                                        component: () => (
                                            <RSHighchartsContainer
                                                key={'Impact_on_page_likes'}
                                                options={columnChartOptions(
                                                    SocialAnalytics[key][splitItem]?.chartData
                                                        ?.engagement_column_Impact_likes_chartData,
                                                )}
                                            />
                                        ),
                                        footer: (
                                            <ul>
                                                <li>
                                                    <span>32</span>
                                                    <small>%</small>
                                                </li>
                                                <li>
                                                    total reach occurred with 52<small>%&nbsp;</small> engagement
                                                    happened during this period
                                                </li>
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
                                            SocialAnalytics[key][splitItem]?.chartData
                                                ?.conversion_columnsingle_chartData,
                                        )}
                                    />
                                </div>

                                <div className="portlet-footer portlet-two-label">
                                    <ul>
                                        <li>
                                            <span>28</span>
                                            <small>%</small>
                                        </li>
                                        <li>of conversion happened occurs with 2,812 users purchased</li>
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
                                            SocialAnalytics[key][splitItem]?.chartData?.byLocation_map_chartData,
                                        )}
                                    />
                                </div>
                                <div className="portlet-footer portlet-two-label">
                                    <ul>
                                        <li>
                                            <span>52</span>
                                            <small>%</small>
                                        </li>
                                        <li>of users from North America have highest engagement rate</li>
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
                                    {/* <RSHighchartsContainer
                                            options={columnChartOptions(
                                                SocialAnalytics[key][splitItem]?.chartData
                                                    ?.conversion_columnsingle_chartData,
                                            )}
                                        /> */}

                                    <div className="progressbar-list">
                                        {/* 1 */}

                                        {byAgeData?.map((item, index) => {
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
                                        <li>
                                            User belonging to age group 18-24 has the highest engagement rate which
                                            contributes 42% in overall engagement
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <div className="portlet-container portlet-md pfooter">
                                <div className="portlet-header">
                                    <h4>Content engagement by post type</h4>
                                </div>
                                <div className="portlet-body">
                                    <RSHighchartsContainer
                                        options={columnChartOptions(
                                            SocialAnalytics[key][splitItem]?.chartData
                                                ?.content_engagement_columnsingle_chartData,
                                        )}
                                    />
                                </div>
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="portlet-container portlet-md pfooter">
                                <div className="portlet-header">
                                    <h4>User comments vs Admin response</h4>
                                </div>
                                <div className="portlet-body">
                                    <RSHighchartsContainer
                                        options={columnChartOptions(
                                            SocialAnalytics[key][splitItem]?.chartData
                                                ?.admin_response_multi_stacked_chartData,
                                        )}
                                    />
                                </div>
                            </div>
                        </Col>
                    </Row>
                    {SocialAnalytics[key][splitItem]?.gridData?.totalLinkClicks && (
                        <Row>
                            <Col md={12}>
                                <RSChartTabbar
                                    dynamicTab={`mb0 mini`}
                                    defaultClass={`tabTransparent pt0`}
                                    activeClass={`active`}
                                    chartHeading="Post summary"
                                    autoHeight
                                    headerIcon={
                                        <i
                                            className={`${zip_medium} icon-md ml10 color-primary-blue`}
                                            onClick={() =>
                                                setState((prev) => ({
                                                    ...prev,
                                                    isCampaignCSVModal: true,
                                                }))
                                            }
                                        ></i>
                                    }
                                    tabData={[
                                        {
                                            id: 'resulticks',
                                            text: 'RESUL',
                                            textClass: 'font-sm',
                                            component: () => (
                                                <div className="portlet-body">
                                                    <KendoGrid
                                                        data={POST_SUMMARY_RESULTICKS_GRID_DATA}
                                                        column={POST_SUMMARY_RESULTICKS_GRID_COLUMN_DATA}
                                                        scrollable="scrollable"
                                                    />
                                                    <div className="legendList position-relative mt10">
                                                        <ul className="d-flex justify-content-center">
                                                            {progressbarData.map((item, index) => {
                                                                return (
                                                                    <li className={`${item.cls}-legend`} key={index}>
                                                                        {item.name}
                                                                    </li>
                                                                );
                                                            })}
                                                        </ul>
                                                    </div>
                                                </div>
                                            ),
                                        },
                                        {
                                            id: '0thers',
                                            text: 'Others',
                                            textClass: 'font-sm',
                                            component: () => (
                                                <div className="portlet-body">
                                                    <KendoGrid
                                                        data={POST_SUMMARY_OTHERS_GRID_DATA}
                                                        column={POST_SUMMARY_OTHERS_GRID_COLUMN_DATA}
                                                        scrollable="scrollable"
                                                    />
                                                </div>
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

export default SocialAnalytics3;

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
