import { getUserDetails } from 'Utils/modules/crypto';
import { getmasterData } from 'Utils/modules/masterData';
import { CLEAR, SELECT_SCHEDULE } from 'Constants/GlobalConstant/Placeholders';
import { clear_medium } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import _get from 'lodash/get';
import _find from 'lodash/find';
import { Controller } from 'react-hook-form';
import { DateTimePicker } from '@progress/kendo-react-dateinputs';

import RSTooltip from 'Components/RSTooltip';

import { safeToDate } from 'Utils/DateTimeUtils';

import CustomIcon from './constant';
import { RES_TIME_FORMAT } from '../ResTimePicker';
import { getDateTimePickerFormat, normalizeDateFormat } from './utils';
import {
    KENDO_INSIDE_POPUP_SELECTOR,
    RES_KENDO_DATETIMEPICKER_FOOTER_CLASS,
    RES_KENDO_DATETIMEPICKER_POPUP_CLASS,
    RES_KENDO_DATETIMEPICKER_WRAPPER_CLASS,
    applyKendoPortaledPopupShellStyles,
    isKendoModalPopupHost,
    resolveKendoPopupAppendTo,
    shouldDisableKendoPopupAnimate,
} from '../../kendoDocsVariables';

import './resDateTimePicker.scss';

const POPUP_ESTIMATED_HEIGHT = 360;
const POPUP_GAP = 6;
const POPUP_MIN_SPACE_BELOW = 120;

