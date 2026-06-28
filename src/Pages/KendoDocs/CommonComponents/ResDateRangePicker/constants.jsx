import { convertToUserTimezone, convertUTCtoUserTimezone, getDateWithDaynoFormat, getUserCurrentFormat } from 'Utils/modules/dateTime';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DateInput, DateRangePicker } from '@progress/kendo-react-dateinputs';
import { getUtcTimeData } from 'Reducers/globalState/selector';
import { getUtcTimeNow } from 'Reducers/globalState/request';
import { RES_DATE_RANGE_CLASS as DR_CLASS } from '../../kendoDocsVariables';
/** Mirrors Constants/GlobalConstant/Regex LAST30DAYS_DATEFILTER — inlined to avoid prod bundle TDZ. */
const LAST_30_DAYS_DATE_OFFSET = -29;

// Utility function to get UTC time and convert to user timezone
export const getCurrentUTCInUserTimezone = (utcTimeData) => {
    if (utcTimeData?.utcTime) {
        const currentUTCdateTime = new Date(utcTimeData.utcTime.replace('Z', ''));
        return convertUTCtoUserTimezone(currentUTCdateTime);
    }
    return convertToUserTimezone(new Date(), { formatAsString: false });
};

export const CustomStartDateInput = (props) => {
    return (
        <label className={DR_CLASS.inputFrom}>
            <DateInput {...props} format="MMM dd, yyyy" label="Start date" />
        </label>
    );
};

export const CustomEndDateInput = (props) => {
    // console.log('props: ', props);
    return (
        <label className={DR_CLASS.inputTo}>
            <DateInput {...props} format="MMM dd, yyyy" label="End date" />
        </label>
    );
};

export const getFormattedDate = (value) => {
    let date = new Date(value).toDateString().slice(4, 15);
    let value1 = date.slice(0, 6);
    let value2 = date.slice(6, 11);
    let newValue = value1 + ',' + value2;
    return newValue;
};

export const getCreatedDateParsed = (createdDate, useTimezone = false) => {
    if (!createdDate) return null;
    return useTimezone
        ? convertToUserTimezone(new Date(createdDate), { formatAsString: false })
        : new Date(createdDate);
};

export const getEffectiveStartDate = (start, createdDate, useTimezone = false) => {
    if (!start) return start;
    const created = getCreatedDateParsed(createdDate, useTimezone);
    if (!created) return start;
    const startParsed = new Date(start);
    return startParsed < created ? created : start;
};

export const isCustomRangeSelectionValid = (start, end, minDate, maxDate) => {
    if (!start || !end) return false;
    const startTime = new Date(start);
    const endTime = new Date(end);
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime()) || startTime > endTime) return false;
    startTime.setHours(0, 0, 0, 0);
    endTime.setHours(0, 0, 0, 0);
    if (minDate) {
        const minTime = new Date(minDate);
        minTime.setHours(0, 0, 0, 0);
        if (startTime < minTime) return false;
    }
    if (maxDate) {
        const maxTime = new Date(maxDate);
        maxTime.setHours(0, 0, 0, 0);
        if (endTime > maxTime || startTime > maxTime) return false;
    }
    return true;
};

export const shouldShowStartDateTime = (start, createdDate, useTimezone = false) => {
    if (!start || !createdDate) return false;
    const created = getCreatedDateParsed(createdDate, useTimezone);
    if (!created) return false;
    const effective = getEffectiveStartDate(start, createdDate, useTimezone);
    return new Date(start) < created || new Date(effective).getTime() === new Date(created).getTime();
};

export const formatStartDateForDisplay = (start, createdDate, useTimezone = false) => {
    const effectiveStart = getEffectiveStartDate(start, createdDate, useTimezone);
    if (shouldShowStartDateTime(start, createdDate, useTimezone)) {
        return getUserCurrentFormat(effectiveStart, { isOffset: true }).dateFormat;
    }
    return getUserCurrentFormat(getFormattedDate(effectiveStart)).dateFormat;
};
// Function to create ranges with UTC time
export const createRangesWithUTC = (utcTimeData) => {
    const currentDate = getCurrentUTCInUserTimezone(utcTimeData);
    
    // Create start dates by subtracting days from current UTC time
    const allTimeStart = new Date(currentDate);
    allTimeStart.setDate(allTimeStart.getDate() - 150);
    
    const last7DaysStart = new Date(currentDate);
    last7DaysStart.setDate(last7DaysStart.getDate() - 7);
    
    const last30DaysStart = new Date(currentDate);
    last30DaysStart.setDate(last30DaysStart.getDate() + LAST_30_DAYS_DATE_OFFSET); // Adding -29 is same as subtracting 29
    
    return {
        allTime: [allTimeStart, currentDate],
        last7Days: [last7DaysStart, currentDate],
        last30Days: [last30DaysStart, currentDate],
    };
};

export const RANGES = {
    allTime: [getDateWithDaynoFormat(-150), getDateWithDaynoFormat(0)],
    last7Days: [getDateWithDaynoFormat(-7), getDateWithDaynoFormat(0)],
    last30Days: [getDateWithDaynoFormat(LAST_30_DAYS_DATE_OFFSET), getDateWithDaynoFormat(0)],
};

