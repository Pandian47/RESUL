import { getUserDetails } from 'Utils/modules/crypto';
import { getmasterData } from 'Utils/modules/masterData';
export const overview_data = (reach, engagement, conversion) => [
    {
        name: 'Reach',
        value: reach?.count,
        lists: [
            {
                text: 'Sessions',
                value: reach?.sessions || reach?.count,
            },
            {
                text: 'Page views',
                value: reach?.pageViews || reach?.forwards,
            },
        ],
        footer: {
            name: reach?.prevDisplayLabel,
            value: reach?.previousComparisonValue,
            performance: reach?.isLowReachPerformance,
        },
    },
    {
        name: 'Engagement',
        value: engagement?.count,
        lists: [
            {
                text: 'Link clicks',
                percent: engagement?.linkClicks,
            },
            // {
            //     text: 'Total clicks',
            //     value: engagement?.totalclicks || engagement?.forwardmailclicks,
            // },
        ],
        footer: {
            name: engagement?.prevDisplayLabel,
            value: engagement?.previousComparisonValue,
            performance: engagement?.isLowEngPerformance,
        },
    },
    {
        name: 'Conversion',
        value: conversion?.count,
        lists: [
             {
                text: 'Registration',
                percent: engagement?.registration,
            },
        ],
        footer: {
            name: conversion?.prevDisplayLabel,
            value: conversion?.previousComparisonValue,
            performance: conversion?.isLowConvPerformance,
        },
    },
];

export const keyMetrixData = (keyMetrix, isCG = false, showUniqueSent = false) => {
    const {
        sessions,
        pageViews,
        directTraffic,
        searchEngine,
        referrer,
        goalConversionRate,
        goalConversionValue,
        bounceRate,
        avgTimeOnsite,
        goalOfflineConversionValue,
        goalOnlineConversionValue,
        offlineConversionValue,
        onlineConversionValue,
        totalSent,
        controlgroup,
        uniquesent,
        sessionDuration,
        duration_table
    } = keyMetrix || {};
    
    const { currencyMasterList } = getmasterData();
    const { currencyId } = getUserDetails();
    let currsymbol = '₹';
    const matchingCurrency = currencyMasterList?.find((currency) => currency.currencyID === currencyId);
    currsymbol = matchingCurrency ? matchingCurrency.currenySymbol : currsymbol;
    
    const firstData = [
        {
            isOpen: false,
            name: 'Sessions',
            value: sessions || duration_table?.reduce((acc, item) => acc + item.sessions, 0) || 0,
        },
        {
            isOpen: false,
            name: 'Page views',
            value: pageViews || duration_table?.reduce((acc, item) => acc + item.page_views, 0) || 0,
        },
    ];
    
    return {
        firstData,
        middleDataTitle: 'Traffic by source',
        middleDataBg: [
            {
                name: 'Avg time spent',
                value: sessionDuration || 0,
            },
            {
                name: 'Avg screen/session',
                value: sessions || 0,
            },
        ],
        lastData: [
            {
                name: 'Goal conversion rate',
                percent: goalConversionRate || 0,
            },
            ...(goalConversionValue !== undefined && goalConversionValue !== null ? [{
                name: 'Conversion value',
                currency: goalConversionValue,
                infoPopup: [
                    { text: `Online:`, count: `${currsymbol}${onlineConversionValue || 0} (${goalOnlineConversionValue || 0})` },
                    { text: `Offline:`, count: `${currsymbol}${offlineConversionValue || 0} (${goalOfflineConversionValue || 0})` },
                ],
            }] : []),
        ],
        lastDataTitle: 'Engagement metrics',
        lastDataBg: [
            {
                name: 'Bounce rate',
                value: bounceRate || 0,
            },
            {
                name: 'Avg. time onsite',
                value: avgTimeOnsite || 0,
            },
        ],
    };
};

const webAnalyticsData = {
    overview_data,
    keyMetrixData,
    splitDataList: [],
};

export default webAnalyticsData;
