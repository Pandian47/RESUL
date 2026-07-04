import { chartSizing, commonColorCode, seriesNameField } from 'Constants/Charts/commonFunction';
import { getDateFormat, getUserCurrentFormat } from 'Utils/modules/dateTime';
import { chartFormatNumber } from 'Utils/modules/formatters';
import { ch_legendtextSize, ch_primary_black, ch_primary_orange, ch_secondary_green } from 'Constants/GlobalConstant/Colors/colorsVariable';
import { numberWithCommas } from 'Utils/modules/formatters';
import moment from 'moment';
import {
    attachMouseWheelXZoom,
    detachMouseWheelXZoom,
    getChartXAxisZoomOptions,
    mergeChartZoomEvents,
} from './chartXAxisZoom';

const MIN_DATE_TIME_LABEL_WIDTH = 155;
const MIN_X_AXIS_LABELS = 2;
const MAX_X_AXIS_LABELS = 12;
const X_AXIS_LABEL_GAP = 24;
const X_AXIS_RIGHT_SPACING = 16;
const X_AXIS_LABEL_MARGIN_RIGHT = 40;
const Y_AXIS_SAMPLE_TARGET = 500;
const MARKER_VISIBLE_MAX_POINTS = 50;
const MARKER_DENSITY_THRESHOLD = 3;
const COMPACT_LINE_MIN_POINTS = 500;

/** Markers on by default for small sets; density-based when zoomable large datasets. */
const resolveSeriesMarkerConfig = ({
    showMarkers,
    enableXAxisZoom,
    pointCount,
    seriesColor,
}) => {
    const base = {
        symbol: 'circle',
        radius: 4,
        lineWidth: 0,
    };

    if (enableXAxisZoom && pointCount > MARKER_VISIBLE_MAX_POINTS) {
        return {
            ...base,
            enabled: null,
            enabledThreshold: MARKER_DENSITY_THRESHOLD,
            fillColor: seriesColor,
            lineColor: seriesColor,
        };
    }

    return {
        ...base,
        enabled: showMarkers,
        fillColor: seriesColor ?? 'white',
        lineColor: seriesColor ?? null,
    };
};

/** Scale chart behaviour from point count n — no fixed upper cap (1k, 10k, 1L+). */
const getChartScaleProfile = (pointCount, { formatdatelable, categoryCount, xAxisType }) => {
    const useDatetimeAxis =
        formatdatelable &&
        categoryCount > 1 &&
        xAxisType === 'datetime';

    return {
        pointCount,
        useDatetimeAxis,
        useDynamicIntervalLabels: formatdatelable && categoryCount > 1 && !useDatetimeAxis,
        showMarkers: pointCount <= MARKER_VISIBLE_MAX_POINTS,
        lineWidth: pointCount > COMPACT_LINE_MIN_POINTS ? 1 : 1.5,
        fillOpacity: pointCount > COMPACT_LINE_MIN_POINTS ? 0.35 : 0.4,
        turboThreshold: 0,
        boostThreshold: 0,
        disableBoost: pointCount > 1,
        yAxisSampleStep: Math.max(1, Math.floor(pointCount / Y_AXIS_SAMPLE_TARGET)),
        legendSampleStep: Math.max(1, Math.floor(pointCount / Y_AXIS_SAMPLE_TARGET)),
    };
};

const parseCategoryTimestamp = (dateStr, detectDateFormat) => {
    if (!dateStr || typeof dateStr !== 'string') return null;
    const dateFormat = detectDateFormat(dateStr);
    if (!dateFormat) return null;
    const date = moment(dateStr, dateFormat);
    return date.isValid() ? date.valueOf() : null;
};

const getYAxisBounds = (series, sampleStep) => {
    if (!series?.length) return { hasNegativeValues: false, minValue: null, maxValue: null };

    let hasNegative = false;
    let min = Infinity;
    let max = -Infinity;
    const step = Math.max(1, sampleStep);

    series.forEach((item) => {
        const dataArray = item?.data ?? item?.datas ?? [];
        for (let i = 0; i < dataArray.length; i += step) {
            const value = dataArray[i];
            const numValue = typeof value === 'object' && value !== null ? value.y : value;
            if (typeof numValue === 'number' && !isNaN(numValue)) {
                if (numValue < 0) hasNegative = true;
                if (numValue < min) min = numValue;
                if (numValue > max) max = numValue;
            }
        }
    });

    return {
        hasNegativeValues: hasNegative,
        minValue: min === Infinity ? null : min,
        maxValue: max === -Infinity ? null : max,
    };
};

