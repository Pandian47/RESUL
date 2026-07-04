const enabledisableAttribute = (fields, labelText) => {
    return fields?.length && fields?.some((value) => value.labelText === labelText) ? 'active ' : '';
};
export const attributeListData = [
    {
        listName: 'Brand data',
        listId: 1,
    },
    {
        listName: 'Partner data',
        listId: 2,
    },
];
export { enabledisableAttribute };

export const getCategoryGroupKey = (categoryGroup) => {
    if (!categoryGroup || typeof categoryGroup !== 'object') return '';
    return Object.keys(categoryGroup).find((key) => key !== 'isExpanded') ?? '';
};

export const getCategoryAttributesFromStore = (attributesDataList, categoryKey) => {
    if (!categoryKey || !Array.isArray(attributesDataList)) return [];
    const categoryEntry = attributesDataList.find((entry) => entry?.[categoryKey]);
    return categoryEntry?.[categoryKey] ?? [];
};

export const getCategoryAttributesDataIndex = (attributesDataList, categoryKey) => {
    if (!categoryKey || !Array.isArray(attributesDataList)) return -1;
    return attributesDataList.findIndex((entry) => entry?.[categoryKey]);
};

export const getAttributeUniqueName = (attribute) => attribute?.name ?? attribute?.nAME ?? '';

export const sortAttributesByCount = (attributes = [], zeroDayFieldName = '') => {
    if (!Array.isArray(attributes)) return [];
    return [...attributes].sort((a, b) => {
        if (zeroDayFieldName) {
            if (a?.name === zeroDayFieldName) return -1;
            if (b?.name === zeroDayFieldName) return 1;
        }
        return (b?.sOLRCountValue ?? 0) - (a?.sOLRCountValue ?? 0);
    });
};

/** Count-sorted overflow for dropdown — same ordering as left-panel slice, then slice from sliceValue. */
export const getCategoryDropdownAttributes = ({
    categoryAttributes = [],
    sliceValue = 5,
    zeroDayFieldName = '',
}) => sortAttributesByCount(categoryAttributes, zeroDayFieldName).slice(sliceValue);
