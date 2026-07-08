import { QUIET_HOURS } from 'Constants/GlobalConstant/Placeholders';
import { circle_paid_media_large, email_footer_large, email_large, email_sub_unsub_large, email_tick_large, lifetime_cap_large, messaging_large, messaging_rcs_large, mobile_notification_large, mobile_sms_large, notification_large, quiet_hors_large, smtp_large, social_line_large, social_vms_large, social_whatsapp_large, web_notification_large } from 'Constants/GlobalConstant/Glyphicons';
import { Suspense, lazy } from 'react';
import { updateQueryParams } from 'Utils/modules/urlQuery';
import { COMMUNICATION_SETTINGS_TAB } from 'Utils/modules/navigation';
import {
    CommunicationSettingsInnerTabLoadingBlock,
    CommunicationSettingsMailTabLoadingBlock,
    CommunicationSettingsMessagingTabLoadingBlock,
    CommunicationSettingsNotificationTabLoadingBlock,
} from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';

const Mail = lazy(() => import('./Pages/Mail'));
const Messaging = lazy(() => import('./Pages/Messaging'));
const Notification = lazy(() => import('./Pages/Notification'));
const SMTP = lazy(() => import('./Pages/Mail/Tabs/SMTP'));
const DoubleOptIn = lazy(() => import('./Pages/Mail/Tabs/DoubleOptIn'));
const LifetimeCap = lazy(() => import('./Pages/Mail/Tabs/LifetimeCap'));
const QuietHours = lazy(() => import('./Pages/Mail/Tabs/QuietHours'));
const SubscriptionUnsubscription = lazy(() => import('./Pages/Mail/Tabs/SubscriptionUnsubscription'));
const EmailFooter = lazy(() => import('./Pages/Mail/Tabs/EmailFooter'));
const SMS = lazy(() => import('./Pages/Messaging/Tabs/SMS'));
const WhatsApp = lazy(() => import('./Pages/Messaging/Tabs/WhatsApp'));
const LINE = lazy(() => import('./Pages/Messaging/Tabs/LINE'));
const VMS = lazy(() => import('./Pages/Messaging/Tabs/VMS'));
const RCS = lazy(() => import('./Pages/Messaging/Tabs/RCS'));
const Web = lazy(() => import('./Pages/Notification/Tabs/Web'));
const WebMobile = lazy(() => import('./Pages/Notification/Tabs/WebMobile'));
const Mobile = lazy(() => import('./Pages/Notification/Tabs/Mobile'));
const Digipop = lazy(() => import('./Pages/Ads/Tabs/Digipop'));

const renderLazyChannel = (LazyComponent, fallback) => () => (
    <Suspense fallback={fallback}>
        <LazyComponent />
    </Suspense>
);

/**
 * Icon sub-tab chunk load — skeleton supplies the bordered panel (no parent box yet).
 * `skeletonOptions` are explicit because RSTabbar tab clicks do not update route state.
 */
const CS_INNER_TAB_SKELETON = {
    withInnerTabs: { showInnerTabs: true, showAddAction: true },
    panelOnly: { showInnerTabs: false, showAddAction: false },
    panelWithAdd: { showInnerTabs: false, showAddAction: true },
    gridOnly: { showInnerTabs: false, showHeading: false },
};

const renderLazyInner = (LazyComponent, skeletonOptions = CS_INNER_TAB_SKELETON.withInnerTabs) => () => (
    <Suspense fallback={<CommunicationSettingsInnerTabLoadingBlock {...skeletonOptions} />}>
        <LazyComponent />
    </Suspense>
);

/** Horizontal sub-tab chunk load — parent already has `box-design bd-top-border`. */
export const renderEmbeddedLazyInner = (LazyComponent, skeletonOptions = { showAddAction: true }) => () => (
    <Suspense fallback={<CommunicationSettingsInnerTabLoadingBlock embedded {...skeletonOptions} />}>
        <LazyComponent />
    </Suspense>
);

