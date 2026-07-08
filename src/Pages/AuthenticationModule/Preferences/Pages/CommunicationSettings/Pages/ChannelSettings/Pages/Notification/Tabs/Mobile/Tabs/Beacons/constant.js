export const BEACON_FORM_DEFAULTS = {
    name: '',
    uuid: '',
    major: '',
    minor: '',
    store: null,
    floor: null,
    zoneName: '',
    identification: null,
    onboardingType: 'Manual entry',
    csvFile: null,
};

export const BEACON_ONBOARDING_TYPE_MANUAL = 'Manual entry';
export const BEACON_ONBOARDING_TYPE_IMPORT_CSV = 'Import via csv';

export const INSTORE_IDENTIFICATION = 'Instore';
export const ENTRANCE_IDENTIFICATION = 'Store Entrance';
export const EXIT_IDENTIFICATION = 'Store Exit';

export const IDENTIFICATION_ENTRANCE_EXIT = [
    ENTRANCE_IDENTIFICATION,
    EXIT_IDENTIFICATION,
];

export const DEFAULT_IDENTIFICATION_OPTIONS = [
    { id: 1, value: INSTORE_IDENTIFICATION },
    { id: 2, value: ENTRANCE_IDENTIFICATION },
    { id: 3, value: EXIT_IDENTIFICATION },
];

export const DEFAULT_IDENTIFICATION_SELECTION = [DEFAULT_IDENTIFICATION_OPTIONS[0]];

export const IDENTIFICATION_OPTIONS = DEFAULT_IDENTIFICATION_OPTIONS;
export const IDENTIFICATION_VALUE_LIST = DEFAULT_IDENTIFICATION_OPTIONS.map((item) => item.value);

export const DEFAULT_FLOOR_OPTIONS = [
    { id: 1, value: 'Ground Floor' },
    { id: 2, value: 'First Floor' },
    { id: 3, value: 'Second Floor' },
    { id: 4, value: 'Basement' },
];

export const FLOOR_OPTIONS = DEFAULT_FLOOR_OPTIONS;

const normalizeListValues = (list = []) => {
    if (!Array.isArray(list)) return [];
    return list
        .map((item) => {
            if (typeof item === 'string') return item.trim();
            return (item?.value || item?.name || item?.label || '').trim();
        })
        .filter(Boolean);
};

export const buildDropdownOptions = (values = [], baseOptions = []) => {
    const mergedValues = [
        ...baseOptions.map((item) => item.value),
        ...normalizeListValues(values),
    ];
    const uniqueValues = mergedValues.filter(
        (value, index, array) =>
            array.findIndex((entry) => entry.toLowerCase() === value.toLowerCase()) === index,
    );

    return uniqueValues.map((value, index) => {
        const existing = baseOptions.find(
            (item) => item.value.toLowerCase() === value.toLowerCase(),
        );
        return existing || { id: index + 1, value };
    });
};

export const appendDropdownOption = (options = [], newValue = '') => {
    const trimmed = newValue?.trim();
    if (!trimmed) return options;

    const exists = options.some(
        (item) => item.value?.toLowerCase() === trimmed.toLowerCase(),
    );
    if (exists) return options;

    const nextId = options.reduce((maxId, item) => Math.max(maxId, Number(item.id) || 0), 0) + 1;
    return [...options, { id: nextId, value: trimmed }];
};

export const optionsToValueList = (options = []) =>
    options.map((item) => item?.value).filter(Boolean);

export const getIdentificationOption = (value) =>
    DEFAULT_IDENTIFICATION_OPTIONS.find((item) => item.value === value) || { id: 0, value };

export const parseIdentificationSelection = (value) => {
    if (!value) return [...DEFAULT_IDENTIFICATION_SELECTION];
    if (Array.isArray(value)) {
        return value.length
            ? value.map((item) => (typeof item === 'string' ? getIdentificationOption(item) : item))
            : [...DEFAULT_IDENTIFICATION_SELECTION];
    }
    if (typeof value === 'string') {
        const parts = value.split(',').map((part) => part.trim()).filter(Boolean);
        if (!parts.length) return [...DEFAULT_IDENTIFICATION_SELECTION];
        return parts.map(getIdentificationOption);
    }
    if (value?.value) return [value];
    return [...DEFAULT_IDENTIFICATION_SELECTION];
};

