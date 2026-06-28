/**
 * ResListCardPreview
 *
 * Standalone visual preview of ResListCard across all four grid modules.
 * Uses mock data — no Redux, no API calls.
 * Render this page on a temporary route or inside a docs/storybook page to inspect layouts.
 *
 * Four sections:
 *   1. Communication Listing
 *   2. Analytics Listing
 *   3. Mobile App Notification
 *   4. Offer Management – Brand / Shop
 */
import { useState } from 'react';
import RSTooltip from 'Components/RSTooltip';
import ResListCard from './index';
import ListEntityImage from '../ListEntityImage';

// ---------------------------------------------------------------------------
// Helpers — inlined so this file has zero external utility dependencies
// ---------------------------------------------------------------------------

const STATUS_MAP = {
    Completed:    'status-completed',
    'Multi status': 'status-multistatus',
    'In progress': 'status-inprogress',
    Scheduled:    'status-scheduled',
    Draft:        'status-draft',
    Active:       'status-completed',
    Inactive:     'status-draft',
    Sent:         'status-scheduled',
    Stopped:      'status-stop',
    Paused:       'status-pause',
};
const statusClass = (label) => STATUS_MAP[label] || 'status-completed';

const numFmt = (n) => (n ? n.toLocaleString() : 'N/A');

// Simple tag chip for preview (replaces renderCommunicationListingTags utility)
const TagChips = ({ tags }) => {
    if (!tags?.length) return null;
    return (
        <div className="pt5 d-flex flex-wrap gap-1" style={{ marginTop: 4 }}>
            {tags.map((t, i) => (
                <span
                    key={i}
                    className="badge"
                    style={{ background: t.color || '#e3eaef', color: '#333', fontSize: 11 }}
                >
                    {t.name}
                </span>
            ))}
        </div>
    );
};

// Simple action icon helper — keeps JSX DRY in config objects
const ActionIcon = ({ iconClass, tooltip, disabled = false, id }) => (
    <RSTooltip text={tooltip} position="top">
        <div className={disabled ? 'pe-none click-off' : ''}>
            <i id={id} className={`${iconClass} icon-md color-primary-blue`} />
        </div>
    </RSTooltip>
);

// Placeholder brand logo (data-URI 40×40 grey square)
const PLACEHOLDER_LOGO =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="46" height="46"><rect width="46" height="46" rx="4" fill="%23e3eaef"/><text x="50%25" y="55%25" font-size="18" text-anchor="middle" fill="%23999" font-family="sans-serif" dominant-baseline="middle">B</text></svg>';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const COMM_ROWS = [
    {
        id: 1,
        priority: 2,
        campaignGroupingId: 'CF315',
        encodeCampaignId: 'Nzc0NA==',
        createdBy: 'Alex Johnson',
        modifiedBy: '',
        modifiedDate: '',
        createdDate: 'May 19, 2026',
        campaignName: 'Summer Sale – Refer your friends & earn up to $500 in rewards',
        tags: [
            { name: 'Summer', color: '#d0e8ff' },
            { name: 'Referral', color: '#d5f5e3' },
        ],
        campaignTypeValue: 'Single dimension',
        communicationType: 'Email',
        totalRecipientsCount: 45234,
        statusLabel: 'Multi status',
        expanded: false,
    },
    {
        id: 2,
        priority: 0,
        campaignGroupingId: '',
        encodeCampaignId: 'Nzc1Ng==',
        createdBy: 'Priya Sharma',
        modifiedBy: 'Priya Sharma',
        modifiedDate: 'Jun 1, 2026',
        createdDate: 'May 2, 2026',
        campaignName: 'MSME Loan Awareness Drive',
        tags: [],
        campaignTypeValue: 'Event trigger',
        communicationType: 'Push Notification',
        totalRecipientsCount: 0,
        statusLabel: 'Draft',
        expanded: false,
    },
];

