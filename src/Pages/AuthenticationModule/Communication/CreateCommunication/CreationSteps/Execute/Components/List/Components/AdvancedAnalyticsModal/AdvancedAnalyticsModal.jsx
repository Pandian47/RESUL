import { statusIdCheck } from 'Utils/modules/campaignUtils';
import { ADVANCE_ANALYTICS_LIST, MAX_OF5_FROM_THE_LIST, OK, SELECT, SELECT_AT_LEAST_ONE } from 'Constants/GlobalConstant/Placeholders';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Row, Col } from 'react-bootstrap';

import RSSwitch from 'Components/FormFields/RSSwitch';
import RSModal from 'Components/RSModal';
import RSMultiSelect from 'Components/FormFields/RSMultiSelect';

import { RSPrimaryButton } from 'Components/Buttons';
import { useDispatch, useSelector } from 'react-redux';
import {
    getAdvancedCustomFields,
    saveAdvanceAnalytics,
} from 'Reducers/communication/createCommunication/execute/request';
import { getSessionId } from 'Reducers/globalState/selector';
import useQueryParams from 'Hooks/useQueryParams';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';

import { updateAdvAnalyticsData } from 'Reducers/communication/createCommunication/execute/reducer';

const AdvancedAnalyticsModal = ({ show, handleClose, tab }) => {
    const {
        control,
        watch,
        reset,
        setValue,
        setError,
        formState: { isValid },
    } = useFormContext();
    const dispatch = useDispatch();
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const [advancedAnalyticsList, selectAdvancedAnalytics, advancedAnalyticsOkay] = watch([
        `${tab}.advancedAnalyticsList`,
        `${tab}.selectAdvancedAnalytics`,
        `${tab}.advancedAnalyticsOkay`,
    ]);
    const state = useQueryParams('/communication');
    const { advancedAnalyticsData, campaignDetails, channelDetails, advAnalyticsData } = useSelector(
        ({ communicationExecuteReducer }) => communicationExecuteReducer,
    );
    const channelId = channelDetails?.[tab]?.channelId;
    const advancedAnalyticsSaveAPI = useApiLoader({ autoFetch: false });
    const advancedAnalyticsDetailsAPI = useApiLoader({ autoFetch: false });

    useEffect(() => {
        if (show) setValue(`${tab}.selectAdvancedAnalytics`, advAnalyticsData?.[tab]);
    }, [show, advAnalyticsData?.[tab]]);

    const handleError = () => {
        if (!selectAdvancedAnalytics?.length) {
            setError(`${tab}.selectAdvancedAnalytics`, {
                type: 'custom',
                message: SELECT_AT_LEAST_ONE,
            });
            return false;
        }
        if (selectAdvancedAnalytics?.length > 5) {
            setError(`${tab}.selectAdvancedAnalytics`, {
                type: 'custom',
                message: MAX_OF5_FROM_THE_LIST,
            });
            return false;
        }
        return true;
    };

    const getAdvancedCustomFieldsData = async () => {
        const payload = {
            campaignId: state?.campaignId,
            departmentId,
            clientId,
            userId,
        };
        let res;

        if (advancedAnalyticsData?.length > 0) {
            res = advancedAnalyticsData;
        } else {
            const data = await advancedAnalyticsDetailsAPI.refetch({
                fetcher: () => dispatch(getAdvancedCustomFields({ payload, loading: false })),
                mode: 'create',
                loaderConfig: { create: LOADER_TYPE.FIELD },
            });
            res = status ? data : [];
        }
        return res;
    };

    useEffect(() => {
        if (show && campaignDetails?.channelDetails && !Object.keys(advAnalyticsData ?? {}).length) {
            const getAdvCustomFeilds = async () => {
                const res = await getAdvancedCustomFieldsData();
                for (var i = 0; i < campaignDetails?.channelDetails?.length; i++) {
                    let name = campaignDetails?.channelDetails[i]?.channelName;
                    let advanceFieldList =
                        campaignDetails?.channelDetails[i]?.contentDetail?.listquality?.advancedFieldList;
                    const editData = advanceFieldList
                        ? advanceFieldList?.includes(',')
                            ? advanceFieldList?.split(',')
                            : [advanceFieldList]
                        : [];
                    const filterList = res?.filter((analytics) =>
                        editData.some((field) => field === analytics?.attributeName),
                    );
                    dispatch(updateAdvAnalyticsData({ field: name, data: filterList }));
                }
            };
            getAdvCustomFeilds();
        }
    }, [campaignDetails?.channelDetails, show]);

    const handleAdvanceAnalyticsClose = async (e) => {
        if (e) {
            getAdvancedCustomFieldsData();
        } else {
            const payload = {
                clientId,
                userId,
                campaignId: state?.campaignId,
                channelId: channelId,
                departmentId,
                advValue: '',
            };
            const res = await advancedAnalyticsSaveAPI.refetch({
                fetcher: () => dispatch(saveAdvanceAnalytics({ payload }, { loading: false })),
                mode: 'create',
                loaderConfig: { create: LOADER_TYPE.FIELD },
            });
            if (res?.status) {
                setValue(`${tab}.selectAdvancedAnalytics`, []);
                setValue(`${tab}.advancedAnalyticsOkay`, false);
                dispatch(updateAdvAnalyticsData({ field: tab, data: [], isReset: true }));
            } else {
                handleClose();
                setValue(`${tab}.advancedAnalyticsList`, true);
            }
        }
    };

    const saveAdvanceAnalyticsData = async () => {
        if (advancedAnalyticsDetailsAPI.isLoading) return;

        let tempAdvValue = [];
        for (var i = 0; i < selectAdvancedAnalytics?.length; i++) {
            tempAdvValue.push(selectAdvancedAnalytics[i]?.attributeName);
        }

        const status = handleError();
        if (status) {
            const payload = {
                clientId,
                userId,
                campaignId: state?.campaignId,
                channelId: channelId,
                departmentId,
                advValue: tempAdvValue.join(),
            };
            const res = await advancedAnalyticsSaveAPI.refetch({
                fetcher: () => dispatch(saveAdvanceAnalytics({ payload }, { loading: false })),
                mode: 'create',
                loaderConfig: { create: LOADER_TYPE.FIELD },
            });
            if (res?.status) {
                dispatch(updateAdvAnalyticsData({ field: tab, data: selectAdvancedAnalytics }));
                setValue(`${tab}.advancedAnalyticsOkay`, true);
                handleClose();
            } else {
                handleClose();
            }
        }
    };

    return (
        <div>
            <RSModal
                show={show}
                size="md"
                isLoading={advancedAnalyticsSaveAPI.isLoading}
                isCloseDisabled={advancedAnalyticsSaveAPI.isLoading}
                handleClose={() => {
                    handleClose();
                    if (!advancedAnalyticsOkay) {
                        reset((prev) => ({
                            ...prev,
                            [tab]: {
                                ...prev[tab],
                                advancedAnalyticsList: false,
                                selectAdvancedAnalytics: [],
                            },
                        }));
                    }
                }}
                header={ADVANCE_ANALYTICS_LIST}
                body={
                    <>
                        <Row className="align-items-center">
                            <Col sm={5} className="pr0">
                                <label className="fs19">{ADVANCE_ANALYTICS_LIST}</label>
                            </Col>
                            <Col
                                sm={6}
                                className={`${!statusIdCheck(state?.campaignStatusId) ? 'pe-none click-off' : ''} d-flex align-items-center`}
                            >
                                <RSSwitch
                                    control={control}
                                    name={`${tab}.advancedAnalyticsList`}
                                    disabled={!statusIdCheck(state?.campaignStatusId)}
                                    handleChange={(e) => handleAdvanceAnalyticsClose(e)}
                                />
                                {advancedAnalyticsSaveAPI.isLoading && !advancedAnalyticsList && (
                                    <span className="d-inline-flex align-items-center ml5">
                                        <span className="segment_loader" />
                                    </span>
                                )}
                            </Col>
                        </Row>
                        {advancedAnalyticsList && (
                            <div className="mt30">
                                <RSMultiSelect
                                    control={control}
                                    name={`${tab}.selectAdvancedAnalytics`}
                                    label={SELECT}
                                    dataItemKey="dataAttributeId"
                                    textField="uiPrintableName"
                                    data={advancedAnalyticsData}
                                    isLoading={advancedAnalyticsDetailsAPI.isLoading}
                                    rules={{
                                        validate: (value) => {
                                            return value?.length > 5 ? MAX_OF5_FROM_THE_LIST : true;
                                        },
                                    }}
                                />
                                <small>{MAX_OF5_FROM_THE_LIST}</small>
                            </div>
                        )}
                    </>
                }
                footerClassName={advancedAnalyticsList ? '' : 'p0'}
                footer={
                    <>
                        {advancedAnalyticsList && (
                            <RSPrimaryButton
                                disabledClass={
                                    advancedAnalyticsDetailsAPI.isLoading ||
                                    !statusIdCheck(state?.campaignStatusId) ||
                                    selectAdvancedAnalytics?.length === 0 ||
                                    !isValid
                                        ? 'pe-none click-off'
                                        : ''
                                }
                                onClick={saveAdvanceAnalyticsData}
                                id="rs_AdvanceAnalyticSModal_Ok"
                                isLoading={advancedAnalyticsSaveAPI.isLoading}
                            >
                                {OK}
                            </RSPrimaryButton>
                        )}
                    </>
                }
            />
        </div>
    );
};

export default AdvancedAnalyticsModal;
