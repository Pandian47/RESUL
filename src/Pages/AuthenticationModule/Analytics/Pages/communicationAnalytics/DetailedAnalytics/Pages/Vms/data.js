
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
                text: 'Answered',
                percent: engagement?.response,
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

export const keyMetrixData = (keyMetrix, showUniqueSent = false) => {
    const { totalSent, delivered, disconnected, userbusy, ringtimeout, averagecallduration, notreachable, dnd, uniquesent } = keyMetrix;
    
    const firstData = [
        {
            isOpen: false,
            name: 'Total sent',
            value: totalSent,
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
    });
    
    return {
        firstData,
        middleDataTitle: 'In-progress reach status',
        middleDataBg: [
            {
                name: 'Disconnected',
                value: disconnected,
            },
            {
                name: 'User busy',
                value: userbusy,
            },
            {
                name: 'Ring timeout',
                value: ringtimeout,
            },
        ],
        lastData: [
            {
                name: 'Average call duration',
                percent: averagecallduration,
            },
        ],
        lastDataTitle: 'Undelivered message status',
        lastDataBg: [
            {
                name: 'Not reachable',
                value: notreachable,
            },
            {
                name: 'DND',
                value: dnd,
            },
        ],
    }
}
