import { MAX_LENGTH100, MAX_LENGTH50 } from 'Constants/GlobalConstant/Regex';
import { ENTER_PHONE, ENTER_VALID_DIAL_CODE, ENTER_VALID_PHONE_NO, PASSWORD_NOT_MATCH, SELECT_JOBFUNCTION, UPLOAD_PROFILE_IMAGE } from 'Constants/GlobalConstant/ValidationMessage';
import { COMFIRMPASSWORD_RULES, FIRSTNAME_RULES, LASTNAME_RULES, PASSWORD_RULES } from 'Constants/GlobalConstant/Rules';
import { ALLOWED_FORMATS, BACK, CONFIRM_PASSWORD, EDIT_PROFILE_PICTURE, EMAIL, FILE_NAME_EXTENSIONS_JPG_PNG_JPEG_1, FILE_SIZE500KB, FIRST_NAME, LAST_NAME, MIN_8_CHARACTERS, MOBILE_NUMBER, NEXT, PASSWORD, PASSWORD_MAX_15_CHARACTERS, REMOVE_PROFILE_PICTURE, UPDATE_PROFILE_PICTURE, UPLOAD_PROFILE_PICTURE } from 'Constants/GlobalConstant/Placeholders';
import { circle_minus_fill_medium, circle_pencil_medium, circle_plus_fill_medium, circle_question_mark_mini } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useImageUpload } from 'Hooks/useImageUpload';
import { Col, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

import RSTooltip from 'Components/RSTooltip';
import RSInput from 'Components/FormFields/RSInput';
import RSPhoneInput from 'Components/FormFields/RSPhoneInput';
import ConfirmMobileNumber from './Component/ConfirmMobileNumberModal';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSModal from 'Components/RSModal';
import ImageCropModal from 'Components/ImageCropModal';
import { userImg } from 'Assets/Images';

import { getmasterData } from 'Utils/modules/masterData';
import { onKeyChar } from 'Utils/modules/inputValidators';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';

import { updateUserFormState } from 'Reducers/login/newUser/reducer';
import { phoneDialCode } from 'Components/FormFields/RSPhoneInput/constant';
import { maskEmailTwoCharsBeforeAndAfterDomain } from 'Utils/modules/masking';

const KeyContactInfo = ({ nextScreen, back, type }) => {
    const dispatch = useDispatch();
    const { jobFunctionList = [] } = getmasterData();

    const {
        control,
        setError,
        setValue,
        clearErrors,
        handleSubmit,
        watch,
        getValues,
        setFocus,
        reset,
        formState: { errors },
    } = useForm({
        mode: 'onTouched',
    });
    const [passwordwatch, confirmPassword] = watch(['password', 'confirmPassword']);

    const {
        profile,
        title,
        firstname,
        lastname,
        phoneNo,
        emailId,
        jobFunction,
        password,
        otp,
        optSession,
        show,
        disable,
        countryDetails,
        isCancel,
        ...rest
    } = useSelector(({ newUserReducer }) => newUserReducer);

    const [phoneState, setPhoneState] = useState({
        show: false,
        disable: false,
        setFocus: false,
        countryDetails: {},
    });

    const {
        fileInputRef,
        imageModalState,
        handleNativeFileChange,
        openCropWithExistingImage,
        handleCropComplete,
        handleModalClose,
        triggerUpload,
        setTempImageData,
    } = useImageUpload(setValue, setError, clearErrors, 'profile');

    useEffect(() => {
        setPhoneState(() => ({
            disable: disable,
            show: phoneNo !== '',
            setFocus: false,
            countryDetails: phoneState?.countryDetails,
        }));
    }, [phoneNo, disable, countryDetails]);

    useEffect(() => {
        reset({
            profile,
            title,
            firstname,
            lastname,
            phoneNo,
            emailId,
            jobFunction,
            password,
            confirmPassword: rest.confirmPassword,
        });
    }, []);

    const confirmPhoneModalProp = { ...phoneState.countryDetails, number: getValues('phoneNo') };

    const handlePassword = () => {
        if (passwordwatch !== confirmPassword) {
            setError('password', 'Password does not match');
            setError('confirmPassword', 'Password and confirm password does not match');
        }
    };

    useEffect(() => {
        if (phoneState?.setFocus) {
            setTimeout(() => {
                setFocus('phoneNo');
                //   document.getElementsByClassName('react-tel-input')[0]?.children[1].focus();
            }, 500);
        }
    }, [phoneState?.setFocus]);



    const ProfileImageUploadButton = ({ value, onClick, onRemove, onEdit, error }) => {
        const [tooltip, setTooltip] = useState(false);
        const [removeTooltip, setRemoveTooltip] = useState(false);

        const isBase64Includes = value?.includes('base64') || false;
        let imageSrc;
        if (isBase64Includes) {
            imageSrc = value;
        } else if (value) {
            imageSrc = `data:image/png;base64,${value}`;
        } else {
            imageSrc = userImg;
        }

        return (
            <>
                <div className={`picture rs-picture mt20 ${error ? 'errorContainer' : ''} required`}>
                    <figure>
                        <img src={imageSrc} alt="profile picture" />
                    </figure>
                    <div className={`picture-choose-file ${value ? 'valid-image' : ''}`}>
                        <span className="info">
                            <RSTooltip
                                text={value ? UPDATE_PROFILE_PICTURE : UPLOAD_PROFILE_PICTURE}
                                position="top"
                                show={tooltip}
                            >
                                <span
                                    onMouseEnter={() => setTooltip(true)}
                                    onMouseLeave={() => setTooltip(false)}
                                    onClick={onClick}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {value ? (
                                        <>
                                            <span className="pcf-remove-icon">
                                                <RSTooltip
                                                    text={REMOVE_PROFILE_PICTURE}
                                                    position="top"
                                                    show={removeTooltip}
                                                >
                                                    <i
                                                        className={`${circle_minus_fill_medium} color-primary-red icon-md`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onRemove();
                                                        }}
                                                        onMouseEnter={() => {
                                                            setRemoveTooltip(true);
                                                            setTooltip(false);
                                                        }}
                                                        onMouseLeave={() => setRemoveTooltip(false)}
                                                    ></i>
                                                </RSTooltip>
                                            </span>
                                            <i
                                                className={`${circle_pencil_medium} color-primary-blue icon-md`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEdit && onEdit();
                                                }}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        </>
                                    ) : (
                                        <i className={`${circle_plus_fill_medium} color-primary-blue icon-md`} />
                                    )}
                                </span>
                            </RSTooltip>
                            <span className="pcf-label">{EDIT_PROFILE_PICTURE}</span>
                        </span>
                    </div>
                    {error && <div className="validation-message">{error}</div>}
                </div>
                {!value && (
                    <div className="alert alert-warning d-block mt30 py10 border-r5">
                        <small className="text-center d-flex flex-column">
                            <span>{ALLOWED_FORMATS}</span>
                            <span>{FILE_NAME_EXTENSIONS_JPG_PNG_JPEG_1}</span>
                            <span>{FILE_SIZE500KB}</span>
                        </small>
                    </div>
                )}
            </>
        );
    };
    return (
        <Fragment>
            <form
                onSubmit={handleSubmit((data) => {
                    if (!data.profile) {
                        setError('profile', {
                            type: 'manual',
                            message: UPLOAD_PROFILE_IMAGE,
                        });
                        return;
                    }
                    if (!phoneState.disable) {
                        setFocus('phoneNo');
                        setError('phoneNo', {
                            type: 'custom',
                            message: 'Validate mobile number before proceed',
                        });
                        return;
                    }
                    dispatch(updateUserFormState({ ...data, ...phoneState, isCancel: false }));
                    nextScreen(type === 'agency' ? 'AGENCY_DETAILS' : 'BRAND_DETAILS');
                })}
            >
                <div className="box-design rs-box rs-box-min-height py40">
                    {/* <Row className="res-gx-2"> */}
                    <Row>
                        <Col md={3} sm={4} className="accountsetup-image-upload">
                            <Col>
                                <ProfileImageUploadButton
                                    value={watch('profile')}
                                    onClick={triggerUpload}
                                    onEdit={() => openCropWithExistingImage(watch('profile'))}
                                    onRemove={() => {
                                        setValue('profile', null);
                                        setError('profile', {
                                            type: 'manual',
                                            message: UPLOAD_PROFILE_IMAGE,
                                        });
                                    }}
                                    error={errors?.profile?.message}
                                />
                            </Col>
                        </Col>
                        <Col md={9} sm={8} className="box-left-border d-flex align-items-center accountsetup-contact-info">
                            <Row>
                                <Col sm={6} xs={12}>
                                    <div className="form-group">
                                        <RSInput
                                            type={'text'}
                                            name={'firstname'}
                                            id="rs_KeyContactInfo_firstname"
                                            placeholder={FIRST_NAME}
                                            control={control}
                                            onKeyDown={onKeyChar}
                                            required
                                            maxLength={MAX_LENGTH50}
                                            rules={FIRSTNAME_RULES}
                                              restrictSpecialChars = {true}
                                        />
                                    </div>
                                </Col>
                                <Col sm={6} xs={12}>
                                    <div className="form-group">
                                        <RSInput
                                            type={'text'}
                                            name={'lastname'}
                                            id="rs_KeyContactInfo_lastname"
                                            placeholder={LAST_NAME}
                                            control={control}
                                            onKeyDown={onKeyChar}
                                            maxLength={MAX_LENGTH50}
                                            required
                                            rules={LASTNAME_RULES}
                                              restrictSpecialChars = {true}
                                        />
                                    </div>
                                </Col>
                                <Col sm={6} xs={12}>
                                    <div className="form-group" id="rs_KeyContactInfo_phoneNo">
                                        <RSPhoneInput
                                            name="phoneNo"
                                            control={control}
                                            setValue={setValue}
                                            setError={setError}
                                            clearErrors={clearErrors}
                                            disabled={phoneState.disable}
                                            label={MOBILE_NUMBER}
                                            required
                                            errors={errors}
                                            rules={{ required: ENTER_PHONE }}
                                            handleOnBlur={(e, data) => {
                                                const {
                                                    target: { value: eventValue },
                                                } = e;
                                                const { format, dialCode } = data;

                                                if (
                                                    !phoneDialCode
                                                        ?.map((e) => e.dialCode)
                                                        .includes(eventValue?.split(' ')[0])
                                                ) {
                                                    setError('phoneNo', {
                                                        type: 'custom',
                                                        message: ENTER_VALID_DIAL_CODE,
                                                    });
                                                    return;
                                                } else if (eventValue?.length === format?.length) {
                                                    if (
                                                        eventValue.split(' ')[1].startsWith('00') ||
                                                        eventValue.split(' ')[1].startsWith('11')
                                                    ) {
                                                        // if (regex.PHONEINPUT.test(eventValue.split(' ')[1])) {
                                                        setTimeout(() => {
                                                            setError('phoneNo', {
                                                                type: 'custom',
                                                                message: ENTER_VALID_PHONE_NO,
                                                            });
                                                        }, 10);
                                                    } else {
                                                        setPhoneState((prev) => {
                                                            return {
                                                                ...prev,
                                                                show: true,
                                                                setFocus: false,
                                                                countryDetails: { value: eventValue, ...data },
                                                            };
                                                        });
                                                    }
                                                } else {
                                                    setTimeout(() => {
                                                        setError('phoneNo', {
                                                            type: 'custom',
                                                            message: ENTER_VALID_PHONE_NO,
                                                        });
                                                    }, 10);
                                                }
                                            }}
                                        />

                                        <div className="form-field-icon">
                                            <RSTooltip
                                                position="top"
                                                text="The license key will be sent to this mobile number"
                                            >
                                                <i
                                                    className={`${circle_question_mark_mini} icon-xs`}
                                                    id="rs_KeyContactInfo_phonequestion"
                                                ></i>
                                            </RSTooltip>
                                        </div>

                                        {/* <small className="position-absolute">
                                            License key will be sent to this mobile number.
                                        </small> */}
                                    </div>
                                </Col>
                                <Col sm={6} xs={12}>
                                    <div className="form-group">
                                        <RSInput
                                            type={'text'}
                                            name={'emailId'}
                                            disabled={!!emailId}
                                            placeholder={EMAIL}
                                            control={control}
                                            maxLength={MAX_LENGTH100}
                                            required
                                            maskValue={maskEmailTwoCharsBeforeAndAfterDomain}
                                            // rules={rules.EMAIL_RULES}
                                            // autoComplete={'off'}
                                        />
                                    </div>
                                </Col>
                                <Col sm={6} xs={12}>
                                    <div className="form-group" id="rs_KeyContactInfo_jobFunction">
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
                                    <div className={`${show || phoneState.disable ? 'abc' : '123'} form-group`}>
                                        <RSInput
                                            type={'password'}
                                            name={'password'}
                                            id="rs_KeyContactInfo_password"
                                            required
                                            viewEye
                                            maxLength={15}
                                            placeholder={PASSWORD}
                                            control={control}
                                            meter
                                            handleOnchange={handlePassword}
                                            rules={{
                                                ...PASSWORD_RULES,
                                                validate: (data) =>
                                                    !!confirmPassword && data !== confirmPassword
                                                        ? PASSWORD_NOT_MATCH
                                                        : true,
                                            }}
                                    smallText= {MIN_8_CHARACTERS}
                                    rightTooltip = {PASSWORD_MAX_15_CHARACTERS}
                                        />                                    </div>
                                </Col>
                                <Col md={{span:6 ,offset:6}}>
                                    <div className="form-group mt17">
                                        <RSInput
                                            type={'password'}
                                            id="rs_KeyContactInfo_confirmpassword"
                                            required
                                            name={'confirmPassword'}
                                            handleOnchange={handlePassword}
                                            placeholder={CONFIRM_PASSWORD}
                                            control={control}
                                            maxLength={15}
                                            viewEye
                                            meter
                                            rules={COMFIRMPASSWORD_RULES(passwordwatch)}
                                            isConfirmPassword={true}
                                        />
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </div>
                <div className="buttons-holder">
                    {isCancel && (
                        <RSSecondaryButton
                            id="rs_KeyContactInfo_back"
                            onClick={() => (type === 'agency' ? back('ACCOUNT_TYPE', '') : back('LICENSE_TYPE', ''))}
                        >
                            {BACK}
                        </RSSecondaryButton>
                    )}
                    <RSPrimaryButton id="rs_KeyContactInfo_next" type="submit" className="ml15">
                        {NEXT}
                    </RSPrimaryButton>
                </div>
            </form>
            <ConfirmMobileNumber
                show={phoneState.show}
                phoneState={confirmPhoneModalProp}
                confirm={(status) => {
                    if (status) {
                        setPhoneState((prev) => ({
                            ...prev,
                            show: false,
                            disable: true,
                        }));
                    }
                }}
                handleClose={(status) => {
                    const input = document.getElementsByTagName('phoneNo');
                                        if (status) {
                        setFocus('phoneNo');
                    }
                    setPhoneState((prev) => ({
                        ...prev,
                        show: false,
                        disable: false,
                        setFocus: true,
                    }));
                }}
            />
            <input
                type="file"
                ref={fileInputRef}
                accept=".png,.jpg,.jpeg"
                style={{ display: 'none' }}
                onChange={handleNativeFileChange}
            />
            {imageModalState.show && imageModalState.tempImageData && (
                <RSModal
                    show={imageModalState.show}
                    header={EDIT_PROFILE_PICTURE}
                    size="md"
                    handleClose={handleModalClose}
                    body={
                        <div className="image-upload-crop-container">
                            <ImageCropModal
                                imageSrc={imageModalState.tempImageData}
                                onCropComplete={handleCropComplete}
                                onCancel={handleModalClose}
                                aspectRatio={1}
                                cropShape="round"
                                showGrid={true}
                                height="250px"
                                setTempImageData={setTempImageData}
                                setShowFileUpload={() => {
                                    handleModalClose();
                                    triggerUpload();
                                }}
                                setValue={setValue}
                            />
                        </div>
                    }
                />
            )}
        </Fragment>
    );
};

export default KeyContactInfo;
