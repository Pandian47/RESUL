import { USER_ENGAGEMENT, pieChartOption } from '../../communicationAnalytics/DetailedAnalytics/constants';
import { pieChartOptions } from 'Constants/Charts';
import { csv_download_large } from 'Constants/GlobalConstant/Glyphicons';
import { useMemo, useState } from 'react';
import { Row, Col } from 'react-bootstrap';

import OverviewList from '../../communicationAnalytics/DetailedAnalytics/Components/OverviewList/OverviewList';
import ColumnChart from '../../communicationAnalytics/DetailedAnalytics/Components/Charts/ColumnChart';
import TabbarAreasPlineChart from '../../communicationAnalytics/DetailedAnalytics/Components/Charts/TabbarAreasPlineChart';
import { KeyMetricsNew } from '../../communicationAnalytics/DetailedAnalytics/Components';
import KendoGrid from 'Components/RSKendoGrid';
import RSChartTabbar from 'Components/RSChartTabber';
import RSHighchartsContainer from 'Components/Highcharts';
import { PieChartSkeleton, HorizontalSkeleton } from 'Components/Skeleton/Skeleton';
import { SkeletonTable } from 'Components/Skeleton/Skeleton';
import RSTooltip from 'Components/RSTooltip';
import {
    overview_data,
    keyMetrixData,
    COMMUNICATION_COLUMN_DATA,
    LANDING_PAGE_COLUMN_DATA,
    USER_SUMMARY_COLUMN_DATA,
    buildProgressiveRows,
    buildProgressiveColumns,
    CHANNEL_WISE_COLUMN_DATA,
} from '../data';
import {
    processReachChartData,
    processEngagementChartData,
    processConversionChartData,
    processPieChartData,
    formatCommunicationData,
    formatLandingPageData,
    formatUserData,
    formatPercentage,
} from '../constants';
import { useSelector } from 'react-redux';

import { downloadCSVcommasFile } from 'Utils/modules/download';
import useQueryParams from 'Hooks/useQueryParams';
import CSVModal from 'Pages/AuthenticationModule/Preferences/Pages/FormGenerator/Components/CSVModal';

