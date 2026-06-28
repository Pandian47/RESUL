// Node and edge definitions for Customer Journey Flow
// Layout matches the image with 3 horizontal rows

import { ch_email, ch_sms, ch_web_push, ch_mobile_push, ch_light_grey } from 'Constants/GlobalConstant/Colors/colorsVariable';

const ROW_HEIGHT = 240;
const COL_WIDTH = 160;
const START_X = 100;
const START_Y = 50;

// Channel configuration for different dimensions
const channelConfig = {
    Email: { icon: 'icon-rs-email-medium', color: ch_light_grey, backgroundColor: ch_email },
    SMS: { icon: 'icon-rs-mobile-sms-medium', color: ch_light_grey, backgroundColor: ch_sms },
    Mobile: { icon: 'icon-rs-mobile-medium', color: ch_light_grey, backgroundColor: ch_mobile_push },
    Web: { icon: 'icon-rs-web-medium', color: ch_light_grey, backgroundColor: ch_web_push },
};

const CHANNEL_DIMENSION_KEYS = new Set(['Email', 'SMS', 'Mobile', 'Web']);

function getChannelNodeConfig(dimensionName) {
    const name = String(dimensionName ?? '').trim();
    if (CHANNEL_DIMENSION_KEYS.has(name)) {
        return { ...channelConfig[name], dimensionLabel: null };
    }
    return {
        ...channelConfig.Mobile,
        dimensionLabel: name || '—',
    };
}

// Helper: Extract display label from URL
// Shows hostname if pathname is '/', otherwise shows pathname
function extractPathLabel(url) {
    try {
        const urlObj = new URL(url);
        if (urlObj.pathname === '/' || urlObj.pathname === '') {
            return urlObj.hostname;
        }
        return urlObj.pathname;
    } catch {
        return url;
    }
}

function isHttpUrlString(value) {
    return typeof value === 'string' && /^https?:\/\//i.test(value.trim());
}

/** Stable key for funnel merge: URLs use host+path; native screens use full string */
function getFlowKey(raw) {
    const s = String(raw ?? '').trim();
    if (!s) {
        return '';
    }
    if (isHttpUrlString(s)) {
        try {
            const urlObj = new URL(s);
            return urlObj.hostname + urlObj.pathname;
        } catch {
            return s;
        }
    }
    return s;
}

function getFlowLabel(raw) {
    const s = String(raw ?? '').trim();
    if (!s) {
        return '';
    }
    if (isHttpUrlString(s)) {
        return extractPathLabel(s);
    }
    const colon = s.indexOf(':');
    if (colon > 0) {
        return s.slice(0, colon);
    }
    const lastDot = s.lastIndexOf('.');
    if (lastDot >= 0 && lastDot < s.length - 1) {
        return s.slice(lastDot + 1);
    }
    return s.length > 48 ? `${s.slice(0, 45)}…` : s;
}

// Helper: Format count (e.g., 1000 → "1K")
function formatCount(count) {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
    return String(count);
}

function dimensionSlug(dimensionName) {
    return String(dimensionName ?? 'dim')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-_]/gi, '');
}

/**
 * Transform API data to React Flow nodes and edges
 * - Column 0: shared step-0 "from" nodes (same flow key across dimensions)
 * - Columns 1+: per-dimension nodes; edges follow each transition (http URLs or native screen ids)
 * @param {Object} apiData - API response with dimensions[].steps[].transitions
 * @returns {{ nodes: Array, edges: Array }}
 */
