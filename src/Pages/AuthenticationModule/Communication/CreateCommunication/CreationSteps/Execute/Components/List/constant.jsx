import { statusIdCheck } from 'Utils/modules/campaignUtils';
import { ch_dark_grey, ch_light_blue, ch_light_grey } from 'Constants/GlobalConstant/Colors/colorsVariable';
export const list = {
    totalAudience: 700000,
    scrubbed: 12500,
    uniqueAudience: 694500,
    qrAudience: 25000,
};

export const FREQUENCY_CAP_LIST = ['Corporate Customer', 'NRI Customer', 'Cash back'];
export const SUPPRESSION_LIST = ['Email ID', 'Mobile number', 'City', 'Zipcode'];
export const ADVANCE_ANALYTICS_DATA = ['City', 'Gender', 'RM name', 'Industry', 'Product', 'Region'];

export const VOLUME_TYPE_DATA = ['Equal', 'Incremental'];

export const LIST_INITIAL_DATA = {
    defaultValues: {
        isEditFrequency: false,
        potentialAudience: '',
        frequencyCapList: false,
        selectFrequency: [],
        selectFrequencyList: [],
        frequencyOkay: false,
        limitAudience: '',
        limitCount: '',
        limitCountAgree: '',
        limitListDate: '',
        volumeType: '',
        volumePerDay: '',
        baseVolume: '',
        volumePercentage: '',
        audienceTimeData: [],
        suppressionList: false,
        selectSuppression: '',
        suppressionCSV: '',
        advancedAnalyticsList: false,
        selectAdvancedAnalytics: '',
        advancedAnalyticsOkay: false,
        sendMaxList: false,
        undelivered: false,
        didNotOpen: false,
        didNotClick: false,
        scrubbed: {
            spam: true,
            bounce: true,
            unsubscribed: true,
            lifetimeCap: true,
            customAttribute1: false,
            customAttribute2: false,
            agree: false,
        },
        scanCount: '',
        uniqueCheck: true,
        gateMessage: '',
        scanTime: '',
        limitScanBy: '',
        expectedAudience: 25000,
    },
};

export const LIMIT_LIST_COLUMN_DATA = [
    {
        field: 'day',
        title: 'Day',
    },
    {
        field: 'date',
        title: 'Date',
    },
    {
        field: 'audienceCount',
        title: 'Audience count',
        cell: ({ dataItem }) => {
            return <td className="text-right">{dataItem?.audienceCount}</td>;
        },
    },
];

export const INFO_CONTENT_CHARTDATA = {
    categories: [
        '00-02',
        '02-04',
        '04-06',
        '06-08',
        '08-10',
        '10-12',
        '12-14',
        '14-16',
        '16-18',
        '18-20',
        '20-22',
        '22-24',
    ],
    xAxis: {
        title: '',
    },
    yAxis: {
        title: '',
    },
    tooltip: {
        shared: true,
    },
    // pointWidth: 15,
    series: [
        {
            name: 'Active hours',
            color: ch_light_blue,
            data: ['', '', '', 22.8, 31.3, 39.12, 46.23, 55.54, 32.16, 35.57, 18.12, ''],
        },
        {
            name: 'Quiet hours',
            color: ch_light_grey,
            data: [5.16, 11.9, 8.05, '', '', '', '', '', '', '', '', 8.29],
        },
        {
            name: 'Non-STO ',
            color: ch_dark_grey,
            data: [],
        },
    ],
};

export const handleClickOff = (channelDetails) => {
    const statusId = channelDetails?.contentDetail?.content?.[0]?.channelStatusId;
    if (!statusIdCheck(statusId)) {
        return 'click-off';
    } else {
        return '';
    }
};
