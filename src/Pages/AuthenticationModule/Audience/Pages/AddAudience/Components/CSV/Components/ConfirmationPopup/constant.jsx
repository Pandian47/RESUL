import { AUDIENCE_UPLOAD_LIST_LABELS as L } from 'Pages/AuthenticationModule/Audience/audienceUploadListLabels';
import { AUDIENCE_GLYPH as G } from 'Pages/AuthenticationModule/Audience/audienceGlyphs';
import { Fragment } from 'react';

const getFileTypeLabel = (fileType) => {
    return fileType && fileType.toLowerCase() === 'excel' ? 'excel' : 'CSV';
};

export const getListsConstant = (fileType = 'CSV') => {
    const fileTypeLabel = getFileTypeLabel(fileType);

    return {
        adhoclist: {
            title: L.AD_HOC_LIST,
            footerAlert: true,
            options: [
                {
                    id: 'adhoclist_not_more_than_10mb',
                    text: fileTypeLabel === 'CSV' ? L.UPLOAD_CSV_FILES : L.UPLOAD_CSV_FILES_EXCEL,
                },
                {
                    id: 'adhoclist_12_attributes',
                    text: L.EACH_FILE_CAN_CONTAIN,
                },
                {
                    id: 'each_file_10mb',
                    text: L.EACH_FILES,
                },
                {
                    id: 'adhoclist_mutiple_csv_files',
                    text:
                        fileTypeLabel === 'CSV'
                            ? L.ENSURE_CONSISTENT_UPLOAD_CSV_FILES
                            : L.ENSURE_CONSISTENT_UPLOAD_CSV_FILES_EXCEL,
                },
                {
                    id: 'adhoclist_expire_120days',
                    text: L.WILL_EXPIRE_120_DAYS,
                },
                {
                    id: 'adhoclist_header_space',
                    text: L.SPACES_COLUMN_HEADERS,
                },
                {
                    id: 'adhoclist_one_millon_records',
                    text: L.ADHOCLIST_ONE_MILLON_RECORDS,
                },
                {
                    id: 'adhoclist_values_retained',
                    text: fileTypeLabel === 'CSV' ? L.ADHOCLIST_VALUES_RETAINED : L.ADHOCLIST_VALUES_RETAINED_EXCEL,
                },
            ],
        },
        supressionList: {
            title: L.SUPPRESSION_INPUT_LIST,
            options: [
                {
                    id: 'supressionList_12_attributes',
                    text: L.SUPPRESSIONLIST_12_ATTRIBUTES,
                },
                {
                    id: 'supressionList_mutiple_csv_files',
                    text: L.SEED_FILE_SIZE,
                },
                {
                    id: 'supressionList_multiple_files_upload',
                    text: fileTypeLabel === 'CSV' ? L.SUPPRESSION_MULTIPLE_FILES : L.SUPPRESSION_MULTIPLE_FILES_EXCEL,
                },
                {
                    id: 'supressionList_Spaces_in_column_headers',
                    text: L.SPACES_COLUMN_HEADERS,
                },
                {
                    id: 'supressionList_one_millon_records',
                    text: fileTypeLabel === 'CSV' ? L.SUPPRESSION_UPLOAD_SV_FILES : L.SUPPRESSION_UPLOAD_SV_FILES_EXCEL,
                },
                {
                    id: 'supressionList_adhoc_one_millon',
                    text: L.ADHOCLIST_ONE_MILLON_RECORDS,
                },
            ],
        },
        matchList: {
            title: L.MATCH_INPUT_LIST,
            options: [
                {
                    id: 'matchList_12_attributes',
                    text: L.MATCH_EACH_FILE_CONTAIN,
                },
                {
                    id: 'matchList_mutiple_csv_files',
                    text: L.SEED_FILE_SIZE,
                },
                {
                    id: 'matchList_multiple_files_upload',
                    text: fileTypeLabel === 'CSV' ? L.MATCH_ENSURE_CONSISTENT : L.MATCH_ENSURE_CONSISTENT_EXCEL,
                },
                {
                    id: 'matchList_Spaces_in_column_headers',
                    text: L.SPACES_COLUMN_HEADERS,
                },
                {
                    id: 'matchList_one_millon_records',
                    text: fileTypeLabel === 'CSV' ? L.MATCH_CAN_UPLOAD : L.MATCH_CAN_UPLOAD_EXCEL,
                },
                {
                    id: 'matchList_adhoc_one_millon',
                    text: L.ADHOCLIST_ONE_MILLON_RECORDS,
                },
            ],
        },
        seedList: {
            title: L.SEED_LIST,
            options: [
                {
                    id: 'Only_1_CSV',
                    text: `You can upload only 1 ${fileTypeLabel === 'excel' ? 'excel' : 'CSV'} file.`,
                },
                {
                    id: 'Max_10_mb',
                    text: L.SEED_FILE_SIZE,
                },
                {
                    id: 'seed_list_12_attributes',
                    text: L.SEED_EACH_FILE,
                },
                {
                    id: 'seed_list_mutiple_csv_files',
                    text: L.SEED_BUSINESS_UNIT,
                },
                {
                    id: 'valid_email_id_or_mobile_number',
                    text: L.SEED_CSV_FILE,
                },
                {
                    id: 'note_domain_reputation',
                    text: L.SEED_NOTE,
                },
            ],
        },
    };
};

export const ListComponent = ({ options }) => (
    <Fragment>
        {options.map(({ text, id }) => (
            <li key={id}>
                <i className={`${G.circle_arrow_right_mini} icon-xs color-white cursor-normal`} />
                <span>{text}</span>
            </li>
        ))}
    </Fragment>
);