export const VERTICAL_TAB_CONFIG = [
    {
        id: 'Mail',
        text: 'Email',
        iconLeft: `${email_large} icon-lg`,
        component: renderLazyChannel(Mail, <CommunicationSettingsMailTabLoadingBlock />),
    },
    {
        id: 'Messaging',
        text: 'Messaging',
        iconLeft: `${messaging_large} icon-lg`,
        component: renderLazyChannel(Messaging, <CommunicationSettingsMessagingTabLoadingBlock />),
    },
    {
        id: 'Notification',
        text: 'Notifications',
        iconLeft: `${notification_large} icon-lg`,
        component: renderLazyChannel(Notification, <CommunicationSettingsNotificationTabLoadingBlock />),
    },
    // {
    //     id: 'Ads',
    //     text: 'Ads',
    //     iconLeft: `${circle_paid_media_large} icon-lg`,
    //     component: () => <Ads />,
    // },
];

export const resolveVerticalTabIndex = (verticalTabId) => {
    if (!verticalTabId) return -1;
    return VERTICAL_TAB_CONFIG.findIndex((tab) => tab.id === verticalTabId);
};

export const resolveVerticalTabState = (navState = {}) => {
    if (navState?.from === 'cs_preferences' && navState?.tab !== undefined && navState?.tab !== null) {
        return navState.tab;
    }
    if (navState?.currentTab !== undefined && navState?.currentTab !== null) {
        return navState.currentTab;
    }
    if (navState?.verticalTabId) {
        const index = resolveVerticalTabIndex(navState.verticalTabId);
        if (index >= 0) return index;
    }
    if (navState?.verticalTab !== undefined && navState?.verticalTab !== null) {
        return navState.verticalTab;
    }
    return 0;
};

export const resolveMailTabIndex = (mailTabId) => {
    if (!mailTabId) return -1;
    return MAIL_TABBER_CONFIG.findIndex((tab) => tab.id === mailTabId);
};

export const resolveMailTabState = (navState = {}) => {
    if (navState?.mailTabId) {
        const index = resolveMailTabIndex(navState.mailTabId);
        if (index >= 0) return index;
    }
    //  if (navState?.currentTab !== undefined && navState?.currentTab !== null) {
    //     return navState.currentTab;
    // }
    // if (navState?.from === 'sub') {
    //     const index = resolveMailTabIndex('SubscriptionUnsubscription');
    //     if (index >= 0) return index;
    // }
    // if (navState?.subfrom === 'footer-builder') {
    //     const index = resolveMailTabIndex('EmailFooter');
    //     if (index >= 0) return index;
    // }
    // const isMailVertical =
    //     navState?.verticalTabId === 'Mail' ||
    //     navState?.verticalTab === 0;
    // if (
    //     isMailVertical &&
    //     navState?.subTab !== undefined &&
    //     navState?.subTab !== null &&
    //     !navState?.messagingTabId &&
    //     !navState?.notificationTabId
    // ) {
    //     return navState.subTab;
    // }
    // if (navState?.index !== undefined && navState?.index !== null) {
    //     return navState.index;
    // }
    return 0;
};

export const resolveMessagingTabIndex = (messagingTabId) => {
    if (!messagingTabId) return -1;
    return MESSAGING_TABBER_CONFIG.findIndex((tab) => tab.id === messagingTabId);
};

export const resolveMessagingTabState = (navState = {}) => {
    if (navState?.messagingTabId) {
        const index = resolveMessagingTabIndex(navState.messagingTabId);
        if (index >= 0) return index;
    }
    // if (navState?.from === 'messaging' && navState?.subTab !== undefined && navState?.subTab !== null) {
    //     return navState.subTab;
    // }
    // const isMessagingVertical =
    //     navState?.verticalTabId === 'Messaging' ||
    //     navState?.verticalTab === 1;
    // if (isMessagingVertical && navState?.subTab !== undefined && navState?.subTab !== null) {
    //     return navState.subTab;
    // }
    return 0;
};

export const resolveNotificationTabIndex = (notificationTabId) => {
    if (!notificationTabId) return -1;
    return NOTIFICATION_TABBER_CONFIG.findIndex((tab) => tab.id === notificationTabId);
};

