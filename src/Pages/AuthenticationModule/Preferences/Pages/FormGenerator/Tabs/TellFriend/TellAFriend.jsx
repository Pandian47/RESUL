import { CANCEL, PREVIEW, SAVE_GENERATE, UPDATE_GENERATE } from 'Constants/GlobalConstant/Placeholders';
import { mandatory_mini, settings_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Col, Row } from 'react-bootstrap';
import { BODYCONFIG, DEFAULT_VALUE, PARTICIPANT_LIST, SALUTATION, SETTINGS_ICON, TEXT_INPUT } from '../../constant';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { useNavigate } from 'react-router-dom';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import SettingsPopup from '../InputTabs/SettingsPopup';
import Text from '../InputTabs/Text';
import RSInput from 'Components/FormFields/RSInput';
import RSPhoneInput from 'Components/FormFields/RSPhoneInput';
import SettingsModal from './Components/SettingsModal';
import RSTooltip from 'Components/RSTooltip';
import SaveFormModal from '../FormTypes/Components/SaveForm';
import { buildPayload, findLinkRegex } from '../FormTypes/constant';
import { getFormData, publishFormbyID, saveAndUpdateForm } from 'Reducers/preferences/FormGenerator/request';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import useQueryParams from 'Hooks/useQueryParams';
import RSEditorPopup from 'Components/FormFields/RSEditorPopup/RSEditorPopup';
import GenerateAndEmbedAPI from '../FormTypes/Components/GenerateAndEmbedAPI';
import TellAFriendPreview from '../FormTypes/TellAFriendPreview';
import RSModal from 'Components/RSModal';
import InfoCardFormBuilder from '../../Components/InfoCardFormBuilder';
import FormSidebar from '../FormTypes/FormSidebar';

