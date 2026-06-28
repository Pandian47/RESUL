import moment from 'moment';
import _get from 'lodash/get';
import { getUserDetails } from './crypto';
import { getmasterData } from './masterData';
import { getTimezoneAbbreviation } from './timeZone';

const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
const fallbackDate = 'DD MMM YYYY';
const fallbackTime = 'HH:mm A';
const fallbackTimeWithSeconds = 'HH:mm:ss';
const fallbackTwelveHrs = 'hh:mm A';
const fallbackTwelveHrsWithSec = 'h:mm:ss A';
const fallbackHourMinute = 'HH:mm';
const fallbackUtc = 'YYYY-MM-DD HH:mm:ssZ';

function findByProp(collection, key, value) {
    if (!Array.isArray(collection)) return undefined;
    return collection.find((item) => item?.[key] === value);
}

export function getDateFormat() {
    const defaultDate = 'DD MMM YYYY';
    const defaultTime = 'HH:mm A';
    const defaultTimeWithSeconds = 'HH:mm:ss';
    const defaultTwelveHours = 'hh:mm A';
    const defaultTwelveHoursWithSec = 'h:mm:ss A';
    const defaultHourMinute = 'HH:mm';
    let { timeFormatId, dateFormatId, timeZoneId, timezoneName } = getUserDetails();
    if (
        localStorage.getItem('timeFormatId') !== undefined &&
        localStorage.getItem('timeFormatId') !== null &&
        localStorage.getItem('timeFormatId') !== ''
    ) {
        timeFormatId = parseInt(localStorage.getItem('timeFormatId'), 10);
    }
    if (
        localStorage.getItem('dateFormatId') !== undefined &&
        localStorage.getItem('dateFormatId') !== null &&
        localStorage.getItem('dateFormatId') !== ''
    ) {
        dateFormatId = parseInt(localStorage.getItem('dateFormatId'), 10);
    }
    if (
        localStorage.getItem('timeZoneId') !== undefined &&
        localStorage.getItem('timeZoneId') !== null &&
        localStorage.getItem('timeZoneId') !== ''
    ) {
        timeZoneId = parseInt(localStorage.getItem('timeZoneId'), 10);
    }
    let { timeZoneList, timeFormatList, dateFormatList } = getmasterData();
    dateFormatList = findByProp(dateFormatList, 'dateFormatID', dateFormatId || 1);
    timeZoneList = findByProp(timeZoneList, 'timeZoneID', timeZoneId || 1);
    timeFormatList = findByProp(timeFormatList, 'timeFormatID', timeFormatId || 1);
    const timeFormat = timeFormatList?.timeformat === '12 hours' ? defaultTwelveHours : defaultHourMinute;
    const timeFormatSeconds =
        timeFormatList?.timeformat === '12 hours' ? defaultTwelveHoursWithSec : defaultTimeWithSeconds;
    const configuredFormat = dateFormatList?.dateformat || defaultDate;
    return {
        timeFormat,
        configuredFormat,
        dateFormatList,
        timeFormatSeconds,
        timeFormatId,
        dateFormatId,
        timeZoneId,
        timezoneName,
    };
}
export function momentIsValid(data) {
    return moment(data).isValid();
}

