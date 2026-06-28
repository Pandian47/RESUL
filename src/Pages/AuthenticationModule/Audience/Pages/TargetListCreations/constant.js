import { getDDMMMYYYYWITHOUTCOMMAS, getMMMDDYYYY } from 'Utils/modules/dateTime';
import { normalizeDisplayText } from 'Utils/modules/stringUtils';
import _get from 'lodash/get';

export const ALLOW_MIXED_BRAND_PARTNER_IN_GROUP = false;

const INITIAL_STATE = {
    zeroDayConstructed: {
        available: false,
        attributesData: [],
        leftPanelAttributes: [],
        searchAttributes: [],
    },
    defaultConstructed: {
        available: false,
        attributesData: [],
        leftPanelAttributes: [],
        searchAttributes: [],
    },
    attributeConstructed: {
        zeroDay: {
            available: false,
            attributesData: [],
            leftPanelAttributes: [],
            searchAttributes: [],
        },
        default: {
            available: false,
            attributesData: [],
            leftPanelAttributes: [],
            searchAttributes: [],
        },
    },
    attributesData: [],
    attributesLoading: false,
    attributesLoadFailed: false,
    leftPanelAttributes: [],
    searchAttributes: [],
    attributeTypes: [],
    loading: false,
    loadIndex: 0,
    filterGroups: {
        groups: ['filterLists'],
        activeGroup: 'filterLists',
        disableGroups: [],
        exclusionListGroup: false,
    },
    filterLabels: {},
    virtualValues: {},
    activeListIndex: 0,
    isValidListname: null,
    isCreateEnable: true,
    isLoadingListname: null,
    isBQAudienceCount: false,
    isOpenSegmentModal: false,
    calculateLater: false,
    isListField: false,
    isAPIRequest: false,
    attributesError: {
        zeroDayLists: null,
        zeroDayListsErrorIndex: null,
        filterLists: null,
        filterListsErrorIndex: null,
        inclusionLists: null,
        inclusionListsErrorIndex: null,
        exclusionLists: null,
        exclusionListsErrorIndex: null,
        lookALikeAudiLists: null,
        lookALikeAudiListsErrorIndex: null,
        lookALikeAttrLists: null,
        lookALikeAttrListsErrorIndex: null,
    },
    isDeleteGroup: false,
    deleteGroupName: '',
    type: 'targetlist',
    isZeroDayFiles: false,
    lookAlikeLeftPanelLoading: false,
    lookAlikeRecAtts: [],
    isPartnerAttSaved: false
};

