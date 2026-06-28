import { getUserDetails } from 'Utils/modules/crypto';
import Daily from 'Pages/AuthenticationModule/Components/Schedules/Daily';
import Weekly from 'Pages/AuthenticationModule/Components/Schedules/Weekly';
import Monthly from 'Pages/AuthenticationModule/Components/Schedules/Monthly';
import Shortly from 'Pages/AuthenticationModule/Components/Schedules/Shortly';
import _cloneDeep from 'lodash/cloneDeep';

import { FREQUENCY, WEEK_DAYS } from 'Pages/AuthenticationModule/Components/Schedules/Constants';

export const FREQUENCY_TAB_CONFIG = [
    {
        id: 4,
        text: 'Immediate',
        component: () => <></>,
    },
    {
        id: 5,
        text: 'Shortly',
        component: () => <Shortly />,
    },
    { id: 1, text: 'Daily', component: () => <Daily isMDC /> },
    { id: 2, text: 'Weekly', component: () => <Weekly isMDC /> },
    { id: 3, text: 'Monthly', component: () => <Monthly isMDC /> },
];

export const RESET_FREQUENCY = {
    shortly: {
        every_time: '',
        period: {
            id: 1,
            value: 'hours',
        },
    },
    daily: {
        days: '',
        hours: '',
    },
    weekly: {
        weekDays: [],
        hours: '',
        week: '',
    },
    monthly: {
        type: '',
        second_hours: '',
        second_months: '',
        second_days: '',
        second_frequency: '',
        first_hours: '',
        first_months: '',
        first_days: '',
    },
};

export const FORM_INITIAL_STATE = {
    defaultValues : {
    dynamicList: '',
    timezone: 0,
    daylightSavings: false,
    shortly: {
        every_time: '',
        period: {
            id: 1,
            value: 'hours',
        },
    },
    daily: {
        days: '',
        hours: '',
    },
    weekly: {
        weekDays: [],
        hours: '',
        week: '',
    },
    monthly: {
        type: '',
        second_hours: '',
        second_months: '',
        second_days: { id: 1, name: 'mon', labelName: 'Monday', value: 'Monday' },
        second_frequency: { id: 1, label: 'First' },
        first_hours: '',
        first_months: '',
        first_day: '',
    },
}
};

export const buildSaveTriggerCavasDataPayload = (triggerData) => {
    const userDetails = getUserDetails();
        const {
        campaignId,
        clientId,
        departmentId,
        userId,
        dynamicList: { dynamicListId, dynamicListName },
        isFrequency = false,
        frequencyId,
        timeZoneId,
        timezone,
        isDaylightSavings = false,
    } = triggerData;

    const commonPayload = {
        campaignId,
        clientId,
        departmentId,
        userId,
        campaignType: 'M',
        dynamicListId,
        timeZoneId: (timezone?.timeZoneID || timeZoneId) ?? userDetails?.timeZoneId,
        isAssignedFrequencyEnable: isFrequency,
        reccurenceinfo: {
            frequencyId: frequencyId,
            isDay: isDaylightSavings,
        },
    };
    const customPayload = frequencyBasedPayload(triggerData, frequencyId);
    return {
        ...commonPayload,
        reccurenceinfo: { ...commonPayload.reccurenceinfo, ...customPayload },
    };
};

