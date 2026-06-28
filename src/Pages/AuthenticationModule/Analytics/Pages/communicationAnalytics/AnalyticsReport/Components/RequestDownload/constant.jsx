import Daily from "Pages/AuthenticationModule/Components/Schedules/Daily";
import Monthly from "Pages/AuthenticationModule/Components/Schedules/Monthly";
import Weekly from "Pages/AuthenticationModule/Components/Schedules/Weekly";

export const FORM_INITIAL_STATE = {
    defaultValues: {
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
        share: "Link",
        email: ''
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
    {
        text: 'End of communication',
        component: () => <div className='mt23'>Communication end date Sat, Sep 16, 2023 14:43:24</div>
    }
];