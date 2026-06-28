import { ch_completed, ch_draft } from 'Constants/GlobalConstant/Colors/colorsVariable';
import { data_medium, email_medium, goal_summary_data_view_medium, pdf_medium, report_medium, timeline_medium, user_network_medium } from 'Constants/GlobalConstant/Glyphicons';
import DataAttribute from './Components/Audience/AudienceDetail/Components/DataAttribute';
import Timeline from './Components/Audience/AudienceDetail/Components/Timeline';
// Main Index File
{
    /* // ICON_UPDATE {Stephen}: Update the icons */
}
export const downloadIcons = [
    <>
        <i className={`${report_medium} icon-md pr10 ${'active' && 'color-secondary-white'} `} /> Report
    </>,
    <>
        <i className={`${pdf_medium} icon-md pr10 ${'active' && 'color-secondary-white'} `} /> PDF
    </>,
    <>
        <i className={`${email_medium} icon-md pr10 ${'active' && 'color-secondary-white'} `} /> Email
    </>,
];

// Path to Persona
// export const pathTypes = ['Path to conversion (persona)', 'Path to conversion (goal)'];
export const pathTypes = ['Path to conversion (goal)'];
export const cardTypes = ['Online purchase journey', 'Credit card apply'];
export const platform = ['Web', 'Mobile'];
export const noOfDays = ['Last 30 days', 'Last 60 days', 'Last 90 days'];
/** Bar chart plot height inside path conversion portlet (matches flow chart area). */
export const PATH_CONVERSION_BAR_CHART_HEIGHT = 415;
export const column_stacked_inside_data_structure = {
    stacking: true, 
    pointWidth: 30,
    dataLabels: true,
    isCustomDataLabelStyle : true,
    categories: [
        // 'Active the Card',
        // 'Credit the PIN',
        // 'Registered in Mobile app',
        // 'Set the Preferences',
        // 'Completed the first transaction',
    ],
    yAxis: {
        tickInterval: 30,
        max: null, 
        showAsPercentage: true,
    },
    tooltip: {
        shared: true,
        percent: true,
    },
    series: [
        {
            name: 'Failed',
            color: ch_draft,
            data: [],
            inside: true,
        },
        {
            name: 'Success',
            color: ch_completed,
            data: [],
            inside: true,
        },
    ],
};
export const pathPersonaFlowChart = {
    Parent: {
        FriendlyName: 'Location Selection',
        FailPercentage: '23.08',
        SuccessPercentage: '76.92',
        WindowID: 1,
        AudienceCount: 3,
        Query: "select count(distinct rpid) AS PassportId from resul_sdk_b9B.customevent_web where FieldTracks='Location selected';",
        ActualCounty: '13',
    },
    Child: [
        {
            FriendlyName: 'Doctor Selection',
            FailPercentage: '-70.0',
            SuccessPercentage: '76.92',
            WindowID: 2,
            AudienceCount: -7,
            Query: "select count(distinct rpid) AS PassportId from resul_sdk_b9B.customevent_web where FieldTracks='Doctor selected';",
            ActualCounty: '10',
        },
        {
            FriendlyName: 'Consulting Type',
            FailPercentage: '17.65',
            SuccessPercentage: '76.92',
            WindowID: 3,
            AudienceCount: 3,
            Query: "select count(distinct rpid) AS PassportId from resul_sdk_b9B.customevent_web where FieldTracks='Consultation method selected with proceed';",
            ActualCounty: '17',
        },
        {
            FriendlyName: 'Appointment Slot',
            FailPercentage: '0',
            SuccessPercentage: '76.92',
            WindowID: 4,
            AudienceCount: 0,
            Query: "select count(distinct rpid) AS PassportId from resul_sdk_b9B.customevent_web where FieldTracks='Appointment slot Selected with proceed';",
            ActualCounty: '14',
        },
        {
            FriendlyName: 'One-time password verification',
            FailPercentage: '28.57',
            SuccessPercentage: '76.92',
            WindowID: 5,
            AudienceCount: 4,
            Query: "select count(distinct rpid) AS PassportId from resul_sdk_b9B.customevent_web where FieldTracks='OTP verified';",
            ActualCounty: '14',
        },
        {
            FriendlyName: 'Patient Selected',
            FailPercentage: '10.0',
            SuccessPercentage: '76.92',
            WindowID: 6,
            AudienceCount: 1,
            Query: "select count(distinct rpid) AS PassportId from resul_sdk_b9B.customevent_web where FieldTracks='Family member selected with proceed';",
            ActualCounty: '10',
        },
        {
            FriendlyName: 'Payment Done',
            FailPercentage: '0.00',
            SuccessPercentage: '76.92',
            WindowID: 7,
            AudienceCount: '9',
            Query: "select count(distinct rpid) AS PassportId from resul_sdk_b9B.customevent_web where FieldTracks='Paynow button clicked';",
            ActualCounty: '9',
        },
    ],
    EndPoint: {
        FriendlyName: 'Failed',
        WindowID: 8,
    },
};

