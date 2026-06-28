import { convertDateBetweenTimezones, convertUserTimezoneToTarget, getDateWithAddMinutes } from 'Utils/modules/dateTime';
import { getmasterData } from 'Utils/modules/masterData';
import { getUserDetails } from 'Utils/modules/crypto';
import { SELECT_SCHEDULE_DATE_AND_TIME, SELECT_TIMEZONE } from 'Constants/GlobalConstant/ValidationMessage';
import { ARE_YOU_SURE_REMOVE_SCHEDULED, DAY_LIGHT, RESUL_AI_DETERMINE, SCHEDULE, SELECT_SCHEDULE, TIME_ZONE, TIMEZONE } from 'Constants/GlobalConstant/Placeholders';
import { circle_question_mark_mini, pencil_edit_mini } from 'Constants/GlobalConstant/Glyphicons';
// import React, { Fragment, useCallback, useEffect, useState } from 'react';
// import _get from 'lodash/get';
// import _find from 'lodash/find';
// import { Row, Col } from 'react-bootstrap';
// import { useFormContext } from 'react-hook-form';
// import { useSelector, useDispatch } from 'react-redux';

// // // // import RSTooltip from 'Components/RSTooltip';
// import RSCheckbox from 'Components/FormFields/RSCheckbox';
// import SendTimeOptimization from '../SendTimeOptimization';
// import RSDatetimePicker from 'Components/FormFields/RSDatetimePicker';
// import RSKendoDropDown from 'Components/FormFields/RSKendoDropDown';

// 
// import { getUtcTimeData } from 'Reducers/globalState/selector';
// import { getUtcTimeNow, getActiveDSTTimezones } from 'Reducers/globalState/request';
// import useQueryParams from 'Hooks/useQueryParams';
// import WarningPopup from 'Pages/AuthenticationModule/Components/WarningPopup/WarningPopup';
// import useOnlyDepChangeEffect from 'Hooks/useOnlyDepChangeEffect';

// const Scheduler = ({
//     fieldName,
//     isRequired = false,
//     isSplitTabs,
//     isSendTimeRecommendation = true,
//     withFormAlign = false,
//     isClose = false,
//     minDate,
//     maxDate,
//     splitABminDate,
//     disableAutoScroll = false,
//     utcTime_Data,
//     isRfaEnabled = false,
//     isSplitABScheduler = false,
//     /** Split A/B / listing toolbar: single row, no blue section backgrounds */
//     compactToolbarLayout = false,
// }) => {
//     // console.log('maxDate: ', maxDate);
//     // console.log('minDate: ', minDate);
//     // debugger;
//     // const { state } = useLocation();
//     const state = useQueryParams('/communication');
//     const dispatch = useDispatch();
//     // const utcTimeData = useSelector((state) => getUtcTimeData(state));
//     // console.log('utcTimeData TEST 1 ==>>',utcTimeData)
    
//     // Use UTC time from API if available, otherwise fallback to system time
//     // const currentUTCdateTime = utcTimeData.utcTime ? new Date(utcTimeData.utcTime.replace('Z', '')) : new Date();

//      let getUtc_TimeData = utcTime_Data != null ? true : false

    //  const [activeTimezones, setActiveTimezones] = useState(null);

    //  const fetchTimezonesAndFallback = useCallback(() => {
    //      dispatch(getActiveDSTTimezones()).then((res) => {
    //          if (res?.status && res?.timezones?.length > 0) {
    //              setActiveTimezones(res.timezones);
    //          } else {
    //              dispatch(getUtcTimeNow());
    //          }
    //      }).catch(() => {
    //          dispatch(getUtcTimeNow());
    //      });
    //  }, [dispatch]);

//      useEffect(() => {
//         if (utcTime_Data != null) return; 
//         fetchTimezonesAndFallback();
//     }, [fetchTimezonesAndFallback, utcTime_Data]);

