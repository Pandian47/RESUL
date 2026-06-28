import { NUMBER_REGEX } from 'Constants/GlobalConstant/Regex';
import { ENTER_INPUT_VALUES, ENTER_VALID_NUMBER } from 'Constants/GlobalConstant/ValidationMessage';
export const DURATION_FIELD_RULE = (type) => {
    return {
        // required: ENTER_INPUT_VALUES,
        pattern: {
            value: NUMBER_REGEX,
            message: ENTER_VALID_NUMBER,
        },
        minLength: {
            value: 1,
            message: 'Min. 1 digit allowed',
        },
        maxLength: {
            value: 2,
            message: 'Max. ' + 2 + ' digits allowed',
        },
        validate: (data) => {
            // if (type === 'minutes') {
            //     return data < 1 ? 'Min. value 1' : true;
            // } else if (type === 'seconds') {
            //     return data < 10 ? 'Min. value 10' : true;
            // }
        },
    };
};

export const buildPayload = ({ data, userData, mdcContentSetupDetails, campaignId }) => {
    const {
        category: { conversionCategoryId: categoryId },
        subscriptionFormName: { formId },
        conversionUrl,
        minutes,
        seconds,
    } = data;
    const landingPage = {
        campaignId,
        categoryId,
        formId,
        conversionType: 'Landing',
        duration: `${minutes}:${seconds}`,
        goalType: mdcContentSetupDetails.channelId === 'goal001' ? 'g1' : 'g2',
        url: conversionUrl.map((urls) => urls.url)?.filter(Boolean),
    };
    return { ...userData, landingPage, ...mdcContentSetupDetails };
};
