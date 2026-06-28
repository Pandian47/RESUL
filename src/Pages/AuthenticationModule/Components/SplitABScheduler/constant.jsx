import { addDays_dddmmmddyyyy } from 'Constants/Utils/dates';
import { TempImage1, TempImage2 } from 'Assets/Images';
import { getUserCurrentFormat } from 'Utils/modules/dateTime';
export const data = {
    Schedule: [
        {
            text: 'Group A Open rate',
            // label: addDays_dddmmmddyyyy(0, 'ddd, MMM DD, YYYY HH:mm:ss'),
            label: getUserCurrentFormat(null,{ add: { days: 0 } })?.dateTimeFormat,
            percentage: '70',
            text1: 'Split size',
            size: '1400',
        },
        {
            text: 'Group B Open rate',
            // label: addDays_dddmmmddyyyy(6, 'ddd, MMM DD, YYYY HH:mm:ss'),
            label: getUserCurrentFormat(null,{ add: { days: 6 } })?.dateTimeFormat,
            percentage: '30',
            text1: 'Split size',
            size: '600',
        },
    ],
    'Email content': [
        {
            text: 'Group A Engagement rate',
            label: 'Group A Engagement rate',
            isLabel: false,
            percentage: '70',
            labelImg: <img src={TempImage1} />,
            text1: 'Split size',
            size: '1400',
        },
        {
            text: 'Group B Engagement rate',
            label: 'Group B Engagement rate',
            isLabel: false,
            percentage: '30',
            labelImg: <img src={TempImage2} />,
            text1: 'Split size',
            size: '600',
        },
    ],
    'Subject line': [
        {
            text: 'Group A Open rate',
            label: 'Offer of the week',
            percentage: '70',
            text1: 'Split size',
            size: '1400',
        },
        {
            text: 'Group B Open rate',
            label: 'Grab it within this week',
            percentage: '30',
            text1: 'Split size',
            size: '600',
        },
    ],
};

export const profileChart = (percent, color, className, text) => {
    return {
        title: {
            text: '',
        },
        subtitle: {
            text: `<div class='percent-value font-lg font-bold' style="color: #111111;">${percent}<span class=${className}>%</span> <small>${text}</small></div>`,
            align: 'center',
            verticalAlign: 'middle',
            style: {
                textAlign: 'center',
            },
            x: 0,
            y: 5,
            useHTML: true,
        },
        plotOptions: {
            pie: {
                size: 180,
            },
        },
        series: [
            {
                type: 'pie',
                enableMouseTracking: false,
                innerSize: '60%',
                size: '90%',
                dataLabels: {
                    enabled: false,
                },
                data: [
                    {
                        y: percent,
                        color: color,
                    },
                    {
                        y: 100 - percent,
                        color: '#e3e3e3',
                    },
                ],
            },
        ],
    };
};

export function parseSplitABPopupResponse(response) {
    const raw = response?.data?.splitTestResult ?? response?.data;
    if (!Array.isArray(raw)) return [];
    return raw.map((item) => normalizeSplitTestResultItem(item));
}

function normalizeSplitTestResultItem(item = {}) {
    if (!item || typeof item !== 'object') return item;

    const normalized = { ...item };

    if (normalized.channelID == null && normalized.channelId != null) {
        normalized.channelID = normalized.channelId;
    }

    SPLIT_VARIANTS.forEach((letter) => {
        const count = getSplitCount(normalized, letter);
        if (normalized[`recipientCountSplit${letter}`] == null && count != null) {
            normalized[`recipientCountSplit${letter}`] = count;
        }

        const schedule = normalized[`scheduleDateTime${letter}`] ?? normalized[`blastDateTime${letter}`];
        if (schedule && !normalized[`scheduleDateTime${letter}`]) {
            normalized[`scheduleDateTime${letter}`] = schedule;
        }

        const content = getSplitContent(normalized, letter);
        if (content && !normalized[`subject${letter}`]) {
            normalized[`subject${letter}`] = content;
        }
    });

    if (normalized.splitABRecipientCount == null) {
        const splitTotal = SPLIT_VARIANTS.reduce(
            (sum, letter) => sum + (Number(getSplitCount(normalized, letter)) || 0),
            0,
        );
        if (splitTotal > 0) normalized.splitABRecipientCount = splitTotal;
    }

    if (normalized.remaining_audience_count == null && normalized.remainingAudienceCount != null) {
        normalized.remaining_audience_count = normalized.remainingAudienceCount;
    }
    if (normalized.total_audience_count == null && normalized.totalAudienceCount != null) {
        normalized.total_audience_count = normalized.totalAudienceCount;
    }

    return normalized;
}

const SPLIT_VARIANTS = ['A', 'B', 'C', 'D'];

