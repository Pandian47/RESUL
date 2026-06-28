import { cloneElement } from 'react';

import { getYYMMDD } from 'Utils/modules/dateTime';

export const INITIAL_STATE = {
    defaultValues: {
        uIPrintableName: '',
        description: '',
        brandId: false,
        inputType: '',
        dataType: '',
        filterGroup: '',
        classification: [],
        personalization: '',
        attributeFlag: '',
        attributeFlagValue: '',
        categoryType: '',
        kpiType: '',
        categoryTypeText: '',
        fallbackAttributeName: '',
        kpiConditions: [{ attribute: '', value: '' }],
        validationrequired: false,
        textDataLength: '',
        StringDataLength: '',
        textValidationType: '',
        specialCharacters: '',
        textminlength: '',
        textmaxlength: '',
        textfulllength: '',
        negativevalue: false,
        currencyformat: '',
        startdate: '',
        enddate: '',
        sensitiveDatavalue: '',
        digitstoshow: '',
    },
    mode: 'onTouched',
};

export const KPI_TYPES = ['Count', 'Min', 'Max', 'Sum', 'Average', 'Duration'];

// Validation Rules Configuration
export const SPECIAL_CHARACTERS_OPTIONS = ['Allow', 'Do not allow'];

export const LENGTH_TYPE_OPTIONS = ['Length', 'Fixed length'];

export const TEXT_VALIDATION_TYPE_OPTIONS = ['Alphanumeric', 'Email validation', 'Mobile number validation'];

export const CURRENCY_FORMAT_OPTIONS = [
    { currencyFormat: 'USD ($)' },
    { currencyFormat: 'EUR (€)' },
    { currencyFormat: 'INR (₹)' },
    { currencyFormat: 'GBP (£)' },
    { currencyFormat: 'AUD (A$)' },
    { currencyFormat: 'CAD (C$)' },
];

export const SENSITIVE_DATA_MASKING_OPTIONS = ['Random masking', 'Specified masking'];

// Validation Rules Labels
export const TEXT_VALIDATION_RULES = 'Text validation rules';
export const DECIMAL_VALIDATION_RULES = 'Decimal validation rules';
export const DATE_VALIDATION_RULES = 'Date validation rules';
export const INTEGER_VALIDATION_RULES = 'Integer validation rules';
export const SPECIAL_CHARACTERS_LABEL = 'Special characters';
export const LENGTH_OF_STRING_LABEL = 'Length of string';
export const LENGTH_LABEL = 'Length';
export const ALLOWED_SPECIAL_CHARACTERS = 'Allowed special characters';
export const MIN_LENGTH_PLACEHOLDER = 'Min length';
export const MAX_LENGTH_PLACEHOLDER = 'Max length';
export const FIXED_LENGTH_PLACEHOLDER = 'Fixed length';
export const ALLOW_NEGATIVE_VALUES = 'Allow negative values';
export const CURRENCY_FORMAT_LABEL = 'Currency format';
export const VALIDATION_REQUIRED_LABEL = 'Validation required';

// Validation Messages
export const ENTER_VALUE = 'Enter value';

// Validation Rules for Input Fields
export const SPECIAL_CHARACTERS_VALIDATION = {
    required: ENTER_VALUE,
    pattern: {
        value: /^[^a-zA-Z0-9\s]+$/,
        message: 'Only special characters are allowed.',
    },
    validate: (value) => {
        if (!value || value.trim() === '') {
            return ENTER_VALUE;
        }
        if (/[a-zA-Z0-9]/.test(value)) {
            return 'Only special characters are allowed.';
        }
        return true;
    },
};

export const FIXED_LENGTH_VALIDATION = {
    required: ENTER_VALUE,
    pattern: {
        value: /^[0-9]+$/,
        message: 'Only numbers are allowed',
    },
    maxLength: {
        value: 3,
        message: 'Maximum 3 digits allowed',
    },
    validate: (value) => {
        if (!value || value.trim() === '') {
            return ENTER_VALUE;
        }
        if (!/^[0-9]+$/.test(value)) {
            return 'Only numbers are allowed';
        }
        return true;
    },
};