const ANALYTICS_ROWS = [
    {
        id: 3,
        campaignIDEncoded: 'Nzc0NA==',
        createdName: 'Alex Johnson',
        modifiedName: '',
        modifiedDate: null,
        createdDate: 'May 19, 2026',
        campaignName: 'Summer Sale – Refer your friends & earn up to $500 in rewards',
        isGoldCampaign: true,
        tags: [
            { name: 'Summer', color: '#d0e8ff' },
            { name: 'Referral', color: '#d5f5e3' },
        ],
        campaignTypeValue: 'Single dimension',
        communicationType: 'Email',
        startDate: 'Jun 1, 2026',
        isPDFDownloaded: true,
        statusLabel: 'Completed',
        expanded: false,
    },
    {
        id: 4,
        campaignIDEncoded: 'ODA2MA==',
        createdName: 'Ravi Kumar',
        modifiedName: 'Ravi Kumar',
        modifiedDate: 'May 29, 2026',
        createdDate: 'May 5, 2026',
        campaignName: 'Q2 Loyalty Rewards Campaign',
        isGoldCampaign: false,
        tags: [],
        campaignTypeValue: 'Multi dimension',
        communicationType: 'Email, Push, SMS',
        startDate: 'May 10, 2026',
        isPDFDownloaded: false,
        statusLabel: 'In progress',
        expanded: false,
    },
];

const APP_ROWS = [
    {
        id: 5,
        appName: 'Resulticks iOS App',
        createdBy: 'Sarah Williams',
        createdDate: 'May 15, 2026  10:30:45',
        isEnabled: 'Active',
        isDefault: true,
        expanded: false,
    },
    {
        id: 6,
        appName: 'Resulticks Android SDK',
        createdBy: 'James Chen',
        createdDate: 'Apr 22, 2026  09:15:00',
        isEnabled: 'Inactive',
        isDefault: false,
        expanded: false,
    },
];

const BRAND_ROWS = [
    {
        id: 7,
        image: '',
        shortName: 'RSLT',
        legalName: 'Resulticks Pte. Ltd.',
        city: 'Singapore',
        country: 'Singapore',
        status: 1,
        expanded: false,
    },
    {
        id: 8,
        image: '',
        shortName: 'APEX',
        legalName: 'Apex Financial Services Private Limited (Holdings)',
        city: 'Mumbai',
        country: 'India',
        status: 0,
        expanded: false,
    },
];

// ---------------------------------------------------------------------------
// 1. Communication Listing config
// ---------------------------------------------------------------------------
const communicationConfig = {
    variant: 'communication',
    cardModifiers: 'comm-listing',
    getStatusClass: (item) => statusClass(item.statusLabel),

    badge: {
        render: (item) => {
            const prefix = item.campaignGroupingId ? `${item.campaignGroupingId} / ` : '';
            const id = item.encodeCampaignId ?? '';
            return item.priority > 0 ? `${prefix}P${item.priority} || ${id}` : id;
        },
    },

    meta: {
        render: (item) => {
            const isModified = !!item.modifiedDate;
            const person = isModified ? item.modifiedBy : item.createdBy;
            const date   = isModified ? item.modifiedDate : item.createdDate;
            return `${isModified ? 'Modified' : 'Created'} by: ${person}, on: ${date}`;
        },
    },

    title: {
        render: (item) => (
            <span style={{ fontSize: 13, fontWeight: 500 }}>
                {item.campaignName?.length > 65
                    ? `${item.campaignName.slice(0, 65)}…`
                    : item.campaignName}
            </span>
        ),
    },

    tags: {
        render: (item) => <TagChips tags={item.tags} />,
    },

    columns: [
        {
            key: 'type',
            label: null,
            render: (item) => (
                <>
                    <small>{item.campaignTypeValue}</small>
                    <div className="d-flex">
                        <p style={{ margin: 0 }}>{item.communicationType}</p>
                    </div>
                </>
            ),
        },
        {
            key: 'audience',
            label: 'Total Audience',
            align: 'end',
            render: (item) => (
                <p style={{ margin: 0 }}>
                    {item.totalRecipientsCount > 0 ? numFmt(item.totalRecipientsCount) : 'N/A'}
                </p>
            ),
        },
    ],

    status: {
        getClass: (item) => statusClass(item.statusLabel),
        getLabel: (item) => item.statusLabel,
    },

    renderActions: (item) => [
        <li key="edit">
            <ActionIcon iconClass="icon-rs-pencil-edit-medium" tooltip="Edit" id="prev_comm_edit" />
        </li>,
        <li key="analytics">
            <ActionIcon iconClass="icon-rs-analytics-medium" tooltip="Analytics" id="prev_comm_analytics" />
        </li>,
        <li key="duplicate">
            <ActionIcon iconClass="icon-rs-duplicate-medium" tooltip="Duplicate" id="prev_comm_dup" />
        </li>,
        <li key="more">
            <RSTooltip text="Actions" position="top">
                <i className="icon-rs-circle-arrow-down-medium icon-md color-primary-blue" id="prev_comm_more" />
            </RSTooltip>
        </li>,
    ],

    expandable: true,
};

