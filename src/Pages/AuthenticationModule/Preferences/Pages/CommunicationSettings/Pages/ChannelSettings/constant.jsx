import { circle_paid_media_large, email_footer_large, email_large, email_sub_unsub_large, email_tick_large, lifetime_cap_large, messaging_large, messaging_rcs_large, mobile_notification_large, mobile_sms_large, notification_large, quiet_hors_large, smtp_large, social_line_large, social_vms_large, social_whatsapp_large, web_notification_large } from 'Constants/GlobalConstant/Glyphicons';
import { Suspense, lazy } from 'react';
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

/** Icon sub-tab chunk load — skeleton supplies the bordered panel (no parent box yet). */
const renderLazyInner = (LazyComponent) => () => (
    <Suspense fallback={<CommunicationSettingsInnerTabLoadingBlock />}>
        <LazyComponent />
    </Suspense>
);

/** Horizontal sub-tab chunk load — parent already has `box-design bd-top-border`. */
export const renderEmbeddedLazyInner = (LazyComponent) => () => (
    <Suspense fallback={<CommunicationSettingsInnerTabLoadingBlock embedded />}>
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
    if (navState?.currentTab !== undefined && navState?.currentTab !== null) {
        return navState.currentTab;
    }
    if (navState?.mailTabId) {
        const index = resolveMailTabIndex(navState.mailTabId);
        if (index >= 0) return index;
    }
    if (navState?.from === 'sub') {
        const index = resolveMailTabIndex('SubscriptionUnsubscription');
        if (index >= 0) return index;
    }
    if (navState?.subfrom === 'footer-builder') {
        const index = resolveMailTabIndex('EmailFooter');
        if (index >= 0) return index;
    }
    const isMailVertical =
        navState?.verticalTabId === 'Mail' ||
        navState?.verticalTab === 0;
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

export const resolveMessagingTabIndex = (messagingTabId) => {
    if (!messagingTabId) return -1;
    return MESSAGING_TABBER_CONFIG.findIndex((tab) => tab.id === messagingTabId);
};

export const resolveMessagingTabState = (navState = {}) => {
    if (navState?.messagingTabId) {
        const index = resolveMessagingTabIndex(navState.messagingTabId);
        if (index >= 0) return index;
    }
    if (navState?.from === 'messaging' && navState?.subTab !== undefined && navState?.subTab !== null) {
        return navState.subTab;
    }
    const isMessagingVertical =
        navState?.verticalTabId === 'Messaging' ||
        navState?.verticalTab === 1;
    if (isMessagingVertical && navState?.subTab !== undefined && navState?.subTab !== null) {
        return navState.subTab;
    }
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
        component: renderLazyInner(QuietHours),
    },
    {
        id: 'LifetimeCap',
        text: 'Lifetime cap',
        icon: `${lifetime_cap_large} icon-lg color-primary-blue`,
        component: renderLazyInner(LifetimeCap),
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
        component: renderLazyInner(DoubleOptIn),
    },
    {
        id: 'EmailFooter',
        text: 'Email footer',
        icon: `${email_footer_large} icon-lg color-primary-blue`,
        component: renderLazyInner(EmailFooter),
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
        component: renderLazyInner(VMS),
    },
    {
        id: 'LINE',
        text: 'LINE',
        disable: true,
        icon: `${social_line_large} icon-lg color-primary-blue`,
        component: renderLazyInner(LINE),
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
        component: renderLazyInner(WebMobile),
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
