
const globalInitialState = {
    loading: 0,
    isAuth: false,
    consumptionMM: new Date().getMonth(),
    consumptionYY: new Date().getFullYear(),
    u_consumptionMM: new Date().getMonth(),
    u_consumptionYY: new Date().getFullYear(),
    consumptionChannel: {},
    filteredChannels: null,
    showSessionModal: false,
    /** Set when session modal opens; cleared after successful re-login recovery. */
    pendingSessionRecovery: false,
    /** Incremented after session-timeout re-login so mounted pages can refetch / remount. */
    sessionRecoverySeq: 0,
    retryTime: 0,
    retryMethod: null,
    clientId: null,
    departmentId: null,
    parentClientId: null,
    approvalList: [],
    sample: '',
    clientList: [],
    accountAdmin: {},
    departmentList: [],
    profilePicture: null,
    clientBranch:false,
    isClient:true,
    isClientID:false,
    isDashboardData:'Communication dashboard',
    isMobileAppId:{},
    isWebAppId:{},
    isMobileAppData:[],
    isWebAppData:[],
    /** True after live-dashboard dropdown list API finishes (per tab). */
    isMobileAppListReady: false,
    isWebDomainListReady: false,
    isPassport:'',
    company_clientId: 0,
    company_departmentId: 0,
    company_departmentList: [],
    updatedLicenseId:0,
    failureApiErrors: [],
    industryId: '',
    currentPageConfig: {},
    currentTabConfig: {
        audienceTab: 0,
        audienceType: 'Brand audience',
        commPlanTab: null,
    },
    validUserEmailId :'',
    isShowCAPortal:  {
        show: false,
        callbackFunc: () => {}
    },
    companyList: [],
    utcTimeData: {
        utcTime: null,
        userAgent: null
    },
    renewalData: {},
    isCurrentBURFAStatus: false,
    userId: 0,
    departmentChangePending: false,
};

export default globalInitialState;
