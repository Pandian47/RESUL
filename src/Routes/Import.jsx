import { lazy } from 'react';
import ProtectedRoute from 'Hoc/ProtectedRoutes';
import NonProtectedRoute from 'Hoc/NonProtectedRoute';

//Registeration Module
export const Login = NonProtectedRoute(lazy(() => import('Pages/RegistrationModule/Login')));
// const AccountType = lazy(() => import('Pages/RegistrationModule/Login/Pages/NewUser/Pages/AccountType'));
export const AccountSetup = NonProtectedRoute(
    lazy(() => import('Pages/RegistrationModule/Login/Pages/NewUser/Pages/AccountSetUp')),
);
export const SetUpComplete = NonProtectedRoute(
    lazy(() => import('Pages/RegistrationModule/Login/Pages/NewUser/Pages/SetupComplete')),
);
export const Licensetype = NonProtectedRoute(
    lazy(() => import('Pages/RegistrationModule/Login/Pages/NewUser/Pages/LicenseType')),
);
export const LicenseKey = NonProtectedRoute(
    lazy(() => import('Pages/RegistrationModule/Login/Pages/NewUser/Pages/LicenseKey')),
);
export const Payment = NonProtectedRoute(
    lazy(() => import('Pages/RegistrationModule/Login/Pages/NewUser/Pages/Payment')),
);

// Documentation
export const Documentation = ProtectedRoute(lazy(() => import('Pages/Documentation/Documentation')));

// Dashboard
export const Dashboard = ProtectedRoute(lazy(() => import('Pages/AuthenticationModule/Dashboard/Dashboard')));
export const DashboardDemo = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Dashboard/Pages/DashboardDemo/DashboardDemo')),
);

//Audience
export const Audience = ProtectedRoute(lazy(() => import('Pages/AuthenticationModule/Audience')));
export const MasterData = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Audience/Pages/MasterData')),
);
export const TargetList = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Audience/Pages/TargetList')),
);
export const DynamicList = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Audience/Pages/DynamicList')),
);
export const AddAudience = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Audience/Pages/AddAudience')),
);
export const AddImportAudience = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Audience/Pages/AddImportAudience')),
);
// export const AddAudienceMySQLData = lazy(() => import('Pages/AuthenticationModule/Audience/Pages/AddAudience/Components/RemoteDataSource/MySQL/DataExchange'));
export const SyncHistory = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Audience/Pages/SyncHistory')),
);
export const AudienceCsvDownload = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Audience/Pages/AudienceCsvDownload')),
);
// export const AddAudienceMySQLData = lazy(() =>
//     import('Pages/AuthenticationModule/Audience/Pages/AddAudience/Components/RemoteDataSource/MySQL/DataExchange'),
// );
export const TargetListCreation = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Audience/Pages/TargetListCreation')),
);
// );
export const TargetListCreations = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Audience/Pages/TargetListCreations')),
);
export const DynamicListCreation = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Audience/Pages/DynamicListCreation')),
);

//Login

//Preferences
export const Preferences = ProtectedRoute(lazy(() => import('Pages/AuthenticationModule/Preferences')));
export const MyProfile = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/MyProfile')),
);
export const AccountSettings = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/AccountSettings')),
);
export const Users = ProtectedRoute(lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/Users')));
export const AddUserComponent = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/Users/Pages')),
);
export const AddUser = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/Users/Pages/AddUser')),
);
export const RolesAndPermissions = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/RolesAndPermissions')),
);
export const AddRolesAndPermissions = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/RolesAndPermissions/Pages/AddPermission')),
);
export const Companies = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/Companies')),
);
export const AddCompanies = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/Companies/AddCompanies')),
);
export const CompaniesPayment = ProtectedRoute(
    lazy(() => import('Pages/RegistrationModule/Login/Pages/NewUser/Pages/Payment')),
);
export const CompaniesLicenseKey = ProtectedRoute(
    lazy(() => import('Pages/RegistrationModule/Login/Pages/NewUser/Pages/LicenseKey')),
);

export const AlertAndNotifcations = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/AlertAndNotifications')),
);

