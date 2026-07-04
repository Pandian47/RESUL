import { encryptWithAES, getUserDetails, iv, updatedPermissionList } from 'Utils/modules/crypto';
import { onKeyChar } from 'Utils/modules/inputValidators';
import { GeneratePasswordpseudorandom, GenerateUserPassword } from 'Utils/modules/passwordUtils';
import { formatName } from 'Utils/modules/formatters';
import { getmasterData } from 'Utils/modules/masterData';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { MAX_LENGTH50 } from 'Constants/GlobalConstant/Regex';
import { ENTER_PHONE, SELECT_JOBFUNCTION } from 'Constants/GlobalConstant/ValidationMessage';
import { EMAIL_RULES, FIRSTNAME_RULES, LASTNAME_RULES, PASSWORD_RULES } from 'Constants/GlobalConstant/Rules';
import { EMAIL, FIRST_NAME, LAST_NAME, MIN_8_CHARACTERS, MOBILE_NUMBER, NO_DATA_AVAILABEL, PASSWORD, PASSWORD_MAX_15_CHARACTERS } from 'Constants/GlobalConstant/Placeholders';
import { alert_medium, circle_question_mark_mini, settings_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { get as _get, size as _size, find as _find, isEmpty as _isEmpty } from 'Utils/modules/lodashReplacements';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Col, Row } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';

import CacheManager from 'Utils/cacheManager';
import RSPPophover from 'Components/RSPPophover';
import ADUserModal from './Component/AdUserAccount';
import RSInput from 'Components/FormFields/RSInput';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import RSTextarea from 'Components/FormFields/RSTextarea';
import RSPhoneInput from 'Components/FormFields/RSPhoneInput';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import ConfirmMobileNumber from 'Pages/RegistrationModule/Login/Component/KeyContactInfo/Component/ConfirmMobileNumberModal';
import { THIS_FIELD_IS_REQUIRED } from 'Constants/GlobalConstant/ValidationMessage';

import { buildPayload, INITIAL_STATE } from './constant';
import { checkEmailExist, getUserById, saveUser } from 'Reducers/preferences/users/request';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';

import { getSessionId } from 'Reducers/globalState/selector';

import CryptoJS from 'crypto-js';
import RSModal from 'Components/RSModal';
import { resetAddNewUserState, updateIsOtpModalShow, updateUserDetails } from 'Reducers/preferences/users/reducer';
import PreferencesSubPageSkeletonGate from 'Components/Skeleton/Components/PreferencesSubPageSkeletonGate';
import { PREFERENCES_SUBPAGE_VARIANT } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';
import usePreferencesSubPageApi from 'Hooks/usePreferencesSubPageApi';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';
import LoginOTP from './Component/LoginOTP';
import { clientIdChangeData, departmentIdChangeData, getBUList } from 'Reducers/globalState/request';
import { updateBUByClientCompany, updatedisLicenseId, updateIndustryId } from 'Reducers/globalState/reducer';
import { maskEmailTwoCharsBeforeAndAfterDomain, maskPhoneTwoDigitsInMiddle } from 'Utils/modules/masking';
import { UpdateState } from 'Utils/modules/misc';
var oldPhoneNumber = '';

