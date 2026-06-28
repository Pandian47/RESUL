import { ch_androidColor, ch_email, ch_identifiedColor, ch_iosColor, ch_knownColor, ch_negative, ch_neutral, ch_notifications, ch_positive, ch_qR_code, ch_sms, ch_twitter, ch_unKnownColor } from 'Constants/GlobalConstant/Colors/colorsVariable';
import { analytics_large, arrow_down_bold_medium, arrow_up_bold_medium, circle_paid_media_medium, download_large, email_direct_medium, email_medium, email_mini, email_preview_large, mobile_notification_medium, mobile_notification_mini, mobile_sms_medium, mobile_sms_mini, mobile_sms_response_medium, qrcode_medium, share_tick_large, social_facebook_medium, social_facebook_mini, social_line_medium, social_pinterest_large, social_twitter_medium, social_vms_medium, social_whatsapp_medium, video_large, voice_assistant_medium, web_notification_medium, web_notification_mini, webinar_medium } from 'Constants/GlobalConstant/Glyphicons';
import { datesPrev13Days } from 'Constants/Utils/dates';
export const getIcon = {
    email: email_medium + '  icon-md color-email',
    mobile: mobile_sms_medium + ' icon-md color-sms',
    webpushnotification: web_notification_medium + ' icon-md color-facebook',
    mobilepushnotification: mobile_notification_medium + ' icon-md color-twitter',
};

export const getChannelList = [
    {
        id: 1,
        channel: 'Email',
        icon: email_medium,
        ratio: 'NA',
        count: 'NA',
        disabled: true,
    },
    {
        id: 2,
        channel: 'SMS',
        icon: mobile_sms_medium,
        ratio: 'NA',
        count: 'NA',
        disabled: true,
    },
    {
        id: 9,
        channel: 'Mobile notification',
        icon: mobile_notification_medium,
        ratio: 'NA',
        count: 'NA',
        disabled: true,
    },
    {
        id: 8,
        channel: 'Web notification',
        icon: web_notification_medium,
        ratio: 'NA',
        count: 'NA',
        disabled: true,
    },
    {
        id: 3,
        channel: 'Qr code',
        icon: qrcode_medium,
        ratio: 'NA',
        count: 'NA',
        disabled: true,
    },
    {
        id: 4,
        channel: 'Orm',
        icon: mobile_sms_medium,
        ratio: 'NA',
        count: 'NA',
        disabled: true,
    },
    {
        id: 5,
        channel: 'Social media',
        icon: mobile_sms_medium,
        ratio: 'NA',
        count: 'NA',
        disabled: true,
    },
    {
        id: 6,
        channel: 'Web',
        icon: mobile_sms_medium,
        ratio: 'NA',
        count: 'NA',
        disabled: true,
    },
    {
        id: 7,
        channel: 'Social post',
        icon: social_facebook_medium,
        ratio: 'NA',
        count: 'NA',
        disabled: true,
    },
    {
        id: 10,
        channel: 'Paid media',
        icon: circle_paid_media_medium,
        ratio: 'NA',
        count: 'NA',
        disabled: true,
    },
    {
        id: 13,
        channel: 'Webinar',
        icon: webinar_medium,
        ratio: 'NA',
        count: 'NA',
        disabled: true,
    },
    {
        id: 14,
        channel: 'Mobile push',
        icon: mobile_sms_response_medium,
        ratio: 'NA',
        count: 'NA',
        disabled: true,
    },
    {
        id: 15,
        channel: 'Video',
        icon: video_large,
        ratio: 'NA',
        count: 'NA',
        disabled: true,
    },
    {
        id: 16,
        channel: 'App',
        icon: mobile_sms_medium,
        ratio: 'NA',
        count: 'NA',
        disabled: true,
    },
    {
        id: 21,
        channel: 'Whats app',
        icon: social_whatsapp_medium,
        ratio: 'NA',
        count: 'NA',
        disabled: true,
    },
    {
        id: 25,
        channel: 'Vms',
        icon: social_vms_medium,
        ratio: 'NA',
        count: 'NA',
        disabled: true,
    },
    {
        id: 26,
        channel: 'Voice',
        icon: voice_assistant_medium,
        ratio: 'NA',
        count: 'NA',
        disabled: true,
    },
    {
        id: 30,
        channel: 'Line',
        icon: social_line_medium,
        ratio: 'NA',
        count: 'NA',
        disabled: true,
    },
    {
        id: 33,
        channel: 'Direct mail',
        icon: email_direct_medium,
        ratio: 'NA',
        count: 'NA',
        disabled: true,
    },
    {
        id: 34,
        channel: 'Webhook',
        icon: mobile_sms_medium,
        ratio: 'NA',
        count: 'NA',
        disabled: true,
    },
];

