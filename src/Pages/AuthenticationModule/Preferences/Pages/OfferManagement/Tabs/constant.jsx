import moment from 'moment';

/** Map category/subcategory `isUsed` from API lists to a strict boolean for save payload. */
const offerEntityIsUsedFlag = (val) => {
    if (val === true) return true;
    if (val === false || val == null) return false;
    if (typeof val === 'string') return val.trim().toLowerCase() === 'true';
    return false;
};

/**
 * Parse offer CategoryID when loading edit: legacy CSV, JSON string, or object map { "26": true }.
 */
/** Stable key for category multi-select — avoids duplicate cascade API calls when array reference changes. */
const getOfferCategorySelectionKey = (categoryValue) => {
    const items = Array.isArray(categoryValue) ? categoryValue : categoryValue ? [categoryValue] : [];
    return items
        .map((item) => item?.categoryID ?? item?.categoryId ?? item?.categoryTypeID)
        .filter((id) => id != null && id !== '')
        .map(String)
        .sort()
        .join(',');
};

const parseOfferCategoryIdKeys = (raw) => {
    if (raw == null || raw === '') return [];
    if (typeof raw === 'object' && raw !== null && !Array.isArray(raw)) {
        return Object.keys(raw)
            .map((k) => Number(k))
            .filter((n) => !Number.isNaN(n));
    }
    if (typeof raw === 'string') {
        const t = raw.trim();
        if (t.startsWith('{')) {
            try {
                const obj = JSON.parse(t);
                if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
                    return Object.keys(obj)
                        .map((k) => Number(k))
                        .filter((n) => !Number.isNaN(n));
                }
            } catch {
                /* fall through to CSV */
            }
        }
        return t.split(',')
            .map((s) => Number(String(s).trim()))
            .filter((n) => !Number.isNaN(n));
    }
    return [];
};

/**
 * Parse offer SubCategoryID when loading edit: legacy CSV / array, JSON string, or object map.
 */
const parseOfferSubCategoryIdKeys = (raw) => {
    if (raw == null || raw === '') return [];
    if (Array.isArray(raw)) {
        return raw
            .map((id) => (typeof id === 'string' ? Number(id) : Number(id)))
            .filter((n) => !Number.isNaN(n));
    }
    if (typeof raw === 'object' && raw !== null) {
        return Object.keys(raw)
            .map((k) => Number(k))
            .filter((n) => !Number.isNaN(n));
    }
    if (typeof raw === 'string') {
        const t = raw.trim();
        if (t.startsWith('{')) {
            try {
                const obj = JSON.parse(t);
                if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
                    return Object.keys(obj)
                        .map((k) => Number(k))
                        .filter((n) => !Number.isNaN(n));
                }
            } catch {
                /* fall through */
            }
        }
        return t.split(',')
            .map((s) => Number(String(s).trim()))
            .filter((n) => !Number.isNaN(n));
    }
    return [];
};

const INITIAL_STATE = {
    defaultValues: {
        addOfferCode: '',
        communicationType: '',
        display: '',
        emi: '',
        selectedSnippetId: null,
        selectedSnippetName: null,
        formatCapital: false,
        formatNumber: false,
        formatSmall: false,
        length: '',
        name: '',
        offerCodeType: '',
        offerDurationEndDate: '',
        offerDurationStartDate: '',
        productType: '',
        category: '',
        subCategory: '',
        subProductType: [],
        brand: '',
        shop: [],
        volume: '',
        importFile: '',
        composeUsing: '',
        codePattern: '',
        offerType: {},
        csvLink: '',
        csvFileName: '',
        previewData: '',
        displayName: '',
        description: '',
        offerDetails: '',
        termsAndConditions: '',
        logo: '',
        previewImage: '',
        bannerImages: [],
        mediaTypeCode: true,
        mediaTypeSnippet: false,
        offerCode: '',
        usageClaimLimit: '',
        limitByDuration: '',
        totalRedemption: '',
        applicableDays: [],
        applicableStartTime: null,
        applicableEndTime: null,
        discountValue: '',
        discountPercentage: '',
        currency: '',
        currencyFlatDiscount: '',
        minimumPurchaseValue: '',
        minimumPurchaseValueFlatDiscount: '',
        maximumDiscountCap: '',
        bundleItems: '',
        offerPriceDiscount: '',
        minimumQuantityDiscount: '',
        buyProduct: '',
        getProduct: '',
        buyQuantity: '',
        getQuantity: '',
        discountOnFreeItem: '',
        percentageOrAmount: '',
        referrerReward: '',
        refereeReward: '',
        minimumPurchaseCap: '',
        percentageOrAmountReferral: '',
    },
    mode: 'onTouched',
};


const RESET_OFFER_TYPE = {
    offerType: '',
    discountValue: '',
    discountPercentage: '',
    currency: '',
    currencyFlatDiscount: '',
    minimumPurchaseValue: '',
    minimumPurchaseValueFlatDiscount: '',
    maximumDiscountCap: '',
    bundleItems: '',
    offerPriceDiscount: '',
    minimumQuantityDiscount: '',
    buyProduct: '',
    getProduct: '',
    buyQuantity: '',
    getQuantity: '',
    discountOnFreeItem: '',
    percentageOrAmount: '',
    referrerReward: '',
    refereeReward: '',
    minimumPurchaseCap: '',
    percentageOrAmountReferral: '',
    usageClaimLimit: '',
    limitByDuration: '',
    totalRedemption: '',
    applicableDays: [],
    applicableStartTime: null,
    applicableEndTime: null,
    displayName: '',
    logo: '',
    bannerImages: [{"image": ""}],
    previewImage : '',
    description: '',
    offerDetails: '',
    termsAndConditions: '',
    offerCodeType: '',
    mediaTypeCode: true,
    mediaTypeSnippet: false,
    offerCode: '',
    volume: '',
    length: '',
    formatCapital: false,
    formatNumber: false,
    formatSmall: false,
    composeUsing: '',
    display: '',
    addOfferCode: '',
};


