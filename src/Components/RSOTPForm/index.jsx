import { SENDING_OTP, VALIDATING_OTP, VALID_OTP } from 'Constants/GlobalConstant/Placeholders';
import { alert_medium, circle_tick_medium, in_progress_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import RSTimer from 'Components/RSTimer';
import RSInput from 'Components/FormFields/RSInput';
import { CommonSkeleton } from 'Components/Skeleton/Components/SkeletonOverall.jsx';
import { allowedKeyCodes } from 'Utils/modules/inputValidators';
import { decryptWithAES } from 'Utils/modules/crypto';
import { useForm } from 'react-hook-form';
import { maskEmailTwoCharsBeforeAndAfterDomain , maskPhoneTwoDigitsInMiddle} from 'Utils/modules/masking';
const OtpInputCellsSkeleton = ({ prefix = '', includePrefixSlot = false }) => (
    <div className="inputs rs-otp-container rs-otp-skeleton-container">
        <Row className="align-items-center flex-nowrap ml0 row">
            {includePrefixSlot && (
                <Col className="pl0 rs-otp-skeleton-col rs-otp-prefix-skeleton-col">
                    {prefix ? (
                        <span className="rs-otp-prefix-label">{prefix}-</span>
                    ) : (
                        <CommonSkeleton
                            box
                            stopAnimation
                            width={50}
                            height={24}
                            className="rs-otp-skeleton-cell"
                        />
                    )}
                </Col>
            )}
            {Array.from({ length: 6 }).map((_, index) => (
                <Col key={`otp-skeleton-${index}`} className="pl0 rs-otp-skeleton-col">
                    <CommonSkeleton
                        box
                        stopAnimation
                        width={40}
                        height={24}
                        className="rs-otp-skeleton-cell"
                    />
                </Col>
            ))}
        </Row>
    </div>
);

const OtpInputSkeleton = OtpInputCellsSkeleton;

const OtpTimerSkeleton = () => (
    <CommonSkeleton
        box
        stopAnimation
        width={110}
        height={14}
        className="rs-otp-timer-skeleton position-absolute mt10"
    />
);

const getOtpAlertIconClassName = ({ iconClass, iconBg, compact = true }) => {
    const iconPadding = compact ? 'p5' : 'p8 border-tlr7 border-blr7';
    return `position-relative mr10 d-flex align-items-center p8 border-tlr7 border-blr7 white ${iconPadding} white ${iconClass} ${iconBg} icon-md`;
};

export const OtpSendingAlert = ({
    show = false,
    message = SENDING_OTP,
    className = 'mb30 border-r7',
    compact = true,
}) => {
    if (!show) return null;

    return (
        <div className={`alert alert-inProgress align-items-stretch ${className}`}>
            <i
                className={getOtpAlertIconClassName({
                    iconClass: in_progress_medium,
                    iconBg: 'bg-blue-medium',
                    compact,
                })}
            />
            <span className="align-items-center d-flex">{message}</span>
        </div>
    );
};

export const OtpValidatingAlert = ({
    show = false,
    message = VALIDATING_OTP,
    className = 'mb30 border-r7',
    compact = true,
}) => {
    if (!show) return null;

    return (
        <div className={`alert alert-inProgress align-items-stretch ${className}`}>
            <i
                className={getOtpAlertIconClassName({
                    iconClass: in_progress_medium,
                    iconBg: 'bg-blue-medium',
                    compact,
                })}
            />
            <span className="align-items-center d-flex">{message}</span>
        </div>
    );
};

export const OtpValidationResultAlert = ({
    show = false,
    isOtpValid = false,
    otpMessage = '',
    validMessage = VALID_OTP,
    invalidVariant = 'danger',
    className = 'mb10',
    compact = true,
    iconClass: customIconClass = '',
}) => {
    if (!show) return null;

    const invalidAlertClass = invalidVariant === 'warning' ? 'alert-warning' : 'alert-danger';
    const invalidIconBg = invalidVariant === 'warning' ? 'bg-orange-medium' : 'bg-primary-red';
    const alertClass = isOtpValid ? 'alert-success' : invalidAlertClass;
    const iconClass = isOtpValid ? circle_tick_medium : alert_medium;
    const iconBg = isOtpValid ? 'bg-primary-green' : invalidIconBg;

    return (
        <div className={`alert ${alertClass} ${className} align-items-stretch `}>
            <i className={getOtpAlertIconClassName({ iconClass: `${iconClass} ${customIconClass}`.trim(), iconBg, compact })}></i>
            <span className='align-items-center d-flex'>{isOtpValid ? validMessage : otpMessage}</span>
        </div>
    );
};

export const OtpRequestSuccessAlert = ({
    show = false,
    message = '',
    className = '',
    compact = true,
}) => (
    <OtpValidationResultAlert
        show={show && message != null && message !== ''}
        isOtpValid
        validMessage={message}
        className={className}
        compact={compact}
    />
);

export const OtpModalAlerts = ({
    isOtpRequestLoading = false,
    isOtpValidateLoading = false,
    flag = false,
    isOtp = false,
    otpMessage = '',
    message = null,
    hideSuccessWhenFlag = false,
    hideSuccessDuringValidation = true,
    sendingAlertProps = {},
    validatingAlertProps = {},
    validationResultProps = {},
    successAlertProps = {},
    slotClassName = 'rs-otp-modal-alerts-slot',
    keepSlotMounted = false,
}) => {
    const showSuccessMessage =
        message != null &&
        message !== '' &&
        !isOtpRequestLoading &&
        (!hideSuccessDuringValidation || !isOtpValidateLoading) &&
        (!hideSuccessWhenFlag || !flag);

    const showSending = isOtpRequestLoading;
    const showValidating = !isOtpRequestLoading && isOtpValidateLoading;
    const showValidation = !isOtpRequestLoading && !isOtpValidateLoading && flag;
    const showSuccess =
        !isOtpRequestLoading && !isOtpValidateLoading && !flag && showSuccessMessage;
    const hasAlert = showSending || showValidating || showValidation || showSuccess;

    if (!hasAlert && !keepSlotMounted) return null;

    if (!hasAlert && keepSlotMounted) {
        return (
            <div
                className={`${slotClassName} rs-otp-crossfade`}
                aria-hidden="true"
            />
        );
    }

    return (
        <div className={`${slotClassName} has-alert rs-otp-crossfade`}>
            <div className={`rs-otp-crossfade-pane ${showSending ? 'is-active' : ''}`}>
                <OtpSendingAlert show {...sendingAlertProps} />
            </div>
            <div className={`rs-otp-crossfade-pane ${showValidating ? 'is-active' : ''}`}>
                <OtpValidatingAlert show {...validatingAlertProps} />
            </div>
            <div className={`rs-otp-crossfade-pane ${showValidation ? 'is-active' : ''}`}>
                <OtpValidationResultAlert
                    show
                    isOtpValid={isOtp}
                    otpMessage={otpMessage}
                    {...validationResultProps}
                />
            </div>
            <div className={`rs-otp-crossfade-pane ${showSuccess ? 'is-active' : ''}`}>
                <OtpRequestSuccessAlert show message={message} {...successAlertProps} />
            </div>
        </div>
    );
};

const RSOTPForm = ({
    otpSuccess = () => {},
    otpShow = () => {},
    validateOTP = () => {},
    isOTPValid = false,
    isResendOTPValid = () => {},
    otpClass = 'otpValue',
    disabled = false,
    scenarioType = 'loginUser',
    isAccountSetup = false,
    className = '',
    otpMessage = true,
    prefix= '',
    showTimer = true,
    isLoading = false,
    isOtpValidateLoading = false,
}) => {
    const [{ first, second, third, fourth, fifth, sixth }, setOtp] = useState({
        first: '',
        second: '',
        third: '',
        fourth: '',
        fifth: '',
        sixth: '',
    });
    const [isOTP, setIsOTP] = useState(isOTPValid);
    const otpValue = first + second + third + fourth + fifth + sixth;
    const { isOtpModalShow, phoneNo, emailId, sessionEmail } = useSelector(({ newUserReducer = {} }) => newUserReducer);
    const { emailID, forgotEmail } = useSelector(({ loginReducer = {} }) => loginReducer);
    const { data } = useSelector(({ myProfileReducer = {} }) => myProfileReducer || {});
    const myprofileEmail = data?.userinfo?.email;
    const myprofilePhoneNo = data?.userinfo?.phoneNo;

    const { control, setFocus, reset, setValue } = useForm();
    useEffect(() => {
        setFocus('first');
    }, []);

    useEffect(() => {
        const hasCompleteOtp = Boolean(first && second && third && fourth && fifth && sixth);
        const prefixedOtp = prefix && hasCompleteOtp ? `${prefix}-${otpValue}` : otpValue;
        if (hasCompleteOtp) {
            validateOTP(otpValue, prefixedOtp);
            if (document.activeElement && document.activeElement.blur) {
                document.activeElement.blur();
            }
        } else {
            validateOTP('', '');
        }
    }, [otpValue, first, second, third, fourth, fifth, sixth]);

    const tabChangeValue = (val, next, e, prev, curr) => {
        const { key, ctrlKey, metaKey } = e;
        const ele = document.querySelectorAll(`.${otpClass}`);
        const otpFields = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'];
        const currentFieldIndex = val - 1;
        
        if (key === 'ArrowLeft') {
            e.preventDefault();
            if (currentFieldIndex > 0) {
                setFocus(otpFields[currentFieldIndex - 1]);
            }
            return;
        }
        
        if (key === 'ArrowRight') {
            e.preventDefault();
            if (currentFieldIndex < 5) {
                setFocus(otpFields[currentFieldIndex + 1]);
            }
            return;
        }
        
        const filled = Array.from(ele).some((element) => element.value !== '');
        
        if (
            !(
                (ctrlKey && (key === 'c' || key === 'C' || key === 'v' || key === 'V')) ||
                (metaKey && (key === 'c' || key === 'C' || key === 'v' || key === 'V'))
            ) &&
            !allowedKeyCodes.has(key) &&
            key !== 'ArrowLeft' &&
            key !== 'ArrowRight'
        ) {
            e.preventDefault();
        }
        
        if (filled) {
            const tempValue = Array.from(ele)
                .map((element) => element.value)
                .join('');
            if (tempValue?.length === 6) {
                otpSuccess(true);
                otpShow(true);
            } else {
                otpSuccess(false);
            }
            
            if (key === 'Backspace') {
                if (ele[currentFieldIndex]?.value === '') {
                    if (currentFieldIndex > 0) {
                        const prevField = otpFields[currentFieldIndex - 1];
                        setFocus(prevField);
                        setOtp((prev) => ({ ...prev, [prevField]: '' }));
                        setValue(prevField, '');
                    }
                } else {
                    setOtp((prev) => ({ ...prev, [curr]: '' }));
                    if (val === 6) {
                        setTimeout(() => setFocus(prev), 0);
                    }
                }
                otpSuccess(false);
                otpShow(true);
            } else if (allowedKeyCodes.has(key) && key !== 'Backspace') {
                // Digit entry is handled in onChange to avoid duplicate chars in Firefox.
            }
        } else {
            validateOTP('', '');
            if (allowedKeyCodes.has(key) && key !== 'Backspace') {
                // Digit entry is handled in onChange to avoid duplicate chars in Firefox.
            } else if (key === 'Backspace') {
                setOtp((prev) => ({ ...prev, [curr]: '' }));
                setValue(curr, '');
            } else {
                setFocus('first');
            }
        }
    };

    const handlePaste = (event) => {
        event.preventDefault();
        const pastedText = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!pastedText) return;
        const focusedElement = document.activeElement;

        const focusedName = focusedElement?.getAttribute('name');
        const otpFields = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'];
        const startIndex = focusedName ? otpFields.indexOf(focusedName) : 0;
        const currentValues = { first, second, third, fourth, fifth, sixth };
        const newOtpState = { ...currentValues };

        pastedText.split('').forEach((digit, index) => {
            const fieldIndex = startIndex + index;
            if (fieldIndex < 6) {
                newOtpState[otpFields[fieldIndex]] = digit;
                setValue(otpFields[fieldIndex], digit);
            }
        });

        setOtp(newOtpState);

        const nextEmptyIndex = startIndex + pastedText?.length;
        if (nextEmptyIndex < 6) {
            setFocus(otpFields[nextEmptyIndex]);
        }

        // const newOtpValue = Object.values(newOtpState).join('');
        // if (newOtpValue?.length === 6) {
        //     otpSuccess(true);
        //     otpShow(true);
        //     validateOTP(newOtpValue);
        // } else {
        //     validateOTP(newOtpValue);
        // }
    };
    
    const handleOtpChange = (field, nextField, shouldBlur = false) => ({ target: { value } }) => {
        const sanitizedValue = (value || '').replace(/\D/g, '').slice(-1);
        setOtp((prev) => ({ ...prev, [field]: sanitizedValue }));
        setValue(field, sanitizedValue);
        if (sanitizedValue && nextField) {
            setTimeout(() => setFocus(nextField), 0);
        }
        if (sanitizedValue && shouldBlur) {
            const input = document.querySelector('#sixth');
            if (input) input.blur();
        }
    };

    // Generate OTP message based on available contact information
    const getOtpMessage = () => {
        const sessionCredentials = localStorage.getItem('sessionCredentials');
        let sessionEmailId = null;
        if(sessionCredentials){
            const sessionCredentialsParsed = JSON.parse(decryptWithAES(sessionCredentials));
            sessionEmailId = sessionCredentialsParsed.email;
        }
        
        const phone = phoneNo || myprofilePhoneNo;
        const email = emailID || emailId ||  forgotEmail || myprofileEmail || sessionEmail || sessionEmailId;
        const validPhone = phone && phone !== 'undefined' ? phone : null;
        const validEmail = email && email !== 'undefined' ? email : null;
        
        if (validPhone && validEmail) {
            return `OTP sent to ${maskPhoneTwoDigitsInMiddle(validPhone)} & ${maskEmailTwoCharsBeforeAndAfterDomain(validEmail)}`;
        } else if (validEmail) {
            return `OTP sent to ${maskEmailTwoCharsBeforeAndAfterDomain(validEmail)}`;
        } else if (validPhone) {
            return `OTP sent to ${maskPhoneTwoDigitsInMiddle(validPhone)}`;
        } else {
            return 'OTP sent successfully';
        }
    };

    return (
        <div className={`rs-otp-form ${className}`}>
            {otpMessage && !isOtpValidateLoading && (
                <small className="mb11 ">{getOtpMessage()}</small>
            )}
            <div className={`form-group rs-otp-form-body mb0 ${isOtpModalShow ? 'mt14' : ''}`}>
                <div
                    className={`d-flex align-items-center rs-otp-input-row ${
                        isAccountSetup ? 'pt5' : ''
                    } ${isOTPValid || isLoading ? 'pe-none' : 'justify-content-center'}`}
                >
                    <div className="rs-otp-crossfade w-100">
                        <div className={`rs-otp-crossfade-pane ${isLoading ? 'is-active' : ''}`}>
                            <OtpInputSkeleton prefix={prefix} includePrefixSlot />
                        </div>
                        <div
                            className={`rs-otp-crossfade-pane d-flex align-items-center ${
                                !isLoading ? 'is-active' : ''
                            }`}
                        >
                            {prefix && <div className="rs-otp-prefix">{prefix}-</div>}
                            <div id="otp" className="inputs rs-otp-container">
                                <Row className="ml0">
                                <Col className="pl0">
                                    <RSInput
                                        className={`text-center ${otpClass}`}
                                        name="first"
                                        control={control}
                                        id="first"
                                        maxLength={1}
                                        handleOnchange={handleOtpChange('first', 'second')}
                                        onKeyDown={(e) => tabChangeValue(1, 'second', e, 'first', 'first')}
                                        handleOnPaste={handlePaste}
                                        disableMaxLengthWarning={true}
                                    />
                                </Col>
                                <Col className="pl0">
                                    <RSInput
                                        className={`text-center ${otpClass}`}
                                        name="second"
                                        control={control}
                                        id="second"
                                        maxLength={1}
                                        handleOnchange={handleOtpChange('second', 'third')}
                                        onKeyDown={(e) => tabChangeValue(2, 'third', e, 'first', 'second')}
                                        handleOnPaste={handlePaste}
                                        disableMaxLengthWarning={true}
                                    />
                                </Col>
                                <Col className="pl0">
                                    <RSInput
                                        className={`text-center ${otpClass}`}
                                        name="third"
                                        control={control}
                                        id="third"
                                        maxLength={1}
                                        handleOnchange={handleOtpChange('third', 'fourth')}
                                        onKeyDown={(e) => tabChangeValue(3, 'fourth', e, 'second', 'third')}
                                        handleOnPaste={handlePaste}
                                        disableMaxLengthWarning={true}
                                    />
                                </Col>
                                <Col className="pl0">
                                    <RSInput
                                        className={`text-center ${otpClass}`}
                                        name="fourth"
                                        control={control}
                                        id="fourth"
                                        maxLength={1}
                                        handleOnchange={handleOtpChange('fourth', 'fifth')}
                                        onKeyDown={(e) => tabChangeValue(4, 'fifth', e, 'third', 'fourth')}
                                        handleOnPaste={handlePaste}
                                        disableMaxLengthWarning={true}
                                    />
                                </Col>
                                <Col className="pl0">
                                    <RSInput
                                        className={`text-center ${otpClass}`}
                                        name="fifth"
                                        control={control}
                                        id="fifth"
                                        maxLength={1}
                                        handleOnchange={handleOtpChange('fifth', 'sixth')}
                                        onKeyDown={(e) => tabChangeValue(5, 'sixth', e, 'fourth', 'fifth')}
                                        handleOnPaste={handlePaste}
                                        disableMaxLengthWarning={true}
                                    />
                                </Col>
                                <Col className="pl0">
                                    <RSInput
                                        className={`text-center ${otpClass}`}
                                        name="sixth"
                                        control={control}
                                        id="sixth"
                                        maxLength={1}
                                        handleOnchange={handleOtpChange('sixth', '', true)}
                                        onKeyDown={(e) => tabChangeValue(6, '', e, 'fifth', 'sixth')}
                                        handleOnPaste={handlePaste}
                                        disableMaxLengthWarning={true}
                                    />
                                </Col>
                            </Row>
                        </div>
                        </div>
                    </div>
                </div>
                {showTimer && !isOTPValid && (
                    <div className="rs-otp-timer-slot d-flex justify-content-between">
                        <div className="rs-otp-crossfade w-100">
                            <div className={`rs-otp-crossfade-pane ${isLoading ? 'is-active' : ''}`}>
                                <OtpTimerSkeleton />
                            </div>
                            <div className={`rs-otp-crossfade-pane ${!isLoading ? 'is-active' : ''}`}>
                                <RSTimer
                            resendEnable={() => {
                                reset((formState) => ({
                                    ...formState,
                                    first: '',
                                    second: '',
                                    third: '',
                                    fourth: '',
                                    fifth: '',
                                    sixth: '',
                                }));
                                isResendOTPValid(otpValue);
                                setOtp({
                                    first: '',
                                    second: '',
                                    third: '',
                                    fourth: '',
                                    fifth: '',
                                    sixth: '',
                                });
                            }}
                            scenarioType={scenarioType}
                        />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

RSOTPForm.propTypes = {
    validateOTP: PropTypes.func,
    isOTPValid: PropTypes.bool.isRequired,
    otpSuccess: PropTypes.func,
    otpShow: PropTypes.func,
    isResendOTPValid: PropTypes.func,
    otpClass: PropTypes.string,
    isLoading: PropTypes.bool,
    isOtpValidateLoading: PropTypes.bool,
};

export default RSOTPForm;