export const buildTrendsPayload = (formState = {}) => {
    const {
        campaignId = 231893,
        clientId = 1925,
        departmentId = 2,
        analyticsType = 1,
        channelId = [1],
        startDate = '06/05/2023',
        endDate = '07/15/2023',
        metricType = 'Interaction',
        chartType = 'line',
        channelName = 'All channels',
    } = formState;
    return {
        campaignId,
        clientId,
        departmentId,
        analyticsType,
        channelId,
        startDate,
        endDate,
        metricType,
        chartType, // bar // radar
        channelName,
    };
};

export const handleNoConversion = [
    { icon: `${email_mini} icon-md color-email`, count: 'NA', ratio: 'NA', channel: 'Email' },
    { icon: `${mobile_sms_mini} icon-md color-sms`, count: 'NA', ratio: 'NA', channel: 'SMS' },
    {
        icon: `${web_notification_mini} icon-md color-facebook`,
        count: 'NA',
        ratio: 'NA',
        channel: 'Web notification',
    },
    {
        icon: `${mobile_notification_mini} icon-md color-twitter`,
        count: 'NA',
        ratio: 'NA',
        channel: 'Mobile notification',
    },
];

export const getArrowIcon = (status) =>
    status
        ? arrow_up_bold_medium + ' color-primary-green '
        : arrow_down_bold_medium + '  color-primary-red ';

export const getChannelTitle = (name) => {
    if (name === 'channelReachInfo') return 'Reach';
    else if (name === 'channelEngagementInfo') return 'Engagement';
    return 'Conversion';
};

export const CHARTS_ICON = [
    { icon: `${share_tick_large} icon-lg color-primary-blue` },
    { icon: `${analytics_large} icon-lg color-primary-blue` },
    { icon: `${social_pinterest_large} icon-lg color-primary-blue` },
];

export const chartIcons = (state) => {
    const { setAnalysisTabIndex } = state;
    return (
        <ul>
            {CHARTS_ICON?.map((item, index) => {
                return (
                    <li key={index}>
                        <i className={item.icon} onClick={() => setAnalysisTabIndex(index)} />
                    </li>
                );
            })}
        </ul>
    );
};

export const ANALYSIS_CHANNELS = [
    'All channels',
    'Email',
    'SMS',
    'QR code',
    'Facebook app',
    'Facebook',
    'X',
    'Pinterest',
];

export const ANALYSIS_PERFORMANCE_DATA = [
    // { id: 1, name: 'Reach' },
    // { id: 2, name: 'Engagement' },
    // { id: 3, name: 'Conversion' },
    { id: 'Reach', name: 'Reach', value: 1 },
    { id: 'Interaction', name: 'Engagement', value: 2 },
    { id: 'Conversion', name: 'Conversion', value: 3 },
];
export const PAID_ADS_ANALYSIS_PERFORMANCE_DATA = [
    { id: 'Interaction', name: 'Engagement', value: 2 },
    { id: 'Conversion', name: 'Conversion', value: 3 },
];
export const INDUSTRY_BENCHMARK = [
    { id: 1, name: 'By industry' },
    { id: 2, name: 'By channel' },
];
export const MY_BENCHMARKS = [
    { id: 'myCommunication', name: 'By communication', value: 1 },
    { id: 'myChannel', name: 'By channel', value: 2 },
];

export const BENCHMARK_MODE_LABELS = { 1: 'Reach', 2: 'Engagement', 3: 'Conversion' };
export const BENCHMARK_INDUSTRY_LABELS = { 1: 'By industry', 2: 'By channel' };
export const BENCHMARK_CLIENT_LABELS = { 1: 'By communication', 2: 'By channel' };

