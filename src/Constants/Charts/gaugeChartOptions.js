import { chartSizing } from 'Constants/Charts/commonFunction';
import { ch_secondary_blue } from 'Constants/GlobalConstant/Colors/colorsVariable';
// Recent camapigns - gaguage - 01
const gaugeChartOptions = ({ ...args }, items) => {
    // let plotData = []
    // let func = data?.data?.map((item)=> {
    //     return {
    //         from: item.from,
    //         top: item.to,
    //         color: item.color,
    //         outerRadius: '105%',
    //         thickness: '5%'
    //     }
    // })
    return {
        chart: {
            type: 'gauge',
            plotBackgroundColor: null,
            plotBackgroundImage: null,
            plotBorderWidth: 0,
            plotShadow: false,
            backgroundColor: null,
            height: args?.height ?? chartSizing['clock']
        },
        title: {
            // text: null,
            useHTML: true,
            text: '<div class="guageclock">&nbsp;</div>',
            verticalAlign: 'middle',
            floating: true
        },
        credits: {
            enabled: false
        },
        background: null,
        credits: {
            enabled: false
        },
        plotOptions: {
            gauge: {
                pivot: { radius: 0 },
                dial: { radius: '118%', topWidth: 18, baseWidth: 1, rearLength: '-93%', baseLength: '93%', backgroundColor: ch_secondary_blue },
            }
        },
        pane: [
            {
                background: [
                    {
                        backgroundColor: {
                            linearGradient: { x1: 0, y1: 1, x2: 0, y2: 1 },
                            stops: [
                                [0, '#FFF'],
                                [1, '#FFF']
                            ]
                        },
                        borderWidth: 1,
                        outerRadius: '0%'
                    },
                    { borderColor: 'transparent' }]
            },
            { startAngle: -180, endAngle: 180, center: ['50%', '50%'], size: '80%', innerSize: '50%', background: null, },
            { startAngle: -100, endAngle: 100, center: ['50%', '65%'], size: '80%', innerSize: '50%', background: null }
        ],

        // the value axis
        yAxis: [
            {
                min: 0,
                max: 24,
                lineColor: null,
                minorTickInterval: '3',
                minorTickWidth: 1,
                minorTickLength: 10,
                minorTickPosition: 'inside',
                minorTickColor: '#ccc',
                tickPixelInterval: 30,
                tickWidth: 2,
                tickPosition: 'inside',
                tickLength: 10,
                tickColor: '#ccc',
                labels: {
                    step: 3,
                    // rotation: 'auto',
                    style: {
                        'font-size': '14px',
                        'transform': 'translateY(6px)'
                    }
                },
                title: {
                    text: ''
                },
                plotBands: args?.series ?? []
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
                lineWidth: 0
            }
        ],
        tooltip: {
            enabled: false
        },
        series: [{
            name: '24 Hour',
            data: args?.data ?? [],
            tooltip: {
                valueSuffix: '' //  km/h
            }
        }]
    };
};
export default gaugeChartOptions;