const frequencyBasedPayload = (triggerData, frequencyId) => {
    let payload = {};

    switch (frequencyId) {
        case 1:
            {
                const {
                    daily: { days, hours },
                } = triggerData;
                payload = {
                    reccursEveryDaily: parseInt(days, 10),
                    reccursOn: '',
                    recurrenceTimeDaily: hours,
                    recurrsEveryTimeId: '',
                    isMonday: false,
                    isTuesday: false,
                    isWednesday: false,
                    isThrusday: false,
                    isFriday: false,
                    isSaturday: false,
                    isSunday: false,
                    isWeekDay: false,

                    timeSubsetId: '',
                };
            }
            break;
        case 2:
            {
                const {
                    weekly: {
                        week,
                        hours,
                        weekDays: {
                            fri = false,
                            mon = false,
                            sat = false,
                            sun = false,
                            thu = false,
                            tue = false,
                            wed = false,
                        },
                    },
                } = triggerData;
                payload = {
                    reccursEveryDaily: parseInt(week, 10),
                    reccursOn: '',
                    recurrenceTimeDaily: hours,
                    recurrsEveryTimeId: '',
                    isMonday: mon,
                    isTuesday: tue,
                    isWednesday: wed,
                    isThrusday: thu,
                    isFriday: fri,
                    isSaturday: sat,
                    isSunday: sun,
                    isWeekDay: false,

                    timeSubsetId: '',
                };
            }
            break;
        case 3:
            {
                const {
                    monthly: { type, first_day, first_hours, first_months },
                } = triggerData;
                let subsetId = type === 'Day(s)' ? 4 : 5;
                if (type === 'Day(s)') {
                    payload = {
                        reccursEveryDaily: parseInt(first_day, 10),
                        reccursOn: parseInt(first_months, 10),
                        recurrenceTimeDaily: first_hours,
                        recurrsEveryTimeId: '',
                        isMonday: false,
                        isTuesday: false,
                        isWednesday: false,
                        isThrusday: false,
                        isFriday: false,
                        isSaturday: false,
                        isSunday: false,
                        isWeekDay: false,
                        timeSubsetId: subsetId,
                    };
                } else {
                    const {
                        monthly: { second_frequency, second_days, second_months, second_hours },
                    } = triggerData;
                    payload = {
                        reccursEveryDaily: parseInt(second_days['id'], 10),
                        reccursOn: parseInt(second_months, 10),
                        recurrenceTimeDaily: second_hours,
                        recurrsEveryTimeId: second_frequency['id'],
                        isMonday: false,
                        isTuesday: false,
                        isWednesday: false,
                        isThrusday: false,
                        isFriday: false,
                        isSaturday: false,
                        isSunday: false,
                        isWeekDay: false,
                        timeSubsetId: subsetId,
                    };
                }
            }
            break;
        case 4:
            {
                payload = {
                    reccursEveryDaily: '',
                    reccursOn: '',
                    recurrenceTimeDaily: '',
                    recurrsEveryTimeId: '',
                    isMonday: false,
                    isTuesday: false,
                    isWednesday: false,
                    isThrusday: false,
                    isFriday: false,
                    isSaturday: false,
                    isSunday: false,
                    isWeekDay: false,
                    timeSubsetId: '',
                };
            }
            break;
        case 5:
            {
                const {
                    shortly: { every_time, period },
                } = triggerData;
                payload = {
                    reccursEveryDaily: '',
                    reccursOn: parseInt(every_time, 10),
                    recurrenceTimeDaily: '',
                    recurrsEveryTimeId: period['id'],
                    isMonday: false,
                    isTuesday: false,
                    isWednesday: false,
                    isThrusday: false,
                    isFriday: false,
                    isSaturday: false,
                    isSunday: false,
                    isWeekDay: false,
                    timeSubsetId: '',
                };
            }
            break;
        default:
    }
    return payload;
};

export const RecipientNameList = (recipientList) => {
    let cloneList = _cloneDeep(recipientList);
    const formattedList = cloneList.map((item) => {
        item.recipientsBunchName = ![-1, -2].includes(item.segmentationListId)
            ? `${item.recipientsBunchName} (${item.recipientCount})`
            : item.recipientsBunchName;
        return item;
    });
    return formattedList;
};

 export const buildSelectedListByFrequency = (canvasState, freqId, list, timezone) => {
    const baseList = {
        dynamicList: list?.[0],
        timezone: timezone?.[0],
        frequencyId: freqId,
    };

   const details = canvasState?.dataSource?.freqDetails?.details

    switch (freqId) {
        case 1: // Daily
            return {
                ...baseList,
                daily: {
                    days: details?.day,
                    hours: details?.time,
                },
            };

        case 2: // Weekly
            return {
                ...baseList,
                weekly: {
                    week: details?.week,
                    hours: details?.time,
                    weekDays: TriggerInWeek(details?.dayList || [])
                },
            };

        case 3: // Monthly
            const monthlyBase = {
                ...baseList,
                monthly: {
                    type: details?.optionType === 'day' ? 'Day(s)' : 'Month(s)',
                },
            };
            if (details?.optionType === 'day') {
                return {
                    ...monthlyBase,
                    monthly: {
                        ...monthlyBase.monthly,
                        first_day: details?.reccursEveryMonthly,
                        first_hours: details?.recurrenceTimeMonthly,
                        first_months: details?.reccursOn,
                    },
                };
            } else if (details?.optionType === 'the') {
                return {
                    ...monthlyBase,
                    monthly: {
                        ...monthlyBase.monthly,
                        second_days:  WEEK_DAYS?.find((wkDy)=> parseInt(wkDy?.id) === parseInt( details?.selByWeek)) || '',
                        second_frequency: FREQUENCY?.find((frq)=> parseInt(frq.id,10) === parseInt(details?.selByDay)) || '' ,
                        second_hours: details?.reccursDayMonthlytimePicker,
                        second_months: details?.reccursDayMonthly,
                    },
                };
            }
            return monthlyBase;
        case 5: // Shortly
            return {
                ...baseList,
                shortly: {
                    every_time: details?.every_time,
                    period: details?.period,
                },
            };

        default:
            return baseList;
    }
};

 export  const TriggerInWeek = (weekDaysCheckedData = []) => {
  const dayMap = {
    IsSunday: "sun",
    IsMonday: "mon",
    IsTuesday: "tue",
    IsWednesday: "wed",
    IsThursday: "thu",
    IsFriday: "fri",
    IsSaturday: "sat"
  };

  return Object.entries(dayMap).reduce((acc, [key, short]) => {
    acc[short] = weekDaysCheckedData.find(d => d.daysId === key)?.checked || false;
    return acc;
  }, {});
};

