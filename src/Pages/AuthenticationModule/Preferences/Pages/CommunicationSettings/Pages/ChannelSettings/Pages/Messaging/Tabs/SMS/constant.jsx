import { ENTER_SENDER_ID } from 'Constants/GlobalConstant/ValidationMessage';
import { lazy } from 'react';
import Papa from 'papaparse';
import RSTooltip from 'Components/RSTooltip';
import { renderEmbeddedLazyInner, SMS_INNER_TAB_CONFIG } from '../../../../constant';

export { SMS_INNER_TAB_CONFIG };

const SMPP = lazy(() => import('./Tabs/SMPP'));
const KeywordManagement = lazy(() => import('./Tabs/KeywordManagement'));
const LifetimeCap = lazy(() => import('./Tabs/LifetimeCap'));
const SMSTemplate = lazy(() => import('./Tabs/Template'));

export const SMS_VENDOR_FORM_ACTIONS_PORTAL_ID = 'pref-cs-sms-vendor-form-actions';

const SMS_TAB_COMPONENTS = {
    vendor: renderEmbeddedLazyInner(SMPP),
    templates: renderEmbeddedLazyInner(SMSTemplate),
    keywordManagement: renderEmbeddedLazyInner(KeywordManagement),
    lifetimeCap: renderEmbeddedLazyInner(LifetimeCap),
};

export const getSMPPTabConfig = (isKeywordManagementEnabled = false) =>
    SMS_INNER_TAB_CONFIG.filter((tab) => tab.id !== 'quiet-hours-sms').map((tab) => ({
        id: tab.id,
        text: tab.text,
        disable: tab.id === 'keywordManagement' ? !isKeywordManagementEnabled : (tab.disable ?? false),
        component: SMS_TAB_COMPONENTS[tab.id],
    }));

export const ACTION_INITIAL_STATE = {
    showGrid: true,
    smppAction: {
        edit: {
            editState: [],
            isEdit: false,
        },
        create: false,
    },
};

export const FORM_INITIAL_STATE = {
    defaultValues: {
        senderDetails: [
            {
                clientsmsSenderName: '',
                clientfriendlyName: '',
                keyword: '',
                isActive: true,
                isDelete: false,
            },
        ],
        smsFriendlyName: '',
        provider: '',
        countryCode: '',
        senderId: '',
        dltEnabled: false,
        dltTemplateId: '',
        dltEntityId: '',
        dltHeaderId: '',
        settingType: {
            messageType: '',
            promotional: false,
            Transactional: false,
            TwoWaySMS: false,
        },
    },
    mode: 'onTouched',
};

// SMS Template onboarding: 'Manual entry' | 'Import'
export const ONBOARDING_TYPE_MANUAL = 'Manual entry';
export const ONBOARDING_TYPE_IMPORT_CSV = 'Import';

export const SMS_TYPES = {
    P: 'Promotional',
    T: 'Transactional',
    TWO: 'Two way SMS',
};

// Shared max-length for template inputs
export const TEMPLATE_INPUT_MAX_LENGTH = 150;
export const TEMPLATE_ID_MAX_LENGTH = 150;

// Message variable validation (format {# variableName #})
export const MESSAGE_VARIABLE_BRACES_REGEX = /\{[^}]*\}/g;
export const MESSAGE_VARIABLE_VALID_INNER = /^#\s*[\w]+\s*#$/;
export const MESSAGE_VARIABLE_FORMAT_ERROR = 'Enter valid variable formate {# variableName #}';

// ─── CSV bulk import: mandatory columns & eligibility ───────────────────────
export const MANDATORY_FILE_COLUMNS = [
    {
        keys: ['Template Name', 'templateName', 'template_name', 'Template', 'TELEMARK', 'Telemark', 'TEMPLATE NAME'],
        label: 'Template name',
    },
    {
        keys: [
            'Template ID',
            'templateId',
            'template_id',
            'Template Id',
            'Template Id (URN)',
            'dltTemplateId',
            'TEMPLATE',
        ],
        label: 'Template ID',
    },
    {
        keys: [
            'Type',
            'type',
            'templateType',
            'template_type',
            'Template type',
            'DLT Message Type',
            'Msg Type',
            'TEMPLATE TYPE',
            'Template Type',
        ],
        label: 'Type',
    },
    { keys: ['Header', 'header', 'HEADER'], label: 'Header' },
    { keys: ['Status', 'status', 'STATUS'], label: 'Status' },
    {
        keys: [
            'Approval Status',
            'approvalStatus',
            'approval_status',
            'APPROVA STATUS',
            'Approva Status',
            'approvastatus',
        ],
        label: 'Approval status',
    },
    {
        keys: [
            'Template Message',
            'templateMessage',
            'template_message',
            'Template Content',
            'templateContent',
            'template_content',
            'messageContent',
            'Message content',
            'Message',
            'Content',
            'TEMPLATE MESSAGE',
        ],
        label: 'Template message',
    },
];