export const GoalPathConversionData = {
    Day30: {
        Parent: {
            FriendlyName: 'App Opened',
            FailPercentage: '100',
            WindowID: 1,
            AudienceCount: 20064,
            Query: "https://10.200.2.12:1102//get_event_userdata?Events=['App Opened']&AppGuid=3e7c9e49-2bf1-4187-ad2a-1d20b0f0c40f&op_format=data&FromDate=2024-02-07&T1=w39&ToDate=2024-03-07",
            ActualCount: '73828',
        },
        Child: [
            {
                FriendlyName: 'Item Viewed',
                FailPercentage: '27.18',
                WindowID: 2,
                AudienceCount: 13033,
                Query: "https://10.200.2.12:1102//get_event_userdata?Events=['App Opened','Item Viewed']&AppGuid=3e7c9e49-2bf1-4187-ad2a-1d20b0f0c40f&op_format=data&FromDate=2024-02-07&T1=w39&ToDate=2024-03-07",
                ActualCount: '53764',
            },
            {
                FriendlyName: 'Add To Card',
                FailPercentage: '24.24',
                WindowID: 3,
                AudienceCount: 12966,
                Query: "https://10.200.2.12:1102//get_event_userdata?Events=['App Opened','Item Viewed','Add To Cart']&AppGuid=3e7c9e49-2bf1-4187-ad2a-1d20b0f0c40f&op_format=data&FromDate=2024-02-07&T1=w39&ToDate=2024-03-07",
                ActualCount: '40731',
            },
            {
                FriendlyName: 'Checkout Click',
                FailPercentage: '31.83',
                WindowID: 4,
                AudienceCount: 3620,
                Query: "https://10.200.2.12:1102//get_event_userdata?Events=['App Opened','Item Viewed','Add To Cart','Checkout Click']&AppGuid=3e7c9e49-2bf1-4187-ad2a-1d20b0f0c40f&op_format=data&FromDate=2024-02-07&T1=w39&ToDate=2024-03-07",
                ActualCount: '27765',
            },
            {
                FriendlyName: 'Delivery Mode Selection',
                FailPercentage: '13.04',
                WindowID: 5,
                AudienceCount: 24060,
                Query: "https://10.200.2.12:1102//get_event_userdata?Events=['App Opened','Item Viewed','Add To Cart','Checkout Click','Delivery Mode Selection']&AppGuid=3e7c9e49-2bf1-4187-ad2a-1d20b0f0c40f&op_format=data&FromDate=2024-02-07&T1=w39&ToDate=2024-03-07",
                ActualCount: '24145',
            },
            {
                FriendlyName: 'Payment Mode Selection',
                FailPercentage: '99.65',
                WindowID: 6,
                AudienceCount: 85,
                Query: "https://10.200.2.12:1102//get_event_userdata?Events=['App Opened','Item Viewed','Add To Cart','Checkout Click','Delivery Mode Selection','Payment Mode Selection']&AppGuid=3e7c9e49-2bf1-4187-ad2a-1d20b0f0c40f&op_format=data&FromDate=2024-02-07&T1=w39&ToDate=2024-03-07",
                ActualCount: '85',
            },
            {
                FriendlyName: 'Order Confirmation',
                FailPercentage: '100',
                WindowID: 7,
                AudienceCount: '0',
                Query: "https://10.200.2.12:1102//get_event_userdata?Events=['App Opened','Item Viewed','Add To Cart','Checkout Click','Delivery Mode Selection','Payment Mode Selection','Order Confirmation']&AppGuid=3e7c9e49-2bf1-4187-ad2a-1d20b0f0c40f&op_format=data&FromDate=2024-02-07&T1=w39&ToDate=2024-03-07",
                ActualCount: '0',
            },
        ],
        EndPoint: {
            FriendlyName: 'Failed',
            WindowID: 8,
        },
        LastRunDateTime: '2024-03-07 01:05:14',
    },
    Day60: {
        Parent: {
            FriendlyName: 'App Opened',
            FailPercentage: '100',
            WindowID: 1,
            AudienceCount: 22591,
            Query: "https://10.200.2.12:1102//get_event_userdata?Events=['App Opened']&AppGuid=3e7c9e49-2bf1-4187-ad2a-1d20b0f0c40f&op_format=data&FromDate=2024-01-08&T1=w39&ToDate=2024-03-07",
            ActualCount: '91929',
        },
        Child: [
            {
                FriendlyName: 'Item Viewed',
                FailPercentage: '24.57',
                WindowID: 2,
                AudienceCount: 16769,
                Query: "https://10.200.2.12:1102//get_event_userdata?Events=['App Opened','Item Viewed']&AppGuid=3e7c9e49-2bf1-4187-ad2a-1d20b0f0c40f&op_format=data&FromDate=2024-01-08&T1=w39&ToDate=2024-03-07",
                ActualCount: '69338',
            },
            {
                FriendlyName: 'Add To Card',
                FailPercentage: '24.18',
                WindowID: 3,
                AudienceCount: 18372,
                Query: "https://10.200.2.12:1102//get_event_userdata?Events=['App Opened','Item Viewed','Add To Cart']&AppGuid=3e7c9e49-2bf1-4187-ad2a-1d20b0f0c40f&op_format=data&FromDate=2024-01-08&T1=w39&ToDate=2024-03-07",
                ActualCount: '52569',
            },
            {
                FriendlyName: 'Checkout Click',
                FailPercentage: '34.95',
                WindowID: 4,
                AudienceCount: 5516,
                Query: "https://10.200.2.12:1102//get_event_userdata?Events=['App Opened','Item Viewed','Add To Cart','Checkout Click']&AppGuid=3e7c9e49-2bf1-4187-ad2a-1d20b0f0c40f&op_format=data&FromDate=2024-01-08&T1=w39&ToDate=2024-03-07",
                ActualCount: '34197',
            },
            {
                FriendlyName: 'Delivery Mode Selection',
                FailPercentage: '16.13',
                WindowID: 5,
                AudienceCount: 28539,
                Query: "https://10.200.2.12:1102//get_event_userdata?Events=['App Opened','Item Viewed','Add To Cart','Checkout Click','Delivery Mode Selection']&AppGuid=3e7c9e49-2bf1-4187-ad2a-1d20b0f0c40f&op_format=data&FromDate=2024-01-08&T1=w39&ToDate=2024-03-07",
                ActualCount: '28681',
            },
            {
                FriendlyName: 'Payment Mode Selection',
                FailPercentage: '99.50',
                WindowID: 6,
                AudienceCount: 142,
                Query: "https://10.200.2.12:1102//get_event_userdata?Events=['App Opened','Item Viewed','Add To Cart','Checkout Click','Delivery Mode Selection','Payment Mode Selection']&AppGuid=3e7c9e49-2bf1-4187-ad2a-1d20b0f0c40f&op_format=data&FromDate=2024-01-08&T1=w39&ToDate=2024-03-07",
                ActualCount: '142',
            },
            {
                FriendlyName: 'Order Confirmation',
                FailPercentage: '100',
                WindowID: 7,
                AudienceCount: '0',
                Query: "https://10.200.2.12:1102//get_event_userdata?Events=['App Opened','Item Viewed','Add To Cart','Checkout Click','Delivery Mode Selection','Payment Mode Selection','Order Confirmation']&AppGuid=3e7c9e49-2bf1-4187-ad2a-1d20b0f0c40f&op_format=data&FromDate=2024-01-08&T1=w39&ToDate=2024-03-07",
                ActualCount: '0',
            },
        ],
        EndPoint: {
            FriendlyName: 'Failed',
            WindowID: 8,
        },
        LastRunDateTime: '2024-03-07 01:47:17',
    },
    Day90: {
        Parent: {
            FriendlyName: 'App Opened',
            FailPercentage: '100',
            WindowID: 1,
            AudienceCount: 22756,
            Query: "https://10.200.2.12:1102//get_event_userdata?Events=['App Opened']&AppGuid=3e7c9e49-2bf1-4187-ad2a-1d20b0f0c40f&op_format=data&FromDate=2023-12-09&T1=w39&ToDate=2024-03-07",
            ActualCount: '92643',
        },
        Child: [
            {
                FriendlyName: 'Item Viewed',
                FailPercentage: '24.56',
                WindowID: 2,
                AudienceCount: 16919,
                Query: "https://10.200.2.12:1102//get_event_userdata?Events=['App Opened','Item Viewed']&AppGuid=3e7c9e49-2bf1-4187-ad2a-1d20b0f0c40f&op_format=data&FromDate=2023-12-09&T1=w39&ToDate=2024-03-07",
                ActualCount: '69887',
            },
            {
                FriendlyName: 'Add To Card',
                FailPercentage: '24.21',
                WindowID: 3,
                AudienceCount: 18508,
                Query: "https://10.200.2.12:1102//get_event_userdata?Events=['App Opened','Item Viewed','Add To Cart']&AppGuid=3e7c9e49-2bf1-4187-ad2a-1d20b0f0c40f&op_format=data&FromDate=2023-12-09&T1=w39&ToDate=2024-03-07",
                ActualCount: '52968',
            },
            {
                FriendlyName: 'Checkout Click',
                FailPercentage: '34.94',
                WindowID: 4,
                AudienceCount: 5582,
                Query: "https://10.200.2.12:1102//get_event_userdata?Events=['App Opened','Item Viewed','Add To Cart','Checkout Click']&AppGuid=3e7c9e49-2bf1-4187-ad2a-1d20b0f0c40f&op_format=data&FromDate=2023-12-09&T1=w39&ToDate=2024-03-07",
                ActualCount: '34460',
            },
            {
                FriendlyName: 'Delivery Mode Selection',
                FailPercentage: '16.20',
                WindowID: 5,
                AudienceCount: 28730,
                Query: "https://10.200.2.12:1102//get_event_userdata?Events=['App Opened','Item Viewed','Add To Cart','Checkout Click','Delivery Mode Selection']&AppGuid=3e7c9e49-2bf1-4187-ad2a-1d20b0f0c40f&op_format=data&FromDate=2023-12-09&T1=w39&ToDate=2024-03-07",
                ActualCount: '28878',
            },
            {
                FriendlyName: 'Payment Mode Selection',
                FailPercentage: '99.49',
                WindowID: 6,
                AudienceCount: 148,
                Query: "https://10.200.2.12:1102//get_event_userdata?Events=['App Opened','Item Viewed','Add To Cart','Checkout Click','Delivery Mode Selection','Payment Mode Selection']&AppGuid=3e7c9e49-2bf1-4187-ad2a-1d20b0f0c40f&op_format=data&FromDate=2023-12-09&T1=w39&ToDate=2024-03-07",
                ActualCount: '148',
            },
            {
                FriendlyName: 'Order Confirmation',
                FailPercentage: '100',
                WindowID: 7,
                AudienceCount: '0',
                Query: "https://10.200.2.12:1102//get_event_userdata?Events=['App Opened','Item Viewed','Add To Cart','Checkout Click','Delivery Mode Selection','Payment Mode Selection','Order Confirmation']&AppGuid=3e7c9e49-2bf1-4187-ad2a-1d20b0f0c40f&op_format=data&FromDate=2023-12-09&T1=w39&ToDate=2024-03-07",
                ActualCount: '0',
            },
        ],
        EndPoint: {
            FriendlyName: 'Failed',
            WindowID: 8,
        },
        LastRunDateTime: '2024-03-07 01:47:18',
    },
};
// Audience Report
export const audienceReportTypes = ['All', 'Advocates', 'Influencers', 'Spectators', 'Critics'];
export const campaignGroups = [
    'Credit card acquisition',
    'Amazon Great shopping festival',
    'Personal loan acquisition',
];
export const view = ['List view', 'Cloud view', 'Grid view'];

