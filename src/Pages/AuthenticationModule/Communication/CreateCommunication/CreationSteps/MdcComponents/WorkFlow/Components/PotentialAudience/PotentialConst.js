import { email_large, messaging_rcs_large, mobile_notification_large, mobile_sms_large, social_vms_large, social_whatsapp_large, web_notification_large } from 'Constants/GlobalConstant/Glyphicons';
export const getCount = (...params) => {
    const [receipientList, itemKey] = params;
    return (
        receipientList.reduce((accumulator, item) => {
            return accumulator + item[itemKey];
        }, 0) || 0
    );
};

export const getCustomizedReceipientList = ({ receipientList }) => {
    const customizedList =
        (receipientList?.length && [
            {
                channelName: 'Email',
                count: getCount(receipientList, 'recipientCountEmail'),
                icon: email_large,
                mainClass: 'bg-cover',
                class: 'bg-email',
            },
            {
                channelName: 'SMS',
                count: getCount(receipientList, 'recipientCountMobile'),
                icon: mobile_sms_large,
                mainClass: 'bg-cover',
                class: 'bg-sms',
            },
            {
                channelName: 'WhatsApp',
                count: getCount(receipientList, 'recipientCountWhatsApp'),
                icon: social_whatsapp_large,
                mainClass: '',
                class: 'bg-whatsapp',
            },
            {
                channelName: 'RCS',
                count: getCount(receipientList, 'recipientCountRCS'),
                icon: messaging_rcs_large,
                mainClass: '',
                class: 'bg-rcs-message',
            },
            {
                channelName: 'VMS',
                count: getCount(receipientList, 'recipientCountVMS'),
                icon: social_vms_large,
                mainClass: '',
                class: 'bg-vms',
            },
            {
                channelName: 'Web push',
                count: getCount(receipientList, 'recipientCountWebPush'),
                icon: web_notification_large,
                mainClass: '',
                class: 'bg-web-push',
            },
            {
                channelName: 'Mobile push',
                count: getCount(receipientList, 'recipientCountMobilePush'),
                icon: mobile_notification_large,
                mainClass: 'bg-cover',
                class: 'bg-mobile-push',
            },
        ]) ||
        [];
    return { customizedList };
};

export const getCountForRecursiveFlow = (receipientList, channelType) => {
    let countObj = receipientList?.filter((item) => item?.ChannelType === channelType);
    return countObj?.[0]?.RecipientCount || 0;
};
export const getCustomizedReceipientListRecursiveFlow = ({ receipientList }) => {
    const customizedList =
        (receipientList?.length && [
            {
                channelName: 'Email',
                count: getCountForRecursiveFlow(receipientList, 'Email'),
                icon: email_large,
                mainClass: 'bg-cover',
                class: 'bg-email',
            },
            {
                channelName: 'SMS',
                count: getCountForRecursiveFlow(receipientList, 'SMS'),
                icon: mobile_sms_large,
                mainClass: 'bg-cover',
                class: 'bg-sms',
            },
            {
                channelName: 'WhatsApp',
                count: getCountForRecursiveFlow(receipientList, 'WhatsApp'),
                icon: social_whatsapp_large,
                mainClass: '',
                class: 'bg-whatsapp',
            },
            {
                channelName: 'RCS',
                count: getCountForRecursiveFlow(receipientList, 'RCS'),
                icon: messaging_rcs_large,
                mainClass: '',
                class: 'bg-rcs-message',
            },
            {
                channelName: 'VMS',
                count: getCountForRecursiveFlow(receipientList, 'VMS'),
                icon: social_vms_large,
                mainClass: '',
                class: 'bg-vms',
            },
            {
                channelName: 'Web push',
                count: getCountForRecursiveFlow(receipientList, 'Webpush'),
                icon: web_notification_large,
                mainClass: '',
                class: 'bg-web-push',
            },
            {
                channelName: 'Mobile push',
                count: getCountForRecursiveFlow(receipientList, 'Mobilepush'),
                icon: mobile_notification_large,
                mainClass: 'bg-cover',
                class: 'bg-mobile-push',
            },
        ]) ||
        [];
    return { customizedList };
};
