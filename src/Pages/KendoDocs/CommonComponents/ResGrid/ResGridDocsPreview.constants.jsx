/**
 * ResGridDocsPreview.jsx
 *
 * Single source of truth for all demo data, configs, and helpers
 * consumed by ResGridDocsPreview.  Nothing here touches Redux or the API.
 *
 * Exports (grouped)
 *   Helpers   : STATUS_CLS · getStatusCls · PLACEHOLDER_LOGO · SKELETON_ROWS
 *   Atoms     : TagChips · Ico
 *   Data      : COMM_ROWS · ANALYTICS_ROWS · APP_ROWS · BRAND_ROWS
 *   Configs   : COMM_CONFIG · ANALYTICS_CONFIG · APP_CONFIG · BRAND_CONFIG
 */
import RSTooltip from 'Components/RSTooltip';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell';
import ResListCard from './ResListCard/index';
import ListEntityImage from './ListEntityImage';
import {
    CH,
    getChannelId,
    buildResGridChannelRow,
    RESGRID_CHANNELS_LIST,
    EMPTY_CHANNEL_LOOKUP,
} from './channelConstants';

// ---------------------------------------------------------------------------
// Status helpers (shared by data and configs)
// ---------------------------------------------------------------------------

export const STATUS_CLS = {
    Completed:       'status-completed',
    'Multi status':  'status-multistatus',
    'In progress':   'status-inprogress',
    Scheduled:       'status-scheduled',
    Draft:           'status-draft',
    Active:          'status-completed',
    Inactive:        'status-draft',
    Sent:            'status-scheduled',
    Stopped:         'status-stop',
    Paused:          'status-pause',
    Alert:           'status-alert',
    Archived:        'status-archive',
    Extraction:      'status-extraction',
    Reject:          'status-reject',
};

/** All communication status labels shown in the listing demo grid */
export const COMMUNICATION_STATUS_DEMO_LABELS = [
    'Multi status',
    'Draft',
    'Completed',
    'In progress',
    'Scheduled',
    'Stopped',
    'Paused',
    'Alert',
    'Archived',
    'Extraction',
    'Reject',
];

export const getStatusCls = (label) => STATUS_CLS[label] || 'status-completed';

/** Build a single-column list layout for ResGrid from a ResListCard config */
export const buildListColumns = (listCardConfig) => [
    {
        cell: (props) => (
            <ResListCard dataItem={props.dataItem} config={listCardConfig} />
        ),
    },
];

// ---------------------------------------------------------------------------
// Misc shared constants
// ---------------------------------------------------------------------------

export const PLACEHOLDER_LOGO =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="46" height="46"><rect width="46" height="46" rx="4" fill="%23e3eaef"/><text x="50%25" y="55%25" font-size="18" text-anchor="middle" fill="%23999" font-family="sans-serif" dominant-baseline="middle">B</text></svg>';

/** Skeleton row counts — passed to ResGrid skeletonRows per module */
export const SKELETON_ROWS = {
    communication: COMMUNICATION_STATUS_DEMO_LABELS.length,
    analytics:     COMMUNICATION_STATUS_DEMO_LABELS.length,
    app:           2,
    brand:         3,
};

// ---------------------------------------------------------------------------
// Shared atoms (used inside card config render functions)
// ---------------------------------------------------------------------------

/** Tags as plain comma-separated text — no colour chips */
export const TagChips = ({ tags }) => {
    if (!tags?.length) return null;
    return (
        <small className="resgrid-list-tags">
            {tags.map((t) => t.name).join(', ')}
        </small>
    );
};

/** Tooltip icon button — keeps renderActions JSX concise */
export const Ico = ({ icon, tip, disabled = false, id, red = false }) => (
    <RSTooltip text={tip} position="top">
        <div className={disabled ? 'pe-none click-off' : ''}>
            <i id={id} className={`${icon} icon-md ${red ? 'color-primary-red' : 'color-primary-blue'}`} />
        </div>
    </RSTooltip>
);