const STATUS_ACTIVE_VALUES = ['active', '1', 'true', 'yes', 'y'];
const APPROVAL_APPROVED_VALUES = ['approved', '1', 'true', 'yes', 'y'];
const APPROVAL_STATUS_KEYS = [
    'Approval Status',
    'approvalStatus',
    'Approval status',
    'approval_status',
    'APPROVA STATUS',
    'Approva Status',
    'approvastatus',
];
const STATUS_KEYS = ['Status', 'status', 'Template status', 'templateStatus', 'STATUS'];

// Template type options for dropdown (Transactional, Promotional, etc.)
export const TEMPLATE_TYPE_OPTIONS = [
    { templateTypeId: 'transactional', templateTypeIdName: 'Transactional' },
    { templateTypeId: 'promotional', templateTypeIdName: 'Promotional' },
    // { templateTypeId: 'otp', templateTypeIdName: 'OTP' },
    // { templateTypeId: 'service', templateTypeIdName: 'Service' },
];

// API templateType code -> form option templateTypeId
export const TEMPLATE_TYPE_CODE_TO_ID = {
    T: 'transactional',
    P: 'promotional',
    O: 'otp',
    S: 'service',
};

// Form option templateTypeId -> API templateType code
export const TEMPLATE_TYPE_ID_TO_CODE = {
    transactional: 'T',
    promotional: 'P',
    otp: 'O',
    service: 'S',
};

// Map edit API response -> react-hook-form default values
export const mapEditResponseToSmsTemplateForm = (editData = {}, baseDefaults = {}) => {
    const templateTypeCode = editData.templateType;
    const templateTypeId = TEMPLATE_TYPE_CODE_TO_ID[templateTypeCode];
    const templateTypeOption =
        TEMPLATE_TYPE_OPTIONS.find((opt) => opt.templateTypeId === templateTypeId) || TEMPLATE_TYPE_OPTIONS[0];

    const senderIdStr = editData.senderId || '';

    return {
        ...baseDefaults,
        templateName: editData.templateName || '',
        templateType: templateTypeOption,
        templateId: editData.dltTemplateID ?? editData.dltTemplateId ?? editData.dltEntityId ?? editData.dltEntityID ?? editData.peId ?? editData.templateId ?? '',
        senderId: senderIdStr,
        messageContent: editData.templateContent || '',
    };
};

// Build save / update payload for /CommunicationSetting/SaveSMSTemplates
export const buildSmsTemplateSavePayload = (formState = {}, options = {}) => {
    const { isUpdate = false, templateId } = options;

    const {
        templateName = '',
        templateType,
        templateId: templateIdValue = '',
        messageContent = '',
        senderId = '',
    } = formState;

    const apiTemplateType =
        TEMPLATE_TYPE_ID_TO_CODE[templateType?.templateTypeId] || TEMPLATE_TYPE_ID_TO_CODE.transactional;

    const payloadTemplate = {
        templateName: templateName.trim(),
        templateType: apiTemplateType,
        dltTemplateId: String(templateIdValue || '').trim(),
        templateContent: messageContent.trim(),
        senderId: (senderId || '').trim(),
    };

    // For edit, include templateId if provided
    if (isUpdate && templateId) {
        payloadTemplate.templateId = templateId;
    }

    return {
        templates: [payloadTemplate],
        entryType: formState?.onboardingType !== ONBOARDING_TYPE_MANUAL ? 'CSV' : 'Manual'
    };
};

// Normalize string for flexible column matching (case-insensitive, collapse spaces/underscores)
const norm = (s) =>
    (s ?? '')
        .toString()
        .toLowerCase()
        .replace(/[\s_]+/g, '');

// Strip leading/trailing single quotes from Template ID (e.g. '1212212122' -> 1212212122)
const stripTemplateIdQuotes = (val) =>
    String(val ?? '')
        .trim()
        .replace(/^'+|'+$/g, '');

// Get value from row using flexible column name matching
const getRowVal = (row, keys) => {
    const rowKeys = Object.keys(row || {});
    for (const k of keys) {
        const keyNorm = norm(k);
        const found = rowKeys.find((rk) => norm(rk) === keyNorm);
        if (found) {
            const v = row[found];
            if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim();
        }
    }
    return '';
};

