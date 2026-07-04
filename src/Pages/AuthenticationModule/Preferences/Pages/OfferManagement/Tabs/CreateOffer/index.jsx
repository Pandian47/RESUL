import { getUserDetails } from 'Utils/modules/crypto';
import { convertUTCtoUserTimezone } from 'Utils/modules/dateTime';
import { truncateTitle } from 'Utils/modules/displayCore';
import { charNumUnderScore, onlyNumbers } from 'Utils/modules/inputValidators';
import { getmasterData } from 'Utils/modules/masterData';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { ADD_OFFER_CODE_OPTIONS, ALL_DAYS_ID, DAYS_OF_WEEK_OPTIONS, FORMAT_DATE, FORMAT_LABEL_CAPITAL, FORMAT_LABEL_NUMBER, FORMAT_LABEL_SMALL, INITIAL_STATE, LIMIT_BY_DURATION_OPTIONS, PERCENTAGE_OR_AMOUNT_OPTIONS, RESETCOMMON, RESET_ADDOFFER_FROM, RESET_FIELDS, RESET_OFFERTYPES, RESET_OFFER_TYPE, REWARD_OPTIONS, WEEKDAYS_ID, WEEKDAY_IDS, WEEKENDS_ID, WEEKEND_IDS, buildCreateOfferPayload, getChars, getOfferCategorySelectionKey, getOneEightyDays, getSateObject, parseOfferCategoryIdKeys, parseOfferSubCategoryIdKeys } from '../constant';
import { MAX_LENGTH100, MAX_LENGTH15, MAX_LENGTH255, MAX_LENGTH5, MAX_LENGTH75 } from 'Constants/GlobalConstant/Regex';
import { CODE_PATTERN as CODE_PATTERN_MSG, COMPOSE_USING as COMPOSE_USING_MSG, ENTER_DISCOUNT_PERCENTAGE, ENTER_DISCOUNT_VALUE, ENTER_DISPLAY_NAME, ENTER_LENGTH_3_TO_12, ENTER_MAXIMUM_DISCOUNT_CAP, ENTER_MINIMUM_PURCHASE_CAP, ENTER_MINIMUM_PURCHASE_VALUE, ENTER_TOTAL_REDEMPTION, ENTER_USAGE_CLAIM_LIMIT, ENTER_VALID_VOLUME, LENGTH as LENGTH_MSG, OFFER_CODE as OFFER_CODE_MSG, OFFER_CODE_TYPE as OFFER_CODE_TYPE_MSG, OFFER_NAME, OFFER_TYPE as OFFER_TYPE_MSG, SELECT_BRAND, SELECT_CAT_TYPE, SELECT_COMMUNICATION_TYPE, SELECT_CURRENCY, SELECT_DISPLAY_AS, SELECT_END_DATE, SELECT_LIMIT_BY_DURATION, SELECT_PERCENTAGE_OR_AMOUNT, SELECT_PRODUCT_TYPE, SELECT_REFEREE_REWARD, SELECT_REFERRER_REWARD, SELECT_START_DATE, UPLOAD_BANNER_IMAGE, UPLOAD_LOGO, VALUE_CANNOT_BE_ZERO, VOLUME } from 'Constants/GlobalConstant/ValidationMessage';
import { ADD_OFFER_FORMAT, ARE_YOU_SURE_WANT_TO_RESET, BAR_CODE, CANCEL, CODE_LENGTH, CODE_PATTERN, CODE_VOLUME, COMMON_TEXT, COMMUNIITON_PRODUCT_POPHOVER_TEXT, COMPOSE_USING, DISPLAY_AS, DISPLAY_NAME_LABEL, DISPLAY_NAME_PLACEHOLDER, END_DATE, HASHES_CHARACTERS, LENGTH, LOGO_LABEL, OFFER_CODE, OFFER_CODE_CHARACTER_LIMIT, OFFER_CODE_TYPE, OFFER_DURATION, OFFER_MANAGEMENT_OFFER_NAME, OFFER_TYPE, PREVIEW, PREVIEW_IMAGE, PRODUCTType, QR_CODE, RESET, SAVE, SELECT_ATLEAST_ONE, START_DATE, TEXT, THE_NUMBER_OF_OFFERS, UNIQUE_TEXT, UPDATE, VOLUME_LENGTH } from 'Constants/GlobalConstant/Placeholders';
import { circle_minus_fill_medium, circle_plus_fill_edge_medium, circle_question_mark_mini, restart_large, restart_medium, settings_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, Col, Container, Row, Carousel } from 'react-bootstrap';
import { FormProvider, useForm, useFieldArray } from 'react-hook-form';
import RSInput from 'Components/FormFields/RSInput';
import RSDatePicker from 'Components/FormFields/RSDatePicker';
import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
import RSRadioButton from 'Components/FormFields/RSRadioButton';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import RSPageHeader from 'Components/RSPageHeader';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import RSTextarea from 'Components/FormFields/RSTextarea';
import RSFileUpload from 'Components/FormFields/RSFileUpload';
import RSKendoTextEditor from 'Components/FormFields/RSKendoTextEditor';
import RSTimePicker from 'Components/FormFields/RSTimePicker';
import RSTabbar from 'Components/RSTabber';

import { Barcode, QRcode } from 'Assets/Images';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';

import { EditorTools } from '@progress/kendo-react-editor';
import { useLocation, useNavigate } from 'react-router-dom';
import RSPPophover from 'Components/RSPPophover';
import RSTooltip from 'Components/RSTooltip';
import NewAttributeBtn from 'Pages/AuthenticationModule/Audience/Pages/AddImportAudience/Components/CustomHeaderColumn/NewAttributeBtn';
import SnippetTemplate from './Components/SnippetTemplate';
import { checkOfferNameExists, fetchOffer, getOfferType, createOffer, offerListPublishApi, fetchOfferBrand, fetchOfferStore, fetchOfferCategory, fetchOfferSubCategory } from 'Reducers/preferences/OfferManagements/request';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId, getUtcTimeData } from 'Reducers/globalState/selector';
import { clearOfferManageMent, getOfferManagement } from 'Reducers/preferences/OfferManagements/reducer';
import {
    communicationAttributes,
    getCommunicationProductsList,
} from 'Reducers/analytics/communicationAnalytics/request';
import { getCommunicationSubProducts } from 'Reducers/communication/createCommunication/plan/request';
import useQueryParams from 'Hooks/useQueryParams';
import ListNameExists from 'Components/ListNameExists';
import { update_failures_API_Errors } from 'Reducers/globalState/reducer';
import RSConfirmationModal from 'Components/ConfirmationModal';

import parse from 'html-react-parser';
import { getUtcTimeNow } from 'Reducers/globalState/request';
import { CommonSkeleton } from 'Components/Skeleton/Components/SkeletonOverall';
import RSKendoDropdownList from 'Components/FormFields/RSKendoDropdown';
import useApiLoader from 'Hooks/useApiLoader';
import usePreferencesSubPageApi, { PREFERENCES_SUBPAGE_LOADER_CONFIG } from 'Hooks/usePreferencesSubPageApi';
import PreferencesSubPageSkeletonGate from 'Components/Skeleton/Components/PreferencesSubPageSkeletonGate';
import { PREFERENCES_SUBPAGE_VARIANT } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';

var existingListName = '';

// Text editor tools without ImageUpload
const { Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, OrderedList, UnorderedList, Link, Unlink } = EditorTools;
const textEditorToolsWithoutImage = [
    [Bold, Italic, Underline, Strikethrough],
    [Link, Unlink],
    [OrderedList, UnorderedList],
    [AlignLeft, AlignCenter, AlignRight],
];

const OFFER_CONTENT_TAB_FIELDS = {
    description: 0,
    offerDetails: 1,
    termsAndConditions: 2,
};

const FORM_FIELD_ORDER = [
    'offerName',
    'communicationType',
    'brand',
    'shop',
    'productType',
    'subProductType',
    'category',
    'subCategory',
    'offerDurationStartDate',
    'offerDurationEndDate',
    'offerType',
    'discountValue',
    'currency',
    'minimumPurchaseValue',
    'discountPercentage',
    'currencyFlatDiscount',
    'minimumPurchaseValueFlatDiscount',
    'maximumDiscountCap',
    'bundleItems',
    'offerPriceDiscount',
    'minimumQuantityDiscount',
    'buyProduct',
    'getProduct',
    'buyQuantity',
    'getQuantity',
    'discountOnFreeItem',
    'percentageOrAmount',
    'referrerReward',
    'refereeReward',
    'minimumPurchaseCap',
    'percentageOrAmountReferral',
    'usageClaimLimit',
    'limitByDuration',
    'totalRedemption',
    'applicableDays',
    'applicableStartTime',
    'applicableEndTime',
    'logo',
    'displayName',
    'bannerImages',
    'previewImage',
    'description',
    'offerDetails',
    'termsAndConditions',
    'mediaTypeCode',
    'mediaTypeSnippet',
    'offerCodeType',
    'offerCode',
    'volume',
    'length',
    'formatCapital',
    'formatSmall',
    'formatNumber',
    'composeUsing',
    'codePattern',
    'display',
];

const collectFormErrorPaths = (errs, path = '') => {
    const paths = [];
    if (!errs || typeof errs !== 'object') return paths;

    for (const k of Object.keys(errs)) {
        const fieldPath = path ? `${path}.${k}` : k;
        if (errs[k]?.message) {
            paths.push(fieldPath);
        } else if (Array.isArray(errs[k])) {
            errs[k].forEach((item, index) => {
                paths.push(...collectFormErrorPaths(item, `${fieldPath}.${index}`));
            });
        } else {
            paths.push(...collectFormErrorPaths(errs[k], fieldPath));
        }
    }

    return paths;
};

const getFirstFormErrorPath = (errs) => {
    const paths = collectFormErrorPaths(errs);
    if (!paths.length) return null;

    const orderIndex = (fieldPath) => {
        const root = fieldPath.split('.')[0];
        const idx = FORM_FIELD_ORDER.indexOf(root);
        return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
    };

    return [...paths].sort((a, b) => orderIndex(a) - orderIndex(b))[0];
};

