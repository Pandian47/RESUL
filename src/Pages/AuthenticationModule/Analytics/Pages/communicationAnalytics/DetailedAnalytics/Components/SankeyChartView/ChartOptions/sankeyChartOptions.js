import { rsFontxs } from 'Constants/GlobalConstant/Fonts/Fonts';
const sankeyChartOptions = (data) => {
    return {
        chart: { type: 'area' },
        title: {
            text: '',
        },
        accessibility: {
            point: {
                valueDescriptionFormat: '{index}. {point.from} to {point.to}, {point.weight}.',
            },
        },
        tooltip: {
            headerFormat: '',
            shared: false,
        },
        plotOptions: {
            sankey: {
                nodeWidth: 17,
                dataLabels: {
                    enabled: true,
                    color: '#000000',
                    align: 'left',
                    // shadow: true,
                    x: 22,
                    animation: {
                        defer: 2000,
                    },
                    style: {
                        // textShadow: false,
                        textOutline: false,
                        fontWeight: 'normal',
                        fontFamily: '',
                        fontSize: rsFontxs,
                    },
                },
            },
        },
        series: [
            {
                stacking: 'normal',
                borderWidth: 0,
                keys: ['from', 'to', 'weight', 'tooltip'],
                data: [],
                type: 'sankey',
                name: '',
                colors: [],
            },
        ],
        credits: { enabled: false },
    };
};

export default sankeyChartOptions;
