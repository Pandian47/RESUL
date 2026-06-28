import { CAPTCHA } from 'Constants/GlobalConstant/Placeholders';
import { memo, useContext } from 'react';
import { useFormContext } from 'react-hook-form';
import { BODYCONFIG } from '../../constant';
import RSEditorPopup from 'Components/FormFields/RSEditorPopup/RSEditorPopup';
import { FormGeneratorContext } from '../FormTypes/FormGenerator';
import { RSCaptchaGenerator } from 'Components/RSCaptcha';
import RSSwitch from 'Components/FormFields/RSSwitch';
import RSInput from 'Components/FormFields/RSInput';
import { Col, Row } from 'react-bootstrap';
const FormCaptcha = ({ selectedColor, preview, isQrPreview = false, themeColors }) => {
    const { control, setValue, watch, getValues } = useFormContext();
    const context = isQrPreview ? null : useContext(FormGeneratorContext);
    const allValues = getValues()
    const dispatchState = context?.dispatchState;

    // Watch for enableCaptchaCheckbox value
    const enableCaptcha = watch('enableCaptchaCheckbox');

    // In preview mode, only show if captcha is enabled
    if (preview && !enableCaptcha) {
        return null;
    }

    return (
        <div className={`${preview ? 'fbc-preview' : 'form-builder-component'}`} style={{ background: selectedColor }}>
            <div className={`${preview ? '' : 'p19 mb15'} editor-text formButton position-relative`}>
                <Row>
                    <Col
                        md={
                           
                                !preview
                                ? 9
                                : 12
                        }
                    >
                        <ul className={`rs-list-inline rli-space-5 form-button w-100 ${!preview && allValues?.formStyles?.formLayout === 'horizontal' ? 'ml28' : !isQrPreview ? 'ml-5': ''}`}>
                            {preview ? (
                                // Preview mode - show captcha input
                                <li>
                                    <div className="rsfch-full">
                                        <ul className="rs-list-inline rsfch-consent-block">
                                            <li>
                                                <div className='form-group captcha-preview-wrapper mt21'>
                                                    <RSCaptchaGenerator
                                                        control={control}
                                                        setValue={setValue}
                                                        isFormsPreviewCaptcha={true}
                                                    />
                                                </div>
                                                <div className='form-group'>
                                                    <Col md={9}>
                                                        <RSInput
                                                            control={control}
                                                            name='captcha'
                                                            placeholder={CAPTCHA}
                                                            required
                                                        />
                                                    </Col>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </li>
                            ) : (
                                // Canvas/Editor mode - show switch and label editor
                                <li>
                                    <div className="rsfch-full">
                                        <ul className="rs-list-inline rsfch-consent-block">
                                            <li>
                                                <RSSwitch
                                                    className="smaller width10"
                                                    name="enableCaptchaCheckbox"
                                                    control={control}
                                                    defaultValue={false}
                                                    onLabel="ON"
                                                    offLabel="OFF"
                                                />
                                            </li>
                                            <li className="rs-forms-captcha pe-none ml18">
                                                <RSEditorPopup
                                                    name={`enableCaptcha`}
                                                    control={control}
                                                    initialValue={'Enable CAPTCHA'}
                                                    init={BODYCONFIG}
                                                    disabled={preview}
                                                    handleChange={(e) => {
                                                        if (dispatchState) {
                                                            dispatchState({
                                                                type: 'UPDATE',
                                                                field: 'enableCaptcha',
                                                                payload: e?.html,
                                                            });
                                                        }
                                                    }}
                                                />
                                            </li>
                                        </ul>
                                    </div>
                                </li>
                            )}
                        </ul></Col>
                </Row>
            </div>
        </div>
    );
};

export default memo(FormCaptcha);

