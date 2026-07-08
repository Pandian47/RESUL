import { statusIdCheck } from 'Utils/modules/campaignUtils';
import { addDaysToDate, convertToUserTimezone, convertUTCtoUserTimezone, getDateBasedonMonth, getYYMMDD, isDateBeforeToday } from 'Utils/modules/dateTime';
import { getmasterData } from 'Utils/modules/masterData';
import { PERCENTAGE_RULES } from 'Constants/GlobalConstant/Rules';
import { encodeUrl, getUserDetails } from 'Utils/modules/crypto';
import { charNumUnderScore, onlyNumbersDecimalWithoutSpecialCharacters } from 'Utils/modules/inputValidators';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { Fragment, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { map as _map, get as _get, find as _find, isNil as _isNil, filter as _filter, findIndex as _findIndex } from 'Utils/modules/lodashReplacements';
import { Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { resetCommunicationPlan } from 'Reducers/communication/createCommunication/plan/reducer';
import { resetCreateCommunication } from 'Reducers/communication/createCommunication/create/reducer';
import { setTabforEdit } from 'Reducers/communication/createCommunication/Create/reducer';
import {
    ANALYTICS_TYPES,
    buildPlanSubmitPayload,
    isPlanPayloadEqual,
    CHANNEL_NAMES_UNSUPPORTED_FOR_OFFLINE_CONVERSION,
    CHANNEL_TYPES,
    checkAllChannelsSaved,
    FORM_INITIAL_STATE,
    FREQUENCY_TAB_CONFIG,
    getEligibleChannelIds,
    getGoalType,
    formatGoalPercentageForForm,
    getMetrixValue,
    getSelectedIncompatibleOfflineConversionChannelLabels,
    hasOfflineConversionChannelConflict,
    isOfflineConversionGoalSelection,
    OFFLINE_CONVERSION_CHANNEL_WARNING,
    validateEndDateAgainstCampaignBlast,
    validateStartDateAgainstCampaignBlast,
    handleReferenceData,
    normalizeReferenceConfig,
    getCommunicationReferenceFormState,
    buildReferenceFormStateFromConfig,
    flattenPlanChannelAnalytics,
    handleWithoutAPICallNavigation,
    isCompletedOrAlertStatus,
    isFullMonthDifference,
    REDUCER_INITIAL_STATE,
    RESET_FREQUENCY,
    stateReducer,
    TOOLTIP_TEXT_ANALYTICS_TYPES,
} from './constant';
import {
    ANALYTICS_TYPE,
    CHANNEL_TYPE,
    COMMUNICATION_NAME as COMMUNICATION_NAME_LABEL,
    COMMUNICATION_PERIOD,
    debouncedHandleDynamicListFilterChange,
    GOAL_INFO_DESCRIPTION,
    GOAL_INFO_TITLE,
    PRIMARY_GOAL as PRIMARY_GOAL_LABEL,
    PRODUCT_TYPE as PRODUCT_TYPE_LABEL,
    referenceRequired,
    ROI as ROI_LABEL,
    SECONDARY_GOAL as SECONDARY_GOAL_LABEL,
} from '../../constants';
import {
    COMMUNICATION_NAME as communicationNamePattern,
    MAX_LENGTH200,
    MAX_LENGTH50,
    MIN_LENGTH,
} from 'Constants/GlobalConstant/Regex';
import { alert_medium, circle_minus_fill_edge_medium, circle_plus_fill_edge_medium, circle_question_mark_mini, close_medium, form_edit_medium, pencil_edit_mini, save_mini, tag_plus_medium } from 'Constants/GlobalConstant/Glyphicons';
import { ADD, ALLOW_AUDIENCE, CALCULATED_ROI, CANCEL, COMMUNICATION_REFERENCE, COMMUNICATION_TYPE, COMMUNICATIONS_DELIVERED_RECIPIENTS, DAYLIGHT_SAVINGS, DYNAMIC_LIST, EDIT_TIME_ZONE, END_DATE, FREQUENCY as FREQUENCY_SECTION_LABEL, GOAL_PERCENTAGE, INPROGRESS_REMINDER, NEXT, OK, ON, OFF, PRIMARY_GOAL, PRODUCTType, REMOVE, ROI_APPLICABLE, SAME_CHANNEL, SAVE, SECONDARY_GOAL_TYPE, SELECT_THE_LIST, SERVICE_MANDATORY_COMMUNICATION, START_DATE, SUB_PRODUCT_TYPE, TAGS, TEST_COMMUNICATION, TEST_COMMUNICATION_TOOLTIP, TIME_ZONE, WARNING, DURATION_WARNING_IN_COMM_PLAN } from 'Constants/GlobalConstant/Placeholders';
import { ENTER_COMUNICATION_NAME, ENTER_GOAL_PERCENTAGE, ENTER_VALID_PERCENTAGE, MAX200LENGTH, MINLENGTH, PLAN_PRODUCT_DUPLICATE_NAME, PLAN_SUB_PRODUCT_DUPLICATE_NAME, SELECT_CHANNEL_TYPE, SELECT_COMMUNICATION_TYPE, SELECT_CONVERSION_TYPE, SELECT_DYNAMIC_LIST, SELECT_END_DATE, SELECT_ENGAGEMENT_TYPE, SELECT_PRIMARY_GOAL, SELECT_PRIMARY_GOAL_TYPE, SELECT_PRODUCT_TYPE, SELECT_SECONDARY_GOAL, SELECT_SECONDARY_GOAL_TYPE, SELECT_START_DATE, SELECT_SUB_PRODUCT_TYPE, SELECT_TIMEZONE, SELECT_WEB_TO_Analytics, SPECIAL_CHATACTERS_NOT_ALlOWED } from 'Constants/GlobalConstant/ValidationMessage';
import {
    checkCommunicationNameExists,
    fetchAllRequest,
    getBenchmarkDetails,
    getCampaignById,
    getCommunicationAttributes,
    getCommunicationProducts,
    getCommunicationReference,
    getCommunicationSubProducts,
    getConversionTypeList,
    getDynamicList,
    getTriggerDynamicListChanneltype,
    saveCommunicationPlan,
    saveCommunicationProducts,
    saveCommunicationSubProducts,
} from 'Reducers/communication/createCommunication/plan/request';
import { getCampaignBlastDetails } from 'Reducers/communication/createCommunication/Create/request';

import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import RSModal from 'Components/RSModal';
import RSTabbar from 'Components/RSTabber';
import RSTooltip from 'Components/RSTooltip';
import RSPPophover from 'Components/RSPPophover';
import TagsModal from '../Component/TagsModal';
import RSInput from 'Components/FormFields/RSInput';
import RSSwicth from 'Components/FormFields/RSSwitch';
import useQueryParams from 'Hooks/useQueryParams';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import RSDatePicker from 'Components/FormFields/RSDatePicker';
import RSConfirmationModal from 'Components/ConfirmationModal';
import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
import useComponentWillUnmount from 'Hooks/useComponentWillUnMount';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import CommuncationReferenceModal from '../Component/CommuncationReferenceModal';

import DeliveryMethodSkeleton from 'Components/Skeleton/Components/DeliveryMethodSkeleton';

import { getSessionId, getUtcTimeData } from 'Reducers/globalState/selector';
import { updateCommunicationOptions, setPlanDropdownsFetchedFor } from 'Reducers/communication/createCommunication/plan/reducer';

import NewAttributeBtn from 'Pages/AuthenticationModule/Audience/Pages/AddImportAudience/Components/CustomHeaderColumn/NewAttributeBtn';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { communicationNamevalidtor, analyticsTypeValidator } from 'Utils/HookFormValidate';
import { FREQUENCY, PERIODS, WEEK_DAYS } from 'Pages/AuthenticationModule/Components/Schedules/Constants';
import { showTabsSmartlink } from 'Reducers/communication/createCommunication/smartlink/reducer';
import RSKendoDropDown from 'Components/FormFields/RSKendoDropDown';
import WarningPopup from 'Pages/AuthenticationModule/Components/WarningPopup/WarningPopup';
import RSAlert from 'Components/RSAlert';
import { Container } from 'react-bootstrap';

let tempProdCategoryData = '',
    tempProdSubCategoryData = '';

const renderOfflineConversionChannelWarningText = (labels) => (
    <Fragment>
        {OFFLINE_CONVERSION_CHANNEL_WARNING}
        {Array.isArray(labels) && labels.length > 0 && (
            <>
                <br />
                <br />
                <span className="text-bold">Not applicable with Offline Conversion: </span>
                <span className="text-bold color-primary-red">{labels.join(', ')}</span>
            </>
        )}
    </Fragment>
);

const DeliveryMethod = ({ type } = {}) => {
    // Selectors
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const locationState = useQueryParams('/communication') || {};
    const mode = _get(locationState, 'mode', '');
    const planLoaderMode = mode === 'edit' ? 'edit' : 'create';
    const PLAN_FIELD_ALWAYS_LOADER_CONFIG = { create: 'field', edit: 'field' };
    const { failureApiErrors = [] } = useSelector(({ globalstate }) => globalstate ?? {}) ?? {};
    const isEditable =
        locationState?.communicationExcuteStatus !== undefined
            ? locationState?.communicationExcuteStatus
            : _get(locationState, 'isEditable', true);
    const statusId = _get(locationState, 'statusId', 0);
    const { dateFormatId, timeZoneId, isDayLight = false } = getUserDetails() || {};
    const { dateFormatList = [], timeZoneList = [] } = getmasterData() || {};
    const userTimeZone = _get(_find(timeZoneList, ['timeZoneID', timeZoneId]), 'timeZoneName');
    const dateFormat = _get(_find(dateFormatList, ['dateFormatID', dateFormatId]), 'dateformat');
    const formDateFormat = _map(dateFormat?.split('-'), (format) =>
        format !== 'MM' ? format.toLowerCase() : format,
    ).join('-');
    const { departmentId, clientId, userId } = useSelector((reduxState) => getSessionId(reduxState) ?? {}) ?? {};
    const utcTimeData = useSelector((reduxState) => getUtcTimeData(reduxState) ?? {}) ?? {};
    const currentUTCdateTime = utcTimeData?.utcTime ? new Date(utcTimeData.utcTime.replace('Z', '')) : new Date();
    const {
        communicationOptions,
        dynamicListData,
        campaignBlastDetails,
        communicationReferenceConfigs,
        planDropdownsFetchedFor,
    } = useSelector(({ communicationPlanReducer }) => communicationPlanReducer ?? {}) ?? {};
    const { product = [], subProducts = [], attributes = [] } = communicationOptions || {};

    const communicationNameLoader = useApiLoader({
        mode: planLoaderMode,
        loaderConfig: PLAN_FIELD_ALWAYS_LOADER_CONFIG,
        autoFetch: false,
    });
    const planOptionsLoader = useApiLoader({
        mode: planLoaderMode,
        loaderConfig: PLAN_FIELD_ALWAYS_LOADER_CONFIG,
        autoFetch: false,
    });
    const dynamicListLoader = useApiLoader({
        mode: planLoaderMode,
        loaderConfig: PLAN_FIELD_ALWAYS_LOADER_CONFIG,
        autoFetch: false,
    });
    const primaryGoalBenchmarkLoader = useApiLoader({
        mode: planLoaderMode,
        loaderConfig: PLAN_FIELD_ALWAYS_LOADER_CONFIG,
        autoFetch: false,
    });
    const primaryGoalConversionTypesLoader = useApiLoader({
        mode: planLoaderMode,
        loaderConfig: PLAN_FIELD_ALWAYS_LOADER_CONFIG,
        autoFetch: false,
    });
    const secondaryGoalBenchmarkLoader = useApiLoader({
        mode: planLoaderMode,
        loaderConfig: PLAN_FIELD_ALWAYS_LOADER_CONFIG,
        autoFetch: false,
    });
    const secondaryGoalConversionTypesLoader = useApiLoader({
        mode: planLoaderMode,
        loaderConfig: PLAN_FIELD_ALWAYS_LOADER_CONFIG,
        autoFetch: false,
    });
    const saveProductCategoryLoader = useApiLoader({
        mode: planLoaderMode,
        loaderConfig: PLAN_FIELD_ALWAYS_LOADER_CONFIG,
        autoFetch: false,
    });
    const saveSubProductLoader = useApiLoader({
        mode: planLoaderMode,
        loaderConfig: PLAN_FIELD_ALWAYS_LOADER_CONFIG,
        autoFetch: false,
    });
    const communicationReferenceLoader = useApiLoader({
        mode: planLoaderMode,
        loaderConfig: PLAN_FIELD_ALWAYS_LOADER_CONFIG,
        autoFetch: false,
    });
    const savePlanLoader = useApiLoader({ autoFetch: false });

    // Refs
    const editModeStartDateRef = useRef(new Date());
    const editModeEndDateRef = useRef(null);
    const existingCommunicationName = useRef();
    const communicationReferenceFetchRef = useRef(null);
    const communicationReferenceScopeKeyRef = useRef('');
    const referenceSettingsLoadedRef = useRef(false);
    const editBoundKeyRef = useRef(null);
    const boundPlanPayloadRef = useRef(null);
    const boundSubProductRef = useRef(null);

    // State
    const [frequencyId, setFrequencyId] = useState();
    const [isCreateMode, setIsCreateMode] = useState(false);
    const [frequencyTabConfig, setFrequencyTabConfig] = useState(FREQUENCY_TAB_CONFIG);
    const [submittingButtonType, setSubmittingButtonType] = useState(null);
    const goalValue = ['Reach', 'Engagement', 'Conversion'];

    const methods = useForm(FORM_INITIAL_STATE);

    const [nameState, setNameState] = useState({
        isValid: false,
    });
    const [requiredceCommReferenceModal, setRequiredceCommReferenceModal] = useState({
        show: '',
        message: '',
    });
    const [isShowMiniDuartionWarning, setIsShowMiniDuartionWarning] = useState({
        show: false,
        proceedCallback: () => { },
    });
    const [offlineConversionChannelWarningPopup, setOfflineConversionChannelWarningPopup] = useState({
        show: false,
        incompatibleChannelLabels: [],
    });
    const [savedDynamicListChannel, setSavedDynamicListChannel] = useState([]);
    const [inprogressReminder, setInprogressReminder] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isSubProductsLoading, setIsSubProductsLoading] = useState(false);
    const [isGetCampaignFail, setIsCampaingFail] = useState(false);
    const [conditions, setConditions] = useState(false);
    const [isFieldLoading, setIsFieldLoading] = useState(false);
    const [isProductType, setIsProducttype] = useState(false);
    const [isSubProductType, setIsSubProducttype] = useState(false);
    const [clickOff, setClickOff] = useState(false);

    const [updateTimeZone, setUpdateTimeZone] = useState(userTimeZone);
    const {
        control,
        handleSubmit,
        setValue,
        getValues,
        clearErrors,
        reset,
        watch,
        trigger,
        setError,
        unregister,
        setFocus,
        formState: { errors, isValid, isDirty, touchedFields },
    } = methods;
    const daylightSavingsName = 'daylightSavings';
    const { fields } = useFieldArray({
        control,
        name: 'channelTypes',
    });
    const { fields: analyticsField } = useFieldArray({
        control,
        name: 'analyticsTypes',
    });
    /** RHF often only registers `selected` per row; merge with useFieldArray `fields` for `name` / `labelName`. */
    const getMergedChannelTypesForOfflineValidation = () => {
        const values = getValues('channelTypes') || [];
        return fields.map((field, index) => ({
            ...field,
            ...(values[index] ?? {}),
        }));
    };
    let daily = getValues('daily');
    const communicationNameError = Object.hasOwn(errors, 'communicationName');
    const [state, dispatchState] = useReducer(stateReducer, REDUCER_INITIAL_STATE);
    const { secondaryGoal: isSecondaryGoal, tags: selectedTags, isCommunicationReference } = state;
    const productSubcategoryTypeTextError = 'Please save the sub product type before proceeding';

    const hasTagsSetup = useMemo(() => Boolean(state?.tags?.length), [state?.tags]);
    const isTagsIconDisabled = isEditable ? false : !hasTagsSetup;
    const isTagsModalViewOnly = !isEditable && hasTagsSetup;

    const referenceConfigList = useMemo(
        () => normalizeReferenceConfig(state?.defaultCommunicationReferenceConfigData),
        [state?.defaultCommunicationReferenceConfigData],
    );
    const isCommReferenceIconDisabled = !state?.isCommunicationReferenceIconEnabled;

    const fetchCommunicationReferenceOnce = useCallback(
        async (payload) => {
            const key = `${payload.clientId}|${payload.userId}|${payload.departmentId}`;
            if (communicationReferenceScopeKeyRef.current !== key) {
                communicationReferenceFetchRef.current = null;
                communicationReferenceScopeKeyRef.current = key;
                referenceSettingsLoadedRef.current = false;
            }
            const cachedList = normalizeReferenceConfig(communicationReferenceConfigs);
            if (cachedList.length > 0) {
                return { status: true, data: cachedList };
            }
            if (!communicationReferenceFetchRef.current) {
                communicationReferenceFetchRef.current = dispatch(
                    getCommunicationReference({ payload, loading: false }),
                ).finally(() => {
                    communicationReferenceFetchRef.current = null;
                });
            }
            const rawResponse = await communicationReferenceFetchRef.current;
            const referenceList = normalizeReferenceConfig(rawResponse?.data ?? rawResponse);
            return {
                status: referenceList.length > 0 || Boolean(rawResponse?.status),
                data: referenceList,
            };
        },
        [dispatch, communicationReferenceConfigs],
    );

    const applyReferenceSettings = useCallback((referenceConfigList, savedReference, version) => {
        if (!referenceConfigList?.length) return false;

        referenceSettingsLoadedRef.current = true;
        dispatchState({ type: 'UPDATE_REFERENCE_CONFIG', payload: referenceConfigList });
        dispatchState({ type: 'UPDATE', payload: true, field: 'isCommunicationReferenceIconEnabled' });

        if (savedReference?.length) {
            dispatchState({
                type: 'UPDATE_REFERENCE_EDIT_DATA',
                payload: handleReferenceData(savedReference, referenceConfigList, version),
            });
        } else {
            dispatchState({
                type: 'UPDATE',
                payload: buildReferenceFormStateFromConfig(referenceConfigList),
                field: 'communicationReferenceData',
            });
        }
        return true;
    }, []);

    const [
        startDate,
        primaryGoal,
        secondaryGoal,
        primarygoalPercentage,
        productType,
        communicationType,
        channelTypes,
        analyticsTypes,
        timeZone,
        primaryMaxValue,
        primaryMinValue,
        secondaryMaxValue,
        secondaryMinValue,
    ] = watch([
        'startdate',
        'primaryGoal',
        'secondaryGoal',
        'primaryGoalPercentage',
        'productType',
        'communicationType',
        'channelTypes',
        'analyticsTypes',
        'timezone',
        'primaryGoalPercentagebenchMarkMaxValue',
        'primaryGoalPercentagebenchMarkMinValue',
        'secondaryGoalPercentagebenchMarkMaxValue',
        'secondaryGoalPercentagebenchMarkMinValue',
    ]);

    const isPrimaryGoalValid =
        !!primaryGoal &&
        primarygoalPercentage !== '' &&
        primarygoalPercentage !== null &&
        primarygoalPercentage !== undefined &&
        !Object.hasOwn(errors, 'primaryGoalPercentage');
    const { isMounted } = useComponentWillUnmount(() => {
        reset(FORM_INITIAL_STATE?.defaultValues);
        editBoundKeyRef.current = null;
        boundPlanPayloadRef.current = null;
        boundSubProductRef.current = null;
    });

    const campaignId = _get(locationState, 'campaignId', 0);
    const editNavKey =
        mode === 'edit' && campaignId ? `${campaignId}-${mode}-${type}-${departmentId}` : '';

    // Effects
    useEffect(() => {
        if (mode !== 'edit') {
            editBoundKeyRef.current = null;
            boundPlanPayloadRef.current = null;
            boundSubProductRef.current = null;
        }
    }, [mode]);

    useEffect(() => {
        if (mode === '') {
            setIsCreateMode(true);
        } else {
            setIsCreateMode(false);
        }
    }, [mode]);

    useEffect(() => {
        fetchInitialData(mode === 'edit');
    }, [departmentId, mode, type]);

    useEffect(() => {
        if (mode === 'edit') {
            return;
        }
        if (type === 'event') {
            const userTz = _find(timeZoneList, ['timeZoneID', timeZoneId]);
            FORM_INITIAL_STATE.defaultValues.timezone = userTz;
            FORM_INITIAL_STATE.defaultValues.daylightSavings =
                userTz?.timeZoneID === timeZoneId ? isDayLight : false;
        }
        reset(FORM_INITIAL_STATE.defaultValues);
    }, [type, mode]);
    useEffect(() => {
        const getEmailChecked = CHANNEL_TYPES?.map((channel) => {
            if (channel?.id?.includes(locationState?.templateChannelId)) {
                return { ...channel, selected: true, disabled: true };
            } else {
                return { ...channel };
            }
        });
        const getAppAnalyticsChecked = ANALYTICS_TYPES?.map((analytics) => {
            let finalAnalyticsId = locationState?.templateChannelId === 14 ? 16 : 6
            if (analytics?.id?.includes(finalAnalyticsId) && finalAnalyticsId !== 1) {
                return { ...analytics, selected: true, disabled: true };
            } else {
                return { ...analytics, selected: false };
            }
        });
        if (locationState?.templateChannelId && mode !== 'edit') {
            reset((formstate) => ({
                ...formstate,
                channelTypes: getEmailChecked,
                analyticsTypes: getAppAnalyticsChecked
            }));
        }
        if (isInitialLoading) {
            setInprogressReminder(false);
        } else if (statusId === 5) {
            setInprogressReminder(true);
        } else {
            setInprogressReminder(false);
        }
    }, [locationState, mode, isInitialLoading, statusId]);
    useEffect(() => {
        if (isDateBeforeToday(getValues('startdate')) && Number(locationState?.statusId) === 6 && isEditable) {
            setError('startdate', {
                type: 'required',
                message: 'Select start date',
            });
            setValue('startdate', null);
            return;
        }
    }, [startDate, locationState]);

    useEffect(() => {
        setConditions(
            product?.length > 0 &&
            attributes?.length > 0 &&
            (type !== 'event' || (type === 'event' && dynamicListData?.length > 0)),
        );
    }, [product, attributes, dynamicListData, type]);
    useEffect(() => {
        if (mode !== 'edit' || !campaignId || !conditions) {
            return;
        }

        if (editBoundKeyRef.current === editNavKey) {
            return;
        }

        let cancelled = false;

        async function fetchCommunication() {
                let attributesList = [],
                    productList = [],
                    referenceList = [],
                    dynamicListDatas = [];
                setIsInitialLoading(true);
                try {

                    const userPayload = {
                        userId,
                        clientId,
                        departmentId,
                    };
                    const payload = {
                        campaignId,
                        ...userPayload,
                    };
                    const campaign = await dispatch(getCampaignById({ payload, loading: false }));
                    if (cancelled || !isMounted.current) return;
                    const updateCampaign = campaign;

                    productList = product;
                    attributesList = attributes;
                    dynamicListDatas = dynamicListData;
                    if (campaign?.status) {
                        const planReducerState = state;
                        const {
                            campaignName,
                            communicationType,
                            productType,
                            subProductType,
                            primaryGoal,
                            primaryGoalPercentage,
                            testCommunication,
                            isServiceMandatoryComm,
                            primaryGoalType,
                            secondaryGoal,
                            secondaryGoalPercentage,
                            secondaryGoalType,
                            communicationReference,
                            tags,
                            endDate,
                            startDate,
                            roi,
                            channelType,
                            analyticsTypes,
                            isFrequency,
                            dynamicList,
                            recurrenceInfo,
                            version,
                            isDaylightSavings = false
                        } = campaign?.data ?? {};
                        let tempGrouping = {},
                            tempPriority = {};
                        // let tempData =
                        //     referenceList?.length > 2
                        //         ? referenceList?.filter((item) => {
                        //               if (item?.columnValue === 'Communication Grouping ID') {
                        //                   tempGrouping = { ...item };
                        //               }
                        //               if (item?.columnValue === 'Priority') {
                        //                   tempPriority = { ...item };
                        //               }
                        //               return (
                        //                   item?.columnValue !== 'Communication Grouping ID' &&
                        //                   item?.columnValue !== 'Priority'
                        //               );
                        //           })
                        //         : [];

                        // const tempGroup = handleReferenceData(communicationReference, referenceList);
                        // const reference = [...tempData];
                        // const tempGroup = {
                        //     priority: tempPriority,
                        //     grouping: tempGrouping,
                        //     reference: reference,
                        // };

                        const refConfigFromCampaign = normalizeReferenceConfig(campaign?.data);
                        if (!applyReferenceSettings(refConfigFromCampaign, null, version)) {
                            void fetchReferencSettings({ communicationReference, version });
                        }

                        const editBindState = {
                            // communicationReferenceData:
                            //     communicationReference?.length > 2 ? JSON.parse(communicationReference) : referenceList,
                            // communicationReferenceData: tempGroup,
                            tags: tags?.length ? tags.split(',') : [],
                            secondaryGoal: !!secondaryGoal,
                            conversionTypes: {},
                            edit: campaign?.data,
                            currentFrequencyTab:
                                type === 'event'
                                    ? _findIndex(
                                        FREQUENCY_TAB_CONFIG,
                                        (tabs) => tabs?.id === _get(recurrenceInfo, 'frequencyID', 4),
                                    )
                                    : 4,
                            frequencyType: _get(recurrenceInfo, 'frequencyID', 4),
                        };
                        const editReducerState = { ...state, ...editBindState };
                        const nextRequest = [
                            dispatch(
                                getCommunicationSubProducts({
                                    payload: { ...userPayload, categoryId: productType },
                                }),
                            ),
                        ];
                        if (primaryGoal === 'E' || primaryGoal === 'C') {
                            nextRequest[1] = dispatch(
                                getConversionTypeList({
                                    payload: { ...userPayload, goal: primaryGoal },
                                }),
                            );
                        }
                        if (
                            !!secondaryGoal &&
                            (secondaryGoal === 'E' || (secondaryGoal === 'C' && secondaryGoal !== primaryGoal))
                        ) {
                            nextRequest[2] = dispatch(
                                getConversionTypeList({
                                    payload: { ...userPayload, goal: secondaryGoal },
                                }),
                            );
                        }
                        const [subProducts, primaryType, secondaryType] = await Promise.all(nextRequest);
                        if (!isMounted.current) return;
                        let subproductList = [],
                            primaryTypeList = [],
                            secondaryTypeList = [];
                        if (subProducts?.status) {
                            subproductList = subProducts?.data ?? [];
                            unregister('subProductType');
                            state.subProductError = {
                                required: SELECT_SUB_PRODUCT_TYPE,
                            };
                        } else {
                            state.subProductError = {};
                        }
                        if (primaryType?.status) {
                            const payload = primaryType?.data ?? [];
                            primaryTypeList = payload;
                            state.conversionTypes = {
                                [getGoalType(primaryGoal).toLowerCase()]: payload,
                            };
                        }
                        if (secondaryType?.status) {
                            const payload = secondaryType?.data ?? [];
                            secondaryTypeList = payload;
                            state.conversionTypes = {
                                ...(state?.conversionTypes ?? {}),
                                [getGoalType(secondaryGoal).toLowerCase()]: payload,
                            };
                        }
                        const comType = _find(attributesList, ['campaignAttributeId', communicationType]);
                        const proType = _find(productList, ['categoryId', productType]);
                        const subProType = _find(subproductList, ['subCategoryId', subProductType]);
                        const secondaryGoalNames = secondaryGoalType?.length ? secondaryGoalType?.split(',') : [];
                        const primaryGoalNames = primaryGoalType?.length ? primaryGoalType?.split(',') : [];
                        const dynamicName = _find(dynamicListDatas, ['dynamicListId', dynamicList]);
                        const reccuresType = _get(recurrenceInfo, 'timeSubsetId', 0);
                        const frequencyId = _get(recurrenceInfo, 'frequencyID', 4);
                        setFrequencyId(frequencyId);

                        const findTimeZone = timeZoneList?.find(
                            (timeZone) => timeZone?.timeZoneID === campaign?.data?.timeZoneId,
                        );
                        setUpdateTimeZone(findTimeZone?.timeZoneName);
                        if (!findTimeZone) {
                            dispatchState({
                                type: 'UPDATE',
                                payload: true,
                                field: 'isTimeZoneEdit',
                            });
                        }
                        let dlChannelType;
                        let dlAnalyticsType;
                        if (type === 'event') {
                            const updateFormState = await handleDynamicList(dynamicName, channelType, false, true, campaign?.data);
                            dlChannelType = updateFormState?.channelTypes;
                            dlAnalyticsType = updateFormState?.analyticsTypes?.map((analytics) => {
                                const isAnalytics = analytics?.id?.some((id) => analyticsTypes?.includes(id));
                                return {
                                    ...analytics,
                                    selected: isAnalytics || false,
                                };
                            });
                        }
                        reset((formState) => ({
                            ...formState,
                            communicationName: campaignName,
                            testCommunication: testCommunication,
                            isServiceMandatoryComm: isServiceMandatoryComm,
                            communicationType: comType,
                            productType: proType,
                            primaryGoal: getGoalType(primaryGoal),
                            primaryGoalPercentage: formatGoalPercentageForForm(primaryGoalPercentage),
                            primaryGoalType: _filter(primaryTypeList, (primary) =>
                                primaryGoalNames.includes(primary?.ConversionName),
                            ),
                            secondaryGoal: getGoalType(secondaryGoal),
                            secondaryGoalPercentage: formatGoalPercentageForForm(secondaryGoalPercentage),
                            secondaryGoalType: _filter(secondaryTypeList, (secondary) =>
                                secondaryGoalNames.includes(secondary?.ConversionName),
                            ),
                            timezone: findTimeZone,
                            daylightSavings: isDaylightSavings,
                            ...(type === 'event' && {
                                isFrequency,
                                dynamicList: dynamicName,
                                ...(frequencyId === 5 && {
                                    shortly: {
                                        every_time: _get(recurrenceInfo, 'reccursOn', 0),
                                        period: _find(PERIODS, ['id', _get(recurrenceInfo, 'recurrsEveryTimeID', {})]),
                                    },
                                }),
                                ...(frequencyId === 1 && {
                                    daily: {
                                        days: _get(recurrenceInfo, 'reccursEvery', 0),
                                        hours: _get(recurrenceInfo, 'recurrsTime', ''),
                                    },
                                }),
                                ...(frequencyId === 2 && {
                                    weekly: {
                                        weekDays: {
                                            mon: _get(recurrenceInfo, 'isMonday', false),
                                            tue: _get(recurrenceInfo, 'isTuesday', false),
                                            wed: _get(recurrenceInfo, 'isWednesday', false),
                                            thu: _get(recurrenceInfo, 'isThrusday', false),
                                            fri: _get(recurrenceInfo, 'isFriday', false),
                                            sat: _get(recurrenceInfo, 'isSaturday', false),
                                            sun: _get(recurrenceInfo, 'isSunday', false),
                                        },

                                        hours: _get(recurrenceInfo, 'recurrenceTimeWeekly', ''),
                                        week: _get(recurrenceInfo, 'reccursEveryWeekly', 0),
                                    },
                                }),
                                ...(frequencyId === 3 && {
                                    monthly: {
                                        type: reccuresType === 5 ? 'Month(s)' : 'Day(s)',
                                        second_hours:
                                            reccuresType === 5
                                                ? _get(recurrenceInfo, 'reccursDayMonthlytimePicker', '')
                                                : '',
                                        second_months:
                                            reccuresType === 5 ? _get(recurrenceInfo, 'reccursDayMonthly', '') : '',
                                        second_days:
                                            reccuresType === 5
                                                ? _find(WEEK_DAYS, [
                                                    'id',
                                                    _get(recurrenceInfo, 'reccursDayMonthlyselByDay', ''),
                                                ])
                                                : '',
                                        second_frequency:
                                            reccuresType === 5
                                                ? _find(FREQUENCY, [
                                                    'id',
                                                    _get(recurrenceInfo, 'reccursDayMonthlyselByWeek', ''),
                                                ])
                                                : '',
                                        first_hours:
                                            reccuresType === 4 ? _get(recurrenceInfo, 'recurrenceTimeMonthly', '') : '',
                                        first_months:
                                            reccuresType === 4 ? _get(recurrenceInfo, 'reccursEveryMonthly', '') : '',
                                        first_day: reccuresType === 4 ? _get(recurrenceInfo, 'reccursDayMonthly', 0) : '',
                                    },
                                }),
                            }),
                            roi,
                            enddate: new Date(endDate),
                            startdate: new Date(startDate),
                            subProductType: subProType,
                            analyticsTypes:
                                type === 'event'
                                    ? dlAnalyticsType
                                    : _map(ANALYTICS_TYPES, (analytics) => {
                                        const isAnalytics = analytics?.id?.some((id) => analyticsTypes?.includes(id));
                                        return {
                                            ...analytics,
                                            selected: !!isAnalytics,
                                        };
                                    }),
                            // channelTypes: _map(CHANNEL_TYPES, (channel) => {
                            //     const isChannel = channel.id.some((id) => channelType?.includes(id));
                            // if (isChannel) {
                            //     channel.selected = true;
                            // } else {
                            //     channel.selected = false;
                            // }
                            // return channel;
                            // }),
                            channelTypes:
                                type === 'event'
                                    ? dlChannelType
                                    : _map(CHANNEL_TYPES, (channel) => {
                                        const isChannel = channel?.id?.some((id) => channelType?.includes(id));
                                        return {
                                            ...channel,
                                            selected: isChannel,
                                            disabled: isChannel && type === 'event',
                                        };
                                    }),
                        }));
                        // reset(temp);
                        editModeStartDateRef.current = startDate;
                        editModeEndDateRef.current = endDate;
                        existingCommunicationName.current = campaignName;
                        dispatchState({ type: 'UPDATE_EDIT', payload: editReducerState });
                        setNameState({
                            isValid: true,
                        });

                        boundSubProductRef.current = subProType;
                        boundPlanPayloadRef.current = buildPlanSubmitPayload({
                            formState: getValues(),
                            type,
                            reducerState: editReducerState,
                            mode: 'edit',
                            locationState,
                            departmentId,
                            userId,
                            clientId,
                            tags: editReducerState.tags,
                            isSecondaryGoal: editReducerState.secondaryGoal,
                            isCommunicationReference,
                            communicationReferenceData: editReducerState?.communicationReferenceData,
                            savedDynamicListChannel,
                        });
                        editBoundKeyRef.current = editNavKey;

                        if (payload?.campaignId) {
                            await dispatch(
                                getCampaignBlastDetails({
                                    payload: { clientId, departmentId, userId, campaignId: payload.campaignId },
                                }),
                            );
                        }
                    } else {
                        setIsCampaingFail(true);
                    }
                } finally {
                    if (isMounted.current) {
                        setIsInitialLoading(false);
                    }
                }
            }

        fetchCommunication();

        return () => {
            cancelled = true;
        };
    }, [mode, campaignId, type, departmentId, conditions, editNavKey]);

    useEffect(() => {
        let endDate = getValues('enddate');
        let startDate = getValues('startdate');
        const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (parseInt(state?.frequencyType, 10) === 2 && diffDays < 7) {
            setError('enddate', {
                type: 'custom',
                message: 'Frequency exceeds the comm. period',
            });
        } else if (parseInt(state?.frequencyType, 10) === 3) {
            if (isFullMonthDifference(startDate, endDate)) {
                setError('enddate', {
                    type: 'custom',
                    message: 'Frequency exceeds the comm. period',
                });
            } else {
                clearErrors('enddate');
            }
        } else {
            clearErrors('enddate');
        }
    }, [state?.frequencyType]);

    // Handlers
    const fetchInitialData = async (isEditLoad = false) => {
        try {
            await planOptionsLoader.refetch({
                fetcher: async () => {
                    const payload = {
                        departmentId,
                        clientId,
                        userId,
                    };
                    const scopeMatches =
                        planDropdownsFetchedFor &&
                        planDropdownsFetchedFor.clientId === clientId &&
                        planDropdownsFetchedFor.userId === userId &&
                        planDropdownsFetchedFor.departmentId === departmentId;
                    const productTypes = _get(communicationOptions, 'product', []);
                    const hasDropdownRows = Array.isArray(productTypes) && productTypes.length > 0;
                    const hasAttributeRows =
                        Array.isArray(communicationOptions?.attributes) && communicationOptions.attributes.length > 0;

                    if (scopeMatches && hasDropdownRows && hasAttributeRows) {
                        // Data already in communicationOptions; skip redundant API calls
                    } else {
                        const firstRequest = [
                            dispatch(getCommunicationProducts({ payload, isLoading: false })),
                            dispatch(getCommunicationAttributes({ payload, loading: false })),
                        ];
                        await dispatch(fetchAllRequest(firstRequest, payload));
                    }
                    if (type === 'event') {
                        const dynamicListPayload = {
                            ...payload,
                            campaignId: 0,
                            filterText: '',
                        };
                        await dispatch(getDynamicList({ payload: dynamicListPayload, loading: false }));
                    }
                },
            });
        } catch {
            // Initial plan data fetch failed
        } finally {
            if (!isEditLoad && isMounted.current) {
                setIsInitialLoading(false);
            }
        }
        if (!referenceSettingsLoadedRef.current) {
            void fetchReferencSettings();
        }
    };

    const fetchReferencSettings = async ({ communicationReference, version } = {}) => {
        if (referenceSettingsLoadedRef.current) {
            return;
        }
        try {
            const payload = {
                userId,
                clientId,
                departmentId,
            };

            await communicationReferenceLoader.refetch({
                fetcher: async () => {
                    const response = await fetchCommunicationReferenceOnce(payload);
                    const referenceConfigList = normalizeReferenceConfig(response?.data);

                    applyReferenceSettings(referenceConfigList, communicationReference, version);
                    return response;
                },
            });
        } catch {
            // Reference settings fetch failed
        }
    };

    const saveCategoryData = async () => {
        try {
            const catTypeText = getValues('productcategoryTypeText')?.trim();
            const payload = {
                categoryId: 0,
                categoryname: catTypeText,
                departmentId,
                clientId,
                userId,
            };
            await saveProductCategoryLoader.refetch({
                fetcher: async () => {
                    const saveResponse = await dispatch(
                        saveCommunicationProducts({ payload, isLoading: false }),
                    );
                    if (!isMounted.current) return saveResponse;
                    if (saveResponse?.status) {
                        setClickOff(false);
                        const productPayload = {
                            departmentId,
                            clientId,
                            userId,
                        };
                        const responseData = await dispatch(
                            getCommunicationProducts({ payload: productPayload, isLoading: false }),
                        );
                        if (!isMounted.current) return saveResponse;
                        if (responseData?.status) {
                            dispatch(updateCommunicationOptions({ ...communicationOptions, product: responseData?.data }));
                            dispatch(
                                setPlanDropdownsFetchedFor({ clientId, userId, departmentId }),
                            );

                            const productList = responseData?.data ?? [];
                            const selectedProduct = _find(
                                productList,
                                (item) =>
                                    item?.categoryname?.trim()?.toLowerCase() === catTypeText.toLowerCase(),
                            );

                            if (selectedProduct) {
                                setValue('productType', selectedProduct);
                                clearErrors('productType');
                                await handleProductTypeChange({ value: selectedProduct });
                            }
                        } else {
                            dispatch(updateCommunicationOptions(communicationOptions));
                        }
                    }
                    return saveResponse;
                },
            });
            if (isMounted.current) {
                setValue('productcategoryTypeText', '');
                clearErrors('productcategoryTypeText');
                setIsProducttype(false);
            }
        } catch {
            // Product category save failed
        }
    };

    const handleSubCategoryName = async (name) => {
        tempProdSubCategoryData = name;

        if (communicationNamevalidtor(name) === undefined) {
            setIsFieldLoading(true);
            try {
                const res = subProducts?.some((item) => item?.subCategoryName === name);
                if (!isMounted.current) return;
                if (!res) {
                    setClickOff(true);
                } else {
                    setClickOff(false);
                    setError(`productSubcategoryTypeText`, {
                        type: 'custom',
                        message: 'Name already exists',
                    });
                }
            } catch {
                // Sub-category name validation failed
            } finally {
                if (isMounted.current) {
                    setIsFieldLoading(false);
                }
            }
        } else {
            setTimeout(() => {
                if (!isMounted.current) return;
                setError(`productSubcategoryTypeText`, {
                    type: 'custom',
                    message: SPECIAL_CHATACTERS_NOT_ALlOWED,
                });
            }, 10);
        }
    };

    const saveSubCategoryData = async () => {
        try {
            const catTypeText = getValues('productSubcategoryTypeText')?.trim();
            const payload = {
                categoryId: getValues('productType')?.categoryId,
                subCategoryId: 0,
                subcategoryname: catTypeText,
                departmentId,
                clientId,
                userId,
            };
            await saveSubProductLoader.refetch({
                fetcher: async () => {
                    const saveResponse = await dispatch(saveCommunicationSubProducts({ payload, isLoading: false }));
                    if (!isMounted.current) return saveResponse;
                    if (saveResponse?.status) {
                        setClickOff(false);
                        const refreshPayload = {
                            userId,
                            clientId,
                            departmentId,
                            categoryId: getValues('productType')?.categoryId,
                        };
                        const refreshResponse = await dispatch(
                            getCommunicationSubProducts({
                                payload: refreshPayload,
                                loading: false,
                            }),
                        );
                        if (!isMounted.current) return saveResponse;

                        const subProductList = refreshResponse?.status ? refreshResponse?.data ?? [] : [];
                        const selectedSubProduct = _find(
                            subProductList,
                            (item) =>
                                item?.subCategoryName?.trim()?.toLowerCase() === catTypeText.toLowerCase(),
                        );

                        if (selectedSubProduct) {
                            setValue('subProductType', selectedSubProduct);
                            clearErrors('subProductType');
                        }
                    }
                    return saveResponse;
                },
            });
            if (isMounted.current) {
                setValue('productSubcategoryTypeText', '');
                clearErrors('productSubcategoryTypeText');
                setIsSubProducttype(false);
            }
        } catch {
            // Sub-product save failed
        }
    };

    const clearSubProductFields = () => {
        setValue('subProductType', null);
        setValue('productSubcategoryTypeText', '');
        clearErrors('subProductType');
        clearErrors('productSubcategoryTypeText');
        setIsSubProducttype(false);
    };

    const handleProductTypeChange = async (event) => {
        const selectedProduct = event?.value;

        clearSubProductFields();

        if (!selectedProduct?.categoryId) {
            setIsSubProductsLoading(false);
            dispatchState({
                type: 'UPDATE',
                payload: {},
                field: 'subProductError',
            });
            return;
        }

        const payload = {
            userId,
            clientId,
            departmentId,
            categoryId: selectedProduct.categoryId,
        };

        setIsSubProductsLoading(true);
        try {
            const response = await dispatch(
                getCommunicationSubProducts({
                    payload,
                    loading: false,
                }),
            );
            if (!isMounted.current) return;
            const subProductList = response?.status ? response?.data : [];
            const errormessage = subProductList?.length ? { required: SELECT_SUB_PRODUCT_TYPE } : {};
            dispatchState({
                type: 'UPDATE',
                payload: errormessage,
                field: 'subProductError',
            });
        } catch {
            // Sub-product fetch failed
        } finally {
            if (isMounted.current) {
                setIsSubProductsLoading(false);
            }
        }
    };

    const getTimezoneAdjustedMinDate = (dateType = 'start') => {
        let baseMinDate;

        if (dateType === 'end') {
            if (statusId === 5) {
                baseMinDate = addDaysToDate(currentUTCdateTime, 3);
            } else {
                baseMinDate = new Date(addDaysToDate(startDate, 3));
            }
        } else {
            baseMinDate = currentUTCdateTime;
        }

        if (utcTimeData?.utcTime) {
            return convertUTCtoUserTimezone(baseMinDate);
        }

        return convertToUserTimezone(baseMinDate, { formatAsString: false });
    };

    const getTimezoneAdjustedFocusedDate = (dateType = 'start') => {
        const adjustedDate = getTimezoneAdjustedMinDate(dateType);
        return new Date(adjustedDate.getFullYear(), adjustedDate.getMonth(), adjustedDate.getDate());
    };

    const getTimezoneAdjustedMaxDate = (dateType = 'start') => {
        let baseMaxDate;

        if (dateType === 'end') {
            if (type === 'single') {
                baseMaxDate = getDateBasedonMonth(6, new Date(startDate));
            } else {
                baseMaxDate = getDateBasedonMonth(12, new Date(startDate));
            }
        } else if (utcTimeData?.utcTime) {
            baseMaxDate = getDateBasedonMonth(6, currentUTCdateTime);
        } else {
            baseMaxDate = getDateBasedonMonth(6);
        }

        if (utcTimeData?.utcTime) {
            return convertUTCtoUserTimezone(baseMaxDate);
        }

        return convertToUserTimezone(baseMaxDate, { formatAsString: false });
    };

    const fetchConversionTypesForGoal = async (value) => {
        try {
            const listPayload = {
                goal: value?.slice?.(0, 1),
                departmentId,
                clientId,
                userId,
            };
            const { status, data } = await dispatch(
                getConversionTypeList({
                    payload: listPayload,
                    loading: false,
                }),
            );
            if (!isMounted.current) return;
            if (status) {
                dispatchState({ type: 'UPDATE_CONVERSION_TYPE', payload: data, field: value?.toLowerCase?.() });
            }
        } catch {
            // Conversion types fetch failed
        }
    };

    const fetchGoalBenchmarkPercentage = async (value, typeName) => {
        try {
            const payload = {
                userId,
                clientId,
                departmentId,
                campaignAttributeId: _get(getValues('communicationType'), 'campaignAttributeId', 0),
                metricsId: getMetrixValue(value),
            };
            const { data, status } = await dispatch(getBenchmarkDetails({ payload, loading: false }));
            if (!isMounted.current) return;

            if (status && Object.keys(data ?? {})?.length) {
                let { benchMarkValue, benchMarkMaxValue, benchMarkMinValue } = data ?? {};
                benchMarkValue = parseFloat(Number(benchMarkValue).toFixed(2));
                setValue(typeName, formatGoalPercentageForForm(benchMarkValue ?? 0));
                setValue(`${typeName}benchMarkMaxValue`, benchMarkMaxValue);
                setValue(`${typeName}benchMarkMinValue`, benchMarkMinValue);
                trigger(typeName);
            } else {
                setValue(typeName, formatGoalPercentageForForm(0));
            }
        } catch {
            // Benchmark fetch failed
        }
    };

    const loadPrimaryGoalDependencies = async (goalValueResolved) => {
        try {
            const needsConversionList =
                goalValueResolved &&
                !Object.hasOwn(state?.conversionTypes ?? {}, goalValueResolved.toLowerCase()) &&
                (goalValueResolved === 'Engagement' || goalValueResolved === 'Conversion');

            const requests = [
                primaryGoalBenchmarkLoader.refetch({
                    fetcher: async () => {
                        await fetchGoalBenchmarkPercentage(goalValueResolved, 'primaryGoalPercentage');
                    },
                }),
            ];

            if (needsConversionList) {
                requests.push(
                    primaryGoalConversionTypesLoader.refetch({
                        fetcher: async () => {
                            await fetchConversionTypesForGoal(goalValueResolved);
                        },
                    }),
                );
            }

            await Promise.all(requests);
        } catch {
            // Primary goal dependencies load failed
        }
    };

    const loadSecondaryGoalDependencies = async (goalValue) => {
        try {
            const needsConversionList =
                goalValue &&
                !Object.hasOwn(state?.conversionTypes ?? {}, goalValue.toLowerCase()) &&
                (goalValue === 'Engagement' || goalValue === 'Conversion');

            const requests = [
                secondaryGoalBenchmarkLoader.refetch({
                    fetcher: async () => {
                        await fetchGoalBenchmarkPercentage(goalValue, 'secondaryGoalPercentage');
                    },
                }),
            ];

            if (needsConversionList) {
                requests.push(
                    secondaryGoalConversionTypesLoader.refetch({
                        fetcher: async () => {
                            await fetchConversionTypesForGoal(goalValue);
                        },
                    }),
                );
            }

            await Promise.all(requests);
        } catch {
            // Secondary goal dependencies load failed
        }
    };

    const handleGoalTypeChange = () => {
        setTimeout(() => {
            const primary = getValues('primaryGoalType');
            const secondary = getValues('secondaryGoalType');
            const anyOffline =
                isOfflineConversionGoalSelection(primary) || isOfflineConversionGoalSelection(secondary);

            if (anyOffline) {
                setValue('analyticsTypes[0].selected', false);
            } else if (!getValues('analyticsTypes[0].selected')) {
                setValue('analyticsTypes[0].selected', true);
            }
        }, 0);
    };

    const handleCommunicationBlur = async (value) => {
        try {
            if (value !== _get(state, 'edit.campaignName', '')) {
                if (value?.length > 0 && !communicationNameError && existingCommunicationName.current !== value) {
                    existingCommunicationName.current = value;
                    const payload = {
                        campaignName: value.trim(),
                        campaignId: _get(locationState, 'campaignId', 0),
                        userId,
                        clientId,
                        departmentId,
                    };
                    await communicationNameLoader.refetch({
                        fetcher: async () =>
                            dispatch(
                                checkCommunicationNameExists({ payload, setError, isLoading: false }),
                            ),
                        onSuccess: (res) => {
                            if (!isMounted.current) return;
                            const { status } = res || {};
                            if (status === false) {
                                setNameState({ isValid: true });
                            } else {
                                existingCommunicationName.current = null;
                                setNameState({ isValid: false });
                            }
                        },
                        onError: () => {
                            if (!isMounted.current) return;
                            existingCommunicationName.current = null;
                            setNameState({ isValid: false });
                        },
                    });
                } else if (communicationNameError) {
                    existingCommunicationName.current = null;
                }
            } else if (isMounted.current) {
                setNameState({
                    isValid: true,
                });
            }
        } catch {
            // Communication name check failed
        }
    };

    const handleDynamicList = async (list, channelType, fromDDL = false, isEdit) => {
        const runInner = async () => {
            try {
                const dynamicListId = list?.dynamicListId;
                const payload = {
                    dynamicList: dynamicListId || 0,
                    campaignType: 'T',
                    campaignId: _get(locationState, 'campaignId', 0),
                    departmentId: departmentId,
                };
                const response = await dispatch(
                    getTriggerDynamicListChanneltype({ payload, loading: false }),
                );
                if (!isMounted.current) return;
                const { status, data, isImmediate } = response ?? {};
            if (isImmediate === false) {
                setFrequencyId(1);
                dispatchState({
                    type: 'UPDATE_EDIT_FLOW',
                    payload: {
                        currentFrequencyTab: 2,
                        frequencyType: 1,
                    },
                });
                setFrequencyTabConfig(
                    FREQUENCY_TAB_CONFIG.map((tab) => ({
                        ...tab,
                        disable: tab.id === 4 || tab.id === 5,
                    })),
                );
            } else {
                setFrequencyId(4);
                dispatchState({
                    type: 'UPDATE_EDIT_FLOW',
                    payload: {
                        currentFrequencyTab: 0,
                        frequencyType: 4,
                    },
                });
                setFrequencyTabConfig(
                    FREQUENCY_TAB_CONFIG.map((tab) => {
                        if (tab.id === 4) {
                            const { disable, ...rest } = tab;
                            return rest;
                        }
                        return { ...tab };
                    }),
                );
            }
            const handleCheckedEditFlow = (updateChannelTypes) => {
                if (isEdit && channelType) {
                    return updateChannelTypes?.map((channel) => {
                        const isSelected = channelType?.some((item) => channel?.id?.includes(item));
                        return {
                            ...channel,
                            selected: isSelected,
                        }
                    })
                } else {
                    return updateChannelTypes
                }
            }
            if (status) {
                let savedAPIResponse = {};
                data?.forEach((item) => {
                    const findChannel = CHANNEL_TYPES.find((channel) =>
                        channel?.checkAllChannelsExist ? channel?.checkListChannel?.includes(item?.channelId) : null,
                    );
                    if (findChannel?.checkAllChannelsExist) {
                        savedAPIResponse[findChannel?.parentChannelId?.[0]] = checkAllChannelsSaved(
                            item?.channelId,
                            data,
                            findChannel,
                        );
                    } else {
                        savedAPIResponse[item?.channelId] =
                            checkAllChannelsSaved(item?.channelId, data, findChannel) || [];
                    }
                });
                const updateChannelTypes = _map(CHANNEL_TYPES, (channel) => {
                    const isChannel = savedAPIResponse[channel?.id?.[0]]?.some((item) =>
                        channel?.id?.includes(item?.channelId),
                    );
                    const isSelected = channelType?.some((item) => channel?.id?.includes(item));
                    return {
                        ...channel,
                        selected: isSelected,
                        disabled: isChannel && type === 'event',
                    };
                });

                const otherWebSave = data?.some(
                    (item) => item?.channelId === 8 && item?.campaignId !== locationState?.campaignId,
                );
                const otherMobileSave = data?.some(
                    (item) => item?.channelId === 14 && item?.campaignId !== locationState?.campaignId,
                );

                const updateAnalyticsType = ANALYTICS_TYPES.map((analytics) => {
                    const shouldDisable = analytics?.id?.includes(16) && otherMobileSave && otherWebSave; // vennila feedback
                    return {
                        ...analytics,
                        disabled: shouldDisable ? true : analytics?.disabled,
                    };
                });
                if (fromDDL) {
                    const handleCheckedEditFlow = (updateChannelTypes) => {
                        if (isEdit && channelType) {
                            return updateChannelTypes?.map((channel) => {
                                const isSelected = channelType?.some((item) => channel?.id?.includes(item));
                                return {
                                    ...channel,
                                    selected: isSelected,
                                }
                            })
                        } else {
                            return updateChannelTypes
                        }
                    }
                    reset((formstate) => ({
                        ...formstate,
                        channelTypes: handleCheckedEditFlow(updateChannelTypes),
                        analyticsTypes: updateAnalyticsType,
                    }));
                }
                setSavedDynamicListChannel(data);
                return {
                    channelTypes: updateChannelTypes,
                    analyticsTypes: updateAnalyticsType,
                };
            } else {
                if (fromDDL) {
                    reset((formstate) => ({
                        ...formstate,
                        channelTypes: CHANNEL_TYPES,
                        analyticsTypes: ANALYTICS_TYPES,
                    }));
                } else {
                    if (isEdit) {
                        const updateChannelType = handleCheckedEditFlow(CHANNEL_TYPES)
                        reset((formstate) => ({
                            ...formstate,
                            channelTypes: updateChannelType,
                            analyticsTypes: ANALYTICS_TYPES,
                        }));
                        return {
                            channelTypes: updateChannelType,
                            analyticsTypes: ANALYTICS_TYPES,
                        };
                    } else {
                        return {
                            channelTypes: CHANNEL_TYPES,
                            analyticsTypes: ANALYTICS_TYPES,
                        };
                    }
                }
            }
            setSavedDynamicListChannel([]);
            return {
                channelTypes: CHANNEL_TYPES,
                analyticsTypes: ANALYTICS_TYPES,
            };
            } catch {
                // Dynamic list channel type fetch failed
            }
        };
        return dynamicListLoader.refetch({ fetcher: runInner });
    };

    const handleAnalyticsType = (analytics, ConversionName) => {
        // 1 - full TL list
        // 3 - TL,AL List Mixed
        const isEditFlowCheck = _get(locationState, 'campaignId', 0) && [1, 3]?.includes(parseInt(campaignBlastDetails?.[0]?.isAdhoclist,10))
        if (ConversionName && (isEditFlowCheck || parseInt(_get(locationState, 'campaignId', 0), 10) === 0)) {
            const updateAnalytics = [...(analytics ?? []), 1001];
            return updateAnalytics;
        } else {
            return analytics;
        }
    };

    const checkProductSubProduct = () => {
        if (isProductType || isSubProductType) {
            if (isProductType) {
                setError(
                    'productcategoryTypeText',
                    {
                        type: 'custom',
                        message: 'Please save the product type before proceeding',
                    },
                    { shouldFocus: true },
                );
            }
            if (isSubProductType) {
                setError(
                    'productSubcategoryTypeText',
                    {
                        type: 'custom',
                        message: 'Please save the sub product type before proceeding',
                    },
                    { shouldFocus: true },
                );
            }
            return true;
        } else {
            return false;
        }
    };

    const handleCompletedOrAlertSubmit = async (buttonType) => {
        dispatch(setTabforEdit(null));
        dispatch(showTabsSmartlink(false));

        const rawFormState = getValues();
        const payload = buildPlanSubmitPayload({
            formState: rawFormState,
            type,
            reducerState: state,
            mode,
            locationState,
            departmentId,
            userId,
            clientId,
            tags: selectedTags,
            isSecondaryGoal,
            isCommunicationReference,
            communicationReferenceData: state?.communicationReferenceData,
            savedDynamicListChannel,
        });
        const { channelTypes, analyticsTypes } = flattenPlanChannelAnalytics({
            formState: rawFormState,
            savedDynamicListChannel,
            campaignId: _get(locationState, 'campaignId', 0),
        });
        const hasOfflineConversion =
            isOfflineConversionGoalSelection(rawFormState?.primaryGoalType) ||
            isOfflineConversionGoalSelection(rawFormState?.secondaryGoalType);
        const endDate = getValues('enddate');
        const startDate = getValues('startdate');
        const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const props = {
            communicationType: rawFormState?.communicationType,
            primaryGoal: rawFormState?.primaryGoal,
            productType: rawFormState?.productType,
            secondaryGoal: rawFormState?.secondaryGoal,
            channelType: channelTypes,
            buttonType,
            analyticsTypes: handleAnalyticsType(analyticsTypes, hasOfflineConversion),
            offlineConversion: hasOfflineConversion,
            isEditable: locationState?.isEditable,
            statusId: locationState?.statusId,
            timeZoneId: timeZone,
            templateId: locationState?.edmTemplateId,
            diffDays,
            eligibleChannelType: {},
            templateChannelId: locationState?.templateChannelId || 0,
        };

        setSubmittingButtonType(buttonType);
        try {
            await handleWithoutAPICallNavigation({
                payload,
                props,
                locationState,
                navigate,
                dispatch,
                forceNavigateWithoutApi: true,
            });
        } finally {
            if (isMounted.current) {
                setSubmittingButtonType(null);
            }
        }
    };

    const handlePlanButtonClick = (buttonType) => {
        if (isCompletedOrAlertStatus(statusId)) {
            handleCompletedOrAlertSubmit(buttonType);
            return;
        }
        handleSubmit((data) => formSubmitHandler(data, buttonType))();
    };

    const isPlanFormActionDisabled =
        !isCompletedOrAlertStatus(statusId) &&
        ((state?.frequencyType === 4 ? false : !isDirty && mode !== 'edit') ||
            Object.keys(errors).length > 0);

    const formSubmitHandler = async (formState, buttonType) => {
        dispatch(setTabforEdit(null));
        dispatch(showTabsSmartlink(false));
        let tempChannelObj = {
            isEmailChecked: false,
            isMessageChecked: false,
            isNotificationChecked: false,
            isVoiceChecked: false,
            isSocialPostChecked: false,
            isPaidAdsChecked: false,
            isQRChecked: false,
        };
        const analyticsTypes = _map(
            _filter(formState?.analyticsTypes ?? [], (list) => list?.selected),
            'id',
        ).flat();
        let isWeb = analyticsTypes?.includes(6);
        let isApp = analyticsTypes?.includes(16);
        let eligibleChannelType = {};
        let channelTypes = _map(
            _filter(formState?.channelTypes ?? [], (list) => {
                var tempList;
                if (list?.selected) {
                    switch (list?.name) {
                        case 'email':
                            tempChannelObj.isEmailChecked = true;
                            break;
                        case 'messaging':
                            tempChannelObj.isMessageChecked = true;
                            eligibleChannelType[2] = getEligibleChannelIds(
                                savedDynamicListChannel,
                                2,
                                _get(locationState, 'campaignId', 0),
                            );
                            break;
                        case 'notifications': {
                            tempChannelObj.isNotificationChecked = true;
                            tempChannelObj.isMessageChecked = true;
                            eligibleChannelType[8] = getEligibleChannelIds(
                                savedDynamicListChannel,
                                8,
                                _get(locationState, 'campaignId', 0),
                            );
                            break;
                        }
                        case 'socialpost':
                            tempChannelObj.isSocialPostChecked = true;
                            break;
                        case 'voice':
                            tempChannelObj.isVoiceChecked = true;
                            break;
                        case 'ads':
                            tempChannelObj.isPaidAdsChecked = true;
                            break;
                        case 'qr':
                            tempChannelObj.isQRChecked = true;
                            break;
                    }
                }
                return list?.selected;
            }),
            'id',
        ).flat();

        // if (analyticsTypes?.length === 0) {
        //     setError('analyticsTypes[0].selected', {
        //         type: 'custom',
        //         message: SELECT_WEB_TO_PROCEED,
        //     });
        //     return;
        // }
        if (tempChannelObj.isNotificationChecked && !isWeb && !isApp) {
            setError('analyticsTypes[0].selected', {
                type: 'custom',
                message: SELECT_WEB_TO_Analytics,
            });
            return false;
        }
        let chennal = [];
        if (tempChannelObj.isNotificationChecked) {
            // if (analyticsTypes.includes(6) && !analyticsTypes.includes(16)) {
            //     chennal = channelTypes.filter((e) => e !== 14 && e);
            // }
            if (!isWeb) {
                chennal = channelTypes.filter((e) => e !== 8 && e);
            }
            if (!isApp) {
                chennal = channelTypes.filter((e) => e !== 14 && e);
            }
        }

        channelTypes = chennal?.length === 0 ? channelTypes : chennal;

        formState = {
            ...formState,
            channelTypes,
            analyticsTypes,
            isSecondaryGoal,
            tags: selectedTags,
            isCommunicationReference,
            templateId: locationState?.edmTemplateId,
            templateFlowChannelId: locationState?.templateChannelId,
            communicationReference:
                state?.communicationReferenceData?.length === 0
                    ? []
                    : [
                        state?.communicationReferenceData?.grouping,
                        state?.communicationReferenceData?.priority,
                        ...(state?.communicationReferenceData?.reference ?? []),
                    ],
            frequencyType: state?.frequencyType,
            departmentId,
            userId,
            clientId,
            campaignId: _get(locationState, 'campaignId', 0),
            eligibleChannelType,
            // timeZoneId: formState.timezone === 0 ? timeZoneId : formState.timezone,
            //timeZoneId: _get(formState?.timezone, 'timezoneID', 0) || 0,
        };
        let ConversionName = false;
        if (
            isOfflineConversionGoalSelection(formState?.primaryGoalType) ||
            isOfflineConversionGoalSelection(formState?.secondaryGoalType)
        ) {
            ConversionName = true;
        } else {
            ConversionName = false;
        }
        if (
            isDateBeforeToday(getValues('startdate')) &&
            buttonType !== 'save' &&
            Number(locationState?.statusId) === 6 &&
            isEditable
        ) {
            setError('startdate', {
                type: 'required',
                message: SELECT_START_DATE,
            });
            return;
        }
        let endDate = getValues('enddate');
        let startDate = getValues('startdate');

        const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const week = watch('weekly.week');
        const days = watch('daily.days');
        let diffYears = endDate?.getFullYear?.() - startDate?.getFullYear?.();
        const monthlyType = _get(watch('monthly'), 'type', 'day');
        const months = monthlyType === 'Day(s)' ? watch('monthly.first_months') : watch('monthly.second_months');
        let diffMonths = new Date(endDate)?.getMonth?.() - new Date(startDate)?.getMonth?.();
        let totalMonths = diffYears * 12 + diffMonths;
        if (parseInt(state?.frequencyType, 10) === 2) {
            //week
            if (diffDays < 7) {
                setError('enddate', {
                    type: 'custom',
                    message: 'Frequency exceeds the comm. period',
                });
                return false;
            } else if (diffDays >= 7 && parseInt(week, 10) > 1) {
                if (diffDays < parseInt(week, 10) * 7) {
                    setError('enddate', {
                        type: 'custom',
                        message: 'Frequency exceeds the comm. period',
                    });
                    return false;
                }
            }
        } else if (parseInt(state?.frequencyType, 10) === 3) {
            //Monthly
            if (isFullMonthDifference(startDate, endDate, parseInt(months, 10))) {
                setError('enddate', {
                    type: 'custom',
                    message: 'Frequency exceeds the comm. period',
                });
                return false;
            }
        } else if (diffDays < 1) {
            setError('enddate', {
                type: 'custom',
                message: 'Frequency exceeds the comm. period',
            });
            return false;
        } else if (parseInt(state?.frequencyType, 10) === 1) {
            //daily

            if (diffDays < 1) {
                setError('enddate', {
                    type: 'custom',
                    message: 'Frequency exceeds the comm. period',
                });
                return false;
            } else if (parseInt(days, 10) > 1) {
                if (diffDays < parseInt(days, 10)) {
                    setError('enddate', {
                        type: 'custom',
                        message: 'Frequency exceeds the comm. period',
                    });
                    return false;
                }
            }
        } else {
            clearErrors('enddate');
        }

        const handleSavePlan = async () => {
            const payload = buildPlanSubmitPayload({
                formState: getValues(),
                type,
                reducerState: state,
                mode,
                locationState,
                departmentId,
                userId,
                clientId,
                tags: selectedTags,
                isSecondaryGoal,
                isCommunicationReference,
                communicationReferenceData: state?.communicationReferenceData,
                savedDynamicListChannel,
            });
            const submitChannelTypes = payload?.channelType ?? [];
            const submitAnalyticsTypes = payload?.analyticsTypes ?? [];
            if (submitChannelTypes?.length === 0 && type !== 'multi') {
                setError('channelTypes[0].selected', {
                    type: 'custom',
                    message: SELECT_CHANNEL_TYPE,
                });
                return false;
            }
            const formValues = getValues();
            const props = {
                communicationType: formValues?.communicationType,
                primaryGoal: formValues?.primaryGoal,
                productType: formValues?.productType,
                secondaryGoal: formValues?.secondaryGoal,
                channelType: submitChannelTypes,
                buttonType,
                analyticsTypes: handleAnalyticsType(submitAnalyticsTypes, ConversionName),
                offlineConversion: ConversionName,
                isEditable: locationState?.isEditable,
                statusId: locationState?.statusId,
                timeZoneId: timeZone,
                templateId: locationState?.edmTemplateId,
                diffDays,
                eligibleChannelType,
                templateChannelId: locationState?.templateChannelId || 0,
            };

            if (mode === 'edit' && isPlanPayloadEqual(payload, boundPlanPayloadRef.current)) {
                setSubmittingButtonType(buttonType);
                try {
                    const navigatedWithoutApi = await handleWithoutAPICallNavigation({
                        payload,
                        props,
                        locationState,
                        navigate,
                        dispatch,
                        forceNavigateWithoutApi: true,
                    });
                    if (navigatedWithoutApi) {
                        return;
                    }
                } finally {
                    if (isMounted.current) {
                        setSubmittingButtonType(null);
                    }
                }
            }

            const isEventTrigger =
                locationState?.campaignType === 'T' ||
                locationState?.campaignType === 'E' ||
                type === 'event';
            const isInProgress = parseInt(locationState?.statusId, 10) === 5;
            const isEndDateModified = editModeEndDateRef.current
                ? getYYMMDD(getValues('enddate')) !== getYYMMDD(new Date(editModeEndDateRef.current))
                : false;

            if (isEventTrigger && isInProgress) {
                const isPlanUnchanged = isPlanPayloadEqual(payload, boundPlanPayloadRef.current);
                if (isPlanUnchanged && !isEndDateModified) {
                    setSubmittingButtonType(buttonType);
                    try {
                        const navigatedWithoutApi = await handleWithoutAPICallNavigation({
                            payload,
                            props,
                            locationState,
                            navigate,
                            dispatch,
                            forceNavigateWithoutApi: true,
                        });
                        if (navigatedWithoutApi) {
                            return;
                        }
                    } finally {
                        if (isMounted.current) {
                            setSubmittingButtonType(null);
                        }
                    }
                } else {
                    payload.isUpdate = true;
                }
            } else {
                payload.isUpdate = false;
            }

            setSubmittingButtonType(buttonType);
            let saveApiResponse;
            try {
                saveApiResponse = await savePlanLoader.refetch({
                    mode: 'create',
                    loaderConfig: { create: LOADER_TYPE.NONE },
                    fetcher: async () => {
                        const nextLevelCheck = await handleWithoutAPICallNavigation({
                            payload,
                            props,
                            locationState,
                            navigate,
                            dispatch,
                            forceNavigateWithoutApi: false,
                        });
                        if (nextLevelCheck) {
                            return { status: true };
                        }
                        return dispatch(
                            saveCommunicationPlan({
                                payload: { ...payload, userId, clientId, departmentId },
                                props,
                                navigate,
                                setIsCampaingFail,
                                isLoading: false,
                            }),
                        );
                    },
                });
            } finally {
                if (isMounted.current) {
                    setSubmittingButtonType(null);
                }
            }

            if (!isMounted.current) return;

            if (!saveApiResponse?.status && saveApiResponse?.message === 'communicationReference is Mandatory.') {
                setRequiredceCommReferenceModal({
                    show: true,
                    message: referenceRequired,
                });
                return;
            }
            dispatch(resetCommunicationPlan());
            dispatchState({
                type: 'RESET',
            });
        };
        if (locationState?.campaignType === 'T' || locationState?.campaignType === 'E' || type === 'event') {
            const finalEligibleNotificationType = [
                ...new Set([...(eligibleChannelType[8] ?? []), ...(eligibleChannelType[14] ?? [])]),
            ].filter((id) => id);
            const formStateAnalyticsTypes = getValues()?.analyticsTypes ?? [];
            const formStateChannelTypes = getValues()?.channelTypes ?? [];
            const isOnlyCheckedNotificationChannel = formStateChannelTypes?.every((channel) =>
                channel?.id?.includes(8) || channel?.id?.includes(14) ? channel?.selected : !channel?.selected,
            );
            if (
                finalEligibleNotificationType?.length === 1 &&
                finalEligibleNotificationType?.includes(14) &&
                isOnlyCheckedNotificationChannel
            ) {
                const appAnalytics = formStateAnalyticsTypes?.find((type) => type?.id?.includes(16));
                if (appAnalytics && appAnalytics?.selected !== true) {
                    setError(`analyticsTypes[0].selected`, {
                        type: 'custom',
                        message: 'Select App Analytics',
                    });
                    return false;
                }
            }
        }
        if (
            hasOfflineConversionChannelConflict(
                getValues('primaryGoalType'),
                getValues('secondaryGoalType'),
                getMergedChannelTypesForOfflineValidation(),
            )
        ) {
            const chMerged = getMergedChannelTypesForOfflineValidation();
            setOfflineConversionChannelWarningPopup({
                show: true,
                incompatibleChannelLabels: getSelectedIncompatibleOfflineConversionChannelLabels(chMerged),
            });
            return false;
        }
        await handleSavePlan();

        // if (diffDays <= 3) {
        //     setIsShowMiniDuartionWarning({
        //         show: true,
        //         proceedCallback: handleSavePlan,
        //     });
        //     return;
        // } else {
        //     handleSavePlan();
        // }
    };

    const handleTabChange = (id) => {
        if (frequencyId !== id)
            switch (id) {
                case 1:
                    reset((formState) => ({
                        ...formState,
                        daily: {
                            days: '',
                            hours: '',
                        },
                    }));
                    break;
                case 2:
                    reset((formState) => ({
                        ...formState,
                        weekly: {
                            weekDays: [],
                            hours: '',
                            week: '',
                        },
                    }));
                    break;
                case 3:
                    reset((formState) => ({
                        ...formState,
                        monthly: {
                            type: '',
                            second_hours: '',
                            second_months: '',
                            second_days: '',
                            second_frequency: '',
                            first_hours: '',
                            first_months: '',
                            first_day: '',
                        },
                    }));
                    break;
                case 4:
                    break;
                case 5:
                    reset((formState) => ({
                        ...formState,
                        shortly: {
                            every_time: '',
                            period: '',
                        },
                    }));
                    break;
            }
    };

    const handleErrClose = () => {
        if (isGetCampaignFail) {
            navigate('/communication', {
                index: 0,
            });
        }
    };

    const handleEndDateClickOff = () => {
        if (locationState?.campaignType === 'M') {
            if (statusId === 9) {
                return true;
            } else {
                return false;
            }
        } else if (locationState?.campaignType === 'S') {
            if (statusId === 9 || statusId === 52) {
                return true;
            } else {
                return false;
            }
        } else if (locationState?.campaignType === 'E' || locationState?.campaignType === 'T') {
            if (!locationState?.communicationExcuteStatus && locationState?.communicationExcuteStatus !== undefined) {
                return true;
            } else if (statusId === 9) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    };

    const watchedFields = watch([
        'daily.days',
        'weekly.hours',
        'weekly.weekDays',
        'weekly.hours',
        'weekly.week',
        'monthly.type',
        'shortly.every_time',
        'shortly.period',
    ]);

    // JSX
    return (
        <FormProvider {...methods}>
            {isInitialLoading ? (
                <DeliveryMethodSkeleton type={type} />
            ) : (
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handlePlanButtonClick('form');
                }}
            >
                <div className={`box-design bd-top-border ${!isEditable ? 'create-not-edit' : ''}`}>
                    {/* First Row */}
                    <div className="form-group mt20">
                        <Row>
                            <Col sm={4} className="text-right">
                                {' '}
                                <label className="control-label-left">{COMMUNICATION_NAME_LABEL}</label>
                            </Col>
                            <Col sm={7} className={!isEditable ? 'click-off' : ''}>
                                <RSInput
                                    id="rs_DeliveryMethod_communicationName"
                                    name="communicationName"
                                    placeholder={COMMUNICATION_NAME_LABEL}
                                    control={control}
                                    required
                                    onKeyDown={charNumUnderScore}
                                    // isValidIcon={ nameState.isValid}
                                    isValidIcon={
                                        !communicationNameError &&
                                        getValues('communicationName')?.length > 3 &&
                                        nameState.isValid
                                    }
                                    isLoading={communicationNameLoader.isLoading}
                                    maxLength={MAX_LENGTH200}
                                    rules={{
                                        required: ENTER_COMUNICATION_NAME,
                                        minLength: {
                                            value: MIN_LENGTH,
                                            message: MINLENGTH,
                                        },
                                        maxLength: {
                                            value: MAX_LENGTH200,
                                            message: MAX200LENGTH,
                                        },
                                        validate: {
                                            communicationNamevalidtor,
                                            nameExists: () =>
                                                communicationNameError
                                                    ? _get(errors, 'communicationName.message')
                                                    : true,
                                        },
                                    }}
                                    handleOnchange={() => {
                                        if (communicationNameError) clearErrors('communicationName');
                                        if (communicationNameError)
                                            setNameState({
                                                isValid: true,
                                            });
                                    }}
                                    handleOnBlur={(e) => {
                                        if (e.target.value?.length < 1) {
                                            setError(`communicationName`, {
                                                type: 'custom',
                                                message: ENTER_COMUNICATION_NAME,
                                            });
                                            existingCommunicationName.current = e.target.value;
                                            return;
                                        } else if (e.target.value?.length < 3) {
                                            setError(`communicationName`, {
                                                type: 'custom',
                                                message: MINLENGTH,
                                            });
                                            existingCommunicationName.current = e.target.value;
                                            return;
                                        } else if (communicationNamePattern.test(e.target.value)) {
                                            setError('communicationName', {
                                                type: 'custom',
                                                message: SPECIAL_CHATACTERS_NOT_ALlOWED,
                                            });
                                            existingCommunicationName.current = e.target.value;
                                            return;
                                        } else {
                                            if (!Object.keys(errors)?.length) handleCommunicationBlur(e.target.value);
                                        }
                                    }}
                                />
                                <RSCheckbox
                                    control={control}
                                    name="testCommunication"
                                    labelName={TEST_COMMUNICATION}
                                    popover
                                    popover_icon={`${circle_question_mark_mini} icon-xs color-primary-blue`}
                                    popover_position="top"
                                    popover_content={TEST_COMMUNICATION_TOOLTIP}
                                />
                            </Col>
                            <Col sm={1} className="fg-icons-wrapper pl0">
                                <div className="fg-icons d-flex">
                                    <RSTooltip text={TAGS}>
                                        <div className={isTagsIconDisabled ? 'pe-none click-off' : ''}>
                                        <i
                                            id="rs_DeliveryMethod_tagplus"
                                            className={`${tag_plus_medium} icon-md color-primary-blue cp`}
                                            onClick={() => {
                                                dispatchState({
                                                    type: 'UPDATE',
                                                    payload: true,
                                                    field: 'isTagsEnabled',
                                                });
                                                dispatchState({
                                                    type: 'UPDATE',
                                                    payload: true,
                                                    field: 'isTagEnabledModal',
                                                });
                                            }}
                                        />
                                        </div>
                                    </RSTooltip>
                                    <RSTooltip text={COMMUNICATION_REFERENCE}>
                                        {communicationReferenceLoader.isLoading ? (
                                            <span className="d-inline-flex align-items-center justify-content-center pe-none">
                                                <span className="segment_loader" />
                                            </span>
                                        ) : (
                                            <div
                                                className={isCommReferenceIconDisabled ? 'pe-none click-off' : ''}
                                            >
                                            <i
                                                id="rs_DeliveryMethod_edit"
                                                className={`${form_edit_medium} icon-md color-primary-blue cp
                                                `}
                                                onClick={() => {
                                                    const referenceFormState = getCommunicationReferenceFormState(
                                                        state?.communicationReferenceData,
                                                    );
                                                    const hasFormFields =
                                                        referenceFormState.reference.length > 0 ||
                                                        Object.keys(referenceFormState.grouping).length > 0;

                                                    const finalEditReferenceData = hasFormFields
                                                        ? state.communicationReferenceData
                                                        : handleReferenceData(
                                                              [],
                                                              referenceConfigList,
                                                              '',
                                                              referenceFormState.docketFilename,
                                                          );

                                                    dispatchState({
                                                        type: 'UPDATE',
                                                        payload: true,
                                                        field: 'isCommunicationReferenceModal',
                                                    });
                                                    dispatchState({
                                                        type: 'UPDATE_EDIT',
                                                        payload: {
                                                            communicationReferenceData: finalEditReferenceData,
                                                        },
                                                    });
                                                }}
                                            />
                                            </div>
                                        )}
                                    </RSTooltip>
                                </div>
                            </Col>
                        </Row>
                    </div>
                    <div
                        className={`form-group ${!nameState.isValid ? 'pe-none' : ''} ${!isEditable ? 'click-off' : ''
                            }`}
                    >
                        <Row>
                            <Col sm={4} className="text-right">
                                <label className="control-label-left">{COMMUNICATION_TYPE}</label>
                            </Col>
                            <Col sm={7} id="rs_DeliveryMethod_communicationType">
                                <RSKendoDropDownList
                                    data={attributes}
                                    textField="attributename"
                                    dataItemKey="campaignAttributeId"
                                    control={control}
                                    name="communicationType"
                                    label={COMMUNICATION_TYPE}
                                    isLoading={planOptionsLoader.isLoading}
                                    required
                                    rules={{
                                        required: SELECT_COMMUNICATION_TYPE,
                                    }}
                                    handleChange={() => {
                                        reset((formState) => ({
                                            ...formState,
                                            primaryGoal: '',
                                            primaryGoalPercentage: '',
                                            secondaryGoal: '',
                                            secondaryGoalPercentage: '',
                                        }));
                                        dispatchState({ type: 'UPDATE', payload: false, field: 'secondaryGoal' });
                                    }}
                                />
                                <RSCheckbox
                                    control={control}
                                    name="isServiceMandatoryComm"
                                    labelName={SERVICE_MANDATORY_COMMUNICATION}
                                    popover
                                    popover_icon={`${circle_question_mark_mini}  icon-xs color-primary-blue`}
                                    popover_position="top"
                                    popover_content={COMMUNICATIONS_DELIVERED_RECIPIENTS}
                                />
                            </Col>
                        </Row>
                    </div>
                    {/* Second Row */}
                    <div
                        className={`form-group ${!nameState.isValid ? 'pe-none' : ''} ${!isEditable ? 'click-off' : ''
                            }`}
                    >
                        <Row>
                            <Col sm={4} className="text-right">
                                <label className="control-label-left">{PRODUCT_TYPE_LABEL}</label>
                            </Col>
                            <Col sm={7}>
                                <Row>
                                    <Col md={6} id="rs_DeliveryMethod_productType position-relative">
                                        {/* <RSKendoDropDownList
                                            data={product}
                                            textField="categoryname"
                                            dataItemKey="categoryId"
                                            filterName={'categoryname'}
                                            control={control}
                                            name="productType"
                                            label={PRODUCTType}
                                            required
                                            rules={{
                                                required: SELECT_PRODUCT_TYPE,
                                            }}
                                            handleChange={async ({ value }) => {
                                                const { categoryId } = value;
                                                const payload = {
                                                    userId,
                                                    clientId,
                                                    departmentId,
                                                    categoryId: categoryId,
                                                };
                                                const { data } = await dispatch(
getCommunicationSubProducts({
                                                        payload,
                                                    }),
                                                );
                                                const errormessage = !data
                                                    ? {}
                                                    : {
                                                          required: SELECT_SUB_PRODUCT_TYPE,
                                                      };
                                                dispatchState({
                                                    type: 'UPDATE',
                                                    payload: errormessage,
                                                    field: 'subProductError',
                                                });
                                                unregister('subProductType');
                                            }}
                                        /> */}

                                        {isProductType ? (
                                            <div className="position-relative">
                                                <RSInput
                                                    name={'productcategoryTypeText'}
                                                    control={control}
                                                    placeholder={'New product type'}
                                                    required
                                                    isLoading={saveProductCategoryLoader.isLoading}
                                                    disabled={saveProductCategoryLoader.isLoading}
                                                    onKeyDown={charNumUnderScore}
                                                    className={'pr50'}
                                                    rules={{
                                                        required: 'Enter a product category name',
                                                        validate: (value) => {
                                                            if (value && value.trim() !== '' && value?.length < 3) {
                                                                return 'Enter Min 3 characters to save';
                                                            }
                                                            if (communicationNamevalidtor(value) !== undefined) {
                                                                return SPECIAL_CHATACTERS_NOT_ALlOWED;
                                                            }
                                                            const res = product?.some(
                                                                (item) =>
                                                                    item?.categoryname?.trim()?.toLowerCase() ===
                                                                    value.trim()?.toLowerCase(),
                                                            );
                                                            if (res) {
                                                                return PLAN_PRODUCT_DUPLICATE_NAME;
                                                            } else {
                                                                return true;
                                                            }
                                                        },
                                                    }}
                                                    maxLength={MAX_LENGTH50}
                                                />
                                                {!isFieldLoading && !saveProductCategoryLoader.isLoading && (
                                                    <div className="align-items-center d-flex justify-content-between position-absolute top4 right5 zIndex2">
                                                        <RSTooltip position="top" text="Save" className="mr10">
                                                            <i
                                                                onClick={() => {
                                                                    saveCategoryData();
                                                                }}
                                                                className={`${save_mini} ${!errors?.productcategoryTypeText &&
                                                                    watch('productcategoryTypeText')?.length >= 3
                                                                    ? ''
                                                                    : 'click-off'
                                                                    } icon-xs color-primary-blue`}
                                                            ></i>
                                                        </RSTooltip>
                                                        <RSTooltip position="top" text={'Cancel'}>
                                                            <i
                                                                className={`${close_medium}  color-primary-red`}
                                                                onClick={() => {
                                                                    setValue('productcategoryTypeText', '');
                                                                    setIsProducttype(false);
                                                                    setValue('productType', '');
                                                                    clearErrors('productcategoryTypeText', '');
                                                                    setClickOff(false);
                                                                }}
                                                            ></i>
                                                        </RSTooltip>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <RSKendoDropdown
                                                data={product}
                                                textField="categoryname"
                                                dataItemKey="categoryId"
                                                filterName={'categoryname'}
                                                control={control}
                                                name="productType"
                                                label={PRODUCTType}
                                                required
                                                rules={{
                                                    required: SELECT_PRODUCT_TYPE,
                                                }}
                                                popupSettings={{
                                                    popupClass: `addImportAudienceDropdownListContainer`,
                                                }}
                                                isLoading={planOptionsLoader.isLoading}
                                                handleChange={handleProductTypeChange}
                                                footer={
                                                    <NewAttributeBtn
                                                        show={product?.length >= 10 ? 'click-off' : ''}
                                                        title="New product type"
                                                        handleModalAttribute={() => {
                                                            setIsProducttype(true);
                                                            setValue('productcategoryTypeText', '');
                                                            setValue('productType', '');
                                                            clearErrors('productcategoryTypeText');
                                                            clearErrors('productType');
                                                            setTimeout(() => {
                                                                setFocus('productcategoryTypeText');
                                                            }, 100);
                                                        }}
                                                    />
                                                }
                                            />
                                        )}
                                    </Col>
                                    <Col md={6} id="rs_DeliveryMethod_subproductType" className="position-relative">
                                        {/* <RSKendoDropDownList
                                            data={subProducts || []}
                                            textField="subCategoryName"
                                            dataItemKey="subCategoryId"
                                            control={control}
                                            disabled={!_get(productType, 'categoryname', '') || !subProducts?.length}
                                            name="subProductType"
                                            label={SUB_PRODUCT_TYPE}
                                            //required
                                            // rules={state.subProductError}
                                        /> */}

                                        {isSubProductType ? (
                                            <Fragment>
                                                <RSInput
                                                    name={'productSubcategoryTypeText'}
                                                    control={control}
                                                    placeholder={'New sub product type'}
                                                    required
                                                    isLoading={saveSubProductLoader.isLoading}
                                                    disabled={saveSubProductLoader.isLoading}
                                                    onKeyDown={charNumUnderScore}
                                                    className={'pr35'}
                                                    rules={{
                                                        required: 'Enter a sub product name',
                                                        validate: (value) => {
                                                            if (value && value.trim() !== '' && value?.length < 3) {
                                                                return 'Enter Min 3 characters to save';
                                                            }
                                                            if (communicationNamevalidtor(value) !== undefined) {
                                                                return SPECIAL_CHATACTERS_NOT_ALlOWED;
                                                            }
                                                            const res = subProducts?.some(
                                                                (item) =>
                                                                    item?.subCategoryName?.trim()?.toLowerCase() ===
                                                                    value.trim()?.toLowerCase(),
                                                            );
                                                            if (res) {
                                                                return PLAN_SUB_PRODUCT_DUPLICATE_NAME;
                                                            } else {
                                                                return true;
                                                            }
                                                        },
                                                    }}
                                                    maxLength={MAX_LENGTH50}
                                                />
                                                {!isFieldLoading && !saveSubProductLoader.isLoading && (
                                                    <div className="align-items-center d-flex justify-content-between position-absolute top4 right5 zIndex2">
                                                        <RSTooltip position="top" text="Save" className="mr10">
                                                            <i
                                                                onClick={() => {
                                                                    saveSubCategoryData();
                                                                }}
                                                                className={`${save_mini} ${productSubcategoryTypeTextError != errors?.productSubcategoryTypeText &&
                                                                    watch('productSubcategoryTypeText')?.length >= 3
                                                                    ? ''
                                                                    : 'click-off'
                                                                    } icon-xs color-primary-blue`}
                                                            ></i>
                                                        </RSTooltip>
                                                        <RSTooltip position="top" text={'Cancel'}>
                                                            <i
                                                                className={`${close_medium}  color-primary-red`}
                                                                onClick={() => {
                                                                    setValue('productSubcategoryTypeText', '');
                                                                    setIsSubProducttype(false);
                                                                    setValue('subProductType', '');
                                                                    clearErrors('productSubcategoryTypeText', '');
                                                                    setClickOff(false);
                                                                }}
                                                            ></i>
                                                        </RSTooltip>
                                                    </div>
                                                )}
                                            </Fragment>
                                        ) : (
                                            <RSKendoDropdown
                                                data={subProducts || []}
                                                textField="subCategoryName"
                                                dataItemKey="subCategoryId"
                                                filterName={'subCategoryName'}
                                                control={control}
                                                isLoading={isSubProductsLoading}
                                                disabled={!_get(productType, 'categoryname', '') || isSubProductsLoading}
                                                name="subProductType"
                                                label={SUB_PRODUCT_TYPE}
                                                popupSettings={{
                                                    popupClass: `addImportAudienceDropdownListContainer`,
                                                }}
                                                footer={
                                                    <NewAttributeBtn
                                                        show={subProducts?.length >= 5 ? 'click-off' : ''}
                                                        title="New sub product type"
                                                        handleModalAttribute={() => {
                                                            setValue('productSubcategoryTypeText', '');
                                                            setValue('subProductType', '');
                                                            clearErrors('productSubcategoryTypeText');
                                                            clearErrors('subProductType');
                                                            setIsSubProducttype(true);
                                                            setTimeout(() => {
                                                                setFocus('productSubcategoryTypeText');
                                                            }, 100);
                                                        }}
                                                    />
                                                }
                                            />
                                        )}
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </div>
                    {/* Third Row */}
                    <div
                        className={`form-group ${!nameState.isValid ? 'pe-none' : ''} ${!isEditable ? 'click-off' : ''
                            }`}
                    >
                        <Row>
                            <Col sm={4} className="text-right">
                                <label className="control-label-left">{PRIMARY_GOAL_LABEL}</label>
                            </Col>
                            <Col sm={7}>
                                <Row>
                                    <Col
                                        md={6}
                                        className={`${state?.secondaryGoal ? 'click-off' : ''}`}
                                        id="rs_DeliveryMethod_PrimaryGoal"
                                    >
                                        <RSKendoDropdown
                                            data={goalValue}
                                            control={control}
                                            name="primaryGoal"
                                            required
                                            rules={{
                                                required: SELECT_PRIMARY_GOAL,
                                            }}
                                            label={PRIMARY_GOAL}
                                            handleChange={async (event) => {
                                                if (!communicationType) {
                                                    trigger('communicationType');
                                                    reset((formState) => ({
                                                        ...formState,
                                                        primaryGoal: '',
                                                    }));
                                                    return;
                                                }
                                                clearErrors('primaryGoalType');
                                                const goalValueResolved = event?.value ?? '';
                                                if (goalValueResolved !== '' && goalValueResolved !== 'Reach') {
                                                    dispatchState({
                                                        type: 'UPDATE',
                                                        payload: true,
                                                        field: 'primaryGoal',
                                                    });
                                                } else {
                                                    dispatchState({
                                                        type: 'UPDATE',
                                                        payload: false,
                                                        field: 'primaryGoal',
                                                    });
                                                }
                                                setValue('primaryGoal', goalValueResolved);
                                                setValue('primaryGoalType', []);
                                                await loadPrimaryGoalDependencies(goalValueResolved);
                                            }}
                                        />
                                    </Col>
                                    <Col md={6} className={`${state?.secondaryGoal ? '1' : '2'} position-relative`}>
                                        <RSInput
                                            required
                                            name="primaryGoalPercentage"
                                            isLoading={primaryGoalBenchmarkLoader.isLoading}
                                            id="rs_DeliveryMethod_PrimaryGoalPercentage"
                                            placeholder={GOAL_PERCENTAGE}
                                            control={control}
                                            maxLength={6}
                                            rules={{
                                                required: ENTER_GOAL_PERCENTAGE,
                                                validate: (goalValue) =>
                                                    parseFloat(goalValue) < primaryMinValue ||
                                                        parseFloat(goalValue) > primaryMaxValue
                                                        ? `Accepting Only values ${primaryMinValue} - ${primaryMaxValue}`
                                                        : parseFloat(goalValue) > 100 || parseFloat(goalValue) === 0
                                                            ? ENTER_VALID_PERCENTAGE
                                                            : true,
                                            }}
                                            //rules={PERCENTAGE_RULES(ENTER_GOAL_PERCENTAGE)}
                                            onKeyDown={(e) => onlyNumbersDecimalWithoutSpecialCharacters(e)}
                                        />
                                        {!primaryGoalBenchmarkLoader.isLoading && (
                                            <div className="fg-percentage-right">%</div>
                                        )}
                                    </Col>
                                </Row>
                            </Col>
                            <Col sm={1} className="pl0">
                                <RSTooltip position="top" text={ADD} className="d-inline-block lh0 position-relative top3">
                                    <div
                                        className={` ${!isPrimaryGoalValid || state?.secondaryGoal ? 'pe-none click-off' : ''
                                            }`}
                                    >
                                        <i
                                            id="rs_data_circle_plus_fill_edge"
                                            className={`${circle_plus_fill_edge_medium} icon-md color-primary-blue cp `}
                                            onClick={() =>
                                                dispatchState({
                                                    type: 'UPDATE',
                                                    payload: true,
                                                    field: 'isOpenGoalModal',
                                                })
                                            }
                                        ></i>
                                    </div>
                                </RSTooltip>
                            </Col>
                        </Row>
                    </div>
                    {primaryGoal && primaryGoal !== 'Reach' && (
                        <div
                            className={`form-group ${!nameState.isValid ? 'pe-none' : ''} ${!isEditable ? 'click-off' : ''
                                }`}
                        >
                            <Row>
                                <Col sm={4} className="text-right">
                                    <label className="control-label-left">{`${primaryGoal} type`}</label>
                                </Col>
                                <Col sm={7}>
                                    <RSMultiSelect
                                        data={_get(state, `conversionTypes.${primaryGoal?.toLowerCase()}`, [])}
                                        dataItemKey={'ConversionTypeID'}
                                        textField={'FriendlyName'}
                                        control={control}
                                        name={'primaryGoalType'}
                                        label={`${primaryGoal} type`}
                                        isLoading={primaryGoalConversionTypesLoader.isLoading}
                                        required
                                        rules={
                                            primaryGoal === 'Conversion'
                                                ? { required: SELECT_CONVERSION_TYPE }
                                                : primaryGoal === 'Engagement'
                                                    ? { required: SELECT_ENGAGEMENT_TYPE }
                                                    : { required: SELECT_PRIMARY_GOAL_TYPE }
                                        }
                                        handleChange={handleGoalTypeChange}
                                    />
                                </Col>
                            </Row>
                        </div>
                    )}
                    {/* Fourth Row */}
                    {state?.secondaryGoal && (
                        <>
                            <div
                                className={`form-group ${!nameState.isValid ? 'pe-none' : ''} ${!isEditable ? 'click-off' : ''
                                    }`}
                            >
                                <Row>
                                    <Col sm={4} className="text-right">
                                        <label className="control-label-left">{SECONDARY_GOAL_LABEL}</label>
                                    </Col>
                                    <Col sm={7}>
                                        <Row>
                                            <Col md={6}>
                                                <RSKendoDropDownList
                                                    //  data={['Reach', 'Engagement', 'Conversion']}

                                                    data={goalValue.filter((goal) => {
                                                        return primaryGoal != goal;
                                                    })}
                                                    control={control}
                                                    name="secondaryGoal"
                                                    label={'Secondary goal'}
                                                    rules={{
                                                        required: SELECT_SECONDARY_GOAL,
                                                    }}
                                                    required
                                                    handleChange={async (e) => {
                                                        const value = e?.value ?? '';
                                                        dispatchState({
                                                            type: 'UPDATE',
                                                            payload: false,
                                                            field: 'primaryGoal',
                                                        });
                                                        reset((formState) => ({
                                                            ...formState,
                                                            secondaryGoal: value,
                                                            secondaryGoalType: '',
                                                            secondaryGoalPercentage: '',
                                                        }));
                                                        await loadSecondaryGoalDependencies(value);
                                                    }}
                                                />
                                            </Col>
                                            <Col md={6} className="position-relative">
                                                <RSInput
                                                    name="secondaryGoalPercentage"
                                                    isLoading={secondaryGoalBenchmarkLoader.isLoading}
                                                    placeholder={GOAL_PERCENTAGE}
                                                    control={control}
                                                    maxLength={6}
                                                    required
                                                    onKeyDown={(e) => onlyNumbersDecimalWithoutSpecialCharacters(e)}
                                                    //rules={PERCENTAGE_RULES(ENTER_GOAL_PERCENTAGE)}
                                                    rules={{
                                                        required: ENTER_GOAL_PERCENTAGE,
                                                        validate: (goalValue) =>
                                                            parseFloat(goalValue) < secondaryMinValue ||
                                                                parseFloat(goalValue) > secondaryMaxValue
                                                                ? `Accepting Only values ${secondaryMinValue} - ${secondaryMaxValue}`
                                                                : parseFloat(goalValue) > 100 ||
                                                                    parseFloat(goalValue) === 0
                                                                    ? ENTER_VALID_PERCENTAGE
                                                                    : true,
                                                    }}
                                                />
                                                {!secondaryGoalBenchmarkLoader.isLoading && (
                                                    <div className="fg-percentage-right">%</div>
                                                )}
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col sm={1} className="pl0">
                                                <RSTooltip text={REMOVE} className="d-inline-block position-relative top3">
                                                    <i
                                                        id="rs_data_circle_minus_fill_edge"
                                                        className={`${circle_minus_fill_edge_medium} icon-md color-primary-red`}
                                                        onClick={() => {
                                                            dispatchState({
                                                                type: 'UPDATE',
                                                                payload: true,
                                                                field: 'secondaryGoalConfirmation',
                                                            });
                                                        }}
                                                    ></i>
                                                </RSTooltip>
                                    </Col>
                                </Row>
                            </div>
                            {secondaryGoal !== '' && secondaryGoal !== 'Reach' && (
                                <div
                                    className={`form-group ${!nameState.isValid ? 'pe-none' : ''} ${!isEditable ? 'click-off' : ''
                                        }`}
                                >
                                    <Row>
                                        <Col sm={4} className="text-right">
                                            <label className="control-label-left">{`${secondaryGoal} type`}</label>
                                        </Col>
                                        <Col sm={7}>
                                            <RSMultiSelect
                                                data={_get(
                                                    state,
                                                    `conversionTypes.${secondaryGoal?.toLowerCase()}`,
                                                    [],
                                                )}
                                                name="secondaryGoalType"
                                                dataItemKey="ConversionTypeID"
                                                textField="FriendlyName"
                                                control={control}
                                                required
                                                label={SECONDARY_GOAL_TYPE}
                                                isLoading={secondaryGoalConversionTypesLoader.isLoading}
                                                rules={{
                                                    required: SELECT_SECONDARY_GOAL_TYPE,
                                                }}
                                                handleChange={handleGoalTypeChange}
                                            />
                                        </Col>
                                    </Row>
                                </div>
                            )}
                        </>
                    )}
                    {/* Fifth Row */}
                    {type === 'single' && (
                        <div
                            className={`form-group  ${!nameState.isValid ? 'pe-none' : ''} ${!isEditable ? 'click-off' : ''
                                }`}
                        >
                            <Row>
                                <Col sm={4} className="text-right">
                                    <label className="control-label-left">{ROI_LABEL}</label>
                                </Col>
                                <Col sm={7}>
                                    <div className="d-flex align-items-center">
                                        <RSSwicth
                                            control={control}
                                            onLabel={ON}
                                            offLabel={OFF}
                                            name="roi"
                                            defaultValue={false}
                                            id="rs_DeliveryMethod_ROI"
                                        />
                                        <RSPPophover
                                            position="top"
                                            className="rs-tooltip-text-multi"
                                            text={
                                                <>
                                                    <ul>
                                                        <li>{ROI_APPLICABLE}</li>
                                                        <li>{CALCULATED_ROI}</li>
                                                    </ul>
                                                </>
                                            }
                                        >
                                            <i
                                                className={`${circle_question_mark_mini} icon-xs blue cp color-primary-blue ml10`}
                                                id="circle_question_mark"
                                            ></i>
                                        </RSPPophover>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    )}
                    {type === 'event' && (
                        <div
                            className={`form-group mt20  ${!nameState.isValid ? 'pe-none' : ''} ${!isEditable ? 'click-off' : ''
                                }`}
                        >
                            <Row>
                                <Col sm={4} className="text-right">
                                    <label className="control-label-left">{DYNAMIC_LIST}</label>
                                </Col>
                                <Col sm={7}>
                                    <RSKendoDropDown
                                        control={control}
                                        name="dynamicList"
                                        data={dynamicListData}
                                        label={SELECT_THE_LIST}
                                        dataItemKey={'dynamicListId'}
                                        textField={'dynamicListName'}
                                        isLoading={dynamicListLoader.isLoading}
                                        required
                                        rules={{
                                            required: SELECT_DYNAMIC_LIST,
                                            validate: (value) => {
                                                if (value?.dynamicListId === 0) {
                                                    return SELECT_DYNAMIC_LIST;
                                                } else return true;
                                            },
                                        }}
                                        handleChange={(e) => {
                                            handleDynamicList(e.value, [], true);
                                        }}
                                        handleFilterChange={(event) => {
                                            let payload = {
                                                clientId,
                                                userId,
                                                departmentId,
                                                filterText: event?.filter?.value ?? '',
                                                campaignId: 0,
                                            };
                                            debouncedHandleDynamicListFilterChange(dispatch, payload);
                                        }}
                                        popupClass={'timezone'}
                                    />
                                    <RSCheckbox
                                        control={control}
                                        name="isFrequency"
                                        labelName={ALLOW_AUDIENCE}
                                    />
                                </Col>
                                <Col sm={1} className="fg-icons-wrapper pl0 click-off d-none">
                                    <div className="fg-icons">
                                        <div className="d-flex">
                                            <RSTooltip position="top" text={ADD}>
                                                <i
                                                    id="rs_data_circle_plus_fill_edge"
                                                    className={`${circle_plus_fill_edge_medium} icon-md color-primary-blue cp`}
                                                ></i>
                                            </RSTooltip>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    )}
                    {/* Sixth Row */}
                    <div
                        className={`form-group ${type === 'multi' ? '1' : '2'}  ${!nameState.isValid ? 'pe-none' : ''}`}
                    >
                        <Row>
                            <Col
                                sm={4}
                                className={`text-right ${!isEditable ? 'click-off' : ''}  ${statusId === 9 ? 'click-off' : ''
                                    }`}
                            >
                                <label className="control-label-left">{COMMUNICATION_PERIOD}</label>
                            </Col>
                            <Col sm={7}>
                                <Row>
                                    <Col md={6} className={`${!isEditable ? 'click-off' : ''}`}>
                                        <RSDatePicker
                                            placeholder={START_DATE}
                                            id="rs_DeliveryMethod_startdate"
                                            control={control}
                                            name="startdate"
                                            required
                                            // min={isEditable ? new Date(editModeStartDateRef.current) : new Date()}
                                            min={getTimezoneAdjustedMinDate('start')}
                                            max={getTimezoneAdjustedMaxDate('start')}
                                            focusedDate={getTimezoneAdjustedFocusedDate('start')}
                                            defaultValue={getTimezoneAdjustedFocusedDate('start')}
                                            customTodayDate={getTimezoneAdjustedFocusedDate('start')}
                                            format={formDateFormat}
                                            rules={{
                                                required: SELECT_START_DATE,
                                                validate: (value) =>
                                                    validateStartDateAgainstCampaignBlast(value, campaignBlastDetails, statusId),
                                            }}
                                            handleOnBlur={(e) => {
                                                const startdate = getValues('startdate');

                                                if (isDateBeforeToday(startdate)) {
                                                    trigger('startdate');
                                                }
                                            }}
                                            handleChange={() => {
                                                const endDate = getValues('enddate');
                                                if (endDate) setValue('enddate', null);;
                                            }}
                                            disabled={!isEditable}
                                            isShowPlaceholder={true}
                                        />
                                    </Col>
                                    <Col
                                        md={6}
                                        className={`${handleEndDateClickOff() ? 'click-off' : ''}`}
                                        onClick={() => {
                                            const startDate = getValues('startdate');
                                            if (!startDate) trigger('startdate');
                                        }}
                                    >
                                        <div style={{ pointerEvents: _isNil(startDate) ? 'none' : 'all' }}>
                                            <RSDatePicker
                                                placeholder={END_DATE}
                                                id="rs_DeliveryMethod_enddate"
                                                control={control}
                                                name="enddate"
                                                format={formDateFormat}
                                                required
                                                min={getTimezoneAdjustedMinDate('end')}
                                                max={getTimezoneAdjustedMaxDate('end')}
                                                // focusedDate={getTimezoneAdjustedFocusedDate('end')}
                                                // customTodayDate={getTimezoneAdjustedFocusedDate('end')}
                                                rules={{
                                                    required: SELECT_END_DATE,
                                                    validate: (value) =>
                                                        validateEndDateAgainstCampaignBlast(value, campaignBlastDetails, statusId),
                                                }}
                                                disabled={handleEndDateClickOff()}
                                                isShowPlaceholder={true}
                                            />
                                        </div>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </div>
                    {/* Seventh Row */}
                    {(type === 'single' || type === 'event') && (
                        <div
                            className={`form-group mt50  ${!nameState.isValid ? 'pe-none' : ''} ${
                                !isEditable && statusId !== 5 ? 'pe-none click-off' : ''
                            }`}
                        >
                            <Row>
                                <Col sm={4} className="text-right">
                                    <label className="control-label-left position-relative">
                                        {CHANNEL_TYPE}
                                    </label>
                                </Col>
                                <Col sm={7}>
                                    <ul className="rs-list-inline switchwith-icon">
                                        {fields.map((field, index) => {
                                            let disableEventTriggerChannel = ['socialpost', 'ads', 'qr'];
                                            let isDisabledEventTriggerChannel =
                                                disableEventTriggerChannel.includes(field?.name) && type === 'event';
                                            const isSelectedInProgressChannel = statusId === 5 && field?.selected;
                                            return (
                                                <li
                                                    key={field.id}
                                                    className={`${
                                                        isSelectedInProgressChannel ? 'pe-none click-off' : ''
                                                    }`}
                                                >
                                                    {field.disabled || isDisabledEventTriggerChannel ? (
                                                        <RSTooltip text={SAME_CHANNEL}>
                                                            <RSCheckbox
                                                                control={control}
                                                                name={`channelTypes[${index}].selected`}
                                                                labelName={field?.labelName}
                                                                disabled={
                                                                    field.disabled ||
                                                                    isDisabledEventTriggerChannel ||
                                                                    isSelectedInProgressChannel
                                                                }
                                                                rules={
                                                                    {
                                                                        // validate: () =>
                                                                        //     channelTypeValidator({
                                                                        //         name: 'channelTypes',
                                                                        //         getValues,
                                                                        //         index,
                                                                        //         error: SELECT_CHANNEL_TYPE,
                                                                        //     }),
                                                                    }
                                                                }
                                                                handleChange={(e) => {
                                                                    setTimeout(() => {
                                                                        const primaryGt =
                                                                            getValues('primaryGoalType');
                                                                        const secondaryGt =
                                                                            getValues('secondaryGoalType');
                                                                        const offlineActive =
                                                                            isOfflineConversionGoalSelection(
                                                                                primaryGt,
                                                                            ) ||
                                                                            isOfflineConversionGoalSelection(
                                                                                secondaryGt,
                                                                            );
                                                                        if (
                                                                            e?.target?.checked &&
                                                                            offlineActive &&
                                                                            CHANNEL_NAMES_UNSUPPORTED_FOR_OFFLINE_CONVERSION.includes(
                                                                                field?.name,
                                                                            )
                                                                        ) {
                                                                            setValue(
                                                                                `channelTypes[${index}].selected`,
                                                                                false,
                                                                            );
                                                                            setOfflineConversionChannelWarningPopup({
                                                                                show: true,
                                                                                incompatibleChannelLabels: [],
                                                                            });
                                                                            return;
                                                                        }
                                                                        const isChecked = e?.target?.checked;
                                                                        const selectedChannels = channelTypes?.filter(
                                                                            (channel) => channel?.selected,
                                                                        );
                                                                        const hasSelectedChannels =
                                                                            selectedChannels?.length > 0;
                                                                        const hasNotifications = selectedChannels?.some(
                                                                            (channel) =>
                                                                                channel?.name === 'notifications',
                                                                        );
                                                                        const selectedAnalytics =
                                                                            analyticsTypes?.filter(
                                                                                (type) => type?.selected,
                                                                            )?.length > 0;

                                                                        if (!isChecked) {
                                                                            if (!hasSelectedChannels) {
                                                                                setError('channelTypes[0].selected', {
                                                                                    type: 'custom',
                                                                                    message: SELECT_CHANNEL_TYPE,
                                                                                });
                                                                            } else if (!hasNotifications) {
                                                                                clearErrors('analyticsTypes');
                                                                            }
                                                                        } else {
                                                                            if (!hasNotifications) {
                                                                                clearErrors('analyticsTypes');
                                                                            } else {
                                                                                if (!selectedAnalytics) {
                                                                                    setError(
                                                                                        `analyticsTypes[0].selected`,
                                                                                        {
                                                                                            type: 'custom',
                                                                                            message:
                                                                                                SELECT_WEB_TO_Analytics,
                                                                                        },
                                                                                    );
                                                                                }
                                                                            }
                                                                            clearErrors('channelTypes');
                                                                            clearErrors('channelTypes[0].selected');
                                                                        }
                                                                        if (
                                                                            !hasOfflineConversionChannelConflict(
                                                                                getValues('primaryGoalType'),
                                                                                getValues('secondaryGoalType'),
                                                                                getMergedChannelTypesForOfflineValidation(),
                                                                            )
                                                                        ) {
                                                                            setOfflineConversionChannelWarningPopup({
                                                                                show: false,
                                                                                incompatibleChannelLabels: [],
                                                                            });
                                                                        }
                                                                    }, 10);
                                                                }}
                                                            />
                                                        </RSTooltip>
                                                    ) : (
                                                        <RSCheckbox
                                                            control={control}
                                                            name={`channelTypes[${index}].selected`}
                                                            labelName={field?.labelName}
                                                            disabled={
                                                                field.disabled || isSelectedInProgressChannel
                                                            }
                                                            rules={
                                                                {
                                                                    // validate: () =>
                                                                    //     channelTypeValidator({
                                                                    //         name: 'channelTypes',
                                                                    //         getValues,
                                                                    //         index,
                                                                    //         error: SELECT_CHANNEL_TYPE,
                                                                    //     }),
                                                                }
                                                            }
                                                            handleChange={(e) => {
                                                                setTimeout(() => {
                                                                    const primaryGt = getValues('primaryGoalType');
                                                                    const secondaryGt = getValues('secondaryGoalType');
                                                                    const offlineActive =
                                                                        isOfflineConversionGoalSelection(primaryGt) ||
                                                                        isOfflineConversionGoalSelection(secondaryGt);
                                                                    if (
                                                                        e?.target?.checked &&
                                                                        offlineActive &&
                                                                        CHANNEL_NAMES_UNSUPPORTED_FOR_OFFLINE_CONVERSION.includes(
                                                                            field?.name,
                                                                        )
                                                                    ) {
                                                                        setValue(
                                                                            `channelTypes[${index}].selected`,
                                                                            false,
                                                                        );
                                                                        setOfflineConversionChannelWarningPopup({
                                                                            show: true,
                                                                            incompatibleChannelLabels: [
                                                                                field.labelName,
                                                                            ],
                                                                        });
                                                                        return;
                                                                    }
                                                                    const isChecked = e?.target?.checked;
                                                                    const selectedChannels = channelTypes?.filter(
                                                                        (channel) => channel?.selected,
                                                                    );
                                                                    const hasSelectedChannels =
                                                                        selectedChannels?.length > 0;
                                                                    const hasNotifications = selectedChannels?.some(
                                                                        (channel) => channel?.name === 'notifications',
                                                                    );
                                                                    const selectedAnalytics =
                                                                        analyticsTypes?.filter((type) => type?.selected)
                                                                            ?.length > 0;

                                                                    if (!isChecked) {
                                                                        if (!hasSelectedChannels) {
                                                                            setError('channelTypes[0].selected', {
                                                                                type: 'custom',
                                                                                message: SELECT_CHANNEL_TYPE,
                                                                            });
                                                                        } else if (!hasNotifications) {
                                                                            clearErrors('analyticsTypes');
                                                                        }
                                                                    } else {
                                                                        if (!hasNotifications) {
                                                                            clearErrors('analyticsTypes');
                                                                        } else {
                                                                            if (!selectedAnalytics) {
                                                                                setError(`analyticsTypes[0].selected`, {
                                                                                    type: 'custom',
                                                                                    message:
                                                                                        SELECT_WEB_TO_Analytics,
                                                                                });
                                                                            }
                                                                        }
                                                                        clearErrors('channelTypes');
                                                                        clearErrors('channelTypes[0].selected');
                                                                    }
                                                                    if (
                                                                        !hasOfflineConversionChannelConflict(
                                                                            getValues('primaryGoalType'),
                                                                            getValues('secondaryGoalType'),
                                                                            getMergedChannelTypesForOfflineValidation(),
                                                                        )
                                                                    ) {
                                                                        setOfflineConversionChannelWarningPopup({
                                                                            show: false,
                                                                            incompatibleChannelLabels: [],
                                                                        });
                                                                    }
                                                                }, 10);
                                                            }}
                                                        />
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </Col>
                            </Row>
                        </div>
                    )}
                    {/* Eighth Row */}
                    {(type === 'single' || type === 'event') && (
                        <div
                            className={`form-group ${type === 'single' ? '1' : '2'}  ${!nameState.isValid ? 'pe-none' : ''
                                } ${!isEditable && statusId !== 5 ? 'click-off' : ''}`}
                        >
                            <Row>
                                <Col sm={4} className="text-right">
                                    <label className="control-label-left position-relative">
                                        {ANALYTICS_TYPE}
                                    </label>
                                </Col>
                                <Col sm={7}>
                                    <ul className="rs-list-inline switchwith-icon">
                                        {analyticsField.map((field, index) => {
                                            const isSelectedInProgressAnalytics = statusId === 5 && field?.selected;
                                            return (
                                                <li
                                                    key={field.id}
                                                    className={`${
                                                        field.disabled || isSelectedInProgressAnalytics
                                                            ? 'disb click-off pe-none'
                                                            : ''
                                                    } `}
                                                >
                                                    <RSCheckbox
                                                        control={control}
                                                        name={`analyticsTypes[${index}].selected`}
                                                        labelName={field.labelName}
                                                        defaultValue={field.selected}
                                                        disabled={field.disabled || isSelectedInProgressAnalytics}
                                                        rules={{
                                                            validate: () =>
                                                                analyticsTypeValidator({
                                                                    name: 'analyticsTypes',
                                                                    getValues,
                                                                    index,
                                                                    primaryGoal,
                                                                    secondaryGoal,
                                                                    error: SELECT_WEB_TO_Analytics,
                                                                }),
                                                        }}
                                                        handleChange={() => clearErrors('analyticsTypes')}
                                                    />
                                                </li>
                                            );
                                        })}
                                        <li className="lh0">
                                            {/* <RSPPophover
                                                position="top"
                                                text={TOOLTIP_TEXT_ANALYTICS_TYPES}
                                            >
                                                asfas
                                            </RSPPophover> */}

                                            <RSPPophover
                                                position="top"
                                                text={TOOLTIP_TEXT_ANALYTICS_TYPES}
                                            >
                                                <i
                                                    className={`${circle_question_mark_mini} icon-xs blue cp color-primary-blue`}
                                                    id="circle_question_mark"
                                                ></i>
                                            </RSPPophover>

                                            {/* <RSTooltip text={TOOLTIP_TEXT_ANALYTICS_TYPES}>
                                                <i
                                                    className={`${circle_question_mark_medium} icon-md blue cp color-primary-blue position-relative top5`}
                                                ></i>
                                            </RSTooltip> */}
                                        </li>
                                    </ul>
                                </Col>
                            </Row>
                        </div>
                    )}
                    {type === 'event' && (
                        <div
                            className={`form-group ${!nameState.isValid ? 'pe-none' : ''} ${!isEditable ? 'click-off' : ''
                                }`}
                        >
                            <Row>
                                <Col sm={4} className="text-right">
                                    <label className="control-label-left">{FREQUENCY_SECTION_LABEL}</label>
                                </Col>
                                <Col>
                                    <RSTabbar
                                        dynamicTab={`rs-content-tabs-2 rct-ra`}
                                        activeClass={`active`}
                                        tabData={frequencyTabConfig}
                                        defaultTab={state.currentFrequencyTab}
                                        callBack={(tab, index) => {
                                            if (index !== state.currentFrequencyTab) {
                                                setValue('frequencyTab', true, { shouldTouch: true });
                                            }
                                            clearErrors(['shortly', 'weekly', 'monthly', 'daily']);
                                            setFrequencyId(tab.id);
                                            dispatchState({
                                                type: 'UPDATE_EDIT_FLOW',
                                                payload: {
                                                    currentFrequencyTab: index,
                                                    frequencyType: tab.id,
                                                },
                                            });
                                            if (mode !== 'edit') {
                                                reset((formState) => ({
                                                    ...formState,
                                                    ...RESET_FREQUENCY,
                                                }));
                                            } else {
                                                if (Object.keys(touchedFields)?.length) {
                                                    handleTabChange(tab.id);
                                                }
                                            }
                                        }}
                                    />
                                </Col>
                            </Row>
                        </div>
                    )}{' '}
                    {/* Nineth Row */}
                    {type === 'event' && (
                        <div
                            className={`form-group   ${!nameState.isValid ? 'pe-none' : ''} ${!isEditable ? 'click-off' : ''
                                }`}
                        >
                            <Row>
                                <Col sm={4} className="text-right">
                                    <label className="control-label-left">{TIME_ZONE}</label>
                                </Col>
                                <Col sm={7}>
                                    {state.isTimeZoneEdit ? (
                                        <Fragment>
                                            <RSKendoDropDown
                                                control={control}
                                                name="timezone"
                                                label={TIME_ZONE}
                                                data={timeZoneList}
                                                textField="timeZoneName"
                                                dataItemKey={'timeZoneID'}
                                                popupClass={'timezone'}
                                                required
                                                rules={{
                                                    required: SELECT_TIMEZONE,
                                                }}
                                                handleChange={(e) => {
                                                    const val = e.value;
                                                    const dlight = timeZoneId === val?.timeZoneID ? isDayLight : false;
                                                    setValue(daylightSavingsName, dlight);
                                                }}
                                            />
                                            <RSCheckbox
                                                control={control}
                                                name={daylightSavingsName}
                                                labelName={DAYLIGHT_SAVINGS}
                                                disabledchk={!timeZone?.isDayLight}
                                            />
                                        </Fragment>
                                    ) : (
                                        <div className="position-relative top3 d-flex">
                                            <span>{updateTimeZone}</span>
                                            <RSTooltip text={EDIT_TIME_ZONE}>
                                                <i
                                                    id="rs_data_pencil_edit"
                                                    className={`${pencil_edit_mini} color-primary-blue cp ml5`}
                                                    onClick={() =>
                                                        dispatchState({
                                                            type: 'UPDATE',
                                                            payload: true,
                                                            field: 'isTimeZoneEdit',
                                                        })
                                                    }
                                                ></i>
                                            </RSTooltip>
                                        </div>
                                    )}
                                </Col>
                            </Row>
                        </div>
                    )}
                </div>
                {/* Buttons Row */}
                <div className="buttons-holder d-flex justify-content-end">
                    <RSSecondaryButton
                        onClick={() => {
                            dispatch(resetCommunicationPlan());
                            dispatch(resetCreateCommunication());
                            const url = '/communication';
                            const index = 0;
                            const state1 = { index };
                            const encryptState = encodeUrl(state1);
                            navigate(`${url}?q=${encryptState}`, {
                                state: { index },
                            });
                        }}
                        id="rs_DeliveryMethod_Cancel"
                    >
                        {CANCEL}
                    </RSSecondaryButton>
                    <RSSecondaryButton
                        disabledClass={`color-primary-blue ${
                            isPlanFormActionDisabled ? 'pe-none click-off' : ''
                            }`}
                            className={'color-primary-blue'}
                        onClick={() => handlePlanButtonClick('save')}
                        id="rs_DeliveryMethod_Save"
                        isLoading={submittingButtonType === 'save'}
                        blockBodyPointerEvents
                    >
                        {SAVE}
                    </RSSecondaryButton>
                    <RSPrimaryButton
                        onClick={() => handlePlanButtonClick('form')}
                        disabledClass={`${
                            isPlanFormActionDisabled ? 'pe-none click-off' : ''
                            } ${submittingButtonType === 'form' ? 'pe-none click-off' : ''}`}
                        id="rs_DeliveryMethod_Next"
                        isLoading={submittingButtonType === 'form'}
                        blockBodyPointerEvents
                       
                    >
                        {NEXT}
                    </RSPrimaryButton>
                </div>
            </form>
            )}
            {/* Modals */}
            {state?.isTagEnabledModal && (
                <TagsModal
                    show={state.isTagEnabledModal}
                    tags={state.tags}
                    viewOnly={isTagsModalViewOnly}
                    handleClose={() => dispatchState({ type: 'UPDATE', payload: false, field: 'isTagEnabledModal' })}
                    onSubmit={(tags) => {
                        dispatchState({ type: 'UPDATE', payload: tags, field: 'tags' });
                        dispatchState({ type: 'UPDATE', payload: false, field: 'isTagEnabledModal' });
                    }}
                    reducerState={state}
                />
            )}
            {state?.isCommunicationReferenceModal && (
                <CommuncationReferenceModal
                    show={state?.isCommunicationReferenceModal}
                    reducerState={state}
                    formState={state?.communicationReferenceData}
                    handleClose={(data) => {
                        dispatchState({
                            type: 'UPDATE_COMMUNICATION_REFERENCE',
                            payload: {
                                communicationReferenceData: data,
                                isCommunicationReferenceModal: false,
                                isSaved: state?.isReferenceSaved ?? data?.isSaved ?? false,
                            },
                        });
                    }}
                    onSubmit={(data) => {
                        dispatchState({
                            type: 'UPDATE_COMMUNICATION_REFERENCE',
                            payload: {
                                communicationReferenceData: data,
                                isCommunicationReferenceModal: false,
                                isCommunicationReference: true,
                                isSaved: data?.isSaved ?? false,
                            },
                        });
                    }}
                />
            )}
            <RSConfirmationModal
                show={state.secondaryGoalConfirmation}
                handleClose={() =>
                    dispatchState({ type: 'UPDATE', payload: false, field: 'secondaryGoalConfirmation' })
                }
                handleConfirm={() => {
                    reset((formState) => ({
                        ...formState,
                        secondaryGoal: '',
                        secondaryGoalPercentage: '',
                        secondaryGoalType: '',
                    }));
                    dispatchState({
                        type: 'UPDATE',
                        payload: false,
                        field: 'secondaryGoal',
                    });
                    dispatchState({ type: 'UPDATE', payload: false, field: 'secondaryGoalConfirmation' });
                }}
            />
            <RSModal
                show={state.isOpenGoalModal}
                handleClose={() => dispatchState({ type: 'UPDATE', payload: false, field: 'isOpenGoalModal' })}
                header={GOAL_INFO_TITLE}
                size="md"
                body={<p className="text-center">{GOAL_INFO_DESCRIPTION}</p>}
                footer={
                    <>
                        <RSPrimaryButton
                            onClick={() => {
                                dispatchState({ type: 'UPDATE', payload: false, field: 'isOpenGoalModal' });
                                dispatchState({ type: 'UPDATE', payload: true, field: 'secondaryGoal' });
                            }}
                        >
                            {OK}
                        </RSPrimaryButton>
                    </>
                }
            />
            {requiredceCommReferenceModal?.show && (
                <RSModal
                    show={requiredceCommReferenceModal?.show}
                    handleClose={() => {
                        setRequiredceCommReferenceModal(() => ({
                            show: false,
                            message: '',
                        }));
                    }}
                    header={WARNING}
                    size="md"
                    body={
                        <p className="d-flex flex-column justify-content-center align-items-center">
                            <i className={`${alert_medium}  color-primary-red fs75 cursor-normal`} />

                            <span className="mt3">{referenceRequired}</span>
                        </p>
                    }
                    footer={false}
                />
            )}
            {isShowMiniDuartionWarning?.show && (
                <WarningPopup
                    show={isShowMiniDuartionWarning?.show}
                    handleClose={(status) => {
                        if (!status) {
                            setIsShowMiniDuartionWarning({
                                show: false,
                                proceedCallback: () => { },
                            });
                        } else {
                            isShowMiniDuartionWarning?.proceedCallback();
                        }
                    }}
                    header={WARNING}
                    size="md"
                    text={DURATION_WARNING_IN_COMM_PLAN}
                    showCancel={true}
                    footer={false}
                />
            )}
            {offlineConversionChannelWarningPopup?.show && (
                <WarningPopup
                    key={offlineConversionChannelWarningPopup.incompatibleChannelLabels?.join('|') || 'offline-ch'}
                    show={offlineConversionChannelWarningPopup.show}
                    handleClose={() => {
                        setOfflineConversionChannelWarningPopup({
                            show: false,
                            incompatibleChannelLabels: [],
                        });
                    }}
                    customHeader={WARNING}
                    text={renderOfflineConversionChannelWarningText(
                        offlineConversionChannelWarningPopup.incompatibleChannelLabels,
                    )}
                    showCancel={false}
                    isPrimaryText={OK}
                />
            )}
            {inprogressReminder && !isInitialLoading && (
                <>
                    <div className="rs-homepage-alert-wrapper">
                        <RSAlert
                            show={inprogressReminder}
                            header={false}
                            body={
                                <Container>
                                    <div className="d-flex align-items-center justify-content-center">
                                        <h3>{INPROGRESS_REMINDER}</h3>
                                        <RSPrimaryButton
                                            onClick={() => {
                                                setInprogressReminder(false);
                                            }}
                                        >
                                            {OK}
                                        </RSPrimaryButton>
                                    </div>
                                </Container>
                            }
                        />
                    </div>
                </>
            )}
            {getWarningPopupMessage(failureApiErrors, dispatch, handleErrClose)}
        </FormProvider>
    );
};

export default DeliveryMethod;