export const resolveNotificationTabState = (navState = {}) => {
    if (navState?.from === 'cs_preferences' && navState?.innerTab !== undefined) {
        return navState.innerTab;
    }
    if (navState?.notificationTabId) {
        const index = resolveNotificationTabIndex(navState.notificationTabId);
        if (index >= 0) return index;
    }
    if (navState?.subfrom != null && navState?.subfrom !== '' && navState?.subTab !== undefined) {
        return navState.subTab;
    }
    if (navState?.type === true) {
        return 1;
    }
    if (navState?.type === false) {
        return 0;
    }
    return 0;
};

export const MAIL_TABBER_CONFIG = [
    { id: 'SMTP', text: 'SMTP', icon: `${smtp_large} icon-lg color-primary-blue`, component: renderLazyInner(SMTP) },
    {
        id: 'QuietHours',
        text: 'Quiet Hours',
        icon: `${quiet_hors_large} icon-lg color-primary-blue`,
        component: renderLazyInner(QuietHours, CS_INNER_TAB_SKELETON.panelWithAdd),
    },
    {
        id: 'LifetimeCap',
        text: 'Lifetime cap',
        icon: `${lifetime_cap_large} icon-lg color-primary-blue`,
        component: renderLazyInner(LifetimeCap, CS_INNER_TAB_SKELETON.panelOnly),
        disable: true,
    },
    {
        id: 'SubscriptionUnsubscription',
        text: 'Sub / Un-sub',
        icon: `${email_sub_unsub_large} icon-lg color-primary-blue`,
        component: renderLazyInner(SubscriptionUnsubscription),
    },
    {
        id: 'DoubleOptIn',
        text: 'Double opt-in',
        icon: `${email_tick_large} icon-lg color-primary-blue`,
        disable: true,
        component: renderLazyInner(DoubleOptIn, CS_INNER_TAB_SKELETON.panelWithAdd),
    },
    {
        id: 'EmailFooter',
        text: 'Email footer',
        icon: `${email_footer_large} icon-lg color-primary-blue`,
        component: renderLazyInner(EmailFooter, CS_INNER_TAB_SKELETON.panelWithAdd),
    },
];

export const MESSAGING_TABBER_CONFIG = [
    { id: 'SMS', text: 'SMS', icon: `${mobile_sms_large} icon-lg color-primary-blue`, component: renderLazyInner(SMS) },
    {
        id: 'Whatsapp',
        text: 'WhatsApp',
        icon: `${social_whatsapp_large} icon-lg color-primary-blue`,
        component: renderLazyInner(WhatsApp),
    },
    {
        id: 'VMS',
        text: 'VMS',
        // disable: true,
        icon: `${social_vms_large} icon-lg color-primary-blue`,
        component: renderLazyInner(VMS, CS_INNER_TAB_SKELETON.panelWithAdd),
    },
    {
        id: 'LINE',
        text: 'LINE',
        disable: true,
        icon: `${social_line_large} icon-lg color-primary-blue`,
        component: renderLazyInner(LINE, CS_INNER_TAB_SKELETON.panelWithAdd),
    },
    {
        id: 'RCS',
        text: 'RCS',
        icon: `${messaging_rcs_large} icon-lg color-primary-blue`,
        component: renderLazyInner(RCS),
    },
];

export const NOTIFICATION_TABBER_CONFIG = [
    {
        id: 'Web',
        text: 'Web',
        icon: `${web_notification_large} icon-lg color-primary-blue`,
        component: renderLazyInner(Web),
    },
    {
        id: 'Mobile',
        text: 'Mobile',
        icon: `${mobile_notification_large} icon-lg color-primary-blue`,
        component: renderLazyInner(Mobile),
    },
    {
        id: 'WebMobile',
        text: 'Cross-device',
        icon: `${notification_large} icon-lg color-primary-blue`,
        disable:false,
        component: renderLazyInner(WebMobile, CS_INNER_TAB_SKELETON.gridOnly),
    },
];
export const ADS_TABBER_CONFIG = [
    {
        id: 'Digipop',
        text: 'Digipop',
        icon: `${web_notification_large} icon-lg color-primary-blue`,
        component: renderLazyInner(Digipop),
    },
];

