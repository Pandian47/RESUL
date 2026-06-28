export const pages = (type) => [
    {
        title: 'Account type',
        disable: false,
        name: 'ACCOUNT_TYPE',
    },
    {
        title: 'Contact details',
        disable: false,
        name: 'KEY_INFO',
    },
    {
        title: type === '' ? 'Details' : type === 'agency' ? 'Agency details' : 'Brand details',
        disable: false,
        name: type === '' ? 'Details' : type === 'agency' ? 'AGENCY_DETAILS' : 'BRAND_DETAILS',
    },
    {
        title: 'Localization settings',
        disable: false,
        name: 'LOCALIZATION_SETTINGS',
    },
];
export const MAIN_HEADING = {
    ACCOUNT_TYPE: {
        main: 'Select an account type',
        sub: 'Choose an account type',
    },
    KEY_INFO: {
        main: 'Key contact details',
        sub: 'Key contact details',
    },
    AGENCY_DETAILS: {
        main: 'Agency details',
        sub: 'Agency details',
    },
    BRAND_DETAILS: {
        main: 'Brand details',
        sub: 'Brand details',
    },
    LOCALIZATION_SETTINGS: {
        main: 'Localization settings',
        sub: 'Localization settings',
    },
    LICENSE_TYPE: {
        main: 'Select license type',
        sub: 'Select license type',
    },
};

export const getClassName = (pages, currentPage, title) => {
    if (currentPage === title) return 'active';
    if (pages.includes(title)) return 'completed';
    return '';
};

const mapStepStatus = (legacyStatus) => {
    if (legacyStatus === 'completed') return 'completed';
    if (legacyStatus === 'active') return 'inprogress';
    return '';
};

export const buildAccountSetupProgressSteps = (stepsList, completedPages, currentPageName) =>
    stepsList.map((item, index) => ({
        step: index + 1,
        stepTitle: item.title,
        status: mapStepStatus(getClassName(completedPages, currentPageName, item.name)),
    }));
