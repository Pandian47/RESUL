import { truncateTitle } from 'Utils/modules/displayCore';
import RSTooltip from 'Components/RSTooltip';
import HistoryGrid from './Components/HistoryGrid/HistoryGrid';


export const SYNC_HISTORY_REQUEST_MODE = {
    IMPORT: 'Import',
    EXPORT: 'Export',
};

export const SOURCE_FILTER_DEFAULT = 'all';

// Source-wise filter shown in the Pipeline view. The filter is driven by the
// numeric `ImportSourceID` field returned per pipeline run. Anything that is
// not Manual entry / CSV / FTP / SFTP / Excel is treated as "Remote data source".
export const SOURCE_FILTER_OPTIONS = [
    { id: SOURCE_FILTER_DEFAULT, text: 'All' },
    { id: 'manual', text: 'Manual entry' },
    { id: 'csv', text: 'CSV' },
    { id: 'ftp_sftp', text: 'FTP/SFTP' },
    { id: 'excel', text: 'Excel' },
    { id: 'remote', text: 'Remote data source' },
];

// Canonical ImportSourceID values used across the audience module
// (see AddAudience/index.jsx and editFlowHandler.jsx).
const SOURCE_TYPE_IDS = {
    manual: [32],
    csv: [7],
    ftp_sftp: [4, 8],
    excel: [169],
};

// Textual fallbacks in case the row only carries a `source` label (no numeric id).
const SOURCE_ALIASES = {
    manual: ['manual', 'manual entry', 'manualentry', 'manual_entry'],
    csv: ['csv'],
    ftp_sftp: ['ftp', 'sftp', 'ftp/sftp', 'ftp_sftp'],
    excel: ['excel', 'xls', 'xlsx'],
};

const ALL_KNOWN_IDS = new Set(Object.values(SOURCE_TYPE_IDS).flat());

const normalizeSource = (value) => String(value ?? '').trim().toLowerCase();

const isKnownSourceText = (normalized) =>
    Object.values(SOURCE_ALIASES).some((aliases) => aliases.includes(normalized));

const parseSourceId = (value) => {
    if (value === null || value === undefined || value === '') return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
};

/**
 * Does the row match the currently selected source filter id?
 *
 * Pass the whole row; the helper inspects `ImportSourceID` first (preferred),
 * then falls back to the textual `source` field for legacy rows.
 */
export const matchesSourceFilter = (row, sourceFilterId) => {
    if (!sourceFilterId || sourceFilterId === SOURCE_FILTER_DEFAULT) return true;

    const importSourceID = parseSourceId(
        row?.importSourceID ?? row?.ImportSourceID ?? row?.import_source_id,
    );
    const sourceText = normalizeSource(row?.source ?? row?.Source);

    if (sourceFilterId === 'remote') {
        if (importSourceID !== null) return !ALL_KNOWN_IDS.has(importSourceID);
        if (sourceText && sourceText !== 'na') return !isKnownSourceText(sourceText);
        return false;
    }

    const ids = SOURCE_TYPE_IDS[sourceFilterId] || [];
    if (importSourceID !== null) return ids.includes(importSourceID);

    const aliases = SOURCE_ALIASES[sourceFilterId] || [];
    return aliases.includes(sourceText);
};

export const buildPayload = (formState = {}) => {
    const {
        startDate = '',
        endDate = '',
        requestMode = '',
        departmentId = 0,
        sortByColumn = '',
        sortBy = '',
        pageNumber = 1,
        itemsPerPage = 5,
        clientId,
        userId,
        sourceFilter = SOURCE_FILTER_DEFAULT,
    } = formState;
    return {
        clientId,
        userId,
        startDate,
        endDate,
        requestMode,
        departmentId,
        sortByColumn,
        sortBy,
        pageNumber,
        itemsPerPage,
        sourceFilter,
    };
};

export const IMPORT_GRID_COLUMN = [
    {
        field: 'source',
        title: 'Source',
    },
    {
        field: 'fileName',
        title: 'File name',
    },
    {
        field: 'scheduleFrequency',
        title: 'Update cycle',
    },
    {
        field: 'audience',
        title: 'Audience',
        filter: 'numeric',
    },
    {
        field: 'uniqueAudiences',
        title: 'Unique audience',
        filter: 'numeric',
    },
    {
        field: 'unmatchedAudiences',
        title: 'Unmatched audience',
        filter: 'numeric',
    },
    {
        field: 'existingAudiences',
        title: 'Existing audience',
        filter: 'numeric',
    },
    {
        field: 'lastUpdatedTime',
        title: 'Last update',
        filter: 'date',
    },
    {
        field: 'nextUpdateTime',
        title: 'Next update',
        filter: 'date',
    },
    {
        field: 'importDescription',
        title: 'Import description',
        filter: 'text',
        // cell: ({ dataItem }) => (
        //     <td>
        //         {dataItem?.securityGroupName?.length > 30 ? (
        //             <RSTooltip text={dataItem?.securityGroupName} position="top" className="d-inline-block">
        //                 <span className="m0">{truncateTitle(dataItem?.securityGroupName, 30)}</span>
        //             </RSTooltip>
        //         ) : (
        //             <span className="m0">{dataItem?.securityGroupName}</span>
        //         )}
        //     </td>
        // ),
    },
    {
        field: 'importStatus',
        title: 'Status',
        width: '200px',
    },
    {
        field: 'action',
        title: 'Actions',
        width: '200px',
    },
];

export const EXPORT_GRID_COLUMN = [
    {
        field: 'source',
        title: 'Source',
    },
    {
        field: 'scheduleFrequency',
        title: 'Update cycle',
    },
    // {
    //     field: 'fileName',
    //     title: 'Table name',
    // },
     {
        field: 'exportAudiences',
        title: 'Total audience',
        filter: 'numeric',
    },
     {
        field: 'validAudiences',
        title: 'Inserted audience',
        filter: 'numeric'
    },
     {
        field: 'invalidAudiences',
        title: 'Ignored audience',
        filter: 'numeric',
    },
    {
        field: 'lastUpdatedTime',
        title: 'Last update',
        filter: 'date',
    },
    {
        field: 'nextUpdateTime',
        title: 'Next update',
        filter: 'date',
    },
    {
        field: 'exportStatus',
        title: 'Status',
        width: '200px',
    },
];

export const TAB_CONFIG = [
    {
        id: SYNC_HISTORY_REQUEST_MODE.IMPORT,
        text: 'Import',
        component: () => <HistoryGrid columnData={IMPORT_GRID_COLUMN} />,
    },
    {
        id: SYNC_HISTORY_REQUEST_MODE.EXPORT,
        text: 'Export',
        component: () => <HistoryGrid columnData={EXPORT_GRID_COLUMN} />,
    },
];
