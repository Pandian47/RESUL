import { daysCount } from 'Constants/Charts/commonFunction';
import { ch_completed, ch_direct_mail, ch_email, ch_inprogress, ch_mobile_push, ch_notifications, ch_sms, ch_web_push } from 'Constants/GlobalConstant/Colors/colorsVariable';
import OperationTableview from './Component/OperationTableview';

export const TOP_COMMUNICATION_HEADER = ['Communication name', 'No. of target audience', 'No. of communications'];
export const TOP_PRODUCT_HEADER = ['Product name', 'No. of target audience', 'No. of communications'];
export const UNIQUE_AUDIENCE_DROPDOWN = ['Email', 'SMS', 'Mobile push', 'Web push'];

export const TOP_COMMUNICATION_DATA = [
    {
        communicationName: 'Awarness',
        targetAudience: '10.0M',
        campaigns: '5',
    },
    {
        communicationName: 'Greetings',
        targetAudience: '3.0M',
        campaigns: '11',
    },
    {
        communicationName: 'New product launch',
        targetAudience: '2.0M',
        campaigns: '4',
    },
    {
        communicationName: 'Promotion',
        targetAudience: '1.0M',
        campaigns: '5',
    },
    {
        communicationName: 'Sale',
        targetAudience: '1.5M',
        campaigns: '8',
    },
];
export const TOP_PRODUCT_DATA = [
    {
        communicationName: 'Mutual fund',
        targetAudience: '5.0M',
        campaigns: '11',
    },
    {
        communicationName: 'Credit card',
        targetAudience: '3.0M',
        campaigns: '5',
    },
    {
        communicationName: 'Fixed deposit',
        targetAudience: '2.0M',
        campaigns: '5',
    },
    {
        communicationName: 'Loans',
        targetAudience: '1.0M',
        campaigns: '4',
    },
    {
        communicationName: 'Personal loan',
        targetAudience: '6.5M',
        campaigns: '8',
    },
];
export const TOP_COMMUNICATIONS_AND_PRODUCTTYPE_TAB_CONFIG = [
    {
        id: 'Top Communication Type',
        text: 'Top communication type',
        textClass: 'font-sm',
        // component: 'Top Communication Type',
        component: () => (
            <OperationTableview tableHeader={TOP_COMMUNICATION_HEADER} tableBody={TOP_COMMUNICATION_DATA} />
        ),
    },
    {
        id: 'Top Product types',
        text: 'Top product types',
        textClass: 'font-sm',
        component: () => <OperationTableview tableHeader={TOP_PRODUCT_HEADER} tableBody={TOP_PRODUCT_DATA} />,
    },
];

export const OPERATION_DASHBOARD_DATA = {
    audience_summary_chartData: {
        // height: 300,
        // image:  '<div class="guageclock">&nbsp;</div>',
        dataLabels: {
            enabled: false,
        },
        series: [
            { name: 'Email', y: 10, color: ch_email },
            { name: 'SMS', y: 5, color: ch_sms },
            { name: 'Mobile push', y: 2, color: ch_mobile_push },
            { name: 'Web push', y: 2, color: ch_web_push },
        ],
    },
    event_trigger_chartData: {
        xAxis: {
            title: '',
            labels: ''
        },
        legend: {
            marginTop: 5,
        },
        series: [
            {
                name: 'Email',
                color: ch_email,
                data: [10],
                legendIndex: 0,
            },
            {
                name: 'SMS',
                color: ch_sms,
                data: [3],
                legendIndex: 1,
            },
            {
                name: 'Mobile push',
                color: ch_mobile_push,
                data: [2],
                legendIndex: 2,
            },
            {
                name: 'Web push',
                color: ch_web_push,
                data: [1],
                legendIndex: 3,
            },
        ],
    },
    Platform_utillisation_chartData: {
        xAxis: {
            title: 'Users',
            labels: ''
        },
        yAxis: {
            title: '',
        },
        series: [
            {
                name: 'Live',
                color: ch_completed,
                data: [22],
            },
            {
                name: 'Active',
                color: ch_direct_mail,
                data: [45],
            },
            {
                name: 'Concurrent',
                color: ch_inprogress,
                data: [30],
            },
            {
                name: 'Inactive',
                color: ch_notifications,
                data: [18],
            },
        ],
    },
    communication_performance_chartData: {
        xAxis: {
            title: '',
            // tickInterval: 4
        },
        yAxis: {
            title: 'Delivered',
        },
        categories: daysCount(7),
        series: [
            {
                name: 'Email',
                data: [432, 313, 463, 349, 415, 425, 422],
                color: ch_email,
            },
            {
                name: 'mobile',
                data: [106, 107, 111, 133, 121, 167, 166],
                color: ch_sms,
            },
            {
                name: 'Web push',
                data: [163, 103, 176, 108, 147, 129, 128],
                color: ch_web_push,
            },
            {
                name: 'Mobile push',
                data: [163, 103, 176, 108, 147, 129, 128],
                color: ch_mobile_push,
            },
        ],
    },
};