export function getDisplayDateMonth(inputFormat) {
    if (inputFormat.startsWith('DD-MM') || inputFormat.startsWith('DD/MM')) return 'DD-MM';
    if (inputFormat.startsWith('MMM-DD') || inputFormat.startsWith('MMM DD') || inputFormat.startsWith('MMM, DD'))
        return 'MMM DD';
    if (inputFormat.startsWith('YYYY-MM') || inputFormat.startsWith('YYYY/MM')) return 'MM-DD';
    if (inputFormat.includes('MMM')) return 'MMM DD';
    return 'MM-DD';
}
export function extractOffsetFromLabel(label) {
    if (!label || typeof label !== 'string') return null;

    // Try different GMT format patterns
    const patterns = [
        /GMT([+-]\d{2}):(\d{2})/, // GMT+05:30
        /GMT([+-]\d{1,2}):?(\d{2})?/, // GMT+5:30 or GMT+530
        /\(GMT([+-]\d{2}):(\d{2})\)/, // (GMT+05:30)
        /\(GMT([+-]\d{1,2}):?(\d{2})?\)/, // (GMT+5:30) or (GMT+530)
        /UTC([+-]\d{2}):(\d{2})/, // UTC+05:30
        /UTC([+-]\d{1,2}):?(\d{2})?/, // UTC+5:30 or UTC+530
    ];

    for (const pattern of patterns) {
        const match = label.match(pattern);
        if (match) {
            const hours = match[1].padStart(3, match[1].charAt(0)); // Ensure +XX or -XX format
            const minutes = match[2] || '00'; // Default to 00 if no minutes
            return `${hours}:${minutes}`;
        }
    }

    return null;
}
export function convertToUTC(localDateTime, gmtLabel) {
    const offset = extractOffsetFromLabel(gmtLabel);
    if (!offset) {
        // Fallback: if GMT label extraction fails, return the date in local format
        const { configuredFormat, timeFormat } = getDateFormat();
        const formatString = `${configuredFormat || 'DD MMM YYYY'}, ${timeFormat || 'HH:mm A'}`;

        if (moment.isMoment(localDateTime)) {
            return localDateTime.format(formatString);
        } else {
            const date = moment(localDateTime);
            return date.isValid() ? date.format(formatString) : 'Invalid Date';
        }
    }

    const { configuredFormat, timeFormat } = getDateFormat();
    const formatString = `${configuredFormat || 'DD MMM YYYY'}, ${timeFormat || 'HH:mm A'}`;

    let date;

    if (moment.isMoment(localDateTime)) {
        date = localDateTime.clone().utcOffset(offset, true);
    } else {
        date = moment(`${localDateTime}${offset}`, 'YYYY-MM-DD HH:mm:ssZ', true);
    }

    if (!date.isValid()) return 'Invalid Date';
    return date.format(formatString);
}
export function getUserCurrentFormat(input, options = {}) {
    const defaultDate = 'DD MMM YYYY';
    const defaultTime = 'HH:mm A';
    const defaultTimeWithSeconds = 'HH:mm:ss';
    //export const getUserCurrentFormat = (input, options = {}) => {
    if (
        input &&
        typeof input === 'object' &&
        !moment.isMoment(input) &&
        !(input instanceof Date) &&
        !moment(input).isValid()
    ) {
        options = input;
        input = moment();
    } else {
        input = input || moment();
    }
    let date;
    const { configuredFormat, timeFormat, timeFormatSeconds, timezoneName } = getDateFormat();
    const isNumericString = typeof input === 'string' && /^\d+$/.test(input);
    const offset = timezoneName ? extractOffsetFromLabel(timezoneName) : null;
    // If noConversion is true, use the input date as-is without timezone conversion
    if (options.noConversion) {
        date = moment(input);
    } else {
        if (typeof input === 'number' || isNumericString) {
            const timestamp = Number(input);
            // date = timestamp.toString().length === 10 ? moment.unix(timestamp) : moment(timestamp);
            date =
                timestamp.toString().length === 10
                    ? moment.unix(timestamp) // Local time
                    : offset
                    ? moment.utc(timestamp).utcOffset(offset)
                    : moment(timestamp);
        } else {
            // date = moment(input);
            date = options?.isOffset && offset ? moment.utc(input).utcOffset(offset) : moment(input);
        }

        if (options.addDaysFromDate && options.days != null) {
            const nativeDate = new Date(options.addDaysFromDate);
            nativeDate.setDate(nativeDate.getDate() + parseInt(options.days, 10));
            // date = moment(nativeDate);
            date = offset ? moment.utc(nativeDate).utcOffset(offset) : moment(nativeDate);
        }

        if (date && date.isValid()) {
            if (options.day) {
                // date = moment(input).add(options.day, 'd');
                date = offset
                    ? moment.utc(input).utcOffset(offset).add(options.day, 'd')
                    : moment(input).add(options.day, 'd');
            }
            if (options.add) {
                Object.entries(options.add).forEach(([unit, value]) => {
                    date.add({ [unit]: value });
                });
            }

            if (options.subtract) {
                Object.entries(options.subtract).forEach(([unit, value]) => {
                    date.subtract({ [unit]: value });
                });
            }
        }
    }

    const dateFormat = date.isValid() ? date.format(configuredFormat || defaultDate) : 'Invalid Date';
    const dateTimeFormat = date.isValid()
        ? date.format(`${configuredFormat || defaultDate}, ${timeFormat || defaultTime}`)
        : 'Invalid Date';
    const dateTimeFormatWithSeconds = date.isValid()
        ? date.format(`${configuredFormat || defaultDate}, ${timeFormatSeconds || defaultTimeWithSeconds}`)
        : 'Invalid Date';
    const formatTime = date.isValid() ? date.format(timeFormat) : date.format(defaultTime);
    const isUTC = typeof input === 'string' && input.includes('UTC');
    // const utcformat = date.isValid()
    //     ? date
    //           .clone()
    //           .utc()
    //           .format(`${configuredFormat || defaultDate} ${timeFormat || defaultTime}`)
    //     : 'Invalid UTC Time';
    const utcformat = date.isValid()
        ? isUTC
            ? date.format(`${configuredFormat || defaultDate}, ${timeFormat || defaultTime}`)
            : options.noConversion
            ? date.format(`${configuredFormat || defaultDate}, ${timeFormat || defaultTime}`)
            : timezoneName
            ? convertToUTC(date, timezoneName)
            : date.format(`${configuredFormat || defaultDate}, ${timeFormat || defaultTime}`)
        : 'Invalid Time';
    const displayFormat = getDisplayDateMonth(configuredFormat);
    const dayMonth = date.isValid() ? date.format(displayFormat || 'MM-DD') : 'Invalid Date';
    const dateToString = date.isValid() ? date.toDate() : 'Invalid Date';
    return {
        dateFormat,
        dateTimeFormat,
        formatTime,
        utcformat,
        dateTimeFormatWithSeconds,
        dayMonth,
        dateToString,
    };
}

