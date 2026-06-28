import { seriesNameField } from 'Constants/Charts/commonFunction';
import { ch_draft, ch_gauge1, ch_gauge2, ch_gauge3, ch_gauge4, ch_gauge5, ch_gauge6 } from 'Constants/GlobalConstant/Colors/colorsVariable';
// Recent camapigns - gaguage - 01
const recentCampaignsChart = (data, items) => {
    var total = 0;
    items &&
        items.map((item) => {
            total += item.performanceScore;
        });
    const actualValue = data.performanceScore || 0;
    const needleValue = Math.min(actualValue, 100);
    return {
        chart: {
            type: 'gauge',
            plotBackgroundColor: null,
            plotBackgroundImage: null,
            plotBorderWidth: 0,
            plotShadow: false,
            backgroundColor: null,
            height: data?.height ?? 230,
            width: data?.height ?? 230,
            className: data?.className ?? '',
        },

        title: {
            text: null,
        },
        background: null,
        credits: {
            enabled: false,
        },
        plotOptions: {
            gauge: {
                dataLabels: {
                    enabled: true,
                    useHTML: true,
                    formatter: function () {
                        return `<span class="rpGaugeLabel" style="text-align:center;display:block;"><span style="MuktaRegular; font-size:14px;text-align:center;display:block;">${
                            data?.performanceScore + ` ${data?.valueSuffix}`
                        }</span></span>`;
                    },
                    style: {
                        fontFamily: 'MuktaRegular',
                        fontWeight: '300',
                        fontSize: '22px',
                        textShadow: '0',
                        color: '#585858',
                    },
                    borderColor: 'transparent',
                },
                dial: {
                    radius: '60%',
                    backgroundColor: ch_gauge1,
                    borderWidth: 0,
                    baseWidth: 5,
                    topWidth: 1,
                    baseLength: '40%', // of radius
                    rearLength: '0%',
                },
                pivot: {
                    backgroundColor: ch_draft,
                    radius: 6,
                },
            },
        },
        pane: [
            { startAngle: -90, endAngle: 90, center: ['50%', '50%'], background: null },
            { startAngle: -90, endAngle: 90, center: ['50%', '30%'], background: null },
        ],
        tooltip: {
            enabled: true,
            // pointFormat: '{series.name}: <b>{point.y}</b>',
            pointFormat:
                '<span class="font-monospace" style="color:{point.color}">\u25CF</span>&nbsp;<span class="font-xs">{series.name}: </span>' +
                '<span class="font-xs">' +
                Math.min(Math.round(actualValue), 100) +
                '<span class="fs11">%</span></span>',
            // backgroundColor: '#0540d3',
            // pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y:,.2f}</b>%<br/>',
        },
        // the value axis
        yAxis: [
            {
                min: 0,
                max: 100,
                lineColor: null,
                minorTickInterval: 'auto',
                minorTickWidth: 0,
                minorTickLength: 0,
                minorTickPosition: 'outside',
                minorTickColor: '#fff',
                tickPixelInterval: data?.yAxis?.tickPixelInterval ?? '300',
                tickWidth: 0,
                tickLength: 0,
                tickPosition: 'inside',
                tickColor: '#fff',
                labels: {
                    step: data?.yAxis?.labels?.step ?? 1,
                    distance: data?.yAxis?.labels?.distance ?? -4,
                    useHTML: true,
                    y: data?.yAxis?.labels?.y ?? 14,
                    style: {
                        fontFamily: 'MuktaRegular',
                        fontWeight: '400',
                        fontSize: '14px',
                        textShadow: '0',
                        // color: '#b8b8b8'
                        color: '#666666',
                    },
                },
                title: {
                    text: null,
                },
                plotBands: data?.reverseColors ? [
                    { from: 0, to: 20, color: ch_gauge5, innerRadius: '82%', outerRadius: '105%' },
                    { from: 20, to: 40, color: ch_gauge4, innerRadius: '82%', outerRadius: '105%' },
                    { from: 40, to: 60, color: ch_gauge3, innerRadius: '82%', outerRadius: '105%' },
                    { from: 60, to: 80, color: ch_gauge2, innerRadius: '82%', outerRadius: '105%' },
                    { from: 80, to: 100, color: ch_gauge1, innerRadius: '82%', outerRadius: '105%' },

                    { from: 0, to: 100, color: ch_gauge6, innerRadius: '105%', outerRadius: '113%' },
                ] : [
                    { from: 0, to: 20, color: ch_gauge1, innerRadius: '82%', outerRadius: '105%' },
                    { from: 20, to: 40, color: ch_gauge2, innerRadius: '82%', outerRadius: '105%' },
                    { from: 40, to: 60, color: ch_gauge3, innerRadius: '82%', outerRadius: '105%' },
                    { from: 60, to: 80, color: ch_gauge4, innerRadius: '82%', outerRadius: '105%' },
                    { from: 80, to: 100, color: ch_gauge5, innerRadius: '82%', outerRadius: '105%' },

                    { from: 0, to: 100, color: ch_gauge6, innerRadius: '105%', outerRadius: '113%' },
                ],
            },
            {
                pane: 1,
                min: 0,
                max: 100,
                labels: { enabled: false },
                tickWidth: 0,
                tickLength: 0,
                minorTickWidth: 0,
                minorTickLength: 0,
                lineWidth: 0,
            },
        ],

        series: [
            {
                name: seriesNameField(data.status),
                // data: [40],
                data: [needleValue],
                tooltip: {
                    valueDecimals: data?.valueDecimals ?? 2,
                    valueSuffix: data?.valueSuffix ?? '', //  km/h
                },
            },
        ],
    };
};
export default recentCampaignsChart;
