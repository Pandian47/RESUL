/**
 * Single source of truth for app routes: path segments + page keys in `pageModuleRegistry.jsx`.
 *
 * - **Protected** routes render under `ProtectedLayout` (see `MainRoutes.jsx`): `app` keys map to
 *   `ProtectedPages`; `permissions` are provided via outlet context (same data as the old HOC).
 * - **Public** routes render under `PublicLayout`: `login` keys map to `PublicPages`.
 * - `wrap: 'pushBuilder'`: optional wrapper around the page component
 */
import { Route, useOutletContext } from 'react-router-dom';
import { PushBuilderStateProvider } from 'Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/PushBuilder/Pages/Contex';

// --- Shared nested trees (same children, different parent path) ---

const COMMUNICATION_CHILDREN = [
    { index: true, app: 'CommunicationLists' },
    { path: 'communication-creation', app: 'PlanCommunication' },
    { path: 'communicationgalleryTwins', app: 'CommunicationGalleryTwins' },
    { path: 'communicationplannerTwins', app: 'CommunicationPlannerTwins' },
    { path: 'create-communication', app: 'CreateCommunication' },
    { path: 'mdc-workflow', app: 'WorkFlow' },
    { path: 'create-mdc-communication', app: 'CreateMdcCommunication' },
    { path: 'configure-analytics', app: 'ConfigureAnalytics' },
    { path: 'execute', app: 'Execute' },
];

const ANALYTICS_CHILDREN = [
    { index: true, app: 'Analytics' },
    { path: 'detail-analytics', app: 'DetailAnalytics' },
    { path: 'analytics-report', app: 'AnalyticsReport' },
    { path: 'trend-report', app: 'TrendReports' },
];

const ANALYTICS_TWINS_CHILDREN = [
    { index: true, app: 'AnalyticsTwins' },
    { path: 'detail-analytics', app: 'DetailAnalyticsTwins' },
    { path: 'analytics-report', app: 'AnalyticsReportTwins' },
    { path: 'trend-report', app: 'TrendReportsTwins' },
];

const ANALYTICS_SSE_CHILDREN = [
    { index: true, app: 'AnalyticsSSE' },
    { path: 'detail-analytics', app: 'DetailAnalyticsSSE' },
    { path: 'analytics-report', app: 'AnalyticsReportSSE' },
    { path: 'trend-report', app: 'TrendReportsSSE' },
];

const ACCOUNT_COMPANY_CHILDREN = [
    { index: true, app: 'AccountSettings', key: 'account-settings-index' },
    { path: 'add-companies', app: 'AddCompanies' },
    { path: 'payment', app: 'CompaniesPayment' },
    { path: 'account-activate', app: 'CompaniesLicenseKey' },
];

const COMPANIES_LIST_CHILDREN = [
    { index: true, app: 'Companies', key: 'company-list-index' },
    { path: 'add-companies', app: 'AddCompanies' },
    { path: 'payment', app: 'CompaniesPayment' },
    { path: 'account-activate', app: 'CompaniesLicenseKey' },
];

const CONSUMPTIONS_CHILDREN = [
    { index: true, app: 'Consumptions' },
    { path: 'consumption-channel', app: 'ConsumptionsChannel' },
    { path: 'database-consumption', app: 'DatabaseConsumption' },
    { path: 'csv-report', app: 'CsvReport' },
];

const CONSUMPTIONS_TWINS_CHILDREN = [
    { index: true, app: 'ConsumptionsTwins' },
    { path: 'consumption-channel', app: 'ConsumptionsChannelTwins' },
    { path: 'database-consumption', app: 'DatabaseConsumptionTwins' },
    { path: 'csv-report', app: 'CsvReportTwins' },
];

const TEMPLATE_GALLERY_CHILDREN = [
    { index: true, app: 'TemplateGenerator' },
    { path: 'email-builder', app: 'EmailAIBuilder' },
    { path: 'offer-builder', app: 'OfferBuilder' },
    { path: 'email-builder-gallery', app: 'EmailBuilderHome' },
    {
        path: 'webpush-builder-gallery',
        app: 'WebPushBuilderHome',
        wrap: 'pushBuilder',
        pushChannelId: 8,
    },
    {
        path: 'mobile-builder-gallery',
        app: 'MobilePushBuilderHome',
        wrap: 'pushBuilder',
        pushChannelId: 14,
    },
    { path: 'email-builder-page', app: 'EmailBuilder' },
    { path: 'push-builder', app: 'PushAIBuilder' },
    { path: 'e-builder', app: 'EBuilder' },
    { path: 'e-builderdemo', app: 'EbuilderDemo' },
    { path: 'template-builder', app: 'TemplateBuilder' },
    { path: 'landingpage-gallery', app: 'LandingTemplateGallery' },
    { path: 'landingpage-builder', app: 'LandingTemplateBuilder' },
    { path: 'form-generator', app: 'FormGenerator' },
    { path: 'advanced-form', app: 'AdvancedForm' },
    { path: 'form-analytics', app: 'FormAnalytics' },
    { path: 'add-form-generator', app: 'AddFormGenerator' },
    { path: 'brand-owned-form-generator', app: 'BrandOwnedForm' },
    {
        path: 'ads',
        children: [
            { index: true, app: 'ADSListing' },
            { path: 'create_ads', app: 'ADSCreate' },
        ],
    },
    { path: 'whatsapp-template-gallery', app: 'WhatsappBuilder' },
    { path: 'rcs-template-gallery', app: 'RCSBuilder' },
];