export const normalizeIdentificationSelection = (nextValue = [], prevValue = []) => {
    const toItems = (input) =>
        (Array.isArray(input) ? input : [])
            .map((item) => (typeof item === 'string' ? getIdentificationOption(item) : item))
            .filter((item) => item?.value);

    const nextItems = toItems(nextValue);
    const prevItems = toItems(prevValue);
    const nextValues = nextItems.map((item) => item.value);
    const prevValues = prevItems.map((item) => item.value);

    const addedInstore =
        nextValues.includes(INSTORE_IDENTIFICATION) &&
        !prevValues.includes(INSTORE_IDENTIFICATION);
    const addedEntranceExit = IDENTIFICATION_ENTRANCE_EXIT.some(
        (entry) => nextValues.includes(entry) && !prevValues.includes(entry),
    );

    if (addedInstore) {
        return [getIdentificationOption(INSTORE_IDENTIFICATION)];
    }
    if (addedEntranceExit) {
        return nextItems.filter((item) => item.value !== INSTORE_IDENTIFICATION);
    }
    if (!nextItems.length) {
        return [...DEFAULT_IDENTIFICATION_SELECTION];
    }
    return nextItems;
};

export const serializeIdentificationValue = (selected = []) => {
    const values = parseIdentificationSelection(selected).map((item) => item.value);
    if (!values.length || values.includes(INSTORE_IDENTIFICATION)) {
        return INSTORE_IDENTIFICATION;
    }
    return values.join(', ');
};

export const findStoreOption = (value, storeOptions = []) => {
    if (!value) return null;
    const match = storeOptions.find((opt) => opt.legalName === value);
    return match || { brandID: 0, legalName: value };
};

export const resolveStoreValue = (selected) => {
    if (!selected) return '';
    if (typeof selected === 'string') return selected;
    return selected?.legalName || '';
};

export const resolveDropdownValue = (selected, options = []) => {
    if (!selected) return '';
    if (typeof selected === 'string') {
        return selected;
    }
    if (selected?.value) {
        return selected.value;
    }
    const match = options.find((opt) => opt.id === selected?.id);
    return match?.value || '';
};

export const findDropdownOption = (value, options = []) => {
    if (!value) return null;
    return options.find((opt) => opt.value === value) || { id: 0, value };
};

export const getBeaconFormDefaults = () => ({
    ...BEACON_FORM_DEFAULTS,
    identification: [...DEFAULT_IDENTIFICATION_SELECTION],
});

export const BEACON_CSV_HEADER_STRING = 'Name,Major,Minor,UUID,Store,Floor,ZoneName,Identification';

export const BEACON_CSV_HEADERS = BEACON_CSV_HEADER_STRING.split(',');

export const BEACON_SAMPLE_CSV_CONTENT = [
    BEACON_CSV_HEADER_STRING,
    'Entrance Beacon,1,1,a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11,Store A,Ground Floor,Entrance Zone,Store Entrance',
    'Exit Beacon,2,2,0debc99-9c0b-4ef8-bb6d-6bb9bd380a12,Store A,Ground Floor,Exit Zone,Store Exit',
    'Entrance and Exit Beacon,3,3,a0ebc99-9c0b-4ef8-bb6d-6bb9bd380a13,Store A,Ground Floor,Entrance and Exit Zone,"Store Entrance, Store Exit"',
    'Instore Beacon,4,4,b1ebc99-9c0b-4ef8-bb6d-6bb9bd380a14,Store A,First Floor,Electronics Zone,Instore',
];

export const BEACON_CSV_FORMAT_ROWS = [
    {
        id: 'headers',
        label: 'First row should contain headers',
        value: BEACON_CSV_HEADER_STRING,
    },
    { id: 'name', label: 'Name', value: 'Required. Beacon name' },
    { id: 'major', label: 'Major', value: 'Required. Non-negative integer' },
    { id: 'minor', label: 'Minor', value: 'Required. Non-negative integer' },
    { id: 'uuid', label: 'UUID', value: 'Required. Beacon UUID' },
    {
        id: 'store',
        label: 'Store',
        value: 'Optional. Must match an existing store name from the store list when provided',
    },
    { id: 'floor', label: 'Floor', value: 'Optional. Floor name or number' },
    { id: 'zoneName', label: 'ZoneName', value: 'Optional. Zone name' },
    {
        id: 'identification',
        label: 'Identification',
        value:
            'Required. Instore, Store Entrance, Store Exit, or "Store Entrance, Store Exit" (quote combined values)',
    },
];

const BEACON_NAME_MAX_LENGTH = 50;
const BEACON_UUID_MAX_LENGTH = 50;
const BEACON_ZONE_MAX_LENGTH = 50;

const parseCsvLine = (line) => {
    const cells = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
        const char = line[i];
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i += 1;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            cells.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    cells.push(current.trim());
    return cells;
};

export const parseBeaconCsvText = (text = '') => {
    const lines = String(text)
        .replace(/^\uFEFF/, '')
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    if (!lines.length) {
        return { headers: [], rows: [] };
    }

    const headers = parseCsvLine(lines[0]);
    const rows = lines.slice(1).map((line, index) => {
        const values = parseCsvLine(line);
        const row = {};
        headers.forEach((header, headerIndex) => {
            row[header] = values[headerIndex] ?? '';
        });
        return { ...row, __rowNumber: index + 2 };
    });

    return { headers, rows };
};

