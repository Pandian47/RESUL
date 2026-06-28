import { COMMUNICATION_NAME, DYNAMICLIST_WEBURL_REGEX, EMOJI_REPRESENTATION, FRIENDLY_NAME_REGEX, MAX_LENGTH, MAX_LENGTH100, MAX_LENGTH15, MAX_LENGTH200, MAX_LENGTH255, MAX_LENGTH50, MIN_LENGTH, NEW_EMAIL_REGEX, NUMBER_REGEX, PASSWORD_REGEX, PERCENTAGE, WEBSITE_REGEX, WHITE_SPACE_WITH_LISTNAME_REGEX, WHITE_SPACE_WITH_NAME_REGEX } from 'Constants/GlobalConstant/Regex';
import { BENCHMARK_NAME, CONFIRM_NEW_PASSWORD, CONFIRM_PASSWORD_NOT_MATCH, ENTER_ATTRIBUTE_NAME, ENTER_CITY, ENTER_DOMAIN, ENTER_EMAIL_MESSAGE, ENTER_FALLBACK_ATTRIBUTE_NAME, ENTER_FIRST_NAME, ENTER_INPUT_VALUES, ENTER_LAST_NAME, ENTER_LIST_NAME, ENTER_OTP, ENTER_PASSWORD, ENTER_VALID_DOMAIN, ENTER_VALID_EMAIL, ENTER_VALID_NUMBER, ENTER_VALID_OTP, ENTER_VALID_PASSWORD, ENTER_VALID_PERCENTAGE, ENTER_VALID_WEBSITE, ENTER_VALID_ZIP, ENTER_WEBSITE, ENTER_ZIP, FRIENDLY_NAME, MAX200LENGTH, MAX255LENGTH, MAX75LENGTH, MAXLENGTH, MAX_EMAILLENGTH, MINLENGTH, ONLY_NUMBERS_ALLOWED, SPECIAL_CHATACTERS_NOT_ALlOWED, THIS_FIELD_IS_REQUIRED, VALID_ATTRIBUTE_NAME, VALID_BENCHMARK_NAME, VALID_FALLBACK_ATTRIBUTE_NAME, VALID_FIRSTNAME, VALID_LASTNAME } from 'Constants/GlobalConstant/ValidationMessage';
export const FIRSTNAME_RULES = {
    required: ENTER_FIRST_NAME,
    // pattern: {
    //     value: WHITE_SPACE_WITH_NAME_REGEX,
    //     message: VALID_FIRSTNAME,
    // },

    maxLength: {
        value: MAX_LENGTH50,
        message: MAXLENGTH,
    },
    // validate: (data) => (EMOJI_REPRESENTATION.test(data) ? VALID_FIRSTNAME : true),
};

export const LASTNAME_RULES = {
    required: ENTER_LAST_NAME,
    // pattern: {
    //     value: WHITE_SPACE_WITH_NAME_REGEX,
    //     message: VALID_LASTNAME,
    // },
    // minLength: {
    //     value: MIN_LENGTH,
    //     message: MINLENGTH,
    // },
    maxLength: {
        value: MAX_LENGTH50,
        message: MAXLENGTH,
    },
    // validate: (data) => (regexpEmojiPresentation.test(data) ? VALID_LASTNAME : true),
};

export const EMAIL_RULES = {
    required: ENTER_VALID_EMAIL,
    pattern: {
        value: NEW_EMAIL_REGEX,
        message: ENTER_VALID_EMAIL,
    },
    maxLength: {
        value: MAX_LENGTH100,
        message: MAX_EMAILLENGTH,
    },
};
export const EMAIL_APPROVAL_RULES = {
    required: ENTER_VALID_EMAIL,
    maxLength: {
        value: MAX_LENGTH100,
        message: MAX_EMAILLENGTH,
    },
};

export const EMAIL_MESSAGE_RULES = {
    required: ENTER_EMAIL_MESSAGE,
};

