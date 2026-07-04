import { circle_paid_media_xlarge, email_xlarge, form_generator_xlarge, forms_large, landing_page_builder_xlarge, mobile_notification_xlarge, mobile_sms_xlarge, notification_xlarge, qrcode_xlarge, rcs_large, social_post_xlarge, social_whatsapp_xlarge, web_notification_xlarge } from 'Constants/GlobalConstant/Glyphicons';
import { isPushChannelsDisabled } from 'Utils/modules/environment';
// const templateLists = [
//     {
//         icon: email_xlarge,
//         title: 'Email',
//         // link: 'template-gallery/email-builder',
//         link: 'template-gallery/email-builder-gallery',
//         itemClass: '',
//     },
//     {
//         icon: mobile_sms_xlarge,
//         title: 'SMS',
//         link: '',
//         itemClass: 'click-off',
//     },
//     {
//         icon: form_generator_xlarge,
//         title: 'Forms',
//         link: 'template-gallery/form-generator',
//         itemClass: '',
//     },
//     {
//         icon: notification_xlarge,
//         title: 'Push notifications',
//         link: '',
//         itemClass: 'click-off',
//     },
//     {
//         icon: social_post_xlarge,
//         title: 'Social post',
//         itemClass: 'click-off',
//         link: '',
//     },
//     {
//         icon: landing_page_builder_xlarge,
//         title: 'Landing page',
//         link: 'template-gallery/landingpage-gallery',
//         itemClass: '',
//     },
//     {
//         icon: circle_paid_media_xlarge,
//         title: 'Ads',
//         link: 'template-gallery/ads',
//         itemClass: '',
//     },
//     {
//         icon: qrcode_xlarge,
//         title: 'QR',
//         link: '',
//         itemClass: 'click-off',
//     },
// ];

const templateLists = (env) => {
    const hidePushChannels = isPushChannelsDisabled(env);

    return [
        {
            icon: email_xlarge,
            title: 'Email',
            // link: 'template-gallery/email-builder',
            link: 'template-gallery/email-builder-gallery',
            itemClass: '',
        },
        {
            icon: forms_large,
            title: 'Forms',
            link: 'template-gallery/form-generator',
            itemClass: '',
        },
        {
            icon: landing_page_builder_xlarge,
            title: 'Landing page',
            link: 'template-gallery/landingpage-gallery',
            itemClass: '',
        },
        {
            icon: circle_paid_media_xlarge,
            title: 'Ads',
            link: 'template-gallery/ads',
            itemClass: '',
        },
        {
            icon: social_whatsapp_xlarge,
            title: 'WhatsApp',
            link: 'template-gallery/whatsapp-template-gallery',
            itemClass: '',
        },
        {
            icon: rcs_large,
            title: 'RCS',
            link: 'template-gallery/rcs-template-gallery',
            itemClass: '',
        },
        {
            icon: form_generator_xlarge,
            title: 'Advanced form',
            link: 'template-gallery/advanced-form',
            itemClass: '',
        },
        ...(hidePushChannels
            ? []
            : [
                  {
                      icon: web_notification_xlarge,
                      title: 'Web push',
                      link: 'template-gallery/webpush-builder-gallery',
                      itemClass: '',
                  },
                  {
                      icon: mobile_notification_xlarge,
                      title: 'Mobile push',
                      link: 'template-gallery/mobile-builder-gallery',
                      itemClass: '',
                  },
              ]),
    ];
};

/** Channel IDs for template builder / DuplicateTemplateById API */
export const TEMPLATE_BUILDER_CHANNEL_ID = {
    EMAIL: 1,
    WEB: 8,
    MOBILE: 12,
    LANDING_PAGE: 32,
};

export const resolveTemplateBuilderChannelType = (channelId, channelType, notificationType) => {
    if (channelType) return String(channelType).toLowerCase();
    if (notificationType === 'Web' || notificationType === 'web') return 'web';
    if (notificationType === 'Mobile' || notificationType === 'mobile') return 'mobile';
    const id = Number(channelId);
    if (id === TEMPLATE_BUILDER_CHANNEL_ID.WEB) return 'web';
    if (id === TEMPLATE_BUILDER_CHANNEL_ID.MOBILE || id === 14) return 'mobile';
    if (id === TEMPLATE_BUILDER_CHANNEL_ID.LANDING_PAGE) return 'landing';
    return '';
};

export const getTemplateBuilderChannelId = (type) => {
    switch (String(type || '').toLowerCase()) {
        case 'web':
            return TEMPLATE_BUILDER_CHANNEL_ID.WEB;
        case 'mobile':
            return TEMPLATE_BUILDER_CHANNEL_ID.MOBILE;
        case 'landing':
        case 'landingpage':
            return TEMPLATE_BUILDER_CHANNEL_ID.LANDING_PAGE;
        default:
            return TEMPLATE_BUILDER_CHANNEL_ID.EMAIL;
    }
};

export { templateLists };
