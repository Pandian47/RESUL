/**
 * CSV / Excel upload confirmation copy — standalone strings (no Placeholders barrel imports).
 * Mirrors Constants/GlobalConstant/Placeholders upload-list rules for the audience chunk.
 */

const ADHOC_AUDIENCE = '5 million';
const ADHOC_ATTRIBUTES = 25;
const FILE_SIZE = '10MB';
const FILE_COUNT = 5;
const FILE_COUNT_TL = 6;
const FILE_COUNT_SL = 100;
const MATCH_LIST_ATTRIBUTES = 5;
const SEED_LIST_AUDIENCE = 500;
const SEED_LIST_ATTRIBUTES = 20;

export const AUDIENCE_UPLOAD_LIST_LABELS = Object.freeze({
    AD_HOC_LIST: 'Ad-hoc list rules:',
    EACH_FILE_CAN_CONTAIN: `Each file can contain up to ${ADHOC_AUDIENCE} records, with a maximum of ${ADHOC_ATTRIBUTES} attributes per record.`,
    UPLOAD_CSV_FILES: `You can upload a maximum of ${FILE_COUNT} CSV files.`,
    UPLOAD_CSV_FILES_EXCEL: `You can upload a maximum of ${FILE_COUNT} excel files.`,
    EACH_FILES: `Each file must be ${FILE_SIZE} or smaller.`,
    ENSURE_CONSISTENT_UPLOAD_CSV_FILES: 'Ensure consistent column headers across all uploaded CSV files.',
    ENSURE_CONSISTENT_UPLOAD_CSV_FILES_EXCEL:
        'Ensure consistent column headers across all uploaded excel files.',
    WILL_EXPIRE_120_DAYS: 'This list will expire in 120 days and cannot be reused after expiration.',
    SPACES_COLUMN_HEADERS:
        'Spaces in column headers will be automatically replaced with underscores (e.g., “First Name” becomes “First_Name”).',
    ADHOCLIST_ONE_MILLON_RECORDS: 'Processing 1 million records may take up to 3 hours.',
    ADHOCLIST_VALUES_RETAINED:
        'Duplicate values in the CSV file will not be removed. Note: Bad or spam email IDs may negatively impact your sender domain reputation.',
    ADHOCLIST_VALUES_RETAINED_EXCEL:
        'Duplicate values in the excel file will not be removed. Note: Bad or spam email IDs may negatively impact your sender domain reputation.',
    SUPPRESSION_INPUT_LIST: 'Suppression input list rules:',
    SUPPRESSIONLIST_12_ATTRIBUTES: `Each file can contain up to ${ADHOC_AUDIENCE} records, with a maximum of ${MATCH_LIST_ATTRIBUTES} attributes per record.`,
    SUPPRESSION_MULTIPLE_FILES:
        'If uploading multiple CSV files, ensure consistent column headers across all files. Column headers must exactly match the corresponding existing attributes in the platform.',
    SUPPRESSION_MULTIPLE_FILES_EXCEL:
        'If uploading multiple excel files, ensure consistent column headers across all files. Column headers must exactly match the corresponding existing attributes in the platform.',
    SUPPRESSION_UPLOAD_SV_FILES: `You may upload up to ${FILE_COUNT_TL} CSV files per submission.`,
    SUPPRESSION_UPLOAD_SV_FILES_EXCEL: `You may upload up to ${FILE_COUNT_TL} excel files per submission.`,
    MATCH_INPUT_LIST: 'Match input list rules:',
    MATCH_EACH_FILE_CONTAIN: `Each file can contain up to ${ADHOC_AUDIENCE} records, with a maximum of ${MATCH_LIST_ATTRIBUTES} attributes per record.`,
    MATCH_ENSURE_CONSISTENT:
        'Column headers must match existing attributes and be consistent across all uploaded CSV files.',
    MATCH_ENSURE_CONSISTENT_EXCEL:
        'Column headers must match existing attributes and be consistent across all uploaded excel files.',
    MATCH_CAN_UPLOAD: `You can upload up to ${FILE_COUNT_TL} CSV files.`,
    MATCH_CAN_UPLOAD_EXCEL: `You can upload up to ${FILE_COUNT_TL} excel files.`,
    SEED_LIST: 'Seed list rules:',
    SEED_FILE_SIZE: 'File size must not exceed 10MB.',
    SEED_EACH_FILE: `Each file can contain up to ${SEED_LIST_AUDIENCE} audience records, with a maximum of ${SEED_LIST_ATTRIBUTES} attributes per record.`,
    SEED_BUSINESS_UNIT: `A maximum of  ${FILE_COUNT_SL} seed lists can be created per business unit.`,
    SEED_CSV_FILE: 'Each record must include a valid Email ID or Mobile Number.',
    SEED_NOTE:
        'Avoid uploading invalid or spam-prone email addresses, as this can harm your sender domain reputation.',
});