const TYPE_RAW_TO_API_CODE = {
    'service-implicit': 'T',
    serviceimplicit: 'T',
    'service-explicit': 'P',
    serviceexplicit: 'P',
    transactional: 'T',
    promotional: 'P',
    otp: 'O',
    service: 'S',
    t: 'T',
    p: 'P',
    o: 'O',
    s: 'S',
};

const TYPE_ELIGIBILITY_KEYS = [
    'service-implicit',
    'serviceimplicit',
    'service-explicit',
    'serviceexplicit',
    'transactional',
    'promotional',
    'otp',
];

const mapTypeToApiCode = (raw) => {
    if (!raw) return 'T';
    const s = String(raw)
        .trim()
        .toLowerCase()
        .replace(/[\s_]+/g, '');
    const sWithDash = String(raw)
        .trim()
        .toLowerCase()
        .replace(/[\s_]+/g, '-');
    return (
        TYPE_RAW_TO_API_CODE[s] ||
        TYPE_RAW_TO_API_CODE[sWithDash] ||
        (['t', 'p', 'o', 's'].includes(s.slice(0, 1)) ? s.slice(0, 1).toUpperCase() : 'T')
    );
};

// Column key variants (aligned with Create/MANDATORY_FILE_COLUMNS)
const TEMPLATE_NAME_KEYS = [
    'Template Name',
    'templateName',
    'template_name',
    'Template',
    'TELEMARK',
    'Telemark',
    'TEMPLATE NAME',
];
const TEMPLATE_ID_KEYS = [
    'Template ID',
    'Template Id',
    'templateId',
    'template_id',
    'Template Id (URN)',
    'dltTemplateId',
    'dltEntityId',
    'dltEntityID',
    'peId',
    'DLT entity ID (PE ID)',
    'TEMPLATE',
];
const TEMPLATE_MESSAGE_KEYS = [
    'Template Message',
    'templateMessage',
    'template_message',
    'Template Content',
    'templateContent',
    'template_content',
    'messageContent',
    'Message content',
    'Message',
    'Content',
    'TEMPLATE MESSAGE',
];
const TYPE_KEYS = [
    'Type',
    'type',
    'templateType',
    'template_type',
    'Template type',
    'DLT Message Type',
    'Msg Type',
    'TEMPLATE TYPE',
    'Template Type',
];
const SENDER_ID_KEYS = [
    'Header',
    'header',
    'HEADER',
    'Sender id',
    'senderId',
    'sender_id',
    'keywords',
    'Masks',
    'Default Mask',
    'Business Category',
];

export const buildBulkSmsTemplatePayloadFromRows = (rows = [], formState, uploadedFile) => {
    const templates = rows.map((row) => {
        const typeRaw = getRowVal(row, TYPE_KEYS);
        const templateType = mapTypeToApiCode(typeRaw);

        return {
            templateName: getRowVal(row, TEMPLATE_NAME_KEYS),
            templateType,
            language: getRowVal(row, ['language', 'languages', 'Language']),
            templateContent: getRowVal(row, TEMPLATE_MESSAGE_KEYS),
            senderId: getRowVal(row, SENDER_ID_KEYS),
            dltTemplateId: stripTemplateIdQuotes(getRowVal(row, TEMPLATE_ID_KEYS)),
        };
    });

    const extension = uploadedFile?.name?.split(".").pop()?.toLowerCase();
    return {
        templates,
        entryType:
            formState?.onboardingType === ONBOARDING_TYPE_MANUAL
                ? "Manual"
                : extension === "csv"
                    ? "CSV"
                    : extension === "xls" || extension === "xlsx"
                        ? "Excel"
                        : "CSV",
    };
};

// ─── CSV validation & eligibility ───────────────────────────────────────────
export const validateMandatoryColumns = (rows = []) => {
    if (!rows?.length) return { valid: false, message: 'File has no data rows.' };
    const headerSet = new Set();
    rows.forEach((row) => Object.keys(row || {}).forEach((h) => headerSet.add((h || '').trim())));
    const normalizedHeaders = Array.from(headerSet).map((h) => norm(h));
    const missing = [];
    for (const col of MANDATORY_FILE_COLUMNS) {
        const hasMatch = col.keys.some((k) => normalizedHeaders.includes(norm(k)));
        if (!hasMatch) missing.push(col.label);
    }
    if (missing.length) {
        const columnList = missing.join(', ');
        const message = `Required columns missing: ${columnList}.`;
        return { valid: false, message };
    }
    return { valid: true };
};