const RESET_OFFERTYPES = {
    formatCapital: false,
    formatNumber: false,
    formatSmall: false,
    display: '',
    length: '',
    volume: '',
    importFile: '',
    composeUsing: '',
    codePattern: '',
    csvLink: '',
    csvFileName: '',
    previewData: '',
    addOfferCode: '',
    offerCode: '',
    importDescription: '',
    offerCodeType: '',
    // discountValue: ''
}

const RESET_ADDOFFER_FROM = {
    formatCapital: false,
    formatNumber: false,
    formatSmall: false,
    display: '',
    length: '',
    volume: '',
    importFile: '',
    composeUsing: '',
    codePattern: '',
    csvLink: '',
    csvFileName: '',
    previewData: '',
    addOfferCode: '',
    importDescription: '',
}
const RESET_DDL_CHANGE = ['formatCapital', 'formatNumber', 'formatSmall', 'previewData', 'display', 'length',
    'composeUsing', 'codePattern', 'csvLink', 'csvFileName', 'importFile', 'importDescription'
]
const RESET_FILE_NAME = ['previewData', 'csvFileName', 'csvLink', 'importFile']
const OFFER_CODE = [
    {
        id: 1,
        name: 'CSV',
    },
    {
        id: 2,
        name: 'Generate new offer',
    },
];

// Days of week options
const DAYS_OF_WEEK_OPTIONS = [
    { dayId: 1, dayName: 'Monday' },
    { dayId: 2, dayName: 'Tuesday' },
    { dayId: 3, dayName: 'Wednesday' },
    { dayId: 4, dayName: 'Thursday' },
    { dayId: 5, dayName: 'Friday' },
    { dayId: 6, dayName: 'Saturday' },
    { dayId: 7, dayName: 'Sunday' },
    { dayId: 8, dayName: 'All days' },
    { dayId: 9, dayName: 'Weekdays' },
    { dayId: 10, dayName: 'Weekends' },
];
const ALL_DAYS_ID = 8;
const WEEKDAYS_ID = 9;
const WEEKENDS_ID = 10;

const WEEKDAY_IDS = [1, 2, 3, 4, 5]; // Mon–Fri
const WEEKEND_IDS = [6, 7];        // Sat–Sun


// Percentage or Amount options
const PERCENTAGE_OR_AMOUNT_OPTIONS = [
    { id: 'percentage', name: 'Percentage' },
    { id: 'amount', name: 'Amount' },
];

// Reward options for Referral
const REWARD_OPTIONS = [
    { id: 'cashback', name: 'Cashback' },
    { id: 'coupon', name: 'Coupon' },
    { id: 'points', name: 'Points' },
];

// Add offer code from options
const ADD_OFFER_CODE_OPTIONS = [
    { id: 2, name: 'Generate new codes' },
];

// Limit by duration options
const LIMIT_BY_DURATION_OPTIONS = [
    { id: 'day', name: 'Per day' },
    { id: 'week', name: 'Per week' },
    { id: 'month', name: 'Per month' },
    { id: 'offer period', name: 'Per offer period' },
];

// Format label constants
const FORMAT_LABEL_CAPITAL = 'ABC';
const FORMAT_LABEL_SMALL = 'abc';
const FORMAT_LABEL_NUMBER = '123';

const CAPS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const SMALL = 'abcdefghijklmnopqrstuvwxyz';
const NUMBER = '0123456789';
let charObj = {
    formatCapital: CAPS,
    formatNumber: NUMBER,
    formatSmall: SMALL,
};
const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

const getChars = ({ formatCapital, formatSmall, formatNumber }) => {
    let getChars = '';
    for (let [key, val] of Object.entries(charObj)) {
        if (key === 'formatCapital' && formatCapital) getChars += val;
        if (key === 'formatSmall' && formatSmall) getChars += val;
        if (key === 'formatNumber' && formatNumber) getChars += val;
    }
    return getChars;
};
const shuffleArray = (char) => {
    let unshuffled = char.split('');
    let shuffled = unshuffled
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
    return shuffled;
};

const random = (data, length) => {
    var uniquechar = '';
    for (let i = 0; i < length; i++) {
        uniquechar += data.charAt(Math.random() * data?.length);
    }
    return uniquechar;
};

const onKeyDown = (e) => {
    const {
        keyCode,
        key,
        target: { value },
    } = e;
    if ((keyCode < 48 || keyCode > 57) && key !== 'Backspace' && key !== '.') {
        e.preventDefault();
    }
};

const RESET_FIELDS = ['formatCapital', 'formatSmall', 'formatNumber', 'display', 'composeUsing', 'codePattern'];

const RESETCOMMON = [
    'volume',
    'addOfferCode',
    'importDescription',
    'importFile',
    'formatCapital',
    'formatSmall',
    'formatNumber',
    'display',
    'length',
    'diplay',
    'composeUsing',
    'codePattern',
];
const getOneEightyDays = (date) => {
    return new Date(date?.getTime() + 180 * 24 * 60 * 60 * 1000);
};

