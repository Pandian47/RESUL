import { ch_email, ch_facebook, ch_mobile_push, ch_qR_code, ch_sms, ch_web_push } from 'Constants/GlobalConstant/Colors/colorsVariable';
import { email_mini, mobile_notification_mini, mobile_sms_mini, qrcode_mini, social_facebook_mini, web_notification_mini } from 'Constants/GlobalConstant/Glyphicons';
const avgConversionTimeOptions = (data) => {
    // console.log('DATA :::::::::::::::: ', data);
    const MIN_SLICE_PERCENT = 10;
    const formatTime = (ms) => {
        if (ms < 60000) {
            return `${Math.floor(ms / 1000)}s`;
        } else if (ms < 3600000) {
            let mins = Math.floor(ms / 60000);
            return `${mins} ${mins === 1 ? 'min' : 'mins'}`;
        } else {
            let hours = ms / 3600000;
            return `${hours.toFixed(1)} ${hours === 1 ? 'hr' : 'hrs'}`;
        }
    };
    const inputData = Array.isArray(data) ? data : [];
    const total = inputData.reduce((acc, item) => acc + (Number(item?.y) || 0), 0);
    const minVisibleValue = total > 0 ? (total * MIN_SLICE_PERCENT) / 100 : 0;
    const normalizedData = inputData.map((item) => {
        const rawY = Number(item?.y) || 0;
        if (rawY > 0 && rawY < minVisibleValue) {
            return {
                ...item,
                y: minVisibleValue,
                originalY: rawY,
            };
        }
        return {
            ...item,
            originalY: rawY,
        };
    });

    return {
        chart: {
            type: 'pie',
            height: 330,
            className: 'highchart-tooltip-custom',
            // width: 295,
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
                    distance: -35,
                    formatter: function () {
                        let email =
                            this.point.icon === mobile_notification_mini
                                ? 'mobile-notification'
                                : this.point.icon === mobile_sms_mini
                                ? 'mobile-sms'
                                : this.point.icon === email_mini
                                ? 'email'
                                : this.point.icon === web_notification_mini
                                ? 'web-notification'
                                : this.point.icon === social_facebook_mini
                                ? 'facebook'
                                : this.point.icon === qrcode_mini
                                ? 'mobile-qrcode'
                                : '';
                        return (
                            `<div class="pitChartIcon position-relative ${email}">` +
                            `<i class="${this.point.icon} icon-md"></i>` +
                            `<span>${formatTime(this.point.originalY ?? this.point.y)}</span>` +
                            `</div>`
                        );
                    },
                    color: 'white',
                },
            },
        },
        tooltip: {
            enabled: true,
            shared: false,
            useHTML: true,
            headerFormat: `<span style="font-size: 15px;">{point.key}<br/>`,
            // pointFormat:
            //     '<span style="color:{point.color}">\u25CF</span>&nbsp;<span style="font-size: 12px;">{series.name}: </span>' +
            //     '<span style="font-size: 12px; text-align: right;">{point.y}<span class="fs8">mins</span></span></br>',
            formatter: function () {
                return `
                    <span style="font-size: 15px;">${this.point.name}<br/>
                    <span style="color:${this.point.color}">\u25CF</span>&nbsp;
                    <span style="font-size: 12px;">${this.series.name}: </span>
                    <span style="font-size: 12px; text-align: right;">${formatTime(this.point.originalY ?? this.point.y)}</span></br>
                `;
            },
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
                data: normalizedData,
                // [
                // ...data,
                // {
                //     name: 'Twitter',
                //     color: ch_mobile_push,
                //     y: 24,
                //     id: 'twitterIcon',
                //     icon: mobile_notification_mini,
                // },
                // { name: 'SMS', color: ch_sms, y: 24, icon: mobile_sms_mini },
                // { name: 'Email', color: ch_email, y: 24, icon: email_mini },
                // { name: 'Notifications', color: ch_web_push, y: 24, icon: web_notification_mini },
                // { name: 'Facebook', color: ch_facebook, y: 24, icon: social_facebook_mini },
                // { name: 'QR code', color: ch_qR_code, y: 24, icon: qrcode_mini },
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
                size: '49%',
                innerSize: '88%',
                // data: data,
                data: [
                    //     ...data,
                    {
                        name: 'Mobile push',
                        color: 'rgba(0,0,0,0.15)',
                        y: 24,
                        id: 'twitterIcon',
                    },
                    // { name: 'SMS', color: 'rgba(0,0,0,0.15)', y: 24 },
                    // { name: 'Email', color: 'rgba(0,0,0,0.15)', y: 24 },
                    // { name: 'Web push', color: 'rgba(0,0,0,0.15)', y: 24 },
                    // { name: 'Facebook', color: 'rgba(0,0,0,0.15)', y: 24 },
                    // { name: 'QR code', color: 'rgba(0,0,0,0.15)', y: 24 },
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
