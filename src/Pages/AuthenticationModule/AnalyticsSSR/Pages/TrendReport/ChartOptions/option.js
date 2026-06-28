import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { ch_all_audience, ch_primary_orange, ch_secondary_blue, ch_secondary_green } from 'Constants/GlobalConstant/Colors/colorsVariable';
import moment from 'moment';

const optionChart = () => {
    const getDateWithDay = (value) => {
        return moment().subtract(value, 'days').format('MMM DD');
    };
    return {
        chart: { type: 'areaspline' },
        plotOptions: {
            series: {
                lineWidth: 2,
                marker: {
                    enabled: true,
                    states: {
                        hover: {
                            enabled: true,
                        },
                    },
                },
            },
            areaspline: {
                stacking: 'normal',
                fillOpacity: 0.4,
                marker: {
                    symbol: 'circle',
                    lineWidth: 2,
                    fillColor: 'white',
                    lineColor: null,
                },
            },
        },
        xAxis: {
            title: { text: '' },
            // categories: datesPrev7Days,
            categories: [
                // getDateWithDay(6),
                // getDateWithDay(5),
                // getDateWithDay(4),
                // getDateWithDay(3),
                // getDateWithDay(2),
                // getDateWithDay(1),
                // getDateWithDay(0),
                getUserCurrentFormat(null, { subtract: { days: 6 } })?.dateFormat,
                getUserCurrentFormat(null, { subtract: { days: 5 } })?.dateFormat,
                getUserCurrentFormat(null, { subtract: { days: 4 } })?.dateFormat,
                getUserCurrentFormat(null, { subtract: { days: 3 } })?.dateFormat,
                getUserCurrentFormat(null, { subtract: { days: 2 } })?.dateFormat,
                getUserCurrentFormat(null, { subtract: { days: 1 } })?.dateFormat,
                getUserCurrentFormat(null, { subtract: { days: 0 } })?.dateFormat,
            ],
            min: 0.5,
            max: 4.5,
        },
        yAxis: {
            title: { text: '' },
            tickInterval: 200,
            // labels: { format: '{value}K', },
            // gridLineDashStyle: 'dsahad'
        },
        tooltip: {
            // valueSuffix: ' M',
            // backgroundColor: 'rgb(40 150 240 / 77%)',
            // followPointer: false,
            //  backgroundColor: '#0540d3',
        },
        legend: {
            itemStyle: { itemMarginBottom: 5, fontSize: '15px' },
        },

        series: [
            {
                name: 'Total audience',
                color: ch_all_audience,
                // marker: { lineColor: '#fe5758', fillColor: 'white' },
                fillColor: {
                    linearGradient: { x1: 0, x2: 0, y1: 0, y2: 2 },
                    stops: [
                        [0, '#0084894d'],
                        [1, 'rgb(64 171 175 / 0%)'],
                    ],
                },
                data: [432, 313, 463, 349, 415, 425, 422],
                marker: {
                    symbol: 'circle',
                },
                legendIndex: 1,
            },
            {
                name: 'Reach',
                color: ch_secondary_blue,
                // marker: { lineColor: 'ch_secondary_blue', fillColor: 'white' },
                fillColor: {
                    linearGradient: { x1: 0, x2: 0, y1: 0, y2: 2 },
                    stops: [
                        [0, '#004fdf54'],
                        [1, 'rgb(64 171 175 / 0%)'],
                    ],
                },
                data: [106, 107, 111, 133, 121, 167, 166],
                marker: {
                    symbol: 'circle',
                },
                legendIndex: 2,
            },
            {
                name: 'Engagement',
                color: ch_primary_orange,
                // marker: { lineColor: 'ch_primary_orange', fillColor: 'white' },
                fillColor: {
                    linearGradient: { x1: 0, x2: 0, y1: 0, y2: 2 },
                    stops: [
                        [0, '#f5670130'],
                        [1, 'rgb(64 171 175 / 0%)'],
                    ],
                },
                data: [163, 103, 176, 108, 147, 129, 128],
                marker: {
                    symbol: 'circle',
                },
                legendIndex: 3,
            },
            {
                name: 'Conversion',
                color: ch_secondary_green,
                // marker: { lineColor: ch_secondary_green, fillColor: 'white' },
                data: [163, 103, 176, 108, 147, 129, 128],
                fillColor: {
                    linearGradient: { x1: 0, x2: 0, y1: 0, y2: 2 },
                    stops: [
                        [0, '#99cc0330'],
                        [1, 'rgb(64 171 175 / 0%)'],
                    ],
                },
                marker: {
                    symbol: 'circle',
                },
                legendIndex: 4,
            },
        ],
    };
};

export default optionChart;
