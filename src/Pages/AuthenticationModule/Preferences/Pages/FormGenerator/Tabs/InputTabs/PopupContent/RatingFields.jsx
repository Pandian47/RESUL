import { memo, useEffect } from 'react';
import { COLOR_PICKER, Heart, SCALE, SHAPE, Smiley, Star, Thumb } from '../../../constant'
import { Col, Row } from 'react-bootstrap'
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSColorPickerInput from 'Components/FormFields/RSColorPickerInput';
import { useFormContext } from 'react-hook-form';


function RatingFields({ control, index, setRatingCol, ratingCol, fieldSettings }) {
    const { watch, setValue } = useFormContext();

    const ratingShape = watch('ratingShape' + index);

    // Initialize form values when popup opens
    useEffect(() => {
        if (fieldSettings) {
            setValue('ratingShape' + index, fieldSettings?.shape || 'Star');
            setValue('ratingScale' + index, fieldSettings?.scale || '5');
            setValue('ratingPicker' + index, fieldSettings?.highlightColor || ratingCol || '#ffd700');
        } else {
            setValue('ratingPicker' + index, ratingCol || '#ffd700');
        }
    }, [fieldSettings, index, setValue, ratingCol]);

    return (
        <div className="rsfb-settings-selectbox">
            <div className='form-group'>
                <Row>
                    <Col sm={5}>
                        <label className='control-label-left'>Shape</label>
                    </Col>
                    <Col sm={4}>
                        <RSKendoDropDownList
                            name={'ratingShape' + index}
                            data={SHAPE}
                            control={control}
                            defaultValue={fieldSettings?.shape || 'Star'}
                            label="Shape"
                        />
                    </Col>
                    <Col sm={2} >
                        <i
                            className={`${(ratingShape === 'Star' || ratingShape === undefined) && Star
                                } icon-lg`}
                            style={{ color: ratingCol }}
                        ></i>
                        <i
                            className={`${ratingShape === 'Smiley' && Smiley} icon-lg`}
                            style={{ color: ratingCol }}
                        ></i>
                        <i
                            className={`${ratingShape === 'Heart' && Heart} icon-lg`}
                            style={{ color: ratingCol }}
                        ></i>
                        <i
                            className={`${ratingShape === 'Thumb' && Thumb} icon-lg`}
                            style={{ color: ratingCol }}
                        ></i>
                    </Col>
                </Row>
            </div>

            <div className='form-group'>
                <Row>
                    <Col sm={5}>
                        <label className='control-label-left'>Scale</label>
                    </Col>
                    <Col sm={4}>
                        <RSKendoDropDownList
                            name={'ratingScale' + index}
                            data={SCALE}
                            control={control}
                            defaultValue={fieldSettings?.scale?.toString() || '5'}
                            label="Scale"
                        />
                    </Col>
                </Row>
            </div>
            <div className='form-group mb0'>
                <Row>
                    <Col sm={5}>
                    <label className='control-label-left'>Highlight color</label>
                </Col>
                <Col sm={4}>
                    <RSColorPickerInput
                        control={control}
                        name={'ratingPicker' + index}
                        defaultValue={ratingCol || fieldSettings?.highlightColor || '#ffd700'}
                        placeholder="Highlight color"
                        colorPickerIcon={COLOR_PICKER}
                        onSelect={(color) => setRatingCol(color)}
                    />
                </Col>
                </Row>
            </div>
            {/* <div className="form-group mt30">
                <Row>
                    <Col sm="3">
                        <RSKendoDropDownList
                            name={'ratingShape' + index}
                            data={SHAPE}
                            control={control}
                            defaultValue={fieldSettings?.shape || 'Star'}
                            label="Shape"
                        />
                    </Col>
                    <Col sm={1} className='p0  pl5'>
                        <i
                            className={`${(ratingShape === 'Star' || ratingShape === undefined) && Star
                                } icon-lg`}
                            style={{ color: ratingCol }}
                        ></i>
                        <i
                            className={`${ratingShape === 'Smiley' && Smiley} icon-lg`}
                            style={{ color: ratingCol }}
                        ></i>
                        <i
                            className={`${ratingShape === 'Heart' && Heart} icon-lg`}
                            style={{ color: ratingCol }}
                        ></i>
                        <i
                            className={`${ratingShape === 'Thumb' && Thumb} icon-lg`}
                            style={{ color: ratingCol }}
                        ></i>
                    </Col>
                    <Col sm="2" className=''>
                        <RSKendoDropDownList
                            name={'ratingScale' + index}
                            data={SCALE}
                            control={control}
                            defaultValue={fieldSettings?.scale?.toString() || '5'}
                            label="Scale"
                        />
                    </Col>
                    <Col sm="5" className='ml25 mt5'>
                        <div className="d-flex align-items-baseline gap-3">
                            <small>Highlight color</small>
                            <div className="rs-builder-colorpicker-container">
                                <RSColorPicker
                                    name={'ratingPicker'}
                                    icon={COLOR_PICKER}
                                    onSelect={(color) => setRatingCol(color)}
                                    colorValue={ratingCol}
                                />
                            </div>
                        </div>
                    </Col>
                </Row>
            </div> */}
        </div>
    )
}

export default memo(RatingFields)