const pieFlatOptions = (data) => {
    return {
        chart: { type: 'pie', height: 260 },
        plotOptions: { pie: { slicedOffset: 20 } },
        series: [{
            name: name,
            borderWidth: 0,
            size: '100%',
            height: '100%',
            data,
            showInLegend: false,
            shadow: false,

            dataLabels: {
                formatter: function () {
                    return (Highcharts.numberFormat(this.y, 0) + "<span class='pieDataLabelPercentage'>%</span>");
                },
                enabled: false
            }
        }]
    };
};

export default pieFlatOptions;