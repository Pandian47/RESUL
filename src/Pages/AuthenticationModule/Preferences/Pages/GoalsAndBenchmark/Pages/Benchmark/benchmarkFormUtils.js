export const isBenchmarkStartRangePlaceholder = (row) => {
    const sr = row?.startRange;
    if (sr === null || sr === undefined) return true;
    if (typeof sr === 'string' && sr.trim() === '') return true;
    const n = Number.parseFloat(sr);
    if (!Number.isFinite(n)) return true;
    return n === 0;
};

export const resolveBenchmarkCellValue = (row, index, channelKey, baselineByChannel) => {
    const raw = row?.startRange;
    const n = Number.parseFloat(raw);
    if (Number.isFinite(n) && n !== 0) {
        return n;
    }
    const fromRow =
        row?.defaultStartRange ??
        row?.defaultStartRangeValue ??
        (() => {
            const dk = Object.keys(row || {}).find((k) => /^default/i.test(k));
            return dk ? row[dk] : null;
        })();
    const dn = Number.parseFloat(fromRow);
    if (Number.isFinite(dn)) {
        return dn;
    }
    const b = baselineByChannel?.[channelKey]?.[index];
    return Number.isFinite(b) ? b : null;
};

/** Mirrors RenderBenchmark RSInput rules (required, 0.1–99) for all channels before RHF trigger. */
export const findFirstInvalidBenchmarkChannel = (orderedKeys, getValues) => {
    for (const key of orderedKeys || []) {
        const rows = getValues(key);
        if (!Array.isArray(rows) || rows.length < 3) continue;
        for (let i = 0; i < 3; i++) {
            const raw = rows?.[i]?.startRange;
            if (raw === undefined || raw === null || (typeof raw === 'string' && raw.trim() === '')) {
                return { key, i };
            }
            const n = Number(raw);
            if (!Number.isFinite(n)) {
                return { key, i };
            }
            if (n < 0.1 || n > 99) {
                return { key, i };
            }
        }
    }
    return null;
};

export const findFirstBenchmarkErrorInFormState = (errs, orderedKeys) => {
    if (!errs || typeof errs !== 'object') return null;
    const hasErr = (se) =>
        se &&
        (typeof se.message === 'string' ||
            se.type === 'required' ||
            se.type === 'validate' ||
            se.type === 'manual' ||
            se.type === 'custom');
    for (const key of orderedKeys || []) {
        const block = errs[key];
        if (!block) continue;
        const arr = Array.isArray(block) ? block : [block];
        for (let i = 0; i < 3; i++) {
            const cell = arr[i];
            if (hasErr(cell?.startRange)) {
                return { key, i };
            }
        }
    }
    return null;
};

export const channelHasBenchmarkRows = (channelKey, getValues) => {
    if (!channelKey) return false;
    const rows = getValues(channelKey);
    return Array.isArray(rows) && rows.length >= 3;
};

/** Aligns with baseline snapshot logic in handleFormUpdate (2 decimal places). */
export const normalizeBenchmarkStartRangeValue = (val) => {
    const n = Number.parseFloat(val);
    return Number.isFinite(n) ? Number(n.toFixed(2)) : null;
};

/**
 * Compare current form values for one channel vs baseline (saved snapshot).
 * @param {string} key - Channel form key (e.g. Email, Mobile)
 * @param {Record<string, number[]|null[]>} baseline - baselineRangesRef shape
 * @param {() => unknown} getValues - react-hook-form getValues
 */
export const compareChannelToBaseline = (key, baseline, getValues) => {
    const baseArr = baseline?.[key] || [];
    const curArr = getValues(key) || [];
    for (let i = 0; i < 3; i++) {
        const b = baseArr?.[i] ?? null;
        const c = normalizeBenchmarkStartRangeValue(curArr?.[i]?.startRange);
        if (c === null) {
            if (b !== null) return true;
            continue;
        }
        if (b === null) return true;
        if (b !== c) return true;
    }
    return false;
};

export const hasAnyBenchmarkChannelChanges = (listName, baseline, getValues) => {
    for (const key of listName || []) {
        if (compareChannelToBaseline(key, baseline, getValues)) return true;
    }
    return false;
};

const hasNonEmptyValue = (v) => v !== null && v !== undefined && String(v).trim() !== '';

/**
 * API may return more than 3 rows per channel (e.g. duplicate metricsId groups).
 * Collapse to 3 rows for the form: reach, engagement, conversion — first row per ReferenceColumn type.
 */
export const collapseBenchmarkChannelRowsToUiRows = (rows) => {
    const list = Array.isArray(rows) ? rows.filter(Boolean) : [];
    if (list.length <= 3) {
        return list;
    }

    const refOf = (r) => String(r?.ReferenceColumn || '');
    const pick = (predicate) => list.find((r) => predicate(refOf(r)));

    const reach = pick((ref) => /reach/i.test(ref) && !/conversion/i.test(ref));
    const engagement = pick((ref) => /interaction|engagement/i.test(ref));
    const conversion = pick((ref) => /conversion/i.test(ref));

    if (reach && engagement && conversion) {
        return [reach, engagement, conversion];
    }
    return list.slice(0, 3);
};