export const MIN_LENGTH_VALIDATION = {
    required: ENTER_VALUE,
    pattern: {
        value: /^[0-9]+$/,
        message: 'Only numbers are allowed',
    },
    min: {
        value: 0,
        message: 'Minimum value is 0',
    },
    validate: (value) => {
        if (!value || value.trim() === '') {
            return ENTER_VALUE;
        }
        if (!/^[0-9]+$/.test(value)) {
            return 'Only numbers are allowed';
        }
        const numValue = parseInt(value, 10);
        if (numValue < 0) {
            return 'Minimum value is 0';
        }
        return true;
    },
};

export const MAX_LENGTH_VALIDATION = {
    required: ENTER_VALUE,
    pattern: {
        value: /^[0-9]+$/,
        message: 'Only numbers are allowed',
    },
    max: {
        value: 200,
        message: 'Maximum value is 200',
    },
    validate: (value) => {
        if (!value || value.trim() === '') {
            return ENTER_VALUE;
        }
        if (!/^[0-9]+$/.test(value)) {
            return 'Only numbers are allowed';
        }
        const numValue = parseInt(value, 10);
        if (numValue > 200) {
            return 'Maximum value is 200';
        }
        return true;
    },
};

export const mapToItemRender = (li, itemProps, disabledItems) => {
    let props = li.props;
    if (disabledItems?.includes(itemProps.dataItem?.dataClassificationId)) {
        props = {
            ...props,
            className: 'pe-none click-off',
        };
    }
    const itemChildren = <span>{li.props.children}</span>;

    return cloneElement(li, props, itemChildren);
};

export const kpiConstruction = (data) => {
    function compareValue(fieldType, value) {
        switch (fieldType) {
            case 8:
                return '[]';
            case 4:
                return value?.condition?.value || '<';
            default:
                return '=';
        }
    }

    if (data?.length) {
        let tmp = data?.map((res) => {
            const { attribute, value } = res;
            return {
                attribute: {
                    dataAttributeId: attribute.dataAttributeId,
                    uIPrintableName: attribute.uIPrintableName,
                    fieldTypeId: attribute.fieldTypeId,
                    CompareValue: compareValue(attribute.fieldTypeId, value),
                    Value: value,
                    // "SOLRExpression": "(Age_is:[24 TO *])"
                },
                value: value,
            };
        });
        return JSON.stringify(tmp);
    }
    return JSON.stringify('');
};

export const kpiRetrieve = (data) => {
    const parsed = JSON.parse(data) || [];
    const finalData = parsed?.map((res) => {
        if (res?.attribute?.fieldTypeId === 8) {
            res['value'] = { start: new Date(res?.value?.start), end: new Date(res?.value?.end) };
            return res;
        }
        return res;
    });
    return finalData;
};

export const brandIdCheck = (isAudience, isBrandExists, editData, isCampaign, isEdit = false) => {
    let Audience = isAudience === 1 ? true : false;
    if (Audience) {
        return false;
    } else if (!Audience && !!isBrandExists && !isEdit) {
        return false;
    } else if (!Audience && !isBrandExists && !isEdit) {
        return true;
    } else if (!Audience && !!isBrandExists && isEdit && isBrandExists?.dataAttributeId !== editData?.dataAttributeId) {
        return false;
    } else if (!Audience && !!isBrandExists && isEdit && isBrandExists?.dataAttributeId === editData?.dataAttributeId) {
        return true;
    } else if (!Audience && !isBrandExists && isEdit) {
        return true;
    }

    // isAudience = true

    //     if (!isEdit && isAudience && !!isBrandExists && isCampaign) {
    //         return false;
    //     }
    //     if (!isAudience && !!isBrandExists && isBrandExists?.dataAttributeId === editData?.dataAttributeId) {
    //         return false;
    //     }
    //     if (isAudience && editData?.isBrandId === 0 && isBrandExists !== undefined && isCampaign) return false;
    //     if (isAudience && !!isBrandExists && isBrandExists?.dataAttributeId === editData?.dataAttributeId && !isCampaign) return false;

    return true;
};

