import { formLayout1, formLayout2 } from 'Assets/Images';
import { form_generator_large } from 'Constants/GlobalConstant/Glyphicons';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { AGREE_TERMSCONDITIONS, ARE_YOU_SURE_DELETE, ARE_YOU_SURE_WANT_TO_RESET, CANCEL, CHNAGE_DEFAULT_LABEL, CHNAGE_DEFAULT_TEXT, DELETE_USER_ROLE, EMAIL_ID_MOBILE_NO, ENTER_ANSWER, FORM_BACKGROUND_COLOR, LAYOUT, LAYOUT_SETTINGS, NO, NOTE_ACTION, NOTE_TEMPLATE, OK, PROGRESSIVE_PROFILE_SETTINGS, RESET, SAVE_GENERATE, UPDATE_GENERATE, WARNING, YES } from 'Constants/GlobalConstant/Placeholders';
import { createContext, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import Carousel from 'react-bootstrap/Carousel';
import { Col, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { findIndex as _findIndex, uniqueId } from 'Utils/modules/lodashReplacements';
import { THIS_FIELD_IS_REQUIRED, FORM_AT_LEAST_ONE_FIELD, FORM_ONE_MANDATORY, PROGRESSIVE_PROFILING_FIELD_COUNT_MISMATCH } from 'Constants/GlobalConstant/ValidationMessage';

import {
    INITIAL_WATCH_STATE,
    INPUT_TYPES,
    DEFAULT_INPUT_FIELDS,
    STATE_REDUCER,
    FORM_INITIAL_STATE,
    buildFormEdit,
    DEFAULT_VALUE,
    getProgressiveProfilingStats,
    splitFieldsForProgressiveProfiling,
} from '../../constant';
import { LANDING_BUILDER_REDIRECT_URL, baseURL } from 'Constants/EndPoints';
import '../../FormGenerator.scss';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';

import { Settings } from './Settings';
import FormSettings from './FormSettings';
import RSModal from 'Components/RSModal';
import FormButtons from '../InputTabs/FormButtons';
import FormCaptcha from '../InputTabs/FormCaptcha';
import Preview from './Preview';
import ListViewComponent from './Components/ListViewComponent';
import { getAttribute } from 'Pages/AuthenticationModule/Audience/Pages/AddImportAudience/constant';
import { getDataAttributes } from 'Reducers/preferences/datacatalogue/request';
import { getSessionId } from 'Reducers/globalState/selector';
import { useDispatch, useSelector } from 'react-redux';
import { buildPayload } from './constant';
import { getFormData, publishFormbyID, saveAndUpdateForm } from 'Reducers/preferences/FormGenerator/request';
import { getFormGeneratorsDatas } from 'Reducers/preferences/FormGenerator/reducer';
import SaveFormModal from './Components/SaveForm';
import useQueryParams from 'Hooks/useQueryParams';
import { useWindowSize } from 'Hooks/useWindowSize';
import MakeDefaultModal from './Components/MakeDefaultModal';
import GenerateAndEmbedAPI from './Components/GenerateAndEmbedAPI';

import WarningPopup from 'Pages/AuthenticationModule/Components/WarningPopup/WarningPopup';
import { WebhookSettings } from './WebhookSettings';

import FormSidebar from './FormSidebar';
import InfoCardFormBuilder from '../../Components/InfoCardFormBuilder';

export const FormGeneratorContext = createContext({
    formState: {},
    dispatchState: () => {},
});
let payloadData = {};
const FormGenerator = ({ tag, setCurrentTab }) => {
    const location = useQueryParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { failureApiErrors, clientId: clientData, clientList } = useSelector(({ globalstate }) => globalstate);
    const currClient = clientList?.find((item) => item?.clientId === clientData?.clientId);

    const getGlobalState = useSelector(({ globalstate }) => globalstate);
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const { dataCatalogueAttrs } = useSelector(({ dataCatalogueReducer }) => dataCatalogueReducer);
    const [formState, dispatchState] = useReducer(STATE_REDUCER, FORM_INITIAL_STATE(departmentId));
    const { cachedEditFormData } = useSelector(({ formGeneratorReducers }) => formGeneratorReducers);

    // console.log('dataCatalogueAttrs: ', dataCatalogueAttrs);
    const [previewTemp, setPreviewTemp] = useState([]);
    const [previewGenerate, setPreviewGenerate] = useState({
        show: false,
        name: '',
        savedata: {},
        formDataValues: {},
        publishData: {
            data: {},
            isPublish: false,
        },
    });
    const [saveModal, setSaveModal] = useState({
        show: false,
        data: {},
    });
    const [isSaveLoading, setIsSaveLoading] = useState(false);
    const [inputTypes, setInputTypes] = useState(INPUT_TYPES);
    const [defaultModal, setDefaultModal] = useState(false);
    const [showPopup, setShowPopup] = useState({
        show: false,
        message: '',
    });
    const [logoPositionAlignment, setLogoPositionAlignment] = useState('center'); // 'left', 'right', 'center' - for logo position within header
    const [carouselIndex, setCarouselIndex] = useState(0); // Track carousel slide index
    const { width: windowWidth } = useWindowSize(); // Track window width for responsive items
    const hasRun = useRef(false);
    const {
        dropAble,
        settingsPopup,
        formSettingsPopup,
        profilingToggle,
        fieldCount,
        previewFlag,
        refreshPopup,
        removeIndex,
        removeStatus,
        removePopup,
        layoutName,
        layout,
        webHookPopup,
        formStylesPopup,
    } = formState;

    const methods = useForm({
        defaultValues: {
            radioButtonLable: false,
            settingsInputField: '',
            AgreeCheckbox: true,
            tinyMceLableAgree: AGREE_TERMSCONDITIONS,
            isEdit: false,
            postBackUrl: '',
            defaultTypes: {
                EmailID: true,
                MobileNO: true,
            },
            formGenerator: [],
            formName: '',
            formStyles: {
                style: 'default',
                theme: 'theme1',
                pagination: 'pageNumbers',
                paginationEnabled: false,
                itemsPerPage: 5,
                fontSize: 19,
                fontColor: '#000000',
                font: 'default',
                fontEnabled: false,
                buttonAlignment: 'center',
                formLayout: 'horizontal',
                formBackgroundColor: '#ffffff',
                formBackgroundEnabled: false,
                formBackgroundImage: '',
                textFieldSize: 'normal',
                inputStyle: 'default',
                buttonRounding: 'default',
                layoutAlignment: 'left',
                logoEnabled: false,
                logoStyle: 'style3',
                customColors: {
                    background: 'transparent',
                    text: '#000000',
                    accent: '#007bff',
                    border: '#cccccc',
                },
            },
            headerConfig: {
                enabled: true,
                logo: '',
                name: '',
                backgroundColor: 'transparent',
                color: '#ffffff',
                backgroundImage: '',
                alignment: 'left',
                layoutPosition: 'top',
                logoAlignment: 'left',
                nameAlignment: 'left',
            },
        },
        mode: 'onChange',
        shouldFocusError: true,
    });

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        getValues,
        reset,
        setError,
        clearErrors,
        trigger,
        formState: { errors, isValid },
    } = methods;
    const queryParams = useQueryParams('/preferences/form-generator/add-form-generator');
    const editMode = queryParams?.isEdit || false;
    const [formData, setFormData] = useState(null);

    useEffect(() => {
        async function getEdit() {
            if (!queryParams) return;

            if (cachedEditFormData) {
                const getForm = buildFormEdit(cachedEditFormData, dispatchState);
                reset(getForm);
                dispatch(getFormGeneratorsDatas({ field: 'cachedEditFormData', data: null }));
                return;
            }

            const payload = {
                departmentId,
                clientId,
                userId,
                recipientFormId: queryParams?.recipientFormId || 0,
            };
            const { data, status } = await dispatch(getFormData(payload));
            if (status) {
                setFormData(data);
                reset(buildFormEdit(data, dispatchState));
            }
        }
        getEdit();
    }, [queryParams, departmentId, clientId, userId, dispatch, reset, dispatchState, cachedEditFormData]);
    useEffect(() => {
        document.body.classList.add('formGenerator-body');
        return () => {
            document.body.classList.remove('formGenerator-body');
        };
    }, []);
    const {
        fields: formDefaultFields,
        insert: formDefaultInsert,
        swap: formDefaultSwap,
        move: formDefaultMove,
        remove: formDefaultRemove,
        replace: formDefaultReplace,
    } = useFieldArray({
        control,
        name: `formGenerator`,
    });
    const {
        fields: formVisibleFields,
        insert: formVisibleInsert,
        remove: formVisibleRemove,
        swap: formVisibleSwap,
    } = useFieldArray({
        control,
        name: `formGeneratorVisible`,
    });

    useEffect(() => {
        async function getEdit() {
            if (!!queryParams) {
                if (cachedEditFormData) {
                    const getForm = buildFormEdit(cachedEditFormData, dispatchState);
                    reset(getForm);
                    formDefaultReplace(getForm.formGenerator || []);
                    dispatch(getFormGeneratorsDatas({ field: 'cachedEditFormData', data: null }));
                    return;
                }
                let payload = { departmentId, clientId, userId, recipientFormId: queryParams?.recipientFormId || 0 };
                let { data, status } = await dispatch(getFormData(payload));
                if (status) {
                    setFormData(data);
                    const getForm = buildFormEdit(data, dispatchState);
                    reset(getForm);
                    formDefaultReplace(getForm.formGenerator || []);
                }
            }
        }
        getEdit();
    }, [queryParams, cachedEditFormData]);

    const [
        selectedColor,
        defaultTypes,
        formStylesTheme,
        formStylesFont,
        formStylesFontSize,
        formStylesFontColor,
        formStylesLogoEnabled,
        formStylesLogoStyle,
        formStylesInputStyle,
        formStylesButtonRounding,
        formStylesButtonAlignment,
        formStylesLayoutAlignment,
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
        headerConfigFontSize,
        headerConfigFontFamily,
        formStylesFormBackgroundImage,
        formStylesFormBackgroundColor,
        formStylesFormBackgroundEnabled,
        formStylesPaginationEnabled,
        formStylesPagination,
        formStylesItemsPerPage,
    ] = watch([
        ...INITIAL_WATCH_STATE,
        'formStyles.theme',
        'formStyles.font',
        'formStyles.fontSize',
        'formStyles.fontColor',
        'formStyles.logoEnabled',
        'formStyles.logoStyle',
        'formStyles.inputStyle',
        'formStyles.buttonRounding',
        'formStyles.buttonAlignment',
        'formStyles.layoutAlignment',
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
        'headerConfig.headerFontSize',
        'headerConfig.headerFontFamily',
        'formStyles.formBackgroundImage',
        'formStyles.formBackgroundColor',
        'formStyles.formBackgroundEnabled',
        'formStyles.paginationEnabled',
        'formStyles.pagination',
        'formStyles.itemsPerPage',
    ]);

    useEffect(() => {
        setValue(`selectedColor`, selectedColor);
    }, [selectedColor, setValue]);

    // Sync logoPositionAlignment with headerConfig.alignment - prioritize form value
    useEffect(() => {
        if (headerConfigAlignment !== undefined && headerConfigAlignment !== null && headerConfigAlignment !== '') {
            setLogoPositionAlignment(headerConfigAlignment);
        }
    }, [headerConfigAlignment]);

    // Set default alignment when logo is enabled for the first time
    useEffect(() => {
        if (formStylesLogoEnabled && (!headerConfigAlignment || headerConfigAlignment === '')) {
            const defaultAlign = 'center';
            setLogoPositionAlignment(defaultAlign);
            setValue('headerConfig.alignment', defaultAlign, { shouldValidate: false });
        }
    }, [formStylesLogoEnabled, headerConfigAlignment, setValue]);

    // Compute logo alignment for justifyContent - memoized to update when alignment changes
    const logoJustifyContent = useMemo(() => {
        const align = headerConfigAlignment || logoPositionAlignment || 'center';
        return align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';
    }, [headerConfigAlignment, logoPositionAlignment]);

    // Get header layout position (top/left/right) - memoized
    const headerLayoutPosition = useMemo(() => {
        return headerConfigLayoutPosition || 'top';
    }, [headerConfigLayoutPosition]);

    // Extract logo URL - handle both string and object formats
    const logoUrl = useMemo(() => {
        if (!headerConfigLogo) {
            if (currClient?.logoPath) {
                return currClient.logoPath.startsWith('data:')
                    ? currClient.logoPath
                    : `data:image/jpeg;base64,${currClient.logoPath}`;
            }
            return '';
        }
        if (typeof headerConfigLogo === 'string') return headerConfigLogo;
        // If it's an object, try to extract the URL from common properties
        if (typeof headerConfigLogo === 'object') {
            return (
                headerConfigLogo.url ||
                headerConfigLogo.imageUrl ||
                headerConfigLogo.inputUrl ||
                headerConfigLogo.data ||
                ''
            );
        }
        return '';
    }, [headerConfigLogo, clientList]);

    // Extract background image URL - handle both string and object formats
    const backgroundImageUrl = useMemo(() => {
        if (!headerConfigBackgroundImage) return '';
        if (typeof headerConfigBackgroundImage === 'string') return headerConfigBackgroundImage;
        // If it's an object, try to extract the URL from common properties
        if (typeof headerConfigBackgroundImage === 'object') {
            return (
                headerConfigBackgroundImage.url ||
                headerConfigBackgroundImage.imageUrl ||
                headerConfigBackgroundImage.inputUrl ||
                headerConfigBackgroundImage.data ||
                ''
            );
        }
        return '';
    }, [headerConfigBackgroundImage]);

    // Extract form background image URL - handle both string and object formats
    const formBackgroundImageUrl = useMemo(() => {
        if (!formStylesFormBackgroundImage) return '';
        if (typeof formStylesFormBackgroundImage === 'string') return formStylesFormBackgroundImage;
        // If it's an object, try to extract the URL from common properties
        if (typeof formStylesFormBackgroundImage === 'object') {
            return (
                formStylesFormBackgroundImage.url ||
                formStylesFormBackgroundImage.imageUrl ||
                formStylesFormBackgroundImage.inputUrl ||
                formStylesFormBackgroundImage.data ||
                ''
            );
        }
        return '';
    }, [formStylesFormBackgroundImage]);

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
    // This function takes layout direction to handle alignment properly
    const getNameAlignmentStyle = useCallback(
        (layoutDirection = 'row') => {
            const align = headerConfigNameAlignment || 'center';

            // Common alignment logic for both row and column layouts
            // textAlign works for horizontal alignment, alignSelf works for vertical alignment in flex containers
            switch (align) {
                case 'left':
                    return {
                        textAlign: 'left',
                        alignSelf: 'center',
                    };
                case 'right':
                    return {
                        textAlign: 'right',
                        alignSelf: 'center',
                    };
                case 'center':
                    return {
                        textAlign: 'center',
                        alignSelf: 'center',
                    };
                case 'top':
                    return {
                        textAlign: 'center',
                        alignSelf: 'flex-start',
                    };
                case 'bottom':
                    return {
                        textAlign: 'center',
                        alignSelf: 'flex-end',
                    };
                default:
                    return {
                        textAlign: 'center',
                        alignSelf: 'center',
                    };
            }
        },
        [headerConfigNameAlignment],
    );

    // Update headerConfig.alignment when logoPositionAlignment changes
    const handleLogoAlignmentChange = (align) => {
        setLogoPositionAlignment(align);
        setValue('headerConfig.alignment', align, { shouldValidate: true, shouldDirty: true });
    };

    // Theme definitions - memoized to prevent re-creation
    const themeDefinitions = useMemo(
        () => ({
            light: {
                name: 'Light',
                background: 'transparent',
                text: '#333333',
                accent: '#007bff',
                border: '#e0e0e0',
                formBackground: 'transparent',
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
                formBackground: 'transparent',
                textField01: '#495057',
                textField02: '#dee2e6',
            },
            charcoal: {
                name: 'Charcoal',
                background: '#36454f',
                text: 'transparent',
                accent: '#000000',
                border: '#4a5d6e',
                formBackground: '#4a5d6e',
                textField01: 'transparent',
                textField02: '#36454f',
            },
            quietSands: {
                name: 'Quiet Sands',
                background: '#f5f5dc',
                text: '#333333',
                accent: '#ffd700',
                border: '#e0e0d0',
                formBackground: 'transparent',
                textField01: '#333333',
                textField02: '#e0e0d0',
            },
            cyberDawn: {
                name: 'Cyber Dawn',
                background: '#1a1a2e',
                text: 'transparent',
                accent: '#ffd700',
                border: '#16213e',
                formBackground: '#16213e',
                textField01: 'transparent',
                textField02: '#1a1a2e',
            },
        }),
        [],
    );

    // Helper to get theme colors - memoized
    const themeColors = useMemo(() => {
        // Get the theme value (handle both object and string formats)
        let themeValue = typeof formStylesTheme === 'object' ? formStylesTheme?.value : formStylesTheme;

        // If it's a theme object with colors (for custom themes), return it directly
        if (typeof formStylesTheme === 'object' && formStylesTheme?.background) {
            return {
                background: formStylesTheme.background,
                text: formStylesTheme.text || formStylesTheme.textField01 || '#333333',
                accent: formStylesTheme.accent || formStylesTheme.primary || '#007bff',
                border: formStylesTheme.border || formStylesTheme.textField02 || '#e0e0e0',
                formBackground: formStylesTheme.formBackground || formStylesTheme.background || 'transparent',
                textField01: formStylesTheme.textField01 || formStylesTheme.text || '#333333',
                textField02: formStylesTheme.textField02 || formStylesTheme.border || '#e0e0e0',
            };
        }

        return themeDefinitions[themeValue] || themeDefinitions.light;
    }, [formStylesTheme, themeDefinitions]);

    // Font value to fontFamily mapping - matches FormSidebar fontOptions
    const fontFamilyMap = useMemo(
        () => ({
            muktaregular: 'MuktaRegular,sans-serif',
            arial: 'Arial, sans-serif',
            courier: '"Courier New", Courier, monospace',
            georgia: 'Georgia, serif',
            helvetica: 'Helvetica, Arial, sans-serif',
            impact: 'Impact, Haettenschweiler, sans-serif',
            lucida: '"Lucida Console", Monaco, monospace',
            tahoma: 'Tahoma, Geneva, sans-serif',
            times: '"Times New Roman", Times, serif',
            trebuchet: '"Trebuchet MS", Helvetica, sans-serif',
            verdana: 'Verdana, Geneva, sans-serif',
        }),
        [],
    );

    // Helper to get font value - memoized
    const fontValue = useMemo(() => {
        // If formStylesFont is an object with fontFamily property, use it directly
        if (typeof formStylesFont === 'object' && formStylesFont?.fontFamily) {
            return formStylesFont.fontFamily;
        }

        const fontVal = typeof formStylesFont === 'object' ? formStylesFont?.value : formStylesFont;
        if (!fontVal || fontVal === 'default') {
            return 'inherit';
        }
        // Return the fontFamily string if mapping exists, otherwise return the value as-is
        return fontFamilyMap[fontVal] || fontVal;
    }, [formStylesFont, fontFamilyMap]);

    // Helper to get button rounding value - memoized
    const buttonRoundingValue = useMemo(() => {
        const roundingVal =
            typeof formStylesButtonRounding === 'object' && formStylesButtonRounding !== null
                ? formStylesButtonRounding?.value
                : formStylesButtonRounding || 'default';
        return roundingVal;
    }, [formStylesButtonRounding]);

    // Helper to get button alignment value - memoized
    const buttonAlignmentValue = useMemo(() => {
        const alignVal =
            typeof formStylesButtonAlignment === 'object' && formStylesButtonAlignment !== null
                ? formStylesButtonAlignment?.value
                : formStylesButtonAlignment || 'center';
        return alignVal;
    }, [formStylesButtonAlignment]);

    // Helper to get logo style value - memoized
    const logoStyleValue = useMemo(() => {
        const styleVal =
            typeof formStylesLogoStyle === 'object' && formStylesLogoStyle !== null
                ? formStylesLogoStyle?.value
                : formStylesLogoStyle || 'style3';
        return styleVal;
    }, [formStylesLogoStyle]);

    // Get input style based on selection - same logic as FormStyles.jsx
    const getInputStyle = useMemo(() => {
        const inputStyleValue =
            typeof formStylesInputStyle === 'object' && formStylesInputStyle !== null
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

    // Get text field size - same logic as FormStyles.jsx
    const getTextFieldSize = useMemo(() => {
        const textFieldSizeValue =
            typeof formStylesTextFieldSize === 'object' && formStylesTextFieldSize !== null
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

    useEffect(() => {
        if (hasRun.current) return;
        if (dataCatalogueAttrs?.length > 0 && !queryParams) {
            //    let mapToValue
            //     for(let i=0; i<=3; i++){
            //         mapToValue =dataCatalogueAttrs?.find((item) => item?.attributeName === formState.dropAble[i]?.labelName)
            //        console.log('mapToValue: ', mapToValue);
            //     }
            //     let a = formState.dropAble?.map((e) => ({ ...e, mapTo: dataCatalogueAttrs , mapToValue: mapToValue}));
            //     console.log('dataCatalogueAttrs: ', dataCatalogueAttrs);
            //     console.log('formState: ', formState);
            //     setValue(`formGenerator`, a);

            let updatedDropAble = formState.dropAble.map((e, index) => {
                let label = e?.labelName || '';

                // Apply fallback logic only for the first 5 elements (Name, Email, Mobile, Gender, City)
                if (index <= 4) {
                    if (['Email', 'EmailID', 'emailAddress'].includes(label)) {
                        label = 'EmailID';
                    } else if (['MobileNo', 'Mobile'].includes(label)) {
                        label = 'MobileNo';
                    } else if (['Gender'].includes(label)) {
                        label = 'Gender';
                    } else if (['City'].includes(label)) {
                        label = 'City';
                    }
                }

                return {
                    ...e,
                    mapTo: [],
                    ...(index <= 4 && {
                        mapToValue: getAttribute(dataCatalogueAttrs?.find((item) => item?.uIPrintableName === label)),
                    }),
                };
            });
            formDefaultReplace(updatedDropAble);
            setValue(`formGeneratorVisible`, formState.visibleAndQueued);
            hasRun.current = true;
        }
    }, [dataCatalogueAttrs, queryParams, formState.dropAble, formState.visibleAndQueued, setValue]);

    useEffect(() => {
        const payload = {
            departmentId,
            clientId,
            userId,
        };
        dispatch(getDataAttributes(payload, false));
    }, [departmentId, clientId, userId, dispatch]);

    // Filter input types based on form type (tag)
    useEffect(() => {
        if (tag === 'KYC') {
            // For KYC forms, filter out Matrix, Rating, Ranking, Slider, Comment box, Multi choice, and Phone/Mobile Number
            const filteredTypes = INPUT_TYPES.filter((type) => {
                const excludedTypes = [
                    'Matrix',
                    'Rankrating',
                    'Rating',
                    'RangeSlider',
                    'CommentBox',
                    'multichoice',
                    'PhoneInput',
                    'starrating',
                    'CommentRating',
                ];
                return !excludedTypes.includes(type.columnType);
            });
            setInputTypes(filteredTypes);
        } else {
            // For Survey and other forms, show all input types
            setInputTypes(INPUT_TYPES);
        }
    }, [tag]);

    const scrollList = useMemo(() => {
        if (!inputTypes?.length) return [];
        // Responsive items per page based on screen width
        let ITEMS_PER_PAGE = 8;
        if (windowWidth < 1200) {
            ITEMS_PER_PAGE = 6;
        } else if (windowWidth < 1400) {
            ITEMS_PER_PAGE = 6;
        } else if (windowWidth < 1500) {
            ITEMS_PER_PAGE = 7;
        } else if (windowWidth < 1600) {
            ITEMS_PER_PAGE = 8;
        }
        const SLIDE_STEP = ITEMS_PER_PAGE; // Slide by same number to show next set of items
        const totalSlides = Math.max(1, Math.ceil(inputTypes.length / SLIDE_STEP));
        return Array.from({ length: totalSlides }, (_, slideIndex) =>
            inputTypes.slice(slideIndex * SLIDE_STEP, slideIndex * SLIDE_STEP + ITEMS_PER_PAGE),
        );
    }, [inputTypes, windowWidth]);

    const enforceProfilingLimit = useCallback(() => {
        const currentFormData = getValues('formGenerator') || [];
        const form = currentFormData.map((field) => {
            if (field.field) return field; // Keep separator fields as-is
            const inputType = INPUT_TYPES.find(
                (type) =>
                    type.componentName === field?.componentName ||
                    type.columnType === field?.columnType ||
                    type.name === field?.name,
            );

            // Use field values if they exist, otherwise fallback to defaults - never use empty strings
            return {
                ...field,
                component: inputType?.component,
                labelName:
                    field?.labelName ||
                    field?.tinyMceLabelMain ||
                    field?.tinyMceLable ||
                    inputType?.labelName ||
                    'Field',
                placeHolder: field?.placeHolder || inputType?.placeHolder || '',
                icon: field?.icon || inputType?.icon || '',
                text: field?.text || inputType?.text || '',
                name: field?.name || inputType?.name || '',
            };
        });

        const textBlocks = form.filter((f) => f.columnType === 'TextBlock');
        const changed = form.filter((f) => !f.field && f.columnType !== 'TextBlock');

        const limit = parseInt(fieldCount || 0, 10);
        const { visibleFields, queuedFields } = splitFieldsForProgressiveProfiling(changed, limit);
        const visible = [{ field: 'Visible fields' }, ...visibleFields];
        const queued = [{ field: 'Queued fields' }, ...queuedFields];

        const combined = [...textBlocks, ...visible, ...queued].map((e) => {
            if (e.field) {
                return e;
            }
            return {
                ...e,
                labelName: e.tinyMceLableMain ?? e.tinyMceLable ?? e.labelName ?? e.text ?? 'Field',
            };
        });

        setValue('formGeneratorVisible', combined);
        formDefaultReplace(combined);
        dispatchState({
            type: 'UPDATE',
            field: 'visibleAndQueued',
            payload: combined,
        });
    }, [dispatchState, getValues, setValue, fieldCount, formDefaultReplace]);
    const removeField = () => {
        if (removeStatus === 'Visible') {
            formVisibleRemove(removeIndex);
        }
        if (removeStatus === 'default') {
            if (profilingToggle) {
                formDefaultRemove(removeIndex);
                enforceProfilingLimit();
            } else {
                formDefaultRemove(removeIndex);
            }
        }
        dispatchState({
            type: 'UPDATE',
            field: 'removePopup',
            payload: false,
        });
    };

    const onMouseLeave = useCallback(
        (e) => {
            e.preventDefault();
            dispatchState({
                type: 'UPDATE_DRAG_OVER',
                payload: {
                    dragIndex: null,
                    isDropped: false,
                },
            });
        },
        [dispatchState],
    );

    const handleSaveandGenerate = async (nameStatus, formName) => {
        if (nameStatus) {
            let getData = getValues();

            const { Submit, CancelView, previewData, profilingToggle, layout } = formState;
            const PreviewFormstate = { Submit, CancelView, previewData, profilingToggle, layout };

            // warning pop to prevent not exist in email or mobile in form flow

            const { formGenerator } = getData;
            const isExistEmailOrMobile = formGenerator?.some(
                (value) =>
                    value?.mapToValue?.attributeName?.toLowerCase()?.includes('email') ||
                    value?.mapToValue?.attributeName?.toLowerCase()?.includes('mobile'),
            );

            if (formGenerator?.length === 1 && !isExistEmailOrMobile) {
                setShowPopup({
                    message: EMAIL_ID_MOBILE_NO,
                    show: true,
                });
                setSaveModal((prev) => ({
                    ...prev,
                    show: false,
                }));
                return;
            }

            const previewContentData = {
                dropValue: formGenerator || [],
                previewData: previewTemp || [],
                selectedColor,
                formState: PreviewFormstate,
            };
            const payload = buildPayload(getData, queryParams?.recipientFormId, tag, previewContentData, formName);
            payloadData = payload;

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
                    const payload = {
                        departmentId,
                        clientId,
                        userId,
                        recipientFormId: data?.formId || queryParams?.recipientFormId || 0,
                    };
                    let res = await dispatch(publishFormbyID(payload));
                    setPreviewGenerate({
                        show: true,
                        name: getData.formName,
                        formDataValues: payloadData,
                        savedata: {
                            data,
                        },
                        publishData: res?.data || {},
                    });
                }
            } finally {
                setIsSaveLoading(false);
            }
        } else {
            setSaveModal((prev) => ({
                ...prev,
                show: false,
            }));
        }
    };

    const getPreviewData = useCallback(() => {
        let data = getValues();
        let temp = data.formGenerator.map((e) => {
            if (e?.columnType === 'TextBlock') {
                return { value: !!e?.tinyMceLableMain ? e?.tinyMceLableMain : e?.labelName, type: e.columnType };
            } else if (e?.columnType === 'Matrix') {
                let tempRows = [],
                    tempCol = [];
                for (let i = 0; i < e?.matrix?.rows?.length; i++) {
                    let cb = new Array(e?.matrix?.columns?.length)
                        .fill(0)
                        ?.map((ele, i) => e?.matrixSub?.[i]?.[`checkBox${i}`]);
                    tempRows?.push({
                        id: uniqueId(),
                        title: e?.matrixSub?.[i]?.tinyMceLableHeading,
                        checkBox: cb,
                    });
                }
                for (let i = 0; i < e?.matrix?.columns?.length; i++) {
                    tempCol?.push({
                        tinyMceLableHeading: e?.matrixTitle?.[i]?.tinyMceLableHeading,
                    });
                }
                return {
                    type: e?.columnType,
                    value: !!e?.tinyMceLableMain ? e?.tinyMceLableMain : e?.labelName,
                    matrixSub: tempRows,
                    matrixTitle: tempCol,
                    // matrixTitle: e?.matrixTitle,
                    rowDefaultValue: 'Row value',
                    colDefaultValue: 'Column value',
                };
            } else if (e?.columnType === 'RangeSlider') {
                return {
                    type: e?.columnType,
                    value: e?.tinyMceLableMain || e?.labelName,
                    goodLabelName: e?.tinyMceLableMainSliderGood,
                    verygoodLabelName: e?.tinyMceLableMainSliderVeryGood,
                    badLabelName: e?.tinyMceLableMainSliderBad,
                };
            } else if (e?.columnType === 'Participants') {
                return {
                    type: e?.columnType,
                    value: e?.tinyMceLable || e?.labelName,
                    participant: e?.participant || [false, true, true, false],
                    participantTotal: e?.participantTotal,
                };
            } else return { value: e.tinyMceLable || e?.tinyMceLableMain || e.labelName, type: e.columnType };
        });

        setPreviewTemp(temp);
    }, [getValues, setPreviewTemp]);

    const hasContent = useCallback((input) => {
        if (!/<[^>]*>/.test(input)) {
            return input.trim().length > 0;
        }

        const re = /<([a-zA-Z0-9]+)\b[^>]*>\s*([^<>\s][\s\S]*?)<\/\1>/i;
        return re.test(input.trim());
    }, []);

    const handleSave = (data) => {
        let hasError = false;
        const formValues = getValues('formGenerator');

        let hasPhoneOrEmail = false;
        let labelError = false;
        let mappingError = false;
        let mandatoryError = false;

        formValues?.forEach((ele, ind) => {
            // Check if label is the default value
            const inputType = INPUT_TYPES.find((type) => type.columnType === ele?.columnType);
            const defaultLabel = inputType?.labelName?.trim();
            const currentLabel = ele?.tinyMceLable?.trim();

            if (currentLabel !== undefined) {
                if (!hasContent(currentLabel)) {
                    setError(`formGenerator[${ind}].tinyMceLable`, {
                        type: 'custom',
                        message: THIS_FIELD_IS_REQUIRED,
                    });
                    hasError = true;
                    setTimeout(() => {
                        const formContainer = document.getElementById('form');
                        if (formContainer) {
                            const allComponents = formContainer.querySelectorAll(
                                '.form-builder-component, .fbc-preview',
                            );
                            const errorComponent = allComponents[ind];

                            if (errorComponent) {
                                errorComponent.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        }
                    }, 100);
                }
            }
            if (ele?.labelName?.trim() !== undefined) {
                if (!hasContent(ele?.labelName)) {
                    setError(`formGenerator[${ind}].tinyMceLable`, {
                        type: 'custom',
                        message: THIS_FIELD_IS_REQUIRED,
                    });
                    hasError = true;
                    setTimeout(() => {
                        const formContainer = document.getElementById('form');
                        if (formContainer) {
                            const allComponents = formContainer.querySelectorAll(
                                '.form-builder-component, .fbc-preview',
                            );
                            const errorComponent = allComponents[ind];

                            if (errorComponent) {
                                errorComponent.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        }
                    }, 100);
                }
            }
            if (ele?.columnType === 'TimeDate') {
                return;
            }

            const label = ele?.tinyMceLable?.trim()?.toLowerCase();

            // Check if label contains 'email' or 'number'
            if (
                ele?.componentName === 'PhoneInput' ||
                (ele?.columnType === 'Textbox' && (label?.includes('email') || label?.includes('mobile')))
            ) {
                hasPhoneOrEmail = true;
            }

            const stripHtml = (str) => str?.replace(/<[^>]*>/g, '').trim();
            const cleanCurrentLabel = stripHtml(currentLabel);
            const cleanDefaultLabel = stripHtml(defaultLabel);

            if (cleanCurrentLabel && cleanDefaultLabel && cleanCurrentLabel === cleanDefaultLabel) {
                setError(`formGenerator[${ind}].tinyMceLable`, {
                    type: 'custom',
                    message: CHNAGE_DEFAULT_LABEL,
                });
                // labelError = true;
                hasError = true;

                if (!labelError) {
                    setTimeout(() => {
                        const formContainer = document.getElementById('form');
                        if (formContainer) {
                            const allComponents = formContainer.querySelectorAll(
                                '.form-builder-component, .fbc-preview',
                            );
                            const errorComponent = allComponents[ind];

                            if (errorComponent) {
                                errorComponent.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        }
                    }, 100);
                    labelError = true;
                }
            }
            // TextBlock validation
            if (ele?.columnType === 'TextBlock') {
                const isDefault = ele?.tinyMceLableMain === DEFAULT_VALUE;
                if (isDefault) {
                    setError(`formGenerator[${ind}].tinyMceLableMain`, {
                        type: 'custom',
                        message: CHNAGE_DEFAULT_TEXT,
                    });
                    hasError = true;

                    if (!labelError) {
                        setTimeout(() => {
                            const formContainer = document.getElementById('form');
                            if (formContainer) {
                                const allComponents = formContainer.querySelectorAll(
                                    '.form-builder-component, .fbc-preview',
                                );
                                const errorComponent = allComponents[ind];

                                if (errorComponent) {
                                    errorComponent.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }
                            }
                        }, 100);
                        labelError = true;
                    }
                }
            }

            if (ele?.columnType === 'multichoice') {
                if (ele.multiChoice && Array.isArray(ele.multiChoice)) {
                    const validationIndex = ele.multiChoice.findIndex((item) => item.answer === '');
                    if (validationIndex !== -1) {
                        setError(`formGenerator[${ind}].multiChoice[${validationIndex}].answer`, {
                            type: 'custom',
                            message: ENTER_ANSWER,
                        });
                        hasError = true;
                    }
                }
            }

            if (ele?.columnType === 'Rankrating') {
                const validationIndex = ele.rankingFields.findIndex((item) => item.answer === '');
                if (validationIndex !== -1) {
                    setError(`formGenerator[${ind}].rankingFields[${validationIndex}].answer`, {
                        type: 'custom',
                        message: ENTER_ANSWER,
                    });
                    hasError = true;
                }
            }
        });

        const isExistEmailOrMobile = formValues?.some(
            (value) =>
                value?.mapToValue?.attributeName?.toLowerCase()?.includes('email') ||
                value?.mapToValue?.attributeName?.toLowerCase()?.includes('mobile'),
        );
        const hasMandatoryPhoneOrEmail =
            isExistEmailOrMobile &&
            formValues?.some((value) => {
                const attr = value?.mapToValue?.attributeName?.toLowerCase();
                return (attr?.includes('email') || attr?.includes('mobile')) && value?.mandatory === true;
            });

        // if (!hasPhoneOrEmail) {
        //     labelError = true;
        //     hasError = true;
        // }

        // if (!isExistEmailOrMobile) {
        //     mappingError = true;
        //     hasError = true;
        // }

        // // Check if at least one field mapped to email or mobile is mandatory
        // if (isExistEmailOrMobile && !hasMandatoryPhoneOrEmail) {
        //     mandatoryError = true;
        //     hasError = true;
        // }

        // if (labelError) {
        //     setShowPopup({
        //         message: validation.FORM_LABEL,
        //         show: true
        //     });
        // } else if (mappingError) {
        //     setShowPopup({
        //         message: validation.FORM_MAPPING,
        //         show: true
        //     });
        // } else if (mandatoryError) {
        //     setShowPopup({
        //         message: validation.FORM_MANDATORY,
        //         show: true
        //     });
        // }
        const hasAtLeastOneField = formValues && formValues.length > 0;

        if (!hasAtLeastOneField) {
            setShowPopup({
                message: FORM_AT_LEAST_ONE_FIELD,
                show: true,
            });
            return;
        }

        const hasMandatoryField = formValues?.some((value) => {
            return value?.mandatory;
        });

        if (!hasMandatoryField) {
            setShowPopup({
                message: FORM_ONE_MANDATORY,
                show: true,
            });
            return;
        }

        if (profilingToggle && fieldCount) {
            const visibleFieldsMarkerIndex = formValues?.findIndex((item) => item?.field === 'Visible fields');
            const queuedFieldsMarkerIndex = formValues?.findIndex((item) => item?.field === 'Queued fields');
            let actualVisibleFieldsCount = 0;
            if (visibleFieldsMarkerIndex !== -1 && queuedFieldsMarkerIndex !== -1) {
                for (let i = visibleFieldsMarkerIndex + 1; i < queuedFieldsMarkerIndex; i++) {
                    if (formValues[i]?.columnType !== 'TextBlock') {
                        actualVisibleFieldsCount++;
                    }
                }
            } else {
                actualVisibleFieldsCount = formValues?.filter(({ columnType }) => columnType !== 'TextBlock').length;
            }
            if (actualVisibleFieldsCount < fieldCount) {
                setShowPopup({
                    message: PROGRESSIVE_PROFILING_FIELD_COUNT_MISMATCH,
                    show: true,
                });
                return;
            }
        }
        const isTermsAndConditionsEnabled = data?.AgreeCheckbox;

        if (isTermsAndConditionsEnabled) {
            const currentAgreeText = data?.tinyMceLableAgree;

            // Function to check if text contains a valid URL in an anchor tag
            const hasValidUrlInAnchorTag = (text) => {
                if (!text) return false;

                // Regular expression to match anchor tags with href attribute
                const anchorTagRegex = /<a[^>]+href\s*=\s*["']([^"']+)["'][^>]*>/i;
                const match = text.match(anchorTagRegex);

                if (!match) return false;

                const url = match[1];

                // Check if the URL is valid (basic URL validation)
                try {
                    new URL(url);
                    return true;
                } catch {
                    // If URL constructor fails, check for relative URLs or basic patterns
                    const urlPattern = /^(https?:\/\/|\/|\.\/|\.\.\/)/i;
                    return urlPattern.test(url);
                }
            };

            if (!hasValidUrlInAnchorTag(currentAgreeText)) {
                // Clear any existing errors first to prevent duplication
                clearErrors('tinyMceLableAgree');
                setError('tinyMceLableAgree', {
                    type: 'custom',
                    message: 'Please set a valid URL for terms and conditions',
                });
                hasError = true;
            }
        }

        if (!hasError && !editMode) {
            setSaveModal({
                show: true,
                data: data,
            });
        }
        if (!hasError && editMode) {
            handleSaveandGenerate(true, getValues('formName') ?? queryParams?.formName);
        }
    };

    const handlePreview = useCallback(() => {
        let data = getValues();
        let temp = data.formGenerator.map((e) => {
            if (e?.columnType === 'TextBlock') {
                return { value: !!e?.tinyMceLableMain ? e?.tinyMceLableMain : e?.labelName, type: e.columnType };
            } else if (e?.columnType === 'Matrix') {
                let tempRows = [],
                    tempCol = [];
                for (let i = 0; i < e?.matrix?.rows?.length; i++) {
                    let cb = new Array(e?.matrix?.columns?.length)
                        .fill(0)
                        ?.map((ele, i) => e?.matrixSub?.[i]?.[`checkBox${i}`]);
                    tempRows?.push({
                        id: uniqueId(),
                        title: e?.matrixSub?.[i]?.tinyMceLableHeading,
                        checkBox: cb,
                    });
                }
                for (let i = 0; i < e?.matrix?.columns?.length; i++) {
                    tempCol?.push({
                        tinyMceLableHeading: e?.matrixTitle?.[i]?.tinyMceLableHeading,
                    });
                    //  tempCol = e?.matrixTitle?.filter((item) => !!item?.tinyMceLableHeading);
                }
                return {
                    type: e?.columnType,
                    value: !!e?.tinyMceLableMain ? e?.tinyMceLableMain : e?.labelName,
                    // matrixSub: e?.matrixSub?.map((mat, ind) => {
                    //     // debugger;

                    //     let cb = new Array(e?.matrixSub?.length).fill(0)?.map((ele, i) => mat?.[`checkBox${i}`]);
                    //     return {
                    //         id: uniqueId(),
                    //         title: mat?.tinyMceLableHeading,
                    //         checkBox: cb,
                    //     };
                    // }),
                    matrixSub: tempRows,
                    matrixTitle: tempCol,
                    // matrixTitle: e?.matrixTitle,
                    rowDefaultValue: 'Row value',
                    colDefaultValue: 'Column value',
                    settingColumnType: e?.settings?.isChecked,
                };
            } else if (e?.columnType === 'RangeSlider') {
                return {
                    type: e?.columnType,
                    value: e?.tinyMceLableMain || e?.labelName,
                    goodLabelName: e?.tinyMceLableMainSliderGood,
                    verygoodLabelName: e?.tinyMceLableMainSliderVeryGood,
                    badLabelName: e?.tinyMceLableMainSliderBad,
                };
            } else if (e?.columnType === 'Participants') {
                return {
                    type: e?.columnType,
                    value: e?.tinyMceLable || e?.labelName,
                    participant: e?.participant || [false, true, true, false],
                    participantTotal: e?.participantTotal,
                };
            } else return { value: e.tinyMceLable || e?.tinyMceLableMain || e.labelName, type: e.columnType };
        });
        setPreviewTemp(temp);
        dispatchState({
            type: 'UPDATE_PREVIEW',
            payload: {
                previewData: data,
                previewFlag: true,
            },
        });
    }, []);

    const onDragStart = useCallback(
        (e, name, index, type) => {
            dispatchState({
                type: 'UPDATE_DRAG_START',
                payload: {
                    typeOfValue: type,
                    isDropped: true,
                    fromIndex: index,
                },
            });
            e.dataTransfer.setData('name', name);

            // Create a custom drag image to show the full element
            const dragElement = e.currentTarget;
            const clone = dragElement.cloneNode(true);

            // Style the clone to ensure it's visible and properly sized
            clone.style.position = 'absolute';
            clone.style.top = '-9999px';
            clone.style.left = '-9999px';
            clone.style.width = dragElement.offsetWidth + 'px';
            clone.style.height = dragElement.offsetHeight + 'px';
            clone.style.opacity = '0.8';
            clone.style.border = '1px solid #0000ff';
            clone.style.borderRadius = '10px';
            clone.style.backgroundColor = 'transparent';
            clone.style.padding = '5px 0';
            clone.style.margin = '0 9px 0 0';
            clone.style.pointerEvents = 'none';

            document.body.appendChild(clone);

            // Set the custom drag image
            const offsetX = e.clientX - dragElement.getBoundingClientRect().left;
            const offsetY = e.clientY - dragElement.getBoundingClientRect().top;
            e.dataTransfer.setDragImage(clone, offsetX, offsetY);

            // Clean up the clone after drag starts
            setTimeout(() => {
                document.body.removeChild(clone);
            }, 0);
        },
        [dispatchState],
    );

    const onSave = () => {
        dispatchState({
            type: 'UPDATE_SAVE',
            payload: {
                previewData: false,
                previewFlag: DEFAULT_INPUT_FIELDS,
            },
        });
    };

    const validateDefault = async (status, type) => {
        let result = [];
        let index = _findIndex(getValues('formGenerator'), (item) => item?.mapToValue?.attributeName === 'EmailID');
        setValue('defaultTypes', {
            ...defaultTypes,
            [type]: status,
        });
        // for (var i = 0; i < formGenerator?.length; i++) {
        //     // debugger;
        //     if (formGenerator[i]?.mapToValue?.attributeName === 'EmailID') {
        //         result.push(defaultTypes['EmailID']);
        //         index = i;
        //     }
        //     if (formGenerator[i]?.mapToValue?.attributeName === 'MobileNo') {
        //         result.push(defaultTypes['MobileNO']);
        //     }
        // }
        // result.push(defaultTypes.MobileNO);

        // console.log('result :::::::::::::::::: ', defaultTypes, formGenerator, index);
        if (!defaultTypes.EmailID && !defaultTypes.MobileNO) {
            // setValue(`formGenerator[${index}].makeDefault`, true);
            setValue(`formGenerator[${index}].makeDefault`, true);
            // setValue('defaultTypes.EmailID', true);

            setDefaultModal(true);
            return true;
        } else {
            return false;
        }
    };

    const contextValue = useMemo(
        () => ({
            formState,
            dispatchState,
            enforceProfilingLimit,
            tag,
        }),
        [formState, enforceProfilingLimit, tag],
    );

    return (
        <FormGeneratorContext.Provider value={contextValue}>
            <FormProvider {...methods}>
                <InfoCardFormBuilder
                    data={queryParams}
                    onPreviewClick={handlePreview}
                    onProgressiveProfilingClick={() =>
                        dispatchState({
                            type: 'UPDATE',
                            field: 'settingsPopup',
                            payload: true,
                        })
                    }
                    formFieldsLength={getProgressiveProfilingStats(formDefaultFields).totalFields}
                />
                <div className={``}>
                    {/* <span>Drag and drop the fields to include in your form.</span> */}
                    <div className="rs-builder-elements-holder w-auto d-flex flex-column flex-xl-row align-items-center justify-content-between gap-3">
                        <ul className="rsbeh-form-builder flex-grow-1 mb-0 w-100" style={{ minWidth: 0}}>
                            {scrollList?.length ? (
                                <Carousel
                                    // variant="dark"
                                    className={`gaugeslider-wrapper rs-form-builder-carousel-wrapper ml41 ${
                                        carouselIndex === 0 ? 'hide-prev' : ''
                                    } ${carouselIndex === scrollList.length - 1 ? 'hide-next' : ''}`}
                                    indicators={true}
                                    indicatorLabels={true}
                                    interval={null}
                                    controls={scrollList?.length > 1}
                                    activeIndex={carouselIndex}
                                    onSelect={(selectedIndex) => setCarouselIndex(selectedIndex)}
                                >
                                    {scrollList?.map((items, index) => {
                                        return (
                                            <Carousel.Item key={index}>
                                                <ul>
                                                    {items.map((item, index) => {
                                                        return (
                                                            <li
                                                                key={index}
                                                                draggable
                                                                onDragStart={(e) =>
                                                                    onDragStart(e, item.name, index, item.type)
                                                                }
                                                                className={`${
                                                                    item?.disable
                                                                        ? 'click-off'
                                                                        : item?.componentName === 'TextBlock'
                                                                } ${item?.componentName}`}
                                                                onMouseLeave={(e) => onMouseLeave(e)}
                                                                onDragEnd={(e) => onMouseLeave(e)}
                                                            >
                                                                <div className="d-flex flex-column align-items-center">
                                                                    <i className={`${item.icon} icon-lg `}></i>
                                                                    <h6 className="mt5 fs13">{item.text}</h6>
                                                                </div>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </Carousel.Item>
                                        );
                                    })}
                                </Carousel>
                            ) : (
                                <></>
                            )}
                        </ul>
                        <div
                            className="buttons-holder mt0 flex-shrink-0"
                            style={{
                                display: 'flex',
                                justifyContent:
                                    buttonAlignmentValue === 'left'
                                        ? 'flex-start'
                                        : buttonAlignmentValue === 'right'
                                        ? 'flex-end'
                                        : 'center',
                                gap: '10px',
                                alignItems: 'center',
                            }}
                        >
                            <RSSecondaryButton
                                onClick={() => navigate('/preferences/form-generator')}
                                style={{
                                    borderRadius:
                                        buttonRoundingValue === 'full'
                                            ? '50px'
                                            : buttonRoundingValue === 'none'
                                            ? '0px'
                                            : '4px',
                                }}
                            >
                                {CANCEL}
                            </RSSecondaryButton>

                            {previewFlag && (
                                <Preview
                                    show={previewFlag}
                                    onHide={() =>
                                        dispatchState({
                                            type: 'UPDATE',
                                            field: 'previewFlag',
                                            payload: false,
                                        })
                                    }
                                    selectedColor={selectedColor}
                                    dropAble={getValues('formGenerator')}
                                    previewTemp={previewTemp}
                                    themeColors={themeColors}
                                    fontValue={fontValue}
                                    fontSize={formStylesFontSize > 12 ? formStylesFontSize : 12}
                                    fontColor={formStylesFontColor || '#000000'}
                                    formLayout={formStylesFormLayout || 'horizontal'}
                                    formStylesButtonRounding={buttonRoundingValue}
                                    formStylesButtonAlignment={buttonAlignmentValue}
                                    formStylesLogoEnabled={formStylesLogoEnabled}
                                    formStylesLogoStyle={logoStyleValue}
                                    headerConfigLogo={logoUrl}
                                    headerConfigName={headerConfigName}
                                    headerConfigBackgroundColor={headerConfigBackgroundColor}
                                    headerConfigColor={headerConfigColor}
                                    headerConfigBackgroundImage={headerConfigBackgroundImage}
                                    headerConfigAlignment={headerConfigAlignment || 'center'}
                                    headerLayoutPosition={headerLayoutPosition}
                                    headerConfigLogoAlignment={headerConfigLogoAlignment}
                                    headerConfigNameAlignment={headerConfigNameAlignment}
                                    headerConfigFontSize={headerConfigFontSize}
                                    headerConfigFontFamily={headerConfigFontFamily}
                                    formStylesFormBackgroundImage={formStylesFormBackgroundImage}
                                    formStylesFormBackgroundColor={formStylesFormBackgroundColor}
                                    formStylesFormBackgroundEnabled={formStylesFormBackgroundEnabled}
                                    formStylesInputStyle={formStylesInputStyle}
                                    formStylesTextFieldSize={formStylesTextFieldSize}
                                    getInputStyle={getInputStyle}
                                    getTextFieldSize={getTextFieldSize}
                                    logoJustifyContent={logoJustifyContent}
                                    formStylesPaginationEnabled={formStylesPaginationEnabled}
                                    formStylesPagination={formStylesPagination}
                                    formStylesItemsPerPage={formStylesItemsPerPage}
                                />
                            )}
                            <RSPrimaryButton
                                className={`${Object.keys(errors)?.length === 0 || isValid
                                        ? ''
                                        : 'click-off'
                                    } ${!!location?.linkedCommunication
                                        ? 'click-off'
                                        : ''
                                    }`}
                                isLoading={isSaveLoading}
                                blockBodyPointerEvents
                                onClick={handleSubmit(handleSave)}
                                
                                // bgc={themeColors?.accent}
                                // style={{
                                //     borderRadius: buttonRoundingValue === 'full' ? '50px' :
                                //                 buttonRoundingValue === 'none' ? '0px' :
                                //                 '4px',
                                //     backgroundColor: themeColors?.accent || undefined,
                                //     color: themeColors?.accent ? 'transparent' : undefined, // White text on colored background
                                // }}
                            >
                                {editMode ? UPDATE_GENERATE : SAVE_GENERATE}
                            </RSPrimaryButton>
                        </div>
                    </div>
                </div>
                <div className="mx10">
                    <Row>
                        <Col md={9}>
                            <form onSubmit={handleSubmit(handleSave)} className="">
                                {/* Layout Container - Changes based on headerLayoutPosition */}
                                <div
                                    className={`box-design css-scrollbar form-layout-container ${
                                        headerLayoutPosition === 'top' ? 'layout-top' : 'layout-row'
                                    }`}
                                    style={{
                                        display: 'flex',
                                        flexDirection: headerLayoutPosition === 'top' ? 'column' : 'row',
                                        height: 'calc(100vh - 250px)',
                                        backgroundColor: formStylesFormBackgroundColor || '',
                                        background:
                                            formStylesFormBackgroundEnabled &&
                                            (formBackgroundImageUrl
                                                ? `url(${formBackgroundImageUrl})`
                                                : formStylesFormBackgroundColor || 'transparent'),
                                        backgroundSize:
                                            formStylesFormBackgroundEnabled && formBackgroundImageUrl
                                                ? 'cover'
                                                : 'auto',
                                        backgroundPosition:
                                            formStylesFormBackgroundEnabled && formBackgroundImageUrl
                                                ? 'center'
                                                : 'initial',
                                        backgroundRepeat:
                                            formStylesFormBackgroundEnabled && formBackgroundImageUrl
                                                ? 'no-repeat'
                                                : 'repeat',
                                    }}
                                >
                                    {/* Form Content Column */}
                                    <div
                                        className={`form-content-column ${
                                            headerLayoutPosition === 'top' ||
                                            !formStylesLogoEnabled ||
                                            formStylesFormBackgroundEnabled
                                                ? 'content-full'
                                                : 'content-with-header'
                                        } ${headerLayoutPosition === 'right' ? 'content-right' : 'content-left'} ${!!location?.linkedCommunication ? 'click-off' : ''}`}
                                        style={{
                                            flex: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            order: headerLayoutPosition === 'right' ? 1 : 2, // For right alignment, content comes first
                                        }}
                                    >
                                        <div
                                            className=" mx10 mb10"
                                            style={{
                                                maxWidth: '100%',
                                                margin: '0 auto',
                                                height: headerLayoutPosition === 'top' ? 'calc(100vh - 250px)' : '100%',
                                                flex: 1,
                                            }}
                                        >
                                            <div className="rs-builder-elements-dropped-wrapper rsbedw-form-builder p19">
                                                {/* Header Column - Only shown when logo is enabled (for top and left, render before form content; for right, render after) */}
                                                {formStylesLogoEnabled &&
                                                    (headerLayoutPosition === 'top' ||
                                                        headerLayoutPosition === 'left') && (
                                                        <div
                                                            className={` form-header-column ${
                                                                headerLayoutPosition === 'top'
                                                                    ? 'header-top'
                                                                    : 'header-side'
                                                            } ${headerLayoutPosition === 'left' ? 'header-left' : ''}`}
                                                            style={{
                                                                ...(headerLayoutPosition === 'top'
                                                                    ? {
                                                                          width: '100%',
                                                                          padding: '19px',
                                                                          backgroundColor:
                                                                              headerConfigBackgroundColor ||
                                                                              'transparent',
                                                                          border: headerConfigBackgroundColor
                                                                              ? `1px solid ${headerConfigBackgroundColor}`
                                                                              : '1px solid transparent',
                                                                          order: 1,
                                                                          borderTopLeftRadius: '7px',
                                                                          borderTopRightRadius: '7px',
                                                                      }
                                                                    : {
                                                                          width: '200px',
                                                                          padding: '19px',
                                                                          backgroundColor:
                                                                              headerConfigBackgroundColor ||
                                                                              'transparent',
                                                                          border: headerConfigBackgroundColor
                                                                              ? `1px solid ${headerConfigBackgroundColor}`
                                                                              : '1px solid transparent',
                                                                          display: 'flex',
                                                                          alignItems: 'center',
                                                                          justifyContent: 'center',
                                                                          order: 1, // For left alignment, header comes first
                                                                          flexShrink: 0, // Prevent shrinking
                                                                          borderTopLeftRadius: '7px',
                                                                          borderTopRightRadius: '7px',
                                                                      }),
                                                                backgroundImage: backgroundImageUrl
                                                                    ? `url(${backgroundImageUrl})`
                                                                    : 'none',
                                                                backgroundSize: 'cover',
                                                                backgroundPosition: 'center',
                                                                backgroundRepeat: 'no-repeat',
                                                            }}
                                                        >
                                                            {/* Style 1: Header with background image */}
                                                            {logoStyleValue === 'style1' && backgroundImageUrl && (
                                                                <div
                                                                    style={{
                                                                        backgroundImage: `url(${backgroundImageUrl})`,
                                                                        backgroundSize: 'cover',
                                                                        backgroundPosition: 'center',
                                                                        backgroundRepeat: 'no-repeat',
                                                                        width: '100%',
                                                                        minHeight:
                                                                            headerLayoutPosition === 'top'
                                                                                ? '80px'
                                                                                : '100%',
                                                                        display: 'flex',
                                                                        ...logoAlignmentStyle,
                                                                        padding: '19px',
                                                                        gap: '10px',
                                                                        flexDirection:
                                                                            headerLayoutPosition === 'top'
                                                                                ? 'row'
                                                                                : 'column',
                                                                    }}
                                                                >
                                                                    {logoUrl && (
                                                                        <img
                                                                            src={logoUrl}
                                                                            alt="Logo"
                                                                            style={{
                                                                                maxHeight: '60px',
                                                                                maxWidth: '200px',
                                                                                objectFit: 'contain',
                                                                            }}
                                                                            onError={(e) => {
                                                                                e.target.style.display = 'none';
                                                                            }}
                                                                        />
                                                                    )}
                                                                    {(headerConfigName || !logoUrl) && (
                                                                        <span
                                                                            style={{
                                                                                color: headerConfigColor || '#000000',
                                                                                fontSize: headerConfigFontSize
                                                                                    ? `${headerConfigFontSize}px`
                                                                                    : headerLayoutPosition === 'top'
                                                                                    ? '18px'
                                                                                    : '16px',
                                                                                fontFamily:
                                                                                    headerConfigFontFamily?.fontFamily ||
                                                                                    'inherit',
                                                                                display: 'inline-block',
                                                                                wordBreak: 'break-word',
                                                                                width:
                                                                                    headerLayoutPosition === 'top'
                                                                                        ? 'auto'
                                                                                        : '100%',
                                                                                ...getNameAlignmentStyle(
                                                                                    headerLayoutPosition === 'top'
                                                                                        ? 'row'
                                                                                        : 'column',
                                                                                ),
                                                                            }}
                                                                        >
                                                                            {headerConfigName || ''}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Regular Header - shown when Style 1 background image is not active */}
                                                            {!(logoStyleValue === 'style1' && backgroundImageUrl) && (
                                                                <div
                                                                    className={`d-flex`}
                                                                    style={{
                                                                        ...logoAlignmentStyle,
                                                                        width: '100%',
                                                                        flexDirection:
                                                                            headerLayoutPosition === 'top'
                                                                                ? 'row'
                                                                                : 'column',
                                                                        gap: '10px',
                                                                    }}
                                                                >
                                                                    {logoUrl && (
                                                                        <img
                                                                            src={logoUrl}
                                                                            alt="Logo"
                                                                            style={{
                                                                                maxHeight:
                                                                                    headerLayoutPosition === 'top'
                                                                                        ? '60px'
                                                                                        : '80px',
                                                                                maxWidth:
                                                                                    headerLayoutPosition === 'top'
                                                                                        ? '200px'
                                                                                        : '150px',
                                                                                objectFit: 'contain',
                                                                            }}
                                                                            onError={(e) => {
                                                                                e.target.style.display = 'none';
                                                                            }}
                                                                        />
                                                                    )}
                                                                    {(headerConfigName || !logoUrl) && (
                                                                        <span
                                                                            style={{
                                                                                color: headerConfigColor || '#000000',
                                                                                fontSize: headerConfigFontSize
                                                                                    ? `${
                                                                                          headerConfigFontSize > 12
                                                                                              ? headerConfigFontSize
                                                                                              : 12
                                                                                      }px`
                                                                                    : headerLayoutPosition === 'top'
                                                                                    ? '17px'
                                                                                    : '16px',
                                                                                fontFamily:
                                                                                    headerConfigFontFamily?.fontFamily ||
                                                                                    'inherit',
                                                                                fontWeight: '500',
                                                                                display: 'inline-block',
                                                                                wordBreak: 'break-word',
                                                                                width:
                                                                                    headerLayoutPosition === 'top'
                                                                                        ? 'auto'
                                                                                        : '100%',
                                                                                ...getNameAlignmentStyle(
                                                                                    headerLayoutPosition === 'top'
                                                                                        ? 'row'
                                                                                        : 'column',
                                                                                ),
                                                                            }}
                                                                        >
                                                                            {headerConfigName || ''}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                {/* <div className="rsbed-top text-right mb15"> */}
                                                {/* <RSTooltip
                                                        position="top"
                                                        text={PROGRESSIVE_PROFILE_SETTINGS}
                                                        className="lh0"
                                                    >
                                                        <i
                                                            className={`${formDefaultFields?.length < 6
                                                                ? `click-off ${SETTINGS_ICON} icon-md color-primary-blue mr5`
                                                                : `${SETTINGS_ICON} icon-md color-primary-blue mr5`
                                                                }`}
                                                            onClick={() =>
                                                                dispatchState({
                                                                    type: 'UPDATE',
                                                                    field: 'settingsPopup',
                                                                    payload: true,
                                                                })
                                                            }
                                                        ></i>
                                                    </RSTooltip> */}
                                                {/* <Row>
                                        {/* <Col sm={6}>
                                            <div className="rs-forms-settings-icon">
                                                <span>
                                                    {LAYOUT}: <small className="d-inline-block">{layoutName}</small>
                                                </span>
                                                <RSTooltip position="top" text={LAYOUT_SETTINGS} className="lh0">
                                                    <i
                                                        className={`${form_generator_large} click-off icon-md color-primary-blue mx10`}
                                                        onClick={() =>
                                                            dispatchState({
                                                                type: 'UPDATE',
                                                                field: 'formSettingsPopup',
                                                                payload: true,
                                                            })
                                                        }
                                                    ></i>
                                                </RSTooltip>
                                            </div>
                                        </Col> */}
                                                {/* <Col sm={6} className="text-right">
                                            <ul className="rs-list-inline rli-space-5">
                                                <li>
                                                    <RSTooltip
                                                        position="top"
                                                        text={PROGRESSIVE_PROFILE_SETTINGS}
                                                        className="lh0"
                                                    >
                                                        <i
                                                            className={`${formDefaultFields?.length < 6
                                                                ? `click-off ${SETTINGS_ICON} icon-md color-primary-blue mr5`
                                                                : `${SETTINGS_ICON} icon-md color-primary-blue mr5`
                                                                }`}
                                                            onClick={() =>
                                                                dispatchState({
                                                                    type: 'UPDATE',
                                                                    field: 'settingsPopup',
                                                                    payload: true,
                                                                })
                                                            }
                                                        ></i>
                                                    </RSTooltip>
                                                </li>
                                                <li>
                                                    <RSTooltip
                                                        position="top"
                                                        text="Form Styles"
                                                        className="lh0"
                                                    >
                                                        <i
                                                            className={`${form_generator_large} icon-md color-primary-blue mr5`}
                                                            onClick={() =>
                                                                dispatchState({
                                                                    type: 'UPDATE',
                                                                    field: 'formStylesPopup',
                                                                    payload: true,
                                                                })
                                                            }
                                                        ></i>
                                                    </RSTooltip>
                                                </li>
                                                <li>
                                                    {/* <RSTooltip position="top" text="Form background color"> */}
                                                {/* <div className="rs-builder-colorpicker-container">
                                                        <RSColorPicker
                                                            name="colorPicker"
                                                            icon={COLOR_PICKER}
                                                            onSelect={(color) => setValue(`colorPicker`, color)}
                                                            colorValue={selectedColor}
                                                            tooltipText={FORM_BACKGROUND_COLOR}
                                                        />
                                                    </div>
                                                    {/* </RSTooltip> */}
                                                {/* </li>
                                            </ul>
                                        </Col>
                                    </Row>  */}
                                                {/* </div> */}
                                                <FormSettings
                                                    show={formSettingsPopup}
                                                    onSave={(layout) => {
                                                        dispatchState({
                                                            type: 'UPDATE_FORM_SETTINGS',
                                                            payload: {
                                                                formSettingsPopup: false,
                                                                layout: layout,
                                                            },
                                                        });
                                                    }}
                                                    onHide={() =>
                                                        dispatchState({
                                                            type: 'UPDATE',
                                                            field: 'formSettingsPopup',
                                                            payload: false,
                                                        })
                                                    }
                                                />
                                                <div
                                                    className={`rs-builder-elements-content-wrapper ${layout} ${
                                                        profilingToggle ? 'profilingToggle' : ''
                                                    } form-layout-${formStylesFormLayout || 'horizontal'} input-style-${
                                                        (typeof formStylesInputStyle === 'object' &&
                                                        formStylesInputStyle !== null
                                                            ? formStylesInputStyle?.value
                                                            : formStylesInputStyle) || 'default'
                                                    }`}
                                                    style={{
                                                        background:
                                                            themeColors.formBackground ||
                                                            themeColors.formBackground ||
                                                            '#ffffff',
                                                        backgroundSize:
                                                            formStylesFormBackgroundEnabled && formBackgroundImageUrl
                                                                ? 'cover'
                                                                : 'auto',
                                                        backgroundPosition:
                                                            formStylesFormBackgroundEnabled && formBackgroundImageUrl
                                                                ? 'center'
                                                                : 'initial',
                                                        backgroundRepeat:
                                                            formStylesFormBackgroundEnabled && formBackgroundImageUrl
                                                                ? 'no-repeat'
                                                                : 'repeat',
                                                        color: themeColors.text,
                                                        '--label-font-family': fontValue,
                                                        '--label-font-color': formStylesFontColor || '#000000',
                                                        '--label-font-size': `${
                                                            formStylesFontSize > 12 ? formStylesFontSize : 12
                                                        }px`,
                                                        transition: 'all 0.3s ease',
                                                        // CSS custom properties for input styling
                                                        '--input-border':
                                                            getInputStyle.border === 'none'
                                                                ? 'none'
                                                                : getInputStyle.border ||
                                                                  `1px solid ${themeColors.border}`,
                                                        '--input-border-bottom':
                                                            getInputStyle.borderBottom ||
                                                            (getInputStyle.border === 'none'
                                                                ? `2px solid ${themeColors.border}`
                                                                : getInputStyle.border ||
                                                                  `1px solid ${themeColors.border}`),
                                                        '--input-border-radius': getInputStyle.borderRadius || '4px',
                                                        '--input-padding': getTextFieldSize.padding || '10px 12px',
                                                        '--input-font-size': getTextFieldSize.fontSize || '14px',
                                                        '--input-background-color':
                                                            themeColors.textField02 ||
                                                            (themeColors.background === 'transparent'
                                                                ? 'transparent'
                                                                : themeColors.background),
                                                        '--input-color': themeColors.textField01 || themeColors.text,
                                                        '--input-accent-color': themeColors.accent || '#007bff',
                                                    }}
                                                >
                                                    <ListViewComponent
                                                        componentsData={formDefaultFields}
                                                        formDefaultInsert={formDefaultInsert}
                                                        formDefaultSwap={formDefaultSwap}
                                                        formVisibleSwap={formVisibleSwap}
                                                        formDefaultMove={formDefaultMove}
                                                        formDefaultReplace={formDefaultReplace}
                                                        formVisibleInsert={formVisibleInsert}
                                                        selectedColor={selectedColor}
                                                        profilingToggle={profilingToggle}
                                                        onMouseLeave={onMouseLeave}
                                                        onDragStart={onDragStart}
                                                        setInputTypes={setInputTypes}
                                                        validateDefault={validateDefault}
                                                        fieldCount={fieldCount}
                                                        formVisibleRemove={formVisibleRemove}
                                                        themeColors={themeColors}
                                                        fontValue={fontValue}
                                                        formStylesInputStyle={formStylesInputStyle}
                                                        formStylesTextFieldSize={formStylesTextFieldSize}
                                                        formLayout={formStylesFormLayout || 'horizontal'}
                                                    />
                                                    {/* <AgreeCancel selectedColor={selectedColor} /> */}
                                                    <FormCaptcha
                                                        selectedColor={selectedColor}
                                                        themeColors={themeColors}
                                                    />
                                                    <FormButtons
                                                        selectedColor={selectedColor}
                                                        tag={tag}
                                                        themeColors={themeColors}
                                                        formStylesButtonRounding={buttonRoundingValue}
                                                        formStylesButtonAlignment={buttonAlignmentValue}
                                                    />
                                                </div>
                                                {/* End of rs-builder-elements-content-wrapper */}
                                            </div>
                                            {/* End of rs-builder-elements-dropped-wrapper */}
                                        </div>
                                        {/* End of box-design */}
                                    </div>
                                    {/* End of Form Content Column */}

                                    {/* Header Column - For right alignment, render after form content */}
                                    {formStylesLogoEnabled && headerLayoutPosition === 'right' && (
                                        <div
                                            className={`form-header-column header-side header-right`}
                                            style={{
                                                width: '200px',
                                                padding: '15px',
                                                backgroundColor: headerConfigBackgroundColor || 'transparent',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                order: 2, // For right alignment, header comes after content
                                            }}
                                        >
                                            {/* Style 1: Header with background image */}
                                            {logoStyleValue === 'style1' && backgroundImageUrl && (
                                                <div
                                                    style={{
                                                        backgroundImage: `url(${backgroundImageUrl})`,
                                                        backgroundSize: 'cover',
                                                        backgroundPosition: 'center',
                                                        backgroundRepeat: 'no-repeat',
                                                        width: '100%',
                                                        minHeight: '100%',
                                                        display: 'flex',
                                                        ...logoAlignmentStyle,
                                                        padding: '15px',
                                                        gap: '10px',
                                                        flexDirection: 'column',
                                                    }}
                                                >
                                                    {logoUrl && (
                                                        <img
                                                            src={logoUrl}
                                                            alt="Logo"
                                                            style={{
                                                                maxHeight: '60px',
                                                                maxWidth: '200px',
                                                                objectFit: 'contain',
                                                            }}
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                            }}
                                                        />
                                                    )}
                                                    {(headerConfigName || !logoUrl) && (
                                                        <span
                                                            style={{
                                                                color: headerConfigColor || '#000000',
                                                                fontSize: '18px',
                                                                fontWeight: '500',
                                                                display: 'inline-block',
                                                                width: '100%',
                                                                ...getNameAlignmentStyle('column'),
                                                            }}
                                                        >
                                                            {headerConfigName || ''}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Regular Header - shown when Style 1 background image is not active */}
                                            {!(logoStyleValue === 'style1' && backgroundImageUrl) && (
                                                <div
                                                    className={`d-flex`}
                                                    style={{
                                                        ...logoAlignmentStyle,
                                                        width: '100%',
                                                        flexDirection: 'column',
                                                        gap: '10px',
                                                        ...(backgroundImageUrl && {
                                                            backgroundImage: `url(${backgroundImageUrl})`,
                                                            backgroundSize: 'cover',
                                                            backgroundPosition: 'center',
                                                            backgroundRepeat: 'no-repeat',
                                                            padding: '15px',
                                                        }),
                                                    }}
                                                >
                                                    {logoUrl && (
                                                        <img
                                                            src={logoUrl}
                                                            alt="Logo"
                                                            style={{
                                                                maxHeight: '80px',
                                                                maxWidth: '150px',
                                                                objectFit: 'contain',
                                                            }}
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                            }}
                                                        />
                                                    )}
                                                    {(headerConfigName || !logoUrl) && (
                                                        <span
                                                            style={{
                                                                color: headerConfigColor || '#000000',
                                                                fontSize: '16px',
                                                                fontWeight: '500',
                                                                display: 'inline-block',
                                                                width: '100%',
                                                                ...getNameAlignmentStyle('column'),
                                                            }}
                                                        >
                                                            {headerConfigName || ''}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {/* End of Layout Container */}
                                <MakeDefaultModal
                                    show={defaultModal}
                                    handleClose={() => {
                                        // if (formGenerator[index]?.mapToValue?.atrributeName === 'EmailID') {
                                        // setValue(`formGenerator[${index}].makeDefault`, true);
                                        // }
                                        let index = _findIndex(
                                            getValues('formGenerator'),
                                            (item) => item?.mapToValue?.attributeName === 'EmailID',
                                        );
                                        setValue(`formGenerator[${index}].makeDefault`, true);
                                        setValue('defaultTypes.EmailID', true);
                                        setDefaultModal(false);
                                    }}
                                />
                                {/* <div className="form-group mt20 mb0">
                            <Row>
                                <Col sm={4} className="text-right form-builder-title-label">
                                    <label className="control-label-left">Select layout type</label>
                                </Col>
                                <Col sm={6}> 
                                    <ul className="form-builder-title-content rs-list-inline rli-space-15">
                                        <li>
                                            <RSRadioButton
                                                control={control}
                                                name="layoutType"
                                                defaultValue={layoutType}
                                                disabled={!!layoutType}
                                                labelName={'First'}
                                                isLabel={false}
                                                labelImg={
                                                    <RSTooltip position="bottom" text="Horizontal form">
                                                        <img src={formLayout1} alt={'Horizontal form'} />
                                                    </RSTooltip>
                                                }
                                            />
                                        </li>
                                        <li className="click-off">
                                            <RSRadioButton
                                                control={control}
                                                name="layoutType"
                                                defaultValue={layoutType}
                                                disabled={!!layoutType}
                                                labelName={'Second'}
                                                isLabel={false}
                                                labelImg={
                                                    <RSTooltip position="bottom" text="Vertical form">
                                                        <img src={formLayout2} alt={'Vertical form'} />
                                                    </RSTooltip>
                                                }
                                            />
                                        </li>
                                        <li>
                                            {(layoutType === 'First' || layoutType === 'Second') && (
                                                <i
                                                    className={`${REFRESH_ICON} icon-md color-primary-blue`}
                                                    onClick={() =>
                                                        dispatchState({
                                                            type: 'UPDATE',
                                                            field: 'refreshPopup',
                                                            payload: true,
                                                        })
                                                    }
                                                ></i>
                                            )}
                                        </li>
                                    </ul>
                                </Col>
                            </Row>
                        </div> */}
                                {/* {(layoutType === 'First' || layoutType === 'Second') && ( */}

                                {settingsPopup && (
                                    <Settings
                                        show={settingsPopup}
                                        onHide={() =>
                                            dispatchState({
                                                type: 'UPDATE',
                                                field: 'settingsPopup',
                                                payload: false,
                                            })
                                        }
                                        dispatchState={dispatchState}
                                        fieldCount={fieldCount}
                                        formDefaultFields={formDefaultFields}
                                        profilingToggle={profilingToggle}
                                    />
                                )}
                                {webHookPopup && (
                                    <WebhookSettings
                                        show={webHookPopup}
                                        isPrimary={false}
                                        handleClose={() => {
                                            dispatchState({
                                                type: 'UPDATE',
                                                field: 'webHookPopup',
                                                payload: false,
                                            });
                                        }}
                                        dispatchState={dispatchState}
                                        tag={tag}
                                    />
                                )}
                                {formStylesPopup && (
                                    <FormStyles
                                        show={formStylesPopup}
                                        onHide={() => {
                                            dispatchState({
                                                type: 'UPDATE',
                                                field: 'formStylesPopup',
                                                payload: false,
                                            });
                                        }}
                                        tag={tag}
                                        formGenerationColumn={
                                            formData?.length > 0 ? formData[0].formGenerationColumn : null
                                        }
                                        onStyleChange={(section, styleValues) => {
                                            // Apply all style values from FormStyles.jsx
                                            if (styleValues.theme) {
                                                setValue('formStyles.theme', styleValues.theme, {
                                                    shouldValidate: false,
                                                });
                                            }
                                            if (styleValues.font !== undefined) {
                                                const fontVal =
                                                    typeof styleValues.font === 'object'
                                                        ? styleValues.font
                                                        : styleValues.font;
                                                setValue('formStyles.font', fontVal, { shouldValidate: false });
                                            }
                                            if (styleValues.logoEnabled !== undefined) {
                                                setValue('formStyles.logoEnabled', styleValues.logoEnabled, {
                                                    shouldValidate: false,
                                                });
                                            }
                                            if (styleValues.logo !== undefined) {
                                                setValue('headerConfig.logo', styleValues.logo, {
                                                    shouldValidate: false,
                                                });
                                            }
                                            if (styleValues.logoAlignment !== undefined) {
                                                setValue('headerConfig.alignment', styleValues.logoAlignment, {
                                                    shouldValidate: false,
                                                });
                                            }
                                            if (styleValues.logoBackgroundColor !== undefined) {
                                                setValue(
                                                    'headerConfig.backgroundColor',
                                                    styleValues.logoBackgroundColor,
                                                    { shouldValidate: false },
                                                );
                                            }
                                            if (styleValues.logoColor !== undefined) {
                                                setValue('headerConfig.color', styleValues.logoColor, {
                                                    shouldValidate: false,
                                                });
                                            }
                                            if (styleValues.logoStyle !== undefined) {
                                                setValue('formStyles.logoStyle', styleValues.logoStyle, {
                                                    shouldValidate: false,
                                                });
                                            }
                                            if (styleValues.headerAlignment !== undefined) {
                                                setValue('headerConfig.layoutPosition', styleValues.headerAlignment, {
                                                    shouldValidate: false,
                                                });
                                            }
                                            if (styleValues.headerBackgroundImage !== undefined) {
                                                setValue(
                                                    'headerConfig.backgroundImage',
                                                    styleValues.headerBackgroundImage,
                                                    { shouldValidate: false },
                                                );
                                            }
                                            if (styleValues.formBackgroundImage !== undefined) {
                                                setValue(
                                                    'formStyles.formBackgroundImage',
                                                    styleValues.formBackgroundImage,
                                                    { shouldValidate: false },
                                                );
                                            }
                                            if (styleValues.textFieldSize !== undefined) {
                                                setValue('formStyles.textFieldSize', styleValues.textFieldSize, {
                                                    shouldValidate: false,
                                                });
                                            }
                                            if (styleValues.inputStyle !== undefined) {
                                                setValue('formStyles.inputStyle', styleValues.inputStyle, {
                                                    shouldValidate: false,
                                                });
                                            }
                                            if (styleValues.buttonRounding !== undefined) {
                                                setValue('formStyles.buttonRounding', styleValues.buttonRounding, {
                                                    shouldValidate: false,
                                                });
                                            }
                                            if (styleValues.layoutAlignment !== undefined) {
                                                setValue('formStyles.layoutAlignment', styleValues.layoutAlignment, {
                                                    shouldValidate: false,
                                                });
                                            }
                                            if (styleValues.paginationEnabled !== undefined) {
                                                setValue(
                                                    'formStyles.paginationEnabled',
                                                    styleValues.paginationEnabled,
                                                    { shouldValidate: false },
                                                );
                                            }
                                            if (styleValues.pagination !== undefined) {
                                                setValue('formStyles.pagination', styleValues.pagination, {
                                                    shouldValidate: false,
                                                });
                                            }
                                            if (styleValues.itemsPerPage !== undefined) {
                                                setValue('formStyles.itemsPerPage', styleValues.itemsPerPage, {
                                                    shouldValidate: false,
                                                });
                                            }
                                        }}
                                    />
                                )}
                            </form>
                        </Col>
                        <Col md={3} className="pl0">
                            <FormSidebar tag={tag} formGenerationColumn={formData} />
                        </Col>
                    </Row>
                </div>
                {/* )} */}
                <RSModal
                    show={refreshPopup}
                    size="md"
                    header={RESET}
                    // isCloseButton={false}
                    body={
                        <div>
                            <h4 className="text-center mb5">{ARE_YOU_SURE_WANT_TO_RESET}</h4>
                            <small className="text-center">
                                <p>{NOTE_TEMPLATE}</p>
                            </small>
                        </div>
                    }
                    footer={
                        <>
                            <RSSecondaryButton
                                onClick={() =>
                                    dispatchState({
                                        type: 'UPDATE',
                                        field: 'refreshPopup',
                                        payload: false,
                                    })
                                }
                            >
                                {NO}
                            </RSSecondaryButton>
                            <RSPrimaryButton onClick={onSave}>{YES}</RSPrimaryButton>
                        </>
                    }
                />
                <RSModal
                    show={removePopup}
                    size="md"
                    // isCloseButton={false}
                    handleClose={() =>
                        dispatchState({
                            type: 'UPDATE',
                            field: 'removePopup',
                            payload: false,
                        })
                    }
                    header={DELETE_USER_ROLE}
                    body={
                        <>
                            <h4 className="text-center mb5">{ARE_YOU_SURE_DELETE}</h4>
                            {/* <small className="text-center"> */}
                            {/* <p>{NOTE_ACTION}</p> */}
                            {/* </small> */}
                        </>
                    }
                    footer={
                        <div className="buttons-holder mt0">
                            <RSSecondaryButton
                                onClick={() =>
                                    dispatchState({
                                        type: 'UPDATE',
                                        field: 'removePopup',
                                        payload: false,
                                    })
                                }
                            >
                                {CANCEL}
                            </RSSecondaryButton>
                            <RSPrimaryButton onClick={() => removeField()}>{OK}</RSPrimaryButton>
                        </div>
                    }
                />
                {saveModal?.show && (
                    <SaveFormModal
                        show={saveModal?.show}
                        handleClose={(status, name) => {
                            handleSaveandGenerate(status, name);
                        }}
                        isEdit={queryParams?.isEdit || false}
                        editName={queryParams?.formName}
                        isSaveLoading={isSaveLoading}
                    />
                )}
                {previewGenerate.show && (
                    <GenerateAndEmbedAPI
                        show={previewGenerate.show}
                        formDataValues={previewGenerate?.formDataValues}
                        saveData={previewGenerate?.savedata}
                        editName={previewGenerate.name}
                        formSubscription
                        publishData={previewGenerate.publishData}
                        handleClose={(status, name) => {
                            setPreviewGenerate({
                                show: false,
                                name: '',
                                formDataValues: {},
                                savedata: {},
                                publishData: {},
                            });

                            if (location?.isPushBuilder) {
                                const backState = location?.backState?.state || {};
                                const templateId =
                                    backState?.templateId || location?.recipientFormId || location?.templateId;

                                let decodedDetails = {};
                                if (location?.getUrlParams?.channelDetails) {
                                    try {
                                        decodedDetails = JSON.parse(atob(location.getUrlParams.channelDetails));
                                    } catch (error) {
                                    }
                                }

                                let params = {
                                    templateName: decodedDetails?.name || location?.templateName || '',
                                    channelId: decodedDetails?.channelId || location?.channelId,
                                    catagoryId: location?.categoryId,
                                    templateId: templateId,
                                    departmentId: decodedDetails?.departmentId || departmentId,
                                    clientId: decodedDetails?.clientId || clientId,
                                    userId: decodedDetails?.userId || userId,
                                };

                                let channelDetails = JSON.stringify(params);

                                const token = localStorage.getItem('accessToken');
                                const jwtToken = localStorage.getItem('jwtToken');
                                const domain = window.location.origin;
                                const builderType = location?.getUrlParams?.builderType || location?.builderType;
                                const parsedLocation = JSON.parse(location?.backState);
                                const formId =
                                    previewGenerate?.savedata?.formId || parsedLocation?.triggerComponentId || '';
                                const publishUrl = previewGenerate?.publishData?.publishUrl || '';

                                const redirectUrl = `${LANDING_BUILDER_REDIRECT_URL}?secretKey=${encodeURIComponent(
                                    token,
                                )}&channelDetails=${btoa(channelDetails)}&clientId=${encodeURIComponent(
                                    clientId,
                                )}&userId=${encodeURIComponent(userId)}&departmentId=${encodeURIComponent(
                                    departmentId,
                                )}&templateId=${templateId}&mode=edit&jwtToken=${encodeURIComponent(
                                    jwtToken || '',
                                )}&baseURL=${encodeURIComponent(
                                    baseURL,
                                )}&from=${domain}&builderType=${builderType}&formId=${formId}&publishUrl=${encodeURIComponent(
                                    publishUrl,
                                )}`;

                                window.location.href = redirectUrl;
                            } else {
                                navigate('/preferences/form-generator');
                            }
                            // handleSaveandGenerate(status, name);
                        }}
                    />
                )}
            </FormProvider>
            {getWarningPopupMessage(failureApiErrors, dispatch)}
            {showPopup?.show && (
                <WarningPopup
                    customHeader={WARNING}
                    show={showPopup?.show}
                    text={showPopup?.message}
                    // isPrimary={false}
                    isPrimaryText="Ok"
                    handleClose={() => {
                        setShowPopup({
                            message: '',
                            show: false,
                        });
                    }}
                />
            )}
        </FormGeneratorContext.Provider>
    );
};

export default FormGenerator;
