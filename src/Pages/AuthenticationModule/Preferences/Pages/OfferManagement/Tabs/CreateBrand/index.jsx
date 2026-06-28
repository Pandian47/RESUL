import { charNumUnderScore, onKeyChar } from 'Utils/modules/inputValidators';
import { LIST_NAME_RULES } from 'Constants/GlobalConstant/Rules';
import { encodeUrl, getUserDetails } from 'Utils/modules/crypto';
import { getmasterData } from 'Utils/modules/masterData';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { MAX_LENGTH100, MAX_LENGTH255, MAX_LENGTH50, MAX_LENGTH500, MAX_LENGTH75 } from 'Constants/GlobalConstant/Regex';
import { ENTER_ADDRESS, ENTER_BRAND, ENTER_CATEGORY, ENTER_CITY, ENTER_EMAIL, ENTER_PHONE, ENTER_SHORT_NAME, ENTER_SUBCATEGORY, ENTER_VALID_EMAIL_ADDRESS, NAME, SELECT_COUNTRY, SELECT_CURRENCY, UPLOAD_LOGO } from 'Constants/GlobalConstant/ValidationMessage';
import { CANCEL, SAVE, UPDATE } from 'Constants/GlobalConstant/Placeholders';
import { restart_large } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FormProvider, useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import RSPageHeader from 'Components/RSPageHeader';
import RSInput from 'Components/FormFields/RSInput';
import RSFileUpload from 'Components/FormFields/RSFileUpload';
import RSTextarea from 'Components/FormFields/RSTextarea';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { getSessionId } from 'Reducers/globalState/selector';

import { saveBrandOffer, duplicateBrand, fetchOfferBrand, fetchOfferCategory, fetchOfferSubCategory } from 'Reducers/preferences/OfferManagements/request';
import { update_failures_API_Errors } from 'Reducers/globalState/reducer';
import useQueryParams from 'Hooks/useQueryParams';
import { INITIAL_STATE, STATUS_OPTIONS, buildBrandPayload, getBrandStateObject } from './constant';
import { getOfferCategorySelectionKey } from '../constant';
import RSReactPhoneInput from 'Components/FormFields/RSPhoneInput/RSReactPhoneInput';
import ListNameExists from 'Components/ListNameExists';
import RSTooltip from 'Components/RSTooltip';
import useApiLoader from 'Hooks/useApiLoader';
import usePreferencesSubPageApi, { PREFERENCES_SUBPAGE_LOADER_CONFIG } from 'Hooks/usePreferencesSubPageApi';
import PreferencesSubPageSkeletonGate from 'Components/Skeleton/Components/PreferencesSubPageSkeletonGate';
import { PREFERENCES_SUBPAGE_VARIANT } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';

