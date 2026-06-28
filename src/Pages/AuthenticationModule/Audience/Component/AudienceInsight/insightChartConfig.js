import { getUserDateTimeFormat, standardizeDateFormat } from 'Utils/modules/dateTime';
import { INSIGHT_CLOCK_RANK_COLORS } from 'Pages/AuthenticationModule/Audience/audienceChartColors';
import moment from 'moment';
export const INSIGHT_CHART_TYPE_MAP = {
    'column chart': 'column',
    'heatmap': 'heatmap',
    'gantt chart': 'gantt',
    'histogram': 'column',
    'donut chart': 'donut',
    'sunburst chart': 'sunburst',
    'waterfall chart': 'waterfall',
    'box plot': 'boxplot',
    'stacked bar chart': 'stackedbar',
    'gauge chart': 'gauge',
    'scatter plot': 'scatter',
    'treemap': 'treemap',
    'pie chart': 'pie',
    'bar chart': 'bar',
    'funnel chart': 'funnel',
    'line chart': 'line',
    'sankey diagram': 'sankey',
    'bubble chart': 'bubble',
    'radar chart': 'radar',
    'area chart': 'area',
    'pyramid chart': 'pyramid',
    'pyramid': 'pyramid',
};

/** Internal chart keys used by InsightChartPortlet / Constants/Charts builders. */
export const INSIGHT_INTERNAL_CHART_TYPES = new Set([
    'column',
    'heatmap',
    'gantt',
    'donut',
    'sunburst',
    'waterfall',
    'boxplot',
    'stackedbar',
    'gauge',
    'scatter',
    'treemap',
    'pie',
    'bar',
    'funnel',
    'line',
    'sankey',
    'bubble',
    'radar',
    'area',
    'pyramid',
]);

/** Map API charttype label (or internal key) to portlet chart key — no column/data overrides. */
export const getInsightChartType = (charttype) => {
    const normalized = (charttype || '').trim().toLowerCase();
    if (INSIGHT_CHART_TYPE_MAP[normalized]) return INSIGHT_CHART_TYPE_MAP[normalized];
    if (INSIGHT_INTERNAL_CHART_TYPES.has(normalized)) return normalized;
    return 'pie';
};

/** True when column name refers to a day dimension (e.g. Day, Day wise, Day Wise). */
export const isDayRelatedColumn = (column) => {
    const text = String(column || '').toLowerCase();
    return /\bday\b/.test(text) || /\bday[-\s]?wise\b/.test(text);
};

