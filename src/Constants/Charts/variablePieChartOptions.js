import { chartSizing, commonColorCode } from 'Constants/Charts/commonFunction';
import { formatPercentageDisplay } from 'Utils/modules/formatters';
import { rsFontxsm } from 'Constants/GlobalConstant/Fonts/Fonts';
import { ch_email, ch_facebook, ch_labletextSize, ch_notifications, ch_pinterest, ch_qR_code, ch_twitter, chartColorCode } from 'Constants/GlobalConstant/Colors/colorsVariable';
import { email_mini, mobile_sms_mini, notification_mini, qrcode_mini, social_facebook_mini, social_twitter_mini } from 'Constants/GlobalConstant/Glyphicons';
const variablePieChartOptions = (args) => {
    return {
        chart: {
            type: 'variablepie',
            height: args?.height ?? chartSizing['varPie'],
            className: `varpie-default-render highchart-tooltip-custom`,
        },
        title: {
            text: ''
        },
        credits: {
            enabled: false
        },
        tooltip: {
            followPointer: false,
            shared: true,
            // pointFormat: '<span style="color:{point.color}">●</span> {series.name}: <b>{point.y:,.0f}</b><br/>'
            headerFormat: '<span class="font-xs"><div>{point.key}</div>',
            pointFormat: '<hr /><span class="font-monospace" style="color:{point.color}">\u25CF</span>&nbsp;<span class="font-xs">{series.name} </span>' + '<span class="font-xs">{point.y}</span>',
            footerFormat: '</span>',
        },
        plotOptions: {
            variablepie: {
                startAngle: 0,
                allowPointSelect: args?.icon ?? false,
                dataLabels: {
                    enabled: args?.dataLabels ?? true,
                    useHTML: args?.dataLabels?.useHTML ?? false,
                    connectorWidth: args?.dataLabels?.connectorWidth ?? 1,
                    connectorShape: 'crookedLine', // crookedLine, fixedOffset, straight
                    crookDistance: '100%',
                    softConnector: false,
                    distance: args?.icon ? 14 : 25,
                    color: '#333',
                    style: {
                        color: chartColorCode,
                        fontSize: ch_labletextSize,
                        fontWeight: 'normal',
                        fontSize: rsFontxsm,
                        fontFamily: 'MuktaRegular',
                        textShadow: 'none',
                    },
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
                                                    let color = this.point.icon === social_twitter_mini ? 'red' : this.point.color
                        const formattedPercentage = formatPercentageDisplay(this.percentage);
                        return (
                            '<div class="varpieChartIcon position-relative '
                            // + email 
                            +'">'
                            // + '<i style="color:' + color + '" class="' + this.point.icon + ' ' +  color + ' icon-md"></i>'
                            + '<span class="fs19">' + formattedPercentage + '<sub class="fs15">%</sub></span>'
                            + '</div>'
                        );
                    },
                    // formatter: function () {
                    //     if (this.color === ch_email) {
                    //         return ('<div class="pieScatterDBContainer email"><i class="miniIcons mi-email"></i> <span class="psPercentage">' + this.y + '<span>%</span></span></div>');
                    //     }
                    //     else if (this.color === ch_notifications) {
                    //         return ('<div class="pieScatterDBContainer googleplus"><i class="miniIcons mi-googleplus"></i> <span class="psPercentage">' + this.y + '<span>%</span></span></div>');
                    //     }
                    //     else if (this.color === ch_qR_code) {
                    //         return ('<div class="pieScatterDBContainer qrcode"><i class="miniIcons mi-qrcode"></i> <span class="psPercentage">' + this.y + '<span>%</span></span></div>');
                    //     }
                    //     else if (this.color === ch_pinterest) {
                    //         return ('<div class="pieScatterDBContainer pinterest"><i class="miniIcons mi-pinterest"></i> <span class="psPercentage">' + this.y + '<span>%</span></span></div>');
                    //     }
                    //     else if (this.color === ch_facebook) {
                    //         return ('<div class="pieScatterDBContainer facebook"><i class="miniIcons mi-facebook"></i> <span class="psPercentage">' + this.y + '<span>%</span></span></div>');
                    //     }
                    //     else if (this.color === ch_twitter) {
                    //         return ('<div class="pieScatterDBContainer twitter"><i class="miniIcons mi-twitter"></i> <span class="psPercentage">' + this.y + '<span>%</span></span></div>');
                    //     }

                    // }
                }
            }
        },
        legend: {
            itemMarginTop: 0,
            enabled: args?.legend?.enabled ?? true
        },
        series: [
            {
                showInLegend: args?.legend?.enabled ?? true,
                borderWidth: 2,
                height: "100%",
                size: "100%",

                minPointSize: 10,
                innerSize: '18%',
                startAngle: 180,
                zMin: 0,
                name: args?.name ?? 'Value',
                // data: [
                //     {
                //         name: 'Email',
                //         y: 21,
                //         color: 'yellow',
                //         z: 21,
                //     }
                // ],
                data: (args?.series ?? []).map((item, index) => {
                    return {
                        name: item?.name,
                        color: item?.color ?? commonColorCode(args?.series)[index],
                        y: item?.y,
                        z: item?.z,
                        icon: item?.icon
                    }
                }),
                shadow: false,
                states: {
                    inactive: {
                        opacity: 1
                    },
                    hover: {
                        enabled: false,
                    }
                }
            },
            {
                borderWidth: 0,
                size: '20%',
                innerSize: '72%',
                minPointSize: 0,
                data: [{ color: "rgba(0,0,0,0.15)", y: 6 }],
                shadow: false,
                showInLegend: false,
                enableMouseTracking: false,
                dataLabels: { enabled: false },
                states: {
                    inactive: {
                        opacity: 1
                    },
                    hover: {
                        enabled: false,
                    }
                }
            }
        ]
    }
}
export default variablePieChartOptions;