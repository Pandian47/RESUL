import { detailAnalyticsConversion, detailAnalyticsEngagement, detailAnalyticsReach } from 'Assets/Images';
import { formatPercentageDisplay } from 'Utils/modules/formatters';
import { ch_primary_orange, ch_secondary_blue, ch_secondary_green, conversion, engagement, reach } from 'Constants/GlobalConstant/Colors/colorsVariable';
export const summaryImages = {
    Reach: detailAnalyticsReach,
    Engagement: detailAnalyticsEngagement,
    Conversion: detailAnalyticsConversion,
};

// export const getPercentages = (id, summary, data) => {
//     switch (id) {
//         case 'goal':
//             return [43.1, 1.48, 0.04];
//         case 'reach':
//             return [43.1, 3.4, 2.9];
//         default:
//             return [43.1, 1.48, 0.04];
//     }
// };

export const handlePercentage = (value, totalValue) => {
    if (value === false || value === null || value === undefined) {
        return 0;
    }
    const numValue = Number(value);
    const numTotal = Number(totalValue);
    if (isNaN(numValue) || !numTotal) {
        return 0;
    }
    const result = formatPercentageDisplay((numValue / numTotal) * 100);
    return Number.isFinite(result) ? result : 0;
};
export const getPercentages = (id, summary, data) => {
    // console.log("Called Id : " , id)
    // console.log("Get Percentage ",summary , " and Data : ", data)
    // console.log("summary?.channelReachInfo?.reachVsSTargetPercentage : " ,summary?.channelReachInfo?.reachVsSTargetPercentage)
    // switch (id) {
    //     case 'goal':
    //     case 'target':
    //         return [
    //             summary?.channelReachInfo?.reachVsSTargetPercentage,
    //             summary?.channelEngagementInfo?.engagementVsTargetPercentage,
    //             summary?.channelConversionInfo?.conversionVsTargetPercentage,
    //         ];

    //     case 'reach':
    //         return [
    //             summary?.channelReachInfo?.reachPercentage,
    //             summary?.channelEngagementInfo?.engagementPercentage,
    //             summary?.channelConversionInfo?.conversionPercentage,
    //         ];

    //     case 'engagement':
    //         return [
    //             summary?.channelReachInfo?.reachVsSTargetPercentage,
    //             summary?.channelEngagementInfo?.engagementVsReachPercentage,
    //             summary?.channelConversionInfo?.conversionVsReachPercentage,
    //         ];
    // }

    switch (id) {
        case 'goal':
        case 'target':
            return [
                handlePercentage(summary?.channelReachInfo?.totalReachCount, summary?.totalRecipientsCount),
                handlePercentage(summary?.channelEngagementInfo?.totalEngagementCount, summary?.totalRecipientsCount),
                handlePercentage(summary?.channelConversionInfo?.totalConversionCount, summary?.totalRecipientsCount),
            ];

        case 'reach':
            return [
                handlePercentage(summary?.channelReachInfo?.totalReachCount, summary?.totalRecipientsCount),
                handlePercentage(
                    summary?.channelEngagementInfo?.totalEngagementCount,
                    summary?.channelReachInfo?.totalReachCount,
                ),
                handlePercentage(
                    summary?.channelConversionInfo?.totalConversionCount,
                    summary?.channelReachInfo?.totalReachCount,
                ),
            ];

        case 'engagement':
            return [
                handlePercentage(summary?.channelReachInfo?.totalReachCount, summary?.totalRecipientsCount),
                handlePercentage(
                    summary?.channelEngagementInfo?.totalEngagementCount,
                    summary?.channelReachInfo?.totalReachCount,
                ),
                // handlePercentage(
                //     summary?.channelConversionInfo?.totalConversionCount,
                //     summary?.channelEngagementInfo?.totalEngagementCount,
                // ),
                handlePercentage(
                    summary?.channelConversionInfo?.totalConversionCount,
                    (summary?.channelConversionInfo?.totalOfflineConversionCount ?? 0) > 0
                        ? summary?.channelReachInfo?.totalReachCount
                        : summary?.channelEngagementInfo?.totalEngagementCount
                ),
            ];
    }
};

