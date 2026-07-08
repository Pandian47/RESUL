import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import RSInput from 'Components/FormFields/RSInput';
import RSFileUpload from 'Components/FormFields/RSFileUpload';
import RSTextarea from 'Components/FormFields/RSTextarea';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
import * as placeholder from 'Constants/GlobalConstant/Placeholders';
import * as error from 'Constants/GlobalConstant/ValidationMessage';
import * as regex from 'Constants/GlobalConstant/Regex';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { getSessionId } from 'Reducers/globalState/selector';
import { getmasterData, getUserDetails, charNumUnderScore, onKeyChar, getWarningPopupMessage } from 'Utils/index';
import { duplicateBrand, fetchOfferBrand, fetchOfferCategory, fetchOfferSubCategory } from 'Reducers/preferences/OfferManagements/request';
import { update_failures_API_Errors } from 'Reducers/globalState/reducer';
import { INITIAL_STATE, STATUS_OPTIONS, getBrandStateObject } from './constant';
import RSReactPhoneInput from 'Components/FormFields/RSPhoneInput/RSReactPhoneInput';
import ListNameExists from 'Components/ListNameExists';
import RSTooltip from 'Components/RSTooltip';
import * as icons from 'Constants/GlobalConstant/Glyphicons';

const BrandOfferForm = ({
    brandId = null,
    onSubmit,
    onCancel,
    submitLabel = placeholder.SAVE,
    cancelLabel = placeholder.CANCEL,
    isSaving = false,
    isActive = true,
    saveButtonId = 'rs_CreateBrand_Save',
    cancelButtonId = 'rs_CreateBrand_Cancel',
}) => {
    const dispatch = useDispatch();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const { currencyMasterList, countryMasterList } = getmasterData() || {};

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
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);

    const logo = watch('logo');
    const description = watch('description');
    const category = watch('category');
    const getSubCategoryValue = watch('subCategory');
    const dialCode = React.useRef('');
    const hasFetchedBrandData = React.useRef(false);
    const hasPopulatedFormRef = React.useRef(false);
    const hasFetchedCategoriesRef = React.useRef(false);
    const hasInitializedFormRef = React.useRef(false);
    const categoryListRef = React.useRef([]);
    const [categoryList, setCategoryList] = React.useState([]);
    const [subCategoryList, setSubCategoryList] = React.useState([]);
    const [subCategoryData, setSubCategoryData] = React.useState([]);
    const [editedData, setEditedData] = React.useState([]);

    const [nameExists, setNameExists] = React.useState(true);

    const editName = editedData[0]?.shortName;

    const categorySelectionKey = useMemo(() => {
        if (Array.isArray(category)) {
            return category.map((item) => item?.categoryID).filter(Boolean).join(',');
        }
        return String(category?.categoryTypeID || category?.categoryId || '');
    }, [category]);

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
    React.useEffect(() => {
        categoryListRef.current = categoryList;
    }, [categoryList]);

    useEffect(() => {
        if (!isActive) {
            hasInitializedFormRef.current = false;
            hasFetchedCategoriesRef.current = false;
            return;
        }

        if (brandId || hasInitializedFormRef.current) return;

        hasInitializedFormRef.current = true;
        reset(INITIAL_STATE.defaultValues);
        setNameExists(true);
        hasFetchedBrandData.current = false;
        hasPopulatedFormRef.current = false;

        const { countryMasterList: countries, currencyMasterList: currencies } = getmasterData() || {};
        const user = getUserDetails();
        const matchedCountry = (countries || []).find(
            (item) => item.countryID == user?.countryId,
        );
        const matchedCurrency = (currencies || []).find(
            (item) => item.currencyID == user?.currencyId,
        );
        if (matchedCountry) setValue('country', matchedCountry);
        if (matchedCurrency) setValue('currency', matchedCurrency);
    }, [isActive, brandId, reset, setValue]);

    React.useEffect(() => {
        if (!isActive || !departmentId || !clientId || !userId || hasFetchedCategoriesRef.current) {
            return;
        }

        hasFetchedCategoriesRef.current = true;

        const loadCategories = async () => {
            const categoryRes = await dispatch(
                fetchOfferCategory({ departmentId, clientId, userId }),
            );

            if (categoryRes?.status && categoryRes?.data) {
                setCategoryList(Array.isArray(categoryRes.data) ? categoryRes.data : []);
            }
        };

        loadCategories();
    }, [isActive, departmentId, clientId, userId, dispatch]);

    // useEffect(() => {
    //     if (categoryList != null) {

    //         setSubCategoryData(category?.subCategory)
    //     }
    // }, [categoryList, category, category?.categoryTypeID, category?.categoryId, departmentId, clientId, userId, dispatch, setValue])


    // Fetch sub categories when category changes
    React.useEffect(() => {
        async function fetchSubCategories() {
            if (category) {
                const categoryId = category?.categoryTypeID || category?.categoryId;
                if (categoryId) {
                    let payload = { departmentId, clientId, userId, categoryId };
                    let subCategoryRes = await dispatch(fetchOfferSubCategory(payload));

                    if (subCategoryRes?.status && subCategoryRes?.data) {
                        const fetchedSubCategories = Array.isArray(subCategoryRes.data) ? subCategoryRes.data : [];
                        setSubCategoryList(fetchedSubCategories);

                        // In edit mode, if we have brand data and subcategories are fetched, update subcategory selection
                        if (brandId && hasFetchedBrandData.current && hasPopulatedFormRef.current) {
                            // Re-fetch brand data to get updated subcategory mapping
                            let brandPayload = { departmentId, clientId, userId, brandId, mode:0 };
                            let { data: brandDataResponse, status: brandStatus } = await dispatch(fetchOfferBrand(brandPayload));
                            if (brandStatus && brandDataResponse) {

                                // Handle API response structure: data can be array or object
                                const brandDataToUse = Array.isArray(brandDataResponse) ? brandDataResponse : brandDataResponse;

                                const stateObject = getBrandStateObject({
                                    brandData: brandDataToUse,
                                    currencyMasterList,
                                    countryMasterList,
                                    categoryList: categoryListRef.current,
                                    subCategoryList: fetchedSubCategories,
                                });
                                // Only update subcategory if it exists in the state object
                                if (stateObject.subCategory && Array.isArray(stateObject.subCategory)) {
                                    setValue('subCategory', stateObject.subCategory, { shouldValidate: false, shouldDirty: false });
                                }
                            }
                        }
                    } else {
                        setSubCategoryList([]);
                    }
                } else {
                    setSubCategoryList([]);
                }
            } else {
                setSubCategoryList([]);
                const currentSubCategory = getSubCategoryValue;
                if (Array.isArray(currentSubCategory) && currentSubCategory.length > 0) {
                    setValue('subCategory', [], { shouldValidate: false, shouldDirty: false });
                }
            }
        }
        fetchSubCategories();
    }, [categorySelectionKey, brandId, departmentId, clientId, userId, dispatch]);

    // Fetch brand data in edit mode
    React.useEffect(() => {
        async function fetchBrandData() {
            if (brandId && departmentId && clientId && userId && categoryList.length > 0 && !hasFetchedBrandData.current) {
                hasFetchedBrandData.current = true;
                let payload = { departmentId, clientId, userId, brandId, mode:0 };
                let { data, status, message = 'No data available' } = await dispatch(fetchOfferBrand(payload, true));
                if (status && data) {
                    // Handle API response structure: data can be array or object
                    const brandDataToUse = Array.isArray(data) ? data : data;
                    setEditedData(brandDataToUse)

                    // Map API response to form state using helper function
                    const stateObject = getBrandStateObject({
                        brandData: brandDataToUse,
                        currencyMasterList,
                        countryMasterList,
                        categoryList: categoryListRef.current,
                        subCategoryList,
                    });

                    // Set all form values at once - only if not already populated
                    if (!hasPopulatedFormRef.current) {
                        for (let [key, val] of Object.entries(stateObject)) {
                            setValue(key, val, { shouldValidate: false, shouldDirty: false });
                        }
                        hasPopulatedFormRef.current = true;
                    }
                } else {
                    dispatch(
                        update_failures_API_Errors({
                            field: 'FetchOfferBrand',
                            message: message || 'No data available',
                        }),
                    );
                }
            }
        }
        fetchBrandData();
    }, [brandId, departmentId, clientId, userId, categoryList.length, dispatch, setValue]);

    // Reset populated form ref when brandId changes
    React.useEffect(() => {
        hasPopulatedFormRef.current = false;
        hasFetchedBrandData.current = false;
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
            <form onSubmit={handleSubmit(onSubmit)}>
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
                                                            maxLength={regex.MAX_LENGTH75}
                                                            required
                                                            onKeyDown={charNumUnderScore}
                                                            isSpecialCharacter={false}
                                                            // rules={{
                                                            //     required: error.NAME,
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
                                                        // customErrorMessage={error.FORM_NAME}
                                                        />

                                                        {/* <RSInput
                                                            name="shortName"
                                                            control={control}
                                                            placeholder=" Brand short name"
                                                            maxLength={regex.MAX_LENGTH75}
                                                            required
                                                            rules={{
                                                                required: error.ENTER_SHORT_NAME,
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
                                                            maxLength={regex.MAX_LENGTH75}
                                                            required
                                                            onKeyDown={charNumUnderScore}
                                                            rules={{
                                                                required: error.NAME,
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
                                                            maxLength={regex.MAX_LENGTH75}
                                                            required
                                                            isSpecialCharacter={false}
                                                            rules={{
                                                                required: error.ENTER_BRAND,
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
                                                        // rules={rules.LIST_NAME_RULES(error.FORM_NAME)}
                                                        // customErrorMessage={error.FORM_NAME}
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
                                                                required: error.UPLOAD_LOGO,
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
                                                                    className={`${icons.restart_large} color-primary-blue icon-md`}
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
                                                    maxLength={regex.MAX_LENGTH500}
                                                    required
                                                />
                                                <small className="text-end fs11">{description?.length}/{regex.MAX_LENGTH500}</small>
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
                                                            maxLength={regex.MAX_LENGTH100}
                                                            required
                                                            rules={{
                                                                required: error.NAME,
                                                            }}
                                                        />
                                                    </Col>
                                                    <Col sm={4} id="rs_CreateBrand_emailId">
                                                        <RSInput
                                                            name="emailId"
                                                            control={control}
                                                            placeholder=" Email ID"
                                                            type="email"
                                                            maxLength={regex.MAX_LENGTH100}
                                                            required
                                                            rules={{
                                                                required: error.ENTER_EMAIL,
                                                                pattern: {
                                                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                                    message: error.INVALID_EMAIL,
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
                                                            rules={{ required: error.ENTER_PHONE }}
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
                                                            rules={{
                                                                required: error.ENTER_CATEGORY || 'Category',
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
                                                            rules={{
                                                                required: error.ENTER_SUBCATEGORY,
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
                                                                required: error.SELECT_CURRENCY || 'Select currency',
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
                                                    maxLength={regex.MAX_LENGTH255}
                                                    required
                                                    rules={{
                                                        required: error.ENTER_ADDRESS,
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
                                                                required: error.SELECT_COUNTRY || 'Select country',
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
                                                            maxLength={regex.MAX_LENGTH50}
                                                            required
                                                            onKeyDown={onKeyChar}
                                                            rules={{
                                                                required: error.ENTER_CITY,
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
                                                            maxLength={regex.MAX_LENGTH75}
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
                                                            maxLength={regex.MAX_LENGTH75}
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
                    <RSSecondaryButton type="button" onClick={onCancel} id={cancelButtonId}>
                        {cancelLabel}
                    </RSSecondaryButton>
                    <RSPrimaryButton
                        type="submit"
                        id={saveButtonId}
                        disabled={isSaving}
                        disabledClass={!isValid || isSaving ? 'pe-none click-off' : ''}
                    >
                        {submitLabel}
                    </RSPrimaryButton>
                </div>
            </form>
            {getWarningPopupMessage(failureApiErrors, dispatch)}
        </FormProvider>
    );
};

BrandOfferForm.propTypes = {
    brandId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    submitLabel: PropTypes.string,
    cancelLabel: PropTypes.string,
    isSaving: PropTypes.bool,
    isActive: PropTypes.bool,
    saveButtonId: PropTypes.string,
    cancelButtonId: PropTypes.string,
};

export default BrandOfferForm;
