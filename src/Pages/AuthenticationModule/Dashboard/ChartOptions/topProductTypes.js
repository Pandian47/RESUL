var greenColor = '#99cc03';
var blueColor = '#2896f0';
var maroonColor = '#fe5758';
var orangeColor = '#fd8f40';
var yellowColor = '#e7ca60';

const topProductTypes = (data) => ({
    chart: { type: 'pie' },
    plotOptions: {
        series: {
            dataLabels: {
                enabled: false,
            },
        },
    },
    tooltip: {
        pointFormat: '{series.name}: <b>{point.y} M</b>',
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
    series: [
        {
            name: 'Product',
            showInLegend: true,
            borderWidth: 2,
            size: '100%',
            height: '100%',
            innerSize: '90%',
            data: [
                { name: 'Macrosoft', color: greenColor, y: 35 },
                { name: 'Pyzer', color: yellowColor, y: 15 },
                { name: 'Expatria', color: blueColor, y: 19 },
                { name: 'IBS', color: orangeColor, y: 6 },
                { name: 'Blueray Airlines', color: maroonColor, y: 22 },
                { name: 'Others', color: greenColor, y: 3 },
            ],
            shadow: false,
            dataLabels: {
                enabled: false,
            },
        },
        {
            name: 'pieSeriesName',
            borderWidth: 0,
            size: '80%',
            innerSize: '97%',
            data: [
                { name: 'Macrosoft', color: 'rgba(0,0,0,0.15)', y: 35 },
                { name: 'Pyzer', color: 'rgba(0,0,0,0.15)', y: 15 },
                { name: 'Expatria', color: 'rgba(0,0,0,0.15)', y: 19 },
                { name: 'IBS', color: 'rgba(0,0,0,0.15)', y: 6 },
                { name: 'Blueray Airlines', color: 'rgba(0,0,0,0.15)', y: 22 },
                { name: 'Others', color: 'rgba(0,0,0,0.15)', y: 3 },
            ],
            shadow: false,
            dataLabels: {
                enabled: false,
            },
        },
    ],
});

export default topProductTypes;
