import { time_medium } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { get as _get } from 'Utils/modules/lodashReplacements';

import { Controller } from 'react-hook-form';
import { TimePicker } from '@progress/kendo-react-dateinputs';
import {
    RES_KENDO_TIMEPICKER_WRAPPER_CLASS,
    applyKendoPortaledPopupShellStyles,
    resolveKendoPopupAppendTo,
    shouldDisableKendoPopupAnimate,
} from '../../kendoDocsVariables';

import './resTimePicker.scss';
const toggleButtonClasses = `${time_medium} icon-md color-primary-blue position-relative bottom4`;
 
const TP_CLASS = RES_KENDO_TIMEPICKER_WRAPPER_CLASS;
const INPUT_CLASS = `${TP_CLASS}__input`;

export const RES_TIME_FORMAT = {
    TWENTY_FOUR_HOURS: '24 hours',
    TWELVE_HOURS: '12 hours',
};

const getPickerFormat = (timeFormat) =>
    timeFormat === RES_TIME_FORMAT.TWELVE_HOURS ? 'hh:mm a' : 'HH:mm:ss';

const getPickerSteps = (timeFormat, steps) => {
    const hourStep = steps?.hour ?? 1;
    const minuteStep = steps?.minute ?? 30;

    if (timeFormat === RES_TIME_FORMAT.TWELVE_HOURS) {
        return { hour: hourStep, minute: minuteStep };
    }

    return {
        hour: hourStep,
        minute: minuteStep,
        second: steps?.second ?? 1,
    };
};

