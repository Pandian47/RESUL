import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import RSModal from 'Components/RSModal';
import RSOTPForm from 'Components/RSOTPForm';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import OTPalertPopup from '../OTPalertPopup';

import { updateOtpPrefix, updateOtpToken, updateOtpValidState } from 'Reducers/login/newUser/reducer';
import { requestParentNameOtp, validateNewUserOTP } from 'Reducers/login/newUser/request';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';

const OTP_FIELD_LOADER_CONFIG = { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.FIELD };

const ParentCompanyAssociationModal = ({
    show,
    keyContactData,
    parentCompanyName,
    onClose,
    onAssociationSuccess,
}) => {
    const dispatch = useDispatch();
    const methods = useForm({ mode: 'onTouched' });
    const { token, isOtpValid, showFlag, otpMessage, prefix } = useSelector(
        ({ newUserReducer }) => newUserReducer,
    );

    const [showOtpStep, setShowOtpStep] = useState(false);
    const [message, setMessage] = useState('');

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
        if (!show) {
            setShowOtpStep(false);
            setMessage('');
            requestOtpApi.reset();
            validateOtpApi.reset();
            dispatch(updateOtpToken(null));
            dispatch(updateOtpPrefix(''));
            dispatch(updateOtpValidState({ isOtpValid: false, showFlag: false, otpMessage: '' }));
        }
    }, [show, dispatch]);

    const resetOtpState = () => {
        dispatch(updateOtpToken(null));
        dispatch(updateOtpPrefix(''));
        dispatch(updateOtpValidState({ isOtpValid: false, showFlag: false, otpMessage: '' }));
    };

    const handleClose = () => {
        resetOtpState();
        setShowOtpStep(false);
        setMessage('');
        requestOtpApi.reset();
        validateOtpApi.reset();
        onClose();
    };

    const sendRequestOtp = async ({ resend = false } = {}) => {
        await requestOtpApi.refetch({
            fetcher: () =>
                dispatch(
                    requestParentNameOtp({
                        payload: buildOtpPayload(),
                        setMessage,
                        resend,
                        loading: false,
                    }),
                ),
            loaderConfig: OTP_FIELD_LOADER_CONFIG,
            mode: 'create',
        });
    };

    const handleValidateOtp = async (otpToUse) => {
        const otpTokenValue =
            typeof token === 'object' && token?.token ? token.token : token;
        const apiPrefix = prefix || '';
        const payload = {
            otpToken: otpTokenValue,
            otp: otpToUse,
            prefix: apiPrefix,
        };

        await validateOtpApi.refetch({
            fetcher: () =>
                dispatch(
                    validateNewUserOTP({
                        payload,
                        setMessage,
                        handleSubmit: handleOtpSuccess,
                        loading: false,
                    }),
                ),
            loaderConfig: OTP_FIELD_LOADER_CONFIG,
            mode: 'create',
        });
    };

    const buildOtpPayload = () => ({
        email: keyContactData?.emailId,
        phoneNo: keyContactData?.phoneNo,
        departmentId: 0,
        userId: keyContactData?.userId,
        clientId: keyContactData?.clientId,
        type: 'email',
        requestfrom: '',
        source: 'A',
        to: keyContactData?.emailId,
        name: keyContactData?.firstName || parentCompanyName || '',
    });

    const handleAssociationConfirm = () => {
        handleOtpSuccess();
    };

    const handleOtpSuccess = () => {
        resetOtpState();
        onAssociationSuccess(keyContactData);
        setShowOtpStep(false);
        setMessage('');
    };

    const isOtpValidateLoading = validateOtpApi.isFetching;
    const isOtpSendLoading = requestOtpApi.isFetching;

    const alertText = isOtpValid
        ? 'Valid OTP'
        : otpMessage || message || 'Invalid OTP';

    const isAlertSuccess = isOtpValid || !otpMessage;

    return (
        <RSModal
            show={show}
            handleClose={handleClose}
            size="modal-md"
            header={showOtpStep ? 'One-time password verification' : 'Confirmation'}
            body={
                <FormProvider {...methods}>
                    <div className="forgot-password-modal position-relative">
                        {(showFlag || message || otpMessage) && showOtpStep && (
                            <OTPalertPopup
                                show
                                isSuccess={isAlertSuccess}
                                className="position-absolute OTPWidth mb21"
                            >
                                {alertText}
                            </OTPalertPopup>
                        )}
                        {!showOtpStep && (
                            <p>
                                Would you like to associate this with the company{' '}
                                <b>{parentCompanyName}</b>?
                            </p>
                        )}
                        {showOtpStep && (
                            <div
                                className={`${
                                    isOtpValid || isOtpValidateLoading
                                        ? 'pointer-event-none pe-none click-off opacity-75'
                                        : ''
                                } pt61`}
                            >
                                <RSOTPForm
                                    isLoading={isOtpSendLoading}
                                    isOtpValidateLoading={isOtpValidateLoading}
                                    isOTPValid={isOtpValid}
                                    isAccountSetup={true}
                                    isResendOTPValid={async () => {
                                        if (isOtpValidateLoading) return;
                                        dispatch(
                                            updateOtpValidState({
                                                isOtpValid: false,
                                                showFlag: false,
                                            }),
                                        );
                                        await sendRequestOtp({ resend: true });
                                    }}
                                    validateOTP={(otp) => {
                                        if (isOtpValidateLoading) return;
                                        if (otp?.length === 6) {
                                            const apiPrefix = prefix || '';
                                            const otpToUse = apiPrefix ? `${apiPrefix}-${otp}` : otp;
                                            handleValidateOtp(otpToUse);
                                        } else if (isOtpValid || showFlag) {
                                            dispatch(
                                                updateOtpValidState({
                                                    isOtpValid: false,
                                                    showFlag: false,
                                                }),
                                            );
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
                <>
                    {!showOtpStep && (
                        <>
                            <RSSecondaryButton onClick={handleClose}>Cancel</RSSecondaryButton>
                            <RSPrimaryButton onClick={handleAssociationConfirm}>OK</RSPrimaryButton>
                        </>
                    )}
                    {showOtpStep && (
                        <RSPrimaryButton
                            className={isOtpValid ? '' : 'click-off'}
                            onClick={() => {
                                if (isOtpValid) handleOtpSuccess();
                            }}
                        >
                            Confirm
                        </RSPrimaryButton>
                    )}
                </>
            }
        />
    );
};

export default ParentCompanyAssociationModal;
