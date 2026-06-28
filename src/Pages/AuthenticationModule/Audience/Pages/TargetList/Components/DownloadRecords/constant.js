import { createElement } from 'react';
import { getYYMMDD } from 'Utils/modules/dateTime';
import Daily from 'Pages/AuthenticationModule/Components/Schedules/Daily';
import Weekly from 'Pages/AuthenticationModule/Components/Schedules/Weekly';
import Monthly from 'Pages/AuthenticationModule/Components/Schedules/Monthly';

import { DAYS, MONTH} from 'Constants/GlobalConstant/Placeholders';


export const SHARE_OPTIONS = [
    'Google',
    'Facebook',
    'listName 3211045457',
    'listName 3211038762',
    'listName 321103447',
    'listName 320144598',
    'listName 3201336636',
    'listName 3201333263',
    'listName 3201327317',
    'listName 3201320895',
    'listName 3171530669',
    'Resulticks',
    'API RN Feb008',
    'API Test RN Feb07',
    'API 18 MAR',
];

export const SFTP_RESET_FREQUENCY = {
    shortly: { every_time: '', period: '' },
    daily: { days: '', hours: '' },
    weekly: {
        week: '',
        hours: '',
        weekDays: { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false },
    },
    monthly: {
        type: '',
        second_hours: '',
        second_months: '',
        second_days: '',
        second_frequency: '',
        first_hours: '',
        first_months: '',
        first_day: '',
    },
};

export const SFTP_SCHEDULE_FREQUENCY_TABS = [
    { id: 1, text: 'Daily', component: () => createElement(Daily, { isTLShare: true }) },
    { id: 2, text: 'Weekly', component: () => createElement(Weekly, { isTLShare: true }) },
    { id: 3, text: 'Monthly', component: () => createElement(Monthly, { isTLShare: true }) },
];

export const SFTP_SHARE_ROW_DEFAULTS = {
    apiname: 'SFTP',
    remoteDatasourceId: 8,
    apiConsumptionsDetailsId: -9001,
};

export const WEEKLY_DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export const FREQUENCY_ID_TO_WEEK_OCCURRENCE = {
    1: 'first',
    2: 'second',
    3: 'third',
    4: 'fourth',
    5: 'last',
};

export const WEEKDAY_SHORT_TO_LONG = {
    mon: 'monday',
    tue: 'tuesday',
    wed: 'wednesday',
    thu: 'thursday',
    fri: 'friday',
    sat: 'saturday',
    sun: 'sunday',
};

export function buildSftpScheduleApiPayload(getValues) {
    const v = getValues();
    if (!v?.scheduleShareEnabled) {
        return {
            isFrequencyEnable: false,
            endDate: '',
            scheduleFrequency: { frequency: '', dateBased: {}, patternBased: {} },
            EncryptorDecrypt: '',
        };
    }
    const startDate = getYYMMDD(new Date());
    const endDate = getYYMMDD(new Date(v?.enddate));
    const freqType = Number(v.sftpShareFrequencyType) || 1;
    let scheduleFrequency;

    if (freqType === 1) {
        scheduleFrequency = {
            frequency: 'daily',
            dateBased: {
                interval: parseInt(v.daily?.days, 10) || 1,
                time: v.daily?.hours,
            },
            patternBased: {},
        };
    } else if (freqType === 2) {
        const wd = v.weekly?.weekDays || {};
        const weekdays = WEEKLY_DAY_KEYS.filter((key) => wd[key] === true).map(
            (key) => WEEKDAY_SHORT_TO_LONG[key] || key,
        );
        scheduleFrequency = {
            frequency: 'weekly',
            dateBased: {},
            patternBased: {
                interval: parseInt(v.weekly?.week, 10) || 1,
                time: v.weekly?.hours,
                weekdays,
            },
        };
    } else {
        const m = v.monthly || {};
        if (m.type === DAYS) {
            scheduleFrequency = {
                frequency: 'monthly',
                dateBased: {
                    day: parseInt(m.first_day, 10) || 0,
                    interval: parseInt(m.first_months, 10) || 1,
                    time: m.first_hours,
                },
                patternBased: {},
            };
        } else if (m.type === MONTH) {
            const occId = m.second_frequency?.id;
            const weekOccurrence = FREQUENCY_ID_TO_WEEK_OCCURRENCE[occId] || 'first';
            const dayShort = m.second_days?.name || 'mon';
            scheduleFrequency = {
                frequency: 'monthly',
                dateBased: {},
                patternBased: {
                    weekOccurrence,
                    weekday: WEEKDAY_SHORT_TO_LONG[dayShort] || String(dayShort).toLowerCase(),
                    interval: parseInt(m.second_months, 10) || 1,
                    time: m.second_hours,
                },
            };
        } else {
            scheduleFrequency = { frequency: 'monthly', dateBased: {}, patternBased: {} };
        }
    }

    return {
        isFrequencyEnable: v?.scheduleShareEnabled || false,
        endDate,
        startDate,
        scheduleFrequency,
        EncryptorDecrypt: '',
    };
}