/** Authenticated app area — rendered inside `ProtectedLayout` from `Hoc/ProtectedRoutes.jsx`. */
export const PROTECTED_APP_ROUTE_TREE = [
    {
        path: 'docs',
        children: [
            { index: true, app: 'Documentation' },
            {
                path: 'components',
                children: [
                    { index: true, app: 'ComponentsDocsList' },
                    { path: ':componentName', app: 'ComponentDocView' },
                ],
            },
        ],
    },
    { path: 'dashboard', app: 'Dashboard' },
    { path: 'dashboardTwins', app: 'DashboardTwins' },
    { path: 'dashboard-demo', app: 'DashboardDemo' },
    {
        path: 'audience',
        children: [
            { index: true, app: 'Audience' },
            { path: 'add-audience', app: 'AddAudience' },
            { path: 'add-import-audience', app: 'AddImportAudience' },
            { path: 'masterdata', app: 'MasterData' },
            { path: 'targetList', app: 'TargetList' },
            { path: 'sync-history', app: 'SyncHistory' },
            { path: 'audience-csv-download', app: 'AudienceCsvDownload' },
            { path: 'create-target-list', app: 'TargetListCreation' },
            { path: 'create-target-lists', app: 'TargetListCreations' },
            { path: 'create-dynamic-list', app: 'DynamicListCreation' },
        ],
    },
    { path: 'communication', children: COMMUNICATION_CHILDREN },
    { path: 'communicationTwins', children: COMMUNICATION_CHILDREN },
    { path: 'analytics', children: ANALYTICS_CHILDREN },
    { path: 'AnalyticsSSE', children: ANALYTICS_SSE_CHILDREN },
    { path: 'analyticsse', children: ANALYTICS_SSE_CHILDREN },
    { path: 'AnalyticsTwins', children: ANALYTICS_TWINS_CHILDREN },
    {
        path: 'preferences',
        children: [
            { index: true, app: 'Preferences' },
            { path: 'my-profile', app: 'MyProfile' },
            { path: 'account-settings', children: ACCOUNT_COMPANY_CHILDREN },
            {
                path: 'users',
                children: [
                    { index: true, app: 'Users' },
                    { path: 'add-user', app: 'AddUserComponent' },
                ],
            },
            { path: 'alerts-and-notifications', app: 'AlertAndNotifcations' },
            { path: 'company-list', children: COMPANIES_LIST_CHILDREN },
            {
                path: 'goals-and-benchmark',
                children: [
                    { index: true, app: 'GoalsAndBenchmark' },
                    { path: 'channel-benchmark', app: 'ChannelBenchmark' },
                    { path: 'channel-goals', app: 'ChannelGoals' },
                ],
            },
            { path: 'offer-management', app: 'OfferManagement' },
            { path: 'offer-analytics', app: 'OfferAnalytics' },
            { path: 'audience-score', app: 'AudienceScore' },
            { path: 'create-offer', app: 'CreateOffer' },
            { path: 'create-brand', app: 'CreateBrand' },
            { path: 'create-shop', app: 'CreateShop' },
            { path: 'offers', app: 'Offers' },
            {
                path: 'data-catalogue',
                children: [
                    { index: true, app: 'DataCatalogue' },
                    { path: 'data-table', app: 'DataCatalogueGrid' },
                ],
            },
            {
                path: 'roles-and-permissions',
                children: [
                    { index: true, app: 'RolesAndPermissions' },
                    { path: 'add-permissions', app: 'AddRolesAndPermissions' },
                ],
            },
            { path: 'notifications', app: 'Notifications' },
            {
                path: 'communication-settings',
                children: [
                    { index: true, app: 'CommunicationSettings' },
                    { path: 'subscribe', app: 'Subscription' },
                    { path: 'unsubscribe', app: 'Subscription' },
                    { path: 'web-push-permissions', app: 'WebPermission' },
                    { path: 'web-push-SDK-integration', app: 'WebSDKIntegration' },
                    { path: 'mobile-push-permissions', app: 'MobilePermission' },
                    { path: 'mobile-push-SDK-integration', app: 'MobileSDKIntegration' },
                    { path: 'footer-builder', app: 'FooterBuilder' },
                ],
            },
            { path: 'template-gallery', children: TEMPLATE_GALLERY_CHILDREN },
            {
                path: 'form-generator',
                children: [
                    { index: true, app: 'FormGenerator' },
                    { path: 'add-form-generator', app: 'AddFormGenerator' },
                ],
            },
            { path: 'data-exchange', app: 'DataExchange' },
            { path: 'data-exchange-pinterest', app: 'DataExchange' },
            { path: 'features', app: 'ServiceCatalogue' },
            { path: 'consumptions', children: CONSUMPTIONS_CHILDREN },
            { path: 'consumptionsTwins', children: CONSUMPTIONS_TWINS_CHILDREN },
            {
                path: 'invoice-list',
                children: [
                    { index: true, app: 'Invoices' },
                    { path: 'invoice', app: 'InvoiceView' },
                ],
            },
            { path: 'license-info', app: 'LicenseInfo' },
        ],
    },
    { path: 'launch-pad', app: 'LaunchPad' },
    { path: 'kendoDocs', app: 'KendoDocs' },
];