export const ZIP_RULES = {
    required: ENTER_ZIP,
    minLength: {
        value: 3,
        message: 'Enter valid ZIP code',
    },
    // pattern: {
    //     value: NUMBER_REGEX,
    //     message: ENTER_VALID_ZIP,
    // },
    // validate: (data) => (regexpEmojiPresentation.test(data) ? ENTER_VALID_ZIP : true),
};
export const CITY_RULE = {
    required: ENTER_CITY,
    // pattern: {
    //     value: WHITE_SPACE_WITH_NAME_REGEX,
    //     message: ENTER_CITY,
    // },
    minLength: {
        value: MIN_LENGTH,
        message: MINLENGTH,
    },
    maxLength: {
        value: MAX_LENGTH50,
        message: MAXLENGTH,
    },
    validate: (data) => (data?.trim()?.length < MIN_LENGTH ? MINLENGTH : true),
    // validate: (data) => (regexpEmojiPresentation.test(data) ? ENTER_CITY : true),
};
export const PASSWORD_RULES = {
    pattern: {
        value: PASSWORD_REGEX,
        message: ENTER_VALID_PASSWORD,
    },
    minLength: {
        value: 8,
        message: ENTER_VALID_PASSWORD,
    },
    // validate: (data) => (regexpEmojiPresentation.test(data) ? ENTER_VALID_PASSWORD : true),
    required: ENTER_PASSWORD,
};
export const COMFIRMPASSWORD_RULES = (password) => {
    return {
        pattern: {
            value: PASSWORD_REGEX,
            message: ENTER_VALID_PASSWORD,
        },
        minLength: {
            value: 8,
            message: ENTER_VALID_PASSWORD,
        },
        required: CONFIRM_NEW_PASSWORD,
        validate: (data) => (data !== password ? CONFIRM_PASSWORD_NOT_MATCH : true),
    };
};

export const WEBSITE_RULES = {
    required: ENTER_WEBSITE,
    pattern: {
        value: WEBSITE_REGEX, //WEBURL_REGEX
        message: ENTER_VALID_WEBSITE,
    },
};
export const WEBSITE_RULES_SECURE = {
    required: ENTER_WEBSITE,
    pattern: {
        value: DYNAMICLIST_WEBURL_REGEX,
        message: ENTER_VALID_WEBSITE,
    },
};

export const DOMAIN_RULES = {
    required: ENTER_DOMAIN,
    pattern: {
        value: WEBSITE_REGEX,
        message: ENTER_VALID_DOMAIN,
    },
};

export const OTP_RULES = {
    required: ENTER_OTP,
    // minLength: {
    //     value: 6,
    //     message: ENTER_VALID_OTP,
    // },
    pattern: {
        value: NUMBER_REGEX,
        message: ENTER_VALID_OTP,
    },
};

export const PERCENTAGE_RULES = (message) => {
    return {
        required: message,
        pattern: {
            value: PERCENTAGE,
            message: ENTER_VALID_PERCENTAGE,
        },
        validate: (data) => (parseFloat(data) === 0 ||parseFloat(data)> 99.99 ? ENTER_VALID_PERCENTAGE : true),
    };
};

export const ATTRIBUTE_NAME_RULES = {
    required: ENTER_ATTRIBUTE_NAME,
    // pattern: {
    //     value: WHITE_SPACE_WITH_LISTNAME_REGEX,
    //     message: VALID_ATTRIBUTE_NAME,
    // },
    minLength: {
        value: MIN_LENGTH,
        message: MINLENGTH,
    },
    maxLength: {
        value: MAX_LENGTH50,
        message: MAXLENGTH,
    },
    validate: (data) => (data?.trim()?.length < MIN_LENGTH ? MINLENGTH : true),
};

export const FALLBACK_ATTRIBUTE_RULES = {
    required: ENTER_FALLBACK_ATTRIBUTE_NAME,
    // pattern: {
    //     value: WHITE_SPACE_WITH_LISTNAME_REGEX,
    //     message: VALID_FALLBACK_ATTRIBUTE_NAME,
    // },
    minLength: {
        value: MIN_LENGTH,
        message: MINLENGTH,
    },
    maxLength: {
        value: MAX_LENGTH50,
        message: MAXLENGTH,
    },
    validate: (data) => (data?.trim()?.length < MIN_LENGTH ? MINLENGTH : true),
};

