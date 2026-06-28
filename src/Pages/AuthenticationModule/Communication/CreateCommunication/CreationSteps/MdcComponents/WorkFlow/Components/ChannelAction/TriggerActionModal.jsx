import { addHoursToDate } from 'Utils/modules/dateTime';
import { addDaysToDate, getUserCurrentFormat } from 'Utils/modules/dateTime';
import { isValidDate } from 'Utils/modules/uiToast';
import { ATTRIBUTE_CONDITION_CONFIGURED, ATTRIBUTES, CANCEL, MAX_4_TRIGGERS, MDC_SETTINGS_POPHOVER_TEXT, OK, WAIT_FOR } from 'Constants/GlobalConstant/Placeholders';
import { alert_medium, circle_question_mark_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, memo, useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { Row, Col } from 'react-bootstrap';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import RSInput from 'Components/FormFields/RSInput';
import RSBootstrapDropdown from 'Components/FormFields/RSBootstrapdown';
import RSModal from 'Components/RSModal';
import { RSSecondaryButton, RSPrimaryButton } from 'Components/Buttons';
import AttributeRemoveModal from './AttributeRemoveModal';
import { addOrRemoveAttr } from 'Reducers/communication/createCommunication/Mdc/Canvas/request';
import _find from 'lodash/find';
import _map from 'lodash/map';
import _filter from 'lodash/filter';
import _get from 'lodash/get';
import { encodeUrl } from 'Utils/modules/crypto';
import { onlyNumbersDecimalWithoutSpecialCharacters } from 'Utils/modules/inputValidators';

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
import { getModule } from '../../constant';

import RSSwitch from 'Components/FormFields/RSSwitch';
import RSPPophover from 'Components/RSPPophover';

const MAX_SELECTABLE_ACTIONS = 4;

const TriggerActionModal = ({
    title,
    show,
    onClose,
    currentTriggerAction,
    scheduleDate,
    formSubmit,
    dispatchState,
    currentChannelDetailData,
    currentDateByTimeZone,
    ...restParam
}) => {
    const campaignDetails = useQueryParams('/communication');
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const { savedChannelStatusId } = useSelector(({ communicationPlanReducer }) => communicationPlanReducer);
    //  const [triggerActionError, setTriggerActionError] = useState('Select atleaset one option');
    const [isShowConfirm, setShowConfirm] = useState(false);
    const [isShow, setShow] = useState(false);
    const [currentOption, setCurrentOption] = useState({});
    const [campaignId, setCampaignId] = useState(0);
    const [campaignName, setCampaignName] = useState(0);
    const [primaryGoal, setPrimaryGoal] = useState('R');
    const [campaignEndDate, setCampaignEndDate] = useState('');
    const [isConfirmPopupShow, setConfirmPopupShow] = useState(false);
    const [attributeRemove, setAttributeRemove] = useState(false);

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
        trigger,
    } = methods;

    const { fields, insert, replace, update } = useFieldArray({
        control,
        name: 'triggerActionListConfig',
    });
    // console.log('currentChannelDetailData: ', currentChannelDetailData);
    const currentModule = getModule(canvasData['Campaign']['CanvasChannel']['activeChannel'], currentWindowId);
    // console.log('currentWindowId: ', currentWindowId);
    // console.log('currentModule: ', currentModule);
    const currentActiveChannel = currentModule?.value?.activeChannel;
    const childActiveChannelDetail = currentActiveChannel?.map((childActive) => {
        return {
            ChannelDetailID: childActive.ChannelDetailID,
            actionOption: childActive.actionOption,
        };
    });
    // console.log('childActiveChannelDetail: ', childActiveChannelDetail);
    // console.log('savedChannelStatusId: ', savedChannelStatusId);
    const finalChannelStatusDetail = childActiveChannelDetail?.map((childActive) => {
        const currentChannelStatusDetail = savedChannelStatusId?.find(
            (saved) => saved.channelDetailId === childActive?.ChannelDetailID,
        );
        const status = currentChannelStatusDetail?.statusId === 5 || currentChannelStatusDetail?.statusId === 9;
        return {
            name: childActive?.actionOption?.name,
            status: status,
        };
    });

    const campaignIdFromQuery = _get(campaignDetails, 'campaignId', 0);
    const campaignNameFromQuery = _get(campaignDetails, 'campaignName', '');
    const primaryGoalFromQuery = _get(campaignDetails, 'primaryGoal', 'R');
    const endDateFromQuery = _get(campaignDetails, 'endDate', '');

    useEffect(() => {
        setShow(show);
    }, [show]);
    useEffect(() => {
        setCampaignId((prev) => (prev === campaignIdFromQuery ? prev : campaignIdFromQuery));
        setCampaignName((prev) => (prev === campaignNameFromQuery ? prev : campaignNameFromQuery));
        setPrimaryGoal((prev) => (prev === primaryGoalFromQuery ? prev : primaryGoalFromQuery));
        setCampaignEndDate((prev) => (prev === endDateFromQuery ? prev : endDateFromQuery));
    }, [campaignIdFromQuery, campaignNameFromQuery, primaryGoalFromQuery, endDateFromQuery]);
    useEffect(() => {
        const subscription = watch((value, { name, type }) => {
            if (name) {
                setFocus(name);
            }
        });
        return () => subscription.unsubscribe();
    }, [setFocus, watch]);

    useEffect(() => {
        const {
            dataSource: { Type, ListType },
        } = canvasData;
        const moduleRslt = getModule(canvasData['Campaign']['CanvasChannel']['activeChannel'], currentWindowId);
        let activeChannel = _get(moduleRslt, 'value.activeChannel', []);
        if (activeChannel?.length) {
            let newField = fields.map((item) => {
                let findOption = _find(activeChannel, ['actionOption.value', item['value']]);
                return Type === 'DynamicList' && findOption
                    ? { ...item, childExist: true }
                    : Type === 'Recipient' && ListType.includes(5) && findOption
                    ? { ...item, childExist: true }
                    : { ...item, childExist: false };
            });
            replace(newField);
        }
    }, []);

    const handleTriggerAction = () => {
        let index = 0;
        !isConfirmPopupShow &&
            triggerActionValidator({
                name: 'triggerActionListConfig',
                getValues,
                index,
            });
    };

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
            if (
                selectedOption?.length > 0 &&
                selectedOption?.length <= MAX_SELECTABLE_ACTIONS &&
                maxSelectOption?.length <= MAX_SELECTABLE_ACTIONS
            ) {
                const disabledOption = _map(getValues(name), (item) => {
                                        if (item.checked && item.value !== 3) {
                        let durDate = '';
                        if (item.durType.value === 'days') durDate = addDaysToDate(scheduleDate, item.durVal);
                        if (item.durType.value === 'hours') durDate = addHoursToDate(scheduleDate, item.durVal);
                        item = { ...item, disabled: false, durDate };
                    } else {
                        item =
                            selectedOption?.length < MAX_SELECTABLE_ACTIONS
                                ? { ...item, disabled: item.value !== 3 ? false : true }
                                : { ...item, disabled: true };
                    }
                                        return item;
                });
                                replace(disabledOption);
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
    //   if(primaryGoal.toLowerCase() !== 'conversion') 
    //        if (
    //         currentModule?.value?.LevelNumber >= 302 &&
    //         currentModule?.value?.LevelNumber < 307 
    //     ) {
    //         const disabledOption = _map(getValues(name), (item) => {
    //             console.log(item);
    //             if (item.checked && item.value === 3) {
    //                 return { ...item, disabled: true };
    //             }
    //             return item;
    //         });
    //         replace(disabledOption);
    //     }
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

        let tempPlaceholder = canvasData?.['Campaign']?.['CanvasChannel']?.['Placeholder'];
        if (tempPlaceholder && tempPlaceholder?.length && !event.target.checked) {
            let unMatchPlaceholder = [];
            let matchPlaceholder = [];
            tempPlaceholder.forEach((item) => {
                if (item?.data?.parentWindowId === currentWindowId && item?.data?.actionOption?.name === optionName) {
                    matchPlaceholder = [...matchPlaceholder, item];
                } else {
                    unMatchPlaceholder = [...unMatchPlaceholder, item];
                }
            });
                        canvasData['Campaign']['CanvasChannel']['Placeholder'] = unMatchPlaceholder;
            dispatchState({
                type: 'CHANNEL_DELETE_UPDATE',
                payload: canvasData,
            });
        }
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
            primaryGoal.toLowerCase() === 'conversion' && handleTriggerAction();
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
            } else {
                dispatchState({
                    type: 'CHANNEL_DELETE_UPDATE',
                    payload: MDCTemplate,
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
    const handleDynamicListRedirect = (field) => {
        const moduleRslt = getModule(canvasData['Campaign']['CanvasChannel']['activeChannel'], currentWindowId);
        
        const channelDetailId = _get(moduleRslt, 'value.ChannelDetailID', 0);
        const channelDetailType = _get(moduleRslt, 'value.ChannelDetailType', '');
        const levelNumber = _get(moduleRslt, 'value.LevelNumber', '');
        const channelId = _get(moduleRslt, 'value.ChannelId', '');
        const nodeId = _get(moduleRslt, 'value.DomId', '');

        let activeChannel = _get(moduleRslt, 'value.activeChannel', []);
        let findOption = _find(activeChannel, ['actionOption.name', field['name']]);
         // add if condition to check dur value added or not
        const paramData = {
            fromCampaign: 'M',
            campaignId,
            campaignName,
            levelNumber: parseInt(levelNumber, 10),
            parentChannelDetailId: channelDetailId,
            parentChannelDetailType: channelDetailType,
            actionId: field['value'],
            channelId,
            nodeId,
            campaignDetails,
            dynamicListId: _get(findOption, 'DynamicListId', 0),
        };
        sessionStorage.setItem('attributeSetupDetails', JSON.stringify(paramData));
                const encryptState = encodeUrl(paramData);
        const dynamicListUrl = `/audience/create-dynamic-list`;

        navigate(`${dynamicListUrl}?q=${encryptState}`);
    };

    const handleRemoveAttributeSetup = () => {
        setConfirmPopupShow(false);
                const moduleRslt = getModule(canvasData['Campaign']['CanvasChannel']['activeChannel'], currentWindowId);
                let activeChannel = _get(moduleRslt, 'value.activeChannel', []);
        let findOption = _find(activeChannel, ['actionOption.value', attributeRemove['value']]);
        
        if (findOption && moduleRslt?.value) {
            const {
                ChannelDetailID: channelDetailId,
                ChannelDetailType: channelDetailType,
                DynamicListId: dynamicListId,
                ChannelId: channelId,
                DomId,
            } = findOption;
            if (channelDetailId) {
                let payload = {
                    campaignId,
                    channels: [
                        {
                            channelDetailId,
                            channelDetailType,
                            dynamicListId,
                            dlattraction: 'remove',
                        },
                    ],
                };
                                dispatch(addOrRemoveAttr({ payload }));
            }
            dispatchState({
                type: 'REMOVE_ATTR_SETUP_DATA',
                payload: { DomId, channelId, dynamicListId, actionId: attributeRemove['value'] },
            });
            let index = fields.findIndex((x) => x.value === attributeRemove['value']);
            update(index, { ...attributeRemove, attribute: false, attributeSelect: false });
        }
    };

    useEffect(() => {
         handleTriggerAction();
    }, [primaryGoal]);

    return (
        <>
            <form>
                <RSModal
                    size={'lg'}
                    show={isShow}
                    handleClose={onClose}
                    header={
                        <span className="d-flex align-items-baseline">
                            {title}s <small className="ml10">{MAX_4_TRIGGERS}</small>
                        </span>
                    }
                    className="rsMDCActionPopupCSS"
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
                                                                const findField = finalChannelStatusDetail?.find(
                                    (channel) => channel.name === field.name,
                                );
                                const isClickOff = findField?.status ?? false;
                                return (
                                    <div
                                        key={field.id ?? field.value ?? `${field.name}-${index}`}
                                        className={`${isClickOff ? 'click-off' : ''}`}
                                    >
                                        <Row
                                            className={
                                                !field.checked ||
                                                (primaryGoal === 'Conversion' && field.checked && field.value === 3)
                                                    ? 'rsMDCActionListCSS'
                                                    : 'rsMDCActionListCSS active'
                                            }
                                        >
                                            <Col md={3}>
                                                <RSCheckbox
                                                    control={control}
                                                    name={`triggerActionListConfig[${index}].checked`}
                                                    labelName={field.label}
                                                    isError={false}
                                                    disabled={field?.disabled}
                                                    handleChange={(event) => onChangeCheckBox({ event, field, index })}
                                                />
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
                                                    <Col md={2} className="width110 pr0">
                                                        <span className="tsh-icon-with-label">
                                                            <i
                                                                className={`icon-md icon-rs-timer-medium mr5 color-primary-blue`}
                                                            ></i>
                                                            <span className="position-absolute">
                                                                {WAIT_FOR}
                                                            </span>
                                                        </span>
                                                    </Col>
                                                    <Col md={2} className="pr0">
                                                        <RSInput
                                                            type={'number'}
                                                            className={'text-center pr0 pl3'}
                                                            name={`triggerActionListConfig[${index}].durVal`}
                                                            control={control}
                                                            isError={false}
                                                            maxLength={3}
                                                            rules={
                                                                primaryGoal.toLowerCase() === 'conversion'
                                                                    ? DAY_OR_HOUR_FIELD_RULE_CONVERSION({
                                                                          index,
                                                                          fields,
                                                                          setError,
                                                                          clearErrors,
                                                                          errors,
                                                                          campaignEndDate,
                                                                          currentWindowId,
                                                                          canvasData,
                                                                          currentDateByTimeZone,
                                                                      })
                                                                    : DAY_OR_HOUR_FIELD_RULE({
                                                                          index,
                                                                          fields,
                                                                          setError,
                                                                          clearErrors,
                                                                          errors,
                                                                          campaignEndDate,
                                                                          currentWindowId,
                                                                          canvasData,
                                                                          currentDateByTimeZone,
                                                                      })
                                                            }
                                                            handleOnchange={(event) => {
                                                                setValue('durationValue', event.target.value, {
                                                                    shouldTouch: true,
                                                                });
                                                                update(index, {
                                                                    ...field,
                                                                    durVal: event.target.value,
                                                                });
                                                                triggerActionValidator({
                                                                    name: 'triggerActionListConfig',
                                                                    getValues,
                                                                    index,
                                                                    ele: 'durVal',
                                                                });
                                                            }}
                                                            onKeyDown={(e) =>
                                                                onlyNumbersDecimalWithoutSpecialCharacters(e)
                                                            }
                                                            onKeyUp={(e) => {
                                                                                                                                if (e.target.value > 200) {
                                                                    setValue(
                                                                        `triggerActionListConfig[${index}].durVal`,
                                                                        '',
                                                                    );
                                                                    trigger(`triggerActionListConfig[${index}].durVal`);
                                                                }
                                                            }}
                                                        />
                                                    </Col>
                                                    <Col md={2} className="pr0">
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
                                                                          campaignEndDate,
                                                                          currentWindowId,
                                                                          canvasData,
                                                                      })
                                                                    : DAY_OR_HOUR_FIELD_RULE({
                                                                          index,
                                                                          fields,
                                                                          setError,
                                                                          clearErrors,
                                                                          errors,
                                                                          campaignEndDate,
                                                                          currentWindowId,
                                                                          canvasData,
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
                                                    </Col>
                                                    <Col md={4} className="pr0">
                                                        <label>
                                                            {isValidDate(new Date(field.durDate)) &&
                                                                // `On ${getMMMDDYYYY(field.durDate)}`}
                                                                `On ${getUserCurrentFormat(field.durDate)?.dateFormat}`}
                                                        </label>
                                                    </Col>
                                                    <Col md={1} className="pr0 d-flex pl0">
                                                        <div
                                                            className={`float-end pr15  ${
                                                                field.attribute || !field.childExist ? 'click-off' : ''
                                                            }`}
                                                        >
                                                            <RSPPophover
                                                                pophover={MDC_SETTINGS_POPHOVER_TEXT}
                                                            >
                                                                <i
                                                                    className={`${circle_question_mark_medium} icon-md color-primary-blue`}
                                                                    id="circle_question_mark"
                                                                ></i>
                                                            </RSPPophover>
                                                        </div>
                                                        <div
                                                            className={`float-end ${
                                                                field.attribute || !field.childExist ? 'click-off' : ''
                                                            }`}
                                                        >
                                                            <i
                                                                className="icon-rs-settings-large icon-md  primary-color cursor-pointer"
                                                                onClick={() => handleDynamicListRedirect(field)}
                                                            ></i>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                        {field.attributeSelect && (
                                            <Row className="rsMDCActionListCSS active">
                                                <div id="mdcAttrAndLabel">
                                                    <p className="label">
                                                        <RSSwitch
                                                            control={control}
                                                            name={`triggerActionListConfig[${index}].attributeSwitch`}
                                                            onLabel={'And'}
                                                            offLabel={'Or'}
                                                            className={'pe-none'}
                                                            disabled={true}
                                                        />
                                                    </p>
                                                </div>
                                                <Col md={3}>
                                                    <RSCheckbox
                                                        control={control}
                                                        name={`triggerActionListConfig[${index}].attribute`}
                                                        labelName={ATTRIBUTES}
                                                        isError={false}
                                                        handleChange={(event) => {
                                                            setConfirmPopupShow(!event.target.checked);
                                                            setAttributeRemove(field);
                                                        }}
                                                    />
                                                </Col>
                                                <Col md={9} className="">
                                                    <span className="tsh-icon-with-label">
                                                        <i
                                                            className={`icon-md icon-rs-pencil-edit-medium mr5 color-primary-blue`}
                                                            onClick={() => handleDynamicListRedirect(field)}
                                                        ></i>
                                                        <span className="position-absolute color-green-dark">
                                                            {ATTRIBUTE_CONDITION_CONFIGURED}
                                                        </span>
                                                    </span>
                                                </Col>
                                            </Row>
                                        )}
                                    </div>
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
            {isConfirmPopupShow && (
                <AttributeRemoveModal
                    isShow={isConfirmPopupShow}
                    handleClose={() => {
                        setConfirmPopupShow(false);
                        const findIndex = fields?.findIndex((field) => field.id === attributeRemove?.id);
                        setValue(`triggerActionListConfig[${findIndex}].attribute`, true);
                    }}
                    handleOk={() => {
                        handleRemoveAttributeSetup();
                    }}
                />
            )}
        </>
    );
};

export default memo(TriggerActionModal);