//     let utcTimeData ;
//     if(getUtc_TimeData){
//     utcTimeData = utcTime_Data
//     }else{
//         let utc_TimeData = useSelector((state) => getUtcTimeData(state));
//         utcTimeData = utc_TimeData
//     }

//     const { isCurrentBURFAStatus } = useSelector(({ globalstate }) => globalstate);

// const currentUTCdateTime = utcTimeData?.utcTime ? new Date(utcTimeData.utcTime.replace('Z', '')) : new Date();

    
//     const { startDate, endDate } = {
//         startDate: _get(state, 'startDate', null) ? new Date(`${_get(state, 'startDate', null)}T00:00:00`) : null,
//         endDate: _get(state, 'endDate', null) ? new Date(`${_get(state, 'endDate', null)}T00:00:00`) : null,
//     };
//     startDate?.setHours(0, 0, 0, 0);
//     endDate?.setHours(23, 59, 59, 999);
//     let modifiedEndDate = new Date(endDate);
//     modifiedEndDate.setDate(modifiedEndDate?.getDate() - 2);
//     const defaultValues = currentUTCdateTime;
//     const { timeZoneList, timeFormatList, dateFormatList } = getmasterData();
//     const { timeZoneId, timeFormatId, dateFormatId, isDayLight = false} = getUserDetails();
//     const timeZone = _find(timeZoneList, ['timeZoneID', timeZoneId || '']);
//     const timeFormat = _find(timeFormatList, ['timeFormatID', timeFormatId]);
//     const dateFormat = _find(dateFormatList, ['dateFormatID', dateFormatId]);
    
//     // Determine the date-time format based on user's time format preference
//     const getDateTimeFormat = () => {
//         const is12Hour = timeFormat?.timeformat === '12 hours';
//         let baseDateFormat = dateFormat?.dateformat || 'MM-dd-yyyy';
        
//         // Convert API format to Kendo DateTimePicker format
//         baseDateFormat = baseDateFormat
//             .replace(/DD/g, 'dd')  // Convert DD to dd
//             .replace(/YYYY/g, 'yyyy')  // Convert YYYY to yyyy
//             .replace(/MMM DD, YYYY/g, 'MMM dd, yyyy')  // Handle MMM DD, YYYY format
//             .replace(/MMM DD YYYY/g, 'MMM dd yyyy');  // Handle MMM DD YYYY format
        
//         return is12Hour ? `${baseDateFormat} hh:mm a` : `${baseDateFormat} HH:mm`;
//     };
//     const { setValue, control, watch, getValues, clearErrors, unregister, setError, trigger } = useFormContext();
//     const [isTimeZone, setTimeZone] = useState(false);
//     const [showPopup, setShowPopup] = useState(false);
//     const [popupclass, setPopupclass] = useState(false);
//     const [isrecommendationClickOff, setisRecommendationclickoff] = useState(false);
//     const [updateStartdate, setUpdateStartdate] = useState(startDate);
//     const [isWarningPopupShow, setIsWarningPopupShow] = useState({
//         show: false,
//         message:
//             'Removing the scheduled time will prevent the communication from being executed. Do you wish to continue?',
//         scheduleTime: '',
//     });
//     const [isRFAPopupShow, setIsRFAPopupShow] = useState({
//         show: false,
//         scheduleTime: '',
//     });
//     useEffect(() => {
//         const schedulechecked = state?.statusId === 5 ? true : false || false;
//         setisRecommendationclickoff(schedulechecked);
//     }, [isrecommendationClickOff]);
//     useEffect(() => {
//         if (showPopup) {
//             document.body.style.overflow = 'hidden';
//         } else {
//             document.body.style.overflow = 'visible';
//         }
//     }, [showPopup]);
//     const schedulerName = isSplitTabs ? `${fieldName}.schedule` : 'schedule';
//     const sendTimeRecommendationName = isSplitTabs ? `${fieldName}.sendTimeRecommendation` : 'sendTimeRecommendation';
//     const timezoneName = isSplitTabs ? `${fieldName}.timezone` : 'timezone';
//     const daylightSavingsName = isSplitTabs ? `${fieldName}.daylightSavings` : 'daylightSavings';
//     const scheduleRule = isRequired ? { required: SELECT_SCHEDULE_DATE_AND_TIME } : {};
//     // console.log('scheduleRule: ', scheduleRule);
//     // console.log('Field name ::: ', fieldName, getValues(schedulerName));
//     const [timeZoneWatch, recommedationState, scheduleValue] = watch([
//         timezoneName,
//         sendTimeRecommendationName,
//         schedulerName,
//     ]);
    
