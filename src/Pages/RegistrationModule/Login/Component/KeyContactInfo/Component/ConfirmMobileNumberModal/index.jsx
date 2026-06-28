import { Fragment, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import RSModal from 'Components/RSModal';
import RSOTPForm, { OtpModalAlerts } from 'Components/RSOTPForm';

import { updateOtpPrefix, updateOtpToken, updateOtpValidState, updateUserFormState } from 'Reducers/login/newUser/reducer';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { requestOTP, validateNewUserOTP } from 'Reducers/login/newUser/request';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';

const OTP_FIELD_LOADER_CONFIG = { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.FIELD };

let otpValue = '';
const ConfirmMobileNumber = ({ confirm, handleClose, show: showModal, phoneState }) => {
    const dispatch = useDispatch();
    const methods = useForm({
        mode: 'onTouched',
    });
    const { control, setFocus } = methods;
    const { token, isOtpValid, showFlag, emailId, prefix } = useSelector(({ newUserReducer }) => newUserReducer);
    const { otpMessage } = useSelector(({ loginReducer }) => loginReducer);

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

    const [show, setShow] = useState(false);
    const [state, setState] = useState({
        isOtpValid: false,
        isConfirm: true,
    });
    const [message, setMessage] = useState(null);

    useEffect(() => {
        setShow(showModal);
    }, [showModal]);
    useEffect(() => {
        dispatch(updateOtpToken(null));
        dispatch(updateOtpPrefix(''));
        dispatch(
            updateOtpValidState({
                isOtpValid: false,
                showFlag: false,
            }),
        );
        confirm(true);
    }, [isOtpValid]);

    const onCancel = (type) => {
        setState({
            isOtpValid: false,
            isConfirm: true,
        });
        dispatch(
            updateOtpValidState({
                isOtpValid: false,
                showFlag: false,
            }),
        );
        dispatch(updateOtpToken(null));
        dispatch(updateOtpPrefix(''));
        requestOtpApi.reset();
        validateOtpApi.reset();
        handleClose(!!type);
        setMessage('');
    };

    const sendRequestOtp = async ({ resend = false } = {}) => {
        const { number, dialCode } = phoneState;
        const mobileNumber = number.slice(dialCode?.length);
        const payload = {
            phoneNo: mobileNumber,
            countryCodeMobile: dialCode,
            emailId,
        };

        if (resend) {
            dispatch(
                updateOtpValidState({
                    isOtpValid: false,
                    showFlag: false,
                    otpMessage: 'OTP resent successfully',
                }),
            );
        }

        await requestOtpApi.refetch({
            fetcher: () => dispatch(requestOTP({ payload, setMessage, resend, loading: false })),
            loaderConfig: OTP_FIELD_LOADER_CONFIG,
            mode: 'create',
        });
    };

    const handleValidateOtp = async (otpToUse) => {
        const payload = {
            otpToken: token,
            otp: otpToUse,
        };

        await validateOtpApi.refetch({
            fetcher: () => dispatch(validateNewUserOTP({ payload, setMessage, loading: false })),
            loaderConfig: OTP_FIELD_LOADER_CONFIG,
            mode: 'create',
        });
    };

    const isOtpValidateLoading = validateOtpApi.isFetching;
    const isOtpSendLoading = requestOtpApi.isFetching;

    const maskPhoneNumber = (phone = '') => {
        if (!phone) return '';

        const cleanPhone = phone.replace(/-/g, ''); // remove any hyphens
        const visibleStart = cleanPhone.slice(0, 3); // show first 2 chars
        const visibleEnd = cleanPhone.slice(-4); // show last 4 digits
        const maskedLength = cleanPhone.length - 6; // total mask length (middle part)

        const maskedMiddle = '*'.repeat(maskedLength > 0 ? maskedLength : 0);

        return `${visibleStart} ${maskedMiddle}${visibleEnd}`;
    };


    return (
        <RSModal
            show={show}
            handleClose={onCancel}
            size={'modal-md'}
            header={state?.isOtpValid ? 'One-time password verification' : 'Confirm mobile number'}
            // isCloseButton={!state.isOtpValid}
            onEscapeKeyDown={(e) => {
                if (!state.isOtpValid) e.preventDefault();
            }}
            body={
                <FormProvider {...methods}>
                    <div>
                        {(isOtpSendLoading || isOtpValidateLoading || showFlag || message) && (
                            <OtpModalAlerts
                                isOtpRequestLoading={isOtpSendLoading}
                                isOtpValidateLoading={isOtpValidateLoading}
                                flag={showFlag}
                                isOtp={isOtpValid}
                                otpMessage={otpMessage}
                                message={message}
                                hideSuccessWhenFlag={showFlag}
                                validationResultProps={{
                                    invalidVariant: 'warning',
                                    className: 'border-r7 align-items-stretch mb19',
                                    compact: false,
                                }}
                                successAlertProps={{
                                    className: 'border-r7 align-items-stretch mb19',
                                    compact: false,
                                }}
                                validatingAlertProps={{
                                    className: 'border-r7 mb19',
                                }}
                            />
                        )}
                        {!state.isOtpValid && (
                            <>
                                Please confirm your mobile number {maskPhoneNumber(phoneState?.value)} to receive the One-Time Password (OTP)
                            </>
                        )}
                        {state.isOtpValid && (
                            <div
                                className={
                                    isOtpValidateLoading || isOtpSendLoading
                                        ? 'pe-none click-off opacity-75'
                                        : ''
                                }
                            >
                                <RSOTPForm
                                    isLoading={isOtpSendLoading}
                                    isOtpValidateLoading={isOtpValidateLoading}
                                    isOTPValid={isOtpValid}
                                    isAccountSetup={true}
                                    isResendOTPValid={async () => {
                                        if (isOtpValidateLoading) return;
                                        await sendRequestOtp({ resend: true });
                                    }}
                                    validateOTP={(otp, prefixedOtp) => {
                                        if (isOtpValidateLoading) return;
                                        if (otp?.length === 6) {
                                            const otpToUse =
                                                prefixedOtp && prefixedOtp.length ? prefixedOtp : otp;
                                            otpValue = otpToUse;
                                            handleValidateOtp(otpToUse);
                                        } else if (isOtpValid || showFlag) {
                                            dispatch(
                                                updateOtpValidState({
                                                    isOtpValid: false,
                                                    showFlag: false,
                                                }),
                                            );
                                            dispatch(updateUserFormState({ otp: '' }));
                                        }
                                    }}
                                    prefix={prefix}
                                />
                            </div>
                        )}
                    </div>
                </FormProvider>
            }
            footer={
                <Fragment>
                    {!state.isOtpValid && (
                        <RSSecondaryButton onClick={() => onCancel('edit')}>Change</RSSecondaryButton>
                    )}
                    {state.isOtpValid && (
                        <RSPrimaryButton
                            className={`${isOtpValid ? '' : 'click-off'}`}
                            onClick={() => {
                                dispatch(updateOtpToken(null));
                                dispatch(updateOtpPrefix(''));
                                dispatch(
                                    updateOtpValidState({
                                        isOtpValid: false,
                                        showFlag: false,
                                    }),
                                );
                                confirm(true);
                            }}
                        >
                            Confirm
                        </RSPrimaryButton>
                    )}
                    {state.isConfirm && (
                        <RSPrimaryButton
                            isLoading={isOtpSendLoading}
                            onClick={async () => {
                                setState({
                                    isOtpValid: true,
                                    isConfirm: false,
                                });
                                await sendRequestOtp();
                            }}
                        >
                            Confirm
                        </RSPrimaryButton>
                    )}
                </Fragment>
            }
        />
    );
};

export default ConfirmMobileNumber;
