var greenColor = '#99cc03';
var blueColor = '#2896f0';
var maroonColor = '#fe5758';
var orangeColor = '#fd8f40';
var yellowColor = '#e7ca60';

const topCommunicationTypes = (data) => ({
    chart: {
        type: 'column',
    },
    xAxis: {
        title: { text: 'Communication types' },
        categories: [''],
    },
    legend: {
        title: {
            text: '<span style="font-weight: normal; font-size: 16px;">Target audience / Campaigns</span>',
        },
        enabled: true,
        align: 'right',
        verticalAlign: 'top',
        layout: 'vertical',
        itemMarginBottom: -4,
    },
    yAxis: {
        title: { text: 'Target Audience (In Million)' },
        tickInterval: 2,
    },
    plotOptions: {
        column: {
            stacking: false,
        },
        series: {
            pointWidth: 27,
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
            name: 'Awareness',
            color: greenColor,
            data: [10],
            legendIndex: 0,
        },
        {
            name: 'Greetings',
            color: blueColor,
            data: [3],
            legendIndex: 1,
        },
        {
            name: 'New product launch',
            color: maroonColor,
            data: [2],
            legendIndex: 2,
        },
        {
            name: 'Promotion',
            color: orangeColor,
            data: [1],
            legendIndex: 3,
        },
        {
            name: 'Sale',
            color: yellowColor,
            data: [1.5],
            legendIndex: 3,
        },
    ],
});

export default topCommunicationTypes;
