 
export const overview_data = (reach, engagement, conversion) => [
    // {
    //     name: 'Reach',
    //     value: reach?.count,
    //     lists: [
    //         {
    //             text: 'Opens',
    //             percent: reach?.open,
    //         },
    //         {
    //             text: 'Forwards',
    //             value: reach?.forwards,
    //         },
    //     ],
    //     footer: {
    //         name: reach?.prevDisplayLabel,
    //         value: reach?.previousComparisonValue,
    //         performance: reach?.isLowReachPerformance,
    //     },
    // },
    {
        name: 'Engagement',
        value: engagement?.count,
        lists: [
            {
                text: 'Link clicks',
                percent: engagement?.response,
            },
            // {
            //     text: 'Unique clicks',
            //     percent: engagement?.uniqueclicks,
            // },
            // {
            //     text: 'Forward mail clicks',
            //     value: engagement?.forwardmailclicks,
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
            // {
            //     text: 'Registration',
            //     percent: conversion?.registration || 0,
            // },
              {
                text: 'Participants',
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

export const keyMetrixData = (keyMetrix) => {
    const { followers
          , following 
          , postLikes
          , postComments
          , repost
          , totPageLikes
          , totPageComments
          , totPageReach,
          totalClicks,
          uniqueClicks,
          noofDevice,
          topDevice,
          topBrowser,
          participants, 
            location
          } = keyMetrix;
    return {
        firstData: [
            {
                isOpen: false,
                name: 'Total clicks',
                value: totalClicks,
                infoPopup: [
                   ,
                ],
            },
            {
                isOpen: false,
                name: 'Unique clicks',
                value: uniqueClicks,
                infoPopup: [
                   
                ],
            },
        ],
        middleDataTitle: 'Post engagement',
        middleDataBg: [
            {
                name: 'No. of devices',
                value: noofDevice,
            },
            
        ],
        lastData: [
            {
                name: 'Top device',
                value: topDevice,
            },
            {
                name: 'Top browser',
                value: topBrowser,
                infoPopup: [],
            },
        ],
        lastDataTitle: 'Top location of participants',
        lastDataBg: [
            {
                name: 'from '+location,//'from N/A',
                value: participants+'%',
            },
          
        ],
    }
}

const paidMediaData = {
    overview_data,
    keyMetrixData,
    headerValue: [],
};

export default paidMediaData;
