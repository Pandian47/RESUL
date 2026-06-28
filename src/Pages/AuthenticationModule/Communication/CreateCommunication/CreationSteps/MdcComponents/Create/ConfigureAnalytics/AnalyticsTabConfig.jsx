import { mms_large, mobile_sms_large, social_line_large, social_viber_large, social_whatsapp_large } from 'Constants/GlobalConstant/Glyphicons';
import Web from './components/web';
import OfflineConversion from '../../../Create/Tabs/Analytics/OfflineConversion/OfflineConversion';
export const LANDING_TAB_CONFIG = [
    {
        id: 'web',
        text: 'Web',
        icon: `${mobile_sms_large} icon-lg`,
        component: () => <Web />,
    },
        {
        id: 'app',
        text: 'App',
        icon: `${mms_large} icon-lg`,
        component: () => <div>App</div>,
        disable: true,
    },
    {
        id: 'offlineconversion',
        text: 'Offline conversion',
        icon: `${social_viber_large} icon-lg`,
        component: () => (
            <div>
                <OfflineConversion />
            </div>
        ),
        disable: false,
    },
    {
        id: 'social',
        text: 'Social',
        icon: `${social_whatsapp_large} icon-lg`,
        component: () => <div>Social</div>,
        disable: true,
    },
    {
        id: 'sentiment',
        text: 'Sentiment',
        icon: `${social_line_large} icon-lg`,
        component: () => <div>Sentiment</div>,
        disable: true,
    },
    {
        id: 'video',
        text: 'Video',
        icon: `${social_viber_large} icon-lg`,
        component: () => <div>Video</div>,
        disable: true,
    },
    {
        id: 'events',
        text: 'events',
        icon: `${social_viber_large} icon-lg`,
        component: () => <div>Events</div>,
        disable: true,
    },
];
