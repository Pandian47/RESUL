import { formatNumber } from 'Utils/modules/campaignUtils';
import RSHighchartsContainer from 'Components/Highcharts';
import { areaChartOptions, areasplineChartOptions, barChartOptions, bubbleChartOptions, columnChartOptions, funnelChartOptions, gaugeChartOptions, gaugeChartOptionsNormal, pieChartOptions, pyramidChartOptions, radarChartOptions, sankeyChartOptions } from 'Constants/Charts';
import {
    buildInsightClockGaugeArgs,
    getInsightChartType,
    normalizeInsightValues,
    shouldUseClockGauge,
} from './insightChartConfig';
import { getAudienceInsightPalette } from 'Pages/AuthenticationModule/Audience/audienceChartColors';
import './InsightChartPortlet.scss';

const formatColumnTitle = (column) => `${column?.slice(0, 1)?.toUpperCase() || ''}${column?.slice(1) || ''}`;

const FALLBACK_COLORS = [
    '#f56701',
    '#99cc03',
    '#4caaf4',
    '#fcb040',
    '#33cc99',
    '#8f5dd9',
    '#ed6f9f',
    '#5bc0de',
    '#7e8a97',
];

const getInsightColors = (values) => {
    const palette = getAudienceInsightPalette(values || []);
    return palette?.length ? palette : FALLBACK_COLORS;
};

const getColorByPalette = (palette, i) => palette[i % palette.length];
const INSIGHT_RANGE_LABEL_REGEX = /^\s*(-?\d+(?:\.\d+)?)\s*-\s*(-?\d+(?:\.\d+)?)\s*$/;
const INSIGHT_NUMERIC_LABEL_REGEX = /^-?\d+(?:\.\d+)?$/;

const formatInsightLabel = (label) => {
    const text = String(label ?? '').trim();
    if (!text) return '';

    const rangeMatch = text.match(INSIGHT_RANGE_LABEL_REGEX);
    if (rangeMatch) {
        return `${formatNumber(Number(rangeMatch[1]))}-${formatNumber(Number(rangeMatch[2]))}`;
    }

    if (INSIGHT_NUMERIC_LABEL_REGEX.test(text)) {
        return formatNumber(Number(text));
    }

    return text;
};

const buildSeriesPoints = (values, palette, usePercentage = true) =>
    values.map((v, i) => ({
        y: usePercentage ? (v?.percentage ?? 0) : (v?.count ?? 0),
        count: v?.count ?? 0,
        pct: v?.percentage ?? 0,
        name: formatInsightLabel(v?.label),
        color: getColorByPalette(palette, i),
    }));

/** True when values represent a percentage distribution (y-axis should show %). */
const insightUsesPercentageAxis = (values) => {
    if (!values?.length) return false;

    const percentages = values.map((v) => Number(v?.percentage ?? NaN));
    if (percentages.some((n) => Number.isNaN(n))) return false;

    const pctSum = percentages.reduce((a, b) => a + b, 0);

    if (values.length > 1) {
        return pctSum >= 99 && pctSum <= 101;
    }

    const count = Number(values[0]?.count);
    const pct = percentages[0];
    if (!Number.isNaN(count) && count > 0 && pct >= 99 && pct <= 101 && count !== pct) {
        return false;
    }

    return pct <= 100;
};

/** Percentage axis max from data with headroom (not a fixed 0–20 scale). */
const insightPercentageAxisMax = (values) => {
    const maxY = Math.max(0, ...(values || []).map((v) => Number(v?.percentage) || 0));
    if (maxY <= 0) return 10;
    if (maxY <= 0.1) return 0.1;
    if (maxY <= 1) return 1;
    const headroom = Math.ceil(maxY * 1.2);
    const rounded = maxY < 10 ? Math.max(headroom, maxY + 1) : Math.ceil(headroom / 10) * 10;
    return Math.min(Math.max(rounded, headroom), 100);
};

/** Y-axis max with headroom above highest value (e.g. 2,4,8,10 → 12; 1,2,4 → 5). */
const insightValueAxisMax = (values, usePercentage) => {
    if (usePercentage) return insightPercentageAxisMax(values);
    const maxY = Math.max(0, ...(values || []).map((v) => Number(v?.count) || 0));
    if (maxY <= 0) return 1;
    const headroom = Math.ceil(maxY * 1.2);
    return Math.max(headroom, maxY + 1);
};