/** Login / registration — rendered inside `PublicLayout` from `Hoc/NonProtectedRoute.jsx`. */
export const PUBLIC_APP_ROUTE_TREE = [
    {
        path: 'Home',
        children: [{ path: 'ChannelAccessADToken', login: 'Login' }],
    },
    {
        path: '/',
        children: [
            { index: true, login: 'Login' },
            { path: 'account-setup', login: 'AccountSetup' },
            { path: 'setup-complete', login: 'SetUpComplete' },
            { path: 'Licensetype', login: 'Licensetype' },
            { path: 'account-activate', login: 'LicenseKey' },
            { path: 'payment', login: 'Payment' },
        ],
    },
];

const PUBLIC_AUTH_PATHS = new Set([
    '/',
    '/account-setup',
    '/setup-complete',
    '/Licensetype',
    '/account-activate',
    '/payment',
]);

export const isPublicAuthPath = (pathname = '') => {
    const normalized = (pathname || '').replace(/\/+$/, '') || '/';
    return PUBLIC_AUTH_PATHS.has(normalized) || pathname.includes('ChannelAccessADToken');
};

function ProtectedLeaf({ pageKey, pages, wrap, pushChannelId }) {
    const ctx = useOutletContext();
    const permissions = ctx?.permissions;
    const Comp = pages[pageKey];
    if (!Comp) {
        console.error(`[appRouteConfig] Missing protected page key "${pageKey}" in ProtectedPages`);
        return null;
    }
    let inner = <Comp permissions={permissions} />;
    if (wrap === 'pushBuilder') {
        inner = (
            <PushBuilderStateProvider channelId={pushChannelId}>{inner}</PushBuilderStateProvider>
        );
    }
    return inner;
}

function PublicLeaf({ pageKey, pages }) {
    const Comp = pages[pageKey];
    if (!Comp) {
        console.error(`[appRouteConfig] Missing public page key "${pageKey}" in PublicPages`);
        return null;
    }
    return <Comp />;
}

function resolveLeafElement(node, pages, mode) {
    if (mode === 'protected') {
        return (
            <ProtectedLeaf
                pageKey={node.app}
                pages={pages}
                wrap={node.wrap}
                pushChannelId={node.pushChannelId}
            />
        );
    }
    return <PublicLeaf pageKey={node.login} pages={pages} />;
}

export function renderRouteNodes(nodes, mode, pages, depth = 0) {
    return nodes.map((node, i) => {
        const key = node.path ?? node.key ?? `route-${depth}-${i}`;
        const hasLeaf = mode === 'protected' ? Boolean(node.app) : Boolean(node.login);

        if (node.children?.length) {
            return (
                <Route
                    key={key}
                    path={node.path}
                    element={hasLeaf ? resolveLeafElement(node, pages, mode) : undefined}
                >
                    {renderRouteNodes(node.children, mode, pages, depth + 1)}
                </Route>
            );
        }

        if (node.index) {
            return (
                <Route
                    key={node.key ?? `${key}-index`}
                    index
                    element={resolveLeafElement(node, pages, mode)}
                />
            );
        }

        return (
            <Route key={key} path={node.path} element={resolveLeafElement(node, pages, mode)} />
        );
    });
}
