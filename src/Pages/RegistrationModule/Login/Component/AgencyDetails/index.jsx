import { MAX_LENGTH10, MAX_LENGTH150, MAX_LENGTH255, MAX_LENGTH50, MIN_LENGTH } from 'Constants/GlobalConstant/Regex';
import { AGENCY_GROUP as AGENCY_GROUP_MSG, AGENCY_NAME as AGENCY_NAME_MSG, ENTER_ADDRESS, MINLENGTH, SELECT_COUNTRY, UPLOAD_COMPANY_IMAGE } from 'Constants/GlobalConstant/ValidationMessage';
import { CITY_RULE, WEBSITE_RULES_SECURE, ZIP_RULES } from 'Constants/GlobalConstant/Rules';
import { ADDRESS, AGENCY_GROUP, AGENCY_NAME, ALLOWED_FORMATS, CITY, FILE_NAME_EXTENSIONS_JPG_PNG_JPEG_1, FILE_SIZE500KB, WEBSITE, ZIP } from 'Constants/GlobalConstant/Placeholders';
import { circle_minus_fill_medium, circle_pencil_medium, circle_plus_fill_medium, circle_question_mark_mini } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { charNum } from 'Utils/modules/inputValidators';
import { getmasterData } from 'Utils/modules/masterData';

import { useImageUpload } from 'Hooks/useImageUpload';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSInput from 'Components/FormFields/RSInput';
import RSTooltip from 'Components/RSTooltip';
import RSModal from 'Components/RSModal';
import ImageCropModal from 'Components/ImageCropModal';
import { Building } from 'Assets/Images';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { checkClientNameExists, validateWebsite } from 'Reducers/login/newUser/request';
import { updateUserFormState } from 'Reducers/login/newUser/reducer';

