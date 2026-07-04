import { chartSizing, commonColorCode, seriesNameField } from 'Constants/Charts/commonFunction';
import { truncateTitle } from 'Utils/modules/displayCore';
import PropTypes from 'prop-types';
import * as utils from 'Utils';
import * as func from './commonFunction';
import { createCategoryAxisTickPositioner } from './dynamicDateAxisLabels';
import {
    attachMouseWheelXZoom,
    detachMouseWheelXZoom,
    getChartXAxisZoomOptions,
    mergeChartZoomEvents,
} from './chartXAxisZoom';
import { ch_legendtextSize, ch_primary_black } from 'Constants/GlobalConstant/Colors/colorsVariable';

const getStackedColumnMaxY = (paddedSeries) => {
    let max = 0;
    if (!paddedSeries || !paddedSeries.length) return max;
    const len = paddedSeries[0]?.data?.length || 0;
    for (let i = 0; i < len; i++) {
        let sum = 0;
        paddedSeries.forEach(s => {
            sum += s.data?.[i]?.y || 0;
        });
        if (sum > max) max = sum;
    }
    return max;
};

const getPercentageStackedYAxisScale = (stackedMax) => {
    const max = Math.max(10, Math.ceil(stackedMax / 10) * 10);
    return { tickInterval: max / 10, max };
};

const formatColumnTooltipValueHtml = (point, isPercent) => {
    const count = point?.count;
    if (count != null) {
        return `<span class="font-xs">${utils.chartFormatNumber(count)}</span>`;
    }
    const val = point?.originalValue ?? point?.y;
    if (isPercent) {
        return utils.chartPercentageTooltipPercentHtml(val, 1);
    }
    if (typeof val === 'number') {
        return `<span class="font-xs">${utils.chartFormatNumber(val)}</span>`;
    }
    return `<span class="font-xs">${val ?? ''}</span>`;
};

/** Compact tooltip body (same structure as bar chart — no extra header gap). */
const buildColumnTooltipHtml = ({ pointKey, seriesName, color, point, isPercent, isBenchmark }) => {
    let html = `<span class="font-xs">${pointKey}<br/><hr />`;
    if (isBenchmark) {
        const pct = point?.originalValue ?? point?.y;
        html += `<span class="font-monospace" style="color:${color}">\u25CF</span>&nbsp;<span class="font-xs">${utils.chartFormatNumber(pct)}</span><sub class="fs11 percent-xs">%</sub>`;
    } else {
        html += `<span class="font-monospace" style="color:${color}">\u25CF</span>&nbsp;<span class="font-xs">${seriesName}: </span>${formatColumnTooltipValueHtml(point, isPercent)}`;
    }
    return `${html}</span>`;
};

const buildSharedColumnTooltipHtml = ({ pointKey, points, isPercent, isBenchmark }) => {
    let html = `<span class="font-xs">${pointKey}<br/><hr />`;
    const visiblePoints = (points ?? []).filter((pt) => (pt?.y ?? 0) > 0);

    visiblePoints.forEach((pt, index) => {
        const seriesName = func.seriesNameField(pt.series?.name ?? '');
        const color = pt.color ?? pt.series?.color ?? '';
        if (isBenchmark) {
            const pct = pt?.originalValue ?? pt?.y;
            html += `<span class="font-monospace" style="color:${color}">\u25CF</span>&nbsp;<span class="font-xs">${utils.chartFormatNumber(pct)}</span><sub class="fs11 percent-xs">%</sub>`;
        } else {
            html += `<span class="font-monospace" style="color:${color}">\u25CF</span>&nbsp;<span class="font-xs">${seriesName}: </span>${formatColumnTooltipValueHtml(pt, isPercent)}`;
        }
        if (index < visiblePoints.length - 1) {
            html += '<br/>';
        }
    });

    return `${html}</span>`;
};

const getColumnTooltipPointKey = (ctx, categories = []) => {
    const categoryIndex = ctx.point?.x ?? ctx.points?.[0]?.x;
    if (categoryIndex != null && categories[categoryIndex] != null) {
        return String(categories[categoryIndex]);
    }
    return String(
        ctx.point?.category ??
        ctx.points?.[0]?.category ??
        ctx.point?.key ??
        ctx.x ??
        '',
    );
};