/**
 * Industry benchmark labels: exactly 3 values from the full API row list.
 * Uses default{Channel}Reach | default{Channel}Engagement | default{Channel}Conversion
 * (first row where each key is set). Falls back to ReferenceColumn grouping + default* on that row.
 */
export const buildIndustryRangeTripleForChannel = (channelKey, rawRows) => {
    const list = Array.isArray(rawRows) ? rawRows.filter(Boolean) : [];
    const ch = String(channelKey || '');
    const metricKeys = [
        `default${ch}Reach`,
        `default${ch}Engagement`,
        `default${ch}Conversion`,
    ];
    const refTests = [
        (ref) => /reach/i.test(ref) && !/conversion/i.test(ref),
        (ref) => /interaction|engagement/i.test(ref),
        (ref) => /conversion/i.test(ref),
    ];

    const valueFromRowForMetric = (row, key) => {
        if (!row) return undefined;
        if (hasNonEmptyValue(row[key])) {
            return row[key];
        }
        const dk = Object.keys(row).find(
            (k) => /^default/i.test(k) && !/startRange/i.test(k) && hasNonEmptyValue(row[k]),
        );
        return dk ? row[dk] : undefined;
    };

    return [0, 1, 2].map((i) => {
        const key = metricKeys[i];
        let row = list.find((r) => r && hasNonEmptyValue(r[key]));
        if (!row) {
            const test = refTests[i];
            row = list.find((r) => test(String(r?.ReferenceColumn || '')));
        }
        const v = valueFromRowForMetric(row, key);
        return { range: v };
    });
};

/**
 * Maps API benchmark payload into form `overviewList` + baseline numbers for dirty-checking.
 */
export const buildOverviewAndBaselineFromBenchmarkResponse = (benchmarkValue) => {
    const listValue = Object.keys(benchmarkValue || {}).filter((key) => Array.isArray(benchmarkValue[key]));
    const overviewList = {};
    const baseline = {};
    listValue?.forEach((res) => {
        const apiRows = benchmarkValue[res] || [];
        const rowsForForm = collapseBenchmarkChannelRowsToUiRows(apiRows);
        const normalizedRows = rowsForForm.map((row) => {
            if (!isBenchmarkStartRangePlaceholder(row)) {
                return row;
            }
            const defaultStartRange = row?.defaultStartRange ?? row?.defaultStartRangeValue;
            if (defaultStartRange !== null && defaultStartRange !== undefined) {
                return { ...row, startRange: defaultStartRange };
            }
            const defaultKey = Object.keys(row || {}).find((k) => /^default/i.test(k));
            const defaultVal = defaultKey ? row?.[defaultKey] : null;
            return defaultVal !== null && defaultVal !== undefined ? { ...row, startRange: defaultVal } : row;
        });
        overviewList[res] = [...normalizedRows, { channelName: res }];
        overviewList[`${res}Range`] = buildIndustryRangeTripleForChannel(res, apiRows);
        baseline[res] = (normalizedRows || []).slice(0, 3).map((it) => {
            const v = it?.startRange ?? it?.defaultStartRange ?? it?.defaultStartRangeValue ?? it?.defaultValue;
            const n = Number.parseFloat(v);
            return Number.isFinite(n) ? Number(n.toFixed(2)) : null;
        });
    });
    return { overviewList, baseline };
};

export const resolveBenchmarkOverviewFields = (benchmarkValue) => ({
    resolvedBenchMarkName:
        benchmarkValue?.benchMarkName ??
        benchmarkValue?.BenchMarkName ??
        benchmarkValue?.benchMarkname ??
        '',
    resolvedBenchmarkDesc:
        benchmarkValue?.benchmarkDesc ??
        benchmarkValue?.benchMarkDesc ??
        benchmarkValue?.BenchMarkDesc ??
        '',
});

/** Walks RHF errors depth-first; focuses and scrolls to the first field with a message. */
export const scrollToFirstBenchmarkFormError = (errs, setFocus, path = '') => {
    if (!errs || typeof errs !== 'object') return false;
    for (const k of Object.keys(errs)) {
        const p = path ? `${path}.${k}` : k;
        if (errs[k]?.message) {
            setFocus(p);
            const nameAttr = p.replace(/\.(\d+)/g, (_, n) => `[${n}]`);
            const el = document.querySelector(`[name="${nameAttr}"]`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => window.scrollBy({ top: -100, behavior: 'smooth' }), 300);
            return true;
        }
        if (Array.isArray(errs[k])) {
            for (let i = 0; i < errs[k].length; i++) {
                if (scrollToFirstBenchmarkFormError(errs[k][i], setFocus, `${p}.${i}`)) return true;
            }
        } else if (scrollToFirstBenchmarkFormError(errs[k], setFocus, p)) return true;
    }
    return false;
};
