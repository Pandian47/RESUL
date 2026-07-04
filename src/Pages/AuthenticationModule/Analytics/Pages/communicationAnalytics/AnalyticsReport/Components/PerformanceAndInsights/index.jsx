import { formatNumber } from 'Utils/modules/campaignUtils';
import { getUserDetails } from 'Utils/modules/crypto';
import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { numberWithCommas, formatPercentageDisplay } from 'Utils/modules/formatters';
import { getmasterData } from 'Utils/modules/masterData';
import { getArrowIcon } from '../../constants';
import { meterChartOptions } from 'Constants/Charts';
import { EMAIL_MESSAGE_RULES } from 'Constants/GlobalConstant/Rules';
import { ACHIEVED_VS_GOAL, ACTUAL_VS_EXPECTED_ROI, BUDGET, CANCEL, CHANNEL_COST, CONVERSION_VALUE, DURATION, ENTER_EMAIL_MESSAGE, INCREMENTAL_CONVERSION, INSIGHTS, LEADS, MISINTERPRETED, NOT_RELEVANT, ONLINE_VS_OFFLINE, OTHERS, PERFORMANCE_SNAPSHOT, PRE_COMMUNICATION_COST, PRIMARY_GOAL, REVENUE_PER_AUDIENCE, ROI, SECONDARY_GOAL, SUBMIT, TO, UPLIFT_BY } from 'Constants/GlobalConstant/Placeholders';
import { arrow_up_bold_medium, circle_close_fill_medium, circle_close_medium, circle_info_medium, retarget_list_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useState } from 'react';
import { Carousel, Col, Row } from 'react-bootstrap';
import { get as _get } from 'Utils/modules/lodashReplacements';
import { useForm } from 'react-hook-form';

import RSHighchartsContainer from 'Components/Highcharts';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import Icon from 'Components/Icon/Icon';
import RSRadioButton from 'Components/FormFields/RSRadioButton';
import RSTextarea from 'Components/FormFields/RSTextarea';
import { useNavigate } from 'react-router-dom';
import { getSummaryList } from 'Reducers/analytics/analyticsSummary/selector';
import { useSelector } from 'react-redux';
import {
    HorizontalSkeleton,
    InsightsBodySkeleton,
    PerformanceSnapshotSkeleton,
} from 'Components/Skeleton/Skeleton';
import RSTooltip from 'Components/RSTooltip';

const FORM_INITIAL_STATE = {};