export function getUserCurrentFormatWithSeconds(input, options = {}) {
    const result = getUserCurrentFormat(input, options);
    return {
        ...result,
        dateTimeFormat: result.dateTimeFormatWithSeconds,
    };
}

export function getUserCurrentFormatWithAbbreviation(input, options = {}) {
    const result = getUserCurrentFormat(input, options);
    const timezoneName = getUserDetails()?.timezoneName;
    const timezoneAbbr = getTimezoneAbbreviation(timezoneName);
    return {
        ...result,
        dateTimeFormat: timezoneAbbr ? `${result.dateTimeFormat} ${timezoneAbbr}` : result.dateTimeFormat,
    };
}

export function getUserCurrentFormatWithoutYear(input, options = {}) {
    const defaultDate = 'DD MMM YYYY';
    const defaultTime = 'HH:mm A';
    const defaultTimeWithSeconds = 'HH:mm:ss';

    if (
        input &&
        typeof input === 'object' &&
        !moment.isMoment(input) &&
        !(input instanceof Date) &&
        !moment(input).isValid()
    ) {
        options = input;
        input = moment();
    } else {
        input = input || moment();
    }

    let date;

    const { configuredFormat, timeFormat, timeFormatSeconds, timezoneName } = getDateFormat();

    const isNumericString = typeof input === 'string' && /^\d+$/.test(input);
    const offset = timezoneName ? extractOffsetFromLabel(timezoneName) : null;

    // ≡ƒö╣ Remove Year from Format
    const formatWithoutYear = (configuredFormat || defaultDate)
        .replace(/Y{2,4}/g, '') // Remove YYYY or YY
        .replace(/[-/.,\s]+$/, '') // Remove trailing separators
        .trim();

    if (options.noConversion) {
        date = moment(input);
    } else {
        if (typeof input === 'number' || isNumericString) {
            const timestamp = Number(input);

            date =
                timestamp.toString().length === 10
                    ? moment.unix(timestamp)
                    : offset
                    ? moment.utc(timestamp).utcOffset(offset)
                    : moment(timestamp);
        } else {
            date = options?.isOffset && offset ? moment.utc(input).utcOffset(offset) : moment(input);
        }

        if (options.addDaysFromDate && options.days != null) {
            const nativeDate = new Date(options.addDaysFromDate);
            nativeDate.setDate(nativeDate.getDate() + parseInt(options.days, 10));

            date = offset ? moment.utc(nativeDate).utcOffset(offset) : moment(nativeDate);
        }

        if (date && date.isValid()) {
            if (options.day) {
                date = offset
                    ? moment.utc(input).utcOffset(offset).add(options.day, 'd')
                    : moment(input).add(options.day, 'd');
            }

            if (options.add) {
                Object.entries(options.add).forEach(([unit, value]) => {
                    date.add({ [unit]: value });
                });
            }

            if (options.subtract) {
                Object.entries(options.subtract).forEach(([unit, value]) => {
                    date.subtract({ [unit]: value });
                });
            }
        }
    }

    const dateFormat = date?.isValid() ? date.format(formatWithoutYear) : 'Invalid Date';

    const dateTimeFormat = date?.isValid()
        ? date.format(`${formatWithoutYear}, ${timeFormat || defaultTime}`)
        : 'Invalid Date';

    const dateTimeFormatWithSeconds = date?.isValid()
        ? date.format(`${formatWithoutYear}, ${timeFormatSeconds || defaultTimeWithSeconds}`)
        : 'Invalid Date';

    const formatTime = date?.isValid() ? date.format(timeFormat || defaultTime) : 'Invalid Time';

    const isUTC = typeof input === 'string' && input.includes('UTC');

    const utcformat = date?.isValid()
        ? isUTC
            ? date.format(`${formatWithoutYear}, ${timeFormat || defaultTime}`)
            : options.noConversion
            ? date.format(`${formatWithoutYear}, ${timeFormat || defaultTime}`)
            : timezoneName
            ? convertToUTC(date, timezoneName).replace(/\b\d{4}\b/, '') // remove year if returned
            : date.format(`${formatWithoutYear}, ${timeFormat || defaultTime}`)
        : 'Invalid Time';

    const displayFormat = getDisplayDateMonth(formatWithoutYear);

    const dayMonth = date?.isValid() ? date.format(displayFormat || 'MM-DD') : 'Invalid Date';

    const dateToString = date?.isValid() ? date.toDate() : 'Invalid Date';

    return {
        dateFormat,
        dateTimeFormat,
        formatTime,
        utcformat,
        dateTimeFormatWithSeconds,
        dayMonth,
        dateToString,
    };
}