export const FREQUNCY_RULES = {
    required: 'Enter frequency',
    pattern: { value: NUMBER_REGEX, message: 'Enter valid frequency' },
};

export const LIST_NAME_RULES = (err = ENTER_LIST_NAME, isDynamic = false, maxLengthValue = null) => {
    let maxLength, maxLengthMessage;
    
    if (maxLengthValue === MAX_LENGTH200) {
        maxLength = MAX_LENGTH200;
        maxLengthMessage = MAX200LENGTH;
    } else if (isDynamic) {
        maxLength = MAX_LENGTH255;
        maxLengthMessage = MAX255LENGTH;
    } else {
        maxLength = MAX_LENGTH;
        maxLengthMessage = MAX75LENGTH;
    }
    
    return {
        required: err,
        // pattern: {
        //     value: WHITE_SPACE_WITH_LISTNAME_REGEX,
        //     message: VALID_ATTRIBUTE_NAME,
        // },
        minLength: {
            value: MIN_LENGTH,
            message: MINLENGTH,
        },
        maxLength: {
            value: maxLength,
            message: maxLengthMessage,
        },
        validate: (data) => (data?.trim()?.length < MIN_LENGTH ? MINLENGTH : true),
        //validate: (data) => (COMMUNICATION_NAME.test(data) ? SPECIAL_CHATACTERS_NOT_ALlOWED : true),
    };
};

export const BENCHMARK_RULE = {
    required: BENCHMARK_NAME,
    // pattern: {
    //     value: WHITE_SPACE_WITH_LISTNAME_REGEX,
    //     message: VALID_BENCHMARK_NAME,
    // },
    minLength: {
        value: MIN_LENGTH,
        message: MINLENGTH,
    },
    maxLength: {
        value: MAX_LENGTH50,
        message: MAXLENGTH,
    },
    validate: (data) => (data?.trim()?.length < MIN_LENGTH ? MINLENGTH : true),
};


export const DECIMAL_FIELD_RULE = {
    required: ENTER_INPUT_VALUES,
    pattern: {
        value: NUMBER_REGEX,
        message: ENTER_VALID_NUMBER,
    },
    minLength: {
        value: 1,
        message: 'Min. 1 digit allowed',
    },
    maxLength: {
        value: MIN_LENGTH,
        message: 'Max. ' + MIN_LENGTH + ' digits allowed',
    },
    validate: (data) => (data?.trim()?.length < MIN_LENGTH ? MINLENGTH : true),
};

export const FRIENDLYNAME_RULES = {
    required: FRIENDLY_NAME,
    pattern: {
        value: FRIENDLY_NAME_REGEX,
        message: SPECIAL_CHATACTERS_NOT_ALlOWED,
    },
    maxLength: {
        value: MAX_LENGTH,
        message: MAX75LENGTH,
    },
    minLength: {
        value: MIN_LENGTH,
        message: MINLENGTH,
    },
    validate: (data) => (data.trim()?.length < MIN_LENGTH ? MINLENGTH : true),
};

export const NUMBER_FIELD_RULES = ({
    requiredMessage = THIS_FIELD_IS_REQUIRED,
    patternMessage = ONLY_NUMBERS_ALLOWED,
    minLengthValue = MIN_LENGTH,
    minLengthMessage = MINLENGTH,
    maxLengthValue = MAX_LENGTH15,
    maxLengthMessage = 'Max. ' + MAX_LENGTH15 + ' digits allowed',
} = {}) => ({
    required: requiredMessage,
    pattern: {
        value: NUMBER_REGEX,
        message: patternMessage,
    },
    minLength: { value: minLengthValue, message: minLengthMessage },
    maxLength: { value: maxLengthValue, message: maxLengthMessage },
});
