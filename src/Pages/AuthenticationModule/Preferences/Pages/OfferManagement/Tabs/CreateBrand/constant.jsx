// Status options for Brand
export const STATUS_OPTIONS = [
    { id: 1, name: 'Active' },
    { id: 0, name: 'Inactive' },
];

// Initial state for Brand form
export const INITIAL_STATE = {
    defaultValues: {
        shortName: '',
        legalName: '',
        logo: '',
        description: '',
        contactName: '',
        emailId: '',
        mobileNo: '',
        category: null,
        subCategory: [],
        currency: null,
        address: '',
        city: '',
        country: null,
        status: STATUS_OPTIONS[0], // Default to Active
    },
    mode: 'onTouched',
};

// Build payload for Brand save API
export const buildBrandPayload = (data, clientId, departmentId, userId, brandId = null) => {
    const {
        shortName,
        legalName,
        logo,
        description,
        contactName,
        emailId,
        mobileNo,
        category,
        subCategory,
        currency,
        address,
        city,
        country,
        status,
        longitude,
        latitude
    } = data;

        const categoryId = category && Array.isArray(category)
        ? category.map((cat) => String(cat?.categoryID)).filter(Boolean)
        : [];

    // Build subCategoryId array - convert numbers to strings
    const subCategoryId = subCategory && Array.isArray(subCategory)
        ? subCategory.map((sub) => String(sub?.subCategoryID || sub?.categoryId)).filter(Boolean)
        : [];

    const payload = {
        clientId,
        departmentId,
        userId,
        BrandLatitude : latitude,
        BrandLongitude : longitude,
        brandShortName: shortName || null,
        brandLegalName: legalName || null,
        brandImage: logo || null,
        brandDescription: description || null,
        brandContactName: contactName || null,
        brandEmailID: emailId || null,
        brandMobileNo: mobileNo || null,
        brandCategoryID: categoryId || null,
        brandSubCategoryID: subCategoryId || [],
        brandCurrency: currency?.currencyID || currency || null,
        brandAddress: address || null,
        brandCity: city || null,
        brandCountry: country?.countryID || country || null,
        brandStatus: status?.id !== undefined 
            ? (status.id === 1 ? true : false) 
            : (status !== undefined ? (status === 1 ? true : false) : null),
    };

    // Add brandId to payload if in edit mode
    if (brandId) {
        payload.brandId = brandId;
    }

    // Remove null, undefined, and empty string values
    Object.keys(payload).forEach((key) => {
        if (payload[key] === null || payload[key] === undefined || payload[key] === '') {
            delete payload[key];
        }
    });

    return payload;
};

// Helper function to decode base64 string
const decodeBase64 = (base64String) => {
    if (!base64String) return '';
    
    // Check if the string is likely base64 (contains special base64 characters or is not all digits)
    // If it's all digits, it's probably not base64 encoded
    const isAllDigits = /^\d+$/.test(base64String);
    if (isAllDigits) {
        return base64String; // Return as-is if it's just a number
    }
    
    try {
        const decoded = atob(base64String);
        // Verify the decoded result is valid (printable characters)
        if (decoded && /^[\x20-\x7E\s]+$/.test(decoded)) {
            return decoded;
        }
        return base64String; // Return as-is if decoded result is invalid
    } catch (e) {
        return base64String; // Return as-is if decoding fails
    }
};

// Map API response to Brand form state (similar to getSateObject in CreateOffer)
export const getBrandStateObject = ({ brandData, currencyMasterList, countryMasterList, categoryList, subCategoryList }) => {
    if (!brandData) return {};

    // Handle array response structure - get first item if array
    const data = Array.isArray(brandData) ? brandData[0] : brandData;
    if (!data) return {};

    // Map category (single object) - API uses categoryID
    let category = null;
    if (data.categoryID && categoryList && categoryList.length > 0) {
        const categoryId = typeof data.categoryID === 'string' ? parseInt(data.categoryID) : data.categoryID;
        category = categoryList.find((c) => c?.categoryTypeID === categoryId || c?.categoryId === categoryId) || null;
    }

    // Map sub category (array) - API uses subCategoryID (can be single number or array)
    let subCategory = [];
    if (data.subCategoryID && subCategoryList && subCategoryList.length > 0) {
        // Handle both single number and array
        const subCategoryIds = Array.isArray(data.subCategoryID) 
            ? data.subCategoryID.map(id => typeof id === 'string' ? parseInt(id) : id)
            : [typeof data.subCategoryID === 'string' ? parseInt(data.subCategoryID) : data.subCategoryID];
        
        subCategory = subCategoryList.filter((sub) =>
            subCategoryIds.some((id) => id === sub?.subCategoryTypeID || id === sub?.categoryId)
        ) || [];
    }

    // Map currency - API can return currency as ID (e.g., "1") or name (e.g., "INR")
    let currency = null;
    if (data.currency && currencyMasterList && currencyMasterList.length > 0) {
        const currencyValue = data.currency;
        // Try to match by ID first (converting both to numbers), then by name/code
        currency = currencyMasterList.find(c => {
            const currencyId = typeof currencyValue === 'string' ? parseInt(currencyValue) : currencyValue;
            return c.currencyID === currencyId || 
                   c.currencyName === currencyValue || 
                   c.currencyCode === currencyValue;
        }) || null;
    }

    // Map country - API can return country as ID (e.g., "3") or name (e.g., "India")
    let country = null;
    if (data.country && countryMasterList && countryMasterList.length > 0) {
        const countryValue = data.country;
        // Try to match by ID first (converting both to numbers), then by name
        country = countryMasterList.find(c => {
            const countryId = typeof countryValue === 'string' ? parseInt(countryValue) : countryValue;
            return c.countryID === countryId || 
                   c.country === countryValue ||
                   c.countryName === countryValue;
        }) || null;
    }

    return {
        shortName: data.shortName || '',
        legalName: data.legalName || '',
        logo: data.image || '',
        description: data.description || '',
        contactName: decodeBase64(data.contactName) || '', // Decode base64 contact name
        emailId: decodeBase64(data.emailID) || '', // Decode base64 email
        mobileNo: decodeBase64(data.mobileNo) || '', // Decode base64 mobile number (or plain number)
        category: category,
        subCategory: subCategory,
        currency: currency,
        address: data.address || '',
        city: data.city || '',
        country: country,
        status: data.status !== undefined 
            ? (data.status === 1 || data.status === true
                ? STATUS_OPTIONS.find(s => s.id === 1) 
                : STATUS_OPTIONS.find(s => s.id === 0))
            : STATUS_OPTIONS[0],
            latitude : data?.brandLatitude,
            longitude : data?.brandLongitude
    };
};

