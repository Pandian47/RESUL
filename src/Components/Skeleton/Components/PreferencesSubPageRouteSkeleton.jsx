
import { memo, useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import useQueryParams from 'Hooks/useQueryParams';

import { RSPageHeaderSkeleton, BreadcrumbSkeleton, TabBarViewSkeleton, skeletonShellSharedCriticalCss } from './common';
import { getRouteTabIndex } from './getRouteTabIndex';
import { SkeletonBrandShops } from './SkeletonBrandShops';
import {
    CommonSkeleton,
    MeterSkeletonColored,
    DataStorageSkeleton,
    ConsumptionsChannelSkeleton,
} from './SkeletonOverall';
import GridLoadingSkeleton from 'Pages/KendoDocs/CommonComponents/ResKendoGrid/GridLoadingSkeleton.jsx';
import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';
import SkeletonGalleryCard from 'Components/Skeleton/Components/SkeletonGalleryCard.jsx';

import PlanProgressStepsSkeleton from 'Components/Skeleton/pages/communication/creation/PlanProgressStepsSkeleton';
import LicenceInfoSkeleton from 'Pages/AuthenticationModule/Preferences/Pages/LicenceInfo/LicenceInfoSkeleton';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';
import {
    audienceScoreSkeletonCriticalCss,
    communicationSettingsSkeletonCriticalCss,
    communicationSubscriptionSkeletonCriticalCss,
    consumptionChannelSkeletonCriticalCss,
    dataExchangeSkeletonCriticalCss,
    preferencesSkeletonCriticalCss,
} from './preferencesSkeletonCriticalCss';

/** Cleared when Communication settings page mounts so lazy fallbacks may show inner grid only. */
let communicationSettingsRouteSkeletonBootstrap = false;

const beginCommunicationSettingsRouteSkeleton = () => {
    communicationSettingsRouteSkeletonBootstrap = true;
};

const isCommunicationSettingsRouteSkeletonBootstrap = () => communicationSettingsRouteSkeletonBootstrap;

export const endCommunicationSettingsRouteSkeletonBootstrap = () => {
    communicationSettingsRouteSkeletonBootstrap = false;
};

export { isCommunicationSettingsRouteSkeletonBootstrap };

export const PREFERENCES_SUBPAGE_VARIANT = {
    DEFAULT: 'default',
    MY_PROFILE: 'myProfile',
    ACCOUNT_SETTINGS: 'accountSettings',
    USERS: 'users',
    USERS_ADD_EDIT: 'usersAddEdit',
    ROLES: 'roles',
    ROLES_PERMISSIONS_EDIT: 'rolesPermissionsEdit',
    ALERTS_NOTIFICATIONS: 'alertsNotifications',
    NOTIFICATIONS_LIST: 'notificationsList',
    COMPANY_LIST: 'companyList',
    COMPANY_CLIENT_DETAILS: 'companyClientDetails',
    COMPANY_ASSIGN_ROLE: 'companyAssignRole',
    COMPANY_LOCALIZATION: 'companyLocalization',
    OFFER_MANAGEMENT: 'offerManagement',
    CREATE_OFFER: 'createOffer',
    CREATE_BRAND: 'createBrand',
    CREATE_SHOP: 'createShop',
    OFFER_DISCOVER: 'offerDiscover',
    TEMPLATE_GALLERY: 'templateGallery',
    TG_TABBED_GALLERY: 'tgTabbedGallery',
    TG_LANDING_GALLERY: 'tgLandingGallery',
    TG_FORM_GENERATOR: 'tgFormGenerator',
    FORM_GENERATOR: 'formGenerator',
    FORM_GENERATOR_EDITOR: 'formGeneratorEditor',
    FORM_GENERATOR_ADD: 'formGeneratorAdd',
    BRAND_OWNED_FORM: 'brandOwnedForm',
    TG_ADS: 'tgAds',
    TG_WHATSAPP: 'tgWhatsapp',
    DATA_CATALOGUE: 'dataCatalogue',
    DATA_CATALOGUE_GRID: 'dataCatalogueGrid',
    CONSUMPTIONS: 'consumptions',
    CONSUMPTION_CHANNEL: 'consumptionChannel',
    COMMUNICATION_SETTINGS: 'communicationSettings',
    COMMUNICATION_SUBSCRIPTION: 'communicationSubscription',
    COMMUNICATION_PUSH_PERMISSIONS: 'communicationPushPermissions',
    GOALS_BENCHMARK_EDIT: 'goalsBenchmarkEdit',
    GOALS_CHANNEL_GOALS: 'goalsChannelGoals',
    AUDIENCE_SCORE: 'audienceScore',
    DATA_EXCHANGE: 'dataExchange',
    INVOICE_LIST: 'invoiceList',
    LICENSE_INFO: 'licenseInfo',
};

const DE_TOP_TAB_LABELS = ['Data ingestion', 'API consumptions', 'Publishers'];
const DE_VERTICAL_TAB_SKELETON_COUNT = 11;
const DE_VERTICAL_TAB_LABELS = [
    'All',
    'Analytics',
    'CRM',
    'E-Commerce',
    'Social media',
    'Data service',
    'Messengers',
    'Webinar',
    'Digital assistance',
    'Digital asset',
    'CMS',
];

const AS_VERTICAL_TAB_LABELS = [
    'Persona',
    'Purchase pattern',
    'Profile data',
    'Communication response',
    'Audience laddering',
];

const CS_VERTICAL_LABELS = ['Email', 'Messaging', 'Notifications'];
/** Mail icon sub-tabs (SMTP, Lifetime cap, Sub / Un-sub) — 3 placeholders match live density. */
const CS_MAIL_SUB_TAB_COUNT = 3;
const CS_MESSAGING_SUB_TAB_COUNT = 5;
const CS_NOTIFICATION_SUB_TAB_COUNT = 3;

const CS_CHANNEL_SUB_TAB_COUNT = {
    mail: CS_MAIL_SUB_TAB_COUNT,
    messaging: CS_MESSAGING_SUB_TAB_COUNT,
    notification: CS_NOTIFICATION_SUB_TAB_COUNT,
};

/** Mail › Email footer — index in MAIL_TABBER_CONFIG (no inner RSTabbar). */
const CS_MAIL_EMAIL_FOOTER_TAB_INDEX = 5;

/** Icon sub-tabs that render a horizontal RSTabbar inside the content panel (matches live pages). */
const CS_MAIL_TABS_WITH_INNER_TABS = new Set([0, 3]); // SMTP, Sub / Un-sub
const CS_MESSAGING_TABS_WITH_INNER_TABS = new Set([0, 1, 4]); // SMS, WhatsApp, RCS
const CS_NOTIFICATION_TABS_WITH_INNER_TABS = new Set([0, 1]); // Web, Mobile

/** Icon sub-tabs whose heading row includes the + add icon (icon-lg / 32px). */
const CS_MAIL_TABS_WITH_ADD_ACTION = new Set([0, 1, 3, 4, 5]);
const CS_MESSAGING_TABS_WITH_ADD_ACTION = new Set([0, 1, 2, 3, 4]);

const MAIL_TAB_ID_TO_INDEX = {
    SMTP: 0,
    QuietHours: 1,
    LifetimeCap: 2,
    SubscriptionUnsubscription: 3,
    DoubleOptIn: 4,
    EmailFooter: 5,
};

const MESSAGING_TAB_ID_TO_INDEX = {
    SMS: 0,
    Whatsapp: 1,
    VMS: 2,
    LINE: 3,
    RCS: 4,
};

const NOTIFICATION_TAB_ID_TO_INDEX = {
    Web: 0,
    Mobile: 1,
    WebMobile: 2,
};

/** Mirrors resolveMailTabState enough for skeleton inner-tab visibility (avoids jsx cycle). */
const resolveMailSkeletonTabIndex = (navState = {}) => {
    if (navState?.currentTab !== undefined && navState?.currentTab !== null) {
        return navState.currentTab;
    }
    if (navState?.mailTabId) {
        const index = MAIL_TAB_ID_TO_INDEX[navState.mailTabId];
        if (index !== undefined) return index;
    }
    if (navState?.subfrom === 'footer-builder') {
        return CS_MAIL_EMAIL_FOOTER_TAB_INDEX;
    }
    if (navState?.from === 'sub') {
        return MAIL_TAB_ID_TO_INDEX.SubscriptionUnsubscription;
    }
    const isMailVertical =
        navState?.verticalTabId === 'Mail' || navState?.verticalTab === 0;
    if (
        isMailVertical &&
        navState?.subTab !== undefined &&
        navState?.subTab !== null &&
        !navState?.messagingTabId &&
        !navState?.notificationTabId
    ) {
        return navState.subTab;
    }
    if (navState?.index !== undefined && navState?.index !== null) {
        return navState.index;
    }
    return 0;
};

/** Mirrors resolveMessagingTabState — avoids importing ChannelSettings constant (cycle). */
const resolveMessagingSkeletonTabIndex = (navState = {}) => {
    if (navState?.messagingTabId) {
        const index = MESSAGING_TAB_ID_TO_INDEX[navState.messagingTabId];
        if (index !== undefined) return index;
    }
    if (navState?.from === 'messaging' && navState?.subTab !== undefined && navState?.subTab !== null) {
        return navState.subTab;
    }
    const isMessagingVertical =
        navState?.verticalTabId === 'Messaging' || navState?.verticalTab === 1;
    if (isMessagingVertical && navState?.subTab !== undefined && navState?.subTab !== null) {
        return navState.subTab;
    }
    return 0;
};

/** Mirrors resolveNotificationTabState — avoids importing ChannelSettings constant (cycle). */
const resolveNotificationSkeletonTabIndex = (navState = {}) => {
    if (navState?.from === 'cs_preferences' && navState?.innerTab !== undefined) {
        return navState.innerTab;
    }
    if (navState?.notificationTabId) {
        const index = NOTIFICATION_TAB_ID_TO_INDEX[navState.notificationTabId];
        if (index !== undefined) return index;
    }
    if (navState?.subfrom != null && navState?.subfrom !== '' && navState?.subTab !== undefined) {
        return navState.subTab;
    }
    if (navState?.type === true) return 1;
    if (navState?.type === false) return 0;
    return 0;
};

const shouldShowInnerTabsForChannel = (channel, navState = {}) => {
    if (channel === 'mail') {
        return CS_MAIL_TABS_WITH_INNER_TABS.has(resolveMailSkeletonTabIndex(navState));
    }
    if (channel === 'messaging') {
        return CS_MESSAGING_TABS_WITH_INNER_TABS.has(resolveMessagingSkeletonTabIndex(navState));
    }
    if (channel === 'notification') {
        return CS_NOTIFICATION_TABS_WITH_INNER_TABS.has(resolveNotificationSkeletonTabIndex(navState));
    }
    return false;
};

const shouldShowAddActionForChannel = (channel, navState = {}) => {
    if (channel === 'mail') {
        return CS_MAIL_TABS_WITH_ADD_ACTION.has(resolveMailSkeletonTabIndex(navState));
    }
    if (channel === 'messaging') {
        return CS_MESSAGING_TABS_WITH_ADD_ACTION.has(resolveMessagingSkeletonTabIndex(navState));
    }
    return false;
};

const useCommunicationSettingsInnerTabsSkeletonVisibility = (channel) => {
    const { state } = useLocation();
    const queryState = useQueryParams('/preferences/communication-settings');
    const navState = { ...queryState, ...state };

    if (channel) {
        return shouldShowInnerTabsForChannel(channel, navState);
    }

    if (navState?.verticalTabId === 'Messaging' || navState?.verticalTab === 1) {
        return shouldShowInnerTabsForChannel('messaging', navState);
    }
    if (navState?.verticalTabId === 'Notification' || navState?.verticalTab === 2) {
        return shouldShowInnerTabsForChannel('notification', navState);
    }
    return shouldShowInnerTabsForChannel('mail', navState);
};

const useCommunicationSettingsAddActionSkeletonVisibility = (channel) => {
    const { state } = useLocation();
    const queryState = useQueryParams('/preferences/communication-settings');
    const navState = { ...queryState, ...state };

    if (channel) {
        return shouldShowAddActionForChannel(channel, navState);
    }

    if (navState?.verticalTabId === 'Messaging' || navState?.verticalTab === 1) {
        return shouldShowAddActionForChannel('messaging', navState);
    }
    return shouldShowAddActionForChannel('mail', navState);
};

/** Top RSTabbarFluid tab from `?q=` or `isBenchMark` (Communication settings page). */
export const getCommunicationSettingsTabIndex = (search = '') => {
    try {
        const params = new URLSearchParams(search || '');
        if (params.get('isBenchMark')) {
            return 2;
        }
        const q = params.get('q');
        if (!q) return 0;
        const parsed = decodeLargeState(q);
        const tab = Number(parsed?.tab);
        return Number.isFinite(tab) ? tab : 0;
    } catch {
        return 0;
    }
};

const COMPANY_WIZARD_PAGE_STORAGE_KEY = 'preferencesCompanyWizardPage';

/** Persist wizard step for route skeleton on refresh (add-companies / account-settings). */
export const persistCompanyWizardPage = (page = 'NEW_COMPANY') => {
    try {
        if (page) {
            sessionStorage.setItem(COMPANY_WIZARD_PAGE_STORAGE_KEY, page);
        }
    } catch {
        // ignore
    }
};

const getPersistedCompanyWizardPage = () => {
    try {
        return sessionStorage.getItem(COMPANY_WIZARD_PAGE_STORAGE_KEY) || 'NEW_COMPANY';
    } catch {
        return 'NEW_COMPANY';
    }
};

/** Company add/edit wizard step → skeleton variant. */
export const resolveCompanyFlowSkeletonVariant = (currentPage = '') => {
    switch (currentPage) {
        case 'NEW_COMPANY':
            return PREFERENCES_SUBPAGE_VARIANT.COMPANY_CLIENT_DETAILS;
        case 'ASSIGN_ROLE':
        case 'USERGRID':
        case 'ADDUSER':
            return PREFERENCES_SUBPAGE_VARIANT.COMPANY_ASSIGN_ROLE;
        case 'COMPANY_LOCALIZATION':
            return PREFERENCES_SUBPAGE_VARIANT.COMPANY_LOCALIZATION;
        default:
            return PREFERENCES_SUBPAGE_VARIANT.COMPANY_CLIENT_DETAILS;
    }
};

/** Form builder canvas — tab selected or edit query present (matches RSHeader hide + InfoCardFormBuilder). */
export const resolveFormGeneratorEditorMode = (pathname = '', search = '') => {
    const normalized = (pathname || '').toLowerCase().replace(/\/$/, '');
    if (!normalized.includes('/add-form-generator')) return false;

    const queryString =
        search ||
        (typeof window !== 'undefined' && window.location?.search ? window.location.search : '');
    const params = new URLSearchParams(queryString.replace(/^\?/, ''));

    return params.get('tabSelected') === 'true' || Boolean(params.get('q'));
};

/** Map preferences sub-route path to skeleton layout variant. */
export const resolvePreferencesSubPageVariant = (pathname = '', search = '') => {
    const normalized = (pathname || '').toLowerCase().replace(/\/$/, '');
    if (normalized.includes('/preferences/my-profile')) {
        return PREFERENCES_SUBPAGE_VARIANT.MY_PROFILE;
    }
    if (normalized.includes('/preferences/account-settings')) {
        return resolveCompanyFlowSkeletonVariant(getPersistedCompanyWizardPage());
    }
    if (/\/preferences\/users$/.test(normalized)) {
        return PREFERENCES_SUBPAGE_VARIANT.USERS;
    }
    if (/\/preferences\/users\/add-user$/.test(normalized)) {
        return PREFERENCES_SUBPAGE_VARIANT.USERS_ADD_EDIT;
    }
    if (/\/preferences\/roles-and-permissions\/add-permissions$/.test(normalized)) {
        return PREFERENCES_SUBPAGE_VARIANT.ROLES_PERMISSIONS_EDIT;
    }
    if (/\/preferences\/roles-and-permissions$/.test(normalized)) {
        return PREFERENCES_SUBPAGE_VARIANT.ROLES;
    }
    if (/\/preferences\/alerts-and-notifications$/.test(normalized)) {
        return PREFERENCES_SUBPAGE_VARIANT.ALERTS_NOTIFICATIONS;
    }
    if (/^\/preferences\/notifications$/.test(normalized)) {
        return PREFERENCES_SUBPAGE_VARIANT.NOTIFICATIONS_LIST;
    }
    if (/\/preferences\/company-list\/add-companies$/.test(normalized)) {
        return resolveCompanyFlowSkeletonVariant(getPersistedCompanyWizardPage());
    }
    if (/\/preferences\/company-list$/.test(normalized)) {
        return PREFERENCES_SUBPAGE_VARIANT.COMPANY_LIST;
    }
    if (/\/preferences\/offer-management$/.test(normalized)) {
        return PREFERENCES_SUBPAGE_VARIANT.OFFER_MANAGEMENT;
    }
    if (/\/preferences\/create-offer$/.test(normalized)) {
        return PREFERENCES_SUBPAGE_VARIANT.CREATE_OFFER;
    }
    if (/\/preferences\/create-brand$/.test(normalized)) {
        return PREFERENCES_SUBPAGE_VARIANT.CREATE_BRAND;
    }
    if (/\/preferences\/create-shop$/.test(normalized)) {
        return PREFERENCES_SUBPAGE_VARIANT.CREATE_SHOP;
    }
    if (/\/preferences\/offers$/.test(normalized)) {
        return PREFERENCES_SUBPAGE_VARIANT.OFFER_DISCOVER;
    }
    if (/^\/preferences\/template-gallery$/.test(normalized)) {
        return PREFERENCES_SUBPAGE_VARIANT.TEMPLATE_GALLERY;
    }
    if (/^\/preferences\/template-gallery\/email-builder-gallery$/.test(normalized)) {
        return PREFERENCES_SUBPAGE_VARIANT.TG_TABBED_GALLERY;
    }
    if (
        /^\/preferences\/template-gallery\/webpush-builder-gallery$/.test(normalized) ||
        /^\/preferences\/template-gallery\/mobile-builder-gallery$/.test(normalized)
    ) {
        return PREFERENCES_SUBPAGE_VARIANT.TG_TABBED_GALLERY;
    }
    if (/^\/preferences\/template-gallery\/landingpage-gallery$/.test(normalized)) {
        return PREFERENCES_SUBPAGE_VARIANT.TG_LANDING_GALLERY;
    }
    if (/^\/preferences\/template-gallery\/form-generator$/.test(normalized)) {
        return PREFERENCES_SUBPAGE_VARIANT.TG_FORM_GENERATOR;
    }
    if (/\/add-form-generator$/.test(normalized)) {
        return resolveFormGeneratorEditorMode(pathname, search)
            ? PREFERENCES_SUBPAGE_VARIANT.FORM_GENERATOR_EDITOR
            : PREFERENCES_SUBPAGE_VARIANT.FORM_GENERATOR_ADD;
    }
    if (/^\/preferences\/form-generator$/.test(normalized)) {
        return PREFERENCES_SUBPAGE_VARIANT.FORM_GENERATOR;
    }
    if (/^\/preferences\/template-gallery\/brand-owned-form-generator$/.test(normalized)) {
        return PREFERENCES_SUBPAGE_VARIANT.BRAND_OWNED_FORM;
    }
    if (/^\/preferences\/template-gallery\/ads$/.test(normalized)) {
        return PREFERENCES_SUBPAGE_VARIANT.TG_ADS;
    }
    if (/^\/preferences\/template-gallery\/whatsapp-template-gallery$/.test(normalized)) {
        return PREFERENCES_SUBPAGE_VARIANT.TG_WHATSAPP;
    }
    if (/^\/preferences\/data-catalogue\/data-table$/.test(normalized)) {
        return PREFERENCES_SUBPAGE_VARIANT.DATA_CATALOGUE_GRID;
    }
    if (/^\/preferences\/data-catalogue$/.test(normalized)) {
        return PREFERENCES_SUBPAGE_VARIANT.DATA_CATALOGUE;
    }
    if (normalized.includes('/consumption-channel')) {
        return PREFERENCES_SUBPAGE_VARIANT.CONSUMPTION_CHANNEL;
    }
    if (/^\/preferences\/consumptions$/.test(normalized) || /^\/preferences\/consumptionstwins$/.test(normalized)) {
        return PREFERENCES_SUBPAGE_VARIANT.CONSUMPTIONS;
    }
    if (/^\/preferences\/communication-settings\/(subscribe|unsubscribe)$/.test(normalized)) {
        return PREFERENCES_SUBPAGE_VARIANT.COMMUNICATION_SUBSCRIPTION;
    }
    if (
        /^\/preferences\/communication-settings\/(web-push-permissions|mobile-push-permissions)$/.test(normalized)
    ) {
        return PREFERENCES_SUBPAGE_VARIANT.COMMUNICATION_PUSH_PERMISSIONS;
    }
    if (/^\/preferences\/communication-settings$/.test(normalized)) {
        return PREFERENCES_SUBPAGE_VARIANT.COMMUNICATION_SETTINGS;
    }
    if (normalized.includes('/preferences/goals-and-benchmark/channel-goals')) {
        return PREFERENCES_SUBPAGE_VARIANT.GOALS_CHANNEL_GOALS;
    }
    if (normalized.includes('/preferences/goals-and-benchmark/channel-benchmark')) {
        return PREFERENCES_SUBPAGE_VARIANT.GOALS_BENCHMARK_EDIT;
    }
    if (/^\/preferences\/audience-score$/.test(normalized)) {
        return PREFERENCES_SUBPAGE_VARIANT.AUDIENCE_SCORE;
    }
    if (/^\/preferences\/data-exchange/.test(normalized)) {
        return PREFERENCES_SUBPAGE_VARIANT.DATA_EXCHANGE;
    }
    if (/^\/preferences\/invoice-list$/.test(normalized)) {
        return PREFERENCES_SUBPAGE_VARIANT.INVOICE_LIST;
    }
    if (/^\/preferences\/license-info$/.test(normalized)) {
        return PREFERENCES_SUBPAGE_VARIANT.LICENSE_INFO;
    }
    return PREFERENCES_SUBPAGE_VARIANT.DEFAULT;
};

const SUBPAGE_VARIANTS_WITH_BACK = new Set([
    PREFERENCES_SUBPAGE_VARIANT.MY_PROFILE,
    PREFERENCES_SUBPAGE_VARIANT.ACCOUNT_SETTINGS,
    PREFERENCES_SUBPAGE_VARIANT.USERS,
    PREFERENCES_SUBPAGE_VARIANT.ROLES,
    PREFERENCES_SUBPAGE_VARIANT.ROLES_PERMISSIONS_EDIT,
    PREFERENCES_SUBPAGE_VARIANT.ALERTS_NOTIFICATIONS,
    PREFERENCES_SUBPAGE_VARIANT.NOTIFICATIONS_LIST,
    PREFERENCES_SUBPAGE_VARIANT.COMPANY_LIST,
    PREFERENCES_SUBPAGE_VARIANT.OFFER_MANAGEMENT,
    PREFERENCES_SUBPAGE_VARIANT.CREATE_OFFER,
    PREFERENCES_SUBPAGE_VARIANT.CREATE_BRAND,
    PREFERENCES_SUBPAGE_VARIANT.CREATE_SHOP,
    PREFERENCES_SUBPAGE_VARIANT.OFFER_DISCOVER,
    PREFERENCES_SUBPAGE_VARIANT.TEMPLATE_GALLERY,
    PREFERENCES_SUBPAGE_VARIANT.TG_TABBED_GALLERY,
    PREFERENCES_SUBPAGE_VARIANT.TG_LANDING_GALLERY,
    PREFERENCES_SUBPAGE_VARIANT.TG_FORM_GENERATOR,
    PREFERENCES_SUBPAGE_VARIANT.FORM_GENERATOR,
    PREFERENCES_SUBPAGE_VARIANT.FORM_GENERATOR_ADD,
    PREFERENCES_SUBPAGE_VARIANT.BRAND_OWNED_FORM,
    PREFERENCES_SUBPAGE_VARIANT.TG_ADS,
    PREFERENCES_SUBPAGE_VARIANT.TG_WHATSAPP,
    PREFERENCES_SUBPAGE_VARIANT.DATA_CATALOGUE,
    PREFERENCES_SUBPAGE_VARIANT.DATA_CATALOGUE_GRID,
    PREFERENCES_SUBPAGE_VARIANT.COMMUNICATION_SETTINGS,
    PREFERENCES_SUBPAGE_VARIANT.COMMUNICATION_SUBSCRIPTION,
    PREFERENCES_SUBPAGE_VARIANT.COMMUNICATION_PUSH_PERMISSIONS,
    PREFERENCES_SUBPAGE_VARIANT.GOALS_BENCHMARK_EDIT,
    PREFERENCES_SUBPAGE_VARIANT.GOALS_CHANNEL_GOALS,
    PREFERENCES_SUBPAGE_VARIANT.AUDIENCE_SCORE,
    PREFERENCES_SUBPAGE_VARIANT.DATA_EXCHANGE,
    PREFERENCES_SUBPAGE_VARIANT.INVOICE_LIST,
    PREFERENCES_SUBPAGE_VARIANT.LICENSE_INFO,
]);

const SUBPAGE_TITLE_WIDTH = {
    [PREFERENCES_SUBPAGE_VARIANT.MY_PROFILE]: 140,
    [PREFERENCES_SUBPAGE_VARIANT.ACCOUNT_SETTINGS]: 220,
    [PREFERENCES_SUBPAGE_VARIANT.USERS]: 130,
    [PREFERENCES_SUBPAGE_VARIANT.USERS_ADD_EDIT]: 120,
    [PREFERENCES_SUBPAGE_VARIANT.ROLES]: 200,
    [PREFERENCES_SUBPAGE_VARIANT.ROLES_PERMISSIONS_EDIT]: 220,
    [PREFERENCES_SUBPAGE_VARIANT.ALERTS_NOTIFICATIONS]: 220,
    [PREFERENCES_SUBPAGE_VARIANT.NOTIFICATIONS_LIST]: 140,
    [PREFERENCES_SUBPAGE_VARIANT.COMPANY_LIST]: 150,
    [PREFERENCES_SUBPAGE_VARIANT.OFFER_MANAGEMENT]: 200,
    [PREFERENCES_SUBPAGE_VARIANT.CREATE_OFFER]: 120,
    [PREFERENCES_SUBPAGE_VARIANT.CREATE_BRAND]: 120,
    [PREFERENCES_SUBPAGE_VARIANT.CREATE_SHOP]: 110,
    [PREFERENCES_SUBPAGE_VARIANT.OFFER_DISCOVER]: 260,
    [PREFERENCES_SUBPAGE_VARIANT.TEMPLATE_GALLERY]: 280,
    [PREFERENCES_SUBPAGE_VARIANT.TG_TABBED_GALLERY]: 300,
    [PREFERENCES_SUBPAGE_VARIANT.TG_LANDING_GALLERY]: 340,
    [PREFERENCES_SUBPAGE_VARIANT.TG_FORM_GENERATOR]: 140,
    [PREFERENCES_SUBPAGE_VARIANT.FORM_GENERATOR]: 140,
    [PREFERENCES_SUBPAGE_VARIANT.FORM_GENERATOR_ADD]: 160,
    [PREFERENCES_SUBPAGE_VARIANT.BRAND_OWNED_FORM]: 160,
    [PREFERENCES_SUBPAGE_VARIANT.TG_ADS]: 80,
    [PREFERENCES_SUBPAGE_VARIANT.TG_WHATSAPP]: 280,
    [PREFERENCES_SUBPAGE_VARIANT.DATA_CATALOGUE]: 140,
    [PREFERENCES_SUBPAGE_VARIANT.DATA_CATALOGUE_GRID]: 140,
    [PREFERENCES_SUBPAGE_VARIANT.CONSUMPTIONS]: 160,
    [PREFERENCES_SUBPAGE_VARIANT.CONSUMPTION_CHANNEL]: 160,
    [PREFERENCES_SUBPAGE_VARIANT.COMMUNICATION_SETTINGS]: 220,
    [PREFERENCES_SUBPAGE_VARIANT.COMMUNICATION_SUBSCRIPTION]: 200,
    [PREFERENCES_SUBPAGE_VARIANT.COMMUNICATION_PUSH_PERMISSIONS]: 100,
    [PREFERENCES_SUBPAGE_VARIANT.GOALS_BENCHMARK_EDIT]: 240,
    [PREFERENCES_SUBPAGE_VARIANT.GOALS_CHANNEL_GOALS]: 300,
    [PREFERENCES_SUBPAGE_VARIANT.AUDIENCE_SCORE]: 180,
    [PREFERENCES_SUBPAGE_VARIANT.DATA_EXCHANGE]: 160,
    [PREFERENCES_SUBPAGE_VARIANT.INVOICE_LIST]: 120,
    [PREFERENCES_SUBPAGE_VARIANT.LICENSE_INFO]: 120,
    [PREFERENCES_SUBPAGE_VARIANT.COMPANY_ASSIGN_ROLE]: 220,
};

const PrefFieldSkeleton = ({ sm = 6, xs = 12, stopAnimation = false }) => (
    <Col sm={sm} xs={xs}>
        <div className="form-group pref-sk-field">
            <CommonSkeleton box height={24} width="100%" stopAnimation={stopAnimation} />
        </div>
    </Col>
);

const DefaultSubPageBodySkeleton = () => (
    <Container fluid>
        <div className="page-content">
            <Container className="px0">
                <div className="box-design bd-top-border pref-subpage-skeleton-panel">
                    {Array.from({ length: 4 }, (_, i) => (
                        <div key={i} className="form-group pref-subpage-form-row">
                            <Row className="align-items-center">
                                <Col sm={4} className="text-right">
                                    <CommonSkeleton box height={13} width="55%" stopAnimation />
                                </Col>
                                <Col sm={7}>
                                    <span
                                        className="skeleton-shimmer d-block"
                                        style={{ height: 22, width: '100%' }}
                                        aria-hidden="true"
                                    />
                                </Col>
                            </Row>
                        </div>
                    ))}
                </div>
            </Container>
        </div>
    </Container>
);

const PrefMyProfileSkelBar = ({ className = '', stopAnimation = false }) => (
    <div
        className={`pref-my-profile-sk-bar ${className}${stopAnimation ? ' pref-my-profile-sk-bar--static' : ''
            }`.trim()}
        aria-hidden="true"
    />
);

const PrefMyProfileFieldSkeleton = ({ stopAnimation = false }) => (
    <div className="form-group pref-sk-field pref-sk-field--input-only">
        <PrefMyProfileSkelBar className="pref-my-profile-sk-input" stopAnimation={stopAnimation} />
    </div>
);

const PrefMyProfileFieldWithLinkSkeleton = ({ linkClass = 'pref-my-profile-sk-link', stopAnimation = false }) => (
    <div className="form-group pref-sk-field pref-sk-field--with-link">
        <PrefMyProfileSkelBar className="pref-my-profile-sk-input" stopAnimation={stopAnimation} />
        <PrefMyProfileSkelBar className={linkClass} stopAnimation={stopAnimation} />
    </div>
);

/** My profile form panel — plain CSS shimmer; mirrors MyProfile/index.jsx layout. */
export const MyProfileFormSkeleton = ({ showNoData = false }) => {
    const freeze = showNoData;

    return (
        <>
            <div
                className={`box-design rs-box rs-box-min-height pref-my-profile-skeleton-panel${showNoData ? ' pref-subpage-skeleton-panel--no-data' : ''
                    }`}
            >
                <div className="pref-sk-panel-body" aria-hidden={showNoData}>
                    <Row>
                        <Col md={3} sm={4} xs={12} className="accountsetup-image-upload pref-sk-avatar-col">
                            <PrefMyProfileSkelBar
                                className="pref-my-profile-sk-avatar pref-sk-avatar mx-auto"
                                stopAnimation={freeze}
                            />
                        </Col>
                        <Col md={9} sm={8} xs={12} className="box-left-border accountsetup-contact-info">
                            <Row>
                                <Col xs={12}>
                                    <PrefMyProfileSkelBar
                                        className="pref-my-profile-sk-section-title pref-sk-section-title"
                                        stopAnimation={freeze}
                                    />
                                    <Row>
                                        <Col sm={6} xs={12}>
                                            <div className="form-group pref-sk-title-first-row">
                                                <Row>
                                                    <Col xs={12}>
                                                        <PrefMyProfileSkelBar
                                                            className="pref-my-profile-sk-input"
                                                            stopAnimation={freeze}
                                                        />
                                                    </Col>
                                                </Row>
                                            </div>
                                        </Col>
                                        <Col sm={6} xs={12}>
                                            <PrefMyProfileFieldSkeleton stopAnimation={freeze} />
                                        </Col>
                                        <Col sm={6} xs={12}>
                                            <div className="form-group d-flex pref-sk-mobile-field">
                                                <Col className="pref-sk-mobile-input-col">
                                                    <PrefMyProfileSkelBar
                                                        className="pref-my-profile-sk-input"
                                                        stopAnimation={freeze}
                                                    />
                                                    <PrefMyProfileSkelBar
                                                        className="pref-my-profile-sk-link"
                                                        stopAnimation={freeze}
                                                    />
                                                </Col>
                                            </div>
                                        </Col>
                                        <Col sm={6} xs={12}>
                                            <PrefMyProfileFieldWithLinkSkeleton
                                                linkClass="pref-my-profile-sk-link pref-my-profile-sk-link--sm"
                                                stopAnimation={freeze}
                                            />
                                        </Col>
                                        <Col sm={6} xs={12}>
                                            <PrefMyProfileFieldSkeleton stopAnimation={freeze} />
                                        </Col>
                                        <Col sm={6} xs={12}>
                                            <PrefMyProfileFieldSkeleton stopAnimation={freeze} />
                                        </Col>
                                        <Col sm={6} xs={12}>
                                            <PrefMyProfileFieldSkeleton stopAnimation={freeze} />
                                        </Col>
                                        <Col sm={6} xs={12}>
                                            <PrefMyProfileFieldSkeleton stopAnimation={freeze} />
                                        </Col>
                                        <div className="form-group pref-sk-country-row">
                                            <Row>
                                                <Col sm={3} xs={12}>
                                                    <PrefMyProfileSkelBar
                                                        className="pref-my-profile-sk-input"
                                                        stopAnimation={freeze}
                                                    />
                                                </Col>
                                                <Col sm={3} xs={12}>
                                                    <PrefMyProfileSkelBar
                                                        className="pref-my-profile-sk-input"
                                                        stopAnimation={freeze}
                                                    />
                                                </Col>
                                                <Col sm={6} xs={12}>
                                                    <PrefMyProfileSkelBar
                                                        className="pref-my-profile-sk-input"
                                                        stopAnimation={freeze}
                                                    />
                                                </Col>
                                            </Row>
                                        </div>
                                    </Row>
                                    <PrefMyProfileSkelBar
                                        className="pref-my-profile-sk-section-title pref-sk-section-title pref-sk-section-title--second"
                                        stopAnimation={freeze}
                                    />
                                    <Row>
                                        <Col sm={4} xs={6}>
                                            <PrefMyProfileFieldSkeleton stopAnimation={freeze} />
                                        </Col>
                                        <Col sm={4} xs={6}>
                                            <PrefMyProfileFieldSkeleton stopAnimation={freeze} />
                                        </Col>
                                        <Col sm={4} xs={6}>
                                            <PrefMyProfileFieldSkeleton stopAnimation={freeze} />
                                        </Col>
                                        <Col sm={4} xs={6}>
                                            <PrefMyProfileFieldSkeleton stopAnimation={freeze} />
                                        </Col>
                                        <Col sm={8} xs={6}>
                                            <PrefMyProfileFieldSkeleton stopAnimation={freeze} />
                                        </Col>
                                       
                                    </Row>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </div>
                {showNoData ? <PrefSubPageNoDataOverlay /> : null}
            </div>
            <div className="buttons-holder pref-sk-buttons">
                <Row>
                    <Col className="d-flex justify-content-end gap-3">
                        <PrefMyProfileSkelBar className="pref-my-profile-sk-btn pref-my-profile-sk-btn--cancel" stopAnimation={freeze} />
                        <PrefMyProfileSkelBar className="pref-my-profile-sk-btn pref-my-profile-sk-btn--save" stopAnimation={freeze} />
                    </Col>
                </Row>
            </div>
        </>
    );
};

MyProfileFormSkeleton.propTypes = {
    showNoData: PropTypes.bool,
};

const MY_PROFILE_HEADER_TITLE_WIDTH = 140;

/** Body only — pairs with RSPageHeaderSkeleton in route / page loading shells. */
export const MyProfilePageContentSkeleton = ({ showNoData = false }) => (
    <Container fluid className='main-heading-wrapper'>
        <div className="page-content pc-my-profile d-grid">
            <Container style={{ padding: '0' }}>
                <MyProfileFormSkeleton showNoData={showNoData} />
            </Container>
        </div>
    </Container>
);

MyProfilePageContentSkeleton.propTypes = {
    showNoData: PropTypes.bool,
};

/** Full in-page shell — mirrors PreferencesSubPageRouteSkeleton for seamless handoff. */
export const MyProfileLoadingShell = ({ showNoData = false }) => (
    <>
        <RSPageHeaderSkeleton
            variant="tabber"
            className="pref-subpage-header-skeleton"
            titleWidth={MY_PROFILE_HEADER_TITLE_WIDTH}
            showBack
        />
        <MyProfilePageContentSkeleton showNoData={showNoData} />
    </>
);

MyProfileLoadingShell.propTypes = {
    showNoData: PropTypes.bool,
};

/** Full page-content wrapper for route / bootstrap skeleton. */
const MyProfileBodySkeleton = () => <MyProfilePageContentSkeleton />;

/** Centered no-data card over preferences form skeleton panels. */
const PrefSubPageNoDataOverlay = () => (
    <div className="pref-subpage-no-data-overlay" role="status" aria-live="polite">
        <NoDataAvailableRender className="nodata-skeleton-con" />
    </div>
);

const PrefCompanyInputBar = ({ stopAnimation = false }) => (
    <CommonSkeleton
        box
        height={32}
        width="100%"
        stopAnimation={stopAnimation}
        mainClass="pref-sk-input-bar"
    />
);

const PrefCompanyFieldSkeleton = ({ stopAnimation = false }) => (
    <div className="form-group pref-sk-field pref-sk-field--input-only">
        <PrefCompanyInputBar stopAnimation={stopAnimation} />
    </div>
);

const BusinessUnitRowSkeleton = ({ showAdd = false, stopAnimation = false }) => (
    <Row className="pref-sk-bu-row align-items-center gx-2 mt13">
        <Col md={3} sm={6}>
            <PrefCompanyInputBar stopAnimation={stopAnimation} />
        </Col>
        <Col md={3} sm={6}>
            <PrefCompanyInputBar stopAnimation={stopAnimation} />
        </Col>
        <Col md={2} sm={4}>
            <PrefCompanyInputBar stopAnimation={stopAnimation} />
        </Col>
        <Col md={3} sm={6}>
            <PrefCompanyInputBar stopAnimation={stopAnimation} />
        </Col>
        <Col md={1} sm={2} className="pref-sk-bu-actions d-flex justify-content-end gap-1">
            <CommonSkeleton circle width={28} height={28} stopAnimation={stopAnimation} />
            <CommonSkeleton circle width={28} height={28} stopAnimation={stopAnimation} />
        </Col>
    </Row>
);

/** Company / account settings — mirrors CompanyInfo two-column grid (sm=6) + business units. */
export const CompanyClientDetailsFormSkeleton = ({ showNoData = false }) => {
    const freeze = showNoData;

    return (
        <>
            <div
                className={`box-design rs-box py40 pref-account-settings-skeleton-panel${showNoData ? ' pref-subpage-skeleton-panel--no-data' : ''
                    }`}
            >
                <div className="pref-sk-panel-body" aria-hidden={showNoData}>
                    <Row>
                        <Col md={3} sm={4} xs={12} className="accountsetup-image-upload pref-sk-avatar-col">
                            <CommonSkeleton
                                circle
                                width={120}
                                height={120}
                                stopAnimation={freeze}
                                mainClass="pref-sk-avatar mx-auto"
                            />
                        </Col>
                        <Col md={9} sm={8} xs={12} className="box-left-border accountsetup-contact-info">
                            <Row className="pb10">
                                <Col sm={6} xs={12}>
                                    <PrefCompanyFieldSkeleton stopAnimation={freeze} />
                                </Col>
                                <Col sm={6} xs={12}>
                                    <div className="form-group pref-sk-field pref-sk-field--regions">
                                        <PrefCompanyInputBar stopAnimation={freeze} />
                                        <CommonSkeleton
                                            box
                                            height={14}
                                            width={220}
                                            stopAnimation={freeze}
                                            mainClass="pref-sk-region-check mt-2"
                                        />
                                    </div>
                                </Col>
                                <Col sm={6} xs={12}>
                                    <PrefCompanyFieldSkeleton stopAnimation={freeze} />
                                </Col>
                                <Col sm={6} xs={12}>
                                    <PrefCompanyFieldSkeleton stopAnimation={freeze} />
                                </Col>
                                <Col sm={6} xs={12}>
                                    <PrefCompanyFieldSkeleton stopAnimation={freeze} />
                                </Col>
                                <Col sm={6} xs={12}>
                                    <div className="form-group pref-sk-field">
                                        <Row>
                                            <Col sm={6} xs={12}>
                                                <PrefCompanyInputBar stopAnimation={freeze} />
                                            </Col>
                                            <Col sm={6} xs={12}>
                                                <PrefCompanyInputBar stopAnimation={freeze} />
                                            </Col>
                                        </Row>
                                    </div>
                                </Col>
                                <Col sm={6} xs={12}>
                                    <PrefCompanyFieldSkeleton stopAnimation={freeze} />
                                </Col>
                                <Col sm={6} xs={12}>
                                    <PrefCompanyFieldSkeleton stopAnimation={freeze} />
                                </Col>
                                <Col sm={6} xs={12}>
                                    <PrefCompanyFieldSkeleton stopAnimation={freeze} />
                                </Col>
                                <Col sm={6} xs={12}>
                                    <PrefCompanyFieldSkeleton stopAnimation={freeze} />
                                </Col>
                                <Col xs={12}>
                                    <div className="form-group m0">
                                        <Row>
                                            <Col sm={6} xs={12}>
                                                <PrefCompanyInputBar stopAnimation={freeze} />
                                            </Col>
                                            <Col sm={6} xs={12}>
                                                <PrefCompanyInputBar stopAnimation={freeze} />
                                            </Col>
                                        </Row>
                                    </div>
                                </Col>
                                <Col sm={6} xs={12}>
                                    <div className="form-group m0 position-relative top6 pref-sk-checkbox">
                                        <CommonSkeleton box height={18} width={120} stopAnimation={freeze} />
                                    </div>
                                </Col>
                                <Col sm={6} xs={12}>
                                    <div className="form-group m0 position-relative top6 pref-sk-checkbox">
                                        <CommonSkeleton box height={18} width={200} stopAnimation={freeze} />
                                    </div>
                                </Col>
                            </Row>
                            <CommonSkeleton
                                box
                                height={20}
                                width={140}
                                stopAnimation={freeze}
                                mainClass="pref-sk-section-title pref-sk-bu-heading"
                            />
                            <CommonSkeleton
                                box
                                height={36}
                                width="100%"
                                stopAnimation={freeze}
                                mainClass="pref-sk-bu-banner mb-3"
                            />
                            <BusinessUnitRowSkeleton showAdd stopAnimation={freeze} />
                            <BusinessUnitRowSkeleton stopAnimation={freeze} />
                            <BusinessUnitRowSkeleton stopAnimation={freeze} />
                        </Col>
                    </Row>
                </div>
                {showNoData ? <PrefSubPageNoDataOverlay /> : null}
            </div>
            <div className="buttons-holder pref-sk-buttons">
                <Row>
                    <Col className="d-flex justify-content-end gap-3">
                        <CommonSkeleton box width={72} height={36} stopAnimation={freeze} />
                        <CommonSkeleton box width={88} height={36} stopAnimation={freeze} />
                    </Col>
                </Row>
            </div>
        </>
    );
};

CompanyClientDetailsFormSkeleton.propTypes = {
    showNoData: PropTypes.bool,
};

/** @deprecated use CompanyClientDetailsFormSkeleton */
export const AccountSettingsFormSkeleton = CompanyClientDetailsFormSkeleton;

const TagPanelSkeleton = ({ titleWidth = 120, stopAnimation = false }) => (
    <div className="pref-sk-tag-panel box-design rs-box h-100" aria-hidden="true">
        <CommonSkeleton box height={16} width={titleWidth} stopAnimation={stopAnimation} mainClass="pref-sk-tag-panel-title mb-3" />
        <div className="pref-sk-tag-pills d-flex flex-wrap gap-2 mb-3">
            {Array.from({ length: 6 }, (_, i) => (
                <CommonSkeleton key={i} box width={88} height={24} stopAnimation={stopAnimation} mainClass="pref-sk-tag-pill" />
            ))}
        </div>
        <CommonSkeleton box height={32} width="100%" stopAnimation={stopAnimation} />
    </div>
);

const PrefAssignRoleSkelBar = ({ className = '' }) => (
    <div className={`pref-sk-assign-bar ${className}`.trim()} aria-hidden="true" />
);

const AssignRoleEntityRowSkeleton = () => (
    <Row className="pref-sk-assign-entity-row p10 mx0 align-items-center">
        <Col md={4} className="pl15">
            <PrefAssignRoleSkelBar className="pref-sk-assign-bar--bu-label" />
        </Col>
        <Col md={6}>
            <PrefAssignRoleSkelBar className="pref-sk-assign-bar--role-field" />
        </Col>
        <Col md={2} className="d-flex justify-content-end p10">
            <PrefAssignRoleSkelBar className="pref-sk-assign-bar--remove-icon" />
        </Col>
    </Row>
);

const AssignRoleEntityCardSkeleton = ({ rowCount = 2 }) => (
    <div className="pref-sk-assign-entity-card mb15">
        <div className="pref-sk-assign-entity-header d-flex align-items-center justify-content-between">
            <PrefAssignRoleSkelBar className="pref-sk-assign-bar--card-name" />
            <PrefAssignRoleSkelBar className="pref-sk-assign-bar--card-meta" />
        </div>
        <div className="pref-sk-assign-entity-body">
            {Array.from({ length: rowCount }, (_, index) => (
                <AssignRoleEntityRowSkeleton key={index} />
            ))}
        </div>
    </div>
);

const COMPANY_ASSIGN_ROLE_PROGRESS_STEP_COUNT = 3;

/** Page header + wizard steps while assign-role APIs load inline (not route bootstrap). */
export const CompanyAssignRoleWizardChromeSkeleton = ({
    showHeader = true,
    showSteps = true,
    className = '',
}) => (
    <div className={className} aria-hidden="true">
        {showHeader ? (
            <RSPageHeaderSkeleton
                variant="tabber"
                titleWidth={SUBPAGE_TITLE_WIDTH[PREFERENCES_SUBPAGE_VARIANT.COMPANY_ASSIGN_ROLE]}
                showBack
            />
        ) : null}
        {showSteps ? <PlanProgressStepsSkeleton stepCount={COMPANY_ASSIGN_ROLE_PROGRESS_STEP_COUNT} /> : null}
    </div>
);

/** Assign role step — left user list + right assignment panel. */
export const CompanyAssignRoleSkeleton = () => (
    <>
        <div className="box-design rs-box pref-company-assign-role-skeleton" aria-hidden="true">
            <Row className="mb10 res-gx-0 align-items-center">
                <Col md={3} className="pr0">
                    <div className="d-flex justify-content-between align-items-center position-relative gap-2">
                        <PrefAssignRoleSkelBar className="pref-sk-assign-bar--toolbar-dropdown" />
                        <PrefAssignRoleSkelBar className="pref-sk-assign-bar--toolbar-icon" />
                    </div>
                </Col>
                <Col md={1} />
                <Col md={7} className="d-flex align-items-center">
                    <PrefAssignRoleSkelBar className="pref-sk-assign-bar--toolbar-select" />
                </Col>
                <Col className="d-flex justify-content-end">
                    <PrefAssignRoleSkelBar className="pref-sk-assign-bar--toolbar-icon" />
                </Col>
            </Row>

            <Row className="res-gx-0">
                <Col
                    md={3}
                    className="box-design pref-sk-assign-user-list css-scrollbar p0 position-relative no-box-shadow"
                >
                    <ul className="pref-sk-assign-user-list-group">
                        {Array.from({ length: 10 }, (_, index) => (
                            <li
                                key={index}
                                className={`pref-sk-assign-user-card ${
                                    index === 1 ? 'pref-sk-assign-user-card--active' : ''
                                }`}
                            >
                                <div className="pref-sk-assign-user-card-info d-flex flex-column gap-2 py-1">
                                    <PrefAssignRoleSkelBar
                                        className={
                                            index % 2 === 0
                                                ? 'pref-sk-assign-bar--user-name'
                                                : 'pref-sk-assign-bar--user-name-short'
                                        }
                                    />
                                    <PrefAssignRoleSkelBar
                                        className={
                                            index % 3 === 0
                                                ? 'pref-sk-assign-bar--user-status'
                                                : 'pref-sk-assign-bar--user-status-short'
                                        }
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                </Col>

                <Col md={1} className="d-flex justify-content-center align-self-xl-center" />

                <Col md={8}>
                    <div className="box-design pref-sk-assign-entity-panel css-scrollbar p0 no-box-shadow position-relative">
                        <div className="pref-sk-assign-entity-cards">
                            <AssignRoleEntityCardSkeleton rowCount={2} />
                            <AssignRoleEntityCardSkeleton rowCount={2} />
                            <AssignRoleEntityCardSkeleton rowCount={2} />
                        </div>
                    </div>
                </Col>
            </Row>

            <PrefAssignRoleSkelBar className="pref-sk-assign-bar--hint mt10" />
        </div>
        <div className="buttons-holder pref-sk-assign-role-actions d-flex justify-content-end">
            <PrefAssignRoleSkelBar className="pref-sk-assign-bar--action-btn" />
            <PrefAssignRoleSkelBar className="pref-sk-assign-bar--action-btn ml15" />
        </div>
    </>
);

const PrefCompanyLocalizationSkelBar = ({ className = '', stopAnimation = false }) => (
    <div
        className={`pref-company-localization-sk-bar ${className}${
            stopAnimation ? ' pref-company-localization-sk-bar--static' : ''
        }`.trim()}
        aria-hidden="true"
    />
);

const LocalizationDropdownFieldSkeleton = ({ stopAnimation = false }) => (
    <div className="form-group">
        <PrefCompanyLocalizationSkelBar
            className="pref-company-localization-sk-bar--dropdown"
            stopAnimation={stopAnimation}
        />
    </div>
);

const LocalizationRegionFieldSkeleton = ({ stopAnimation = false }) => (
    <div className="form-group mt4">
        <div className="pref-company-localization-sk-region-tags">
            {Array.from({ length: 14 }, (_, index) => (
                <PrefCompanyLocalizationSkelBar
                    key={index}
                    className="pref-company-localization-sk-bar--region-pill"
                    stopAnimation={stopAnimation}
                />
            ))}
        </div>
    </div>
);

const LocalizationTagPanelSkeleton = ({ stopAnimation = false, pillCount = 8, variant = 'default' }) => (
    <div className={`pref-company-localization-sk-tag-panel pref-company-localization-sk-tag-panel--${variant}`}>
        <div className="pref-company-localization-sk-tag-panel-header">
            <PrefCompanyLocalizationSkelBar
                className="pref-company-localization-sk-bar--tag-panel-title"
                stopAnimation={stopAnimation}
            />
        </div>
        <div className="pref-company-localization-sk-tag-pills">
            {Array.from({ length: pillCount }, (_, index) => (
                <PrefCompanyLocalizationSkelBar
                    key={index}
                    className="pref-company-localization-sk-bar--tag-pill"
                    stopAnimation={stopAnimation}
                />
            ))}
        </div>
        <div className="pref-company-localization-sk-tag-panel-footer">
            <PrefCompanyLocalizationSkelBar
                className="pref-company-localization-sk-bar--tag-input"
                stopAnimation={stopAnimation}
            />
        </div>
    </div>
);

const LocalizationConversionPanelSkeleton = ({ stopAnimation = false }) => (
    <div className="pref-company-localization-sk-tag-panel pref-company-localization-sk-tag-panel--conversion">
        <div className="pref-company-localization-sk-tag-panel-header">
            <PrefCompanyLocalizationSkelBar
                className="pref-company-localization-sk-bar--tag-panel-title"
                stopAnimation={stopAnimation}
            />
        </div>
        <div className="pref-company-localization-sk-conversion-body">
            <div className="pref-company-localization-sk-conversion-block">
                <PrefCompanyLocalizationSkelBar
                    className="pref-company-localization-sk-bar--conversion-section-title"
                    stopAnimation={stopAnimation}
                />
                <div className="pref-company-localization-sk-tag-pills pref-company-localization-sk-tag-pills--conversion">
                    {Array.from({ length: 4 }, (_, index) => (
                        <PrefCompanyLocalizationSkelBar
                            key={index}
                            className="pref-company-localization-sk-bar--tag-pill"
                            stopAnimation={stopAnimation}
                        />
                    ))}
                </div>
            </div>
            <div className="pref-company-localization-sk-conversion-block">
                <PrefCompanyLocalizationSkelBar
                    className="pref-company-localization-sk-bar--conversion-section-title"
                    stopAnimation={stopAnimation}
                />
                <div className="pref-company-localization-sk-tag-pills pref-company-localization-sk-tag-pills--conversion">
                    {Array.from({ length: 6 }, (_, index) => (
                        <PrefCompanyLocalizationSkelBar
                            key={index}
                            className="pref-company-localization-sk-bar--tag-pill"
                            stopAnimation={stopAnimation}
                        />
                    ))}
                </div>
            </div>
        </div>
        <div className="pref-company-localization-sk-tag-panel-footer">
            <PrefCompanyLocalizationSkelBar
                className="pref-company-localization-sk-bar--tag-input"
                stopAnimation={stopAnimation}
            />
        </div>
    </div>
);

const LocalizationInputFieldSkeleton = ({ stopAnimation = false }) => (
    <div className="form-group">
        <PrefCompanyLocalizationSkelBar
            className="pref-company-localization-sk-bar--input"
            stopAnimation={stopAnimation}
        />
        <PrefCompanyLocalizationSkelBar
            className="pref-company-localization-sk-bar--helper"
            stopAnimation={stopAnimation}
        />
    </div>
);

const LocalizationJobServiceRowSkeleton = ({ stopAnimation = false }) => (
    <div className="form-group">
        <Row className="align-items-center">
            <Col sm={5} xs={6} className="text-left">
                <PrefCompanyLocalizationSkelBar
                    className="pref-company-localization-sk-bar--field-label-left"
                    stopAnimation={stopAnimation}
                />
            </Col>
            <Col sm={7} xs={3}>
                <PrefCompanyLocalizationSkelBar
                    className="pref-company-localization-sk-bar--job-input"
                    stopAnimation={stopAnimation}
                />
            </Col>
        </Row>
    </div>
);

const LocalizationCommRefSkeleton = ({ stopAnimation = false }) => (
    <div className="form-group textbox-min-h">
        <div className="pref-company-localization-sk-tag-panel pref-company-localization-sk-tag-panel--comm-ref">
            <div className="pref-company-localization-sk-tag-panel-header">
                <PrefCompanyLocalizationSkelBar
                    className="pref-company-localization-sk-bar--tag-panel-title"
                    stopAnimation={stopAnimation}
                />
                <PrefCompanyLocalizationSkelBar
                    className="pref-company-localization-sk-bar--toggle"
                    stopAnimation={stopAnimation}
                />
            </div>
            <div className="pref-company-localization-sk-tag-pills">
                {Array.from({ length: 3 }, (_, index) => (
                    <PrefCompanyLocalizationSkelBar
                        key={index}
                        className="pref-company-localization-sk-bar--tag-pill"
                        stopAnimation={stopAnimation}
                    />
                ))}
            </div>
            <div className="pref-company-localization-sk-tag-panel-footer">
                <PrefCompanyLocalizationSkelBar
                    className="pref-company-localization-sk-bar--tag-input"
                    stopAnimation={stopAnimation}
                />
            </div>
        </div>
    </div>
);

const LocalizationRadioRowSkeleton = ({ stopAnimation = false }) => (
    <Row className="align-items-center">
        <Col sm={5} xs={6} className="text-left">
            <PrefCompanyLocalizationSkelBar
                className="pref-company-localization-sk-bar--field-label-left"
                stopAnimation={stopAnimation}
            />
        </Col>
        <Col sm={7} xs={6} className="pl0">
            <div className="pref-company-localization-sk-radios">
                <PrefCompanyLocalizationSkelBar
                    className="pref-company-localization-sk-bar--radio"
                    stopAnimation={stopAnimation}
                />
                <PrefCompanyLocalizationSkelBar
                    className="pref-company-localization-sk-bar--radio"
                    stopAnimation={stopAnimation}
                />
            </div>
        </Col>
    </Row>
);

/** Localization settings step — mirrors localizationSettings.jsx layout. */
export const CompanyLocalizationSkeleton = ({ showNoData = false }) => {
    const freeze = showNoData;

    return (
        <>
            <div
                className={`box-design rs-box accountsetup-contact-info py30 pref-company-localization-skeleton${
                    showNoData ? ' pref-subpage-skeleton-panel--no-data' : ''
                }`}
                aria-hidden={!showNoData}
            >
                <Row>
                    <Col sm={12}>
                        <PrefCompanyLocalizationSkelBar
                            className="pref-company-localization-sk-bar--page-title"
                            stopAnimation={freeze}
                        />
                    </Col>
                </Row>
                <Row className="d-flex align-items-end">
                    <Col sm={6} xs={6}>
                        <LocalizationRegionFieldSkeleton stopAnimation={freeze} />
                    </Col>
                    <Col sm={6} xs={6}>
                        <LocalizationDropdownFieldSkeleton stopAnimation={freeze} />
                    </Col>
                    <Col sm={6} xs={6}>
                        <LocalizationDropdownFieldSkeleton stopAnimation={freeze} />
                    </Col>
                    <Col sm={6} xs={6}>
                        <LocalizationDropdownFieldSkeleton stopAnimation={freeze} />
                    </Col>
                    <Col sm={6} xs={6}>
                        <LocalizationDropdownFieldSkeleton stopAnimation={freeze} />
                    </Col>
                    <Col sm={6} xs={6}>
                        <LocalizationDropdownFieldSkeleton stopAnimation={freeze} />
                    </Col>
                </Row>
                <Row className="pref-company-localization-sk-tag-row align-items-start">
                    <Col sm={6} xs={6}>
                        <div className="form-group pref-company-localization-sk-tag-field">
                            <LocalizationTagPanelSkeleton stopAnimation={freeze} pillCount={10} variant="communication" />
                        </div>
                    </Col>
                    <Col sm={6} xs={6}>
                        <div className="form-group pref-company-localization-sk-tag-field">
                            <LocalizationConversionPanelSkeleton stopAnimation={freeze} />
                        </div>
                    </Col>
                </Row>
                <Row className="pref-company-localization-sk-tag-row align-items-start">
                    <Col sm={6} xs={6}>
                        <div className="form-group pref-company-localization-sk-tag-field">
                            <LocalizationTagPanelSkeleton stopAnimation={freeze} pillCount={16} variant="product" />
                        </div>
                    </Col>
                    <Col sm={6} xs={6}>
                        <div className="form-group pref-company-localization-sk-tag-field">
                            <LocalizationTagPanelSkeleton stopAnimation={freeze} pillCount={4} variant="offer" />
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col sm={6} xs={6}>
                        <LocalizationInputFieldSkeleton stopAnimation={freeze} />
                    </Col>
                    <Col sm={6} xs={6}>
                        <LocalizationInputFieldSkeleton stopAnimation={freeze} />
                    </Col>
                </Row>
                <Row>
                    <Col sm={6} xs={6}>
                        <LocalizationCommRefSkeleton stopAnimation={freeze} />
                    </Col>
                    <Col sm={6} xs={6}>
                        <PrefCompanyLocalizationSkelBar
                            className="pref-company-localization-sk-bar--section-title pref-company-localization-sk-bar--section-title-job mt15"
                            stopAnimation={freeze}
                        />
                        <LocalizationJobServiceRowSkeleton stopAnimation={freeze} />
                        <LocalizationJobServiceRowSkeleton stopAnimation={freeze} />
                        <LocalizationJobServiceRowSkeleton stopAnimation={freeze} />
                    </Col>
                </Row>
                <Row>
                    <Col sm={12}>
                        <PrefCompanyLocalizationSkelBar
                            className="pref-company-localization-sk-bar--section-title pref-company-localization-sk-bar--section-title-analytics"
                            stopAnimation={freeze}
                        />
                    </Col>
                    <div className="form-group w-100">
                        <Row>
                            <Col sm={4} xs={4}>
                                <LocalizationDropdownFieldSkeleton stopAnimation={freeze} />
                            </Col>
                            <Col sm={4} xs={4}>
                                <LocalizationDropdownFieldSkeleton stopAnimation={freeze} />
                            </Col>
                            <Col sm={4} xs={4}>
                                <LocalizationDropdownFieldSkeleton stopAnimation={freeze} />
                            </Col>
                        </Row>
                    </div>
                </Row>
                <Row>
                    <Col sm={7} xs={6}>
                        <PrefCompanyLocalizationSkelBar
                            className="pref-company-localization-sk-bar--section-title pref-company-localization-sk-bar--section-title-multi"
                            stopAnimation={freeze}
                        />
                        <div className="form-group">
                            <LocalizationRadioRowSkeleton stopAnimation={freeze} />
                        </div>
                        <div className="form-group mb0">
                            <Row className="align-items-center">
                                <Col sm={5} xs={6} className="text-left">
                                    <PrefCompanyLocalizationSkelBar
                                        className="pref-company-localization-sk-bar--field-label-left"
                                        stopAnimation={freeze}
                                    />
                                </Col>
                                <Col sm={5} xs={6} className="pl0 pr3">
                                    <PrefCompanyLocalizationSkelBar
                                        className="pref-company-localization-sk-bar--dropdown"
                                        stopAnimation={freeze}
                                    />
                                </Col>
                            </Row>
                        </div>
                    </Col>
                    <Col sm={5} xs={6}>
                        <PrefCompanyLocalizationSkelBar
                            className="pref-company-localization-sk-bar--section-title pref-company-localization-sk-bar--section-title-job"
                            stopAnimation={freeze}
                        />
                        <LocalizationJobServiceRowSkeleton stopAnimation={freeze} />
                        <LocalizationJobServiceRowSkeleton stopAnimation={freeze} />
                        <LocalizationJobServiceRowSkeleton stopAnimation={freeze} />
                    </Col>
                </Row>
                {showNoData ? <PrefSubPageNoDataOverlay /> : null}
            </div>
            <div className="buttons-holder pref-company-localization-sk-actions">
                <PrefCompanyLocalizationSkelBar
                    className="pref-company-localization-sk-bar--action-btn pref-company-localization-sk-bar--action-btn-back"
                    stopAnimation={freeze}
                />
                <PrefCompanyLocalizationSkelBar
                    className="pref-company-localization-sk-bar--action-btn pref-company-localization-sk-bar--action-btn-save"
                    stopAnimation={freeze}
                />
            </div>
        </>
    );
};

CompanyLocalizationSkeleton.propTypes = {
    showNoData: PropTypes.bool,
};

/** Matches Edit company account (account-settings) — logo, company form, business units. */
const AccountSettingsBodySkeleton = () => (
    <Container fluid>
        <div className="page-content pc-account-settings">
            <Container className="px0">
                <AccountSettingsFormSkeleton />
            </Container>
        </div>
    </Container>
);

const PrefUsersAddEditSkelBar = ({ className = '', stopAnimation = false }) => (
    <div
        className={`pref-users-add-edit-sk-bar ${className}${stopAnimation ? ' pref-users-add-edit-sk-bar--static' : ''
            }`.trim()}
        aria-hidden="true"
    />
);

const PrefCheckboxRowSkeleton = ({ stopAnimation = false }) => (
    <div className="pref-sk-checkbox-row">
        <PrefUsersAddEditSkelBar className="pref-users-add-edit-sk-checkbox" stopAnimation={stopAnimation} />
        <PrefUsersAddEditSkelBar className="pref-users-add-edit-sk-checkbox-label" stopAnimation={stopAnimation} />
    </div>
);

const PrefUserInputBar = ({ stopAnimation = false }) => (
    <PrefUsersAddEditSkelBar className="pref-users-add-edit-sk-input pref-sk-input-bar" stopAnimation={stopAnimation} />
);

/** Add / Edit user form — mirrors AddUser/index.jsx (md=8 field grid + md=4 welcome/checkboxes). */
export const UsersAddEditFormSkeleton = ({ showNoData = false }) => {
    const freeze = showNoData;

    return (
        <>
            <div
                className={`box-design rs-box pref-users-add-edit-skeleton${showNoData ? ' pref-subpage-skeleton-panel--no-data pref-users-add-edit-skeleton--no-data' : ''
                    }`}
                aria-hidden={!showNoData}
            >
                <div className="pref-sk-panel-body">
                    <div className="flex-row mb21 mt0 top-sub-heading pref-sk-users-add-toolbar">
                        <div className="fr flex-right tsh-icons">
                            <PrefUsersAddEditSkelBar
                                className="pref-users-add-edit-sk-toolbar-link"
                                stopAnimation={freeze}
                            />
                        </div>
                    </div>
                    <Row>
                        <Col md={8} sm={6}>
                            <Row>
                                <Col sm={6} xs={12}>
                                    <div className="form-group pref-sk-field--input-only">
                                        <PrefUserInputBar stopAnimation={freeze} />
                                    </div>
                                </Col>
                                <Col sm={6} xs={12}>
                                    <div className="form-group pref-sk-field--input-only">
                                        <PrefUserInputBar stopAnimation={freeze} />
                                    </div>
                                </Col>
                                <Col sm={6} xs={12}>
                                    <div className="form-group d-flex pref-sk-mobile-field">
                                        <Col sm={2} xs={12} className="">
                                            <PrefUserInputBar stopAnimation={freeze} />
                                        </Col>
                                        <Col>
                                            <PrefUserInputBar stopAnimation={freeze} />
                                        </Col>
                                    </div>
                                </Col>
                                <Col sm={6} xs={12}>
                                    <div className="form-group pref-sk-field--input-only">
                                        <PrefUserInputBar stopAnimation={freeze} />
                                    </div>
                                </Col>
                                <Col sm={6} xs={12}>
                                    <div className="form-group pref-sk-field--input-only mb0">
                                        <PrefUserInputBar stopAnimation={freeze} />
                                    </div>
                                </Col>
                                <Col sm={6} xs={12}>
                                    <div className="form-group pref-sk-field--input-only pref-sk-password-field mb0">
                                        <PrefUserInputBar stopAnimation={freeze} />
                                        <PrefUsersAddEditSkelBar
                                            className="pref-users-add-edit-sk-password-hint pref-sk-password-hint"
                                            stopAnimation={freeze}
                                        />
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                        <Col md={4} sm={6}>
                            <Row>
                                <Col sm={12}>
                                    <div className="form-group pref-sk-field--welcome mb10">
                                        <PrefUsersAddEditSkelBar
                                            className="pref-users-add-edit-sk-welcome"
                                            stopAnimation={freeze}
                                        />
                                    </div>
                                </Col>
                                <Col sm={12}>
                                    <PrefCheckboxRowSkeleton stopAnimation={freeze} />
                                    <PrefCheckboxRowSkeleton stopAnimation={freeze} />
                                    <PrefCheckboxRowSkeleton stopAnimation={freeze} />
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </div>
                {showNoData ? <PrefSubPageNoDataOverlay /> : null}
            </div>
            <div className="buttons-holder pref-sk-users-add-actions pref-sk-buttons" aria-hidden="true">
                <Row>
                    <Col className="d-flex justify-content-end gap-3">
                        <PrefUsersAddEditSkelBar className="pref-users-add-edit-sk-btn" stopAnimation={freeze} />
                        <PrefUsersAddEditSkelBar className="pref-users-add-edit-sk-btn" stopAnimation={freeze} />
                    </Col>
                </Row>
            </div>
        </>
    );
};

UsersAddEditFormSkeleton.propTypes = {
    showNoData: PropTypes.bool,
};

const CreateOfferLabelFieldRow = ({ dual = false }) => (
    <div className="form-group">
        <Row>
            <Col sm={3} className="text-right">
                <CommonSkeleton box height={14} width="78%" stopAnimation mainClass="ms-auto d-block" />
            </Col>
            <Col sm={7}>
                {dual ? (
                    <Row>
                        <Col sm={6}>
                            <CommonSkeleton box height={32} width="100%" stopAnimation />
                        </Col>
                        <Col sm={6}>
                            <CommonSkeleton box height={32} width="100%" stopAnimation />
                        </Col>
                    </Row>
                ) : (
                    <CommonSkeleton box height={32} width="100%" stopAnimation />
                )}
            </Col>
        </Row>
    </div>
);

/** Brand / shop horizontal rows: label Col sm=4, fields Col sm=7. */
const OfferEntityFormRowSkeleton = ({ variant = 'single' }) => (
    <div className="form-group">
        <Row>
            <Col sm={4} className="text-right">
                <CommonSkeleton box height={14} width="82%" stopAnimation mainClass="ms-auto d-block" />
            </Col>
            <Col sm={7}>
                {variant === 'dual' && (
                    <Row>
                        <Col sm={6}>
                            <CommonSkeleton box height={32} width="100%" stopAnimation />
                        </Col>
                        <Col sm={6}>
                            <CommonSkeleton box height={32} width="100%" stopAnimation />
                        </Col>
                    </Row>
                )}
                {variant === 'triple' && (
                    <Row>
                        <Col sm={4}>
                            <CommonSkeleton box height={32} width="100%" stopAnimation />
                        </Col>
                        <Col sm={4}>
                            <CommonSkeleton box height={32} width="100%" stopAnimation />
                        </Col>
                        <Col sm={4}>
                            <CommonSkeleton box height={32} width="100%" stopAnimation />
                        </Col>
                    </Row>
                )}
                {variant === 'browse' && (
                    <Row className="align-items-center">
                        <Col sm={10}>
                            <CommonSkeleton box height={32} width="100%" stopAnimation />
                        </Col>
                        <Col sm={2}>
                            <CommonSkeleton box height={36} width="100%" stopAnimation />
                        </Col>
                    </Row>
                )}
                {variant === 'textarea' && <CommonSkeleton box height={120} width="100%" stopAnimation />}
                {variant === 'single' && <CommonSkeleton box height={32} width="100%" stopAnimation />}
            </Col>
        </Row>
    </div>
);

/** Create / edit brand — matches CreateBrand form card. */
export const CreateBrandFormSkeleton = () => (
    <>
        <div className="box-design rs-box py40 pref-create-brand-skeleton">
            <OfferEntityFormRowSkeleton variant="dual" />
            <OfferEntityFormRowSkeleton variant="browse" />
            <OfferEntityFormRowSkeleton variant="textarea" />
            <OfferEntityFormRowSkeleton variant="triple" />
            <OfferEntityFormRowSkeleton variant="triple" />
            <OfferEntityFormRowSkeleton variant="single" />
            <OfferEntityFormRowSkeleton variant="dual" />
            <OfferEntityFormRowSkeleton variant="triple" />
        </div>
        <div className="buttons-holder pref-sk-create-brand-actions">
            <CommonSkeleton box width={80} height={36} stopAnimation />
            <CommonSkeleton box width={72} height={36} stopAnimation />
        </div>
    </>
);

/** Manage categories modal — tag panel + notes + actions. */
export const ManageCategoriesSkeleton = ({ hasOfferTypes = false }) => (
    <Row>
        <Col sm={hasOfferTypes ? 6 : 12} xs={hasOfferTypes ? 6 : 12}>
            <CommonSkeleton box height={16} width={160} stopAnimation mainClass="mb-3" />
            <div className="pref-manage-categories-tags-panel" aria-hidden="true">
                <div className="d-flex flex-wrap gap-2 mb-3">
                    {Array.from({ length: 10 }, (_, index) => (
                        <CommonSkeleton
                            key={index}
                            box
                            height={28}
                            width={index % 3 === 0 ? 88 : index % 3 === 1 ? 104 : 72}
                            stopAnimation
                            mainClass="pref-sk-category-tag-pill"
                        />
                    ))}
                </div>
                <CommonSkeleton box height={32} width="100%" stopAnimation />
            </div>
            <CommonSkeleton box height={12} width="92%" stopAnimation mainClass="mt-2" />
            <CommonSkeleton box height={12} width="88%" stopAnimation mainClass="mt-1" />
            <div className="d-flex justify-content-end gap-2 marginT20">
                <CommonSkeleton box width={80} height={36} stopAnimation />
                <CommonSkeleton box width={72} height={36} stopAnimation />
            </div>
        </Col>
        {hasOfferTypes && (
            <Col sm={6} xs={6}>
                <CommonSkeleton box height={16} width={120} stopAnimation mainClass="mb-3" />
                <div className="pref-manage-categories-tags-panel pref-manage-categories-offer-types" aria-hidden="true">
                    <div className="d-flex flex-wrap gap-2 mb-2">
                        {Array.from({ length: 6 }, (_, index) => (
                            <CommonSkeleton
                                key={index}
                                box
                                height={28}
                                width={96}
                                stopAnimation
                                mainClass="pref-sk-category-tag-pill"
                            />
                        ))}
                    </div>
                    <CommonSkeleton box height={32} width="100%" stopAnimation />
                </div>
                <CommonSkeleton box height={12} width="70%" stopAnimation mainClass="mt-2" />
            </Col>
        )}
    </Row>
);

ManageCategoriesSkeleton.propTypes = {
    hasOfferTypes: PropTypes.bool,
};

/** Template gallery landing — builder option cards (7 tiles). */
export const TemplateGallerySkeleton = () => (
    <Row>
        {Array.from({ length: 7 }, (_, index) => (
            <Col sm={3} key={index} className="pref-tg-card-col">
                <div className="rs-box-grid pref-tg-card-skeleton">
                    <div className="box-design pref-tg-card-inner d-flex flex-column align-items-center justify-content-center py40">
                        <CommonSkeleton circle width={48} height={48} stopAnimation />
                        <CommonSkeleton box height={18} width={index % 2 === 0 ? 72 : 96} stopAnimation mainClass="mt-3" />
                    </div>
                </div>
            </Col>
        ))}
    </Row>
);

const TemplateGalleryTabbedToolbarSkeleton = () => (
    <div className="flex-row justify-content-end my23 py10 top-sub-heading" aria-hidden="true">
        <ul className="rs-list-group-horizontal">
            <li>
                <CommonSkeleton box height={32} width={210} stopAnimation />
            </li>
            <li className="ml15">
                <CommonSkeleton box height={32} width={180} stopAnimation />
            </li>
            <li className="ml15">
                <CommonSkeleton circle width={32} height={32} stopAnimation />
            </li>
            <li className="ml15">
                <CommonSkeleton circle width={32} height={32} stopAnimation />
            </li>
        </ul>
    </div>
);

/** Inner template galleries — tabs + toolbar + 4 template cards (email/webpush/mobile). */
export const TemplateGalleryInnerTabbedSkeleton = () => (
    <div className="pref-tg-inner-tabbed-skeleton">
        <TabBarViewSkeleton
            tabCount={3}
            colClass="col-md-4"
            scopeClass="pref-tg-tabs-skeleton"
            tabsRowClass="rs-tabs row rst-left-space mb0 mini w-100 m-0 "
            omitColClass={false}
            resolvedContainerClass={'px0'}
        />
        <TemplateGalleryTabbedToolbarSkeleton />
        <Row className="mt15 mb15">
            {Array.from({ length: 4 }, (_, idx) => (
                <SkeletonGalleryCard
                    key={`loading-skeleton-${idx}`}
                    isLoading
                    col={3}
                    hideBottomAccent
                    cardPadding={10}
                />
            ))}
        </Row>
        <div className="d-flex justify-content-center pref-sk-pager" aria-hidden="true">
            <CommonSkeleton box height={28} width={220} stopAnimation />
        </div>
    </div>
);

/** Landing page template gallery — tabs + toolbar + 4 template cards. */
export const TemplateGalleryLandingInnerSkeleton = () => (
    <>
        <TabBarViewSkeleton
            tabCount={3}
            colClass="col-md-4"
            scopeClass="pref-tg-tabs-skeleton"
            tabsRowClass="rs-tabs row rst-left-space mb0 mini w-100 m-0"
            omitColClass={false}
        />
        <TemplateGalleryTabbedToolbarSkeleton />
        <Row className="mt15 mb15">
            {Array.from({ length: 4 }, (_, idx) => (
                <SkeletonGalleryCard
                    key={`loading-skeleton-${idx}`}
                    isLoading
                    col={3}
                    hideBottomAccent
                    cardPadding={10}
                />
            ))}
        </Row>
        <div className="d-flex justify-content-center pref-sk-pager" aria-hidden="true">
            <CommonSkeleton box height={28} width={220} stopAnimation />
        </div>
    </>
);

/** CSV download modal — form rows. */
export const FormGeneratorCsvModalSkeleton = () => (
    <>
        {Array.from({ length: 5 }, (_, i) => (
            <Row key={`fg-csv-skel-${i}`} className="form-group">
                <Col sm={{ offset: 1, span: 3 }}>
                    <CommonSkeleton box height={14} width={120} stopAnimation />
                </Col>
                <Col sm={7}>
                    <CommonSkeleton box height={36} width="100%" stopAnimation />
                </Col>
            </Row>
        ))}
        <Row className="form-group">
            <Col sm={{ offset: 4, span: 7 }}>
                <CommonSkeleton box height={80} width="100%" stopAnimation />
            </Col>
        </Row>
    </>
);

/** RM / notifier modal — Status, form fields, tags, notifiers (matches RMModal layout). */
export const FormGeneratorRmModalSkeleton = () => (
    <>
        <Row className="form-group">
            <Col sm={{ offset: 1, span: 3 }}>
                <CommonSkeleton box height={14} width={80} stopAnimation />
            </Col>
            <Col sm={7}>
                <CommonSkeleton box height={28} width={56} stopAnimation />
            </Col>
        </Row>
        <Row className="form-group">
            <Col sm={{ offset: 1, span: 3 }}>
                <CommonSkeleton box height={14} width={100} stopAnimation />
            </Col>
            <Col sm={7}>
                <CommonSkeleton box height={36} width="100%" stopAnimation />
            </Col>
        </Row>
        <Row className="form-group">
            <Col sm={{ offset: 4, span: 7 }}>
                <CommonSkeleton box height={96} width="100%" stopAnimation />
            </Col>
        </Row>
        <Row className="form-group">
            <Col sm={{ offset: 1, span: 3 }}>
                <CommonSkeleton box height={14} width={90} stopAnimation />
            </Col>
            <Col sm={7}>
                <CommonSkeleton box height={36} width="100%" stopAnimation />
            </Col>
        </Row>
    </>
);

const FormGeneratorListToolbarSkeleton = () => (
    <div className="flex-row justify-content-end mt0 top-sub-heading pref-sk-form-generator-toolbar" aria-hidden="true">
        <ul className="rs-list-group-horizontal">
            <li>
                <CommonSkeleton box height={32} width={210} stopAnimation />
            </li>
            <li className="ml15">
                <CommonSkeleton box height={32} width={140} stopAnimation />
            </li>
            <li className="ml15">
                <CommonSkeleton box height={32} width={220} stopAnimation />
            </li>
            <li className="ml15">
                <CommonSkeleton circle width={32} height={32} stopAnimation />
            </li>
        </ul>
    </div>
);

/** Form builder list — toolbar + grid skeleton (matches FormGenerator/index.jsx). */
export const FormGeneratorListSkeleton = () => (
    <>
        <FormGeneratorListToolbarSkeleton />
        <div className="pref-form-generator-grid-skeleton" aria-hidden="true">
            <GridLoadingSkeleton rows={10} columns={4} isLoading={false} wrapperClassName="p0" hideLeftBorder />
        </div>
    </>
);

const FgEditorShimmer = ({ style = {}, className = '' }) => (
    <span className={`skeleton-shimmer d-block ${className}`.trim()} style={style} aria-hidden="true" />
);

const FormGeneratorEditorHeaderBandSkeleton = () => (
    <ul
        className="d-flex rsp-header-band form-generator-header-band bg-white pref-fg-editor-header-band"
        aria-hidden="true"
    >
        <li>
            <FgEditorShimmer style={{ width: 80, height: 28 }} />
        </li>
        <li>
            <FgEditorShimmer style={{ width: 200, height: 28 }} />
        </li>
        <li className="position-absolute right110">
            <FgEditorShimmer style={{ width: 32, height: 32, borderRadius: 4 }} />
        </li>
        <li className="position-absolute right60">
            <FgEditorShimmer style={{ width: 32, height: 32, borderRadius: 4 }} />
        </li>
        <li className="position-absolute right10">
            <FgEditorShimmer style={{ width: 32, height: 32, borderRadius: 4 }} />
        </li>
    </ul>
);

const FormGeneratorEditorToolbarSkeleton = () => (
    <div
        className="rs-builder-elements-holder w-auto d-flex flex-column flex-xl-row align-items-center justify-content-between gap-3 py0 px10 pref-fg-editor-toolbar"
        aria-hidden="true"
    >
        <div className="d-flex flex-wrap gap-2 flex-grow-1 pref-fg-editor-toolbar__items">
            {Array.from({ length: 8 }, (_, index) => (
                <FgEditorShimmer key={index} style={{ width: 150, height: 65, borderRadius: 4 }} />
            ))}
        </div>
        <div className="d-flex gap-2 pref-fg-editor-toolbar__actions">
            <FgEditorShimmer style={{ width: 80, height: 32, borderRadius: 4 }} />
            <FgEditorShimmer style={{ width: 180, height: 32, borderRadius: 4 }} />
        </div>
    </div>
);

const FormGeneratorEditorFieldRowSkeleton = () => (
    <div className="pref-fg-editor-field-row">
        <Row className="align-items-center m0">
            <Col sm={3}>
                <FgEditorShimmer style={{ width: '55%', height: 30 }} />
            </Col>
            <Col sm={8}>
                <FgEditorShimmer style={{ width: '100%', height: 48, borderRadius: 4 }} />
            </Col>
        </Row>
    </div>
);

const FormGeneratorEditorCanvasSkeleton = () => (
    <div className="box-design css-scrollbar form-layout-container pref-fg-editor-canvas" aria-hidden="true">
        <div className="rs-builder-elements-dropped-wrapper rsbedw-form-builder p19 pref-fg-editor-canvas__inner">
            <FgEditorShimmer
                className="pref-fg-editor-form-header"
                style={{ width: '100%', height: 99, borderRadius: '7px 7px 0 0' }}
            />
            <div className="pref-fg-editor-canvas__fields">
                {Array.from({ length: 6 }, (_, index) => (
                    <FormGeneratorEditorFieldRowSkeleton key={index} />
                ))}
            </div>
        </div>
    </div>
);

const FormGeneratorEditorSidebarSkeleton = () => (
    <div className="rs-form-styles-wrapper css-scrollbar box-design mt0 p0 pref-fg-editor-sidebar" aria-hidden="true">
        <div className="pref-fg-editor-sidebar__header border-bottom">
            <FgEditorShimmer style={{ width: 120, height: 18 }} />
        </div>
        <div className="pref-fg-editor-sidebar__body">
            <div className="pref-fg-editor-sidebar__section">
                <div className="pref-fg-editor-sidebar__section-title">
                    <FgEditorShimmer style={{ width: 56, height: 14 }} />
                </div>
                <div className="pref-fg-editor-sidebar__layout-grid">
                    {Array.from({ length: 3 }, (_, index) => (
                        <FgEditorShimmer key={index} className="pref-fg-editor-sidebar__layout-card" />
                    ))}
                </div>
            </div>

            <div className="pref-fg-editor-sidebar__section">
                <div className="pref-fg-editor-sidebar__section-title">
                    <FgEditorShimmer style={{ width: 56, height: 14 }} />
                </div>
                <FgEditorShimmer className="pref-fg-editor-sidebar__input" />
                <div className="pref-fg-editor-sidebar__field-row">
                    <FgEditorShimmer className="pref-fg-editor-sidebar__field-half" />
                    <FgEditorShimmer className="pref-fg-editor-sidebar__field-half" />
                </div>
                <div className="pref-fg-editor-sidebar__field-row pref-fg-editor-sidebar__field-row--split">
                    <FgEditorShimmer className="pref-fg-editor-sidebar__inline-label" />
                    <div className="pref-fg-editor-sidebar__align-group">
                        {Array.from({ length: 3 }, (_, index) => (
                            <FgEditorShimmer key={index} className="pref-fg-editor-sidebar__align-btn" />
                        ))}
                    </div>
                </div>
                {Array.from({ length: 2 }, (_, index) => (
                    <div key={index} className="pref-fg-editor-sidebar__field-row pref-fg-editor-sidebar__field-row--split">
                        <FgEditorShimmer className="pref-fg-editor-sidebar__inline-label" />
                        <FgEditorShimmer className="pref-fg-editor-sidebar__color-input" />
                    </div>
                ))}
            </div>

            <div className="pref-fg-editor-sidebar__section">
                <div className="pref-fg-editor-sidebar__section-title">
                    <FgEditorShimmer style={{ width: 88, height: 14 }} />
                </div>
                <FgEditorShimmer className="pref-fg-editor-sidebar__upload" />
            </div>
        </div>
    </div>
);

/** Form builder editor — header band, toolbar, canvas + properties sidebar (matches FormGenerator.jsx). */
export const FormGeneratorEditorSkeleton = () => (
    <div className="pref-fg-editor-shell">
        <FormGeneratorEditorHeaderBandSkeleton />
        <FormGeneratorEditorToolbarSkeleton />
        <div className="mx10 pref-fg-editor-main">
            <Row>
                <Col md={9}>
                    <FormGeneratorEditorCanvasSkeleton />
                </Col>
                <Col md={3} className="pl0">
                    <FormGeneratorEditorSidebarSkeleton />
                </Col>
            </Row>
        </div>
    </div>
);

/** Create form — form type tab selection (matches AddFormGenerator/index.jsx before tab pick). */
export const FormGeneratorAddSkeleton = () => (
    <div className="planning-layout fromGenerator pref-fg-add-skeleton" aria-hidden="true">
        <div className="communication-create clearfix">
            <div className="rs-camp-tabs-holder">
                <TabBarViewSkeleton
                    tabCount={3}
                    colClass="col-sm-4"
                    scopeClass="pref-fg-add-tabs-skeleton"
                    tabsRowClass="rs-tabs row rst-left-space mb0 mini w-100 m-0"
                    omitColClass={false}
                />
            </div>
        </div>
    </div>
);

/** Brand-owned form — label offset sm=1 / field sm=6 rows. */
const BrandOwnedFormRowSkeleton = () => (
    <div className="form-group">
        <Row className='align-items-center'>
            <Col sm={{ offset: 1, span: 3 }}>
                <CommonSkeleton box height={14} width="72%" stopAnimation mainClass="ms-auto d-block" />
            </Col>
            <Col sm={6}>
                <CommonSkeleton box height={32} width="100%" stopAnimation />
            </Col>
        </Row>
    </div>
);

/** Brand-owned form — form name + platform card (matches BrandOwnedForm/index.jsx). */
export const BrandOwnedFormSkeleton = () => (
    <>
        <div className="box-design bd-top-border pref-brand-owned-form-skeleton">
            <div className="form-group mt30">
                <BrandOwnedFormRowSkeleton />
                <BrandOwnedFormRowSkeleton />
            </div>
        </div>
        <div className="buttons-holder pref-sk-brand-owned-form-actions">
            <CommonSkeleton box width={80} height={36} stopAnimation />
            <CommonSkeleton box width={72} height={36} stopAnimation />
        </div>
    </>
);

/** Template gallery › form generator — toolbar + grid skeleton. */
export const TemplateGalleryFormGeneratorSkeleton = () => (
    <>
        <FormGeneratorListToolbarSkeleton />
        <div className="pref-tg-form-generator-grid-skeleton" aria-hidden="true">
            <GridLoadingSkeleton rows={6} columns={5} isLoading={false} wrapperClassName="p0" hideLeftBorder />
        </div>
    </>
);

/** Ads — tabs + toolbar + grid skeleton. */
export const TemplateGalleryAdsSkeleton = () => (
    <>
        <TabBarViewSkeleton
            tabCount={3}
            colClass="col-md-4"
            scopeClass="pref-tg-tabs-skeleton"
            tabsRowClass="rs-tabs row rst-left-space mb0 mini w-100 m-0"
            omitColClass={false}
        />
        <div className="rs-sub-heading mb0" aria-hidden="true">
            <div className="align-items-center d-flex justify-content-between mt21 top-sub-heading">
                <h4 className="mb0" />
                <ul className="rs-list-group-horizontal">
                    <li className="ml15">
                        <CommonSkeleton box height={32} width={210} stopAnimation />
                    </li>
                    <li className="ml15">
                        <CommonSkeleton box height={32} width={130} stopAnimation />
                    </li>
                    <li className="ml15">
                        <CommonSkeleton box height={32} width={220} stopAnimation />
                    </li>
                    <li className="ml15">
                        <CommonSkeleton circle width={32} height={32} stopAnimation />
                    </li>
                </ul>
            </div>
        </div>
        <div className="pref-tg-ads-grid-skeleton" aria-hidden="true">
            <GridLoadingSkeleton rows={6} columns={4} isLoading={false} wrapperClassName="p0" hideLeftBorder />
        </div>
    </>
);

/** WhatsApp builder — header + wide panel skeleton. */
export const TemplateGalleryWhatsappSkeleton = () => (
    <>
        <div className="box-design rs-box py21" aria-hidden="true">
            <CommonSkeleton box height={14} width={220} stopAnimation mainClass="mb-3" />
            <CommonSkeleton box height={36} width="100%" stopAnimation />
            <div className="mt-3">
                <CommonSkeleton box height={360} width="100%" stopAnimation />
            </div>
        </div>
    </>
);

const DcSkelBar = ({ width, height = 24, circle = false, className = '' }) => (
    <span
        className={`skeleton-shimmer pref-dc-skel-bar${circle ? ' pref-dc-skel-bar--circle' : ''} ${className}`.trim()}
        style={{ width, height }}
        aria-hidden="true"
    />
);

const DataCatalogueAttributeBlockSkeleton = () => (
    <div className="col-sm-6 data-attribute-block pref-dc-attribute-block-skeleton">
        <div className="tag-list-block box-design primary-box-shadow mt0 p0 border-tlr10 border-trr10">
            <div className="dataCatelogue-listbox-header clearfix border-bottom">
                <div className="pref-dc-attribute-block-skeleton__header">
                    <DcSkelBar width={120} height={20} />
                    <div className="pref-dc-attribute-block-skeleton__header-actions">
                        <DcSkelBar width={20} height={20} style={{ borderRadius: "50%" }} />
                        <DcSkelBar width={20} height={20} style={{ borderRadius: "50%" }} />
                    </div>
                </div>
            </div>
            <div className="grid-inside-scrollbar p19">
                <RSSkeletonTable count={5} type="tag" isCustombox />
            </div>
        </div>
    </div>
);

const DataCatalogueFilterGroupsInfoBarSkeleton = () => (
    <div className="pref-dc-filter-info-bar-col">
        <div className="pref-dc-filter-info-bar">
            <div className="pref-dc-filter-info-bar__main">
                <DcSkelBar width={24} height={24} circle className="pref-dc-filter-info-bar__icon" />
                <DcSkelBar width={240} height={15} className="pref-dc-filter-info-bar__line" />
            </div>
            <DcSkelBar width={24} height={24} circle />
        </div>
    </div>
);

/** Sidebar classification legend — flex-wrap rows (matches live .data-legend). */
const DataCatalogueLegendSkeleton = () => (
    <ul className="data-legend pref-dc-legend-skeleton" aria-hidden="true">
        {[
            { dotClass: 'pref-dc-legend-skeleton__dot--ingested', width: 88 },
            { dotClass: 'pref-dc-legend-skeleton__dot--transaction', width: 108 },
            { dotClass: 'pref-dc-legend-skeleton__dot--kpi', width: 62 },
            { dotClass: 'pref-dc-legend-skeleton__dot--sensitive', width: 82 },
        ].map((item) => (
            <li key={item.dotClass}>
                <span className={`pref-dc-legend-skeleton__dot ${item.dotClass}`} />
                <CommonSkeleton box height={10} width={item.width} stopAnimation />
            </li>
        ))}
    </ul>
);

/** Audience score — filter row (Country / Industry / Client type). */
export const AudienceScoreFiltersSkeleton = () => (
    <div className="box-design  pref-as-filters-skeleton" aria-hidden="true">
        <div className="form-group m0">
            <Row>
                {Array.from({ length: 3 }, (_, index) => (
                    <Col sm={4} key={index}>
                        <CommonSkeleton box height={24} width="100%" stopAnimation />
                    </Col>
                ))}
            </Row>
        </div>
    </div>
);

/** Score band — A pills + help icon (right-aligned, clears before tabs). */
export const AudienceScoreScoreBandSkeleton = () => (
    <div className="pref-as-score-band-skeleton my10 w-100 clearfix" aria-hidden="true">
        <div className="d-flex align-items-center justify-content-end w-100">
            <ul className="d-flex align-items-center justify-content-end audienceScoreListCSS list-unstyled mb0 pe-none">
                {['A', 'A', 'A', '70', 'A'].map((_, index) => (
                    <li key={index} className='border-0 bg-transparent'>
                        <CommonSkeleton box height={32} width={32} stopAnimation />
                    </li>
                ))}
            </ul>
            <CommonSkeleton circle width={32} height={32} stopAnimation mainClass="ms-2" />
        </div>
    </div>
);

const AudienceScoreVerticalTabsSkeleton = () => (
    <ul className="pref-as-vertical-tabs rsv-tabs-list vertical-tabs list-unstyled mb0" aria-hidden="true">
        {AS_VERTICAL_TAB_LABELS.map((label, index) => (
            <li key={label} className={`tabDefault pref-as-vertical-tabs__item`}>
                <CommonSkeleton circle height={24} width={24} stopAnimation mainClass="pref-as-vertical-tabs__icon" />
                <CommonSkeleton
                    box
                    height={15}
                    width={100}
                    stopAnimation
                    mainClass="pref-as-vertical-tabs__label"
                />
            </li>
        ))}
    </ul>
);

const AUDIENCE_SCORE_PERSONA_CARD_COUNT = 6;

const AudienceScorePersonaCardSkeleton = () => (
    <Col sm={6} className="pref-as-persona-grid__col pl0">
        <div className="box-design p10 mb15 no-box-shadow pref-as-persona-card-skeleton">
            <div className="d-flex align-items-center justify-content-between gap-2 mb10">
                <div className="flex-shrink-0">
                    <CommonSkeleton box height={24} width={120} stopAnimation />
                </div>
                <div className='flex-shrink-0 d-flex align-items-center gap-2'>
                    <CommonSkeleton box height={24} width={217} stopAnimation />

                    <CommonSkeleton height={24} width={24} stopAnimation circle />
                </div>
            </div>

            <div className="d-flex align-items-center justify-content-between gap-2 mb10">
                <div className="flex-shrink-0">
                    <CommonSkeleton box height={24} width={120} stopAnimation />
                </div>
                <div className="flex-shrink-0">
                    <CommonSkeleton box height={24} width={250} stopAnimation />
                </div>
            </div>

            <div className="d-flex align-items-center justify-content-between gap-2">
                <div className="flex-shrink-0">
                    <CommonSkeleton box height={24} width={120} stopAnimation />
                </div>
                <div className="flex-shrink-0">
                    <CommonSkeleton box height={24} width={250} stopAnimation />
                </div>
            </div>
        </div>
    </Col>
);

/** Audience score card grid — 2 per row (matches live tab layouts). */
export const AudienceScorePersonaCardsGridSkeleton = ({ cardCount = AUDIENCE_SCORE_PERSONA_CARD_COUNT } = {}) => (
    <Row className="mx0 pref-as-persona-grid">
        {Array.from({ length: cardCount }, (_, index) => (
            <AudienceScorePersonaCardSkeleton key={index} />
        ))}
    </Row>
);

AudienceScorePersonaCardsGridSkeleton.propTypes = {
    cardCount: PropTypes.number,
};

const AUDIENCE_SCORE_TAB_CARD_COUNTS = {
    persona: 6,
    profile: 5,
    purchase: 4,
    communication: 6,
    laddering: 4,
};

const AUDIENCE_SCORE_TAB_BUTTON_COUNTS = {
    persona: 3,
    profile: 3,
    purchase: 3,
    communication: 3,
    laddering: 2,
};

/** Shared inner panel — title row + persona-style card grid + action buttons. */
const AudienceScoreTabInnerSkeleton = ({
    cardCount = AUDIENCE_SCORE_PERSONA_CARD_COUNT,
    buttonCount = 3,
    showTitleAction = false,
} = {}) => (
    <div className="rsv-tabs-content pref-as-inner-skeleton" aria-hidden="true">
        <div className="box-design bd-top-border">
            <Row className="mb10">
                <Col sm={8}>
                    <CommonSkeleton box height={24} width={120} stopAnimation />
                </Col>
                {showTitleAction ? (
                    <Col sm={4} className="d-flex justify-content-end">
                        <CommonSkeleton circle width={24} height={24} stopAnimation />
                    </Col>
                ) : null}
            </Row>
            <AudienceScorePersonaCardsGridSkeleton cardCount={cardCount} />
        </div>
        <div className="buttons-holder pref-as-buttons-skeleton d-flex justify-content-end gap-2 mt15">
            {Array.from({ length: buttonCount }, (_, index) => (
                <CommonSkeleton key={index} box height={36} width={88} stopAnimation />
            ))}
        </div>
    </div>
);

AudienceScoreTabInnerSkeleton.propTypes = {
    cardCount: PropTypes.number,
    buttonCount: PropTypes.number,
    showTitleAction: PropTypes.bool,
};

/** Persona tab inner panel — title row + create action + 6 cards. */
export const AudienceScorePersonaInnerSkeleton = () => (
    <AudienceScoreTabInnerSkeleton
        cardCount={AUDIENCE_SCORE_TAB_CARD_COUNTS.persona}
        buttonCount={AUDIENCE_SCORE_TAB_BUTTON_COUNTS.persona}
        showTitleAction
    />
);

/** Profile data tab — 5 cards (4 profile sections + grading). */
export const AudienceScoreProfileInnerSkeleton = () => (
    <AudienceScoreTabInnerSkeleton
        cardCount={AUDIENCE_SCORE_TAB_CARD_COUNTS.profile}
        buttonCount={AUDIENCE_SCORE_TAB_BUTTON_COUNTS.profile}
    />
);

/** Purchase pattern tab — 4 cards. */
export const AudienceScorePurchaseInnerSkeleton = () => (
    <AudienceScoreTabInnerSkeleton
        cardCount={AUDIENCE_SCORE_TAB_CARD_COUNTS.purchase}
        buttonCount={AUDIENCE_SCORE_TAB_BUTTON_COUNTS.purchase}
    />
);

/** Communication response tab — 6 section cards. */
export const AudienceScoreCommunicationInnerSkeleton = () => (
    <AudienceScoreTabInnerSkeleton
        cardCount={AUDIENCE_SCORE_TAB_CARD_COUNTS.communication}
        buttonCount={AUDIENCE_SCORE_TAB_BUTTON_COUNTS.communication}
    />
);

/** Audience laddering tab — 4 cards, Cancel + Save only. */
export const AudienceScoreLadderingInnerSkeleton = () => (
    <AudienceScoreTabInnerSkeleton
        cardCount={AUDIENCE_SCORE_TAB_CARD_COUNTS.laddering}
        buttonCount={AUDIENCE_SCORE_TAB_BUTTON_COUNTS.laddering}
    />
);

/** Vertical tabs + inner panel (float layout — matches live `rs-vertical-tabs-wrapper`). */
export const AudienceScoreTabsLayoutSkeleton = ({ innerContent = null } = {}) => (
    <div className="rs-vertical-tabs-wrapper pref-as-tabs-layout-skeleton mt20 clearfix" aria-hidden="true">
        <AudienceScoreVerticalTabsSkeleton />
        <div className="tabs-content pref-as-tabs-content-skeleton">
            {innerContent ?? <AudienceScorePersonaInnerSkeleton />}
        </div>
    </div>
);

/** Full audience score page body (filters + score band + tabs + inner). */
export const AudienceScorePageSkeleton = () => (
    <div className="page-content audienceScorePageCSS mt21 pref-as-page-skeleton" aria-hidden="true">
        <Container className="px0">
            <AudienceScoreFiltersSkeleton />
            <AudienceScoreScoreBandSkeleton />
            <AudienceScoreTabsLayoutSkeleton />
        </Container>
    </div>
);

const AUDIENCE_SCORE_INNER_SKELETON_BY_VARIANT = {
    persona: AudienceScorePersonaInnerSkeleton,
    profile: AudienceScoreProfileInnerSkeleton,
    purchase: AudienceScorePurchaseInnerSkeleton,
    communication: AudienceScoreCommunicationInnerSkeleton,
    laddering: AudienceScoreLadderingInnerSkeleton,
};

/** Empty tab body — skeleton bars + inline CTA (matches loading card-grid footprint). */
export const AudienceScoreTabEmptyStateTable = ({ message = null, count = 5, className = '' }) => (
    <RSSkeletonTable
        text
        count={count}
        isCustombox
        isAlertIcon={false}
        message={message}
        containerClassName={`pref-as-empty-state-table w-100 ${className}`.trim()}
        noDataCustomClass="text-center  color-secondary-grey"
    />
);

AudienceScoreTabEmptyStateTable.propTypes = {
    message: PropTypes.node,
    count: PropTypes.number,
    className: PropTypes.string,
};

/** In-tab gate — inner skeleton while tab APIs load; optional empty-state table via render prop. */
export const AudienceScoreTabContentSkeletonGate = ({
    isLoading = false,
    variant = 'persona',
    emptyState = null,
    children = null,
}) => {
    const emptyStateNode =
        emptyState != null ? (
            <AudienceScoreTabEmptyStateTable message={emptyState.message} count={emptyState.count ?? 7} />
        ) : null;

    if (isLoading) {
        const InnerSkeleton = AUDIENCE_SCORE_INNER_SKELETON_BY_VARIANT[variant] ?? AudienceScorePersonaInnerSkeleton;

        return (
            <>
                <style>{preferencesSkeletonCriticalCss}</style>
                <style>{audienceScoreSkeletonCriticalCss}</style>
                <InnerSkeleton />
            </>
        );
    }

    if (typeof children === 'function') {
        return children(emptyStateNode);
    }

    return children;
};

AudienceScoreTabContentSkeletonGate.propTypes = {
    isLoading: PropTypes.bool,
    variant: PropTypes.oneOf(['persona', 'profile', 'purchase', 'communication', 'laddering']),
    emptyState: PropTypes.shape({
        message: PropTypes.node,
        count: PropTypes.number,
    }),
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

const DeSkelBar = ({ width, height = 24, circle = false, className = '' }) => (
    <span
        className={`skeleton-shimmer pref-de-skel-bar${circle ? ' pref-de-skel-bar--circle' : ''} ${className}`.trim()}
        style={{ width, height }}
        aria-hidden="true"
    />
);

/** Available-system connector card — logo + plus icon (bottom-right). */
export const DataExchangeConnectorCardSkeleton = () => (
    <div className="pref-de-connector-skeleton topSmallCard">
        <div className="pref-de-connector-skeleton__card">
            <div className="pref-de-connector-skeleton__body">
                <DeSkelBar width={193} height={82} />
            </div>
            <div className="pref-de-connector-skeleton__add-icon">
                <DeSkelBar width={24} height={24} circle />
            </div>
        </div>
    </div>
);

/** API consumptions available card — icon + title (left-aligned) + plus icon. */
export const DataExchangeApiAvailableCardSkeleton = () => (
    <div className="pref-de-api-available-card-skeleton topSmallCard">
        <div className="pref-de-api-available-card-skeleton__card">
            <div className="pref-de-api-available-card-skeleton__body">
                <DeSkelBar width={48} height={48} circle className="pref-de-api-available-card-skeleton__icon" />
                <DeSkelBar width={140} height={16} className="pref-de-api-available-card-skeleton__title" />
            </div>
            <div className="pref-de-api-available-card-skeleton__add-icon">
                <DeSkelBar width={24} height={24} circle />
            </div>
        </div>
    </div>
);

const DE_INTEGRATED_STATUS_LINE_WIDTHS = ['85%', '68%'];

/** Integrated system card — logo, title, status bar, action icon (top-right). */
export const DataExchangeIntegratedSystemCardSkeleton = ({
    statusLineCount = 2,
    useIconLogo = false,
} = {}) => (
    <div className="pref-de-integrated-card-skeleton topSmallCard">
        <div className="pref-de-integrated-card-skeleton__card">
            <div className="pref-de-integrated-card-skeleton__logo">
                {useIconLogo ? (
                    <DeSkelBar width={48} height={48} circle />
                ) : (
                    <DeSkelBar width={193} height={82} />
                )}
            </div>
            <div className="pref-de-integrated-card-skeleton__title">
                <DeSkelBar width="50%" height={14} />
            </div>
            <div className="pref-de-integrated-card-skeleton__status">
                {Array.from({ length: statusLineCount }, (_, index) => (
                    <DeSkelBar
                        key={`pref-de-integrated-status-${index}`}
                        width={'68%'}
                        height={10}
                        className="pref-de-integrated-card-skeleton__status-line"
                    />
                ))}
            </div>
            <div className="pref-de-integrated-card-skeleton__action">
                <DeSkelBar width={24} height={24} circle />
            </div>
        </div>
    </div>
);

export const DataExchangeConnectorCardsRowSkeleton = ({ count = 6 } = {}) => (
    <div className="pref-de-cards-row pref-de-cards-grid sourceCategory">
        {Array.from({ length: count }, (_, index) => (
            <DataExchangeConnectorCardSkeleton key={index} />
        ))}
    </div>
);

export const DataExchangeApiAvailableCardsRowSkeleton = ({ count = 6 } = {}) => (
    <div className="pref-de-cards-row pref-de-cards-grid pref-de-api-available-cards-row sourceCategory">
        {Array.from({ length: count }, (_, index) => (
            <DataExchangeApiAvailableCardSkeleton key={index} />
        ))}
    </div>
);

const DE_INTEGRATED_SKELETON_COUNT = 6;

export const DataExchangeIntegratedSystemsGridSkeleton = ({
    count = DE_INTEGRATED_SKELETON_COUNT,
    statusLineCount = 2,
    useIconLogo = false,
} = {}) => (
    <div className="pref-de-integrated-grid pref-de-cards-grid">
        {Array.from({ length: count }, (_, index) => (
            <DataExchangeIntegratedSystemCardSkeleton
                key={index}
                statusLineCount={statusLineCount}
                useIconLogo={useIconLogo}
            />
        ))}
    </div>
);

const DE_CONNECTOR_CATEGORY_SKELETON_COUNT = 2;
const DE_CONNECTOR_CATEGORY_CARD_COUNT = 6;
const DE_API_AVAILABLE_CONNECTOR_COUNT = 6;

const DataExchangeConnectorCategorySkeleton = ({ cardCount = DE_CONNECTOR_CATEGORY_CARD_COUNT }) => (
    <div className="pref-de-connector-category sourceCategory">
        <DeSkelBar width={130} height={20} className="pref-de-connector-category__title" />
        <DataExchangeConnectorCardsRowSkeleton count={cardCount} />
    </div>
);

/** Shared integrated + available systems layout (ingestion and API consumptions). */
const DataExchangeSystemsPanelSkeleton = ({
    showSearch = false,
    integratedCount = DE_INTEGRATED_SKELETON_COUNT,
    integratedStatusLineCount = 2,
    integratedUseIconLogo = false,
    showCategorySections = true,
    availableConnectorCount = DE_CONNECTOR_CATEGORY_CARD_COUNT,
    availableCardVariant = 'ingestion',
    categorySectionCount = DE_CONNECTOR_CATEGORY_SKELETON_COUNT,
    className = 'tabs-content pref-de-ingestion-panel-skeleton',
}) => (
    <div className={className} aria-hidden="true">
        <div className="pref-de-ingestion-panel-skeleton__content">
            <div
                className={`pref-de-ingestion-panel-skeleton__toolbar${showSearch ? '' : ' pref-de-ingestion-panel-skeleton__toolbar--title-only'
                    }`}
            >
                <DeSkelBar width={180} height={25} className="pref-de-ingestion-panel-skeleton__title" />
                {showSearch ? <DeSkelBar width={32} height={32} circle /> : null}
            </div>
            <div className="pref-de-ingestion-panel-skeleton__integrated-panel">
                <DataExchangeIntegratedSystemsGridSkeleton
                    count={integratedCount}
                    statusLineCount={integratedStatusLineCount}
                    useIconLogo={integratedUseIconLogo}
                />
            </div>
            <div className="pref-de-ingestion-panel-skeleton__available-heading">
                <DeSkelBar width={160} height={25} />
            </div>
            {showCategorySections ? (
                Array.from({ length: categorySectionCount }, (_, index) => (
                    <DataExchangeConnectorCategorySkeleton
                        key={`pref-de-connector-category-${index}`}
                        cardCount={DE_CONNECTOR_CATEGORY_CARD_COUNT}
                    />
                ))
            ) : availableCardVariant === 'api' ? (
                <DataExchangeApiAvailableCardsRowSkeleton count={availableConnectorCount} />
            ) : (
                <DataExchangeConnectorCardsRowSkeleton count={availableConnectorCount} />
            )}
        </div>
    </div>
);

/** Data ingestion tab — vertical category sections under available systems. */
export const DataExchangeIngestionPanelSkeleton = () => (
    <DataExchangeSystemsPanelSkeleton showSearch showCategorySections />
);

/** API consumptions tab — icon integrated cards + horizontal available cards. */
export const DataExchangeApiConsumptionPanelSkeleton = () => (
    <DataExchangeSystemsPanelSkeleton
        className="tabs-content  pref-de-api-panel-skeleton"
        integratedCount={DE_INTEGRATED_SKELETON_COUNT}
        integratedStatusLineCount={1}
        integratedUseIconLogo
        showCategorySections={false}
        availableConnectorCount={DE_API_AVAILABLE_CONNECTOR_COUNT}
        availableCardVariant="api"
    />
);

const DataExchangeVerticalTabsSkeleton = () => (
    <ul className="pref-de-vertical-tabs rsv-tabs-list vertical-tabs" aria-hidden="true">
        {Array.from({ length: DE_VERTICAL_TAB_SKELETON_COUNT }, (_, index) => (
            <li
                key={DE_VERTICAL_TAB_LABELS[index] ?? `pref-de-vertical-tab-${index}`}
                className="tabDefault pref-de-vertical-tabs__item"
            >
                <DeSkelBar width={32} height={32} circle className="pref-de-vertical-tabs__icon" />
                <DeSkelBar
                    width={72}
                    height={15}
                    className="pref-de-vertical-tabs__label"
                />
            </li>
        ))}
    </ul>
);

/** Top RSTabbarFluid — neutral grey tab blocks (no active blue; full-width strip). */
export const DataExchangeTopTabsSkeleton = (props) => (
    <TabBarViewSkeleton
        tabCount={DE_TOP_TAB_LABELS.length}
        scopeClass="pref-de-top-tabs-skeleton"
        tabsListClass="pref-de-top-tabs-skeleton__list"
        tabsRowClass="rs-tabs row rst-left-space mb0 mini w-100 m-0"
        containerClass="pref-de-top-tabs-skeleton__container"
        wrapperClassName="fullWhiteBackground pref-de-top-tabs-skeleton mb0"
        omitColClass
        {...props}
    />
);

DataExchangeConnectorCardsRowSkeleton.propTypes = {
    count: PropTypes.number,
};

DataExchangeIntegratedSystemsGridSkeleton.propTypes = {
    count: PropTypes.number,
    statusLineCount: PropTypes.number,
    useIconLogo: PropTypes.bool,
};

DataExchangeApiAvailableCardsRowSkeleton.propTypes = {
    count: PropTypes.number,
};

/** Vertical tabs + panel only (below live RSTabbarFluid tab strip). */
export const DataExchangeIngestionLoadingSkeleton = () => (
    <div className="pref-de-ingestion-skeleton dataExchangePageCSS" aria-hidden="true">
        <div className="pref-de-tabs-layout-skeleton rs-vertical-tabs-wrapper">
            <DataExchangeVerticalTabsSkeleton />
            <DataExchangeIngestionPanelSkeleton />
        </div>
    </div>
);

/** Data ingestion — top tabs + vertical category tabs + panel (route refresh). */
export const DataExchangeIngestionInnerSkeleton = () => (
    <>
        <DataExchangeTopTabsSkeleton />
        <DataExchangeIngestionLoadingSkeleton />
    </>
);

/** API consumptions tab — integrated + available systems (reuses ingestion panel pieces). */
export const DataExchangeApiConsumptionInnerSkeleton = () => (
    <div className="pref-de-api-skeleton" aria-hidden="true">
        <DataExchangeApiConsumptionPanelSkeleton />
    </div>
);

/** Full data exchange page — RSTabbarFluid (3 tabs) + data ingestion layout. */
export const DataExchangePageSkeleton = () => (
    <div className="page-content pc-data-exchange pref-de-page-skeleton" aria-hidden="true">
        <Container className='px0' style={{ paddingRight: '0', paddingLeft: '0' }}>
            <DataExchangeIngestionInnerSkeleton />
        </Container>
    </div>
);

const DATA_EXCHANGE_IN_PAGE_SKELETON_BY_TAB = {
    ingestion: DataExchangeIngestionLoadingSkeleton,
    api: DataExchangeApiConsumptionInnerSkeleton,
};

/** In-tab gate while connector / API lists load (live RSTabbarFluid strip stays mounted above). */
export const DataExchangeTabContentSkeletonGate = ({ isLoading = false, tab = 'ingestion', children = null }) => {
    if (!isLoading) {
        return children;
    }

    const InnerSkeleton =
        DATA_EXCHANGE_IN_PAGE_SKELETON_BY_TAB[tab] ?? DataExchangeIngestionLoadingSkeleton;

    return (
        <div className="pref-de-tab-content-skeleton-gate pc-data-exchange" aria-hidden="true">
            <style>{preferencesSkeletonCriticalCss}</style>
            <style>{dataExchangeSkeletonCriticalCss}</style>
            <InnerSkeleton />
        </div>
    );
};

DataExchangeTabContentSkeletonGate.propTypes = {
    isLoading: PropTypes.bool,
    tab: PropTypes.oneOf(['ingestion', 'api']),
    children: PropTypes.node,
};

/** Body only — offset tabs + tab body (RSTabbarFluid), fixed left sidebar, filter-group card grid. */
export const DataCataloguePageSkeleton = () => (
    <div className="position-relative pref-dc-page-skeleton data-catalogue w-100" aria-hidden="true">
        <Row>
            <Col sm={9} className="offset-sm-3 data_catalogue_tab px-0">
                <TabBarViewSkeleton
                    tabCount={2}
                    colClass="col-md-6"
                    scopeClass="pref-dc-tabs-skeleton"
                    tabsRowClass="rs-tabs row rst-left-space mb0 mini w-100 m-0"
                    omitColClass={false}
                />
                <Container className="px0">
                    <div className="col-sm-12 px5 pref-dc-main-skeleton">
                        <Row className="mx-0">
                            <DataCatalogueFilterGroupsInfoBarSkeleton />
                            {Array.from({ length: 6 }, (_, index) => (
                                <DataCatalogueAttributeBlockSkeleton key={index} />
                            ))}
                        </Row>
                    </div>
                </Container>
            </Col>
        </Row>
        <Container className="px0">
            <div className="col-sm-3 sticky pref-dc-sidebar-skeleton">
                <div className="top-sub-heading pref-dc-sidebar-toolbar">
                    <span className="pref-dc-sidebar-toolbar__title">
                        <DcSkelBar width={160} height={24} />
                    </span>
                    <ul className="pref-dc-sidebar-toolbar__actions">
                        <li>
                            <DcSkelBar width={32} height={32} circle />
                        </li>
                        <li>
                            <DcSkelBar width={32} height={32} circle />
                        </li>
                        <li>
                            <DcSkelBar width={32} height={32} circle />
                        </li>
                    </ul>
                </div>
                <div className="box-design pref-dc-sidebar-brand-row">
                    <DcSkelBar width={36} height={36} circle />
                    <div className="pref-dc-sidebar-brand-row__labels">
                        <DcSkelBar width={80} height={24} />
                        <DcSkelBar width={80} height={24} />
                    </div>
                </div>
                <div className="tag-list-block box-design mt25 position-relative pref-dc-sidebar-tags-skeleton">
                    <div className="pref-dc-sidebar-expand-skeleton">
                        <DcSkelBar width={24} height={24} circle />
                    </div>
                    <div className="left-grid-inside-scrollbar">
                        <RSSkeletonTable type="tag" isCustombox count={130} stopAnimation />
                    </div>
                </div>
                {/* <DataCatalogueLegendSkeleton /> */}
            </div>
        </Container>
    </div>
);

/** Route refresh / in-page gate — header shimmer + data catalogue body. */
export const DataCatalogueRouteSkeleton = () => (
    <>
        <RSPageHeaderSkeleton
            variant="tabber"
            className="pref-subpage-header-skeleton pref-dc-header-skeleton"
            titleWidth={SUBPAGE_TITLE_WIDTH[PREFERENCES_SUBPAGE_VARIANT.DATA_CATALOGUE]}
            showBack
        />
        <Container fluid>
            <DataCataloguePageSkeleton />
        </Container>
    </>
);

const DATA_CATALOGUE_GRID_COLUMN_COUNT = 14;

/** Toolbar — dedupe / list / grid icons (matches data-table header actions). */
const DataCatalogueGridToolbarSkeleton = () => (
    <div className="pref-dc-grid-toolbar-skeleton" aria-hidden="true">
        <DcSkelBar width={32} height={32} circle />
        <DcSkelBar width={32} height={32} circle />
        <DcSkelBar width={32} height={32} circle />
    </div>
);

/** Kendo grid placeholder — blue header row + data rows (no global spinner). */
export const DataCatalogueGridTableSkeleton = ({ rows = 10 } = {}) => (
    <div className="pref-dc-grid-table-skeleton rs-kendo-grid-table no-box-shadow">
        <GridLoadingSkeleton
            rows={rows}
            columns={DATA_CATALOGUE_GRID_COLUMN_COUNT}
            isLoading={false}
            wrapperClassName="p0"
            hideLeftBorder
        />
    </div>
);

DataCatalogueGridTableSkeleton.propTypes = {
    rows: PropTypes.number,
};

/** Data catalogue list view — toolbar + grid. */
export const DataCatalogueGridPageSkeleton = () => (
    <div className="page-content pc-data-catalogue pref-dc-grid-page-skeleton" aria-hidden="true">
        <Container className="px0">
            <DataCatalogueGridToolbarSkeleton />
            <DataCatalogueGridTableSkeleton />
        </Container>
    </div>
);

const DataCatalogueGridBodySkeleton = () => (
    <Container fluid>
        <div className="page-content pc-data-catalogue">
            <DataCatalogueGridPageSkeleton />
        </div>
    </Container>
);

const PrefCsSkelBar = ({ className = '' }) => (
    <div
        className={`pref-cs-skel-bar pref-cs-skel-bar--static ${className}`.trim()}
        aria-hidden="true"
    />
);

/** Icon sub-tabs — grey icon + label placeholder on every tab (no live active blue). */
const CommunicationSettingsSubTabsSkeleton = ({ tabCount = CS_MAIL_SUB_TAB_COUNT, channel = 'mail' }) => (
    <ul
        className={`pref-cs-sub-tabs rs-sub-tabs rs-cc-sub-tabs res-sub-tabs res-cc-sub-tabs list-unstyled mb0${
            channel === 'mail' ? '' : ' pref-tabber'
        }`}
        aria-hidden="true"
    >
        {Array.from({ length: tabCount }, (_, index) => (
            <li key={index} className="tabDefault pref-cs-sub-tabs__item">
                <PrefCsSkelBar className="pref-cs-sub-tabs__icon pref-cs-skel-bar--circle" />
                <PrefCsSkelBar className="pref-cs-sub-tabs__label" />
            </li>
        ))}
    </ul>
);

/** Top RSTabbarFluid — same neutral tab strip as communication listing / analytics. */
const CommunicationSettingsTopTabsSkeleton = (props) => (
    <TabBarViewSkeleton
        tabCount={3}
        scopeClass="pref-cs-top-tabs-skeleton"
        tabsListClass="pref-cs-top-tabs-skeleton__list"
        tabsRowClass="rs-tabs row rst-left-space mb0 mini w-100 m-0"
        containerClass="pref-cs-top-tabs-skeleton__container"
        wrapperClassName="pref-cs-top-tabs-skeleton mb0"
        omitColClass
        {...props}
    />
);

const SMTP_GRID_ROW_COUNT = 5;
const SMTP_GRID_COLUMN_COUNT = 5;

const CommunicationSettingsSmtpGridTableMarkup = () => (
    <div className="pref-cs-smtp-grid-table" aria-hidden="true">
        <table className="pref-cs-smtp-grid-table__table">
            <tbody>
                <tr className="pref-cs-smtp-grid-table__header-row">
                    {Array.from({ length: SMTP_GRID_COLUMN_COUNT }, (_, colIndex) => (
                        <td key={`smtp-hdr-${colIndex}`} className="pref-cs-smtp-grid-table__header-cell">
                            &nbsp;
                        </td>
                    ))}
                </tr>
                {Array.from({ length: SMTP_GRID_ROW_COUNT }, (_, rowIndex) => (
                    <tr
                        key={`smtp-row-${rowIndex}`}
                        className={`pref-cs-smtp-grid-table__body-row${rowIndex % 2 === 1 ? ' pref-cs-smtp-grid-table__body-row--alt' : ''
                            }`}
                    >
                        {Array.from({ length: SMTP_GRID_COLUMN_COUNT }, (_, colIndex) => (
                            <td
                                key={`smtp-cell-${rowIndex}-${colIndex}`}
                                className="pref-cs-smtp-grid-table__body-cell"
                            >
                                &nbsp;
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const CommunicationSettingsSmtpHeadingSkeleton = ({ showAddAction = false } = {}) => (
    <div className="rs-sub-heading pref-cs-smtp-heading">
        <div className="align-items-center d-flex justify-content-between pref-cs-smtp-heading__row mb19">
            <PrefCsSkelBar className="pref-cs-smtp-heading__title" />
            {showAddAction ? (
                <div className="pref-cs-smtp-heading__actions lh0" aria-hidden="true">
                    <PrefCsSkelBar className="pref-cs-smtp-heading__action pref-cs-skel-bar--circle" />
                </div>
            ) : null}
        </div>
    </div>
);

CommunicationSettingsSmtpHeadingSkeleton.propTypes = {
    showAddAction: PropTypes.bool,
};

/** Kendo grid placeholder (inside live SMTP|Domain tab panel). */
export const CommunicationSettingsSmtpTableSkeleton = () => (
    <div className="pref-cs-smtp-grid">
        <div className="pref-cs-smtp-grid-table-shell">
            <CommunicationSettingsSmtpGridTableMarkup />
        </div>
    </div>
);

/** Frequency cap Kendo grid (Name / Frequency / Action). */
export const CommunicationSettingsFrequencyCapTableSkeleton = () => (
    <div className="pref-cs-smtp-grid pref-cs-frequency-cap-grid">
        <GridLoadingSkeleton rows={5} columns={3} isLoading={false} wrapperClassName="p0" hideLeftBorder />
    </div>
);

/** Frequency cap list — add button + grid (route refresh). */
export const CommunicationSettingsFrequencyCapGridSkeleton = () => (
    <CommunicationSettingsFrequencyCapTableSkeleton />
);

/** Frequency cap create / edit — label-left form fields. */
export const CommunicationSettingsFrequencyCapFormSkeleton = () => (
    <div className="box-design bd-top-border pref-cs-frequency-cap-form-skeleton mt40" aria-hidden="true">
        {Array.from({ length: 3 }, (_, index) => (
            <div key={`fc-field-${index}`} className="form-group mt20">
                <Row className='align-items-end'>
                    <Col sm={4} className="text-right d-flex justify-content-end align-items-center">
                        <CommonSkeleton box height={14} width={100} stopAnimation />
                    </Col>
                    <Col sm={6}>
                        <CommonSkeleton box height={32} width="100%" stopAnimation />
                    </Col>
                </Row>
            </div>
        ))}
        <div className="form-group mb10">
            <Row>
                <Col sm={{ offset: 4, span: 6 }}>
                    <CommonSkeleton box height={14} width="85%" stopAnimation />
                </Col>
            </Row>
        </div>
        <div className="buttons-holder mb10 d-flex justify-content-end gap-3">
            <CommonSkeleton box height={36} width={88} stopAnimation />
            <CommonSkeleton box height={36} width={100} stopAnimation />
        </div>
    </div>
);

/** Skeleton only for edit flows; create flows use field loaders on form controls. */
export const shouldShowCommunicationSettingsEditSkeleton = (isLoading, isEditMode = true) =>
    Boolean(isLoading && isEditMode);

/** In-page gate while frequency cap dropdowns / edit API load. */
export const CommunicationSettingsFrequencyCapEditSkeletonGate = ({
    isLoading = false,
    isEditMode = true,
    children = null,
}) => {
    if (!shouldShowCommunicationSettingsEditSkeleton(isLoading, isEditMode)) {
        return children;
    }

    return (
        <>
            <style>{preferencesSkeletonCriticalCss}</style>
            <style>{communicationSettingsSkeletonCriticalCss}</style>
            <div className="preferences-skeleton-scope pref-cs-frequency-cap-skeleton-scope communication-settings-frequency-cap-skeleton">
                <CommunicationSettingsFrequencyCapFormSkeleton />
            </div>
        </>
    );
};

CommunicationSettingsFrequencyCapEditSkeletonGate.propTypes = {
    isLoading: PropTypes.bool,
    isEditMode: PropTypes.bool,
    children: PropTypes.node,
};

/** Route refresh — Frequency cap tab (top tabs + grid, no channel layout). */
export const CommunicationSettingsFrequencyCapRouteSkeleton = () => (
    <>
        <RSPageHeaderSkeleton
            variant="tabber"
            className="pref-subpage-header-skeleton pref-cs-page-header-skeleton"
            titleWidth={SUBPAGE_TITLE_WIDTH[PREFERENCES_SUBPAGE_VARIANT.COMMUNICATION_SETTINGS]}
            showBack
        />
        <Container fluid>
            <div className="page-content pc-communication-settings">
                <CommunicationSettingsTopTabsSkeleton tabCount={3} activeTabIndex={1} />
                <Container className="px0">
                    <div className="mt30">
                        <CommunicationSettingsFrequencyCapGridSkeleton />
                    </div>
                </Container>
            </div>
        </Container>
    </>
);

/** Quiet hours create / edit — mirrors QuietHoursCreate field layout (Col md={12}). */
export const CommunicationSettingsQuietHoursFormSkeleton = ({ embedded = false }) => (
    <div
        className={`${embedded ? 'quiet-hours-form' : 'box-design bd-top-border quiet-hours-form'
            } pref-cs-quiet-hours-form-skeleton`}
        aria-hidden="true"
    >
        <div className="rs-sub-heading">
            <CommonSkeleton box height={20} width={160} />
        </div>
        <Row>
            <Col md={12}>
                <Row className="form-group mt20">
                    <PrefFieldSkeleton sm={6} />
                    <PrefFieldSkeleton sm={6} />
                </Row>
                <Row className="form-group mb25">
                    <PrefFieldSkeleton sm={6} />
                    <PrefFieldSkeleton sm={6} />
                </Row>

                <div className="form-group">
                    <CommonSkeleton box height={12} width={100} mainClass="mb10 pref-sk-label" />
                    <div className="rs-quiet-hours-days d-flex flex-wrap">
                        {Array.from({ length: 7 }, (_, index) => (
                            <CommonSkeleton
                                key={`qh-day-${index}`}
                                box
                                height={34}
                                width={48}
                                mainClass="pref-cs-quiet-hours-day-skeleton"
                            />
                        ))}
                    </div>
                </div>

                <Row className="form-group">
                    <Col sm={12}>
                        <div className="form-group pref-sk-field">
                            <CommonSkeleton box height={12} width="32%" mainClass="pref-sk-label" />
                            <CommonSkeleton box height={32} width="100%" />
                        </div>
                        <CommonSkeleton box height={12} width="92%" mainClass="mt10" />
                        <CommonSkeleton box height={12} width="78%" mainClass="mt5" />
                    </Col>
                </Row>

                <div className="form-group">
                    <CommonSkeleton box height={12} width={160} mainClass="mb10 pref-sk-label" />
                    <Row>
                        <Col sm={3}>
                            <CommonSkeleton box height={20} width={112} />
                        </Col>
                        <Col sm={3}>
                            <CommonSkeleton box height={20} width={72} />
                        </Col>
                        <Col sm={6}>
                            <div className="form-group pref-sk-field mb0">
                                <CommonSkeleton box height={12} width="42%" mainClass="pref-sk-label" />
                                <CommonSkeleton box height={32} width="100%" />
                            </div>
                        </Col>
                    </Row>
                </div>

                <div className="form-group mb0">
                    <CommonSkeleton box height={12} width={120} mainClass="mb10 pref-sk-label" />
                    <div className="d-flex align-items-center">
                        <CommonSkeleton box height={28} width={58} />
                        <CommonSkeleton circle width={16} height={16} mainClass="ml10" />
                    </div>
                </div>
            </Col>
        </Row>
    </div>
);

CommunicationSettingsQuietHoursFormSkeleton.propTypes = {
    embedded: PropTypes.bool,
};

/** In-page gate — form skeleton while lookups / detail APIs load. */
export const CommunicationSettingsQuietHoursEditSkeletonGate = ({
    isLoading = false,
    embedded = false,
    children = null,
}) => {
    if (!isLoading) {
        return children;
    }

    const wrapperClass = embedded ? '' : 'rsv-tabs-content';

    return (
        <div className={wrapperClass}>
            <style>{preferencesSkeletonCriticalCss}</style>
            <style>{communicationSettingsSkeletonCriticalCss}</style>
            <div className="preferences-skeleton-scope pref-cs-quiet-hours-skeleton-scope communication-settings-quiet-hours-skeleton">
                <CommunicationSettingsQuietHoursFormSkeleton embedded={embedded} />
            </div>
            <div className="buttons-holder" aria-hidden="true">
                <CommonSkeleton box height={36} width={88} />
                <CommonSkeleton box height={36} width={72} mainClass="ml15" />
            </div>
        </div>
    );
};

CommunicationSettingsQuietHoursEditSkeletonGate.propTypes = {
    isLoading: PropTypes.bool,
    embedded: PropTypes.bool,
    children: PropTypes.node,
};

/** Channel goals summary — 4-column grid (Channels / Reach / Engagement / Conversion). */
export const ChannelGoalsSummaryGridSkeleton = () => (
    <div className="rs-goals-summary-grid-wrapper pref-cs-channel-goals-grid-skeleton" aria-hidden="true">
        <GridLoadingSkeleton
            rows={5}
            columns={4}
            isLoading={false}
            wrapperClassName="p0"
            hideLeftBorder
            columnConfigs={[
                { width: 250 },
                { width: 300 },
                { width: 300 },
                { width: 300 },
            ]}
        />
    </div>
);

/** Route refresh — `/preferences/goals-and-benchmark/channel-goals`. */
export const ChannelGoalsRouteSkeleton = () => (
    <>
        <RSPageHeaderSkeleton
            className="pref-subpage-header-skeleton"
            titleWidth={SUBPAGE_TITLE_WIDTH[PREFERENCES_SUBPAGE_VARIANT.GOALS_CHANNEL_GOALS]}
            showBack
        />
        <Container fluid>
            <div className="page-content">
                <Container className="px0">
                    <ChannelGoalsSummaryGridSkeleton />
                </Container>
            </div>
        </Container>
    </>
);

/** Goals & benchmark Kendo grid (Name / Business type / Communication type / Country / Industry / Action). */
export const CommunicationSettingsGoalsBenchmarkTableSkeleton = () => (
    <div className="pref-cs-smtp-grid pref-cs-goals-benchmark-grid">
        <GridLoadingSkeleton rows={5} columns={6} isLoading={false} wrapperClassName="p0" hideLeftBorder />
    </div>
);

/** Goals & benchmark list — add button + grid (route refresh). */
export const CommunicationSettingsGoalsBenchmarkGridSkeleton = () => (
    <CommunicationSettingsGoalsBenchmarkTableSkeleton />
);

/** Route refresh — Goals & benchmark tab (top tabs + grid). */
export const CommunicationSettingsGoalsBenchmarkRouteSkeleton = () => (
    <>
        <RSPageHeaderSkeleton
            variant="tabber"
            className="pref-subpage-header-skeleton pref-cs-page-header-skeleton"
            titleWidth={SUBPAGE_TITLE_WIDTH[PREFERENCES_SUBPAGE_VARIANT.COMMUNICATION_SETTINGS]}
            showBack
        />
        <Container fluid>
            <div className="page-content pc-communication-settings">
                <CommunicationSettingsTopTabsSkeleton tabCount={3} activeTabIndex={2} />
                <Container className="px0">
                    <div className="mt30">
                        <CommunicationSettingsGoalsBenchmarkGridSkeleton />
                    </div>
                </Container>
            </div>
        </Container>
    </>
);

/** Channel benchmark — Communication goals link + target icon (matches live top-sub-heading). */
const GoalsBenchmarkCommunicationGoalsToolbarSkeleton = () => (
    <div className="flex-row top-sub-heading pref-sk-goals-benchmark-toolbar" aria-hidden="true">
        <div className="fr flex-right tsh-icons pref-sk-goals-benchmark-toolbar__actions">
            <ul className="rs-list-group-horizontal jc-right pref-sk-goals-benchmark-toolbar__list">
                <li className="pref-sk-goals-benchmark-toolbar__item">
                    <CommonSkeleton
                        box
                        height={14}
                        width={132}
                        stopAnimation
                        mainClass="pref-sk-goals-benchmark-toolbar__label"
                    />
                    <CommonSkeleton
                        circle
                        height={32}
                        width={32}
                        stopAnimation
                        mainClass="pref-sk-goals-benchmark-toolbar__icon"
                    />
                </li>
            </ul>
        </div>
    </div>
);

const GoalsBenchmarkFieldSkeleton = ({ sm = 4 }) => (
    <Col sm={sm}>
        <div className="form-group pref-sk-field pref-sk-goals-benchmark-field">
            <CommonSkeleton
                box
                height={12}
                width={112}
                stopAnimation
                mainClass="pref-sk-label pref-sk-goals-benchmark-field__label"
            />
            <CommonSkeleton box height={32} width="100%" stopAnimation mainClass="pref-sk-goals-benchmark-field__input" />
        </div>
    </Col>
);

/** Channel benchmark create / edit — two rows of three fields (matches live form header). */
export const CommunicationSettingsGoalsBenchmarkEditFormSkeleton = () => (
    <div className="box-design pref-cs-goals-benchmark-form-skeleton" aria-hidden="true">
        <div className="form-group pref-sk-goals-benchmark-form-skeleton__row">
            <Row>
                <GoalsBenchmarkFieldSkeleton sm={4} />
                <GoalsBenchmarkFieldSkeleton sm={4} />
                <GoalsBenchmarkFieldSkeleton sm={4} />
            </Row>
        </div>
        <div className="form-group pref-sk-goals-benchmark-form-skeleton__row pref-sk-goals-benchmark-form-skeleton__row--last">
            <Row>
                <GoalsBenchmarkFieldSkeleton sm={4} />
                <GoalsBenchmarkFieldSkeleton sm={4} />
                <Col sm={4}>
                    <div className="form-group pref-sk-field pref-sk-goals-benchmark-field">
                        <CommonSkeleton
                            box
                            height={12}
                            width={80}
                            stopAnimation
                            mainClass="pref-sk-label pref-sk-goals-benchmark-field__label"
                        />
                        <CommonSkeleton
                            box
                            height={98}
                            width="100%"
                            stopAnimation
                            mainClass="pref-sk-goals-benchmark-field__textarea"
                        />
                    </div>
                </Col>
            </Row>
        </div>
    </div>
);

/** In-page gate while benchmark attributes / edit APIs load. */
export const CommunicationSettingsGoalsBenchmarkEditSkeletonGate = ({
    isLoading = false,
    isEditMode = true,
    children = null,
}) => {
    if (!shouldShowCommunicationSettingsEditSkeleton(isLoading, isEditMode)) {
        return children;
    }

    return (
        <>
            <style>{preferencesSkeletonCriticalCss}</style>
            <style>{communicationSettingsSkeletonCriticalCss}</style>
            <div className="preferences-skeleton-scope pref-cs-goals-benchmark-skeleton-scope communication-settings-goals-benchmark-skeleton">
                <CommunicationSettingsGoalsBenchmarkEditFormSkeleton />
            </div>
        </>
    );
};

CommunicationSettingsGoalsBenchmarkEditSkeletonGate.propTypes = {
    isLoading: PropTypes.bool,
    isEditMode: PropTypes.bool,
    children: PropTypes.node,
};

/** Route refresh — `/preferences/goals-and-benchmark/channel-benchmark`. */
export const GoalsBenchmarkEditRouteSkeleton = () => (
    <Container fluid>
        <div className="page-content isVerticalTabbar pref-sk-goals-benchmark-page-scope communication-settings-goals-benchmark-skeleton">
            <Container className="px0">
                <GoalsBenchmarkCommunicationGoalsToolbarSkeleton />
                <CommunicationSettingsGoalsBenchmarkEditFormSkeleton />
            </Container>
        </div>
    </Container>
);

/** Mail › SMTP — `rsv-tabs-content` › box › `tabs-right-align` › `res-tabber` › inner tabs + `res-tabs-content mt20`. */
export const CommunicationSettingsSmtpInnerContentSkeleton = ({
    showInnerTabs = true,
    showHeading = true,
    showAddAction = false,
    innerTabCount = 2,
    omitOuterRoot = false,
}) => {
    const panelBody = (
        <div
            className={`pref-cs-smtp-panel-body${showInnerTabs ? '' : ' pref-cs-smtp-panel-body--standalone'
                }`}
        >
            {showHeading ? (
                <CommunicationSettingsSmtpHeadingSkeleton showAddAction={showAddAction} />
            ) : null}
            <CommunicationSettingsSmtpTableSkeleton />
        </div>
    );

    const panel = (
        <div className="pref-cs-smtp-panel">
            {showInnerTabs ? (
                <div className="tabs-right-align pageSub_tab pref-cs-smtp-inner-tabs-shell">
                    <div className="res-tabber pref-cs-smtp-inner-tabber">
                        <ul className="pref-cs-inner-tabs res-tabs row mb0 mini list-unstyled" aria-hidden="true">
                            {Array.from({ length: innerTabCount }, (_, index) => (
                                <li
                                    key={`pref-cs-inner-tab-${index}`}
                                    className="tabDefault col-md-2 tabTransparent pref-cs-inner-tabs__item"
                                >
                                    <PrefCsSkelBar
                                        className={`pref-cs-inner-tabs__pill${index % 2 === 0
                                                ? ' pref-cs-inner-tabs__pill--narrow'
                                                : ' pref-cs-inner-tabs__pill--wide'
                                            }`}
                                    />
                                </li>
                            ))}
                        </ul>
                        <div className="res-tabs-content tabs-content mt20 pref-cs-smtp-tab-body">
                            {panelBody}
                        </div>
                    </div>
                </div>
            ) : (
                panelBody
            )}
        </div>
    );

    if (omitOuterRoot) {
        return <div aria-hidden="true">{panel}</div>;
    }

    return (
        <div className="rsv-tabs-content pref-cs-smtp-root" aria-hidden="true">
            {panel}
        </div>
    );
};

CommunicationSettingsSmtpInnerContentSkeleton.propTypes = {
    showInnerTabs: PropTypes.bool,
    showHeading: PropTypes.bool,
    showAddAction: PropTypes.bool,
    innerTabCount: PropTypes.number,
    omitOuterRoot: PropTypes.bool,
};

/** Vertical tabs + icon sub-tabs + Kendo panel — Bootstrap row matches live `rs-vertical-tabs-wrapper`. */
export const CommunicationSettingsChannelSkeleton = ({
    channel = 'mail',
    subTabCount,
    showInnerTabs: showInnerTabsProp,
}) => {
    const resolvedSubTabCount = subTabCount ?? CS_CHANNEL_SUB_TAB_COUNT[channel] ?? CS_MAIL_SUB_TAB_COUNT;
    const innerTabsVisible = useCommunicationSettingsInnerTabsSkeletonVisibility(channel);
    const showInnerTabs = showInnerTabsProp ?? innerTabsVisible;
    const showAddAction = useCommunicationSettingsAddActionSkeletonVisibility(channel);
    const innerTabCount = channel === 'notification' ? 3 : 2;

    return (
        <>
            <style>{communicationSettingsSkeletonCriticalCss}</style>
            <div className="rs-vertical-tabs-wrapper pref-cs-channel-skeleton" aria-hidden="true">
            <Row className="pref-cs-channel-row g-0 mx0">
                <Col xs="auto" className="pref-cs-vertical-col px0">
                    <ul className="pref-cs-vertical-tabs rsv-tabs-list vertical-tabs mt87 list-unstyled mb0">
                        {CS_VERTICAL_LABELS.map((label, index) => (
                            <li key={label} className="tabDefault pref-cs-vertical-tabs__item">
                                <CommonSkeleton
                                    circle
                                    height={32}
                                    width={32}
                                    stopAnimation
                                    mainClass="pref-cs-vertical-tabs__icon"
                                />
                                <CommonSkeleton
                                    box
                                    height={12}
                                    width={56}
                                    stopAnimation
                                    mainClass="pref-cs-vertical-tabs__label"
                                />
                            </li>
                        ))}
                    </ul>
                </Col>
                <Col className="pref-cs-channel-main-col px0">
                    <CommunicationSettingsSubTabsSkeleton tabCount={resolvedSubTabCount} channel={channel} />
<div
  className="tabs-content res-tabs-content pref-cs-mail-tabs-content box-design bd-top-border"
  style={{
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  }}
>                        <CommunicationSettingsSmtpInnerContentSkeleton
                            showInnerTabs={showInnerTabs}
                            showAddAction={showAddAction}
                            innerTabCount={innerTabCount}
                        />
                    </div>
                </Col>
            </Row>
        </div>
        </>
    );
};

CommunicationSettingsChannelSkeleton.propTypes = {
    channel: PropTypes.oneOf(['mail', 'messaging', 'notification']),
    subTabCount: PropTypes.number,
    showInnerTabs: PropTypes.bool,
};

/**
 * Lazy vertical channel (Email / Messaging / Notifications).
 * Matches live Mail/Messaging RSTabbar: icon sub-tabs + tabs-content (no second vertical column).
 */
const CommunicationSettingsChannelLazyFallback = ({ channel = 'mail', showInnerTabs: showInnerTabsProp }) => {
    const tabCount = CS_CHANNEL_SUB_TAB_COUNT[channel] ?? CS_MAIL_SUB_TAB_COUNT;
    const innerTabsVisible = useCommunicationSettingsInnerTabsSkeletonVisibility(channel);
    const showInnerTabs = showInnerTabsProp ?? innerTabsVisible;
    const showAddAction = useCommunicationSettingsAddActionSkeletonVisibility(channel);
    const innerTabCount = channel === 'notification' ? 3 : 2;

    return (
        <>
            <style>{communicationSettingsSkeletonCriticalCss}</style>
            <div
                className="pref-cs-channel-lazy-shell pref-cs-channel-lazy-shell--channel"
                aria-hidden="true"
            >
                <CommunicationSettingsSubTabsSkeleton tabCount={tabCount} channel={channel} />
<div
  className="tabs-content res-tabs-content pref-cs-mail-tabs-content box-design bd-top-border"
  style={{
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  }}
>                      <CommunicationSettingsSmtpInnerContentSkeleton
                        showInnerTabs={showInnerTabs}
                        showAddAction={showAddAction}
                        innerTabCount={innerTabCount}
                    />
                </div>
            </div>
        </>
    );
};

export const CommunicationSettingsMailTabLoadingBlock = () => (
    <CommunicationSettingsChannelLazyFallback channel="mail" />
);

export const CommunicationSettingsMessagingTabLoadingBlock = () => (
    <CommunicationSettingsChannelLazyFallback channel="messaging" />
);

export const CommunicationSettingsNotificationTabLoadingBlock = () => (
    <CommunicationSettingsChannelLazyFallback channel="notification" />
);

/** Lazy icon sub-tab (SMTP, Sub/Un-sub, WhatsApp, VMS, …) — full box panel under live icon sub-tabs. */
const CommunicationSettingsInnerTabLoadingBlockBody = ({
    embedded = false,
    showInnerTabs: showInnerTabsProp,
    showHeading: showHeadingProp,
    showAddAction: showAddActionProp,
}) => {
    const innerTabsFromNav = useCommunicationSettingsInnerTabsSkeletonVisibility();
    const showInnerTabs =
        !embedded && (showInnerTabsProp !== undefined ? showInnerTabsProp : innerTabsFromNav);
    const showHeading = showHeadingProp !== undefined ? showHeadingProp : true;
    const showAddAction = showAddActionProp === true;

    const skeletonPanel = (
        <CommunicationSettingsSmtpInnerContentSkeleton
            showInnerTabs={showInnerTabs}
            showHeading={showHeading}
            showAddAction={showAddAction}
            omitOuterRoot={!embedded}
        />
    );

    return (
        <>
            <style>{communicationSettingsSkeletonCriticalCss}</style>
            {embedded ? (
                <div className="pref-cs-inner-tab-skeleton-embedded">{skeletonPanel}</div>
            ) : (
                <div className="rsv-tabs-content pref-cs-inner-tab-lazy-shell" aria-hidden="true">
                    <div
                        className="box-design bd-top-border pref-cs-mail-tabs-content"
                        style={{
                            borderTopLeftRadius: 0,
                            borderTopRightRadius: 0,
                        }}
                    >
                        {skeletonPanel}
                    </div>
                </div>
            )}
        </>
    );
};

CommunicationSettingsInnerTabLoadingBlockBody.propTypes = {
    embedded: PropTypes.bool,
    showInnerTabs: PropTypes.bool,
    showHeading: PropTypes.bool,
    showAddAction: PropTypes.bool,
};

export const CommunicationSettingsInnerTabLoadingBlock = ({
    embedded = false,
    showInnerTabs,
    showHeading,
    showAddAction,
} = {}) => (
    <CommunicationSettingsInnerTabLoadingBlockBody
        embedded={embedded}
        showInnerTabs={showInnerTabs}
        showHeading={showHeading}
        showAddAction={showAddAction}
    />
);

CommunicationSettingsInnerTabLoadingBlock.propTypes = {
    embedded: PropTypes.bool,
    showInnerTabs: PropTypes.bool,
    showHeading: PropTypes.bool,
    showAddAction: PropTypes.bool,
};

const PrefCsEditFieldSkeleton = () => (
    <div className="form-group fg-default-value pref-cs-edit-field">
        <CommonSkeleton box height={32} width="100%" stopAnimation />
    </div>
);

/** Cancel / save placeholders — matches live `buttons-holder` outside `box-design`. */
export const CommunicationSettingsEditFooterSkeleton = ({ outsideBox = false } = {}) => (
    <div
        className={`buttons-holder pref-cs-edit-footer d-flex justify-content-end${outsideBox ? ' pref-cs-buttons-outside mt20' : ''
            }`}
        aria-hidden="true"
    >
        <div className="d-flex" style={{ gap: '1rem' }}>
            <CommonSkeleton box height={36} width={88} stopAnimation />
            <CommonSkeleton box height={36} width={88} stopAnimation />
        </div>
    </div>
);

const COMMUNICATION_SETTINGS_EDIT_FORM_VARIANTS = {
    default: 'default',
    messagingVendor: 'messaging-vendor',
    boxed: 'boxed',
};

const getCommunicationSettingsEditFormSkeletonClassName = (formSkeletonVariant) => {
    if (formSkeletonVariant === COMMUNICATION_SETTINGS_EDIT_FORM_VARIANTS.messagingVendor) {
        return 'pref-cs-smtp-edit-form pref-cs-edit-form--tab-panel';
    }

    if (formSkeletonVariant === COMMUNICATION_SETTINGS_EDIT_FORM_VARIANTS.boxed) {
        return 'box-design bd-top-border pref-cs-smtp-edit-form pref-cs-edit-form--boxed mt5';
    }

    return 'pref-cs-smtp-edit-form';
};

/** SMTP / messaging vendor create / edit — two-column layout matching live edit view. */
export const CommunicationSettingsSmtpEditFormSkeleton = ({
    formSkeletonVariant = COMMUNICATION_SETTINGS_EDIT_FORM_VARIANTS.default,
} = {}) => (
    <div
        className={getCommunicationSettingsEditFormSkeletonClassName(formSkeletonVariant)}
        aria-hidden="true"
    >
        <Row className="mt5">
            <Col sm={6}>
                <div className="rs-sub-heading pref-cs-edit-heading">
                    <CommonSkeleton box height={18} width={56} stopAnimation />
                </div>
                {Array.from({ length: 8 }, (_, index) => (
                    <PrefCsEditFieldSkeleton key={`smtp-left-${index}`} />
                ))}
            </Col>
            <Col sm={6}>
                <div className="rs-sub-heading pref-cs-edit-heading">
                    <CommonSkeleton box height={18} width={120} stopAnimation />
                </div>
                {Array.from({ length: 5 }, (_, index) => (
                    <PrefCsEditFieldSkeleton key={`smtp-right-${index}`} />
                ))}
                <div className="form-group fg-default-value pref-cs-edit-validate-row mt33">
                    <CommonSkeleton box height={36} width={140} stopAnimation />
                </div>
            </Col>
        </Row>
    </div>
);

/** Replaces form while edit APIs load (same pattern as AuthoringChannelEditSkeletonGate). */
export const CommunicationSettingsEditSkeletonGate = ({
    isLoading = false,
    isEditMode = true,
    actionsPortalId = null,
    buttonsOutsideBox = false,
    formSkeletonVariant = COMMUNICATION_SETTINGS_EDIT_FORM_VARIANTS.default,
    children = null,
}) => {
    const [actionsPortalTarget, setActionsPortalTarget] = useState(null);
    const isBoxedVariant = formSkeletonVariant === COMMUNICATION_SETTINGS_EDIT_FORM_VARIANTS.boxed;
    const footerOutsideBox = Boolean(actionsPortalId || buttonsOutsideBox || isBoxedVariant);

    useEffect(() => {
        if (!actionsPortalId) {
            setActionsPortalTarget(null);
            return undefined;
        }

        setActionsPortalTarget(document.getElementById(actionsPortalId));

        return () => {
            setActionsPortalTarget(null);
        };
    }, [actionsPortalId]);

    if (!shouldShowCommunicationSettingsEditSkeleton(isLoading, isEditMode)) {
        if (children == null || children === false) return null;
        return <>{children}</>;
    }

    const footerSkeleton = (
        <CommunicationSettingsEditFooterSkeleton outsideBox={footerOutsideBox} />
    );
    const portaledFooter =
        actionsPortalTarget ? createPortal(footerSkeleton, actionsPortalTarget) : null;
    const inlineFooter = !actionsPortalTarget && !footerOutsideBox ? footerSkeleton : null;
    const siblingFooter = !actionsPortalTarget && footerOutsideBox ? footerSkeleton : null;

    return (
        <>
            <style>{preferencesSkeletonCriticalCss}</style>
            <style>{communicationSettingsSkeletonCriticalCss}</style>
            <div className="preferences-skeleton-scope pref-cs-edit-skeleton-scope communication-settings-edit-skeleton box-design">
                <CommunicationSettingsSmtpEditFormSkeleton formSkeletonVariant={formSkeletonVariant} />
                {inlineFooter}
            </div>
            {siblingFooter}
            {portaledFooter}
        </>
    );
};

CommunicationSettingsEditSkeletonGate.propTypes = {
    isLoading: PropTypes.bool,
    isEditMode: PropTypes.bool,
    actionsPortalId: PropTypes.string,
    buttonsOutsideBox: PropTypes.bool,
    formSkeletonVariant: PropTypes.oneOf([
        COMMUNICATION_SETTINGS_EDIT_FORM_VARIANTS.default,
        COMMUNICATION_SETTINGS_EDIT_FORM_VARIANTS.messagingVendor,
        COMMUNICATION_SETTINGS_EDIT_FORM_VARIANTS.boxed,
    ]),
};

/** SMTP › Domain tab — create / edit (domain name + volume per day). */
export const CommunicationSettingsDomainFormSkeleton = () => (
    <>
        <div className="box-design bd-top-border pref-cs-domain-form-skeleton" aria-hidden="true">
            <div className="SMTP-grouping-block">
                <div className="rs-sub-heading pref-cs-edit-heading">
                    <CommonSkeleton box height={18} width={140} stopAnimation />
                </div>
                <div className="form-group">
                    <Row>
                        <Col sm={6}>
                            <CommonSkeleton box height={32} width="100%" stopAnimation />
                        </Col>
                        <Col sm={6}>
                            <CommonSkeleton box height={32} width="100%" stopAnimation />
                        </Col>
                    </Row>
                </div>
            </div>
        </div>
        <div className="buttons-holder pref-cs-domain-form-footer d-flex justify-content-end">
            <div className="d-flex" style={{ gap: '1rem' }}>
                <CommonSkeleton box height={36} width={88} stopAnimation />
                <CommonSkeleton box height={36} width={120} stopAnimation />
            </div>
        </div>
    </>
);

/** Domain create / edit — inline skeleton while restoreDomainName loads (edit). */
export const CommunicationSettingsDomainEditSkeletonGate = ({
    isLoading = false,
    isEditMode = true,
    children = null,
}) => {
    if (!shouldShowCommunicationSettingsEditSkeleton(isLoading, isEditMode)) {
        return children;
    }

    return (
        <>
            <style>{preferencesSkeletonCriticalCss}</style>
            <style>{communicationSettingsSkeletonCriticalCss}</style>
            <div className="preferences-skeleton-scope pref-cs-domain-skeleton-scope communication-settings-domain-skeleton">
                <CommunicationSettingsDomainFormSkeleton />
            </div>
        </>
    );
};

CommunicationSettingsDomainEditSkeletonGate.propTypes = {
    isLoading: PropTypes.bool,
    isEditMode: PropTypes.bool,
    children: PropTypes.node,
};

/** Web push › Goal settings create / edit (goal name + tracking rows). */
export const CommunicationSettingsWebGoalFormSkeleton = () => (
    <div className="box-design bd-top-border pref-cs-web-goal-form-skeleton" aria-hidden="true">
        <div className="rs-sub-heading pref-cs-edit-heading mb20">
            <CommonSkeleton box height={22} width={120} stopAnimation />
        </div>
        <Row>
            <Col sm={6}>
                <PrefCsEditFieldSkeleton />
            </Col>
        </Row>
        <div className="mt20 mb10">
            <CommonSkeleton box height={18} width={140} stopAnimation />
        </div>
        {Array.from({ length: 3 }, (_, index) => (
            <Row key={`web-goal-row-${index}`} className="align-items-center mb15">
                <Col sm={4}>
                    <PrefCsEditFieldSkeleton />
                </Col>
                <Col sm={4}>
                    <PrefCsEditFieldSkeleton />
                </Col>
                <Col sm={3}>
                    <PrefCsEditFieldSkeleton />
                </Col>
                <Col sm={1} className="d-flex justify-content-end">
                    <CommonSkeleton circle width={32} height={32} stopAnimation />
                </Col>
            </Row>
        ))}
        <div className="buttons-holder pref-cs-edit-footer d-flex justify-content-end mt20">
            <div className="d-flex" style={{ gap: '1rem' }}>
                <CommonSkeleton box height={36} width={88} stopAnimation />
                <CommonSkeleton box height={36} width={72} stopAnimation />
            </div>
        </div>
    </div>
);

const PushPermissionsSectionHeaderSkeleton = ({ titleWidth = 100 }) => (
    <div className="clearfix mt30 mb10 pref-cs-push-permissions-section-head">
        <CommonSkeleton box height={18} width={titleWidth} stopAnimation mainClass="float-start" />
        <CommonSkeleton circle width={20} height={20} stopAnimation mainClass="float-end mt-2" />
    </div>
);

const PushPermissionsAttributesSkeleton = () => (
    <div className="tag-list-block box-design no-box-shadow pref-cs-push-permissions-attributes">
        <div>
            <div className="d-flex align-items-center mb10">
                <CommonSkeleton box height={14} width={56} stopAnimation />
                <CommonSkeleton box height={18} width={24} stopAnimation mainClass="ms-2 badge-round" />
            </div>
            <ul className="rs-attr-sep css-scrollbar mb8 list-unstyled pref-cs-push-permissions-attr-list">
                {Array.from({ length: 10 }, (_, i) => (
                    <li key={`def-${i}`}>
                        <CommonSkeleton box height={12} width={`${52 + (i % 4) * 12}%`} stopAnimation />
                    </li>
                ))}
            </ul>
            <div className="d-flex align-items-center mb10">
                <CommonSkeleton box height={14} width={72} stopAnimation />
                <CommonSkeleton box height={18} width={24} stopAnimation mainClass="ms-2 badge-round" />
            </div>
            <CommonSkeleton box height={48} width="100%" stopAnimation />
        </div>
    </div>
);

const PushPermissionsEventsSkeleton = () => (
    <div className="tag-list-block box-design no-box-shadow pref-cs-push-permissions-events">
        <CommonSkeleton box height={80} width="100%" stopAnimation />
    </div>
);

const PushPermissionsInboxSkeleton = () => (
    <>
        <div className="clearfix mt30 mb10 pref-cs-push-permissions-section-head">
            <CommonSkeleton box height={18} width={160} stopAnimation mainClass="float-start" />
            <CommonSkeleton box height={28} width={52} stopAnimation mainClass="float-end" />
        </div>
        <div className="mb30 mt30 no-box-shadow pref-cs-push-permissions-inbox">
            <CommonSkeleton box height={72} width="100%" stopAnimation />
        </div>
    </>
);

/** Web / mobile push permissions — matches live pushPermissions panel layout. */
export const CommunicationSettingsWebPermissionsSkeleton = ({ permissionRowCount = 12 } = {}) => (
    <div className="rs-table-with-heading mt20 pref-cs-push-permissions-page" aria-hidden="true">
        <div className="rs-kendo-table-hide-header rskt-width-90-10 pushPermissions pref-cs-push-permissions-panel">
            <h3 className="mb15 pref-cs-push-permissions-page-title">
                <CommonSkeleton box height={22} width={200} stopAnimation />
            </h3>
            <div className="app-permission-value pref-cs-push-permissions-grid-wrap">
                <div className="rs-grid-border-radius">
                    <table className="pref-cs-push-permissions-table w-100" cellPadding={0} cellSpacing={0}>
                        <tbody>
                            {Array.from({ length: permissionRowCount }, (_, index) => (
                                <tr
                                    key={`perm-row-${index}`}
                                    className={index % 2 === 1 ? 'pref-cs-push-permissions-row--alt' : ''}
                                >
                                    <td className="pref-cs-push-permissions-label">
                                        <CommonSkeleton
                                            box
                                            height={14}
                                            width={`${42 + (index % 5) * 8}%`}
                                            stopAnimation
                                        />
                                    </td>
                                    <td className="border-start text-right pref-cs-push-permissions-action">
                                        <CommonSkeleton
                                            box
                                            height={24}
                                            width={44}
                                            stopAnimation
                                            mainClass="d-inline-block pref-cs-push-permissions-toggle"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <Row className="mx-0">
                <Col md={6}>
                    <PushPermissionsSectionHeaderSkeleton titleWidth={100} />
                    <PushPermissionsAttributesSkeleton />
                </Col>
                <Col md={6}>
                    <PushPermissionsSectionHeaderSkeleton titleWidth={72} />
                    <PushPermissionsEventsSkeleton />
                </Col>
                <Col md={12}>
                    <PushPermissionsInboxSkeleton />
                </Col>
            </Row>
        </div>
        <div className="buttons-holder pref-cs-buttons-outside pref-cs-push-permissions-footer d-flex justify-content-end gap-3">
            <CommonSkeleton box height={36} width={88} stopAnimation />
            <CommonSkeleton box height={36} width={72} stopAnimation />
        </div>
    </div>
);

CommunicationSettingsWebPermissionsSkeleton.propTypes = {
    permissionRowCount: PropTypes.number,
};

export const CommunicationSettingsWebGoalEditSkeletonGate = ({
    isLoading = false,
    isEditMode = true,
    children = null,
}) => {
    if (!shouldShowCommunicationSettingsEditSkeleton(isLoading, isEditMode)) {
        return children;
    }

    return (
        <>
            <style>{preferencesSkeletonCriticalCss}</style>
            <style>{communicationSettingsSkeletonCriticalCss}</style>
            <div className="preferences-skeleton-scope pref-cs-web-goal-skeleton-scope">
                <CommunicationSettingsWebGoalFormSkeleton />
            </div>
        </>
    );
};

CommunicationSettingsWebGoalEditSkeletonGate.propTypes = {
    isLoading: PropTypes.bool,
    isEditMode: PropTypes.bool,
    children: PropTypes.node,
};

/** In-page gate while GetWebPushSettings / GetMobilePushSettings loads (not edit-only). */
export const CommunicationSettingsWebPermissionsSkeletonGate = ({
    isLoading = false,
    isEditMode: _isEditMode = false,
    children = null,
}) => {
    if (!isLoading) {
        return children;
    }

    return (
        <>
            <style>{preferencesSkeletonCriticalCss}</style>
            <style>{communicationSettingsSkeletonCriticalCss}</style>
            <div className="preferences-skeleton-scope pref-cs-push-permissions-skeleton-scope pref-cs-web-permissions-skeleton-scope">
                <CommunicationSettingsWebPermissionsSkeleton />
            </div>
        </>
    );
};

CommunicationSettingsWebPermissionsSkeletonGate.propTypes = {
    isLoading: PropTypes.bool,
    isEditMode: PropTypes.bool,
    children: PropTypes.node,
};

const isCommunicationSubscriptionSubscribePath = (pathname = '') =>
    /\/communication-settings\/subscribe$/i.test((pathname || '').replace(/\/$/, ''));

/** Subscribe / Unsubscribe create-edit form — logo column + fields + optional advanced tabs. */
export const CommunicationSubscriptionFormSkeleton = ({ showAdvancedTabs = true }) => (
    <div className="box-design rs-box py40 pref-cs-subscription-form-skeleton" aria-hidden="true">
        <Row>
            <Col md={3} sm={4} xs={12} className="accountsetup-image-upload">
                <div className="pref-cs-subscription-logo-skeleton d-flex flex-column align-items-center">
                    <CommonSkeleton circle width={120} height={120} stopAnimation />
                    <CommonSkeleton box height={52} width="100%" stopAnimation mainClass="mt30" />
                </div>
            </Col>
            <Col md={9} sm={8} xs={12} className="box-left-border pb10 accountsetup-contact-info">
                <CommonSkeleton box height={32} width="100%" stopAnimation />
                <CommonSkeleton box height={200} width="100%" stopAnimation mainClass="mt20" />
                <Row className="mt20">
                    {Array.from({ length: 4 }, (_, index) => (
                        <Col sm={6} key={index}>
                            <CommonSkeleton box height={32} width="100%" stopAnimation mainClass="mt20" />
                        </Col>
                    ))}
                </Row>
                <div className="pref-cs-subscription-terms-row d-flex align-items-center gap-3 mt20">
                    <CommonSkeleton box height={28} width={180} stopAnimation />
                    <CommonSkeleton box height={24} width={44} stopAnimation />
                </div>
                <CommonSkeleton box height={56} width="100%" stopAnimation mainClass="mt20" />
                {showAdvancedTabs ? (
                    <>
                        <ul className="pref-cs-subscription-inner-tabs list-unstyled d-flex gap-3 mt40 mb20">
                            <CommonSkeleton box height={16} width={100} stopAnimation />
                            <CommonSkeleton box height={16} width={120} stopAnimation />
                        </ul>
                        <CommonSkeleton box height={32} width="40%" stopAnimation />
                        <CommonSkeleton box height={44} width="100%" stopAnimation mainClass="mt15" />
                        <CommonSkeleton box height={220} width="100%" stopAnimation mainClass="mt15" />
                    </>
                ) : null}
            </Col>
        </Row>
        <div className="buttons-holder pref-cs-subscription-footer d-flex justify-content-end gap-3 mt30">
            <CommonSkeleton box height={36} width={88} stopAnimation />
            <CommonSkeleton box height={36} width={96} stopAnimation />
            <CommonSkeleton box height={36} width={88} stopAnimation />
        </div>
    </div>
);

CommunicationSubscriptionFormSkeleton.propTypes = {
    showAdvancedTabs: PropTypes.bool,
};

/** Route refresh — subscribe / unsubscribe create-edit page. */
export const CommunicationSubscriptionRouteSkeleton = () => {
    const { pathname } = useLocation();
    const isSubscription = isCommunicationSubscriptionSubscribePath(pathname);

    return (
        <>
            <RSPageHeaderSkeleton
                variant="tabber"
                className="pref-subpage-header-skeleton pref-cs-subscription-header-skeleton"
                titleWidth={isSubscription ? 200 : 220}
                showBack
            />
            <Container className="page-content px0 mt21">
                <CommunicationSubscriptionFormSkeleton showAdvancedTabs={isSubscription} />
            </Container>
        </>
    );
};

/** In-page gate while dropdowns + edit APIs load (edit only; create uses field loaders). */
export const CommunicationSubscriptionEditSkeletonGate = ({
    isLoading = false,
    isEditMode = true,
    isSubscription = true,
    children = null,
}) => {
    if (!shouldShowCommunicationSettingsEditSkeleton(isLoading, isEditMode)) {
        return children;
    }

    return (
        <>
            <style>{preferencesSkeletonCriticalCss}</style>
            <style>{communicationSubscriptionSkeletonCriticalCss}</style>
            <div className="preferences-skeleton-scope pref-cs-subscription-skeleton-scope communication-subscription">
                <CommunicationSubscriptionFormSkeleton showAdvancedTabs={isSubscription} />
            </div>
        </>
    );
};

CommunicationSubscriptionEditSkeletonGate.propTypes = {
    isLoading: PropTypes.bool,
    isEditMode: PropTypes.bool,
    isSubscription: PropTypes.bool,
    children: PropTypes.node,
};

const CommunicationSubscriptionBodySkeleton = () => <CommunicationSubscriptionRouteSkeleton />;

/** Route refresh — web / mobile push permissions (Settings header + permission toggles layout). */
export const CommunicationPushPermissionsRouteSkeleton = () => (
    <>
        <RSPageHeaderSkeleton
            variant="tabber"
            className="pref-subpage-header-skeleton pref-cs-push-permissions-header-skeleton"
            titleWidth={SUBPAGE_TITLE_WIDTH[PREFERENCES_SUBPAGE_VARIANT.COMMUNICATION_PUSH_PERMISSIONS]}
            showBack
        />
        <Container className="page-content px0 alertsAndNotificationCSS">
            <CommunicationSettingsWebPermissionsSkeleton />
        </Container>
    </>
);

const CommunicationPushPermissionsBodySkeleton = () => <CommunicationPushPermissionsRouteSkeleton />;

/** @deprecated Use channel-specific tab loading blocks; kept for any stale imports. */
export const CommunicationSettingsChannelLoadingBlock = CommunicationSettingsMailTabLoadingBlock;

/**
 * Single reusable Communication settings layout skeleton (route refresh + in-page gate).
 * Matches live page: RSPageHeader + RSTabbarFluid (3 tabs) + vertical channel + icon sub-tabs + grid.
 */
export const CommunicationSettingsRouteSkeleton = ({ channel = 'mail' }) => (
    <>
        <style>{communicationSettingsSkeletonCriticalCss}</style>
        <RSPageHeaderSkeleton
            variant="tabber"
            className="pref-subpage-header-skeleton pref-cs-page-header-skeleton"
            titleWidth={SUBPAGE_TITLE_WIDTH[PREFERENCES_SUBPAGE_VARIANT.COMMUNICATION_SETTINGS]}
            showBack
        />
        <Container fluid>
            <div className="page-content pc-communication-settings">
                <CommunicationSettingsTopTabsSkeleton tabCount={3} />
                <Container className="px0">
                    <div className="mt30">
                        <CommunicationSettingsChannelSkeleton channel={channel} />
                    </div>
                </Container>
            </div>
        </Container>
    </>
);

CommunicationSettingsRouteSkeleton.propTypes = {
    channel: PropTypes.oneOf(['mail', 'messaging', 'notification']),
};

const CommunicationSettingsBodySkeleton = () => {
    const { search } = useLocation();
    const tabIndex = getCommunicationSettingsTabIndex(search);

    useLayoutEffect(() => {
        beginCommunicationSettingsRouteSkeleton();
    }, []);

    if (tabIndex === 1) {
        return <CommunicationSettingsFrequencyCapRouteSkeleton />;
    }

    if (tabIndex === 2) {
        return <CommunicationSettingsGoalsBenchmarkRouteSkeleton />;
    }

    return <CommunicationSettingsRouteSkeleton channel="mail" />;
};

/** Consumption channel detail — SMS row + full-width Kendo grid (matches Channels/index + Sms.jsx). */
export const ConsumptionChannelPageSkeleton = () => (
    <div className="pref-consumption-channel-page-skeleton position-relative" aria-hidden="true">
        <Row className="mb10 align-items-center consumptionEmail">
            <Col md={5} className="d-flex align-items-center">
                <h3 className="d-flex align-items-center mb0">
                    <CommonSkeleton box height={22} width={56} stopAnimation />
                    <small className="color-primary-grey ml10 position-relative top1">
                        <CommonSkeleton box height={14} width={200} stopAnimation />
                    </small>
                </h3>
            </Col>
            <Col md={7}>
                <ul className="rs-list-group-horizontal float-end list-unstyled m0 p0 d-flex align-items-center">
                    <li className="ml15">
                        <CommonSkeleton box height={32} width={200} stopAnimation />
                    </li>
                    <li className="ml15">
                        <CommonSkeleton circle width={32} height={32} stopAnimation />
                    </li>
                </ul>
            </Col>
        </Row>
        <div className="rs-kendo-grid-table mb70">
            <div className="rs-kendo-scrollable-grid">
                <GridLoadingSkeleton rows={10} columns={7} isConsumption isLoading wrapperClassName="m0" />
            </div>
        </div>
    </div>
);

/** Consumptions — bandwidth gauge + data storage + channel grid (route refresh / gate). */
export const ConsumptionsPageSkeleton = () => (
    <div className="position-relative pref-consumptions-page-skeleton" aria-hidden="true">
        <Row>
            <Col sm={6}>
                <div className="portlet-container portlet-md">
                    <div className="portlet-header">
                        <h4>Bandwidth</h4>
                    </div>
                    <div className="portlet-body">
                        <div className="portlet-chart">
                            <MeterSkeletonColored />
                        </div>
                    </div>
                </div>
            </Col>
            <Col sm={6}>
                <div className="portlet-container portlet-md">
                    <div className="portlet-header">
                        <h4>Data storage</h4>
                    </div>
                    <div className="portlet-body">
                        <div className="portlet-chart">
                            <DataStorageSkeleton />
                        </div>
                    </div>
                </div>
            </Col>
        </Row>
        <div className="top-sub-heading mb10">
            <h3 className="d-flex align-items-center gap-2">
                Consumption status
                <small>
                    <CommonSkeleton box height={14} width={200} stopAnimation />
                </small>
            </h3>
        </div>
        <Row className="position-relative">
            <Col>
                <ConsumptionsChannelSkeleton count={12} />
            </Col>
        </Row>
    </div>
);

/** New / edit attribute modal — form field placeholders. */
export const NewAttributeModalFormSkeleton = () => (
    <div className="pref-new-attribute-modal-skeleton" aria-hidden="true">
        <div className="form-group">
            <CommonSkeleton box height={24} width="100%" stopAnimation />
        </div>
        <div className="form-group">
            <CommonSkeleton box height={98} width="100%" stopAnimation />
            <CommonSkeleton box height={15} width={140} stopAnimation mainClass="mt5" />
        </div>
        <Row>
            <Col sm={6}>
                <div className="form-group mb21">
                    <CommonSkeleton box height={24} width="100%" stopAnimation />
                </div>
            </Col>
            <Col sm={6}>
                <div className="form-group mb21">
                    <CommonSkeleton box height={24} width="100%" stopAnimation />
                </div>
            </Col>
        </Row>
        <div className="form-group mb21">
            <CommonSkeleton box height={24} width="100%" stopAnimation />
        </div>
        <div className="form-group mb21">
            <CommonSkeleton box height={24} width="100%" stopAnimation />
        </div>
        <div className="form-group mb21">
            <CommonSkeleton box height={32} width="100%" stopAnimation />
        </div>
        <div className="form-group mb21">
            <CommonSkeleton box height={24} width="100%" stopAnimation />
        </div>
        <div className="buttons-holder  d-flex justify-content-end gap-3">
            <CommonSkeleton box width={80} height={36} stopAnimation />
            <CommonSkeleton box width={80} height={36} stopAnimation />
        </div>
    </div>
);

/** Discover published offers — search filters + offer card grid. */
export const DiscoverOffersSkeleton = () => (
    <>
        <Row className="align-items-center justify-content-between offers-search-filters form-group pref-discover-offers-filters">
            <Col>
                <CommonSkeleton box height={32} width="100%" stopAnimation />
            </Col>
            <Col>
                <CommonSkeleton box height={32} width="100%" stopAnimation />
            </Col>
        </Row>
        <div className="offerWrapper d-flex flex-wrap pref-discover-offers-grid" aria-hidden="true">
            {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="offer-card pref-discover-offer-card-skeleton">
                    <CommonSkeleton box height={180} width="100%" stopAnimation mainClass="pref-sk-offer-image" />
                    <div className="offer-card-body">
                        <div className="offer-card-body-inner">
                            <CommonSkeleton box height={20} width="72%" stopAnimation mainClass="mb-2" />
                            <div className="d-flex flex-wrap gap-2 mb-2">
                                <CommonSkeleton box height={22} width={64} stopAnimation />
                                <CommonSkeleton box height={22} width={80} stopAnimation />
                            </div>
                            <CommonSkeleton box height={14} width="100%" stopAnimation mainClass="mb-1" />
                            <CommonSkeleton box height={14} width="92%" stopAnimation mainClass="mb-1" />
                            <CommonSkeleton box height={14} width="78%" stopAnimation />
                        </div>
                        <div className="offer-card-footer d-flex align-items-center justify-content-end gap-2">
                            <CommonSkeleton box width={72} height={36} stopAnimation />
                            <CommonSkeleton box width={72} height={36} stopAnimation />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </>
);

/** Create / edit shop — matches CreateShop form card. */
export const CreateShopFormSkeleton = () => (
    <>
        <div className="box-design rs-box py40 pref-create-shop-skeleton">
            <OfferEntityFormRowSkeleton variant="single" />
            <OfferEntityFormRowSkeleton variant="dual" />
            <OfferEntityFormRowSkeleton variant="browse" />
            <OfferEntityFormRowSkeleton variant="textarea" />
            <OfferEntityFormRowSkeleton variant="triple" />
            <OfferEntityFormRowSkeleton variant="triple" />
            <OfferEntityFormRowSkeleton variant="single" />
            <OfferEntityFormRowSkeleton variant="triple" />
            <OfferEntityFormRowSkeleton variant="dual" />
        </div>
        <div className="buttons-holder pref-sk-create-shop-actions">
            <CommonSkeleton box width={80} height={36} stopAnimation />
            <CommonSkeleton box width={72} height={36} stopAnimation />
        </div>
    </>
);

/** Create / edit offer — Basic details horizontal form + footer actions. */
export const CreateOfferFormSkeleton = () => (
    <>
        <div className="box-design rs-box create-offer-section p0 mt0 pref-create-offer-skeleton">
            <h4 className="border-bottom mb19 pb13 pt19 px19 pref-sk-create-offer-title" aria-hidden="true">
                <CommonSkeleton box height={20} width={110} stopAnimation />
            </h4>
            <div className="border-0 box-design no-box-shadow">
                <CreateOfferLabelFieldRow />
                <CreateOfferLabelFieldRow />
                <CreateOfferLabelFieldRow dual />
                <CreateOfferLabelFieldRow dual />
                <CreateOfferLabelFieldRow dual />
                <CreateOfferLabelFieldRow dual />
                <CreateOfferLabelFieldRow />
            </div>
        </div>
        <div className="buttons-holder pref-sk-create-offer-actions">
            <CommonSkeleton box width={80} height={36} stopAnimation />
            <CommonSkeleton box width={88} height={36} stopAnimation />
            <CommonSkeleton box width={72} height={36} stopAnimation />
        </div>
    </>
);

/** Offer listing tab — matches live `OfferListing` (`page-content` + toolbar + grid). */
export const OfferListingTabSkeleton = ({ flushToolbar = false }) => (
    <div className="page-content">
        <div
            className={`flex-row justify-content-end top-sub-heading pref-sk-offer-toolbar${flushToolbar ? ' pref-sk-offer-toolbar--flush mt0' : ''}`}
        >
            <ul className="rs-list-group-horizontal jc-right d-flex align-items-center gap-2 list-unstyled m0 p0">
                <li>
                    <CommonSkeleton box width={220} height={24} stopAnimation />
                </li>
                <li>
                    <CommonSkeleton circle width={24} height={24} stopAnimation />
                </li>
                <li>
                    <CommonSkeleton circle width={24} height={24} stopAnimation />
                </li>
                <li>
                    <CommonSkeleton circle width={24} height={24} stopAnimation />
                </li>
            </ul>
        </div>
        <div className="pref-offer-grid-skeleton offer-management">
            <GridLoadingSkeleton
                rows={5}
                columns={8}
                isLoading={false}
                wrapperClassName="p0"
                hideLeftBorder
            />
        </div>
    </div>
);

OfferListingTabSkeleton.propTypes = {
    flushToolbar: PropTypes.bool,
};

/** Brands & shops tab — toolbar + stacked brand cards (`BrandsShops.jsx`). */
export const BrandsShopsTabSkeleton = () => (
    <div className="page-content">
        <div className="flex-row justify-content-end top-sub-heading pref-sk-offer-brands-toolbar">
            <ul className="rs-list-group-horizontal jc-right d-flex align-items-center gap-2 list-unstyled m0 p0">
                <li>
                    <CommonSkeleton circle width={32} height={32} stopAnimation />
                </li>
                <li>
                    <CommonSkeleton circle width={32} height={32} stopAnimation />
                </li>
            </ul>
        </div>
        <div className="mt21 pref-offer-brands-skeleton">
            <SkeletonBrandShops count={5} isLoading={false} />
        </div>
    </div>
);

export const OfferManagementTabBodySkeleton = ({ tabIndex = 0 }) => {
    if (tabIndex === 1) {
        return <BrandsShopsTabSkeleton />;
    }
    return <OfferListingTabSkeleton />;
};

OfferManagementTabBodySkeleton.propTypes = {
    tabIndex: PropTypes.number,
};

/** Offer management — RSTabbarFluid layout (tab strip + `Container px0` tab panel). */
export const OfferManagementSkeleton = ({ tabIndex = 0 }) => (
    <>
        <TabBarViewSkeleton
            tabCount={2}
            colClass="col-md-6"
            activeTabIndex={tabIndex}
            scopeClass="pref-offer-tabs-skeleton"
            tabsRowClass="rs-tabs row rst-left-space mb0 mini w-100 m-0"
            containerClass="pref-offer-tabs-skeleton__container p0"
            wrapperClassName="fullWhiteBackground pref-offer-tabs-strip-skeleton w-100 mb0"
            omitColClass={false}
        />
        <Container className="px0">
            <OfferManagementTabBodySkeleton tabIndex={tabIndex} />
        </Container>
    </>
);

OfferManagementSkeleton.propTypes = {
    tabIndex: PropTypes.number,
};

/** Invoice list — 7-column Kendo grid (subscription / consumables tabs). */
export const InvoiceListGridSkeleton = ({ rows = 5 } = {}) => (
    <div className="pref-invoice-grid-skeleton rs-kendo-list-table" aria-hidden="true">
        <GridLoadingSkeleton
            rows={rows}
            columns={7}
            isLoading={false}
            wrapperClassName="p0"
            hideLeftBorder
        />
    </div>
);

InvoiceListGridSkeleton.propTypes = {
    rows: PropTypes.number,
};

/** Route refresh — tab strip + grid panel (matches `Invoices` + `SubscriptionInvoice`). */
export const InvoiceListSkeleton = () => (
    <>
        <TabBarViewSkeleton
            tabCount={2}
            colClass="col-sm-6"
            activeTabIndex={0}
            scopeClass="pref-invoice-tabs-skeleton"
            tabsRowClass="rs-tabs row rst-left-space mb0 mini w-100 m-0"
            containerClass="pref-invoice-tabs-skeleton__container p0"
            wrapperClassName="w-100 mb0"
            omitColClass={false}
        />
        <Container className="page-content px0 mt-50">
            <InvoiceListGridSkeleton rows={5} />
        </Container>
    </>
);

/** Users list body — toolbar, grid, pager (in-page loading). */
export const UsersListSkeleton = () => (
    <>
        <div className="flex-row mt0 top-sub-heading pref-sk-users-toolbar">
            <div className="fr flex-left" />
            <ul className="rs-list-group-horizontal jc-right d-flex align-items-center list-unstyled m0 p0">
                <li>
                    <CommonSkeleton circle width={32} height={32} stopAnimation />
                </li>
                <li>
                    <CommonSkeleton circle width={32} height={32} stopAnimation />
                </li>
            </ul>
        </div>
        <div className="pref-users-grid-skeleton rs-userListing-grid">
            <GridLoadingSkeleton
                rows={5}
                columns={7}
                isLoading={false}
                wrapperClassName="p0"
                hideLeftBorder
            />
        </div>
    </>
);

const ROLES_PERM_CRUD_LABELS = ['Create', 'Read', 'Update', 'Delete'];

const PrefRolesPermSkelBar = ({ className = '', stopAnimation = false }) => (
    <div
        className={`pref-roles-perm-sk-bar ${className}${stopAnimation ? ' pref-roles-perm-sk-bar--static' : ''}`.trim()}
        aria-hidden="true"
    />
);

const getRolesPermCrudLabelClass = (label) =>
    label.length > 5 ? 'pref-roles-perm-sk-crud-label--long' : 'pref-roles-perm-sk-crud-label--short';

/** Roles add/edit permissions — role name + privileges table + actions. */
export const RolesPermissionsEditFormSkeleton = ({ rowCount = 12, showNoData = false }) => {
    const freeze = showNoData;

    return (
        <>
            <div
                className={`pref-roles-perm-edit-skeleton-wrap${showNoData ? ' pref-subpage-skeleton-panel--no-data' : ''
                    }`}
            >
                <div className="pref-sk-panel-body">
                    <div className="box-design">
                        <div className="form-group m0 ">
                            <Row className="align-items-center">
                                <Col sm={5} className="text-right">
                                    <PrefRolesPermSkelBar className="pref-roles-perm-sk-label" stopAnimation={freeze} />
                                </Col>
                                <Col sm={4}>
                                    <PrefRolesPermSkelBar className="pref-roles-perm-sk-input" stopAnimation={freeze} />
                                </Col>
                            </Row>
                        </div>
                    </div>
                    <div
                        className="rs-table-wrapper roles-permissions-access-table mt20 pref-roles-permissions-table-skeleton"
                        aria-hidden="true"
                    >
                        <table width="100%" cellPadding="0" cellSpacing="0">
                            <thead>
                                <tr>
                                    <th>Access privileges</th>
                                    <th colSpan="4" className="no-border-left text-right">
                                        <div className="pref-sk-perm-check-all">
                                            <PrefRolesPermSkelBar
                                                className="pref-roles-perm-sk-checkbox pref-roles-perm-sk-checkbox--header"
                                                stopAnimation={freeze}
                                            />
                                            <span className="ml5">Check all</span>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: rowCount }, (_, rowIndex) => (
                                    <tr key={rowIndex}>
                                        <td>
                                            <PrefRolesPermSkelBar
                                                className={`pref-roles-perm-sk-title pref-roles-perm-sk-title--${rowIndex % 4}`}
                                                stopAnimation={freeze}
                                            />
                                        </td>
                                        {ROLES_PERM_CRUD_LABELS.map((label) => (
                                            <td key={label}>
                                                <div className="pref-sk-perm-crud-cell">
                                                    <PrefRolesPermSkelBar
                                                        className="pref-roles-perm-sk-checkbox"
                                                        stopAnimation={freeze}
                                                    />
                                                    <PrefRolesPermSkelBar
                                                        className={`pref-roles-perm-sk-crud-label ${getRolesPermCrudLabelClass(label)}`}
                                                        stopAnimation={freeze}
                                                    />
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                {showNoData ? <PrefSubPageNoDataOverlay /> : null}
            </div>
            <div className="buttons-holder pref-sk-roles-perm-actions">
                <PrefRolesPermSkelBar className="pref-roles-perm-sk-btn" stopAnimation={freeze} />
                <PrefRolesPermSkelBar className="pref-roles-perm-sk-btn" stopAnimation={freeze} />
            </div>
        </>
    );
};

RolesPermissionsEditFormSkeleton.propTypes = {
    rowCount: PropTypes.number,
    showNoData: PropTypes.bool,
};

/** Roles list — add toolbar + 2-column Kendo grid (User role / Actions). */
export const RolesListSkeleton = () => (
    <>
        <div className="flex-row mt0 top-sub-heading pref-sk-roles-toolbar">
            <div className="fr flex-right tsh-icons" />
            <ul className="rs-list-group-horizontal jc-right d-flex align-items-center gap-2 list-unstyled m0 p0">
                <li>
                    <CommonSkeleton circle width={32} height={32} stopAnimation />
                </li>
            </ul>
        </div>
        <div className="pref-roles-grid-skeleton rs-rolesListing-grid">
            <GridLoadingSkeleton
                rows={5}
                columns={2}
                isLoading={false}
                wrapperClassName="p0"
                hideLeftBorder
            />
        </div>
    </>
);


const PrefCompaniesSkelBar = ({ className = '', stopAnimation = false }) => (
    <div
        className={`pref-companies-sk-bar ${className}${stopAnimation ? ' pref-companies-sk-bar--static' : ''}`.trim()}
        aria-hidden="true"
    />
);

const PrefCompaniesListCardSkeleton = ({ stopAnimation = false }) => (
    <Col sm={4} className="pref-companies-sk-col">
        <div className="pref-companies-sk-card" aria-hidden="true">
            <div className="pref-companies-sk-badge" />
            <div className="pref-companies-sk-info">
                <div className="pref-companies-sk-info-row">
                    <div className="pref-companies-sk-logo-cell">
                        <PrefCompaniesSkelBar className="pref-companies-sk-logo" stopAnimation={stopAnimation} />
                    </div>
                    <div className="pref-companies-sk-text-cell">
                        <div className="pref-companies-sk-title-row">
                            <PrefCompaniesSkelBar className="pref-companies-sk-title" stopAnimation={stopAnimation} />
                            <PrefCompaniesSkelBar
                                className="pref-companies-sk-title-badge"
                                stopAnimation={stopAnimation}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="pref-companies-sk-actions-left">
                <div className="pref-companies-sk-action-col">
                    <PrefCompaniesSkelBar className="pref-companies-sk-action-icon" stopAnimation={stopAnimation} />
                    <PrefCompaniesSkelBar className="pref-companies-sk-action-label" stopAnimation={stopAnimation} />
                </div>
                <div className="pref-companies-sk-action-col">
                    <PrefCompaniesSkelBar className="pref-companies-sk-action-icon" stopAnimation={stopAnimation} />
                    <PrefCompaniesSkelBar className="pref-companies-sk-action-label" stopAnimation={stopAnimation} />
                </div>
            </div>
            <div className="pref-companies-sk-actions-right">
                <PrefCompaniesSkelBar className="pref-companies-sk-action-icon" stopAnimation={stopAnimation} />
                <PrefCompaniesSkelBar className="pref-companies-sk-action-icon" stopAnimation={stopAnimation} />
                <PrefCompaniesSkelBar className="pref-companies-sk-action-icon" stopAnimation={stopAnimation} />
            </div>
        </div>
    </Col>
);

/** Companies list — toolbar icons + 6 company cards. */
export const CompaniesListSkeleton = ({ showNoData = false }) => {
    const freeze = showNoData;

    return (
        <>
            {!showNoData ? (
                <div className="flex-row justify-content-end mt0 top-sub-heading pref-sk-companies-toolbar">
                    <ul className="rs-list-group-horizontal jc-right pref-companies-sk-toolbar-list">
                        <li>
                            <PrefCompaniesSkelBar
                                className="pref-companies-sk-toolbar-icon"
                                stopAnimation={freeze}
                            />
                        </li>
                        <li>
                            <PrefCompaniesSkelBar
                                className="pref-companies-sk-toolbar-icon"
                                stopAnimation={freeze}
                            />
                        </li>
                    </ul>
                </div>
            ) : null}
            <div
                className={`pref-companies-list-skeleton-grid${showNoData ? ' pref-subpage-skeleton-panel--no-data' : ''
                    }`}
            >
                <Row>
                    {Array.from({ length: 6 }, (_, idx) => (
                        <PrefCompaniesListCardSkeleton key={idx} stopAnimation={freeze} />
                    ))}
                </Row>
                {showNoData ? <PrefSubPageNoDataOverlay /> : null}
            </div>
        </>
    );
};

CompaniesListSkeleton.propTypes = {
    showNoData: PropTypes.bool,
};

const CompaniesListBodySkeleton = () => (
    <Container fluid>
        <div className="page-content pc-company-list">
            <Container className="px0">
                <CompaniesListSkeleton />
            </Container>
        </div>
    </Container>
);

const CreateOfferBodySkeleton = () => (
    <Container fluid>
        <div className="page-content pc-create-offer">
            <Container className="px0">
                <CreateOfferFormSkeleton />
            </Container>
        </div>
    </Container>
);

const CreateBrandBodySkeleton = () => (
    <Container fluid>
        <div className="page-content pc-create-brand">
            <Container className="px0">
                <CreateBrandFormSkeleton />
            </Container>
        </div>
    </Container>
);

const CreateShopBodySkeleton = () => (
    <Container fluid>
        <div className="page-content pc-create-shop">
            <Container className="px0">
                <CreateShopFormSkeleton />
            </Container>
        </div>
    </Container>
);

const TemplateGalleryBodySkeleton = () => (
    <Container fluid>
        <div className="page-content pc-template-gallery">
            <Container className="px0">
                <TemplateGallerySkeleton />
            </Container>
        </div>
    </Container>
);

const TemplateGalleryInnerTabbedBodySkeleton = () => (
    <Container fluid>
        <div className="pc-tabs-wrapper">
            <div className="page-content pc-template-gallery-inner">
                <Container className="px0">
                    <div className="page-content">
                        <TemplateGalleryInnerTabbedSkeleton />
                    </div>
                </Container>
            </div>
        </div>
    </Container>
);

const TemplateGalleryLandingInnerBodySkeleton = () => (
    <Container fluid>
        <div className="page-content pc-template-gallery-landing-inner">
            <Container className="px0">
                <TemplateGalleryLandingInnerSkeleton />
            </Container>
        </div>
    </Container>
);

const TemplateGalleryFormGeneratorBodySkeleton = () => (
    <Container fluid>
        <div className="page-content pc-template-gallery-form-generator">
            <Container className="px0">
                <TemplateGalleryFormGeneratorSkeleton />
            </Container>
        </div>
    </Container>
);

const FormGeneratorBodySkeleton = () => (
    <Container fluid>
        <div className="page-content pc-form-generator">
            <Container className="px0">
                <FormGeneratorListSkeleton />
            </Container>
        </div>
    </Container>
);

const FormGeneratorEditorBodySkeleton = () => <FormGeneratorEditorSkeleton />;

const FormGeneratorAddBodySkeleton = () => (
    <Container fluid>
        <div className="page-content">
            <Container className="px0">
                <FormGeneratorAddSkeleton />
            </Container>
        </div>
    </Container>
);

const BrandOwnedFormBodySkeleton = () => (
    <Container className="col-sm-12 px0">
        <div className="rsv-tabs-content position-relative mt7">
            <BrandOwnedFormSkeleton />
        </div>
    </Container>
);

const TemplateGalleryAdsBodySkeleton = () => (
    <Container fluid>
        <div className="page-content pc-template-gallery-ads">
            <Container className="px0">
                <TemplateGalleryAdsSkeleton />
            </Container>
        </div>
    </Container>
);

const TemplateGalleryWhatsappBodySkeleton = () => (
    <Container fluid>
        <div className="page-content pc-template-gallery-whatsapp">
            <Container className="px0">
                <TemplateGalleryWhatsappSkeleton />
            </Container>
        </div>
    </Container>
);

const DataCatalogueBodySkeleton = () => (
    <Container fluid>
        <div className="page-content pc-data-catalogue data-catalogue">
            <Container className='px0'>
                <DataCataloguePageSkeleton />
            </Container>
        </div>
    </Container>
);

const ConsumptionsBodySkeleton = () => (
    <Container fluid>
        <div className="page-content pc-consumptions">
            <Container className="px0">
                <ConsumptionsPageSkeleton />
            </Container>
        </div>
    </Container>
);

const ConsumptionChannelBodySkeleton = () => (
    <Container fluid>
        <div className="page-content pc-consumptions">
            <Container className="rs-consumptions-wrapper px0">
                <ConsumptionChannelPageSkeleton />
            </Container>
        </div>
    </Container>
);

const DiscoverOffersBodySkeleton = () => (
    <Container fluid>
        <div className="page-content pc-discover-offers">
            <Container className="px0">
                <div className="offers-page-wrapper box-design no-box-shadow mt21">
                    <div className="offers-container">
                        <DiscoverOffersSkeleton />
                    </div>
                </div>
            </Container>
        </div>
    </Container>
);

const OfferManagementBodySkeleton = () => {
    const { search } = useLocation();
    const tabIndex = getRouteTabIndex('/preferences/offer-management', search);

    return (
        <Container fluid>
            <div className="page-content pc-offer-management">
                <Container className="px0">
                    <OfferManagementSkeleton tabIndex={tabIndex} />
                </Container>
            </div>
        </Container>
    );
};

/** Alerts and notifications — subheading + 2-column Kendo grid (matches Roles list refresh skeleton). */
export const AlertsNotificationsListSkeleton = ({ rowCount = 5, showNoData = false }) => {
    const freeze = showNoData;

    return (
        <>
            <CommonSkeleton
                box
                height={24}
                width="72%"
                stopAnimation={freeze}
                mainClass="pref-sk-alerts-subheading top-sub-heading"
            />
            <div
                className={`rs-kendo-table-hide-header rskt-width-90-10 rs-alertnotifications pref-alerts-grid-skeleton${showNoData ? ' pref-subpage-skeleton-panel--no-data' : ''
                    }`}
            >
                <GridLoadingSkeleton
                    rows={rowCount}
                    columns={2}
                    isLoading={false}
                    wrapperClassName="p0"
                    hideLeftBorder
                />
                {showNoData ? <PrefSubPageNoDataOverlay /> : null}
            </div>
        </>
    );
};

AlertsNotificationsListSkeleton.propTypes = {
    rowCount: PropTypes.number,
    showNoData: PropTypes.bool,
};

const AlertsNotificationsBodySkeleton = () => (
    <Container fluid>
        <div className="page-content pc-alerts-notifications alertsAndNotificationCSS">
            <Container className="px0">
                <AlertsNotificationsListSkeleton />
            </Container>
        </div>
    </Container>
);

/** Notifications list — date range toolbar (matches AllNotifications). */
export const NotificationsToolbarSkeleton = () => (
    <div className="flex-row mt0 top-sub-heading pref-sk-notifications-toolbar" aria-hidden="true">
        <div className="fr flex-right tsh-icons w-100" style={{marginBottom:'15px'}}>
            <ul className="rs-list-group-horizontal jc-right d-flex align-items-center list-unstyled m0 p0">
                <li>
                    <CommonSkeleton box height={32} width={280} stopAnimation />
                </li>
            </ul>
        </div>
    </div>
);

/** Notifications grid — box + striped rows (matches RSSkeletonTable / Kendo list). */
export const NotificationsGridSkeleton = ({ rows = 6 } = {}) => (
    <div className="box-design pref-notifications-grid-skeleton no-data-container" aria-hidden="true">
        <GridLoadingSkeleton
            rows={rows}
            columns={4}
            isLoading={false}
            wrapperClassName="p0"
            hideLeftBorder
        />
    </div>
);

NotificationsGridSkeleton.propTypes = {
    rows: PropTypes.number,
};

/** Route refresh + in-page — toolbar + grid. */
export const NotificationsListSkeleton = ({ rows = 6 } = {}) => (
    <>
        <NotificationsToolbarSkeleton />
        <NotificationsGridSkeleton rows={rows} />
    </>
);

NotificationsListSkeleton.propTypes = {
    rows: PropTypes.number,
};

const NotificationsBodySkeleton = () => (
    <Container className="page-content px0">
        <NotificationsListSkeleton rows={6} />
    </Container>
);

const InvoiceListBodySkeleton = () => (
    <Container fluid>
        <div className="page-content">
            <InvoiceListSkeleton />
        </div>
    </Container>
);

const LicenseInfoBodySkeleton = () => (
    <Container fluid>
        <div className="page-content rs-licence-info-wrapper">
            <Container className="px0">
                <div className="mt30">
                    <LicenceInfoSkeleton />
                </div>
            </Container>
        </div>
    </Container>
);

/** Roles and permissions listing page body. */
const RolesBodySkeleton = () => (
    <Container fluid>
        <div className="page-content pc-roles-list">
            <Container className="px0">
                <RolesListSkeleton />
            </Container>
        </div>
    </Container>
);

/** User details listing — toolbar actions + 7-column grid + pager. */
const UsersBodySkeleton = () => (
    <Container fluid>
        <div className="page-content pc-users-list">
            <Container className="px0">
                <UsersListSkeleton />
            </Container>
        </div>
    </Container>
);

const UsersAddEditBodySkeleton = () => (
    <Container fluid>
        <div className="page-content pc-users-add-edit">
            <Container className="px0">
                <UsersAddEditFormSkeleton />
            </Container>
        </div>
    </Container>
);

const RolesPermissionsEditBodySkeleton = () => (
    <Container fluid>
        <div className="page-content pc-roles-permissions-edit d-grid">
            <Container className="px0">
                <RolesPermissionsEditFormSkeleton />
            </Container>
        </div>
    </Container>
);

const PreferencesSubPageBodySkeleton = ({ variant }) => {
    if (variant === PREFERENCES_SUBPAGE_VARIANT.MY_PROFILE) return <MyProfileBodySkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.ACCOUNT_SETTINGS) return <AccountSettingsBodySkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.COMPANY_CLIENT_DETAILS) {
        return (
            <Container fluid>
                <div className="page-content pc-company-client-details">
                    <Container className="px0">
                        <CompanyClientDetailsFormSkeleton />
                    </Container>
                </div>
            </Container>
        );
    }
    if (variant === PREFERENCES_SUBPAGE_VARIANT.COMPANY_ASSIGN_ROLE) {
        return (
            <Container fluid>
                <div className="page-content pc-company-assign-role">
                    <Container className="px0">
                        <Row className="mt21">
                            <Col sm={12}>
                                <CompanyAssignRoleWizardChromeSkeleton showHeader={false} />
                                <CompanyAssignRoleSkeleton />
                            </Col>
                        </Row>
                    </Container>
                </div>
            </Container>
        );
    }
    if (variant === PREFERENCES_SUBPAGE_VARIANT.COMPANY_LOCALIZATION) {
        return (
            <Container fluid>
                <div className="page-content pc-company-localization">
                    <Container className="px0">
                        <Row className="mt21">
                            <Col sm={12}>
                                <CompanyAssignRoleWizardChromeSkeleton showHeader={false} />
                                <CompanyLocalizationSkeleton />
                            </Col>
                        </Row>
                    </Container>
                </div>
            </Container>
        );
    }
    if (variant === PREFERENCES_SUBPAGE_VARIANT.USERS) return <UsersBodySkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.USERS_ADD_EDIT) return <UsersAddEditBodySkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.ROLES) return <RolesBodySkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.ROLES_PERMISSIONS_EDIT) return <RolesPermissionsEditBodySkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.ALERTS_NOTIFICATIONS) return <AlertsNotificationsBodySkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.NOTIFICATIONS_LIST) return <NotificationsBodySkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.COMPANY_LIST) return <CompaniesListBodySkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.OFFER_MANAGEMENT) return <OfferManagementBodySkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.CREATE_OFFER) return <CreateOfferBodySkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.CREATE_BRAND) return <CreateBrandBodySkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.CREATE_SHOP) return <CreateShopBodySkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.OFFER_DISCOVER) return <DiscoverOffersBodySkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.TEMPLATE_GALLERY) return <TemplateGalleryBodySkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.TG_TABBED_GALLERY) return <TemplateGalleryInnerTabbedBodySkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.TG_LANDING_GALLERY) return <TemplateGalleryLandingInnerBodySkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.TG_FORM_GENERATOR) return <TemplateGalleryFormGeneratorBodySkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.FORM_GENERATOR) return <FormGeneratorBodySkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.FORM_GENERATOR_EDITOR) return <FormGeneratorEditorBodySkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.FORM_GENERATOR_ADD) return <FormGeneratorAddBodySkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.BRAND_OWNED_FORM) return <BrandOwnedFormBodySkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.TG_ADS) return <TemplateGalleryAdsBodySkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.TG_WHATSAPP) return <TemplateGalleryWhatsappBodySkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.DATA_CATALOGUE) return <DataCatalogueBodySkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.DATA_CATALOGUE_GRID) return <DataCatalogueGridBodySkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.CONSUMPTIONS) return <ConsumptionsBodySkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.CONSUMPTION_CHANNEL) return <ConsumptionChannelBodySkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.COMMUNICATION_SETTINGS) return <CommunicationSettingsBodySkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.COMMUNICATION_SUBSCRIPTION) {
        return <CommunicationSubscriptionBodySkeleton />;
    }
    if (variant === PREFERENCES_SUBPAGE_VARIANT.COMMUNICATION_PUSH_PERMISSIONS) {
        return <CommunicationPushPermissionsBodySkeleton />;
    }
    if (variant === PREFERENCES_SUBPAGE_VARIANT.GOALS_BENCHMARK_EDIT) {
        return <GoalsBenchmarkEditRouteSkeleton />;
    }
    if (variant === PREFERENCES_SUBPAGE_VARIANT.GOALS_CHANNEL_GOALS) {
        return <ChannelGoalsRouteSkeleton />;
    }
    if (variant === PREFERENCES_SUBPAGE_VARIANT.AUDIENCE_SCORE) {
        return (
            <Container fluid>
                <AudienceScorePageSkeleton />
            </Container>
        );
    }
    if (variant === PREFERENCES_SUBPAGE_VARIANT.DATA_EXCHANGE) {
        return (
            <Container fluid style={{ padding: "0" }}>
                <DataExchangePageSkeleton />
            </Container>
        );
    }
    if (variant === PREFERENCES_SUBPAGE_VARIANT.INVOICE_LIST) {
        return <InvoiceListBodySkeleton />;
    }
    if (variant === PREFERENCES_SUBPAGE_VARIANT.LICENSE_INFO) {
        return <LicenseInfoBodySkeleton />;
    }
    return <DefaultSubPageBodySkeleton />;
};

