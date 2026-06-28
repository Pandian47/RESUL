import { CANCEL, RENAME, SAVE, SAVE_NAME } from 'Constants/GlobalConstant/Placeholders';
import { circle_plus_fill_edge_medium, circle_zoom_fill_medium, editor_align_center_medium, editor_align_left_medium, editor_align_right_medium, pencil_edit_medium, pencil_edit_mini } from 'Constants/GlobalConstant/Glyphicons';
import { cloneElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import RSSwitch from 'Components/FormFields/RSSwitch';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSInput from 'Components/FormFields/RSInput';
import RSRadioButton from 'Components/FormFields/RSRadioButton';
import { Col, Row } from 'react-bootstrap';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSColorPicker from 'Components/ColorPicker';
import { COLOR_PICKER } from '../../constant';
import RSTooltip from 'Components/RSTooltip';
import FormStyleHeader from './FormStyleHeader';
import FormStyleBackground from './FormStyleBackground';
import { ThemeSkeleton } from 'Components/Skeleton/Components/SkeletonOverall';

const FormSidebar = ({ show, onHide, tag = '', formGenerationColumn }) => {
    const {
        control,
        watch,
        setValue,
        getValues,
        formState: { errors },
    } = useFormContext();

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
    const [headerBgAlignment, setHeaderBgAlignment] = useState('top'); // 'left', 'right', 'top', 'center' - for background image
    const [headerAlignment, setHeaderAlignment] = useState('top'); // 'left', 'right', 'top' - for header layout position (Style section)
    const [logoPositionAlignment, setLogoPositionAlignment] = useState('center'); // 'left', 'right', 'center' - for logo position within header (Logo section)
    const [isThemeNameEditable, setIsThemeNameEditable] = useState(false);
    const [themeName, setThemeName] = useState('');
    const hasInitialized = useRef(false);
    const previousFormGenerationColumn = useRef(null);
    const previousFontSize = useRef(17);

    const [
        formStylesTheme,
        formStylesPagination,
        formStylesPaginationEnabled,
        formStylesItemsPerPage,
        formStylesTextFieldSize,
        formStylesFont,
        formStylesFontSize,
        formStylesFontColor,
        formStylesFontEnabled,
        formStylesThemeEnabled,
        formStylesLogoEnabled,
        formStylesLogoStyle,
        formStylesInputStyle,
        formStylesButtonRounding,
        formStylesButtonAlignment,
        formStylesButtonEnabled,
        formStylesLayoutAlignment,
        formStylesFormLayout,
        headerConfigLogo,
        headerConfigName,
        headerConfigBackgroundColor,
        headerConfigColor,
        headerConfigBackgroundImage,
        headerConfigFontSize,
        headerConfigFontFamily,
        formStylesFormBackgroundImage,
        formStylesFormBackgroundEnabled,
        formGeneratorData,
        progressiveProfilingEnabled,
    ] = watch([
        'formStyles.theme',
        'formStyles.pagination',
        'formStyles.paginationEnabled',
        'formStyles.itemsPerPage',
        'formStyles.textFieldSize',
        'formStyles.font',
        'formStyles.fontSize',
        'formStyles.fontColor',
        'formStyles.fontEnabled',
        'formStyles.themeEnabled',
        'formStyles.logoEnabled',
        'formStyles.logoStyle',
        'formStyles.inputStyle',
        'formStyles.buttonRounding',
        'formStyles.buttonAlignment',
        'formStyles.buttonEnabled',
        'formStyles.layoutAlignment',
        'formStyles.formLayout',
        'headerConfig.logo',
        'headerConfig.name',
        'headerConfig.backgroundColor',
        'headerConfig.color',
        'headerConfig.backgroundImage',
        'headerConfig.headerFontSize',
        'headerConfig.headerFontFamily',
        'formStyles.formBackgroundImage',
        'formStyles.formBackgroundEnabled',
        'formGenerator',
        'progressiveProfiling',
    ]);

    // Extract string values from objects (for display)
    const getStringValue = (value, defaultValue) => {
        if (typeof value === 'object' && value !== null && value.value) {
            return value.value;
        }
        return value || defaultValue;
    };

    const themeValue = getStringValue(formStylesTheme?.value || formStylesTheme, 'light');
    const paginationValue = getStringValue(formStylesPagination, 'next');
    const textFieldSize = getStringValue(formStylesTextFieldSize, 'normal');
    const fontValue = getStringValue(formStylesFont, 'default');
    const fontSize = formStylesFontSize || 17;
    const fontColor = formStylesFontColor || '#000000';
    const logoEnabled = formStylesLogoEnabled !== undefined ? formStylesLogoEnabled : false;
    const logoStyle = getStringValue(formStylesLogoStyle, 'style3');
    const inputStyle = getStringValue(formStylesInputStyle, 'default');
    const buttonRounding = getStringValue(formStylesButtonRounding, 'default');
    const buttonAlignment = getStringValue(formStylesButtonAlignment, 'center');
    const layoutAlignment = getStringValue(formStylesLayoutAlignment, 'left');
    const formLayout = getStringValue(formStylesFormLayout, 'horizontal');

    // Theme definitions matching the image - memoized to prevent re-creation
    const themeDefinitions = useMemo(() => ({
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
            formBackground: '#f8f9fa',
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
            formBackground: '#f5f5dc',
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
    }), []);

    // Merge custom themes with base themes - memoized to prevent re-creation
    const allThemes = useMemo(() => ({ ...themeDefinitions, ...customThemes }), [themeDefinitions, customThemes]);

    // Get theme colors - memoized to prevent re-creation
    const themeColors = useMemo(() => {
        // If formStylesTheme is already a theme object with colors, use it
        // Handle both formats: direct (background, formBackground) and saved format (backgroundColor, formBackGroundColor)
        if (typeof formStylesTheme === 'object' && (formStylesTheme?.background || formStylesTheme?.backgroundColor)) {
            return {
                background: formStylesTheme.background || formStylesTheme.backgroundColor || '#ffffff',
                text: formStylesTheme.text || formStylesTheme.textField01 || formStylesTheme.textColor || '#333333',
                accent: formStylesTheme.accent || formStylesTheme.primaryColor || '#007bff',
                border: formStylesTheme.border || formStylesTheme.textField02 || formStylesTheme.textBackgroundColor || '#e0e0e0',
                formBackground: formStylesTheme.formBackground || formStylesTheme.formBackGroundColor || formStylesTheme.background || formStylesTheme.backgroundColor || '#ffffff',
                textField01: formStylesTheme.textField01 || formStylesTheme.textColor || formStylesTheme.text || '#333333',
                textField02: formStylesTheme.textField02 || formStylesTheme.textBackgroundColor || formStylesTheme.border || '#e0e0e0',
            };
        }
        return allThemes[themeValue] || themeDefinitions.light;
    }, [formStylesTheme, allThemes, themeValue, themeDefinitions]);

    // Helper function to normalize theme objects - ensures all color properties are present
    const normalizeTheme = useCallback((theme) => {
        if (!theme) return null;

        const bg = theme.background || theme.backgroundColor || '#ffffff';
        const formBg = theme.formBackground || theme.formBackGroundColor || bg;
        const accent = theme.accent || theme.primaryColor || '#007bff';
        const text = theme.text || theme.textField01 || theme.textColor || '#333333';
        const border = theme.border || theme.textField02 || theme.textBackgroundColor || '#e0e0e0';

        return {
            ...theme,
            background: bg,
            backgroundColor: bg,
            formBackground: formBg,
            formBackGroundColor: formBg,
            accent: accent,
            primaryColor: accent,
            text: text,
            textColor: text,
            textField01: text,
            border: border,
            textBackgroundColor: border,
            textField02: border,
        };
    }, []);

    // Convert opacity (0-1) to 2-digit hex
    const opacityToHex = (opacity) => {
        const alpha = Math.round(opacity * 255);
        return alpha.toString(16).padStart(2, '0').toUpperCase();
    };

    // Font options with fontFamily for styling
    const fontOptions = [
        { text: 'MuktaRegular', value: 'muktaregular', fontFamily: 'MuktaRegular,sans-serif' },
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

    // Custom item renderer for font family dropdown - shows each font in its own style
    const fontItemRender = (li, itemProps) => {
        const { dataItem } = itemProps;
        const itemChildren = (
            <span className='w-100' style={{ fontFamily: dataItem?.fontFamily }}>
                {dataItem?.text}
            </span>
        );
        return cloneElement(li, li.props, itemChildren);
    };

    // Custom value renderer for font family dropdown - shows selected font in its own style
    const fontValueRender = (element, value) => {
        if (!value) return element;
        const fontFamily = value?.fontFamily || 'inherit';
        return (
            <span className='w-100' >
                {value?.text || ''}
            </span>
        );
    };

    // Pagination options
    const paginationOptions = [
        { text: 'Previous & Next', value: 'next' },
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

    useEffect(() => {
        // Reset hasInitialized if formGenerationColumn data has changed (e.g., switching between forms or create/edit mode)
        const currentColumnStr = JSON.stringify(formGenerationColumn);
        if (previousFormGenerationColumn.current !== currentColumnStr) {
            hasInitialized.current = false;
            previousFormGenerationColumn.current = currentColumnStr;
        }

        if (hasInitialized.current) return; // Prevent multiple runs

        if (Array.isArray(formGenerationColumn) && formGenerationColumn.length > 0) {
            hasInitialized.current = true;
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
                // Load custom themes FIRST - they need to be available for theme lookup
                let parsedCustomThemes = {};
                if (parsed?.customThemes && typeof parsed.customThemes === 'object') {
                    parsedCustomThemes = parsed.customThemes;
                    setCustomThemes(parsedCustomThemes);
                }

                // Merge custom themes with base themes for lookup
                const availableThemes = { ...themeDefinitions, ...parsedCustomThemes };

                // Load theme - handle both new format (theme object) and old format (theme string)
                if (parsed?.theme) {
                    if (typeof parsed.theme === 'string') {
                        // Old format: theme is a string key
                        const themeObj = availableThemes[parsed.theme] || themeDefinitions.light;
                        setValue('formStyles.theme', { ...themeObj, value: parsed.theme }, { shouldValidate: false });
                    } else if (typeof parsed.theme === 'object') {
                        // New format: theme is an object with colors
                        // Use the value property to identify the theme key
                        const themeKey = parsed.theme.value || parsed.theme.name || 'light';
                        const existingTheme = availableThemes[themeKey] || themeDefinitions.light;
                        const themeData = {
                            ...existingTheme,
                            ...parsed.theme,
                            value: themeKey,
                            background: parsed.theme.backgroundColor || parsed.theme.background || existingTheme.background,
                            formBackground: parsed.theme.formBackGroundColor || parsed.theme.formBackground || existingTheme.formBackground,
                            accent: parsed.theme.primaryColor || parsed.theme.accent || existingTheme.accent,
                            textField02: parsed.theme.textBackgroundColor || parsed.theme.textField02 || existingTheme.textField02,
                            textField01: parsed.theme.textColor || parsed.theme.textField01 || existingTheme.textField01,
                        };
                        setValue('formStyles.theme', themeData, { shouldValidate: false });
                    }
                } else {
                    setValue('formStyles.theme', { ...themeDefinitions.light, value: 'light' }, { shouldValidate: false });
                }

                // Load pagination settings
                setValue('formStyles.paginationEnabled', parsed?.paginationEnabled !== undefined ? parsed.paginationEnabled : false, { shouldValidate: false });
                if (parsed?.pagination) {
                    const paginationValue = typeof parsed.pagination === 'object' ? parsed.pagination.value : parsed.pagination;
                    const pagination = paginationOptions.find((o) => o.value === paginationValue);
                    if (pagination) {
                        setValue('formStyles.pagination', pagination, { shouldValidate: false });
                    } else {
                        setValue('formStyles.pagination', { text: 'Previous & Next', value: 'next' }, { shouldValidate: false });
                    }
                } else {
                    setValue('formStyles.pagination', { text: 'Previous & Next', value: 'next' }, { shouldValidate: false });
                }
                if (parsed?.itemsPerPage != null) {
                    const itemsPerPageValue = typeof parsed.itemsPerPage === 'object' ? parsed.itemsPerPage.value : parsed.itemsPerPage;
                    setValue('formStyles.itemsPerPage', itemsPerPageValue, { shouldValidate: false });
                } else {
                    setValue('formStyles.itemsPerPage', 5, { shouldValidate: false });
                }

                // Load text field size
                if (parsed?.textFieldSize) {
                    setValue('formStyles.textFieldSize', parsed.textFieldSize, { shouldValidate: false });
                } else {
                    setValue('formStyles.textFieldSize', 'normal', { shouldValidate: false });
                }

                // Load font settings
                if (parsed?.font) {
                    const fontVal = typeof parsed.font === 'object' ? parsed.font : getOptionByValue(fontOptions, parsed.font);
                    setValue('formStyles.font', fontVal, { shouldValidate: false });
                } else {
                    setValue('formStyles.font', fontOptions[0], { shouldValidate: false });
                }
                if (parsed?.fontSize !== undefined) {
                    const fontSizeValue = parsed.fontSize > 54 ? 54 : parsed.fontSize;
                    previousFontSize.current = fontSizeValue;
                    setValue('formStyles.fontSize', fontSizeValue, { shouldValidate: false });
                } else {
                    previousFontSize.current = 17;
                    setValue('formStyles.fontSize', 17, { shouldValidate: false });
                }
                if (parsed?.fontColor) {
                    setValue('formStyles.fontColor', parsed.fontColor, { shouldValidate: false });
                } else {
                    setValue('formStyles.fontColor', '#000000', { shouldValidate: false });
                }
                if (parsed?.fontEnabled !== undefined) {
                    setValue('formStyles.fontEnabled', parsed.fontEnabled, { shouldValidate: false });
                } else {
                    // Default to false for all tags including TellAFriend
                    setValue('formStyles.fontEnabled', false, { shouldValidate: false });
                }

                // Load theme enabled setting
                if (parsed?.themeEnabled !== undefined) {
                    setValue('formStyles.themeEnabled', parsed.themeEnabled, { shouldValidate: false });
                } else {
                    setValue('formStyles.themeEnabled', false, { shouldValidate: false });
                }

                // Load logo settings
                if (parsed?.logoEnabled !== undefined) {
                    setValue('formStyles.logoEnabled', parsed.logoEnabled, { shouldValidate: false });
                } else {
                    setValue('formStyles.logoEnabled', false, { shouldValidate: false });
                }
                if (parsed?.logoStyle) {
                    setValue('formStyles.logoStyle', parsed.logoStyle, { shouldValidate: false });
                } else {
                    setValue('formStyles.logoStyle', 'style3', { shouldValidate: false });
                }

                // Load input style
                if (parsed?.inputStyle) {
                    setValue('formStyles.inputStyle', parsed.inputStyle, { shouldValidate: false });
                } else {
                    setValue('formStyles.inputStyle', 'default', { shouldValidate: false });
                }

                // Load button settings
                if (parsed?.buttonEnabled !== undefined) {
                    setValue('formStyles.buttonEnabled', parsed.buttonEnabled, { shouldValidate: false });
                } else {
                    setValue('formStyles.buttonEnabled', false, { shouldValidate: false });
                }
                if (parsed?.buttonRounding) {
                    setValue('formStyles.buttonRounding', parsed.buttonRounding, { shouldValidate: false });
                } else {
                    setValue('formStyles.buttonRounding', 'default', { shouldValidate: false });
                }
                if (parsed?.buttonAlignment) {
                    setValue('formStyles.buttonAlignment', parsed.buttonAlignment, { shouldValidate: false });
                } else {
                    setValue('formStyles.buttonAlignment', 'center', { shouldValidate: false });
                }

                // Load layout settings
                if (parsed?.layoutAlignment) {
                    setValue('formStyles.layoutAlignment', parsed.layoutAlignment, { shouldValidate: false });
                } else {
                    setValue('formStyles.layoutAlignment', 'left', { shouldValidate: false });
                }
                if (parsed?.formLayout) {
                    setValue('formStyles.formLayout', parsed.formLayout, { shouldValidate: false });
                } else {
                    setValue('formStyles.formLayout', 'horizontal', { shouldValidate: false });
                }

                // Load form background settings
                if (parsed?.formBackgroundEnabled !== undefined) {
                    setValue('formStyles.formBackgroundEnabled', parsed.formBackgroundEnabled, { shouldValidate: false });
                } else {
                    setValue('formStyles.formBackgroundEnabled', false, { shouldValidate: false });
                }
                if (parsed?.formBackgroundImage) {
                    setValue('formStyles.formBackgroundImage', parsed.formBackgroundImage, { shouldValidate: false });
                }
                if (parsed?.formBackgroundColor) {
                    setValue('formStyles.formBackgroundColor', parsed.formBackgroundColor, { shouldValidate: false });
                }

                // Load styleSection data (new format)
                if (parsed?.styleSection) {
                    if (parsed.styleSection.name) {
                        setValue('formStyles.logoStyle', parsed.styleSection.name, { shouldValidate: false });
                    }
                    if (parsed.styleSection.alignment) {
                        setHeaderAlignment(parsed.styleSection.alignment);
                    }
                    if (parsed.styleSection.backgroundColor) {
                        setValue('headerConfig.backgroundColor', parsed.styleSection.backgroundColor, { shouldValidate: false });
                    }
                    if (parsed.styleSection.headerLogo) {
                        setValue('headerConfig.logo', parsed.styleSection.headerLogo, { shouldValidate: false });
                    }
                    if (parsed.styleSection.backgroundLogo) {
                        // backgroundLogo can be either header background (style1) or form background (style2)
                        const logoStyle = parsed.styleSection.name || parsed.logoStyle || 'style3';
                        if (logoStyle === 'style1') {
                            setValue('headerConfig.backgroundImage', parsed.styleSection.backgroundLogo, { shouldValidate: false });
                        } else if (logoStyle === 'style2') {
                            setValue('formStyles.formBackgroundImage', parsed.styleSection.backgroundLogo, { shouldValidate: false });
                        }
                    }
                }

                // Load headerConfig (old format and new format)
                if (parsed?.headerConfig) {
                    if (parsed.headerConfig.enabled !== undefined) {
                        setValue('formStyles.logoEnabled', parsed.headerConfig.enabled, { shouldValidate: false });
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
                    if (parsed.headerConfig.backgroundImage) {
                        setValue('headerConfig.backgroundImage', parsed.headerConfig.backgroundImage, { shouldValidate: false });
                    }
                    if (parsed.headerConfig.backgroundAlignment) {
                        setHeaderBgAlignment(parsed.headerConfig.backgroundAlignment);
                    }
                    if (parsed.headerConfig.alignment) {
                        setLogoPositionAlignment(parsed.headerConfig.alignment);
                        setValue('headerConfig.alignment', parsed.headerConfig.alignment, { shouldValidate: false });
                    }
                    if (parsed.headerConfig.layoutPosition) {
                        setHeaderAlignment(parsed.headerConfig.layoutPosition);
                    }
                    if (parsed.headerConfig.headerFontSize) {
                        setValue('headerConfig.headerFontSize', parsed.headerConfig.headerFontSize, { shouldValidate: false });
                    }
                    if (parsed.headerConfig.headerFontFamily) {
                        setValue('headerConfig.headerFontFamily', parsed.headerConfig.headerFontFamily, { shouldValidate: false });
                    }
                }

                // Load logoUrl and logoAlignment (alternative format)
                if (parsed?.logoUrl) {
                    setValue('headerConfig.logo', parsed.logoUrl, { shouldValidate: false });
                }
                if (parsed?.logoAlignment) {
                    setLogoPositionAlignment(parsed.logoAlignment);
                    setValue('headerConfig.alignment', parsed.logoAlignment, { shouldValidate: false });
                }

                return;
            }
        }

        // Set defaults if no formGenerationColumn
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            setValue('formStyles.theme', { ...themeDefinitions.light, value: 'light' }, { shouldValidate: false });
            setValue('formStyles.textFieldSize', 'normal', { shouldValidate: false });
            setValue('formStyles.font', fontOptions[0], { shouldValidate: false });
            previousFontSize.current = 17;
            setValue('formStyles.fontSize', 17, { shouldValidate: false });
            setValue('formStyles.fontColor', '#000000', { shouldValidate: false });
            // Default to false for all tags including TellAFriend
            setValue('formStyles.fontEnabled', false, { shouldValidate: false });
            setValue('formStyles.themeEnabled', false, { shouldValidate: false });
            setValue('formStyles.logoEnabled', false, { shouldValidate: false });
            setValue('formStyles.logoStyle', 'style3', { shouldValidate: false });
            setValue('formStyles.buttonEnabled', false, { shouldValidate: false });
            setValue('formStyles.formBackgroundEnabled', false, { shouldValidate: false });
            setValue('formStyles.inputStyle', 'default', { shouldValidate: false });
            setValue('formStyles.buttonRounding', 'default', { shouldValidate: false });
            setValue('formStyles.buttonAlignment', 'center', { shouldValidate: false });
            setValue('formStyles.layoutAlignment', 'left', { shouldValidate: false });
            setValue('formStyles.formLayout', 'horizontal', { shouldValidate: false });
            setValue('formStyles.paginationEnabled', false, { shouldValidate: false });
        }
    }, [formGenerationColumn, setValue, themeDefinitions, allThemes, tag]);

    // Sync ref with formStylesFontSize when it changes externally
    useEffect(() => {
        if (formStylesFontSize !== undefined && formStylesFontSize !== null) {
            const fontSizeValue = formStylesFontSize > 54 ? 54 : formStylesFontSize;
            previousFontSize.current = fontSizeValue;
        }
    }, [formStylesFontSize]);

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

    // Helper function to calculate contrast color from background
    const getContrastColor = (backgroundColor) => {
        if (!backgroundColor) return '#000000';

        // Remove # if present
        const hex = backgroundColor.replace('#', '');

        // Handle 3-character hex codes
        if (hex.length === 3) {
            const r = parseInt(hex[0] + hex[0], 16);
            const g = parseInt(hex[1] + hex[1], 16);
            const b = parseInt(hex[2] + hex[2], 16);

            // Calculate relative luminance
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            return luminance < 0.5 ? '#ffffff' : '#000000';
        }

        // Handle 6-character hex codes
        if (hex.length === 6) {
            // Convert to RGB
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);

            // Calculate relative luminance
            // Using relative luminance formula: 0.299*R + 0.587*G + 0.114*B
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

            // If luminance is less than 0.5, background is dark, use white text
            // Otherwise, use black text
            return luminance < 0.5 ? '#ffffff' : '#000000';
        }

        // Default to black if hex format is invalid
        return '#000000';
    };

    // Handle theme selection
    const handleThemeSelect = (themeKey) => {
        if (themeValue === themeKey) return;
        const theme = allThemes[themeKey];
        if (theme) {
            // Normalize theme to ensure all color properties are present
            const normalizedTheme = normalizeTheme(theme);

            // Save the complete theme object with a key identifier
            const themeDataToSave = {
                ...normalizedTheme,
                value: themeKey, // Keep the key for reference
                name: normalizedTheme.name || themeKey,
                _timestamp: Date.now(), // Force change detection
            };

            // Force a complete update by setting to null first, then the new value in the next tick
            // This ensures React Hook Form properly detects the change
            setValue('formStyles.theme', null, { shouldValidate: false, shouldDirty: false });
            setTimeout(() => {
                setValue('formStyles.theme', themeDataToSave, { shouldValidate: true, shouldDirty: true });
            }, 0);

            // Update colorCustomization state to sync with selected theme
            setColorCustomization({
                background: themeDataToSave.background,
                formBackground: themeDataToSave.formBackground,
                primary: themeDataToSave.accent,
                textField01: themeDataToSave.textField01,
                textField02: themeDataToSave.textField02,
            });

            // Set font color based on theme
            const fontColorToSet = themeDataToSave.text || getContrastColor(themeDataToSave.formBackground);
            setValue('formStyles.fontColor', fontColorToSet, { shouldValidate: true, shouldDirty: true });

            // Apply FormStyle Column prop values when selecting a theme
            if (normalizedTheme.formStyles) {
                Object.keys(normalizedTheme.formStyles).forEach(key => {
                    if (normalizedTheme.formStyles[key] !== undefined) {
                        setValue(`formStyles.${key}`, normalizedTheme.formStyles[key], { shouldValidate: false });
                    }
                });
            }
        }
    };

    // Handle pagination change
    const handlePaginationChange = (e) => {
        const selectedItem = e?.value;
        if (selectedItem) {
            setValue('formStyles.pagination', selectedItem, { shouldValidate: true, shouldDirty: true });
        }
    };

    // Handle items per page change
    const handleItemsPerPageChange = (e) => {
        const selectedItem = e?.value;
        if (selectedItem) {
            setValue('formStyles.itemsPerPage', selectedItem, { shouldValidate: true, shouldDirty: true });
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
            const themeNameValue = theme.name || '';
            setColorCustomization({
                background: theme.background || '#ffffff',
                formBackground: theme.formBackground || theme.background || '#ffffff',
                primary: theme.accent || '#007bff',
                textField01: theme.textField01 || theme.text || '#333333',
                textField02: theme.textField02 || theme.border || '#e0e0e0',
            });
            setThemeName(themeNameValue);
            setValue('themeName', themeNameValue, { shouldValidate: false, shouldDirty: false });
            setIsThemeNameEditable(false);
            setEditingTheme(themeKey);
        }
    };

    // Handle Add theme
    const handleAddTheme = () => {
        const defaultName = `Custom ${Object.keys(customThemes).length + 1}`;
        setColorCustomization({
            background: '#ffffff',
            formBackground: '#ffffff',
            primary: '#007bff',
            textField01: '#333333',
            textField02: '#e0e0e0',
        });
        setThemeName(defaultName);
        setValue('themeName', defaultName, { shouldValidate: false, shouldDirty: false });
        setIsThemeNameEditable(false);
        setEditingTheme('new');
    };

    // Handle theme name edit icon click
    const handleThemeNameEditClick = () => {
        setIsThemeNameEditable(true);
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

        // Get theme name from form or state
        const currentThemeName = getValues('themeName') || themeName || '';
        const finalThemeName = currentThemeName.trim() || (editingTheme === 'new' ? `Custom ${Object.keys(customThemes).length + 1}` : allThemes[editingTheme]?.name || 'Custom Theme');

        const createThemeObject = (baseName) => {
            const bg = colorCustomization.background || '#ffffff';
            const formBg = colorCustomization.formBackground || '#ffffff';
            const primary = colorCustomization.primary || '#007bff';
            const text = colorCustomization.textField01 || '#333333';
            const border = colorCustomization.textField02 || '#e0e0e0';

            return {
                name: baseName,
                // All variations of background color
                background: bg,
                backgroundColor: bg,
                // All variations of form background
                formBackground: formBg,
                formBackGroundColor: formBg,
                // All variations of primary/accent color
                accent: primary,
                primaryColor: primary,
                // All variations of text color
                text: text,
                textColor: text,
                textField01: text,
                // All variations of border color
                border: border,
                textBackgroundColor: border,
                textField02: border,
                formStyles: currentFormStyles,
            };
        };

        // Get the text color from the theme for font color update
        const textColorForFont = colorCustomization.textField01 || '#333333';

        if (editingTheme === 'new') {
            // Create new custom theme
            const newThemeKey = `custom_${Date.now()}`;
            const newTheme = createThemeObject(finalThemeName);
            setCustomThemes(prev => ({ ...prev, [newThemeKey]: newTheme }));

            // Force update with timestamp
            setValue('formStyles.theme', null, { shouldValidate: false, shouldDirty: false });
            setTimeout(() => {
                setValue('formStyles.theme', { ...newTheme, value: newThemeKey, _timestamp: Date.now() }, { shouldValidate: true, shouldDirty: true });
                // Set font color to match the theme's text color - same as handleThemeSelect
                setValue('formStyles.fontColor', textColorForFont, { shouldValidate: true, shouldDirty: true });
            }, 0);
        } else if (editingTheme) {
            // Update existing theme (only custom themes can be edited)
            if (customThemes[editingTheme]) {
                const updatedTheme = {
                    ...customThemes[editingTheme],
                    ...createThemeObject(finalThemeName),
                    formStyles: { ...(customThemes[editingTheme].formStyles || {}), ...currentFormStyles },
                };
                setCustomThemes(prev => ({ ...prev, [editingTheme]: updatedTheme }));

                // Force update with timestamp
                setValue('formStyles.theme', null, { shouldValidate: false, shouldDirty: false });
                setTimeout(() => {
                    setValue('formStyles.theme', { ...updatedTheme, value: editingTheme, _timestamp: Date.now() }, { shouldValidate: true, shouldDirty: true });
                    // Set font color to match the theme's text color - same as handleThemeSelect
                    setValue('formStyles.fontColor', textColorForFont, { shouldValidate: true, shouldDirty: true });
                }, 0);
            } else {
                // Create a copy of base theme as custom theme
                const baseTheme = themeDefinitions[editingTheme];
                const customThemeKey = `custom_${editingTheme}_${Date.now()}`;
                const newTheme = {
                    ...baseTheme,
                    ...createThemeObject(finalThemeName),
                };
                setCustomThemes(prev => ({ ...prev, [customThemeKey]: newTheme }));

                // Force update with timestamp
                setValue('formStyles.theme', null, { shouldValidate: false, shouldDirty: false });
                setTimeout(() => {
                    setValue('formStyles.theme', { ...newTheme, value: customThemeKey, _timestamp: Date.now() }, { shouldValidate: true, shouldDirty: true });
                    // Set font color to match the theme's text color - same as handleThemeSelect
                    setValue('formStyles.fontColor', textColorForFont, { shouldValidate: true, shouldDirty: true });
                }, 0);
            }
        }
        setEditingTheme(null);
        setIsThemeNameEditable(false);
        setThemeName('');
    };

    // Handle Cancel color customization
    const handleCancelColorCustomization = () => {
        setEditingTheme(null);
        setIsThemeNameEditable(false);
        setThemeName('');
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
    };

    const onSave = () => {
        // Get current theme colors
        const currentTheme = (typeof formStylesTheme === 'object' && formStylesTheme?.background)
            ? formStylesTheme
            : (allThemes[themeValue] || themeDefinitions.light);

        // Get itemsPerPage option object
        const itemsPerPageOption = itemsPerPageOptions.find(opt => opt.value === (formStylesItemsPerPage || 5)) || itemsPerPageOptions[0];

        // Build theme object
        const themeData = {
            name: currentTheme.name || themeValue || 'light',
            value: currentTheme.value || themeValue || 'light',
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
            fontSize: fontSize || 17,
            fontColor: fontColor || '#000000',
            logoEnabled: logoEnabled !== undefined ? logoEnabled : false,
            logoUrl: headerConfigLogo || '',
            logoAlignment: logoPositionAlignment || 'center',
            styleSection: styleSectionData,
            inputStyle: inputStyle || 'default',
            buttonRounding: buttonRounding || 'default',
            buttonAlignment: buttonAlignment || 'center',
            layoutAlignment: layoutAlignment || 'left',
            formLayout: formLayout || 'horizontal',
            customThemes: customThemes, // Save custom themes for persistence in edit mode
        };

        // Also keep the old format for backward compatibility
        const headerConfigData = {
            enabled: true,
            logo: headerConfigLogo || '',
            name: headerConfigName || '',
            backgroundColor: headerConfigBackgroundColor || '#ffffff',
            color: headerConfigColor || '#000000',
            backgroundImage: logoStyle === 'style1' ? (headerConfigBackgroundImage || '') : '',
            backgroundAlignment: logoStyle === 'style1' ? (headerBgAlignment || 'top') : '',
            alignment: logoEnabled ? (logoPositionAlignment || 'center') : '',
            layoutPosition: logoEnabled ? (headerAlignment || 'top') : '',
            headerFontSize: headerConfigFontSize || 17,
            headerFontFamily: headerConfigFontFamily || { text: 'Mukta Regular', value: 'muktaregular', fontFamily: 'MuktaRegular,sans-serif' },
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
        <div>
            <div className='rs-form-styles-wrapper css-scrollbar box-design mt0 p0'>
                <div className='rs-form-styles-main-header form-group d-flex align-items-center p10 border-bottom m0'>
                    <h3 className='mt0'>Form properties</h3>
                </div>
                <div className='rs-formStyles-properties-wrapper p15'>
                    {/* Form Layout Section */}
                    {tag !== 'TellAFriend' && (
                        <div className="form-section">
                            <h4 className="border-bottom mb15 pb15 mt0">Layout</h4>
                            <div className="form-section-body">
                                <div className="form-group mb0">
                                    <div className="layout-selector-grid">
                                        {[
                                            { value: 'horizontal', label: 'Horizontal' },
                                            { value: 'vertical', label: 'Vertical' },
                                            { value: 'noLabels', label: 'No labels' }
                                        ].map((layout) => (
                                            <div
                                                key={layout.value}
                                                onClick={() => {
                                                    setValue('formStyles.formLayout', layout.value, { shouldValidate: true, shouldDirty: true });
                                                }}
                                                className={`layout-selector-card ${formLayout === layout.value ? 'selected' : ''}`}
                                            >
                                                <RSTooltip text={layout.label} position='top'>
                                                    <div className="layout-preview">
                                                        {layout.value === 'horizontal' && (
                                                            <div className="layout-preview-content">
                                                                <div className="layout-field-preview" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                                                                    <div style={{ width: '30px', height: '4px', backgroundColor: '#999', borderRadius: '2px' }}></div>
                                                                    <div style={{ flex: 1, height: '6px', backgroundColor: '#ddd', borderRadius: '3px' }}></div>
                                                                </div>
                                                                <div className="layout-field-preview" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                                                                    <div style={{ width: '30px', height: '4px', backgroundColor: '#999', borderRadius: '2px' }}></div>
                                                                    <div style={{ flex: 1, height: '6px', backgroundColor: '#ddd', borderRadius: '3px' }}></div>
                                                                </div>
                                                                <div className="layout-field-preview" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                                                                    <div style={{ width: '30px', height: '4px', backgroundColor: '#999', borderRadius: '2px' }}></div>
                                                                    <div style={{ flex: 1, height: '6px', backgroundColor: '#ddd', borderRadius: '3px' }}></div>
                                                                </div>
                                                                <div style={{ marginTop: '8px', textAlign: 'center' }}>
                                                                    <div style={{ width: '20px', height: '6px', backgroundColor: '#333', borderRadius: '3px', margin: '0 auto' }}></div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {layout.value === 'vertical' && (
                                                            <div className="layout-preview-content">
                                                                <div className="layout-field-preview" style={{ marginBottom: '6px' }}>
                                                                    <div style={{ width: '30px', height: '4px', backgroundColor: '#999', borderRadius: '2px', marginBottom: '3px' }}></div>
                                                                    <div style={{ width: '100%', height: '6px', backgroundColor: '#ddd', borderRadius: '3px' }}></div>
                                                                </div>
                                                                <div className="layout-field-preview">
                                                                    <div style={{ width: '30px', height: '4px', backgroundColor: '#999', borderRadius: '2px', marginBottom: '3px' }}></div>
                                                                    <div style={{ width: '100%', height: '6px', backgroundColor: '#ddd', borderRadius: '3px' }}></div>
                                                                </div>
                                                                <div style={{ marginTop: '6px', textAlign: 'start' }}>
                                                                    <div style={{ width: '20px', height: '6px', backgroundColor: '#333', borderRadius: '3px' }}></div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {layout.value === 'noLabels' && (
                                                            <div className="layout-preview-content">
                                                                <div className="layout-field-preview" style={{ marginBottom: '6px' }}>
                                                                    <div style={{ width: '100%', height: '6px', backgroundColor: '#ddd', borderRadius: '3px' }}></div>
                                                                </div>
                                                                <div className="layout-field-preview" style={{ marginBottom: '6px' }}>
                                                                    <div style={{ width: '100%', height: '6px', backgroundColor: '#ddd', borderRadius: '3px' }}></div>
                                                                </div>
                                                                <div className="layout-field-preview" style={{ marginBottom: '4px' }}>
                                                                    <div style={{ width: '100%', height: '6px', backgroundColor: '#ddd', borderRadius: '3px' }}></div>
                                                                </div>
                                                                <div style={{ marginTop: '10px', textAlign: 'start' }}>
                                                                    <div style={{ width: '20px', height: '6px', backgroundColor: '#333', borderRadius: '3px' }}></div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </RSTooltip>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Header Section */}
                    {tag !== 'TellAFriend' && (<FormStyleHeader />)}


                    {/* Style Section */}
                    <div className="form-section p0">
                        <div className="form-section-body">
                            <div className="form-group mb0">
                                {/* <div className="form-section-switch">
                                            <h4 className='m0 p0'>Background</h4>
                                            <RSSwitch
                                                control={control}
                                                name="formStyles.formBackgroundEnabled"
                                            />
                                        </div> */}

                                {/* {formStylesFormBackgroundEnabled && ( */}
                                <FormStyleBackground />
                                {/* )} */}
                            </div>
                        </div>
                    </div>

                    {/* Color Theme Section */}
                    <div className="form-section">
                        <div className="form-section-body">
                            <div className="form-group mb0">
                                <div className={`form-section-switch ${formStylesThemeEnabled ? 'mb21' : ''} `}>
                                    <h4 className="m0 p0">Themes</h4>
                                    <RSSwitch
                                        control={control}
                                        name="formStyles.themeEnabled"
                                        handleChange={(value) => {
                                            if (!value) {
                                                // Reset theme section to initial values when switch is turned off
                                                setValue('formStyles.theme', { ...themeDefinitions.light, value: 'light' }, { shouldValidate: false, shouldDirty: true });
                                                setEditingTheme(null);
                                                setThemeName('');
                                                setValue('formStyles.fontColor', '#000000', { shouldValidate: false, shouldDirty: true });
                                                setColorCustomization({
                                                    background: '#ffffff',
                                                    formBackground: '#ffffff',
                                                    primary: '#007bff',
                                                    textField01: '#333333',
                                                    textField02: '#e0e0e0',
                                                });
                                            }
                                        }}
                                    />
                                </div>

                                {formStylesThemeEnabled && (
                                    <>
                                        {/* <div className='my21'>
                                          <Row className='d-flex align-items-center'>
                                    <Col md={10}>
                                       <div className="theme-search-wrapper ">
                                        <input
                                            type="text"
                                            placeholder="Search"
                                            value={themeSearch}
                                            onChange={(e) => setThemeSearch(e.target.value)}
                                            className="theme-search-input"
                                        />
                                        <i className={`${circle_zoom_fill_medium} icon-md color-primary-grey theme-search-icon `} />
                                    </div></Col>
                                           <Col md={2}>
                                            <RSTooltip position='top' text='Create new theme' className='mt10'>
                                                <i className={`${circle_plus_fill_edge_medium} icon-md color-primary-blue ${editingTheme ? "click-off" : ""}`} onClick={handleAddTheme}></i>
                                            </RSTooltip></Col>
                                        </Row>
                                      </div> */}

                                        {editingTheme ? (
                                            <div className="color-editor-inline">
                                                <div className="editor-header">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                                                        <div style={{ flex: 1 }}>
                                                            <RSInput
                                                                control={control}
                                                                name="themeName"
                                                                label="Theme"
                                                                defaultValue={themeName || allThemes[editingTheme]?.name || ''}
                                                                disabled={!isThemeNameEditable}
                                                                handleOnchange={(e) => {
                                                                    const newValue = e.target.value;
                                                                    setThemeName(newValue);
                                                                    setValue('themeName', newValue, { shouldValidate: false, shouldDirty: true });
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="nameEditIcon">
                                                            <RSTooltip text={isThemeNameEditable ? SAVE_NAME || 'Rename' : RENAME || 'Rename'} position="top">
                                                                <i
                                                                    id="rs_data_pencil_edit"
                                                                    className={`${pencil_edit_medium} icon-md color-primary-blue`}
                                                                    onClick={handleThemeNameEditClick}
                                                                    style={{ cursor: 'pointer' }}
                                                                />
                                                            </RSTooltip>
                                                        </div>
                                                    </div>
                                                </div>

                                                {[
                                                    { label: 'Container background', key: 'formBackground' },
                                                    { label: 'Primary button', key: 'primary' },
                                                    { label: 'Text color', key: 'textField01' },
                                                    // { label: 'Text field 02', key: 'textField02' }
                                                ].map((item) => {
                                                    const colorValue = colorCustomization[item.key] || '#ffffff';
                                                    return (
                                                        <div className="editor-row" key={item.key}>
                                                            <p>{item.label}</p>
                                                            <div className="color-controls">
                                                                <div className="color-picker-display">
                                                                    <div className="color-swatch" style={{ backgroundColor: colorValue }}></div>
                                                                    <span className="color-hex">{colorValue.toUpperCase()}</span>
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
                                                                                // Update local state
                                                                                const newColorCustomization = { ...colorCustomization, [item.key]: color };
                                                                                setColorCustomization(newColorCustomization);

                                                                                // Also update the form theme immediately for live preview
                                                                                const currentTheme = formStylesTheme || {};
                                                                                const updatedTheme = {
                                                                                    ...currentTheme,
                                                                                    formBackground: newColorCustomization.formBackground,
                                                                                    background: newColorCustomization.background || currentTheme.background,
                                                                                    accent: newColorCustomization.primary,
                                                                                    textField01: newColorCustomization.textField01,
                                                                                    textField02: newColorCustomization.textField02 || currentTheme.textField02,
                                                                                    text: newColorCustomization.textField01,
                                                                                };
                                                                                setValue('formStyles.theme', updatedTheme, { shouldValidate: false, shouldDirty: true });
                                                                            }}
                                                                            colorValue={colorValue}
                                                                            tooltipText={`${item.label} color`}
                                                                            alignRight={true}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}

                                                <div className="buttons-holder">
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
                                                {filteredThemes.length === 0 && themeSearch.trim() !== '' ? (
                                                    <ThemeSkeleton
                                                        isError={true}
                                                    />
                                                ) : (
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
                                                                {/* Theme Preview Elements */}
                                                                <RSTooltip text={theme.name} position='top'>
                                                                    <div className="theme-card-preview ">
                                                                        <div className="preview-input d-flex" style={{ backgroundColor: theme.formBackground || '#fff' }}>
                                                                            <div className="preview-line"></div>
                                                                            <div className="preview-button" style={{ backgroundColor: theme.accent }}></div>
                                                                        </div>
                                                                        {/* <i
                                                                    className={`${pencil_edit_mini} icon-sm color-primary-white text-right`}
                                                                    onClick={(e) => handleEditTheme(key, e)}
                                                                    style={{ cursor: 'pointer' }}
                                                                /> */}
                                                                    </div>
                                                                </RSTooltip>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>


                    {/* Font Section */}
                    {formLayout !== 'noLabels' && (
                        <div className="form-section">
                            <div className="form-section-body">
                                <div className="form-group mb0">
                                    <div className="form-section-switch">
                                        <h4 className="m0 p0">Font</h4>
                                        <RSSwitch
                                            control={control}
                                            name="formStyles.fontEnabled"
                                            handleChange={(value) => {
                                                if (!value) {
                                                    // Reset font section to initial values when switch is turned off
                                                    setValue('formStyles.font', fontOptions[0], { shouldValidate: false, shouldDirty: true });
                                                    previousFontSize.current = 17;
                                                    setValue('formStyles.fontSize', 17, { shouldValidate: false, shouldDirty: true });
                                                    setValue('formStyles.fontColor', '#000000', { shouldValidate: false, shouldDirty: true });
                                                }
                                            }}
                                        />
                                    </div>

                                    {formStylesFontEnabled && (
                                        <div className={`${formLayout === 'noLabels' ? 'pe-none click-off' : ''} mt21`}>
                                            <div className='form-field-group'>
                                                <Row>
                                                    {/* <Col md={7}>
                                                    <label>Font family</label>
                                                </Col> */}
                                                    <Col md={4}>
                                                        <div className=' d-flex align-items-center'>
                                                            <RSInput
                                                                control={control}
                                                                name="formStyles.fontSize"
                                                                maxLength={2}
                                                                placeholder="Font size"
                                                                disabled={formLayout === "noLabels"}
                                                                onKeyDown={(e) => {
                                                                    // Allow: backspace, delete, tab, escape, enter, arrows
                                                                    if (
                                                                        [8, 9, 27, 13, 37, 38, 39, 40, 46].includes(e.keyCode) ||
                                                                        (e.keyCode === 65 && e.ctrlKey === true) ||
                                                                        (e.keyCode === 67 && e.ctrlKey === true) ||
                                                                        (e.keyCode === 86 && e.ctrlKey === true) ||
                                                                        (e.keyCode === 88 && e.ctrlKey === true)
                                                                    ) {
                                                                        return;
                                                                    }

                                                                    // Ensure numbers only
                                                                    if (
                                                                        (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
                                                                        (e.keyCode < 96 || e.keyCode > 105)
                                                                    ) {
                                                                        e.preventDefault();
                                                                        return;
                                                                    }

                                                                    const currentValue = e.target.value || "";
                                                                    const selectionStart = e.target.selectionStart;
                                                                    const selectionEnd = e.target.selectionEnd;

                                                                    const newValue =
                                                                        currentValue.substring(0, selectionStart) +
                                                                        e.key +
                                                                        currentValue.substring(selectionEnd);

                                                                    // Block 0
                                                                    if (newValue === "0") {
                                                                        e.preventDefault();
                                                                        return;
                                                                    }

                                                                    // Block > 36
                                                                    const numValue = parseInt(newValue);
                                                                    if (!isNaN(numValue) && numValue > 36) {
                                                                        e.preventDefault();
                                                                    }
                                                                }}

                                                                handleOnchange={(e) => {
                                                                    const inputValue = e.target.value;

                                                                    // allow empty while typing
                                                                    if (inputValue === "" || inputValue === null || inputValue === undefined) {
                                                                        return;
                                                                    }

                                                                    let value = parseInt(inputValue);

                                                                    if (!isNaN(value)) {
                                                                        // ✅ ONLY restrict when value is EXACTLY 0
                                                                        if (value === 0) {
                                                                            // revert to last valid value (or 17 if nothing)
                                                                            const fallback = previousFontSize.current || 17;
                                                                            e.target.value = fallback.toString();
                                                                            setValue("formStyles.fontSize", fallback, {
                                                                                shouldValidate: true,
                                                                                shouldDirty: true,
                                                                            });
                                                                            return;
                                                                        }

                                                                        // Restrict max immediately
                                                                        if (value > 36) {
                                                                            value = 36;
                                                                            e.target.value = "36";
                                                                        }

                                                                        // store last valid value
                                                                        previousFontSize.current = value;

                                                                        setValue("formStyles.fontSize", value, {
                                                                            shouldValidate: true,
                                                                            shouldDirty: true,
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
                                                                    setValue('formStyles.fontSize', value, {
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
                                                            name="formStyles.font"
                                                            data={fontOptions}
                                                            textField="text"
                                                            dataItemKey="value"
                                                            defaultValue={getOptionByValue(fontOptions, fontValue || 'default')}
                                                            label="Font family"
                                                            disabled={formLayout === 'noLabels'}
                                                            isCustomRender={true}
                                                            itemRender={fontItemRender}
                                                            valueRender={fontValueRender}
                                                            handleChange={(e) => {
                                                                const selectedItem = e?.value;
                                                                if (selectedItem) {
                                                                    setValue('formStyles.font', selectedItem, { shouldValidate: true, shouldDirty: true });
                                                                }
                                                            }}
                                                        />
                                                    </Col>
                                                </Row>
                                            </div>

                                            {/* <div className='form-field-group'>
                                            <Row>
                                                <Col md={7}>
                                                    <label>Font size</label>
                                                </Col>
                                                <Col md={5}>
                                                    <div className=' d-flex align-items-center'>
                                                        <RSInput
                                                            control={control}
                                                            name='formStyles.fontSize'
                                                            maxLength ={2}
                                                            placeholder='Font size'
                                                            disabled={formLayout === 'noLabels'}
                                                            onKeyDown={onlyNumbers}
                                                            handleOnchange={(e) => {
                                                                const inputValue = e.target.value;
  
                                                                if (inputValue === '' || inputValue === null || inputValue === undefined) {
                                                                    return;
                                                                }
                                                                let value = parseInt(inputValue);
                                                                if (!isNaN(value)) {
                                                                    // Restrict to maximum 54
                                                                    if (value > 54) {
                                                                        value = 54;
                                                                        // If value exceeds 54, revert to previous valid value
                                                                        // For example: if current is "6" and user types "0" to make "60", revert to "6"
                                                                        const validValue = previousFontSize.current > 54 ? 54 : previousFontSize.current;
                                                                        
                                                                        // Update the input field display to show the valid value
                                                                        e.target.value = validValue.toString();
                                                                        
                                                                        setValue('formStyles.fontSize', validValue, {
                                                                            shouldValidate: true,
                                                                            shouldDirty: true
                                                                        });
                                                                    } else {
                                                                        // Update the ref with the valid value
                                                                        previousFontSize.current = value;
                                                                        setValue('formStyles.fontSize', value, {
                                                                            shouldValidate: true,
                                                                            shouldDirty: true
                                                                        });
                                                                    }
                                                                }
                                                            }}
                                                            handleOnBlur={(e) => {
                                                                const inputValue = e.target.value;
                                                                let value = parseInt(inputValue);

                                                                // Only fallback if value is invalid or empty
                                                                if (isNaN(value) || inputValue === '' || inputValue === null || inputValue === undefined) {
                                                                    value = 17;
                                                                }

                                                                // Cap at 54 on blur
                                                                if (value > 54) {
                                                                    value = 54;
                                                                }

                                                                // Update the ref with the final valid value
                                                                previousFontSize.current = value;
                                                                e.target.value = value.toString();
                                                                setValue('formStyles.fontSize', value, {
                                                                    shouldValidate: true,
                                                                    shouldDirty: true
                                                                });
                                                            }}
                                                        />

                                                        <small className="ml-2">px</small>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </div> */}
                                            <div className='form-field-group'>
                                                <Row>
                                                    <Col md={7}>
                                                        <label>Text color</label>
                                                    </Col>
                                                    <Col md={5}>
                                                        <div className="color-picker-display mt-8">
                                                            <div className="color-swatch" style={{ backgroundColor: fontColor || '#000000' }}></div>
                                                            <span className="color-hex">{(fontColor || '#000000').toUpperCase()}</span>
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
                                                                        setValue('formStyles.fontColor', color, { shouldValidate: true, shouldDirty: true });
                                                                    }}
                                                                    colorValue={fontColor || '#000000'}
                                                                    tooltipText="Text color"
                                                                    disabled={formLayout === 'noLabels'}
                                                                    alignRight={true}
                                                                />
                                                            </div>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </div>
                                            {/* <div className='mb21'>
                                    <Row>
                               <Col md ={4}>
                                 <label>Text color</label>
                                 </Col>
                                  <Col md={6}>
                                        <div className="color-picker-display">
                                            <div className="color-swatch" style={{ backgroundColor: fontColor || '#000000' }}></div>
                                            <span className="color-hex">{(fontColor || '#000000').toUpperCase()}</span>
                                            <div className="rs-builder-colorpicker-container">
                                                <RSColorPicker
                                                    icon={COLOR_PICKER}
                                                    isOpacity={true}
                                                    onSelect={(value) => {
                                                        let color = value;
                                                        if (typeof value === 'object' && value.color && value.opacity !== undefined) {
                                                            const hexOpacity = opacityToHex(value.opacity);
                                                            color = `${value.color}${hexOpacity}`;
                                                        }
                                                        setValue('formStyles.fontColor', color, { shouldValidate: true, shouldDirty: true });
                                                    }}
                                                    colorValue={fontColor || '#000000'}
                                                    tooltipText="Font color"
                                                    disabled={formLayout === 'noLabels'}
                                                    alignRight ={true}
                                                />
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                                 </div> */}
                                            {formLayout === 'noLabels' && (
                                                <div className="mt10" style={{
                                                    padding: '8px 12px',
                                                    backgroundColor: '#fff3cd',
                                                    border: '1px solid #ffc107',
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                    color: '#856404'
                                                }}>
                                                    <strong>Note:</strong> Font settings are disabled when "No Labels" layout is selected.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    )}
                    {/* Button (Rounding) Section */}
                    <div className="form-section">
                        <div className="form-section-body">
                            <div className="form-group mb0">
                                <div className="form-section-switch">
                                    <h4 className="m0 p0">Button</h4>
                                    <RSSwitch
                                        control={control}
                                        name="formStyles.buttonEnabled"
                                        handleChange={(value) => {
                                            if (!value) {
                                                // Reset button section to initial values when switch is turned off
                                                setValue('formStyles.buttonRounding', 'default', { shouldValidate: false, shouldDirty: true });
                                                setValue('formStyles.buttonAlignment', 'center', { shouldValidate: false, shouldDirty: true });
                                            }
                                        }}
                                    />
                                </div>

                                {formStylesButtonEnabled && (
                                    <div className='mt21'>
                                        <div className='form-field-group'>
                                            <Row>
                                                <Col md={7}>
                                                    <label>Border radius</label>
                                                </Col>
                                                <Col md={5}>
                                                    <div className="segmented-control">
                                                        {['default', 'full', 'none'].map((rounding) => (
                                                            <button
                                                                key={rounding}
                                                                onClick={() => setValue('formStyles.buttonRounding', rounding, { shouldValidate: true, shouldDirty: true })}
                                                                className={`segment-btn ${buttonRounding === rounding ? 'active' : ''}`}
                                                            >
                                                                {/* Icon CSS Shapes */}
                                                                <RSTooltip text={rounding.charAt(0).toUpperCase() + rounding.slice(1)} position='top'>
                                                                    <div className="segment-btn-icon" style={{
                                                                        width: '28px',
                                                                        height: '16px',
                                                                        border: '2px solid currentColor',
                                                                        borderRadius: rounding === 'full' ? '10px' : rounding === 'default' ? '5px' : '0',
                                                                        opacity: 0.6,
                                                                    }}></div>
                                                                </RSTooltip>
                                                                {/* <span className="segment-btn-text">{rounding.charAt(0).toUpperCase() + rounding.slice(1)}</span> */}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </Col>
                                            </Row>
                                        </div>

                                        <div className='form-field-group'>
                                            <Row>
                                                <Col md={7}>
                                                    <label>Alignment</label>
                                                </Col>
                                                <Col md={5}>
                                                    <div className="segmented-control">
                                                        {[
                                                            { value: 'left', icon: editor_align_left_medium, tooltip: 'Align Left' },
                                                            { value: 'center', icon: editor_align_center_medium, tooltip: 'Align Center' },
                                                            { value: 'right', icon: editor_align_right_medium, tooltip: 'Align Right' }
                                                        ].map((align) => (
                                                            <RSTooltip
                                                                key={align.value}
                                                                text={align.tooltip}
                                                                position="top"
                                                            >
                                                                <button
                                                                    onClick={() => setValue('formStyles.buttonAlignment', align.value, { shouldValidate: true, shouldDirty: true })}
                                                                    className={`segment-btn ${buttonAlignment === align.value ? 'active' : ''}`}
                                                                >
                                                                    <i className={`${align.icon} icon-md`}></i>
                                                                </button>
                                                            </RSTooltip>
                                                        ))}
                                                    </div>
                                                </Col>
                                            </Row>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Layout (Alignment) Section */}
                    {/* <div className="form-section">
                    <h4 className="m0 p0">Layout (Alignment)</h4>
                    <div className="form-section-body">
                        <div className="form-group mb0">
                            <div className="segmented-control">
                                {[
                                    { value: 'left', icon: editor_align_left_medium, tooltip: 'Align Left' },
                                    { value: 'center', icon: editor_align_center_medium, tooltip: 'Align Center' },
                                    { value: 'right', icon: editor_align_right_medium, tooltip: 'Align Right' }
                                ].map((align) => (
                                    <RSTooltip
                                        key={align.value}
                                        text={align.tooltip}
                                        position="top"
                                    >
                                        <button
                                            onClick={() => setValue('formStyles.layoutAlignment', align.value, { shouldValidate: true, shouldDirty: true })}
                                            className={`segment-btn ${layoutAlignment === align.value ? 'active' : ''}`}
                                        >
                                            <i className={`${align.icon} icon-md`}></i>
                                        </button>
                                    </RSTooltip>
                                ))}
                            </div>
                        </div>
                    </div>
                </div> */}

                    {/* Pagination Section */}
                    {tag !== 'TellAFriend' && (
                        <div className="form-section pb0">
                            <div className="form-section-header mb21">
                                <h4 className="m0 p0">Pagination</h4>
                                <RSSwitch
                                    control={control}
                                    name="formStyles.paginationEnabled"
                                    handleChange={(value) => {
                                        if (!value) {
                                            // Reset pagination section to initial values when switch is turned off
                                            setValue('formStyles.pagination', { text: 'Previous & Next', value: 'next' }, { shouldValidate: false, shouldDirty: true });
                                            setValue('formStyles.itemsPerPage', 5, { shouldValidate: false, shouldDirty: true });
                                        }
                                    }}
                                />
                            </div>
                            <div className="form-section-body">
                                <div className="form-group ">
                                    {formStylesPaginationEnabled && (
                                        <>
                                            {/* Item Per Page Section */}
                                            <div className="form-field-group mb41">
                                                <Row>
                                                    {/* <Col md={6}>
                                                        <label>Items per page</label>
                                                    </Col> */}
                                                    <Col md={4}>
                                                        <RSKendoDropDownList
                                                            control={control}
                                                            name="formStyles.itemsPerPage"
                                                            data={itemsPerPageOptions}
                                                            textField="text"
                                                            dataItemKey="value"
                                                            defaultValue={itemsPerPageOptions?.[0]}
                                                            handleChange={handleItemsPerPageChange}
                                                            label={'Items'}
                                                        />
                                                    </Col>
                                                    <Col md={8}>
                                                        <RSKendoDropDownList
                                                            control={control}
                                                            name="formStyles.pagination"
                                                            data={paginationOptions}
                                                            textField="text"
                                                            dataItemKey="value"
                                                            defaultValue={paginationOptions?.[0]}
                                                            handleChange={handlePaginationChange}
                                                            label={'Pagination type'}
                                                        />
                                                    </Col>
                                                </Row>
                                            </div>

                                            {/* Pagination Type Section */}
                                            {/* <div className="form-field-group">
                                                <Row>
                                                    <Col md={6}>
                                                        <label>Pagination type</label>
                                                    </Col>
                                                    <Col md={6}>
                                                        <RSKendoDropDownList
                                                            control={control}
                                                            name="formStyles.pagination"
                                                            data={paginationOptions}
                                                            textField="text"
                                                            dataItemKey="value"
                                                            defaultValue={paginationOptions?.[0]}
                                                            handleChange={handlePaginationChange}
                                                            label={'Type'}
                                                        />
                                                    </Col>
                                                </Row>
                                            </div> */}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>)}
                </div>
            </div>
        </div>
    );
};

export default FormSidebar;
