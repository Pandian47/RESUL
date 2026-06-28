import { ch_color1, ch_email, ch_linkedIn, ch_mobile_push, ch_paid_media, ch_qR_code, ch_rcs, ch_sms, ch_vms, ch_web_push, ch_webhook, ch_whatsapp } from 'Constants/GlobalConstant/Colors/colorsVariable';
import { circle_paid_media_large, circle_paid_media_medium, circle_paid_media_mini, circle_paid_media_xlarge, communication_response_sync_large, custom_event_large, email_direct_large, email_direct_medium, email_direct_mini, email_large, email_medium, email_mini, email_xlarge, messaging_rcs_large, messaging_rcs_medium, mobile_analytics_large, mobile_analytics_medium, mobile_analytics_mini, mobile_analytics_xlarge, mobile_app_medium, mobile_notification_large, mobile_notification_medium, mobile_notification_mini, mobile_notification_xlarge, mobile_sms_large, mobile_sms_medium, mobile_sms_mini, mobile_sms_xlarge, orm_large, orm_medium, orm_mini, qrcode_large, qrcode_medium, qrcode_mini, qrcode_xlarge, social_facebook_medium, social_line_large, social_line_medium, social_line_mini, social_post_large, social_post_medium, social_post_mini, social_post_xlarge, social_vms_large, social_vms_medium, social_vms_mini, social_vms_xlarge, social_whatsapp_large, social_whatsapp_medium, social_whatsapp_mini, social_whatsapp_xlarge, video_large, video_share_large, video_share_medium, video_share_mini, video_share_xlarge, voice_assistant_large, voice_assistant_medium, voice_assistant_mini, web_analytics_large, web_analytics_medium, web_analytics_mini, web_analytics_xlarge, web_notification_large, web_notification_medium, web_notification_mini, web_notification_xlarge, webhook_large, webhook_medium, webhook_mini, webhook_xlarge, webinar_large, webinar_medium, webinar_mini, webinar_xlarge } from 'Constants/GlobalConstant/Glyphicons';
/**
 * ResGrid channel constants — duplicated from src/Utils/modules/communicationChannels.jsx
 * Keep in sync when platform channel icons / colors change.
 */
const toSafeLowerCase = (value, fallback = '') => {
    if (value == null || value === '') return fallback;
    return String(value).toLowerCase().trim();
};

