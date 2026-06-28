import { onlyNumbersDecimalWithoutSpecialCharacters } from 'Utils/modules/inputValidators';
import { CANCEL, INDUSTRY_BENCHMARK, NEXT, SAVE, SAVE_ALL, UPDATE, UPDATE_ALL } from 'Constants/GlobalConstant/Placeholders';
import { useEffect } from 'react';
import RSInput from 'Components/FormFields/RSInput';
import { BENCHMARK_FORM } from '../constant';
import { Col, Row } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';

import { useLocation, useNavigate } from 'react-router-dom';
import { HorizontalSkeleton } from 'Components/Skeleton/Skeleton';
import { getBenchmarkFormKey } from '../BenchmarkTabs/constant';
const RenderBenchmark = ({ channel }) => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { control, getValues, setValue, watch } = useFormContext();
    const formKey = getBenchmarkFormKey(channel);
    const { reach, conversion, engagement } = BENCHMARK_FORM[formKey] || {};
    const channelData = watch(channel);
    const channelIndustryRange = watch(`${channel}Range`);
    const hasChannelData = Array.isArray(channelData) && channelData.length >= 3;

    useEffect(() => { }, []);

    const isLoading = watch('isLoadingListName');
    const benchmarkSubmitting = watch('benchmarkSubmitting');
    const pointerNone = isLoading || benchmarkSubmitting ? 'pe-none' : '';
    const navMeta = watch('navMeta') || {};
    const isOverallStep = !!navMeta.isOverallStep;
    const isActiveChannel = navMeta?.activeChannelKey === channel;
    const showNext = navMeta?.activeChannelKey === channel ? !!navMeta?.hasNextStep : true;
    const saveEnabledActiveChannel = !!watch('saveEnabledActiveChannel');
    const saveEnabledAnyChannel = !!watch('saveEnabledAnyChannel');
    const hasFormFields = !!(reach && engagement && conversion);
    const showSaveButton =
        isActiveChannel &&
        ((!hasChannelData && isOverallStep) || (hasChannelData && hasFormFields));
    const saveDisabledByChanges = isOverallStep ? !saveEnabledAnyChannel : !saveEnabledActiveChannel;
    const isSaveDisabled = saveDisabledByChanges || benchmarkSubmitting;
    const saveLabel =
        state?.mode === 'create'
            ? isOverallStep
                ? SAVE_ALL
                : SAVE
            : isOverallStep
              ? UPDATE_ALL
              : UPDATE;

    if (!hasChannelData || !reach || !engagement || !conversion) {
        return (
                <div className="rsv-tabs-content">
                    <div className="box-design bd-top-border">
                        <HorizontalSkeleton isError count={6} height={34} />
                    </div>
                    <div className={`buttons-holder ${pointerNone}`}>
                        <RSSecondaryButton
                            className="color-secondary-orange"
                            onClick={() => {
                                navigate('/preferences/communication-settings', {
                                    state: { tab: 2, from: 'benchmark' },
                                });
                            }}
                        >
                            {CANCEL}
                        </RSSecondaryButton>
                        {showSaveButton && (
                            isOverallStep ? (
                                <RSPrimaryButton
                                    type="submit"
                                    disabled={isSaveDisabled}
                                    disabledClass={isSaveDisabled ? 'pe-none click-off' : ''}
                                    onClick={() => setValue('submitAction', 'save', { shouldDirty: false })}
                                    id="rs_RenderBenchmark_save"
                                >
                                    {saveLabel}
                                </RSPrimaryButton>
                            ) : (
                                <RSSecondaryButton
                                    className="color-secondary-blue"
                                    type="submit"
                                    disabled={isSaveDisabled}
                                    disabledClass={isSaveDisabled ? 'pe-none click-off' : ''}
                                    onClick={() => setValue('submitAction', 'save', { shouldDirty: false })}
                                    id="rs_RenderBenchmark_save"
                                >
                                    {saveLabel}
                                </RSSecondaryButton>
                            )
                        )}
                        {showNext && (
                            <RSPrimaryButton
                                type="submit"
                                disabled={benchmarkSubmitting}
                                disabledClass={benchmarkSubmitting ? 'pe-none click-off' : ''}
                                onClick={() => setValue('submitAction', 'next', { shouldDirty: false })}
                                id="rs_RenderBenchmark_next"
                            >
                                {NEXT}
                            </RSPrimaryButton>
                        )}
                    </div>
                </div>
        );
    }
    return (
            <div className="rsv-tabs-content">
                <div className="box-design bd-top-border">
                    <div className="form-group mt22">
                        <Row>
                            {/* <Col sm={4} className="text-right">
                                <label className="control-label-left">
                                    {reach.label}
                                    <small>({reach.config.content})</small>
                                </label>
                            </Col> */}
                            <Col sm={{ offset: 3, span: 4 }} className="pl0 width402p">
                                <RSInput
                                    name={channel + '[0].startRange'}
                                    required
                                    id="rs_RenderBenchmark_reach"
                                    control={control}
                                    placeholder={reach.label}
                                    onKeyDown={onlyNumbersDecimalWithoutSpecialCharacters}
                                    maxLength={10}
                                    rules={{
                                        required: 'Enter reach',
                                        validate: (val) => {
                                            if (Number(val) < 0.1) {
                                                return 'Minimun reach rate is 0.1'
                                            } else if (Number(val) > 99) {
                                                return 'Maximum reach rate is 99'
                                            }
                                        }
                                    }}
                                />
                                <small>({reach.config.content})</small>
                            </Col>
                            <Col sm={4}>
                                <small className="color-primary-black position-relative top2">
                                    {INDUSTRY_BENCHMARK}{' '}
                                    {channelIndustryRange?.[0]?.range ?? getValues(`${channel}Range`)?.[0]?.range ?? 0}{' '}
                                    <span className="font-xxs">%</span>
                                </small>
                            </Col>
                        </Row>
                    </div>
                    <div className="form-group">
                        <Row>
                            {/* <Col sm={4} className="text-right">
                                <label className="control-label-left">{engagement.label}</label>
                                <small className="mt-5">({engagement.config.content})</small>
                            </Col> */}
                            <Col sm={{ offset: 3, span: 4 }} className="pl0 width402p">
                                <RSInput
                                    name={channel + '[1].startRange'}
                                    required
                                    control={control}
                                    id="rs_RenderBenchmark_engagement"
                                    maxLength={10}
                                    placeholder={engagement.label}
                                    onKeyDown={onlyNumbersDecimalWithoutSpecialCharacters}
                                    rules={{
                                        required: 'Enter engagement',
                                        validate: (val) => {
                                            if (Number(val) < 0.1) {
                                                return 'Minimun engagement rate is 0.1'
                                            } else if (Number(val) > 99) {
                                                return 'Maximum engagement rate is 99'
                                            }
                                        }
                                    }}
                                />
                                <small>({engagement.config.content})</small>
                            </Col>
                            <Col sm={4}>
                                <small className="color-primary-black position-relative top2">
                                    {INDUSTRY_BENCHMARK}{' '}
                                    {channelIndustryRange?.[1]?.range ?? getValues(`${channel}Range`)?.[1]?.range ?? 0}{' '}
                                    <span className="font-xxs">%</span>
                                </small>
                            </Col>
                        </Row>
                    </div>
                    <div className="form-group mb0">
                        <Row>
                            {/* <Col sm={4} className="text-right">
                                <label className="control-label-left">{conversion.label}</label>
                                <small className="mt-5">({conversion.config.content})</small>
                            </Col> */}
                            <Col sm={{ offset: 3, span: 4 }} className="pl0 width402p">
                                <RSInput
                                    name={channel + '[2].startRange'}
                                    required
                                    control={control}
                                    placeholder={conversion.label}
                                    id="rs_RenderBenchmark_conversion"
                                    rules={{
                                        required: 'Enter conversion',
                                        validate: (val) => {
                                            if (Number(val) < 0.1) {
                                                return 'Minimun conversion rate is 0.1'
                                            } else if (Number(val) > 99) {
                                                return 'Maximum conversion rate is 99'
                                            }
                                        }
                                    }}
                                    maxLength={10}
                                    onKeyDown={onlyNumbersDecimalWithoutSpecialCharacters}
                                />
                                <small>({conversion.config.content})</small>
                            </Col>
                            <Col sm={4}>
                                <small className="color-primary-black position-relative top2">
                                    {INDUSTRY_BENCHMARK}{' '}
                                    {channelIndustryRange?.[2]?.range ?? getValues(`${channel}Range`)?.[2]?.range ?? 0}{' '}
                                    <span className="font-xxs">%</span>
                                </small>
                            </Col>
                        </Row>
                    </div>
                </div>
                <div className={`buttons-holder ${pointerNone}`}>
                    <RSSecondaryButton
                        className="color-secondary-orange"
                        onClick={() => {
                            navigate('/preferences/communication-settings', {
                                state: { tab: 2, from: 'benchmark' },
                            });
                        }}
                    >
                        {CANCEL}
                    </RSSecondaryButton>
                    {showSaveButton && (
                        isOverallStep ? (
                            <RSPrimaryButton
                                type="submit"
                                disabled={isSaveDisabled}
                                disabledClass={isSaveDisabled ? 'pe-none click-off' : ''}
                                onClick={() => setValue('submitAction', 'save', { shouldDirty: false })}
                                id="rs_RenderBenchmark_save"
                            >
                                {saveLabel}
                            </RSPrimaryButton>
                        ) : (
                            <RSSecondaryButton
                                className="color-secondary-blue"
                                type="submit"
                                disabled={isSaveDisabled}
                                disabledClass={isSaveDisabled ? 'pe-none click-off' : ''}
                                onClick={() => setValue('submitAction', 'save', { shouldDirty: false })}
                                id="rs_RenderBenchmark_save"
                            >
                                {saveLabel}
                            </RSSecondaryButton>
                        )
                    )}
                    {showNext && (
                        <RSPrimaryButton
                            type="submit"
                            disabled={benchmarkSubmitting}
                            disabledClass={benchmarkSubmitting ? 'pe-none click-off' : ''}
                            onClick={() => setValue('submitAction', 'next', { shouldDirty: false })}
                            id="rs_RenderBenchmark_next"
                        >
                            {NEXT}
                        </RSPrimaryButton>
                    )}
                </div>
            </div>
    );
};

export default RenderBenchmark;