const AgencyDetails = ({ back, nextScreen }) => {
    const [loading, setLoading] = useState({
        agencyGroup: {
            loading: false,
            isValid: false,
            value: null,
        },
        agencyName: {
            loading: false,
            isValid: false,
            value: null,
        },
        agencyWebsite: {
            loading: false,
            isValid: false,
            value: null,
        },
    });

    const dispatch = useDispatch();
    const masterData = getmasterData();
    const { countryMasterList = [] } = getmasterData();
    const { stateList =[]} = getmasterData();
    const {
        handleSubmit,
        control,
        setError,
        clearErrors,
        setValue,
        getValues,
        watch,
        formState: { errors, isValid },
    } = useForm({
        mode: 'onTouched',
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
    } = useImageUpload(setValue, setError, clearErrors, 'agencyPhoto');
    
    const selectedCountry = watch('country');
    const filteredStateList = useMemo(() => {
        if (!selectedCountry || !stateList.length) return [];
        const selectedCountryID = selectedCountry?.countryID || selectedCountry;
        return stateList
            .filter((state) => state.countryID === selectedCountryID)
            .sort((a, b) => a.state.toLowerCase() > b.state.toLowerCase() ? 1 : -1);
    }, [selectedCountry, stateList]);
    
    const isFormValid =
        !isValid || !loading.agencyGroup.isValid || !loading.agencyName.isValid || !loading.agencyWebsite.isValid;
            const {
        agencyPhoto,
        agencyGroup,
        agencyAddress,
        agencyName,
        agencyCity,
        agencyZipcode,
        agencyWebsite,
        country,
        inputState,
    } = useSelector(({ newUserReducer }) => newUserReducer);

    const agencyGroupHasError = Object.hasOwn(errors, 'agencyGroup');
    const agencyNameHasError = Object.hasOwn(errors, 'agencyName');
    const agencyWebsiteHasError = Object.hasOwn(errors, 'agencyWebsite');

    useEffect(() => {
        if (inputState) setLoading(inputState);
    }, []);

    const handleClientNamevalidation = async (value, errorMessage, name, type) => {
        if (value?.length > 0 && !errorMessage && value !== loading[name].value) {
            const payload = {};
            setLoading((prev) => ({
                ...prev,
                [name]: {
                    isValid: false,
                    loading: true,
                    value,
                },
            }));
            let api;
            if (type === 'website') {
                if (agencyWebsiteHasError) {
                    setLoading((prev) => ({
                        ...prev,
                        [name]: {
                            isValid: false,
                            loading: false,
                            value,
                        },
                    }));
                } else {
                    api = validateWebsite;
                    payload.Website = value;
                }
            } else {
                api = checkClientNameExists;
                payload.clientName = value;
            }

            const { status = false, message = '' } = await dispatch(
                api({
                    payload,
                    setError,
                    name,
                }),
            ) ?? {};

            if (
                (type !== 'website' && !status) ||
                (type === 'website' && status && message !== 'Enter valid website')
            ) {
                setLoading((prev) => ({
                    ...prev,
                    [name]: {
                        ...prev[name],
                        loading: false,
                        isValid: true,
                    },
                }));
            } else {
                setLoading((prev) => ({
                    ...prev,
                    [name]: {
                        ...prev[name],
                        loading: false,
                        isValid: false,
                    },
                }));
            }
        } else if (errorMessage) {
            setLoading((prev) => ({
                ...prev,
                [name]: {
                    value: null,
                    loading: false,
                    isValid: false,
                },
            }));
        } else if (!errorMessage && value === loading[name].value) {
            setLoading((prev) => ({
                ...prev,
                [name]: {
                    ...prev[name],
                    loading: false,
                    isValid: true,
                },
            }));
        }
    };

    // const handleWebsiteChange = ({ target: { value } }) => {
    //     if (value?.length > 0 && !agencyWebsiteHasError && value !== existingvalue['website']) {
    //         const payload = {
    //             Website: value,
    //         };
    //         existingvalue['website'] = value;
    //         dispatch(validateWebsite({ payload, setError, name: 'agencyWebsite' }));
    //     } else if (agencyWebsiteHasError) {
    //         existingvalue['website'] = null;
    //     }
    // };



    const AgencyImageUploadButton = ({ value, onClick, onRemove, onEdit, error }) => {
        const [tooltip, setTooltip] = useState(false);
        const [removeTooltip, setRemoveTooltip] = useState(false);

        const isBase64Includes = value?.includes('base64') || false;
        let imageSrc;
        if (isBase64Includes) {
            imageSrc = value;
        } else if (value) {
            imageSrc = `data:image/png;base64,${value}`;
        } else {
            imageSrc = Building;
        }

        return (
            <>
                <div className={`picture rs-picture mt20 ${error ? 'errorContainer' : ''} required`}>
                    <figure>
                        <img src={imageSrc} alt="agency logo" />
                    </figure>
                    <div className={`picture-choose-file ${value ? 'valid-image' : ''}`}>
                        <span className="info">
                            <RSTooltip
                                text={value ? 'Update agency logo' : 'Upload agency logo'}
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
                                                <RSTooltip text="Remove agency logo" position="top" show={removeTooltip}>
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
                            <span className="pcf-label">Edit agency logo</span>
                        </span>
                    </div>
                    {error && <div className="validation-message">{error}</div>}
                </div>
                {!value && (
                    <div className="alert alert-warning d-block mt30 py5 border-r5">
                        <small className="text-center">
                            {ALLOWED_FORMATS}
                            <br />
                            {FILE_NAME_EXTENSIONS_JPG_PNG_JPEG_1}
                            <br />
                            {FILE_SIZE500KB}
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
                    if (!data.agencyPhoto) {
                        setError('agencyPhoto', {
                            type: 'manual',
                            message: UPLOAD_COMPANY_IMAGE,
                        });
                        return;
                    }
                    dispatch(updateUserFormState({ ...data, inputState: loading }));
                    nextScreen('LOCALIZATION_SETTINGS');
                })}
            >
                <div className="box-design rs-box rs-box-min-height py40">
                    <Row>
                        <Col md={3} sm={4} id="rs_AgencyDetails_agencyphoto" className="accountsetup-image-upload">
                            <AgencyImageUploadButton
                                value={watch('agencyPhoto')}
                                onClick={triggerUpload}
                                onEdit={() => openCropWithExistingImage(watch('agencyPhoto'))}
                                onRemove={() => {
                                    setValue('agencyPhoto', null);
                                    setError('agencyPhoto', {
                                        type: 'manual',
                                        message: UPLOAD_COMPANY_IMAGE,
                                    });
                                }}
                                error={errors?.agencyPhoto?.message}
                            />
                        </Col>
                        <Col
                            md={9}
                            sm={8}
                            className="box-left-border d-flex align-items-center accountsetup-contact-info"
                        >
                            <Row>
                                <Col sm={6} xs={12}>
                                    <div className="form-group">
                                        <RSInput
                                            control={control}
                                            id="rs_AgencyDetails_agencygroup"
                                            defaultValue={agencyGroup}
                                            name={'agencyGroup'}
                                            // onKeyDown={charNumUnderScore}
                                            isValidIcon={loading.agencyGroup.isValid}
                                            isLoading={loading.agencyGroup.loading}
                                            minLength={MIN_LENGTH}
                                            maxLength={MAX_LENGTH255}
                                            required
                                            isCustomIcon={true}
                                            isCustomLoader ={true}
                                            rules={{
                                                required: AGENCY_GROUP_MSG,
                                                minLength: {
                                                    value: MIN_LENGTH,
                                                    message: MINLENGTH,
                                                },
                                                validate: {
                                                    groupError: () =>
                                                        agencyGroupHasError
                                                            ? errors?.agencyGroup?.message
                                                            : true,
                                                    // matchCompany: (value) => {
                                                    //     const brandCom = getValues('agencyName');
                                                    //     return value?.trim()?.toLowerCase() ===
                                                    //         brandCom?.trim()?.toLowerCase() || ''
                                                    //         ? error.CLIENTNAME_SHOULD_NOT_MATCH
                                                    //         : true;
                                                    // },
                                                },
                                            }}
                                            placeholder={AGENCY_GROUP}
                                            handleOnchange={() => {
                                                if (agencyGroupHasError) clearErrors('agencyGroup');
                                                if (loading.agencyGroup.isValid)
                                                    setLoading((prev) => ({
                                                        ...prev,
                                                        agencyGroup: {
                                                            ...prev['agencyGroup'],
                                                            isValid: false,
                                                        },
                                                    }));
                                            }}
                                            handleOnBlur={({ target: { value } }) => {
                                                if (value?.length > 2) {
                                                    handleClientNamevalidation(
                                                        value,
                                                        agencyGroupHasError,
                                                        'agencyGroup',
                                                    );
                                                }
                                            }}
                                        />
                                        <div className="form-field-icon">
                                            <RSTooltip
                                                position="top"
                                                text="A corporate group is a collection of subsidiaries and business entities"
                                            >
                                                <i
                                                    className={`${circle_question_mark_mini} icon-xs`}
                                                    id="circle_AgencyDetails_question"
                                                ></i>
                                            </RSTooltip>
                                        </div>
                                    </div>
                                </Col>
                                <Col sm={6} xs={12}>
                                    <div className="form-group">
                                        <RSInput
                                            control={control}
                                            defaultValue={agencyAddress}
                                            name={'agencyAddress'}
                                            id="rs_AgencyDetails_agencyAddress"
                                            maxLength={MAX_LENGTH255}
                                            required
                                            rules={{
                                                required: ENTER_ADDRESS,
                                                minLength: {
                                                    value: MIN_LENGTH,
                                                    message: MINLENGTH,
                                                },
                                            }}
                                            placeholder={ADDRESS}
                                        />
                                    </div>
                                </Col>
                                <Col sm={6} xs={12}>
                                    <div className="form-group">
                                        <RSInput
                                            control={control}
                                            defaultValue={agencyName}
                                            name={'agencyName'}
                                            id="rs_AgencyDetails_agencyName"
                                            // onKeyDown={charNumUnderScore}
                                            minLength={MIN_LENGTH}
                                            maxLength={MAX_LENGTH255}
                                            isValidIcon={loading.agencyName.isValid}
                                            isLoading={loading.agencyName.loading}
                                            required
                                            rules={{
                                                required: AGENCY_NAME_MSG,
                                                minLength: {
                                                    value: MIN_LENGTH,
                                                    message: MINLENGTH,
                                                },
                                                validate: {
                                                    groupError: () =>
                                                        agencyNameHasError ? errors?.agencyName?.message : true,
                                                    // matchCompany: (value) => {
                                                    //     const brandCom = getValues('agencyGroup')?.trim();
                                                    //     return value?.trim()?.toLowerCase() ===
                                                    //         brandCom?.trim()?.toLowerCase() || ''
                                                    //         ? error.CLIENTNAME_SHOULD_NOT_MATCH
                                                    //         : true;
                                                    // },
                                                },
                                                // validate: () =>
                                                //     agencyNameHasError ? _get(errors, 'agencyName.message') : true,
                                            }}
                                            placeholder={AGENCY_NAME}
                                            handleOnchange={() => {
                                                if (agencyNameHasError) clearErrors('agencyName');
                                                if (loading.agencyName.isValid)
                                                    setLoading((prev) => ({
                                                        ...prev,
                                                        agencyName: {
                                                            ...prev['agencyName'],
                                                            isValid: false,
                                                        },
                                                    }));
                                            }}
                                            handleOnBlur={({ target: { value } }) => {
                                                if (value?.length >= 3) {
                                                    handleClientNamevalidation(value, agencyNameHasError, 'agencyName');
                                                }
                                            }}
                                        />
                                    </div>
                                </Col>

                                <Col sm={6} xs={12}>
                                    <div className="form-group">
                                        <Row>
                                            <Col>
                                                <RSInput
                                                    control={control}
                                                    defaultValue={agencyCity}
                                                    maxLength={MAX_LENGTH50}
                                                    name={'agencyCity'}
                                                    id="rs_AgencyDetails_agencyCity"
                                                    //onKeyDown={onKeyChar}
                                                    required
                                                    rules={CITY_RULE}
                                                    placeholder={CITY}
                                                />
                                            </Col>
                                            <Col>
                                                <RSInput
                                                    control={control}
                                                    defaultValue={agencyZipcode}
                                                    type="text"
                                                    maxLength={MAX_LENGTH10}
                                                    name={'agencyZipcode'}
                                                    id="rs_AgencyDetails_agencyZipcode"
                                                    required
                                                    onKeyDown={charNum}
                                                    rules={ZIP_RULES}
                                                    placeholder={ZIP}
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                </Col>

                                <Col sm={6} xs={12}>
                                    <div className="form-group ">
                                        <RSInput
                                            control={control}
                                            defaultValue={agencyWebsite}
                                            name={'agencyWebsite'}
                                            id="rs_AgencyDetails_agencyWebsite"
                                            maxLength={MAX_LENGTH150}
                                            isLoading={loading.agencyWebsite.loading}
                                            isValidIcon={loading.agencyWebsite.isValid}
                                            required
                                            rules={{
                                                ...WEBSITE_RULES_SECURE,
                                                validate: () =>
                                                    agencyWebsiteHasError
                                                        ? errors?.agencyWebsite?.message
                                                        : true,
                                            }}
                                            placeholder={WEBSITE}
                                            handleOnchange={() => {
                                                if (agencyWebsiteHasError) clearErrors('agencyWebsite');
                                                if (loading.agencyWebsite.isValid)
                                                    setLoading((prev) => ({
                                                        ...prev,
                                                        agencyWebsite: {
                                                            ...prev['agencyWebsite'],
                                                            isValid: false,
                                                        },
                                                    }));
                                            }}
                                            handleOnBlur={({ target: { value } }) => {
                                                if (!value?.startsWith('https://')) {
                                                    setError(`agencyWebsite`, {
                                                        type: 'custom',
                                                        message: 'Enter a valid URL',
                                                    });
                                                    return;
                                                } else {
                                                    handleClientNamevalidation(
                                                        value,
                                                        agencyWebsiteHasError,
                                                        'agencyWebsite',
                                                        'website',
                                                    );
                                                }
                                            }}
                                        />
                                    </div>
                                </Col>
                                <Col sm={6} xs={12}>
                                    <div className="form-group m0" id="rs_AgencyDetails_country">
                                        <RSKendoDropDownList
                                            control={control}
                                            name={'country'}
                                            defaultValue={country}
                                            // data={_get(masterData, 'countryMasterList')}
                                            data={countryMasterList.sort((a, b) =>
                                                a.country.toLowerCase() > b.country.toLowerCase() ? 1 : -1,
                                            )}
                                            textField="country"
                                            required
                                            dataItemKey={'countryID'}
                                            label={'Country'}
                                            rules={{
                                                required: SELECT_COUNTRY,
                                            }}
                                            handleChange={() => {
                                                setValue('state', null);
                                                clearErrors('state');
                                            }}
                                        />
                                    </div>
                                </Col>
                                <Col sm={6} xs={12}>
                                    <div className="form-group m0" id="rs_AgencyDetails_state">
                                        <RSKendoDropDownList
                                            control={control}
                                            name={'state'}
                                            data={filteredStateList}
                                            textField="state"
                                            dataItemKey={'stateID'}
                                            label={'State'}
                                            disabled={!selectedCountry || filteredStateList.length === 0}
                                        />
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </div>
                <div className="buttons-holder">
                    <RSSecondaryButton onClick={() => back('KEY_INFO')} id="rs_AgencyDetails_Back">
                        Back
                    </RSSecondaryButton>
                    <RSPrimaryButton
                        type="submit"
                        className={`ml15 ${isFormValid ? 'click-off' : ''}`}
                        id="rs_AgencyDetails_Next"
                    >
                        Next
                    </RSPrimaryButton>
                </div>
            </form>
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
                    header="Edit agency logo"
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

export default AgencyDetails;
