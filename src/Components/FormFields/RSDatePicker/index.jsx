import { getDateFormat } from 'Utils/modules/dateTime';
// import React, { memo, useEffect, useRef, useState } from 'react';
// import PropTypes from 'prop-types';
// import _get from 'lodash/get';
// import _find from 'lodash/find';

// import { Controller } from 'react-hook-form';
// import { DatePicker } from '@progress/kendo-react-dateinputs';

// import CustomIcon from './constant';

// import { getUserDetails } from 'Utils/modules/crypto';
import { getmasterData } from 'Utils/modules/masterData';
// 

// const RSDatePicker = ({
//     control,
//     rules,
//     defaultValue,
//     name,
//     format = 'MMM dd, yyyy',
//     required,
//     label,
//     handleOnFocus = () => {},
//     handleChange = () => {},
//     handleOnBlur = () => {},
//     disabled,
//     placeholder,
//     isTargetList = false,
//     isShowPlaceholder = false,
//     customTodayDate,
//     ...rest
// }) => {
//     const datePickerWrapper = useRef();
//     const [showDatepicker, setDatepicker] = useState(false);
//     const { dateFormatList } = getmasterData();
//     const { dateFormatId } = getUserDetails();
//     const { dateFormatId: configuredFormatId } = getDateFormat();
//     let dateFormat = _get(
//         _find(dateFormatList, ['dateFormatID', configuredFormatId || dateFormatId]),
//         'dateformat',
//         'MM-DD-YYYY',
//     );

//     function normalizeDateFormat(dateFormat) {
//         const lower = dateFormat.toLowerCase();
//         if (lower.includes('mmm')) {
//             return lower.replace(/mmm/g, 'MMM');
//         }
//         return lower.replace(/mm/g, 'MM');
//     }

//     // dateFormat = isTargetList ? format : dateFormat.toLowerCase().replace('mm', 'MM');
//     dateFormat = isTargetList ? format :  normalizeDateFormat(dateFormat);
//     //_map(dateFormat.split('-'), (format) => (format !== 'MM' ? format.toLowerCase() : format)).join('-');

//     const handleMouseDownEvent = (e) => {
//         if (datePickerWrapper.current && !datePickerWrapper.current?.contains(e.target)) {
//             setDatepicker(false);
//         }
//     };

//     const handleInputClickEvent = () => {
//         setDatepicker(!showDatepicker);
//     };

//     // Manage Date constructor override when picker is open
//     useEffect(() => {
//         if (customTodayDate && showDatepicker) {
//             // Store original Date constructor
//             const OriginalDate = window.Date;
            
//             // Override Date constructor
//             window.Date = function(...args) {
//                 if (args.length === 0) {
//                     // When called without arguments (new Date()), return our custom today date
//                     return new OriginalDate(customTodayDate);
//                 }
//                 return new OriginalDate(...args);
//             };
            
//             // Copy static methods
//             Object.setPrototypeOf(window.Date, OriginalDate);
//             Object.defineProperty(window.Date, 'prototype', {
//                 value: OriginalDate.prototype,
//                 writable: false
//             });
            
//             // Store the original Date for restoration
//             window._originalDate = OriginalDate;
            
//             return () => {
//                 // Restore original Date constructor when picker closes
//                 if (window._originalDate) {
//                     window.Date = window._originalDate;
//                     delete window._originalDate;
//                 }
//             };
//         }
//     }, [showDatepicker, customTodayDate]);

//     useEffect(() => {
//         document.addEventListener('mousedown', handleMouseDownEvent);
//         document.getElementsByClassName(name)[0]?.childNodes?.forEach((list) => {
//             list.addEventListener('click', handleInputClickEvent);
//         });

//         return () => {
//             document.removeEventListener('mousedown', handleMouseDownEvent);
//             document.getElementsByClassName(name)[0]?.childNodes?.forEach((list) => {
//                 list.removeEventListener('click', handleInputClickEvent);
//             });
//         };
//     }, []);
//     const datePickerInput = document.querySelectorAll('.k-datepicker input');

//     const buttonDatePicker = document.querySelectorAll('[aria-label="Toggle calendar"]');

//     if (buttonDatePicker) {
//         buttonDatePicker.forEach((item) => (item.title = 'Calendar'));
//     }

//     if (datePickerInput) {
//         datePickerInput.forEach((input) => {
//             input.addEventListener('wheel', (e) => {
//                 e.stopImmediatePropagation();
//                 e.preventDefault();
//                 return;
//             });

//             input.addEventListener('keydown', (e) => {
//                 e.stopImmediatePropagation();
//                 e.preventDefault();
//                 return;
//             });
//         });
//     }

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
//                         className={`rs-kendo-datepicker-wrapper ${_isEmpty ? 'errorContainer' : ''}`}
//                         ref={datePickerWrapper}
//                     >
//                         {isShowPlaceholder && placeholder && field?.value && (
//                             <label className="rs-kendo-label datepicker_placeholder">{placeholder}</label>
//                         )}
//                         {_isEmpty && (
//                             <div className="validation-message" onClick={() => setDatepicker(true)}>
//                                 {_get(error, 'message', '')}
//                             </div>
//                         )}

//                         <DatePicker
//                             show={showDatepicker}
//                             name={name}
//                             toggleButton={CustomIcon}
//                             //className={name}
//                             className={`${name}  ${required ? 'required' : ''}`}
//                             placeholder={placeholder || 'date-month-year'}
//                             //label={_isEmpty ? _get(error, 'message', '') : label}
//                             format={dateFormat}
//                             disabled={disabled}
//                             popupSettings={{ appendTo: datePickerWrapper.current }}
//                             today={customTodayDate}
//                             // formatPlaceholder={}
//                             onChange={(e) => {
//                                 setDatepicker(false);
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

// RSDatePicker.propTypes = {
//     control: PropTypes.object.isRequired,
//     name: PropTypes.string.isRequired,
//     format: PropTypes.string,
//     rules: PropTypes.object,
//     defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
//     handleOnFocus: PropTypes.func,
//     handleOnBlur: PropTypes.func,
// };

// export default memo(RSDatePicker);
export { default } from 'Pages/KendoDocs/CommonComponents/ResDatePicker'