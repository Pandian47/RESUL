import { getYYMMDD } from 'Utils/modules/dateTime';
import { formatName } from 'Utils/modules/formatters';
import { 
    COMPARISON_MAP, 
    COMPARISON_REVERSE_MAP, 
    DISPLAY_TO_SYMBOL_MAP,
    AN_DISPLAY_TO_SYMBOL_MAP,
    SYMBOL_TO_DISPLAY_MAP,
    CUSTOM_VALUE, 
} from './Component/RenderField/constant';
import { get as _get } from 'Utils/modules/lodashReplacements';

const SAME_TRIGGER_SOURCE_NOT_ALLOWED = 'Same trigger source not allowed';

const normalizeDisplayText = (text) => {
    if (!text) return text;
    
    const greaterThanDisplayTexts = [
        COMPARISON_MAP['>'],
        COMPARISON_MAP['isgreaterthan']
    ];
    if (greaterThanDisplayTexts.includes(text)) {
        return COMPARISON_MAP['>']; 
    }
    
    const lessThanDisplayTexts = [
        COMPARISON_MAP['<'],        
        COMPARISON_MAP['islessthan']
    ];
    const formattedText = formatName(text);
    if (lessThanDisplayTexts.includes(text) || lessThanDisplayTexts.includes(formattedText)) {
        return COMPARISON_MAP['<']; 
    }
    
    return text;
};

export const convertComparisonValue = (comparisonValue, fieldType, direction = 'save') => {
    if (!comparisonValue) return '';
    
    const value = typeof comparisonValue === 'object' ? comparisonValue?.value : comparisonValue;
    if (!value) return '';
    
    if (direction === 'save') {
        if (fieldType === 'NR') {
            const normalizedText = normalizeDisplayText(value);
            return DISPLAY_TO_SYMBOL_MAP[normalizedText] || value;
        }
        
        if (fieldType === 'AN') {
            const formattedValue = formatName(value);
            return AN_DISPLAY_TO_SYMBOL_MAP[formattedValue] || value;
        }

        if (fieldType === 'T' || fieldType === 'D' || fieldType === 'SD' || fieldType === 'Boolean') {
            if (SYMBOL_TO_DISPLAY_MAP[value]) {
                const displayText = SYMBOL_TO_DISPLAY_MAP[value];
                return COMPARISON_REVERSE_MAP[displayText] || value;
            }
            return COMPARISON_REVERSE_MAP[value] || value;
        }
        
        return COMPARISON_REVERSE_MAP[value] || value;
    }
    
    if (direction === 'edit') {
        if (fieldType === 'NR') {
            return COMPARISON_MAP[value] || value;
        }
        
        if (fieldType === 'AN') {
            return COMPARISON_MAP[value] || value;
        }
        
        return COMPARISON_MAP[value] || value;
    }
    
    return value;
};
export const FORM_INITIAL_STATE = {
    defaultValues: {
        dynamicListName: '',
        dynamicListID: null,
        departmentID: null,
        RuleCondition: true, //'OR'
        exclusionCondition: false,
        approvalList: {
            name: [{ approverName: '', mandatory: false }],
            requestApproval: true,
            approvalFrom: 'All',
            approvalCount: '2',
            followHierarchy: false,
        },
        addRule: '',
        rule: [
            {
                MatchType: 'All',
                MatchCount: '',
                RuleType: '',
                TriggerName: '',
                pages: '',
                RuleAttributes: [
                    {
                        attributeName: { fieldtype: '', id: '', placeholder: '', value: '' },

                        attributeValue: '',
                        attributeType: '',
                        attributeMultipleValues: [],
                        attributeComparison: '',
                        attributeCustom: [],
                        mandatory: false,
                    },
                ],
            },
        ],
    },
    mode: 'onTouched',
};
export const checkRequestApproval = (name, request, dispatchState) => {
    var nameCheck = false;
    var index;
    for (var i = 0; i < name?.length; i++) {
        if (name[i]?.approverName !== '') {
            nameCheck = true;
        } else {
            index = i;
            break;
        }
    }
    let result = {
        value: nameCheck && request,
        index: index,
    };
    dispatchState({
        type: 'UPDATE',
        payload: result,
        field: 'isRequestApproved',
    });

    return result;
};

export const RULE_ATTRIBUTES_LENGTH_CONFIG = 14;

export const normalizeCustomEventRuleTypeOptions = (data = []) => {
    if (!Array.isArray(data)) {
        return [];
    }

    return data
        .map((item, index) => {
            if (item == null) {
                return null;
            }
            if (typeof item === 'string') {
                return {
                    id: index + 1,
                    value: item,
                    fieldType: 'D',
                };
            }
            if (typeof item === 'object') {
                return {
                    ...item,
                    id: item.id ?? index + 1,
                    value: item.value ?? item.name ?? '',
                    fieldType: item.fieldType ?? item.fieldtype ?? 'D',
                };
            }
            return null;
        })
        .filter(Boolean);
};

/** Extract a primitive string from a dropdown/multi-select stored value (object, array, or scalar). */
export const resolveTriggerDropdownPrimitiveValue = (value) => {
    if (value == null || value === '') {
        return '';
    }
    if (Array.isArray(value)) {
        return value
            .map((item) => resolveTriggerDropdownPrimitiveValue(item))
            .filter(Boolean)
            .join(',');
    }
    if (typeof value === 'object') {
        return value.value ?? value.UIPrintableName ?? value.name ?? value.label ?? '';
    }
    return String(value);
};

const findTriggerDropdownOptionMatch = (item, options = []) => {
    if (!Array.isArray(options) || !options.length) {
        return null;
    }

    if (item != null && typeof item === 'object') {
        const valueText = resolveTriggerDropdownPrimitiveValue(item);
        const idText = item.id != null ? String(item.id) : '';
        return (
            options.find(
                (opt) =>
                    (idText && String(opt.id) === idText) ||
                    resolveTriggerDropdownPrimitiveValue(opt) === valueText,
            ) ?? null
        );
    }

    const text = String(item ?? '');
    return options.find((opt) => resolveTriggerDropdownPrimitiveValue(opt) === text) ?? null;
};

/** Map saved string values (e.g. `["20"]`) to dropdown rows so Kendo chips render. */
export const coerceValuesToTriggerDropdownOptions = (values = [], options = []) => {
    if (!Array.isArray(values) || !values.length) {
        return Array.isArray(values) ? values : [];
    }

    const normalizedOptions = normalizeTriggerAttributeDropdownOptions(options);

    return values.map((item) => findTriggerDropdownOptionMatch(item, normalizedOptions) ?? item);
};

export const coerceValueToTriggerDropdownOption = (value, options = []) => {
    if (value == null || value === '') {
        return value;
    }

    return findTriggerDropdownOptionMatch(value, options) ?? value;
};

/** Coerce API trigger value lists (e.g. `["N"]`) into Kendo-safe `{ id, value }` rows. */
export const normalizeTriggerAttributeDropdownOptions = (data = []) => {
    if (!Array.isArray(data)) {
        return [];
    }

    return data
        .map((item, index) => {
            if (item == null) {
                return null;
            }
            if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
                const text = String(item);
                return {
                    id: index + 1,
                    value: text,
                    UIPrintableName: text,
                };
            }
            if (typeof item === 'object') {
                const value =
                    item.value ??
                    item.name ??
                    item.UIPrintableName ??
                    item.formStatus ??
                    '';
                const id = item.id ?? item.formId ?? item.FormId ?? index + 1;
                return {
                    ...item,
                    id,
                    value: value || String(id),
                    UIPrintableName: item.UIPrintableName ?? value ?? String(id),
                };
            }
            return null;
        })
        .filter(Boolean);
};

export const isCustomEventValueOptionsList = (data = []) =>
    Array.isArray(data) &&
    data.length > 0 &&
    data.every((item) => typeof item === 'number' || (typeof item === 'string' && item.trim() !== '' && !Number.isNaN(Number(item))));

export const resolveCustomEventsStateFromRedux = (customAttributes) => {
    if (!customAttributes?.field) {
        return { field: '', data: [] };
    }

    if (isCustomEventValueOptionsList(customAttributes.data)) {
        return { field: customAttributes.field, data: [] };
    }

    return {
        field: customAttributes.field,
        data: normalizeCustomEventRuleTypeOptions(customAttributes.data),
    };
};

export const buildCustomEventValuesCacheKey = (columnName = '', attributevalue = '') =>
    `custom-events-${columnName ?? ''}-${attributevalue ?? ''}`;

