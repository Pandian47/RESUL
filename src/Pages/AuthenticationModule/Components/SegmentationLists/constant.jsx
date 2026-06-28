import _isNil from 'lodash/isNil';
import {
    finalPayload,
    getListMaxValue,
    getListTypeDetail,
} from 'Pages/AuthenticationModule/Audience/Pages/TargetListCreation/constant';
import { normalizeDisplayText } from 'Utils/modules/stringUtils';
import { finalPayload as twinFinalPayload } from 'Pages/AuthenticationModule/Audience/Pages/TargetListCreations/constant';
import {
    allGroupAudienceGroup,
    allGroupAudienceGroup_Partner,
    get_allGroupAdhocListSubsegment_waterfallcount,
    get_allGroupSubsegment_waterfallcount,
} from 'Reducers/audience/targetListCreation/request';

const VIEW_COUNT = 'Click here to view the count';
const DUPLICATE = 'Duplicate';
const REMOVE = 'Remove';
export const addPartnerError =
    'Partner attribute is not eligible in this group. This group contains Brand attributes only.';
export const addBrandError =
    'Brand attribute is not eligible in this group. This group contains Partner attributes only.';
const EXCLUSIONSWITCHOPTIONS = ['Merge', 'Unmerge'];

const handleSelectedList = (payload, group, filterLabels, fieldName, attributeField) => {
    const isExclusion = group?.includes('Exclusion');

    const commonKeys = {
        attributeType: 'Is equal to',
        isSwitched: fieldName === 'lookALikeAttrLists' ? false : true,
        isRunenabled: false,
        isLoading: false,
        isStatus: false,
    };

    if (payload?.isLookAlike && group === 'lookALikeAttrLists') {
        let data = handleAttributeDropDownWithSortData(fieldName, filterLabels, payload);
        const fieldData = handleMultiSelectDropDownData(data);

        const config = payload?.lookAlikeConfig || {};

        const solType = String(config?.SOLRFieldName?.split('_')?.pop() || '');
        const fieldType = String(payload?.fieldType || '');

        const typeKey = `${solType}_${fieldType}`;

        switch (typeKey) {
            case 's_1':
            case 's_':
            case '_1':
                if (Array.isArray(config?.dropdownvalues) && !!config.dropdownvalues.length) {
                    const dropValues = fieldData?.filter((item) => config.dropdownvalues.includes(item?.data));
                    commonKeys.attributeValue = dropValues;
                }
                break;

            case 'i_3':
            case 'i_':
            case '_3':
            case "i_4":
                if (
                    typeof config?.dropdownvalues === 'object' &&
                    !!config?.dropdownvalues?.min &&
                    !!config?.dropdownvalues?.max
                ) {
                    commonKeys.attributeType = 'Between';
                    commonKeys.attributeValue = config.dropdownvalues.min;
                    commonKeys.attributeValueOne = config.dropdownvalues.max;
                }
                break;

            case 'dt_4':
            case 'd_8':
            case 'dt_':
            case 'd_':
            case '_4':
            case '_8':
                break;
            default:
                return payload;
        }
    }

    if (isExclusion) {
        commonKeys.isSwitched = false;
        commonKeys.WithInOperatorCount = 'off';
    }

    switch (String(payload?.fieldType)) {
        case '1':
            return {
                ...payload,
                ...commonKeys,
                isListload: false,
            };

        case '3':
        case '4':
        case '8':
            return {
                ...payload,
                ...commonKeys,
            };

        default:
            return payload;
    }
};
export const checkArrayType = (arr) => {
    if (!Array.isArray(arr)) return 'Not an array';

    if (arr.every((item) => typeof item === 'object' && item !== null && !Array.isArray(item))) {
        return 'Array of objects';
    }

    if (arr.every((item) => typeof item === 'string')) {
        return 'Array of strings';
    }

    return 'Mixed or other type';
};

export const handleAttributeDropDownWithSortData = (fieldName, filterLabels, attributeField) => {
    if (!attributeField?.sOLRFieldName) return [];

    const sfieldName = attributeField.sOLRFieldName;
    let data = filterLabels?.[sfieldName] || [];

    const noSortFields = [
        'ImportDescription_ss',
        'FileName_ss',
        'Subscriptionform_d',
        'v_h_esthhldincome_s',
        'v_f_networth_s',
        'v_h_home_value_s',
        'v_f_creditrating_s',
        'ZeroDayFiles',
        'v_h_esthhldincome_s',
        'v_demo_female_age_group_ss',
        'v_demo_male_age_group_ss',
        'v_demo_people_age_group_ss',
        'v_demo_unknown_gender_age_group_ss',
    ];
    if (!noSortFields.includes(sfieldName)) {
        data = [...data].sort((a, b) => {
            if (typeof a === 'string' && typeof b === 'string') {
                return normalizeDisplayText(a).localeCompare(normalizeDisplayText(b));
            }
            return 0;
        });
    }

    if (sfieldName === 'Remotedatasource_s') {
        if (checkArrayType(data) !== 'Array of objects') {
            data = data.map((item) => {
                const [name, id] = item.split('|');
                const idSplit = id?.split(':@');
                return { name: normalizeDisplayText(name), id: Number(idSplit[0] || 0) };
            });
        }
    }
    if (sfieldName === 'Subscriptionform_d') {
        if (checkArrayType(data) !== 'Array of objects') {
            data = data.map((item) => {
                const [RecipientFormID, FormName] = item.split('|');
                const FormNameSplit = FormName?.split(':@');
                return { FormName: normalizeDisplayText(FormNameSplit[0] ?? ''), RecipientFormID };
            });
        }
    }
    if (sfieldName === 'Campaign_name_s') {
        if (checkArrayType(data) !== 'Array of objects') {
            data = data.map((item) => {
                const [campaignName, campaignShortCode] = item.split('||');
                return { campaignName: normalizeDisplayText(campaignName), campaignShortCode };
            });
        }
    }
    return data;
};

export const handleMultiSelectDropDownData = (data) => {
    const finalData = data?.map((item, index) => {
        const splitValue = item?.split(':@');
        const value = normalizeDisplayText(splitValue[0] ?? '');
        const count = splitValue[1]?.split('@;')[1] ?? 0;
        return {
            id: index,
            data: value,
            count,
        };
    });
    return finalData;
};
const getallAttributes = (attributes) => {
    const {
        filterLists,
        zeroDayLists = [],
        inclusions = [],
        exclusions = [],
        lookALikeAudLists = [],
        lookALikeAttrLists = [],
    } = attributes;
    // const inclusions = inclusionLists?.length ? inclusionLists : [];
    // const exclusions = exclusionLists?.length ? exclusionLists : [];
    const getCurrentAttributes = [
        ...filterLists,
        ...zeroDayLists,
        ...inclusions,
        ...exclusions,
        ...lookALikeAudLists,
        ...lookALikeAttrLists,
    ];
    return getCurrentAttributes.findIndex(
        ({ attributeValue, attributeValueOne, attributeType, fieldType, sOLRFieldName, communicationName }) => {
            if (attributeType === 'Has no value' || attributeType === 'Has value') return false;
            if (!attributeValue && sOLRFieldName !== 'Campaign_name_s') return true;
            else if (Array.isArray(attributeValue) && !attributeValue?.length) return true;
            else if (
                (parseInt(fieldType, 10) === 3 || parseInt(fieldType, 10) === 4 || parseInt(fieldType, 10) === 8) &&
                (attributeType === 'Between' || attributeType === 'Not between')
            ) {
                if (!attributeValueOne) return true;
            }
            // else if (attributeValue instanceof Date) return false;
            return false;
        },
    );
};