export const CommunicationSettings = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/CommunicationSettings')),
);
export const Subscription = ProtectedRoute(
    lazy(() =>
        import(
            'Pages/AuthenticationModule/Preferences/Pages/CommunicationSettings/Pages/ChannelSettings/Pages/Mail/Tabs/SubscriptionUnsubscription/Tabs/Subscription/Create'
        ),
    ),
);
export const WebPermission = ProtectedRoute(
    lazy(() =>
        import(
            'Pages/AuthenticationModule/Preferences/Pages/CommunicationSettings/Pages/ChannelSettings/Pages/Notification/Tabs/Web/Tabs/Web/Permissions'
        ),
    ),
);
export const WebSDKIntegration = ProtectedRoute(
    lazy(() =>
        import(
            'Pages/AuthenticationModule/Preferences/Pages/CommunicationSettings/Pages/ChannelSettings/Pages/Notification/Tabs/Web/Tabs/Web/Docs'
        ),
    ),
);
export const MobilePermission = ProtectedRoute(
    lazy(() =>
        import(
            'Pages/AuthenticationModule/Preferences/Pages/CommunicationSettings/Pages/ChannelSettings/Pages/Notification/Tabs/Mobile/Tabs/AppsList/Permissions'
        ),
    ),
);
export const MobileSDKIntegration = ProtectedRoute(
    lazy(() =>
        import(
            'Pages/AuthenticationModule/Preferences/Pages/CommunicationSettings/Pages/ChannelSettings/Pages/Notification/Tabs/Mobile/Tabs/AppsList/Docs'
        ),
    ),
);
export const GoalsAndBenchmark = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/GoalsAndBenchmark')),
);
export const ChannelBenchmark = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/GoalsAndBenchmark/Pages/Benchmark')),
);
export const ChannelGoals = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/GoalsAndBenchmark/Pages/Goals')),
);
export const OfferManagement = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/OfferManagement')),
);
export const OfferAnalytics = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/OfferManagement/Tabs/OfferAnalytics')),
);
export const AudienceScore = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/AudienceScore')),
);
export const DataCatalogue = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/DataCatalogue')),
);
export const DataCatalogueGrid = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/DataCatalogue/Pages/DataCatalogueGrid')),
);
export const CreateOffer = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/OfferManagement/Tabs/CreateOffer')),
);
export const CreateBrand = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/OfferManagement/Tabs/CreateBrand')),
);
export const CreateShop = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/OfferManagement/Tabs/CreateShop')),
);

export const TemplateGenerator = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator')),
);
export const FormGenerator = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/FormGenerator')),
);
export const AddFormGenerator = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/FormGenerator/Tabs')),
);
export const BrandOwnedForm = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/FormGenerator/BrandOwnedForm')),
);
export const DataExchange = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/DataExchange')),
);
export const ServiceCatalogue = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/ServiceCatalogue')),
);
export const Consumptions = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/Consumptions')),
);
export const ConsumptionsChannel = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/Consumptions/Channels')),
);
export const DatabaseConsumption = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/Consumptions/Database_consumption')),
);
export const CsvReport = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/Consumptions/CsvReport')),
);

export const ConsumptionsTwins = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/ConsumptionsTwins')),
);
export const ConsumptionsChannelTwins = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/ConsumptionsTwins/Channels')),
);
export const DatabaseConsumptionTwins = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/ConsumptionsTwins/Database_consumption')),
);
export const CsvReportTwins = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/ConsumptionsTwins/CsvReport')),
);
export const Invoices = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/Invoices')),
);
export const InvoiceView = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/Invoices/Pages/ViewInvoice')),
);
export const LicenseInfo = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/LicenceInfo/LicenceInfo')),
);
export const EmailBuilderHome = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/EmailBuilder')),
);
export const WebPushBuilderHome = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/PushBuilder')),
);
export const MobilePushBuilderHome = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/PushBuilder')),
);
export const PushAIBuilder = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/AIBuilder/PushBuilder')),
);
export const EmailAIBuilder = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/AIBuilder/EmailBuilder')),
);
export const LandingPageAIBuilder = ProtectedRoute(
    lazy(() =>
        import('Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/AIBuilder/LandingPageBuilder'),
    ),
);
export const EmailBuilder = ProtectedRoute(
    lazy(() =>
        import(
            'Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/EmailBuilder/Pages/CreatNewTemplates/index1'
        ),
    ),
);
export const LandingTemplateGallery = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/LandingTemplateBuilder')),
);
export const LandingTemplateBuilder = ProtectedRoute(
    lazy(() =>
        import(
            'Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/LandingTemplateBuilder/Pages/LandingPageBuilder/LandingPageBuilder'
        ),
    ),
);
export const TemplateBuilder = ProtectedRoute(
    lazy(() =>
        import('Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/EmailBuilder/Pages/CreatNewTemplates'),
    ),
);
export const EBuilder = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/EBuilder/index')),
);
export const FooterBuilder = ProtectedRoute(
    lazy(() =>
        import(
            'Pages/AuthenticationModule/Preferences/Pages/CommunicationSettings/Pages/ChannelSettings/Pages/Mail/Tabs/EmailFooter/FooterBuilder'
        ),
    ),
);