const CreateBrand = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const { currencyMasterList, countryMasterList, stateMasterList } = getmasterData() || {};

    const userDetail = getUserDetails();
    const queryState = useQueryParams('/preferences/offer-management');
    const tabIndex = queryState?.index !== undefined ? queryState.index : 1; // Default to tab 1 (Brands & Shops)
    const brandQueryParams = useQueryParams('/preferences');
    const brandId = brandQueryParams?.brandId;
    const brandIdNumber = brandId ? Number(brandId) : null;
    const [isFormPopulated, setIsFormPopulated] = useState(() => !brandId);
    // Compute backPath with encrypted query string
    const getBackPath = useCallback(() => {
        const state = { index: tabIndex };
        const encryptState = encodeUrl(state);
        return `/preferences/offer-management?q=${encryptState}`;
    }, [tabIndex]);
    const methods = useForm(INITIAL_STATE);
    const {
        control,
        handleSubmit,
        reset,
        setValue,
        setError,
        clearErrors,
        watch,
        formState: { errors, isValid },
    } = methods;
    const allValues = watch();
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);

    const logo = watch('logo');
    const description = watch('description');
    const category = watch('category');
    const getSubCategoryValue = watch('subCategory');
    const dialCode = useRef('');
    const hasFetchedBrandData = useRef(false);
    const hasPopulatedFormRef = useRef(false);
    const lastSubCategoryFetchKeyRef = useRef('');
    const [categoryList, setCategoryList] = useState([]);
    const [subCategoryList, setSubCategoryList] = useState([]);
    const categoryListRef = useRef([]);

    const [subCategoryData, setSubCategoryData] = useState([]);
    const [editedData, setEditedData] = useState([]);

    const [nameExists, setNameExists] = useState(true);

    const editName = editedData[0]?.shortName;

    const handleNameExists = (val, editValue) => {
        if (val === editValue) {
            setNameExists(true);
        } else {
            setNameExists(false);
        }
    };

    useEffect(() => {
        if (Array.isArray(category) && category.length > 0) {
            const allSubCategories = category.flatMap(item => item.subCategory || []);
            setSubCategoryData(allSubCategories);
        } else {
            // If not array, reset
            setSubCategoryData([]);
            // setValue('subCategory', []);  // if needed
        }
    }, [category]);

    useEffect(() => {

        if (brandId == null) {
            const get_countryMasterList = countryMasterList || [];
            const get_currencyMasterList = currencyMasterList || [];

            // Find the object where countryID matches dataItem?.country
            const matchedCountry = get_countryMasterList.find(
                (item) => item.countryID == userDetail?.countryId
            );

            const matchedCurrency = get_currencyMasterList.find(
                (item) => item.currencyID == userDetail?.currencyId
            );

            // If match found, set the country value
            if (matchedCountry) {
                setValue('currency', matchedCurrency)
                setValue('country', matchedCountry)
            }

        }

    }, [])

    useEffect(() => {

        if (brandId != null) {
            let edited = editedData[0]

            let category = [];
            if (edited?.categoryID != null) {
                const idArray = edited?.categoryID.split(",").map(Number); // ["2","6","3"] -> [2,6,3]
                category = categoryList.filter(item => idArray.includes(item.categoryID));
            }

            let matchedSubCategories = category?.flatMap(item => item.subCategory);
            const selectedList = edited?.subCategoryID.split(","); // ["132", "133"]
            const matchedData = matchedSubCategories.filter(item =>
                selectedList.includes(item.subCategoryID)
            );
            setValue('category', category)
            setValue('subCategory', matchedData)
        }
    }, [editedData])




    // Keep ref in sync with state
    useEffect(() => {
        categoryListRef.current = categoryList;
    }, [categoryList]);

    const handleSave = async (data) => {
        const payload = buildBrandPayload(data, clientId, departmentId, userId, brandId);
        const res = await saveApi.refetch({
            fetcher: () => dispatch(saveBrandOffer(payload, false)),
            loaderConfig: PREFERENCES_SUBPAGE_LOADER_CONFIG,
            mode: brandIdNumber && !Number.isNaN(brandIdNumber) ? 'edit' : 'create',
        });
        if (res?.status) {
            // Check if we came from CreateOffer
          //  debugger
            if (location?.state?.fromCreateOffer && location?.state?.offerFormData) {
                // Navigate back to CreateOffer with saved form data
                navigate('/preferences/create-offer', {
                    state: {
                        fromCreateBrand: true,
                        offerFormData: location.state.offerFormData
                    }
                });
            } else {
                // Default navigation to offer management
                const state = { index: tabIndex };
                const encryptState = encodeUrl(state);
                navigate(`/preferences/offer-management?q=${encryptState}`, {
                    state,
                });
            }
        } else {
            dispatch(
                update_failures_API_Errors({
                    field: 'SaveBrandOffer',
                    message: res?.message || 'No data available',
                }),
            );
        }
    };

    const saveApi = useApiLoader({
        autoFetch: false,
        loaderConfig: PREFERENCES_SUBPAGE_LOADER_CONFIG,
        mode: brandIdNumber && !Number.isNaN(brandIdNumber) ? 'edit' : 'create',
    });
    const isSaveLoading = saveApi.isFetching;

    const createBrandApi = usePreferencesSubPageApi({
        enabled: Boolean(departmentId && clientId && userId),
        mode: brandIdNumber && !Number.isNaN(brandIdNumber) ? 'edit' : 'create',
        deps: [departmentId, clientId, userId, brandIdNumber],
        fetcher: async () => {
            const payload = { departmentId, clientId, userId };
            const categoryRes = await dispatch(fetchOfferCategory(payload));
            let categories = [];
            if (categoryRes?.status && categoryRes?.data) {
                categories = Array.isArray(categoryRes.data) ? categoryRes.data : [];
                setCategoryList(categories);
                categoryListRef.current = categories;
            }

            if (brandIdNumber && !Number.isNaN(brandIdNumber)) {
                const brandPayload = { departmentId, clientId, userId, brandId: brandIdNumber, mode: 0 };
                const { data, status, message = 'No data available' } = await dispatch(
                    fetchOfferBrand(brandPayload, false),
                );
                if (status && data) {
                    const brandDataToUse = Array.isArray(data) ? data : data;
                    setEditedData(brandDataToUse);
                    if (!hasPopulatedFormRef.current) {
                        const stateObject = getBrandStateObject({
                            brandData: brandDataToUse,
                            currencyMasterList,
                            countryMasterList,
                            categoryList: categories,
                            subCategoryList: [],
                        });
                        for (const [key, val] of Object.entries(stateObject)) {
                            setValue(key, val, { shouldValidate: false, shouldDirty: false });
                        }
                        hasPopulatedFormRef.current = true;
                        hasFetchedBrandData.current = true;
                    }
                } else {
                    dispatch(
                        update_failures_API_Errors({
                            field: 'FetchOfferBrand',
                            message: message || 'No data available',
                        }),
                    );
                }
                setIsFormPopulated(true);
            } else {
                hasPopulatedFormRef.current = false;
                hasFetchedBrandData.current = false;
                setIsFormPopulated(true);
            }

            return categoryRes;
        },
    });

    const isEditBrand = Boolean(brandIdNumber && !Number.isNaN(brandIdNumber));
    const showCreateBrandPageSkeleton = isEditBrand && (createBrandApi.isPageLoading || !isFormPopulated);
    const bootstrapFieldLoading = createBrandApi.isLoading;

    /** Cascade: subcategory list when category changes (field loader, not global). */
    const subCategoryApi = useApiLoader({
        autoFetch: false,
        loaderConfig: PREFERENCES_SUBPAGE_LOADER_CONFIG,
        mode: 'create',
    });

    useEffect(() => {
        if (!departmentId || !clientId || !userId) return;

        const categorySelectionKey = getOfferCategorySelectionKey(category);
        if (!categorySelectionKey) {
            lastSubCategoryFetchKeyRef.current = '';
            subCategoryApi.reset();
            setSubCategoryList([]);
            setValue('subCategory', [], { shouldValidate: false, shouldDirty: false });
            return;
        }

        if (lastSubCategoryFetchKeyRef.current === categorySelectionKey) return;

        const categoryItems = Array.isArray(category) ? category : category ? [category] : [];
        const categoryId =
            categoryItems[0]?.categoryTypeID || categoryItems[0]?.categoryId || categoryItems[0]?.categoryID;
        if (!categoryId) {
            return;
        }

        lastSubCategoryFetchKeyRef.current = categorySelectionKey;

        subCategoryApi.refetch({
            fetcher: () =>
                dispatch(fetchOfferSubCategory({ departmentId, clientId, userId, categoryId })),
            onSuccess: async (subCategoryRes) => {
                if (subCategoryRes?.status && subCategoryRes?.data) {
                    const fetchedSubCategories = Array.isArray(subCategoryRes.data) ? subCategoryRes.data : [];
                    setSubCategoryList(fetchedSubCategories);

                    if (brandId && hasFetchedBrandData.current && hasPopulatedFormRef.current) {
                        const brandPayload = { departmentId, clientId, userId, brandId, mode: 0 };
                        const { data: brandDataResponse, status: brandStatus } = await dispatch(
                            fetchOfferBrand(brandPayload, false),
                        );
                        if (brandStatus && brandDataResponse) {
                            const brandDataToUse = Array.isArray(brandDataResponse)
                                ? brandDataResponse
                                : brandDataResponse;
                            const stateObject = getBrandStateObject({
                                brandData: brandDataToUse,
                                currencyMasterList,
                                countryMasterList,
                                categoryList: categoryListRef.current,
                                subCategoryList: fetchedSubCategories,
                            });
                            if (stateObject.subCategory && Array.isArray(stateObject.subCategory)) {
                                setValue('subCategory', stateObject.subCategory, {
                                    shouldValidate: false,
                                    shouldDirty: false,
                                });
                            }
                        }
                    }
                } else {
                    setSubCategoryList([]);
                }
            },
            onError: () => setSubCategoryList([]),
        });
    }, [category, departmentId, clientId, userId, brandId, dispatch, setValue]);

    // Reset populated form ref when brandId changes
    useEffect(() => {
        hasPopulatedFormRef.current = false;
        hasFetchedBrandData.current = false;
        lastSubCategoryFetchKeyRef.current = '';
        setIsFormPopulated(!brandId);
    }, [brandId]);

    useLayoutEffect(() => {
        window.scrollTo(0, 0);
    }, [brandId]);

    const handleLogoUpload = async (base64Image, fileName, contentLength) => {
        if (!fileName || !base64Image) return;

        // Format base64 as data URI if it's not already formatted
        const imageFormat = fileName.split('.')?.pop()?.toLowerCase() || 'png';
        const formattedBase64 = base64Image.startsWith('data:')
            ? base64Image
            : `data:image/${imageFormat};base64,${base64Image}`;

        // Set base64 data directly without API call
        setValue('logo', formattedBase64);
        clearErrors('logo');
    };

    return (
        <FormProvider {...methods}>
            <div className="page-content-holder">
                <RSPageHeader
                    title={brandId ? "Edit brand" : "Add brand"}
                    isBack
                    backPath={getBackPath()}
                    state={{ index: tabIndex }}
                    isHeaderLine
                    rightCommonMenus
                    isBuDisabled={true}
                    isAgencyDisabled={true}
                />

                <Container fluid>
                    <div className="page-content">
                        <Container className="px0">
                            <PreferencesSubPageSkeletonGate
                                variant={PREFERENCES_SUBPAGE_VARIANT.CREATE_BRAND}
                                isLoading={showCreateBrandPageSkeleton}
                            >
                            <form onSubmit={handleSubmit(handleSave)} >
                                <div className="box-design rs-box py40">
                                    {/* Brand Short Name and Brand Legal Name - 2 columns */}
                                    <div className="form-group">
                                        <Row>
                                            <Col sm={4} className="text-right">
                                                <label className="control-label-left">Brand short name / Brand legal name</label>
                                            </Col>
                                            <Col sm={7}>
                                                <Row>
                                                    <Col sm={6} id="rs_CreateBrand_shortName">

                                                        <ListNameExists
                                                            name="shortName"
                                                            control={control}
                                                            field={'brandName'}
                                                            placeholder=" Brand short name"
                                                            maxLength={MAX_LENGTH75}
                                                            required
                                                            onKeyDown={charNumUnderScore}
                                                            isSpecialCharacter={false}
                                                            // rules={{
                                                            //     required: NAME,
                                                            //     pattern: {
                                                            //         value: /^[a-zA-Z0-9\-_ ]*$/,
                                                            //         message: 'Only numbers & (.) are allowed',
                                                            //     },
                                                            // }}
                                                            // onValid={(valid) => setIsValidListname(valid)}
                                                            apiCallback={duplicateBrand}
                                                            condition={(status) => {
                                                                return !status?.status;
                                                            }}
                                                            onChange={(e) => {
                                                                if (e?.target?.value?.length > 0) {
                                                                    handleNameExists(
                                                                        e?.target?.value?.toLowerCase().trim(),
                                                                        editName?.toLowerCase().trim(),
                                                                    );
                                                                }

                                                            }}
                                                            onBlur={(e) => {
                                                                if (e?.target?.value?.length > 0) {
                                                                    handleNameExists(
                                                                        e?.target?.value?.toLowerCase().trim(),
                                                                        editName?.toLowerCase().trim(),
                                                                    );
                                                                }

                                                            }}
                                                            extraPayload={{ clientId, departmentId, userId, legalBrandName: '' }}
                                                            nameExists={nameExists}
                                                        // customErrorMessage={FORM_NAME}
                                                        />

                                                        {/* <RSInput
                                                            name="shortName"
                                                            control={control}
                                                            placeholder=" Brand short name"
                                                            maxLength={MAX_LENGTH75}
                                                            required
                                                            rules={{
                                                                required: ENTER_SHORT_NAME,
                                                                pattern: {
                                                                    value: /^[a-zA-Z0-9\-_ ]*$/,
                                                                    message: 'Only numbers & (.) are allowed',
                                                                },
                                                            }}
                                                               condition={(status) => {
                                                                return !status?.status;
                                                            }}
                                                            onChange={(e) => {
                                                                if (e?.target?.value?.length > 0) {
                                                                    handleNameExists(
                                                                        e?.target?.value?.toLowerCase().trim(),
                                                                        editName?.toLowerCase().trim(),
                                                                    );
                                                                }

                                                            }}
                                                            onBlur={(e) => {
                                                                if (e?.target?.value?.length > 0) {
                                                                    handleNameExists(
                                                                        e?.target?.value?.toLowerCase().trim(),
                                                                        editName?.toLowerCase().trim(),
                                                                    );
                                                                }

                                                            }}
                                                            extraPayload={{ clientId, departmentId, userId }}
                                                            nameExists={nameExists}
                                                        /> */}
                                                    </Col>


                                                    <Col sm={6} id="rs_CreateBrand_legalName">
                                                        {/* <RSInput
                                                            name="legalName"
                                                            control={control}
                                                            placeholder=" Brand Legal Name"
                                                            maxLength={MAX_LENGTH75}
                                                            required
                                                            onKeyDown={charNumUnderScore}
                                                            rules={{
                                                                required: NAME,
                                                                pattern: {
                                                                    value: /^[a-zA-Z0-9\-_ ]*$/,
                                                                    message: 'Only numbers & (.) are allowed',
                                                                },
                                                            }}
                                                        /> */}

                                                        <ListNameExists
                                                            name="legalName"
                                                            control={control}
                                                            field={'legalBrandName'}
                                                            placeholder="Brand legal name"
                                                            maxLength={MAX_LENGTH75}
                                                            required
                                                            isSpecialCharacter={false}
                                                            rules={{
                                                                required: ENTER_BRAND,
                                                                // pattern: {
                                                                //     value: /^[a-zA-Z0-9\-_ ]*$/,
                                                                //     message: 'Only numbers & (.) are allowed',
                                                                // },
                                                            }}
                                                            // onValid={(valid) => setIsValidListname(valid)}
                                                            apiCallback={duplicateBrand}
                                                            condition={(status) => {
                                                                return !status?.status;
                                                            }}
                                                            onChange={(e) => {
                                                                if (e?.target?.value?.length > 0) {
                                                                    handleNameExists(
                                                                        e?.target?.value?.toLowerCase().trim(),
                                                                        editName?.toLowerCase().trim(),
                                                                    );
                                                                }

                                                            }}
                                                            onBlur={(e) => {
                                                                if (e?.target?.value?.length > 0) {
                                                                    handleNameExists(
                                                                        e?.target?.value?.toLowerCase().trim(),
                                                                        editName?.toLowerCase().trim(),
                                                                    );
                                                                }

                                                            }}
                                                            extraPayload={{ clientId, departmentId, userId, brandName: '' }}
                                                            nameExists={nameExists}
                                                        // rules={LIST_NAME_RULES(FORM_NAME)}
                                                        // customErrorMessage={FORM_NAME}
                                                        />
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </div>

                                    {/* Brand logo - full row */}
                                    <div className="form-group">
                                        <Row>
                                            <Col sm={4} className="text-right">
                                                <label className="control-label-left">Brand logo</label>
                                            </Col>
                                            <Col sm={7} id="rs_CreateBrand_logo">
                                                <Row>
                                                    <Col sm={logo ? 10 : 12}>
                                                        <RSFileUpload
                                                            name="logo"
                                                            control={control}
                                                            setError={setError}
                                                            clearErrors={clearErrors}
                                                            text="Browse"
                                                            placeholder="Choose logo"
                                                            accept=".jpg,.jpeg,.png"
                                                            isbase64={true}
                                                            fileType="img"
                                                            watch={watch}
                                                            // isRefresh={!!logo}
                                                            isBase64Status={true}
                                                            isPrefix={true}
                                                            base64Data={handleLogoUpload}
                                                            required
                                                            rules={{
                                                                required: UPLOAD_LOGO,
                                                            }}
                                                            resetValue={() => {
                                                                setValue('logo', '');
                                                            }}
                                                        /></Col>

                                                    {logo && (
                                                        <Col sm={2} className='d-flex align-items-center gap-3 p-0 brand-preview-logo mt-26' >

                                                            <img
                                                                src={logo}
                                                                alt="Logo"
                                                            />
                                                            <RSTooltip text={'Reset image'}>
                                                                <i
                                                                    id="rs_data_refresh"
                                                                    className={`${restart_large} color-primary-blue icon-md`}
                                                                    onClick={() => {
                                                                        setValue('logo', '');
                                                                    }}
                                                                ></i>
                                                            </RSTooltip>
                                                        </Col>

                                                    )}

                                                </Row>

                                            </Col>
                                        </Row>


                                    </div>


                                    {/* Description - textarea - full row */}
                                    <div className="form-group">
                                        <Row>
                                            <Col sm={4} className="text-right">
                                                <label className="control-label-left">Description</label>
                                            </Col>
                                            <Col sm={7} id="rs_CreateBrand_description">
                                                <RSTextarea
                                                    name="description"
                                                    control={control}
                                                    // placeholder=" Description"
                                                    maxLength={MAX_LENGTH500}
                                                    required
                                                />
                                                <small className="text-end fs11">{description?.length}/{MAX_LENGTH500}</small>
                                            </Col>
                                        </Row>
                                    </div>

                                    {/* Contact Name, Email ID, Mobile No - 3 columns */}
                                    <div className="form-group">
                                        <Row>
                                            <Col sm={4} className="text-right">
                                                <label className="control-label-left">Contact name / Email ID / Mobile no</label>
                                            </Col>
                                            <Col sm={7}>
                                                <Row>
                                                    <Col sm={4} id="rs_CreateBrand_contactName">
                                                        <RSInput
                                                            name="contactName"
                                                            control={control}
                                                            placeholder=" Contact name"
                                                            maxLength={MAX_LENGTH100}
                                                            required
                                                            rules={{
                                                                required: NAME,
                                                            }}
                                                        />
                                                    </Col>
                                                    <Col sm={4} id="rs_CreateBrand_emailId">
                                                        <RSInput
                                                            name="emailId"
                                                            control={control}
                                                            placeholder=" Email ID"
                                                            type="email"
                                                            maxLength={MAX_LENGTH100}
                                                            required
                                                            rules={{
                                                                required: ENTER_EMAIL,
                                                                pattern: {
                                                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                                    message: ENTER_VALID_EMAIL_ADDRESS,
                                                                },
                                                            }}
                                                        />
                                                    </Col>
                                                    <Col sm={4} id="rs_CreateBrand_mobileNo">
                                                        <RSReactPhoneInput
                                                            name="mobileNo"
                                                            control={control}
                                                            setValue={setValue}
                                                            setError={setError}
                                                            clearErrors={clearErrors}
                                                            label="Mobile number"
                                                            required
                                                            errors={errors}
                                                            rules={{ required: ENTER_PHONE }}
                                                            handleOnchange={(phone, value, e, formattedValue) => {
                                                                const { dialCode: code } = value;
                                                                dialCode.current = code;
                                                            }}
                                                        />
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </div>

                                    {/* Category, Subcategory, Currency - 3 columns */}
                                    <div className="form-group">
                                        <Row className='align-items-end'>
                                            <Col sm={4} className="text-right">
                                                <label className="control-label-left">Category / Subcategory / Currency</label>
                                            </Col>
                                            <Col sm={7}>
                                                <Row className='align-items-end'>
                                                    <Col sm={4} id="rs_CreateBrand_category">
                                                        <RSMultiSelect
                                                            name="category"
                                                            data={categoryList}
                                                            textField="categoryName"
                                                            dataItemKey="categoryID"
                                                            control={control}
                                                            label="Category"
                                                            placeholder=" Category"
                                                            required
                                                            isLoading={bootstrapFieldLoading}
                                                            autoClose={false}
                                                            rules={{
                                                                required: ENTER_CATEGORY || 'Category',
                                                            }}
                                                            handleChange={(e) => {
                                                                const getSubCategoryData = getSubCategoryValue;

                                                                // 1️⃣ Extract categoryId list from e.value (array of objects)
                                                                const selectedCategoryIds = e?.value?.map(item => String(item.categoryID));

                                                                // 2️⃣ Filter subcategories that match selected categories
                                                                const matchedData = getSubCategoryData?.filter(item =>
                                                                    selectedCategoryIds?.includes(item.categoryId)
                                                                );

                                                                // 3️⃣ Clear existing subCategory field in the form
                                                                setValue("subCategory", matchedData);

                                                                // setValue('subCategory', []);
                                                            }}
                                                        />
                                                    </Col>
                                                    <Col sm={4} id="rs_CreateBrand_subCategory">
                                                        <RSMultiSelect
                                                            required
                                                            name="subCategory"
                                                            control={control}
                                                            data={subCategoryData}
                                                            textField="subCategoryName"
                                                            dataItemKey="subCategoryID"
                                                            label="Subcategory"
                                                            disabled={!category}
                                                            isLoading={subCategoryApi.isLoading}
                                                            autoClose={false}
                                                            rules={{
                                                                required: ENTER_SUBCATEGORY,
                                                            }}
                                                        />
                                                    </Col>
                                                    <Col sm={4} id="rs_CreateBrand_currency">
                                                        <RSKendoDropdown
                                                            name="currency"
                                                            data={currencyMasterList || []}
                                                            textField="currencyName"
                                                            dataItemKey="currencyID"
                                                            control={control}
                                                            label="Currency"
                                                            placeholder=" Currency"
                                                            required
                                                            rules={{
                                                                required: SELECT_CURRENCY || 'Select currency',
                                                            }}
                                                        />
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </div>

                                    {/* Address - full row */}
                                    <div className="form-group">
                                        <Row>
                                            <Col sm={4} className="text-right">
                                                <label className="control-label-left">Address</label>
                                            </Col>
                                            <Col sm={7} id="rs_CreateBrand_address">
                                                <RSInput
                                                    name="address"
                                                    control={control}
                                                    placeholder=" Address"
                                                    maxLength={MAX_LENGTH255}
                                                    required
                                                    rules={{
                                                        required: ENTER_ADDRESS,
                                                    }}
                                                />
                                            </Col>
                                        </Row>
                                    </div>

                                    {/* City, Country, Status - 3 columns */}
                                    <div className="form-group">
                                        <Row>
                                            <Col sm={4} className="text-right">
                                                <label className="control-label-left">Country / City</label>
                                            </Col>
                                            <Col sm={7}>
                                                <Row>
                                                    <Col sm={6} id="rs_CreateBrand_country">
                                                        <RSKendoDropdown
                                                            name="country"
                                                            data={countryMasterList || []}
                                                            textField="country"
                                                            dataItemKey="countryID"
                                                            control={control}
                                                            label="Country"
                                                            placeholder=" Country"
                                                            required
                                                            rules={{
                                                                required: SELECT_COUNTRY || 'Select country',
                                                            }}
                                                        />
                                                    </Col>
                                                    {/* <Col sm={3} id="rs_CreateBrand_state">
                                                        <RSKendoDropdown
                                                            name="state"
                                                            data={stateList || []}
                                                            textField="state"
                                                            dataItemKey="stateID"
                                                            control={control}
                                                            label="State"
                                                            placeholder=" State"
                                                            required
                                                        />
                                                    </Col> */}
                                                    <Col sm={6} id="rs_CreateBrand_city">
                                                        <RSInput
                                                            name="city"
                                                            control={control}
                                                            placeholder=" City"
                                                            maxLength={MAX_LENGTH50}
                                                            required
                                                            onKeyDown={onKeyChar}
                                                            rules={{
                                                                required: ENTER_CITY,
                                                            }}
                                                        />
                                                    </Col>
                                                    {/* <Col sm={3} id="rs_CreateBrand_zipcode">
                                                        <RSInput
                                                            name="zipcode"
                                                            control={control}
                                                            placeholder=" Zip code"
                                                            required
                                                        />
                                                    </Col> */}
                                                </Row>
                                            </Col>
                                        </Row>
                                    </div>


                                    {/* /Latitude / Longitude/ */}

                                    <div className="form-group">
                                        <Row>
                                            <Col sm={4} className="text-right">
                                                <label className="control-label-left">Latitude / Longitude / Status</label>
                                            </Col>

                                            <Col sm={7}>
                                                <Row>

                                                    {/* Latitude */}
                                                    <Col sm={4}>
                                                        <RSInput
                                                            name="latitude"
                                                            control={control}
                                                            placeholder="Latitude"
                                                            maxLength={MAX_LENGTH75}
                                                            required
                                                            rules={{
                                                                required: "Please enter latitude",
                                                                pattern: {
                                                                    value: /^[0-9.]+$/,
                                                                    message: "Only numbers and dots are allowed",
                                                                }
                                                            }}

                                                            // BLOCK comma while typing
                                                            onKeyDown={(e) => {
                                                                if (e.key === ",") {
                                                                    e.preventDefault();
                                                                }
                                                            }}

                                                            // HANDLE paste for BOTH latitude & longitude
                                                            handleOnPaste={(e) => {
                                                                e.preventDefault();
                                                                const text = e.clipboardData.getData("Text");

                                                                if (text.includes(",")) {
                                                                    const [lat, lng] = text.split(",").map(v => v.trim());
                                                                    setValue("latitude", lat || "");
                                                                    setValue("longitude", lng || "");
                                                                    clearErrors('latitude')
                                                                    clearErrors('longitude')

                                                                } else {
                                                                    setValue("latitude", text.trim());
                                                                    clearErrors('latitude')

                                                                }
                                                            }}
                                                        />
                                                    </Col>

                                                    {/* Longitude */}
                                                    <Col sm={4}>
                                                        <RSInput
                                                            name="longitude"
                                                            control={control}
                                                            placeholder="Longitude"
                                                            maxLength={MAX_LENGTH75}
                                                            required
                                                            rules={{
                                                                required: "Please enter longitude",
                                                                pattern: {
                                                                    value: /^[0-9.]+$/,
                                                                    message: "Only numbers and dots are allowed",
                                                                }
                                                            }}

                                                            // BLOCK comma while typing
                                                            onKeyDown={(e) => {
                                                                if (e.key === ",") {
                                                                    e.preventDefault();
                                                                }
                                                            }}

                                                            // HANDLE paste for longitude as well
                                                            handleOnPaste={(e) => {
                                                                e.preventDefault();
                                                                const text = e.clipboardData.getData("Text");

                                                                if (text.includes(",")) {
                                                                    const [lat, lng] = text.split(",").map(v => v.trim());
                                                                    setValue("latitude", lat || "");
                                                                    setValue("longitude", lng || "");
                                                                    clearErrors('latitude')
                                                                    clearErrors('longitude')
                                                                } else {
                                                                    setValue("longitude", text.trim());
                                                                    clearErrors('longitude')
                                                                }
                                                            }}
                                                        />
                                                    </Col>
                                                    <Col sm={4} id="rs_CreateBrand_status">
                                                        <RSKendoDropdown
                                                            name="status"
                                                            data={STATUS_OPTIONS}
                                                            textField="name"
                                                            dataItemKey="id"
                                                            control={control}
                                                            label="Status"
                                                            placeholder=" Status"
                                                            required
                                                            rules={{
                                                                required: 'Select status',
                                                            }}
                                                            defaultValue={STATUS_OPTIONS[0]}
                                                        />
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </div>
                                </div>
                                <div className="buttons-holder">
                                    <RSSecondaryButton
                                        blockInteraction={isSaveLoading}
                                        onClick={() => {
                                            if (isSaveLoading) return;
                                            reset();
                                            const state = { index: tabIndex };
                                            const encryptState = encodeUrl(state);
                                            navigate(`/preferences/offer-management?q=${encryptState}`, {
                                                state,
                                            });
                                        }}
                                        id="rs_CreateBrand_Cancel"
                                    >
                                        {CANCEL}
                                    </RSSecondaryButton>
                                    <RSPrimaryButton
                                        type="submit"
                                        id="rs_CreateBrand_Save"
                                        disabledClass={!isValid ? 'pe-none click-off' : ''}
                                        isLoading={isSaveLoading}
                                        blockBodyPointerEvents={isSaveLoading}
                                    >
                                        {brandId ? UPDATE : SAVE}
                                    </RSPrimaryButton>
                                </div>
                            </form>
                            </PreferencesSubPageSkeletonGate>
                            {getWarningPopupMessage(failureApiErrors, dispatch)}
                        </Container>
                    </div>
                </Container>
            </div>
        </FormProvider>
    );
};

export default CreateBrand;
