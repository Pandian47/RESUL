import { ENTER_PHONE, ENTER_VALID_PHONE_NO } from 'Constants/GlobalConstant/ValidationMessage';
import { CANCEL, CURRENT_NUMBER, NEW_NUMBER, OTP_VERIFICATION, UPDATE, UPDATE_MOBILE_NUMBER } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';

import { PHONEINPUT } from 'Constants/GlobalConstant/Regex';
import RSModal from 'Components/RSModal';
import RSOTPForm, { OtpModalAlerts } from 'Components/RSOTPForm';
import RSPhoneInput from 'Components/FormFields/RSPhoneInput';

import { getUserDetails } from 'Utils/modules/crypto';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { resetOtpState, updateOtpInValid, updateOtpValid } from 'Reducers/preferences/myProfile/reducer';
import { getMyprofile, UpdateMobileNumber, validateMobileNumber, validateMyProfileOTP } from 'Reducers/preferences/myProfile/request';
import { requestOTP } from 'Reducers/login/newUser/request';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';
let otpValue = ''
const ChangeMobileNumber = ({ handleClose, show: showModal }) => {
    const dispatch = useDispatch();
    const [show, setShow] = useState(false);
    const firstNumberDialCode = useRef('');
    const secondNumberDialCode = useRef('');
    const { userId, clientId } = getUserDetails();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [newNumber, setNewNumber] = useState(false);
    const requestOtpApi = useApiLoader({ autoFetch: false });
    const validateOtpApi = useApiLoader({ autoFetch: false });
    const updateMobileApi = useApiLoader({ autoFetch: false });
    const isOtpRequestLoading = requestOtpApi.isFetching;
    const isOtpValidateLoading = validateOtpApi.isFetching;
    const isUpdateLoading = updateMobileApi.isFetching;

    const { isCurrentValue, isOtp, token, flag, otpMessage , prefix} = useSelector(({ myProfileReducer }) => myProfileReducer);

    const {
        control,
        watch,
        setError,
        setValue,
        setFocus,
        clearErrors,
        reset,
        formState: { errors },
    } = useFormContext();

    const [newMobileNumber, currentMobileNumber] = watch([
        'changeMobileNumber.newMobileNumber',
        'changeMobileNumber.currentMobileNumber',
    ]);
    
    const handlePhoneBlur = (e, data) => {
        const {
            target: { value: eventValue },
        } = e;
        const { format, dialCode } = data;
        if (eventValue?.length === format?.length && currentMobileNumber !== newMobileNumber && isCurrentValue) {
            if (!newMobileNumber.startsWith('00') && !newMobileNumber.startsWith('11')) {
                // if (!PHONEINPUT.test(newMobileNumber))
                secondNumberDialCode.current = dialCode;
                setShow(true);
                setTimeout(() => {
                    setMessage(null);
                }, 4000);
                dispatch(
                    updateOtpInValid({
                        flag: true,
                    }),
                );
            } else {
                setError('changeMobileNumber.newMobileNumber', {
                    type: 'custom',
                    message: ENTER_VALID_PHONE_NO,
                });
            }
        }
    };
    const handlePopupClose = () => {
        requestOtpApi.reset();
        validateOtpApi.reset();
        updateMobileApi.reset();
        reset((formState) => ({
            ...formState,
            // ...(newMobileNumber && { phoneNo: newMobileNumber }),
            first: '',
            second: '',
            third: '',
            fourth: '',
            fifth: '',
            sixth: '',
            changeMobileNumber: {
                currentMobileNumber: '',
                newMobileNumber: '',
            },
        }));
        handleClose();
    };
    const resetData = (flag) => {
        requestOtpApi.reset();
        validateOtpApi.reset();
        updateMobileApi.reset();
        setShow(false);
        reset((formState) => ({
            ...formState,
            //  ...(newMobileNumber && { phoneNo: newMobileNumber }),
            first: '',
            second: '',
            third: '',
            fourth: '',
            fifth: '',
            sixth: '',
            changeMobileNumber: {
                currentMobileNumber: '',
                newMobileNumber: '',
            },
        }));
        handleClose(false);
    };

    const savePhoneNumber = async () => {
        await dispatch(getMyprofile({ payload: { userId, clientId }, isLoading: false }));
        dispatch(resetOtpState());
        resetData(true);
    };

    const handleUpdateMobileNumber = async () => {
        const payload = {
            userId,
            clientId,
            oldMobileNumber: currentMobileNumber?.slice(firstNumberDialCode.current?.length),
            newMobileNumber: newMobileNumber?.slice(secondNumberDialCode.current?.length),
            otp: otpValue,
            otpToken: token,
            newCountryCodeMobile: secondNumberDialCode.current || '',
        };

        await updateMobileApi.refetch({
            fetcher: () => dispatch(UpdateMobileNumber({ payload, savePhoneNumber, loading: false })),
            mode: 'create',
            loaderConfig: { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.GLOBAL },
        });
    };

    const handleCurrentMobileChange = async (value, { dialCode, format }, e) => {
        const {
            target: { value: eventValue },
        } = e;

        if (eventValue?.length === format?.length) {
            if (!value.slice(dialCode?.length).startsWith('00') && !value.slice(dialCode?.length).startsWith('11')) {
                // if (!PHONEINPUT.test(value.slice(dialCode?.length)))
                setLoading(true);
                const payload = {
                    userId,
                    clientId,
                    currentMobileNo: value.slice(dialCode?.length),
                    countryCodemobile: '+' + dialCode,
                };
                const res = await dispatch(validateMobileNumber({ payload, setError, setMessage }));
                if (res?.status) {
                    clearErrors('changeMobileNumber.currentMobileNumber');
                }
                dispatch(
                    updateOtpInValid({
                        flag: false,
                    }),
                );
                setNewNumber(res?.status);
                setLoading(false);
            } else {
                setError('changeMobileNumber.currentMobileNumber', {
                    type: 'custom',
                    message: ENTER_VALID_PHONE_NO,
                });
            }
        }
    };

    const sendRequestOTP = (resend = false) => {
        const payload = {
            phoneNo: currentMobileNumber.slice(firstNumberDialCode.current?.length),
            countryCodeMobile: firstNumberDialCode.current,
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

    return (
        <>
            <RSModal
                show={showModal && !show}
                handleClose={handlePopupClose}
                header={UPDATE_MOBILE_NUMBER}
                size="md"
                body={
                    <div>
                        <Row>
                            <Col md={12}>
                            <div className="form-group">
                                    <RSPhoneInput
                                        name="changeMobileNumber.currentMobileNumber"
                                        control={control}
                                        setValue={setValue}
                                        setError={setError}
                                        clearErrors={clearErrors}
                                        label={CURRENT_NUMBER}
                                        required
                                        disabled={show}
                                        rules={{ required: ENTER_PHONE }}
                                        isLoading={loading}
                                        handleOnchange={handleCurrentMobileChange}
                                        handleOnBlur={(_, { format, dialCode }, e, errMsg) => {
                                            if (errMsg) {
                                                setTimeout(() => {
                                                    setError('changeMobileNumber.currentMobileNumber', {
                                                        type: 'custom',
                                                        message: errMsg,
                                                    });
                                                }, 4000);
                                                return;
                                            }
                                            firstNumberDialCode.current = dialCode;
                                        }}
                                        isChangeMobNumber
                                    />
                                </div>
                            </Col>
                            {/* {newNumber && ( */}
                                <Col md={12}>
                                    <div className="form-group rs-modal-no-footer-button">
                                        <RSPhoneInput
                                            name="changeMobileNumber.newMobileNumber"
                                            control={control}
                                            setValue={setValue}
                                            setError={setError}
                                            clearErrors={clearErrors}
                                            disabled={show}
                                            label={NEW_NUMBER}
                                            required
                                            rules={{
                                                required: ENTER_PHONE,
                                                validate: () =>
                                                    currentMobileNumber === newMobileNumber
                                                        ? 'Mobile number cannot be same'
                                                        : !PHONEINPUT.test(newMobileNumber)
                                                        ? true
                                                        : ENTER_VALID_PHONE_NO,
                                            }}
                                            handleOnBlur={handlePhoneBlur}
                                        />
                                    </div>
                                </Col>
                            {/* )} */}
                        </Row>
                    </div>
                }
            />
            <RSModal
                show={show}
                header={OTP_VERIFICATION}
                size="md"
                isCloseDisabled={isOtpRequestLoading || isOtpValidateLoading || isUpdateLoading}
                handleClose={() => {
                    if (isOtpRequestLoading || isOtpValidateLoading || isUpdateLoading) return;
                    requestOtpApi.reset();
                    validateOtpApi.reset();
                    updateMobileApi.reset();
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
                                otpClass="changeMobile"
                                isResendOTPValid={() => {
                                    if (isOtpValidateLoading) return;
                                    sendRequestOTP(true);
                                }}
                                validateOTP={(otp, prefixedOtp) => {
                                    if (isOtpValidateLoading) return;
                                    if (otp?.length === 6) {
                                        const otpToUse = prefixedOtp && prefixedOtp.length ? prefixedOtp : otp;
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
                        <RSSecondaryButton
                            blockInteraction={isOtpRequestLoading || isOtpValidateLoading || isUpdateLoading}
                            onClick={() => {
                                if (isOtpRequestLoading || isOtpValidateLoading || isUpdateLoading) return;
                                handleClose(false);
                                resetData();
                            }}
                        >
                            {CANCEL}
                        </RSSecondaryButton>
                        <RSPrimaryButton
                            className={`${!isOtp || isOtpRequestLoading || isOtpValidateLoading || isUpdateLoading ? 'click-off' : ''} ml15`}
                            isLoading={isUpdateLoading}
                            onClick={handleUpdateMobileNumber}
                        >
                            {UPDATE}
                        </RSPrimaryButton>
                    </Fragment>
                }
            />
        </>
    );
};

export default ChangeMobileNumber;