export function transformApiDataToFlow(apiData) {
    const nodes = [];
    const edges = [];

    const DYNAMIC_ROW_HEIGHT = 240;
    const DYNAMIC_COL_WIDTH = 160;
    const DYNAMIC_START_X = 150;
    const DYNAMIC_START_Y = 80;
    const BRANCH_OFFSET_Y = 110;
    const SHARED_STACK_OFFSET = 110;

    if (!apiData.dimensions) {
        return { nodes, edges };
    }

    const firstColumnUrls = new Map();

    apiData.dimensions.forEach((dimension, rowIndex) => {
        const step0 = dimension.steps?.find((s) => s.step === 0);
        if (step0?.transitions?.length) {
            step0.transitions.forEach((transition) => {
                const fromKey = getFlowKey(transition.from);
                if (!fromKey) {
                    return;
                }

                if (!firstColumnUrls.has(fromKey)) {
                    firstColumnUrls.set(fromKey, {
                        url: transition.from,
                        count: 0,
                        dropOffs: 0,
                        rowIndices: [],
                        dimensions: [],
                    });
                }

                const urlData = firstColumnUrls.get(fromKey);
                urlData.count += transition.count;
                urlData.dropOffs = Math.max(urlData.dropOffs, step0.drop_offs ?? 0);
                if (!urlData.rowIndices.includes(rowIndex)) {
                    urlData.rowIndices.push(rowIndex);
                }
                if (!urlData.dimensions.includes(dimension.dimension)) {
                    urlData.dimensions.push(dimension.dimension);
                }
            });
        }
    });

    const sharedFirstNodes = new Map();
    let sharedNodeIndex = 0;

    const clusterMap = new Map();
    firstColumnUrls.forEach((urlData, urlKey) => {
        const clusterKey = [...urlData.rowIndices].sort((a, b) => a - b).join(',');
        if (!clusterMap.has(clusterKey)) {
            clusterMap.set(clusterKey, []);
        }
        clusterMap.get(clusterKey).push({ urlKey, urlData });
    });

    clusterMap.forEach((entries) => {
        const rowIndices = entries[0].urlData.rowIndices;
        const minRow = Math.min(...rowIndices);
        const maxRow = Math.max(...rowIndices);
        const baseY = DYNAMIC_START_Y + DYNAMIC_ROW_HEIGHT * ((minRow + maxRow) / 2);
        const n = entries.length;
        entries.forEach((entry, i) => {
            const { urlKey, urlData } = entry;
            const yPosition = n > 1 ? baseY + (i - (n - 1) / 2) * SHARED_STACK_OFFSET : baseY;
            const pageId = `page-shared-col0-${sharedNodeIndex}`;
            const label = getFlowLabel(urlData.url);

            nodes.push({
                id: pageId,
                type: 'pageNode',
                position: {
                    x: DYNAMIC_START_X,
                    y: yPosition,
                },
                data: {
                    label,
                    count: formatCount(urlData.count),
                    hasDownloadIcon: urlData.dropOffs > 0,
                },
            });

            sharedFirstNodes.set(urlKey, pageId);
            sharedNodeIndex += 1;
        });
    });

    let edgeSeq = 0;
    const pushEdge = (source, target) => {
        if (!source || !target || source === target) {
            return;
        }
        edgeSeq += 1;
        edges.push({
            id: `e-journey-${edgeSeq}`,
            source,
            target,
            type: 'dashedEdge',
        });
    };

    apiData.dimensions.forEach((dimension, rowIndex) => {
        const dimSlug = dimensionSlug(dimension.dimension);
        const channelId = `channel-${dimSlug}-${rowIndex}`;
        const config = getChannelNodeConfig(dimension.dimension);

        nodes.push({
            id: channelId,
            type: 'channelNode',
            position: { x: 0, y: DYNAMIC_START_Y + DYNAMIC_ROW_HEIGHT * rowIndex },
            data: {
                icon: config.icon,
                count: formatCount(dimension.entry_count ?? 0),
                color: config.color,
                backgroundColor: config.backgroundColor,
                ...(config.dimensionLabel ? { label: config.dimensionLabel } : {}),
            },
        });

        const step0 = dimension.steps?.find((s) => s.step === 0);
        const step0FromKeys = new Set();
        step0?.transitions?.forEach((t) => {
            const fk = getFlowKey(t.from);
            if (fk) {
                step0FromKeys.add(fk);
            }
        });
        step0FromKeys.forEach((fromKey) => {
            const targetId = sharedFirstNodes.get(fromKey);
            if (targetId) {
                pushEdge(channelId, targetId);
            }
        });

        const keysByCol = new Map();
        const addKey = (col, key) => {
            if (!key || col < 1) {
                return;
            }
            if (!keysByCol.has(col)) {
                keysByCol.set(col, new Set());
            }
            keysByCol.get(col).add(key);
        };

        (dimension.steps || []).forEach((step) => {
            (step.transitions || []).forEach((transition) => {
                const fk = getFlowKey(transition.from);
                const tk = getFlowKey(transition.to);
                const s = step.step;
                if (tk) {
                    addKey(s + 1, tk);
                }
                if (s > 0 && fk) {
                    addKey(s, fk);
                }
            });
        });

        const dimNodeByColKey = new Map();
        const sortedCols = Array.from(keysByCol.keys()).sort((a, b) => a - b);

        sortedCols.forEach((colIndex) => {
            const keySet = keysByCol.get(colIndex);
            const keysArr = Array.from(keySet).sort();
            keysArr.forEach((urlKey, pageIndex) => {
                let incoming = 0;
                let dropMax = 0;
                (dimension.steps || []).forEach((step) => {
                    if (step.step + 1 !== colIndex) {
                        return;
                    }
                    (step.transitions || []).forEach((t) => {
                        if (getFlowKey(t.to) !== urlKey) {
                            return;
                        }
                        incoming += t.count;
                        dropMax = Math.max(dropMax, step.drop_offs ?? 0);
                    });
                });

                const sampleUrl = (dimension.steps || [])
                    .flatMap((st) => st.transitions || [])
                    .find((t) => getFlowKey(t.to) === urlKey)?.to;

                const pageId = `page-${dimSlug}-col${colIndex}-${pageIndex}`;
                dimNodeByColKey.set(`${colIndex}|${urlKey}`, pageId);

                const yOffset = BRANCH_OFFSET_Y * pageIndex;

                nodes.push({
                    id: pageId,
                    type: 'pageNode',
                    position: {
                        x: DYNAMIC_START_X + DYNAMIC_COL_WIDTH * colIndex,
                        y: DYNAMIC_START_Y + DYNAMIC_ROW_HEIGHT * rowIndex + yOffset,
                    },
                    data: {
                        label: getFlowLabel(sampleUrl ?? urlKey),
                        count: formatCount(incoming),
                        hasDownloadIcon: dropMax > 0,
                    },
                });
            });
        });

        (dimension.steps || []).forEach((step) => {
            (step.transitions || []).forEach((transition) => {
                const fk = getFlowKey(transition.from);
                const tk = getFlowKey(transition.to);
                const s = step.step;
                const sourceId = s === 0 ? sharedFirstNodes.get(fk) : dimNodeByColKey.get(`${s}|${fk}`);
                const targetId = dimNodeByColKey.get(`${s + 1}|${tk}`);
                if (sourceId && targetId) {
                    pushEdge(sourceId, targetId);
                }
            });
        });
    });

    return { nodes, edges };
}

