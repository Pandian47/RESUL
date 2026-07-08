

import { getEnvironment } from './environment';
import { decryptWithAES, decodeLargeState } from './crypto';

const parseRouteQueryState = (param) => {
    if (!param) return null;
    try {
        const result = decodeLargeState(param);
        if (result) return result;
        const normalizedParam = param.replaceAll(' ', '+');
        const decryptedState = decryptWithAES(decodeURIComponent(normalizedParam));
        const parsed = JSON.parse(decryptedState);
        if (parsed?.__v === 2 && parsed?.__sid) return null;
        return parsed;
    } catch {
        return null;
    }
};

let cachedRouteSearch = '';
let cachedRouteQueryState;

export const getCampaignStatusIdFromRoute = () => {
    if (typeof window === 'undefined') return null;
    const search = window.location.search;
    if (search === cachedRouteSearch && cachedRouteQueryState !== undefined) {
        return cachedRouteQueryState?.statusId ?? null;
    }
    const param = new URLSearchParams(search).get('q');
    cachedRouteSearch = search;
    cachedRouteQueryState = parseRouteQueryState(param);
    return cachedRouteQueryState?.statusId ?? null;
};

export function checkIsEmptyArryObj(value) {
    if (value) {
        if (Array.isArray(value)) {
            return value?.length;
        } else {
            return Object.keys(value)?.length;
        }
    } else {
        return false;
    }
}
//Download array to csv file

export function diff_minutes(dt2, dt1) {
    // debugger;
    var d2 = new Date(dt2);
    var d1 = new Date(dt1);
    d2.setSeconds(0, 0);
    d1.setSeconds(0, 0);
    const diffInMilliseconds = d2.getTime() - d1.getTime();
    const diffInMinutes = diffInMilliseconds / (1000 * 60);
    return Math.round(diffInMinutes * 100) / 100;
    // return Math.abs(Math.round(diff));
}
export function campaignSchedule(date, temptimezoneId, statusId = null, utcDateTime = null) {
    let isUnScheduled = checkUnscheduled(statusId);
    if (!isUnScheduled) {
        return true;
    }
    let timezoneId = temptimezoneId;
    if (timezoneId === undefined) {
        timezoneId = '(GMT+05:30) ';
    }
    let scheduleDate = date;
    var selectedDateHrsArr;
    var selectedDate = new Date(date);

    // Use UTC date from API if provided, otherwise fallback to system date
    var today_utc;
    if (utcDateTime) {
        today_utc = new Date(utcDateTime.replace('Z', ''));
    } else {
        var today = new Date();
        today_utc = new Date(
            today.getUTCFullYear(),
            today.getUTCMonth(),
            today.getUTCDate(),
            today.getUTCHours(),
            today.getUTCMinutes(),
            today.getUTCSeconds(),
        );
    }
    const gmtStart = timezoneId?.indexOf?.('(GMT') ?? -1;
    const gmtEnd = timezoneId?.indexOf?.(')') ?? -1;
    var timeZoneOffset =
        gmtStart >= 0 && gmtEnd > gmtStart
            ? timezoneId.trim().substring(gmtStart + 4, gmtEnd)
            : '';
    var [Hrs, Mins] = (timeZoneOffset || '0:0').split(':').map(Number);
    Mins = Mins || 0;

    selectedDate.setHours(selectedDate.getHours() - Hrs);
    selectedDate.setMinutes(selectedDate.getMinutes() - Mins);

    today_utc.setSeconds(0);
    selectedDate.setSeconds(0);

    const dateDifferenceInMinutes = (dateInitial, dateFinal) => (dateFinal - dateInitial) / (60 * 1000);

    const diff = dateDifferenceInMinutes(today_utc, selectedDate);

    return diff >= 15;
}
export function getCityTime(gmtOffset, add15Mins = true) {
    // Default to UTC if invalid input
    const defaultOffset = 'GMT+00:00';
    let offsetToUse = defaultOffset;

    // Extract offset if valid format (supports "GMT", "UTC", "GMT┬▒HH:MM")
    if (typeof gmtOffset === 'string') {
        if (gmtOffset === '(GMT)' || gmtOffset === 'UTC') {
            offsetToUse = defaultOffset;
        } else if (gmtOffset.includes('GMT')) {
            offsetToUse = gmtOffset;
        }
    }

    // Parse offset (safe fallback to 0)
    const offsetMatch = offsetToUse.match(/([+-])(\d{2}):(\d{2})/);
    const sign = offsetMatch?.[1] === '+' ? 1 : -1;
    const offsetHours = parseInt(offsetMatch?.[2] || 0, 10);
    const offsetMinutes = parseInt(offsetMatch?.[3] || 0, 10);
    const totalOffsetMs = sign * (offsetHours * 60 + offsetMinutes) * 60000;

    // Calculate target time (with 15min buffer if needed)
    const now = new Date();
    const targetTime = new Date(now.getTime() + now.getTimezoneOffset() * 60000 + totalOffsetMs);
    if (add15Mins) targetTime.setMinutes(targetTime.getMinutes() + 15);

    // Format as "DD MMM, YYYY HH:mm" (always valid)
    return targetTime
        .toLocaleString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        })
        .replace(/,/g, '');
}
export const COMPLETED_CAMPAIGN_STATUS_ID = 9;

