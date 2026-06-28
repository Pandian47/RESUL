import { getUserDetails } from 'Utils/modules/crypto';
import { getmasterData } from 'Utils/modules/masterData';
import { CLEAR, SELECT_SCHEDULE } from 'Constants/GlobalConstant/Placeholders';
import { clear_medium } from 'Constants/GlobalConstant/Glyphicons';
// import React, { memo, useEffect, useRef, useState } from 'react';
// import _get from 'lodash/get';
// import _find from 'lodash/find';
// import PropTypes from 'prop-types';

// import { Controller } from 'react-hook-form';
// // // import { DateTimePicker } from '@progress/kendo-react-dateinputs';
// 
// import { safeToDate } from 'Utils/DateTimeUtils';
// import { getDatepickerFormat } from './constant';
// import RSTooltip from 'Components/RSTooltip';

// const RSDatetimePicker = ({
//     control,
//     setValue,
//     rules,
//     defaultValue,
//     name,
//     label,
//     handleChange = () => {},
//     handleRemoveVal = () => {},
//     isClose = false,
//     clearErrors,
//     popupClass='',
//     removeDefaultValue = false,
//     customTodayDate,
//     disableAutoScroll = false,
//     ...rest
// }) => {
//     const datePickerWrapper = useRef();
//     const [datePickerValue, setDatePickerValue] = useState();
//     // const [datePickerValue, setDatePickerValue] = useState();
//     const [datePickerClose, setDatePickerClose] = useState(false);
//     const [showDatepicker, setDatepicker] = useState(false);
//     const { timeFormatList, dateFormatList } = getmasterData();
//     const { timeFormatId, dateFormatId } = getUserDetails();
//     const timeFormat = _get(_find(timeFormatList, ['timeFormatID', timeFormatId]), 'timeFormatID', 1);
//     const dateFormat = _get(_find(dateFormatList, ['dateFormatID', dateFormatId]), 'dateformat', 'MM-DD-YYYY');

//     const buttonDatePicker = document.querySelectorAll('[aria-label="Toggle date-time selector"]');

//     if (buttonDatePicker) {
//         buttonDatePicker.forEach((item) => (item.title = 'Calendar'));
//     }
//     useEffect(() => {
//         if (datePickerValue) {
//             const inputElement = datePickerWrapper?.current?.querySelector('.k-input-inner');
//             if (inputElement) {
//                 inputElement?.blur();
//             }
//         }
//     }, [datePickerValue]);
//     useEffect(() => {
//         const arrowIcon = document.getElementsByClassName('k-svg-icon');
//         if (arrowIcon[0]?.classList?.contains('k-svg-icon')) {
//             arrowIcon[0].style.display = 'block';
//         }
//         [...arrowIcon].forEach((x) => {
//             const element = [...x.classList];
//             if (!element.includes('icon-rs-calendar-large')) {
//                 x.className += ' icon-rs-calendar-medium icon-md color-primary-blue';
//             }
//         });
//     }, []);

//     useEffect(() => {
//         const tempDate = safeToDate(defaultValue, { resetTime: false, fallback: null });
//         setDatePickerValue(defaultValue instanceof Date || !defaultValue ? defaultValue : tempDate);
//     }, [defaultValue]);
//     useEffect(() => {
//         if (datePickerValue === '' || datePickerValue === undefined || datePickerValue === null) {
//             setDatePickerClose(false);
//         } else {
//             setDatePickerClose(true);
//         }
//     }, [datePickerValue]);
//    const handleMouseDownEvent = (e) => {
//     if (!showDatepicker) return;
//     const datePickerElement = datePickerWrapper.current;
//     const popup = document.querySelector('.k-animation-container');
//     const isClickInside = datePickerElement?.contains(e.target) || 
//                          popup?.contains(e.target);
    
//     const isClickInsideTextEditor = e.target.closest('.rs-kendo-editor') || 
//                                  e.target.closest('.k-editor-content');
    
