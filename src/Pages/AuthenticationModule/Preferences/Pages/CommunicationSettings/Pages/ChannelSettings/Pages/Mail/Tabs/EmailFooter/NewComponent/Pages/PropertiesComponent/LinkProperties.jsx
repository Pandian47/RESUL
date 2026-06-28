import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import RSInput from 'Components/FormFields/RSInput';
import RSSwitch from 'Components/FormFields/RSSwitch';
import { Form, Col, Dropdown } from 'react-bootstrap';

const linkTypes = [
    { value: 'site', label: 'Site (http/https)', placeholder: 'Enter site URL (http:// or https://)', field: 'siteUrl' },
    { value: 'mail', label: 'Mail (mailto:)', placeholder: 'Enter email (e.g., example@example.com)', field: 'mailto' },
    { value: 'tel', label: 'Tel (tel:)', placeholder: 'Enter phone number (e.g., +1234567890)', field: 'tel' },
    { value: 'file', label: 'File (ftp/ftps)', placeholder: 'Enter file URL (ftp:// or ftps://)', field: 'fileUrl' },
    { value: 'skype', label: 'Skype (skype:)', placeholder: 'Enter Skype username (e.g., USER_NAME?chat)', field: 'skype' },
    { value: 'viber', label: 'Viber (viber:)', placeholder: 'Enter Viber link', field: 'viber' },
];

const LinkProperties = ({ selectedComponent, handleChange = () => {}, control, watch }) => {
    const { setValue, resetField } = useFormContext();
    const [selectedLinkType, setSelectedLinkType] = useState('site');

    useEffect(() => {
        if (selectedComponent?.selectedLinkType) {
            setSelectedLinkType(selectedComponent.selectedLinkType);
        }
    }, [selectedComponent?.selectedLinkType]);

    useEffect(() => {
        const fieldName = linkTypes.find((t) => t.value === selectedLinkType)?.field;
        if (fieldName) {
            resetField(fieldName, {
                defaultValue: selectedComponent?.[fieldName] || '',
            });
        }
    }, [selectedLinkType, selectedComponent, resetField]);

    const currentLinkType = linkTypes.find((type) => type.value === selectedLinkType);
    const fieldName = currentLinkType?.field || '';
    const value = watch(fieldName) || '';

    const handleInputChange = (val) => {
        setValue(fieldName, val);
        handleChange(fieldName, val);
    };

    return (
        <Form>
            <>
            <Form.Group className="d-flex align-items-center items-padding">
                <Col sm={5}>
                    <Form.Label className="mb-0">Action type</Form.Label>
                </Col>
                <Col sm={7}>
                    <Dropdown>
                        <Dropdown.Toggle variant="outline-secondary" className="w-100">
                            {currentLinkType?.label || 'Select Link Type'}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {linkTypes.map((type) => (
                                <Dropdown.Item
                                    key={type.value}
                                    onClick={() => {
                                        setSelectedLinkType(type.value);
                                        setValue('selectedLinkType', type.value);
                                        handleChange('selectedLinkType', type.value);
                                    }}
                                >
                                    {type.label}
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                </Col>
            </Form.Group>
            </>

            {currentLinkType && (
                <Form.Group  className="items-padding">
                    
                     <Form.Label className="mb5"> Button URL</Form.Label>
                    <Col sm={12}>
                        <RSInput
                            name={fieldName}
                            placeholder={currentLinkType.placeholder}
                            control={control}
                            value={value}
                            handleOnchange={(e) => handleInputChange(e.target.value)}
                        />
                    </Col>
                </Form.Group>
            )}

            <Form.Group  className="d-flex align-items-center items-padding justify-content-between">
                <Form.Label> Open in new tab</Form.Label>
                
                    <RSSwitch
                        name="target"
                        control={control}
                        onLabel="ON"
                        offLabel="OFF"
                        defaultValue={selectedComponent.target}
                        handleChange={(checked) => {
                            const val = checked ? '_blank' : '_self';
                            setValue('target', val);
                            handleChange('target', val);
                        }}
                    />
              
            </Form.Group>
        </Form>
    );
};

export default LinkProperties;
