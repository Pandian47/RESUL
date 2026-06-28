import { editor_align_center_medium, editor_align_left_medium, editor_align_right_medium } from 'Constants/GlobalConstant/Glyphicons';
import { cloneElement, useEffect, useMemo, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { Col, Row } from 'react-bootstrap';

import RSInput from 'Components/FormFields/RSInput';
import RSColorPicker from 'Components/ColorPicker';
import RSTooltip from 'Components/RSTooltip';
import ImageUpload from '../InputTabs/ImageUpload';
import { COLOR_PICKER } from '../../constant';
import { MINLENGTH } from 'Constants/GlobalConstant/ValidationMessage';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import { useSelector } from 'react-redux';

// Default header configuration values
const DEFAULT_HEADER_BG_COLOR = '#00006e';
const DEFAULT_HEADER_TEXT = 'Form name';
const DEFAULT_HEADER_FONT_COLOR = '#ffffff';
const DEFAULT_HEADER_FONT_SIZE = 17;
const DEFAULT_HEADER_FONT_FAMILY = 'MuktaRegular';

const fontOptions = [
    { text: 'Default', value: 'default', fontFamily: 'inherit' },
    { text: 'Mukta Regular', value: 'muktaregular', fontFamily: 'MuktaRegular,sans-serif' },
    { text: 'Arial', value: 'arial', fontFamily: 'Arial, sans-serif' },
    { text: 'Courier New', value: 'courier', fontFamily: '"Courier New", Courier, monospace' },
    { text: 'Georgia', value: 'georgia', fontFamily: 'Georgia, serif' },
    { text: 'Helvetica', value: 'helvetica', fontFamily: 'Helvetica, Arial, sans-serif' },
    { text: 'Impact', value: 'impact', fontFamily: 'Impact, Haettenschweiler, sans-serif' },
    { text: 'Lucida Console', value: 'lucida', fontFamily: '"Lucida Console", Monaco, monospace' },
    { text: 'Tahoma', value: 'tahoma', fontFamily: 'Tahoma, Geneva, sans-serif' },
    { text: 'Times New Roman', value: 'times', fontFamily: '"Times New Roman", Times, serif' },
    { text: 'Trebuchet MS', value: 'trebuchet', fontFamily: '"Trebuchet MS", Helvetica, sans-serif' },
    { text: 'Verdana', value: 'verdana', fontFamily: 'Verdana, Geneva, sans-serif' },
];

const fontItemRender = (li, itemProps) => {
    const { dataItem } = itemProps;
    const itemChildren = (
        <span className='w-100' style={{ fontFamily: dataItem?.fontFamily }}>
            {dataItem?.text}
        </span>
    );
    return cloneElement(li, li.props, itemChildren);
};

const fontValueRender = (element, value) => {
    if (!value) return element;
    return (
        <span className='w-100'>
            {value.text}
        </span>
    );
};

const FormStyleHeader = () => {
    const {
        control,
        watch,
        setValue,
        getValues
    } = useFormContext();
    const allValues = getValues();
    const previousFontSize = useRef(17);
    const isNameInitialized = useRef(false);

    // Convert opacity (0-1) to 2-digit hex
    const opacityToHex = (opacity) => {
        const alpha = Math.round(opacity * 255);
        return alpha.toString(16).padStart(2, '0').toUpperCase();
    };

    const [
        headerConfigLogo,
        headerConfigName,
        headerConfigLogoAlignment,
        headerConfigNameAlignment,
        headerConfigBackgroundColor,
        headerConfigColor,
        headerConfigBackgroundImage,
        headerConfigLayoutPosition,
        headerConfigFontSize,
        headerConfigFontFamily,
    ] = watch([
        'headerConfig.logo',
        'headerConfig.name',
        'headerConfig.logoAlignment',
        'headerConfig.nameAlignment',
        'headerConfig.backgroundColor',
        'headerConfig.color',
        'headerConfig.backgroundImage',
        'headerConfig.layoutPosition',
        'headerConfig.headerFontSize',
        'headerConfig.headerFontFamily',
    ]);

    const logoAlignment = headerConfigLogoAlignment || 'left';
    const nameAlignment = headerConfigNameAlignment || 'left';
    const layoutPosition = headerConfigLayoutPosition || 'top';
    const { clientId } = useSelector(({ globalstate }) => globalstate);

    // Check if background image exists (handle both string and object formats)
    const hasBackgroundImage = useMemo(() => {
        if (!headerConfigBackgroundImage) return false;
        if (typeof headerConfigBackgroundImage === 'string') return headerConfigBackgroundImage.trim() !== '';
        if (typeof headerConfigBackgroundImage === 'object') {
            return !!(headerConfigBackgroundImage.url || headerConfigBackgroundImage.imageUrl || headerConfigBackgroundImage.inputUrl || headerConfigBackgroundImage.data);
        }
        return false;
    }, [headerConfigBackgroundImage]);

    // Track previous background image value to detect changes
    const prevBackgroundImageRef = useRef(hasBackgroundImage);

    // Track if name has been initialized (to prevent re-setting defaults after user clears it)
    useEffect(() => {
        if (headerConfigName) {
            isNameInitialized.current = true;
        }
    }, [headerConfigName]);

    // Set default values for header (always enabled)
    useEffect(() => {
        // Set default layout position if not set
        if (!headerConfigLayoutPosition) {
            setValue('headerConfig.layoutPosition', 'top', { shouldValidate: false, shouldDirty: false });
        }
        // Set default logo alignment if not set (left alignment by default)
        if (!headerConfigLogoAlignment) {
            setValue('headerConfig.logoAlignment', 'left', { shouldValidate: false, shouldDirty: false });
        }
        // Set default name alignment if not set
        if (!headerConfigNameAlignment) {
            setValue('headerConfig.nameAlignment', 'left', { shouldValidate: false, shouldDirty: false });
        }
        // Set default background color if not set (only if no background image)
        if (!headerConfigBackgroundImage && (!headerConfigBackgroundColor || headerConfigBackgroundColor === 'transparent')) {
            setValue('headerConfig.backgroundColor', DEFAULT_HEADER_BG_COLOR, { shouldValidate: false, shouldDirty: false });
        }
        // Set default text color if not set (white for dark background)
        if (!headerConfigColor) {
            setValue('headerConfig.color', DEFAULT_HEADER_FONT_COLOR, { shouldValidate: false, shouldDirty: false });
        }
        // Set default header text if not set - only if not already initialized
        if (!headerConfigName && !isNameInitialized.current) {
            setValue('headerConfig.name', clientId?.clientName || DEFAULT_HEADER_TEXT, { shouldValidate: false, shouldDirty: false });
            isNameInitialized.current = true;
        }
        // Set default header font size if not set
        if (headerConfigFontSize === undefined) {
            setValue('headerConfig.headerFontSize', DEFAULT_HEADER_FONT_SIZE, { shouldValidate: false, shouldDirty: false });
        }
        // Set default header font family if not set
        if (!headerConfigFontFamily) {
            setValue('headerConfig.headerFontFamily', fontOptions[1], { shouldValidate: false, shouldDirty: false }); // Default to Mukta
        }
        // Set default header font size if not set
        if (headerConfigFontSize === undefined) {
            setValue('headerConfig.headerFontSize', DEFAULT_HEADER_FONT_SIZE, { shouldValidate: false, shouldDirty: false });
        }
        // Set default header font family if not set
        if (!headerConfigFontFamily) {
            setValue('headerConfig.headerFontFamily', fontOptions[1], { shouldValidate: false, shouldDirty: false }); // Default to Mukta
        }
        // Enable logo in formStyles (for backward compatibility)
        setValue('formStyles.logoEnabled', true, { shouldValidate: false, shouldDirty: false });
    }, [headerConfigLayoutPosition, headerConfigLogoAlignment, headerConfigNameAlignment, headerConfigBackgroundColor, headerConfigColor, headerConfigBackgroundImage, headerConfigLogo, clientId, setValue, headerConfigFontSize, headerConfigFontFamily]);

    // When background image is set/cleared, toggle background color accordingly
    useEffect(() => {
        // Check if background image was just added (changed from false to true)
        if (hasBackgroundImage && !prevBackgroundImageRef.current) {
            // Clear background color when background image is set
            setValue('headerConfig.backgroundColor', '', { shouldValidate: true, shouldDirty: true });
        }
        // Check if background image was just removed (changed from true to false)
        else if (!hasBackgroundImage && prevBackgroundImageRef.current) {
            // Restore default background color when background image is removed
            setValue('headerConfig.backgroundColor', DEFAULT_HEADER_BG_COLOR, { shouldValidate: true, shouldDirty: true });
        }
        prevBackgroundImageRef.current = hasBackgroundImage;
    }, [hasBackgroundImage, setValue]);

    return (
        <div className="form-section">
            <div className="form-section-body">
                <div className="form-group mb0">
                    <div className="form-section-switch ">
                        <h4 className="m0 p0">Header</h4>
                    </div>

                    <div className='mt21'>
                        {/* Layout Alignment Section */}
                        {/* <div className='form-field-group'>
                            <Row>
                                <Col md={6}>
                                    <label>Header position</label>
                                </Col>
                                <Col md={6}>
                                    <div className="segmented-control">
                                        {['top', 'left', 'right'].map((position) => (
                                            <RSTooltip
                                                key={position}
                                                text={`Position ${position.charAt(0).toUpperCase() + position.slice(1)}`}
                                                position="top"
                                            >
                                                <button
                                                    onClick={() => {
                                                        setValue('headerConfig.layoutPosition', position, { shouldValidate: true, shouldDirty: true });
                                                    }}
                                                    className={`segment-btn ${layoutPosition === position ? 'active' : ''}`}
                                                >
                                                    {position === 'top' && (
                                                        <span className="segment-btn-text">Top</span>
                                                    )}
                                                    {position === 'left' && <i className={`${editor_align_left_medium} icon-md`}></i>}
                                                    {position === 'right' && <i className={`${editor_align_right_medium} icon-md`}></i>}
                                                </button>
                                            </RSTooltip>
                                        ))}
                                    </div>
                                </Col>
                            </Row>
                        </div> */}




                        {/* Name Input Section */}
                        <div className='form-field-group mt31'>
                            <Row>

                                <Col md={12}>
                                    <RSInput
                                        control={control}
                                        name="headerConfig.name"
                                        placeholder="Header text"
                                        defaultValue={headerConfigName || ''}
                                        maxLength={80}
                                        rules={{
                                            minLength: {
                                                value: 3,
                                                message: MINLENGTH
                                            }
                                        }}
                                    />
                                    <small className="text-end fs11">{headerConfigName?.length || 0}/80</small>
                                </Col>
                            </Row>
                        </div>

                        {/* Font Settings Section */}
                        <div className='form-field-group mt31'>
                            <Row>
                                <Col md={4}>
                                    <div className='d-flex align-items-center'>
                                        <RSInput
                                            control={control}
                                            name='headerConfig.headerFontSize'
                                            maxLength={2}
                                            placeholder='Font size'
                                            onKeyDown={(e) => {
                                                // Allow: backspace, delete, tab, escape, enter, arrows
                                                if ([8, 9, 27, 13, 37, 38, 39, 40, 46].indexOf(e.keyCode) !== -1 ||
                                                    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                                                    (e.keyCode === 65 && e.ctrlKey === true) ||
                                                    (e.keyCode === 67 && e.ctrlKey === true) ||
                                                    (e.keyCode === 86 && e.ctrlKey === true) ||
                                                    (e.keyCode === 88 && e.ctrlKey === true)) {
                                                    return;
                                                }

                                                // Ensure that it is a number and stop the keypress if not
                                                if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                                                    e.preventDefault();
                                                    return;
                                                }

                                                // Check if resulting value would exceed 36
                                                const currentValue = e.target.value || '';
                                                const key = e.key;
                                                const selectionStart = e.target.selectionStart;
                                                const selectionEnd = e.target.selectionEnd;

                                                // Build the potential new value
                                                const newValue = currentValue.substring(0, selectionStart) + key + currentValue.substring(selectionEnd);
                                                const numValue = parseInt(newValue);

                                                // Prevent input if it is 0
                                                if (newValue === '0') {
                                                    e.preventDefault();
                                                    return;
                                                }

                                                // Prevent input if it would exceed 36
                                                if (!isNaN(numValue) && numValue > 36) {
                                                    e.preventDefault();
                                                }
                                            }}
                                            handleOnchange={(e) => {
                                                const inputValue = e.target.value;

                                                if (inputValue === '' || inputValue === null || inputValue === undefined) {
                                                    setValue('headerConfig.headerFontSize', '', { shouldDirty: true });
                                                    return;
                                                }
                                                let value = parseInt(inputValue);
                                                if (!isNaN(value)) {
                                                    // Restrict to maximum 36 - immediately cap the value
                                                    if (value > 36) {
                                                        // Cap at 36 immediately to prevent temporary display of larger value
                                                        value = 36;
                                                        e.target.value = '36';
                                                    }

                                                    // Update the ref with the valid value
                                                    previousFontSize.current = value;
                                                    setValue('headerConfig.headerFontSize', value, {
                                                        shouldValidate: true,
                                                        shouldDirty: true
                                                    });
                                                }
                                            }}
                                            handleOnBlur={(e) => {
                                                const inputValue = e.target.value;
                                                let value = parseInt(inputValue);

                                                // Only fallback if value is invalid or empty
                                                if (isNaN(value) || inputValue === '' || inputValue === null || inputValue === undefined || value < 12) {
                                                    value = 12;
                                                }

                                                // Cap at 36 on blur
                                                if (value > 36) {
                                                    value = 36;
                                                }

                                                // Update the ref with the final valid value
                                                previousFontSize.current = value;
                                                e.target.value = value.toString();
                                                setValue('headerConfig.headerFontSize', value, {
                                                    shouldValidate: true,
                                                    shouldDirty: true
                                                });
                                            }}
                                        />
                                        <small className="ml-2">px</small>
                                    </div>
                                </Col>
                                <Col md={8}>
                                    <RSKendoDropDownList
                                        control={control}
                                        name="headerConfig.headerFontFamily"
                                        data={fontOptions}
                                        textField="text"
                                        placeholder='Font family'
                                        dataItemKey="value"
                                        isCustomRender={true}
                                        itemRender={fontItemRender}
                                        valueRender={fontValueRender}
                                        popupSettings={{
                                            className: "form-font-dropdown-popup"
                                        }}
                                    />
                                </Col>
                            </Row>
                        </div>

                        {/* Logo Alignment Section */}
                        <div className='form-field-group'>
                            <Row>
                                <Col md={7}>
                                    <label>Align</label>
                                </Col>
                                <Col md={5}>
                                    <div className="segmented-control">
                                        {['left', 'center', 'right'].map((align) => (
                                            <RSTooltip
                                                key={align}
                                                text={`Align ${align.charAt(0).toUpperCase() + align.slice(1)}`}
                                                position="top"
                                            >
                                                <button
                                                    onClick={() => {
                                                        setValue('headerConfig.logoAlignment', align, { shouldValidate: true, shouldDirty: true });
                                                    }}
                                                    className={`segment-btn ${logoAlignment === align ? 'active' : ''}`}
                                                >
                                                    {align === 'left' && <i className={`${editor_align_left_medium} icon-md`}></i>}
                                                    {align === 'right' && <i className={`${editor_align_right_medium} icon-md`}></i>}
                                                    {align === 'center' && <i className={`${editor_align_center_medium} icon-md`}></i>}
                                                </button>
                                            </RSTooltip>
                                        ))}
                                    </div>
                                </Col>
                            </Row>
                        </div>

                        {/* Font Color Section */}
                        <div className='form-field-group'>
                            <Row>
                                <Col md={7}>
                                    <label>Text color</label>
                                </Col>
                                <Col md={5}>
                                    <div className="color-picker-display mt-8">
                                        <div className="color-swatch" style={{ backgroundColor: headerConfigColor || DEFAULT_HEADER_FONT_COLOR }}></div>
                                        <span className="color-hex">{(headerConfigColor || DEFAULT_HEADER_FONT_COLOR).toUpperCase()}</span>
                                        <div className="rs-builder-colorpicker-container">
                                            <RSColorPicker
                                                icon={COLOR_PICKER}
                                                isOpacity={true}
                                                onSelect={(value) => {
                                                    let color = value;
                                                    // Support opacity payload from RSColorPicker when isOpacity is true
                                                    if (typeof value === 'object' && value.color && value.opacity !== undefined) {
                                                        const hexOpacity = opacityToHex(value.opacity);
                                                        color = `${value.color}${hexOpacity}`;
                                                    }
                                                    setValue('headerConfig.color', color, { shouldValidate: true, shouldDirty: true });
                                                }}
                                                colorValue={headerConfigColor || DEFAULT_HEADER_FONT_COLOR}
                                                tooltipText="Header text color"
                                                alignRight={true}
                                            />
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </div>

                        {/* Background Color Section - disabled when background image is set */}
                        <div className={`form-field-group ${hasBackgroundImage ? 'click-off' : ''}`}>
                            <Row>
                                <Col md={7}>
                                    <label>Background color</label>
                                </Col>
                                <Col md={5}>
                                    <div className="color-picker-display mt-8">
                                        <div className="color-swatch" style={{ backgroundColor: headerConfigBackgroundColor || DEFAULT_HEADER_BG_COLOR }}></div>
                                        <span className="color-hex">{(headerConfigBackgroundColor || DEFAULT_HEADER_BG_COLOR).toUpperCase()}</span>
                                        <div className="rs-builder-colorpicker-container">
                                            <RSColorPicker
                                                icon={COLOR_PICKER}
                                                isOpacity={true}
                                                onSelect={(value) => {
                                                    let color = value;
                                                    // Support opacity payload from RSColorPicker when isOpacity is true
                                                    if (typeof value === 'object' && value.color && value.opacity !== undefined) {
                                                        const hexOpacity = opacityToHex(value.opacity);
                                                        color = `${value.color}${hexOpacity}`;
                                                    }
                                                    // Clear background image when color is selected
                                                    if (hasBackgroundImage) {
                                                        setValue('headerConfig.backgroundImage', '', { shouldValidate: true, shouldDirty: true });
                                                    }
                                                    setValue('headerConfig.backgroundColor', color, { shouldValidate: true, shouldDirty: true });
                                                }}
                                                colorValue={headerConfigBackgroundColor || DEFAULT_HEADER_BG_COLOR}
                                                tooltipText="Header background color"
                                                alignRight={true}
                                                disabled={hasBackgroundImage}
                                            />
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </div>

                        {/* Logo Upload Section */}
                        <div className='form-field-group'>
                            <label className='mb10'>Header logo</label>
                            <Row>

                                <Col md={12}>
                                    <ImageUpload
                                        fieldName="headerConfig.logo"
                                        inputId="formStyleHeaderLogoUploadFileInput"
                                        control={control}
                                        isShowImageURL={false}
                                    />
                                </Col>
                            </Row>
                        </div>
                        {/* Background Image Section */}
                        <div className='form-field-group'>
                            <label className='mb10'>Background image</label>
                            <Row>
                                <Col md={12}>
                                    <ImageUpload
                                        fieldName="headerConfig.backgroundImage"
                                        inputId="formStyleHeaderBgUploadFileInput"
                                        control={control}
                                        isShowImageURL={false}
                                    />
                                </Col>
                            </Row>
                        </div>


                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormStyleHeader;

