import { daysCount } from 'Constants/Charts/commonFunction';
import { ch_androidColor, ch_email, ch_facebook, ch_identifiedColor, ch_iosColor, ch_knownColor, ch_negative, ch_neutral, ch_notifications, ch_pinterest, ch_positive, ch_qR_code, ch_twitter, ch_unKnownColor } from 'Constants/GlobalConstant/Colors/colorsVariable';
export const OVERVIEW_GRID_DATA = {
    byAudienceType: {
        height: 150,
        legend: {
            enabled: false,
        },
        dataLabels: {
            enabled: false,
        },
        innerSize: '53%',
        series: [
            {
                name: 'Unknown',
                y: 5387,
                color: ch_unKnownColor,
            },
            {
                name: 'Known',
                y: 96474,
                color: ch_knownColor,
            },
            {
                name: 'Identified',
                y: 45255,
                color: ch_identifiedColor,
            },
        ],
    },
    communicationAnalysisAreaspline: {
        xAxis: {
            title: '',
            tickInterval: 4,
        },
        yAxis: {
            title: '',
        },
        categories: daysCount(30),
        series: [
            {
                name: 'Google Ads',
                data: [
                    100, 172, 120, 140, 112, 98, 132, 325, 128, 60, 100, 199, 100, 130, 95, 220, 200, 236, 132, 325,
                    128, 60, 100, 199, 100, 130, 95, 220, 200, 236,
                ],
                color: ch_pinterest,
            },
            {
                name: 'Facebook Ads',
                data: [
                    80, 85, 96, 89, 73, 75, 90, 50, 78, 42, 88, 60, 100, 65, 100, 45, 126, 129, 90, 50, 78, 42, 88, 60,
                    100, 65, 100, 45, 126, 129,
                ],
                color: ch_facebook,
            },
            {
                name: 'Twitter Ads',
                data: [
                    43, 64, 12, 54, 76, 34, 54, 50, 78, 42, 34, 60, 64, 65, 34, 45, 65, 129, 90, 35, 78, 75, 95, 60, 84,
                    65, 100, 45, 126, 129,
                ],
                color: ch_twitter,
            },
        ],
    },
    knownConvertion: {
        height: 229,
        series: [
            {
                name: 'Paid media',
                y: 29,
                color: ch_androidColor,
            },
            {
                name: 'QR code',
                y: 71,
                color: ch_iosColor,
            },
        ],
    },
    geographic_map__map_structure: {
        height: 250,
        series: [
            {
                zoomLevel: 10,
                country: 'India',
                state: 'Patna',
                lat: Number(25.5908),
                lon: Number(85.1348),
            },
        ],
    },
    sentimentData: [
        // {
        //     series: [
        //         {
        //             color: ch_positive,
        //             y: 65,
        //         },
        //     ],
        // },
        // {
        //     series: [
        //         {
        //             color: ch_neutral,
        //             y: 20,
        //         },
        //     ],
        // },
        // {
        //     series: [
        //         {
        //             color: ch_negative,
        //             y: 15,
        //         },
        //     ],
        // }
    ],
    communication_column: {
        categories: ['Credit card', 'Promotional offer', 'New Member Onboarding', 'Invest smartly, Save money'],
        xAxis: {
            title: '',
        },
        yAxis: {
            title: '',
        },
        tooltip: {
            shared: true,
        },
        pointWidth: 10,
        series: [
            {
                name: 'Email',
                color: ch_email,
                data: [180, 130, 165, 96],
            },
            {
                name: 'X',
                color: ch_twitter,
                data: [103, 81, 92, 138],
            },
            {
                name: 'Notifications',
                color: ch_notifications,
                data: [135, 69, 124, 43],
            },
            {
                name: 'QR code',
                color: ch_qR_code,
                data: [80, 89, 55, 81],
            },
        ],
    },
};