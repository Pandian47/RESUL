export const FORM_INITIAL_STATE = {
    defaultValues: {
        domainName: '',
        goalName: '',
        webGoalsetting: [
            {
                friendlyName: '',
                goaltype: 0,
                pageUrl: '',
                eventId: 0,
            },
            {
                friendlyName: '',
                goaltype: 0,
                pageUrl: '',
                eventId: 0,
            },
            {
                friendlyName: '',
                goaltype: 0,
                pageUrl: '',
                eventId: 0,
            },
        ],
    },
    mode: 'onTouched',
};

export const GOALTYPE = [
    { keyId: '1', keyName: 'Page URL' },
    { keyId: '2', keyName: 'Custom events' },
];
