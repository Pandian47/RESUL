import { WEBURL_REGEX } from 'Constants/GlobalConstant/Regex';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import { useFormContext } from 'react-hook-form';
import RSInput from 'Components/FormFields/RSInput';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import { ENTER_LINK, ENTER_PROPER_URL } from 'Constants/GlobalConstant/ValidationMessage';

const VideoStyles = ({ element }) => {
    const { control, watch } = useFormContext();
    const provider = watch(`${element}.provider`);
    return (
        <>
            <div className="rsbstc-settings-block">
                <div className="form-group mt20">
                    <RSKendoDropdown
                        data={['HTML5 Source', 'Vimeo', 'Youtube']}
                        control={control}
                        name={`${element}.provider`}
                        defaultValue={'Youtube'}
                        label={'Provider'}
                    />
                </div>
                <div className="form-group">
                    <RSInput
                        name={`${element}.videoLink`}
                        control={control}
                        rules={{
                            required: ENTER_LINK,
                            pattern: {
                                value: WEBURL_REGEX,
                                message: ENTER_PROPER_URL,
                            },
                        }}
                        placeholder={
                            provider === 'HTML5 Source' ? 'Source' : provider === 'Vimeo' ? 'Video ID' : 'Video URL'
                        }
                    />
                    {provider !== 'HTML5 Source' && (
                        <div className="alert alert-warning p5 mt5">
                            <small>Note: Please enter only Video ID without URL.</small>
                        </div>
                    )}
                </div>
                {provider === 'HTML5 Source' && (
                    <div className="form-group">
                        <RSInput
                            name={`${element}.posterColor`}
                            control={control}
                            placeholder={'Poster'}
                            rules={{
                                required: ENTER_LINK,
                                pattern: {
                                    value: WEBURL_REGEX,
                                    message: ENTER_PROPER_URL,
                                },
                            }}
                        />
                    </div>
                )}
                {provider === 'Vimeo' && (
                    <div className="form-group">
                        <RSInput
                            name={`${element}.posterColor`}
                            control={control}
                            placeholder={'Color'}
                            rules={{
                                required: ENTER_LINK,
                                pattern: {
                                    value: WEBURL_REGEX,
                                    message: ENTER_PROPER_URL,
                                },
                            }}
                        />
                    </div>
                )}
            </div>
            <div className="rsbstc-settings-block">
                <div className="settings-block-wrapper">
                    <div className="sbw-label">Autoplay</div>
                    <div className="sbw-content">
                        <RSCheckbox control={control} name={`${element}.autoplay`} />
                    </div>
                </div>
            </div>
            <div className="rsbstc-settings-block">
                <div className="settings-block-wrapper">
                    <div className="sbw-label">Loop</div>
                    <div className="sbw-content">
                        <RSCheckbox control={control} name={`${element}.loop`} />
                    </div>
                </div>
            </div>

            {(provider === 'HTML5 Source' || provider === 'Youtube') && (
                <div className="rsbstc-settings-block">
                    <div className="settings-block-wrapper">
                        <div className="sbw-label">Controls</div>
                        <div className="sbw-content">
                            <RSCheckbox control={control} name={`${element}.controls`} defaultValue={true} />
                        </div>
                    </div>
                </div>
            )}

            {provider === 'Youtube' && (
                <>
                    <div className="rsbstc-settings-block">
                        <div className="settings-block-wrapper">
                            <div className="sbw-label">Related</div>
                            <div className="sbw-content">
                                <RSCheckbox control={control} name={`${element}.related`} defaultValue={true} />
                            </div>
                        </div>
                    </div>
                    <div className="rsbstc-settings-block">
                        <div className="settings-block-wrapper">
                            <div className="sbw-label">Modest</div>
                            <div className="sbw-content">
                                <RSCheckbox control={control} name={`${element}.modest`} />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default VideoStyles;
