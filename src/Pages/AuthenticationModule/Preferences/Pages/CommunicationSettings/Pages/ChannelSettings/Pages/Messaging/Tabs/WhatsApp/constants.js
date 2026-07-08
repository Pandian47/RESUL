export const WHATSAPP_FORM_ACTIONS_PORTAL_ID = 'pref-cs-whatsapp-form-actions';

export { WHATSAPP_INNER_TAB_CONFIG } from '../../../../constant';

export const ACTION_INITIAL_STATE = {
    showGrid: true,
    whatsAppAction: {
        edit: {
            editState: [],
            isEdit: false,
        },
        create: false,
    },
};

export const FORM_INITIAL_STATE = {
    defaultValues: {
        senderDetails: [{ senderId: '', senderName: '', isDelete: false }],
        whatsAppResponse: [{ template: '', templateName: '', isDelete: false }],
    },
    mode: 'onTouched',
};