export const buildFieldTriggerValuesKey = (fldname, fieldType, levelNo) => {
    if (fieldType === '2D' && levelNo != null && levelNo !== '') {
        return `${fldname}|${levelNo}`;
    }
    return fldname;
};

/** Trigger sources that use their own value APIs or free-text — never call GetTriggerAttributeValues. */
export const TRIGGER_IDS_SKIP_ATTRIBUTE_VALUES_API = [9, 10, 11, 14];

export const shouldSkipTriggerAttributeValuesApi = (triggerId) =>
    TRIGGER_IDS_SKIP_ATTRIBUTE_VALUES_API.includes(Number(triggerId));

/** Target list: duplicate when the same rule type is selected more than once in a group. */
export const TRIGGER_IDS_DUPLICATE_BY_RULE_TYPE = [9];

export const COMMUNICATION_NAME_TRIGGER_ID = 10;

export const shouldDuplicateCheckByRuleTypeOnly = (triggerId) =>
    TRIGGER_IDS_DUPLICATE_BY_RULE_TYPE.includes(Number(triggerId));

export const shouldDuplicateCheckByCommunicationNameRule = (triggerId) =>
    Number(triggerId) === COMMUNICATION_NAME_TRIGGER_ID;

const normalizeCommunicationNameComparisonType = (value) => {
    if (value == null || value === '') {
        return '';
    }

    if (typeof value === 'object') {
        return String(value?.value ?? value?.label ?? value?.id ?? '').trim();
    }

    return String(value).trim();
};

const normalizeCommunicationNameChannel = (value) => {
    if (value == null || value === '') {
        return '';
    }

    if (typeof value === 'object') {
        return String(value?.type ?? value?.apiValue ?? value?.label ?? value?.id ?? '').trim();
    }

    return String(value).trim();
};

const normalizeCommunicationNameStatus = (value) => {
    if (value == null || value === '') {
        return '';
    }

    if (typeof value === 'object') {
        return String(value?.label ?? value?.status ?? value?.id ?? '').trim();
    }

    return String(value).trim();
};

const getCommunicationNameRuleFingerprint = (rule) => {
    const ruleType = String(rule?.attributeName?.value ?? '').trim();
    const comparisonType = normalizeCommunicationNameComparisonType(rule?.attributeComparison);
    const channel = normalizeCommunicationNameChannel(rule?.attributeChannelValues);
    const status = normalizeCommunicationNameStatus(rule?.attributeActionValues);

    if (!ruleType || !comparisonType || !channel || !status) {
        return '';
    }

    return [ruleType, comparisonType, channel, status].join('|');
};

/**
 * Rule types that need GetTriggerAttributeValues for value dropdowns.
 * Subscription Form fieldType T (Page URL, Form submission date, etc.) uses free-text input — skip API.
 */
export const shouldFetchTriggerAttributeValuesForRule = (selectedRuleType, triggerId) => {
    if (shouldSkipTriggerAttributeValuesApi(triggerId)) {
        return false;
    }

    const fieldType = selectedRuleType?.fieldType ?? selectedRuleType?.fieldtype;
    const numericTriggerId = Number(triggerId);

    return (
        fieldType === 'D' ||
        fieldType === 'SD' ||
        fieldType === '2D' ||
        (numericTriggerId === 14 && fieldType === 'T') ||
        (numericTriggerId === 15 && fieldType === 'T')
    );
};

export const isTwoDimensionalTriggerPayload = (payload = {}) => {
    const fieldType = String(payload?.fieldType ?? payload?.fieldtype ?? '').toUpperCase();
    if (fieldType === '2D') {
        return true;
    }

    const levelNo = Number(payload?.levelNo);
    const attributeName = formatName(payload?.attributeName ?? '');
    return (levelNo === 1 || levelNo === 2) && ['forms', 'attributes', 'eventbrite'].includes(attributeName);
};

export const extractTriggerAttributeValuesList = (result) => {
    if (!result) {
        return [];
    }
    if (Array.isArray(result)) {
        return normalizeTriggerAttributeDropdownOptions(result);
    }
    if (Array.isArray(result?.data)) {
        return normalizeTriggerAttributeDropdownOptions(result.data);
    }
    if (Array.isArray(result?.data?.data)) {
        return normalizeTriggerAttributeDropdownOptions(result.data.data);
    }
    return [];
};

export const buildTriggerDdlCacheKey = (selectedRuleType, fieldType, levelNo, options = {}) => {
    const { value = '', id = '' } = selectedRuleType || {};
    if (!value && !id) {
        return '';
    }
    const triggerSourceId = options.triggerSourceId ?? '';
    const triggerddlValue = options.triggerddlValue ?? '';
    let key = `${value}-${id}`;
    if (fieldType === '2D' && levelNo != null && levelNo !== '') {
        key = `${key}-${levelNo}`;
        if (triggerSourceId) {
            key = `${key}-${triggerSourceId}`;
        }
        if (triggerddlValue) {
            key = `${key}-${triggerddlValue}`;
        }
        if (options.formId) {
            key = `${key}-${options.formId}`;
        }
        if (levelNo === 2 && options.columnName) {
            key = `${key}-${options.columnName}`;
        }
    } else if (triggerSourceId || triggerddlValue) {
        key = `${key}-${triggerSourceId}-${triggerddlValue}`;
    }
    return key;
};

export const formatFieldTriggerValuesData = (payload, data = []) => {
    const attributeName = payload?.attributeName;
    const values = normalizeTriggerAttributeDropdownOptions(Array.isArray(data) ? data : []);

    if (isTwoDimensionalTriggerPayload(payload)) {
        const key = Number(payload?.levelNo) === 2 ? `${attributeName}2` : attributeName;
        return { [key]: values };
    }

    return values;
};

const RULE_ATTRIBUTE_FIELD_KEY = /^rule\.(\d+)\.RuleAttributes\[(\d+)\](.*)$/;
const RULE_FIELD_KEY = /^rule\.(\d+)\.(.*)$/;
const CUSTOM_EVENT_FIELD_KEY =
    /^rule\.(\d+)\.RuleAttributes\[(\d+)\]\.attributeCustom\[(\d+)\](.*)$/;

export const pruneFieldTriggerValuesAfterAttributeRemove = (
    fieldTriggerValues = {},
    ruleIndex,
    removedAttributeIndex,
) => {
    const next = {};

    Object.entries(fieldTriggerValues).forEach(([key, value]) => {
        const match = key.match(RULE_ATTRIBUTE_FIELD_KEY);
        if (!match) {
            next[key] = value;
            return;
        }

        const [, rIdx, attrIdx, suffix] = match;
        if (Number(rIdx) !== ruleIndex) {
            next[key] = value;
            return;
        }

        const idx = Number(attrIdx);
        if (idx === removedAttributeIndex) {
            return;
        }
        if (idx > removedAttributeIndex) {
            next[`rule.${ruleIndex}.RuleAttributes[${idx - 1}]${suffix}`] = value;
            return;
        }
        next[key] = value;
    });

    return next;
};

export const pruneFieldTriggerValuesAfterCustomEventRemove = (
    fieldTriggerValues = {},
    ruleIndex,
    attributeIndex,
    removedCustomIndex,
) => {
    const next = {};

    Object.entries(fieldTriggerValues).forEach(([key, value]) => {
        const match = key.match(CUSTOM_EVENT_FIELD_KEY);
        if (!match) {
            next[key] = value;
            return;
        }

        const [, rIdx, attrIdx, customIdx, suffix] = match;
        if (Number(rIdx) !== ruleIndex || Number(attrIdx) !== attributeIndex) {
            next[key] = value;
            return;
        }

        const idx = Number(customIdx);
        if (idx === removedCustomIndex) {
            return;
        }
        if (idx > removedCustomIndex) {
            next[
                `rule.${ruleIndex}.RuleAttributes[${attributeIndex}].attributeCustom[${idx - 1}]${suffix}`
            ] = value;
            return;
        }
        next[key] = value;
    });

    return next;
};

export const pruneFieldTriggerValuesAfterRuleRemove = (fieldTriggerValues = {}, removedRuleIndex) => {
    const next = {};

    Object.entries(fieldTriggerValues).forEach(([key, value]) => {
        const match = key.match(RULE_FIELD_KEY);
        if (!match) {
            next[key] = value;
            return;
        }

        const ruleIdx = Number(match[1]);
        const rest = match[2];

        if (ruleIdx === removedRuleIndex) {
            return;
        }
        if (ruleIdx > removedRuleIndex) {
            next[`rule.${ruleIdx - 1}.${rest}`] = value;
            return;
        }
        next[key] = value;
    });

    return next;
};

