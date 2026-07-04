import { find as _find } from 'Utils/modules/lodashReplacements';

export const YEAR_LIST = ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'];

export const MONTH_LIST = [
    {
        title: 'January',
        month: 0,
    },
    {
        title: 'February',
        month: 1,
    },
    {
        title: 'March',
        month: 2,
    },
    {
        title: 'April',
        month: 3,
    },
    {
        title: 'May',
        month: 4,
    },
    {
        title: 'June',
        month: 5,
    },
    {
        title: 'July',
        month: 6,
    },
    {
        title: 'August',
        month: 7,
    },
    {
        title: 'September',
        month: 8,
    },
    {
        title: 'October',
        month: 9,
    },
    {
        title: 'November',
        month: 10,
    },
    {
        title: 'December',
        month: 11,
    },
];

export const DATE_FORMAT = (date) => {
    let dateValue = new Date(date);
    dateValue = dateValue.toLocaleTimeString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
    return dateValue;
};

export const DATE_FORMAT_WITHOUT_TIME = (date) => {
    let dateValue = new Date(date);
    dateValue = dateValue.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
    return dateValue;
};

export function convertDate(stringDate) {
    const date = new Date(stringDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function getCurrentMonthDate(date) {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return { startDate: convertDate(startOfMonth), endDate: convertDate(endOfMonth) };
}

export function getMonthDate(date, type) {
    if (type === 'today') {
        return new Date();
    } else if (type === 'next') {
        return new Date(date.getFullYear(), date.getMonth() + 1, 1);
    } else {
        return new Date(date.getFullYear(), date.getMonth() - 1, 1);
    }
}

export function getSelectedMonthAndYear(date, seletedValue, type) {
    const now = new Date(date);
    if (type === 'month') {
        const value = _find(MONTH_LIST, ['title', seletedValue.value]);
        now.setMonth(value.month);
        return now;
    } else {
        now.setFullYear(parseInt(seletedValue.value, 10));
        return now;
    }
}

// export const handleMap = (selectedEvent) => {
//     let splitEvents = [];
//     selectedEvent?.forEach((item, index) => {
//         console.log('item: ', item);
//         if (index === 0) {
//             if (item?.content !== '') {
//                 splitEvents.push(item, { contentThumbnail: item?.contentThumbnail, imageAvailable: true })
//             } else if (item?.smsContent !== null && item?.contentThumbnail === '') {
//                 splitEvents.push(item, { smsContent: item?.smsContent, smsAvailable: true })
//             } else if (splitEvents?.length > 1) {
//                 splitEvents.push({ smsContent: item?.smsContent, smsAvailable: true })
//             }
//         } else {
//             if (item?.contentThumbnail !== '') {
//                 splitEvents.push({ contentThumbnail: item?.contentThumbnail, imageAvailable: true })
//             }
//             if (item?.smsContent !== null) {
//                 splitEvents.push({ smsContent: item?.smsContent, smsAvailable: true })
//             }
//         }
//     });
//     return splitEvents;
// }

export const handleMap = (selectedEvent) => {
    const splitEvents = [];

    selectedEvent?.forEach((item) => {
        if (item?.attributeName) {
            splitEvents.push(item);
        }

        if (Array.isArray(item?.campaigns) && item.campaigns.length > 0) {
            splitEvents.push(...item.campaigns);
        } else if (!item?.attributeName) {
            splitEvents.push(item);
        }
    });

    return splitEvents;
};

export const communicationName = (type) => {
    switch (type) {
        case 'S':
            return 'Single dimension';
        case 'M':
            return 'Multi dimension';
        case 'T':
            return 'Triger';
    }
};