const FormAnalyticsContent = () => {
    const locationData = useQueryParams('/preferences/template-gallery/form-analytics');
    const { progProfileData, progProfileLoading, formAnalytics, isLoading } = useSelector(
        ({ analyticsDetails }) => analyticsDetails,
    );
    const {
        reach = {},
        engagement = {},
        conversion = {},
        keyMetrics = {},
        reachPerformanceJson = {},
        reachPerformanceHrsJson = {},
        engagementPerformanceJson = {},
        engagementPerformanceHrsJson = {},
        conversionPerformanceJson = {},
        browserJson = {},
        deviceJson = {},
        communicationSummary = [],
        landingPageSummary = [],
        userSummary = [],
        lastUpdatedtime,
        channelId = [],
        topChannel = '',
        topChannelValue,
        channelJson = {},
        channelWise = [],
    } = formAnalytics || {};
    const formName = locationData?.formName || formAnalytics?.formName || 'Form Analytics';

    const [isReachChartExpanded, setIsReachChartExpanded] = useState(false);
    const [isEngagementChartExpanded, setIsEngagementChartExpanded] = useState(false);
    const [showCsvModal, setShowCsvModal] = useState(false);

    // Memoized chart data processing
    const chartData = useMemo(() => {
        const reachData = processReachChartData(reachPerformanceJson, reachPerformanceHrsJson);
        const engagementData = processEngagementChartData(engagementPerformanceJson, engagementPerformanceHrsJson);
        const conversionData = processConversionChartData(conversionPerformanceJson);

        return {
            ...reachData,
            ...engagementData,
            ...conversionData,
        };
    }, [
        reachPerformanceJson,
        reachPerformanceHrsJson,
        engagementPerformanceJson,
        engagementPerformanceHrsJson,
        conversionPerformanceJson,
    ]);

    const { progressiveData, dynamicCols } = useMemo(() => buildProgressiveRows(progProfileData), [progProfileData]);
    const PROGRESSIVE_PROFILE_COLUMNS = useMemo(
        () => buildProgressiveColumns(progressiveData, dynamicCols),
        [progressiveData, dynamicCols],
    );

    const channelWiseGridData = useMemo(() => {
        if (!Array.isArray(channelWise)) return [];
        return channelWise.map((item, index) => ({
            rowNo: index + 1,
            channel: item?.channel ?? '',
            reach: item?.reach ?? 0,
            engagement: item?.engagement ?? 0,
            conversion: item?.conversion ?? 0,
        }));
    }, [channelWise]);

    // Memoized table data
    const tableData = useMemo(() => {
        return {
            communication: formatCommunicationData(communicationSummary),
            landingPage: formatLandingPageData(landingPageSummary),
            user: formatUserData(userSummary),
        };
    }, [communicationSummary, landingPageSummary, userSummary]);

    // Memoized pie chart data
    const pieChartData = useMemo(() => {
        return processPieChartData(deviceJson, browserJson);
    }, [deviceJson?.data, browserJson?.data]);

    const channelPie = useMemo(() => {
        const hasData = Array.isArray(channelJson?.data) && (channelJson?.data?.length ?? 0) > 0;
        const chartData = hasData ? pieChartOption(JSON.stringify(channelJson?.data ?? []), 'pieFooter', true) : {};
        const topValue = {
            value: topChannelValue ?? 0,
            name: topChannel ?? '',
        };
        return { hasData, chartData, topValue };
    }, [channelJson?.data, topChannel, topChannelValue]);

    // Memoized computed values
    const overviewData = useMemo(() => overview_data(reach, engagement, conversion), [reach, engagement, conversion]);
    const keyMetricsData = useMemo(() => keyMetrixData(keyMetrics), [keyMetrics]);

    const hasConversionData = useMemo(
        () =>
            chartData.conversion &&
            chartData.conversion?.series &&
            Array.isArray(chartData.conversion.series) &&
            chartData.conversion.series.length > 0,
        [chartData.conversion],
    );

    const hasEngagementData = useMemo(
        () =>
            chartData.engagement &&
            chartData.engagement?.series &&
            Array.isArray(chartData.engagement.series) &&
            chartData.engagement.series.length > 0,
        [chartData.engagement],
    );

    // Render helper functions
    const renderPieChartComponent = (chartData, hasData) => {
        if (hasData && chartData && Object.keys(chartData).length > 0 && chartData.series?.length > 0) {
            return (
                <div className="portlet-chart">
                    <RSHighchartsContainer options={pieChartOptions(chartData)} />
                </div>
            );
        }
        return <PieChartSkeleton isError={true} customTop={true} />;
    };

    const renderPieChartFooter = (topValue, text, hasData) => {
        if (!hasData) return null;
        return (
            <div className="portlet-footer portlet-two-label">
                <ul>
                    <li>
                        <span>{topValue.value || 0}</span>
                        <small>%</small>
                    </li>
                    <li>{text}</li>
                </ul>
            </div>
        );
    };

    const renderDataTable = (data, columns, title = '', loading = false, noDataText = 'No data available') => {
        return (
            <KendoGrid
                data={data || []}
                column={columns}
                pageable={true}
                sortable={false}
                settings={{ total: data?.length }}
                isLoading={loading}
                isScrollTop={false}
                scrollable={'scrollable'}
                noDataText={noDataText}
            />
        );
        // return <HorizontalSkeleton isError={true} />;
    };

    if (isLoading) {
        return (
            <div className="rs-csr-wrapper">
                <div className="box-design">
                    <SkeletonTable />
                </div>
            </div>
        );
    }

    if (!formAnalytics || !Object.keys(formAnalytics).length) {
        return (
            <div className="rs-csr-wrapper">
                <div className="box-design">
                    <SkeletonTable isError={true} />
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="rs-csr-wrapper">
                {/* Overview Cards */}
                <OverviewList dataObj={overviewData} />

                {/* Form Performance Section */}
                <Row>
                    <div className="portlet-heading">
                        <h3>Form performance</h3>
                    </div>
                    <Col md={8} className="position-relative">
                        <TabbarAreasPlineChart
                            heading={'Reach'}
                            splitItemText={'Day-wise unique audience'}
                            expandChartAction={() => setIsReachChartExpanded(!isReachChartExpanded)}
                            isChartExpanded={isReachChartExpanded}
                            splitItem={''}
                            expandViewStatus={true}
                            footerStatus={false}
                            overAllTextData={
                                chartData.reach && Object.keys(chartData.reach).length > 0 ? chartData.reach : {}
                            }
                            first24HoursData={
                                chartData.reachHrs && Object.keys(chartData.reachHrs).length > 0
                                    ? chartData.reachHrs
                                    : {}
                            }
                        />
                    </Col>
                    <Col md={4}>
                        <KeyMetricsNew
                            data={keyMetricsData}
                            pdfDownload={false}
                            isChartExpanded={isReachChartExpanded}
                        />
                    </Col>
                </Row>

                {/* Engagement and Conversion Charts */}
                <Row>
                    <Col md={6} className="x-axis-labels-performance">
                        <TabbarAreasPlineChart
                            heading={'Engagement'}
                            splitItemText={''}
                            expandChartAction={() => setIsEngagementChartExpanded(!isEngagementChartExpanded)}
                            isChartExpanded={isEngagementChartExpanded}
                            splitItem={''}
                            expandViewStatus={false}
                            footerStatus={hasEngagementData}
                            overAllTextData={
                                chartData.engagement && Object.keys(chartData.engagement).length > 0
                                    ? chartData.engagement
                                    : {}
                            }
                            first24HoursData={
                                chartData.engagementHrs && Object.keys(chartData.engagementHrs).length > 0
                                    ? chartData.engagementHrs
                                    : {}
                            }
                            overAllPercent={reach?.opens || 0}
                            overAllText={
                                <>
                                    <small>
                                        total reach and {formatPercentage(engagement?.clicks)}% engagement happened
                                        during this period
                                    </small>
                                </>
                            }
                            first24HoursPercent={reach?.opens}
                            first24HoursText={
                                <>
                                    <small>
                                        total reach and {formatPercentage(engagement?.clicks)}% engagement happened
                                        during this period
                                    </small>
                                </>
                            }
                            content={true}
                        />
                    </Col>
                    <Col md={6}>
                        {hasConversionData ? (
                            <ColumnChart
                                title={'Conversion'}
                                chartData={chartData.conversion}
                                footerPercent={conversion?.conversions || 0}
                                footerText={
                                    <>
                                        {/* <strong className="font-bold">
                                            {formatPercentage(conversion?.conversions)}
                                        </strong> */}
                                        conversion happened and{' '}
                                        <span className="font-bold">{conversion?.count || 0}</span> users registered
                                        during this period
                                    </>
                                }
                                content={true}
                            />
                        ) : (
                            <div className="box-design">
                                <div className="box-header">
                                    <h4 className="box-title">Conversion</h4>
                                </div>
                                <div className="box-body">
                                    <HorizontalSkeleton isError={true} />
                                </div>
                            </div>
                        )}
                    </Col>
                </Row>

                {/* User Engagement Section - Pie Charts */}
                <Row>
                    <div className="portlet-heading">
                        <h3 className="mt0">{USER_ENGAGEMENT}</h3>
                    </div>
                    <Col md={6}>
                        <div className="box-design portlet-container portlet-md pfooter">
                            <div className="box-header">
                                <h4 className="box-title">Channels</h4>
                            </div>
                            <div className="box-body position-relative">
                                {channelPie.hasData ? (
                                    <div className="portlet-chart">
                                        <RSHighchartsContainer
                                            options={pieChartOptions(channelPie.chartData)}
                                        />
                                    </div>
                                ) : (
                                    <HorizontalSkeleton isError={true} />
                                )}
                            </div>
                            {channelPie.hasData && (
                                <div className="portlet-footer portlet-two-label">
                                    <ul>
                                        <li>
                                            <span>{channelPie.topValue.value || 0}</span>
                                            <small>%</small>
                                        </li>
                                        <li>
                                            <small>
                                                of the link clicks were by {channelPie.topValue.name || 'channels'}
                                            </small>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </Col>
                    <Col md={6}>
                        <RSChartTabbar
                            chartHeading="Engaged by"
                            dynamicTab="mb0 mini"
                            defaultClass="tabTransparent pt0"
                            activeClass="active"
                            footer={true}
                            tabData={[
                                {
                                    id: 'browser',
                                    text: 'Browser',
                                    textClass: 'font-sm',
                                    component: () =>
                                        renderPieChartComponent(
                                            pieChartData.browser.chartData,
                                            pieChartData.browser.hasData,
                                        ),
                                    footer: renderPieChartFooter(
                                        pieChartData.browser.topValue,
                                        <>
                                            <small>
                                                of forms were submitted from{' '}
                                                {pieChartData.browser.topValue.name || 'Chrome'} browser
                                            </small>
                                        </>,
                                        pieChartData.browser.hasData,
                                    ),
                                },
                                {
                                    id: 'device',
                                    text: 'Device',
                                    textClass: 'font-sm',
                                    component: () =>
                                        renderPieChartComponent(
                                            pieChartData.device.chartData,
                                            pieChartData.device.hasData,
                                        ),
                                    footer: renderPieChartFooter(
                                        pieChartData.device.topValue,
                                        <>
                                            <small>
                                                have been opened from {pieChartData.device.topValue.name || 'device'}{' '}
                                            </small>
                                        </>,
                                        pieChartData.device.hasData,
                                    ),
                                },
                            ]}
                            className="rs-tabs row"
                        />
                    </Col>
                </Row>

                <Row className="">
                    <Col md={12}>
                        <div className="portlet-container rs-table-with-heading">
                            <div className="portlet-header flex-row mb0">
                                <h4 className="mb0">Progressive profile</h4>
                                <div
                                    className={`d-flex align-items-center ${progressiveData?.length > 0 ? '' : 'pe-none click-off'
                                        }`}
                                >
                                    <RSTooltip
                                        text={'Download CSV'}
                                        position="top"
                                        className="lh0"
                                        innerContent={false}
                                    >
                                        <i
                                            className={`${csv_download_large} icon-lg ml10 color-primary-blue`}
                                            onClick={() => {
                                                downloadCSVcommasFile(
                                                    progressiveData,
                                                    formName +
                                                    '_' +
                                                    'Progressive profile' +
                                                    '_' +
                                                    new Date().toLocaleDateString() +
                                                    '_' +
                                                    new Date().toLocaleTimeString(),
                                                );
                                            }}
                                            id=""
                                        ></i>
                                    </RSTooltip>
                                </div>
                            </div>

                            <div className="portlet-body">
                                {renderDataTable(
                                    progressiveData,
                                    PROGRESSIVE_PROFILE_COLUMNS,
                                    'Progressive profile',
                                    progProfileLoading,
                                    'Progressive profile analytics are available only when progressive profiling is enabled for this form.',
                                )}
                            </div>
                        </div>
                    </Col>
                </Row>

                <Row className="">
                    <Col md={12}>
                        <div className="portlet-container rs-table-with-heading mb30">
                            <div className="portlet-header flex-row mb0">
                                <h4 className="mb0">Channels</h4>
                            </div>
                            <div className="portlet-body">
                                {renderDataTable(
                                    channelWiseGridData,
                                    CHANNEL_WISE_COLUMN_DATA,
                                    'Channels',
                                    false,
                                )}
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* Communication Summary Table */}
                <Row className="">
                    <Col md={12}>
                        <div className="portlet-container rs-table-with-heading mb30">
                            <div className="portlet-header flex-row mb0">
                                <h4 className="mb0">Communications</h4>
                            </div>
                            <div className="portlet-body">
                                {renderDataTable(
                                    tableData.communication,
                                    COMMUNICATION_COLUMN_DATA,
                                    'Communications',
                                    false,
                                )}
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* Landing Pages Summary Table */}
                <Row className="">
                    <Col md={12}>
                        <div className="portlet-container rs-table-with-heading mb30">
                            <div className="portlet-header flex-row mb0">
                                <h4 className="mb0">Landing pages</h4>
                            </div>
                            <div className="portlet-body">
                                {renderDataTable(
                                    tableData.landingPage,
                                    LANDING_PAGE_COLUMN_DATA,
                                    'Landing pages',
                                    false,
                                )}
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* User Summary Table */}
                <Row className="">
                    <Col md={12}>
                        <div className="portlet-container rs-table-with-heading mb30">
                            <div className="portlet-header flex-row mb0">
                                <h4 className="mb0">Form submission details</h4>
                                <div
                                    className={`d-flex align-items-center ${tableData.user?.length > 0 ? '' : 'pe-none click-off'
                                        }`}
                                >
                                    <RSTooltip
                                        text={'Download CSV'}
                                        position="top"
                                        className="lh0"
                                        innerContent={false}
                                    >
                                        <i
                                            className={`${csv_download_large} icon-lg ml10 color-primary-blue`}
                                            onClick={() => {
                                                setShowCsvModal(true);
                                            }}
                                            id=""
                                        ></i>
                                    </RSTooltip>
                                </div>
                            </div>

                            <div className="portlet-body">
                                {renderDataTable(
                                    tableData.user,
                                    USER_SUMMARY_COLUMN_DATA,
                                    'Form submission details',
                                    false,
                                )}
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
            {showCsvModal && (
                <CSVModal
                    show={showCsvModal}
                    handleActions={(status) => {
                        setShowCsvModal(status);
                    }}
                    data={locationData.data || {}}
                    from={'formAnalytics'}
                />
            )}
        </>
    );
};

export default FormAnalyticsContent;