const getGroupNameByLists = (fieldName) => {
    const currentListDetail = getListTypeDetail(fieldName);
    const handleGroupName = () => {
        const { key, value } = currentListDetail;
        let finalFieldName = key === 'inclusionLists' ? 'Inclusion' : 'Exclusion';
        if (!value) {
            return finalFieldName;
        } else {
            return `${finalFieldName}${key === 'inclusionLists' ? value + 1 : value}`;
        }
    };
    switch (currentListDetail?.key) {
        case 'exclusionLists':
            return handleGroupName();
        case 'inclusionLists':
            return handleGroupName();
        case 'lookALikeAudLists':
            return 'Audience';
        case 'lookALikeAttrLists':
            return 'lookALikeAttrLists';
        case 'zeroDayLists':
            return 'Zero Day';
        case 'filterLists':
            return 'Filter';
        default:
            break;
    }
};

const groupTitle = (groups, fieldName) => {
    const currentListDetail = getListTypeDetail(fieldName);
    const currentListName = currentListDetail.key;
    const groupSet = new Set(groups);
    const hasGroups = groups?.length > 0;

    if (fieldName === 'zeroDayLists') return 'Filters';
    if (fieldName === 'lookALikeAudLists') return 'Look-alike audience';
    if (fieldName === 'lookALikeAttrLists') return 'Look-alike attributes';

    const filterGroupInclusionist = groups.filter((group) => group?.includes('inclusionLists'));
    const filterGroupExculsionList = groups.filter((group) => group?.includes('exclusionList'));

    if (!hasGroups) return 'Filters';
    // debugger;

    const getExclusionGroupTitle = () => {
        if (currentListName === 'filterLists') return 'Filters';
        if (filterGroupExculsionList?.length > 1) {
            if (fieldName === 'exclusionLists') return 'Exclusion Group 1';
            return `Exclusion Group ${currentListDetail.value ? currentListDetail.value : 2}`;
        }
        if (currentListName === 'exclusionLists') return 'Exclusion';
    };

    const getInclusionGroupTitle = () => {
        if (currentListName === 'filterLists') return 'Inclusion Group 1';
        if (currentListName === 'inclusionLists') {
            return `Inclusion Group ${currentListDetail.value ? currentListDetail.value + 1 : 2}`;
        }
    };

    if (groupSet.has('inclusionLists')) {
        return getInclusionGroupTitle() || getExclusionGroupTitle();
    }

    if (filterGroupExculsionList) {
        return getExclusionGroupTitle();
    }

    if (currentListName === 'filterLists') return 'Filters';
    if (currentListName === 'inclusionLists') return 'Inclusion';
    if (currentListName === 'exclusionLists') return 'Exclusion';

    return 'Filters';
};

const zeroDayAttributeDisable = (attributes) => {
    const {
        filterLists,
        zeroDayLists = [],
        inclusionLists = [],
        exclusionLists = [],
        lookALikeAudLists = [],
        lookALikeAttrLists = [],
    } = attributes;
    const getAllAttributeCounts = [
        ...filterLists,
        ...zeroDayLists,
        ...inclusionLists,
        ...exclusionLists,
        ...lookALikeAudLists,
        ...lookALikeAttrLists,
    ];
    if (getAllAttributeCounts?.length) return true;
    return false;
};

const AUDIENCE_COUNT_RESPONSE = {
    countValue: {
        OriginalBaseExprVal: {
            '#OriginalBaseExprVal #0': 27,
            '#OriginalBaseExprVal #1': 14,
            '#OriginalBaseExprVal #2': 10,
            '#OriginalBaseExprVal #3': 8,
        },
        FilterGroup2ExprVal: {
            '#FilterGroup2ExprVal #0': 16,
            '#FilterGroup2ExprVal #1': 13,
            '#FilterGroup2ExprVal #2': 11,
            '#FilterGroup2ExprVal #3': 9,
        },
        Exclusion1ExprVal: {
            '#Exclusion1ExprVal #0': 20,
            '#Exclusion1ExprVal #1': 15,
            '#Exclusion1ExprVal #2': 11,
            '#Exclusion1ExprVal #3': 8,
        },
    },
    lookalikeCountValue: {},
    originalBaseQuery: {
        '#OriginalBaseExprVal #0':
            "SELECT COUNT(DISTINCT M.R1_s) AS COUNT FROM grape-omp.resul_audience_Omp.resul_audience_Omp M WHERE M.Gender_s IN ('Male');",
    },
    lookALikeQuery: {},
    lookALikeNotOriginalQuery: {},
    filter2Query: {
        '#FilterGroup2ExprVal #0':
            "SELECT COUNT(DISTINCT M.R1_s) AS COUNT FROM grape-omp.resul_audience_Omp.resul_audience_Omp M WHERE M.Gender_s IN ('Female');",
    },
    excluson1Query: {
        '#Exclusion1ExprVal #0':
            "SELECT COUNT(DISTINCT M.R1_s) AS COUNT FROM grape-omp.resul_audience_Omp.resul_audience_Omp M WHERE M.Gender_s IN ('Male') AND M.R1_s IN (Select DISTINCT M.R1_s from grape-omp.resul_audience_Omp.resul_audience_Omp M WHERE M.Gender_s IN ('Female')) AND NOT (M.R1_s IN (Select DISTINCT M.R1_s from grape-omp.resul_audience_Omp.resul_audience_Omp M WHERE M.Gender_s IN ('Male','Female')));",
    },
    tenantShortCode: 'T1_s : Omp',
    businessShortCode: 'B1_s : ',
    defaultAddedQuery: 'AND (IsMobile_b:1 OR IsEmail_b:1)',
    exclusionQueryFormation:
        "SELECT COUNT(DISTINCT M.R1_s) AS COUNT FROM grape-omp.resul_audience_Omp.resul_audience_Omp M WHERE M.Gender_s IN ('Male') AND M.R1_s IN (Select DISTINCT M.R1_s from grape-omp.resul_audience_Omp.resul_audience_Omp M WHERE M.Gender_s IN ('Female')) AND NOT (M.R1_s IN (Select DISTINCT M.R1_s from grape-omp.resul_audience_Omp.resul_audience_Omp M WHERE M.Gender_s IN ('Male','Female')));",
    isSOLRAPIEnabled: false,
    uniqueGUID: '',
    apiURL: '',
    apiURLDeleteKey: '',
    inclusionIG1IG2Query:
        "SELECT COUNT(DISTINCT M.R1_s) AS COUNT FROM grape-omp.resul_audience_Omp.resul_audience_Omp M WHERE M.Gender_s IN ('Male') AND M.R1_s IN (Select DISTINCT M.R1_s from grape-omp.resul_audience_Omp.resul_audience_Omp M WHERE M.Gender_s IN ('Female'));",
    inclusionIG1IG2Count: '12',
};

const ATTRIBUTE_VALUES_RESPONSE = {
    status: true,
    message: 'Attribute values are available',
    data: [':@@;1', 'Windows:@@;1', 'iOS:@@;1', 'Linux:@@;1'],
};

const extractValue = (value) => {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object') {
        const keys = Object.keys(value);
        return keys.length > 0 ? value[keys[0]] : '';
    }
    return value || '';
};

const getAttributesErrorMessageValues = (attributesError = {}) =>
    Object.entries(attributesError)
        .filter(([k]) => !k.endsWith('ErrorIndex'))
        .map(([, v]) => v);

/** Same key shape as findTLDuplicates (items include groupSet / _rowIndex from flattened lists). */
const buildTLDuplicateRuleKey = (group) => {
    const { name, nAME, attributeType, attributeValue, isvirtualfield, typeStatus, labelText } = group || {};
    let groupName = nAME?.toLowerCase()?.trim() ?? name?.toLowerCase()?.trim() ?? labelText?.toLowerCase()?.trim();
    let updateAttributeType;
    let attrValNormalized;
    if (group?.sOLRFieldName === 'Campaign_name_s') {
        let communicationName = group?.communicationName?.length
            ? group?.communicationName
            : attributeValue?.length
            ? attributeValue
            : [];
        let communicationType = group?.communicationType
            ? group?.communicationType
            : typeStatus?.length
            ? typeStatus[0]
            : '';
        updateAttributeType = extractValue(communicationType);
        groupName = communicationName?.map((comm) => comm?.campaignName)?.join(',');
    } else {
        updateAttributeType = extractValue(attributeType);
    }

    if (group?.sOLRFieldName === 'Campaign_name_s') {
        let communicationStatus = group?.communicationStatus
            ? group?.communicationStatus
            : typeStatus?.length
            ? typeStatus[1] ?? ''
            : '';
        attrValNormalized = extractValue(communicationStatus);
    } else {
        attrValNormalized = Array.isArray(attributeValue)
            ? attributeValue
                  ?.map((item) => item?.data)
                  ?.slice()
                  .sort()
                  .join(',')
            : attributeValue;
    }

    let key = `${updateAttributeType || ''}_${attrValNormalized || ''}_${groupName || ''}`;

    if (updateAttributeType === 'Between') {
        key = `${key}_${group?.attributeValueOne || ''}`;
    }

    if (isvirtualfield) {
        key = `${key}_${group?.virtualFields?.UIPrintableName || ''}`;
    }

    return key;
};

