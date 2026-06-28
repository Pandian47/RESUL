import { checkTrigger, statusIdCheck } from 'Utils/modules/campaignUtils';
import { onlyNumbersDecimal } from 'Utils/modules/inputValidators';
import { PERCENTAGE_RULES } from 'Constants/GlobalConstant/Rules';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { ENTER_VALID_NUMBER, ENTER_VALID_PERCENTAGE, MAX75LENGTH, MINLENGTH } from 'Constants/GlobalConstant/ValidationMessage';
import { BASED_ON_COMMUNICATION_GOAL, BASED_ON_GOAL_PERCENTAGE, BASED_ON_PROPENSITY_VALUE, CANCEL, CONVERSION, ENGAGEMENT, ENTER_PRIMARY_GOAL_VALUE, ENTER_VALUE, EXPECTED_ROI, FIXED_COST, FIXED_VARIABLE_COST_INCURRED, GOAL, GOAL_PERCENTAGE, INDUSTRY_BENCHMARK, LIST_PROPENSITY, NEXT, PRIMARY_COMMUNICATION_GOAL, PROPENSITY_VALUE, REACH, REVENUE_PER_AUDIENCE, ROI_CALCULATION, SAVE, VARIABLE_COST } from 'Constants/GlobalConstant/Placeholders';
import { circle_question_mark_mini } from 'Constants/GlobalConstant/Glyphicons';
import RSInput from 'Components/FormFields/RSInput';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Col, Row } from 'react-bootstrap';
import _get from 'lodash/get';
import useQueryParams from 'Hooks/useQueryParams';

import {
    ROI_INITIAL_DATA,
    bildPayload,
    fetchDefaultValues,
    normalizeROIResponse,
    calculateExpectedROIValues,
    getVariableCostPopoverRows,
    isRevenueFieldProvided,
    computePreserveApiExpectedRoiFlags,
    buildRevenuePerAudienceRules,
    getGoalPercentageByTargetCode,
    getReferenceGoalBenchmark,
    goalTypeToTargetCode,
    shouldShowGoalBenchmarkHint,
} from './constant';
import { useForm } from 'react-hook-form';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { useDispatch, useSelector } from 'react-redux';
import {
    getROIContentData,
    saveCampaignRoi,
} from 'Reducers/communication/createCommunication/execute/request';
import { useNavigate } from 'react-router-dom';
import { resetCreateCommunication } from 'Reducers/communication/createCommunication/create/reducer';
import { getSessionId } from 'Reducers/globalState/selector';

import RSPPophover from 'Components/RSPPophover';
import useApiLoader from 'Hooks/useApiLoader';
import {
    ExecuteROICalculationSkeleton,
} from 'Components/Skeleton/pages/communication/execute';
import { communicationExecuteSkeletonCriticalCss } from 'Components/Skeleton/pages/communication/execute/communicationExecuteSkeletonCriticalCss';

