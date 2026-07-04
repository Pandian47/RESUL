import { getChannelId } from 'Utils/modules/communicationChannels';
import { getUserDetails } from 'Utils/modules/crypto';
import { safeObjectKeys } from 'Utils/modules/misc';
import { getYYMMDD, getUserCurrentFormat, getDateFormat } from 'Utils/modules/dateTime';
import { ANALYSIS_PERFORMANCE_DATA, PAID_ADS_ANALYSIS_PERFORMANCE_DATA } from '../../constants';
import { areasplineChartOptions, columnChartOptions, radarChartOptions } from 'Constants/Charts';
import { CHANNEL_ANALYTICS } from 'Constants/GlobalConstant/Placeholders';
import { analytics_medium, bookmark_medium, calendar_medium, channel_action_medium, circle_info_medium, collapse_medium, compare_medium, expand_medium, user_network_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import moment from 'moment';


import RSDateRangePicker from 'Components/RSDateRangePicker';
import Icon, { Icons } from 'Components/Icon/Icon';
import RSTabbarSlide from 'Components/RSTabberSlide';
import RSPTab from 'Components/RSPTab';
import RSHighchartsContainer from 'Components/Highcharts';

import NotesModal from './Components/NotesModal';
import Notes from 'Pages/AuthenticationModule/Audience/Pages/MasterData/Component/ListActivity/Components/Notes';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getSummaryList, getTrends } from 'Reducers/analytics/analyticsSummary/selector';
import { getCommunicationTrends } from 'Reducers/analytics/analyticsSummary/request';
import { getSessionId } from 'Reducers/globalState/selector';
import useQueryParams from 'Hooks/useQueryParams';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';
import { updateSummarySubSegmentDetail } from 'Reducers/analytics/analyticsSummary/reducer';
import { AnalyticsReportProvider } from '../..';
import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';
import {
    AnalyticsReportChannelAnalyticsSkeleton,
    AnalyticsReportCommAnalysisChartBodySkeleton,
} from 'Components/Skeleton/pages/analytics';
import RSTooltip from 'Components/RSTooltip';

const NOTEDATA_INITIAL_STATE = {
    notesEnable: false,
};