export const EMPTY_CHANNEL_LOOKUP = {
    id: 0,
    label: '',
    name: '',
    tabName: '',
    icon: '',
    icon_xs: '',
    icon_lg: '',
    icon_xl: '',
    color: '',
    bgColor: '',
    content: '',
};
export const RESGRID_CHANNELS_LIST = [
    {
        id: 1,
        lable: 'Email',
        Channel: 'Email',
        icon: email_medium,
    },
    {
        id: 2,
        lable: 'SMS',
        Channel: 'SMS',
        icon: mobile_sms_medium,
    },
    {
        id: 3,
        lable: 'QR',
        Channel: 'QR',
        icon: qrcode_medium,
    },
    {
        id: 4,
        lable: 'Orm',
        Channel: 'Orm',
        icon: orm_medium,
    },
    {
        id: 5,
        lable: 'Social media',
        Channel: 'Social media',
        icon: social_facebook_medium,
    },
    // {
    //     id: 6,
    //     Channel: 'Web push',
    //     lable: 'Web push',
    //     icon: web_notification_medium,
    // },
    {
        id: 7,
        lable: 'Social post',
        Channel: 'Social post',
        icon: social_post_medium,
    },
    {
        id: 8,
        lable: 'Web push',
        Channel: 'Web push',
        icon: web_notification_medium,
    },
    {
        id: 10,
        lable: 'Paid media',
        Channel: 'Paid media',
        icon: circle_paid_media_medium,
    },
    {
        id: 13,
        channel: 'Webinar',
        lable: 'Webinar',
        icon: webinar_medium,
    },
    {
        id: 14,
        lable: 'Mobile push',
        Channel: 'Mobile push',
        icon: mobile_notification_medium,
    },
    {
        id: 15,
        lable: 'Video',
        Channel: 'Video',
        icon: video_large,
    },
    {
        id: 21,
        lable: 'WhatsApp',
        Channel: 'WhatsApp',
        icon: social_whatsapp_medium,
    },
    {
        id: 25,
        lable: 'VMS',
        Channel: 'VMS',
        icon: social_vms_medium,
    },
    {
        id: 26,
        lable: 'Voice',
        Channel: 'Voice',
        icon: voice_assistant_medium,
    },
    // {
    //     id: 34,
    //     lable: 'Webhook',
    //     Channel: 'Webhook',
    // },
    {
        id: 30,
        lable: 'Line',
        Channel: 'Line',
        icon: social_line_medium,
    },
    {
        id: 16,
        lable: 'App',
        channel: 'App',
        icon: mobile_app_medium,
    },
    {
        id: 9,
        lable: 'Mobile push',
        Channel: 'Mobile push',
        icon: mobile_notification_medium,
    },
    // {
    //     id: 31,
    //     lable: 'Two Way SMS',
    // },
    {
        id: 33,
        lable: 'Direct mail',
        Channel: 'Direct mail',
        icon: email_direct_medium,
    },
    {
        id: 34,
        lable: 'Webhook',
        channel: 'Webhook',
        icon: webhook_medium,
    },
    {
        id: 41,
        lable: 'RCS',
        channel: 'RCS',
        icon: messaging_rcs_medium,
    },
];
export function getChannelId(id = 0) {
    id = toSafeLowerCase(id, '0');
    switch (id) {
        case '1':
        case 'email':
            return {
                id: 1,
                label: 'Email',
                icon_xs: email_mini,
                icon: email_medium,
                icon_lg: email_large,
                icon_xl: email_xlarge,
                color: ch_email,
                bgColor: 'bg-email',
                name: 'Email',
                tabName: 'email',
                content: 'One out of every ten people in the world can be reached through email.',
            };
        case '2':
        case 'sms':
            return {
                id: 2,
                label: 'SMS', //'Messaging', //"Sms"
                icon_xs: mobile_sms_mini,
                icon: mobile_sms_medium,
                icon_lg: mobile_sms_large,
                icon_xl: mobile_sms_xlarge,
                color: ch_sms,
                bgColor: 'bg-sms',
                tabName: 'sms',
                content: 'Half of the global population uses text messaging services.',
            };
        case '3':
        case 'qrcode':
            return {
                id: 3,
                label: 'QR',
                icon_xs: qrcode_mini,
                icon: qrcode_medium,
                icon_lg: qrcode_large,
                icon_xl: qrcode_xlarge,
                color: ch_qR_code,
                bgColor: 'bg-qr-code',
                tabName: 'qr',
                content: 'Half of the world uses text message services.',
            };
        case '4':
        case 'orm':
            return {
                id: 4,
                label: 'ORM',
                icon_xs: orm_mini,
                icon: orm_medium,
                icon_lg: orm_large,
                icon_xl: orm_large,
                color: ch_color1,
                bgColor: 'ch_sms',
                tabName: 'orm',
                content: 'Half of the world uses text message services.',
            };
        case '5':
        case 'socialmedia':
            return {
                id: 5,
                label: 'Social media',
                icon_xs: social_post_mini,
                icon: social_post_medium,
                icon_lg: social_post_large,
                icon_xl: social_post_xlarge,
                color: ch_paid_media,
                bgColor: 'bg-social-media',
                content: 'Half of the world uses text message services.',
            };
        case '6':
        case 'webanalytics':
            return {
                id: 6,
                label: 'Web analytics',
                icon_xs: web_analytics_mini,
                icon: web_analytics_medium,
                icon_lg: web_analytics_large,
                // icon_xl: web_analytics_xlarge,
                color: ch_webhook,
                bgColor: 'bg-web-analytics',
                tabName: 'web analytics',
                content: 'Half of the world uses text message services.',
            };
        case '7':
        case 'socialpost':
            return {
                id: 7,
                label: 'Social post',
                icon_xs: social_post_mini,
                icon: social_post_medium,
                icon_lg: social_post_large,
                icon_xl: social_post_xlarge,
                color: ch_paid_media,
                bgColor: 'bg-social-post',
                content: 'Half of the world uses text message services.',
            };
        case '8':
        case 'webnotification':
        case 'notification':
        case 'webpush':
        case 'web':
        case 'web notification':
            return {
                id: 8,
                label: 'Web notification',
                name: 'web',
                icon_xs: web_notification_mini,
                icon: web_notification_medium,
                icon_lg: web_notification_large,
                icon_xl: web_notification_xlarge,
                color: ch_web_push,
                bgColor: 'bg-web-push',
                tabName: 'web',
                content: '14.7% of marketers actively generate leads by effectively utilizing web notifications.',
            };
        // case '8':
        // case 'webpush':
        // case 'web':
        //     return {
        //         id: 8,
        //         label: 'Web notification',
        //         icon_xs: web_notification_mini,
        //         icon: web_notification_medium,
        //         icon_lg: web_notification_large,
        //         icon_xl: web_notification_xlarge,
        //         color: ch_web_push,
        //     };
        case '9':
        case '14':
        case 'mobilenotification':
        case 'mobile':
        case 'mobilepush':
        case 'mobile push notification':
            return {
                id: 14,
                label: 'Mobile notification',
                name: 'mobile',
                icon_xs: mobile_notification_mini,
                icon: mobile_notification_medium,
                icon_lg: mobile_notification_large,
                icon_xl: mobile_notification_xlarge,
                color: ch_mobile_push,
                bgColor: `bg-mobile-push`,
                tabName: 'mobile',
                content: '25.2% of people actively engage through mobile notifications.',
            };
        // case '14':
        // case 'mobilepush':
        //     return {
        //         id: 14,
        //         label: 'Mobile notification',
        //         icon_xs: mobile_notification_mini,
        //         icon: mobile_notification_medium,
        //         icon_lg: mobile_notification_large,
        //         icon_xl: mobile_notification_xlarge,
        //         color: ch_mobile_push,
        //     };
        case '10':
        case 'paidmedia':
            return {
                id: 10,
                label: 'Paid media',
                icon_xs: circle_paid_media_mini,
                icon: circle_paid_media_medium,
                icon_lg: circle_paid_media_large,
                icon_xl: circle_paid_media_xlarge,
                color: ch_paid_media,
                bgColor: `bg-google-ads`,
                content: 'Half of the world uses text message services.',
            };
        case '13':
        case 'webinar':
            return {
                id: 13,
                label: 'Webinar',
                icon_xs: webinar_mini,
                icon: webinar_medium,
                icon_lg: webinar_large,
                icon_xl: webinar_xlarge,
                color: ch_webhook,
                bgColor: `bg-webinar`,
                content: 'Half of the world uses text message services.',
            };

        case '15':
        case 'video':
            return {
                id: 15,
                label: 'Video',
                icon_xs: video_share_mini,
                icon: video_share_medium,
                icon_lg: video_share_large,
                icon_xl: video_share_xlarge,
                color: ch_email,
                bgColor: `bg-video`,
                content: 'Half of the world uses text message services.',
            };
        case '16':
        case 'app':
            return {
                id: 16,
                label: 'App analytics',
                icon_xs: mobile_analytics_mini,
                icon: mobile_analytics_medium,
                icon_lg: mobile_analytics_large,
                icon_xl: mobile_analytics_xlarge,
                color: ch_mobile_push,
                bgColor: `bg-mobile-push`,
                content: 'Half of the world reached through mobile push notification.',
            };
        case '21':
        case 'whatsapp':
            return {
                id: 21,
                label: 'WhatsApp',
                icon_xs: social_whatsapp_mini,
                icon: social_whatsapp_medium,
                icon_lg: social_whatsapp_large,
                icon_xl: social_whatsapp_xlarge,
                color: ch_whatsapp,
                bgColor: 'bg-whatsapp',
                tabName: 'whats app',
                content: 'Half of the world uses text message services.',
            };
        case '25':
        case 'vms':
            return {
                id: 25,
                label: 'VMS',
                icon_xs: social_vms_mini,
                icon: social_vms_medium,
                icon_lg: social_vms_large,
                icon_xl: social_vms_xlarge,
                color: ch_vms,
                bgColor: 'bg-vms',
                tabName: 'vms',
                content: 'Half of the world uses text message services.',
            };
        case '41':
        case 'rcs':
            return {
                id: 41,
                label: 'RCS',
                icon_xs: messaging_rcs_medium,
                icon: messaging_rcs_medium,
                icon_lg: messaging_rcs_large,
                icon_xl: messaging_rcs_large,
                color: ch_rcs,
                bgColor: 'bg-rcs-message',
                tabName: 'rcs',
                content: 'Half of the world uses text message services.',
            };
        case '26':
        case 'voice':
            return {
                id: 26,
                label: 'Voice',
                icon_xs: voice_assistant_mini,
                icon: voice_assistant_medium,
                icon_lg: voice_assistant_large,
                icon_xl: voice_assistant_large,
                color: ch_vms,
                bgColor: 'bg-voice',
                tabName: 'callCenter',
                content: 'Half of the world uses text message services.',
                name: 'callCenter',
            };
        case '30':
        case 'line':
            return {
                id: 30,
                label: 'Line',
                icon_xs: social_line_mini,
                icon: social_line_medium,
                icon_lg: social_line_large,
                icon_xl: social_line_large,
                color: ch_linkedIn,
                bgColor: 'bg-line',
                content: 'Half of the world uses text message services.',
            };
        case '33':
        case 'directmail':
            return {
                id: 33,
                label: 'Direct mail',
                icon_xs: email_direct_mini,
                icon: email_direct_medium,
                icon_lg: email_direct_large,
                icon_xl: email_direct_large,
                color: ch_email,
                bgColor: 'bg-direct-mail',
                tabName: 'directmail',
                name: 'directmail',
                content: 'Half of the world uses text message services.',
            };
        case '34':
        case 'webhook':
            return {
                id: 34,
                label: 'Webhook',
                icon_xs: webhook_mini,
                icon: webhook_medium,
                icon_lg: webhook_large,
                icon_xl: webhook_xlarge,
                color: ch_webhook,
                bgColor: 'bg-webhook',
                content: 'Half of the world uses text message services.',
            };
        case '39':
        case 'customevents':
            return {
                id: 39,
                label: 'Custom events',
                icon_xs: custom_event_large,
                icon: custom_event_large,
                icon_lg: custom_event_large,
                icon_xl: custom_event_large,
                color: ch_webhook,
                bgColor: 'bg-custom-events',
                tabName: 'custom events',
                content: 'Custom events tracking and analytics.',
            };
        case '40':
        case 'communicationresponse':
            return {
                id: 40,
                label: 'Communication response',
                icon_xs: communication_response_sync_large,
                icon: communication_response_sync_large,
                icon_lg: communication_response_sync_large,
                icon_xl: communication_response_sync_large,
                color: ch_webhook,
                bgColor: 'bg-communication-response',
                tabName: 'communication response',
                content: 'Communication response tracking and analytics.',
            };
        case 'offline conversion': // vennila feedback
        case '1001': // vennila feedback
            return {
                id: 1001,
                label: 'offlineConversion',
            };
    }
    return EMPTY_CHANNEL_LOOKUP;
}


