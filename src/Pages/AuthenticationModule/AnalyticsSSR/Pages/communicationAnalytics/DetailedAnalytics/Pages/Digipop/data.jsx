import { getUserCurrentFormat } from 'Utils/modules/dateTime';
export const overview_data = (reach, engagement, conversion) => [
    {
        name: 'Reach',
        value: reach?.count,
    },
    {
        name: 'Engagement',
        value: engagement?.count,
    },
    {
        name: 'CTR',
        value: conversion?.count,
    },
];
export const getChartData = (type, reports) => {
    const series = [
        {
            name: type,
            data: reports?.map((item) => (type === 'Reach' ? item?.chartimpressions : item?.chartclicks)),
        },
    ];
    // const categories = reports?.map((item) => getMMMDDYYYY(item?.date, 'formatDate'));
    const categories = reports?.map((item) => getUserCurrentFormat(item?.date)?.dateFormat);
    return { series, categories };
};
