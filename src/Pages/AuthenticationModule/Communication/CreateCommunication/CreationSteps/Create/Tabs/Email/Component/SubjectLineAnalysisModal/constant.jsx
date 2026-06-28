export const percentageChartOptions = (percent, color, height) => {
    return {
        // chart: {
        //     height: height || 150,
        //     className: 'piechart-render',
        // },
        title: {
            text: '',
        },
        subtitle: {
            text: `<div class='percent-value font-lg font-bold' style="color: #111111;">${percent}<span class="font-md">%</span></div>`,
            align: 'center',
            verticalAlign: 'middle',
            style: {
                textAlign: 'center',
            },
            x: 0,
            y: 5,
            useHTML: true,
        },
        credits: {
            enabled: false,
        },
        plotOptions: {
            pie: {
                size: 180,
            },
        },
        series: [
            {
                type: 'pie',
                enableMouseTracking: false,
                innerSize: '60%',
                size: '90%',
                dataLabels: {
                    enabled: false,
                },
                data: [
                    {
                        y: percent,
                        color: color,
                    },
                    {
                        y: 100 - percent,
                        color: '#e3e3e3',
                    },
                ],
            },
        ],
    };
};

export const subjectColor = 'rgb(159, 202, 50)';
export const ctrColor = 'rgb(62, 179, 225)';

export const subjectData = [
    {
        id: 'exclusive',
        text: (
            <span>
                "Exclusive <b>dining privileges</b> on using Vision Credit Cards"
            </span>
        ),
        percent: 22,
    },
    {
        id: 'restaurant',
        text: (
            <span>
                "Special <b>discounts</b> at gourmet restaurants near you"
            </span>
        ),
        percent: 18,
    },
    {
        id: 'restaurant-loan',
        text: (
            <span>
                "Get personal loans at <b>10% off</b> approved in 2 mins"
            </span>
        ),
        percent: 17,
    },
];
