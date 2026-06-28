const pieOptions = (data) => {
    return {
        chart: { type: 'pie', height: 270 },
        tooltip: {
            followPointer: false,
        },
        plotOptions: {
            pie: {
                startAngle: 0,
                dataLabels: {
                    enabled: true,
                    formatter: function () {
                        return (this?.point?.y ?? 0) + '%';
                    },
                },
            },
        },
        legend: {
            itemMarginTop: 10
        },
        series: [
            {
                name: 'pieSeriesName',
                showInLegend: true,
                borderWidth: 2,
                size: '100%',
                height: '100%',
                innerSize: '47%',
                data,
                shadow: false,
                dataLabels: { enabled: true },
            },
            {
                name: 'shadow',
                borderWidth: 0,
                size: '50%',
                innerSize: '87%',
                data: [
                    { color: 'rgba(0,0,0,0.15)', y: 31 },
                    { color: 'rgba(0,0,0,0.15)', y: 21 },
                    { color: 'rgba(0,0,0,0.15)', y: 12 },
                    { color: 'rgba(0,0,0,0.15)', y: 36 },
                ],
                shadow: false,
                dataLabels: { enabled: false },
                enableMouseTracking: false,
            },
        ],
    };
};
export default pieOptions;