// Function to format validation rules according to payload structure
export const formatValidationRules = (data, inputType) => {
    if (!data.validationrequired || !inputType) {
        return [];
    }

    const fieldType = inputType?.fieldType?.toLowerCase();
    let rules = {
        type: fieldType,
        rules: {},
    };

    if (fieldType === 'text') {
        const isAllow = data.textDataLength === SPECIAL_CHARACTERS_OPTIONS[0];
        const isLength = data.StringDataLength === LENGTH_TYPE_OPTIONS[0];
        const isFixedLength = data.StringDataLength === LENGTH_TYPE_OPTIONS[1];

        rules = {
            is_special_characters: isAllow,
            special_characters: isAllow ? data.specialCharacters || '' : '',
            length_type: isLength ? 'range' : isFixedLength ? 'fixed' : null,
            min_length: isLength ? (data.textminlength ? parseInt(data.textminlength) : null) : null,
            max_length: isLength ? (data.textmaxlength ? parseInt(data.textmaxlength) : null) : null,
            fixed_length: isFixedLength ? (data.textfulllength ? parseInt(data.textfulllength) : null) : null,
            alphanumeric: data.textValidationType === TEXT_VALIDATION_TYPE_OPTIONS[0],
            email_validation: data.textValidationType === TEXT_VALIDATION_TYPE_OPTIONS[1],
            mobile_number_validation: data.textValidationType === TEXT_VALIDATION_TYPE_OPTIONS[2],
        };
    } else if (fieldType === 'integer') {
        const isLength = data.StringDataLength === LENGTH_TYPE_OPTIONS[0];
        const isFixedLength = data.StringDataLength === LENGTH_TYPE_OPTIONS[1];

        rules = {
            length_type: isLength ? 'range' : isFixedLength ? 'fixed' : null,
            min_length: isLength ? (data.textminlength ? parseInt(data.textminlength) : null) : null,
            max_length: isLength ? (data.textmaxlength ? parseInt(data.textmaxlength) : null) : null,
            fixed_length: isFixedLength ? (data.textfulllength ? parseInt(data.textfulllength) : null) : null,
            allow_negative: data.negativevalue === true || data.negativevalue === 'true' ? true : false,
            currency_format: data.currencyformat || '',
        };
    } else if (fieldType === 'decimal') {
        const isLength = data.StringDataLength === LENGTH_TYPE_OPTIONS[0];
        const isFixedLength = data.StringDataLength === LENGTH_TYPE_OPTIONS[1];

        rules = {
            length_type: isLength ? 'range' : isFixedLength ? 'fixed' : null,
            min_length: isLength ? (data.textminlength ? parseInt(data.textminlength) : null) : null,
            max_length: isLength ? (data.textmaxlength ? parseInt(data.textmaxlength) : null) : null,
            fixed_length: isFixedLength ? (data.textfulllength ? parseInt(data.textfulllength) : null) : null,
            allow_negative: data.negativevalue === true || data.negativevalue === 'true' ? true : false,
            currency_format: data.currencyformat || '',
        };
    } else if (fieldType === 'date') {
        rules = {
            start_date: data.startdate ? getYYMMDD(data.startdate) : '',
            end_date: data.enddate ? getYYMMDD(data.enddate) : '',
        };
    }

    return JSON.stringify(rules);
};

