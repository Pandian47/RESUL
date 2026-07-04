import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { numberWithCommas } from 'Utils/modules/formatters';
import { CLASSIFICATION_GROUP_TEXT, FILTER_GROUP_TEXT } from 'Constants/GlobalConstant/Placeholders';
import { age_medium, user_question_mark_medium } from 'Constants/GlobalConstant/Glyphicons';
import { split as _split } from 'Utils/modules/lodashReplacements';

import FilterGroups from './Tab/FilterGroups/FilterGroups';
export const DATACATALOGUE_TAB_CONFIG = [
    {
        id: 1001,
        text: 'Filter groups',
        component: () => <FilterGroups groupName="Filter groups" customText = {FILTER_GROUP_TEXT} />,
    },
    {
        id: 1002,
        text: 'Classification',
        component: () => <FilterGroups groupName={"Classification"} customText = {CLASSIFICATION_GROUP_TEXT}/>,
        //component:() => <Classification handleChange={(classificationGroup) => handleChange(classificationGroup)} />,
    },
];

export const LEGENDS = [
    { color: '#f6f7f8', borderColor: '#d4d6de', text: 'Data ingested' },
    { color: '#eff8ff', borderColor: '#66c8ed', text: 'KPI data' },
    { color: '#f1f8d9', borderColor: '#d1e88e', text: 'Transaction data' },
    { color: '#fee7d7', borderColor: '#fdc69d', text: 'Sensitive data' },
    {
        color: 'rgba(157, 133, 194, 0.32)',
        borderColor: 'rgba(86, 75, 102, 0.26)',
        text: 'Analysis data',
    },
];

export const NEW_LEGENDS = {
    1: { className: 'dataInjested-CSS', color: '#f6f7f8', borderColor: '#d4d6de', text: 'Data ingested' },
    3: { className: 'kpiData-CSS', color: '#eff8ff', borderColor: '#66c8ed', text: 'KPI data' },
    2: {
        className: 'transactionData-CSS',
        color: '#f1f8d9',
        borderColor: '#d1e88e',
        text: 'Transactional data',
    },
    sensitive: { className: 'sensitiveData-CSS', color: '#fee7d7', borderColor: '#fdc69d', text: 'Sensitive data' },
    // analysis: {
    //     className: 'analysisData-CSS',
    //     color: 'rgba(157, 133, 194, 0.32)',
    //     borderColor: 'rgba(86, 75, 102, 0.26)',
    //     text: 'Analysis data',
    // },
};

export const LEGEND_INITIAL_STATE = {
    kpiData: [],
    transactionData: [],
    sensitiveData: [],
    analysisData: [],
};

export const filterAttributes = (attributes, classification) =>
    attributes?.map((res) => {
        const isTransactionData =
            res?.attributeFlag !== '' &&
            res?.attributeFlagValue !== '' &&
            res?.attributeFlag !== null &&
            res?.attributeFlagValue !== null;
        if (isTransactionData) {
            return {
                ...res,
                type: 'transaction',
            };
        } else {
            const sensitiveClassificationId = classification.find(
                (item) => item?.dataClassificationName === 'Sensitive data',
            )?.dataClassificationId;
            const dataClassificationNullCheck =
                res?.dataclassificationId !== null ? _split(res?.dataclassificationId, ',').map((id) => +id) : [];
            const isSensitiveData = dataClassificationNullCheck.includes(sensitiveClassificationId);
            if (isSensitiveData) {
                return {
                    ...res,
                    type: 'sensitive',
                };
            }
        }
        return {
            ...res,
            type: '',
        };
    });

export const CLASSIFICATION_ICON = {
    'Sensitive data': `${age_medium}`,
    'Content target': `${age_medium}`,
    'Profile completeness': `${age_medium}`,
    'Audience overview': `${age_medium}`,
    'Advanced analytics': `${age_medium}`,
    'Offline conversion': `${age_medium}`,
    'Audience base': `${age_medium}`,
    Offers: `${age_medium}`,
    GDPR: `${age_medium}`,
    'Sub-segment': `${age_medium}`,
    Personalisation: `${user_question_mark_medium}`,
    Personalization: `${user_question_mark_medium}`,
};

