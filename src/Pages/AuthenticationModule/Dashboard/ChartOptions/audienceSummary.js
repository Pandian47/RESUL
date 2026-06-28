import { ch_email, ch_mobile_push, ch_sms, ch_web_push } from 'Constants/GlobalConstant/Colors/colorsVariable';
const audienceSummary = (data) => ({
    chart: { type: 'pie', height: 330 },
    plotOptions: {
        series: {
            dataLabels: {
                useHTML: true,
                enabled: true,
                distance: -30,
                formatter: function () {
                    if (this.point.name == 'Email') {
                        return '<div class="pitChartIcon pieIcon-email"><i class="icon-mail-xmedium icon-md"></i></div>';
                    }
                    if (this.point.name == 'SMS') {
                        return '<div class="pitChartIcon pieIcon-mobile"><i class="icon-mobile-sms-xmedium icon-md"></i></div>';
                    }
                    if (this.point.name == 'Mobile push') {
                        return '<div class="pitChartIcon pieIcon-facebook"><i class="icon-mobile-push-notification-xmedium icon-md"></i></div>';
                    }
                    if (this.point.name == 'Web push') {
                        return '<div class="pitChartIcon pieIcon-googleplus"><i class="icon-social-web-notification-xmedium icon-md"></i></div>';
                    }

                    // var textX = plotLeft + plotWidth * 0.5;
                    // var textY = plotTop + plotHeight * 0.5;

                    var span = '<span id="pieChartInfoText" style="position:absolute; text-align:center;">';
                    span += '<span style="font-size: 32px">Upper</span><br>';
                    span += '<span style="font-size: 16px">Lower</span>';
                    span += '</span>';

                    // $('#addText').append(span);
                    // span = $('#pieChartInfoText');
                    // span.css('left', textX + span.width() * -0.5);
                    // span.css('top', textY + span.height() * -0.5);
                },
                color: 'white',
            },
        },
    },

    tooltip: {
        pointFormat: '{series.name}: <b>{point.y}</b>',
    },
    series: [
        {
            name: 'Audience',
            showInLegend: true,
            borderWidth: 0,
            size: '80%',
            height: '100%',
            innerSize: '58%',
            data: [
                { name: 'Email', color: ch_email, y: 31 },
                { name: 'Mobile', color: ch_sms, y: 21 },
                { name: 'Web push', color: ch_web_push, y: 12 },
                { name: 'Mobile push', color: ch_mobile_push, y: 36 },
            ],
            shadow: false,
            dataLabels: {
                enabled: true,
            },
        },
        {
            name: "pieSeriesName", borderWidth: 0, size: '50%', innerSize: '87%', data: [
                { color: 'rgba(0,0,0,0.15)', y: 31 },
                { color: 'rgba(0,0,0,0.15)', y: 21 },
                { color: 'rgba(0,0,0,0.15)', y: 12 },
                { color: 'rgba(0,0,0,0.15)', y: 36 },
            ], shadow: false, dataLabels: { enabled: false }, enableMouseTracking: false
        }
    ],
});

export default audienceSummary;
