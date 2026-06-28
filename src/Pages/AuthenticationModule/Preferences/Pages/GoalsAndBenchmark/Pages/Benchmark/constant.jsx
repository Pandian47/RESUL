import { circle_paid_media_large, email_large, messaging_large, mobile_analytics_large, mobile_notification_large, notification_large, qrcode_large, social_facebook_large, social_google_ad_large, social_instagram_large, social_linkedin_large, social_pinterest_large, social_twitter_large, social_vms_large, user_call_center_large, web_analytics_large, web_notification_large } from 'Constants/GlobalConstant/Glyphicons';
import RenderBenchmark from './RenderBenchmark/RenderBenchmark';

import RSTabber from 'Components/RSTabber';
import { getBenchmarkChannelDisplayText } from './BenchmarkTabs/constant';

export const FORM_INITIAL_STATE = {
    defaultValues: {
        campaignType: '',
        name: '',
        description: '',
        saveEnabledActiveChannel: false,
        saveEnabledAnyChannel: false,
        navMeta: { hasNextStep: false, activeChannelKey: null, isOverallStep: false },
        submitAction: null,
        benchmarkSubmitting: false,
        // countryDetails: {
        //     countryId: 2,
        //     country: 'United States of America',
        //     currencyId: 2,
        //     countryCode: 'US',
        //     isDayLight: true,
        //     istCode: 1,
        //     tax: 0,
        //     integerFormat: 'en-US',
        // },
        // industry: {
        //     industryId: 6,
        //     industryName: 'Fashion',
        // },
        // businessType: {
        //     businessTypeId: 2,
        //     businessType: 'B2C',
        // },
    },
    mode: 'onBlur',
};

const getIconLeftForChannel = (channelKey) => {
    switch (channelKey) {
        case 'Email':
            return `${email_large} icon-lg color-primary-blue`;
        case 'Mobile':
            return `${messaging_large} icon-lg color-primary-blue`;
        case 'WebPush':
            return `${web_notification_large} icon-lg color-primary-blue`;
        case 'MobilePush':
        case 'MobilePushAndroid':
        case 'MobilePushIos':
            return `${mobile_notification_large} icon-lg color-primary-blue`;
        case 'QR':
            return `${qrcode_large} icon-lg color-primary-blue`;
        case 'Facebook':
        case 'FacebookAds':
            return `${social_facebook_large} icon-lg color-primary-blue`;
        case 'Instagram':
            return `${social_instagram_large} icon-lg color-primary-blue`;
        case 'LinkedIn':
        case 'LindenAds':
            return `${social_linkedin_large} icon-lg color-primary-blue`;
        case 'Pinterest':
            return `${social_pinterest_large} icon-lg color-primary-blue`;
        case 'X':
        case 'XAds':
            return `${social_twitter_large} icon-lg color-primary-blue`;
        case 'GoogleAds':
            return `${social_google_ad_large} icon-lg color-primary-blue`;
        default:
            return `${notification_large} icon-lg color-primary-blue`;
    }
};

