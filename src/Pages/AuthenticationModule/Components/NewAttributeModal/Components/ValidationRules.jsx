import { onlyNumbers } from 'Utils/modules/inputValidators';
import { ENTER_GREATEST_VALUE, ENTER_LESSER_VALUE, SELECT_CURRENCY_FORMAT } from 'Constants/GlobalConstant/ValidationMessage';
import { END_DATE, START_DATE } from 'Constants/GlobalConstant/Placeholders';
import { useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import RSInput from 'Components/FormFields/RSInput';
import RSRadioButton from 'Components/FormFields/RSRadioButton';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import RSDatePicker from 'Components/FormFields/RSDatePicker';
import {
    SPECIAL_CHARACTERS_OPTIONS,
    LENGTH_TYPE_OPTIONS,
    TEXT_VALIDATION_TYPE_OPTIONS,
    CURRENCY_FORMAT_OPTIONS,
    SPECIAL_CHARACTERS_VALIDATION,
    FIXED_LENGTH_VALIDATION,
    MIN_LENGTH_VALIDATION,
    MAX_LENGTH_VALIDATION,
    TEXT_VALIDATION_RULES,
    DECIMAL_VALIDATION_RULES,
    DATE_VALIDATION_RULES,
    INTEGER_VALIDATION_RULES,
    SPECIAL_CHARACTERS_LABEL,
    LENGTH_OF_STRING_LABEL,
    LENGTH_LABEL,
    ALLOWED_SPECIAL_CHARACTERS,
    MIN_LENGTH_PLACEHOLDER,
    MAX_LENGTH_PLACEHOLDER,
    FIXED_LENGTH_PLACEHOLDER,
    ALLOW_NEGATIVE_VALUES,
    CURRENCY_FORMAT_LABEL,
    ENTER_VALUE,
} from '../constant';


const ValidationRules = ({ inputType, validationrequired, isUpdate, textDataLength, StringDataLength }) => {
    const { control, watch, trigger, getValues } = useFormContext();
    const [startdate, enddate] = watch(['startdate', 'enddate']);

    useEffect(() => {
        if (validationrequired && inputType?.fieldType === 'Date') {
            if (startdate || enddate) {
                trigger(['startdate', 'enddate']);
            }
        }
    }, [startdate, enddate, validationrequired, inputType, trigger]);

    if (!validationrequired || !inputType) {
        return null;
    }

    return (
        <div className="rs-box-repeat rsbr-block no-box-shadow form-group">
            {inputType?.fieldType === 'Text' && (
                <>
                    <Row className="align-items-center">
                        <Col sm={12}>
                            <h4>{TEXT_VALIDATION_RULES}</h4>
                        </Col>
                    </Row>
                    <Row className="form-group">
                        <Col sm={3}>{SPECIAL_CHARACTERS_LABEL}</Col>
                        <Col sm={4} className="d-flex pl0">
                            {SPECIAL_CHARACTERS_OPTIONS.map((option) => (
                                <div key={option}>
                                    <RSRadioButton
                                        control={control}
                                        name={'textDataLength'}
                                        labelName={option}
                                        rules={validationrequired ? { required: ENTER_VALUE } : {}}
                                        radio_wrapper_class='mt0'
                                    />
                                </div>
                            ))}
                        </Col>
                        {textDataLength === 'Allow' && (
                            <Col sm={5}>
                                <RSInput
                                    type={'text'}
                                    name={'specialCharacters'}
                                    control={control}
                                    required={validationrequired && textDataLength === 'Allow'}
                                    placeholder={ALLOWED_SPECIAL_CHARACTERS}
                                    rules={
                                        validationrequired && textDataLength === 'Allow'
                                            ? SPECIAL_CHARACTERS_VALIDATION
                                            : {}
                                    }
                                    maxLength={25}
                                />
                            </Col>
                        )}
                    </Row>
                    <Row className="form-group">
                        <Col sm={3}>{LENGTH_OF_STRING_LABEL}</Col>
                        <Col sm={4} className="d-flex pl0">
                            {LENGTH_TYPE_OPTIONS.map((option) => (
                                <div key={option}>
                                    <RSRadioButton
                                        control={control}
                                        name={'StringDataLength'}
                                        labelName={option}
                                        rules={validationrequired ? { required: ENTER_VALUE } : {}}
                                        radio_wrapper_class='mt0'
                                    />
                                </div>
                            ))}
                        </Col>
                        {StringDataLength === 'Length' && (
                            <Col sm={5}>
                                <Row>
                                    <Col sm={6}>
                                        <RSInput
                                            name={'textminlength'}
                                            control={control}
                                            required={validationrequired && StringDataLength === 'Length'}
                                            placeholder={MIN_LENGTH_PLACEHOLDER}
                                            rules={
                                                validationrequired && StringDataLength === 'Length'
                                                    ? {
                                                        ...MIN_LENGTH_VALIDATION,
                                                        validate: (value) => {
                                                            const minValidation = MIN_LENGTH_VALIDATION.validate(value);
                                                            if (minValidation !== true) return minValidation;
                                                            const maxValue = getValues('textmaxlength');
                                                            if (maxValue && value && parseInt(value, 10) >= parseInt(maxValue, 10)) {
                                                                return ENTER_LESSER_VALUE;
                                                            }
                                                            return true;
                                                        },
                                                    }
                                                    : {}
                                            }
                                            maxLength={3}
                                            onKeyDown={onlyNumbers}
                                        />
                                    </Col>
                                    <Col sm={6}>
                                        <RSInput
                                            name={'textmaxlength'}
                                            control={control}
                                            required={validationrequired && StringDataLength === 'Length'}
                                            placeholder={MAX_LENGTH_PLACEHOLDER}
                                            rules={
                                                validationrequired && StringDataLength === 'Length'
                                                    ? {
                                                        ...MAX_LENGTH_VALIDATION,
                                                        validate: (value) => {
                                                            const maxValidation = MAX_LENGTH_VALIDATION.validate(value);
                                                            if (maxValidation !== true) return maxValidation;
                                                            const minValue = getValues('textminlength');
                                                            if (minValue && value && parseInt(value, 10) <= parseInt(minValue, 10)) {
                                                                return ENTER_GREATEST_VALUE;
                                                            }
                                                            return true;
                                                        },
                                                    }
                                                    : {}
                                            }
                                            maxLength={3}
                                            onKeyDown={onlyNumbers}
                                        />
                                    </Col>
                                </Row>
                            </Col>
                        )}
                        {StringDataLength === 'Fixed length' && (
                            <Col sm={5}>
                                <RSInput
                                    name={'textfulllength'}
                                    control={control}
                                    required={validationrequired && StringDataLength === 'Fixed length'}
                                    placeholder={FIXED_LENGTH_PLACEHOLDER}
                                    rules={
                                        validationrequired && StringDataLength === 'Fixed length'
                                            ? FIXED_LENGTH_VALIDATION
                                            : {}
                                    }
                                    maxLength={3}
                                    onKeyDown={onlyNumbers}
                                />
                            </Col>
                        )}
                    </Row>
                    <Row>
                        <Col sm={3}></Col>
                        <Col sm={6} className="d-flex pl0">
                            {TEXT_VALIDATION_TYPE_OPTIONS.map((option) => (
                                <div key={option}>
                                    <RSRadioButton
                                        control={control}
                                        name={'textValidationType'}
                                        labelName={option}
                                        rules={validationrequired ? { required: ENTER_VALUE } : {}}
                                        radio_wrapper_class='mt0'
                                    />
                                </div>
                            ))}
                        </Col>
                    </Row>
                </>
            )}

            {inputType?.fieldType === 'Decimal' && (
                <>
                    <Row>
                        <Col sm={12}>
                            <h4>{DECIMAL_VALIDATION_RULES}</h4>
                        </Col>
                    </Row>
                    <Row className="form-group">
                        <Col sm={3}>{LENGTH_LABEL}</Col>
                        <Col sm={4} className="d-flex pl0">
                            {LENGTH_TYPE_OPTIONS.map((option) => (
                                <div key={option}>
                                    <RSRadioButton
                                        control={control}
                                        name={'StringDataLength'}
                                        labelName={option}
                                        rules={validationrequired ? { required: ENTER_VALUE } : {}}
                                        radio_wrapper_class='mt0'
                                    />
                                </div>
                            ))}
                        </Col>
                        {StringDataLength === 'Length' && (
                            <Col sm={5}>
                                <Row>
                                    <Col sm={6}>
                                        <RSInput
                                            name={'textminlength'}
                                            control={control}
                                            required={validationrequired && StringDataLength === 'Length'}
                                            placeholder={MIN_LENGTH_PLACEHOLDER}
                                            rules={
                                                validationrequired && StringDataLength === 'Length'
                                                    ? {
                                                        ...MIN_LENGTH_VALIDATION,
                                                        validate: (value) => {
                                                            const minValidation = MIN_LENGTH_VALIDATION.validate(value);
                                                            if (minValidation !== true) return minValidation;
                                                            const maxValue = getValues('textmaxlength');
                                                            if (maxValue && value && parseInt(value, 10) >= parseInt(maxValue, 10)) {
                                                                return ENTER_LESSER_VALUE;
                                                            }
                                                            return true;
                                                        },
                                                    }
                                                    : {}
                                            }
                                            maxLength={3}
                                            onKeyDown={onlyNumbers}
                                        />
                                    </Col>
                                    <Col sm={6}>
                                        <RSInput
                                            name={'textmaxlength'}
                                            control={control}
                                            required={validationrequired && StringDataLength === 'Length'}
                                            placeholder={MAX_LENGTH_PLACEHOLDER}
                                            rules={
                                                validationrequired && StringDataLength === 'Length'
                                                    ? {
                                                        ...MAX_LENGTH_VALIDATION,
                                                        validate: (value) => {
                                                            const maxValidation = MAX_LENGTH_VALIDATION.validate(value);
                                                            if (maxValidation !== true) return maxValidation;
                                                            const minValue = getValues('textminlength');
                                                            if (minValue && value && parseInt(value, 10) <= parseInt(minValue, 10)) {
                                                                return ENTER_GREATEST_VALUE;
                                                            }
                                                            return true;
                                                        },
                                                    }
                                                    : {}
                                            }
                                            maxLength={3}
                                            onKeyDown={onlyNumbers}
                                        />
                                    </Col>
                                </Row>
                            </Col>
                        )}
                        {StringDataLength === 'Fixed length' && (
                            <Col sm={5}>
                                <RSInput
                                    name={'textfulllength'}
                                    control={control}
                                    required={validationrequired && StringDataLength === 'Fixed length'}
                                    placeholder={FIXED_LENGTH_PLACEHOLDER}
                                    rules={
                                        validationrequired && StringDataLength === 'Fixed length'
                                            ? FIXED_LENGTH_VALIDATION
                                            : {}
                                    }
                                    maxLength={3}
                                    onKeyDown={onlyNumbers}
                                />
                            </Col>
                        )}
                    </Row>
                    <Row>
                        <Col sm={3}></Col>
                        <Col sm={4} className='pl0'>
                            <RSCheckbox control={control} name={'negativevalue'} labelName={ALLOW_NEGATIVE_VALUES} />
                        </Col>
                        <Col sm={5}>
                            <RSKendoDropdown
                                name={'currencyformat'}
                                control={control}
                                data={CURRENCY_FORMAT_OPTIONS}
                                required={validationrequired}
                                textField={'currencyFormat'}
                                dataItemKey={'currencyFormat'}
                                label={CURRENCY_FORMAT_LABEL}
                                rules={{
                                    required: SELECT_CURRENCY_FORMAT,
                                }}

                            />
                        </Col>
                    </Row>
                </>
            )}

            {inputType?.fieldType === 'Date' && (
                <>
                    <Row>
                        <Col sm={12}>
                            <h4>{DATE_VALIDATION_RULES}</h4>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <RSDatePicker
                                placeholder={START_DATE}
                                control={control}
                                name="startdate"
                                required={validationrequired}
                                rules={
                                    validationrequired
                                        ? {
                                            required: ENTER_VALUE,
                                            validate: (value) => {
                                                if (enddate && value && new Date(value) > new Date(enddate)) {
                                                    return ENTER_LESSER_VALUE;
                                                }
                                                return true;
                                            },
                                        }
                                        : {}
                                }
                                max={enddate || undefined}
                            />
                        </Col>
                        <Col md={6}>
                            <RSDatePicker
                                placeholder={END_DATE}
                                control={control}
                                name="enddate"
                                required={validationrequired}
                                rules={
                                    validationrequired
                                        ? {
                                            required: ENTER_VALUE,
                                            validate: (value) => {
                                                if (startdate && value && new Date(value) < new Date(startdate)) {
                                                    return ENTER_GREATEST_VALUE;
                                                }
                                                return true;
                                            },
                                        }
                                        : {}
                                }
                                min={startdate || undefined}
                            />
                        </Col>
                    </Row>
                </>
            )}

            {inputType?.fieldType === 'Integer' && (
                <>
                    <Row>
                        <Col sm={12}>
                            <h4>{INTEGER_VALIDATION_RULES}</h4>
                        </Col>
                    </Row>
                    <Row className="form-group">
                        <Col sm={3}>{LENGTH_LABEL}</Col>
                        <Col sm={4} className="d-flex pl0">
                            {LENGTH_TYPE_OPTIONS.map((option) => (
                                <div key={option}>
                                    <RSRadioButton
                                        control={control}
                                        name={'StringDataLength'}
                                        labelName={option}
                                        rules={validationrequired ? { required: ENTER_VALUE } : {}}
                                        radio_wrapper_class='mt0'
                                    />
                                </div>
                            ))}
                        </Col>
                        {StringDataLength === 'Length' && (
                            <Col sm={5}>
                                <Row>
                                    <Col sm={6}>
                                        <RSInput
                                            type={'text'}
                                            name={'textminlength'}
                                            control={control}
                                            required={validationrequired && StringDataLength === 'Length'}
                                            placeholder={MIN_LENGTH_PLACEHOLDER}
                                            rules={
                                                validationrequired && StringDataLength === 'Length'
                                                    ? {
                                                        ...MIN_LENGTH_VALIDATION,
                                                        validate: (value) => {
                                                            const minValidation = MIN_LENGTH_VALIDATION.validate(value);
                                                            if (minValidation !== true) return minValidation;
                                                            const maxValue = getValues('textmaxlength');
                                                            if (maxValue && value && parseInt(value, 10) >= parseInt(maxValue, 10)) {
                                                                return ENTER_LESSER_VALUE;
                                                            }
                                                            return true;
                                                        },
                                                    }
                                                    : {}
                                            }
                                        />
                                    </Col>
                                    <Col sm={6}>
                                        <RSInput
                                            type={'text'}
                                            name={'textmaxlength'}
                                            control={control}
                                            required={validationrequired && StringDataLength === 'Length'}
                                            placeholder={MAX_LENGTH_PLACEHOLDER}
                                            rules={
                                                validationrequired && StringDataLength === 'Length'
                                                    ? {
                                                        ...MAX_LENGTH_VALIDATION,
                                                        validate: (value) => {
                                                            const maxValidation = MAX_LENGTH_VALIDATION.validate(value);
                                                            if (maxValidation !== true) return maxValidation;
                                                            const minValue = getValues('textminlength');
                                                            if (minValue && value && parseInt(value, 10) <= parseInt(minValue, 10)) {
                                                                return ENTER_GREATEST_VALUE;
                                                            }
                                                            return true;
                                                        },
                                                    }
                                                    : {}
                                            }
                                        />
                                    </Col>
                                </Row>
                            </Col>
                        )}
                        {StringDataLength === 'Fixed length' && (
                            <Col sm={5}>
                                <RSInput
                                    type={'text'}
                                    name={'textfulllength'}
                                    control={control}
                                    required={validationrequired && StringDataLength === 'Fixed length'}
                                    placeholder={FIXED_LENGTH_PLACEHOLDER}
                                    rules={
                                        validationrequired && StringDataLength === 'Fixed length'
                                            ? FIXED_LENGTH_VALIDATION
                                            : {}
                                    }
                                />
                            </Col>
                        )}
                    </Row>
                    <Row>
                        <Col sm={3}></Col>
                        <Col sm={4} className='pl0'>
                            <RSCheckbox control={control} name={'negativevalue'} labelName={ALLOW_NEGATIVE_VALUES} />
                        </Col>
                        <Col sm={5}>
                            <RSKendoDropdown
                                name={'currencyformat'}
                                control={control}
                                data={CURRENCY_FORMAT_OPTIONS}
                                required={validationrequired}
                                textField={'currencyFormat'}
                                dataItemKey={'currencyFormat'}
                                label={CURRENCY_FORMAT_LABEL}
                                  rules={{
                                    required: SELECT_CURRENCY_FORMAT,
                                }}

                            />
                        </Col>
                    </Row>
                </>
            )}
        </div>
    );
};

export default ValidationRules;
