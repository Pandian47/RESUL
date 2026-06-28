import { circle_zoom_fill_medium } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useEffect } from 'react';
import ReactPhoneInput from 'react-phone-input-2';
import PropTypes from 'prop-types';
import { Controller } from 'react-hook-form';
import { get } from 'lodash';

import { ENTER_VALID_DIAL_CODE, ENTER_VALID_PHONE_NO } from 'Constants/GlobalConstant/ValidationMessage';
import { phoneDialCode } from './constant';
import { getmasterData } from 'Utils/modules/masterData';
import { getUserDetails } from 'Utils/modules/crypto';
import { NO_RECORDS_FOUND, SEARCH } from 'Constants/GlobalConstant/Placeholders';
// import { setMyProfileData } from 'Reducers/preferences/myProfile/reducer';
const RSPhoneInput = ({
    className = '',
    name,
    isNewTheme,
    rules,
    control,
    defaultValue,
    extraInputProps,
    handleOnchange = (f, s, t) => {},
    country = 'us',
    required,
    label,
    handleOnBlur = (f, s, t) => {},
    setError = () => {},
    clearErrors = () => {},
    errors,
    isLoading = false,
    isChangeMobNumber = false,
    isCountryCodeRetrive = false,
    countryCodeEditable = false,
    ...rest
}) => {
    const isIpAddressData = JSON.parse(localStorage.getItem('ipAddressData'));
    country = isIpAddressData?.countryCode?.toLowerCase();
    // const { data } = useSelector(({ myProfileReducer }) => myProfileReducer);
    const {countryId = 3} = getUserDetails();
    const {  countryMasterList } = getmasterData();
    const matchedCountry = countryMasterList?.find((c) => c?.countryID === countryId);
    const defaultCountryCode = matchedCountry?.countryCode?.toLowerCase() || country;
    const matchedPhoneDialCode = phoneDialCode.find((o) => o.countryCode === defaultCountryCode);
    // const currentPhoneDialCode = phoneDialCode.find((o) => o.dialCode === '+' + data?.userinfo?.countryCodeMobile);

    // Update search icon in phone input dropdown
    useEffect(() => {
        const updateSearchIcon = () => {
            // Find search input in phone dropdown
            const searchInputs = document.querySelectorAll('.search-box');
            searchInputs.forEach((input) => {
                const parent = input.parentElement;
                if (parent && !parent.querySelector(`.${circle_zoom_fill_medium}`)) {
                    // Create icon element
                    const iconElement = document.createElement('i');
                    iconElement.className = `${circle_zoom_fill_medium} position-absolute icon-md color-secondary-grey`;
                    iconElement.style.cssText = 'top: 50%; right: 3px; transform: translateY(-50%); pointer-events: none;';
                    
                    // Add relative positioning to parent if needed
                    if (getComputedStyle(parent).position === 'static') {
                        parent.style.position = 'relative';
                    }
                    
                    parent.appendChild(iconElement);
                }
            });
        };

        updateSearchIcon();

        // Observe DOM changes to handle dynamically rendered dropdowns
        const observer = new MutationObserver(updateSearchIcon);
        observer.observe(document.body, { 
            childList: true, 
            subtree: true 
        });

        return () => observer.disconnect();
    }, []);

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
                        className={`rs-phone-input ${_isEmpty ? 'errorContainer' : ''} ${
                            isNewTheme ? 'rs-input-placeholder-wrapper' : ''
                        } ${required ? 'rs-phone-input-required' : ''} `}
                    >
                        {/* {_isEmpty && <div className="validation-message">{get(errors, [name, 'message'], '')}</div>} */}
                        <ReactPhoneInput
                            {...field}
                            onChange={(data, value, e, formattedvalue) => {
                                handleOnchange(data, value, e, formattedvalue);
                                let phoneValue = data;
                                if (isCountryCodeRetrive && value?.dialCode && value?.countryCode) {
                                    phoneValue = data.startsWith('+') ? data : `+${data}`;
                                }
                                onChange(phoneValue);
                                clearErrors(name);
                            }}
                            enableSearch={true}
                            countryCodeEditable={countryCodeEditable}
                            searchPlaceholder={SEARCH}
                            searchNotFound={NO_RECORDS_FOUND}
                            onBlur={(e, data, value) => {
                                onBlur(e);
                                const {
                                    target: { value: eventValue },
                                } = e;
                                const { format, dialCode } = data;
                                if (!phoneDialCode.map((e) => e.dialCode).includes(eventValue?.split(' ')[0])) {
                                    setError(name, {
                                        type: 'custom',
                                        message: ENTER_VALID_DIAL_CODE,
                                    });
                                    return;
                                }
                                const duplicate = Array.from(eventValue.substr(dialCode?.length + 1))
                                    .filter(Number)
                                    .every((e, i, arr) => e === arr[2]);
                                const valueWithoutFormat = eventValue?.split(' ')[1];
                                if (!valueWithoutFormat?.startsWith('00') || !valueWithoutFormat?.startsWith('11')) {
                                    //  if (!PHONEINPUT.test(valueWithoutFormat))
                                    if (!eventValue?.split('+')[1]?.startsWith('0')) {
                                        if (
                                            !valueWithoutFormat?.startsWith('0') &&
                                            !valueWithoutFormat?.startsWith('(0')
                                        ) {
                                            if (!!valueWithoutFormat && eventValue?.length !== format?.length) {
                                                setError(name, {
                                                    type: 'custom',
                                                    message: ENTER_VALID_PHONE_NO,
                                                });
                                            } else {
                                                clearErrors(name);
                                            }
                                        } else {
                                            setError(name, {
                                                type: 'custom',
                                                message: ENTER_VALID_PHONE_NO,
                                            });
                                        }
                                    } else {
                                        setError(name, {
                                            type: 'custom',
                                            message: ENTER_VALID_PHONE_NO,
                                        });
                                    }
                                } else {
                                    setError(name, {
                                        type: 'custom',
                                        message: ENTER_VALID_PHONE_NO,
                                    });
                                }
                                if (duplicate) {
                                    setError(name, {
                                        type: 'custom',
                                        message: ENTER_VALID_PHONE_NO,
                                    });
                                }
                                handleOnBlur(e, data, value, errMsg);
                            }}
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
                            country={isChangeMobNumber ? matchedPhoneDialCode?.countryCode ?? defaultCountryCode : matchedPhoneDialCode?.countryCode ?? defaultCountryCode}
                            {...rest}
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

RSPhoneInput.propTypes = {
    control: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    setError: PropTypes.func,
    clearErrors: PropTypes.func,
    className: PropTypes.string,
    defaultValue: PropTypes.string,
    rules: PropTypes.object,
    setValue: PropTypes.func,
    required: PropTypes.bool,
    extraInputProps: PropTypes.object,
    handleOnchange: PropTypes.func,
    handleOnBlur: PropTypes.func,
    isLoading: PropTypes.bool,
    isChangeMobNumber: PropTypes.bool,
    isCountryCodeRetrive: PropTypes.bool,
    country: PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.object, PropTypes.number]),
    countryCodeEditable: PropTypes.bool,
};

export default memo(RSPhoneInput);
