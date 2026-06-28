import { primaryFont, rsFontxs } from 'Constants/GlobalConstant/Fonts/Fonts';
import { ch_color1, ch_color2, ch_color3, ch_color4, ch_color5, ch_color6, ch_color7, ch_color8, ch_color9 } from 'Constants/GlobalConstant/Colors/colorsVariable';
import PropTypes from 'prop-types';
/** Shown in labels / tooltips; internal graph names use {@link othersColName} to avoid level collisions. */
const OTHERS_DISPLAY = 'Others';
const OTHERS_COL_PREFIX = '__sankey_others_col_';

/** Visible but shown as 0 in tooltips (Highcharts often drops true 0). */
const SYNTHETIC_LINK_WEIGHT = 0.02;

const KNOWN_OS = new Set([
    'Windows',
    'Mac OS',
    'MacOS',
    'Linux',
    'Android',
    'iOS',
    'iPadOS',
    'watchOS',
    'tvOS',
    'Chrome OS',
    'ChromeOS',
    'Ubuntu',
    'Debian',
    'Fedora',
]);

function othersColName(col) {
    return `${OTHERS_COL_PREFIX}${col}`;
}

function isSyntheticOthersName(name) {
    return String(name).startsWith(OTHERS_COL_PREFIX);
}

/** Invisible steps inserted to break API skip-links (e.g. State → Device with no City/OS). */
function isInternalSkipStepName(name) {
    return String(name).startsWith('__sankey_skip__');
}

/** Synthetic chain above sparse roots (e.g. Uttar Pradesh → Mobile only). */
function isShallowLadderName(name) {
    const s = String(name);
    return s.startsWith('__sankey_shallow_head__') || s.startsWith('__sankey_shallow_mid__');
}

function isSankeyPaddingNodeName(name) {
    return isSyntheticOthersName(name) || isInternalSkipStepName(name) || isShallowLadderName(name);
}

function parseOthersColIndex(name) {
    const m = String(name).match(new RegExp(`^${OTHERS_COL_PREFIX}(\\d+)$`));
    return m ? Number(m[1]) : null;
}

function formatSankeyWeight(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return '0';
    if (n > 0 && n < 0.05) return '0';
    return n.toLocaleString('en-US');
}

function isLikelyScreenResolutionName(name) {
    return /\d{3,4}\s*[xX]\s*\d{3,4}/.test(String(name));
}

function isLikelyNumericOsVersion(name) {
    return /^\d+(\.\d+)*$/.test(String(name).trim());
}

function isLikelyMacReleaseName(name) {
    return /^(Ventura|Monterey|Sonoma|Sequoia|Big Sur|Catalina|Mojave|High Sierra|Sierra|El Capitan|Yosemite|Lion|Tahoe)$/i.test(
        String(name).trim(),
    );
}

/**
 * A "real" next column hop for forward-padding. Allows OS→version, OS→state (web path), etc.
 * Still blocks self-loops and handles synthetic Others columns and version→resolution chains.
 */
function countsAsValidForwardSankeyStep(fromName, toName, fromLevel, toLevel) {
    if (toLevel !== fromLevel + 1) return false;
    const fromS = String(fromName);
    const toS = String(toName);

    if (isSyntheticOthersName(fromS) && isSyntheticOthersName(toS)) {
        const cf = parseOthersColIndex(fromS);
        const ct = parseOthersColIndex(toS);
        return cf != null && ct != null && ct === cf + 1;
    }
    if (isSyntheticOthersName(fromS) || isSyntheticOthersName(toS)) return true;

    if (fromS === 'Windows') {
        const t = toS.trim();
        if (/^\d{1,2}(\.\d+)?$/.test(t)) return true;
        if (/^(2000|2003|2008|2012|2016|2019|2022|2025)$/.test(t)) return true;
        // Web path: City → Windows → State/Device; do not treat geography as invalid.
        return true;
    }
    if (fromS === 'Mac OS' || fromS === 'MacOS') {
        if (toS === fromS) return false;
        if (isLikelyNumericOsVersion(toS) || isLikelyMacReleaseName(toS)) return true;
        // Same as Windows: allow OS → state / device / next funnel tier.
        return true;
    }

    if (isLikelyNumericOsVersion(fromS) && !KNOWN_OS.has(fromS)) {
        return isLikelyScreenResolutionName(toS) || isSyntheticOthersName(toS);
    }

    return true;
}

function getRoots(edgeList) {
    const rawFromNodes = new Set(edgeList.map((item) => item.from));
    const rawToNodes = new Set(edgeList.map((item) => item.to));
    return [...rawFromNodes].filter((node) => !rawToNodes.has(node));
}

