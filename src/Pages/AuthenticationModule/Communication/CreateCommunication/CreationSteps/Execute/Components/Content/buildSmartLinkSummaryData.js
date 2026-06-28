import { truncateTitle } from 'Utils/modules/displayCore';
const TICK_FIELDS = [
    'sms',
    'email',
    'whatsapp',
    'facebook',
    'instagram',
    'linkedin',
    'notification',
    'mobileNotification',
    'qr',
    'rcs',
    'orm',
    'webAnalytics',
    'paidMedia',
    'vms',
    'voice',
    'line'
];
const CHANNEL_ID_TO_TICK_FIELDS = {
    1: ['email'],
    2: ['sms'],
    21: ['whatsapp'],
    41: ['rcs'],
    3: ['qr'],
    8: ['notification'],
    14: ['mobileNotification'],
    5: ['facebook', 'instagram', 'linkedin'],
    7: ['facebook', 'instagram', 'linkedin'],
    6: ['webAnalytics'],
    // 16: ['mobileAnalytics'],
    10: ['paidMedia'],
    // 25: ['vms'],
    // 26: ['voice'],
    // 30: ['line'],
};

function normalizeLinkKey(link) {
    const raw = String(link ?? '').trim();
    if (!raw) return '';
    try {
        return new URL(raw).href;
    } catch {
        return raw;
    }
}

function shortenLinkLine(url) {
    const raw = String(url ?? '').trim();
    if (!raw) return '';
    try {
        const u = new URL(raw);
        const host = u.host.replace(/^www\./i, '');
        const path = u.pathname === '/' ? '' : u.pathname;
        const combined = host + (u.search || '') + path;
        return truncateTitle(combined, 40);
    } catch {
        return truncateTitle(raw, 40);
    }
}

function emptyTicks() {
    return TICK_FIELDS.reduce((acc, k) => {
        acc[k] = 'x';
        return acc;
    }, {});
}

/**
 * Build grid rows from `GetCampaign Analyze` style `channelDetails[]` (each with `contentDetail.content[].links[]`).
 * Each link: `{ link, isValid, smartlinkFriendlyname }`.
 */
export function buildSmartLinkSummaryRows(channelDetailsList = []) {
    if (!Array.isArray(channelDetailsList) || !channelDetailsList.length) return [];

    const byKey = new Map();

    channelDetailsList.forEach((channel) => {
        const tickFields = CHANNEL_ID_TO_TICK_FIELDS[channel?.channelId] || [];
        const contents = channel?.contentDetail?.content || [];

        contents.forEach((content) => {
            (content?.links || []).forEach((item) => {
                const destination = String(item?.link ?? '').trim();
                const key = normalizeLinkKey(destination);
                if (!key) return;

                const friendly = String(item?.smartlinkFriendlyname ?? '').trim();
                const isValid = item?.isValid === true;

                let row = byKey.get(key);
                if (!row) {
                    row = {
                        ...emptyTicks(),
                        smartLinkName: friendly || truncateTitle(destination, 42) || '—',
                        smartLinkUrl: shortenLinkLine(destination),
                        destination,
                        _valid: isValid,
                    };
                    byKey.set(key, row);
                } else {
                    if (friendly && (!row.smartLinkName || row.smartLinkName === truncateTitle(destination, 42))) {
                        row.smartLinkName = friendly;
                    }
                    row._valid = row._valid || isValid;
                    if (!row.smartLinkUrl) row.smartLinkUrl = shortenLinkLine(destination);
                }

                tickFields.forEach((field) => {
                    if (TICK_FIELDS.includes(field)) {
                        row[field] = true;
                    }
                });
            });
        });
    });

    return Array.from(byKey.values()).map((row, idx) => {
        const status = row._valid ? 'Active' : 'Inactive';
        const { _valid, ...rest } = row;
        return { ...rest, id: idx, status };
    });
}

export function buildSmartLinkSummaryStats(channelDetailsList = [], rows = []) {
    const channels = Array.isArray(channelDetailsList) ? channelDetailsList.length : 0;
    let embeddings = 0;
    (channelDetailsList || []).forEach((ch) => {
        (ch?.contentDetail?.content || []).forEach((c) => {
            embeddings += (c?.links || []).length;
        });
    });
    const used = rows.length;
    const active = rows.filter((r) => r.status === 'Active').length;

    return [
        { key: 'channels', value: String(channels) },
        { key: 'embeddings', value: String(embeddings) },
        { key: 'used', value: String(used) },
        { key: 'active', value: `${active} / ${used || 0}` },
    ];
}
