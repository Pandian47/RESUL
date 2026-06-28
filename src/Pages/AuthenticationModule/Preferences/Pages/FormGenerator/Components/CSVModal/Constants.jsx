import Daily from 'Pages/AuthenticationModule/Components/Schedules/Daily';
import Monthly from 'Pages/AuthenticationModule/Components/Schedules/Monthly';
import Weekly from 'Pages/AuthenticationModule/Components/Schedules/Weekly';

export const FORM_INITIAL_STATE = {
    defaultValues: {
        fields: [],
        campaigns: [],
        duration: '',
        schedule: false,
        scheduleEndDate: null,
        daily: {
            days: '',
            hours: '',
        },
        weekly: {
            weekDays: [],
            hours: '',
            week: '',
        },
        monthly: {
            type: '',
            second_hours: '',
            second_months: '',
            second_days: {},
            second_frequency: {},
            first_hours: '',
            first_months: '',
            first_day: '',
        },
    },
    mode: 'onTouched',
};

export const FREQUENCY_TAB_CONFIG = (control) => [
    {
        text: 'Daily',
        component: () => <Daily control={control} />,
    },
    {
        text: 'Weekly',
        component: () => <Weekly control={control} />,
    },
    {
        text: 'Monthly',
        component: () => <Monthly control={control} isFormCSVDownload = {true} />,
    },
];

// export const csvFields = [
//     {
//         value: 'mobile',
//         label: 'Mobile no'
//     },
//     {
//         value: 'email',
//         label: 'Email'
//     },
//     {
//         value: 'name',
//         label: 'First name'
//     },
//     {
//         value: 'date_time',
//         label: 'Submitted date and time'
//     },
//     {
//         value: 'campaign',
//         label: 'Campaign'
//     },
//     {
//         value: 'last_name',
//         label: 'Last name'
//     },
//     {
//         value: 'referral_channel',
//         label: 'Referral channel'
//     },
//     {
//         value: 'city',
//         label: 'City'
//     }
// ]

export const csvFields = [
    'Mobile no',
    'Email',
    'First name',
    'Submitted date and time',
    'Communication',
    'Last name',
    'Referral channel',
    'City',
];

export const campaignsData = [
    {
        value: 'credit_card_acquisition',
        label: 'Credit card acquisition',
    },
    {
        value: 'amazon_great_shopping_festival',
        label: 'Amazon Great shopping festival',
    },
    {
        value: 'gold_bonds',
        label: 'Gold bonds',
    },
    {
        value: 'effortless_mobile_banking',
        label: 'Effortless Mobile Banking',
    },
    {
        value: 'promotional_offer',
        label: 'Promotional offer',
    },
];