const PerformanceAndInsights = ({ date, isDownloadUI  }) => {
    const navigate = useNavigate();
    const methods = useForm(FORM_INITIAL_STATE);
    const { control, watch } = methods;
    const [share] = watch(['share', 'scheduleDownload']);

    const [snapIPreview, setSnapIPreview] = useState(false);
    const [insightsIndex, setInsightsIndex] = useState(-1);

    const summary = useSelector((state) => getSummaryList(state));
    const { insights } = summary;
    const { insightsLoading, summaryLoading } = useSelector((state) => state.analyticsReportReducer);

    const communicationPerformace = _get(summary, 'communicationSnapshotPreformance', {});
    const goalPerformace = _get(summary, 'goalPerformance', {});
    const channelConversionInfo = _get(summary, 'channelConversionInfo', {});
    const roiPerformace = _get(summary, 'roiPerformance', {});
    const isRoi = roiPerformace.actualRoi > 0 || roiPerformace.expectedRoi > 0;
    const revenue = roiPerformace.revenueConversion || roiPerformace.revenueEngagement || roiPerformace.revenueReach;

    const { currencyMasterList } = getmasterData();
    const { currencyId } = getUserDetails();
    let currsymbol = '₹';
    const matchingCurrency = currencyMasterList?.find((currency) => currency.currencyID === currencyId);
    currsymbol = matchingCurrency ? matchingCurrency.currenySymbol : currsymbol;
    
    const getGoalStatusLabel = (status) => {
        if (!status) return '';
        const statusUpper = status.toUpperCase();
        switch (statusUpper) {
            case 'R':
                return 'Reach';
            case 'E':
                return 'Engagement';
            case 'C':
                return 'Conversion';
            default:
                return status;
        }
    };

    return (
        <Row>
            <Col>
                <div className="portlet-container portlet-md performance-snapshot-portlet">
                    <div className="portlet-body">
                        {summaryLoading ? (
                            <PerformanceSnapshotSkeleton isError={!summaryLoading} />
                        ) : (
                        <Row>
                            <Col md={7}>
                                <div className="portlet-header">
                                    <h4 className="mb0">{PERFORMANCE_SNAPSHOT}</h4>
                                </div>
                                <div className="portlet-chart">
                                    <div className="position-relative">
                                        <div className="performance-snap-chart">
                                            <RSHighchartsContainer
                                                chartCore
                                                type="gauge"
                                                options={meterChartOptions({
                                                    height: 253,
                                                    width: 250,
                                                    text: _get(communicationPerformace, 'performanceStatus', ''),
                                                    value:
                                                        _get(communicationPerformace, 'overachivedpercentage', 0) > 100
                                                            ? 100
                                                            : _get(communicationPerformace, 'overachivedpercentage', 0),
                                                })}
                                            />
                                        </div>
                                        <label className="meter-ch-label">
                                            <h4 className="mb5 font-bold">{DURATION}</h4>
                                            <div className="color-secondary-black">
                                                {' '}
                                                {/* ({getDateWithDay(_get(summary, 'startDate', new Date()))}{' '}
                                                {TO} {getDateWithDay(_get(summary, 'endDate', new Date()))}
                                                ) */}
                                                 ({getUserCurrentFormat(_get(summary, 'startDate', new Date()))?.dateFormat}{' '}
                                                {TO} {getUserCurrentFormat(
                                                new Date(_get(summary, 'endDate')) < new Date() 
                                                    ? _get(summary, 'endDate') 
                                                    : new Date()
                                                )?.dateFormat}
                                                )
                                            </div>
                                        </label>
                                    </div>
                                    {/* <small className="portlet-info-text">{`As on (${date})`}</small> */}
                                </div>
                            </Col>
                            <Col md={5}>
                                <div className="p-snap">
                                    <ul>
                                        <li>
                                            <div className="custom-slide">
                                                <Carousel indicators={_get(goalPerformace, 'isSecondaryAchieved')} className='csr-carousel'>
                                                    <Carousel.Item>
                                                        <div className="p-snap-list">
                                                            <h4>{PRIMARY_GOAL}</h4>
                                                            {_get(goalPerformace, 'goalStatus')?.length > 0 && (
                                                                <span className="font-bold font-sm primary-goal-type my5 lh-1">{getGoalStatusLabel(_get(goalPerformace, 'goalStatus'))}</span>
                                                            )}
                                                            <div className="p-count">
                                                                <h1>
                                                                    {formatPercentageDisplay(
                                                                        _get(
                                                                            goalPerformace,
                                                                            'primaryPerformancePercentage',
                                                                        ),
                                                                    ) || 0}
                                                                </h1>
                                                                <span className="color-primary-black font-bold font-md position-relative top1">
                                                                    %
                                                                </span>
                                                                <i
                                                                    className={` ${getArrowIcon(
                                                                        _get(goalPerformace, 'isPrimaryAchieved'),
                                                                    )} icon-md mt-3 ${isDownloadUI ? 'mt-10' : ''}`}
                                                                ></i>
                                                            </div>
                                                            <p>{ACHIEVED_VS_GOAL}</p>
                                                            <p>
                                                                ({_get(goalPerformace, 'primaryAchieved')} vs{' '}
                                                                {_get(goalPerformace, 'primaryTarget')}{' '}
                                                                {LEADS})
                                                            </p>
                                                        </div>
                                                    </Carousel.Item>
                                                    {_get(goalPerformace, 'isSecondaryAchieved')&&
                                                    <Carousel.Item>
                                                        <div className="p-snap-list">
                                                            <h4>{SECONDARY_GOAL}</h4>
                                                            {_get(goalPerformace, 'secondaryGoalStatus')?.length > 0 && (
                                                                <span className="font-bold font-sm">{getGoalStatusLabel(_get(goalPerformace, 'secondaryGoalStatus'))}</span>
                                                            )}
                                                            <div className="p-count">
                                                                <h1>
                                                                    {formatNumber(_get(
                                                                        goalPerformace,
                                                                        'secondaryPerformancePercentage',
                                                                    )) || 'NA'}
                                                                </h1>
                                                                {goalPerformace?.secondaryPerformancePercentage !==
                                                                    null && (
                                                                    <sub className="color-primary-black font-bold font-md position-relative top1">
                                                                        %
                                                                    </sub>
                                                                )}
                                                                {_get(
                                                                    goalPerformace,
                                                                    'secondaryPerformancePercentage',
                                                                ) ? (
                                                                    <i
                                                                        className={`${
                                                                            goalPerformace?.secondaryPerformancePercentage !==
                                                                                null &&
                                                                            getArrowIcon(
                                                                                _get(
                                                                                    goalPerformace,
                                                                                    'isSecondaryAchieved',
                                                                                ),
                                                                            )
                                                                        } icon-md mt-3`}
                                                                    ></i>
                                                                ) : null}
                                                            </div>
                                                            <p>{ACHIEVED_VS_GOAL}</p>
                                                            <p>
                                                                ({_get(goalPerformace, 'secondaryAchieved')} /{' '}
                                                                {_get(goalPerformace, 'secondaryTarget')}{' '}
                                                                {LEADS})
                                                            </p>
                                                        </div>
                                                    </Carousel.Item>
                                                    }
                                                </Carousel>
                                            </div>
                                        </li>
                                        <li>
                                            <div className="custom-slide">
                                                <Carousel>
                                                    <Carousel.Item>
                                                        <div className="p-snap-list">
                                                            <h4>{INCREMENTAL_CONVERSION}</h4>
                                                            <div className="p-count">
                                                                <h1>
                                                                    {
                                                                        formatNumber (
                                                                           _get(
                                                                                channelConversionInfo,
                                                                                'incrementalConversionCount',
                                                                            )
                                                                        )
                                                                     || 'NA'}
                                                                </h1>
                                                                {numberWithCommas(
                                                                    _get(channelConversionInfo, 'incrementalConversionCount'),
                                                                ) ? (
                                                                    <i
                                                                        className={`${
                                                                            channelConversionInfo?.incrementalConversionCount !==
                                                                                null &&
                                                                            getArrowIcon(
                                                                                _get(channelConversionInfo, 'incrementalConversionCount'),
                                                                            )
                                                                        } icon-md mt-3`}
                                                                    ></i>
                                                                ) : null}
                                                            </div>
                                                            <p>
                                                                {UPLIFT_BY}{' '}
                                                                { formatNumber(_get(channelConversionInfo, 'totalUpliftConversionPresentage')) || 0}
                                                                <sub>%</sub>
                                                            </p>
                                                        </div>
                                                    </Carousel.Item>
                                                    {isRoi && (
                                                        <Carousel.Item>
                                                            <div className="p-snap-list">
                                                                <h4>{ROI}</h4>
                                                                <div className="p-count">
                                                                    <h1>
                                                                        {_get(roiPerformace, 'incrementalPercentage')}
                                                                    </h1>
                                                                    <span className="color-primary-black font-bold font-md">
                                                                        %
                                                                    </span>
                                                                    <i
                                                                        className={`${arrow_up_bold_medium} icon-md color-primary-green mt-3`}
                                                                    ></i>
                                                                </div>
                                                                <p>{ACTUAL_VS_EXPECTED_ROI}</p>
                                                                <p>
                                                                    (
                                                                    {numberWithCommas(_get(roiPerformace, 'actualROI'))}
                                                                    /
                                                                    {numberWithCommas(
                                                                        _get(roiPerformace, 'expectedRoi'),
                                                                    )}
                                                                    )
                                                                </p>
                                                            </div>
                                                        </Carousel.Item>
                                                    )}
                                                    <Carousel.Item>
                                                        <div className="p-snap-list">
                                                            <h4>{CONVERSION_VALUE}</h4>
                                                            <div className="p-count">
                                                                {summary?.conversionCostAmount !== null && (
                                                                    <h1 className='fs29'>{currsymbol}</h1>
                                                                )}
                                                                <RSTooltip 
                                                                    position="top" 
                                                                    text={`${Number(summary?.conversionCostAmount ) > 0
                                                                        ? formatNumber(summary?.conversionCostAmount)
                                                                        : 0}`}
                                                                        innerContent={false}
                                                                >
                                                                    <h1>
                                                                        {Number(summary?.conversionCostAmount) > 0
                                                                            ? numberWithCommas(formatNumber(summary?.conversionCostAmount))
                                                                            : 0}
                                                                    </h1>
                                                                </RSTooltip>
                                                            </div>
                                                            <p>{ONLINE_VS_OFFLINE}</p>
                                                            <p>
                                                                ({currsymbol}
                                                               {Number(summary?.onlineConverisonCost) > 0
                                                                        ? numberWithCommas(formatNumber(summary?.onlineConverisonCost))
                                                                        : 0} /{' '}
                                                                {currsymbol}
                                                                {Number(summary?.offlineConversionCost) > 0
                                                                        ? numberWithCommas(formatNumber(summary?.offlineConversionCost))
                                                                        : 0})
                                                            </p>
                                                        </div>
                                                    </Carousel.Item>
                                                </Carousel>
                                            </div>
                                        </li>
                                    </ul>
                                    {/* <RSTooltip position='top' text="Benchmark"> */}
                                    {isRoi && (
                                        <div className="snap-info-ico">
                                            <Icon
                                                id="rs_data_circle_info"
                                                icon={circle_info_medium}
                                                size="md"
                                                color="color-primary-blue"
                                                callBack={() => {
                                                    setSnapIPreview(true);
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* </RSTooltip> */}
                                    <div className={`detail-snap-info-preview ${snapIPreview ? 'show' : ''}`}>
                                        <Icon
                                            mainClass="float-end"
                                            icon={circle_close_fill_medium}
                                            size="md"
                                            color="close-sum-report"
                                            callBack={() => {
                                                setSnapIPreview(false);
                                            }}
                                        />
                                        <ul className="detail-snap-popup">
                                            <li>
                                                <label>{BUDGET}</label>
                                                <h4>
                                                    {currsymbol}
                                                    {numberWithCommas(roiPerformace.budget)}
                                                </h4>
                                            </li>
                                            <li>
                                                <label>{PRE_COMMUNICATION_COST}</label>
                                                <h4>
                                                    {currsymbol}
                                                    {numberWithCommas(roiPerformace.precommunicationcost)}
                                                </h4>
                                            </li>
                                            <li>
                                                <label>{CHANNEL_COST}</label>
                                                <h4>
                                                    {currsymbol}
                                                    {numberWithCommas(roiPerformace.channelcost)}
                                                </h4>
                                            </li>
                                            <li>
                                                <label>{REVENUE_PER_AUDIENCE}</label>
                                                <h4>
                                                    {currsymbol}
                                                    {numberWithCommas(revenue)}
                                                </h4>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                        )}
                    </div>
                </div>
            </Col>
            <Col>
                <div className="portlet-container portlet-md">
                    <div className="portlet-header">
                        <h4 className="mb0">{INSIGHTS}</h4>
                    </div>
                    <div className="portlet-body">
                        {summaryLoading || insightsLoading ? (
                            <InsightsBodySkeleton />
                        ) : !!insights && insights?.length !== 0 ? (
                            <div className="p-list-wrapper">
                                <ul>
                                    {insights?.map((item, index) => (
                                        <div key={index}>
                                            {Object.keys(insights[0])?.filter(key => key !== 'jobDateTime')?.map((names, ind) => {
                                                return (
                                                    <>
                                                        {item[names] !== null && item[names]?.length > 0 && (
                                                            <div key={ind}>
                                                                <Fragment key={ind}>
                                                                    <li>
                                                                        {insightsIndex === ind ? (
                                                                            <div className="insights-edit-view">
                                                                                <Icon
                                                                                    mainClass="insight-close"
                                                                                    icon={circle_close_medium}
                                                                                    size="md"
                                                                                    color=""
                                                                                    callBack={() => {
                                                                                        // setInsightsEdit(false)
                                                                                        setInsightsIndex(-1);
                                                                                    }}
                                                                                />
                                                                                <div className="d-flex mb23">
                                                                                    <RSRadioButton
                                                                                        name={`share`}
                                                                                        control={control}
                                                                                        defaultValue={share}
                                                                                        labelName={
                                                                                            NOT_RELEVANT
                                                                                        }
                                                                                    />
                                                                                    <RSRadioButton
                                                                                        name={`share`}
                                                                                        control={control}
                                                                                        defaultValue={share}
                                                                                        labelName={
                                                                                            MISINTERPRETED
                                                                                        }
                                                                                    />
                                                                                    <RSRadioButton
                                                                                        name={`share`}
                                                                                        control={control}
                                                                                        defaultValue={share}
                                                                                        labelName={OTHERS}
                                                                                    />
                                                                                </div>
                                                                                <RSTextarea
                                                                                    name="message"
                                                                                    control={control}
                                                                                    required
                                                                                    placeholder={
                                                                                        ENTER_EMAIL_MESSAGE
                                                                                    }
                                                                                    rules={EMAIL_MESSAGE_RULES}
                                                                                />
                                                                                <Col
                                                                                    sm={12}
                                                                                    className="my23 text-right"
                                                                                >
                                                                                    <RSSecondaryButton
                                                                                        className={'mr20'}
                                                                                        onClick={() => {
                                                                                            setInsightsIndex(-1);
                                                                                        }}
                                                                                    >
                                                                                        {CANCEL}
                                                                                    </RSSecondaryButton>
                                                                                    <RSPrimaryButton
                                                                                        type="submit"
                                                                                        onClick={() => {
                                                                                            setInsightsIndex(-1);
                                                                                        }}
                                                                                    >
                                                                                        {SUBMIT}
                                                                                    </RSPrimaryButton>
                                                                                </Col>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="Insighttext-cursor">
                                                                                {item[names]}
                                                                                {/* <div className="insight-info-ico click-off">
                                                                                <Icon
                                                                                    icon={circle_close_medium}
                                                                                    size="md"
                                                                                    color="null"
                                                                                    callBack={() => {
                                                                                        setInsightsIndex(ind);
                                                                                    }}
                                                                                />
                                                                            </div> */}
                                                                                {/* {ind === 0 && (
                                                                                <i
                                                                                    className={`${retarget_list_medium} text-right icon-md text-primary click-off`}
                                                                                    onClick={() =>
                                                                                        navigate(
                                                                                            `/communication/communication-creation`,
                                                                                            {
                                                                                                state: {
                                                                                                    type: 'aiDriven',
                                                                                                    editData: {
                                                                                                        eventType:
                                                                                                            'Event',
                                                                                                        eventName:
                                                                                                            'Seasonal offers',
                                                                                                    },
                                                                                                },
                                                                                            },
                                                                                        )
                                                                                    }
                                                                                ></i>
                                                                            )} */}
                                                                            </div>
                                                                        )}
                                                                    </li>
                                                                </Fragment>
                                                            </div>
                                                        )}
                                                    </>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <HorizontalSkeleton isError={!summaryLoading} />
                        )}
                    </div>
                </div>
            </Col>
        </Row>
    );
};

export default PerformanceAndInsights;