// Re-export channel helpers for ResGrid consumers (icons / colors / names from Utils duplicate)
export {
    CH,
    getChannelId,
    buildResGridChannelRow,
    RESGRID_CHANNELS_LIST,
    EMPTY_CHANNEL_LOOKUP,
} from './channelConstants';

// ---------------------------------------------------------------------------
// 1. Communication Listing  — all status variations + negative rows
// ---------------------------------------------------------------------------
export const COMM_ROWS = [
    {
        id: 1,
        priority: 2, campaignGroupingId: 'CF315', encodeCampaignId: 'Nzc0NA==',
        createdBy: 'Alex Johnson', modifiedBy: 'Alex Johnson', modifiedDate: 'Jun 2, 2026', createdDate: 'May 19, 2026',
        campaignName: 'Summer Sale – Refer your friends & earn up to $500 in rewards',
        tags: [{ name: 'Summer', color: '#d0e8ff' }, { name: 'Referral', color: '#d5f5e3' }],
        campaignTypeValue: 'Single dimension', communicationType: 'Email · Push · Web',
        totalRecipientsCount: 45234, statusLabel: 'Multi status', expanded: false,
        channels: [CH.email(), CH.push(), CH.web(), CH.sms('clock')],
    },
    {
        id: 2,
        priority: 0, campaignGroupingId: '', encodeCampaignId: 'Nzc1Ng==',
        createdBy: 'Priya Sharma', modifiedBy: '', modifiedDate: '', createdDate: 'May 2, 2026',
        campaignName: 'MSME Loan Awareness Drive',
        tags: [],
        campaignTypeValue: 'Event trigger', communicationType: 'Push Notification',
        totalRecipientsCount: 0, statusLabel: 'Draft', expanded: false,
        channels: [CH.push('clock')],
    },
    {
        id: 3,
        priority: 1, campaignGroupingId: 'CF318', encodeCampaignId: 'Nzc3MA==',
        createdBy: 'Judy Benjamin', modifiedBy: 'Judy Benjamin', modifiedDate: 'May 12, 2026', createdDate: 'Apr 28, 2026',
        campaignName: 'Interest Rate Discounts — Q2 Special Offer',
        tags: [{ name: 'EMI', color: '#fff3cd' }],
        campaignTypeValue: 'Single dimension', communicationType: 'Email · SMS',
        totalRecipientsCount: 28110, statusLabel: 'Completed', expanded: false,
        channels: [CH.email(), CH.sms()],
    },
    {
        id: 4,
        priority: 0, campaignGroupingId: '', encodeCampaignId: 'ODA2MA==',
        createdBy: 'Ravi Kumar', modifiedBy: '', modifiedDate: '', createdDate: 'Jun 1, 2026',
        campaignName: 'Flash Sale – Live Now! Up to 40% off on premium plans',
        tags: [{ name: 'Flash Sale', color: '#fde8e8' }],
        campaignTypeValue: 'Multi dimension', communicationType: 'Email · Push · SMS',
        totalRecipientsCount: 18900, statusLabel: 'In progress', expanded: false,
        channels: [CH.email(), CH.push('clock'), CH.sms('clock')],
    },
    {
        id: 5,
        priority: 0, campaignGroupingId: '', encodeCampaignId: 'ODQ1Mg==',
        createdBy: 'Mei Lin', modifiedBy: '', modifiedDate: '', createdDate: 'Jun 3, 2026',
        campaignName: 'Weekend Promo — Scheduled for Saturday Launch',
        tags: [{ name: 'Weekend', color: '#e8f5e9' }],
        campaignTypeValue: 'Single dimension', communicationType: 'WhatsApp',
        totalRecipientsCount: 9200, statusLabel: 'Scheduled', expanded: false,
        channels: [CH.whatsapp('clock')],
    },
    {
        id: 6,
        priority: 0, campaignGroupingId: '', encodeCampaignId: 'ODU3NA==',
        createdBy: 'Tom Brady', modifiedBy: 'Tom Brady', modifiedDate: 'Apr 10, 2026', createdDate: 'Apr 1, 2026',
        campaignName: 'Discontinued Product Removal Campaign',
        tags: [],
        campaignTypeValue: 'Single dimension', communicationType: 'Email',
        /* negative: channels intentionally empty */
        totalRecipientsCount: 5000, statusLabel: 'Stopped', expanded: false,
        channels: [],
    },
    {
        id: 7,
        priority: 0, campaignGroupingId: '', encodeCampaignId: 'ODY4Mg==',
        createdBy: 'Sara Lee', modifiedBy: '', modifiedDate: '', createdDate: 'May 25, 2026',
        campaignName: 'Paused for Compliance Review — Quarterly Audit',
        tags: [{ name: 'Compliance', color: '#ede9fe' }],
        campaignTypeValue: 'Event trigger', communicationType: 'Email · Push',
        /* negative: zero audience */
        totalRecipientsCount: 0, statusLabel: 'Paused', expanded: false,
        channels: [CH.email('clock'), CH.push('clock')],
    },
    {
        id: 8,
        priority: 0, campaignGroupingId: '', encodeCampaignId: 'ODA4OA==',
        createdBy: 'Ops Team', modifiedBy: 'Ops Team', modifiedDate: 'May 18, 2026', createdDate: 'May 10, 2026',
        campaignName: 'Delivery Failure Alert — Bounce Rate Threshold Exceeded',
        tags: [{ name: 'Alert', color: '#fef9c3' }],
        campaignTypeValue: 'Single dimension', communicationType: 'Email · SMS',
        totalRecipientsCount: 12400, statusLabel: 'Alert', expanded: false,
        channels: [CH.email('fail'), CH.sms('clock')],
    },
    {
        id: 9,
        priority: 0, campaignGroupingId: '', encodeCampaignId: 'ODk5MA==',
        createdBy: 'Archive Bot', modifiedBy: '', modifiedDate: '', createdDate: 'Jan 15, 2025',
        campaignName: 'Archived — 2024 Holiday Campaign (Read-only)',
        tags: [],
        campaignTypeValue: 'Single dimension', communicationType: 'Email · Push',
        totalRecipientsCount: 89000, statusLabel: 'Archived', expanded: false,
        channels: [CH.email(), CH.push()],
    },
    {
        id: 10,
        priority: 0, campaignGroupingId: '', encodeCampaignId: 'OTEwMA==',
        createdBy: 'Data Team', modifiedBy: 'Data Team', modifiedDate: 'Jun 4, 2026', createdDate: 'Jun 4, 2026',
        campaignName: 'Audience Extraction — CRM Sync Batch #42',
        tags: [{ name: 'ETL', color: '#e0f7fa' }],
        campaignTypeValue: 'Event trigger', communicationType: 'Email',
        totalRecipientsCount: 0, statusLabel: 'Extraction', expanded: false,
        channels: [CH.email('clock')],
    },
    {
        id: 11,
        priority: 0, campaignGroupingId: '', encodeCampaignId: 'OTIwMA==',
        createdBy: 'Compliance', modifiedBy: 'Compliance', modifiedDate: 'May 30, 2026', createdDate: 'May 28, 2026',
        campaignName: 'Rejected — Policy Violation (Unapproved Content)',
        tags: [{ name: 'Compliance', color: '#ede9fe' }],
        campaignTypeValue: 'Single dimension', communicationType: 'WhatsApp · VMS',
        totalRecipientsCount: 0, statusLabel: 'Reject', expanded: false,
        channels: [CH.whatsapp('fail'), CH.vms('fail')],
    },
];

