const INITIAL_STATE = {
    defaultValues: {
     
    },
    mode: 'onTouched'
};

const LADDERING = [
    {
        id: 1,
        name: 'communicationsSent',
        lable: 'No. of communications sent',
    },
    {
        id: 2,
        name: 'communicationsEngaged',
        lable: 'No. of communications engaged',
    },
    {
        id: 3,
        name: 'participation',
        lable: 'Participation %',
    },
    {
        id: 4,
        name: 'campaGoalsAchieved',
        lable: 'Goals achieved %',
    },
    {
        id: 5,
        name: 'profileCompleteness',
        lable: 'Profile completeness',
    },
    {
        id: 6,
        name: 'networkWorth',
        lable: 'Network worth',
    },
    {
        id: 7,
        name: 'referralScore',
        lable: 'Referral score',
    },
    {
        id: 8,
        name: 'brandSentiment',
        lable: 'Brand sentiment',
        dropName: 'brandSentimentAbove',
    },
    {
        id: 9,
        name: 'fanofBrand',
        lable: 'Fan of brand',
        dropName: 'fanofBrandAbove',
    },
];

const CRITICS = ['', 'below', 'below', 'below', 'below', 'above', 'above', 'above', 'above'];
const SPECTATOR = ['above', 'below', 'below', 'below', 'below', 'above', 'above', 'above', 'above'];

const DROPDOWNLIST = ['Positive', 'Neutral', 'Neutral'];

export { INITIAL_STATE, LADDERING, CRITICS, SPECTATOR, DROPDOWNLIST };
