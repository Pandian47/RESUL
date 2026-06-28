import { memo, useContext, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import RSFileUpload from 'Components/FormFields/RSFileUpload';

import { BODYCONFIG, SETTINGS_ICON, ASTERISK_ICON } from '../../constant';
import { FormGeneratorContext } from '../FormTypes/FormGenerator';
import { THIS_FIELD_IS_REQUIRED } from 'Constants/GlobalConstant/ValidationMessage';
import RSEditorPopup from 'Components/FormFields/RSEditorPopup/RSEditorPopup';

const Upload = ({ index, labelName, placeHolder, mandatory, preview, init }) => {
    const { control, setError, clearErrors, setValue, watch } = useFormContext();
    const [mandatoryValue, setMandatoryValue] = useState(mandatory);
    const { tag } = useContext(FormGeneratorContext);

    return (
        <div
            className={`${preview ? 'fbc-preview' : 'form-builder-component'} ${mandatoryValue ? 'upload-required' : 'upload-optional'
                }`}
        >
            <div className="rs-form-element-wrapper">
                <Row>
                    <Col sm={preview ? 6 : 3}>
                        <Row>
                            <Col sm={mandatory ? 10 : 12}>
                                <RSEditorPopup
                                    name={`formGenerator[${index}].tinyMceLable`}
                                    control={control}
                                    initialValue={labelName}
                                    init={BODYCONFIG}
                                    disabled={preview}
                                    required
                                    minChars={tag === 'Survey' ? 3 : 3}
                                    maxChars={120}
                                    rules={{
                                        required: THIS_FIELD_IS_REQUIRED,
                                    }}
                                />
                                {mandatory && <span className="rs-form-mandatory">*</span>}
                            </Col>
                            {mandatory && (
                                <Col sm={2}>
                                    <span className="text-danger ">*</span>
                                </Col>
                            )}
                        </Row>
                    </Col>
                    <Col sm={preview ? 6 : 5} className="mt12">
                        <RSFileUpload
                            control={control}
                            name={`formGenerator[${index}].uploadData`}
                            text="Browse"
                            accept={'.png,.svg,.jpg,.jpeg'}
                            clearErrors={clearErrors}
                            setError={setError}
                            size={500000}
                            watch={watch}
                            handleChange={(e) => clearErrors('uploadData')}
                        />
                    </Col>
                    {!preview && (
                        <>
                            <Col sm={1}>
                                <Row className="mt10">
                                    <Col sm={6}>
                                        <i
                                            name={`formGenerator[${index}].mandatory`}
                                            className={
                                                mandatoryValue
                                                    ? `${ASTERISK_ICON} color-primary-red`
                                                    : `${ASTERISK_ICON} color-secondary-grey`
                                            }
                                            onClick={() => {
                                                setMandatoryValue(!mandatoryValue);
                                                setValue('mandatory-' + index, !mandatoryValue);
                                            }}
                                        ></i>
                                    </Col>
                                    <Col sm={6}>
                                        <i className={`${SETTINGS_ICON} icon-md color-primary-blue`}></i>
                                    </Col>
                                </Row>
                            </Col>
                            <Col sm={3}></Col>
                        </>
                    )}
                </Row>
            </div>
        </div>
    );
};

export default memo(Upload);
