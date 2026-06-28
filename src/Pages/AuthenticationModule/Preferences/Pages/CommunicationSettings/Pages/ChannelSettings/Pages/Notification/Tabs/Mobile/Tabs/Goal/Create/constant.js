export const FORM_INITIAL_STATE = {
    defaultValues: {
        appName: '',
        goalName: '',
        platformName: '',
        mobileGoalsetting: [
            {
                friendlyName: '',
                goaltype: 0,
                screen: '',
                subScreen: '',
                eventId: 0,
            },
            {
                friendlyName: '',
                goaltype: 0,
                screen: '',
                subScreen: '',
                eventId: 0,
            },
            {
                friendlyName: '',
                goaltype: 0,
                screen: '',
                subScreen: '',
                eventId: 0,
            },
        ],
    },
    mode: 'onTouched'
};

export const GOALTYPE = [
    { keyId: '1', keyName: 'Screen' },
    { keyId: '2', keyName: 'Custom events' },
];
