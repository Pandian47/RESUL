export const AUDIENCE_TYPE_FLAGS = {
    'Brand audience': { isPartner: false, isInternal: false },
    // 'Internal audience': { isPartner: false, isInternal: true },
    'Partner audience': { isPartner: true, isInternal: false },
};

export const MASTERDATA_INITIAL_STATE = {
    FieldSelectorModal: false,
    notesEnable: false,
    profileComplete: false,
    emailInfo: false,
    mobileInfo: false,
    notificationInfo: false,
    socialInfo: false,
    makeNotes: false,
    csvDownloadModal: false,
    csvDownloadSuccessModal: false,
};

export const MDM_COUNT_LIST_SECTION_CONFIG = {
    listClassName: 'domain-list css-scrollbar',
    dividerClassName: 'border-top mt11',
    primaryHeadingClassName: 'mb10',
    secondaryHeadingClassName: 'mt20 mb10',
    emptyStateClassName: 'align-items-center bg-body-bg-color border d-flex h-100 justify-content-center noDataFound',
};