const FORMAT_DATE = 'dd-MM-yyyy';

const getDisplay = (txt = 0) => {
    if (txt === 'Text') return 1;
    if (txt === 'QR code') return 2;
    if (txt === 'Bar code') return 3;
};
const bindDisplay = (txt = 1) => {
    if (txt === 1) return 'Text';
    if (txt === 2) return 'QR code';
    if (txt === 3) return 'Bar code';
};

const getSateObject = ({ getEditedData, getOfferTypeData, getCommunicationType, getProductType, getCategory, getSubCategory, getSubProductType, brandList, shopList, currencyMasterList }) => {
    if (!getEditedData || !Object.keys(getEditedData)?.length) return {};

    // Handle API response structure: data is an array, get first item
    let offerData = null;
    if (Array.isArray(getEditedData)) {
        offerData = getEditedData[0] || {};
    } else if (getEditedData?.data && Array.isArray(getEditedData.data)) {
        offerData = getEditedData.data[0] || {};
    } else if (getEditedData?.offerModel) {
        // Old structure with offerModel
        offerData = getEditedData;
    } else {
        offerData = getEditedData;
    }

    // Extract data from new API structure (PascalCase fields)
    // Note: Dates might be in OfferStartTime/OfferEndTime or separate date fields
    const {
        OfferName: offerName,
        OfferTypeID: offerTypeId,
        OfferStartTime: offerStartTime,
        OfferEndTime: offerEndTime,
        OfferStartDate: offerStartDate,
        OfferEndDate: offerEndDate,
        OfferCodeType: offerCodeType,
        CommuncationTypeID: campaignTypeId,
        ProductTypeID: productTypeId,
        SubProductTypeID: subProductTypeId,
        CategoryID: categoryId,
        SubCategoryID: subCategoryId,
        brandId,
        ShopListID: shopListIds,
        OfferVolume: offerCodeVolume,
        FVDiscountValue: discountValue,
        DiscountPercentage: discountPercentage,
        Currency: currency,
        MinPurchaseValue: minPurchaseValue,
        MaxDiscountCap: maxDiscountCap,
        BundleItems: bundleItems,
        BuyProduct: buyProduct,
        GetProduct: getProduct,
        BuyQuantity: buyQuantity,
        GetQuantity: getQuantity,
        ReferrerReward: referrerReward,
        RefereeReward: refereeReward,
        MinimumPurchaseCap: minimumPurchaseCap,
        MinimumPurchaseCapType: minimumPurchaseCapType,
        ClaimsCount: usageClaimLimit,
        ClaimsType: limitByDuration,
        TotalRedemption: totalRedemption,
        RedemptionLimit: redemptionLimit,
        ApplicableDays: applicableDays,
        ApplicableStartTime: applicableStartTime,
        ApplicableEndTime: applicableEndTime,
        OfferDisplayName: offerDisplayName,
        offerLogo,
        OfferPreviewImage,
        OfferImages: offerImages,
        OfferDescription: offerDescription,
        OfferDetails: offerDetails,
        TermsAndConditions: offerTermsAndConditions,
        OfferMediaType: offerMediaType,
        OfferCode: offerCode,
        OfferLength: offerCodeLength,
        OfferPatternFormat: offerPatternFormat,
        OfferDisType: offerDisType,
        OfferManualCodes: offerManualCodes,
        OfferCodeFrom: offerCodeFrom,
        CodePattern,
        TemplateID: templateId,
        TemplateName: templateName
    } = offerData;

    // Handle old structure if present
    const oldOfferModel = offerData?.offerModel || {};
    const offerCodeJob = offerData?.offerCodeJob || {};
    const offercodemaster = offerData?.offercodemaster || {};
    const codePattern = offerData?.CodePattern;

    // Map offer type
    const offerTypeIdNum = offerTypeId ? (typeof offerTypeId === 'string' ? parseInt(offerTypeId) : offerTypeId) : null;
    let offerTypeFilter = getOfferTypeData?.find((e) => e?.offerTypeID === offerTypeIdNum || e?.offerTypeId === offerTypeIdNum);

    // Map communication type (array) - handle string array
    let communication = [];
    if (campaignTypeId) {
        const campaignIds = Array.isArray(campaignTypeId)
            ? campaignTypeId.map(id => typeof id === 'string' ? parseInt(id) : id)
            : [typeof campaignTypeId === 'string' ? parseInt(campaignTypeId) : campaignTypeId];
        communication = getCommunicationType?.filter((e) =>
            campaignIds.some((ele) => ele === e.campaignAttributeId)
        ) || [];
    }

    // Map product type (single object, not array) - handle string
    // Map product type - handle string or array
    let product = [];

    if (productTypeId ) {
        // Convert to array always
        const productIds = Array.isArray(productTypeId)
            ? productTypeId.map(id => typeof id === 'string' ? parseInt(id) : id)
            : [typeof productTypeId === 'string' ? parseInt(productTypeId) : productTypeId];

        product = getProductType?.filter((e) =>
            productIds.some((id) => id === e?.categoryId)
        ) || [];
    }

    // Map sub product type (array) - handle string array
    let subProductType = [];
    if (subProductTypeId && Array.isArray(subProductTypeId)) {
        const subProductIds = subProductTypeId.map(id => typeof id === 'string' ? parseInt(id) : id);
        subProductType = getSubProductType?.filter((e) =>
            subProductIds.some((id) => id === e?.subCategoryId)
        ) || [];
    }

    // Map category (single object, not array) - handle string / object map / JSON
    let category = [];
    if (categoryId != null && categoryId !== '') {
        const idArray = parseOfferCategoryIdKeys(categoryId);
        category = getCategory.filter((item) => idArray.includes(item.categoryID));
    }

    // Map sub category (array) - handle string array / object map / JSON
    let subCategory = [];
    if (subCategoryId != null && subCategoryId !== '') {
        const subCatIds = parseOfferSubCategoryIdKeys(subCategoryId);
        if (subCatIds.length > 0) {
            subCategory =
                getSubCategory?.filter((e) =>
                    subCatIds.some((id) => id === e?.subCategoryTypeID || id === e?.categoryId),
                ) || [];
        }
    }

    // Map brand (single object) - handle string/number type conversion
    let brand = null;
    if (brandId && brandList && brandList.length > 0) {
        const brandIdNum = typeof brandId === 'string' ? parseInt(brandId) : brandId;
        brand = brandList.find((b) => {
            const bId = typeof b.brandID === 'string' ? parseInt(b.brandID) : b.brandID;
            return bId === brandIdNum;
        }) || null;
    }

    // Map shop (array) - handle string array
    let shop = [];
    if (shopListIds && Array.isArray(shopListIds) && shopList && shopList.length > 0) {
        const shopIds = shopListIds.map(id => typeof id === 'string' ? parseInt(id) : id);
        shop = shopList.filter((s) => shopIds.some((id) => id === s?.storeID)) || [];
    }

    // Map currency
    let currencyObj = null;
    if (currency && currencyMasterList && currencyMasterList.length > 0) {
        currencyObj = currencyMasterList.find((c) => c.currencyID === currency) || null;
    }
    // Map offer code type - handle number or string
    // const offerCodeTypeNum = offerCodeType ? (typeof offerCodeType === 'string' ? parseInt(offerCodeType) : offerCodeType) : 2;
    // console.log('offerCodeTypeNum ==>>',offerCodeTypeNum)
  
    // const offerCodeTypeValue = offerCodeTypeNum === 0 ? 'Common' : 'Unique';

    // console.log('offerCodeTypeValue ==>>',offerCodeTypeValue)

    const offerCodeTypeNum = offerCodeType;
    const offerCodeTypeValue = offerCodeTypeNum === 0 ? 'Common' : 'Unique';

    // Map add offer code - always default to Generate new codes (manual entry removed)
    let addOfferCode = null;
    if (offerCodeFrom) {
        const offerCodeFromNum = typeof offerCodeFrom === 'string' ? parseInt(offerCodeFrom) : offerCodeFrom;
        if (offerCodeFromNum === 2) {
            addOfferCode = ADD_OFFER_CODE_OPTIONS[0]; // Generate new codes (only option now)
        }
    }
    // Always default to Generate new codes for Unique offers
    if (!addOfferCode && offerCodeTypeValue === 'Unique') {
        addOfferCode = ADD_OFFER_CODE_OPTIONS[0]; // Generate new codes
    }

    // Map display
    let display = '';
    if (offerDisType === 'Text') display = 'Text';
    else if (offerDisType === 'QR Code') display = 'QR code';
    else if (offerDisType === 'Bar code') display = 'Bar code';
    else if (offerCodeJob?.displayAs) display = bindDisplay(offerCodeJob.displayAs);

    // Map format flags from offerPatternFormat
    let formatCapital = false;
    let formatSmall = false;
    let formatNumber = false;
    if (offerPatternFormat) {
        formatCapital = offerPatternFormat.includes(CAPS);
        formatSmall = offerPatternFormat.includes(SMALL);
        formatNumber = offerPatternFormat.includes(NUMBER);
    } else if (offerCodeJob?.codeFormat) {
        // Fallback to old format
        let formateCode = offerCodeJob.codeFormat.split(',');
        formatCapital = formateCode[0] === 'true';
        formatSmall = formateCode[1] === 'true';
        formatNumber = formateCode[2] === 'true';
    }

    // Map media type - handle string or array
    let mediaTypeCode = true; // Default
    let mediaTypeSnippet = false;
    if (offerMediaType) {
        if (Array.isArray(offerMediaType)) {
            mediaTypeCode = offerMediaType.includes(1) || offerMediaType.includes('1');
            mediaTypeSnippet = offerMediaType.includes(2) || offerMediaType.includes('2');
        } else if (typeof offerMediaType === 'string') {
            // Handle comma-separated string like "1,2" or single value "1"
            const mediaTypes = offerMediaType.split(',').map(t => t.trim());
            mediaTypeCode = mediaTypes.includes('1') || mediaTypes.includes(1);
            mediaTypeSnippet = mediaTypes.includes('2') || mediaTypes.includes(2);
        } else {
            // Single number
            mediaTypeCode = offerMediaType === 1 || offerMediaType === '1';
            mediaTypeSnippet = offerMediaType === 2 || offerMediaType === '2';
        }
    }

    // Map applicable days - handle string array format like ["1,3,6,5"]
    let applicableDaysArray = [];
    if (applicableDays) {
        let dayIds = [];
        if (Array.isArray(applicableDays)) {
            // Handle format like ["1,3,6,5"] - parse comma-separated strings
            applicableDays.forEach(item => {
                if (typeof item === 'string' && item.includes(',')) {
                    dayIds.push(...item.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d)));
                } else {
                    dayIds.push(typeof item === 'string' ? parseInt(item) : item);
                }
            });
        } else if (typeof applicableDays === 'string') {
            // Single comma-separated string
            dayIds = applicableDays.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));
        }
        if (dayIds.length > 0) {
            applicableDaysArray = DAYS_OF_WEEK_OPTIONS.filter((day) =>
                dayIds.some((id) => day.dayId === id)
            ) || [];
        }
    }

    // Map time strings to Date objects
    const parseTime = (timeStr) => {
        if (!timeStr) return null;
        try {
            const [hours, minutes, seconds] = timeStr.split(':');
            const date = new Date();
            date.setHours(parseInt(hours) || 0, parseInt(minutes) || 0, parseInt(seconds) || 0);
            return date;
        } catch (e) {
            return null;
        }
    };

    // Map limit by duration (ClaimsType in API)
    let limitByDurationObj = null;
    if (limitByDuration) {
        limitByDurationObj = LIMIT_BY_DURATION_OPTIONS.find((opt) => opt.id === limitByDuration) || null;
    }

    // Map percentage or amount options
    let percentageOrAmount = null;
    let percentageOrAmountReferral = null;
    if (minimumPurchaseCapType) {
        percentageOrAmountReferral = PERCENTAGE_OR_AMOUNT_OPTIONS.find((opt) => opt.id === minimumPurchaseCapType) || null;
    }

    // Map reward options
    let referrerRewardObj = null;
    let refereeRewardObj = null;
    if (referrerReward) {
        referrerRewardObj = REWARD_OPTIONS.find((opt) => opt.id === referrerReward) || null;
    }
    if (refereeReward) {
        refereeRewardObj = REWARD_OPTIONS.find((opt) => opt.id === refereeReward) || null;
    }

    // Manual entry codes removed - no longer needed

    // Map banner images (array to field array format) - URLs in edit mode
    let bannerImagesArray = [];

    if (offerImages) {
        let imageString = Array.isArray(offerImages)
            ? offerImages.join(",")
            : String(offerImages);

        // 1️⃣ Fix "%22" → replace with actual quotes (so we can remove outer quotes safely)
        imageString = imageString.replace(/%22/g, '"').trim();

        // 2️⃣ Remove ONLY outer quotes, NOT digits inside URLs  
        if (imageString.startsWith('"') && imageString.endsWith('"')) {
            imageString = imageString.slice(1, -1);
        }

        // 3️⃣ Split by comma safely
        const images = imageString
            .split(",")
            .map(img => img.trim())
            .filter(img => img.length > 0);

        // 4️⃣ Convert into required [{image:"url"}, ...]
        bannerImagesArray = images.map(img => ({ image: img }));
    }


    return {
        // Basic fields
        offerName: offerName || oldOfferModel?.offerName || '',
        offerType: offerTypeFilter || {},
        offerDurationStartDate: (offerStartDate || offerStartTime) ? new Date(offerStartDate || offerStartTime) : (oldOfferModel?.offerStartDate ? new Date(oldOfferModel.offerStartDate) : null),
        offerDurationEndDate: (offerEndDate || offerEndTime) ? new Date(offerEndDate || offerEndTime) : (oldOfferModel?.offerEndDate ? new Date(oldOfferModel.offerEndDate) : null),
        // Communication and product types
        communicationType: communication,
        productType: product[0] || null,
        subProductType: subProductType,
        // Category and subcategory
        category: category,
        subCategory: subCategory,
        // Brand and shop
        brand: brand,
        shop: shop,
        // Offer type specific fields
        discountValue: discountValue ? String(discountValue) : '',
        discountPercentage: discountPercentage ? String(discountPercentage) : '',
        currency: currencyObj,
        currencyFlatDiscount: currencyObj, // Same currency for both
        minimumPurchaseValue: minPurchaseValue ? String(minPurchaseValue) : '',
        minimumPurchaseValueFlatDiscount: minPurchaseValue ? String(minPurchaseValue) : '',
        maximumDiscountCap: maxDiscountCap ? String(maxDiscountCap) : '',
        bundleItems: bundleItems ? String(bundleItems) : '',
        offerPriceDiscount: '', // Not in API response
        minimumQuantityDiscount: '', // Not in API response
        buyProduct: buyProduct ? String(buyProduct) : '',
        getProduct: getProduct ? String(getProduct) : '',
        buyQuantity: buyQuantity ? String(buyQuantity) : '',
        getQuantity: getQuantity ? String(getQuantity) : '',
        discountOnFreeItem: '', // Not in API response
        percentageOrAmount: percentageOrAmount,
        referrerReward: referrerRewardObj,
        refereeReward: refereeRewardObj,
        minimumPurchaseCap: minimumPurchaseCap ? String(minimumPurchaseCap) : '',
        percentageOrAmountReferral: percentageOrAmountReferral,
        // Usage and redemption
        usageClaimLimit: usageClaimLimit ? String(usageClaimLimit) : '',
        limitByDuration: limitByDurationObj,
        totalRedemption: (totalRedemption || redemptionLimit) ? String(totalRedemption || redemptionLimit) : '',
        applicableDays: applicableDaysArray,
        applicableStartTime: parseTime(applicableStartTime),
        applicableEndTime: parseTime(applicableEndTime),
        // Display fields
        displayName: offerDisplayName || '',
        logo: (offerLogo && Array.isArray(offerLogo) && offerLogo.length > 0) ? offerLogo[0] : (offerLogo || ''),
        previewImage: (OfferPreviewImage && Array.isArray(OfferPreviewImage) && OfferPreviewImage.length > 0) ? OfferPreviewImage[0] : (OfferPreviewImage || ''),
        bannerImages: bannerImagesArray,
        description: offerDescription || '',
        offerDetails: offerDetails || '',
        termsAndConditions: offerTermsAndConditions || '',
        mediaTypeCode: mediaTypeCode,
        mediaTypeSnippet: mediaTypeSnippet,
        // Code-related fields
        offerCodeType: offerCodeTypeValue,
        offerCode: offerCode || offercodemaster?.offerCode || oldOfferModel?.offerCode || '',
        volume: offerCodeVolume ? String(offerCodeVolume) : '',
        addOfferCode: addOfferCode,
        length: offerCodeLength ? String(offerCodeLength) : (offerCodeJob?.length ? String(offerCodeJob.length) : ''),
        formatCapital: formatCapital,
        formatSmall: formatSmall,
        formatNumber: formatNumber,
        display: display,
        composeUsing: offerCodeJob?.composeUsing || '',
        previewData: offerCodeJob?.preview || '', // Preview is generated in frontend for Text display
        importDescription: offerCodeJob?.importDescription || '',
        importFile: offerCodeJob?.localFilePath?.split(/[/\\]/).slice(-1)[0] || '',
        csvLink: offerCodeJob?.localFilePath || '',
        csvFileName: offerCodeJob?.localFilePath?.split(/[/\\]/).slice(-1)[0] || '',
        selectedSnippetId: templateId || null,
        selectedSnippetName: templateName || null,
        // Other fields
        emi: '',
        codePattern: codePattern || '',
    };
};

