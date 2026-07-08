 

import { SMTP_INNER_TAB_CONFIG } from '../../../../constant';

export { SMTP_INNER_TAB_CONFIG };

export const getSmtpActionTypeByTabId = (tabId) =>
    SMTP_INNER_TAB_CONFIG.find((tab) => tab.id === tabId)?.actionType ?? 'SMTP Grid';

export const ACTION_INITIAL_STATE = {
    smtpGrid: true,
    smtpAction: {
        edit: {
            editState: [],
            isEdit: false,
        },
        create: false,
    },
    domainName: false,
    domainNameAction: {
        edit: {
            editState: [],
            isEdit: false,
        },
        create: false,
    },
};

  

//SMTP domain settings

export const DOMAIN_SETTINGS_VALUE = {
    defaultValues: {
        domainName: '',
        senderEmailId:'',
        SenderemailDomain:'',
        SenderemailUsername:'',
        senderName:'',
        potentialBase: '',
        availableAudience: '',
        noc: '',
        nos: '',
        throttleWarmup: '',
        throttleLow: '',
        throttleMedium: '',
        throttleHigh: '',
        lowThrottleList: [{ domainName: '', volume: '' }],
    },
    mode: 'onTouched',
};
