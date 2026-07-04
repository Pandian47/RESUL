import { encodeUrl } from 'Utils/modules/crypto';
import { SELECT_DIFFERENT_ATTRIBUTE } from 'Constants/GlobalConstant/ValidationMessage';
import { find as _find,first as _first,map as _map } from 'Utils/modules/lodashReplacements';

export const INITIAL_STATE = {
    audienceList: [],
    audienceColumn: [],
    dataAttributes: [],
    selectedAttribute: [],
    attributesError: [],
    audienceErrors: [],
    primarykey: [],
    deletedColumn: {},
    selectedNewAttribute: {},
    isDeleteColumn: false,
    isDoubleOptIn: false,
    errDoubleOptIn: '',
    isNewAttributeModal: false,
    isAudienceImport: false,
    uniqueIdentifier: null,
    errUniqueIdentifier: null,
    uniqueKeyIndex: null,
    isUniqueAttrSelected: false,
    mySqlList: [],
    saveModal: false,
    listAnalysis: false,
    crmTableColumns: [],
    ResulToCRM: false,
};

export const SAVE_PREVIEW_GRID_CONFIG = {
    take: 10,
    skip: 0,
    pageSizes: [5, 10, 20],
};

export const stateReducer = (state, action) => {
    const { payload, type } = action;
    switch (type) {
        case 'UPDATE':
            return {
                ...state,
                [action.field]: payload,
            };
        case 'UPDATE_ATTRIBUTE':
            return {
                ...state,
                selectedAttribute: payload.selectedAttribute,
                attributesError: payload.attributesError,
            };
        case 'UPDATE_DELETED_ATTRIBUTE':
            return {
                ...state,
                audienceColumn: payload.audienceColumn,
                selectedAttribute: payload.selectedAttribute,
                attributesError: payload.attributesError,
                isDeleteColumn: payload.isDeleteColumn,
            };
        case 'UPDATE_DOUBLE_OPTIN':
            return {
                ...state,
                errDoubleOptIn: payload.errDoubleOptIn,
                isDoubleOptIn: payload.isDoubleOptIn,
            };
        case 'INITIAL_RENDER':
            return {
                ...state,
                audienceList: payload.audienceList,
                audienceColumn: payload.audienceColumn,
                primarykey: payload.primarykey,
            };
        case 'NEW_ATTRIBUTE':
            return {
                ...state,
                isNewAttributeModal: payload.isNewAttributeModal,
                selectedNewAttribute: payload.selectedNewAttribute,
            };
        case 'PRIMARY_KEY':
            return {
                ...state,
                primarykey: payload.primarykey,
                uniqueKeyIndex: payload.uniqueKeyIndex,
            };
        case 'DELETE_COLUMN':
            return {
                ...state,
                isDeleteColumn: payload.isDeleteColumn,
                deletedColumn: payload.deletedColumn,
            };
        case 'UPDATE_COLUMN_MAPPING':
            return {
                ...state,
                selectedAttribute: payload.selectedAttribute,
                primarykey: payload.primarykey,
            };
        case 'UPDATE_INITIAL_UNIQUE_IDENTIFIER':
            return {
                ...state,
                uniqueKeyIndex: payload.uniqueKeyIndex,
                isUniqueAttrSelected: payload?.isUniqueAttrSelected,
                uniqueIdentifier: payload.uniqueIdentifier,
            };
        case 'UPDATE_MYSQL':
            return {
                ...state,
                audienceList: payload.audienceList,
                audienceColumn: payload.audienceColumn,
                primarykey: payload.primarykey,
                selectedAttribute: payload.selectedAttribute,
            };
        case 'RESET_AUDIENCE_IMPORT':
            return {
                ...INITIAL_STATE,
                isAudienceImport: true,
            };
        default:
            return state;
    }
};

export const customTableCell = (props, index, audienceState) => {
    const { id, dataItem, field } = props;
    return <td style={tableCellStyles(id, index, audienceState)}>{dataItem?.[field]}</td>;
};

