const INITIAL_STATE = {
    attributesData: [],
    leftPanelAttributes: [],
    searchAttributes: [],
    loading: false,
    loadIndex: 0,
    activeListIndex: 0,
    filterLabels: {},
    filterGroups: {
        activeGroup: 'filterLists',
        groups: ['filterLists'],
    },
    attributesError: {
        filterLists: null,
    },
    type: 'persona',
    isSavePersona: false,
    attributeTypes: [],
    attributesLoading: false
};

const FORM_INITIAL_STATE = {
    defaultValues: {
        filterLists: [],
        personaName: '',
    },
    mode: 'onChange',
};

const STATE_REDUCER = (state, action) => {
    const { type, field, payload } = action;
    switch (type) {
        case 'UPDATE':
            return {
                ...state,
                [field]: payload,
            };
        case 'UPDATE_ATTRIBUTES':
            return {
                ...state,
                attributesData: payload.attributesData,
                leftPanelAttributes: payload.leftPanelAttributes,
                searchAttributes: payload.searchAttributes,
                [`${field}Constructed`]: {
                    available: true,
                    attributesData: payload.attributesData,
                    leftPanelAttributes: payload.leftPanelAttributes,
                    searchAttributes: payload.searchAttributes,
                },
            };
        case 'UPDATE_ATTRIBUTE_VALUES':
            
            return {
                ...state,
                loading: payload.loading,
                loadIndex: payload.index,
                filterLabels: { ...state.filterLabels, [payload.attrName]: payload.values },
            };
        case 'UPDATE_LOADING':
            return {
                ...state,
                loading: payload.loading,
                loadIndex: payload.index,
            };
        default:
            return state;
    }
};

const _isAttributesErrors = (attributesError) => {
    if (attributesError['filterLists'] !== null) {
        return false;
    }
    return true;
};