// ---------------------------------------------------------------------------
// 2. Analytics Listing config
// ---------------------------------------------------------------------------
const analyticsConfig = {
    variant: 'communication',
    cardModifiers: '',
    getStatusClass: (item) => statusClass(item.statusLabel),

    badge: {
        render: (item) => item.campaignIDEncoded,
    },

    meta: {
        render: (item) => {
            const isModified = item.modifiedDate !== null;
            const person = isModified ? item.modifiedName : item.createdName;
            const date   = isModified ? item.modifiedDate : item.createdDate;
            return `${isModified ? 'Modified' : 'Created'} by: ${person}, on: ${date}`;
        },
    },

    indicator: {
        render: (item) =>
            item.isGoldCampaign ? (
                <RSTooltip text="Golden campaign" position="top" className="d-inline-block lh0">
                    <i className="icon-rs-star-fill-mini icon-xs color-alert" />
                </RSTooltip>
            ) : null,
    },

    title: {
        render: (item) => (
            <span style={{ fontSize: 13, fontWeight: 500 }}>
                {item.campaignName?.length > 60
                    ? `${item.campaignName.slice(0, 60)}…`
                    : item.campaignName}
            </span>
        ),
    },

    tags: {
        render: (item) => <TagChips tags={item.tags} />,
    },

    columns: [
        {
            key: 'type',
            label: null,
            render: (item) => (
                <>
                    <small>{item.campaignTypeValue}</small>
                    <p style={{ margin: 0 }}>
                        {item.communicationType?.length > 20
                            ? `${item.communicationType.slice(0, 20)}…`
                            : item.communicationType}
                    </p>
                </>
            ),
        },
        {
            key: 'sentOn',
            label: 'Sent on',
            render: (item) => <p style={{ margin: 0 }}>{item.startDate || '—'}</p>,
        },
    ],

    status: {
        getClass: (item) => statusClass(item.statusLabel),
        getLabel: (item) => item.statusLabel,
    },

    renderActions: (item) => [
        <li key="analytics">
            <ActionIcon iconClass="icon-rs-analytics-medium" tooltip="View analytics" id="prev_anl_view" />
        </li>,
        <li key="trend">
            <ActionIcon iconClass="icon-rs-trend-report-large" tooltip="Trend report" disabled id="prev_anl_trend" />
        </li>,
        <li key="share">
            <ActionIcon iconClass="icon-rs-share-tick-medium" tooltip="Share" disabled id="prev_anl_share" />
        </li>,
        <li key="download">
            <ActionIcon
                iconClass="icon-rs-download-medium"
                tooltip="Download"
                disabled={!item.isPDFDownloaded}
                id="prev_anl_dl"
            />
        </li>,
    ],

    expandable: true,
};

// ---------------------------------------------------------------------------
// 3. Mobile App Notification config
// ---------------------------------------------------------------------------
const appConfig = {
    variant: 'app',

    columns: [
        {
            key: 'appName',
            label: 'App name',
            render: (item) => (
                <div className="d-flex">
                    <span style={{ fontSize: 13, fontWeight: 500 }}>
                        {item.appName?.length > 30 ? `${item.appName.slice(0, 30)}…` : item.appName}
                    </span>
                </div>
            ),
        },
        {
            key: 'createdBy',
            label: 'Created by',
            render: (item) => (
                <div className="d-flex">
                    <span>{item.createdBy}</span>
                </div>
            ),
        },
        {
            key: 'createdDate',
            label: 'Created date',
            render: (item) => <p style={{ margin: 0 }}>{item.createdDate}</p>,
        },
        {
            key: 'sdkStatus',
            label: 'SDK status',
            render: (item) => <p style={{ margin: 0 }}>{item.isEnabled}</p>,
        },
    ],

    renderActions: (item) => [
        <li key="edit">
            <ActionIcon iconClass="icon-rs-pencil-edit-medium" tooltip="Edit" id="prev_app_edit" />
        </li>,
        <li key="health">
            <ActionIcon
                iconClass="icon-rs-industry-healthcare-medium"
                tooltip="Health check"
                id="prev_app_health"
            />
        </li>,
        <li key="priority">
            <RSTooltip text="Priority" position="top">
                <i
                    className={`icon-rs-crown-medium icon-md ${item.isDefault ? 'color-yellow-medium' : 'color-primary-blue'}`}
                    id="prev_app_crown"
                />
            </RSTooltip>
        </li>,
        <li key="settings">
            <ActionIcon iconClass="icon-rs-settings-medium" tooltip="Settings" id="prev_app_settings" />
        </li>,
        <li key="more">
            <RSTooltip text="More" position="top">
                <i className="icon-rs-circle-arrow-down-medium icon-md color-primary-blue" id="prev_app_more" />
            </RSTooltip>
        </li>,
    ],

    expandable: true,
};

