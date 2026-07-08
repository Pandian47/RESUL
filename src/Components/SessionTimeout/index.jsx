import {
    ENTER_VALID_EMAIL,
    ENTER_VALID_EMAIL_ADDRESS,
    ENTER_VALID_PASSWORD,
    MAX75LENGTH,
} from 'Constants/GlobalConstant/ValidationMessage';
import { EMAIL_RULES } from 'Constants/GlobalConstant/Rules';
import {
    BUSSINESS_EMAIL,
    SIGNIN,
    UNABLE_TOLOAD_DATA,
    YOUR_SESSION_EXPIRED,
} from 'Constants/GlobalConstant/Placeholders';
import { Fragment, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { isEmpty as _isEmpty } from 'Utils/modules/lodashReplacements';

import RSModal from 'Components/RSModal';
import RSInput from 'Components/FormFields/RSInput';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import content from 'Constants/GlobalConstant/Content/content.json';
import { RSPrimaryButton } from 'Components/Buttons';
import { loginExistingUser, emailExist, navigateToLoginAfterSessionClear } from 'Reducers/login/existingUser/request';
import { globalStateSelector } from 'Utils/Selectors/app';
import { getIpAddressData } from 'Reducers/globalState/request';
import { getBrowserName } from 'Utils/modules/browserUtils';
import { encryptWithAES, decryptWithAES, iv } from 'Utils/modules/crypto';
import { GeneratePasswordpseudorandom } from 'Utils/modules/passwordUtils';
import { RSCaptchaGenerator } from 'Components/RSCaptcha';
import { updateSessionEmail } from 'Reducers/login/newUser/reducer';
import VerificationModule from 'Pages/RegistrationModule/Login/Pages/VerificationModule';
import CryptoJS from 'crypto-js';
import RSTimer from 'Components/RSTimer';
import { maskEmailTwoCharsBeforeAndAfterDomain } from 'Utils/modules/masking';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';
import { resetModalShellAfterSessionRecovery } from 'Hooks/useBodyPointerLock';
import { resetGlobalState, updateSessionModal } from 'Reducers/globalState/reducer';
import { resetdashboardState } from 'Reducers/dashboard/dashboardReducer';

const signInFieldLoaderConfig = { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.FIELD };

const resolveLoginCredentials = (formState) => {
    const emailId = (formState?.emailId || document.getElementById('emailId')?.value || '').trim();
    const password = formState?.password || document.querySelector('input[name="password"]')?.value || '';
    return { emailId, password };
};

const SessionTimeout = () => {
    const existingEmail = useRef();
    const methods = useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoginValid } = useSelector(({ loginReducer }) => loginReducer);
    const { showSessionModal } = useSelector((state) => globalStateSelector(state));
    const signInLoader = useApiLoader({ autoFetch: false, loaderConfig: signInFieldLoaderConfig, mode: 'create' });
    const [ipAddress, setIPAddress] = useState({});
    const [isUserBlocked, setIsUserBlocked] = useState(false);
    const {
        control,
        watch,
        handleSubmit: formSubmit,
        setError,
        clearErrors,
        reset,
        getValues,
        setValue,
        formState: { errors },
    } = methods;
    const [emailState, setEmailState] = useState({
        loading: false,
        isValid: false,
    });
    const [msg, setMsg] = useState(null);
    const [isEmailPrefilled, setIsEmailPrefilled] = useState(false);
    const [isEmailAutoCompleted, setIsEmailAutoCompleted] = useState(false);
    const [verificationStep, setVerificationStep] = useState('choose2FA');
    const { loading, isValid } = emailState;
    const emailHasError = Object.hasOwn(errors, 'emailId');

    useEffect(() => {
        const captchaRetry = parseInt(localStorage.getItem('captchaRetry'), 10) || 0;
        if (emailHasError && captchaRetry > 5) {
            localStorage.setItem('captchaRetry', '0');
        }
    }, [emailHasError]);

    useEffect(() => {
        if (showSessionModal) {
            document.body.classList.add('Session-model-open');

            // Prefill email and password from stored plain text values
            try {
                const storedCredentials = localStorage.getItem('sessionCredentials');

                if (storedCredentials) {
                    const credentialsObj = JSON.parse(decryptWithAES(storedCredentials));

                    // Use the stored plain text values directly
                    const email = credentialsObj?.email || '';
                    const password = credentialsObj?.password || '';
                    const rememberMe = credentialsObj?.rememberMe || false;
                    if (email && password) {
                        existingEmail.current = email;
                        setValue('emailId', email);
                        setValue('password', password);
                        setValue('rememberme', rememberMe);
                        // Update email state for validation
                        setEmailState({
                            loading: false,
                            isValid: true,
                        });
                        setIsEmailPrefilled(true);
                        setIsEmailAutoCompleted(true);
                    }
                }
            } catch (error) {}
        } else {
            document.body.classList.remove('Session-model-open');
            setIsEmailPrefilled(false);
            setIsEmailAutoCompleted(false);
        }

        return () => {
            requestAnimationFrame(resetModalShellAfterSessionRecovery);
        };
    }, [showSessionModal, setValue]);
    const getIpAddress = async () => {
        try {
            // console.log('existing');
            // const res = await axios.get('https://ipapi.co/json');
            const res = await axios.get('https://geolocation-db.com/json/');
            setIPAddress({
                ip: res?.data?.IPv4,
                countryName: res?.data?.country_name,
                countryCode: res?.data?.country_code,
            }); //res?.data?.ip
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
        var input = document.getElementById('emailId');
        const timeoutId = setTimeout(() => {
            if (input?.matches(':autofill')) {
                setEmailState((prev) => ({ ...prev, isValid: true }));
                setIsEmailAutoCompleted(true);
            }
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, []);

    useEffect(() => {
        getIpAddress();
    }, []);
    let hasValue = GeneratePasswordpseudorandom(16); // GeneratePassword16Char();
    let byteHash = CryptoJS.enc.Utf8.parse(hasValue);
    let tempiv = iv;

    const getLocation = async () => {
        const res = await axios.get('https://geolocation-db.com/json/');
        return res;
    };
    const handleSubmit = async (formState) => {
        await signInLoader.refetch({
            fetcher: async () => {
               

                const res = await getLocation();
                localStorage.setItem('sessionModal', false);
                const { emailId, password } = resolveLoginCredentials(formState);
                const { rememberme } = formState;

                if (!isValid) {
                    const emailCheckPayload = {
                        emailId: encryptWithAES(CryptoJS.enc.Utf8.parse(emailId), byteHash, tempiv),
                        hashval: btoa(GeneratePasswordpseudorandom(3) + hasValue + GeneratePasswordpseudorandom(3)),
                    };
                    const emailCheck = await dispatch(
                        emailExist({ payload: emailCheckPayload, setError, value: emailId, loading: false }),
                    );
                    if (!emailCheck?.status) return null;
                    setEmailState({ loading: false, isValid: true });
                }

                dispatch(updateSessionEmail(emailId));
                const tempOauth = encryptWithAES(CryptoJS.enc.Utf8.parse(`${emailId}###${password}`), byteHash, tempiv);
                const payload = {
                    loginName: encryptWithAES(CryptoJS.enc.Utf8.parse(emailId), byteHash, tempiv),
                    loginPassword: encryptWithAES(CryptoJS.enc.Utf8.parse(password), byteHash, tempiv),
                    userAgent: getBrowserName(),
                    ipAddress: btoa(res?.data?.IPv4) || '',
                    countryName: btoa(res?.data?.country_name) || '',
                    countryCode: btoa(res?.data?.country_code) || '',
                    rememberMe: rememberme || false,
                    hashval: btoa(GeneratePasswordpseudorandom(3) + hasValue + GeneratePasswordpseudorandom(3)),
                    attempts: parseInt(localStorage.getItem('captchaRetry'), 10) || 0,
                    lastURL: `/${window.location.pathname.split('/')[1]}`,
                    oauth: tempOauth,
                    IsADuser: false,
                };

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
                        isLoading: false,
                    }),
                );
            },
            loaderConfig: signInFieldLoaderConfig,
            mode: 'create',
        });
    };

    const handleTimerComplete = () => {
        setIsUserBlocked(false);
        clearErrors('emailId');
    };

    const handleEmailBlur = async ({ target: { value } }) => {
        localStorage.setItem('sessionModal', false);
        if (isValid || isEmailPrefilled) {
            existingEmail.current = value;
            return;
        }
        let hasValue = GeneratePasswordpseudorandom(16); // GeneratePassword16Char();
        let byteHash = CryptoJS.enc.Utf8.parse(hasValue);
        let tempiv = iv;
        if (value?.length > 0 && !emailHasError && existingEmail?.current !== value) {
            existingEmail.current = value;
            const payload = {
                //  emailId: value,
                emailId: encryptWithAES(CryptoJS.enc.Utf8.parse(value), byteHash, tempiv),
                hashval: btoa(GeneratePasswordpseudorandom(3) + hasValue + GeneratePasswordpseudorandom(3)),
            };
            setEmailState({
                loading: true,
                isValid: false,
            });
            const { status } = await dispatch(emailExist({ payload, setError }));
            if (status) {
                setEmailState({
                    loading: false,
                    isValid: true,
                });
            } else {
                setEmailState({
                    loading: false,
                    isValid: false,
                });
            }
        } else if (emailHasError) {
            existingEmail.current = null;
        }
    };

    // const handleFormSubmit = ({ emailId, password }) => {
    //     const payload = {
    //         LoginName: emailId,
    //         LoginPassword: password,
    //     };
    //     dispatch(
    //         updateOTPState({
    //             isValid: true,
    //         }),
    //     );
    //     // setOtp(true);
    // };

    const getHeader = () => {
        if (isLoginValid) {
            switch (verificationStep) {
                case 'choose2FA':
                    return content.choose2FA;
                case 'emailOTPSetup':
                    return content.emailOTPSetup;
                case 'authenticatorSetup':
                    return content.authenticatorSetup;
                default:
                    return content.choose2FA;
            }
        }
        return content.login;
    };

    return (
        <RSModal
            show={showSessionModal}
            size="md"
            header={isLoginValid ? getHeader() : 'Login'}
            className={'session-timeout-popup'}
            isCloseDisabled={signInLoader.isLoading}
            handleClose={() => {
                document.body.classList.remove('Session-model-open');
                const tempMasterData = localStorage.getItem('masterData');
                const tempipAddressData = localStorage.getItem('ipAddressData');
                const tempdisable_plugin_last_shown = localStorage.getItem('disable_plugin_last_shown');
                dispatch(resetGlobalState());
                dispatch(resetdashboardState());
                dispatch(updateSessionModal(false));
                localStorage.setItem('tempMasterData', tempMasterData);
                localStorage.setItem('sessionModal', 'false');
                navigateToLoginAfterSessionClear(dispatch, navigate);
            }}
            onEscapeKeyDown={(e) => {
                e.preventDefault();
            }}
            body={
                <Fragment>
                    {isLoginValid ? (
                        <VerificationModule onStepChange={setVerificationStep} />
                    ) : (
                        // <form onSubmit={handleSubmit(handleFormSubmit)}>
                        <form onSubmit={formSubmit(handleSubmit)}>
                            <div className="form-group mt15">
                                <RSInput
                                    type={'text'}
                                    id="emailId"
                                    name={'emailId'}
                                    placeholder={BUSSINESS_EMAIL}
                                    control={control}
                                    required
                                    maxLength={75}
                                    autoComplete={'username'}
                                    isLoading={loading}
                                    disabled={isEmailPrefilled}
                                    maskValue={isEmailAutoCompleted ? maskEmailTwoCharsBeforeAndAfterDomain : undefined}
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
                                    handleOnchange={(e) => {
                                        setIsEmailAutoCompleted(false);
                                        if (emailHasError) clearErrors('emailId');
                                        if (e.target.matches(':autofill')) {
                                            setEmailState((prev) => ({ ...prev, isValid: true }));
                                            setIsEmailAutoCompleted(true);
                                        } else if (emailState.isValid)
                                            setEmailState({
                                                loading: false,
                                                isValid: false,
                                            });
                                    }}
                                    handleOnBlur={handleEmailBlur}
                                    loginEmailIcon
                                />
                                {isUserBlocked && (
                                    <RSTimer
                                        initialTime={300}
                                        isUserBlocked={true}
                                        handleTimerComplete={handleTimerComplete}
                                    />
                                )}
                            </div>
                            <div className="form-group">
                                <RSInput
                                    type={'password'}
                                    name={'password'}
                                    required
                                    viewEye
                                    maxLength={15}
                                    placeholder={content.password}
                                    control={control}
                                    existingUser
                                    handleOnchange={() => {
                                        if (emailHasError) clearErrors('emailId');
                                    }}
                                    rules={{
                                        required: ENTER_VALID_PASSWORD,
                                    }}
                                />
                            </div>
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
                            <div className="mb15">
                                <RSCheckbox
                                    control={control}
                                    name="rememberme"
                                    type="checkbox"
                                    labelName={content.rememberMe}
                                    className="remember-lable"
                                />
                                {/* <RSCheckbox control={control} name="staySignedIn" labelName={'Stay signed in'} /> */}
                            </div>
                            <RSPrimaryButton
                                type="submit"
                                className={`w-100 ${signInLoader.isLoading ? 'click-off' : ''}`}
                                isLoading={signInLoader.isLoading}
                                blockBodyPointerEvents
                            >
                                {SIGNIN}
                            </RSPrimaryButton>
                            <p className="color-primary-orange text-center mt15">{YOUR_SESSION_EXPIRED}</p>
                        </form>
                    )}
                </Fragment>
            }
        />
    );
};

export default SessionTimeout;
