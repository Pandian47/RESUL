export const VERIFICATION_METHODS = [
    {
        id: 'email',
        title: 'Email OTP',
        description: 'Receive a one-time password via email. Simple and accessible from anywhere.',
        icon: 'icon-rs-email-large',
    },
    {
        id: 'authenticator',
        title: 'Authenticator App',
        description: 'Use Google Authenticator, Microsoft Authenticator, or similar apps. More secure and works offline.',
        icon: 'icon-rs-shield-tick-large',
    },
];

export const FORM_INITIAL_STATE = {
    defaultValues: {
        verificationMethod: '',
    },
    mode: 'onChange',
};