//     useEffect(() => {
//         // Only set user's profile timezone if no timezone is already set (create mode)
//         // In edit mode, the timezone should come from the API response
//         const currentTimezoneValue = getValues(timezoneName);
//         if(timeZone && !currentTimezoneValue){
//             setValue(timezoneName, timeZone)
//             setValue(daylightSavingsName, isDayLight)
//         }
//     },[timeZone?.timeZoneID])
//     useEffect(() => {
//         if (timeZoneId !== _get(timeZoneWatch, 'timeZoneID', '')){
//             setTimeZone(true);
//         }else if (!timeZone){
//             setTimeZone(true);
//         }else {
//             setTimeZone(false);
//         }
//     }, [timeZoneWatch]);
//     const validDate = scheduleValue ? new Date(scheduleValue) : null;

//     useEffect(() => {
//         if (popupclass) {
//             const popupElement = document.querySelector('.k-datetime-container');
//             if (popupElement) {
//                 popupElement.classList.add('Schedule-date');
//             }
//         } else {
//             const popupElement = document.querySelector('.k-datetime-container');
//             if (popupElement) {
//                 popupElement.classList.remove('Schedule-date');
//             }
//         }
//     }, [popupclass]);

//     // Call UTC time API when component mounts
//     // useEffect(() => {
        
//     //     if (utcTime_Data != null) return; 
//     //     dispatch(getUtcTimeNow());
//     // }, [dispatch]);

//     useEffect(() => {
//         const handleClickOutside = () => {
//             const popupElement = document.querySelector('.k-datetime-container');
//             if (!popupElement && popupclass) {
//                 setPopupclass(false);
//             }
//         };

//         const interval = setInterval(handleClickOutside, 100);
        
//         return () => clearInterval(interval);
//     }, [popupclass]);
//     useOnlyDepChangeEffect(() => {
//         if(startDate < currentUTCdateTime) {
//             setUpdateStartdate(currentUTCdateTime);
//         } else {
//             setUpdateStartdate(startDate);
//         }
//     }, [state?.startDate, utcTimeData.utcTime]);

//     // Function to convert date to selected timezone (using common utility)
//     const convertDateToSelectedTimezone = (date, targetTimezone) => {
//         return convertDateBetweenTimezones(date, targetTimezone?.gmtOffset);
//     };

//     // Get timezone-adjusted minimum date
//     const getTimezoneAdjustedMinDate = () => {
//         // Priority: form context timezone (from API in edit mode) > user profile timezone
//         const selectedTimezone = timeZoneWatch?.gmtOffset ? timeZoneWatch : timeZone;
//         if(splitABminDate){
//             return splitABminDate;
//         }
        
//         let baseMinDate;
//         if (minDate) {
//             // Convert from user profile timezone to selected timezone
//             baseMinDate = convertUserTimezoneToTarget(
//                 minDate, 
//                 "(GMT) ", //UTC gmtoffset
//                 selectedTimezone?.gmtOffset, 
//                 false
//             );
//         } else {
//             // Check if startDate exists
//             if (startDate) {
//                 // Compare dates only (ignoring time)
//                 const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
//                 const convertedDate = convertUserTimezoneToTarget(
//                     currentUTCdateTime,
//                     "(GMT) ", // UTC gmtoffset
//                     selectedTimezone?.gmtOffset,
//                     false
//                 );
//                 const currentDateOnly = new Date(convertedDate.getFullYear(), convertedDate.getMonth(), convertedDate.getDate());
                