//     if (!isClickInside && !isClickInsideTextEditor) {
//         setDatepicker(false);
//     }
// };
//     const handleInputClickEvent = () => setDatepicker(!showDatepicker);

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
// useEffect(() => {
//     if (!showDatepicker) return;

//     const handleFocusIn = (e) => {
//         const isTextEditorFocus = e.target.closest('.rs-kendo-editor') || 
//                                 e.target.closest('.k-editor-content');
//         if (isTextEditorFocus) {
//             setDatepicker(false);
//         }
//     };

//     document.addEventListener('mousedown', handleMouseDownEvent);
//     document.addEventListener('focusin', handleFocusIn);

//     return () => {
//         document.removeEventListener('mousedown', handleMouseDownEvent);
//         document.removeEventListener('focusin', handleFocusIn);
//     };
// }, [showDatepicker]);
// const iframes = document.querySelectorAll('iframe');
// iframes.forEach(iframe => {
//     try {
//         const iframeDoc = iframe.contentDocument ?? iframe.contentWindow?.document;
//         if (iframeDoc) {
//             const handler = (e) => {
//                 const popup = document.querySelector('.k-animation-container');
//                 if (!popup?.contains(e.target)) {
//                     setDatepicker(false);
//                 }
//             };
//             iframeDoc.addEventListener('mousedown', handler);
//             iframe._mousedownHandler = handler;
//         }
//     } catch (error) {
//     }
// });
//     useEffect(() => {
//         const inputElements = document.getElementsByClassName(name);
//         if (inputElements[0]) {
//             inputElements[0].childNodes.forEach((list) => {
//                 list.addEventListener('click', handleInputClickEvent);
//             });
//         }
//         const timeCancelButton = document.querySelector(`button.k-time-cancel`);
//         if (timeCancelButton) {
//             timeCancelButton.addEventListener('click', handleInputClickEvent);
//         }
//         return () => {
//             if (inputElements[0]) {
//                 inputElements[0].childNodes.forEach((list) => {
//                     list.removeEventListener('click', handleInputClickEvent);
//                 });
//             }
//             if (timeCancelButton) {
//                 timeCancelButton.removeEventListener('click', handleInputClickEvent);
//             }
//         };
//     }, [name]);
//     useEffect(() => {
//         if (!popupClass) return;
//         const applyClass = () => {
//             const popup = document.querySelector('.k-animation-container');
//             if (popup && !popup.classList.contains(popupClass)) {
//                 popup.classList.add(popupClass);
//             }
//         };
//         applyClass();
//         const interval = setInterval(applyClass, 100);
        
//         return () => clearInterval(interval);
//     }, [popupClass, showDatepicker]);
//     useEffect(() => {
//         document.querySelector(`button.k-time-cancel`)?.addEventListener('click', handleInputClickEvent);

//         return () => {
//             document.querySelector(`button.k-time-cancel`)?.removeEventListener('click', handleInputClickEvent);
//         };
//     }, [showDatepicker]);

//   const positionPopup = () => {
//         if (!datePickerWrapper.current) return {};
//         const inputRect = datePickerWrapper.current.getBoundingClientRect();
//         const popup = document.querySelector('.k-animation-container');
//         const popupHeight = popup ? popup.offsetHeight : 332;
//         return {
//             top: inputRect.top + window.scrollY - popupHeight,
//             left: inputRect.left + window.scrollX,
//             position: 'absolute'
//         };
//     };

//      const popupSettings = {
//         animate: false,
//         position: positionPopup,
//         popupClass: `kendo-popup-bottom ${popupClass}`,
//         appendTo: datePickerWrapper.current
//     };
//   const [shouldScroll, setShouldScroll] = useState(false);

// useEffect(() => {
//     if (!showDatepicker) return;
    
