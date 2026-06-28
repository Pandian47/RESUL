import { charNumUnderScore, onKeyChar } from 'Utils/modules/inputValidators';
import { LIST_NAME_RULES } from 'Constants/GlobalConstant/Rules';
import { encodeUrl, getUserDetails } from 'Utils/modules/crypto';
import { getmasterData } from 'Utils/modules/masterData';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { MAX_LENGTH100, MAX_LENGTH255, MAX_LENGTH50, MAX_LENGTH500, MAX_LENGTH75 } from 'Constants/GlobalConstant/Regex';
import { ENTER_ADDRESS, ENTER_CATEGORY, ENTER_CITY, ENTER_EMAIL, ENTER_PHONE, ENTER_SHORT_NAME, ENTER_SUBCATEGORY, ENTER_VALID_EMAIL_ADDRESS, NAME, SELECT_BRAND, SELECT_COUNTRY, SELECT_CURRENCY, UPLOAD_LOGO } from 'Constants/GlobalConstant/ValidationMessage';
import { CANCEL, SAVE, UPDATE } from 'Constants/GlobalConstant/Placeholders';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FormProvider, useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import RSPageHeader from 'Components/RSPageHeader';
import RSInput from 'Components/FormFields/RSInput';
import RSTextarea from 'Components/FormFields/RSTextarea';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
import RSFileUpload from 'Components/FormFields/RSFileUpload';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { getSessionId } from 'Reducers/globalState/selector';

import { fetchOfferBrand, fetchOfferStore, saveStoreOffer, duplicateStore, fetchOfferCategory, fetchOfferSubCategory } from 'Reducers/preferences/OfferManagements/request';
import { update_failures_API_Errors } from 'Reducers/globalState/reducer';
import useQueryParams from 'Hooks/useQueryParams';
import { INITIAL_STATE, STATUS_OPTIONS, buildShopPayload, getShopStateObject } from './constant';
import { getOfferCategorySelectionKey } from '../constant';
import RSReactPhoneInput from 'Components/FormFields/RSPhoneInput/RSReactPhoneInput';
import ListNameExists from 'Components/ListNameExists';

import useApiLoader from 'Hooks/useApiLoader';
import usePreferencesSubPageApi, { PREFERENCES_SUBPAGE_LOADER_CONFIG } from 'Hooks/usePreferencesSubPageApi';
import PreferencesSubPageSkeletonGate from 'Components/Skeleton/Components/PreferencesSubPageSkeletonGate';
import { PREFERENCES_SUBPAGE_VARIANT } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';

