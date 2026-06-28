import { ch_email, ch_mobile_push, ch_sms, ch_web_push } from 'Constants/GlobalConstant/Colors/colorsVariable';
const eventTriggerCommunication = (data) => ({
    chart: {
        type: 'column',
        height: 330
    },
    xAxis: {
        title: { text: '' },
        categories: [''],
    },
    // legend: {
    //     title: {
    //         text: '',
    //     },
    //     enabled: true,
    //     align: 'left',
    //     verticalAlign: 'bottom',
    //     layout: 'horizontal',
    //     x: 0,
    //     y: 0

    // },
    legend: {
        layout: 'horizontal',
        align: 'center',
        itemMarginTop: 15,
    },
    yAxis: {
        title: { text: '' },
        tickInterval: 2,
    },
    plotOptions: {
        column: {
            stacking: false,
            pointWidth: 15,
        },
        series: {
            pointWidth: 0,
            pointPadding: 0.3,
            groupPadding: 0,
        },
    },
    tooltip: {
        shared: false,
        headerFormat: '',
        pointFormat: '{series.name}<br/> Total: <b>{point.y} M</b>',
    },
    series: [
        {
            name: 'Email',
            color: ch_email,
            data: [10],
            legendIndex: 0,

        },
        {
            name: 'SMS',
            color: ch_sms,
            data: [3],
            legendIndex: 1,
        },
        {
            name: 'Mobile push',
            color: ch_mobile_push,
            data: [2],
            legendIndex: 2,
        },
        {
            name: 'Web push',
            color: ch_web_push,
            data: [1],
            legendIndex: 3,
        },

    ],
});

export default eventTriggerCommunication;
