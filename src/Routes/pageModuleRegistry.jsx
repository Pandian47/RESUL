/**
 * Single registry: page key → dynamic import(). Route config (`appRouteConfig.jsx`) references
 * these keys only; no PascalCase export surface required on a separate barrel file.
 */
import { lazy } from 'react';

/** @typedef {() => Promise<{ default: import('react').ComponentType<any> }>} PageLoader */

/** @type {Record<string, PageLoader>} */
export const PROTECTED_PAGE_LOADERS = {
    LaunchPad: () => import('Pages/AuthenticationModule/LaunchPad'),
    LaunchPadCSAT: () => import('Pages/csat'),
    Documentation: () => import('Pages/Documentation/Documentation'),
    ComponentsDocsList: () => import('Pages/Documentation/ComponentDocs/ComponentsList'),
    ComponentDocView: () => import('Pages/Documentation/ComponentDocs/ComponentDocView'),
    Dashboard: () => import('Pages/AuthenticationModule/Dashboard/Dashboard'),
    DashboardDemo: () => import('Pages/AuthenticationModule/Dashboard/Pages/DashboardDemo/DashboardDemo'),
    DashboardTwins: () => import('Pages/AuthenticationModule/DashboardTwins/Dashboard'),
    Audience: () => import('Pages/AuthenticationModule/Audience'),
    MasterData: () => import('Pages/AuthenticationModule/Audience/Pages/MasterData'),
    TargetList: () => import('Pages/AuthenticationModule/Audience/Pages/TargetList'),
    DynamicList: () => import('Pages/AuthenticationModule/Audience/Pages/DynamicList'),
    AddAudience: () => import('Pages/AuthenticationModule/Audience/Pages/AddAudience'),
    AddImportAudience: () => import('Pages/AuthenticationModule/Audience/Pages/AddImportAudience'),
    SyncHistory: () => import('Pages/AuthenticationModule/Audience/Pages/SyncHistory'),
    AudienceCsvDownload: () => import('Pages/AuthenticationModule/Audience/Pages/AudienceCsvDownload'),
    TargetListCreation: () => import('Pages/AuthenticationModule/Audience/Pages/TargetListCreation'),
    TargetListCreations: () => import('Pages/AuthenticationModule/Audience/Pages/TargetListCreations'),
    DynamicListCreation: () => import('Pages/AuthenticationModule/Audience/Pages/DynamicListCreation'),
    Preferences: () => import('Pages/AuthenticationModule/Preferences'),
    MyProfile: () => import('Pages/AuthenticationModule/Preferences/Pages/MyProfile'),
    AccountSettings: () => import('Pages/AuthenticationModule/Preferences/Pages/AccountSettings'),
    Users: () => import('Pages/AuthenticationModule/Preferences/Pages/Users'),
    AddUserComponent: () => import('Pages/AuthenticationModule/Preferences/Pages/Users/Pages'),
    AddUser: () => import('Pages/AuthenticationModule/Preferences/Pages/Users/Pages/AddUser'),
    RolesAndPermissions: () => import('Pages/AuthenticationModule/Preferences/Pages/RolesAndPermissions'),
    AddRolesAndPermissions: () =>
        import('Pages/AuthenticationModule/Preferences/Pages/RolesAndPermissions/Pages/AddPermission'),
    Companies: () => import('Pages/AuthenticationModule/Preferences/Pages/Companies'),
    AddCompanies: () => import('Pages/AuthenticationModule/Preferences/Pages/Companies/AddCompanies'),
    CompaniesPayment: () => import('Pages/RegistrationModule/Login/Pages/NewUser/Pages/Payment'),
    CompaniesLicenseKey: () => import('Pages/RegistrationModule/Login/Pages/NewUser/Pages/LicenseKey'),
    AlertAndNotifcations: () => import('Pages/AuthenticationModule/Preferences/Pages/AlertAndNotifications'),
    CommunicationSettings: () => import('Pages/AuthenticationModule/Preferences/Pages/CommunicationSettings'),
    Subscription: () =>
        import(
            'Pages/AuthenticationModule/Preferences/Pages/CommunicationSettings/Pages/ChannelSettings/Pages/Mail/Tabs/SubscriptionUnsubscription/Tabs/Subscription/Create'
        ),
    WebPermission: () =>
        import(
            'Pages/AuthenticationModule/Preferences/Pages/CommunicationSettings/Pages/ChannelSettings/Pages/Notification/Tabs/Web/Tabs/Web/Permissions'
        ),
    WebSDKIntegration: () =>
        import(
            'Pages/AuthenticationModule/Preferences/Pages/CommunicationSettings/Pages/ChannelSettings/Pages/Notification/Tabs/Web/Tabs/Web/Docs'
        ),
    MobilePermission: () =>
        import(
            'Pages/AuthenticationModule/Preferences/Pages/CommunicationSettings/Pages/ChannelSettings/Pages/Notification/Tabs/Mobile/Tabs/AppsList/Permissions'
        ),
    MobileSDKIntegration: () =>
        import(
            'Pages/AuthenticationModule/Preferences/Pages/CommunicationSettings/Pages/ChannelSettings/Pages/Notification/Tabs/Mobile/Tabs/AppsList/Docs'
        ),
    GoalsAndBenchmark: () => import('Pages/AuthenticationModule/Preferences/Pages/GoalsAndBenchmark'),
    ChannelBenchmark: () => import('Pages/AuthenticationModule/Preferences/Pages/GoalsAndBenchmark/Pages/Benchmark'),
    ChannelGoals: () => import('Pages/AuthenticationModule/Preferences/Pages/GoalsAndBenchmark/Pages/Goals'),
    OfferManagement: () => import('Pages/AuthenticationModule/Preferences/Pages/OfferManagement'),
    OfferAnalytics: () =>
        import('Pages/AuthenticationModule/Preferences/Pages/OfferManagement/Tabs/OfferAnalytics'),
    Offers: () => import('Pages/AuthenticationModule/Preferences/Pages/OfferManagement/Tabs/Offers'),
    AudienceScore: () => import('Pages/AuthenticationModule/Preferences/Pages/AudienceScore'),
    DataCatalogue: () => import('Pages/AuthenticationModule/Preferences/Pages/DataCatalogue'),
    DataCatalogueGrid: () =>
        import('Pages/AuthenticationModule/Preferences/Pages/DataCatalogue/Pages/DataCatalogueGrid'),
    CreateOffer: () => import('Pages/AuthenticationModule/Preferences/Pages/OfferManagement/Tabs/CreateOffer'),
    CreateBrand: () => import('Pages/AuthenticationModule/Preferences/Pages/OfferManagement/Tabs/CreateBrand'),
    CreateShop: () => import('Pages/AuthenticationModule/Preferences/Pages/OfferManagement/Tabs/CreateShop'),
    TemplateGenerator: () => import('Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator'),
    FormGenerator: () => import('Pages/AuthenticationModule/Preferences/Pages/FormGenerator'),
    AddFormGenerator: () => import('Pages/AuthenticationModule/Preferences/Pages/FormGenerator/Tabs'),
    BrandOwnedForm: () => import('Pages/AuthenticationModule/Preferences/Pages/FormGenerator/BrandOwnedForm'),
    AdvancedForm: () => import('Pages/AuthenticationModule/Preferences/Pages/FormGenerator/AdvancedForm'),
    DataExchange: () => import('Pages/AuthenticationModule/Preferences/Pages/DataExchange'),
    ServiceCatalogue: () => import('Pages/AuthenticationModule/Preferences/Pages/ServiceCatalogue'),
    Consumptions: () => import('Pages/AuthenticationModule/Preferences/Pages/Consumptions'),
    ConsumptionsChannel: () => import('Pages/AuthenticationModule/Preferences/Pages/Consumptions/Channels'),
    DatabaseConsumption: () =>
        import('Pages/AuthenticationModule/Preferences/Pages/Consumptions/Database_consumption'),
    CsvReport: () => import('Pages/AuthenticationModule/Preferences/Pages/Consumptions/CsvReport'),
    ConsumptionsTwins: () => import('Pages/AuthenticationModule/Preferences/Pages/ConsumptionsTwins'),
    ConsumptionsChannelTwins: () =>
        import('Pages/AuthenticationModule/Preferences/Pages/ConsumptionsTwins/Channels'),
    DatabaseConsumptionTwins: () =>
        import('Pages/AuthenticationModule/Preferences/Pages/ConsumptionsTwins/Database_consumption'),
    CsvReportTwins: () => import('Pages/AuthenticationModule/Preferences/Pages/ConsumptionsTwins/CsvReport'),
    Invoices: () => import('Pages/AuthenticationModule/Preferences/Pages/Invoices'),
    InvoiceView: () => import('Pages/AuthenticationModule/Preferences/Pages/Invoices/Pages/ViewInvoice'),
    LicenseInfo: () => import('Pages/AuthenticationModule/Preferences/Pages/LicenceInfo/LicenceInfo'),
    EmailBuilderHome: () =>
        import('Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/EmailBuilder'),
    WebPushBuilderHome: () =>
        import('Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/PushBuilder'),
    MobilePushBuilderHome: () =>
        import('Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/PushBuilder'),
    PushAIBuilder: () =>
        import('Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/AIBuilder/PushBuilder'),
    EmailAIBuilder: () =>
        import('Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/AIBuilder/EmailBuilder'),
    LandingPageAIBuilder: () =>
        import('Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/AIBuilder/LandingPageBuilder'),
    EmailBuilder: () =>
        import(
            'Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/EmailBuilder/Pages/CreatNewTemplates/index1'
        ),
    LandingTemplateGallery: () =>
        import('Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/LandingTemplateBuilder'),
    LandingTemplateBuilder: () =>
        import(
            'Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/LandingTemplateBuilder/Pages/LandingPageBuilder/LandingPageBuilder'
        ),
    TemplateBuilder: () =>
        import(
            'Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/EmailBuilder/Pages/CreatNewTemplates'
        ),
    EBuilder: () => import('Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/EBuilder/index'),
    FooterBuilder: () =>
        import(
            'Pages/AuthenticationModule/Preferences/Pages/CommunicationSettings/Pages/ChannelSettings/Pages/Mail/Tabs/EmailFooter/FooterBuilder'
        ),
    CommunicationLists: () =>
        import('Pages/AuthenticationModule/Communication/CommunicationLists/CommunicationLists'),
    CommunicationGallery: () => import('Pages/AuthenticationModule/Communication/CommunicationLists/Pages/Gallery'),
    CommunicationPlanner: () => import('Pages/AuthenticationModule/Communication/CommunicationLists/Pages/Planner'),
    CommunicationGalleryTwins: () =>
        import('Pages/AuthenticationModule/Communication/CommunicationLists/Pages/GalleryTwins'),
    CommunicationPlannerTwins: () =>
        import('Pages/AuthenticationModule/Communication/CommunicationLists/Pages/PlannerTwins'),
    PlanCommunication: () =>
        import('Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Plan'),
    CreateCommunication: () =>
        import('Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Create'),
    WorkFlow: () =>
        import('Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/MdcComponents/WorkFlow'),
    CreateMdcCommunication: () =>
        import('Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/MdcComponents/Create'),
    ConfigureAnalytics: () =>
        import(
            'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/MdcComponents/Create/ConfigureAnalytics'
        ),
    Execute: () => import('Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Execute'),
    AnalyticsTwins: () => import('Pages/AuthenticationModule/AnalyticsTwins'),
    AudienceAnalyticsTwins: () => import('Pages/AuthenticationModule/AnalyticsTwins/Pages/audienceAnalytics'),
    AuditLogTwins: () => import('Pages/AuthenticationModule/AnalyticsTwins/Pages/AuditLog'),
    DetailAnalyticsTwins: () =>
        import('Pages/AuthenticationModule/AnalyticsTwins/Pages/CommunicationAnalytics/DetailedAnalytics'),
    FormAnalyticsTwins: () => import('Pages/AuthenticationModule/AnalyticsTwins/Pages/FormAnalytics'),
    AnalyticsReportTwins: () =>
        import('Pages/AuthenticationModule/AnalyticsTwins/Pages/CommunicationAnalytics/AnalyticsReport'),
    TrendReportsTwins: () => import('Pages/AuthenticationModule/AnalyticsTwins/Pages/TrendReport'),
    Analytics: () => import('Pages/AuthenticationModule/Analytics'),
    AudienceAnalytics: () => import('Pages/AuthenticationModule/Analytics/Pages/audienceAnalytics'),
    AuditLog: () => import('Pages/AuthenticationModule/Analytics/Pages/AuditLog'),
    DetailAnalytics: () =>
        import('Pages/AuthenticationModule/Analytics/Pages/CommunicationAnalytics/DetailedAnalytics'),
    FormAnalytics: () => import('Pages/AuthenticationModule/Analytics/Pages/FormAnalytics'),
    AnalyticsReport: () =>
        import('Pages/AuthenticationModule/Analytics/Pages/CommunicationAnalytics/AnalyticsReport'),
    TrendReports: () => import('Pages/AuthenticationModule/Analytics/Pages/TrendReport'),
    Notifications: () =>
        import('Pages/AuthenticationModule/Preferences/Pages/AlertAndNotifications/AllNotifications'),
    EbuilderDemo: () => import('Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/DemoTrial'),
    ADSCreate: () =>
        import('Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/Ads/Pages/Create/index'),
    ADSListing: () => import('Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/Ads/index'),
    WhatsappBuilder: () =>
        import(
            'Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/WhatsappBuilder/Grid/WhatsappbuilderGrid'
        ),
    RCSBuilder: () =>
        import(
            'Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/RCSBuilder/Grid/RCSBuilderGrid'
        ),
    OfferBuilder: () =>
        import('Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/AIBuilder/OfferBuilder/index'),
    userInteraction: () => import('Pages/AuthenticationModule/Preferences/Pages/userInteractionFlow/index'),
    Genie: () => import('Pages/AuthenticationModule/genie'),
    KendoDocs: () => import('Pages/KendoDocs'),
    RuntimeErrorLog: () => import('Pages/Internal/RuntimeErrorLog'),
};