const isNonNegativeInteger = (value) => {
    if (value === '' || value === null || value === undefined) return false;
    const num = Number(value);
    return Number.isInteger(num) && num >= 0;
};

const VALID_IDENTIFICATION_SINGLE_VALUES = [
    INSTORE_IDENTIFICATION,
    ENTRANCE_IDENTIFICATION,
    EXIT_IDENTIFICATION,
];

export const isValidBeaconIdentification = (value = '') => {
    const parts = String(value || '')
        .trim()
        .split(',')
        .map((part) => part.trim().toLowerCase())
        .filter(Boolean);

    if (parts.length === 1) {
        return VALID_IDENTIFICATION_SINGLE_VALUES.some(
            (option) => option.toLowerCase() === parts[0],
        );
    }
    if (parts.length === 2) {
        const entranceExitLower = IDENTIFICATION_ENTRANCE_EXIT.map((entry) => entry.toLowerCase());
        return parts.every((part) => entranceExitLower.includes(part)) && new Set(parts).size === 2;
    }
    return false;
};

export const isValidBeaconStore = (value = '', storeOptions = []) => {
    const trimmed = String(value || '').trim();
    if (!trimmed) return true;
    return storeOptions.some(
        (opt) => (opt?.legalName || '').trim().toLowerCase() === trimmed.toLowerCase(),
    );
};

export const validateBeaconCsv = (text = '', storeOptions = []) => {
    const errors = [];
    const trimmed = String(text).trim();

    if (!trimmed) {
        const message = 'File is empty.';
        return { valid: false, rows: [], errors: [message], message };
    }

    const { headers, rows } = parseBeaconCsvText(trimmed);

    if (!headers.length) {
        const message = 'File has no header row.';
        return { valid: false, rows: [], errors: [message], message };
    }

    const headerMismatch = BEACON_CSV_HEADERS.some(
        (expected, index) => headers[index] !== expected,
    ) || headers.length !== BEACON_CSV_HEADERS.length;

    if (headerMismatch) {
        const normalizedHeaders = headers.map((header) => header.trim());
        const missing = BEACON_CSV_HEADERS.filter((column) => !normalizedHeaders.includes(column));
        const message = missing.length
            ? `Required columns missing: ${missing.join(', ')}.`
            : 'Invalid headers/column count';

        return {
            valid: false,
            rows: [],
            errors: [message],
            message,
        };
    }

    if (!rows.length) {
        const message = 'File has no data rows.';
        return { valid: false, rows: [], errors: [message], message };
    }

    rows.forEach((row) => {
        const rowLabel = `Row ${row.__rowNumber}`;

        if (!row.Name?.trim()) {
            errors.push(`${rowLabel}: Name is required.`);
        } else if (row.Name.trim().length > BEACON_NAME_MAX_LENGTH) {
            errors.push(`${rowLabel}: Name must be at most ${BEACON_NAME_MAX_LENGTH} characters.`);
        }

        if (!isNonNegativeInteger(row.Major)) {
            errors.push(`${rowLabel}: Major must be a non-negative integer.`);
        }

        if (!isNonNegativeInteger(row.Minor)) {
            errors.push(`${rowLabel}: Minor must be a non-negative integer.`);
        }

        if (!row.UUID?.trim()) {
            errors.push(`${rowLabel}: UUID is required.`);
        } else if (row.UUID.trim().length > BEACON_UUID_MAX_LENGTH) {
            errors.push(`${rowLabel}: UUID must be at most ${BEACON_UUID_MAX_LENGTH} characters.`);
        }

        if (row.ZoneName?.trim() && row.ZoneName.trim().length > BEACON_ZONE_MAX_LENGTH) {
            errors.push(`${rowLabel}: ZoneName must be at most ${BEACON_ZONE_MAX_LENGTH} characters.`);
        }

        if (row.Store?.trim() && !isValidBeaconStore(row.Store, storeOptions)) {
            errors.push(`${rowLabel}: Store '${row.Store.trim()}' does not exist.`);
        }

        if (!isValidBeaconIdentification(row.Identification)) {
            errors.push(
                `${rowLabel}: Identification must be Instore, Store Entrance, Store Exit, or "Store Entrance, Store Exit".`,
            );
        }
    });

    const message =
        errors.length === 1
            ? errors[0]
            : errors.length > 1
              ? `Invalid row data. ${errors.length} errors found.`
              : 'Invalid headers/column count';

    return {
        valid: errors.length === 0,
        rows,
        errors,
        message,
    };
};

export const encodeBeaconCsvForUpload = (text = '') => btoa(String(text));

export const downloadBeaconSampleCsv = () => {
    const content = BEACON_SAMPLE_CSV_CONTENT.join('\n');
    const file = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(file);
    link.download = 'sample_beacons.csv';
    link.click();
    URL.revokeObjectURL(link.href);
};
