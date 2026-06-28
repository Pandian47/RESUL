import { chartColorCode, conversion, engagement, reach } from 'Constants/GlobalConstant/Colors/colorsVariable';
// Recent camapigns - gaguage - 01
import { ch_labelSize } from 'Constants/GlobalConstant/Fonts/Fonts';
const funnelChartOptions = (args, items) => {
    const parseDataUsage = (usage) => {
        const match = usage.match(/^([\d.]+)\s*(\w+)$/);
        if (!match) return { value: 0, display: usage };
    
        const num = parseFloat(match[1]);
        const unit = match[2]?.toLowerCase();
        let valueInMB = 0;
        switch (unit) {
            case 'gb':
                valueInMB = num * 1024;
                break;
            case 'mb':
                valueInMB = num;
                break;
            case 'kb':
                valueInMB = num / 1024;
                break;
            case 'bytes':
                valueInMB = num / (1024 * 1024);
                break;
            default:
                valueInMB = num;
        }
        return {
            value: valueInMB,
            display: usage
        };
    };
    
    
    var total = 0;
    items &&  items.map((item) => {
        total += item.performanceScore;
    });
    const dataRaw = args?.data?.map(([label, usage]) => {
        const { value, display } = parseDataUsage(usage);
        return {
            label,
            value,        
            displayUsage: display
        };
    });
    
    const totalValue = dataRaw?.reduce((sum, d) => sum + d.value, 0);
    
    const parsedData = dataRaw?.map((item) => {
        if(item?.value > 0) {
        const percent = (item?.value / totalValue) * 100;
        const minPercent = 5;
        const valueForChart = percent < minPercent ? (totalValue * minPercent / 100) : item.value;
    
        return {
            name: item.label,
            y: valueForChart,
            displayUsage: item.displayUsage,
            actualPercent: percent 
        };
    }else{
        return null;
    }
    });
    
    
    return {
        chart: {
            type: 'funnel3d',
            height: args?.height ?? 390,
            // width: args?.height ?? 330,
            className: args?.className ?? '',
            spacingLeft: args?.left !== undefined && args?.left !== '' ? args.left : 0,

            options3d: {
                enabled: true,
                alpha: 20,
                depth: -30,
                viewDistance: 50
            }
        },

        title: {
            text: null,
        },
        background: null,
        credits: {
            enabled: false,
        },
        plotOptions: {
            series: {
                dataLabels: {
                    enabled: true,
                    format: '<span class="fs14 color-primary-black">{point.name} ({point.percentage:.1f}</span><sub class="font-xxs color-primary-black">%</sub><span class="fs14">)</span>',
                    color: "#111",
                    style: { color: chartColorCode, fontSize: ch_labelSize, fontWeight: 'normal' },
                    allowOverlap: false,
                    y: 10,
                    center: args?.labelCenter || ['35%', '50%'],
                    width: args?.labelWidth || '60%',
                    height: '90%'
                },
                neckWidth: args?.neckWidth !== undefined && args?.neckWidth !== '' ? args.neckWidth : 150,
                neckHeight: '25%',
                width: args?.width !== undefined && args?.width !== '' ? args.width : 150,
                height: '80%'
            },
        },
        legend: {
            enabled: false
        },
        tooltip: {
            enabled: true,
            headerFormat: args?.tooltip?.head ? args?.tooltip?.head : `<span class='font-xs'>{point.key}<br/>`,
            pointFormat:
            `<span class="font-monospace" style="color:{point.color}">\u25CF</span>&nbsp;` +
            `<span class='font-xs'>{series.name}: </span>` +
            `<span class='font-xs'>{point.displayUsage}</span>`
        },
        colors: [reach, engagement, conversion , '#edd788' , '#f9aa71'],
        series: [
            {
                showInLegend: true,
                name: args?.name,
                data: parsedData?.filter(item => item !== null) ?? [],
                // data: [
                //     ["Website visits", 15654],
                //     ["Downloads", 4064],
                //     ["Requested price list", 1987],
                //     ["Invoice sent", 976],
                //     ["Finalized", 846],
                // ],
                tooltip: {
                    valueDecimals: args?.valueDecimals ?? 2,
                    valueSuffix: args?.valueSuffix ?? '', //  km/h
                },
            },
        ],
    };
};
export default funnelChartOptions;