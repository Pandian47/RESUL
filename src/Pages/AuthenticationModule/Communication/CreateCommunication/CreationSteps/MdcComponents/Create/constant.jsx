import { getChannelId } from 'Utils/modules/communicationChannels';
import Messaging from '../../Create/Tabs/Messaging/Messaging';
import Email from '../../Create/Tabs/Email/Email';
import NotificationTab from '../../Create/Tabs/Notification/Notification';
import MobileNotification from '../../Create/Tabs/MobileNotification/MobileNotification';
import VMS from '../../Create/Tabs/VMS';
import Voice from '../../Create/Tabs/Voice';
import Webhooks from './Webhooks';
import QR from '../../Create/pages/QR';
import RCS from '../../Create/Tabs/RCS/RCS';
import { availableTabs } from '../../Create/constant';

import Whatsapp from '../../Create/Tabs/Whatsapp/Messaging.jsx';

export const MDC_AUTHORING_CHANNEL_CONFIG = [
    { id: 2, channelId: 'ch002', channelName: 'SMS', component: () => <Messaging type="sms" mCampType="M" channelId={2}/> },
    {
        id: 21,
        channelId: 'ch0021',
        channelName: 'WhatsApp',
        component: () => <Whatsapp type="whatsapp" key={'Whatsapp'} channelId={21} mCampType="M"/>,
    },
    {
        id: 1,
        channelId: 'ch001',
        channelName: 'Email',
        component: () => <Email type="email" mCampType="M" channelId={1}/>,
    },
    {
        id: 8,
        channelId: 'ch008',
        channelName: 'Web notification ',
        component: () => <NotificationTab type="web" mCampType="M" channelId={8}/>,
    },
    {
        id: 14,
        channelId: 'ch0014',
        channelName: 'Push notification ',
        component: () => <MobileNotification type="mobile" mCampType="M" channelId={14}/>,
    },
    { id: 25, channelId: 'ch0025', channelName: 'VMS', component: () => <VMS mCampType="M" channelId={25}/> },
    { id: 34, channelId: 'ch0034', channelName: 'Webhooks', component: () => <Webhooks channelId={34}/> },
    { id: 26, channelId: 'ch0026', channelName: 'Callcenter', component: () => <Voice mCampType="M" channelId={26}/> },
    { id: 3, channelId: 'ch003', channelName: 'QR code URL settings', component: () => <QR mCampType="M" channelId={3}/> },
    { id: 41, channelId: 'ch0041', channelName: 'RCS', component: () => <RCS mCampType="M" channelId={41}/> },
];

export function handleTabNavigationFlow(location, currentIndex) {
    if (!location) {
        return { status: false, tabIndex: 0 };
    }

    const { analyticsTypes = [] } = location;
    const userTabs = analyticsTypes.map((id) => {
        const { label } = getChannelId(id === 1001 ? 'offline conversion' : id);
        return label.toLowerCase();
    });

    const nextTabIndex = availableTabs.analytics.findIndex((tab) => userTabs.includes(tab.toLowerCase()));
    if (analyticsTypes.length && nextTabIndex !== -1 && nextTabIndex !== currentIndex) {
        return {
            tabIndex: nextTabIndex,
            status: true,
        };
    } else {
        return {
            status: false,
            tabIndex: 0,
        };
    }
}