const scrollElementIntoView = (el) => {
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

const CreateOffer = () => {
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const dispatch = useDispatch();
    const utcTimeData = useSelector((state) => getUtcTimeData(state));
    const { currencyMasterList, countryMasterList } = getmasterData() || {};
    const userDetail = getUserDetails();
    const { getOfferTypeData, getCommunicationType, getProductType, getCategory, getSubCategory, getSubProductType, getEditedData } = useSelector(
        (state) => state.offerMangementReducer,
    );
    const [currentStep, setCurrentStep] = useState(1);
    // Get communication plan reducer data (for checking existing data)
    const { communicationOptions } = useSelector(({ communicationPlanReducer }) => communicationPlanReducer);
    const { product: existingProductType = [], attributes: existingCommunicationType = [] } = communicationOptions;
    const navigate = useNavigate();
    const location = useLocation();
    const offerIdFromQuery = useQueryParams('/preferences');

    const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const offerIdFromUrl = searchParams.get('offerId');
    const snippetIdFromUrl = searchParams.get('snippetId');
    const getIsEdit = searchParams.get('isEdit');

    const offerIdFromUrlNumber = offerIdFromUrl ? Number(offerIdFromUrl) : null;
    const snippetIdFromUrlNumber = snippetIdFromUrl ? Number(snippetIdFromUrl) : null;
    const offerId = useMemo(() => {
        if (offerIdFromUrlNumber) {
            return { offerId: offerIdFromUrlNumber };
        } else if (offerIdFromQuery?.offerId) {
            const queryOfferId = typeof offerIdFromQuery.offerId === 'string' ? Number(offerIdFromQuery.offerId) : offerIdFromQuery.offerId;
            return { offerId: queryOfferId };
        }
        return offerIdFromQuery;
    }, [offerIdFromUrlNumber, offerIdFromQuery]);

    // Extract snippetId from URL or query params
    const snippetIdFromQuery = offerIdFromQuery?.snippetId;
    const snippetIdToSelect = useMemo(() => {
        if (snippetIdFromUrlNumber) {
            return snippetIdFromUrlNumber;
        } else if (snippetIdFromQuery) {
            const querySnippetId = typeof snippetIdFromQuery === 'string' ? Number(snippetIdFromQuery) : snippetIdFromQuery;
            return querySnippetId;
        }
        return null;
    }, [snippetIdFromUrlNumber, snippetIdFromQuery]);
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const editDataObj = Array.isArray(getEditedData) ? getEditedData[0] : getEditedData;
    const editName = editDataObj?.OfferName || editDataObj?.offerModel?.offerName || '';

    const [isPublished, setIsPublished] = useState('0');

    // Common validation function to check if value is zero
    const validateNotZero = (value) => {
        if (value && Number(value) === 0) {
            return VALUE_CANNOT_BE_ZERO;
        }
        return true;
    };

    const validateDiscountNotExceedingMinPurchase = (
        value,
        otherFieldName,
        valueIsDiscount
    ) => {
        const otherValue = getValues(otherFieldName);

        if (value == null || value === '' || otherValue == null || otherValue === '')
            return true;

        const numValue = Number(value);
        const numOther = Number(otherValue);

        if (Number.isNaN(numValue) || Number.isNaN(numOther)) return true;

        if (valueIsDiscount && numValue > numOther) {
            return "Discount exceeds minimum purchase.";
        }

        if (!valueIsDiscount && numOther > numValue) {
            return "Min purchase must be ≥ discount value.";
        }

        return true;
    };
    const validateMaxDiscountCap = (value) => {
        const discountPercentage = getValues('discountPercentage');
        const minimumPurchaseValue = getValues('minimumPurchaseValueFlatDiscount');

        if (!value || !discountPercentage || !minimumPurchaseValue) {
            return true;
        }

        const numValue = Number(value);
        const percentage = Number(discountPercentage);
        const minPurchase = Number(minimumPurchaseValue);

        if (Number.isNaN(numValue) || Number.isNaN(percentage) || Number.isNaN(minPurchase)) {
            return true;
        }

        const calculatedDiscount = (percentage / 100) * minPurchase;

        // Max Discount Cap should be >= calculated discount amount
        if (calculatedDiscount > numValue) {
            return "Calculated discount exceeds the Maximum Discount Cap.";
        }

        return true;
    };
    // Handler to prevent ANY space input in composeUsing field
    const preventSpaceOnlyInput = (event) => {
        // Allow control keys (Backspace, Delete, etc.)
        const controlKeys = [
            'Backspace', 'Delete', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
            'Tab', 'Escape', 'Home', 'End'
        ];

        if (controlKeys.includes(event.key)) {
            return;
        }

        // Block ALL spaces (no spaces allowed at any position)
        if (event.key === ' ') {
            event.preventDefault();
            setError('composeUsing', {
                type: 'custom',
                message: 'Empty space not allowed',
            });
            return;
        }

        // Allow Ctrl+C, Ctrl+V, Ctrl+A, Ctrl+X
        if ((event.ctrlKey || event.metaKey) && ['c', 'v', 'a', 'x'].includes(event.key.toLowerCase())) {
            return;
        }
    };

    // Handler to clear error when valid content is typed
    const handleComposeUsingChange = (e) => {
        const value = e.target.value;

        // Clear error if user has typed valid content
        if (value && value.trim().length > 0 && !value.includes(' ')) {
            clearErrors('composeUsing');
        }
    };
    const methods = useForm({
        defaultValues: {
            ...INITIAL_STATE,
            previewImage: '',
        },
        mode: 'onTouched'
    });
    const {
        control,
        handleSubmit,
        watch,
        reset,
        setValue,
        resetField,
        trigger,
        clearErrors,
        setFocus,
        setError,
        getValues,
        formState: { errors, isValid, isDirty, submitCount },
    } = methods;
    const offerNameError = Object.hasOwn(errors, 'offerName');
    const lastHandledSubmitCountRef = useRef(0);

    // Field array for banner images
    const { fields: bannerImageFields, append: appendBannerImage, remove: removeBannerImage } = useFieldArray({
        control,
        name: 'bannerImages',
    });
    const [subCategoryData, setSubCategoryData] = useState([]);

    const [formatOptions, setFormatOptions] = useState({
        formatCapital: false,
        formatNumber: false,
        formatSmall: false
    });
    const MAX_BANNER_TABS = 5;

    const [
        offerName,
        communicationType,
        offerCodeType,
        addOfferCode,
        length,
        formatCapital,
        formatSmall,
        formatNumber,
        offerDurationStartDate,
        offerDurationEndDate,
        display,
        codePattern,
        volume,
        offerType,
        previewData,
        composeUsing,
        importDescription,
        category,
        productType,
        brand,
        displayName,
        description,
        offerDetails,
        termsAndConditions,
        logo,
        previewImage,
        bannerImages,
        mediaTypeCode,
        mediaTypeSnippet,
        usageClaimLimit,
        limitByDuration,
        totalRedemption,
        applicableDays,
        applicableStartTime,
        applicableEndTime,
        discountPercentage,
        minimumPurchaseValueFlatDiscount
    ] = watch([
        'offerName',
        'communicationType',
        'offerCodeType',
        'addOfferCode',
        'length',
        'formatCapital',
        'formatSmall',
        'formatNumber',
        'offerDurationStartDate',
        'offerDurationEndDate',
        'display',
        'codePattern',
        'volume',
        'offerType',
        'previewData',
        'composeUsing',
        'importDescription',
        'category',
        'productType',
        'brand',
        'displayName',
        'description',
        'offerDetails',
        'termsAndConditions',
        'logo',
        'previewImage',
        'bannerImages',
        'mediaTypeCode',
        'mediaTypeSnippet',
        'usageClaimLimit',
        'limitByDuration',
        'totalRedemption',
        'applicableDays',
        'applicableStartTime',
        'applicableEndTime',
        'discountPercentage',
        'minimumPurchaseValueFlatDiscount'
    ]);

    const allValues = watch();
    const getDisplay = watch("display");
    const getCodePattern = watch('codePattern');
    const getOfferCode = watch('offerCode');
    const getOfferCodeType = watch('offerCodeType');

    const composeUsingValues = watch("composeUsing");

    const getFormatCapital = watch("formatCapital");
    const getFormatNumber = watch("formatNumber");
    const getFormatSmall = watch("formatSmall");
    const getlength = watch('length');

    let getselectedSnippetId = watch("selectedSnippetId");
    let getselectedSnippetName = watch("selectedSnippetName");

    const categoryValue = watch('category');
    const productTypeValue = watch('productType');
    const getSubCategoryValue = watch('subCategory');

    const descriptionValue = watch('description');
    const offerDetailsValue = watch('offerDetails');
    const termsAndConditionsValue = watch('termsAndConditions');

    const OFFER_EDITOR_MAX_LENGTH = 1000;
    const getOfferEditorTextLength = (htmlValue) =>
        (htmlValue || '')?.replace(/<[^>]*>/g, '')?.trim()?.length;



    useEffect(() => {
        if (Array.isArray(categoryValue) && categoryValue.length > 0) {
            const allSubCategories = categoryValue.flatMap(item => item.subCategory || []);
            setSubCategoryData(allSubCategories);
        } else {
            // If not array, reset
            setSubCategoryData([]);
            // setValue('subCategory', []);  // if needed
        }
    }, [categoryValue]);

    useEffect(() => {

        if (composeUsingValues?.length > 0) {

            if (!getFormatCapital && !getFormatNumber && !getFormatSmall) return;

            setValue("formatCapital", false);
            setValue("formatNumber", false);
            setValue("formatSmall", false);
        }


    }, [composeUsingValues])


    useEffect(() => {

        if (composeUsingValues?.length != 0) {
            if (getFormatCapital || getFormatNumber || getFormatSmall) {
                setValue("composeUsing", '');
            }
        }

    }, [getFormatCapital, getFormatNumber, getFormatSmall]);
    const [applicableDaysData, setApplicableDaysData] = useState(DAYS_OF_WEEK_OPTIONS);

    const [isReset, setIsReset] = useState({
        show: false,
        type: ''
    });
    const [isNotEditable, setIsNotEditable] = useState(false);
    const [refreshFlag, setRefreshFlag] = useState(false);
    const [generateFlag, setGenerateFlag] = useState(false);

    const [brandList, setBrandList] = useState([]);
    const [shopList, setShopList] = useState([]);

    const hasPopulatedFormRef = useRef(false);
    const lastOfferIdRef = useRef(null);
    const hasSetProductTypeRef = useRef(false);
    const hasSetCategoryRef = useRef(false);
    const lastSubCategoryFetchKeyRef = useRef('');
    const lastShopBrandIdRef = useRef(null);
    const lastSubProductTypeIdRef = useRef(null);

    const [templateError, setTemplateError] = useState(null);
    const [offerDescriptionError, setOfferDescriptionError] = useState('')
    const [offerDetailsError, setOfferDetailsError] = useState('')
    const [termsConditionError, setTermsConditionError] = useState('');

    const [offerContentTabIndex, setOfferContentTabIndex] = useState(0);

    const [saveBtnClick, setSaveBtnClick] = useState(false);
    const [saveBtnTemplateError, setSaveBtnTemplateError] = useState(false);
    const [submitAction, setSubmitAction] = useState(null);
    const logoErrorRef = useRef(null);
    const bannerErrorRef = useRef(null);
    const templateErrorRef = useRef(null);
    const descriptionErrorRef = useRef(null);
    const offerDetailsErrorRef = useRef(null);
    const termsAndConditionsErrorRef = useRef(null);
    const bannerConditionsErrorRef = useRef(null);
    const [bannerResetIconVisible, setBannerResetIconVisible] = useState({});
    const handleBannerResetIconVisible = useCallback((index, visible) => {
        setBannerResetIconVisible((prev) => {
            if (prev[index] === visible) return prev;
            return { ...prev, [index]: visible };
        });
    }, []);
    const [saveBtnTemplateCount, setSaveBtnTemplateCount] = useState(0);

    const scrollToOfferFormError = useCallback((formErrors) => {
        if (!formErrors || Object.keys(formErrors).length === 0) return;

        const firstErrorPath = getFirstFormErrorPath(formErrors);
        const rootField = firstErrorPath?.split('.')[0];
        const tabIndex = rootField ? OFFER_CONTENT_TAB_FIELDS[rootField] : undefined;

        const applyFocusAndScroll = () => {
            if (firstErrorPath) {
                setFocus(firstErrorPath);
            }

            if (rootField === 'bannerImages' || formErrors.bannerImages) {
                const bannerEl =
                    bannerErrorRef.current || document.getElementById('rs_CreateOffer_bannerImages');
                scrollElementIntoView(bannerEl);
                setTimeout(() => scrollElementIntoView(bannerEl), 250);
                return;
            }

            const sectionRefMap = {
                logo: logoErrorRef,
                description: descriptionErrorRef,
                offerDetails: offerDetailsErrorRef,
                termsAndConditions: bannerConditionsErrorRef,
            };

            const sectionRef = rootField ? sectionRefMap[rootField] : null;
            if (sectionRef?.current) {
                scrollElementIntoView(sectionRef.current);
                return;
            }

            if (!firstErrorPath) return;

            const nameAttr = firstErrorPath.replace(/\.(\d+)/g, (_, index) => `[${index}]`);
            const fieldEl =
                document.getElementById(`rs_CreateOffer_${rootField}`) ||
                document.querySelector(`[name="${nameAttr}"]`);
            scrollElementIntoView(fieldEl);
        };

        if (tabIndex !== undefined && tabIndex !== offerContentTabIndex) {
            setOfferContentTabIndex(tabIndex);
            setTimeout(applyFocusAndScroll, 150);
        } else {
            applyFocusAndScroll();
        }
    }, [setFocus, offerContentTabIndex]);

    const handleFormInvalid = useCallback(() => {
        setSaveBtnClick(true);
    }, []);

    useEffect(() => {
        if (submitCount <= lastHandledSubmitCountRef.current) return;

        const timer = setTimeout(() => {
            const currentErrors = methods.formState.errors;
            if (!currentErrors || Object.keys(currentErrors).length === 0) {
                lastHandledSubmitCountRef.current = submitCount;
                return;
            }

            lastHandledSubmitCountRef.current = submitCount;
            scrollToOfferFormError(currentErrors);
        }, 50);

        return () => clearTimeout(timer);
    }, [submitCount, methods, scrollToOfferFormError]);

    useEffect(() => {

        if (getselectedSnippetName && getselectedSnippetName) {

            if (templateError != null) {
                setTemplateError(null)
            }
        }



    }, [getselectedSnippetId, getselectedSnippetName,]);

    useEffect(() => {
        if (saveBtnTemplateCount === 0) return; // ignore initial mount

        // log for debugging
        if (templateError) {
            templateErrorRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [saveBtnTemplateCount, templateError]);

    // useEffect(() => {
    //     if (!saveBtnClick) return;

    //     // Reset button click flag
    //     setSaveBtnClick(false);

    //     if (logo?.message) {
    //         logoErrorRef.current?.scrollIntoView({
    //             behavior: "smooth",
    //             block: "center"
    //         });
    //         return;
    //     }

    //     if (bannerImages) {
    //         bannerErrorRef.current?.scrollIntoView({
    //             behavior: "smooth",
    //             block: "center"
    //         });
    //         return;
    //         // bannerErrorRef
    //     }

    //     // Scroll to first available error
    //     if (description?.message || descriptionValue) {
    //         if (description?.message != 'Description must be at least 10 characters' && description?.message) {
    //             if (description?.message == 'Description must be maximum 1000 characters') {
    //                 setOfferDescriptionError('Description must be maximum 1000 characters only');
    //             } else {
    //                 setOfferDescriptionError('Enter description');
    //             }
    //             setActiveOfferTab(0)
    //             bannerConditionsErrorRef.current?.scrollIntoView({
    //                 behavior: "smooth",
    //                 block: "center"
    //             });
    //             // setError('description', {
    //             //     type: 'custom',
    //             //     message: 'Enter description',
    //             // });
    //             return;
    //         }

    //         if (descriptionValue) {
    //             const result = isHtmlEmpty(description);

    //             if (result?.isEmpty == true) {
    //                 setOfferDescriptionError('Enter description');
    //                 setActiveOfferTab(0)
    //                 bannerConditionsErrorRef.current?.scrollIntoView({
    //                     behavior: "smooth",
    //                     block: "center"
    //                 });
    //                 setError('description', {
    //                     type: 'custom',
    //                     message: 'Enter description',
    //                 });
    //                 return;
    //             }
    //             else {
    //                 if (result?.cleanedText?.length < 11) {
    //                     setOfferDescriptionError('Enter atleast 10 character');
    //                     setActiveOfferTab(0)

    //                     bannerConditionsErrorRef.current?.scrollIntoView({
    //                         behavior: "smooth",
    //                         block: "center"
    //                     });
    //                     return;
    //                 }
    //             }
    //         }
    //     }

    //     if (offerDetails?.message || offerDetailsValue != '') {

    //         if (offerDetailsValue) {
    //             const result = isHtmlEmpty(offerDetailsValue);

    //             if (!result?.isEmpty == true) {
    //                 if (result?.cleanedText?.length < 11) {
    //                     setError('offerDetails', {
    //                         type: 'custom',
    //                         message: 'Enter atleast 10 character',
    //                     });
    //                     setOfferDetailsError('Enter atleast 10 character');

    //                     setActiveOfferTab(1)

    //                     bannerConditionsErrorRef.current?.scrollIntoView({
    //                         behavior: "smooth",
    //                         block: "center"
    //                     });
    //                     return;

    //                 }


    //                 if (offerDetails?.message == 'Description must be maximum 1000 characters') {
    //                     setOfferDetailsError('Details must be maximum 1000 characters only');
    //                     setActiveOfferTab(1)

    //                     bannerConditionsErrorRef.current?.scrollIntoView({
    //                         behavior: "smooth",
    //                         block: "center"
    //                     });
    //                     return;
    //                 }
    //             }
    //         }
    //     }

    //     if (termsAndConditions?.message || termsAndConditionsValue) {

    //         if (termsAndConditions?.message != 'Description must be at least 10 characters' && termsAndConditions?.message) {
    //             if (termsAndConditions?.message == 'Description must be maximum 1000 characters') {
    //                 setTermsConditionError('Terms and condition must be maximum 1000 characters only');
    //             } else {
    //                 setTermsConditionError('Enter terms and condition');
    //             }
    //             setActiveOfferTab(2)
    //             bannerConditionsErrorRef.current?.scrollIntoView({
    //                 behavior: "smooth",
    //                 block: "center"
    //             });
    //             // setError('description', {
    //             //     type: 'custom',
    //             //     message: 'Enter description',
    //             // });
    //             return;
    //         }


    //         if (termsAndConditionsValue) {
    //             const result = isHtmlEmpty(termsAndConditionsValue);
    //             if (result?.isEmpty == true) {

    //                 setTermsConditionError('Enter terms and condition');
    //                 setActiveOfferTab(2)

    //                 bannerConditionsErrorRef.current?.scrollIntoView({
    //                     behavior: "smooth",
    //                     block: "center"
    //                 });
    //                 return;
    //             }
    //             else {
    //                 if (result?.cleanedText?.length < 11) {
    //                     setTermsConditionError('Enter atleast 10 character');
    //                     setActiveOfferTab(2)

    //                     bannerConditionsErrorRef.current?.scrollIntoView({
    //                         behavior: "smooth",
    //                         block: "center"
    //                     });
    //                     return;
    //                 }
    //             }
    //         }

    //     }

    // }, [
    //     saveBtnClick,   // single trigger
    //     logo?.message,
    //     description?.message,
    //     offerDetails?.message,
    //     termsAndConditions?.message
    // ]);


    const isHtmlEmpty = (value) => {
        // Remove null / undefined / empty
        if (!value) {
            return {
                cleanedText: "",
                isEmpty: true
            };
        }

        // Remove HTML tags and trim spaces
        const cleanedText = value.replace(/<[^>]*>/g, '').trim();

        return {
            cleanedText,
            isEmpty: cleanedText.length === 0
        };
    };


    const getDefaultCurrency = () => {
        const get_currencyMasterList = currencyMasterList || [];
        return get_currencyMasterList.find(
            (item) => item.currencyID == userDetail?.currencyId
        ) || null;
    };

    const resetFormFields = (resetObject, customDefaults = {}) => {
        Object.keys(resetObject).forEach((field) => {
            const defaultValue = customDefaults.hasOwnProperty(field)
                ? customDefaults[field]
                : resetObject[field];
            resetField(field, { defaultValue });
        });
    };

    useEffect(() => {

        const get_countryMasterList = countryMasterList || [];
        const get_currencyMasterList = currencyMasterList || [];

        // Find the object where countryID matches dataItem?.country
        const matchedCountry = get_countryMasterList.find(
            (item) => item.countryID == userDetail?.countryId
        );

        // const matchedCurrency = get_currencyMasterList.find(
        //     (item) => item.currencyID == userDetail?.currencyId
        // );
        const matchedCurrency = getDefaultCurrency();

        // If match found, set the country value
        if (matchedCountry) {
            setValue('currency', matchedCurrency)
            setValue('currencyFlatDiscount', matchedCurrency)
            // setValue('country', matchedCountry)
        }

    }, [])

    useEffect(() => {

        if (hasPopulatedFormRef.current) return;

        if (getEditedData && Object.keys(getEditedData).length > 0) {
            const edited = getEditedData[0];

            const applicableDayIds = edited?.ApplicableDays
                ? edited.ApplicableDays.toString().split(',').map(Number)
                : [];

            const findApplicableDate = DAYS_OF_WEEK_OPTIONS.filter(day =>
                applicableDayIds.includes(day.dayId)
            );

            let applyApplicableData = getApplicableDaysData(findApplicableDate)
            setApplicableDaysData(applyApplicableData);
            let offer_code_type = ''
            if (edited?.OfferCodeType == 0) {
                offer_code_type = 'Common'
            } else {
                offer_code_type = 'Unique'
            }
            setValue('OfferCode', offer_code_type)
            // OfferCode

            setIsPublished(edited?.IsPublished)
            const communicationTypeIds = edited?.CommuncationTypeID
                ?.split(",")
                .map(id => Number(id))
                .filter(n => !isNaN(n));

            const shopListIds = edited?.ShopListID
                ?.split(",")
                .map(id => Number(id))
                .filter(n => !isNaN(n));

            const subCategoryIds = parseOfferSubCategoryIdKeys(edited?.SubCategoryID);

            let getProductTypevalue = getProductType?.filter(val => val?.categoryId == edited?.ProductTypeID)
            // ✅ Correct filter: match idArray with subCategoryId of your list
            const matchedCommunicationItems = getCommunicationType?.filter(item =>
                communicationTypeIds.includes(item.campaignAttributeId)
            );

            setValue('communicationType', matchedCommunicationItems)

            const getSubProductTypeID = edited?.SubProductTypeID
                .split(",")
                .map(Number);

            const matchedSubProductTypeData = getSubProductType.filter(item =>
                getSubProductTypeID.includes(item.subCategoryId)
            );

            const matchedShopList = shopList.filter(item =>
                shopListIds.includes(item.storeID)
            );

            let matchedsubCategory = getSubCategory.filter(item =>
                subCategoryIds.includes(item.subCategoryTypeID)
            );

            if (!hasSetProductTypeRef.current && getProductTypevalue && getProductTypevalue.length > 0) {
                setValue('productType', getProductTypevalue[0])
                hasSetProductTypeRef.current = true;
            }
            setValue('subProductType', matchedSubProductTypeData)
            setValue('shop', matchedShopList)
            if (matchedsubCategory?.length == 0) {
                matchedsubCategory = ''
            }

            let category = [];
            if (edited?.CategoryID != null) {
                const idArray = parseOfferCategoryIdKeys(edited?.CategoryID);

                category = getCategory.filter((item) => idArray.includes(item.categoryID));
            }

            // Filter matched subcategories


            let matchedSubCategories = category?.flatMap(item => item.subCategory);


            const selectedList = parseOfferSubCategoryIdKeys(edited?.SubCategoryID).map(String);

            const matchedData = matchedSubCategories.filter((item) =>
                selectedList.includes(String(item.subCategoryID)),
            );

            if (!hasSetCategoryRef.current && category && category.length > 0) {
                setValue('category', category)
                hasSetCategoryRef.current = true;
            }
            if (matchedSubCategories?.length === 0) {
                matchedSubCategories = []
            }
            setValue('subCategory', matchedData)
            // if (edited?.OfferDisType == "Text") {
            if (edited?.OfferDisType != null) {
                getPreviewData();
            }

            // const updatedDisplay = edited?.OfferDisType === "QR Code" ? "QR code" : display;
            let updatedDisplay = display;
            if (edited?.OfferDisType === "QR Code") {
                updatedDisplay = "QR code";
            } else if (edited?.OfferDisType === "Bar Code") {
                updatedDisplay = "Bar code";
            } else if (edited?.OfferDisType === "Text") {
                updatedDisplay = "Text";
            } else if (edited?.OfferDisType) {
                updatedDisplay = edited.OfferDisType;
            }

            setValue('length', edited?.OfferLength)
            setValue('display', updatedDisplay)
            setValue('composeUsing', edited?.ComposeValue)
            setValue('codePattern', edited?.CodePattern)

            if (edited?.ComposeValue?.length > 0 && edited?.ComposeValue != null) {
                setRefreshFlag(true)
            }

            setValue("formatCapital", formatOptions?.formatCapital);
            setValue("formatNumber", formatOptions?.formatNumber);
            setValue("formatSmall", formatOptions?.formatSmall);
        }
    }, [getEditedData, getCategory, shopList, getSubProductType, brandList]);

    // Use UTC time from API if available, otherwise fallback to system time
    const currentUTCdateTime = utcTimeData?.utcTime ? new Date(utcTimeData.utcTime.replace('Z', '')) : new Date();

    // Convert UTC time to user's timezone for min date (today)
    const getMinDate = () => {
        if (utcTimeData?.utcTime) {
            const todayUTC = new Date(currentUTCdateTime);
            todayUTC.setHours(0, 0, 0, 0);
            return convertUTCtoUserTimezone(todayUTC);
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    };

    // Convert UTC time to user's timezone for max date (180 days from today)
    const getMaxDate = (baseDate = null) => {
        const dateToUse = baseDate || currentUTCdateTime;
        if (utcTimeData?.utcTime) {
            const maxDateUTC = new Date(dateToUse);
            maxDateUTC.setDate(maxDateUTC.getDate() + 180);
            maxDateUTC.setHours(23, 59, 59, 999);
            return convertUTCtoUserTimezone(maxDateUTC);
        }
        return getOneEightyDays(dateToUse);
    };

    // Calculate min and max dates based on UTC time and user timezone
    const minDate = useMemo(() => getMinDate(), [utcTimeData?.utcTime]);
    const maxDate = useMemo(() => getMaxDate(), [utcTimeData?.utcTime]);

    // Calculate end date min and max based on start date
    const endDateMin = useMemo(() => {
        if (offerDurationStartDate) {
            if (utcTimeData?.utcTime) {
                const startDateUTC = new Date(offerDurationStartDate);
                startDateUTC.setHours(0, 0, 0, 0);
                return convertUTCtoUserTimezone(startDateUTC);
            }
            return new Date(offerDurationStartDate);
        }
        return minDate;
    }, [offerDurationStartDate, minDate, utcTimeData?.utcTime]);

    const endDateMax = useMemo(() => {
        if (offerDurationStartDate) {
            return getMaxDate(new Date(offerDurationStartDate));
        }
        return maxDate;
    }, [offerDurationStartDate, maxDate]);

    // Offer type conditionals
    const isFixedValue = offerType?.offerTypeId === 1 || offerType?.offerTypeID === 1;
    const isFlatDiscount = offerType?.offerTypeId === 2 || offerType?.offerTypeID === 2;
    const isBundle = offerType?.offerTypeId === 5 || offerType?.offerTypeID === 5;
    const isBuyOneGetOne = offerType?.offerTypeId === 6 || offerType?.offerTypeID === 6;
    const isReferral = offerType?.offerTypeId === 4 || offerType?.offerTypeID === 4;

    const maximumDiscountCap = watch('maximumDiscountCap');

    useEffect(() => {
        // Keep dependent validation in sync for flat discount fields
        if (!isFlatDiscount) return;
        if (!maximumDiscountCap) return;
        if (!discountPercentage || !minimumPurchaseValueFlatDiscount) return;

        trigger('maximumDiscountCap');
    }, [isFlatDiscount, maximumDiscountCap, discountPercentage, minimumPurchaseValueFlatDiscount, trigger]);

    // Offer code type conditionals
    const isStatic = offerCodeType === 'Static' || offerCodeType === 'Common';
    const isDynamic = offerCodeType === 'Dynamic' || offerCodeType === 'Unique';
    // Always use Generate new codes (manual entry removed)
    const isGenerateNewCodes = isDynamic; // Always true for dynamic/unique offers


    const publishData = async (offerId, value, dataItem,) => {
        try {
            let payload = { departmentId, clientId, userId, offerId: offerId, isActive: isPublished == 1 ? false : true };
            const res = await publishApi.refetch({
                fetcher: () => dispatch(offerListPublishApi(payload, false)),
                loaderConfig: PREFERENCES_SUBPAGE_LOADER_CONFIG,
                mode: 'create',
            });
            if (res?.status) {
                navigate('/preferences/offer-management');
            }

        } catch (error) {
        } finally {
            setSubmitAction(null);
        }
    };

    const handleSave = async (data, isProceed, options = {}) => {
        const currentValues = getValues();
        let hasError = false; // flag to stop execution at the end

        const currentFormatCapital = currentValues.formatCapital || formatCapital;
        const currentFormatSmall = currentValues.formatSmall || formatSmall;
        const currentFormatNumber = currentValues.formatNumber || formatNumber;

        const getMediaTypeSnippet = currentValues?.mediaTypeSnippet;
        const getDisplay = currentValues?.display;
        // ---------------------
        // 1. TEXT FIELD ERRORS
        // ---------------------
        let get_Description = isHtmlEmpty(currentValues?.description);
        let get_Details = isHtmlEmpty(currentValues?.offerDetails);
        let get_termsAndConditions = isHtmlEmpty(currentValues?.termsAndConditions);

        // if (get_Description?.isEmpty == true) {

        //     setOfferDescriptionError('Enter description');
        //     setActiveOfferTab(0)
        //     bannerConditionsErrorRef.current?.scrollIntoView({
        //         behavior: "smooth",
        //         block: "center"
        //     });
        //     return;
        // }
        // else {
        //     if (get_Description?.cleanedText?.length < 11) {
        //         setOfferDescriptionError('Enter atleast 10 character');
        //         setActiveOfferTab(0)
        //         bannerConditionsErrorRef.current?.scrollIntoView({
        //             behavior: "smooth",
        //             block: "center"
        //         });
        //         return;
        //     }
        // }

        // if (get_termsAndConditions?.isEmpty == true) {

        //     setTermsConditionError('Enter terms and condition');
        //     setActiveOfferTab(2)
        //     bannerConditionsErrorRef.current?.scrollIntoView({
        //         behavior: "smooth",
        //         block: "center"
        //     });
        //     return;
        // }
        // else {
        //     if (get_termsAndConditions?.cleanedText?.length < 11) {
        //         setTermsConditionError('Enter atleast 10 character');
        //         setActiveOfferTab(2);
        //         bannerConditionsErrorRef.current?.scrollIntoView({
        //             behavior: "smooth",
        //             block: "center"
        //         });
        //         return;
        //     }
        // }

        // if s
        // ---------------------
        // 2. FORMAT VALIDATION
        // ---------------------


        // if (
        //     offerDescriptionError ||                     // has description error
        //     offerDetailsError ||                         // has details error
        //     termsConditionError                                // has terms error
        // ) {
        //     return;
        // }

        if (
            !currentFormatCapital &&
            !currentFormatSmall &&
            !currentFormatNumber &&
            !refreshFlag &&
            currentValues?.offerCodeType === "Unique"
        ) {
            setError('formatCapital', {
                type: 'custom',
                message: SELECT_ATLEAST_ONE,
            });
            hasError = true;
        }

        // ---------------------
        // 3. TEMPLATE VALIDATIONS
        // ---------------------
        // if (getMediaTypeSnippet && getDisplay === "Text" && (getselectedSnippetId == null && getselectedSnippetName == null)) {


        // ---------------------
        // STOP EXECUTION IF ANY ERROR FOUND
        // ---------------------
        if (hasError) {
            return; // prevent further execution
        }

        const isNavigatingToBuilder = Boolean(options?.onSuccess);
        const hasNoSnippetSelected =
            (getselectedSnippetId == null || getselectedSnippetId === '') &&
            (getselectedSnippetName == null || getselectedSnippetName === '');

        if (getMediaTypeSnippet && !isNavigatingToBuilder && hasNoSnippetSelected) {
            setTemplateError('Select template');
            setSaveBtnTemplateCount(c => c + 1); // increment to trigger effect every click
            return;
        }

        const currentSnippetId = watch('selectedSnippetId');
        const currentSnippetName = watch('selectedSnippetName');
        const dataWithOfferId = offerId?.offerId ? { ...data, offerId: offerId.offerId } : data;

        // Get offerSnippetId and offerSnippetName (using selectedSnippetId and selectedSnippetName)
        const offerSnippetId = currentSnippetId || data.selectedSnippetId || null;
        const offerSnippetName = currentSnippetName || data.selectedSnippetName || null;

        const dataWithSnippet = {
            ...dataWithOfferId,
            selectedSnippetId: offerSnippetId,
            selectedSnippetName: offerSnippetName,
            offerSnippetId: offerSnippetId,
            offerSnippetName: offerSnippetName
        };
        let payload = buildCreateOfferPayload(dataWithSnippet, clientId, departmentId, userId);
        // Add offerId to payload if in edit mode (keep existing logic for backward compatibility)
        if (offerId?.offerId) {
            payload.offerId = offerId.offerId;
        }
        payload.statusId = 1

        setSubmitAction(isProceed ? 'publish' : 'save');
        let res = await saveApi.refetch({
            fetcher: () => dispatch(createOffer(payload, false)),
            loaderConfig: PREFERENCES_SUBPAGE_LOADER_CONFIG,
            mode: isEditOffer ? 'edit' : 'create',
        });
        if (res?.status) {
            const savedOfferId = Number(res?.data?.data)
                ? Number(res?.data?.data)
                : Number(res?.data)
                    ? Number(res?.data)
                    : null;

            if (options?.onSuccess) {
                options.onSuccess(savedOfferId);
                setSubmitAction(null);
                return;
            }

            if (isProceed) {
                await publishData(savedOfferId);
            } else {
                setSubmitAction(null);
                navigate('/preferences/offer-management');
            }
        } else {
            setSubmitAction(null);
            dispatch(
                update_failures_API_Errors({
                    field: 'CreateOffer',
                    message: res?.message || 'No data available',
                }),
            );
        }
    };

    // Fetch UTC time (no global loader — page uses field skeleton)
    useEffect(() => {
        dispatch(getUtcTimeNow(false));
    }, []);

    /** Edit mode: keep skeleton until offer row is mapped into the form (cascade reads use loading: false). */
    const [isFormPopulated, setIsFormPopulated] = useState(() => !offerId?.offerId);

    const offerIdNumber = offerId?.offerId
        ? typeof offerId.offerId === 'string'
            ? Number(offerId.offerId)
            : offerId.offerId
        : null;

    const isEditOffer = Boolean(offerIdNumber && !Number.isNaN(offerIdNumber));

    const communicationTypeApi = useApiLoader({
        autoFetch: false,
        loaderConfig: PREFERENCES_SUBPAGE_LOADER_CONFIG,
        mode: 'create',
    });
    const productTypeApi = useApiLoader({
        autoFetch: false,
        loaderConfig: PREFERENCES_SUBPAGE_LOADER_CONFIG,
        mode: 'create',
    });
    const shopApi = useApiLoader({
        autoFetch: false,
        loaderConfig: PREFERENCES_SUBPAGE_LOADER_CONFIG,
        mode: 'create',
    });
    const subProductTypeApi = useApiLoader({
        autoFetch: false,
        loaderConfig: PREFERENCES_SUBPAGE_LOADER_CONFIG,
        mode: 'create',
    });
    const subCategoryApi = useApiLoader({
        autoFetch: false,
        loaderConfig: PREFERENCES_SUBPAGE_LOADER_CONFIG,
        mode: 'create',
    });
    const saveApi = useApiLoader({
        autoFetch: false,
        loaderConfig: PREFERENCES_SUBPAGE_LOADER_CONFIG,
        mode: isEditOffer ? 'edit' : 'create',
    });
    const publishApi = useApiLoader({
        autoFetch: false,
        loaderConfig: PREFERENCES_SUBPAGE_LOADER_CONFIG,
        mode: 'create',
    });
    const isSaveLoading = saveApi.isFetching;
    const isPublishLoading = publishApi.isFetching;
    const isSaveButtonLoading = submitAction === 'save' && isSaveLoading;
    const isPublishButtonLoading = submitAction === 'publish' && (isSaveLoading || isPublishLoading);
    const isSubmitting = isSaveLoading || isPublishLoading;

    const createOfferApi = usePreferencesSubPageApi({
        enabled: Boolean(departmentId && clientId && userId),
        mode: offerIdNumber && !Number.isNaN(offerIdNumber) ? 'edit' : 'create',
        deps: [departmentId, clientId, userId, offerIdNumber],
        fetcher: async () => {
            const payload = { departmentId, clientId, userId };
            const offerBrand_Payload = { departmentId, clientId, userId, mode: 1 };

            const settleApiResult = (result) => (result.status === 'fulfilled' ? result.value : null);

            const [offerTypeSettled, brandSettled, categorySettled] = await Promise.allSettled([
                dispatch(getOfferType(payload, false, { loading: false })),
                dispatch(fetchOfferBrand(offerBrand_Payload, false)),
                dispatch(fetchOfferCategory(payload)),
            ]);
            const offerTypeRes = settleApiResult(offerTypeSettled);
            const brandRes = settleApiResult(brandSettled);
            const categoryRes = settleApiResult(categorySettled);

            dispatch(
                getOfferManagement({ field: 'getOfferTypeData', data: offerTypeRes?.status ? offerTypeRes?.data : [] }),
            );
            dispatch(
                getOfferManagement({
                    field: 'getCategory',
                    data:
                        categoryRes?.status && categoryRes?.data
                            ? Array.isArray(categoryRes.data)
                                ? categoryRes.data
                                : []
                            : [],
                }),
            );

            if (existingProductType.length > 0) {
                dispatch(
                    getOfferManagement({
                        field: 'getProductType',
                        data: existingProductType,
                    }),
                );
            } else {
                void productTypeApi.refetch({
                    fetcher: () => dispatch(getCommunicationProductsList(payload, false)),
                    onSuccess: (productTypeRes) => {
                        dispatch(
                            getOfferManagement({
                                field: 'getProductType',
                                data: productTypeRes?.status ? productTypeRes?.data : [],
                            }),
                        );
                    },
                });
            }

            if (existingCommunicationType.length > 0) {
                dispatch(
                    getOfferManagement({
                        field: 'getCommunicationType',
                        data: existingCommunicationType,
                    }),
                );
            } else {
                void communicationTypeApi.refetch({
                    fetcher: () => dispatch(communicationAttributes(payload, false)),
                    onSuccess: (communicationTypeRes) => {
                        dispatch(
                            getOfferManagement({
                                field: 'getCommunicationType',
                                data: communicationTypeRes?.status ? communicationTypeRes?.data : [],
                            }),
                        );
                    },
                });
            }

            if (brandRes?.status && brandRes?.data) {
                setBrandList(Array.isArray(brandRes.data) ? brandRes.data : []);
            }

            if (offerIdNumber && !Number.isNaN(offerIdNumber)) {
                const offerIdStr = String(offerIdNumber);
                const offerIdChanged = lastOfferIdRef.current !== offerIdStr;
                if (offerIdChanged) {
                    hasPopulatedFormRef.current = false;
                    hasSetProductTypeRef.current = false;
                    hasSetCategoryRef.current = false;
                    lastOfferIdRef.current = offerIdStr;
                    setIsFormPopulated(false);
                }

                const { data, status, message = 'No data available' } = await dispatch(
                    fetchOffer({
                        payload: { departmentId, clientId, userId, offerId: offerIdNumber },
                        loading: false,
                    }),
                );
                if (status) {
                    dispatch(getOfferManagement({ field: 'getEditedData', data }));
                    setIsNotEditable(false);
                    const editBrandId = data?.brandId ?? data?.BrandId;
                    if (editBrandId) {
                        await shopApi.refetch({
                            fetcher: () =>
                                dispatch(
                                    fetchOfferStore(
                                        { departmentId, clientId, userId, brandId: editBrandId, mode: 1 },
                                        false,
                                    ),
                                ),
                            onSuccess: (shopRes) => {
                                if (shopRes?.status && shopRes?.data) {
                                    setShopList(Array.isArray(shopRes.data) ? shopRes.data : []);
                                } else {
                                    setShopList([]);
                                }
                            },
                        });
                    }
                } else {
                    dispatch(getOfferManagement({ field: 'getEditedData', data: {} }));
                    dispatch(
                        update_failures_API_Errors({
                            field: 'FetchOffer',
                            message: message || 'No data available',
                        }),
                    );
                    setIsNotEditable(true);
                    setIsFormPopulated(true);
                }
            } else {
                hasPopulatedFormRef.current = false;
                hasSetProductTypeRef.current = false;
                hasSetCategoryRef.current = false;
                lastOfferIdRef.current = null;
                dispatch(getOfferManagement({ field: 'getEditedData', data: {} }));
            }

            return { offerTypeRes, brandRes };
        },
    });

    const showCreateOfferPageSkeleton = isEditOffer && (createOfferApi.isPageLoading || !isFormPopulated);
    const bootstrapFieldLoading = createOfferApi.isLoading;

    useEffect(() => {
        lastSubCategoryFetchKeyRef.current = '';
        lastShopBrandIdRef.current = null;
        lastSubProductTypeIdRef.current = null;
    }, [offerIdNumber]);

    useEffect(() => {
        function editedValues() {
            // Check if we have edit data and are in edit mode
            const hasEditData = getEditedData && Object.keys(getEditedData).length > 0;
            const isEditMode = offerId?.offerId;
            const needsPopulation = !hasPopulatedFormRef.current;

            if (isEditMode && hasEditData) {
                // Also check if we have the required master data before populating
                const hasMasterData = getOfferTypeData && getOfferTypeData.length > 0;

                if (hasMasterData) {
                    let obj = getSateObject({
                        getEditedData,
                        getOfferTypeData,
                        getCommunicationType,
                        getProductType,
                        getCategory,
                        getSubCategory,
                        getSubProductType,
                        brandList,
                        shopList,
                        currencyMasterList,
                    });
                    setFormatOptions({
                        formatCapital: obj.formatCapital,
                        formatNumber: obj.formatNumber,
                        formatSmall: obj.formatSmall
                    });


                    if (needsPopulation) {
                        // Initial population - set all form values at once
                        for (let [key, val] of Object.entries(obj)) {
                            setValue(key, val, { shouldValidate: false, shouldDirty: false });
                        }
                        if (obj?.length) {
                            setValue('length', obj?.length)
                        }

                        if (obj?.composeUsing) setRefreshFlag(true);

                        // Handle banner images - clear existing and set new ones from state object
                        if (obj?.bannerImages && Array.isArray(obj.bannerImages) && obj.bannerImages.length > 0) {
                            const currentBannerImages = getValues('bannerImages') || [];
                            // Remove from the end to avoid index issues
                            for (let i = currentBannerImages.length - 1; i >= 0; i--) {
                                removeBannerImage(i);
                            }

                            // Append all banner images from state object
                            obj.bannerImages.forEach(banner => {
                                if (banner?.image) {
                                    appendBannerImage(banner);
                                }
                            });
                        }



                        // Mark as populated to prevent re-running full population
                        hasPopulatedFormRef.current = true;
                        setIsFormPopulated(true);
                    }

                    else {
                        // Re-populate only brand and shop if they weren't set before and are now available
                        const currentBrand = getValues('brand');
                        const currentShop = getValues('shop');

                        if (!currentBrand && obj?.brand && brandList && brandList.length > 0) {
                            setValue('brand', obj.brand, { shouldValidate: false, shouldDirty: false });
                        }

                        if ((!currentShop || (Array.isArray(currentShop) && currentShop.length === 0)) && obj?.shop && shopList && shopList.length > 0) {
                            setValue('shop', obj.shop, { shouldValidate: false, shouldDirty: false });
                        }
                    }
                }
            }
        }
        editedValues();
    }, [offerId?.offerId, getEditedData, getOfferTypeData, getCommunicationType, getCategory, getSubCategory, brandList, shopList, setValue, getValues]);
    //    }, [offerId?.offerId, getEditedData, getOfferTypeData, getCommunicationType, getProductType, getCategory, getSubCategory, getSubProductType, brandList, shopList, currencyMasterList, setValue, getValues, removeBannerImage, appendBannerImage]);

    // Auto-select snippet when snippetId is present in URL (after saving snippet from builder)
    useEffect(() => {

        if (snippetIdToSelect && snippetIdToSelect > 0) {
            setValue('mediaTypeSnippet', true, { shouldValidate: false, shouldDirty: false });
            setValue('selectedSnippetId', snippetIdToSelect, { shouldValidate: false, shouldDirty: false });

            // Verify the value was set
            setTimeout(() => {
                const currentValue = getValues('selectedSnippetId');
            }, 100);
        }
    }, [snippetIdToSelect, setValue, getValues, snippetIdFromUrl, snippetIdFromQuery, offerId]);

    // Set default addOfferCode to "Generate new codes" when Unique is selected
    useEffect(() => {
        if (isDynamic && !addOfferCode) {
            setValue('addOfferCode', ADD_OFFER_CODE_OPTIONS[0]); // Generate new codes
        }
    }, [isDynamic, addOfferCode, setValue]);

    useEffect(() => {
        if (!departmentId || !clientId || !userId) return;

        const productCategoryId = productType?.categoryId;
        if (productCategoryId) {
            if (lastSubProductTypeIdRef.current === productCategoryId) return;
            lastSubProductTypeIdRef.current = productCategoryId;

            subProductTypeApi.refetch({
                fetcher: () =>
                    dispatch(
                        getCommunicationSubProducts({
                            payload: { departmentId, clientId, userId, categoryId: productType.categoryId },
                            loading: false,
                        }),
                    ),
                onSuccess: (subProductTypeRes) => {
                    const subProductTypeData =
                        subProductTypeRes?.status && subProductTypeRes?.data
                            ? Array.isArray(subProductTypeRes.data)
                                ? subProductTypeRes.data
                                : subProductTypeRes.data || []
                            : [];
                    dispatch(
                        getOfferManagement({
                            field: 'getSubProductType',
                            data: subProductTypeData,
                        }),
                    );
                },
                onError: () => {
                    dispatch(getOfferManagement({ field: 'getSubProductType', data: [] }));
                },
            });
        } else {
            lastSubProductTypeIdRef.current = null;
            subProductTypeApi.reset();
            dispatch(getOfferManagement({ field: 'getSubProductType', data: [] }));
            setValue('subProductType', []);
        }
    }, [productType?.categoryId, departmentId, clientId, userId, dispatch, setValue]);

    useEffect(() => {
        if (!departmentId || !clientId || !userId) return;

        const categorySelectionKey = getOfferCategorySelectionKey(category);
        if (!categorySelectionKey) {
            lastSubCategoryFetchKeyRef.current = '';
            subCategoryApi.reset();
            dispatch(getOfferManagement({ field: 'getSubCategory', data: [] }));
            setValue('subCategory', null);
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
            onSuccess: (subCategoryRes) => {
                const subCategoryPayload =
                    subCategoryRes?.status && subCategoryRes?.data
                        ? Array.isArray(subCategoryRes.data)
                            ? subCategoryRes.data
                            : []
                        : [];
                dispatch(
                    getOfferManagement({
                        field: 'getSubCategory',
                        data: subCategoryPayload,
                    }),
                );
            },
            onError: () => {
                dispatch(getOfferManagement({ field: 'getSubCategory', data: [] }));
                setValue('subCategory', null);
            },
        });
    }, [category, departmentId, clientId, userId, dispatch, setValue]);

    useEffect(() => {
        if (!departmentId || !clientId || !userId) return;

        const brandId = brand?.brandID;
        if (brandId) {
            if (lastShopBrandIdRef.current === brandId) return;
            lastShopBrandIdRef.current = brandId;

            shopApi.refetch({
                fetcher: () =>
                    dispatch(
                        fetchOfferStore(
                            { departmentId, clientId, userId, brandId: brand.brandID, mode: 1 },
                            false,
                        ),
                    ),
                onSuccess: (shopRes) => {
                    if (shopRes?.status && shopRes?.data) {
                        setShopList(Array.isArray(shopRes.data) ? shopRes.data : []);
                    } else {
                        setShopList([]);
                    }
                },
                onError: () => setShopList([]),
            });
        } else {
            lastShopBrandIdRef.current = null;
            shopApi.reset();
            setShopList([]);
            setValue('shop', []);
        }
    }, [brand?.brandID, departmentId, clientId, userId, dispatch, setValue]);

    const hanldeFormatRefresh = () => {
        setRefreshFlag(!refreshFlag);
        setGenerateFlag(false);
        // RESET_FIELDS.forEach((e) => resetField(e));
        setValue('previewData', '');
        setValue('composeUsing', '');
        setValue('codePattern', '');
        clearErrors('formatCapital');
        resetField('display');

        if (refreshFlag) {
            setValue('formatCapital', '');
            setValue('formatNumber', '');
            setValue('formatSmall', '');
        }

    };

    const hanldeOfferCodeRefresh = () => {
        // Use resetField for individual fields instead of reset() to avoid triggering other useEffect hooks
        // RESET_OFFERTYPES && Object.keys(RESET_OFFERTYPES).forEach((field) => {
        //     resetField(field, { defaultValue: RESET_OFFERTYPES[field] });
        // });
        if (RESET_OFFERTYPES) {
            resetFormFields(RESET_OFFERTYPES);
        }
    };


    const hanldeOffertypeRefresh = () => {
        const { logo, ...resetFields } = RESET_OFFER_TYPE;
        // Object.keys(resetFields).forEach((field) => {
        //     resetField(field, {
        //         defaultValue: resetFields[field],
        //     });
        // });
        const matchedCurrency = getDefaultCurrency();
        const customDefaults = {};
        if (matchedCurrency) {
            customDefaults.currency = matchedCurrency;
            customDefaults.currencyFlatDiscount = matchedCurrency;
        }
        resetFormFields(resetFields, customDefaults);
    };

    const handleVolumeRefresh = () => {
        // Use resetField for individual fields instead of reset() to avoid triggering other useEffect hooks
        // RESET_ADDOFFER_FROM && Object.keys(RESET_ADDOFFER_FROM).forEach((field) => {
        //     resetField(field, { defaultValue: RESET_ADDOFFER_FROM[field] });
        // });
        if (RESET_ADDOFFER_FROM) {
            resetFormFields(RESET_ADDOFFER_FROM);
        }
        setGenerateFlag(false);
        setRefreshFlag(false);
    };

    // Initialize bannerImages array with one empty field if empty (only in create mode)
    useEffect(() => {
        if (!offerId?.offerId) {
            const currentBannerImages = getValues('bannerImages');
            if (!currentBannerImages || currentBannerImages.length === 0) {
                appendBannerImage({ image: '' });
            }
        }
    }, [offerId?.offerId]);

    useEffect(() => {
        return () => {
            dispatch(clearOfferManageMent());
            hasPopulatedFormRef.current = false;
            hasSetProductTypeRef.current = false;
            hasSetCategoryRef.current = false;
        };
    }, []);

    // Reset populated form ref when offerId changes (switching between create and edit)
    useEffect(() => {
        hasPopulatedFormRef.current = false;
        hasSetProductTypeRef.current = false;
        hasSetCategoryRef.current = false;
    }, [offerId?.offerId]);

    // Restore form values when returning from other pages (e.g. Offer Builder or Create Brand)
    useEffect(() => {
        if (location?.state?.offerFormData) {
            const savedFormData = location.state.offerFormData;
            const dateFields = ['offerDurationStartDate', 'offerDurationEndDate', 'applicableStartTime', 'applicableEndTime'];

            Object.keys(savedFormData).forEach((key) => {
                let value = savedFormData[key];

                // Convert serialized ISO date strings back to Date objects for Date/Time pickers
                if (dateFields.includes(key) && typeof value === 'string' && value) {
                    const dateValue = new Date(value);
                    if (!isNaN(dateValue.getTime())) {
                        value = dateValue;
                    }
                }

                setValue(key, value);
            });
            // Mark as populated to prevent re-fetching from overwriting restored local state
            hasPopulatedFormRef.current = true;
            // Clear location state after restoring
            navigate(location.pathname + location.search, { replace: true, state: {} });
        }
    }, [location?.state, setValue, navigate, location.pathname, location.search]);


    const handleChange = (event) => {
        const {
            target: { name, value },
        } = event;

        if (name == 'formatCapital' || name == 'formatSmall' || name == 'formatNumber') {
            if (getlength == 0 || Number(getlength) < 6 || Number(getlength) > 12 || !getlength) {
                // setValue('formatCapital', '');
                // setValue('formatSmall', '');
                // setValue('formatNumber', '');
                clearErrors('formatCapital');
                setError('length', {
                    type: 'custom',
                    message: ENTER_LENGTH_3_TO_12,
                });
                return;
            }
        }

        if (name == 'formatCapital' || name == 'formatSmall' || name == 'formatNumber') {
            setValue('display', '');
            setValue('previewData', '');
            clearErrors('formatCapital');
            clearErrors('composeUsing');
        }
        if (value === 'Common' || value === 'Static') {
            RESETCOMMON.forEach((e) => resetField(e));
            return;
        }
        if (value === 'Unique' || value === 'Dynamic') {
            resetField('offerCode');
        }
        setGenerateFlag(false);
    };

    const handleChangeDisplay = (event) => {
        const {
            target: { name, value },
        } = event;
        getselectedSnippetId = null;
        getselectedSnippetName = null
        // setValue("selectedSnippetId", null);
        // setValue("selectedSnippetName", null);

        // Get current form values to ensure we have the latest data
        const currentValues = getValues();
        const currentFormatCapital = currentValues.formatCapital || formatCapital;
        const currentFormatSmall = currentValues.formatSmall || formatSmall;
        const currentFormatNumber = currentValues.formatNumber || formatNumber;
        const currentLength = currentValues.length || length;
        const currentComposeUsing = currentValues.composeUsing || composeUsing;
        const currentCodePattern = currentValues.codePattern || codePattern;

        if (!currentFormatCapital && !currentFormatSmall && !currentFormatNumber && !refreshFlag) {
            // reset((formState) => ({
            //     ...formState,
            //     display: '',
            // }));
            setValue('display', '');
            setError('formatCapital', {
                type: 'custom',
                message: SELECT_ATLEAST_ONE,
            });
            return
        }
        if (!currentLength || Number(currentLength) < 6 || currentLength == 0 || Number(currentLength) > 12) {
            reset((formState) => ({
                ...formState,
                display: '',
            }));
            setError('length', {
                type: 'custom',
                message: ENTER_LENGTH_3_TO_12,
            });
            return
        } else if (refreshFlag) {

            const cleanedValue = currentComposeUsing.replace(/\s+/g, '');

            if (!currentFormatCapital && !currentFormatSmall && !currentFormatNumber && !cleanedValue) {

                setError('composeUsing', {
                    type: 'custom',
                    message: COMPOSE_USING_MSG,
                });
                return
            }

            if (!currentCodePattern) {

                setError('codePattern', {
                    type: 'custom',
                    message: CODE_PATTERN_MSG,
                });
                return true
            }
        }

        if (value != null) {
            clearErrors('formatCapital');
            getPreviewData();
        }
    };

    // Generate code in frontend
    const generateCode = (currentValues = null) => {
        // Use provided values or fallback to watched values
        const currentFormatCapital = currentValues ? currentValues.formatCapital : formatCapital;
        const currentFormatSmall = currentValues ? currentValues.formatSmall : formatSmall;
        const currentFormatNumber = currentValues ? currentValues.formatNumber : formatNumber;
        const currentLength = currentValues ? currentValues.length : length;
        const currentComposeUsing = currentValues ? currentValues.composeUsing : composeUsing;
        const currentCodePattern = currentValues ? currentValues.codePattern : codePattern;
        const currentRefreshFlag = refreshFlag; // Keep refreshFlag from state


        // if (!currentRefreshFlag) {
        // if (currentComposeUsing?.length == 0) {
        if ((currentFormatCapital || currentFormatSmall || currentFormatNumber) && (!currentRefreshFlag && currentComposeUsing?.length == 0 && !currentCodePattern)) {
            // Simple random generation: generate a code of specified length
            const chars = getChars({ formatCapital: currentFormatCapital, formatSmall: currentFormatSmall, formatNumber: currentFormatNumber });

            if (!chars || chars.length === 0) {
                return '';
            }

            if (!currentLength || Number(currentLength) <= 0) {
                return '';
            }
            let generatedCode = '';
            for (let i = 0; i < Number(currentLength); i++) {
                const randomIndex = Math.floor(Math.random() * chars.length);
                generatedCode += chars[randomIndex];
            }
            return generatedCode;
        }

        if ((!currentFormatCapital && !currentFormatSmall && !currentFormatNumber) && (currentRefreshFlag && currentComposeUsing?.length != 0 && currentCodePattern)) {

            if (!currentCodePattern) {
                return '';
            }

            // In refresh mode, use composeUsing as the character set directly
            // Extract unique characters from composeUsing
            const composeCharsArray = currentComposeUsing.split('');
            const uniqueComposeChars = [...new Set(composeCharsArray)];

            // if (uniqueComposeChars.length === 0) {
            //     return '';
            // }

            // Replace # in codePattern with random characters from composeUsing
            let generatedCode = '';
            for (let i = 0; i < currentCodePattern.length; i++) {
                if (currentCodePattern[i] === '#') {
                    // Replace # with random character from composeUsing
                    const randomIndex = Math.floor(Math.random() * uniqueComposeChars.length);
                    generatedCode += uniqueComposeChars[randomIndex];
                } else {
                    // Keep the character as is from the pattern
                    generatedCode += currentCodePattern[i];
                }
            }
            return generatedCode;

        }

        if ((currentFormatCapital || currentFormatSmall || currentFormatNumber) || (currentComposeUsing?.length != 0)) {

            if (!currentCodePattern) {
                return '';
            }


            if (currentComposeUsing?.length != 0) {
                const composeCharsArray = currentComposeUsing.split('');
                const uniqueComposeChars = [...new Set(composeCharsArray)];

                // if (uniqueComposeChars.length === 0) {
                //     return '';
                // }

                // Replace # in codePattern with random characters from composeUsing
                let generatedCode = '';
                for (let i = 0; i < currentCodePattern.length; i++) {
                    if (currentCodePattern[i] === '#') {
                        // Replace # with random character from composeUsing
                        const randomIndex = Math.floor(Math.random() * uniqueComposeChars.length);
                        generatedCode += uniqueComposeChars[randomIndex];
                    } else {
                        // Keep the character as is from the pattern
                        generatedCode += currentCodePattern[i];
                    }
                }
                return generatedCode;
            }


            if ((currentFormatCapital || currentFormatSmall || currentFormatNumber)) {
                const composeCharsArray = currentComposeUsing.split('');
                const uniqueComposeChars = [...new Set(composeCharsArray)];

                const chars = getChars({ formatCapital: currentFormatCapital, formatSmall: currentFormatSmall, formatNumber: currentFormatNumber });



                // Replace # in codePattern with random characters from composeUsing
                let generatedCode = '';
                for (let i = 0; i < currentCodePattern.length; i++) {
                    if (currentCodePattern[i] === '#') {
                        // Replace # with random character from composeUsing
                        const randomIndex = Math.floor(Math.random() * chars.length);
                        generatedCode += chars[randomIndex];
                    } else {
                        // Keep the character as is from the pattern
                        generatedCode += currentCodePattern[i];
                    }
                }
                return generatedCode;
            }


        }

    };

    const getPreviewData = () => {
        try {
            // Get current form values to ensure we have the latest data
            const currentValues = getValues();
            const generatedCode = generateCode(currentValues);
            if (generatedCode) {
                setGenerateFlag(true);
                setValue('previewData', generatedCode);
            } else {
                // Only reset if we're not in refreshFlag mode with valid inputs
                // This prevents resetting when user has valid composeUsing and codePattern
                if (!refreshFlag || !currentValues.composeUsing || !currentValues.codePattern) {
                    setRefreshFlag(false);
                    setGenerateFlag(false);
                    reset((formState) => ({
                        ...formState,
                        formatCapital: false,
                        formatNumber: false,
                        formatSmall: false,
                        display: '',
                        length: '',
                        codePattern: '',
                        composeUsing: ''
                    }));
                    setValue('previewData', '');
                } else {
                    // If refreshFlag is true and we have composeUsing and codePattern but generation failed,
                    // just clear preview without resetting other fields
                    setGenerateFlag(false);
                    setValue('previewData', '');
                }
            }
        } catch (error) {
            setRefreshFlag(false);
            setGenerateFlag(false);
            setValue('previewData', '');
        }
    };


    useEffect(() => {
        if (volume?.length > 0) clearErrors('volume');
    }, [volume]);


    // Handle logo upload - store base64 directly
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

    const applyLogoFromBrandSelection = (brandItem) => {
        if (!brandItem || typeof brandItem !== 'object') {
            setValue('logo', '');
            return;
        }
        const raw = brandItem.image ?? brandItem.Image;
        const url = raw != null ? String(raw).trim() : '';
        if (url) {
            setValue('logo', url);
            clearErrors('logo');
        } else {
            setValue('logo', '');
        }
    };

    const handlePreviewImageUpload = async (base64Image, fileName, contentLength) => {
        if (!fileName || !base64Image) return;

        // Format base64 as data URI if it's not already formatted
        const imageFormat = fileName.split('.')?.pop()?.toLowerCase() || 'png';
        const formattedBase64 = base64Image.startsWith('data:')
            ? base64Image
            : `data:image/${imageFormat};base64,${base64Image}`;

        // Set base64 data directly without API call
        setValue('previewImage', formattedBase64);
        clearErrors('previewImage');
    };

    // Handle banner image upload - store base64 directly and append to field array
    const handleBannerImageUpload = async (base64Image, fileName, contentLength, index) => {
        if (!fileName || !base64Image) return;

        // Format base64 as data URI if it's not already formatted
        const imageFormat = fileName.split('.')?.pop()?.toLowerCase() || 'png';
        const formattedBase64 = base64Image.startsWith('data:')
            ? base64Image
            : `data:image/${imageFormat};base64,${base64Image}`;

        // If index is provided, update existing image, otherwise append new one
        if (index !== undefined && index !== null) {
            setValue(`bannerImages.${index}.image`, formattedBase64);
            clearErrors(`bannerImages.${index}.image`);
        } else {
            appendBannerImage({ image: formattedBase64 });
        }
    };

    const textEditorOnchange = () => {
        setOfferDescriptionError('');
        setOfferDetailsError('');
    };

    const textEditorOnchange1 = () => {
        setTermsConditionError('');
    };

    // All three editors stay mounted (hidden inactive panels) so Kendo + RHF values persist when switching tabs.
    const renderOfferEditorPanel = useCallback(
        (tabIndex) => {
            if (tabIndex === 0) {
                return (
                    <div className={`offer-tabs-content-wrapper ${errors?.description?.message ? 'mt15' : ''}`}>
                        <div className=" offer-text-editor-container" ref={descriptionErrorRef}>
                            <RSKendoTextEditor
                                key="offer-editor-description"
                                name="description"
                                control={control}
                                label=""
                                defaultValue=""
                                tools={textEditorToolsWithoutImage}
                                isOfferEditor={true}
                                className="offer-editor"
                                onChangeData={(value) => {
                                    textEditorOnchange(value);
                                }}
                                rules={{
                                    validate: (value) => {
                                        if (!value) return true;

                                        const textContent = value.replace(/<[^>]*>/g, '').trim();

                                        if (textContent.length < 10) {
                                            return 'Description must be at least 10 characters';
                                        }

                                        if (textContent.length > 1000) {
                                            return 'Description must be maximum 1000 characters';
                                        }

                                        return true;
                                    },
                                }}
                                errMsg={offerDescriptionError}
                                customError={offerDescriptionError}
                            />
                            <div className="rs-editor-bottom-message">
                                <div className="editor-message-right">
                                    <small>
                                        <span className="emr-length">
                                            {getOfferEditorTextLength(descriptionValue)}/ {OFFER_EDITOR_MAX_LENGTH}
                                        </span>
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
            if (tabIndex === 1) {
                return (
                    <div className="offer-tabs-content-wrapper">
                        <div
                            id="rs_CreateOffer_offerDetails"
                            className=" offer-text-editor-container"
                            ref={offerDetailsErrorRef}
                        >
                            <RSKendoTextEditor
                                key="offer-editor-details"
                                name="offerDetails"
                                control={control}
                                placeholder=""
                                defaultValue=""
                                tools={textEditorToolsWithoutImage}
                                isOfferEditor={true}
                                className="offer-editor"
                                onChangeData={(value) => {
                                    textEditorOnchange(value);
                                }}
                                rules={{
                                    validate: (value) => {
                                        if (!value) return true;
                                        const textContent = value.replace(/<[^>]*>/g, '').trim();

                                        if (textContent.length === 0) return true;

                                        if (textContent.length < 10) {
                                            return 'Minimum 10 characters required';
                                        }

                                        if (textContent.length > 1000) {
                                            return 'Description must be maximum 1000 characters';
                                        }

                                        return true;
                                    },
                                }}
                                errMsg={offerDetailsError}
                                customError={offerDetailsError}
                            />
                            <div className="rs-editor-bottom-message">
                                <div className="editor-message-right">
                                    <small>
                                        <span className="emr-length">
                                            {getOfferEditorTextLength(offerDetailsValue)}/ {OFFER_EDITOR_MAX_LENGTH}
                                        </span>
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
            return (
                <div className="offer-tabs-content-wrapper">
                    <div id="rs_CreateOffer_termsAndConditions" className=" offer-text-editor-container">
                        <RSKendoTextEditor
                            key="offer-editor-terms"
                            name="termsAndConditions"
                            control={control}
                            placeholder=""
                            defaultValue=""
                            tools={textEditorToolsWithoutImage}
                            isOfferEditor={true}
                            className="offer-editor"
                            onChangeData={(value) => {
                                textEditorOnchange1(value);
                            }}
                            rules={{
                                validate: (value) => {
                                    if (!value) return true;

                                    const textContent = value.replace(/<[^>]*>/g, '').trim();

                                    if (textContent.length < 10) {
                                        return 'Description must be at least 10 characters';
                                    }

                                    if (textContent.length > 1000) {
                                        return 'Description must be maximum 1000 characters';
                                    }

                                    return true;
                                },
                            }}
                            errMsg={termsConditionError}
                            customError={termsConditionError}
                        />
                        <div className="rs-editor-bottom-message">
                            <div className="editor-message-right">
                                <small>
                                    <span className="emr-length">
                                        {getOfferEditorTextLength(termsAndConditionsValue)}/ {OFFER_EDITOR_MAX_LENGTH}
                                    </span>
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            );
        },
        [
            control,
            errors?.description?.message,
            offerDescriptionError,
            offerDetailsError,
            termsConditionError,
            descriptionErrorRef,
            offerDetailsErrorRef,
            textEditorToolsWithoutImage,
            descriptionValue,
            offerDetailsValue,
            termsAndConditionsValue,
        ],
    );

    const offerContentTabData = useMemo(
        () => [
            {
                id: 'description',
                text: 'Offer description',
                component: () => renderOfferEditorPanel(0),
            },
            {
                id: 'details',
                text: 'Offer details',
                component: () => renderOfferEditorPanel(1),
            },
            {
                id: 'terms',
                text: 'Terms and conditions',
                component: () => renderOfferEditorPanel(2),
            },
        ],
        [renderOfferEditorPanel],
    );

    const getApplicableDaysData = (selectedDays = []) => {
        // RULE 0: empty selection → show everything
        if (!Array.isArray(selectedDays) || selectedDays.length === 0) {
            return DAYS_OF_WEEK_OPTIONS;
        }

        let data = DAYS_OF_WEEK_OPTIONS

        const hasAllDays = selectedDays.some(d => d.dayId === ALL_DAYS_ID);
        const hasWeekdays = selectedDays.some(d => d.dayId === WEEKDAYS_ID);
        const hasWeekends = selectedDays.some(d => d.dayId === WEEKENDS_ID);

        const hasAnyWeekday = selectedDays.some(d => WEEKDAY_IDS.includes(d.dayId));
        const hasAnyWeekend = selectedDays.some(d => WEEKEND_IDS.includes(d.dayId));

        /* RULE 2: All days → ONLY All days */
        if (hasAllDays) {
            return data.filter(d => d.dayId === ALL_DAYS_ID);
        }

        /* RULE 5: Any selection (except All days) → remove All days */
        data = data.filter(d => d.dayId !== ALL_DAYS_ID);

        /* RULE 1: Mon–Fri selected → remove Weekdays */
        if (hasAnyWeekday) {
            data = data.filter(d => d.dayId !== WEEKDAYS_ID);
        }

        /* RULE 6: Weekdays selected → remove Mon–Fri */
        if (hasWeekdays) {
            data = data.filter(d => !WEEKDAY_IDS.includes(d.dayId));
        }

        /* RULE 3: Weekends selected → remove Sat & Sun */
        if (hasWeekends) {
            data = data.filter(d => !WEEKEND_IDS.includes(d.dayId));
        }

        /* RULE 4: Sat or Sun selected → remove Weekends */
        if (hasAnyWeekend) {
            data = data.filter(d => d.dayId !== WEEKENDS_ID);
        }

        return data;
    };

    const noPreview = !(
        logo ||
        displayName ||
        description ||
        offerDetails ||
        termsAndConditions ||
        (bannerImages?.some(img => img?.image))
    );
    return (
        <FormProvider {...methods}>
            <div className="page-content-holder">
                <RSPageHeader
                    title={offerId?.offerId ? 'Edit offer' : 'Add offer'}
                    isBack
                    backPath="/preferences/offer-management"
                    isHeaderLine
                    rightCommonMenus
                    isBuDisabled={true}
                    isAgencyDisabled={true}
                />
                <Container fluid>
                    <div className="page-content">
                        <Container className="px0">
                            <PreferencesSubPageSkeletonGate
                                variant={PREFERENCES_SUBPAGE_VARIANT.CREATE_OFFER}
                                isLoading={showCreateOfferPageSkeleton}
                            >
                            <form onSubmit={handleSubmit((data) => handleSave(data, false), handleFormInvalid)}>
                                <div className={` box-design rs-box create-offer-section p0  mt0 ${isNotEditable ? 'click-off' : ''}`}>
                                    <h4 className="border-bottom mb19 pb13 pt19 px19">Basic details</h4>
                                    {/* Basic Details Section */}
                                    <div className='border-0  box-design no-box-shadow'>
                                        <div className="form-group">
                                            <Row>
                                                <Col sm={3} className="text-right">
                                                    <label className="control-label-left">{OFFER_MANAGEMENT_OFFER_NAME}</label>
                                                </Col>
                                                <Col sm={7}>
                                                    <ListNameExists
                                                        name={'offerName'}
                                                        field={'offerName'}
                                                        apiCallback={checkOfferNameExists}
                                                        condition={(status) => {
                                                            return !status?.status;
                                                        }}
                                                        maxLength={MAX_LENGTH75}
                                                        placeholder="Offer name"
                                                        rules={{
                                                            required: OFFER_NAME,
                                                            pattern: {
                                                                value: /^[a-zA-Z0-9\-_ ]*$/,
                                                                message: 'Only numbers & (.) are allowed',
                                                            },
                                                        }}
                                                        onKeyDown={charNumUnderScore}
                                                        currentValue={editName}
                                                        extraPayload={{ clientId, departmentId, userId }}
                                                    />
                                                </Col>
                                            </Row>
                                        </div>

                                        <div className="form-group">
                                            <Row className='align-items-end'>
                                                <Col sm={3} className="text-right">
                                                    <label className="control-label-left">Communication type</label>
                                                </Col>
                                                <Col sm={7} id="rs_CreateOffer_communicationType">
                                                    <RSMultiSelect
                                                        name="communicationType"
                                                        data={getCommunicationType}
                                                        textField="attributename"
                                                        dataItemKey="campaignAttributeId"
                                                        control={control}
                                                        required
                                                        label="Communication type"
                                                        isLoading={communicationTypeApi.isLoading}
                                                        rules={{
                                                            required: SELECT_COMMUNICATION_TYPE,
                                                        }}
                                                    />
                                                </Col>
                                            </Row>
                                        </div>

                                        <div className="form-group">
                                            <Row className='d-flex align-items-end'>
                                                <Col sm={3} className="text-right">
                                                    <label className="control-label-left">Brand / Shop</label>
                                                </Col>
                                                <Col sm={7} >
                                                    <Row className='align-items-end'>
                                                        <Col sm={6} id="rs_CreateOffer_brand">
                                                            <RSKendoDropdownList
                                                                name="brand"
                                                                data={brandList}
                                                                textField="legalName"
                                                                dataItemKey="brandID"
                                                                control={control}
                                                                label="Brand"
                                                                placeholder="Brand"
                                                                required
                                                                isLoading={bootstrapFieldLoading}
                                                                disabled={!communicationType || (Array.isArray(communicationType) && communicationType.length === 0)}
                                                                rules={{
                                                                    required: SELECT_BRAND,
                                                                }}
                                                                handleChange={(e) => {
                                                                    setValue('shop', []);
                                                                    applyLogoFromBrandSelection(e?.value);
                                                                }}
                                                                footer={
                                                                    <NewAttributeBtn
                                                                        title={'Create brand'}
                                                                        handleModalAttribute={() => {
                                                                            const currentFormValues = getValues();
                                                                            navigate('/preferences/create-brand', {
                                                                                state: {
                                                                                    fromCreateOffer: true,
                                                                                    offerFormData: currentFormValues
                                                                                }
                                                                            });
                                                                        }}
                                                                    />
                                                                }
                                                            />
                                                        </Col>
                                                        <Col sm={6} id="rs_CreateOffer_shop">
                                                            <RSMultiSelect
                                                                name="shop"
                                                                data={shopList || []}
                                                                textField="shortName"
                                                                dataItemKey="storeID"
                                                                control={control}
                                                                label="Shop"
                                                                placeholder="Select Shop"
                                                                disabled={!brand}
                                                                isLoading={shopApi.isLoading && !!brand?.brandID}
                                                                footer={
                                                                    <NewAttributeBtn
                                                                        title={'Create shop'}
                                                                        handleModalAttribute={() => {
                                                                            const currentFormValues = getValues();
                                                                            navigate('/preferences/create-shop', {
                                                                                state: {
                                                                                    fromCreateOffer: true,
                                                                                    offerFormData: currentFormValues
                                                                                }
                                                                            });
                                                                        }}
                                                                    />
                                                                }
                                                            />
                                                        </Col>
                                                    </Row>
                                                </Col>
                                            </Row>
                                        </div>

                                        <div className="form-group">
                                            <Row className='align-items-end'>
                                                <Col sm={3} className="text-right">
                                                    <label className="control-label-left">Product / Sub product type</label>
                                                </Col>
                                                <Col sm={7}>
                                                    <Row className='align-items-end'>
                                                        <Col sm={6} id="rs_CreateOffer_productType">
                                                            <RSKendoDropdown
                                                                name="productType"
                                                                control={control}
                                                                data={getProductType}
                                                                textField="categoryname"
                                                                dataItemKey="categoryId"
                                                                required
                                                                label={PRODUCTType}
                                                                disabled={!brand}
                                                                isLoading={productTypeApi.isLoading}
                                                                rules={{
                                                                    required: SELECT_PRODUCT_TYPE,
                                                                }}
                                                                handleChange={(e) => {
                                                                    setValue('subProductType', []);
                                                                }}
                                                            />
                                                        </Col>
                                                        <Col sm={6} id="rs_CreateOffer_subProductType">
                                                            <RSMultiSelect
                                                                name="subProductType"
                                                                control={control}
                                                                data={getSubProductType || []}
                                                                textField="subCategoryName"
                                                                dataItemKey="subCategoryId"
                                                                label="Sub Product Type"
                                                                disabled={!productType}
                                                                isLoading={
                                                                    subProductTypeApi.isLoading && !!productType?.categoryId
                                                                }
                                                            />
                                                        </Col>
                                                    </Row>
                                                </Col>
                                                <Col sm={1} className='pl0 position-relative top8'>
                                                    <RSPPophover position={'top'} pophover={COMMUNIITON_PRODUCT_POPHOVER_TEXT}>
                                                        <i
                                                            className={`${circle_question_mark_mini} color-primary-blue icon-xs`}
                                                            id="circle_question_mark"
                                                        />
                                                    </RSPPophover>
                                                </Col>
                                            </Row>
                                        </div>

                                        <div className="form-group">
                                            <Row className='align-items-end'>
                                                <Col sm={3} className="text-right">
                                                    <label className="control-label-left">Category/Subcategory</label>
                                                </Col>
                                                <Col sm={7}>
                                                    <Row className='align-items-end'>
                                                        <Col sm={6} id="rs_CreateOffer_category">
                                                            <RSMultiSelect
                                                                required
                                                                name="category"
                                                                data={getCategory}
                                                                textField="categoryName"
                                                                dataItemKey="categoryID"
                                                                control={control}
                                                                label="Category"
                                                                placeholder="Select Category"
                                                                disabled={!productType}
                                                                autoClose={false}
                                                                isLoading={bootstrapFieldLoading}
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

                                                                rules={{
                                                                    required: SELECT_CAT_TYPE,
                                                                }}
                                                            />
                                                        </Col>
                                                        <Col sm={6} id="rs_CreateOffer_subCategory">
                                                            <RSMultiSelect
                                                                name="subCategory"
                                                                control={control}
                                                                data={subCategoryData}
                                                                textField="subCategoryName"
                                                                dataItemKey="subCategoryID"
                                                                label="Sub Category"
                                                                autoClose={false}
                                                                disabled={!category || (Array.isArray(category)) && category?.length == 0}
                                                                isLoading={subCategoryApi.isLoading}
                                                            />
                                                        </Col>
                                                    </Row>
                                                </Col>
                                            </Row>
                                        </div>

                                        <div className="form-group">
                                            <Row>
                                                <Col sm={3} className="text-right">
                                                    <label className="control-label-left">{OFFER_DURATION}</label>
                                                </Col>
                                                <Col sm={7}>
                                                    <Row>
                                                        <Col sm={6} id="rs_CreateOffer_newdate">
                                                            <RSDatePicker
                                                                required
                                                                name="offerDurationStartDate"
                                                                control={control}
                                                                min={minDate}
                                                                format={FORMAT_DATE}
                                                                max={maxDate}
                                                                disabled={!brand}
                                                                rules={{
                                                                    required: SELECT_START_DATE,
                                                                }}
                                                                placeholder={START_DATE}
                                                            />
                                                        </Col>
                                                        <Col sm={6} id="rs_CreateOffer_Enddate">
                                                            <RSDatePicker
                                                                required
                                                                name="offerDurationEndDate"
                                                                control={control}
                                                                format={FORMAT_DATE}
                                                                disabled={!offerDurationStartDate}
                                                                min={endDateMin}
                                                                max={endDateMax}
                                                                rules={{
                                                                    required: SELECT_END_DATE,
                                                                }}
                                                                placeholder={END_DATE}
                                                            />
                                                        </Col>
                                                    </Row>
                                                </Col>
                                            </Row>
                                        </div>

                                        {/* Offer Configuration Section */}
                                        <div className="form-group">
                                            <Row>
                                                <Col sm={3} className="text-right">
                                                    <label className="control-label-left">{OFFER_TYPE}</label>
                                                </Col>
                                                <Col sm={7} id="rs_CreateOffer_offerType">
                                                    <RSKendoDropdown
                                                        name="offerType"
                                                        data={(getOfferTypeData || []).filter((type) => {
                                                            const id = type?.offerTypeId || type?.offerTypeID;
                                                            return id === 1 || id === 2 || id === 4;
                                                        })}
                                                        textField="offerName"
                                                        dataItemKey="offerTypeId"
                                                        control={control}
                                                        required
                                                        label={OFFER_TYPE}
                                                        isLoading={bootstrapFieldLoading}
                                                        disabled={!offerDurationEndDate}
                                                        rules={{
                                                            required: OFFER_TYPE_MSG,
                                                        }}
                                                    />
                                                </Col>
                                                {offerType && typeof offerType === 'object' && Object.keys(offerType).length > 0 && (
                                                    <Col sm={1} className='align-items-end d-flex lh0 pl0'>
                                                        <RSTooltip text={'Reset'} position="top" className="lh0">
                                                            <i
                                                                className={`${restart_medium} icon-md color-primary-blue`}
                                                                onClick={() => {
                                                                    setIsReset({
                                                                        show: true,
                                                                        type: 'offerTypeDDL'
                                                                    });
                                                                }}
                                                            />
                                                        </RSTooltip>
                                                    </Col>
                                                )}
                                            </Row>
                                        </div>

                                        {/* Conditional fields for Fixed value (offerTypeID === 1) */}
                                        {isFixedValue && (
                                            <>
                                                <div className="form-group">
                                                    <Row>
                                                        {/* <Col sm={3} className="text-right">
                                                        <label className="control-label-left">Discount Value</label>
                                                    </Col> */}
                                                        <Col sm={{ offset: 3, span: 7 }}>
                                                            <Row>
                                                                <Col sm={4} id="rs_CreateOffer_discountValue">
                                                                    <RSInput
                                                                        name="discountValue"
                                                                        control={control}
                                                                        placeholder="Discount value"
                                                                        onKeyDown={onlyNumbers}
                                                                        maxLength={MAX_LENGTH5}
                                                                        required
                                                                        handleOnchange={() => trigger('minimumPurchaseValue')}
                                                                        rules={{
                                                                            required: ENTER_DISCOUNT_VALUE,
                                                                            validate: (value) => validateNotZero(value) !== true ? validateNotZero(value) : validateDiscountNotExceedingMinPurchase(value, 'minimumPurchaseValue', true),
                                                                        }}
                                                                    />
                                                                </Col>
                                                                <Col sm={4} id="rs_CreateOffer_currency">
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
                                                                            required: SELECT_CURRENCY,
                                                                        }}
                                                                    />
                                                                </Col>
                                                                <Col sm={4} id="rs_CreateOffer_minPurchaseValue">
                                                                    <RSInput
                                                                        name="minimumPurchaseValue"
                                                                        control={control}
                                                                        placeholder="Min. purchase value"
                                                                        onKeyDown={onlyNumbers}
                                                                        maxLength={MAX_LENGTH5}
                                                                        handleOnchange={() => trigger('discountValue')}
                                                                        //required
                                                                        rules={{
                                                                            //required: ENTER_MINIMUM_PURCHASE_VALUE,
                                                                            validate: (value) => validateNotZero(value) !== true ? validateNotZero(value) : validateDiscountNotExceedingMinPurchase(value, 'discountValue', false),
                                                                        }}
                                                                    />
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Row>
                                                </div>
                                            </>
                                        )}

                                        {/* Conditional fields for Flat discount (offerTypeID === 2) */}
                                        {isFlatDiscount && (
                                            <>
                                                <div className="form-group">
                                                    <Row>
                                                        {/* <Col sm={3} className="text-right">
                                                        <label className="control-label-left">Discount Percentage</label>
                                            </Col> */}
                                                        <Col sm={{ offset: 3, span: 7 }}>
                                                            <Row>
                                                                <Col sm={6} id="rs_CreateOffer_discountPercentage">
                                                                    <RSInput
                                                                        name="discountPercentage"
                                                                        control={control}
                                                                        placeholder="Discount percentage"
                                                                        onKeyDown={onlyNumbers}
                                                                        maxLength={MAX_LENGTH5}
                                                                        required
                                                                        handleOnchange={() => trigger('maximumDiscountCap')}
                                                                        rules={{
                                                                            required: ENTER_DISCOUNT_PERCENTAGE,
                                                                            validate: validateNotZero,
                                                                        }}
                                                                    />
                                                                </Col>
                                                                <Col sm={6} id="rs_CreateOffer_currencyFlatDiscount">
                                                                    <RSKendoDropdown
                                                                        name="currencyFlatDiscount"
                                                                        data={currencyMasterList || []}
                                                                        textField="currencyName"
                                                                        dataItemKey="currencyID"
                                                                        control={control}
                                                                        label="Currency"
                                                                        placeholder="Select Currency"
                                                                    />
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Row>
                                                </div>
                                                <div className="form-group">
                                                    <Row>
                                                        {/* <Col sm={3} className="text-right">
                                                        <label className="control-label-left">Minimum Purchase Value / Maximum Discount Cap</label>
                                                    </Col> */}
                                                        <Col sm={{ offset: 3, span: 7 }}>
                                                            <Row>
                                                                <Col sm={6} id="rs_CreateOffer_minPurchaseValueFlatDiscount">
                                                                    <RSInput
                                                                        name="minimumPurchaseValueFlatDiscount"
                                                                        control={control}
                                                                        placeholder="Minimum purchase value"
                                                                        onKeyDown={onlyNumbers}
                                                                        maxLength={MAX_LENGTH5}
                                                                        required
                                                                        handleOnchange={() => trigger('maximumDiscountCap')}
                                                                        rules={{
                                                                            required: ENTER_MINIMUM_PURCHASE_VALUE,
                                                                            validate: validateNotZero,
                                                                        }}
                                                                    />
                                                                </Col>
                                                                <Col sm={6} id="rs_CreateOffer_maxDiscountCap">
                                                                    <RSInput
                                                                        name="maximumDiscountCap"
                                                                        control={control}
                                                                        placeholder="Maximum discount cap"
                                                                        onKeyDown={onlyNumbers}
                                                                        maxLength={MAX_LENGTH5}
                                                                        required
                                                                        disabled={!minimumPurchaseValueFlatDiscount || !discountPercentage}
                                                                        rules={{
                                                                            required: ENTER_MAXIMUM_DISCOUNT_CAP,
                                                                            validate: (value) => validateNotZero(value) !== true ? validateNotZero(value) : validateMaxDiscountCap(value),
                                                                        }}
                                                                    />
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Row>
                                                </div>
                                            </>
                                        )}

                                        {/* Conditional fields for Bundle (offerTypeID === 4) */}
                                        {isBundle && (
                                            <>
                                                <div className="form-group">
                                                    <Row>
                                                        {/* <Col sm={3} className="text-right">
                                                        <label className="control-label-left">Bundle Items / Offer Price/Discount</label>
                                                    </Col> */}
                                                        <Col sm={{ offset: 3, span: 7 }}>
                                                            <Row>
                                                                <Col sm={6} id="rs_CreateOffer_bundleItems">
                                                                    <RSInput
                                                                        name="bundleItems"
                                                                        control={control}
                                                                        placeholder="Bundle items"
                                                                        onKeyDown={onlyNumbers}
                                                                        maxLength={MAX_LENGTH5}
                                                                        rules={{
                                                                            validate: validateNotZero,
                                                                        }}
                                                                    />
                                                                </Col>
                                                                <Col sm={6} id="rs_CreateOffer_offerPriceDiscount">
                                                                    <RSInput
                                                                        name="offerPriceDiscount"
                                                                        control={control}
                                                                        placeholder="Offer price/discount"
                                                                        onKeyDown={onlyNumbers}
                                                                        maxLength={MAX_LENGTH5}
                                                                        rules={{
                                                                            validate: validateNotZero,
                                                                        }}
                                                                    />
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Row>
                                                </div>
                                                <div className="form-group">
                                                    <Row>
                                                        {/* <Col sm={3} className="text-right">
                                                        <label className="control-label-left">Minimum Quantity/Discount</label>
                                                    </Col> */}
                                                        <Col sm={{ offset: 3, span: 7 }} id="rs_CreateOffer_minQuantityDiscount">
                                                            <RSInput
                                                                name="minimumQuantityDiscount"
                                                                control={control}
                                                                placeholder="Minimum quantity/discount"
                                                                onKeyDown={onlyNumbers}
                                                                maxLength={MAX_LENGTH5}
                                                                rules={{
                                                                    validate: validateNotZero,
                                                                }}
                                                            />
                                                        </Col>
                                                    </Row>
                                                </div>
                                            </>
                                        )}

                                        {/* Conditional fields for Buy one get one (offerTypeID === 6) */}
                                        {isBuyOneGetOne && (
                                            <>
                                                <div className="form-group">
                                                    <Row>
                                                        {/* <Col sm={3} className="text-right">
                                                        <label className="control-label-left">Buy Product / Get Product</label>
                                                    </Col> */}
                                                        <Col sm={{ offset: 3, span: 7 }}>
                                                            <Row>
                                                                <Col sm={6} id="rs_CreateOffer_buyProduct">
                                                                    <RSInput
                                                                        name="buyProduct"
                                                                        control={control}
                                                                        placeholder="Buy product"
                                                                        onKeyDown={onlyNumbers}
                                                                        maxLength={MAX_LENGTH5}
                                                                        rules={{
                                                                            validate: validateNotZero,
                                                                        }}
                                                                    />
                                                                </Col>
                                                                <Col sm={6} id="rs_CreateOffer_getProduct">
                                                                    <RSInput
                                                                        name="getProduct"
                                                                        control={control}
                                                                        placeholder="Get product"
                                                                        onKeyDown={onlyNumbers}
                                                                        maxLength={MAX_LENGTH5}
                                                                        rules={{
                                                                            validate: validateNotZero,
                                                                        }}
                                                                    />
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Row>
                                                </div>
                                                <div className="form-group">
                                                    <Row>
                                                        {/* <Col sm={3} className="text-right">
                                                        <label className="control-label-left">Buy Quantity / Get Quantity</label>
                                                    </Col> */}
                                                        <Col sm={{ offset: 3, span: 7 }}>
                                                            <Row>
                                                                <Col sm={6} id="rs_CreateOffer_buyQuantity">
                                                                    <RSInput
                                                                        name="buyQuantity"
                                                                        control={control}
                                                                        placeholder="Buy quantity"
                                                                        onKeyDown={onlyNumbers}
                                                                        maxLength={MAX_LENGTH5}
                                                                        rules={{
                                                                            validate: validateNotZero,
                                                                        }}
                                                                    />
                                                                </Col>
                                                                <Col sm={6} id="rs_CreateOffer_getQuantity">
                                                                    <RSInput
                                                                        name="getQuantity"
                                                                        control={control}
                                                                        placeholder="Get quantity"
                                                                        onKeyDown={onlyNumbers}
                                                                        maxLength={MAX_LENGTH5}
                                                                        rules={{
                                                                            validate: validateNotZero,
                                                                        }}
                                                                    />
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Row>
                                                </div>
                                                <div className="form-group">
                                                    <Row>
                                                        {/* <Col sm={3} className="text-right">
                                                        <label className="control-label-left">Discount on Free Item / Percentage or Amount</label>
                                                    </Col> */}
                                                        <Col sm={{ offset: 3, span: 7 }}>
                                                            <Row>
                                                                <Col sm={6} id="rs_CreateOffer_discountOnFreeItem">
                                                                    <RSInput
                                                                        name="discountOnFreeItem"
                                                                        control={control}
                                                                        placeholder="Discount on free item"
                                                                        onKeyDown={onlyNumbers}
                                                                        maxLength={MAX_LENGTH5}
                                                                        rules={{
                                                                            validate: validateNotZero,
                                                                        }}
                                                                    />
                                                                </Col>
                                                                <Col sm={6} id="rs_CreateOffer_percentageOrAmount">
                                                                    <RSKendoDropdown
                                                                        name="percentageOrAmount"
                                                                        data={PERCENTAGE_OR_AMOUNT_OPTIONS}
                                                                        textField="name"
                                                                        dataItemKey="id"
                                                                        control={control}
                                                                        label="Percentage or Amount"
                                                                        placeholder="Select Percentage or Amount"
                                                                        defaultValue={PERCENTAGE_OR_AMOUNT_OPTIONS[0]}
                                                                    />
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Row>
                                                </div>
                                            </>
                                        )}

                                        {/* Conditional fields for Referral (offerTypeID === 7) */}
                                        {isReferral && (
                                            <>
                                                <div className="form-group">
                                                    <Row>
                                                        {/* <Col sm={3} className="text-right">
                                                        <label className="control-label-left">Referrer Reward / Referee Reward</label>
                                                    </Col> */}
                                                        <Col sm={{ offset: 3, span: 7 }}>
                                                            <Row>
                                                                <Col sm={6} id="rs_CreateOffer_referrerReward">
                                                                    <RSKendoDropdown
                                                                        name="referrerReward"
                                                                        data={REWARD_OPTIONS}
                                                                        textField="name"
                                                                        dataItemKey="id"
                                                                        control={control}
                                                                        label="Referrer Reward"
                                                                        placeholder="Select Referrer Reward"
                                                                        required
                                                                        rules={{
                                                                            required: SELECT_REFERRER_REWARD,
                                                                        }}
                                                                    />
                                                                </Col>
                                                                <Col sm={6} id="rs_CreateOffer_refereeReward">
                                                                    <RSKendoDropdown
                                                                        name="refereeReward"
                                                                        data={REWARD_OPTIONS}
                                                                        textField="name"
                                                                        dataItemKey="id"
                                                                        control={control}
                                                                        label="Referee Reward"
                                                                        placeholder="Select Referee Reward"
                                                                        required
                                                                        rules={{
                                                                            required: SELECT_REFEREE_REWARD,
                                                                        }}
                                                                    />
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Row>
                                                </div>
                                                <div className="form-group">
                                                    <Row>
                                                        {/* <Col sm={3} className="text-right">
                                                        <label className="control-label-left">Minimum Purchase Cap / Percentage or Amount</label>
                                                    </Col> */}
                                                        <Col sm={{ offset: 3, span: 7 }}>
                                                            <Row>
                                                                <Col sm={6} id="rs_CreateOffer_minPurchaseCap">
                                                                    <RSInput
                                                                        name="minimumPurchaseCap"
                                                                        control={control}
                                                                        placeholder="Minimum purchase cap"
                                                                        onKeyDown={onlyNumbers}
                                                                        maxLength={MAX_LENGTH5}
                                                                        required
                                                                        rules={{
                                                                            required: ENTER_MINIMUM_PURCHASE_CAP,
                                                                            validate: validateNotZero,
                                                                        }}
                                                                    />
                                                                </Col>
                                                                <Col sm={6} id="rs_CreateOffer_percentageOrAmountReferral">
                                                                    <RSKendoDropdown
                                                                        name="percentageOrAmountReferral"
                                                                        data={PERCENTAGE_OR_AMOUNT_OPTIONS}
                                                                        textField="name"
                                                                        dataItemKey="id"
                                                                        control={control}
                                                                        label="Percentage or Amount"
                                                                        placeholder="Select Percentage or Amount"
                                                                        defaultValue={PERCENTAGE_OR_AMOUNT_OPTIONS[0]}
                                                                        required
                                                                        rules={{
                                                                            required: SELECT_PERCENTAGE_OR_AMOUNT,
                                                                        }}
                                                                    />
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Row>
                                                </div>
                                            </>
                                        )}

                                        {/* Common fields - displayed only when offer type is selected */}
                                        {offerType && Object.keys(offerType).length > 0 && (
                                            <>
                                                <div className="form-group">
                                                    <Row>

                                                        <Col sm={{ offset: 3, span: 7 }}>
                                                            <Row>
                                                                <Col sm={4} id="rs_CreateOffer_usageClaimLimit">
                                                                    <RSInput
                                                                        name="usageClaimLimit"
                                                                        control={control}
                                                                        placeholder="Usage claim limit"
                                                                        onKeyDown={onlyNumbers}
                                                                        maxLength={MAX_LENGTH5}
                                                                        required
                                                                        rules={{
                                                                            required: ENTER_USAGE_CLAIM_LIMIT,
                                                                            validate: validateNotZero,
                                                                        }}
                                                                    />
                                                                </Col>
                                                                <Col sm={4} id="rs_CreateOffer_limitByDuration">
                                                                    <RSKendoDropdown
                                                                        name="limitByDuration"
                                                                        data={LIMIT_BY_DURATION_OPTIONS}
                                                                        textField="name"
                                                                        dataItemKey="id"
                                                                        control={control}
                                                                        label="Limit by duration"
                                                                        placeholder="Limit by duration"
                                                                        required
                                                                        disabled={!usageClaimLimit || (typeof usageClaimLimit === 'string' && usageClaimLimit.trim() === '')}
                                                                        rules={{
                                                                            required: SELECT_LIMIT_BY_DURATION,
                                                                        }}
                                                                    />
                                                                </Col>
                                                                <Col sm={4} id="rs_CreateOffer_totalRedemption">
                                                                    <RSInput
                                                                        name="totalRedemption"
                                                                        control={control}
                                                                        placeholder="Total redemption"
                                                                        onKeyDown={onlyNumbers}
                                                                        maxLength={MAX_LENGTH5}
                                                                        required
                                                                        disabled={!limitByDuration}
                                                                        rules={{
                                                                            required: ENTER_TOTAL_REDEMPTION,
                                                                            validate: validateNotZero,
                                                                        }}
                                                                    />
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Row>
                                                </div>
                                                <div className="form-group">
                                                    <Row>
                                                        {/* <Col sm={3} className="text-right"> */}
                                                        {/* <label className="control-label-left">Applicable Start Time / End Time</label> */}
                                                        {/* </Col> */}
                                                        <Col sm={{ offset: 3, span: 7 }} id="rs_CreateOffer_applicableStartTime">
                                                            <Row className='align-items-end'>
                                                                <Col sm={4} className={`${!totalRedemption || (typeof totalRedemption === 'string' && totalRedemption.trim() === '') ? 'click-off pe-none' : ''}`}>
                                                                    <RSMultiSelect
                                                                        name="applicableDays"
                                                                        data={applicableDaysData}
                                                                        textField="dayName"
                                                                        dataItemKey="dayId"
                                                                        control={control}
                                                                        label="Applicable days"
                                                                        placeholder="Applicable days"
                                                                        handleChange={(e) => {
                                                                            const selectedDays = e?.value || [];

                                                                            const updatedApplicableDays = getApplicableDaysData(selectedDays);
                                                                            setApplicableDaysData(updatedApplicableDays); // ✅ update state
                                                                        }}
                                                                    />
                                                                </Col>
                                                                <Col sm={4} className={`${!totalRedemption || (typeof totalRedemption === 'string' && totalRedemption.trim() === '') ? 'click-off pe-none' : ''}`}>
                                                                    <RSTimePicker
                                                                        name="applicableStartTime"
                                                                        control={control}
                                                                        placeholder="Applicable start time"
                                                                        format="HH:mm:ss"
                                                                    // handleChange = {(e)=>{
                                                                    //         console.log('EVENT ==>>',e)
                                                                    // }}
                                                                    // disabled={!totalRedemption || (typeof totalRedemption === 'string' && totalRedemption.trim() === '')}
                                                                    /></Col>
                                                                <Col sm={4} id="rs_CreateOffer_applicableEndTime" className={`${!totalRedemption || (typeof totalRedemption === 'string' && totalRedemption.trim() === '') ? 'click-off pe-none' : ''}`}>
                                                                    <RSTimePicker
                                                                        name="applicableEndTime"
                                                                        control={control}
                                                                        placeholder="Applicable end time"
                                                                        format="HH:mm:ss"
                                                                        // disabled={!totalRedemption || (typeof totalRedemption === 'string' && totalRedemption.trim() === '')}
                                                                        rules={{
                                                                            validate: (value) => {
                                                                                if (applicableStartTime && value) {
                                                                                    const start = applicableStartTime instanceof Date
                                                                                        ? applicableStartTime
                                                                                        : new Date(`2000-01-01 ${applicableStartTime}`);
                                                                                    const end = value instanceof Date
                                                                                        ? value
                                                                                        : new Date(`2000-01-01 ${value}`);
                                                                                    if (end <= start) {
                                                                                        return 'End time must be greater than start time';
                                                                                    }
                                                                                }
                                                                                return true;
                                                                            },
                                                                        }}
                                                                    />
                                                                </Col>
                                                            </Row>
                                                        </Col>

                                                    </Row>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                {offerType && Object.keys(offerType).length > 0
                                    // &&
                                    //     usageClaimLimit &&
                                    //     limitByDuration &&
                                    //     totalRedemption
                                    && (
                                        <div className={`box-design p0 create-offer-section display-details-section  ${isNotEditable ? 'click-off' : ''}`}>
                                            <h4 className="border-bottom m0 pb13 pt19 px19">Display details</h4>
                                            {/* Display Details Section - shown only when all common fields are filled */}
                                            <div className='border-0 box-design no-box-shadow py3'>
                                                <Row>
                                                    <Col className='mt36' sm={7}>

                                                        <>
                                                            <div className="form-group" ref={logoErrorRef}>
                                                                <Row>
                                                                    <Col sm={{ offset: 2, span: 3 }} className="text-right">
                                                                        <label className="control-label-left">{LOGO_LABEL}</label>
                                                                    </Col>
                                                                    <Col sm={7} id="rs_CreateOffer_logo">
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
                                                                            //isRefresh={!!logo}
                                                                            isBase64Status={true}
                                                                            isPrefix={true}
                                                                            base64Data={handleLogoUpload}
                                                                            //required
                                                                            // rules={{
                                                                            //     required: UPLOAD_LOGO,
                                                                            // }}
                                                                            resetValue={() => {
                                                                                setValue('logo', '');
                                                                            }}
                                                                        />
                                                                    </Col>
                                                                </Row>
                                                                {logo && (
                                                                    <div className="position-absolute right-41 top0">
                                                                        <RSTooltip text={'Reset image'}>
                                                                            <i
                                                                                id="rs_data_refresh"
                                                                                className={`${restart_large} color-primary-blue icon-md`}
                                                                                onClick={() => {
                                                                                    setValue('logo', '');
                                                                                    resetField('logo');
                                                                                }}
                                                                            ></i>
                                                                        </RSTooltip>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="form-group">
                                                                <Row>
                                                                    <Col sm={{ offset: 2, span: 3 }} className="text-right">
                                                                        <label className="control-label-left">{DISPLAY_NAME_LABEL}</label>
                                                                    </Col>
                                                                    <Col sm={7} id="rs_CreateOffer_displayName">
                                                                        <RSInput
                                                                            name="displayName"
                                                                            control={control}
                                                                            placeholder={DISPLAY_NAME_PLACEHOLDER}
                                                                            maxLength={MAX_LENGTH255}
                                                                            required
                                                                            rules={{
                                                                                required: ENTER_DISPLAY_NAME,
                                                                            }}
                                                                        />
                                                                    </Col>
                                                                </Row>
                                                            </div>
                                                            <div className="form-group" ref={bannerErrorRef} id="rs_CreateOffer_bannerImages">
                                                                {bannerImageFields.map((field, index) => {
                                                                    const atBannerLimit = bannerImageFields.length >= MAX_BANNER_TABS;
                                                                    const firstBannerHasImage = !!bannerImages?.[0]?.image;
                                                                    const showPlusOnBanner1 = index === 0;
                                                                    const isLastBanner = index === bannerImageFields.length - 1;

                                                                    return (
                                                                        <div className={`position-relative ${isLastBanner ? '' : 'form-group'}`} key={field.id}>
                                                                            <Row className="align-items-center">
                                                                                <Col
                                                                                    sm={{ offset: 2, span: 3 }}
                                                                                    className="text-right d-flex justify-content-end align-items-center"
                                                                                >
                                                                                    <label className="control-label-left mb0">{`Banner ${index + 1}`}</label>
                                                                                </Col>
                                                                                <Col sm={7} className="position-relative">
                                                                                    <RSFileUpload
                                                                                        name={`bannerImages.${index}.image`}
                                                                                        control={control}
                                                                                        setError={setError}
                                                                                        clearErrors={clearErrors}
                                                                                        text="Browse"
                                                                                        placeholder="Choose banner image"
                                                                                        accept=".jpg,.jpeg,.png"
                                                                                        isbase64={true}
                                                                                        fileType="img"
                                                                                        watch={watch}
                                                                                        isBase64Status={true}
                                                                                        isPrefix={true}
                                                                                        isUploadResetIconOutside
                                                                                        isRefresh
                                                                                        base64Data={(base64Image, fileName, contentLength) =>
                                                                                            handleBannerImageUpload(base64Image, fileName, contentLength, index)
                                                                                        }
                                                                                        required={index === 0}
                                                                                        rules={
                                                                                            index === 0
                                                                                                ? {
                                                                                                    required: UPLOAD_BANNER_IMAGE,
                                                                                                }
                                                                                                : {}
                                                                                        }
                                                                                        resetValue={() => {
                                                                                            setValue(`bannerImages.${index}.image`, '', {
                                                                                                shouldValidate: true,
                                                                                                shouldDirty: true,
                                                                                            });
                                                                                            handleBannerResetIconVisible(index, false);
                                                                                        }}
                                                                                        onResetIconVisible={(visible) =>
                                                                                            handleBannerResetIconVisible(index, visible)
                                                                                        }
                                                                                    />
                                                                                    <div className={`Left100 position-absolute top-2 lh0 ${bannerResetIconVisible[index] ? ' ml35' : ''}`}>
                                                                                        {showPlusOnBanner1 && (
                                                                                            <RSTooltip
                                                                                                text={'Add'}
                                                                                                className={`${atBannerLimit || !firstBannerHasImage
                                                                                                    ? 'click-off pe-none'
                                                                                                    : ''
                                                                                                    } d-inline-flex`}
                                                                                            >
                                                                                                <i
                                                                                                    className={`${circle_plus_fill_edge_medium} icon-md flex-shrink-0 color-primary-blue`}
                                                                                                    onClick={() => {
                                                                                                        if (atBannerLimit) return;
                                                                                                        if (!firstBannerHasImage) return;
                                                                                                        appendBannerImage({ image: '' });
                                                                                                    }}
                                                                                                />
                                                                                            </RSTooltip>
                                                                                        )}
                                                                                        {index > 0 && (
                                                                                            <RSTooltip text={'Remove'} className='d-inline-flex'>
                                                                                                <i
                                                                                                    className={`${circle_minus_fill_medium} color-primary-red icon-md cp`}
                                                                                                    onClick={() => {
                                                                                                        removeBannerImage(index);
                                                                                                    }}
                                                                                                />
                                                                                            </RSTooltip>
                                                                                        )}
                                                                                    </div>
                                                                                </Col>

                                                                            </Row>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                            <div className="form-group">
                                                                <Row>
                                                                    <Col sm={{ offset: 2, span: 3 }} className="text-right">
                                                                        <label className="control-label-left">{PREVIEW_IMAGE}</label>
                                                                    </Col>
                                                                    <Col sm={7} id="rs_CreateOffer_logo">
                                                                        <RSFileUpload
                                                                            name="previewImage"
                                                                            control={control}
                                                                            setError={setError}
                                                                            clearErrors={clearErrors}
                                                                            text="Browse"
                                                                            placeholder="Choose preview image"
                                                                            accept=".jpg,.jpeg,.png"
                                                                            isbase64={true}
                                                                            fileType="img"
                                                                            watch={watch}
                                                                            //isRefresh={!!previewImage}
                                                                            isBase64Status={true}
                                                                            isPrefix={true}
                                                                            base64Data={handlePreviewImageUpload}
                                                                            // required
                                                                            // rules={{
                                                                            //     required: UPLOAD_LOGO,
                                                                            // }}
                                                                            resetValue={() => {
                                                                                setValue('previewImage', '');
                                                                            }}
                                                                        />
                                                                    </Col>
                                                                </Row>
                                                                {previewImage && (
                                                                    <div className="position-absolute right-41 top0">
                                                                        <RSTooltip text={'Reset image'}>
                                                                            <i
                                                                                id="rs_data_refresh"
                                                                                className={`${restart_large} color-primary-blue icon-md`}
                                                                                onClick={() => {
                                                                                    setValue('previewImage', '');
                                                                                    resetField('previewImage');
                                                                                }}
                                                                            ></i>
                                                                        </RSTooltip>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </>
                                                        {/* Offer Description, Offer Details, and Terms and Conditions Tabs */}
                                                        <div className="form-group" ref={bannerConditionsErrorRef}>
                                                            <Row>
                                                                <Col sm={{ offset: 2, span: 10 }}>
                                                                    <div className="create-offer-offer-tabs">
                                                                        <RSTabbar
                                                                            heading=" "
                                                                            noHeader
                                                                            flatTabs
                                                                            disableWrapperTransition
                                                                            extraClassName="mx0"
                                                                            className="rs-tabs"
                                                                            dynamicTab="rs-content-tabs-flat col-sm-12"
                                                                            defaultClass="tabTransparent"
                                                                            activeClass="active"
                                                                            defaultTab={offerContentTabIndex}
                                                                            tabData={offerContentTabData}
                                                                            callBack={(_, index) => setOfferContentTabIndex(index)}
                                                                        />
                                                                    </div>
                                                                </Col>
                                                            </Row>
                                                        </div>
                                                        {/* Code Setup Section - shown only when display name, logo, and at least one banner image are filled */}

                                                    </Col>
                                                    <Col sm={5} className='pr0 pl30'>
                                                        {/* Preview Section for Display Details */}
                                                        {offerType && Object.keys(offerType).length > 0
                                                            // &&
                                                            //     usageClaimLimit &&
                                                            //     limitByDuration &&
                                                            //     totalRedemption
                                                            && (
                                                                <>
                                                                    {/* Show skeleton when no content is available */}
                                                                    {/* {!(logo || displayName || description || offerDetails || termsAndConditions || (bannerImages && bannerImages.length > 0 && bannerImages.some(img => img?.image))) ? (
                                                                        <OfferPreviewSkeleton />
                                                                    ) : ( */}
                                                                    <div className='offer-preview-container'>
                                                                        <div className="offer-preview-scroll-wrapper">
                                                                            {!noPreview && (

                                                                                <Card className="offer-preview-card">
                                                                                    <Card.Body
                                                                                        className="offer-card-body d-flex flex-column p-0"
                                                                                        style={{ maxHeight: 'calc(100vh - 140px)' }}
                                                                                    >
                                                                                        {/* Header: Logo and Display Name */}
                                                                                        <div className="preview-header p-2 border-bottom">
                                                                                            <div className="d-flex align-items-center">
                                                                                                <div className={`preview-logo-container me-3 `}>                                                {/* Logo */}
                                                                                                    {logo ? (
                                                                                                        <img
                                                                                                            src={logo}
                                                                                                            alt="Logo"
                                                                                                            className='preview-logo'
                                                                                                        />
                                                                                                    ) : <div className="preview-logo-container me-3 position-relative bottom4">
                                                                                                        <CommonSkeleton circle height={35} width={35} enableAnimation={false} />
                                                                                                    </div>
                                                                                                    }
                                                                                                </div>
                                                                                                {/* Display Name */}
                                                                                                {displayName && (
                                                                                                    <span className="preview-display-name">
                                                                                                        {displayName?.length > 23 ?
                                                                                                            <RSTooltip text={displayName} position='top' innerContent={false}>
                                                                                                                <h4 className="mb-0 ">
                                                                                                                    {truncateTitle(displayName, 23)}
                                                                                                                </h4>
                                                                                                            </RSTooltip>
                                                                                                            : <h4 className="mb-0 ">
                                                                                                                {displayName}
                                                                                                            </h4>}

                                                                                                    </span>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className='offer-preview-content-wrapper css-scrollbar'>
                                                                                            {/* Banner Section - Full-width professional banner */}
                                                                                            <div className="preview-banner-section position-sticky">
                                                                                                <div className="preview-banner-container py10 pl10 pr5">
                                                                                                    {/* Banner Images - Carousel */}
                                                                                                    {(() => {
                                                                                                        const sources = Array.isArray(bannerImages)
                                                                                                            ? bannerImages.map((b) => b?.image).filter(Boolean)
                                                                                                            : [];
                                                                                                        if (sources.length === 0) return null;
                                                                                                        if (sources.length === 1) {
                                                                                                            return (
                                                                                                                <div className="position-relative">
                                                                                                                    <img
                                                                                                                        src={sources[0]}
                                                                                                                        alt="Banner"
                                                                                                                        className='preview-banner'
                                                                                                                    />
                                                                                                                </div>
                                                                                                            );
                                                                                                        }
                                                                                                        return (
                                                                                                            <Carousel
                                                                                                                interval={null}
                                                                                                                indicators={sources.length > 1}
                                                                                                                controls={sources.length > 1}
                                                                                                                className="preview-banner-carousel"
                                                                                                            >
                                                                                                                {sources.map((src, index) => (
                                                                                                                    <Carousel.Item key={`${index}-${src}`}>
                                                                                                                        <div className="position-relative">
                                                                                                                            <img
                                                                                                                                src={src}
                                                                                                                                alt={`Banner ${index + 1}`}
                                                                                                                                className='preview-banner'
                                                                                                                            />
                                                                                                                        </div>
                                                                                                                    </Carousel.Item>
                                                                                                                ))}
                                                                                                            </Carousel>
                                                                                                        );
                                                                                                    })()}
                                                                                                </div>
                                                                                            </div>
                                                                                            {/* Description */}
                                                                                            <div className='rs-offer preview-content px-4 pb-4 flex-grow-1 d-flex flex-column pe-none'>
                                                                                                {description && (
                                                                                                    <div className="preview-description mt21 " >
                                                                                                        <small className='text-muted  preview-placeholder-text'> {parse(description)}</small>
                                                                                                    </div>
                                                                                                )}

                                                                                                {/* Offer Details */}
                                                                                                {offerDetails && (
                                                                                                    <div className="preview-offer-details mt16" >
                                                                                                        <small className='text-muted  preview-placeholder-text'> {parse(offerDetails)}</small>
                                                                                                    </div>
                                                                                                )}

                                                                                                {/* Terms and Conditions */}
                                                                                                {termsAndConditions && (
                                                                                                    <div className="preview-terms mt16" >
                                                                                                        <small className='text-muted  preview-placeholder-text'>{parse(termsAndConditions)}</small>
                                                                                                    </div>
                                                                                                )}    </div>
                                                                                        </div>

                                                                                    </Card.Body>
                                                                                </Card>)}
                                                                        </div>
                                                                    </div>

                                                                    {/* )} */}
                                                                </>
                                                            )}</Col>
                                                </Row>
                                            </div>
                                        </div>
                                    )}

                                {
                                    // displayName && logo && bannerImages && bannerImages.length > 0 
                                    offerType && Object.keys(offerType).length > 0
                                    // && bannerImages.some(img => img?.image) 
                                    && (
                                        <div className='box-design p0 offer-codeSnippet-wrapper'>
                                            <h4 className='border-bottom mb19 pb13 pt19 px19'>{'Code & Snippet'}</h4>
                                            <div className="form-group">
                                                <Row>
                                                    <Col sm={3} className="text-right">
                                                        <label className="control-label-left">Code media type</label>
                                                    </Col>
                                                    <Col sm={7} id="rs_CreateOffer_mediaType">
                                                        <ul className="rs-list-inline ">
                                                            <li>
                                                                <RSCheckbox
                                                                    name="mediaTypeCode"
                                                                    control={control}
                                                                    labelName="Code"
                                                                    defaultValue={true}
                                                                    disabled={true}
                                                                    disabledchk={true}
                                                                />
                                                            </li>
                                                            <li>
                                                                <RSCheckbox
                                                                    name="mediaTypeSnippet"
                                                                    control={control}
                                                                    labelName="Snippet"
                                                                    defaultValue={false}
                                                                />
                                                            </li>
                                                        </ul>
                                                    </Col>
                                                </Row>
                                            </div>

                                            <div className="form-group">
                                                <Row>
                                                    <Col sm={3} className="text-right">
                                                        <label className="control-label-left mt-5">{OFFER_CODE_TYPE}</label>
                                                    </Col>
                                                    <Col sm={7}>
                                                        <ul className="position-relative rs-list-inline  d-flex align-items-center">
                                                            <div className={offerCodeType ? 'click-off' : ''}>
                                                                {offerCodeType && <div className="validation-message position-absolute top-25 pl2">{offerCodeType.message}</div>}
                                                                <li>
                                                                    <RSRadioButton
                                                                        name="offerCodeType"
                                                                        id="rs_CreateOffer_common"
                                                                        control={control}
                                                                        labelName={'Common'}
                                                                        placeholder={OFFER_CODE_TYPE}
                                                                        required
                                                                        rules={{
                                                                            required: OFFER_CODE_TYPE_MSG,
                                                                        }}
                                                                        handleChange={handleChange}
                                                                        isError={false}
                                                                    />
                                                                </li>
                                                                <li>
                                                                    <RSRadioButton
                                                                        name="offerCodeType"
                                                                        id="rs_CreateOffer_unique"
                                                                        control={control}
                                                                        labelName={'Unique'}
                                                                        placeholder={OFFER_CODE_TYPE}
                                                                        // required
                                                                        // rules={{
                                                                        //     required: OFFER_CODE_TYPE_MSG,
                                                                        // }}
                                                                        handleChange={handleChange}
                                                                        isError={false}
                                                                    />
                                                                </li>
                                                            </div>
                                                            <RSPPophover position={'top'} className="rs-tooltip-text-multi" text={
                                                                <>
                                                                    <ul>
                                                                        <li>{COMMON_TEXT}</li>
                                                                        <li>
                                                                            {UNIQUE_TEXT}
                                                                        </li>
                                                                    </ul>
                                                                </>
                                                            }>
                                                                <i
                                                                    className={`${circle_question_mark_mini} color-primary-blue icon-xs mr15 position-relative top-3`}
                                                                    id="circle_question_mark"
                                                                />
                                                            </RSPPophover>
                                                            {offerCodeType && (
                                                                <li>
                                                                    <RSTooltip
                                                                        className=" rs-tooltip-wrapper mt-3"
                                                                        text={RESET}
                                                                        position="top"
                                                                    >
                                                                        <i
                                                                            className={`${restart_medium} icon-md color-primary-blue`}
                                                                            onClick={() => {
                                                                                setIsReset({
                                                                                    show: true,
                                                                                    type: 'offerType'
                                                                                });
                                                                                setRefreshFlag(false);
                                                                                setValue('previewData', '');
                                                                                setTemplateError('')
                                                                            }}
                                                                        ></i>
                                                                    </RSTooltip>
                                                                </li>
                                                            )}
                                                        </ul>
                                                    </Col>
                                                </Row>
                                            </div>

                                            {/* Static fields - Offer code */}
                                            {isStatic && (
                                                <div className="form-group">
                                                    <Row>
                                                        <Col sm={3} className="text-right">
                                                            <label className="control-label-left">{OFFER_CODE}</label>
                                                        </Col>
                                                        <Col sm={3} className='offer-volume-length-container'>
                                                            <RSInput
                                                                name="offerCode"
                                                                control={control}
                                                                id="rs_CreateOffer_offercode"
                                                                required
                                                                placeholder={OFFER_CODE}
                                                                maxLength={MAX_LENGTH15}
                                                                rules={{
                                                                    required: OFFER_CODE_MSG,
                                                                }}
                                                            />
                                                        </Col>
                                                    </Row>
                                                </div>
                                            )}

                                            {/* Dynamic fields */}
                                            {isDynamic && (
                                                <>
                                                    <div className="form-group">
                                                        <Row>
                                                            <Col sm={3} className="text-right">
                                                                <label className="control-label-left">{VOLUME_LENGTH}</label>
                                                            </Col>
                                                            <Col sm={3} className='offer-volume-length-container'>
                                                                <RSInput
                                                                    name="volume"
                                                                    id="rs_CreateOffer_volume"
                                                                    control={control}
                                                                    required
                                                                    placeholder={CODE_VOLUME}
                                                                    onKeyDown={onlyNumbers}
                                                                    rules={{
                                                                        required: VOLUME,
                                                                        validate: (value) => {
                                                                            return Number(value) === 0 ? ENTER_VALID_VOLUME : true;
                                                                        },
                                                                    }}
                                                                    maxLength={MAX_LENGTH5}
                                                                    handleOnBlur={({ target: { value } }) => {
                                                                        Number(value) === 0 &&
                                                                            setError('volume', {
                                                                                type: 'custom',
                                                                                message: ENTER_VALID_VOLUME,
                                                                            });
                                                                    }}
                                                                />
                                                                <div className="fg-icons float-end">
                                                                    <RSPPophover text={THE_NUMBER_OF_OFFERS}>
                                                                        <i
                                                                            className={`${circle_question_mark_mini} color-primary-blue icon-xs`}
                                                                            id="circle_question_mark"
                                                                        ></i>
                                                                    </RSPPophover>
                                                                </div>
                                                            </Col>

                                                            <Col sm={3} className='offer-volume-length-container'>
                                                                <RSInput
                                                                    name="length"
                                                                    id="rs_CreateOffer_length"
                                                                    control={control}
                                                                    required
                                                                    rules={{
                                                                        required: LENGTH_MSG,
                                                                        validate: (value) => {
                                                                            const num = Number(value);
                                                                            // 0 is invalid
                                                                            if (num === 0) {
                                                                                return 'Enter valid length';
                                                                            }
                                                                            // Minimum value
                                                                            if (num < 6) {
                                                                                return 'Enter length 6 to equal to 12';
                                                                            }
                                                                            // Maximum value
                                                                            if (num > 12) {
                                                                                return 'Enter length 6 to equal to 12';
                                                                            }
                                                                            return true;
                                                                        },
                                                                    }}
                                                                    placeholder={CODE_LENGTH}
                                                                    onKeyDown={onlyNumbers}
                                                                    maxLength={12}
                                                                    handleOnchange={() => {
                                                                        clearErrors('length')
                                                                        setValue('codePattern', '');
                                                                        setValue('display', '');
                                                                        setValue('previewData', '');

                                                                    }}
                                                                    handleOnBlur={({ target: { value } }) => {
                                                                        const num = Number(value);
                                                                        if (num === 0 && value !== '') {
                                                                            setError('length', {
                                                                                type: 'custom',
                                                                                message: 'Enter valid length',
                                                                            });
                                                                        } else if (num < 6 && value !== '') {
                                                                            setError('length', {
                                                                                type: 'custom',
                                                                                message: 'Enter length 6 to equal to 12',
                                                                            });
                                                                        } else if (num > 12) {
                                                                            setError('length', {
                                                                                type: 'custom',
                                                                                message: 'Enter length 6 to equal to 12',
                                                                            });
                                                                        }
                                                                    }}
                                                                />
                                                                <div className="fg-icons float-end">
                                                                    <RSPPophover text={OFFER_CODE_CHARACTER_LIMIT}>
                                                                        <i
                                                                            className={`${circle_question_mark_mini} color-primary-blue icon-xs`}
                                                                            id="circle_question_mark"
                                                                        ></i>
                                                                    </RSPPophover>
                                                                </div>
                                                            </Col>

                                                        </Row>
                                                    </div>

                                                    {/* Generate new codes fields */}
                                                    {isDynamic && (
                                                        <>
                                                            {/* <div className={previewData ? 'click-off' : ''}> */}
                                                            <div>
                                                                {/* <div className="form-group">
                                                                <Row>
                                                                    <Col sm={3} className="text-right">
                                                                        <label className="control-label-left">{LENGTH}</label>
                                                                    </Col>
                                                                    <Col sm={7}>
                                                                        <RSInput
                                                                            name="length"
                                                                            id="rs_CreateOffer_length"
                                                                            control={control}
                                                                            required
                                                                            rules={{
                                                                                required: LENGTH_MSG,
                                                                                validate: (value) => {
                                                                                    return Number(value) === 0
                                                                                        ? 'Enter valid length'
                                                                                        : Number(value) > 12
                                                                                            ? 'Enter value less than or equal to 12'
                                                                                            : true;
                                                                                },
                                                                            }}
                                                                            placeholder={CODE_LENGTH}
                                                                            onKeyDown={onlyNumbers}
                                                                            maxLength={2}
                                                                            handleOnchange={() => {
                                                                                clearErrors('length')
                                                                                setValue('codePattern', '');
                                                                                setValue('display', '');
                                                                                setValue('previewData', '');

                                                                            }}
                                                                        />
                                                                    </Col>
                                                                </Row>
                                                            </div> */}
                                                                {/* <div className={`form-group ${length > 0 ? '' : 'click-off'}`}> */}

                                                                <div className='form-group'>
                                                                    <Row className='align-items-baseline'>
                                                                        <Col sm={3} className="text-right">
                                                                            <label className="control-label-left mt-5">{ADD_OFFER_FORMAT}</label>
                                                                        </Col>
                                                                        <Col sm={7}>
                                                                            <ul className="rs-list-inline">
                                                                                <li>
                                                                                    <RSCheckbox
                                                                                        name="formatCapital"
                                                                                        control={control}
                                                                                        required={getOfferCode === "Unique"}
                                                                                        rules={{
                                                                                            validate: () => {
                                                                                                // If any format is already selected → skip validation
                                                                                                if (composeUsingValues) return true;

                                                                                                // If no format selected → show error
                                                                                                if (
                                                                                                    !watch("formatCapital") &&
                                                                                                    !watch("formatNumber") &&
                                                                                                    !watch("formatSmall")
                                                                                                ) {
                                                                                                    return SELECT_ATLEAST_ONE;
                                                                                                }

                                                                                                return true;
                                                                                            }
                                                                                        }}
                                                                                        labelName={FORMAT_LABEL_CAPITAL}
                                                                                        handleChange={handleChange}
                                                                                    />

                                                                                </li>
                                                                                <li>
                                                                                    <RSCheckbox
                                                                                        name="formatSmall"
                                                                                        control={control}
                                                                                        // disabled={refreshFlag}
                                                                                        required={getOfferCode === "Unique"}
                                                                                        labelName={FORMAT_LABEL_SMALL}
                                                                                        isError={false}
                                                                                        handleChange={handleChange}
                                                                                    />
                                                                                </li>
                                                                                <li>
                                                                                    <RSCheckbox
                                                                                        name="formatNumber"
                                                                                        control={control}
                                                                                        // disabled={refreshFlag}
                                                                                        required={getOfferCode === "Unique"}
                                                                                        rules={{
                                                                                            required: getOfferCode === "Unique" ? "Please select format number" : false
                                                                                        }}
                                                                                        labelName={FORMAT_LABEL_NUMBER}
                                                                                        isError={false}
                                                                                        handleChange={handleChange}
                                                                                    />
                                                                                </li>
                                                                                <li
                                                                                    className={`position-relative  ${length > 12 ? 'click-off' : ''
                                                                                        }`}
                                                                                >
                                                                                    <RSTooltip
                                                                                        text={`${refreshFlag ? 'Reset' : 'Settings'}`}
                                                                                        position="top"
                                                                                        className='lh0'
                                                                                    >
                                                                                        <i
                                                                                            className={`${refreshFlag
                                                                                                ? restart_medium
                                                                                                : settings_medium
                                                                                                } icon-md color-primary-blue`}
                                                                                            onClick={hanldeFormatRefresh}
                                                                                        ></i>
                                                                                    </RSTooltip>
                                                                                </li>
                                                                            </ul>
                                                                        </Col>
                                                                    </Row>
                                                                </div>


                                                                {refreshFlag && (
                                                                    <>
                                                                        <div className="form-group">
                                                                            <Row >
                                                                                <Col sm={3} className="text-right">
                                                                                    <label className="control-label-left">
                                                                                        {COMPOSE_USING}
                                                                                    </label>
                                                                                </Col>
                                                                                <Col sm={3} className='offer-volume-length-container'>
                                                                                    <RSTextarea
                                                                                        name="composeUsing"
                                                                                        id="rs_CreateOffer_composeUsing"
                                                                                        control={control}
                                                                                        onKeyDown={preventSpaceOnlyInput}
                                                                                        rules={{
                                                                                            validate: (value) => {
                                                                                                // if any format is selected, skip validation
                                                                                                if (getFormatCapital || getFormatNumber || getFormatSmall) return true;

                                                                                                // Check for empty or only whitespace
                                                                                                if (!value || value.trim().length === 0) return 'Empty space not allowed';

                                                                                                // Check if value contains any spaces
                                                                                                if (value.includes(' ')) return 'Spaces not allowed';

                                                                                                // Check minimum length
                                                                                                if (value.trim().length < 3) return 'Minimum 3 characters required';

                                                                                                return true;
                                                                                            }
                                                                                        }}
                                                                                        placeholder={COMPOSE_USING}
                                                                                        handleChange={handleChange}
                                                                                        handleOnchange={(e) => {
                                                                                            setValue('display', '');
                                                                                            setValue('previewData', '');
                                                                                            clearErrors('composeUsing');
                                                                                            handleComposeUsingChange(e);
                                                                                        }}
                                                                                        maxLength={MAX_LENGTH100}
                                                                                    // onKeyDown={charNumUnderScore}
                                                                                    />
                                                                                    <small className="text-end">{composeUsing?.length || 0}/100</small>
                                                                                </Col>
                                                                            </Row>
                                                                        </div>
                                                                        <div className="form-group">
                                                                            <Row>
                                                                                <Col sm={3} className="text-right">
                                                                                    <label className="control-label-left">
                                                                                        {CODE_PATTERN}
                                                                                    </label>
                                                                                </Col>
                                                                                <Col sm={3} className='offer-volume-length-container'>
                                                                                    <RSInput
                                                                                        name="codePattern"
                                                                                        id="rs_CreateOffer_codePattern"
                                                                                        control={control}
                                                                                        required
                                                                                        rules={{
                                                                                            // required: CODE_PATTERN_MSG,
                                                                                            required: CODE_PATTERN_MSG,
                                                                                            validate: (value) => {
                                                                                                if (offerCodeType !== 'Unique') {
                                                                                                    return true;
                                                                                                }
                                                                                                if (!value) {
                                                                                                    return CODE_PATTERN || 'Code Pattern is required';
                                                                                                }
                                                                                                const expectedLength = Number(length);
                                                                                                if (expectedLength && value.length !== expectedLength) {
                                                                                                    return `Code Pattern length must be exactly ${expectedLength}`;
                                                                                                }
                                                                                                if (!value.includes('#')) {
                                                                                                    return 'Code Pattern must contain at least one # placeholder';
                                                                                                }
                                                                                                return true;
                                                                                            }
                                                                                        }}
                                                                                        placeholder={CODE_PATTERN}
                                                                                        handleChange={handleChange}
                                                                                        handleOnBlur={(e) => {
                                                                                            if (e.target.value?.length > 0) {
                                                                                                clearErrors("codePattern");
                                                                                            }
                                                                                        }}
                                                                                        handleOnchange={() => {
                                                                                            clearErrors("codePattern");
                                                                                            setValue('display', '')
                                                                                        }}
                                                                                        maxLength={Number(length)}
                                                                                    />
                                                                                    <small>
                                                                                        {HASHES_CHARACTERS}
                                                                                    </small>
                                                                                </Col>
                                                                            </Row>
                                                                        </div>
                                                                    </>
                                                                )}

                                                                {/* <div className={`form-group ${length > 0 ? '' : 'click-off'}`}> */}
                                                                <div className='form-group'>

                                                                    <Row className='align-items-baseline'>
                                                                        <Col sm={3} className="text-right">
                                                                            <label className="control-label-left mt-5">{DISPLAY_AS}</label>
                                                                        </Col>
                                                                        <Col sm={7}>
                                                                            <ul className="rs-list-inline position-relative">
                                                                                <li>
                                                                                    <RSRadioButton
                                                                                        id="rs_CreateOffer_text"
                                                                                        name="display"
                                                                                        control={control}
                                                                                        labelName={TEXT}
                                                                                        required
                                                                                        rules={{
                                                                                            required: SELECT_DISPLAY_AS,
                                                                                        }}
                                                                                        handleChange={handleChangeDisplay}
                                                                                    />
                                                                                </li>
                                                                                <li>
                                                                                    <RSRadioButton
                                                                                        name="display"
                                                                                        labelName={QR_CODE}
                                                                                        id="rs_CreateOffer_qrcode"
                                                                                        control={control}
                                                                                        required
                                                                                        rules={{
                                                                                            required: SELECT_DISPLAY_AS,
                                                                                        }}
                                                                                        isError={false}
                                                                                        handleChange={handleChangeDisplay}
                                                                                    />
                                                                                </li>
                                                                                <li>
                                                                                    <RSRadioButton
                                                                                        name="display"
                                                                                        id="rs_CreateOffer_Barcode"
                                                                                        labelName={BAR_CODE}
                                                                                        control={control}
                                                                                        required
                                                                                        rules={{
                                                                                            required: SELECT_DISPLAY_AS,
                                                                                        }}
                                                                                        isError={false}
                                                                                        handleChange={handleChangeDisplay}
                                                                                    />
                                                                                </li>
                                                                                {display && (
                                                                                    <li className="position-relative  pe-auto" style={{ pointerEvents: 'auto' }}>
                                                                                        <RSTooltip
                                                                                            text={RESET}
                                                                                            position="top"
                                                                                        >
                                                                                            <i
                                                                                                className={`${restart_medium} icon-md color-primary-blue`}
                                                                                                onClick={() => {
                                                                                                    resetField('display');
                                                                                                    setValue('previewData', '');
                                                                                                    setGenerateFlag(false);
                                                                                                }}
                                                                                                style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                                                                                            ></i>
                                                                                        </RSTooltip>
                                                                                    </li>
                                                                                )}
                                                                            </ul>
                                                                        </Col>
                                                                    </Row>
                                                                </div>
                                                            </div>
                                                            {
                                                                ((generateFlag || !!previewData) ||
                                                                    display === 'QR code' ||
                                                                    display === 'Bar code') &&

                                                                ((getFormatCapital || getFormatNumber || getFormatSmall) || composeUsing) &&

                                                                (refreshFlag ? (getCodePattern?.length > 0) : true) &&
                                                                (!getlength == 0 || !Number(getlength) < 3 || !Number(getlength) > 12 || !getlength) &&
                                                                (errors?.length?.message == undefined) &&
                                                                (
                                                                    <div className="form-group mt30">
                                                                        <Row>
                                                                            {display === 'QR code' && (
                                                                                <Col sm={3} className="text-right">
                                                                                    <label className="control-label-left">{PREVIEW}</label>
                                                                                </Col>
                                                                            )}
                                                                            {display === 'Bar code' && (
                                                                                <Col sm={3} className="text-right">
                                                                                    <label className="control-label-left">{PREVIEW}</label>
                                                                                </Col>
                                                                            )}
                                                                            {display === 'QR code' && (
                                                                                <Col sm={3}>
                                                                                    {/* {previewData && (
                                                                                        <Card className="rs-offer-box width100p rob-text">
                                                                                            {previewData}
                                                                                        </Card>
                                                                                    )} */}

                                                                                    <Card className="rs-offer-box rob-qrcode p-3">
                                                                                        <img src={QRcode} alt="QR code" />
                                                                                        {previewData && (
                                                                                            <span className="d-flex justify-content-center position-relative top5">
                                                                                                {previewData}
                                                                                            </span>)}
                                                                                    </Card>
                                                                                </Col>

                                                                            )}
                                                                            {display === 'Bar code' && (
                                                                                <Col sm={3}>
                                                                                    {previewData && (
                                                                                        <>
                                                                                            {/* <Card className="rs-offer-box width100p rob-text">
                                                                                                {previewData}
                                                                                            </Card> */}
                                                                                            <Card className="d-flex p-3 rs-offer-box rob-barcode">

                                                                                                <img src={Barcode} alt="Bar code" />
                                                                                                {previewData && (
                                                                                                    <span className="d-flex justify-content-center position-relative top5">
                                                                                                        {previewData}
                                                                                                    </span>)}
                                                                                            </Card>
                                                                                        </>
                                                                                    )}

                                                                                </Col>
                                                                            )}
                                                                            {display === 'Text' && (
                                                                                <>
                                                                                    <Col sm={3} className="text-right">
                                                                                        <label className="control-label-left">{PREVIEW}</label>
                                                                                    </Col>
                                                                                    <Col sm={3}>
                                                                                        <Card className="rs-offer-box  rob-text">
                                                                                            {previewData && previewData}
                                                                                        </Card>
                                                                                    </Col>
                                                                                </>
                                                                            )}
                                                                        </Row>
                                                                    </div>
                                                                )}

                                                            {/* Snippet Template - shown when mediaTypeSnippet is checked OR when display is selected (QR code, Bar code, or Text with preview) OR when code type is Common/Static */}
                                                            {/* {(mediaTypeSnippet || ((generateFlag || !!previewData) || display === 'QR code' || display === 'Bar code') || isStatic) && ( */}



                                                            {/* {(mediaTypeSnippet && display == "Text") && ( */}

                                                        </>
                                                    )}
                                                </>
                                            )}

                                            {
                                                getOfferCode &&

                                                <div className="form-group mt30">
                                                    <Row>


                                                        <Col sm={3} className="text-right">
                                                            <label className="control-label-left">{PREVIEW}</label>
                                                        </Col>

                                                        <Col sm={3}>
                                                            <Card className="rs-offer-box rob-text">
                                                                {getOfferCode}
                                                            </Card>

                                                        </Col>

                                                    </Row>
                                                </div>
                                            }

                                            {(mediaTypeSnippet) && (

                                                <>
                                                    <Row>
                                                        <Col sm={{ offset: 3, span: 7 }}>
                                                            <p className='color-primary-red' ref={templateErrorRef}>{templateError}</p>
                                                        </Col>
                                                    </Row>
                                                    <Row className="form-group">

                                                        <Col sm={3}>

                                                        </Col>
                                                        <Col sm={7}>

                                                            <SnippetTemplate
                                                                mediaTypeCode={mediaTypeCode}
                                                                mediaTypeSnippet={mediaTypeSnippet || ((generateFlag || !!previewData) || display === 'QR code' || display === 'Bar code') || isStatic}
                                                                autoSelectSnippetId={snippetIdToSelect}
                                                                handleSave={handleSave}
                                                                isSaveLoading={isSaveButtonLoading}
                                                            /></Col>
                                                    </Row>
                                                </>
                                            )}
                                        </div>
                                    )}
                                <div className="buttons-holder">
                                    <RSSecondaryButton
                                        blockInteraction={isSubmitting}
                                        onClick={() => {
                                            if (isSubmitting) return;
                                            reset();
                                            navigate('/preferences/offer-management');
                                        }}
                                        id="rs_CreateOffer_Cancel"
                                    >
                                        {CANCEL}
                                    </RSSecondaryButton>

                                    <RSPrimaryButton
                                        onClick={handleSubmit(
                                            (data) => {
                                                setSaveBtnClick(true);
                                                handleSave(data, true);
                                            },
                                            handleFormInvalid
                                        )}
                                        id="rs_CreateOffer_Publish"
                                        isLoading={isPublishButtonLoading}
                                        blockBodyPointerEvents={isPublishButtonLoading}
                                        disabledClass={isSaveButtonLoading ? 'pe-none click-off' : ''}
                                    >
                                        {isPublished == 1 ? 'Unpublish' : 'Publish'}
                                    </RSPrimaryButton>

                                    <RSPrimaryButton
                                        type="submit"
                                        id="rs_CreateOffer_Save"
                                        onClick={handleSubmit(
                                            (data) => {
                                                setSaveBtnClick(true);
                                                handleSave(data, false);
                                            },
                                            handleFormInvalid
                                        )}
                                        isLoading={isSaveButtonLoading}
                                        blockBodyPointerEvents={isSaveButtonLoading}
                                        disabledClass={isPublishButtonLoading ? 'pe-none click-off' : ''}
                                    >
                                        {getIsEdit ? UPDATE : SAVE}
                                    </RSPrimaryButton>
                                </div>

                            </form>
                            </PreferencesSubPageSkeletonGate>

                            {isReset?.show &&
                                <RSConfirmationModal
                                    show={isReset?.show}
                                    header={RESET}
                                    isCloseButton={false}
                                    text={ARE_YOU_SURE_WANT_TO_RESET}
                                    handleConfirm={(status) => {
                                        if (status) {
                                            if (isReset?.type === 'offerType') {
                                                hanldeOfferCodeRefresh()
                                            } else if (isReset?.type === 'offerTypeDDL') {

                                                hanldeOffertypeRefresh()
                                            } else {
                                                handleVolumeRefresh()

                                            }
                                            setIsReset({
                                                show: false,
                                                type: ''
                                            });
                                        }
                                    }}
                                    handleClose={() => {
                                        setIsReset({
                                            show: false,
                                            type: ''
                                        });
                                    }}
                                />}
                            {getWarningPopupMessage(failureApiErrors, dispatch)}
                        </Container>
                    </div>
                </Container>
            </div>
        </FormProvider>
    );
};

export default CreateOffer;
