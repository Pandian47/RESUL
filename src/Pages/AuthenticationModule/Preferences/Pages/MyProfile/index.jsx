import { encryptWithAES, getUserDetails } from 'Utils/modules/crypto';
import { getmasterData } from 'Utils/modules/masterData';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { MAX_LENGTH10, MAX_LENGTH255, MAX_LENGTH50, MIN_LENGTH } from 'Constants/GlobalConstant/Regex';
import { ENTER_ADDRESS, ENTER_CITY, ENTER_PHONE, ENTER_VALID_EMAIL, MINLENGTH, SELECT_COUNTRY, SELECT_CURRENCY, SELECT_DATE_FORMAT, SELECT_JOBFUNCTION, SELECT_LANGUAGE, SELECT_TIME_FORMAT, SELECT_TIMEZONE, SELECT_USERROLE, UPLOAD_PROFILE_IMAGE } from 'Constants/GlobalConstant/ValidationMessage';
import { EMAIL_RULES, FIRSTNAME_RULES, LASTNAME_RULES, ZIP_RULES } from 'Constants/GlobalConstant/Rules';
import { ADDRESS, BUSSINESS_EMAIL, CANCEL, CHANGE_PASSWORD, CITY, COUNTRY, CURRENCY, EDIT_PROFILE_PICTURE, FIRST_NAME, JOB_FUNCTION, LAST_NAME, LOCALIZATION_DETAILS, MOBILE_NUMBER, MY_PROFILE, NO_DATA_AVAILABEL, PERSONAL_DETAILS, STATE, UPDATE, UPDATE_MOBILE_NUMBER, USER_ROLE, ZIP } from 'Constants/GlobalConstant/Placeholders';
import { circle_info_medium, popup_close_circle_fill_medium, popup_close_circle_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import _find from 'lodash/find';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { Container, Col, Row } from 'react-bootstrap';

import CacheManager from 'Utils/cacheManager';
import { ProfileImageUploadButton } from './Component/ProfileImageUploadButton';
// import ProtectedRoute from 'Hoc/ProtectedRoutes';
import RSPageHeader from 'Components/RSPageHeader';
import RSInput from 'Components/FormFields/RSInput';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import ChangePasswordModal from './Component/ChangePassword';
import RSPhoneInput from 'Components/FormFields/RSPhoneInput';
import ChangeMobileNumber from './Component/ChangeMobileNumber';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { FORM_INITIAL_STATE, buildPayload, roles } from './constant';
import {
    MyProfileLoadingShell,
} from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';
import { preferencesSkeletonCriticalCss } from 'Components/Skeleton/Components/preferencesSkeletonCriticalCss';
import { skeletonShellSharedCriticalCss } from 'Components/Skeleton/Components/common';
import usePreferencesSubPageApi from 'Hooks/usePreferencesSubPageApi';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';
import { useDispatch, useSelector } from 'react-redux';
import { getMyprofile, saveMyProfile } from 'Reducers/preferences/myProfile/request';


import { resetOtpState, restProfileData, setWelcomeModal } from 'Reducers/preferences/myProfile/reducer';
import useComponentWillUnmount from 'Hooks/useComponentWillUnMount';
import RSFileUpload from 'Components/FormFields/RSFileUpload';
import RSModal from 'Components/RSModal';
import ImageCropModal from 'Components/ImageCropModal';
import RSIcon from 'Components/RSIcon';
import { maskEmailTwoCharsBeforeAndAfterDomain, maskPhoneTwoDigitsInMiddle } from 'Utils/modules/masking';
import { charNum } from 'Utils/modules/inputValidators';

const MyProfile = ({ permissions }) => {
    const { updateAccess } = permissions || {};

    //use states
    const [tempImageData, setTempImageData] = useState(null);
    const [showFileUpload, setShowFileUpload] = useState(true);
    const [show, setIsShow] = useState({
        changePhoneNumberModal: false,
        changePasswordModal: false,
        profileUserEdit: true,
        imageUploadModal: false,
    });

    //useRefs
    const dialCode = useRef('');
    const previousProfilePath = useRef(null);
    const profileFormSyncKeyRef = useRef('');

    const { clientId, userId } = getUserDetails(); //isAgency value commented out
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const saveProfileApi = useApiLoader({ autoFetch: false });
    const isProfileUpdateLoading = saveProfileApi.isFetching;
    const {
        countryMasterList,
        currencyMasterList,
        dateFormatList,
        jobFunctionList,
        timeFormatList,
        timeZoneList,
        languageMasterList,
        stateList = [],
    } = getmasterData() || {};
    const { failureApiErrors } = useSelector((state) => state.globalstate ?? {});
    const { data, showWelcomeModal } = useSelector((state) => state.myProfileReducer ?? { data: {} });
    const { userinfo = {} } = data;
    const payload = useMemo(
        () => ({
            userId,
        clientId,
        }),
        [userId, clientId],
    );

    const methods = useForm(FORM_INITIAL_STATE);
    const { control, setError, setValue, clearErrors, handleSubmit, getValues, reset, formState, watch } = methods;
    const { errors } = formState; // isValid commented out
    // const [timeZoneWatch] = watch(['timezone']);
    // const allValues = getValues();
    const selectedCountry = watch('country');

    const filteredStateList = useMemo(() => {
        if (!selectedCountry || !stateList.length) return [];
        const selectedCountryID = selectedCountry?.countryID || selectedCountry;
        return stateList
            .filter((state) => state.countryID === selectedCountryID)
            .sort((a, b) => (a.state.toLowerCase() > b.state.toLowerCase() ? 1 : -1));
    }, [selectedCountry, stateList]);

    const populateProfileFormFromApi = useCallback(
        (profileData) => {
            const {
                userinfo: profileUserinfo = {},
                roleId: profileRoleId,
                isEditable: profileEditable,
            } = profileData || {};

            const masterDataKey = [
                countryMasterList?.length,
                currencyMasterList?.length,
                dateFormatList?.length,
                jobFunctionList?.length,
                languageMasterList?.length,
                stateList?.length,
                timeFormatList?.length,
                timeZoneList?.length,
            ].join('|');
            const profileSyncKey = `${masterDataKey}|${profileRoleId || ''}|${profileEditable}|${JSON.stringify(
                profileUserinfo,
            )}`;

            if (profileFormSyncKeyRef.current === profileSyncKey) return;
            profileFormSyncKeyRef.current = profileSyncKey;

            setIsShow((prev) =>
                prev.profileUserEdit === profileEditable
                    ? prev
                    : {
            ...prev,
                          profileUserEdit: profileEditable,
                      },
            );

            if (!Object.keys(profileUserinfo).length) return;

            let {
                countryId,
                languageId,
                jobFunctionId,
                currencyId,
                timeZoneId,
                timeFormatId,
                dateFormatId,
                countryCodeMobile,
                phoneNo,
                profilePath,
                state: stateValue,
                ...rest
            } = profileUserinfo;
            countryCodeMobile = countryCodeMobile || '';
            phoneNo = phoneNo || '';

            const country = _find(countryMasterList, (c) => c.countryID === countryId);
            const jobFunction = _find(jobFunctionList, (job) => job.jobFunctionID === jobFunctionId);
            const currency = _find(currencyMasterList, (c) => c.currencyID === currencyId);
            const dateFormat = _find(dateFormatList, (d) => d.dateFormatID === dateFormatId);
            const langauge = _find(languageMasterList, (l) => l.languageID === languageId);
            const timeFormat = _find(timeFormatList, (t) => t.timeFormatID === timeFormatId);
            const timezone = _find(timeZoneList, (tz) => tz.timeZoneID === timeZoneId);
            const role = _find(roles, (r) => r.roleId === profileRoleId)?.roleName;

            let userState = null;
            if (stateValue && stateValue !== '' && countryId) {
                const normalizedStateValue = stateValue.toString().replace(/\s+/g, '').toLowerCase();
                userState = _find(stateList, (state) => {
                    if (state.countryID === countryId) {
                        const normalizedStateName = state.state.toString().replace(/\s+/g, '').toLowerCase();
                        return (
                            normalizedStateName === normalizedStateValue ||
                            state.state.toLowerCase() === stateValue.toLowerCase() ||
                            state.state === stateValue
                        );
                    }
                    return false;
                });
            }

            dialCode.current = countryCodeMobile;
            previousProfilePath.current = profilePath || null;
            reset({
                ...rest,
                profilePath,
                jobFunction,
                country,
                currency,
                dateFormat,
                langauge,
                timeFormat,
                timezone,
                role,
                state: userState,
                phoneNo: `${countryCodeMobile || ''}${phoneNo || ''}`,
            });
        },
        [
            countryMasterList,
            currencyMasterList,
            dateFormatList,
            jobFunctionList,
            languageMasterList,
            reset,
            stateList,
            timeFormatList,
            timeZoneList,
        ],
    );

    const profileApi = usePreferencesSubPageApi({
        mode: 'edit',
        deps: [clientId, userId],
        fetcher: async (_params, meta) => {
            const response = await dispatch(
                getMyprofile({
                    payload,
                    isLoading: false,
                    signal: meta?.signal,
                }),
            );
            if (!response?.status) {
                throw new Error(response?.message || NO_DATA_AVAILABEL);
            }
            return response;
        },
        onSuccess: (response) => {
            if (response?.status && response?.data) {
                populateProfileFormFromApi(response.data);
            }
        },
    });

    const showProfileNoData = profileApi.isError;
    const showProfileSkeleton = profileApi.isPageLoading || showProfileNoData;

    useEffect(() => {
        if (showWelcomeModal && Object.keys(data)?.length && Object.keys(userinfo)?.length) {
            const timer = setTimeout(() => {
                dispatch(setWelcomeModal(false));
            }, 10000);

            return () => clearTimeout(timer);
        }
    }, [showWelcomeModal, data, userinfo, dispatch]);

    /** Re-sync form when profile is refetched elsewhere (e.g. change mobile). */
    useEffect(() => {
        if (profileApi.isFetching || !Object.keys(data)?.length) return;
        populateProfileFormFromApi(data);
    }, [data, profileApi.isFetching, populateProfileFormFromApi]);

    // useEffect(() => {
    //     setTimeout(() => {
    //         let { countryCodeMobile, phoneNo = '' } = userinfo;
    //         dialCode.current = countryCodeMobile;
    //         countryCodeMobile = countryCodeMobile || '';
    //         document.getElementsByClassName('react-tel-input')[0].childNodes[1].value = countryCodeMobile + phoneNo || '';
    //     }, 10);
    // }, [show]);

    //useEffect(() => {
    //     setTimeout(() => {
    //         document.getElementsByClassName('react-tel-input')[0].childNodes[1].value = allValues?.phoneNo || '';
    //     }, 10);
    // }, [

    // ]);

    useComponentWillUnmount(() => {
        profileApi.reset();
        dispatch(restProfileData());
    });

    const handleImageUpload = (base64Image, fileName) => {
        const fileExtension = fileName?.split('.').pop()?.toLowerCase() || 'jpeg';
        const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';
        const dataUri = base64Image?.includes('data:image') ? base64Image : `data:${mimeType};base64,${base64Image}`;
        setTempImageData(dataUri);
        setShowFileUpload(false);
    };

    const handleCropComplete = (croppedImage) => {
        previousProfilePath.current = croppedImage;
        setValue('profilePath', croppedImage);
        clearErrors('profilePath');
        setIsShow((prev) => ({ ...prev, imageUploadModal: false }));
        setTempImageData(null);
    };

    const handleModalClose = () => {
        setIsShow((prev) => ({ ...prev, imageUploadModal: false }));
        setTempImageData(null);
        setShowFileUpload(true);
        clearErrors('profilePath');
        clearErrors('uploadImageName');
    };

    const handleOpenImageModal = (isEdit = false) => {
        if (isEdit) {
            const currentImage = watch('profilePath');
            if (currentImage) {
                let imageForCrop = currentImage;
                if (!currentImage.includes('data:image')) {
                    const isBase64Includes = currentImage?.includes('base64') || false;
                    if (isBase64Includes) {
                        imageForCrop = currentImage;
                    } else {
                        imageForCrop = `data:image/png;base64,${currentImage}`;
                    }
                }
                setTempImageData(imageForCrop);
                setShowFileUpload(false);
            }
        } else {
            setTempImageData(null);
            setShowFileUpload(true);
        }
        setIsShow((prev) => ({ ...prev, imageUploadModal: true }));
    };

    const handleFormSubmit = (formState) => {
        if (!formState.profilePath) {
            setError('profilePath', {
                type: 'manual',
                message: UPLOAD_PROFILE_IMAGE,
            });
            return;
        }

        const payload = buildPayload({ ...formState, userId, clientId });
        // const { data } = await dispatch(
        //     getMyprofile({
        //         payload,
        //         isLoading: false,
        //     }),
        // ); timeFormatId, dateFormatId, timeZoneId
        localStorage.setItem('timeFormatId', payload.timeFormatId);
        localStorage.setItem('dateFormatId', payload.dateFormatId);
        localStorage.setItem('timeZoneId', payload.timezoneId);
        let currentUserDetail = getUserDetails();

        // Find timezone name based on timezoneId
        const selectedTimezone = _find(timeZoneList, ['timeZoneID', payload.timezoneId]);
        const timezoneName = selectedTimezone?.timeZoneName || selectedTimezone?.gmtOffset || '';

        currentUserDetail = {
            ...currentUserDetail,
            timeZoneId: payload.timezoneId,
            timeFormatId: payload.timeFormatId,
            dateFormatId: payload.dateFormatId,
            languageId: payload.languageId,
            countryId: payload.countryId,
            currencyId: payload.currencyId,
            jobFunctionId: payload.jobFunctionID,
            departmentId: payload.departmentId,
            address: payload.address,
            city: payload.City,
            zipCode: payload.zipcode,
            state: payload.state,
            isDayLight: payload.isDayLight,
            timezoneName: timezoneName,
            profileImage: payload.profilePath,
        };
        const handleResetValue = () => {
            localStorage.setItem('timeFormatId', payload.timeFormatId);
            localStorage.setItem('dateFormatId', payload.dateFormatId);
            localStorage.setItem('timeZoneId', payload.timezoneId);
            localStorage.setItem('userInfo', encryptWithAES(JSON.stringify(currentUserDetail)));
            CacheManager.set('userDetails', currentUserDetail);
        };
        saveProfileApi.refetch({
            fetcher: () =>
                dispatch(saveMyProfile({ payload, handleResetValue, loading: false })),
            loaderConfig: { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.GLOBAL },
        });
    };

    return (
        // Contend holder starts
        <FormProvider {...methods}>
            <form
                className={`page-content-holder${
                    showProfileSkeleton ? ' preferences-skeleton-scope preferences-subpage-skeleton-scope' : ''
                }`}
                aria-busy={showProfileSkeleton}
            >
                {showProfileSkeleton ? (
                    <>
                        <style>{skeletonShellSharedCriticalCss}</style>
                        <style>{preferencesSkeletonCriticalCss}</style>
                        <MyProfileLoadingShell showNoData={showProfileNoData} />
                    </>
                ) : (
                    <>
                <RSPageHeader title={MY_PROFILE} isBack backPath="/preferences" isHeaderLine />
                <Container fluid>
                    <div className="page-content pc-my-profile d-grid">
                        <Container className="px0">
                            <div
                                className={`box-design rs-box rs-box-min-height ${showWelcomeModal ? 'pb30' : 'py30'}`}
                            >
                                {showWelcomeModal && (
                                    <div className="alert bg-tertiary-blue align-items-center mb23 mt0 d-flex border-10 p0">
                                        <i
                                            className={`position-relative mr5 p5 pl7 ${circle_info_medium} icon-md color-primary-blue`}
                                        ></i>
                                        <span className="flex-grow-1">
                                            You're almost ready. Fill in your profile details to get started.
                                        </span>
                                        <div
                                            onClick={() => dispatch(setWelcomeModal(false))}
                                            className="cursor-pointer"
                                        >
                                            <RSIcon
                                                className="icon-md"
                                                color="color-primary-blue cp"
                                                innerCloseContent={false}
                                                customCloseClass={'top5 right5 bg-transparent'}
                                                defaultItem={popup_close_circle_medium}
                                                hoverItem={popup_close_circle_fill_medium}
                                            />
                                        </div>
                                    </div>
                                )}
                                <Row>
                                    <Col md={3} sm={4} xs={12} className="accountsetup-image-upload">
                                        <ProfileImageUploadButton
                                            value={watch('profilePath')}
                                            onClick={() => handleOpenImageModal(false)}
                                            onEdit={() => handleOpenImageModal(true)}
                                            onRemove={() => {
                                                setValue('profilePath', null);
                                                // setError('profilePath', {
                                                //     type: 'manual',
                                                //     message: UPLOAD_PROFILE_IMAGE,
                                                // });
                                            }}
                                            error={formState.errors?.['profilePath']?.message}
                                        />
                                    </Col>
                                    {/* second column */}
                                    <Col md={9} sm={8} xs={12} className="box-left-border accountsetup-contact-info">
                                        <Row>
                                            <Col xs={12}>
                                                <h4 className="mb30">{PERSONAL_DETAILS}</h4>
                                                <Row>
                                                    <Col sm={6} xs={12}>
                                                        <div className="form-group">
                                                            <Row>
                                                                <Col xs={12}>
                                                                    <RSInput
                                                                        type={'text'}
                                                                        name={'firstName'}
                                                                        id="rs_MyProfile_firstName"
                                                                        placeholder={FIRST_NAME}
                                                                        control={control}
                                                                        required
                                                                        disabled
                                                                        // rules={FIRSTNAME_RULES}
                                                                    />
                                                                </Col>
                                                            </Row>
                                                        </div>
                                                    </Col>
                                                    <Col sm={6} xs={12}>
                                                        <RSInput
                                                            type={'text'}
                                                            name={'lastName'}
                                                            id="rs_MyProfile_lastName"
                                                            placeholder={LAST_NAME}
                                                            control={control}
                                                            required
                                                            disabled
                                                            // rules={LASTNAME_RULES}
                                                        />
                                                    </Col>

                                                    <Col sm={6} xs={12}>
                                                        <div className="form-group d-flex" id="rs_MyProfile_phoneNo">
                                                            <Col sm={2} xs={12} className="mt1 pe-none">
                                                                <RSPhoneInput
                                                                    name="phoneNo"
                                                                    control={control}
                                                                    setValue={setValue}
                                                                    setError={setError}
                                                                    clearErrors={clearErrors}
                                                                    // label={MOBILE_NUMBER}
                                                                    required
                                                                    disabled
                                                                    errors={errors}
                                                                    // rules={{ required: ENTER_PHONE }}
                                                                />
                                                            </Col>
                                                            <Col>
                                                                <RSInput
                                                                    name="phoneNo"
                                                                    placeholder={MOBILE_NUMBER}
                                                                    control={control}
                                                                    disabled
                                                                    // rules={LASTNAME_RULES}
                                                                    maskValue={maskPhoneTwoDigitsInMiddle}
                                                                />
                                                                {updateAccess && (
                                                                    <label
                                                                        className="rs-button-link-small color-primary-blue float-right d-block cp"
                                                                        onClick={() =>
                                                                            setIsShow((prev) => ({
                                                                                ...prev,
                                                                                changePhoneNumberModal: true,
                                                                            }))
                                                                        }
                                                                    >
                                                                        {UPDATE_MOBILE_NUMBER}
                                                                    </label>
                                                                )}
                                                            </Col>
                                                        </div>
                                                    </Col>

                                                    <Col sm={6} xs={12}>
                                                        <div className="form-group">
                                                            <RSInput
                                                                name={'email'}
                                                                placeholder={BUSSINESS_EMAIL}
                                                                id="rs_MyProfile_emailId"
                                                                control={control}
                                                                required
                                                                disabled
                                                                rules={{
                                                                    required: ENTER_VALID_EMAIL,
                                                                }}
                                                                // rules={EMAIL_RULES}
                                                                autoComplete={'off'}
                                                                maskValue={maskEmailTwoCharsBeforeAndAfterDomain}
                                                            />
                                                            {updateAccess && (
                                                                <label
                                                                    className="rs-button-link-small color-primary-blue float-right d-block cp"
                                                                    onClick={() =>
                                                                        setIsShow((prev) => ({
                                                                            ...prev,
                                                                            changePasswordModal: true,
                                                                        }))
                                                                    }
                                                                >
                                                                    {CHANGE_PASSWORD}
                                                                </label>
                                                            )}
                                                        </div>
                                                    </Col>

                                                    <Col sm={6} xs={12}>
                                                        <div className="form-group">
                                                            <RSInput
                                                                name="role"
                                                                placeholder={USER_ROLE}
                                                                id="rs_MyProfile_userRole"
                                                                control={control}
                                                                required
                                                                disabled
                                                                // rules={{
                                                                //     required: SELECT_USERROLE,
                                                                // }}
                                                            />
                                                        </div>
                                                    </Col>
                                                    <Col sm={6} xs={12}>
                                                        <div className="form-group" id="rs_MyProfile_jobFunction">
                                                            <RSKendoDropDownList
                                                                name={'jobFunction'}
                                                                data={jobFunctionList?.sort((a, b) =>
                                                                    a.jobFunctionName.toLowerCase() >
                                                                    b.jobFunctionName.toLowerCase()
                                                                        ? 1
                                                                        : -1,
                                                                )}
                                                                control={control}
                                                                required
                                                                textField={'jobFunctionName'}
                                                                dataItemKey={'jobFunctionID'}
                                                                label={JOB_FUNCTION}
                                                                rules={{
                                                                    required: SELECT_JOBFUNCTION,
                                                                }}
                                                            />
                                                        </div>
                                                    </Col>

                                                    <Col sm={6} xs={12}>
                                                        <div className="form-group">
                                                            <RSInput
                                                                control={control}
                                                                name={'addressLine'}
                                                                id="rs_MyProfile_addressLine"
                                                                minLength={MIN_LENGTH}
                                                                maxLength={MAX_LENGTH255}
                                                                required
                                                                rules={{
                                                                    minLength: {
                                                                        value: MIN_LENGTH,
                                                                        message: MINLENGTH,
                                                                    },
                                                                    required: ENTER_ADDRESS,
                                                                }}
                                                                placeholder={ADDRESS}
                                                            />
                                                        </div>
                                                    </Col>

                                                    <Col sm={6} xs={12}>
                                                        <div className="form-group">
                                                            <RSInput
                                                                control={control}
                                                                name={'city'}
                                                                id="rs_MyProfile_city"
                                                                required
                                                                rules={{ required: ENTER_CITY }}
                                                                placeholder={CITY}
                                                                maxLength={MAX_LENGTH50}
                                                            />
                                                        </div>
                                                    </Col>
                                                    <div className="form-group">
                                                        <Row>
                                                            <Col sm={3} xs={12}>
                                                                <RSKendoDropDownList
                                                                    control={control}
                                                                    name={'country'}
                                                                    // data={countryMasterList}
                                                                    data={countryMasterList?.sort((a, b) =>
                                                                        a.country.toLowerCase() >
                                                                        b.country.toLowerCase()
                                                                            ? 1
                                                                            : -1,
                                                                    )}
                                                                    textField="country"
                                                                    id="rs_MyProfile_country"
                                                                    required
                                                                    // disabled={!show.profileUserEdit}
                                                                    dataItemKey={'countryID'}
                                                                    label={COUNTRY}
                                                                    rules={{
                                                                        required: SELECT_COUNTRY,
                                                                    }}
                                                                    handleChange={() => {
                                                                        setValue('state', null);
                                                                        clearErrors('state');
                                                                    }}
                                                                />
                                                            </Col>
                                                            <Col sm={3} xs={12}>
                                                                <RSKendoDropDownList
                                                                    control={control}
                                                                    name={'state'}
                                                                    data={filteredStateList}
                                                                    textField="state"
                                                                    dataItemKey={'stateID'}
                                                                    label={STATE}
                                                                    placeholder={STATE}
                                                                    disabled={!selectedCountry}
                                                                />
                                                            </Col>
                                                            <Col sm={6} xs={12}>
                                                                <RSInput
                                                                    control={control}
                                                                    type="text"
                                                                    name={'zipCode'}
                                                                    id="rs_MyProfile_zipCode"
                                                                    required
                                                                    onKeyDown={charNum}
                                                                    rules={ZIP_RULES}
                                                                    maxLength={MAX_LENGTH10}
                                                                    placeholder={ZIP}
                                                                />
                                                            </Col>
                                                        </Row>
                                                    </div>
                                                </Row>
                                                <h4 className="mb30">{LOCALIZATION_DETAILS}</h4>
                                                <Row>
                                                    <Col sm={4} xs={6}>
                                                        <div className="form-group" id="rs_MyProfile_currencyID">
                                                            <RSKendoDropDownList
                                                                // data={currencyMasterList}
                                                                data={currencyMasterList?.sort((a, b) =>
                                                                    a.currencyName.toLowerCase() >
                                                                    b.currencyName.toLowerCase()
                                                                        ? 1
                                                                        : -1,
                                                                )}
                                                                control={control}
                                                                name={'currency'}
                                                                label={CURRENCY}
                                                                dataItemKey={'currencyID'}
                                                                textField={'currencyName'}
                                                                // disabled={!show.profileUserEdit}
                                                                required
                                                                rules={{
                                                                    required: SELECT_CURRENCY,
                                                                }}
                                                            />
                                                        </div>
                                                    </Col>
                                                    <Col sm={4} xs={6}>
                                                        <div className="form-group" id="rs_MyProfile_dateFormat">
                                                            <RSKendoDropDownList
                                                                // data={dateFormatList}
                                                                data={dateFormatList
                                                                    ?.filter((item) =>
                                                                        [
                                                                            'MMM DD, YYYY',
                                                                            'MMM-DD-YYYY',
                                                                            'DD-MMM-YYYY',
                                                                            'YYYY-MMM-DD',
                                                                        ].includes(item.dateformat),
                                                                    )
                                                                    ?.sort((a, b) =>
                                                                        a.dateformat?.toLowerCase() >
                                                                        b.dateformat?.toLowerCase()
                                                                            ? 1
                                                                            : -1,
                                                                    )}
                                                                control={control}
                                                                name={'dateFormat'}
                                                                label={'Date format'}
                                                                dataItemKey={'dateFormatID'}
                                                                textField={'dateformat'}
                                                                required
                                                                rules={{
                                                                    required: SELECT_DATE_FORMAT,
                                                                }}
                                                            />
                                                        </div>
                                                    </Col>
                                                    <Col sm={4} xs={6}>
                                                        <div className="form-group" id="rs_MyProfile_languageID">
                                                            <RSKendoDropDownList
                                                                // data={languageMasterList}
                                                                data={languageMasterList?.sort((a, b) =>
                                                                    a.languageName?.toLowerCase() >
                                                                    b.languageName?.toLowerCase()
                                                                        ? 1
                                                                        : -1,
                                                                )}
                                                                control={control}
                                                                name={'langauge'}
                                                                label={'Language'}
                                                                dataItemKey={'languageID'}
                                                                // disabled={!show.profileUserEdit}
                                                                textField={'languageName'}
                                                                required
                                                                rules={{
                                                                    required: SELECT_LANGUAGE,
                                                                }}
                                                            />
                                                        </div>
                                                    </Col>
                                                    <Col sm={4} xs={6}>
                                                        <div className="form-group mb0" id="rs_MyProfile_timeFormat">
                                                            <RSKendoDropDownList
                                                                // data={timeFormatList}
                                                                data={timeFormatList?.sort((a, b) =>
                                                                    a.timeformat?.toLowerCase() >
                                                                    b.timeformat?.toLowerCase()
                                                                        ? 1
                                                                        : -1,
                                                                )}
                                                                control={control}
                                                                name={'timeFormat'}
                                                                label={'Time format'}
                                                                dataItemKey={'timeFormatID'}
                                                                textField={'timeformat'}
                                                                required
                                                                rules={{
                                                                    required: SELECT_TIME_FORMAT,
                                                                }}
                                                            />
                                                        </div>
                                                    </Col>
                                                    <Col sm={8} xs={6}>
                                                        <div className="form-group mb0" id="rs_MyProfile_timeZoneID">
                                                            <RSKendoDropDownList
                                                                // data={timeZoneList}
                                                                data={timeZoneList?.sort((a, b) =>
                                                                    a.timeZoneName?.toLowerCase() >
                                                                    b.timeZoneName?.toLowerCase()
                                                                        ? 1
                                                                        : -1,
                                                                )}
                                                                control={control}
                                                                name={'timezone'}
                                                                label={'Time zone'}
                                                                dataItemKey={'timeZoneID'}
                                                                textField={'timeZoneName'}
                                                                // disabled={!show.profileUserEdit}
                                                                required
                                                                rules={{
                                                                    required: SELECT_TIMEZONE,
                                                                }}
                                                                // handleChange={() => {
                                                                //     setValue('isDayLight', false);
                                                                //     clearErrors('isDayLight');
                                                                // }}
                                                            />
                                                        </div>
                                                    </Col>
                                                    {/* <Col sm={4} xs={6}>
                                                        <div className="form-group m0 position-relative top6">
                                                            <RSCheckbox
                                                                control={control}
                                                                id="rs_MyProfile_isDayLightcheckbox"
                                                                name="isDayLight"
                                                                type="checkbox"
                                                                disabledchk={!timeZoneWatch?.isDayLight}
                                                                labelName="Daylight saving"
                                                                className="smaller"
                                                            />
                                                        </div>
                                                    </Col> */}
                                                </Row>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </div>
                            <div className="buttons-holder">
                                <Row>
                                    <Col>
                                        <RSSecondaryButton
                                            onClick={() => {
                                                if (isProfileUpdateLoading) return;
                                                dispatch(restProfileData());
                                                navigate('/preferences');
                                            }}
                                            blockInteraction={isProfileUpdateLoading}
                                            id="rs_MyProfile_Cancel"
                                        >
                                            {CANCEL}
                                        </RSSecondaryButton>
                                        {updateAccess && (
                                            <RSPrimaryButton
                                                onClick={() => {
                                                    if (isProfileUpdateLoading) return;
                                                    handleSubmit((data) => handleFormSubmit(data))();
                                                }}
                                                isLoading={isProfileUpdateLoading}
                                                // className={!isValid ? 'click-off' : ''}
                                                id="rs_MyProfile_Update"
                                                blockBodyPointerEvents
                                            >
                                                {UPDATE}
                                            </RSPrimaryButton>
                                        )}
                                    </Col>
                                </Row>
                            </div>
                        </Container>
                    </div>
                </Container>
                    </>
                )}
            </form>
            {/* <ProtectedRoutes /> */}
            {show.changePasswordModal && (
                <ChangePasswordModal
                    show={show.changePasswordModal}
                    phoneNo={getValues('phoneNo')}
                    dialCode={dialCode.current}
                    handleClose={() => setIsShow((prev) => ({ ...prev, changePasswordModal: false }))}
                    onSave={() => setIsShow((prev) => ({ ...prev, changePasswordModal: false }))}
                />
            )}
            {/* {show.changePhoneNumberModal && ( */}
            {show.changePhoneNumberModal && (
                <ChangeMobileNumber
                    show={show.changePhoneNumberModal}
                    handleClose={() => {
                        dispatch(resetOtpState());
                        setIsShow((prev) => ({ ...prev, changePhoneNumberModal: false }));
                    }}
                />
            )}
            {show.imageUploadModal && (
                <RSModal
                    show={show.imageUploadModal}
                    header={EDIT_PROFILE_PICTURE}
                    size="md"
                    handleClose={handleModalClose}
                    body={
                        <div className="image-upload-crop-container">
                            {showFileUpload && (
                                <Row className="mt11">
                                    <Col>
                                        <RSFileUpload
                                            isbase64={true}
                                            control={control}
                                            name={'uploadImageName'}
                                            text="Browse"
                                            accept=".png,.jpg,.jpeg"
                                            customInputClass={'upload-button-top-align ml20'}
                                            size={512000}
                                            isBase64Status={true}
                                            base64Data={async (base64, fileName, contentLength) => {
                                                handleImageUpload(base64, fileName);
                                            }}
                                            handleChange={(e) => {}}
                                            required
                                            watch={watch}
                                            setError={setError}
                                            clearErrors={clearErrors}
                                        />
                                        <small className="text-muted d-block mt5">
                                            Allowed formats: .jpg,.jpeg,.png | maximum size: 500kb
                                        </small>
                                    </Col>
                                </Row>
                            )}

                            {tempImageData && (
                                <>
                                    <ImageCropModal
                                        imageSrc={tempImageData}
                                        onCropComplete={handleCropComplete}
                                        onCancel={handleModalClose}
                                        aspectRatio={1}
                                        cropShape="round"
                                        showGrid={true}
                                        height="250px"
                                        setTempImageData={setTempImageData}
                                        setShowFileUpload={setShowFileUpload}
                                        setValue={setValue}
                                    />
                                </>
                            )}
                        </div>
                    }
                />
            )}
            {getWarningPopupMessage(failureApiErrors, dispatch)}
        </FormProvider>
        // Content holder ends
    );
};

export default MyProfile;
