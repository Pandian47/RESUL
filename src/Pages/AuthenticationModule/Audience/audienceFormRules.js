/**
 * Form validation rules for the audience chunk — no Rules/ValidationMessage/Regex barrel (prod TDZ).
 * Mirrors Constants/GlobalConstant/Rules LIST_NAME_RULES + FRIENDLYNAME_RULES.
 */
const MIN_LENGTH = 3;
const MAX_LENGTH = 75;
export const AUDIENCE_LIST_NAME_MAX_LENGTH200 = 200;
const MAX_LENGTH255 = 255;

const FRIENDLY_NAME_REGEX = /^([a-zA-Z0-9 _-]+)$/;

const MSG = Object.freeze({
    ENTER_LIST_NAME: 'Enter list name',
    MINLENGTH: `Min. ${MIN_LENGTH} characters`,
    MAX75LENGTH: `Max. ${MAX_LENGTH} characters`,
    MAX200LENGTH: `Max. ${AUDIENCE_LIST_NAME_MAX_LENGTH200} characters`,
    MAX255LENGTH: `Max. ${MAX_LENGTH255} characters`,
    FRIENDLY_NAME: 'Enter friendly name',
    SPECIAL_CHATACTERS_NOT_ALlOWED: 'Only (_ & -) are allowed',
});

export const LIST_NAME_RULES = (err = MSG.ENTER_LIST_NAME, isDynamic = false, maxLengthValue = null) => {
    let maxLength;
    let maxLengthMessage;

    if (maxLengthValue === AUDIENCE_LIST_NAME_MAX_LENGTH200) {
        maxLength = AUDIENCE_LIST_NAME_MAX_LENGTH200;
        maxLengthMessage = MSG.MAX200LENGTH;
    } else if (isDynamic) {
        maxLength = MAX_LENGTH255;
        maxLengthMessage = MSG.MAX255LENGTH;
    } else {
        maxLength = MAX_LENGTH;
        maxLengthMessage = MSG.MAX75LENGTH;
    }

    return {
        required: err,
        minLength: {
            value: MIN_LENGTH,
            message: MSG.MINLENGTH,
        },
        maxLength: {
            value: maxLength,
            message: maxLengthMessage,
        },
        validate: (data) => (data?.trim()?.length < MIN_LENGTH ? MSG.MINLENGTH : true),
    };
};

export const FRIENDLYNAME_RULES = {
    required: MSG.FRIENDLY_NAME,
    pattern: {
        value: FRIENDLY_NAME_REGEX,
        message: MSG.SPECIAL_CHATACTERS_NOT_ALlOWED,
    },
    maxLength: {
        value: MAX_LENGTH,
        message: MSG.MAX75LENGTH,
    },
    minLength: {
        value: MIN_LENGTH,
        message: MSG.MINLENGTH,
    },
    validate: (data) => (data.trim()?.length < MIN_LENGTH ? MSG.MINLENGTH : true),
};