//     const enforcePosition = () => {
//         const popup = datePickerWrapper.current?.querySelector('.k-animation-container') || document.querySelector('.k-animation-container');
//         const input = datePickerWrapper.current?.querySelector('.k-input-inner');
//         if (popup && input) {
//             const inputRect = input.getBoundingClientRect();
//             const popupHeight = popup.offsetHeight || 332;
//             const targetTop = inputRect.top + window.scrollY - popupHeight;
//             popup.style.setProperty('top', `${targetTop}px`, 'important');
//             popup.style.setProperty('left', `${inputRect.left + window.scrollX}px`, 'important');
//             popup.style.setProperty('position', 'absolute', 'important');
//         }
//     };

//     const timer = setTimeout(() => {
//         enforcePosition();
        
//         if (!disableAutoScroll) {
//             const popup = datePickerWrapper.current?.querySelector('.k-animation-container') || document.querySelector('.k-animation-container');
//             const input = datePickerWrapper.current?.querySelector('.k-input-inner');
//             if (input && popup) {
//                 const inputRect = input.getBoundingClientRect();
//                 const popupHeight = popup.offsetHeight || 332;
//                 const popupTopViewport = inputRect.top - popupHeight;
//                 if (popupTopViewport < 0) {
//                     window.scrollTo({
//                         top: Math.max(0, window.scrollY + popupTopViewport - 10),
//                         behavior: 'smooth'
//                     });
//                 }
//             }
//         }
//     }, 50);

//     window.addEventListener('scroll', enforcePosition, true);
//     window.addEventListener('resize', enforcePosition);

//     return () => {
//         clearTimeout(timer);
//         window.removeEventListener('scroll', enforcePosition, true);
//         window.removeEventListener('resize', enforcePosition);
//     };
// }, [showDatepicker, disableAutoScroll]);
 
//     useEffect(() => {
//         if (!showDatepicker) return;
//         const positionTimer = setTimeout(() => {
//             const popup = document.querySelector('.k-animation-container');
//             if (popup) {
//                 setShouldScroll(true);
//             }
//         }, 50);

//         return () => {
//             clearTimeout(positionTimer);
//             setShouldScroll(false);
//         };
//     }, [showDatepicker]);
//       useEffect(() => {
//         if (!shouldScroll || !showDatepicker) return;

//         const scrollTimer = setTimeout(() => {
//             const popup = document.querySelector('.k-animation-container');
//             const input = datePickerWrapper.current?.querySelector('.k-input-inner');
            
//             if (popup && input) {
//                 const inputRect = input.getBoundingClientRect();
//                 const popupHeight = popup.offsetHeight;
//                 const popupTop = inputRect.top - popupHeight;

//                 if (popupTop < 0) {
//                     window.scrollTo({
//                         top: Math.max(0, window.scrollY + popupTop - 10),
//                         behavior: 'smooth'
//                     });
//                 }
//             }
//         }, 100);

//         return () => clearTimeout(scrollTimer);
//     }, [shouldScroll, showDatepicker]);
//     const format = getDatepickerFormat({ timeFormat, dateFormat });

//     const normalizeDateValue = (value) => {
//         if (value instanceof Date) {
//             return value;
//         }
//         if (value === '' || value === null || value === undefined) {
//             return null;
//         }
//         const date = new Date(value);
//         return isNaN(date.getTime()) ? null : date;
//     };

//     // console.log('Date picker ::: ', datePickerValue, defaultValue);
// useEffect(() => {
//   // Continuously monitor and remove placeholder text
//   const checkAndClearPlaceholder = () => {
//     const inputElement = datePickerWrapper.current?.querySelector('.k-input-inner');
    
//     if (!inputElement && removeDefaultValue) {
//       return;
//     }
    
//     const currentValue = inputElement.value || inputElement.getAttribute('value') || '';
    