export const DATACATALOGUE_GRID_COLUMN = (filterGroups, dataTypes, inputTypes) => [
    {
        field: 'friendly_name',
        filtervalue: 'string',
        title: 'Friendly name',
        width: 250,
        filter:'text'
    },
    {
        field: 'attribute_name',
        filtervalue: 'string',
        title: 'Attribute name',
        width: 250,
        filter:'text'
    },
    {
        field: 'filter_group_name',
        filtervalue: 'string',
        title: 'Filter group name',
        // cell: ({ dataItem }) => {
        //     const rec = _find(filterGroups, ['filterGroupId', +dataItem?.filterGroupId]);
        //     return <td>{rec?.filterGroupName || ''}</td>;
        // },
        width: 250,
        filter:'text'
    },
    {
        field: 'input_type',
        filtervalue: 'string',
        title: 'Input type',
        // cell: ({ dataItem }) => {
        //     const rec = _find(inputTypes, ['fieldTypeId', +dataItem?.fieldTypeId]);
        //     return <td>{rec?.fieldType || ''}</td>;
        // },
        width: 150,
        filter:'text'
    },
    {
        field: 'data_type',
        filtervalue: 'string',
        title: 'Data type',
        // cell: ({ dataItem }) => {
        //     const rec = _find(dataTypes, ['dataTypeId', dataItem?.dataTypeId]);
        //     return <td>{rec?.dataTypeName || ''}</td>;
        // },
        width: 150,
        filter:'text'
    },
    {
        field: 'parent/Child',
        filtervalue: 'string',
        title: 'Parent/Child',
        width: 250,
        filter:'text'
    },
    {
        field: 'created_date',
        filtervalue: 'date',
        title: 'Created date',
        cell: ({ dataItem }) => <td>{dataItem?.created_date ? getUserCurrentFormat(dataItem?.created_date)?.dateTimeFormat || '' : ''}</td>,
        width: 200,
        filter:'date'
    },
    {
        field: 'last_refresh_date',
        filtervalue: 'date',
        title: 'Last refresh date (Source)',
        cell: ({ dataItem }) => <td>{dataItem?.last_refresh_date ? getUserCurrentFormat(dataItem?.last_refresh_date)?.dateTimeFormat || '' : ''}</td>,
        width: 250,
        filter:'date'
    },
    {
        field: 'last_indexed_date',
        filtervalue: 'date',
        title: 'Last indexed date',
        cell: ({ dataItem }) => <td>{dataItem?.last_indexed_date ? getUserCurrentFormat(dataItem?.last_indexed_date)?.dateTimeFormat || '' : ''}</td>,
        width: 250,
        filter:'date'
    },
    {
        field: 'source',
        filtervalue: 'string',
        title: 'Source',
        width: 250,
        filter:'text'
    },
    {
        field: 'used_status',
        filtervalue: 'string',
        title: 'Used status',
        width: 250,
        filter:'text'
    },
    {
        field: 'last_used_date',
        filtervalue: 'date',
        title: 'Last used date',
        cell: ({ dataItem }) => <td>{dataItem?.last_used_date ? getUserCurrentFormat(dataItem?.last_used_date)?.dateTimeFormat || '' : ''}</td>,
        width: 250,
        filter:'date'
    },
    {
        field: 'count',
        filtervalue: 'numeric',
        title: 'Count',
        cell: ({ dataItem }) => <td style={{textAlign:'right'}}>{numberWithCommas(dataItem?.count )|| ''}</td>,
        width: 100,
        filter:'numeric'

    },
    {
        field: 'frequency',
        filtervalue: 'string',
        title: 'Frequency',
        width: 250,
        filter:'text'
    },
];
