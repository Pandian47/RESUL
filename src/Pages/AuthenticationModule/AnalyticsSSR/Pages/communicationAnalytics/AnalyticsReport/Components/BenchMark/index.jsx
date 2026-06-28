import { ch_primary_blue } from 'Constants/GlobalConstant/Colors/colorsVariable';
import { AS_ON } from 'Constants/GlobalConstant/Placeholders';
import { getChannelId } from 'Utils/modules/communicationChannels';
import { getAPICurrentDateTimeFormat } from 'Utils/modules/dateTime';
import { columnChartOptions } from 'Constants/Charts';
import { arrow_down_medium, arrow_up_medium, goals_benchmark_large, user_goals_benchmark_large } from 'Constants/GlobalConstant/Glyphicons';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import _map from 'lodash/map';

import { BootstrapDropdown } from 'Components/RSBootstrapDropDown';
import RSHighchartsContainer from 'Components/Highcharts';
import RSCard from 'Components/RSCard/RSCard';
import _get from 'lodash/get';

import { ANALYSIS_PERFORMANCE_DATA, INDUSTRY_BENCHMARK, MY_BENCHMARKS, PAID_ADS_ANALYSIS_PERFORMANCE_DATA, getBenchmarkModeLabel, getMyBenchmarkTypeLabel, getIndustryBenchmarkTypeLabel } from '../../constants';
import { getBenchmarkList, getSummaryList } from 'Reducers/analyticsSSR/analyticsSummary/selector';
import { useDispatch, useSelector } from 'react-redux';
import { getBenchmark } from 'Reducers/analyticsSSR/analyticsSummary/request';

import { getSessionId } from 'Reducers/globalState/selector';
import { PerformanceBenchmarkSkeleton } from 'Components/Skeleton/Skeleton';
import RSTooltip from 'Components/RSTooltip';
import useQueryParams from 'Hooks/useQueryParams';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';
import { AnalyticsReportProvider } from '../..';

var benchType = 'Reach';
const hideColor = '#e9e9eb';

