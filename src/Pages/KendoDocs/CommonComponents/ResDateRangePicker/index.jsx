import { getUserDetails } from 'Utils/modules/crypto';
import { getDateWithDaynoFormat, getUserCurrentFormat, convertToUserTimezone, convertUTCtoUserTimezone } from 'Utils/modules/dateTime';
import { calendar_medium, caret_mini } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import RSCustomRangePicker from './ResCustomRangePicker/ResCustomRangePicker';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import {
    diff_days,
    getDateBasedOnDay,
    getDateBasedOnDayAnaltics,
    getFormattedDate,
    formatStartDateForDisplay,
    getEffectiveStartDate,
    getCreatedDateParsed,
    isCustomRangeSelectionValid,
} from './constants';

import { getUtcTimeData } from 'Reducers/globalState/selector';
import { getUtcTimeNow } from 'Reducers/globalState/request';
import RSTooltip from 'Components/RSTooltip';
import { RES_DATE_RANGE_CLASS as DR_CLASS } from '../../kendoDocsVariables';
import './resDateRangePicker.scss';

/** Mirrors Constants/GlobalConstant/Regex LAST30DAYS_DATEFILTER — inlined to avoid prod bundle TDZ. */
const LAST_30_DAYS_DATE_OFFSET = -29;

const ResDateRangePicker = ({
    selectedDateText = '',
    isAnalytics = false,
    onDatePickerClosed = () => {},
    startDate,
    endDate,
    mainClass,
    selectedFullDate,
    consumptionStartDate,
    consumptionEndDate,
    isConsumption = false,
    isTemplate = false,
    allowFutureDates = false,
}) => {
    const dispatch = useDispatch();
    const utcTimeData = useSelector((state) => getUtcTimeData(state));
    
    // Use UTC time from API if available, otherwise fallback to system time
    const currentUTCdateTime = utcTimeData.utcTime ? new Date(utcTimeData.utcTime.replace('Z', '')) : new Date();
    
    // Get user timezone date from UTC
    const userTimezoneDate = utcTimeData.utcTime ? convertUTCtoUserTimezone(currentUTCdateTime) : new Date();
    
    const datePickerRef = useRef();
    const dropdownRef = useRef();
    const { createdDate } = getUserDetails();
    const openRef = useRef(false);
    const [positionRight, setPositionRight] = useState(false);
    const [isPositionCalculated, setIsPositionCalculated] = useState(false);
    
    // Call UTC time API when component mounts
    useEffect(() => {
        dispatch(getUtcTimeNow());
    }, [dispatch]);
    
    // Helper function to calculate position
    const calculatePosition = useCallback(() => {
        if (!dropdownRef.current || !datePickerRef.current) return false;
        
        const picker = datePickerRef.current;
        const pickerRect = picker.getBoundingClientRect();
        const calendarBoxWidth = 680; // Width of calendar-box from CSS
        const defaultRightOffset = 11; // Offset from right edge (right: -11px means 11px inward)
        const viewportPadding = 20; // Minimum padding from viewport edge
        const leftEdgeIfLeftPositioned = pickerRect.right - defaultRightOffset - calendarBoxWidth;
        
        // Check if calendar box would overflow on the left side of viewport
        return leftEdgeIfLeftPositioned < viewportPadding;
    }, []);

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
    
    // Helper function to get current date in user timezone
    const getCurrentDateInUserTimezone = () => {
        if (utcTimeData.utcTime) {
            return convertUTCtoUserTimezone(currentUTCdateTime);
        }
        return convertToUserTimezone(new Date(), { formatAsString: false });
    };
    const [lastSelectedType, setLastSelectedType] = useState('');
    const [isPicked, setIsPicked] = useState(true);
    const [disableItems, setDisableItems] = useState({
        today: true,
        _7Days: true,
        _30Days: true,
    });
    const [selectedDate, setSelectedDate] = useState({
        // start: isAnalytics
        //     ? selectedFullDate?.start
        //     : (startDate ?? getDateWithDaynoFormat(LAST30DAYS_DATEFILTER)) || new Date(createdDate),
        // end: isAnalytics ? selectedFullDate?.end : (endDate ?? new Date()) || getDateWithDaynoFormat(0),
        start: isAnalytics
            ? selectedFullDate?.start
            : (startDate ?? getUserCurrentFormat(null, { day: LAST_30_DAYS_DATE_OFFSET })?.dateToString) ||
              new Date(createdDate),
        end: isAnalytics
            ? selectedFullDate?.end
            : (endDate ?? getCurrentDateInUserTimezone()) || getUserCurrentFormat(null, { day: 0 })?.dateToString,
    });
    
    useEffect(() => {
        if (isConsumption) {
            setSelectedDate({
                start: consumptionStartDate || new Date(createdDate),
                end: consumptionEndDate || getCurrentDateInUserTimezone(),
            });
        }
    }, [consumptionStartDate, consumptionEndDate]);

    const [customDate, setCustomDate] = useState({
        start: isAnalytics ? startDate : new Date(createdDate),
        end: isAnalytics ? endDate : getCurrentDateInUserTimezone(),
        confirmStartEndDates: {
            start: isAnalytics ? startDate : new Date(createdDate),
            end: isAnalytics ? endDate : getCurrentDateInUserTimezone(),
        },
    });

    const [getData, setGetData] = useState({
        startDate: 'All Time',
        customDate: false,
        open: false,
        isSelectedType: selectedDateText || 'Last 30 days',
    });

    const handleClickOutside = async (e) => {
        if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
            if (openRef.current) {
                setGetData((prev) => ({
                    ...prev,
                    open: false,
                }));
                openRef.current = false;
            }
        }
    };

    const handleDateFormat = (dateFormat) => {
        // const customDateFormat = getUserDateTimeFormat(dateFormat, 'formatDate');
        const customDateFormat = getUserCurrentFormat(dateFormat)?.dateFormat;
        return customDateFormat;
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Calculate position for calendar-box dynamically - fallback for edge cases
    useEffect(() => {
        if (getData.open && getData.customDate && !isPositionCalculated) {
            // Only calculate if not already calculated (fallback case)
            // Use double requestAnimationFrame to ensure calculation happens before paint
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (!isPositionCalculated) {
                        const shouldPositionRight = calculatePosition();
                        setPositionRight(shouldPositionRight);
                        setIsPositionCalculated(true);
                    }
                });
            });
        } else if (!getData.open || !getData.customDate) {
            setPositionRight(false);
            setIsPositionCalculated(false);
        }
    }, [getData.open, getData.customDate, calculatePosition, isPositionCalculated]);
    
    // Recalculate position on window resize
    useEffect(() => {
        if (!getData.open || !getData.customDate) return;
        
        const handleResize = () => {
            const shouldPositionRight = calculatePosition();
            setPositionRight(shouldPositionRight);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [getData.open, getData.customDate, calculatePosition]);

    const closeDateView = (status, text = getData.isSelectedType) => {
        const tempState = { ...getData };
        tempState.isSelectedType = text;
        tempState.open = status;
        openRef.current = status;
        tempState.customDate = false;
        const selectedDate = isAnalytics
            ? { ...getDateBasedOnDayAnaltics(text, startDate, endDate, utcTimeData) }
            : { ...getDateBasedOnDay(text, createdDate, true, utcTimeData) };
        setIsPicked(false);
        setSelectedDate(selectedDate);
        setGetData(tempState);
        onDatePickerClosed({
            startDate: selectedDate.start,
            endDate: selectedDate.end,
            selectedType: text,
        });
    };
    const cancelBtnClicked = () => {
        setGetData((prev) => ({
            ...prev,
            isSelectedType: lastSelectedType,
            open: false,
            customDate: lastSelectedType === 'Custom range',
        }));
        const selectedDate = isAnalytics
            ? { ...getDateBasedOnDayAnaltics(lastSelectedType, startDate, endDate, utcTimeData) }
            : { ...getDateBasedOnDay(lastSelectedType, createdDate, true, utcTimeData) };
        setSelectedDate(selectedDate);
        openRef.current = false;
    };
    const customeStyle = (text) => (text === getData.isSelectedType ? 'active' : '');

    useEffect(() => {
        if (isAnalytics && isPicked) {
            setSelectedDate((pre) => ({
                start:
                    startDate === undefined ? getDateWithDaynoFormat(LAST_30_DAYS_DATE_OFFSET) : selectedFullDate?.start,
                end: endDate == undefined ? getDateWithDaynoFormat(0) : selectedFullDate?.end,
            }));
            setIsPicked(false);
        } else if (isTemplate) {
            setSelectedDate((pre) => ({
                start: startDate === undefined ? getDateWithDaynoFormat(LAST_30_DAYS_DATE_OFFSET) : startDate,
                end: endDate == undefined ? getDateWithDaynoFormat(0) : endDate,
            }));
        } else {
        }
    }, [endDate, startDate, selectedFullDate]);

    useEffect(() => {
        if (!isAnalytics) {
            const parsedCreatedDate = new Date(createdDate);
            const parsedEndDate = consumptionEndDate ? new Date(consumptionEndDate) : getCurrentDateInUserTimezone();

            if (isNaN(parsedCreatedDate) || isNaN(parsedEndDate)) {
                setCustomDate({
                    start: getCurrentDateInUserTimezone(),
                    end: getCurrentDateInUserTimezone(),
                    confirmStartEndDates: {
                        start: getCurrentDateInUserTimezone(),
                        end: getCurrentDateInUserTimezone(),
                    },
                });
                return;
            }

            const diffDaysCount = diff_days(getCurrentDateInUserTimezone(), parsedCreatedDate);

            const previousMonthDate = new Date(parsedEndDate);
            previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
            previousMonthDate.setDate(1);

            const confirmedStartDate = (getData.isSelectedType === 'Custom range' && startDate) ? startDate : parsedCreatedDate;
            const confirmedEndDate = (getData.isSelectedType === 'Custom range' && endDate) ? endDate : getCurrentDateInUserTimezone();

            setCustomDate({
                start: diffDaysCount > 30 ? previousMonthDate : parsedCreatedDate,
                end: parsedEndDate,
                confirmStartEndDates: {
                    start: confirmedStartDate,
                    end: confirmedEndDate,
                },
            });
        }
    }, [isAnalytics, createdDate, consumptionEndDate, startDate, endDate, consumptionStartDate,getData.isSelectedType]);
    // useEffect(() => {
    //     //debugger
    //     if (isAnalytics && startDate && endDate) {
    //         const today = getCurrentDateInUserTimezone();
    //         today.setHours(0, 0, 0, 0);
    //         const end = new Date(endDate);
    //         end.setHours(0, 0, 0, 0);
    //         const isTodayBeforeOrEqualEnd = today <= end;
    //         const finalEndDate = isTodayBeforeOrEqualEnd ? today : end;
    //         const diffDaysCount = diff_days(finalEndDate, startDate);
    //         setDisableItems({
    //             today: isTodayBeforeOrEqualEnd,
    //             _7Days: diffDaysCount < 7 ? false : true,
    //             _30Days: diffDaysCount < 30 ? false : true,
    //         });
    //     }
    // }, [startDate, endDate]);

    useEffect(() => {
        if (selectedDateText && !isAnalytics) {
            setGetData((pre) => ({
                ...pre,
                isSelectedType: selectedDateText,
            }));
        }
    }, [selectedDateText, startDate]);

    const getCustomRangeMaxDate = () => {
        const maxDate = isAnalytics ? (endDate ? new Date(endDate) : getCurrentDateInUserTimezone()) : getCurrentDateInUserTimezone();
        if (allowFutureDates && !isAnalytics) {
            const futureMax = new Date(maxDate);
            futureMax.setFullYear(futureMax.getFullYear() + 1);
            return futureMax;
        }
        return maxDate;
    };

    const handleCustomPickerEvent = (status) => {
        const effectiveStart = getEffectiveStartDate(status?.value?.start, createdDate, true);
        setSelectedDate({
            start: effectiveStart,
            end: status?.value?.end,
        });
        setCustomDate((pre) => ({
            ...pre,
            start: effectiveStart,
            end: status?.value?.end,
        }));
    };

    const customRangeMinDate = isAnalytics
        ? startDate
            ? new Date(startDate)
            : null
        : getCreatedDateParsed(createdDate, true);
    const customRangeMaxDate = getCustomRangeMaxDate();
    const customRangeStart = getEffectiveStartDate(customDate?.start ?? selectedDate.start, createdDate, true);
    const customRangeEnd = customDate?.end ?? selectedDate.end;
    const isApplyEnabled = getData.customDate
        ? isCustomRangeSelectionValid(customRangeStart, customRangeEnd, customRangeMinDate, customRangeMaxDate)
        : Boolean(selectedDate.start && selectedDate.end);

    return (
        <div className={`${DR_CLASS.root} date-range-view-container  ${mainClass}`} ref={datePickerRef}>
            <div
                className="date-title"
                onClick={() => {
                    setGetData((prev) => ({
                        ...prev,
                        open: !prev.open,
                    }));
                    openRef.current = !getData.open;
                }}
            >
                <span className={DR_CLASS.calendarIcon}>
                    <RSTooltip position="top" text={'Calendar'} className="lh0" innerContent={false}>
                        <i className={`${calendar_medium} icon-md color-primary-blue`} id="rs_data_calendar"></i>
                    </RSTooltip>
                </span>
                {/* <span className="res-dt-calendar-text">{`${
                    getData.isSelectedType !== 'Custom range'
                        ? handleDateFormat(getFormattedDate(selectedDate.start))
                        : handleDateFormat(
                              getFormattedDate(customDate?.confirmStartEndDates?.start || customDate?.start),
                          )
                } - ${
                    getData.isSelectedType === 'Custom range'
                        ? handleDateFormat(
                              getFormattedDate(customDate?.confirmStartEndDates?.end || customDate.end || new Date()),
                          )
                        : handleDateFormat(selectedDate?.end)
                        ? handleDateFormat(getFormattedDate(selectedDate.end))
                        : 'month day, year'
                }`}</span> */}
                <span className={DR_CLASS.calendarText}>{`${getData.isSelectedType !== 'Custom range'
                        ? formatStartDateForDisplay(selectedDate.start, createdDate, true)
                        : formatStartDateForDisplay(
                            customDate?.confirmStartEndDates?.start || customDate?.start,
                            createdDate,
                            true,
                        )
                    } - ${getData.isSelectedType === 'Custom range'
                        ? getUserCurrentFormat(
                              getFormattedDate(customDate?.confirmStartEndDates?.end || customDate.end || getCurrentDateInUserTimezone()),
                          ).dateFormat
                        : getUserCurrentFormat(selectedDate?.end).dateFormat
                        ? getUserCurrentFormat(getFormattedDate(selectedDate.end)).dateFormat
                        : 'month day, year'
                }`}</span>
                <span className={DR_CLASS.arrowIcon}>
                    {/* <i className={`${caret_mini} icon-xxs secondary-grey icon-xs`}></i> */}
                </span>
            </div>

            <motion.div
                ref={dropdownRef}
                className={`date-range-dropdown ${getData.open ? 'open' : ''} ${
                    getData.customDate ? 'calendar-box' : ''
                } ${getData.customDate && positionRight ? 'calendar-box-right' : ''}`}
                animate={{
                    width: getData.customDate ? 590 : 150,
                    height: getData.customDate ? 347 : 227,
                    // padding: getData.customDate ? 10 : 5,
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                style={{
                    transitionProperty: 'opacity, transform, clip-path, visibility',
                    transitionDuration: '0.2s',
                }}
            >
                <div className="date-range-box">
                    <ul className={DR_CLASS.listView} style={{ '--rs-dropdown-item-count': 5 }}>
                        <li
                            className={customeStyle('All time')}
                            style={{ '--rs-dropdown-item-index': 0 }}
                            onClick={() => closeDateView(false, 'All time')}
                        >
                            All time
                        </li>
                        <li
                            className={`${customeStyle('Today')} ${disableItems?.today ? '' : 'click-off'}`}
                            style={{ '--rs-dropdown-item-index': 1 }}
                            onClick={() => closeDateView(false, 'Today')}
                        >
                            Today
                        </li>
                        <li
                            className={`${customeStyle('Last 7 days')} ${disableItems?._7Days ? '' : 'click-off'}`}
                            style={{ '--rs-dropdown-item-index': 2 }}
                            onClick={() => closeDateView(false, 'Last 7 days')}
                        >
                            Last 7 days
                        </li>
                        <li
                            className={`${customeStyle('Last 30 days')} ${isAnalytics ? '1' : '2'} ${
                                disableItems?._30Days ? '' : 'click-off'
                            }`}
                            style={{ '--rs-dropdown-item-index': 3 }}
                            onClick={() => closeDateView(false, 'Last 30 days')}
                        >
                            Last 30 days
                        </li>
                        <li
                            className={customeStyle('Custom range')}
                            style={{ '--rs-dropdown-item-index': 4 }}
                            onClick={() => {
                                if (getData.isSelectedType === 'Custom range' && getData.customDate) {
                                    // Toggle off: revert to previous preset and collapse calendar
                                    const fallbackPreset = lastSelectedType && lastSelectedType !== 'Custom range' ? lastSelectedType : 'Last 30 days';
                                    setGetData((prev) => ({
                                        ...prev,
                                        isSelectedType: fallbackPreset,
                                        customDate: false,
                                    }));
                                    const revertedDate = isAnalytics
                                        ? { ...getDateBasedOnDayAnaltics(fallbackPreset, startDate, endDate, utcTimeData) }
                                        : { ...getDateBasedOnDay(fallbackPreset, createdDate, true, utcTimeData) };
                                    setSelectedDate(revertedDate);
                                } else {
                                    // Toggle on: open calendar
                                    setLastSelectedType(getData.isSelectedType);
                                    const shouldPositionRight = calculatePosition();
                                    setPositionRight(shouldPositionRight);
                                    setIsPositionCalculated(true);
                                    setCustomDate((pre) => ({
                                        ...pre,
                                        start: selectedDate.start,
                                        end: selectedDate.end,
                                    }));
                                    setGetData((prev) => ({
                                        ...prev,
                                        isSelectedType: 'Custom range',
                                        customDate: true,
                                    }));
                                }
                            }}
                        >
                            Custom range
                        </li>
                    </ul>
                    <RSCustomRangePicker
                        utcTimeData = {utcTimeData}
                        show={getData.customDate}
                        fromDate={isAnalytics ? startDate : selectedDate.start}
                        toDate={isAnalytics ? endDate : selectedDate.end}
                        handleEvent={handleCustomPickerEvent}
                        isAnalytics={isAnalytics}
                        customDate={customDate}
                        allowFutureDates={allowFutureDates}
                    />
                    <div className={DR_CLASS.buttons}>
                        <RSSecondaryButton onClick={cancelBtnClicked}>Cancel</RSSecondaryButton>
                        <RSPrimaryButton
                            disabledClass={isApplyEnabled ? '' : 'pe-none click-off'}
                            onClick={() => {
                                if (!isApplyEnabled) return;
                                const start = customRangeStart;
                                const end = customRangeEnd;

                                setGetData((prev) => ({
                                    ...prev,
                                    open: false,
                                    isSelectedType: 'Custom range',
                                }));
                                setLastSelectedType(getData.isSelectedType);
                                onDatePickerClosed({
                                    startDate: start,
                                    endDate: end,
                                    selectedType: getData.isSelectedType,
                                });
                                openRef.current = false;
                                setCustomDate((pre) => ({
                                    ...pre,
                                    confirmStartEndDates: {
                                        start: customDate?.start,
                                        end: customDate?.end,
                                    },
                                }));
                            }}
                        >
                            Apply
                        </RSPrimaryButton>
                    </div>
                </div>
            </motion.div>

            <div
                className={`modal-backdrop fade ${getData?.open && getData?.customDate ? 'show' : ''}`}
                onClick={() => {
                    setGetData((prev) => ({ ...prev, open: false }));
                    openRef.current = false;
                }}
            />
        </div>
    );
};
ResDateRangePicker.propTypes = {
    selectedDateText: PropTypes.string,
    onDatePickerClosed: PropTypes.func,
    isAnalytics: PropTypes.bool,
};

export default ResDateRangePicker;