export const isCompletedCampaign = (statusId) =>
    Number(statusId) === COMPLETED_CAMPAIGN_STATUS_ID;

export function statusIdCheck(param = null, campaignType = 'S', campaignDetails) {
    if (isCompletedCampaign(getCampaignStatusIdFromRoute())) {
        return false;
    }
    const contentStatusId = campaignDetails?.content?.[0]?.statusId || 0;
    const triggerStatusId = campaignDetails?.triggerPlayPauseStatus || 0;
    if (campaignType === 'T') {
        if (Object.keys(campaignDetails)?.length && contentStatusId) {
            return getEventTriggerCampaignStatusCheck(campaignType, contentStatusId, triggerStatusId);
        } else {
            //{7: scheduled , 6: draft, 54: onHold} can be editable.
            if (param === null || param === undefined || param === '') return true;
            if (param === 7 || param === 6 || param === 54 || param === 0) return true;
            return false;
        }
    } else {
        //{7: scheduled , 6: draft, 54: onHold} can be editable.
        if (param === null || param === undefined || param === '') return true;
        if (param === 7 || param === 6 || param === 54 || param === 0) return true;
        return false;
    }
}
export function getEventTriggerCampaignStatusCheck(campaignType, contentStatusId, triggerStatusId) {
    // 6- draft , 27 - pause , 54 - onHold , 7 - schedule
    // if ([6, 7, 54]?.includes(parseInt(contentStatusId, 10)) && triggerStatusId !== 26) {
    //     return true
    // } else if (contentStatusId == 5 && triggerStatusId == 27) {
    //     return true
    // } else {
    //     return false
    // }

    if (getEnvironment() === 'TEAM') {
        return (
            ([6, 7, 54].includes(contentStatusId) && triggerStatusId !== 26) ||
            (contentStatusId == 5 && triggerStatusId == 27) || (triggerStatusId == 54 && contentStatusId == 54)
        );
    } else {
        return (
            ([6, 7, 54].includes(contentStatusId) && triggerStatusId !== 26)
             ||
              (contentStatusId == 5 && triggerStatusId == 27) || (triggerStatusId == 54 && contentStatusId == 54 )
        );
    }
}
export function checkTrigger(type, endDate) {
    //console.log('type: ', type);
    const EndDate = new Date(endDate);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    if (type === 'T') {
        if (EndDate < currentDate) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}
export function checkRFAApproved(statusId = null, approvalList = []) {
    if (statusId === null || statusId === undefined || statusId === '') return false;
    if (statusId === 7 && approvalList?.length > 0) return true;
    else return false;
}
export function validateRFAMandatory({
    isCurrentBURFAStatus,
    getValues,
    setValue,
    setError,
    trigger,
    isCommunication = false,
    currentSchedule = null,
    levelNumber = 1,
    campaignType = 'S',
    dataSource = 'TL',
    triggerPlayPauseStatus = 0,
}) {
    const isScheduleApplicable =
        campaignType === 'S' || (campaignType === 'M' && dataSource === 'TL' && (!levelNumber || levelNumber < 2));

    if (campaignType !== 'T') {
        if (!isCurrentBURFAStatus) {
            return true;
        }
        if (isScheduleApplicable && !currentSchedule) {
            return true;
        }
    } else if (!isCurrentBURFAStatus && (triggerPlayPauseStatus !== 27 && triggerPlayPauseStatus !== 54)) {
        return true;
    }

    const approvalList = getValues('approvalList');
    if (!approvalList) {
        return true;
    }

    const requestApproval = getValues('approvalList.requestApproval');

    if (!requestApproval) {
        setValue('approvalList.requestApproval', true);
        if (isCommunication) {
            const nameArray = getValues('approvalList.name');
            if (!nameArray || !Array.isArray(nameArray) || nameArray.length === 0) {
                setValue('approvalList.name', [{ approverName: '', mandatory: false }]);
            } else {
                setValue('approvalList.name[0].approverName', '');
            }
            setValue('approvalList.isEmail', false);
            setValue('approvalList.isApprovalInputEmail', false);
        }

        setError('approvalList.name[0].approverName', {
            type: 'custom',
            message: 'Request for approval is mandatory',
        });

        trigger('approvalList.requestApproval');

        return false;
    }

    return true;
}
export function checkUnscheduled(statusId = null) {
    if (statusId === null || statusId === undefined || statusId === '') return true;
    if (statusId === 6) return true;
    return false;
}
export function getNumberToLetter(n) {
    if (n < 1 || n > 26) return null;
    return String.fromCharCode(96 + n);
}
//format number start
export function formatNumber(n) {
    if (n == null || n === '' || Number.isNaN(Number(n))) return '0';
    n = Number(n);
    if (n >= 1000000000000) {
        return (n / 1000000000000).toFixed(2).replace(/\.?0+$/, '') + 'T';
    } else if (n >= 100000000000) {
        return (n / 1000000000).toFixed(2).replace(/\.?0+$/, '') + 'B';
    } else if (n >= 10000000000) {
        return (n / 1000000000).toFixed(2).replace(/\.?0+$/, '') + 'B';
    } else if (n >= 1000000000) {
        return (n / 1000000000).toFixed(2).replace(/\.?0+$/, '') + 'B';
    } else if (n >= 100000000) {
        return (n / 1000000).toFixed(2).replace(/\.?0+$/, '') + 'M';
    } else if (n >= 10000000) {
        return (n / 1000000).toFixed(2).replace(/\.?0+$/, '') + 'M';
    } else if (n >= 1000000) {
        return (n / 1000000).toFixed(2).replace(/\.?0+$/, '') + 'M';
    } else if (n >= 100000) {
        return (n / 1000).toFixed(2).replace(/\.?0+$/, '') + 'K';
    } else if (n >= 1000) {
        return (n / 1000).toFixed(2).replace(/\.?0+$/, '') + 'K';
    } else {
        return Number(n)
            .toFixed(2)
            .replace(/\.?0+$/, '');
    }
}
//end
export function formatTime(date) {
    const splitDate = date?.split(':');
    let formDateValue;
    formDateValue = `${splitDate[0] !== '00' ? `${splitDate[0] === 'NA' ? '00' : `${splitDate[0]}`}hr` : ''}  ${splitDate[1] == '00' || splitDate[1] == undefined ? '00' : splitDate[1]
        }m ${splitDate[2] ?? '00'}s`;
    return formDateValue;
}