export const getVerticalTabConfig = (channelKeys = [], options = {}) => {
    const keys = Array.isArray(channelKeys) ? channelKeys : [];
    const { subTabIndexByGroup = {}, onSubTabChange = () => {} } = options;

    const buildSubTabs = (groupId, subKeys = [], fallbackDefaultTab = 0) => {
        const available = subKeys.filter((k) => keys.includes(k));
        if (!available.length) return null;
        const defaultTab = Number.isFinite(subTabIndexByGroup?.[groupId])
            ? subTabIndexByGroup[groupId]
            : fallbackDefaultTab;
        return () => (
            <div>
                <RSTabber
                    dynamicTab={`rs-sub-tabs rs-cc-sub-tabs`}
                    activeClass={`active`}
                    defaultTab={defaultTab}
                    callBack={(tab, index) => onSubTabChange(groupId, index, tab)}
                    tabData={available.map((k) => ({
                        id: k,
                        iconLeft: getIconLeftForChannel(k),
                        text: getBenchmarkChannelDisplayText(k),
                        component: () => <RenderBenchmark channel={k} key={k} />,
                    }))}
                />
            </div>
        );
    };

    const hasAndroid = keys.includes('MobilePushAndroid');
    const hasIos = keys.includes('MobilePushIos');
    const hasMobilePush = hasAndroid || hasIos;

    const buildMobilePushTab = () => {
        if (!hasMobilePush) return null;
        return {
            id: 'MobilePush',
            text: 'Mobile push',
            iconLeft: getIconLeftForChannel('MobilePush'),
            component: () => (
                <RenderBenchmark
                    channel={hasAndroid ? 'MobilePushAndroid' : 'MobilePushIos'}
                    key={hasAndroid ? 'MobilePushAndroid' : 'MobilePushIos'}
                />
            ),
        };
    };

    const mobilePushTab = buildMobilePushTab();

    // Grouped vertical tabs (same order as communication creation)
    const grouped = [
        {
            id: 'Mail',
            text: 'Mail',
            iconLeft: `${email_large} icon-lg`,
            subKeys: ['Email', 'DirectMail', 'Directmail', 'directmail'],
            subComponent: buildSubTabs('Mail', ['Email', 'DirectMail', 'Directmail', 'directmail']),
        },
        {
            id: 'Messaging',
            text: 'Messaging',
            iconLeft: `${messaging_large} icon-lg`,
            subKeys: ['Mobile', 'WhatsApp', 'RCS'],
            subComponent: buildSubTabs('Messaging', ['Mobile', 'WhatsApp', 'RCS']), // SMS, WhatsApp, RCS
        },
        {
            id: 'Notification',
            text: 'Notifications',
            iconLeft: `${notification_large} icon-lg`,
            subKeys: ['WebPush', ...(hasMobilePush ? ['MobilePush'] : [])],
            subComponent: () => (
                <div>
                    <RSTabber
                        dynamicTab={`rs-sub-tabs rs-cc-sub-tabs`}
                        activeClass={`active`}
                        defaultTab={
                            Number.isFinite(subTabIndexByGroup?.Notification) ? subTabIndexByGroup.Notification : 0
                        }
                        callBack={(tab, index) => onSubTabChange('Notification', index, tab)}
                        tabData={[
                            ...(keys.includes('WebPush')
                                ? [
                                      {
                                          id: 'WebPush',
                                          iconLeft: getIconLeftForChannel('WebPush'),
                                          text: getBenchmarkChannelDisplayText('WebPush'),
                                          component: () => <RenderBenchmark channel={'WebPush'} key={'WebPush'} />,
                                      },
                                  ]
                                : []),
                            ...(mobilePushTab
                                ? [
                                      {
                                          id: mobilePushTab.id,
                                          iconLeft: mobilePushTab.iconLeft,
                                          text: mobilePushTab.text,
                                          component: mobilePushTab.component,
                                      },
                                  ]
                                : []),
                        ]}
                    />
                </div>
            ),
        },
        {
            id: 'SocialPost',
            text: 'Social post',
            iconLeft: `${notification_large} icon-lg`,
            subKeys: ['Facebook', 'X', 'Instagram', 'LinkedIn', 'Pinterest'],
            subComponent: buildSubTabs('SocialPost', ['Facebook', 'X', 'Instagram', 'LinkedIn', 'Pinterest']),
        },
        {
            id: 'Voice',
            text: 'Voice',
            iconLeft: `${social_vms_large} icon-lg`,
            subKeys: ['VMS', 'Callcenter'],
            subComponent: buildSubTabs('Voice', ['VMS', 'Callcenter']),
        },
        {
            id: 'Ads',
            text: 'Ads',
            iconLeft: `${circle_paid_media_large} icon-lg`,
            subKeys: ['GoogleAds', 'FacebookAds', 'XAds', 'LindenAds'],
            subComponent: buildSubTabs('Ads', ['GoogleAds', 'FacebookAds', 'XAds', 'LindenAds']),
        },
        {
            id: 'QR',
            text: 'QR',
            iconLeft: `${qrcode_large} icon-lg`,
            subKeys: ['QR'],
            subComponent: buildSubTabs('QR', ['QR']),
        },
        {
            id: 'Analytics',
            text: 'Analytics',
            iconLeft: `${web_analytics_large} icon-lg`,
            subKeys: ['Web', 'App'],
            subComponent: buildSubTabs('Analytics', ['Web', 'App']),
        },
    ];

    return grouped
        .map((g) => {
            const comp = g.subComponent;
            if (!comp) return null;
            return {
                id: g.id,
                text: g.text,
                iconLeft: g.iconLeft,
                component: comp,
                __subTabKeys: g.subKeys || [],
            };
        })
        .filter(Boolean);
};

