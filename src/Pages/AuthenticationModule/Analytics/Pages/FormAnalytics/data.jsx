import { numberWithCommas } from 'Utils/modules/formatters';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell';
import { maskEmailTwoCharsBeforeAndAfterDomain, maskPhoneTwoDigitsInMiddle } from 'Utils/modules/masking';

export const overview_data = (reach, engagement, conversion) => [
    {
        name: 'Form views',
        value: reach?.count || 0,
        lists: [],
        footer: {
            name: 'Previous week comparison',
            value: 'NA',
            performance: false,
        },
    },
    {
        name: 'Form engagement',
        value: engagement?.count || 0,
        lists: [],
        footer: {
            name: 'Previous week comparison',
            value: 'NA',
            performance: false,
        },
    },
    {
        name: 'Form submissions',
        value: conversion?.count || 0,
        lists: [],
        footer: {
            name: 'Previous week comparison',
            value: 'NA',
            performance: false,
        },
    },
];

export const keyMetrixData = (keyMetrics) => {
    if (!keyMetrics || typeof keyMetrics !== 'object') {
        return {
            firstData: [],
            middleDataTitle: 'Linked Communications',
            middleDataBg: [],
            lastData: [],
            lastDataTitle: 'Negative feedback',
            lastDataBg: [],
        };
    }

    const {
        totalSent = 0,
        uniqueVisit = 0,
        totalEngaged = 0,
        redeemed = 0,
        channel = 0,
        goalConversionRate = 0,
        status = 'Active',
        avgImpressions = 0,
        duplicateSubmission = 0,
        impToConversion = 0,
        totalSubmission = 0,
        newContactCount = 0,
        communicationCount = 0
    } = keyMetrics;

    return {
        firstData: [
            {
                isOpen: false,
                name: 'Total form submissions',
                value: totalSubmission || 0,
            },
            {
                isOpen: false,
                name: 'New contacts',
                value: newContactCount || 0,
            },
        ],
        middleDataTitle: 'Linked Communications',
        middleDataBg: [
            {
                name: 'Communication',
                value: totalEngaged || 0,
            },
            {
                name: 'Audience',
                value: totalSent || 0,
            },
            {
                name: 'Channel',
                value: channel || 0,
            },
        ],
        lastData: [
            {
                name: 'Conversion rate',
                percent: goalConversionRate || 0,
            },
            {
                name: 'Status',
                value: status || 'Active',
            },
        ],
        lastDataTitle: 'Negative feedback',
        lastDataBg: [
            {
                name: 'Duplicate submissions',
                value: duplicateSubmission || avgImpressions || 0,
            },
        ],
    };
};

export const getHeatmapBackground = (value, allValues) => {
    const numValue = parseInt(value) || 0;
    if (numValue === 0) {
        return { backgroundColor: '#ffffff' }; // White for 0
    }

    const numValues = allValues.map((v) => parseInt(v) || 0);
    const maxValue = Math.max(...numValues);

    if (maxValue === 0) {
        return { backgroundColor: '#ffffff' };
    }

    const percentage = (numValue / maxValue) * 100;

    // Create gradient from light blue to dark blue based on percentage
    // Colors match the image: light blue for most, darker for higher values
    if (percentage >= 90) {
        return { backgroundColor: '#4A90E2' }; // Darkest blue (highest values)
    } else if (percentage >= 70) {
        return { backgroundColor: '#6BA3E3' }; // Dark blue
    } else if (percentage >= 50) {
        return { backgroundColor: '#87B5E4' }; // Medium-dark blue
    } else if (percentage >= 30) {
        return { backgroundColor: '#A8C8E8' }; // Medium blue
    } else if (percentage >= 15) {
        return { backgroundColor: '#C5DBED' }; // Light blue (most common)
    } else {
        return { backgroundColor: '#E3EFF5' }; // Very light blue
    }
};

