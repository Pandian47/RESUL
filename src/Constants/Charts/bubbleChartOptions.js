import { chartSizing, commonColorCode } from 'Constants/Charts/commonFunction';
import PropTypes from 'prop-types';
const bubbleChartOptions = ({ isCustomSeries = false, ...args }) => {
    const { colors = [], series = [] } = args;
    const totalValue = series?.reduce((x, y) => x + Number(y.value), 0);
    
    const truncateText = (text, maxLength = 9) => {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };
    
    return {
        chart: {
            type: 'packedbubble',
            height: args?.height ?? chartSizing['bubble'],
            className: `bubblechart-default-render ${args?.className ?? ''}`,
            // width: args?.width ?? 585
        },
        title: {
            text: '',
        },
        credits: {
            enabled: false,
        },
        tooltip: {
            useHTML: true,
            outside: true,
            formatter: function() {
                const fullName = this?.point?.fullName || this?.series?.userOptions?.fullName || this?.series?.name;
                const pointValue = this?.point?.value !== undefined ? this?.point?.value : (this?.point?.y !== undefined ? this?.point?.y : this?.value);
                const pointColor = this?.color || this?.point?.color || this?.series?.color;
                return `<span class="font-xs" style="color: #ffffff;">${fullName}</span><hr style="margin:4px -8px 6px;border:0;border-top:1px solid #5a5a5a;opacity:1;width:auto;" /><span class="font-monospace" style="color:${pointColor}">\u25CF</span>&nbsp;<span class="font-xs" style="color: #ffffff;">Value: </span><span class="font-xs" style="color: #ffffff;">${pointValue}<span class="fs11">%</span></span>`;
            },
            enabled: true,
            style: {
                zIndex: 1000,
                color: '#ffffff',
            },
            shadow: false,
            backgroundColor: '#111111',
        },
        plotOptions: {
            series: {
                dataLabels: {
                    enabled: true,
                    useHTML: true,
                    format: '<div class="bubbleChartInsideContainer"><span class="bubbleChartCount font-medium">{point.value}<sub class="font-xs fw-normal">%</sub></span><span class="bubbleChartName" style="display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%;">{series.name}</span></div>',
                    style: {
                        color: '#ffffff',
                        textOutline: 'none',
                        fontWeight: 'normal',
                        fontSize: '16px',
                        fontFamily: 'MuktaRegular',
                        textShadow: 'none',
                    },
                },
            },
            packedbubble: {
                minSize: args?.packedbubble?.minSize ?? '85px',
                maxSize: args?.packedbubble?.maxSize ?? '135px',
                zMin: 0,
                zMax: 100,
                draggable: false,
                marker: {
                    fillOpacity: 0.9,
                },
                states: {
                    inactive: { opacity: 1 },
                    hover: { enabled: false },
                },
                layoutAlgorithm: {
                    splitSeries: false,
                    gravitationalConstant: args?.packedbubble?.layoutAlgorithm?.gravitationalConstant ?? 0.10,
                    friction: 0.2,
                    enableSimulation: false,
                },
                dataLabels: {
                    filter: {
                        property: 'y',
                        operator: '>',
                        value: -1,
                    },
                },
            },
        },
        legend: { enabled: false },
                series: isCustomSeries
            ? args.series.map((item, index) => ({
                name: truncateText(item.name),
                fullName: item.name,
                color: item?.color ?? Number(Number(item.value).toFixed(2)) < 0.1 ? commonColorCode(series)[index] + '66' : commonColorCode(series)[index],
                data: [{ 
                    value: Number(Number(item.value).toFixed(2)),
                    fullName: item.name
                }],
            }))
            : args?.series?.filter(item => Number(item?.value) > 0)?.map((item, index) => ({
                      name: truncateText(item.name),
                      fullName: item.name,
                      color: item?.color ?? commonColorCode(series?.filter(item => Number(item?.value) > 0))[index],
                      data: [{ 
                          value: Number(Number(item.value).toFixed(2)),
                          fullName: item.name
                      }],
            })),
    };
};
export default bubbleChartOptions;

bubbleChartOptions.propTypes = {
    colors: PropTypes.array,
    series: PropTypes.object.isRequired,
};