const payload_Common = (data, offerId = 0) => {
    let { offerCode } = data;
    return {
        isCopy: false,
        offerCodeMaster: { offerCode },
        offerCodeJob: '',
    };
};

const payload_Offer = (data, offerId = 0, refreshFlag) => {
    let {
        length,
        formatCapital,
        formatNumber,
        formatSmall,
        display,
        composeUsing,
        codePattern,
        previewData,
        csvLink,
        csvFileName,
    } = data;

    return {
        isCopy: false,
        offerCodeMaster: '',
        offerCodeJob: {
            importMethodId: 3,
            importDescription: '',
            fileName: csvFileName,
            localFilePath: csvLink,
            length: +length,
            codeFormat: `${formatCapital},${formatSmall},${formatNumber}`,
            displayAs: getDisplay(display),
            preview: previewData,
            composeUsing: refreshFlag ? composeUsing : '',
            codePattern: refreshFlag ? codePattern : '',
        },
    };
};
const payload_CSV = (data, offerId = 0, refreshFlag = false) => {
    let { importDescription, csvLink, csvFileName } = data;

    return {
        isCopy: false, // const forever false
        offerCodeMaster: '',
        offerCodeJob: {
            importMethodId: 1, // for csv 1
            importDescription: importDescription,
            fileName: csvFileName,
            localFilePath: csvLink,
            length: 0,
            codeFormat: 'false,false,false',
            displayAs: 0,
            preview: '',
            composeUsing: '',
            codePattern: '',
        },
    };
};
const buildPayload = (data, offerId, refreshFlag = false) => {
    let {
        offerCodeType,
        addOfferCode: { id, name },
        volume,
        offerName,
        communicationType,
        productType,
        category,
        subCategory,
        offerCode,
        offerType: { offerTypeId },
        offerDurationStartDate,
        offerDurationEndDate,
    } = data;
    let offerModel = {
        offerId: offerId, //create = 0
        offerName: offerName,
        offerCodeType: offerCodeType === 'Common' ? 0 : 1, // 1--unique , 0-common
        offerCodeVolume: +volume,
        offerStartDate: moment(new Date(offerDurationStartDate)).format('YYYY-MM-DD'), //"2024-01-09",
        offerEndDate: moment(new Date(offerDurationEndDate)).format('YYYY-MM-DD'),
        campaignTypeId: communicationType?.map((e) => e?.campaignAttributeId),
        offerTypeId: offerTypeId,
        productTypeId: productType?.map((e) => e?.categoryId),
        categoryId: category?.map((e) => e?.categoryId),
        subCategoryId: subCategory?.map((e) => e?.subCategoryId || e?.categoryId),
        cascadingOfferEnable: false, // default false
    };
    let obj = {};

    if (offerCodeType === 'Common') {
        obj = payload_Common(data, offerId);
    } else if (offerCodeType === 'Unique' && id === 1) {
        obj = payload_CSV(data, offerId);
    } else if (offerCodeType === 'Unique' && id === 2) {
        obj = payload_Offer(data, offerId, refreshFlag);
    }
    return { ...obj, offerModel };
};

