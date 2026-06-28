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
