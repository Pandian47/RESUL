import { ch_draft, ch_gauge1, ch_gauge2, ch_gauge3, ch_gauge4, ch_gauge5, ch_gauge6, ch_labletextSize, ch_legendtextSize, ch_primary_grey, ch_secondary_black } from 'Constants/GlobalConstant/Colors/colorsVariable';
const gaugeChartOptionsNormal = ({ ...args }) => {
    const yValue = args?.series?.[0]?.y ?? 0;
    const maxVal = args?.max ?? 100;

    return {
        chart: {
            type: 'gauge',
            plotBackgroundColor: null,
            plotBorderWidth: 0,
            plotShadow: false,
            backgroundColor: null,
            height: args?.height ?? 230,
            width: args?.width ?? null,
            style: {
                fontFamily: 'MuktaRegular',
                fontWeight: 'normal',
                fontSize: ch_legendtextSize,
                color: ch_primary_grey,
            },
            reflow: true,
            animation: false,
        },
        title: {
            text: null,
        },
        credits: {
            enabled: false,
        },
        exporting: {
            enabled: false,
        },
        pane: [
            { startAngle: -90, endAngle: 90, center: ['50%', '50%'], background: null },
            { startAngle: -90, endAngle: 90, center: ['50%', '30%'], background: null },
        ],
        yAxis: [
            {
                min: 0,
                max: maxVal,
                lineColor: null,
                minorTickInterval: 'auto',
                minorTickWidth: 0,
                minorTickLength: 0,
                minorTickPosition: 'outside',
                minorTickColor: '#fff',
                tickPositions: [0, maxVal],
                tickWidth: 0,
                tickLength: 0,
                tickPosition: 'inside',
                tickColor: '#fff',
                labels: {
                    distance: args?.labelDistance ?? -4,
                    useHTML: true,
                    y: args?.labelY ?? 14,
                    style: {
                        fontFamily: 'MuktaRegular',
                        fontWeight: '400',
                        fontSize: ch_labletextSize,
                        color: ch_primary_grey,
                    },
                },
                title: { text: null },
                plotBands: args?.plotBands ?? [
                    { from: 0, to: maxVal * 0.2, color: ch_gauge1, innerRadius: '82%', outerRadius: '105%' },
                    { from: maxVal * 0.2, to: maxVal * 0.4, color: ch_gauge2, innerRadius: '82%', outerRadius: '105%' },
                    { from: maxVal * 0.4, to: maxVal * 0.6, color: ch_gauge3, innerRadius: '82%', outerRadius: '105%' },
                    { from: maxVal * 0.6, to: maxVal * 0.8, color: ch_gauge4, innerRadius: '82%', outerRadius: '105%' },
                    { from: maxVal * 0.8, to: maxVal, color: ch_gauge5, innerRadius: '82%', outerRadius: '105%' },
                    { from: 0, to: maxVal, color: ch_gauge6, innerRadius: '105%', outerRadius: '113%' },
                ],
            },
            {
                pane: 1,
                min: 0,
                max: maxVal,
                labels: { enabled: false },
                tickWidth: 0,
                tickLength: 0,
                minorTickWidth: 0,
                minorTickLength: 0,
                lineWidth: 0,
            },
        ],
        plotOptions: {
            gauge: {
                dataLabels: {
                    enabled: !!args?.dataLabelFormat,
                    useHTML: true,
                    format: args?.dataLabelFormat ?? '',
                    borderColor: 'transparent',
                    style: {
                        fontFamily: 'MuktaRegular',
                        fontWeight: '300',
                        fontSize: '14px',
                        textShadow: '0',
                        color: '#585858',
                    },
                },
                dial: {
                    radius: '60%',
                    backgroundColor: ch_gauge1,
                    borderWidth: 0,
                    baseWidth: 5,
                    topWidth: 1,
                    baseLength: '40%',
                    rearLength: '0%',
                },
                pivot: {
                    backgroundColor: ch_draft,
                    radius: 6,
                },
            },
        },
        tooltip: {
            enabled: true,
            useHTML: true,
            backgroundColor: ch_secondary_black,
            borderWidth: 0,
            borderRadius: 10,
            shadow: false,
            style: {
                opacity: 1,
                fontFamily: 'MuktaRegular',
                fontWeight: '300',
                color: '#fefefe',
            },
            pointFormat:
                args?.tooltipPointFormat ??
                '<span style="color:{point.color}">\u25CF</span>&nbsp;<span class="font-xs">{series.name}: </span>' +
                '<span class="font-xs">{point.y:.1f}<span class="fs11">%</span></span>',
        },
        series: [
            {
                name: args?.name ?? '',
                data: [yValue],
                tooltip: {
                    valueDecimals: args?.valueDecimals ?? 2,
                    valueSuffix: args?.valueSuffix ?? '',
                },
            },
        ],
    };
};

export default gaugeChartOptionsNormal;