// ---------------------------------------------------------------------------
// 2. Analytics Listing  — all status variations + negative rows
// ---------------------------------------------------------------------------
export const ANALYTICS_ROWS = [
    {
        id: 11,
        campaignIDEncoded: 'Nzc0NA==', createdName: 'Alex Johnson', modifiedName: 'Alex Johnson',
        modifiedDate: 'Jun 2, 2026', createdDate: 'May 19, 2026',
        campaignName: 'Summer Sale – Refer your friends & earn up to $500 in rewards',
        isGoldCampaign: true,
        tags: [{ name: 'Summer', color: '#d0e8ff' }, { name: 'Referral', color: '#d5f5e3' }],
        campaignTypeValue: 'Single dimension', communicationType: 'Email · Push · Web',
        startDate: 'Jun 1, 2026', isPDFDownloaded: true, statusLabel: 'Completed', expanded: false,
        channels: [CH.email(), CH.push(), CH.web()],
    },
    {
        id: 12,
        campaignIDEncoded: 'ODA2MA==', createdName: 'Ravi Kumar', modifiedName: 'Ravi Kumar',
        modifiedDate: 'May 29, 2026', createdDate: 'May 5, 2026',
        campaignName: 'Q2 Loyalty Rewards Campaign — Multi-channel Engagement Drive',
        isGoldCampaign: false, tags: [],
        campaignTypeValue: 'Multi dimension', communicationType: 'Email · Push · SMS',
        startDate: 'May 10, 2026', isPDFDownloaded: false, statusLabel: 'In progress', expanded: false,
        channels: [CH.email(), CH.push('clock'), CH.sms('clock')],
    },
    {
        id: 13,
        campaignIDEncoded: 'ODQ1Mg==', createdName: 'Mei Lin', modifiedName: '',
        modifiedDate: null, createdDate: 'Jun 1, 2026',
        campaignName: 'New Customer Welcome Series',
        isGoldCampaign: false, tags: [{ name: 'Onboarding', color: '#ede9fe' }],
        campaignTypeValue: 'Event trigger', communicationType: 'WhatsApp',
        startDate: 'Jun 3, 2026', isPDFDownloaded: false, statusLabel: 'Scheduled', expanded: false,
        channels: [CH.whatsapp('clock')],
    },
    {
        id: 14,
        campaignIDEncoded: 'ODU3NA==', createdName: 'Jane Smith', modifiedName: 'Jane Smith',
        modifiedDate: 'May 30, 2026', createdDate: 'May 10, 2026',
        campaignName: 'Mid-Year Multi-Channel Push — Flash Deals',
        isGoldCampaign: true, tags: [{ name: 'Mid-Year', color: '#fef9c3' }],
        campaignTypeValue: 'Single dimension', communicationType: 'Email · SMS',
        startDate: 'May 31, 2026', isPDFDownloaded: true, statusLabel: 'Multi status', expanded: false,
        channels: [CH.email(), CH.sms('clock')],
    },
    {
        id: 15,
        campaignIDEncoded: 'ODY4Mg==', createdName: 'Alan Turing', modifiedName: '',
        modifiedDate: null, createdDate: 'May 20, 2026',
        campaignName: 'Draft — Festive Season Teaser Campaign',
        isGoldCampaign: false, tags: [],
        campaignTypeValue: 'Single dimension', communicationType: 'Push Notification',
        startDate: '—', isPDFDownloaded: false, statusLabel: 'Draft', expanded: false,
        /* negative: no channels for draft */
        channels: [],
    },
    {
        id: 16,
        campaignIDEncoded: 'ODc5MA==', createdName: 'Sara Lee', modifiedName: 'Sara Lee',
        modifiedDate: 'Apr 15, 2026', createdDate: 'Apr 5, 2026',
        campaignName: 'Discontinued — Old Pricing Announcement',
        isGoldCampaign: false, tags: [],
        campaignTypeValue: 'Event trigger', communicationType: 'Email',
        startDate: 'Apr 10, 2026', isPDFDownloaded: false, statusLabel: 'Stopped', expanded: false,
        channels: [{ ...CH.email(), statusIcon: 'icon-rs-circle-close-medium color-primary-red', totalSent: '3,100', delivered: '3,050', reach: '800', engagement: '60', conversion: '0' }],
    },
    {
        id: 17,
        campaignIDEncoded: 'ODkxNg==', createdName: 'Chris Paul', modifiedName: '',
        modifiedDate: null, createdDate: 'May 28, 2026',
        campaignName: 'Paused — Regulatory Hold on Financial Promotions',
        isGoldCampaign: false, tags: [{ name: 'Compliance', color: '#ede9fe' }],
        campaignTypeValue: 'Single dimension', communicationType: 'Email · Push',
        startDate: 'Jun 1, 2026', isPDFDownloaded: false, statusLabel: 'Paused', expanded: false,
        channels: [CH.email('clock'), CH.push('clock')],
    },
    {
        id: 18,
        campaignIDEncoded: 'OTMwMA==', createdName: 'Ops Team', modifiedName: 'Ops Team',
        modifiedDate: 'May 18, 2026', createdDate: 'May 10, 2026',
        campaignName: 'Delivery Failure Alert — Bounce Rate Threshold Exceeded',
        isGoldCampaign: false, tags: [{ name: 'Alert', color: '#fef9c3' }],
        campaignTypeValue: 'Single dimension', communicationType: 'Email · SMS',
        startDate: 'May 12, 2026', isPDFDownloaded: false, statusLabel: 'Alert', expanded: false,
        channels: [CH.email('fail'), CH.sms('clock')],
    },
    {
        id: 19,
        campaignIDEncoded: 'OTQwMA==', createdName: 'Archive Bot', modifiedName: '',
        modifiedDate: null, createdDate: 'Jan 15, 2025',
        campaignName: 'Archived — 2024 Holiday Campaign (Read-only)',
        isGoldCampaign: false, tags: [],
        campaignTypeValue: 'Single dimension', communicationType: 'Email · Push',
        startDate: 'Dec 20, 2024', isPDFDownloaded: true, statusLabel: 'Archived', expanded: false,
        channels: [CH.email(), CH.push()],
    },
    {
        id: 20,
        campaignIDEncoded: 'OTUwMA==', createdName: 'Data Team', modifiedName: 'Data Team',
        modifiedDate: 'Jun 4, 2026', createdDate: 'Jun 4, 2026',
        campaignName: 'Audience Extraction — CRM Sync Batch #42',
        isGoldCampaign: false, tags: [{ name: 'ETL', color: '#e0f7fa' }],
        campaignTypeValue: 'Event trigger', communicationType: 'Email',
        startDate: 'Jun 4, 2026', isPDFDownloaded: false, statusLabel: 'Extraction', expanded: false,
        channels: [CH.email('clock')],
    },
    {
        id: 21,
        campaignIDEncoded: 'OTYwMA==', createdName: 'Compliance', modifiedName: 'Compliance',
        modifiedDate: 'May 30, 2026', createdDate: 'May 28, 2026',
        campaignName: 'Rejected — Policy Violation (Unapproved Content)',
        isGoldCampaign: false, tags: [{ name: 'Compliance', color: '#ede9fe' }],
        campaignTypeValue: 'Single dimension', communicationType: 'WhatsApp · VMS',
        startDate: '—', isPDFDownloaded: false, statusLabel: 'Reject', expanded: false,
        channels: [CH.whatsapp('fail'), CH.vms('fail')],
    },
];

