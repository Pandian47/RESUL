import { UserImg10, UserImg2, UserImg3, UserImg8, UserImg9 } from 'Assets/Images';
import { daysCount } from 'Constants/Charts/commonFunction';
import { ch_all_audience, ch_clockchart1, ch_clockchart2, ch_color1, ch_color2, ch_color3, ch_color4, ch_color5, ch_email, ch_facebook, ch_mobile_push, ch_pinterest, ch_primary_green, ch_primary_orange, ch_qR_code, ch_secondary_blue, ch_secondary_green, ch_sms, ch_twitter, ch_web_push } from 'Constants/GlobalConstant/Colors/colorsVariable';
export const lastWeek = ['Last 7 days', 'Last 15 days', 'Last 30 days'];
export const socialMarketing = ['All channels', 'Email', 'SMS', 'Social media', 'Mobile push'];

export const dd_channelPerformance = ['Reach', 'Engagement', 'Conversion'];
export const dd_segments = ['Segments', 'Industry'];
export const dd_audience_behaviour = ['By week', 'By day'];
export const dd_top_performing_communication = ['Top performing communications', 'Low performing communications'];
export const dd_top_earning_communication = ['Top earning communications', 'Low earning communications'];
export const dd_advocates = ['Advocates', 'Spectators', 'Influencers', 'Critics'];
export const DDL_RECENT_DATA = ['Recent communications', 'Recently completed communications'];

export const topPerformingCommunication = [
    { name: 'Invest smartly, Save money ', count: 185, range: 'high' },
    { name: 'Fixed deposit renewal', count: 136, range: 'high' },
    { name: 'Young professionals', count: 112, range: 'high' },
    { name: 'Promotional offer', count: 105, range: 'high' },
    { name: 'Effortless mobile banking', count: 194, range: 'high' },
];

export const topEarningCommnications = [
    { name: 'Personal loans for this festive season', count: 5.1, currency: 'us' },
    { name: 'International travel card holders', count: 4.0, currency: 'us' },
    { name: 'Childs future', count: 2.7, currency: 'us' },
    { name: 'Vision bank special offers', count: 0.5, currency: 'us' },
    { name: 'Retirement plans awareness', count: 0.4, currency: 'us' },
];

export const advocates = [
    { name: 'Ethan Prince', text: 'Participated in 08 communications', count: '85', img: UserImg8 },
    { name: 'Rachel Gill', text: 'Participated in 08 communications', count: '65', img: UserImg3 },
    { name: 'David Chin', text: 'Participated in 07 communications', count: '76', img: UserImg2 },
    { name: 'Frank Hunt', text: 'Participated in 15 communications', count: '45', img: UserImg9 },
    { name: 'Victoria Olson', text: 'Participated in 08 communications', count: '86', img: UserImg10 },
];

export const COMMUNICATION_CHARTDATA = {
    roi_trend_areaspline_chartData: {
        xAxis: {
            title: '',
            // tickInterval: 4
        },
        yAxis: {
            title: '',
        },
        // categories: daysCount(30),
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        series: [
            {
                name: 'Communications',
                data: [200, 220, 190, 120, 160, 220, 180],
                color: ch_color1,
            },
        ],
    },
    lead_generated_chartData: {
        name: 'Leads generated',
        dataLabels: true,
        // icon: true,
        series: [
            { name: 'Email', color: ch_email, y: 7, z: 7 },
            { name: 'QR code', color: ch_qR_code, y: 12, z: 12 },
            { name: 'Pinterest', color: ch_pinterest, y: 15, z: 15 },
            { name: 'Facebook', color: ch_facebook, y: 20, z: 20 },
            { name: 'Twitter', color: ch_twitter, y: 40, z: 40 },
        ],
    },
    segments_pie_chartData: {
        // height: 286,
        series: [
            { name: 'Business', y: 21, color: ch_color1 },
            { name: 'Developer', y: 31, color: ch_color2 },
            { name: 'HOD', y: 12, color: ch_color3 },
            { name: 'Quality', y: 10, color: ch_color4 },
            { name: 'Others', y: 10, color: ch_color5 },
        ],
    },
    channel_performance_chartData: {
        categories: ['Credit card', 'Promotional offer', 'Fixed deposit renewal', 'Smart investment'],
        xAxis: {
            title: '',
        },
        yAxis: {
            title: '',
        },
        tooltip: {
            shared: true,
        },
        pointWidth: 20,
        series: [
            {
                name: 'Email',
                color: ch_email,
                data: [380, 130, 165, 96],
            },
            {
                name: 'SMS',
                color: ch_sms,
                data: [280, 81, 92, 138],
            },
            {
                name: 'Mobile push ',
                color: ch_mobile_push,
                data: [140, 125, 130, 125],
            },
            {
                name: 'Web push',
                color: ch_web_push,
                data: [80, 89, 55, 81],
            },
        ],
    },
    communcationPerformance_areaspline_chartData: {
        xAxis: {
            title: '',
            // tickInterval: 4
        },
        yAxis: {
            title: '',
        },
        categories: daysCount(7),
        series: [
            {
                name: 'Total audience',
                data: [432, 313, 463, 349, 415, 425, 422],
                color: ch_all_audience,
            },
            {
                name: 'Reach',
                data: [106, 107, 111, 133, 121, 167, 166],
                color: ch_secondary_blue,
            },
            {
                name: 'Engagement',
                data: [163, 103, 176, 108, 147, 129, 128],
                color: ch_primary_orange,
            },
            {
                name: 'Conversion',
                data: [163, 103, 176, 108, 147, 129, 128],
                color: ch_secondary_green,
            },
        ],
    },
    audienceBehviourhour_bubble_chartData: {
        series: [
            { name: 'Wed', value: 6.2 },
            { name: 'Tue', value: 8.6 },
            { name: 'Mon', value: 6.5 },
            { name: 'Sat', value: 38.5 },
            { name: 'Thu', value: 3.2 },
            { name: 'Sun', value: 31.9 },
            { name: 'Fri', value: 5.1 },
        ],
    },
    audienceBehviourhour_gauge_chartData: {
        series: [
            {
                from: 0,
                to: 24,
                color: '#e8e8ea',
                outerRadius: '105%',
                thickness: '5%',
            },
            {
                from: 7,
                to: 8,
                color: ch_secondary_green,
                outerRadius: '105%',
                thickness: '5%',
            },
            {
                from: 9,
                to: 10,
                color: ch_primary_green,
                outerRadius: '105%',
                thickness: '5%',
            },
            {
                from: 10,
                to: 11,
                color: ch_clockchart1,
                outerRadius: '105%',
                thickness: '5%',
            },
            {
                from: 11,
                to: 12,
                color: ch_clockchart2,
                outerRadius: '105%',
                thickness: '5%',
            },
        ],
        data: [9, 10],
    },
};
