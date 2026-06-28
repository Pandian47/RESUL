import { ch_color1, ch_email, ch_linkedIn, ch_mobile_push, ch_paid_media, ch_qR_code, ch_rcs, ch_sms, ch_vms, ch_web_push, ch_webhook, ch_whatsapp } from 'Constants/GlobalConstant/Colors/colorsVariable';
import { circle_paid_media_large, circle_paid_media_medium, circle_paid_media_mini, circle_paid_media_xlarge, communication_response_sync_large, custom_event_large, email_direct_large, email_direct_medium, email_direct_mini, email_large, email_medium, email_mini, email_xlarge, messaging_rcs_large, messaging_rcs_medium, mobile_analytics_large, mobile_analytics_medium, mobile_analytics_mini, mobile_analytics_xlarge, mobile_app_medium, mobile_notification_large, mobile_notification_medium, mobile_notification_mini, mobile_notification_xlarge, mobile_sms_large, mobile_sms_medium, mobile_sms_mini, mobile_sms_xlarge, orm_large, orm_medium, orm_mini, qrcode_large, qrcode_medium, qrcode_mini, qrcode_xlarge, social_digipop_large, social_digipop_medium, social_digipop_mini, social_digipop_xlarge, social_facebook_app_large, social_facebook_app_medium, social_facebook_app_mini, social_facebook_large, social_facebook_medium, social_facebook_mini, social_google_ad_large, social_google_ad_medium, social_google_ad_mini, social_google_plus_large, social_google_plus_medium, social_google_plus_mini, social_instagram_large, social_instagram_medium, social_instagram_mini, social_line_large, social_line_medium, social_line_mini, social_linkedin_large, social_linkedin_medium, social_linkedin_mini, social_linkedin_xlarge, social_pinterest_large, social_pinterest_medium, social_pinterest_mini, social_post_large, social_post_medium, social_post_mini, social_post_xlarge, social_twitter_large, social_twitter_medium, social_twitter_mini, social_twitter_xlarge, social_vms_large, social_vms_medium, social_vms_mini, social_vms_xlarge, social_whatsapp_large, social_whatsapp_medium, social_whatsapp_mini, social_whatsapp_xlarge, social_youtube_large, social_youtube_medium, social_youtube_mini, video_large, video_share_large, video_share_medium, video_share_mini, video_share_xlarge, voice_assistant_large, voice_assistant_medium, voice_assistant_mini, web_analytics_large, web_analytics_medium, web_analytics_mini, web_notification_large, web_notification_medium, web_notification_mini, web_notification_xlarge, webhook_large, webhook_medium, webhook_mini, webhook_xlarge, webinar_large, webinar_medium, webinar_mini, webinar_xlarge } from 'Constants/GlobalConstant/Glyphicons';
import { toSafeLowerCase } from './stringUtils';
/** Returned when channel/social/paid-media lookup has no match — safe for destructuring and property access. */
const EMPTY_CHANNEL_LOOKUP = {
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

export const BRAND_ID_CHECK = ['Seed list', 'Target list'];
export const CHANNELS_LIST = [
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

export const PAID_CHANNEL_LIST = [
    {
        id: 1,
        Channel: 'Google Ads',
        icon: social_google_ad_medium,
    },
    {
        id: 2,
        Channel: 'Facebook Ads',
        icon: social_facebook_medium,
    },
    {
        id: 3,
        Channel: 'X Ads',
        icon: social_twitter_medium,
    },
    {
        id: 4,
        Channel: 'LinkedIn Ads',
        icon: social_linkedin_medium,
    },
];

export const CHANNELSSOCIAL_LIST = [
    {
        id: 1,
        subChannelId: 1,
        lable: 'Email',
        sno: 1,
    },
    {
        id: 2,
        subChannelId: 2,
        lable: 'SMS',
        sno: 2,
    },
    {
        id: 21,
        subChannelId: 21,
        lable: 'WhatsApp',
        sno: 3,
    },
    {
        id: 25,
        subChannelId: 25,
        lable: 'VMS',
        sno: 4,
    },

    {
        id: 8,
        subChannelId: 8,
        lable: 'Web notification',
        sno: 5,
    },
    {
        id: 14,
        subChannelId: 14,
        lable: 'Mobile notification ',
        sno: 6,
    },

    {
        id: 7,
        subChannelId: 1,
        lable: 'Facebook',
        sno: 7,
    },
    {
        id: 7,
        subChannelId: 3,
        lable: 'Twitter',
        sno: 8,
    },
    {
        id: 7,
        subChannelId: 6,
        lable: 'Instagram',
        sno: 9,
    },
    {
        id: 7,
        subChannelId: 8,
        lable: 'LinkedIn',
        sno: 10,
    },
    {
        id: 7,
        subChannelId: 5,
        lable: 'Pinterest',
        sno: 11,
    },
    // {
    //     id: 10,
    //subChannelId: 10,
    //     lable: 'Paid media',
    //sno: 12,
    // },

    // {
    //     id: 15,
    // subChannelId: 15,
    //     lable: 'Video',
    //sno: 13,
    // },

    {
        id: 26,
        subChannelId: 26,
        lable: 'Voice',
        sno: 14,
    },
    {
        id: 3,
        subChannelId: 3,
        lable: 'QR',
        sno: 15,
    },
    {
        id: 34,
        subChannelId: 34,
        lable: 'Webhook',
        sno: 16,
    },
    {
        id: 41,
        subChannelId: 41,
        lable: 'RCS',
        sno: 17,
    },
];

export const STATUS_LIST = [
    {
        id: 5,
        label: 'In progress',
    },
    {
        id: 26,
        label: 'Stopped',
    },
    {
        id: 27,
        label: 'Paused',
    },
    {
        id: 7,
        label: 'Scheduled',
    },
    {
        id: 9,
        label: 'Completed',
    },
    {
        id: 52,
        label: 'Alert',
    },
    {
        id: 20,
        label: 'Multi status',
    },
    {
        id: 6,
        label: 'Draft',
    },
    {
        id: 3,
        label: 'Deleted',
    },
    {
        id: 70,
        label: 'Archived',
    }
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
                // icon_xl: icons.web_analytics_xlarge,
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
export function getChannelSocialId(id = 0) {
    id = toSafeLowerCase(id, '0');
    switch (id) {
        case '1':
        case 'facebook':
            return {
                id: 1,
                label: 'Facebook',
                icon_xs: social_facebook_mini,
                icon: social_facebook_medium,
                icon_lg: social_facebook_large,
                icon_xl: social_facebook_large,
                color: ch_email,
                bgColor: 'bg-facebook',
                name: 'Facebook',
                tabName: 'facebook',
                content: '',
            };
        case '2':
        case 'facebookapp':
            return {
                id: 2,
                label: 'Facebook app',
                icon_xs: social_facebook_app_mini,
                icon: social_facebook_app_medium,
                icon_lg: social_facebook_app_large,
                icon_xl: social_facebook_app_large,
                color: ch_email,
                bgColor: 'bg-facebook',
                name: 'Facebook app',
                tabName: 'facebook',
                content: '',
            };
        case '3':
        case 'twitter':
            return {
                id: 3,
                label: 'Twitter',
                icon_xs: social_twitter_mini,
                icon: social_twitter_medium,
                icon_lg: social_twitter_large,
                icon_xl: social_twitter_xlarge,
                color: ch_email,
                bgColor: 'bg-twitter',
                name: 'Twitter',
                tabName: 'twitter',
                content: '',
            };
        case '4':
        case 'googleplus':
            return {
                id: 4,
                label: 'Google plus',
                icon_xs: social_google_plus_mini,
                icon: social_google_plus_medium,
                icon_lg: social_google_plus_large,
                icon_xl: social_google_plus_large,
                color: ch_email,
                bgColor: 'bg-email',
                name: 'Google plus',
                content: '',
            };
        case '5':
        case 'pinterest':
            return {
                id: 5,
                label: 'Pinterest',
                icon_xs: social_pinterest_mini,
                icon: social_pinterest_medium,
                icon_lg: social_pinterest_large,
                icon_xl: social_pinterest_large,
                color: ch_email,
                bgColor: 'bg-pinterest',
                name: 'Pinterest',
                tabName: 'pinterest',
                content: '',
            };
        case '6':
        case 'instagram':
            return {
                id: 6,
                label: 'Instagram',
                icon_xs: social_instagram_mini,
                icon: social_instagram_medium,
                icon_lg: social_instagram_large,
                icon_xl: social_instagram_large,
                color: ch_email,
                bgColor: 'bg-insta',
                name: 'Instagram',
                tabName: 'instagram',
                content: '',
            };
        case '7':
        case 'youtube':
            return {
                id: 7,
                label: 'Youtube',
                icon_xs: social_youtube_mini,
                icon: social_youtube_medium,
                icon_lg: social_youtube_large,
                icon_xl: social_youtube_large,
                color: ch_email,
                bgColor: 'bg-email',
                name: 'Youtube',
                content: '',
            };
        case '8':
        case 'linkedin':
            return {
                id: 7,
                label: 'LinkedIn',
                icon_xs: social_linkedin_mini,
                icon: social_linkedin_medium,
                icon_lg: social_linkedin_large,
                icon_xl: social_linkedin_xlarge,
                color: ch_email,
                bgColor: 'bg-linkedin',
                name: 'LinkedIn',
                tabName: 'linkedIn',
                content: '',
            };
    }
    return EMPTY_CHANNEL_LOOKUP;
}
export function getChannelPaidMediaId(id = 0) {
    id = toSafeLowerCase(id, '0');
    switch (id) {
        case '1':
        case 'Google Ads':
            return {
                id: 4,
                label: 'Google Ads',
                icon_xs: social_google_ad_mini,
                icon: social_google_ad_medium,
                icon_lg: social_google_ad_large,
                icon_xl: social_google_ad_large,
                color: ch_email,
                bgColor: 'bg-google-ads',
                name: 'Google Ads',
                tabName: 'googleAds',
                content: '',
            };
        case '2':
        case 'Facebook Ads':
            return {
                id: 2,
                label: 'Facebook Ads',
                icon_xs: social_facebook_mini,
                icon: social_facebook_medium,
                icon_lg: social_facebook_large,
                icon_xl: social_facebook_large,
                color: ch_email,
                bgColor: 'bg-facebook-ads',
                name: 'Facebook Ads',
                tabName: 'facebookAds',
                content: '',
            };
        case '3':
        case 'Twitter Ads':
            return {
                id: 3,
                label: 'X Ads',
                icon_xs: social_twitter_mini,
                icon: social_twitter_medium,
                icon_lg: social_twitter_large,
                icon_xl: social_twitter_xlarge,
                color: ch_email,
                bgColor: 'bg-x-ads',
                name: 'Twitter Ads',
                tabName: 'twitterAds',
                content: '',
            };
        case '4':
        case 'LinkedIn Ads':
            return {
                id: 4,
                label: 'LinkedIn Ads',
                icon_xs: social_linkedin_mini,
                icon: social_linkedin_medium,
                icon_lg: social_linkedin_large,
                icon_xl: social_linkedin_xlarge,
                color: ch_email,
                bgColor: 'bg-linkedin-ads',
                name: 'Linkedin Ads',
                tabName: 'linkedInAds',
                content: '',
            };
        case '9':
        case 'Digipop':
            return {
                id: 9,
                label: 'Digipop',
                icon_xs: social_digipop_mini,
                icon: social_digipop_medium,
                icon_lg: social_digipop_large,
                icon_xl: social_digipop_xlarge,
                color: ch_email,
                bgColor: 'bg-linkedin',
                name: 'Digipop',
                tabName: 'digipop',
                content: '',
            };
    }
    return EMPTY_CHANNEL_LOOKUP;
}

export const analyticsAvaliableIds = [5, 9, 20];
export const analyticsIds = [6, 16, 5, 4, 15, 13, 1001];
export const channelIds = [1, 2, 8, 9, 7, 26, 10, 3, 21, 25, 14, 41];

export function getWeekName(id) {
    if (id == null || id === '') return undefined;
    id = toSafeLowerCase(id);
    switch (id) {
        case 'm':
            return {
                label: 'Monday',
                short: 'mon',
            };
        case 't':
            return {
                label: 'Tuesday',
                short: 'tue',
            };
        case 'w':
            return {
                label: 'Wednesday',
                short: 'wed',
            };
        case 's':
            return {
                label: 'Saturday',
                short: 'sat',
            };
        case 'td':
            return {
                label: 'Thursday',
                short: 'thu',
            };
        case 'su':
            return {
                label: 'Sunday',
                short: 'sun',
            };
        case 'f':
            return {
                label: 'Friday',
                short: 'fri',
            };
    }
}

/** Maps a channel tab name to the communication edit-flow vertical category. */
export function getNameType(value) {
    if (value == null || value === '') return 'qr';
    if (value === 'email' || value === 'directmail') {
        return 'email';
    }
    if (value === 'sms' || value === 'whats app' || value === 'vms' || value === 'line' || value === 'rcs') {
        return 'messaging';
    }
    if (
        value === 'facebook' ||
        value === 'twitter' ||
        value === 'instagram' ||
        value === 'social post' ||
        value === 'linked in' ||
        value === 'pinterest'
    ) {
        return 'socialPost';
    }
    if (value === 'mobile' || value === 'web') {
        return 'notification';
    }
    if (
        value === 'google ads' ||
        value === 'facebook ads' ||
        value === 'twitter ads' ||
        value === 'linkedin ads' ||
        value === 'digipop' ||
        value === 'vuer'
    ) {
        return 'ads';
    }
    if (
        value === 'web analytics' ||
        value === 'app' ||
        value === 'offlineConversion' ||
        value === 'offline conversion' ||
        value === 'offlineconversion'
    ) {
        return 'analytics';
    }
    if (value === 'Voice' || value === 'call center') {
        return 'voice';
    }
    return 'qr';
}

export async function getFileFromUrl(url, fileName, options) {
    try {
        const response = await fetch(url);
        const blob = response.blob();
        return new File([blob], fileName, options);
    } catch (err) {
    }
}