// ---------------------------------------------------------------------------
// 3. Mobile App Notification Grid
// ---------------------------------------------------------------------------
export const APP_ROWS = [
    {
        id: 21,
        appName: 'Resulticks iOS App', createdBy: 'Sarah Williams',
        createdDate: 'May 15, 2026  10:30:45', isEnabled: 'Active', isDefault: true,
        expanded: false,
        appDevices: [
            { id: 211, appDevice: 'iOS',        language: 'English', analyticsPlatforms: 'Firebase'  },
            { id: 212, appDevice: 'iOS (Tablet)',language: 'Native',  analyticsPlatforms: 'Mixpanel'  },
        ],
    },
    {
        id: 22,
        appName: 'Resulticks Android SDK', createdBy: 'James Chen',
        createdDate: 'Apr 22, 2026  09:15:00', isEnabled: 'Inactive', isDefault: false,
        expanded: false,
        appDevices: [
            { id: 221, appDevice: 'Android',        language: 'English', analyticsPlatforms: 'Firebase'         },
            { id: 222, appDevice: 'Android (Tablet)',language: 'Native',  analyticsPlatforms: 'NA'               },
            { id: 223, appDevice: 'HarmonyOS',       language: 'Native',  analyticsPlatforms: 'Huawei Analytics' },
        ],
    },
    {
        /* negative: no device configurations */
        id: 23,
        appName: 'Web Push (Beta)', createdBy: 'Dev Team',
        createdDate: 'Jun 1, 2026  14:00:00', isEnabled: 'Inactive', isDefault: false,
        expanded: false,
        appDevices: [],
    },
];