export const SMS_TEMPLATE_SAMPLE_CSV_CONTENT = [
    'TEMPLATE ID,TEMPLATE NAME,TYPE,HEADER,APPROVAL STATUS,STATUS,TEMPLATE MESSAGE',
    '1107177080976477904,GoldLoans,Service-Implicit,VISIONBK,Approved,Active,"Incorrect OTP! Vision Bank Online Banking transaction failed due to an incorrect OTP. Please use the correct OTP and try again."',
    '1107177080976477905,HomeLoanAlert,Transactional,VISIONBK,Approved,Active,"Your Vision Bank Home Loan EMI of $25,000 is due on 20-Feb-2026. Please ensure sufficient balance to avoid penalties."',
    '1107177080976477906,DebitCardTxnAlert,Service-Explicit,VISIONBK,Approved,Active,"Debit Card transaction of $450 at Amazon was successful. If this was not you, contact Vision Bank immediately."',
    '1107177080976477907,KYCReminder,Service-Implicit,VISIONBK,Approved,Active,"Reminder: Your Vision Bank KYC update is pending. Please complete the verification to avoid service interruption."',
    '1107177080976477908,NetBankingLogin,Transactional,VISIONBK,Approved,Active,"New login detected to your Vision Bank Net Banking account. If this was not you, reset your password immediately."',
];

const isActiveStatus = (val) => STATUS_ACTIVE_VALUES.includes((val || '').toString().toLowerCase().trim());
const isApprovedStatus = (val) => APPROVAL_APPROVED_VALUES.includes((val || '').toString().toLowerCase().trim());
const isApprovedAndActiveCombined = (val) => {
    const s = (val || '').toString().toLowerCase().trim();
    return s.includes('approved') && s.includes('active');
};

const templateContentRegex = (value) => {
    if (!value || typeof value !== 'string') return true;
    const matches = value.match(MESSAGE_VARIABLE_BRACES_REGEX);
    if (!matches) return true;
    for (const match of matches) {
        const inner = match.slice(1, -1);
        if (!MESSAGE_VARIABLE_VALID_INNER.test(inner)) return false;
    }
    return true;
}

const isEligibleRow = (row) => {
    const templateMessage = getRowVal(row, TEMPLATE_MESSAGE_KEYS);
    if (!templateMessage || templateMessage.length <= 1 || templateMessage?.length > 1000 || templateContentRegex(templateMessage) === false) return false;

    const approvalCol = getRowVal(row, APPROVAL_STATUS_KEYS);
    const statusCol = getRowVal(row, STATUS_KEYS);
    const hasStatusAndApproval =
        isApprovedAndActiveCombined(approvalCol) || (isActiveStatus(statusCol) && isApprovedStatus(approvalCol));
    if (!hasStatusAndApproval) return false;

    const templateName = getRowVal(row, TEMPLATE_NAME_KEYS);
    const templateId = getRowVal(row, TEMPLATE_ID_KEYS);
    const typeVal = getRowVal(row, TYPE_KEYS);

    if (!templateName || !templateId) return false;
    if (!typeVal) return false;

    const rawTypeStr = String(typeVal).trim();
    if (/[^a-zA-Z\s_-]/.test(rawTypeStr)) return false;

    const typeNormalized = rawTypeStr
        .toLowerCase()
        .replace(/[\s_]+/g, '');
    const typeNormalizedWithDash = rawTypeStr
        .toLowerCase()
        .replace(/[\s_]+/g, '-');
    const isTypeEligible =
        TYPE_ELIGIBILITY_KEYS.includes(typeNormalized) ||
        TYPE_ELIGIBILITY_KEYS.includes(typeNormalizedWithDash);
    if (!isTypeEligible) return false;

    const senderValue = getRowVal(row, SENDER_ID_KEYS);
    if (!senderValue) return false;
    if (senderValue.length < 3 || senderValue.length > 20) return false;
    if (!SENDER_ID_PATTERN.test(senderValue)) return false;
    let onlyValidValue = new RegExp(/[^a-zA-Z0-9-_ ]/, 'g');
    if (onlyValidValue.test(templateName) || templateName?.length > 150) return false
    if (templateId && !TEMPLATE_ID_NUMERIC_ONLY.test(stripTemplateIdQuotes(templateId))) return false;
    return true;
};

export const getEligibleRows = (rows) => (Array.isArray(rows) ? rows.filter(isEligibleRow) : []);