export function getFileDownloadDateTime(input, options = {}) {
    const { configuredFormat, timeFormat } = getDateFormat();
    const date = input ? moment(input) : moment();
    const isTwelveHour = timeFormat.includes('A') || timeFormat.includes('a');
    const basePattern = `${configuredFormat?.replace(/\//g, '-') || 'DD-MM-YYYY'}, ${
        isTwelveHour ? 'hh:mm A' : 'HH:mm'
    }`;
    const formatted = date.format(basePattern);
    const forFilename = options.forFilename !== false;
    return forFilename ? formatted.replace(/:/g, '_') : formatted;
}
export function getAPICurrentDateTimeFormat() {
    const now = new Date();

    // Format date as MM/DD/YYYY
    const date = now.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
    });

    // Format time as HH:MM:SS AM/PM
    const time = now.toLocaleTimeString('en-US', {
        hour12: true,
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
    });

    return `${date} ${time}`;
}
// For dispatching multipleactions in redux:

export function addDays_dddmmmddyyyy(days, pattern = 'ddd, MMM DD, YYYY') {
    return moment().add(days, 'days').format(pattern);
}

// For Checking Empty String

export function getDateWithDay(day) {
    return moment(day).format('ddd, MMM DD, YYYY');
}
export function getfullFormat(day) {
    //Jul 26, 2023 08:58 AM
    return moment(day).format('MMM DD, YYYY HH:mm a');
}
export function getDateWithDayfullFormat(day) {
    //Wed, Jul 26, 2023 08:58 AM
    return moment(day).format('ddd, MMM DD, YYYY HH:mm a');
}
export function getDateWithDDMMM(day) {
    //Wed, Jul 26, 2023 08:58 AM
    return moment(day).utc().format('ddd, DD MMM, YYYY HH:mm A');
}
export function getDateWithDaynoFormat(day) {
    return moment().add(day, 'd').toDate();
}
export function getDateWithAddMinutes(day, minutes) {
    return moment(day).add(minutes, 'm').toDate();
}
export function getDDMMYY(date = new Date()) {
    return moment(date).format('DD-MM-YYYY');
}
export function getMMMDDYYYY(date = new Date()) {
    return moment(date).format('MMM DD, YYYY');
}
export function getDDMMMYYYY(date = new Date()) {
    return moment(date).format('DD MMM, YYYY');
}
export function getDDMMMYYYYWITHOUTCOMMAS(date = new Date()) {
    return moment(date).format('DD MMM YYYY');
}
export function getDDMMM(date = new Date()) {
    return moment(date).format('DD-MMM');
}
export function getMMMDD(date = new Date()) {
    return moment(date).format('MMM DD');
}
export function getYYMMDD(date = new Date()) {
    return moment(date).format('YYYY-MM-DD');
}
export function getYYMM(date = new Date()) {
    return moment(date).format('YYYYMM');
}
export function getFirstDayOfMonth(year, month) {
    return new Date(year, month - 1, 1).toDateString();
}
export function standardizeDateFormat(dateStr) {
    if (!dateStr) return null;
    let { dateFormatList } = getmasterData();
    dateFormatList = [...dateFormatList.map((item) => item?.dateformat), 'MMM DD, YYYY'];
    const date = moment(dateStr, dateFormatList, true); // strict parsing
    return date.isValid() ? date.format('YYYY-MM-DD') : null;
}
export function getCurrentDateOfMonth(year, month) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDate = today.getDate();

    if (year === currentYear && month === currentMonth) {
        return new Date(year, month - 1, currentDate).toDateString();
    } else {
        return new Date(year, month, 0).toDateString();
    }
}
export function getYYMMDDAndTime(date = new Date()) {
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
}
export function getMMDDYYYYWithSlash(date = new Date()) {
    return moment(date).format('MM/DD/YYYY');
}
export function getDateWithDaySubstract(day) {
    return moment().subtract(day, 'days').format('MMM DD');
}
export function getFormattedDate(value) {
    let date = new Date(value).toDateString().slice(4, 15);
    let value1 = date.slice(0, 6);
    let value2 = date.slice(6, 11);
    let newValue = value1 + ',' + value2;
    return newValue;
}
export function getDateAndTimeDifference(day) {
    return moment().subtract(day, 'days').format('hh:mm:ss');
}
export function getYYYYMMDDHHMMSS(date = new Date()) {
    return moment(date).format('YYYYMMDD_HHmmss');
}
export function isURLValid(str) {
    var res = str.match(
        /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g,
    );
    return res !== null;
}

