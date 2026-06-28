export const columnConfig = [
    { field: 'columnName', title: 'Column name' },
    { field: 'dataType', title: 'Type' },
    { field: 'missingValuesCount', title: 'Missing count', className: 'text-right' },
    // { field: 'errorCount', title: 'Error count', className: 'text-right' },
];

export const listAnalysisData = [
    { name: 'Name', type: 'String', count: 0, remark: 'Invalid' },
    { name: 'Email', type: 'Alphanumeric', count: 0, remark: 'NA' },
    { name: 'Mobile no', type: 'Numeric', count: 0, remark: 'Invalid' },
    { name: 'AUM', type: 'Numeric', count: 3, remark: 'NA' },
    { name: 'Category', type: 'Numeric', count: 3, remark: 'Invalid' },
    { name: 'Unsecured Overdraft limit', type: 'Numeric', count: 3, remark: 'Invalid' },
    { name: 'Unsecured credit limit', type: 'Numeric', count: 3, remark: 'Invalid' },
];
