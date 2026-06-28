import { getChannelId } from 'Utils/modules/communicationChannels';
import { findDuplicates } from 'Utils/modules/dateTime';
import { selectIcon } from 'Utils/modules/display';
import { onlyNumbers } from 'Utils/modules/inputValidators';
import { MAX_LENGTH5 } from 'Constants/GlobalConstant/Regex';
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

    const { permissions } = usePermission();
    const { addAccess } = permissions || {};
    const [isEdit, setIsEdit] = useState(false);
    const [actions, setActions] = useState([]);
    const [lifeTimeActions, setLifeTimeActions] = useState([]);
    const [isActions, setIsActions] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const saveApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const isSaveLoading = saveApi.isFetching;

    const {
        control,
        handleSubmit,
        trigger,
        reset,
        formState: { isValid },
    } = useForm(FORM_INITIAL_STATE);

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'lifeTimeCap',
    });
    const lifeTimeCapWatch = useWatch({
        control,
        name: 'lifeTimeCap',
    });

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
            let temp = lifeTimeCapWatch[index];
            temp.isDelete = true;
            setIsActions(true);
            // let temp = [...lifeTimeActions];
            // temp[index] = {
            //     ...temp[index],
            //     isDelete: true,
            // };

            const newState = lifeTimeActions.map((obj) =>
                obj.lifeTimeCapUniqueId === temp.lifeTimeCapUniqueId ? { ...obj, isDelete: true } : obj,
            );
                        //  setLifeTimeActions(temp.hasOwnProperty('lifeTimeCapUniqueId') && [...lifeTimeActions, temp]);

            //  setLifeTimeActions([...lifeTimeActions, temp]);
            setLifeTimeActions(newState);
            remove(index);
        }
    };
    const getLifeTimeCapDataExists = async (data) => {
        const payload = {
            clientId,
            userId,
            departmentId,
            channelId: getChannelId('email')?.id,
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
        let tempActionsEdit = {};
        if (lifeTimeActions?.length !== undefined) {
            tempActionsEdit = lifeTimeActions?.map((item, idx) => ({
                frequency: Number(item?.frequency),
                lifeTimeCapId: item?.action?.lifeTimeCapId,
                lifeTimeCapUniqueID: item?.lifeTimeCapUniqueId, //isEdit ? item?.lifeTimeCapUniqueId : 0,
                isDelete: item?.isDelete,
            }));
        } else {
            tempActionsEdit = {
                frequency: lifeTimeActions?.frequency,
                lifeTimeCapId: lifeTimeActions?.action?.lifeTimeCapId,
                lifeTimeCapUniqueID: lifeTimeActions?.lifeTimeCapUniqueId, //isEdit ? item?.lifeTimeCapUniqueId : 0,
                isDelete: lifeTimeActions?.isDelete,
            };
        }

                // let templifeTimeActions = lifeTimeActions?.length > 0 ? tempActions.concat(lifeTimeActions) : tempActions;
        let templifeTimeActions =
            lifeTimeActions.findIndex((e) => e.isDelete === 'true') != -1
                ? tempActions.concat(tempActionsEdit)
                : tempActions;

        const payload = {
            // channelId: 1,
            channelId: getChannelId('email')?.id,
            clientId,
            userId,
            departmentId,
            isTransCommunication: formState?.transactionCommunication,
            // LifeTimeCap: [...tempActions, lifeTimeActions],
            LifeTimeCap: isActions ? tempActionsEdit : tempActions,
        };
        // console.log('payload: ', payload);
        const { status } = await saveApi.refetch({
            fetcher: () => dispatch(saveLifetimeCap(payload, false)),
            loaderConfig: fieldLoaderConfig,
            mode: 'create',
        });
        if (!status) {
            trigger();
        } else {
            getLifeTimeCapDataExists(actions);
        }
    };

    const getLifetimeCapActions = async () => {
        const payload = {
            channelId: 1,
            clientId,
            userId,
            departmentId,
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
        <form className="rsv-tabs-content" onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="box-design bd-top-border">
                {/* Content starts */}
                <div className="rs-sub-heading">
                    <div className="rss-left">
                        <h4>Lifetime cap</h4>
                    </div>
                </div>
                {fields.map(
                    (field, index) =>
                        !field?.isDelete && (
                            <div className="lifetimeContainer form-group" key={field.id}>
                                <Row>
                                    <Col sm={6}>
                                        <RSKendoDropDownList
                                            control={control}
                                            name={`lifeTimeCap[${index}].action`}
                                            label={ACTION}
                                            data={actions}
                                            textField={'action'}
                                            dataItemKey={'lifeTimeCapId'}
                                            required
                                            rules={{
                                                required: SELECT_ACTION,
                                                validate: () => {
                                                    const [status, _] = findDuplicates(
                                                        lifeTimeCapWatch,
                                                        'action.action',
                                                    );
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
                                                    onKeyDown={(e) => onlyNumbers(e)}
                                                    maxLength={MAX_LENGTH5}
                                                    rules={FREQUNCY_RULES}
                                                />
                                            </Col>
                                            <Col sm={1} className="fg-icons-wrapper pl0">
                                                <div className="fg-icons">
                                                    <RSTooltip text={index === 0 ? 'Add' : 'Delete'} position="top">
                                                        <i
                                                            onClick={() => {
                                                                if (addAccess) addLifeTimeCap(index);
                                                            }}
                                                            className={`${selectIcon(index)} icon-md cp ${
                                                                fields?.length > 4 && index == 0 ? 'click-off' : ''
                                                            } ${!addAccess ? 'click-off' : ''}`}
                                                        ></i>
                                                    </RSTooltip>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </div>
                        ),
                )}
                <Row className="mt-20">
                    <Col>
                        <small className="mt10">
                            Note: Unsubscription will be auto-scrubbbed during the communication blast process.
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
            </div>
            <div className="buttons-holder">
                <RSSecondaryButton type="button" blockInteraction={isSaveLoading}>
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
