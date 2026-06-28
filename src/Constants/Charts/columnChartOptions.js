import { chartSizing, commonColorCode, seriesNameField } from 'Constants/Charts/commonFunction';
import { truncateTitle } from 'Utils/modules/displayCore';
import PropTypes from 'prop-types';
import { chartFormatNumber, chartPercentageAxisLabelHtml, chartPercentageDataLabelHtml, chartPercentageTooltipPercentHtml, numberWithCommas } from 'Utils/modules/formatters';
import { ch_legendtextSize, ch_primary_black } from 'Constants/GlobalConstant/Colors/colorsVariable';

const getStackedColumnMaxY = (series) => {
    const categoryCount = Math.max(...(series ?? []).map((s) => s?.data?.length ?? 0), 0);
    let stackedMax = 0;
    for (let i = 0; i < categoryCount; i++) {
        const total = (series ?? []).reduce((sum, s) => sum + (s?.data?.[i]?.y ?? 0), 0);
        stackedMax = Math.max(stackedMax, total);
    }
    return stackedMax;
};

/** Fewer y-axis ticks + headroom so bar-top % labels are not clipped. */
const getPercentageStackedYAxisScale = (maxValue) => {
    const max = Math.max(0, maxValue);
    const tickInterval =
        max <= 50 ? 10 : max <= 100 ? 20 : max <= 200 ? 50 : max <= 400 ? 100 : 200;
    const labelHeadroom = tickInterval * 0.15;
    const yMax =
        max === 0
            ? tickInterval
            : Math.ceil((max + labelHeadroom) / tickInterval) * tickInterval;

    return { tickInterval, max: yMax };
};

const formatColumnTooltipValueHtml = (point, isPercent) => {
    const count = point?.count;
    if (count != null) {
        return `<span class="font-xs">${chartFormatNumber(count)}</span>`;
    }
    const val = point?.originalValue ?? point?.y;
    if (isPercent) {
        return chartPercentageTooltipPercentHtml(val, 1);
    }
    if (typeof val === 'number') {
        return `<span class="font-xs">${chartFormatNumber(val)}</span>`;
    }
    return `<span class="font-xs">${val ?? ''}</span>`;
};

/** Compact tooltip body (same structure as bar chart — no extra header gap). */
const buildColumnTooltipHtml = ({ pointKey, seriesName, color, point, isPercent, isBenchmark }) => {
    let html = `<span class="font-xs">${pointKey}<br/><hr />`;
    if (isBenchmark) {
        const pct = point?.originalValue ?? point?.y;
        html += `<span class="font-monospace" style="color:${color}">\u25CF</span>&nbsp;<span class="font-xs">${chartFormatNumber(pct)}</span><sub class="fs11 percent-xs">%</sub>`;
    } else {
        html += `<span class="font-monospace" style="color:${color}">\u25CF</span>&nbsp;<span class="font-xs">${seriesName}: </span>${formatColumnTooltipValueHtml(point, isPercent)}`;
    }
    return `${html}</span>`;
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
            height: args?.height ?? chartSizing['column'],
            className: `columnchart-default-render ${args?.isCustomDataLabelStyle ? 'data-label-customStyle' : ''}`,
            ...(args?.isCustomDataLabelStyle && args?.dataLabels ? { spacingTop: 20 } : {}),
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
                turboThreshold: 1000,
                states: {
                    hover: {
                        enabled: args?.hover ? true : false,
                        color: args?.hover?.color,
                    },
                },
            },
        },
        xAxis: {
            title: {
                text: xAxis?.title ?? '',
                y: xAxis?.y ?? 0,
            },
            categories: (categories ?? []).map((item) => item),
            labels: {
                enabled: xAxis?.labels?.enabled ?? true,
            },
            tickInterval: 1,
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
                        return chartPercentageAxisLabelHtml(this.value);
                    }
                    return chartFormatNumber(this.value);
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
                        const fullDate = args.fullDates[this.point.x] || this.point.category;
                        return buildColumnTooltipHtml({
                            pointKey: fullDate,
                            seriesName: this.series?.name ?? '',
                            color: this.point?.color ?? '',
                            point: this.point,
                            isPercent: args?.tooltip?.percent,
                            isBenchmark: args?.tooltip?.isBenchmark,
                        });
                    }
                    : function () {
                          const isPercent = args?.tooltip?.percent;
                          const isBenchmark = args?.tooltip?.isBenchmark;
                          const isShared = args?.tooltip?.shared ?? false;

                          if (isShared && Array.isArray(this.points) && this.points.length > 0) {
                              const pointKey = String(
                                  this.points[0]?.category ?? this.points[0]?.key ?? this.x ?? '',
                              );
                              let html = `<span class="font-xs">${pointKey}<br/><hr />`;
                              this.points.forEach((point) => {
                                  const seriesName = point.series?.name ?? '';
                                  const color = point.color ?? '';
                                  if (isBenchmark) {
                                      const pct = point?.originalValue ?? point?.y;
                                      html += `<span class="font-monospace" style="color:${color}">\u25CF</span>&nbsp;<span class="font-xs">${chartFormatNumber(pct)}</span><sub class="fs11 percent-xs">%</sub><br/>`;
                                  } else {
                                      html += `<span class="font-monospace" style="color:${color}">\u25CF</span>&nbsp;<span class="font-xs">${seriesName}: </span>${formatColumnTooltipValueHtml(point, isPercent)}<br/>`;
                                  }
                              });
                              return `${html}</span>`;
                          }

                        const pointKey = String(
                            this.point?.category ?? this.point?.key ?? this.x ?? '',
                        );

                        if (args?.tooltip?.head) {
                            return `${args.tooltip.head}<br/><hr />${formatColumnTooltipValueHtml(this.point, args?.tooltip?.percent)}</span>`;
                        }

                        return buildColumnTooltipHtml({
                            pointKey,
                            seriesName: this.series?.name ?? '',
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