export const buildProgressiveRows = (progData) => {
    const dynamicCols = progData?.columns || [];

    const rows = progData?.data?.map((item) => {
        const row = {
            Visit: item.Visit,
            No_of_users: item.No_of_users,
        };

        dynamicCols.forEach((col) => {
            row[col] = item[col] ?? 0;
        });

        return row;
    });

    return { progressiveData: rows, dynamicCols };
};
export const buildProgressiveColumns = (rows, dynamicCols) => {
    // precompute values ONLY for dynamic columns
    const valueMap = {};
    dynamicCols.forEach((col) => {
        valueMap[col] = rows.map((r) => r[col]);
    });

    return [
        {
            field: 'Visit',
            title: 'Visit frequency',
            width: 180,
        },
        {
            field: 'No_of_users',
            title: 'No. of users',
            width: 150,
            className: 'text-end',
        },

        // dynamic with heatmap
        ...dynamicCols.map((col) => ({
            field: col,
            title: col,
            width: 140,
            className: 'text-end',
            cell: ({ dataItem }) => {
                const style = getHeatmapBackground(dataItem[col], valueMap[col]);

                return (
                    <td className="text-end" style={style}>
                        {dataItem[col]}
                    </td>
                );
            },
        })),
    ];
};
export const COMMUNICATION_COLUMN_DATA = [
    {
        field: 'rowNo',
        title: 'S.No',
        width: 70,
    },
    {
        field: 'name',
        title: 'Communication name',
        width: 250,
        cell: ({ dataItem }) => {
            return <TruncatedCell value={dataItem?.name || ''} />;
        },
    },
    {
        field: 'startDate',
        title: 'Start date',
        width: 200,
    },
    {
        field: 'endDate',
        title: 'End date',
        width: 200,
    },
    {
        field: 'submissionCount',
        title: 'Total submissions',
        className: 'text-end',
        width: 150,
        cell: ({ dataItem }) => {
            return <td className="text-end">{numberWithCommas(dataItem?.submissionCount || 0)}</td>;
        },
    },
    {
        field: 'uniqueSubmissionCount',
        title: 'Unique submissions',
        className: 'text-end',
        width: 150,
        cell: ({ dataItem }) => {
            return <td className="text-end">{numberWithCommas(dataItem?.uniqueSubmissionCount || 0)}</td>;
        },
    },
];
export const CHANNEL_WISE_COLUMN_DATA = [
    { field: 'rowNo', title: 'S.No.', width: 70 },
    { field: 'channel', title: 'Channel', width: 240 },
    {
        field: 'reach',
        title: 'Form views',
        className: 'text-end',
        width: 160,
        cell: ({ dataItem }) => <td className="text-end">{dataItem?.reach ?? 0}</td>,
    },
    {
        field: 'engagement',
        title: 'Form engagement',
        className: 'text-end',
        width: 180,
        cell: ({ dataItem }) => <td className="text-end">{dataItem?.engagement ?? 0}</td>,
    },
    {
        field: 'conversion',
        title: 'Form submissions',
        className: 'text-end',
        width: 170,
        cell: ({ dataItem }) => <td className="text-end">{dataItem?.conversion ?? 0}</td>,
    },
];
export const LANDING_PAGE_COLUMN_DATA = [
    {
        field: 'rowNo',
        title: 'S.No',
        width: 70,
    },
    {
        field: 'url',
        title: 'Link (URL)',
        width: 400,
    },
    {
        field: 'totalSubmissionCount',
        title: 'Total views',
        className: 'text-end',
        width: 150,
        cell: ({ dataItem }) => {
            return <td className="text-end">{numberWithCommas(dataItem?.totalSubmissionCount || 0)}</td>;
        },
    },
    {
        field: 'uniqueSubmissionCount',
        title: 'Unique views',
        className: 'text-end',
        width: 150,
        cell: ({ dataItem }) => {
            return <td className="text-end">{numberWithCommas(dataItem?.uniqueSubmissionCount || 0)}</td>;
        },
    },
];

export const USER_SUMMARY_COLUMN_DATA = [
    {
        field: 'rowNo',
        title: 'S.No',
        width: 70,
    },
    {
        field: 'name',
        title: 'Name',
        width: 200,
        cell: ({ dataItem }) => {
            return <TruncatedCell value={dataItem?.name || ''} />;
        },
    },
    {
        field: 'emailId',
        title: 'Email ID',
        width: 250,
        cell: ({ dataItem }) => {
            return <td>{dataItem?.emailId ? maskEmailTwoCharsBeforeAndAfterDomain(dataItem?.emailId) : ''}</td>;
        },
    },
    {
        field: 'mobileNo',
        title: 'Mobile number',
        width: 200,
        cell: ({ dataItem }) => {
            return <td>{dataItem?.mobileNo ? maskPhoneTwoDigitsInMiddle(dataItem?.mobileNo) : ''}</td>;
        },
    },
    {
        field: 'communicationName',
        title: 'Communication name',
        width: 250,
        cell: ({ dataItem }) => {
            return <TruncatedCell value={dataItem?.communicationName || ''} />;
        },
    },
    {
        field: 'city',
        title: 'City',
        width: 150,
        cell: ({ dataItem }) => {
            return <TruncatedCell value={dataItem?.city || ''} />;
        },
    },
    {
        field: 'gender',
        title: 'Gender',
        width: 150,
    },
];
