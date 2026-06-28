export const FrequencyCapGrid = [
    {
        name: 'TestQA Oct 21st',
        frequency: '1 Per Week',
    },
    {
        name: 'Frequency001',
        frequency: '1 Per Week',
    },
    {
        name: 'Frequency cap created for Testing on New 2022',
        frequency: '2 Per Week',
    },
    {
        name: 'Frequency cap created for Testing on May 05 2022',
        frequency: '20 Per Month',
    },
    {
        name: 'Frequency cap created for Testing on April 30 2022',
        frequency: '2 Per Week',
    },
    {
        name: 'Freq rule 01',
        frequency: '1 Per Week',
    },
    {
        name: 'Frequency cap created for Testing on May 05 2022',
        frequency: '20 Per Month',
    },
    {
        name: 'Frequency cap created for Testing on April 30 2022',
        frequency: '2 Per Week',
    },
    {
        name: 'Freq rule 01',
        frequency: '1 Per Week',
    },
    {
        name: 'Frequency001',
        frequency: '1 Per Week',
    },
    {
        name: 'Frequency cap created for Testing on New 2022',
        frequency: '2 Per Week',
    },
    {
        name: 'Frequency cap created for Testing on May 05 2022',
        frequency: '20 Per Month',
    },
    {
        name: 'Frequency cap created for Testing on April 30 2022',
        frequency: '2 Per Week',
    },
    {
        name: 'Freq rule 01',
        frequency: '1 Per Week',
    },
    {
        name: 'Frequency cap created for Testing on May 05 2022',
        frequency: '20 Per Month',
    },
    {
        name: 'Frequency cap created for Testing on April 30 2022',
        frequency: '2 Per Week',
    },
    {
        name: 'Freq rule 01',
        frequency: '1 Per Week',
    },
];

export const AUDIENCEGROUP = [
    {
        text: 'Persona',
        value: 1,
    },
    {
        text: 'Target lists',
        value: 2,
    },
    // {
    //     text: 'Audience laddering',
    //     value: 3,
    // },
    // {
    //     text: 'All',
    //     value: 4,
    // },
];

export const RULETYPE = [
    { text: 'Communication type', value: '1' },
    // { text: 'Product type', value: '2' },
    // { text: 'Channel type', value: '3' },
];
export const PERSONA = [
    { text: 'Young professionals', value: '1' },
    { text: 'Foodie', value: '2' },
    { text: 'Tech geek', value: '3' },
];
export const CAMPAIGNTYPE = [
    { text: 'All', value: '1' },
    { text: 'Awareness', value: '2' },
    { text: 'Greetings', value: '3' },
];
export const PRIORITY = [
    { text: 'Always ON', value: '1' },
    { text: 'High', value: '2' },
    { text: 'Medium', value: '3' },
    { text: 'Low', value: '4' },
];
 
export const INTERVAL = [
    {
        text: 'Day',
        value: '1',
    },
    {
        text: 'Week',
        value: '2',
    },
    {
        text: 'Month',
        value: '3',
    },
    {
        text: 'Fortnight',
        value: '4',
    },
];
export const FORM_INITIAL_STATE = {
    defaultValues: {
        ruleName: '',
        audienceGroup: '',
        audienceGroupSelect: '',
        isTransaction: false,
        rulesTypes: [{ ruleType: '', rules: [{ type: '', priority: '', limit: '', interval: '' }] }],
    },
    mode: 'onTouched',
};