export function dateTimeFormat(date) {
    let dateValue = new Date(date);
    dateValue = dateValue.toLocaleTimeString('en-US', options);
    return dateValue;
}
export function dateFormat(date) {
    let dateValue = new Date(date);
    dateValue = dateValue.toLocaleDateString('en-US', options);
    return dateValue;
}
export function dateFormatWithHyphen(date) {
    let dateValue = new Date(date);
    dateValue = dateValue.toISOString().slice(0, 10);
    return dateValue;
}

export function getDateBasedonDay(days, startDate = new Date(), minus = false) {
    const currentDate = new Date(startDate);
    if (minus) currentDate.setDate(currentDate.getDate() - days);
    else currentDate.setDate(currentDate.getDate() + days);
    return currentDate;
}
export function getDateBasedonMonth(month, startDate = new Date(), minus = false) {
    const currentDate = new Date(startDate);
    if (minus) currentDate.setMonth(month);
    else currentDate.setMonth(currentDate.getMonth() + month);
    return currentDate;
}

export function formatBytes(bytes, decimals = 2) {
    //debugger
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    // const i = Math.floor(Math.log(bytes) / Math.log(k));
    // return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round(bytes / Math.pow(k, i))} ${sizes[i]}`;
}
export function findDuplicateValues(data) {
    const duplicates = data.filter((item, index) => data.indexOf(item) !== index);
    return Array.from(new Set(duplicates));
}
export function removeDuplicates(arr) {
    return arr.filter((item, index) => arr.indexOf(item) === index);
}
export function findDuplicates(data, key = '', isObject = false) {
    const duplicate = {};
    for (let i = 0; i < data?.length; i++) {
        const currentElement = data[i];
        let value = _get(currentElement, key, '');
        if (duplicate[value]) {
            return [true, i];
        } else {
            duplicate[value] = 1;
        }
    }
    // console.log(duplicate, 'duplicate');
    return [false, null];
}
export function findDuplicateArrayofObject(id) {
    //id= which key to use find the duplicate
    const lookup = Object.groupBy(values, (e) => e.id);
    return values.filter((e) => lookup[e.id]?.length > 1);
}
export function removeDuplicateArrayofObject(temp1, temp2, key) {
    const merged = [...temp1, ...temp2].reduce((acc, current) => {
        const x = acc.find((item) => item.key === current.key);
        if (!x) {
            acc.push(current);
        }
        return acc;
    }, []);
    return merged;
}
export function timeFormat() {
    const currentTime = new Date();
    var arrayTime = currentTime?.toDateString()?.split(' ');
    var result = 'As on: ' + arrayTime[0] + ', ' + arrayTime[1] + ' ' + arrayTime[2] + ', ' + arrayTime[3];
    return result;
}

export function YEAR_LIST(count) {
    return Array.from(new Array(count), (val, index) => index + new Date().getFullYear());
}
const YEAR_LIST_BELOW = (start, stop, step) =>
    Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step);

export function YEAR_BELOW_LIST(count) {
    return YEAR_LIST_BELOW(new Date().getFullYear(), new Date().getFullYear() - count, -1).sort();
}
export function YEAR_AFTER_LIST(createdDate) {
    const startYear = new Date(createdDate).getFullYear();
    const endYear = new Date().getFullYear() + 1;
    const years = [];
    for (let y = startYear; y <= endYear; y++) {
        years.push(y);
    }
    return years;
}

export const MM_LIST = Array.apply(0, Array(12)).map(function (_, i) {
    return moment().month(i).format('MMMM');
});

export function MM_LIST_CURRENT(count) {
    return Array.apply(0, Array(count)).map(function (_, i) {
        return moment().month(i).format('MMMM');
    });
}
export function MM_MONTHS(count) {
    return Array.apply(0, Array(12 - count)).map(function (_, i) {
        return moment()
            .month(count + i)
            .format('MMMM');
    });
}
export function MM_MONTHS_NEW() {
    const currentMonthIndex = new Date().getMonth();
    return Array.from({ length: currentMonthIndex + 1 }, (_, i) => moment().month(i).format('MMMM'));
}

