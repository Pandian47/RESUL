import { getChanelName } from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Create/constant';
/**
 * Inner edit skeleton variants — same layout for SDC and MDC per channel id.
 * Route shells (vertical tabs vs MDC-only) stay separate in suspense components.
 */
export const AUTHORING_CHANNEL_INNER_VARIANT = {
    EMAIL_COMPACT: 'email-compact',
    WHATSAPP_PREVIEW: 'whatsapp-preview',
    SMS_PREVIEW: 'sms-preview',
    MESSAGING_PREVIEW: 'messaging-preview',
    RCS_PREVIEW: 'rcs-preview',
    WEB_PUSH_PREVIEW: 'web-push-preview',
    MOBILE_PUSH_PREVIEW: 'mobile-push-preview',
    NOTIFICATION_PREVIEW: 'notification-preview',
    VMS_TABS: 'vms-tabs',
    VOICE_BASIC: 'voice-basic',
    SOCIAL_PREVIEW: 'social-preview',
    ADS_COMPACT: 'ads-compact',
    FORM_BASIC: 'form-basic',
    COMPACT: 'compact',
    /** Legacy — prefer EMAIL_COMPACT; kept for explicit overrides only */
    EMAIL_FULL: 'email-full',
    /** Web analytics — platform, domain (indented), goal checkboxes */
    WEB_ANALYTICS_PREVIEW: 'web-analytics-preview',
    /** App / mobile analytics — platform, goal checkboxes (no domain row) */
    APP_ANALYTICS_PREVIEW: 'app-analytics-preview',
    /** @deprecated — use WEB_ANALYTICS_PREVIEW or APP_ANALYTICS_PREVIEW */
    ANALYTICS_TABS: 'analytics-tabs',
    /** QR — form left + preview panel right */
    QR_PREVIEW: 'qr-preview',
};

/** Per channel id — matches real authoring form layout */
const CHANNEL_ID_TO_INNER_VARIANT = {
    1: AUTHORING_CHANNEL_INNER_VARIANT.EMAIL_COMPACT,
    33: AUTHORING_CHANNEL_INNER_VARIANT.EMAIL_COMPACT,
    2: AUTHORING_CHANNEL_INNER_VARIANT.SMS_PREVIEW,
    21: AUTHORING_CHANNEL_INNER_VARIANT.WHATSAPP_PREVIEW,
    41: AUTHORING_CHANNEL_INNER_VARIANT.RCS_PREVIEW,
    8: AUTHORING_CHANNEL_INNER_VARIANT.WEB_PUSH_PREVIEW,
    14: AUTHORING_CHANNEL_INNER_VARIANT.MOBILE_PUSH_PREVIEW,
    7: AUTHORING_CHANNEL_INNER_VARIANT.SOCIAL_PREVIEW,
    10: AUTHORING_CHANNEL_INNER_VARIANT.ADS_COMPACT,
    26: AUTHORING_CHANNEL_INNER_VARIANT.VOICE_BASIC,
    25: AUTHORING_CHANNEL_INNER_VARIANT.VMS_TABS,
    3: AUTHORING_CHANNEL_INNER_VARIANT.QR_PREVIEW,
    34: AUTHORING_CHANNEL_INNER_VARIANT.QR_PREVIEW,
    6: AUTHORING_CHANNEL_INNER_VARIANT.WEB_ANALYTICS_PREVIEW,
    16: AUTHORING_CHANNEL_INNER_VARIANT.APP_ANALYTICS_PREVIEW,
};

const FAMILY_FALLBACK_VARIANT = {
    email: AUTHORING_CHANNEL_INNER_VARIANT.EMAIL_COMPACT,
    messaging: AUTHORING_CHANNEL_INNER_VARIANT.MESSAGING_PREVIEW,
    notifications: AUTHORING_CHANNEL_INNER_VARIANT.NOTIFICATION_PREVIEW,
    socialpost: AUTHORING_CHANNEL_INNER_VARIANT.SOCIAL_PREVIEW,
    voice: AUTHORING_CHANNEL_INNER_VARIANT.VOICE_BASIC,
    vms: AUTHORING_CHANNEL_INNER_VARIANT.VMS_TABS,
    ads: AUTHORING_CHANNEL_INNER_VARIANT.ADS_COMPACT,
    qr: AUTHORING_CHANNEL_INNER_VARIANT.QR_PREVIEW,
    analytics: AUTHORING_CHANNEL_INNER_VARIANT.WEB_ANALYTICS_PREVIEW,
    webhooks: AUTHORING_CHANNEL_INNER_VARIANT.FORM_BASIC,
};

/** Channel-wise inner variant (SDC + MDC identical per channel id). */
export const getAuthoringChannelInnerVariant = (channelId) => {
    const key = Number(channelId);
    if (Number.isFinite(key) && CHANNEL_ID_TO_INNER_VARIANT[key]) {
        return CHANNEL_ID_TO_INNER_VARIANT[key];
    }
    const family = getChanelName(key);
    return FAMILY_FALLBACK_VARIANT[family] ?? AUTHORING_CHANNEL_INNER_VARIANT.COMPACT;
};

/** @deprecated */
export const getAuthoringChannelEditSkeletonProfile = getAuthoringChannelInnerVariant;
