import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { DateRangePicker } from '@progress/kendo-react-dateinputs';
import { Popup } from '@progress/kendo-react-popup';

import { CustomEndDateInput, CustomStartDateInput } from '../constants';
import { RES_DATE_RANGE_CLASS as DR_CLASS } from '../../../kendoDocsVariables';
import { getUserDetails } from 'Utils/modules/crypto';
import { convertToUserTimezone, convertUTCtoUserTimezone } from 'Utils/modules/dateTime';
import { getmasterData } from 'Utils/modules/masterData';
import { getUtcTimeData } from 'Reducers/globalState/selector';
import { getUtcTimeNow } from 'Reducers/globalState/request';
import _find from 'lodash/find';
const ResCustomRangePicker = (props) => {
    // console.log('props: ', props);
    const dispatch = useDispatch();
    // const utcTimeData = useSelector((state) => getUtcTimeData(state));
    let getUtc_TimeData = props?.utcTimeData != null ? true : false
    let utcTimeData ;
    if(getUtc_TimeData){
        utcTimeData = props?.utcTimeData
    }else{
        const utc_TimeData = useSelector((state) => getUtcTimeData(state));
        utcTimeData = utc_TimeData
    }

    // Use UTC time from API if available, otherwise fallback to system time
    const currentUTCdateTime = utcTimeData.utcTime ? new Date(utcTimeData.utcTime.replace('Z', '')) : new Date();

    // Get user timezone date from UTC
    const userTimezoneDate = utcTimeData.utcTime ? convertUTCtoUserTimezone(currentUTCdateTime) : new Date();

    const { createdDate, timeZoneId } = getUserDetails();
    const { timeZoneList } = getmasterData();
    const timeZone = _find(timeZoneList, ['timeZoneID', timeZoneId]);
    const [show, setShow] = useState(false);
    const {customDate, allowFutureDates = false} = props
    const dateRef = useRef();

    // Call UTC time API when component mounts
    useEffect(() => {
        if (getUtc_TimeData) return;
        dispatch(getUtcTimeNow());
    }, [dispatch]);

    // Override Date constructor to use timezone-adjusted date
    useEffect(() => {
        if (userTimezoneDate) {
            // Store original Date constructor
            const OriginalDate = window.Date;

            // Override Date constructor
            window.Date = function(...args) {
                if (args.length === 0) {
                    // When called without arguments (new Date()), return our timezone-adjusted date
                    return new OriginalDate(userTimezoneDate);
                }
                return new OriginalDate(...args);
            };

            // Copy static methods
            Object.setPrototypeOf(window.Date, OriginalDate);
            Object.defineProperty(window.Date, 'prototype', {
                value: OriginalDate.prototype,
                writable: false
            });

            // Store the original Date for restoration
            window._originalDate = OriginalDate;

            return () => {
                // Restore original Date constructor when component unmounts
                if (window._originalDate) {
                    window.Date = window._originalDate;
                    delete window._originalDate;
                }
            };
        }
    }, [userTimezoneDate]);

    // Convert UTC createdDate to user's timezone
    const getCreatedDateInUserTimezone = () => {
        if (createdDate) {
            return convertToUserTimezone(createdDate, {
                customTimezone: timeZone?.gmtOffset
            });
        }
        // Fallback to original createdDate if conversion fails
        return new Date(createdDate);
    };

    // Get timezone-based current date
    const getCurrentDateInUserTimezone = () => {
        // Use UTC time from API if available, otherwise fallback to system time
        let currentDate;
        if (utcTimeData.utcTime) {
            currentDate = convertUTCtoUserTimezone(currentUTCdateTime);
        } else {
            currentDate = convertToUserTimezone(new Date(), {
                customTimezone: timeZone?.gmtOffset
            });
        }

        // Add 1 year to the current date only if allowFutureDates is true
        if (allowFutureDates) {
            currentDate.setFullYear(currentDate.getFullYear() + 1);
        }
        return currentDate;
    };
    const CustomPopup = (props) => {
        return (
            <Popup
                {...props}
                animate={false}
                anchorAlign={{
                    horizontal: 'left',
                    vertical: 'bottom',
                }}
                popupAlign={{
                    horizontal: 'right',
                    vertical: 'bottom',
                }}
                className={DR_CLASS.kendoWrapper}
                appendTo={dateRef.current?.element}
            />
        );
    };

    useEffect(() => {
        setShow(props.show);
        if (customDate?.start && customDate.end && props.show) {
            props.handleEvent(
            { value : {
                        start: customDate?.start,
                end:  customDate?.end,
            }});
        }
    }, [props.show]);

    const minDate = props?.isAnalytics ? props.fromDate : getCreatedDateInUserTimezone();
    const maxDate = props?.isAnalytics ? props.toDate : getCurrentDateInUserTimezone();
    const dateInputBounds = { min: minDate, max: maxDate };

    const getFocusedDate = () => {
        if (customDate?.end) return new Date(customDate.end);
        if (customDate?.start) return new Date(customDate.start);
        return maxDate;
    };

    return (
        <div className={DR_CLASS.content}>
            <DateRangePicker
                popup={CustomPopup}
                max={maxDate}
                min={minDate}
                focusedDate={getFocusedDate()}
                startDateInputSettings={dateInputBounds}
                endDateInputSettings={dateInputBounds}
                show={show}
                startDateInput={CustomStartDateInput}
                endDateInput={CustomEndDateInput}
                defaultValue={{
                    start: props.fromDate,
                    end: props.toDate,
                }}
                onChange={props.handleEvent}
                ref={dateRef}
                value={{
                    start: customDate?.start,
                    end: customDate?.end,
                }}
            />
        </div>
    );
};

export default ResCustomRangePicker;
