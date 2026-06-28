 

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