//convert 12-hour hh:mm AM/PM to 24-hour hh:mm
export function convertTime12to24(time12h) {
    const [time, modifier] = time12h.split(' ');

    let [hours, minutes] = time.split(':');

    if (hours === '12') {
        hours = '00';
    }

    if (modifier === 'PM') {
        hours = parseInt(hours, 10) + 12;
    }

    return `${hours}:${minutes}`;
}

export function addDaysToDate(addDate, days) {
    const date = new Date(addDate);
    date.setDate(date.getDate() + parseInt(days, 10));
    return date;
}
export function addHoursToDate(addDate, hours) {
    const date = new Date(addDate);
    date.setTime(date.getTime() + parseInt(hours, 10) * 60 * 60 * 1000);
    return date;
}
export function isDateBeforeToday(date) {
    if (date !== undefined && date !== null)
        return new Date(date?.toDateString()) < new Date(new Date().toDateString());
    else return false;
}
export function getUserDateTimeFormat(date = new Date(), type = 'date') {
    let { timeFormatId, dateFormatId, timeZoneId } = getUserDetails();

    if (
        localStorage.getItem('timeFormatId') !== undefined &&
        localStorage.getItem('timeFormatId') !== null &&
        localStorage.getItem('timeFormatId') !== ''
    ) {
        timeFormatId = parseInt(localStorage.getItem('timeFormatId'), 10);
    }
    if (
        localStorage.getItem('dateFormatId') !== undefined &&
        localStorage.getItem('dateFormatId') !== null &&
        localStorage.getItem('dateFormatId') !== ''
    ) {
        dateFormatId = parseInt(localStorage.getItem('dateFormatId'), 10);
    }
    if (
        localStorage.getItem('timeZoneId') !== undefined &&
        localStorage.getItem('timeZoneId') !== null &&
        localStorage.getItem('timeZoneId') !== ''
    ) {
        timeZoneId = parseInt(localStorage.getItem('timeZoneId'), 10);
    }
    let { timeZoneList, timeFormatList, dateFormatList } = getmasterData();
    dateFormatList = findByProp(dateFormatList, 'dateFormatID', dateFormatId || 1);
    timeZoneList = findByProp(timeZoneList, 'timeZoneID', timeZoneId || 1);
    timeFormatList = findByProp(timeFormatList, 'timeFormatID', timeFormatId || 1);

    const tempDate = moment(date);
    if (tempDate.isValid()) {
        const timeFormat = timeFormatList?.timeformat === '12 hours' ? 'hh:mm A' : 'HH:mm';
        switch (type) {
            case 'date':
                return tempDate.format(dateFormatList?.dateformat);
            case 'time':
                return tempDate.format(timeFormat);
            case 'datetime':
                return tempDate.format(dateFormatList?.dateformat + ', ' + timeFormat);
            // Do other formats
            case 'formatDateTime':
                return getViewFormat(dateFormatList?.dateformat, tempDate) + ', ' + tempDate?.format(timeFormat);
            case 'formatDate':
                return getViewFormat(dateFormatList?.dateformat, tempDate);
            // Do other formats
            default:
                return tempDate.format(dateFormatList?.dateformat);
        }
    } else return '';
}

export function getCreatedDate(inputDate, campaign) {
    let { timeFormatId, dateFormatId, timeZoneId } = getUserDetails();

    if (
        localStorage.getItem('timeFormatId') !== undefined &&
        localStorage.getItem('timeFormatId') !== null &&
        localStorage.getItem('timeFormatId') !== ''
    ) {
        timeFormatId = parseInt(localStorage.getItem('timeFormatId'), 10);
    }
    if (
        localStorage.getItem('dateFormatId') !== undefined &&
        localStorage.getItem('dateFormatId') !== null &&
        localStorage.getItem('dateFormatId') !== ''
    ) {
        dateFormatId = parseInt(localStorage.getItem('dateFormatId'), 10);
    }
    if (
        localStorage.getItem('timeZoneId') !== undefined &&
        localStorage.getItem('timeZoneId') !== null &&
        localStorage.getItem('timeZoneId') !== ''
    ) {
        timeZoneId = parseInt(localStorage.getItem('timeZoneId'), 10);
    }
    let { timeZoneList, timeFormatList, dateFormatList } = getmasterData();
    dateFormatList = findByProp(dateFormatList, 'dateFormatID', dateFormatId || 1);
    timeZoneList = findByProp(timeZoneList, 'timeZoneID', timeZoneId || 1);
    timeFormatList = findByProp(timeFormatList, 'timeFormatID', timeFormatId || 1);

    const timeFormat = timeFormatList?.timeformat === '12 hours' ? 'hh:mm A' : 'HH:mm';
    const parsedDate = moment(inputDate, 'YYYY-MM-DD, HH:mm:ss');
    let formattedDate = '';
    if (campaign === 'campaign') {
        formattedDate = parsedDate.format(`YYYY-MM-DD HH:mm:ss`);
    } else formattedDate = parsedDate.format(`ddd, MMM DD, YYYY, ${timeFormat}`);
    return formattedDate;
}
export function getViewFormat(dateFormate, tempDate) {
    return moment(tempDate).format(`ddd, ${dateFormate}`);
}