const INSIGHT_CHART_WIDTH = '532';

/** Portaled Highcharts tooltips must sit above RSModal (Bootstrap ~1055). */
const INSIGHT_CHART_TOOLTIP_Z_INDEX = 10010;

/** Audience insight tooltips — name on top, divider, then Count row (matches pie/donut reference). */
const formatInsightTooltipHtml = ({ name, count, color }) => {
    const displayName = String(name ?? '').trim();
    const formattedValue = formatNumber(count ?? 0);
    const pointColor = color ?? '';
    return (
        `<span class="font-xs insight-chart-tooltip">` +
        `<span class="insight-chart-tooltip__name">${displayName}</span>` +
        `<hr class="insight-chart-tooltip__divider" />` +
        `<span class="insight-chart-tooltip__count">` +
        `<span class="font-monospace" style="color:${pointColor}">\u25CF</span>&nbsp;` +
        `<span class="font-xs">Count: </span>` +
        `<span class="font-xs">${formattedValue}</span>` +
        `</span></span>`
    );
};

const insightCountTooltipFormatter = function () {
    const pointKey = String(this.point?.name ?? this.point?.category ?? this.point?.key ?? this.x ?? '');
    const displayValue = this.point?.count != null ? this.point.count : (this.point?.y ?? 0);
    const color = this.point?.color ?? this.color ?? '';
    return formatInsightTooltipHtml({ name: pointKey, count: displayValue, color });
};

const insightBubbleTooltipFormatter = function () {
    const fullName =
        this?.point?.fullName ||
        this?.series?.userOptions?.fullName ||
        this?.series?.name ||
        this?.point?.name ||
        '';
    const pointColor = this?.color || this?.point?.color || this?.series?.color || '';
    const countValue =
        this?.point?.count !== undefined
            ? this?.point?.count
            : this?.series?.userOptions?.count !== undefined
              ? this?.series?.userOptions?.count
              : 0;
    return formatInsightTooltipHtml({ name: fullName, count: countValue, color: pointColor });
};

const insightPieCountTooltip = {
    enabled: true,
    useHTML: true,
    outside: true,
    shared: false,
    followPointer: false,
    backgroundColor: '#111111',
    borderWidth: 0,
    borderRadius: 4,
    shadow: false,
    hideDelay: 0,
    style: {
        zIndex: INSIGHT_CHART_TOOLTIP_Z_INDEX,
        color: '#ffffff',
    },
    formatter: insightCountTooltipFormatter,
};

const insightChartTooltip = (formatter = insightCountTooltipFormatter) => ({
    enabled: true,
    useHTML: true,
    outside: true,
    shared: false,
    followPointer: false,
    backgroundColor: '#111111',
    borderWidth: 0,
    borderRadius: 4,
    shadow: false,
    hideDelay: 0,
    style: {
        zIndex: INSIGHT_CHART_TOOLTIP_Z_INDEX,
        color: '#ffffff',
    },
    formatter,
});

const applyInsightChartLayout = (options) => ({
    ...options,
    chart: {
        ...options.chart,
        width: options.width ?? INSIGHT_CHART_WIDTH,
    },
});

/** Clock gauge keeps dashboard sizing (no forced 532px width). */
const applyInsightClockGaugeLayout = (options) => options;

const resolveInsightValues = (insightData) => {
    const rawValues = Array.isArray(insightData?.values) ? insightData.values : [];
    let normalized = rawValues;

    try {
        const next = normalizeInsightValues(rawValues, insightData?.column);
        normalized = Array.isArray(next) ? next : rawValues;
    } catch {
        normalized = rawValues;
    }

    return normalized
        .filter((v) => v != null && typeof v === 'object')
        .map((v) => ({
            ...v,
            label: formatInsightLabel(v?.label),
        }));
};

