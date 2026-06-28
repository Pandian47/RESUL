import Daily from 'Pages/AuthenticationModule/Components/Schedules/Daily';
import Monthly from 'Pages/AuthenticationModule/Components/Schedules/Monthly';
import Weekly from 'Pages/AuthenticationModule/Components/Schedules/Weekly';

export const FORM_INITIAL_STATE = {
    defaultValues: {
        mailTo: '',
        message: '',
        schedule: false,
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
            second_days: '',
            second_frequency: '',
            first_hours: '',
            first_months: '',
            first_days: '',
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
        component: () => <Monthly control={control} />,
    },
];

export const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