export const initialNodes = [
    // Channel Nodes (Left side - sources)
    {
        id: 'channel-mobile',
        type: 'channelNode',
        position: { x: 0, y: START_Y },
        data: {
            icon: 'icon-rs-mobile-medium',
            count: '420K',
            color: '#7CB342',
            backgroundColor: '#8BC34A',
        },
    },
    {
        id: 'channel-email',
        type: 'channelNode',
        position: { x: 0, y: START_Y + ROW_HEIGHT },
        data: {
            icon: 'icon-rs-email-medium',
            count: '480K',
            color: '#F57C00',
            backgroundColor: '#FF9800',
        },
    },
    {
        id: 'channel-web',
        type: 'channelNode',
        position: { x: 0, y: START_Y + ROW_HEIGHT * 2 },
        data: {
            icon: 'icon-rs-web-medium',
            count: '2,800K',
            color: '#7CB342',
            backgroundColor: '#8BC34A',
        },
    },

    // Row 1 (Mobile): /home → /fd-apply → /fill-form → /request-callback
    //                                   ↘ /fill-form(download) → /request-callback
    {
        id: 'page-home',
        type: 'pageNode',
        position: { x: START_X, y: START_Y },
        data: {
            label: '/home',
            count: '300K',
            hasDownloadIcon: false,
        },
    },
    {
        id: 'page-fd-apply',
        type: 'pageNode',
        position: { x: START_X + COL_WIDTH, y: START_Y },
        data: {
            label: '/fd-apply',
            count: '202K',
            hasDownloadIcon: false,
        },
    },
    {
        id: 'page-fill-form',
        type: 'pageNode',
        position: { x: START_X + COL_WIDTH * 2, y: START_Y },
        data: {
            label: '/fill-form',
            count: '215K',
            hasDownloadIcon: false,
        },
    },
    {
        id: 'page-request-callback-1',
        type: 'pageNode',
        position: { x: START_X + COL_WIDTH * 3, y: START_Y },
        data: {
            label: '/request-callback',
            count: '79K',
            hasDownloadIcon: true,
        },
    },
    // Branch from /fill-form → /fill-form download → /request-callback (below row 1)
    {
        id: 'page-fill-form-download',
        type: 'pageNode',
        position: { x: START_X + COL_WIDTH * 3, y: START_Y + 110 },
        data: {
            label: '/fill-form',
            count: '68K',
            hasDownloadIcon: true,
        },
    },
    {
        id: 'page-request-callback-2',
        type: 'pageNode',
        position: { x: START_X + COL_WIDTH * 4, y: START_Y + 110 },
        data: {
            label: '/request-callback',
            count: '32K',
            hasDownloadIcon: true,
        },
    },

    // Row 2 (Email & Web shared): /fd-renewal-apply → /fill-form → /submit-form → /thankyou
    {
        id: 'page-fd-renewal-apply',
        type: 'pageNode',
        position: { x: START_X, y: START_Y + ROW_HEIGHT },
        data: {
            label: '/fd-renewal-apply',
            count: '545K',
            hasDownloadIcon: true,
        },
    },
    {
        id: 'page-submit-form',
        type: 'pageNode',
        position: { x: START_X + COL_WIDTH * 2, y: START_Y + ROW_HEIGHT },
        data: {
            label: '/submit-form',
            count: '86K',
            hasDownloadIcon: false,
        },
    },
    {
        id: 'goal-thank-you',
        type: 'goalNode',
        position: { x: START_X + COL_WIDTH * 3, y: START_Y + ROW_HEIGHT },
        data: {
            label: '/thank-you',
            count: '14.8K',
        },
    },

    // Row 3 (Web): /request-callback
    {
        id: 'page-request-callback-web',
        type: 'pageNode',
        position: { x: START_X + COL_WIDTH, y: START_Y + ROW_HEIGHT * 2 },
        data: {
            label: '/request-callback',
            count: '202K',
            hasDownloadIcon: true,
        },
    },
];