const ResTimePicker = ({
    control,
    rules,
    defaultValue,
    name,
    timeFormat = RES_TIME_FORMAT.TWENTY_FOUR_HOURS,
    format: formatProp,
    required,
    label='',
    handleOnFocus = () => {},
    handleChange = () => {},
    handleOnBlur = () => {},
    disabled,
    steps = {
        hour: 1,
        minute: 30,
    },
    ...rest
}) => {
    const is12Hour = timeFormat === RES_TIME_FORMAT.TWELVE_HOURS;
    const pickerFormat = formatProp ?? getPickerFormat(timeFormat);
    const pickerSteps = getPickerSteps(timeFormat, steps);
    const popupClassName = `res-timepicker-popup ${is12Hour ? 'res-timepicker-popup--12h' : 'res-timepicker-popup--24h'}`;
    const [showTimepicker, setTimepicker] = useState(false);
    const timePickerWrapper = useRef();
    const [popupAppendHost, setPopupAppendHost] = useState(null);

    useEffect(() => {
        if (!timePickerWrapper.current) return;
        setPopupAppendHost(
            resolveKendoPopupAppendTo(
                timePickerWrapper.current,
                `.${RES_KENDO_TIMEPICKER_WRAPPER_CLASS}`,
            ),
        );
    }, []);

    useEffect(() => {
        const wrapper = timePickerWrapper.current;
        if (!wrapper) {
            return undefined;
        }

        const handleWrapperClick = (e) => {
            if (disabled) {
                return;
            }

            const isToggleClick =
                e.target.closest('[data-rs-timepicker-toggle-button="true"]') ||
                e.target.closest('.k-input-button');

            if (isToggleClick) {
                e.preventDefault();
                e.stopPropagation();
                setTimepicker((prev) => !prev);
            }
        };

        wrapper.addEventListener('click', handleWrapperClick, true);

        return () => {
            wrapper.removeEventListener('click', handleWrapperClick, true);
        };
    }, [disabled]);

    useEffect(() => {
        if (!showTimepicker) {
            return undefined;
        }

        const handleMouseDownEvent = (e) => {
            const wrapper = timePickerWrapper.current;
            const popup =
                wrapper?.querySelector('.k-popup') ||
                document.querySelector('.k-animation-container');
            const isClickInside = wrapper?.contains(e.target) || popup?.contains(e.target);

            if (!isClickInside) {
                setTimepicker(false);
            }
        };

        document.addEventListener('mousedown', handleMouseDownEvent);

        return () => {
            document.removeEventListener('mousedown', handleMouseDownEvent);
        };
    }, [showTimepicker]);

    useEffect(() => {
        if (!showTimepicker) return;

        const syncTimePopup = () => {
            const wrapper = timePickerWrapper.current;
            if (!wrapper) return false;

            const ownsEl = wrapper.querySelector('[aria-owns]');
            const ownsId = ownsEl?.getAttribute('aria-owns');
            const ownedNode = ownsId ? document.getElementById(ownsId) : null;
            const animationContainer =
                ownedNode?.closest('.k-animation-container') ||
                wrapper.querySelector('.k-animation-container') ||
                document.querySelector('.k-animation-container');

            if (!animationContainer) return false;

            applyKendoPortaledPopupShellStyles(animationContainer, wrapper);
            return true;
        };

        if (!syncTimePopup()) {
            requestAnimationFrame(() => {
                if (!syncTimePopup()) {
                    requestAnimationFrame(syncTimePopup);
                }
            });
        }
    }, [showTimepicker]);

     const applyCustomToggleIcon = useCallback(() => {
        const wrapper = timePickerWrapper.current;
        if (!wrapper) {
            return;
        }
 
        const toggleButton =
            wrapper.querySelector('[data-rs-timepicker-toggle-button="true"]') ||
            wrapper.querySelector('.k-input-button');
        if (!toggleButton) {
            return;
        }
 
        const classesToRemove = [
            'k-button',
            'k-button-md',
            'k-button-solid',
            'k-button-solid-base',
            'k-icon-button',
            'k-input-button',
        ];
        classesToRemove.forEach((cls) => toggleButton.classList.remove(cls));
 
        if (toggleButton.dataset?.rsIconApplied !== 'true') {
            const iconClasses = toggleButtonClasses.split(' ').filter(Boolean);
            if (iconClasses.length) {
                toggleButton.classList.add('rs-timepicker-toggle-icon');
                iconClasses.forEach((cls) => toggleButton.classList.add(cls));
            }
            toggleButton.dataset.rsIconApplied = 'true';
        }
 
        toggleButton.setAttribute('data-rs-timepicker-toggle-button', 'true');
 
        const svgIcon = toggleButton.querySelector('svg');
        if (svgIcon) {
            svgIcon.style.display = 'none';
        }
    }, [toggleButtonClasses]);
 
    useEffect(() => {
        applyCustomToggleIcon();
    }, [ showTimepicker, name]);

    return (
        <Controller
            control={control}
            rules={rules}
            name={name}
            defaultValue={defaultValue instanceof Date || !defaultValue ? defaultValue : new Date(defaultValue)}
            render={({ field: { onChange, onBlur, ...field }, fieldState: { error } }) => {
                const _isEmpty = _get(error, 'message', '')?.length > 0;
                return (
                    <div
                        className={`${RES_KENDO_TIMEPICKER_WRAPPER_CLASS} ${_isEmpty ? 'errorContainer' : ''} `}
                        ref={timePickerWrapper}
                    >
                        {field.value && <span className="rskdw-label-placeholder">{rest?.placeholder}</span>}
                        {_isEmpty && (
                            <div className="validation-message" onClick={() => setTimepicker(true)}>
                                {_get(error, 'message', '')}
                            </div>
                        )}
                        <TimePicker
                            show={showTimepicker}
                            name={name}
                            // toggleButton={CustomIcon}
                            className={`${name} ${required ? 'required' : ''}`.trim()}
                            label={label}
                            steps={pickerSteps}
                            format={pickerFormat}
                            disabled={disabled}
                            popupSettings={{
                                popupClass: popupClassName,
                                animate: !shouldDisableKendoPopupAnimate(
                                    popupAppendHost,
                                    timePickerWrapper.current,
                                ),
                                anchorAlign: { horizontal: 'left', vertical: 'bottom' },
                                popupAlign: { horizontal: 'left', vertical: 'top' },
                                ...(popupAppendHost && { appendTo: popupAppendHost }),
                            }}
                            onClose={() => setTimepicker(false)}
                            onChange={(e) => {
                                setTimepicker(false);
                                handleChange(e);
                                onChange(e);
                            }}
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

ResTimePicker.propTypes = {
    control: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    timeFormat: PropTypes.oneOf([RES_TIME_FORMAT.TWENTY_FOUR_HOURS, RES_TIME_FORMAT.TWELVE_HOURS]),
    format: PropTypes.string,
    rules: PropTypes.object,
    defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    label: PropTypes.string,
    required: PropTypes.bool,
    handleOnFocus: PropTypes.func,
    handleOnBlur: PropTypes.func,
    steps: PropTypes.object,
};

export default memo(ResTimePicker);
