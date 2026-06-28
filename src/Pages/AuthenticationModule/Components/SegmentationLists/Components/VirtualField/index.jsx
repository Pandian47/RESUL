import { onlyNumbers } from 'Utils/modules/inputValidators';
import { ENTER_GREATEST_VALUE, ENTER_VALID_NUMBER } from 'Constants/GlobalConstant/ValidationMessage';
import { CANCEL, ENTER_NUMBER, SAVE } from 'Constants/GlobalConstant/Placeholders';
import { date_time_medium, timer_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useRef, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { useFormContext, useWatch } from 'react-hook-form';

import { SELECT_START_DATE , SELECT_END_DATE} from 'Constants/GlobalConstant/ValidationMessage';
import RSDatePicker from 'Components/FormFields/RSDatePicker';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';

import RSInput from 'Components/FormFields/RSInput';

const VirtualField = ({ name, index, fieldName }) => {
    const {
        control,
        trigger,
        resetField,
        setValue,
        getValues,
        clearErrors,
        formState: { touchedFields },
    } = useFormContext();

    const virtualStart = 'virtualStart';
    const virtualEnd = 'virtualEnd';
    const virtualInput = 'virtualInput';
    const virtualStartDateFieldName = `${fieldName}.${index}.${virtualStart}`;
    const virtualEndDateFieldName = `${fieldName}.${index}.${virtualEnd}`;
    const virtualInputFieldName = `${fieldName}.${index}.${virtualInput}`;
    const virtualSaveFieldName = `${fieldName}.${index}.${'isVirtualSave'}`;
    const virtualDateType = 'virtualDate';
    const virtualInputType = 'virtualInput';
    const [isFieldChange, setIsFieldChange] = useState({});

    const fieldWatcher = useWatch({ control, name: `${fieldName}.${index}` });
    const attributesCount = useWatch({
        control,
        name: `${['attributeslistCount']}.${fieldName}`,
    });
    // console.log('fieldWatcher: ', fieldWatcher);

    const [show, setShow] = useState(false);
    const [onChangeCurrentFieldValue, setOnChangeCurrentFieldValue] = useState({
        date: {
            start: fieldWatcher.virtualStart || getValues(virtualStartDateFieldName),
            end: fieldWatcher.virtualEnd || getValues(virtualEndDateFieldName),
        },
        input: {
            value: fieldWatcher.virtualInput || getValues(virtualInputFieldName),
        },
    });
    const target = useRef(null);

    // console.log('onChangeCurrentFieldValue: ', onChangeCurrentFieldValue);

    const handleSave = () => {
        if ((fieldWatcher.virtualStart && fieldWatcher.virtualEnd) || fieldWatcher.virtualInput) {
            setShow(false);
            if (fieldWatcher?.virtualType === virtualDateType && fieldWatcher.virtualStart && fieldWatcher.virtualEnd) {
                handleSetValue(virtualSaveFieldName, true);
            } else if (fieldWatcher?.virtualType === virtualInputType) {
                handleSetValue(virtualSaveFieldName, true);
            }
            let tempattributesCount = [...attributesCount];
            tempattributesCount = tempattributesCount?.map((count, countIndex) => {
                if (index <= countIndex) {
                    setValue(`${fieldName}[${countIndex}].isStatus`, false);
                    return [];
                } else {
                    return count;
                }
            });
            setValue(`${fieldName}.${index}.isStatus`, false);
            setValue(`${fieldName}.${index}.isLoading`, false);
            setIsFieldChange((pre) => ({
                ...pre,
                [`${fieldName}.${index}.isFieldChange`]: false,
            }));
            setValue(`${['attributeslistCount']}.${fieldName}`, tempattributesCount);
        } else {
            if (fieldWatcher?.virtualType === virtualDateType) {
                trigger([virtualStartDateFieldName, virtualEndDateFieldName]);
            } else {
                trigger(virtualInputFieldName);
            }
        }
    };

    const handleSetValue = (fieldName, value) => {
        setValue(fieldName, value);
    };

    const handleCacel = () => {
        if (fieldWatcher?.virtualType === virtualDateType) {
            if (
                onChangeCurrentFieldValue?.date?.start &&
                onChangeCurrentFieldValue?.date?.end &&
                fieldWatcher?.isVirtualSave
            ) {
                handleSetValue(virtualStartDateFieldName, onChangeCurrentFieldValue?.date?.start);
                handleSetValue(virtualEndDateFieldName, onChangeCurrentFieldValue?.date?.end);
                handleSetValue(virtualSaveFieldName, true);
            } else {
                handleSetValue(virtualStartDateFieldName, '');
                handleSetValue(virtualEndDateFieldName, '');
                handleSetValue(virtualSaveFieldName, false);
            }
        } else if (fieldWatcher?.virtualType === virtualInput) {
            if (onChangeCurrentFieldValue?.input?.value && fieldWatcher?.isVirtualSave) {
                handleSetValue(virtualSaveFieldName, true);
                handleSetValue(virtualInputFieldName, onChangeCurrentFieldValue?.input?.value);
            } else {
                handleSetValue(virtualInputFieldName, '');
                handleSetValue(virtualSaveFieldName, false);
            }
        }
        setShow(false);
        clearErrors();
        setIsFieldChange((pre) => ({
            ...pre,
            [`${fieldName}.${index}.isFieldChange`]: false,
        }));
    };

    const handleOnChangeValue = (value, type, field) => {
        setOnChangeCurrentFieldValue((pre) => ({
            ...pre,
            [type]: {
                ...pre[type],
                [field]: value,
            },
        }));
    };

    const handleRenderField = () => {
        switch (fieldWatcher?.virtualType) {
            case virtualDateType:
                return (
                    <Row>
                        <Col sm={5}>
                            <RSDatePicker
                                control={control}
                                name={virtualStartDateFieldName}
                                rules={{
                                    required: SELECT_START_DATE,
                                    ...(fieldWatcher?.sOLRFieldName === 'Campaign_summary_s'
                                        ? {
                                            validate: (dateValue) =>
                                                new Date(dateValue).getTime() >
                                                    new Date().getTime()
                                                    ? 'Future date is not allowed'
                                                    : true,
                                        }
                                        : {}),
                                }}
                                placeholder={'Start date'}
                                required
                                handleChange={(e) => {
                                    setIsFieldChange((pre) => ({
                                        ...pre,
                                        [`${fieldName}.${index}.isFieldChange`]: true,
                                    }));
                                    const value = e.target.value;
                                    // handleOnChangeValue(value, 'date', 'start');
                                }}
                                {...(fieldWatcher?.sOLRFieldName === 'Campaign_summary_s'
                                    ? { max: new Date() }
                                    : {})}
                            />
                        </Col>
                        <Col sm={2}>
                            <p className="text-center">To</p>
                        </Col>
                        <Col sm={5}>
                            <RSDatePicker
                                control={control}
                                name={virtualEndDateFieldName}
                                placeholder={'End date'}
                                rules={{
                                    required: SELECT_END_DATE,
                                    validate: (dateValueOne) => {
                                        const valueTime = new Date(dateValueOne).getTime();
                                        if (valueTime < new Date(fieldWatcher.virtualStart).getTime()) {
                                            return ENTER_GREATEST_VALUE;
                                        }
                                        if (
                                            fieldWatcher?.sOLRFieldName === 'Campaign_summary_s' &&
                                            valueTime > new Date().getTime()
                                        ) {
                                            return 'Future date is not allowed';
                                        }
                                        return true;
                                    },
                                }}
                                handleChange={(e) => {
                                    const value = e.target.value;
                                    setIsFieldChange((pre) => ({
                                        ...pre,
                                        [`${fieldName}.${index}.isFieldChange`]: true,
                                    }));
                                    // handleOnChangeValue(value, 'date', 'end');
                                }}
                                required
                                {...(fieldWatcher?.sOLRFieldName === 'Campaign_summary_s'
                                    ? { max: new Date() }
                                    : {})}
                            />
                        </Col>
                    </Row>
                );
            case virtualInputType:
                return (
                    <RSInput
                        control={control}
                        name={virtualInputFieldName}
                        id="rs_RenderInputs_virutalvalue"
                        onKeyDown={onlyNumbers}
                        required
                        rules={{
                            required: ENTER_VALID_NUMBER,
                        }}
                        isNumber
                        placeholder={ENTER_NUMBER}
                        handleOnBlur={(e) => {
                            const value = e.target.value;
                            // handleOnChangeValue(value, 'date', 'start');
                        }}
                        handleOnchange={(e) => {
                            const value = e.target.value;
                            if (value && value.toString().length > 3) {
                                e.target.value = value.toString().slice(0, 3);
                            }
                            setIsFieldChange((pre) => ({
                                ...pre,
                                [`${fieldName}.${index}.isFieldChange`]: true,
                            }));
                        }}
                        type="number"
                    // maxLength={3}
                    />
                );
            default:
                return null;
        }
    };

    useEffect(() => {
        const startDateValue = fieldWatcher.virtualStart || getValues(virtualStartDateFieldName);
        const endDateValue = fieldWatcher.virtualEnd || getValues(virtualEndDateFieldName);
        const inputValue = fieldWatcher.virtualInput || getValues(virtualInputFieldName);
        // console.log('startDateValue: ', startDateValue);

        if (fieldWatcher?.virtualType === virtualDateType) {
            handleOnChangeValue(startDateValue, 'date', 'start');
            handleOnChangeValue(endDateValue, 'date', 'end');
        } else if (fieldWatcher?.virtualType === virtualInputType) {
            handleOnChangeValue(inputValue, 'input', 'value');
        }
    }, [show]);

    return (
        <>
            {fieldWatcher?.virtualType !== virtualInputType ? (
                <i
                    onClick={() => setShow(!show)}
                    ref={target}
                    className={`${date_time_medium} icon-md color-primary-blue float-start mt6 `}
                />
            ) : (
                <i
                    onClick={() => setShow(!show)}
                    ref={target}
                    className={`${timer_medium} icon-md color-primary-blue float-start mt6 `}
                />
            )}
            {/* <Overlay show={show} target={target.current} placement="top"> */}
            {show && (
                <Card className="spend_wrapper border border-r10 zIndex100">
                    <Card.Header className="color-primary-blue fs23 p15 lh28">{name}</Card.Header>
                    <Card.Body
                        className={`d-flex justify-content-between p30 ${fieldWatcher?.virtualType === virtualInputType ? 'col-sm-5' : ''
                            }`}
                    >
                        {handleRenderField()}
                    </Card.Body>
                    <Card.Footer className="border-0 buttons-holder card-footer px30 pb30 pt0 mt0">
                        <RSSecondaryButton onClick={handleCacel}>{CANCEL}</RSSecondaryButton>
                        <RSPrimaryButton
                            onClick={handleSave}
                            className={!isFieldChange[`${fieldName}.${index}.isFieldChange`] ? 'click-off pe-none' : ''}
                            type="submit"
                        >
                            {SAVE}
                        </RSPrimaryButton>
                    </Card.Footer>
                </Card>
            )}
            {/* </Overlay> */}
        </>
    );
};

export default VirtualField;
