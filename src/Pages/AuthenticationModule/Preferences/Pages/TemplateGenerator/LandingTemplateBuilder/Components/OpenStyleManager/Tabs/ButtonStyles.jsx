import { WEBURL_REGEX } from 'Constants/GlobalConstant/Regex';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import { useFormContext } from 'react-hook-form';
import RSInput from 'Components/FormFields/RSInput';
import { ENTER_LINK, ENTER_PROPER_URL } from 'Constants/GlobalConstant/ValidationMessage';

const ButtonStyles = ({ element }) => {
    const { control } = useFormContext();
    return (
        <div className="rsbstc-settings-block">
            <div className="form-group mt10">
                <RSInput name={`${element}.title`} control={control} placeholder={'Title'} />
            </div>
            <div className="form-group">
                <RSInput
                    name={`${element}.href`}
                    control={control}
                    placeholder={'Href'}
                    rules={{
                        required: ENTER_LINK,
                        pattern: {
                            value: WEBURL_REGEX,
                            message: ENTER_PROPER_URL,
                        },
                    }}
                />
            </div>
            <div className="form-group">
                <RSKendoDropdown
                    data={['This window', 'New window']}
                    control={control}
                    name={`${element}.target`}
                    label={'Target'}
                />
            </div>
        </div>
    );
};

export default ButtonStyles;
