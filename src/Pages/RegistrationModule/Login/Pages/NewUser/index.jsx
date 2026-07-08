import { ACCEPT_TERMS, ENTER_VALID_EMAIL } from 'Constants/GlobalConstant/ValidationMessage';
import { EMAIL_RULES } from 'Constants/GlobalConstant/Rules';
import { AGREE, BUSSINESS_EMAIL, SIGNUP, TERMSCONDITIONS, UNABLE_TOLOAD_DATA } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { isEmpty as _isEmpty, get as _get } from 'Utils/modules/lodashReplacements';
import RSCheckbox from 'Components/FormFields/RSCheckbox';

import { RSPrimaryButton } from 'Components/Buttons';
import { getRandomNumber } from './constant';
import { useDispatch, useSelector } from 'react-redux';
import { emailExist, checkNewUserEmailOTP } from 'Reducers/login/newUser/request';
import { iv, encryptWithAES } from 'Utils/modules/crypto';
import { GeneratePasswordpseudorandom } from 'Utils/modules/passwordUtils';
import ListNameExists from 'Components/ListNameExists';
import { v4 as uuid } from 'uuid';

import CryptoJS from 'crypto-js';
import { updateIsOtpModalShow, updateNewUserEmailHasValue } from 'Reducers/login/newUser/reducer';
import { RSCaptchaGenerator } from 'Components/RSCaptcha';
import { getMasterData } from 'Reducers/globalState/request';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';

const signUpFieldLoaderConfig = { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.FIELD };

