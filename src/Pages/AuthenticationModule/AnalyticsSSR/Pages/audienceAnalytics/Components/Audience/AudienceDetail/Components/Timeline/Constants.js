import { getChannelId } from 'Utils/modules/communicationChannels';
import moment from 'moment';

const bold = (text='') => `<b style="font-family: Mukta-Semibold; font-weight: 600;">${text}</b>`;

const getMessageEMail = (action) => {
    switch (action) {
        case 'Open':
            return `${bold('Opened')} the communication`;
        case 'Blast':
            return `${bold('Sent')} the mail`;
        case 'Click':
            return `${bold('Clicked')} the url`;
        case 'Conversion':
            return bold('Conversion');
        default:
            return `${bold('Sent')} the mail`;
    }
};

const getMessageSMS = (action) => {
    switch (action) {
        case 'Open':
            return `${bold('Opened')} the communication`;
        case 'Blast':
            return `${bold('Received')} the communication`;
        case 'Click':
            return `${bold('Clicked')} the url`;
        case 'Conversion':
            return bold('Conversion');
        default:
            return `${bold('Received')} the communication`;
    }
};

const getMessageWA = (action) => {
    switch (action) {
        case 'Blast':
            return `${bold('Received')} the WhatsApp communication`;
        case 'Open':
        case 'Delivered':
            return `${bold('Delivered')} the WhatsApp communication`;
        case 'Click':
            return `${bold('Clicked')} the url`;
        case 'Conversion':
            return bold('Conversion');
        default:
            return `${bold('Received')} the WhatsApp communication`;
    }
};

const getMessageWebPush = (action) => {
    switch (action) {
        case 'Blast':
            return `${bold('Received')} the communication`;
        case 'Open':
        case 'Delivered':
            return `${bold('Delivered')} the communication`;
        case 'Click':
            return `${bold('Clicked')} the url`;
        case 'Conversion':
            return bold('Conversion');
        default:
            return `${bold('Received')} the communication`;
    }
};

const getMessageMobilePush = (action) => {
    switch (action) {
        case 'Blast':
            return `${bold('Received')} the communication`;
        case 'Open':
        case 'Delivered':
            return `${bold('Delivered')} the communication`;
        case 'Click':
            return `${bold('Clicked')} the url`;
        case 'Conversion':
            return bold('Conversion');
        default:
            return `${bold('Received')} the communication`;
    }
};


export const getTimeLineData = (timeLine) => {
    let { campaignName, actionDate, channel, channelId, status, action ,iswinnerSplit,iswinnerSplitType} = timeLine;
    let messagge = '';
    if (channelId === 1) messagge = getMessageEMail(action);
    if (channelId === 2) messagge = getMessageSMS(action);
    if (channelId === 21) messagge = getMessageWA(action);
    if (channelId === 8) messagge = getMessageWebPush(action);
    if (channelId === 9 || channelId === 14) messagge = getMessageMobilePush(action);

    return {
        text: campaignName,
        datetime: actionDate,
        messagge: messagge,
        imageView: action === 'Blast'  ? true : false,
        accordionImage: action === 'Blast'&& channelId===1 ? true : false,
        textView: true,
            infoTextView:
            (action === 'Blast' || action === 'Click') &&
            [2, 21, 9, 14, 8].includes(channelId)
                ? true
                : false,
        info: {
            type: 'tooltip',
            content: 'Lands on listing screen spends 2 minutes on the page clicks the link',
        },
        image: '',
        content: timeLine?.content,
        category: {
            tag: channel,
            icon: getChannelId(channelId)?.icon,
            color: getChannelId(channelId)?.bgColor,
        },
        action,
        status,
        iswinnerSplit,
        iswinnerSplitType
    };
};

export const getPreviousMonthAndYear = (inputDate) => {
    const currentDate = moment(inputDate, 'MMMM YYYY');
    const previousMonth = currentDate.clone().subtract(1, 'month').format('MMMM');
    const previousYear = currentDate.clone().subtract(1, 'year').format('YYYY');
    return `${previousMonth} ${previousYear}`;
};

export const get_Month_Year = (year, from = 0, createDate) => {
    const months = [];
    const startMonth = moment().year(year).month(0);
    const createYear = Number(createDate?.split('-')[0]);
    const createMonth = Number(createDate?.split('-')[1]);
    const currentYear = new Date()?.getFullYear();
    const currentMonth = new Date()?.getMonth() + 1;
    //create year same
    if (createYear === year) {
        for (let i = createMonth - 1; i < 12; i++) {
            const currentMonth = startMonth.clone().add(i, 'months');
            months.push(currentMonth.format('MMMM YYYY'));
        }
        return months.reverse();
    }
    //current year same
    else if (year === currentYear) {
        for (let i = from; i < currentMonth; i++) {
            const currentMonth = startMonth.clone().add(i, 'months');
            months.push(currentMonth.format('MMMM YYYY'));
        }
        return months.reverse();
    } else {
        for (let i = from; i < 12; i++) {
            const currentMonth = startMonth.clone().add(i, 'months');
            months.push(currentMonth.format('MMMM YYYY'));
        }
        return months.reverse();
    }
};
export const get_Month_YearOrder = (year, from = 0) => {
    const months = [];
    const startMonth = moment().year(year).month(0);

    for (let i = from - 1; i >= 0; i--) {
        const currentMonth = startMonth.clone().add(i, 'months');
        months.push(currentMonth.format('MMMM YYYY'));
    }
    return months;
};

export const get_Month_Year_new = (year, from = 0, createDate) => {
    const months = [];
    const startMonth = moment().year(new Date()?.getFullYear()).month(0);
    const currentYear = new Date()?.getFullYear();
    const currentMonth = new Date()?.getMonth() + 1;
    const isCurrentYear = currentYear === year;
    const createYear = Number(createDate?.split('-')[0]);
    const createMonth = Number(createDate?.split('-')[1]);
    if (isCurrentYear) {
        for (let i = from; i < currentMonth; i++) {
            const currentMonth = startMonth.clone().add(i, 'months');
            months.push(currentMonth.format('MMMM YYYY'));
        }
        return months?.reverse();
    } else {
        for (let i = 0; i < currentMonth; i++) {
            const currentMonth = startMonth.clone().add(i, 'months');
            months.push(currentMonth.format('MMMM YYYY'));
        }
        return months?.reverse();
    }
};
