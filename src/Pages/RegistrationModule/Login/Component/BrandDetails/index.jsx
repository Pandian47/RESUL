import { MAX_LENGTH10, MAX_LENGTH150, MAX_LENGTH255, MAX_LENGTH50, MIN_LENGTH } from 'Constants/GlobalConstant/Regex';
import { ENTER_ADDRESS, ENTER_COMPANY as ENTER_COMPANY_MSG, ENTER_PARENT_COMPANY, MINLENGTH, SELECT_BUSINESS_POSITION, SELECT_BUSINESS_TYPE, SELECT_COMPANY_BRAND, SELECT_COUNTRY, SELECT_INDUSTRY, SELECT_REGION, UPLOAD_COMPANY_IMAGE } from 'Constants/GlobalConstant/ValidationMessage';
import { CITY_RULE, WEBSITE_RULES_SECURE, ZIP_RULES } from 'Constants/GlobalConstant/Rules';
import { ADDRESS, ALLOWED_FORMATS, CITY, ENTER_COMPANY, FILE_NAME_EXTENSIONS_JPG_PNG_JPEG_1, FILE_SIZE500KB, PARENT_COMPANY, WEBSITE, ZIP } from 'Constants/GlobalConstant/Placeholders';
import { circle_minus_fill_medium, circle_pencil_medium, circle_plus_fill_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { find as _find, get as _get, isEqual as _isEqual, sortBy as _sortBy } from 'Utils/modules/lodashReplacements';
import { useForm } from 'react-hook-form';
import { Row, Col } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useImageUpload } from 'Hooks/useImageUpload';

import RSInput from 'Components/FormFields/RSInput';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import RSConfirmationModal from 'Components/ConfirmationModal/index.jsx';
import RSModal from 'Components/RSModal';
import ImageCropModal from 'Components/ImageCropModal';
import RSTooltip from 'Components/RSTooltip';
import { Building } from 'Assets/Images';
import { brandCompanystatus } from 'Constants/GlobalConstant';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import {
    checkClientNameExists,
    getKeyContactEmail,
    validateWebsite,
    getCountryCoordinatesByRegion,
    parseCountriesByRegionResponse,
} from 'Reducers/login/newUser/request';
import ParentCompanyAssociationModal from './Component/ParentCompanyAssociationModal';

import { updateUserFormState } from 'Reducers/login/newUser/reducer';
import { getUserDetails } from 'Utils/modules/crypto';
import { charNum } from 'Utils/modules/inputValidators';
import { getmasterData } from 'Utils/modules/masterData';
import { findDuplicateValues } from 'Utils/modules/dateTime';
import useApiLoader, { LOADER_TYPE, createAbortAwareFetcher } from 'Hooks/useApiLoader';

const ACCOUNT_SETUP_FIELD_LOADER = {
    create: LOADER_TYPE.FIELD,
    edit: LOADER_TYPE.FIELD,
};