// Detailed view of Audience
export const SEARCH_CONFIG = ['Audience', 'Channel', 'Campaign'];
// export const SEARCH_CONFIG = [
//     {
//         type: 'input',
//         label: 'Audience',
//         config: {
//             name: 'audience',
//         },
//     },
//     {
//         type: 'input',
//         label: 'Channel',
//         config: {
//             name: 'channel',
//         },
//     },
//     {
//         type: 'input',
//         label: 'Campaign',
//         config: {
//             name: 'campaign',
//         },
//     }
// ];
export const SEARCH_CONFIG_AUDIENCE = [
    {
        type: 'input',
        label: 'Audience',
        config: {
            name: 'audience',
        },
    },
    {
        type: 'input',
        label: 'Channel',
        config: {
            name: 'channel',
        },
    },
    {
        type: 'input',
        label: 'Campaign',
        config: {
            name: 'Campaign',
        },
    },
];

export const SEARCH_FORM_STATE = {
    audience: '',
    channel: '',
    campaign: '',
};

{
    /* // ICON_UPDATE {Stephen}: Update the icons */
}
export const detailedAudienceReportComponent = [
    {
        name: 'Timeline',
        component: Timeline,
        icon: timeline_medium,
    },
    {
        name: 'Data attribute (Beta)',
        component: DataAttribute,
        icon: data_medium,
    },
    // {
    //     name: 'Goal settings',
    //     component: GoalSettings,
    //     icon: goal_summary_data_view_medium,
    // },
    // {
    //     name: 'Connection',
    //     component: Connection,
    //     icon: user_network_medium,
    // },
];

