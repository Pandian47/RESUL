import {
    NOTIFICATION_TABBER_CONFIG,
    SOCIAL_TABBER_CONFIG,
    ANALYTICS_TABBER_CONFIG,
    SOCIALADS_TABBER_CONFIG,
} from '../constant';

export const getTabberConfig = (channel) => {
    switch (channel) {
        case 'notification':
            return NOTIFICATION_TABBER_CONFIG;
        case 'social':
            return SOCIAL_TABBER_CONFIG;
        case 'ads':
            return SOCIALADS_TABBER_CONFIG;
        case 'analytics':
            return ANALYTICS_TABBER_CONFIG;
        default:
            return NOTIFICATION_TABBER_CONFIG;
    }
};

// Benchmark channel key helpers (API -> UI/form mapping)
export const BENCHMARK_CHANNEL_GROUP = {
    MobilePushAndroid: 'mobilePush',
    MobilePushIos: 'mobilePush',
};

export const getBenchmarkFormKey = (channelKey) => {
    switch (channelKey) {
        case 'Email':
            return 'email';
        case 'DirectMail':
        case 'Directmail':
        case 'directmail':
            return 'directmail';
        case 'Mobile': // API key for SMS
            return 'sms';
        case 'WhatsApp':
            return 'whatsapp';
        case 'RCS':
            return 'rcs';
        case 'WebPush':
            return 'webPush';
        case 'MobilePushAndroid':
        case 'MobilePushIos':
            return 'mobilePush';
        case 'Facebook':
            return 'facebook';
        case 'Instagram':
            return 'instagram';
        case 'LinkedIn':
            return 'linkedin';
        case 'Pinterest':
            return 'pinterest';
        case 'GoogleAds':
            return 'google';
        case 'FacebookAds':
            return 'facebookads';
        case 'LindenAds': // backend uses this key for LinkedIn Ads
            return 'linkedinads';
        case 'X': // backend uses X for Twitter
            return 'twitter';
        case 'XAds':
            return 'twitterads';
        case 'QR':
            return 'qr';
        default:
            return String(channelKey || '').toLowerCase();
    }
};

export const getBenchmarkChannelDisplayText = (channelKey) => {
    switch (channelKey) {
        case 'Mobile':
            return 'SMS';
        case 'DirectMail':
        case 'Directmail':
        case 'directmail':
            return 'Direct mail';
        case 'WhatsApp':
            return 'WhatsApp';
        case 'RCS':
            return 'RCS';
        case 'MobilePushAndroid':
            return 'Mobile push';
        case 'MobilePushIos':
            return 'Mobile push';
        case 'X':
            return 'X';
        case 'XAds':
            return 'X Ads';
        case 'GoogleAds':
            return 'Google';
        case 'FacebookAds':
            return 'Facebook';
        case 'LindenAds':
            return 'LinkedIn';
        default:
            return channelKey;
    }
};

// Backend save payload expects some legacy names (Sms/Qr casing)
export const getBenchmarkSaveChannelName = (channelKey) => {
    switch (channelKey) {
        case 'Mobile':
            return 'Sms';
        case 'QR':
            return 'Qr';
        default:
            return channelKey;
    }
};

export const getBenchmarkSaveOrder = (channelKeys = []) => {
    const keys = Array.isArray(channelKeys) ? channelKeys : [];
    const desired = [
        'Email',
        'Mobile', // -> Sms
        'QR', // -> Qr
        'Facebook',
        'X',
        'LinkedIn',
        'Pinterest',
        'Instagram',
        'WhatsApp',
        'WebPush',
        'MobilePushAndroid',
        'MobilePushIos',
        'GoogleAds',
        'FacebookAds',
        'XAds',
        'LindenAds',
        // optional/extra channels
        'RCS',
        'DirectMail',
        'Directmail',
        'directmail',
    ];

    const inDesired = desired.filter((k) => keys.includes(k));
    const rest = keys.filter((k) => !desired.includes(k));
    return [...inDesired, ...rest];
};