const getFieldType = (type) => {
    let fieldType = '1';
    switch (type) {
         
        case   's':
        case 'ss':
            fieldType = '1';
            break;
        case 'd' :
        case 'ds':
            fieldType = '3';
            break;
        case 'i' :
        case 'is':
            fieldType = '4';
            break;
        case 'dt' :
        case 'dts':
            fieldType = '8';
            break;
        default:
            return null;
    }
    return fieldType;
};
const fieldValue = (inputValue) => {
    const cleanedValue = inputValue?.replace(/''/g, '') || '';
    const listItem = cleanedValue.split(',');
    return listItem.map((str) => str.replace(/'/g, '').replace(/:@@;/g, ','));
};
const getFieldObject = (field, fieldType, category) => {
    const parsedFieldType = parseInt(fieldType, 10);
    const normalizedOperator = String(field?.ConditionOperator || '')
        .toLowerCase()
        .replace(/\s+/g, '');
    const stringInputOperators = ['like', 'doesnotlike', 'startswith', 'endswith'];
    const conditionLabel =
        conditionValue[normalizedOperator] ||
        conditionValue[String(field?.ConditionOperator || '').toLowerCase()] ||
        field?.ConditionOperator;
    const value = field?.Value ?? '';
    const valueParts = typeof value === 'string' ? value.split(':') : [];
    const getDateOrRaw = (inputValue) => {
        const dateValue = new Date(inputValue);
        return Number.isNaN(dateValue?.getTime?.()) ? inputValue : dateValue;
    };

    let stringValue = value;
    let dropdownStringValue = [];
    if (parsedFieldType === 1) {
        if (field?.SOLRFieldName === 'Channel_s') {
            stringValue = fieldValue(value).reduce((tempField, item) => {
                if (item === 'WebUser') tempField.push('Web Push');
                if (item === 'AppUser') tempField.push('Mobile App');
                if (item === 'Mobile') tempField.push('SMS');
                if (item === 'Email') tempField.push('Email');
                if (item === 'WhatsApp') tempField.push('WhatsApp');
                return tempField;
            }, []);
        } else if (field?.SOLRFieldName === 'Remotedatasource_s' && valueParts.length > 1) {
            stringValue = getDateOrRaw(valueParts[1]);
        } else {
            stringValue = fieldValue(value);
        }

        if (!stringInputOperators.includes(normalizedOperator)) {
            dropdownStringValue = (Array.isArray(stringValue) ? stringValue : [stringValue])
                .filter((item) => item !== undefined && item !== null && String(item).trim() !== '')
                .map((item, index) => ({
                    id: index,
                    count: 0,
                    data: item,
                }));
        }
    } else if (parsedFieldType === 8) {
        stringValue = normalizedOperator === 'between' ? getDateOrRaw(valueParts?.[0]) : getDateOrRaw(value);
    } else {
        stringValue = value;
    }

    const list = {
        category: category,
        name: field.Field,
        labelText: field.Field || field.FieldName,
        fieldType: fieldType,
        parentChildIdentify: field.parentChildIdentify,
        sOLRFieldName: field.SOLRFieldName,
        solrCountValue: field.solrCountValue,
        isMultiValue: false,
        cattype: null,
        restype: field.restype,
        parentSOLRFieldName: field.parentSOLRFieldName,
        seqNo: field.SequenceId,
        valueCollection: null,
        isAnnualReminder: false,
        isSwitched: true,
        isLoading: false,
        isStatus: true,
        attributeType: conditionLabel,
        attributeValue:
            parsedFieldType === 1
                ? stringInputOperators.includes(normalizedOperator)
                    ? Array.isArray(stringValue)
                        ? stringValue[0] || ''
                        : stringValue
                    : dropdownStringValue
                : parsedFieldType === 8
                ? stringValue
                : (parsedFieldType === 4 || parsedFieldType === 3) && normalizedOperator === 'between'
                ? valueParts?.[0] || ''
                : value,
        attributeValueOne:
            (parsedFieldType === 4 || parsedFieldType === 3) && normalizedOperator === 'between'
                ? valueParts?.[1] || ''
                : parsedFieldType === 8 && normalizedOperator === 'between'
                ? getDateOrRaw(valueParts?.[1])
                : field?.SOLRFieldName === 'Remotedatasource_s'
                ? getDateOrRaw(valueParts?.[2])
                : '',
    };
    return list;
};

const LEFT_PANEL_RESPONSE = {
    
    data: { 
            filterValues: {
                String: {
                    // 1
                    isequalto: 'Is equal to',
                    isnotequalto: 'Is not equal to',
                    in: 'Contains',
                    'not in': 'Not contains',
                    // Like: 'Like',
                    // Doesnotlike: 'Does not like',
                    // Startswith: 'Starts with',
                    // Endswith: 'Ends with',
                    // hasnovalue: 'Has no value',
                    // hasvalue: 'Has value',
                },
                DateTime: {
                    // 8
                    isequalto: 'Is equal to',
                    isnotequalto: 'Is not equal to',
                    isafterorequalto: 'Is after or equal to',
                    isafter: 'Is after',
                    isbeforeorequalto: 'Is before or equal to',
                    isbefore: 'Is before',
                    between: 'Between',
                    // notbetween: 'Not between',
                    // hasnovalue: 'Has no value',
                    // hasvalue: 'Has value',
                },
                Integer: {
                    // 4 & 3
                    isequalto: 'Is equal to',
                    isnotequalto: 'Is not equal to',
                    isgreaterthanorequalto: 'Is greater than or equal to',
                    isgreaterthan: 'Is greater than',
                    islessthanorequalto: 'Is less than or equal to',
                    islessthan: 'Is less than',
                    between: 'Between',
                    // hasnovalue: 'Has no value',
                    // hasvalue: 'Has value',
                },
            },
        
    },
};

const GET_PERSONA_LISTS = {
    status: true,
    message: 'Success',
    data: [
        {
            category: 'Customer',
            Field: 'DOS',
            labelText: 'DOS',
            fieldType: '1',
            parentChildIdentify: null,
            SOLRFieldName: 'DOS_s',
            solrCountValue: 81,
            isMultiValue: false,
            cattype: null,
            restype: null,
            parentSOLRFieldName: null,
            seqNo: 0,
            valueCollection: null,
            isAnnualReminder: false,
            isSwitched: true,
            isLoading: false,
            isStatus: true,
            ConditionOperator: 'Contains',
            Value: 'Windows,iOS',
        },
        {
            category: 'Customer',
            Field: 'Slider',
            labelText: 'Slider',
            fieldType: '1',
            parentChildIdentify: null,
            SOLRFieldName: 'Slider_s',
            solrCountValue: 55,
            isMultiValue: false,
            cattype: null,
            restype: null,
            parentSOLRFieldName: null,
            seqNo: 0,
            valueCollection: null,
            isAnnualReminder: false,
            isSwitched: true,
            isLoading: false,
            isStatus: true,
            ConditionOperator: 'Is equal to',
            Value: 'Linux',
        },
    ],
};

const conditionValue = {
    isequalto: 'Is equal to',
    isnotequalto: 'Is not equal to',
    contains: 'Contains',
    notcontains: 'Not contains',
    like: 'Like',
    doesnotlike: 'Does not like',
    startswith: 'Starts with',
    endswith: 'Ends with',
    hasnovalue: 'Has no value',
    hasvalue: 'Has value',
    isgreaterthanorequalto: 'Is greater than or equal to',
    isgreaterthan: 'Is greater than',
    islessthanorequalto: 'Is less than or equal to',
    islessthan: 'Is less than',
    between: 'Between',
    isafterorequalto: 'Is after or equal to',
    isafter: 'Is after',
    isbeforeorequalto: 'Is before or equal to',
    isbefore: 'Is before',
    // notbetween: 'Not between',
};

export {
    INITIAL_STATE,
    STATE_REDUCER,
    FORM_INITIAL_STATE,
    LEFT_PANEL_RESPONSE,
    _isAttributesErrors,
    GET_PERSONA_LISTS,
    getFieldType,
    getFieldObject,
};
