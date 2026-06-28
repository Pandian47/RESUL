import { areaSplineHeight } from 'Constants/GlobalConstant/Charts';
import { daysCount, weekDaysColors } from 'Constants/Charts/commonFunction';
import { ch_androidColor, ch_clockchart1, ch_clockchart2, ch_convertedColor, ch_email, ch_facebook, ch_identifiedColor, ch_iosColor, ch_knownColor, ch_light_blue, ch_male, ch_medium_blue, ch_medium_green, ch_medium_orange, ch_mobile_push, ch_notifications, ch_pinterest, ch_primary_green, ch_primary_orange, ch_qR_code, ch_secondary_green, ch_sms, ch_tertiary_grey, ch_tuesday, ch_twitter, ch_web_push } from 'Constants/GlobalConstant/Colors/colorsVariable';
export const code_area_chart_code_data = `area_structure: {
    height: 310,
    xAxis: {
        title: 'Date',
        tickInterval: 2
    },
    yAxis: {
        title: 'Count'
    },
    categories: daysCount(10), // ['', '']
    series: [
        {
            name: 'Active users',
            data: [800, 750, 900, 450, 1250, 1800, 1750, 900, 1450, 1250],
            color: ch_tuesday
        },
        {
            name: 'Inactive users',
            data: [800, 750, 900, 450, 1250, 1800, 1750, 900, 1450, 1250],
            color: ch_facebook
        }
    ]
}`

export const code_bubble_chart_code_data = `bubble_structure: {
    series: [
        { name: 'Wed', value: 6.2 },
        { name: 'Tue', value: 8.6 },
        { name: 'Mon', value: 6.5 },
        { name: 'Sat', value: 38.5 },
        { name: 'Thu', value: 3.2 },
        { name: 'Sun', value: 31.9 },
        { name: 'Fri', value: 5.1 }
    ]
}`

export const code_radar_chart_code_data = `radar_structure: {
    categories: ['Email', 'Mobile', 'Facebook', 'X', 'Notifications'],
    series: [
        {
            name: 'Reach',
            id: 'Reach_series',
            data: [684, 1100, 2689, 1830, 1936],
            goalType: 'Interaction',
            marker: { symbol: 'square' },
        },
        {
            name: 'Interaction',
            id: 'Interaction_series',
            data: [2486, 1390, 1330, 1330, 1390],
            goalType: 'Interaction',
            marker: { symbol: 'square' },
        },
        {
            name: 'Conversion',
            id: 'Conversion_series',
            data: [415, 296, 434, 289, 340],
            goalType: 'Interaction',
            marker: { symbol: 'square'},
        },
    ],
}`

export const code_area_spline_chart_code_one_data = `area_spline_structure: {
    height: areaSplineHeight,
    xAxis: {
        title: '',
        tickInterval: 4
    },
    yAxis: {
        title: ''
    },
    categories: daysCount(30),
    series: [
        {
            name: 'Unique opens',
            data: [100, 172, 120, 140, 112, 98, 132, 325, 128, 60, 100, 199, 100, 130, 95, 220, 200, 236, 132, 325, 128, 60, 100, 199, 100, 130, 95, 220, 200, 236],
            color: ch_primary_orange
        }
    ]
}`

export const code_area_spline_chart_code_data = `area_spline_structure: {
    height: areaSplineHeight,
    xAxis: {
        title: '',
        tickInterval: 4
    },
    yAxis: {
        title: ''
    },
    categories: daysCount(30),
    series: [
        {
            name: 'Unique opens',
            data: [100, 172, 120, 140, 112, 98, 132, 325, 128, 60, 100, 199, 100, 130, 95, 220, 200, 236, 132, 325, 128, 60, 100, 199, 100, 130, 95, 220, 200, 236],
            color: ch_primary_orange
        },
        {
            name: 'Forwards',
            data: [80, 85, 96, 89, 73, 75, 90, 50, 78, 42, 88, 60, 100, 65, 100, 45, 126, 129, 90, 50, 78, 42, 88, 60, 100, 65, 100, 45, 126, 129],
            color: ch_secondary_green
        }
    ]
}`

export const code_area_spline_legend_chart_code_data = `area_spline_structure: {
    xAxis: {
        title: '',
        tickInterval: 4
    },
    yAxis: {
        title: ''
    },
    categories: daysCount(30),
    series: [
        {
            name: 'Unique opens',
            data: [100, 172, 120, 140, 112, 98, 132, 325, 128, 60, 100, 199, 100, 130, 95, 220, 200, 236, 132, 325, 128, 60, 100, 199, 100, 130, 95, 220, 200, 236],
            color: ch_primary_orange
        },
        {
            name: 'Forwards',
            data: [80, 85, 96, 89, 73, 75, 90, 50, 78, 42, 88, 60, 100, 65, 100, 45, 126, 129, 90, 50, 78, 42, 88, 60, 100, 65, 100, 45, 126, 129],
            color: ch_secondary_green
        }
    ]
}`

