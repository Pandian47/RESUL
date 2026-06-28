import { tagLicenseEnterprise, tagLicenseEnterprisePlus, tagLicensePro, tagLicenseStp } from 'Assets/Images';
export const clientbranchtype = (branch) => {
    switch (branch) {
        case 1:
            return 'GHQ';
        case 2:
            return 'RHQ';
        case 3:
            return 'LOC';
        default:
            return '';
    }
};
export const licenseTypeIcon = (licenceType, licenceTypeId ) => {
    switch (licenceType) {
        case 1:
            return tagLicenseStp;
        case 2:
            return tagLicensePro;
        case 3:
            if (licenceTypeId===3) {
                return tagLicenseEnterprise;
            } else {
                return tagLicenseEnterprisePlus;
            }
    }
};
export const licenseType = (licenceType, licenceTypeId = false) => {
    switch (licenceType) {
        case 1:
            return 'license-startup';
        case 2:
            return 'license-pro';
        case 3:
            if (licenceTypeId) {
                return 'license-enterprise-plus-hybrid';
            } else {
                return 'license-enterprise-plus';
            }
    }
};
export const licenseTypeContent = (item, index = false) => {
    switch (item) {
        case 1:
            return 'START UP';
        case 2:
            return 'PRO';
        case 3:
            if (index) {
                return 'ENTERPRISE HYBRID';
            } else {
                return 'ENTERPRISE';
            }
    }
};

export const pagesEdit = (type) => [
    {
        title: 'Client details',
        disable: true,
        name: 'NEW_COMPANY',
    },
    {
        title: 'Assign role',
        disable: true,
        name: 'ASSIGN_ROLE',
    },
    {
        title: 'Settings',
        disable: false,
        name: 'COMPANY_LOCALIZATION',
        // name: 'LOCALIZATION_SETTINGS'
    },
];
export const pages = (type) => [
    {
        title: 'Client details',
        disable: false,
        name: 'NEW_COMPANY',
    },
    {
        title: 'Settings',
        disable: false,
        name: 'LOCALIZATION_SETTINGS',
        // name: 'COMPANY_LOCALIZATION'
    },
];
export const EDIT_MAIN_HEADING = {
    NEW_COMPANY: {
        main: 'Edit company account',
    },
    ASSIGN_ROLE: {
        main: 'Assign role to users',
    },
    LOCALIZATION_SETTINGS: {
        main: 'Edit company account',
    },
    COMPANY_LOCALIZATION: {
        main: 'Localization settings',
    },
    ADD_USERS: {
        main: 'Add a user',
    },
};
export const MAIN_HEADING = {
    NEW_COMPANY: {
        main: 'Add a new company account',
        sub: 'Add a new company account',
    },
    LOCALIZATION_SETTINGS: {
        main: 'Add a new company accounts',
        sub: 'Add a new company account',
    },
    COMPANY_LOCALIZATION: {
        main: 'Add a new company settings',
        sub: 'Add a new company settings',
    },
    ACCOUNT_TYPE: {
        main: 'Select license type',
        sub: 'Select license type',
    },
    ADD_USERS: {
        main: 'Add a new user',
        sub: 'Add a new user',
    },
};

export const CURRENCY_TYPE = [
    {
        titleId: 1,
        title: 'US Dollar',
    },
    {
        titleId: 2,
        title: 'Euro',
    },
    {
        titleId: 3,
        title: 'British Pound',
    },
    {
        titleId: 4,
        title: 'Australian Dollar',
    },
    {
        titleId: 3,
        title: 'Indian Rupee',
    },
];
export const DATE_FORMAT_LIST = [
    {
        titleId: 1,
        title: 'DD/MM/YYYY',
    },
    {
        titleId: 2,
        title: 'MM/DD/YYYY',
    },
    {
        titleId: 3,
        title: 'YYYY/MM/DD',
    },
];

export const LANGUAGE_TYPE = [
    {
        titleId: 1,
        title: 'English (United States)',
    },
    {
        titleId: 2,
        title: 'Spanish (Spain)',
    },
    {
        titleId: 3,
        title: 'Tagalog (Philippines)',
    },
    {
        titleId: 4,
        title: 'Russian (Russia)',
    },
    {
        titleId: 3,
        title: 'French (France)',
    },
];

export const HOURS_LIST = [
    {
        titleId: 1,
        title: '12 hours',
    },
    {
        titleId: 2,
        title: '24 hours',
    },
];

export const TIMEZONE = [
    {
        titleId: 1,
        title: 'EST (GMT - 5:00) EASTERN TIME (united states & canada)',
    },
    {
        titleId: 2,
        title: 'EST (GMT - 7:00) SAN FRANCISCO, CALIFORNIA',
    },
];

