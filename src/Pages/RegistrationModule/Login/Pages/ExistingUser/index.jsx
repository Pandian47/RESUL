import { ENTER_VALID_EMAIL, ENTER_VALID_EMAIL_ADDRESS, ENTER_VALID_PASSWORD, MAX75LENGTH } from 'Constants/GlobalConstant/ValidationMessage';
import { EMAIL_RULES } from 'Constants/GlobalConstant/Rules';
import { BUSSINESS_EMAIL, UNABLE_TOLOAD_DATA } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import axios from 'axios';

import _isEmpty from 'lodash/isEmpty';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import RSInput from 'Components/FormFields/RSInput';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import content from 'Constants/GlobalConstant/Content/content.json';
import BootstrapDropdown from 'Components/FormFields/RSBootstrapdown';
import { getIpAddressData, getMasterData } from 'Reducers/globalState/request';
import { updateSessionModal } from 'Reducers/globalState/reducer';
import { encryptWithAES, decryptWithAES, iv } from 'Utils/modules/crypto';
import { getBrowserName } from 'Utils/modules/browserUtils';
import { GeneratePasswordpseudorandom } from 'Utils/modules/passwordUtils';
import { decodeJwt } from 'Utils/modules/urlQuery';
import { getEnvironment } from 'Utils/modules/environment';
import { RSCaptchaGenerator } from 'Components/RSCaptcha';
import { FORM_INITIAL_STATE, LOGIN_DATA } from './constant';
import { updateForgotPwd } from 'Reducers/login/existingUser/reducer';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { loginExistingUser, emailExist, checkADUserExists } from 'Reducers/login/existingUser/request';
import RSTimer from 'Components/RSTimer';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';
import { motion, AnimatePresence } from 'framer-motion';

const signInFieldLoaderConfig = { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.FIELD };

const resolveLoginCredentials = (formState) => {
    const emailId = (formState?.emailId || document.getElementById('emailId')?.value || '').trim();
    const password = formState?.password || document.querySelector('input[name="password"]')?.value || '';
    return { emailId, password };
};