/** Row indices in targetGroup that share a duplicate rule key with at least one other row (any group). */
const getDuplicateRowIndicesForGroup = (allValues, targetGroup) => {
    const keyToEntries = new Map();
    (allValues || []).forEach((item) => {
        if (!item?.groupSet) return;
        const k = buildTLDuplicateRuleKey(item);
        if (!keyToEntries.has(k)) keyToEntries.set(k, []);
        keyToEntries.get(k).push({ groupSet: item.groupSet, rowIndex: item._rowIndex });
    });
    const involved = new Set();
    keyToEntries.forEach((entries) => {
        if (entries.length < 2) return;
        entries.forEach((e) => {
            if (e.groupSet === targetGroup && e.rowIndex != null) involved.add(e.rowIndex);
        });
    });
    return involved;
};

function findTLDuplicates(groups = []) {
    const errors = new Set();
    const duplicateIndexByGroup = {};
    /** First row that claimed this rule key (globally, any group). */
    const ruleKeyFirstOwner = new Map();

    const markDuplicateRow = (groupSet, rowIndex) => {
        add(groupSet);
        if (rowIndex != null) {
            duplicateIndexByGroup[groupSet] = rowIndex;
        }
    };

    (groups || []).forEach((groupItem) => {
        const { groupSet, _rowIndex } = groupItem || {};
        if (!groupSet) return;

        const normalizedKey = buildTLDuplicateRuleKey(groupItem);
        const prev = ruleKeyFirstOwner.get(normalizedKey);

        if (prev) {
            if (prev.groupSet === groupSet) {
                markDuplicateRow(groupSet, _rowIndex);
            } else {
                markDuplicateRow(groupSet, _rowIndex);
                markDuplicateRow(prev.groupSet, prev.rowIndex);
            }
        } else {
            ruleKeyFirstOwner.set(normalizedKey, { groupSet, rowIndex: _rowIndex });
        }
    });

    return {
        duplicateGroups: Array.from(errors),
        duplicateIndexByGroup,
    };
}

export const handleRecount = (filterGroups, getValues) => {
    const temp = { ...filterGroups };
    const groupList = temp?.groups?.map((field) => {
        const getItems = getValues(field);
        return getItems?.map((listItem) => ({
            ...listItem,
            isStatus: false,
        }));
    });

    return groupList;
};

const handleExclusionMerge = (list, objectIndex) => {
    const updatedObjects = [...list];
    if (objectIndex === 1) {
        if (updatedObjects[objectIndex].WithInOperatorCount === 'WithInOperatorCountEnd') {
            updatedObjects[objectIndex].WithInOperatorCount = 'off';
            updatedObjects[objectIndex - 1].WithInOperatorCount = 'off';
        } else if (updatedObjects[objectIndex].WithInOperatorCount === 'continue') {
            if (updatedObjects[objectIndex + 1].WithInOperatorCount === 'WithInOperatorCountEnd') {
                updatedObjects[objectIndex].WithInOperatorCount = 'WithInOperatorCountEnd';
                updatedObjects[objectIndex + 1].WithInOperatorCount = 'off';
            } else {
                updatedObjects[objectIndex].WithInOperatorCount = 'WithInOperatorCountEnd';
                updatedObjects[objectIndex + 1].WithInOperatorCount = 'WithInOperatorCountStart';
            }
        } else {
            updatedObjects[objectIndex].WithInOperatorCount = 'WithInOperatorCountEnd';
            updatedObjects[objectIndex - 1].WithInOperatorCount = 'WithInOperatorCountStart';
        }
    } else if (updatedObjects[objectIndex].WithInOperatorCount === 'off') {
        if (updatedObjects[objectIndex - 1].WithInOperatorCount === 'WithInOperatorCountEnd') {
            updatedObjects[objectIndex].WithInOperatorCount = 'WithInOperatorCountEnd';
            updatedObjects[objectIndex - 1].WithInOperatorCount = 'continue';
        } else {
            updatedObjects[objectIndex].WithInOperatorCount = 'WithInOperatorCountEnd';
            updatedObjects[objectIndex - 1].WithInOperatorCount = 'WithInOperatorCountStart';
        }
    } else if (updatedObjects[objectIndex].WithInOperatorCount === 'WithInOperatorCountEnd') {
        if (updatedObjects[objectIndex - 1].WithInOperatorCount === 'WithInOperatorCountStart') {
            updatedObjects[objectIndex].WithInOperatorCount = 'off';
            updatedObjects[objectIndex - 1].WithInOperatorCount = 'off';
        } else {
            updatedObjects[objectIndex].WithInOperatorCount = 'off';
            updatedObjects[objectIndex - 1].WithInOperatorCount = 'WithInOperatorCountEnd';
        }
    } else if (updatedObjects[objectIndex].WithInOperatorCount === 'WithInOperatorCountStart') {
        if (updatedObjects[objectIndex - 1].WithInOperatorCount === 'off') {
            updatedObjects[objectIndex].WithInOperatorCount = 'continue';
            updatedObjects[objectIndex - 1].WithInOperatorCount = 'WithInOperatorCountStart';
        } else if (updatedObjects[objectIndex - 1].WithInOperatorCount === 'WithInOperatorCountEnd') {
            updatedObjects[objectIndex].WithInOperatorCount = 'continue';
            updatedObjects[objectIndex - 1].WithInOperatorCount = 'continue';
        }
    } else if (updatedObjects[objectIndex].WithInOperatorCount === 'continue') {
        if (updatedObjects[objectIndex - 1].WithInOperatorCount === 'continue') {
            updatedObjects[objectIndex].WithInOperatorCount = 'WithInOperatorCountStart';
            updatedObjects[objectIndex - 1].WithInOperatorCount = 'WithInOperatorCountEnd';
        } else if (updatedObjects[objectIndex - 1].WithInOperatorCount === 'WithInOperatorCountStart') {
            updatedObjects[objectIndex].WithInOperatorCount = 'WithInOperatorCountStart';
            updatedObjects[objectIndex - 1].WithInOperatorCount = 'off';
        }
    }

    return updatedObjects;
};