//                 if (startDateOnly.getTime() === currentDateOnly.getTime()) {
                    
//                     // Extract hours, minutes, seconds from converted date
//                     const hours = convertedDate.getHours();
//                     const minutes = convertedDate.getMinutes();
//                     const seconds = convertedDate.getSeconds();
                    
//                     // Set those hours, minutes, seconds to startDate
//                     const adjustedStartDate = new Date(startDate);
//                     adjustedStartDate.setHours(hours, minutes, seconds, 0);
                    
//                     // Add 15 minutes to the adjusted startDate
//                     baseMinDate = getDateWithAddMinutes(adjustedStartDate, 15);
//                 } else {
//                     // Different date: set baseMinDate as startDate with time 00:00:00
//                     baseMinDate = new Date(startDate);
//                     baseMinDate.setHours(0, 0, 0, 0);
//                 }
//             } else {
//                 // No startDate: use current logic
//                 const timeWithBuffer = getDateWithAddMinutes(currentUTCdateTime, 15);
                
//                 baseMinDate = convertUserTimezoneToTarget(
//                     timeWithBuffer, 
//                     "(GMT) ", //UTC gmtoffset
//                     selectedTimezone?.gmtOffset, 
//                     false
//                 );
//             }
//         }
        
        
//         // Round up to nearest 5-minute interval
//         const roundedDate = new Date(baseMinDate);
//         let minutes = roundedDate.getMinutes();
//         let roundedMinutes = Math.ceil(minutes / 5) * 5;
        
//         // Handle edge case where rounding goes to 60
//         if (roundedMinutes === 60) {
//             roundedMinutes = 0;
//             roundedDate.setHours(roundedDate.getHours() + 1, 0, 0, 0);
//         } else {
//             roundedDate.setMinutes(roundedMinutes, 0, 0);
//         }
        
//         return roundedDate;
//     };

//     // Get timezone-adjusted maximum date
//     const getTimezoneAdjustedMaxDate = () => {
//         // Priority: form context timezone (from API in edit mode) > user profile timezone
//         const selectedTimezone = timeZoneWatch?.gmtOffset ? timeZoneWatch : timeZone;
        
//         let baseMaxDate;
//         if (maxDate) {
//             // Check if selected timezone is different from user profile timezone
//             const isTimezoneDifferent = selectedTimezone?.gmtOffset !== timeZone?.gmtOffset;
            
//             if (isTimezoneDifferent && timeZone?.gmtOffset && selectedTimezone?.gmtOffset) {
//                 // Convert from user profile timezone to selected timezone
//                 baseMaxDate = convertUserTimezoneToTarget(
//                     maxDate, 
//                     timeZone.gmtOffset, 
//                     selectedTimezone?.gmtOffset, 
//                     false
//                 );
//             } else {
//                 // No conversion needed if timezones are the same
//                 baseMaxDate = new Date(maxDate);
//             }
//         } else {
//             // Check if selected timezone is different from user profile timezone
//             const isTimezoneDifferent = selectedTimezone?.gmtOffset !== timeZone?.gmtOffset;
            
//             if (isTimezoneDifferent) {
//                 // Use the existing logic but convert to selected timezone
//                 baseMaxDate = convertUserTimezoneToTarget(
//                     endDate,
//                     timeZone.gmtOffset,
//                     selectedTimezone?.gmtOffset,
//                     false
//                 );
//             } else {
//                 // No conversion needed if timezones are the same
//                 baseMaxDate = endDate;
//             }
//         }