export const CustomRangePickerView = (props) => {
    const dispatch = useDispatch();
    const utcTimeData = useSelector((state) => getUtcTimeData(state));
    const [show, setShow] = useState(false);
    const dateRef = useRef();
    
    // Call UTC time API when component mounts
    useEffect(() => {
        dispatch(getUtcTimeNow());
    }, [dispatch]);
    
    const CustomPopup = (props) => {
        return (
            <Popup
                {...props}
                anchorAlign={{
                    horizontal: 'left',
                    vertical: 'bottom',
                }}
                popupAlign={{
                    horizontal: 'right',
                    vertical: 'bottom',
                }}
                className="rs-kendo-daterange-picker-wrapper"
                appendTo={dateRef.current?.element}
            />
        );
    };

    useEffect(() => {
        setShow(props.show);
    }, [props.show]);

    // Get current date in user timezone using UTC time
    const currentDateInUserTimezone = getCurrentUTCInUserTimezone(utcTimeData);

    return (
        <div className="rs-daterangepicker-content">
            <DateRangePicker
                popup={CustomPopup}
                max={currentDateInUserTimezone}
                // min={props?.fromDate === undefined ? new Date(createdDate) : props?.fromDate}
                // max={props?.toDate === undefined ? new Date() : props?.toDate}
                show={show}
                startDateInput={CustomStartDateInput}
                endDateInput={CustomEndDateInput}
                defaultValue={{
                    start: new Date(props.fromDate),
                    end: new Date(props.toDate),
                }}
                onChange={props.handleEvent}
                ref={dateRef}
            />
        </div>
    );
};

export const getDateBasedOnDay = (day, createdDate, useTimezone = false, utcTimeData = null) => {
    // Helper function to get timezone-adjusted current date
    const getCurrentDate = () => {
        if (useTimezone) {
            if (utcTimeData?.utcTime) {
                const currentUTCdateTime = new Date(utcTimeData.utcTime.replace('Z', ''));
                return convertUTCtoUserTimezone(currentUTCdateTime);
            }
            return convertToUserTimezone(new Date(), { formatAsString: false });
        }
        return new Date();
    };

    const clampStart = (computedStart) => getEffectiveStartDate(computedStart, createdDate, useTimezone);

    let startDate = getCurrentDate();
    let endDate = getCurrentDate();

    switch (day) {
        case 'Last 7 days':
            startDate.setDate(startDate.getDate() - 6);
            return {
                start: clampStart(startDate),
                end: endDate,
            };
        case 'Last 30 days':
            startDate.setDate(startDate.getDate() - 29);
            return {
                start: clampStart(startDate),
                end: endDate,
            };
        case 'Today':
            startDate.setDate(startDate.getDate() - 0);
            return {
                start: clampStart(startDate),
                end: endDate,
            };

        default:
            // For "All time", use the provided createdDate or calculate 180 days back
            if (createdDate) {
                return {
                    start: clampStart(
                        useTimezone
                            ? convertToUserTimezone(new Date(createdDate), { formatAsString: false })
                            : new Date(createdDate),
                    ),
                    end: endDate,
                };
            }
            startDate.setDate(startDate.getDate() - 180);
            return {
                start: clampStart(startDate),
                end: endDate,
            };
    }
};

export const getDateBasedOnDayAnaltics = (day, start, end, utcTimeData = null) => {
    // Use UTC time if available, otherwise fallback to system time
    let currentDate;
    if (utcTimeData?.utcTime) {
        const currentUTCdateTime = new Date(utcTimeData.utcTime.replace('Z', ''));
        currentDate = convertUTCtoUserTimezone(currentUTCdateTime);
    } else {
        currentDate = new Date();
    }
    
    const currDate = currentDate <= new Date(end) ? currentDate : new Date(end);
    const startDate = new Date(start);
    const endDate = currentDate <= new Date(end) ? currentDate : new Date(end);
    const diffCount = diff_days(endDate, startDate);
    switch (day) {
        case 'Last 7 days':
            // Create a copy to avoid modifying the original currDate
            const last7DaysStart = new Date(currDate);
            last7DaysStart.setDate(last7DaysStart.getDate() - 6);
            return {
                start: diffCount > 7 ? last7DaysStart : start,
                end: endDate,
            };
        case 'Last 30 days':
            // Create a copy to avoid modifying the original currDate
            const last30DaysStart = new Date(currDate);
            last30DaysStart.setDate(last30DaysStart.getDate() - 29);
            return {
                start: diffCount > 30 ? last30DaysStart : start,
                end: endDate,
            };
        case 'Today':
            return {
                start: currDate,
                end: endDate,
            };
        case 'All time':
            return {
                start: new Date(start),
                end: new Date(end),
            };
        default:
            return {
                start: new Date(start),
                end: new Date(end),
            };
    }
};

export const diff_days = (end, start) => {
    const d1 = new Date(start);
    const d2 = new Date(end);
    let diff = (d2.getTime() - d1.getTime()) / 1000;
    diff /= 60 * 60 * 24;
    return Math.abs(Math.round(diff));
};
