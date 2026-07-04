import Subscription from './Tabs/Subscription';
import { map as _map } from 'Utils/modules/lodashReplacements';
// import UnSubscription from './Tabs/UnSubscription';

export const SUB_UNSUB_TABBER_CONFIG = [
    {
        id: 1001,
        text: 'Subscription',
        disable: false,
        component: () => <Subscription tabname="Subscription" />,
    },
    { id: 1002, text: 'Unsubscription', disable: false, component: () => <Subscription tabname="Unsubscription" /> },
];

export const SUB_STATE = {
    defaultValues: {
        logopath: '',
        title: '',
        message: '',
        communicationType: [],
        productType: [],
        channelType: [],
        isotherInterest: false,
        redirectionURL: '',
        successMessage: '',
        welcomeMail: {},
        subscribeName: '',
        interest: [],
        othersText: '',
        text: '',
        subject: '',
        messageContent: '',
        enableOthers: false,
        selected_interest: '',
    },
    mode: 'onTouched',
};
export const INITIAL_STATE = {
    interestModal: false,
    welcomeModal: false,
    previewModal: false,
    saveModal: false,
    interestData: [],
    checked: false,
    errorMessage: false,
    previewData: {
        communication_type: [
            { id: 1, name: 'Awareness' },
            { id: 2, name: 'Greetings' },
            { id: 3, name: 'New product launch' },
            { id: 4, name: 'SMS acquisition' },
        ],
        productTypes: [
            { id: 1, name: 'Mutual fund' },
            { id: 2, name: 'Credit card' },
        ],
        email: 'asds@asa.com',
        channelType: [
            { id: 1, name: 'Email' },
            { id: 2, name: 'SMS' },
        ],
        interestType: 'Sports',
        reasonType: 'comments',
        logopath: '',
        content: 'We really appreciate you signing up to receive email communications from us.',
    },
};

export const CHANNEL_TYPE = [
    { id: 1, name: 'Email' },
    { id: 2, name: 'SMS' },
];
export const INTEREST_LIST = 'Sports,Music';
import { EditorTools } from '@progress/kendo-react-editor';

export const TOOLSDATA = () => {
    const { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, OrderedList, UnorderedList } =
        EditorTools;
    const toolsData = [
        [Bold, Italic, Underline],
        [OrderedList, UnorderedList],
        [AlignLeft, AlignCenter, AlignRight, AlignJustify],
    ];
    return toolsData;
};

const handleContentPayload = (value, isSubscription) => {
    const {welcomeMail,success} = value || {};
        if(isSubscription) {
            return {
                welcomeMail: value?.isotherInterest || false,
                subjectLine: welcomeMail?.subjectLine || '',
                verificationText: welcomeMail?.contentType === 'R' ? welcomeMail?.verificationText || '' : '',
                welcomeEdmContent: welcomeMail?.contentType  === 'E' ? welcomeMail?.importValues?.edmContent || '' : '',
                welcomeMailContentType: welcomeMail?.contentType || 'R',
	            sucessMessageContentType: success?.contentType || 'R',
	            sucessMessageEdmContent:  success?.contentType  === 'E' ? success?.importValues?.edmContent || '' : '',
                successMessage: success?.contentType === 'R' ? success?.successMessageText || '' : '',
            }
        } else  {
            return {
                isfarewellMail: value?.isotherInterest || false,
                subjectLine: welcomeMail?.subjectLine || '',
                missyoumailText: welcomeMail?.contentType === 'R' ? welcomeMail?.verificationText || '' : '',
                fairWellEdmContent: welcomeMail?.contentType  === 'E' ? welcomeMail?.importValues?.edmContent || '' : '',
                fairWellMailContentType: welcomeMail?.contentType || 'R',
	            sucessMessageContentType: success?.contentType || 'R',
	            sucessMessageEdmContent:  success?.contentType  === 'E' ? success?.importValues?.edmContent || '' : '',
                successMessage: success?.contentType === 'R' ? success?.successMessageText || '' : '',
            }
        }
}

export const constructAPIPayload = (values, dState, isSubscription, subscribeSettingId, subName, reasonData, departmentId) => {
    const {
        logoPath,
        subscribeName = '',
        title,
        message,
        communicationType,
        productType,
        channelType,
        interest,
        termsCondition,
        isotherInterest,
        welcomeMail,
        successMessage,
        redirectionURL,
        othersText,
        communicationAttributes,
        unsubscribeURL,
        termsCondtionUrl
    } = values;
    let data = {
        logoPath,
        subscribeName: subscribeName,
        title,
        message,
        communicationType: _map(communicationType, 'attributename').join(','),
        // communicationType: !isSubscription
        //     ? _map(communicationType, 'attributename').join(',')
        //     : _map(communicationType, 'attributename').join(','),
        productType: _map(productType, 'categoryname').join(','),
        channelType: _map(channelType, 'name').join(','),
        interest:  _map(interest).join(','),
        interestList: _map(reasonData).join(','),
        termsCondition,
        isotherInterest,
        redirectionURL,
        subscribeSettingId,
        otherInterestComments: othersText || '',
        subscribeUrl: termsCondtionUrl,
        departmentId,
        ...handleContentPayload(values, isSubscription),
    };
    if (!isSubscription) {
        data['otherReasonComments'] = data['otherInterestComments'];
        delete data['otherInterestComments'];
        data['unsubscribeName'] = data['subscribeName'];
        delete data['subscribeName'];
        data['reason'] = data['interest'];
        delete data['interest'];
        data['reasonList'] = data['interestList'];
        delete data['interestList'];
        data['unsubscribeSettingId'] = data['subscribeSettingId'];
        delete data['subscribeSettingId'];
        delete data['subscribeUrl'];
        data['unsubscribeUrl'] = termsCondtionUrl;
        delete data['verificationText'];
        delete data['welcomeMail'];
    }
    return data;
};


export const Subscription_title = 'Join our email list to enjoy exclusive perks!' ;
export const Subscription_Description = 'Get exclusive offers, important updates, and new product announcements delivered directly to your preferred channel (Email, SMS, WhatsApp, etc.).' ;

export const getSubscriptionAdvanceDescription = (clientName) => {
    return `<p>You're in!<p/><p>Thank you for subscribing to our brand. Look forward to receiving personalized content and updates. In the meantime, learn more about our brand here.</p><p></p><p>Regards,</p><p>Team ${clientName || 'Our Team'}</p>`;
};

export const Unsubscription_title = 'Opt Out of Brand Messages' ;
export const Unsubscription_Description = 'Choose which types of messages you’d like to stop receiving. You’ll still get essential service notifications where applicable.' ;
export const Unsubscription_Advance_Description  = 'You’ve successfully opted out of brand communications. You can resubscribe at any time to stay connected with our latest updates and offers.';
export const EditorURL = '<p>I agree to the <a href="https://www.resulticks.com/privacy-policy.html" target="_blank" title="terms and conditions">terms and conditions</a></p>'