// Data Attribute
export const regularAttribute = [
    {
        BenchmarkId: 0,
        AttributeName: 'Interest',
        UpdateDateTime: 'Sun, May 01, 2022 09:24:47',
        Value: 'Lorem',
    },
    {
        BenchmarkId: 1,
        AttributeName: 'Maturity date',
        UpdateDateTime: 'Tue, Oct 09, 2018 12:41:44',
        Value: 'Sun, Nov 27, 2022',
    },
    {
        BenchmarkId: 2,
        AttributeName: 'Annual income',
        UpdateDateTime: 'Mon, Mar 06, 2023 12:01:44',
        Value: '$120,000',
    },
    {
        BenchmarkId: 3,
        AttributeName: 'Propensity',
        UpdateDateTime: 'Wed, Mar 08, 2023 12:01:44',
        Value: '0.51 to 0.75',
    },
    {
        BenchmarkId: 4,
        AttributeName: 'Audience score',
        UpdateDateTime: 'Sat, Apr 01, 2023 12:01:44',
        Value: 'ABC110A',
    },
    {
        BenchmarkId: 5,
        AttributeName: 'Job title',
        UpdateDateTime: 'Thu, Nov 17, 2022 16: 01: 44',
        Value: 'Brand manager',
    },
];

export const accordAttributeConfig = [
    {
        field: 'Value',
        title: 'Value',
    },
    {
        field: 'UpdateDateTime',
        title: 'Update date/time',
    },
    {
        field: 'UpdatedSource',
        title: 'Updated Source',
    },
];

