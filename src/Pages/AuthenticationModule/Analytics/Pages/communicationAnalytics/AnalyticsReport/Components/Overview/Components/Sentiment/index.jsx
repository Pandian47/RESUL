import { deCodeId } from 'Utils/modules/crypto';
import { PieChartSkeleton } from 'Components/Skeleton/Skeleton';
import { pieChartOptions, solidgaugeChartOptions } from 'Constants/Charts';
import { arrow_right_mini } from 'Constants/GlobalConstant/Glyphicons';
import { useMemo } from 'react';
import { Col } from 'react-bootstrap';

import RSHighchartsContainer from 'Components/Highcharts';
import { useNavigate } from 'react-router-dom';
import { getIndustrySegmentTopGraphChart, getSummaryList } from 'Reducers/analytics/analyticsSummary/selector';
import { useSelector } from 'react-redux';


const Sentiment = ({ date }) => {
    const navigate = useNavigate();
    const summary = useSelector((state) => getSummaryList(state));
    const campaignId = deCodeId(summary?.encodeCampaignID);
    const isBusiness1 = summary?.businessType === 1;
    const industryTopGraphChart = useSelector((state) => getIndustrySegmentTopGraphChart(state));
    const { segmentIndustry = {} } = summary || {};
    const segmentResult = segmentIndustry?.segmentResult || []

    const processedSegmentData = useMemo(() => {
        const dataToProcess =
            segmentResult?.length > 0
                ? segmentResult.map((i) => ({
                    name: i.segmentName,
                    y: i.segment_cnt,
                    z: i.segment_cnt,
                    isCount: true,
                }))
                : (industryTopGraphChart || []).map((i) => ({
                    name: i.name,
                    y: i.y,
                    z: i.z || i.y,
                    isCount: false,
                }));

        if (dataToProcess.length === 0) return [];

        const aggregated = dataToProcess.reduce((acc, curr) => {
            const existing = acc.find((item) => item.name === curr.name);
            if (existing) {
                existing.y += curr.y;
                existing.z += curr.z;
            } else {
                acc.push({ ...curr });
            }
            return acc;
        }, []);

        const sorted = aggregated.sort((a, b) => b.y - a.y);
        const top4 = sorted.slice(0, 4);
        const remaining = sorted.slice(4);

        let finalData = [...top4];
        if (remaining.length > 0) {
            const othersCount = remaining.reduce((sum, item) => sum + item.y, 0);
            const othersZ = remaining.reduce((sum, item) => sum + (item.z || 0), 0);
            finalData.push({
                name: 'Others',
                y: othersCount,
                z: othersZ,
                isCount: sorted[0]?.isCount,
            });
        }

        const total =
            summary?.channelReachInfo?.totalReachCount ||
            aggregated.reduce((sum, item) => sum + item.y, 0);

        return finalData.map((item) => ({
            ...item,
            y: item.isCount ? (total > 0 ? parseFloat(((item.y / total) * 100).toFixed(2)) : 0) : item.y,
            z: item.z || item.y,
        }));
    }, [segmentResult, industryTopGraphChart, summary?.channelReachInfo?.totalReachCount]);

    const finalSegmentChart = processedSegmentData;
    return (
        <Col md={6}>
            <div className="portlet-container portlet-sm">
                <div className="portlet-header">
                    <h4 className="mb0">{isBusiness1 ? 'Segment' : 'Sentiment'}</h4>
                    {!isBusiness1 && industryTopGraphChart?.length > 0 && (
                        <div
                            // className={industryTopGraphChart?.length === 0 ? 'click-off' : ''}
                            onClick={() => {
                                const state = {
                                    from: 'analytics/analytics-report',
                                    channelName: 'ORM',
                                    campaignId: campaignId,
                                    channelId: 4,
                                };
                                const encryptState = encodeUrl(state);
                                navigate(`/analytics/detail-analytics?q=${encryptState}`, {
                                    state,
                                });
                                // navigate(`/analytics/detail-analytics`, {
                                //     state: {
                                //         from: 'analytics/analytics-report',
                                //         channelName: 'ORM',
                                //         campaignId: campaignId,
                                //     },
                                // });
                            }}
                        >
                            <label className="cp text-warning d-flex align-items-center color-primary-blue">
                                More
                                <i className={`${arrow_right_mini} icon-xs`} id="rs_Sentiment_arrow_right"></i>
                            </label>
                        </div>
                    )}
                </div>

                <div className={`portlet-body ${isBusiness1 ? '' : 'd-flex justify-content-center'}`}>
                    {isBusiness1 ? (
                        !!finalSegmentChart && finalSegmentChart?.length !== 0 ? (
                            <div className="portlet-chart">
                                <RSHighchartsContainer
                                    key={'segment'}
                                    smallText={`As on (${date})`}
                                    options={pieChartOptions({
                                        height: 220,
                                        series: finalSegmentChart,
                                    })}
                                />
                            </div>
                        ) : (
                            <PieChartSkeleton size={160} className="mt-25" nodata={true} />
                        )
                    ) : (
                        <div className="portlet-solidgauge">
                            {!isBusiness1 && (
                                <div className="d-flex">
                                    {!!summary?.segmentIndustry?.segmentResult &&
                                        summary?.segmentIndustry?.segmentResult?.length !== 0 ? (
                                        summary?.segmentIndustry?.segmentResult?.map((item, index) => {
                                            return (
                                                <>
                                                    <div className={`solid-gauge-li ${index === 0 ? 'ml-20' : ''}`}>
                                                        <RSHighchartsContainer
                                                            options={item?.series?.length > 0 ? solidgaugeChartOptions(item) : {}}
                                                        />
                                                        <div
                                                            className="sentiment-value font-bold"
                                                            style={{ color: item?.series?.[0]?.color }}
                                                        >
                                                            {item?.series?.[0]?.y && (
                                                                <>
                                                                    {item?.series?.[0]?.y}
                                                                    <span className="font-md">%</span>
                                                                </>
                                                            )}
                                                        </div>
                                                        <div className="sentiment-label">Positive</div>
                                                    </div>
                                                </>
                                            );
                                        })
                                    ) : (
                                        <PieChartSkeleton
                                            pieClass=""
                                            count={3}
                                            noLegend
                                            size={160}
                                            nodata={true}
                                        />
                                    )}
                                    {/* <small className="portlet-info-text">{`As on (${date})`}</small> */}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="portlet-body d-none">
                    {/* <div className="portlet-sss">
                        <div class="sentiment-c100 sentiment-p63 positive">
                            <span>33%</span>
                            <div class="sentiment-slice">
                                <div class="sentiment-bar"></div>
                                <div class="sentiment-fill"></div>
                            </div>
                        </div>
                    </div> */}
                </div>
            </div>
        </Col>
    );
};

export default Sentiment;