export const BENCHMARK_FORM = {
    email: {
        reach: {
            label: 'Estimated reach rate',
            config: {
                content: 'Opens, Forwards',
                value: '', // input value
                action: '', // benchmark value
            },
        },
        engagement: {
            label: 'Estimated engagement rate',
            config: {
                content: 'Clicks, Clicks from forwarded mail',
                value: '',
                action: '',
            },
        },
        conversion: {
            label: 'Estimated conversion rate',
            config: {
                content: 'Participation, Registration, Registration from forwarded mails',
                value: '',
                action: '',
            },
        },
    },
    directmail: {
        reach: {
            label: 'Estimated reach rate',
            config: {
                content: 'Opens, Forwards',
                value: '', // input value
                action: '', // benchmark value
            },
        },
        engagement: {
            label: 'Estimated engagement rate',
            config: {
                content: 'Clicks, Clicks from forwarded mail',
                value: '',
                action: '',
            },
        },
        conversion: {
            label: 'Estimated conversion rate',
            config: {
                content: 'Participation, Registration, Registration from forwarded mails',
                value: '',
                action: '',
            },
        },
    },
    sms: {
        reach: {
            label: 'Reach',
            config: {
                content: 'Delivered',
                value: '',
                action: '',
            },
        },
        engagement: {
            label: 'Engagement',
            config: {
                content: 'Reply, Link clicks',
                value: '',
                action: '',
            },
        },
        conversion: {
            label: 'Conversion',
            config: {
                content: 'Participation, Registration',
                value: '',
                action: '',
            },
        },
    },
    whatsapp: {
        reach: {
            label: 'Reach',
            config: {
                content: 'Delivered',
                value: '',
                action: '',
            },
        },
        engagement: {
            label: 'Engagement',
            config: {
                content: 'Reply, Link clicks',
                value: '',
                action: '',
            },
        },
        conversion: {
            label: 'Conversion',
            config: {
                content: 'Participation, Registration',
                value: '',
                action: '',
            },
        },
    },
    rcs: {
        reach: {
            label: 'Reach',
            config: {
                content: 'Delivered',
                value: '',
                action: '',
            },
        },
        engagement: {
            label: 'Engagement',
            config: {
                content: 'Reply, Link clicks',
                value: '',
                action: '',
            },
        },
        conversion: {
            label: 'Conversion',
            config: {
                content: 'Participation, Registration',
                value: '',
                action: '',
            },
        },
    },
    webPush: {
        reach: {
            label: 'Reach',
            config: {
                content: 'Delivered',
                value: '',
                action: '',
            },
        },
        engagement: {
            label: 'Engagement',
            config: {
                content: 'URL clicks',
                value: '',
                action: '',
            },
        },
        conversion: {
            label: 'Conversion',
            config: {
                content: 'Participation, Registration',
                value: '',
                action: '',
            },
        },
    },
    mobilePush: {
        reach: {
            label: 'Reach',
            config: {
                content: 'Delivered',
                value: '',
                action: '',
            },
        },
        engagement: {
            label: 'Engagement',
            config: {
                content: 'Link clicks',
                value: '',
                action: '',
            },
        },
        conversion: {
            label: 'Conversion',
            config: {
                content: 'Participation, Registration',
                value: '',
                action: '',
            },
        },
    },
    facebook: {
        reach: {
            label: 'Reach',
            config: {
                content: 'Page likes',
                value: '',
                action: '',
            },
        },
        engagement: {
            label: 'Engagement',
            config: {
                content: 'Shares, likes, comments, responding to event, answering a question, clicks on post',
                value: '',
                action: '',
            },
        },
        conversion: {
            label: 'Conversion',
            config: {
                content: 'Participation, Registration',
                value: '',
                action: '',
            },
        },
    },
    twitter: {
        reach: {
            label: 'Reach',
            config: {
                content: 'Account followers',
                value: '',
                action: '',
            },
        },
        engagement: {
            label: 'Engagement',
            config: {
                content: 'Like, retweet, reply',
                value: '',
                action: '',
            },
        },
        conversion: {
            label: 'Conversion',
            config: {
                content: 'Participation, Registration',
                value: '',
                action: '',
            },
        },
    },
    instagram: {
        reach: {
            label: 'Reach',
            config: {
                content: 'Business account followers',
                value: '',
                action: '',
            },
        },
        engagement: {
            label: 'Engagement',
            config: {
                content: 'Image likes, repins, shares, send',
                value: '',
                action: '',
            },
        },
        conversion: {
            label: 'Conversion',
            config: {
                content: 'Participation, Registration',
                value: '',
                action: '',
            },
        },
    },
    linkedin: {
        reach: {
            label: 'Reach',
            config: {
                content: 'Account followers',
                value: '',
                action: '',
            },
        },
        engagement: {
            label: 'Engagement',
            config: {
                content: 'Shares, likes, comments, participating in a discussion, clicks on post',
                value: '',
                action: '',
            },
        },
        conversion: {
            label: 'Conversion',
            config: {
                content: 'Participation, Registration',
                value: '',
                action: '',
            },
        },
    },
    pinterest: {
        reach: {
            label: 'Reach',
            config: {
                content: 'Account followers',
                value: '',
                action: '',
            },
        },
        engagement: {
            label: 'Engagement',
            config: {
                content: 'Image likes, comments, shares, send',
                value: '',
                action: '',
            },
        },
        conversion: {
            label: 'Conversion',
            config: {
                content: 'Participation, Registration',
                value: '',
                action: '',
            },
        },
    },
    google: {
        reach: {
            label: 'Reach',
            config: {
                content: 'Impressions',
                value: '',
                action: '',
            },
        },
        engagement: {
            label: 'Engagement',
            config: {
                content: 'Link clicks',
                value: '',
                action: '',
            },
        },
        conversion: {
            label: 'Conversion',
            config: {
                content: 'Participation, Registration',
                value: '',
                action: '',
            },
        },
    },
    facebookads: {
        reach: {
            label: 'Reach',
            config: {
                content: 'Impressions',
                value: '',
                action: '',
            },
        },
        engagement: {
            label: 'Engagement',
            config: {
                content: 'Shares, likes, comments, clicks on post',
                value: '',
                action: '',
            },
        },
        conversion: {
            label: 'Conversion',
            config: {
                content: 'Participation, Registration',
                value: '',
                action: '',
            },
        },
    },
    twitterads: {
        reach: {
            label: 'Reach',
            config: {
                content: 'Impressions',
                value: '',
                action: '',
            },
        },
        engagement: {
            label: 'Engagement',
            config: {
                content: 'Like, retweet, link clicks',
                value: '',
                action: '',
            },
        },
        conversion: {
            label: 'Conversion',
            config: {
                content: 'Participation, Registration',
                value: '',
                action: '',
            },
        },
    },
    linkedinads: {
        reach: {
            label: 'Reach',
            config: {
                content: 'Impressions',
                value: '',
                action: '',
            },
        },
        engagement: {
            label: 'Engagement',
            config: {
                content: 'Shares, likes, comments, clicks on post',
                value: '',
                action: '',
            },
        },
        conversion: {
            label: 'Conversion',
            config: {
                content: 'Participation, Registration',
                value: '',
                action: '',
            },
        },
    },
    web: {
        reach: {
            label: 'Reach',
            config: {
                content: 'Session',
                value: '',
                action: '',
            },
        },
        engagement: {
            label: 'Engagement',
            config: {
                content: 'Link clicks',
                value: '',
                action: '',
            },
        },
        conversion: {
            label: 'Conversion',
            config: {
                content: 'Participation, Registration',
                value: '',
                action: '',
            },
        },
    },
    app: {
        reach: {
            label: 'Reach',
            config: {
                content: 'Session',
                value: '',
                action: '',
            },
        },
        engagement: {
            label: 'Engagement',
            config: {
                content: 'Link clicks',
                value: '',
                action: '',
            },
        },
        conversion: {
            label: 'Conversion',
            config: {
                content: 'Participation, Registration',
                value: '',
                action: '',
            },
        },
    },
    qr: {
        reach: {
            label: 'Reach',
            config: {
                content: 'Scan',
                value: '',
                action: '',
            },
        },
        engagement: {
            label: 'Engagement',
            config: {
                content: 'Landing page, link clicks',
                value: '',
                action: '',
            },
        },
        conversion: {
            label: 'Conversion',
            config: {
                content: 'Participation, Registration',
                value: '',
                action: '',
            },
        },
    },
};