//     // Clear if it's the default Kendo placeholder text and no actual value is set
//     if (currentValue === "month day, year hour:minute" && !datePickerValue) {
//       inputElement.setAttribute("value", "");
//       inputElement.value = "";
//       // Set custom placeholder
//       inputElement.setAttribute("placeholder",  rest?.placeholder || SELECT_SCHEDULE || '');
//     }
    
//     // Also set custom placeholder when input is empty and no value is set
//     if ((!currentValue || currentValue === "") && !datePickerValue) {
//       inputElement.setAttribute("placeholder",  rest?.placeholder || SELECT_SCHEDULE|| '');
//     }
//   };

//   // Run immediately
//   checkAndClearPlaceholder();
  
//   // Set up interval to continuously check and clear placeholder
//   const interval = setInterval(checkAndClearPlaceholder, 200);
  
//   // Also check when datePickerValue changes
//   const timer = setTimeout(checkAndClearPlaceholder, 100);
  
//   // Set up MutationObserver to watch for DOM changes
//   const observer = new MutationObserver(() => {
//     checkAndClearPlaceholder();
//   });
  
//   // Start observing
//   if (datePickerWrapper.current) {
//     observer.observe(datePickerWrapper.current, {
//       childList: true,
//       subtree: true,
//       attributes: true,
//       attributeFilter: ['value']
//     });
//   }
  
//   return () => {
//     clearInterval(interval);
//     clearTimeout(timer);
//     observer.disconnect();
//   };
// }, [datePickerValue, removeDefaultValue,rest?.placeholder]); // Run when datePickerValue changes
//     return (
//         <Controller
//             control={control}
//             rules={rules}
//             name={name}
//             defaultValue={normalizeDateValue(defaultValue)}
//             render={({ field, fieldState: { error } }) => {
//                 let errMsg = _get(error, 'message', '');
//                 return (
//                     //     <div
//                     //     className={`${_isEmpty ? 'errorContainer' : ''} ${name} position-relative`}
//                     //     ref={datePickerWrapper}
//                     // >
//                     <div
//                         className={`group ${!!errMsg ? 'errorContainer' : ''} rs-kendo-datetimepicker-wrapper`}
//                         ref={datePickerWrapper}
//                     >
//                         {errMsg && <div className="validation-message">{errMsg}</div>}
//                         <DateTimePicker
//                             show={showDatepicker}
//                             className={name}
//                             format={format}
//                             popupSettings={popupSettings}
//                             today={customTodayDate}
//                             {...rest}
//                             value={normalizeDateValue(field.value)}
//                             onChange={(e) => {
//                                 setDatepicker(false);
//                                 handleChange(e);
//                                 field.onChange(e);
//                                 setDatePickerValue(e?.value);
//                             }}
//                             ariaDescribedBy={name}
//                             ariaLabelledBy={name}
//                         />
//                         {datePickerClose && (
//                             // {isClose && (
//                             <div className='group-hidden group-hover-visible'>
//                                 <RSTooltip text={CLEAR} className="lh0 z-2 right37 top5 position-absolute">
//                                     <i
//                                         className={`${clear_medium}  icon-md color-primary-red`}
//                                         onClick={() => {
//                                             setDatePickerValue(null);
//                                             //setValue(name, '');
//                                             clearErrors(name);
//                                             handleRemoveVal();
//                                         }}
//                                     />
//                                 </RSTooltip>
//                             </div>
//                         )}
//                     </div>
//                 );
//             }}
//         />
//     );
// };

// RSDatetimePicker.propTypes = {
//     control: PropTypes.object.isRequired,
//     name: PropTypes.string.isRequired,
//     format: PropTypes.string,
//     rules: PropTypes.object,
//     handleChange: PropTypes.func,
//     handleRemoveVal: PropTypes.func,
//     defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
//     removeDefaultValue: PropTypes.bool,
// };

// export default memo(RSDatetimePicker);

export { default } from 'Pages/KendoDocs/CommonComponents/ResDateTimePicker'