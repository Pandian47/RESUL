import { colorpicker_bg_fill_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import RSColorPicker from 'Components/ColorPicker';
import RSSwitch from 'Components/FormFields/RSSwitch';
import RSKendoDropdownList from 'Components/FormFields/RSKendoDropdown';
import { useFormContext } from 'react-hook-form';
import InputControllerWithLabel from '../Component/InputControllerWithLabel';

const BorderCustomizer = ({ selectedComponent, handleChange }) => {
    const { control, setValue } = useFormContext();
    // Sync form state with selectedComponent
    useEffect(() => {
        setValue('borderTop', selectedComponent.borderTop || false, { shouldDirty: false });
        setValue('borderRight', selectedComponent.borderRight || false, { shouldDirty: false });
        setValue('borderBottom', selectedComponent.borderBottom || false, { shouldDirty: false });
        setValue('borderLeft', selectedComponent.borderLeft || false, { shouldDirty: false });
        setValue('borderRadius', selectedComponent.borderRadius || '', { shouldDirty: false });
        setValue('borderthickness', selectedComponent.borderthickness || '', { shouldDirty: false });
        setValue('borderStyle', selectedComponent.borderStyle || '', { shouldDirty: false });
    }, [
        selectedComponent.borderTop,
        selectedComponent.borderRight,
        selectedComponent.borderBottom,
        selectedComponent.borderLeft,
        selectedComponent.borderRadius,
        selectedComponent.borderthickness,
        selectedComponent.borderStyle,
        setValue,
    ]);

    const isDivider = selectedComponent.type === "divider";

    return (
        <div>
            {!isDivider && (
                <>
                    <Form.Group className="d-flex justify-content-between align-items-center items-padding border-bottom-0 mb0">
                        <Form.Label>Top</Form.Label>
                        <RSSwitch
                            name="Top Border"
                            checked={selectedComponent.borderTop}
                            handleChange={(chk) => handleChange('borderTop', chk)}
                        />
                    </Form.Group>

                    <Form.Group className="d-flex justify-content-between align-items-center items-padding border-bottom-0 mb0">
                        <Form.Label>Right</Form.Label>
                        <RSSwitch
                            name="Right Border"
                            checked={selectedComponent.borderRight}
                            handleChange={(chk) => handleChange('borderRight', chk)}
                        />
                    </Form.Group>

                    <Form.Group className="d-flex justify-content-between align-items-center items-padding border-bottom-0 mb0">
                        <Form.Label>Bottom</Form.Label>
                        <RSSwitch
                            name="Bottom Border"
                            checked={selectedComponent.borderBottom}
                            handleChange={(chk) => handleChange('borderBottom', chk)}
                        />
                    </Form.Group>

                    <Form.Group className="d-flex justify-content-between align-items-center items-padding border-bottom-0 mb0">
                        <Form.Label>Left</Form.Label>
                        <RSSwitch
                            name="Left Border"
                            checked={selectedComponent.borderLeft}
                            handleChange={(chk) => handleChange('borderLeft', chk)}
                        />
                    </Form.Group>

                    <Form.Group className="items-padding border-bottom-0 mb0">
                        <Row>
                            <Col sm={7}>
                                <Form.Label>Border radius</Form.Label>
                            </Col>
                            <Col sm={5}>
                                {/* <RSInput
                                    type="number"
                                    name="borderRadius"
                                    defaultValue={selectedComponent.borderRadius || ''}
                                    handleOnchange={(e) => handleChange('borderRadius', e.target.value)}
                                /> */}
                                <InputControllerWithLabel
                                    // label={'Border Thickness'}
                                    value={selectedComponent?.borderRadius}
                                    onChange={(name, val) => {
                                        handleChange('borderRadius', val);
                                    }}
                                    onValueChange={(name, val) => {
                                        handleChange('borderRadius', selectedComponent?.borderRadius + val);
                                    }}
                                    step={1}
                                    maxWidth={15}
                                />
                            </Col>
                        </Row>
                    </Form.Group>
                </>
            )}



            <Form.Group className="d-flex justify-content-between align-items-center items-padding border-bottom-0 mb0">
                <Row>
                    <Col sm={7}>
                        <Form.Label>Border Thickness</Form.Label>
                    </Col>
                    <Col sm={5}>
                        {/* <RSInput
                            type="number"
                            name="borderthickness"
                            defaultValue={selectedComponent.borderthickness || ''}
                            handleOnchange={(e) => handleChange('borderthickness', e.target.value)}
                        /> */}
                         <InputControllerWithLabel
                            // label={'Border Thickness'}
                            value={selectedComponent?.borderthickness}
                            onChange={(name, val) => {
                                handleChange('borderthickness', val);
                            }}
                            onValueChange={(name, val) => {
                                handleChange('borderthickness', selectedComponent?.borderthickness + val);
                            }}
                            step={1}
                            maxWidth={15}
                        />
                       
                    </Col>
                </Row>
            </Form.Group>

            <Form.Group className="items-padding border-bottom-0 mb0">
                <Row>
                    <Col sm={7}>
                        <Form.Label>Border style</Form.Label>
                    </Col>
                    <Col sm={5}>
                        <RSKendoDropdownList
                            name="borderStyle"
                            control={control}
                            defaultValue={selectedComponent.borderStyle || ''}
                            data={[
                                { value: 'solid', text: 'Solid' },
                                { value: 'dashed', text: 'Dashed' },
                                { value: 'dotted', text: 'Dotted' },
                                { value: 'double', text: 'Double' },
                                { value: 'groove', text: 'Groove' },
                                { value: 'ridge', text: 'Ridge' },
                            ]}
                            textField="text"
                            dataItemKey="value"
                            handleChange={(e) => handleChange('borderStyle', e.target.value)}
                        />
                    </Col>
                </Row>
            </Form.Group>

            <Form.Group className="d-flex justify-content-between align-items-center items-padding border-bottom-0 mb0">
                <Form.Label>Border color</Form.Label>
                <RSColorPicker
                    icon={colorpicker_bg_fill_medium}
                    tooltipText="Border color"
                    initColor={selectedComponent.borderColor || '#000000'}
                    colorValue={selectedComponent.borderColor}
                    onSelect={(color) => handleChange('borderColor', color)}
                />
            </Form.Group>
        </div>
    );
};

export default BorderCustomizer;