export const WAVES = [
    {
        titleId: 1,
        title: '1',
    },
    {
        titleId: 2,
        title: '2',
    },
    {
        titleId: 3,
        title: '3',
    },
    {
        titleId: 4,
        title: '4',
    },
];

export const REACH = [
    {
        titleId: 1,
        title: 'By Target',
    },
    {
        titleId: 2,
        title: 'By send',
    },
    {
        titleId: 3,
        title: 'By Delivered',
    },
];

export const PREFERREND_REG = [
    {
        titleId: 1,
        title: 'New york',
    },
    {
        titleId: 2,
        title: 'Asia',
    },
    {
        titleId: 3,
        title: 'Europe',
    },
];

export const INITIAL_WATCH_STATE = [
    'reach',
    'engagement',
    'engagementTags',
    'subscriptionTags',
    'communicationTags',
    'conversionTags',
    'productTags',
    'offerTags',
    'tierSettingsTags',
    'zoneTags',
    'communicationRefferenceTags',
    'isCommunicationReference',
    'subProductTags',
];

export const INITIAL_STATE = {
    preferredRegions: [],
    companiesList: {},
    dateFormat: {},
    language: {},
    hours: {},
    locationType: {},
    waves: {},
    reach: {},
    smartLink: '',
    communicationLink: '',
    associates: '',
    engagement: {},
    conversion: {},
    singleDimension: '',
    multiDimension: '',
    eventTrigger: '',
    defaultRegions: true,
    defaultDaylight: true,
    isCommunicationReference: true,
    communicationTags: [],
    communicationRefferenceTags: [],
    engagementTags: [],
    subscriptionTags: [],
    conversionTags: [],
    productTags: [],
    offerTags: [],
    tierSettingsTags: [],
    zoneTags: [],
    subProductTags: {},
};

export const EDITDATA = {
    preferredRegions: [
        { titleId: 1, title: 'New york' },
        { titleId: 2, title: 'Asia' },
    ],
    companiesList: { titleId: 1, title: 'US Dollar' },
    dateFormat: { titleId: 1, title: 'DD/MM/YYYY' },
    language: { titleId: 1, title: 'English (United States)' },
    hours: { titleId: 1, title: '12 hours' },
    locationType: { titleId: 2, title: 'EST (GMT - 7:00) SAN FRANCISCO, CALIFORNIA' },
    waves: { titleId: 1, title: '1' },
    reach: { titleId: 1, title: 'By Target' },
    smartLink: 'Eg - resu.io',
    communicationLink: 'Eg - mailer.resulticks',
    associates: 'test',
    engagement: { titleId: 1, title: 'By Target' },
    conversion: { titleId: 1, title: 'By Target' },
    singleDimension: 8,
    multiDimension: 4,
    eventTrigger: 6,
    defaultRegions: true,
    defaultDaylight: true,
    isCommunicationReference: true,
    communicationTags: ['Awareness', 'Greetings', 'New product lauch', 'Promotions', 'Sales', 'Events'],
    communicationRefferenceTags: ['Communication manager', 'Product manager', 'Cost code', 'CAF no'],
    engagementTags: ['Landing Page', 'View more', 'Contact us', 'Find a store'],
    subscriptionTags: ['Newsletter', 'Festival offers'],
    conversionTags: ['Purchase', 'Add to cart', 'Add to wishlist'],
    productTags: ['Fund', 'Card', 'Deposit', 'Loan', 'Insurance', 'Investment', 'Other'],
    offerTags: ['EMI offer', 'Card back', 'Discount', 'Festival', 'New Product Launch', 'Refferal'],
    tierSettingsTags: ['Premium', 'Gold', 'Platinum'],
    zoneTags: ['North', 'South', 'East', 'West'],
};

export const handleAnalyticsCal = (selectedValue) => {
    let conversionDataList = [];
    if (selectedValue === 'By Target') {
        conversionDataList.push(
            { titleId: 1, title: 'By Target' },
            { titleId: 2, title: 'By Reach' },
            { titleId: 3, title: 'By Engagement' },
        );
    } else if (selectedValue === 'By Send') {
        conversionDataList.push(
            { titleId: 1, title: 'By Sent' },
            { titleId: 2, title: 'By Reach' },
            { titleId: 3, title: 'By Engagement' },
        );
    } else if (selectedValue === 'By Delivered') {
        conversionDataList.push({ titleId: 1, title: 'By Delivered' }, { titleId: 2, title: 'By Engagement' });
    } else if (selectedValue === 'By Reach') {
        conversionDataList.push({ titleId: 1, title: 'By Reach' }, { titleId: 2, title: 'By Engagement' });
    }
    return conversionDataList;
};
