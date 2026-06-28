import { ch_direct_mail, ch_email, ch_facebook, ch_google_plus, ch_insta, ch_landing_page, ch_line, ch_linkedIn, ch_mobile_push, ch_orm, ch_others, ch_paid_media, ch_pinterest, ch_qR_code, ch_rcs, ch_sms, ch_social_media, ch_social_post, ch_twitter, ch_video, ch_vms, ch_voice, ch_web_analytics, ch_web_push, ch_webhook, ch_webinar, ch_website, ch_whatsapp, ch_youtube } from 'Constants/GlobalConstant/Colors/colorsVariable';
const DEFAULT = '#e7f2f8';

const normalizeForMatch = (s) => s.trim().toLowerCase().replace(/\s+/g, ' ');
const CONVERSION_CHANNEL_RULES = [
    {
        color: ch_email,
        labels: ['Email'],
        needles: ['email'],
    },
    {
        color: ch_facebook,
        labels: ['Facebook', 'Facebook Ads'],
        needles: ['facebook ads', 'facebook'],
    },
    {
        color: ch_insta,
        labels: ['Instagram'],
        needles: ['instagram'],
    },
    {
        color: ch_pinterest,
        labels: ['Pinterest'],
        needles: ['pinterest'],
    },
    {
        color: ch_youtube,
        labels: ['Youtube', 'YouTube'],
        needles: ['youtube'],
    },
    {
        color: ch_sms,
        labels: ['SMS'],
        needles: ['sms'],
    },
    {
        color: ch_rcs,
        labels: ['RCS'],
        needles: ['rcs'],
    },
    {
        color: ch_vms,
        labels: ['VMS'],
        needles: ['vms'],
    },
    {
        color: ch_voice,
        labels: ['Voice'],
        needles: ['voice'],
    },
    {
        color: ch_whatsapp,
        labels: ['WhatsApp'],
        needles: ['whatsapp'],
    },
    {
        color: ch_linkedIn,
        labels: ['LinkedIn Ads', 'LinkedIn'],
        needles: ['linkedin ads', 'linkedin'],
    },
    {
        color: ch_twitter,
        labels: ['X Ads', 'X', 'Twitter'],
        needles: ['x ads', 'twitter ads', 'twitter'],
    },
    {
        color: ch_social_media,
        labels: ['Social media'],
        needles: ['social media'],
    },
    {
        color: ch_social_post,
        labels: ['Social post'],
        needles: ['social post'],
    },
    {
        color: ch_paid_media,
        labels: ['Paid media', 'Paid', 'Google Ads', 'Google'],
        needles: ['google ads', 'google', 'paid media'],
        matchPaidWord: true,
    },
    {
        color: ch_qR_code,
        labels: ['QR code', 'QR'],
        needles: ['qr code', 'qrcode', 'qr'],
    },
    {
        color: ch_website,
        labels: ['Website'],
        needles: ['website'],
    },
    {
        color: ch_web_push,
        labels: ['Web Push', 'Web notification', 'Web push'],
        needles: ['web notification', 'web push'],
    },
    {
        color: ch_mobile_push,
        labels: ['Mobile Push', 'Mobile push', 'Mobile notification'],
        needles: ['mobile notification', 'mobile push', 'mobilenotification', 'mobilepush'],
    },
    {
        color: ch_web_analytics,
        labels: ['Web analytics', 'Web app analytics'],
        needles: ['web app analytics', 'web analytics'],
    },
    {
        color: ch_orm,
        labels: ['ORM'],
        needles: [],
    },
    {
        color: ch_webinar,
        labels: ['Webinar'],
        needles: ['webinar'],
    },
    {
        color: ch_video,
        labels: ['Video'],
        needles: ['video'],
    },
    {
        color: ch_line,
        labels: ['Line'],
        needles: [],
    },
    {
        color: ch_direct_mail,
        labels: ['Direct mail'],
        needles: ['direct mail', 'directmail'],
    },
    {
        color: ch_webhook,
        labels: ['Webhook', 'Custom events', 'Communication response'],
        needles: ['communication response', 'custom events', 'webhook'],
    },
    {
        color: ch_landing_page,
        labels: ['Digipop'],
        needles: ['digipop'],
    },
    {
        color: ch_google_plus,
        labels: ['Google plus'],
        needles: ['google plus', 'google+'],
    },
    {
        color: ch_mobile_push,
        labels: ['App'],
        needles: [],
    },
    {
        color: ch_others,
        labels: ['offlineConversion'],
        needles: ['offline conversion', 'offlineconversion'],
    },
];

export const CONVERSION_CHANNEL_COLORS = Object.fromEntries(
    CONVERSION_CHANNEL_RULES.flatMap(({ color, labels }) => labels.map((l) => [l, color])),
);

const byLowerKey = Object.fromEntries(
    Object.entries(CONVERSION_CHANNEL_COLORS).map(([k, v]) => [normalizeForMatch(k), v]),
);

const SUBSTR = CONVERSION_CHANNEL_RULES.flatMap(({ color, needles }) =>
    needles.map((needle) => [needle, color]),
);

const paidFallbackColor =
    CONVERSION_CHANNEL_RULES.find((r) => r.matchPaidWord)?.color ?? ch_paid_media;

export const getConversionChannelConfig = (channelName) => {
    if (!channelName || typeof channelName !== 'string') {
        return { label: channelName || '', color: DEFAULT };
    }
    const label = channelName.trim();
    const key = normalizeForMatch(channelName);

    let color = CONVERSION_CHANNEL_COLORS[label] ?? byLowerKey[key];
    if (color == null) {
        for (const [needle, c] of SUBSTR) {
            if (key.includes(needle)) {
                color = c;
                break;
            }
        }
    }
    if (color == null && /\bpaid\b/i.test(key)) color = paidFallbackColor;

    return { label, color: color ?? DEFAULT };
};