const handleDuplicateAttributes = (
    filterGroups,
    getValues,
    attributesError,
    dispatchState,
    activeFieldName = null,
    preferredErrorIndex = null,
) => {
    const getDuplicateGroupLabel = (fieldName) =>
        fieldName === 'lookALikeAttrLists' ? 'Look-alike attributes' : getGroupNameByLists(fieldName);

    let allValues = [];
    const uniqueArray = filterGroups?.groups.filter(function (item, pos) {
        return filterGroups?.groups.indexOf(item) == pos;
    });
    uniqueArray.forEach((group) => {
        const rows = getValues()?.[group] || [];
        allValues.push(
            ...rows.map((target, rowIndex) => ({ ...target, groupSet: group, _rowIndex: rowIndex })),
        );
    });
    const { duplicateGroups: rawDuplicateGroups, duplicateIndexByGroup } = findTLDuplicates(allValues);
    const duplicateGroups = [...rawDuplicateGroups].sort(
        (a, b) => uniqueArray.indexOf(a) - uniqueArray.indexOf(b),
    );
    const hasDuplicates = duplicateGroups.length > 0;
    let tempErrors = { ...attributesError };

    if (hasDuplicates) {
        if (activeFieldName) {
            Object.keys(tempErrors).forEach((key) => {
                if (key.endsWith('ErrorIndex')) {
                    tempErrors[key] = null;
                }
            });
            uniqueArray.forEach((g) => {
                const msg = tempErrors[g];
                if (msg && String(msg).includes('duplicate values') && g !== activeFieldName) {
                    tempErrors[g] = null;
                }
            });
            if (duplicateGroups.includes(activeFieldName)) {
                const groupLabel = getDuplicateGroupLabel(activeFieldName);
                tempErrors[activeFieldName] = `${groupLabel} group has duplicate values`;
                const algoIndex = duplicateIndexByGroup[activeFieldName] ?? null;
                const involvedRows = getDuplicateRowIndicesForGroup(allValues, activeFieldName);
                const prefNum =
                    preferredErrorIndex !== null &&
                    preferredErrorIndex !== undefined &&
                    Number.isFinite(Number(preferredErrorIndex))
                        ? Number(preferredErrorIndex)
                        : null;
                const usePreferred = prefNum !== null && involvedRows.has(prefNum);
                tempErrors[`${activeFieldName}ErrorIndex`] = usePreferred ? prefNum : algoIndex;
            } else {
                if (tempErrors[activeFieldName]?.includes?.('duplicate values')) {
                    tempErrors[activeFieldName] = null;
                }
                tempErrors[`${activeFieldName}ErrorIndex`] = null;
            }
        } else {
            Object.keys(tempErrors).forEach((key) => {
                if (key.endsWith('ErrorIndex')) {
                    tempErrors[key] = null;
                }
            });
            uniqueArray.forEach((g) => {
                const msg = tempErrors[g];
                if (!duplicateGroups.includes(g) && msg && String(msg).includes('duplicate values')) {
                    tempErrors[g] = null;
                }
            });
            duplicateGroups.forEach((dupGroup) => {
                const groupLabel = getDuplicateGroupLabel(dupGroup);
                tempErrors[`${dupGroup}`] = `${groupLabel} group has duplicate values`;
                tempErrors[`${dupGroup}ErrorIndex`] = duplicateIndexByGroup[dupGroup] ?? null;
            });
        }
        dispatchState({
            type: 'UPDATE',
            payload: tempErrors,
            field: 'attributesError',
        });
        return false;
    }

    // No duplicates: reset all attributesError keys (messages and *ErrorIndex).
    Object.keys(tempErrors).forEach((key) => {
        tempErrors[key] = null;
    });
    dispatchState({
        type: 'UPDATE',
        payload: tempErrors,
        field: 'attributesError',
    });
    return true;
};

// const resetFieldCountStatus = (list, statusField === "" &&  false, switchChange = true, index = 0, type, filterType = '') => {
//     console.log('filterType :::: ', filterType, switchChange);
//     return list?.map((field, ind) => {
//         debugger;
//         field.isStatus = statusField;
//         if (ind === index && type === filterType) field.isSwitched = switchChange;
//         if (field.mergeValue === undefined) {
//             field.mergeValue = 'Unmerge';
//         }
//         return field;
//     });
// };

const resetFieldCountStatus = (list, statusField, switchChange = true, index = 0, type, filterType = '') => {
    // console.log('filterType :::: ', filterType, switchChange);
    // if (!Array.isArray(list) || statusField === undefined || statusField === '') {
    //     return list;
    // }

    return list.map((field, ind) => {
        field.isStatus = statusField || true;

        if (ind === index && type === filterType) {
            field.isSwitched = switchChange;
        }
        if (statusField) {
            field.isLoading = false;
        }

        if (field.mergeValue === undefined) {
            field.mergeValue = 'Unmerge';
        }

        return field;
    });
};

const checkIsEmpty = (value) => {
    if (Array.isArray(value) && !value?.length) {
        return false;
    } else if (_isNil(value) || value === '') {
        return false;
    }
    return true;
};
export const buildVirtualFieldFormExtras = (virtualRow) => {
    const name = (virtualRow?.UIPrintableName || '').toLowerCase() || '';
    let virtual = false;
    let virtualType = 'virtualDefault';
    if (name.includes('custom')) {
        virtual = true;
        virtualType = 'virtualDate';
    } else if (name.includes('r(n)')) {
        virtual = true;
        virtualType = 'virtualInput';
    }
    return {
        isVirtualSave: false,
        virtualStart: '',
        virtualEnd: '',
        virtualInput: '',
        isStatus: false,
        isLoading: false,
        virtual,
        virtualType,
    };
};

export {
    VIEW_COUNT,
    DUPLICATE,
    REMOVE,
    EXCLUSIONSWITCHOPTIONS,
    handleSelectedList,
    getallAttributes,
    getGroupNameByLists,
    groupTitle,
    zeroDayAttributeDisable,
    AUDIENCE_COUNT_RESPONSE,
    ATTRIBUTE_VALUES_RESPONSE,
    findTLDuplicates,
    getAttributesErrorMessageValues,
    handleExclusionMerge,
    handleDuplicateAttributes,
    resetFieldCountStatus,
    checkIsEmpty,
};

export const getSideList = (
    editList,
    isPersona = false,
    partnerData = false,
    isVersium = false,
    isMultiFilter = false,
) => {
    const withOutParse = isPersona || isVersium || isMultiFilter;
    let parseSideFieldList;

    if (withOutParse) {
        parseSideFieldList = editList;
    } else {
        if (typeof editList === 'string' && editList) {
            parseSideFieldList = JSON.parse(editList);
        } else {
            parseSideFieldList = editList;
        }
    }

    let expressionList = isPersona ? editList : parseSideFieldList?.Expressions;
    var solrFieldNames = expressionList?.map(function (entry) {
        if (partnerData) {
            return entry?.SOLRFieldName;
        } else if (
            entry?.SOLRFieldName.split('_').pop() === 'ss' ||
            entry?.SOLRFieldName.split('_').pop() === 's' ||
            entry?.SOLRFieldName.split('_').pop() === 'd' //subscription form 'd'
        ) {
            // if (entry?.SOLRFieldName.split('_')[1] === 'ss' || entry?.SOLRFieldName.split('_')[1] === 's')
            return entry?.SOLRFieldName;
        }
    });
    return solrFieldNames || [];
};

export const allExpressionSOLRFieldNameWiseByValue = (expressionList) => {
    const finalFormatExpression = expressionList?.reduce((acc, curr) => {
        return { ...acc, [curr.SOLRFieldName]: curr };
    }, {});

    return finalFormatExpression;
};

export const convertExpressionToAttributesObjectFormat = (currentExpressionValue) => {
    const {
        SequenceId = 0,
        Category = '',
        Field = '',
        Value = '',
        dateValue = [],
        typeStatus = [],
        ConditionOperator = '',
        ExpressionOperator = '',
        QueryType = '',
        LiId = '',
        ParentdivId = '',
        ParentChildIdentify = '',
        SOLRFieldName = '',
        SOLRCountValue = 0,
        LiwaterfallCount = 0,
        LiremainingCount = 0,
        LiarithmeticSymbol = '',
        LiUIPrintableName = '',
        WithInOperator = '',
        WithInOperatorCountdisable = '',
        WithInOperatorCountStart = '',
        WithInOperatorCountEnd = '',
        restype = '',
        SourceFrom = '',
        IsVirtualField = false,
    } = currentExpressionValue;

    return {
        AttributeName: Field,
        DataType: QueryType,
        sOLRFieldName: SOLRFieldName,
        labelText: LiUIPrintableName,
        nAME: Field,
        isvirtualfield: IsVirtualField,
        category: Category,
        sOLRCountValue: SOLRCountValue,
        restype: restype,
        SourceFrom,
        WithInOperatorCountEnd,
        WithInOperatorCountStart,
        WithInOperatorCountdisable,
        WithInOperator,
        LiremainingCount,
        LiarithmeticSymbol,
        typeStatus,
        SequenceId,
        LiwaterfallCount,
        Value,
        dateValue,
        ConditionOperator,
        ExpressionOperator,
        LiId,
        ParentdivId,
        ParentChildIdentify,
    };
};

