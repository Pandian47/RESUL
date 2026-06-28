import { ch_email, ch_mobile_push, ch_sms, ch_web_push } from 'Constants/GlobalConstant/Colors/colorsVariable';
const deliveryMethod = (data) => ({
    chart: {
        type: 'bar',
        height: 291 - 23
    },
    legend: {
        enabled: false,
    },
    xAxis: {
        categories: ['Email', 'SMS', 'Mobile push', 'Web push'],
        title: { text: '' },
        //tickInterval: 0,
    },
    yAxis: {
        title: { text: '' },
        // categories: [''],
        labels: { enabled: false },
        tickInterval: 0,
    },
    plotOptions: {
        column: {
            stacking: false,
        },
        series: {
            dataLabels: {
                formatter: function () {
                    return this.y;
                },
                enabled: true,
                color: '#6e6e6e',
            },
            pointWidth: 27,
            pointPadding: 0,
            groupPadding: 0,
            colorByPoint: true,
            colors: [ch_email, ch_sms, ch_mobile_push, ch_web_push],
        },
    },
    tooltip: {
        shared: false,
        headerFormat: '',
        pointFormat: 'Total: <b>{point.y} M</b>',
    },
    series: [
        {
            name: 'Value',
            data: [15, 16, 1, 2],
            legendIndex: 2,
        },
    ],
});

export default deliveryMethod;