export const dataAttributes = [
    { title: 'City', data: regularAttribute, column: accordAttributeConfig },
    { title: 'Designation', data: regularAttribute, column: accordAttributeConfig },
    { title: 'Account Category', data: regularAttribute, column: accordAttributeConfig },
];

export const GetSuccessPercentage = (prevSuccess, failPercentage) => {
    let successPercent = 100 - failPercentage;
    return (successPercent / 100) * prevSuccess;
};

export const GetFailPercentage = (prevSuccess, failPercentage) => {
    return (failPercentage / 100) * prevSuccess;
};
export const StandardNumberFormat = (num, fracDigit = 2) => {
    return new Intl.NumberFormat('en', {
        maximumFractionDigits: fracDigit,
        notation: 'compact',
        compactDisplay: 'short',
    }).format(num);
};
export const GetLastDays = (lastDay) => {
    let day = lastDay.includes('30')
        ? 'Day30'
        : lastDay.includes('60')
        ? 'Day60'
        : lastDay.includes('90')
        ? 'Day90'
        : 'Day30';
    return day;
};
export const GenerateCsvContent = (goalJSON, lastDay) => {
    let day = GetLastDays(lastDay);
    let rows = [['Friendly Name', 'Actual Count', 'Success %', 'Fail %']];

    const { Parent, Child, EndPoint } = goalJSON[day];
    rows = [...rows, [Parent.FriendlyName, Parent.ActualCount, 100, 0]];

    let prevSucces = 100;
    Child.forEach((item, index) => {
        let success = GetSuccessPercentage(prevSucces, item['FailPercentage']);
        let fail = GetFailPercentage(prevSucces, item['FailPercentage']);
        let successFormatNumber = StandardNumberFormat(success);
        let failFormattedNumber = StandardNumberFormat(fail);
        rows = [...rows, [item.FriendlyName, item.ActualCount, successFormatNumber, failFormattedNumber]];
        prevSucces = success;
    });
    console.table(rows);
    //let csvContent = 'data:text/csv;charset=utf-8,';
    let csvContent = '';

    rows.forEach(function (rowArray) {
        let row = rowArray.join(',');
        csvContent += row + '\r\n';
    });
    return csvContent;
};

