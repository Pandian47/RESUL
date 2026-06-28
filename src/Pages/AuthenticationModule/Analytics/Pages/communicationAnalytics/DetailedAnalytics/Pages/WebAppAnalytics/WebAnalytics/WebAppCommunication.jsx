import { ch_facebook, ch_tuesday } from 'Constants/GlobalConstant/Colors/colorsVariable';
import { hasNonZeroEngagementData, hasNonZeroPieChartSeriesData } from 'Utils/modules/charts';
import { getChannelId } from 'Utils/modules/communicationChannels';
import { getYYMMDD } from 'Utils/modules/dateTime';
import { KeyMetricsNew, OverviewGrid, OverviewList } from '../../../Components';
import { COMMUNICATION_PERFORMANCE, KEYWORD_RANKING_GRID_COLUMN_DATA, KEYWORD_RANKING_GRID_DATA, areachangeToBase64, changeToBase64, defaultValues, getDaywiseChartData, getLocationDetails, getPreviewData, handleChannelInfo, pieChartOption } from '../../../constants';
import { areasplineChartOptions, columnChartOptions, mapChartOptions, mapTopoChartOptions, pieChartOptions, variablePieChartOptions } from 'Constants/Charts';
import { expand_large, user_mini } from 'Constants/GlobalConstant/Glyphicons';
import { createContext, useEffect, useMemo, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';

import RSHighchartsContainer from 'Components/Highcharts';
import KendoGrid from 'Components/RSKendoGrid';
import RSChartTabbar from 'Components/RSChartTabber';
import ClickMapModal from '../../../Components/ClickMapModal';
import LinksCsvModal from '../../../Components/LinksCsvModal';
import RSModal from 'Components/RSModal';
import BootstrapDropdown from 'Components/FormFields/RSBootstrapdown';
import { MapChartSkeleton, DetailKeyMetricSkeleton } from 'Components/Skeleton/Skeleton';
import { keyMetrixData, overview_data } from '../data';
import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';
import { VISITORS_DURATION_GRID } from './Constants';
import { useDispatch, useSelector } from 'react-redux';

import { parseAnalyticsJson, parseAnalyticsJsonArray } from 'Pages/AuthenticationModule/Analytics/analyticsDefaults';
import useQueryParams from 'Hooks/useQueryParams';
import { getSessionId } from 'Reducers/globalState/selector';
import { DetailAnalyticsChannelPortletLoader, ListAqusitionSekelton, ColumnChartSkeletonNew, PieChartSkeleton } from 'Components/Skeleton/Skeleton';
import { GetAnalyticsUser_Journey } from 'Reducers/analytics/details/request';
import CustomerJourneyFlow from 'Components/CustomerJourneyFlow';
import RSTooltip from 'Components/RSTooltip';

const sampleApiData = {
    dimensions: [
        {
            dimension: 'Email',
            entry_count: 4,
            steps: [
                {
                    drop_offs: 3,
                    label: 'Starting pages',
                    step: 0,
                    transitions: [
                        {
                            count: 1,
                            from: 'https://conversionv5.resulticks.net/?resulid=aSWRXwyYTl8ZW18QV9OUFY2fE8x&utm_source=RESUL&utm_medium=email&utm_campaign=Test%20SDC%20Email%20Web%20Analytics_2a9&fUrl=false',
                            to: 'https://conversionv5.resulticks.net/about-us.html',
                        },
                    ],
                },
                {
                    drop_offs: 0,
                    label: '1st Interaction',
                    step: 1,
                    transitions: [
                        {
                            count: 1,
                            from: 'https://conversionv5.resulticks.net/about-us.html',
                            to: 'https://conversionv5.resulticks.net/home-appliances.html',
                        },
                    ],
                },
                {
                    drop_offs: 0,
                    label: '2nd Interaction',
                    step: 2,
                    transitions: [
                        {
                            count: 1,
                            from: 'https://conversionv5.resulticks.net/home-appliances.html',
                            to: 'https://conversionv5.resulticks.net/contact.html',
                        },
                    ],
                },
            ],
        },
        {
            dimension: 'SMS',
            entry_count: 3,
            steps: [
                {
                    drop_offs: 2,
                    label: 'Starting pages',
                    step: 0,
                    transitions: [
                        {
                            count: 1,
                            // Same pathname (/) but different query params - should create branch
                            from: 'https://conversionv5.resulticks.net/?resulid=aSWRXwyYTl8ZW18QV9OUFY2fE8x&utm_source=RESUL&utm_medium=email&utm_campaign=Test%20SDC%20Email%20Web%20Analytics_2a9&fUrl=false',
                            "to": "https://conversionv5.resulticks.net/home-appliances.html?resulid=aSWRXwyYTl8c218QV9OUFY2fE8x&utm_source=RESUL&utm_medium=email&utm_campaign=Test%20SDC%20Email%20Web%20Analytics_2a9&fUrl=false%22"
                        },
                    ],
                },
                {
                    drop_offs: 1,
                    label: '1st Interaction',
                    step: 1,
                    transitions: [],
                },
                {
                    drop_offs: 0,
                    label: '2nd Interaction',
                    step: 2,
                    transitions: [],
                },
            ],
        },
    ],
    step_summary: [
        {
            drop_offs: 0,
            label: 'Starting pages',
            step: 0,
            visits: 7,
        },
        {
            drop_offs: 5,
            label: '1st Interaction',
            step: 1,
            visits: 2,
        },
        {
            drop_offs: 1,
            label: '2nd Interaction',
            step: 2,
            visits: 1,
        },
        {
            drop_offs: 0,
            label: '3rd Interaction',
            step: 3,
            visits: 1,
        },
    ],
};
export const GlobalStateReportEmail = createContext();

const WebAnalytics = ({ splitItem = 'Split A', type = 'post', channelName }) => {
    const dispatch = useDispatch();
    const locationData = useQueryParams('/analytics/detail-analytics');
    const isWinnerSplit = locationData?.iswinnerSplit;
    const isWinnerSplitType = locationData?.iswinnerSplitType;
    const { analyticsDetatils } = useSelector(({ analyticsListingReducer }) => analyticsListingReducer);
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const channelId = getChannelId(type)?.id;
    const { overviewDetail, channelDetail, segmentDetail, fromSplitHeader, isLoading } = useSelector(
        ({ analyticsDetails }) => analyticsDetails,
    );

    const [pageInitialValue, setPageInitialValue] = useState({
        take: 5,
        skip: 0,
        pageSize: 5,
        initialPagination: false,
    });

    const [byDevicePageInitialValue, setByDevicePageInitialValue] = useState({
        take: 5,
        skip: 0,
        initialPagination: false,
    });

    const [byBrowserPageInitialValue, setByBrowserPageInitialValue] = useState({
        take: 5,
        skip: 0,
        initialPagination: false,
    });


    const [ch_data, setCh_data] = useState({
        st_pie_structure: {
            series: [],
        },
    });

    const [ch_data_browser, setCh_data_browser] = useState({
        st_pie_structure: {
            series: [],
        },
    });

    const [ch_data_duration, setCh_data_duration] = useState({
        area_structure: {
            height: 310,
            xAxis: {
                title: 'Date',
                tickInterval: 2
            },
            yAxis: {
                title: 'Count'
            },
            categories: ['', ''],
            series: [
                {
                    name: '',
                    data: [800, 750, 900, 450, 1250, 1800, 1750, 900, 1450, 1250],
                    // color: ch_tuesday
                },
                {
                    name: '',
                    data: [800, 750, 900, 450, 1250, 1800, 1750, 900, 1450, 1250],
                    // color: ch_facebook
                }
            ]
        }
    });

    const [getStartData, setGetStartData] = useState([])
    const [userJourneyData, setUserJourneyData] = useState(null);
    const [isUserJourneyLoading, setIsUserJourneyLoading] = useState(false);
    const [isUserJourneyExpanded, setIsUserJourneyExpanded] = useState(false);



    const handlePageChange = (data) => {
        const nextState = data?.dataState ? data.dataState : data;
        const nextTake = nextState?.take ?? pageInitialValue?.take ?? 5;
        const nextSkip = nextState?.skip ?? 0;

        // Update page config for grid display
        setPageInitialValue({ skip: nextSkip, take: nextTake, pageSize: nextTake, initialPagination: false });
    };

    const handlePageChangeBydevice = (data) => {
        const nextState = data?.dataState ? data.dataState : data;
        const nextTake = nextState?.take ?? pageInitialValue?.take ?? 5;
        const nextSkip = nextState?.skip ?? 0;

        // Update page config for grid display
        setByDevicePageInitialValue({ skip: nextSkip, take: nextTake, initialPagination: false });
    };

    const handlePageChangeBybrowser = (data) => {
        const nextState = data?.dataState ? data.dataState : data;
        const nextTake = nextState?.take ?? pageInitialValue?.take ?? 5;
        const nextSkip = nextState?.skip ?? 0;

        // Update page config for grid display
        setByBrowserPageInitialValue({ skip: nextSkip, take: nextTake, initialPagination: false });
    };


    const {
        reach,
        engagement,
        conversion,
        keyMetrics,
        country_metrics,
        browser_metrics,
        device_metrics,
        jobDateTime,
        reachPerformanceJson,
        reachPerformanceHrsJson,
        enagegementPerformanceJson,
        enagegementPerformanceHrsJson,
        conversionPerformanceJson,
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
        topBrowser,
        topBrowserValue,
        duration_table,
        trafficBreakdowntablelist,
        userinteractionflow,
        visitorfrequencysession,
        visitorrecencysession,
        visitorsbydevice,
        visitorsbybrowser,
    } = overviewDetail || defaultValues();

    const parsedTrafficBreakdown = useMemo(() => {
        if (!trafficBreakdowntablelist) return {};
        return typeof trafficBreakdowntablelist === 'string'
            ? parseAnalyticsJson(trafficBreakdowntablelist, {})
            : parseAnalyticsJson(trafficBreakdowntablelist, {});
    }, [trafficBreakdowntablelist]);

    const parsedUserInteractionFlow = useMemo(() => {
        if (!userinteractionflow) return [];
        const raw =
            typeof userinteractionflow === 'string'
                ? parseAnalyticsJsonArray(userinteractionflow, [])
                : userinteractionflow;
        if (!Array.isArray(raw)) return [];
        return raw.map((it) => ({
            step_Name: `Step ${it?.step}`,
            visits: it?.visit_count ?? 0,
            drop_Offs: it?.drop_off ?? 0,
            ...it,
        }));
    }, [userinteractionflow]);

    const parsedVisitorFrequency = useMemo(() => {
        if (!visitorfrequencysession) return [];
        return typeof visitorfrequencysession === 'string'
            ? parseAnalyticsJsonArray(visitorfrequencysession, [])
            : Array.isArray(visitorfrequencysession)
                ? visitorfrequencysession
                : [];
    }, [visitorfrequencysession]);

    const parsedVisitorRecency = useMemo(() => {
        if (!visitorrecencysession) return [];
        return typeof visitorrecencysession === 'string'
            ? parseAnalyticsJsonArray(visitorrecencysession, [])
            : Array.isArray(visitorrecencysession)
                ? visitorrecencysession
                : [];
    }, [visitorrecencysession]);

    const parsedDeviceMetricsData = useMemo(() => {
        if (!visitorsbydevice) return [];
        const data =
            typeof visitorsbydevice === 'string'
                ? parseAnalyticsJson(visitorsbydevice, {})
                : visitorsbydevice ?? {};
        const types = DeviceType_s?.split('|') || [];
        const percentages = device_percentage?.split('|') || [];
        return types.map((type, idx) => ({
            browser: type,
            name: type,
            users: percentages[idx] || 0,
            y: Number(percentages[idx]) || 0,
        }));
    }, [visitorsbydevice]);

    const parsedBrowserMetricsData = useMemo(() => {
        if (!visitorsbybrowser) return [];
        const data =
            typeof visitorsbybrowser === 'string'
                ? parseAnalyticsJson(visitorsbybrowser, {})
                : visitorsbybrowser ?? {};
        const browsers = DeviceBrowserName_s?.split('|') || [];
        const percentages = device_browser_percentage?.split('|') || [];
        return browsers.map((browser, idx) => ({
            browser: browser,
            name: browser,
            users: percentages[idx] || 0,
            y: Number(percentages[idx]) || 0,
        }));
    }, [visitorsbybrowser]);

    useEffect(() => {

        if (parsedDeviceMetricsData?.length > 0) {
            setCh_data({
                ...ch_data,
                st_pie_structure: {
                    series: parsedDeviceMetricsData
                }
            })
        } else if (overviewDetail?.device_metrics) {
            const pie_structure = {
                series: overviewDetail?.device_metrics.map((item) => ({
                    name: item?.channel || item?.name || item?.label || 'Unknown',
                    y: Number(item?.users || item?.count || item?.value || item?.y || item?.page_views || 0),
                }))
            }
            setCh_data({
                ...ch_data,
                st_pie_structure: pie_structure
            })
        }

        if (parsedBrowserMetricsData?.length > 0) {
            setCh_data_browser({
                ...ch_data_browser,
                st_pie_structure: {
                    series: parsedBrowserMetricsData
                }
            })
        } else if (overviewDetail?.browser_metrics) {
            const pie_structure = {
                series: overviewDetail?.browser_metrics.map((item) => ({
                    name: item?.channel || item?.name || item?.label || 'Unknown',
                    y: Number(item?.users || item?.count || item?.value || item?.y || item?.page_views || 0),
                }))
            }
            setCh_data_browser({
                ...ch_data_browser,
                st_pie_structure: pie_structure
            })
        };



    }, [overviewDetail?.device_metrics, overviewDetail?.browser_metrics, parsedDeviceMetricsData, parsedBrowserMetricsData]);


    const performanceBenchmark = useMemo(() => {
        const chart = overviewDetail?.duration_table;

        // If duration_table is provided as an array of { duration_Range, sessions, page_views }
        if (Array.isArray(chart)) {
            const categories = chart.map((it) => it.duration_Range ?? it.range ?? it.label ?? '');
            const sessionsSeries = {
                name: 'Sessions',
                data: map((it) => Number(it.sessions ?? it.session_count ?? it.count ?? 0)),
            };
            const pageViewsSeries = {
                name: 'Page views',
                data: map((it) => Number(it.page_views ?? it.pageViews ?? 0)),
            };

            return {
                categories,
                xAxis: {
                    title: '',
                    labels: false,
                },
                yAxis: {
                    title: '',
                    showAsPercentage: false,
                },
                tooltip: {
                    percent: false,
                    isBenchmark: true,
                },
                legend: {
                    enabled: false,
                },
                series: [sessionsSeries, pageViewsSeries],
            };
        }

        // Otherwise, expect existing structured object with series and categories
        const chartSeries = chart?.series || [];
        const chartData = {
            categories: chart?.categories,
            xAxis: {
                title: '',
                labels: false,
            },
            yAxis: {
                title: '',
                showAsPercentage: true,
            },
            tooltip: {
                percent: true,
                isBenchmark: true,
            },
            legend: {
                enabled: false,
            },
            series: Array.isArray(chartSeries)
                ? chartSeries.map((bench) => ({
                    name: bench.name,
                    data: (bench.data || []).map((val) => +val),
                    color: bench.color,
                }))
                : [],
        };
        return chartData;
    }, [overviewDetail?.duration_table]);

    // Convert duration_table array to reach-style JSON string so we can reuse changeToBase64/areachangeToBase64 helpers


    const processedDurationTable = useMemo(() => {
        if (!Array.isArray(duration_table) || duration_table.length === 0) {
            return VISITORS_DURATION_GRID.data || [];
        }
        return duration_table.map((item, idx) => ({
            duration_Range:
                item.duration_Range ?? item.durationRange ?? item.duration_range ?? item.range ?? item.label ?? `Range ${idx + 1}`,
            sessions: item.sessions ?? item.session_count ?? item.count ?? item.sessions_count ?? 0,
            page_views:
                item.page_views ?? item.pageViews ?? item.page_views_count ?? item.pageViewsCount ?? 0,
            ...item,
        }));
    }, [duration_table]);

    // Reset pagination to show 5 items initially when data changes
    useEffect(() => {
        if (Array.isArray(processedDurationTable) && processedDurationTable.length > 0) {
            setPageInitialValue({
                take: 5,
                skip: 0,
                pageSize: 5,
                initialPagination: true,
            });
            // Reset initialPagination flag after a brief delay to allow grid to process
            const timer = setTimeout(() => {
                setPageInitialValue(prev => ({
                    ...prev,
                    initialPagination: false,
                }));
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [duration_table]);

    const durationPerformanceJson = useMemo(() => {
        const raw = processedDurationTable || [];
        if (!Array.isArray(raw) || raw.length === 0) return '';

        const categories = raw.map((it) => it.duration_Range ?? it.range ?? it.label ?? '');
        const sessions = raw.map((it) => Number(it.sessions ?? it.session_count ?? it.count ?? 0));
        const pageViews = raw.map((it) => Number(it.page_views ?? it.pageViews ?? 0));

        const payload = {
            height: 335,
            categories,
            legend: {},
            series: [
                { name: 'Sessions', datas: sessions, colorCode: '', chartType: 'column' },
                { name: 'Page views', datas: pageViews, colorCode: '', chartType: 'column' },
            ],
        };

        return JSON.stringify(payload);
    }, [processedDurationTable]);

    const processedCountryMetrics = useMemo(() => {
        const raw = country_metrics || [];

        if (!Array.isArray(raw) || raw.length === 0) return [];
        return raw.map((it, i) => {
            // Properly convert lat and lon to numeric values
            const latValue = it?.lat ?? it?.latitude ?? null;
            const lonValue = it?.lon ?? it?.long ?? it?.longitude ?? null;

            // Convert to number, handling string numbers, null, undefined, and invalid values
            const lat = latValue !== null && latValue !== undefined && latValue !== ''
                ? (typeof latValue === 'string' ? parseFloat(latValue) : Number(latValue))
                : 0;
            const lon = lonValue !== null && lonValue !== undefined && lonValue !== ''
                ? (typeof lonValue === 'string' ? parseFloat(lonValue) : Number(lonValue))
                : 0;

            // Ensure the values are valid numbers (not NaN)
            const finalLat = isNaN(lat) ? 0 : lat;
            const finalLon = isNaN(lon) ? 0 : lon;

            return {
                Country: it.country_s ? it.country_s : '',
                Latitude: finalLat,
                Longitude: finalLon,
                City: it.city ? it.city : '',
                State: it.state ? it.state : '',
                // ...it,
            };
        });
    }, [country_metrics]);



    const proceedByDevicePageChange = useMemo(() => {
        const raw = device_metrics || [];
        if (!Array.isArray(raw) || raw.length === 0) return [];
        return raw.map((it, i) => ({
            browser: it.browser ?? it.name ?? it.label ?? `Browser ${i + 1}`,
            users: it.users ?? it.count ?? it.value ?? it.y ?? 0,
            engagement: it.engagement ?? it.eng ?? it.rate ?? 0,
            ...it,
        }));
    }, [device_metrics]);

    const proceedByBrowserPageChange = useMemo(() => {
        const raw = browser_metrics || [];
        if (!Array.isArray(raw) || raw.length === 0) return [];
        return raw.map((it, i) => ({
            browser: it.browser ?? it.name ?? it.label ?? `Browser ${i + 1}`,
            users: it.users ?? it.count ?? it.value ?? it.y ?? 0,
            engagement: it.engagement ?? it.eng ?? it.rate ?? 0,
            ...it,
        }));
    }, [browser_metrics]);

    const [filterDetails, setFilterDetails] = useState({});
    const [isChartExpanded, setIsChartExpanded] = useState(false);
    const [states, setState] = useState({
        isLinkClickCSVModal: false,
        isCampaignCSVModal: false,
        isClickMapModal: false,
        isOverviewPreviewModal: false,
        previewData: '',
        imagePath: '',
        date: '',
        subject: '',
        carouselJSON: '',
        isCarousel: false,
        header: '',
        footer: '',
        footerContent: '',
        senderName: '',
        com_status: '',
    });

    const processedFunnelSummary = useMemo(() => {
        const rawSummary = userJourneyData?.step_summary;
        const raw = (Array.isArray(rawSummary) && rawSummary.length > 0) ? rawSummary : parsedUserInteractionFlow;

        if (!Array.isArray(raw) || raw.length === 0) return [];
        return raw.map((it, i) => ({
            step_Name: it.label ?? it.step_Name ?? it.stepName ?? `Step ${i + 1}`,
            visits: it.visits ?? it.visit_count ?? it.value ?? 0,
            drop_Offs: it.drop_offs ?? it.drop_off ?? it.drop_Offs ?? it.dropOffs ?? 0,
            ...it,
        }));
    }, [userJourneyData, parsedUserInteractionFlow]);

    const funnelChartData = useMemo(() => {
        return processedFunnelSummary.map((s) => [s.step_Name, `${Number(s.visits || 0)} mb`]);
    }, [processedFunnelSummary]);
    const { isCampaignCSVModal, isLinkClickCSVModal, isClickMapModal, isOverviewPreviewModal, previewData, imagePath, date, subject, carouselJSON, isCarousel, header, footer, footerContent, senderName, com_status } = states;
    const dateField = jobDateTime;

    useEffect(() => {

        if (dateField) {
            let getDate = getYYMMDD(dateField);
            setGetStartData(getDate);
        }
    }, [dateField])
    useEffect(() => {
        if (channelDetail?.campaignID) {
            handleOnselectUIF('Country');
        }
    }, [channelDetail?.campaignID])

    const handlePreviewDetails = async (data) => {
        const currentBlastId = filterDetails?.blastShortCode || analyticsDetatils?.blastId || locationData?.blastId;
        const channelInfo = channelDetail?.isSplitEnabled ? channelDetail?.splitChannelLevelInfo : channelDetail?.channelInfos;
        const currentChannelInfo = channelInfo?.find(
            (info) => info.blastShortCode === currentBlastId
        );
        const getWinnerChannel_Detaild = handleChannelInfo(channelDetail, locationData);
        const channelDetailId = currentChannelInfo?.channelDetailid || 0;
        let getWinnerChannelDetaild = getWinnerChannel_Detaild[0]?.channelDetailid || channelDetailId;

        let payload = {
            departmentId,
            clientId,
            userId,
            campaignId: channelDetail?.campaignID,
            blastId: currentBlastId,
            channelId: analyticsDetatils?.channelId || locationData?.channelId,
            channelDetailId: getWinnerChannelDetaild,
        };

        getPreviewData(dispatch, setState, payload, data, channelDetail);
    };


    const handleOnselectUIF = async (data) => {
        // When user changes the filter, reset current journey and show skeleton
        setIsUserJourneyLoading(true);
        setUserJourneyData(null);

        const payload = {
            departmentId,
            clientId,
            campaignId: channelDetail?.campaignID,
            startDate: channelDetail?.startDate ? getYYMMDD(channelDetail?.startDate) : '',
            filter: data,
            text: false, // API expects text flag as false for this view
            channelId: analyticsDetatils?.channelId || locationData?.channelId,
        };

        try {
            const response = await dispatch(GetAnalyticsUser_Journey({ payload }));

            // The HTTP utility returns data, which is the API response
            // Response structure should be: { status: true, data: "JSON_STRING" }
            if (response && response.status) {
                let dataToParse = response?.data;

                // Handle case where data might be a JSON string
                if (typeof dataToParse === 'string') {
                    try {
                        // Remove any trailing newlines or whitespace
                        dataToParse = dataToParse.trim();
                        const parsedData = parseAnalyticsJson(dataToParse, {});
                        setUserJourneyData(parsedData);
                    } catch (parseError) {
                        setUserJourneyData(null);
                    }
                } else if (dataToParse && typeof dataToParse === 'object') {
                    // Data is already an object
                    setUserJourneyData(dataToParse);
                } else {
                    setUserJourneyData(null);
                }
            } else {
                setUserJourneyData(null);
            }
        } catch (error) {
            setUserJourneyData(null);
        } finally {
            setIsUserJourneyLoading(false);
        }
    };

    return (
        <div className={`page-content ${true ? 'download-page-setup-detail' : ''}`}>
            <Container className='px0'>
                {fromSplitHeader || Object.keys(overviewDetail || {})?.length > 0 ? (
                    <div className="rs-csr-wrapper">
                        <OverviewGrid
                            // infoIcon={true}
                            campaignId={locationData?.campaignId}
                            channelType={channelName || type}
                            channelId={locationData?.channelId}
                            isTime={true}
                            date={dateField}
                            handlePreviewDetails={(data) => {
                                if (data) handlePreviewDetails('overview');
                            }}
                            isPreview={false}
                        />
                        <OverviewList dataObj={overview_data(reach, engagement, conversion)} />

                        <Row>
                            <div className="portlet-heading">
                                <h3>{COMMUNICATION_PERFORMANCE}</h3>
                            </div>
                            <Col md={8} className="position-relative">
                                <RSChartTabbar
                                    dynamicTab={`mb0 mini`}
                                    defaultClass={`tabTransparent pt0`}
                                    activeClass={`active`}
                                    footer
                                    tabData={[
                                        {
                                            id: 'reach',
                                            text: 'Reach',
                                            textClass: 'font-sm',
                                            component: () => {
                                                const chartData =
                                                    reachPerformanceJson && hasNonZeroEngagementData(reachPerformanceJson)
                                                        ? changeToBase64(
                                                            reachPerformanceJson,
                                                            'area',
                                                        )
                                                        : null;

                                                if (!chartData || Object.keys(chartData).length === 0 || isLoading) {
                                                    return <ListAqusitionSekelton isChartSkeleton isCustom isError={!isLoading} disableLegendAnimation />;
                                                }
                                                return (
                                                    <RSHighchartsContainer
                                                        type="columnChart"
                                                        options={columnChartOptions(chartData)}
                                                    />
                                                );
                                            },
                                            footer: <ul></ul>,
                                        },
                                        {
                                            id: 'engagement',
                                            text: 'Engagement',
                                            textClass: 'font-sm',
                                            component: () => {
                                                const chartData =
                                                    enagegementPerformanceJson && hasNonZeroEngagementData(enagegementPerformanceJson)
                                                        ? changeToBase64(
                                                            enagegementPerformanceJson,
                                                            'area',
                                                        )
                                                        : {};
                                                if (!chartData || Object.keys(chartData).length === 0 || isLoading) {
                                                    return <ListAqusitionSekelton isChartSkeleton isCustom isError={!isLoading} disableLegendAnimation />;
                                                }
                                                return (
                                                    <RSHighchartsContainer
                                                        type="area"
                                                        key={'engagement'}
                                                        options={areasplineChartOptions(chartData, null)}
                                                    />
                                                );
                                            },
                                            footer: <></>,
                                        },

                                    ]}
                                    className="rs-tabs row"
                                    componentClassName={'mt30'}
                                />
                            </Col>
                            <Col md={4} className={isLoading ? 'portlet-container' : ''}>
                                {isLoading ? (
                                    <div className="portlet-body position-relative">
                                        <DetailKeyMetricSkeleton hideInternalNoData />

                                    </div>) : (
                                    <KeyMetricsNew
                                        data={
                                            keyMetrics !== undefined && keyMetrics !== null
                                                ? keyMetrixData({ ...keyMetrics, duration_table }, filterDetails?.isCG, channelDetail?.campaignType === 'T')
                                                : []
                                        }
                                        pdfDownload={isChartExpanded}
                                        isChartExpanded={isChartExpanded}
                                    />
                                )}
                            </Col>
                        </Row>

                        {Object.keys(parsedTrafficBreakdown).length > 0 && (
                            <Row>
                                <Col md={12}>
                                    <RSChartTabbar
                                        dynamicTab={`mb0 mini`}
                                        defaultClass={`tabTransparent pt0`}
                                        activeClass={`active`}
                                        chartHeading="Traffic breakdown"
                                        autoHeight
                                        tabData={Object.keys(parsedTrafficBreakdown).map((res, idx) => ({
                                            id: res,
                                            text: res,
                                            textClass: 'font-sm',
                                            component: () => (
                                                <div className="portlet-body" key={idx}>
                                                    <KendoGrid
                                                        data={parsedTrafficBreakdown[res] || []}
                                                        column={[
                                                            {
                                                                field: 'source_or_medium',
                                                                title: 'Source/medium',
                                                                width: 200,
                                                                cell: ({ dataItem }) => (
                                                                    <td>
                                                                        {dataItem?.source_or_medium?.length > 40 ? (
                                                                            <RSTooltip text={dataItem?.source_or_medium} position="top">
                                                                                <span>{dataItem?.source_or_medium?.substring(0, 40)}...</span>
                                                                            </RSTooltip>
                                                                        ) : (
                                                                            <span>{dataItem?.source_or_medium}</span>
                                                                        )}
                                                                    </td>
                                                                ),
                                                            },
                                                            {
                                                                field: 'no_of_sessions',
                                                                title: 'Sessions',
                                                                width: 100,
                                                                className: 'text-end',
                                                            },
                                                            {
                                                                field: 'new_session_percentage',
                                                                title: '% New sessions',
                                                                width: 120,
                                                                className: 'text-end',
                                                                cell: ({ dataItem }) => (
                                                                    <td className="text-end">
                                                                        {dataItem?.new_session_percentage}%
                                                                    </td>
                                                                ),
                                                            },
                                                            {
                                                                field: 'new_users',
                                                                title: 'New users',
                                                                width: 100,
                                                                className: 'text-end',
                                                            },
                                                            {
                                                                field: 'pages_per_session',
                                                                title: 'Pages/session',
                                                                width: 120,
                                                                className: 'text-end',
                                                            },
                                                            {
                                                                field: 'avg_session_duration',
                                                                title: 'Avg. session duration',
                                                                width: 150,
                                                                className: 'text-end',
                                                            },
                                                        ]}
                                                        scrollable="scrollable"
                                                    />
                                                </div>
                                            ),
                                        }))}
                                        className="rs-tabs row"
                                        componentClassName={'mt30'}
                                    />
                                </Col>
                            </Row>
                        )}

                        {/* 
                        <Row>
                            <Col md={6} className="x-axis-labels-performance">
                        <RSChartTabbar
                            dynamicTab={`mb0 mini`}
                            defaultClass={`tabTransparent pt0`}
                            activeClass={`active`}
                            chartHeading="Visitor count"
                            tabData={['Unique visitors', 'Total visitors'].map((res, idx) => ({
                                id: res,
                                text: res,
                                textClass: 'font-sm',
                                component: () => {
                                    const chartData =
                                        pageByDaysJson !== undefined && pageByDaysJson !== null
                                            ? getDaywiseChartData(pageByDaysJson, 'bubble')
                                            : {};
                                    if (!chartData || Object.keys(chartData).length === 0) {
                                        return <ColumnChartSkeletonNew isError />;
                                    }
                                    return (
                                        <RSHighchartsContainer
                                            type="columnChart"
                                            key={'unique_visitors' + idx}
                                            options={columnChartOptions(chartData || {})}
                                        />
                                    );
                                },
                            }))}
                            gridView={<KendoGrid {...VISITORS_COUNT_GRID} />}
                            className="rs-tabs row"
                            componentClassName={'mt30'}
                        />
                    </Col> */}
                        {/* <Col md={6} className="x-axis-labels-performance">
                                <div className="portlet-heading">
                                    <h3 className="mt0">Average site metrics</h3>
                                </div>
                                <RSChartTabbar
                                    dynamicTab={`mb0 mini`}
                                    defaultClass={`tabTransparent pt0`}
                                    activeClass={`active`}
                                    chartHeading=""
                                    autoHeight
                                    containerClass='portlet-container rs-table-with-heading mb30 overflow-visible'
                                    gridView={
                                        <>
                                            <KendoGrid
                                                data={processedDurationTable}
                                                isCustomClass={processedDurationTable?.length > 4 ? 'pb15 detail-table' : ''}
                                                column={[
                                                    {
                                                        field: 'duration_Range',
                                                        title: 'Session duration',
                                                        width: 80,
                                                        filter: 'text',
                                                        cell: ({ dataItem }) => (
                                                            <td>
                                                                <div>
                                                                    <p>{dataItem?.duration_Range}</p>
                                                                </div>
                                                            </td>
                                                        ),
                                                    },
                                                    {
                                                        field: 'sessions',
                                                        title: 'Sessions',
                                                        width: 80,
                                                        filter: 'text',
                                                        cell: ({ dataItem }) => (
                                                            <td>
                                                                <div>
                                                                    <p>{dataItem?.sessions}</p>
                                                                </div>
                                                            </td>
                                                        ),
                                                    },
                                                    {
                                                        field: 'page_views',
                                                        title: 'Page views',
                                                        width: 80,
                                                        filter: 'text',
                                                        cell: ({ dataItem }) => (
                                                            <td>
                                                                <div>
                                                                    <p>{dataItem?.page_views}</p>
                                                                </div>
                                                            </td>
                                                        ),
                                                    }
                                                ]}
                                                scrollable={false}
                                                settings={{
                                                    total: Array.isArray(processedDurationTable) ? processedDurationTable.length : 0,
                                                }}
                                                isScrollTop={false}
                                                pageable={true}
                                                change={handlePageChange}
                                                pagerChange={pageInitialValue?.initialPagination}
                                                isDataStateRequired={false}
                                                // config={pageInitialValue}
                                                flag={false}
                                            />
                                        </>
                                    }
                                    tabData={[
                                        {
                                            id: 'session_duration',
                                            text: 'Session duration',
                                            textClass: 'font-sm',
                                            component: () => {
                                                // Prepare payload as an object { range: sessions } stringified for getDaywiseChartData
                                                const chartPayload =
                                                    Array.isArray(processedDurationTable) && processedDurationTable.length > 0
                                                        ? JSON.stringify(
                                                            processedDurationTable.reduce((acc, it) => {
                                                                const key = it.duration_Range ?? it.range ?? it.label ?? 'Range';
                                                                acc[key] = Number(it.sessions ?? it.session_count ?? it.count ?? 0);
                                                                return acc;
                                                            }, {}),
                                                        )
                                                        : '';

                                                const chartData = chartPayload ? getDaywiseChartData(chartPayload, 'bubble') : {};

                                                // Prefer our converted duration-style area data (matches reachPerformanceJson shape)
                                                const durationAreaData = durationPerformanceJson
                                                    ? areachangeToBase64(durationPerformanceJson, 'area')
                                                    : {};

                                                if (!durationAreaData || !Array.isArray(durationAreaData?.series) || durationAreaData?.series?.length === 0) {
                                                    return <ListAqusitionSekelton isChartSkeleton isCustom isError disableLegendAnimation />;
                                                }

                                                return (

                                                    <>
                                                        <RSHighchartsContainer
                                                            type="area"
                                                            constructorType="mapChart"
                                                            options={areasplineChartOptions(durationAreaData)}
                                                        />
                                                       
                                                    </>

                                                );
                                            },
                                        },
                                    ]}
                                    className="rs-tabs row"
                                    componentClassName={'mt30'}
                                />
                            </Col> 
                            */}


                        {/* <Col md={6}>
                                <div className="portlet-heading">
                                    <h3 className="mt0">Page user demographics</h3>
                                </div>
                                <div className="portlet-container pfooter">
                                    <div className="portlet-header">
                                        <h4>By location</h4>
                                    </div>
                                    <div className="portlet-body">
                                        {Array.isArray(processedCountryMetrics) && processedCountryMetrics.length > 0 ? (
                                            <RSHighchartsContainer
                                                type="map"
                                                constructorType="mapChart"
                                                // options={mapChartOptions(processedCountryMetrics)}
                                                options={mapTopoChartOptions(
                                                    getLocationDetails(
                                                        processedCountryMetrics
                                                    )
                                                )}
                                            />
                                        ) : (
                                            <MapChartSkeleton isError />
                                        )}
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
                        </Row>
                            */}
                        <Row>
                            <div className="portlet-heading">
                                <h3 className="mt0">User engagement</h3>
                            </div>
                            <Col md={6} className="x-axis-labels-performance">
                                <RSChartTabbar
                                    dynamicTab={`mb0 mini`}
                                    defaultClass={`tabTransparent pt0`}
                                    chartHeading="Visitor frequency"
                                    endIcon
                                    gridView={
                                        <KendoGrid
                                            data={parsedVisitorFrequency}
                                            column={[
                                                { field: 'freq_bucket', title: 'Count of sessions' },
                                                { field: 'users', title: 'Users', className: 'text-end' },
                                                {
                                                    field: 'percentage',
                                                    title: 'Percentage',
                                                    className: 'text-end',
                                                    cell: ({ dataItem }) => (
                                                        <td className="text-end">{dataItem?.percentage}%</td>
                                                    ),
                                                },
                                            ]}
                                        />
                                    }
                                    tabData={[
                                        {
                                            component: () => {
                                                const chartData =
                                                    parsedVisitorFrequency?.length > 0
                                                        ? {
                                                            categories: parsedVisitorFrequency.map((it) => it.date),
                                                            series: [
                                                                {
                                                                    name: 'Users',
                                                                    data: parsedVisitorFrequency.map((it) => Number(it.users)),
                                                                }
                                                            ]
                                                        }
                                                        : {};
                                                if (!chartData || !chartData.series || chartData.series.length === 0) {
                                                    return (
                                                        <ListAqusitionSekelton
                                                            isChartSkeleton
                                                            isCustom
                                                            isError
                                                            disableLegendAnimation
                                                        />
                                                    );
                                                }
                                                return (
                                                    <RSHighchartsContainer
                                                        type="columnChart"
                                                        key={'visitor_frequency'}
                                                        options={columnChartOptions(chartData || {})}
                                                    />
                                                );
                                            },
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
                                    chartHeading="Visitor recency"
                                    endIcon
                                    gridView={
                                        <KendoGrid
                                            data={parsedVisitorRecency}
                                            column={[
                                                { field: 'rec_bucket', title: 'Days since last session', width: 200 },
                                                { field: 'users', title: 'Users', className: 'text-end' },
                                                {
                                                    field: 'percentage',
                                                    title: 'Percentage',
                                                    className: 'text-end',
                                                    cell: ({ dataItem }) => (
                                                        <td className="text-end">{dataItem?.percentage}%</td>
                                                    ),
                                                },
                                            ]}
                                        />
                                    }
                                    tabData={[
                                        {
                                            component: () => {
                                                const chartData =
                                                    parsedVisitorRecency?.length > 0
                                                        ? {
                                                            categories: parsedVisitorRecency.map((it) => it.date),
                                                            series: [
                                                                {
                                                                    name: 'Users',
                                                                    data: parsedVisitorRecency.map((it) => Number(it.users)),
                                                                }
                                                            ]
                                                        }
                                                        : {};
                                                if (!chartData || !chartData.series || chartData.series.length === 0) {
                                                    return (
                                                        <ListAqusitionSekelton
                                                            isChartSkeleton
                                                            isCustom
                                                            isError
                                                            disableLegendAnimation
                                                        />
                                                    );
                                                }
                                                return (
                                                    <RSHighchartsContainer
                                                        type="columnChart"
                                                        key={'visitor_recency'}
                                                        options={columnChartOptions(chartData || {})}
                                                    />
                                                );
                                            },
                                        },
                                    ]}
                                    className="rs-tabs row"
                                    componentClassName={'mt30'}
                                />
                            </Col>
                        </Row>
                        {/* <Row>
                    <div className="portlet-heading">
                        <h3 className="mt0">Page user demographics</h3>
                    </div>
                    <Col md={6}>
                        <div className="portlet-container portlet-md pfooter">
                            <div className="portlet-header">
                                <h4>By location</h4>
                            </div>
                            <div className="portlet-body">
                                {WebAnalyticsData[type]?.[splitItem]?.chartData?.byLocation_map_chartData ? (
                                    <RSHighchartsContainer
                                        constructorType="mapChart"
                                        options={mapChartOptions(
                                            WebAnalyticsData[type][splitItem]?.chartData?.byLocation_map_chartData,
                                        )}
                                    />
                                ) : (
                                    <div>No data available</div>
                                )}
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
                                <h4>By Age</h4>
                            </div>
                            <div className="portlet-body">
                                <div className="progressbar-list">
                                    {byAgeData?.map((item, index) => {
                                        return (
                                            <div className="progressbar" key={index}>
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
                                        <span>52</span>
                                        <small>%</small>
                                    </li>
                                    <li>
                                        User belonging to age group 18-24 has the highest engagement rate which
                                        contributes 42% in overall engagement
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </Col>
                </Row> */}
                        <Row>
                            <Col md={6}>
                                <RSChartTabbar
                                    dynamicTab={`mb0 mini`}
                                    defaultClass={`tabTransparent pt0`}
                                    activeClass={`active`}
                                    chartHeading=""
                                    gridView={
                                        <KendoGrid
                                            // {...VISITORS_DEVICE_BROWSER_GRID}
                                            data={parsedDeviceMetricsData?.length > 0 ? parsedDeviceMetricsData : device_metrics}
                                            column={[
                                                // { field: 'bounce_rate', title: 'Bounce Rate', width: 120 },
                                                // { field: 'bounce_sessions', title: 'Bounce Sessions', width: 120, isTooltip: true },
                                                { field: 'browser', title: 'Device', width: 120 },
                                                // { field: 'page_views', title: 'Page Views', width: 120 },
                                                { field: 'users', title: 'Users', width: 120 },
                                            ]}
                                            scrollable="scrollable"
                                            settings={{
                                                total: parsedDeviceMetricsData?.length > 0 ? parsedDeviceMetricsData.length : (Array.isArray(device_metrics) ? device_metrics.length : 0),
                                            }}
                                            isScrollTop={false}
                                            pageable={true}
                                            change={handlePageChangeBydevice}
                                            pagerChange={byDevicePageInitialValue?.initialPagination}
                                            isDataStateRequired
                                            config={byDevicePageInitialValue}
                                            flag={true}
                                        />
                                    }
                                    tabData={[
                                        {
                                            id: 'by_device',
                                            text: 'By device',
                                            textClass: 'font-sm',
                                            component: () => {
                                                const chartData = ch_data?.st_pie_structure?.series;
                                                if (
                                                    isLoading ||
                                                    !chartData ||
                                                    chartData.length === 0 ||
                                                    !hasNonZeroPieChartSeriesData({ series: chartData })
                                                ) {
                                                    return <PieChartSkeleton isError={!isLoading} />;
                                                }
                                                return (
                                                    // <RSHighchartsContainer
                                                    <RSHighchartsContainer
                                                        type="pie"
                                                        key={'by device'}
                                                        // options={pieChartOptions({series: [{name: 'Android', y: 0}, {name: 'iOS', y: 23}]})} 
                                                        options={pieChartOptions({
                                                            series: ch_data?.st_pie_structure?.series,
                                                            seriesName: 'Percent',
                                                        })}
                                                    // options={pieChartOptions( ch_data?.st_pie_structure)}                                                
                                                    />
                                                    // <PieChart
                                                    //     title={'Opens by device'}
                                                    //     chartData={
                                                    //         Array.isArray(proceedByDevicePageChange) && proceedByDevicePageChange.length > 0
                                                    //             ? pieChartOption(JSON.stringify(proceedByDevicePageChange), 'pieFooter', true)
                                                    //             : {}
                                                    //     }
                                                    //     footerPercent={topDeviceValue}
                                                    //     footerText={`of email have been opened from ${!!topDevice ? topDevice : `Others`
                                                    //         }`}
                                                    // />
                                                );
                                            },
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
                                    gridView={
                                        <KendoGrid
                                            // {...VISITORS_DEVICE_BROWSER_GRID}
                                            data={parsedBrowserMetricsData?.length > 0 ? parsedBrowserMetricsData : browser_metrics}
                                            column={[
                                                // { field: 'bounce_rate', title: 'Bounce Rate', width: 120 },
                                                // { field: 'bounce_sessions', title: 'Bounce Sessions', width: 120, isTooltip: true },
                                                { field: 'browser', title: 'Browser', width: 120 },
                                                // { field: 'page_views', title: 'Page Views', width: 120 },
                                                { field: 'users', title: 'Users', width: 120 },
                                            ]}
                                            scrollable="scrollable"
                                            settings={{
                                                total: parsedBrowserMetricsData?.length > 0 ? parsedBrowserMetricsData.length : (Array.isArray(browser_metrics) ? browser_metrics.length : 0),
                                            }}
                                            isScrollTop={false}
                                            pageable={true}
                                            change={handlePageChangeBybrowser}
                                            pagerChange={byBrowserPageInitialValue?.initialPagination}
                                            isDataStateRequired
                                            config={byBrowserPageInitialValue}
                                            flag={true}
                                        />
                                    }
                                    tabData={[

                                        {
                                            id: 'by_browser',
                                            text: 'By browser',
                                            textClass: 'font-sm',
                                            component: () => {
                                                const chartData = ch_data_browser?.st_pie_structure?.series;
                                                if (
                                                    isLoading ||
                                                    !chartData ||
                                                    chartData.length === 0 ||
                                                    !hasNonZeroPieChartSeriesData({ series: chartData })
                                                ) {
                                                    return <PieChartSkeleton isError={!isLoading} />;
                                                }
                                                return (
                                                    // <RSHighchartsContainer
                                                    //     key={'by_device'}
                                                    //     options={pieChartOptions(chartData)}
                                                    // />

                                                    <RSHighchartsContainer
                                                        type="pie"
                                                        key={'by browser'}
                                                        // options={pieChartOptions({series: [{name: 'Android', y: 0}, {name: 'iOS', y: 23}]})} 
                                                        options={pieChartOptions({
                                                            series: ch_data_browser?.st_pie_structure?.series,
                                                            seriesName: 'Percent',
                                                        })}
                                                    // options={pieChartOptions( ch_data?.st_pie_structure)}                                                
                                                    />

                                                    // <PieChart
                                                    //     title={'Opens by browser'}
                                                    //     chartData={
                                                    //         Array.isArray(proceedByBrowserPageChange) && proceedByBrowserPageChange.length > 0
                                                    //             ? pieChartOption(JSON.stringify(proceedByBrowserPageChange), 'pieFooter', true)
                                                    //             : {}
                                                    //     }
                                                    //     footerPercent={topDeviceValue}
                                                    //     footerText={`of email have been opened from ${!!topDevice ? topDevice : `Others`
                                                    //         }`}
                                                    // />
                                                );
                                            },
                                        },
                                    ]}
                                    className="rs-tabs row"
                                    componentClassName={'mt30'}
                                />
                            </Col>
                            {/* <Col md={6}>
                        <RSChartTabbar
                            dynamicTab={`mb0 mini`}
                            defaultClass={`tabTransparent pt0`}
                            // activeClass={`active`}
                            chartHeading="By interests"
                            endIcon
                            gridView={<KendoGrid {...VISITORS_DEVICE_BROWSER_GRID} />}
                            tabData={[
                                {
                                    id: 'by_interests',
                                    textClass: 'font-sm',
                                    component: () => {
                                        const chartData = WebAnalyticsData[type]?.[splitItem]?.chartData?.byinterests_variablePie_overall_chartData;
                                        if (!chartData) {
                                            return <div>No data available</div>;
                                        }
                                        return (
                                            <RSHighchartsContainer
                                                options={variablePieChartOptions(chartData)}
                                            />
                                        );
                                    },
                                },
                            ]}
                            className="rs-tabs row"
                            componentClassName={'mt30'}
                        />
                    </Col> */}
                        </Row>
                        {/* <Row>
                    <Col md={12}>
                        <RSChartTabbar
                            dynamicTab={`mb0 mini`}
                            defaultClass={`tabTransparent pt0`}
                            activeClass={`active`}
                            chartHeading="Keyword ranking by domain"
                            autoHeight
                            tabData={['Savings', 'Personal loans', 'Tax benefits', 'Credit cards'].map((res, idx) => ({
                                id: res,
                                text: res,
                                textClass: 'font-sm',
                                component: () => (
                                    <div className="portlet-body" key={idx}>
                                        <KendoGrid
                                            data={KEYWORD_RANKING_GRID_DATA}
                                            column={KEYWORD_RANKING_GRID_COLUMN_DATA}
                                            scrollable="scrollable"
                                        />
                                    </div>
                                ),
                            }))}
                            className="rs-tabs row"
                            componentClassName={'mt30'}
                        />
                    </Col>
                </Row> */}

                        <div className="portlet-heading">
                            <h3 className="mt0">User interaction and flow</h3>
                            {/* <CustomerJourneyFlow data={sampleApiData} />; */}


                        </div>

                        <Row>
                            <Col md={12}>
                                <div className="portlet-container">
                                    <div className="portlet-body">
                                        <Row>
                                            <Col md={11}>
                                                <BootstrapDropdown
                                                    // data={['Country/therritory', 'City', 'Channel', 'Social Media', 'Language']}
                                                    data={['Country', 'City', 'Channel']} 
                                                    defaultItem={'Country'}
                                                    showUpdate={true}
                                                    onSelect={(data) => {
                                                        handleOnselectUIF(data);
                                                        // setChannels(data)
                                                    }}
                                                />
                                            </Col>
                                            {/* <Col md={8} className="text-center d-flex">
                                                {processedFunnelSummary && processedFunnelSummary.length > 0 && (
                                                    processedFunnelSummary.map((step, idx) => (
                                                        <Col key={idx}>
                                                            <h3>{step.step_Name}</h3>
                                                            <small>
                                                                {step.visits} visits, {step.drop_Offs} drop-offs
                                                            </small>
                                                        </Col>
                                                    ))
                                                )
                                                }
                                            </Col> */}
                                            <Col md={1}>
                                                <div className="float-end">
                                                    <RSTooltip text="Expand" position="top" innerContent={false} tooltipOverlayClass={'toolTipOverlayZindexCSS'}>
                                                        <i
                                                            className={`${expand_large} icon-lg color-primary-blue cursor-pointer`}
                                                            onClick={() => {
                                                                if (userJourneyData) {
                                                                    setIsUserJourneyExpanded(true);
                                                                }
                                                            }}
                                                        ></i>
                                                    </RSTooltip>
                                                </div>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col>
                                                <div className="text-center" style={{ minHeight: '400px', width: '100%' }}>
                                                    {isUserJourneyLoading ? (
                                                        <RSSkeletonTable isCustombox containerClassName="mt15" />
                                                    ) : userJourneyData ? (
                                                        <CustomerJourneyFlow data={userJourneyData} />
                                                    ) : (
                                                        <RSSkeletonTable isCustombox containerClassName="mt15" text count={12} />
                                                    )}
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                        {/* User journey expanded view */}
                        <RSModal
                            show={isUserJourneyExpanded}
                            handleClose={() => setIsUserJourneyExpanded(false)}
                            fullscreen
                            closeTooltipPosition
                            header={
                                <div className="d-flex justify-content-center w-100">
                                    {processedFunnelSummary && processedFunnelSummary.length > 0 && (
                                        processedFunnelSummary.map((step, idx) => (
                                            <div key={idx} className="text-center mx30">
                                                <h3 className="mt0 mb0">{step.step_Name}</h3>
                                                <small>
                                                    {step.visits} visits, {step.drop_Offs} drop-offs
                                                </small>
                                            </div>
                                        ))
                                    )}
                                </div>
                            }
                            body={
                                <div className="text-center" style={{ minHeight: '460px', width: '100%' }}>
                                    {isUserJourneyLoading ? (
                                        <RSSkeletonTable isCustombox className="mt15" />
                                    ) : userJourneyData ? (
                                        <CustomerJourneyFlow data={userJourneyData} />
                                    ) : (
                                        <RSSkeletonTable isCustombox className="mt15" />
                                    )}
                                </div>
                            }
                            isBorder={false}
                            noBottomBorder={true}
                            bodyClassName="pt20"
                        />

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
                ) : (
                    <DetailAnalyticsChannelPortletLoader isError={!isLoading} hideTabbarSkeleton={fromSplitHeader} />
                )}
            </Container>
        </div>
    );
};

export default WebAnalytics;

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