// ---------------------------------------------------------------------------
// 4. Offer Management – Brand / Shop
// ---------------------------------------------------------------------------
export const BRAND_ROWS = [
    {
        id: 31,
        image: '', shortName: 'RSLT', legalName: 'Resulticks Pte. Ltd.',
        city: 'Singapore', country: 'Singapore', status: 1, expanded: false,
        shopsDetails: [
            { storeID: 311, image: '', shortName: 'Orchard Road', city: 'Singapore', country: 'Singapore', status: 1 },
            { storeID: 312, image: '', shortName: 'Marina Bay',   city: 'Singapore', country: 'Singapore', status: 1 },
        ],
    },
    {
        id: 32,
        image: '', shortName: 'APEX',
        legalName: 'Apex Financial Services Private Limited (Holdings)',
        city: 'Mumbai', country: 'India', status: 0, expanded: false,
        shopsDetails: [
            { storeID: 321, image: '', shortName: 'Bandra West',     city: 'Mumbai',    country: 'India', status: 1 },
            { storeID: 322, image: '', shortName: 'Connaught Place', city: 'New Delhi', country: 'India', status: 0 },
            { storeID: 323, image: '', shortName: 'MG Road',         city: 'Bengaluru', country: 'India', status: 1 },
        ],
    },
    {
        /* negative: brand with no shops yet */
        id: 33,
        image: '', shortName: 'NOVU', legalName: 'Novus Global Retail Co.',
        city: 'Dubai', country: 'UAE', status: 1, expanded: false,
        shopsDetails: [],
    },
];