const BenchMark = ({ benchRef, campaignName, date, isDownloadUI }) => {
    const benchMark = useSelector((state) => getBenchmarkList(state));
    const { clientId, departmentId, userId } = useSelector((state) => getSessionId(state));
    // const { state } = useLocation();
    const summary = useSelector((state) => getSummaryList(state));
    const state = useQueryParams('/AnalyticsSSE/analytics-report');
    const dispatch = useDispatch();

    const { refAPIStatus,lastUpdateMetaDataSnapshotRef } = useContext(AnalyticsReportProvider);
    const benchmarkApiCalled = useRef(false);

    const [benchmarkValue, setBenchmarkValue] = useState({
        industry: 1,
        benchmark: 1,
        benchmarkStatus: true,
    });
    const totalReachPercentage = _get(summary, 'channelReachInfo.reachPercentage')
    const totalEngagementPercentage = _get(summary, 'channelEngagementInfo.engagementPercentage')
    const totalConversionPercentage = _get(summary, 'channelConversionInfo.conversionPercentage')

    const getGoalPercentageByMode = (mode) => {
        switch (mode) {
            case 1: 
                return totalReachPercentage;
            case 2: 
                return totalEngagementPercentage;
            case 3:
                return totalConversionPercentage;
            default:
                return totalReachPercentage;
        }
    };
    const [payload, setPayload] = useState({
        campaignId: state?.from,
        mode: 1,
        benchmark: 1,
        clientBenchmark: 0,
        clientId,
        departmentId,
        userId,
        jobDateTime: summary?.jobDateTime || getAPICurrentDateTimeFormat(),
        goalPercentage: getGoalPercentageByMode(1)
    });
    

    const isPaidMediaOnlyCampaign =
        summary?.channelList?.includes(10) && summary?.channelList?.length === 1;

    useEffect(() => {
        if (Object.keys(summary)?.length > 0 && !summary?.isFromSnapshot) {
            const mode = isPaidMediaOnlyCampaign ? 2 : 1;
            setPayload((prevPayload) => ({
                ...prevPayload,
                campaignId: state?.from,
                mode,
                jobDateTime: summary?.jobDateTime || getAPICurrentDateTimeFormat()
            }));
        }
    }, [state, summary, isPaidMediaOnlyCampaign]);

    useEffect(() => {
        if (payload.campaignId && Object.keys(summary)?.length > 0 && !refAPIStatus?.current?.preventOtherApiCall &&  _get(summary, 'channelReachInfo.reachPercentage') !== undefined && !benchmarkApiCalled.current && !summary?.isFromSnapshot) {
            benchmarkApiCalled.current = true;
            dispatch(getBenchmark(
                {
                    ...payload,
                    goalPercentage: getGoalPercentageByMode(payload.mode),
                    jobDateTime: summary?.jobDateTime || getAPICurrentDateTimeFormat()
                }
            ));
        }
    }, [JSON.stringify(payload),JSON.stringify(summary)]);

    const getBenchMark = (val, type) => {
        benchmarkApiCalled.current = false; 
        if (type === 'benchmark') setPayload((prev) => ({ ...prev, [type]: val.id, clientBenchmark: 0 }));
        else if (type === 'clientBenchmark') setPayload((prev) => ({ ...prev, [type]: val.value, benchmark: 0 }));
        else setPayload((prev) => ({ ...prev, [type]: val.value }));
    };

    const performanceBenchmark = useMemo(() => {
        const chart = benchMark?.chartType;
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
                isBenchmark:true 
            },
            // hover: {
            //     color: ch_primary_blue,
            // },
            legend: {
                enabled: false,
            },
            series: _map(chartSeries, (bench) => ({
                name: bench.name,
                data: bench.data?.map((val) => +val),
                color: bench.color,
                className: bench.color === hideColor ? 'd-none' : '',
            })),
        };
        return chartData;
    }, [benchMark]);

    const defaultAnalysisPerformance = useMemo(() => {
        const data = isPaidMediaOnlyCampaign
            ? PAID_ADS_ANALYSIS_PERFORMANCE_DATA
            : ANALYSIS_PERFORMANCE_DATA;
        return data?.find((item) => item?.value === (isPaidMediaOnlyCampaign ? 2 : 1));
    }, [payload, summary, isPaidMediaOnlyCampaign]);

    const benchMarkJobDateTime = summary?.jobDateTime || getAPICurrentDateTimeFormat()
    return (
        <div ref={benchRef}>
            <Row>
                <Col>
                    <div className="portlet-container portlet-height-auto">
                        <div className="portlet-header">
                            <h4 className="d-flex align-items-center gap-2 mb0">Performance vs benchmark: {campaignName}{" "}
                              {/* {benchMarkJobDateTime && (
                                <small className="color-primary-grey">
                                    ({AS_ON}:    {getUserCurrentFormat(benchMarkJobDateTime,{isOffset:true})?.utcformat})
                                </small>
                              )}    */}
                            </h4>
                            {(summary?.isFromSnapshot || isDownloadUI) ? (
                                <div className="float-end d-flex align-items-center">
                                    {summary?.isFromSnapshot ? (
                                        (() => {
                                            const meta = summary?.snapMetaData;
                                            const mode = meta?.mode != null ? Number(meta.mode) : 1;
                                            const benchmark = meta?.benchmark != null ? Number(meta.benchmark) : 1;
                                            const clientBenchmark = meta?.clientBenchmark != null ? Number(meta.clientBenchmark) : 0;
                                            return (
                                                <>
                                                    <span className="fs19 mr15 d-inline-flex align-items-center pdf-export-dropdown-label">
                                                        {getBenchmarkModeLabel(mode)}
                                                    </span>
                                                    <span className="fs19 mr15 d-inline-flex align-items-center">
                                                        <i
                                                            className={`${goals_benchmark_large} icon-lg mr5 color-primary-blue`}
                                                        />
                                                        {getIndustryBenchmarkTypeLabel(clientBenchmark)}
                                                    </span>
                                                    <span className="fs19 mr15 d-inline-flex align-items-center">
                                                        <i
                                                            className={`${user_goals_benchmark_large} icon-lg mr5 color-primary-blue`}
                                                        />
                                                        {getMyBenchmarkTypeLabel(benchmark)}
                                                    </span>
                                                </>
                                            );
                                        })()
                                    ) : (
                                        <>
                                            <span className="fs19 mr15 d-inline-flex align-items-center pdf-export-dropdown-label">
                                                {getBenchmarkModeLabel(payload?.mode)}
                                            </span>
                                            <span className="fs19 mr15 d-inline-flex align-items-center">
                                                <i
                                                    className={`${goals_benchmark_large} icon-lg mr5 color-primary-blue`}
                                                />
                                                {benchmarkValue?.benchmarkStatus
                                                    ? getIndustryBenchmarkTypeLabel(payload?.benchmark)
                                                    : getMyBenchmarkTypeLabel(payload?.clientBenchmark)}
                                            </span>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="float-end d-flex">
                                    <RSBootstrapdown
                                        data={
                                            isPaidMediaOnlyCampaign
                                                ? PAID_ADS_ANALYSIS_PERFORMANCE_DATA
                                                : ANALYSIS_PERFORMANCE_DATA
                                        }
                                        defaultItem={defaultAnalysisPerformance}
                                        alignRight
                                        isObject
                                        isActive
                                        fieldKey="name"
                                        className={`arrowdropdown ${isDownloadUI ? 'analytics-dropdown' : ''}`}
                                        onSelect={(bench) => {
                                            lastUpdateMetaDataSnapshotRef.current = {
                                                ...lastUpdateMetaDataSnapshotRef.current,
                                                benchmarkMode: bench.value,
                                            }
                                            benchmarkApiCalled.current = false;
                                            setPayload(prevPayload => ({
                                                ...prevPayload,
                                                goalPercentage: getGoalPercentageByMode(bench.value),
                                                mode: bench.value
                                            }));
                                        }}
                                    />

                                    {/* // ICON_UPDATE {Stephen}: Update the icons */}
                                    <BootstrapDropdown
                                        data={INDUSTRY_BENCHMARK}
                                        flatIcon
                                        defaultItem={
                                            <RSTooltip
                                                position="top"
                                                text="Industry benchmarks"
                                                innerContent={false}
                                                className="lh0"
                                            >
                                                <i
                                                    className={`${goals_benchmark_large} icon-lg`}
                                                    id="rs_BenchMark_goals_benchmark"
                                                />
                                            </RSTooltip>
                                        }
                                        showUpdate={false}
                                        className="no_caret mx15"
                                        alignRight
                                        iconFlag={true}
                                        isObject
                                        fieldKey="name"
                                        onSelect={(industry) => {
                                            lastUpdateMetaDataSnapshotRef.current = {
                                                ...lastUpdateMetaDataSnapshotRef.current,
                                                industryBenchmarkId: industry.id,
                                            };
                                            getBenchMark(industry, 'benchmark');
                                            setBenchmarkValue((pre) => ({
                                                ...pre,
                                                industry: industry.id,
                                                benchmarkStatus: true,
                                            }));
                                        }}
                                    />
                                    <BootstrapDropdown
                                        className={' no_caret'}
                                        data={MY_BENCHMARKS}
                                        flatIcon
                                        defaultItem={
                                            <RSTooltip
                                                position="top"
                                                text="My benchmarks"
                                                innerContent={false}
                                                className="lh0"
                                            >
                                                <i
                                                    className={`${user_goals_benchmark_large} icon-lg`}
                                                    id="rs_BenchMark_user_goals"
                                                />
                                            </RSTooltip>
                                        }
                                        showUpdate={false}
                                        alignRight
                                        isObject
                                        fieldKey="name"
                                        onSelect={(myBench) => {
                                            lastUpdateMetaDataSnapshotRef.current = {
                                                ...lastUpdateMetaDataSnapshotRef.current,
                                                myBenchmarkId: myBench.value,
                                            };
                                            getBenchMark(myBench, 'clientBenchmark');
                                            setBenchmarkValue((pre) => ({
                                                ...pre,
                                                benchmark: myBench.id,
                                                benchmarkStatus: false,
                                            }));
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="portlet-body">
                            {Object.keys(benchMark)?.length !== 0 && !benchMark?.loading  ? (
                                <>
                                    {benchmarkValue.benchmarkStatus ? (
                                        <>
                                            {benchmarkValue.industry === 1 ? (
                                                <>
                                                    <RSHighchartsContainer
                                                        key="industry"
                                                        type = 'benchMark'
                                                        // smallText={`(As on : ${date})`}
                                                        options={columnChartOptions(performanceBenchmark)}
                                                        isError={!benchMark?.loading}
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    <RSHighchartsContainer
                                                        key="channel"
                                                        // smallText={`(As on : ${date})`}
                                                        type = 'benchMark'
                                                        options={columnChartOptions(performanceBenchmark)}
                                                        isError={!benchMark?.loading}
                                                    />
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            {benchmarkValue.benchmark === 'myCommunication' ? (
                                                <>
                                                    <RSHighchartsContainer
                                                        // smallText={`(As on : ${getCreatedDate(summary?.jobDateTime || getAPICurrentDateTimeFormat())})`}
                                                        type = 'benchMark'
                                                        options={columnChartOptions(performanceBenchmark)}
                                                        isError={!benchMark?.loading}
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    <RSHighchartsContainer
                                                        // smallText={`(As on : ${getCreatedDate(summary?.jobDateTime || getAPICurrentDateTimeFormat())})`}
                                                        options={columnChartOptions(
                                                            // CampaingSummary.performance_mycommunication_channel,
                                                            // 'column',
                                                            performanceBenchmark,
                                                        )}
                                                        type = 'benchMark'
                                                        isError={!benchMark?.loading}
                                                    />
                                                </>
                                            )}
                                        </>
                                    )}
                                    {performanceBenchmark?.series?.some((item) => item?.data?.length > 0) && (
                                        <div className="chart-container">
                                            <ul className="legend-list d-flex justify-content-center">
                                                <li className="green-medium">
                                                    <span className="grey">Industry benchmark</span>
                                                </li>
                                                <li className="orange-medium">
                                                    <span className="grey">Communication performance</span>
                                                </li>
                                                <li className="grey-light">
                                                    <span className="grey">Performance of other communications</span>
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <PerformanceBenchmarkSkeleton isError={!benchMark?.loading} />
                            )}
                        </div>
                    </div>
                </Col>
            </Row>

            {
                <Row>
                    {benchMark?.tableData?.map((bench, index) => {
                        return (
                            <Col md={4} key={bench?.channel}>
                                <RSCard className={'benchmark-view mb30'}>
                                    <Row>
                                        <Col md={8}>
                                            <div className="">
                                                <div className="portlet-header">
                                                    <h4>{bench?.channel}</h4>
                                                </div>
                                                <div className="portlet-body mb15">
                                                    <p>Communication</p>
                                                    <div className="d-flex align-items-center">
                                                        <span>{benchType} rate:</span>
                                                        <h3 className="ml5 font-medium">{bench?.communicationVal}</h3>
                                                        <small className="color-primary-black fs17 position-relative top1">
                                                            %
                                                        </small>
                                                    </div>
                                                </div>
                                                <div className="portlet-footer">
                                                    <div className="p-label d-flex align-items-center">
                                                        <label className="color-secondary-black">
                                                            Industry benchmark:{' '}
                                                        </label>
                                                        <span className="ml5 font-medium color-secondary-black">
                                                            {bench?.benchVal}
                                                        </span>
                                                        <small className="fs13 color-secondary-black position-relative top2">
                                                            %
                                                        </small>
                                                    </div>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col md={4} className="d-flex align-items-center justify-content-center">
                                            <div className="portlet-benchmark-icon d-flex flex-column text-center">
                                                <i
                                                    className={`${getChannelId(bench?.channel)?.icon} fs46`}
                                                    style={{ color: `${getChannelId(bench?.channel)?.color}` }}
                                                ></i>
                                                <div className="d-flex align-items-center mt10">
                                                    <h1 className="font-medium">{bench?.diffVal}</h1>
                                                    <small className="fs17 color-primary-black position-relative top2">
                                                        %
                                                    </small>
                                                </div>
                                            </div>
                                            {bench?.positive ? (
                                                <i
                                                    className={`${arrow_up_medium} fw-bold color-green-dark fs32`}
                                                ></i>
                                            ) : (
                                                <i
                                                    className={`${arrow_down_medium} fw-bold color-red-dark fs32`}
                                                ></i>
                                            )}
                                        </Col>
                                    </Row>
                                </RSCard>
                            </Col>
                        );
                    })}
                </Row>
            }
        </div>
    );
};

export default BenchMark;