// Function to retrieve validation rules from editData
export const retrieveValidationRules = (editData, inputType) => {
    if (!editData || !inputType || !editData.validationRuleJSON) {
        return {
            validationrequired: false,
            textDataLength: '',
            StringDataLength: '',
            textValidationType: '',
            specialCharacters: '',
            textminlength: '',
            textmaxlength: '',
            textfulllength: '',
            negativevalue: false,
            currencyformat: '',
            startdate: '',
            enddate: '',
        };
    }
    let validationRules = null;
    try {
        validationRules = editData.validationRuleJSON ? JSON.parse(editData.validationRuleJSON) : null;
        if (!validationRules || !validationRules.rules) {
            return {
                validationrequired: false,
                textDataLength: '',
                StringDataLength: '',
                textValidationType: '',
                specialCharacters: '',
                textminlength: '',
                textmaxlength: '',
                textfulllength: '',
                negativevalue: false,
                currencyformat: '',
                startdate: '',
                enddate: '',
            };
        }

        const fieldType = inputType?.fieldType?.toLowerCase();
        const rules = validationRules.rules;
        const result = {
            validationrequired: editData.isValidationRequired ?? false,
            textDataLength: '',
            StringDataLength: '',
            textValidationType: '',
            specialCharacters: '',
            textminlength: '',
            textmaxlength: '',
            textfulllength: '',
            negativevalue: false,
            currencyformat: '',
            startdate: '',
            enddate: '',
        };

        if (fieldType === 'text') {
            result.textDataLength = is_special_characters
                ? SPECIAL_CHARACTERS_OPTIONS[0]
                : SPECIAL_CHARACTERS_OPTIONS[1];
            result.specialCharacters = special_characters || '';
            result.StringDataLength =
                length_type === 'range'
                    ? LENGTH_TYPE_OPTIONS[0]
                    : length_type === 'fixed'
                    ? LENGTH_TYPE_OPTIONS[1]
                    : '';
            result.textminlength = min_length ? String(min_length) : '';
            result.textmaxlength = max_length ? String(max_length) : '';
            result.textfulllength = fixed_length ? String(fixed_length) : '';

            if (alphanumeric) {
                result.textValidationType = TEXT_VALIDATION_TYPE_OPTIONS[0];
            } else if (email_validation) {
                result.textValidationType = TEXT_VALIDATION_TYPE_OPTIONS[1];
            } else if (mobile_number_validation) {
                result.textValidationType = TEXT_VALIDATION_TYPE_OPTIONS[2];
            }
        } else if (fieldType === 'integer' || fieldType === 'decimal') {
            result.StringDataLength =
                length_type === 'range'
                    ? LENGTH_TYPE_OPTIONS[0]
                    : length_type === 'fixed'
                    ? LENGTH_TYPE_OPTIONS[1]
                    : '';
            result.textminlength = min_length ? String(min_length) : '';
            result.textmaxlength = max_length ? String(max_length) : '';
            result.textfulllength = fixed_length ? String(fixed_length) : '';
            result.negativevalue =
                allow_negative === true || allow_negative === 'true' || allow_negative === 1;
            result.currencyformat = currency_format || '';
        } else if (fieldType === 'date') {
            result.startdate = start_date ? new Date(start_date) : '';
            result.enddate = end_date ? new Date(end_date) : '';
        }

        return result;
    } catch (error) {
        return {
            validationrequired: false,
            textDataLength: '',
            StringDataLength: '',
            textValidationType: '',
            specialCharacters: '',
            textminlength: '',
            textmaxlength: '',
            textfulllength: '',
            negativevalue: false,
            currencyformat: '',
            startdate: '',
            enddate: '',
        };
    }
};

export const formatSensitiveDataRule = (data, classification) => {
    // Check if classification includes 'Sensitive data'
    const hasSensitiveData = classification?.some(
        (classi) => classi?.dataClassificationName === 'Sensitive data'
    );

    if (!hasSensitiveData || !data.sensitiveDatavalue) {
        return {
            dataMasking: false,
            type: '',
            isSpecific: 0,
        };
    }

    const isRandom = data.sensitiveDatavalue === SENSITIVE_DATA_MASKING_OPTIONS[0];
    const isSpecific = data.sensitiveDatavalue === SENSITIVE_DATA_MASKING_OPTIONS[1];

    const finalPayload = {
        dataMasking: true,
        type: isRandom ? 'random' : isSpecific ? 'specific' : '',
        isSpecific: isSpecific && data.digitstoshow ? parseInt(data.digitstoshow, 10) : 0,
    };

    return JSON.stringify(finalPayload);
};

export const retrieveSensitiveDataRule = (editData) => {
    try {
        if (!editData || !editData.sensitiveDataRule) {
            return {
                sensitiveDatavalue: '',
                digitstoshow: '',
            };
        }
        let sensitiveDataRule;
        sensitiveDataRule = editData.sensitiveDataRule ? JSON.parse(editData.sensitiveDataRule) : null;
        if (!sensitiveDataRule || !sensitiveDataRule.dataMasking) {
            return {
                sensitiveDatavalue: '',
                digitstoshow: '',
            };
        }

        const result = {
            sensitiveDatavalue: '',
            digitstoshow: '',
        };

        if (sensitiveDataRule.type === 'random') {
            result.sensitiveDatavalue = SENSITIVE_DATA_MASKING_OPTIONS[0];
        } else if (sensitiveDataRule.type === 'specific') {
            result.sensitiveDatavalue = SENSITIVE_DATA_MASKING_OPTIONS[1];
            result.digitstoshow = sensitiveDataRule.isSpecific ? String(sensitiveDataRule.isSpecific) : '';
        }

        return result;
    } catch (error) {
        return {
            sensitiveDatavalue: '',
            digitstoshow: '',
        };
    }
};