const ResDateTimePicker = ({
    control,
    rules,
    defaultValue,
    name,
    setValue,
    clearErrors,
    handleChange = () => {},
    handleRemoveVal = () => {},
    customTodayDate,
    disableAutoScroll = false,
    removeDefaultValue = false,
    popupClass = '',
    placeholder: placeholderProp,
    format: formatProp,
    timeFormat = RES_TIME_FORMAT.TWENTY_FOUR_HOURS,
    onPickerOpen,
    ...rest
}) => {
    const datePickerWrapper = useRef(null);
    const footerClassAppliedRef = useRef(false);
    const [showDatepicker, setDatepicker] = useState(false);
    const [datePickerValue, setDatePickerValue] = useState(null);
    const [hasValue, setHasValue] = useState(false);
    const [popupAppendHost, setPopupAppendHost] = useState(null);

    useEffect(() => {
        if (!datePickerWrapper.current) return;
        setPopupAppendHost(
            resolveKendoPopupAppendTo(
                datePickerWrapper.current,
                `.${RES_KENDO_DATETIMEPICKER_WRAPPER_CLASS}`,
            ),
        );
    }, []);

    const { dateFormatList } = getmasterData();
    const { dateFormatId } = getUserDetails();
    const is12Hour = timeFormat === RES_TIME_FORMAT.TWELVE_HOURS;
    const rawDateFormat = _get(_find(dateFormatList, ['dateFormatID', dateFormatId]), 'dateformat', 'MM-DD-YYYY');
    const dateFormat = normalizeDateFormat(rawDateFormat);
    const resolvedFormat = formatProp || getDateTimePickerFormat({ is12Hour, dateFormat });

    const datetimePopupScopeClass = `rs-datetime-popup-${name}`;

    const handleInputClickEvent = useCallback(() => {
        setDatepicker((open) => {
            if (!open) {
                onPickerOpen?.();
            }
            return !open;
        });
    }, [onPickerOpen]);

    useEffect(() => {
        const toggleButtons = document.querySelectorAll('[aria-label="Toggle date-time selector"]');
        toggleButtons.forEach((item) => {
            item.title = 'Calendar';
        });
    }, [showDatepicker]);

    useEffect(() => {
        if (datePickerValue) {
            const inputElement = datePickerWrapper.current?.querySelector('.k-input-inner');
            inputElement?.blur();
        }
    }, [datePickerValue]);

    useEffect(() => {
        if (!customTodayDate || !showDatepicker) return undefined;

        const OriginalDate = window.Date;
        window.Date = function DateOverride(...args) {
            if (args.length === 0) return new OriginalDate(customTodayDate);
            return new OriginalDate(...args);
        };
        Object.setPrototypeOf(window.Date, OriginalDate);
        Object.defineProperty(window.Date, 'prototype', {
            value: OriginalDate.prototype,
            writable: false,
        });
        window._originalDate = OriginalDate;

        return () => {
            if (window._originalDate) {
                window.Date = window._originalDate;
                delete window._originalDate;
            }
        };
    }, [showDatepicker, customTodayDate]);

    useEffect(() => {
        const root = datePickerWrapper.current;
        if (!root) return undefined;

        const nodes = root.querySelectorAll('.k-datetimepicker, .k-picker');
        nodes.forEach((node) => node.addEventListener('click', handleInputClickEvent));

        return () => {
            nodes.forEach((node) => node.removeEventListener('click', handleInputClickEvent));
        };
    }, [name, handleInputClickEvent]);

    useEffect(() => {
        if (!removeDefaultValue) return undefined;

        const checkAndClearPlaceholder = () => {
            const inputElement = datePickerWrapper.current?.querySelector('.k-input-inner');
            if (!inputElement) return;

            const currentValue = inputElement.value || inputElement.getAttribute('value') || '';
            const resolvedPlaceholder =
                placeholderProp || SELECT_SCHEDULE || 'month-day-year hour:minute';

            if (currentValue === 'month day, year hour:minute' && !datePickerValue) {
                inputElement.setAttribute('value', '');
                inputElement.value = '';
                inputElement.setAttribute('placeholder', resolvedPlaceholder);
            }

            if ((!currentValue || currentValue === '') && !datePickerValue) {
                inputElement.setAttribute('placeholder', resolvedPlaceholder);
            }
        };

        checkAndClearPlaceholder();
        const interval = setInterval(checkAndClearPlaceholder, 200);
        const timer = setTimeout(checkAndClearPlaceholder, 100);
        const observer = new MutationObserver(checkAndClearPlaceholder);
        if (datePickerWrapper.current) {
            observer.observe(datePickerWrapper.current, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['value'],
            });
        }

        return () => {
            clearInterval(interval);
            clearTimeout(timer);
            observer.disconnect();
        };
    }, [datePickerValue, removeDefaultValue, placeholderProp]);

    const decorateCalendarIcons = useCallback(() => {
        const root = datePickerWrapper.current;
        if (!root) return;
        root.querySelectorAll('.k-svg-icon').forEach((iconEl) => {
            if (!iconEl.classList.contains('icon-rs-calendar-medium')) {
                iconEl.classList.add('icon-rs-calendar-medium', 'icon-md', 'color-primary-blue');
            }
            iconEl.style.display = 'inline-flex';
            iconEl.style.visibility = 'visible';
        });
    }, []);

    useEffect(() => {
        const tempDate = safeToDate(defaultValue, { resetTime: false, fallback: null });
        const nextValue =
            defaultValue instanceof Date || !defaultValue ? defaultValue : tempDate;
        setDatePickerValue(nextValue);
        setHasValue(nextValue != null && nextValue !== '');
    }, [defaultValue]);

    useEffect(() => {
        decorateCalendarIcons();
        const observer = new MutationObserver(decorateCalendarIcons);
        if (datePickerWrapper.current) {
            observer.observe(datePickerWrapper.current, { childList: true, subtree: true });
        }
        return () => observer.disconnect();
    }, [showDatepicker, decorateCalendarIcons]);

    const getInputRect = useCallback(() => {
        const wrapper = datePickerWrapper.current;
        if (!wrapper) return null;

        const wrapperRect = wrapper.getBoundingClientRect();
        const input =
            wrapper.querySelector('.k-datetimepicker') ||
            wrapper.querySelector('.k-input') ||
            wrapper.querySelector('.k-input-inner');
        const inputRect = input?.getBoundingClientRect();

        if (!inputRect) return wrapperRect;

        return {
            ...wrapperRect,
            top: inputRect.top,
            bottom: inputRect.bottom,
            left: wrapperRect.left,
            width: wrapperRect.width,
            right: wrapperRect.left + wrapperRect.width,
            height: inputRect.height,
        };
    }, []);

    const getPopupElement = useCallback(() => {
        const scoped = document.querySelector(`.k-animation-container.${datetimePopupScopeClass}`);
        if (scoped) return scoped;

        if (popupClass) {
            const byClass = document.querySelector(`.k-animation-container.${popupClass}`);
            if (byClass?.querySelector('.k-datetime-container')) return byClass;
        }

        return Array.from(document.querySelectorAll('.k-animation-container')).find(
            (el) =>
                el.classList.contains('k-animation-container-shown') &&
                el.querySelector('.k-datetime-container'),
        );
    }, [datetimePopupScopeClass, popupClass]);

    const resolvePopupPlacement = useCallback(() => {
        const inputRect = getInputRect();
        if (!inputRect) {
            return { placement: 'bottom', inputRect: null, popupHeight: POPUP_ESTIMATED_HEIGHT };
        }

        const popup = getPopupElement();
        const popupHeight = Math.min(
            popup?.offsetHeight || POPUP_ESTIMATED_HEIGHT,
            POPUP_ESTIMATED_HEIGHT,
        );
        const spaceBelow = window.innerHeight - inputRect.bottom - POPUP_GAP;
        const spaceAbove = inputRect.top - POPUP_GAP;
        const placement =
            spaceBelow >= POPUP_MIN_SPACE_BELOW || spaceBelow >= spaceAbove ? 'bottom' : 'top';

        return { placement, inputRect, popupHeight };
    }, [getInputRect, getPopupElement]);

    const getPopupPosition = useCallback(() => {
        const { placement, inputRect, popupHeight } = resolvePopupPlacement();
        if (!inputRect) return {};

        const top =
            placement === 'bottom'
                ? inputRect.bottom + POPUP_GAP
                : inputRect.top - popupHeight - POPUP_GAP;

        return {
            top,
            left: inputRect.left,
            position: 'fixed',
            placement,
        };
    }, [resolvePopupPlacement]);

    const applyPopupClasses = useCallback(() => {
        const popup = getPopupElement();
        if (!popup) return;

        popup.classList.add(
            datetimePopupScopeClass,
            RES_KENDO_DATETIMEPICKER_POPUP_CLASS,
            'kendo-popup-bottom',
            'showing-below',
        );
        if (popupClass) popup.classList.add(popupClass);

        const inner =
            popup.querySelector('.k-datetime-container') ||
            popup.querySelector('.k-popup.k-datetime-container');
        if (inner) {
            inner.classList.add(RES_KENDO_DATETIMEPICKER_POPUP_CLASS, datetimePopupScopeClass);
            if (popupClass) inner.classList.add(popupClass);
        }

        const popupEl = popup.querySelector('.k-popup');
        if (popupEl) {
            popupEl.classList.add(RES_KENDO_DATETIMEPICKER_POPUP_CLASS, datetimePopupScopeClass);
            if (popupClass) popupEl.classList.add(popupClass);
        }

        popup.querySelectorAll('.k-datetime-footer, .k-actions.k-actions-stretched').forEach((footer) => {
            if (!footer.querySelector('.k-time-accept, .k-time-cancel')) return;
            footer.classList.add(RES_KENDO_DATETIMEPICKER_FOOTER_CLASS);
            footerClassAppliedRef.current = true;
        });
    }, [getPopupElement, datetimePopupScopeClass, popupClass]);

    const enforcePopupChrome = useCallback(() => {
        const popup = getPopupElement();
        if (!popup) return;

        const appendHost = popup.parentElement;
        const isModalHost = isKendoModalPopupHost(appendHost);

        popup.style.setProperty('overflow', 'visible');

        if (!isModalHost) {
            popup.style.setProperty('width', '291px');
            popup.style.setProperty('max-width', '291px');
        }

        const container =
            popup.querySelector('.k-datetime-container') ||
            popup.querySelector('.k-popup.k-datetime-container');
        if (container) {
            container.style.setProperty('display', 'flex');
            container.style.setProperty('flex-direction', 'column');
            container.style.setProperty('overflow', 'hidden');
            if (isModalHost) {
                container.style.setProperty('width', '100%');
                container.style.setProperty('min-width', '0');
                container.style.setProperty('max-width', '100%');
            } else {
                container.style.setProperty('width', '291px');
                container.style.setProperty('min-width', '291px');
                container.style.setProperty('max-width', '291px');
            }
            container.style.setProperty('background-color', '#ffffff');

            const wrap = container.querySelector('.k-datetime-wrap');
            if (wrap) {
                wrap.style.setProperty('flex', '1 1 auto');
                wrap.style.setProperty('overflow', 'hidden');
                wrap.style.setProperty('min-height', '0');
            }

            const calendarWrap = container.querySelector('.k-datetime-calendar-wrap');
            calendarWrap?.style.setProperty('overflow', 'hidden');
        }

    }, [getPopupElement]);

    const enforcePopupPosition = useCallback(() => {
        const popup = getPopupElement();
        if (!popup) return;

        const appendHost = popup.parentElement;
        if (isKendoModalPopupHost(appendHost)) {
            applyKendoPortaledPopupShellStyles(popup, datePickerWrapper.current);
            const { placement } = resolvePopupPlacement();
            popup.classList.toggle('kendo-popup-bottom', placement === 'bottom');
            popup.classList.toggle('kendo-popup-top', placement === 'top');
            popup.classList.toggle('showing-below', placement === 'bottom');
            popup.classList.toggle('showing-top', placement === 'top');
            return;
        }

        const { top, left, placement } = getPopupPosition();
        if (top == null) return;

        popup.style.setProperty('top', `${top}px`);
        popup.style.setProperty('left', `${left}px`);
        popup.style.setProperty('position', 'fixed');
        popup.style.setProperty('bottom', 'auto');
        popup.style.setProperty('transform', 'none');
        popup.style.setProperty('margin-top', '0');
        popup.classList.toggle('kendo-popup-bottom', placement === 'bottom');
        popup.classList.toggle('kendo-popup-top', placement === 'top');
        popup.classList.toggle('showing-below', placement === 'bottom');
        popup.classList.toggle('showing-top', placement === 'top');
    }, [getPopupElement, getPopupPosition, resolvePopupPlacement]);

    const syncPopupChrome = useCallback(() => {
        applyPopupClasses();
        enforcePopupChrome();
        enforcePopupPosition();
    }, [applyPopupClasses, enforcePopupPosition, enforcePopupChrome]);

    useLayoutEffect(() => {
        if (!showDatepicker) return;
        syncPopupChrome();
    }, [showDatepicker, syncPopupChrome]);

    useEffect(() => {
        if (!showDatepicker) {
            footerClassAppliedRef.current = false;
            return undefined;
        }

        syncPopupChrome();

        const timer = setTimeout(() => {
            syncPopupChrome();

            if (!disableAutoScroll) {
                const { placement, inputRect, popupHeight } = resolvePopupPlacement();
                if (!inputRect) return;

                if (placement === 'bottom') {
                    const overflow = inputRect.bottom + popupHeight + POPUP_GAP - window.innerHeight;
                    if (overflow > 0) {
                        window.scrollTo({
                            top: window.scrollY + overflow + 10,
                            behavior: 'smooth',
                        });
                    }
                    return;
                }

                const popupTopViewport = inputRect.top - popupHeight - POPUP_GAP;
                if (popupTopViewport < 0) {
                    window.scrollTo({
                        top: Math.max(0, window.scrollY + popupTopViewport - 10),
                        behavior: 'smooth',
                    });
                }
            }
        }, 50);

        const popupObserver = new MutationObserver(() => {
            if (getPopupElement()) {
                syncPopupChrome();
            }
        });
        popupObserver.observe(document.body, { childList: true, subtree: true });

        const handleScroll = (event) => {
            if (event.target?.closest?.(KENDO_INSIDE_POPUP_SELECTOR)) return;
            enforcePopupPosition();
        };

        window.addEventListener('scroll', handleScroll, false);
        window.addEventListener('resize', enforcePopupPosition);

        return () => {
            clearTimeout(timer);
            popupObserver.disconnect();
            window.removeEventListener('scroll', handleScroll, false);
            window.removeEventListener('resize', enforcePopupPosition);
        };
    }, [
        showDatepicker,
        disableAutoScroll,
        syncPopupChrome,
        enforcePopupPosition,
        getPopupElement,
        resolvePopupPlacement,
    ]);

    useEffect(() => {
        if (!showDatepicker) return undefined;

        const handleMouseDown = (e) => {
            const wrapper = datePickerWrapper.current;
            const popup = getPopupElement();
            const clickPopupHost = e.target?.closest?.(KENDO_INSIDE_POPUP_SELECTOR);
            const isInside =
                wrapper?.contains(e.target) ||
                popup?.contains(e.target) ||
                Boolean(clickPopupHost && popup && clickPopupHost.contains(popup));
            const isTextEditorFocus =
                e.target.closest('.rs-kendo-editor') || e.target.closest('.k-editor-content');

            if (!isInside && !isTextEditorFocus) setDatepicker(false);
        };

        const handleFocusIn = (e) => {
            const isTextEditorFocus =
                e.target.closest('.rs-kendo-editor') || e.target.closest('.k-editor-content');
            if (isTextEditorFocus) setDatepicker(false);
        };

        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('focusin', handleFocusIn);
        return () => {
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('focusin', handleFocusIn);
        };
    }, [showDatepicker, getPopupElement]);

    useEffect(() => {
        if (!showDatepicker) return undefined;

        const handleCancelClick = () => setDatepicker(false);
        const cancelBtn = document.querySelector(
            `.${datetimePopupScopeClass} button.k-time-cancel, .${RES_KENDO_DATETIMEPICKER_POPUP_CLASS} button.k-time-cancel`,
        );
        cancelBtn?.addEventListener('click', handleCancelClick);
        return () => cancelBtn?.removeEventListener('click', handleCancelClick);
    }, [showDatepicker, datetimePopupScopeClass]);

    const normalizeDateValue = (value) => {
        if (value instanceof Date) return value;
        if (value === '' || value == null) return null;
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
    };

    const popupSettings = useMemo(
        () => ({
            animate: !shouldDisableKendoPopupAnimate(
                popupAppendHost,
                datePickerWrapper.current,
            ),
            anchorAlign: { horizontal: 'left', vertical: 'bottom' },
            popupAlign: { horizontal: 'left', vertical: 'top' },
            popupClass: [
                RES_KENDO_DATETIMEPICKER_POPUP_CLASS,
                datetimePopupScopeClass,
                popupClass,
                'kendo-popup-bottom',
                'showing-below',
            ]
                .filter(Boolean)
                .join(' '),
            appendTo:
                popupAppendHost ||
                (typeof document !== 'undefined' ? document.body : null),
        }),
        [datetimePopupScopeClass, popupClass, popupAppendHost],
    );

    return (
        <Controller
            control={control}
            rules={rules}
            name={name}
            defaultValue={normalizeDateValue(defaultValue)}
            render={({ field, fieldState: { error } }) => {
                const errMsg = _get(error, 'message', '');
                const resolvedPlaceholder =
                    placeholderProp || SELECT_SCHEDULE || 'month-day-year hour:minute';

                return (
                    <div
                        ref={datePickerWrapper}
                        className={`${RES_KENDO_DATETIMEPICKER_WRAPPER_CLASS} group ${
                            errMsg ? 'errorContainer' : ''
                        } ${name}`.trim()}
                    >
                        {errMsg ? <div className="validation-message">{errMsg}</div> : null}
                        <DateTimePicker
                            show={showDatepicker}
                            className={name}
                            format={resolvedFormat}
                            toggleButton={CustomIcon}
                            placeholder={removeDefaultValue ? resolvedPlaceholder : undefined}
                            popupSettings={popupSettings}
                            today={customTodayDate}
                            {...rest}
                            value={normalizeDateValue(field.value)}
                            onChange={(e) => {
                                setDatepicker(false);
                                handleChange(e);
                                field.onChange(e);
                                setDatePickerValue(e?.value);
                                setHasValue(e?.value != null);
                            }}
                        />
                        {hasValue && clearErrors ? (
                            <div className="group-hidden group-hover-visible">
                                <RSTooltip
                                    text={CLEAR}
                                    className="lh0 z-2 right37 top5 position-absolute"
                                >
                                    <i
                                        className={`${clear_medium} icon-md color-primary-red`}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => {
                                            setDatePickerValue(null);
                                            if (setValue) setValue(name, '');
                                            clearErrors(name);
                                            handleRemoveVal();
                                            setHasValue(false);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                setDatePickerValue(null);
                                                if (setValue) setValue(name, '');
                                                clearErrors(name);
                                                handleRemoveVal();
                                                setHasValue(false);
                                            }
                                        }}
                                    />
                                </RSTooltip>
                            </div>
                        ) : null}
                    </div>
                );
            }}
        />
    );
};

ResDateTimePicker.propTypes = {
    control: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    rules: PropTypes.object,
    defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    format: PropTypes.string,
    timeFormat: PropTypes.oneOf([RES_TIME_FORMAT.TWENTY_FOUR_HOURS, RES_TIME_FORMAT.TWELVE_HOURS]),
    setValue: PropTypes.func,
    clearErrors: PropTypes.func,
    handleChange: PropTypes.func,
    handleRemoveVal: PropTypes.func,
    customTodayDate: PropTypes.instanceOf(Date),
    disableAutoScroll: PropTypes.bool,
    removeDefaultValue: PropTypes.bool,
    popupClass: PropTypes.string,
    placeholder: PropTypes.string,
    onPickerOpen: PropTypes.func,
};

export default memo(ResDateTimePicker);