const CHANNEL_DETAIL_METRICS = {
    tick: {
        totalSent: '4,232',
        delivered: '4,185',
        reach: '1,889',
        engagement: '279',
        conversion: '8',
    },
    clock: {
        totalSent: 'N/A',
        delivered: 'N/A',
        reach: 'N/A',
        engagement: 'N/A',
        conversion: 'N/A',
    },
    fail: {
        totalSent: '3,100',
        delivered: '3,050',
        reach: '800',
        engagement: '60',
        conversion: '0',
    },
};

export const getChannelDetailStatusIcon = (status = 'tick') => {
    if (status === 'tick') return 'icon-rs-circle-tick-medium color-primary-green';
    if (status === 'fail') return 'icon-rs-circle-close-medium color-primary-red';
    return 'icon-rs-circle-clock-medium color-secondary-grey';
};

/**
 * Builds a ListDetailCell channel row using platform icon, label, and color from getChannelId.
 */
export function buildResGridChannelRow(channelKey, status = 'tick', overrides = {}) {
    const meta = getChannelId(channelKey);
    const metrics = CHANNEL_DETAIL_METRICS[status] ?? CHANNEL_DETAIL_METRICS.clock;

    return {
        channelId: meta.id,
        name: meta.label || meta.name || '',
        iconClass: meta.icon,
        channelBg: meta.color,
        bgColor: meta.bgColor,
        tabName: meta.tabName,
        statusIcon: getChannelDetailStatusIcon(status),
        ...metrics,
        ...overrides,
    };
}