export const getBenchmarkModeLabel = (mode) =>
    BENCHMARK_MODE_LABELS[mode] ?? 'Reach';
export const getIndustryBenchmarkTypeLabel = (clientBenchmark) => {
    return BENCHMARK_INDUSTRY_LABELS[Number(clientBenchmark)] ?? 'By industry';
};
export const getMyBenchmarkTypeLabel = (benchmark) => BENCHMARK_CLIENT_LABELS[Number(benchmark)] ?? 'By communication';
export const OVERVIEW_CARD_DATA = {
    total: '32.3M',
    detailViewChannel: ['Email', 'SMS'],
    data: [
        {
            title: 'Reach',
            count: '13.9M',
            percentage: '43%',
            socialMedia: [
                { icon: `${email_medium} icon-md color-email`, count: '0.42M', ratio: '3:1' },
                { icon: `${mobile_sms_medium} icon-md color-sms`, count: '0.48M', ratio: '2:1' },
                { icon: `${social_facebook_medium} icon-md color-facebook`, count: '2.8M', ratio: '6:1' },
                { icon: `${social_twitter_medium} icon-md color-twitter`, count: '1.9M', ratio: '9:1' },
            ],
        },
        {
            title: 'Engagement',
            count: '0.5M',
            percentage: '1.5%',
            socialMedia: [
                { icon: `${email_medium} icon-md color-email`, count: '84,982', ratio: '212:1' },
                { icon: `${mobile_sms_medium} icon-md color-sms`, count: '0.1M', ratio: '512:1' },
                { icon: `${social_facebook_medium} icon-md color-facebook`, count: '0.1M', ratio: '651:1' },
                { icon: `${social_twitter_medium} icon-md color-twitter`, count: '19,503', ratio: '689:1' },
            ],
        },
        {
            title: 'Conversion',
            count: '6,635',
            percentage: '0.02%',
            socialMedia: [
                { icon: `${email_medium} icon-md color-email`, count: '1,060', ratio: '2:1' },
                { icon: `${mobile_sms_medium} icon-md color-sms`, count: '1,091', ratio: '3:1' },
                { icon: `${social_facebook_medium} icon-md color-facebook`, count: '2,812', ratio: '5:1' },
                { icon: `${social_twitter_medium} icon-md color-twitter`, count: '982', ratio: '6:1' },
            ],
        },
    ],
};

export const handleBenchmarkList = (type, benchMark) => {
    switch (type) {
        case 'By channel':
            return channelList;
        case 'By communication':
            return communicationList;
        default:
            return benchMark;
    }
};

export const channelList = {
    chartType: {
        categories: ['Email', 'SMS'],
        seriesType: 'Benchmark',
        series: [
            {
                name: 'My Benchmark',
                color: ch_email,
                data: [37.68, 13],
            },
            {
                name: 'Current Communication',
                color: ch_sms,
                data: [28, 94],
            },
        ],
    },
    tableData: [
        {
            channel: 'Email',
            communicationVal: 38.2,
            diffVal: 21.8,
            benchVal: 60,
            icon: email_mini,
            color: 'color-sms',
            positive: false,
            imgPath: null,
        },
        {
            channel: 'SMS',
            communicationVal: 52.5,
            diffVal: 27.5,
            icon: mobile_sms_mini,
            color: 'color-email',
            benchVal: 25,
            positive: true,
            imgPath: null,
        },
        {
            channel: 'Facebook',
            communicationVal: 1.5,
            diffVal: 2.5,
            icon: social_facebook_mini,
            color: 'color-facebook',
            benchVal: 4,
            positive: true,
            imgPath: null,
        },
    ],
};

