import { alert_medium, circle_tick_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import { Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FormProvider, useForm } from 'react-hook-form';

import RSOTPForm from 'Components/RSOTPForm';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import {
    resetAddNewUserState,
    updateIsOtpModalShow,
    updateIsValidNewUserEmail,
} from 'Reducers/preferences/users/reducer';
import { checkNewUserEmailExists, checkNewUserValidateEmailOTP } from 'Reducers/preferences/users/request';

let otpValue = '';

const LoginOTP = (props) => {
    const { handleClose, msg } = props;
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const methods = useForm({
        mode: 'onTouched',
    });

    const { isOtpValid, showFlag, otpMessage, hasValue, newUserEmailId, token } = useSelector(
        ({ userReducer }) => userReducer,
    );

    const { handleSubmit: formSubmit } = methods;

    const [message, setMessage] = useState('');
    const [otpShow, setOtpShow] = useState(false);

    const handleSubmit = () => {
        dispatch(
            updateIsValidNewUserEmail({
                isValidEmail: true,
            }),
        );
        dispatch(
            updateIsOtpModalShow({
                isOtpModalShow: false,
            }),
        );
    };

    const resendOTP = () => {
        const payload = {
            emailId: newUserEmailId,
            hashval: hasValue,
        };
        dispatch(checkNewUserEmailExists({ payload }));
    };

    const handleMessage = () => {
        setTimeout(() => {
            setMessage('');
        }, 4000);
    };

    useEffect(() => {
        const status = token?.token ? 'OTP sent successfully' : '';
        setMessage(status);
    }, [token]);

    useEffect(() => {
        handleMessage();
        return () => {
            clearTimeout(handleMessage);
        };
    }, [message]);

    return (
        <FormProvider {...methods}>
            <div className="">
                {showFlag ? (
                    <div className={`alert mb20 ${isOtpValid ? 'alert-success' : 'alert-danger'}`}>
                        <i
                            className={`position-relative mr10 p5 white ${
                                isOtpValid ? circle_tick_medium : alert_medium
                            }  ${isOtpValid ? 'bg-primary-green' : 'bg-primary-red'} icon-md `}
                        ></i>
                        {showFlag && (
                            <span>
                                {isOtpValid ? 'Valid OTP' : otpMessage ? otpMessage : message ? message : 'Invalid OTP'}
                                {/* {isOtpValid ? 'Valid OTP' : otpMessage || message || 'Invalid OTP'} */}
                            </span>
                        )}
                    </div>
                ) : (
                    (message || otpMessage) !== '' && (
                        <div
                            className={`alert mb20 ${
                                message || isOtpValid ? 'alert-success' : 'alert-danger'
                            } form-group `}
                        >
                            <i
                                className={`position-relative mr10 p5 white ${
                                    message || isOtpValid ? circle_tick_medium : alert_medium
                                }  ${message || isOtpValid ? 'bg-primary-green' : 'bg-primary-red'} icon-md `}
                            ></i>

                            <span className="">{message || otpMessage}</span>
                        </div>
                    )
                )}
                <form onSubmit={formSubmit(handleSubmit)} className="d-flex align-items-center">
                    <Col>
                        <div className={`form-group ${otpShow ? 'mt-7' : ''} text-white mb0 `}>{/* Enter OTP */}</div>
                        <div className={`${isOtpValid ? 'click-off' : ''} form-group`}>
                            <RSOTPForm
                                isOTPValid={isOtpValid}
                                otpShow={(value) => setOtpShow(value)}
                                isResendOTPValid={(value) => {
                                    setMessage('OTP resent sent succesfully');
                                    resendOTP();
                                }}
                                validateOTP={(otp) => {
                                    if (otp?.length === 6) {
                                        otpValue = otp;
                                        const payload = {
                                            otpToken: token?.token,
                                            otp,
                                        };
                                        dispatch(
                                            checkNewUserValidateEmailOTP({
                                                payload,
                                            }),
                                        );
                                    }
                                }}
                                scenarioType="addUser"
                            />
                        </div>
                        <div className="buttons-holder mb0 ">
                            <RSSecondaryButton
                                type="button"
                                onClick={() => {
                                    dispatch(resetAddNewUserState());
                                }}
                            >
                                Cancel
                            </RSSecondaryButton>
                            <RSPrimaryButton type="submit" className={`${isOtpValid ? '' : 'click-off'} ml15`}>
                                Confirm
                            </RSPrimaryButton>
                        </div>
                    </Col>
                </form>
            </div>
        </FormProvider>
    );
};

export default LoginOTP;