const buildInsightOptions = (chartType, insightData) => {
    const rawValues = Array.isArray(insightData?.values) ? insightData.values : [];
    const values = resolveInsightValues(insightData);
    const title = formatColumnTitle(insightData?.column);
    const categories = values.map((v) => v?.label ?? '');
    const palette = getInsightColors(values);
    const seriesPoints = buildSeriesPoints(values, palette);

    const base = { credits: { enabled: false }, title: { text: '' } };
    const pctAxisMax = insightPercentageAxisMax(values);

    switch (chartType) {
        case 'column': {
            const usePctAxis = insightUsesPercentageAxis(values);
            const columnPoints = buildSeriesPoints(values, palette, usePctAxis);
            return applyInsightChartLayout(
                columnChartOptions({
                    categories,
                    colors: palette,
                    series: [{ name: title, data: columnPoints }],
                    xAxis: { title: '' },
                    yAxis: {
                        title: '',
                        showAsPercentage: usePctAxis,
                        max: insightValueAxisMax(values, usePctAxis),
                    },
                    legend: { enabled: false },
                    height: 325,
                    tooltip: { percent: usePctAxis, shared: false, formatter: insightCountTooltipFormatter },
                }),
            );
        }

        case 'bar': {
            const usePctAxis = insightUsesPercentageAxis(values);
            const barData = values.map((v) => (usePctAxis ? (v?.percentage ?? 0) : (v?.count ?? 0)));
            return applyInsightChartLayout(
                barChartOptions({
                    xAxis: { categories, title: '' },
                    yAxis: {
                        title: { text: '' },
                        ...(usePctAxis ? { labelFormat: '{value}%' } : {}),
                        max: insightValueAxisMax(values, usePctAxis),
                    },
                    series: [{ name: title, data: barData }],
                    colors: palette,
                    legend: { enabled: false },
                    stacking: false,
                    tooltip: { percent: usePctAxis, shared: false },
                    height: 325,
                }),
            );
        }

        case 'stackedbar':
            return {
                ...base,
                chart: { type: 'bar', height: '325', width: '532' },
                xAxis: { categories: [title] },
                yAxis: { title: { text: '' }, max: 100, gridLineWidth: 0 },
                plotOptions: {
                    bar: { borderWidth: 0 },
                    series: { stacking: 'percent', borderWidth: 0 },
                },
                series: values.map((v, i) => ({
                    name: v?.label ?? '',
                    data: [{ y: v?.count ?? 0, count: v?.count ?? 0, pct: v?.percentage ?? 0, name: v?.label ?? '' }],
                    color: getColorByPalette(palette, i),
                })),
                legend: { enabled: true },
            };

        case 'donut':
            return applyInsightChartLayout(
                pieChartOptions(
                    {
                        seriesName: title,
                        series: values.map((v, i) => ({
                            name: v?.label ?? '',
                            y: v?.percentage ?? 0,
                            count: v?.count,
                            color: getColorByPalette(palette, i),
                        })),
                        innerSize: '47%',
                        legend: { enabled: true },
                        height: 325,
                        tooltip: insightPieCountTooltip,
                    },
                    false,
                ),
            );

        case 'line': {
            const usePctAxis = insightUsesPercentageAxis(values);
            const lineData = buildSeriesPoints(values, palette, usePctAxis);
            const lineOptions = areasplineChartOptions(
                {
                    type: 'line',
                    categories,
                    series: [{ name: title, data: lineData }],
                    xAxis: { title: '' },
                    yAxis: {
                        title: '',
                        min: 0,
                        max: insightValueAxisMax(values, usePctAxis),
                    },
                    legend: { enabled: false },
                    height: 325,
                    tooltip: { shared: false },
                    stacking: false,
                },
                'Count',
            );
            return applyInsightChartLayout({
                ...lineOptions,
                tooltip: {
                    ...lineOptions.tooltip,
                    shared: false,
                    formatter: insightCountTooltipFormatter,
                },
            });
        }

        case 'funnel': {
            const funnelPairs = values
                .filter((v) => (v?.count ?? 0) > 0)
                .map((v) => [v?.label ?? '', `${formatNumber(v?.count ?? 0)} MB`]);
            const opts = funnelChartOptions(
                {
                    name: title,
                    data: funnelPairs,
                    height: 325,
                },
                null,
            );
            return applyInsightChartLayout(opts);
        }

        case 'bubble': {
            const MIN_BUBBLE_VISIBLE_VALUE = 0.1;
            const bubbleSeries = values
                .map((v) => {
                    const rawPct = Number(v?.percentage ?? 0);
                    if (!Number.isFinite(rawPct) || rawPct <= 0) return null;
                    const roundedPct = Number(rawPct.toFixed(2));
                    return {
                        name: v?.label ?? '',
                        // Avoid 0/near-zero values that bubbleChartOptions renders with transparent shade.
                        value: Math.max(MIN_BUBBLE_VISIBLE_VALUE, roundedPct),
                        count: v?.count ?? 0,
                        pct: roundedPct,
                    };
                })
                .filter(Boolean);
            const opts = bubbleChartOptions({
                height: 325,
                isCustomSeries: true,
                series: bubbleSeries,
            });
            if (opts?.series) {
                opts.series = opts.series.map((s, idx) => {
                    const orig = bubbleSeries[idx];
                    return {
                        ...s,
                        count: orig?.count ?? 0,
                        pct: orig?.pct ?? 0,
                        data: s.data.map((d) => ({
                            ...d,
                            count: orig?.count ?? 0,
                            pct: orig?.pct ?? 0,
                        })),
                    };
                });
            }
            opts.tooltip = {
                ...opts.tooltip,
                ...insightChartTooltip(insightBubbleTooltipFormatter),
            };
            if (opts?.plotOptions?.packedbubble?.states?.hover) {
                opts.plotOptions.packedbubble.states.hover.enabled = true;
            }
            return applyInsightChartLayout(opts);
        }

        case 'scatter':
            return applyInsightChartLayout({
                ...base,
                chart: { type: 'scatter', height: '325', width: '532' },
                xAxis: { categories },
                yAxis: { title: { text: '' }, max: pctAxisMax, gridLineWidth: 0 },
                plotOptions: { scatter: { marker: { radius: 6, symbol: 'circle' } } },
                series: [
                    {
                        name: title,
                        data: values.map((v, i) => ({
                            x: i,
                            y: v?.percentage ?? 0,
                            count: v?.count ?? 0,
                            pct: v?.percentage ?? 0,
                            name: v?.label ?? '',
                            color: getColorByPalette(palette, i),
                        })),
                        colorByPoint: true,
                    },
                ],
                colors: palette,
                legend: { enabled: false },
                tooltip: insightChartTooltip(),
            });

        case 'treemap':
            return applyInsightChartLayout({
                ...base,
                chart: { height: '325', width: '532' },
                series: [
                    {
                        type: 'treemap',
                        layoutAlgorithm: 'squarified',
                        data: values.map((v, i) => ({
                            name: v?.label ?? '',
                            value: v?.count ?? 0,
                            count: v?.count ?? 0,
                            pct: v?.percentage ?? 0,
                            color: getColorByPalette(palette, i),
                        })),
                        dataLabels: {
                            enabled: true,
                            format: '<span style="font-size:12px">{point.name}</span><br/><span style="font-size:11px">{point.pct:.1f}%</span>',
                            style: { fontWeight: 'normal', textOutline: 'none', color: '#ffffff' },
                        },
                    },
                ],
                legend: { enabled: false },
                tooltip: insightChartTooltip(),
            });

        case 'gauge': {
            const column = insightData?.column ?? '';
            const avg = insightData?.avg ?? (values.length ? values[0]?.percentage : 0);
            const max = insightData?.max ?? 100;
            const pct = max > 0 ? (avg / max) * 100 : 0;

            if (shouldUseClockGauge(column, rawValues)) {
                const opts = gaugeChartOptions(buildInsightClockGaugeArgs(values, 325));
                return applyInsightClockGaugeLayout(opts);
            }

            const opts = gaugeChartOptionsNormal({
                height: 325,
                width: 532,
                series: [{ y: Number(pct.toFixed(1)) }],
                max: 100,
            });

            if (opts?.pane && Array.isArray(opts.pane)) {
                opts.pane = opts.pane.map((p, idx) => ({
                    ...p,
                    center: idx === 0 ? ['50%', '85%'] : ['50%', '75%'],
                    size: '140%',
                }));
            }

            return applyInsightChartLayout(opts);
        }

        case 'heatmap': {
            const maxPct = Math.max(...values.map((v) => v?.percentage ?? 0), 1);
            return {
                ...base,
                chart: { type: 'heatmap', height: '325', width: '532' },
                xAxis: { categories, title: { text: '' } },
                yAxis: { categories: [title], title: { text: '' } },
                colorAxis: { min: 0, max: maxPct, minColor: '#e7f2f8', maxColor: getColorByPalette(palette, 0) },
                series: [
                    {
                        type: 'heatmap',
                        data: values.map((v, i) => [i, 0, v?.percentage ?? 0]),
                        dataLabels: {
                            enabled: true,
                            format: '{point.value:.1f}%',
                            style: { fontWeight: 'normal', fontSize: '12px', textOutline: 'none' },
                        },
                    },
                ],
                legend: { enabled: false },
            };
        }

        case 'waterfall':
            return {
                ...base,
                chart: { type: 'waterfall', height: '325', width: '532' },
                xAxis: { categories },
                yAxis: { title: { text: '' }, gridLineWidth: 0 },
                plotOptions: {
                    waterfall: { borderRadius: 2, borderWidth: 0 },
                    series: { borderWidth: 0 },
                },
                series: [
                    {
                        name: title,
                        data: values.map((v, i) => ({
                            name: v?.label ?? '',
                            y: v?.count ?? 0,
                            count: v?.count ?? 0,
                            pct: v?.percentage ?? 0,
                            color: getColorByPalette(palette, i),
                        })),
                        colorByPoint: true,
                    },
                ],
                legend: { enabled: false },
            };

        case 'boxplot': {
            if (insightData?.min == null && insightData?.max == null && insightData?.avg == null) {
                return buildInsightOptions('column', insightData);
            }
            const min = insightData?.min ?? 0;
            const max = insightData?.max ?? 0;
            const avg = insightData?.avg ?? 0;
            const q1 = min + (avg - min) * 0.5;
            const q3 = avg + (max - avg) * 0.5;
            return {
                ...base,
                chart: { type: 'boxplot', height: '325', width: '532' },
                xAxis: { categories: [title] },
                yAxis: { title: { text: '' }, gridLineWidth: 0 },
                series: [
                    {
                        name: title,
                        data: [[min, q1, avg, q3, max]],
                        color: getColorByPalette(palette, 0),
                        fillColor: getColorByPalette(palette, 0) + '33',
                        medianColor: getColorByPalette(palette, 1),
                    },
                ],
                legend: { enabled: false },
            };
        }

        case 'sunburst':
            return {
                ...base,
                chart: { height: '325', width: '532' },
                colors: palette,
                series: [
                    {
                        type: 'sunburst',
                        data: [
                            { id: 'root', parent: '', name: title },
                            ...values.map((v, i) => ({
                                id: `s_${i}`,
                                parent: 'root',
                                name: v?.label ?? '',
                                value: v?.count ?? 0,
                                count: v?.count ?? 0,
                                pct: v?.percentage ?? 0,
                            })),
                        ],
                        allowDrillToNode: true,
                        cursor: 'pointer',
                        borderWidth: 1.5,
                        dataLabels: {
                            format: '{point.name}',
                            rotationMode: 'auto',
                            style: { fontWeight: 'normal', textOutline: 'none', fontSize: '12px' },
                        },
                        levels: [
                            {
                                level: 1,
                                levelIsConstant: false,
                                dataLabels: { enabled: false },
                            },
                            {
                                level: 2,
                                colorByPoint: true,
                                dataLabels: { rotationMode: 'parallel' },
                            },
                        ],
                    },
                ],
                legend: { enabled: false },
            };

        case 'sankey': {
            const sankeySeries = values
                .filter((v) => (v?.count ?? 0) > 0)
                .map((v) => ({ from: title, to: v?.label ?? '', weight: v?.count ?? 0 }));
            return applyInsightChartLayout(
                sankeyChartOptions({
                    height: 325,
                    series: sankeySeries,
                    colors: palette,
                }),
            );
        }

        case 'area':
            return applyInsightChartLayout(
                areaChartOptions({
                    categories,
                    series: [{ name: title, data: seriesPoints, color: getColorByPalette(palette, 0) }],
                    xAxis: { title: '' },
                    yAxis: { title: '', max: pctAxisMax },
                    legend: { enabled: false },
                    height: 325,
                }),
            );

        case 'radar': {
            if (values.length < 3) {
                return buildInsightOptions('column', insightData);
            }
            return applyInsightChartLayout(
                radarChartOptions({
                    categories,
                    series: [{ name: title, data: seriesPoints.map((p) => p.y), color: getColorByPalette(palette, 0) }],
                    height: 325,
                }),
            );
        }

        case 'gantt': {
            const ganttData = values.map((v, i) => ({
                x: 0,
                x2: v?.percentage ?? 0,
                y: i,
                count: v?.count ?? 0,
                pct: v?.percentage ?? 0,
                name: v?.label ?? '',
                color: getColorByPalette(palette, i),
            }));
            return {
                ...base,
                chart: { type: 'xrange', height: '325', width: '532' },
                xAxis: {
                    min: 0,
                    max: pctAxisMax,
                    title: { text: '' },
                },
                yAxis: {
                    categories,
                    title: { text: '' },
                    reversed: true,
                    gridLineWidth: 0,
                },
                plotOptions: {
                    series: {
                        states: {
                            hover: { enabled: false },
                            inactive: { opacity: 1 },
                        },
                    },
                    xrange: {
                        borderRadius: 3,
                        pointWidth: 27,
                        colorByPoint: true,
                        borderWidth: 0,
                        states: {
                            hover: { enabled: false },
                            inactive: { opacity: 1 },
                        },
                    },
                },
                series: [{ name: title, data: ganttData, borderWidth: 0 }],
                colors: palette,
                legend: { enabled: false },
            };
        }

        case 'pyramid': {
            const usePctAxis = insightUsesPercentageAxis(values);
            const pyramidSeries = values
                .filter((v) => (usePctAxis ? Number(v?.percentage) : Number(v?.count)) > 0)
                .map((v, i) => ({
                    name: v?.label ?? '',
                    y: usePctAxis ? (v?.percentage ?? 0) : (v?.count ?? 0),
                    originalValue: v?.count ?? 0,
                    color: getColorByPalette(palette, i),
                }));
            return applyInsightChartLayout(
                pyramidChartOptions({
                    height: 325,
                    series: pyramidSeries,
                }),
            );
        }

        case 'pie':
        default:
            return applyInsightChartLayout(
                pieChartOptions(
                    {
                        seriesName: title,
                        series: values.map((v, i) => ({
                            name: v?.label ?? '',
                            y: v?.percentage ?? 0,
                            count: v?.count,
                            color: getColorByPalette(palette, i),
                        })),
                        innerSize: '47%',
                        legend: { enabled: true },
                        height: 325,
                        tooltip: insightPieCountTooltip,
                    },
                    false,
                ),
            );
    }
};

const InsightChartPortlet = ({ insightData = {}, chartKey }) => {
    const values = Array.isArray(insightData?.values) ? insightData.values : [];
    const column = insightData?.column ?? '';
    const chartType = getInsightChartType(insightData?.charttype);
    const title = formatColumnTitle(column);

    const hasData = values.length > 0 || insightData?.avg != null || insightData?.min != null;
    if (!hasData) return null;

    let options;
    try {
        options = buildInsightOptions(chartType, insightData);
    } catch {
        return null;
    }

    if (!options || typeof options !== 'object') return null;

    const isClockGauge = chartType === 'gauge' && shouldUseClockGauge(column, values);

    return (
        <div
            key={chartKey}
            className={`box-design no-box-shadow sampleListDemographicsCharts-item rs-audience-insight-chart${
                isClockGauge ? ' rs-audience-insight-chart--clock-gauge' : ''
            }`}
        >
            <h4 className="mb20">{title}</h4>
            <div className="align-items-center d-flex justify-content-center">
                <RSHighchartsContainer options={options} />
            </div>
        </div>
    );
};

export default InsightChartPortlet;
