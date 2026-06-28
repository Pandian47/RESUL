import { addHoursToDate, getDDMMMYYYY } from 'Utils/modules/dateTime';
import { addDaysToDate } from 'Utils/modules/dateTime';
import { isValidDate } from 'Utils/modules/uiToast';
import { CANCEL, MAX_4_TRIGGERS, OK, WAIT_FOR } from 'Constants/GlobalConstant/Placeholders';
import { alert_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, memo, useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { Row, Col } from 'react-bootstrap';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import RSInput from 'Components/FormFields/RSInput';
import RSBootstrapDropdown from 'Components/FormFields/RSBootstrapdown';
import RSModal from 'Components/RSModal';
import { RSSecondaryButton, RSPrimaryButton } from 'Components/Buttons';

import _map from 'lodash/map';
import _filter from 'lodash/filter';
import _get from 'lodash/get';

import {
    HandleUpdateEdgeLabelDateTimeValidation,
    getActionModule,
    channelRemoveByAction,
    DAY_OR_HOUR_FIELD_RULE,
    DAY_OR_HOUR_FIELD_RULE_CONVERSION,
} from './ActionItemConstant';
import DeleteChannelFromAction from './DeleteChannelFromAction';
import { getSessionId } from 'Reducers/globalState/selector';
import { deletMdcChannels } from 'Reducers/communication/createCommunication/Mdc/Canvas/request';
import useQueryParams from 'Hooks/useQueryParams';
const MAX_SELECTABLE_ACTIONS = 4;

const TriggerActionModal = ({
    title,
    show,
    onClose,
    currentTriggerAction,
    scheduleDate,
    formSubmit,
    dispatchState,
    ...restParam
}) => {
    const campaignDetails = useQueryParams('/communication');
    const location = useLocation();
    const dispatch = useDispatch();
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    //  const [triggerActionError, setTriggerActionError] = useState('Select atleaset one option');
    const [isShowConfirm, setShowConfirm] = useState(false);
    const [isShow, setShow] = useState(false);
    const [currentOption, setCurrentOption] = useState({});
    const [focusEle, setFocusEle] = useState(null);
    const [campaignId, setCampaignId] = useState(0);
    const [primaryGoal, setPrimaryGoal] = useState('R');

    const { currentWindowId, canvasData } = restParam;
    const methods = useForm({
        defaultValues: {
            triggerActionListConfig: [...currentTriggerAction],
        },
        mode: 'onChange',
    });
        const {
        control,
        handleSubmit,
        getValues,
        setValue,
        setFocus,
        setError,
        clearErrors,
        watch,
        reset,
        register,
        formState: { errors, isValid, touchedFields },
    } = methods;

    const { fields, insert, replace, update } = useFieldArray({
        control,
        name: 'triggerActionListConfig',
    });

    useEffect(() => {
        setFocus(focusEle);
    }, [focusEle]);
    useEffect(() => {
        setShow(show);
    }, [show]);
    useEffect(() => {
                const campaignId = _get(campaignDetails, 'campaignId', 0);
        const primaryGoal = _get(campaignDetails, 'primaryGoal', 'R');
        setCampaignId(campaignId);
        setPrimaryGoal(primaryGoal);
    }, [campaignDetails]);
    useEffect(() => {
        const subscription = watch((value, { name, type }) => {
                        setFocusEle(name);
            //setFocus(name);
        });
        return () => subscription.unsubscribe();
    }, [watch['triggerActionListConfig']]);

    const triggerActionValidator = ({ name, getValues, index, ele }) => {
        const selectedOption =
            primaryGoal.toLowerCase() === 'conversion'
                ? _filter(getValues(name), { checked: true })
                : _filter(getValues(name), { checked: true, durVal: '' });
        const maxSelectOption = _filter(getValues(name), { checked: true });
                if (
            primaryGoal.toLowerCase() !== 'conversion' &&
            selectedOption?.length > 0 &&
            selectedOption?.length <= MAX_SELECTABLE_ACTIONS &&
            maxSelectOption?.length <= MAX_SELECTABLE_ACTIONS
        ) {
            const disabledOption = _map(getValues(name), (item) => {
                                if (item.checked) {
                    let durDate = '';
                    if (item.durType.value === 'days') durDate = addDaysToDate(scheduleDate, item.durVal);
                    if (item.durType.value === 'hours') durDate = addHoursToDate(scheduleDate, item.durVal);
                    item = { ...item, disabled: false, durDate };
                } else {
                    item = { ...item, disabled: true };
                }
                return item;
            });
                        replace(disabledOption);
        } else if (primaryGoal.toLowerCase() === 'conversion') {
            if (selectedOption?.length > 0 && selectedOption?.length <= MAX_SELECTABLE_ACTIONS && maxSelectOption?.length <= MAX_SELECTABLE_ACTIONS) {
                const disabledOption = _map(getValues(name), (item) => {
                                        if (item.checked && item.value !== 3) {
                        let durDate = '';
                        if (item.durType.value === 'days') durDate = addDaysToDate(scheduleDate, item.durVal);
                        if (item.durType.value === 'hours') durDate = addHoursToDate(scheduleDate, item.durVal);
                        item = { ...item, disabled: false, durDate };
                    } else {
                        item = selectedOption?.length < MAX_SELECTABLE_ACTIONS ? { ...item, disabled: false } : { ...item, disabled: true };
                    }
                                        return item;
                });
                                replace(disabledOption);
                setTriggerActionError('');
            }
        } else if (maxSelectOption?.length < MAX_SELECTABLE_ACTIONS) {
            const disabledOption = _map(getValues(name), (item) => {
                if (item.checked) {
                    let durDate = '';
                    if (item.durType.value === 'days') durDate = addDaysToDate(scheduleDate, item.durVal);
                    if (item.durType.value === 'hours') durDate = addHoursToDate(scheduleDate, item.durVal);
                    item = { ...item, disabled: false, durDate };
                } else {
                    item = { ...item, disabled: false };
                }
                return item;
            });
                        replace(disabledOption);
            //   setTriggerActionError('');
        } else if (maxSelectOption?.length === MAX_SELECTABLE_ACTIONS) {
            const disabledOption = _map(getValues(name), (item) => {
                if (item.checked) {
                    let durDate = '';
                    if (item.durType.value === 'days') durDate = addDaysToDate(scheduleDate, item.durVal);
                    if (item.durType.value === 'hours') durDate = addHoursToDate(scheduleDate, item.durVal);
                    item = { ...item, disabled: false, durDate };
                } else {
                    item = { ...item, disabled: true };
                }
                return item;
            });
            replace(disabledOption);
            // setTriggerActionError('');
        }
        //alert(`triggerActionListConfig[${index}].${ele}`);
        //setFocusEle(``);
    };

    const onChangeCheckBox = ({ event, field, index }) => {
        const optionName = field['name'];
        const moduleRslt = getActionModule({
            canvasData,
            currentWindowId,
            optionName,
        });
        if (moduleRslt) {
            setCurrentOption(field);
            setShowConfirm(true);
        }
        // setValue(`triggerActionListConfig[${index}].checked`, event.target.checked);
        //setValue(`triggerActionListConfig[${index}].durVal`, '');
        update(index, { ...field, checked: event.target.checked, durVal: '' });
        triggerActionValidator({
            name: 'triggerActionListConfig',
            getValues,
            index,
        });
    };
    const handleDeleteConfirm = ({ isConfirm, data }) => {
        setShowConfirm(false);
        if (!isConfirm) {
            // let option = { ...currentOption, id: currentOption.value };
            // let replaceOption = _map(getValues('triggerActionListConfig'), (item) => {
            //     return item.value === currentOption.value ? { ...item, ...option } : item;
            // });
            // console.log('replaceOption', replaceOption);
            replace(currentTriggerAction);
        } else {
            const params = { currentWindowId, mdcCanvas: canvasData, optionName: currentOption.name };
            const { channelDeleteList, MDCTemplate } = channelRemoveByAction(params);
                        if (channelDeleteList?.length) {
                let payload = {
                    campaignId,
                    departmentId,
                    clientId,
                    userId,
                    channels: [...channelDeleteList],
                };
                dispatch(deletMdcChannels({ payload })).then((rslt) => {
                                        //if (rslt.status) {
                    dispatchState({
                        type: 'CHANNEL_DELETE_UPDATE',
                        payload: MDCTemplate,
                    });
                    //}
                });
            }
        }
    };

    const onSubmit = async (data, e) => {
                let formData = { triggerActionListConfig: fields };
        const { currentWindowId, canvasData } = restParam;
        const validRslt = HandleUpdateEdgeLabelDateTimeValidation({
            currentWindowId,
            canvasData,
            fields,
            campaignDetails,
        });
        const checkedActionList = data?.triggerActionListConfig?.filter((actionList) => actionList?.checked);
        const clickActionCheck = (list) => {
            if (primaryGoal.toLowerCase() === 'conversion' && list?.name?.toLowerCase() === 'clicked') {
                return false;
            } else {
                if (!list?.durVal) {
                    return true;
                }
            }
        };
        const isExistEmptyValue = checkedActionList?.some((list) => clickActionCheck(list));
        if (isExistEmptyValue) {
            await setError('dayOrHourErr', { type: `custom`, message: `Waiting time should not be blank.` });
            return;
        }
        // console.log('validRslt', validRslt);
        await formSubmit(formData);
    };
    const onError = (errors, e) => {
                if (errors.dayOrHourErr.type === 'warning') {
            clearErrors('dayOrHourErr');
            onSubmit(getValues(), e);
        }
    };
    return (
        <>
            <form>
                <RSModal
                    size={'lg'}
                    show={isShow}
                    handleClose={onClose}
                    header={
                        <span className="d-flex">
                            {title}s <small className="ml10">{MAX_4_TRIGGERS}</small>
                        </span>
                    }
                    footerClassName="custom_modal_footer_button"
                    bodyClassName="custom_modal_tableTop"
                    body={
                        <>
                            {Object.keys(touchedFields)?.length && errors?.dayOrHourErr?.message ? (
                                <div
                                    className={`note-message-bar d-flex align-items-center ${
                                        errors?.dayOrHourErr?.message?.toLowerCase()?.includes('recommend')
                                            ? 'message-warning'
                                            : ''
                                    }`}
                                >
                                    <i className={`${alert_medium} icon-md white mr5`}></i>
                                    <span className="font-xs">{errors?.dayOrHourErr?.message}</span>
                                </div>
                            ) : null}

                            {fields.map((field, index) => {
                                                                return (
                                    <Row key={field.id}>
                                        <Col md={3}>
                                            <div className="form-group">
                                                <RSCheckbox
                                                    control={control}
                                                    name={`triggerActionListConfig[${index}].checked`}
                                                    labelName={field.label}
                                                    isError={false}
                                                    disabled={field?.disabled}
                                                    handleChange={(event) => onChangeCheckBox({ event, field, index })}
                                                />
                                            </div>
                                        </Col>
                                        <Col
                                            md={9}
                                            className={
                                                !field.checked ||
                                                (primaryGoal === 'Conversion' && field.checked && field.value === 3)
                                                    ? 'hide'
                                                    : ''
                                            }
                                        >
                                            <Row>
                                                <Col md={2} className="">
                                                    <span className="tsh-icon-with-label">
                                                        <i
                                                            className={`icon-md icon-rs-timer-medium mr5 color-primary-blue`}
                                                        ></i>
                                                        <span className="position-absolute">
                                                            {WAIT_FOR}
                                                        </span>
                                                    </span>
                                                </Col>
                                                <Col md={2}>
                                                    <div className="form-group">
                                                        <RSInput
                                                            type={'number'}
                                                            name={`triggerActionListConfig[${index}].durVal`}
                                                            control={control}
                                                            isError={false}
                                                            rules={
                                                                primaryGoal.toLowerCase() === 'conversion'
                                                                    ? DAY_OR_HOUR_FIELD_RULE_CONVERSION({
                                                                          index,
                                                                          fields,
                                                                          setError,
                                                                          clearErrors,
                                                                          errors,
                                                                      })
                                                                    : DAY_OR_HOUR_FIELD_RULE({
                                                                          index,
                                                                          fields,
                                                                          setError,
                                                                          clearErrors,
                                                                          errors,
                                                                      })
                                                            }
                                                            handleOnchange={(event) => {
                                                                setValue('durationValue', event.target.value, {
                                                                    shouldTouch: true,
                                                                });
                                                                update(index, { ...field, durVal: event.target.value });
                                                                triggerActionValidator({
                                                                    name: 'triggerActionListConfig',
                                                                    getValues,
                                                                    index,
                                                                    ele: 'durVal',
                                                                });
                                                            }}
                                                        />
                                                    </div>
                                                </Col>
                                                <Col md={2}>
                                                    <div className="form-group">
                                                        <RSBootstrapDropdown
                                                            data={[
                                                                { dayOrHour: 'Day(s)', value: 'days' },
                                                                { dayOrHour: 'Hour(s)', value: 'hours' },
                                                            ]}
                                                            defaultItem={field.durType}
                                                            showUpdate
                                                            fieldKey="dayOrHour"
                                                            isObject
                                                            alignRight
                                                            isActive
                                                            isError={false}
                                                            rules={
                                                                primaryGoal.toLowerCase() === 'conversion'
                                                                    ? DAY_OR_HOUR_FIELD_RULE_CONVERSION({
                                                                          index,
                                                                          fields,
                                                                          setError,
                                                                          clearErrors,
                                                                          errors,
                                                                      })
                                                                    : DAY_OR_HOUR_FIELD_RULE({
                                                                          index,
                                                                          fields,
                                                                          setError,
                                                                          clearErrors,
                                                                          errors,
                                                                      })
                                                            }
                                                            onSelect={(value) => {
                                                                setValue('duration', value, { shouldTouch: true });
                                                                update(index, { ...field, durType: value });
                                                                triggerActionValidator({
                                                                    name: 'triggerActionListConfig',
                                                                    getValues,
                                                                    index,
                                                                    ele: 'durType',
                                                                });
                                                            }}
                                                        />
                                                    </div>
                                                </Col>
                                                <Col md={4}>
                                                    <div className="form-group">
                                                        <label>
                                                            {isValidDate(new Date(field.durDate)) &&
                                                                `On ${getDDMMMYYYY(field.durDate)}`}
                                                        </label>
                                                    </div>
                                                </Col>
                                                <Col md={2}>
                                                    <div
                                                        className={`form-group float-end ${
                                                            !field.attributeSelect ? 'click-off' : ''
                                                        }`}
                                                    >
                                                        <i className="icon-rs-settings-large icon-md  primary-color cursor-pointer"></i>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                );
                            })}
                        </>
                    }
                    footer={
                        <Fragment>
                            <RSSecondaryButton onClick={onClose}>{CANCEL}</RSSecondaryButton>
                            <RSPrimaryButton
                                className={errors?.dayOrHourErr?.type === 'custom' ? 'click-off' : ''}
                                onClick={handleSubmit(onSubmit, onError)}
                                type="submit"
                            >
                                {OK}
                            </RSPrimaryButton>
                        </Fragment>
                    }
                ></RSModal>
            </form>
            {isShowConfirm && (
                <DeleteChannelFromAction show={isShowConfirm} deleteConfirm={(rslt) => handleDeleteConfirm(rslt)} />
            )}
        </>
    );
};

export default memo(TriggerActionModal);
