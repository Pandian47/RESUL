import { NEW_EMAIL_REGEX, UPDATED_EMAIL_ADDRESS } from 'Constants/GlobalConstant/Regex';
import { ENTER_VALID_EMAIL, ENTER_VALID_EMAIL_ADDRESS, ENTER_VALID_PHONE_NO, REQUEST_APPROVAL_1_EMAIL, REQUEST_APPROVAL_DUPLICATE_EMAIL, REQUEST_APPROVAL_DUPLICATE_NUMBER, REQUEST_APPROVAL_EMAIL_ID, REQUEST_APPROVAL_INVALID_NUMBER, REQUEST_APPROVAL_SELECT_EMAIL, REQUEST_APPROVAL_VALDIATE_NUMBER, REQUEST_APPROVAL_VALD_EMAIL, SELECT_APPROVER_NAME } from 'Constants/GlobalConstant/ValidationMessage';
import { EMAIL_APPROVAL_RULES } from 'Constants/GlobalConstant/Rules';
import { ADD, ADD_NEW_MAIL_ADDRESS, APPROVAL_SETTINGS, CLEAR, EMAIL, ENTER_EMAIL_ID, MANDATORY, REMOVE, REQUEST_APPROVAL, REQUEST_APPROVAL_AUTHORIZED_APPROVERS, REQUEST_APPROVAL_CONCERNED_PERSON, REQUEST_APPROVAL_REQUEST, REQUEST_APPROVAL_TEST_EMAIL, SEND, SEND_APPROVAL_REQUEST, TEST_EMAIL } from 'Constants/GlobalConstant/Placeholders';
import { clear_medium, mandatory_mini, settings_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { get as _get } from 'Utils/modules/lodashReplacements';
import { Col, Row } from 'react-bootstrap';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import RSTooltip from 'Components/RSTooltip';
import RSInput from 'Components/FormFields/RSInput';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RequestApprovalSettings from './Component/RequestApprovalSettings';

import { selectIcon } from 'Utils/modules/display';
import { UpdateState } from 'Utils/modules/misc';

import { RSPrimaryButton } from 'Components/Buttons';
import { INITIAL_STATE, validateTestEmail, renderItem } from './constant';
import { useDispatch, useSelector } from 'react-redux';
import { getRequestApprovalUserDetails, getUserListCampaign } from 'Reducers/globalState/request';
import { getRequestApprovalList, getSessionId } from 'Reducers/globalState/selector';
import { emailList } from 'Reducers/communication/createCommunication/Create/selectors';
import useQueryParams from 'Hooks/useQueryParams';
import { PhoneNumberUtil } from 'google-libphonenumber';
import RSReactPhoneInput from 'Components/FormFields/RSPhoneInput/RSReactPhoneInput';
import { COUNTRY_MASK } from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Create/Tabs/VMS/constant';

const NewAttributeFormBtn = lazy(
    () => import('Pages/AuthenticationModule/Preferences/Pages/FormGenerator/Components/NewAttributeFormBtn/NewAttributeFormBtn'),
);

const NewAttributeFormBtnLazy = (props) => (
    <Suspense fallback={null}>
        <NewAttributeFormBtn {...props} />
    </Suspense>
);

const RequestApproval = ({
    name = 'approvalList.name',
    parent,
    isCustomapproval,
    isSettings = true,
    isSendButton = false,
    onRequestApproval = () => {},
    isPlus = true,
    isOffset = true,
    isDynamic = false,
    isDynamicList = false,
    isTarget = false,
    isCustomEnterMail = true,
    isEnable = '',
    isAudience = false,
    isOffSet,
    isApprovalSettings,
    testPreviewConfigDetail = {
        fieldType: '',
        fieldLabel: REQUEST_APPROVAL_TEST_EMAIL,
        fieldName: 'approvalList.testEmail',
        testEmail: false,
    },
    onlyTestMessage = false,
    getCountry = () => {},
    RfaCallBack = () => {},
    channelType = '',
    isClickOff = false,
    isPhoneLoading = false,
    isSendLoading = false,
}) => {
    const {
        control,
        trigger,
        setValue,
        clearErrors,
        setError,
        getValues,
        reset,
        formState: { errors, isValid },
        unregister,
        watch,
    } = useFormContext();

    const location = useQueryParams('/communication/create-communication');
    const { clientId, departmentId, userId } = useSelector((state) => getSessionId(state));
    const { isCurrentBURFAStatus } = useSelector(({ globalstate }) => globalstate);
    const approvalList = useSelector((state) => getRequestApprovalList(state));
    const { campaignDetails } = useSelector((state) => emailList(state));
    const [duplicateTestEmail, setDuplicateEmail] = useState(false);
    const [duplicateInputTestEmail, setInputDuplicateEmail] = useState(false);
    const [emailsFromDropdown, setEmailsFromdropdown] = useState([]);
    const [phoneInputFocus, setPhoneInputFocus] = useState(false);
    const [phoneFocus, setPhoneFocus] = useState(false);
    const [users, setUsers] = useState([]);
    const [longNumber, setLongNumber] = useState(52);
    const [country, setCountry] = useState('');
    // console.log('country: ', country);
    const [mask, setMask] = useState(COUNTRY_MASK);
    const isAddingCommaRef = useRef(false);
    const secondInputRef = useRef(null);
    const firstPhoneInputRef = useRef(null);

    const dispatch = useDispatch();
    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: name,
    });
    const approvalSettings = useWatch({
        control,
        name: 'approvalList',
    });
    const deliveryType = watch('deliveryType');
    // console.log('approvalSettings: ', approvalSettings);
    const approvalListRequestApproval = _get(approvalSettings, 'requestApproval', false);
    const [requestApprovalSettings, setRequestApprovalSettings] = useState({
        approvalFrom: approvalSettings?.approvalFrom,
        approvalCount: approvalSettings?.approvalCount,
        followHierarchy: approvalSettings?.followHierarchy,
    });
    const [state, setState] = useState(INITIAL_STATE);
    const [isEmpty, setIsEmpty] = useState(false);
    const [currentInputEmail, setCurrentInputEmail] = useState('');
    const isApprovalInputEmail = _get(approvalSettings, 'isApprovalInputEmail', false);
    const isRequestApproval = _get(approvalSettings, 'requestApproval', false);
    const showSendButtonColumn =
        !isDynamic &&
        ((!isCustomapproval && !isRequestApproval) || (isSendButton && isRequestApproval));
    // const testEmail = _get(approvalSettings, 'testEmail.email', '');
    const testEmail = _get(approvalSettings, 'testEmail', '');
    const testEmailFromInput = _get(approvalSettings, 'testEmail.email', '');
    useEffect(() => {
        if (!isDynamic) {
            const payload = {
                clientId,
                // departmentId,
                userId,
            };
            //  if (approvalSettings?.requestApproval) {
            let customEmail = isCustomEnterMail ? true : false;
            if (!customEmail && !approvalList?.length)
                dispatch(getRequestApprovalUserDetails({ payload: { ...payload, departmentId } }));
            else {
                if (!approvalList?.length)
                    dispatch(getUserListCampaign({ payload: { ...payload, loggedinusertype: 0 } }));
            }
        }
        // }
        //  }, [approvalSettings?.requestApproval]);
    }, []);

    // useEffect(() => {
    //     if (isCurrentBURFAStatus) {
    //         setValue('approvalList.requestApproval', true);
    //         const nameArray = getValues('approvalList.name');
    //         if (!nameArray || !Array.isArray(nameArray) || nameArray.length === 0) {
    //             setValue('approvalList.name', [{ approverName: '', mandatory: false }]);
    //         } else {
    //             setValue('approvalList.name[0].approverName', '');
    //         }
    //     } else {
    //         setValue('approvalList.requestApproval', false);
    //     }
    // }, [isCurrentBURFAStatus]);

    useEffect(() => {
        if (deliveryType?.id === 5) {
            // Automatically check Request for approval checkbox when deliveryType.id === 5
            setValue('approvalList.requestApproval', true);
            const nameArray = getValues('approvalList.name');
            if (!nameArray || !Array.isArray(nameArray) || nameArray.length === 0) {
                setValue('approvalList.name', [{ approverName: '', mandatory: false }]);
            } else {
                setValue('approvalList.name[0].approverName', '');
            }
        }
    }, [deliveryType?.id, setValue, getValues]);

    useEffect(() => {
        if (isDynamic) {
            const payload = {
                clientId,
                // departmentId,
                userId,
            };
            if (approvalSettings?.requestApproval) {
                let customEmail = isCustomEnterMail ? true : false;
                if (!customEmail && !approvalList?.length)
                    dispatch(getRequestApprovalUserDetails({ payload: { ...payload, departmentId } }));
                else {
                    if (!approvalList?.length)
                        dispatch(getUserListCampaign({ payload: { ...payload, loggedinusertype: 0 } }));
                }
                // }
            }
        }
    }, [approvalSettings?.requestApproval]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            const isOutsideFirstInput =
                firstPhoneInputRef.current && !firstPhoneInputRef.current.contains(event.target);
            const isOutsideSecondInput = !secondInputRef.current || !secondInputRef.current.contains(event.target);

            if (isOutsideFirstInput && isOutsideSecondInput) {
                setPhoneFocus(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // useEffect(() => {
    //     if (
    //         checkTrigger(location?.campaignType, location?.endDate) ||
    //         !statusIdCheck(Object.keys(campaignDetails)?.length > 1 ? campaignDetails?.content[0]?.statusId : null) ||
    //         checkRFAApproved(
    //             Object.keys(campaignDetails)?.length > 1 ? campaignDetails?.content[0]?.statusId : null,
    //             campaignDetails?.requestForApproval?.approvarList,
    //         )
    //     ) {
    //         setIsClickOff(true);
    //     } else {
    //         setIsClickOff(false);
    //     }
    // }, [location?.campaignType, location?.endDate, campaignDetails?.content?.[0]?.statusId]);

    const safeApprovalList = useMemo(
        () => (Array.isArray(approvalList) ? approvalList : []),
        [approvalList],
    );

    const approvalMailList = useMemo(() => {
        const selectedApproverNames = approvalSettings?.name?.map(({ approverName }) => approverName) || [];
        const seenUserIds = new Set();

        return safeApprovalList.filter((item) => {
            const userIdKey = item?.userId;
            if (userIdKey == null || userIdKey === '') {
                return false;
            }
            if (seenUserIds.has(userIdKey)) {
                return false;
            }
            seenUserIds.add(userIdKey);

            return (
                userIdKey !== userId &&
                !selectedApproverNames.includes(item?.name) &&
                item?.name?.trim() !== ''
            );
        });
    }, [approvalSettings?.name, safeApprovalList, userId]);
    const diableAddIcon = (index) => (fields?.length > 2 && index === 0 ? 'click-off' : '');

    const addApprovalList = (index) => {
        //console.log("approver settings",approvalSettings)
        if (index === 0) {
            var valueArr = approvalSettings?.name?.map(function (item) {
                if (typeof item.approverName != 'object') {
                    return item.approverName ? item.approverName : '';
                } else {
                    return item.approverName ? item.approverName?.email : '';
                }
            });

            let isDuplicate = true;
            // valueArr[index] = e.email;
            if (valueArr.filter((word) => word.includes(','))?.length != 1) {
                if (valueArr?.length > 1) {
                    isDuplicate = valueArr.some(function (item, idx) {
                        // if (item.split(',')?.length < 1) {
                        return valueArr.indexOf(item) != idx;
                        // }
                    });
                } else {
                    isDuplicate = false;
                }
            } else {
                isDuplicate = true;
            }
            //console.log("errors", approvalList)

            //console.log('isDuplicate: ', isDuplicate);
            let findIndex = -1;
            //  findIndex = approvalSettings?.name?.findIndex(
            //     ({ approverName }) => approverName === '' || !UPDATED_EMAIL_ADDRESS.test(approverName?.email),
            // );

            for (let i = 0; i < valueArr?.length; i++) {
                if (valueArr[i] === '') {
                    setError(`${name}[${i}].approverName`, {
                        type: 'custom',
                        message: REQUEST_APPROVAL_EMAIL_ID,
                    });
                }
            }
            trigger(`approvalList.name[${findIndex}].approverName`);
            if (findIndex === -1 && !isDuplicate) {
                if (errors.approvalList == undefined) {
                    append({ approverName: '' });
                    clearErrors(`${name}[${index}].approverName`);
                }
            } else {
                setError(`${name}[${index}].approverName`, {
                    type: 'custom',
                    message: REQUEST_APPROVAL_DUPLICATE_EMAIL,
                });

                trigger(`approvalList.name[${findIndex}].approverName`);
            }
        } else {
            //debugger
            if (index === 1) {
                clearErrors(`${name}[0].approverName`);
            }
            setValue(`${parent}.approvalFrom`, 'All');
            setRequestApprovalSettings({
                approvalFrom: 'All',
            });
            remove(index);
            clearErrors(`${name}[${index}].approverName`);
        }
    };

    const isMandatoryValid = useMemo(() => {
        const mandatorySettings = _get(approvalSettings, 'name', []).filter((setting) => setting.mandatory === true);
        return (
            _get(approvalSettings, 'approvalFrom', '') === 'Any' &&
            mandatorySettings?.length !== Number(_get(approvalSettings, 'approvalCount', false))
        );
    }, [approvalSettings?.name]);

    const handleTestMailValue = (data) => {
        const [status, message] = validateTestEmail(data.target.value);
        if (status) {
            setError(`approvalList.testEmail`, {
                type: 'custom',
                message,
            });
        } else {
            clearErrors(`approvalList.testEmail`);
        }
        return status ? message : true;
    };

    const handlePhoneInput = ({ phone, value, formattedValue }) => {
        // Skip if we're programmatically adding a comma
        if (isAddingCommaRef.current) {
            isAddingCommaRef.current = false;
            return;
        }
        const { dialCode, countryCode, format } = value;
        const phoneUtil = PhoneNumberUtil.getInstance();

        const previousDialCode = getValues('approvalList.dialCode');
        const nextDialCode = `+${dialCode}`;

        if (previousDialCode !== nextDialCode) {
            clearErrors('approvalList.testPhoneNumber');
            setValue(`approvalList.dialCode`, nextDialCode);
            setValue(`approvalList.maskDetail`, format);

            const isSwitchingToIndonesia = nextDialCode === '+62';

            if (isSwitchingToIndonesia) {
                setTimeout(() => {
                    if (secondInputRef.current) {
                        const inputElement = secondInputRef.current.querySelector('input');
                        if (inputElement) {
                            inputElement.focus();
                            // Move cursor to end of input
                            const length = inputElement.value?.length || 0;
                            inputElement.setSelectionRange(length, length);
                        }
                    }
                }, 150);
            }

            if (format) {
                let str = format;
                let formatStr = str.substring(str.indexOf(' ') + 1);
                let maskAry = formatStr.match(/\./g);
                let maskString = maskAry.join('');
                let len = parseInt(maskString?.length, 10) + parseInt(dialCode?.length, 10);
                setLongNumber(len);
            }
            return;
        }

        setValue(`approvalList.dialCode`, nextDialCode);

        // Preserve comma if it exists in the current value
        const currentValue = getValues(testPreviewConfigDetail?.fieldName);
        const shouldPreserveComma = currentValue && currentValue.endsWith(',');

        setValue(testPreviewConfigDetail?.fieldName, shouldPreserveComma ? currentValue : formattedValue);
        setValue(`approvalList.maskDetail`, format);

        if (format) {
            let str = format;
            let formatStr = str.substring(str.indexOf(' ') + 1);
            let maskAry = formatStr.match(/\./g);
            let maskString = maskAry.join('');
            let len = parseInt(maskString?.length, 10) + parseInt(dialCode?.length, 10);
            setLongNumber(len);
        }

        const validationDialCode = `+${dialCode}`;

        if (!formattedValue || !formattedValue.startsWith(validationDialCode)) {
            setError('approvalList.testPhoneNumber', {
                type: 'custom',
                message: REQUEST_APPROVAL_INVALID_NUMBER,
            });
            return;
        }

        const phNo = formattedValue.slice(validationDialCode.length + 1).trim();
        const phAry = phNo.length
            ? phNo
                  .split(',')
                  .map((num) => num.trim())
                  .filter((num) => num.length > 0)
            : [];

        if (!phAry.length || phAry.length === 0) {
            setError('approvalList.testPhoneNumber', {
                type: 'custom',
                message: REQUEST_APPROVAL_INVALID_NUMBER,
            });
            return;
        }

        const duplicates = phAry.filter((num, index) => phAry.indexOf(num) !== index);
        if (duplicates.length > 0) {
            setError('approvalList.testPhoneNumber', {
                type: 'custom',
                message: REQUEST_APPROVAL_DUPLICATE_NUMBER,
            });
            return;
        }

        const maskWithOutCountryCode = format?.slice(validationDialCode.length + 1);
        const countryPhoneLength = maskWithOutCountryCode?.split(',')[0]?.length;

        if (!countryPhoneLength) {
            clearErrors('approvalList.testPhoneNumber');
            return;
        }

        let isValid = true;
        for (let i = 0; i < phAry.length; i++) {
            const item = phAry[i].trim();

            if (!item || item.length === 0) {
                isValid = false;
                break;
            }

            if (item.length > countryPhoneLength) {
                isValid = false;
                break;
            }

            if (item.length === countryPhoneLength) {
                try {
                    const number = phoneUtil.parse(item, countryCode.toUpperCase());
                    const isValidNumber = phoneUtil.isValidNumber(number);
                    if (!isValidNumber) {
                        isValid = false;
                        break;
                    }
                } catch (err) {
                    isValid = false;
                    break;
                }
            } else {
                isValid = false;
                break;
            }
        }

        if (!isValid) {
            setError('approvalList.testPhoneNumber', {
                type: 'custom',
                message: ENTER_VALID_PHONE_NO,
            });
        } else {
            clearErrors('approvalList.testPhoneNumber');
        }
    };

    const handleKeyDown = (e, phoneData) => {
        setPhoneFocus(true);
        if (e.key === ',') {
            e.preventDefault();

            // Extract country code and dialCode from phoneData
            const { dialCode: phoneDialCode, countryCode } = phoneData || {};

            const value = getValues(testPreviewConfigDetail?.fieldName);
            const { dialCode } = getValues('approvalList');

            if (!value || !dialCode) {
                return;
            }

            // Prevent consecutive commas
            if (value.endsWith(',')) {
                return;
            }

            const validationDialCode = dialCode.startsWith('+') ? dialCode : `+${dialCode}`;

            // Remove the dial code from the start to get the number part
            const phNo = value.startsWith(validationDialCode) ? value.slice(validationDialCode.length).trim() : value;

            const phAry = phNo
                .split(',')
                .map((segment) => segment.trim())
                .filter((segment) => segment.length > 0);

            // Don't allow comma if the current (last) segment is empty
            if (phAry.length === 0) {
                return;
            }

            const currentSegment = phAry[phAry.length - 1];
            const digits = currentSegment.replace(/\D/g, '').length;

            if (digits === 0) {
                return;
            }

            // Validate ALL phone numbers in the array using google-libphonenumber
            const phoneUtil = PhoneNumberUtil.getInstance();
            let allValid = true;

            for (let i = 0; i < phAry.length; i++) {
                const segment = phAry[i];
                const segmentDigits = segment.replace(/\D/g, '');

                if (segmentDigits.length === 0) {
                    allValid = false;
                    break;
                }

                const fullNumberStr = `${validationDialCode}${segmentDigits}`;

                try {
                    // Use countryCode from phoneData if available
                    const number = countryCode
                        ? phoneUtil.parse(fullNumberStr, countryCode.toUpperCase())
                        : phoneUtil.parse(fullNumberStr);
                    const isValid = phoneUtil.isValidNumber(number);

                    if (!isValid) {
                        allValid = false;
                        break;
                    }
                } catch (err) {
                    allValid = false;
                    break;
                }
            }

            // If any phone number is invalid, show error and don't allow comma
            if (!allValid) {
                setError('approvalList.testPhoneNumber', {
                    type: 'custom',
                    message: ENTER_VALID_PHONE_NO || 'Invalid Phone Number',
                });
                return;
            }

            // All phone numbers are valid, clear errors
            clearErrors('approvalList.testPhoneNumber');

            // Add the comma - directly manipulate the input and trigger event
            // Don't modify the mask - COUNTRY_MASK already supports comma-separated numbers
            const newValue = value + ',';

            // Set the ref to prevent handlePhoneInput from overwriting
            isAddingCommaRef.current = true;

            // Update the form value
            setValue(testPreviewConfigDetail?.fieldName, newValue);

            // Find the actual input element and update it directly
            setTimeout(() => {
                const inputElement = e.target;
                if (inputElement) {
                    inputElement.value = newValue;

                    // Dispatch input event to trigger React's onChange
                    const inputEvent = new Event('input', { bubbles: true });
                    inputElement.dispatchEvent(inputEvent);
                }
            }, 0);
        }
    };

    const getTestPrviewComponent = (testPreviewFieldType) => {
        switch (testPreviewFieldType) {
            case 'kendoDropdown':
                return (
                    <RSKendoDropDownList
                        control={control}
                        textField={'name'}
                        dataItemKey={'userId'}
                        // className={'pr23'}
                        name={testPreviewConfigDetail?.fieldName}
                        data={safeApprovalList}
                        label={TEST_EMAIL}
                        isCustomRender
                        itemRender={(props) =>
                            renderItem(props, () => {
                                // setValue(`approvalList.isApprovalInputEmail`, true);
                                // unregister('approvalList.testEmail');
                                // reset((formState) => ({
                                //     ...formState,
                                //     approvalList: {
                                //         ...formState.approvalList,
                                //         testEmail: '',
                                //         isApprovalInputEmail: true,
                                //     },
                                // }));
                            })
                        }
                        popupSettings={{
                            popupClass: `addImportAudienceDropdownListContainer`,
                        }}
                        footer={
                            <>
                                <NewAttributeFormBtnLazy
                                    title={ADD_NEW_MAIL_ADDRESS}
                                    handleModalAttribute={() => {
                                        setValue(`approvalList.isApprovalInputEmail`, true);
                                        unregister('approvalList.testEmail');
                                    }}
                                />
                            </>
                        }
                    />
                );
            case 'phoneInput':
                return (
                    <div
                        className={`mt1 d-flex ${
                            approvalSettings?.testPhoneNumber.startsWith('+62') ? 'custom-phone-input' : ''
                        } ${phoneInputFocus ? 'p-input-focused' : ''} ${
                            errors?.approvalList?.testPhoneNumber?.message?.length ? 'p-input-error' : ''
                        } ${
                            approvalSettings?.testPhoneNumber.startsWith('+62') && phoneFocus ? 'p-country-focused' : ''
                        }`}
                    >
                        <Col sm={approvalSettings?.testPhoneNumber.startsWith('+62') ? 2 : 12}>
                            <div ref={firstPhoneInputRef} onClick={() => setPhoneFocus(true)}>
                                <RSReactPhoneInput
                                    control={control}
                                    name={testPreviewConfigDetail?.fieldName}
                                    isLoading={isPhoneLoading}
                                    onMount={(value, data, formattedValue) => {
                                        setCountry(formattedValue);
                                        getCountry(formattedValue);
                                        setValue(`approvalList.dialCode`, `+${data?.dialCode}`);
                                    }}
                                    handleOnchange={(phone, value, e, formattedValue) => {
                                        handlePhoneInput({ phone, value, formattedValue });
                                    }}
                                    handleKeyDown={(e, phoneData) => {
                                        handleKeyDown(e, phoneData);
                                        setPhoneFocus(true);
                                    }}
                                    value={approvalSettings?.testPhoneNumber ? approvalSettings?.testPhoneNumber : ''}
                                    countryCodeEditable={false}
                                    enableLongNumbers={longNumber}
                                    placeholder={''}
                                    onClick={(event, data) => {
                                        setPhoneFocus(true);
                                    }}
                                    country={country}
                                    masks={{ ...mask }}
                                    setError={setError}
                                    clearErrors={clearErrors}
                                    handleOnBlur={(phone, value, e, formattedValue) => {
                                        setPhoneFocus(false);
                                    }}
                                    extraInputProps={{
                                        onKeyDown: handleKeyDown,
                                    }}
                                    rules={{
                                        validate: (value) => {
                                            const splitPhoneNumber = value.split(' ')[1];
                                            splitPhoneNumber?.split(',')?.map((phoneNumber) => {
                                                if (phoneNumber.startsWith('00') || phoneNumber.startsWith('11')) {
                                                    return REQUEST_APPROVAL_VALDIATE_NUMBER;
                                                }
                                            });
                                            return true;
                                        },
                                    }}
                                />
                            </div>
                        </Col>
                        {approvalSettings?.testPhoneNumber.startsWith('+62') && (
                            <div ref={secondInputRef} className="w-100 mr-25">
                                <RSInput
                                    control={control}
                                    name={testPreviewConfigDetail?.fieldName}
                                    className="position-relative left-26"
                                    classWrapper="mt-1"
                                    rules={{
                                        validate: (value) => {
                                            if (!value || !value.startsWith('+62 ')) {
                                                return true;
                                            }

                                            const phoneNumberPart = value.slice(4);
                                            if (!phoneNumberPart || phoneNumberPart.trim().length === 0) {
                                                return true;
                                            }
                                            const phoneNumbers = phoneNumberPart
                                                .split(',')
                                                .map((num) => num.trim())
                                                .filter((num) => num.length > 0);
                                            for (let i = 0; i < phoneNumbers.length; i++) {
                                                const phoneNumber = phoneNumbers[i];
                                                const digitCount = phoneNumber.replace(/\D/g, '').length;

                                                if (digitCount < 10 || digitCount > 14) {
                                                    return ENTER_VALID_PHONE_NO;
                                                }
                                            }

                                            return true;
                                        },
                                    }}
                                    onKeyDown={(e) => {
                                        onlyNumbersWithComma(e);
                                    }}
                                    handleOnFocus={(e) => {
                                        setPhoneInputFocus(true);
                                    }}
                                    handleOnBlur={(e) => {
                                        setPhoneInputFocus(false);
                                    }}
                                    handleOnchange={(e) => {
                                        let inputValue = e.target.value;
                                        const dialCode = '+62';
                                        const previousValue = getValues(testPreviewConfigDetail?.fieldName) || '';
                                        const wasIndonesia = previousValue.startsWith(dialCode);
                                        const isNowIndonesia = inputValue.startsWith(dialCode);
                                        const isDeleting = inputValue.length < previousValue.length;

                                        if (wasIndonesia && !isNowIndonesia && isDeleting) {
                                            setTimeout(() => {
                                                if (firstPhoneInputRef.current) {
                                                    const inputElement =
                                                        firstPhoneInputRef.current.querySelector('input[type="tel"]') ||
                                                        firstPhoneInputRef.current.querySelector('input');
                                                    if (inputElement) {
                                                        inputElement.focus();
                                                        const length = inputElement.value?.length || 0;
                                                        inputElement.setSelectionRange(length, length);
                                                    }
                                                }
                                            }, 100);
                                            return;
                                        }
                                        if (isDeleting) {
                                            return;
                                        }

                                        if (inputValue.startsWith(dialCode) && !inputValue.startsWith('+62 ')) {
                                            const afterDialCode = inputValue.slice(dialCode.length);
                                            const trimmedAfter = afterDialCode.trimStart();
                                            if (trimmedAfter.length > 0) {
                                                inputValue = dialCode + ' ' + trimmedAfter;
                                            } else if (
                                                inputValue.length > dialCode.length &&
                                                inputValue[dialCode.length] !== ' '
                                            ) {
                                                inputValue = dialCode + ' ' + afterDialCode;
                                            } else if (inputValue.length === dialCode.length) {
                                                inputValue = dialCode + ' ';
                                            }

                                            e.target.value = inputValue;
                                            const cursorPosition = inputValue.length;
                                            setTimeout(() => {
                                                e.target.setSelectionRange(cursorPosition, cursorPosition);
                                                setValue(testPreviewConfigDetail?.fieldName, inputValue);
                                            }, 0);
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </div>
                );

            default:
                return (
                    <RSKendoDropDownList
                        control={control}
                        textField={'name'}
                        dataItemKey={'userId'}
                        // className={'pr23'}
                        name={testPreviewConfigDetail?.fieldName}
                        data={safeApprovalList}
                        popupSettings={{
                            popupClass: `addImportAudienceDropdownListContainer`,
                        }}
                        label={TEST_EMAIL}
                        isCustomRender
                        itemRender={(props) =>
                            renderItem(props, () => {
                                // //         // setValue(`approvalList.isApprovalInputEmail`, true);
                                // //         // unregister('approvalList.testEmail');
                                // //         // reset((formState) => ({
                                // //         //     ...formState,
                                // //         //     approvalList: {
                                // //         //         ...formState.approvalList,
                                // //         //         testEmail: '',
                                // //         //         isApprovalInputEmail: true,
                                // //         //     },
                                // //         // }));
                            })
                        }
                        footer={
                            <>
                                <NewAttributeFormBtnLazy
                                    title={ADD_NEW_MAIL_ADDRESS}
                                    handleModalAttribute={() => {
                                        setValue(`approvalList.isApprovalInputEmail`, true);
                                        unregister('approvalList.testEmail');
                                    }}
                                />
                            </>
                        }
                    />
                );
        }
    };

    return (
        <Fragment>
            <>
            {isCustomapproval && (
                <div
                    className={`form-group ${isEnable} ${isAudience && !approvalListRequestApproval ? 'mb0' : ''} ${
                        isAudience ? 'audienceRFA' : 'rfa'
                    } `}
                >
                        {/* <Row className={isValid || isRequestApproval ? '' : 'click-off'}> */}
                        <Row className={''}>
                            {/* <Col sm={{ offset: 1, span: 2 }}></Col> */}
                            <Col sm={{ ...(isCustomapproval && isOffset && { offset: 3 }), span: 6 }}>
                                <RSCheckbox
                                    control={control}
                                    name={`approvalList.requestApproval`}
                                    labelName={REQUEST_APPROVAL}
                                    popover
                                    className={deliveryType?.id === 5 ? 'pe-none click-off' : ''}
                                    disabledchk={deliveryType?.id === 5}
                                    popover_content={REQUEST_APPROVAL_CONCERNED_PERSON}
                                    //popover_position={'bottom'}
                                    isDynamic={
                                        getValues('approvalList.requestApproval') && isCurrentBURFAStatus
                                            ? true
                                            : (isDynamic && getValues('isMDC')) || isTarget || isDynamicList
                                            ? false
                                            : true
                                    }
                                    isError={true}
                                    handleChange={(e) => {
                                        if (deliveryType?.id === 5 && !e.target.checked) {
                                            // Prevent unchecking when deliveryType.id === 5
                                            return;
                                        }
                                        if (!e.target.checked) {
                                            replace([{ approverName: '' }]);
                                            setValue('approvalList.testEmail', '');
                                            clearErrors('approvalList');
                                        } else {
                                            replace([{ approverName: '' }]);
                                            setValue('approvalList.name[0].approverName', approvalSettings?.testEmail);
                                            clearErrors('approvalList.requestApproval');
                                        }
                                    }}
                                />
                            </Col>
                        </Row>
                </div>
                )}
                <div className={`form-group mb10 `}>
                    <Row className={`requestApprovalBlock ${isAudience && !approvalListRequestApproval ? 'mb0' : ''}`}>
                        <>
                            <Col sm={isOffSet ? { offset: 0, span: isDynamic ? 2 : 3 } : { offset: 1, span: 2 }}>
                                {!isCustomapproval && (
                                    <label className="control-label-left">
                                        {isRequestApproval
                                            ? REQUEST_APPROVAL_REQUEST
                                            : testPreviewConfigDetail?.fieldLabel}
                                    </label>
                                )}
                                {isCustomapproval && isRequestApproval && (
                                    <label className="control-label-left">{SEND_APPROVAL_REQUEST}</label>
                                )}
                            </Col>
                            <Col sm={isAudience && !isDynamic ? 7 : 6} className={`${isEnable} ${isDynamic ? 'pl30': ''}`}>
                                {!isCustomapproval && isApprovalInputEmail && !isRequestApproval && (
                                    <div className="position-relative group">
                                        <RSInput
                                            control={control}
                                            name={`approvalList.testEmail`}
                                            placeholder={TEST_EMAIL}
                                            isCustomIcon={true}
                                            rules={{
                                                validate: (data) => {
                                                    //debugger
                                                    const [status, message] = validateTestEmail(data);
                                                    return status ? message : true;
                                                },
                                            }}
                                            className="pr35"
                                            handleOnBlur={(data) => {
                                                handleTestMailValue(data);
                                            }}
                                            // handleOnchange={(data) => {
                                            //     handleTestMailValue(data);
                                            // }}
                                        />
                                        <div className="form-field-icon group-hidden group-hover-visible">
                                            <RSTooltip
                                                position="top"
                                                text={CLEAR}
                                                className="lh0 position-relative top5"
                                            >
                                                <i
                                                    className={`${clear_medium}  color-primary-red icon-md`}
                                                    onClick={() => {
                                                        setValue(`approvalList.isApprovalInputEmail`, false);
                                                        unregister('approvalList.testEmail');
                                                        setValue(`approvalList.isEmail`, false);
                                                    }}
                                                    id="rs_RequestApproval_close"
                                                ></i>
                                            </RSTooltip>
                                        </div>
                                    </div>
                                )}
                                {!isCustomapproval &&
                                    !isApprovalInputEmail &&
                                    !isRequestApproval &&
                                    // test preview render component flow
                                    getTestPrviewComponent(testPreviewConfigDetail?.fieldType)}

                                {isRequestApproval &&
                                    fields.map(({ id }, index) => {
                                        const mandatory = _get(approvalSettings?.name, `[${index}].mandatory`, false);
                                        const isCustom = _get(approvalSettings?.name, `[${index}].isCustom`, false);
                                        return (
                                            <Row
                                                key={id}
                                                className={
                                                    fields?.length === index + 1
                                                        ? 'position-relative'
                                                        : 'form-group position-relative'
                                                }
                                            >
                                                <Col sm={12}>
                                                    {!isCustom && (
                                                        <RSKendoDropDownList
                                                            required
                                                            control={control}
                                                            name={`${name}[${index}].approverName`}
                                                            textField={'name'}
                                                            dataItemKey={'userId'}
                                                            // className={'pr23'}
                                                            data={
                                                                isCustomEnterMail
                                                                    ? [
                                                                          ...approvalMailList,
                                                                          //   {
                                                                          //       userId: 0,
                                                                          //       name: '',
                                                                          //   },
                                                                      ]
                                                                    : approvalMailList
                                                            }
                                                            handleChange={(e) => {
                                                                //  clearErrors(`${name}[${index}].approverName`);
                                                            }}
                                                            label={
                                                                isDynamic
                                                                    ? `Reviewer ${index + 1}`
                                                                    : isAudience
                                                                    ? EMAIL
                                                                    : TEST_EMAIL
                                                            }
                                                            rules={{
                                                                required: SELECT_APPROVER_NAME,
                                                                validate: (e) => {
                                                                    // const [status, _] = findDuplicates(
                                                                    //     approvalSettings.name,
                                                                    //     'approverName',
                                                                    // );
                                                                    // return !status
                                                                    //     ? 'Duplicate email is not allowed'
                                                                    //     : true;
                                                                    let tempSet = new Set();
                                                                    const isDuplicate = approvalSettings?.name?.filter(
                                                                        (item, ind) => {
                                                                            const approverName = item?.approverName;
                                                                            if (typeof approverName !== 'object') {
                                                                                const trimmedName =
                                                                                    approverName?.trim();
                                                                                if (trimmedName) {
                                                                                    if (tempSet.has(trimmedName)) {
                                                                                        return true;
                                                                                    }
                                                                                    tempSet.add(trimmedName);
                                                                                    return false;
                                                                                }
                                                                            } else {
                                                                                const trimmedEmail =
                                                                                    approverName?.email?.trim();
                                                                                if (trimmedEmail) {
                                                                                    if (tempSet.has(trimmedEmail)) {
                                                                                        return true;
                                                                                    }
                                                                                    tempSet.add(trimmedEmail);
                                                                                    return false;
                                                                                }
                                                                            }
                                                                            return false;
                                                                        },
                                                                    );

                                                                    if (!isDuplicate?.length)
                                                                        clearErrors('approvalList');
                                                                    const isExist = isDuplicate?.find((duplicate) => {
                                                                        const approverName = duplicate?.approverName;

                                                                        if (typeof approverName !== 'object') {
                                                                            return (
                                                                                approverName?.trim() ===
                                                                                e?.email?.trim()
                                                                            );
                                                                        } else {
                                                                            return (
                                                                                approverName?.email?.trim() ===
                                                                                e?.email?.trim()
                                                                            );
                                                                        }
                                                                    });

                                                                    return !!isExist
                                                                        ? REQUEST_APPROVAL_DUPLICATE_EMAIL
                                                                        : true;
                                                                },
                                                                //     var valueArr = approvalSettings?.name?.map(function (
                                                                //         item,
                                                                //     ) {
                                                                //         if (typeof item.approverName != 'object') {
                                                                //             return item.approverName;
                                                                //         } else {
                                                                //             return item.approverName?.email;
                                                                //         }
                                                                //     });
                                                                //     var isDuplicate = true;
                                                                //     valueArr[index] = e.email;
                                                                //     if (valueArr?.length > 1) {
                                                                //         isDuplicate = valueArr.some(function (item, idx) {
                                                                //             return valueArr.indexOf(item) != idx;
                                                                //         });
                                                                //     } else {
                                                                //         isDuplicate = false;
                                                                //     }
                                                                //     return isDuplicate
                                                                //         ? REQUEST_APPROVAL_DUPLICATE_EMAIL
                                                                //         : true;
                                                                // },
                                                            }}
                                                            isCustomRender
                                                            popupSettings={{
                                                                popupClass: `addImportAudienceDropdownListContainer`,
                                                            }}
                                                            itemRender={(props) =>
                                                                renderItem(props, () => {
                                                                    // setValue(`${name}[${index}].isCustom`, true);
                                                                    // unregister(`${name}[${index}].approverName`);
                                                                })
                                                            }
                                                            footer={
                                                                !isAudience && (
                                                                    <NewAttributeFormBtnLazy
                                                                        title={ADD_NEW_MAIL_ADDRESS}
                                                                        handleModalAttribute={() => {
                                                                            setValue(
                                                                                `${name}[${index}].isCustom`,
                                                                                true,
                                                                            );
                                                                            unregister(
                                                                                `${name}[${index}].approverName`,
                                                                            );
                                                                        }}
                                                                    />
                                                                )
                                                            }
                                                        />
                                                    )}
                                                    {isCustom && (
                                                        <div className="position-relative group">
                                                            <RSInput
                                                                required
                                                                control={control}
                                                                name={`${name}[${index}].approverName`}
                                                                className="pr35"
                                                                handleOnBlur={(data) => {
                                                                    // const [status, message] = validateTestEmail(
                                                                    //     data.target.value,
                                                                    // );
                                                                    if (data.target.value === '') {
                                                                        setError(`${name}[${index}].approverName`, {
                                                                            type: 'custom',
                                                                            message: REQUEST_APPROVAL_VALD_EMAIL,
                                                                        });
                                                                    } else if (
                                                                        !UPDATED_EMAIL_ADDRESS.test(
                                                                            data.target.value,
                                                                        )
                                                                    ) {
                                                                        setError(`${name}[${index}].approverName`, {
                                                                            type: 'custom',
                                                                            message: REQUEST_APPROVAL_VALD_EMAIL,
                                                                        });
                                                                    } else {
                                                                        //trigger(`${name}[${index}].approverName`)
                                                                        // var valueArr = approvalSettings?.name?.map(
                                                                        //     function (item) {
                                                                        //         if (typeof item.approverName != 'object') {
                                                                        //             return item.approverName;
                                                                        //         } else {
                                                                        //             return item.approverName?.email;
                                                                        //         }
                                                                        //     },
                                                                        // );
                                                                        // var isDuplicate = true;
                                                                        // //  valueArr[index] = e.email;
                                                                        // if (valueArr?.length > 1) {
                                                                        //     isDuplicate = valueArr.some(function (
                                                                        //         item,
                                                                        //         idx,
                                                                        //     ) {
                                                                        //         return valueArr.indexOf(item) != idx;
                                                                        //     });
                                                                        // } else {
                                                                        //     isDuplicate = false;
                                                                        // }
                                                                        // if (isDuplicate) {
                                                                        //     setError(`${name}[${index}].approverName`, {
                                                                        //         type: 'custom',
                                                                        //         message:
                                                                        //             REQUEST_APPROVAL_DUPLICATE_EMAIL,
                                                                        //     });
                                                                        // } else if (!isDuplicate) {
                                                                        //     clearErrors(`${name}[${index}].approverName`);
                                                                        // }
                                                                    }
                                                                }}
                                                                rules={{
                                                                    ...EMAIL_APPROVAL_RULES,

                                                                    //debugger
                                                                    // const [status, _] = findDuplicates(
                                                                    //     approvalSettings.name,
                                                                    //     'approverName',
                                                                    // );
                                                                    // return !status
                                                                    //     ? 'Duplicate email is not allowed'
                                                                    //     : true;
                                                                    // validate: (value) => {
                                                                    //     // console.log('valuvfd', value);
                                                                    //     if (true) {
                                                                    //         return REQUEST_APPROVAL_1_EMAIL;
                                                                    //     }
                                                                    //     if (!NEW_EMAIL_REGEX.test(value)) {
                                                                    //         return ENTER_VALID_EMAIL_ADDRESS;
                                                                    //     } else {
                                                                    //         return true;
                                                                    //     }
                                                                    // },
                                                                    validate: (value) => {
                                                                        // Validate email using UPDATED_EMAIL_ADDRESS regex
                                                                        if (!UPDATED_EMAIL_ADDRESS.test(value)) {
                                                                            return REQUEST_APPROVAL_VALD_EMAIL;
                                                                        }
                                                                        let tempSet = new Set();
                                                                        const isDuplicate =
                                                                            approvalSettings?.name?.filter(
                                                                                (item, ind) => {
                                                                                    const approverName =
                                                                                        item?.approverName;

                                                                                    if (
                                                                                        typeof approverName !== 'object'
                                                                                    ) {
                                                                                        const trimmedName =
                                                                                            approverName?.trim();
                                                                                        if (trimmedName) {
                                                                                            if (
                                                                                                tempSet.has(trimmedName)
                                                                                            ) {
                                                                                                return true;
                                                                                            }
                                                                                            tempSet.add(trimmedName);
                                                                                            return false;
                                                                                        }
                                                                                    } else {
                                                                                        const trimmedEmail =
                                                                                            approverName?.email?.trim();
                                                                                        if (trimmedEmail) {
                                                                                            if (
                                                                                                tempSet.has(
                                                                                                    trimmedEmail,
                                                                                                )
                                                                                            ) {
                                                                                                return true;
                                                                                            }
                                                                                            tempSet.add(trimmedEmail);
                                                                                            return false;
                                                                                        }
                                                                                    }
                                                                                    return false;
                                                                                },
                                                                            );

                                                                        if (!isDuplicate?.length)
                                                                            clearErrors('approvalList');
                                                                        const isExist = isDuplicate?.find(
                                                                            (duplicate) => {
                                                                                const approverName =
                                                                                    duplicate?.approverName;

                                                                                if (typeof approverName !== 'object') {
                                                                                    return (
                                                                                        approverName?.trim() ===
                                                                                        value?.trim()
                                                                                    );
                                                                                } else {
                                                                                    return (
                                                                                        approverName?.email?.trim() ===
                                                                                        value?.trim()
                                                                                    );
                                                                                }
                                                                            },
                                                                        );

                                                                        return !!isExist
                                                                            ? REQUEST_APPROVAL_DUPLICATE_EMAIL
                                                                            : true;
                                                                    },
                                                                }}
                                                                placeholder={ENTER_EMAIL_ID}
                                                            />
                                                            <div className="form-field-icon group-hidden group-hover-visible">
                                                                <RSTooltip
                                                                    position="top"
                                                                    text={CLEAR}
                                                                    className="lh0 position-relative top5"
                                                                >
                                                                    <i
                                                                        className={`${clear_medium} icon-md color-primary-red`}
                                                                        onClick={() => {
                                                                            setValue(
                                                                                `${name}[${index}].isCustom`,
                                                                                false,
                                                                            );
                                                                            unregister(
                                                                                `${name}[${index}].approverName`,
                                                                            );
                                                                            // clearErrors(`${name}[0].approverName`);
                                                                        }}
                                                                    ></i>
                                                                </RSTooltip>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="position-absolute left100p top6 d-flex align-items-center">
                                                        {isPlus && (
                                                            <>
                                                                <RSTooltip
                                                                    text={
                                                                        index === 0
                                                                            ? ADD
                                                                            : REMOVE
                                                                    }
                                                                    position="top"
                                                                    className="lh0 "
                                                                >
                                                                    <i
                                                                        className={`${selectIcon(
                                                                            index,
                                                                            errors,
                                                                        )} icon-md cp  ${diableAddIcon(index)}`}
                                                                        onClick={() => addApprovalList(index)}
                                                                    ></i>
                                                                </RSTooltip>
                                                            </>
                                                        )}
                                                        {approvalSettings?.approvalFrom === 'Any' && (
                                                            <>
                                                                <RSTooltip
                                                                    text={MANDATORY}
                                                                    position="top"
                                                                    className="lh0 ml15"
                                                                >
                                                                    <span
                                                                        className={`${isApprovalSettings && 'cp'}  ${
                                                                            mandatory ? 'color-primary-red' : ''
                                                                        } cp color-primary-blue`}
                                                                        onClick={() => {
                                                                            if (mandatory) {
                                                                                setValue(
                                                                                    `${name}[${index}].mandatory`,
                                                                                    false,
                                                                                );
                                                                            } else if (isMandatoryValid)
                                                                                setValue(
                                                                                    `${name}[${index}].mandatory`,
                                                                                    true,
                                                                                );
                                                                        }}
                                                                    >
                                                                        <i
                                                                            className={`${mandatory_mini} font-xxs`}
                                                                        ></i>
                                                                    </span>
                                                                </RSTooltip>
                                                            </>
                                                        )}
                                                    </div>
                                                </Col>
                                            </Row>
                                        );
                                    })}

                                <Row className="position-relative">
                                    <Col
                                        sm={12}
                                        className={`d-flex align-items-center mt2 ${
                                            !isCustomapproval ? 'justify-content-between' : 'justify-content-end'
                                        }`}
                                    >
                                        {!isCustomapproval && !onlyTestMessage && (
                                            // <div className="flex-right"> // Commented based on Samben's input
                                            <>
                                                <Col
                                                    sm={12}
                                                    // onClick={() => {
                                                    //     if (_isObject(testEmail)) {
                                                    //         if (!Object.keys(testEmail)?.length) {
                                                    //             setError('approvalList.testEmail', {
                                                    //                 type: 'custom',
                                                    //                 message: ENTER_VALID_EMAIL,
                                                    //             });
                                                    //         }
                                                    //     }
                                                    //     if (!_isObject(testEmail)) {
                                                    //         if (!testEmail?.length) {
                                                    //             setError('approvalList.testEmail', {
                                                    //                 type: 'custom',
                                                    //                 message: ENTER_VALID_EMAIL,
                                                    //             });
                                                    //         }
                                                    //     }
                                                    // }}
                                                >
                                                    <span
                                                        className="2"
                                                        style={{
                                                            // pointerEvents: !testEmail?.length ? 'none' : 'all',
                                                            pointerEvents: !testEmail?.length ? 'all 1' : 'all 2',
                                                        }}
                                                    >
                                                        <RSCheckbox
                                                            control={control}
                                                            name={`approvalList.requestApproval`}
                                                            labelName={REQUEST_APPROVAL}
                                                            popover
                                                            popover_class={''}
                                                            popover_content={
                                                                REQUEST_APPROVAL_AUTHORIZED_APPROVERS
                                                            }
                                                            disabledchk={deliveryType?.id === 5 || isClickOff}
                                                            handleChange={(e) => {
                                                                if (deliveryType?.id === 5 && !e.target.checked) {
                                                                    // Prevent unchecking when deliveryType.id === 5
                                                                    return;
                                                                }
                                                                clearErrors('approvalList');
                                                                if (!e.target.checked) {
                                                                    const firstApprovalListEmailValue =
                                                                        getValues(`approvalList.name[0]`);

                                                                    if (firstApprovalListEmailValue?.isCustom) {
                                                                        const isNoCutomInput = [
                                                                            'sms',
                                                                            'whatsapp',
                                                                            'rcs',
                                                                        ].includes(channelType?.toLocaleLowerCase());
                                                                        if (!isNoCutomInput) {
                                                                            setValue(
                                                                                `approvalList.isApprovalInputEmail`,
                                                                                true,
                                                                            );
                                                                        }
                                                                    } else {
                                                                        setValue(
                                                                            `approvalList.isApprovalInputEmail`,
                                                                            false,
                                                                        );
                                                                    }
                                                                    if (
                                                                        channelType?.toLocaleLowerCase() === 'email' ||
                                                                        channelType?.toLocaleLowerCase() === 'notif'
                                                                    ) {
                                                                        setValue(
                                                                            'approvalList.testEmail',
                                                                            firstApprovalListEmailValue?.approverName ||
                                                                                '',
                                                                        );
                                                                    }
                                                                    replace([{ approverName: '' }]);
                                                                } else {
                                                                    if (isApprovalInputEmail) {
                                                                        replace([
                                                                            {
                                                                                approverName:
                                                                                    approvalSettings?.testEmail,
                                                                            },
                                                                        ]);
                                                                        setValue(`${name}[0].isCustom`, true);
                                                                    } else {
                                                                        replace([{ approverName: '' }]);
                                                                        // setValue('approvalList.testEmail', '');
                                                                        setValue(
                                                                            'approvalList.name[0].approverName',
                                                                            approvalSettings?.testEmail,
                                                                        );
                                                                        setValue(
                                                                            `approvalList.isApprovalInputEmail`,
                                                                            false,
                                                                        );
                                                                        setValue(`approvalList.isEmail`, false);
                                                                    }

                                                                    setValue('approvalList.testEmail', '');
                                                                }
                                                                RfaCallBack(e.target.checked);
                                                            }}
                                                            isDynamic={
                                                                getValues('approvalList.requestApproval') &&
                                                                isCurrentBURFAStatus
                                                                    ? true
                                                                    : false
                                                            }
                                                        />
                                                    </span>
                                                </Col>
                                            </>
                                        )}
                                        {approvalSettings?.name?.length > 1 && isSettings && (
                                            <div
                                                className={`${
                                                    Object.keys(errors).includes('approvalList') ? 'click-off' : ''
                                                } position-relative rs-tooltip-wrapper ${
                                                    isOffSet ? 'right0' : 'right20'
                                                }`}
                                            >
                                                <RSTooltip text={APPROVAL_SETTINGS} className="lh0">
                                                    <i
                                                        className={`${settings_medium} color-primary-blue icon-md `}
                                                        onClick={() =>
                                                            UpdateState(setState, 'isApprovalSettingsModal', true)
                                                        }
                                                    />
                                                </RSTooltip>
                                            </div>
                                        )}
                                    </Col>
                                </Row>
                                <Row>
                                    {testPreviewConfigDetail?.testEmail && !approvalSettings?.requestApproval && (
                                        <Col sm={12}>
                                            <span
                                                className="2"
                                                style={{
                                                    // pointerEvents: !testEmail?.length ? 'none' : 'all',
                                                    pointerEvents: !testEmail?.length ? 'all 1' : 'all 2',
                                                }}
                                            >
                                                <RSCheckbox
                                                    control={control}
                                                    name={`approvalList.isEmail`}
                                                    labelName={'Test Email'}
                                                    inlineFlex={true}
                                                    handleChange={(e) => {
                                                        clearErrors('approvalList.testEmail');
                                                        clearErrors('approvalList.name[0].approverName');
                                                        if (!e.target.checked) {
                                                            setValue(`approvalList.isApprovalInputEmail`, false);
                                                            unregister('approvalList.testEmail');
                                                        } else {
                                                            setValue(`approvalList.isApprovalInputEmail`, true);
                                                        }
                                                    }}
                                                />
                                            </span>
                                        </Col>
                                    )}
                                </Row>
                            </Col>

                            {showSendButtonColumn && (
                            <Col md={isDynamic ? 4 : 2}>
                                {!isCustomapproval && !isRequestApproval && (
                                    <RSPrimaryButton
                                        disabledClass={`${
                                            testPreviewConfigDetail?.fieldType === 'phoneInput' &&
                                            errors?.approvalList?.testPhoneNumber
                                                ? 'pe-none click-off'
                                                : ''
                                        } ${isSendLoading ? 'pe-none click-off' : ''}`}
                                        className={`position-relative top-12 `}
                                        isLoading={isSendLoading}
                                        blockBodyPointerEvents
                                        onClick={() => {
                                            const testFieldName = getValues(testPreviewConfigDetail?.fieldName);
                                            if (
                                                testPreviewConfigDetail?.fieldType === 'phoneInput' &&
                                                !isApprovalInputEmail
                                            ) {
                                                const phoneValue = testFieldName;
                                                const dialCode = getValues('approvalList.dialCode');

                                                if (!phoneValue || phoneValue === dialCode) {
                                                    setError('approvalList.testPhoneNumber', {
                                                        type: 'custom',
                                                        message: ENTER_VALID_PHONE_NO,
                                                    });
                                                    return;
                                                }
                                                const phoneWithoutDialCode = phoneValue.replace(dialCode, '').trim();
                                                if (!phoneWithoutDialCode || phoneWithoutDialCode.length < 3) {
                                                    setError('approvalList.testPhoneNumber', {
                                                        type: 'custom',
                                                        message: ENTER_VALID_PHONE_NO,
                                                    });
                                                    return;
                                                }
                                            }

                                            if (testFieldName || testPreviewConfigDetail?.testEmail) {
                                                onRequestApproval(approvalListRequestApproval);
                                            } else {
                                                setError('approvalList.testEmail', {
                                                    type: 'custom',
                                                    message: REQUEST_APPROVAL_SELECT_EMAIL,
                                                });
                                            }
                                        }}
                                    >
                                        {SEND}
                                    </RSPrimaryButton>
                                )}
                                {isSendButton && isRequestApproval && (
                                    <RSPrimaryButton
                                        className={`${
                                            approvalSettings?.approvalFrom === 'Any' ? 'left60' : isPlus ? 'left30' : ''
                                        } ${isPlus ? ' position-relative top-10' : 'position-relative top-10'}`}
                                        disabledClass={`${
                                            Object.keys(errors).includes('approvalList') || isClickOff || isSendLoading
                                                ? 'pe-none click-off'
                                                : ''
                                        }`}
                                        isLoading={isSendLoading}
                                        blockBodyPointerEvents
                                        onClick={() => {
                                            onRequestApproval(approvalListRequestApproval);
                                        }}
                                    >
                                        {SEND}
                                    </RSPrimaryButton>
                                )}
                            </Col>
                            )}
                        </>
                    </Row>
                </div>
                {/* Approval Settings modal */}
                <RequestApprovalSettings
                    show={state.isApprovalSettingsModal}
                    parent={parent}
                    approvalSettings={approvalSettings}
                    handleClose={() => UpdateState(setState, 'isApprovalSettingsModal', false)}
                    requestApprovalSettings={requestApprovalSettings}
                    setRequestApprovalSettings={setRequestApprovalSettings}
                />
            </>
        </Fragment>
    );
};

export default RequestApproval;