export const canEditMessagingChannel = (dataItem = {}) => {
    const isFiveEnabled = dataItem?.['is5.0'] === true || dataItem?.['is5.0'] === 'true';
    if (isFiveEnabled) return true;

    const friendlyValue = dataItem?.friendlyName ?? dataItem?.smsFriendlyName;
    const hasFriendlyName = !!String(friendlyValue ?? '').trim();
    return hasFriendlyName;
};

const CHANNEL_SETTINGS_TAB = COMMUNICATION_SETTINGS_TAB.CHANNEL_SETTINGS;

export const RESET_HORIZONTAL_TABS = {
    mailTabId: null,
    messagingTabId: null,
    notificationTabId: null
}
export const RESET_MAIL_INNER_TABS = {
    smtpTabId: null,
    subUnsubTabId: null,
};

export const RESET_MESSAGING_INNER_TABS = {
    smsTabId: null,
    whatsappTabId: null,
    rcsTabId: null,
};

export const RESET_NOTIFICATION_INNER_TABS = {
    webTabId: null,
    mobileTabId: null,
};
export const patchCommunicationSettingsQuery = (patch) => {
    updateQueryParams(patch);
};


export const syncVerticalChannelTabQuery = (index) => {
    const tab = VERTICAL_TAB_CONFIG[index];
    if (!tab) return;
    patchCommunicationSettingsQuery({
        tab: CHANNEL_SETTINGS_TAB,
        verticalTabId: tab.id,
        ...RESET_HORIZONTAL_TABS,
        ...RESET_MAIL_INNER_TABS,
        ...RESET_MESSAGING_INNER_TABS,
        ...RESET_NOTIFICATION_INNER_TABS,
    });
};

export const syncMailChannelTabQuery = (index) => {
    const tab = MAIL_TABBER_CONFIG[index];
    if (!tab) return;
    patchCommunicationSettingsQuery({
        tab: CHANNEL_SETTINGS_TAB,
        verticalTabId: 'Mail',
        mailTabId: tab.id,
        ...RESET_MAIL_INNER_TABS
    });
};

export const syncMessagingChannelTabQuery = (index) => {
    const tab = MESSAGING_TABBER_CONFIG[index];
    if (!tab) return;
    patchCommunicationSettingsQuery({
        tab: CHANNEL_SETTINGS_TAB,
        verticalTabId: 'Messaging',
        messagingTabId: tab.id,
        ...RESET_MESSAGING_INNER_TABS,
    });
};

export const syncNotificationChannelTabQuery = (index) => {
    const tab = NOTIFICATION_TABBER_CONFIG[index];
    if (!tab) return;
    patchCommunicationSettingsQuery({
        tab: CHANNEL_SETTINGS_TAB,
        verticalTabId: 'Notification',
        notificationTabId: tab.id,
        ...RESET_NOTIFICATION_INNER_TABS,
    });
};

export const syncChannelInnerTabQuery = (channelPatch) => {
    patchCommunicationSettingsQuery({
        tab: CHANNEL_SETTINGS_TAB,
        ...channelPatch,
    });
};

export const resolveInnerTabState = (navState = {}) => {
    if (navState?.innerTab !== undefined && navState?.innerTab !== null) {
        return navState.innerTab;
    }
    return 0;
};

export const SMTP_INNER_TAB_CONFIG = [
    { id: 'smtp', text: 'SMTP', actionType: 'SMTP Grid' },
    { id: 'domain', text: 'Domain', actionType: 'Domain Settings' },
];

export const SMTP_INNER_TAB_QUERY_KEY = 'smtpTabId';

export const resolveSmtpInnerTabIndex = (smtpTabId) => {
    if (!smtpTabId) return -1;
    return SMTP_INNER_TAB_CONFIG.findIndex((tab) => tab.id === smtpTabId);
};