//         const baseMaxAsDate = baseMaxDate != null ? new Date(baseMaxDate) : null;
//         const baseMaxInvalid = !baseMaxAsDate || Number.isNaN(baseMaxAsDate.getTime());
//         if (baseMaxInvalid) {
//             // Listing / modal flows often have no URL endDate and no campaign endDate on detail —
//             // without this, new Date(null) becomes 1970 and max < min, so Kendo renders an empty grid.
//             const minRef = getTimezoneAdjustedMinDate();
//             baseMaxDate = new Date(minRef);
//             baseMaxDate.setFullYear(baseMaxDate.getFullYear() + 1);
//         }
        
//         // Set time to 23:55
//         const finalMaxDate = new Date(baseMaxDate);
//         finalMaxDate.setHours(23, 55, 0, 0);
        
//         // Reduce 48 hours from the finalMaxDate
//         const adjustedMaxDate = new Date(finalMaxDate);
//         adjustedMaxDate.setHours(adjustedMaxDate.getHours() - 48);

//         const minBoundary = getTimezoneAdjustedMinDate();
//         if (adjustedMaxDate.getTime() < minBoundary.getTime()) {
//             const safeMax = new Date(minBoundary);
//             safeMax.setFullYear(safeMax.getFullYear() + 1);
//             return safeMax;
//         }

//         return adjustedMaxDate;
//     };

//     // Function to set default date time for the picker
//     const setDefaultDateTime = () => {
//         // If there's already a selected value, use it
//         if (validDate && !isNaN(validDate.getTime())) {
//             const minDate = getTimezoneAdjustedMinDate();
            
//             // Check if validDate date is equal to minDate date
//             if (minDate && validDate.toDateString() === minDate.toDateString()) {
//                 // Check if validDate time is 00:00
//                 if (validDate.getHours() === 0 && validDate.getMinutes() === 0) {
//                     // Replace 00:00 with minDate time, rounded to nearest 5-minute interval
//                     const adjustedDate = new Date(validDate);
                    
//                     // Round minutes to nearest 5-minute interval
//                     let roundedMinutes = Math.ceil(minDate.getMinutes() / 5) * 5;
                    
//                     // Handle edge case where rounding goes to 60
//                     if (roundedMinutes === 60) {
//                         roundedMinutes = 0;
//                         adjustedDate.setHours(minDate.getHours() + 1, 0, 0, 0);
//                     } else {
//                         adjustedDate.setHours(minDate.getHours(), roundedMinutes, 0, 0);
//                     }
                    
//                     return adjustedDate;
//                 }
//             }

//             return validDate;
//         }
        
//         // If no value is selected, return null to allow clearing
//         return null;
//     };

//     // Handle datetime picker change to fix time when minimum date is selected
//     const handleDateTimeChange = (e) => {
//         if (e.value) {
//             if (!hasRFAData() && isCurrentBURFAStatus && isRfaEnabled) {
//                 setValue('approvalList.requestApproval', true);
//                 setValue('approvalList.name', [{ approverName: '', mandatory: false }]);
//                 setError('approvalList.name[0].approverName', {
//                     type: 'custom',
//                     message: 'Request for approval is mandatory',
//                 });
//                 trigger('approvalList.requestApproval');
//                 }

//             const selectedDate = new Date(e.value);
//             const minDate = getTimezoneAdjustedMinDate();
            
//             // If selected date matches minimum date and time is 00:00, fix the time
//             if (minDate && selectedDate.toDateString() === minDate.toDateString()) {
//                 if (selectedDate.getHours() === 0 && selectedDate.getMinutes() === 0) {
//                     // Round minutes to nearest 5-minute interval
//                     let roundedMinutes = Math.ceil(minDate.getMinutes() / 5) * 5;
                    
//                     // Handle edge case where rounding goes to 60
//                     if (roundedMinutes === 60) {
//                         roundedMinutes = 0;
//                         selectedDate.setHours(minDate.getHours() + 1, 0, 0, 0);
//                     } else {
//                         selectedDate.setHours(minDate.getHours(), roundedMinutes, 0, 0);
//                     }
                    