// ---------------------------------------------------------------------------
// Card configs
// ---------------------------------------------------------------------------

export const COMM_CONFIG = {
    variant: 'communication',
    cardModifiers: 'comm-listing',
    getStatusClass: (item) => getStatusCls(item.statusLabel),

    badge: {
        render: (item) => {
            const prefix = item.campaignGroupingId ? `${item.campaignGroupingId} / ` : '';
            return item.priority > 0
                ? `${prefix}P${item.priority} || ${item.encodeCampaignId ?? ''}`
                : (item.encodeCampaignId ?? '');
        },
    },

    meta: {
        /* Shows author only — the date moves into the title row */
        render: (item) => {
            const modified = !!item.modifiedDate;
            return `${modified ? 'Modified' : 'Created'} by: ${modified ? item.modifiedBy : item.createdBy}`;
        },
    },

    title: {
        /* Campaign name (max 250 chars) and date on the same line — d-flex */
        render: (item) => {
            const modified = !!item.modifiedDate;
            const date = modified ? item.modifiedDate : item.createdDate;
            return (
                <div className="d-flex align-items-center w-100" style={{ gap: 8, minWidth: 0 }}>
                    <span style={{ flex: 1, minWidth: 0 }}>
                        <TruncatedCell value={item.campaignName} noTable />
                    </span>
                    {date && (
                        <small style={{ flexShrink: 0, color: '#7b8898', whiteSpace: 'nowrap' }}>
                            {date}
                        </small>
                    )}
                </div>
            );
        },
    },

    tags: {
        render: (item) => <TagChips tags={item.tags} />,
    },

    columns: [
        {
            key: 'type',
            render: (item) => (
                <>
                    <small>{item.campaignTypeValue}</small>
                    <div className="d-flex">
                        <TruncatedCell value={item.communicationType} noTable />
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
                    {item.totalRecipientsCount > 0 ? item.totalRecipientsCount.toLocaleString() : 'N/A'}
                </p>
            ),
        },
    ],

    status: {
        getClass: (item) => getStatusCls(item.statusLabel),
        getLabel: (item) => item.statusLabel,
    },

    renderActions: () => [
        <li key="edit">     <Ico icon="icon-rs-pencil-edit-medium"   tip="Edit"      id="pv_c_edit" /></li>,
        <li key="analytics"><Ico icon="icon-rs-analytics-medium"     tip="Analytics" id="pv_c_anl"  /></li>,
        <li key="dup">      <Ico icon="icon-rs-duplicate-medium"     tip="Duplicate" id="pv_c_dup"  /></li>,
        <li key="more">
            <RSTooltip text="Actions" position="top">
                <i className="icon-rs-circle-arrow-down-medium icon-md color-primary-blue" id="pv_c_more" />
            </RSTooltip>
        </li>,
    ],

    expandable: true,
};