function getSplitContent(item, letter) {
    return (
        item[`subject${letter}`] ??
        item[`smsContent${letter}`] ??
        item[`message${letter}`] ??
        item[`content${letter}`] ??
        null
    );
}

function getSplitCount(item, letter) {
    return item[`recipientCountSplit${letter}`] ?? item[`blastCount${letter}`] ?? null;
}

function getSplitPercentage(item, letter) {
    return (
        item[`recipientCountPercentageSplit${letter}`] ||
        item[`recipientContentCountPercentageSplit${letter}`] ||
        0
    );
}

export const getSubjectLineContent = (content) => {
    let subjectContent = {
        subject: [],
    };
    return content.reduce((acc, item) => {
        SPLIT_VARIANTS.forEach((letter) => {
            const splitContent = getSplitContent(item, letter);
            const count = getSplitCount(item, letter);
            if (splitContent || count) {
                subjectContent['subject'].push({
                    content: splitContent ?? '',
                    splitPercentage: getSplitPercentage(item, letter),
                    count: count ?? 0,
                });
            }
        });
        if (item.splitABRecipientCount) {
            subjectContent['recipientCount'] =
                item.splitABRecipientCount / Object.keys(subjectContent?.subject)?.length;
        }
        acc.push(subjectContent);
        subjectContent = { subject: [] };
        return acc;
    }, []);
};

export const getEmailContent = (content) => {
    let emailContent = {
        ContentPath: [],
    };
    return content.reduce((acc, item) => {
        if (item.edmHtmlContentA || item.edmContentPathA) {
            emailContent['ContentPath'].push({
                content: item.edmHtmlContentA || item.edmContentPathA,
                contentType: item.edmHtmlContentA ? 'html' : 'image',
                splitPercentage: item.recipientContentCountPercentageSplitA,
                count: getSplitCount(item, 'A'),
            });
        }
        if (item.edmHtmlContentB || item.edmContentPathB) {
            emailContent['ContentPath'].push({
                content: item.edmHtmlContentB || item.edmContentPathB,
                contentType: item.edmHtmlContentB ? 'html' : 'image',
                splitPercentage: item.recipientContentCountPercentageSplitB,
                count: getSplitCount(item, 'B'),
            });
        }
        if (item.edmHtmlContentC || item.edmContentPathC) {
            emailContent['ContentPath'].push({
                content: item.edmHtmlContentC || item.edmContentPathC,
                contentType: item.edmHtmlContentC ? 'html' : 'image',
                splitPercentage: item.recipientContentCountPercentageSplitC,
                count: getSplitCount(item, 'C'),
            });
        }
        if (item.edmHtmlContentD || item.edmContentPathD) {
            emailContent['ContentPath'].push({
                content: item.edmHtmlContentD || item.edmContentPathD,
                contentType: item.edmHtmlContentD ? 'html' : 'image',
                splitPercentage: item.recipientContentCountPercentageSplitD,
                count: getSplitCount(item, 'D'),
            });
        }
        if (item.splitABRecipientCount) {
            emailContent['recipientCount'] =
                item.splitABRecipientCount / Object.keys(emailContent?.ContentPath)?.length;
        }
        acc.push(emailContent);
        return acc;
    }, []);
};

export const getSchedule = (content) => {
    let scheduleDateTime = {
        Schedule: [],
    };
    return content.reduce((acc, item) => {
        SPLIT_VARIANTS.forEach((letter) => {
            const scheduleDate = item[`scheduleDateTime${letter}`] ?? item[`blastDateTime${letter}`];
            if (scheduleDate) {
                scheduleDateTime['Schedule'].push({
                    content: scheduleDate,
                    splitPercentage: getSplitPercentage(item, letter),
                    count: getSplitCount(item, letter),
                });
            }
        });
        if (item.splitABRecipientCount) {
            scheduleDateTime['recipientCount'] =
                item.splitABRecipientCount / Object.keys(scheduleDateTime?.Schedule)?.length;
        }
        acc.push(scheduleDateTime);
        return acc;
    }, []);
};

export const allContentFormat = (response) => {
    const subjectLineContent = getSubjectLineContent(response);
    const emailContent = getEmailContent(response);
    const schedule = getSchedule(response);
    let finalData = {};
    finalData['Subject line'] = subjectLineContent;
    finalData['Email content'] = emailContent;
    finalData['Schedule'] = schedule;

    return finalData;
};