//                     setTimeout(() => {
//                         setValue(schedulerName, selectedDate);
//                     }, 10);
//                     return;
//                 }
//             }
//         }
        
//         // If no fixing needed, just set the value normally
//         // setValue(schedulerName, e.value);
//     };

//     const hasRFAData = () => {
//         const isRFAChecked = getValues('approvalList.requestApproval');
//         const nameArray = getValues('approvalList.name');

//         if (!isRFAChecked) {
//             return false;
//         }
//         if(isRFAChecked) {
//             return true;
//         }
//         if (nameArray && Array.isArray(nameArray) && nameArray.length > 0) {
//             const hasValidApprover = nameArray.some((approver) => {
//                 const approverName = approver?.approverName;
//                 if (typeof approverName === 'string') {
//                     return approverName.trim() !== '';
//                 } else if (approverName && typeof approverName === 'object') {
//                     return approverName?.name || approverName?.userId || approverName?.email;
//                 }
//                 return false;
//             });
//             return hasValidApprover;
//         }

//         return false;
//     };

//     const clearRFADetails = () => {
//         setValue('approvalList.requestApproval', false);
//         setValue('approvalList.name', [{ approverName: '', mandatory: false }]);
//     };

//     const handleRemoveMDCFlow = () => {
//         if (state && state?.campaignType === 'M' && state.isExistChildActiveChannel) {
//             setIsWarningPopupShow({
//                 show: true,
//                 message: ARE_YOU_SURE_REMOVE_SCHEDULED,
//                 scheduleTime: scheduleValue,
//             });
//         } else {
//             setIsWarningPopupShow({
//                 show: false,
//                 message: '',
//                 scheduleTime: '',
//             });
//         }
//     };

//     const schedulePickerBlock = (
//         <>
//             <span onClick={() => setPopupclass(!popupclass)}>
//                 <RSDatetimePicker
//                     control={control}
//                     setValue={setValue}
//                     name={schedulerName}
//                     defaultValue={setDefaultDateTime()}
//                     placeholder={SELECT_SCHEDULE}
//                     focusedDate={getTimezoneAdjustedMinDate()}
//                     min={getTimezoneAdjustedMinDate()}
//                     max={getTimezoneAdjustedMaxDate()}
//                     customTodayDate={getTimezoneAdjustedMinDate()}
//                     format={getDateTimeFormat()}
//                     steps={{
//                         minute: 5,
//                         second: 10,
//                     }}
//                     rules={scheduleRule}
//                     clearErrors={clearErrors}
//                     handleChange={handleDateTimeChange}
//                     handleRemoveVal={() => {
//                         setValue(schedulerName, '');
//                         handleRemoveMDCFlow();
//                         if (isCurrentBURFAStatus && isRfaEnabled) {
//                             if (hasRFAData()) {
//                                 setIsRFAPopupShow({
//                                     show: true,
//                                     scheduleTime: scheduleValue,
//                                 });
//                                 return;
//                             }
//                         }
//                     }}
//                     popupClass={popupclass ? 'Schedule-date' : ''}
//                     removeDefaultValue={true}
//                     disableAutoScroll={disableAutoScroll}
//                 />
//             </span>

