import { getUserDetails } from 'Utils/modules/crypto';
import { getmasterData } from 'Utils/modules/masterData';
export const overview_data = (reach, engagement, conversion, isDynamicZone = false) => [
    {
        name: 'Reach',
        value: reach?.count,
        lists: [
            {
                text: isDynamicZone ? 'Impression' : 'Delivered',
                percent: reach?.delivered,
                info: [
                    {
                        text: 'Identified audience',
                        value: reach?.identifiedaudience,
                    },
                    {
                        text: 'Known audience',
                        value: reach?.knownaudience,
                    },
                    {
                        text: 'Unknown audience',
                        value: reach?.unknownaudience,
                    },
                ],
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
                text: 'Clicks',
                percent: engagement?.clicks,
                info: [
                    {
                        text: 'Identified audience',
                        value: engagement?.identifiedaudience,
                    },
                    {
                        text: 'Known audience',
                        value: engagement?.knownaudience,
                    },
                    {
                        text: 'Unknown audience',
                        value: engagement?.unknownaudience,
                    },
                ],
            },
        ],
        footer: {
            name: engagement?.prevDisplayLabel,
            value: engagement?.previousComparisonValue,
            performance: engagement?.isLowEngPerformance,
        },
    },
    {
        name: isDynamicZone ? 'CTR' : 'Conversion',
        value: conversion?.count,
        lists: [
            {
                text: isDynamicZone ? '' : 'Conversion',
                percent: conversion?.registration || 0,
                isDynamicZone: isDynamicZone
            },
        ],
        footer: {
            name: conversion?.prevDisplayLabel,
            value: conversion?.previousComparisonValue,
            performance: conversion?.isLowConvPerformance,
        },
        isDynamicZone: isDynamicZone
    },
];

export const keyMetrixData = (keyMetrix, showUniqueSent = false, isDynamicZone = false) => {
    const {
        delivered,
        goalConversionRatePercentage,
        goalConversionValue,
        offlineconversion,
        onlineconversion,
        totalSent,
        clicks,
        undelivered,
        maybelater,
        dismiss,
        unsubscribed,
        mismatchsenderid,
        notregistered,
        goalOfflineConversionValue,
        goalOnlineConversionValue,
        offlineConversionValue,
        onlineConversionValue,
        uniquesent,
        totalImpressionCount
    } = keyMetrix;
    const { currencyMasterList } = getmasterData();
    const { currencyId } = getUserDetails();
    let currsymbol = '₹';
    const matchingCurrency = currencyMasterList?.find((currency) => currency.currencyID === currencyId);
    currsymbol = matchingCurrency ? matchingCurrency?.currenySymbol : currsymbol;
    
    const firstData = [
        {
            isOpen: false,
            name: isDynamicZone ? 'Total impression' : 'Total sent',
            value: isDynamicZone ? totalImpressionCount : totalSent,
        },
    ];
    
    // Only include "Unique sent" if showUniqueSent is true
    if (showUniqueSent) {
        firstData.push({
            isOpen: false,
            name: 'Unique sent',
            value: uniquesent || 0,
        });
    }
    
    firstData.push({
        isOpen: false,
        name: isDynamicZone ? 'Unique impression' : 'Delivered',
        value: delivered,
    });
    
    return {
        firstData,
        middleDataTitle: 'Interactivity',
        middleDataBg: [
            {
                name: 'Clicks',
                value: clicks,
            },
            {
                name: 'Maybe later',
                value: maybelater,
            },
            {
                name: 'Dismiss',
                value: dismiss,
            },
        ],
        lastData: [
            {
                name: 'Goal conversion rate',
                percent: goalConversionRatePercentage,
            },
            {
                name: 'Conversion value',
                currency: goalConversionValue,
                infoPopup: [
                    { text: `Online:`, count:  `${currsymbol}${onlineConversionValue} (${goalOnlineConversionValue})` },
                    { text: `Offline:`, count: `${currsymbol}${offlineConversionValue} (${goalOfflineConversionValue})` },
                ],
            },
        ],
        lastDataTitle: 'Undelivered push notification status',
        lastDataBg: [
            {
                name: 'Undelivered',
                value: undelivered,
            },
            {
                name: 'Uninstalls',
                value: unsubscribed,
            },
            {
                name: 'Mismatch',
                value: mismatchsenderid,
            },
            {
                name: 'Expired',
                value: notregistered,
            },
        ],
    };
};
