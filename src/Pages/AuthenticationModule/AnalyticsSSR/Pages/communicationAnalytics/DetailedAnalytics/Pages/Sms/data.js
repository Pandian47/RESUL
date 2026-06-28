
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
            performance: reach?.isLowReachPerformance,
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
            performance: engagement?.isLowEngPerformance,
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
];

export const keyMetrixData = (keyMetrix,isCG = false, showUniqueSent = false) => {
    const {
        totalSent,
        delivered,
        messageinqueue,
        submittedtocarrier,
        goalConversionRatePercentage,
        goalConversionValue,
        onlineconversion,
        offlineconversion,
        softbounced,
        quarantined,
        rejected,
        dnd,
        expired,
        undelivered,
        unsubscribed,
        suppressionlist,
        frequencycap,
        controlgroup,
        conversionCostAmount,
        offlineConversionCost,
        onlineConverisonCost,
        onlineConverisonCount,
        offlineConversionCount,
        onlineConverisonValue,
        offlineConversionValue,
        uniquesent
    } = keyMetrix;
    
    const firstData = [
        {
            isOpen: false,
            name: isCG ? 'Total control': 'Total sent',
            value:isCG ? controlgroup : totalSent,
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
        middleDataTitle: 'In progress reach status',
        middleDataBg: [
            {
                name: 'Message in queue',
                value: messageinqueue,
            },
            {
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
                currency: conversionCostAmount,
                infoPopup: [
                    { text: 'Online', count: onlineConverisonValue ?? onlineConverisonCount, value: onlineConverisonCost },
                    { text: 'Offline', count: offlineConversionValue ?? offlineConversionCount, value: offlineConversionCost },
                ],
            },
        ],
        lastDataTitle: 'Undelivered message status',
        lastDataBg: [
            {
                name: 'Rejected',
                value: rejected,
            },
            {
                name: 'DND',
                value: dnd,
            },
            {
                name: 'Expired',
                value: expired,
            },
            {
                name: 'Undelivered',
                value: undelivered,
            },
        ],
    };
};