const ExistingUser = ({ onAuthLoadingChange = () => { } }) => {
    const existingEmail = useRef();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [ipAddress, setIPAddress] = useState({});
    const { isLoginValid } = useSelector(({ loginReducer }) => loginReducer);
    const signInLoader = useApiLoader({ autoFetch: false, loaderConfig: signInFieldLoaderConfig, mode: 'create' });

    useEffect(() => {
        onAuthLoadingChange(signInLoader.isLoading);
    }, [signInLoader.isLoading, onAuthLoadingChange]);

    useEffect(() => {
        return () => onAuthLoadingChange(false);
    }, [onAuthLoadingChange]);

    const {
        control,
        watch,
        handleSubmit: formSubmit,
        setError,
        clearErrors,
        reset,
        getValues,
        setValue,
        trigger,
        formState: { errors },
    } = useForm(FORM_INITIAL_STATE);
    const [isModalOpen, setModalOpen] = useState(false);
    const [emailState, setEmailState] = useState({
        loading: false,
        isValid: false,
    });
    const [msg, setMsg] = useState(null);
    const [isUserBlocked, setIsUserBlocked] = useState(false);
    const { loading, isValid } = emailState;

    const loginControl = watch('loginControl');

    const [isloginControl, setloginControl] = useState('RESUL');
    const emailHasError = Object.hasOwn(errors, 'emailId');
    const captchaHasError = Object.hasOwn(errors, 'captcha');
    useEffect(() => {
        localStorage.setItem('sessionModal', 'false');
        dispatch(updateSessionModal(false));
    }, [dispatch]);
    useEffect(() => {
        const captchaRetry = parseInt(localStorage.getItem('captchaRetry'), 10) || 0;
        if (emailHasError && captchaRetry > 5) {
            localStorage.setItem('captchaRetry', '0');
        }
    }, [emailHasError]);

    const getIpAddress = async () => {
        try {
            // const res = await axios.get('https://ipapi.co/json');
            const res = await axios.get('https://geolocation-db.com/json/');
            setIPAddress({ ip: res?.data?.IPv4, countryName: res?.data?.country_name, countryCode: res?.data?.country_code }); //res?.data?.ip
            if (
                localStorage.getItem('ipAddressData') === null ||
                localStorage.getItem('ipAddressData') === undefined ||
                localStorage.getItem('ipAddressData') === 'null'
            ) {
                //('https://geolocation-db.com/json/'); //https://api.ipify.org/?format=json
                const payload = { ipaddress: res?.data?.IPv4 }; //res?.data?.ip //res?.data?.IPv4
                dispatch(getIpAddressData({ payload }));
            }
        } catch (error) {
            // Set a default IP address or handle gracefully
            setIPAddress({ ip: '127.0.0.1', countryName: 'India', countryCode: 'IN' });
        }
    };

    useEffect(() => {
        try {
            var input = document.getElementById('emailId');
            setTimeout(() => {
                if (input?.matches(':autofill')) {
                    setEmailState((prev) => ({ ...prev, isValid: true }));
                }
            }, 1000);
        } catch (error) {
        }
    }, []);

    useEffect(() => {
        getIpAddress();
    }, []);

    useEffect(() => {
        try {
            const storedCredentials = localStorage.getItem('sessionCredentials');
            if (storedCredentials) {
                const credentialsObj = JSON.parse(decryptWithAES(storedCredentials));
                if (credentialsObj?.rememberMe) {
                    setEmailState((prev) => ({ ...prev, isValid: true }));
                    setValue('emailId', credentialsObj?.email);
                    setValue('password', credentialsObj?.password);
                    setValue('rememberme', true);
                }
            }
        } catch (error) {
            // Clear corrupted data from localStorage
            localStorage.removeItem('sessionCredentials');
        }
    }, []);

    const validateMasterData = async () => {
        let masterData = localStorage.getItem('masterData');
        let parsedData = null;
        if (masterData) {
            try {
                parsedData = JSON.parse(masterData);
            } catch {
                parsedData = null;
            }
        }
        const isMissing = _isEmpty(parsedData);
        const data = isMissing ? await dispatch(getMasterData(false)) : parsedData;

        if (_isEmpty(data) || typeof data !== 'object') {
            setError('emailId', {
                type: 'custom',
                message: UNABLE_TOLOAD_DATA,
            });
            return false;
        }
        return true;
    };


    const handleSubmit = async (formState) => {
        await signInLoader.refetch({
            fetcher: async () => {
                const masterDataStatus = await validateMasterData();
                if (!masterDataStatus) return null;

                let hasValue = GeneratePasswordpseudorandom(16);
                let byteHash = CryptoJS.enc.Utf8.parse(hasValue);
                let tempiv = iv;
                const { rememberme } = formState;
                let fromAdLogin = formState?.fromADLogin || false;

                if (fromAdLogin) {
                    const jwtEmail = formState?.jwtDetails?.preferred_username || '';
                    const jwtPassword = '';
                    const payload = {
                        loginName: encryptWithAES(CryptoJS.enc.Utf8.parse(jwtEmail), byteHash, tempiv),
                        loginPassword: jwtPassword,
                        userAgent: getBrowserName(),
                        ipAddress: btoa(ipAddress?.ip),
                        countryName: btoa(ipAddress?.countryName),
                        countryCode: btoa(ipAddress?.countryCode),
                        rememberMe: rememberme,
                        hashval: btoa(GeneratePasswordpseudorandom(3) + hasValue + GeneratePasswordpseudorandom(3)),
                        attempts: 0,
                        lastURL: '',
                        oauth: formState?.id_Token || '',
                        IsADuser: true,
                    };
                    const rememberMe = rememberme ? true : false;
                    const res = await dispatch(
                        loginExistingUser({
                            payload,
                            setError,
                            navigate,
                            setValue,
                            setMsg,
                            setIsUserBlocked,
                            jwtEmail,
                            jwtPassword,
                            rememberMe,
                            isLoading: false,
                        }),
                    );
                    if (res?.status) {
                        const encryptADUseDetails = encryptWithAES(
                            JSON.stringify({
                                isAdUser: true,
                                token: formState?.id_Token,
                            }),
                        );
                        localStorage.setItem('adUserDetails', encryptADUseDetails || '{}');
                    }
                    if (!res?.status) {
                        navigate('/');
                    }
                    return res;
                }

                if (isloginControl.toLowerCase() === 'resul') {
                    const { emailId, password } = resolveLoginCredentials(formState);
                    const tempOauth = encryptWithAES(
                        CryptoJS.enc.Utf8.parse(emailId + '###' + password),
                        byteHash,
                        tempiv,
                    );
                    if (!isValid) {
                        const { status } = await handleEmailBlur(emailId, isloginControl.toLowerCase());
                        if (!status) return null;
                    }
                    setEmailState({ loading: false, isValid: true });
                    const payload = {
                        loginName: encryptWithAES(CryptoJS.enc.Utf8.parse(emailId), byteHash, tempiv),
                        loginPassword: encryptWithAES(CryptoJS.enc.Utf8.parse(password), byteHash, tempiv),
                        userAgent: getBrowserName(),
                        ipAddress: btoa(ipAddress?.ip),
                        countryName: btoa(ipAddress?.countryName),
                        countryCode: btoa(ipAddress?.countryCode),
                        rememberMe: rememberme,
                        hashval: btoa(GeneratePasswordpseudorandom(3) + hasValue + GeneratePasswordpseudorandom(3)),
                        attempts: parseInt(localStorage.getItem('captchaRetry'), 10) || 0,
                        lastURL: '',
                        oauth: tempOauth,
                        IsADuser: false,
                    };
                    const rememberMe = rememberme ? true : false;
                    return dispatch(
                        loginExistingUser({
                            payload,
                            setError,
                            navigate,
                            setValue,
                            setMsg,
                            setIsUserBlocked,
                            emailId,
                            password,
                            rememberMe,
                            isLoading: false,
                        }),
                    );
                }

                if (isloginControl.toLowerCase() === 'adfs') {
                    const { emailId } = resolveLoginCredentials(formState);
                    const { status, data } = await handleEmailBlur(emailId, isloginControl.toLowerCase());
                    if (!status) return null;
                    setEmailState({ loading: false, isValid: true });
                    const directory = data?.directoryid;
                    const clientId = data?.clientId;
                    const redirecturl = data?.redirecturl
                        ? data?.redirecturl
                        : window.location.origin + window.location.pathname;
                    const url =
                        'https://login.microsoftonline.com/' +
                        directory +
                        '/oauth2/v2.0/authorize?response_type=id_token&scope=openid profile User.Read email&client_id=' +
                        clientId +
                        '&redirect_uri=' +
                        redirecturl +
                        '&state=704c89e9-3ff2-4e8d-852d-334e3e77701d&nonce=0f60e953-7b52-44d7-b7fd-cdc0cf077244_v50&client_info=1&x-client-SKU=MSAL.JS&x-client-Ver=1.2.1&client-request-id=9817539c-220c-42a1-9383-62db62bf1fe06&response_mode=fragment&sso_reload=true&login_hint=' +
                        emailId +
                        ' ';
                    window.location.href = url;
                }

                return null;
            },
            onError: () => {
                setError('emailId', {
                    type: 'custom',
                    message: 'An error occurred during login. Please try again.',
                });
            },
            loaderConfig: signInFieldLoaderConfig,
            mode: 'create',
        });
    };

    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const extractedCode = hashParams.get('id_token');
    useEffect(() => {
        try {
            if (extractedCode) {
                let token = decodeJwt(extractedCode)
                if (token?.status) {
                    setValue('emailId', token?.payload?.preferred_username)
                    const { nonce = '' } = token?.payload;
                    const match = nonce.match(/_v\d+/);
                    const version = match ? match?.[0] : null;

                    if (version == '_v50') {
                        let formState = {
                            ...getValues(),
                            jwtDetails: token?.status ? token?.payload : {},
                            fromADLogin: true,
                            id_Token: extractedCode
                        }
                        handleSubmit(formState)
                    } else {
                        const url = 'https://run.resulticks.com/v48/Home/ChannelAccessADToken?' + window.location.hash
                        window.location.href = url;
                    }
                } else {
                    setError('emailId', {
                        type: 'custom',
                        message: 'An error occurred. Please try again.',
                    });
                }
            }
        } catch (error) {
            // Clear any corrupted hash parameters
            window.location.hash = '';
        }
    }, [])
    useLayoutEffect(() => {
        try {
            if (extractedCode) {
                setloginControl(content.loginPage.loginDropdownItems.adfs)
            }
        } catch (error) {
        }
    }, [])
    const handleTimerComplete = () => {
        try {
            setIsUserBlocked(false)
            clearErrors('emailId')
        } catch (error) {
        }
    }

    const handleEmailBlur = async (value, loginControl) => {
        try {
            let hasValue = GeneratePasswordpseudorandom(16); //GeneratePassword16Char();
            let byteHash = CryptoJS.enc.Utf8.parse(hasValue);
            let tempiv = iv;
            const payload = {
                emailId: encryptWithAES(CryptoJS.enc.Utf8.parse(value), byteHash, tempiv),
                hashval: btoa(GeneratePasswordpseudorandom(3) + hasValue + GeneratePasswordpseudorandom(3)),
            };
            if (loginControl === 'resul') {
                const res = await dispatch(emailExist({ payload, setError, value, loading: false }));
                return { status: res?.status || false };
            }
            if (loginControl === 'adfs') {
                const res = await dispatch(checkADUserExists({ payload, setError, loading: false }));
                return { status: res?.status || false, data: res?.status ? res?.data : {} };
            }
            return { status: false, data: {} };
        } catch (error) {
            return { status: false, data: {} };
        }
    };

    const handleExistingUserEmailBlur = async (event) => {
        const value = event?.target?.value?.trim() || '';
        const isEmailValid = await trigger('emailId');
        if (!isEmailValid || !value) {
            setEmailState({ loading: false, isValid: false });
            return;
        }

        setEmailState({ loading: true, isValid: false });
        const { status } = await handleEmailBlur(value, isloginControl.toLowerCase());
        setEmailState({ loading: false, isValid: status });
    };

    const isSignInDisabled = emailHasError || captchaHasError || signInLoader.isLoading;

    const handleFormKeyDown = (e) => {
        if (e.key !== 'Enter') return;
        const emailValue = (getValues('emailId') || '')?.trim();
        const passwordValue = (getValues('password') || '')?.trim();
        const hasErrors = Object.keys(errors).length > 0;
        const isResul = isloginControl === 'RESUL';
        // For RESUL login: require both email and password; for ADFS: only email
        const hasRequiredFields = isResul ? (emailValue && passwordValue) : emailValue;
        if (!hasRequiredFields || hasErrors || signInLoader?.isLoading) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    // const handleEmailBlur = async ({ target: { value } }) => {
    //     let hasValue = GeneratePasswordpseudorandom(16); //GeneratePassword16Char();
    //     let byteHash = CryptoJS.enc.Utf8.parse(hasValue);
    //     let tempiv = iv;
    //     if (value?.length > 0 && !emailHasError && existingEmail.current !== value) {
    //         existingEmail.current = value;
    //         const payload = {
    //             //  emailId: value,
    //             emailId: encryptWithAES(CryptoJS.enc.Utf8.parse(value), byteHash, tempiv),
    //             hashval: btoa(GeneratePasswordpseudorandom(3) + hasValue + GeneratePasswordpseudorandom(3)),
    //         };
    //         setEmailState({
    //             loading: true,
    //             isValid: false,
    //         });
    //         const { status } = await dispatch(emailExist({ payload, setError }));
    //         if (status) {
    //             setEmailState({
    //                 loading: false,
    //                 isValid: true,
    //             });
    //         } else {
    //             setEmailState({
    //                 loading: false,
    //                 isValid: false,
    //             });
    //         }
    //     } else if (emailHasError) {
    //         existingEmail.current = null;
    //     }
    // };

    return (
        <div className="rs-login-wrapper">
            <div className="login-panel">
                <form onSubmit={formSubmit(handleSubmit)} onKeyDown={handleFormKeyDown}>
                    <div className="form-group">
                        <Row>
                            <Col md={6} className="d-flex">
                                <BootstrapDropdown
                                    data={LOGIN_DATA}
                                    showUpdate={true}
                                    flatIcon
                                    defaultItem={isloginControl.toLowerCase() === 'resul' ? LOGIN_DATA[0] : LOGIN_DATA[1]}
                                    disbleItems={[LOGIN_DATA[2]]}
                                    name={'loginControl'}
                                    onSelect={(e) => {
                                        setloginControl(e);
                                        setValue('emailId', '');
                                        setValue('password', '');
                                        clearErrors('emailId');
                                        setEmailState({ loading: false, isValid: false });
                                    }}
                                    control={control}
                                    containerClass={'w-100 login-existing-user-dropdown position-relative'}
                                    isActive={true}
                                />
                                {/* <RSKendoDropDownList
                                    name={'loginControl'}
                                    data={LOGIN_DATA}
                                    control={control}
                                    defaultValue={loginControl}
                                    // label={'Title'}
                                    className={'w-100'}
                                    required
                                /> */}
                            </Col>
                        </Row>
                    </div>
                    <div className={`form-group ${isUserBlocked ? 'mb41' : ''}`}>
                        <RSInput
                            type={'email'}
                            id="emailId"
                            name={'emailId'}
                            placeholder={BUSSINESS_EMAIL}
                            control={control}
                            required
                            maxLength={75}
                            autoComplete={'off'}
                            isLoading={loading}
                            isValidIcon={isValid}
                            isKeyDownUpPrevent={false}
                            rules={{
                                ...EMAIL_RULES,
                                pattern: {
                                    value: EMAIL_RULES.pattern.value,
                                    message: ENTER_VALID_EMAIL_ADDRESS,
                                },
                                minLength: {
                                    value: 10,
                                    message: 'Min. 10 characters',
                                },
                                maxLength: {
                                    value: 75,
                                    message: MAX75LENGTH,
                                },
                                validate: (value) => {
                                    const emailValue = (value || '').trim();
                                    if (!emailValue) return ENTER_VALID_EMAIL;
                                    if (emailValue.length < 10) return 'Min. 10 characters';
                                    if (!EMAIL_RULES.pattern.value.test(emailValue))
                                        return ENTER_VALID_EMAIL_ADDRESS;
                                    return true;
                                },
                            }}
                            handleOnchange={() => {
                                if (emailHasError) clearErrors('emailId');
                                if (isValid) {
                                    setEmailState({ loading: false, isValid: false });
                                }
                            }}
                            handleOnPaste={(e) => {
                                const trimmedValue = e.clipboardData.getData('Text').trim();
                                setValue('emailId', trimmedValue.replaceAll(' ', ''));
                                clearErrors('emailId');
                                setEmailState({ loading: false, isValid: false });
                                e.preventDefault();
                            }}
                            handleOnBlur={handleExistingUserEmailBlur}
                            loginEmailIcon
                            existingUser
                        />
                        {isUserBlocked && (<RSTimer initialTime={300} isUserBlocked={true} handleTimerComplete={handleTimerComplete} />)}
                    </div>
                    <AnimatePresence initial={false}>
                    {isloginControl === 'RESUL' && (
                        <motion.div 
                          className="form-group"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        //   style={{ overflow: 'hidden' }}
                        >
                            <RSInput
                                type={'password'}
                                name={'password'}
                                id="rs_ExistingUser_password"
                                required
                                viewEye
                                maxLength={15}
                                placeholder={content.password}
                                control={control}
                                disableMaxLengthWarning
                                isKeyDownUpPrevent={false}
                                handleOnchange={() => {
                                    if (emailHasError) {
                                        clearErrors('emailId');
                                    }
                                }}
                                rules={{
                                    required: ENTER_VALID_PASSWORD,
                                }}
                                handleOnPaste={(e) => {
                                    if (emailHasError) {
                                        clearErrors('emailId');
                                    }

                                    // Check maxLength before processing paste (only in TEAM environment)
                                    const maxLength = 15;
                                    const pastedData = e.clipboardData.getData('Text');
                                    const currentValue = getValues('password') || '';

                                    // Get selection range to determine if content is being replaced
                                    const selectionStart = e.target.selectionStart || 0;
                                    const selectionEnd = e.target.selectionEnd || 0;
                                    const selectedText = currentValue.substring(selectionStart, selectionEnd);

                                    // Calculate new length considering text replacement
                                    const newLength = currentValue.length - selectedText.length + pastedData.length;

                                    if (newLength > maxLength && getEnvironment() === 'TEAM') {
                                        e.preventDefault();
                                        return; // Don't process the paste if it exceeds maxLength in TEAM environment
                                    }

                                    // Handle text insertion/replacement properly
                                    const trimmedValue = pastedData.trim().replaceAll(' ', '');
                                    const newValue = currentValue.substring(0, selectionStart) + trimmedValue + currentValue.substring(selectionEnd);

                                    setValue('password', newValue);
                                    clearErrors('password');
                                    e.preventDefault();
                                }}
                                existingUser
                            />
                        </motion.div>
                    )}
                    </AnimatePresence>
                    {parseInt(localStorage.getItem('captchaRetry'), 10) > 2 && (
                        <div className="form-group">
                            <RSCaptchaGenerator
                                control={control}
                                isError={emailHasError}
                                setValue={setValue}
                                clearErrors={clearErrors}
                                setError={setError}
                            />
                        </div>
                    )}
                    <AnimatePresence initial={false}>
                    {isloginControl === 'RESUL' && (
                        <motion.div 
                      className="form-group mb25"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden' }}
                    >
                            <Row className='align-items-center'>
                                <Col>
                                    <RSCheckbox
                                        control={control}
                                        name="rememberme"
                                        type="checkbox"
                                        labelName={content.rememberMe}
                                        className="remember-lable"
                                    />
                                </Col>

                                <Col>
                                    <RSSecondaryButton
                                        type="button"
                                        id="rs_ExistingUser_forgot"
                                        className="mr0 p0 float-end fs-6"
                                        onClick={() => {
                                            reset();
                                            existingEmail.current = '';
                                            setModalOpen(true);
                                            dispatch(updateForgotPwd(true));
                                        }}
                                    >
                                        {content.forgotPassword}?
                                    </RSSecondaryButton>
                                </Col>

                            </Row>
                        </motion.div>
                    )}
                    </AnimatePresence>
                    {!isModalOpen && (
                        <div className="form-group m0">
                            <div className="row">
                                <div className="col text-center">
                                    <RSPrimaryButton
                                        type="submit"
                                        id="rs_ExistingUser_signin"
                                        className={isSignInDisabled ? 'click-off' : ''}
                                        isLoading={signInLoader.isLoading}
                                        blockBodyPointerEvents
                                    >
                                        {content.signIn}
                                    </RSPrimaryButton>
                                </div>
                            </div>
                        </div>
                    )}
                </form>
            </div>

            {/* {isModalOpen && <LoginPopup isOpen={isModalOpen} onChangeIsOpen={(value) => setModalOpen(value)} />} */}
            {/* {isLoginValid && (
                <LoginOTP
                    show={isLoginValid}
                    onChangeIsOpen={(value) => {
                        reset();
                        dispatch(updateOTPState(value));
                    }}
                    // msg={msg}
                    msg={'OTP sent successfully'}
                />
            )} */}
        </div>
    );
};

export default ExistingUser;