export const tableCellStyles = (id, index, audienceState) => {
    let styleObject = {
        backgroundColor: '',
        color: '',
        fontStyle: null,
    };
    if (id?.startsWith('_ai0') && !!audienceState.selectedAttribute[index]?.attributeName) {
        styleObject = {
            backgroundColor: '#66c8ec',
            color: 'white',
            fontStyle: 'italic',
        };
    }
    // if (
    //     id?.startsWith('_ai0') &&
    //     Object.values(audienceState.audienceList[0])[index] === audienceState.selectedAttribute[index]?.attrName &&
    //     audienceState.selectedAttribute[index]?.attributeName !== undefined
    // ) {
    //     styleObject = {
    //         backgroundColor: '#66c8ec',
    //         color: 'white',
    //         fontStyle: 'italic',
    //     };
    // } else if (
    //     id?.startsWith('_ai0') &&
    //     Object.values(audienceState.audienceList[0])[index].split('.')[1] ===
    //     audienceState.selectedAttribute[index]?.attrName &&
    //     audienceState.selectedAttribute[index]?.attributeName !== undefined
    // ) {
    //     styleObject = {
    //         backgroundColor: '#66c8ec',
    //         color: 'white',
    //         fontStyle: 'italic',
    //     };
    // } else if (id?.startsWith('_ai0')) {
    //     styleObject = {
    //         backgroundColor: '#e9e9eb',
    //         color: null,
    //         fontStyle: 'italic',
    //     };
    // } else {
    //     styleObject = {
    //         backgroundColor: null,
    //         color: null,
    //         fontStyle: null,
    //     };
    // }
    return styleObject;
};

export const validateSelectedAttribute = (e, index, prop, audienceState, dispatchState) => {
    const findDuplicateAttribute =
        Object.keys(
            audienceState.selectedAttribute?.find((attribute) => attribute?.attributeName === e.value?.attributeName) ||
                {},
        )?.length > 0;
    if (findDuplicateAttribute) {
        const tempData = [...audienceState.selectedAttribute];
        const tempError = [...audienceState.attributesError];
        tempData[index] = undefined;
        tempError[index] = SELECT_DIFFERENT_ATTRIBUTE;
        dispatchState({
            type: 'UPDATE_ATTRIBUTE',
            payload: {
                selectedAttribute: tempData,
                attributesError: tempError,
            },
        });
        return;
    }
    const tempError = [...audienceState.attributesError];
    tempError[index] = null;
    const tempData = [...audienceState.selectedAttribute];
    if (e.value.attributeName === 'New attribute') {
        // dispatchState({
        //     type: 'UPDATE',
        //     payload: true,
        //     field: 'isNewAttributeModal',
        // });
        dispatchState({
            type: 'UPDATE',
            payload: {
                props: prop,
                index: index,
            },
            field: 'selectedNewAttribute',
        });
    } else if (e.value.attributeName === '<< Ignore >>' || e.value === 'Select ...') {
        tempData[index] = undefined;
    } else {
        tempData[index] = { ...e.value };
    }
    dispatchState({
        type: 'UPDATE_ATTRIBUTE',
        payload: {
            selectedAttribute: tempData,
            attributesError: tempError,
        },
    });
};

export const deleteHeaderColumn = (audienceState, dispatchState, navigate) => {
    let tempColumn = [...audienceState.audienceColumn];
    let tempSelectedAttributes = [...audienceState.selectedAttribute];
    let tempAttributesError = [...audienceState.attributesError];
    tempColumn = tempColumn.filter((column) => {
        return column.attributeName !== audienceState.deletedColumn.props.field;
    });
    tempSelectedAttributes.splice(audienceState.deletedColumn?.index, 1);
    tempAttributesError.splice(audienceState.deletedColumn?.index, 1);
    let tempAudienceList = [...audienceState.audienceList].map((list) => {
        const tempList = Object.entries(list);
        tempList?.splice(audienceState.deletedColumn?.index, 1);
        return Object.fromEntries(tempList);
    });
    if (Object.keys(tempAudienceList[0])?.length) {
        dispatchState({
            type: 'UPDATE',
            payload: tempAudienceList,
            field: 'audienceList',
        });
    } else {
        // navigate to add audience

        const stateRedirect = { from: 'master-data', mode: 'add' };
        const stateredirectEncode = encodeUrl(stateRedirect);

        navigate(`/audience/add-audience?q=${stateredirectEncode}`, {
            state: stateRedirect,
        });
        // navigate('/audience/add-audience', {
        //     state: { mode: 'add' },
        // });
    }
    dispatchState({
        type: 'UPDATE_DELETED_ATTRIBUTE',
        payload: {
            audienceColumn: tempColumn,
            selectedAttribute: tempSelectedAttributes,
            attributesError: tempAttributesError,
            isDeleteColumn: false,
        },
    });
};
export const getEnableStatus = (audienceState, ResulToCRM = false) => {
    const { selectedAttribute } = audienceState;
    return selectedAttribute?.every((attr) => {
        if (attr?.attributeName === '<< Ignore >>') {
            return true;
        }
        return attr !== undefined && attr !== null && ResulToCRM ? true : Object.keys(attr || {}).length === 10;
    });
};

export const setAttrError = (audienceState, dispatchState, msg, index, clear) => {
    const tempData = [...audienceState.selectedAttribute];
    const tempError = [...audienceState.attributesError];
    const tmpIndex = index ?? tempData?.length - 1;
    if (clear) tempData[tmpIndex] = undefined;
    tempError[tmpIndex] = msg;
    dispatchState({
        type: 'UPDATE_ATTRIBUTE',
        payload: {
            selectedAttribute: tempData,
            attributesError: tempError,
        },
    });
    return;
};

