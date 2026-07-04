import { numberWithCommas } from 'Utils/modules/formatters';
import { KeyMetricsNew, OverviewGrid, OverviewList } from '../../../Components';
import { COMMUNICATION_PERFORMANCE, changeToBase64 } from '../../../constants';
import { areasplineChartOptions, columnChartOptions, pieChartOptions } from 'Constants/Charts';
import { ch_color1, ch_color2, ch_color3, ch_color4 } from 'Constants/GlobalConstant/Colors/colorsVariable';
import { circle_csv_download_edge_medium, csv_mini, thumbs_up_mini, messaging_mini, share_mini, social_post_large, eye_mini, social_pinterest_mini, save_mini, email_click_mini } from 'Constants/GlobalConstant/Glyphicons';
import { createContext, useMemo, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import moment from 'moment';

import RSHighchartsContainer from 'Components/Highcharts';
import RSChartTabbar from 'Components/RSChartTabber';
import KendoGrid from 'Components/RSKendoGrid';
import useQueryParams from 'Hooks/useQueryParams';
import { parseAnalyticsJson, parseAnalyticsJsonArray } from 'Pages/AuthenticationModule/Analytics/analyticsDefaults';

import { PieChartSkeleton } from 'Components/Skeleton/Skeleton';

export const GlobalStateReportEmail = createContext();

const SocialAnalyticsPinterest = ({ type = 'post' }) => {
    const locationData = useQueryParams('/analytics/detail-analytics');
    const { overviewDetail, channelDetail } = useSelector(({ analyticsDetails }) => analyticsDetails);
    const [isChartExpanded, setIsChartExpanded] = useState(false);

    const activeDetail = (overviewDetail && Object.keys(overviewDetail).length > 0 && overviewDetail.keyMetrics)
        ? overviewDetail
        : null;

    const {
        reach,
        engagement,
        conversion,
        keyMetrics,
        communicationPerformanceJson,
        enagegementPerformanceJson,
        conversionPerformanceJson,
        totalInteractionsJson,
        postSummary,
        rawDataInfoDto,
        jobDateTime,
    } = activeDetail || {};

    const parsedReach = useMemo(() => parseAnalyticsJson(reach, {}), [reach]);
    const parsedEngagement = useMemo(() => parseAnalyticsJson(engagement, {}), [engagement]);
    const parsedConversion = useMemo(() => parseAnalyticsJson(conversion, {}), [conversion]);
    const parsedKeyMetrics = useMemo(() => parseAnalyticsJson(keyMetrics, {}), [keyMetrics]);
    const parsedCommPerformance = useMemo(() => parseAnalyticsJsonArray(communicationPerformanceJson, []), [communicationPerformanceJson]);
    const parsedEngagementPerformance = useMemo(() => parseAnalyticsJsonArray(enagegementPerformanceJson, []), [enagegementPerformanceJson]);
    const parsedTotalInteractions = useMemo(() => {
        if (totalInteractionsJson && totalInteractionsJson.length > 0) {
            return parseAnalyticsJsonArray(totalInteractionsJson, []);
        }
        const pinClicks = Number(parsedKeyMetrics.pinClick || 0);
        const saves = Number(parsedKeyMetrics.postSaved !== null && parsedKeyMetrics.postSaved !== undefined ? parsedKeyMetrics.postSaved : (parsedKeyMetrics.save || 0));
        const outbound = Number(parsedKeyMetrics.outbound || 0);
        const total = pinClicks + saves + outbound;

        if (total === 0) return [];

        return [
            {
                name: 'Pin Clicks',
                value: pinClicks,
                percent: ((pinClicks / total) * 100).toFixed(2),
            },
            {
                name: 'Saves',
                value: saves,
                percent: ((saves / total) * 100).toFixed(2),
            },
            {
                name: 'Outbound Clicks',
                value: outbound,
                percent: ((outbound / total) * 100).toFixed(2),
            }
        ];
    }, [totalInteractionsJson, parsedKeyMetrics]);
    const parsedPostSummary = useMemo(() => parseAnalyticsJsonArray(postSummary, []), [postSummary]);
    const parsedRawDataInfo = useMemo(() => parseAnalyticsJsonArray(rawDataInfoDto, []), [rawDataInfoDto]);

    const isVideoCampaign = useMemo(() => {
        const hasVideoPost = parsedPostSummary.some((item) => item.contentType === 'Video' || (item.pinEngagement?.videoView > 0));
        const hasVideoRawData = parsedRawDataInfo.some((item) => (item.videoView > 0) || (item.averageWatchTime > 0));
        return hasVideoPost || hasVideoRawData;
    }, [parsedPostSummary, parsedRawDataInfo]);

    const formattedDateRange = useMemo(() => {
        if (!channelDetail?.startDate || !channelDetail?.endDate) return '';
        const start = moment(channelDetail.startDate).format('MMM DD');
        const end = moment(channelDetail.endDate).format('MMM DD, YYYY');
        return `(${start} – ${end})`;
    }, [channelDetail]);

    const overviewListData = useMemo(() => {
        return [
            {
                name: 'Reach',
                value: parsedReach?.count || 0,
                lists: [
                    {
                        text: 'Pin impressions',
                        percent: parsedReach?.delivered !== null ? parsedReach?.delivered : (parsedKeyMetrics?.impression || 0),
                    }
                ],
                footer: {
                    name: parsedReach?.prevDisplayLabel || '',
                    value: parsedReach?.previousComparisonValue || '',
                    performance: parsedReach?.isLowReachPerformance || false,
                },
            },
            {
                name: 'Engagement',
                value: parsedEngagement?.count || 0,
                lists: [
                    {
                        text: 'Saves',
                        percent: parsedEngagement?.response !== null ? parsedEngagement?.response : (parsedKeyMetrics?.postSaveRate || 0),
                    },
                    {
                        text: 'Pin clicks',
                        value: parsedKeyMetrics?.pinClick || 0,
                        hidePercent: true,
                    }
                ],
                footer: {
                    name: parsedEngagement?.prevDisplayLabel || '',
                    value: parsedEngagement?.previousComparisonValue || '',
                    performance: parsedEngagement?.isLowEngPerformance || false,
                },
            },
            {
                name: 'Conversion',
                value: parsedConversion?.count || 0,
                lists: [
                    {
                        text: 'Outbound clicks',
                        percent: parsedConversion?.registration !== null ? parsedConversion?.registration : (parsedKeyMetrics?.outbound || 0),
                    }
                ],
                footer: {
                    name: parsedConversion?.prevDisplayLabel || '',
                    value: parsedConversion?.previousComparisonValue || '',
                    performance: parsedConversion?.isLowConvPerformance || false,
                },
            }
        ];
    }, [parsedReach, parsedEngagement, parsedConversion, parsedKeyMetrics]);

    const pinterestKeyMetrics = useMemo(() => {
        if (!parsedKeyMetrics || Object.keys(parsedKeyMetrics).length === 0) return [];
        return {
            firstData: [
                {
                    isOpen: false,
                    name: 'Engagement rate',
                    value: parsedKeyMetrics.engagementRate || 0,
                    percent: true,
                },
                {
                    isOpen: false,
                    name: 'Save rate',
                    value: parsedKeyMetrics.postSaveRate || 0,
                    percent: true,
                },
                {
                    isOpen: false,
                    name: 'Virality score',
                    value: parsedKeyMetrics.viralityScore || 0,
                }
            ],
            middleDataTitle: '',
            middleDataBg: [],
            lastDataHeader: 'Pin engagement',
            lastData: [
                {
                    name: (
                        <span className="d-inline-flex align-items-center justify-content-center">
                            <i className={`${eye_mini} mr5`} style={{ fontSize: '14px', verticalAlign: 'middle' }}></i>
                            <span>Impressions</span>
                        </span>
                    ),
                    value: parsedKeyMetrics.impression || 0,
                },
                {
                    name: (
                        <span className="d-inline-flex align-items-center justify-content-center">
                            <i className={`${social_pinterest_mini} mr5`} style={{ fontSize: '14px', verticalAlign: 'middle', color: '#e60023' }}></i>
                            <span>Pin clicks</span>
                        </span>
                    ),
                    value: parsedKeyMetrics.pinClick || 0,
                }
            ],
            lastDataTitle: '',
            lastDataBg: [
                {
                    name: (
                        <span className="d-inline-flex align-items-center justify-content-center">
                            <i className={`${save_mini} mr5`} style={{ color: '#fff', verticalAlign: 'middle' }}></i>
                            <span >Saves</span>
                        </span>
                    ),
                    value: parsedKeyMetrics.postSaved !== null && parsedKeyMetrics.postSaved !== undefined ? parsedKeyMetrics.postSaved : (parsedKeyMetrics.save || 0),
                    color: 'bg-blue-light',
                },
                {
                    name: (
                        <span className="d-inline-flex align-items-center justify-content-center">
                            <i className={`${email_click_mini} mr5`} style={{ color: '#fff', verticalAlign: 'middle' }}></i>
                            <span>Outbound clicks</span>
                        </span>
                    ),
                    value: parsedKeyMetrics.outbound || 0,
                    color: 'bg-blue-medium',
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

    const overallEngagementChartData = useMemo(() => {
        if (parsedEngagementPerformance.length === 0) {
            return { categories: [], series: [] };
        }
        return {
            categories: parsedEngagementPerformance.map((item) => moment(item.date).format('MMM DD')),
            series: [
                {
                    name: 'Pin clicks',
                    datas: parsedEngagementPerformance.map((item) => item.pinClick || 0),
                    color: '#1c9ed9',
                },
                {
                    name: 'Saves',
                    datas: parsedEngagementPerformance.map((item) => item.save || 0),
                    color: '#92c83e',
                }
            ]
        };
    }, [parsedEngagementPerformance]);

    const impactEngagementChartData = useMemo(() => {
        if (parsedEngagementPerformance.length === 0) {
            return { categories: [], series: [] };
        }
        return {
            categories: parsedEngagementPerformance.map((item) => moment(item.date).format('MMM DD')),
            series: [
                {
                    name: 'Saves',
                    datas: parsedEngagementPerformance.map((item) => item.save || 0),
                    color: '#92c83e',
                },
                {
                    name: 'Pin clicks',
                    datas: parsedEngagementPerformance.map((item) => item.pinClick || 0),
                    color: '#1c9ed9',
                },
                {
                    name: 'Outbound clicks',
                    datas: parsedEngagementPerformance.map((item) => item.outbound || 0),
                    color: '#f56701',
                },
                {
                    name: 'Video views',
                    datas: parsedEngagementPerformance.map((item) => item.videoView || item.impression || 0),
                    color: '#e60023',
                }
            ]
        };
    }, [parsedEngagementPerformance]);

    const conversionChartData = useMemo(() => {
        const parsedConversionPerformance = parseAnalyticsJsonArray(conversionPerformanceJson, []);
        if (parsedConversionPerformance.length === 0) {
            return { categories: [], series: [] };
        }
        return {
            categories: parsedConversionPerformance.map((item) => moment(item.date).format('MMM DD')),
            series: [
                {
                    name: 'Communication period',
                    datas: parsedConversionPerformance.map((item) => item.conversion || item.value || 0),
                    color: '#92c83e',
                }
            ]
        };
    }, [conversionPerformanceJson]);

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

    const formatAvgWatchTime = (ms) => {
        if (!ms) return '0:00';
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const postSummaryGridData = useMemo(() => {
        if (parsedPostSummary.length === 0) return [];
        return parsedPostSummary.map((item) => {
            const isVideo = item.contentType === 'Video' || (item.pinEngagement?.videoView > 0);
            const contentTypeIcon = isVideo
                ? 'icon-rs-video-large icon-lg color-primary-blue'
                : 'icon-rs-image-large icon-lg color-primary-blue';

            let engagement = [];
            if (isVideo) {
                engagement = [
                    {
                        icon: 'icon-rs-video-mini icon-sm color-secondary-grey',
                        value: numberWithCommas(item.pinEngagement?.videoView || 0),
                        text: 'Video views',
                    },
                    {
                        icon: 'icon-rs-time-mini icon-sm color-secondary-grey',
                        value: formatAvgWatchTime(item.pinEngagement?.averageWatchTime),
                        text: 'Avg watch time',
                    },
                    {
                        icon: 'icon-rs-save-mini icon-sm color-secondary-grey',
                        value: numberWithCommas(item.pinEngagement?.save || 0),
                        text: 'Saves',
                    },
                    {
                        icon: 'icon-rs-email-click-mini icon-sm color-secondary-grey',
                        value: numberWithCommas(item.pinEngagement?.outbound || 0),
                        text: 'Outbound clicks',
                    }
                ];
            } else {
                engagement = [
                    {
                        icon: 'icon-rs-social-pinterest-mini icon-sm color-secondary-grey',
                        value: numberWithCommas(item.pinEngagement?.pinClick || 0),
                        text: 'Pin clicks',
                    },
                    {
                        icon: 'icon-rs-save-mini icon-sm color-secondary-grey',
                        value: numberWithCommas(item.pinEngagement?.save || 0),
                        text: 'Saves',
                    },
                    {
                        icon: 'icon-rs-email-click-mini icon-sm color-secondary-grey',
                        value: numberWithCommas(item.pinEngagement?.outbound || 0),
                        text: 'Outbound clicks',
                    }
                ];
            }

            const pubDate = item.publishedDate || item.date;
            const formattedPublishedDate = pubDate && pubDate !== '0001-01-01T00:00:00'
                ? moment(pubDate).format('ddd, MMM DD, YYYY, HH:mm')
                : 'N/A';

            return {
                postsTitle: item.postTitle || 'N/A',
                publishedDate: formattedPublishedDate,
                contentTypeIcon,
                reach: item.reach || 0,
                engagement,
                conversion: item.conversion || 0,
            };
        });
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
            field: 'pinClick',
            title: 'Pin Clicks',
            className: 'text-end',
            headerClassName: 'text-end',
            width: 120,
            cell: ({ dataItem }) => <td className="text-end">{numberWithCommas(dataItem.pinClick || 0)}</td>,
        },
        {
            field: 'save',
            title: 'Saves',
            className: 'text-end',
            headerClassName: 'text-end',
            width: 120,
            cell: ({ dataItem }) => <td className="text-end">{numberWithCommas(dataItem.save || 0)}</td>,
        },
        {
            field: 'outbound',
            title: 'Outbound Clicks',
            className: 'text-end',
            headerClassName: 'text-end',
            width: 120,
            cell: ({ dataItem }) => <td className="text-end">{numberWithCommas(dataItem.outbound || 0)}</td>,
        },
    ], []);

    const RAW_DATA_COLUMNS = useMemo(() => {
        const baseColumns = [
            {
                field: 'date',
                title: 'Date',
                width: 150,
                cell: ({ dataItem }) => (
                    <td>{dataItem.date && dataItem.date !== '0001-01-01T00:00:00' ? moment(dataItem.date).format('MMM DD') : 'N/A'}</td>
                ),
            },
            {
                field: 'reach',
                title: 'Impressions',
                className: 'text-end',
                headerClassName: 'text-end',
                width: 120,
                cell: ({ dataItem }) => <td className="text-end">{numberWithCommas(dataItem.reach || 0)}</td>,
            }
        ];

        if (isVideoCampaign) {
            baseColumns.push(
                {
                    field: 'videoView',
                    title: 'Video views',
                    className: 'text-end',
                    headerClassName: 'text-end',
                    width: 120,
                    cell: ({ dataItem }) => <td className="text-end">{numberWithCommas(dataItem.videoView || 0)}</td>,
                },
                {
                    field: 'averageWatchTime',
                    title: 'Avg watch time',
                    className: 'text-end',
                    headerClassName: 'text-end',
                    width: 150,
                    cell: ({ dataItem }) => {
                        return <td className="text-end">{formatAvgWatchTime(dataItem.averageWatchTime)}</td>;
                    },
                }
            );
        } else {
            baseColumns.push(
                {
                    field: 'pinClick',
                    title: 'Pin clicks',
                    className: 'text-end',
                    headerClassName: 'text-end',
                    width: 120,
                    cell: ({ dataItem }) => <td className="text-end">{numberWithCommas(dataItem.pinClick || 0)}</td>,
                }
            );
        }

        baseColumns.push(
            {
                field: 'save',
                title: 'Saves',
                className: 'text-end',
                headerClassName: 'text-end',
                width: 120,
                cell: ({ dataItem }) => <td className="text-end">{numberWithCommas(dataItem.save || 0)}</td>,
            },
            {
                field: 'outbound',
                title: 'Outbound clicks',
                className: 'text-end',
                headerClassName: 'text-end',
                width: 120,
                cell: ({ dataItem }) => <td className="text-end">{numberWithCommas(dataItem.outbound || 0)}</td>,
            },
            {
                field: 'engagement',
                title: 'Engagement',
                className: 'text-end',
                headerClassName: 'text-end',
                width: 120,
                cell: ({ dataItem }) => <td className="text-end">{numberWithCommas(dataItem.engagement || 0)}</td>,
            },
            {
                field: 'engagementRate',
                title: 'Eng. rate',
                className: 'text-end',
                headerClassName: 'text-end',
                width: 120,
                cell: ({ dataItem }) => {
                    const rate = dataItem.engagementRate || 0;
                    return <td className="text-end">{rate.toFixed(1)}%</td>;
                },
            }
        );

        return baseColumns;
    }, [isVideoCampaign]);

    const POST_SUMMARY_COLUMNS = useMemo(() => [
        {
            field: 'postsTitle',
            title: 'Posts title',
            width: 350,
            cell: ({ dataItem }) => (
                <td>
                    <div>
                        <p className="m0 font-weight-bold">{dataItem?.postsTitle}</p>
                        <small className="text-muted">Published: {dataItem?.publishedDate}</small>
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
                    <i className={`${dataItem?.contentTypeIcon} cursor-default`}></i>
                </td>
            ),
        },
        {
            field: 'reach',
            title: 'Reach / Impressions',
            className: 'text-end',
            headerClassName: 'text-end',
            width: 120,
            cell: ({ dataItem }) => <td className="text-end">{numberWithCommas(dataItem.reach || 0)}</td>,
        },
        {
            field: 'engagement',
            title: 'Engagement',
            width: 250,
            cell: ({ dataItem }) => (
                <td>
                    <div className="d-flex flex-column align-items-start pl10">
                        {dataItem?.engagement?.map((item, index) => (
                            <div key={index} className="d-flex align-items-center mb10" title={item.text}>
                                <i className={`${item.icon} mr5 cursor-default`}></i>
                                <small>{item.value} {item.text}</small>
                            </div>
                        ))}
                    </div>
                </td>
            ),
        },
        {
            field: 'conversion',
            title: 'Conversion',
            className: 'text-end',
            headerClassName: 'text-end',
            width: 120,
            cell: ({ dataItem }) => <td className="text-end">{numberWithCommas(dataItem.conversion || 0)}</td>,
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
                                chartHeading="Reach"
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
                                ]}
                                className="rs-tabs row"
                                componentClassName={'mt30'}
                                expandView
                                expandIcon={() => setIsChartExpanded(!isChartExpanded)}
                                isChartExpanded={isChartExpanded}
                                hideTabs={true}
                            />
                        </Col>
                        <Col md={4} className="pinterest-keymetrics-wrapper">
                            <KeyMetricsNew data={pinterestKeyMetrics} middleDataHeader={false} />
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
                                                key="overall_engagement_chart"
                                                options={areasplineChartOptions(overallEngagementChartData)}
                                            />
                                        ),

                                    },
                                    {
                                        id: 'Impact_on_page_likes ',
                                        text: 'Impact on page likes ',
                                        textClass: 'font-sm',
                                        component: () => (
                                            <RSHighchartsContainer
                                                key="impact_engagement_chart"
                                                options={columnChartOptions(impactEngagementChartData)}
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
                                    <h4>Conversion</h4>
                                </div>
                                <div className="portlet-body">
                                    <RSHighchartsContainer
                                        key="conversion_performance_chart"
                                        options={columnChartOptions(conversionChartData)}
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

                    <Row>
                        <Col md={12}>
                            <div className="portlet-container">
                                <div className="portlet-header">
                                    <h4>Raw data — {isVideoCampaign ? 'Video pin' : 'Image pin'} {formattedDateRange}</h4>
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


                </div>
            </Container>
        </GlobalStateReportEmail.Provider>
    );
};

export default SocialAnalyticsPinterest;