// 'Email', 'Mobile push', 'SMS', 'Web push'

export const communicationTypes = [
    { id: 1, label: 'Email', type: 'Email', apiValue: 'Email' },
    { id: 3, label: 'SMS', type: 'SMS', apiValue: 'SMS' },
    { id: 5, label: 'WhatsApp', type: 'WhatsApp', apiValue: 'WA' },
    { id: 4, label: 'Web push', type: 'Webpush', apiValue: 'WP' },
    { id: 2, label: 'Mobile push', type: 'Mobilepush', apiValue: 'MP' },
    { id: 6, label: 'RCS', type: 'RCS', apiValue: 'RCS' }
];

export const channelMap = {
    Email: { id: 1, label: 'Email', type: 'Email', apiValue: 'Email' },
    SMS: { id: 3, label: 'SMS', type: 'SMS', apiValue: 'SMS' },
    WhatsApp: { id: 5, label: 'WhatsApp', type: 'WhatsApp', apiValue: 'WA' },
    Webpush: { id: 4, label: 'Web push', type: 'Webpush', apiValue: 'WP' },
    Mobilepush: { id: 2, label: 'Mobile push', type: 'Mobilepush', apiValue: 'MP' },
    RCS: { id: 6, label: 'RCS', type: 'RCS', apiValue: 'RCS' }, // ignore
    QRCode: { id: 7, label: 'QR Code', type: 'QRCode', apiValue: 'QR' }, // ignore
};

// 'Sent', 'Reached', 'Not reached', 'Engaged', 'Not engaged', 'Converted', 'Not converted'

export const communicationStatus = {
    Email: [
        { id: 1, label: 'Sent', status: 'Blast' },
        { id: 2, label: 'Reached', status: 'Open' },
        { id: 3, label: 'Not reached', status: 'Notreached' },
        { id: 4, label: 'Engaged', status: 'Click' },
        { id: 5, label: 'Not engaged', status: 'Notengaged' },
        { id: 6, label: 'Converted', status: 'Converted' },
        { id: 7, label: 'Not converted', status: 'Notconverted' },
    ],
    Mobilepush: [
        { id: 1, label: 'Sent', status: 'Blast' },
        { id: 2, label: 'Reached', status: 'Open' },
        { id: 3, label: 'Not reached', status: 'Notreached' },
        { id: 4, label: 'Engaged', status: 'Click' },
        { id: 5, label: 'Not engaged', status: 'Notengaged' },
        { id: 6, label: 'Converted', status: 'Converted' },
        { id: 7, label: 'Not converted', status: 'Notconverted' },
        { id: 8, label: 'Expired', status: 'expired' },
        { id: 9, label: 'Rejected', status: 'rejected' },
    ],
    SMS: [
        { id: 1, label: 'Sent', status: 'Blast' },
        { id: 2, label: 'Delivered', status: 'Open' },
        { id: 3, label: 'Undelivered', status: 'Undelivered' },
        { id: 4, label: 'Replied/Participated', status: 'Click' },
        { id: 5, label: 'Not engaged', status: 'Notengaged' },
        { id: 6, label: 'Converted', status: 'Converted' },
        { id: 7, label: 'Not converted', status: 'Notconverted' },
        { id: 8, label: 'Expired', status: 'Expired' },
        { id: 9, label: 'Rejected', status: 'Rejected' },
        { id: 10, label: 'DND', status: 'DND' },
    ],
    Webpush: [
        { id: 1, label: 'Sent', status: 'Blast' },
        { id: 2, label: 'Reached', status: 'Open' },
        { id: 3, label: 'Not reached', status: 'Notreached' },
        { id: 4, label: 'Engaged', status: 'Click' },
        { id: 5, label: 'Not engaged', status: 'Notengaged' },
        { id: 6, label: 'Converted', status: 'Converted' },
        { id: 7, label: 'Not converted', status: 'Notconverted' },
    ],
    WhatsApp: [
        { id: 1, label: 'Sent', status: 'Blast' },
        { id: 2, label: 'Delivered', status: 'Open' },
        { id: 3, label: 'Undelivered', status: 'Undelivered' },
        { id: 4, label: 'Read', status: 'seen' },
        { id: 5, label: 'Not read', status: 'Notread' },
        { id: 6, label: 'Clicked', status: 'Click' },
        { id: 7, label: 'Converted', status: 'Converted' },
        { id: 8, label: 'Rejected', status: 'Rejected' },
        { id: 7, label: 'Not converted', status: 'Notconverted' },
    ],
    RCS: [
        { id: 1, label: 'Sent', status: 'Blast' },
        { id: 2, label: 'Delivered', status: 'Open' },
        { id: 3, label: 'Undelivered', status: 'Undelivered' },
        { id: 4, label: 'Read', status: 'seen' },
        { id: 5, label: 'Not read', status: 'Notread' },
        { id: 6, label: 'Clicked', status: 'Click' },
        { id: 7, label: 'Converted', status: 'Converted' },
        { id: 8, label: 'Rejected', status: 'Rejected' },
        { id: 7, label: 'Not converted', status: 'Notconverted' },
    ],
    QRCode: [],
};