export const ANALYTICS_CONFIG = {
    variant: 'communication',
    cardModifiers: '',
    getStatusClass: (item) => getStatusCls(item.statusLabel),

    badge: { render: (item) => item.campaignIDEncoded },

    meta: {
        render: (item) => {
            const modified = item.modifiedDate !== null;
            return `${modified ? 'Modified' : 'Created'} by: ${modified ? item.modifiedName : item.createdName}, on: ${modified ? item.modifiedDate : item.createdDate}`;
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
        /* Campaign name max 250 chars — TruncatedCell handles overflow with tooltip */
        render: (item) => <TruncatedCell value={item.campaignName} noTable />,
    },

    tags: {
        render: (item) => <TagChips tags={item.tags} />,
    },

    columns: [
        {
            key: 'type',
            render: (item) => (
                <>
                    <small>{item.campaignTypeValue}</small>
                    <div className="d-flex">
                        <TruncatedCell value={item.communicationType} noTable />
                    </div>
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
        getClass: (item) => getStatusCls(item.statusLabel),
        getLabel: (item) => item.statusLabel,
    },

    renderActions: (item) => [
        <li key="view">  <Ico icon="icon-rs-analytics-medium"   tip="View analytics" id="pv_a_view"  /></li>,
        <li key="trend"> <Ico icon="icon-rs-trend-report-large" tip="Trend report"   disabled id="pv_a_trend" /></li>,
        <li key="share"> <Ico icon="icon-rs-share-tick-medium"  tip="Share"          disabled id="pv_a_share" /></li>,
        <li key="dl">
            <Ico icon="icon-rs-download-medium" tip="Download" disabled={!item.isPDFDownloaded} id="pv_a_dl" />
        </li>,
    ],

    expandable: true,
};

export const APP_CONFIG = {
    variant: 'app',
    getStatusClass: (item) => getStatusCls(item.isEnabled === 'Active' ? 'Active' : 'Inactive'),

    columns: [
        {
            key: 'appName',
            label: 'App name',
            render: (item) => (
                <div className="d-flex">
                    <TruncatedCell value={item.appName} noTable />
                </div>
            ),
        },
        {
            key: 'createdBy',
            label: 'Created by',
            render: (item) => (
                <div className="d-flex">
                    <TruncatedCell value={item.createdBy} noTable />
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
        <li key="edit">   <Ico icon="icon-rs-pencil-edit-medium"         tip="Edit"         id="pv_ap_edit" /></li>,
        <li key="health"> <Ico icon="icon-rs-industry-healthcare-medium" tip="Health check" id="pv_ap_hc"   /></li>,
        <li key="crown">
            <RSTooltip text="Priority" position="top">
                <i
                    id="pv_ap_crown"
                    className={`icon-rs-crown-medium icon-md ${item.isDefault ? 'color-yellow-medium' : 'color-primary-blue'}`}
                />
            </RSTooltip>
        </li>,
        <li key="settings"><Ico icon="icon-rs-settings-medium" tip="Settings" id="pv_ap_cfg" /></li>,
        <li key="more">
            <RSTooltip text="More" position="top">
                <i className="icon-rs-circle-arrow-down-medium icon-md color-primary-blue" id="pv_ap_more" />
            </RSTooltip>
        </li>,
    ],

    expandable: true,
};

export const BRAND_CONFIG = {
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

    badge: { render: (item) => item.shortName || 'N/A' },

    title: {
        render: (item) => <TruncatedCell value={item.legalName} noTable />,
    },

    columns: [
        {
            key: 'location',
            label: 'Location',
            render: (item) => (
                <p style={{ margin: 0 }}>
                    {item.city && item.country
                        ? `${item.city}, ${item.country}`
                        : item.city || item.country || 'N/A'}
                </p>
            ),
        },
        {
            /* Spacer — keeps nth-child(4) targeting intact for brand-shops-card CSS width overrides */
            key: 'spacer',
            render: () => null,
        },
    ],

    status: {
        getClass: (item) => (item.status === 1 ? 'status-completed' : 'status-draft'),
        getLabel: (item) => (item.status === 1 ? 'Active' : 'Inactive'),
    },

    renderActions: () => [
        <li key="edit"><Ico icon="icon-rs-pencil-edit-medium" tip="Edit"   id="pv_b_edit" /></li>,
        <li key="del"> <Ico icon="icon-rs-delete-medium"      tip="Delete" red id="pv_b_del" /></li>,
    ],

    expandable: true,
};

const STATUS_SWATCH_DESCRIPTION = COMMUNICATION_STATUS_DEMO_LABELS.join(' · ');

/**
 * Default props for ResGridDocsPreview — pass via docs or override per integration.
 * All grid data and list-card configs are supplied here; the preview has no hard-coded rows.
 */
export const RESGRID_DEMO_DEFAULTS = {
    communication: {
        title: '1 · Communication Listing',
        description: `All status colours (${STATUS_SWATCH_DESCRIPTION}). Channel tiles use getChannelId() from channelConstants.js (duplicated Utils communicationChannels — icons · colors · names).`,
        data: COMM_ROWS,
        listCardConfig: COMM_CONFIG,
        columns: buildListColumns(COMM_CONFIG),
        listPreset: 'communication',
        skeletonVariant: 'communication',
        skeletonRows: SKELETON_ROWS.communication,
        emptyMessage: 'No communications found',
        emptyMessageExtended: 'No communications found. Create your first campaign to get started.',
        detailType: 'communication',
    },
    analytics: {
        title: '2 · Analytics Listing',
        description: `All status colours + golden campaign indicator · ★ = golden campaign · ${STATUS_SWATCH_DESCRIPTION}`,
        data: ANALYTICS_ROWS,
        listCardConfig: ANALYTICS_CONFIG,
        columns: buildListColumns(ANALYTICS_CONFIG),
        listPreset: 'analytics',
        skeletonRows: SKELETON_ROWS.analytics,
        emptyMessage: 'No analytics records found',
        emptyMessageExtended: 'No analytics data available for the selected filters.',
        detailType: 'communication',
    },
    app: {
        title: '3 · Mobile App Notification',
        description: 'App variant (rs-list-grid-wrapper) · Crown turns yellow for default app · Row 3 = no devices (negative)',
        data: APP_ROWS,
        listCardConfig: APP_CONFIG,
        columns: buildListColumns(APP_CONFIG),
        listConfig: { rowGap: 10, detailOverlap: 22, wrapperPlatformClass: 'rs-grid-listing' },
        skeletonVariant: 'app',
        skeletonRows: SKELETON_ROWS.app,
        emptyMessage: 'No apps configured',
        emptyMessageExtended: 'No apps configured. Add your first mobile app to get started.',
        detailType: 'app',
    },
    brand: {
        title: '4 · Offer Management – Brand / Shop',
        description: 'Brand avatar · location · Active / Inactive · Row 3 = no shops yet (negative)',
        data: BRAND_ROWS,
        listCardConfig: BRAND_CONFIG,
        columns: buildListColumns(BRAND_CONFIG),
        listConfig: { rowGap: 10, detailOverlap: 22, wrapperPlatformClass: 'rs-grid-listing' },
        skeletonVariant: 'brand',
        skeletonRows: SKELETON_ROWS.brand,
        emptyMessage: 'No brands found',
        emptyMessageExtended: 'No brands found. Add a brand to start managing your shop catalogue.',
        detailType: 'brand',
    },
    showLoadingSections: true,
    showEmptySections: true,
};