/**
 * Normalizes API "None" rows.
 * `None -> <deep>` (e.g. None -> Mac OS) is dropped — folding to Country→State Others created a
 * misleading "Others → Others" strip. Explicit `Country -> None` (non-zero) still maps to state-tier Others.
 */
function preprocessPathAnalyserEdges(edgeList) {
    const roots = new Set(getRoots(edgeList));
    return edgeList.flatMap((e) => {
        const origFrom = e.from;
        const origTo = e.to;
        const w = Number(e.weight ?? e.value ?? 0);

        if (String(origTo).trim() === 'None' && roots.has(String(origFrom))) {
            if (w === 0) return [];
            return [{ from: origFrom, to: othersColName(1), weight: w }];
        }

        if (String(origFrom).trim() === 'None' && String(origTo).trim() !== 'None') {
            return [];
        }

        return [{ from: origFrom, to: origTo, weight: w }];
    });
}

function mergeEdgesByFromTo(edgeList) {
    const m = new Map();
    edgeList.forEach((e) => {
        const k = `${e.from}\0${e.to}`;
        const w = Number(e.weight ?? e.value ?? 0) || 0;
        if (!m.has(k)) m.set(k, { from: e.from, to: e.to, weight: w });
        else m.get(k).weight += w;
    });
    return [...m.values()];
}

/** Drops any remaining `Others_col_0 -> X` where X is not the state-tier Others bucket (illegal skip-link). */
function filterInvalidOthersShortcutEdges(edgeList) {
    const o0 = othersColName(0);
    const o1 = othersColName(1);
    return edgeList.filter((e) => !(e.from === o0 && e.to !== o1));
}

/** Sankey level propagation (longest path from roots). Caller must avoid self-loop edges. */
function computeNodeLevelsFromEdges(edgeList) {
    const filtered = edgeList.filter(
        (e) => e?.from != null && e?.to != null && e.from !== '' && e.to !== '' && e.from !== e.to,
    );
    if (filtered.length === 0) {
        return new Map();
    }
    const rawFromNodes = new Set(filtered.map((item) => item.from));
    const rawToNodes = new Set(filtered.map((item) => item.to));
    const roots = [...rawFromNodes].filter((node) => !rawToNodes.has(node));

    const nodeLevel = new Map();
    const seedNodes = roots.length > 0 ? roots : [...rawFromNodes];
    seedNodes.forEach((node) => nodeLevel.set(node, 0));

    const maxIterations = Math.max(1, filtered.length * 3);
    for (let i = 0; i < maxIterations; i += 1) {
        let changed = false;
        filtered.forEach((edge) => {
            const fromLevel = nodeLevel.has(edge.from) ? nodeLevel.get(edge.from) : 0;
            const nextLevel = Number(fromLevel) + 1;
            const existingToLevel = nodeLevel.get(edge.to);
            if (existingToLevel == null || nextLevel > existingToLevel) {
                nodeLevel.set(edge.to, nextLevel);
                changed = true;
            }
            if (!nodeLevel.has(edge.from)) {
                nodeLevel.set(edge.from, 0);
                changed = true;
            }
        });
        if (!changed) break;
    }
    return nodeLevel;
}

function collectNodes(edgeList) {
    const s = new Set();
    edgeList.forEach((e) => {
        s.add(e.from);
        s.add(e.to);
    });
    return s;
}

function maxReachableLevel(start, edgeList, nodeLevel) {
    let maxL = nodeLevel.get(start) ?? 0;
    const stack = [start];
    const seen = new Set();
    while (stack.length) {
        const n = stack.pop();
        if (seen.has(n)) continue;
        seen.add(n);
        maxL = Math.max(maxL, nodeLevel.get(n) ?? 0);
        edgeList.forEach((e) => {
            if (e.from === n) stack.push(e.to);
        });
    }
    return maxL;
}

/**
 * Highcharts needs one column per hop. When the API sends a long skip (levels differ by >1),
 * insert anonymous intermediate nodes so each link advances exactly one column.
 */