export const communicationData = [
    {
        id: 1,
        CommunicationName: 'testing Communication',
    },
    {
        id: 2,
        CommunicationName: 'temp builder',
    },
    {
        id: 3,
        CommunicationName: 'doctor day campaign',
    },
    {
        id: 4,
        CommunicationName: 'mobile push ',
    },
    {
        id: 5,
        CommunicationName: 'communication retest',
    },
];
export const subSegmentList_Temp = [
    {
        segmentationListID: 98,
        expressionJSON:
            '{"GroupingOperator": "AND", "FilterGroup": "OriginalBase", "TotalIncusionQuery": "", "TotalInclusionCount": "", "IsLastLi": false, "LiIndex": 0, "partnerID": 0, "remoteSettingId": 0, "Expressions": [{"SequenceId": 0, "Category": "Source", "Field": "CSV", "Value": "\'MDC IND DAILY.csv\'", "dateValue": ["MDC IND DAILY.csv"], "typeStatus": [], "ConditionOperator": "isequalto", "ExpressionOperator": "And", "QueryType": "hsearch", "LiId": "filterBuildComp0", "ParentdivId": "crbGroupContainer", "ParentChildIdentify": null, "SOLRFieldName": "FileName_ss", "SOLRCountValue": 240, "LiwaterfallCount": "6", "LiremainingCount": "251", "LiarithmeticSymbol": "-", "LiUIPrintableName": "CSV", "WithInOperator": null, "WithInOperatorCountdisable": "Disable", "WithInOperatorCountStart": null, "WithInOperatorCountEnd": null, "restype": null, "SourceFrom": null, "IsVirtualField": false}]}',
        fG2ExpressionJSON:
            '{"GroupingOperator": "AND", "FilterGroup": "MultipleFilter", "TotalIncusionQuery": "", "TotalInclusionCount": "0", "IsLastLi": false, "LiIndex": 1, "partnerID": 0, "remoteSettingId": 0, "Expressions": []}',
        exclusion1ExpressionJSON:
            '{"GroupingOperator": "NOT", "FilterGroup": "ExclusionFilter", "TotalIncusionQuery": "", "TotalInclusionCount": "", "IsLastLi": true, "LiIndex": 2, "partnerID": 0, "remoteSettingId": 0, "Expressions": []}',
        lookAlikeExpressionJSON: 'null',
    },
    {
        segmentationListID: 99,
        expressionJSON:
            '{"GroupingOperator": "AND", "FilterGroup": "OriginalBase", "TotalIncusionQuery": "", "TotalInclusionCount": "", "IsLastLi": false, "LiIndex": 0, "partnerID": 0, "remoteSettingId": 0, "Expressions": [{"SequenceId": 0, "Category": "Source", "Field": "Import Description", "Value": "\'KK_WHATSAPP_MARCH27\'", "dateValue": ["KK_WHATSAPP_MARCH27"], "typeStatus": [], "ConditionOperator": "isequalto", "ExpressionOperator": "And", "QueryType": "hsearch", "LiId": "filterBuildComp0", "ParentdivId": "crbGroupContainer", "ParentChildIdentify": null, "SOLRFieldName": "ImportDescription_ss", "SOLRCountValue": 240, "LiwaterfallCount": "20", "LiremainingCount": "237", "LiarithmeticSymbol": "-", "LiUIPrintableName": "Import Description", "WithInOperator": null, "WithInOperatorCountdisable": "Disable", "WithInOperatorCountStart": null, "WithInOperatorCountEnd": null, "restype": null, "SourceFrom": null, "IsVirtualField": false}]}',
        fG2ExpressionJSON:
            '{"GroupingOperator": "AND", "FilterGroup": "MultipleFilter", "TotalIncusionQuery": "", "TotalInclusionCount": "0", "IsLastLi": false, "LiIndex": 1, "partnerID": 0, "remoteSettingId": 0, "Expressions": []}',
        exclusion1ExpressionJSON:
            '{"GroupingOperator": "NOT", "FilterGroup": "ExclusionFilter", "TotalIncusionQuery": "", "TotalInclusionCount": "", "IsLastLi": true, "LiIndex": 2, "partnerID": 0, "remoteSettingId": 0, "Expressions": []}',
        lookAlikeExpressionJSON: 'null',
    },
    // {
    //     segmentationListID: 98,
    //     expressionJSON:
    //         '{"GroupingOperator": "AND", "FilterGroup": "OriginalBase", "TotalIncusionQuery": "", "TotalInclusionCount": "", "IsLastLi": false, "LiIndex": 0, "partnerID": 0, "remoteSettingId": 0, "Expressions": [{"SequenceId": 0, "Category": "Source", "Field": "CSV", "Value": "\'MDC IND DAILY.csv\'", "dateValue": ["MDC IND DAILY.csv"], "typeStatus": [], "ConditionOperator": "isequalto", "ExpressionOperator": "And", "QueryType": "hsearch", "LiId": "filterBuildComp0", "ParentdivId": "crbGroupContainer", "ParentChildIdentify": null, "SOLRFieldName": "FileName_ss", "SOLRCountValue": 240, "LiwaterfallCount": "6", "LiremainingCount": "251", "LiarithmeticSymbol": "-", "LiUIPrintableName": "CSV", "WithInOperator": null, "WithInOperatorCountdisable": "Disable", "WithInOperatorCountStart": null, "WithInOperatorCountEnd": null, "restype": null, "SourceFrom": null, "IsVirtualField": false},{"SequenceId": 1, "Category": "Source", "Field": "CSV", "Value": "\'MDC IND DAILY1.csv\'", "dateValue": ["MDC IND DAILY1.csv"], "typeStatus": [], "ConditionOperator": "isequalto", "ExpressionOperator": "And", "QueryType": "hsearch", "LiId": "filterBuildComp0", "ParentdivId": "crbGroupContainer", "ParentChildIdentify": null, "SOLRFieldName": "FileName1_ss", "SOLRCountValue": 2140, "LiwaterfallCount": "61", "LiremainingCount": "2151", "LiarithmeticSymbol": "-", "LiUIPrintableName": "CSV", "WithInOperator": null, "WithInOperatorCountdisable": "Disable", "WithInOperatorCountStart": null, "WithInOperatorCountEnd": null, "restype": null, "SourceFrom": null, "IsVirtualField": false}]}',
    //     fG2ExpressionJSON:
    //         '{"GroupingOperator": "AND", "FilterGroup": "MultipleFilter", "TotalIncusionQuery": "", "TotalInclusionCount": "0", "IsLastLi": false, "LiIndex": 1, "partnerID": 0, "remoteSettingId": 0, "Expressions": [{"SequenceId": 0, "Category": "Source", "Field": "CSV", "Value": "\'MDC IND DAILY2.csv\'", "dateValue": ["MDC IND DAILY2.csv"], "typeStatus": [], "ConditionOperator": "isequalto", "ExpressionOperator": "And", "QueryType": "hsearch", "LiId": "filterBuildComp0", "ParentdivId": "crbGroupContainer", "ParentChildIdentify": null, "SOLRFieldName": "FileName2_ss", "SOLRCountValue": 2240, "LiwaterfallCount": "62", "LiremainingCount": "2251", "LiarithmeticSymbol": "-", "LiUIPrintableName": "CSV", "WithInOperator": null, "WithInOperatorCountdisable": "Disable", "WithInOperatorCountStart": null, "WithInOperatorCountEnd": null, "restype": null, "SourceFrom": null, "IsVirtualField": false},{"SequenceId": 1, "Category": "Source", "Field": "CSV", "Value": "\'MDC IND DAILY11.csv\'", "dateValue": ["MDC IND DAILY11.csv"], "typeStatus": [], "ConditionOperator": "isequalto", "ExpressionOperator": "And", "QueryType": "hsearch", "LiId": "filterBuildComp0", "ParentdivId": "crbGroupContainer", "ParentChildIdentify": null, "SOLRFieldName": "FileName11_ss", "SOLRCountValue": 21140, "LiwaterfallCount": "611", "LiremainingCount": "21151", "LiarithmeticSymbol": "-", "LiUIPrintableName": "CSV", "WithInOperator": null, "WithInOperatorCountdisable": "Disable", "WithInOperatorCountStart": null, "WithInOperatorCountEnd": null, "restype": null, "SourceFrom": null, "IsVirtualField": false}]}',
    //     exclusion1ExpressionJSON:
    //         '{"GroupingOperator": "NOT", "FilterGroup": "ExclusionFilter", "TotalIncusionQuery": "", "TotalInclusionCount": "", "IsLastLi": true, "LiIndex": 2, "partnerID": 0, "remoteSettingId": 0, "Expressions": [{"SequenceId": 0, "Category": "Source", "Field": "CSV", "Value": "\'MDC IND DAILY21.csv\'", "dateValue": ["MDC IND DAILY21.csv"], "typeStatus": [], "ConditionOperator": "isequalto", "ExpressionOperator": "And", "QueryType": "hsearch", "LiId": "filterBuildComp0", "ParentdivId": "crbGroupContainer", "ParentChildIdentify": null, "SOLRFieldName": "FileName21_ss", "SOLRCountValue": 22140, "LiwaterfallCount": "612", "LiremainingCount": "2251", "LiarithmeticSymbol": "-", "LiUIPrintableName": "CSV", "WithInOperator": null, "WithInOperatorCountdisable": "Disable", "WithInOperatorCountStart": null, "WithInOperatorCountEnd": null, "restype": null, "SourceFrom": null, "IsVirtualField": false},{"SequenceId": 1, "Category": "Source", "Field": "CSV", "Value": "\'MDC IND DAILY1221.csv\'", "dateValue": ["MDC IND DAILY1221.csv"], "typeStatus": [], "ConditionOperator": "isequalto", "ExpressionOperator": "And", "QueryType": "hsearch", "LiId": "filterBuildComp0", "ParentdivId": "crbGroupContainer", "ParentChildIdentify": null, "SOLRFieldName": "FileName121_ss", "SOLRCountValue": 212140, "LiwaterfallCount": "611", "LiremainingCount": "211251", "LiarithmeticSymbol": "-", "LiUIPrintableName": "CSV", "WithInOperator": null, "WithInOperatorCountdisable": "Disable", "WithInOperatorCountStart": null, "WithInOperatorCountEnd": null, "restype": null, "SourceFrom": null, "IsVirtualField": false}]}',
    //     lookAlikeExpressionJSON: 'null',
    // },
    // {
    //     segmentationListID: 99,
    //     expressionJSON:
    //         '{"GroupingOperator": "AND", "FilterGroup": "OriginalBase", "TotalIncusionQuery": "", "TotalInclusionCount": "", "IsLastLi": false, "LiIndex": 0, "partnerID": 0, "remoteSettingId": 0, "Expressions": [{"SequenceId": 0, "Category": "Source", "Field": "Import Description", "Value": "\'KK_WHATSAPP_MARCH27\'", "dateValue": ["KK_WHATSAPP_MARCH27"], "typeStatus": [], "ConditionOperator": "isequalto", "ExpressionOperator": "And", "QueryType": "hsearch", "LiId": "filterBuildComp0", "ParentdivId": "crbGroupContainer", "ParentChildIdentify": null, "SOLRFieldName": "ImportDescription_ss", "SOLRCountValue": 240, "LiwaterfallCount": "20", "LiremainingCount": "237", "LiarithmeticSymbol": "-", "LiUIPrintableName": "Import Description", "WithInOperator": null, "WithInOperatorCountdisable": "Disable", "WithInOperatorCountStart": null, "WithInOperatorCountEnd": null, "restype": null, "SourceFrom": null, "IsVirtualField": false}]}',
    //     fG2ExpressionJSON:
    //         '{"GroupingOperator": "AND", "FilterGroup": "MultipleFilter", "TotalIncusionQuery": "", "TotalInclusionCount": "0", "IsLastLi": false, "LiIndex": 1, "partnerID": 0, "remoteSettingId": 0, "Expressions": []}',
    //     exclusion1ExpressionJSON:
    //         '{"GroupingOperator": "NOT", "FilterGroup": "ExclusionFilter", "TotalIncusionQuery": "", "TotalInclusionCount": "", "IsLastLi": true, "LiIndex": 2, "partnerID": 0, "remoteSettingId": 0, "Expressions": [{"SequenceId": 0, "Category": "Source", "Field": "Import Description", "Value": "\'KK_WHATSAPP_MARCH27\'", "dateValue": ["KK_WHATSAPP_MARCH27"], "typeStatus": [], "ConditionOperator": "isequalto", "ExpressionOperator": "And", "QueryType": "hsearch", "LiId": "filterBuildComp0", "ParentdivId": "crbGroupContainer", "ParentChildIdentify": null, "SOLRFieldName": "ImportDescription_ss", "SOLRCountValue": 240, "LiwaterfallCount": "20", "LiremainingCount": "237", "LiarithmeticSymbol": "-", "LiUIPrintableName": "Import Description", "WithInOperator": null, "WithInOperatorCountdisable": "Disable", "WithInOperatorCountStart": null, "WithInOperatorCountEnd": null, "restype": null, "SourceFrom": null, "IsVirtualField": false}]}',
    //     lookAlikeExpressionJSON: 'null',
    // },
    // {
    //     segmentationListID: 100,
    //     expressionJSON:
    //         '{"GroupingOperator": "AND", "FilterGroup": "OriginalBase", "TotalIncusionQuery": "", "TotalInclusionCount": "", "IsLastLi": false, "LiIndex": 0, "partnerID": 0, "remoteSettingId": 0, "Expressions": [{"SequenceId": 0, "Category": "Source", "Field": "Import Description", "Value": "\'KK_WHATSAPP_MARCH27\'", "dateValue": ["KK_WHATSAPP_MARCH27"], "typeStatus": [], "ConditionOperator": "isequalto", "ExpressionOperator": "And", "QueryType": "hsearch", "LiId": "filterBuildComp0", "ParentdivId": "crbGroupContainer", "ParentChildIdentify": null, "SOLRFieldName": "ImportDescription_ss", "SOLRCountValue": 240, "LiwaterfallCount": "20", "LiremainingCount": "237", "LiarithmeticSymbol": "-", "LiUIPrintableName": "Import Description", "WithInOperator": null, "WithInOperatorCountdisable": "Disable", "WithInOperatorCountStart": null, "WithInOperatorCountEnd": null, "restype": null, "SourceFrom": null, "IsVirtualField": false}]}',
    //     fG2ExpressionJSON:
    //         '{"GroupingOperator": "AND", "FilterGroup": "MultipleFilter", "TotalIncusionQuery": "", "TotalInclusionCount": "0", "IsLastLi": false, "LiIndex": 1, "partnerID": 0, "remoteSettingId": 0, "Expressions": []}',
    //     exclusion1ExpressionJSON:
    //         '{"GroupingOperator": "NOT", "FilterGroup": "ExclusionFilter", "TotalIncusionQuery": "", "TotalInclusionCount": "", "IsLastLi": true, "LiIndex": 2, "partnerID": 0, "remoteSettingId": 0, "Expressions": [{"SequenceId": 0, "Category": "Source", "Field": "Import Description", "Value": "\'KK_WHATSAPP_MARCH27\'", "dateValue": ["KK_WHATSAPP_MARCH27"], "typeStatus": [], "ConditionOperator": "isequalto", "ExpressionOperator": "And", "QueryType": "hsearch", "LiId": "filterBuildComp0", "ParentdivId": "crbGroupContainer", "ParentChildIdentify": null, "SOLRFieldName": "ImportDescription_ss", "SOLRCountValue": 240, "LiwaterfallCount": "20", "LiremainingCount": "237", "LiarithmeticSymbol": "-", "LiUIPrintableName": "Import Description", "WithInOperator": null, "WithInOperatorCountdisable": "Disable", "WithInOperatorCountStart": null, "WithInOperatorCountEnd": null, "restype": null, "SourceFrom": null, "IsVirtualField": false}]}',
    //     lookAlikeExpressionJSON: 'null',
    // },
];