export const clearFieldTriggerValuesForRuleAttributes = (fieldTriggerValues = {}, ruleIndex) => {
    const prefix = `rule.${ruleIndex}.RuleAttributes[`;

    return Object.fromEntries(
        Object.entries(fieldTriggerValues).filter(([key]) => !key.startsWith(prefix)),
    );
};

export const clearFieldTriggerValuesForPaths = (fieldTriggerValues = {}, keys = []) => {
    if (!keys?.length) {
        return fieldTriggerValues;
    }

    const next = { ...fieldTriggerValues };
    keys.forEach((key) => {
        delete next[key];
    });
    return next;
};

export const STATE_REDUCER = (state, action) => {
    const { type, field, payload } = action;
    // console.log('Form :::: ', type, field, payload);
    switch (type) {
        case 'UPDATE':
            return {
                ...state,
                [field]: payload,
            };
        case 'UPDATE_ATTRIBUTES':
            return {
                ...state,
            };
        case 'UPDATE_FORM':
            // console.log('form id attribute :::::::::::: ', payload);
            return {
                ...state,
                formAttributeId: {
                    ...state.formAttributeId,
                    [field]: payload,
                },
            };
        case 'UPDATE_FORM_DROP_DOWN':
            return {
                ...state,
                formAttrDropdownChange: payload,
            };
        case 'UPDATE_MANDATORY':
            // console.log('form id attribute :::::::::::: ', payload, field);
            return {
                ...state,
                mandatory: {
                    ...state.mandatory,
                    [field]: payload,
                },
            };
        case 'UPDATE_DATA_ATTRIBUTE_ID':
            return {
                ...state,
                dataAttributeId: {
                    ...state.dataAttributeId,
                    [field]: payload,
                },
            };
        case 'UPDATE_ATTRIBUTE_VALUES':
            return {
                ...state,
                filterLabels: { ...state.filterLabels, [payload.attrName]: payload.values },
            };
        case 'UPDATE_FIELD_TRIGGER_VALUES': {
            const { fieldName, isLoading, triggerValues } = payload;
            const current = state.fieldTriggerValues?.[fieldName] ?? { isLoading: false, triggerValues: {} };

            return {
                ...state,
                fieldTriggerValues: {
                    ...state.fieldTriggerValues,
                    [fieldName]: {
                        isLoading: isLoading ?? current.isLoading,
                        triggerValues: triggerValues !== undefined ? triggerValues : current.triggerValues,
                    },
                },
            };
        }
        case 'UPDATE_TRIGGER_DDL_VALUES':{
            const { fieldName, data} = payload;
            return {
                ...state,
                triggerDdlValues: { ...state.triggerDdlValues, [fieldName]: data },
            };
        }
        case 'RESET_DROPDOWN_STATE':
            return {
                ...state,
                fieldTriggerValues: {},
                triggerDdlValues: {},
                formAttributeId: {},
                dataAttributeId: {},
                formAttributes: false,
                formAttrDropdownChange: false,
                filterLabels: {},
            };
        case 'REMOVE_ATTRIBUTE_FIELD_TRIGGER_VALUES':
            return {
                ...state,
                fieldTriggerValues: pruneFieldTriggerValuesAfterAttributeRemove(
                    state.fieldTriggerValues,
                    payload.ruleIndex,
                    payload.attributeIndex,
                ),
            };
        case 'REMOVE_CUSTOM_EVENT_FIELD_TRIGGER_VALUES':
            return {
                ...state,
                fieldTriggerValues: pruneFieldTriggerValuesAfterCustomEventRemove(
                    state.fieldTriggerValues,
                    payload.ruleIndex,
                    payload.attributeIndex,
                    payload.customIndex,
                ),
            };
        case 'REMOVE_RULE_FIELD_TRIGGER_VALUES':
            return {
                ...state,
                fieldTriggerValues: pruneFieldTriggerValuesAfterRuleRemove(
                    state.fieldTriggerValues,
                    payload.ruleIndex,
                ),
            };
        case 'CLEAR_RULE_FIELD_TRIGGER_VALUES':
            return {
                ...state,
                fieldTriggerValues: clearFieldTriggerValuesForRuleAttributes(
                    state.fieldTriggerValues,
                    payload.ruleIndex,
                ),
            };
        case 'CLEAR_FIELD_TRIGGER_VALUES_KEYS':
            return {
                ...state,
                fieldTriggerValues: clearFieldTriggerValuesForPaths(
                    state.fieldTriggerValues,
                    payload?.keys ?? [],
                ),
            };
        default:
            return state;
    }
};

export const INITIAL_STATE = {
    isValidListname: null,
    isUpdateList: false,
    isRequestApproved: {
        value: false,
        index: 0,
    },
    ruleGroups: {
        groups: ['ruleGroup1'],
        activeGroup: 'ruleGroup1',
        disableGroups: [],
        exclusionListGroup: false,
    },
    isValidRule: true,
    matchTypeValue: false,
    sourceRefresh: false,
    listInfoModal: false,
    formAttributes: false,
    formAttributeId: {},
    mandatory: {},
    formAttrDropdownChange: false,
    dataAttributeId: {},
    fullAttributeJSONValues: [],
    filterLabels: {},
    fieldTriggerValues: {},
    triggerDdlValues: {},
};

export const ATTRIBUTE_TYPES = {
    status: true,
    message: 'success - Fetch Trigger Source attributes',
    data: [
        {
            id: 12,
            name: 'Browser',
            fieldType: 'D',
            value: [
                { id: 1, name: 'Chrome' },
                { id: 2, name: 'IE' },
                { id: 3, name: 'Mozilla' },
                { id: 4, name: 'Safari' },
            ],
        },
        {
            id: 302,
            name: 'Custom events',
            fieldType: 'D',
            value: CUSTOM_VALUE,
        },
        {
            id: 1045,
            name: 'Custom events date',
            fieldType: 'AN',
            value: null,
        },
        {
            id: 11,
            name: 'Device',
            fieldType: 'D',
            value: [
                { id: 1, name: 'Desktop' },
                { id: 2, name: 'Mobile' },
                { id: 3, name: 'Tablet' },
            ],
        },
        {
            id: 10,
            name: 'Language',
            fieldType: 'D',
            value: [
                { id: 1, name: 'English' },
                { id: 2, name: 'French' },
                { id: 3, name: 'German' },
                { id: 4, name: 'Italian' },
                { id: 5, name: 'Japanese' },
                { id: 6, name: 'Spanish' },
            ],
        },
        {
            id: 14,
            name: 'Last visit',
            fieldType: 'AN',
            value: null,
        },
        {
            id: 948,
            name: 'Last visited page',
            fieldType: 'URL',
            value: null,
        },
        {
            id: 9,
            name: 'Location',
            fieldType: 'T',
            value: '',
        },
        {
            id: 947,
            name: 'Login',
            fieldType: 'Boolean',
            value: [
                { id: 1, name: 'Yes' },
                { id: 2, name: 'No' },
            ],
        },
        {
            id: 3,
            name: 'New visitors',
            fieldType: 'NR',
            value: null,
        },
        {
            id: 970,
            name: 'Notification disabled',
            fieldType: 'TR',
            value: null,
        },
        {
            id: 13,
            name: 'Operating system',
            fieldType: 'D',
            value: [
                { id: 1, name: 'Android' },
                { id: 2, name: 'iOS' },
                { id: 3, name: 'Linux' },
                { id: 4, name: 'Windows' },
                { id: 5, name: 'wWindows phone' },
            ],
        },
        {
            id: 6,
            name: 'Page depth',
            fieldType: 'D',
            value: [
                { id: 1, name: 'Less than 25%' },
                { id: 2, name: '26% to 50%' },
                { id: 3, name: '51% to 75%' },
                { id: 4, name: 'More than 75%' },
            ],
        },
        {
            id: 945,
            name: 'Page in',
            fieldType: 'Boolean',
            value: null,
        },
        {
            id: 946,
            name: 'Page out',
            fieldType: 'Boolean',
            value: [
                { id: 1, name: 'Yes' },
                { id: 2, name: 'No' },
            ],
        },
        {
            id: 5,
            name: 'Page views',
            fieldType: 'D',
            value: [
                { id: 1, name: 'Less than 2' },
                { id: 2, name: '2 to 4' },
                { id: 3, name: '5 to 7' },
                { id: 4, name: 'More than 7' },
            ],
        },
        {
            id: 1013,
            name: 'Referral source',
            fieldType: 'D',
            value: [
                { id: 1, name: 'Email' },
                { id: 2, name: 'SMS' },
                { id: 3, name: 'Web push' },
                { id: 4, name: 'Mobile push' },
                { id: 5, name: 'QR' },
                { id: 6, name: 'Facebook' },
                { id: 7, name: 'Twitter' },
                { id: 8, name: 'Linked In' },
                { id: 9, name: 'Google Adwords' },
                { id: 10, name: 'Direct Traffic' },
            ],
        },
        {
            id: 4,
            name: 'Returning visitors',
            fieldType: 'D',
            value: [
                { id: 1, name: 'Less than 2' },
                { id: 2, name: '2 to 4' },
                { id: 3, name: '5 to 7' },
                { id: 4, name: 'More than 7' },
            ],
        },
        {
            id: 7,
            name: 'Session duration',
            fieldType: 'D',
            value: [
                { id: 1, name: 'Less than 10secs' },
                { id: 2, name: '11secs to 30secs' },
                { id: 3, name: '31secs to 60secs' },
                { id: 4, name: 'More than 60secs' },
            ],
        },
        {
            id: 15,
            name: 'Sign up',
            fieldType: 'Boolean',
            value: null,
        },
        {
            id: 944,
            name: 'Time spent on page',
            fieldType: 'D',
            value: [
                { id: 1, name: 'Less than 10secs' },
                { id: 2, name: '11secs to 30secs' },
                { id: 3, name: '31secs to 60secs' },
                { id: 4, name: 'More than 60secs' },
            ],
        },
        {
            id: 8,
            name: 'Traffic source',
            fieldType: 'D',
            value: [
                { id: 1, name: 'Direct traffic' },
                { id: 2, name: 'Email' },
                { id: 3, name: 'SEO' },
                { id: 4, name: 'Social/Paid media' },
            ],
        },
        {
            id: 949,
            name: 'User type',
            fieldType: 'D',
            value: [
                { id: 1, name: 'identified user' },
                { id: 2, name: 'Known user' },
            ],
        },
        {
            id: 2,
            name: 'When a user visits a specific page',
            fieldType: 'URL',
            value: null,
        },
    ],
};

