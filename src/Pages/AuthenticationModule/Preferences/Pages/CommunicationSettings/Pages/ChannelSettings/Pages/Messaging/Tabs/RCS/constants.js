export const RCS_FORM_ACTIONS_PORTAL_ID = 'pref-cs-rcs-form-actions';

export const ACTION_INITIAL_STATE = {
    showGrid: true,
    rcsAction: {
        edit: {
            editState: [],
            isEdit: false,
        },
        create: false,
    },
};

export const FORM_INITIAL_STATE = {
    defaultValues: {
        vendorFriendlyName: '',
        provider: null,
        country: null,
        serviceAccountJson: '',
        agentId: '',
        agentName: '',
        brandName: '',
        brandLogoUrl: '',
        websiteUrl: '',
        privacyPolicyUrl: '',
        messageStatusCallbackUrl: '',
        userInteractionCallbackUrl: '',
        optOutCallbackUrl: '',
        senderDetails: [{ senderId: '', senderName: '', isDelete: false }],
        rcsResponse: [{ template: '', templateName: '', isDelete: false }],
    },
    mode: 'onTouched',
};