//             <ul className={`mt2 rs-list-inline cp ${compactToolbarLayout ? 'mb0' : ''}`}>
//                 {!isSplitTabs && isSendTimeRecommendation && (
//                     <Fragment>
//                         <li
//                             onClick={() => {
//                                 if (!recommedationState) setShowPopup(true);
//                             }}
//                         >
//                             <span
//                                 className={`${isrecommendationClickOff ? 'pe-none click-off' : ''}`}
//                             >
//                                 <RSCheckbox
//                                     control={control}
//                                     name={sendTimeRecommendationName}
//                                     defaultValue={recommedationState}
//                                     labelName={'Use send time optimization'}
//                                     popover
//                                     popover_icon={`${circle_question_mark_mini} icon-xs color-primary-blue`}
//                                     popover_position="top"
//                                     popover_content={RESUL_AI_DETERMINE}
//                                 />
//                             </span>
//                         </li>
//                     </Fragment>
//                 )}
//                 {!isTimeZone && (
//                     <li className="float-end">
//                         <span className="d-flex">
//                             {_get(timeZoneWatch?.gmtOffset ? timeZoneWatch : timeZone, 'gmtOffset', '')}{' '}
//                             <RSTooltip text="Edit" className="ml5">
//                                 <i
//                                     id="rs_Scheduler_pencil_edit"
//                                     className={`${pencil_edit_mini} color-primary-blue`}
//                                     onClick={(e) => {
//                                         e.stopPropagation();
//                                         setTimeZone(true);
//                                     }}
//                                 ></i>
//                             </RSTooltip>
//                         </span>
//                     </li>
//                 )}
//             </ul>
//         </>
//     );


//     const timezoneFieldsBlock = (
//         <>
//             <RSKendoDropDown
//                 control={control}
//                 name={timezoneName}
//                 data={timeZoneList}
//                 popupClass={'timezone'}
//                 textField="timeZoneName"
//                 dataItemKey={'timeZoneID'}
//                 defaultValue={timeZone}
//                 label={TIMEZONE}
//                 rules={{
//                     required: SELECT_TIMEZONE,
//                 }}
//                 handleChange={(e) => {
//                     const val = e.value;
//                     setValue(schedulerName, '');
//                     clearErrors(schedulerName);
//                     let dlight = timeZoneId === val?.timeZoneID ? isDayLight : false
//                     setValue(daylightSavingsName, dlight);
//                     dispatch(getUtcTimeNow());
//                 }}
//             />
//             <span>
//                 <RSCheckbox
//                     name={daylightSavingsName}
//                     control={control}
//                     labelName={DAY_LIGHT}
//                     disabledchk={!timeZoneWatch?.isDayLight}
//                 />
//             </span>
//         </>
//     );

//     if (compactToolbarLayout) {
//         return (
//             <>
//                 <Row className="align-items-start gx-3 gy-2 mb0">
//                     <Col xs={12} xl={isTimeZone ? 12 : 12} className="min-w-0 form-group">
//                         <div className="form-group mb0">{schedulePickerBlock}</div>
//                     </Col>
//                     {isTimeZone && (
//                         <Col xs={12} xl={12} className="min-w-0">
//                             <div className="form-group mb0">
//                                 {/* <label className="control-label-left">{TIME_ZONE}</label> */}
//                                 {timezoneFieldsBlock}
//                             </div>
//                         </Col>
//                     )}
//                 </Row>

//                 {showPopup && (
//                     <SendTimeOptimization
//                         oncancel={() => {
//                             setShowPopup(false);
//                             setValue(sendTimeRecommendationName, false);
//                         }}
//                         onAgree={(status) => {
//                             if (status) {
//                                 setValue(sendTimeRecommendationName, true);
//                                 setShowPopup(false);
//                             }
//                         }}
//                     />
//                 )}
//                 {isWarningPopupShow && (
//                     <WarningPopup
//                         show={isWarningPopupShow?.show}
//                         text={isWarningPopupShow?.message}
//                         showCancel
//                         handleClose={(status) => {
//                             if (status === 0) {
//                                 setValue(schedulerName, isWarningPopupShow?.scheduleTime);
//                                 setIsWarningPopupShow({
//                                     show: false,
//                                     scheduleTime: '',
//                                 });
//                             } else {
//                                 setIsWarningPopupShow({
//                                     show: false,
//                                     scheduleTime: '',
//                                 });
//                             }
//                         }}
//                     />
//                 )}
//                 {isRFAPopupShow?.show && (
//                     <WarningPopup
//                         show={isRFAPopupShow?.show}
//                         text="To save campaign as draft RFA will be removed. Do you wish to continue?"
//                         showCancel
//                         isPrimary={true}
//                         isPrimaryText="OK"
//                         handleClose={(status) => {
//                             if (status === 1) {
//                                 clearRFADetails();
//                                 setTimeout(() => {
//                                     unregister(schedulerName);
//                                 }, 200);
//                                 setIsRFAPopupShow({
//                                     show: false,
//                                     scheduleTime: '',
//                                 });
//                             } else {
//                                 setIsRFAPopupShow({
//                                     show: false,
//                                     scheduleTime: '',
//                                 });
//                             }
//                         }}
//                     />
//                 )}
//             </>
//         );
//     }