const handleCompareValue = (currentAttribute, triggerId) => {
    if (!currentAttribute) return '';
    
    const value = currentAttribute?.attributeName?.value;
    const fieldType = currentAttribute?.attributeName?.fieldType;
    const comparsion = currentAttribute?.attributeComparison;
    
    if ((value === 'Forms' || value === 'Attributes' || value === 'Event brite' || value === 'Latitude & Longitude - Radius') && fieldType === '2D') {
        return '=';
    }
    
    if (!comparsion && value === 'Location URL') {
        return '=';
    }
    return convertComparisonValue(comparsion, fieldType, 'save');
};

const handleSourceName = (currentAttribute) => {
    if (currentAttribute) {
        const value = currentAttribute?.attributeName?.value;
        const fieldType = currentAttribute?.attributeName?.fieldType;
        if ((value === 'Forms' || value === 'Attributes' || value === 'Event brite' || value === 'Latitude & Longitude - Radius') && fieldType === '2D') {
            return value;
        } else {
            return '';
        }
    } else {
        return '';
    }
};
const handleName = (currentAttribute) => {
    if (currentAttribute) {
        const value = currentAttribute?.attributeName?.value;
        const fieldType = currentAttribute?.attributeName?.fieldType;
        const comparsion = currentAttribute?.attributeComparison;
        if ((value === 'Forms' || value === 'Attributes' || value === 'Event brite') && fieldType === '2D') {
            return comparsion?.value;
        } else if (value === 'Latitude & Longitude - Radius' && fieldType === '2D') {
            return `${currentAttribute?.attributeFrom || ''}:${currentAttribute?.attributeTo || ''}`;
        } else {
            return value;
        }
    } else {
        return '';
    }
};

const handleFrequenyRecencyStatus = (currentRuleAttribute) => {
    let isUpdatePeriod = false;
    let isUpdateFrequency = false;

    if (currentRuleAttribute?.isPeroidValue) {
        isUpdatePeriod = true;
    }
    if (
        currentRuleAttribute?.TimerFrom &&
        currentRuleAttribute?.TimerTo &&
        currentRuleAttribute?.frequency &&
        currentRuleAttribute?.recency
    ) {
        isUpdateFrequency = true;
    }

    return {
        isUpdatePeriod,
        isUpdateFrequency,
    };
};

function handleAttributeValueInSave(currentRule, k) {
    const attribute = currentRule?.RuleAttributes[k];
    const fieldType = attribute?.attributeName?.fieldType;
    const triggerId = currentRule?.TriggerName?.triggerId;
    const attributeComparison = attribute?.attributeComparison;
    const attributeMultipleValues = attribute?.attributeMultipleValues;
    const attributeTo = attribute?.attributeTo;
    const attributeValue = attribute?.attributeValue;

    // Operators that use attributeValue instead of attributeMultipleValues (even for fieldType 'D')
    const usesAttributeValue = attributeComparison === 'Like' || 
                               attributeComparison === 'Starts with' || 
                               attributeComparison === 'Ends with' || 
                               attributeComparison === 'Does not like' ||
                               attributeComparison === 'Has value' ||
                               attributeComparison === 'Has no value';

    if (fieldType === 'D' || (triggerId === 14 && fieldType === 'T') || (triggerId === 15 && fieldType === 'T')) {
        // For operators that use attributeValue, return attributeValue instead of attributeMultipleValues
        if (usesAttributeValue) {
            return resolveTriggerDropdownPrimitiveValue(attributeValue);
        }
        return (attributeMultipleValues ?? [])
            .map((item) => resolveTriggerDropdownPrimitiveValue(item))
            .filter(Boolean)
            .join();
    }

    if ((triggerId === 18 || triggerId === 5) && fieldType === 'T' && formatName(attribute?.attributeName?.value) === 'locationurl') {
        return `${attribute?.attributeValue}${JSON.stringify(attribute?.mapList)}` || '';
    }

    if (attributeComparison === 'Between') {
        return `${attributeTo},${attributeValue}` || '';
    }

    // Geofence Action (and any multi-select stored as array of objects)
    if (Array.isArray(attributeValue) && attributeValue.length > 0) {
        return attributeValue
            .map((v) => (typeof v === 'object' && v?.value != null ? v.value : v))
            .filter(Boolean)
            .join(',');
    }

    return resolveTriggerDropdownPrimitiveValue(attributeValue);
}