const columnChartOptions = ({ ...args }) => {
    const {
        colors = [],
        xAxis = {
            title: '',
        },
        yAxis = {
            title: '',
        },
        categories = [],
        series = [
            {
                name: '',
                data: [],
            },
        ],
    } = args;
    // let colorTest = {color: 'blue'}
    // Object.keys(args?.series[0]).map((key) => {
    //     if (key === 'color') {
    //         colorTest.color = args?.series[0][key]
    //     }
    // })

    let legendType = 'normal'; // 'normal' or ''
    let arr = [];
    const maxLength = Math.max(...(args?.series ?? []).map((item) => (item?.data || item?.datas)?.length || 0));
    const totalDataPoints = (args?.series ?? []).reduce((total, series) => {
        const seriesData = series?.data || series?.datas || [];
        return total + (seriesData?.reduce((acc, value) => acc + value, 0) || 0);
    }, 0);
    const paddedSeries = (args?.series ?? []).map((item) => {
        const itemData = item?.data || item?.datas || [];
        const originalData = [...itemData];

        const paddedData = Array.from({ length: maxLength }, (_, idx) => {
            const raw = itemData[idx] ?? null;
            const isPointObject = typeof raw === 'object' && raw !== null && 'y' in raw;
            const yVal = isPointObject ? Number(raw.y) : Number(raw);
            const originalValue = isPointObject ? yVal : raw;
            const count = isPointObject && raw.count != null ? Number(raw.count) : undefined;

            if (yAxis?.showAsPercentage && raw !== null) {
                return {
                    y: yVal,
                    originalValue,
                    ...(count !== undefined && { count }),
                };
            }

            return { y: isPointObject ? yVal : raw, originalValue, ...(count !== undefined && { count }) };
        });

        return {
            ...item,
            originalData,
            data: paddedData,
        };
    });
    const maxYValue = Math.max(...(paddedSeries?.flatMap((series) => series?.data?.map((point) => point?.y ?? 0) ?? []) ?? [0]));
    let adjustedYAxisMax;
    if (yAxis?.showAsPercentage) {
        adjustedYAxisMax = maxYValue < 10 ? 10 : Math.ceil(maxYValue / 10) * 10;
    } else {
        adjustedYAxisMax = Math.ceil(maxYValue / 10) * 10;
    }
    const enableXAxisZoom = args?.enableXAxisZoom === true;
  let effectiveTickInterval = yAxis?.tickInterval ?? null;
    let effectiveYAxisMax = yAxis?.max ?? adjustedYAxisMax ?? null;
    if (yAxis?.showAsPercentage && args?.stacking) {
        const stackedMax = getStackedColumnMaxY(paddedSeries);
        const { tickInterval, max } = getPercentageStackedYAxisScale(stackedMax);
        effectiveTickInterval = tickInterval;
        effectiveYAxisMax = yAxis?.max ?? max;
    }
    return {
        chart: {
            type: 'column',
            spacingTop: args?.chart?.spacingTop ?? 25,
            height: args?.height ?? func.chartSizing['column'],
            className: `columnchart-default-render ${args?.isCustomDataLabelStyle ? 'data-label-customStyle' : ''}`,
            ...(enableXAxisZoom ? getChartXAxisZoomOptions() : {}),
            events: mergeChartZoomEvents(
                args?.chart?.events,
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
        plotOptions: {
            column: {
                borderRadius: 2,
                pointWidth: args?.pointWidth ?? 27,
                stacking: args?.stacking ?? false,
                colorByPoint: colors?.length > 0 ? true : false,
                turboThreshold: enableXAxisZoom ? 0 : 1000,
                states: {
                    hover: {
                        enabled: args?.hover ? true : false,
                        color: args?.hover?.color,
                    },
                },
            },
        },
        xAxis: {
            minRange: enableXAxisZoom && categories?.length > 1 ? 2 : undefined,
            title: {
                text: xAxis?.title ?? '',
                y: xAxis?.y ?? 0,
            },
            categories: (categories ?? []).map((item) => item),
            labels: {
                enabled: xAxis?.labels?.enabled ?? true,
            },
            tickInterval: args?.useDynamicDateLabels ? undefined : 1,
            ...(args?.useDynamicDateLabels
                ? {
                    tickPositioner: createCategoryAxisTickPositioner(categories.length),
                }
                : {}),
        },
        yAxis: {
            title: {
                text: yAxis?.title ?? '',
                x: -10,
            },
            labels: {
                format: yAxis?.showAsPercentage ? undefined : yAxis?.labelFormat ?? '{value:,.0f}',
                enabled: yAxis?.labels ?? true,
                useHTML: yAxis?.showAsPercentage ?? false,
                style: {
                    fontFamily: 'MuktaRegular',
                    fontWeight: 'normal',
                    fontSize: ch_legendtextSize,
                    color: ch_primary_black,
                },
                formatter: function () {
                    if (yAxis?.showAsPercentage) {
                        return utils?.chartPercentageAxisLabelHtml(this.value);
                    }
                    return utils.chartFormatNumber(this.value);
                },
            },
            tickInterval: effectiveTickInterval,
            max: effectiveYAxisMax,

            // Y AXIS STROKE LINE
            // gridLineColor: '#000000',
            gridLineWidth: 0,
            // gridLineDashStyle: 'dash',
        },
        colors: colors?.length > 0 ? colors : commonColorCode(series),
        legend:
            legendType === 'normal'
                ? {
                    enabled: args?.legend?.enabled ?? true,
                    itemMarginTop: args?.legend?.marginTop ?? -7,
                    y: args?.legend?.y ?? 15,
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
                    useHTML: true,
                    labelFormatter: function () {
                        let truncatedName = this.name;
                        if ((args?.series ?? []).length > 3 && this?.name?.length > 10) {
                            const result = truncateTitle(this.name, 10);
                            if (typeof result === 'string') {
                                truncatedName = result;
                            } else if (result?.props?.text) {
                                truncatedName = `${result.props.text.slice(0, 10)}...`;
                            } else {
                                truncatedName = `${this.name.slice(0, 10)}...`;
                            }
                        }
                        return `<span title="${this.name}" class="position-relative top-2">${truncatedName}</span>`;
                    },
                }
                : {
                    enabled: args?.legend?.enabled ?? true,
                    y: 20,
                    useHTML: true,
                    labelFormatter: function () {
                        let value = this.yData.reduce((a, b) => (a = a + b), 0);
                        arr.push(value);
                        let totalValue = arr.reduce((a, b) => (a = a + b), 0);

                        return `<div class="sp-legend"><span class="sp-label">${this.name
                            }</span> <div class="sp-legend-detail"><span class="sp-heading">${numberWithCommas(
                                value,
                            )}</span></div></div>`;
                    },
                },

        tooltip: {
            shared: args?.tooltip?.shared ?? false,
            // formatter: function () {
            //     setSeriesName(this.series.name)
            //     // console.log("TEST:", this.series.name);
            //     return '<span>' + this.x + '</span><br><div class="d-flex align-items-enter"><h3 class="white">' + this.y + '</h3></div>';
            // },
            useHTML: true,
            // Allow wrapping and constrain width so long titles don't overflow
            style: {
                whiteSpace: 'normal',
                maxWidth: '400px',
                lineHeight: '1.3',
            },
            headerFormat:
                args?.tooltip?.formatter || args?.fullDates
                    ? undefined
                    : args?.tooltip?.head ?? undefined,
            pointFormat:
                args?.tooltip?.formatter || args?.fullDates ? undefined : undefined,
            formatter:
                args?.tooltip?.formatter ??
                (args?.fullDates
                    ? function () {
                        if (args?.tooltip?.shared && this.points?.length) {
                            const fullDate =
                                args.fullDates[this.points[0]?.x] ||
                                this.points[0]?.category ||
                                getColumnTooltipPointKey(this, categories);
                            return buildSharedColumnTooltipHtml({
                                pointKey: fullDate,
                                points: this.points,
                                isPercent: args?.tooltip?.percent,
                                isBenchmark: args?.tooltip?.isBenchmark,
                            });
                        }
                        const fullDate = args.fullDates[this.point.x] || this.point.category;
                        return buildColumnTooltipHtml({
                            pointKey: fullDate,
                            seriesName: func.seriesNameField(this.series?.name ?? ''),
                            color: this.point?.color ?? '',
                            point: this.point,
                            isPercent: args?.tooltip?.percent,
                            isBenchmark: args?.tooltip?.isBenchmark,
                        });
                    }
                    : function () {
                        const pointKey = getColumnTooltipPointKey(this, categories);

                        if (args?.tooltip?.shared && this.points?.length) {
                            return buildSharedColumnTooltipHtml({
                                pointKey,
                                points: this.points,
                                isPercent: args?.tooltip?.percent,
                                isBenchmark: args?.tooltip?.isBenchmark,
                            });
                        }

                        if (args?.tooltip?.head) {
                            return `${args.tooltip.head}<br/><hr />${formatColumnTooltipValueHtml(this.point, args?.tooltip?.percent)}</span>`;
                        }

                        return buildColumnTooltipHtml({
                            pointKey,
                            seriesName: func.seriesNameField(this.series?.name ?? ''),
                            color: this.point?.color ?? '',
                            point: this.point,
                            isPercent: args?.tooltip?.percent,
                            isBenchmark: args?.tooltip?.isBenchmark,
                        });
                    }),
        },
        series: paddedSeries
            ?.map((item, index) => {
                const filteredData = (item?.data ?? [])
                    .map((point, idx) => ({
                        ...point,
                        x: idx,
                    }))
                    .filter((point) => point?.y > 0);
                return {
                    type: item?.type,
                    data: filteredData,
                    showInLegend: filteredData.length > 0,
                    name: seriesNameField(item.name),
                    legendIndex: 0,
                    inside: item?.inside ?? false,
                    borderWidth: item?.borderWidth,
                    marker:
                        item?.type === 'line'
                            ? {
                                lineColor: '#ffffff',
                                fillColor: item?.color,
                                lineWidth: 1.5,
                                radius: 3.5,
                            }
                            : null,
                    // ...(colorTest),
                    color: item?.color ?? commonColorCode(series)[index],
                    formatter: function () {
                        return this.y > 0 ? this.y + '%' : '';
                    },
                    states: {
                        inactive: {
                            opacity: 1,
                        },
                        hover: {
                            enabled: args?.hover ? true : false,
                            color: args?.hover?.color,
                        },
                    },
                    dataLabels: {
                        enabled:
                            (args?.dataLabels ?? false) &&
                            (!args?.stacking ||
                                !args?.isCustomDataLabelStyle ||
                                index === paddedSeries.length - 1),
                        useHTML: true,
                        color: args?.isCustomDataLabelStyle ? '#000000' : '#666666',
                        style: { fontWeight: '400' },
                        formatter: function () {
                            return chartPercentageDataLabelHtml(this.y);
                        },
                        inside: false,
                        y: args?.isCustomDataLabelStyle && args?.stacking ? -5 : args?.dataLabels?.y ?? -2,
                        crop: false,
                        overflow: 'allow',
                    },
                };
            })
            .filter((series) => (series?.data?.length ?? 0) > 0),
        // series: [
        //     {
        //         showInLegend: false,
        //         name: 'Communication period',
        //         pointWidth: 27,
        //         data: (args?.series[0]?.data ?? []).map((item) => {
        //             return item
        //         }),
        //         ...(colorTest),
        //         legendIndex: 0,
        //         states: {
        //             inactive: {
        //                 opacity: 1
        //             },
        //             hover: {
        //                 enabled: false,
        //             }
        //         }
        //     }
        // ]
    };
};
export default columnChartOptions;

columnChartOptions.propTypes = {
    colors: PropTypes.array,
    xAxis: PropTypes.string,
    yAxis: PropTypes.string,
    categories: PropTypes.array,
    series: PropTypes.object.isRequired,
};