export const getAttribute = (attr) => {
    if (attr)
        return {
            fieldTypeId: attr?.fieldTypeId || 0,
            sOLRFieldName: attr?.sOLRFieldName || '',
            dataAttributeId: attr?.dataAttributeId || 0,
            attributeName: attr?.uIPrintableName || '',
            isBrandId: attr?.isBrandId || '',
            attrName: attr?.attributeName ||'',
            filterGroupId: attr?.filterGroupId || 0,
            cattypeName: attr?.cattype||'',
            isImportAttributeMap: attr?.isImportAttributeMap || '',
        };
};
export const getCRMAttributes = (attr, ind) => {
    if (attr)
        return {
            fieldTypeId: attr.fieldType,
            dataAttributeId: ind + 1,
            attributeName: attr?.uiName,
            columnName: attr?.columnName,
            type: attr?.type,
        };
};
export const headerMapping = (headerRow) => {
    if (!Array.isArray(headerRow) || headerRow?.length === 0) return { tempData: [], columnData: [] };

    let tempData = [];
    let headerObj = {};
    headerRow?.forEach((col) => {
        headerObj = {
            ...headerObj,
            [col]: col,
        };
    });
    tempData.push(headerObj);

    const columnData = Object?.keys(tempData[0])?.map((columnName, columnIndex) => {
        return {
            dataAttributeId: columnIndex + 1,
            attributeName: columnName,
        };
    });
    return { tempData, columnData };
};

export const getUnmappedFirstColumnOrder = (audienceColumn = [], selectedAttribute = []) => {
    if (!Array.isArray(audienceColumn) || !audienceColumn.length) return [];
    const ordered = audienceColumn.map((_, index) => index).filter((index) => audienceColumn[index]);
    return ordered.sort((a, b) => {
        const aMapped = Boolean(selectedAttribute?.[a]?.attributeName);
        const bMapped = Boolean(selectedAttribute?.[b]?.attributeName);
        if (aMapped === bMapped) return a - b;
        return aMapped ? 1 : -1;
    });
};

export const csvPayload = (attributeMappingData, selectedAttribute, uniqueKeyIndex, dataCatalogueAttrs) => {
    const headerRow = _first(attributeMappingData);
    const payload = {
        doubleOptin: true,
        colMappingObject: _map(selectedAttribute, (attr, index) => {
            if (attr.attributeName === '<< Ignore >>') {
                return {
                    sourceColumnName: headerRow[attr.index],
                    destinationColumnName: 'Ignore',
                    fieldTypeId: 1,
                    dataAttributeId: 0,
                    sOLRFieldName: '',
                    isBrandID: false,
                    attributeName: 'Ignore',
                };
            }
            return {
                sourceColumnName: headerRow[attr.index],
                destinationColumnName: attr.attributeName,
                dataAttributeId:
                    _find(dataCatalogueAttrs, ['uIPrintableName', attr.attributeName])?.dataAttributeId ||
                    attr.dataAttributeId,
                fieldTypeId:
                    _find(dataCatalogueAttrs, ['uIPrintableName', attr.attributeName])?.fieldTypeId || attr.fieldTypeId,
                solrFieldName:
                    _find(dataCatalogueAttrs, ['uIPrintableName', attr.attributeName])?.sOLRFieldName ||
                    attr.sOLRFieldName,
                isBrandID: uniqueKeyIndex === index,
            };
        }),
    };
    return payload;
};

export const mySqlPayload = (mySqlList, selectedAttribute, jobId) => {
    return {
        remotesettingID: jobId,
        sourceColumnName: _map(mySqlList, (col) => col?.split('.')[1])?.join(','),
        destinationColumnName: _map(selectedAttribute, (attr) => attr.attributeName)?.join(','),
    };
};

export const ResulToCRMPayload = (attributeMappingData, selectedAttribute) => {
    const headerRow = _first(attributeMappingData);
    const payload = {
       
        columnMapping: _map(selectedAttribute, (attr, index) => {
            if (attr.attributeName === '<< Ignore >>') {
                return {
                    sourceColumnName: headerRow[attr.index],
                    destinationColumnName: 'Ignore',
                    fieldTypeId: 1,
                    dataAttributeId: 0,
                    sOLRFieldName: '',
                    isBrandID: false,
                    attributeName: 'Ignore',
                };
            }
            return {
                resulAttributeName: headerRow[attr.index] || '',
                solrFieldName: attr?.columnName || '',
                dataAttributeId: attr?.dataAttributeId || '',
                destinationColumnName: attr.attributeName || '',
                fieldTypeName: attr.type || ''
            };
        }),
    };
    return payload;
};