export const getColumnChartFormat = (id, summary) => {
    const isPaidMedia = summary?.channelList?.[0] === 10;
    switch (id) {
        case 'goal':
        case 'target':
            return {
                count: {
                    reach: summary?.channelReachInfo?.reachPercentage,
                    engagement: summary?.channelEngagementInfo?.engagementVsReachPercentage,
                    conversion: summary?.channelConversionInfo?.conversionVsTargetPercentage,
                },
                total: {
                    reachTotal: summary?.channelReachInfo?.totalReachCount,
                    conversionTotal: summary?.channelConversionInfo?.totalConversionCount,
                    engagementTotal: summary?.channelEngagementInfo?.totalEngagementCount,
                },
            };

        case 'reach':
            return {
                count: {
                    reach: summary?.channelReachInfo?.reachPercentage,
                    engagement: isPaidMedia ? 100 : summary?.channelEngagementInfo?.engagementPercentage,
                    conversion: summary?.channelConversionInfo?.conversionPercentage,
                },
                total: {
                    reachTotal: summary?.channelReachInfo?.totalReachCount,
                    conversionTotal: summary?.channelConversionInfo?.totalConversionCount,
                    engagementTotal: summary?.channelEngagementInfo?.totalEngagementCount,
                },
            };
        // case 'engagement':
        //     return {
        //         count: {
        //             reach: summary?.channelReachInfo?.reachPercentage,
        //             engagement: summary?.channelEngagementInfo?.engagementPercentage,
        //             conversion: summary?.channelConversionInfo?.conversionVsReachPercentage,
        //         },
        //         total: {
        //             reachTotal: summary?.channelReachInfo?.totalReachCount,
        //             conversionTotal: summary?.channelConversionInfo?.totalConversionCount,
        //             engagementTotal: summary?.channelEngagementInfo?.totalEngagementCount,
        //         },
        //     };

        case 'engagement': {
            const isOfflineConversion = (summary?.channelConversionInfo?.totalOfflineConversionCount ?? 0) > 0;

            return {
                count: {
                    reach: summary?.channelReachInfo?.reachPercentage,
                    engagement: summary?.channelEngagementInfo?.engagementPercentage,
                    conversion: isOfflineConversion
                        ? summary?.channelConversionInfo?.conversionVsReachPercentage
                        : summary?.channelConversionInfo?.conversionVsEngagementPercentage,
                },
                total: {
                    reachTotal: summary?.channelReachInfo?.totalReachCount,
                    engagementTotal: summary?.channelEngagementInfo?.totalEngagementCount,
                    conversionTotal: isOfflineConversion
                        ? summary?.channelConversionInfo?.totalOfflineConversionCount
                        : summary?.channelConversionInfo?.totalOnlineConversionCount,
                        
                },
            };
        }
    }
};

export const getChartCountParts = (total, percent) => ({
    total,
    percent,
});

export const chartValue = (type, summary) => {
    const columnValue = getColumnChartFormat(type, summary);
    const { count, total } = columnValue;
    return [
        {
            name: 'Reach',
            data: [
                {
                    value: `${count?.reach}%`,
                    count: getChartCountParts(total?.reachTotal, count?.reach),
                    color: 'bg-reach',
                },
            ],
        },
        {
            name: 'Engagement',
            data: [
                {
                    value: `${count?.engagement}%`,
                    count: getChartCountParts(total?.engagementTotal, count?.engagement),
                    color: 'bg-engagement',
                },
            ],
        },
        {
            name: 'Conversion',
            data: [
                {
                    value: `${count?.conversion}%`,
                    count: getChartCountParts(total?.conversionTotal, count?.conversion),
                    color: 'bg-conversion',
                },
            ],
        },
    ];
};

export const handleInfoCount = (factModel, type, key, campType) => {
    const countValues = (factData, keyName) => {
        if (!Array.isArray(factData) || factData.length === 0) return 0;
        return factData.reduce((acc, fact) => acc + (fact?.[keyName] ?? 0), 0);
    };

    if (!!factModel && !!type && campType == 'S') {
        switch (type) {
            case 'Web notification':
                return factModel?.webPush?.reduce((acc, item) => acc + (item?.[key] ?? 0), 0) || 0;
            case 'Mobile notification':
                return factModel?.mobilePush?.reduce((acc, item) => acc + (item?.[key] ?? 0), 0) || 0;
            case 'SMS':
                return factModel?.mobile?.reduce((acc, item) => acc + (item?.[key] ?? 0), 0) || 0;
            case 'Email':
                return factModel?.email?.reduce((acc, item) => acc + (item?.[key] ?? 0), 0) || 0;
            case 'WhatsApp':
                return factModel?.whatsapp?.reduce((acc, item) => acc + (item?.[key] ?? 0), 0) || 0;
            case 'RCS':
                return factModel?.rcs?.reduce((acc, item) => acc + (item?.[key] ?? 0), 0) || 0;
        }
    } else {
        switch (type) {
            case 'Web notification':
                return countValues(factModel?.webPush, key) || 0;
            case 'Mobile notification':
                return countValues(factModel?.mobilePush, key) || 0;
            case 'SMS':
                return countValues(factModel?.mobile, key) || 0;
            case 'Email':
                return countValues(factModel?.email, key) || 0;
            case 'WhatsApp':
                return countValues(factModel?.whatsapp, key) || 0;
            case 'RCS':
                return countValues(factModel?.rcs, key) || 0;
        }
    }
};

export const checkForNonZeroElements = (arr) => {
    for (let i = 0; i < arr?.length; i++) {
        if (arr[i] !== 0) {
            return true;
        }
    }
    return false;
};

export const reportCardChart = {
    // xAxis: {
    //     title: '',
    //     categories: ['Reach', 'Engagement', 'Conversion'],
    //     labels: true
    // },
    // colors: [ch_secondary_blue, ch_primary_orange, ch_secondary_green],
    // yAxis: {
    //     lables: false
    // },
    // legend: {
    //     enabled: false
    // },
    // series: [
    //     {
    //         name: 'Identified',
    //         data: [16, 3, 3],
    //     }
    // ]

    xAxis: {
        title: '',
        categories: ['Reach', 'Engagement', 'Conversion'],
        labels: true,
    },
    yAxis: {
        // labelFormat: '{value}k',
        lables: false,
    },
    legend: {
        enabled: true,
        reverse: false,
        y: 10,
    },
    series: [
        {
            name: 'Reach',
            data: [18, 1, 1],
            color: reach,
        },
        {
            name: 'Engagement',
            data: [16, 1, 1],
            color: engagement,
        },
        {
            name: 'Conversion',
            data: [14, 1, 1],
            color: conversion,
        },
    ],
};