const NewUser = ({ onAuthLoadingChange = () => {} }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const signUpLoader = useApiLoader({ autoFetch: false, loaderConfig: signUpFieldLoaderConfig, mode: 'create' });

    useEffect(() => {
        onAuthLoadingChange(signUpLoader.isLoading);
    }, [signUpLoader.isLoading, onAuthLoadingChange]);

    useEffect(() => {
        return () => onAuthLoadingChange(false);
    }, [onAuthLoadingChange]);
    let [a, setA] = useState(getRandomNumber());
    let [b, setB] = useState(getRandomNumber());
    const [isCaptchaValid, setIsCaptchaValid] = useState(false);
    const methods = useForm({
        mode: 'onChange',
        defaultValues: {
            emailId: '',
            answer: '',
            agree: false,
            captcha: '',
        },
    });
    const { isOtpModalShow, isOtpValid, emailId } = useSelector(({ newUserReducer }) => newUserReducer);
    const [formValid, setFormValid] = useState(false);
    const [isOtpCancel, setisOtpCancel] = useState(false);
    const { control, handleSubmit: formSubmit, setError, setValue, clearErrors, watch, reset } = methods;
    // const emailHasError = Object.hasOwn(errors, 'emailId');

    const emailValue = watch('emailId');
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
    const handleSubmit = async ({ emailId }) => {
        if (!formValid || !isCaptchaValid) {
            return;
        }

        await signUpLoader.refetch({
            fetcher: async () => {
                const status = await validateMasterData();
                if (!status) return null;

                const hasValue = GeneratePasswordpseudorandom(16);
                const byteHash = CryptoJS.enc.Utf8.parse(hasValue);
                const tempiv = iv;
                const UniqueID = uuid();
                const payload = {
                    emailId: encryptWithAES(CryptoJS.enc.Utf8.parse(emailId), byteHash, tempiv),
                    hashval: btoa(GeneratePasswordpseudorandom(3) + hasValue + GeneratePasswordpseudorandom(3)),
                };
                dispatch(updateIsOtpModalShow({ isOtpModalShow: true, emailId }));
                await dispatch(checkNewUserEmailOTP({ payload, uniqueId: UniqueID, loading: false }));
                setisOtpCancel(false);
                return true;
            },
            loaderConfig: signUpFieldLoaderConfig,
            mode: 'create',
        });
    };
    const handleCaptchaValidationChange = (isValid) => {
        setIsCaptchaValid(isValid);
    };
    // const handleOTPForm = () => {
    //     let hasValue = GeneratePasswordpseudorandom(16);
    //     let byteHash = CryptoJS.enc.Utf8.parse(hasValue);
    //     let tempiv = iv;
    //     const payload = {
    //         // emailId,
    //         w_emaild: emailId,
    //         emailId: encryptWithAES(CryptoJS.enc.Utf8.parse(emailId), byteHash, tempiv),
    //         hashval: btoa(GeneratePasswordpseudorandom(3) + hasValue + GeneratePasswordpseudorandom(3)),
    //     };
    //     dispatch(saveNewUserEmail({ payload, setError, navigate }));
    // };
    // const handleEmailBlur = async ({ target: { value } }) => {
    //     if (value?.length > 0 && !emailHasError && value !== existingEmail.current) {
    //         existingEmail.current = value;
    //         const payload = {
    //             emailId: value,
    //         };
    //         setEmailState({
    //             loading: true,
    //             isValid: false,
    //         });
    //         const { status, message } = await dispatch(emailExist({ payload, setError }));
    //         if (!status && message !== 'Invalid domain name') {
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

    const handlePayload = () => {
        // resend otp
        let hasValue = GeneratePasswordpseudorandom(16); //GeneratePassword16Char();
        let byteHash = CryptoJS.enc.Utf8.parse(hasValue);
        let tempiv = iv;
        const payload = {
            emailId: encryptWithAES(CryptoJS.enc.Utf8.parse(emailValue), byteHash, tempiv),
            hashval: btoa(GeneratePasswordpseudorandom(3) + hasValue + GeneratePasswordpseudorandom(3)),
        };

        return payload;
    };

    return (
        <FormProvider {...methods}>
            <div className="rs-login-wrapper">
                <div className="login-panel">
                    <form onSubmit={formSubmit(handleSubmit)}>
                        <div className={`form-group mt11`}>
                            {/* <RSInput
                            type={'text'}
                            name={'emailId'}
                            placeholder={placeholder.ENTER_EMAIL_ID}
                            control={control}
                            required
                            isLoading={loading}
                            rules={{
                                ...EMAIL_RULES,
                                validate: () => (emailHasError ? _get(errors, 'emailId.message') : true),
                            }}
                            handleOnchange={() => {
                                if (emailHasError) clearErrors('emailId');
                                setEmailState({
                                    loading: false,
                                    isValid: false,
                                });
                            }}
                            autoComplete={'off'}
                            handleOnBlur={handleEmailBlur}
                        /> */}
                            <ListNameExists
                                name={'emailId'}
                                type={'email'}
                                rules={EMAIL_RULES}
                                customErrorMessage={ENTER_VALID_EMAIL}
                                onValid={(status) => setFormValid(status)}
                                field="emailId"
                                apiCallback={emailExist}
                                isEmail
                                placeholder={BUSSINESS_EMAIL}
                                condition={(data) => {
                                    let message = data?.message;
                                    let status = data?.status
                                    if (
                                        !status &&
                                        message !== 'Invalid domain name' &&
                                        message !== 'Invalid email address'
                                    ) {
                                        const payload = handlePayload();
                                        dispatch(
                                            updateNewUserEmailHasValue({
                                                emailId: payload?.emailId,
                                                hasValue: payload?.hashval,
                                            }),
                                        );
                                        return true;
                                    }
                                }}
                                settings={{
                                    autoComplete: 'off',
                                }}
                                keyPressEnable={true}
                                loginEmailIcon
                                // isNewUser ={isOtpCancel}
                            />
                        </div>
                        <div className="form-group">
                            <RSCaptchaGenerator
                                control={control}
                                setValue={setValue}
                                clearErrors={clearErrors}
                                onValidationChange={handleCaptchaValidationChange}
                                setError={setError}
                            />
                        </div>
                        {/* <div className="form-group">
                            <div className="input-group rs-input-group-wrapper">
                                <div className="input-group-prepend">
                                    <span className="input-group-text input-answer">{`${a} + ${b} = `}</span>
                                </div>
                                <RSInput
                                    placeholder={placeholder.ANSWER}
                                    name="answer"
                                    id="rs_NewUser_answer"
                                    control={control}
                                    type="text"
                                    required
                                    maxLength={2}
                                    onKeyDown={onlyNumbers}
                                    handleOnBlur={({ target: { value } }) => {
                                        if (parseInt(value, 10) !== a + b && value !== '') {
                                            setTimeout(() => {
                                                setA(getRandomNumber());
                                                setB(getRandomNumber());
                                                setValue('answer', '');
                                            }, 500);
                                        }
                                    }}
                                    rules={{
                                        required: error.ENTER_ANSWER,
                                        pattern: {
                                            value: regex.ONLY_NUMBER_REGEX,
                                            message: error.ENTER_CORRECT_ANSWER,
                                        },
                                        validate: (data) =>
                                            parseInt(data, 10) !== a + b ? error.ENTER_CORRECT_ANSWER : true,
                                    }}
                                />
                            </div>
                        </div> */}
                        <div className="form-group  ">
                            <RSCheckbox
                                name="agree"
                                control={control}
                                required
                                type="checkbox"
                                labelName={AGREE}
                                className=""
                                rules={{
                                    required: ACCEPT_TERMS,
                                }}
                            >
                                <a
                                    href="https://www.go.resul.io/terms-and-conditions.html"
                                    target="_blank"
                                    className="rs-link-secondary-login position-relative top1 pl5"
                                >
                                    {TERMSCONDITIONS}
                                </a>
                            </RSCheckbox>
                        </div>

                        <div className="form-group m-0 text-center">
                            <RSPrimaryButton
                                id="rs_NewUser_Signup"
                                type="submit"
                                disabledClass={`${!formValid || !isCaptchaValid || signUpLoader.isLoading ? 'pe-none click-off' : ''}`}
                                isLoading={signUpLoader.isLoading}
                                blockBodyPointerEvents
                            >
                                {SIGNUP}
                            </RSPrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
            {/* {isOtpModalShow && (
                <LoginOTP
                    show={isOtpModalShow}
                    onChangeIsOpen={(value) => {}}
                    msg={'OTP sent successfully'}
                    handleClose={() => {
                        dispatch(
                            updateIsOtpModalShow({
                                isOtpModalShow: false,
                            }),
                            reset(),
                            setFormValid(false),
                            setA(getRandomNumber()),
                            setB(getRandomNumber())
                        );
                        setisOtpCancel (!isOtpCancel)
                    }}
                    handleOTPForm = {handleOTPForm}
                />
            )} */}
        </FormProvider>
    );
};

export default NewUser;
