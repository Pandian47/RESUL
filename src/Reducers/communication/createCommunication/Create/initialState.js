const initialState = {
    // currentTab: 0,
    isDirty: false,
    verticalTab: {
        type: '',
        currentTab: 0,
    },
    selectedTabforEdit: null,
    activeTabs: {},
    tabsState: {
        email: {
            tabName: 'mail',
            currentIndex: 0,
        },
        messaging: {
            tabName: 'sms',
            currentIndex: 0,
        },
        notification: {
            tabName: 'web',
            currentIndex: 0,
        },
        socialPost: {
            tabName: 'facebook',
            currentIndex: 0,
        },
        voice: {
            tabName: 'callCenter',
            currentIndex: 0,
        },
        ads: {
            tabName: 'google',
            currentIndex: 0,
        },
        qr: {
            tabName: 'url',
            currentIndex: 0,
        },
        analytics: {
            tabName: 'web',
            currentIndex: 0,
        },
    },
    mail: {
        email: {},
    },
    messaging: {
        sms: {},
        whatsapp: {},
        line: {},
        rcs: {},
    },
    notification: {
        web: {
            result: {},
            inboxClassifications: [],
            audienceList: [],
        },
        mobile: {
            result: {},
            inboxClassifications: [],
            audienceList: [],
        },
    },
    socialPost: {
        facebook: [],
        twitter: [],
        instagram: [],
        linkedIn: [],
    },
    voice: {
        callCenter: {},
        vms: {},
    },
    ads: {
        google: {},
        facebook: {},
        twitter: {},
        linkedIn: {},
        vuer: {},
    },
    qr: {
        url: {
            getQRCodecampaign: [],
            getRecipient: [],
            isClear: false,
        },
        facebook: {},
        twitter: {},
        text: {},
        sms: {},
        email: {},
    },
    analytics: {
        web: {},
        app: {},
        offlineConversion: {},
        webft: false,
    },
    offlineConversionAttributes: {},
    smartLink: {},
    showSmartLink: false,
    smartLinkAutoAdd: false,
    smsList: {
        smsSettings: [],
        campaignUserList: [],
        campaignDetails: {},
        hsmTemplate: [],
        senderName: [],
        templateLanguage: [],
    },
    emailList: {
        unSubscriptionList: [],
        checkSpam: {},
        top3Spam: [],
        subjectLine_Analysis: [],
        emailFooter: [],
        smtpSettings: [],
        campaignDetails: {},
        domainNameList: []
    },
    voiceList: {
        campaignDetails: {},
        vendorList: []
    },
    directMailList: {
        transferMethods: {loading : false, data: []},
        vendors: {loading : false, data: []},
        campaignDetails: {}
    },
    vmsList: { senderName: [], language: [], template: [], campaignDetails: {} },
    rcsList: { senderName: [], templateList: [], templateContentDetail: [], campaignDetails: {} , editorContent: {}},
    audience: [],
    filterAudience: [],
    personalization: [],
    updateUserList: [],
    socialMediaPost: {
        socialMediaDropDown: [],
        fetchSocilaData: {},
        saveSociaPostData: {},
        fbCountries: [],
        cityCountries: [],
        imgeUpload: '',
    },
    smartLinkforAds: [],
    redirectionTab: 0,
    enableTab: {
        tabName: '',
        refreshStatus: false,
    },
    isSmartLinkCreated: false,
    isMDCEditMode: 'create',
    totalAudienceCount: 0,
    listTypeWisePersonlization: {},
    hsmTemplateList: {}
};

export default initialState;
