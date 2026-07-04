import { memo, useRef } from 'react';
import ReactPhoneInput from 'react-phone-input-2';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Controller } from 'react-hook-form';
import { get } from 'Utils/modules/lodashReplacements';

import { phoneDialCode } from './constant';
// import { setMyProfileData } from 'Reducers/preferences/myProfile/reducer';
const RSReactPhoneInput = ({
    className = '',
    name,
    isNewTheme,
    rules,
    control,
    defaultValue = '',
    extraInputProps,
    handleOnchange = (f, s, t) => { },
    country = 'us',
    required,
    label,
    handleOnBlur = (f, s, t) => { },
    handleKeyDown = (e) => { },
    setError,
    clearErrors,
    errors,
    isLoading = false,
    isChangeMobNumber = false,
    masks = {},
    countryCodeEditable = false,
    ...rest
}) => {
    const phoneDataRef = useRef(null);
    const isIpAddressData = JSON.parse(localStorage.getItem('ipAddressData'));
    country = isIpAddressData?.countryCode?.toLowerCase();
    const { data } = useSelector(({ myProfileReducer }) => myProfileReducer);
    const currentPhoneDialCode = phoneDialCode.find((o) => o.dialCode === '+' + data?.userinfo?.countryCodeMobile);
    return (
        <Controller
            rules={rules}
            control={control}
            name={name}
            defaultValue={defaultValue}
            render={({ field: { ref, onChange, onBlur, ...field }, fieldState: { error } }) => {
                const _isEmpty = get(error, 'message', '')?.length > 0;
                const errMsg = get(error, 'message', '');
                return (
                    <div
                        className={`${_isEmpty ? 'errorContainer' : ''} position-relative rs-phone-input ${isNewTheme ? 'rs-input-placeholder-wrapper' : ''
                            } ${required ? 'rs-phone-input-required' : ''} `}
                    >
                        {_isEmpty && <div className="validation-message">{get(errors, [name, 'message'], '')}</div>}
                        <ReactPhoneInput
                            {...field}
                            onChange={(data, value, e, formattedvalue) => {
                                const dataObj = [data, value].find((o) => o && typeof o === 'object' && 'format' in o);
                                if (dataObj) {
                                    phoneDataRef.current = dataObj;
                                }
                                onChange(formattedvalue); // Update react-hook-form
                                handleOnchange(data, value, e, formattedvalue);
                            }}
                            onMount={(value, data, formattedValue) => {
                                if (data) {
                                    phoneDataRef.current = data;
                                }
                                if (rest.onMount) {
                                    rest.onMount(value, data, formattedValue);
                                }
                            }}
                            onKeyDown={(e) => {
                                const phoneData = phoneDataRef.current;
                                handleKeyDown(e, phoneData);
                            }}
                            masks={masks}
                            enableSearch={true}
                            searchPlaceholder={'Search...'}
                            searchNotFound={'No results found'}
                            onBlur={(e, data, value) => {
                                handleOnBlur(e, data, value);
                            }}
                            // onBlur={(data, value, e) => {
                            //     const {
                            //         target: { value: eventValue },
                            //     } = data;
                            //     const { format } = value;
                            //     const valueWithoutFormat = eventValue.split(' ')[1];
                            //     if (!eventValue.split('+')[1]?.startsWith('0')) {
                            //         if (!valueWithoutFormat?.startsWith('0') && !valueWithoutFormat?.startsWith('(0')) {
                            //             if (!!valueWithoutFormat && eventValue?.length !== format?.length) {
                            //                 setError(name, {
                            //                     type: 'custom',
                            //                     message: err.ENTER_VALID_PHONE_NO,
                            //                 });
                            //             } else {
                            //                 clearErrors(name);
                            //             }
                            //         } else {
                            //             setError(name, {
                            //                 type: 'custom',
                            //                 message: err.ENTER_VALID_PHONE_NO,
                            //             });
                            //         }
                            //     } else {
                            //         setError(name, {
                            //             type: 'custom',
                            //             message: err.ENTER_VALID_PHONE_NO,
                            //         });
                            //     }
                            //     onBlur(data, value, e);
                            //     handleOnBlur(data, value, e);
                            // }}
                            specialLabel={
                                <span>
                                    {/* {_isEmpty ? errMsg : label} {required && <span className="required">*</span>} */}
                                    {_isEmpty ? errMsg : label}
                                </span>
                            }
                            inputExtraProps={{
                                ref,
                                ...extraInputProps,
                            }}
                            country={isChangeMobNumber ? currentPhoneDialCode.countryCode : country}
                            {...rest}
                            countryCodeEditable={countryCodeEditable}
                        />
                        {isLoading && (
                            <div className="rs-inputIcon-wrapper">
                                <div className="segment_loader"></div>
                            </div>
                        )}
                    </div>
                );
            }}
        />
    );
};

RSReactPhoneInput.propTypes = {
    control: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    setError: PropTypes.func.isRequired,
    clearErrors: PropTypes.func.isRequired,
    className: PropTypes.string,
    defaultValue: PropTypes.string,
    rules: PropTypes.object,
    setValue: PropTypes.func,
    required: PropTypes.bool,
    extraInputProps: PropTypes.object,
    handleOnchange: PropTypes.func,
    handleOnBlur: PropTypes.func,
    handleKeyDown: PropTypes.func,
    isLoading: PropTypes.bool,
    isChangeMobNumber: PropTypes.bool,
    country: PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.object, PropTypes.number]),
    masks: PropTypes.object,
    countryCodeEditable: PropTypes.bool,
};

export default memo(RSReactPhoneInput);