/** Demo detail rows — keys map to getChannelId() switch cases */
export const CH = {
    email: (status = 'tick', overrides = {}) => buildResGridChannelRow('email', status, overrides),
    sms: (status = 'tick', overrides = {}) => buildResGridChannelRow('sms', status, overrides),
    push: (status = 'tick', overrides = {}) => buildResGridChannelRow('mobile', status, overrides),
    whatsapp: (status = 'tick', overrides = {}) => buildResGridChannelRow('whatsapp', status, overrides),
    web: (status = 'tick', overrides = {}) => buildResGridChannelRow('web', status, overrides),
    vms: (status = 'tick', overrides = {}) => buildResGridChannelRow('vms', status, overrides),
    rcs: (status = 'tick', overrides = {}) => buildResGridChannelRow('rcs', status, overrides),
    qr: (status = 'tick', overrides = {}) => buildResGridChannelRow('qrcode', status, overrides),
    line: (status = 'tick', overrides = {}) => buildResGridChannelRow('line', status, overrides),
    paidMedia: (status = 'tick', overrides = {}) => buildResGridChannelRow('paidmedia', status, overrides),
    webinar: (status = 'tick', overrides = {}) => buildResGridChannelRow('webinar', status, overrides),
    video: (status = 'tick', overrides = {}) => buildResGridChannelRow('video', status, overrides),
    voice: (status = 'tick', overrides = {}) => buildResGridChannelRow('voice', status, overrides),
    webhook: (status = 'tick', overrides = {}) => buildResGridChannelRow('webhook', status, overrides),
};
