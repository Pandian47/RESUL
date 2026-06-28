import { chartSizing, commonColorCode, seriesNameField } from 'Constants/Charts/commonFunction';
import { getDateFormat, getUserCurrentFormat } from 'Utils/modules/dateTime';
import { chartFormatNumber } from 'Utils/modules/formatters';
import { ch_legendtextSize, ch_primary_black, ch_primary_orange, ch_secondary_green } from 'Constants/GlobalConstant/Colors/colorsVariable';
import { numberWithCommas } from 'Utils/modules/formatters';
import moment from 'moment';

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

    let dynamicDate;
    if (args?.categories?.length > 1000) {
        dynamicDate = 15;
    } else if (args?.categories?.length > 500) {
        dynamicDate = 12;
    } else if (args?.categories?.length > 200) {
        dynamicDate = 8;
    } else if (args?.categories?.length > 100) {
        dynamicDate = 5;
    } else if (args?.categories?.length > 50) {
        dynamicDate = 3;
    } else if (args?.categories?.length > 40) {
        dynamicDate = 2;
    } else if (args?.categories?.length > 28) {
        dynamicDate = 3;
    } else if (args?.categories?.length > 14) {
        dynamicDate = 3;
    } else if (args?.categories?.length > 7) {
        dynamicDate = 2;
    } else {
        dynamicDate = 0;
    }

    const seenDates = new Set();
    // const formatDatess = (dateStr) => {
    // const date = moment(dateStr, 'ddd, DD MMM, YYYY hh:mm A');
    // const dateKey = date.format('YYYY-MM-DD');

    // if (!seenDates?.has(dateKey)) {
    //     seenDates?.add(dateKey);
    //     return date.format('DD MMM');
    // } else {
    //     return date.format('HH:mm');
    // }
    // };

    // const seenDates = new Set();

    const detectDateFormat = (dateStr) => {
        const { configuredFormat, timeFormat } = getDateFormat();
        const isTwelveHour = timeFormat.includes('A') || timeFormat.includes('a');
        const timePattern = isTwelveHour ? 'hh:mm A' : 'HH:mm';

        if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return `YYYY-MM-DD ${timePattern}`;
        if (/^[A-Za-z]{3,}-\d{2}-\d{4}/.test(dateStr)) return `MMM-DD-YYYY ${timePattern}`;
        if (/^\d{2}-\d{2}-\d{4}/.test(dateStr)) {
            return `${configuredFormat} ${timePattern}`;
        }
        return null;
    };


    const formatDatess = (dateStr) => {
        if (!dateStr || typeof dateStr !== 'string') {
            return dateStr || '';
        }

        try {
            const { configuredFormat, timeFormat } = getDateFormat();
            const dateFormat = detectDateFormat(dateStr);
            if (!dateFormat) return dateStr;

            const date = moment(dateStr, dateFormat);
            if (!date.isValid()) {
                return dateStr;
            }

            const dateKey = date.format('YYYY-MM-DD');

            if (!seenDates.has(dateKey)) {
                seenDates.add(dateKey);
                const formatted = getUserCurrentFormat(date.toDate());
                return formatted?.dateFormat || formatted?.dayMonth || date.format('DD MMM');
            }

            return date.format(timeFormat);
        } catch (error) {
            return dateStr;
        }
    };



    // const formatDate = (dateStr) => {
    //     if (!dateStr) return '';
    //     return getUserDateTimeFormat(dateStr, 'formatDate');
    // };


    if (args?.categories && args?.categories?.length > 0 && formatdateListactivity) {
        // args.categories = args?.categories.map((dateStr) => getUserDateTimeFormat(dateStr, 'formatDate'));
        args.categories = args?.categories.map((dateStr) => getUserCurrentFormat(dateStr)?.dateFormat);
        // args.categories = args?.categories.map((dateStr) => formatDates(dateStr));
    }

    // Check if data contains negative values and calculate dynamic min/max
    const { hasNegativeValues, minValue, maxValue } = (() => {
        if (!args?.series) return { hasNegativeValues: false, minValue: null, maxValue: null };

        let hasNegative = false;
        let min = Infinity;
        let max = -Infinity;

        args.series.forEach((item) => {
            const dataArray = item?.data ?? item?.datas ?? [];
            dataArray.forEach((value) => {
                const numValue = typeof value === 'object' && value !== null ? value.y : value;
                if (typeof numValue === 'number' && !isNaN(numValue)) {
                    if (numValue < 0) hasNegative = true;
                    if (numValue < min) min = numValue;
                    if (numValue > max) max = numValue;
                }
            });
        });

        return {
            hasNegativeValues: hasNegative,
            minValue: min === Infinity ? null : min,
            maxValue: max === -Infinity ? null : max
        };
    })();

    return {
        chart: {
            type: args?.type ?? 'areaspline',
            height: args?.height ?? chartSizing['area'],
            className: `areachart-default-render chart-line-animate ${args?.categories?.length === 1 || args?.series?.length === 1 ? '' : 'areaspline-chart-del'
                }`,
            reflow: true,
            ...(isFormattedDateAxis && hasCategoryAxis ? { spacingRight: 24 } : {}),
            // Only enable zoom for datetime axes, disable for category axes to prevent getTime errors
            zoomType: args?.xAxis?.type === 'datetime' ? 'x' : null,
            events: {
                redraw: function () {
                    seenDates.clear();
                },
                load: function () {
                    // Ensure xAxis is properly configured after load
                    if (this.xAxis && this.xAxis[0] && this.xAxis[0].options.type !== 'datetime') {
                        // Prevent any datetime calculations on category axes
                        this.xAxis[0].options.dateTimeLabelFormats = false;
                    }
                }
            }
        },
        title: {
            text: '',
        },
        credits: {
            enabled: false,
        },
        plotOptions: {
            line: {
                stacking: args?.stacking ?? 'normal', // "normal", "overlap", "percent", "stream"
                fillOpacity: 0.4,
                lineWidth: 1.5,
                states: {
                    hover: {
                        lineWidth: 1.5,
                    },
                },
                marker: {
                    // enabled: false,
                    symbol: 'circle',
                    lineWidth: 0,
                    fillColor: 'white',
                    lineColor: null,
                },
            },
            areaspline: {
                stacking: 'normal', // "normal", "overlap", "percent", "stream"
                fillOpacity: 0.4,
                lineWidth: 1.5,
                states: {
                    hover: {
                        lineWidth: 1.5,
                    },
                },
                marker: {
                    // enabled: false,
                    symbol: 'circle',
                    lineWidth: 0,
                    fillColor: 'white',
                    lineColor: null,
                },
            },
            series: {
                // START WITH Y LINE
                // pointPlacement: (args?.categories?.length === 1 || args?.series?.length === 1) ? 0 : 'on', // "on", "between", number
                cursor: args?.plotOptions?.series?.cursor ?? 'default',
                events: args?.plotOptions?.series?.events ?? {},
            },
        },
        xAxis: {
            type: args?.xAxis?.type || (args?.categories?.length > 0 ? 'category' : 'linear'),
            title: {
                text: args?.xAxis?.title ?? '',
                y: 8,
            }, // 'Date'
            tickInterval: args?.xAxis?.tickInterval ? args?.xAxis?.tickInterval : dynamicDate,
            ...(isFormattedDateAxis && hasCategoryAxis ? { maxPadding: 0.02 } : {}),
            // tickInterval: 0,
            // ...(xInterval),
            // Only set min/max for category axes (as indices), never for datetime unless explicitly provided
            ...(args?.xAxis?.type !== 'datetime' && args?.categories?.length > 0 ? {} : {}),
            categories: !!args?.categories && args?.categories?.length !== 0 ? args?.categories : [],
            // Explicitly disable datetime features when using categories
            dateTimeLabelFormats: args?.xAxis?.type === 'datetime' ? undefined : false,
            // Prevent Highcharts from trying to calculate date ranges
            ordinal: args?.xAxis?.type !== 'datetime',
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
                step: dynamicDate,
                rotation: 0,
                y: 30,
                ...(isFormattedDateAxis ? { overflow: 'allow' } : {}),
                formatter: function () {
                    try {
                        // Prevent Highcharts from trying to use date methods on non-date values
                        if (this.value === null || this.value === undefined) {
                            return '';
                        }
                        // If this.axis is datetime type, ensure we handle it properly
                        if (this.axis && this.axis.options && this.axis.options.type === 'datetime') {
                            // For datetime axis, this.value should be a timestamp
                            if (typeof this.value === 'number') {
                                return formatdatelable ? formatDatess(new Date(this.value).toISOString()) : new Date(this.value).toLocaleString();
                            }
                        }
                        // For category axis, just return the string value
                        return formatdatelable ? formatDatess(String(this.value)) : String(this.value);
                    } catch (error) {
                        // Fallback: return string representation
                        try {
                            return this.value !== null && this.value !== undefined ? String(this.value) : '';
                        } catch (e) {
                            return '';
                        }
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
                    // For shared tooltips, use this.x; for single point, use this.point.key
                    let pointKey = '';

                    if (this.points && this.points.length > 0) {
                        // Shared tooltip - get x value from the first point
                        pointKey = this.x !== undefined
                            ? (typeof this.x === 'string' ? this.x : String(this.x))
                            : (this.points[0].key !== undefined ? String(this.points[0].key) : '');
                    } else if (this.point) {
                        // Single point tooltip
                        pointKey = this.point.category !== undefined
                            ? String(this.point.category)
                            : (this.point.key !== undefined ? String(this.point.key) : '');
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
                        let value = this.yData.reduce((a, b) => (a = a + b), 0);
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
                return dataArray?.some((value) => {
                    const numValue = typeof value === 'object' && value !== null ? value.y : value;
                    return numValue !== null && numValue !== undefined && !isNaN(numValue);
                });
            })
            .map((item, index) => {
                const chartValue = item?.data || item?.datas;
                return {
                    name: seriesNameField(item.name),
                    data: chartValue?.map((dataItem) => {
                        if (typeof dataItem === 'object' && dataItem !== null && 'y' in dataItem) {
                            return dataItem;
                        }
                        if (typeof dataItem === 'number') {
                            return dataItem;
                        }
                        return dataItem ?? 0;
                    }),
                    color: item?.color ?? commonColorCode(args?.series)[index],
                    marker: {
                        lineColor: item?.color ?? commonColorCode(args?.series)[index],
                        fillColor: item?.color ?? commonColorCode(args?.series)[index],
                    },
                    fillColor: {
                        linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
                        stops: [
                            [0, `${item?.color ? item?.color + 30 : commonColorCode(args?.series)[index] + 60}`],
                            [1, 'rgb(64 171 175 / 0%)'],
                        ],
                    },
                    ...item,
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
