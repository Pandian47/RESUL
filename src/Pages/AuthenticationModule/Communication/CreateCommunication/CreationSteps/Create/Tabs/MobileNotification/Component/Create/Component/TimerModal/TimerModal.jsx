import { convertUTCtoUserTimezone, getDateWithAddMinutes } from 'Utils/modules/dateTime';
import { getmasterData } from 'Utils/modules/masterData';
import { getUserDetails } from 'Utils/modules/crypto';
import { SELECT_SATE_TIME } from 'Constants/GlobalConstant/ValidationMessage';
import { BACKGROUND_COLOR, CANCEL, CUSTOMIZE, DATE_TIME, FONT_COLOR, INSERT, RESET, SELECT_TIMER } from 'Constants/GlobalConstant/Placeholders';
import { colorpicker_bg_medium, colorpicker_text_medium, restart_medium } from 'Constants/GlobalConstant/Glyphicons';
import RSDatetimePicker from 'Components/FormFields/RSDatetimePicker';
import RSModal from 'Components/RSModal';
import useQueryParams from 'Hooks/useQueryParams';
import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { get as _get } from 'Utils/modules/lodashReplacements';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSColorPicker from 'Components/ColorPicker';

import RSTooltip from 'Components/RSTooltip';
import { getUtcTimeData } from 'Reducers/globalState/selector';
import { getUtcTimeNow } from 'Reducers/globalState/request';