const CommunicationAnalysis = ({ analyticsTab, date, isDownloadUI = false }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const state = useQueryParams('/analytics/analytics-report');
    const { createdDate } = getUserDetails();
    const summary = useSelector((state) => getSummaryList(state));
    let isEmptyFactModel = Object.entries(summary?.factModel ?? {}).every(([_, value]) => value === null);
    const analyticsReportReducer = useSelector(({ analyticsReportReducer }) => analyticsReportReducer);
    const trends = useSelector((state) => getTrends(state));
    const { trendsLoading, summaryLoading, retargetListLoading } = useSelector(
        (state) => state.analyticsReportReducer,
    );
    const { line = {}, radar = {}, column = {} } = trends;

    const { refAPIStatus, lastUpdateMetaDataSnapshotRef, audienceDetailsModalRef } =
        useContext(AnalyticsReportProvider);
    const [activeChannelTabIndex, setActiveChannelTabIndex] = useState(
        summary?.snapMetaData?.channelIndex ?? 0,
    );

    useEffect(() => {
        if (summary?.snapMetaData?.channelIndex != null) {
            setActiveChannelTabIndex(summary.snapMetaData.channelIndex);
        }
    }, [summary?.snapMetaData?.channelIndex]);

    const showAudienceDetailsInfo =
        !isDownloadUI &&
        summary?.campaignType !== 'T' &&
        !(summary?.channelList?.includes(10) && summary?.channelList?.length === 1);

    const handleOpenAudienceDetails = () => {
        const channelId = analyticsTab?.[activeChannelTabIndex]?.channelId;
        audienceDetailsModalRef?.current?.open?.(channelId);
    };

    const updateSnapshotMeta = useCallback(
        (partial) => {
            if (!lastUpdateMetaDataSnapshotRef) return;
            lastUpdateMetaDataSnapshotRef.current = {
                ...(lastUpdateMetaDataSnapshotRef.current ?? {}),
                ...partial,
            };
        },
        [lastUpdateMetaDataSnapshotRef],
    );

    const [note, setNote] = useState({ show: false, data: {} });
    const [show, setIsShow] = useState(NOTEDATA_INITIAL_STATE);
    const [expandedState, setExpandedState] = useState(false);
    const lineChartRef = useRef(null);
    const [selectedChart, setSelectedChart] = useState('line');
    const [updateSelectedDate, setUpdateSelectDate] = useState({
        start: new Date(state?.startDate),
        end: new Date(state?.endDate),
    });
    const [updateSelectedDateProps, setUpdateSelectDateProps] = useState({
        start: updateSelectedDate?.start,
        end: updateSelectedDate?.end,
    });

    useEffect(() => {
        setUpdateSelectDateProps({
            start: updateSelectedDate?.start,
            end: updateSelectedDate?.end,
        });
    }, [updateSelectedDate]);

    const [communicationAnalysisPayload, setCommunicationAnalysisPayload] = useState({
        // campaignId:  state.from,
        // analyticsType: 1,
        // channelId: [1],
        // startDate: '',
        // endDate: '',
        // metricType: 1,
        // chartType: '',
        // channelName: 'All channels',
        clientId,
        departmentId,
        userId,
        campaignId: state?.from,
        analyticsType: 1,
        channelId: summary?.channelList, //[(1, 2, 3, 8, 9, 21, 25)],
        startDate: state?.startDate, // '06/05/2023',
        endDate: state?.endDate, //'07/15/2023',
        metricType: 'Reach', //1
        chartType: selectedChart,
        channelName: 'All channels',
    });
    useEffect(() => {
        if (state && Object.keys(summary)?.length > 0 && !summary?.isFromSnapshot) {
            const startDate =
                getYYMMDD(state?.startDate) || getYYMMDD(summary?.startDate);
            const endDate =
                (new Date(state?.endDate) > new Date() ? getYYMMDD(new Date()) : getYYMMDD(state?.endDate)) ||
                (new Date(summary?.endDate) > new Date() ? getYYMMDD(new Date()) : getYYMMDD(summary?.endDate));
            const channelId = summary?.channelList;            
            const metricType =
                summary?.channelList?.length === 1 && summary?.channelList?.[0] === 10 ? 'Interaction' : 'Reach';
            setCommunicationAnalysisPayload((pre) => ({
                ...pre,
                campaignId: state?.from,
                startDate,
                endDate,
                channelId,
                metricType,
            }));
            setUpdateSelectDate({
                start: new Date(state?.startDate),
                end: new Date(state?.endDate),
            });
            updateSnapshotMeta({
                communicationAnalysisDateRange: { startDate, endDate },
                communicationAnalysisChannelId: { channelId, channelName: 'All channels' },
                communicationAnalysisMetricType: metricType,
                communicationAnalysisChartType:
                    lastUpdateMetaDataSnapshotRef?.current?.communicationAnalysisChartType ?? 'line',
            });
        }
    }, [state, summary]);

    const [pendingChartType, setPendingChartType] = useState(null);
    const activeChartType = communicationAnalysisPayload.chartType;

    useEffect(() => {
        if (!pendingChartType || trendsLoading || summaryLoading) return;
        if (pendingChartType !== activeChartType) return;
        setPendingChartType(null);
    }, [pendingChartType, trendsLoading, summaryLoading, activeChartType]);

    useEffect(() => {
        if (state?.from > 0) {
            if (
                communicationAnalysisPayload?.campaignId &&
                communicationAnalysisPayload?.channelId &&
                Object.keys(summary)?.length > 0 &&
                !refAPIStatus?.current?.preventOtherApiCall &&
                !summary?.isFromSnapshot
            ) {
                setPendingChartType(communicationAnalysisPayload.chartType);
                dispatch(
                    getCommunicationTrends({
                        payload: { ...communicationAnalysisPayload, clientId, userId, departmentId },
                        key: communicationAnalysisPayload.chartType,
                    }),
                );
            }
        }
    }, [summary, communicationAnalysisPayload, state]);

    const callBack = (e, record) => {
        // setNote({ show: true, data: record });
    };

    const chartData = useMemo(() => {
        let tmpLine = { ...line };
        // console.log('tmpLine: ', tmpLine);
        tmpLine.series = tmpLine?.series?.map((res) => {
            return {
                point: {
                    events: {
                        click: (e) => {
                            return callBack(e?.point, res);
                        },
                    },
                },
                data: res?.data,
                name: res.name,
            };
        });
        return tmpLine;
    }, [line]);

    const isLineChartEmpty = useMemo(() => {
        if (trendsLoading || summaryLoading) return false;
        const series = line?.series;
        if (!Array.isArray(series) || series.length === 0) return true;
        return !series.some(
            (item) => Array.isArray(item?.data) && item.data.some((value) => Number(value) > 0),
        );
    }, [line, trendsLoading, summaryLoading]);

    const isColumnChartEmpty = useMemo(() => {
        if (trendsLoading || summaryLoading) return false;
        const series = column?.series;
        if (!Array.isArray(series) || series.length === 0) return true;
        return !series.some(
            (item) => Array.isArray(item?.data) && item.data.some((value) => Number(value) > 0),
        );
    }, [column, trendsLoading, summaryLoading]);

    const isRadarChartEmpty = useMemo(() => {
        if (trendsLoading || summaryLoading) return false;
        const series = radar?.series;
        if (!Array.isArray(series) || series.length === 0) return true;
        return !series.some(
            (item) => Array.isArray(item?.data) && item.data.some((value) => Number(value) > 0),
        );
    }, [radar, trendsLoading, summaryLoading]);

    const chartBarData = useMemo(() => {
        const tmpBar = { ...column };
        tmpBar.series = tmpBar?.series?.map((res) => ({
            data: res?.data?.map((data) => Number(data)),
            name: res.name,
        }));

        if (tmpBar?.categories) {
            const { configuredFormat } = getDateFormat();

            tmpBar.fullDates = tmpBar.categories.map((category) => {
                if (!category) return category;
                const dateObj = moment(category, configuredFormat, true);
                if (dateObj.isValid()) {
                    const formatted = getUserCurrentFormat(dateObj.toDate());
                    return formatted?.dateFormat || category;
                }
                return category;
            });

            tmpBar.categories = tmpBar.categories.map((category) => {
                if (!category) return category;
                const dateObj = moment(category, configuredFormat, true);
                if (dateObj.isValid()) {
                    const formatted = getUserCurrentFormat(dateObj.toDate());
                    return formatted?.dateFormat || formatted?.dayMonth || category;
                }
                return category;
            });
        }

        return tmpBar;
    }, [column]);

    const channels = (summary?.channelList ?? []).map((id) => ({
        id,
        name: id === 2 ? 'SMS' : getChannelId(id)?.label,
    }));
    const channelSort = channels.sort((a, b) => a.id - b.id);
    const allChannels = [{ id: 'all', name: 'All channels', channelList: summary?.channelList }, ...channelSort];

    const getMetricDisplayName = (metricTypeId) => {
        const found = ANALYSIS_PERFORMANCE_DATA.find(item => item.id === metricTypeId);
        return found?.name || metricTypeId;
    };

    const isCommChartTypePending = (chartType) =>
        summaryLoading ||
        pendingChartType === chartType ||
        (trendsLoading && activeChartType === chartType);

    const isCommChartLineLoading = isCommChartTypePending('line');
    const isCommChartColumnLoading = isCommChartTypePending('column');
    const isCommChartRadarLoading = isCommChartTypePending('radar');
    const isLineChartNoData = !isCommChartLineLoading && isLineChartEmpty;
    const isColumnChartNoData = !isCommChartColumnLoading && isColumnChartEmpty;
    const isRadarChartNoData = !isCommChartRadarLoading && isRadarChartEmpty;

    const isCommChartLineSkeleton = isCommChartLineLoading || isLineChartEmpty;
    const isCommChartColumnSkeleton = isCommChartColumnLoading || isColumnChartEmpty;
    const isCommChartRadarSkeleton = isCommChartRadarLoading || isRadarChartEmpty;
    const isCommChartPortletSkeleton =
        isCommChartLineLoading ||
        isCommChartColumnLoading ||
        isLineChartEmpty ||
        isColumnChartEmpty;
    const showChannelUnpublishedMsg = Boolean(state?.subSegmentFriendlyName && !summaryLoading);
    const showChannelAnalyticsSkeleton =
        summaryLoading || (isEmptyFactModel && !showChannelUnpublishedMsg);
    const showChannelAnalyticsPortletArsk = showChannelAnalyticsSkeleton || retargetListLoading;

    const tabData = [
        {
            id: 'line',
            icon: channel_action_medium,
            tooltip: 'Line chart',
            component: () => (
                <Fragment key={'line_chart'}>
                    {isCommChartLineSkeleton ? (
                        <AnalyticsReportCommAnalysisChartBodySkeleton
                            stopAnimation={isLineChartNoData}
                            isError={isLineChartNoData}
                        />
                    ) : (
                        <RSHighchartsContainer
                            ref={lineChartRef}
                            type="listAcquisitionCompact"
                            skeletonHeight={301}
                            isError={false}
                            pClassName="mt30"
                            options={areasplineChartOptions({
                                formatdatelable: true,
                                useDynamicDateLabels: true,
                                enableXAxisZoom: true,
                                height: expandedState ? window.innerHeight - 250 : undefined,
                                ...chartData,
                            })}
                        />
                    )}
                </Fragment>
            ),
        },
        {
            id: 'column',
            tooltip: 'Bar chart',
            icon: analytics_medium,
            component: () => (
                <Fragment key={'bar_chart'}>
                    {isCommChartColumnSkeleton ? (
                        <AnalyticsReportCommAnalysisChartBodySkeleton
                            variant="column"
                            stopAnimation={isColumnChartNoData}
                            isError={isColumnChartNoData}
                        />
                    ) : (
                        <RSHighchartsContainer
                            type="columnChartNew"
                            isError={false}
                            pClassName="mt30"
                            options={columnChartOptions({
                                useDynamicDateLabels: true,
                                enableXAxisZoom: true,
                                height: expandedState ? window.innerHeight - 250 : undefined,
                                ...chartBarData,
                            })}
                        />
                    )}
                </Fragment>
            ),
        },
    ];

    if (summary?.channelList?.length > 2 && !summary?.issubSegmentEnabled)
        tabData.push({
            id: 'radar',
            tooltip: 'Radar chart',
            icon: user_network_medium,
            // disable: true,
            component: () => (
                <Fragment key={'radar_chart'}>
                    {isCommChartRadarSkeleton ? (
                        <AnalyticsReportCommAnalysisChartBodySkeleton
                            variant="line"
                            stopAnimation={isRadarChartNoData}
                            isError={isRadarChartNoData}
                        />
                    ) : (
                        <RSHighchartsContainer
                            type="pie"
                            isError={false}
                            pClassName="mt30 comm-analysis-radar-chart"
                            options={radarChartOptions(radar)}
                        />
                    )}
                </Fragment>
            ),
        });
    const defaultValueAnalysis = useMemo(() => {
        const data =
            channels[0]?.id === 10 ? PAID_ADS_ANALYSIS_PERFORMANCE_DATA : ANALYSIS_PERFORMANCE_DATA;
        return data?.find((item) =>
            (item?.name === channels[0]?.id) === 10 ? 'Engagement' : communicationAnalysisPayload?.metricType,
        );
    }, [communicationAnalysisPayload, channels, summary]);
    const defaultValueChannels = useMemo(
        () => allChannels?.find((item) => item?.name === communicationAnalysisPayload?.channelName),
        [communicationAnalysisPayload],
    );
    
    const hasData = useMemo(() => {
        const currentData = selectedChart === 'line' ? chartData : chartBarData;
        return currentData?.series?.some(s => s?.data?.length > 0);
    }, [selectedChart, chartData, chartBarData]);

    return (
        <Row>
            <Col md={12}>
                <div
                    className={`portlet-container portlet-height-auto Commuanalysis${
                        isCommChartPortletSkeleton ? ' arsk-portlet arsk-portlet--auto arsk-portlet--comm-chart' : ''
                    }`}
                >
                    <div className="portlet-header">
                        <h4 className="mb0">{`Communication analysis - ${lastUpdateMetaDataSnapshotRef?.
                            current?.communicationAnalysisChartType === 'column' ? 'daily unique count' : 'hourly unique count '}`}</h4>
                        <div className="float-end d-flex align-items-center">
                            {Object.keys(summary)?.length > 0 &&
                                (summary?.isFromSnapshot ? (
                                    (() => {
                                        const meta = summary?.snapMetaData;
                                        const snapStart = meta?.startDate != null ? meta.startDate : summary?.startDate;
                                        const snapEnd = meta?.endDate != null ? meta.endDate : summary?.endDate;
                                        const channelLabel = meta?.channelName || 'All channels';
                                        const metricTypeId = meta?.metricType || 'Reach';
                                        const metricLabel = getMetricDisplayName(metricTypeId);
                                        return (
                                            <>
                                                <span className="fs19 mr15 align-items-center d-flex">
                                                    <i
                                                        className={`${calendar_medium} icon-md mr8 color-primary-blue`}
                                                    />
                                                    {getUserCurrentFormat(snapStart)?.dateFormat} -{' '}
                                                    {getUserCurrentFormat(snapEnd)?.dateFormat}
                                                </span>
                                                <span className="fs19 mr15">
                                                    {channelLabel}
                                                </span>
                                                <span className="fs19">
                                                    {metricLabel}
                                                </span>
                                            </>
                                        );
                                    })()
                                ) : (
                                    <>
                                           <RSDateRangePicker
                                            mainClass="mr10"
                                            onDatePickerClosed={(dates) => {
                                                setUpdateSelectDate({
                                                    start: dates?.startDate,
                                                    end: dates?.endDate,
                                                });
                                                setCommunicationAnalysisPayload((pre) => ({
                                                    ...pre,
                                                    startDate: getYYMMDD(dates.startDate),
                                                    endDate: getYYMMDD(dates.endDate),
                                                }));
                                                 updateSnapshotMeta({
                                                    communicationAnalysisDateRange: {
                                                        startDate: getYYMMDD(dates.startDate),
                                                        endDate: getYYMMDD(dates.endDate),
                                                    },
                                                });
                                            }}
                                            selectedFullDate={{
                                                start: new Date(summary?.startDate) ?? updateSelectedDate?.start,
                                                end:
                                                    new Date(summary?.endDate) > new Date()
                                                        ? new Date()
                                                        : new Date(summary?.endDate),
                                            }}
                                            selectedDateText={'All time'}
                                            isAnalytics
                                            startDate={new Date(summary?.startDate)}
                                            endDate={
                                                new Date(summary?.endDate) > new Date()
                                                    ? new Date()
                                                    : new Date(summary?.endDate)
                                            }
                                        />
                                        <RSBootstrapdown
                                            data={allChannels}
                                            defaultItem={defaultValueChannels}
                                            customAlignRight={true}
                                            alignRight
                                            isActive
                                            isObject
                                            fieldKey="name"
                                            className="arrowdropdown mr15"
                                            onSelect={(channel) => {
                                                const { id, name, channelList } = channel;
                                                setCommunicationAnalysisPayload((pre) => ({
                                                    ...pre,
                                                    channelId: id === 'all' ? channelList : [id],
                                                    channelName: name,
                                                }));
                                                updateSnapshotMeta({
                                                    communicationAnalysisChannelId: {
                                                        channelId: id === 'all' ? channelList : [id],
                                                        channelName: name,
                                                    },
                                                });
                                            }}
                                        />
                                        <RSBootstrapdown
                                            data={
                                                channels?.length === 1 && channels[0]?.id === 10
                                                    ? PAID_ADS_ANALYSIS_PERFORMANCE_DATA
                                                    : ANALYSIS_PERFORMANCE_DATA
                                            }
                                            defaultItem={defaultValueAnalysis}
                                            customAlignRight={true}
                                            alignRight
                                            isObject
                                            isActive
                                            fieldKey="name"
                                            className="arrowdropdown"
                                            onSelect={(metricType) => {
                                                setCommunicationAnalysisPayload((pre) => ({
                                                    ...pre,
                                                    metricType: metricType?.id,
                                                }));
                                                updateSnapshotMeta({
                                                    communicationAnalysisMetricType: metricType?.name,
                                                });
                                            }}
                                        />
                                        <RSTooltip
                                            text={expandedState ? 'Collapse' : 'Expand'}
                                            position={expandedState ? 'bottom' : 'top'}
                                            innerContent={ expandedState ? true : false}
                                            className={`ml15 toolTipOverlayZindexCSS ${!hasData ? 'click-off pe-none' : ''}`}
                                        >
                                            <Icon
                                                icon={expandedState ? collapse_medium : expand_medium}
                                                color="color-primary-blue"
                                                size="md"
                                                callBack={(event) => {
                                                    setExpandedState(!expandedState);
                                                }}
                                            />
                                        </RSTooltip>
                                    </>
                                ))}
                        </div>
                    </div>
                    <div className="portlet-sub-header position-relative">
                        <div className="float-end position-absolute right0 zIndex1 top4">
                            <Icons groupCass="float-end d-none">
                                <Icon
                                    id="rs_data_bookmark"
                                    icon={bookmark_medium}
                                    size="md"
                                    tooltip="Notes"
                                    mainClass=""
                                    callBack={() => {
                                        setIsShow((prev) => ({ ...prev, notesEnable: !show.notesEnable }));
                                    }}
                                />
                                <Icon
                                    icon={compare_medium}
                                    size="md"
                                    tooltip="Compare"
                                    callBack={() => navigate(`/analytics/trend-report`)}
                                />
                            </Icons>
                            {show.notesEnable && (
                                <div className="note-accordion box-design position-absolute  right15 top30">
                                    <Notes
                                        handleClose={(status) => {
                                            if (!status)
                                                setIsShow((prev) => ({
                                                    ...prev,
                                                    notesEnable: !show.notesEnable,
                                                }));
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                        <RSPTab
                            dynamicTab={``}
                            defaultClass={``}
                            className={`icons-tab ${summary?.isFromSnapshot ? 'click-off' : ''}`}
                            activeClass={`active`}
                            tabData={tabData}
                            callBack={({ id }) => {
                                if (communicationAnalysisPayload.chartType === id) return;
                                setPendingChartType(id);
                                setCommunicationAnalysisPayload((pre) => ({ ...pre, chartType: id }));
                                updateSnapshotMeta({ communicationAnalysisChartType: id });
                            }}
                            defaultTab={summary?.snapMetaData?.chartType === 'column' ? 1 : 0}
                        />
                    </div>
                </div>
                {/* Table Section */}
                <div
                    className={`portlet-container portlet-height-auto Commuanalysis${
                        showChannelAnalyticsPortletArsk
                            ? ' arsk-portlet arsk-portlet--auto arsk-portlet--comm-table'
                            : ''
                    }`}
                >
                    {Object.keys(summary)?.length && summary?.csrSubSegmentList?.length ? (
                        <div className={`portlet-header float-end`}>
                            {/* <h3>Communication analysis table</h3> */}
                            <div className="">
                                <RSBootstrapdown
                                    data={summary?.csrSubSegmentList}
                                    flatIcon
                                    showUpdate
                                    defaultItem={
                                        safeObjectKeys(analyticsReportReducer?.summarySubSegmentDetail).length
                                            ? analyticsReportReducer?.summarySubSegmentDetail
                                            : summary?.csrSubSegmentList[0]
                                    }
                                    className="float-end"
                                    onSelect={async (item) => {
                                        refAPIStatus.current.preventOtherApiCall = true;
                                        refAPIStatus.current.firstTimeAPICalled = false;
                                        await dispatch(updateSummarySubSegmentDetail(item));
                                    }}
                                    isObject
                                    fieldKey="subSegmentFriendlyName"
                                    isActive
                                />
                            </div>
                        </div>
                    ) : null}

                    <div className="portlet-body">
                        <div
                            className={`portlet-fluid-tab mt0 ${
                                analyticsTab?.length ? '' : 'p0 no-box-shadow border-0'
                            }`}
                        >
                            {!summaryLoading && !isEmptyFactModel ? (
                                <>
                                    <div className="portlet-header d-flex justify-content-inherit align-items-center">
                                        <h4 className="mb0">{CHANNEL_ANALYTICS}</h4>
                                        {showAudienceDetailsInfo && (
                                            <Icon
                                                mainClass="ml5"
                                                icon={circle_info_medium}
                                                id="rs_channel_analytics_info"
                                                size="md"
                                                color="color-primary-blue"
                                                callBack={handleOpenAudienceDetails}
                                                tooltip="Info"
                                            />
                                        )}
                                    </div>
                                    <RSTabbarSlide
                                        tabData={analyticsTab}
                                        dynamicTab={`mb0 mini detail-analytics-tab`}
                                        activeClass={`active`}
                                        className={`rs-tabs row detail-tabs`}
                                        defaultTab={summary?.snapMetaData?.channelIndex ?? 0}
                                        tabMaxLength={5}
                                        callBack={(data, index) => {
                                            setActiveChannelTabIndex(index);
                                            updateSnapshotMeta({ communicationAnalysisTabIndex: index });
                                        }}
                                    />
                                </>
                            ) : showChannelUnpublishedMsg ? (
                                <div>
                                    <RSSkeletonTable
                                        message={`Communication ${state?.subSegmentFriendlyName} is still unpublished. Please review after it has been published.`}
                                        text
                                        isCustombox
                                    />
                                </div>
                            ) : (
                                <AnalyticsReportChannelAnalyticsSkeleton nodata={!summaryLoading} />
                            )}
                        </div>
                    </div>
                </div>
            </Col>
            <NotesModal note={note} handleClose={() => setNote((prev) => ({ ...prev, show: false }))} />
        </Row>
    );
};

export default memo(CommunicationAnalysis);
