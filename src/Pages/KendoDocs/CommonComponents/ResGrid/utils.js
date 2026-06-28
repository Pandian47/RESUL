import { getStatus } from 'Utils/modules/communicationStatus';
import { process } from '@progress/kendo-data-query';
import { LIST_STATUS_CLASS_MAP, LIST_STATUS_DEFAULT_CLASS } from './config';
/**
 * Resolves status CSS class for list cards — config map, row override, or getStatus(statusID).
 */
export const resolveListStatusClass = (dataItem, listLayout) => {
    if (!dataItem) return LIST_STATUS_DEFAULT_CLASS;

    if (dataItem.statusClassName) return dataItem.statusClassName;

    const statusClassMap = listLayout?.statusClassMap || LIST_STATUS_CLASS_MAP;

    if (dataItem.statusLabel != null && statusClassMap[dataItem.statusLabel]) {
        return statusClassMap[dataItem.statusLabel];
    }

    if (dataItem.statusID != null && dataItem.statusID !== '') {
        const fromMap = statusClassMap[dataItem.statusID];
        if (fromMap) return fromMap;

        return getStatus(dataItem.statusID).className || LIST_STATUS_DEFAULT_CLASS;
    }

    return statusClassMap[dataItem?.statusLabel] || LIST_STATUS_DEFAULT_CLASS;
};

export const formatCellValue = (value) => {
    if (value == null) return 'N/A';
    if (typeof value === 'number' && Number.isNaN(value)) return 'N/A';
    return String(value);
};

export const detectChangeType = (prevState, nextState) => {
    const pagingChanged =
        prevState?.skip !== nextState?.skip || prevState?.take !== nextState?.take;
    const sortingChanged = JSON.stringify(prevState?.sort) !== JSON.stringify(nextState?.sort);
    const filteringChanged =
        JSON.stringify(prevState?.filter) !== JSON.stringify(nextState?.filter);
    return { pagingChanged, sortingChanged, filteringChanged };
};

export const hasActiveFilters = (filter) =>
    filter?.filters?.length > 0;

export const resolveExportFormats = (exportable) => {
    if (!exportable) return { csv: false, excel: false, pdf: false };
    if (exportable === true) return { csv: true, excel: true, pdf: false };
    return {
        csv: exportable.csv !== false,
        excel: exportable.excel !== false,
        pdf: Boolean(exportable.pdf),
    };
};

const escapeCsvValue = (value) => {
    const str = formatCellValue(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

export const exportToCsv = (data, columns, filename = 'grid-export.csv') => {
    const exportColumns = columns.filter((col) => col.field && col.export !== false);
    const header = exportColumns.map((col) => escapeCsvValue(col.title || col.field)).join(',');
    const rows = (data || []).map((row) =>
        exportColumns.map((col) => escapeCsvValue(row[col.field])).join(','),
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
};

export const exportToExcel = (data, columns, filename = 'grid-export.xls') => {
    const exportColumns = columns.filter((col) => col.field && col.export !== false);
    const headerCells = exportColumns
        .map((col) => `<th>${col.title || col.field}</th>`)
        .join('');
    const bodyRows = (data || [])
        .map(
            (row) =>
                `<tr>${exportColumns
                    .map((col) => `<td>${formatCellValue(row[col.field])}</td>`)
                    .join('')}</tr>`,
        )
        .join('');
    const html = `<table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
};

/** Kendo v15 detail rows use detailExpand keyed by dataItemKey, not expandField on rows alone. */
export const buildDetailExpandFromData = (rows, dataItemKey, expandField) => {
    if (!rows?.length || !dataItemKey || !expandField) return undefined;

    return rows.reduce((acc, item) => {
        const key = item?.[dataItemKey];
        if (key !== undefined && key !== null) {
            // Kendo detailExpand keys are stringified in the reducer
            acc[String(key)] = Boolean(item[expandField]);
        }
        return acc;
    }, {});
};

export const processGridData = (data, dataState, isServerSide) => {
    if (isServerSide || !data?.length) {
        return { data: data || [], total: data?.length || 0 };
    }
    const result = process(data, dataState);
    return { data: result.data, total: result.total };
};

export default {
    formatCellValue,
    detectChangeType,
    hasActiveFilters,
    resolveExportFormats,
    exportToCsv,
    exportToExcel,
    buildDetailExpandFromData,
    processGridData,
};
