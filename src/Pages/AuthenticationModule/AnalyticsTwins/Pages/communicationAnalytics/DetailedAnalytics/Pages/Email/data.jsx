import { getUserDetails } from 'Utils/modules/crypto';
import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { getmasterData } from 'Utils/modules/masterData';
import TruncateCell from 'Components/RSKendoGrid/TruncateCell';

export const overview_data = (reach, engagement, conversion) => [
    {
        name: 'Reach',
        value: reach?.count,
        lists: [
            {
                text: 'Opens',
                percent: reach?.open,
            },
            {
                text: 'Forwards',
                value: reach?.forwards,
                hidePercent: true,
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
                text: 'Unique clicks',
                percent: engagement?.uniqueclicks,
                hidePercent: true,
            },
            {
                text: 'Forward mail clicks',
                value: engagement?.forwardmailclicks,
                hidePercent: true,
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
        bounced,
        controlgroup,
        delivered,
        forwarded,
        frequencycap,
        goalConversionRatePercentage,
        goalConversionValue,
        negativefeedbackhardbounced,
        negativefeedbackmarkedasspam,
        negativefeedbackunsubscribed,
        offlineconversion,
        onlineconversion,
        quarantined,
        softbounced,
        spam,
        suppressionlist,
        totalOpened,
        totalSent,
        totalclick,
        unsubscribed,
        goalOfflineConversionValue,
        goalOnlineConversionValue,
        offlineConversionValue,
        onlineConversionValue,
        uniquesent
    } = keyMetrix;
    const { currencyMasterList } = getmasterData();
    const { currencyId } = getUserDetails();
    let currsymbol = '₹';
    const matchingCurrency = currencyMasterList?.find((currency) => currency.currencyID === currencyId);
    currsymbol = matchingCurrency ? matchingCurrency.currenySymbol : currsymbol;
    
    const firstData = [
        {
            isOpen: false,
            name: isCG ? 'Total control' :'Total sent',
            value: isCG ? controlgroup :  totalSent,
            infoPopup: [
                { text: 'Spam', count: spam },
                { text: 'Bounced', count: bounced },
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
        middleDataTitle: 'User engagement',
        middleDataBg: [
            {
                name: 'Forwarded',
                value: forwarded,
            },
            {
                name: 'Total opened',
                value: totalOpened,
            },
            {
                name: 'Responded',
                value: totalclick,
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
        lastDataTitle: 'Negative feedback',
        lastDataBg: [
            {
                name: 'Hard bounced',
                value: negativefeedbackhardbounced,
            },
            {
                name: 'Marked as spam',
                value: negativefeedbackmarkedasspam,
            },
            {
                name: 'Unsubscribed',
                value: negativefeedbackunsubscribed,
            },
        ],
    };
};

export const CAMPAIGN_GRID_COLUMN_DATA = [
    {
        field: 'rowNo',
        title: 'S.No',
        className: 'text-center',
        width: 70,
        filter: 'text',
    },
    {
        field: 'url',
        title: 'URL',
        filter: 'text',
        width: 200,
    },
    {
        field: 'totalClicks',
        title: 'Total clicks',
        width: 110,
        filter: 'text',
    },
    {
        field: 'urlDate',
        title: 'URL date',
        width: 170,
        filter: 'text',
        cell: (props) => (
            <TruncateCell
                value={getUserCurrentFormat(props.dataItem?.urlDate)?.dateTimeFormat}
                tdProps={props.tdProps}
                className={props.className}
            />
        ),
    },
];
