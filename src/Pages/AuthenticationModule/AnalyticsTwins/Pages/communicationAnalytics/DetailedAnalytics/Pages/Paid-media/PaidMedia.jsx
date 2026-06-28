import { formatNumber } from 'Utils/modules/campaignUtils';
import { hasNonZeroEngagementData, hasValidPieChartData } from 'Utils/modules/charts';
import { getChannelId, getChannelPaidMediaId } from 'Utils/modules/communicationChannels';
import { getYYMMDD } from 'Utils/modules/dateTime';
import { KeyMetricsNew, OverviewGrid, OverviewList } from '../../Components';
import { COMMUNICATION_PERFORMANCE, PAIDMEDIA_TOTAL_LINK_GRID_COLUMN_DATA, areachangeToBase64, changeToBase64, defaultValues, getDaywiseChartData, getHoursWiseChartData, mapChartOption, pieChartOption, stateReducer } from '../../constants';
import { areasplineChartOptions, columnChartOptions, mapChartOptions, pieChartOptions } from 'Constants/Charts';
import { useEffect, useMemo, useReducer, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';

import RSHighchartsContainer from 'Components/Highcharts';
import KendoGrid from 'Components/RSKendoGrid';
import RSChartTabbar from 'Components/RSChartTabber';
import CampaignCsvModal from '../../Components/CampaignCsvModal';
import ClickMapModal from '../../Components/ClickMapModal';
import SplitHeader from '../../Components/SplitHeader';
import PaidMediadata, { keyMetrixData, overview_data } from './data';
import { useDispatch, useSelector } from 'react-redux';
import useQueryParams from 'Hooks/useQueryParams';
import TabbarAreasPlineChart from '../../Components/Charts/TabbarAreasPlineChart';
import { getDetailReport_OverviewDetails } from 'Reducers/analytics/details/request';

import { getSessionId } from 'Reducers/globalState/selector';
import ColumnChart from '../../Components/Charts/ColumnChart';
import { HorizontalSkeleton, ListAqusitionSekelton } from 'Components/Skeleton/Skeleton';
import PieChart from '../../Components/Charts/PieChart';
import MapChart from '../../Components/Charts/MapChart';
import DaysAndHoursChart from '../../Components/Charts/DaysAndHoursChart';
import { updateDetailsMainList } from 'Reducers/analytics/details/reducer';
import { DetailAnalyticsChannelPortletLoader } from 'Components/Skeleton/Skeleton';
import Digipop from '../Digipop/Digipop';

const DetailAnalyticsPaidMedia = ({ type, isDownloadUI }) => {
    const dispatch = useDispatch();
    const [chartTabIndex, setChartTabIndex] = useState({
        reach: 0,
        engagement: 0,
        emailopens: 0,
    });

    const { analyticsDetatils } = useSelector(({ analyticsListingReducer }) => analyticsListingReducer);
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const { overviewDetail, channelDetail, fromSplitHeader, digipopReport, isLoading } = useSelector(({ analyticsDetails }) => analyticsDetails);
    const locationData = useQueryParams('/analytics/detail-analytics');
    const [splitItem, setSplitItem] = useState('');
    const channelId = getChannelId(type)?.id;
    
    const filteredChannelInfos = useMemo(() => {
        if (channelDetail?.channelInfos && Array.isArray(channelDetail.channelInfos)) {
            return channelDetail?.channelInfos?.filter((item) => item?.channelId === 10) ?? [];
        }
        return [];
    }, [channelDetail?.channelInfos]);
    
    useEffect(() => {
        if (filteredChannelInfos.length > 0) {
            const defaultItem =
                filteredChannelInfos.find(
                    (item) =>
                        item.subchannelId === locationData?.subChannelId ||
                        item.subChannelId === locationData?.subChannelId,
                ) || filteredChannelInfos[0];
            dispatch(updateDetailsMainList({ field: 'defaultItemSplitHeader', data: defaultItem }));
        }
    }, [filteredChannelInfos, locationData?.subChannelId, dispatch]);
    
    const resolvePaidMediaChannelItem = (filterData) => {
        const subchannelId =
            filterData?.subchannelId ??
            filterData?.subChannelId ??
            locationData?.subChannelId;
        return (
            filteredChannelInfos.find(
                (item) =>
                    item.subchannelId === subchannelId || item.subChannelId === subchannelId,
            ) || filteredChannelInfos[0]
        );
    };

    const getData = async (filterData) => {
        const channelItem = resolvePaidMediaChannelItem(filterData);
        const resolvedSubchannelId = channelItem?.subchannelId ?? channelItem?.subChannelId;
        const name = getChannelPaidMediaId(resolvedSubchannelId)?.tabName;
        setSplitItem(name);
        let splitData;
        if (filterData?.splitData === 'Actual communication') {
            splitData = 'ACT';
        } else if (filterData?.splitData?.startsWith('Split ')) {
            splitData = filterData.splitData.replace('Split ', '').trim();
        } else {
            splitData = undefined;
        }
        const payload = {
            channelId: 10,
            clientId,
            departmentId,
            userId,
            campaignId: parseInt(locationData?.campaignId, 10), // analyticsDetatils?.campaignId,
            blastID: analyticsDetatils?.blastId,
            subchannelId: resolvedSubchannelId,
            subSegmentLevel: locationData?.subSegmentLevel || 0,
            startDate: filterData?.selectedDate?.startDate
                ? getYYMMDD(filterData?.selectedDate?.startDate)
                : getYYMMDD(channelDetail?.startDate || locationData?.startDate),
            endDate: filterData?.selectedDate?.endDate
                ? getYYMMDD(filterData?.selectedDate?.endDate)
                : getYYMMDD(channelDetail?.endDate || locationData?.endDate),

            // segment: filterData?.filterSelectedData,
            // split: !!filterData?.splitData ? splitData : undefined,
        };
        // const overViewPayload = { ...payload, selectedSocialMediaSourceType: '2' };
        //await dispatch(getDetailReport_ChannelDetails({ payload }));
        dispatch(updateDetailsMainList({ field: 'fromSplitHeader', data: true }));
        dispatch(updateDetailsMainList({ field: 'overviewDetail', data: {} }));
        await dispatch(getDetailReport_OverviewDetails({ payload }));
        if (channelItem) {
            await dispatch(updateDetailsMainList({ field: 'defaultItemSplitHeader', data: channelItem }));
        }
    };
    const [isChartExpanded, setIsChartExpanded] = useState(false);
    const [isDownloadUILocal, setIsDownloadLocal] = useState(false);
    const [linkClickGroups, setLinkClickGroups] = useState('Offers');
    const [campaignStatusDropdown, setCampaignStatusDropdown] = useState('Opens and clicks');
    const [states, dispatchState] = useReducer(stateReducer, {
        isLinkClickCSVModal: false,
        isCampaignCSVModal: false,
        isClickMapModal: false,
        splitDropdown: 'Split A',
        com_status: '',
        date:''
    });
    const { isCampaignCSVModal, isLinkClickCSVModal, isClickMapModal, com_status,date } = states;

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
    } = overviewDetail || defaultValues;
    return (
        // Contend holder starts
        <div>
            {/* Main page heading block starts */}
            {/* Main page heading block ends */}

            {/* Main page content block starts */}
            <div className={`page-content ${isDownloadUILocal ? 'download-page-setup-detail' : ''}`}>
                <Container className='px0'>
                {(fromSplitHeader && !channelDetail?.isDigipopCamp)|| Object.keys(overviewDetail)?.length > 0 ? (
                    <div className="rs-csr-wrapper">
                            <SplitHeader
                            // splitView={true}
                            datePicker={true}
                            callbackSplit={getData}
                            colorfulHeader={true}
                            splitData={filteredChannelInfos}
                            detailAnalytics
                            isDownloadUI={(flag) => {
                                setIsDownloadLocal(flag);
                                setTimeout(() => {
                                    setIsDownloadLocal(false);
                                }, 10000);
                                isDownloadUI(flag);
                            }}
                            startDate={channelDetail?.startDate}
                            endDate={channelDetail?.endDate}
                            channelId={10}
                        />
                        {Object.keys(overviewDetail)?.length > 0 ? (
                            <>
                                <OverviewGrid
                                    channelId={locationData?.channelId}
                                    infoIcon={false}
                                    isPreview={false}
                                    campaignId={locationData?.campaignId}
                                />
                                {/* <OverviewList dataObj={paidMediaConstant?.OVERVIEW_DATA} /> */}
                                <OverviewList dataObj={overview_data(reach, engagement, conversion)} />

                                <Row>
                                    <div className="portlet-heading">
                                        <h3>{COMMUNICATION_PERFORMANCE}</h3>
                                    </div>
                                    {/* <Col md={8} className="position-relative d-none">
                            <RSChartTabbar
                                dynamicTab={`mb0 mini`}
                                defaultClass={`tabTransparent pt0`}
                                activeClass={`active`}
                                chartHeading="Engagement by channel"
                                containerClass={`csr-chart-portlet expanded-view ${
                                    isChartExpanded ? 'chart-expanded' : ''
                                }`}
                                tabData={[
                                    {
                                        id: 'overall',
                                        text: 'Overall',
                                        textClass: 'font-sm',
                                        component: () => (
                                            <RSHighchartsContainer
                                                pClassName={'x-axis-labels-performance'}
                                                key={'overall'}
                                                options={areasplineChartOptions(
                                                    PaidMediadata[splitItem]?.chartData
                                                        ?.reach_areaspline_overall_chartData,
                                                )}
                                            />
                                        ),
                                    },
                                    {
                                        id: 'first_24_hr',
                                        text: 'First 24 hr',
                                        textClass: 'font-sm',
                                        component: () => (
                                            <RSHighchartsContainer
                                                pClassName={'x-axis-labels-performance'}
                                                key={'first_24_hr'}
                                                options={areasplineChartOptions(
                                                    PaidMediadata[splitItem]?.chartData
                                                        ?.reach_areaspline_first24hr_chartData,
                                                )}
                                            />
                                        ),
                                    },
                                ]}
                                className="rs-tabs row"
                                componentClassName={'mt30'}
                                expandView
                                expandIcon={() => {
                                    setIsChartExpanded(!isChartExpanded);
                                }}
                                isChartExpanded={isChartExpanded}
                            />
                        </Col> */}
                                    <Row>
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
                                                                    ? changeToBase64(
                                                                          enagegementPerformanceJson,
                                                                          'area',
                                                                      )
                                                                    : null;

                                                            if (!chartData) {
                                                                return <ListAqusitionSekelton isChartSkeleton isCustom isError disableLegendAnimation />;
                                                            }
                                                            return (
                                                                <RSHighchartsContainer
                                                                    type="area"
                                                                    key={'overall'}
                                                                    options={areasplineChartOptions(
                                                                        chartData,
                                                                    )}
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
                                                                    ? changeToBase64(
                                                                          conversionPerformanceJson,
                                                                          'area',
                                                                      )
                                                                    : null;
                                                            if (!chartData) {
                                                                return <ListAqusitionSekelton isChartSkeleton isCustom isError disableLegendAnimation />;
                                                            }
                                                            return (
                                                                <RSHighchartsContainer
                                                                    type="area"
                                                                    options={columnChartOptions(
                                                                        chartData,
                                                                    )}
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
                                                            {/* <span> {SocialAnalyticsData.smConversionPercent}</span> */}
                                                            <small>%</small>
                                                        </li>
                                                        {/* <li> {SocialAnalyticsData.smConversion}</li> */}
                                                    </ul>
                                                </div>
                                            </div>
                                        </Col>

                                        <Col md={4}>
                                            <KeyMetricsNew
                                                data={
                                                    keyMetrics !== undefined && keyMetrics !== null
                                                        ? keyMetrixData(keyMetrics)
                                                        : []
                                                }
                                                infoIcon={false}
                                                middleDataHeader={false}
                                                pdfDownload={isDownloadUILocal}
                                            />
                                        </Col>
                                    </Row>

                                    <Col md={8} className="position-relative click-off d-none">
                                        <TabbarAreasPlineChart
                                            heading={'Reach'}
                                            splitItemText={``}
                                            expandChartAction={() => setIsChartExpanded(!isChartExpanded)}
                                            isChartExpanded={isChartExpanded}
                                            splitItem={splitItem}
                                            expandViewStatus={true}
                                            footerStatus={false}
                                            overAllTextData={
                                                reachPerformanceJson && hasNonZeroEngagementData(reachPerformanceJson)
                                                    ? changeToBase64(reachPerformanceJson, 'area')
                                                    : {}
                                            }
                                            first24HoursData={
                                                reachPerformanceHrsJson && hasNonZeroEngagementData(reachPerformanceHrsJson)
                                                    ? changeToBase64(reachPerformanceHrsJson, 'area')
                                                    : {}
                                            }
                                            content={true}
                                            //channelType={type}
                                        />
                                    </Col>
                                </Row>

                                {splitItem === 'vuer' ? (
                                    <Row>
                                        <Col md={6}>
                                            <RSChartTabbar
                                                dynamicTab={`mb0 mini`}
                                                defaultClass={`tabTransparent pt0`}
                                                activeClass={`active`}
                                                chartHeading="Engagement"
                                                tabData={[
                                                    {
                                                        id: 'overall',
                                                        text: 'Overall',
                                                        textClass: 'font-sm',
                                                        component: () => (
                                                            <div>
                                                                <RSHighchartsContainer
                                                                    pClassName={'x-axis-labels-performance'}
                                                                    key={'overall'}
                                                                    options={areasplineChartOptions(
                                                                        PaidMediadata[splitItem]?.chartData
                                                                            ?.vuer_engagement_dataOverAll,
                                                                    )}
                                                                />
                                                                <div className="portlet-footer portlet-two-label">
                                                                    <ul>
                                                                        <li>
                                                                            <span>
                                                                                {PaidMediadata.paidMediavuerPrecent}
                                                                            </span>
                                                                            <small>%</small>
                                                                        </li>
                                                                        <li>{PaidMediadata.paidMediavuerEngagement}</li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        ),
                                                    },
                                                    {
                                                        id: 'first_24_hr',
                                                        text: 'First 24 hr',
                                                        textClass: 'font-sm',
                                                        component: () => (
                                                            <div>
                                                                <RSHighchartsContainer
                                                                    pClassName={'x-axis-labels-performance'}
                                                                    key={'first_24_hr'}
                                                                    options={areasplineChartOptions(
                                                                        PaidMediadata[splitItem]?.chartData
                                                                            ?.vuer_engagement_dataOverAll24hrs,
                                                                    )}
                                                                />
                                                                <div className="portlet-footer portlet-two-label">
                                                                    <ul>
                                                                        <li>
                                                                            <span>48</span>
                                                                            <small>%</small>
                                                                        </li>
                                                                        <li>{PaidMediadata.paidMediaEngagement}</li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        ),
                                                    },
                                                ]}
                                                className="rs-tabs row"
                                                componentClassName={'mt30'}
                                            />
                                        </Col>
                                        <Col md={6}>
                                            <div className="portlet-container portlet-md">
                                                <div className="portlet-header">
                                                    <h4>Conversion</h4>
                                                </div>
                                                <div className="portlet-body">
                                                    <div className="portlet-chart">
                                                        <RSHighchartsContainer
                                                            options={columnChartOptions(
                                                                PaidMediadata[splitItem]?.chartData
                                                                    ?.vuer_engagement_data_conversion,
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="portlet-footer portlet-two-label">
                                                    <ul>
                                                        <li>
                                                            <span>10</span>
                                                            <small>%</small>
                                                        </li>
                                                        <li>of the users registered for callback on home loans</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                ) : (
                                    <Row>
                                        <Col md={6} className="x-axis-labels-performance d-none">
                                            <div className="portlet-container portlet-md pfooter">
                                                <div className="portlet-header">
                                                    <h4>Engagement</h4>
                                                </div>
                                                <div className="portlet-body">
                                                    <RSHighchartsContainer
                                                        pClassName={'areaspline-x-axis-labels'}
                                                        options={areasplineChartOptions(
                                                            areachangeToBase64(
                                                                enagegementPerformanceJson,
                                                                'area',
                                                            ),
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </Col>
                                        <Col md={6} className="x-axis-labels-performance d-none">
                                            <ColumnChart
                                                title={'Conversion'}
                                                chartData={
                                                    conversionPerformanceJson && hasNonZeroEngagementData(conversionPerformanceJson)
                                                        ? areachangeToBase64(
                                                              conversionPerformanceJson,
                                                              'columnFooter',
                                                          )
                                                        : {}
                                                }
                                                footerPercent={formatNumber(conversion?.registration)}
                                                footerText={
                                                    'of conversion happened during this period'
                                                }
                                                content={true}
                                            />
                                        </Col>
                                    </Row>
                                )}

                                <Row>
                                    <div className="portlet-heading">
                                        <h3 className="mt0">User engagement</h3>
                                    </div>
                                    {splitItem === 'vuer' ? (
                                        <>
                                            <Col md={6}>
                                                <div className="portlet-container portlet-md pfooter">
                                                    <div className="portlet-header">
                                                        <h4>By user category</h4>
                                                    </div>
                                                    <div className="portlet-body">
                                                        <RSHighchartsContainer
                                                            constructorType="mapChart"
                                                            options={columnChartOptions(
                                                                PaidMediadata[splitItem]?.chartData
                                                                    ?.user_category_structure,
                                                            )}
                                                        />
                                                    </div>
                                                    <div className="portlet-footer portlet-two-label">
                                                        <ul>
                                                            <li>{PaidMediadata.paidMediavuerByUserCategory}</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col md={6}>
                                                <div className="portlet-container portlet-md pfooter">
                                                    <div className="portlet-header">
                                                        <h4>By publisher category</h4>
                                                    </div>
                                                    <div className="portlet-body">
                                                        <RSHighchartsContainer
                                                            constructorType="mapChart"
                                                            options={columnChartOptions(
                                                                PaidMediadata[splitItem]?.chartData
                                                                    ?.user_category_structure,
                                                            )}
                                                        />
                                                    </div>
                                                    <div className="portlet-footer portlet-two-label">
                                                        <ul>
                                                            <li>{PaidMediadata.paidMediavuerPublisherCategory}</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </Col>
                                        </>
                                    ) : (
                                        <>
                                            <Col md={6} className="mapicon">
                                                <MapChart
                                                    title={'By location'}
                                                    chartData={
                                                        !!pageByLocationJson
                                                            ? mapChartOption(pageByLocationJson)
                                                            : []
                                                    }
                                                    // footerPercent={keyMetrics?.['participants']}
                                                    footerText={
                                                        <>
                                                            <span>{keyMetrics?.['location']}</span>&nbsp;has the highest
                                                            engagement rate with&nbsp;
                                                            <span>{keyMetrics?.['participants']}%</span>&nbsp;of users
                                                            engaged
                                                        </>
                                                    }
                                                />
                                            </Col>

                                            <Col md={6}>
                                                <DaysAndHoursChart
                                                    heading={''}
                                                    splitItemText={''}
                                                    expandChartAction={() => setIsChartExpanded(!isChartExpanded)}
                                                    // isChartExpanded={isChartExpanded}
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
                                                            ? getHoursWiseChartData(
                                                                  pageByHoursJson,
                                                                  'clockFooter',
                                                              )
                                                            : {}
                                                    }
                                                    // dayPercent={topDay}
                                                    dayText={
                                                        <>
                                                            <span>{topDay}</span>&nbsp;has the highest engagement rate
                                                            with&nbsp;
                                                            <span>{topDayValue}</span>%
                                                        </>
                                                    }
                                                    hoursPercent={formatNumber(topHourValue)}
                                                    hoursText={`of the users engage during ${topHour}`}
                                                />
                                            </Col>
                                        </>
                                    )}
                                </Row>

                                {splitItem === 'vuer' ? (
                                    <Row>
                                        <Col md={6}>
                                            <div className="portlet-container portlet-md pfooter">
                                                <div className="portlet-header">
                                                    <h4>By user category</h4>
                                                </div>
                                                <div className="portlet-body">
                                                    <RSHighchartsContainer
                                                        constructorType="mapChart"
                                                        options={columnChartOptions(
                                                            PaidMediadata[splitItem]?.chartData
                                                                ?.user_category_structure,
                                                        )}
                                                    />
                                                </div>
                                                <div className="portlet-footer portlet-two-label">
                                                    <ul>
                                                        <li>{PaidMediadata.paidMediavuerPublisherWise}</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <RSChartTabbar
                                                dynamicTab={`mb0 mini`}
                                                defaultClass={`tabTransparent pt0`}
                                                activeClass={`active`}
                                                tabData={[
                                                    {
                                                        id: 'device',
                                                        text: 'By device',
                                                        textClass: 'font-sm',
                                                        component: () => (
                                                            <div>
                                                                <RSHighchartsContainer
                                                                    options={pieChartOptions(
                                                                        PaidMediadata[splitItem]?.chartData
                                                                            ?.by_device_pie_chartData,
                                                                    )}
                                                                />
                                                                <div className="portlet-footer portlet-two-label">
                                                                    <ul>
                                                                        <li>
                                                                            <span>
                                                                                {PaidMediadata.paidMediavuerPrecent}
                                                                            </span>
                                                                            <small>%</small>
                                                                        </li>
                                                                        <li>{PaidMediadata.paidMediavuerEngagement}</li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        ),
                                                    },
                                                    {
                                                        id: 'browser',
                                                        text: 'By browser',
                                                        textClass: 'font-sm',
                                                        component: () => (
                                                            <div>
                                                                <RSHighchartsContainer
                                                                    options={pieChartOptions(
                                                                        PaidMediadata[splitItem]?.chartData
                                                                            ?.by_browser_pie_chartData,
                                                                    )}
                                                                />
                                                                <div className="portlet-footer portlet-two-label">
                                                                    <ul>
                                                                        <li>
                                                                            <span>62</span>
                                                                            <small>%</small>
                                                                        </li>
                                                                        <li>
                                                                            of the users were received through Chrome
                                                                            browser
                                                                        </li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        ),
                                                    },
                                                ]}
                                                className="rs-tabs row"
                                                componentClassName={'mt30'}
                                            />
                                        </Col>
                                    </Row>
                                ) : (
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
                                                        ? pieChartOption(pageByDeviceJson, 'pieFooter',true)
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
                                            {/* <div className="portlet-container portlet-md pfooter"> */}
                                            {/* <div className="portlet-header">
                                    <h4>By browser</h4>
                                </div> */}
                                            {/* <div className="portlet-body">
                                        <HorizontalSkeleton isError={true} message={'No data available'} />
                                    </div> */}
                                            <PieChart
                                                title={'By browser'}
                                                chartData={
                                                    pageByBrowserJson !== undefined &&
                                                    pageByBrowserJson !== null &&
                                                    pageByBrowserJson !== '' &&
                                                    hasValidPieChartData(pageByBrowserJson)
                                                        ? pieChartOption(pageByBrowserJson, 'pieFooter',true)
                                                        : {}
                                                }
                                                footerPercent={formatNumber(topBrowserValue)}
                                                footerText={`of the users were received through ${
                                                    !!topBrowser ? topBrowser : `Others`
                                                } browser`}
                                            />
                                            {/* <div className="portlet-body">
                                        <RSHighchartsContainer
                                            options={pieChartOptions(
                                                PaidMediadata[splitItem]?.chartData?.by_browser_pie_chartData,
                                            )}
                                        />
                                    </div>
                                    <div className="portlet-footer portlet-two-label">
                                        <ul>
                                            <li>
                                                <span>{PaidMediadata.paidMediaByBrowserPercent}</span>
                                                <small>%</small>
                                            </li>
                                            <li>{PaidMediadata.paidMediaByBrowser}</li>
                                        </ul>
                                    </div> */}
                                            {/* </div> */}
                                        </Col>
                                    </Row>
                                )}

                                {splitItem === 'vuer' && (
                                    <Row>
                                        <Col md={6}>
                                            <div className="portlet-container portlet-md pfooter">
                                                <div className="portlet-header">
                                                    <h4>By location</h4>
                                                </div>
                                                <div className="portlet-body">
                                                    <RSHighchartsContainer
                                                        constructorType="mapChart"
                                                        options={mapChartOptions(
                                                            PaidMediadata[splitItem]?.chartData
                                                                ?.byLocation__map_chartData,
                                                        )}
                                                    />
                                                </div>
                                                <div className="portlet-footer portlet-two-label">
                                                    <ul>
                                                        <li>
                                                            <span>{PaidMediadata.paidMediaLocationPercent}</span>
                                                            <small>%</small>
                                                        </li>
                                                        <li>{PaidMediadata.paidMediaLocation}</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <RSChartTabbar
                                                dynamicTab={`mb0 mini`}
                                                defaultClass={`tabTransparent pt0`}
                                                activeClass={`active`}
                                                chartHeading=""
                                                footer={true}
                                                tabData={[
                                                    {
                                                        id: 'banner',
                                                        text: 'By banner size',
                                                        textClass: 'font-sm',
                                                        component: () => (
                                                            <RSHighchartsContainer
                                                                options={columnChartOptions(
                                                                    PaidMediadata[splitItem]?.chartData
                                                                        ?.vuer_banner_size,
                                                                )}
                                                            />
                                                        ),
                                                        footer: (
                                                            <ul>
                                                                <li>
                                                                    <span>62</span>
                                                                    <small>%</small>
                                                                </li>
                                                                <li> of the users used 336x280 size banners </li>
                                                            </ul>
                                                        ),
                                                    },
                                                    {
                                                        id: 'format',
                                                        text: 'By format type',
                                                        textClass: 'font-sm',
                                                        component: () => (
                                                            <RSHighchartsContainer
                                                                options={columnChartOptions(
                                                                    PaidMediadata[splitItem]?.chartData
                                                                        ?.vuer_banner_size_format,
                                                                )}
                                                            />
                                                        ),
                                                        footer: (
                                                            <ul>
                                                                <li>
                                                                    <span>62</span>
                                                                    <small>%</small>
                                                                </li>
                                                                <li>
                                                                    of the users were received through Chrome browser
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
                                )}

                                <Row>
                                    <Col>
                                        <div className="rs-table-with-heading mb30">
                                            <div className="portlet-header flex-row mb10 ">
                                                <div className="fr flex-left d-flex align-items-center">
                                                    <h4 className="mb0">Total link click activity</h4>
                                                </div>
                                            </div>

                                            <div className="portlet-body">
                                                <KendoGrid
                                                    data={linkClickList}
                                                    column={PAIDMEDIA_TOTAL_LINK_GRID_COLUMN_DATA}
                                                    scrollable="scrollable"
                                                />
                                            </div>
                                        </div>
                                    </Col>
                                </Row>

                                <CampaignCsvModal
                                    show={states.isCampaignCSVModal}
                                    handleClose={(status) => {
                                        dispatchState({
                                            type: 'UPDATE',
                                            payload: status,
                                            field: 'isCampaignCSVModal',
                                        });
                                    }}
                                    confirm={() => {
                                        dispatchState({
                                            type: 'UPDATE',
                                            payload: false,
                                            field: 'isCampaignCSVModal',
                                        });
                                    }}
                                />
                                <ClickMapModal
                                    show={states.isClickMapModal}
                                    handleClose={(status) => {
                                        dispatchState({
                                            type: 'UPDATE',
                                            payload: status,
                                            field: 'isClickMapModal',
                                        });
                                    }}
                                    scheduleDate={date}
                                />
                            </>
                        ) : (
                            <DetailAnalyticsChannelPortletLoader isError={!isLoading} hideTabbarSkeleton={fromSplitHeader} />
                        )}
                    </div>
                ) : channelDetail?.isDigipopCamp ? (
                    <>
                        <Digipop reports={digipopReport}/>
                    </>
                )
                    : (
                <DetailAnalyticsChannelPortletLoader isError={!isLoading} hideTabbarSkeleton={fromSplitHeader} />
                )}
                </Container>
            </div>
            {/* Main page content block ends */}
        </div>
        // Content holder ends
    );
};

export default DetailAnalyticsPaidMedia;
