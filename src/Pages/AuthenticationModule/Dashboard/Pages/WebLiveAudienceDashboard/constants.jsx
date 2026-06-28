import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { formatPercentageDisplay } from 'Utils/modules/formatters';
import { safeObjectKeys } from 'Utils/modules/misc';
import { chartSizing, daysCount, seriesNameField, weekDaysColors } from 'Constants/Charts/commonFunction';
import { ch_all_audience, ch_call_center, ch_clockchart1, ch_clockchart2, ch_color1, ch_color2, ch_color4, ch_convertedColor, ch_dark_blue_green, ch_email, ch_identifiedColor, ch_knownColor, ch_mobile_push, ch_neutral, ch_primary_green, ch_primary_red, ch_secondary_green, ch_sms, ch_tertiary_grey, ch_unKnownColor } from 'Constants/GlobalConstant/Colors/colorsVariable';
export const dd_retention = ['Known', 'Unknown', 'Identified'];
export const dd_top_page_views = ['Top page views', 'Top drop-off pages'];

// const entireValues = {
//     city: city,
//     device: device,
//     usertype: userType,
//     productcategory: prodType,
//     communicationtype: comType,
// };

export const WEB_LIVE_DASHBOARD_DATA = {
    visitorBarChartWebData: {
        xAxis: {},
        yAxis: {
            tickInterval: 3000,
        },
        categories: ['Chrome', 'Edge', 'Firefox', 'Others'],
        series: [
            {
                name: 'In-active',
                data: [7292, 3000, 1558, 742],
                color: ch_tertiary_grey,
            },
            {
                name: 'Active',
                data: [5000, 3200, 1800, 790],
                color: ch_secondary_green,
            },
        ],
    },
    // Dashboard statick js
    active_visitor_live_ChartMobData: {
        height: 270,
        xAxis: {
            title: '',
            categories: ['iPhone', 'iPad', 'Android phone', 'Android tab'],
            labels: true,
        },
        yAxis: {
            // labelFormat: '{value}k',
            labels: true,
            // tickInterval: 3000,
        },
        legend: {
            enabled: true,
            reverse: true,
            y: -15,
        },
        series: [
            { name: 'In-active', data: [10292, 5168, 2558, 1742] },
            { name: 'Active', data: [1200, 800, 300, 177] },
        ],
    },
    // Dashboard statick js

    // Active visitor traffic
    // AREA CHART
    active_visitor_traffic_ChartWebData: {
        height: chartSizing['area'],
        xAxis: {
            title: '',
        },
        categories: daysCount(10),
        yAxis: {
            title: '',
            tickInterval: 500,
        },
        series: [
            {
                name: 'Direct traffic',
                data: [5587, 8754, 9987, 7875, 7354, 7877, 6157],
                color: ch_color1,
            },
            {
                name: 'Referring links',
                data: [76, 199, 245, 188, 288, 480, 258],
                color: ch_color2,
            },
            {
                name: 'Social networks',
                data: [4, 15, 50, 63, 35, 29, 9],
                color: ch_neutral,
            },
            {
                name: 'Organic search',
                data: [2758, 4587, 6587, 5125, 4145, 4544, 3845],
                color: ch_color4,
            },
            {
                name: 'Others',
                data: [144, 205, 542, 478, 678, 668, 375],
                color: ch_primary_red,
            },
        ],
    },

    // SANKEY
    pathAnalyser_sankey_chart_data: {
        series: [
            { from: 'Awareness', to: 'Los Angeles', value: 320 },
            { from: 'Awareness', to: 'Chicago', value: 120 },
            { from: 'Greetings', to: 'California', value: 420 },
            { from: 'Greetings', to: 'Illinois', value: 120 },
            { from: 'New product launch', to: 'California', value: 320 },
            { from: 'Promotion', to: 'California', value: 120 },
            { from: 'Sale', to: 'Chicago', value: 350 },
            { from: 'Events', to: 'Los Angeles', value: 220 },
            { from: 'Events', to: 'Illinois', value: 450 },

            { from: 'Los Angeles', to: 'Mobile', value: 112 },
            { from: 'Los Angeles', to: 'Browser', value: 433 },
            { from: 'Los Angeles', to: 'Tablet', value: 233 },
            { from: 'Chicago', to: 'iPad', value: 350 },
            { from: 'California', to: 'Mobile', value: 756 },
            { from: 'California', to: 'Tablet', value: 256 },
            { from: 'Illinois', to: 'iPad', value: 505 },

            { from: 'Mobile', to: 'Known', value: 622 },
            { from: 'Mobile', to: 'Unknown', value: 322 },
            { from: 'Browser', to: 'Known', value: 322 },
            { from: 'Browser', to: 'Unknown', value: 250 },
            { from: 'Tablet', to: 'Unknown', value: 121 },
            { from: 'iPad', to: 'Known', value: 275 },
            { from: 'iPad', to: 'Unknown', value: 423 },

            { from: 'Known', to: 'Mutual fund', value: 124 },
            { from: 'Known', to: 'Credit card', value: 268 },
            { from: 'Known', to: 'Fixed deposit', value: 246 },
            { from: 'Known', to: 'Loans', value: 414 },
            { from: 'Unknown', to: 'Mutual fund', value: 366 },
            { from: 'Unknown', to: 'Credit card', value: 163 },
            { from: 'Unknown', to: 'Loans', value: 166 },
        ],
    },

    // Key metrics
    // Active users

    // pathAnalyserData

    // Audience types
    // PIE CHART
    activeTypesPieChartWebData: {
        // height: 290,
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

    // RETENTION
    retentionData: {
        header: ['Date', 'Known', '1 Day', '2 Days', '3 Days', '4 Days', '5 Days'],
        body: [
            {
                date: 'Mar 23, 2024',
                known: '78',
                day1: '10',
                day2: '35',
                day3: '13',
                day4: '15',
                day5: '5',
            },
            {
                date: 'Mar 22, 2024',
                known: '89',
                day1: '37',
                day2: '13',
                day3: '20',
                day4: '59',
                day5: '10',
            },
            {
                date: 'Mar 21, 2024',
                known: '68',
                day1: '20',
                day2: '24',
                day3: '13',
                day4: '11',
                day5: '0',
            },
            {
                date: 'Mar 20, 2024',
                known: '64',
                day1: '32',
                day2: '19',
                day3: '13',
                day4: '4',
                day5: '2',
            },
            {
                date: 'Mar 19, 2024',
                known: '46',
                day1: '24',
                day2: '19',
                day3: '1',
                day4: '1',
                day5: '1',
            },
        ],
    },

    // Audience conversion
    // PYRAMID CHART
    audienceConversionPyramidChartWebData: {
        series: [
            { name: 'Unknown users', y: 254, color: ch_unKnownColor },
            { name: 'Known users', y: 203, color: ch_knownColor },
            { name: 'Identified users', y: 144, color: ch_identifiedColor },
            { name: 'Converted', y: 108, color: ch_convertedColor },
        ],
    },

    // Top screen views
    // topScreenViewsDropDown: ['Low performing communications'],
    topScreenViews: [
        { name: 'My account', count: '89,942', range: 'high' },
        { name: 'Bill pay & recharge', count: '62,706', range: 'low' },
        { name: 'Apply now', count: '58,537', range: 'high' },
        { name: 'Locate branches & ATM', count: '28,603', range: 'high' },
        { name: 'Contact us', count: '21,942', range: 'high' },
    ],

    // Top event summary
    // topEventSummaryDropDown: ['Low performing communications'],
    topEventSummary: [
        { name: 'Check eligibility', count: '23,236', currency: 'us' },
        { name: 'Personal loan submit', count: '21,849', currency: 'us' },
        { name: 'Lead generate', count: '19,647', currency: 'us' },
        { name: 'Apply credit card', count: '16,838', currency: 'us' },
        { name: 'Fixed deposit action', count: '13,871', currency: 'us' },
    ],

    // Progressive profile
    // PYRAMID CHART
    progressiveProfilePyramidChartWebData: {
        reversed: true,
        series: [
            { name: 'Demographic', y: 1788, color: '#66c7ea' },
            { name: 'Engagement', y: 1998, color: '#5ab5e6' },
            { name: 'Product interest', y: 2001, color: '#4e9ce0' },
            { name: 'Social referral', y: 2002, color: '#3568c6' },
            { name: 'Purchase intent', y: 1565, color: '#132385' },
        ],
    },

    // By Interest
    // PIE CHART
    byInterestPieChartWebData: {
        // height: 290,
        series: [
            { name: 'Health', y: 12, color: ch_sms },
            { name: 'Investments', y: 23, color: ch_mobile_push },
            { name: 'Banking', y: 32, color: ch_all_audience },
            { name: 'Travel', y: 54, color: ch_email },
            { name: 'Others', y: 43, color: ch_primary_red },
        ],
    },

    // App versions
    // PIE CHART
    appVersionPieChartWebData: {
        series: [
            { name: 'v1.0', y: 31 },
            { name: 'v2.0', y: 21 },
            { name: 'v3.0', y: 12 },
            { name: 'Others', y: 36 },
        ],
    },

    // OS versions
    // PIE CHART
    osVersionPieChartWebData: {
        // height: 290,
        series: [
            { name: 'Android 1.9.11', y: 55 },
            { name: 'Android 1.9.10', y: 18 },
            { name: 'iOS 1.8.2', y: 14 },
            { name: 'iOS 1.8.1', y: 13 },
        ],
    },

    // By device
    // PIE CHART
    byDevicePieChartWebData: {
        // height: 290,
        series: [
            { name: 'Mobile', y: 434 },
            { name: 'Desktop', y: 324 },
            { name: 'Laptop', y: 542 },
            { name: 'Tablet', y: 224 },
            { name: 'Others', y: 43 },
        ],
    },

    // By browser
    // PIE CHART
    byBrowserPieChartWebData: {
        // height: 290,
        series: [
            { name: 'Chrome', y: 235, color: ch_dark_blue_green },
            { name: 'Edge', y: 543, color: ch_mobile_push },
            { name: 'Firefox', y: 623, color: ch_email },
            { name: 'Safari', y: 235, color: ch_call_center },
            { name: 'Others', y: 190, color: ch_primary_red },
        ],
    },

    // Usage behaviour / By days
    // COLUMN CHART
    usageBehaviourColumnChartWebData: {
        // height: 300,
        categories: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        colors: weekDaysColors,
        // xAxis: {
        //     title: 'Days',
        // },
        yAxis: {
            title: 'Engagement ( % )',
        },
        legend: {
            enabled: false,
        },
        series: [
            {
                name: 'Communication period',
                data: [25, 8, 13.5, 8, 13, 12.5, 20],
                // color: 'red'
            },
        ],
    },

    // Usage behaviour / By hours
    // GAUGE CHART
    byHoursGaugeChartWebData: {
        height: 300,
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

export const webtempData = {
    _key: 'naturali.co.in',
    productInterestList: [
        {
            productInterestList:
                '[{"Product_Interest": {"Hair and skin Care": 553, "others": 102, "Conditioner": 49, "Conditioner others": 7}, "_key": "naturali.co.in_Product", "CreatedAt": "2024-05-02 00:00:05"}]',
        },
    ],
    productAnalyticksWeb: [
        {
            productAnalyticksWeb:
                '[{"Product_Analytics": {"children": [{"name": "Combos", "size": 0, "children": [{"name": "combos naturali", "size": 0}, {"name": "all day pollution defence duo face cream sunscreen", "size": 0}, {"name": "daily purifying active skincare duo face wash sunscreen", "size": 0}, {"name": "dandruff shield nourish combo small", "size": 0}, {"name": "dandruff shield nourish combo large", "size": 0}, {"name": "nourish repair combo small", "size": 0}, {"name": "flake frizz control duo small", "size": 0}, {"name": "nourish repair combo large", "size": 0}, {"name": "flake frizz control duo large", "size": 0}, {"name": "daily nourish pollution block combo small", "size": 0}, {"name": "cleanse condition combo small", "size": 0}, {"name": "pollution protect repair duo small", "size": 0}, {"name": "dandruff pollution control duo small", "size": 0}, {"name": "daily nourish pollution block combo large", "size": 0}, {"name": "cleanse condition combo large", "size": 0}, {"name": "pollution protect repair duo large", "size": 0}, {"name": "dandruff pollution control duo large", "size": 0}, {"name": "pollution defence skincare duo face wash face cream", "size": 0}]}, {"name": "Conditioner", "size": 49, "children": [{"name": "naturali damage repair conditioner", "size": 1}, {"name": "naturali pollution defence shampoo", "size": 7}, {"name": "daily purifying face wash", "size": 46}, {"name": "daily purifying face wash 1", "size": 0}, {"name": "not_show_1200052", "size": 0}, {"name": "free_survey daily purifying face wash 100ml", "size": 0}, {"name": "naturali hydrating oil control face wash", "size": 0}, {"name": "pollution defence daily moisturizing face cream", "size": 0}, {"name": "pollution defence face wash", "size": 0}, {"name": "pollution defence facewash", "size": 2}, {"name": "naturali refreshing oil control face wash", "size": 0}, {"name": "sample product", "size": 0}, {"name": "surprise gift box", "size": 0}, {"name": "test", "size": 0}, {"name": "tet daily purifying face wash", "size": 0}, {"name": "tet daily purifying face wash", "size": 0}]}, {"name": "Hair and skin Care", "size": 553, "children": [{"name": "naturali daily strength nourish conditioner", "size": 0}, {"name": "daily strength nourish duo shampoo conditioner", "size": 0}, {"name": "naturali daily strength nourish shampoo", "size": 0}, {"name": "damage repair conditioner", "size": 10}, {"name": "damage repair duo shampoo conditioner", "size": 0}, {"name": "damage repair shampoo", "size": 36}, {"name": "dandruff defence shampoo", "size": 90}, {"name": "hair fall arrest conditioner", "size": 114}, {"name": "hair fall arrest shampoo", "size": 248}, {"name": "hair fall arrest shampoo 340ml and conditioner 180ml", "size": 0}, {"name": "hair fall arrest duo shampoo conditioner", "size": 0}, {"name": "copy of damage repair shampoo with moringa oil avocado", "size": 0}, {"name": "copy of naturali daily strength nourish shampoo 180ml damage repair conditioner 180ml", "size": 0}, {"name": "naturali daily strength nourish shampoo 340ml damage repair conditioner 180ml", "size": 0}, {"name": "damage repair conditioner 1", "size": 0}, {"name": "naturali damage repair shampoo", "size": 26}, {"name": "hair damage repair duo small", "size": 0}, {"name": "hair damage repair duo", "size": 0}, {"name": "dandruff defence shampoo 1", "size": 0}, {"name": "scalp hair rescue duo small", "size": 0}, {"name": "scalp hair rescue duo large", "size": 0}, {"name": "hair fall arrest conditioner 1", "size": 0}, {"name": "hair fall arrest shampoo 1", "size": 0}, {"name": "hair fall arrest shampoo 1", "size": 0}, {"name": "anti hairfall nourishment combo small", "size": 0}, {"name": "anti hairfall damage repair duo small", "size": 0}, {"name": "hairfall dandruff control duo small", "size": 0}, {"name": "hairfall arrest combo small", "size": 0}, {"name": "hairfall pollution control combo small", "size": 0}, {"name": "anti hairfall nourishment combo large", "size": 0}, {"name": "anti hairfall damage repair duo large", "size": 0}, {"name": "hairfall dandruff control duo large", "size": 0}, {"name": "hairfall arrest combo large", "size": 0}, {"name": "hairfall pollution control combo large", "size": 0}, {"name": "pollution defence shampoo 1", "size": 0}, {"name": "pollution defence conditioner", "size": 0}, {"name": "pollution defence duo shampoo conditioner", "size": 0}, {"name": "pollution defence shampoo", "size": 29}, {"name": "hair fall reduction loaded with the goodness", "size": 0}]}, {"name": "Gift Card", "size": 0, "children": [{"name": "gift card", "size": 0}, {"name": "gift card 1", "size": 0}]}, {"name": "Lotion & Sunscreen", "size": 0, "children": [{"name": "intense moisturizing body lotion", "size": 0}, {"name": "pollution defence sunscreen with spf", "size": 0}, {"name": "sun pollution defence body lotion", "size": 0}]}, {"name": "others", "size": 102, "children": [{"name": "naturali nourishing and toxin free hair and skin care", "size": 74}, {"name": "collections naturali", "size": 0}, {"name": "all products naturali", "size": 28}, {"name": "contact us naturali", "size": 0}, {"name": "addresses naturali", "size": 0}, {"name": "account naturali", "size": 0}, {"name": "create account naturali", "size": 0}, {"name": "welcome to naturali", "size": 0}, {"name": "404 not found naturali", "size": 0}, {"name": "reset account naturali", "size": 0}, {"name": "all shampoos naturali", "size": 0}, {"name": "best body lotion for women in india naturali", "size": 0}, {"name": "search 14 results found for conditioner naturali", "size": 0}, {"name": "best face wash for oily skin for women in india naturali", "size": 0}, {"name": "all conditioners naturali", "size": 0}, {"name": "avocado the superfood for healthy beautiful hair naturali", "size": 0}, {"name": "naturali pollution defence shampoo", "size": 7}, {"name": "challenge naturali", "size": 0}, {"name": "buy natural hair fall arrest conditioner in india naturali", "size": 0}, {"name": "experts swear by these 3 steps to keep dandruff at bay naturali", "size": 0}, {"name": "all facewash naturali", "size": 0}, {"name": "causes of hairloss and some important preventive tips for keeping good naturali", "size": 0}, {"name": "natural chemical free hair face body care products naturali", "size": 0}, {"name": "search 0 results found for face toner naturali", "size": 0}, {"name": "search 0 results found for ketochlorshampoo naturali", "size": 0}, {"name": "search 0 results found for face wash naturali", "size": 0}, {"name": "search 0 results found for moisturizer naturali", "size": 0}]}]}, "_key": "naturali.co.in_Analytics", "CreatedAt": "2024-05-02 00:00:05"}]',
        },
    ],
    progressiveProfileWeb: [
        {
            tokensArrayprofile:
                '[{"Product_Interest": {"Interest_Audience": 568, "Total_Audience": 31314}, "Purchase_Intent": {"Intent_Audience": 850, "Total_Audience": 19661}, "_key": "naturali.co.in_Purchase", "CreatedAt": "2024-05-02 00:00:05"}]',
        },
    ],
    audienceConversionWeb: [
        {
            Unknown: 12849,
            Known: 2419,
            Identified: 0,
            Converted: 0,
        },
    ],
    byDaysCountWeb: [
        {
            dayName: 'Mon',
            dayWiseCount: '865',
        },
        {
            dayName: 'Tue',
            dayWiseCount: '891',
        },
        {
            dayName: 'Wed',
            dayWiseCount: '1816',
        },
        {
            dayName: 'Thu',
            dayWiseCount: '758',
        },
        {
            dayName: 'Fri',
            dayWiseCount: '833',
        },
        {
            dayName: 'Sat',
            dayWiseCount: '840',
        },
        {
            dayName: 'Sun',
            dayWiseCount: '907',
        },
    ],
    webLiveVisitorsList: [
        {
            TotalWebLiveVisitors: 17966,
        },
    ],
    retentionidentifieMobile: null,
    retentionknownMobile: null,
    retentionidentifieWeb: [
        {
            retention_date: '2024-05-01 12:00:00 AM',
            total_identified: '0',
            day1_identified: '0',
            day2_identified: '0',
            day3_identified: '0',
            day4_identified: '0',
            day5_identified: '0',
        },
        {
            retention_date: '2024-04-30 12:00:00 AM',
            total_identified: '0',
            day1_identified: '0',
            day2_identified: '0',
            day3_identified: '0',
            day4_identified: '0',
            day5_identified: '0',
        },
        {
            retention_date: '2024-04-29 12:00:00 AM',
            total_identified: '0',
            day1_identified: '0',
            day2_identified: '0',
            day3_identified: '0',
            day4_identified: '0',
            day5_identified: '0',
        },
        {
            retention_date: '2024-04-28 12:00:00 AM',
            total_identified: '0',
            day1_identified: '0',
            day2_identified: '0',
            day3_identified: '0',
            day4_identified: '0',
            day5_identified: '0',
        },
        {
            retention_date: '2024-04-27 12:00:00 AM',
            total_identified: '0',
            day1_identified: '0',
            day2_identified: '0',
            day3_identified: '0',
            day4_identified: '0',
            day5_identified: '0',
        },
    ],
    retentionunknownWeb: [
        {
            retention_date: '2024-05-01 12:00:00 AM',
            total_unknown: '478',
            day1_unknown: '478',
            day2_unknown: '0',
            day3_unknown: '0',
            day4_unknown: '0',
            day5_unknown: '0',
        },
        {
            retention_date: '2024-04-30 12:00:00 AM',
            total_unknown: '450',
            day1_unknown: '450',
            day2_unknown: '0',
            day3_unknown: '0',
            day4_unknown: '0',
            day5_unknown: '0',
        },
        {
            retention_date: '2024-04-29 12:00:00 AM',
            total_unknown: '433',
            day1_unknown: '433',
            day2_unknown: '0',
            day3_unknown: '0',
            day4_unknown: '0',
            day5_unknown: '0',
        },
        {
            retention_date: '2024-04-28 12:00:00 AM',
            total_unknown: '474',
            day1_unknown: '474',
            day2_unknown: '0',
            day3_unknown: '0',
            day4_unknown: '0',
            day5_unknown: '0',
        },
        {
            retention_date: '2024-04-27 12:00:00 AM',
            total_unknown: '409',
            day1_unknown: '409',
            day2_unknown: '0',
            day3_unknown: '0',
            day4_unknown: '0',
            day5_unknown: '0',
        },
    ],
    retentionknownWeb: [
        {
            retention_date: '2024-05-01 12:00:00 AM',
            total_known: '367',
            day1_known: '211',
            day2_known: '67',
            day3_known: '39',
            day4_known: '25',
            day5_known: '25',
        },
        {
            retention_date: '2024-04-30 12:00:00 AM',
            total_known: '348',
            day1_known: '219',
            day2_known: '57',
            day3_known: '28',
            day4_known: '26',
            day5_known: '18',
        },
        {
            retention_date: '2024-04-29 12:00:00 AM',
            total_known: '341',
            day1_known: '199',
            day2_known: '54',
            day3_known: '43',
            day4_known: '28',
            day5_known: '17',
        },
        {
            retention_date: '2024-04-28 12:00:00 AM',
            total_known: '356',
            day1_known: '226',
            day2_known: '47',
            day3_known: '43',
            day4_known: '24',
            day5_known: '16',
        },
        {
            retention_date: '2024-04-27 12:00:00 AM',
            total_known: '352',
            day1_known: '221',
            day2_known: '60',
            day3_known: '28',
            day4_known: '33',
            day5_known: '10',
        },
    ],
    knownUserWeb: [
        {
            knownUsersCount: 7536,
            identifiedUsersCount: 0,
            unKnownCount: 12849,
        },
    ],
    userDevices: [
        {
            activeUsers: null,
            dau: 928,
            wau: 6016,
            mau: 26199,
        },
    ],
    userScreens: [
        {
            avgSeconds: '163',
            pageUrl: 'https://naturali.co.in/products/naturali-hair-fall-arrest-shampoo',
        },
        {
            avgSeconds: '83',
            pageUrl: 'https://naturali.co.in/products/pollution-defence-facewash',
        },
        {
            avgSeconds: '70',
            pageUrl: 'https://naturali.co.in/57923076283/orders/80bd3358e35063296d3549b9ec73b5b6',
        },
        {
            avgSeconds: '68',
            pageUrl: 'https://naturali.co.in/',
        },
        {
            avgSeconds: '58',
            pageUrl: 'https://naturali.co.in/57923076283/orders/247ade1fc941a9a5a4249f9d7d030d20',
        },
    ],
    dayWiseCounts: [
        {
            date: '2024-04-25',
            dayWiseCount: null,
            DirectTraffic: '639',
            ReferringLinks: '0',
            SocialNetworks: '1',
            OrganicSearch: '121',
            Others: '1',
        },
        {
            date: '2024-04-26',
            dayWiseCount: null,
            DirectTraffic: '699',
            ReferringLinks: '0',
            SocialNetworks: '3',
            OrganicSearch: '133',
            Others: '0',
        },
        {
            date: '2024-04-27',
            dayWiseCount: null,
            DirectTraffic: '709',
            ReferringLinks: '0',
            SocialNetworks: '0',
            OrganicSearch: '131',
            Others: '0',
        },
        {
            date: '2024-04-28',
            dayWiseCount: null,
            DirectTraffic: '792',
            ReferringLinks: '0',
            SocialNetworks: '0',
            OrganicSearch: '115',
            Others: '2',
        },
        {
            date: '2024-04-29',
            dayWiseCount: null,
            DirectTraffic: '749',
            ReferringLinks: '0',
            SocialNetworks: '6',
            OrganicSearch: '114',
            Others: '1',
        },
        {
            date: '2024-04-30',
            dayWiseCount: null,
            DirectTraffic: '779',
            ReferringLinks: '0',
            SocialNetworks: '1',
            OrganicSearch: '113',
            Others: '0',
        },
        {
            date: '2024-05-01',
            dayWiseCount: null,
            DirectTraffic: '801',
            ReferringLinks: '0',
            SocialNetworks: '0',
            OrganicSearch: '131',
            Others: '0',
        },
    ],
    hourWiseCounts: [
        {
            createdDate: null,
            hour: '0',
            hourWiseCount: '207',
        },
        {
            createdDate: null,
            hour: '1',
            hourWiseCount: '457',
        },
        {
            createdDate: null,
            hour: '2',
            hourWiseCount: '781',
        },
        {
            createdDate: null,
            hour: '3',
            hourWiseCount: '1102',
        },
        {
            createdDate: null,
            hour: '4',
            hourWiseCount: '1448',
        },
        {
            createdDate: null,
            hour: '5',
            hourWiseCount: '1731',
        },
        {
            createdDate: null,
            hour: '6',
            hourWiseCount: '1859',
        },
        {
            createdDate: null,
            hour: '7',
            hourWiseCount: '1830',
        },
        {
            createdDate: null,
            hour: '8',
            hourWiseCount: '1639',
        },
        {
            createdDate: null,
            hour: '9',
            hourWiseCount: '1533',
        },
        {
            createdDate: null,
            hour: '10',
            hourWiseCount: '1539',
        },
        {
            createdDate: null,
            hour: '11',
            hourWiseCount: '1417',
        },
        {
            createdDate: null,
            hour: '12',
            hourWiseCount: '1371',
        },
        {
            createdDate: null,
            hour: '13',
            hourWiseCount: '1371',
        },
        {
            createdDate: null,
            hour: '14',
            hourWiseCount: '1257',
        },
        {
            createdDate: null,
            hour: '15',
            hourWiseCount: '1312',
        },
        {
            createdDate: null,
            hour: '16',
            hourWiseCount: '1472',
        },
        {
            createdDate: null,
            hour: '17',
            hourWiseCount: '1386',
        },
        {
            createdDate: null,
            hour: '18',
            hourWiseCount: '1016',
        },
        {
            createdDate: null,
            hour: '19',
            hourWiseCount: '739',
        },
        {
            createdDate: null,
            hour: '20',
            hourWiseCount: '400',
        },
        {
            createdDate: null,
            hour: '21',
            hourWiseCount: '214',
        },
        {
            createdDate: null,
            hour: '22',
            hourWiseCount: '159',
        },
        {
            createdDate: null,
            hour: '23',
            hourWiseCount: '161',
        },
    ],
    screenWiseCountList: [
        {
            pageViews: '34102',
            Sessions: '26199',
            AvgTimeSpent: '00:00:22',
            AvgPageBySession: '1',
        },
    ],
    screenSessionCountList: [],
    deviceWiseCountsdkList: [],
    deviceLocationsList: [],
    websiteVisitorsList: [],
    webWiseCountCustList: [
        {
            DeviceType: 'Mobile',
            DeviceWiseCount: 12865,
        },
        {
            DeviceType: 'Tablet',
            DeviceWiseCount: 4217,
        },
        {
            DeviceType: 'Desktop/Laptop',
            DeviceWiseCount: 912,
        },
    ],
    webVersionList: [
        {
            browsername: 'Chrome',
            browserWiseCount: 16581,
        },
        {
            browsername: 'Safari',
            browserWiseCount: 1302,
        },
        {
            browsername: 'Edge',
            browserWiseCount: 27,
        },
        {
            browsername: 'Opera',
            browserWiseCount: 22,
        },
        {
            browsername: 'Others',
            browserWiseCount: 18,
        },
    ],
    webuserTypeList: null,
    eventCountWebList: [
        {
            eventName: 'Add to Cart',
            maxEventCount: '585476',
        },
        {
            eventName: 'Checkout',
            maxEventCount: '353386',
        },
    ],
    topSourceswebList: [],
};

export const Format_active_visitor_traffic_ChartData = (data) => {
    const sortDayWiseData = data?.sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
    });

    const seriesData = [];

    const keys = Object.keys(sortDayWiseData[0]);

    keys.forEach((key) => {
        if (key !== 'date' && key !== 'dayWiseCount') {
            seriesData.push({
                name: seriesNameField(key) ?? key,
                data: data.map((obj) => Number(obj[key])),
            });
        }
    });

    const categoryDate = sortDayWiseData?.map((item) => item?.date);

    // function formatDateArray(dateArray) {
    //     const formattedDates = dateArray.map((dateString) => {
    //         const [year, month, day] = dateString.split('-');
    //         const date = new Date(year, month - 1, day);
    //         const options = { day: 'numeric', month: 'short' };
    //         const formattedDate = date.toLocaleDateString('en-US', options);
    //         return formattedDate.replace(/(\d+)(th|st|nd|rd)/, '$1$2');
    //     });
    //     return formattedDates;
    // }
     const formatDate = categoryDate?.map((dateString) => {
            const formatted = getUserCurrentFormat(dateString);
            return formatted?.dateFormat;
        });

    return {
        height: 220,
        xAxis: {
            title: '',
            tickInterval: 0,
        },
        categories: formatDate,
        yAxis: {
            title: '',
            // tickInterval: 500
        },
        series: seriesData,
    };
};

export const FormatPieChartData = (data) => {
    const seriesData = data?.map((item) => ({
        name: item?.browsername || item?.DeviceType,
        y: Number(item?.browserWiseCount) || Number(item?.DeviceWiseCount),
    }));

    // console.log(seriesData, 'seriesData');
    return {
        series: seriesData,
    };
};

export const isAllValuesZero = (data) => {
    if (!data || (Array.isArray(data) && data.length === 0)) return true;
    if (!Array.isArray(data)) return true;

    return data.every((item) =>
        Object.values(item || {}).every((value) => {
            if (value == null || value === '') return true;
            const num = Number(value);
            if (Number.isNaN(num)) return true;
            return num === 0;
        }),
    );
};

export const hasChartData = (data) => !isAllValuesZero(data);

export const hasProgressiveProfileWebData = (webData) => {
    const tokens = webData?.progressiveProfileWeb?.[0]?.tokensArrayprofile;
    if (!tokens) return false;
    try {
        const parsed = JSON.parse(tokens);
        if (!Array.isArray(parsed) || parsed.length === 0) return false;

        const dataObject = parsed[0];
        if (!dataObject || typeof dataObject !== 'object') return false;

        return Object.values(dataObject).some((item) =>
            Object.values(item || {}).some((value) => {
                const num = Number(value);
                return !Number.isNaN(num) && num > 0;
            }),
        );
    } catch {
        return false;
    }
};

export const hasProductInterestWebData = (webData) => {
    const jsonString = webData?.productInterestList?.[0]?.productInterestList;
    if (!jsonString) return false;
    try {
        const parsed = JSON.parse(jsonString);
        return parsed?.some((item) =>
            Object.values(item?.Product_Interest ?? {}).some((value) => Number(value) > 0),
        );
    } catch {
        return false;
    }
};

export const FormatAudienceConversionChartData = (data) => {
    const keys = safeObjectKeys(data?.[0]);

    let seriesData = [];

    keys.forEach((key) => {
        seriesData.push({
            name: seriesNameField(key),
            y: data[0][key],
        });
    });

    const series = seriesData.filter((item) => item?.y >= 0);

    return {
        series,
    };
};

export const FormatAudienceConversionPyramidChartData = (data) => {
    const keys = safeObjectKeys(data?.[0]);

    let series = [];

    keys.forEach((key) => {
        series.push({
            name: key,
            y: data[0][key],
        });
    });

    return {
        series,
    };
};

export const FormatKnownRetentionData = (data) => {
    let title;

    if (data && data?.length > 0) {
        const keyNames = Object.keys(data[0]);
        if (keyNames[1].includes('total_known')) title = 'Known';
        else if (keyNames[1].includes('total_identified')) title = 'Identified';
        else if (keyNames[1].includes('total_unknown')) title = 'Unknown';
    }

    const header = ['Date', title ?? 'Known', '1 Day', '2 Days', '3 Days', '4 Days', '5 Days'];

    const transformedData = {
        header: header,
        body: [],
    };

    if (data && data?.length > 0) {
        data.forEach((entry) => {
            const retention_date = entry?.retention_date.split(' ')[0];
            const retention_date_formatted = getUserCurrentFormat(new Date(retention_date))?.dateFormat;
            const transformedEntry = {
                date: retention_date_formatted,
                known: Math.abs(entry?.total_known || entry?.total_identified || entry?.total_unknown || 0),
                day1: Math.abs(entry?.day1_known || entry?.day1_identified || entry?.day1_unknown || 0),
                day2: Math.abs(entry?.day2_known || entry?.day2_identified || entry?.day2_unknown || 0),
                day3: Math.abs(entry?.day3_known || entry?.day3_identified || entry?.day3_unknown || 0),
                day4: Math.abs(entry?.day4_known || entry?.day4_identified || entry?.day4_unknown || 0),
                day5: Math.abs(entry?.day5_known || entry?.day5_identified || entry?.day5_unknown || 0),
            };
            transformedData.body.push(transformedEntry);
        });
    }

    return transformedData;
};

export const FormatByInterestPieChartData = (data) => {
    const keys = safeObjectKeys(data?.[0]?.Product_Interest);

    let seriesData = [];

    keys.forEach((key) => {
        seriesData.push({
            name: key,
            y: data[0]['Product_Interest'][key],
        });
    });

    const series = seriesData.filter((item) => item?.y > 0);

    return {
        series,
    };
};

export const FormatProgressivePymaridChartMobData = (data) => {
    const keys = Object.keys(data[0]);

    const seriesData = [];

    keys.forEach((key) => {
        if (key !== 'CreatedAt' && key !== '_key') {
            const formattedKey = key.replace(/_/g, ' ');
            seriesData.push({
                name: formattedKey,
                y: data[0][key]?.Interest_Audience || data[0][key]?.Intent_Audience,
            });
        }
    });

    // const series = seriesData.filter(item => item?.y > 0);

    return {
        reversed: true,
        series: seriesData,
    };
};

// export const FormatgetUserBehaviorByDays = (data) => {
//     const days = data?.map((item) => {
//         return item?.dayName;
//     });

//     const seriesData = data?.map((item) => {
//         return Number(item?.dayWiseCount);
//     });

//     return {
//         height: 330,
//         categories: days,
//         colors: weekDaysColors,

//         yAxis: {
//             title: 'Engagement ( % )',
//         },
//         legend: {
//             enabled: false,
//         },
//         series: [
//             {
//                 name: 'Count',
//                 data: seriesData,
//             },
//         ],
//     };
// };
export const FormatgetUserBehaviorByDays = (data, percent = false) => {
    const allDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const dayCounts = {};
    data?.forEach((item) => {
        dayCounts[item?.dayName] = Number(item?.dayWiseCount) || 0;
    });

    const total = Object.values(dayCounts).reduce((acc, val) => acc + val, 0);

    const rawSeries = allDays.map((day) => dayCounts[day] || 0);

    const percentSeries = rawSeries.map((count) =>
        total > 0 ? (count / total) * 100 : 0
    );

    return {
        height: chartSizing['areaFooterLabel'],
        categories: allDays,
        colors: weekDaysColors,

        yAxis: {
            title: 'Engagement ( % )',
            showAsPercentage: percent || false,
        },
        xAxis: {
            title: 'Days',
        },
        legend: {
            enabled: false,
        },
        tooltip: {
            percent: true
        },
        series: [
            {
                name: 'Engagement',
                data:  percentSeries
            },
        ],
    };
};


export const FormatgetByHoursMobile = (data) => {
    const maxHourWiseCount = Math.max(...data.map((item) => parseInt(item?.hourWiseCount, 10)));
    const maxHoursData = data.filter((item) => parseInt(item?.hourWiseCount, 10) === maxHourWiseCount);
    const maxHour = parseInt(maxHoursData[0].hour, 10);

    const updatedData = data.map((item) => ({
        hour: item?.hour,
        hourWiseCount: item?.hourWiseCount,
        count: parseInt(item?.hourWiseCount, 10)
    }));

    const sortedData = [...updatedData].sort((a, b) => b.count - a.count);
    
    const uniqueCounts = [...new Set(sortedData.map(item => item?.count))].sort((a, b) => b - a);
    
    const rankColors = [
        ch_primary_green,    
        ch_secondary_green, 
        ch_clockchart1,      
        ch_clockchart2,     
        '#e8e8ea'                   
    ];

    let Series = [
        {
            from: 0,
            to: 24,
            color: '#e8e8ea',
            outerRadius: '105%',
            thickness: '5%',
        },
        ...updatedData.map((item) => {
            const rank = uniqueCounts.indexOf(item?.count);
            const color = rank < rankColors.length - 1 ? rankColors[rank] : rankColors[rankColors.length - 1];
            return {
                from: Number(item?.hour),
                to: Number(item?.hour) + 1,
                color: color,
                outerRadius: '105%',
                thickness: '5%',
            };
        }),
    ];

    let byHours = {
        height: 310,
        series: Series,
        data: [maxHour, maxHour + 1],
    };

    return byHours;
};

export const getProductAnalyticsFunc = (data) => {
    return {
        name: 'Product_Analytics',
        children: Object.values(data?.children)?.length > 0 ? Object.values(data?.children) : [],
    };
};
export function getFullDayName(abbreviation) {
    if (!!abbreviation) {
        const daysOfWeek = {
            mon: 'Monday',
            tue: 'Tuesday',
            wed: 'Wednesday',
            thu: 'Thursday',
            fri: 'Friday',
            sat: 'Saturday',
            sun: 'Sunday',
        };

        return daysOfWeek[abbreviation.toLowerCase()] || '';
    }
}

export const findByDaysMaxStateAndPercentage = (byDaysData) => {
    if (byDaysData && byDaysData?.length) {
        const maxDayWiseCount = Math.max(...byDaysData.map((item) => parseInt(item?.dayWiseCount, 10)));
        const totalDayWiseCount = byDaysData.reduce((acc, item) => acc + parseInt(item?.dayWiseCount, 10), 0);

        const maxDayData = byDaysData.find((item) => parseInt(item?.dayWiseCount, 10) === maxDayWiseCount);
        const percentage = (maxDayWiseCount / totalDayWiseCount) * 100;
        const formattedPercentage = percentage >= 100 ? percentage : formatPercentageDisplay(percentage);
        return { value: maxDayData.dayName, percentage: formattedPercentage };
    } else {
        return { value: null, percentage: 0 };
    }
};

export const findLocationMaxStateAndPercentage = (data) => {
    if (data && data?.length > 0) {
        const countryCountMap = data?.reduce((acc, item) => {
            const country = item?.Country ?? 'Unknown';
            if (acc[country]) {
                acc[country] += 1;
            } else {
                acc[country] = 1;
            }
            return acc;
        }, {});

        const maxCountryCount = Math.max(...Object.values(countryCountMap));
        const totalCountriesCount = data?.length;

        const finalValue = Object.keys(countryCountMap).find((country) => countryCountMap[country] === maxCountryCount);

        const percentage = (maxCountryCount / totalCountriesCount) * 100;

        const finalPercentage = formatPercentageDisplay(percentage);
        return { value: finalValue, percentage: finalPercentage };
    }
    return { value: null, percentage: 0 };
};

export const findMaxDeviceLanguage = (data) => {
    if (!Array.isArray(data) || data?.length === 0) {
        return { deviceLanguage: null, percentage: 0 };
    }

    const maxCount = Math.max(...data.map((item) => item?.deviceLanguageCount));
    const maxDeviceLanguage = data.find((item) => item?.deviceLanguageCount === maxCount);
    const totalCount = data.reduce((acc, current) => acc + current.deviceLanguageCount, 0);

    const percentage = totalCount > 0 ? (maxDeviceLanguage.deviceLanguageCount / totalCount) * 100 : 0;

    return {
        deviceLanguage: maxDeviceLanguage.deviceLanguage,
        percentage: formatPercentageDisplay(percentage),
    };
};

const convertTo12HourFormat = (hour) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
};

export const findMaxEngagementTimeAndPercentage = (byHoursData) => {
    if (!byHoursData || !byHoursData?.length) {
        return { timeRange: null, percentage: '0' };
    }
    const totalHourWiseCount = byHoursData.reduce((acc, item) => acc + parseInt(item?.hourWiseCount, 10), 0);
    const maxHourWiseCount = Math.max(...byHoursData.map((item) => parseInt(item?.hourWiseCount, 10)));
    const maxHoursData = byHoursData.filter((item) => parseInt(item?.hourWiseCount, 10) === maxHourWiseCount);
    const maxHour = parseInt(maxHoursData[0].hour, 10);
    const nextHour = maxHour + 1;
    const percentage = (maxHourWiseCount / totalHourWiseCount) * 100;
    const formattedPercentage = percentage >= 100 ? `${percentage}` : `${formatPercentageDisplay(percentage)}`;
    const timeRange = `${convertTo12HourFormat(maxHour)} to ${convertTo12HourFormat(nextHour)}`;
    return { timeRange, percentage: formattedPercentage };
};
