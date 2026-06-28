import { formatName } from 'Utils/modules/formatters';
import { useCallback, useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { buildPayloadPurchasePattern, FREQUENCY_TIME_PURCHASE_PATTERN, INITIAL_STATE, worthLimit } from './constant';
import { setAudienceScoreTab } from 'Reducers/preferences/audienceScore/reducer';
import usePermission from 'Hooks/usePersmission';
import { getSessionId } from 'Reducers/globalState/selector';
import {
    getPurchasePattern,
    save_PurchasePattern,
    update_PurchasePattern,
} from 'Reducers/preferences/audienceScore/request';
import PurchasePatternComponent from '../Components/PurchasePattern';
import RangeCampareCard from '../Components/PurchasePattern/RangeCampareCard';
import { AudienceScoreTabContentSkeletonGate } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';
import { handlePurchasePatternGradingTotal } from '../Components/constants';




const PurchasePattern = () => {
    const methods = useForm(INITIAL_STATE);
    const dispatch = useDispatch();
    const { permissions } = usePermission();
    const { addAccess, updateAccess } = permissions || {};
    const { departmentId, clientId, userId, departmentName } = useSelector((state) => getSessionId(state));
    const [purchasePatternData, setPurchasePatternData] = useState([]);
    const pageLoadApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const {
        handleSubmit,
        setValue,
        getValues,
        trigger,
        formState: { errors, isValid },
    } = methods;
    const { activeTab } = useSelector((state) => state.audienceScoreReducer);
    const navigate = useNavigate();
    const handleSave = async (data, from) => {
                const fieldNames = ['receny', 'frequency', 'worth', 'grading'];
        for (const field of fieldNames) {
            trigger(`${field}Values`);
        }

        // console.log('errors: ', errors);

        const currentUserDetail = {
            departmentId,
            clientId,
            userId,
        };

        const handleNavigation = (response, from) => {
            if (response?.status) {
                if (from === 'save') {
                    navigate(`/preferences`);
                } else {
                    dispatch(setAudienceScoreTab(activeTab + 1));
                }
            } else {
                return;
            }
        };

        if (purchasePatternData?.length) {
            const payload = buildPayloadPurchasePattern(purchasePatternData, data, currentUserDetail, false);
                        const response = await dispatch(update_PurchasePattern(payload));
            await handleNavigation(response, from);
        } else {
            const payload = buildPayloadPurchasePattern(purchasePatternData, data, currentUserDetail, true);
                        const response = await dispatch(save_PurchasePattern(payload));
            await handleNavigation(response, from);
        }
    };
    const bootstrapPurchasePattern = useCallback(() => {
        if (!clientId || !departmentId || !userId) {
            return undefined;
        }
        const payload = { clientId, departmentId, userId };
        return pageLoadApi.refetch({
            fetcher: () => dispatch(getPurchasePattern(payload)),
            onSuccess: (response) => {
                if (response?.status) {
                    setPurchasePatternData(response?.data ?? []);
                } else {
                    setPurchasePatternData([]);
                }
            },
            onError: () => {
                setPurchasePatternData([]);
            },
        });
    }, [clientId, departmentId, userId, dispatch, pageLoadApi.refetch]);

    useEffect(() => {
        bootstrapPurchasePattern();
    }, [bootstrapPurchasePattern]);

    const handlePurchasePatternType = (data, patternSegementName) => {
        const updatePatternData = data?.filter(
            (item) => formatName(item?.patternSegmentKey) === formatName(patternSegementName),
        );
        return updatePatternData[0] || {};
    };

    const totalValues = getValues();
    const { frequencyValues, recencyValues, worthValues } = totalValues;

    useEffect(() => {
        handlePurchasePatternGradingTotal(totalValues, setValue);
    }, [frequencyValues, recencyValues, worthValues]);

    return (
        <FormProvider {...methods}>
            <AudienceScoreTabContentSkeletonGate isLoading={pageLoadApi.isFetching} variant="purchase">
            <form className="rsv-tabs-content" onSubmit={handleSubmit(handleSave)}>
                <div className="box-design bd-top-border">
                    {/* Content starts */}
                    <Row className="mb10">
                        <Col sm={8}>
                            <h4 className="m0">Purchase pattern</h4>
                        </Col>
                    </Row>
                    <Row>
                        {purchasePatternData?.length > 0 && (
                            <>
                                <PurchasePatternComponent
                                    name="recency"
                                    head="Recent purchase"
                                    title={'By recency'}
                                    purchasePatternData={handlePurchasePatternType(purchasePatternData, 'Recency')}
                                />
                                <RangeCampareCard
                                    name="frequency"
                                    purchasePatternData={handlePurchasePatternType(
                                        purchasePatternData,
                                        'Purchase frequency',
                                    )}
                                    head="Purchase frequency"
                                    title={'Times/'}
                                    DurationData={FREQUENCY_TIME_PURCHASE_PATTERN}
                                />
                                <RangeCampareCard
                                    name="worth"
                                    purchasePatternData={handlePurchasePatternType(
                                        purchasePatternData,
                                        'Purchase worth',
                                    )}
                                    head="Purchase worth"
                                    title={'Price range  in '}
                                    DurationData={worthLimit}
                                    isWorth
                                />
                                <RangeCampareCard
                                    name="grading"
                                    purchasePatternData={handlePurchasePatternType(purchasePatternData, 'Grading')}
                                    head="Grading"
                                    title={'Total score'}
                                    isGrading={true}
                                    DurationData={worthLimit}
                                />
                            </>
                        )}

                        {/* <CommonCard name={'recency'} head={'Recency'} constants={RECENCY} title={'Data wise'} />
                        <CompareCard
                            head={'Frequency'}
                            name={'frequency'}
                            lessLabel="Less than"
                            moreLabel="More than"
                        />
                        <CompareCard
                            head={'Purchase worth'}
                            name={'purchaseWorth'}
                            lessLabel="Below"
                            moreLabel="Above"
                        />
                        <Grading head={'Grading'} name={'grading'} /> */}
                    </Row>
                </div>
                {/* Buttons Row */}
                <div className="buttons-holder">
                    <RSSecondaryButton onClick={() => navigate(`/preferences`)}>Cancel</RSSecondaryButton>
                    {(addAccess || updateAccess) && (
                        <>
                            <RSSecondaryButton
                                type="submit"
                                className={`color-primary-blue ${Object.keys(errors)?.length ? 'click-off' : ''}`}
                            >
                                Save
                            </RSSecondaryButton>
                            <RSPrimaryButton
                                className={`${Object.keys(errors)?.length ? 'click-off' : ''}`}
                                type="submit"
                            >
                                Next
                            </RSPrimaryButton>
                        </>
                    )}
                </div>
            </form>
            </AudienceScoreTabContentSkeletonGate>
        </FormProvider>
    );
};

export default PurchasePattern;