const toSeriesYValue = (dataItem) => {
    if (typeof dataItem === 'object' && dataItem !== null && 'y' in dataItem) {
        return dataItem.y;
    }
    if (typeof dataItem === 'number') {
        return dataItem;
    }
    return dataItem ?? 0;
};

const getMaxLabelsForAxisWidth = (axisWidth = 0) => {
    const safeWidth = axisWidth > 0 ? axisWidth : 720;
    const slotWidth = MIN_DATE_TIME_LABEL_WIDTH + X_AXIS_LABEL_GAP;
    const labelCount = Math.floor((safeWidth + X_AXIS_LABEL_GAP) / slotWidth);
    return Math.max(
        MIN_X_AXIS_LABELS,
        Math.min(MAX_X_AXIS_LABELS, labelCount),
    );
};

/** Pick up to maxCount evenly spaced items — works for timestamps and category indices. */
const getEvenlySpacedItems = (items, maxCount) => {
    if (!items?.length) return [];
    if (items.length === 1) return [items[0]];
    const labelCount = Math.min(maxCount, items.length);
    if (labelCount <= 1) return [items[0]];
    const result = [];
    for (let i = 0; i < labelCount; i++) {
        result.push(items[Math.round((i * (items.length - 1)) / (labelCount - 1))]);
    }
    return [...new Set(result)];
};

/** Drop the right-edge tick when it matches the axis max — avoids clipped last date label. */
const omitLastEdgeTick = (ticks, lastValue) => {
    if (!ticks?.length || ticks.length <= 1 || lastValue == null) return ticks ?? [];
    if (ticks[ticks.length - 1] === lastValue) {
        return ticks.slice(0, -1);
    }
    return ticks;
};

/** Datetime ticks: sample real timestamps when available, else interpolate axis range. */
const getDatetimeAxisTicks = ({ timestamps, min, max, axisWidth }) => {
    const maxLabels = getMaxLabelsForAxisWidth(axisWidth);
    const validTimestamps = [...new Set(
        (timestamps ?? []).filter((t) => t != null && !Number.isNaN(t)),
    )].sort((a, b) => a - b);

    if (validTimestamps.length >= 2) {
        const lastTs = validTimestamps[validTimestamps.length - 1];
        return omitLastEdgeTick(getEvenlySpacedItems(validTimestamps, maxLabels), lastTs);
    }

    if (min === max) return [min];
    const ticks = getEvenlySpacedItems(
        Array.from({ length: maxLabels }, (_, i) => min + (i * (max - min)) / (maxLabels - 1)),
        maxLabels,
    );
    return omitLastEdgeTick(ticks, max);
};

const isEdgeAxisLabel = (ctx) => {
    if (ctx.isFirst) {
        return { isEdgeMin: true, isEdgeMax: false };
    }
    if (ctx.isLast) {
        return { isEdgeMin: false, isEdgeMax: true };
    }

    const tickPositions = ctx.axis?.tickPositions;
    const axisType = ctx.axis?.options?.type;
    const pos = ctx.pos;
    const value = ctx.value;

    if (tickPositions?.length) {
        const firstTick = tickPositions[0];
        const lastTick = tickPositions[tickPositions.length - 1];
        if (axisType === 'category' && pos != null) {
            return {
                isEdgeMin: pos === firstTick,
                isEdgeMax: pos === lastTick,
            };
        }
        if (value != null) {
            return {
                isEdgeMin: value === firstTick,
                isEdgeMax: value === lastTick,
            };
        }
    }

    const { min, max } = ctx.axis ?? {};
    const isEdgeMin =
        typeof value === 'number' && typeof min === 'number' && value <= min;
    const isEdgeMax =
        typeof value === 'number' && typeof max === 'number' && value >= max;
    return { isEdgeMin, isEdgeMax };
};

