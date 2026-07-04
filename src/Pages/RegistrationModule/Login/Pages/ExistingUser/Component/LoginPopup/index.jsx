import { EMAIL_RULES } from 'Constants/GlobalConstant/Rules';
import { useRef, useState } from 'react';
import { Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

import { useDispatch, useSelector } from 'react-redux';
import CryptoJS from 'crypto-js';
import RSInput from 'Components/FormFields/RSInput';
import content from 'Constants/GlobalConstant/Content/content.json';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { emailExist, forgotPassword } from 'Reducers/login/existingUser/request';
import { encryptWithAES, iv } from 'Utils/modules/crypto';
import { GeneratePasswordpseudorandom } from 'Utils/modules/passwordUtils';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';

import { updateForgotPwd } from 'Reducers/login/existingUser/reducer';

const sendFieldLoaderConfig = { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.FIELD };

const LoginPopup = (props) => {
    const existingEmail = useRef();
    const dispatch = useDispatch();
    const sendLoader = useApiLoader({ autoFetch: false, loaderConfig: sendFieldLoaderConfig, mode: 'create' });
    const [emailState, setEmailState] = useState({
        loading: false,
        isValid: false,
    });
    const { isValid, loading } = emailState;
    const isSendLoading = sendLoader.isLoading;
    const {
        control,
        setError,
        clearErrors,
        formState: { errors },
        handleSubmit: formSubmit,
    } = useForm({
        mode: 'onTouched',
    });
    const { isLoginValid } = useSelector(({ loginReducer }) => loginReducer);
    const emailHasError = !!errors?.emailId;
    let hasValue = GeneratePasswordpseudorandom(16); //GeneratePassword16Char();
    let byteHash = CryptoJS.enc.Utf8.parse(hasValue);
    let tempiv = iv;
    const handleSubmit = async (data) => {
        await sendLoader.refetch({
            fetcher: async () => {
                const payload = {
                    emailId: encryptWithAES(CryptoJS.enc.Utf8.parse(data.emailId), byteHash, tempiv),
                    hashval: btoa(GeneratePasswordpseudorandom(3) + hasValue + GeneratePasswordpseudorandom(3)),
                };
                await dispatch(forgotPassword({ payload, setError, loading: false }));
                return true;
            },
            loaderConfig: sendFieldLoaderConfig,
            mode: 'create',
        });
    };
    const handleEmailBlur = async ({ target: { value } }) => {
        let hasValue = GeneratePasswordpseudorandom(16); //GeneratePa'ssword16Char();
        let byteHash = CryptoJS.enc.Utf8.parse(hasValue);
        let tempiv = iv;
        if (value?.length > 0 && !emailHasError && existingEmail.current !== value) {
            existingEmail.current = value;
            const payload = {
                // emailId: value,
                emailId: encryptWithAES(CryptoJS.enc.Utf8.parse(value), byteHash, tempiv),
                hashval: btoa(GeneratePasswordpseudorandom(3) + hasValue + GeneratePasswordpseudorandom(3)),
            };
            setEmailState({
                loading: true,
                isValid: false,
            });
            const { status } = await dispatch(emailExist({ payload, setError, value, loading: false }));
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
    return (
        <div className="forgot-password-modal">
            {!isLoginValid && (
                <form onSubmit={formSubmit(handleSubmit)}>
                    <Col>
                        <div className="form-group mt11">
                            <RSInput
                                type={'text'}
                                name={'emailId'}
                                placeholder={content.enterYourRegisteredEmail}
                                control={control}
                                required
                                // rules={EMAIL_RULES}
                                rules={{
                                    ...EMAIL_RULES,
                                    validate: () => (emailHasError ? errors?.emailId?.message : true),
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
                                isLoading={loading}
                                loginEmailIcon
                            // handleOnBlur={({ target: { value } }) => {
                            //     if (value?.length > 0 && existingEmail !== value) {
                            //         existingEmail = value;
                            //         const payload = {
                            //             emailId: value,
                            //         };
                            //         const { status }  = await dispatch(emailExist({ payload, setError }));
                            //         // dispatch(emailExist({ payload, setError }));
                            //         setisValid(status);
                            //         console.log('isValid', isValid);
                            //     }
                            // }}
                            />
                            <small>{content.newPasswordMessage}</small>
                        </div>
                        <div className="buttons-holder position-relative">

                            <RSSecondaryButton
                                onClick={() => {
                                    dispatch(updateForgotPwd(false));
                                }}
                            >
                                Cancel
                            </RSSecondaryButton>
                            <RSPrimaryButton
                                type="submit"
                                className={emailHasError || !isValid || isSendLoading ? 'click-off' : ''}
                                isLoading={isSendLoading}
                                blockBodyPointerEvents
                            >
                                {content.send}
                            </RSPrimaryButton>
                        </div>
                    </Col>
                </form>
            )}
        </div>
    );
};

export default LoginPopup;