function splitSkipLinksInGraph(edgeList) {
    let list = mergeEdgesByFromTo(edgeList);
    let skipSeq = 0;
    for (let guard = 0; guard < 80; guard += 1) {
        const nl = computeNodeLevelsFromEdges(list);
        const removeKeys = new Set();
        const replacements = [];
        for (const e of list) {
            if (!e?.from || !e?.to || e.from === e.to) continue;
            const Lf = nl.get(e.from);
            const Lt = nl.get(e.to);
            if (Lf == null || Lt == null) continue;
            if (Lt <= Lf + 1) continue;
            removeKeys.add(`${e.from}\0${e.to}`);
            const gap = Lt - Lf - 1;
            const w = Number(e.weight ?? e.value ?? 0) || 0;
            let prev = e.from;
            for (let i = 0; i < gap; i += 1) {
                const mid = `__sankey_skip__${skipSeq}`;
                skipSeq += 1;
                replacements.push({ from: prev, to: mid, weight: w });
                prev = mid;
            }
            replacements.push({ from: prev, to: e.to, weight: w });
        }
        if (removeKeys.size === 0) break;
        list = list.filter((e) => !removeKeys.has(`${e.from}\0${e.to}`)).concat(replacements);
        list = mergeEdgesByFromTo(list);
    }
    return list;
}

/**
 * Sparse subgraphs (e.g. only `Uttar Pradesh → Mobile`) used to get `Others_col_0 → root`, which
 * placed states under Product category. Instead, prepend a short synthetic ladder so the subtree
 * ends at the same last column as full paths.
 */
function addShallowRootLadders(edgeList, expectedLevels) {
    const expected = Number(expectedLevels);
    if (!Number.isFinite(expected) || expected < 2) return edgeList;
    const targetMaxLevelIndex = expected - 1;
    const list = mergeEdgesByFromTo(edgeList);
    const nl = computeNodeLevelsFromEdges(list);
    const rawFromNodes = new Set(list.map((e) => e.from));
    const rawToNodes = new Set(list.map((e) => e.to));
    const roots = [...rawFromNodes].filter((n) => !rawToNodes.has(n));

    const mainRoots = new Set();
    roots.forEach((r) => {
        if (isSankeyPaddingNodeName(r)) return;
        const mr = maxReachableLevel(r, list, nl);
        if (mr >= targetMaxLevelIndex) mainRoots.add(r);
    });

    const toAdd = [];
    let ladderId = 0;
    roots.forEach((r) => {
        if (isSankeyPaddingNodeName(r)) return;
        if (mainRoots.has(r)) return;
        const mr = maxReachableLevel(r, list, nl);
        if (mr >= targetMaxLevelIndex) return;
        const padCount = targetMaxLevelIndex - mr;
        if (padCount <= 0) return;
        const id = ladderId;
        ladderId += 1;
        let prev = `__sankey_shallow_head__${id}`;
        for (let i = 0; i < padCount; i += 1) {
            const isLast = i === padCount - 1;
            const next = isLast ? r : `__sankey_shallow_mid__${id}__${i}`;
            toAdd.push({ from: prev, to: next, weight: SYNTHETIC_LINK_WEIGHT });
            prev = next;
        }
    });
    return toAdd.length ? list.concat(toAdd) : list;
}

/**
 * Drops self-loops, normalizes None, merges edges, then:
 * 1) Split long skip-links into single-column hops.
 * 2) Forward-pads dangling nodes to `Others_col_*`.
 * 3) Backward missing-parent fixes.
 * 4) Ladders for sparse roots that never reach the last column (replaces single-edge shallow fix).
 */