//     return (
//         <>
//             <Row className="bg-tertiary-blue py30">
//                 <div className="form-group mb0">
//                     <Row>
//                         <Col sm={isSplitABScheduler ? 2 :{ offset: 1, span: 2 }}>
//                             <label className="control-label-left">{SCHEDULE}</label>
//                         </Col>
//                         <Col sm={isSplitABScheduler ? 10 : 6}>
//                             {schedulePickerBlock}
//                         </Col>
//                     </Row>
//                 </div>
//             </Row>
//             {isTimeZone && (
//             <div className={`form-group ${isTimeZone ? '' : ''}`}>
//                 <Row className={`${isTimeZone ? 'bg-tertiary-blue py30' : ''}`}>
//                         <>
//                             <Col sm={isSplitABScheduler ? 2 :{ offset: 1, span: 2 }}>
//                                 <label className="control-label-left">{TIME_ZONE}</label>
//                             </Col>
//                             <Col sm={isSplitABScheduler ? 10 : 6}>
//                                 {timezoneFieldsBlock}
//                             </Col>
//                         </>
//                 </Row>
//             </div>
//             )}

//             {showPopup && (
//                 <SendTimeOptimization
//                     oncancel={() => {
//                         setShowPopup(false);
//                         setValue(sendTimeRecommendationName, false);
//                     }}
//                     onAgree={(status) => {
//                         if (status) {
//                             setValue(sendTimeRecommendationName, true);
//                             setShowPopup(false);
//                         }
//                     }}
//                 />
//             )}
//             {isWarningPopupShow && (
//                 <WarningPopup
//                     show={isWarningPopupShow?.show}
//                     text={isWarningPopupShow?.message}
//                     showCancel
//                     handleClose={(status) => {
//                         if (status === 0) {
//                             setValue(schedulerName, isWarningPopupShow?.scheduleTime);
//                             setIsWarningPopupShow({
//                                 show: false,
//                                 scheduleTime: '',
//                             });
//                         } else {
//                             setIsWarningPopupShow({
//                                 show: false,
//                                 scheduleTime: '',
//                             });
//                         }
//                     }}
//                 />
//             )}
//             {isRFAPopupShow?.show && (
//                 <WarningPopup
//                     show={isRFAPopupShow?.show}
//                     text="To save campaign as draft RFA will be removed. Do you wish to continue?"
//                     showCancel
//                     isPrimary={true}
//                     isPrimaryText="OK"
//                     handleClose={(status) => {
//                         if (status === 1) {
//                             clearRFADetails();
//                             setTimeout(() => {
//                                 unregister(schedulerName);
//                             }, 200);
//                             setIsRFAPopupShow({
//                                 show: false,
//                                 scheduleTime: '',
//                             });
//                         } else {
//                             setIsRFAPopupShow({
//                                 show: false,
//                                 scheduleTime: '',
//                             });
//                         }
//                     }}
//                 />
//             )}
//         </>
//     );
// };

// export default Scheduler;

export { default } from 'Pages/KendoDocs/CommonComponents/ResScheduler'