export const GetChartData = (chartData) => {
    if (chartData && Object.keys(chartData)?.length) {
        const { Parent, Child } = chartData;
        let category = [Parent.FriendlyName];
        let failAry = [0]; 
        let successAry = [100];
        Child.forEach((item) => {
            category = [...category, item.FriendlyName];
            let successPercentage, failPercentage;
            if (item.SuccessPercentage !== undefined && item.SuccessPercentage !== null) {
                successPercentage = parseFloat(item.SuccessPercentage);
                failPercentage = parseFloat(item.FailPercentage);
                if (failPercentage < 0) {
                    failPercentage = 0;
                }
            } else {
                let prevSucces = successAry[successAry.length - 1]; // Get the last success value
                successPercentage = GetSuccessPercentage(prevSucces, parseFloat(item['FailPercentage']));
                failPercentage = GetFailPercentage(prevSucces, parseFloat(item['FailPercentage']));
            }
            let successFormatNumber = StandardNumberFormat(successPercentage, 1);
            let failFormattedNumber = StandardNumberFormat(failPercentage, 1);
            let failValue = parseFloat(failFormattedNumber) || 0;
            let successValue = parseFloat(successFormatNumber) || 0;
            
            failAry = [...failAry, failValue];
            successAry = [...successAry, successValue];
        });
        let template = column_stacked_inside_data_structure;
        let chartJson = {
            ...template,
            categories: category,
            series: [
                { ...template.series[0], data: failAry },
                { ...template.series[1], data: successAry },
            ],
        };
        return chartJson;
    } else {
        return {};
    }
};