// ─── File parsing (CSV / Excel) ─────────────────────────────────────────────
export const parseFileToRows = (file) => {
    const name = (file?.name || '').toLowerCase();
    return new Promise((resolve, reject) => {
        if (name.endsWith('.csv')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target?.result || '';
                    const result = Papa.parse(text, { header: true, skipEmptyLines: true });
                    if (result.errors?.length) return reject(new Error('Invalid CSV format'));
                    resolve(result?.data || []);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = () => reject(new Error('Could not read file'));
            reader.readAsText(file, 'UTF-8');
        } else if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
            import('xlsx')
                .then((XLSXModule) => {
                    const XLSX = XLSXModule.default || XLSXModule;
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            const data = new Uint8Array(e.target.result);
                            const workbook = XLSX.read(data, { type: 'array' });
                            const firstSheet = workbook.SheetNames?.[0];
                            if (!firstSheet) return reject(new Error('No sheet found'));
                            const worksheet = workbook.Sheets[firstSheet];
                            const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
                            resolve(Array.isArray(rows) ? rows : []);
                        } catch (err) {
                            reject(err);
                        }
                    };
                    reader.onerror = () => reject(new Error('Could not read file'));
                    reader.readAsArrayBuffer(file);
                })
                .catch(() => reject(new Error('Excel library not available')));
        } else {
            reject(new Error('Unsupported format. Use .csv, .xlsx or .xls'));
        }
    });
};

const SENDER_ID_PATTERN = /^[A-Z0-9]{3,20}$/;
const SENDER_ID_KEY_PATTERN = /^[A-Z0-9]$/;
const TEMPLATE_ID_NUMERIC_ONLY = /^\d+$/;

export const getSenderIdRules = () => ({
    required: ENTER_SENDER_ID,
    validate: (value) => {
        const trimmed = (value || '').trim();
        if (!trimmed) return ENTER_SENDER_ID;
        if (trimmed.length < 3 || trimmed.length > 20) return 'Sender ID must be 3–20 characters';
        if (!SENDER_ID_PATTERN.test(trimmed)) return 'Only uppercase and numbers allowed';
        return true;
    },
});

// ─── Form validation helpers ─────────────────────────────────────────────────
const SENDER_ID_TOTAL_MAX_LENGTH = 75;

export const getMainSenderIdRules = () => ({
    validate: (value) => {
        const tags = (value || '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        if (tags.length === 0) return ENTER_SENDER_ID;
        const totalChars = tags.join('').length;
        if (totalChars > SENDER_ID_TOTAL_MAX_LENGTH)
            return `Total Sender ID characters cannot exceed ${SENDER_ID_TOTAL_MAX_LENGTH}`;
        for (const tag of tags) {
            if (tag.length < 3 || tag.length > 20) return 'Sender ID must be 3–20 characters';
            if (!SENDER_ID_PATTERN.test(tag)) return 'Only uppercase and numbers allowed';
        }
        return true;
    },
});

export const getMessageContentValidate = () => ({
    validate: (value) => {
        if (!value || typeof value !== 'string') return true;
        const matches = value.match(MESSAGE_VARIABLE_BRACES_REGEX);
        if (!matches) return true;
        for (const match of matches) {
            const inner = match.slice(1, -1);
            if (!MESSAGE_VARIABLE_VALID_INNER.test(inner)) return MESSAGE_VARIABLE_FORMAT_ERROR;
        }
        return true;
    },
});

// Template bulk grid: only these 7 columns (order and titles fixed)
const BULK_GRID_COLUMN_CONFIG = [
    { title: 'Template ID', keys: TEMPLATE_ID_KEYS, transform: stripTemplateIdQuotes },
    { title: 'Template name', keys: TEMPLATE_NAME_KEYS },
    { title: 'Template message', keys: TEMPLATE_MESSAGE_KEYS },
    { title: 'Type', keys: TYPE_KEYS },
    { title: 'Sender ID (Header)', keys: SENDER_ID_KEYS },
    { title: 'Status', keys: STATUS_KEYS },
    { title: 'Approval Status', keys: APPROVAL_STATUS_KEYS },
];

// ─── Bulk grid column config ─────────────────────────────────────────────────
export const getBulkGridColumns = () =>
    BULK_GRID_COLUMN_CONFIG.map(({ title, keys, transform }) => ({
        field: title,
        title,
        width: 180,
        cell: ({ dataItem }) => {
            let val = getRowVal(dataItem, keys);
            if (transform) val = transform(val);
            const display = val.length > 18 ? `${val.slice(0, 18)}...` : val;
            return (
                <td>
                    {display?.length > 18 ? (
                        <RSTooltip text={val} position="top" innerContent={false}>
                            <span>{display}</span>
                        </RSTooltip>
                    ) : (
                        display
                    )}
                </td>
            );
        },
    }));
