import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Col, Row } from 'react-bootstrap';
import RSColorPicker from 'Components/ColorPicker';
import { COLOR_PICKER } from '../../constant';

const FormStyleBackground = () => {
    const {
        control,
        watch,
        setValue,
    } = useFormContext();

    const [
        formStylesFormBackgroundImage,
        formStylesFormBackgroundColor,
    ] = watch([
        'formStyles.formBackgroundImage',
        'formStyles.formBackgroundColor',
    ]);

    // Convert opacity (0-1) to 2-digit hex
    const opacityToHex = (opacity) => {
        const alpha = Math.round(opacity * 255);
        return alpha.toString(16).padStart(2, '0').toUpperCase();
    };

    // When background image is applied, set background color to transparent
    useEffect(() => {
        // Check if formStylesFormBackgroundImage is a non-empty string
        const hasImage = formStylesFormBackgroundImage && 
            typeof formStylesFormBackgroundImage === 'string' && 
            formStylesFormBackgroundImage.trim() !== '';
        
        if (hasImage) {
            // Set background color to transparent when image is applied
            if (formStylesFormBackgroundColor !== 'transparent') {
                setValue('formStyles.formBackgroundColor', 'transparent', { shouldValidate: true, shouldDirty: true });
            }
        }
    }, [formStylesFormBackgroundImage, formStylesFormBackgroundColor, setValue]);

    // Handle background color selection (with optional opacity) - clear image when color is selected
    const handleColorSelect = (value) => {
        let color = value;

        // Support opacity payload from RSColorPicker when isOpacity is true
        if (typeof value === 'object' && value.color && value.opacity !== undefined) {
            const hexOpacity = opacityToHex(value.opacity);
            color = `${value.color}${hexOpacity}`;
        }

        // Check if formStylesFormBackgroundImage is a non-empty string
        const hasImage = formStylesFormBackgroundImage && 
            typeof formStylesFormBackgroundImage === 'string' && 
            formStylesFormBackgroundImage.trim() !== '';
        
        // Clear background image when color is selected (unless color is transparent)
        if (color !== 'transparent' && hasImage) {
            setValue('formStyles.formBackgroundImage', '', { shouldValidate: true, shouldDirty: true });
        }
        setValue('formStyles.formBackgroundColor', color, { shouldValidate: true, shouldDirty: true });
    };

    return (
        <div className='mt21'>
            {/* Form Background Color Section */}
            <div className='form-field-group'>
                <Row>
                    <Col md={7}>
                        <h4 className='m0 p0'>Background</h4>
                    </Col>
                    <Col md={5}>
                        <div className="color-picker-display mt-8">
                            <div className="color-swatch" style={{ backgroundColor: formStylesFormBackgroundColor || '#ffffff' }}></div>
                            <span className="color-hex">{(formStylesFormBackgroundColor || '#ffffff').toUpperCase()}</span>
                            <div className="rs-builder-colorpicker-container">
                                <RSColorPicker
                                    icon={COLOR_PICKER}
                                    isOpacity={true}
                                    onSelect={handleColorSelect}
                                    colorValue={formStylesFormBackgroundColor || '#ffffff'}
                                    tooltipText="Form background color"
                                    alignRight={true}
                                />
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>

            {/* Form Background Image Section */}
            {/* <div className='form-field-group'>
                <Row>
                    <Col md={12}>
                        <ImageUpload
                            fieldName="formStyles.formBackgroundImage"
                            inputId="formStyleBackgroundImageUploadFileInput"
                            control={control}
                            isShowImageURL={false}
                        />
                    </Col>
                </Row>
            </div> */}
        </div>
    );
};

export default FormStyleBackground;