export const transformData_subsegment = (data) => {
    let count = 1,
        exclusionCount = 1;
    let transformedArray = [];

    data?.forEach((segment) => {
        Object.entries(segment).forEach(([key, value]) => {
            if (value && typeof value === 'string' && value !== 'null') {
                let parsedValue = JSON.parse(value);

                let newFilterGroup = '';
                if (parsedValue?.Expressions?.length > 0) {
                    if (key.includes('expressionJSON')) {
                        newFilterGroup = `IG${count++}`;
                    } else if (key.includes('fG2ExpressionJSON')) {
                        newFilterGroup = `IG${count++}`;
                    } else if (key.includes('exclusion')) {
                        newFilterGroup = `Ex${exclusionCount++}`;
                    }
                    transformedArray.push({
                        ...parsedValue,
                        FilterGroup: newFilterGroup,
                    });
                }
            }
        });
    });

    return transformedArray;

    //converted JSON
    // [
    //     {
    //         GroupingOperator: 'AND',
    //         FilterGroup: 'IG1',
    //         TotalIncusionQuery: '',
    //         TotalInclusionCount: '',
    //         IsLastLi: false,
    //         LiIndex: 0,
    //         partnerID: 0,
    //         remoteSettingId: 0,
    //         Expressions: [
    //             {
    //                 SequenceId: 0,
    //                 Category: 'Source',
    //                 Field: 'CSV',
    //                 Value: "'MDC IND DAILY.csv'",
    //                 dateValue: ['MDC IND DAILY.csv'],
    //                 typeStatus: [],
    //                 ConditionOperator: 'isequalto',
    //                 ExpressionOperator: 'And',
    //                 QueryType: 'hsearch',
    //                 LiId: 'filterBuildComp0',
    //                 ParentdivId: 'crbGroupContainer',
    //                 ParentChildIdentify: null,
    //                 SOLRFieldName: 'FileName_ss',
    //                 SOLRCountValue: 240,
    //                 LiwaterfallCount: '6',
    //                 LiremainingCount: '251',
    //                 LiarithmeticSymbol: '-',
    //                 LiUIPrintableName: 'CSV',
    //                 WithInOperator: null,
    //                 WithInOperatorCountdisable: 'Disable',
    //                 WithInOperatorCountStart: null,
    //                 WithInOperatorCountEnd: null,
    //                 restype: null,
    //                 SourceFrom: null,
    //                 IsVirtualField: false,
    //             },
    //         ],
    //     },
    //     {
    //         GroupingOperator: 'AND',
    //         FilterGroup: 'IG2',
    //         TotalIncusionQuery: '',
    //         TotalInclusionCount: '',
    //         IsLastLi: false,
    //         LiIndex: 0,
    //         partnerID: 0,
    //         remoteSettingId: 0,
    //         Expressions: [
    //             {
    //                 SequenceId: 0,
    //                 Category: 'Source',
    //                 Field: 'Import Description',
    //                 Value: "'KK_WHATSAPP_MARCH27'",
    //                 dateValue: ['KK_WHATSAPP_MARCH27'],
    //                 typeStatus: [],
    //                 ConditionOperator: 'isequalto',
    //                 ExpressionOperator: 'And',
    //                 QueryType: 'hsearch',
    //                 LiId: 'filterBuildComp0',
    //                 ParentdivId: 'crbGroupContainer',
    //                 ParentChildIdentify: null,
    //                 SOLRFieldName: 'ImportDescription_ss',
    //                 SOLRCountValue: 240,
    //                 LiwaterfallCount: '20',
    //                 LiremainingCount: '237',
    //                 LiarithmeticSymbol: '-',
    //                 LiUIPrintableName: 'Import Description',
    //                 WithInOperator: null,
    //                 WithInOperatorCountdisable: 'Disable',
    //                 WithInOperatorCountStart: null,
    //                 WithInOperatorCountEnd: null,
    //                 restype: null,
    //                 SourceFrom: null,
    //                 IsVirtualField: false,
    //             },
    //         ],
    //     },
    // ];

    //      Converted JSON: with subsegment
    //  "isSubSegment":true,
    //  "listIds":"98,99"
    // "expressionJSON":[
    //   {
    //     "GroupingOperator": "AND",
    //     "FilterGroup": "IG1",
    //     "TotalIncusionQuery": "",
    //     "TotalInclusionCount": "",
    //     "IsLastLi": false,
    //     "LiIndex": 0,
    //     "partnerID": 0,
    //     "remoteSettingId": 0,
    //     "Expressions": [
    //       {
    //         "SequenceId": 0,
    //         "Category": "Source",
    //         "Field": "CSV",
    //         "Value": "'MDC IND DAILY.csv'",
    //         "dateValue": [
    //           "MDC IND DAILY.csv"
    //         ],
    //         "typeStatus": [],
    //         "ConditionOperator": "isequalto",
    //         "ExpressionOperator": "And",
    //         "QueryType": "hsearch",
    //         "LiId": "filterBuildComp0",
    //         "ParentdivId": "crbGroupContainer",
    //         "ParentChildIdentify": null,
    //         "SOLRFieldName": "FileName_ss",
    //         "SOLRCountValue": 240,
    //         "LiwaterfallCount": "6",
    //         "LiremainingCount": "251",
    //         "LiarithmeticSymbol": "-",
    //         "LiUIPrintableName": "CSV",
    //         "WithInOperator": null,
    //         "WithInOperatorCountdisable": "Disable",
    //         "WithInOperatorCountStart": null,
    //         "WithInOperatorCountEnd": null,
    //         "restype": null,
    //         "SourceFrom": null,
    //         "IsVirtualField": false
    //       }
    //     ]
    //   },
    //   {
    //     "GroupingOperator": "AND",
    //     "FilterGroup": "IG2",
    //     "TotalIncusionQuery": "",
    //     "TotalInclusionCount": "",
    //     "IsLastLi": false,
    //     "LiIndex": 0,
    //     "partnerID": 0,
    //     "remoteSettingId": 0,
    //     "Expressions": [
    //       {
    //         "SequenceId": 0,
    //         "Category": "Source",
    //         "Field": "Import Description",
    //         "Value": "'KK_WHATSAPP_MARCH27'",
    //         "dateValue": [
    //           "KK_WHATSAPP_MARCH27"
    //         ],
    //         "typeStatus": [],
    //         "ConditionOperator": "isequalto",
    //         "ExpressionOperator": "And",
    //         "QueryType": "hsearch",
    //         "LiId": "filterBuildComp0",
    //         "ParentdivId": "crbGroupContainer",
    //         "ParentChildIdentify": null,
    //         "SOLRFieldName": "ImportDescription_ss",
    //         "SOLRCountValue": 240,
    //         "LiwaterfallCount": "20",
    //         "LiremainingCount": "237",
    //         "LiarithmeticSymbol": "-",
    //         "LiUIPrintableName": "Import Description",
    //         "WithInOperator": null,
    //         "WithInOperatorCountdisable": "Disable",
    //         "WithInOperatorCountStart": null,
    //         "WithInOperatorCountEnd": null,
    //         "restype": null,
    //         "SourceFrom": null,
    //         "IsVirtualField": false
    //       }
    //     ]
    //   }
    //   {
    //     "GroupingOperator": "AND",
    //     "FilterGroup": "IG3_Subsegment",
    //     "TotalIncusionQuery": "",
    //     "TotalInclusionCount": "",
    //     "IsLastLi": false,
    //     "LiIndex": 0,
    //     "partnerID": 0,
    //     "remoteSettingId": 0,
    //     "Expressions": [
    //       {
    //         "SequenceId": 0,
    //         "Category": "Source",
    //         "Field": "Import Description",
    //         "Value": "'KK_WHATSAPP_MARCH27'",
    //         "dateValue": [
    //           "KK_WHATSAPP_MARCH27"
    //         ],
    //         "typeStatus": [],
    //         "ConditionOperator": "isequalto",
    //         "ExpressionOperator": "And",
    //         "QueryType": "hsearch",
    //         "LiId": "filterBuildComp0",
    //         "ParentdivId": "crbGroupContainer",
    //         "ParentChildIdentify": null,
    //         "SOLRFieldName": "ImportDescription_ss",
    //         "SOLRCountValue": 240,
    //         "LiwaterfallCount": "20",
    //         "LiremainingCount": "237",
    //         "LiarithmeticSymbol": "-",
    //         "LiUIPrintableName": "Import Description",
    //         "WithInOperator": null,
    //         "WithInOperatorCountdisable": "Disable",
    //         "WithInOperatorCountStart": null,
    //         "WithInOperatorCountEnd": null,
    //         "restype": null,
    //         "SourceFrom": null,
    //         "IsVirtualField": false
    //       }
    //     ]
    //   }
    // ]
};

