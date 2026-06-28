
export const overview_data = (reach, engagement, conversion) => [
    {
        name: 'Reach',
        value: reach?.count,
        lists: [
            {
                text: 'Unique scans',
                percent: reach?.uniqueScans,
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

export const keyMetrixData = (keyMetrix) => {
    const { totalSent, averagescansperday, kyccount, calendardownload, goalConversionRatePercentage, topscanned
          ,  toplocation 
          } = keyMetrix;
    return {
        firstData: [
            {
                isOpen: false,
                name: 'Total scans',
                value: totalSent,
            },
            {
                isOpen: false,
                name: 'Average scans per day',
                value: averagescansperday,
            },
        ],
        middleDataTitle: 'User engagement',
        middleDataBg: [
            {
                name: 'KYC count',
                value: kyccount,
            },
            {
                name: 'Calendar download',
                value: calendardownload,
            },
        ],
        lastData: [
            {
                name: 'Goal conversion rate',
                percent: goalConversionRatePercentage,
            },
        ],
        lastDataTitle: 'Top location scanned',
        lastDataBg: [
            {
                name: toplocation,//'North America',
                value: topscanned,
            },
        ],
    }
}
