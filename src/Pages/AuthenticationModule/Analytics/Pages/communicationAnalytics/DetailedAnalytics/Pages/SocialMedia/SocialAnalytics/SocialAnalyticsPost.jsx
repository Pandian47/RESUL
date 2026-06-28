import { formatNumber } from 'Utils/modules/campaignUtils';
import { hasValidPieChartData } from 'Utils/modules/charts';

import { KeyMetricsNew, OverviewGrid, OverviewList } from '../../../Components';
import { COMMUNICATION_PERFORMANCE, POST_SUMMARY_OTHERS_GRID_COLUMN_DATA, POST_SUMMARY_OTHERS_GRID_DATA, POST_SUMMARY_RESULTICKS_GRID_COLUMN_DATA, POST_SUMMARY_RESULTICKS_GRID_DATA, changeToBase64, changeToBase641, defaultValues, getDaywiseChartData, getHoursWiseChartData, handleChannelInfo, mapChartOption, pieChartOption } from '../../../constants';
import { areasplineChartOptions, columnChartOptions, pieChartOptions } from 'Constants/Charts';
import { arrow_up_mini, messaging_mini, share_mini, social_post_large, thumbs_up_mini, zip_medium } from 'Constants/GlobalConstant/Glyphicons';
import { createContext, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';

import RSHighchartsContainer from 'Components/Highcharts';
import KendoGrid from 'Components/RSKendoGrid';
import RSChartTabbar from 'Components/RSChartTabber';
import ClickMapModal from '../../../Components/ClickMapModal';
import { getDetailReport_ContentDetails } from 'Reducers/analytics/details/request';
import SocialAnalyticsData, { keyMetrixData, overview_data } from '../data';
import { useDispatch, useSelector } from 'react-redux';

import ColumnChart from '../../../Components/Charts/ColumnChart';
// require('highcharts/highcharts-more.js')(Highcharts);

import { getSessionId } from 'Reducers/globalState/selector';
import useQueryParams from 'Hooks/useQueryParams';
import { HorizontalSkeleton, ListAqusitionSekelton, ColumnChartSkeletonNew } from 'Components/Skeleton/Skeleton';
import PieChart from '../../../Components/Charts/PieChart';
import DaysAndHoursChart from '../../../Components/Charts/DaysAndHoursChart';
import MapChart from '../../../Components/Charts/MapChart';
export const GlobalStateReportEmail = createContext();
const progressbarData = [
    { name: 'Organic', value: 25, cls: 'pending' },
    { name: 'Boost post', value: 10, cls: 'rejected' },
];

const SocialAnalyticsPost = ({ type = 'post', splitItem = 'Split A', typeOf, infoIcon }) => {
    const locationData = useQueryParams('/analytics/detail-analytics');
    const dispatch = useDispatch();
    const { analyticsDetatils } = useSelector(({ analyticsListingReducer }) => analyticsListingReducer);
    const { overviewDetail, channelDetail, segmentDetail } = useSelector(({ analyticsDetails }) => analyticsDetails);
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
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

    const currentData = SocialAnalyticsData?.[typeOf]?.[splitItem] || {
        chartData: {},
        overview_data: [],
        keyMetrics: {},
    };

    const {
        reach,
        engagement,
        conversion,
        reachPerformanceJson,
        reachPerformanceHrsJson,
        linkClickList,
        keyMetrics,
        enagegementPerformanceJson,
        postMediaTypePerformanceJson,
        jobDateTime,
        conversionPerformanceJson,
        topBrowser,
        topBrowserValue,
        topOs,
        topOsValue,
        pageByBrowserJson,
        pageByDaysJson,
        pageByDeviceJson,
        pageByHoursJson,
        pageByLocationJson,
        topDay,
        topDayValue,
        topHour,
        topHourValue,
        topDeviceValue,
        topDevice,
        byFollowers,
        byPageViews,
        topLocation
    } = overviewDetail || defaultValues;
    // console.log('overviewDetail: ', overviewDetail);

    // const dateField = getUserDateTimeFormat(jobDateTime, 'formatDateTime');
    const dateField = jobDateTime;
    const POST_SUMMARY_RESULTICKS_GRID = [
        {
            postsTitle: keyMetrics?.postTitle,
            contentType: social_post_large,
            reach: reach?.count,
            engagement: [
                // {
                //     icon: arrow_up_mini,
                //     value: 2132,
                // },
                {
                    icon: thumbs_up_mini,
                    value: keyMetrics?.postLikes,
                },
                {
                    icon: messaging_mini,
                    value: keyMetrics?.postComments,
                },
                {
                    icon: share_mini,
                    value: keyMetrics?.repost,
                },
            ],
            conversion: conversion?.count,
            ratings: 0,
        },
    ];
    const handlePreviewDetails = async (data) => {
        const currentBlastId = analyticsDetatils?.blastId;
        const currentChannelInfo = channelDetail?.channelInfos?.find(
            (info) => info.blastShortCode === currentBlastId
        );
           const getWinnerChannel_Detaild = handleChannelInfo(channelDetail, locationData);
            const channelDetailId = currentChannelInfo?.channelDetailid || 0;
            let getWinnerChannelDetaild = getWinnerChannel_Detaild[0]?.channelDetailid ||channelDetailId;                                 
        
        let payload = {
            departmentId,
            clientId,
            userId,
            campaignId: channelDetail?.campaignID,
            blastId: currentBlastId,
            channelId: analyticsDetatils?.channelId || locationData?.channelId,
            channelDetailId: getWinnerChannelDetaild,
            // blastguid: channelDetail?.campaignGuid,
        };
        const response = await dispatch(getDetailReport_ContentDetails(payload));
        if (response?.status) {
            setState((pre) => ({ ...pre, isClickMapModal: true, previewData: response?.content ?? '' }));
        } else {
            setState((pre) => ({ ...pre, isClickMapModal: true, previewData: '' }));
        }
    };
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
                        channelId={locationData?.channelId}
                        infoIcon={false}
                        campaignId={locationData?.campaignId}
                        isTime={true}
                        isPreview={false}
                        date={dateField}
                        handlePreviewDetails={() => {
                            handlePreviewDetails();
                        }}
                    />
                    <OverviewList dataObj={overview_data(reach, engagement, conversion)} />
                    {/* <OverviewList dataObj={currentData?.overview_data} /> */}

                    <Row>
                        <div className="portlet-heading">
                            <h3>{COMMUNICATION_PERFORMANCE}</h3>
                        </div>

                        {/* <Col md={8} className="position-relative d-none">
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
                                                    currentData.chartData.reach_areaspline_overall_chartData,
                                                )}
                                            />
                                        ),
                                    },
                                ]}
                                expandView
                                expandIcon={() => setIsChartExpanded(!isChartExpanded)}
                                isChartExpanded={isChartExpanded}
                            />
                        </Col> */}
                        <Col md={8} className="x-axis-labels-performance">
                            <RSChartTabbar
                                dynamicTab={`mb0 mini`}
                                defaultClass={`tabTransparent pt0`}
                                activeClass={`active`}
                                //chartHeading="Engagement"
                                footer
                                tabData={[
                                    {
                                        id: 'engagement',
                                        text: 'Engagement',
                                        textClass: 'font-sm',
                                        component: () => {
                                            const chartData =
                                                enagegementPerformanceJson !== undefined &&
                                                enagegementPerformanceJson !== null &&
                                                enagegementPerformanceJson !== ''
                                                    ? changeToBase64(enagegementPerformanceJson, 'area')
                                                    : null;

                                                            if (!chartData) {
                                                                return <ListAqusitionSekelton isError isChartSkeleton isCustom disableLegendAnimation />;
                                            }
                                            return (
                                                <RSHighchartsContainer
                                                    type="area"
                                                    key={'overall'}
                                                    options={areasplineChartOptions(chartData)}
                                                />
                                            );
                                        },
                                        footer: (
                                            <></>
                                            // <ul>
                                            //     <li>
                                            //         <span>{SocialAnalyticsData.smEngagementOverAllPercent}</span>
                                            //         <small>%</small>
                                            //     </li>
                                            //     <li>{SocialAnalyticsData.smEngagementoverAll}</li>
                                            // </ul>
                                        ),
                                    },
                                    {
                                        id: 'conversion',
                                        text: 'Conversion',
                                        textClass: 'font-sm',
                                        //disable: true,
                                        component: () => {
                                            const chartData =
                                                conversionPerformanceJson !== undefined &&
                                                conversionPerformanceJson !== null &&
                                                conversionPerformanceJson !== ''
                                                    ? changeToBase64(conversionPerformanceJson, 'area')
                                                    : null;
                                            if (!chartData) {
                                                return <ColumnChartSkeletonNew isError />;
                                            }
                                            return (
                                                <RSHighchartsContainer
                                                    type="columnChart"
                                                    options={columnChartOptions(chartData)}
                                                />
                                            );
                                        },
                                        footer: (
                                            <ul>
                                                {/* <li>
                                                                            <span> {SocialAnalyticsData.smEngagementImpactPercent}</span>
                                                                            <small>%</small>
                                                                        </li> */}
                                                {/* <li>{SocialAnalyticsData.smEngagementImpact}</li> */}
                                            </ul>
                                        ),
                                    },
                                ]}
                                className="rs-tabs row"
                                componentClassName={'mt30'}
                            />
                        </Col>
                        <Col md={4}>
                            {/* <KeyMetricsNew data={currentData?.keyMetrics} /> */}
                            <KeyMetricsNew
                                data={keyMetrics !== undefined && keyMetrics !== null ? keyMetrixData(keyMetrics, engagement) : []}
                                infoIcon={false}
                            />
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6} className="x-axis-labels-performance d-none">
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
                                                // options={areasplineChartOptions(
                                                //     currentData?.chartData?.engagement_areaspline_overall_chartData,
                                                // )}
                                                options={areasplineChartOptions(
                                                    enagegementPerformanceJson !== undefined
                                                        ? changeToBase64(enagegementPerformanceJson, 'area')
                                                        : {},
                                                )}
                                            />
                                        ),
                                        footer: (
                                            <></>
                                            // <ul>
                                            //     <li>
                                            //         <span>{SocialAnalyticsData.smEngagementOverAllPercent}</span>
                                            //         <small>%</small>
                                            //     </li>
                                            //     <li>{SocialAnalyticsData.smEngagementoverAll}</li>
                                            // </ul>
                                        ),
                                    },
                                    {
                                        id: 'Impact_on_page_likes ',
                                        text: 'Impact on page likes ',
                                        textClass: 'font-sm',
                                        disable: true,
                                        component: () => (
                                            <RSHighchartsContainer
                                                key={'Impact_on_page_likes'}
                                                options={columnChartOptions(
                                                    currentData?.chartData?.engagement_column_insights_chartData,
                                                )}
                                            />
                                        ),
                                        footer: (
                                            <ul>
                                                <li>
                                                    <span> {SocialAnalyticsData.smEngagementImpactPercent}</span>
                                                    <small>%</small>
                                                </li>
                                                <li>{SocialAnalyticsData.smEngagementImpact}</li>
                                            </ul>
                                        ),
                                    },
                                ]}
                                className="rs-tabs row"
                                componentClassName={'mt30'}
                            />
                        </Col>
                        <Col md={6} className="d-none">
                            <div className="portlet-container portlet-md pfooter">
                                <div className="portlet-header">
                                    <h4>Conversion</h4>
                                </div>
                                {/* <div className="portlet-body">
                                    <RSHighchartsContainer
                                        options={columnChartOptions(currentData?.chartData?.sm_conversion)}
                                    />
                                </div> */}

                                <div className="portlet-footer portlet-two-label">
                                    <ul>
                                        <li>
                                            <span> {SocialAnalyticsData.smConversionPercent}</span>
                                            <small>%</small>
                                        </li>
                                        <li> {SocialAnalyticsData.smConversion}</li>
                                    </ul>
                                </div>
                            </div>
                        </Col>
                        <Col md={6} className="d-none">
                            <ColumnChart
                                title={'Post media type'}
                                chartData={
                                    postMediaTypePerformanceJson !== undefined &&
                                    postMediaTypePerformanceJson !== null &&
                                    postMediaTypePerformanceJson !== ''
                                        ? changeToBase64(postMediaTypePerformanceJson, 'columnFooter', true)
                                        : {}
                                }
                                footerPercent={formatNumber(conversion?.count)}
                                footerText={'of conversion happened during this period without registration'}
                                content={false}
                            />
                        </Col>
                    </Row>

                    <Row>
                        {/* <Col md={6}>
                            <ColumnChart
                                title={'By followers'}
                                chartData={
                                    byFollowers !== undefined && byFollowers !== null && byFollowers !== ''
                                        ? changeToBase641(byFollowers, 'columnFooter', true)
                                        : {}
                                }
                                footerPercent={formatNumber(conversion?.count)}
                                footerText={'of conversion happened during this period without registration'}
                                content={false}
                            />
                        </Col>
                        <Col md={6}>
                            <ColumnChart
                                title={'By page views'}
                                chartData={
                                    byPageViews !== undefined && byPageViews !== null && byPageViews !== ''
                                        ? changeToBase641(byPageViews, 'columnFooter')
                                        : {}
                                }
                                footerPercent={formatNumber(conversion?.count)}
                                footerText={'of conversion happened during this period without registration'}
                                content={false}
                            />
                        </Col> */}
                    </Row>
                    <Row className="">
                        <div className="portlet-heading">
                            <h3 className="mt0">User engagement</h3>
                        </div>
                        <Col md={6} className="mapicon">
                            <MapChart
                                title={'By location'}
                                chartData={!!pageByLocationJson ? mapChartOption(pageByLocationJson) : {series: []}}
                                // footerPercent={keyMetrics?.['participants']}
                                footerText={
                                    <>
                                        <span>{topLocation}</span>&nbsp;has the highest engagement rate
                                        with&nbsp;
                                        <span>{topDayValue}%</span>&nbsp;of users engaged
                                    </>
                                }
                            />
                        </Col>
                        <Col md={6}>
                            <DaysAndHoursChart
                                heading={''}
                                splitItemText={''}
                                expandChartAction={() => setIsChartExpanded(!isChartExpanded)}
                                isChartExpanded={isChartExpanded}
                                splitItem={splitItem}
                                expandViewStatus={false}
                                footerStatus={true}
                                dayData={
                                    pageByDaysJson !== undefined && pageByDaysJson !== null
                                        ? getDaywiseChartData(pageByDaysJson, 'bubble')
                                        : {}
                                }
                                hoursData={
                                    pageByHoursJson !== undefined && pageByHoursJson !== null
                                        ? getHoursWiseChartData(pageByHoursJson, 'clockFooter')
                                        : {}
                                }
                                // dayPercent={topDay}
                                dayText={
                                    <>
                                        <span>{topDay}</span>&nbsp;has the highest engagement rate with&nbsp;
                                        <span>{topDayValue}</span>%
                                    </>
                                }
                                hoursPercent={formatNumber(topHourValue)}
                                hoursText={`of the users engage during ${topHour}`}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            {/* <div className="portlet-container portlet-md pfooter"> */}
                            {/* <div className="portlet-header">
                                                       <h4>By device</h4>
                                                   </div> */}
                            {/* <div className="portlet-body">
                                                           <HorizontalSkeleton isError={true} message={'No data available'} />
                                                       </div> */}

                            <PieChart
                                title={'By device'}
                                chartData={
                                    pageByDeviceJson !== undefined &&
                                    pageByDeviceJson !== null &&
                                    pageByDeviceJson !== '' &&
                                    hasValidPieChartData(pageByDeviceJson)
                                        ? pieChartOption(pageByDeviceJson, 'pieFooter', true)
                                        : {}
                                }
                                footerPercent={formatNumber(topDeviceValue)}
                                footerText={`link clicks on ${topDevice}`}
                            />

                            {/* <div className="portlet-body">
                                                           <RSHighchartsContainer
                                                               options={pieChartOptions(
                                                                   PaidMediadata[splitItem]?.chartData?.by_device_pie_chartData,
                                                               )}
                                                           />
                                                       </div>
                                                       <div className="portlet-footer portlet-two-label">
                                                           <ul>
                                                               <li>
                                                                   <span>{PaidMediadata.paidMediaByDevicePercent}</span>
                                                                   <small>%</small>
                                                               </li>
                                                               <li>{PaidMediadata.paidMediaByDevice}</li>
                                                           </ul>
                                                       </div> */}
                            {/* </div> */}
                        </Col>
                        <Col md={6}>
                            <PieChart
                                title={'By browser'}
                                chartData={
                                    pageByBrowserJson !== undefined &&
                                    pageByBrowserJson !== null &&
                                    pageByBrowserJson !== '' &&
                                    hasValidPieChartData(pageByBrowserJson)
                                        ? pieChartOption(pageByBrowserJson, 'pieFooter', true)
                                        : {}
                                }
                                footerPercent={formatNumber(topBrowserValue)}
                                footerText={`of the users were received through ${
                                    !!topBrowser ? topBrowser : `Others`
                                } browser`}
                            />
                        </Col>
                    </Row>
                    <Row className="d-none">
                        <Col md={6}>
                            <div className="portlet-container portlet-md pfooter">
                                <div className="portlet-header">
                                    <h4>Content engagement by post type</h4>
                                </div>
                                <div className="portlet-body">
                                    {/* <RSHighchartsContainer
                                        options={columnChartOptions(
                                            currentData?.chartData?.engagement_column_insights_chartData,
                                        )}
                                    /> */}
                                </div>
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="portlet-container portlet-md pfooter">
                                <div className="portlet-header">
                                    <h4>User comments vs Admin response</h4>
                                </div>
                                <div className="portlet-body">
                                    {/* <RSHighchartsContainer
                                        options={columnChartOptions(
                                            currentData?.chartData?.comments_and_user_response,
                                        )}
                                    /> */}
                                </div>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                            {/* <RSChartTabbar
                                dynamicTab={`mb0 mini`}
                                defaultClass={`tabTransparent pt0`}
                                activeClass={`active`}
                                chartHeading="Post summary"
                                autoHeight
                                headerIcon={
                                    <i
                                        className={`${zip_medium} click-off icon-md ml10 color-primary-blue`}
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
                                                <div className="legendList position-relative mt10 d-none">
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
                                        disable: true,
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
                                componentClassName={'mt30 d-none'}
                            /> */}
                            <div className="portlet-container">
                                <div className="portlet-header">
                                    <h4>Post summary</h4>
                                </div>
                                <div className="portlet-body">
                                    <KendoGrid
                                        data={POST_SUMMARY_RESULTICKS_GRID}
                                        column={POST_SUMMARY_RESULTICKS_GRID_COLUMN_DATA}
                                        scrollable="scrollable"
                                    />
                                </div>
                            </div>
                        </Col>
                    </Row>
                    {/* Modals */}

                    <ClickMapModal
                        show={isClickMapModal}
                        handleClose={() =>
                            setState((prev) => ({
                                ...prev,
                                isClickMapModal: false,
                            }))
                        }
                        previewImage={states?.previewData}
                        channelId={locationData?.channelId}
                        scheduleDate={jobDateTime}
                    />
                </div>
            </Container>
            {/* Main page content block ends */}
        </GlobalStateReportEmail.Provider>
        // Content holder ends
    );
};

export default SocialAnalyticsPost;

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
