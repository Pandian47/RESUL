
export function getDayDifference(renewalDateStr) {
    if (!renewalDateStr) return 0;

    const [day, month, year] = renewalDateStr.split('/').map(Number);

    const renewalDate = new Date(year, month - 1, day);
    const today = new Date();

    renewalDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = renewalDate.getTime() - today.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
}
export function getRenewalMessage(daysDiff) {
    return RENEWAL_CONTENT.find((item) => item.match(daysDiff)) || null;
}

export const RENEWAL_CONTENT = [
    // ================= BEFORE RENEWAL =================
    {
        match: (d) => d === 60,
        title: '60 Days Before Renewal',
        message:
            'Your RESUL plan will expire in 60 days. Please renew in time to avoid service interruptions. Contact your account manager for support.',
    },
    {
        match: (d) => d === 30,
        title: '30 Days Before Renewal',
        message:
            'Your RESUL plan will expire in 30 days. Please renew in time to continue enjoying our platform. Contact your account manager for support.',
    },
    {
        match: (d) => d === 15,
        title: '15 Days Before Renewal',
        message:
            'Your RESUL plan will expire in 15 days. Renew in time to avoid performance interruptions. your account manager for support.',
    },
    {
        match: (d) => d === 7,
        title: '7 Days Before Renewal',
        message:
            'Your RESUL plan will expire in 7 days. To keep using our solution, renew your plan in time. Contact your account manager for support.',
    },
    {
        match: (d) => d === 3,
        title: '3 Days Before Renewal',
        message:
            'Your RESUL plan will expire in 3 days. Complete renewal to maintain access to our platform. Contact your account manager for support.',
    },
    // {
    //     match: (d) => d === 2,
    //     title: '2 Days Before Renewal',
    //     message:
    //         'Your subscription renewal is due in 2 days. We recommend completing the process at the earliest to avoid any potential service impact. Your platform SPOC/Admin can help if required.',
    // },
    {
        match: (d) => d === 1,
        title: '1 Day Before Renewal',
        message:
            'Your plan will expire tomorrow. DonΓÇÖt forget to renew to keep accessing RESUL. Contact your account manager for support.',
    },

    // ================= ON RENEWAL DATE =================
    {
        match: (d) => d === 0,
        title: 'On Renewal Date',
        message:
            'Your plan will expire today. To continue enjoying RESUL, renew your plan. Please contact your account manager for support.',
    },

    // ================= AFTER RENEWAL =================
    {
        match: (d) => d === -1,
        title: '1 Day After Renewal Due Date',
        message:
            'Your RESUL renewal is overdue by 1 day. Continued delay will affect platform access. Contact your account manager to renew immediately.',
    },
    {
        match: (d) => d === -3,
        title: '3 Days After Renewal Due Date',
        message:
            'Your RESUL renewal is overdue by 3 days. Continued delay will affect platform access. Contact your account manager to renew immediately.',
    },
    {
        match: (d) => d === -7,
        title: '7 Days After Renewal Due Date',
        message:
            'Your renewal is overdue by 7 days. Your RESUL account will be downgraded and have limited access. Contact your account manager to renew now.',
    },
    {
        match: (d) => d === -15,
        title: '15 Days After Renewal Due Date',
        message:
            'Your RESUL renewal is overdue by 15 days. Your plan has been downgraded to Grade II. Contact your account manager to renew immediately.',
    },
    {
        match: (d) => d === -30,
        title: '30 Days After Renewal Due Date',
        message:
            'Your RESUL renewal is overdue by 30 days. To restore your plan from Grade II, renew immediately. For support, contact your account manager.',
    },
];

export const specialCharacters = new Set([
    '!',
    '@',
    '#',
    '$',
    '%',
    '^',
    '&',
    '*',
    '(',
    ')',
    '-',
    // '_',
    '+',
    '=',
    '{',
    '}',
    '[',
    ']',
    ';',
    ':',
    '"',
    "'",
    '<',
    ',',
    '>',
    '.',
    '?',
    '/',
    '|',
    '`',
    '~',
    '\\',
]);

export function getDaysOrHours(dateString, currentDate = new Date()) {
    if (dateString == null || dateString === '') return '';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';
    const diffTime = Math.abs(currentDate - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffSeconds = Math.floor(diffTime / 1000);

    if (diffDays > 30) {
        const diffMonths = Math.ceil(diffDays / 30);
        return diffMonths > 1 ? `${diffMonths} months ago` : `${diffMonths} month ago`;
    }

    if (diffHours < 1) {
        if (diffMinutes < 1) {
            return `${diffSeconds} seconds ago`;
        }
        return `${diffMinutes} minutes ago`;
    }

    return diffDays > 1 ? `${diffDays} days ago` : `${diffHours} hours ago`;
}

export function getMinutes(timestamp) {
    if (timestamp == null || Number.isNaN(Number(timestamp))) return 0;
    const now = Date.now();
    const difference = now - timestamp;
    const minutes = Math.floor(difference / (1000 * 60));
    return minutes;
}