export const handleRemoveIconEligible = (index, filterGroup, fieldName) => {
    const currentListdetail = getListTypeDetail(fieldName);
    const currentListMaxValue = getListMaxValue(filterGroup, currentListdetail?.key);
    if (index !== 0 && currentListMaxValue?.key === fieldName) {
        return true;
    } else {
        return false;
    }
};

export const dispatchGroupAudienceCount = async ({
    dispatch,
    pathname,
    watch,
    filterGroups,
    attributeslistCount,
    attributeTypes,
    userInfoIds,
    switchChange,
    updateVersium,
    versiumDataSegment,
    ispartnerDigipopstate,
    transformedData_SubSegmentExp,
    isLocationData,
    isUniqueID,
    listType,
    SubSegmentExp_List,
    isLookAlike,
    selectedOption,
    loading = true
}) => {
    const buildPayload = pathname?.endsWith('create-target-lists') ? twinFinalPayload : finalPayload;
    const finalData = buildPayload(
        watch(),
        filterGroups,
        attributeslistCount,
        attributeTypes,
        userInfoIds,
        switchChange,
        updateVersium,
        versiumDataSegment,
        ispartnerDigipopstate,
        transformedData_SubSegmentExp,
        isLocationData,
        isUniqueID,
        listType,
        SubSegmentExp_List,
        isLookAlike,
        selectedOption,
    );
    const isPartnerList =
        ispartnerDigipopstate && Object.keys(ispartnerDigipopstate).length > 0 && ispartnerDigipopstate?.listId === 2;
    if (isPartnerList) {
        return dispatch(allGroupAudienceGroup_Partner(finalData));
    }
    if (isLocationData?.isMDCSubSegment) {
        return listType === 1
            ? dispatch(get_allGroupAdhocListSubsegment_waterfallcount(finalData, loading))
            : dispatch(get_allGroupSubsegment_waterfallcount(finalData, loading));
    }
    return dispatch(allGroupAudienceGroup(finalData, loading));
};