const AddUser = ({ nextScreen, companies = false, companyBack, campanyEdit, currentPage, back, isAgencyValue }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { clientId, departmentId, userId } = useSelector((state) => getSessionId(state));
    const { licenseTypeId, isAgency, clientId: parentClientId } = getUserDetails();
    const { company_clientId, currentPageConfig , company_departmentId, updatedLicenseId, clientId: currClient,
        departmentId: currDepartment, accountAdmin
    } = useSelector(({ globalstate }) => globalstate);
    const isAccountSettings = useLocation()?.pathname?.split('/')?.pop() === 'account-settings';
    const { state: locationState } = isAccountSettings
        ? {
              state: {
                  clientId,
                  mode: 'create',
                  clientName: '',
                  licenseTypeId: licenseTypeId,
                  page: 'ADDUSER',
              },
          }
        : !_isEmpty(currentPageConfig)
        ? currentPageConfig
        : useLocation();
    const mode = locationState?.mode;
    const fromUserGrid = locationState?.from === 'userGrid';
    const isEdit = mode === 'edit' && fromUserGrid;
    // const isEditable = !(!isEdit || !!companies);
    const userID = _get(locationState, 'userId', 0);
    const existingEmail = useRef();
    const { clientDetails } = useSelector(({ companiesReducer }) => companiesReducer);
    const { userData } = useSelector(({ userReducer }) => userReducer);
    const { isOtpModalShow, isValidNewUserEmailId } = useSelector(({ userReducer }) => userReducer);
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);

    const isEnterprise = licenseTypeId === '3';

    // console.log('Users :::: ', getUserDetails(), ' ::: ', clientId, departmentId);

    const {
        control,
        setError,
        setFocus,
        setValue,
        clearErrors,
        handleSubmit,
        watch,
        unregister,
        getValues,
        reset,
        formState: { errors, isValid },
    } = useForm({
        mode: 'onTouched',
        defaultValues: INITIAL_STATE,
    });

    const nameEmailEdit = locationState?.page === 'NEW_COMPANY' ? false : !(!isEdit || !!companies);

    const [emailState, setEmailState] = useState({
        loading: false,
        isValid: false,
    });
    const saveUserApi = useApiLoader({ autoFetch: false });
    const isSaveUserLoading = saveUserApi.isFetching;
    const emailHasError = Object.hasOwn(errors, 'emailId');

    const [state, setState] = useState({
        adUserModal: false,
        passwordRules: PASSWORD_RULES,
    });
    const [serverError, setServerError] = useState(null);
    const [phoneState, setPhoneState] = useState({
        show: false,
        disable: false,
        countryDetails: {},
    });
    // console.log('phoneState: ', phoneState);

    const [generatePassword, adUser, password, emailValue] = watch([
        'generatePassword',
        'adUser',
        'password',
        'emailId',
    ]);

    const confirmPhoneModalProp = { ...phoneState.countryDetails, number: getValues('phoneNo') };
    // console.log('confirmPhoneModalProp: ', confirmPhoneModalProp);

    const handleEmailBlur = async ({ target: { value } }) => {
        let hasValue = GeneratePasswordpseudorandom(16); // GeneratePassword16Char();
        let byteHash = CryptoJS.enc.Utf8.parse(hasValue);
        let tempiv = iv;
        if (value?.length > 0 && !emailHasError && existingEmail.current !== value) {
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
            const { status } = await dispatch(checkEmailExist({ payload, setError }));
            if (!status) {
                setEmailState({
                    loading: false,
                    isValid: true,
                });
                const payload = handlePayload();
                // await dispatch(checkNewUserEmailExists({ payload }));
                // dispatch(
                //     updateIsOtpModalShow({
                //         isOtpModalShow: true,
                //     }),
                // );
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
    const { jobFunctionList } = getmasterData() || {};

    const handlePayload = () => {
        let hasValue = GeneratePasswordpseudorandom(16); //GeneratePassword16Char();
        let byteHash = CryptoJS.enc.Utf8.parse(hasValue);
        let tempiv = iv;
        const payload = {
            emailId: encryptWithAES(CryptoJS.enc.Utf8.parse(emailValue), byteHash, tempiv),
            hashval: btoa(GeneratePasswordpseudorandom(3) + hasValue + GeneratePasswordpseudorandom(3)),
        };

        return payload;
    };

    const editUserPayload = useMemo(() => {
        if (isEdit && companies) {
            return { clientId: locationState?.clientId, userId: userID, departmentId };
        }
        return {
            clientId: fromUserGrid ? locationState?.clientId : clientId,
            userId: userID,
            departmentId,
        };
    }, [
        isEdit,
        companies,
        locationState?.clientId,
        fromUserGrid,
        clientId,
        userID,
        departmentId,
    ]);

    const editUserApi = usePreferencesSubPageApi({
        enabled: isEdit && !companies,
        mode: 'edit',
        deps: [editUserPayload.userId, editUserPayload.clientId, editUserPayload.departmentId],
        fetcher: async () => {
            if (oldPhoneNumber) oldPhoneNumber = '';
            const response = await dispatch(
                getUserById({
                    payload: editUserPayload,
                    loading: false,
                }),
            );
            if (!response?.status) {
                throw new Error(response?.message || NO_DATA_AVAILABEL);
            }
            return response;
        },
    });

    const showEditUserNoData = isEdit && !companies && editUserApi.isError;
    const showEditUserSkeleton =
        isEdit && !companies && (editUserApi.isPageLoading || showEditUserNoData);

    useEffect(() => {
        if (isEdit && !companies) {
            dispatch(updateUserDetails({}));
        }
    }, [isEdit, companies, userID, dispatch]);

    useEffect(() => {
        if (isEdit && _size(userData)) {
            const {
                firstName,
                lastName,
                email,
                jobFunctionId,
                title: titleId,
                countryCodemobile,
                phoneNo,
                welcomeMessage,
                otpenableForclient,
            } = userData;
            const jobFunction = _find(jobFunctionList, (job) => job.jobFunctionID === jobFunctionId);
            reset((prev) => ({
                ...prev,
                firstName,
                lastName,
                emailId: email,
                jobFunction,
                phoneNo: countryCodemobile + phoneNo,
                password: 'xxxxxxxxxx',
                welcomeMessage: welcomeMessage || 'Welcome to RESUL !',
                otpenableForclient,
            }));

            setEmailState({
                loading: false,
                isValid: true,
            });
            oldPhoneNumber = ('+' + countryCodemobile).trim() + ' ' + phoneNo.slice(0, 5) + '-' + phoneNo.slice(5);
        }
    }, [userData]);
    const onSubmit = async (formState) => {
        // if (oldPhoneNumber?.replace(/[ +-]/g, '') !== formState.phoneNo && !phoneState.disable) {
        //     setFocus('phoneNo');
        //     setError('phoneNo', {
        //         type: 'custom',
        //         message: 'Validate mobile number before proceed',
        //     });
        //     return;
        // }

        // if (!isValidNewUserEmailId && !isEdit) {
        //     setFocus('emailId');
        //     setError('emailId', {
        //         type: 'custom',
        //         message: 'Validate email id  before proceed',
        //     });
        //     return;
        // }
        const agencyClientId = isEnterprise || isAgency ? clientId : parentClientId;
        const payload = buildPayload({
            ...formState,
            mode,
            clientId:
                isAgencyValue === undefined || !isAgencyValue
                    ? companies
                        ? company_clientId?.clientId
                        : fromUserGrid
                        ? company_clientId?.clientId
                        : locationState?.clientId
                    : parentClientId,
            // clientId: companies ? locationState?.clientId : agencyClientId,
            departmentId: 0,
            // departmentId: companies ? (Number(locationState?.licenseTypeId) === 3 ? departmentId : 0) : departmentId,
            userId: isEdit ? userID : 0,
            // dialCode: phoneState.countryDetails?.dialCode || '',
            companies,
        });
        const { status, message } = await saveUserApi.refetch({
            fetcher: () => dispatch(saveUser({ payload, loading: false })),
            loaderConfig: { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.GLOBAL },
        });
        if (status) {
            reset(INITIAL_STATE);
            if (isEdit && !companies) {
                navigate('/preferences/users');
            } else {
                // const payload = { clientId: _get(clientDetails, 'clientId', clientId), departmentId: 0, userId };
                // dispatch(getUserList({ payload }));
                nextScreen(isAccountSettings ? 'ASSIGN_ROLE' : 'ASSIGNROLE');
                setServerError(null);
            }
            dispatch(resetAddNewUserState());
        } else {
            setServerError(message);
        }
    };
    // console.log('nameEmailEdit::', nameEmailEdit);

    useEffect(() => {
        return () => {
            dispatch(resetAddNewUserState());
            dispatch(updateUserDetails({}));
        };
    }, []);

    useEffect(() => {
        if (!isEdit) {
            setTimeout(() => {
                setValue('emailId', '');
                setValue('password', '');
            }, 800);
        }
    }, [isEdit]);

    const handleClientChange = async (agencyAdmin) => {
        const res = await dispatch(clientIdChangeData({ clientId: currClient?.clientId, userId }));
        //dispatch(updateBUByClientCompany({ company_clientId: currClient ,company_departmentId: currDepartment, company_departmentList: departmentList }));
        if (res?.status) {    
            const userDetails = getUserDetails();
            const userInfo = {
                ...userDetails,
                licenseTypeId: res?.licensetypeId.toString(),
                timeFormatId: res?.data?.timeFormatId,
                timeZoneId: res?.data?.timeZoneId,
                timezoneName: res?.data?.timezoneName,
                dateFormatId: res?.data?.dateFormatId,
                    countryId: res?.data?.countryId
            };
            localStorage.setItem('userInfo', encryptWithAES(JSON.stringify(userInfo)));
            CacheManager.set('userDetails', userInfo);
            dispatch(updatedisLicenseId(res?.licensetypeId));
            dispatch(updateIndustryId(res?.data?.industryId));
            const isPermissionList = res?.data.permissionList?.length > 0;
            if (isPermissionList) {
                updatedPermissionList(res?.data.permissionList);
            }
            if(parseInt(res?.licensetypeId, 10) === 3){
                const depList = await dispatch(getBUList({ userId, clientId: currClient?.clientId }, currClient, false));
                if(depList?.status && agencyAdmin){
                    const getDepExcludingAll = depList?.data?.filter((list) => formatName(list.departmentName) !== 'all');
                    await dispatch(departmentIdChangeData({ departmentId: getDepExcludingAll[0]?.departmentId, clientId: currClient?.clientId, userId }, false))
                }
            }
        }
        };
        const handleDepChange = async () => {
            const res = await dispatch(departmentIdChangeData({ departmentId: currDepartment?.departmentId, clientId: clientId, userId }, false));
            dispatch(
                updateBUByClientCompany({ company_departmentId: currDepartment}),
            );
            const isPermissionList = res?.permissionList?.length > 0;
            if (res?.status) {
                const userDetails = getUserDetails();
                const userInfo = { ...userDetails, isCampaign: res?.isCampaign, isAudience: res?.isAudience };
                localStorage.setItem('userInfo', encryptWithAES(JSON.stringify(userInfo)));
                CacheManager.set('userDetails', userInfo);
                isPermissionList && updatedPermissionList(res?.permissionList);
                dispatch(updateIndustryId(res?.industryId));
            }
        };
    
        useEffect(() => {
            return () => {
                const isUserGridNow = window.location.pathname?.includes('users');    
                let isAgencyAccountAdmin = isAgency && accountAdmin?.clientId === company_clientId?.clientId;
                if(locationState?.from === 'userGrid' && isAgency && company_clientId?.clientId !== currClient?.current?.clientId && !isUserGridNow) {
                    handleClientChange(isAgencyAccountAdmin);
                }   
                if (locationState?.from === 'userGrid' && !isAgencyAccountAdmin && company_departmentId?.departmentId !== currDepartment?.departmentId  && updatedLicenseId === 3 && !isUserGridNow) {
                    handleDepChange();
                };
            };
        }, []);
    return (
        <Fragment>
            {/* // Contend holder starts */}
            <PreferencesSubPageSkeletonGate
                variant={PREFERENCES_SUBPAGE_VARIANT.USERS_ADD_EDIT}
                isLoading={showEditUserSkeleton}
                showNoData={showEditUserNoData}
                ariaLabel="Loading user"
            >
            <form onSubmit={handleSubmit(onSubmit)}>
                {/* Main page content block starts */}
                <div className="box-design rs-box">
                    <div className="flex-row mb21 mt0 top-sub-heading">
                        <div className="fr flex-right tsh-icons">
                            <ul className="rs-list-group-horizontal jc-right">
                                <li
                                    onClick={() => {
                                        setState((prev) => ({ ...prev, adUserModal: true }));
                                    }}
                                    className="cp"
                                >
                                    <span className="tsh-icon-with-label">
                                        <span className="color-primary-blue">AD Users</span>
                                        <i
                                            className={`${settings_medium} icon-md primary-color mr-5`}
                                            id="rs_AddUser_settings"
                                        ></i>
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    {serverError && (
                        <div className={`alert mb20 alert-danger`}>
                            <i
                                className={`position-relative mr10 p5 white ${alert_medium}  bg-primary-red icon-md `}
                            ></i>
                            <span>{serverError}</span>
                        </div>
                    )}
                    <Row>
                        <Col md={8} sm={6}>
                            <Row>
                                <Col sm={6} xs={12}>
                                    <div className="form-group">
                                        <Row>
                                            <Col xs={12}>
                                                <RSInput
                                                    type={'text'}
                                                    name={'firstName'}
                                                    id="rs_AddUser_firstName"
                                                    placeholder={FIRST_NAME}
                                                    control={control}
                                                    onKeyDown={onKeyChar}
                                                    required
                                                    maxLength={MAX_LENGTH50}
                                                    rules={FIRSTNAME_RULES}
                                                    disabled={nameEmailEdit} //isEditable
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                </Col>
                                <Col sm={6} xs={12}>
                                    <RSInput
                                        type={'text'}
                                        name={'lastName'}
                                        id="rs_AddUser_lastName"
                                        placeholder={LAST_NAME}
                                        control={control}
                                        onKeyDown={onKeyChar}
                                        required
                                        maxLength={MAX_LENGTH50}
                                        rules={LASTNAME_RULES}
                                        disabled={nameEmailEdit}
                                    />
                                </Col>

                                <Col sm={6} xs={12}>
                                    {isEdit ? (
                                        <div className="form-group d-flex" id="rs_AddUser_phoneNo">
                                            <Col sm={2} xs={12} className="mt1 pe-none">
                                                <RSPhoneInput
                                                    name="phoneNo"
                                                    control={control}
                                                    setValue={setValue}
                                                    setError={setError}
                                                    clearErrors={clearErrors}
                                                    required
                                                    errors={errors}
                                                    onMount={(value, data) => {
                                                        setValue(`dialCode`, `${data?.dialCode}`);
                                                    }}
                                                    handleOnchange={(phone, value) => {
                                                        const { dialCode } = value;
                                                        setValue(`dialCode`, `${dialCode}`);
                                                    }}
                                                    disabled={nameEmailEdit}
                                                    rules={{ required: ENTER_PHONE }}
                                                />
                                            </Col>
                                            <Col>
                                                <RSInput
                                                    name="phoneNo"
                                                    placeholder={MOBILE_NUMBER}
                                                    control={control}
                                                    disabled={nameEmailEdit}
                                                    maskValue={maskPhoneTwoDigitsInMiddle}
                                                />
                                            </Col>
                                        </div>
                                    ) : (
                                        <div className="form-group" id="rs_AddUser_phoneNo">
                                            <RSPhoneInput
                                                name="phoneNo"
                                                control={control}
                                                setValue={setValue}
                                                setError={setError}
                                                clearErrors={clearErrors}
                                                label="Mobile number"
                                                required
                                                errors={errors}
                                            // disabled={phoneState.disable}
                                            onMount={(value, data, formattedValue) => {
                                                setValue(`dialCode`,`${data?.dialCode}`);
                                                }}
                                            handleOnchange={(phone, value, e, formattedValue) => {
                                                const { dialCode, countryCode, format } = value;
                                                setValue(`dialCode`,`${dialCode}`);
                                                }}
                                                disabled={nameEmailEdit}
                                                rules={{ required: ENTER_PHONE }}
                                                handleOnBlur={(e, data) => {
                                                    const {
                                                        target: { value: eventValue },
                                                    } = e;

                                                    const { format } = data;
                                                    if (
                                                        oldPhoneNumber !== eventValue &&
                                                        eventValue?.length === format?.length
                                                    ) {
                                                    setPhoneState((prev) => {
                                                        return {
                                                            ...prev,
                                                            show: true,
                                                            countryDetails: { value: eventValue, ...data },
                                                        };
                                                    });
                                                    }
                                                }}
                                            />
                                        </div>
                                    )}
                                </Col>

                                <Col sm={6} xs={12}>
                                    <div className={`form-group ${isValidNewUserEmailId ? 'click-off' : ''}`}>
                                        <RSInput
                                            type={'text'}
                                            name={'emailId'}
                                            id="rs_AddUser_emailId"
                                            placeholder={EMAIL}
                                            control={control}
                                            required
                                            isLoading={emailState.loading}
                                            isValidIcon={!emailHasError && emailState.isValid}
                                            rules={{
                                                ...EMAIL_RULES,
                                                validate: () =>
                                                    emailHasError ? _get(errors, 'emailId.message') : true,
                                            }}
                                            loginEmailIcon
                                            handleOnchange={() => {
                                                if (emailHasError) clearErrors('emailId');
                                                if (emailState.isValid)
                                                    setEmailState({
                                                        loading: false,
                                                        isValid: false,
                                                    });
                                            }}
                                            handleOnBlur={handleEmailBlur}
                                            autoComplete={'off'}
                                            disabled={nameEmailEdit} //isEditable
                                            maskValue={maskEmailTwoCharsBeforeAndAfterDomain}
                                        />
                                    </div>
                                </Col>

                                <Col sm={6} xs={12}>
                                    <div className="form-group mb0" id="rs_AddUser_jobFunction">
                                        <RSKendoDropDownList
                                            name={'jobFunction'}
                                            data={jobFunctionList.sort((a, b) =>
                                                a.jobFunctionName.toLowerCase() > b.jobFunctionName.toLowerCase()
                                                    ? 1
                                                    : -1,
                                            )}
                                            control={control}
                                            required
                                            textField={'jobFunctionName'}
                                            dataItemKey={'jobFunctionID'}
                                            label={'Job title'}
                                            rules={{
                                                required: SELECT_JOBFUNCTION,
                                            }}
                                        />
                                    </div>
                                </Col>
                                <Col sm={6}>
                                    <div className="form-group mb0">
                                        <RSInput
                                            type={adUser ? 'text' : 'password'}
                                            name={'password'}
                                            id="rs_AddUser_password"
                                            required={adUser || nameEmailEdit ? false : true}
                                            viewEye={!nameEmailEdit && !adUser}
                                            maxLength={15}
                                            placeholder={PASSWORD}
                                            control={control}
                                            meter={generatePassword ? false : password?.length > 0 ? true : false}
                                            rules={nameEmailEdit ? {} : state.passwordRules}
                                            disabled={generatePassword || adUser || nameEmailEdit}
                                        />
                                        <small className="mt3">
                                            {MIN_8_CHARACTERS}{' '}
                                            <RSPPophover
                                                position="bottom"
                                                pophover={PASSWORD_MAX_15_CHARACTERS}
                                            >
                                                <i
                                                    className={` ${circle_question_mark_mini} color-primary-blue icon-xs position-relative top2`}
                                                    id="circle_question_mark"
                                                ></i>
                                            </RSPPophover>
                                        </small>
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                        <Col md={4} sm={6}>
                            <Row>
                                <Col sm={12}>
                                    <RSTextarea
                                        control={control}
                                        className={'text mb10'}
                                        name={'welcomeMessage'}
                                        row={3}
                                        required
                                        isCustomBorder
                                        rules={{ required: THIS_FIELD_IS_REQUIRED }}
                                        placeholder={'Welcome message'}
                                    ></RSTextarea>
                                </Col>
                                <Col>
                                    <div className={`${adUser ? 'click-off': ''} mb5`}>
                                        <RSCheckbox
                                            control={control}
                                            name="generatePassword"
                                            type="checkbox"
                                            labelName="Generate password"
                                            disabled={nameEmailEdit} //isEditable
                                            handleChange={(e) => {
                                                if (e.target.checked) {
                                                    UpdateState(setState, 'passwordRules', PASSWORD_RULES);
                                                    // setValue('password', GeneratePassword());
                                                    setValue('password', GenerateUserPassword(10));
                                                    clearErrors('password');
                                                    setValue('adUser', false);
                                                } else {
                                                    setValue('password', '');
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="mb5">
                                        <RSCheckbox
                                            control={control}
                                            name="otpenableForclient"
                                            type="checkbox"
                                            labelName="Enforce OTP login"
                                            className=""
                                        />
                                    </div>
                                    <div className= {generatePassword ? 'click-off' : '' } >
                                        <RSCheckbox
                                            control={control}
                                            name="adUser"
                                            type="checkbox"
                                            labelName="AD user"
                                            disabled={nameEmailEdit}
                                            handleChange={(e) => {
                                                if (e.target.checked) {
                                                    unregister('password');
                                                    setValue('password', '{As per AD Password}');
                                                    setValue('generatePassword', false);
                                                    UpdateState(setState, 'passwordRules', {});
                                                } else {
                                                    UpdateState(setState, 'passwordRules', PASSWORD_RULES);
                                                    setValue('password', '');
                                                }
                                            }}
                                        />
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </div>
                {/* </div>'/preferences/company-list' */}
                <div className="buttons-holder">
                    <Row>
                        <Col>
                            <RSSecondaryButton
                                onClick={() => {
                                    if (isSaveUserLoading) return;
                                    if (campanyEdit) {
                                        back('ASSIGNROLE');
                                        // companyBack('NEW_COMPANY');
                                    } else if (companies && !isAccountSettings) {
                                        back('ASSIGNROLE');
                                    } else if (isAccountSettings) {
                                        back('ASSIGN_ROLE');
                                    } else {
                                        navigate('/preferences/users');
                                    }
                                    dispatch(resetAddNewUserState());
                                }}
                                blockInteraction={isSaveUserLoading}
                                id="rs_AddUser_Cancel"
                            >
                                Cancel
                            </RSSecondaryButton>
                            <RSPrimaryButton
                                type="submit"
                                className={isEdit ? '' : !emailState.isValid ? 'click-off' : ''}
                                isLoading={isSaveUserLoading}
                                blockBodyPointerEvents
                                id="rs_AddUser_Save"
                            >
                                {!isEdit || !!companies ? 'Save' : 'Update'}
                            </RSPrimaryButton>
                        </Col>
                    </Row>
                </div>

                {/* Main page content block ends */}
            </form>
            </PreferencesSubPageSkeletonGate>
            <ADUserModal
                show={state.adUserModal}
                handleClose={(status) => {
                    if (!status) {
                        setState((prev) => {
                            return { ...prev, adUserModal: false };
                        });
                    }
                }}
            />
            {phoneState.show && (
                <ConfirmMobileNumber
                    // show={phoneState.show}
                    phoneState={confirmPhoneModalProp}
                    confirm={() => {
                        setPhoneState((prev) => ({
                            ...prev,
                            show: false,
                            disable: true,
                        }));
                    }}
                    handleClose={(status) => {
                        if (status) setFocus('phoneNo');
                        setPhoneState((prev) => ({
                            ...prev,
                            show: false,
                            disable: false,
                        }));
                    }}
                />
            )}
            {
                <RSModal
                    show={isOtpModalShow}
                    size="md"
                    body={<LoginOTP show={isOtpModalShow} />}
                    handleClose={() => {
                        dispatch(
                            updateIsOtpModalShow({
                                isOtpModalShow: false,
                            }),
                        );
                        dispatch(resetAddNewUserState());
                    }}
                    header={'One-time password verification'}
                />
            }
            {/* // Content holder ends */}

            {!showEditUserNoData && getWarningPopupMessage(failureApiErrors, dispatch)}
        </Fragment>
    );
};

export default AddUser;
