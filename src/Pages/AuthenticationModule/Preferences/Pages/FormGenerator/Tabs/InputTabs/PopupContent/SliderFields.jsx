import { COLOR_PICKER, SLIDER_SHAPE } from '../../../constant';
import RSColorPickerInput from 'Components/FormFields/RSColorPickerInput';
import RSInput from 'Components/FormFields/RSInput';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import { Col, Row } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';

const SliderFields = ({ control, index, setSliderColorPicker, sliderColorPicker, fieldSettings }) => {

    const { watch, getValues } = useFormContext();
    const ratingShape = watch('sliderShape' + index);

    const handleColorChange = (tag, color) => {
        if (tag === 'first') {
            setSliderColorPicker(pre => ({ ...pre, firstCol: color }));
        } else if (tag === 'second') {
            setSliderColorPicker(pre => ({ ...pre, secondCol: color }));
        } else if (tag === 'thumb') {
            setSliderColorPicker(pre => ({ ...pre, thumbCol: color }));
        }
    };

    return (
        <div className="slider-fields-wrapper">
            <style
                dangerouslySetInnerHTML={{
                    __html: [
                        `.slider-fields-wrapper .slider::-webkit-slider-thumb {`,
                        ` background-color: ${sliderColorPicker?.thumbCol || '#3bbf10'} !important;`,
                        '}',
                        `.slider-fields-wrapper .slider::-moz-range-thumb {`,
                        ` background-color: ${sliderColorPicker?.thumbCol || '#3bbf10'} !important;`,
                        '}',
                    ].join('\n'),
                }}
            ></style>
            <div className='form-group'>
                <Row>
                    <Col sm={3}>
                        <label className='control-label-left'>
                            Shape
                        </label>
                    </Col>
                    <Col sm={4}>
                        <RSKendoDropDownList
                            name={'sliderShape' + index}
                            data={SLIDER_SHAPE}
                            control={control}
                            defaultValue={fieldSettings?.shape || 'Round'}
                            label={'Shape'}
                        />
                    </Col>
                </Row>
            </div>

            <div className='form-group'>
                <Row>
                    <Col sm={3}>
                        <label className='control-label-left'>
                            Thumb color
                        </label>
                    </Col>
                    <Col sm={4}>
                        <RSColorPickerInput
                            name={'sliderThumbColor' + index}
                            control={control}
                            defaultValue={sliderColorPicker?.thumbCol || '#3bbf10'}
                            placeholder="Thumb color"
                            onSelect={(color) => {
                                handleColorChange('thumb', color);
                            }}
                            colorPickerIcon={COLOR_PICKER}
                        />
                    </Col>
                </Row>
            </div>

            <div className='form-group'>
                <Row>
                    <Col sm={3}>
                        <label className='control-label-left'>
                           Gradient start
                        </label>
                    </Col>
                    <Col sm={4}>
                        <RSColorPickerInput
                            name={'sliderFirstColor' + index}
                            control={control}
                            defaultValue={sliderColorPicker?.firstCol || '#ff0000'}
                            placeholder="Gradient start"
                            onSelect={(color) => handleColorChange('first', color)}
                            colorPickerIcon={COLOR_PICKER}
                        />
                    </Col>
                </Row>
            </div>

            <div className='form-group'>
                <Row>
                    <Col sm={3}>
                        <label className='control-label-left'>
                            Gradient end
                        </label>
                    </Col>
                    <Col sm={4}>
                        <RSColorPickerInput
                            name={'sliderSecondColor' + index}
                            control={control}
                            defaultValue={sliderColorPicker?.secondCol || '#3bbf10'}
                            placeholder="Gradient end"
                            onSelect={(color) => handleColorChange('second', color)}
                            colorPickerIcon={COLOR_PICKER}
                        />
                    </Col>
                </Row>
            </div>

         
            <div
                className={`form-group mb0 rs-fb-slider-wrapper ${ratingShape === 'Round' ? 'rsfbsw-round' : 'rsfbsw-square'
                    }`}
            >
                <Row>
                  <Col sm={12}>
                    <RSInput
                        type="range"
                        //className='form-range'
                        className="slider"
                        control={control}
                        name={'slider' + index}
                        value={'Very good'}
                        id="customRange"
                        style={{
                            background: `linear-gradient(to right,  ${sliderColorPicker?.firstCol} 0%,${sliderColorPicker?.secondCol}80 50%,${sliderColorPicker?.secondCol} 100%)`,
                        }}
                    /></Col>
                </Row>
            </div>
        </div>
    )
}

export default SliderFields;