export const BuildCreatePayload = (data, temp, rule, location, crossDeviceStatus) => {
    temp.rule.RuleGroups = rule?.length;
    temp.rule.RuleCondition = data?.RuleCondition ? 'AND' : 'OR';
    temp.rule.Version = 5;
    temp._ruleJSON.noOfRules = rule?.length;
    temp._ruleJSON.Version = 5;
    temp._ruleJSON.RuleGroups = [];
    var tempRuleJSONArr = [];
    for (var j = 0; j < rule?.length; j++) {
        var checkTriggerType = rule[j]?.TriggerName?.triggerId === 9 && rule[j]?.TriggerName?.triggerId <= 11;
        temp = {
            ...temp,
            rule: {
                ...temp.rule,
                [`RuleMatch${j + 1}`]: {
                    Combination: rule[j]?.MatchType,
                    Count:
                        rule[j]?.MatchType === 'All'
                            ? rule[j].RuleAttributes?.length
                            : parseInt(rule[j]?.MatchCount, 10),
                },
            },
        };
        var tempRule = [];
        var tempRuleJSON = [];
        let formId = '';
        for (var k = 0; k < rule[j]?.RuleAttributes?.length; k++) {
            var customValues = [];

            if (
                (formatName(rule[j]?.RuleAttributes[k]?.attributeName?.value) === 'forms' ||
                    formatName(rule[j]?.RuleAttributes[k]?.attributeName?.value) === 'eventbrite') &&
                rule[j]?.RuleAttributes[k]?.attributeName?.fieldType === '2D'
            ) {
                formId = rule[j]?.RuleAttributes[k]?.attributeComparison?.id;
            } else if (
                (rule[j].TriggerName.triggerId === 18 || rule[j].TriggerName.triggerId === 5) &&
                rule[j]?.RuleAttributes[k]?.attributeName?.fieldType === '2D'
            ) {
                formId = rule[j]?.RuleAttributes[k]?.attributeComparison?.id ?? 0;
            }

            for (var m = 0; m < rule[j]?.RuleAttributes[k]?.attributeCustom?.length; m++) {
                let tempCustom = {
                    crowNo: (m + 1).toString(),
                    parentId: 'crbGroup_1',
                    currentRowId: 'isMandatory2',
                    cGroupElementId: 'Id_CustomEvent_Group_' + (k + 1).toString(),
                    cCurrentRowId: 'Id_CustomEvent_Row_' + (m + 1).toString(),
                    cId: (m + 1).toString(),
                    cName: rule[j]?.RuleAttributes[k]?.attributeCustom[m]?.attributeName?.value,
                    cValue:
                        rule[j]?.RuleAttributes[k]?.attributeCustom[m]?.attributeName?.fieldType === 'D'
                            ? (rule[j]?.RuleAttributes[k]?.attributeCustom[m]?.attributeMultipleValues ?? [])
                                  .map((item) => resolveTriggerDropdownPrimitiveValue(item))
                                  .filter(Boolean)
                                  .join()
                            : resolveTriggerDropdownPrimitiveValue(
                                  rule[j]?.RuleAttributes[k]?.attributeCustom[m]?.attributeValue,
                              ),
                    cFilterValue: convertComparisonValue(
                        rule[j]?.RuleAttributes[k]?.attributeCustom[m]?.attributeComparison,
                        rule[j]?.RuleAttributes[k]?.attributeCustom[m]?.attributeName?.fieldType,
                        'save'
                    ),
                    cFilterText: convertComparisonValue(
                        rule[j]?.RuleAttributes[k]?.attributeCustom[m]?.attributeComparison,
                        rule[j]?.RuleAttributes[k]?.attributeCustom[m]?.attributeName?.fieldType,
                        'save'
                    ),
                    // cFilterValue: rule[j]?.RuleAttributes[k]?.attributeCustom[m]?.attributeComparison.toLowerCase(),
                    // cFilterText: rule[j]?.RuleAttributes[k]?.attributeCustom[m]?.attributeComparison,
                    cFieldType: rule[j]?.RuleAttributes[k]?.attributeCustom[m]?.attributeName?.fieldType,
                };
                customValues.push(tempCustom);
            }
            let tempRuleObj = {
                Name: handleName(rule[j]?.RuleAttributes[k]),
                FieldType:
                    (rule[j].TriggerName.triggerId === 14 || rule[j].TriggerName.triggerId === 15) &&
                    rule[j]?.RuleAttributes[k]?.attributeName?.fieldType === 'T'
                        ? 'D'
                        : rule[j]?.RuleAttributes[k]?.attributeName?.fieldType,
                Mandatory: rule[j]?.RuleAttributes[k]?.mandatory ? '1' : '0',
                CompareValue: checkTriggerType
                    ? ''
                    : handleCompareValue(rule[j]?.RuleAttributes[k], rule[j].TriggerName.triggerId),
                Value: checkTriggerType ? '' : handleAttributeValueInSave(rule[j], k),
                SourceName: handleSourceName(rule[j]?.RuleAttributes[k]),
                RudimentaryTableName: !!rule[j]?.pages?.id ? rule[j]?.pages?.id : '',
                Id: rule[j]?.RuleAttributes[k]?.attributeName?.id,
                formId: formId || '',
                Customevent_attributes: checkTriggerType ? [] : [...customValues],
                dataAttributeId: rule[j]?.RuleAttributes[k]?.attributeComparison?.DataattributeID ?? 0,
                isFrequency: parseInt(rule[j]?.RuleAttributes[k]?.attributeName?.isPeriod, 10) ? true : false,
                isRecencyFrequency: parseInt(rule[j]?.RuleAttributes[k]?.attributeName?.isRecencyFrequency, 10)
                    ? true
                    : false,
                Frequency: rule[j]?.RuleAttributes[k]?.isPeroidValue || {},
                RecencyFrequency: {
                    DateRange_From: getYYMMDD(rule[j]?.RuleAttributes[k]?.TimerFrom) || '',
                    DateRange_To: getYYMMDD(rule[j]?.RuleAttributes[k]?.TimerTo) || '',
                    Times: parseInt(rule[j]?.RuleAttributes[k]?.frequency, 10) || 0,
                    durationType: rule[j]?.RuleAttributes[k]?.recency,
                },
                ...handleFrequenyRecencyStatus(rule[j]?.RuleAttributes[k]),
            };
            const isCommunicationName = rule[j].TriggerName.triggerId===10;
            if(isCommunicationName){
                 tempRuleObj.attributeChannelValues = rule[j]?.RuleAttributes[k]?.attributeChannelValues|| {};
                 tempRuleObj.attributeActionValues = rule[j]?.RuleAttributes[k]?.attributeActionValues|| {};
            }
            // Check if the rule is Geofence and add Geofence-specific fields
            const isGeofence = rule[j]?.RuleAttributes[k]?.attributeName?.value === 'Geofence';
            if (isGeofence) {
                const geofenceData = rule[j]?.RuleAttributes[k]?.attributeComparison;
                const geofenceId = geofenceData?.geoFenceId || geofenceData;
                const attributeName = geofenceData?.identifier || '';
                
                // Get cluster/regions data - check if it's stored in the rule attributes
                let attributeValue = [];
                if (geofenceData?.cluster && Array.isArray(geofenceData.cluster)) {
                    // If cluster data is in the geofence object
                    attributeValue = geofenceData.cluster
                }
                else if(geofenceData?.regions && Array.isArray(geofenceData.regions)) {
                    attributeValue = geofenceData.regions;
                }
                else if (rule[j]?.RuleAttributes[k]?.attributeMultipleValues && Array.isArray(rule[j]?.RuleAttributes[k]?.attributeMultipleValues)) {
                    // If cluster data is stored in attributeMultipleValues
                    attributeValue = rule[j]?.RuleAttributes[k]?.attributeMultipleValues.map((region) => ({
                        lat: region.latitude || region.lat,
                        long: region.longitude || region.long,
                        placename: region.placeName || region.placename,
                    }));
                } 
                
                // Add Geofence-specific fields to the payload
                tempRuleObj.GeofenceId = geofenceId || 0;
                tempRuleObj.AttributeValue = attributeValue;
                tempRuleObj.AttributeName = attributeName;
            }
            
            const isLatLonRadius = rule[j]?.RuleAttributes[k]?.attributeName?.value === 'Latitude & Longitude - Radius';
            if (isLatLonRadius) {
                tempRuleObj.Range = rule[j]?.RuleAttributes[k]?.range || '';
            }
            
            if (
                rule[j]?.RuleAttributes[k]?.attributeName?.value === 'Custom events' &&
                rule[j]?.RuleAttributes[k]?.attributeComparison === 'Contains'
            ) {
                tempRuleObj.Value = rule[j]?.RuleAttributes[k]?.attributeValue;
                // tempRuleObj.Value = rule[j]?.RuleAttributes[k]?.attributeMultipleValues.join();
            }
            let ruleJSON = {
                ...tempRuleObj,
                AttributeCondition: 'AND',
            };
            tempRule.push(tempRuleObj);
            tempRuleJSON.push(ruleJSON);
        }
        let tempRuleJSONValues = {
            MatchType: rule[j]?.MatchType,
            MatchCount:
                rule[j]?.MatchType === 'All' ? rule[j].RuleAttributes?.length : parseInt(rule[j]?.MatchCount, 10),
            RuleType: rule[j]?.RuleType,
            TriggerId: rule[j]?.TriggerName?.triggerId.toString(),
            TriggerName: rule[j]?.TriggerName?.triggerName,
            RuleCondition: data?.RuleCondition || 'AND',
            RuleGroups: [...tempRuleJSON],
        };
        tempRuleJSONArr.push(tempRuleJSONValues);
        temp = {
            ...temp,
            rule: {
                ...temp.rule,
                [`RuleGroup${j + 1}`]: {
                    MatchType: rule[j]?.MatchType,
                    MatchCount:
                        rule[j]?.MatchType === 'All'
                            ? rule[j].RuleAttributes?.length
                            : parseInt(rule[j]?.MatchCount, 10),

                    RuleType: rule[j]?.RuleType,
                    TriggerName: rule[j]?.TriggerName?.triggerId.toString(),
                    RuleAttributes: [...tempRule],
                },
                timezone:
                    data?.timeZoneDetail?.timezoneId && data?.timeZoneDetail?.timezoneName
                        ? `${data?.timeZoneDetail?.timezoneId}||${data?.timeZoneDetail?.timezoneName}`
                        : '',
                isCrossDevice: data?.crossDevice && crossDeviceStatus ? data?.crossDevice : false,
            },
            _ruleJSON: [...tempRuleJSONArr],
        };
    }
    temp.IsRequestApproval = data?.approvalList?.requestApproval;
    for (var l = 0; l < data?.approvalList?.name?.length; l++) {
        let tempRA = {
            DynamicListApprovalID: '0',
            approverEmail: data.approvalList?.name[l].approverName.email,
            approverName: data.approvalList?.name[l].approverName.firstName,
            isMandatory: data.approvalList?.name[l]?.mandatory || false,
            approvalCondition: _get(data?.approvalList, 'approvalFrom', 'ALL'),
            noOfApprover: data.approvalList?.name?.length,
            isHierarchy: _get(data?.approvalList, 'followHierarchy', true),
            priority: l + 1,
            domainName: location?.origin,
            parameter: location?.pathname + '?DynamicListId={ListId}' + '&rfa=true',
            approverCount:
                _get(data?.approvalList, 'approvalFrom', 'ALL') === 'Any'
                    ? _get(data?.approvalList, 'approvalCount', 0)
                    : data?.approvalList?.name?.length,
        };
        temp.RequestApproval.push(tempRA);
    }
    return temp;
};

