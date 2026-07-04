import { useCallback, useEffect, useMemo, useState } from 'react';
import { Col } from 'react-bootstrap';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import RSOTPForm, { OtpModalAlerts } from 'Components/RSOTPForm';
import { RSSecondaryButton } from 'Components/Buttons';
import { requestOTP, validateNewUserOTP } from 'Reducers/login/newUser/request';
import { confirm_login } from 'Reducers/login/existingUser/request';
import { updateOtpValidState } from 'Reducers/login/newUser/reducer';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';

const OTP_FIELD_LOADER_CONFIG = { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.FIELD };

const EmailOTPSetup = ({ onBack, onComplete }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loginEmail, emailID, otpToken, countryCode, countryName } = useSelector(({ loginReducer }) => loginReducer);
    const { token, prefix, isOtpValid, showFlag, otpMessage } = useSelector(({ newUserReducer }) => newUserReducer);
    const methods = useForm({
        mode: 'onTouched',
    });
    const [otpValid, setOtpValid] = useState(false);
    const [otpValue, setOtpValue] = useState('');
    const [otpShow, setOtpShow] = useState(false);
    const [message, setMessage] = useState('');
    const [isResend, setIsResend] = useState(false);

    const requestOtpApi = useApiLoader({
        autoFetch: false,
        loaderConfig: OTP_FIELD_LOADER_CONFIG,
        mode: 'create',
    });
    const validateOtpApi = useApiLoader({
        autoFetch: false,
        loaderConfig: OTP_FIELD_LOADER_CONFIG,
        mode: 'create',
    });

    useEffect(() => {
        dispatch(updateOtpValidState({
            isOtpValid: false,
            showFlag: false,
            otpMessage: '',
        }));
        setMessage('');
        setOtpValid(false);
        setOtpValue('');
        setIsResend(false);
    }, [dispatch]);

    const userEmail = emailID || loginEmail;

    const otpSuccessMessage = useMemo(() => {
        if (message) return message;
        if (!isResend && token?.token) return 'OTP sent successfully';
        return '';
    }, [message, token, isResend]);

    const requestOTPEmail = useCallback(
        async (resend = false) => {
            if (!userEmail) return;

            if (!resend) {
                setMessage('');
            }

            const payload = {
                emailId: userEmail,
                type: 2,
                phoneNo: '',
                countryCodeMobile: '',
            };

            await requestOtpApi.refetch({
                fetcher: () =>
                    dispatch(
                        requestOTP({
                            payload,
                            setMessage: (msg) => setMessage(msg),
                            resend,
                            loading: false,
                        }),
                    ),
                loaderConfig: OTP_FIELD_LOADER_CONFIG,
                mode: 'create',
            });
        },
        [userEmail, dispatch],
    );

    useEffect(() => {
        if (userEmail) {
            requestOTPEmail(false);
        }
    }, [userEmail, requestOTPEmail]);

    useEffect(() => {
        setOtpValid(isOtpValid);
        if (isOtpValid && onComplete && otpValue) {
            onComplete(otpValue);
        }
    }, [isOtpValid, otpValue, onComplete]);

    const resendOTP = async () => {
        setOtpValid(false);
        setOtpValue('');
        setMessage('OTP resent successfully');
        setIsResend(true);
        await requestOTPEmail(true);
    };

    const handleBack = () => {
        // Reset all local state
        setOtpValid(false);
        setOtpValue('');
        setOtpShow(false);
        setMessage('');
        setIsResend(false);
        requestOtpApi.reset();
        validateOtpApi.reset();
        
        dispatch(updateOtpValidState({
            isOtpValid: false,
            showFlag: false,
            otpMessage: '',
        }));
        methods.reset();
        if (onBack) {
            onBack();
        }
    };

    const handleVerify = async (otp, prefixedOtp) => {
        const otpToSend = prefixedOtp && prefixedOtp.length > 6 ? prefixedOtp : otp;
        if (otpToSend && otpToSend.length >= 6 && token) {
            setMessage('');
            const otpTokenValue = typeof token === 'object' && token?.token ? token.token : token;
            const payload = {
                otpToken: otpTokenValue,
                otp: otpToSend,
            };

            await validateOtpApi.refetch({
                fetcher: () =>
                    dispatch(
                        validateNewUserOTP({
                            payload,
                            setMessage: () => {
                                setOtpValid(false);
                                setMessage('');
                            },
                            handleSubmit: () => {
                                const confirmPayload = {
                                    otpToken: otpToken,
                                    otp: otpToSend,
                                    countryName: countryName,
                                    countryCode: countryCode,
                                };
                                dispatch(confirm_login({ payload: confirmPayload, navigate }));
                            },
                            loading: false,
                        }),
                    ),
                loaderConfig: OTP_FIELD_LOADER_CONFIG,
                mode: 'create',
            });
        }
    };

    const isOtpValidateLoading = validateOtpApi.isFetching;
    const isOtpSendLoading = requestOtpApi.isFetching;

    const showOtpAlerts = isOtpSendLoading || isOtpValidateLoading || showFlag || otpSuccessMessage || otpMessage;

    return (
        <FormProvider {...methods}>
            <div className="forgot-password-modal">
                {showOtpAlerts && (
                    <OtpModalAlerts
                        isOtpRequestLoading={isOtpSendLoading}
                        className = 'position-absolute OTPWidth'
                        isOtpValidateLoading={isOtpValidateLoading}
                        flag={showFlag}
                        isOtp={isOtpValid}
                        otpMessage={otpMessage}
                        message={otpSuccessMessage}
                        hideSuccessWhenFlag={showFlag}
                        validationResultProps={{
                            invalidVariant: 'warning',
                            className: 'border-r7 align-items-stretch mb0',
                            compact: false,
                        }}
                        successAlertProps={{
                            className: 'border-r7 align-items-stretch mb0',
                            compact: false,
                        }}
                        sendingAlertProps={{
                            className: 'border-r7 mb0',
                        }}
                        validatingAlertProps={{
                            className: 'border-r7 mb0',
                        }}
                    />
                )}
                <form
                    className="d-flex align-items-center"
                    style={{ height: 'calc(100% - 63px)' }}
                >
                    <Col>
                        <div
                            className={`${otpValid ? 'pointer-event-none' : ''} ${
                                isOtpValidateLoading || isOtpSendLoading ? 'pe-none click-off opacity-75 mb-30-del' : ''
                            } pt0`}
                        >
                            <RSOTPForm
                                isLoading={isOtpSendLoading}
                                isOtpValidateLoading={isOtpValidateLoading}
                                isOTPValid={otpValid}
                                otpShow={(value) => setOtpShow(value)}
                                otpSuccess={(value) => {
                                    if (!value) {
                                        setOtpValid(false);
                                    }
                                }}
                                isResendOTPValid={async () => {
                                    if (isOtpValidateLoading) return;
                                    await resendOTP();
                                }}
                                validateOTP={(otp, prefixedOtp) => {
                                    if (isOtpValidateLoading) return;
                                    if (otp?.length === 6) {
                                        const otpToUse =
                                            prefixedOtp && prefixedOtp.length > 6 ? prefixedOtp : otp;
                                        setOtpValue(otpToUse);
                                        handleVerify(otp, prefixedOtp);
                                    } else {
                                        setMessage('');
                                        setOtpValue('');
                                        dispatch(
                                            updateOtpValidState({
                                                isOtpValid: false,
                                                showFlag: false,
                                                otpMessage: '',
                                            }),
                                        );
                                    }
                                }}
                                prefix={prefix || ''}
                            />
                        </div>
                <div className="text-right mb30-del">
                    <RSSecondaryButton
                        type="button"
                        onClick={handleBack}
                    >
                        Choose different method
                    </RSSecondaryButton>
                </div>
                    </Col>
                </form>
            </div>
        </FormProvider>
    );
};

export default EmailOTPSetup;