const BrandDetails = ({ back, nextScreen }) => {
    const [show, setShow] = useState(false);
    const [keyContactData, setKeyContactData] = useState(null);
    const [associationModalShow, setAssociationModalShow] = useState(false);
    const [pendingAccountType, setPendingAccountType] = useState(null);
    const [isParentCompanyAssociated, setIsParentCompanyAssociated] = useState(false);
    const previousAccountTypeRef = useRef(null);
    const [loading, setLoading] = useState({
        parentCompany: {
            loading: false,
            isValid: false,
            value: null,
        },
        brandCompany: {
            loading: false,
            isValid: false,
            value: null,
        },
        brandWebsite: {
            loading: false,
            isValid: false,
            value: null,
        },
    });
    const dispatch = useDispatch();
    const countryByRegionLoader = useApiLoader({
        autoFetch: false,
        loaderConfig: ACCOUNT_SETUP_FIELD_LOADER,
        mode: 'create',
    });
    const masterData = getmasterData();
    const { countryMasterList = [], industryList = [], businessTypeList, stateList = [] } = getmasterData();
    const [brandPosition, setBrandPosition] = useState([]);
    const sortCountries = (countries) =>
        [...countries].sort((a, b) =>
            (a.country || '').toLowerCase() > (b.country || '').toLowerCase() ? 1 : -1,
        );
    const [countryList, setCountryList] = useState(sortCountries(countryMasterList));
    const applyCountryListFromRegionResponse = (res) => {
        if (res?.status && res?.data) {
            const countries = parseCountriesByRegionResponse(res.data);
            setCountryList(sortCountries(countries));
        }
    };
    const fetchCountryListByRegion = useCallback(
        (regionIds) => {
            if (!regionIds?.length) {
                setCountryList(sortCountries(countryMasterList));
                return;
            }

            countryByRegionLoader.refetch({
                fetcher: createAbortAwareFetcher(dispatch, getCountryCoordinatesByRegion, { loading: false }),
                params: { regionId: regionIds },
                loaderConfig: ACCOUNT_SETUP_FIELD_LOADER,
                mode: 'create',
                onSuccess: applyCountryListFromRegionResponse,
            });
        },
        [countryByRegionLoader, countryMasterList, dispatch],
    );

    const {
        handleSubmit,
        resetField,
        control,
        setError,
        clearErrors,
        getValues,
        setValue,
        watch,
        reset,
        unregister,
        formState: { errors, isValid },
    } = useForm({
        mode: 'onTouched',
        defaultValues: {
            brandCompanyStatus: brandCompanystatus?.[0],
            // brandWebsite: 'https://'
        },
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
    } = useImageUpload(setValue, setError, clearErrors, 'brandProfile');

    const {
        brandProfile,
        parentCompany,
        preferredRegions,
        defaultRegions,
        brandCompany,
        brandCompanyStatus,
        brandWebsite,
        brandAddress,
        brandCity,
        brandZipcode,
        country,
        brandRegion,
        brandIndustry,
        businessType,
        BrandPosition,
        licenseTypeId,
        inputState,
        isBack,
        isHybrid,
        state: brandFormState,
        isNotify: isNotifyFromStore,
    } = useSelector(({ newUserReducer }) => newUserReducer);
    // const { isAgency } = useSelector(({ loginReducer }) => loginReducer);
    const { isAgency } = getUserDetails() || {};
    const paranetCompanyHasError = Object.hasOwn(errors, 'parentCompany');
    const brandCompanyHasError = Object.hasOwn(errors, 'brandCompany');
    const brandWebsiteHasError = Object.hasOwn(errors, 'brandWebsite');
    // console.log('errors: ', errors);
    const selectedBusinessType = watch('businessType');
    const parentCompanyValue = watch('parentCompany');
    const brandCom = watch('BrandPosition');
    const selectedCountry = watch('country');
    const filteredStateList = useMemo(() => {
        if (!selectedCountry || !stateList.length) return [];
        const selectedCountryID = selectedCountry?.countryID || selectedCountry;
        return stateList
            .filter((state) => state.countryID === selectedCountryID)
            .sort((a, b) => a.state.toLowerCase() > b.state.toLowerCase() ? 1 : -1);
    }, [selectedCountry, stateList]);
    const [companyRegionList, setCompanyRegionList] = useState(null);

    const filteredBrandCompanyStatus = useMemo(() => {
        if (!keyContactData || !keyContactData.clientBranchTypeID) return brandCompanystatus;
        
        const parentBranchType = keyContactData.clientBranchTypeID;
        if (parentBranchType === 1) {
            return brandCompanystatus.filter(status => status.titleId === 2 || status.titleId === 3);
        } else if (parentBranchType === 2) {
            return brandCompanystatus.filter(status => status.titleId === 3);
        }
        return brandCompanystatus;
    }, [keyContactData]);
    let isFormValid = !isValid;
    isFormValid =
        selectedBusinessType?.businessTypeID === 3 && brandCom?.brandPositionID === undefined
            ? false
            : selectedBusinessType?.businessTypeID !== 3 && brandCom?.brandPositionID === undefined
            ? true
            : false;
    // console.log('isFormValid: ', isFormValid);
    // console.log('isValid: ', isValid);

    // console.log('brandCom: ', brandCom?.brandPositionID);
    //  ||
    // (!loading.parentCompany.isValid && licenseTypeId === 3) ||
    // !loading.brandCompany.isValid ||
    // !loading.brandWebsite.isValid;

    const getBrandFormValues = useCallback(
        () => ({
            brandProfile,
            parentCompany,
            preferredRegions: preferredRegions || [],
            defaultRegions,
            brandCompany,
            brandCompanyStatus: brandCompanyStatus || brandCompanystatus?.[0],
            brandWebsite: brandWebsite || 'https://',
            brandAddress,
            brandCity,
            brandZipcode,
            country,
            state: brandFormState,
            brandRegion,
            brandIndustry,
            businessType,
            BrandPosition,
            isHybrid,
        }),
        [
            brandProfile,
            parentCompany,
            preferredRegions,
            defaultRegions,
            brandCompany,
            brandCompanyStatus,
            brandWebsite,
            brandAddress,
            brandCity,
            brandZipcode,
            country,
            brandFormState,
            brandRegion,
            brandIndustry,
            businessType,
            BrandPosition,
            isHybrid,
        ],
    );

    useEffect(() => {
        if (inputState) setLoading(inputState);
    }, []);

    useEffect(() => {
        previousAccountTypeRef.current =
            brandCompanyStatus?.titleId ?? brandCompanystatus?.[0]?.titleId;
    }, []);

    useEffect(() => {
        if (isBack) {
            const businessTypeId = businessType?.businessTypeID;
            if (businessTypeId) {
                const positionList = _get(masterData, 'brandPositionList', []).filter(
                    (position) => position.clientType === businessTypeId,
                );
                setBrandPosition(positionList);
            }
            if (inputState) setLoading(inputState);
            reset(getBrandFormValues());
        }
    }, [isBack]);

    useEffect(() => {
        if (selectedBusinessType !== undefined) {
            const positionList = _get(masterData, 'brandPositionList', []).filter(
                (position) => position.clientType === selectedBusinessType?.businessTypeID,
            );
            setBrandPosition(positionList);
            
            unregister('BrandPosition');
            clearErrors('BrandPosition');
            
            if (positionList?.length === 0) {
                setValue('BrandPosition', null);
            }
        }
    }, [selectedBusinessType]);

    const handleParentCompanyValidation = async (value, err) => {
        if (value?.length > 0 && !err && value !== loading.parentCompany.value) {
            setLoading((prev) => ({
                ...prev,
                parentCompany: {
                    isValid: false,
                    loading: true,
                    value,
                },
            }));
            setKeyContactData(null);
            setIsParentCompanyAssociated(false);
            dispatch(updateUserFormState({ isNotify: false }));

            const checkResult =
                (await dispatch(
                    checkClientNameExists({
                        payload: { clientName: value },
                        setError: () => {},
                        name: 'parentCompany',
                        clearErrors: () => {},
                    }),
                )) ?? {};

            if (checkResult.status) {
                const keyContactResult =
                    (await dispatch(getKeyContactEmail({ payload: { clientName: value } }))) ?? {};

                let errorMessage = 'client name already exists';
                if (keyContactResult.status) {
                    const branchType = keyContactResult.clientBranchTypeID;
                    if (branchType === 0) errorMessage = 'clientname already exists  in Agency';
                    else if (branchType === 1) errorMessage = 'clientname already exists  in GHQ';
                    else if (branchType === 2) errorMessage = 'clientname already exists in RHQ';
                }

                setError('parentCompany', {
                    type: 'server',
                    message: errorMessage,
                });

                if (keyContactResult.status) {
                    setKeyContactData({
                        ...keyContactResult,
                        parentClientName: value,
                    });
                    
                    const parentBranchType = keyContactResult.clientBranchTypeID;
                    const currentStatus = getValues('brandCompanyStatus');
                    if (parentBranchType === 1 && currentStatus?.titleId === 1) {
                        setValue('brandCompanyStatus', brandCompanystatus.find(status => status.titleId === 2));
                    } else if (parentBranchType === 2 && (currentStatus?.titleId === 1 || currentStatus?.titleId === 2)) {
                        setValue('brandCompanyStatus', brandCompanystatus.find(status => status.titleId === 3));
                    }

                    setAssociationModalShow(true);
                }

                setLoading((prev) => ({
                    ...prev,
                    parentCompany: {
                        ...prev.parentCompany,
                        loading: false,
                        isValid: false,
                    },
                }));
            } else {
                clearErrors('parentCompany');
                setLoading((prev) => ({
                    ...prev,
                    parentCompany: {
                        ...prev.parentCompany,
                        loading: false,
                        isValid: true,
                    },
                }));
            }
        } else if (err) {
            setKeyContactData(null);
            setIsParentCompanyAssociated(false);
            dispatch(updateUserFormState({ isNotify: false }));
            setLoading((prev) => ({
                ...prev,
                parentCompany: {
                    value: null,
                    loading: false,
                    isValid: false,
                },
            }));
        } else if (!err && value === loading.parentCompany.value) {
            setLoading((prev) => ({
                ...prev,
                parentCompany: {
                    ...prev.parentCompany,
                    loading: false,
                    isValid: false,
                },
            }));
        }
        setTimeout(() => {
            setLoading((prev) => ({
                ...prev,
                parentCompany: {
                    ...prev.parentCompany,
                    isValid: false,
                },
            }));
        }, 5000);
    };

    const handleAccountTypeChange = (selectedValue) => {
        const newTitleId = selectedValue?.titleId;
        const prevTitleId = previousAccountTypeRef.current;

        if (
            prevTitleId !== newTitleId &&
            (newTitleId === 2 || newTitleId === 3) &&
            keyContactData
        ) {
            setPendingAccountType(selectedValue);
            setValue(
                'brandCompanyStatus',
                _find(brandCompanystatus, ['titleId', prevTitleId]) || brandCompanystatus[0],
            );
            // setAssociationModalShow(true);
            return;
        }

        previousAccountTypeRef.current = newTitleId;
    };

    const handleAssociationSuccess = (contactData) => {
        if (pendingAccountType) {
            setValue('brandCompanyStatus', pendingAccountType);
            previousAccountTypeRef.current = pendingAccountType.titleId;
        }
        setIsParentCompanyAssociated(true);
        clearErrors('parentCompany');
        const resolvedParentClientId =
            Number(contactData?.parentClientId) > 0
                ? Number(contactData.parentClientId)
                : Number(contactData?.clientId) || 0;
        dispatch(
            updateUserFormState({
                isNotify: true,
                parentClientId: resolvedParentClientId,
                apiClientId: contactData?.clientId,
                companiesList: {
                    clientName:
                        contactData?.parentClientName ||
                        contactData?.parentclientName ||
                        getValues('parentCompany'),
                    clientId: resolvedParentClientId,
                },
            }),
        );
        setPendingAccountType(null);
        setAssociationModalShow(false);
    };

    const handleAssociationClose = () => {
        setPendingAccountType(null);
        setAssociationModalShow(false);
        dispatch(updateUserFormState({ isNotify: false }));
    };

    const handleInputValidation = async (value, err, name, type) => {
        if (value?.length > 0 && !err && value !== loading[name].value) {
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
                if (brandWebsiteHasError) {
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
                    clearErrors,
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
        } else if (err) {
            setLoading((prev) => ({
                ...prev,
                [name]: {
                    value: null,
                    loading: false,
                    isValid: false,
                },
            }));
        } else if (!err && value === loading[name].value) {
            setLoading((prev) => ({
                ...prev,
                [name]: {
                    ...prev[name],
                    loading: false,
                    isValid: false,
                },
            }));
        }
        setTimeout(function () {
            setLoading((prev) => ({
                ...prev,
                [name]: {
                    ...prev[name],
                    isValid: false,
                },
            }));
        }, 5000);
    };

    const allowedRegions = ['APAC', 'North America', 'LATAM', 'Europe', 'Middle East and Africa', 'Asia-Pacific'];
    const regionList = _get(masterData, 'regionList', []);
    const hasMiddleEastAndAfrica = regionList.some((r) => r.regionName?.trim() === 'Middle East and Africa');
    const regions = regionList
        .filter((r) => {
            const name = r.regionName?.trim();
            if (name === 'Middle East' && hasMiddleEastAndAfrica) return false;
            return allowedRegions.includes(name) || name === 'Middle East';
        })
        .map((r) =>
            r.regionName?.trim() === 'Middle East' ? { ...r, regionName: 'Middle East and Africa' } : r,
        );
    const selectedRegions = watch('preferredRegions');
    const entityRegionOptions = useMemo(
        () => _sortBy((selectedRegions || []).filter((region) => region?.regionID), 'regionName'),
        [selectedRegions],
    );
    const clearCountryAndState = () => {
        setValue('country', null);
        setValue('state', null);
        clearErrors('country');
        clearErrors('state');
    };
    const clearRegionCountryAndState = () => {
        setValue('brandRegion', null);
        clearCountryAndState();
        clearErrors('brandRegion');
    };
    const syncBrandRegionFromOperational = (operationalRegions = []) => {
        const sortedRegions = _sortBy(
            (operationalRegions || []).filter((region) => region?.regionID),
            'regionName',
        );

        if (sortedRegions.length === 1) {
            setValue('brandRegion', sortedRegions[0], { shouldValidate: true, shouldDirty: true });
            clearErrors('brandRegion');
            clearCountryAndState();
            return sortedRegions[0];
        }

        const currentBrandRegion = getValues('brandRegion');
        const isCurrentValid = sortedRegions.some(
            (region) => region?.regionID === currentBrandRegion?.regionID,
        );

        if (!sortedRegions.length || !isCurrentValid) {
            clearRegionCountryAndState();
        }

        return null;
    };
    const [preferredRegionss] = watch(['preferredRegions']);
    useEffect(() => {
        if (licenseTypeId !== 3) return;

        const operationalRegions = preferredRegionss || [];
        const autoSelectedRegion = syncBrandRegionFromOperational(operationalRegions);
        const regionIds = operationalRegions.map((region) => region.regionID).filter((id) => id);
        const countryRegionIds = autoSelectedRegion?.regionID ? [autoSelectedRegion.regionID] : regionIds;

        if (countryRegionIds.length > 0) {
            fetchCountryListByRegion(countryRegionIds);
        } else if (!operationalRegions.length) {
            setCountryList(sortCountries(countryMasterList));
        }
    }, [preferredRegionss, licenseTypeId]);

    useEffect(() => {
        if (preferredRegionss?.length > 0) {
            let val = [...preferredRegionss];
            if (val?.length) {
                let duplicateEntries = val.filter((item, index, array) =>
                    array
                        ?.slice(index + 1)
                        .some((otherItem) => otherItem.regionName.toLowerCase() === item.regionName.toLowerCase()),
                );
                let maxVal = [...val].pop();
                // debugger;
                if (duplicateEntries?.length || maxVal?.regionName?.length > 25) {
                    val.pop();
                    setValue('preferredRegions', val);
                }
            }
        }
    }, [preferredRegionss]);

    // console.log(selectedRegions, 'selectedRegions');



    const BrandImageUploadButton = ({ value, onClick, onRemove, onEdit, error }) => {
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
                        <img src={imageSrc} alt="company logo" />
                    </figure>
                    <div className={`picture-choose-file ${value ? 'valid-image' : ''}`}>
                        <span className="info">
                            <RSTooltip
                                text={value ? 'Update company logo' : 'Upload company logo'}
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
                                                    text="Remove company logo"
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
                            <span className="pcf-label">Edit company logo</span>
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
                    if (!data.brandProfile) {
                        setError('brandProfile', {
                            type: 'manual',
                            message: UPLOAD_COMPANY_IMAGE,
                        });
                        return;
                    }
                    if (
                        licenseTypeId === 3 &&
                        findDuplicateValues(selectedRegions?.map((e) => e.regionName.toLowerCase()))?.length > 0
                    ) {
                        setError(`preferredRegions`, {
                            type: 'custom',
                            message: 'Duplicate entries',
                        });
                        return;
                    }
                    // Clear BrandPosition error if brandPosition list is empty (field is not required)
                    if (brandPosition?.length === 0) {
                        clearErrors('BrandPosition');
                    }
                    dispatch(
                        updateUserFormState({
                            ...data,
                            inputState: loading,
                            isNotify: isNotifyFromStore === true,
                            ...(isParentCompanyAssociated &&
                                keyContactData && {
                                    parentClientId:
                                        Number(keyContactData.parentClientId) > 0
                                            ? Number(keyContactData.parentClientId)
                                            : Number(keyContactData.clientId) || 0,
                                    apiClientId: keyContactData.clientId,
                                    companiesList: {
                                        clientName:
                                            keyContactData.parentClientName ||
                                            keyContactData.parentclientName ||
                                            data.parentCompany,
                                        clientId:
                                            Number(keyContactData.parentClientId) > 0
                                                ? Number(keyContactData.parentClientId)
                                                : Number(keyContactData.clientId) || 0,
                                    },
                                }),
                        }),
                    );
                    nextScreen('LOCALIZATION_SETTINGS');
                })}
            >
                <div className="box-design rs-box rs-box-min-height py40">
                    <Row>
                        <Col md={3} sm={4} className="accountsetup-image-upload">
                            <BrandImageUploadButton
                                value={watch('brandProfile')}
                                onClick={triggerUpload}
                                onEdit={() => openCropWithExistingImage(watch('brandProfile'))}
                                onRemove={() => {
                                    setValue('brandProfile', null);
                                    setError('brandProfile', {
                                        type: 'manual',
                                        message: UPLOAD_COMPANY_IMAGE,
                                    });
                                }}
                                error={errors?.brandProfile?.message}
                            />
                        </Col>
                        <Col
                            md={9}
                            sm={8}
                            className="box-left-border d-flex align-items-center accountsetup-contact-info"
                        >
                            <Row>
                                {licenseTypeId === 3 && (
                                    <Row className="m0">
                                        <Col sm={6} xs={12} className="pl0">
                                            <div className="form-group">
                                                <RSInput
                                                    name={'parentCompany'}
                                                    defaultValue={parentCompany}
                                                    placeholder={PARENT_COMPANY}
                                                    control={control}
                                                    //  onKeyDown={charNumUnderScore}
                                                    isValidIcon={loading.parentCompany.isValid}
                                                    required
                                                    isLoading={loading.parentCompany.loading}
                                                    minLength={MIN_LENGTH}
                                                    maxLength={MAX_LENGTH255}
                                                    rules={{
                                                        minLength: {
                                                            value: MIN_LENGTH,
                                                            message: MINLENGTH,
                                                        },

                                                        required: ENTER_PARENT_COMPANY,
                                                        validate: {
                                                            serverError: () => {
                                                                return paranetCompanyHasError
                                                                    ? _get(errors, 'parentCompany.message')
                                                                    : true;
                                                            },
                                                            // matchCompany: (value) => {
                                                            //     const brandCom = getValues('brandCompany') || '';
                                                            //     if (brandCom !== '') {
                                                            //         return value?.trim()?.toLowerCase() ===
                                                            //             brandCom?.trim()?.toLowerCase()
                                                            //             ? error.CLIENTNAME_SHOULD_NOT_MATCH
                                                            //             : true;
                                                            //     }
                                                            // },
                                                        },
                                                    }}
                                                    handleOnchange={(e) => {
                                                        const value = e.target.value;
                                                        if (paranetCompanyHasError) clearErrors('parentCompany');
                                                        setKeyContactData(null);
                                                        setIsParentCompanyAssociated(false);
                                                        dispatch(updateUserFormState({ isNotify: false }));
                                                        if (loading.parentCompany.isValid)
                                                            setLoading((prev) => ({
                                                                ...prev,
                                                                parentCompany: {
                                                                    ...prev['parentCompany'],
                                                                    isValid: false,
                                                                },
                                                            }));
                                                        const brandCom = getValues('brandCompany') || '';
                                                        if (value.toLowerCase() !== brandCom.toLowerCase()) {
                                                            clearErrors(['parentCompany', 'brandCompany']);
                                                        }
                                                    }}
                                                    handleOnBlur={({ target: { value } }) => {
                                                        if (value?.length >= 3)
                                                            handleParentCompanyValidation(
                                                                value,
                                                                paranetCompanyHasError,
                                                            );
                                                    }}
                                                />
                                            </div>
                                        </Col>
                                        <Col sm={6} xs={12} className="pr0">
                                            <div className="form-group">
                                                <RSMultiSelect
                                                    control={control}
                                                    defaultValue={preferredRegions}
                                                    placeholder={'Operational regions'}
                                                    allowCustom
                                                    // value={regionsValue}
                                                    textField="regionName"
                                                    dataItemKey="regionID"
                                                    name={'preferredRegions'}
                                                    required
                                                    // data={regions}
                                                    rules={{
                                                        required: 'Select operational region',
                                                    }}
                                                    data={regions?.sort((a, b) =>
                                                        a.regionName.localeCompare(b.regionName),
                                                    )}
                                                    handleChange={(e) => {
                                                        let values = e?.target?.value ?? e?.value ?? [];
                                                        const selectedRegionsSorted = _sortBy(values, 'regionName');
                                                        const defaultRegions = _sortBy(regions, 'regionName');
                                                        const filteredRegions = selectedRegionsSorted?.filter((region) =>
                                                            defaultRegions?.some(
                                                                (defaultRegion) =>
                                                                    defaultRegion?.regionID === region?.regionID,
                                                            ),
                                                        );
                                                        const isDefaultRegionSelected = _isEqual(
                                                            filteredRegions,
                                                            defaultRegions,
                                                        );
                                                        setValue('defaultRegions', isDefaultRegionSelected);
                                                        const lastItem = values[values?.length - 1];
                                                        if (lastItem && lastItem?.regionID === undefined) {
                                                            values.pop();
                                                            const sameItem = values.find(
                                                                (v) => v.regionName === lastItem.regionName,
                                                            );
                                                            if (sameItem === undefined) {
                                                                lastItem.regionID = new Date().getTime();
                                                                values.push(lastItem);
                                                            }
                                                            setValue('preferredRegions', values);
                                                        }
                                                        // setCompanyRegionList(e.target.value);
                                                        // setCompanyRegionList((prev) => {
                                                        //     if (prev !== null) {
                                                        //         if (prev?.length !== e.target.value) {
                                                        //             setValue('brandRegion', {});
                                                        //             resetField('brandRegion');
                                                        //         }
                                                        //     }
                                                        // });
                                                        // const isCustom = (item) => {
                                                        //     return item.regionID === undefined;
                                                        // };
                                                        // const addKey = (item) => {
                                                        //     item.regionID = new Date().getTime();
                                                        // };
                                                        // const values = e.target.value;
                                                        // const lastItem = values[values?.length - 1];
                                                        // if (lastItem && isCustom(lastItem)) {
                                                        //     values.pop();
                                                        //     const sameItem = values.find(
                                                        //         (v) => v.regionName === lastItem.regionName,
                                                        //     );
                                                        //     if (sameItem === undefined) {
                                                        //         addKey(lastItem);
                                                        //         values.push(lastItem);
                                                        //     }
                                                        // }
                                                    }}
                                                />
                                                <span className="">
                                                    <RSCheckbox
                                                        className="smaller"
                                                        name={'defaultRegions'}
                                                        control={control}
                                                        defaultValue={defaultRegions}
                                                        labelName={'Select all regions where you operate'}
                                                        handleChange={({ target: { checked } }) => {
                                                            if (checked) {
                                                                setValue('preferredRegions', regions);
                                                                setValue('defaultRegions', true);
                                                                clearErrors('preferredRegions');
                                                            } else {
                                                                setValue('preferredRegions', []);
                                                                setValue('defaultRegions', false);
                                                                clearRegionCountryAndState();
                                                                setCountryList(sortCountries(countryMasterList));
                                                            }
                                                        }}
                                                    />
                                                </span>
                                            </div>
                                        </Col>
                                    </Row>
                                )}
                                <Col sm={6} xs={12}>
                                    <div className="form-group">
                                        <Row>
                                            <Col md={licenseTypeId === 3 ? 8 : 12}>
                                                <RSInput
                                                    name={'brandCompany'}
                                                    defaultValue={brandCompany}
                                                    placeholder={ENTER_COMPANY}
                                                    control={control}
                                                    //  onKeyDown={charNumUnderScore}
                                                    isValidIcon={loading.brandCompany.isValid}
                                                    isLoading={loading.brandCompany.loading}
                                                    minLength={MIN_LENGTH}
                                                    maxLength={MAX_LENGTH255}
                                                    required
                                                    rules={{
                                                        minLength: {
                                                            value: MIN_LENGTH,
                                                            message: MINLENGTH,
                                                        },
                                                        required: ENTER_COMPANY_MSG,
                                                        validate: {
                                                            brandCompError: () =>
                                                                brandCompanyHasError
                                                                    ? _get(errors, 'brandCompany.message')
                                                                    : true,
                                                            // matchCompany: (value) => {
                                                            //     if (licenseTypeId === 3) {
                                                            //         const brandCom = getValues('parentCompany');
                                                            //         return value?.trim()?.toLowerCase() ===
                                                            //             brandCom?.trim()?.toLowerCase() || ''
                                                            //             ? error.CLIENTNAME_SHOULD_NOT_MATCH
                                                            //             : true;
                                                            //     }
                                                            // },
                                                        },
                                                    }}
                                                    handleOnchange={(e) => {
                                                        const value = e.target.value;
                                                        if (brandCompanyHasError) clearErrors('brandCompany');
                                                        if (loading.brandCompany.isValid)
                                                            setLoading((prev) => ({
                                                                ...prev,
                                                                brandCompany: {
                                                                    ...prev['brandCompany'],
                                                                    isValid: false,
                                                                },
                                                            }));
                                                        const parentCom = getValues('parentCompany') || '';
                                                        if (value.toLowerCase() !== parentCom.toLowerCase()) {
                                                            clearErrors(['parentCompany', 'brandCompany']);
                                                        }
                                                    }}
                                                    handleOnBlur={({ target: { value } }) => {
                                                        // console.log(brandCompanyHasError, 'asdsf');
                                                        if (
                                                            getValues('parentCompany') !== value &&
                                                            value?.length >= 3
                                                        ) {
                                                            handleInputValidation(
                                                                value,
                                                                brandCompanyHasError,
                                                                'brandCompany',
                                                                'company',
                                                            );
                                                        }
                                                    }}
                                                />
                                            </Col>
                                            {licenseTypeId === 3 && (
                                                <Col md={4}>
                                                    <RSKendoDropDownList
                                                        name={'brandCompanyStatus'}
                                                        data={filteredBrandCompanyStatus}
                                                        // defaultValue={brandCompanyStatus}
                                                        control={control}
                                                        required
                                                        textField={'title'}
                                                        dataItemKey={'titleId'}
                                                        // label={placeholder.HEAD_QUATERS}
                                                        rules={{
                                                            required: SELECT_COMPANY_BRAND,
                                                        }}
                                                        handleChange={(e) => {
                                                            handleAccountTypeChange(e?.value);
                                                        }}
                                                    />
                                                </Col>
                                            )}
                                        </Row>
                                    </div>
                                </Col>
                                <Col sm={6} xs={12}>
                                    <div className="form-group">
                                        <RSInput
                                            control={control}
                                            defaultValue={brandWebsite || 'https://'}
                                            isLoading={loading.brandWebsite.loading}
                                            name={'brandWebsite'}
                                            isValidIcon={loading.brandWebsite.isValid}
                                            placeholder={WEBSITE}
                                            maxLength={MAX_LENGTH150}
                                            required
                                            rules={{
                                                ...WEBSITE_RULES_SECURE,
                                                validate: () =>
                                                    brandWebsiteHasError ? _get(errors, 'brandWebsite.message') : true,
                                            }}
                                            onKeyDown={(e) => {
                                                const protocol = 'https://';
                                                const { selectionStart, selectionEnd, value } = e.target;
                                                if (selectionStart < protocol.length) {
                                                    e.preventDefault();
                                                    return;
                                                  }
                                                  if (selectionStart === protocol.length && 
                                                      selectionEnd === protocol.length && 
                                                      e.key === 'Backspace') {
                                                    e.preventDefault();
                                                  }
                                              
                                            }}
                                            handleOnPaste={(e) => {
                                                e.preventDefault();
                                                const protocol = 'https://';
                                                const pastedText = e.clipboardData.getData('text/plain').trim();
                                                const { value, selectionStart, selectionEnd } = e.target;
                                                const cleanPastedText = pastedText.replace(/^https?:\/\//, '');

                                                let newValue =
                                                    value.substring(0, selectionStart) +
                                                    cleanPastedText +
                                                    value.substring(selectionEnd);

                                                if (!newValue.startsWith(protocol)) {
                                                    const hadProtocol = value.startsWith(protocol);
                                                    newValue =
                                                        (hadProtocol ? protocol : '') +
                                                        newValue.replace(/^https?:\/\//, '');
                                                }
                                                setValue('brandWebsite', newValue);
                                            }}
                                            handleOnchange={() => {
                                                if (brandWebsiteHasError) clearErrors('brandWebsite');
                                                if (loading.brandWebsite.isValid)
                                                    setLoading((prev) => ({
                                                        ...prev,
                                                        brandWebsite: {
                                                            ...prev['brandWebsite'],
                                                            isValid: false,
                                                        },
                                                    }));
                                            }}
                                            handleOnBlur={({ target: { value } }) => {
                                                if (!value?.startsWith('https://')) {
                                                    setError(`brandWebsite`, {
                                                        type: 'custom',
                                                        message: 'Enter a valid URL',
                                                    });
                                                    return;
                                                } else {
                                                    handleInputValidation(
                                                        value,
                                                        brandWebsiteHasError,
                                                        'brandWebsite',
                                                        'website',
                                                    );
                                                }
                                            }}
                                        />
                                    </div>
                                </Col>
                                <Col sm={6} xs={12}>
                                    <div className="form-group">
                                        <RSInput
                                            control={control}
                                            defaultValue={brandAddress}
                                            name={'brandAddress'}
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
                                        <Row>
                                            <Col sm={6} xs={12}>
                                                <RSInput
                                                    control={control}
                                                    defaultValue={brandCity}
                                                    name={'brandCity'}
                                                    required
                                                    // onKeyDown={onKeyChar}
                                                    rules={CITY_RULE}
                                                    maxLength={MAX_LENGTH50}
                                                    placeholder={CITY}
                                                />
                                            </Col>
                                            <Col sm={6} xs={12}>
                                                <RSInput
                                                    control={control}
                                                    defaultValue={brandZipcode}
                                                    type="text"
                                                    name={'brandZipcode'}
                                                    required
                                                    onKeyDown={charNum}
                                                    maxLength={MAX_LENGTH10}
                                                    rules={ZIP_RULES}
                                                    placeholder={ZIP}
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                </Col>
                                   {licenseTypeId === 3 && (
                                    <Col sm={6} xs={12}>
                                        <div className="form-group">
                                            <RSKendoDropDownList
                                                control={control}
                                                name={'brandRegion'}
                                                defaultValue={brandRegion}
                                                data={entityRegionOptions}
                                                textField="regionName"
                                                required={entityRegionOptions.length > 0}
                                                dataItemKey={'regionID'}
                                                label={'Region'}
                                                disabled={entityRegionOptions.length === 0}
                                                rules={{
                                                    required:
                                                        entityRegionOptions.length > 0
                                                            ? SELECT_REGION
                                                            : false,
                                                }}
                                                handleChange={(e) => {
                                                    clearErrors('brandRegion');
                                                    const val = e?.value !== undefined ? e.value : e?.target?.value;
                                                    const rId = val?.regionID !== undefined ? val.regionID : val;
                                                    if (rId) {
                                                        fetchCountryListByRegion([rId]);
                                                    } else {
                                                        const preferredRegionIds =
                                                            getValues('preferredRegions')
                                                                ?.map((v) => v.regionID)
                                                                .filter((id) => id) || [];
                                                        if (preferredRegionIds.length > 0) {
                                                            fetchCountryListByRegion(preferredRegionIds);
                                                        } else {
                                                            setCountryList(sortCountries(countryMasterList));
                                                        }
                                                    }
                                                    clearCountryAndState();
                                                }}
                                            />
                                        </div>
                                    </Col>
                                )}
                                <Col sm={6} xs={12}>
                                    <div className="form-group">
                                        <RSKendoDropDownList
                                            control={control}
                                            name={'country'}
                                            defaultValue={country}
                                            // data={_get(masterData, 'countryMasterList', [])}
                                            data={countryList}
                                            textField="country"
                                            required
                                            dataItemKey={'countryID'}
                                            label={'Country'}
                                            isLoading={countryByRegionLoader.isLoading}
                                            rules={{
                                                required: SELECT_COUNTRY,
                                            }}
                                            handleChange={() => {
                                                setValue('state', null);
                                            }}
                                        />
                                    </div>
                                </Col>
                                <Col sm={6} xs={12}>
                                    <div className="form-group">
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
                             
                                <Col sm={6} xs={12}>
                                    <div className= {`form-group ${licenseTypeId === 3 ? 'mb0': ''}`}>
                                        <RSKendoDropDownList
                                            control={control}
                                            name={'brandIndustry'}
                                            defaultValue={brandIndustry}
                                            // data={_get(masterData, 'industryList', [])}
                                            data={industryList.sort((a, b) =>
                                                a.industryName.toLowerCase() > b.industryName.toLowerCase() ? 1 : -1,
                                            )}
                                            textField="industryName"
                                            required
                                            dataItemKey={'industryID'}
                                            label={'Industry type'}
                                            rules={{
                                                required: SELECT_INDUSTRY,
                                            }}
                                        />
                                    </div>
                                </Col>
                                <Col sm={licenseTypeId === 3 ? 12 : 12} xs={12}>
                                    <div className="form-group m0">
                                        <Row>
                                            <Col sm={6} xs={12}>
                                                <RSKendoDropDownList
                                                    control={control}
                                                    name={'businessType'}
                                                    defaultValue={businessType}
                                                    // data={_get(masterData, 'businessTypeList')}
                                                    data={businessTypeList.sort((a, b) =>
                                                        a.businessType.toLowerCase() > b.businessType.toLowerCase()
                                                            ? 1
                                                            : -1,
                                                    )}
                                                    textField="businessType"
                                                    required
                                                    dataItemKey={'businessTypeID'}
                                                    label={'Business type'}
                                                    handleChange={() => {
                                                        resetField('BrandPosition');
                                                        clearErrors('BrandPosition');
                                                    }}
                                                    rules={{
                                                        required: SELECT_BUSINESS_TYPE,
                                                    }}
                                                />
                                                {licenseTypeId === 3 && (
                                                    <div className="form-group m0 position-relative top6">
                                                        <RSCheckbox
                                                            control={control}
                                                            name="isHybrid"
                                                            type="checkbox"
                                                            labelName="Hybrid solution"
                                                            className="smaller"
                                                        />
                                                    </div>
                                                )}
                                            </Col>
                                            <Col sm={6} xs={12}>
                                                <RSKendoDropDownList
                                                    control={control}
                                                    name={'BrandPosition'}
                                                    defaultValue={BrandPosition}
                                                    data={brandPosition}
                                                    textField="brandPositionName"
                                                    disabled={brandPosition?.length === 0}
                                                    dataItemKey={'brandPositionID'}
                                                    label={'Brand position'}
                                                    {...(brandPosition?.length === 0
                                                        ? {
                                                              rules: {
                                                                  required: false,
                                                              },
                                                          }
                                                        : {
                                                              required: true,
                                                              rules: {
                                                                  required: SELECT_BUSINESS_POSITION,
                                                              },
                                                          })}
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </div>
                <div className="buttons-holder">
                    {!isAgency && <RSSecondaryButton onClick={() => back('KEY_INFO')}>Back</RSSecondaryButton>}
                    <RSPrimaryButton type="submit" className={isFormValid ? 'click-off' : ''}>
                        Next
                    </RSPrimaryButton>
                </div>
                <RSConfirmationModal
                    show={show}
                    text={'Headquarters should be GHQ'}
                    primaryButtonText={'OK'}
                    handleConfirm={() => {
                        setShow(false);
                    }}
                    secondaryButton={false}
                />
                {licenseTypeId === 3 && (
                    <ParentCompanyAssociationModal
                        show={associationModalShow}
                        keyContactData={keyContactData}
                        parentCompanyName={parentCompanyValue || getValues('parentCompany')}
                        onClose={handleAssociationClose}
                        onAssociationSuccess={handleAssociationSuccess}
                    />
                )}
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
                    header="Edit company logo"
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

export default BrandDetails;