/** Evenly spaced category indices — count adapts to available axis width. */
const getAxisLabelIndices = (categoryCount, maxLabels = MAX_X_AXIS_LABELS) => {
    if (!categoryCount || categoryCount <= 0) return [];
    const indices = Array.from({ length: categoryCount }, (_, i) => i);
    const ticks = getEvenlySpacedItems(indices, maxLabels);
    return omitLastEdgeTick(ticks, categoryCount - 1);
};

const getCategoryLabelStep = (categoryCount) => {
    if (!categoryCount || categoryCount <= 1) return 0;
    if (categoryCount <= 7) return 1;
    if (categoryCount <= 14) return 2;
    return Math.max(1, Math.ceil(categoryCount / MAX_X_AXIS_LABELS));
};

const getDataPointCount = (series = [], categories = []) => {
    const seriesMax = series.reduce(
        (max, item) => Math.max(max, (item?.data ?? item?.datas ?? []).length),
        0,
    );
    return Math.max(categories?.length ?? 0, seriesMax);
};

const areasplineChartOptions = ({ formatdateListactivity = false, formatdatelable = false, ...args }, tooltip) => {
    const hasCategoryAxis = !!args?.categories?.length;
    const isFormattedDateAxis = formatdateListactivity || formatdatelable;

    // let xInterval = {tickInterval: 1}
    // Object.keys(args?.xAxis?.tickInterval).map((key) => {
    //     if (key === 'tickInterval') {
    //         xInterval.tickInterval = args?.xAxis[key]
    //     }
    // })

    let legendType = 'normal'; // 'normal' or ''
    let arr = [];

    const categoryCount = args?.categories?.length ?? 0;
    const pointCount = getDataPointCount(args?.series, args?.categories);
    const scale = getChartScaleProfile(pointCount, {
        formatdatelable,
        categoryCount,
        xAxisType: args?.xAxis?.type,
    });

    const detectDateFormat = (dateStr) => {
        const { configuredFormat, timeFormat } = getDateFormat();
        const isTwelveHour = timeFormat.includes('A') || timeFormat.includes('a');
        const timePattern = isTwelveHour ? 'hh:mm A' : 'HH:mm';

        if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return `YYYY-MM-DD ${timePattern}`;
        if (/^[A-Za-z]{3,}-\d{2}-\d{4}/.test(dateStr)) return `MMM-DD-YYYY ${timePattern}`;
        if (/^[A-Za-z]{3}\s\d{2},\s\d{4},\s\d{2}:\d{2}/.test(dateStr)) return `MMM DD, YYYY, HH:mm`;
        if (/^\d{2}-\d{2}-\d{4}/.test(dateStr)) {
            return `${configuredFormat} ${timePattern}`;
        }
        return null;
    };

    const useDatetimeAxis = scale.useDatetimeAxis;
    const categoryTimestamps = useDatetimeAxis
        ? args.categories.map((cat) => parseCategoryTimestamp(cat, detectDateFormat))
        : [];
    const dynamicDate = getCategoryLabelStep(categoryCount);
    const labelStep = dynamicDate || 1;
    const showMarkers = scale.showMarkers;
    const useDynamicIntervalLabels = scale.useDynamicIntervalLabels;

    const formatAxisDateLabel = (dateStr) => {
        if (!dateStr || typeof dateStr !== 'string') {
            return dateStr || '';
        }

        try {
            const dateFormat = detectDateFormat(dateStr);
            if (!dateFormat) return dateStr;

            const date = moment(dateStr, dateFormat);
            if (!date.isValid()) {
                return dateStr;
            }

            const formatted = getUserCurrentFormat(date.toDate());
            return formatted?.dateTimeFormat || date.format('MMM DD, YYYY, HH:mm');
        } catch (error) {
            return dateStr;
        }
    };

    const formatTimestampLabel = (timestamp) => {
        if (timestamp == null || Number.isNaN(timestamp)) return '';
        const formatted = getUserCurrentFormat(new Date(timestamp));
        return formatted?.dateTimeFormat || moment(timestamp).format('MMM DD, YYYY, HH:mm');
    };

    if (args?.categories && args?.categories?.length > 0 && formatdateListactivity) {
        args.categories = args?.categories.map((dateStr) => getUserCurrentFormat(dateStr)?.dateFormat);
    }

    const showDateTimeLabels = formatdatelable && categoryCount > 0;

    const { hasNegativeValues, minValue, maxValue } = getYAxisBounds(
        args?.series,
        scale.yAxisSampleStep,
    );

    const enableXAxisZoom = args?.enableXAxisZoom === true;
    const plotMarkerConfig = resolveSeriesMarkerConfig({
        showMarkers,
        enableXAxisZoom,
        pointCount,
    });

    return {
        chart: {
            type: args?.type ?? 'areaspline',
            spacingTop: args?.chart?.spacingTop ?? 25,
            height: args?.height ?? chartSizing['area'],
            className: `areachart-default-render chart-line-animate${showDateTimeLabels ? ' areaspline-datetime-labels' : ''} ${args?.categories?.length === 1 || args?.series?.length === 1 ? '' : 'areaspline-chart'
                }`,
            reflow: true,
            ...(showDateTimeLabels
                ? {
                      marginRight: args?.chart?.marginRight ?? X_AXIS_LABEL_MARGIN_RIGHT,
                      spacingLeft: args?.chart?.spacingLeft ?? 4,
                      spacingRight: args?.chart?.spacingRight ?? X_AXIS_RIGHT_SPACING,
                      ...(args?.chart?.marginLeft !== undefined ? { marginLeft: args.chart.marginLeft } : {}),
                  }
                : {}),
            ...(enableXAxisZoom
                ? getChartXAxisZoomOptions()
                : {
                      zoomType: useDatetimeAxis || args?.xAxis?.type === 'datetime' ? 'x' : null,
                  }),
            events: mergeChartZoomEvents(
                {
                    load: function () {
                        if (this.xAxis?.[0]?.options?.type !== 'datetime') {
                            this.xAxis[0].options.dateTimeLabelFormats = false;
                        }
                    },
                },
                enableXAxisZoom ? function onChartLoad() { attachMouseWheelXZoom(this); } : undefined,
                enableXAxisZoom ? function onChartDestroy() { detachMouseWheelXZoom(this); } : undefined,
            ),
        },
        title: {
            text: '',
        },
        credits: {
            enabled: false,
        },
        ...(scale.disableBoost ? { boost: { enabled: false } } : {}),
        plotOptions: {
            line: {
                stacking: args?.stacking ?? 'normal',
                fillOpacity: scale.fillOpacity,
                lineWidth: scale.lineWidth,
                states: {
                    hover: {
                        lineWidth: scale.lineWidth,
                    },
                },
                marker: plotMarkerConfig,
            },
            areaspline: {
                stacking: 'normal',
                fillOpacity: scale.fillOpacity,
                lineWidth: scale.lineWidth,
                turboThreshold: scale.turboThreshold,
                boostThreshold: scale.boostThreshold,
                states: {
                    hover: {
                        lineWidth: scale.lineWidth,
                    },
                },
                marker: plotMarkerConfig,
            },
            series: {
                cursor: args?.plotOptions?.series?.cursor ?? 'default',
                events: args?.plotOptions?.series?.events ?? {},
                turboThreshold: scale.turboThreshold,
                boostThreshold: scale.boostThreshold,
                ...(useDatetimeAxis ? { findNearestPointBy: 'x' } : {}),
                marker: plotMarkerConfig,
            },
        },
        xAxis: {
            type: useDatetimeAxis ? 'datetime' : args?.xAxis?.type || (args?.categories?.length > 0 ? 'category' : 'linear'),
            minRange: enableXAxisZoom && (!args?.categories || args?.categories?.length > 1) ? 2 : undefined,
            ...(enableXAxisZoom
                ? {
                      events: {
                          afterSetExtremes: function () {
                              this.chart?.redraw(false);
                          },
                      },
                  }
                : {}),
            title: {
                text: args?.xAxis?.title ?? '',
                y: 8,
            },
            tickInterval: useDatetimeAxis ? undefined : (useDynamicIntervalLabels ? undefined : (args?.xAxis?.tickInterval ?? (dynamicDate || undefined))),
            ...(args?.xAxis?.tickPositioner
                ? { tickPositioner: args.xAxis.tickPositioner }
                : useDatetimeAxis
                  ? {
                        tickPositioner: function () {
                            const min = this.min ?? 0;
                            const max = this.max ?? 0;
                            if (min === max) return [min];
                            return getDatetimeAxisTicks({
                                timestamps: categoryTimestamps,
                                min,
                                max,
                                axisWidth: this.len,
                            });
                        },
                    }
                  : useDynamicIntervalLabels
                    ? {
                          tickPositioner: function () {
                              const count = this.categories?.length ?? categoryCount;
                              const maxLabels = getMaxLabelsForAxisWidth(this.len);
                              const min = Math.ceil(this.min ?? 0);
                              const max = Math.floor(this.max ?? count - 1);
                              const visibleIndices = Array.from(
                                  { length: Math.max(1, max - min + 1) },
                                  (_, i) => min + i,
                              );
                              const ticks = getEvenlySpacedItems(visibleIndices, maxLabels);
                              return omitLastEdgeTick(ticks, max);
                          },
                      }
                    : {}),
            categories: useDatetimeAxis ? undefined : (!!args?.categories && args?.categories?.length !== 0 ? args?.categories : []),
            dateTimeLabelFormats: useDatetimeAxis ? undefined : (args?.xAxis?.type === 'datetime' ? undefined : false),
            ordinal: useDatetimeAxis ? undefined : args?.xAxis?.type !== 'datetime',
            startOnTick: showDateTimeLabels ? false : undefined,
            endOnTick: showDateTimeLabels ? false : undefined,
            minPadding: showDateTimeLabels ? (args?.xAxis?.minPadding ?? 0) : args?.xAxis?.minPadding,
            maxPadding: showDateTimeLabels ? (args?.xAxis?.maxPadding ?? 0) : args?.xAxis?.maxPadding,
            offset: args?.xAxis?.offset !== undefined ? args?.xAxis?.offset : 0,
            lineWidth: args?.xAxis?.lineWidth !== undefined ? args?.xAxis?.lineWidth : 1,
            // args?.xAxis?.title === 'Hours'
            //     ? args?.categories?.map((item) => {
            //           let newDate = new Date(item).toLocaleTimeString();
            //           let splitDate = newDate.split(':');
            //           let hr = splitDate[0];
            //           let min = splitDate[1];
            //           let sec = splitDate[2];
            //           return hr + 'th hr';
            //       })
            //     : args?.categories?.map((item) => {
            //           let newDate = new Date(item).toDateString();
            //           let splitDate = newDate.split(' ');
            //           return splitDate[2] + ' ' + splitDate[1];
            //       }),
            plotLines: args?.xAxis?.plotLines ?? [],
            labels: {
                enabled: !!args?.categories && args?.categories?.length !== 0 ? true : false,
                step:
                    useDynamicIntervalLabels || (showDateTimeLabels && useDatetimeAxis)
                        ? undefined
                        : labelStep,
                autoRotation: false,
                rotation: 0,
                y: 30,
                overflow: showDateTimeLabels ? 'allow' : 'justify',
                padding: showDateTimeLabels ? 3 : 0,
                align: showDateTimeLabels
                    ? function () {
                          if (this.isFirst) return 'left';
                          if (this.isLast) return 'right';
                          const tickPositions = this.axis?.tickPositions;
                          const pos = this.pos;
                          if (tickPositions?.length && pos != null) {
                              if (pos === tickPositions[0]) return 'left';
                              if (pos === tickPositions[tickPositions.length - 1]) return 'right';
                          }
                          return 'center';
                      }
                    : undefined,
                style: {
                    textOverflow: 'none',
                    whiteSpace: 'nowrap',
                },
                formatter: function () {
                    try {
                        if (this.value === null || this.value === undefined) {
                            return '';
                        }
                        if (
                            showDateTimeLabels &&
                            this.axis?.options?.type === 'category' &&
                            this.pos === (this.axis?.categories?.length ?? 0) - 1 &&
                            (this.axis?.categories?.length ?? 0) > 1
                        ) {
                            return '';
                        }
                        if (this.axis?.options?.type === 'datetime' && typeof this.value === 'number') {
                            return formatdatelable
                                ? formatTimestampLabel(this.value)
                                : new Date(this.value).toLocaleString();
                        }
                        return formatdatelable ? formatAxisDateLabel(String(this.value)) : String(this.value);
                    } catch (error) {
                        return this.value != null ? String(this.value) : '';
                    }
                },
            },
            // labels: {
            //     rotation: 0,
            // },

            // HOVER CROSS LINE
            // crosshair: true
        },
        yAxis: {
            ...(hasNegativeValues
                ? {
                    min: args?.yAxis?.min !== undefined ? args?.yAxis?.min : (minValue !== null ? Math.min(0, minValue * 1.1) : undefined),
                    max: args?.yAxis?.max !== undefined ? args?.yAxis?.max : (maxValue !== null ? maxValue * 1.1 : undefined)
                }
                : {
                    min: args?.yAxis?.min ?? 0,
                    softMax: args?.yAxis?.softMax ?? 5
                }
            ),
            offset: args?.yAxis?.offset !== undefined ? args?.yAxis?.offset : 0,
            lineWidth: args?.yAxis?.lineWidth !== undefined ? args?.yAxis?.lineWidth : 1,
            title: {
                text: args?.yAxis?.title ?? '',
                x: -10,
            }, // 'Count'
            // minorGridLineWidth: 0,
            // gridLineWidth: 0,
            // alternateGridColor: null,
            labels: {
                //format: args?.yAxis?.labelFormat ?? '{value:,.0f}',
                enabled: args?.yAxis?.labels ?? true,
                formatter: function () {
                    return chartFormatNumber(this.value);
                },
            },
            // tickInterval: args?.yAxis?.tickInterval ?? 1,

            // Y AXIS STROKE LINE
            // gridLineColor: '#000000',
            // gridLineWidth: 0,
            // gridLineDashStyle: 'dash',

            // HOVER CROSS LINE
            // crosshair: true
        },
        tooltip: {
            useHTML: true,
            headerFormat: '<span class="font-xs">{point.key}',
            pointFormat:
                `<br/><hr /><span class="font-monospace" style="color:{point.color};">\u25CF</span>&nbsp;<span class="font-xs">${tooltip ? tooltip : `{series.name}`
                }: </span>` + `<span class="font-xs">{point.y}</span>`,
            footerFormat: '</span>',
            shared: args?.tooltip?.shared ?? true,
            formatter: function () {
                try {
                    let pointKey = '';

                    if (this.points && this.points.length > 0) {
                        const firstPoint = this.points[0];
                        if (typeof this.x === 'number' && useDatetimeAxis) {
                            pointKey = formatTimestampLabel(this.x);
                        } else {
                            pointKey = this.x !== undefined
                                ? (typeof this.x === 'string' ? this.x : String(this.x))
                                : (firstPoint.key !== undefined ? String(firstPoint.key) : '');
                        }
                    } else if (this.point) {
                        if (typeof this.x === 'number' && useDatetimeAxis) {
                            pointKey = formatTimestampLabel(this.x);
                        } else {
                            pointKey = this.point.category !== undefined
                                ? String(this.point.category)
                                : (this.point.key !== undefined ? String(this.point.key) : '');
                        }
                    }
                    let tooltipHtml = `<span class="font-xs">${pointKey}`;

                    // Add each point
                    if (this.points) {
                        this.points.forEach((point) => {
                            const value =
                                typeof point?.y === 'number'
                                    ? numberWithCommas(point?.y)
                                    : point?.y;
                            tooltipHtml += `<br/><hr /><span class="font-monospace" style="color:${point?.color};">\u25CF</span>&nbsp;<span class="font-xs">${tooltip || point?.series?.name}: </span><span class="font-xs">${value}</span>`;
                        });
                    } else if (this?.point) {
                        const value =
                            typeof this?.point?.y === 'number'
                                ? numberWithCommas(this?.point?.y)
                                : this?.point?.y;
                        tooltipHtml += `<br/><hr /><span class="font-monospace" style="color:${this?.point?.color};">\u25CF</span>&nbsp;<span class="font-xs">${tooltip || this?.series?.name}: </span><span class="font-xs">${value}</span>`;
                    }

                    tooltipHtml += '</span>';
                    return tooltipHtml;
                } catch (error) {
                    // Fallback to default tooltip
                    return `<span class="font-xs">${this.x || this.point?.key || ''}</span>`;
                }
            },
        },
        legend:
            legendType === 'normal'
                ? {
                    enabled: args?.legend?.enabled ?? true,
                    itemMarginTop: args?.legend?.marginTop ?? 2,
                    y: 10,
                    itemStyle: {
                        fontFamily: 'MuktaRegular',
                        fontWeight: 'normal',
                        fontSize: ch_legendtextSize,
                        color: ch_primary_black,
                    },
                    marker: { symbol: 'square', verticalAlign: 'middle', radius: '5' },
                    symbolHeight: 9,
                    symbolWidth: 8,
                    symbolRadius: 2,
                }
                : {
                    enabled: args?.legend?.enabled ?? true,
                    y: 20,
                    useHTML: true,
                    reversed: args?.legend?.reversed ?? true,
                    labelFormatter: function () {
                        const data = this.yData ?? [];
                        const step = scale.legendSampleStep;
                        let value = 0;
                        let sampled = 0;
                        for (let i = 0; i < data.length; i += step) {
                            value += data[i] ?? 0;
                            sampled += 1;
                        }
                        if (step > 1 && sampled > 0) {
                            value = Math.round((value / sampled) * data.length);
                        }
                        arr.push(value);

                        return `<div class="sp-legend"><span class="sp-label">${this.name
                            }</span> <div class="sp-legend-detail"><span class="sp-heading">${numberWithCommas(
                                value,
                            )}</span></div></div>`;
                    },
                },
        series: (args?.series ?? [])
            .filter((item) => {
                const dataArray = item?.data ?? item?.datas;
                if (!dataArray?.length) return false;
                const isValidValue = (value) => {
                    const numValue = typeof value === 'object' && value !== null ? value.y : value;
                    return numValue !== null && numValue !== undefined && !isNaN(numValue);
                };
                if (dataArray.length > Y_AXIS_SAMPLE_TARGET) {
                    return isValidValue(dataArray[0]) || isValidValue(dataArray[dataArray.length - 1]);
                }
                return dataArray.some(isValidValue);
            })
            .map((item, index) => {
                const chartValue = item?.data || item?.datas;
                const seriesColor = item?.color ?? commonColorCode(args?.series)[index];
                const mappedData = chartValue?.map((dataItem, dataIndex) => {
                    const y = toSeriesYValue(dataItem);
                    if (useDatetimeAxis) {
                        const x = categoryTimestamps[dataIndex] ?? dataIndex;
                        return [x, y];
                    }
                    if (typeof dataItem === 'object' && dataItem !== null && 'y' in dataItem) {
                        return dataItem;
                    }
                    return y;
                });

                return {
                    name: seriesNameField(item.name),
                    type: 'areaspline',
                    color: seriesColor,
                    fillColor: {
                        linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
                        stops: [
                            [0, `${item?.color ? item?.color + 30 : commonColorCode(args?.series)[index] + 60}`],
                            [1, 'rgb(64 171 175 / 0%)'],
                        ],
                    },
                    ...item,
                    data: mappedData,
                    turboThreshold: scale.turboThreshold,
                    boostThreshold: scale.boostThreshold,
                    marker: resolveSeriesMarkerConfig({
                        showMarkers,
                        enableXAxisZoom,
                        pointCount,
                        seriesColor,
                    }),
                };
            }),
        // series: [
        //     {
        //         name: args?.series[0]?.name,
        //         lineWidth: 1,
        //         color: ch_primary_orange,
        //         fillColor: {
        //             linearGradient: { x1: 0, x2: 0, y1: 0, y2: 2 },
        //             stops: [
        //                 [0, '#f5670130'],
        //                 [1, 'rgb(64 171 175 / 0%)'],
        //             ],
        //         },
        //         // args: args?.filter(item => item?.contextAttributeName === 'Unique Opens').map(item => item?.count || 0),
        //         args: args?.series[0]?.argss?.map((item) => item || 0),
        //         legendIndex: 0,
        //     },
        //     {
        //         name: args?.series[1]?.name,
        //         lineWidth: 1,

        //         // marker: { lineColor: 'ch_primary_orange', fillColor: 'white' },
        //         color: ch_secondary_green,
        //         fillColor: {
        //             linearGradient: { x1: 0, x2: 0, y1: 0, y2: 2 },
        //             stops: [
        //                 [0, '#99cc0330'],
        //                 [1, 'rgb(64 171 175 / 0%)'],
        //             ],
        //         },

        //         // args: args?.filter(item => item?.contextAttributeName === 'Forwards').map(item => item?.count || 0),
        //         args: args?.series[1]?.argss?.map((item) => item || 0),
        //         legendIndex: 1,
        //     },
        // ],
    };
};

export default areasplineChartOptions;