export const initialEdges = [
    // Row 1 (Mobile): mobile → /home → /fd-apply → /fill-form → /request-callback
    {
        id: 'e-mobile-home',
        source: 'channel-mobile',
        target: 'page-home',
        type: 'dashedEdge',
    },
    {
        id: 'e-home-fd-apply',
        source: 'page-home',
        target: 'page-fd-apply',
        type: 'dashedEdge',
    },
    {
        id: 'e-fd-apply-fill-form',
        source: 'page-fd-apply',
        target: 'page-fill-form',
        type: 'dashedEdge',
    },
    {
        id: 'e-fill-form-request-callback-1',
        source: 'page-fill-form',
        target: 'page-request-callback-1',
        type: 'dashedEdge',
    },
    // Branch: /fill-form → /fill-form download → /request-callback
    {
        id: 'e-fill-form-download',
        source: 'page-fill-form',
        target: 'page-fill-form-download',
        type: 'dashedEdge',
    },
    {
        id: 'e-fill-form-download-request-callback',
        source: 'page-fill-form-download',
        target: 'page-request-callback-2',
        type: 'dashedEdge',
    },

    // Row 2 (Email): email → /fd-renewal-apply → /fill-form → /submit-form → /thankyou
    {
        id: 'e-email-fd-renewal',
        source: 'channel-email',
        target: 'page-fd-renewal-apply',
        type: 'dashedEdge',
    },
    {
        id: 'e-fd-renewal-fill-form',
        source: 'page-fd-renewal-apply',
        target: 'page-fill-form',
        type: 'dashedEdge',
    },
    {
        id: 'e-fill-form-submit',
        source: 'page-fill-form',
        target: 'page-submit-form',
        type: 'dashedEdge',
    },
    {
        id: 'e-submit-thankyou',
        source: 'page-submit-form',
        target: 'goal-thank-you',
        type: 'dashedEdge',
    },

    // Row 3 (Web): web → /fd-renewal-apply (shared) → /request-callback
    {
        id: 'e-web-fd-renewal',
        source: 'channel-web',
        target: 'page-fd-renewal-apply',
        type: 'dashedEdge',
    },
    {
        id: 'e-fd-renewal-request-callback',
        source: 'page-fd-renewal-apply',
        target: 'page-request-callback-web',
        type: 'dashedEdge',
    },
];