function expandSankeyWithOthersGaps(preFilteredEdges, expectedLevels) {
    const expected = Number(expectedLevels);

    let list = preFilteredEdges
        .filter((e) => e?.from != null && e?.to != null && e.from !== '' && e.to !== '')
        .map((e) => {
            let from = e.from;
            let to = e.to;
            const w = e?.weight ?? e?.value ?? 0;
            const fromS = String(from).trim();
            const toS = String(to).trim();
            if (
                fromS === 'Mac OS' &&
                toS === 'Mac OS' &&
                from === to &&
                Number.isFinite(expected) &&
                expected >= 3
            ) {
                to = othersColName(Math.max(0, expected - 2));
            }
            if (
                fromS === 'MacOS' &&
                toS === 'MacOS' &&
                from === to &&
                Number.isFinite(expected) &&
                expected >= 3
            ) {
                to = othersColName(Math.max(0, expected - 2));
            }
            return { from, to, weight: w };
        })
        .filter((e) => e.from !== e.to);

    list = preprocessPathAnalyserEdges(list);
    list = mergeEdgesByFromTo(list);
    list = filterInvalidOthersShortcutEdges(list);
    list = splitSkipLinksInGraph(list);
    const hasExpected = Number.isFinite(expected) && expected >= 2;
    const targetMaxLevelIndex = hasExpected ? expected - 1 : null;
    const MAX_ROUNDS = 30;

    // Forward-pad dangling branches FIRST. If shallow runs before this, roots like "United States"
    // stop at Mac OS (no OS→version edge yet) and get `Others_col_0 → United States`, which bumps
    // the country node to level 1 and draws it under "State".
    if (hasExpected && targetMaxLevelIndex != null) {
        const fwdKeys = new Set();
        const minSyntheticForwardCol = Math.max(0, targetMaxLevelIndex - 1);
        for (let round = 0; round < MAX_ROUNDS; round += 1) {
            if (list.length === 0) break;
            const nodeLevel = computeNodeLevelsFromEdges(list);
            const allNodes = collectNodes(list);
            const toAdd = [];
            for (const n of allNodes) {
                const L = nodeLevel.get(n);
                if (L == null || L >= targetMaxLevelIndex) continue;
                if (isSyntheticOthersName(n)) {
                    const col = parseOthersColIndex(n);
                    if (col == null || col < minSyntheticForwardCol) continue;
                }
                const hasValidOut = list.some((e) => {
                    if (e.from !== n) return false;
                    const tLevel = nodeLevel.get(e.to);
                    return countsAsValidForwardSankeyStep(n, e.to, L, tLevel);
                });
                if (hasValidOut) continue;
                const dest = othersColName(L + 1);
                const key = `fwd\0${n}\0${dest}`;
                if (fwdKeys.has(key)) continue;
                fwdKeys.add(key);
                toAdd.push({ from: n, to: dest, weight: SYNTHETIC_LINK_WEIGHT });
            }
            if (toAdd.length === 0) break;
            list = list.concat(toAdd);
        }
    }

    const addedKeys = new Set();
    for (let round = 0; round < MAX_ROUNDS; round += 1) {
        if (list.length === 0) break;

        const nodeLevel = computeNodeLevelsFromEdges(list);
        const allNodes = collectNodes(list);
        const toAdd = [];

        for (const v of allNodes) {
            if (isSyntheticOthersName(v) || isInternalSkipStepName(v) || isShallowLadderName(v)) continue;
            const L = nodeLevel.get(v);
            if (L == null || L < 1) continue;
            const hasParent = list.some((e) => e.to === v && nodeLevel.get(e.from) === L - 1);
            if (hasParent) continue;
            const parentName = othersColName(L - 1);
            const key = `back\0${parentName}\0${v}`;
            if (addedKeys.has(key)) continue;
            addedKeys.add(key);
            toAdd.push({ from: parentName, to: v, weight: SYNTHETIC_LINK_WEIGHT });
        }

        if (toAdd.length === 0) break;
        list = list.concat(toAdd);
    }

    list = mergeEdgesByFromTo(list);
    list = addShallowRootLadders(list, expected);
    list = mergeEdgesByFromTo(list);

    return list;
}

