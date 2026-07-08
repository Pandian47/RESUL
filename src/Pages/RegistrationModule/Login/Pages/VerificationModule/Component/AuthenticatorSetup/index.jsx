import { ENTER_6_DIGIT_CODE_FROM_APP } from 'Constants/GlobalConstant/Placeholders';
import { alert_medium, circle_tick_medium, copy_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import RSOTPForm from 'Components/RSOTPForm';
import { RSSecondaryButton } from 'Components/Buttons';
import RSTooltip from 'Components/RSTooltip';
import { validateOTP, confirm_login } from 'Reducers/login/existingUser/request';
import { updateOtpValidState } from 'Reducers/login/existingUser/reducer';
import { truncateTitle } from 'Utils/modules/displayCore';
import { globalStateSelector } from 'Utils/Selectors/app';
const AuthenticatorSetup = ({ onBack, onComplete }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const methods = useForm({
        mode: 'onTouched',
    });
    const [otpValid, setOtpValid] = useState(false);
    const [otpValue, setOtpValue] = useState('');
    const [otpShow, setOtpShow] = useState(false);
    const [confirmCalled, setConfirmCalled] = useState(false);
    const [message, setMessage] = useState('');
    const [otpMessage, setOtpMessage] = useState('');
    const [isCopied, setIsCopied] = useState(false);
    const { qrCode, otpToken, isOtpValid, showFlag: reduxShowFlag, otpMessage: reduxOtpMessage,isAuthQrScan , countryCode,countryName} = useSelector(({ loginReducer }) => loginReducer);
    const { showSessionModal } = useSelector((state) => globalStateSelector(state));
    
    useEffect(() => {
        dispatch(updateOtpValidState({
            isOtpValid: false,
            showFlag: false,
            otpMessage: '',
        }));
        setOtpMessage('');
        setMessage('');
        setOtpValid(false);
        setOtpValue('');
        setConfirmCalled(false);
    }, [dispatch]);

    const getQrCodeUrl = () => {
        if (qrCode) {
            if (qrCode.startsWith('data:')) {
                return qrCode;
            }
            return `data:image/png;base64,${qrCode}`;
        }
        return '';
    };
    
    const qrCodeUrl = getQrCodeUrl();

    // Call confirm_login when OTP validation succeeds
    useEffect(() => {
        if (isOtpValid && otpValue && otpToken && !confirmCalled) {
            setConfirmCalled(true);
            const confirmPayload = {
                otpToken: otpToken,
                otp: otpValue,
                countryName: countryName,
                countryCode: countryCode,
            };
            dispatch(confirm_login({ payload: confirmPayload, navigate }));
        }
    }, [isOtpValid, otpValue, otpToken, confirmCalled, dispatch, navigate]);

    // Sync Redux state with local state
    useEffect(() => {
        setOtpValid(isOtpValid);
    }, [isOtpValid]);

    useEffect(() => {
        // Sync reduxOtpMessage - always sync when it changes
        if (reduxOtpMessage) {
            setOtpMessage(reduxOtpMessage);
        } else {
            setOtpMessage('');
        }
    }, [reduxOtpMessage]);

    const handleResendOTP = () => {
        setOtpValid(false);
        setOtpValue('');
        setOtpShow(false);
        setConfirmCalled(false);
        setOtpMessage('');
        setMessage('OTP resent successfully');
        methods.reset();
    };

    const handleBack = () => {
        // Reset all local state
        setOtpValid(false);
        setOtpValue('');
        setOtpShow(false);
        setConfirmCalled(false);
        setOtpMessage('');
        setMessage('');
        
        // Reset Redux state
        dispatch(updateOtpValidState({
            isOtpValid: false,
            showFlag: false,
            otpMessage: '',
        }));
        
        // Reset form
        methods.reset();
        
        // Call the original onBack handler
        if (onBack) {
            onBack();
        }
    };

    const handleVerify = (otp, prefixedOtp) => {
        if (!otp || otp.length !== 6 || !otpToken) {
            return;
        }
        
        const otpToUse = prefixedOtp && prefixedOtp.length > 6 ? prefixedOtp : otp;
        setOtpValue(otpToUse);
        setOtpMessage('');
        setMessage('');
        
        const payload = {
            otpToken: otpToken,
            otp: otpToUse,
        };
        
        dispatch(
            validateOTP({
                payload,
                handleSubmit: () => {
                },
                loading: true,
            }),
        );
    };

    return (
        <FormProvider {...methods}>
            <div className="rs-login-wrapper">
                <div className={`login-panel d-block ${showSessionModal ? 'p0': ''}`}>
                    <div className=" mb-12">
                        {!isAuthQrScan && 
                        <>
                        <div className="text-center mb10">
                            <p className="mb0">Connect your authenticator app</p>
                        </div>

                        <div className="text-center mb15">
                            <div className="d-inline-block p2 bg-white border border-r7">
                                <img 
                                    src={qrCodeUrl} 
                                    alt="QR Code" 
                                    width="100" 
                                    height="100"
                                />
                            </div>
                        </div>

                        <div className="text-center mb15">
                            <small className="mb15 lh-sm">Paste this key into your app to manually add the account if you can't scan</small>
                            <div className="d-flex p10 border border-r10 d-inline-block position-relative justify-content-between">
                                {!isCopied &&
                                <small className="font-semi-bold">
                                    {otpToken?.length > 40 ? <RSTooltip text={otpToken}>
                                        {truncateTitle(otpToken, 40)}
                                    </RSTooltip> : otpToken}
                                </small>
                                }
                                {isCopied && <small className="color-primary-green">Copied successfully</small>}
                                <RSTooltip text={'Copy'} className="lh0 ml10">
                                    <i
                                        onClick={async () => {
                                            if ('clipboard' in navigator && otpToken) {
                                                try {
                                                    await navigator.clipboard.writeText(otpToken).then(() => {
                                                        setIsCopied(true);
                                                        setTimeout(() => {
                                                            setIsCopied(false);
                                                        }, 1500);
                                                    });
                                                } catch (err) {
                                                                                                    }
                                            }
                                        }}
                                        className={`${copy_medium} color-primary-blue icon-md cursor-pointer`}
                                    ></i>
                                </RSTooltip>
                            </div>
                        </div>
                        </>
                        }   
                        <div className="form-group">
                            {((reduxShowFlag || message || otpMessage) && (otpValid || message || otpMessage)) && (
                                <div
                                    className={`alert OTPWidth mb15  border-r7 align-items-stretch ${
                                        otpValid || (message && !otpMessage) ? 'alert-success' : 'alert-warning'
                                    }`}
                                >
                                    <i
                                        className={`position-relative mr10 p8 white border-tlr7 border-blr7 d-flex align-items-center ${
                                            otpValid || (message && !otpMessage) ? circle_tick_medium : alert_medium
                                        } ${otpValid || (message && !otpMessage) ? 'bg-green-medium' : 'bg-orange-medium'} icon-md`}
                                    ></i>
                                   
                                        <span className='align-items-center d-flex'>
                                            {otpValid ? 'Valid OTP' : otpMessage || message || ''}
                                        </span>
                                    
                                </div>
                            )}
                            <label className="font-semi-bold mb10">{ENTER_6_DIGIT_CODE_FROM_APP}</label>
                            
                            <div className="mb15">
                                <RSOTPForm
                                    isOTPValid={otpValid}
                                    otpShow={(value) => setOtpShow(value)}
                                    otpSuccess={(value) => setOtpValid(value)}
                                    isResendOTPValid={(value) => {
                                        handleResendOTP();
                                    }}
                                    validateOTP={(otp, prefixedOtp) => {
                                        if (otp?.length === 6) {
                                            handleVerify(otp, prefixedOtp);
                                        } else {
                                            setOtpMessage('');
                                            setMessage('');
                                            setOtpValue('');
                                            dispatch(updateOtpValidState({
                                                isOtpValid: false,
                                                showFlag: false,
                                                otpMessage: '',
                                            }));
                                        }
                                    }}
                                    otpMessage={false}
                                    isAccountSetup={true}
                                    showTimer={false}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="text-right mb30-del">
                        <RSSecondaryButton
                            type="button"
                            id="rs_authenticator_back"
                            onClick={handleBack}
                            className="pr0"
                        >
                            Choose different method
                        </RSSecondaryButton>
                    </div>
                </div>
            </div>
        </FormProvider>
    );
};

export default AuthenticatorSetup;