const TellAFriend = ({ setCurrentTab, isPreview, previewData }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const fromId = useQueryParams('/preferences/form-generator/add-form-generator');
    const getDisplayName = (fieldName) => {
        const displayMapping = {
            'Salutation': 'Title',
            'Fullname': 'Full name'
        };
        return displayMapping[fieldName] || fieldName;
    };
    const methods = useForm({
        defaultValues: {
            layoutType: '',
            radioButtonLable: false,
            settingsInputField: '8',
            colorPicker: '',
            Email: true,
            firstName: '',
            lastName: '',
            email: '',
            emailMandatory: false,
            mobileMandatory: false,
            FullNameMandatory: false,
            FirstNameMandatory: false,
            LastNameMandatory: false,
            participantName: '',
            headingName: '',
            participant: {
                id: 1,
                firstName: '',
                lastName: '',
                email: '',
            },
            numberOfPeopleAdded: '',
            isEdit: false,
            formName: '',
            Submit: '',
            CancelView: 'Cancel',
            background: {
                submitColor: '',
                cancelColor: '',
            },
            formStyles: {
                style: 'default',
                theme: 'theme1',
                pagination: 'pageNumbers',
                paginationEnabled: false,
                itemsPerPage: 5,
                font: { text: 'Default', value: 'default' },
                fontSize: 19,
                fontColor: '#000000',
                formBackgroundColor: '#ffffff',
                formBackgroundEnabled: false,
                layoutAlignment: 'left',
                customColors: {
                    background: '#ffffff',
                    text: '#000000',
                    accent: '#007bff',
                    border: '#cccccc',
                },
            },
            headerConfig: {
                enabled: true,
                logo: '',
                name: '',
                backgroundColor: '#ffffff',
                color: '#000000',
            },
        },
        mode: 'onChange',
    });

    const { control, handleSubmit, watch, reset, setValue, setError, getValues, resetField, trigger, clearErrors, formState: { isValid } } =
        methods;
    const allValues = getValues();
    // const { fields, append, remove } = useFieldArray({
    //     control,
    //     name: 'participant',
    // });
    // const [emailMandatory,mobileMandatory,FullNameMandatory,LastNameMandatory,FirstNameMandatory] =
    const [previewGenerate, setPreviewGenerate] = useState({
        show: false,
        name: '',
        savedata: {},
        formDataValues: {},
        previewData: {},
    });
    const [previewFlag, setPreviewFlag] = useState(false);
    const [
        salutation,
        fullName,
        email,
        mobile,
        selectedColor,
        emailMandatory,
        mobileMandatory,
        FullNameMandatory,
        LastNameMandatory,
        FirstNameMandatory,
        isEdit,
        formName,
        background,
        Submit,
        Cancel,
        formStylesTheme,
        formStylesFont,
        formStylesFontSize,
        formStylesFontColor,
        formStylesLogoEnabled,
        formStylesLogoStyle,
        formStylesInputStyle,
        formStylesButtonRounding,
        formStylesButtonAlignment,
        formStylesFormLayout,
        formStylesTextFieldSize,
        headerConfigLogo,
        headerConfigName,
        headerConfigBackgroundColor,
        headerConfigColor,
        headerConfigBackgroundImage,
        headerConfigAlignment,
        headerConfigLayoutPosition,
        headerConfigLogoAlignment,
        headerConfigNameAlignment,
        formStylesFormBackgroundImage,
        formStylesFormBackgroundColor,
        formStylesFormBackgroundEnabled,
        formStylesPaginationEnabled,
        formStylesPagination,
        formStylesItemsPerPage,
        formStylesLayoutAlignment,
    ] = watch([
        'Salutation',
        'Fullname',
        'Email',
        'Mobile',
        'colorPicker',
        'emailMandatory',
        'mobileMandatory',
        'FullNameMandatory',
        'LastNameMandatory',
        'FirstNameMandatory',
        'isEdit',
        'formName',
        'background',
        'Submit',
        'CancelView',
        'formStyles.theme',
        'formStyles.font',
        'formStyles.fontSize',
        'formStyles.fontColor',
        'formStyles.logoEnabled',
        'formStyles.logoStyle',
        'formStyles.inputStyle',
        'formStyles.buttonRounding',
        'formStyles.buttonAlignment',
        'formStyles.formLayout',
        'formStyles.textFieldSize',
        'headerConfig.logo',
        'headerConfig.name',
        'headerConfig.backgroundColor',
        'headerConfig.color',
        'headerConfig.backgroundImage',
        'headerConfig.alignment',
        'headerConfig.layoutPosition',
        'headerConfig.logoAlignment',
        'headerConfig.nameAlignment',
        'formStyles.formBackgroundImage',
        'formStyles.formBackgroundColor',
        'formStyles.formBackgroundEnabled',
        'formStyles.paginationEnabled',
        'formStyles.pagination',
        'formStyles.itemsPerPage',
        'formStyles.layoutAlignment',
    ]);

    const [submitCheck, setSubmitCheck] = useState(false);

    useEffect(() => {
        if (!Submit?.includes('background-color')) {
            setSubmitCheck(true);
        } else {
            setSubmitCheck(false);
        }
    }, [Submit]);

    // Font options - same as FormSidebar
    const fontOptions = useMemo(() => [
        { text: 'Default', value: 'default' },
        { text: 'Arial', value: 'arial' },
        { text: 'Helvetica', value: 'helvetica' },
        { text: 'Times New Roman', value: 'times' },
        { text: 'Georgia', value: 'georgia' },
        { text: 'Verdana', value: 'verdana' },
    ], []);

    // Helper function to get the object from value string
    const getOptionByValue = useCallback((options, value) => {
        const stringValue = typeof value === 'object' && value !== null && value.value !== undefined ? value.value : value;
        const foundOption = options.find(opt => opt.value === stringValue);
        return foundOption || options[0];
    }, []);

    // Theme definitions - memoized to prevent re-creation
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

    // Helper to get theme colors - memoized
    const themeColors = useMemo(() => {
        // If formStylesTheme is already a theme object with colors, use it
        if (typeof formStylesTheme === 'object' && formStylesTheme?.background) {
            return {
                background: formStylesTheme.background,
                text: formStylesTheme.text || formStylesTheme.textField01 || '#333333',
                accent: formStylesTheme.accent || '#007bff',
                border: formStylesTheme.border || formStylesTheme.textField02 || '#e0e0e0',
                formBackground: formStylesTheme.formBackground || formStylesTheme.background || '#ffffff',
                textField01: formStylesTheme.textField01 || formStylesTheme.text || '#333333',
                textField02: formStylesTheme.textField02 || formStylesTheme.border || '#e0e0e0',
            };
        }
        // Get the theme value (handle both object and string formats)
        const themeValue = typeof formStylesTheme === 'object' ? formStylesTheme?.value : formStylesTheme;
        return themeDefinitions[themeValue] || themeDefinitions.light;
    }, [formStylesTheme, themeDefinitions]);

    // Extract form background image URL - handle both string and object formats
    const formBackgroundImageUrl = useMemo(() => {
        if (!formStylesFormBackgroundImage) return '';
        if (typeof formStylesFormBackgroundImage === 'string') return formStylesFormBackgroundImage;
        // If it's an object, try to extract the URL from common properties
        if (typeof formStylesFormBackgroundImage === 'object') {
            return formStylesFormBackgroundImage.url || formStylesFormBackgroundImage.imageUrl || formStylesFormBackgroundImage.inputUrl || formStylesFormBackgroundImage.data || '';
        }
        return '';
    }, [formStylesFormBackgroundImage]);

    // Helper to get font value - memoized
    const fontValue = useMemo(() => {
        const fontVal = typeof formStylesFont === 'object' ? formStylesFont?.value : formStylesFont;
        // Map font values to CSS font-family names
        const fontFamilyMap = {
            'arial': 'Arial, sans-serif',
            'helvetica': 'Helvetica, Arial, sans-serif',
            'times': '"Times New Roman", Times, serif',
            'georgia': 'Georgia, serif',
            'verdana': 'Verdana, Geneva, sans-serif',
            'default': 'inherit',
        };
        const fontKey = fontVal && fontVal !== 'default' ? fontVal : 'default';
        return fontFamilyMap[fontKey] || 'inherit';
    }, [formStylesFont]);

    // Helper to get button rounding value - memoized
    const buttonRoundingValue = useMemo(() => {
        const roundingVal = typeof formStylesButtonRounding === 'object' && formStylesButtonRounding !== null
            ? formStylesButtonRounding?.value
            : formStylesButtonRounding || 'default';
        return roundingVal;
    }, [formStylesButtonRounding]);

    // Helper to get button alignment value - memoized
    const buttonAlignmentValue = useMemo(() => {
        const alignVal = typeof formStylesButtonAlignment === 'object' && formStylesButtonAlignment !== null
            ? formStylesButtonAlignment?.value
            : formStylesButtonAlignment || 'center';
        return alignVal;
    }, [formStylesButtonAlignment]);

    // Helper to get logo style value - memoized
    const logoStyleValue = useMemo(() => {
        const styleVal = typeof formStylesLogoStyle === 'object' && formStylesLogoStyle !== null
            ? formStylesLogoStyle?.value
            : formStylesLogoStyle || 'style3';
        return styleVal;
    }, [formStylesLogoStyle]);

    // Get input style based on selection - same logic as FormGenerator.jsx
    const getInputStyle = useMemo(() => {
        const inputStyleValue = typeof formStylesInputStyle === 'object' && formStylesInputStyle !== null
            ? formStylesInputStyle?.value
            : formStylesInputStyle || 'default';
        switch (inputStyleValue) {
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
    }, [formStylesInputStyle, themeColors.border]);

    // Get text field size - same logic as FormGenerator.jsx
    const getTextFieldSize = useMemo(() => {
        const textFieldSizeValue = typeof formStylesTextFieldSize === 'object' && formStylesTextFieldSize !== null
            ? formStylesTextFieldSize?.value
            : formStylesTextFieldSize || 'normal';
        switch (textFieldSizeValue) {
            case 'small':
                return { padding: '6px 10px', fontSize: '12px' };
            case 'large':
                return { padding: '14px 16px', fontSize: '16px' };
            case 'normal':
            default:
                return { padding: '10px 12px', fontSize: '14px' };
        }
    }, [formStylesTextFieldSize]);

    // Get header layout position - memoized
    const headerLayoutPosition = useMemo(() => {
        return headerConfigLayoutPosition || 'top';
    }, [headerConfigLayoutPosition]);

    // Extract logo URL - handle both string and object formats
    const logoUrl = useMemo(() => {
        if (!headerConfigLogo) return '';
        if (typeof headerConfigLogo === 'string') return headerConfigLogo;
        if (typeof headerConfigLogo === 'object') {
            return headerConfigLogo.url || headerConfigLogo.imageUrl || headerConfigLogo.inputUrl || headerConfigLogo.data || '';
        }
        return '';
    }, [headerConfigLogo]);

    // Extract background image URL - handle both string and object formats
    const backgroundImageUrl = useMemo(() => {
        if (!headerConfigBackgroundImage) return '';
        if (typeof headerConfigBackgroundImage === 'string') return headerConfigBackgroundImage;
        if (typeof headerConfigBackgroundImage === 'object') {
            return headerConfigBackgroundImage.url || headerConfigBackgroundImage.imageUrl || headerConfigBackgroundImage.inputUrl || headerConfigBackgroundImage.data || '';
        }
        return '';
    }, [headerConfigBackgroundImage]);

    // Get logo alignment styles - memoized
    const logoAlignmentStyle = useMemo(() => {
        const align = headerConfigLogoAlignment || 'center';
        switch (align) {
            case 'left':
                return { justifyContent: 'flex-start', alignItems: 'center' };
            case 'right':
                return { justifyContent: 'flex-end', alignItems: 'center' };
            case 'center':
                return { justifyContent: 'center', alignItems: 'center' };
            case 'top':
                return { justifyContent: 'center', alignItems: 'flex-start' };
            case 'bottom':
                return { justifyContent: 'center', alignItems: 'flex-end' };
            default:
                return { justifyContent: 'center', alignItems: 'center' };
        }
    }, [headerConfigLogoAlignment]);

    // Get name alignment styles - memoized
    const getNameAlignmentStyle = useCallback((layoutDirection = 'row') => {
        const align = headerConfigNameAlignment || 'center';
        switch (align) {
            case 'left':
                return {
                    textAlign: 'left',
                    alignSelf: 'center'
                };
            case 'right':
                return {
                    textAlign: 'right',
                    alignSelf: 'center'
                };
            case 'center':
                return {
                    textAlign: 'center',
                    alignSelf: 'center'
                };
            case 'top':
                return {
                    textAlign: 'center',
                    alignSelf: 'flex-start'
                };
            case 'bottom':
                return {
                    textAlign: 'center',
                    alignSelf: 'flex-end'
                };
            default:
                return {
                    textAlign: 'center',
                    alignSelf: 'center'
                };
        }
    }, [headerConfigNameAlignment]);

    useEffect(() => {
        document.body.classList.add('formGenerator-body');
        return () => {
            document.body.classList.remove('formGenerator-body');
        };
    }, []);

    useEffect(() => {
        async function getEdit() {
            // console.log('form id:: ', fromId);
            if (!!fromId) {
                let payload = { departmentId, clientId, userId, recipientFormId: fromId?.recipientFormId || 0 };
                let { data, status } = await dispatch(getFormData(payload));
                                if (status) {
                    let htmlCodeClient = JSON.parse(data?.[0]?.htmlCodeClient);
                    let htmlbgcolor = JSON.parse(data?.[0]?.bgColor);
                    let wn = null;
                    try { wn = data?.[0]?.WelcomeNoteMailHTML ? JSON.parse(data[0].WelcomeNoteMailHTML) : null; } catch (e) { }
                    const toStringVal = (v) => (v && typeof v === 'object' && v.value !== undefined ? v.value : v);
                    const defaultFormStyles = {
                        style: 'default', theme: 'theme1', pagination: 'pageNumbers', paginationEnabled: false, itemsPerPage: 5,
                        customColors: { background: '#ffffff', text: '#000000', accent: '#007bff', border: '#cccccc' },
                    };
                    // Helper to get font option object
                    const getFontOption = (fontValue) => {
                        if (!fontValue) return fontOptions[0];
                        if (typeof fontValue === 'object' && fontValue !== null && fontValue.value !== undefined) {
                            return fontValue;
                        }
                        return fontOptions.find(opt => opt.value === fontValue) || fontOptions[0];
                    };

                    const normalizeStyles = (ts = {}) => ({
                        style: toStringVal(ts.style) || 'default',
                        theme: toStringVal(ts.theme) || 'theme1',
                        pagination: toStringVal(ts.pagination) || 'pageNumbers',
                        paginationEnabled: !!ts.paginationEnabled,
                        itemsPerPage: ts.itemsPerPage || 5,
                        font: getFontOption(ts?.font),
                        fontSize: ts?.fontSize || 19,
                        fontColor: ts?.fontColor || '#000000',
                        layoutAlignment: ts?.layoutAlignment || 'left',
                        customColors: {
                            background: ts?.customColors?.background || defaultFormStyles.customColors.background,
                            text: ts?.customColors?.text || defaultFormStyles.customColors.text,
                            accent: ts?.customColors?.accent || defaultFormStyles.customColors.accent,
                            border: ts?.customColors?.border || defaultFormStyles.customColors.border,
                        },
                    });
                    const {
                        EmailEnable,
                        Emailnamevalidation,
                        Firstnamevalidation,
                        FullNameEnable,
                        Fullnamevalidation,
                        Lastnamevalidation,
                        MobileNoEnable,
                        Mobilenamevalidation,
                        SalutationEnable,
                        Titles,
                        content1,
                        content2,
                        CountParticipant,
                        email,
                        mobile,
                        FirstName,
                        LastName,
                        selectField,
                        participant,
                    } = htmlCodeClient;
                    settellAFriendSettings({
                        optionData: Titles?.split(','),
                    });
                    let temp = {
                        layoutType: '',
                        radioButtonLable: false,
                        settingsInputField: '8',
                        Salutation: SalutationEnable === '1',
                        Email: EmailEnable === '1',
                        Mobile: MobileNoEnable === '1',
                        email,
                        mobile,
                        FirstName,
                        LastName,
                        selectField,
                        emailMandatory: Emailnamevalidation === '1',
                        mobileMandatory: Mobilenamevalidation === '1',
                        FullNameMandatory: Fullnamevalidation === '1',
                        Fullname: FullNameEnable === '1',
                        FirstNameMandatory: Firstnamevalidation === '1',
                        LastNameMandatory: Lastnamevalidation === '1',
                        headingName: content1 ? JSON.parse(content1) : '',
                        participantName: content2 ? JSON.parse(content2) : '',
                        participant: participant,
                        numberOfPeopleAdded: CountParticipant,
                        isEdit: true,
                        formName: data?.[0]?.formName,
                        CancelView: '<p>Cancel</p>',
                        Submit: data?.[0]?.submitSetting.submitText,
                        formType: 'C',
                        selectedColor: htmlbgcolor?.bgColor,
                        colorPicker: htmlbgcolor?.bgColor,
                        formStyles: wn && wn.themeStyles ? {
                            ...normalizeStyles(wn.themeStyles),
                            formBackgroundColor: wn.themeStyles?.formBackgroundColor || '#ffffff',
                            formBackgroundEnabled: wn.themeStyles?.formBackgroundEnabled || false,
                            formBackgroundImage: wn.themeStyles?.formBackgroundImage || '',
                            font: getFontOption(wn.themeStyles?.font),
                            fontSize: wn.themeStyles?.fontSize || 19,
                            fontColor: wn.themeStyles?.fontColor || '#000000',
                            layoutAlignment: wn.themeStyles?.layoutAlignment || 'left',
                        } : {
                            ...defaultFormStyles,
                            formBackgroundColor: '#ffffff',
                            formBackgroundEnabled: false,
                            formBackgroundImage: '',
                            font: fontOptions[0],
                            fontSize: 19,
                            fontColor: '#000000',
                            layoutAlignment: 'left',
                        },
                        headerConfig: wn && wn.headerConfig ? wn.headerConfig : { enabled: true, logo: '', name: '', backgroundColor: '#ffffff', color: '#000000' },
                        // Submit: data?.[0]?.Submit,
                    };
                    reset(temp);
                } else {
                    settellAFriendSettings({
                        optionData: [],
                    });
                }
            }
        }
        if (isPreview) {
            reset(previewData);
        } else {
            getEdit();
        }
    }, [fromId]);
    const [settingsPopup, setSettingsPopup] = useState(false);
    const [tellAFriendSettings, settellAFriendSettings] = useState({
        optionData: SALUTATION,
    });
    const [settingsModal, setSettingsModal] = useState(false);
    const [saveModal, setSaveModal] = useState({
        show: false,
        data: {},
        isSave: false,
    });
    const [isSaveLoading, setIsSaveLoading] = useState(false);
    const [selectedButtonColor, setSelectedButtonColor] = useState({
        cancelColor: '#ffffff',
        submitColor: '#333333',
    });

    const onSubmit = async (status, name, isSave, formState) => {
        if (status) {
            const {
                Salutation,
                Fullname,
                Email,
                Mobile,
                numberOfPeopleAdded,
                headingName,
                participantName,
                FullNameMandatory,
                FirstNameMandatory,
                LastNameMandatory,
                emailMandatory,
                mobileMandatory,
                Submit,
                CancelView,
                colorPicker,
                email,
                mobile,
                FirstName,
                LastName,
                settingsInputField,
                participant,
                selectField,
            } = formState;
            // debugger
            let htmlCodeClient = {
                FormID: 0,
                CustomerDatabase: null,
                IsGmail: '0',
                IsYahoo: '0',
                IsHotmail: '0',
                SalutationEnable: Salutation ? '1' : '0',
                FullNameEnable: Fullname ? '1' : '0',
                EmailEnable: Email ? '1' : '0',
                MobileNoEnable: Mobile ? '1' : '0',
                RedirectURLEnable: null,
                CountParticipant: !!numberOfPeopleAdded ? numberOfPeopleAdded : 0,
                content1: JSON.stringify(headingName),
                content2: JSON.stringify(participantName),
                Titles: tellAFriendSettings?.optionData?.join(','),
                Fullnamevalidation: FullNameMandatory ? '1' : '0',
                Firstnamevalidation: FirstNameMandatory ? '1' : '0',
                Lastnamevalidation: LastNameMandatory ? '1' : '0',
                Emailnamevalidation: emailMandatory ? '1' : '0',
                Mobilenamevalidation: mobileMandatory ? '1' : '0',
                RedirectionURL: findLinkRegex(Submit),
                participant,
                email,
                mobile,
                FirstName,
                LastName,
                selectField,
            };
            let htmlCodeClientJSON = JSON.stringify(htmlCodeClient);
            let tempColumn = [
                {
                    columnName: 'Textbox',
                    columnType: 'Textbox',
                    orderNo: 1,
                    fieldDetails: [],
                    dataAttributeId: 0,
                },
            ];
            let formData = {
                formGenerationColumn: JSON.stringify(tempColumn),
                enableCaptchaCheckbox: '',
                Submit,
                CancelView,
                tinyMceLableAgree: '',
                htmlCodeClient: htmlCodeClientJSON,
                isProgressiveProfiling: false,
                settingsInputField: 0,
                isAutoSave: false,
                isPopulateFields: false,
                selectedColor,
                colorPicker,
                formName: name,
                formStyles: getValues('formStyles'),
                headerConfig: getValues('headerConfig'),
            };
            let formId = !!fromId ? fromId?.recipientFormId : 0;
            const payloadData = buildPayload(formData, formId, 'tellAFriend');

            setIsSaveLoading(true);
            try {
                let { status, data } = await dispatch(
                    saveAndUpdateForm({ ...payloadData, departmentId, clientId, userId }),
                );
                if (status) {
                    setSaveModal((prev) => ({
                        ...prev,
                        show: false,
                    }));
                    if (isSave) {
                        navigate('/preferences/form-generator');
                    } else {
                        const payload = {
                            departmentId,
                            clientId,
                            userId,
                            recipientFormId: data?.formId || formId,
                        };
                        let res = await dispatch(publishFormbyID(payload));

                        setPreviewGenerate({
                            show: true,
                            name: name,
                            formDataValues: payloadData,
                            savedata: { data },
                            previewData: saveModal?.data,
                            publishData: res?.data || {},
                        });
                    }
                }
            } finally {
                setIsSaveLoading(false);
            }
            // console.log('Subnit data :::: ', data);
        } else {
            setSaveModal((prev) => ({
                ...prev,
                show: false,
            }));
        }
    };

    const handleSave = (data, isSave = false) => {
        // console.log('Data :::::::::::::::: ', data);
        if (isEdit) {
            onSubmit(true, data?.formName ?? allValues?.formName, isSave, data);
        } else {
            setSaveModal({
                show: true,
                data: data,
                isSave: isSave,
            });
        }
    };

    const handleColorButton = (target, type) => {
        const color = target?.contentAreaContainer?.children[0]?.children[0]?.getAttribute('style');
        const mySelectedColor = color?.split(':');
        if (type === 'cancel') {
            setSelectedButtonColor((pre) => ({ ...pre, cancelColor: mySelectedColor?.[1]?.slice(0, -1) || '#ffffff' }));
        } else {
            setSelectedButtonColor((pre) => ({ ...pre, submitColor: mySelectedColor?.[1]?.slice(0, -1) || '#333333' }));
        }
        setValue(`background`, selectedButtonColor);
    };

    const handlePreview = useCallback(() => {
        setPreviewFlag(true);
    }, []);

    return (
        <FormProvider {...methods}>
            <InfoCardFormBuilder
                data={fromId}
                onPreviewClick={handlePreview}
                onProgressiveProfilingClick={() => {
                    // Progressive profiling can be handled here if needed
                }}
                formFieldsLength={0}
                formType = {'tellAFriend'}
            />
 
            <div className='mx10'>
                <Row>
                     <Col>
                        <form onSubmit={handleSubmit(handleSave)}>
                            <div
                                className={`box-design css-scrollbar form-layout-container tellafriend mt10 ${isPreview ? 'preview' : ''}`}
                                style={{
                                    height: 'calc(-140px + 100vh)',
                                    backgroundColor :formStylesFormBackgroundColor || '',
                                    background: formStylesFormBackgroundEnabled && (formBackgroundImageUrl
                                        ? `url(${formBackgroundImageUrl})`
                                        : (formStylesFormBackgroundColor || 'transparent')),
                                    backgroundSize: formStylesFormBackgroundEnabled && formBackgroundImageUrl ? 'cover' : 'auto',
                                    backgroundPosition: formStylesFormBackgroundEnabled && formBackgroundImageUrl ? 'center' : 'initial',
                                    backgroundRepeat: formStylesFormBackgroundEnabled && formBackgroundImageUrl ? 'no-repeat' : 'repeat',
                                    padding:"46px"
                                }}
                            >
                                <div className="rs-builder-elements-dropped-wrapper rsbedw-form-builder">
                                    <div
                                        className={`rs-builder-elements-content-wrapper form-layout-${formStylesFormLayout || 'horizontal'} input-style-${(typeof formStylesInputStyle === 'object' && formStylesInputStyle !== null ? formStylesInputStyle?.value : formStylesInputStyle) || 'default'}`}
                                        style={{
                                            background: themeColors.background,
                                            color: themeColors.text,
                                            fontFamily: fontValue,
                                            '--label-font-color': formStylesFontColor || '#000000',
                                            '--label-font-size': `${formStylesFontSize || 19}px`,
                                            transition: 'all 0.3s ease',
                                            // CSS custom properties for input styling
                                            '--input-border': getInputStyle.border === 'none' ? 'none' : (getInputStyle.border || `1px solid ${themeColors.border}`),
                                            '--input-border-bottom': getInputStyle.borderBottom || (getInputStyle.border === 'none' ? `2px solid ${themeColors.border}` : (getInputStyle.border || `1px solid ${themeColors.border}`)),
                                            '--input-border-radius': getInputStyle.borderRadius || '4px',
                                            '--input-padding': getTextFieldSize.padding || '10px 12px',
                                            '--input-font-size': getTextFieldSize.fontSize || '14px',
                                            '--input-background-color': themeColors.textField02 || (themeColors.background === '#ffffff' ? '#ffffff' : themeColors.background),
                                            '--input-color': themeColors.textField01 || themeColors.text,
                                            '--input-accent-color': themeColors.accent || '#007bff',
                                        }}
                                    >
                                        <Row style={{ background: !formStylesFormBackgroundEnabled ? (allValues?.colorPicker || allValues?.selectedColor || '') : 'transparent' }}>
                                            <div className={`border-bottom clearfix mb20 pb10 ${isPreview ? 'd-none' : ''}`}>
                                                <Row>
                                                    <Col sm={3}>
                                                        <h4 className="m0">Select contact method</h4>
                                                    </Col>
                                                    <Col sm={9} className="text-right">
                                                        <ul className="rs-list-inline rli-space-20">
                                                            {PARTICIPANT_LIST?.map((item, index) => {
                                                                return (
                                                                    <li key={index}>
                                                                        <div className="flex-center rsc-no-margin">
                                                                            <RSCheckbox
                                                                                className="smaller"
                                                                                name={item.name}
                                                                                control={control}
                                                                                labelName={getDisplayName(item.name)}
                                                                            />
                                                                            {item.name === 'Salutation' && (
                                                                                <>
                                                                                    <i
                                                                                        className={`${SETTINGS_ICON} icon-md color-primary-blue position-relative top2  ml5`}
                                                                                        onClick={() => setSettingsPopup(true)}
                                                                                    ></i>
                                                                                    {settingsPopup && (
                                                                                        <SettingsPopup
                                                                                            show={settingsPopup}
                                                                                            onHide={() => setSettingsPopup(false)}
                                                                                            type={'Tag'}
                                                                                            fieldSettings={tellAFriendSettings}
                                                                                            setFieldSettings={
                                                                                                settellAFriendSettings
                                                                                            }
                                                                                            inputList={
                                                                                                tellAFriendSettings?.optionData
                                                                                            }
                                                                                            control={control}
                                                                                            index={index}
                                                                                            setSettingsPopup={setSettingsPopup}
                                                                                            header="Title settings"
                                                                                            elementType={'Tag'}
                                                                                        />
                                                                                    )}
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </li>
                                                                );
                                                            })}
                                                        </ul>
                                                    </Col>
                                                </Row>
                                            </div>
                                            <div className={`${isPreview ? 'pe-none' : ''}`}>
                                                <div className="rsbecw-row mb41">
                                                    <div className="rs-pop-view">
                                                        <Text
                                                            index={1}
                                                            labelName={DEFAULT_VALUE}
                                                            placeHolder={TEXT_INPUT}
                                                            name={'headingName'}
                                                            isCustomWidthAdjust={true}
                                                        />
                                                    </div>
                                                </div>
                                                {/* <div className="rsbecw-row"> */}
                                                <div className="rs-pop-view mb41">
                                                    <Row>
                                                        {salutation && (
                                                            <Col>
                                                                <RSKendoDropDownList
                                                                    name={'selectField'}
                                                                    data={tellAFriendSettings?.optionData}
                                                                    control={control}
                                                                    // required
                                                                    label={'Salutation'}
                                                                    disabled
                                                                // rules={{
                                                                //     required: THIS_FIELD_IS_REQUIRED,
                                                                // }}
                                                                />
                                                            </Col>
                                                        )}
                                                        {fullName ? (
                                                            <Col className="flex-right">
                                                                <RSInput
                                                                    control={control}
                                                                    name={'FullName'}
                                                                    placeholder={'Full name'}
                                                                    // required
                                                                    // rules={{
                                                                    //     required: 'Enter your full name',
                                                                    // }}
                                                                    disabled={true}
                                                                />
                                                                <i
                                                                    className={`mt12 ml15 ${mandatory_mini} icon-xs ${FullNameMandatory
                                                                        ? 'color-primary-red'
                                                                        : 'color-secondary-grey'
                                                                        }`}
                                                                    onClick={() => {
                                                                        setValue('FullNameMandatory', !FullNameMandatory);
                                                                    }}
                                                                />
                                                            </Col>
                                                        ) : (
                                                            <>
                                                                <Col className="flex-right">
                                                                    <RSInput
                                                                        control={control}
                                                                        name={'FirstName'}
                                                                        placeholder={'First name'}
                                                                        // required
                                                                        // rules={{
                                                                        //     required: 'Enter your first name',
                                                                        // }}
                                                                        disabled={true}
                                                                    />
                                                                    <i
                                                                        className={`mt12 ml15 ${mandatory_mini} icon-xs ${FirstNameMandatory
                                                                            ? 'color-primary-red'
                                                                            : 'color-secondary-grey'
                                                                            }`}
                                                                        onClick={() => {
                                                                            setValue('FirstNameMandatory', !FirstNameMandatory);
                                                                        }}
                                                                    />
                                                                </Col>
                                                                <Col className="flex-right">
                                                                    <RSInput
                                                                        control={control}
                                                                        name={'LastName'}
                                                                        placeholder={'Last name'}
                                                                        // required
                                                                        // rules={{
                                                                        //     required: 'Enter your last name',
                                                                        // }}
                                                                        disabled={true}
                                                                    />
                                                                    <i
                                                                        className={`mt12 ml15 ${mandatory_mini} icon-xs ${LastNameMandatory
                                                                            ? 'color-primary-red'
                                                                            : 'color-secondary-grey'
                                                                            }`}
                                                                        onClick={() => {
                                                                            setValue('LastNameMandatory', !LastNameMandatory);
                                                                        }}
                                                                    />
                                                                </Col>
                                                            </>
                                                        )}
                                                        {email && (
                                                            <Col className="flex-right">
                                                                <RSInput
                                                                    control={control}
                                                                    name={'email'}
                                                                    placeholder={'Email'}
                                                                    // required
                                                                    // rules={{
                                                                    //     required: 'Enter your email',
                                                                    // }}
                                                                    disabled={true}
                                                                />
                                                                <i
                                                                    className={`mt12 ml15 ${mandatory_mini} icon-xs ${emailMandatory
                                                                        ? 'color-primary-red'
                                                                        : 'color-secondary-grey'
                                                                        }`}
                                                                    onClick={() => {
                                                                        setValue('emailMandatory', !emailMandatory);
                                                                    }}
                                                                />
                                                            </Col>
                                                        )}
                                                        {mobile && (
                                                            <Col className="flex-right">
                                                                <RSPhoneInput
                                                                    control={control}
                                                                    name={'mobile'}
                                                                    label={'Mobile number'}
                                                                    enableSearch={true}
                                                                    setError={setError}
                                                                    clearErrors={clearErrors}
                                                                    disabled={true}
                                                                />
                                                                <i
                                                                    className={`mt12 ml15 ${mandatory_mini} icon-xs ${mobileMandatory
                                                                        ? 'color-primary-red'
                                                                        : 'color-secondary-grey'
                                                                        }`}
                                                                    onClick={() => {
                                                                        setValue('mobileMandatory', !mobileMandatory);
                                                                    }}
                                                                />
                                                            </Col>
                                                        )}
                                                    </Row>
                                                </div>
                                                {/* </div> */}
                                                <div className="rsbecw-row mb41 d-flex align-items-end">
                                                    <div className="rs-pop-view ">
                                                        <Text
                                                            index={2}
                                                            labelName={DEFAULT_VALUE}
                                                            placeHolder={TEXT_INPUT}
                                                            name={'participantName'}
                                                            isCustomWidthAdjust={true}
                                                        />
                                                    </div>
                                                    <div className="ml15">
                                                        <RSTooltip text={'Set referral limit'} position="top" className="lh0">
                                                            <i
                                                                className={`${settings_medium} icon-md color-primary-blue`}
                                                                onClick={() => {
                                                                    setSettingsModal(true);
                                                                }}
                                                            />
                                                        </RSTooltip>
                                                    </div>
                                                </div>
                                                {/* <div className="rsbecw-row"> */}
                                                <div className="rs-pop-view mb41">
                                                    <Row>
                                                        {salutation && (
                                                            <Col>
                                                                <RSKendoDropDownList
                                                                    name={'participant.selectField'}
                                                                    data={tellAFriendSettings?.optionData}
                                                                    control={control}
                                                                    //  required
                                                                    label={'Salutation'}
                                                                    // rules={{
                                                                    //     required: THIS_FIELD_IS_REQUIRED,
                                                                    // }}
                                                                    disabled
                                                                />
                                                            </Col>
                                                        )}
                                                        {fullName ? (
                                                            <Col>
                                                                <RSInput
                                                                    control={control}
                                                                    name={'participant.FullName'}
                                                                    placeholder={'Full name'}
                                                                    // required
                                                                    // rules={{
                                                                    //     required: 'Enter your full namae',
                                                                    // }}
                                                                    disabled={true}
                                                                />
                                                            </Col>
                                                        ) : (
                                                            <>
                                                                <Col>
                                                                    <RSInput
                                                                        control={control}
                                                                        name={'participant.FirstName'}
                                                                        placeholder={'Firstname'}
                                                                        // required
                                                                        // rules={{
                                                                        //     required: 'Enter your first name',
                                                                        // }}
                                                                        disabled={true}
                                                                    />
                                                                </Col>
                                                                <Col>
                                                                    <RSInput
                                                                        control={control}
                                                                        name={'participant.LastName'}
                                                                        placeholder={'Lastname'}
                                                                        // required
                                                                        // rules={{
                                                                        //     required: 'Enter your last name',
                                                                        // }}
                                                                        disabled={true}
                                                                    />
                                                                </Col>
                                                            </>
                                                        )}
                                                        {email && (
                                                            <Col>
                                                                <RSInput
                                                                    control={control}
                                                                    name={'participant.email'}
                                                                    placeholder={'Email'}
                                                                    // required
                                                                    // rules={{
                                                                    //     required: 'Enter your Email',
                                                                    // }}
                                                                    disabled={true}
                                                                />
                                                            </Col>
                                                        )}
                                                        {mobile && (
                                                            <Col>
                                                                <RSPhoneInput
                                                                    control={control}
                                                                    name={'participant.mobile'}
                                                                    label={'Mobile number'}
                                                                    enableSearch={true}
                                                                    setError={setError}
                                                                    clearErrors={clearErrors}
                                                                    disabled={true}
                                                                />
                                                            </Col>
                                                        )}
                                                    </Row>
                                                </div>

                                                {/* </div> */}

                                                {/* <div className="rs-pop-view">
                                    {fields.map((item, index) => {
                                        return (
                                            <Row key={item?.id} className="p-2 rs-pop-view">
                                                <Col sm={1} className="text-center">
                                                    <span>{index + 1}</span>
                                                </Col>
                                                <Col sm={3}>
                                                    <RSInput
                                                        control={control}
                                                        name={`participant[${index}].firstName`}
                                                        placeholder={'First name'}
                                                    />
                                                </Col>
                                                <Col sm={3}>
                                                    <RSInput
                                                        control={control}
                                                        name={`participant[${index}].lastName`}
                                                        placeholder={'Last name'}
                                                    />
                                                </Col>
                                                <Col sm={3}>
                                                    <RSInput
                                                        control={control}
                                                        name={`participant[${index}].email`}
                                                        placeholder={'Email'}
                                                    />
                                                </Col>
                                                <Col sm={1} className="p-2 text-center">
                                                    <i
                                                        className={`icon-rs-circle-minus-fill-mini color-primary-red icon-md ${
                                                            fields?.length === 1 && 'click-off'
                                                        }`}
                                                        onClick={() => remove(index)}
                                                    ></i>
                                                </Col>
                                                <Col sm={1} className="p-2">
                                                    <i
                                                        className={`icon-rs-circle-plus-fill-mini color-primary-blue icon-md`}
                                                        onClick={() =>
                                                            append({ firstName: '', lastName: '', email: '' })
                                                        }
                                                    ></i>
                                                </Col>
                                            </Row>
                                        );
                                    })}
                                </div> */}
                                                <div className="rs-pop-view position-relative mb10">
                                                    <div className={`form-builder-component`} style={{ background: allValues?.colorPicker || allValues?.selectedColor || selectedColor || '' }}>
                                                        <ul 
                                                            className="rs-list-inline rli-space-5 editor-text"
                                                            style={{
                                                                display: 'flex',
                                                                justifyContent: buttonAlignmentValue === 'left' ? 'flex-start' :
                                                                            buttonAlignmentValue === 'right' ? 'flex-end' :
                                                                            'center',
                                                                width: '100%',
                                                                alignItems: 'center',
                                                            }}
                                                        >
                                                            <li>
                                                                <button
                                                                    type="button"
                                                                    className="rs-form-button rsfb-cancel pe-none"
                                                                    style={{
                                                                        backgroundColor: `${background?.cancelColor || 'transparent'}`,
                                                                        color: '#0018f9',
                                                                        borderRadius: buttonRoundingValue === 'full' ? '50px' :
                                                                                    buttonRoundingValue === 'none' ? '0px' :
                                                                                    '4px',
                                                                        fontSize: getTextFieldSize?.fontSize || '14px',
                                                                    }}
                                                                >
                                                                    <RSEditorPopup
                                                                        name={`CancelView`}
                                                                        control={control}
                                                                        initialValue={!!Cancel ? Cancel : 'Cancel'}
                                                                        init={BODYCONFIG}
                                                                        disabled={false}
                                                                        onNodeChange={({ target }) => {
                                                                            handleColorButton(target, 'cancel');
                                                                        }}
                                                                        handleChange={(e) => {
                                                                                                                                                        setValue('CancelView', e?.html);
                                                                        }}
                                                                    />
                                                                </button>
                                                            </li>
                                                            <li>
                                                                {' '}
                                                                <button
                                                                    type="button"
                                                                    className={`rs-form-button rsfb-submit ${submitCheck ? 'submitini' : ''}`}
                                                                    style={{ 
                                                                        backgroundColor: `${background?.submitColor || themeColors.accent || '#007bff'}`,
                                                                        borderRadius: buttonRoundingValue === 'full' ? '50px' :
                                                                                    buttonRoundingValue === 'none' ? '0px' :
                                                                                    '4px',
                                                                        fontSize: getTextFieldSize?.fontSize || '14px',
                                                                    }}
                                                                >
                                                                    <RSEditorPopup
                                                                        name={`Submit`}
                                                                        control={control}
                                                                        initialValue={!!Submit ? Submit : 'Submit'}
                                                                        init={BODYCONFIG}
                                                                        disabled={false}
                                                                        onNodeChange={({ target }) => {
                                                                            handleColorButton(target, 'submit');
                                                                        }}
                                                                        handleChange={(e) => {
                                                                            setValue('Submit', e?.html);
                                                                        }}
                                                                    />
                                                                </button>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </Row>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </Col>
                    <Col md={3} className='tellAFriend pl0'>
                               <div className="rs-builder-elements-holder w-auto  d-flex justify-content-end">
                <div className={`buttons-holder mb21 ${isPreview ? 'd-none' : ''}`}>
                    <RSSecondaryButton onClick={() => navigate('/preferences/form-generator')}>
                        {CANCEL}
                    </RSSecondaryButton>
                    {/* <RSSecondaryButton
                    className="color-primary-blue"
                    onClick={() => {
                        handleSubmit((data) => handleSave(data, true))();
                    }}
                >
                    {!!fromId ? 'Update' : 'Save'}
                </RSSecondaryButton> */}
                  
                    <RSPrimaryButton
                        isLoading={isSaveLoading}
                        blockBodyPointerEvents
                        onClick={() => {
                            handleSubmit((data) => handleSave(data, false))();
                        }}
                    >
                        {!!fromId ? UPDATE_GENERATE : SAVE_GENERATE}
                    </RSPrimaryButton>
                </div>
            </div>
                        <FormSidebar tag={'TellAFriend'} formGenerationColumn={null} />
                    </Col>
                </Row>
            </div>
            <SettingsModal
                show={settingsModal}
                handleClose={(status) => {
                    if (!status) {
                        if (!isEdit) setValue('numberOfPeopleAdded', '');
                    }
                    setSettingsModal(false);
                }}
                type='tellAFriend'
            />
            {saveModal?.show && (
                <SaveFormModal
                    show={saveModal?.show}
                    handleClose={(status, name) => {
                        onSubmit(status, name, saveModal?.isSave, saveModal?.data);
                    }}
                    isEdit={fromId?.isEdit || false}
                    editName={fromId?.formName}
                    isSaveLoading={isSaveLoading}
                />
            )}
            {previewGenerate.show && (
                <GenerateAndEmbedAPI
                    show={previewGenerate.show}
                    handleClose={(status, name) => {
                                                setPreviewGenerate({
                            show: false,
                            name: '',
                            formDataValues: {},
                            savedata: {},
                            previewData: {},
                            publishData: {}
                        });
                        navigate('/preferences/form-generator');
                        // handleSaveandGenerate(status, name);
                    }}
                    formDataValues={previewGenerate?.formDataValues}
                    saveData={previewGenerate?.savedata}
                    editName={previewGenerate.name}
                    previewData={allValues}
                    publishData={previewGenerate?.publishData}

                    fromTellAFriend
                />
            )}
            {previewFlag && (
                <RSModal
                    show={previewFlag}
                    size={'xlg'}
                    header={PREVIEW}
                    body={
                        <TellAFriendPreview
                            formData={allValues}
                            themeColors={themeColors}
                            fontValue={fontValue}
                            fontSize={formStylesFontSize || 19}
                            fontColor={formStylesFontColor || '#000000'}
                            formLayout={formStylesFormLayout || 'horizontal'}
                            formStylesButtonRounding={buttonRoundingValue}
                            formStylesButtonAlignment={buttonAlignmentValue}
                            formStylesLogoEnabled={formStylesLogoEnabled}
                            formStylesLogoStyle={logoStyleValue}
                            headerConfigLogo={headerConfigLogo}
                            headerConfigName={headerConfigName}
                            headerConfigBackgroundColor={headerConfigBackgroundColor}
                            headerConfigColor={headerConfigColor}
                            headerConfigBackgroundImage={headerConfigBackgroundImage}
                            headerConfigAlignment={headerConfigAlignment || 'center'}
                            headerLayoutPosition={headerLayoutPosition}
                            headerConfigLogoAlignment={headerConfigLogoAlignment}
                            headerConfigNameAlignment={headerConfigNameAlignment}
                            formStylesFormBackgroundImage={formStylesFormBackgroundImage}
                            formStylesFormBackgroundColor={formStylesFormBackgroundColor}
                            formStylesFormBackgroundEnabled={formStylesFormBackgroundEnabled}
                            formStylesInputStyle={formStylesInputStyle}
                            formStylesTextFieldSize={formStylesTextFieldSize}
                            getInputStyle={getInputStyle}
                            getTextFieldSize={getTextFieldSize}
                            selectedColor={allValues?.colorPicker || allValues?.selectedColor || ''}
                            formStylesPaginationEnabled={formStylesPaginationEnabled}
                            formStylesPagination={formStylesPagination}
                            formStylesItemsPerPage={formStylesItemsPerPage}
                            formStylesLayoutAlignment={formStylesLayoutAlignment}
                        />
                    }
                    handleClose={(status, name) => {
                        setPreviewFlag(false);
                    }}
                />
            )}
        </FormProvider>
    );
};

export default TellAFriend;
