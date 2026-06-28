// import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
// import PropTypes from 'prop-types';
// import _get from 'lodash/get';

// import { Controller } from 'react-hook-form';
// import { TimePicker } from '@progress/kendo-react-dateinputs';

// import toggleButtonClasses from './constant';

// const RSTimePicker = ({
//     control,
//     rules,
//     defaultValue,
//     name,
//     format = 'HH:mm a',
//     required,
//     label='',
//     handleOnFocus = () => {},
//     handleChange = () => {},
//     handleOnBlur = () => {},
//     disabled,
//     steps = {
//         hour: 1,
//         minute: 30,
//         // second: 30,
//     },
//     ...rest
// }) => {
//     const [showTimepicker, setTimepicker] = useState(false);
//     const timePickerWrapper = useRef();

//     useEffect(() => {
//         const wrapper = timePickerWrapper.current;
//         if (!wrapper) {
//             return undefined;
//         }

//         const handleWrapperClick = (e) => {
//             const isToggleClick =
//                 e.target.closest('[data-rs-timepicker-toggle-button="true"]') ||
//                 e.target.closest('.k-input-button');
//             const isInputClick =
//                 e.target.closest('.k-input-inner') ||
//                 e.target.closest('.k-dateinput') ||
//                 e.target.tagName === 'INPUT';

//             if (isToggleClick || isInputClick) {
//                 e.preventDefault();
//                 e.stopPropagation();
//                 setTimepicker((prev) => !prev);
//             }
//         };

//         wrapper.addEventListener('click', handleWrapperClick, true);

//         return () => {
//             wrapper.removeEventListener('click', handleWrapperClick, true);
//         };
//     }, []);

//     useEffect(() => {
//         if (!showTimepicker) {
//             return undefined;
//         }

//         const handleMouseDownEvent = (e) => {
//             const wrapper = timePickerWrapper.current;
//             const popup =
//                 wrapper?.querySelector('.k-popup') ||
//                 document.querySelector('.k-animation-container');
//             const isClickInside = wrapper?.contains(e.target) || popup?.contains(e.target);

//             if (!isClickInside) {
//                 setTimepicker(false);
//             }
//         };

//         document.addEventListener('mousedown', handleMouseDownEvent);

//         return () => {
//             document.removeEventListener('mousedown', handleMouseDownEvent);
//         };
//     }, [showTimepicker]);

//      const applyCustomToggleIcon = useCallback(() => {
//         const wrapper = timePickerWrapper.current;
//         if (!wrapper) {
//             return;
//         }
 
//         const toggleButton =
//             wrapper.querySelector('[data-rs-timepicker-toggle-button="true"]') ||
//             wrapper.querySelector('.k-input-button');
//         if (!toggleButton) {
//             return;
//         }
 
//         const classesToRemove = [
//             'k-button',
//             'k-button-md',
//             'k-button-solid',
//             'k-button-solid-base',
//             'k-icon-button',
//             'k-input-button',
//         ];
//         classesToRemove.forEach((cls) => toggleButton.classList.remove(cls));
 
//         if (toggleButton.dataset?.rsIconApplied !== 'true') {
//             const iconClasses = toggleButtonClasses.split(' ').filter(Boolean);
//             if (iconClasses.length) {
//                 toggleButton.classList.add('rs-timepicker-toggle-icon');
//                 iconClasses.forEach((cls) => toggleButton.classList.add(cls));
//             }
//             toggleButton.dataset.rsIconApplied = 'true';
//         }
 
//         toggleButton.setAttribute('data-rs-timepicker-toggle-button', 'true');
 
//         const svgIcon = toggleButton.querySelector('svg');
//         if (svgIcon) {
//             svgIcon.style.display = 'none';
//         }
//     }, [toggleButtonClasses]);
 
//     useEffect(() => {
//         applyCustomToggleIcon();
//     }, [ showTimepicker, name]);

//     return (
//         <Controller
//             control={control}
//             rules={rules}
//             name={name}
//             defaultValue={defaultValue instanceof Date || !defaultValue ? defaultValue : new Date(defaultValue)}
//             render={({ field: { onChange, onBlur, ...field }, fieldState: { error } }) => {
//                 const _isEmpty = _get(error, 'message', '')?.length > 0;
//                 return (
//                     <div
//                         className={`rs-kendo-datepicker-wrapper ${_isEmpty ? 'errorContainer' : ''} `}
//                         ref={timePickerWrapper}
//                     >
//                         {field.value && <span className="rskdw-label-placeholder">{rest?.placeholder}</span>}
//                         {_isEmpty && (
//                             <div className="validation-message" onClick={() => setTimepicker(true)}>
//                                 {_get(error, 'message', '')}
//                             </div>
//                         )}
//                         <TimePicker
//                             show={showTimepicker}
//                             name={name}
//                             // toggleButton={CustomIcon}
//                             className={name}
//                             //label={_isEmpty ? _get(error, 'message', '') : label}

//                             steps={steps}
//                             format={format}
//                             disabled={disabled}
//                             popupSettings={{ appendTo: timePickerWrapper.current }}
//                             onClose={() => setTimepicker(false)}
//                             onChange={(e) => {
//                                 setTimepicker(false);
//                                 handleChange(e);
//                                 onChange(e);
//                             }}
//                             onFocus={(e) => {
//                                 handleOnFocus(e);
//                             }}
//                             onBlur={(e) => {
//                                 handleOnBlur(e);
//                                 onBlur(e);
//                             }}
//                             {...field}
//                             {...rest}
//                         />
//                     </div>
//                 );
//             }}
//         />
//     );
// };

// RSTimePicker.propTypes = {
//     control: PropTypes.object.isRequired,
//     name: PropTypes.string.isRequired,
//     format: PropTypes.string,
//     rules: PropTypes.object,
//     defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
//     handleOnFocus: PropTypes.func,
//     handleOnBlur: PropTypes.func,
//     steps: PropTypes.object,
// };

// export default memo(RSTimePicker);
export { default } from 'Pages/KendoDocs/CommonComponents/ResTimePicker'