export const MatchTypeCheck = (ruleData, type, count) => {
    if (type === 'Any') {
        // if (ruleData?.length >= count) return true;
        // else return false;
        return true;
    } else if (type === 'All') return true;
    else {
        return false;
    }
};
export const repeatedValuesCheck = (ruleData, name, triggerId, isCustom = false, isHandleChange = false) => {
    if (Number(triggerId) === 11) return [true];
    if (!ruleData?.length || ruleData.length === 1) return [true];

    if (shouldDuplicateCheckByRuleTypeOnly(triggerId)) {
        for (let i = 0; i < ruleData.length; i++) {
            for (let j = i + 1; j < ruleData.length; j++) {
                const ruleTypeI = ruleData[i]?.attributeName?.value;
                const ruleTypeJ = ruleData[j]?.attributeName?.value;
                if (ruleTypeI && ruleTypeJ && ruleTypeI === ruleTypeJ) {
                    return [false, `${name}[${j}].attributeName`, '', j];
                }
            }
        }
        return [true];
    }

    if (shouldDuplicateCheckByCommunicationNameRule(triggerId)) {
        for (let i = 0; i < ruleData.length; i++) {
            for (let j = i + 1; j < ruleData.length; j++) {
                const fingerprintI = getCommunicationNameRuleFingerprint(ruleData[i]);
                const fingerprintJ = getCommunicationNameRuleFingerprint(ruleData[j]);
                if (fingerprintI && fingerprintJ && fingerprintI === fingerprintJ) {
                    return [false, `${name}[${j}].attributeName`, '', j];
                }
            }
        }
        return [true];
    }

    const compareValues = (i, j, fieldType) => {
        const path = `${name}[${j}]`;

        switch (fieldType) {
            case 'D': {
                const valI = ruleData[i]?.attributeMultipleValues || [];
                const valJ = ruleData[j]?.attributeMultipleValues || [];

                if (valI.length === 1 && valJ.length === 1 && valI[0] === valJ[0]) {
                    return [false, `${path}.attributeMultipleValues`, [], j];
                }
                if (valJ.length > 0 && valJ.some((item) => valI.includes(item))) {
                    return [false, `${path}.attributeMultipleValues`, [], j];
                }
                break;
            }

            case 'SD':
            case 'T':
            case 'NR': {
                const compI = ruleData[i]?.attributeComparison;
                const compJ = ruleData[j]?.attributeComparison;

                // Handle "Has value" and "Has no value" operators - they don't need value comparison
                const isHasValueI = compI === 'Has no value' || compI === 'Has value';
                const isHasValueJ = compJ === 'Has no value' || compJ === 'Has value';
                
                if (isHasValueI && isHasValueJ) {
                    // Both are "Has value" or "Has no value" - they are duplicates if operators match
                    if (compI === compJ) {
                        return [false, `${path}.attributeComparison`, '', j];
                    }
                    return null;
                }

                if ((compI === 'Between' || compI === '[]') && (compJ === 'Between' || compJ === '[]')) {
                    const fromI = parseFloat(ruleData[i]?.attributeTo);
                    const toI = parseFloat(ruleData[i]?.attributeValue);
                    const fromJ = parseFloat(ruleData[j]?.attributeTo);
                    const toJ = parseFloat(ruleData[j]?.attributeValue);

                    if (!isNaN(fromI) && !isNaN(toI) && !isNaN(fromJ) && !isNaN(toJ)) {
                        if(fromI === fromJ && toI === toJ) {
                            return [false, `${path}.attributeTo`, '', j];
                        }
                    }
                }
                else {
                    // Operators that use attributeMultipleValues (Contains, Is equal to, Is not equal to, Does not contain)
                    const usesMultipleValuesI = compI === 'Contains' || compI === 'Is equal to' || compI === 'Is not equal to' || compI === 'Does not contain';
                    const usesMultipleValuesJ = compJ === 'Contains' || compJ === 'Is equal to' || compJ === 'Is not equal to' || compJ === 'Does not contain';
                    
                    // Both operators must use the same field type for comparison
                    if (usesMultipleValuesI && usesMultipleValuesJ) {
                        // Compare attributeMultipleValues for these operators
                        const valI = ruleData[i]?.attributeMultipleValues || [];
                        const valJ = ruleData[j]?.attributeMultipleValues || [];
                        
                        if (valI.length > 0 && valJ.length > 0) {
                            // Check if there's any overlap in values
                            if (valI.some((item) => valJ.includes(item)) || valJ.some((item) => valI.includes(item))) {
                                return [false, `${path}.attributeMultipleValues`, [], j];
                            }
                        }
                    } else if (!usesMultipleValuesI && !usesMultipleValuesJ) {
                        // Compare attributeValue for operators like Like, Starts with, Ends with, Does not like
                        const valI = String(ruleData[i]?.attributeValue || '').trim();
                        const valJ = String(ruleData[j]?.attributeValue || '').trim();
                        
                        // If both values are the same and non-empty, they are duplicates
                        if (valI === valJ && valI !== '') {
                            return [false, `${path}.attributeValue`, '', j];
                        }
                    }
                }
                break;
            }

            case 'AN':
                if ((ruleData[i]?.attributeValue ?? 0) - (ruleData[j]?.attributeValue ?? 0) === 0) {
                    const hasPeriodI = ruleData[i]?.attributeName?.isPeriod && ruleData[i]?.isPeroidValue;
                    const hasPeriodJ = ruleData[j]?.attributeName?.isPeriod && ruleData[j]?.isPeroidValue;
                    if (hasPeriodI && hasPeriodJ) {
                        if (ruleData[i]?.isPeroidValue?.key === ruleData[j]?.isPeroidValue?.key) {
                            return [false, `${path}.attributeValue`, '', j];
                        }
                        return null;
                    } else {
                        return [false, `${path}.attributeValue`, '', j];
                    }
                    return null;
                }
                break;

            case 'TR': {
                const different =
                    ruleData[i]?.attributeValue?.toLocaleString() !== ruleData[j]?.attributeValue?.toLocaleString();
                return [different, `${path}.attributeValue`, '', j];
            }
        }

        return null;
    };

    for (let i = 0; i < ruleData.length; i++) {
        for (let j = i + 1; j < ruleData.length; j++) {
            const a = ruleData[i];
            const b = ruleData[j];

            if (a?.attributeName?.value !== b?.attributeName?.value) continue;

            // Special case: fieldType = 2D
            if (b?.attributeName?.fieldType === '2D') {
                // Check if attributeComparison has geoFenceId (for Geofence) or value (for other 2D types)
                const hasGeoFenceIdA = typeof a?.attributeComparison === 'object' && a?.attributeComparison !== null && 'geoFenceId' in a.attributeComparison;
                const hasGeoFenceIdB = typeof b?.attributeComparison === 'object' && b?.attributeComparison !== null && 'geoFenceId' in b.attributeComparison;
                
                if (hasGeoFenceIdA && hasGeoFenceIdB) {
                    // Compare using geoFenceId (for Geofence-like structures)
                    const geoFenceIdA = a?.attributeComparison?.geoFenceId;
                    const geoFenceIdB = b?.attributeComparison?.geoFenceId;
                    if (geoFenceIdA === geoFenceIdB && a?.attributeValue === b?.attributeValue) {
                        return [false, `${name}[${j}].attributeComparison`, '', j];
                    }
                } else {
                    // For other 2D types (Forms, Attributes, Event brite, etc.) - compare using value property
                    if (
                        a?.attributeComparison?.value === b?.attributeComparison?.value &&
                        a?.attributeValue === b?.attributeValue
                    ) {
                        return [false, `${name}[${j}].attributeComparison`, '', j];
                    }
                }
                continue;
            }

            if (a?.attributeComparison === b?.attributeComparison) {
                const fieldType = b?.attributeName?.fieldType || b?.attributeName?.fieldtype;
                
                // Handle "Has value" and "Has no value" operators - they are duplicates if operators match
                const isHasValueA = a?.attributeComparison === 'Has no value' || a?.attributeComparison === 'Has value';
                const isHasValueB = b?.attributeComparison === 'Has no value' || b?.attributeComparison === 'Has value';
                
                if (isHasValueA && isHasValueB) {
                    // Both are "Has value" or "Has no value" - they are duplicates
                    return [false, `${name}[${j}].attributeComparison`, '', j];
                }

                if (a?.attributeName?.value === 'Custom events' && b?.attributeComparison === 'Contains') {
                    const result = compareValues(i, j, fieldType);
                    if (result) return result;
                } else {
                    const result = compareValues(i, j, fieldType);
                    if (result) return result;
                }
            }
        }
    }

    return [true];
};

