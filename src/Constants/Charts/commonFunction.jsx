import { ch_all_audience, ch_androidColor, ch_android_tv, ch_color1, ch_color2, ch_color3, ch_color4, ch_color5, ch_color6, ch_color7, ch_color8, ch_color9, ch_convertedColor, ch_dark_blue, ch_direct_mail, ch_email, ch_facebook, ch_facebook_ads, ch_fire_os, ch_friday, ch_google_ads, ch_identifiedColor, ch_inprogress, ch_insta, ch_iosColor, ch_knownColor, ch_light_blue, ch_linkedIn, ch_linkedin_ads, ch_medium_blue, ch_medium_green, ch_medium_orange, ch_mobile_push, ch_monday, ch_negative, ch_neutral, ch_notifications, ch_others, ch_pinterest, ch_positive, ch_primary_blue, ch_primary_green, ch_primary_orange, ch_primary_red, ch_qR_code, ch_rcs, ch_saturday, ch_secondary_blue, ch_secondary_green, ch_sms, ch_social_media, ch_sunday, ch_tertiary_grey, ch_thursday, ch_tuesday, ch_tv_os, ch_twitter, ch_twitter_ads, ch_unKnownColor, ch_vms, ch_web_push, ch_wednesday, ch_whatsapp } from 'Constants/GlobalConstant/Colors/colorsVariable';
import moment from 'moment';
/** Defer colorsVariable reads until first access — avoids prod bundle TDZ in heavy chunks. */
const createLazyArray = (getArray) =>
    new Proxy([], {
        get(_target, prop) {
            const arr = getArray();
            const value = arr[prop];
            return typeof value === 'function' ? value.bind(arr) : value;
        },
    });

const createLazyObject = (getObject) =>
    new Proxy(
        {},
        {
            get(_target, prop) {
                if (typeof prop === 'symbol') return undefined;
                return getObject()[prop];
            },
        },
    );

export const getDateWithDay = (value) => {
    return moment().subtract(value, 'days').format('DD-MMM');
};
export const daysCount = (props) => {
    return Array(props)
        .fill(props)
        .map((_, index) => getDateWithDay(index))
        .reverse();
};
export const MonthCount = (props) => {
    return Array(props)
        .fill(props)
        .map((_, index) => getDateWithDay(index));
};

// console.log("MonthCount::", MonthCount(15));

let defaultColorsCache;
const getDefaultColorsArray = () => {
    if (!defaultColorsCache) {
        defaultColorsCache = [
            ch_color1,
            ch_color2,
            ch_color3,
            ch_color4,
            ch_color5,
            ch_color6,
            ch_color7,
            ch_color8,
            ch_color9,
        ];
    }
    return defaultColorsCache;
};

let weekDaysColorsCache;
const getWeekDaysColorsArray = () => {
    if (!weekDaysColorsCache) {
        weekDaysColorsCache = [
            ch_sunday,
            ch_monday,
            ch_tuesday,
            ch_wednesday,
            ch_thursday,
            ch_friday,
            ch_saturday,
        ];
    }
    return weekDaysColorsCache;
};

let weekDaysColorKeyCache;
const getWeekDaysColorKeyMap = () => {
    if (!weekDaysColorKeyCache) {
        weekDaysColorKeyCache = {
            Wednesday: ch_wednesday,
            Tuesday: ch_tuesday,
            Monday: ch_monday,
            Saturday: ch_saturday,
            Thursday: ch_thursday,
            Sunday: ch_sunday,
            Friday: ch_friday,
        };
    }
    return weekDaysColorKeyCache;
};

export const defaultColors = createLazyArray(getDefaultColorsArray);
export const weekDaysColors = createLazyArray(getWeekDaysColorsArray);
export const weekDaysColorKey = createLazyObject(getWeekDaysColorKeyMap);

const seriesNameFieldMap = {
    'Unique Opens': 'Unique opens',
    UnDelivered: 'Undelivered',
    'Unique Clicks': 'Unique clicks',
    SMSPush: 'Mobile push',
    MobilePush: 'Mobile push',
    DirectTraffic: 'Direct traffic',
    ReferringLinks: 'Referring links',
    SocialNetworks: 'Social networks',
    OrganicSearch: 'Organic search',
    identifiedUsersCount: 'Identified',
    knownUsersCount: 'Known',
    unKnownCount: 'Unknown',
    Whatsapp: 'WhatsApp',
    QRCode: 'QR code',
    android: 'Android',
    'Android Phone': 'Android phone',
};

export const seriesNameField = (key) => {
    return seriesNameFieldMap[key] ?? key;
};