// ---------------------------------------------------------------------------
// 4. Offer Management – Brand / Shop config
// ---------------------------------------------------------------------------
const brandConfig = {
    variant: 'communication',
    cardModifiers: 'comm-listing brand-shops-card',
    getStatusClass: (item) => (item.status === 1 ? 'status-completed' : 'status-draft'),

    avatar: {
        render: (item) => (
            <ListEntityImage
                src={item.image}
                alt={item.shortName || item.legalName || 'Brand logo'}
                variant="brand"
            />
        ),
    },

    badge: {
        render: (item) => item.shortName || 'N/A',
    },

    title: {
        render: (item) => (
            <span style={{ fontSize: 13, fontWeight: 500 }}>
                {item.legalName?.length > 55
                    ? `${item.legalName.slice(0, 55)}…`
                    : item.legalName}
            </span>
        ),
    },

    columns: [
        {
            key: 'location',
            label: 'Location',
            render: (item) => (
                <p style={{ margin: 0 }}>
                    {item.city && item.country ? `${item.city}, ${item.country}` : item.city || item.country || 'N/A'}
                </p>
            ),
        },
        {
            /* Empty spacer column — keeps actions section at correct nth-child(4) position */
            key: 'spacer',
            label: null,
            render: () => null,
        },
    ],

    status: {
        getClass: (item) => (item.status === 1 ? 'status-completed' : 'status-draft'),
        getLabel: (item) => (item.status === 1 ? 'Active' : 'Inactive'),
    },

    renderActions: (item) => [
        <li key="edit">
            <ActionIcon iconClass="icon-rs-pencil-edit-medium" tooltip="Edit" id="prev_brand_edit" />
        </li>,
        <li key="delete">
            <RSTooltip text="Delete" position="top">
                <i className="icon-rs-delete-medium icon-md color-primary-red" id="prev_brand_del" />
            </RSTooltip>
        </li>,
    ],

    expandable: true,
};

// ---------------------------------------------------------------------------
// Preview section wrapper
// ---------------------------------------------------------------------------
const PreviewSection = ({ label, description, children }) => (
    <div style={{ marginBottom: 40 }}>
        <div
            style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 12,
                marginBottom: 10,
                borderBottom: '2px solid #e3eaef',
                paddingBottom: 8,
            }}
        >
            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1a3c6b' }}>{label}</h4>
            {description && (
                <span style={{ fontSize: 12, color: '#7b8898' }}>{description}</span>
            )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
    </div>
);

// Thin wrapper that mimics the table structure used by Kendo Grid list layout
// so the card CSS (nth-child, expand corner) renders correctly.
const CardRow = ({ config, dataItem }) => (
    <table style={{ width: '100%', borderSpacing: 0, tableLayout: 'fixed' }}>
        <tbody>
            <tr>
                <ResListCard dataItem={dataItem} config={config} />
            </tr>
        </tbody>
    </table>
);