export const NOTIFICATION_TABBER_CONFIG = [
    {
        id: 'Web',
        text: 'Web',
        icon: `${web_notification_large} icon-lg color-primary-blue`,
        component: () => <RenderBenchmark channel={'webPush'} key={'webPush'} />,
    },
    {
        id: 'Mobile',
        text: 'Mobile',
        icon: `${mobile_notification_large} icon-lg color-primary-blue`,
        component: () => <RenderBenchmark channel={'mobilePush'} key={'mobilePush'} />,
    },
];
export const SOCIAL_TABBER_CONFIG = [
    {
        id: 'Facebook',
        text: 'Facebook',
        icon: `${social_facebook_large} icon-lg color-primary-blue`,
        component: () => <RenderBenchmark channel={'facebook'} key={'facebook'} />,
    },
    {
        id: 'Twitter',
        text: 'Twitter',
        icon: `${social_twitter_large} icon-lg color-primary-blue`,
        component: () => <RenderBenchmark channel={'twitter'} key={'twitter'} />,
    },
    {
        id: 'Instagram',
        text: 'Instagram',
        icon: `${social_instagram_large} icon-lg color-primary-blue`,
        component: () => <RenderBenchmark channel={'instagram'} key={'instagram'} />,
    },
    {
        id: 'LinkedIn',
        text: 'LinkedIn',
        icon: `${social_linkedin_large} icon-lg color-primary-blue`,
        component: () => <RenderBenchmark channel={'linkedin'} key={'linkedin'} />,
    },
    {
        id: 'Pinterest',
        text: 'Pinterest',
        icon: `${social_pinterest_large} icon-lg color-primary-blue`,
        component: () => <RenderBenchmark channel={'pinterest'} key={'pinterest'} />,
    },
];
export const SOCIALADS_TABBER_CONFIG = [
    {
        id: 'Google',
        text: 'Google',
        icon: `${social_google_ad_large} icon-lg color-primary-blue`,
        component: () => <RenderBenchmark channel={'google'} key={'google'} />,
    },
    {
        id: 'Facebookads',
        text: 'Facebook',
        icon: `${social_facebook_large} icon-lg color-primary-blue`,
        component: () => <RenderBenchmark channel={'facebookads'} key={'facebookads'} />,
    },
    {
        id: 'Twitterads',
        text: 'Twitter',
        icon: `${social_twitter_large} icon-lg color-primary-blue`,
        component: () => <RenderBenchmark channel={'twitterads'} key={'twitterads'} />,
    },
    {
        id: 'LinkedInads',
        text: 'LinkedIn',
        icon: `${social_linkedin_large} icon-lg color-primary-blue`,
        component: () => <RenderBenchmark channel={'linkedinads'} key={'linkedinads'} />,
    },
];

export const VOICE_TABBER_CONFIG = [
    {
        id: 'VMS',
        text: 'VMS',
        icon: `${social_vms_large} icon-lg color-primary-blue`,
        component: () => <RenderBenchmark channel={'vms'} key={'vms'} />,
    },
    {
        id: 'Callcenter',
        text: 'Callcenter',
        icon: `${user_call_center_large} icon-lg color-primary-blue`,
        component: () => <RenderBenchmark channel={'callcenter'} key={'callcenter'} />,
    },
];

export const ANALYTICS_TABBER_CONFIG = [
    {
        id: 'Web',
        text: 'Web',
        icon: `${web_analytics_large} icon-lg color-primary-blue`,
        component: () => <RenderBenchmark channel={'web'} key={'web'} />,
    },
    {
        id: 'Mobile',
        text: 'Mobile',
        icon: `${mobile_analytics_large} icon-lg color-primary-blue`,
        component: () => <RenderBenchmark channel={'app'} key={'app'} />,
    },
];