const sankeyChartOptions = ({ ...args }) => {
    const { colors: inputColors = [], data = [] } = args;
    const defaultColors = [
        ch_color1,
        ch_color2,
        ch_color3,
        ch_color4,
        ch_color5,
        ch_color6,
        ch_color7,
        ch_color8,
        ch_color9,
    ];
    const appliedColors = inputColors?.length > 0 ? inputColors : defaultColors;

    const seriesData = args?.series ?? [];

    const preFiltered = (Array.isArray(seriesData) ? seriesData : []).filter(
        (item) => item?.from != null && item?.to != null && item?.from !== '' && item?.to !== '',
    );
    const rawEdges = expandSankeyWithOthersGaps(preFiltered, args?.expectedLevels);

    const nodeLevel = computeNodeLevelsFromEdges(rawEdges);

    const getNodeId = (name, level) => `${name}__lvl_${level}`;
    const getNodeLabel = (id) => {
        const base = String(id).replace(/__lvl_\d+$/, '');
        if (isSyntheticOthersName(base)) return OTHERS_DISPLAY;
        if (String(base).trim() === 'None') return OTHERS_DISPLAY;
        if (isInternalSkipStepName(base)) return '';
        if (isShallowLadderName(base)) return '';
        return base;
    };

    /** Tooltips and visible labels must never be empty (Highcharts shows a bare "→" otherwise). */
    const getSankeyUiLabel = (nodeId) => {
        const label = getNodeLabel(nodeId);
        return label === '' || label == null ? OTHERS_DISPLAY : label;
    };

    const transformedSeries = rawEdges.map((item) => {
        const fromLevel = nodeLevel.has(item.from) ? nodeLevel.get(item.from) : 0;
        const toLevel = nodeLevel.has(item.to) ? nodeLevel.get(item.to) : fromLevel + 1;
        return {
            from: getNodeId(item.from, fromLevel),
            to: getNodeId(item.to, toLevel),
            weight: item?.weight ?? item?.value,
            fromLabel: item.from,
            toLabel: item.to,
        };
    });

    const allNodeIds = new Set();
    transformedSeries.forEach((item) => {
        allNodeIds.add(item.from);
        allNodeIds.add(item.to);
    });
    const parseNodeLevel = (nodeId) => {
        const match = String(nodeId).match(/__lvl_(\d+)$/);
        return match ? Number(match[1]) : 0;
    };

    const fromNodes = new Set(transformedSeries.map((item) => item.from));
    const toNodes = new Set(transformedSeries.map((item) => item.to));
    const rawBaseFromNodeId = (nodeId) => String(nodeId).replace(/__lvl_\d+$/, '');
    const terminalNodes = [...toNodes]?.filter((node) => !fromNodes?.has(node));
    const terminalLevels = terminalNodes.map((nodeId) => Number(nodeLevel.get(rawBaseFromNodeId(nodeId)) ?? 0));
    const lastTerminalLevel = terminalLevels.length > 0 ? Math.max(...terminalLevels) : 0;
    const rightAlignedTerminalNodes = terminalNodes.filter(
        (nodeId) => Number(nodeLevel.get(rawBaseFromNodeId(nodeId)) ?? 0) === lastTerminalLevel,
    );
    const rightAlignedNodeSet = new Set(rightAlignedTerminalNodes);
    const nodesWithColumns = [...allNodeIds].map((nodeId) => ({
        id: nodeId,
        column: parseNodeLevel(nodeId),
        ...(rightAlignedNodeSet.has(nodeId)
            ? {
                  dataLabels: {
                      x: -15,
                      align: 'right',
                  },
              }
            : {}),
    }));

    return {
        chart: {
            type: 'area',
            height: args?.height ?? 310,
            className: 'sankey-last-col-finder',
        },
        title: {
            text: '',
        },
        credits: {
            enabled: false,
        },
        accessibility: {
            point: {
                valueDescriptionFormat: '{index}. {point.from} to {point.to}, {point.weight}.',
            },
        },
        tooltip: {
            headerFormat: '',
            shared: false,
        },
        plotOptions: {
            sankey: {
                nodeWidth: 17,
                nodePadding: 18,
                minLinkWidth: 2,
                nodeDistance: 35,
                dataLabels: {
                    enabled: true,
                    color: '#000000',
                    align: 'left',
                    // shadow: true,
                    x: 22,
                    animation: {
                        defer: 2000,
                    },
                    style: {
                        // textShadow: false,
                        textOutline: false,
                        fontWeight: 'normal',
                        fontFamily: primaryFont,
                        fontSize: rsFontxs,
                        width: '140px',
                        textOverflow: 'ellipsis',
                    },
                    nodeFormatter: function () {
                        const nodeId = this.point.name;
                        const name = getSankeyUiLabel(nodeId);
                        const isTerminalNode = rightAlignedTerminalNodes?.includes(nodeId);
                        const maxLen = isTerminalNode ? 40 : 40;
                        const displayName = name.length > maxLen ? name.substring(0, maxLen) + '\u2026' : name;
                        const esc = String(name).replace(/"/g, '&quot;');
                        return '<span style="font-weight: normal;" title="' + esc + '">' + displayName + '</span>';
                    },
                },
                states: {
                    inactive: { opacity: 1 },
                    hover: { opacity: 1, enabled: true },
                },
                tooltip: {
                    nodeFormatter: function () {
                        const label = getSankeyUiLabel(this.name);
                        return `${label}: <b>${formatSankeyWeight(this.sum)}</b>`;
                    },
                    pointFormatter: function () {
                        const fromLabel = getSankeyUiLabel(this.fromNode?.name);
                        const toLabel = getSankeyUiLabel(this.toNode?.name);
                        return `${fromLabel} \u2192 ${toLabel}: <b>${formatSankeyWeight(this.weight)}</b>`;
                    },
                },
            },
        },
        series: [
            {
                stacking: 'normal',
                borderWidth: 0,
                keys: ['from', 'to', 'weight', 'tooltip'],
                data: transformedSeries.map((item) => {
                    return {
                        from: item.from,
                        to: item.to,
                        weight: item.weight,
                    };
                }),
                type: 'sankey',
                name: '',
                colors: appliedColors,
                nodes: nodesWithColumns,
            },
        ],
        credits: { enabled: false },
    };
};
export default sankeyChartOptions;

sankeyChartOptions.propTypes = {
    colors: PropTypes.array,
    data: PropTypes.array.isRequired,
};
