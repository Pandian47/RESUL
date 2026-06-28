import { CANCEL } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FormProvider, useForm } from 'react-hook-form';

import RSOTPForm, { OtpModalAlerts } from 'Components/RSOTPForm';
import { RSSecondaryButton } from 'Components/Buttons';
import {
    validateOTP,
    validateForgotUserOTP,
    loginExistingUser,
    updatePassword,
    forgotPassword,
    confirm_login,
} from 'Reducers/login/existingUser/request';
import { resetLoginFormState, updateOtpValidState } from 'Reducers/login/existingUser/reducer';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';

const OTP_FIELD_LOADER_CONFIG = { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.FIELD };

const LoginOTP = () => {
    const {
        token,
        prefix,
        isOtpValid,
        showFlag,
        otpMessage,
        loginEmail,
        loginPwd,
        isForgot,
        hashval,
        ipAddress,
        countryCode,
        countryName,
        userAgent,
        oauth,
    } = useSelector(({ loginReducer }) => loginReducer);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const methods = useForm({
        mode: 'onTouched',
    });
    const { handleSubmit: formSubmit, setError } = methods;

    const validateOtpApi = useApiLoader({
        autoFetch: false,
        loaderConfig: OTP_FIELD_LOADER_CONFIG,
        mode: 'create',
    });
    const resendOtpApi = useApiLoader({
        autoFetch: false,
        loaderConfig: OTP_FIELD_LOADER_CONFIG,
        mode: 'create',
    });

    const otpValueRef = useRef('');
    const [message, setMessage] = useState('');

    const otpSuccessMessage = useMemo(() => {
        if (message) return message;
        if (token && !showFlag && !otpMessage) return 'OTP sent successfully';
        return '';
    }, [message, token, showFlag, otpMessage]);

    useEffect(() => {
        if (!token) return;
        setMessage(otpMessage || 'OTP sent successfully');
    }, [token]);

    const handleSubmit = () => {
        if (isForgot) {
            const payload = {
                emailId: loginEmail,
                hashval,
                otpToken: token,
                otp: otpValueRef.current,
            };
            dispatch(
                updateOtpValidState({
                    isOtpValid: true,
                    showFlag: false,
                    otpMessage: 'New password sent to your registered email',
                }),
            );
            setTimeout(() => {
                dispatch(updatePassword({ payload }));
            }, 2000);
        } else {
            confirm_LoginAction();
        }
    };

    const confirm_LoginAction = () => {
        const payload = {
            otpToken: token,
            otp: otpValueRef.current,
            countryName,
            countryCode,
        };
        dispatch(confirm_login({ payload, navigate }));
    };

    const resendOTP = async () => {
        dispatch(
            updateOtpValidState({
                isOtpValid: false,
                showFlag: false,
                otpMessage: '',
            }),
        );
        setMessage('OTP resent successfully');

        await resendOtpApi.refetch({
            fetcher: async () => {
                if (!isForgot) {
                    const payload = {
                        loginName: loginEmail,
                        loginPassword: loginPwd,
                        hashval,
                        userAgent,
                        ipAddress,
                        countryName,
                        countryCode,
                        oauth,
                        IsADuser: false,
                    };
                    await dispatch(loginExistingUser({ payload, isLoading: false, resend: true }));
                } else {
                    const payload = {
                        emailId: loginEmail,
                        hashval,
                    };
                    await dispatch(forgotPassword({ payload, setError, loading: false }));
                    dispatch(
                        updateOtpValidState({
                            isOtpValid: true,
                            showFlag: false,
                            otpMessage: 'OTP resent successfully',
                        }),
                    );
                }
                return true;
            },
            loaderConfig: OTP_FIELD_LOADER_CONFIG,
            mode: 'create',
        });
    };

    const handleValidateOtp = async (otpToUse) => {
        otpValueRef.current = otpToUse;

        dispatch(
            updateOtpValidState({
                isOtpValid: false,
                showFlag: false,
                otpMessage: '',
            }),
        );

        const payload = {
            otpToken: token,
            otp: otpToUse,
        };

        await validateOtpApi.refetch({
            fetcher: () =>
                dispatch(
                    isForgot
                        ? validateForgotUserOTP({ payload, navigate, handleSubmit, loading: false })
                        : validateOTP({ payload, handleSubmit, loading: false }),
                ),
            loaderConfig: OTP_FIELD_LOADER_CONFIG,
            mode: 'create',
        });
    };

    const isOtpValidateLoading = validateOtpApi.isFetching;
    const isOtpResendLoading = resendOtpApi.isFetching;
    const showOtpAlerts = isOtpResendLoading || isOtpValidateLoading || showFlag || otpSuccessMessage || otpMessage;

    return (
        <FormProvider {...methods}>
            <div className="forgot-password-modal">
                {showOtpAlerts && (
                        <OtpModalAlerts
                            isOtpRequestLoading={isOtpResendLoading}
                            isOtpValidateLoading={isOtpValidateLoading}
                            flag={showFlag}
                            isOtp={isOtpValid}
                            otpMessage={otpMessage}
                            message={otpSuccessMessage}
                            hideSuccessWhenFlag={showFlag}
                            className = 'position-absolute OTPWidth'
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
                    onSubmit={formSubmit(handleSubmit)}
                    className="d-flex align-items-center"
                    style={{ height: 'calc(100% - 63px)' }}
                >
                    <Col>
                        <div
                            className={`${isOtpValid ? 'pointer-event-none' : ''} ${
                                isOtpValidateLoading || isOtpResendLoading ? 'pe-none click-off opacity-75' : ''
                            } pt0`}
                        >
                            <RSOTPForm
                                isOTPValid={isOtpValid}
                                isOtpValidateLoading={isOtpValidateLoading}
                                isResendOTPValid={async () => {
                                    if (isOtpValidateLoading) return;
                                    await resendOTP();
                                }}
                                validateOTP={(otp, prefixedOtp) => {
                                    if (isOtpValidateLoading) return;
                                    const otpToUse = prefixedOtp && prefixedOtp.length ? prefixedOtp : otp;
                                    if (otp?.length === 6) {
                                        handleValidateOtp(otpToUse);
                                    }
                                }}
                                prefix={prefix || ''}
                            />
                        </div>
                        <div className="buttons-holder position-relative">
                            <RSSecondaryButton
                                className="p0"
                                type="button"
                                onClick={() => {
                                    validateOtpApi.reset();
                                    resendOtpApi.reset();
                                    dispatch(resetLoginFormState());
                                }}
                            >
                                {CANCEL}
                            </RSSecondaryButton>
                        </div>
                    </Col>
                </form>
            </div>
        </FormProvider>
    );
};

export default LoginOTP;