export const resolveSmtpInnerTabState = (navState = {}) => {
    if (navState?.smtpTabId) {
        const index = resolveSmtpInnerTabIndex(navState.smtpTabId);
        if (index >= 0) return index;
    }
    return 0;
};

export const resolveSmtpInnerActionType = (navState = {}) => {
    const tab = SMTP_INNER_TAB_CONFIG.find((item) => item.id === navState?.smtpTabId);
    return tab?.actionType || 'SMTP Grid';
};

export const syncSmtpInnerTabQuery = (smtpTabId) => {
    patchCommunicationSettingsQuery({
        tab: CHANNEL_SETTINGS_TAB,
        verticalTabId: 'Mail',
        mailTabId: 'SMTP',
        smtpTabId,
    });
};

export const SUB_UNSUB_INNER_TAB_CONFIG = [
    { id: 'subscription', text: 'Subscription' },
    { id: 'unsubscription', text: 'Unsubscription' },
];

export const SUB_UNSUB_INNER_TAB_QUERY_KEY = 'subUnsubTabId';

export const resolveSubUnsubInnerTabIndex = (subUnsubTabId) => {
    if (!subUnsubTabId) return -1;
    return SUB_UNSUB_INNER_TAB_CONFIG.findIndex((tab) => tab.id === subUnsubTabId);
};

export const resolveSubUnsubInnerTabState = (navState = {}) => {
    if (navState?.subUnsubTabId) {
        const index = resolveSubUnsubInnerTabIndex(navState.subUnsubTabId);
        if (index >= 0) return index;
    }
    return 0;
};

export const syncSubUnsubInnerTabQuery = (subUnsubTabId) => {
    patchCommunicationSettingsQuery({
        tab: CHANNEL_SETTINGS_TAB,
        verticalTabId: 'Mail',
        mailTabId: 'SubscriptionUnsubscription',
        subUnsubTabId,
    });
};

export const SMS_INNER_TAB_CONFIG = [
    { id: 'vendor', text: 'Vendor' },
    { id: 'templates', text: 'Templates' },
    { id: 'keywordManagement', text: 'Keyword management' },
    { id: 'quiet-hours-sms', text: QUIET_HOURS },
    { id: 'lifetimeCap', text: 'Lifetime cap', disable: true },
];

export const SMS_INNER_TAB_QUERY_KEY = 'smsTabId';

export const getSmsInnerTabIds = () => SMS_INNER_TAB_CONFIG.map((tab) => tab.id);

export const resolveSmsInnerTabIndex = (smsTabId) => {
    if (!smsTabId) return -1;
    return getSmsInnerTabIds().findIndex((id) => id === smsTabId);
};

export const resolveSmsInnerTabState = (navState = {}) => {
    if (navState?.smsTabId) {
        const index = resolveSmsInnerTabIndex(navState.smsTabId);
        if (index >= 0) return index;
    }
    return 0;
};

export const syncSmsInnerTabQuery = (smsTabId) => {
    patchCommunicationSettingsQuery({
        tab: CHANNEL_SETTINGS_TAB,
        verticalTabId: 'Messaging',
        messagingTabId: 'SMS',
        smsTabId,
    });
};

export const WHATSAPP_INNER_TAB_CONFIG = [
    { id: 'vendor', text: 'Vendor' },
    { id: 'quiet-hours-whatsapp', text: QUIET_HOURS },
];

export const WHATSAPP_INNER_TAB_QUERY_KEY = 'whatsappTabId';

export const resolveWhatsappInnerTabIndex = (whatsappTabId) => {
    if (!whatsappTabId) return -1;
    return WHATSAPP_INNER_TAB_CONFIG.findIndex((tab) => tab.id === whatsappTabId);
};

export const resolveWhatsappInnerTabState = (navState = {}) => {
    if (navState?.whatsappTabId) {
        const index = resolveWhatsappInnerTabIndex(navState.whatsappTabId);
        if (index >= 0) return index;
    }
    return 0;
};

export const syncWhatsappInnerTabQuery = (whatsappTabId) => {
    patchCommunicationSettingsQuery({
        tab: CHANNEL_SETTINGS_TAB,
        verticalTabId: 'Messaging',
        messagingTabId: 'Whatsapp',
        whatsappTabId,
    });
};