export const code_bar_chart_code_data = `st_bar_structure: {
    xAxis: {
        title: '% Audience',
        categories: ['Value'],
        labels: false
    },
    yAxis: {
        tickInterval: 20,
        labelFormat: '{value}%',
        max: 100
    },
    legend: {
        reverse: true
    },
    series: [
        {
            name: 'Identified',
            data: [55],
            color: ch_identifiedColor
        }, {
            name: 'Known',
            data: [45],
            color: ch_knownColor
        }
    ]
}`

export const code_bar_multi_chart_code_data = `st_bar_multi_structure: {
    xAxis: {
        title: '',
        categories: ['Email', 'SMS', 'Mobile push', 'Web push'],
        labels: true
    },
    colors: [ch_email, ch_sms, ch_mobile_push, ch_web_push],
    yAxis: {
        lables: false
    },
    legend: false,
    series: [
        {
            name: 'Identified',
            data: [15, 16, 1, 2],
        }
    ]
}`

export const code_bar_multi_mini_chart_code_data = `st_bar_multi_mini_structure: {
    height: 220,
    xAxis: {
        title: '',
        categories: ['Email', 'SMS', 'Mobile push', 'Web push'],
        labels: true
    },
    yAxis: {
        // labelFormat: '{value}k',
        lables: true
    },
    legend: {
        enabled: true,
        reverse: true,
        y: 10
    },
    series: [
        {
            name: 'Inactive',
            data: [10, 9, 7, 5],
            color: ch_tertiary_grey,
        },
        {
            name: 'Active',
            data: [15, 16, 1, 2],
            color: ch_primary_green,
        },
    ]
}`

export const code_column_chart_code_data = `st_column_structure: {
    height: 300,
    categories: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    colors: weekDaysColors,
    xAxis: {
        title: 'Days'
    },
    yAxis: {
        title: 'Engagement ( % )',
        labelFormat: '{value}%',
    },
    legend: {
        enabled: false,
    },
    series: [
        {
            name: 'Communication period',
            data: [25, 8, 13.5, 8, 13, 12.5, 20]
        }
    ]
}`

export const code_column_single_chart_code_data = `st_column_single_structure: {
    categories: daysCount(7),
    xAxis: {
        title: 'Days'
    },
    yAxis: {
        title: 'Count'
    },
    series: [
        {
            name: 'Communication period',
            data: [25, 8, 13.5, 8, 13, 12.5, 20],
            color: ch_male
        }
    ]
}`

export const code_column_multi_chart_code_data = `st_column_multi_structure: {
    categories: ['Credit card', 'Promotional offer', 'New Member Onboarding', 'Invest smartly, Save money'],
    xAxis: {
        title: 'Social media'
    },
    yAxis: {
        title: 'Count'
    },
    tooltip: {
        shared: true
    },
    pointWidth: 10,
    series: [
        {
            name: 'Email',
            color: ch_email,
            data: [180, 130, 165, 96]
        },
        {
            name: 'Twitter',
            color: ch_twitter,
            data: [103, 81, 92, 138]
        },
        {
            name: 'Notifications',
            color: ch_notifications,
            data: [135, 69, 124, 43]
        },
        {
            name: 'QR code',
            color: ch_qR_code,
            data: [80, 89, 55, 81]
        }
    ]
}`

export const code_column_multi_lvl_chart_code_data = `const clientName = 'Banking'

st_column_multi_lvl_structure: {
    stacking: true,
    categories: daysCount(8),
    xAxis: {
        title: 'Date'
    },
    yAxis: {
        title: 'Count'
    },
    tooltip: {
        shared: true
    },
    series: [
        {
            name: 'Men',
            type: 'column',
            color: ch_light_blue,
            data: [16, 26, 40, 10, 31, 13, 12, 26]
        },
        {
            name: 'Women',
            type: 'column',
            color: ch_medium_blue,
            data: [17, 18, 13, 22, 23, 34, 27, 28]
        },
        {
            name: 'Total page ' + clientName,
            type: 'line',
            color: ch_medium_orange,
            data: [25, 15, 15, 15, 25, 22, 5, 19]
        },
        {
            name: 'Total page subscribers',
            type: 'line',
            color: ch_medium_green,
            data: [12, 8, 18, 12, 15, 6, 15, 18]
        }
    ]
}`

export const code_column_multi_stacked_chart_code_data = `st_column_multi_stacked_structure: {
    stacking: true,
    categories: daysCount(8),
    xAxis: {
        title: 'Date'
    },
    yAxis: {
        title: 'Count'
    },
    tooltip: {
        shared: true
    },
    series: [
        {
            name: 'Men',
            color: ch_light_blue,
            data: [16, 26, 40, 10, 31, 13, 12, 26]
        },
        {
            name: 'Women',
            color: ch_medium_blue,
            data: [17, 18, 13, 22, 23, 34, 27, 28]
        }
    ]
}`
export const code_column_stacked_chart_code_data = `st_column_stacked_structure: {
    stacking: true,
    pointWidth: 27,
    categories: ['Credit card', 'Promotional offer', 'New Member Onboarding', 'Invest smartly, Save money'],
    xAxis: {
        title: 'Social media'
    },
    tooltip: {
        shared: true
    },
    yAxis: {
        title: 'Count'
    },
    series: [
        { name: 'Email', color: ch_email, data: [180, 130, 165, 96] },
        { name: 'Twitter', color: ch_twitter, data: [103, 81, 92, 138] },
        { name: 'Notifications', color: ch_notifications, data: [135, 69, 124, 43] },
        { name: 'QR code', color: ch_qR_code, data: [80, 89, 55, 81] }
    ]
}`

