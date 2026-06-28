import { FREQUENCY_CAP_LIST, MAX_OF_3_FRRQUENCY_CAP_LIST, OK, SELECT } from 'Constants/GlobalConstant/Placeholders';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Row, Col } from 'react-bootstrap';

import RSSwitch from 'Components/FormFields/RSSwitch';
import RSModal from 'Components/RSModal';
import { RSPrimaryButton } from 'Components/Buttons';
import RSMultiSelect from 'Components/FormFields/RSMultiSelect';

import { handleClickOff } from '../../constant';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { deleteFrequencyCapping, getFrequencyCapOnOff, saveFrequencyCapping } from 'Reducers/communication/createCommunication/execute/request';
import useQueryParams from 'Hooks/useQueryParams';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';

const FrequencyCapModal = ({ show, handleClose, tab, frequencyList, setFrequencyList }) => {
    const {
        control,
        watch,
        setValue,
        reset,
        setError,
        formState: { errors, isValid },
    } = useFormContext();
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const state = useQueryParams('/communication');
    const dispatch = useDispatch();
    const frequencyCapSaveAPI = useApiLoader({ autoFetch: false });
    const frequencyCapDetailsAPI = useApiLoader({ autoFetch: false });
    const [frequencyCapList, potentialAudience, selectFrequency, selectFrequencyList, frequencyOkay, isEditFrequency] =
        watch([
            `${tab}.frequencyCapList`,
            `${tab}.potentialAudience`,
            `${tab}.selectFrequency`,
            `${tab}.selectFrequencyList`,
            `${tab}.frequencyOkay`,
            `${tab}.isEditFrequency`,
        ]);
    const { frequencyCapDetails, channelDetails } = useSelector(({ communicationExecuteReducer }) => communicationExecuteReducer);
    const channelId = channelDetails?.[tab]?.channelId;

    useEffect(() => {
        if (show) setValue(`${tab}.selectFrequencyList`, frequencyList?.[tab]);
    }, [show, frequencyList?.[tab]]);

    const getFrequencyFields = async () => {
        const payload = {
            clientId,
            departmentId,
            userId,
            campaignId: state?.campaignId,
        };
        let res;

        if (frequencyCapDetails?.length > 0) {
            res = frequencyCapDetails;
        } else {
            const data = await frequencyCapDetailsAPI.refetch({
                fetcher: () => dispatch(getFrequencyCapOnOff({ payload, loading: false })),
                mode: 'create',
                loaderConfig: { create: LOADER_TYPE.FIELD },
            });
            res = status ? data : [];
        }
        return res;
    };

    const getAllFrequencyCapData = async (e) => {
        if (e) {
            return getFrequencyFields();
        } else {
            const payload = {
                clientId,
                departmentId,
                userId,
                channelId: channelId,
                campaignId: state?.campaignId,
                isFrequencyCap: false,
            };
            const { status } = await frequencyCapSaveAPI.refetch({
                fetcher: () => dispatch(deleteFrequencyCapping(payload, { loading: false })),
                mode: 'create',
                loaderConfig: { create: LOADER_TYPE.FIELD },
            });
            if (status) {
                setValue(`${tab}.frequencyOkay`, false);
                setValue(`${tab}.selectFrequencyList`, []);
                setValue(`${tab}.selectFrequency`, []);
                setFrequencyList((prev) => ({
                    ...prev,
                    [tab]: [],
                }));
            } else {
                handleClose();
                setValue(`${tab}.frequencyCapList`, true);
            }
        }
    };

    const saveFrequencyCap = async () => {
        if (frequencyCapDetailsAPI.isLoading) return;

        if (selectFrequencyList?.length > 3) {
            setError(`${tab}.selectFrequencyList`, {
                type: 'custom',
                message: MAX_OF_3_FRRQUENCY_CAP_LIST,
            });
            return;
        }

        let temp = [];
        for (var i = 0; i < selectFrequencyList?.length; i++) {
            temp.push(selectFrequencyList[i]?.frequencyCapId);
        }

        const payload = {
            clientId,
            departmentId,
            userId,
            campaignId: state?.campaignId,
            channelId: channelId,
            frequencyId: [...temp],
            isFrequencyCap: frequencyCapList,
        };
        const res = await frequencyCapSaveAPI.refetch({
            fetcher: () => dispatch(saveFrequencyCapping({ payload }, { loading: false })),
            mode: 'create',
            loaderConfig: { create: LOADER_TYPE.FIELD },
        });
        if (res?.status) {
            setValue(`${tab}.frequencyOkay`, true);
            setValue(`${tab}.selectFrequency`, selectFrequencyList);
            setFrequencyList((prev) => ({
                ...prev,
                [tab]: selectFrequencyList,
            }));
            handleClose();
        } else {
            handleClose();
        }
    };

    useEffect(() => {
        if (isEditFrequency) {
            let tempResponse;
            async function getCheckEdit() {
                tempResponse = await getAllFrequencyCapData(true);
                let frequencyList = [];
                for (var i = 0; i < tempResponse?.length; i++) {
                    for (var j = 0; j < selectFrequency?.length; j++) {
                        if (selectFrequency[j].ruleName === tempResponse?.[i]?.name)
                            frequencyList.push(tempResponse[i]);
                    }
                }
                setValue(`${tab}.selectFrequencyList`, frequencyList);
                setFrequencyList((prev) => ({
                    ...prev,
                    [tab]: frequencyList,
                }));
            }
            getCheckEdit();
        }
    }, [isEditFrequency]);

    return (
        <div>
            <RSModal
                show={show}
                size={'md'}
                isLoading={frequencyCapSaveAPI.isLoading && frequencyCapList}
                isCloseDisabled={frequencyCapSaveAPI.isLoading && frequencyCapList}
                handleClose={() => {
                    handleClose();
                    if (!frequencyOkay) {
                        reset((prev) => ({
                            ...prev,
                            [tab]: {
                                ...prev[tab],
                                frequencyCapList: false,
                                selectFrequency: [],
                            },
                        }));
                    }
                }}
                header={FREQUENCY_CAP_LIST}
                body={
                    <>
                        <Row>
                            <Col sm={5} className="pr0">
                                <label className="fs19">{FREQUENCY_CAP_LIST}</label>
                            </Col>
                            <Col sm={5} className={`${handleClickOff(channelDetails?.[tab])} pl0 d-flex align-items-center`}>
                                <RSSwitch
                                    control={control}
                                    name={`${tab}.frequencyCapList`}
                                    handleChange={(e) => getAllFrequencyCapData(e)}
                                />
                                {frequencyCapSaveAPI.isLoading && !frequencyCapList && (
                                    <span className="d-inline-flex align-items-center ml5">
                                        <span className="segment_loader" />
                                    </span>
                                )}
                            </Col>
                        </Row>
                        {frequencyCapList && (
                            <div className="mt30 ">
                                <RSMultiSelect
                                    control={control}
                                    data={frequencyCapDetails}
                                    textField={'name'}
                                    dataItemKey={'frequencyCapId'}
                                    name={`${tab}.selectFrequencyList`}
                                    label={SELECT}
                                    isLoading={frequencyCapDetailsAPI.isLoading}
                                    rules={{
                                        validate: (value) => {
                                            return value?.length > 3 ? MAX_OF_3_FRRQUENCY_CAP_LIST : true;
                                        },
                                    }}
                                />
                                <small>{MAX_OF_3_FRRQUENCY_CAP_LIST}</small>
                            </div>
                        )}
                    </>
                }
                footerClassName={frequencyCapList ? '' : 'p0'}
                footer={
                    <div className={`m0 ${handleClickOff(channelDetails?.[tab])}`}>
                        {frequencyCapList && (
                            <RSPrimaryButton
                                disabledClass={
                                    frequencyCapDetailsAPI.isLoading ||
                                    selectFrequencyList?.length === 0 ||
                                    !isValid
                                        ? 'pe-none click-off'
                                        : ''
                                }
                                onClick={saveFrequencyCap}
                                id="rs_FrequencyCapModal_Ok"
                                isLoading={frequencyCapSaveAPI.isLoading}
                                blockBodyPointerEvents
                            >
                                {OK}
                            </RSPrimaryButton>
                        )}
                    </div>
                }
            />
        </div>
    );
};

export default FrequencyCapModal;
