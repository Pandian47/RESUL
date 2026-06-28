import { tick_large } from 'Constants/GlobalConstant/Glyphicons';
export const PAYMENT_TAB_CONFIG = [
    { id: 1, text: 'Email', disable: false, component: () => {} },
    { id: 2, text: 'SMS', disable: false, component: () => {} },
    { id: 3, text: 'Mobile Push', disable: false, component: () => {} },
    { id: 4, text: 'Web Push', disable: false, component: () => {} },
    { id: 5, text: 'QR', disable: false, component: () => {} },
    { id: 6, text: 'WhatsApp', disable: false, component: () => {} },
    { id: 7, text: 'VMS', disable: false, component: () => {} },
    { id: 8, text: 'Line', disable: false, component: () => {} },
];
export const TAB_HEADER_CONFIG = {
    1: "Email",
    2: "SMS",
    3: "QR",
    4: 'ORM',
    5: 'Social media',
    6: 'Web analytics',
    7: 'Social post',
    8: "Web Push",
    10: "Paid media",
    14: "Mobile Push",
    21: "WhatsApp",
    25: "VMS",
    26: "Voice",
    30: "Line",
    41: "RCS",
} 

export const progressAnalysisSteps = [
    {
        step: <i className={`${tick_large} icon-lg color-secondary-green`}></i>,
        status: 'completed',
        stepTitle: 'List quality',
    },
    {
        step: <i className={`${tick_large} icon-lg color-secondary-green`}></i>,
        status: 'completed',
        stepTitle: 'Content Analysis',
    },
    {
        step: <i className={`${tick_large} icon-lg color-secondary-green`}></i>,
        status: 'completed',
        stepTitle: 'Predictive Analysis',
    },
];