//Communication
export const CommunicationLists = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Communication/CommunicationLists/CommunicationLists')),
);
export const CommunicationGallery = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Communication/CommunicationLists/Pages/Gallery')),
);
export const CommunicationPlanner = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Communication/CommunicationLists/Pages/Planner')),
);

export const PlanCommunication = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Plan')),
);

export const CreateCommunication = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Create')),
);

export const WorkFlow = ProtectedRoute(
    lazy(() =>
        import('Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/MdcComponents/WorkFlow'),
    ),
);

export const CreateMdcCommunication = ProtectedRoute(
    lazy(() =>
        import('Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/MdcComponents/Create'),
    ),
);

export const ConfigureAnalytics = ProtectedRoute(
    lazy(() =>
        import(
            'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/MdcComponents/Create/ConfigureAnalytics'
        ),
    ),
);

export const Execute = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Execute')),
);

//AnalyticsTwins

export const AnalyticsTwins = ProtectedRoute(lazy(() => import('Pages/AuthenticationModule/AnalyticsTwins')));
export const AudienceAnalyticsTwins = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/AnalyticsTwins/Pages/audienceAnalytics')),
);
export const AuditLogTwins = ProtectedRoute(lazy(() => import('Pages/AuthenticationModule/AnalyticsTwins/Pages/AuditLog')));
export const DetailAnalyticsTwins = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/AnalyticsTwins/Pages/CommunicationAnalytics/DetailedAnalytics')),
);
export const FormAnalyticsTwins = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/AnalyticsTwins/Pages/FormAnalytics')),
);
export const AnalyticsReportTwins = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/AnalyticsTwins/Pages/CommunicationAnalytics/AnalyticsReport')),
);

export const TrendReportsTwins = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/AnalyticsTwins/Pages/TrendReport')),
);
//Analytics

export const Analytics = ProtectedRoute(lazy(() => import('Pages/AuthenticationModule/Analytics')));
export const AudienceAnalytics = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Analytics/Pages/audienceAnalytics')),
);
export const AuditLog = ProtectedRoute(lazy(() => import('Pages/AuthenticationModule/Analytics/Pages/AuditLog')));
export const DetailAnalytics = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Analytics/Pages/CommunicationAnalytics/DetailedAnalytics')),
);
export const FormAnalytics = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Analytics/Pages/FormAnalytics')),
);
export const AnalyticsReport = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Analytics/Pages/CommunicationAnalytics/AnalyticsReport')),
);

export const TrendReports = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Analytics/Pages/TrendReport')),
);

// Launch pad
export const LaunchPad = ProtectedRoute(lazy(() => import('Pages/AuthenticationModule/LaunchPad')));
export const LaunchPadCSAT = ProtectedRoute(lazy(() => import('Pages/csat')));

// Notifications
export const Notifications = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/AlertAndNotifications/AllNotifications')),
);
// Ebuilder trial
export const EbuilderDemo = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/DemoTrial')),
);

//  Template bilder ADS routes

export const ADSCreate = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/Ads/Pages/Create/index')),
);
export const ADSListing = ProtectedRoute(
    lazy(() => import('Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/Ads/index')),
);
export const WhatsappBuilder = ProtectedRoute(
    lazy(() =>
        import(
            'Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/WhatsappBuilder/Grid/WhatsappbuilderGrid'
        ),
    ),
);
export const RCSBuilder = ProtectedRoute(
    lazy(() =>
        import(
            'Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/RCSBuilder/Grid/RCSBuilderGrid'
        ),
    ),
);

export const OfferBuilder = ProtectedRoute(
    lazy(() =>
        import('Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/AIBuilder/OfferBuilder/index'),
    ),
);

export const userInteraction = ProtectedRoute(
    lazy(() =>
        import('Pages/AuthenticationModule/Preferences/Pages/userInteractionFlow/index'),
    ),
);

{
    /*xport const ThemeBased = ProtectedRoute(
    lazy(() => import('../ThemeBased')),
);

export const NonThemeBased = NonProtectedRoute(
    lazy(() => import('../ThemeBased')),
);*/
}