let colorCommonCodeCache;
const getColorCommonCodeMap = () => {
    if (!colorCommonCodeCache) {
        colorCommonCodeCache = {
    email: ch_email,
    sms: ch_sms,
    mobile: ch_sms,
    webpush: ch_web_push,
    'web push': ch_web_push,
    'web notification': ch_web_push,
    'mobile push': ch_mobile_push,
    'mobile push notification': ch_mobile_push,
    vms: ch_vms,
    rcs: ch_rcs,
    whatsapp: ch_whatsapp,
    socialmedia: ch_social_media,
    'social media': ch_social_media,
    'qr code': ch_qR_code,
    qrcode: ch_qR_code,
    qr: ch_qR_code,
    x: ch_twitter,
    'x ads': ch_twitter_ads,
    xads: ch_twitter_ads,
    facebook: ch_facebook,
    'facebook ads': ch_facebook_ads,
    facebookads: ch_facebook_ads,
    'google ads': ch_google_ads,
    googleads: ch_google_ads,
    linkedin: ch_linkedIn,
    'linkedin ads': ch_linkedin_ads,
    linkedinads: ch_linkedin_ads,
    notification: ch_notifications,
    notifications: ch_notifications,
    pinterest: ch_pinterest,
    others: ch_others,
    monday: ch_monday,
    tuesday: ch_tuesday,
    wednesday: ch_wednesday,
    thursday: ch_thursday,
    friday: ch_friday,
    saturday: ch_saturday,
    sunday: ch_sunday,
    mon: ch_monday,
    tue: ch_tuesday,
    wed: ch_wednesday,
    thu: ch_thursday,
    fri: ch_friday,
    sat: ch_saturday,
    sun: ch_sunday,
    android: ch_androidColor,
    'android tv os':ch_android_tv,
    'fire os':ch_fire_os,
    'tv os':ch_tv_os,
    ios: ch_iosColor,
    unknown: ch_unKnownColor,
    known: ch_knownColor,
    identified: ch_identifiedColor,
    'known users': ch_knownColor,
    'unknown users': ch_unKnownColor,
    'identified users': ch_identifiedColor,
    converted: ch_convertedColor,
    acquisition: ch_color1,
    churn: ch_color8,
    attrition: ch_color8,
    augmented: ch_color2,
    augmentation: ch_color2,
    'data augmentation': ch_color2,
    english: ch_androidColor,
    spanish: ch_dark_blue,
    active: ch_secondary_green,
    'in-active': ch_tertiary_grey,
    inactive: ch_tertiary_grey,
    communications: ch_color1,
    'active users': ch_primary_orange,
    health: ch_primary_orange,
    investments: ch_mobile_push,
    banking: ch_all_audience,
    travel: ch_email,
    forwards: ch_secondary_green,
    'unique opens': ch_color1,
    'forward mail clicks': ch_secondary_green,
    'unique clicks': ch_color1,
    'total unique scans': ch_color1,
    'total delivered': ch_color1,
    'link clicks': ch_primary_orange,
    dismiss: ch_primary_red,
    dismissed: ch_primary_red,
    live: ch_primary_green,
    instagram: ch_insta,
    concurrent: ch_inprogress,
    'conversion period': ch_secondary_green,
    website: ch_medium_green,
    'communication period': ch_medium_green,
    tumblr: ch_direct_mail,
    positive: ch_positive,
    neutral: ch_neutral,
    negative: ch_negative,
    reach: ch_secondary_blue,
    engagement: ch_primary_orange,
    conversion: ch_secondary_green,
    interaction: ch_color1,
    'total users': ch_primary_orange,
    'total sessions': ch_primary_orange,
    'vision industry': ch_primary_orange,
    'competitor brand': ch_secondary_green,
    men: ch_light_blue,
    women: ch_medium_blue,
    'total page': ch_medium_orange,
    'total page subscribers': ch_medium_green,
    'unique visitors': ch_primary_blue,
    impressions: ch_primary_blue,
    direct: ch_color9
        };
    }
    return colorCommonCodeCache;
};

export const colorCommonCode = createLazyObject(getColorCommonCodeMap);
export const colorCommonCodeFunc = (props) => {
    const rawName = props?.name;
    if (rawName == null || rawName === '') return undefined;

    const normalizedName = seriesNameField(String(rawName).trim());
    const lowered = normalizedName.toLowerCase();
    const compact = lowered.replace(/\s+/g, '');

    return colorCommonCode[lowered] ?? colorCommonCode[compact];
};

