import { getChannelId } from 'Utils/modules/communicationChannels';
import { getUserDetails } from 'Utils/modules/crypto';
import { getYYMMDD, getUserCurrentFormat, getDateFormat } from 'Utils/modules/dateTime';
import { ANALYSIS_PERFORMANCE_DATA, PAID_ADS_ANALYSIS_PERFORMANCE_DATA } from '../../constants';
import { areasplineChartOptions, columnChartOptions, radarChartOptions } from 'Constants/Charts';
import { CHANNEL_ANALYTICS } from 'Constants/GlobalConstant/Placeholders';
import { analytics_medium, bookmark_medium, calendar_medium, channel_action_medium, compare_medium, user_network_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, memo, useContext, useEffect, useMemo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import _map from 'lodash/map';
import _get from 'lodash/get';
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
import { getSummaryList, getTrends } from 'Reducers/analyticsSSR/analyticsSummary/selector';
import { getCommunicationTrends } from 'Reducers/analyticsSSR/analyticsSummary/request';
import { getSessionId } from 'Reducers/globalState/selector';
import useQueryParams from 'Hooks/useQueryParams';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';
import { updateSummarySubSegmentDetail } from 'Reducers/analyticsSSR/analyticsSummary/reducer';
import { AnalyticsReportProvider } from '../..';
import { every } from 'lodash';
import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';
const NOTEDATA_INITIAL_STATE = {
    notesEnable: false,
};

const CommunicationAnalysis = ({ analyticsTab, date }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    // const { state } = useLocation();
    const state = useQueryParams('/AnalyticsSSE/analytics-report');
    // const state = { from: 65889 };
    const { createdDate } = getUserDetails();
    const summary = useSelector((state) => getSummaryList(state));
    let isEmptyFactModel = every(Object.entries(_get(summary, 'factModel', {})), ([_, value]) => value === null);
    const analyticsReportSSRReducer = useSelector(({ analyticsReportSSRReducer }) => analyticsReportSSRReducer);
    const trends = useSelector((state) => getTrends(state));
    const { trendsLoading, summaryLoading } = useSelector((state) => state.analyticsReportSSRReducer);
    const { line = {}, radar = {}, column = {} } = trends;

    const { refAPIStatus, lastUpdateMetaDataSnapshotRef } = useContext(AnalyticsReportProvider);

    const [note, setNote] = useState({ show: false, data: {} });
    const [show, setIsShow] = useState(NOTEDATA_INITIAL_STATE);
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
            const metricType = summary?.channelList?.includes(10) ? 'Interaction' : 'Reach';
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
            lastUpdateMetaDataSnapshotRef.current = {
                ...lastUpdateMetaDataSnapshotRef.current,
                communicationAnalysisDateRange: { startDate, endDate },
                communicationAnalysisChannelId: { channelId, channelName: 'All channels' },
                communicationAnalysisMetricType: metricType,
                communicationAnalysisChartType:
                    lastUpdateMetaDataSnapshotRef.current?.communicationAnalysisChartType ?? 'line',
            };
        }
    }, [state, summary]);

    useEffect(() => {
        if (state?.from > 0) {
            if (
                communicationAnalysisPayload?.campaignId &&
                communicationAnalysisPayload?.channelId &&
                Object.keys(summary)?.length > 0 &&
                !refAPIStatus?.current?.preventOtherApiCall &&
                !summary?.isFromSnapshot
            ) {
                dispatch(
                    getCommunicationTrends({
                        payload: { ...communicationAnalysisPayload, clientId, userId, departmentId },
                        // payload: { ...communicationAnalysisPayload, clientId: 1925, userId, departmentId: 2 },
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
            // console.log('res: ', res);
            return {
                point: {
                    events: {
                        click: (e) => {
                            return callBack(e?.point, res);
                        },
                    },
                },
                title: tmpLine?.categories,
                data: res?.data?.map((data, index) => {
                    data = Number(data);
                    return data;
                }),
                name: res.name,
                // tmp: res?.tmp,
                // ...res,
            };
        });
        // tmpLine.categories = ['Communication analysis'];
        return tmpLine;
    }, [line]);

    const chartBarData = useMemo(() => {
        let tmpBar = { ...column };
        // console.log('map :::: ', tmpBar, trends, analyticsTab);
        tmpBar.series = tmpBar?.series?.map((res) => {
            return {
                // point: {
                //     events: {
                //         click: (e) => {
                //             return callBack(e?.point, res);
                //         },
                //     },
                // },
                data: res?.data?.map((data, index) => {
                    data = Number(data);
                    return data;
                }),
                name: res.name,
                // tmp: res?.tmp,
                // ...res,
            };
        });
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

    const channels = _map(_get(summary, 'channelList', []), (id) => ({
        id,
        name: id === 2 ? 'SMS' : getChannelId(id)?.label,
    }));
    const channelSort = channels.sort((a, b) => a.id - b.id);
    const allChannels = [{ id: 'all', name: 'All channels', channelList: summary?.channelList }, ...channelSort];

    const tabData = [
        {
            id: 'line',
            icon: channel_action_medium,
            tooltip: 'Line chart',
            component: () => (
                <Fragment key={'line_chart'}>
                    <RSHighchartsContainer
                        type="area"
                        isError={!trendsLoading && !summaryLoading}
                        pClassName="mt30"
                        options={areasplineChartOptions({ formatdatelable: true, ...chartData })}
                    />
                </Fragment>
            ),
        },
        {
            id: 'column',
            tooltip: 'Bar chart',
            icon: analytics_medium,
            component: () => (
                <Fragment key={'bar_chart'}>
                    <RSHighchartsContainer
                        type="columnChart"
                        isError={!trendsLoading && !summaryLoading}
                        pClassName="mt30"
                        options={columnChartOptions(chartBarData)}
                    />
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
                    <RSHighchartsContainer
                        type="pie"
                        isError={true}
                        pClassName="mt30"
                        options={radarChartOptions(radar)}
                    />
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
    
    // Helper function to map metric type id to display name
    const getMetricDisplayName = (metricTypeId) => {
        const found = ANALYSIS_PERFORMANCE_DATA.find(item => item.id === metricTypeId);
        return found?.name || metricTypeId;
    };
    
    return (
        <Row>
            <Col md={12}>
                <div className="portlet-container portlet-height-auto Commuanalysis">
                    <div className="portlet-header">
                        <h4 className="mb0">Communication analysis</h4>
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
                                                    start: startDate,
                                                    end: endDate,
                                                });
                                                setCommunicationAnalysisPayload((pre) => ({
                                                    ...pre,
                                                    startDate: getYYMMDD(startDate),
                                                    endDate: getYYMMDD(endDate),
                                                }));
                                                lastUpdateMetaDataSnapshotRef.current = {
                                                    ...lastUpdateMetaDataSnapshotRef.current,
                                                    communicationAnalysisDateRange: {
                                                        startDate: getYYMMDD(startDate),
                                                        endDate: getYYMMDD(endDate),
                                                    },
                                                };
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
                                                lastUpdateMetaDataSnapshotRef.current = {
                                                    ...lastUpdateMetaDataSnapshotRef.current,
                                                    communicationAnalysisChannelId: {
                                                        channelId: id === 'all' ? channelList : [id],
                                                        channelName: name,
                                                    },
                                                };
                                            }}
                                        />
                                        <RSBootstrapdown
                                            data={
                                                channels[0]?.id === 10
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
                                                lastUpdateMetaDataSnapshotRef.current = {
                                                    ...lastUpdateMetaDataSnapshotRef.current,
                                                    communicationAnalysisMetricType: metricType?.name,
                                                };
                                            }}
                                        />
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
                                    callBack={() => navigate(`/AnalyticsSSE/trend-report`)}
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
                                setCommunicationAnalysisPayload((pre) => ({ ...pre, chartType: id }));
                                lastUpdateMetaDataSnapshotRef.current = {
                                    ...lastUpdateMetaDataSnapshotRef.current,
                                    communicationAnalysisChartType: id,
                                };
                            }}
                            defaultTab={summary?.snapMetaData?.chartType === 'column' ? 1 : 0}
                        />
                    </div>
                </div>
                {/* Table Section */}
                <div className={`portlet-container portlet-height-auto Commuanalysis `}>
                    {Object.keys(summary)?.length && summary?.csrSubSegmentList?.length ? (
                        <div className={`portlet-header float-end`}>
                            {/* <h3>Communication analysis table</h3> */}
                            <div className="">
                                <RSBootstrapdown
                                    data={summary?.csrSubSegmentList}
                                    flatIcon
                                    showUpdate
                                    defaultItem={
                                        Object.keys(analyticsReportSSRReducer?.summarySubSegmentDetail)?.length
                                            ? analyticsReportSSRReducer?.summarySubSegmentDetail
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
                                    <div className="portlet-header">
                                        <h4 className="mb0">{CHANNEL_ANALYTICS}</h4>
                                    </div>
                                    <RSTabbarSlide
                                        tabData={analyticsTab}
                                        dynamicTab={`mb0 mini detail-analytics-tab`}
                                        activeClass={`active`}
                                        className={`rs-tabs row detail-tabs`}
                                        defaultTab={summary?.snapMetaData?.channelIndex ?? 0}
                                        tabMaxLength={5}
                                        callBack={(data,index) => {
                                            lastUpdateMetaDataSnapshotRef.current = {
                                                ...lastUpdateMetaDataSnapshotRef.current,
                                                communicationAnalysisTabIndex: index,
                                            };
                                        }}
                                    />
                                </>
                            ) : (
                                <div>
                                    <RSSkeletonTable
                                        message={
                                            state?.subSegmentFriendlyName
                                                ? `Communication ${state?.subSegmentFriendlyName} is still unpublished. Please review after it has been published.`
                                                : 'No data available'
                                        }
                                        text={summaryLoading ? false : true}
                                        isCustombox
                                    />
                                </div>
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
