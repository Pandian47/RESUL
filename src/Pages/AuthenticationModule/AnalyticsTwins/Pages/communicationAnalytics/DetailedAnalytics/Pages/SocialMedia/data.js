 
export const overview_data = (reach, engagement, conversion) => [
    // {
    //     name: 'Reach',
    //     value: reach?.count,
    //     lists: [
    //         {
    //             text: 'Total reach',
    //             percent: reach?.delivered,
    //         },
            
    //     ],
    //     footer: {
    //         name: reach?.prevDisplayLabel,
    //         value: reach?.previousComparisonValue,
    //         performance: reach?.isLowReachPerformance
    //     },
    // },
    {
        name: 'Engagement',
        value: engagement?.count,
        lists: [
            {
                text: 'Clicks',
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

export const keyMetrixData = (keyMetrix,engagement) => {
    const { followers
          , following 
          , postLikes
          , postComments
          , repost
          , totPageLikes
          , totPageComments
          , totPageReach,
            topDevice,
            topDeviceValue
          } = keyMetrix;
    return {
        firstData: [
            {
                isOpen: false,
                name: 'Total clicks',
                value: followers,
                infoPopup: [
                   ,
                ],
            },
            {
                isOpen: false,
                name: 'Unique clicks',
                value: following,
                infoPopup: [
                   
                ],
            },
        ],
        middleDataTitle: 'Post engagement',
        middleDataBg: [
            {
                name: 'Likes',
                value: postLikes,
            },
            {
                name: 'Comments',
                value: postComments,
            },
            {
                name: 'Shares',
                value: repost,
            },
        ],
        lastData: [
            {
                name: 'Top device',
                value: topDevice ? topDevice : 'N/A',
            },
            {
                name: 'Total Device value',
                value: topDeviceValue ? topDeviceValue : 'N/A',
                infoPopup: [],
            },
        ],
        lastDataTitle: '',
        lastDataBg: [
            {
                name: 'Total page engagement',
                value: engagement?.count,
            },
          
        ],
    }
}

const socialMediaData = {
    overview_data,
    keyMetrixData,
    headerValue: [],
};

export default socialMediaData;