export const commonColorCode = (data) => {
    // 6 length
    const tempColors = [],
        absentColors = []; // 4 // 2
    data.forEach((item, index) => {
        let color;
        if (item.name === 'Total delivered') {
            color = ch_color1;
        } else if (item.name === 'Undelivered') {
            color = ch_color2;
        } else if (item.name === 'Rejected') {
            color = ch_color3;
        } else {
            color = colorCommonCodeFunc(item);
        }
        if (color) tempColors.push(color);
        else absentColors.push(index);
    });
    if (absentColors?.length) {
        let colorss = [
            ch_color1,
            ch_color2,
            ch_color3,
            ch_color4,
            ch_color5,
            ch_color6,
            ch_color7,
            ch_color8,
            ch_color9,
        ];
        
        // Prevent visually indistinguishable colors
        const hasSimilarGreen = tempColors.includes(ch_secondary_green) || tempColors.includes(ch_primary_green) || tempColors.includes(ch_knownColor);
        if (hasSimilarGreen) {
            colorss = colorss.filter(c => c !== ch_color2);
        }
        const hasSimilarBlue = tempColors.includes(ch_primary_blue) || tempColors.includes(ch_secondary_blue) || tempColors.includes(ch_medium_blue);
        if (hasSimilarBlue) {
            colorss = colorss.filter(c => c !== ch_color1);
        }

        for (let i = 0; i < colorss?.length; i++) {
            if (tempColors?.length === data?.length) break;
            if (!tempColors.includes(colorss[i])) {
                const firstColor = absentColors.shift(); //3
                tempColors.splice(firstColor, 0, colorss[i]);
            }
        }
    }
    return tempColors;
};

export const chartSizing = {
    area: 335,
    areaLabel: 335,
    areaFooter: 293,
    areaFooterLabel: 293,

    column: 325,
    columnLabel: 325,
    columnFooter: 284,
    columnFooterLabel: 284,

    pie: 335,
    pieLabel: 335,
    pieFooter: 294,
    pieFooterLabel: 294,

    avg: 350,
    avgLabel: 350,
    avgFooter: 310,
    avgFooterLabel: 310,

    bar: 325,
    barLabel: 325,
    barFooter: 294,
    barFooterLabel: 294,

    pyramid: 335,
    pyramidLabel: 335,
    pyramidFooter: 290,
    pyramidFooterLabel: 290,

    clock: 290,
    clockLabel: 290,
    clockFooter: 290,
    clockFooterLabel: 290,

    varPie: 351,
    varPieLabel: 351,
    varPieFooter: 290,
    varPieFooterLabel: 290,

    bubble: 335,
    bubbleLabel: 335,
    bubbleFooter: 290,
    bubbleFooterLabel: 290,

    map: 335,
    mapLabel: 335,
    mapFooter: 290,
    mapFooterLabel: 290,

    gauge: 170,
};

// export const colorCommonClass = {
//     'email': 'color-email',
//     'sms': 'color-sms',
//     'webpush': 'color-web-push',
//     'mobile push': 'color-mobile-push',
//     'vms': 'color-vms',
//     'whatsapp': 'color-whatsapp',
//     'qr code': 'color-qr-code',
//     'twitter': 'color-twitter',
//     'facebook': 'color-facebook',
//     'notification': 'color-notification',
//     'pinterest': 'color-pinterest',
// }
// export const colorCommonClassFunc = (data) => {
//     const key = data?.name?.toLowerCase()
//     return colorCommonClass[key]
// }
// export const commonColorClass = (data) => {   // 6 length
//     const tempColors = [], absentColors = []; // 4 // 2
//     data.map((name, index) => {
//         const color = colorCommonClassFunc(name) // email
//         if (color) tempColors.push(color)
//         else absentColors.push(index)
//     })
//     if (absentColors?.length) {
//         const colors = ['#26ADE0', '#90C830', '#F58332', '#DDB219', '#F05455', '#35A8AD', '#D1569E', '#9B5FAA', '#B8B6B7'];
//         for (let i = 0; i < length; i++) {
//             if (tempColors?.length === data?.length) break;
//             if (!tempColors.includes(colors[i])) {
//                 const firstColor = absentColors.shift(); //3
//                 tempColors.splice(firstColor, 0, colors[i]);
//             }
//         }
//     }
//     return tempColors
// }

//ex. commonColorCode(['email', 'sms', 'tem2', 'temp2'])

// export const colorCommonFunc = (col) => {

//     const key = col?.name?.toLowerCase()
//     return colorCommonFuncOb[key]

//     // switch (col.toLowerCase()) {
//     //     case 'email':
//     //         return '#fc6a00'
//     //     case 'sms':
//     //         return '#dfb82b'
//     //     case 'webpush':
//     //         return '#5ba529'
//     //     case 'mobile push':
//     //         return '#99cc03'
//     //     case 'vms':
//     //         return '#008489'
//     //     case 'whatsapp':
//     //         return '#00d954'
//     //     case 'qr code':
//     //         return '#666666'
//     //     case 'twitter':
//     //         return '#1d9bf0'
//     //     case 'facebook':
//     //         return '#1877f2'
//     //     case 'notification':
//     //         return '#f05455'
//     //     case 'pinterest':
//     //         return '#e60023'
//     //     default:
//     //         return ""
//     // }
// }
