import { MOBILE_NUMBER, SHARABLE_CONTENT, WEB_URL } from 'Constants/GlobalConstant/Placeholders';
import { MAX_LENGTH100, MAX_LENGTH50 } from 'Constants/GlobalConstant/Regex';
import { ENTER_PHONE, ENTER_SHARABLE_CONTENT, ENTER_VALID_LINK } from 'Constants/GlobalConstant/ValidationMessage';
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
                    maxLength={MAX_LENGTH50}
                    rules={{
                        required: ENTER_PHONE,
                    }}
                    setError={setError}
                    clearErrors={clearErrors}
                    isCountryCodeRetrive={true}
                    countryCodeEditable
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
                    rules={{
                        required: ENTER_SHARABLE_CONTENT,
                        pattern: {},
                    }}
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
                        required: ENTER_VALID_LINK,
                        validate: (url) => {
                            const urlRegex = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,6}(\/.*)?$/i;

                            try {
                                let newUrl = new URL(url);
                                let origin = newUrl.origin;
                                let rslt = urlRegex.test(origin);

                                if (!rslt) {
                                    return ENTER_VALID_LINK;
                                }
                            } catch (e) {
                                return ENTER_VALID_LINK;
                            }
                            try {
                                const parsedUrl = new URL(url);
                                const validProtocols = ['https:', 'http:'];
                                return validProtocols.includes(parsedUrl.protocol);
                            } catch (e) {
                                return ENTER_VALID_LINK;
                            }
                        },
                    }}
                    defaultValue={''}
                />
            );
    }
};

export default memo(RenderInput);