export function convertToUserTimezone(inputDate = new Date(), options = {}) {
    const { add15Minutes = false, formatAsString = false, customTimezone = null } = options;

    // Get user timezone information
    const { timeZoneId } = getUserDetails();
    const { timeZoneList } = getmasterData();
    let targetTimezone = null;

    if (customTimezone) {
        // Use custom timezone if provided
        targetTimezone = { gmtOffset: customTimezone };
    } else {
        // Use user's profile timezone
        targetTimezone = findByProp(timeZoneList, 'timeZoneID', timeZoneId);
    }

    // Convert input to Date object
    let sourceDate;
    if (typeof inputDate === 'string' || typeof inputDate === 'number') {
        sourceDate = new Date(inputDate);
    } else {
        sourceDate = new Date(inputDate);
    }

    // Validate input date
    if (isNaN(sourceDate.getTime())) {
        return formatAsString ? 'Invalid Date' : new Date();
    }

    // Default to UTC if no timezone found
    if (!targetTimezone?.gmtOffset) {
        const result = new Date(sourceDate);
        if (add15Minutes) {
            result.setMinutes(result.getMinutes() + 15);
        }
        return formatAsString ? getUserCurrentFormat(result).dateTimeFormat : result;
    }

    // Handle edge case: "(GMT) " should be treated as "(GMT+00:00) "
    let gmtOffset = targetTimezone.gmtOffset;
    if (gmtOffset === '(GMT) ' || gmtOffset === 'GMT' || gmtOffset === '(GMT)') {
        gmtOffset = '(GMT+00:00) ';
    }

    // Parse the GMT offset (e.g., "+05:30", "(GMT+05:30)", "GMT+05:30")
    const offsetMatch = gmtOffset.match(/([+-])(\d{2}):(\d{2})/);
    if (!offsetMatch) {
        const result = new Date(sourceDate);
        if (add15Minutes) {
            result.setMinutes(result.getMinutes() + 15);
        }
        return formatAsString ? getUserCurrentFormat(result).dateTimeFormat : result;
    }

    const sign = offsetMatch[1] === '+' ? 1 : -1;
    const offsetHours = parseInt(offsetMatch[2], 10);
    const offsetMinutes = parseInt(offsetMatch[3], 10);
    const totalOffsetMs = sign * (offsetHours * 60 + offsetMinutes) * 60000;

    // Convert to target timezone
    // Get UTC time and apply timezone offset
    const utcTime = sourceDate.getTime() + sourceDate.getTimezoneOffset() * 60000;
    const targetTime = new Date(utcTime + totalOffsetMs);

    // Add 15 minutes if requested
    if (add15Minutes) {
        targetTime.setMinutes(targetTime.getMinutes() + 15);
    }

    // Return formatted string or Date object
    if (formatAsString) {
        return getUserCurrentFormat(targetTime).dateTimeFormat;
    }

    return targetTime;
}
export function getCurrentTimeInUserTimezone(options = {}) {
    const { formatAsString = true } = options;

    return convertToUserTimezone(new Date(), {
        ...options,
        formatAsString,
    });
}

export function getCurrentTimeInUserTimezoneWithAbbreviation(options = {}) {
    const currentTime = getCurrentTimeInUserTimezone(options);
    const timezoneName = getUserDetails()?.timezoneName;
    const timezoneAbbr = getTimezoneAbbreviation(timezoneName);
    return timezoneAbbr ? `${currentTime} ${timezoneAbbr}` : currentTime;
}

