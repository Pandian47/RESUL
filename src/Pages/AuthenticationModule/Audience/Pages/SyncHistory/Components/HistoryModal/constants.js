import { toTitleCase } from 'Utils/modules/stringUtils';
import { isConfigurationAttributeColumn, isNumericGridValue } from 'Pages/AuthenticationModule/Audience/audienceDefaults';
import { AUDIENCE_HISTORY_LABELS as H } from 'Pages/AuthenticationModule/Audience/audienceHistoryLabels';
export { isConfigurationAttributeColumn, isNumericGridValue as isNumericValue };

export const getSummaryTitle = (status) => {
    const statusKey = status?.key?.toLowerCase() || '';
    if (statusKey.includes('warning')) {
        return H.AUDIENCE_IMPORTED_WITH_WARNINGS;
    }
    if (statusKey.includes('dedup') || statusKey.includes('dedupe')) {
        return H.DUPLICATE_RECORDS_NOT_IMPORTED;
    }
    if (statusKey.includes('invalid')) {
        return H.AUDIENCE_NOT_IMPORTED;
    }
    return H.AUDIENCE_IMPORT_SUMMARY;
};

export const generateHeaders = (list) => {
    if (list?.length) {
        let headers = Object.keys(list?.[0]);
        headers = headers.map((head) => ({
            field: head,
            title: toTitleCase(head),
            width: 150,
        }));
        return headers;
    }
};

/** Placeholder columns while grid data is loading — matches typical import summary layout */
export const DEFAULT_SKELETON_COLUMNS = [
    { field: 'name', title: 'Name', width: 150 },
    { field: 'city', title: 'City', width: 150 },
    { field: 'mobileNo', title: 'Mobile no', width: 150 },
    { field: 'emailID', title: 'Email ID', width: 150 },
    { field: 'age', title: 'Age', width: 150 },
];

export const SKELETON_COLUMN_COUNT = DEFAULT_SKELETON_COLUMNS.length;
