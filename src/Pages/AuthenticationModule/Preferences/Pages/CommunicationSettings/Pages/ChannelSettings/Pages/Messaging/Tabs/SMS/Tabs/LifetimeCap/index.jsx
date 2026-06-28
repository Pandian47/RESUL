import { getChannelId } from 'Utils/modules/communicationChannels';
import { findDuplicates } from 'Utils/modules/dateTime';
import { selectIcon } from 'Utils/modules/display';
import { MAX_LENGTH10 } from 'Constants/GlobalConstant/Regex';
import { DUPLICATE_VALUE, SELECT_ACTION } from 'Constants/GlobalConstant/ValidationMessage';
import { ACTION, FREQUENCY } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';

import { FREQUNCY_RULES } from 'Constants/GlobalConstant/Rules';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSInput from 'Components/FormFields/RSInput';
import RSTooltip from 'Components/RSTooltip';
import RSCheckbox from 'Components/FormFields/RSCheckbox';


import { FORM_INITIAL_STATE } from './constant';
import usePermission from 'Hooks/usePersmission';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import {
    getLifetimeCapActionsData,
    getLifetimeCapData,
    saveLifetimeCap,
} from 'Reducers/preferences/CommunicationSettings/request';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';



const LifetimeCap = () => {
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));

    const {
        control,
        handleSubmit,
        trigger,
        formState: { isValid },
        reset,
    } = useForm(FORM_INITIAL_STATE);
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'lifeTimeCap',
    });
    const navigate = useNavigate();
    const lifeTimeCapWatch = useWatch({
        control,
        name: 'lifeTimeCap',
    });
    const { permissions } = usePermission();
    const [actions, setActions] = useState([]);
    const [lifeTimeActions, setLifeTimeActions] = useState([]);
    const [isEdit, setIsEdit] = useState(false);

    const dispatch = useDispatch();
    const { addAccess } = permissions || {};
    const saveApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const isSaveLoading = saveApi.isFetching;

    const addLifeTimeCap = (index) => {
        if (index === 0) {
            let validationState = lifeTimeCapWatch.findIndex((list) => {
                let values = Object.values(list);
                return values.includes('');
            });

            if (validationState === -1 && isValid) {
                append({ action: '', frequency: '', isDelete: false });
            } else {
                trigger(`lifeTimeCap[${validationState}]`);
            }
        } else {
            let temp = [...lifeTimeActions];
            temp[index].isDelete = true;
            // setLifeTimeActions(temp);
            setLifeTimeActions(temp.hasOwnProperty('lifeTimeCapUniqueID') && [...lifeTimeActions, temp]);

            //  setLifeTimeActions([...lifeTimeActions, temp]);
            remove(index);
        }
    };

    const getLifeTimeCapDataExists = async (data) => {
        const payload = {
            clientId,
            userId,
            channelId: getChannelId('sms')?.id,
            departmentId,
        };
        const res = await dispatch(getLifetimeCapData(payload));
        if (res?.status) {
            let tempLifeTime = res?.data?.lifetimeCap?.map((item) => {
                let tempAction = data?.filter((action) => item?.lifeTimeCapUniqueId === action?.lifeTimeCapId);

                return {
                    lifeTimeCapUniqueId: item?.lifeTimeCapUniqueId,
                    frequency: item?.frequency,
                    action: tempAction?.[0],
                    isDelete: false,
                };
            });
            setLifeTimeActions(tempLifeTime);
            setIsEdit(true);
            reset((prev) => ({
                ...prev,
                transactionCommunication: res?.data?.istransCommuincation,
                lifeTimeCap: tempLifeTime,
            }));
        }
    };

    const handleFormSubmit = async (formState) => {
        if (isSaveLoading) return;
                let tempActions = formState?.lifeTimeCap?.map((item, idx) => ({
            frequency: Number(item?.frequency),
            lifeTimeCapId: item?.action?.lifeTimeCapId,
            lifeTimeCapUniqueID: item?.lifeTimeCapUniqueId || 0, //isEdit ? item?.lifeTimeCapUniqueId : 0,

            isDelete: isEdit ? item?.isDelete : false,
        }));
        let templifeTimeActions = lifeTimeActions?.length > 0 ? tempActions.concat(lifeTimeActions) : tempActions;

        const payload = {
            channelId: getChannelId('sms')?.id,
            clientId,
            userId,
            departmentId,
            isTransCommunication: formState?.transactionCommunication,
            // LifeTimeCap: [
            //     // {
            //     //     frequency: 1,
            //     //     lifeTimeCapId: 8,
            //     //     lifeTimeCapUniqueID: 4,
            //     //     isActive: false,
            //     // },
            //     ...tempActions,
            // ],
            LifeTimeCap: templifeTimeActions,
        };
        const { status } = await saveApi.refetch({
            fetcher: () => dispatch(saveLifetimeCap(payload, false)),
            loaderConfig: fieldLoaderConfig,
            mode: 'create',
        });
        if (!status) {
            trigger();
        }
    };

    const getLifetimeCapActions = async () => {
        const payload = {
            channelId: 1,
            clientId,
            userId,
        };
        const { status, data } = await dispatch(getLifetimeCapActionsData(payload));
        if (status) {
            setActions(data);
            getLifeTimeCapDataExists(data);
        }
    };

    useEffect(() => {
        getLifetimeCapActions();
    }, []);

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)}>
            <>
                {/* Content starts */}
                <div className="rs-sub-heading">
                    <div className="rss-left">
                        <h4>Lifetime cap</h4>
                    </div>
                </div>
                {fields.map((field, index) => (
                    <div className="lifetimeContainer form-group" key={field.id}>
                        <Row>
                            <Col sm={6}>
                                <RSKendoDropDownList
                                    control={control}
                                    name={`lifeTimeCap[${index}].action`}
                                    label={ACTION}
                                    // data={ACTION_STATUS}
                                    data={actions}
                                    textField={'action'}
                                    dataItemKey={'lifeTimeCapId'}
                                    required
                                    rules={{
                                        required: SELECT_ACTION,
                                        validate: () => {
                                            const [status, _] = findDuplicates(lifeTimeCapWatch, 'action.action');
                                            return status ? DUPLICATE_VALUE : true;
                                        },
                                    }}
                                />
                            </Col>
                            <Col sm={6}>
                                <Row>
                                    <Col sm={11}>
                                        <RSInput
                                            control={control}
                                            name={`lifeTimeCap[${index}].frequency`}
                                            placeholder={FREQUENCY}
                                            required
                                            maxLength={MAX_LENGTH10}
                                            rules={FREQUNCY_RULES}
                                        />
                                    </Col>
                                    <Col sm={1} className="fg-icons-wrapper pl0">
                                        <div className="fg-icons">
                                            <RSTooltip text={index === 0 ? 'Add' : 'Delete'} position="top">
                                                <i
                                                    onClick={() => addLifeTimeCap(index)}
                                                    className={`${selectIcon(index)} icon-md cp ${
                                                        fields?.length > 4 && index == 0 ? 'click-off' : ''
                                                    }`}
                                                ></i>
                                            </RSTooltip>
                                        </div>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </div>
                ))}
                <Row className="mt-20">
                    <Col>
                        <small className="mt10">
                            Note: DND/Unsubscription will be auto-scrubbbed during the communication blast process.
                        </small>
                        <p className="mt20 mb20">
                            The rule will only be applicable to bulk and promotional communications.
                        </p>
                        <RSCheckbox
                            control={control}
                            name={`transactionCommunication`}
                            labelName={'Apply to transactional communications.'}
                        />
                    </Col>
                </Row>

                {/* /Content ends */}
            </>
            <div className="buttons-holder">
                <RSSecondaryButton
                    type="button"
                    blockInteraction={isSaveLoading}
                    onClick={() => {
                        if (isSaveLoading) return;
                        navigate('/preferences');
                    }}
                >
                    Cancel
                </RSSecondaryButton>
                {addAccess && (
                    <RSPrimaryButton type="submit" isLoading={isSaveLoading}>
                        Save
                    </RSPrimaryButton>
                )}
            </div>
        </form>
    );
};

export default LifetimeCap;