/** Normalize column for case-insensitive comparisons (trim, lowercase, single spaces). */
export const normalizeInsightColumn = (column) =>
    String(column || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');

/**
 * Override API charttype based on column name.
 * - `fromApiTypes`: only apply when API already resolved to these types (e.g. pyramid → funnel)
 * - `columns`: exact strings (after normalize), RegExp, or `(normalized) => boolean`
 */
export const INSIGHT_COLUMN_CHART_OVERRIDES = [
    {
        chartType: 'funnel',
        fromApiTypes: ['pyramid'],
        columns: ['data storage', 'storage'],
    },
];

const columnMatchesOverride = (normalizedColumn, columns = []) =>
    columns.some((matcher) => {
        if (typeof matcher === 'function') return matcher(normalizedColumn);
        if (matcher instanceof RegExp) return matcher.test(normalizedColumn);
        return normalizedColumn === normalizeInsightColumn(matcher);
    });

/** First matching override for this column + resolved API chart type, or null. */
export const getColumnChartOverride = (resolvedChartType, column) => {
    const normalized = normalizeInsightColumn(column);
    for (const rule of INSIGHT_COLUMN_CHART_OVERRIDES) {
        if (rule.fromApiTypes?.length && !rule.fromApiTypes.includes(resolvedChartType)) {
            continue;
        }
        if (columnMatchesOverride(normalized, rule.columns)) {
            return rule.chartType;
        }
    }
    return null;
};

const INSIGHT_DATE_PARSE_FORMATS = [
    'YYYY-MM-DD',
    'YYYY/MM/DD',
    'DD-MM-YYYY',
    'DD/MM/YYYY',
    'MM-DD-YYYY',
    'MM/DD/YYYY',
    'MMM DD, YYYY',
    'MMM DD YYYY',
    'DD MMM YYYY',
];

/** True when label is a time value (e.g. 14:30, 2:30 PM, 09:00:00). */
export const isTimeFormatLabel = (label) => {
    const text = String(label ?? '').trim();
    if (!text) return false;
    return (
        /^\d{1,2}:\d{2}(:\d{2})?\s*(AM|PM)?$/i.test(text) ||
        /^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(text)
    );
};

const ISO_DATE_LABEL_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/** True when column name refers to a date dimension (e.g. Date, Created date). */
export const isDateRelatedColumn = (column) => {
    const text = normalizeInsightColumn(column);
    return text === 'date' || /\bdate\b/.test(text);
};

/** True when label is a date (not time-only), parseable from API formats. */
export const isDateFormatLabel = (label) => {
    const text = String(label ?? '').trim();
    if (!text || isTimeFormatLabel(text)) return false;
    if (ISO_DATE_LABEL_REGEX.test(text)) return true;
    if (standardizeDateFormat(text)) return true;
    return moment(text, INSIGHT_DATE_PARSE_FORMATS, true).isValid();
};

/** Bucket labels allowed alongside time labels (e.g. Others) for gauge charts. */
const INSIGHT_BUCKET_LABEL_REGEX = /^(others?|unknown|n\/a|na|none|null|undefined|-)$/i;

export const isInsightBucketLabel = (label) => INSIGHT_BUCKET_LABEL_REGEX.test(String(label ?? '').trim());

/** True when at least one value label is a time. */
export const insightValuesHasTimeLabels = (values) =>
    (values || []).some((v) => isTimeFormatLabel(v?.label));

/** Time labels mixed only with bucket labels (e.g. 03:12, 16:35, Others). */
export const insightValuesHasTimeAndBuckets = (values) => {
    const labels = (values || []).map((v) => String(v?.label ?? '').trim()).filter(Boolean);
    if (!labels.length || !labels.some(isTimeFormatLabel)) return false;
    return labels.every((label) => isTimeFormatLabel(label) || isInsightBucketLabel(label));
};

/** When all value labels share the same kind: time → gauge clock; date → format labels for display. */
export const insightValuesLabelKind = (values) => {
    const labels = (values || []).map((v) => String(v?.label ?? '').trim()).filter(Boolean);
    if (!labels.length) return null;
    if (labels.every(isTimeFormatLabel)) return 'time';
    if (insightValuesHasTimeAndBuckets(values)) return 'time';
    if (labels.every(isDateFormatLabel)) return 'date';
    return null;
};

/** Resolve to gauge when column or labels indicate time (supports mixed time + Others). */
export const shouldResolveToInsightGauge = (column, values) =>
    isHourOrTimeRelatedColumn(column) ||
    insightValuesLabelKind(values) === 'time' ||
    insightValuesHasTimeAndBuckets(values);

/** Format a date label using the user's configured date format (e.g. May 25, 2026). */
export const formatInsightDateLabel = (label) => {
    const text = String(label ?? '').trim();
    if (!text || isTimeFormatLabel(text) || !isDateFormatLabel(text)) return text;

    const parsed = ISO_DATE_LABEL_REGEX.test(text)
        ? moment(text, 'YYYY-MM-DD', true)
        : (() => {
              const standardized = standardizeDateFormat(text);
              return standardized
                  ? moment(standardized, 'YYYY-MM-DD', true)
                  : moment(text, INSIGHT_DATE_PARSE_FORMATS, true);
          })();

    if (!parsed.isValid()) return text;
    // 'date' uses configured format only (e.g. May 25, 2026); 'formatDate' adds weekday prefix (Mon, Tue, …)
    const formatted = getUserDateTimeFormat(parsed.toDate(), 'date');
    return formatted || text;
};

/** Format date-like labels individually (supports mixed labels e.g. dates + "Others"). */
export const normalizeInsightValues = (values, column) => {
    if (!Array.isArray(values)) return values;

    const shouldFormatDates =
        isDateRelatedColumn(column) || values.some((v) => isDateFormatLabel(v?.label));

    if (!shouldFormatDates) return values;

    return values.map((v) => {
        const formatted = formatInsightDateLabel(v?.label);
        if (formatted === v?.label) return v;
        return { ...v, label: formatted };
    });
};

/** True when column name refers to hour/time (e.g. Hour, Hour wise, Time wise). */
export const isHourOrTimeRelatedColumn = (column) => {
    const text = String(column || '').toLowerCase();
    return (
        /\bhour\b/.test(text) ||
        /\bhour[-\s]?wise\b/.test(text) ||
        /\btime\b/.test(text) ||
        /\btime[-\s]?wise\b/.test(text)
    );
};

/** Parse hour (0–24) from a time label (e.g. "03:12" → 3). */
export const parseHourFromInsightLabel = (label) => {
    const timeMatch = String(label ?? '').match(/(\d{1,2}):(\d{2})/);
    if (!timeMatch) return null;
    return Math.min(24, Math.max(0, Number(timeMatch[1])));
};

/** Parse hour (0–24) from first time label for clock gauge needle (skips Others, etc.). */
export const getClockGaugeHourValue = (values, pct = 0) => {
    if (Array.isArray(values) && values.length) {
        for (const v of values) {
            const hour = parseHourFromInsightLabel(v?.label);
            if (hour != null) return hour;
        }
    }
    return Math.min(24, Math.max(0, (Number(pct) / 100) * 24));
};

/**
 * Build gaugeChartOptions args (series plotBands + dial data) like FormatgetByHoursMobile.
 * Gray ring + green segments require `series`; dial uses `data: [hour, hour + 1]`.
 */
export const buildInsightClockGaugeArgs = (values, height = 325) => {
    const hourItems = (values || [])
        .map((v) => ({
            hour: parseHourFromInsightLabel(v?.label),
            count: Number(v?.count ?? 0),
        }))
        .filter((item) => item.hour != null);

    const fallbackHour = getClockGaugeHourValue(values, 0);
    const baseSeries = [{ from: 0, to: 24, color: '#e8e8ea', outerRadius: '105%', thickness: '5%' }];

    if (!hourItems.length) {
        return { height, series: baseSeries, data: [fallbackHour, fallbackHour + 1] };
    }

    const maxCount = Math.max(...hourItems.map((item) => item.count));
    const maxHour = (hourItems.find((item) => item.count === maxCount) || hourItems[0]).hour;
    const sortedData = [...hourItems].sort((a, b) => b.count - a.count);
    const uniqueCounts = [...new Set(sortedData.map((item) => item.count))].sort((a, b) => b - a);

    const series = [
        ...baseSeries,
        ...hourItems.map((item) => {
            const rank = uniqueCounts.indexOf(item.count);
            const color =
                rank < INSIGHT_CLOCK_RANK_COLORS.length - 1
                    ? INSIGHT_CLOCK_RANK_COLORS[rank]
                    : INSIGHT_CLOCK_RANK_COLORS[INSIGHT_CLOCK_RANK_COLORS.length - 1];
            return {
                from: item.hour,
                to: item.hour + 1,
                color,
                outerRadius: '105%',
                thickness: '5%',
            };
        }),
    ];

    return { height, series, data: [maxHour, maxHour + 1] };
};

/** @deprecated Use getInsightChartType(charttype) — API charttype is authoritative. */
export const resolveInsightChartType = (charttype) => getInsightChartType(charttype);

/** Use clock gauge (gaugeChartOptions) for hour/time columns or time (+ bucket) labels. */
export const shouldUseClockGauge = (column, values) => shouldResolveToInsightGauge(column, values);
