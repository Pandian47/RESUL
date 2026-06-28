import { MOBILE_NUMBER, SHARABLE_CONTENT, WEB_URL } from 'Constants/GlobalConstant/Placeholders';
import { EMAIL_MESSAGE_RULES } from 'Constants/GlobalConstant/Rules';
import { MAX_LENGTH100, MAX_LENGTH50, WEBSITE_REGEX } from 'Constants/GlobalConstant/Regex';
import { ENTER_VALID_LINK, SELECT_LINK } from 'Constants/GlobalConstant/ValidationMessage';
import { memo } from 'react';
import RSPhoneInput from 'Components/FormFields/RSPhoneInput';
import RSTextarea from 'Components/FormFields/RSTextarea';
import { useFormContext } from 'react-hook-form';
import RSInput from 'Components/FormFields/RSInput';

const RenderInput = ({ type, name }) => {
    const { control, setError, clearErrors } = useFormContext();
    switch (type) {
        case 'Call':
            return (
                <RSPhoneInput
                    control={control}
                    name={`${name}.link`}
                    placeholder={MOBILE_NUMBER}
                    required
                    setError={setError}
                    clearErrors={clearErrors}
                    maxLength={MAX_LENGTH50}
                    isCountryCodeRetrive ={true}
                />
            );
        case 'Share':
            return (
                <div className="preference-modal mt9">
                <RSTextarea
                    name={`${name}.link`}
                    control={control}
                    required
                    placeholder={SHARABLE_CONTENT}
                    maxLength={120}
                    // rules={EMAIL_MESSAGE_RULES}
                />
                </div>
            );
        default:
            return (
                <RSInput
                    name={`${name}.link`}
                    control={control}
                    required
                    placeholder={WEB_URL}
                    maxLength={MAX_LENGTH100}
                    rules={{
                        required: SELECT_LINK,
                        pattern: {
                            value: WEBSITE_REGEX,
                            message: ENTER_VALID_LINK,
                        },
                    }}
                    defaultValue={''}
                    // handleOnBlur={(e) => {
                    //     console.log('Input url :: ', e);
                    //     setValue(`${name}.link`, e.target.value);
                    // }}
                />
            );
    }
};

export default memo(RenderInput);
