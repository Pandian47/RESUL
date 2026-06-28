import { formatPercentage } from 'Utils/modules/formatters';
import { PredictiveAnalysisSkeleton } from 'Components/Skeleton/Skeleton';
import { INSIGHTS, PRE_COMMUNICATION_ANALYTICS } from 'Constants/GlobalConstant/Placeholders';
import { Fragment } from 'react';
import { Col } from 'react-bootstrap';

import { ProgressBar } from '@progress/kendo-react-progressbars';
import { PREDICTIVE_ANALYSIS_INSIGHTS, PREDICTIVE_ANALYSIS_PROGRESS } from './constant';
import { useSelector } from 'react-redux';
import Skeleton from 'react-loading-skeleton';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';


const PredictiveAnalysis = ({ tab }) => {
    const { channelDetails, isCampaignAnalyzeListLoading } = useSelector(
        ({ communicationExecuteReducer }) => communicationExecuteReducer,
    );
    const value = channelDetails[tab];
    const predictiveAnalytics = value?.contentDetail?.predictiveanalytics;

    // Check if data is loading (API is pending) vs no data (value exists but predictiveanalytics is empty/null)
    const isLoading = isCampaignAnalyzeListLoading;
    const hasNoData = value && !predictiveAnalytics;
    const hasNonZeroValueForInsights =
    predictiveAnalytics &&
    PREDICTIVE_ANALYSIS_PROGRESS.some(
        (data) => (predictiveAnalytics[data?.title?.toLowerCase()] || 0) > 0
    );


    return (
        <Fragment>
            <div
                className={
                    tab === 'QR' ? 'portlet-container portlet-md click-off' : 'portlet-container portlet-md mb20'
                }
            >
                <div className="portlet-header">
                    <h4>{PRE_COMMUNICATION_ANALYTICS}</h4>
                </div>
                {isLoading ? (
                    <PredictiveAnalysisSkeleton isError={false} />
                ) : hasNoData ? (
                    <PredictiveAnalysisSkeleton isError={true} />
                ) : (
                    <div className="portlet-body d-flex flex-column justify-content-around mt30">
                        {PREDICTIVE_ANALYSIS_PROGRESS.map((data, idx) => {
                            return (
                                <Fragment key={data?.title || idx}>
                                    {hasNonZeroValueForInsights ? (
                                        <div className="d-flex align-items-center progress-reach">
                                            <Col sm={3}>
                                                <h5 className="text-right mr15">{data?.title}</h5>
                                            </Col>
                                            <Col sm={9}>
                                                <ProgressBar
                                                    value={
                                                        Number(predictiveAnalytics?.[data?.title?.toLowerCase()]) || 0
                                                    }
                                                    progressStyle={{ background: data?.color }}
                                                    label={() => {
                                                        return (
                                                            <span className="fs17">
                                                                {formatPercentage(predictiveAnalytics?.[data?.title?.toLowerCase()] || 0)}
                                                                <span className="font-xs">%</span>
                                                            </span>
                                                        );
                                                    }}
                                                />
                                            </Col>
                                        </div>
                                    ) : (
                                        <Fragment>
                                            <div
                                                className="d-flex align-items-center progress-reach"
                                                style={{ marginBottom: '20px' }}
                                            >
                                                <Col sm={3}>
                                                    <div className="text-right mr15">
                                                        <Skeleton
                                                            enableAnimation={false}
                                                            height={18}
                                                            width={80}
                                                            style={{ background: '#e0e5eb', marginLeft: 'auto' }}
                                                        />
                                                    </div>
                                                </Col>

                                                <Col sm={9}>
                                                    <div style={{ position: 'relative', width: '100%' }}>
                                                        {/* Progress bar background */}
                                                        <div
                                                            style={{
                                                                width: '100%',
                                                                height: '30px',
                                                                backgroundColor: '#e0e5eb',
                                                                borderRadius: '4px',
                                                                position: 'relative',
                                                                overflow: 'hidden',
                                                            }}
                                                        ></div>
                                                    </div>
                                                </Col>
                                            </div>
                                            <NoDataAvailableRender className="mt-95 ml38"message ='Predictions are not ready yet. Check back soon.' />
                                        </Fragment>
                                    )}
                                </Fragment>
                            );
                        })}
                        <h4 className="mt60 mb0">{INSIGHTS}</h4>
                        <div className="predictive_analysis_list mt10">
                          {
                            hasNonZeroValueForInsights ? (
                                PREDICTIVE_ANALYSIS_INSIGHTS && PREDICTIVE_ANALYSIS_INSIGHTS.length > 0 ? (
                                    PREDICTIVE_ANALYSIS_INSIGHTS.map((data, idx) => (
                                        <p key={idx}>{data}</p>
                                    ))
                                ) : (
                                    <p>No insights available yet.</p>
                                )
                            ) : (
                                <>
                                    <p>Insights will be displayed once enough data is processed.</p>
                                    <p>Additional insights will be displayed when available.</p>
                                </>
                            )
                        }

                        </div>
                    </div>
                )}
            </div>
        </Fragment>
    );
};

export default PredictiveAnalysis;