const FORM_INITIAL_STATE = {
    defaultValues: {
        zeroDayLists: [],
        filterLists: [],
        inclusionLists: [],
        exclusionLists: [],
        lookALikeAudLists: [],
        lookALikeAttrLists: [],
        finalAudienceCount: 0,
        segmentation: {
            listName: '',
            isinclusionSwitched: true,
            filterLists: { groupOperator: true },
        },
        totalAudiences: 0,
        inclusionAudience: 0,
        extractionLimit: '',
        extractionCheck: false,
        approvalList: {
            name: [{ approverName: '', mandatory: false }],
            requestApproval: false,
            approvalFrom: 'All',
            approvalCount: '2',
            followHierarchy: false,
        },
        attributeslistCount: {
            zeroDayLists: [],
            filterLists: [],
            inclusionLists: [],
            exclusionLists: [],
            lookALikeAudLists: [],
            lookALikeAttrLists: [],
        },
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
        case 'UPDATE_DELETEGROUP':
            return {
                ...state,
                isDeleteGroup: payload.isDeleteGroup,
                deleteGroupName: payload.deleteGroupName,
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
        case 'UPDATE_ATTRIBUTES_ZERODAY':
            return {
                ...state,
                attributesData: state.defaultConstructed.attributesData,
                leftPanelAttributes: state.defaultConstructed.leftPanelAttributes,
                searchAttributes: state.defaultConstructed.searchAttributes,
                [`${field}Constructed`]: {
                    available: false,
                    attributesData: payload.attributesData,
                    leftPanelAttributes: payload.leftPanelAttributes,
                    searchAttributes: payload.searchAttributes,
                },
            };
        case 'UPDATE_CONSTRUCTED_ATTRIBUTES':
            return {
                ...state,
                attributesData: state[`${field}Constructed`].attributesData,
                leftPanelAttributes: state[`${field}Constructed`].leftPanelAttributes,
                searchAttributes: state[`${field}Constructed`].searchAttributes,
            };
        case 'UPDATE_LOADING':
            return {
                ...state,
                loading: payload.loading,
                loadIndex: payload.index,
            };
        case 'UPDATE_ZERO_DAY_FILES':
            return {
                ...state,
                isZeroDayFiles: !state.isZeroDayFiles,
            };
        case 'RESET':
            return INITIAL_STATE;
        case 'UPDATE_VIRTUAL_VALUES':
            return {
                ...state,
                virtualValues: {
                    ...state.virtualValues,
                    ...payload,
                },
            };
        case 'UPDATE_ATTRIBUTE_VALUES':
            return {
                ...state,
                loading: payload.loading,
                loadIndex: payload.index,
                filterLabels: { ...state.filterLabels, [payload.attrName]: payload.values },
            };
        case 'UPDATE_EDIT_DATA':
            return {
                ...state,
                filterGroups: payload.tempFilterGroups,
                attributesData: payload.newAttributes,
                leftPanelAttributes: payload.newLeftPanelAttributes,
            };
        default:
            return state;
    }
};

const ZERO_DAY_FIELD_NAME = 'ZeroDayFiles';
const ZERO_DAY_ATTRIBUTE_TYPES = {
    isequalto: 'Is equal to',
    isnotequalto: 'Is not equal to',
};

const FILTER_GROUPS = ['Inclusion', 'Exclusion'];
const FILTER_GROUPS_PARTNER = ['Inclusion'];
const LOOK_A_LIKE_GROUPS = ['Attributes', 'Audience'];
const AVAILABLE_GROUPS = [
    'zeroDayLists',
    'filterLists',
    'inclusionLists',
    'exclusionLists',
    // 'lookALikeAudLists',
    'lookALikeAttrLists',
];

const GROUP_RENDER_ORDER = ['zeroDayLists', 'filterLists', 'inclusionLists', 'exclusionLists','lookALikeAudLists', 'lookALikeAttrLists'];

export const finalOrderWiseGroupLists = (filterGroups) => {
    const getBaseGroupName = (key) => {
        return GROUP_RENDER_ORDER.find((baseGroup) => key.startsWith(baseGroup));
    };

    const groupMap = {};
    for (const key of filterGroups) {
        const baseGroup = getBaseGroupName(key);
        if (!baseGroup) continue;
        if (!groupMap[baseGroup]) groupMap[baseGroup] = [];
        groupMap[baseGroup].push(key);
    }

    const sortedGroupKeys = GROUP_RENDER_ORDER.flatMap((group) => groupMap[group] || []);
    return sortedGroupKeys;
};

const VIRTUAL_FIELD_CHECK_ATTRS = ['customdate', 'weekdaycustom', 'weekendcustom', 'wednesdaycustom'];
const temp_VIRTUAL_FIELD_CHECK_ATTRS = ['customdate', 'VF1', 'VF2'];

const ZERO_DAY_FILES = {
    status: true,
    message: 'Success',
    data: {
        attributesList: [
            {
                category: 'Custom_Zero_Day',
                name: 'Zero_day_filesasdf',
                id: 101,
                labelText: 'Zero day files safsa',
                fieldType: '1',
                dataTypeID: 1,
                parentChildIdentify: null,
                solrFieldName: 'Zero_day_filesasdf_s',
                sOLRCountValue: 10,
                isMultiValue: false,
                cattype: null,
                restype: null,
                parentSOLRFieldName: null,
                seqNo: 0,
                valueCollection: null,
                isAnnualReminder: false,
                isVirtualField: false,
            },
            {
                category: 'Custom_Zero_Day',
                name: 'DOSasf',
                id: 1,
                labelText: 'DOS sadf',
                fieldType: '1',
                dataTypeID: 1,
                parentChildIdentify: null,
                solrFieldName: 'DOSasf_s',
                sOLRCountValue: 10,
                isMultiValue: false,
                cattype: null,
                restype: null,
                parentSOLRFieldName: null,
                seqNo: 0,
                valueCollection: null,
                isAnnualReminder: false,
                isVirtualField: false,
            },
        ],
        recipientsCount: 12,
        distinctCategory: {
            categories: ['Custom_Zero_Day'],
        },
        filterValues: null,
    },
};

export const filterValue = {
    String: {
        // 1
        isequalto: 'Is equal to',
        isnotequalto: 'Is not equal to',
        in: 'Contains',
        'not in': 'Not contains',
        Like: 'Like',
        Doesnotlike: 'Does not like',
        Startswith: 'Starts with',
        Endswith: 'Ends with',
        hasnovalue: 'Has no value',
        hasvalue: 'Has value',
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
        hasnovalue: 'Has no value',
        hasvalue: 'Has value',
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
        hasnovalue: 'Has no value',
        hasvalue: 'Has value',
    },
};

const getFieldType = (type) => {
    let fieldType = '1';
    switch (type) {
        case 's':
        case 'ss':
            fieldType = '1';
            break;
        case 'd':
        case 'ds':
            fieldType = '3';
            break;
        case 'i':
        case 'is':
            fieldType = '4';
            break;
        case 'dt':
        case 'dts':
            fieldType = '8';
            break;
        default:
            return null;
    }
    return fieldType;
};

export const getArrayType = (arr) => {
    if (!Array.isArray(arr)) return 'not an array';
    if (arr.length === 0) return 'empty array';

    const allArrays = arr.every(Array.isArray);
    const allObjects = arr.every((item) => typeof item === 'object' && item !== null && !Array.isArray(item));
    if (allArrays) return 'nestedArray';
    if (!allObjects) return 'array';
    if (allObjects) return 'object';
    return 'mixed or invalid';
};

const conditionValue = {
    isequalto: 'Is equal to',
    isnotequalto: 'Is not equal to',
    in: 'Contains',
    'not in': 'Not contains',
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

let notDropDownInStringType = [
    conditionValue?.doesnotlike,
    conditionValue?.endswith,
    conditionValue?.like,
    conditionValue?.startswith,
];

const handleFirstAndSecondAttributeValue = (field, fieldType, condition) => {
    let tempField = [],
        temp = [];
    if (field?.SOLRFieldName === 'Channel_s') {
        temp = fieldValue(field.Value);
        temp.forEach((item) => {
            if (item === 'WebUser') tempField.push('Web Push');
            if (item === 'AppUser') tempField.push('Mobile App');
            if (item === 'Mobile') tempField.push('SMS');
            if (item === 'Email') tempField.push('Email');
            if (item === 'WhatsApp') tempField.push('WhatsApp');
            if (item === 'Online Audience') tempField.push('Online Audience');
        });
    }

    const fieldTypeInt = parseInt(fieldType, 10);
    const isBetween = field?.ConditionOperator === 'between';
    const solrField = field?.SOLRFieldName || '';
    const fieldParts = field?.Value?.split(':') || [];

    let attributeFirstValue = '';
    let attributeSecondValue = '';

    if (fieldTypeInt === 1) {
        if (solrField === 'Channel_s') {
            if (notDropDownInStringType?.includes(condition)) {
                attributeFirstValue = field?.Value
            } else if (['Has no value', 'Has value']?.includes(condition)) {
                attributeFirstValue = field?.Value
            } else {
                attributeFirstValue = tempField?.map((item, index) => {
                return { id: index, count: 0, data: item };
            });
            }
            
        } else if (solrField === 'Remotedatasource_s') {
            attributeFirstValue = new Date(fieldParts[1]);
        } else {
            if (getArrayType(field.dateValue) === 'object') {
                attributeFirstValue = field.dateValue;
            } else if (getArrayType(field.dateValue) === 'array') {
                const finalAttributeValue = field.dateValue?.map((item, index) => {
                    return {
                        id: index,
                        count: 0,
                        data: item,
                    };
                });
                attributeFirstValue = finalAttributeValue;
            } else {
                if (!notDropDownInStringType?.includes(condition)) {
                    const attributeSPlitValues = fieldValue(field?.Value);
                    attributeFirstValue = attributeSPlitValues?.map((item, index) => {
                        return {
                            id: index,
                            count: 0,
                            data: item,
                        };
                    });
                } else {
                    attributeFirstValue = field?.Value?.replace(/:@@;/g, ',') || field?.Value;
                }
            }
        }
    } else if (fieldTypeInt === 8 && isBetween) {
        attributeFirstValue = new Date(fieldParts[0]);
    } else if (fieldTypeInt === 3 && solrField === 'Subscriptionform_d') {
        attributeFirstValue = new Date(fieldParts[1]);
    } else if (fieldTypeInt === 1 || fieldTypeInt === 8 || (fieldTypeInt === 3 && solrField === 'Subscriptionform_d')) {
        attributeFirstValue = new Date(field.Value);
    } else if ((fieldTypeInt === 4 || fieldTypeInt === 3) && isBetween) {
        attributeFirstValue = fieldParts[0];
    } else {
        attributeFirstValue = field.Value;
    }

    if ((fieldTypeInt === 4 || fieldTypeInt === 3) && isBetween) {
        attributeSecondValue = fieldParts[1];
    } else if (fieldTypeInt === 8 && isBetween) {
        attributeSecondValue = new Date(fieldParts[1]);
    } else if (solrField === 'Remotedatasource_s' || solrField === 'Subscriptionform_d') {
        attributeSecondValue = new Date(fieldParts[2]);
    } else {
        attributeSecondValue = '';
    }

    return {
        attributeFirstValue: {
            value: attributeFirstValue,
        },
        attributeSecondValue: {
            value: attributeSecondValue,
        },
    };
};

const parseVirtualField = (virtualFieldString, fieldType) => {
    const parseIntfieldType = parseInt(fieldType, 10);

    if (!virtualFieldString) return {};

    const [attributeValuePart, virutalValuePart] = virtualFieldString.split('|');
    const [attributeValue, virtualType] =
        parseIntfieldType === 1 ? attributeValuePart.split(':') : attributeValuePart.split(',');

    let virtualInput = '';
    let virtualStart = '';
    let virtualEnd = '';

    if (virutalValuePart?.includes('-')) {
        const [start, end] = virutalValuePart.split('-');
        virtualStart = getDDMMMYYYYWITHOUTCOMMAS(start?.trim());
        virtualEnd = getDDMMMYYYYWITHOUTCOMMAS(end?.trim());
    } else {
        virtualInput = virutalValuePart;
    }

    return {
        attributeValue: attributeValue?.replace(/:@@;/g, ',') || attributeValue,
        virtualType,
        virtualInput,
        virtualStart,
        virtualEnd,
    };
};

const parseVirtualFieldPair = (value, fieldType) => {
    if (!value?.includes(':')) return {};

    const [leftPart, rightPart] = value.split(':').map((part) => part.trim());

    const firstField = parseVirtualField(leftPart, fieldType);
    const secondField = parseVirtualField(rightPart, fieldType);

    return {
        firstField,
        secondField,
    };
};

const handleAttributeValueEditFormat = (field, attributeValue, fieldType, condition) => {
    let finalAttributeValue = '';
    if (fieldType == 1) {
        if (getArrayType(field.dateValue) === 'object') {
            finalAttributeValue = field.dateValue;
        } else if (getArrayType(field.dateValue) === 'array') {
            const finalAttributeValueDatas = field.dateValue?.map((item, index) => {
                return {
                    id: index,
                    count: 0,
                    data: item,
                };
            });
            finalAttributeValue = finalAttributeValueDatas;
        } else {
            if (field?.SOLRFieldName === 'Campaign_summary_s') {
                const convertedValue = field?.Value?.replace(/:@@;/g, ',') || field?.Value;
                const attributeValue = convertedValue?.split(',')[0];
                finalAttributeValue = attributeValue?.split(':')[attributeValue?.split(':')?.length - 1] || '';
            } else if (!notDropDownInStringType?.includes(condition)) {
                const attributeSPlitValues = fieldValue(field?.Value);
                finalAttributeValue = attributeSPlitValues?.map((item, index) => {
                    return {
                        id: index,
                        count: 0,
                        data: item,
                    };
                });
            } else {
                finalAttributeValue = field?.Value?.replace(/:@@;/g, ',') || field?.Value;
            }
        }
    } else {
        const convertedValue = field?.Value?.replace(/:@@;/g, ',');
        finalAttributeValue = convertedValue?.includes(',') ? attributeValue : convertedValue || field?.Value;
    }
    return finalAttributeValue;
};

const handleAttributeValueEditFlow = (field, fieldType, condition) => {
    if (field?.IsVirtualField) {
        if (field?.SOLRFieldName === 'Campaign_summary_s') {
            const values = parseVirtualField(field?.Value, 3);
            return {
                attributeFirstValue: {
                    value: handleAttributeValueEditFormat(field, values?.attributeValue, fieldType, condition),
                    ...values,
                },
                attributeSecondValue: {
                    value: '',
                },
            };
        } else if (field?.Value?.includes(':')) {
            const { firstField, secondField } = parseVirtualFieldPair(field?.Value, fieldType);
            return {
                attributeFirstValue: {
                    value: handleAttributeValueEditFormat(field, firstField?.attributeValue, fieldType, condition),
                    ...firstField,
                },
                attributeSecondValue: {
                    value: handleAttributeValueEditFormat(field, secondField?.attributeValue, fieldType, condition),
                    ...secondField,
                },
            };
        } else if (field?.Value?.includes('|')) {
            const values = parseVirtualField(field?.Value, fieldType);
            return {
                attributeFirstValue: {
                    value: handleAttributeValueEditFormat(field, values?.attributeValue, fieldType, condition),
                    ...values,
                },
                attributeSecondValue: {
                    value: '',
                },
            };
        } else {
            const value = field?.Value?.replace(/:@@;/g, ',') || field?.Value;
            const splitValue = fieldType == 1 ? value?.split(':') : value?.split(',');
            return {
                attributeFirstValue: {
                    value: handleAttributeValueEditFormat(field, splitValue[0], fieldType, condition),
                    virtual: !!splitValue[1],
                    virtualType: splitValue[1],
                    virtualInput: '',
                    virtualStart: '',
                    virtualEnd: '',
                },
                attributeSecondValue: {
                    value: '',
                },
            };
        }
    } else {
        return handleFirstAndSecondAttributeValue(field, fieldType, condition);
    }
};

const handleVirtualTypeEditFlow = (values) => {
    if (values?.virtualStart && values?.virtualEnd) {
        return 'virtualDate';
    } else if (values?.virtualInput) {
        return 'virtualInput';
    } else {
        return 'virtualDefault';
    }
};

const handlFieldObjectState = (field, fieldType, condition,groupType) => {
    const allValues = handleAttributeValueEditFlow(field, fieldType, condition);

    let addFieldValues;

    if (field.IsVirtualField) {
        const { attributeFirstValue, attributeSecondValue } = allValues;
        const isDateField = parseInt(fieldType, 10) === 8;
        addFieldValues = {
            attributeValue: isDateField ? new Date(attributeFirstValue?.value) : attributeFirstValue?.value || '',
            attributeValueOne: isDateField ? new Date(attributeSecondValue?.value) : attributeSecondValue?.value || '',
            virtual:
                attributeFirstValue?.virtualInput ||
                (attributeFirstValue?.virtualStart && attributeFirstValue?.virtualEnd)
                    ? true
                    : false,
            virtualInput: attributeFirstValue?.virtualInput,
            virtualStart: attributeFirstValue?.virtualStart,
            virtualEnd: attributeFirstValue?.virtualEnd,
            virtualFields: attributeFirstValue?.virtualType,
            virtualType: handleVirtualTypeEditFlow(attributeFirstValue),
            isVirtualSave:
                attributeFirstValue?.virtualInput ||
                (attributeFirstValue?.virtualStart && attributeFirstValue?.virtualEnd)
                    ? true
                    : false,
        };
    } else {
        let attributeValue = allValues?.attributeFirstValue?.value || '';
        let attributeValueOne = allValues?.attributeSecondValue?.value || '';

        if ((parseInt(fieldType, 10) === 1 || groupType === 'zeroDayLists') && typeof attributeValue === 'string' && attributeValue.trim() !== '' && !notDropDownInStringType?.includes(condition)) {
            if (!Array.isArray(attributeValue) && (attributeValue.includes("'") || attributeValue.includes(',') || attributeValue?.length)) {
                try {
                    const parsedValues = fieldValue(attributeValue);
                    if (parsedValues && parsedValues.length > 0) {
                        attributeValue = parsedValues.map((item, index) => ({
                            id: index,
                            count: 0,
                            data: item,
                        }));
                    }
                } catch (e) {
                                    }
            }
        }
        
        addFieldValues = {
            attributeValue: attributeValue,
            attributeValueOne: attributeValueOne,
        };
    }

    return addFieldValues;
};

const getFieldObject = (field, fieldType, category, groupType) => {
    const addFieldValues = handlFieldObjectState(
        field,
        fieldType,
        conditionValue[String(field?.ConditionOperator || '').toLowerCase()],
        groupType
    );
    const list = {
        category: field.Category,
        name: field.LiUIPrintableName,
        labelText: field.LiUIPrintableName,
        fieldType: fieldType,
        parentChildIdentify: field.ParentChildIdentify,
        sOLRFieldName: field.SOLRFieldName,
        sOLRCountValue: field.SOLRCountValue,
        isMultiValue: false,
        cattype: null,
        restype: field.restype,
        parentSOLRFieldName: field.ParentSOLRFieldName,
        seqNo: field.SeqNo,
        valueCollection: null,
        isAnnualReminder: false,
        isvirtualfield: field.IsVirtualField,
        isSwitched: groupType === 'lookALikeAttrLists' ? false : (field?.ExpressionOperator === 'And' ? true : false),
        isLoading: false,
        isStatus: true,
        dateValue: field.dateValue,
        typeStatus: field.typeStatus,
        AttributeName: field?.Field,
        //    WithInOperator: field?.WithInOperator==='And'?'And': null,
        //         WithInOperatorCountdisable: field?.WithInOperatorCountdisable==='Disable'?'Disable': null,
        //         WithInOperatorCountStart: field?.WithInOperatorCountStart=== "WithInOperatorCountStart" ?field?.WithInOperatorCountStart:null,
        //         WithInOperatorCountEnd:field?.WithInOperatorCountStart=== null && field?.WithInOperator==='And' ?field?.WithInOperatorCountEnd:null,

        WithInOperator: field?.WithInOperator,
        WithInOperatorCountdisable: field?.WithInOperatorCountdisable,
        WithInOperatorCountStart: field?.WithInOperatorCountStart,
        WithInOperatorCountEnd: field?.WithInOperatorCountEnd,
        attributeType:
            field?.SOLRFieldName === 'Remotedatasource_s' || field?.SOLRFieldName === 'Subscriptionform_d'
                ? field.Value.split(':')[0]
                : conditionValue[String(field?.ConditionOperator || '').toLowerCase()],
        WithInOperatorCount: field?.WithInOperatorCountEnd,
        mergeValue:
            field?.WithInOperatorCountEnd === 'WithInOperatorCountEnd' || field?.WithInOperatorCountEnd === 'continue'
                ? 'Merge'
                : undefined,
        ...addFieldValues,
        partnerId: field?.partnerId
    };
    // console.log('list: ', list);
    return list;
};

const fieldValue = (inputValue) => {
    let cleanedValue = inputValue?.replace(/''/g, '') || '';
    
    let listItem = [];
    if (cleanedValue.startsWith("'") && cleanedValue.endsWith("'")) {
        const innerValue = cleanedValue.slice(1, -1);
        listItem = innerValue.split("','");
    } else {
        listItem = cleanedValue.split(',');
    }
    
    return listItem.map((str) => normalizeDisplayText(str.replace(/'/g, '').replace(/:@@;/g, ',')));
};

export const _isAttributesErrors = (attributesError) => {
    AVAILABLE_GROUPS.forEach((group) => {
        if (attributesError[group] !== null) {
            return false;
        }
    });
    return true;
};

const getallAttributes = (attributes, allAttributeFormState) => {
    const {
        zeroDayLists = [],
        filterLists,
        inclusions = [],
        exclusions = [],
        lookALikeAudLists = [],
        lookALikeAttrLists = [],
    } = attributes;
    // const inclusions = inclusionLists?.length ? inclusionLists : [];
    // const exclusions = exclusionLists?.length ? exclusionLists : [];
    const getCurrentAttributes = [
        // ...zeroDayLists,
        // ...filterLists,
        // ...inclusions,
        // ...exclusions,
        // ...lookALikeAudLists,
        // ...lookALikeAttrLists,
        ...allAttributeFormState,
    ];
    return getCurrentAttributes.findIndex(({ attributeValue, attributeValueOne, attributeType, fieldType ,communicationStatus}) => {
        if (attributeType === 'Has no value' || attributeType === 'Has value') return false;
        if (!attributeValue) {
            if (!communicationStatus) {
                return true;
            }
        } else if (Array.isArray(attributeValue) && !attributeValue?.length) return true;
        else if (
            (parseInt(fieldType, 10) === 3 || parseInt(fieldType, 10) === 4 || parseInt(fieldType, 10) === 8) &&
            (attributeType === 'Between' || attributeType === 'Not between')
        ) {
            if (!attributeValueOne) return true;
        }
        // else if (attributeValue instanceof Date) return false;
        return false;
    });
};

// SUBMIT API DATA CONSTRUCTION
const groupConfigs = (data, group, res) => {
    switch (group) {
        case 'zeroDayLists':
            return {
                name: 'ZeroDay',
                operator: 'AND',
                saveName: 'ZeroDay',
                saveGroupName: 'ZeroDay',
            };
        case 'filterLists':
            return {
                name: 'OriginalBase',
                operator: 'AND',
                saveName: 'OriginalBaseExprVal',
                saveGroupName: 'OriginalBase',
            };
        case 'inclusionLists':
            let result = !res ? data?.segmentation.isinclusionSwitched : res;
            return {
                name: 'MultipleFilter',
                operator: result ? 'AND' : 'OR',
                saveName: 'FilterGroup2ExprVal',
                saveGroupName: 'MultipleFilter',
            };
        case 'exclusionLists':
            return {
                name: 'ExclusionFilter',
                operator: 'NOT',
                saveName: 'Exclusion1ExprVal',
                saveGroupName: 'ExclusionFilter',
            };
        // case 'lookALikeAudLists':
        //     return {
        //         name: 'ExclusionFilter',
        //         operator: 'NOT',
        //         saveName: 'lookALikeAudienceExprVal',
        //         saveGroupName: 'LookALikeAudience',
        //     };
        case 'lookALikeAttrLists':
            return {
                name: 'IG_LookALike',
                operator: 'NOT',
                saveName: 'LookALikeExprVal',
                saveGroupName: 'IG_LookALike',
            };
        default:
            return {
                name: 'NoName',
                operator: 'NoOperator',
                saveName: 'OriginalBaseExprVal',
                saveGroupName: 'OriginalBase',
            };
    }
};

const findAttributeTypeName = (attrs = {}, val = '', fieldType = '', solrFieldName = '') => {
    let obj = {};
    if (parseInt(fieldType, 10) === 4 || parseInt(fieldType, 10) === 3 || solrFieldName === 'Campaign_summary_s') obj = attrs['Integer'];
    else if (parseInt(fieldType, 10) === 8) obj = attrs['DateTime'];
    else obj = attrs['String'];
    return obj ? Object.keys(obj).find((key) => obj[key] === val) : {};
};

const makeExpressionZeroDay = (data, attributeTypes) => {
    let tempData = data?.slice(1);
    return {
        FileName: data[0]?.attributeValue[0]?.data?.toString() || '',
        GroupingOperator: 'And',
        FilterGroup: 'zeroday',
        TotalIncusionQuery: '',
        TotalInclusionCount: '',
        Expressions: tempData.map((exp, index) => {
            return {
                SequenceId: index,
                Field: exp.FieldName,
                FieldType: exp.FieldType,
                ConditionOperator: findAttributeTypeName(attributeTypes, exp.attributeType, exp.FieldType),
                Value: `'${exp.attributeValue?.map((value) => (value?.data || '').replace(/,/g, ':@@;')).join("','")}'` || '',
                ExpressionOperator: exp.isSwitched ? 'And' : 'Or',
                LiId: 'filterBuildComp' + index,
                ParentdivId: 'crbZeroContainer',
                SOLRFieldName: exp.sOLRFieldName,
                Category: exp.category,
                LiUIPrintableName: exp.labelText,
            };
        }),
    };
};

const handleFilterGroupInSubSegment = (group) => {
    const currentListTypeDetail = getListTypeDetail(group);
    const { key, value } = currentListTypeDetail;
    let groupName_Filter = 'IG1_Subsegment';
    if (key === 'filterLists') {
        groupName_Filter = 'IG1_Subsegment';
    } else if (key === 'inclusionLists') {
        groupName_Filter = !value ? 'IG2_Subsegment' : `IG${value + 1}_Subsegment`;
    } else if (key === 'exclusionLists') {
        groupName_Filter = !value ? 'Ex1_Subsegment' : `Ex${value}_Subsegment`;
    }
    return groupName_Filter;
};
const handleFilterGroupInMultiList = (group) => {
    const currentListTypeDetail = getListTypeDetail(group);
    const { key, value } = currentListTypeDetail;
    let groupName_Filter = 'IG1';
    if (key === 'filterLists') {
        groupName_Filter = 'IG1';
    } else if (key === 'inclusionLists') {
        groupName_Filter = !value ? 'IG2' : `IG${value + 1}`;
    } else if (key === 'exclusionLists') {
        groupName_Filter = !value ? 'EG1' : `EG${value}`;
    }else if (key === 'lookALikeAttrLists') {
        groupName_Filter =  `IG_LookALike`;
    }
    return groupName_Filter;
};

const handleGroupingOperator = (tempData, group, res, isMultiFilter) => {
    const operator = tempData?.segmentation?.[group]?.groupOperator ? 'AND' : 'OR';
    const finalOperator = group?.includes('exclusionLists') ? 'NOT' : operator;
    if (isMultiFilter) {
        const currentListTypeDetail = getListTypeDetail(group);
        const { key } = currentListTypeDetail;
        return finalOperator ?? groupConfigs(tempData, key, res)['operator'];
    } else {
        return finalOperator ?? groupConfigs(tempData, group, res)['operator'];
    }
};

function getChannelMappedValues(channelList) {
    const mapping = {
        'Web Push': 'WebUser',
        'Mobile App': 'AppUser',
        SMS: 'Mobile',
    };
    return channelList.map((item) => mapping[item] || item);
}

function formatDateRange(start, end) {
    return `${getDDMMMYYYYWITHOUTCOMMAS(start)}:${getDDMMMYYYYWITHOUTCOMMAS(end)}`;
}

function handleDateField(exp) {
    if (exp.attributeType === 'Between') {
        return formatDateRange(exp.attributeValue, exp.attributeValueOne);
    } else if (['Has no value', 'Has value'].includes(exp.attributeType)) {
        return '0';
    } else {
        return getDDMMMYYYYWITHOUTCOMMAS(exp.attributeValue);
    }
}

function handleSpecialSolrFields(exp) {
    const id = exp.sOLRFieldName === 'Subscriptionform_d' ? exp.attributeType?.RecipientFormID : exp.attributeType?.id;

    return `${id}:${formatDateRange(exp.attributeValue, exp.attributeValueOne)}`;
}

function handleCampaignNameField(exp) {
    const formatValue = exp.communicationName.map((item) => item?.campaignShortCode);
    const channelType = exp.communicationType?.apiValue ?? exp.communicationType?.label;
    return `${formatValue.join(',')}:${channelType}:${exp.communicationStatus?.status}`;
}
function handleCampaignSummaryField(exp) {
    const channelType = exp.communicationType?.apiValue ?? exp.communicationType?.label;
    return `${channelType}:${exp.communicationStatus?.status}:${exp.attributeValue}`;
}

const handleTempValue = (exp) => {
    let tempValue = '';
    let temp = [];
    let val = exp.attributeValue;

    if (exp?.labelText === 'Channel' && Array.isArray(val)) {
        temp = getChannelMappedValues(val?.map((item) => item.data));
    }

    if (['Remotedatasource_s', 'Subscriptionform_d'].includes(exp?.sOLRFieldName)) {
        tempValue = handleSpecialSolrFields(exp);
    }

    if (exp?.labelText === 'Channel' && Array.isArray(temp)) {
        tempValue = `'${temp.join("','")}'`;
    }

    return { tempValue };
};

const handleDateTempStatusValue = (exp) => {
    const typeStatus = [];
    let dateval = exp.attributeValue || exp.communicationName;

    if (exp?.sOLRFieldName === 'Campaign_name_s' || exp?.sOLRFieldName === 'Campaign_summary_s') {
        typeStatus.push(exp?.communicationType?.label);
        typeStatus.push(exp?.communicationStatus?.status);
    }

    if (['Remotedatasource_s', 'Subscriptionform_d'].includes(exp?.sOLRFieldName)) {
        dateval = `${exp.attributeValue}:${exp.attributeValueOne}`;
    }

    if (parseInt(exp.fieldType, 10) === 8) {
        if (exp.attributeType === 'Between') {
            dateval = `${exp.attributeValue}:${exp.attributeValueOne}`;
        }
    }

    return {
        dateval,
        typeStatus,
    };
};

function processofExpressionValue(exp) {
    let val = exp.attributeValue;

    const { tempValue } = handleTempValue(exp);
    const { dateval, typeStatus } = handleDateTempStatusValue(exp);

    if (parseInt(exp.fieldType, 10) === 8) {
        val = handleDateField(exp);
    } else {
        if (Array.isArray(exp.attributeValue)) {
            val = `'${exp.attributeValue?.map((value) => (value?.data || '').replace(/,/g, ':@@;')).join("','")}'`;
        }

        if (exp?.sOLRFieldName === 'Campaign_name_s') {
            val = handleCampaignNameField(exp);
        } else if (exp.attributeType === 'Between') {
            val = `${exp.attributeValue}:${exp.attributeValueOne}`;
        } else if (['Has no value', 'Has value'].includes(exp.attributeType)) {
            val = '0';
        }
    }

    return { val, dateval, tempValue, typeStatus };
}

const formatVirtualValue = (
    attrValue,
    virtualType,
    virtualValue,
    startDate,
    endDate,
    isDate = false,
    parseIntfieldType,
) => {
    const formattedStart = startDate ? getMMMDDYYYY(startDate) : '';
    const formattedEnd = endDate ? getMMMDDYYYY(endDate) : '';
    const finalValue = isDate ? `${formattedStart}-${formattedEnd}` : virtualValue;
    const typeLabel = virtualType?.VirtualDataAttributeName ?? '';
    const joinType = parseIntfieldType === 1 ? ':' : ',';
    return finalValue ? `${attrValue}${joinType}${typeLabel}|${finalValue}` : `${attrValue}${joinType}${typeLabel}`;
};

const handleVirtualFieldExpression = (exp) => {
    if (!exp?.isvirtualfield) return null;

    const {
        fieldType,
        attributeType,
        attributeValue,
        attributeValueOne,
        virtualFields,
        virtualStart,
        virtualEnd,
        virtual,
        virtualType,
        virtualInput,
    } = exp;
    const parseIntfieldType = parseInt(fieldType, 10);
    const isDateField = parseInt(fieldType, 10) === 8;
    const isBetween = attributeType === 'Between';
    const isVirtualInput = virtualType === 'virtualInput' || virtualType === 'virtualDefault' ? false : true;

    if (isDateField) {
        const dateFormatValue = getDDMMMYYYYWITHOUTCOMMAS(attributeValue);
        const dateFormatValueOne = getDDMMMYYYYWITHOUTCOMMAS(attributeValueOne);
        if (isBetween) {
            const value1 = formatVirtualValue(
                dateFormatValue,
                virtualFields,
                virtualInput,
                virtualStart,
                virtualEnd,
                isVirtualInput,
                parseIntfieldType,
            );
            const value2 = formatVirtualValue(
                dateFormatValueOne,
                virtualFields,
                virtualInput,
                virtualStart,
                virtualEnd,
                isVirtualInput,
                parseIntfieldType,
            );
            return `${value1}:${value2}`;
        } else {
            const isHas = ['Has no value', 'Has value'].includes(exp.attributeType);
            const value = isHas ? '0' : dateFormatValue;
            const value1 = formatVirtualValue(
                value,
                virtualFields,
                virtualInput,
                virtualStart,
                virtualEnd,
                isVirtualInput,
                parseIntfieldType,
            );
            return `${value1}`;
        }
    } else {
        if (Array.isArray(attributeValue)) {
            const joinValue = `'${attributeValue?.map((item) => (item.data || '').replace(/,/g, ':@@;')).join("','")}'`;
            const value = formatVirtualValue(
                joinValue,
                virtualFields,
                virtualInput,
                virtualStart,
                virtualEnd,
                isVirtualInput,
                parseIntfieldType,
            );
            return `${value}`;
        }

        if (exp?.sOLRFieldName === 'Campaign_name_s') {
            let value = handleCampaignNameField(exp);
            return value;
        } else if (exp?.sOLRFieldName === 'Campaign_summary_s') {
            let value = formatVirtualValue(
                handleCampaignSummaryField(exp),
                virtualFields,
                virtualInput,
                virtualStart,
                virtualEnd,
                isVirtualInput,
                3,
            );
            return value;
        } else if (isBetween) {
            const value1 = formatVirtualValue(
                attributeValue,
                virtualFields,
                virtualInput,
                virtualStart,
                virtualEnd,
                isVirtualInput,
                parseIntfieldType,
            );
            const value2 = formatVirtualValue(
                attributeValueOne,
                virtualFields,
                virtualInput,
                virtualStart,
                virtualEnd,
                isVirtualInput,
                parseIntfieldType,
            );
            return `${value1}:${value2}`;
        } else if (['Has no value', 'Has value'].includes(exp.attributeType)) {
            let val = '0';
            const value = formatVirtualValue(
                val,
                virtualFields,
                virtualInput,
                virtualStart,
                virtualEnd,
                isVirtualInput,
                parseIntfieldType,
            );
            return value;
        } else {
            const value = formatVirtualValue(
                attributeValue,
                virtualFields,
                virtualInput,
                virtualStart,
                virtualEnd,
                isVirtualInput,
                parseIntfieldType,
            );
            return value;
        }
    }
};

const handleExpressionValue = (exp) => {
    const isVirtualField = exp?.isvirtualfield;

    if (isVirtualField) {
        const val = handleVirtualFieldExpression(exp);
        const { tempValue } = handleTempValue(exp);
        const { dateval, typeStatus } = handleDateTempStatusValue(exp);
        return { val, dateval, tempValue, typeStatus };
    } else {
        return processofExpressionValue(exp);
    }
};

const makeExpression = (
    tempData,
    group,
    gIndex,
    attributeTypes,
    attributeslistCount,
    lastList,
    save,
    res,
    updateVersium,
    versiumDataSegment,
    transformedData_SubSegmentExp = [],
    isLocationData = {},
    listType = 0,
    isMultiFilter = false,
) => {
    const subSegmentFilterGroup = transformedData_SubSegmentExp?.map((e) => e.FilterGroup);
    let temp = [],
        tempValue = null;
    const groupList = tempData[group]?.filter((groupList) => groupList?.sOLRFieldName)
    return {
        GroupingOperator: handleGroupingOperator(tempData, group, res, isMultiFilter),
        FilterGroup: isLocationData?.isMDCSubSegment
            ? handleFilterGroupInSubSegment(group)
            : isMultiFilter
                ? handleFilterGroupInMultiList(group)
                : groupConfigs(tempData, group)[save ? 'saveGroupName' : 'name'],
        TotalIncusionQuery: '',
        TotalInclusionCount: '',
        IsLastLi: lastList === group,
        LiIndex: gIndex, // gIndex
        partnerID: updateVersium ? 40 : 0,
        remoteSettingId: updateVersium ? versiumDataSegment?.data?.remoteSettingId : 0,
        Expressions: groupList.map((exp, index) => {
            const { tempValue, val, dateval, typeStatus } = handleExpressionValue(exp);
            let channelTempValue = tempValue
            if (exp?.labelText === 'Channel') {
                if (notDropDownInStringType?.includes(exp?.attributeType)) {
                    channelTempValue = exp?.attributeValue
                } else if (['Has no value', 'Has value'].includes(exp.attributeType)) {
                    channelTempValue = '0'
                }
            }
            const finalValue =
                exp?.labelText === 'Channel' ? channelTempValue :
                    exp?.sOLRFieldName === 'Remotedatasource_s' ||
                        exp?.sOLRFieldName === 'Subscriptionform_d'
                        ? tempValue
                        : val;
            return {
                SequenceId: index,
                Category: exp.category,
                Field:
                    exp?.sOLRFieldName === 'Campaign_name_s'
                        ? 'campaign'
                        : listType === 1
                        ? exp?.AttributeName || exp?.labelText || ''
                        : exp.labelText ?? '',
                Value: finalValue,

                dateValue: dateval,
                typeStatus: typeStatus,
                ConditionOperator:
                    exp?.sOLRFieldName === 'Campaign_name_s'
                        ? 'equals'
                        : findAttributeTypeName(attributeTypes, exp.attributeType, exp.fieldType, exp?.sOLRFieldName) || 'isequalto',
                ExpressionOperator: exp.isSwitched ? 'And' : 'Or',
                QueryType: isLocationData?.isMDCSubSegment && exp?.category === 'File' ? exp?.DataType : 'hsearch',
                LiId: 'filterBuildComp' + index,
                ParentdivId: 'crbGroupContainer' + index,
                ParentChildIdentify: exp.parentChildIdentify,
                SOLRFieldName: exp.sOLRFieldName,
                SOLRCountValue: exp.sOLRCountValue,
                LiwaterfallCount: attributeslistCount[group]?.[index]?.[0] || '',
                LiremainingCount: +attributeslistCount[group]?.[index]?.[1] || '',
                LiarithmeticSymbol: '-',
                LiUIPrintableName: exp.labelText,
                WithInOperator: !!exp?.WithInOperatorCount ? 'And' : null,
                WithInOperatorCountdisable: !!exp?.mergeValue ? 'Disable' : null,
                WithInOperatorCountStart:
                    !!exp?.WithInOperatorCount && exp?.WithInOperatorCount === 'WithInOperatorCountStart'
                        ? exp?.WithInOperatorCount
                        : null,
                WithInOperatorCountEnd:
                    !!exp?.mergeValue && !!exp?.WithInOperatorCount ? exp?.WithInOperatorCount : null,
                restype: exp?.sOLRFieldName === 'Campaign_name_s' ? 'campaign' : exp.restype,
                ParentSOLRFieldName: exp.parentSOLRFieldName,
                SeqNo: exp.seqNo,
                SourceFrom: null,
                IsVirtualField: exp?.isvirtualfield ?? false,
                partnerId: exp?.partnerId ?? 0,
            };
        }),
    };
};

export const finalAPIData = (
    data,
    attributeslistCount,
    attributeTypes,
    updateId,
    isUpdate,
    userInfoIds,
    finalAudienceCount = 0,
    partnerData,
    potentialCount = 0,
    transformedData_SubSegmentExp = [],
    isLocationData = {},
    isUniqueID = '',
    filterGroups,
    selectedOption = {},
    lookAlikeRecAtts = []
) => {
    let temp = [];
    if (data.approvalList.requestApproval) {
        for (var l = 0; l < data?.approvalList?.name?.length; l++) {
            let tempRA = {
                TargetListApprovalID: '0',
                approverEmail: data.approvalList?.name[l].approverName.email,
                approverName: data.approvalList?.name[l].approverName.firstName,
                isMandatory: data.approvalList?.name[l]?.mandatory || false,
                approvalCondition: _get(data?.approvalList, 'approvalFrom', 'ALL'),
                noOfApprover: data.approvalList?.name?.length,
                isHierarchy: _get(data?.approvalList, 'followHierarchy', true),
                priority: l + 1,
                domainName: location?.origin,
                parameter: location?.pathname + '?targetListId={ListId}' + '&rfa=true',
                approverCount:
                    _get(data?.approvalList, 'approvalFrom', 'ALL') === 'Any'
                        ? _get(data?.approvalList, 'approvalCount', 0)
                        : data?.approvalList?.name?.length,
            };
            temp.push(tempRA);
        }
    }
    let fdata = {};
    fdata['RuleCondition'] = 'AND';
    if(filterGroups?.groups?.includes('lookALikeAttrLists')){
        fdata['SaveOption'] = selectedOption?.id
        fdata['LookAlikeRecAttributes'] = lookAlikeRecAtts
    }
    // fdata['finalAudienceCount'] = finalAudienceCount;
    fdata['TargetFilterGroup'] = 'All';
    fdata['segmentationName'] = data.segmentation?.listName;
    fdata['LAApercentage'] = 0;
    fdata['segmentationListId'] = isUpdate ? updateId ?? 0 : 0;
    fdata['RecipientCount'] = partnerData ? potentialCount : '0';
    fdata['IsRequestApproval'] = data.approvalList.requestApproval;
    fdata['zerodaycampaign'] =
        data.zeroDayLists?.length > 0 ? makeExpressionZeroDay(data.zeroDayLists, attributeTypes) : '';
    fdata['RequestApproval'] = temp;
    fdata['departmentId'] = userInfoIds.departmentId;
    fdata['Uid'] = userInfoIds.userId;
    fdata['userId'] = userInfoIds.userId;
    fdata['clientId'] = userInfoIds.clientId;
    fdata['premotesettingId'] =
        userInfoIds.locationVersium !== undefined ? userInfoIds.locationVersium?.data?.premoteSettingId : 0;
    fdata['partnerID'] = userInfoIds.locationVersium !== undefined ? 40 : partnerData ? 41 : 0;
    fdata['remoteSettingId'] =
        userInfoIds.locationVersium !== undefined ? userInfoIds.locationVersium?.data?.remoteSettingId : 0;
    fdata['IsSaveLaterFlag'] = false;
    fdata['extractionLimit'] = Number(data?.extractionLimit);
    if (isLocationData?.isMDCSubSegment) {
        (fdata['campaignId'] = isLocationData?.campaignId), (fdata['ListType'] = 16);
        fdata['AllGroups'] = transformedData_SubSegmentExp;
    }
    const tmpGroups = AVAILABLE_GROUPS.slice(1);
    const lastList = tmpGroups[tmpGroups?.length - 1];
    tmpGroups.forEach((group, gIndex) => {
        return (fdata[groupConfigs(data, group)['saveName']] = makeExpression(
            data,
            group,
            gIndex,
            attributeTypes,
            attributeslistCount,
            lastList,
            false,
            false,
            false,
            {},
            transformedData_SubSegmentExp,
            isLocationData,
            0,
        ));
    });
    const isMultiFilter = checkIsMulticlusion(filterGroups?.groups);

    const handleFinalExpression = (groupList, isMultiFilter = false) => {
        const finalExpression = [];
        groupList.forEach((group, gIndex) => {
            finalExpression.push(
                makeExpression(
                    data,
                    group,
                    gIndex,
                    attributeTypes,
                    attributeslistCount,
                    lastList,
                    false,
                    false,
                    false,
                    {},
                    transformedData_SubSegmentExp,
                    isLocationData,
                    0,
                    isMultiFilter,
                ),
            );
        });
        return finalExpression;
    };

    if (isMultiFilter) {
        fdata['AllGroups'] = handleFinalExpression(filterGroups.groups, true);
    }
    return fdata;
};
export const finalSubsegmentAPIData = (
    data,
    attributeslistCount,
    attributeTypes,
    updateId,
    isUpdate,
    userInfoIds,
    finalAudienceCount = 0,
    potentialCount = 0,
    transformedData_SubSegmentExp = [],
    isLocationData = {},
    isUniqueID = '',
    SubSegmentExp_List = [],
    listType = 0,
    filterGroups,
    isPartner,
) => {
    let temp = [];
    if (data.approvalList.requestApproval) {
        for (var l = 0; l < data?.approvalList?.name?.length; l++) {
            let tempRA = {
                TargetListApprovalID: '0',
                approverEmail: data.approvalList?.name[l].approverName.email,
                approverName: data.approvalList?.name[l].approverName.firstName,
                isMandatory: data.approvalList?.name[l]?.mandatory || false,
                approvalCondition: _get(data?.approvalList, 'approvalFrom', 'ALL'),
                noOfApprover: data.approvalList?.name?.length,
                isHierarchy: _get(data?.approvalList, 'followHierarchy', true),
                priority: l + 1,
                domainName: location?.origin,
                parameter: location?.pathname + '?targetListId={ListId}' + '&rfa=true',
                approverCount:
                    _get(data?.approvalList, 'approvalFrom', 'ALL') === 'Any'
                        ? _get(data?.approvalList, 'approvalCount', 0)
                        : data?.approvalList?.name?.length,
            };
            temp.push(tempRA);
        }
    }
    let fdata = {};

    fdata['totalAudienceCount'] = potentialCount;
    fdata['subSegmentName'] = data.segmentation?.listName;
    fdata['subSegmentId'] = isUpdate ? updateId : 0;
    fdata['IsRequestApproval'] = data.approvalList.requestApproval;
    fdata['subSegmentLevelFriendlyName'] = isLocationData?.subSegmentLevelFriendlyName;
    fdata['subSegmentLevel'] = isLocationData?.subSegmentLevel;
    fdata['priority'] = isLocationData?.priority;
    fdata['RequestApproval'] = temp;
    fdata['departmentId'] = userInfoIds.departmentId;
    fdata['isGroupCommunication'] = isLocationData.isGroupCommunication;
    fdata['userId'] = userInfoIds.userId;
    fdata['clientId'] = userInfoIds.clientId;
    (fdata['campaignId'] = isLocationData?.campaignId), (fdata['ListType'] = 16);
    fdata['SubSegmentGUID'] = isUpdate ? isLocationData?.SubSegmentGUID || isUniqueID : isUniqueID;
    fdata['segmentationListId'] = isLocationData?.listId.toString();
    fdata['segmentationListRuleJSON'] = SubSegmentExp_List;
    fdata['IsAutoRefresh'] = isLocationData?.isAutoRefresh;
    fdata['partnerID'] = isPartner ? 41 : 0;
    const tmpGroups = AVAILABLE_GROUPS.slice(1);
    const lastList = tmpGroups[tmpGroups?.length - 1];

    let availableGroups = [],
        expressions = [];
    if (data?.filterLists?.length > 0) availableGroups?.push('filterLists');
    if (data?.inclusionLists?.length > 0) availableGroups?.push('inclusionLists');
    if (data?.exclusionLists?.length > 0) availableGroups?.push('exclusionLists');
    let tempData = { ...data };
    const lastLists = availableGroups[availableGroups?.length - 1];
    availableGroups.forEach((group, gIndex) => {
        expressions.push(
            makeExpression(
                tempData,
                group,
                gIndex,
                attributeTypes,
                attributeslistCount,
                lastLists,
                false,
                false,
                false,
                {},
                transformedData_SubSegmentExp,
                isLocationData,
                listType,
            ),
        );
    });
    fdata['ruleJSON'] = expressions;

    const isMultiFilter = checkIsMulticlusion(filterGroups?.groups);

    const handleFinalExpression = (groupList, isMultiFilter = false) => {
        const finalExpression = [];
        groupList.forEach((group, gIndex) => {
            finalExpression.push(
                makeExpression(
                    tempData,
                    group,
                    gIndex,
                    attributeTypes,
                    attributeslistCount,
                    lastLists,
                    false,
                    false,
                    false,
                    {},
                    transformedData_SubSegmentExp,
                    isLocationData,
                    listType,
                    isMultiFilter,
                ),
            );
        });
        return finalExpression;
    };

    if (isMultiFilter) {
        fdata['AllGroups'] = handleFinalExpression(filterGroups.groups, true);
    }

    return fdata;
    // tmpGroups.forEach((group, gIndex) => {
    //     return (fdata[groupConfigs(data, group)['saveName']] = makeExpression(
    //         data,
    //         group,
    //         gIndex,
    //         attributeTypes,
    //         attributeslistCount,
    //         lastList,
    // transformedData_SubSegmentExp,
    //             isLocationData , true
    //     ));
    // });
    // return fdata;
};

const finalPayload = (
    data,
    filterGroups,
    attributeslistCount,
    attributeTypes,
    userInfoIds,
    res,
    updateVersium,
    versiumDataSegment,
    ispartnerDigipopstate,
    transformedData_SubSegmentExp = [],
    isLocationData = {},
    isUniqueID = '',
    listType = 0,
    SubSegmentExp_List = [],
    isLookAlike = false,
    selectedOption = {}
) => {
    let tempData = { ...data };
    let fdata = {};
    fdata['IsTwinsEnable'] = 1;
    fdata['departmentId'] = userInfoIds.departmentId;
    fdata['clientID'] = userInfoIds.clientId;
    fdata['userId'] = userInfoIds.userId;
    if (isLocationData?.isMDCSubSegment && listType === 1) {
        fdata['listName'] = SubSegmentExp_List[0].segmentationName;
    }
    if (isLocationData?.isMDCSubSegment) {
        fdata['IsMGEnable'] = 1;
        fdata['listId'] = isLocationData?.listId?.toString();
        fdata['IsAutoRefresh'] = isLocationData?.isAutoRefresh;
        fdata['SubSegmentGUID'] = isLocationData?.SubSegmentGUID || isUniqueID;
        fdata['subSegmentId'] = isLocationData?.subSegmentId ? isLocationData?.subSegmentId : 0;
    }
    fdata['partnerID'] =
        Object.keys(ispartnerDigipopstate)?.length > 0 && ispartnerDigipopstate?.listId === 2
            ? 41
            : updateVersium
            ? 40
            : 0;
    fdata['IsLookAlike'] = isLookAlike;
    if(selectedOption?.id){
        fdata['SaveOption'] = selectedOption?.id
    }
    const handleFinalGroupList = (groups) => {
        let finalGroupList = [];
        groups.forEach((group) => {
            const currentListTypeDetail = getListTypeDetail(group);
            const { key, value } = currentListTypeDetail;
            if (!value) {
                finalGroupList.push(key);
            }
        });
        return finalGroupList;
    };

    const handleFinalExpression = (groupList, isMultiFilter = false, isLookAlike) => {
        const finalExpression = [];
        groupList.forEach((group, gIndex) => {
            finalExpression.push(
                makeExpression(
                    tempData,
                    group,
                    gIndex,
                    attributeTypes,
                    attributeslistCount,
                    lastList,
                    true,
                    res,
                    updateVersium,
                    versiumDataSegment,
                    transformedData_SubSegmentExp,
                    isLocationData,
                    listType,
                    isMultiFilter,
                ),
            );
        });
        return finalExpression?.filter((item) => item?.Expressions?.length > 0);
    };

    let finalGroupList = handleFinalGroupList(filterGroups.groups);
    const lastList = filterGroups.groups[filterGroups.groups?.length - 1];

    // fdata['inputJSON'] = isLocationData?.isMDCSubSegment? [...transformedData_SubSegmentExp,...expressions]  :  expressions;

    fdata['inputJSON'] = handleFinalExpression(finalGroupList, false, isLookAlike);
    const isMultiFilter = checkIsMulticlusion(filterGroups?.groups);
    if (isMultiFilter) {
        fdata['AllGroups'] = handleFinalExpression(filterGroups?.groups, true);
        fdata['IsMGEnable'] = 1;
    }

    return fdata;
};
export const getPotentialCountPayload = (
    userInfoIds,
    transformedData_SubSegmentExp = [],
    locationVersium = {},
    isUniqueID = '',
) => {
    let fdata = {};
    fdata['departmentId'] = userInfoIds.departmentId;
    fdata['clientID'] = userInfoIds.clientId;
    fdata['userId'] = userInfoIds.userId;
    fdata['IsMGEnable'] = 1;
    fdata['listId'] = locationVersium?.listId;
    fdata['IsAutoRefresh'] = locationVersium?.isAutoRefresh;
    fdata['inputJSON'] = transformedData_SubSegmentExp;
    fdata['SubSegmentGUID'] = locationVersium?.subSegmentGUID || isUniqueID;
    return fdata;
};

export {
    INITIAL_STATE,
    STATE_REDUCER,
    ZERO_DAY_FILES,
    temp_VIRTUAL_FIELD_CHECK_ATTRS,
    VIRTUAL_FIELD_CHECK_ATTRS,
    AVAILABLE_GROUPS,
    FORM_INITIAL_STATE,
    FILTER_GROUPS,
    LOOK_A_LIKE_GROUPS,
    getFieldType,
    conditionValue,
    getFieldObject,
    getallAttributes,
    ZERO_DAY_FIELD_NAME,
    ZERO_DAY_ATTRIBUTE_TYPES,
    finalPayload,
    FILTER_GROUPS_PARTNER,
};
export const makeExpressionVersium = (data) => {
    return {
        GroupingOperator: 'AND',
        FilterGroup: 'OriginalBase',
        TotalIncusionQuery: '',
        TotalInclusionCount: '',
        IsLastLi: true,
        LiIndex: 0,
        Expressions: data?.tableDropDown?.filterAttributes.map((e, ind) => {
            return {
                SequenceId: ind,
                Category: 'source',
                Field: data?.tableDropDown?.filterAttributes[ind].pVUIPrintableName,
                Value: data?.tableDropDown?.filterAttributes[ind].pVAttributeValue,
                ConditionOperator: 'equals',
                ExpressionOperator: 'And',
                QueryType: 'hsearch',
                LiId: 'filterBuildComp0',
                ParentdivId: 'crbGroupContainer',
                ParentChildIdentify: null,
                SOLRFieldName: data?.tableDropDown?.filterAttributes[ind].sOLRFieldName || 'v_contact_state_s',
                SOLRCountValue: 10,
                LiwaterfallCount: data?.tableDropDown?.filterCount.toString(),
                LiremainingCount: (data?.tableDropDown?.baseCount - data?.tableDropDown?.filterCount).toString(),
                LiarithmeticSymbol: '-',
                LiUIPrintableName: data?.tableDropDown?.filterAttributes[ind].pVUIPrintableName,
                WithInOperator: null,
                WithInOperatorCountdisable: 'Disable',
                WithInOperatorCountStart: null,
                WithInOperatorCountEnd: null,
                restype: null,
                SourceFrom: null,
                IsVirtualField: false,
            };
        }),
    };
};

export const oneAJSONTemp = [
    {
        v_contact_city_s: [
            'Brooklyn:@@;28',
            'Rochester:@@;6',
            'Chicopee:@@;4',
            'Albany:@@;3',
            'Holyoke:@@;1',
            'Russell:@@;1',
            'Westfield:@@;1',
            'Wilbraham:@@;1',
        ],
    },
    {
        v_demo_ethnicgroup_s: ['Western European:@@;21', 'Eastern European:@@;7', 'Far Eastern:@@;6', 'Hispanic:@@;3'],
    },
    {
        v_demo_gender_s: ['Female:@@;17', 'Male:@@;17'],
    },
    {
        v_contact_state_s: ['NY:@@;37', 'MA:@@;8'],
    },
    {
        v_hfa_household_ss: [
            'Presence of Children:@@;8',
            'Working Woman In Household:@@;4',
            'Veteran In Household:@@;2',
        ],
    },
    {
        v_demo_religion_s: ['Buddhist:@@;5', 'Catholic:@@;3', 'Protestant:@@;1'],
    },
    {
        v_demo_occupation_s: [
            'Other:@@;27',
            'Professional/Technical:@@;5',
            'Administration/Management:@@;3',
            'Craftsmen/Blue Collar:@@;2',
        ],
    },
    {
        v_demo_maritalstatus_s: ['Married:@@;34'],
    },
    {
        Accessories_s: [
            '03-01-1991:@@;1',
            '07-07-1995:@@;1',
            '28-09-2001:@@;1',
            '28-01-2002:@@;1',
            '26-04-2006:@@;1',
            '25-01-2006:@@;1',
            '23-06-1992:@@;1',
            '23-02-2001:@@;1',
            '21-12-2001:@@;1',
            '19-08-1994:@@;1',
            '16-09-2004:@@;1',
            '16-04-2004:@@;1',
            '15-10-1996:@@;1',
            '15-08-2004:@@;1',
            '13-04-1995:@@;1',
            '10-09-2023:@@;1',
            '09-09-2006:@@;1',
            '28-09-2006:@@;1',
        ],
    },
    {
        City_s: ['Chennai:@@;12', 'Kolkata:@@;7', 'Mumbai:@@;7', 'Noida:@@;2', 'Madurai:@@;1', 'Pune:@@;1'],
    },
    {
        Country_s: ['India:@@;5'],
    },
    {
        Hobbies_s: ['Playing:@@;4', 'Reading :@@;2', 'Cricket:@@;1', 'Music:@@;1'],
    },
    {
        Gender_s: ['Male:@@;12', 'Female:@@;8', 'Male :@@;1'],
    },
    {
        Spares_s: ['Cricket:@@;8', 'Football:@@;5', 'Basket ball:@@;2', 'volleyball:@@;2', 'Hockey:@@;1'],
    },
    {
        Designation_s: [
            'Testing:@@;8',
            'Developer:@@;3',
            'QA:@@;3',
            'Lead:@@;1',
            'Manager:@@;1',
            'Quality Analyst:@@;1',
            'Sr Tester:@@;1',
            'Supervisor:@@;1',
            'TL:@@;1',
            'Tester:@@;1',
        ],
    },
    {
        Account_Number_s: [
            '0x215ccbae:@@;1',
            '0x7960ad:@@;1',
            '0x81409835:@@;1',
            '0x81c2470e:@@;1',
            '0x8d91f10d:@@;1',
            '0x9a6c14ff:@@;1',
            '0xa44568fe:@@;1',
            '0xa9e052c9:@@;1',
            '0xaf4e5131:@@;1',
            '0xb6cc597a:@@;1',
            '0xcf575999:@@;1',
            '0xcffcbed0:@@;1',
            '0xd5ecbe95:@@;1',
            '0xd9cf65de:@@;1',
            '0xdb9096da:@@;1',
            '0xe789a4e7:@@;1',
            '0xf3770b0e:@@;1',
            '0x7b5e965c:@@;1',
            '0x73fa6d7e:@@;1',
            '0x21ac3b91:@@;1',
            '0x7221f839:@@;1',
            '0x21bea386:@@;1',
            '0x233da9c3:@@;1',
            '0x27212fdb:@@;1',
            '0x2a4e3675:@@;1',
            '0x2e9567bc:@@;1',
            '0x3d90392a:@@;1',
            '0x3ece5634:@@;1',
            '0x530c03c3:@@;1',
            '0x54a5ca67:@@;1',
            '0x5c64503b:@@;1',
            '0x621ca69b:@@;1',
            '0x66a54dd5:@@;1',
            '0x66fb0e98:@@;1',
            '0x670437c7:@@;1',
            '0x6b2ff7f6:@@;1',
            '0xfe37e282:@@;1',
        ],
    },
    {
        Buying_Purpose_s: [
            '10.2:@@;1',
            '156.22:@@;1',
            '678.12:@@;1',
            '6.55:@@;1',
            '56.77:@@;1',
            '54.654:@@;1',
            '54.123:@@;1',
            '456.12:@@;1',
            '45.12:@@;1',
            '43.12:@@;1',
            '34.88:@@;1',
            '33.44:@@;1',
            '321.23:@@;1',
            '235.55:@@;1',
            '234.23:@@;1',
            '23.45:@@;1',
            '23.12:@@;1',
            '7.0123:@@;1',
        ],
    },
    {
        Email_domain_s: [
            'gmail.com:@@;32',
            'aol.com:@@;11',
            'yahoo.com:@@;11',
            'gmal.com:@@;5',
            'hotmail.com:@@;4',
            'resulticksmail.com:@@;2',
            'msn.com:@@;2',
            'ameritech.net:@@;1',
            'juno.com:@@;1',
            'nyc.rr.com:@@;1',
            'rocketmail.com:@@;1',
        ],
    },
    {
        Language_s: ['Telugu:@@;3', 'Tamil:@@;2'],
    },
    {
        IsEmail_b: ['true:@@;71'],
    },
    {
        IsMobile_b: ['true:@@;34'],
    },
    {
        IsAppID_b: ['false:@@;37', 'true:@@;6'],
    },
    {
        IsWebID_b: ['false:@@;42', 'true:@@;1'],
    },
    {
        Cricketer_s: [
            'Dhoni:@@;6',
            'Sachin:@@;5',
            'SKY:@@;2',
            'Jadeja:@@;1',
            'Kohli:@@;1',
            'Lara:@@;1',
            'Laxman:@@;1',
            'Sehwag:@@;1',
        ],
    },
    {
        Sports_AR_s: ['Cricket:@@;8', 'Football:@@;5', 'Basket ball:@@;2', 'volleyball:@@;2', 'Hockey:@@;1'],
    },
    {
        ImportDescription_ss: [
            'Versium_40_20240829160007261091:@@;1',
            'Versium_40_20240829140227962581:@@;1',
            'Versium_40_20240829135433720844:@@;1',
            'Versium_40_20240829130113666826:@@;1',
            'Versium_40_20240829122121045561:@@;1',
            'Versium_40_20240829102722304125:@@;1',
            'Versium_40_20240829092615365535:@@;1',
            'Versium_40_20240829080643083563:@@;1',
            'Versium_40_20240829071804517056:@@;1',
            'Versium_40_20240828164427183892:@@;1',
            'Versium_40_20240828162618275862:@@;1',
            'Versium_40_20240828163703727894:@@;1',
            'Versium_40_20240828153851796407:@@;1',
            'Versium_40_20240828144452485038:@@;1',
            'Versium_40_20240828125345000484:@@;1',
            'Versium_40_20240827143726009845:@@;1',
            'Versium_40_20240827123239291518:@@;1',
            'Versium_40_20240827094349786351:@@;1',
            'Versium_40_20240827092354278864:@@;1',
            'Versium_40_20240827093513808540:@@;1',
            'Versium_40_20240827064556758484:@@;1',
            'Versium_40_20240827063457824060:@@;1',
            'Versium_40_20240827054334882445:@@;1',
            'asdw3ds:@@;1',
            'Versium_40_20240826090104726683:@@;1',
            'Versium_40_20240826083306876744:@@;1',
            'Versium_40_20240823141146566465:@@;1',
            'null:@@;1',
            'null:@@;1',
            'Versium_40_20240823070733158362:@@;1',
            'Versium_40_20240823065142294082:@@;1',
            'Versium_40_20240823045949060222:@@;1',
            'Versium_40_20240822133511305331:@@;1',
            'Versium_40_20240822135632089629:@@;1',
            'Versium_40_20240821084446192477:@@;1',
            'Versium_40_20240821145733825635:@@;1',
            'Versium_40_20240820115314749837:@@;1',
            'Versium_40_20240820113646708502:@@;1',
            'asasSAADS:@@;1',
            'Versium_40_20240819100839426959:@@;1',
            'Versium_40_20240819084611447318:@@;1',
            'Versium_40_20240819071346119582:@@;1',
            'Versium_40_20240819110819799375:@@;1',
            'Test Target list GT 23 Aug 24:@@;1',
            'Versium_40_20240819064204514727:@@;1',
            'Test target list 23 Aug 24:@@;1',
            'Versium_40_20240819060221177445:@@;1',
            'TL Aug WP Aug 22 2024:@@;1',
            'Versium_40_20240819054836082917:@@;1',
            'TL BID Aug 22 2024:@@;1',
            'Versium_40_20240819052900678016:@@;1',
            'ACL WP TL Aug 22 2024:@@;1',
            'Versium_40_20240819050738264031:@@;1',
            'Test WP Aug 22 2024:@@;1',
            'Versium_40_20240819050348582103:@@;1',
            'wewqq:@@;1',
            'Versium_40_20240819043420585689:@@;1',
            'Versium_40_20240816095552142443:@@;1',
            'Parentupload July25:@@;1',
            'Versium_40_20240814135141865458:@@;1',
            'Parent Test1222:@@;1',
            'Versium_40_20240819062617778723:@@;1',
            'Test List July 16 2024:@@;1',
            'Versium_40_20240814091014546086:@@;1',
            'Web Push internal test 1607:@@;1',
            'Versium_40_20240813114129841173:@@;1',
            'TL July 09 2024:@@;1',
            'Versium_40_20240813113400438461:@@;1',
            'Test MP GT July 9 24:@@;1',
            'Versium_40_20240813111455110534:@@;1',
            'Test target:@@;1',
            'Versium_40_20240813111425958366:@@;1',
            'Test target My list:@@;1',
            'Versium_40_20240812070956427635:@@;1',
            'TL July 03 2024:@@;1',
            'Versium_40_20240809133046609724:@@;1',
            'My Data 02 July 24:@@;1',
            'Versium_40_20240822154416947396:@@;1',
            'Audience Import June 14:@@;1',
            'Versium_40_20240809040814103417:@@;1',
            'Import Audience:@@;1',
            'Versium_40_20240808131705817858:@@;1',
            'Versium_40_20240808115326165839:@@;1',
            'Test list June DNU :@@;1',
            'Versium_40_20240808112506324636:@@;1',
            'Test_target_1106_2:@@;1',
            'Versium_40_20240808094554313766:@@;1',
            'test target 1106_new:@@;1',
            'Versium_40_20240808092315740990:@@;1',
            'test_target_1106:@@;1',
            'Versium_40_20240808091850225267:@@;1',
            'Internal list 1106:@@;1',
            'Versium_40_20240808090314283735:@@;1',
            'Test List BM June:@@;1',
            'Versium_40_20240808083554020000:@@;1',
            'test_target_1006_1:@@;1',
            'Versium_40_20240808083503478422:@@;1',
            'test_target_100624:@@;1',
            'Test MP Internal:@@;1',
            'apitest:@@;1',
            'apitest:@@;1',
        ],
    },
    {
        FileName_ss: [
            ':@@;1',
            ':@@;1',
            ':@@;1',
            ':@@;1',
            ':@@;1',
            ':@@;1',
            ':@@;1',
            ':@@;1',
            ':@@;1',
            ':@@;1',
            ':@@;1',
            ':@@;1',
            ':@@;1',
            ':@@;1',
            ':@@;1',
            ':@@;1',
            ':@@;1',
            ':@@;1',
            ':@@;1',
            ':@@;1',
            ':@@;1',
            ':@@;1',
            ':@@;1',
            ':@@;1',
            ':@@;1',
            ':@@;1',
            ':@@;1',
            ':@@;1',
            ':@@;1',
            ':@@;1',
            ':@@;1',
            ':@@;1',
            ':@@;1',
            ':@@;1',
            ':@@;1',
            ':@@;1',
            ':@@;1',
            ':@@;1',
            'asasSAADS.csv:@@;1',
            ':@@;1',
            ':@@;1',
            ':@@;1',
            ':@@;1',
            'My Test Data.csv:@@;1',
            ':@@;1',
            'My Test Data.csv:@@;1',
            ':@@;1',
            'TL Aug 04 2024.csv:@@;1',
            ':@@;1',
            'TL Aug 04 2024.csv:@@;1',
            ':@@;1',
            'TL Aug 04 2024.csv:@@;1',
            ':@@;1',
            'TL Aug 04 2024.csv:@@;1',
            ':@@;1',
            'wewqq.csv:@@;1',
            ':@@;1',
            ':@@;1',
            'ParentFileTargetlist - July25.csv:@@;1',
            ':@@;1',
            'ParentFileTargetlist - July17.csv:@@;1',
            ':@@;1',
            'TL May 08 2024.csv:@@;1',
            ':@@;1',
            'WP Internal list V1 1607.csv:@@;1',
            ':@@;1',
            'TL May 08 2024.csv:@@;1',
            ':@@;1',
            'Test MP.csv:@@;1',
            ':@@;1',
            'My Test CSV.csv:@@;1',
            ':@@;1',
            'My Test CSV.csv:@@;1',
            ':@@;1',
            'TL May 08 2024.csv:@@;1',
            ':@@;1',
            'My Test Data.csv:@@;1',
            ':@@;1',
            'Audience Import June 14.csv:@@;1',
            ':@@;1',
            'Import Audience.csv:@@;1',
            ':@@;1',
            ':@@;1',
            'Target upload MP.csv:@@;1',
            ':@@;1',
            'Target upload MP.csv:@@;1',
            ':@@;1',
            'Target upload MP.csv:@@;1',
            ':@@;1',
            'Target upload MP.csv:@@;1',
            ':@@;1',
            'Resul Internal List  30Aud.csv:@@;1',
            ':@@;1',
            'Target upload MP.csv:@@;1',
            ':@@;1',
            'Target upload MP.csv:@@;1',
            ':@@;1',
            'Target upload MP.csv:@@;1',
            'Target upload MP.csv:@@;1',
            ':@@;1',
            ':@@;1',
        ],
    },
    {
        Channel_s: ['Email:@@;1', 'SMS:@@;1', 'Mobile App:@@;1', 'Web Push:@@;1'],
    },
];

export const getListMaxValue = (lists, listType) => {
    const matchList = lists.filter((item) => item.startsWith(listType));
    const findMaxValueList = matchList.reduce((maxStr, currStr) => {
        const currNum = parseInt(currStr.match(/\d+$/)?.[0] || '0', 10);
        const maxNum = parseInt(maxStr.match(/\d+$/)?.[0] || '0', 10);
        return currNum > maxNum ? currStr : maxStr;
    }, '');
    if (findMaxValueList === '') {
        return {
            key: listType,
            maxValue: 1,
        };
    } else {
        return {
            key: findMaxValueList,
            maxValue: parseInt(findMaxValueList.match(/\d+$/)?.[0] || '0', 10),
        };
    }
};

export const getListTypeDetail = (listType) => {
    if (listType) {
        const match = listType?.match(/^([a-zA-Z]+)(\d+)$/);
        const result = match ? { key: match[1], value: parseInt(match[2], 10) } : { key: listType, value: 0 };
        return result;
    }
};

export const filterGroupLimitInMultiFilterConfig = {
    inclusionList:  8,
    exclusionList:  4,
};
export const filterGroupLimitInNormalFilterConfig = {
    inclusionList: 1,
    exclusionList: 1,
};

export const availableInclsuionExclusionList = [
    'inclusionLists2',
    'inclusionLists3',
    'inclusionLists4',
    'inclusionLists5',
    'inclusionLists6',
    'inclusionLists7',
    'inclusionLists8',
    'inclusionLists9',
    'inclusionLists10',
    'exclusionLists2',
    'exclusionLists3',
    'exclusionLists4',
    'exclusionLists5',
];

export const checkIsMulticlusion = (groups) => {
    const isExistList = groups?.some((group) => {
        return availableInclsuionExclusionList?.includes(group);
    });

    return isExistList;
};
export const applyLookAlikeAttributes = ({
    isLookAlike,
    recommendedAttributes = [],
    attributesData = [],
    leftPanelAttributes = [],
    searchAttributes = [],
    dispatchState,
}) => {
    if (!dispatchState) return;

    const hasRecommendations =
        Array.isArray(recommendedAttributes) && recommendedAttributes.length > 0;

    const resetLookAlikeFlag = (items = []) =>
        items.map((item) => ({ ...item, isLookAlike: false }));

    if (!hasRecommendations || !isLookAlike) {
        const updatedAttrData = attributesData.map((group) => {
            const key = Object.keys(group).find((k) => Array.isArray(group[k]));
            if (!key) return group;

            return {
                ...group,
                [key]: resetLookAlikeFlag(group[key]),
            };
        });

        const updatedLeftPanel = leftPanelAttributes.map((group) => {
            const updatedGroup = { ...group };

            Object.keys(updatedGroup).forEach((key) => {
                if (Array.isArray(updatedGroup[key])) {
                    updatedGroup[key] = resetLookAlikeFlag(updatedGroup[key]);
                }
            });

            return updatedGroup;
        });

        dispatchState({
            type: 'UPDATE_ATTRIBUTES',
            field: 'default',
            payload: {
                attributesData: updatedAttrData,
                leftPanelAttributes: updatedLeftPanel,
                searchAttributes: resetLookAlikeFlag(searchAttributes),
            },
        });

        return;
    }

    const lookAlikeMap = new Map(
        recommendedAttributes.map((attr) => [
            attr?.attribute || attr?.SOLRFieldName,
            attr,
        ])
    );

    const prioritizeLookAlike = (items = []) => {
        const lookAlikeItems = [];
        const otherItems = [];

        items.forEach((item) => {
            const match = lookAlikeMap.get(item?.sOLRFieldName);

            if (match) {
                lookAlikeItems.push({ ...item, isLookAlike: true, lookAlikeConfig: match });
            } else {
                otherItems.push({ ...item, isLookAlike: false });
            }
        });

        return [...lookAlikeItems, ...otherItems];
    };

    const updatedSearchAttributes = prioritizeLookAlike(searchAttributes);

    const groupedByCategory = updatedSearchAttributes.reduce((acc, item) => {
        const category = item?.category;
        if (!category) return acc;

        if (!acc[category]) acc[category] = [];
        acc[category].push(item);

        return acc;
    }, {});

    const categoryOrder =
        attributesData
            .map((g) => Object.keys(g).find((k) => Array.isArray(g[k])))
            .filter(Boolean) || Object.keys(groupedByCategory);

    const updatedAttrData = categoryOrder.map((category) => ({
        [category]: prioritizeLookAlike(groupedByCategory[category] || []),
    }));

    const leftPanelExpandedState = leftPanelAttributes.reduce((acc, group) => {
        const key = Object.keys(group).find((k) => Array.isArray(group[k]));
        if (key) acc[key] = group?.isExpanded ?? 0;
        return acc;
    }, {});

    const updatedLeftPanel = updatedAttrData.map((group) => {
        const key = Object.keys(group)[0];
        const items = group[key] || [];

        return {
            [key]: items.slice(0, 5), // deterministic
            isExpanded: leftPanelExpandedState[key] ?? 0,
        };
    });

    dispatchState({
        type: 'UPDATE_ATTRIBUTES',
        field: 'default',
        payload: {
            attributesData: updatedAttrData,
            leftPanelAttributes: updatedLeftPanel,
            searchAttributes: updatedSearchAttributes,
        },
    });
};
export const generateShortKeyConfig = (sections) => {
    return Object.fromEntries(
        sections.flatMap(({ prefix, count, labelFn, suffix, customKey = '' }) =>
            Array.from({ length: count }, (_, i) => {
                const key = customKey ? customKey : `${prefix}${i + 1}${suffix}`;
                const value = labelFn(i);
                return [key, value];
            }),
        ),
    );
};

export const normalflowConfig = {
    OriginalBase: 'filterLists',
    MultipleFilter: 'inclusionLists',
    ExclusionFilter: 'exclusionLists',
    IG_LookALike: 'lookALikeAttrLists'
};

export const shortKeyNormalFlowConfig = generateShortKeyConfig([
    {
        prefix: 'IG',
        suffix: '',
        count: 10,
        labelFn: (i) => (i === 0 ? 'filterLists' : i === 1 ? 'inclusionLists' : `inclusionLists${i}`),
    },
    {
        prefix: 'EG',
        suffix: '',
        count: 5,
        labelFn: (i) => (i === 0 ? 'exclusionLists' : `exclusionLists${i + 1}`),
    },
    {
        prefix: 'IG_LookALike',
        suffix: '',
        count: 1,
        labelFn: (i) => ('lookALikeAttrLists'),
        customKey: 'IG_LookALike'
    },
]);
export const shortKeySubSegmentFlowConfig = generateShortKeyConfig([
    {
        prefix: 'IG',
        suffix: '_Subsegment',
        count: 10,
        labelFn: (i) => (i === 0 ? 'filterLists' : i === 1 ? 'inclusionLists' : `inclusionLists${i}`),
    },
    {
        prefix: 'Ex',
        suffix: '_Subsegment',
        count: 5,
        labelFn: (i) => (i === 0 ? 'exclusionLists' : `exclusionLists${i + 1}`),
    },
]);

export const safeParse = (jsonString, fallback) => {
    try {
        if (!jsonString?.trim()) return fallback;
        return JSON.parse(jsonString);
    } catch {
        return fallback;
    }
};

export const solrFieldNameSplit = (str) => {
    const index = str.lastIndexOf('_');

    if (index === -1) {
        return { before: str, last: '' };
    }

    return {
        before: str.slice(0, index),
        last: str.slice(index + 1),
    };
};

export const getFinalAudienceCount = (getValues) => {
  const {
    attributeslistCount = {},
    inclusionAudience = 0,
    zeroDayLists = [],
    filterLists = [],
    inclusionLists = [],
    exclusionLists = [],
    lookALikeAudLists = [],
    lookALikeAttrLists = [],
    attributes = {},
  } = getValues();
  const hasAllLists =
    filterLists.length &&
    zeroDayLists.length &&
    inclusionLists.length &&
    exclusionLists.length &&
    lookALikeAudLists.length &&
    lookALikeAttrLists.length;

  if (hasAllLists) {
    const lastExclusion =
      attributeslistCount?.exclusionLists?.[
        attributeslistCount.exclusionLists.length - 1
      ];
    return lastExclusion?.[0] ?? 0;
  }

  if (filterLists.length && exclusionLists.length) {
    return getValues()?.finalAudienceCount ?? 0;
  }

  if (filterLists.length && inclusionLists.length) {
    return inclusionAudience ?? 0;
  }

  const lastFilter =
    attributeslistCount?.filterLists?.[
      attributeslistCount.filterLists.length - 1
    ];

  return lastFilter?.[0] ?? 0;
};


export const checkCountTakenStatus = (filterGroups, formState) => {
        const allFormStateValue = formState();
        let getAllCurrentAttributes = [];
        filterGroups?.groups?.forEach((group) => {
            const currentListFormStateValue = allFormStateValue?.[group] ?? [];
            getAllCurrentAttributes = [...getAllCurrentAttributes, ...currentListFormStateValue];
        });
        const alreadyTakenBQCount = getAllCurrentAttributes?.some((attribute) => attribute?.isStatus === true);
        return alreadyTakenBQCount

}

export const handlePartnerAttributeData = (partnerAttributes) => {
    const categoryMap= {
        40: 'Versa',
        41: 'DigiPop',
    }
    if(partnerAttributes?.length){
        return partnerAttributes?.map((attribute) => {
            return {
                ...attribute,
                category: attribute?.category || categoryMap[attribute?.partnerId] || 'Unknown',   
            }
        })  
    } else {
        return []
    }
}