const CreateShop = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const { currencyMasterList, countryMasterList } = getmasterData() || {};
    const userDetail = getUserDetails();
    const queryState = useQueryParams('/preferences/offer-management');
    const tabIndex = queryState?.index !== undefined ? queryState.index : 1; // Default to tab 1 (Brands & Shops)
    const shopQueryParams = useQueryParams('/preferences');
    const shopId = shopQueryParams?.shopId;
    const brandIdFromQuery = shopQueryParams?.brandId;
    const shopIdNumber = shopId ? Number(shopId) : null;
    const brandIdNumber = brandIdFromQuery ? Number(brandIdFromQuery) : null;
    const [isFormPopulated, setIsFormPopulated] = useState(() => !shopId);
    // Compute backPath with encrypted query string
    const getBackPath = useCallback(() => {
        const state = { index: tabIndex };
        const encryptState = encodeUrl(state);
        return `/preferences/offer-management?q=${encryptState}`;
    }, [tabIndex]);
    const [brandList, setBrandList] = useState([]);
    const [categoryList, setCategoryList] = useState([]);
    const [subCategoryList, setSubCategoryList] = useState([]);
    const categoryListRef = useRef([]);
    const brandListRef = useRef([]);
    // Keep refs in sync with state
    useEffect(() => {
        categoryListRef.current = categoryList;
    }, [categoryList]);
    useEffect(() => {
        brandListRef.current = brandList;
    }, [brandList]);
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

    const brand = watch('brand');
    const description = watch('description');
    const category = watch('category');
    const getSubCategoryValue = watch('subCategory');
    const image = watch('image');
    const dialCode = useRef('');
    const hasFetchedShopData = useRef(false);
    const hasPopulatedFormRef = useRef(false);
    const lastSubCategoryFetchKeyRef = useRef('');

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
        if (shopId == null) {
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
                setValue('country', matchedCountry)
            }

            if (matchedCurrency) {
                setValue('currency', matchedCurrency)
            }
        }

    }, []);

    useEffect(() => {

        if (shopId != null) {
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


    const isEditShop = Boolean(shopIdNumber && !Number.isNaN(shopIdNumber));

    const subCategoryApi = useApiLoader({
        autoFetch: false,
        loaderConfig: PREFERENCES_SUBPAGE_LOADER_CONFIG,
        mode: 'create',
    });

    const createShopApi = usePreferencesSubPageApi({
        enabled: Boolean(departmentId && clientId && userId),
        mode: shopIdNumber && !Number.isNaN(shopIdNumber) ? 'edit' : 'create',
        deps: [departmentId, clientId, userId, shopIdNumber, brandIdNumber],
        fetcher: async () => {
            const payload = { departmentId, clientId, userId };
            const brandPayload = { ...payload, mode: 0 };
            const [brandRes, categoryRes] = await Promise.all([
                dispatch(fetchOfferBrand(brandPayload, false)),
                dispatch(fetchOfferCategory(payload)),
            ]);

            let brands = [];
            let categories = [];
            if (brandRes?.status && brandRes?.data) {
                brands = Array.isArray(brandRes.data) ? brandRes.data : [];
                setBrandList(brands);
                brandListRef.current = brands;
            }
            if (categoryRes?.status && categoryRes?.data) {
                categories = Array.isArray(categoryRes.data) ? categoryRes.data : [];
                setCategoryList(categories);
                categoryListRef.current = categories;
            }

            if (
                shopIdNumber &&
                !Number.isNaN(shopIdNumber) &&
                brandIdNumber &&
                !Number.isNaN(brandIdNumber)
            ) {
                const shopPayload = {
                    departmentId,
                    clientId,
                    userId,
                    brandId: brandIdNumber,
                    storeId: shopIdNumber,
                    mode: 0,
                };
                const { data, status, message = 'No data available' } = await dispatch(
                    fetchOfferStore(shopPayload, false),
                );
                if (status && data) {
                    const shopDataToUse = Array.isArray(data) ? data : data;
                    setEditedData(shopDataToUse);
                    if (!hasPopulatedFormRef.current) {
                        const stateObject = getShopStateObject({
                            shopData: shopDataToUse,
                            brandList: brands,
                            currencyMasterList,
                            countryMasterList,
                            brandId: brandIdNumber,
                            categoryList: categories,
                            subCategoryList: [],
                        });
                        for (const [key, val] of Object.entries(stateObject)) {
                            setValue(key, val, { shouldValidate: false, shouldDirty: false });
                        }
                        hasPopulatedFormRef.current = true;
                        hasFetchedShopData.current = true;
                    }
                } else {
                    dispatch(
                        update_failures_API_Errors({
                            field: 'FetchOfferStore',
                            message: message || 'No data available',
                        }),
                    );
                }
                setIsFormPopulated(true);
            } else {
                hasPopulatedFormRef.current = false;
                hasFetchedShopData.current = false;
                setIsFormPopulated(true);
            }

            return { brandRes, categoryRes };
        },
    });

    const showCreateShopPageSkeleton = isEditShop && (createShopApi.isPageLoading || !isFormPopulated);
    const bootstrapFieldLoading = createShopApi.isLoading;

    // Apply brand from CreateOffer if coming from there
    useEffect(() => {
       // debugger
        if (location?.state?.offerFormData?.brand && brandList.length > 0 && !shopId) {
           // debugger
            setValue('brand', location.state.offerFormData?.brand);
        }
    }, [location?.state?.offerFormData?.brand, brandList, setValue, shopId]);

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
            fetcher: () => dispatch(fetchOfferSubCategory({ departmentId, clientId, userId, categoryId })),
            onSuccess: async (subCategoryRes) => {
                if (subCategoryRes?.status && subCategoryRes?.data) {
                    const fetchedSubCategories = Array.isArray(subCategoryRes.data) ? subCategoryRes.data : [];
                    setSubCategoryList(fetchedSubCategories);
                    if (shopId && hasFetchedShopData.current && hasPopulatedFormRef.current) {
                        const shopPayload = {
                            departmentId,
                            clientId,
                            userId,
                            brandId: brandIdFromQuery,
                            storeId: shopId,
                            mode: 0,
                        };
                        const { data: shopDataResponse, status: shopStatus } = await dispatch(
                            fetchOfferStore(shopPayload, false),
                        );
                        if (shopStatus && shopDataResponse) {
                            const shopDataToUse = Array.isArray(shopDataResponse)
                                ? shopDataResponse
                                : shopDataResponse;
                            const stateObject = getShopStateObject({
                                shopData: shopDataToUse,
                                brandList: brandListRef.current,
                                currencyMasterList,
                                countryMasterList,
                                brandId: brandIdFromQuery,
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
    }, [category, departmentId, clientId, userId, brandIdFromQuery, shopId, dispatch, setValue]);

    // Reset populated form ref when shopId changes
    useEffect(() => {
        hasPopulatedFormRef.current = false;
        hasFetchedShopData.current = false;
        lastSubCategoryFetchKeyRef.current = '';
        setIsFormPopulated(!shopId);
    }, [shopId]);

    const handleSave = async (data) => {
        const payload = buildShopPayload(data, clientId, departmentId, userId, shopId);
        const res = await saveApi.refetch({
            fetcher: () => dispatch(saveStoreOffer(payload, false)),
            loaderConfig: PREFERENCES_SUBPAGE_LOADER_CONFIG,
            mode: shopIdNumber && !Number.isNaN(shopIdNumber) ? 'edit' : 'create',
        });
        if (res?.status) {
            // Check if we came from CreateOffer
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
                    field: 'SaveStoreOffer',
                    message: res?.message || 'No data available',
                }),
            );
        }
    };

    const saveApi = useApiLoader({
        autoFetch: false,
        loaderConfig: PREFERENCES_SUBPAGE_LOADER_CONFIG,
        mode: shopIdNumber && !Number.isNaN(shopIdNumber) ? 'edit' : 'create',
    });
    const isSaveLoading = saveApi.isFetching;

    const handleLogoUpload = async (base64Image, fileName, contentLength) => {
        if (!fileName || !base64Image) return;

        // Format base64 as data URI if it's not already formatted
        const imageFormat = fileName.split('.')?.pop()?.toLowerCase() || 'png';
        const formattedBase64 = base64Image.startsWith('data:')
            ? base64Image
            : `data:image/${imageFormat};base64,${base64Image}`;

        // Set base64 data directly without API call
        setValue('image', formattedBase64);
        clearErrors('image');
    };

    return (
        <FormProvider {...methods}>
            <div className="page-content-holder">
                <RSPageHeader
                    title={shopId ? "Edit shop" : "Add shop"}
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
                                variant={PREFERENCES_SUBPAGE_VARIANT.CREATE_SHOP}
                                isLoading={showCreateShopPageSkeleton}
                            >
                            <form onSubmit={handleSubmit(handleSave)}>
                                <div className="box-design rs-box py40">
                                    {/* Select Brand - full row */}
                                    <div className="form-group">
                                        <Row>
                                            <Col sm={4} className="text-right">
                                                <label className="control-label-left">Brand</label>
                                            </Col>
                                            <Col sm={7} id="rs_CreateShop_brand">
                                                <RSKendoDropdown
                                                    name="brand"
                                                    data={brandList || []}
                                                    textField="legalName"
                                                    dataItemKey="brandID"
                                                    control={control}
                                                    label="Brand"
                                                    placeholder="Brand"
                                                    required
                                                    isLoading={bootstrapFieldLoading}
                                                    rules={{
                                                        required: SELECT_BRAND || 'Select a brand',
                                                    }}
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                    {/* Shop Short Name and Shop Legal Name - 2 columns */}
                                    <div className={`${brand != null ? '' : 'click-off'} form-group`}>
                                        <Row>
                                            <Col sm={4} className="text-right">
                                                <label className="control-label-left">Shop short name / Shop legal name</label>
                                            </Col>
                                            <Col sm={7}>
                                                <Row>
                                                    <Col sm={6} id="rs_CreateShop_shortName">
                                                        <ListNameExists
                                                            name="shortName"
                                                            field={'storeName'}
                                                            control={control}
                                                            placeholder="Shop short name" 
                                                            maxLength={MAX_LENGTH75}
                                                            required
                                                            onKeyDown={charNumUnderScore}
                                                            isSpecialCharacter={false}
                                                            rules={{
                                                                required: ENTER_SHORT_NAME,
                                                                // pattern: {
                                                                //     value: /^[a-zA-Z0-9\-_ ]*$/,
                                                                //     message: 'Only numbers & (.) are allowed',
                                                                // },
                                                            }}
                                                            // onValid={(valid) => setIsValidListname(valid)}
                                                            apiCallback={duplicateStore}
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
                                                            extraPayload={{ clientId, departmentId, userId, legalStoreName: '', brandID: brand?.brandID }}
                                                            nameExists={nameExists}
                                                        // rules={LIST_NAME_RULES(FORM_NAME)}
                                                        // customErrorMessage={FORM_NAME}
                                                        />
                                                    </Col>

                                                    <Col sm={6} id="rs_CreateShop_shortName">

                                                        <ListNameExists
                                                            name="legalName"
                                                            field={'legalStoreName'}
                                                            control={control}
                                                            placeholder="Shop legal name"
                                                            maxLength={MAX_LENGTH75}
                                                            required
                                                            rules={{
                                                                required: NAME,
                                                                // pattern: {
                                                                //     value: /^[a-zA-Z0-9\-_ ]*$/,
                                                                //     message: 'Only numbers & (.) are allowed',
                                                                // },
                                                            }}
                                                            isSpecialCharacter={false}
                                                            // onValid={(valid) => setIsValidListname(valid)}
                                                            apiCallback={duplicateStore}
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
                                                            extraPayload={{ clientId, departmentId, userId, storeName: '', brandID: brand?.brandID }}
                                                            nameExists={nameExists}
                                                        // rules={LIST_NAME_RULES(FORM_NAME)}
                                                        // customErrorMessage={FORM_NAME}
                                                        />
                                                    </Col>

                                                    {/* <Col sm={6} id="rs_CreateShop_legalName">
                                                        <RSInput
                                                            name="legalName"
                                                            control={control}
                                                            placeholder="Shop legal name"
                                                            maxLength={MAX_LENGTH75}
                                                            required
                                                            onKeyDown={charNumUnderScore}
                                                            rules={{
                                                                required: NAME,
                                                            }}
                                                        />
                                                    </Col> */}
                                                </Row>
                                            </Col>
                                        </Row>
                                    </div>

                                    {/* Shop image - full row */}

                                    <div className={`${brand != null ? '' : 'click-off'} form-group`}>
                                        <Row>
                                            <Col sm={4} className="text-right">
                                                <label className="control-label-left">Shop image</label>
                                            </Col>
                                            <Col sm={7} id="rs_CreateBrand_logo">
                                                <Row>
                                                    <Col sm={image ? 11 : 12}>
                                                        <RSFileUpload
                                                            name="image"
                                                            control={control}
                                                            setError={setError}
                                                            clearErrors={clearErrors}
                                                            text="Browse"
                                                            placeholder="Choose image"
                                                            accept=".jpg,.jpeg,.png"
                                                            isbase64={true}
                                                            fileType="img"
                                                            watch={watch}
                                                            isRefresh={!!image}
                                                            isBase64Status={true}
                                                            isPrefix={true}
                                                            base64Data={handleLogoUpload}
                                                            required
                                                            rules={{
                                                                required: UPLOAD_LOGO,
                                                            }}
                                                            resetValue={() => {
                                                                setValue('image', '');
                                                            }}
                                                        /></Col>
                                                    {image && (
                                                        <Col sm={1} className='d-flex align-items-center gap-3 p-0 brand-preview-logo mt-26' >
                                                            <img
                                                                src={image}
                                                                alt="Logo"
                                                            />
                                                        </Col>
                                                    )}
                                                </Row>

                                            </Col>

                                        </Row>
                                    </div>

                                    {/* Description - textarea - full row */}
                                    <div className={`${brand != null ? '' : 'click-off'} form-group`}>
                                        <Row>
                                            <Col sm={4} className="text-right">
                                                <label className="control-label-left">Description</label>
                                            </Col>
                                            <Col sm={7} id="rs_CreateShop_description">
                                                <RSTextarea
                                                    name="description"
                                                    control={control}
                                                    placeholder="Description"
                                                    maxLength={MAX_LENGTH500}
                                                    required
                                                />
                                                <small className="text-end fs11">{description?.length}/{MAX_LENGTH500}</small>
                                            </Col>
                                        </Row>
                                    </div>

                                    {/* Contact Name, Email ID, Mobile No - 3 columns */}
                                    <div className={`${brand != null ? '' : 'click-off'} form-group`}>
                                        <Row>
                                            <Col sm={4} className="text-right">
                                                <label className="control-label-left">Contact name / Email ID / Mobile No</label>
                                            </Col>
                                            <Col sm={7}>
                                                <Row>
                                                    <Col sm={4} id="rs_CreateShop_contactName">
                                                        <RSInput
                                                            name="contactName"
                                                            control={control}
                                                            placeholder="Contact name"
                                                            maxLength={MAX_LENGTH100}
                                                            required
                                                            rules={{
                                                                required: NAME,
                                                            }}
                                                        />
                                                    </Col>
                                                    <Col sm={4} id="rs_CreateShop_emailId">
                                                        <RSInput
                                                            name="emailId"
                                                            control={control}
                                                            placeholder="Email ID"
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
                                                    <Col sm={4} id="rs_CreateShop_mobileNo">
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
                                    <div className={`${brand != null ? '' : 'click-off'} form-group`}>
                                        <Row className='align-items-end'>
                                            <Col sm={4} className="text-right">
                                                <label className="control-label-left">Category / Subcategory / Currency</label>
                                            </Col>
                                            <Col sm={7}>
                                                <Row className='align-items-end'>
                                                    <Col sm={4} id="rs_CreateShop_category">
                                                        <RSMultiSelect
                                                            name="category"
                                                            data={categoryList?.filter((item) => {
                                                                const brandIds =
                                                                    brand?.categoryID
                                                                        ?.split(',')
                                                                        ?.map((id) => Number(id.trim()))
                                                                        ?.filter((id) => !Number.isNaN(id)) || [];

                                                                const itemId = Number(item?.categoryID);

                                                                return brandIds?.includes(itemId);
                                                            })}                                                            
                                                            textField="categoryName"
                                                            dataItemKey="categoryID"
                                                            control={control}
                                                            label="Category"
                                                            placeholder=" Category"
                                                            required
                                                            isLoading={bootstrapFieldLoading}
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
                                                            }}
                                                        />
                                                    </Col>
                                                    <Col sm={4} id="rs_CreateShop_subCategory">
                                                        <RSMultiSelect
                                                            name="subCategory"
                                                            control={control}
                                                            data={subCategoryData?.filter((item) => {
                                                                const brandSubIds =
                                                                    brand?.subCategoryID
                                                                        ?.split(',')
                                                                        ?.map((id) => Number(id.trim()))
                                                                        ?.filter((id) => !Number.isNaN(id)) || [];

                                                                const itemId = Number(item?.subCategoryID);

                                                                return brandSubIds?.includes(itemId);
                                                            })}
                                                            textField="subCategoryName"
                                                            dataItemKey="subCategoryID"
                                                            label="Subcategory"
                                                            placeholder="Select Subcategory"
                                                            required
                                                            isLoading={subCategoryApi.isLoading}
                                                            rules={{
                                                                required: ENTER_SUBCATEGORY,
                                                            }}
                                                            disabled={!category}
                                                        />
                                                    </Col>
                                                    <Col sm={4} id="rs_CreateShop_currency">
                                                        <RSKendoDropdown
                                                            name="currency"
                                                            data={currencyMasterList || []}
                                                            textField="currencyName"
                                                            dataItemKey="currencyID"
                                                            control={control}
                                                            label="Currency"
                                                            placeholder="Select Currency"
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
                                    <div className={`${brand != null ? '' : 'click-off'} form-group`}>
                                        <Row>
                                            <Col sm={4} className="text-right">
                                                <label className="control-label-left">Address</label>
                                            </Col>
                                            <Col sm={7} id="rs_CreateShop_address">
                                                <RSInput
                                                    name="address"
                                                    control={control}
                                                    placeholder="Address"
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
                                    <div className={`${brand != null ? '' : 'click-off'} form-group`}>
                                        <Row>
                                            <Col sm={4} className="text-right">
                                                <label className="control-label-left">City / Country / Status</label>
                                            </Col>
                                            <Col sm={7}>
                                                <Row>
                                                    <Col sm={4} id="rs_CreateShop_city">
                                                        <RSInput
                                                            name="city"
                                                            control={control}
                                                            placeholder="City"
                                                            maxLength={MAX_LENGTH50}
                                                            required
                                                            onKeyDown={onKeyChar}
                                                            rules={{
                                                                required: ENTER_CITY,
                                                            }}
                                                        />
                                                    </Col>
                                                    <Col sm={4} id="rs_CreateShop_country">
                                                        <RSKendoDropdown
                                                            name="country"
                                                            data={countryMasterList || []}
                                                            textField="country"
                                                            dataItemKey="countryID"
                                                            control={control}
                                                            label="Country"
                                                            placeholder="Select Country"
                                                            required
                                                            rules={{
                                                                required: SELECT_COUNTRY || 'Select country',
                                                            }}
                                                        />
                                                    </Col>
                                                    <Col sm={4} id="rs_CreateShop_status">
                                                        <RSKendoDropdown
                                                            name="status"
                                                            data={STATUS_OPTIONS}
                                                            textField="name"
                                                            dataItemKey="id"
                                                            control={control}
                                                            label="Status"
                                                            placeholder="Select Status"
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

                                    {/* Latitude / Longitude */}
                                    <div className={`${brand != null ? '' : 'click-off'} form-group`}>
                                        <Row>
                                            <Col sm={4} className="text-right">
                                                <label className="control-label-left">Latitude / Longitude</label>
                                            </Col>
                                            <Col sm={7}>
                                                <Row>

                                                    {/* Latitude */}
                                                    <Col sm={6}>
                                                        <RSInput
                                                            name="latitude"
                                                            control={control}
                                                            placeholder="Latitude"
                                                            maxLength={MAX_LENGTH75}
                                                            required
                                                            rules={{
                                                                required: "Enter latitude",
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
                                                    <Col sm={6}>
                                                        <RSInput
                                                            name="longitude"
                                                            control={control}
                                                            placeholder="Longitude"
                                                            maxLength={MAX_LENGTH75}
                                                            required
                                                            rules={{
                                                                required: "Enter longitude",
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
                                        id="rs_CreateShop_Cancel"
                                    >
                                        {CANCEL}
                                    </RSSecondaryButton>
                                    <RSPrimaryButton
                                        type="submit"
                                        id="rs_CreateShop_Save"
                                        disabledClass={!isValid ? 'pe-none click-off' : ''}
                                        isLoading={isSaveLoading}
                                        blockBodyPointerEvents={isSaveLoading}
                                    >
                                        {shopId ? UPDATE : SAVE}
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

export default CreateShop;