/** @type {Record<string, PageLoader>} */
export const PUBLIC_PAGE_LOADERS = {
    Login: () => import('Pages/RegistrationModule/Login'),
    AccountSetup: () => import('Pages/RegistrationModule/Login/Pages/NewUser/Pages/AccountSetUp'),
    SetUpComplete: () => import('Pages/RegistrationModule/Login/Pages/NewUser/Pages/SetupComplete'),
    Licensetype: () => import('Pages/RegistrationModule/Login/Pages/NewUser/Pages/LicenseType'),
    LicenseKey: () => import('Pages/RegistrationModule/Login/Pages/NewUser/Pages/LicenseKey'),
    Payment: () => import('Pages/RegistrationModule/Login/Pages/NewUser/Pages/Payment'),
};

function lazyPageMap(loaders) {
    return Object.fromEntries(Object.entries(loaders).map(([name, loader]) => [name, lazy(loader)]));
}

/** Lazy page components (no auth HOC). Use under {@link ProtectedLayout} so `permissions` flow from outlet context. */
export const ProtectedPages = lazyPageMap(PROTECTED_PAGE_LOADERS);

/** Lazy public/registration pages. Use under {@link PublicLayout}. */
export const PublicPages = lazyPageMap(PUBLIC_PAGE_LOADERS);

/** @deprecated Use `ProtectedPages` — kept for imports that expect `Pages`. */
export const Pages = ProtectedPages;

/** @deprecated Use `PublicPages`. */
export const PagesLogin = PublicPages;
