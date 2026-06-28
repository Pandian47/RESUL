import { commonColorCode } from 'Constants/Charts/commonFunction';
import { ch_email, ch_facebook, ch_notifications, ch_qR_code, ch_sms, ch_twitter } from 'Constants/GlobalConstant/Colors/colorsVariable';
import { email_mini, mobile_sms_mini, notification_mini, qrcode_mini, social_facebook_mini, social_twitter_mini } from 'Constants/GlobalConstant/Glyphicons';
const avgConversionTimeOptions = (args, position) => {
    return {
        chart: {
            type: 'pie',
            // width: 295,
            height: args?.height ?? 330,
            className: `highchart-tooltip-custom ${position  ? 'piechart-position-render mt-15' : 'piechart-default-render'}`,
        },
        title: {
            useHTML: true,
            text: '<div class="clock-arrow">&nbsp;</div>',
            verticalAlign: 'middle',
            floating: true,
            //y: 5
        },
        credits: {
            enabled: false,
        },
        plotOptions: {
            series: {
                dataLabels: {
                    useHTML: true,
                    enabled: true,
                    distance: -40,
                    formatter: function () {
                        let email =
                            this.point.icon === social_twitter_mini
                                ? 'mobile-notification'
                                : this.point.icon === mobile_sms_mini
                                    ? 'mobile-sms'
                                    : this.point.icon === email_mini
                                        ? 'email'
                                        : this.point.icon === notification_mini
                                            ? 'web-notification'
                                            : this.point.icon === social_facebook_mini
                                                ? 'facebook'
                                                : this.point.icon === qrcode_mini
                                                    ? 'mobile-qrcode'
                                                    : '';
                                                    // console.log("this: ", this.point.icon);
                        let arrow =
                            this.point.range === 'in'
                            ? '>'
                            : this.point.range === 'de'
                                ? '<'
                                : '';

                        return (
                            '<div class="pitChartIcon position-relative' + ' ' + email + '"><i class="' + (this?.point?.icon ?? '') + ' icon-md"></i>' +
                            '<span>' + arrow + (this?.point?.y ?? 0) + 'min</span></div>'
                        );
                    },
                    color: 'white',
                },
            },
        },
        tooltip: {
            enabled: true,
            shared: args?.tooltip?.shared ?? false,
            useHTML: true,
            headerFormat: args?.tooltip?.head ? args?.tooltip?.head : `<span class="font-xs">{point.key}<br/>`,
            pointFormat: '<span style="color:{point.color}">\u25CF</span>&nbsp;<span class="font-xs">{series.name}: </span>' + '<span class="font-xs">{point.y}<span class="fs12">%</span></span></br>',
            footerFormat: '</span>',
        },
        series: [
            {
                name: 'Total',
                showInLegend: false,
                borderWidth: 2,
                size: '100%',
                height: '100%',
                innerSize: '45%',
                data: (args?.series ?? []).map((item, index) => {
                    return {
                        name: item?.name,
                        y: item?.y,
                        color: item?.color ?? commonColorCode(args?.series)[index],
                        icon: item?.icon
                    }
                }),
                // [
                //     {
                //         name: 'Twitter',
                //         color: ch_twitter,
                //         y: 8,
                //         id: 'twitterIcon',
                //         icon: social_twitter_mini,
                //     },
                //     { name: 'Email', color: ch_email, y: 16, icon: email_mini },
                //     { name: 'SMS', color: ch_sms, y: 24, icon: mobile_sms_mini },
                //     { name: 'Facebook', color: ch_facebook, y: 36, icon: social_facebook_mini },
                //     { name: 'Notifications', color: ch_notifications, y: 10, icon: notification_mini },
                //     { name: 'QR code', color: ch_qR_code, y: 57, icon: qrcode_mini },
                // ],
                shadow: false,
                dataLabels: { enabled: true },

                states: {
                    inactive: {
                        opacity: 1,
                    },
                    hover: {
                        enabled: false,
                    },
                },
            },
            {
                name: 'Name',
                showInLegend: false,
                borderWidth: 0,
                size: '47%',
                innerSize: '89%',
                data:
                    [
                        {
                            name: 'shadow',
                            color: 'rgba(0,0,0,0.15)',
                            y: 24,
                            id: 'shadow',
                        }
                    ],
                shadow: false,
                dataLabels: { enabled: false },
                enableMouseTracking: false,
                states: {
                    inactive: {
                        opacity: 1,
                    },
                    hover: {
                        enabled: false,
                    },
                },
            },
        ],
    };
};

export default avgConversionTimeOptions;