export const repeatedGroupValuesCheck = (allRule, name, triggerId) => {
    let triggerName = [];
    let pagesValue = [];
    let duplicateIndex = -1;
    let sameGroup = false;

    allRule?.forEach((rule) => {
        if (triggerName.includes(rule?.TriggerName?.triggerName)) {
            if (pagesValue.includes(rule?.pages?.value)) {
                sameGroup = true;
            }
        } else {
            triggerName.push(rule?.TriggerName?.triggerName);
            pagesValue.push(rule?.pages?.value);
        }
    });

    if (sameGroup) {
        const buildData = {};

        allRule.forEach((rule) => {
            if (rule.RuleAttributes) {
                const summary = rule.RuleAttributes.reduce((acc, current) => {
                    const key =
                        typeof current.attributeComparison === 'object'
                            ? current.attributeComparison?.value?.replaceAll(' ', '')
                            : current.attributeComparison?.replaceAll(' ', '');
                    const fieldType = current.attributeName?.fieldType;
                    const isHasValue = current.attributeComparison === 'Has no value' || current.attributeComparison === 'Has value';

                    switch (fieldType) {
                        case 'D':
                            acc.push({
                                attributeName: current.attributeName?.value,
                                key,
                                values: current.attributeMultipleValues.sort(),
                            });
                            break;
                        case '2D':
                        case 'SD':
                        case 'T':
                        case 'AN':
                        case 'NR':
                        case 'TR':
                            // For "Has value" and "Has no value", use empty array as values since they don't have values
                            acc.push({
                                attributeName: current.attributeName?.value,
                                key,
                                values: isHasValue ? [] : [current.attributeValue],
                            });
                            break;
                    }

                    return acc;
                }, []);

                buildData[rule?.RuleType?.replaceAll(' ', '')] = summary;
            }
        });

        function checkForDuplicate(data) {
            const inclusionGroups = ['InclusionGroup1', 'InclusionGroup2'];
            const exclusionGroup = data['Exclusion'];

            if (Object.keys(data)?.includes('Rule')) {
                const ruleGroup = data['Rule'];
                // Check for duplicates between the Rule group and the Exclusion group
                if (exclusionGroup) {
                    for (let ruleItem of ruleGroup) {
                        for (let exclusionItem of exclusionGroup) {
                            if (triggerId === 9 && ruleItem.attributeName === exclusionItem.attributeName) {
                                return {
                                    message: `Duplicate found between Rule and Exclusion group`,
                                    group: 'Exclusion',
                                    duplicateItem: ruleItem,
                                };
                            } else if (
                                ruleItem.attributeName === exclusionItem.attributeName &&
                                exclusionItem.key === ruleItem.key &&
                                JSON.stringify(ruleItem.values) === JSON.stringify(exclusionItem.values)
                            ) {
                                return {
                                    message: `Duplicate found between Rule and Exclusion group`,
                                    group: 'Exclusion',
                                    duplicateItem: ruleItem,
                                };
                            }
                        }
                    }
                }
            } else {
                // Check for duplicates between inclusion groups
                for (let i = 0; i < inclusionGroups?.length; i++) {
                    for (let j = i + 1; j < inclusionGroups?.length; j++) {
                        const group1 = data[inclusionGroups[i]];
                        const group2 = data[inclusionGroups[j]];

                        for (let item1 of group1) {
                            for (let item2 of group2) {
                                if (triggerId === 9 && item2.attributeName === item1.attributeName) {
                                    return {
                                        message: `Duplicate found between Rule and Exclusion group`,
                                        group: 'InclusionGroup2',
                                        duplicateItem: item2,
                                    };
                                } else if (item1.attributeName === item2.attributeName && item1.key === item2.key) {
                                    const commonValues = item1.values.filter((value1) => item2.values.includes(value1));

                                    if (commonValues?.length > 0) {
                                        return {
                                            message: `Duplicate found between ${inclusionGroups[i]} and ${inclusionGroups[j]}`,
                                            group: 'InclusionGroup2',
                                            duplicateItem: item1,
                                        };
                                    }
                                }
                            }
                        }
                    }
                }

                // Check for duplicates between inclusion groups and the exclusion group
                if (exclusionGroup) {
                    for (let i = 0; i < inclusionGroups?.length; i++) {
                        const group = data[inclusionGroups[i]];

                        for (let item1 of group) {
                            for (let exclusionItem of exclusionGroup) {
                                if (
                                    item1.attributeName === exclusionItem.attributeName &&
                                    item1.key === exclusionItem.key
                                ) {
                                    const commonValues = item1?.values?.filter((value1) =>
                                        exclusionItem?.values?.includes(value1),
                                    );

                                    if (commonValues?.length > 0) {
                                        return {
                                            message: `Duplicate found between ${inclusionGroups[i]} and Exclusion group`,
                                            group: inclusionGroups[i],
                                            duplicateItem: item1,
                                        };
                                    }
                                }
                            }
                        }
                    }
                }
            }

            return { message: 'No duplicates found.' };
        }

        const result = checkForDuplicate(buildData);
        // console.log('result: ', result);

        if (result.message !== 'No duplicates found.') {
            allRule.forEach((rule) => {
                if (rule.RuleType?.replaceAll(' ', '') === result?.group) {
                    rule?.RuleAttributes?.forEach((attribute, idx) => {
                        const fieldType = attribute.attributeName?.fieldType;
                        result?.duplicateItem?.attributeName === attribute?.attributeName?.value;
                        if (
                            triggerId === 9 &&
                            result?.duplicateItem?.attributeName === attribute?.attributeName?.value
                        ) {
                            duplicateIndex = idx;
                        } else if (
                            result?.duplicateItem?.attributeName === attribute?.attributeName?.value &&
                            (result?.duplicateItem?.key === typeof attribute?.attributeComparison) === 'object'
                                ? attribute?.attributeComparison?.value?.replaceAll(' ', '')
                                : attribute?.attributeComparison?.replaceAll(' ', '')
                        ) {
                            const duplicateValues = result.duplicateItem.values;
                            switch (fieldType) {
                                case 'D':
                                    if (
                                        duplicateValues.every((value) =>
                                            attribute?.attributeMultipleValues?.includes(value),
                                        )
                                    ) {
                                        duplicateIndex = idx;
                                    }
                                    break;
                                case '2D':
                                case 'SD':
                                case 'T':
                                case 'AN':
                                case 'NR':
                                case 'TR':
                                    const isHasValue = attribute?.attributeComparison === 'Has no value' || attribute?.attributeComparison === 'Has value';
                                    // For "Has value" and "Has no value", check if duplicateValues is empty array
                                    if (isHasValue && duplicateValues.length === 0) {
                                        duplicateIndex = idx;
                                    } else if (!isHasValue && duplicateValues.every((value) => [attribute?.attributeValue]?.includes(value))) {
                                        duplicateIndex = idx;
                                    }
                            }
                        }
                    });
                }
            });
        }
        return {
            duplicateIndex,
            result: result,
        };
    } else {
        return {
            duplicateIndex: -1,
            result: null,
        };
    }
};