const ROIContent = ({ setRoiContent }) => {
    const { control, handleSubmit, setValue, reset, watch } = useForm(ROI_INITIAL_DATA);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const location = useQueryParams('/communication');

    const [
        fixedCostAmount,
        fixedCostValue,
        goalType,
        goalPercentage,
        emailRecipientCount,
        smsRecipientCount,
        overAllAudienceCount,
        listPropensity,
        ReachValue,
        EngagementValue,
        ConversionValue,
        reachGoalPercentage,
        engagementGoalPercentage,
        conversionGoalPercentage,
    ] = watch([
        'fixedCostAmount',
        'fixedCostValue',
        'goalType',
        'goalPercentage',
        'emailRecipientCount',
        'smsRecipientCount',
        'overAllAudienceCount',
        'listPropensity',
        'Reach',
        'Engagement',
        'Conversion',
        'reachGoalPercentage',
        'engagementGoalPercentage',
        'conversionGoalPercentage',
    ]);
    const watchedChannels = watch('channels');
    const { roiContent } = useSelector(({ communicationExecuteReducer }) => communicationExecuteReducer);
    const skipRoiDerivedSyncRef = useRef(false);
    const primaryTargetCodeRef = useRef('');
    const preserveApiExpectedRoiRef = useRef({
        reach: false,
        engagement: false,
        conversion: false,
    });
    const [isROIFail, setIsROIFail] = useState(false);

    const primaryTargetCode =
        primaryTargetCodeRef.current || goalTypeToTargetCode(goalType) || 'R';

    const referenceGoalBenchmark = useMemo(
        () =>
            getReferenceGoalBenchmark(primaryTargetCode, {
                reachGoalPercentage,
                engagementGoalPercentage,
                conversionGoalPercentage,
            }),
        [
            primaryTargetCode,
            reachGoalPercentage,
            engagementGoalPercentage,
            conversionGoalPercentage,
            goalType,
        ],
    );

    const showGoalBenchmarkHint = shouldShowGoalBenchmarkHint(
        goalPercentage,
        referenceGoalBenchmark.raw,
    );
    const roiDataLoader = useApiLoader({ autoFetch: false });
    const reachRevenueRules = useMemo(
        () =>
            buildRevenuePerAudienceRules({
                required: goalType === 'Reach',
                requiredMessage: ENTER_VALUE,
                invalidMessage: ENTER_VALID_NUMBER,
            }),
        [goalType],
    );
    const engagementRevenueRules = useMemo(
        () =>
            buildRevenuePerAudienceRules({
                required: goalType === 'Engagement',
                requiredMessage: ENTER_VALUE,
                invalidMessage: ENTER_VALID_NUMBER,
            }),
        [goalType],
    );
    const conversionRevenueRules = useMemo(
        () =>
            buildRevenuePerAudienceRules({
                required: goalType === 'Conversion',
                requiredMessage: ENTER_VALUE,
                invalidMessage: ENTER_VALID_NUMBER,
            }),
        [goalType],
    );
    useEffect(() => {
        const campaignId = _get(location, 'campaignId', 0);
        if (!campaignId || campaignId <= 0) {
            roiDataLoader.reset();
            return;
        }

        roiDataLoader.refetch({
            fetcher: async () => {
                const payload = {
                    campaignId,
                    userId,
                    clientId,
                    departmentId,
                };
                const roiDetailsResult = await Promise.resolve(
                    dispatch(getROIContentData({ payload, loading: false })),
                ).then(
                    (value) => ({ status: 'fulfilled', value }),
                    (reason) => ({ status: 'rejected', reason }),
                );

                if (roiDetailsResult.status === 'fulfilled') {
                    const body = roiDetailsResult.value;
                    const ok = body?.status === true || body?.status === 'True';
                    const roiPayload = body?.data;
                    if (ok && roiPayload) {
                        const normalized = normalizeROIResponse(roiPayload);
                        preserveApiExpectedRoiRef.current = computePreserveApiExpectedRoiFlags(normalized);
                        fetchDefaultValues(normalized, reset);
                        skipRoiDerivedSyncRef.current = true;
                    }
                }
                return roiDetailsResult;
            },
        });
    }, [location?.campaignId, userId, clientId, departmentId]);

    const roiValues = useMemo(
        () =>
            calculateExpectedROIValues({
                fixedCostAmount,
                fixedCostValue,
                emailRecipientCount,
                smsRecipientCount,
                overAllAudienceCount,
                goalPercentage,
                reachGoalPercentage,
                engagementGoalPercentage,
                conversionGoalPercentage,
                reachValue: ReachValue,
                engagementValue: EngagementValue,
                conversionValue: ConversionValue,
                goalType,
                channels: watchedChannels,
            }),
        [
            fixedCostAmount,
            fixedCostValue,
            emailRecipientCount,
            smsRecipientCount,
            overAllAudienceCount,
            goalPercentage,
            reachGoalPercentage,
            engagementGoalPercentage,
            conversionGoalPercentage,
            ReachValue,
            EngagementValue,
            ConversionValue,
            goalType,
            watchedChannels,
        ],
    );

    useEffect(() => {
        if (isRevenueFieldProvided(ReachValue)) {
            preserveApiExpectedRoiRef.current.reach = false;
        }
        if (isRevenueFieldProvided(EngagementValue)) {
            preserveApiExpectedRoiRef.current.engagement = false;
        }
        if (isRevenueFieldProvided(ConversionValue)) {
            preserveApiExpectedRoiRef.current.conversion = false;
        }
    }, [ReachValue, EngagementValue, ConversionValue]);

    useEffect(() => {
        if (skipRoiDerivedSyncRef.current) {
            skipRoiDerivedSyncRef.current = false;
            return;
        }
        const toDisplayValue = (value) => (value === '' || value == null ? '' : String(value));
        const displayExpectedROI =
            goalType === 'Reach'
                ? roiValues.expectedReachROI
                : goalType === 'Engagement'
                    ? roiValues.expectedEngagementROI
                    : goalType === 'Conversion'
                        ? roiValues.expectedConversionROI
                        : roiValues.expectedROI;

        if (isRevenueFieldProvided(ReachValue)) {
            setValue('expectedReachROI', roiValues.expectedReachROI);
            setValue('expectedReachROIDisplay', toDisplayValue(roiValues.expectedReachROI));
        } else if (!preserveApiExpectedRoiRef.current.reach) {
            setValue('expectedReachROI', roiValues.expectedReachROI);
            setValue('expectedReachROIDisplay', toDisplayValue(roiValues.expectedReachROI));
        }
        if (isRevenueFieldProvided(EngagementValue)) {
            setValue('expectedEngagementROI', roiValues.expectedEngagementROI);
            setValue('expectedEngagementROIDisplay', toDisplayValue(roiValues.expectedEngagementROI));
        } else if (!preserveApiExpectedRoiRef.current.engagement) {
            setValue('expectedEngagementROI', roiValues.expectedEngagementROI);
            setValue('expectedEngagementROIDisplay', toDisplayValue(roiValues.expectedEngagementROI));
        }
        if (isRevenueFieldProvided(ConversionValue)) {
            setValue('expectedConversionROI', roiValues.expectedConversionROI);
            setValue('expectedConversionROIDisplay', toDisplayValue(roiValues.expectedConversionROI));
        } else if (!preserveApiExpectedRoiRef.current.conversion) {
            setValue('expectedConversionROI', roiValues.expectedConversionROI);
            setValue('expectedConversionROIDisplay', toDisplayValue(roiValues.expectedConversionROI));
        }
        const primaryRevenueProvided =
            (goalType === 'Reach' && isRevenueFieldProvided(ReachValue)) ||
            (goalType === 'Engagement' && isRevenueFieldProvided(EngagementValue)) ||
            (goalType === 'Conversion' && isRevenueFieldProvided(ConversionValue));
        const preservePrimary =
            (goalType === 'Reach' && preserveApiExpectedRoiRef.current.reach) ||
            (goalType === 'Engagement' && preserveApiExpectedRoiRef.current.engagement) ||
            (goalType === 'Conversion' && preserveApiExpectedRoiRef.current.conversion);
        if (primaryRevenueProvided) {
            setValue('expectedROI', displayExpectedROI);
        } else if (!preservePrimary) {
            setValue('expectedROI', displayExpectedROI);
        }
    }, [roiValues, setValue, goalType, ReachValue, EngagementValue, ConversionValue]);

    const variableCostPopoverRows = useMemo(
        () =>
            getVariableCostPopoverRows({
                watchedChannels,
                roiContent,
                overAllAudienceCount,
                emailRecipientCount,
                smsRecipientCount,
                goalType,
                goalPercentage,
                reachGoalPercentage,
                engagementGoalPercentage,
                conversionGoalPercentage,
            }),
        [
            watchedChannels,
            roiContent,
            overAllAudienceCount,
            emailRecipientCount,
            smsRecipientCount,
            goalType,
            goalPercentage,
            reachGoalPercentage,
            engagementGoalPercentage,
            conversionGoalPercentage,
        ],
    );

    const variableCostPopoverContent = useMemo(() => {
        if (!variableCostPopoverRows.length) return null;
        return (
            <div>
                {variableCostPopoverRows.map((row) => {
                    return (
                        <Fragment key={row.key}>
                            <div className={row.isSmallText ? '' : ''}>{row.text}</div>
                            {row.hasDivider && <hr className="m0 mt5 mb5" />}
                        </Fragment>
                    );
                })}
            </div>
        );
    }, [variableCostPopoverRows]);

    const submitROI = async (data) => {
        if (!statusIdCheck(location?.statusId)) {
            setRoiContent(false);
            return;
        }
        const common = { userId, clientId, departmentId, campaignId: _get(location, 'campaignId', 0) };
        const payload = bildPayload(
            data,
            getGoalPercentageByTargetCode(goalTypeToTargetCode(data?.goalType) || primaryTargetCodeRef.current, {
                reachGoalPercentage: data?.reachGoalPercentage,
                engagementGoalPercentage: data?.engagementGoalPercentage,
                conversionGoalPercentage: data?.conversionGoalPercentage,
            }),
            common,
        );
        const response = await dispatch(saveCampaignRoi({ payload }));
        const ok = response?.status === true || response?.status === 'True';
        if (ok) {
            setRoiContent(false);
        }
    };
    const handleErrClose = () => {
        if (isROIFail) {
            navigate('/communication', {
                index: 0,
            });
        }
        setIsROIFail(false)
    };
    if (roiDataLoader.isLoading) {
        return (
            <>
                <style>{communicationExecuteSkeletonCriticalCss}</style>
                <div className="communication-execute-skeleton-scope communication-execute-inline-skeleton">
                    <ExecuteROICalculationSkeleton />
                </div>
            </>
        );
    }

    return (
        <form onSubmit={handleSubmit(submitROI)}>
            <div className="portlet-container pfooter calculateROI">
                <div className="portlet-header">
                    <h4>{ROI_CALCULATION}</h4>
                </div>
                <div
                    className={`portlet-body d-flex flex-column justify-content-around text-center ${checkTrigger(location?.campaignType, location?.endDate)
                            ? 'pe-none click-off'
                            : !statusIdCheck(location?.statusId)
                                ? 'pe-none click-off'
                                : ''
                        }`}
                >
                    <Row className="mt5">
                        <Col sm={{ span: 11, offset: 1 }}>
                            <div className='form-group'>
                                <Row>
                                    <Col sm={3} className='text-right'>
                                        <label className="control-label-left position-relative top-2">{PRIMARY_COMMUNICATION_GOAL}</label>
                                    </Col>
                                    <Col sm={3}>
                                        <RSInput
                                            control={control}
                                            name={'goalType'}
                                            id="rs_ROIContent_goalType"
                                            // required
                                            classWrapper="calculate-roi-metric-input"
                                            // placeholder={ROI_TYPE[roiContent[0]?.primaryTargetCode]}
                                            placeholder={GOAL}
                                            // className={'click-off'}
                                            disabled
                                        />
                                    </Col>
                                    <Col sm={3}>
                                        <div className="d-flex position-relative">
                                            <RSInput
                                                control={control}
                                                name={'goalPercentage'}
                                                id="rs_ROIContent_goalPercentage"
                                                label={GOAL_PERCENTAGE}
                                                required
                                                classWrapper="calculate-roi-metric-input"
                                                onKeyDown={(e) => onlyNumbersDecimal(e)}
                                                // rules={PERCENTAGE_RULES('Goal percentage')}
                                                rules={{
                                                    required: ENTER_PRIMARY_GOAL_VALUE,
                                                    validate: (data) => {
                                                        const value = parseFloat(data);
                                                        return value === 0 || value > 100
                                                            ? ENTER_VALID_PERCENTAGE
                                                            : true;
                                                    },
                                                }}
                                                // rules={{
                                                //     // minLength: {
                                                //     //     value: 2,
                                                //     //     message: MINLENGTH,
                                                //     // },
                                                //     // maxLength: {
                                                //     //     value: 4,
                                                //     //     message: MAX75LENGTH,
                                                //     // },
                                                // }}
                                                maxLength={5}
                                            />
                                            <span className="position-absolute right-0">%</span>
                                        </div>
                                        <small className='text-left'>{BASED_ON_GOAL_PERCENTAGE}</small>
                                    </Col>
                                    {showGoalBenchmarkHint && (
                                        <Col sm={3}>
                                            <span className="color-primary-blue">
                                                ({INDUSTRY_BENCHMARK}{' '}
                                                {referenceGoalBenchmark.display}
                                                <span className="fs12">%</span>)
                                            </span>
                                        </Col>
                                    )}
                                </Row>
                            </div>
                            {/* <div className='form-group'> */}
                                {/* <Row>
                                <Col sm={3} className='text-right'>
                                    <label className="control-label-left position-relative top-2">{LIST_PROPENSITY}</label>
                                </Col>
                                <Col sm={3}>
                                    <RSInput
                                        control={control}
                                        name={'listPropensityType'}
                                        id="rs_ROIContent_listPropensityType"
                                        required
                                        classWrapper="calculate-roi-metric-input"
                                        // placeholder={ROI_TYPE[roiContent[0]?.primaryTargetCode]}
                                        // className={'click-off'}
                                        placeholder={GOAL}
                                         disabled
                                    />
                                    <small className='text-left'>{BASED_ON_COMMUNICATION_GOAL}</small>
                                </Col>
                                <Col sm={3}>
                                    <div className="d-flex position-relative">
                                        <RSInput
                                            control={control}
                                            name={'listPropensity'}
                                            id="rs_ROIContent_listPropensity"
                                            required
                                            classWrapper="calculate-roi-metric-input"
                                            // placeholder={0}
                                            // className={'click-off'}
                                             disabled
                                             placeholder={PROPENSITY_VALUE}
                                        />
                                        <span className="position-absolute right-0">%</span>
                                    </div>
                                    <small className='text-left'>{BASED_ON_PROPENSITY_VALUE}</small>
                                </Col>
                            </Row> */}
                            {/* </div> */}
                            <div className="form-group">
                                <Row>
                                    <Col sm={3} className='text-right'>
                                        <label className="control-label-left position-relative top-2">{FIXED_VARIABLE_COST_INCURRED}</label>
                                    </Col>
                                    <Col sm={3} className="d-flex position-relative roi">
                                        <span className="position-absolute">$</span>
                                        <RSInput
                                            control={control}
                                            name={'fixedCostAmount'}
                                            id="rs_ROIContent_fixedCostAmount"
                                            // type={'number'}
                                            placeholder={FIXED_COST}
                                            maxLength={10}
                                            labelClassName={'pl13'}
                                            className={'pl13'}
                                            onKeyDown={(e) => onlyNumbersDecimal(e)}
                                        />
                                    </Col>
                                    <Col sm={3} className="d-flex roi position-relative">
                                        <span className="position-absolute">$</span>
                                        <RSInput
                                            control={control}
                                            name={'fixedCostValue'}
                                            id="rs_ROIContent_fixedCostValue"
                                            required
                                            // placeholder={0}
                                            // className={'click-off pl13'}
                                            disabled
                                            labelClassName={'pl13'}
                                            className={'pl13'}
                                            maxLength={10}
                                            
                                            placeholder={VARIABLE_COST}
                                        />
                                        {!!variableCostPopoverContent && (
                                            <div className='align-self-end top10 lh0 Left100 position-absolute'>
                                                <RSPPophover text={variableCostPopoverContent} position="top" trigger="click">
                                                    <span className={`${circle_question_mark_mini} color-primary-blue ml cp`} />
                                                </RSPPophover>
                                            </div>
                                        )}
                                    </Col>
                                </Row>
                            </div>
                            <div className="form-group">
                                <Row>
                                    <Col sm={3} className='text-right'>
                                        <label className="control-label-left position-relative top-2">{REVENUE_PER_AUDIENCE}</label>
                                    </Col>
                                    <Col sm={3} className="d-flex roi">
                                        <span className="position-absolute">$</span>
                                        <RSInput
                                            control={control}
                                            labelClassName={'pl13'}
                                            className={'pl13'}
                                            name={'Reach'}
                                            id="rs_ROIContent_Reach"
                                            required={goalType === 'Reach'}
                                            label={REACH}
                                            placeholder={REACH}
                                            rules={reachRevenueRules}
                                            maxLength={10}
                                            onKeyDown={(e) => onlyNumbersDecimal(e)}
                                        />
                                    </Col>
                                    <Col sm={3} className="d-flex roi">
                                        <span className="position-absolute">$</span>
                                        <RSInput
                                            control={control}
                                            id="rs_ROIContent_Engagement"
                                            labelClassName={'pl13'}
                                            className={'pl13'}
                                            name={'Engagement'}
                                            required={goalType === 'Engagement'}
                                            label={ENGAGEMENT}
                                            placeholder={ENGAGEMENT}
                                            rules={engagementRevenueRules}
                                            maxLength={10}
                                            onKeyDown={(e) => onlyNumbersDecimal(e)}
                                        />
                                    </Col>
                                    <Col sm={3} className="d-flex roi">
                                        <span className="position-absolute">$</span>
                                        <RSInput
                                            control={control}
                                            labelClassName={'pl13'}
                                            className={'pl13'}
                                            name={'Conversion'}
                                            id="rs_ROIContent_Conversion"
                                            required={goalType === 'Conversion'}
                                            label={CONVERSION}
                                            placeholder={CONVERSION}
                                            rules={conversionRevenueRules}
                                            maxLength={10}
                                            onKeyDown={(e) => onlyNumbersDecimal(e)}
                                        />
                                    </Col>
                                </Row>
                            </div>
                            <div className="form-group">
                                <Row>
                                    <Col sm={3} className='text-right'>
                                        <label className="control-label-left position-relative top-2">{EXPECTED_ROI}</label>
                                    </Col>
                                    <Col sm={3}>
                                        <div className="d-flex position-relative">
                                            <RSInput
                                                control={control}
                                                name={'expectedReachROIDisplay'}
                                                id="rs_ROIContent_expectedReachROI"
                                                disabled
                                                classWrapper="calculate-roi-metric-input"
                                                placeholder={REACH}
                                            />
                                            <span className="position-absolute right-0">%</span>
                                        </div>
                                    </Col>
                                    <Col sm={3}>
                                        <div className="d-flex position-relative">
                                            <RSInput
                                                control={control}
                                                name={'expectedEngagementROIDisplay'}
                                                id="rs_ROIContent_expectedEngagementROI"
                                                disabled
                                                classWrapper="calculate-roi-metric-input"
                                                placeholder={ENGAGEMENT}
                                            />
                                            <span className="position-absolute right-0">%</span>
                                        </div>
                                    </Col>
                                    <Col sm={3}>
                                        <div className="d-flex position-relative">
                                            <RSInput
                                                control={control}
                                                name={'expectedConversionROIDisplay'}
                                                id="rs_ROIContent_expectedConversionROI"
                                                disabled
                                                classWrapper="calculate-roi-metric-input"
                                                placeholder={CONVERSION}
                                            />
                                            <span className="position-absolute right-0">%</span>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>
            <div className="buttons-holder">
                <RSSecondaryButton
                    onClick={() => {
                        dispatch(resetCreateCommunication());
                        navigate('/communication', {
                            index: 0,
                        });
                    }}
                    id="rs_ROIContent_Cancel"
                >
                    {CANCEL}
                </RSSecondaryButton>
                <RSSecondaryButton
                    type="submit"
                    className={'color-primary-blue'}
                    id="rs_ROIContent_save"
                >
                    {SAVE}
                </RSSecondaryButton>
                <RSPrimaryButton type={'submit'} id="rs_ROIContent_Next">
                    {NEXT}
                </RSPrimaryButton>
            </div>
            {getWarningPopupMessage(failureApiErrors, dispatch, handleErrClose)}
        </form>
    );
};

ROIContent.propTypes = {
    /** When ROI save succeeds, call with `false` so Execute step content is shown. */
    setRoiContent: PropTypes.func.isRequired,
};

export default ROIContent;