const TimerModal = ({ show, handleClose, isSplit, fieldName }) => {
    const { control, watch, setValue , clearErrors} = useFormContext();
    const dispatch = useDispatch();
    const state = useQueryParams('/communication');
    const utcTimeData = useSelector((state) => getUtcTimeData(state));
    
    // Use UTC time from API if available, otherwise fallback to system time
    const currentUTCdateTime = utcTimeData.utcTime ? new Date(utcTimeData.utcTime.replace('Z', '')) : new Date();
    
    const { startDate, endDate } = {
        startDate: _get(state, 'startDate', null) ? new Date(_get(state, 'startDate', null)) : null,
        endDate: new Date(_get(state, 'endDate', null)),
    };
    
    // Get user profile timezone
    const { timeZoneId } = getUserDetails();
    const { timeZoneList } = getmasterData();
    const userTimeZone = timeZoneList?.find((tz) => tz.timeZoneID === timeZoneId);
    
    // Call UTC time API when component mounts
    useEffect(() => {
        dispatch(getUtcTimeNow());
    }, [show]);
    
    // Function to get minimum date and time for the datetime picker
    const getMinDateAndTime = () => {
        if (!startDate) {
            // If no startDate, use current UTC time converted to user timezone + 60 minutes
            const convertedDate = convertUTCtoUserTimezone(currentUTCdateTime);
            return getDateWithAddMinutes(convertedDate, 60);
        }
        
        // Convert UTC time to user profile timezone
        const convertedUTCtoUserTimezone = convertUTCtoUserTimezone(currentUTCdateTime);
        
        // Get only date (not time) from converted date
        const convertedDateOnly = new Date(
            convertedUTCtoUserTimezone.getFullYear(),
            convertedUTCtoUserTimezone.getMonth(),
            convertedUTCtoUserTimezone.getDate()
        );
        
        // Get only date (not time) from startDate
        const startDateOnly = new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate()
        );
        
        // Check if dates are equal
        if (convertedDateOnly.getTime() === startDateOnly.getTime()) {
            // Same date: use converted user profile date and time + 60 minutes
            return getDateWithAddMinutes(convertedUTCtoUserTimezone, 60);
        } else {
            // Different date: set startDate with time 00:00:00
            const minDate = new Date(startDate);
            minDate.setHours(0, 0, 0, 0);
            return minDate;
        }
    };
    
    const minDateAndTime = getMinDateAndTime();
    const timerName = isSplit ? `${fieldName}.timer` : 'timer';
    const remainingTimeName = isSplit ? `${fieldName}.remainingTime` : 'remainingTime';
    const timerTextColorName = isSplit ? `${fieldName}.timerTextColor` : 'timerTextColor';
    const timerBgColorName = isSplit ? `${fieldName}.timerBgColor` : 'timerBgColor';

    const [timer, remainingTime, timerTextColor, timerBgColor] = watch([
        timerName,
        remainingTimeName,
        timerTextColorName,
        timerBgColorName,
    ]);
    const [allValues, setAllValues] = useState({});
    const [initBgValue, setInitBgValue] = useState(timerBgColor);
    const [initTxtValue, setInitTxtValue] = useState(timerTextColor);
    const caluculateTimer = (data) => {
        const currentDateInUserTimezone = convertUTCtoUserTimezone(currentUTCdateTime);
        const currentDate = currentDateInUserTimezone.getTime();
        let selectedDate = new Date(data).getTime();
        var differenceInHours = (selectedDate - currentDate) / (1000 * 60 * 60);
        var days = Math.floor(differenceInHours / 24);

        // Calculate remaining hours
        var remainingHours = differenceInHours % 24;

        // Calculate remaining minutes and seconds
        var totalMinutes = remainingHours * 60;
        var minutes = Math.floor(totalMinutes % 60);
        var seconds = Math.floor((totalMinutes * 60) % 60);

        var result = days + ':' + Math.floor(remainingHours) + ':' + minutes + ':' + seconds;
        setValue(remainingTimeName, result);
        return result;
    };

    const handleInsert = () => {
        setAllValues({
            timer: timer,
            remainingTime: remainingTime,
            txtValue: initTxtValue,
            bgValue: initBgValue,
        });
    };
    const handleCancel = () => {
        setValue(timerName, allValues?.timer)
        setValue(remainingTimeName, allValues?.remainingTime);
        setValue(timerBgColorName, allValues?.bgValue);
        setValue(timerTextColorName, allValues?.txtValue);
        setInitBgValue(allValues?.bgValue);
        setInitTxtValue(allValues?.txtValue);
        // Clear validation errors when modal is closed
        clearErrors(timerName);
    };
    const [popupclass, setPopupclass] = useState(false);
 useEffect(() => {
        if (popupclass) {
            const popupElement = document.querySelector('.k-datetime-container');
            if (popupElement) {
                popupElement.classList.add('Schedule-date');
            }
        } else {
            const popupElement = document.querySelector('.k-datetime-container');
            if (popupElement) {
                popupElement.classList.remove('Schedule-date');
            }
        }
    }, [popupclass]);

    useEffect(() => {
        const handleClickOutside = () => {
            const popupElement = document.querySelector('.k-datetime-container');
            if (!popupElement && popupclass) {
                setPopupclass(false);
            }
        };

        const interval = setInterval(handleClickOutside, 100);
        
        return () => clearInterval(interval);
    }, [popupclass]);
    return (
        <RSModal
            show={show}
            handleClose={() => {
                handleClose(true);
                handleCancel();
            }}
            header={'Timer'}
            className="top-50"
            body={
                <div className="form-group mb0">
                    <div className="form-group">
                        <Row>
                            <Col sm={3}>
                                <label className="control-label-left">{SELECT_TIMER}</label>
                            </Col>
                            <Col sm={6} onClick={() => setPopupclass(!popupclass)}>
                                <RSDatetimePicker
                                    control={control}
                                    name={timerName}
                                    setValue={setValue}
                                    min={minDateAndTime}
                                    //if Time changes to 12 hrs format change HH to hh in the date format
                                    max={new Date(endDate)}
                                    defaultValue={timer || ''}
                                    placeholder={DATE_TIME}
                                    format={'dd MMM, yyyy HH:mm a'}
                                    steps={{
                                        minute: 5,
                                        second: 10,
                                    }}
                                    rules={{
                                        required: SELECT_SATE_TIME,
                                    }}
                                    handleChange={(e) => {
                                        caluculateTimer(e.value);
                                    }}
                                    clearErrors={clearErrors}
                                    handleRemoveVal={(e) => {
                                        setValue(timerName, '');
                                        setValue(remainingTimeName, '');
                                    }}
                                />
                            </Col>
                            {!!timer && !!remainingTime && (
                                <Col sm={3} className="d-flex align-items-center">
                                    <span
                                        className="mr10"
                                        style={{ color: initTxtValue, backgroundColor: initBgValue }}
                                    >
                                        {remainingTime}
                                    </span>
                                    <RSTooltip text={RESET} position="top" className="lh0">
                                        <i
                                            id="rs_data_refresh"
                                            className={`${restart_medium} icon-md color-primary-blue`}
                                            onClick={() => {
                                                setValue(timerName, '');
                                                setValue(remainingTimeName, '');
                                                setValue(timerBgColorName, '');
                                                setValue(timerTextColorName, '');
                                                setInitBgValue('');
                                                setInitTxtValue('');
                                            }}
                                        />
                                    </RSTooltip>
                                </Col>
                            )}
                        </Row>
                    </div>
                    {/* {!!timer && ( */}
                    <div className="form-group mb0">
                        <Row>
                            <Col sm={3}>
                                <label className="control-label-left">{CUSTOMIZE}</label>
                            </Col>
                            <Col sm={9} className="d-flex">
                                <RSTooltip text={BACKGROUND_COLOR} position="top" className=" mr15">
                                    <RSColorPicker
                                        icon={colorpicker_bg_medium}
                                        isOpacity={true}
                                        onSelect={(e) => {
                                            let colorValue;
                                            if (typeof e === 'object' && e.color && e.opacity !== undefined) {
                                                // Handle opacity - convert to hex and append to color
                                                const alpha = Math.round(e.opacity * 255);
                                                const hexOpacity = alpha.toString(16).padStart(2, '0').toUpperCase();
                                                colorValue = `${e.color}${hexOpacity}`;
                                            } else {
                                                // Handle simple color selection without opacity
                                                colorValue = e;
                                            }
                                            setValue(timerBgColorName, colorValue);
                                            setInitBgValue(colorValue);
                                        }}
                                        colorValue={(() => {
                                            const currentValue = initBgValue || timerBgColor || '';
                                            if (typeof currentValue === 'string' && currentValue.length === 9) {
                                                return currentValue.substring(0, 7); // Extract color part
                                            }
                                            return currentValue;
                                        })()}
                                    />
                                </RSTooltip>
                                <RSTooltip text={FONT_COLOR} position="top">
                                    <RSColorPicker
                                        icon={colorpicker_text_medium}
                                        isOpacity={true}
                                        onSelect={(e) => {
                                            let colorValue;
                                            if (typeof e === 'object' && e.color && e.opacity !== undefined) {
                                                // Handle opacity - convert to hex and append to color
                                                const alpha = Math.round(e.opacity * 255);
                                                const hexOpacity = alpha.toString(16).padStart(2, '0').toUpperCase();
                                                colorValue = `${e.color}${hexOpacity}`;
                                            } else {
                                                // Handle simple color selection without opacity
                                                colorValue = e;
                                            }
                                            setValue(timerTextColorName, colorValue);
                                            setInitTxtValue(colorValue);
                                        }}
                                        colorValue={(() => {
                                            const currentValue = initTxtValue || timerTextColor || '';
                                            if (typeof currentValue === 'string' && currentValue.length === 9) {
                                                return currentValue.substring(0, 7); // Extract color part
                                            }
                                            return currentValue;
                                        })()}
                                        defaultIconColor = {'#000000'}
                                    />
                                </RSTooltip>
                            </Col>
                        </Row>
                    </div>
                    {/* )} */}
                </div>
            }
            footer={
                <div className="buttons-holder">
                    <RSSecondaryButton
                        onClick={() => {
                            handleClose(true);
                            handleCancel();
                        }}
                    >
                        {CANCEL}
                    </RSSecondaryButton>
                    <RSPrimaryButton
                        onClick={() => {
                            handleClose(true);
                            handleInsert();
                        }}
                    >
                        {INSERT}
                    </RSPrimaryButton>
                </div>
            }
        />
    );
};

export default TimerModal;