/**
 * Convert a date between timezones
 * @param {Date} date - Source date
 * @param {string} targetTimezoneOffset - Target timezone GMT offset (e.g., "+05:30")
 * @returns {Date} - Converted date
 */ export function convertDateBetweenTimezones(date, targetTimezoneOffset) {
    if (!date || !targetTimezoneOffset) {
        return date;
    }

    return convertToUserTimezone(date, {
        customTimezone: targetTimezoneOffset,
        formatAsString: false,
    });
}
export function convertUTCtoUserTimezone(utcDate = new Date(), options = {}) {
    const { formatAsString = false, customTimezone = null } = options;

    // Get user timezone information
    const { timeZoneId } = getUserDetails();
    const { timeZoneList } = getmasterData();
    let targetTimezone = null;

    if (customTimezone) {
        // Use custom timezone if provided
        targetTimezone = { gmtOffset: customTimezone };
    } else {
        // Use user's profile timezone
        targetTimezone = findByProp(timeZoneList, 'timeZoneID', timeZoneId);
    }

    // Convert input to Date object
    let sourceDate;
    if (typeof utcDate === 'string' || typeof utcDate === 'number') {
        sourceDate = new Date(utcDate);
    } else {
        sourceDate = new Date(utcDate);
    }

    // Validate input date
    if (isNaN(sourceDate.getTime())) {
        return formatAsString ? 'Invalid Date' : new Date();
    }

    // Default to UTC if no timezone found
    if (!targetTimezone?.gmtOffset) {
        const result = new Date(sourceDate);
        return formatAsString ? getUserCurrentFormat(result).dateTimeFormat : result;
    }

    // Handle edge case: "(GMT) " should be treated as "(GMT+00:00) "
    let gmtOffset = targetTimezone.gmtOffset;
    if (gmtOffset === '(GMT) ' || gmtOffset === 'GMT' || gmtOffset === '(GMT)') {
        gmtOffset = '(GMT+00:00) ';
    }

    // Parse the GMT offset (e.g., "+05:30", "(GMT+05:30)", "GMT+05:30")
    const offsetMatch = gmtOffset.match(/([+-])(\d{2}):(\d{2})/);
    if (!offsetMatch) {
        const result = new Date(sourceDate);
        return formatAsString ? getUserCurrentFormat(result).dateTimeFormat : result;
    }

    const sign = offsetMatch[1] === '+' ? 1 : -1;
    const offsetHours = parseInt(offsetMatch[2], 10);
    const offsetMinutes = parseInt(offsetMatch[3], 10);
    const totalOffsetMs = sign * (offsetHours * 60 + offsetMinutes) * 60000;

    // Convert UTC to target timezone
    // Since the source date is already in UTC, we just need to add the timezone offset
    const targetTime = new Date(sourceDate.getTime() + totalOffsetMs);

    // Return formatted string or Date object
    if (formatAsString) {
        return getUserCurrentFormat(targetTime).dateTimeFormat;
    }

    return targetTime;
}
export function convertUserTimezoneToTarget(
    currentTime = new Date(),
    currentTimeZone,
    targetTimeZone = '(GMT) ',
    formatAsString = false,
) {
    // Convert input to Date object
    let sourceDate;
    if (typeof currentTime === 'string' || typeof currentTime === 'number') {
        sourceDate = new Date(currentTime);
    } else {
        sourceDate = new Date(currentTime);
    }

    // Validate input date
    if (isNaN(sourceDate.getTime())) {
        return formatAsString ? 'Invalid Date' : new Date();
    }

    // If timezones are the same, return the original date
    if (currentTimeZone === targetTimeZone) {
        return formatAsString ? getUserCurrentFormat(sourceDate).dateTimeFormat : sourceDate;
    }

    // Helper function to parse GMT offset
    const parseGMTOffset = (gmtOffset = '(GMT) ') => {
        // Handle edge cases
        if (gmtOffset === '(GMT) ' || gmtOffset === 'GMT' || gmtOffset === '(GMT)') {
            gmtOffset = '(GMT+00:00) ';
        }

        const offsetMatch = gmtOffset.match(/([+-])(\d{2}):(\d{2})/);
        if (!offsetMatch) {
            return { sign: 1, hours: 0, minutes: 0, totalOffsetMs: 0 };
        }

        const sign = offsetMatch[1] === '+' ? 1 : -1;
        const hours = parseInt(offsetMatch[2], 10);
        const minutes = parseInt(offsetMatch[3], 10);
        const totalOffsetMs = sign * (hours * 60 + minutes) * 60000;

        return { sign, hours, minutes, totalOffsetMs };
    };

    // Parse current and target timezone offsets
    const currentOffset = parseGMTOffset(currentTimeZone);
    const targetOffset = parseGMTOffset(targetTimeZone);

    // Convert to UTC first (remove current timezone offset)
    const utcTime = sourceDate.getTime() - currentOffset.totalOffsetMs;

    // Then convert to target timezone (add target timezone offset)
    const targetTime = new Date(utcTime + targetOffset.totalOffsetMs);

    // Return formatted string or Date object
    if (formatAsString) {
        return getUserCurrentFormat(targetTime).dateTimeFormat;
    }

    return targetTime;
}