export const code_column_stacked_inside_data_chart_code_data = `st_column_stacked_inside_data_structure: {
    stacking: 'percent',
    pointWidth: 27,
    dataLabels: true,
    categories: ['Savings', 'Personal loans', 'Tax benefits'],
    xAxis: {
        title: 'Social media'
    },
    yAxis: {
        title: 'Percentage'
    },
    tooltip: {
        shared: true
    },
    series: [
        {
            name: 'Facebook',
            color: ch_facebook,
            data: [180, 130, 165]
        },
        {
            name: 'Twitter',
            color: ch_twitter,
            data: [103, 81, 92]
        },
        {
            name: 'Pinterest',
            color: ch_pinterest,
            data: [135, 69, 124]
        },
        {
            name: 'Website',
            color: ch_androidColor,
            data: [80, 89, 55]
        },
        {
            name: 'Tumblr',
            color: ch_iosColor,
            data: [80, 89, 55]
        }
    ]
}`

export const code_pyramid_chart_code_data = `st_pyramid_structure: {
    series: [
        {
            name: 'Known users',
            y: 203,
            color: ch_knownColor
        },
        {
            name: 'Identified users',
            y: 144,
            color: ch_identifiedColor
        },
        {
            name: 'Converted',
            y: 108,
            color: ch_convertedColor
        }
    ]
}`

export const code_pyramid_reverse_chart_code_data = `st_pyramid_reverse_structure: {
    reversed: true,
    series: [
        {
            name: 'Demographic',
            y: 1788,
            color: "#66c7ea"
        },
        {
            name: 'Engagement',
            y: 1998,
            color: "#5ab5e6"
        },
        {
            name: 'Product interest',
            y: 2001,
            color: "#4e9ce0"
        },
        {
            name: 'Social referral',
            y: 2002,
            color: "#3568c6"
        },
        {
            name: 'Purchase intent',
            y: 1565,
            color: "#132385"
        }
    ]
}`

export const code_pie_chart_code_data = `st_pie_structure: {
    series: [
        {
            name: 'Android',
            y: 77,
            color: ch_androidColor
        },
        {
            name: 'iOS',
            y: 23,
            color: ch_iosColor
        }
    ]
}`

export const code_variable_pie_value_chart_code_data = `st_variable_pie_value_data_structure: {
    name: 'Leads generated',
    dataLabels: true,
    series: [
        // { name: "Notifications", color: ch_notifications, y: 6, z: 6 },
        { name: "Email", color: ch_email, y: 7, z: 7 },
        { name: "QR code", color: ch_qR_code, y: 12, z: 12 },
        { name: "Pinterest", color: ch_pinterest, y: 15, z: 15 },
        { name: "Facebook", color: ch_facebook, y: 20, z: 20 },
        { name: "Twitter", color: ch_twitter, y: 40, z: 40 },
    ]
}`

export const code_variable_pie_img_chart_code_data = `st_variable_pie_img_data_structure: {
    name: 'Leads generated',
    dataLabels: true,
    icon: true,
    series: [
        { name: "Email", color: ch_email, y: 7, z: 7 },
        { name: "QR code", color: ch_qR_code, y: 12, z: 12 },
        { name: "Pinterest", color: ch_pinterest, y: 15, z: 15 },
        { name: "Facebook", color: ch_facebook, y: 20, z: 20 },
        { name: "Twitter", color: ch_twitter, y: 40, z: 40 },
    ]
}`

export const code_gauge_chart_code_data = `st_gauge_structure: {
    series: [
        {
            from: 0,
            to: 24,
            color: '#e8e8ea',
            outerRadius: '105%',
            thickness: '5%'
        },
        {
            from: 7,
            to: 8,
            color: ch_secondary_green,
            outerRadius: '105%',
            thickness: '5%'
        },
        {
            from: 9,
            to: 10,
            color: ch_primary_green,
            outerRadius: '105%',
            thickness: '5%'
        },
        {
            from: 10,
            to: 11,
            color: ch_clockchart1,
            outerRadius: '105%',
            thickness: '5%'
        },
        {
            from: 11,
            to: 12,
            color: ch_clockchart2,
            outerRadius: '105%',
            thickness: '5%'
        }
    ],
    data: [9, 10]
}`

export const code_map_chart_code_data = `st_map_structure: {
    series: [
        {
            zoomLevel: 10,
            country: 'India',
            state: 'Patna',
            lat: Number(25.5908),
            lon: Number(85.1348)
        }
    ]
}`

export const code_sankey_chart_code_data = `st_sankey_structure: {
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
        { from: 'Unknown', to: 'Loans', value: 166 }
    ]
}`