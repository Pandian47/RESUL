import { chartSizing } from 'Constants/Charts/commonFunction';
import { ch_multi_status } from 'Constants/GlobalConstant/Colors/colorsVariable';
// export const solidGData = {
//     height: 150,
//     width: 150,
//     series: [
//         {
//             color: 'red',
//             y: 80
//         }
//     ]
// }

const solidgaugeChartOptions = ({ ...args }) => {
    return {
        chart: {
            type: 'solidgauge',
            height: args?.height ?? chartSizing['gauge'],
            width: args?.width ?? chartSizing['gauge'],
            // events: {
            //     render: renderIcons
            // }
        },

        title: {
            text: '',
            style: {
                fontSize: '24px'
            }
        },

        tooltip: {
            enabled: false,
            borderWidth: 0,
            backgroundColor: 'none',
            shadow: false,
            style: {
                fontSize: '16px'
            },
            valueSuffix: '%',
            pointFormat: '{series.name}<br><span style="font-size:2em; color: {point.color}; font-family: MuktaBold;">{point.y}</span>',
            positioner: function (labelWidth) {
                return {
                    x: (this.chartWidth - labelWidth) / 2,
                    y: (this.plotHeight / 2) + 15
                };
            }
        },

        pane: {
            startAngle: 0,
            endAngle: 360,
            background: [{ // Track for Move
                outerRadius: '112%',
                innerRadius: '88%',
                // backgroundColor: Highcharts.color(Highcharts.getOptions().colors[0])
                //     .setOpacity(0.3)
                //     .get(),
                backgroundColor: '#e7f2f8',
                borderWidth: 0
            }]
        },

        yAxis: {
            min: 0,
            max: 100,
            lineWidth: 0,
            tickPositions: []
        },

        plotOptions: {
            solidgauge: {
                dataLabels: {
                    enabled: false
                },
                linecap: 'round',
                stickyTracking: false,
                rounded: false
            }
        },

        series: [{
            name: 'Move',
            data: [{
                // color: Highcharts.getOptions().colors[0],
                color: args?.series[0]?.color ?? ch_multi_status,
                radius: '112%',
                innerRadius: '88%',
                y: args?.series[0]?.y ?? 0
            }]
        }]
    }
}

export default solidgaugeChartOptions;



// function renderIcons() {
//     // Move icon
//     if (!this.series[0].icon) {
//         this.series[0].icon = this.renderer.path(['M', -8, 0, 'L', 8, 0, 'M', 0, -8, 'L', 8, 0, 0, 8])
//             .attr({
//                 stroke: '#303030',
//                 'stroke-linecap': 'round',
//                 'stroke-linejoin': 'round',
//                 'stroke-width': 2,
//                 zIndex: 10
//             })
//             .add(this.series[2].group);
//     }
//     this.series[0].icon.translate(
//         this.chartWidth / 2 - 10,
//         this.plotHeight / 2 - this.series[0].points[0].shapeArgs.innerR -
//         (this.series[0].points[0].shapeArgs.r - this.series[0].points[0].shapeArgs.innerR) / 2
//     );

//     // Exercise icon
//     if (!this.series[1].icon) {
//         this.series[1].icon = this.renderer.path(
//             ['M', -8, 0, 'L', 8, 0, 'M', 0, -8, 'L', 8, 0, 0, 8,
//                 'M', 8, -8, 'L', 16, 0, 8, 8]
//         )
//             .attr({
//                 stroke: '#ffffff',
//                 'stroke-linecap': 'round',
//                 'stroke-linejoin': 'round',
//                 'stroke-width': 2,
//                 zIndex: 10
//             })
//             .add(this.series[2].group);
//     }
//     this.series[1].icon.translate(
//         this.chartWidth / 2 - 10,
//         this.plotHeight / 2 - this.series[1].points[0].shapeArgs.innerR -
//         (this.series[1].points[0].shapeArgs.r - this.series[1].points[0].shapeArgs.innerR) / 2
//     );

//     // Stand icon
//     if (!this.series[2].icon) {
//         this.series[2].icon = this.renderer.path(['M', 0, 8, 'L', 0, -8, 'M', -8, 0, 'L', 0, -8, 8, 0])
//             .attr({
//                 stroke: '#303030',
//                 'stroke-linecap': 'round',
//                 'stroke-linejoin': 'round',
//                 'stroke-width': 2,
//                 zIndex: 10
//             })
//             .add(this.series[2].group);
//     }

//     this.series[2].icon.translate(
//         this.chartWidth / 2 - 10,
//         this.plotHeight / 2 - this.series[2].points[0].shapeArgs.innerR -
//         (this.series[2].points[0].shapeArgs.r - this.series[2].points[0].shapeArgs.innerR) / 2
//     );
// }