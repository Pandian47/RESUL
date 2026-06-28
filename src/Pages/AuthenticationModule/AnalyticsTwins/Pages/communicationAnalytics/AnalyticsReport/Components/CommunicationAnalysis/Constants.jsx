import { BLOCKED, DELIVERED, DELIVERED_COUNT, DND, EXPIRED, FORWARDS, HARD_BOUNCED, MARKED_AS_SPAM, NOT_READ, QUARANTINED, REJECTED, REPLIED_PARTICIPATED, REPORTED, RESPONDED, SEEN, SENT_COUNT, SOFT_BOUNCED, UNATTENDED, UNDELIVERED, UNIQUE_CLICKS, UNIQUE_OPENS, UNSUBSCRIBED } from 'Constants/GlobalConstant/Placeholders';
import Email from './Components/Tables/Email';
import FBApp from './Components/Tables/FBApp';
import Facebook from './Components/Tables/Facebook';
import Facebookads from './Components/Tables/Facebookads';
import Googleads from './Components/Tables/Googleads';
import Line from './Components/Tables/Line';
import LinkedinInads from './Components/Tables/LinkedinInads';
import MobileNotification from './Components/Tables/MobileNotification';
import ORM from './Components/Tables/ORM';
import Pinterest from './Components/Tables/Pinterest';
import QrCode from './Components/Tables/QrCode';
import Rcs from './Components/Tables/Rcs';
import SMS from './Components/Tables/SMS';
import Slideshare from './Components/Tables/Slideshare';
import Twitter from './Components/Tables/Twitter';
import Twitterads from './Components/Tables/Twitterads';
import TwoWaySMS from './Components/Tables/TwoWaySMS';
import Video from './Components/Tables/Video';
import VMS from './Components/Tables/Vms';
import VoiceAssistant from './Components/Tables/VoiceAssistant';
import WebAppAnalytics from './Components/Tables/WebAppAnalytics';
import WebNotification from './Components/Tables/WebNotification';
import Webinar from './Components/Tables/Webinar';
import Whatsapp from './Components/Tables/Whatsapp';
export const tableComponent = (data) => {
    switch (data?.type) {
        case 'email':
            return <Email {...data} />;
        case 'mobile':
            return <SMS {...data} />;
        case 'mobilePush':
            return <MobileNotification {...data} />;
        case 'webPush':
            return <WebNotification {...data} />;
        case 'towWaySMS':
            return <TwoWaySMS {...data} />;
        case 'whatsapp':
            return <Whatsapp {...data} />;
        case 'rcs':
            return <Rcs {...data} />;
        case 'line':
            return <Line {...data} />;
        case 'vms':
            return <VMS {...data} />;
        case 'qrCode':
            return <QrCode {...data} />;
        case 'facebook':
            return <Facebook {...data} />;
        case 'facebookApp':
            return <FBApp {...data} />;
        case 'twitter':
            return <Twitter {...data} />;
        case 'pinterest':
            return <Pinterest {...data} />;
        case 'webinar':
            return <Webinar {...data} />;
        case 'orm':
            return <ORM {...data} />;
        case 'webAnalytics':
            return <WebAppAnalytics {...data} />;
        case 'notifications':
            return <WebNotification {...data} />;
        case 'video':
            return <Video {...data} />;
        case 'slideshare':
            return <Slideshare {...data} />;
        case 'voiceAssistant':
            return <VoiceAssistant {...data} />;
        case 'facebookSummary':
            return <Facebookads {...data} />;
        case 'linkedInSummary':
            return <LinkedinInads {...data} />;
        case 'twitterSummary':
            return <Twitterads {...data} />;
        case 'googlePlusSummary':
            return <Googleads {...data} />;
        default:
            return <p>No Component</p>;
    }
};

export const handleCountPayload = (channelId, count) => {
    switch (channelId) {
        case 1:
            return {
                recipientCountEmail: count,
                recipientCountMobile: 0,
                recipientCountMobilePush: 0,
                recipientCountWebPush: 0,
                recipientCountWhatsApp: 0,
            };
        case 2:
            return {
                recipientCountEmail: 0,
                recipientCountMobile: count,
                recipientCountMobilePush: 0,
                recipientCountWebPush: 0,
                recipientCountWhatsApp: 0,
            };
        case 8:
            return {
                recipientCountEmail: 0,
                recipientCountMobile: 0,
                recipientCountMobilePush: 0,
                recipientCountWebPush: count,
                recipientCountWhatsApp: 0,
            };
        case 14:
            return {
                recipientCountEmail: 0,
                recipientCountMobile: 0,
                recipientCountMobilePush: count,
                recipientCountWebPush: 0,
                recipientCountWhatsApp: 0,
            };
        case 21:
            return {
                recipientCountEmail: 0,
                recipientCountMobile: count,
                recipientCountMobilePush: 0,
                recipientCountWebPush: 0,
                recipientCountWhatsApp: count,
            };
        default:
            return {
                recipientCountEmail: count ?? 0,
                recipientCountMobile: 0,
                recipientCountMobilePush: 0,
                recipientCountWebPush: 0,
                recipientCountWhatsApp: 0,
            };
    }
};

// Retargetable metrics configuration per channel
export const RETARGETABLE_METRICS = [
    {
        channelId: 1,
        labels: [
            UNIQUE_OPENS,
            SENT_COUNT,
            UNIQUE_CLICKS,
            DELIVERED_COUNT,
            FORWARDS,
            HARD_BOUNCED,
            UNSUBSCRIBED,
            SOFT_BOUNCED,
            MARKED_AS_SPAM,
            QUARANTINED,
            UNATTENDED,
        ],
    },
    {
        channelId: 2,
        labels: [
            DND,
            DELIVERED,
            REPLIED_PARTICIPATED,
            EXPIRED,
            UNDELIVERED,
            REJECTED,
        ],
    },
    {
        channelId: 21,
        labels: [
            UNIQUE_CLICKS,
            DELIVERED,
            BLOCKED,
            SEEN,
            REPORTED,
            RESPONDED,
            UNDELIVERED,
            NOT_READ,
            REJECTED,
        ],
    },
];

export const isMetricRetargetable = (channelId, label) => {
    if (!channelId || !label) return false;
    const config = RETARGETABLE_METRICS.find((c) => c.channelId === Number(channelId));
    if (!config) return false;
    const normalized = String(label).toLowerCase();
    return config.labels.some((l) => String(l).toLowerCase() === normalized);
};
