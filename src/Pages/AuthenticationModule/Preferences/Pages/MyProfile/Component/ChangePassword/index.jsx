import { encryptWithAES, getUserDetails, iv } from 'Utils/modules/crypto';
import { GeneratePasswordpseudorandom } from 'Utils/modules/passwordUtils';
import { PASSWORD_REGEX } from 'Constants/GlobalConstant/Regex';
import { CANNOT_BE_SAME_AS_CURRENT_PASSWORD, ENTER_CURRENT_PASSWORD, ENTER_NEW_PASSWORD, PASSWORD_NOT_MATCH } from 'Constants/GlobalConstant/ValidationMessage';
import { PASSWORD_RULES } from 'Constants/GlobalConstant/Rules';
import { CANCEL, CHANGE_PASSWORD, CONFIRM_PASSWORD, CURRENT_PASSWORD, MIN_8_CHARACTERS, NEW_PASSWORD, OTP_VERIFICATION, PASSWORD_MAX_15_CHARACTERS, UPDATE } from 'Constants/GlobalConstant/Placeholders';
import { circle_question_mark_mini } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import RSModal from 'Components/RSModal';
import RSOTPForm, { OtpModalAlerts } from 'Components/RSOTPForm';
import RSInput from 'Components/FormFields/RSInput';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { useDispatch, useSelector } from 'react-redux';
import {
    saveNewPassword,
    validateCurrentPassword,
    validateMyProfileOTP,
    validatePassword,
} from 'Reducers/preferences/myProfile/request';
import { resetOtpState, updateOtpInValid, updateOtpValid } from 'Reducers/preferences/myProfile/reducer';
import { requestOTP } from 'Reducers/login/newUser/request';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';

import CryptoJS from 'crypto-js';
import RSPPophover from 'Components/RSPPophover';

let existingPassword = null;
let existingconfirmPassword = null;
let otpValue = '';