// Build payload for CreateOffer API
const buildCreateOfferPayload = (data, clientId, departmentId, userId) => {
    const {
        offerName,
        offerId,
        selectedSnippetId,
        selectedSnippetName,
        offerSnippetId,
        offerSnippetName,
        category,
        subCategory,
        productType,
        subProductType,
        communicationType,
        brand,
        shop,
        offerDurationStartDate,
        offerDurationEndDate,
        offerType,
        discountValue,
        discountPercentage,
        currency,
        currencyFlatDiscount,
        minimumPurchaseValue,
        minimumPurchaseValueFlatDiscount,
        maximumDiscountCap,
        bundleItems,
        offerPriceDiscount,
        minimumQuantityDiscount,
        buyProduct,
        getProduct,
        buyQuantity,
        getQuantity,
        discountOnFreeItem,
        percentageOrAmount,
        referrerReward,
        refereeReward,
        minimumPurchaseCap,
        percentageOrAmountReferral,
        usageClaimLimit,
        limitByDuration,
        totalRedemption,
        applicableDays,
        applicableStartTime,
        applicableEndTime,
        displayName,
        logo,
        bannerImages,
        description,
        offerDetails,
        termsAndConditions,
        codePattern,
        offerCodeType,
        mediaTypeCode,
        mediaTypeSnippet,
        offerCode,
        volume,
        length,
        formatCapital,
        formatSmall,
        formatNumber,
        composeUsing,
        display,
        addOfferCode,
        previewImage
    } = data;

    // Build categoryId as { [id]: boolean } — boolean from each item's isUsed (API category list)
    const categoryId =
        category && Array.isArray(category)
            ? category.reduce((acc, cat) => {
                  const id = cat?.categoryID;
                  if (id == null || id === '') return acc;
                  acc[String(id)] = offerEntityIsUsedFlag(cat?.isUsed);
                  return acc;
              }, {})
            : {};

    // Build subCategoryId as { [id]: boolean } — boolean from each item's isUsed
    const subCategoryId =
        subCategory && Array.isArray(subCategory)
            ? subCategory.reduce((acc, sub) => {
                  const id = sub?.subCategoryID ?? sub?.subCategoryId ?? sub?.categoryId;
                  if (id == null || id === '') return acc;
                  acc[String(id)] = offerEntityIsUsedFlag(sub?.isUsed);
                  return acc;
              }, {})
            : {};

    // Build productTypeId - single number, not array
    let productTypeId = null;
    if (productType) {
        if (Array.isArray(productType) && productType.length > 0) {
            productTypeId = productType[0]?.categoryId || null;
        } else if (productType?.categoryId) {
            productTypeId = productType.categoryId;
        }
    }

    // Build subProductTypeId array - convert numbers to strings
    let subProductTypeId = [];
    if (subProductType) {
        if (Array.isArray(subProductType)) {
            subProductTypeId = subProductType.map((sub) => String(sub?.subCategoryId)).filter(Boolean);
        } else if (subProductType?.subCategoryId) {
            subProductTypeId = [String(subProductType.subCategoryId)];
        }
    }

    // Build communicationTypeId array - convert numbers to strings
    const communcationTypeId = communicationType && Array.isArray(communicationType)
        ? communicationType.map((comm) => String(comm?.campaignAttributeId)).filter(Boolean)
        : [];

    // Build shopList array - shop can be single object or array, convert numbers to strings
    let shopList = [];
    if (shop) {
        if (Array.isArray(shop)) {
            shopList = shop.map((s) => String(s?.storeID)).filter(Boolean);
        } else if (shop?.storeID) {
            shopList = [String(shop.storeID)];
        }
    }

    // Build applicableDays array - convert numbers to strings
    const applicableDaysArray = applicableDays && Array.isArray(applicableDays)
        ? applicableDays.map((day) => String(day?.dayId)).filter(Boolean)
        : [];

    // Build offerPatternFormat based on format selections - reuse CAPS, SMALL, NUMBER constants
    let offerPatternFormat = '';
    if (formatCapital) offerPatternFormat += CAPS;
    if (formatNumber) offerPatternFormat += NUMBER;
    if (formatSmall) offerPatternFormat += SMALL;

    // if (composeUsing && composeUsing.trim().length > 0) {
    //     offerPatternFormat += composeUsing.trim();
    // }

    // Build offerMediaType array
    const offerMediaType = [];
    if (mediaTypeCode) offerMediaType.push(1);
    if (mediaTypeSnippet) offerMediaType.push(2);
    if (offerMediaType.length === 0) offerMediaType.push(1); // Default to code if nothing selected

    // Map offerCodeType: Static/Common = 1, Dynamic/Unique = 2
    const offerCodeTypeValue = (offerCodeType === 'Common' ? 0 : 1);

    // Map display to offerDisType
    let offerDisType = '';
    if (display === 'Text') offerDisType = 'Text';
    else if (display === 'QR code') offerDisType = 'QR Code';
    else if (display === 'Bar code') offerDisType = 'Bar code';

    // Format dates
    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    // Format time to HH:mm:ss
    const formatTime = (time) => {
        if (!time) return null;
        const timeObj = time instanceof Date ? time : new Date(`2000-01-01 ${time}`);
        if (isNaN(timeObj.getTime())) return null;
        const hours = String(timeObj.getHours()).padStart(2, '0');
        const minutes = String(timeObj.getMinutes()).padStart(2, '0');
        const seconds = String(timeObj.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    // Helper function to convert string numbers to actual numbers
    const toNumber = (value) => {
        if (value === null || value === undefined || value === '') return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
    };

    // Helper function to strip data URI prefix from base64 images
    const stripDataUriPrefix = (base64String) => {
        if (!base64String || typeof base64String !== 'string' || base64String.trim() === '') {
            return null;
        }
        // Check if it's a data URI (starts with "data:")
        if (base64String.startsWith('data:')) {
            // Extract the base64 part after the comma
            const commaIndex = base64String.indexOf(',');
            if (commaIndex !== -1) {
                return base64String.substring(commaIndex + 1);
            }
        }
        // If it's already a plain base64 string or URL, return as is
        return base64String;
    };  

    const payload = {
        clientId,
        departmentId,
        userId,
        offerName: offerName || {},
        categoryId: categoryId || {},
        subCategoryId: subCategoryId || {},
        productTypeId: productTypeId || {},
        subProductTypeId: subProductTypeId || null,
        communcationTypeId,
        brandId: brand?.brandID || null,
        shopList,
        imagePreview: previewImage && previewImage.trim() !== '' ? stripDataUriPrefix(previewImage) : '',
        offerStartDate: formatDate(offerDurationStartDate) || '',
        offerEndDate: formatDate(offerDurationEndDate) || '',
        offerTypeId: offerType?.offerTypeId || offerType?.offerTypeID || null,
        discountValue: toNumber(discountValue) || 0,
        discountPercentage: toNumber(discountPercentage) || 0,
        currency: currency?.currencyID || currencyFlatDiscount?.currencyID || null,
        minPurchaseValue: toNumber(minimumPurchaseValue || minimumPurchaseValueFlatDiscount) || 0,
        maxDiscountCap: toNumber(maximumDiscountCap) || 0,
        minQuantity: toNumber(minimumQuantityDiscount) || 0,
        usageClaimLimit: toNumber(usageClaimLimit) || 0,
        limitByDuration: limitByDuration?.id || limitByDuration || null,
        totalRedemption: toNumber(totalRedemption) || 0,
        applicableDays: applicableDaysArray,
        applicableStartTime: formatTime(applicableStartTime) || '',
        applicableEndTime: formatTime(applicableEndTime) || '',
        bundleItems: toNumber(bundleItems) || 0,
        buyProduct: toNumber(buyProduct) || 0,
        getProduct: toNumber(getProduct) || 0,
        buyQuantity: toNumber(buyQuantity) || 0,
        getQuantity: toNumber(getQuantity) || 0,
        referrerReward: referrerReward?.id || null,
        refereeReward: refereeReward?.id || null,
        minimumPurchaseCap: toNumber(minimumPurchaseCap),
        minimumPurchaseCapType: percentageOrAmountReferral?.id || percentageOrAmountReferral || null,
        offerDisplayName: displayName || null,
        offerLogo: logo && logo.trim() !== '' ? stripDataUriPrefix(logo) : '',
        offerImages: bannerImages && bannerImages.length > 0
            ? (() => {
                const images = bannerImages
                    .map(img => img?.image)
                    .filter(Boolean)
                    .map(img => stripDataUriPrefix(img));
                return images.length > 0 ? images : null;
            })()
            : null,
        offerDescription: description || null,
        offerDetails: offerDetails || null,
        offerTermsAndConditions: termsAndConditions || null,
        offerCodeType: offerCodeTypeValue || '',
        offerMediaType: offerMediaType || '',
        offerCode: offerCode || null,
        offerVolume: toNumber(volume) || 0,
        offerLength: toNumber(length) || 0,
        offerPatternFormat: offerPatternFormat || '',
        composeValue : composeUsing || '',
        offerDisType: offerDisType || '',
        offerCodeFrom: addOfferCode?.id || 2, // Default to 2 (Generate new codes) if not provided
        codePattern: codePattern || '',
        templateId: offerSnippetId || selectedSnippetId || null,
        templateName: offerSnippetName || selectedSnippetName || null
    };

    // Remove null, undefined, and empty string values (but keep empty arrays)
    Object.keys(payload).forEach((key) => {
        if (Array.isArray(payload[key])) {
            // Keep arrays even if empty
            return;
        }
        if (
            (key === 'categoryId') &&
            payload[key] &&
            typeof payload[key] === 'object' &&
            Object.keys(payload[key]).length === 0
        ) {
            delete payload[key];
            return;
        }
        // Keep offerLogo even if empty string (API might require it to be present)
        if (key === 'offerLogo' && payload[key] === '') {
            return;
        }
        // if (payload[key] === null || payload[key] === undefined || payload[key] === '') {
        //     delete payload[key];
        // }
        if ( payload[key] === undefined) {
            delete payload[key];
        }
    });


    return payload;
};

export {
    INITIAL_STATE,
    OFFER_CODE,
    CHARACTERS,
    shuffleArray,
    CAPS,
    SMALL,
    NUMBER,
    random,
    onKeyDown,
    RESET_FIELDS,
    getOneEightyDays,
    FORMAT_DATE,
    RESETCOMMON,
    getSateObject,
    buildPayload,
    buildCreateOfferPayload,
    charObj,
    getChars,
    RESET_OFFERTYPES,
    RESET_OFFER_TYPE,
    RESET_ADDOFFER_FROM,
    RESET_DDL_CHANGE,
    RESET_FILE_NAME,
    DAYS_OF_WEEK_OPTIONS,
    ALL_DAYS_ID , 
    WEEKDAYS_ID,
    WEEKENDS_ID,
    WEEKDAY_IDS,
    WEEKEND_IDS,
    PERCENTAGE_OR_AMOUNT_OPTIONS,
    REWARD_OPTIONS,
    ADD_OFFER_CODE_OPTIONS,
    LIMIT_BY_DURATION_OPTIONS,
    FORMAT_LABEL_CAPITAL,
    FORMAT_LABEL_SMALL,
    FORMAT_LABEL_NUMBER,
    parseOfferCategoryIdKeys,
    parseOfferSubCategoryIdKeys,
    getOfferCategorySelectionKey,
};