export const communicationList = {
    chartType: {
        categories: ['Benchmark'],
        series: [
            {
                name: '7F9',
                data: [33],
                color: '#e9e9eb',
            },
            {
                name: 'jhQ',
                data: [40],
                color: '#e9e9eb',
            },
            {
                name: 'b5b',
                data: [11],
                color: '#e9e9eb',
            },
            {
                name: 'csc',
                data: [0],
                color: '#e9e9eb',
            },
            {
                name: 'phc',
                data: [46],
                color: '#e9e9eb',
            },
            {
                name: 'iQJ',
                data: [60],
                color: '#e9e9eb',
            },
            {
                name: 'HZj',
                data: [47],
                color: '#e9e9eb',
            },
            {
                name: '4FC',
                data: [50],
                color: '#e9e9eb',
            },
            {
                name: 'Ibc',
                data: [69],
                color: '#e9e9eb',
            },
            {
                name: 'WhD',
                data: [21],
                color: '#e9e9eb',
            },
            {
                name: 'SDC Email SMS WP MP June 21 2023',
                data: [62],
                color: '#fd8f40',
            },
        ],
    },
    tableData: [
        {
            channel: 'Email',
            communicationVal: 38.2,
            diffVal: 21.8,
            benchVal: 60,
            icon: email_mini,
            positive: false,
            imgPath: null,
        },
        {
            channel: 'SMS',
            communicationVal: 52.5,
            diffVal: 27.5,
            icon: mobile_sms_mini,
            benchVal: 25,
            positive: true,
            imgPath: null,
        },
        {
            channel: 'Facebook',
            communicationVal: 1.5,
            diffVal: 2.5,
            icon: social_facebook_mini,
            benchVal: 4,
            positive: true,
            imgPath: null,
        },
    ],
};

export const uploadList = {
    chartType: {
        categories: [
            datesPrev13Days,
            '11th Aug',
            '13th Aug',
            '15th Aug',
            '17th Aug',
            '19th Aug',
            '21th Aug',
            '23th Aug',
            '25th Aug',
            '27th Aug',
            '29th Sep',
            '31th Sep',
            '01th Sep',
            '03th Sep',
            '05th Sep',
            '07th Sep',
            '09th Sep',
            '11th Sep',
            '13th Sep',
            '15th Sep',
        ],
        series: [
            {
                name: 'During communication period',
                data: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 45, 40, 35, 30, 25, 20, 15, 10, 5],
                color: '#e9e9eb',
            },
            {
                name: 'Before/after communication',
                data: [0, 0, 0, 0, 0, 0, 35, 40, 45, 50, 45, 40, 0, 0, 0, 0, 0],
                color: '#fd8f40',
            },
        ],
    },
    tableData: [],
};

// export const DETAIL_SUMMARY_TAB_CONFIG = [
//     { id: 1001, text: 'Email', disable: false, component: () => <CommunicationAnalysisTable /> },
//     { id: 1002, text: 'SMS', disable: false, component: () => <div>SMS</div> },
//     { id: 1003, text: 'Two-Way SMS (1)', disable: false, component: () => <div>Two-Way SMS (1)</div> },
//     { id: 1004, text: 'WhatsApp', disable: false, component: () => <div>WhatsApp</div> },
//     { id: 1005, text: 'Line', disable: false, component: () => <div>Line</div> },
//     { id: 1006, text: 'QR code', disable: false, component: () => <div>QR code</div> },
//     { id: 1007, text: 'FB app', disable: false, component: () => <div>FB app</div> },
//     { id: 1008, text: 'Facebook', disable: false, component: () => <div>Facebook</div> },
//     { id: 1009, text: 'X', disable: false, component: () => <div>Twitter</div> },
//     { id: 1010, text: 'Social media', disable: false, component: () => <div>Social media</div> },
// ];

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
    solidGDataPositive: {
        height: 150,
        width: 150,
        series: [
            {
                color: ch_positive,
                y: 65,
            },
        ],
    },
    solidGDataNeutural: {
        height: 150,
        width: 150,
        series: [
            {
                color: ch_neutral,
                y: 20,
            },
        ],
    },
    solidGDataNegative: {
        height: 150,
        width: 150,
        series: [
            {
                color: ch_negative,
                y: 15,
            },
        ],
    },
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

export const downloadIcons = [
    <i className={`${download_large} icon-md color-primary-blue`} id="rs_data_download" />,
    <i className={`${email_preview_large} icon-md color-primary-blue`} />,
];

export const addTabKey = (data) => {
    function addTypeToObjects(obj, type) {
        if (Array.isArray(obj)) {
            return obj.map((item) => ({ ...item, type: type }));
        }
    }
    for (const key in data) {
        data[key] = addTypeToObjects(data[key], key);
    }

    return data;
};

export const handleSnapshot = ['Take a snapshot', '2nd week of the communication'];
