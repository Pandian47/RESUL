import { CANCEL } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useMemo, useState } from 'react';
import { Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FormProvider, useForm } from 'react-hook-form';
import { v4 as uuid } from 'uuid';

import RSOTPForm, { OtpModalAlerts } from 'Components/RSOTPForm';
import { RSSecondaryButton } from 'Components/Buttons';
import { checkNewUserEmailOTP, checkNewUserValidateEmailOTP, saveNewUserEmail } from 'Reducers/login/newUser/request';
import { resetNewUserFormState, updateOtpValidState } from 'Reducers/login/newUser/reducer';
import { iv, encryptWithAES } from 'Utils/modules/crypto';
import { GeneratePasswordpseudorandom } from 'Utils/modules/passwordUtils';
import CryptoJS from 'crypto-js';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';

const OTP_FIELD_LOADER_CONFIG = { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.FIELD };

const LoginOTP = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const methods = useForm({
        mode: 'onTouched',
    });

    const { isOtpValid, showFlag, otpMessage, hasValue, newUserEmailId, token, emailId, prefix, isOtpModalShow } =
        useSelector(({ newUserReducer }) => newUserReducer);

    const { handleSubmit: formSubmit, setError } = methods;

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

    const [message, setMessage] = useState('');
    const [isResend, setIsResend] = useState(false);

    const otpSuccessMessage = useMemo(() => {
        if (message) return message;
        if (!isResend && token?.token) return 'OTP sent successfully';
        return '';
    }, [message, token, isResend]);

    const handleSubmit = () => {
        const hasValueLocal = GeneratePasswordpseudorandom(16);
        const byteHash = CryptoJS.enc.Utf8.parse(hasValueLocal);
        const tempiv = iv;
        const payload = {
            w_emaild: emailId,
            emailId: encryptWithAES(CryptoJS.enc.Utf8.parse(emailId), byteHash, tempiv),
            hashval: btoa(GeneratePasswordpseudorandom(3) + hasValueLocal + GeneratePasswordpseudorandom(3)),
        };
        dispatch(saveNewUserEmail({ payload, setError, navigate }));
    };

    const resendOTP = async () => {
        const payload = {
            emailId: newUserEmailId,
            hashval: hasValue,
        };
        const UniqueID = uuid();

        dispatch(
            updateOtpValidState({
                isOtpValid: false,
                showFlag: false,
                otpMessage: '',
            }),
        );
        setMessage('OTP resent successfully');
        setIsResend(true);

        await requestOtpApi.refetch({
            fetcher: () => dispatch(checkNewUserEmailOTP({ payload, uniqueId: UniqueID, loading: false })),
            loaderConfig: OTP_FIELD_LOADER_CONFIG,
            mode: 'create',
        });
    };

    const handleValidateOtp = async (otpToUse) => {
        const payload = {
            otpToken: token?.token,
            otp: otpToUse,
        };

        await validateOtpApi.refetch({
            fetcher: () =>
                dispatch(
                    checkNewUserValidateEmailOTP({
                        payload,
                        handleSubmit,
                        loading: false,
                    }),
                ),
            loaderConfig: OTP_FIELD_LOADER_CONFIG,
            mode: 'create',
        });
    };

    useEffect(() => {
        if (!isResend) {
            const status = token?.token ? 'OTP sent successfully' : '';
            setMessage(status);
        }
    }, [token, isResend]);

    const isOtpValidateLoading = validateOtpApi.isFetching;
    const isInitialOtpPending = isOtpModalShow && !token?.token && !showFlag;
    const isOtpSendLoading = requestOtpApi.isFetching || isInitialOtpPending;

    const showOtpAlerts = isOtpSendLoading || isOtpValidateLoading || showFlag || otpSuccessMessage || otpMessage;

    return (
        <FormProvider {...methods}>
            <div className="forgot-password-modal">
                {showOtpAlerts && (
                        <OtpModalAlerts
                          className = 'position-absolute OTPWidth'
                            isOtpRequestLoading={isOtpSendLoading}
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
                    onSubmit={formSubmit(handleSubmit)}
                    className="d-flex align-items-center "
                    style={{ height: 'calc(100% - 63px)' }}
                >
                    <Col>
                        <div
                            className={`${isOtpValid ? 'pointer-event-none' : ''} ${
                                isOtpValidateLoading || isOtpSendLoading ? 'pe-none click-off opacity-75' : ''
                            } pt0`}
                        >
                            <RSOTPForm
                                isLoading={isOtpSendLoading}
                                isOtpValidateLoading={isOtpValidateLoading}
                                isOTPValid={isOtpValid}
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
                                scenarioType={'newUser'}
                                prefix={prefix}
                            />
                        </div>
                        <div className={`buttons-holder position-relative ${
                                isOtpValidateLoading || isOtpSendLoading ? 'd-none' : ''
                            }`}>
                            <RSSecondaryButton
                                className="p0"
                                type="button"
                                onClick={() => {
                                    requestOtpApi.reset();
                                    validateOtpApi.reset();
                                    dispatch(resetNewUserFormState());
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
