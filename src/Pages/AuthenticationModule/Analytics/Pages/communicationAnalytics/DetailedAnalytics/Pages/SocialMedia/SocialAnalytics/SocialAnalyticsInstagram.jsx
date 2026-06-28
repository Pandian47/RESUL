import { numberWithCommas } from 'Utils/modules/formatters';
import { KeyMetricsNew, OverviewGrid, OverviewList } from '../../../Components';
import { COMMUNICATION_PERFORMANCE } from '../../../constants';
import { areasplineChartOptions, columnChartOptions, pieChartOptions } from 'Constants/Charts';
import { ch_color1, ch_color2, ch_color3, ch_color4 } from 'Constants/GlobalConstant/Colors/colorsVariable';
import { circle_csv_download_edge_medium, csv_mini, insta_repost_mini, messaging_mini, share_mini, social_post_large, thumbs_up_mini } from 'Constants/GlobalConstant/Glyphicons';
import { createContext, useMemo, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import moment from 'moment';

import RSHighchartsContainer from 'Components/Highcharts';
import RSChartTabbar from 'Components/RSChartTabber';
import KendoGrid from 'Components/RSKendoGrid';
// import PieChart from '../../../Components/Charts/PieChart';
import useQueryParams from 'Hooks/useQueryParams';
import { parseAnalyticsJson, parseAnalyticsJsonArray } from 'Pages/AuthenticationModule/Analytics/analyticsDefaults';

import { PieChartSkeleton } from 'Components/Skeleton/Skeleton';

// const mockInstagramData = 
//  {
//         "communicationPerformanceJson": [
//             {
//                 "date": "2026-06-10T00:00:00",
//                 "reach": 13,
//                 "views": 22
//             },
//             {
//                 "date": "2026-06-11T00:00:00",
//                 "reach": 10,
//                 "views": 10
//             },
//             {
//                 "date": "2026-06-16T00:00:00",
//                 "reach": 0,
//                 "views": 0
//             }
//         ],
//         "totalInteractionsJson": [
//             {
//                 "name": "Comments",
//                 "value": "2",
//                 "percent": "15.38",
//                 "maxValue": 0,
//                 "ormchannelName": null,
//                 "source": null,
//                 "mediaName": null,
//                 "linkUrlDate": null,
//                 "date": null
//             },
//             {
//                 "name": "Likes",
//                 "value": "9",
//                 "percent": "69.23",
//                 "maxValue": 0,
//                 "ormchannelName": null,
//                 "source": null,
//                 "mediaName": null,
//                 "linkUrlDate": null,
//                 "date": null
//             },
//             {
//                 "name": "Reposts",
//                 "value": "2",
//                 "percent": "15.38",
//                 "maxValue": 0,
//                 "ormchannelName": null,
//                 "source": null,
//                 "mediaName": null,
//                 "linkUrlDate": null,
//                 "date": null
//             },
//             {
//                 "name": "Shares",
//                 "value": "0",
//                 "percent": "0.0",
//                 "maxValue": 0,
//                 "ormchannelName": null,
//                 "source": null,
//                 "mediaName": null,
//                 "linkUrlDate": null,
//                 "date": null
//             }
//         ],
//         "postSummary": [
//             {
//                 "postTitle": "Reels Testing June10",
//                 "contentType": "Reels",
//                 "reach": 15,
//                 "engagement": {
//                     "postComments": 2,
//                     "postShares": 0,
//                     "postReposts": 2,
//                     "postLikes": 9
//                 }
//             }
//         ],
//         "engagement": {
//             "count": 13,
//             "response": null,
//             "prevDisplayLabel": "Previous day comparison",
//             "previousComparisonValue": "100",
//             "isLowEngPerformance": false
//         },
//         "reach": {
//             "count": 15,
//             "delivered": null,
//             "prevDisplayLabel": null,
//             "previousComparisonValue": "100",
//             "isLowReachPerformance": false
//         },
//         "keyMetrics": {
//             "followers": 0,
//             "following": 0,
//             "postTitle": "Instagram Test Reels",
//             "postLikes": 9,
//             "postComments": 2,
//             "postSaved": 0,
//             "postViews": 26,
//             "postShares": 0,
//             "postReposts": 2,
//             "postReplies": 0,
//             "postNavigation": 0,
//             "postGrowthVelocity": 2,
//             "postEngagementRate": 0,
//             "postViralityScore": 0,
//             "postCompletionRate": 0,
//             "postWatchEfficiency": 166,
//             "postskipToEngage": 0,
//             "totPageLikes": "",
//             "totPageComments": "",
//             "totPageReach": 0
//         },
//         "conversion": null,
//         "selectedChannelId": 7,
//         "blastAudienceJson": null,
//         "enagegementPerformanceJson": [
//             {
//                 "date": "2026-06-10T00:00:00",
//                 "likes": 9,
//                 "comments": 2,
//                 "shares": 0,
//                 "reposts": 2
//             },
//             {
//                 "date": "2026-06-11T00:00:00",
//                 "likes": 23,
//                 "comments": 0,
//                 "shares": 0,
//                 "reposts": 2
//             },
//             {
//                 "date": "2026-06-16T00:00:00",
//                 "likes": 0,
//                 "comments": 0,
//                 "shares": 0,
//                 "reposts": 0
//             }
//         ],
//         "conversionPerformanceJson": null,
//         "enagegementPerformanceHrsJson": null,
//         "postMediaTypePerformanceJson": null,
//         "campaignStatusInfoJson": null,
//         "callDurationSummaryJson": null,
//         "jobDateTime": "6/16/2026 5:30:34 PM",
//         "activityStatus": null,
//         "linkClickList": null,
//         "rawDataInfoDto": [
//             {
//                 "reach": 13,
//                 "comment": 2,
//                 "share": 0,
//                 "view": 22,
//                 "save": 0,
//                 "engagement": 13,
//                 "repost": 2,
//                 "like": 9,
//                 "date": "2026-06-10T13:45:12"
//             },
//             {
//                 "reach": 10,
//                 "comment": 0,
//                 "share": 0,
//                 "view": 10,
//                 "save": 3,
//                 "engagement": 12,
//                 "repost": 2,
//                 "like": 23,
//                 "date": "2026-06-11T13:49:37"
//             },
//             {
//                 "reach": 0,
//                 "comment": 0,
//                 "share": 0,
//                 "view": 0,
//                 "save": 0,
//                 "engagement": 0,
//                 "repost": 0,
//                 "like": 0,
//                 "date": "2026-06-16T12:00:33"
//             }
//         ],
//         "pageByDeviceJson": null,
//         "pageByLocationJson": null,
//         "pageByOSJson": null,
//         "pageByDaysJson": null,
//         "pageByHoursJson": null,
//         "topOs": null,
//         "topOsValue": null,
//         "topDevice": null,
//         "topDeviceValue": null,
//         "prevDisplayLabel": null,
//         "topHour": null,
//         "topHourValue": null,
//         "topDay": null,
//         "topDayValue": null,
//         "topLocation": null,
//         "topLocationValue": null,
//         "pageByBrowserJson": null,
//         "topBrowser": null,
//         "topBrowserValue": null
//     }

export const GlobalStateReportEmail = createContext();

const SocialAnalyticsInstagram = ({ type = 'post' }) => {
    const locationData = useQueryParams('/analytics/detail-analytics');
    const { overviewDetail } = useSelector(({ analyticsDetails }) => analyticsDetails);
    const [isChartExpanded, setIsChartExpanded] = useState(false);

    const activeDetail = (overviewDetail && Object.keys(overviewDetail).length > 0 && overviewDetail.keyMetrics)
        ? overviewDetail
        : null ;

    const {
        reach,
        engagement,
        keyMetrics,
        communicationPerformanceJson,
        enagegementPerformanceJson,
        totalInteractionsJson,
        postSummary,
        rawDataInfoDto,
        jobDateTime,
    } = activeDetail || {};

    const parsedReach = useMemo(() => parseAnalyticsJson(reach, {}), [reach]);
    const parsedEngagement = useMemo(() => parseAnalyticsJson(engagement, {}), [engagement]);
    const parsedKeyMetrics = useMemo(() => parseAnalyticsJson(keyMetrics, {}), [keyMetrics]);
    const parsedCommPerformance = useMemo(() => parseAnalyticsJsonArray(communicationPerformanceJson, []), [communicationPerformanceJson]);
    const parsedEngagementPerformance = useMemo(() => parseAnalyticsJsonArray(enagegementPerformanceJson, []), [enagegementPerformanceJson]);
    const parsedTotalInteractions = useMemo(() => parseAnalyticsJsonArray(totalInteractionsJson, []), [totalInteractionsJson]);
    const parsedPostSummary = useMemo(() => parseAnalyticsJsonArray(postSummary, []), [postSummary]);
    const parsedRawDataInfo = useMemo(() => parseAnalyticsJsonArray(rawDataInfoDto, []), [rawDataInfoDto]);

    const overviewListData = useMemo(() => {
        return [
            {
                name: 'Reach',
                value: parsedReach?.count || 0,
                lists: [],
                footer: {
                    name: parsedReach?.prevDisplayLabel || '',
                    value: parsedReach?.previousComparisonValue || '',
                    performance: parsedReach?.isLowReachPerformance || false,
                },
            },
            {
                name: 'Engagement',
                value: parsedEngagement?.count || 0,
                lists: [],
                footer: {
                    name: parsedEngagement?.prevDisplayLabel || '',
                    value: parsedEngagement?.previousComparisonValue || '',
                    performance: parsedEngagement?.isLowEngPerformance || false,
                },
            },
        ];
    }, [parsedReach, parsedEngagement]);

    const instagramKeyMetrics = useMemo(() => {
        if (!parsedKeyMetrics || Object.keys(parsedKeyMetrics).length === 0) return [];
        return {
            firstData: [
                {
                    isOpen: false,
                    name: 'Engagement\nrate',
                    value: parsedKeyMetrics.postEngagementRate || 0,
                    percent: true,
                },
                {
                    isOpen: false,
                    name: 'Growth\nvelocity',
                    value: parsedKeyMetrics.postGrowthVelocity || 0,
                    suffix: '/day',
                },
                {
                    isOpen: false,
                    name: 'Virality\nscore',
                    value: parsedKeyMetrics.postViralityScore || 0,
                    percent: true,
                }
            ],
            middleDataTitle: '',
            middleDataBg: [
                {
                    name: 'Completion rate',
                    value: parsedKeyMetrics.postCompletionRate || 0,
                    percent: true,
                    color: 'bg-blue-light',
                },
                {
                    name: 'Watch efficiency',
                    value: parsedKeyMetrics.postWatchEfficiency || 0,
                    suffix: '\u00a0sec',
                    color: 'bg-blue-medium',
                },
                {
                    name: 'Skip to engage',
                    value: parsedKeyMetrics.postskipToEngage || 0,
                    suffix: '\u00a0ratio',
                    color: 'bg-blue-dark',
                }
            ],
            lastDataHeader: 'Total interactions',
            lastData: [
                {
                    name: 'Likes',
                    value: parsedKeyMetrics.postLikes || 0,
                },
                {
                    name: 'Comments',
                    value: parsedKeyMetrics.postComments || 0,
                },
                {
                    name: 'Shares',
                    value: parsedKeyMetrics.postShares || 0,
                }
            ],
            lastDataTitle: '',
            lastDataBg: 
            [
                {
                    name: 'Views',
                    value: parsedKeyMetrics.postViews || 0,
                    color: 'bg-red-medium',
                },
                {
                    name: 'Saves',
                    value: parsedKeyMetrics.postSaved || 0,
                    color: 'bg-red-dark',
                },
                {
                    name: 'Reposts',
                    value: parsedKeyMetrics.postReposts || 0,
                    color: 'bg-red-heavy-dark',
                }
            ]
        };
    }, [parsedKeyMetrics]);

    const reachViewsChartData = useMemo(() => {
        if (parsedCommPerformance.length === 0) {
            return { categories: [], series: [] };
        }
        return {
            categories: parsedCommPerformance.map((item) => moment(item.date).format('DD MMM')),
            series: [
                {
                    name: 'Reach',
                    datas: parsedCommPerformance.map((item) => item.reach || 0),
                    color: ch_color1 || '#41aba7',
                },
                {
                    name: 'Views',
                    datas: parsedCommPerformance.map((item) => item.views || 0),
                    color: ch_color2 || '#f56701',
                }
            ]
        };
    }, [parsedCommPerformance]);

    const engagementChartData = useMemo(() => {
        if (parsedEngagementPerformance.length === 0) {
            return { categories: [], series: [] };
        }
        return {
            categories: parsedEngagementPerformance.map((item) => moment(item.date).format('DD MMM')),
            series: [
                {
                    name: 'Likes',
                    datas: parsedEngagementPerformance.map((item) => item.likes || 0),
                    color: ch_color1 || '#41aba7',
                },
                {
                    name: 'Comments',
                    datas: parsedEngagementPerformance.map((item) => item.comments || 0),
                    color: ch_color2 || '#f56701',
                },
                {
                    name: 'Shares',
                    datas: parsedEngagementPerformance.map((item) => item.shares || 0),
                    color: ch_color3 || '#1c9ed9',
                },
                {
                    name: 'Reposts',
                    datas: parsedEngagementPerformance.map((item) => item.reposts || 0),
                    color: ch_color4 || '#99cc03',
                }
            ]
        };
    }, [parsedEngagementPerformance]);

    const interactionsPieChartData = useMemo(() => {
        if (parsedTotalInteractions.length === 0) {
            return { series: [] };
        }
        return {
            series: parsedTotalInteractions.map((item) => ({
                name: item.name,
                y: parseFloat(item.percent || 0),
                value: parseInt(item.value || 0)
            }))
        };
    }, [parsedTotalInteractions]);

    const postSummaryGridData = useMemo(() => {
        if (parsedPostSummary.length === 0) return [];
        return parsedPostSummary.map((item) => ({
            postsTitle: item.postTitle,
            publishedDate: item.publishedDate || moment(item.date).format('ddd, MMM DD, YYYY'),
            contentTypeIcon: item.contentType === 'Reels' ? social_post_large : social_post_large,
            reach: item.reach,
            engagement: [
                {
                    icon: share_mini,
                    value: item.engagement?.postShares || 0,
                },
                {
                    icon: thumbs_up_mini,
                    value: item.engagement?.postLikes || 0,
                },
                {
                    icon: messaging_mini,
                    value: item.engagement?.postComments || 0,
                },
                {
                    icon: insta_repost_mini || share_mini,
                    value: item.engagement?.postReposts || 0,
                },
            ],
            conversion: 0,
            ratings: 0,
        }));
    }, [parsedPostSummary]);

    const REACH_VIEWS_COLUMNS = useMemo(() => [
        {
            field: 'date',
            title: 'Date',
            width: 150,
            cell: ({ dataItem }) => (
                <td>{moment(dataItem.date).format('MMM DD,YYYY')}</td>
            ),
        },
        {
            field: 'reach',
            title: 'Reach',
            className: 'text-end',
            headerClassName: 'text-end',
            width: 120,
            cell: ({ dataItem }) => <td className="text-end">{numberWithCommas(dataItem.reach || 0)}</td>,
        },
        {
            field: 'views',
            title: 'Views',
            className: 'text-end',
            headerClassName: 'text-end',
            width: 120,
            cell: ({ dataItem }) => <td className="text-end">{numberWithCommas(dataItem.views || 0)}</td>,
        },
    ], []);

    const TOTAL_INTERACTIONS_COLUMNS = useMemo(() => [
        {
            field: 'name',
            title: 'Interaction type',
            width: 250,
        },
        {
            field: 'value',
            title: 'Value',
            className: 'text-end',
            headerClassName: 'text-end',
            width: 120,
            cell: ({ dataItem }) => <td className="text-end">{numberWithCommas(dataItem.value || 0)}</td>,
        },
        {
            field: 'percent',
            title: 'Percentage',
            className: 'text-end',
            headerClassName: 'text-end',
            width: 120,
            cell: ({ dataItem }) => <td className="text-end">{dataItem.percent}%</td>,
        },
    ], []);

    const ENGAGEMENT_PERFORMANCE_COLUMNS = useMemo(() => [
        {
            field: 'date',
            title: 'Date',
            width: 150,
            cell: ({ dataItem }) => (
                <td>{moment(dataItem.date).format('MMM DD,YYYY')}</td>
            ),
        },
        {
            field: 'likes',
            title: 'Likes',
            className: 'text-end',
            headerClassName: 'text-end',
            width: 100,
            cell: ({ dataItem }) => <td className="text-end">{numberWithCommas(dataItem.likes || 0)}</td>,
        },
        {
            field: 'comments',
            title: 'Comments',
            className: 'text-end',
            headerClassName: 'text-end',
            width: 100,
            cell: ({ dataItem }) => <td className="text-end">{numberWithCommas(dataItem.comments || 0)}</td>,
        },
        {
            field: 'shares',
            title: 'Shares',
            className: 'text-end',
            headerClassName: 'text-end',
            width: 100,
            cell: ({ dataItem }) => <td className="text-end">{numberWithCommas(dataItem.shares || 0)}</td>,
        },
        {
            field: 'reposts',
            title: 'Reposts',
            className: 'text-end',
            headerClassName: 'text-end',
            width: 100,
            cell: ({ dataItem }) => <td className="text-end">{numberWithCommas(dataItem.reposts || 0)}</td>,
        },
    ], []);

    const RAW_DATA_COLUMNS = useMemo(() => [
        {
            field: 'date',
            title: 'Date',
            width: 150,
            cell: ({ dataItem }) => (
                <td>{moment(dataItem.date).format('MMM DD,YYYY')}</td>
            ),
        },
        {
            field: 'reach',
            title: 'Reach',
            className: 'text-end',
            headerClassName: 'text-end',
            width: 100,
            cell: ({ dataItem }) => <td className="text-end">{numberWithCommas(dataItem.reach || 0)}</td>,
        },
        {
            field: 'like',
            title: 'Likes',
            className: 'text-end',
            headerClassName: 'text-end',
            width: 100,
            cell: ({ dataItem }) => <td className="text-end">{numberWithCommas(dataItem.like || 0)}</td>,
        },
        {
            field: 'comment',
            title: 'Comments',
            className: 'text-end',
            headerClassName: 'text-end',
            width: 100,
            cell: ({ dataItem }) => <td className="text-end">{numberWithCommas(dataItem.comment || 0)}</td>,
        },
        {
            field: 'share',
            title: 'Shares',
            className: 'text-end',
            headerClassName: 'text-end',
            width: 100,
            cell: ({ dataItem }) => <td className="text-end">{numberWithCommas(dataItem.share || 0)}</td>,
        },
        {
            field: 'save',
            title: 'Saves',
            className: 'text-end',
            headerClassName: 'text-end',
            width: 100,
            cell: ({ dataItem }) => <td className="text-end">{numberWithCommas(dataItem.save || 0)}</td>,
        },
        {
            field: 'view',
            title: 'Views',
            className: 'text-end',
            headerClassName: 'text-end',
            width: 100,
            cell: ({ dataItem }) => <td className="text-end">{numberWithCommas(dataItem.view || 0)}</td>,
        },
        {
            field: 'repost',
            title: 'Reposts',
            className: 'text-end',
            headerClassName: 'text-end',
            width: 100,
            cell: ({ dataItem }) => <td className="text-end">{numberWithCommas(dataItem.repost || 0)}</td>,
        },
        {
            field: 'engagement',
            title: 'Engagement',
            className: 'text-end',
            headerClassName: 'text-end',
            width: 120,
            cell: ({ dataItem }) => <td className="text-end">{numberWithCommas(dataItem.engagement || 0)}</td>,
        },
    ], []);

    const POST_SUMMARY_COLUMNS = useMemo(() => [
        {
            field: 'postsTitle',
            title: 'Post title',
            width: 350,
            cell: ({ dataItem }) => (
                <td>
                    <div>
                        <p className="m0 font-weight-bold">{dataItem?.postsTitle}</p>
                        <small className="text-muted">Published on: {dataItem?.publishedDate}</small>
                    </div>
                </td>
            ),
        },
        {
            field: 'contentType',
            title: 'Content type',
            width: 120,
            cell: ({ dataItem }) => (
                <td className="text-center">
                    <i className={`${dataItem?.contentTypeIcon} icon-lg ml10 color-primary-blue cursor-default`}></i>
                </td>
            ),
        },
        {
            field: 'reach',
            title: 'Reach',
            className: 'text-end',
            headerClassName: 'text-end',
            width: 100,
            cell: ({ dataItem }) => <td className="text-end">{numberWithCommas(dataItem.reach || 0)}</td>,
        },
        {
            field: 'engagement',
            title: 'Engagement',
            width: 250,
            cell: ({ dataItem }) => (
                <td>
                    <div className="d-flex align-items-center justify-content-around">
                        {dataItem?.engagement?.map((item, index) => (
                            <div key={index} className="d-flex align-items-center">
                                <i className={`${item.icon} color-primary-blue mr5 cursor-default`}></i>
                                <small className="ml5">{item.value}</small>
                            </div>
                        ))}
                    </div>
                </td>
            ),
        },
    ], []);

    return (
        <GlobalStateReportEmail.Provider value={''}>
            <Container className="page-content px0">
                <div className="rs-csr-wrapper">
                    <OverviewGrid
                        channelType={type}
                        channelId={locationData?.channelId}
                        infoIcon={false}
                        campaignId={locationData?.campaignId}
                        isTime={true}
                        isPreview={false}
                        date={jobDateTime}
                    />
                    <OverviewList dataObj={overviewListData} />

                    <Row>
                        <div className="portlet-heading">
                            <h3>{COMMUNICATION_PERFORMANCE}</h3>
                        </div>

                        <Col md={8} className="position-relative">
                            <RSChartTabbar
                                dynamicTab={`mb0 mini`}
                                defaultClass={`tabTransparent pt0`}
                                activeClass={`active`}
                                chartHeading="Reach vs Views"
                                tabData={[
                                    {
                                        id: 'reach_views',
                                        text: 'Chart',
                                        textClass: 'font-sm',
                                        component: () => (
                                            <RSHighchartsContainer
                                                pClassName={'x-axis-labels-performance'}
                                                key="reach_views_chart"
                                                options={areasplineChartOptions(reachViewsChartData)}
                                            />
                                        ),
                                    },
                                    {
                                        id: 'reach_views_table',
                                        text: 'Table',
                                        textClass: 'font-sm',
                                        component: () => (
                                            <KendoGrid
                                                data={parsedCommPerformance}
                                                column={REACH_VIEWS_COLUMNS}
                                                scrollable="scrollable"
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
                            <KeyMetricsNew data={instagramKeyMetrics} middleDataHeader={false} />
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <RSChartTabbar
                                dynamicTab={`mb0 mini`}
                                defaultClass={`tabTransparent pt0`}
                                activeClass={`active`}
                                chartHeading="Total interactions"
                                tabData={[
                                    {
                                        id: 'total_interactions_chart',
                                        text: 'Chart',
                                        textClass: 'font-sm',
                                        component: () => (
                                            parsedTotalInteractions.length === 0 ? (
                                                <PieChartSkeleton nodata />
                                            ) : (
                                                <RSHighchartsContainer
                                                    type="pie"
                                                    key="total_interactions_pie"
                                                    options={pieChartOptions(interactionsPieChartData)}
                                                />
                                            )
                                        ),
                                    },
                                    {
                                        id: 'total_interactions_table',
                                        text: 'Table',
                                        textClass: 'font-sm',
                                        component: () => (
                                            <KendoGrid
                                                data={parsedTotalInteractions}
                                                column={TOTAL_INTERACTIONS_COLUMNS}
                                                scrollable="scrollable"
                                            />
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
                                chartHeading="Engagement performance"
                                tabData={[
                                    {
                                        id: 'engagement_performance_chart',
                                        text: 'Chart',
                                        textClass: 'font-sm',
                                        component: () => (
                                            <RSHighchartsContainer
                                                key="engagement_performance_column"
                                                options={columnChartOptions({
                                                    ...engagementChartData,
                                                    stacking: 'normal',
                                                })}
                                            />
                                        ),
                                    },
                                    {
                                        id: 'engagement_performance_table',
                                        text: 'Table',
                                        textClass: 'font-sm',
                                        component: () => (
                                            <KendoGrid
                                                data={parsedEngagementPerformance}
                                                column={ENGAGEMENT_PERFORMANCE_COLUMNS}
                                                scrollable="scrollable"
                                            />
                                        ),
                                    },
                                ]}
                                className="rs-tabs row"
                                componentClassName={'mt30'}
                            />
                        </Col>
                    </Row>

                    <Row>
                        <Col md={12}>
                            <div className="portlet-container">
                                <div className="portlet-header">
                                    <h4>Raw data</h4>
                                    <div className="align-items-center d-flex float-end">
                                        <i className={`${circle_csv_download_edge_medium || csv_mini} icon-lg color-primary-blue cursor-pointer`}></i>
                                    </div>
                                </div>
                                <div className="portlet-body">
                                    <KendoGrid
                                        data={parsedRawDataInfo}
                                        column={RAW_DATA_COLUMNS}
                                        scrollable="scrollable"
                                    />
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={12}>
                            <div className="portlet-container">
                                <div className="portlet-header">
                                    <h4>Post summary</h4>
                                </div>
                                <div className="portlet-body">
                                    <KendoGrid
                                        data={postSummaryGridData}
                                        column={POST_SUMMARY_COLUMNS}
                                        scrollable="scrollable"
                                    />
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
            </Container>
        </GlobalStateReportEmail.Provider>
    );
};

export default SocialAnalyticsInstagram;