export const RCS_INNER_TAB_CONFIG = [
    { id: 'vendor', text: 'Vendor' },
    { id: 'quiet-hours-rcs', text: QUIET_HOURS },
];

export const RCS_INNER_TAB_QUERY_KEY = 'rcsTabId';

export const resolveRcsInnerTabIndex = (rcsTabId) => {
    if (!rcsTabId) return -1;
    return RCS_INNER_TAB_CONFIG.findIndex((tab) => tab.id === rcsTabId);
};

export const resolveRcsInnerTabState = (navState = {}) => {
    if (navState?.rcsTabId) {
        const index = resolveRcsInnerTabIndex(navState.rcsTabId);
        if (index >= 0) return index;
    }
    return 0;
};

export const syncRcsInnerTabQuery = (rcsTabId) => {
    patchCommunicationSettingsQuery({
        tab: CHANNEL_SETTINGS_TAB,
        verticalTabId: 'Messaging',
        messagingTabId: 'RCS',
        rcsTabId,
    });
};

export const WEB_INNER_TAB_CONFIG = [
    { id: 'web', text: 'Web' },
    { id: 'quiet-hours-web', text: QUIET_HOURS },
    { id: 'lifetimeCap', text: 'Lifetime cap', disable: true },
    { id: 'customEvents', text: 'Custom events' },
];

export const WEB_INNER_TAB_QUERY_KEY = 'webTabId';

export const getWebInnerTabIds = () => WEB_INNER_TAB_CONFIG.map((tab) => tab.id);

export const resolveWebInnerTabIndex = (webTabId) => {
    if (!webTabId) return -1;
    return getWebInnerTabIds().findIndex((id) => id === webTabId);
};

export const resolveWebInnerTabState = (navState = {}) => {
    if (navState?.webTabId) {
        const index = resolveWebInnerTabIndex(navState.webTabId);
        if (index >= 0) return index;
    }
    return 0;
};

export const syncWebInnerTabQuery = (webTabId) => {
    patchCommunicationSettingsQuery({
        tab: CHANNEL_SETTINGS_TAB,
        verticalTabId: 'Notification',
        notificationTabId: 'Web',
        webTabId,
    });
};

export const MOBILE_INNER_TAB_CONFIG = [
    { id: 'appsList', text: 'Apps list' },
    { id: 'userDeviceSetup', text: 'User device setup' },
    { id: 'geofencing', text: 'Geofencing' },
    { id: 'beacons', text: 'Beacons' },
    { id: 'quiet-hours-mobile', text: QUIET_HOURS },
    { id: 'lifetimeCap', text: 'Lifetime cap', disable: true },
];

export const MOBILE_INNER_TAB_QUERY_KEY = 'mobileTabId';

export const getMobileInnerTabIds = () => MOBILE_INNER_TAB_CONFIG.map((tab) => tab.id);

export const resolveMobileInnerTabIndex = (mobileTabId) => {
    if (!mobileTabId) return -1;
    return getMobileInnerTabIds().findIndex((id) => id === mobileTabId);
};

export const resolveMobileInnerTabState = (navState = {}) => {
    if (navState?.mobileTabId) {
        const index = resolveMobileInnerTabIndex(navState.mobileTabId);
        if (index >= 0) return index;
    }
    return 0;
};

export const syncMobileInnerTabQuery = (mobileTabId) => {
    patchCommunicationSettingsQuery({
        tab: CHANNEL_SETTINGS_TAB,
        verticalTabId: 'Notification',
        notificationTabId: 'Mobile',
        mobileTabId,
    });
};

// export const notificationTabberData = [
//     {
//         id: 'Web',
//         text: 'Web',
//         icon: `${web_notification_large} icon-lg`,
//         component:() => <Web />,
//     },
//     {
//         id: 'Mobile',
//         text: 'Mobile',
//         icon: `${mobile_notification_large} icon-lg`,
//         component: 'Mobile',
//     },
// ];