/**
 * Preferences sub-route skeleton (Suspense / route / bootstrap).
 * Pass `variant` or rely on pathname; `withAppShell` omits outer holder (bootstrap parent wraps nav).
 */
const PreferencesSubPageRouteSkeleton = ({
    variant: variantProp,
    withAppShell = false,
    ariaLabel = 'Loading preferences',
}) => {
    const { pathname, search } = useLocation();
    const variant = variantProp ?? resolvePreferencesSubPageVariant(pathname, search);
    const isFormGeneratorEditor = variant === PREFERENCES_SUBPAGE_VARIANT.FORM_GENERATOR_EDITOR;
    const isConsumptions = variant === PREFERENCES_SUBPAGE_VARIANT.CONSUMPTIONS;
    const isConsumptionChannel = variant === PREFERENCES_SUBPAGE_VARIANT.CONSUMPTION_CHANNEL;
    const isDataCatalogue =
        variant === PREFERENCES_SUBPAGE_VARIANT.DATA_CATALOGUE ||
        variant === PREFERENCES_SUBPAGE_VARIANT.DATA_CATALOGUE_GRID;
    const useConsumptionStyleHeader = isConsumptions || isConsumptionChannel;
    const showBack = useConsumptionStyleHeader ? false : SUBPAGE_VARIANTS_WITH_BACK.has(variant);
    const isDataExchange = variant === PREFERENCES_SUBPAGE_VARIANT.DATA_EXCHANGE;

    const pageHeaderVariant = isConsumptionChannel
        ? 'consumptionChannel'
        : useConsumptionStyleHeader
            ? 'consumption'
            : isDataExchange
                ? 'dataExchange'
                : 'tabber';

    const isCommunicationSettings = variant === PREFERENCES_SUBPAGE_VARIANT.COMMUNICATION_SETTINGS;
    const isGoalsBenchmarkEdit = variant === PREFERENCES_SUBPAGE_VARIANT.GOALS_BENCHMARK_EDIT;
    const isCommunicationSubscription = variant === PREFERENCES_SUBPAGE_VARIANT.COMMUNICATION_SUBSCRIPTION;
    const isAudienceScore = variant === PREFERENCES_SUBPAGE_VARIANT.AUDIENCE_SCORE;
    const dataExchangeHeaderClassName = isDataExchange
        ? 'pref-subpage-header-skeleton pref-de-header-skeleton'
        : 'pref-subpage-header-skeleton';

    const shell = (
        <>
            <style>{skeletonShellSharedCriticalCss}</style>
            <style>{preferencesSkeletonCriticalCss}</style>
            {isConsumptionChannel ? <style>{consumptionChannelSkeletonCriticalCss}</style> : null}
            {isCommunicationSettings ? <style>{communicationSettingsSkeletonCriticalCss}</style> : null}
            {isCommunicationSubscription ? <style>{communicationSubscriptionSkeletonCriticalCss}</style> : null}
            {isAudienceScore ? <style>{audienceScoreSkeletonCriticalCss}</style> : null}
            {isDataExchange ? <style>{dataExchangeSkeletonCriticalCss}</style> : null}
            {isCommunicationSettings ? (
                <PreferencesSubPageBodySkeleton variant={variant} />
            ) : isFormGeneratorEditor ? (
                <PreferencesSubPageBodySkeleton variant={variant} />
            ) : (
                <>
                    <RSPageHeaderSkeleton
                        variant={pageHeaderVariant}
                        className={dataExchangeHeaderClassName}
                        titleWidth={SUBPAGE_TITLE_WIDTH[variant] ?? 200}
                        showBack={showBack}
                    />
                    <BreadcrumbSkeleton />
                    <PreferencesSubPageBodySkeleton variant={variant} />
                </>
            )}
        </>
    );

    if (withAppShell) {
        return (
            <div aria-busy="true" aria-label={ariaLabel}>
                {shell}
            </div>
        );
    }

    const holderClass = [
        isFormGeneratorEditor ? 'pref-fg-editor-skeleton-scope' : 'page-content-holder',
        'preferences-skeleton-scope',
        'preferences-subpage-skeleton-scope',
        isDataCatalogue ? 'data-catalogue' : '',
        variant === PREFERENCES_SUBPAGE_VARIANT.COMMUNICATION_SETTINGS ? 'communication-settings' : '',
        variant === PREFERENCES_SUBPAGE_VARIANT.COMMUNICATION_PUSH_PERMISSIONS
            ? 'pref-cs-push-permissions-page-scope'
            : '',
        isCommunicationSubscription ? 'communication-subscription' : '',
        isAudienceScore ? 'pc-audience-score' : '',
        isDataExchange ? 'pc-data-exchange' : '',
        variant === PREFERENCES_SUBPAGE_VARIANT.LICENSE_INFO ? 'rs-licence-info-skeleton-scope' : '',
        isGoalsBenchmarkEdit ? 'pref-sk-goals-benchmark-page-scope' : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={holderClass} aria-busy="true" aria-label={ariaLabel}>
            {shell}
        </div>
    );
};

PreferencesSubPageRouteSkeleton.propTypes = {
    variant: PropTypes.oneOf(Object.values(PREFERENCES_SUBPAGE_VARIANT)),
    withAppShell: PropTypes.bool,
    ariaLabel: PropTypes.string,
};

export default memo(PreferencesSubPageRouteSkeleton);

export { default as LicenceInfoSkeleton } from 'Pages/AuthenticationModule/Preferences/Pages/LicenceInfo/LicenceInfoSkeleton';
