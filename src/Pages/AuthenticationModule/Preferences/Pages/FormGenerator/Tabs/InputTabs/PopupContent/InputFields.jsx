import { onlyNumbers } from 'Utils/modules/inputValidators';
import { MAX_LENGTH50, MAX_LENGTH75 } from 'Constants/GlobalConstant/Regex';
import { CUSTOM_ERROR_MESSAGE, FORM_MAX_LENGTH, TYPE, VALIDATION_TYPE } from 'Constants/GlobalConstant/Placeholders';
import RSInput from 'Components/FormFields/RSInput';
import { useEffect } from 'react';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import { useFormContext, useWatch } from 'react-hook-form';

import RSDatePicker from 'Components/FormFields/RSDatePicker';
import RSTimePicker from 'Components/FormFields/RSTimePicker';
import RSDatetimePicker from 'Components/FormFields/RSDatetimePicker';
import { Row, Col } from 'react-bootstrap';
import RSSwitch from 'Components/FormFields/RSSwitch';

function InputFields({ control, elementType, fieldName, inputField, setInputField, isEmail, fieldSettings }) {
    const { getValues, setValue, register } = useFormContext();
        const dtInputType = useWatch({ control, name: fieldName + 'dtInputType' });
    const dtSelection = useWatch({ control, name: fieldName + 'dtSelection' });
    const requiredOTP = useWatch({ control, name: fieldName + 'requiredOTP' });

    // OTP Timer Limit options (in seconds)
    const otpTimerLimitOptions = [
        { value: 30, label: '30 seconds' },
        { value: 60, label: '1 minute' },
        { value: 120, label: '2 minutes' },
        { value: 180, label: '3 minutes' },
        { value: 300, label: '5 minutes' },
        { value: 600, label: '10 minutes' },
    ];

                useEffect(() => {
        if (elementType === 'datetime') {
            try {
                register(fieldName + 'dtInputType');
                const current = getValues(fieldName + 'dtInputType');
                if (!current) {
                    setValue(fieldName + 'dtInputType', 'D', { shouldValidate: false, shouldDirty: false });
                }
            } catch (e) { }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [elementType, fieldName]);
    return (
        <div className="rsfb-settings-input">
            {elementType === 'datetime' && (
                <>
                    <div className="form-group">
                        <RSKendoDropDownList
                            name={fieldName + 'dtSelection'}
                            data={["Date", "Time", "Date and Time"]}
                            control={control}
                            label={TYPE}
                            defaultValue={(() => {
                                const t = getValues(fieldName + 'dtInputType');
                                if (t === 'T') return 'Time';
                                if (t === 'DT') return 'Date and Time';
                                return 'Date';
                            })()}
                            handleChange={(e) => {
                                const label = e?.value;
                                const typeVal = label === 'Time' ? 'T' : label === 'Date and Time' ? 'DT' : 'D';
                                const placeholderText = typeVal === 'DT' ? 'Select the date & time' : typeVal === 'T' ? 'Select the time' : 'Select the date';
                                setValue(fieldName + 'dtInputType', typeVal, { shouldValidate: false, shouldDirty: true });
                                setValue(fieldName + 'placeholder', placeholderText, { shouldValidate: false, shouldDirty: true });
                            }}
                        />

                    </div>
                    <div className="form-group">
                        {dtSelection === 'Date and Time' ? (
                            <RSDatetimePicker
                                control={control}
                                name={`dtPreview`}
                                placeholder={getValues(`${fieldName}placeholder`) || 'Select the date & time'}
                                disabled={true}
                            />
                        ) : dtSelection === 'Time' ? (
                            <RSTimePicker
                                control={control}
                                name={`tPreview`}
                                placeholder={getValues(`${fieldName}placeholder`) || 'Select the time'}
                                disabled={true}
                            />
                        ) : (
                            <RSDatePicker
                                control={control}
                                name={`dPreview`}
                                placeholder={getValues(`${fieldName}placeholder`) || 'Select the date'}
                                disabled={true}
                            />
                        )}
                    </div>
                </>
            )}
            <div className={`form-group ${elementType === 'hiddenfield' ? 'mb0' : ''}`}>
                <RSInput
                    control={control}
                    handleOnBlur={(e) => setInputField(e.target.value)}
                    name={fieldName + 'placeholder'}
                    //defaultValue={getValues(`${fieldName}placeholder`)}
                    placeholder={'Placeholder text'}
                    maxLength={MAX_LENGTH50}
                />
            </div>

            {elementType === 'textbox' && (
                <>
                    <div className="form-group">
                        <RSInput
                            control={control}
                            //handleOnBlur={(e) => setInputField(e.target.value)}
                            name={fieldName + 'maxLength'}
                            defaultValue={'50'}
                            placeholder={FORM_MAX_LENGTH}
                            maxLength={3}
                            onKeyDown={onlyNumbers}
                            rules={{
                                validate: (value) => {
                                    if (!/^\d+$/.test(value) && value !== '') {
                                        return 'Only numbers are allowed';
                                    } else if (parseInt(value, 10) === 0) {
                                        return 'Enter a value greater than 0';
                                    }
                                    return true;
                                },
                            }}
                        />
                    </div>

                    <div className="form-group">
                        <RSKendoDropDownList
                            name={fieldName + 'validationType'}
                            data={['Text only', 'Number only', 'Alphanumeric']}
                            control={control}
                            label={VALIDATION_TYPE}
                        />
                    </div>
                    <div className={`form-group ${(isEmail || elementType === 'mobileNumber' || elementType === 'phone') ? '' : 'mb0'}`} >
                        <RSInput
                            control={control}
                            //handleOnBlur={(e) => setInputField(e.target.value)}
                            name={fieldName + 'customErrorMessage'}
                            //defaultValue={inputField}
                            placeholder={CUSTOM_ERROR_MESSAGE}
                            maxLength={MAX_LENGTH75}
                        />
                    </div>
                </>
            )}
            {elementType === 'datetime' && (
                <>
                    <div className="form-group mb0">
                        <RSInput
                            control={control}
                            name={fieldName + 'customErrorMessage'}
                            placeholder={CUSTOM_ERROR_MESSAGE}
                            maxLength={MAX_LENGTH75}
                        />
                    </div>
                </>
            )}
            {(isEmail || elementType === 'mobileNumber' || elementType === 'phone') && (
                <>
                    <div className="form-group mb0">
                        <Row>
                            <Col sm={4}>
                                <label className="control-label-left">Required OTP</label>
                            </Col>
                            <Col sm={2}>
                                <RSSwitch
                                    control={control}
                                    name={fieldName + 'requiredOTP'}
                                    labelName=""
                                    defaultValue={fieldSettings?.requiredOTP}
                                />
                            </Col>
                            {requiredOTP && <Col sm={6}>
                                <RSKendoDropDownList
                                    name={fieldName + 'expiryTime'}
                                    data={otpTimerLimitOptions}
                                    textField="label"
                                    dataItemKey="value"
                                    control={control}
                                    label="OTP timer limit"
                                    defaultValue={fieldSettings?.expiryTime ? otpTimerLimitOptions.find(opt => opt.value === fieldSettings.expiryTime) : otpTimerLimitOptions[1]}
                                />
                            </Col>
                            }
                        </Row>
                    </div>
                    
                </>
            )}
        </div>
    );
}

export default InputFields;