export const ADD_GROUP = [
    {
        id: 1,
        value: 'Inclusion',
        disabe: false,
    },
    {
        id: 2,
        value: 'Exclusion',
        disabe: false,
    },
];

export const createRuleData = (data) => {
    let temp = {
        dynamicListName: data?.dynamicListName,
        RuleCondition: 'AND',
        RuleGroups: 1,
        RuleMatch1: { Combination: 'All', Count: '' },
        RuleSummary: '',
        Version: 5,
        RuleGroup1: {},
        from: data?.from,
    };
    let ruleGroup = {
        MatchCount: '',
        MatchType: 'All',
        RuleType: 'Rule',
        TriggerName: data?.dashboard === 'web' ? '1' : '5',
        RuleAttributes: [],
    };
    let ruleAttributes = [
        {
            CompareValue: 'isequalto',
            Customevent_attributes: [],
            FieldType: 'D',
            Id: data?.dashboard === 'web' ? 1322 : 1394,
            Mandatory: '0',
            Name: data?.ruleType ? data?.ruleType : 'Custom events',
            RudimentaryTableName: data?.dashboard === 'web' ? data?.isWeb?.id : data?.isMobile?.appGuid,
            SourceName: '',
            Value: data?.eventName,
            formId: '',
        },
    ];
    ruleGroup.RuleAttributes = ruleAttributes;
    temp.RuleGroup1 = ruleGroup;
    return temp;
};

// edit flow handle attribute values

export const handleAttributeName = (findTriggerSource, currentAttribute, findTriggerAttributes) => {
    const triggerId = findTriggerSource[0]?.triggerId;
    const fieldType = currentAttribute?.FieldType;
    const sourceName = currentAttribute?.SourceName;
    const id = currentAttribute?.Id;

    if ((triggerId === 13 || triggerId === 27 || ((triggerId === 18 || triggerId === 5) && sourceName === 'Latitude & Longitude - Radius')) && fieldType === '2D') {
        return {
            fieldType: fieldType,
            id: parseInt(id, 10), // Ensure ID is converted to a number
            placeholder: 'Select',
            value: sourceName,
        };
    } else {
        return findTriggerAttributes[0];
    }
};

export const handleAttributeComparison = (currentAttribute, findTriggerSource, getAttributeValue) => {
    const fieldType = currentAttribute.FieldType;
    const compareValue = currentAttribute.CompareValue;
    const name = currentAttribute.Name;
    const sourceName = currentAttribute.SourceName;
    const triggerId = findTriggerSource[0]?.triggerId;
    
    if (!compareValue) return '';
    
    if (triggerId === 13 || triggerId === 27 || triggerId === 18) {
        if (fieldType !== 'T' && fieldType !== 'AN') {
            return getAttributeValue(
                currentAttribute.formId,
                triggerId === 13 || triggerId === 27 ? name : compareValue,
                sourceName,
                1,
                compareValue,
            );
        }
    }
    
    if (fieldType === '2D') {
        return compareValue?.length > 0 
            ? `${compareValue.charAt(0).toUpperCase()}${compareValue.slice(1)}`
            : compareValue;
    }
    
    return convertComparisonValue(compareValue, fieldType, 'edit');
};

export const periodRangeValues = [
    { key: 1, value: 'Days' },
    { key: 2, value: 'Hours' },
    { key: 3, value: 'Minutes' },
];

const getSplitValues = (value, delimiter = ',') => value?.split(delimiter) || [];

function getAttributeEditValue(ruleAttribute, checkTriggerType, triggerSource) {
    const { Value, CompareValue } = ruleAttribute || {};

    const triggerId = triggerSource?.[0]?.triggerId;
    const isTrigger18Or5Equal = (triggerId === 18 || triggerId === 5) && CompareValue === '=';

    if (checkTriggerType) {
        return '';
    }

    // Operators that use attributeValue as a simple string (not comma-separated)
    // Check both API values (from server) and display values (converted)
    const usesSimpleValue = CompareValue === 'Like' || 
                           CompareValue === 'Startswith' || 
                           CompareValue === 'Endswith' || 
                           CompareValue === 'Doesnotlike' ||
                           CompareValue === 'Starts with' ||
                           CompareValue === 'Ends with' ||
                           CompareValue === 'Does not like';

    // For "Has value" and "Has no value", always return empty string (they don't need values)
    const isHasValueOperator = CompareValue === 'hasvalue' ||
                               CompareValue === 'hasnovalue' ||
                               CompareValue === 'Has value' ||
                               CompareValue === 'Has no value';

    if (isHasValueOperator) {
        // For "Has value" and "Has no value", return empty string
        return '';
    }

    if (usesSimpleValue) {
        // For these operators, Value is a simple string, return it directly
        return Value || '';
    }

    if (CompareValue === '[]') {
        return getSplitValues(Value)[1] || '';
    }

    if (isTrigger18Or5Equal && formatName(ruleAttribute?.Name) === 'locationurl') {
        return getSplitValues(Value, '^')[0] || '';
    }

    return getSplitValues(Value)
        .map((part) => part.split(':@@;')[0])
        .join(',');
}

function getAttributeFrom(ruleAttribute, triggerSource) {
    const { Name, Value, CompareValue } = ruleAttribute || {};
    const triggerId = triggerSource?.[0]?.triggerId;
    const isTrigger18Or5Equal = (triggerId === 18 || triggerId === 5) && CompareValue === '=';

    if (isTrigger18Or5Equal) {
        return getSplitValues(Name, ':')[0] || '';
    }

    if (CompareValue === '[]') {
        return getSplitValues(Value)[0] || '';
    }

    return '';
}

function getAttributeTo(ruleAttribute, triggerSource) {
    const { Name, Value, CompareValue } = ruleAttribute || {};
    const triggerId = triggerSource?.[0]?.triggerId;
    const isTrigger18Or5Equal = (triggerId === 18 || triggerId === 5) && CompareValue === '=';

    if (isTrigger18Or5Equal) {
        return getSplitValues(Name, ':')[1] || '';
    }

    if (CompareValue === '[]') {
        return getSplitValues(Value)[0] || '';
    }

    return '';
}

function getRange(ruleAttribute, triggerSource) {
    const { Range, CompareValue } = ruleAttribute || {};
    const triggerId = triggerSource?.[0]?.triggerId;
    const isTrigger18Or5Equal = (triggerId === 18 || triggerId === 5) && CompareValue === '=';

    if (isTrigger18Or5Equal) {
        if (Range !== undefined && Range !== null && Range !== '') {
            return Range;
        }
        // Fallback: try to extract from Name for backward compatibility with old data
        const { Name } = ruleAttribute || {};
        return getSplitValues(Name, ':')[2] || '';
    }

    return '';
}

export const extractAttributeValuesInEditFlow = (ruleAttribute, triggerSource, checkTriggerType) => {
    return {
        attributeValue: getAttributeEditValue(ruleAttribute, checkTriggerType, triggerSource),
        attributeFrom: getAttributeFrom(ruleAttribute, triggerSource),
        attributeTo: getAttributeTo(ruleAttribute, triggerSource),
        range: getRange(ruleAttribute, triggerSource),
    };
};

 export const validateDuplicateTriggerSource = (value, index, allRule) => {
    const selectValue = _get(value, 'triggerName', '');

    if (!selectValue) return true;

    const isExclusionGroup = (ruleType) => ruleType === 'Exclusion';
    const currentIsExclusion = isExclusionGroup(allRule?.[index]?.RuleType);

    const isDuplicate = allRule?.some((item, idx) => {
        if (idx === index) return false;

        const otherIsExclusion = isExclusionGroup(item?.RuleType);

        // Inclusion and Exclusion may use the same trigger source
        if (currentIsExclusion !== otherIsExclusion) {
            return false;
        }

        return _get(item, 'TriggerName.triggerName', '') === selectValue;
    });

    return isDuplicate ? SAME_TRIGGER_SOURCE_NOT_ALLOWED : true;
};
