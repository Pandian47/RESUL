import { getDateFormat } from 'Utils/modules/dateTime';
import { memo, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import { Controller } from 'react-hook-form';
import { DatePicker } from '@progress/kendo-react-dateinputs';

import CustomIcon from './constant';
import './resDatePicker.scss';
import {
    RES_KENDO_DATEPICKER_WRAPPER_CLASS,
    RES_KENDO_LABEL_CLASS,
    applyKendoPortaledPopupShellStyles,
    resolveKendoPopupAppendTo,
    shouldDisableKendoPopupAnimate,
} from '../../kendoDocsVariables';

import { getUserDetails } from 'Utils/modules/crypto';
import { getmasterData } from 'Utils/modules/masterData';


const ResDatePicker = ({
    control,
    rules,
    defaultValue = null,
    name,
    format = 'MMM dd, yyyy',
    required,
    label,
    handleOnFocus = () => {},
    handleChange = () => {},
    handleOnBlur = () => {},
    disabled,
    placeholder,
    isTargetList = false,
    isShowPlaceholder = false,
    customTodayDate,
    ...rest
}) => {
    const datePickerWrapper = useRef();
    const [showDatepicker, setDatepicker] = useState(false);
    const [popupAppendHost, setPopupAppendHost] = useState(null);

    useEffect(() => {
        if (!datePickerWrapper.current) return;
        setPopupAppendHost(
            resolveKendoPopupAppendTo(
                datePickerWrapper.current,
                `.${RES_KENDO_DATEPICKER_WRAPPER_CLASS}`,
            ),
        );
    }, []);
    const { dateFormatList } = getmasterData();
    const { dateFormatId } = getUserDetails();
    const { dateFormatId: configuredFormatId } = getDateFormat();
    let dateFormat =
        dateFormatList.find((item) => item?.dateFormatID === (configuredFormatId || dateFormatId))
            ?.dateformat ?? 'MM-DD-YYYY';

    function normalizeDateFormat(dateFormat) {
        const lower = dateFormat.toLowerCase();
        if (lower.includes('mmm')) {
            return lower.replace(/mmm/g, 'MMM');
        }
        return lower.replace(/mm/g, 'MM');
    }

    // dateFormat = isTargetList ? format : dateFormat.toLowerCase().replace('mm', 'MM');
    dateFormat = isTargetList ? format :  normalizeDateFormat(dateFormat);
    //_map(dateFormat.split('-'), (format) => (format !== 'MM' ? format.toLowerCase() : format)).join('-');

    const handleMouseDownEvent = (e) => {
        const wrapper = datePickerWrapper.current;
        const popup = e.target?.closest?.('.k-animation-container');
        const isClickInside = wrapper?.contains(e.target) || popup?.contains(e.target);

        if (!isClickInside) {
            setDatepicker(false);
        }
    };

    const handleInputClickEvent = () => {
        setDatepicker(!showDatepicker);
    };

    // Manage Date constructor override when picker is open
    useEffect(() => {
        if (customTodayDate && showDatepicker) {
            // Store original Date constructor
            const OriginalDate = window.Date;
            
            // Override Date constructor
            window.Date = function(...args) {
                if (args.length === 0) {
                    // When called without arguments (new Date()), return our custom today date
                    return new OriginalDate(customTodayDate);
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
                // Restore original Date constructor when picker closes
                if (window._originalDate) {
                    window.Date = window._originalDate;
                    delete window._originalDate;
                }
            };
        }
    }, [showDatepicker, customTodayDate]);

    useEffect(() => {
        if (!showDatepicker) return;

        const syncCalendarPopup = () => {
            const wrapper = datePickerWrapper.current;
            if (!wrapper) return false;

            const ownsEl = wrapper.querySelector('[aria-owns]');
            const ownsId = ownsEl?.getAttribute('aria-owns');
            const ownedNode = ownsId ? document.getElementById(ownsId) : null;
            const animationContainer =
                ownedNode?.closest('.k-animation-container') ||
                wrapper.querySelector('.k-animation-container');

            if (!animationContainer) return false;

            applyKendoPortaledPopupShellStyles(animationContainer, wrapper);
            return true;
        };

        if (!syncCalendarPopup()) {
            requestAnimationFrame(() => {
                if (!syncCalendarPopup()) {
                    requestAnimationFrame(syncCalendarPopup);
                }
            });
        }
    }, [showDatepicker]);

    useEffect(() => {
        document.addEventListener('mousedown', handleMouseDownEvent);
        document.getElementsByClassName(name)[0]?.childNodes?.forEach((list) => {
            list.addEventListener('click', handleInputClickEvent);
        });

        return () => {
            document.removeEventListener('mousedown', handleMouseDownEvent);
            document.getElementsByClassName(name)[0]?.childNodes?.forEach((list) => {
                list.removeEventListener('click', handleInputClickEvent);
            });
        };
    }, []);
    useEffect(() => {
        const wrapper = datePickerWrapper.current;
        if (!wrapper) return;

        wrapper.querySelectorAll('[aria-label="Toggle calendar"]').forEach((item) => (item.title = 'Calendar'));

        // Block only the mouse wheel from spinning the focused date segment.
        // Typing/arrow keys must stay enabled so the user can edit the date manually.
        const handleWheel = (e) => {
            e.stopImmediatePropagation();
            e.preventDefault();
        };
        const datePickerInput = wrapper.querySelectorAll('.k-datepicker input');
        datePickerInput.forEach((input) => input.addEventListener('wheel', handleWheel));

        return () => {
            datePickerInput.forEach((input) => input.removeEventListener('wheel', handleWheel));
        };
    });

    return (
        <Controller
            control={control}
            rules={rules}
            name={name}
            defaultValue={defaultValue instanceof Date || !defaultValue ? defaultValue : new Date(defaultValue)}
            render={({ field: { onChange, onBlur, value, ...field }, fieldState: { error } }) => {
                const _isEmpty = (error?.message ?? '')?.length > 0;
                const dateValue =
                    value instanceof Date || value == null ? value : value ? new Date(value) : null;
                return (
                    <div
                        className={`${RES_KENDO_DATEPICKER_WRAPPER_CLASS} ${_isEmpty ? 'errorContainer' : ''}`}
                        ref={datePickerWrapper}
                    >
                        {isShowPlaceholder && placeholder && field?.value && (
                            <label className={`${RES_KENDO_LABEL_CLASS} datepicker_placeholder`}>{placeholder}</label>
                        )}
                        {_isEmpty && (
                            <div className="validation-message" onClick={() => setDatepicker(true)}>
                                {error?.message ?? ''}
                            </div>
                        )}

                        <DatePicker
                            show={showDatepicker}
                            name={name}
                            toggleButton={CustomIcon}
                            //className={name}
                            className={`${name}  ${required ? 'required' : ''}`}
                            placeholder={placeholder || 'date-month-year'}
                            label={label}
                            format={dateFormat}
                            disabled={disabled}
                            popupSettings={{
                                popupClass: 'res-datepicker-popup',
                                animate: !shouldDisableKendoPopupAnimate(
                                    popupAppendHost,
                                    datePickerWrapper.current,
                                ),
                                anchorAlign: { horizontal: 'left', vertical: 'bottom' },
                                popupAlign: { horizontal: 'left', vertical: 'top' },
                                ...(popupAppendHost && { appendTo: popupAppendHost }),
                            }}
                            today={customTodayDate}
                            // formatPlaceholder={}
                            onChange={(e) => {
                                setDatepicker(false);
                                handleChange(e);
                                onChange(e.value);
                            }}
                            value={dateValue}
                            onFocus={(e) => {
                                handleOnFocus(e);
                            }}
                            onBlur={(e) => {
                                handleOnBlur(e);
                                onBlur(e);
                            }}
                            {...field}
                            {...rest}
                        />
                    </div>
                );
            }}
        />
    );
};

ResDatePicker.propTypes = {
    control: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    format: PropTypes.string,
    rules: PropTypes.object,
    defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    label: PropTypes.string,
    required: PropTypes.bool,
    handleOnFocus: PropTypes.func,
    handleOnBlur: PropTypes.func,
};

export default memo(ResDatePicker);
