import { CANCEL, SAVE } from 'Constants/GlobalConstant/Placeholders';
import { circle_plus_fill_edge_medium, circle_zoom_fill_medium } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { uploadWebPushImage } from 'Reducers/communication/createCommunication/Create/request';

import RSModal from 'Components/RSModal';
import RSSwitch from 'Components/FormFields/RSSwitch';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSRadioButton from 'Components/FormFields/RSRadioButton';
import { Col, Row, Accordion } from 'react-bootstrap';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSColorPicker from 'Components/ColorPicker';
import { COLOR_PICKER } from '../../constant';
import RSTooltip from 'Components/RSTooltip';
import FormStyleBackground from './FormStyleBackground';

const FormStylesComponent = ({ show, onHide, tag, formGenerationColumn, onStyleChange }) => {
    const {
        control,
        watch,
        setValue,
        getValues,
        formState: { errors },
    } = useFormContext();

    const dispatch = useDispatch();
    const { departmentId, clientId, userId, departmentName, isAgency } = useSelector((state) => getSessionId(state));

    const isSubscriptionOrSurvey = tag === 'Subscription' || tag === 'Survey';
    const [themeSearch, setThemeSearch] = useState('');
    const [viewMode, setViewMode] = useState('edit'); // 'edit' or 'preview'
    const [editingTheme, setEditingTheme] = useState(null); // Theme key being edited
    const [customThemes, setCustomThemes] = useState({}); // Store custom themes
    const [colorCustomization, setColorCustomization] = useState({
        background: '#ffffff',
        formBackground: '#ffffff',
        primary: '#007bff',
        textField01: '#333333',
        textField02: '#e0e0e0',
    });
    const [logoUploadModal, setLogoUploadModal] = useState(false);
    const [logoUploading, setLogoUploading] = useState(false);
    const [logoUploadError, setLogoUploadError] = useState('');
    const [headerBgUploading, setHeaderBgUploading] = useState(false);
    const [formBgUploading, setFormBgUploading] = useState(false);
    const [headerBgUploadError, setHeaderBgUploadError] = useState('');
    const [formBgUploadError, setFormBgUploadError] = useState('');
    const [headerBgAlignment, setHeaderBgAlignment] = useState('top'); // 'left', 'right', 'top', 'center' - for background image
    const [headerAlignment, setHeaderAlignment] = useState('top'); // 'left', 'right', 'top' - for header layout position (Style section)
    const [logoPositionAlignment, setLogoPositionAlignment] = useState('center'); // 'left', 'right', 'center' - for logo position within header (Logo section)
    const [activeAccordions, setActiveAccordions] = useState(['theme', 'font', 'logo', 'style', 'formBackground', 'textField', 'inputStyle', 'button', 'layout', 'pagination']); // Default all open
    
    // Store the latest callback in a ref to avoid dependency issues
    const onStyleChangeRef = useRef(onStyleChange);
    
    // Update ref when callback changes
    useEffect(() => {
        onStyleChangeRef.current = onStyleChange;
            }, [onStyleChange]);

    const handleAccordionToggle = (key) => {
        if (activeAccordions.includes(key)) {
            setActiveAccordions(activeAccordions.filter(k => k !== key));
        } else {
            setActiveAccordions([...activeAccordions, key]);
        }
    };

    // Sync logoPositionAlignment with headerConfig.alignment from form
    useEffect(() => {
        if (headerConfigAlignment !== undefined && headerConfigAlignment !== null && headerConfigAlignment !== '') {
            setLogoPositionAlignment(headerConfigAlignment);
        }
    }, [headerConfigAlignment]);

    const [
        formStylesTheme,
        formStylesPagination,
        formStylesPaginationEnabled,
        formStylesItemsPerPage,
        formStylesTextFieldSize,
        formStylesFont,
        formStylesLogoEnabled,
        formStylesLogoStyle,
        formStylesInputStyle,
        formStylesButtonRounding,
        formStylesLayoutAlignment,
        headerConfigLogo,
        headerConfigName,
        headerConfigBackgroundColor,
        headerConfigColor,
        headerConfigBackgroundImage,
        formStylesFormBackgroundImage,
        formStylesFormBackgroundColor,
        formStylesFormBackgroundEnabled,
        formGeneratorData,
        progressiveProfilingEnabled,
        headerConfigAlignment,
    ] = watch([
        'formStyles.theme',
        'formStyles.pagination',
        'formStyles.paginationEnabled',
        'formStyles.itemsPerPage',
        'formStyles.textFieldSize',
        'formStyles.font',
        'formStyles.logoEnabled',
        'formStyles.logoStyle',
        'formStyles.inputStyle',
        'formStyles.buttonRounding',
        'formStyles.layoutAlignment',
        'headerConfig.logo',
        'headerConfig.name',
        'headerConfig.backgroundColor',
        'headerConfig.color',
        'headerConfig.backgroundImage',
        'formStyles.formBackgroundImage',
        'formStyles.formBackgroundColor',
        'formStyles.formBackgroundEnabled',
        'formGenerator',
        'progressiveProfiling',
        'headerConfig.alignment',
    ]);

    // Extract string values from objects (for display)
    const getStringValue = (value, defaultValue) => {
        if (typeof value === 'object' && value !== null && value.value) {
            return value.value;
        }
        return value || defaultValue;
    };

    const themeValue = getStringValue(formStylesTheme, 'light');
    const paginationValue = getStringValue(formStylesPagination, 'next');
    const textFieldSize = getStringValue(formStylesTextFieldSize, 'normal');
    const fontValue = getStringValue(formStylesFont, 'default');
    const logoEnabled = formStylesLogoEnabled !== undefined ? formStylesLogoEnabled : false;
    const logoStyle = getStringValue(formStylesLogoStyle, 'style3');
    const inputStyle = getStringValue(formStylesInputStyle, 'default');
    const buttonRounding = getStringValue(formStylesButtonRounding, 'default');
    const layoutAlignment = getStringValue(formStylesLayoutAlignment, 'left');

    // Theme definitions matching the image
    const themeDefinitions = {
        light: {
            name: 'Light',
            background: '#ffffff',
            text: '#333333',
            accent: '#007bff',
            border: '#e0e0e0',
            formBackground: '#ffffff',
            textField01: '#333333',
            textField02: '#e0e0e0',
        },
        dark: {
            name: 'Dark',
            background: '#2c3e50',
            text: '#ecf0f1',
            accent: '#3498db',
            border: '#34495e',
            formBackground: '#34495e',
            textField01: '#ecf0f1',
            textField02: '#2c3e50',
        },
        ecoFriendly: {
            name: 'Eco-friendly',
            background: '#f8f9fa',
            text: '#495057',
            accent: '#28a745',
            border: '#dee2e6',
            formBackground: '#ffffff',
            textField01: '#495057',
            textField02: '#dee2e6',
        },
        charcoal: {
            name: 'Charcoal',
            background: '#36454f',
            text: '#ffffff',
            accent: '#000000',
            border: '#4a5d6e',
            formBackground: '#4a5d6e',
            textField01: '#ffffff',
            textField02: '#36454f',
        },
        quietSands: {
            name: 'Quiet Sands',
            background: '#f5f5dc',
            text: '#333333',
            accent: '#ffd700',
            border: '#e0e0d0',
            formBackground: '#ffffff',
            textField01: '#333333',
            textField02: '#e0e0d0',
        },
        cyberDawn: {
            name: 'Cyber Dawn',
            background: '#1a1a2e',
            text: '#ffffff',
            accent: '#ffd700',
            border: '#16213e',
            formBackground: '#16213e',
            textField01: '#ffffff',
            textField02: '#1a1a2e',
        },
    };

    // Merge custom themes with base themes
    const allThemes = { ...themeDefinitions, ...customThemes };

    // Get theme colors
    const getThemeColors = useCallback(() => {
        return allThemes[themeValue] || themeDefinitions.light;
    }, [themeValue, allThemes, themeDefinitions]);

    const themeColors = getThemeColors();

    // Font options
    const fontOptions = [
        { text: 'Default', value: 'default' },
        { text: 'Arial', value: 'arial' },
        { text: 'Helvetica', value: 'helvetica' },
        { text: 'Times New Roman', value: 'times' },
        { text: 'Georgia', value: 'georgia' },
        { text: 'Verdana', value: 'verdana' },
    ];

    // Pagination options
    const paginationOptions = [
        { text: 'Next', value: 'next' },
        { text: 'Only Next', value: 'onlyNext' },
    ];

    // Items per page options
    const itemsPerPageOptions = [
        { text: '5', value: 5 },
        { text: '10', value: 10 },
        { text: '15', value: 15 },
        { text: '20', value: 20 },
        { text: '25', value: 25 },
    ];

    // Get input style based on selection
    const getInputStyle = () => {
        switch (inputStyle) {
            case 'line':
                return {
                    border: 'none',
                    borderBottom: `2px solid ${themeColors.border}`,
                    borderRadius: '0px',
                };
            case 'rounded':
                return {
                    border: `1px solid ${themeColors.border}`,
                    borderRadius: '20px',
                };
            case 'default':
            default:
                return {
                    border: `1px solid ${themeColors.border}`,
                    borderRadius: '4px',
                };
        }
    };

    // Get button rounding style
    const getButtonRounding = () => {
        switch (buttonRounding) {
            case 'full':
                return { borderRadius: '50px' };
            case 'none':
                return { borderRadius: '0px' };
            case 'default':
            default:
                return { borderRadius: '4px' };
        }
    };

    // Get text field size
    const getTextFieldSize = () => {
        switch (textFieldSize) {
            case 'small':
                return { padding: '6px 10px', fontSize: '12px' };
            case 'large':
                return { padding: '14px 16px', fontSize: '16px' };
            case 'normal':
            default:
                return { padding: '10px 12px', fontSize: '14px' };
        }
    };

    // Collect all current style values and call callback
    // Using a regular function instead of useCallback to avoid dependency issues
    const notifyStyleChange = (section, updatedValues = {}) => {
        const callback = onStyleChangeRef.current;
        if (!callback) {
            return;
        }

        try {
            const currentValues = getValues();
            const currentThemeColors = getThemeColors();
            
            const allStyleValues = {
                // Theme section
                theme: themeValue || 'light',
                themeColors: currentThemeColors,
                
                // Font section
                font: fontValue || 'default',
                fontSize: currentValues.formStyles?.fontSize || 19,
                fontColor: currentValues.formStyles?.fontColor || '#000000',
                
                // Logo section
                logoEnabled: logoEnabled !== undefined ? logoEnabled : false,
                logo: headerConfigLogo || '',
                logoName: headerConfigName || '',
                logoAlignment: logoPositionAlignment || 'center',
                logoBackgroundColor: headerConfigBackgroundColor || '#ffffff',
                logoColor: headerConfigColor || '#000000',
                
                // Style section
                logoStyle: logoStyle || 'style3',
                headerAlignment: headerAlignment || 'top',
                headerBgAlignment: headerBgAlignment || 'top',
                headerBackgroundImage: headerConfigBackgroundImage || '',
                formBackgroundImage: formStylesFormBackgroundImage || '',
                formBackgroundColor: currentValues.formStyles?.formBackgroundColor || '#ffffff',
                formBackgroundEnabled: currentValues.formStyles?.formBackgroundEnabled || false,
                
                // TextField section
                textFieldSize: textFieldSize || 'normal',
                
                // InputStyle section
                inputStyle: inputStyle || 'default',
                
                // Button section
                buttonRounding: buttonRounding || 'default',
                
                // Layout section
                layoutAlignment: layoutAlignment || 'left',
                
                // Pagination section
                paginationEnabled: formStylesPaginationEnabled || false,
                pagination: paginationValue || 'next',
                itemsPerPage: formStylesItemsPerPage || 5,
                
                // Merge any updated values
                ...updatedValues,
            };

                        callback(section, allStyleValues);
        } catch (error) {
        }
    };

    useEffect(() => {
        if (Array.isArray(formGenerationColumn) && formGenerationColumn.length > 0) {
            const stylesCol = formGenerationColumn.find((c) => c?.columnType === 'FormStyles');
            const details = stylesCol?.formDetails || stylesCol?.fieldDetails;
            let parsed = null;
            if (typeof details === 'string') {
                try {
                    parsed = JSON.parse(details);
                } catch (e) {
                    parsed = null;
                }
            } else if (typeof details === 'object' && details) {
                parsed = details;
            }
            if (parsed) {
                if (parsed?.theme) {
                    setValue('formStyles.theme', parsed.theme, { shouldValidate: false });
                } else {
                    setValue('formStyles.theme', 'light', { shouldValidate: false });
                }
                setValue('formStyles.paginationEnabled', parsed?.paginationEnabled || false, { shouldValidate: false });
                if (parsed?.pagination) {
                    const pagination = paginationOptions.find((o) => o.value === parsed.pagination);
                    if (pagination) {
                        setValue('formStyles.pagination', pagination, { shouldValidate: false });
                    } else {
                        // If old pagination type exists, map to new options or default to 'next'
                        const oldPaginationValue = parsed.pagination;
                        if (oldPaginationValue === 'previousNext' || oldPaginationValue === 'next') {
                            setValue('formStyles.pagination', { text: 'Next', value: 'next' }, { shouldValidate: false });
                        } else {
                            // Default to 'next' for any other old values
                            setValue('formStyles.pagination', { text: 'Next', value: 'next' }, { shouldValidate: false });
                        }
                    }
                } else {
                    setValue('formStyles.pagination', { text: 'Next', value: 'next' }, { shouldValidate: false });
                }
                if (parsed?.itemsPerPage != null) {
                    setValue('formStyles.itemsPerPage', parsed.itemsPerPage, { shouldValidate: false });
                } else {
                    setValue('formStyles.itemsPerPage', 5, { shouldValidate: false });
                }
                if (parsed?.textFieldSize) {
                    setValue('formStyles.textFieldSize', parsed.textFieldSize, { shouldValidate: false });
                }
                if (parsed?.font) {
                    // Convert font string to object if needed
                    const fontVal = typeof parsed.font === 'object' ? parsed.font : getOptionByValue(fontOptions, parsed.font);
                    setValue('formStyles.font', fontVal, { shouldValidate: false });
                } else {
                    setValue('formStyles.font', fontOptions[0], { shouldValidate: false });
                }
                if (parsed?.logoEnabled !== undefined) {
                    setValue('formStyles.logoEnabled', parsed.logoEnabled, { shouldValidate: false });
                }
                if (parsed?.logoStyle) {
                    setValue('formStyles.logoStyle', parsed.logoStyle, { shouldValidate: false });
                }
                if (parsed?.inputStyle) {
                    setValue('formStyles.inputStyle', parsed.inputStyle, { shouldValidate: false });
                }
                if (parsed?.buttonRounding) {
                    setValue('formStyles.buttonRounding', parsed.buttonRounding, { shouldValidate: false });
                }
                if (parsed?.layoutAlignment) {
                    setValue('formStyles.layoutAlignment', parsed.layoutAlignment, { shouldValidate: false });
                }
                if (parsed?.customThemes && typeof parsed.customThemes === 'object') {
                    setCustomThemes(parsed.customThemes);
                }
                if (parsed?.formBackgroundImage) {
                    setValue('formStyles.formBackgroundImage', parsed.formBackgroundImage, { shouldValidate: false });
                }
                if (parsed?.formBackgroundColor !== undefined) {
                    setValue('formStyles.formBackgroundColor', parsed.formBackgroundColor, { shouldValidate: false });
                }
                if (parsed?.formBackgroundEnabled !== undefined) {
                    setValue('formStyles.formBackgroundEnabled', parsed.formBackgroundEnabled, { shouldValidate: false });
                }
                // Load headerConfig from parsed data if available
                if (parsed?.headerConfig) {
                    if (parsed.headerConfig.backgroundImage) {
                        setValue('headerConfig.backgroundImage', parsed.headerConfig.backgroundImage, { shouldValidate: false });
                    }
                    if (parsed.headerConfig.backgroundAlignment) {
                        setHeaderBgAlignment(parsed.headerConfig.backgroundAlignment);
                    }
                    if (parsed.headerConfig.alignment) {
                        // This is logo position alignment (left, right, center)
                        setLogoPositionAlignment(parsed.headerConfig.alignment);
                        setValue('headerConfig.alignment', parsed.headerConfig.alignment, { shouldValidate: false });
                    }
                    if (parsed.headerConfig.layoutPosition) {
                        // This is header layout position (top, left, right)
                        setHeaderAlignment(parsed.headerConfig.layoutPosition);
                    }
                    if (parsed.headerConfig.logo) {
                        setValue('headerConfig.logo', parsed.headerConfig.logo, { shouldValidate: false });
                    }
                    if (parsed.headerConfig.name) {
                        setValue('headerConfig.name', parsed.headerConfig.name, { shouldValidate: false });
                    }
                    if (parsed.headerConfig.backgroundColor) {
                        setValue('headerConfig.backgroundColor', parsed.headerConfig.backgroundColor, { shouldValidate: false });
                    }
                    if (parsed.headerConfig.color) {
                        setValue('headerConfig.color', parsed.headerConfig.color, { shouldValidate: false });
                    }
                }
                return;
            }
        }

        // Set defaults
        setValue('formStyles.theme', 'light', { shouldValidate: false });
        setValue('formStyles.textFieldSize', 'normal', { shouldValidate: false });
        setValue('formStyles.font', fontOptions[0], { shouldValidate: false });
        setValue('formStyles.logoEnabled', false, { shouldValidate: false });
        setValue('formStyles.logoStyle', 'style3', { shouldValidate: false });
        setValue('formStyles.inputStyle', 'default', { shouldValidate: false });
        setValue('formStyles.buttonRounding', 'default', { shouldValidate: false });
        setValue('formStyles.layoutAlignment', 'left', { shouldValidate: false });
    }, [formGenerationColumn, setValue]);

    // Render preview component based on field type
    const renderFieldPreview = (item, index) => {
        const labelName = item?.tinyMceLable || item?.tinyMceLableMain || item?.labelName || 'Field Label';
        const placeholder = item?.settings?.placeholder || item?.placeHolder || 'Enter value';
        const mandatory = item?.mandatory;
        const columnType = item?.columnType;
        const componentName = item?.componentName;
        const optionData = item?.optionData || item?.dropdowns || [];
        const multiChoice = item?.multiChoice || [];
        const rankingFields = item?.rankingFields || [];

        const inputSizeStyle = getTextFieldSize();
        const inputStyleProps = getInputStyle();

        const baseInputStyle = {
            width: '100%',
            ...inputSizeStyle,
            ...inputStyleProps,
            backgroundColor: themeColors.textField02 || (themeColors.background === '#ffffff' ? '#ffffff' : themeColors.background),
            color: themeColors.textField01 || themeColors.text,
            transition: 'all 0.3s ease',
        };

        const labelStyle = {
            color: themeColors.text,
            fontSize: inputSizeStyle.fontSize,
        };

        // Radio Button
        if (columnType === 'Radio' || componentName === 'RadioButton') {
            return (
                <div key={index} className="form-field-preview">
                    <label className='control-label-left field-label' style={labelStyle}>
                        {labelName} {mandatory && <span style={{ color: themeColors.accent }}>*</span>}
                    </label>
                    <div className="field-radio-group">
                        {optionData.length > 0 ? optionData.slice(0, 3).map((option, optIndex) => (
                            <RSRadioButton
                                key={optIndex}
                                control={control}
                                name={`preview-radio-${index}`}
                                labelName={option}
                                value={option}
                                disabled={true}
                                style={{ accentColor: themeColors.accent }}
                                radio_wrapper_class="mb-0"
                                className="mr-2"
                            />
                        )) : (
                            ['Male', 'Female', 'Others'].map((option, optIndex) => (
                                <RSRadioButton
                                    key={optIndex}
                                    control={control}
                                    name={`preview-radio-${index}`}
                                    labelName={option}
                                    value={option}
                                    disabled={true}
                                    defaultValue={optIndex === 0 ? option : undefined}
                                    style={{ accentColor: themeColors.accent }}
                                    radio_wrapper_class="mb-0"
                                    className="mr-2"
                                />
                            ))
                        )}
                    </div>
                </div>
            );
        }

        // Checkbox
        if (columnType === 'checkbox' || componentName === 'CheckBox') {
            return (
                <div key={index} className="form-field-preview">
                    <label className='control-label-left field-label' style={labelStyle}>
                        {labelName} {mandatory && <span style={{ color: themeColors.accent }}>*</span>}
                    </label>
                    <div className="field-checkbox-group">
                        {optionData.length > 0 ? optionData.slice(0, 3).map((option, optIndex) => (
                            <label key={optIndex} className='control-label-left'>
                                <input
                                    type="checkbox"
                                    disabled
                                    style={{ cursor: 'not-allowed', accentColor: themeColors.accent }}
                                />
                                <span style={{ color: themeColors.text }}>{option}</span>
                            </label>
                        )) : (
                            ['Option 1', 'Option 2', 'Option 3'].map((option, optIndex) => (
                                <label key={optIndex} className='control-label-left'>
                                    <input
                                        type="checkbox"
                                        disabled
                                        style={{ cursor: 'not-allowed', accentColor: themeColors.accent }}
                                    />
                                    <span style={{ color: themeColors.text }}>{option}</span>
                                </label>
                            ))
                        )}
                    </div>
                </div>
            );
        }

        // ComboBox (Dropdown)
        if (columnType === 'Combobox' || componentName === 'ComboBox') {
            return (
                <div key={index} className="form-field-preview">
                    <label className='control-label-left field-label' style={labelStyle}>
                        {labelName} {mandatory && <span style={{ color: themeColors.accent }}>*</span>}
                    </label>
                    <select
                        className="field-select"
                        style={baseInputStyle}
                        disabled
                    >
                        <option value="">{placeholder || 'Select'}</option>
                        {optionData.length > 0 ? optionData.slice(0, 5).map((option, optIndex) => (
                            <option key={optIndex} value={option}>{option}</option>
                        )) : (
                            ['Option 1', 'Option 2', 'Option 3'].map((option, optIndex) => (
                                <option key={optIndex} value={option}>{option}</option>
                            ))
                        )}
                    </select>
                </div>
            );
        }

        // MultiChoice
        if (columnType === 'multichoice') {
            return (
                <div key={index} className="form-field-preview">
                    <label className='control-label-left field-label' style={labelStyle}>
                        {labelName} {mandatory && <span style={{ color: themeColors.accent }}>*</span>}
                    </label>
                    <div className="field-checkbox-group">
                        {multiChoice.length > 0 ? multiChoice.slice(0, 3).map((choice, optIndex) => (
                            <label key={optIndex} className='control-label-left'>
                                <input
                                    type="checkbox"
                                    disabled
                                    style={{ cursor: 'not-allowed', accentColor: themeColors.accent }}
                                />
                                <span style={{ color: themeColors.text }}>{choice.answer || `Option ${optIndex + 1}`}</span>
                            </label>
                        )) : (
                            ['Option 1', 'Option 2', 'Option 3'].map((option, optIndex) => (
                                <label key={optIndex} className='control-label-left'>
                                    <input
                                        type="checkbox"
                                        disabled
                                        style={{ cursor: 'not-allowed', accentColor: themeColors.accent }}
                                    />
                                    <span style={{ color: themeColors.text }}>{option}</span>
                                </label>
                            ))
                        )}
                    </div>
                </div>
            );
        }

        // Ranking/Rating
        if (columnType === 'Rankrating') {
            return (
                <div key={index} className="form-field-preview">
                    <label className='control-label-left field-label' style={labelStyle}>
                        {labelName} {mandatory && <span style={{ color: themeColors.accent }}>*</span>}
                    </label>
                    <div className="field-ranking-list">
                        {rankingFields.length > 0 ? rankingFields.slice(0, 3).map((field, optIndex) => (
                            <div key={optIndex} className="field-ranking-item">
                                <span className="ranking-number" style={{ color: themeColors.text }}>{optIndex + 1}.</span>
                                <span className="ranking-text" style={{ color: themeColors.text }}>{field.answer || `Item ${optIndex + 1}`}</span>
                            </div>
                        )) : (
                            ['Item 1', 'Item 2', 'Item 3'].map((item, optIndex) => (
                                <div key={optIndex} className="field-ranking-item">
                                    <span className="ranking-number" style={{ color: themeColors.text }}>{optIndex + 1}.</span>
                                    <span className="ranking-text" style={{ color: themeColors.text }}>{item}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            );
        }

        // Phone Input
        if (componentName === 'PhoneInput' || item?.isMobileNumber) {
            return (
                <div key={index} className="form-field-preview">
                    <label className='control-label-left field-label' style={labelStyle}>
                        {labelName} {mandatory && <span style={{ color: themeColors.accent }}>*</span>}
                    </label>
                    <input
                        type="tel"
                        placeholder={placeholder}
                        className="field-input"
                        style={baseInputStyle}
                        disabled
                    />
                </div>
            );
        }

        // Date/Time
        if (columnType === 'TimeDate' || componentName === 'DateAndTime') {
            return (
                <div key={index} className="form-field-preview">
                    <label className='control-label-left field-label' style={labelStyle}>
                        {labelName} {mandatory && <span style={{ color: themeColors.accent }}>*</span>}
                    </label>
                    <input
                        type="date"
                        placeholder={placeholder}
                        className="field-input"
                        style={baseInputStyle}
                        disabled
                    />
                </div>
            );
        }

        // Textarea/CommentBox
        if (columnType === 'CommentBox' || componentName === 'CommentBox') {
            return (
                <div key={index} className="form-field-preview">
                    <label className='control-label-left field-label' style={labelStyle}>
                        {labelName} {mandatory && <span style={{ color: themeColors.accent }}>*</span>}
                    </label>
                    <textarea
                        placeholder={placeholder}
                        rows={4}
                        className="field-textarea"
                        style={baseInputStyle}
                        disabled
                    />
                </div>
            );
        }

        // TextBlock
        if (columnType === 'TextBlock') {
            return (
                <div key={index} className="form-field-preview">
                    <div
                        className="field-text-block"
                        style={{
                            color: themeColors.text,
                            fontSize: inputSizeStyle.fontSize,
                        }}
                        dangerouslySetInnerHTML={{ __html: labelName }}
                    />
                </div>
            );
        }

        // Default: Text Input
        const inputType = item?.isEmail ? 'email' : 'text';
        return (
            <div key={index} className="form-field-preview">
                <label className='control-label-left field-label' style={labelStyle}>
                    {labelName} {mandatory && <span style={{ color: themeColors.accent }}>*</span>}
                </label>
                <input
                    type={inputType}
                    placeholder={placeholder}
                    className="field-input"
                    style={baseInputStyle}
                    disabled
                />
            </div>
        );
    };

    // Helper function to get the object from value string
    const getOptionByValue = (options, value) => {
        const stringValue = typeof value === 'object' && value !== null && value.value !== undefined ? value.value : value;
        const foundOption = options.find(opt => opt.value === stringValue);
        return foundOption || options[0];
    };

    // Handle theme selection
    const handleThemeSelect = (themeKey) => {
        setValue('formStyles.theme', themeKey, { shouldValidate: true, shouldDirty: true });

        // Apply FormStyle Column prop values when selecting a theme
        const theme = allThemes[themeKey];
        if (theme) {
            // Update form styles based on theme if they exist in theme
            if (theme.formStyles) {
                Object.keys(theme.formStyles).forEach(key => {
                    if (theme.formStyles[key] !== undefined) {
                        setValue(`formStyles.${key}`, theme.formStyles[key], { shouldValidate: false });
                    }
                });
            }
        }
        
        // Notify style change for theme section
        notifyStyleChange('theme', { theme: themeKey });
    };

    // Handle pagination change
    const handlePaginationChange = (e) => {
        const selectedItem = e?.value;
        if (selectedItem) {
            setValue('formStyles.pagination', selectedItem, { shouldValidate: true, shouldDirty: true });
            notifyStyleChange('pagination', { pagination: selectedItem });
        }
    };

    // Handle items per page change
    const handleItemsPerPageChange = (e) => {
        const selectedItem = e?.value;
        if (selectedItem) {
            setValue('formStyles.itemsPerPage', selectedItem, { shouldValidate: true, shouldDirty: true });
            notifyStyleChange('pagination', { itemsPerPage: selectedItem });
        }
    };

    // Filter themes based on search
    const filteredThemes = Object.entries(allThemes).filter(([key, theme]) =>
        theme.name.toLowerCase().includes(themeSearch.toLowerCase())
    );

    // Handle Edit theme
    const handleEditTheme = (themeKey, e) => {
        e.stopPropagation(); // Prevent theme selection
        const theme = allThemes[themeKey];
        if (theme) {
            setColorCustomization({
                background: theme.background || '#ffffff',
                formBackground: theme.formBackground || theme.background || '#ffffff',
                primary: theme.accent || '#007bff',
                textField01: theme.textField01 || theme.text || '#333333',
                textField02: theme.textField02 || theme.border || '#e0e0e0',
            });
            setEditingTheme(themeKey);
        }
    };

    // Handle Add theme
    const handleAddTheme = () => {
        setColorCustomization({
            background: '#ffffff',
            formBackground: '#ffffff',
            primary: '#007bff',
            textField01: '#333333',
            textField02: '#e0e0e0',
        });
        setEditingTheme('new');
    };

    // Handle Save color customization
    const handleSaveColorCustomization = () => {
        // Get current FormStyle Column prop values
        const currentFormStyles = {
            theme: themeValue || 'light',
            pagination: paginationValue || 'next',
            paginationEnabled: formStylesPaginationEnabled || false,
            itemsPerPage: formStylesItemsPerPage || 5,
            textFieldSize: textFieldSize || 'normal',
            font: fontValue || 'default',
            logoEnabled: logoEnabled !== undefined ? logoEnabled : false,
            logoStyle: logoStyle || 'style3',
            inputStyle: inputStyle || 'default',
            buttonRounding: buttonRounding || 'default',
            layoutAlignment: layoutAlignment || 'left',
        };

        if (editingTheme === 'new') {
            // Create new custom theme
            const newThemeKey = `custom_${Date.now()}`;
            const newTheme = {
                name: `Custom ${Object.keys(customThemes).length + 1}`,
                background: colorCustomization.background,
                formBackground: colorCustomization.formBackground,
                accent: colorCustomization.primary,
                text: colorCustomization.textField01,
                border: colorCustomization.textField02,
                textField01: colorCustomization.textField01,
                textField02: colorCustomization.textField02,
                formStyles: currentFormStyles, // Include FormStyle Column prop values
            };
            setCustomThemes(prev => ({ ...prev, [newThemeKey]: newTheme }));
            setValue('formStyles.theme', newThemeKey, { shouldValidate: true, shouldDirty: true });
            notifyStyleChange('theme', { theme: newThemeKey });
        } else if (editingTheme) {
            // Update existing theme (only custom themes can be edited)
            if (customThemes[editingTheme]) {
                const updatedTheme = {
                    ...customThemes[editingTheme],
                    background: colorCustomization.background,
                    formBackground: colorCustomization.formBackground,
                    accent: colorCustomization.primary,
                    text: colorCustomization.textField01,
                    border: colorCustomization.textField02,
                    textField01: colorCustomization.textField01,
                    textField02: colorCustomization.textField02,
                    formStyles: { ...(customThemes[editingTheme].formStyles || {}), ...currentFormStyles }, // Merge FormStyle Column prop values
                };
                setCustomThemes(prev => ({ ...prev, [editingTheme]: updatedTheme }));
            } else {
                // Create a copy of base theme as custom theme
                const baseTheme = themeDefinitions[editingTheme];
                const customThemeKey = `custom_${editingTheme}_${Date.now()}`;
                const newTheme = {
                    ...baseTheme,
                    name: `${baseTheme.name} (Custom)`,
                    background: colorCustomization.background,
                    formBackground: colorCustomization.formBackground,
                    accent: colorCustomization.primary,
                    text: colorCustomization.textField01,
                    border: colorCustomization.textField02,
                    textField01: colorCustomization.textField01,
                    textField02: colorCustomization.textField02,
                    formStyles: currentFormStyles, // Include FormStyle Column prop values
                };
                setCustomThemes(prev => ({ ...prev, [customThemeKey]: newTheme }));
                setValue('formStyles.theme', customThemeKey, { shouldValidate: true, shouldDirty: true });
                notifyStyleChange('theme', { theme: customThemeKey });
            }
        }
        setEditingTheme(null);
    };

    // Handle Cancel color customization
    const handleCancelColorCustomization = () => {
        setEditingTheme(null);
    };

    // Handle logo file input change
    const handleLogoFileInputChange = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const acceptedFormats = ['image/png', 'image/jpg', 'image/jpeg', 'image/svg+xml'];

            if (!acceptedFormats.includes(file.type)) {
                setLogoUploadError('Only .png, .jpg, .jpeg, .svg files are supported');
                return;
            }

            const maxSize = 5000000;
            if (file.size > maxSize) {
                setLogoUploadError(`Image size max. ${Math.round(maxSize / 1000000)} MB`);
                return;
            }

            setLogoUploadError('');
            setLogoUploading(true);

            const reader = new FileReader();
            reader.onload = async (event) => {
                const base64String = event.target.result;
                const base64Only = base64String?.split(';base64,')?.pop();
                const imageFormat = file.name?.split('.')?.pop() || 'png';
                const payload = {
                    base64Image: base64Only,
                    imageFormat,
                    contentLength: file.size,
                    departmentId,
                    clientId,
                    departmentName,
                    userId,
                    isAgency,
                };
                try {
                    const res = await dispatch(uploadWebPushImage(payload));
                    if (res?.status && res?.data) {
                        const imageUrl = typeof res?.data === 'string'
                            ? res?.data
                            : (res?.data?.url || res?.data?.imageUrl || res?.data?.inputUrl || res?.data?.data || '');
                        setValue('headerConfig.logo', imageUrl, { shouldValidate: true, shouldDirty: true });
                        setLogoUploadModal(false);
                        setLogoUploadError('');
                        // Use setTimeout to ensure setValue has completed before notifying
                        setTimeout(() => {
                            notifyStyleChange('logo', { logo: imageUrl });
                        }, 0);
                    } else {
                        setLogoUploadError(res?.message || 'Upload failed');
                    }
                } catch (error) {
                    setLogoUploadError('Upload failed. Please try again.');
                } finally {
                    setLogoUploading(false);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleLogoBrowseClick = () => {
        document.getElementById('logoUploadFileInput')?.click();
    };

    // Handle header background image upload
    const handleHeaderBgFileInputChange = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const acceptedFormats = ['image/png', 'image/jpg', 'image/jpeg', 'image/svg+xml'];

            if (!acceptedFormats.includes(file.type)) {
                setHeaderBgUploadError('Only .png, .jpg, .jpeg, .svg files are supported');
                return;
            }

            const maxSize = 5000000;
            if (file.size > maxSize) {
                setHeaderBgUploadError(`Image size max. ${Math.round(maxSize / 1000000)} MB`);
                return;
            }

            setHeaderBgUploadError('');
            setHeaderBgUploading(true);

            const reader = new FileReader();
            reader.onload = async (event) => {
                const base64String = event.target.result;
                const base64Only = base64String?.split(';base64,')?.pop();
                const imageFormat = file.name?.split('.')?.pop() || 'png';
                const payload = {
                    base64Image: base64Only,
                    imageFormat,
                    contentLength: file.size,
                    departmentId,
                    clientId,
                    departmentName,
                    userId,
                    isAgency,
                };
                try {
                    const res = await dispatch(uploadWebPushImage(payload));
                    if (res?.status && res?.data) {
                        const imageUrl = typeof res?.data === 'string'
                            ? res?.data
                            : (res?.data?.url || res?.data?.imageUrl || res?.data?.inputUrl || res?.data?.data || '');
                        setValue('headerConfig.backgroundImage', imageUrl, { shouldValidate: true, shouldDirty: true });
                        setHeaderBgImageModal(false);
                        setHeaderBgUploadError('');
                        notifyStyleChange('style', { headerBackgroundImage: imageUrl });
                    } else {
                        setHeaderBgUploadError(res?.message || 'Upload failed');
                    }
                } catch (error) {
                    setHeaderBgUploadError('Upload failed. Please try again.');
                } finally {
                    setHeaderBgUploading(false);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle form background image upload
    const handleFormBgFileInputChange = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const acceptedFormats = ['image/png', 'image/jpg', 'image/jpeg', 'image/svg+xml'];

            if (!acceptedFormats.includes(file.type)) {
                setFormBgUploadError('Only .png, .jpg, .jpeg, .svg files are supported');
                return;
            }

            const maxSize = 5000000;
            if (file.size > maxSize) {
                setFormBgUploadError(`Image size max. ${Math.round(maxSize / 1000000)} MB`);
                return;
            }

            setFormBgUploadError('');
            setFormBgUploading(true);

            const reader = new FileReader();
            reader.onload = async (event) => {
                const base64String = event.target.result;
                const base64Only = base64String?.split(';base64,')?.pop();
                const imageFormat = file.name?.split('.')?.pop() || 'png';
                const payload = {
                    base64Image: base64Only,
                    imageFormat,
                    contentLength: file.size,
                    departmentId,
                    clientId,
                    departmentName,
                    userId,
                    isAgency,
                };
                try {
                    const res = await dispatch(uploadWebPushImage(payload));
                    if (res?.status && res?.data) {
                        const imageUrl = typeof res?.data === 'string'
                            ? res?.data
                            : (res?.data?.url || res?.data?.imageUrl || res?.data?.inputUrl || res?.data?.data || '');
                        setValue('formStyles.formBackgroundImage', imageUrl, { shouldValidate: true, shouldDirty: true });
                        setFormBgUploadError('');
                        notifyStyleChange('style', { formBackgroundImage: imageUrl });
                    } else {
                        setFormBgUploadError(res?.message || 'Upload failed');
                    }
                } catch (error) {
                    setFormBgUploadError('Upload failed. Please try again.');
                } finally {
                    setFormBgUploading(false);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleHeaderBgBrowseClick = () => {
        document.getElementById('headerBgUploadFileInput')?.click();
    };

    const handleFormBgBrowseClick = () => {
        document.getElementById('formBgUploadFileInput')?.click();
    };

    // Handle style change - clear background images for Style 3
    const handleStyleChange = (style) => {
        // Reset header values when style changes
        setValue('headerConfig.backgroundColor', '#ffffff', { shouldValidate: true, shouldDirty: true });
        setValue('headerConfig.color', '#000000', { shouldValidate: true, shouldDirty: true });
        setValue('headerConfig.backgroundImage', '', { shouldValidate: true, shouldDirty: true });
        setHeaderBgAlignment('top');
        setHeaderAlignment('top');

        setValue('formStyles.logoStyle', style, { shouldValidate: true, shouldDirty: true });

        if (style === 'style1') {
            // Set default colors for Style 1
            setValue('headerConfig.backgroundColor', '#1a237e', { shouldValidate: true, shouldDirty: true });
            setValue('headerConfig.color', '#ffffff', { shouldValidate: true, shouldDirty: true });
        } else if (style === 'style3') {
            // Clear background images for Style 3
            setValue('formStyles.formBackgroundImage', '', { shouldValidate: true, shouldDirty: true });
        } else if (style === 'style2') {
            // Clear header background image for Style 2
            setValue('headerConfig.backgroundImage', '', { shouldValidate: true, shouldDirty: true });
        }
        
        // Notify with all changed values - use setTimeout to ensure setValue has completed
        setTimeout(() => {
            const updatedValues = {
                logoStyle: style,
                logoBackgroundColor: style === 'style1' ? '#1a237e' : '#ffffff',
                logoColor: style === 'style1' ? '#ffffff' : '#000000',
            };
            if (style === 'style2') {
                updatedValues.headerBackgroundImage = '';
            }
            if (style === 'style3') {
                updatedValues.formBackgroundImage = '';
            }
            notifyStyleChange('style', updatedValues);
        }, 0);
    };

    const onSave = () => {
        // Get current theme colors
        const currentTheme = allThemes[themeValue] || themeDefinitions.light;

        // Get itemsPerPage option object
        const itemsPerPageOption = itemsPerPageOptions.find(opt => opt.value === (formStylesItemsPerPage || 5)) || itemsPerPageOptions[0];

        // Build theme object
        const themeData = {
            name: currentTheme.name || themeValue || 'light',
            backgroundColor: currentTheme.background || '#ffffff',
            formBackGroundColor: currentTheme.formBackground || '#ffffff',
            primaryColor: currentTheme.accent || '#007bff',
            textBackgroundColor: currentTheme.textField02 || '#e0e0e0',
            textColor: currentTheme.textField01 || '#333333',
        };

        // Build styleSection object
        const styleSectionData = {
            name: logoStyle || 'style3',
            alignment: headerAlignment || 'top',
            backgroundColor: headerConfigBackgroundColor || '#ffffff',
            headerLogo: (logoStyle === 'style1' && headerConfigLogo) ? headerConfigLogo : '',
            backgroundLogo: (logoStyle === 'style1' && headerConfigBackgroundImage)
                ? headerConfigBackgroundImage
                : (logoStyle === 'style2' && formStylesFormBackgroundImage)
                    ? formStylesFormBackgroundImage
                    : '',
        };

        // Build the final data object in the required format
        const formStylesData = {
            theme: themeData,
            pagination: paginationValue || 'next',
            paginationEnabled: formStylesPaginationEnabled || false,
            itemsPerPage: {
                text: itemsPerPageOption.text,
                value: itemsPerPageOption.value,
            },
            textFieldSize: textFieldSize || 'normal',
            font: fontValue || 'default',
            logoEnabled: logoEnabled !== undefined ? logoEnabled : false,
            logoUrl: headerConfigLogo || '',
            logoAlignment: logoPositionAlignment || 'center',
            styleSection: styleSectionData,
            inputStyle: inputStyle || 'default',
            buttonRounding: buttonRounding || 'default',
            layoutAlignment: layoutAlignment || 'left',
        };

        // Also keep the old format for backward compatibility
        const headerConfigData = {
            enabled: logoEnabled,
            logo: headerConfigLogo || '',
            name: headerConfigName || '',
            backgroundColor: headerConfigBackgroundColor || '#ffffff',
            color: headerConfigColor || '#000000',
            backgroundImage: logoStyle === 'style1' ? (headerConfigBackgroundImage || '') : '',
            backgroundAlignment: logoStyle === 'style1' ? (headerBgAlignment || 'top') : '',
            alignment: logoEnabled ? (logoPositionAlignment || 'center') : '',
            layoutPosition: logoEnabled ? (headerAlignment || 'top') : '',
        };

        setValue('formStyles', formStylesData);
        setValue('headerConfig', headerConfigData);
        onHide();
    };

    const buttonRoundingStyle = getButtonRounding();

    // Header with Edit and Preview buttons
    const headerRightContent = (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>

        </div>
    );

    return (
        <RSModal
            show={show}
            size="xxlg"
            header="Form design"
            headerRightContent={headerRightContent}
            handleClose={onHide}
            body={
                <div className='rs-form-styles-wrapper'>
                    <Row style={{ height: 'calc(100vh - 200px)' }}>
                        <Col
                            sm={8}
                            className="css-scrollbar"
                            style={{ maxHeight: '100%', overflowY: 'auto' }}
                        >
                            <div className="preview-col form-preview-container form-group p20" style={{
                                backgroundImage: logoStyle === 'style2' && formStylesFormBackgroundImage ? `url(${formStylesFormBackgroundImage})` : 'none'
                            }}>
                                {/* Layout Container - Changes based on headerAlignment */}
                                <div className={`form-layout-container ${headerAlignment === 'top' ? 'layout-top' : 'layout-row'}`}>
                                    {/* Header Column - Only shown when logo is enabled */}
                                    {logoEnabled && (
                                        <div className={`form-header-column ${headerAlignment === 'top' ? 'header-top' : 'header-side'} ${headerAlignment === 'right' ? 'header-right' : 'header-left'}`}>
                                            {/* Style 1: Header with background image */}
                                            {logoStyle === 'style1' && headerConfigBackgroundImage && (
                                                <div
                                                    className={`form-header-bg ${headerAlignment === 'top' ? 'header-top' : 'header-side'} align-${headerBgAlignment}`}
                                                    style={{
                                                        backgroundImage: `url(${headerConfigBackgroundImage})`
                                                    }}
                                                >
                                                    {headerConfigLogo && (
                                                        <img
                                                            src={headerConfigLogo}
                                                            alt="Logo"
                                                            className="form-header-logo"
                                                        />
                                                    )}
                                                    {(headerConfigName || !headerConfigLogo) && (
                                                        <span className="form-header-name" style={{ color: headerConfigColor || '#000000' }}>
                                                            {headerConfigName || 'RESUL'}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Regular Header - hide when Style 1 is active */}
                                            {!(logoStyle === 'style1' && headerConfigBackgroundImage) && (
                                                <div
                                                    className={`form-header-regular ${headerAlignment === 'top' ? 'header-top' : 'header-side'} align-${logoPositionAlignment}`}
                                                    style={{
                                                        backgroundColor: headerConfigBackgroundColor || 'transparent',
                                                        color: headerConfigColor || '#000000'
                                                    }}
                                                >
                                                    {headerConfigLogo && (
                                                        <img
                                                            src={headerConfigLogo}
                                                            alt="Logo"
                                                            className="form-header-logo"
                                                        />
                                                    )}
                                                    {(headerConfigName || !headerConfigLogo) && (
                                                        <span className="form-header-name">
                                                            {headerConfigName || 'RESUL'}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Form Column */}
                                    <div className={`form-content-column ${headerAlignment === 'top' || !logoEnabled ? 'content-full' : 'content-with-header'} ${headerAlignment === 'right' ? 'content-right' : 'content-left'}`}>
                                        <div
                                            className="form-preview-wrapper"
                                            style={{
                                                backgroundColor: themeColors.background,
                                                color: themeColors.text,
                                                fontFamily: fontValue !== 'default' ? fontValue : 'inherit',
                                            }}
                                        >
                                            {/* Form Preview */}
                                            <div>
                                                <div>
                                                    {formGeneratorData && formGeneratorData.length > 0 ? (
                                                        (() => {
                                                            const filteredData = formGeneratorData.filter((item) => !item?.field && item?.columnType !== 'Hidden');
                                                            const itemsToShow = formStylesPaginationEnabled && formStylesItemsPerPage && formStylesItemsPerPage > 0
                                                                ? formStylesItemsPerPage
                                                                : filteredData.length;
                                                            return filteredData
                                                                .slice(0, itemsToShow)
                                                                .map((item, index) => renderFieldPreview(item, index));
                                                        })()
                                                    ) : (
                                                        <>
                                                            {/* Default preview fields - respect items per page when pagination is enabled */}
                                                            {(() => {
                                                                const defaultFields = [
                                                                    { label: 'Name', type: 'text', placeholder: 'Enter name' },
                                                                    { label: 'Email', type: 'email', placeholder: 'Enter email ID' },
                                                                    { label: 'Mobile', type: 'tel', placeholder: 'Enter Mobile number' },
                                                                    { label: 'City', type: 'text', placeholder: 'Entercity name' },
                                                                    { label: 'Address', type: 'text', placeholder: 'Entercity address' },
                                                                    { label: 'Gender', type: 'radio', options: ['Male', 'Female', 'Others'] },
                                                                ];
                                                                const itemsToShow = formStylesPaginationEnabled && formStylesItemsPerPage && formStylesItemsPerPage > 0
                                                                    ? formStylesItemsPerPage
                                                                    : defaultFields.length;
                                                                return defaultFields
                                                                    .slice(0, itemsToShow)
                                                                    .map((field, fieldIndex) => (
                                                                        field.type === 'radio' ? (
                                                                            <div key={fieldIndex} className="form-field-preview">
                                                                                <label className='control-label-left field-label' style={{
                                                                                    color: themeColors.text,
                                                                                    fontSize: getTextFieldSize().fontSize,
                                                                                }}>
                                                                                    {field.label}
                                                                                </label>
                                                                                <div className="field-radio-group">
                                                                                    {field.options.map((option, optIndex) => (
                                                                                        <label key={optIndex} className='control-label-left field-radio-label'>
                                                                                            <input
                                                                                                type="radio"
                                                                                                name={`preview-gender-${fieldIndex}`}
                                                                                                disabled
                                                                                                checked={optIndex === 0}
                                                                                                style={{ cursor: 'not-allowed', accentColor: themeColors.accent }}
                                                                                            />
                                                                                            <span style={{ color: themeColors.text }}>{option}</span>
                                                                                        </label>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        ) : field.type === 'checkbox' ? (
                                                                            <div key={fieldIndex} className="form-field-preview">
                                                                                <RSCheckbox
                                                                                    name={`preview-checkbox-${fieldIndex}`}
                                                                                    labelName={field.label}
                                                                                    control={control}
                                                                                    disabled={true}
                                                                                    labelStyle={{
                                                                                        color: themeColors.text,
                                                                                        fontSize: getTextFieldSize().fontSize,
                                                                                        fontWeight: '400',
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        ) : (
                                                                            <div key={fieldIndex} className="form-field-preview">
                                                                                <label className='control-label-left field-label' style={{
                                                                                    color: themeColors.text,
                                                                                    fontSize: getTextFieldSize().fontSize,
                                                                                }}>
                                                                                    {field.label}
                                                                                </label>
                                                                                <input
                                                                                    type={field.type}
                                                                                    placeholder={field.placeholder}
                                                                                    className="field-input"
                                                                                    style={{
                                                                                        width: '100%',
                                                                                        ...getTextFieldSize(),
                                                                                        ...getInputStyle(),
                                                                                        backgroundColor: themeColors.textField02 || '#ffffff',
                                                                                        color: themeColors.textField01 || themeColors.text,
                                                                                    }}
                                                                                    disabled
                                                                                />
                                                                            </div>
                                                                        )
                                                                    ));
                                                            })()}
                                                        </>
                                                    )}

                                                    {/* Submit/Next Button Preview */}
                                                    {formStylesPaginationEnabled ? (
                                                        <div>
                                                            <button
                                                                className={`form-submit-button align-${layoutAlignment}`}
                                                                style={{
                                                                    backgroundColor: themeColors.accent,
                                                                    ...buttonRoundingStyle,
                                                                    fontSize: getTextFieldSize().fontSize,
                                                                }}
                                                                disabled
                                                            >
                                                                {(() => {
                                                                    const paginationOption = paginationOptions.find(opt => opt.value === paginationValue);
                                                                    return paginationOption ? paginationOption.text : 'Next';
                                                                })()}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <button
                                                                className={`form-submit-button align-${layoutAlignment}`}
                                                                style={{
                                                                    backgroundColor: themeColors.accent,
                                                                    ...buttonRoundingStyle,
                                                                    fontSize: getTextFieldSize().fontSize,
                                                                }}
                                                                disabled
                                                            >
                                                                Submit
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                        <Col
                            sm={4}
                            className="css-scrollbar"
                            style={{ maxHeight: '100%', overflowY: 'auto' }}
                        >
                            <div>
                                <Accordion activeKey={activeAccordions} alwaysOpen>
                                    {/* Color Theme Section */}
                                    <Accordion.Item eventKey="theme">
                                        <Accordion.Header onClick={() => handleAccordionToggle('theme')}>
                                            <h4 className="mb0" >Color themes</h4>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <div className="form-group mb0">

                                                {editingTheme ? (
                                                    <div className="color-editor-inline">
                                                        <div className="editor-header">
                                                            <h6>{editingTheme === 'new' ? 'Add Theme' : `Edit Theme - ${allThemes[editingTheme]?.name}`}</h6>
                                                        </div>

                                                        {[
                                                            { label: 'Background', key: 'background' },
                                                            { label: 'Form background', key: 'formBackground' },
                                                            { label: 'Primary', key: 'primary' },
                                                            { label: 'Text field 01', key: 'textField01' },
                                                            { label: 'Text field 02', key: 'textField02' }
                                                        ].map((item) => (
                                                            <div className="editor-row" key={item.key}>
                                                                <label className='control-label-left'>{item.label}</label>
                                                                <div className="color-controls">
                                                                    <div className="color-preview-box" style={{ backgroundColor: colorCustomization[item.key] }}></div>
                                                                    <div className="rs-builder-colorpicker-container">
                                                                        <RSColorPicker
                                                                            icon={COLOR_PICKER}
                                                                            onSelect={(color) => setColorCustomization(prev => ({ ...prev, [item.key]: color }))}
                                                                            colorValue={colorCustomization[item.key]}
                                                                            tooltipText={`${item.label} color`}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}

                                                        <div className="editor-actions">
                                                            <RSSecondaryButton onClick={handleCancelColorCustomization} size="small" className="mr-2">
                                                                {CANCEL}
                                                            </RSSecondaryButton>
                                                            <RSPrimaryButton onClick={handleSaveColorCustomization} size="small">
                                                                {SAVE}
                                                            </RSPrimaryButton>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className='form-group mb21'>
                                                            <Row>
                                                                <Col md={10}>
                                                                    <div className="theme-search-wrapper">
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Search"
                                                                            value={themeSearch}
                                                                            onChange={(e) => setThemeSearch(e.target.value)}
                                                                            className="theme-search-input"
                                                                        />
                                                                        <i className={`${circle_zoom_fill_medium} icon-md color-primary-grey theme-search-icon`} />
                                                                    </div>
                                                                </Col>
                                                                <Col md={2} className='d-flex align-items-md-end'>
                                                                    <RSTooltip position='top' text='Create new theme'>
                                                                        <i className={`${circle_plus_fill_edge_medium} icon-md color-primary-blue`} onClick={handleAddTheme}></i>
                                                                    </RSTooltip>
                                                                </Col>
                                                            </Row>
                                                        </div>
                                                        <div className="theme-grid">
                                                            {filteredThemes.map(([key, theme]) => (
                                                                <div
                                                                    key={key}
                                                                    onClick={() => handleThemeSelect(key)}
                                                                    className={`theme-card ${themeValue === key ? 'selected' : ''}`}
                                                                    style={{
                                                                        backgroundColor: theme.background,
                                                                        color: theme.text,
                                                                    }}
                                                                >
                                                                    <div className="theme-card-header">
                                                                        <small className='theme-name fs13'>{theme.name}</small>
                                                                        <button
                                                                            onClick={(e) => handleEditTheme(key, e)}
                                                                            className="theme-edit-btn"
                                                                        >
                                                                            Edit
                                                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                                            </svg>
                                                                        </button>
                                                                    </div>

                                                                    {/* Theme Preview Elements */}
                                                                    <div className="theme-card-preview">
                                                                        <div className="preview-input" style={{ backgroundColor: theme.formBackground || '#fff' }}>
                                                                            <div className="preview-line"></div>
                                                                        </div>
                                                                        <div className="preview-button" style={{ backgroundColor: theme.accent }}></div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </Accordion.Body>
                                    </Accordion.Item>

                                    {/* Font Section */}
                                    <Accordion.Item eventKey="font">
                                        <Accordion.Header onClick={() => handleAccordionToggle('font')}>
                                            <h4 className="mb0">Font</h4>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <div className="form-group mb0">
                                                <RSKendoDropDownList
                                                    control={control}
                                                    name="formStyles.font"
                                                    data={fontOptions}
                                                    textField="text"
                                                    dataItemKey="value"
                                                    defaultValue={getOptionByValue(fontOptions, fontValue || 'default')}
                                                    placeholder="Select font"
                                                    handleChange={(e) => {
                                                        const selectedItem = e?.value;
                                                        if (selectedItem) {
                                                            setValue('formStyles.font', selectedItem, { shouldValidate: true, shouldDirty: true });
                                                            notifyStyleChange('font', { font: selectedItem });
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </Accordion.Body>
                                    </Accordion.Item>

                                    {/* Logo Section */}
                                    <Accordion.Item eventKey="logo">
                                        <Accordion.Header onClick={() => handleAccordionToggle('logo')}>
                                            <h4 className="mb0">Logo</h4>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <div className="form-group mb0">
                                                <div className="mb15" style={{ display: 'flex', alignItems: 'center' }}>
                                                    <label className='control-label-left mr15'>Show logo</label>
                                                    <RSSwitch
                                                        control={control}
                                                        name="formStyles.logoEnabled"
                                                        handleChange={(value) => {
                                                            notifyStyleChange('logo', { logoEnabled: value });
                                                        }}
                                                    />
                                                </div>

                                                {/* Header Alignment Controls in Logo Section - Logo Position */}
                                                {logoEnabled && (
                                                    <div style={{ marginBottom: '15px' }}>
                                                        <h6 style={{ fontSize: '14px', fontWeight: '500', color: '#333', marginBottom: '8px' }}>Header Alignment</h6>
                                                        <div className="segmented-control">
                                                            {['left', 'right', 'center'].map((align) => (
                                                                <button
                                                                    key={align}
                                                                    onClick={() => {
                                                                        setLogoPositionAlignment(align);
                                                                        // Update form value immediately so FormGenerator.jsx can sync
                                                                        setValue('headerConfig.alignment', align, { shouldValidate: true, shouldDirty: true });
                                                                        notifyStyleChange('logo', { logoAlignment: align });
                                                                    }}
                                                                    className={`segment-btn ${logoPositionAlignment === align ? 'active' : ''}`}
                                                                >
                                                                    {align.charAt(0).toUpperCase() + align.slice(1)}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Logo upload and note - only shown when logo is enabled */}
                                                {logoEnabled && (
                                                    <>
                                                        {/* Check if CustomHeader component exists in form */}
                                                        {formGeneratorData && Array.isArray(formGeneratorData) && formGeneratorData.some(item => item?.columnType === 'CustomHeader') && (
                                                            <div className="warning-message">
                                                                <strong>Note:</strong> If you enable the custom header component, it will take priority and be displayed in the published form.
                                                            </div>
                                                        )}
                                                        <div style={{ marginBottom: '15px' }}>
                                                            <div className="logo-upload-area mt10" onClick={handleLogoBrowseClick}>
                                                                {headerConfigLogo ? (
                                                                    <div>
                                                                        <img
                                                                            src={headerConfigLogo}
                                                                            alt="Current logo"
                                                                            className="upload-preview-image"
                                                                            onError={(e) => {
                                                                                e.target.style.display = 'none';
                                                                            }}
                                                                        />
                                                                        <small className="upload-text">
                                                                            Click to change logo
                                                                        </small>
                                                                    </div>
                                                                ) : (
                                                                    <div>
                                                                        <small className="upload-text">
                                                                            Click to upload logo
                                                                        </small>
                                                                        <small className="upload-hint">
                                                                            Supported formats: PNG, JPG, JPEG, SVG (Max 5MB)
                                                                        </small>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <input
                                                                type="file"
                                                                id="logoUploadFileInput"
                                                                accept=".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml"
                                                                style={{ display: 'none' }}
                                                                onChange={handleLogoFileInputChange}
                                                                disabled={logoUploading}
                                                            />
                                                            {logoUploadError && (
                                                                <div className="upload-error-message">
                                                                    {logoUploadError}
                                                                </div>
                                                            )}
                                                            {logoUploading && (
                                                                <div className="upload-loading-message">
                                                                    Uploading...
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="editor-actions">
                                                            {headerConfigLogo && (
                                                                <RSSecondaryButton
                                                                    onClick={() => {
                                                                        setValue('headerConfig.logo', '', { shouldValidate: true, shouldDirty: true });
                                                                        setLogoUploadModal(false);
                                                                        setLogoUploadError('');
                                                                        notifyStyleChange('logo', { logo: '' });
                                                                    }}
                                                                    disabled={logoUploading}
                                                                    size="small"
                                                                >
                                                                    Remove Logo
                                                                </RSSecondaryButton>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </Accordion.Body>
                                    </Accordion.Item>

                                    {/* Style Section */}
                                    <Accordion.Item eventKey="style">
                                        <Accordion.Header onClick={() => handleAccordionToggle('style')}>
                                            <h4 className="mb0">Style</h4>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            {/* Style selection - always visible */}
                                            <div>
                                                <h6 style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '12px' }}>Style</h6>
                                                <div className="segmented-control" style={{ marginBottom: '15px' }}>
                                                    {['style1', 'style2', 'style3'].map((style) => (
                                                        <button
                                                            key={style}
                                                            onClick={() => handleStyleChange(style)}
                                                            className={`segment-btn ${logoStyle === style ? 'active' : ''}`}
                                                        >
                                                            {/* Style 1 Icon: Layered/Framed */}
                                                            {style === 'style1' && (
                                                                <div style={{ position: 'relative', width: '24px', height: '20px', margin: '0 auto' }}>
                                                                    <div style={{
                                                                        position: 'absolute',
                                                                        top: '2px',
                                                                        left: '50%',
                                                                        transform: 'translateX(-50%)',
                                                                        width: '18px',
                                                                        height: '10px',
                                                                        backgroundColor: 'currentColor',
                                                                        borderRadius: '2px',
                                                                        opacity: 0.6
                                                                    }}></div>
                                                                    <div style={{
                                                                        position: 'absolute',
                                                                        bottom: '2px',
                                                                        left: '50%',
                                                                        transform: 'translateX(-50%)',
                                                                        width: '12px',
                                                                        height: '10px',
                                                                        backgroundColor: 'currentColor',
                                                                        borderRadius: '2px',
                                                                        opacity: 0.4
                                                                    }}></div>
                                                                </div>
                                                            )}

                                                            {/* Style 2 Icon: Image/Mountain */}
                                                            {style === 'style2' && (
                                                                <div style={{
                                                                    width: '24px',
                                                                    height: '20px',
                                                                    border: '1px solid currentColor',
                                                                    borderRadius: '3px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    margin: '0 auto',
                                                                    opacity: 0.6
                                                                }}>
                                                                    <svg width="12" height="10" viewBox="0 0 12 10" fill="currentColor" opacity="0.6">
                                                                        <path d="M6 2L8 5H7L6 3.5L5 5H4L6 2Z" />
                                                                        <path d="M4 5L6 3.5L8 5H6L4 5Z" />
                                                                    </svg>
                                                                </div>
                                                            )}

                                                            {/* Style 3 Icon: Solid block */}
                                                            {style === 'style3' && (
                                                                <div style={{
                                                                    width: '24px',
                                                                    height: '20px',
                                                                    backgroundColor: 'currentColor',
                                                                    borderRadius: '3px',
                                                                    margin: '0 auto',
                                                                    opacity: 0.6
                                                                }}></div>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Style-specific configuration buttons */}
                                                {logoStyle === 'style1' && (
                                                    <div className="style-section-controls">
                                                        {/* Color Selection for Style 1 */}
                                                        <div className="style-control-group">
                                                            <h6 className="control-label">Header Colors</h6>

                                                            {/* Background Color */}
                                                            <div className="color-control-row">
                                                                <label className='control-label-left'>Background Color</label>
                                                                <div className="color-display">
                                                                    <div className="color-swatch" style={{ backgroundColor: headerConfigBackgroundColor || '#1a237e' }}></div>
                                                                    <div className="rs-builder-colorpicker-container">
                                                                        <RSColorPicker
                                                                            icon={COLOR_PICKER}
                                                                            onSelect={(color) => {
                                                                                setValue('headerConfig.backgroundColor', color, { shouldValidate: true, shouldDirty: true });
                                                                                notifyStyleChange('style', { logoBackgroundColor: color });
                                                                            }}
                                                                            colorValue={headerConfigBackgroundColor || '#1a237e'}
                                                                            tooltipText="Header background color"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Header Alignment Controls - Layout Position */}
                                                        <div className="style-control-group">
                                                            <h6 className="control-label">Header Alignment</h6>
                                                            <div className="segmented-control">
                                                                {['top', 'left', 'right'].map((align) => (
                                                                    <button
                                                                        key={align}
                                                                        onClick={() => {
                                                                            setHeaderAlignment(align);
                                                                            notifyStyleChange('style', { headerAlignment: align });
                                                                        }}
                                                                        className={`segment-btn ${headerAlignment === align ? 'active' : ''}`}
                                                                    >
                                                                        {align.charAt(0).toUpperCase() + align.slice(1)}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="style-control-group">
                                                            <h6 className="control-label">Header Background Image</h6>
                                                            <div className="logo-upload-area" onClick={handleHeaderBgBrowseClick}>
                                                                {headerConfigBackgroundImage ? (
                                                                    <div>
                                                                        <img
                                                                            src={headerConfigBackgroundImage}
                                                                            alt="Current header background"
                                                                            className="upload-preview-image"
                                                                            onError={(e) => {
                                                                                e.target.style.display = 'none';
                                                                            }}
                                                                        />
                                                                        <p className="upload-text">
                                                                            Click to change header background
                                                                        </p>
                                                                    </div>
                                                                ) : (
                                                                    <div>
                                                                        <p className="upload-text">
                                                                            Click to upload header background
                                                                        </p>
                                                                        <p className="upload-hint">
                                                                            Supported formats: PNG, JPG, JPEG, SVG (Max 5MB)
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <input
                                                                type="file"
                                                                id="headerBgUploadFileInput"
                                                                accept=".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml"
                                                                style={{ display: 'none' }}
                                                                onChange={handleHeaderBgFileInputChange}
                                                                disabled={headerBgUploading}
                                                            />
                                                            {headerBgUploadError && (
                                                                <div className="upload-error-message">
                                                                    {headerBgUploadError}
                                                                </div>
                                                            )}
                                                            {headerBgUploading && (
                                                                <div className="upload-loading-message">
                                                                    Uploading...
                                                                </div>
                                                            )}
                                                            {headerConfigBackgroundImage && (
                                                                <div className="editor-actions" style={{ marginTop: '10px' }}>
                                                                    <RSSecondaryButton
                                                                        onClick={() => {
                                                                            setValue('headerConfig.backgroundImage', '', { shouldValidate: true, shouldDirty: true });
                                                                            setHeaderBgUploadError('');
                                                                            notifyStyleChange('style', { headerBackgroundImage: '' });
                                                                        }}
                                                                        disabled={headerBgUploading}
                                                                        size="small"
                                                                    >
                                                                        Remove Background
                                                                    </RSSecondaryButton>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Background Image Alignment controls for Style 1 */}
                                                        {headerConfigBackgroundImage && (
                                                            <div className="style-control-group">
                                                                <h6 className="control-label">Background Image Alignment</h6>
                                                                <div className="segmented-control">
                                                                    {['left', 'right', 'top', 'center'].map((align) => (
                                                                        <button
                                                                            key={align}
                                                                            onClick={() => {
                                                                                setHeaderBgAlignment(align);
                                                                                notifyStyleChange('style', { headerBgAlignment: align });
                                                                            }}
                                                                            className={`segment-btn ${headerBgAlignment === align ? 'active' : ''}`}
                                                                        >
                                                                            {align.charAt(0).toUpperCase() + align.slice(1)}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {logoStyle === 'style2' && (
                                                    <div className="style-section-controls">
                                                        <div className="style-control-group">
                                                            <h6 className="control-label">Form Background Image</h6>
                                                            <div className="logo-upload-area" onClick={handleFormBgBrowseClick}>
                                                                {formStylesFormBackgroundImage ? (
                                                                    <div>
                                                                        <img
                                                                            src={formStylesFormBackgroundImage}
                                                                            alt="Current form background"
                                                                            className="upload-preview-image"
                                                                            onError={(e) => {
                                                                                e.target.style.display = 'none';
                                                                            }}
                                                                        />
                                                                        <p className="upload-text">
                                                                            Click to change form background
                                                                        </p>
                                                                    </div>
                                                                ) : (
                                                                    <div>
                                                                        <p className="upload-text">
                                                                            Click to upload form background
                                                                        </p>
                                                                        <p className="upload-hint">
                                                                            Supported formats: PNG, JPG, JPEG, SVG (Max 5MB)
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <input
                                                                type="file"
                                                                id="formBgUploadFileInput"
                                                                accept=".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml"
                                                                style={{ display: 'none' }}
                                                                onChange={handleFormBgFileInputChange}
                                                                disabled={formBgUploading}
                                                            />
                                                            {formBgUploadError && (
                                                                <div className="upload-error-message">
                                                                    {formBgUploadError}
                                                                </div>
                                                            )}
                                                            {formBgUploading && (
                                                                <div className="upload-loading-message">
                                                                    Uploading...
                                                                </div>
                                                            )}
                                                            {formStylesFormBackgroundImage && (
                                                                <div className="editor-actions" style={{ marginTop: '10px' }}>
                                                                    <RSSecondaryButton
                                                                        onClick={() => {
                                                                            setValue('formStyles.formBackgroundImage', '', { shouldValidate: true, shouldDirty: true });
                                                                            setFormBgUploadError('');
                                                                            notifyStyleChange('style', { formBackgroundImage: '' });
                                                                        }}
                                                                        disabled={formBgUploading}
                                                                        size="small"
                                                                    >
                                                                        Remove Background
                                                                    </RSSecondaryButton>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {logoStyle === 'style3' && (
                                                    <div className="style-info-message">
                                                        No background image configured for this style.
                                                    </div>
                                                )}
                                            </div>
                                        </Accordion.Body>
                                    </Accordion.Item>

                                    {/* Form Background Section */}
                                    <Accordion.Item eventKey="formBackground">
                                        <Accordion.Header onClick={() => handleAccordionToggle('formBackground')}>
                                            <h4 className="mb0">Form content background</h4>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <div className="form-group mb0">
                                                <div className="mb15" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <label className='control-label-left'>Form content background</label>
                                                    <RSSwitch
                                                        control={control}
                                                        name="formStyles.formBackgroundEnabled"
                                                        handleChange={(value) => {
                                                            notifyStyleChange('style', { formBackgroundEnabled: value });
                                                        }}
                                                    />
                                                </div>
                                                {formStylesFormBackgroundEnabled && (
                                                    <FormStyleBackground />
                                                )}
                                            </div>
                                        </Accordion.Body>
                                    </Accordion.Item>

                                    {/* Text Field 01 Section */}
                                    <Accordion.Item eventKey="textField">
                                        <Accordion.Header onClick={() => handleAccordionToggle('textField')}>
                                            <h4 className="mb0">Text Field 01</h4>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <div className="form-group mb0">
                                                <div className="segmented-control">
                                                    {['small', 'normal', 'large'].map((size) => (
                                                        <button
                                                            key={size}
                                                            onClick={() => {
                                                                setValue('formStyles.textFieldSize', size, { shouldValidate: true, shouldDirty: true });
                                                                notifyStyleChange('textField', { textFieldSize: size });
                                                            }}
                                                            className={`segment-btn ${textFieldSize === size ? 'active' : ''}`}
                                                        >
                                                            {size.charAt(0).toUpperCase() + size.slice(1)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </Accordion.Body>
                                    </Accordion.Item>

                                    {/* Inputs (Style) Section */}
                                    <Accordion.Item eventKey="inputStyle">
                                        <Accordion.Header onClick={() => handleAccordionToggle('inputStyle')}>
                                            <h4 className="mb0">Inputs (Style)</h4>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <div className="form-group mb0">
                                                <div className="segmented-control">
                                                    {['default', 'line', 'rounded'].map((style) => (
                                                        <button
                                                            key={style}
                                                            onClick={() => {
                                                                setValue('formStyles.inputStyle', style, { shouldValidate: true, shouldDirty: true });
                                                                notifyStyleChange('inputStyle', { inputStyle: style });
                                                            }}
                                                            className={`segment-btn ${inputStyle === style ? 'active' : ''}`}
                                                        >
                                                            {/* Icon CSS Shapes */}
                                                            <div style={{
                                                                width: '24px',
                                                                height: '16px',
                                                                border: style === 'line' ? 'none' : '1.5px solid currentColor',
                                                                borderBottom: style === 'line' ? '2px solid currentColor' : '1.5px solid currentColor',
                                                                borderRadius: style === 'rounded' ? '10px' : style === 'default' ? '3px' : '0',
                                                                opacity: 0.6,
                                                                margin: '0 auto 4px'
                                                            }}></div>
                                                            <span style={{ fontSize: '11px' }}>{style.charAt(0).toUpperCase() + style.slice(1)}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </Accordion.Body>
                                    </Accordion.Item>

                                    {/* Button (Rounding) Section */}
                                    <Accordion.Item eventKey="button">
                                        <Accordion.Header onClick={() => handleAccordionToggle('button')}>
                                            <h4 className="mb0">Button (Rounding)</h4>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <div className="form-group mb0">
                                                <div className="segmented-control">
                                                    {['default', 'full', 'none'].map((rounding) => (
                                                        <button
                                                            key={rounding}
                                                            onClick={() => {
                                                                setValue('formStyles.buttonRounding', rounding, { shouldValidate: true, shouldDirty: true });
                                                                notifyStyleChange('button', { buttonRounding: rounding });
                                                            }}
                                                            className={`segment-btn ${buttonRounding === rounding ? 'active' : ''}`}
                                                        >
                                                            {/* Icon CSS Shapes */}
                                                            <div style={{
                                                                width: '28px',
                                                                height: '16px',
                                                                backgroundColor: 'currentColor',
                                                                borderRadius: rounding === 'full' ? '12px' : rounding === 'default' ? '4px' : '0',
                                                                opacity: 0.6,
                                                                margin: '0 auto 4px'
                                                            }}></div>
                                                            <span style={{ fontSize: '11px' }}>{rounding.charAt(0).toUpperCase() + rounding.slice(1)}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </Accordion.Body>
                                    </Accordion.Item>

                                    {/* Layout (Alignment) Section */}
                                    <Accordion.Item eventKey="layout">
                                        <Accordion.Header onClick={() => handleAccordionToggle('layout')}>
                                            <h4 className="mb0">Layout (Alignment)</h4>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <div className="form-group mb0">
                                                <div className="segmented-control">
                                                    {['left', 'center', 'right'].map((align) => (
                                                        <button
                                                            key={align}
                                                            onClick={() => {
                                                                setValue('formStyles.layoutAlignment', align, { shouldValidate: true, shouldDirty: true });
                                                                notifyStyleChange('layout', { layoutAlignment: align });
                                                            }}
                                                            className={`segment-btn ${layoutAlignment === align ? 'active' : ''}`}
                                                        >
                                                            {align.charAt(0).toUpperCase() + align.slice(1)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </Accordion.Body>
                                    </Accordion.Item>

                                    {/* Pagination Section */}
                                    <Accordion.Item eventKey="pagination">
                                        <Accordion.Header onClick={() => handleAccordionToggle('pagination')}>
                                            <h4 className="mb0">Pagination</h4>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <div className="form-group mb0">
                                                <div className="mb15" style={{ display: 'flex', alignItems: 'center' }}>
                                                    <RSSwitch
                                                        control={control}
                                                        name="formStyles.paginationEnabled"
                                                        handleChange={(value) => {
                                                            notifyStyleChange('pagination', { paginationEnabled: value });
                                                        }}
                                                    />
                                                </div>
                                                {formStylesPaginationEnabled && (
                                                    <>
                                                        {/* Item Per Page Section */}
                                                        <div className="form-group">
                                                            <RSKendoDropDownList
                                                                control={control}
                                                                name="formStyles.itemsPerPage"
                                                                data={itemsPerPageOptions}
                                                                textField="text"
                                                                dataItemKey="value"
                                                                defaultValue={getOptionByValue(itemsPerPageOptions, formStylesItemsPerPage || 5)}
                                                                label="Select items per page"
                                                                handleChange={handleItemsPerPageChange}
                                                            />
                                                        </div>

                                                        {/* Pagination Type Dropdown */}
                                                        <div className="form-group">
                                                            <RSKendoDropDownList
                                                                control={control}
                                                                name="formStyles.pagination"
                                                                data={paginationOptions}
                                                                textField="text"
                                                                dataItemKey="value"
                                                                defaultValue={getOptionByValue(paginationOptions, paginationValue)}
                                                                label="Select pagination type"
                                                                handleChange={handlePaginationChange}
                                                            />
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                            </div>
                        </Col>
                    </Row>
                </div >
            }
            footer={
                <>
                    <RSSecondaryButton onClick={onHide}>
                        {CANCEL}
                    </RSSecondaryButton>
                    <RSPrimaryButton
                        className={`${formStylesPaginationEnabled && (!formStylesItemsPerPage || formStylesItemsPerPage < 1)
                            ? 'click-off'
                            : ''
                            }`}
                        onClick={onSave}
                    >
                        {SAVE}
                    </RSPrimaryButton>
                </>
            }
        />
    );
};

export const FormStyles = memo(FormStylesComponent);
