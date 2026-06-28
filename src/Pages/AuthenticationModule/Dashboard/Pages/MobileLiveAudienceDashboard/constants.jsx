import { formatNumber } from 'Utils/modules/campaignUtils';
import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { formatPercentageDisplay } from 'Utils/modules/formatters';
import { safeObjectKeys } from 'Utils/modules/misc';
import { chartSizing, daysCount, weekDaysColors } from 'Constants/Charts/commonFunction';
import { ch_androidColor, ch_clockchart1, ch_clockchart2, ch_convertedColor, ch_dark_blue, ch_identifiedColor, ch_knownColor, ch_primary_green, ch_primary_red, ch_secondary_green, ch_tertiary_grey } from 'Constants/GlobalConstant/Colors/colorsVariable';
export const dd_retention = ['Known', 'Identified'];
export const dd_top_screen_views = ['Top screen views', 'Top drop-off screens'];


export const MOBILE_LIVE_DASHBOARD_DATA = {
    // Visitor status
    // BAR CHART
    visitorBarChartMobData: {
        xAxis: {},
        yAxis: {
            tickInterval: 2900,
        },
        categories: ['Chrome', 'Edge', 'Firefox', 'Others'],
        series: [
            {
                name: 'In-active',
                data: [7292, 2900, 1558, 742],
                color: ch_tertiary_grey,
            },
            {
                name: 'Active',
                data: [5000, 3200, 1800, 790],
                color: ch_secondary_green,
            },
        ],
    },

    // SANKEY
    pathAnalyser_sankey_chart_data: [
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

    // Active visitor traffic
    // AREA CHART
    active_visitor_traffic_ChartMobData: {
        height: chartSizing['area'],
        xAxis: {
            title: '',
        },
        categories: daysCount(10),
        yAxis: {
            title: '',
            // tickInterval: 500
        },
        legend: {
            enabled: false,
        },
        series: [
            {
                name: 'Active users',
                data: [800, 750, 900, 450, 1250, 1800, 1750, 900, 1450, 1250],
                color: '#f68936',
            },
        ],
    },

    // Key metrics
    // Active users

    // pathAnalyserData

    // Audience types
    // BAR CHART
    activeTypesBarChartMobData: {
        xAxis: {
            title: '% Audience',
            categories: ['Value'],
            labels: false,
        },
        yAxis: {
            tickInterval: 20,
            labelFormat: '{value}%',
            max: 100,
        },
        pointWidth: 100,
        series: [
            {
                name: 'Identified',
                data: [55],
                color: ch_identifiedColor,
            },
            {
                name: 'Known',
                data: [45],
                color: ch_knownColor,
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
    audienceConversionPyramidChartMobData: {
        series: [
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
    progressiveProfilePyramidChartMobData: {
        reversed: true,
        series: [
            { name: 'Demographic', y: 1788, color: '#66c7ea' },
            { name: 'Engagement', y: 1998, color: '#5ab5e6' },
            { name: 'Product interest', y: 2001, color: '#4e9ce0' },
            { name: 'Social referral', y: 2002, color: '#3568c6' },
            { name: 'Purchase intent', y: 1565, color: '#132385' },
        ],
    },

    // Operating sytem
    // PIE CHART
    operatingSystemPieChartMobData: {
        // height: 290,
        series: [
            { name: 'Android', y: 77 },
            { name: 'iOS', y: 23 },
        ],
    },

    // Device
    // PIE CHART
    devicePieChartMobData: {
        // height: 290,
        series: [
            { name: 'Samsung', y: 36 },
            { name: 'Xiaomi', y: 25 },
            { name: 'OnePlus', y: 14 },
            { name: 'iPhone', y: 9 },
            { name: 'Others', y: 16 },
        ],
    },

    // App versions
    // PIE CHART
    appVersionPieChartMobData: {
        // height: 290,
        series: [
            { name: 'v1.0', y: 31 },
            { name: 'v2.0', y: 21 },
            { name: 'v3.0', y: 12 },
            { name: 'Others', y: 36 },
        ],
    },

    // OS versions
    // PIE CHART
    osVersionPieChartMobData: {
        // height: 290,
        series: [
            { name: 'Android 1.9.11', y: 55 },
            { name: 'Android 1.9.10', y: 18 },
            { name: 'iOS 1.8.2', y: 14 },
            { name: 'iOS 1.8.1', y: 13 },
        ],
    },

    geographic_map__map_structure: {
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

    geographic_languages_pie_structure: {
        height: 290,
        series: [
            {
                name: 'English',
                y: 77,
                color: ch_androidColor,
            },
            {
                name: 'Spanish',
                y: 23,
                color: ch_dark_blue,
            },
            {
                name: 'Others',
                y: 23,
                color: ch_primary_red,
            },
        ],
    },

    // Usage behaviour / By days
    // COLUMN CHART
    usageBehaviourColumnChartMobData: {
        height: 330,
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
    byHoursGaugeChartMobData: {
        height: 310,
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

export const mobileAppDataTemp = {
    _key: '3e7c9e49-2bf1-4187-ad2a-1d20b0f0c40f',
    byDaysCountMobile: [
        {
            dayName: 'Mon',
            dayWiseCount: '35587',
        },
        {
            dayName: 'Tue',
            dayWiseCount: '38477',
        },
        {
            dayName: 'Wed',
            dayWiseCount: '38786',
        },
        {
            dayName: 'Thu',
            dayWiseCount: '37157',
        },
        {
            dayName: 'Fri',
            dayWiseCount: '39007',
        },
        {
            dayName: 'Sat',
            dayWiseCount: '43842',
        },
        {
            dayName: 'Sun',
            dayWiseCount: '35603',
        },
    ],
    audienceConversionMobile: [
        {
            Known: 82921,
            Identified: 255565,
            Converted: 0,
        },
    ],
    retentionidentifieMobile: [
        {
            retention_date: '2024-04-25 12:00:00 AM',
            total_identified: '260',
            day1_identified: '258',
            day2_identified: '1',
            day3_identified: '1',
            day4_identified: '0',
            day5_identified: '0',
        },
        {
            retention_date: '2024-04-24 12:00:00 AM',
            total_identified: '304',
            day1_identified: '303',
            day2_identified: '0',
            day3_identified: '1',
            day4_identified: '0',
            day5_identified: '0',
        },
        {
            retention_date: '2024-04-23 12:00:00 AM',
            total_identified: '279',
            day1_identified: '279',
            day2_identified: '0',
            day3_identified: '0',
            day4_identified: '0',
            day5_identified: '0',
        },
        {
            retention_date: '2024-04-22 12:00:00 AM',
            total_identified: '301',
            day1_identified: '301',
            day2_identified: '0',
            day3_identified: '0',
            day4_identified: '0',
            day5_identified: '0',
        },
        {
            retention_date: '2024-04-21 12:00:00 AM',
            total_identified: '114',
            day1_identified: '114',
            day2_identified: '0',
            day3_identified: '0',
            day4_identified: '0',
            day5_identified: '0',
        },
    ],
    retentionknownMobile: [
        {
            retention_date: '2024-04-25 12:00:00 AM',
            total_known: '132',
            day1_known: '131',
            day2_known: '1',
            day3_known: '0',
            day4_known: '0',
            day5_known: '0',
        },
        {
            retention_date: '2024-04-24 12:00:00 AM',
            total_known: '130',
            day1_known: '130',
            day2_known: '0',
            day3_known: '0',
            day4_known: '0',
            day5_known: '0',
        },
        {
            retention_date: '2024-04-23 12:00:00 AM',
            total_known: '104',
            day1_known: '103',
            day2_known: '0',
            day3_known: '0',
            day4_known: '1',
            day5_known: '0',
        },
        {
            retention_date: '2024-04-22 12:00:00 AM',
            total_known: '119',
            day1_known: '119',
            day2_known: '0',
            day3_known: '0',
            day4_known: '0',
            day5_known: '0',
        },
        {
            retention_date: '2024-04-21 12:00:00 AM',
            total_known: '138',
            day1_known: '134',
            day2_known: '1',
            day3_known: '3',
            day4_known: '0',
            day5_known: '0',
        },
    ],
    trafficeCountList: [],
    userDevices: [
        {
            activeUsers: null,
            crashes: 0,
            inAppErrors: 0,
            dau: 37142,
            wau: 265330,
            mau: 1151258,
        },
    ],
    userScreens: [
        {
            avgSeconds: '196360',
            screenName: 'Startup',
        },
        {
            avgSeconds: '185161',
            screenName: 'MainActivity',
        },
        {
            avgSeconds: '181699',
            screenName: 'Home',
        },
        {
            avgSeconds: '153292',
            screenName: 'Main',
        },
        {
            avgSeconds: '145746',
            screenName: 'ProductList',
        },
    ],
    userEvent: [],
    eventCounts: [
        {
            eventName: 'View Mode',
            maxEventCount: 1191315,
        },
        {
            eventName: 'Add To Cart',
            maxEventCount: 906989,
        },
        {
            eventName: 'Search',
            maxEventCount: 811440,
        },
        {
            eventName: 'Item Viewed',
            maxEventCount: 475171,
        },
        {
            eventName: 'Purchase Order Details',
            maxEventCount: 458801,
        },
    ],
    dayWiseCounts: [
        {
            date: '2024-04-19',
            dayWiseCount: '39003',
        },
        {
            date: '2024-04-20',
            dayWiseCount: '43838',
        },
        {
            date: '2024-04-21',
            dayWiseCount: '35596',
        },
        {
            date: '2024-04-22',
            dayWiseCount: '35582',
        },
        {
            date: '2024-04-23',
            dayWiseCount: '38475',
        },
        {
            date: '2024-04-24',
            dayWiseCount: '38782',
        },
        {
            date: '2024-04-25',
            dayWiseCount: '37142',
        },
    ],
    hourWiseCounts: [
        {
            hour: '0',
            hourWiseCount: '472',
        },
        {
            hour: '1',
            hourWiseCount: '936',
        },
        {
            hour: '2',
            hourWiseCount: '1690',
        },
        {
            hour: '3',
            hourWiseCount: '1927',
        },
        {
            hour: '4',
            hourWiseCount: '2447',
        },
        {
            hour: '5',
            hourWiseCount: '2682',
        },
        {
            hour: '6',
            hourWiseCount: '2613',
        },
        {
            hour: '7',
            hourWiseCount: '3060',
        },
        {
            hour: '8',
            hourWiseCount: '2837',
        },
        {
            hour: '9',
            hourWiseCount: '2462',
        },
        {
            hour: '10',
            hourWiseCount: '2035',
        },
        {
            hour: '11',
            hourWiseCount: '2196',
        },
        {
            hour: '12',
            hourWiseCount: '2620',
        },
        {
            hour: '13',
            hourWiseCount: '2009',
        },
        {
            hour: '14',
            hourWiseCount: '2935',
        },
        {
            hour: '15',
            hourWiseCount: '2868',
        },
        {
            hour: '16',
            hourWiseCount: '2209',
        },
        {
            hour: '17',
            hourWiseCount: '1781',
        },
        {
            hour: '18',
            hourWiseCount: '1541',
        },
        {
            hour: '19',
            hourWiseCount: '1063',
        },
        {
            hour: '20',
            hourWiseCount: '636',
        },
        {
            hour: '21',
            hourWiseCount: '476',
        },
        {
            hour: '22',
            hourWiseCount: '318',
        },
        {
            hour: '23',
            hourWiseCount: '345',
        },
    ],
    deviceOSList: [
        {
            deviceOS: 'Android',
            DeviceOSCount: 997401,
        },
        {
            deviceOS: 'iOS',
            DeviceOSCount: 85026,
        },
        {
            deviceOS: 'iPadOS',
            DeviceOSCount: 1192,
        },
    ],
    appVersionList: [
        {
            appVersionName: 'None',
            appVersionCount: 1,
        },
        {
            appVersionName: '6.8',
            appVersionCount: 9,
        },
        {
            appVersionName: '6.7',
            appVersionCount: 285121,
        },
        {
            appVersionName: '6.6',
            appVersionCount: 23930,
        },
        {
            appVersionName: '6.5',
            appVersionCount: 2955,
        },
    ],
    knownUsersCountList: [
        {
            knownUsersCount: 82921,
            identifiedUsersCount: 255565,
            deviceCount: 0,
            appInstalledCount: 0,
            appUpdatedCount: 0,
        },
    ],
    deviceOSVersionList: [
        {
            deviceOSVersion: 'Android 13',
            deviceOSVersionCount: 300939,
        },
        {
            deviceOSVersion: 'Android 12',
            deviceOSVersionCount: 214557,
        },
        {
            deviceOSVersion: 'Android 11',
            deviceOSVersionCount: 184172,
        },
        {
            deviceOSVersion: 'Android 10',
            deviceOSVersionCount: 105810,
        },
        {
            deviceOSVersion: 'Android 14',
            deviceOSVersionCount: 102785,
        },
    ],
    deviceLanguageList: [
        {
            deviceLanguage: 'English',
            deviceLanguageCount: 989962,
        },
        {
            deviceLanguage: 'en-IN',
            deviceLanguageCount: 76057,
        },
        {
            deviceLanguage: 'en-US',
            deviceLanguageCount: 4153,
        },
        {
            deviceLanguage: 'en-GB',
            deviceLanguageCount: 2070,
        },
        {
            deviceLanguage: 'None',
            deviceLanguageCount: 1891,
        },
    ],
    deviceModelList: [],
    screenWiseCountList: [
        {
            ScreenViews: '37317476',
            Sessions: '1089273',
            AvgTimeSpent: '00:01:24',
        },
    ],
    screenSessionCountList: [
        {
            AvgScreenBySession: '34',
        },
    ],
    deviceUninstallCountList: [
        {
            Uninstallcount: '4699660',
        },
    ],
    deviceWiseCountsdkList: [],
    deviceWiseCountCustList: [
        {
            DeviceType: 'Android Phone',
            DeviceWiseCount: '989407',
        },
        {
            DeviceType: 'iPhone',
            DeviceWiseCount: '84986',
        },
        {
            DeviceType: 'Android Tab',
            DeviceWiseCount: '7994',
        },
        {
            DeviceType: 'iPad',
            DeviceWiseCount: '1232',
        },
    ],
    deviceLocationsList: [
        {
            Latitude: '17.3724',
            Longitude: '78.4378',
            City: 'Hyderabad',
            Country: 'India',
            State: 'Telangana',
        },
        {
            Latitude: '28.6542',
            Longitude: '77.2373',
            City: 'Delhi',
            Country: 'India',
            State: 'National Capital Territory of Delhi',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '20.2706',
            Longitude: '85.8334',
            City: 'Bhubaneswar',
            Country: 'India',
            State: 'Odisha',
        },
        {
            Latitude: '26.8756',
            Longitude: '80.9115',
            City: 'Lucknow',
            Country: 'India',
            State: 'Uttar Pradesh',
        },
        {
            Latitude: '28.6542',
            Longitude: '77.2373',
            City: 'Delhi',
            Country: 'India',
            State: 'National Capital Territory of Delhi',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '40.5787',
            Longitude: '-74.2292',
            City: 'Carteret',
            Country: 'United States',
            State: 'New Jersey',
        },
        {
            Latitude: '17.3724',
            Longitude: '78.4378',
            City: 'Hyderabad',
            Country: 'India',
            State: 'Telangana',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '28.6542',
            Longitude: '77.2373',
            City: 'Delhi',
            Country: 'India',
            State: 'National Capital Territory of Delhi',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '20.2706',
            Longitude: '85.8334',
            City: 'Bhubaneswar',
            Country: 'India',
            State: 'Odisha',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '22.8057',
            Longitude: '86.1804',
            City: 'Jamshedpur',
            Country: 'India',
            State: 'Jharkhand',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '16.5033',
            Longitude: '80.6465',
            City: 'Vijayawada',
            Country: 'India',
            State: 'Andhra Pradesh',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '12.8996',
            Longitude: '80.2209',
            City: 'Chennai',
            Country: 'India',
            State: 'Tamil Nadu',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '26.8756',
            Longitude: '80.9115',
            City: 'Lucknow',
            Country: 'India',
            State: 'Uttar Pradesh',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '26.8756',
            Longitude: '80.9115',
            City: 'Lucknow',
            Country: 'India',
            State: 'Uttar Pradesh',
        },
        {
            Latitude: '26.8756',
            Longitude: '80.9115',
            City: 'Lucknow',
            Country: 'India',
            State: 'Uttar Pradesh',
        },
        {
            Latitude: '22.574',
            Longitude: '88.3191',
            City: 'Howrah',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '12.9634',
            Longitude: '77.5855',
            City: 'Bengaluru',
            Country: 'India',
            State: 'Karnataka',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '23.7285',
            Longitude: '92.7188',
            City: 'Aizawl',
            Country: 'India',
            State: 'Mizoram',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '26.8756',
            Longitude: '80.9115',
            City: 'Lucknow',
            Country: 'India',
            State: 'Uttar Pradesh',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '17.3724',
            Longitude: '78.4378',
            City: 'Hyderabad',
            Country: 'India',
            State: 'Telangana',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '12.9634',
            Longitude: '77.5855',
            City: 'Bengaluru',
            Country: 'India',
            State: 'Karnataka',
        },
        {
            Latitude: '17.3724',
            Longitude: '78.4378',
            City: 'Hyderabad',
            Country: 'India',
            State: 'Telangana',
        },
        {
            Latitude: '30.3275',
            Longitude: '78.0325',
            City: 'Dehradun',
            Country: 'India',
            State: 'Uttarakhand',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '26.8756',
            Longitude: '80.9115',
            City: 'Lucknow',
            Country: 'India',
            State: 'Uttar Pradesh',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '19.0748',
            Longitude: '72.8856',
            City: 'Mumbai',
            Country: 'India',
            State: 'Maharashtra',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '23.6771',
            Longitude: '86.95',
            City: 'Asansol',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '17.3724',
            Longitude: '78.4378',
            City: 'Hyderabad',
            Country: 'India',
            State: 'Telangana',
        },
        {
            Latitude: '26.7084',
            Longitude: '88.4318',
            City: 'Siliguri',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '19.0748',
            Longitude: '72.8856',
            City: 'Mumbai',
            Country: 'India',
            State: 'Maharashtra',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '26.8756',
            Longitude: '80.9115',
            City: 'Lucknow',
            Country: 'India',
            State: 'Uttar Pradesh',
        },
        {
            Latitude: '28.652',
            Longitude: '77.1663',
            City: 'New Delhi',
            Country: 'India',
            State: 'National Capital Territory of Delhi',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '26.8756',
            Longitude: '80.9115',
            City: 'Lucknow',
            Country: 'India',
            State: 'Uttar Pradesh',
        },
        {
            Latitude: '17.3724',
            Longitude: '78.4378',
            City: 'Hyderabad',
            Country: 'India',
            State: 'Telangana',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '17.3724',
            Longitude: '78.4378',
            City: 'Hyderabad',
            Country: 'India',
            State: 'Telangana',
        },
        {
            Latitude: '17.3724',
            Longitude: '78.4378',
            City: 'Hyderabad',
            Country: 'India',
            State: 'Telangana',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '28.6542',
            Longitude: '77.2373',
            City: 'Delhi',
            Country: 'India',
            State: 'National Capital Territory of Delhi',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '17.3724',
            Longitude: '78.4378',
            City: 'Hyderabad',
            Country: 'India',
            State: 'Telangana',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '25.2979',
            Longitude: '82.9956',
            City: 'Varanasi',
            Country: 'India',
            State: 'Uttar Pradesh',
        },
        {
            Latitude: '28.6542',
            Longitude: '77.2373',
            City: 'Delhi',
            Country: 'India',
            State: 'National Capital Territory of Delhi',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '26.8756',
            Longitude: '80.9115',
            City: 'Lucknow',
            Country: 'India',
            State: 'Uttar Pradesh',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '9.9185',
            Longitude: '76.2558',
            City: 'Kochi',
            Country: 'India',
            State: 'Kerala',
        },
        {
            Latitude: '17.3724',
            Longitude: '78.4378',
            City: 'Hyderabad',
            Country: 'India',
            State: 'Telangana',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '17.3724',
            Longitude: '78.4378',
            City: 'Hyderabad',
            Country: 'India',
            State: 'Telangana',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '20.2706',
            Longitude: '85.8334',
            City: 'Bhubaneswar',
            Country: 'India',
            State: 'Odisha',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '22.518',
            Longitude: '88.3832',
            City: 'Kolkata',
            Country: 'India',
            State: 'West Bengal',
        },
        {
            Latitude: '26.8756',
            Longitude: '80.9115',
            City: 'Lucknow',
            Country: 'India',
            State: 'Uttar Pradesh',
        },
    ],
};

export const FormatactiveTypesBarChartMobData = (data) => {
    const orderedKeys = ['Known', 'Identified', 'Converted'];
    const keys = orderedKeys.filter(key => data[0].hasOwnProperty(key));
    const total = keys.reduce((sum, key) => sum + data[0][key], 0);
    let seriesData = [];

    const filteredKeys = keys.filter((key) => data[0][key] > 0);

    if (filteredKeys?.length > 0) {
        const series = filteredKeys.map((key, index) => {
            const value = data[0][key];
            const percentage = Math.round((value / total) * 100);
            return {
                name: key,
                data: [percentage], 
                legendIndex: index,
                zIndex: filteredKeys.length - index,
                index: index
            };
        });
        seriesData.push(...series);
    }
    seriesData?.sort((a, b) => {
        const orderMap = { 'Known': 0, 'Identified': 1, 'Converted': 2 };
        return (orderMap[a.name] || 999) - (orderMap[b.name] || 999);
    });

    return {
        xAxis: {
            title: '% Audience',
            categories: ['Value'],
            labels: false,
        },
        yAxis: {
            tickInterval: 20,
            labelFormat: '{value}%',
            max: 100,
            reversed: false,
        },
        pointWidth: 100,
        series: seriesData,
        tooltip: {
            percent: true,
        },
    };
};

// export const FormatactiveTypesBarChartMobData = (data) => {
//     const keys = Object.keys(data[0]);
//     const values = keys.map((key) => data[0][key]);
//     const total = values.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
//     const series = keys.map((key, index) => ({
//         name: key,
//         data: [(values[index] / total) * 100],
//     }));
//     return {
//         xAxis: {
//             title: '% Audience',
//             categories: ['Value'],
//             labels: false,
//         },
//         yAxis: {
//             tickInterval: 20,
//             labelFormat: '{value}%',
//             max: 100,
//         },
//         tooltip: {
//             percent: true
//         },
//         pointWidth: 100,
//         series: series,
//     };
// };

export const FormatactiveTypesPymaridChartMobData = (data) => {
    const keys = safeObjectKeys(data?.[0]);
    const values = keys?.map((key) => data[0][key]);
    const seriesData = keys?.map((key, index) => ({
        name: key === 'Known' ? 'Known users' : key === 'Identified' ? 'Identified users' : key,
        y: values[index],
    }));
    return {
        series: seriesData,
    };
};

export const FormatKnownRetentionData = (data) => {
    let title;

    if (data && data?.length > 0) {
        const keyNames = Object.keys(data[0]);
        if (keyNames[1].includes('known')) title = 'Known';
        else if (keyNames[1].includes('total_identified')) title = 'Identified';
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
                known: Math.abs(entry?.total_known || entry?.total_identified || 0),
                day1: Math.abs(entry?.day1_known || entry?.day1_identified || 0),
                day2: Math.abs(entry?.day2_known || entry?.day2_identified || 0),
                day3: Math.abs(entry?.day3_known || entry?.day3_identified || 0),
                day4: Math.abs(entry?.day4_known || entry?.day4_identified || 0),
                day5: Math.abs(entry?.day5_known || entry?.day5_identified || 0),
            };
            transformedData.body.push(transformedEntry);
        });
    }

    return transformedData;
};

export const Format_active_visitor_traffic_ChartMobData = (data) => {
        const sortDayWiseData = data?.sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
    });

    const newData = sortDayWiseData?.map((item) => Number(item?.dayWiseCount));
    const categoryDate = sortDayWiseData?.map((item) => item?.date);

    // function getOrdinalSuffix(day) {
    //     if (day > 3 && day < 21) return 'th';
    //     switch (day % 10) {
    //         case 1:
    //             return 'st';
    //         case 2:
    //             return 'nd';
    //         case 3:
    //             return 'rd';
    //         default:
    //             return 'th';
    //     }
    // }

    // function formatDateArray(dateArray) {
    //     const formattedDates = dateArray.map((dateString) => {
    //         const [year, month, day] = dateString.split('-');
    //         const date = new Date(year, month - 1, day);
    //         const options = { day: 'numeric', month: 'short' };
    //         const formattedDate = date.toLocaleDateString('en-US', options);
    //         const dayNumber = date.getDate();
    //         const ordinalSuffix = getOrdinalSuffix(dayNumber);
    //         return formattedDate.replace(dayNumber, dayNumber + ordinalSuffix);
    //     });
    //     return formattedDates;
    // }
    const formatDate = categoryDate?.map((dateString) => {
        const formatted = getUserCurrentFormat(dateString);
        return formatted?.dateFormat;
    });
    return {
        height: 240,
        xAxis: {
            title: '',
            tickInterval: 0,
        },
        categories: formatDate,
        yAxis: {
            title: '',
            // tickInterval: 500
        },
        legend: {
            enabled: false,
        },
        series: [
            {
                name: 'Active users',
                data: newData,
            },
        ],
    };
};

const getLanguageName = (localeCode) => {
    const languageMap = {
        'en-US': 'English (United States)',
        'en-GB': 'English (United Kingdom)', 
        'en-IN': 'English (India)',
        'en-AU': 'English (Australia)',
        'en-NO':'English (Norway)',
        'en-CA': 'English (Canada)',
        'en-SG': 'English (Singapore)',
        
        'es-ES': 'Spanish (Spain)',
        'es-MX': 'Spanish (Mexico)',
        'es-AR': 'Spanish (Argentina)',
        
        // French variants
        'fr-FR': 'French (France)',
        'fr-CA': 'French (Canada)',
        
        // Portuguese variants
        'pt-BR': 'Portuguese (Brazil)',
        'pt-PT': 'Portuguese (Portugal)',
        
        // Hindi variants
        'hi-IN': 'Hindi (India)',
        'Hindi': 'Hindi',
        
        // Bengali/Bangla variants
        'bn-BD': 'Bengali (Bangladesh)',
        'bn-IN': 'Bengali (India)',
        'Bengali': 'Bengali',
        'Bangla': 'Bengali',
        
        // Urdu variants
        'ur-PK': 'Urdu',
        
        // Chinese variants
        'zh-CN': 'Chinese (Simplified)',
        'zh-TW': 'Chinese (Traditional)',
        
        // Japanese
        'ja-JP': 'Japanese',
        
        // Korean
        'ko-KR': 'Korean',
        
        // German variants
        'de-DE': 'German (Germany)',
        'de-CH': 'German (Switzerland)',
        
        // Russian
        'ru-RU': 'Russian',
        
        // Arabic variants
        'ar-SA': 'Arabic (Saudi Arabia)',
        'ar-AE': 'Arabic (United Arab Emirates)',
        
        // Indonesian
        'id-ID': 'Indonesian',
        
        // Tamil
        'ta-IN': 'Tamil',
        
        // Telugu
        'te-IN': 'Telugu ',
        
        // Malay
        'ms-MY': 'Malay (Malaysia)',
        'Malay': 'Malay',
        
        // Italian
        'it-IT': 'Italian ',
    };
    
    return languageMap[localeCode] || localeCode;
};

export const getLanguageTooltipFormatter = () => {
    return function () {
        const point = this?.point || {};
        const seriesName = this?.series?.name ?? 'Count';
        const rawName = typeof point.name === 'string' ? point.name : '';
        const displayName = getLanguageName(rawName || 'Unknown');
        const yValue = Number.isFinite(point?.y) ? point.y : 0;
        const formattedValue = formatNumber(yValue);
        const originalCode = rawName || 'Unknown';
        const color = point?.color || '#888';
        return `<span class="font-xs">${displayName}</span><br/><hr /><span class="font-xs">${originalCode}</span><br/><hr /><span class="font-monospace" style="color:${color}">\u25CF</span>&nbsp;<span class="font-xs">${seriesName}: </span><span class="font-xs" style="text-align: right;">${formattedValue}</span>`;
    };
};

export const FormatPieChartData = (data) => {
    const seriesData = data?.map((item) => ({
        name:
            item?.deviceOS || item?.DeviceType || item?.appVersionName || item?.deviceOSVersion || item?.deviceLanguage,
        y:
            Number(item?.DeviceOSCount) ||
            Number(item?.DeviceWiseCount) ||
            Number(item?.appVersionCount) ||
            Number(item?.deviceOSVersionCount) ||
            Number(item?.deviceLanguageCount),
    }));

    // console.log(seriesData, 'seriesData');
    return {
        series: seriesData,
    };
};

export const FormatPieChartDataVersion = (data) => {
    const seriesData = data?.map((item) => ({
        name: `v${
            item?.deviceOS || item?.DeviceType || item?.appVersionName || item?.deviceOSVersion || item?.deviceLanguage
        }`,
        y:
            Number(item?.DeviceOSCount) ||
            Number(item?.DeviceWiseCount) ||
            Number(item?.appVersionCount) ||
            Number(item?.deviceOSVersionCount) ||
            Number(item?.deviceLanguageCount),
    }));

    // console.log(seriesData, 'seriesData');
    return {
        series: seriesData,
    };
};

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

export const getLocationDetails = (data) => {
    const updatedData = data?.map((item) => ({
        zoomLevel: 10,
        country: item?.Country,
        state: item?.State,
        lat: Number(item?.Latitude),
        lon: Number(item?.Longitude),
    }));

    return {
        series: updatedData,
    };
};

export const FormatgetByHoursMobile = (data) => {
    const maxHourWiseCount = Math.max(...data.map((item) => parseInt(item?.hourWiseCount, 10)));
    const maxHoursData = data.filter((item) => parseInt(item?.hourWiseCount, 10) === maxHourWiseCount);
    const maxHour = parseInt(maxHoursData[0]?.hour, 10);

    const updatedData = data.map((item) => ({
        hour: item?.hour,
        hourWiseCount: item?.hourWiseCount,
        count: parseInt(item?.hourWiseCount, 10)
    }));
``
    const sortedData = [...updatedData].sort((a, b) => b.count - a.count);
    
    const uniqueCounts = [...new Set(sortedData?.map(item => item?.count))].sort((a, b) => b - a);
    
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
const convertTo12HourFormat = (hour) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
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
