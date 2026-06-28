import { getUserDetails } from 'Utils/modules/crypto';
import { getmasterData } from 'Utils/modules/masterData';
export const overview_data = (reach, engagement, conversion) => [
    {
        name: 'Reach',
        value: reach?.count,
        lists: [
            {
                text: 'Delivered',
                percent: reach?.delivered,
            },
        ],
        footer: {
            name: reach?.prevDisplayLabel,
            value: reach?.previousComparisonValue,
            performance: reach?.isLowReachPerformance
        },
    },
    {
        name: 'Engagement',
        value: engagement?.count,
        lists: [
            {
                text: 'Link clicks',
                percent: engagement?.lnkclicks,
            },
        ],
        footer: {
            name: engagement?.prevDisplayLabel,
            value: engagement?.previousComparisonValue,
            performance: engagement?.isLowEngPerformance
        },
    },
    {
        name: 'Conversion',
        value: conversion?.count,
        lists: [
            {
                text: 'Registration',
                percent: conversion?.registration || 0,
            },
        ],
        footer: {
            name: conversion?.prevDisplayLabel,
            value: conversion?.previousComparisonValue,
            performance: conversion?.isLowConvPerformance,
        },
    },
]

export const keyMetrixData = (keyMetrix,isCG = false, showUniqueSent = false) => {
    const { delivered, goalConversionRatePercentage, seen, offline, online,
        goalConversionValue, reported, blocked, rejected, undelivered,
        totalOpened, totalSent, dnd, unsubscribed, suppressionlist, frequencycap, controlgroup,
        softbounced, quarantined , totalclicks,goalOfflineConversionValue,goalOnlineConversionValue,offlineConversionValue,onlineConversionValue, uniquesent,submittedtocarrier} = keyMetrix;
        const { currencyMasterList } = getmasterData();
        const { currencyId } = getUserDetails();
        let currsymbol = '₹';
        const matchingCurrency = currencyMasterList?.find((currency) => currency.currencyID === currencyId);
        currsymbol = matchingCurrency ? matchingCurrency?.currenySymbol : currsymbol;
    
    const firstData = [
        {
            isOpen: false,
            name: isCG ? 'Total control' : 'Total audience',
            value: isCG? controlgroup : totalSent,
            infoPopup: [
                { text: 'DND', count: dnd },
                { text: 'Unsubscribed', count: unsubscribed },
                { text: 'Suppression list', count: suppressionlist },
                { text: 'Frequency cap', count: frequencycap },
                { text: 'Control group', count: controlgroup },
            ],
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
        name: 'Delivered',
        value: delivered,
        infoPopup: [
            { text: 'Soft bounced', count: softbounced },
            { text: 'Quarantined', count: quarantined },
        ],
    });
    
    return {
        firstData,
        middleDataTitle: 'In-progress reach status',
        middleDataBg: [
            {
                name: 'Seen',
                value: seen,
            },
            {
                name: 'Responded',
                value: totalclicks,
            }, {
                name: 'Awaiting vendor response',
                value: submittedtocarrier,
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
        lastDataTitle: 'Undelivered message status',
        lastDataBg: [
            // {
            //     name: 'Reported',
            //     value: reported,
            // },
            // {
            //     name: 'Blocked',
            //     value: blocked,
            // },
            {
                name: 'Rejected',
                value: rejected,
            },
            {
                name: 'Undelivered',
                value: undelivered,
            },
        ],
    }
}