const ChangePasswordModal = ({ handleClose, show: showModal, phoneNo, dialCode }) => {
    const { userId, clientId } = getUserDetails();
    const dispatch = useDispatch();
    const { control, watch, getValues, resetField, setError, clearErrors } = useFormContext();
    const { isOtp, token, flag, otpMessage, isCurrentValue, prefix } = useSelector(
        ({ myProfileReducer }) => myProfileReducer,
    );
    const [currentLoading, setcurrentLoading] = useState(false);
    const [show, setShow] = useState(false);
    const [message, setMessage] = useState(null);
    const requestOtpApi = useApiLoader({ autoFetch: false });
    const validateOtpApi = useApiLoader({ autoFetch: false });
    const validatePasswordApi = useApiLoader({ autoFetch: false });
    const savePasswordApi = useApiLoader({ autoFetch: false });
    const isOtpRequestLoading = requestOtpApi.isFetching;
    const isOtpValidateLoading = validateOtpApi.isFetching;
    const isConfirmPasswordLoading = validatePasswordApi.isFetching;
    const isSavePasswordLoading = savePasswordApi.isFetching;
    const isOtpModalBusy =
        isOtpRequestLoading || isOtpValidateLoading || isSavePasswordLoading;

    const [newpassword, currentPassword] = watch(['changePassword.newpassword', 'changePassword.currentpassword']);

    const hasValue = GeneratePasswordpseudorandom(16);
    const byteHash = CryptoJS.enc.Utf8.parse(hasValue);
    const tempiv = iv;
    const currentPasswordServerError = useRef('');

    const resetApiLoaders = () => {
        requestOtpApi.reset();
        validateOtpApi.reset();
        validatePasswordApi.reset();
        savePasswordApi.reset();
    };

    const handlePopupClose = () => {
        existingPassword = null;
        existingconfirmPassword = null;
        currentPasswordServerError.current = '';
        resetApiLoaders();
        resetField('changePassword');
        resetField('changeotpPasswordotp');
        setShow(false);
        dispatch(resetOtpState());
        handleClose();
    };

    const handlePasswordSaved = () => {
        handlePopupClose();
    };

    const handleConfirmPasswordBlur = async ({ target: { value } }) => {
        if (
            value?.length > 7 &&
            PASSWORD_REGEX.test(value) &&
            value !== existingconfirmPassword &&
            newpassword === value &&
            value !== currentPassword
        ) {
            existingconfirmPassword = value;
            const payload = { userId, clientId };
            await validatePasswordApi.refetch({
                fetcher: () =>
                    dispatch(validatePassword({ payload, setShow, setMessage, loading: false })),
                mode: 'create',
                loaderConfig: { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.GLOBAL },
            });
        }
    };

    const handleCurrentPasswordChange = () => {
        if (currentPasswordServerError.current) {
            currentPasswordServerError.current = '';
            clearErrors('changePassword.currentpassword');
        }
    };

    const handleCurrentPasswordBlur = async ({ target: { value } }) => {
        if (value?.length >= 8 && PASSWORD_REGEX.test(value) && value !== existingPassword) {
            const payload = {
                userId,
                clientId,
                currentPassword: encryptWithAES(CryptoJS.enc.Utf8.parse(value), byteHash, tempiv),
                hashval: btoa(GeneratePasswordpseudorandom(3) + hasValue + GeneratePasswordpseudorandom(3)),
            };
            setcurrentLoading(true);
            const res = await dispatch(validateCurrentPassword({ payload }));
            if (res?.status) {
                existingPassword = value;
                currentPasswordServerError.current = '';
                clearErrors('changePassword.currentpassword');
            } else {
                const message = res?.message || ENTER_CURRENT_PASSWORD;
                currentPasswordServerError.current = message;
                setError('changePassword.currentpassword', {
                    type: 'custom',
                    message,
                });
            }
            setcurrentLoading(false);
        }
    };

    const sendRequestOTP = (resend = true) => {
        const payload = {
            phoneNo: phoneNo.slice(dialCode?.length),
            countryCodeMobile: dialCode,
        };
        dispatch(updateOtpInValid({ flag: false }));
        return requestOtpApi.refetch({
            fetcher: () =>
                dispatch(
                    requestOTP({
                        payload,
                        setMessage,
                        resend,
                        loading: false,
                        syncMyProfile: true,
                    }),
                ),
            mode: 'create',
            loaderConfig: { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.GLOBAL },
        });
    };

    const handleValidateOTP = async (otpToUse) => {
        if (!token || !otpToUse) return;

        otpValue = otpToUse;
        const payload = {
            otpToken: token,
            otp: otpToUse,
        };
        await validateOtpApi.refetch({
            fetcher: () => dispatch(validateMyProfileOTP({ payload, loading: false })),
            mode: 'create',
            loaderConfig: { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.GLOBAL },
        });
    };

    const handleSavePassword = async () => {
        if (!isOtp || isOtpModalBusy) return;

        const payload = {
            userId,
            clientId,
            currentPassword: encryptWithAES(
                CryptoJS.enc.Utf8.parse(getValues('changePassword.currentpassword')),
                byteHash,
                tempiv,
            ),
            newPassword: encryptWithAES(
                CryptoJS.enc.Utf8.parse(getValues('changePassword.confirmpassword')),
                byteHash,
                tempiv,
            ),
            hashval: btoa(GeneratePasswordpseudorandom(3) + hasValue + GeneratePasswordpseudorandom(3)),
            otpToken: token,
            otp: otpValue,
        };

        await savePasswordApi.refetch({
            fetcher: () =>
                dispatch(saveNewPassword({ payload, onSuccess: handlePasswordSaved, loading: false })),
            mode: 'create',
            loaderConfig: { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.GLOBAL },
        });
    };

    return (
        <>
            <RSModal
                show={showModal && !show}
                handleClose={handlePopupClose}
                header={CHANGE_PASSWORD}
                size="md"
                body={
                    <Fragment>
                        <div className="form-group">
                            <RSInput
                                type={'password'}
                                viewEye
                                name={'changePassword.currentpassword'}
                                placeholder={CURRENT_PASSWORD}
                                control={control}
                                required
                                disabled={isCurrentValue}
                                isLoading={currentLoading}
                                rules={{
                                    ...PASSWORD_RULES,
                                    required: ENTER_CURRENT_PASSWORD,
                                    validate: {
                                        serverPassword: () =>
                                            currentPasswordServerError.current || true,
                                    },
                                }}
                                handleOnchange={handleCurrentPasswordChange}
                                handleOnBlur={handleCurrentPasswordBlur}
                            />
                        </div>
                        <Fragment>
                            <div className="form-group">
                                <RSInput
                                    type={'password'}
                                    viewEye
                                    name={'changePassword.newpassword'}
                                    placeholder={NEW_PASSWORD}
                                    control={control}
                                    required
                                    meter
                                    disabled={show}
                                    maxLength={15}
                                    rules={{
                                        ...PASSWORD_RULES,
                                        required: ENTER_NEW_PASSWORD,
                                        validate: (value) =>
                                            value === currentPassword
                                                ? CANNOT_BE_SAME_AS_CURRENT_PASSWORD
                                                : true,
                                    }}
                                    smallText= {MIN_8_CHARACTERS}
                                    rightTooltip = {PASSWORD_MAX_15_CHARACTERS}
                                />
                            </div>
                            <div className="form-group rs-modal-no-footer-button">
                                <RSInput
                                    type={'password'}
                                    viewEye
                                    name={'changePassword.confirmpassword'}
                                    placeholder={CONFIRM_PASSWORD}
                                    control={control}
                                    required
                                    meter
                                    disabled={show}
                                    maxLength={15}
                                    rules={{
                                        ...PASSWORD_RULES,
                                        validate: {
                                            passwordMatch: (data) =>
                                                data !== newpassword ? PASSWORD_NOT_MATCH : true,
                                            oldPassword: (value) =>
                                                value === currentPassword
                                                    ? CANNOT_BE_SAME_AS_CURRENT_PASSWORD
                                                    : true,
                                        },
                                    }}
                                    isLoading={isConfirmPasswordLoading}
                                    handleOnBlur={handleConfirmPasswordBlur}
                                    isConfirmPassword={true}
                                />
                            </div>
                        </Fragment>
                    </Fragment>
                }
            />
            <RSModal
                show={show}
                header={OTP_VERIFICATION}
                size="md"
                isCloseDisabled={isOtpModalBusy}
                handleClose={() => {
                    if (isOtpModalBusy) return;
                    resetApiLoaders();
                    setShow(false);
                }}
                body={
                    <div className={`${flag || message?.length || isOtpValidateLoading ? '' : 'pt64'}`}>
                        <OtpModalAlerts
                            isOtpValidateLoading={isOtpValidateLoading}
                            flag={flag}
                            isOtp={isOtp}
                            otpMessage={otpMessage}
                            message={message}
                            hideSuccessWhenFlag
                            validatingAlertProps={{ className: 'mb10 border-r7' }}
                        />
                        <div
                            className={`${message?.length ? 'pt34' : otpMessage?.length || isOtp ? 'pt24' : ''} ${
                                isOtpValidateLoading ? 'pe-none click-off opacity-75' : ''
                            }`}
                        >
                            <RSOTPForm
                                isLoading={isOtpRequestLoading}
                                isOTPValid={isOtp}
                                disabled
                                otpClass="changeotpPasswordotp"
                                isResendOTPValid={() => {
                                    if (isOtpValidateLoading || isOtpRequestLoading) return;
                                    sendRequestOTP(true);
                                }}
                                validateOTP={(otp, prefixedOtp) => {
                                    if (isOtpValidateLoading) return;
                                    if (otp?.length === 6) {
                                        const otpToUse =
                                            prefixedOtp && prefixedOtp.length ? prefixedOtp : otp;
                                        handleValidateOTP(otpToUse);
                                    } else if (isOtp || flag) {
                                        dispatch(updateOtpValid(false));
                                    }
                                }}
                                prefix={prefix}
                            />
                        </div>
                    </div>
                }
                isCloseButton={true}
                footer={
                    <Fragment>
                        <RSSecondaryButton onClick={handlePopupClose} blockInteraction={isOtpModalBusy}>
                            {CANCEL}
                        </RSSecondaryButton>
                        <RSPrimaryButton
                            className={`${!isOtp || isOtpModalBusy ? 'click-off' : ''} ml15`}
                            isLoading={isSavePasswordLoading}
                            onClick={handleSavePassword}
                        >
                            {UPDATE}
                        </RSPrimaryButton>
                    </Fragment>
                }
            />
        </>
    );
};

export default ChangePasswordModal;