export function SplitTypes(type) {
    switch (type) {
        case 0:
            return 'A';
        case 1:
            return 'B';
        case 2:
            return 'C';
        case 3:
            return 'D';
        default:
            return 'A';
    }
}
const getPayloadEmailChannel = (formstate, allCampaignDetail, popupContent, type) => {
    const { campaignDetail, sessionId, timeZoneId, timeZoneName, scheduleTime } = allCampaignDetail;
    const { channelId, campaignId } = campaignDetail;
    const { departmentId, userId, clientId } = sessionId;

    // debugger;
    const defaultSubjectKey = ['subjectA', 'subjectB', 'subjectC', 'subjectD'];
    const result = Object.entries(formstate)
        .filter(([key]) => defaultTypes.includes(key))
        .find(([, value]) => value);

    const resultType = result[1]?.slice(0, 1);
    // console.log('resultType: ', resultType);

    const finalSubjectKey = defaultSubjectKey?.find((key) => key.includes(resultType));
    // console.log('finalSubjectKey: ', finalSubjectKey);

    const subjectData = Object.entries(popupContent)?.find(([key, value]) => key === finalSubjectKey && value);
    // console.log('subjectData: ', subjectData);

    // console.log(formstate, allCampaignDetail, popupContent, '@@@@@@@@@@@@@@@@data11111');

    return {
        campaignId: campaignId,
        selectedSubject: subjectData[1] || '',
        splitType: resultType,
        splittypeId: defaultSubjectKey?.indexOf(finalSubjectKey) + 1,
        autoSchedule: false,
        timeZoneId: timeZoneName?.timeZoneID ?? timeZoneId,
        scheduleDate: getYYMMDDAndTime(scheduleTime),
        departmentId: departmentId,
        uid: userId,
        ccid: clientId,
        channelId: channelId,
        PerformedBy: type?.id,
        iswinnerSplitType: popupContent?.iswinnerSplitType || ''
    };
};

const defaultTypes = ['subject', 'ContentPath', 'Schedule'];

const getPayloadOtherChannel = (formstate, allCampaignDetail, popupContent, type) => {
    // console.log('popupContent: ', popupContent);
    // console.log('formstate: ', formstate);
    const { campaignDetail, sessionId, timeZoneId, timeZoneName, scheduleTime } = allCampaignDetail;
    const { channelId, campaignId } = campaignDetail;
    const { departmentId, userId, clientId } = sessionId;
    const defaultKeys = ['A', 'B', 'C', 'D'];

    const result = Object.entries(formstate)
        .filter(([key]) => defaultTypes.includes(key))
        .find(([, value]) => value);

    return {
        campaignId: campaignId,
        selectedSubject: result[1]?.slice(1, result[1]?.length),
        splitType: result[1]?.slice(0, 1),
        splittypeId: defaultKeys?.indexOf(result[1]?.slice(0, 1)) + 1,
        autoSchedule: false,
        timeZoneId: timeZoneName?.timeZoneID ?? timeZoneId,
        scheduleDate: getYYMMDDAndTime(scheduleTime),
        departmentId: departmentId,
        uid: userId,
        ccid: clientId,
        channelId: channelId,
        PerformedBy: type?.id,
        iswinnerSplitType: popupContent?.iswinnerSplitType || ''
    };
};

export const buildPayload = (formstate, allCampaignDetail, popupContent, type) => {
    const { campaignDetail } = allCampaignDetail;
    const { channelId } = campaignDetail;
    if (channelId === 1) return getPayloadEmailChannel(formstate, allCampaignDetail, popupContent, type);
    else return getPayloadOtherChannel(formstate, allCampaignDetail, popupContent, type);
};

export const getTitleContent = (ids, type) => {
    const id = Number(ids);
    const filter = type?.text?.toLowerCase();
    switch (id) {
        case 1:
            return filter === 'email content' ? 'Engagement rate' : 'Open rate';
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
        case 10:
        case 11:
            return 'Click rate';
        default:
            return 'Engagement rate';
    }
};

export const splitABAudienceCount = (value = {}) => {
    const remainingCount = value?.remaining_audience_count ?? value?.remainingAudienceCount ?? 0;
    const totalAudience = value?.total_audience_count ?? value?.totalAudienceCount ?? 0;
    const groupCount = value?.splitABRecipientCount ?? value?.splitAbRecipientCount ?? 0;

    const remainingCountPercentage =
        totalAudience > 0 ? (remainingCount / totalAudience) * 100 : 0;

    return {
        groupCount,
        remainingCount,
        remainingCountPercentage,
    };
};

export const contentTypes = [
    { text: 'Subject line', filter: 'subject', id: 1 },
    { text: 'Email content', filter: 'ContentPath', id: 2 },
    { text: 'Schedule', filter: 'Schedule', id: 3 },
];


export function getColLengthValue(channelId, length) {
    const config = {
        1: { 2: '', 3: '6', 4: '4', default: '4' }, //email
        2: { 2: '', 3: '6', default: '4' }, //sms
        21: { 2: '', 3: '6', default: '4' }, //whatsapp
        41: { 2: '', default: '4' }, //rcs

        default: { 2: '', 4: '4', default: '6' },
    };

    const channel = config[channelId] ? channelId : 'default';

    return (
        config[channel][length] ??
        config[channel].default
    );
}
