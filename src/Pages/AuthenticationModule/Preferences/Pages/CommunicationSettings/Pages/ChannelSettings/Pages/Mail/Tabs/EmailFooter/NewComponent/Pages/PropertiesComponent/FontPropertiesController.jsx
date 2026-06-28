import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormGroup, Form, Row, Col } from 'react-bootstrap';
import RSKendoDropDown from 'Components/FormFields/RSKendoDropdown';
import InputControllerWithLabel from '../Component/InputControllerWithLabel';

const FontPropertiesController = ({ selectedComponent, handleChange, control }) => {
    const { setValue } = useFormContext();

        useEffect(() => {
            setValue('fontWeight', selectedComponent.fontWeight || false, { shouldDirty: false });
            setValue('fontFamily', selectedComponent.fontFamily || false, { shouldDirty: false });
            setValue('fontStyle', selectedComponent.fontStyle || false, { shouldDirty: false });
            setValue('textDecoration', selectedComponent.textDecoration || false, { shouldDirty: false });
            setValue('letterSpacing', selectedComponent.letterSpacing || '', { shouldDirty: false });
        }, [
            selectedComponent.fontWeight,
            selectedComponent.fontFamily,
            selectedComponent.fontStyle,
            selectedComponent.textDecoration,
            selectedComponent.letterSpacing,
            setValue,
        ]);

    return (
        <>
            <Form.Group className="items-padding border-bottom-0 mb0">
                    <Row>
                    <Col sm={5}>
                    <Form.Label>Font size</Form.Label>
                    </Col>
                    <Col sm={7}>
                    {/* <Form.Control
                        type="number"
                        value={selectedComponent.fontsize || ''}
                        onChange={(e) => handleChange('fontsize', e.target.value)}
                        placeholder="Font size in px"
                    />  */}
                    <InputControllerWithLabel
                            // label={'Font Size'}
                            value={selectedComponent?.fontsize}
                            onChange={(name, val) => {
                                handleChange('fontsize', val);
                            }}
                            onValueChange={(name, val) => {
                                handleChange('fontsize', selectedComponent?.fontsize + val);
                            }}
                            step={1}
                            maxWidth={40}
                        />
                    </Col>
                    </Row>
                </Form.Group>
            <FormGroup>
                <Form.Group className="items-padding border-bottom-0 mb0">
                    <Row>
                        <Col sm={5}>
                            <Form.Label className='mb5'>Font weight</Form.Label>
                        </Col>
                        <Col sm={7}>
                         <RSKendoDropDown
                            name={'fontWeight'}
                             control={control}
                                data={[
                                    { value: 'normal', text: 'Normal' },
                                    { value: 'bold', text: 'Bold' },
                                    { value: 'bolder', text: 'Bolder' },
                                    ...Array.from({ length: 9 }, (_, i) => ({
                                        value: (i + 1) * 100,
                                        text: `${(i + 1) * 100}`,
                                    })),
                                ]}
                                textField="text"
                                value={selectedComponent.fontWeight || 'normal'}
                                handleChange={(e) => handleChange('fontWeight', e.target.value)}
                            />
                        </Col>
                    </Row>
                </Form.Group>

            

                <Form.Group className="items-padding border-bottom-0 mb0">
                    <Row>
                    <Col sm={5}>
                    <Form.Label className='mb5'>Font family</Form.Label>
                    </Col>
                    <Col sm={7}>
                    <RSKendoDropDown
                    name={'fontFamily'}
                    control={control}
                        data={[
                            { value: 'Arial, sans-serif', text: 'Arial' },
                            { value: 'Times New Roman, serif', text: 'Times New Roman' },
                            { value: 'Courier New, monospace', text: 'Courier New' },
                            { value: 'Verdana, sans-serif', text: 'Verdana' },
                            { value: 'Georgia, serif', text: 'Georgia' },
                        ]}
                        textField="text"
                        value={selectedComponent.fontFamily || 'Arial, sans-serif'}
                        handleChange={(e) => handleChange('fontFamily', e.target.value)}
                    />
                    </Col>
                    </Row>
                </Form.Group>

                <Form.Group className="items-padding border-bottom-0 mb0">
                    <Row>
                    <Col sm={5}>
                    <Form.Label className='mb5'>Font style</Form.Label>
                    </Col>
                    <Col sm={7}>
                    <RSKendoDropDown
                     name={'fontStyle'}
                     control={control}
                        data={[
                            { value: 'normal', text: 'Normal' },
                            { value: 'italic', text: 'Italic' },
                            { value: 'oblique', text: 'Oblique' },
                        ]}
                        textField="text"
                        value={selectedComponent.fontStyle || 'normal'}
                        handleChange={(e) => handleChange('fontStyle', e.target.value)}
                    />
                    </Col>
                    </Row>
                </Form.Group>

                <Form.Group className="items-padding border-bottom-0 mb0">
                    <Row>
                    <Col sm={5} className="pr0">
                    <Form.Label className='mb5'>Text decoration</Form.Label>
                    </Col>
                    <Col sm={7}>
                    <RSKendoDropDown
                     name={'textDecoration'}
                     control={control}
                        data={[
                            { value: 'none', text: 'None' },
                            { value: 'underline', text: 'Underline' },
                            { value: 'overline', text: 'Overline' },
                            { value: 'line-through', text: 'Line Through' },
                        ]}
                        textField="text"
                        value={selectedComponent.textDecoration || 'none'}
                        handleChange={(e) => handleChange('textDecoration', e.target.value)}
                    /></Col>
                    </Row>
                </Form.Group>
                <Form.Group className="items-padding">
                    <Row>
                    <Col sm={5}> <Form.Label>Letter spacing</Form.Label></Col>
                    <Col sm={7}>
                    {/* <RSInput
                        control={control}
                        // placeholder={'Letter spacing (px)'}
                        type={'number'}
                        name={'letterSpacing'}
                        defaultValue={selectedComponent.letterSpacing || '0'}
                        handleOnchange={(e) => handleChange('letterSpacing', e.target.value)}
                    /> */}
                       <InputControllerWithLabel
                            // label={'Letter Space'}
                            value={selectedComponent?.letterSpacing}
                            onChange={(name, val) => {
                                handleChange('letterSpacing', val);
                            }}
                            onValueChange={(name, val) => {
                                handleChange('letterSpacing', selectedComponent?.letterSpacing + val);
                            }}
                            step={1}
                            maxWidth={8}
                        />
                    </Col>
                    </Row>
                </Form.Group>
            </FormGroup>
        </>
    );
};

export default FontPropertiesController;