// ---------------------------------------------------------------------------
// Main preview page
// ---------------------------------------------------------------------------
const ResListCardPreview = () => {
    const [rows, setRows] = useState({
        comm: COMM_ROWS,
        analytics: ANALYTICS_ROWS,
        app: APP_ROWS,
        brand: BRAND_ROWS,
    });

    const toggle = (group, id) => {
        setRows((prev) => ({
            ...prev,
            [group]: prev[group].map((r) =>
                r.id === id ? { ...r, expanded: !r.expanded } : r,
            ),
        }));
    };

    return (
        <div style={{ padding: '24px 32px', maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ marginBottom: 28 }}>
                <h3 style={{ margin: '0 0 4px', fontSize: 18, color: '#1a3c6b' }}>
                    ResListCard — Component Preview
                </h3>
                <p style={{ margin: 0, fontSize: 13, color: '#7b8898' }}>
                    All four grid modules rendered via a single configurable component.
                    Sections that are not configured are hidden automatically.
                </p>
            </div>

            {/* ── 1. Communication Listing ─────────────────────────────────── */}
            <PreviewSection
                label="1 · Communication Listing"
                description="variant='communication' · badge · meta · title · tags · type+commType · totalAudience · status · 4 actions + dropdown"
            >
                {rows.comm.map((item) => (
                    <CardRow
                        key={item.id}
                        config={{
                            ...communicationConfig,
                            expandable: true,
                        }}
                        dataItem={item}
                    />
                ))}
            </PreviewSection>

            {/* ── 2. Analytics Listing ─────────────────────────────────────── */}
            <PreviewSection
                label="2 · Analytics Listing"
                description="variant='communication' · badge · meta · indicator (golden★) · title · tags · type+commType · sentOn · status · 4 actions"
            >
                {rows.analytics.map((item) => (
                    <CardRow
                        key={item.id}
                        config={analyticsConfig}
                        dataItem={item}
                    />
                ))}
            </PreviewSection>

            {/* ── 3. Mobile App Notification ───────────────────────────────── */}
            <PreviewSection
                label="3 · Mobile App Notification Grid"
                description="variant='app' (rs-list-grid-wrapper) · 4 data columns · 5 actions (edit · health · crown/priority · settings · dropdown) · no badge · no status badge"
            >
                {rows.app.map((item) => (
                    <CardRow
                        key={item.id}
                        config={appConfig}
                        dataItem={item}
                    />
                ))}
            </PreviewSection>

            {/* ── 4. Offer Management – Brand / Shop ───────────────────────── */}
            <PreviewSection
                label="4 · Offer Management – Brand / Shop"
                description="variant='communication' · avatar (brand logo) · badge (short name) · title (legal name) · location column · empty spacer column · status badge · edit + delete"
            >
                {rows.brand.map((item) => (
                    <CardRow
                        key={item.id}
                        config={brandConfig}
                        dataItem={item}
                    />
                ))}
            </PreviewSection>

            {/* ── Config diff reference table ──────────────────────────────── */}
            <div
                style={{
                    marginTop: 32,
                    border: '1px solid #e3eaef',
                    borderRadius: 8,
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        background: '#f5f8fc',
                        padding: '10px 16px',
                        borderBottom: '1px solid #e3eaef',
                    }}
                >
                    <strong style={{ fontSize: 13, color: '#1a3c6b' }}>
                        Configuration Slot Availability by Module
                    </strong>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table
                        style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: 12,
                        }}
                    >
                        <thead>
                            <tr style={{ background: '#f5f8fc' }}>
                                {['Slot / Feature', 'Communication', 'Analytics', 'App Notification', 'Brand Shop'].map(
                                    (h) => (
                                        <th
                                            key={h}
                                            style={{
                                                padding: '8px 12px',
                                                textAlign: h === 'Slot / Feature' ? 'left' : 'center',
                                                borderBottom: '1px solid #e3eaef',
                                                color: '#1a3c6b',
                                                fontWeight: 600,
                                            }}
                                        >
                                            {h}
                                        </th>
                                    ),
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                ['variant',        'communication', 'communication', 'app',  'communication'],
                                ['badge',          '✓ ID + priority', '✓ ID', '—',    '✓ Short name'],
                                ['avatar',         '—',            '—',            '—',    '✓ Brand logo'],
                                ['meta',           '✓ Created/Modified by', '✓ Created/Modified by', '—', '—'],
                                ['indicator',      '—',            '✓ Golden star', '—',   '—'],
                                ['title',          '✓ Campaign name', '✓ Campaign name', '—', '✓ Legal name'],
                                ['tags',           '✓ Tag chips', '✓ Tag chips', '—',       '—'],
                                ['columns',        '2 (type, audience)', '2 (type, sentOn)', '4 data cols', '2 (location, spacer)'],
                                ['status badge',   '✓',            '✓',            '—',    '✓'],
                                ['actions',        '4 + dropdown', '4 icons',      '4 + dropdown', '2 (edit, delete)'],
                                ['expandable',     '✓',            '✓',            '✓',    '✓'],
                            ].map(([slot, ...vals]) => (
                                <tr
                                    key={slot}
                                    style={{ borderBottom: '1px solid #f0f3f7' }}
                                >
                                    <td
                                        style={{
                                            padding: '7px 12px',
                                            fontWeight: 600,
                                            color: '#444',
                                            background: '#fafcff',
                                        }}
                                    >
                                        {slot}
                                    </td>
                                    {vals.map((v, i) => (
                                        <td
                                            key={i}
                                            style={{
                                                padding: '7px 12px',
                                                textAlign: 'center',
                                                color: v === '—' ? '#bbb' : '#333',
                                            }}
                                        >
                                            {v}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ResListCardPreview;
