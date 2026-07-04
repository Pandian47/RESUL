import { iv, encryptWithAES } from 'Utils/modules/crypto';
import { charNumDot, charNumUnderScore } from 'Utils/modules/inputValidators';
import { GeneratePasswordpseudorandom } from 'Utils/modules/passwordUtils';
import { ATLEAST_ONE_APLHABET, MAX_LENGTH, NO_SPECIAL_CHARS } from 'Constants/GlobalConstant/Regex';
import { ENTER_VALID_EMAIL, MINLENGTH, NO_SPECIAL_CHARS_ALLOWED, SPECIAL_CHATACTERS_NOT_ALlOWED } from 'Constants/GlobalConstant/ValidationMessage';
import { useEffect, useRef, useState } from 'react';
import { get as _get } from 'Utils/modules/lodashReplacements';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useFormContext } from 'react-hook-form';

import RSInput from 'Components/FormFields/RSInput';
import useBodyPointerLock from 'Hooks/useBodyPointerLock';
import { getSessionId } from 'Reducers/globalState/selector';

import { globalStateSelector } from 'Utils/Selectors/app';

import CryptoJS from 'crypto-js';
import { communicationNamevalidtor } from 'Utils/HookFormValidate';
const ListNameExists = ({
    name,
    rules = {},
    settings = {},
    apiCallback,
    onValid,
    extraPayload = {},
    field,
    condition,
    placeholder = '',
    customError = '',
    disabled,
    type = 'text',
    maxLength,
    isEmail = false,
    isDomain = false,
    onChange = () => {},
    validate = {},
    selectDisable = false,
    callback = () => {},
    campaignType = '',
    currentValue = '',
    keyPressEnable = false,
    defaultValue,
    nameExists = false,
    customErrorMessage = '',
    onBlur = () => {},
    isSpecialCharacter = true,
    loginEmailIcon = false,
    className = '',
    classWrapper = '',
    fromCompanies = false,
    isNoSpeicalChars = false,
    noEmoji = false,
    blockBodyPointerEvents = false,
    customBlurValidator,
}) => {
    const exists = useRef(null);
    const dispatch = useDispatch();
    const [updateDefaultValue, setUpdateDefaultValue] = useState(defaultValue);
    const {
        control,
        clearErrors,
        setError,
        setValue,
        formState: { errors },
        trigger
    } = useFormContext();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const { isAuth } = useSelector((state) => globalStateSelector(state));
    const { company_clientId, company_departmentId } = useSelector(({ globalstate }) => globalstate);
    const [state, setState] = useState({
        loading: false,
        isValid: false,
    });
    const { loading, isValid } = state;
    const hasError = Object.hasOwn(errors, name);

    useBodyPointerLock(loading && blockBodyPointerEvents);

    useEffect(() => {
        onValid && onValid(isValid);
    }, [isValid]);

    useEffect(() => {
        if (campaignType === 'M') {
            setState({ ...state, isValid: true });
        }
    }, [campaignType]);

    useEffect(() => {
        if (defaultValue) {
            setUpdateDefaultValue(defaultValue);
            setValue(name, updateDefaultValue);
        }
    }, [defaultValue]);

    const handleBlur = async ({ target: { value } }) => {
        const checkValid  = await trigger(name)
        if(!checkValid) {
            return
        }
        const { current } = exists;
        if (current?.val === value && !!current?.err) {
            setError(name, {
                type: 'server',
                message: current?.err,
            });
            return;
        }
        if (value?.length >= 3 && !hasError && current?.val !== value && currentValue !== value) {
            exists.current = {
                ...exists.current,
                val: value,
            };
            let data;
            if (isEmail) {
                const hasValue = GeneratePasswordpseudorandom(16); // GeneratePassword16Char();
                const byteHash = CryptoJS.enc.Utf8.parse(hasValue);
                const tempiv = iv;
                const payload = {
                    [field]: encryptWithAES(CryptoJS.enc.Utf8.parse(value), byteHash, tempiv),
                    hashval: btoa(GeneratePasswordpseudorandom(3) + hasValue + GeneratePasswordpseudorandom(3)),
                    ...extraPayload,
                    ...(isAuth
                        ? {
                              departmentId: fromCompanies ? company_departmentId?.departmentId : departmentId,
                              clientId: fromCompanies ? company_clientId?.clientId : clientId,
                              userId,
                          }
                        : {}),
                };
                setState({
                    loading: true,
                    isValid: false,
                });
                callback(value);

                data = await dispatch(apiCallback({ payload, setError, clearErrors }));
            } else {
                const payload = {
                    [field]: value?.trim(),
                    ...extraPayload,
                    ...(isAuth
                        ? {
                              departmentId: fromCompanies ? company_departmentId?.departmentId : departmentId,
                              clientId: fromCompanies ? company_clientId?.clientId : clientId,
                              userId,
                          }
                        : {}),
                };
                setState({
                    loading: true,
                    isValid: false,
                });
                callback(value);

                data = await dispatch(apiCallback({ payload, setError, clearErrors }));
            }

            setTimeout(function () {
                if (condition(data)) {
                    if (data?.message?.toLowerCase().includes('exception')) {
                        setState({
                            loading: false,
                            isValid: false,
                        });
                        setError(name, {
                            type: 'server',
                            message: data.message,
                        });
                        exists.current = {
                            ...exists.current,
                            val: '',
                            err: data.message,
                        };
                    } else {
                        setState({
                            loading: false,
                            isValid: true,
                        });
                        exists.current = {
                            ...exists.current,
                            err: '',
                        };
                    }
                } else {
                    setState({
                        loading: false,
                        isValid: false,
                    });
                    setError(name, {
                        type: 'server',
                        message: customError || data.message,
                    });
                    exists.current = {
                        ...exists.current,
                        val: '',
                        err: customError || data.message,
                    };
                }
            }, 50);
        } else if (hasError) {
            exists.current = null;
        }
    };
    useEffect(() => {
        setValue('isLoadingListName', loading);
    }, [loading]);
    // console.log('isDomain::', isDomain);
    return (
        <RSInput
            type={type}
            id={name}
            name={name}
            className={`${selectDisable || loading ? 'pe-none' : ''} ${className}`}
            classWrapper={classWrapper}
            control={control}
            isLoading={loading}
            noEmoji={noEmoji}
            placeholder={placeholder}
            isValidIcon={state.isValid}
            disabled={disabled}
            {...(isDomain ? { onKeyDown: charNumDot } : !isEmail ? { onKeyDown: charNumUnderScore } : {})}
            required
            defaultValue={updateDefaultValue}
            {...settings}
            maxLength={maxLength ?? MAX_LENGTH}
            loginEmailIcon={loginEmailIcon}
            rules={{
                ...rules,
                validate: {
                    ...((!isEmail || !isDomain) && communicationNamevalidtor),
                    hasError: () => {
                        return hasError ? _get(errors, `${name}.message`) : true;
                    },
                    ...validate,
                },
            }}
            onKeyDown={
                keyPressEnable
                    ? (e) => {
                          if (e.key === ' ') {
                              e.preventDefault();
                          }
                      }
                    : undefined
            }
            handleOnchange={(e) => {
                if (hasError) clearErrors(name);
                if (isValid || e.target.matches(':autofill')) {
                    setState({
                        loading: false,
                        isValid: false,
                    });
                }
                onChange(e);
                callback(e.target.value);
            }}
            // handleOnBlur={(e) => {
            //     // if (e.target.value.trim() === '' || e.target.value.trim()?.length < 3) {
            //     //     setError(name, {
            //     //         type: 'server',
            //     //         message: MINLENGTH,
            //     //     });
            //     //     return false;
            //     // } else {
            //         if (!isEmail && !isDomain) {
            //             if (e.target.value.trim() === '' || e.target.value.trim()?.length < 3) {
            //                 setError(name, {
            //                     type: 'server',
            //                     message: MINLENGTH,
            //                 });
            //                 return false;
            //             }
            //             if (communicationNamevalidtor(e.target.value) === undefined && !nameExists) {
            //                 if (!hasError) handleBlur(e);
            //             } else if(!nameExists){
            //                 setTimeout(() => {
            //                     setError(name, {
            //                         type: 'server',
            //                         message: SPECIAL_CHATACTERS_NOT_ALlOWED,
            //                     });
            //                     return false;
            //                 }, 10);
            //             }
            //         } else {
            //             if (!hasError && !nameExists) handleBlur(e);
            //         }
            //     // }
            // }}
            handleOnBlur={(e) => {
                //debugger

                const value = e.target.value;
                //debugger

                if (!isEmail && !isDomain) {
                    if (e.target.value.trim() === '') {
                        setError(name, {
                            type: 'server',
                            message: customErrorMessage,
                        });
                        exists.current = {
                            ...exists.current,
                            val: value,
                        };
                        return;
                    }

                    if (customBlurValidator) {
                        const validationMessage = customBlurValidator(e.target.value);
                        if (validationMessage !== true) {
                            setTimeout(() => {
                                setError(name, {
                                    type: 'validate',
                                    message: validationMessage,
                                });
                                exists.current = {
                                    ...exists.current,
                                    val: value,
                                };
                            }, 10);
                            onBlur(e);
                            return;
                        }
                        if (!hasError && !nameExists) {
                            handleBlur(e);
                        }
                        onBlur(e);
                        return;
                    }

                    if (e.target.value.trim()?.length < 3) {
                        setTimeout(() => {
                            setError(name, {
                                type: 'server',
                                message: MINLENGTH,
                            });
                            exists.current = {
                                ...exists.current,
                                val: value,
                            };
                            return;
                        }, 10);
                    } else if (isSpecialCharacter && isNoSpeicalChars) {
                        if (NO_SPECIAL_CHARS.test(e.target.value)) {
                            setTimeout(() => {
                                setError(name, {
                                    type: 'server',
                                    message:  NO_SPECIAL_CHARS_ALLOWED, 
                                });
                                exists.current = {
                                    ...exists.current,
                                    val: value,
                                };
                            }, 10);
                            return;
                        } else if (!hasError && !nameExists) {
                            handleBlur(e);
                        }
                    }

                    else if (isSpecialCharacter && communicationNamevalidtor(e.target.value) !== undefined) {
                        setTimeout(() => {
                            setError(name, {
                                type: 'server',
                                message: SPECIAL_CHATACTERS_NOT_ALlOWED,
                            });
                            exists.current = {
                                ...exists.current,
                                val: value,
                            };
                            return;
                        }, 10);
                    } else if (isSpecialCharacter && !ATLEAST_ONE_APLHABET.test(e.target.value)) {
                        setTimeout(() => {
                            setError(name, {
                                type: 'custom',
                                message: 'Atleast one alphabet is required',
                            });
                            exists.current = {
                                ...exists.current,
                                val: value,
                            };
                            return;
                        }, 10);
                    } else if (!hasError && !nameExists) {
                        handleBlur(e);
                    } else {
                    }
                } else {
                    if (isEmail) {
                        if (e.target.value.trim() === '') {
                            setError(name, {
                                type: 'server',
                                message: ENTER_VALID_EMAIL,
                            });
                            exists.current = {
                                ...exists.current,
                                val: value,
                            };
                            return;
                        } else if (!hasError) {
                            handleBlur(e);
                        } else {
                        }
                    } else if (!hasError) {
                        handleBlur(e);
                    } else {
                    }
                }
                onBlur(e);
            }}
        />
    );
};

ListNameExists.propTypes = {
    name: PropTypes.string.isRequired,
    field: PropTypes.string.isRequired,
    onValid: PropTypes.func,
    condition: PropTypes.func.isRequired,
    apiCallback: PropTypes.func.isRequired,
    rules: PropTypes.object,
    settings: PropTypes.object,
    extraPayload: PropTypes.object,
    placeholder: PropTypes.string,
    customError: PropTypes.string,
    isEmail: PropTypes.bool,
    isDomain: PropTypes.bool,
    selectDisable: PropTypes.bool,
    type: PropTypes.string,
    maxLength: PropTypes.number,
    onChange: PropTypes.func,
    validate: PropTypes.object,
    callback: PropTypes.func,
    campaignType: PropTypes.string,
    currentValue: PropTypes.string,
    keyPressEnable: PropTypes.bool,
    nameExists: PropTypes.bool,
    isSpecialCharacter: PropTypes.bool,
    customErrorMessage: PropTypes.string,
    onBlur: PropTypes.func,
    customBlurValidator: PropTypes.func,
    classWrapper: PropTypes.string,
    noEmoji: PropTypes.bool,
    blockBodyPointerEvents: PropTypes.bool,
};

export default ListNameExists;
