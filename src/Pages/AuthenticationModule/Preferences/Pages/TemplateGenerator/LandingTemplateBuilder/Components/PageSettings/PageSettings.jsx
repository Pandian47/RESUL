import { circle_plus_edge_medium, colorpicker_bg_medium } from 'Constants/GlobalConstant/Glyphicons';
import RSColorPicker from 'Components/ColorPicker';
import RSInput from 'Components/FormFields/RSInput';
import { useFieldArray, useFormContext } from 'react-hook-form';
import BackgroundImageBox from '../OpenStyleManager/Components/BackgroundImageBox';

const PageSettings = () => {
    const { control, setValue, watch } = useFormContext();
    const [bgValues] = watch([`pageBackgroundValues`]);
    const {
        fields: bgFields,
        append: bgAppend,
        remove: bgRemove,
    } = useFieldArray({ name: `pageBackgroundValues`, control });
    return (
        <>
            <div className="rsbstc-settings-general">
                <div className="rsbstc-settings-block">
                    <div className="form-group mt10">
                        <RSInput name={'pageTitle'} control={control} placeholder={'Page title'} />
                    </div>
                    <div className="form-group">
                        <RSInput name={'pageDescription'} control={control} placeholder={'Page description'} />
                    </div>
                    <div className="form-group">
                        <RSInput name={'pageKeywords'} control={control} placeholder={'Page keywords'} />
                    </div>
                    <div className="form-group">
                        <RSInput name={'headerCode'} control={control} placeholder={'Header code'} />
                    </div>
                    <div className="form-group">
                        <RSInput name={'footerCode'} control={control} placeholder={'Footer code'} />
                    </div>
                </div>
                <div className="rsbstc-settings-block">
                    <div className="settings-block-wrapper">
                        <div className="sbw-label">Background color</div>
                        <div className="sbw-content">
                            <RSColorPicker
                                icon={`${colorpicker_bg_medium} icon-md`}
                                onSelect={(color) => setValue(`pageBackgroundColor`, color)}
                            />
                        </div>
                    </div>
                </div>
                <div className="rsbstc-settings-block">
                    <div className="settings-block-wrapper">
                        <div className="sbw-label">Background image</div>
                        <div className="sbw-content">
                            <i
                                id='rs_data_circle_plus_edge'
                                className={`${circle_plus_edge_medium} icon-md color-primary-blue  ${
                                    bgValues?.length < 2 ? '' : 'click-off'
                                }`}
                                onClick={() => {
                                    bgAppend({
                                        imageSrc: '',
                                        size: '',
                                        repeat: '',
                                        position: '',
                                        attachment: '',
                                    });
                                }}
                            />
                            {bgFields.map((field, idx) => {
                                return (
                                    <BackgroundImageBox
                                        key={idx + 'bgImg'}
                                        rowName={`pageBackgroundValues`}
                                        remove={bgRemove}
                                        idx={idx}
                                        bgValues={bgValues}
                                        element={'page'}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PageSettings;
