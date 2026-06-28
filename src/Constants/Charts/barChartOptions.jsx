import { chartSizing, commonColorCode } from 'Constants/Charts/commonFunction';
import { ch_legendtextSize, ch_primary_black } from 'Constants/GlobalConstant/Colors/colorsVariable';
import PropTypes from 'prop-types';
const barChartOptions = ({ ...args }) => {
    const {
        xAxis = '',
        yAxis = '',
        series = [
            {
                name: '',
                data: [],
                color: '',
            },
        ],
    } = args;

    return {
        chart: {
            type: 'bar',
            height: args?.height ?? chartSizing['bar'],
            className: 'barchart-default-render',
        },
        title: {
            text: '',
        },
        credits: {
            enabled: false,
        },
        xAxis: {
            // ...(args.xAxis.title && {title: args.xAxis.title}),
            title: {
                text: xAxis?.title?.text ?? '',
                y: xAxis?.title?.y ?? 4,
            },
            categories: xAxis?.categories?.map((item) => {
                return item;
            }),
            labels: {
                enabled: xAxis?.labels ?? true,
            },
        },
        yAxis: {
            title: {
                text: yAxis?.title?.text ?? '',
                x: yAxis?.title?.x ?? -10,
            },
            tickInterval: yAxis?.tickInterval ?? '',
            labels: {
                format: yAxis?.labelFormat ?? '',
                enabled: yAxis?.lables ?? true,
            },
            max: yAxis?.max ?? null,

            // Y AXIS STROKE LINE
            // gridLineColor: '#000000',
            // gridLineWidth: 0,
            gridLineDashStyle: 'dash',
            gridLineColor: '#e5e6eb',
            gridLineWidth: 1,
            tickWidth: 0.5,
        },
        tooltip: {
            useHTML: true,
            headerFormat: '<span class="font-xs">{point.key}',
            pointFormat: `<br/><hr /><span style="color:{point.color}">\u25CF</span>&nbsp;<span class="font-xs">{series.name}: </span><span class="font-xs">${
                args?.tooltip?.percent ? '{point.y:.0f}<span class="fs11">%</span>' : '{point.y:.1f}'
            }</span>`,
            footerFormat: '</span>',

            shared: args?.tooltip?.shared ?? false,
        },
        legend: {
            enabled: args?.legend?.enabled ?? true,
            reversed: args?.legend?.reverse ?? false,
            itemMarginTop: args?.legend?.marginTop ?? 0,
            y: args?.legend?.y ?? 20,
            itemStyle: {
                fontFamily: 'MuktaRegular',
                fontWeight: 'normal',
                fontSize: ch_legendtextSize,
                color: ch_primary_black,
                // width: '150px',
            },
            marker: { symbol: 'square', verticalAlign: 'middle', radius: '5' },
            symbolHeight: 9,
            symbolWidth: 8,
            symbolRadius: 2,
        },
        plotOptions: {
            column: {
                stacking: args?.stacking ?? false,
            },
            bar: {
                pointWidth: args?.pointWidth ?? 27,
            },
            series: {
                borderRadius: 2,
                stacking: 'normal',
                states: {
                    inactive: {
                        opacity: 1,
                    },
                    hover: {
                        enabled: false,
                    },
                },
                colorByPoint: args?.colors ? true : false,
                colors: args?.colors && args?.colors,
            },
        },
        series: (series ?? [])
            ?.filter((item) => item?.data?.some((val) => Number(val) > 0))
            ?.map((item, index) => {
                return {
                    name: item.name,
                    data: item?.data?.map((item) => item || 0),
                    color: item?.color ?? commonColorCode(series)[index],
                    legendIndex: item?.legendIndex ?? index,
                };
            }),
        responsive: {
            rules: [
                {
                    condition: {
                        maxWidth: 500,
                    },
                    chartOptions: {
                        // chart: {
                        //     height: 210
                        // },
                        subtitle: {
                            text: null,
                        },
                        navigator: {
                            enabled: false,
                        },
                    },
                },
            ],
        },
    };
};

export default barChartOptions;

barChartOptions.propTypes = {
    xAxis: PropTypes.string,
    yAxis: PropTypes.string,
    categories: PropTypes.array.isRequired,
    series: PropTypes.object.isRequired,
};
