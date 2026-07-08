import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { formatName } from 'Utils/modules/formatters';
import { onlyNumbers, onlyNumbersDecimalWithoutSpecialCharacters, onlyNumbersDecimalWithoutSpecialCharactersUpto3Digits } from 'Utils/modules/inputValidators';
import { handleCustomNavigationDetails } from 'Utils/modules/navigation';
import { AUDIENCE_BASE_TYPES, MULTIPLE_DROPDOWN_PLUSMINUS, comparisonTypeConfig, TRIGGER_ATTRIBUTE_VALUE_DROPDOWN_PROPS } from './constant';
import { ALPHA_CHARACTERS_DYNAMIC, DYNAMICLIST_WEBURL_REGEX } from 'Constants/GlobalConstant/Regex';
import { ENTER_ATTRIBUTE, ENTER_ATTRIBUTE_VALUE, ENTER_GREATER_VALUE, ENTER_LESSER_VALUE, ENTER_PAGE_NAME, ENTER_TIME, ENTER_VALUE, SELECT_ATTRIBUTE, SELECT_ATTRIBUTE_Name, SELECT_DATE, SELECT_FORM_NAME, SELECT_FORM_STATUS, SELECT_PROPER_VALUES, SELECT_Type, SELECT_VALUE } from 'Constants/GlobalConstant/ValidationMessage';
import { circle_plus_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import { useDispatch, useSelector, useStore } from 'react-redux';

import RSInput from 'Components/FormFields/RSInput';
import RSKendoDropDown from 'Components/FormFields/RSKendoDropdown';
import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
import RSTimePicker from 'Components/FormFields/RSTimePicker';
import { useNavigate } from 'react-router-dom';
import { get as _get } from 'Utils/modules/lodashReplacements';
import { MatchTypeCheck, repeatedGroupValuesCheck, repeatedValuesCheck, buildFieldTriggerValuesKey, buildCustomEventValuesCacheKey, normalizeCustomEventRuleTypeOptions, normalizeTriggerAttributeDropdownOptions, resolveTriggerDropdownPrimitiveValue, shouldSkipTriggerAttributeValuesApi, shouldFetchTriggerAttributeValuesForRule } from '../../constant';
import {
    getCachedTriggerAttributeValues,
    getCustomEventsAttributesData,
    getCustomEventsValueData,
    getTriggerAttributeValuesData,
    resolveTriggerAttributeValues,
} from 'Reducers/audience/dynamicList/request';
import { getSessionId } from 'Reducers/globalState/selector';
import { DynamicListCreateContext } from '../..';

import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';
import RSTooltip from 'Components/RSTooltip';
import DynamicListGeoFencing from '../GeoFencing/DynamicListGeoFencing';
import DynamicListBeacon from '../Beacon/DynamicListBeacon';
import { get_dynamic_list } from 'Reducers/audience/dynamicList/reducer';
import useApiLoader from 'Hooks/useApiLoader';

import { FIELD_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';
import NewAttributeBtn from 'Pages/AuthenticationModule/Audience/Pages/AddImportAudience/Components/CustomHeaderColumn/NewAttributeBtn';
import useQueryParams from 'Hooks/useQueryParams';
import { channelMap, communicationStatus } from 'Pages/AuthenticationModule/Components/SegmentationLists/constant';

const channelOptions = Object.values(channelMap).filter((item) => item?.type !== 'QRCode');
const RenderField = ({
    attribute,
    className,
    isClickOff = false,
    index,
    fieldName,
    name,
    isCustom,
    customState,
    customEventColumnName = '',
    setCustomState,
    TriggerName,
    pages,
    setDuplicateRule,
    formId,
    controllEditModeApiCall,
    typeRemove,
    typeUpdate,
    title,
    setErrorGroup,
    setErrorCustomGroup,
    currentRuleIndex,
    getTriggerAttributeValuesForRuleType,
    clearAttributeCustom,
}) => {
    const navigate = useNavigate();
    const {
        control,
        setValue,
        watch,
        trigger,
        reset,
        resetField,
        setError,
        getValues,
        unregister,
        clearErrors,
        formState: { isValid, errors },
    } = useFormContext();
    const dispatch = useDispatch();
    const store = useStore();
    const locationState = useQueryParams();
    const [localTriggerValues, setTriggerValues] = useState([]);
    const skipAttributeNameEffectRef = useRef(false);
    const skipAttributeNameEffectExpectedKeyRef = useRef('');
    const attributeEffectKeyRef = useRef('');
    const {
        ListState,
        dispatchState,
        setErrorGroup: contextSetErrorGroup,
        setErrorCustomGroup: contextSetErrorCustomGroup,
    } = useContext(DynamicListCreateContext);
    const updateErrorGroup = setErrorGroup ?? contextSetErrorGroup;
    const updateErrorCustomGroup = setErrorCustomGroup ?? contextSetErrorCustomGroup;
    const attributeFieldType = attribute?.attributeName?.fieldType ?? attribute?.attributeName?.fieldtype;
    const isTwoDimensionalField = attributeFieldType === '2D';
    const level1FieldTriggerState =
        ListState?.fieldTriggerValues?.[buildFieldTriggerValuesKey(name, '2D', 1)];
    const level2FieldTriggerState =
        ListState?.fieldTriggerValues?.[buildFieldTriggerValuesKey(name, '2D', 2)];
    const fieldTriggerState = isTwoDimensionalField
        ? level1FieldTriggerState
        : ListState?.fieldTriggerValues?.[name];
    const triggerValues = useMemo(() => {
        const mergeTriggerValueSources = (...sources) => {
            let merged =
                localTriggerValues && typeof localTriggerValues === 'object' && !Array.isArray(localTriggerValues)
                    ? { ...localTriggerValues }
                    : Array.isArray(localTriggerValues)
                        ? localTriggerValues
                        : {};

            sources.forEach((source) => {
                if (source === undefined) {
                    return;
                }
                if (Array.isArray(source)) {
                    merged = source;
                    return;
                }
                if (typeof source === 'object') {
                    merged =
                        merged && typeof merged === 'object' && !Array.isArray(merged)
                            ? { ...merged, ...source }
                            : { ...source };
                }
            });

            return merged;
        };

        if (isTwoDimensionalField) {
            return mergeTriggerValueSources(
                level1FieldTriggerState?.triggerValues,
                level2FieldTriggerState?.triggerValues,
            );
        }

        const fromListState = fieldTriggerState?.triggerValues;
        if (fromListState === undefined) {
            return localTriggerValues;
        }
        if (Array.isArray(fromListState)) {
            return fromListState;
        }
        if (typeof fromListState === 'object' && Object.keys(fromListState).length === 0) {
            return localTriggerValues;
        }

        return mergeTriggerValueSources(fromListState);
    }, [
        fieldTriggerState?.triggerValues,
        isTwoDimensionalField,
        level1FieldTriggerState?.triggerValues,
        level2FieldTriggerState?.triggerValues,
        localTriggerValues,
    ]);
    const { formAttributeId = {}, formAttrDropdownChange, dataAttributeId = {} } = ListState || {};
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    // Select only the editList slice so the reference stays stable across unrelated dynamic-list dispatches
    const editList = useSelector(({ dynamicListReducer }) => dynamicListReducer?.editList);
    const attributeNameOptionsAPI = useApiLoader({
        autoFetch: false,
        mode: 'create',
        loaderConfig: fieldLoaderConfig,
    });
    const attributeValueOptionsAPI = useApiLoader({
        autoFetch: false,
        mode: 'create',
        loaderConfig: fieldLoaderConfig,
    });
    const isAttributeNameOptionsLoading = attributeNameOptionsAPI.isLoading;
    const isAttributeValuesLoading = attributeValueOptionsAPI.isLoading;
    const isLevel1FieldLoading = level1FieldTriggerState?.isLoading ?? false;
    const isLevel2FieldLoading = level2FieldTriggerState?.isLoading ?? false;
    const isTriggerValuesLoading =
        (fieldTriggerState?.isLoading ?? false) || isAttributeNameOptionsLoading || isAttributeValuesLoading;
    const isTwoDimensionalLevel1Loading = isLevel1FieldLoading || isAttributeNameOptionsLoading;
    const isTwoDimensionalLevel2Loading = isLevel2FieldLoading || isAttributeValuesLoading;

    const getTriggerAttributeLoaderApi = useCallback(
        (payload) => {
            const isTwoDimensional = payload?.fieldType === '2D';
            if (isTwoDimensional && payload?.levelNo === 1) {
                return attributeNameOptionsAPI;
            }
            return attributeValueOptionsAPI;
        },
        [attributeNameOptionsAPI, attributeValueOptionsAPI],
    );

    const dispatchTriggerAttributeValues = (payload) => {
        const ruleMeta = { value: payload?.attributeName, fieldType: payload?.fieldType };
        if (
            shouldSkipTriggerAttributeValuesApi(payload?.triggerSourceId) ||
            !shouldFetchTriggerAttributeValuesForRule(ruleMeta, payload?.triggerSourceId)
        ) {
            return Promise.resolve({ status: true, data: [] });
        }

        const cached = getCachedTriggerAttributeValues(store.getState(), payload);
        if (cached !== undefined) {
            return resolveTriggerAttributeValues({
                dispatch,
                getState: store.getState,
                payload,
                setTriggerValues,
                loading: false,
            });
        }

        const loaderApi = getTriggerAttributeLoaderApi(payload);
        return loaderApi.refetch({
            fetcher: ({ payload: requestPayload }) =>
                dispatch(
                    getTriggerAttributeValuesData({
                        payload: requestPayload,
                        setTriggerValues,
                        loading: false,
                    }),
                ),
            mode: 'create',
            loaderConfig: fieldLoaderConfig,
            params: { payload },
        });
    };

    const dispatchCustomEventsAttributes = (payload) =>
        attributeNameOptionsAPI.refetch({
            fetcher: ({ payload: requestPayload }) =>
                dispatch(
                    getCustomEventsAttributesData({
                        payload: requestPayload,
                        setTriggerValues,
                        loading: false,
                    }),
                ),
            mode: 'create',
            loaderConfig: fieldLoaderConfig,
            params: { payload },
        });
    const [value, attributeCustom, ruleAttributes] = watch([
        `${name}.attributeName.Value`,
        `${name}.attributeCustom`,
        `${fieldName}.RuleAttributes`,
    ]);
    // console.log('watch',watch());
    const [allRule, rule] = watch([`rule`, `rule.${currentRuleIndex}`]);
    const [timerFrom, timerTo] = watch([`${name}.TimerFrom`, `${name}.TimerTo`]);
    const attributeComp = attribute?.attributeComparison || '';
    const attributeFrom = attribute?.attributeTo || '';
    const attributeTo = attribute?.attributeValue || '';
    const attributeChannelValue = watch(`${name}.attributeChannelValues`);
    const channelStatusOptions = useMemo(() => {
        const channelType = attributeChannelValue?.type;
        if (!channelType) {
            return [];
        }
        return communicationStatus[channelType] || [];
    }, [attributeChannelValue?.type]);
    const channelDropdownOptions = ListState?.communicationChannelOptions ?? channelOptions;
    const isBet = attributeComp === 'Between';
    const attributeName = attribute?.attributeName?.value || '';
    const inputDropDownClassName = `${className || ''} ${isClickOff ? 'click-off pe-none' : ''}`.trim();

    const customEventValuesFromCache = useMemo(() => {
        if (!isCustom || !customEventColumnName || !attributeName) {
            return null;
        }

        return ListState?.triggerDdlValues?.[
            buildCustomEventValuesCacheKey(customEventColumnName, attributeName)
        ];
    }, [attributeName, customEventColumnName, isCustom, ListState?.triggerDdlValues]);

    const level1DropdownData = useMemo(() => {
        const rawValues = isTwoDimensionalField
            ? triggerValues?.[attributeName]
            : isCustom && (!Array.isArray(triggerValues) || triggerValues.length === 0) && customEventValuesFromCache
                ? customEventValuesFromCache
                : triggerValues;

        return normalizeTriggerAttributeDropdownOptions(
            Array.isArray(rawValues) ? rawValues : [],
        );
    }, [attributeName, customEventValuesFromCache, isCustom, isTwoDimensionalField, triggerValues]);

    const level1MultiSelectData = useMemo(
        () =>
            level1DropdownData
                .map((item) => resolveTriggerDropdownPrimitiveValue(item))
                .filter((item) => item !== ''),
        [level1DropdownData],
    );

    const level2DropdownData = useMemo(
        () => normalizeTriggerAttributeDropdownOptions(triggerValues?.[`${attributeName}2`]),
        [attributeName, triggerValues],
    );

    const shouldShowLevel2AsDropdown = useMemo(() => {
        if (!isTwoDimensionalField) {
            return false;
        }

        if (isTwoDimensionalLevel2Loading || level2DropdownData?.length) {
            return true;
        }

        if (!attribute?.attributeComparison) {
            return false;
        }

        const normalizedType = formatName(attributeName);
        if (normalizedType === 'forms' || normalizedType === 'eventbrite') {
            return true;
        }

        if (normalizedType === 'attributes') {
            const columnType = formatName(attribute?.attributeComparison?.columntype);
            return ['combobox', 'checkbox', 'radio'].includes(columnType);
        }

        return false;
    }, [
        isTwoDimensionalField,
        isTwoDimensionalLevel2Loading,
        level2DropdownData,
        attributeName,
        attribute?.attributeComparison,
    ]);

    const isRecencyFrequency = !!attribute?.attributeName?.isRecencyFrequency;

    const recencyDateRangeLabel = useMemo(() => {
        if (!isRecencyFrequency || !timerFrom || !timerTo || timerFrom > timerTo) return '';

        const startLabel = getUserCurrentFormat(timerFrom)?.dateFormat;
        const endLabel = getUserCurrentFormat(timerTo)?.dateFormat;

        if (!startLabel || !endLabel) return '';

        return `(${startLabel} - ${endLabel})`;
    }, [isRecencyFrequency, timerFrom, timerTo]);

    const renderRecencyDateRangeRow = (offsetSm = 5) =>
        recencyDateRangeLabel ? (
            <Row className="recency-date-range-row">
                <Col sm={offsetSm} />
                <Col sm={12 - offsetSm} className="recency-date-range-label pl18">
                    <span>{recencyDateRangeLabel}</span>
                </Col>
            </Row>
        ) : null;

    const getCustomEventsValue = async (item) => {
        const columnName = resolveTriggerDropdownPrimitiveValue(item);
        const payload = {
            triggerddlValue: pages?.id,
            attributeName: 'Custom events',
            triggerSourceId: TriggerName?.triggerId,
            fieldType: '',
            departmentId,
            clientId,
            userId,
            levelNo: 1,
            formId: '',
            columnName,
            attributevalue: '',
        };
        const res = await attributeValueOptionsAPI.refetch({
            fetcher: ({ payload: requestPayload }) =>
                dispatch(getCustomEventsValueData({ payload: requestPayload, loading: false })),
            mode: 'create',
            loaderConfig: fieldLoaderConfig,
            params: { payload },
        });
        if (res?.status) {
            setCustomState({ field: columnName, data: normalizeCustomEventRuleTypeOptions(res?.data) });
        } else {
            setCustomState({ field: columnName, data: [] });
        }
    };

    const buildAttributeEffectKey = (overrides = {}) => {
        const comparisonKey =
            overrides.comparisonId ??
            attribute?.attributeComparison?.id ??
            attribute?.attributeComparison?.formId ??
            attribute?.attributeComparison?.formID ??
            attribute?.attributeComparison?.FormId ??
            attribute?.attributeComparison?.recipientFormId ??
            attribute?.attributeComparison?.RecipientFormID ??
            attribute?.attributeComparison?.value ??
            '';
        const resolvedFormId = overrides.formId ?? formAttributeId?.[TriggerName?.triggerId] ?? formId ?? '';
        return [TriggerName?.triggerId, attribute?.attributeName?.value ?? '', comparisonKey, resolvedFormId].join('|');
    };

    const clearTwoDimensionalTriggerValues = useCallback(
        (attributeLabel, { includeLevel1 = false, additionalPaths = [] } = {}) => {
            const keys = new Set(additionalPaths);

            if (includeLevel1) {
                keys.add(buildFieldTriggerValuesKey(name, '2D', 1));
            }
            keys.add(buildFieldTriggerValuesKey(name, '2D', 2));

            dispatchState({
                type: 'CLEAR_FIELD_TRIGGER_VALUES_KEYS',
                payload: { keys: [...keys] },
            });

            if (attributeLabel) {
                setTriggerValues((prev) => {
                    if (!prev || typeof prev !== 'object' || Array.isArray(prev)) {
                        return { [`${attributeLabel}2`]: [] };
                    }
                    return { ...prev, [`${attributeLabel}2`]: [] };
                });
            }
        },
        [dispatchState, name],
    );

    // const handleCallApiForm = () => {
    //     if (TriggerName?.triggerId === 13 || TriggerName?.triggerId === 27) {
    //         const isForm = TriggerName?.triggerId === 13;
    //         const isEventBrite = TriggerName?.triggerId === 27;
    //         if (isForm) {
    //             if (ruleAttributes?.length === 1 && formatName(attribute?.attributeName?.value) === 'forms') {
    //                 return true;
    //             } else if (ruleAttributes?.length > 1 && formatName(attribute?.attributeName?.value) !== 'forms') {
    //                 return true;
    //             } else {
    //                 return false;
    //             }
    //         } else if (isEventBrite) {
    //             if (ruleAttributes?.length === 1 && formatName(attribute?.attributeName?.value) === 'eventbrite') {
    //                 return true;
    //             } else if (ruleAttributes?.length > 1 && formatName(attribute?.attributeName?.value) !== 'eventbrite') {
    //                 return true;
    //             } else {
    //                 return false;
    //             }
    //         }
    //     } else {
    //         return true;
    //     }
    // };

    // console.log('Fosdfasdfsdfsdfrm id :::: ', formAttributeId);
    const tempFormAttr = { ...formAttributeId };
    // const getTriggerAttributeValues = (id, type, value, isEditAttribute = false, attributeId) => {
    //     if (attribute?.attributeName?.value !== '' && attribute !== undefined) {
    //         if (isCustom) {
    //             const payload = {
    //                 triggerddlValue: pages?.id,
    //                 attributeName: 'Custom events',
    //                 triggerSourceId: TriggerName?.triggerId,
    //                 fieldType: attribute?.attributeName?.fieldtype,
    //                 departmentId,
    //                 clientId,
    //                 userId,
    //                 levelNo: '',
    //                 formId: tempFormAttr[TriggerName?.triggerId] || '',
    //                 columnName: customState?.field,
    //                 attributevalue: attribute?.attributeName?.value,
    //             };
    //             dispatchCustomEventsAttributes(payload);
    //         } else {
    //             if (type === 'Forms') {
    //                 const payload = {
    //                     triggerddlValue: pages?.id || '',
    //                     attributeName:
    //                         TriggerName?.triggerId === 14
    //                             ? // ? attribute?.attributeName?.value + '_s'
    //                               attribute?.attributeName?.fieldName
    //                             : attribute?.attributeName?.value,
    //                     triggerSourceId: TriggerName?.triggerId,
    //                     fieldType: attribute?.attributeName?.fieldType,
    //                     departmentId,
    //                     clientId,
    //                     userId,
    //                     levelNo: id ? 2 : 1,
    //                     formId: id
    //                         ? id
    //                         : Object.keys(formAttributeId)?.length
    //                         ? !!formAttributeId[TriggerName?.triggerId]
    //                             ? formAttributeId[TriggerName?.triggerId]
    //                             : formId || ''
    //                         : '',
    //                     columnName: '',
    //                 };
    //                 dispatchTriggerAttributeValues(payload);
    //             } else if (type === 'Attributes') {
    //                 const payload = {
    //                     triggerddlValue: pages?.id || '',
    //                     attributeName:
    //                         TriggerName?.triggerId === 14
    //                             ? // ? attribute?.attributeName?.value + '_s'
    //                               attribute?.attributeName?.fieldName
    //                             : attribute?.attributeName?.value,
    //                     triggerSourceId: TriggerName?.triggerId,
    //                     fieldType: attribute?.attributeName?.fieldType,
    //                     departmentId,
    //                     clientId,
    //                     userId,
    //                     levelNo: isEditAttribute ? 1 : 2,
    //                     formId: id
    //                         ? id
    //                         : Object.keys(formAttributeId)?.length
    //                         ? !!formAttributeId[TriggerName?.triggerId]
    //                             ? formAttributeId[TriggerName?.triggerId]
    //                             : formId || ''
    //                         : '',
    //                     columnName: value,
    //                     dataAttributeId: attributeId
    //                         ? attributeId
    //                         : Object.keys(dataAttributeId)?.length
    //                         ? !!dataAttributeId[TriggerName?.triggerId]
    //                         : 0,
    //                 };
    //                 dispatchTriggerAttributeValues(payload);
    //             } else if (formatName(type) === 'eventbrite') {
    //                 const payload = {
    //                     triggerddlValue: pages?.id || '',
    //                     attributeName:
    //                         TriggerName?.triggerId === 14
    //                             ? // ? attribute?.attributeName?.value + '_s'
    //                               attribute?.attributeName?.fieldName
    //                             : attribute?.attributeName?.value,
    //                     triggerSourceId: TriggerName?.triggerId,
    //                     fieldType: attribute?.attributeName?.fieldType,
    //                     departmentId,
    //                     clientId,
    //                     userId,
    //                     levelNo: isEditAttribute ? 1 : 2,
    //                     formId: id
    //                         ? id
    //                         : Object.keys(formAttributeId)?.length
    //                         ? !!formAttributeId[TriggerName?.triggerId]
    //                             ? formAttributeId[TriggerName?.triggerId]
    //                             : formId || ''
    //                         : '',
    //                     columnName: value,
    //                 };
    //                 dispatchTriggerAttributeValues(payload);
    //             } else {
    //                 const payload = {
    //                     triggerddlValue: TriggerName.triggerId === 15 ? pages.value : pages?.id || '',
    //                     attributeName:
    //                         TriggerName?.triggerId === 14
    //                             ? // ? attribute?.attributeName?.value + '_s'
    //                               attribute?.attributeName?.fieldName
    //                             : attribute?.attributeName?.value,
    //                     triggerSourceId: TriggerName?.triggerId,
    //                     fieldType: attribute?.attributeName?.fieldType,
    //                     departmentId,
    //                     clientId,
    //                     userId,
    //                     levelNo: id ? 2 : 1,
    //                     formId: id
    //                         ? id
    //                         : Object.keys(formAttributeId)?.length
    //                         ? !!formAttributeId[TriggerName?.triggerId]
    //                             ? formAttributeId[TriggerName?.triggerId]
    //                             : formId || ''
    //                         : '',
    //                     columnName: TriggerName?.triggerId === 13 && id ? attribute.attributeComparison.value : '',
    //                 };
    //                 if (TriggerName?.triggerId === 14) {
    //                     let attributeValues = filterLabels?.[attribute?.attributeName?.fieldName];
    //                     let finalData = getFilterValues(attributeValues);
    //                     if (finalData?.length) {
    //                         setTriggerValues(finalData);
    //                         return;
    //                     }
    //                 }
    //                 dispatchTriggerAttributeValues(payload);
    //             }
    //         }
    //     }
    // };

    // const fetchTriggerValuesFromHandler = (...args) => {
    //     const formIdArg = args[0];
    //     const expectedKey = buildAttributeEffectKey({
    //         comparisonId: formIdArg ?? undefined,
    //         formId: formIdArg ?? undefined,
    //     });
    //     skipAttributeNameEffectExpectedKeyRef.current = expectedKey;
    //     skipAttributeNameEffectRef.current = true;
    //     attributeEffectKeyRef.current = expectedKey;
    //     getTriggerAttributeValues(...args);
    // };

    // const handleFirstLevelDDAttributeValue = () => {
    //     switch (formatName(attribute?.attributeName?.value)) {
    //         case 'forms':
    //             return getTriggerAttributeValues();
    //         case 'beacon':
    //         case 'city/area':
    //         case 'latitude&longitude-radius':
    //             return getTriggerAttributeValues();
    //         default:
    //             getTriggerAttributeValues(
    //                 formId,
    //                 attribute?.attributeName?.value,
    //                 attribute?.attributeComparison?.value,
    //                 true,
    //             );
    //     }
    // };
    // const handleSecondLevelDDAttributeValue = () => {
    //     getTriggerAttributeValues(formId, attribute?.attributeName?.value, attribute?.attributeComparison?.value);
    // };

    // const handleLevelWiseAttributeValue = () => {
    //     debugger
    //     const availableTriggerValues = getValues('triggerValues');
    //     const attribueValue = formatName(attribute?.attributeName?.value);
    //     setTriggerValues((pre) => ({
    //         ...pre,
    //         ...availableTriggerValues,
    //     }));
    //     if (!availableTriggerValues?.[attribute?.attributeName?.value]?.length) {
    //         if (TriggerName?.triggerId === 18 || TriggerName?.triggerId === 5) {
    //             if (attribueValue !== 'locationurl' && attribueValue !== 'geofence') {
    //                 handleFirstLevelDDAttributeValue();
    //             }
    //         } else {
    //             handleFirstLevelDDAttributeValue();
    //         }
    //     }
    //     if (!availableTriggerValues?.[`${attribute?.attributeName?.value + 2}`]?.length) {
    //         if (TriggerName?.triggerId === 18 || TriggerName?.triggerId === 5) {
    //             if (
    //                 attribueValue !== 'locationurl' &&
    //                 attribueValue !== 'latitude&longitude-radius' &&
    //                 attribueValue !== 'geofence'
    //             ) {
    //                 handleSecondLevelDDAttributeValue();
    //             }
    //         } else {
    //             handleSecondLevelDDAttributeValue();
    //         }
    //     }
    // };

    // useEffect(() => {
    //     if (attribute?.attributeName) {
    //         debugger
    //         // Reset cluster list when Geofence is selected
    //         const isGeofence =
    //             formatName(attribute?.attributeName?.value) === 'geofence' &&
    //             attribute?.attributeName?.fieldType === '2D';
    //         // Run the geofence reset once per selection transition, not on every comparison change
    //         const geofenceResetKey = isGeofence ? `${name}|${currentRuleIndex}|${index}` : '';
    //         const shouldRunGeofenceReset = isGeofence && geofenceResetKeyRef.current !== geofenceResetKey;
    //         if (!isGeofence) {
    //             geofenceResetKeyRef.current = '';
    //         }
    //         if (shouldRunGeofenceReset) {
    //             geofenceResetKeyRef.current = geofenceResetKey;
    //             if (controllEditModeApiCall) {
    //             } else {
    //                 // Reset attributeComparison field to clear cluster selection
    //                 resetField(`${name}.attributeComparison`);
    //                 // Reset attributeValue field as well
    //                 resetField(`${name}.attributeValue`);

    //                 // Reset geofence-related values in editList from dynamicListReducer
    //                 if (
    //                     editList?.dynamiclist &&
    //                     Array.isArray(editList.dynamiclist) &&
    //                     editList.dynamiclist.length > 0
    //                 ) {
    //                     const updatedEditList = { ...editList };
    //                     const ruleGroupKey = `RuleGroup${(currentRuleIndex ?? 0) + 1}`;
    //                     let hasGeofenceFieldsRemoved = false;

    //                     updatedEditList.dynamiclist = editList.dynamiclist.map((item) => {
    //                         if (item?.ruleJSON) {
    //                             try {
    //                                 const parsed = JSON.parse(item.ruleJSON);
    //                                 const ruleGroup = parsed[ruleGroupKey];

    //                                 if (
    //                                     ruleGroup &&
    //                                     ruleGroup.RuleAttributes &&
    //                                     Array.isArray(ruleGroup.RuleAttributes)
    //                                 ) {
    //                                     // Reset geofence-related fields in the current attribute (index is the attribute index)
    //                                     const updatedRuleAttributes = ruleGroup.RuleAttributes.map(
    //                                         (attr, attrIndex) => {
    //                                             if (attrIndex === index) {
    //                                                 // Remove geofence-specific fields: GeofenceId, AttributeValue, AttributeName
    //                                                 const { GeofenceId, AttributeValue, AttributeName, ...rest } = attr;
    //                                                 if (
    //                                                     GeofenceId !== undefined ||
    //                                                     AttributeValue !== undefined ||
    //                                                     AttributeName !== undefined
    //                                                 ) {
    //                                                     hasGeofenceFieldsRemoved = true;
    //                                                 }
    //                                                 return rest;
    //                                             }
    //                                             return attr;
    //                                         },
    //                                     );

    //                                     const updatedRuleGroup = {
    //                                         ...ruleGroup,
    //                                         RuleAttributes: updatedRuleAttributes,
    //                                     };

    //                                     const updatedParsed = {
    //                                         ...parsed,
    //                                         [ruleGroupKey]: updatedRuleGroup,
    //                                     };

    //                                     return {
    //                                         ...item,
    //                                         ruleJSON: JSON.stringify(updatedParsed),
    //                                     };
    //                                 }
    //                             } catch (error) {}
    //                         }
    //                         return item;
    //                     });

    //                     // Update the reducer only when something actually changed, to avoid emitting a new
    //                     // identical editList reference that would re-trigger dependent effects.
    //                     if (hasGeofenceFieldsRemoved) {
    //                         dispatch(get_dynamic_list({ field: 'editList', data: updatedEditList }));
    //                     }
    //                 }
    //             }
    //         }

    //         const effectKey = buildAttributeEffectKey();

    //         if (skipAttributeNameEffectRef.current) {
    //             attributeEffectKeyRef.current = effectKey;
    //             if (
    //                 skipAttributeNameEffectExpectedKeyRef.current &&
    //                 effectKey === skipAttributeNameEffectExpectedKeyRef.current
    //             ) {
    //                 skipAttributeNameEffectRef.current = false;
    //                 skipAttributeNameEffectExpectedKeyRef.current = '';
    //             }
    //             return;
    //         }

    //         if (attributeEffectKeyRef.current === effectKey) {
    //             return;
    //         }

    //         attributeEffectKeyRef.current = effectKey;

    //         const selectedFormId =
    //             attribute?.attributeComparison?.id ??
    //             attribute?.attributeComparison?.formId ??
    //             attribute?.attributeComparison?.formID ??
    //             attribute?.attributeComparison?.FormId ??
    //             attribute?.attributeComparison?.recipientFormId ??
    //             attribute?.attributeComparison?.RecipientFormID ??
    //             '';

    //         if (controllEditModeApiCall || selectedFormId) {
    //             if (attribute?.attributeName?.fieldType === '2D') {
    //                 handleLevelWiseAttributeValue();
    //                 dispatchState({
    //                     type: 'UPDATE_FORM',
    //                     payload: selectedFormId || formId,
    //                     field: TriggerName?.triggerId,
    //                 });
    //             } else if (
    //                 attribute?.attributeName?.fieldType !== 'T' ||
    //                 attribute?.attributeName?.fieldType !== 'AN'
    //             ) {
    //                 if (TriggerName?.triggerId !== 18 && TriggerName?.triggerId !== 5) {
    //                     getTriggerAttributeValues();
    //                 }
    //             }
    //         } else if (formAttrDropdownChange) {
    //             const resolvedFormId = Object.keys(formAttributeId)?.length
    //                 ? formAttributeId[TriggerName?.triggerId] || formId || ''
    //                 : formId || '';
    //             getTriggerAttributeValues(
    //                 resolvedFormId,
    //                 attribute?.attributeName?.value,
    //                 attribute?.attributeComparison?.value,
    //             );
    //             dispatchState({ type: 'UPDATE_FORM_DROP_DOWN', payload: false });
    //         } else {
    //             if (
    //                 attribute?.attributeName?.fieldType === 'D' ||
    //                 attribute?.attributeName?.fieldType === 'SD' ||
    //                 attribute?.attributeName?.fieldType === '2D' ||
    //                 (TriggerName?.triggerId === 14 && attribute?.attributeName?.fieldType === 'T') || // Audience base
    //                 (TriggerName?.triggerId === 15 && attribute?.attributeName?.fieldType === 'T') // Rudimentary
    //             ) {
    //                 if (TriggerName?.triggerId !== 14) {
    //                     const isForms = formatName(attribute?.attributeName?.value) === 'forms';
    //                     const isGeofence = formatName(attribute?.attributeName?.value) === 'geofence';
    //                     const isLevel1Loaded = !!triggerValues?.[attribute?.attributeName?.value]?.length;
    //                     if (!(isForms && isLevel1Loaded) && !isGeofence) {
    //                         handleCallApiForm() && getTriggerAttributeValues();
    //                     }
    //                 } else {
    //                     handleAudienceBaseApi(attribute);
    //                 }
    //             }
    //         }
    //     }
    // }, [
    //     attribute?.attributeName?.value,
    //     attribute?.attributeComparison?.id ??
    //         attribute?.attributeComparison?.formId ??
    //         attribute?.attributeComparison?.recipientFormId,
    //     attribute?.attributeComparison?.value,
    //     formAttributeId?.[TriggerName?.triggerId],
    // ]);

    useEffect(() => {
        if (attribute?.attributeName?.fieldType === 'AN') {
            if (!attribute?.attributeComparison) {
                setValue(`${name}.attributeComparison`, 'add');
            }
        }
    }, [attribute?.attributeName?.fieldType, attribute?.attributeName?.value]);

    const addCustomAttributeCheck = async (customEventIndex, title) => {
        // const duplicateStatus = repeatedGroupValuesCheck(
        //     allRule,
        // );
        // if (duplicateStatus[0]?.duplicateCount > 0) {
        //     return setDuplicateRule({
        //         show: true,
        //         index: allRule[allRule?.length - 1]['RuleAttributes']?.length - 1,
        //     });
        // }
        const currentAttributeRule = watch(`${fieldName}.RuleAttributes[${customEventIndex}]`);
        // console.log('currentAttributeRule: ', currentAttributeRule);
        let isCustom = true;
        let ruleCheck = repeatedValuesCheck(
            ruleAttributes,
            `${fieldName}.RuleAttributes[${customEventIndex}]`,
            TriggerName?.triggerId,
        );
        let check = repeatedValuesCheck(
            attributeCustom,
            `${fieldName}.RuleAttributes[${customEventIndex}].attributeCustom`,
            TriggerName?.triggerId,
            isCustom,
        );
        await trigger(`${fieldName}.RuleAttributes[${customEventIndex}]`);
        const isExistCustomError =
            errors[fieldName?.split('.')[0]]?.[index]?.RuleAttributes?.[`${customEventIndex}`]?.attributeCustom ?? [];
        const isCustomEventDuplicate = check[4]?.isCustomEventDuplicate ?? false;
        if (ruleCheck[0] && !isExistCustomError?.length) {
            if (check[0] && !isExistCustomError?.length) {
                typeUpdate(customEventIndex, {
                    ...currentAttributeRule,
                    attributeCustom: [
                        ...currentAttributeRule.attributeCustom,
                        {
                            attributeName: '',
                            attributeValue: '',
                            attributeType: '',
                            attributeMultipleValues: [],
                            attributeComparison: '',
                        },
                    ],
                });
                setDuplicateRule({
                    show: false,
                    index: 0,
                    isCustomDuplicateError: isCustomEventDuplicate,
                });
                updateErrorGroup?.(title);
            } else {
                if (check?.length === 1) {
                    trigger(`${fieldName}.RuleAttributes[${customEventIndex}]`);
                } else {
                    // setValue(check[1], check[2]);
                    // trigger(check[1]);
                    trigger(`${fieldName}.RuleAttributes[${customEventIndex}]`);
                    setDuplicateRule({
                        show: true,
                        index: check[3],
                        isCustomDuplicateError: isCustomEventDuplicate,
                    });
                    updateErrorCustomGroup?.(currentAttributeRule?.attributeValue);
                }
            }
        } else {
            setDuplicateRule({
                show: true,
                index: ruleCheck[3],
                isCustomDuplicateError: isCustomEventDuplicate,
            });
            updateErrorGroup?.(title);
        }
    };

    const handleDuplicateCheck = () => {
        const getAllRule = getValues('rule');
        const ruleAttributesPath = `rule[${currentRuleIndex}].RuleAttributes`;
        const duplicateStatus = repeatedGroupValuesCheck(
            getAllRule,
            ruleAttributesPath,
            TriggerName?.triggerId,
        );
        updateErrorGroup?.(title);
        if (duplicateStatus?.duplicateIndex >= 0) {
            setDuplicateRule({
                show: true,
                index: duplicateStatus?.duplicateIndex,
            });
        } else {
            setDuplicateRule({
                show: false,
                index: null,
            });
        }

        const ruleAttributes = getValues(`rule.${currentRuleIndex}.RuleAttributes`);
        let check = repeatedValuesCheck(
            ruleAttributes,
            ruleAttributesPath,
            TriggerName?.triggerId,
            false,
            true,
        );
        let matchTypeCheck = MatchTypeCheck(
            ruleAttributes,
            rule?.MatchType,
            rule?.MatchCount,
        );
        if (duplicateStatus?.duplicateIndex < 0) {
            if (matchTypeCheck && !check[0]) {
                setDuplicateRule({
                    show: true,
                    index: check[3],
                });
                updateErrorGroup?.(title);
            }
        }
    };

    const getDefaultItem = () => {
        try {
            const comparisonValue =
                typeof attribute?.attributeComparison === 'object' && attribute?.attributeComparison?.value
                    ? attribute?.attributeComparison?.value
                    : attribute?.attributeComparison;
            if (comparisonValue) {
                return MULTIPLE_DROPDOWN_PLUSMINUS?.find(
                    (value) => value?.name?.toLowerCase() === comparisonValue?.toLowerCase(),
                );
            } else {
                return;
            }
        } catch (error) {
            return;
        }
    };

    const checkValidCondition = () => {
        if (TriggerName?.triggerId >= 9 && TriggerName?.triggerId <= 11) return false;
        else return true;
    };

    // Check if the operator is "Has value" or "Has no value" which don't require input values
    const isHasValueOperator = (operator) => {
        return operator === 'Has no value' || operator === 'Has value';
    };

    // Check if the operator should use input field instead of dropdown (Like, Does not like, Starts with, Ends with)
    const isInputFieldOperator = (operator) => {
        return (
            operator === 'Like' ||
            operator === 'Does not like' ||
            operator === 'Starts with' ||
            operator === 'Ends with'
        );
    };

    // Reusable function to handle operator change - clears values and errors for "Has value" operators
    const handleOperatorChange = (selectedOperator, options = {}) => {
        const {
            shouldUnregister = false,
            includeAttributeTo = true,
            includeAttributeMultipleValues = false,
            triggerValidation = false,
        } = options;

        if (isHasValueOperator(selectedOperator)) {
            if (includeAttributeTo) {
                unregister(`${name}.attributeTo`);
            }
            unregister(`${name}.attributeValue`);

            resetField(`${name}.attributeValue`);
            setValue(`${name}.attributeValue`, '');

            if (includeAttributeMultipleValues) {
                resetField(`${name}.attributeMultipleValues`);
                setValue(`${name}.attributeMultipleValues`, []);
            }

            if (includeAttributeTo) {
                resetField(`${name}.attributeTo`);
                setValue(`${name}.attributeTo`, '');
            }

            clearErrors(`${name}.attributeValue`);
            if (includeAttributeMultipleValues) {
                clearErrors(`${name}.attributeMultipleValues`);
            }
            if (includeAttributeTo) {
                clearErrors(`${name}.attributeTo`);
            }

            if (triggerValidation) {
                setTimeout(() => {
                    trigger(`${name}.attributeValue`);
                }, 100);
            }
        } else {
            // Clear errors for value fields when operator changes
            clearErrors(`${name}.attributeValue`);
            if (includeAttributeMultipleValues) {
                clearErrors(`${name}.attributeMultipleValues`);
            }
            if (includeAttributeTo) {
                clearErrors(`${name}.attributeTo`);
            }
        }

        setDuplicateRule({
            show: false,
            index: 0,
        });

        setTimeout(() => {
            handleDuplicateCheck();
        }, 100);
    };

    // Reusable function to render disabled input for "Has value" and "Has no value" operators
    const renderHasValueInput = (inputId, label = '', keySuffix = '') => {
        return (
            <RSInput
                key={`hasValue${keySuffix}-${attributeComp}-${name}`}
                control={control}
                name={`${name}.attributeValue`}
                id={inputId}
                label={label}
                placeholder={''}
                disabled
                required={false}
                rules={{}}
            />
        );
    };

    // Reusable function to render input field for "Like", "Does not like", "Starts with", "Ends with" operators
    const renderInputFieldOperator = (inputId, label = '', keySuffix = '', options = {}) => {
        const {
            required = true,
            customRules = null,
            customLabel = null,
            handleOnchange = null,
            handleOnBlur = null,
        } = options;

        const isRequired = required && checkValidCondition() && !isHasValueOperator(attributeComp);
        const finalLabel = customLabel !== null ? customLabel : label;
        const finalRules =
            customRules !== null ? customRules : isRequired ? { required: SELECT_PROPER_VALUES } : {};

        const defaultHandleOnchange = () => {
            setDuplicateRule({
                index: 0,
                show: false,
            });
            handleDuplicateCheck();
        };

        const defaultHandleOnBlur = () => {
            handleDuplicateCheck();
        };

        return (
            <RSInput
                key={`inputField${keySuffix}-${attributeComp}-${name}`}
                control={control}
                name={`${name}.attributeValue`}
                id={inputId}
                required={isRequired}
                label={finalLabel}
                placeholder={'All'}
                rules={finalRules}
                handleOnchange={handleOnchange !== null ? handleOnchange : defaultHandleOnchange}
                handleOnBlur={handleOnBlur !== null ? handleOnBlur : defaultHandleOnBlur}
            />
        );
    };

    const checkTriggerStatus = (value = [], triggerValues = []) => {
        const optionValues = normalizeTriggerAttributeDropdownOptions(
            Array.isArray(triggerValues) ? triggerValues : [],
        ).map((item) => resolveTriggerDropdownPrimitiveValue(item));
        let res = false;
        for (let i = 0; i < value?.length; i++) {
            const selectedValue = resolveTriggerDropdownPrimitiveValue(value[i]);
            if (optionValues.includes(selectedValue) || triggerValues?.includes?.(selectedValue)) {
                res = true;
            } else {
                res = false;
            }
        }
        return res;
    };

    const handleDropDownLabelName = (type, level) => {
        const labelNameFirstDropDown = {
            forms: 'Form name',
            attributes: 'Attribute name',
            eventbrite: 'Event name',
            location: 'Attribute name',
        };

        const labelNameSecondDropDown = {
            forms: 'Form status',
            attributes: 'Attribute value ',
            eventbrite: 'Event value',
            location: 'Attribute value',
        };

        if (level === 1) {
            return labelNameFirstDropDown[type] || 'Attribute name';
        } else {
            return labelNameSecondDropDown[type] || 'Attribute value';
        }
    };

    const handleDropDownRequiredMessage = (type, level) => {
        const requiredMessageFirstDropDown = {
            forms: SELECT_FORM_NAME,
            attributes: SELECT_ATTRIBUTE,
            eventbrite: 'Select event name',
            location: SELECT_ATTRIBUTE_Name,
        };

        const requiredMessageSecondDropDown = {
            forms: SELECT_FORM_STATUS,
            attributes: SELECT_ATTRIBUTE,
            eventbrite: 'Select event value',
            location: SELECT_ATTRIBUTE,
        };

        if (level === 1) {
            return requiredMessageFirstDropDown[type] || SELECT_ATTRIBUTE;
        }

        return requiredMessageSecondDropDown[type] || SELECT_ATTRIBUTE;
    };

    // const getFormStatusFormat = (data) => {
    //     const finalFormatData =
    //         !!data &&
    //         Object.keys(data[0])?.map((item, index) => {
    //             return {
    //                 id: index + 1,
    //                 formStatus: item,
    //             };
    //         });
    //     return finalFormatData;
    // };

    // console.log('Valid func ::: ', triggerValues);
    // console.log('Valid func ::: ', TriggerName, attribute);
    if (formatName(attributeName) === 'beacon') {
        return (
            <DynamicListBeacon
                attribute={attribute}
                className={inputDropDownClassName}
                index={index}
                name={name}
                setDuplicateRule={setDuplicateRule}
                handleDuplicateCheck={handleDuplicateCheck}
                checkValidCondition={checkValidCondition}
                currentRuleIndex={currentRuleIndex}
            />
        );
    }

    switch (attribute?.attributeName?.fieldType || attribute?.attributeName?.fieldtype) {
        case 'D':
        case TriggerName?.triggerId === 14 && 'T':
        case TriggerName?.triggerId === 15 && 'T':
            return attribute.attributeName.value === 'Custom events' ? (
                <Col
                    sm={8}
                    className={`${attribute?.attributeComparison === 'Contains' &&
                            attribute?.attributeName?.value === 'Custom events'
                            ? 'customEventColoum8'
                            : ''
                        }${className}`}
                >
                    <Row>
                        <Col sm={5}>
                            <RSKendoDropDown
                                control={control}
                                name={`${name}.attributeComparison`}
                                label="Type"
                                data={Object.values(comparisonTypeConfig?.string)}
                                //   className="Dynamiclist-ruletype"
                                // defaultValue="Contains"
                                required={checkValidCondition()}
                                rules={checkValidCondition() ? { required: SELECT_Type } : {}}
                                handleChange={(e) => {
                                    clearAttributeCustom?.();
                                    handleOperatorChange(e.value, {
                                        includeAttributeMultipleValues: true,
                                    });
                                }}
                                handleOnBlur={() => {
                                    handleDuplicateCheck();
                                }}
                            />
                        </Col>
                        <Col sm={7}>
                            {isHasValueOperator(attributeComp) ? (
                                renderHasValueInput('rs_RenderField_hasValueInput', '', '')
                            ) : attributeComp === 'Contains' ? (
                                triggerValues?.length !== 0 ? (
                                    <RSKendoDropDown
                                        control={control}
                                        name={`${name}.attributeValue`}
                                        required={checkValidCondition()}
                                        data={level1DropdownData}
                                        {...TRIGGER_ATTRIBUTE_VALUE_DROPDOWN_PROPS}
                                        isLoading={isTriggerValuesLoading}
                                        label={'Values'}
                                        rules={
                                            checkValidCondition()
                                                ? {
                                                    required: SELECT_PROPER_VALUES,
                                                }
                                                : {}
                                        }
                                        handleChange={(e) => {
                                            clearAttributeCustom?.();
                                            getCustomEventsValue(resolveTriggerDropdownPrimitiveValue(e.value));
                                            setDuplicateRule({
                                                index: 0,
                                                show: false,
                                            });
                                        }}
                                        handleOnBlur={() => {
                                            handleDuplicateCheck();
                                        }}
                                    />
                                ) : (
                                    <RSMultiSelect
                                        control={control}
                                        name={`${name}.attributeMultipleValues`}
                                        handleChange={(e) => {
                                            setDuplicateRule({
                                                index: 0,
                                                show: false,
                                            });
                                            const newValue = e?.target?.value;
                                            const count = Array.isArray(newValue) ? newValue.length : 0;
                                            const fieldPath = `${name}.attributeMultipleValues`;
                                            if (count > 25) {
                                                setTimeout(() => {
                                                    setError(fieldPath, {
                                                        type: 'custom',
                                                        message: 'Max. 25 attributes',
                                                    });
                                                }, 0);
                                            }
                                        }}
                                        required={checkValidCondition()}
                                        data={[]}
                                        allowCustom
                                        label={'Values'}
                                        rules={
                                            checkValidCondition()
                                                ? {
                                                    required: SELECT_PROPER_VALUES,
                                                    validate: (value) => {
                                                        const errorPath = `${name}.attributeMultipleValues`.replace(
                                                            /\[(\d+)\]/g,
                                                            '.$1',
                                                        );
                                                        const existingErrorMsg = _get(errors, errorPath)?.message;
                                                        if (existingErrorMsg && value?.length > 25)
                                                            return existingErrorMsg;
                                                        let pattern = ALPHA_CHARACTERS_DYNAMIC;
                                                        let selectedValue = value[value?.length - 1];
                                                        if (!pattern.test(selectedValue)) {
                                                            return 'No special characters';
                                                        } else if (selectedValue?.trim() === '') {
                                                            return 'Empty spaces not accepted';
                                                        } else if (value?.length > 25) {
                                                            return 'Max. 25 attributes';
                                                        } else if (value.some((item) => item.trim() === '')) {
                                                            return 'Values contains empty or whitespace-only';
                                                        } else return true;
                                                    },
                                                }
                                                : {}
                                        }
                                        handleOnBlur={() => {
                                            handleDuplicateCheck();
                                        }}
                                    />
                                )
                            ) : isInputFieldOperator(attributeComp) ? (
                                renderInputFieldOperator('rs_RenderField_inputFieldOperator', 'Values', '')
                            ) : (
                                <RSMultiSelect
                                    name={`${name}.attributeMultipleValues`}
                                    handleChange={(e) => {
                                        setDuplicateRule({
                                            index: 0,
                                            show: false,
                                        });
                                        const newValue = e?.target?.value;
                                        const count = Array.isArray(newValue) ? newValue.length : 0;
                                        const fieldPath = `${name}.attributeMultipleValues`;
                                        if (count > 25) {
                                            setTimeout(() => {
                                                setError(fieldPath, {
                                                    type: 'custom',
                                                    message: 'Max. 25 attributes',
                                                });
                                            }, 0);
                                        }
                                    }}
                                    control={control}
                                    data={level1MultiSelectData}
                                    isLoading={isTriggerValuesLoading}
                                    allowCustom
                                    label={'Values'}
                                    required={checkValidCondition() && !isHasValueOperator(attributeComp)}
                                    rules={
                                        checkValidCondition() && !isHasValueOperator(attributeComp)
                                            ? {
                                                required: SELECT_PROPER_VALUES,
                                                validate: (value) => {
                                                    const errorPath = `${name}.attributeMultipleValues`.replace(
                                                        /\[(\d+)\]/g,
                                                        '.$1',
                                                    );
                                                    const existingErrorMsg = _get(errors, errorPath)?.message;
                                                    if (existingErrorMsg && value?.length > 25)
                                                        return existingErrorMsg;
                                                    let pattern = ALPHA_CHARACTERS_DYNAMIC;
                                                    let selectedValue = value[value?.length - 1];
                                                    if (selectedValue?.trim() === '') {
                                                        return 'Empty spaces not accepted';
                                                    } else if (value?.length > 25) {
                                                        return 'Max. 25 attributes';
                                                    } else if (value.some((item) => item.trim() === '')) {
                                                        return 'Values contains empty or whitespace-only';
                                                    } else if (!pattern.test(selectedValue)) {
                                                        return 'No special characters';
                                                    } else return true;
                                                },
                                            }
                                            : {}
                                    }
                                    handleOnBlur={() => {
                                        handleDuplicateCheck();
                                    }}
                                />
                            )}
                            <div
                                className="addCustomEventRow"
                                style={{
                                    whiteSpace: 'nowrap',
                                    right: (attributeComp === 'Contains' && triggerValues?.length !== 0 && TriggerName?.triggerName === 'Website' && attribute?.attributeName?.value === 'Custom events') ? '-45px' : '-22px'
                                }}
                            >
                                {attributeComp === 'Contains' && triggerValues?.length !== 0 && (
                                    <RSTooltip text="Add">
                                        <i
                                            className={`${circle_plus_medium} icon-md color-primary-blue ${attributeCustom?.length > 7 ? 'click-off' : ''
                                                }`}
                                            onClick={() => {
                                                addCustomAttributeCheck(index, title);
                                            }}
                                        />
                                    </RSTooltip>
                                )}
                            </div>
                        </Col>
                    </Row>
                    {renderRecencyDateRangeRow()}
                </Col>
            ) : TriggerName?.triggerId === 10 ? (
                <Row className={inputDropDownClassName}>
                    <Col sm={5}>
                        <RSKendoDropDown
                            control={control}
                            name={`${name}.attributeComparison`}
                            handleChange={(e) => {
                                handleOperatorChange(e.value, {
                                    includeAttributeMultipleValues: true,
                                });
                                queueMicrotask(() => handleDuplicateCheck());
                            }}
                            label="Type"
                            data={Object.values(comparisonTypeConfig?.stringMain)}
                            //className="Dynamiclist-ruletype"
                            // defaultValue="Contains"
                            required={checkValidCondition()}
                            rules={
                                checkValidCondition()
                                    ? {
                                        required: SELECT_Type,
                                    }
                                    : {}
                            }
                            handleOnBlur={() => {
                                handleDuplicateCheck();
                            }}
                        />
                    </Col>
                    <Col sm={3}>
                        {
                            <RSKendoDropDown
                                control={control}
                                name={`${name}.attributeChannelValues`}
                                label="Channel"
                                textField="label"
                                dataItemKey="id"
                                data={channelDropdownOptions}
                                required={checkValidCondition()}
                                handleChange={() => {
                                    setValue(`${name}.attributeActionValues`, '');
                                    queueMicrotask(() => handleDuplicateCheck());
                                }}
                                rules={
                                    checkValidCondition()
                                        ? {
                                            required: SELECT_Type,
                                        }
                                        : {}
                                }
                                handleOnBlur={() => {
                                    handleDuplicateCheck();
                                }}
                            />
                        }
                    </Col>
                    <Col sm={4}>
                        {
                            <RSKendoDropDown
                                control={control}
                                name={`${name}.attributeActionValues`}
                                label="Status"
                                textField="label"
                                dataItemKey="id"
                                data={channelStatusOptions}
                                key={attributeChannelValue?.type || 'no-channel'}
                                required={checkValidCondition()}
                                handleChange={() => {
                                    queueMicrotask(() => handleDuplicateCheck());
                                }}
                                rules={
                                    checkValidCondition()
                                        ? {
                                            required: SELECT_Type,
                                        }
                                        : {}
                                }
                                handleOnBlur={() => {
                                    handleDuplicateCheck();
                                }}
                            />
                        }
                    </Col>
                </Row>
            ) : (
                <>
                    <Row className={inputDropDownClassName}>
                        <Col sm={5}>
                            <RSKendoDropDown
                                control={control}
                                name={`${name}.attributeComparison`}
                                handleChange={(e) => {
                                    handleOperatorChange(e.value, {
                                        includeAttributeMultipleValues: true,
                                    });
                                }}
                                label="Type"
                                data={Object.values(comparisonTypeConfig?.string)}
                                required={checkValidCondition()}
                                rules={
                                    checkValidCondition()
                                        ? {
                                            required: SELECT_Type,
                                        }
                                        : {}
                                }
                                handleOnBlur={() => {
                                    handleDuplicateCheck();
                                }}
                            />
                        </Col>
                        <Col sm={7}>
                            {isHasValueOperator(attributeComp) ? (
                                renderHasValueInput('rs_RenderField_hasValueInput2', '', '2')
                            ) : isInputFieldOperator(attributeComp) ? (
                                renderInputFieldOperator('rs_RenderField_inputFieldOperator2', '', '2')
                            ) : (
                                <RSMultiSelect
                                    control={control}
                                    name={`${name}.attributeMultipleValues`}
                                    handleChange={(e) => {
                                        setDuplicateRule({
                                            show: false,
                                            index: 0,
                                        });
                                        const newValue = e?.target?.value;
                                        const count = Array.isArray(newValue) ? newValue.length : 0;
                                        const fieldPath = `${name}.attributeMultipleValues`;
                                        if (count > 25) {
                                            setTimeout(() => {
                                                setError(fieldPath, {
                                                    type: 'custom',
                                                    message: 'Max. 25 attributes',
                                                });
                                            }, 0);
                                        }
                                    }}
                                    data={level1MultiSelectData}
                                    isLoading={isTriggerValuesLoading}
                                    allowCustom
                                    label={'Values'}
                                    required={checkValidCondition() && !isHasValueOperator(attributeComp)}
                                    rules={
                                        checkValidCondition() && !isHasValueOperator(attributeComp)
                                            ? {
                                                required: SELECT_PROPER_VALUES,
                                                validate: (value) => {
                                                    const errorPath = `${name}.attributeMultipleValues`.replace(
                                                        /\[(\d+)\]/g,
                                                        '.$1',
                                                    );
                                                    const existingErrorMsg = _get(errors, errorPath)?.message;
                                                    if (existingErrorMsg && value?.length > 25) {
                                                        return existingErrorMsg;
                                                    }
                                                    let pattern = ALPHA_CHARACTERS_DYNAMIC;
                                                    let selectedValue = value[value?.length - 1];
                                                    let checkStatus = checkTriggerStatus(value, triggerValues);
                                                    if (checkStatus) {
                                                        return true;
                                                    } else if (selectedValue?.trim() === '') {
                                                        return 'Empty spaces not accepted';
                                                    } else if (value?.length > 25) {
                                                        return 'Max. 25 attributes';
                                                    } else if (value.some((item) => item.trim() === '')) {
                                                        return 'Values contains empty or whitespace-only';
                                                    } else if (!pattern.test(selectedValue)) {
                                                        return 'No special characters';
                                                    } else return true;
                                                },
                                            }
                                            : {}
                                    }
                                    handleOnBlur={() => {
                                        handleDuplicateCheck();
                                    }}
                                />
                            )}
                        </Col>
                    </Row>
                    {renderRecencyDateRangeRow()}
                </>
            );
        case 'M':
            return (
                <Row className={inputDropDownClassName}>
                    <Col sm={6}>
                        <RSKendoDropDown
                            control={control}
                            name={`${name}.attributeComparison`}
                            handleChange={(e) => {
                                handleOperatorChange(e.value, {
                                    includeAttributeMultipleValues: true,
                                });
                            }}
                            label="Type"
                            data={Object.values(comparisonTypeConfig?.string)}
                            // defaultValue="Contains"
                            required={checkValidCondition()}
                            rules={
                                checkValidCondition()
                                    ? {
                                        required: SELECT_Type,
                                    }
                                    : {}
                            }
                            handleOnBlur={() => {
                                handleDuplicateCheck();
                            }}
                        />
                    </Col>
                    <Col sm={6}>
                        {isHasValueOperator(attributeComp) ? (
                            renderHasValueInput('rs_RenderField_hasValueInputM', '', 'M')
                        ) : isInputFieldOperator(attributeComp) ? (
                            renderInputFieldOperator('rs_RenderField_inputFieldOperatorM', 'Values', 'M')
                        ) : (
                            <RSMultiSelect
                                control={control}
                                name={`${name}.attributeMultipleValues`}
                                handleChange={() =>
                                    setDuplicateRule({
                                        index: 0,
                                        show: false,
                                    })
                                }
                                data={['Location', 'History']}
                                allowCustom
                                label={'Values'}
                                required={checkValidCondition()}
                                handleOnBlur={() => {
                                    handleDuplicateCheck();
                                }}
                            />
                        )}
                    </Col>
                </Row>
            );
        case 'SD':
            return (
                <Row className={inputDropDownClassName}>
                    <Col sm={6}>
                        <RSKendoDropDown
                            control={control}
                            name={`${name}.attributeComparison`}
                            handleChange={() => {
                                setDuplicateRule({
                                    show: false,
                                    index: 0,
                                });
                                // Trigger duplicate check after operator change
                                setTimeout(() => {
                                    handleDuplicateCheck();
                                }, 100);
                            }}
                            data={Object.values(comparisonTypeConfig?.string)}
                            required={checkValidCondition()}
                            label="Type"
                            // defaultValue={'Before'}
                            rules={
                                checkValidCondition()
                                    ? {
                                        required: SELECT_Type,
                                    }
                                    : {}
                            }
                            handleOnBlur={() => {
                                handleDuplicateCheck();
                            }}
                        />
                    </Col>
                    <Col sm={6}>
                        {isHasValueOperator(attributeComp) ? (
                            renderHasValueInput('rs_RenderField_hasValueInputSD', '', 'SD')
                        ) : (
                            <RSKendoDropDown
                                control={control}
                                name={`${name}.attributeValue`}
                                handleChange={() =>
                                    setDuplicateRule({
                                        index: 0,
                                        show: false,
                                    })
                                }
                                data={level1DropdownData}
                                {...TRIGGER_ATTRIBUTE_VALUE_DROPDOWN_PROPS}
                                isLoading={isTriggerValuesLoading}
                                required={checkValidCondition()}
                                label="Value"
                                // defaultValue={'Before'}
                                rules={
                                    checkValidCondition()
                                        ? {
                                            required: SELECT_PROPER_VALUES,
                                        }
                                        : {}
                                }
                                handleOnBlur={() => {
                                    handleDuplicateCheck();
                                }}
                            />
                        )}
                    </Col>
                </Row>
            );
        case 'T':
            return TriggerName?.triggerId === 18 && formatName(attributeName) === 'locationurl' ? (
                <>
                    <Row className={inputDropDownClassName}>
                        <Col className={`pl5`}>
                            <RSInput
                                name={`${name}.attributeValue`}
                                control={control}
                                label={'Enter value'}
                                id="rs_RenderField_locationUrl"
                                required={checkValidCondition()}
                                rules={
                                    checkValidCondition()
                                        ? {
                                            required: ENTER_VALUE,
                                        }
                                        : {}
                                }
                                handleOnBlur={(e) => {
                                    setDuplicateRule({
                                        index: 0,
                                        show: false,
                                    });
                                    handleDuplicateCheck();
                                }}
                            />
                        </Col>
                    </Row>
                </>
            ) : (
                <Col sm={attribute.attributeName.value === 'Custom events' ? 8 : 12}>
                    <Row className={inputDropDownClassName}>
                        <Col sm={5}>
                            <RSKendoDropDown
                                control={control}
                                name={`${name}.attributeComparison`}
                                handleChange={(e) => {
                                    // Clear value and errors for "Has value" and "Has no value" operators
                                    const selectedOperator = e.value;
                                    if (isHasValueOperator(selectedOperator)) {
                                        resetField(`${name}.attributeValue`);
                                        setValue(`${name}.attributeValue`, '');
                                        resetField(`${name}.attributeMultipleValues`);
                                        setValue(`${name}.attributeMultipleValues`, []);
                                    }
                                    // Clear errors for value fields when operator changes
                                    clearErrors(`${name}.attributeValue`);
                                    clearErrors(`${name}.attributeMultipleValues`);
                                    setDuplicateRule({
                                        show: false,
                                        index: 0,
                                    });
                                    // Trigger duplicate check after operator change
                                    setTimeout(() => {
                                        handleDuplicateCheck();
                                    }, 100);
                                }}
                                label="Type"
                                data={Object.values(comparisonTypeConfig?.string)}
                                // defaultValue="Contains"
                                required={checkValidCondition()}
                                rules={
                                    checkValidCondition()
                                        ? {
                                            required: SELECT_Type,
                                        }
                                        : {}
                                }
                                handleOnBlur={() => {
                                    handleDuplicateCheck();
                                }}
                            />
                        </Col>
                        <Col sm={7}>
                            {isHasValueOperator(attributeComp) ? (
                                renderHasValueInput(
                                    'rs_RenderField_hasValueInputT',
                                    `${attributeName === 'Last session last visited page' ? 'Page name' : ''}`,
                                    'T',
                                )
                            ) : isInputFieldOperator(attributeComp) ? (
                                renderInputFieldOperator(
                                    'rs_RenderField_vlueattribute',
                                    `${attributeName === 'Last session last visited page' ? 'Page name' : 'Value'}`,
                                    'T',
                                    {
                                        customRules:
                                            checkValidCondition() && !isHasValueOperator(attributeComp)
                                                ? {
                                                    required:
                                                        attributeName === 'Last session last visited page'
                                                            ? ENTER_PAGE_NAME
                                                            : ENTER_ATTRIBUTE,
                                                    pattern: {
                                                        value: attributeName.includes('visits')
                                                            ? DYNAMICLIST_WEBURL_REGEX
                                                            : '',
                                                        message: attributeName.includes('visits')
                                                            ? 'Enter a proper url'
                                                            : '',
                                                    },
                                                }
                                                : {},
                                        handleOnBlur: () => {
                                            setDuplicateRule({
                                                index: 0,
                                                show: false,
                                            });
                                            handleDuplicateCheck();
                                        },
                                    },
                                )
                            ) : (
                                <RSInput
                                    control={control}
                                    name={`${name}.attributeValue`}
                                    id="rs_RenderField_vlueattribute"
                                    handleOnBlur={() => {
                                        setDuplicateRule({
                                            index: 0,
                                            show: false,
                                        });
                                        handleDuplicateCheck();
                                    }}
                                    label={`${attributeName === 'Last session last visited page' ? 'Page name' : 'Value'
                                        }`}
                                    placeholder={''}
                                    required={checkValidCondition() && !isHasValueOperator(attributeComp)}
                                    rules={
                                        checkValidCondition() && !isHasValueOperator(attributeComp)
                                            ? {
                                                required:
                                                    attributeName === 'Last session last visited page'
                                                        ? ENTER_PAGE_NAME
                                                        : ENTER_ATTRIBUTE,
                                                pattern: {
                                                    value: attributeName.includes('visits')
                                                        ? DYNAMICLIST_WEBURL_REGEX
                                                        : '',
                                                    message: attributeName.includes('visits')
                                                        ? 'Enter a proper url'
                                                        : '',
                                                },
                                            }
                                            : {}
                                    }
                                />
                            )}
                        </Col>
                    </Row>
                </Col>
            );
        case 'Single dropdown':
            return (
                <Col sm={5} className={inputDropDownClassName}>
                    <RSKendoDropDown
                        control={control}
                        name={`${name}.attributeValue`}
                        handleChange={() =>
                            setDuplicateRule({
                                index: 0,
                                show: false,
                            })
                        }
                        label="Attribute rule"
                        data={['Chrome', 'Firefox']}
                        required={checkValidCondition()}
                        rules={
                            checkValidCondition()
                                ? {
                                    required: SELECT_ATTRIBUTE,
                                }
                                : {}
                        }
                        handleOnBlur={() => {
                            handleDuplicateCheck();
                        }}
                    />
                </Col>
            );
        case '2D':
            return attributeName === 'Geofence' ? (
                <DynamicListGeoFencing
                    attribute={attribute}
                    className={inputDropDownClassName}
                    index={index}
                    name={name}
                    TriggerName={TriggerName}
                    pages={pages}
                    setDuplicateRule={setDuplicateRule}
                    handleDuplicateCheck={handleDuplicateCheck}
                    checkValidCondition={checkValidCondition}
                    currentRuleIndex={currentRuleIndex}
                />
            ) : (TriggerName?.triggerId === 18 || TriggerName?.triggerId === 5) &&
                attributeName === 'Latitude & Longitude - Radius' ? (
                <>
                    <Row className={inputDropDownClassName}>
                        <>
                            <Col className="pr5">
                                <RSInput
                                    name={`${name}.attributeFrom`}
                                    control={control}
                                    required={checkValidCondition()}
                                    label="From"
                                    id="rs_RenderField_latitudeattribute"
                                    onKeyDown={onlyNumbersDecimalWithoutSpecialCharacters}
                                    rules={
                                        checkValidCondition()
                                            ? {
                                                required: ENTER_VALUE,
                                            }
                                            : {}
                                    }
                                    handleOnBlur={() => {
                                        handleDuplicateCheck();
                                    }}
                                />
                            </Col>
                            <Col sm={1} className="text-center p0">
                                <span>To</span>
                            </Col>
                        </>
                        <Col className={`pl5 pr5`}>
                            <RSInput
                                name={`${name}.attributeTo`}
                                control={control}
                                label={isBet ? 'To' : 'Enter value'}
                                id="rs_RenderField_longitudeattribute"
                                onKeyDown={onlyNumbersDecimalWithoutSpecialCharacters}
                                required={checkValidCondition()}
                                rules={
                                    checkValidCondition()
                                        ? {
                                            required: ENTER_VALUE,
                                        }
                                        : {}
                                }
                                handleOnBlur={(e) => {
                                    setDuplicateRule({
                                        index: 0,
                                        show: false,
                                    });
                                    handleDuplicateCheck();
                                }}
                            />
                        </Col>
                        <Col sm={3} className="pr5">
                            <RSInput
                                name={`${name}.range`}
                                control={control}
                                label="Range"
                                id="rs_RenderField_rangeattribute"
                                required={checkValidCondition()}
                                maxLength={4}
                                onKeyDown={onlyNumbers}
                                rules={
                                    checkValidCondition()
                                        ? {
                                            required: ENTER_VALUE,
                                            pattern: {
                                                value: /^[0-9]+(\.[0-9]+)?$/,
                                                message: 'Enter valid range',
                                            },
                                        }
                                        : {}
                                }
                                handleOnBlur={() => {
                                    handleDuplicateCheck();
                                }}
                            />
                        </Col>
                        <Col sm={3}>
                            <RSKendoDropDown
                                control={control}
                                name={`${name}.attributeValue`}
                                handleChange={() =>
                                    setDuplicateRule({
                                        index: 0,
                                        show: false,
                                    })
                                }
                                label="Attribute rule"
                                data={level1DropdownData}
                                {...TRIGGER_ATTRIBUTE_VALUE_DROPDOWN_PROPS}
                                isLoading={isTriggerValuesLoading}
                                required={checkValidCondition()}
                                rules={
                                    checkValidCondition()
                                        ? {
                                            required: SELECT_ATTRIBUTE,
                                        }
                                        : {}
                                }
                                handleOnBlur={() => {
                                    handleDuplicateCheck();
                                }}
                            />
                        </Col>
                    </Row>
                </>
            ) : (
                <>
                    <Row className={inputDropDownClassName}>
                        <Col sm={5}>
                            <RSKendoDropDown
                                name={`${name}.attributeComparison`}
                                control={control}
                                required={checkValidCondition()}
                                label={handleDropDownLabelName(formatName(attributeName), 1)}
                                data={level1DropdownData}
                                isLoading={isTwoDimensionalLevel1Loading}
                                dataItemKey="id"
                                textField={`${formatName(attributeName) === 'attributes' ? 'UIPrintableName' : 'value'
                                    }`}
                                rules={
                                    checkValidCondition()
                                        ? {
                                            required: handleDropDownRequiredMessage(
                                                formatName(attributeName),
                                                1,
                                            ),
                                        }
                                        : {}
                                }
                                handleChange={(e) => {
                                    const selectedItem = e.value || {};
                                    const { value, columntype } = selectedItem;
                                    const selectedId =
                                        selectedItem?.id ??
                                        selectedItem?.formId ??
                                        selectedItem?.formID ??
                                        selectedItem?.FormId ??
                                        selectedItem?.recipientFormId ??
                                        selectedItem?.RecipientFormID ??
                                        '';
                                    const updateColumnType = formatName(columntype);
                                    const ruleTypeMeta = attribute?.attributeName;

                                    clearTwoDimensionalTriggerValues(attributeName, {
                                        additionalPaths:
                                            attributeName === 'Forms' && ruleAttributes?.length > 1
                                                ? ruleAttributes.flatMap((_, attrIdx) => {
                                                    if (attrIdx === 0) {
                                                        return [];
                                                    }
                                                    const attrPath = `${fieldName}.RuleAttributes[${attrIdx}]`;
                                                    return [
                                                        buildFieldTriggerValuesKey(attrPath, '2D', 1),
                                                        buildFieldTriggerValuesKey(attrPath, '2D', 2),
                                                    ];
                                                })
                                                : [],
                                    });

                                    if (attributeName === 'Forms') {
                                        const expectedKey = buildAttributeEffectKey({
                                            comparisonId: selectedId,
                                            formId: selectedId,
                                        });
                                        skipAttributeNameEffectExpectedKeyRef.current = expectedKey;
                                        skipAttributeNameEffectRef.current = true;
                                        attributeEffectKeyRef.current = expectedKey;
                                        if (ruleAttributes?.length > 1) {
                                            dispatchState({
                                                type: 'UPDATE_FORM_DROP_DOWN',
                                                payload: true,
                                            });
                                            const tempRuleAttrOnlyForm = ruleAttributes?.filter(
                                                (attr, idx) => idx === 0,
                                            );
                                            setValue(`${fieldName}.RuleAttributes`, tempRuleAttrOnlyForm);
                                        }
                                        dispatchState({
                                            type: 'UPDATE_FORM',
                                            payload: selectedId,
                                            field: TriggerName?.triggerId,
                                        });

                                        getTriggerAttributeValuesForRuleType?.(ruleTypeMeta, name, {
                                            levelNo: 2,
                                            formId: selectedId,
                                        });
                                    } else if (attributeName === 'Attributes') {
                                        const eligibleColumnType = ['combobox', 'checkbox', 'radio'];
                                        const isEligibleColumnType = eligibleColumnType?.includes(updateColumnType);
                                        if (isEligibleColumnType) {
                                            dispatchState({
                                                type: 'UPDATE_DATA_ATTRIBUTE_ID',
                                                payload: e.value.DataattributeID,
                                                field: TriggerName?.triggerId,
                                            });
                                            getTriggerAttributeValuesForRuleType?.(ruleTypeMeta, name, {
                                                levelNo: 2,
                                                columnName: value,
                                                dataAttributeId: e.value.DataattributeID,
                                            });
                                        } else {
                                            clearTwoDimensionalTriggerValues(attributeName);
                                        }
                                    } else if (formatName(attributeName) === 'eventbrite') {
                                        getTriggerAttributeValuesForRuleType?.(ruleTypeMeta, name, {
                                            levelNo: 2,
                                            columnName: value,
                                        });
                                    } else if (TriggerName?.triggerId === 18 || TriggerName?.triggerId === 5) {
                                        getTriggerAttributeValuesForRuleType?.(ruleTypeMeta, name, {
                                            levelNo: 2,
                                            formId: selectedId,
                                            columnName: value,
                                        });
                                    } else {
                                        dispatchState({
                                            type: 'UPDATE_FORM',
                                            payload: e.value,
                                            field: TriggerName?.triggerId + index,
                                        });
                                    }
                                    resetField(`${name}.attributeValue`);
                                    setDuplicateRule({
                                        show: false,
                                        index: 0,
                                    });
                                }}
                                handleOnBlur={() => {
                                    handleDuplicateCheck();
                                }}
                                footer={
                                    TriggerName?.triggerId === 13 &&
                                    formatName(attributeName) === 'forms' && (
                                        <NewAttributeBtn
                                            title={'Add form'}
                                            handleModalAttribute={() => {
                                                navigate('/preferences/template-gallery/form-generator', {
                                                    state: {
                                                        mode: 'add',
                                                        ...handleCustomNavigationDetails({
                                                            ...locationState,
                                                            ...getValues(),
                                                        }),
                                                    },
                                                });
                                            }}
                                        />
                                    )
                                }
                            />
                        </Col>
                        <Col sm={7}>
                            {shouldShowLevel2AsDropdown ? (
                                <>
                                    <RSKendoDropDown
                                        name={`${name}.attributeValue`}
                                        handleChange={() =>
                                            setDuplicateRule({
                                                index: 0,
                                                show: false,
                                            })
                                        }
                                        control={control}
                                        label={handleDropDownLabelName(formatName(attributeName), 2)}
                                        data={level2DropdownData}
                                        dataItemKey="id"
                                        textField={
                                            formatName(attributeName) === 'attributes' ? 'UIPrintableName' : 'value'
                                        }
                                        isLoading={isTwoDimensionalLevel2Loading}
                                        required={checkValidCondition()}
                                        rules={
                                            checkValidCondition()
                                                ? {
                                                    required: handleDropDownRequiredMessage(
                                                        formatName(attributeName),
                                                        2,
                                                    ),
                                                }
                                                : {}
                                        }
                                        handleOnBlur={() => {
                                            handleDuplicateCheck();
                                        }}
                                    />
                                </>
                            ) : (
                                <RSInput
                                    control={control}
                                    name={`${name}.attributeValue`}
                                    handleOnBlur={() => {
                                        setDuplicateRule({
                                            index: 0,
                                            show: false,
                                        });
                                        handleDuplicateCheck();
                                    }}
                                    label="Attribute value"
                                    id="rs_RenderField_vlueattribute1"
                                    required={checkValidCondition()}
                                    rules={
                                        checkValidCondition()
                                            ? {
                                                required: ENTER_ATTRIBUTE_VALUE,
                                            }
                                            : {}
                                    }
                                />
                            )}
                        </Col>
                    </Row>
                </>
            );

        case 'Boolean':
            return (
                <Row className={inputDropDownClassName}>
                    <Col sm={6}>
                        <RSKendoDropDown
                            control={control}
                            name={`${name}.attributeComparison`}
                            handleChange={(e) => {
                                handleOperatorChange(e.value, {
                                    includeAttributeMultipleValues: true,
                                });
                            }}
                            label="Type"
                            data={Object.values(comparisonTypeConfig?.string)}
                            // defaultValue="Contains"
                            required={checkValidCondition()}
                            rules={
                                checkValidCondition()
                                    ? {
                                        required: SELECT_Type,
                                    }
                                    : {}
                            }
                            handleOnBlur={() => {
                                handleDuplicateCheck();
                            }}
                        />
                    </Col>
                    <Col sm={6}>
                        <RSKendoDropDown
                            control={control}
                            name={`${name}.attributeValue`}
                            handleChange={() =>
                                setDuplicateRule({
                                    index: 0,
                                    show: false,
                                })
                            }
                            label="Attribute rule"
                            data={['Yes', 'No']}
                            required={checkValidCondition()}
                            rules={
                                checkValidCondition()
                                    ? {
                                        required: SELECT_ATTRIBUTE,
                                    }
                                    : {}
                            }
                            handleOnBlur={() => {
                                handleDuplicateCheck();
                            }}
                        />
                    </Col>
                </Row>
            );
        case 'single multiselect':
            return (
                <Col sm={5} className={inputDropDownClassName}>
                    <RSMultiSelect
                        control={control}
                        name={`${name}.attributeMultipleValues`}
                        handleChange={() =>
                            setDuplicateRule({
                                index: 0,
                                show: false,
                            })
                        }
                        data={['Attribute']}
                        allowCustom
                        label={'Attribute value'}
                        required={checkValidCondition()}
                        rules={
                            checkValidCondition()
                                ? {
                                    required: SELECT_ATTRIBUTE,
                                }
                                : {}
                        }
                        handleOnBlur={() => {
                            handleDuplicateCheck();
                        }}
                    />
                </Col>
            );
        case 'AN':
            return (
                <Row className={inputDropDownClassName}>
                    {/* <Col sm={5}>
                        <RSKendoDropDown
                            control={control}
                            name={`${name}.attributeComparison`}
                            handleChange={() =>
                                setDuplicateRule({
                                    show: false,
                                    index: 0,
                                })
                            }
                            data={AUDIENCE_BASE_TYPES}
                            required={checkValidCondition()}
                            label="Type"
                            // defaultValue={'Before'}
                            rules={
                                checkValidCondition()
                                    ? {
                                          required: SELECT_Type,
                                      }
                                    : {}
                            }
                        />
                    </Col> */}
                    <>
                        {/* <Col className="pr5">
                                <RSDatePicker
                                    control={control}
                                    name={`${name}.attributeTo`}
                                    rules={
                                        checkValidCondition()
                                            ? {
                                                  required: SELECT_VALUE,
                                              }
                                            : {}
                                    }
                                    required={checkValidCondition()}
                                />
                            </Col> */}
                        <Col sm={1} className="w-auto rule-group-plusminus ruleGroup-action-dd top3">
                            {/* <span>To</span> */}
                            <RSBootstrapdown
                                defaultItem={getDefaultItem() || MULTIPLE_DROPDOWN_PLUSMINUS[0]}
                                data={MULTIPLE_DROPDOWN_PLUSMINUS}
                                isObject
                                fieldKey="icon"
                                onSelect={(e) => {
                                    setValue(`${name}.attributeComparison`, e.value);
                                    handleDuplicateCheck();
                                }}
                            />
                        </Col>
                    </>
                    <Col className={`${isBet ? 'pl5' : 'pr0 top1'}`} sm={isBet ? '' : 10}>
                        {/* <RSDatePicker
                            control={control}
                            name={`${name}.attributeValue`}
                            handleChange={() =>
                                setDuplicateRule({
                                    index: 0,
                                    show: false,
                                })
                            }
                            rules={
                                checkValidCondition()
                                    ? {
                                          required: SELECT_DATE,
                                          validate: (data) => {
                                              if (isBet)
                                                  return attributeTo - attributeFrom < 0 ? SELECT_VALUE : true;
                                              else return;
                                          },
                                      }
                                    : {}
                            }
                            required={checkValidCondition()}
                        /> */}

                        <RSInput
                            name={`${name}.attributeValue`}
                            control={control}
                            label={'Enter value'}
                            id="rs_RenderField_rangeattribute"
                            onKeyDown={onlyNumbers}
                            required={checkValidCondition()}
                            rules={
                                checkValidCondition()
                                    ? {
                                        required: ENTER_VALUE,
                                        validate: (data) => {
                                            //   return Number(data) === 0 ? 'Enter valid value' : true;
                                        },
                                    }
                                    : {}
                            }
                            maxLength={4}
                            handleOnBlur={() => {
                                handleDuplicateCheck();
                            }}
                        />
                    </Col>
                </Row>
            );
        case 'DCR':
            return (
                <Row className={inputDropDownClassName}>
                    <Col sm={5}>
                        <RSKendoDropDown
                            control={control}
                            name={`${name}.attributeComparison`}
                            handleChange={(e) => {
                                handleOperatorChange(e.value, {
                                    includeAttributeTo: true,
                                    triggerValidation: true,
                                });
                            }}
                            data={Object.values(comparisonTypeConfig?.number_Decimal)}
                            required={checkValidCondition()}
                            label="Type"
                            // defaultValue={'Before'}
                            rules={
                                checkValidCondition()
                                    ? {
                                        required: SELECT_Type,
                                    }
                                    : {}
                            }
                            handleOnBlur={() => {
                                handleDuplicateCheck();
                            }}
                        />
                    </Col>
                    {attributeComp === 'Between' && (
                        <>
                            <Col className="pr5">
                                <RSInput
                                    name={`${name}.attributeTo`}
                                    control={control}
                                    required={checkValidCondition()}
                                    label="From"
                                    id="rs_RenderField_amountattribute"
                                    rules={
                                        checkValidCondition()
                                            ? {
                                                required: ENTER_VALUE,
                                                validate: (value) => {
                                                    let val = value?.replace(/,/g, '');
                                                    clearErrors(`${name}.attributeValue`);
                                                    if (isBet)
                                                        return parseFloat(val, 10) > parseInt(attributeTo, 10)
                                                            ? ENTER_LESSER_VALUE
                                                            : true;
                                                },
                                            }
                                            : {}
                                    }
                                    handleOnBlur={(e) => {
                                        // setValue(`${name}.attributeTo`, numberWithCommas(e.target.value));
                                        setValue(`${name}.attributeTo`, e.target.value.replace(/,/g, ''));
                                        handleDuplicateCheck();
                                    }}
                                    onKeyDown={onlyNumbersDecimalWithoutSpecialCharactersUpto3Digits}
                                />
                            </Col>
                            <Col sm={1} className="text-center p0">
                                <span>To</span>
                            </Col>
                        </>
                    )}
                    <Col className={`${isBet ? 'pl5' : ''}`} sm={isBet ? '' : 7}>
                        {isHasValueOperator(attributeComp) ? (
                            renderHasValueInput('rs_RenderField_hasValueInputDCR', '', 'DCR')
                        ) : (
                            <RSInput
                                name={`${name}.attributeValue`}
                                control={control}
                                label={isBet ? 'To' : 'Enter value'}
                                id="rs_RenderField_rangeattribute"
                                onKeyDown={onlyNumbersDecimalWithoutSpecialCharactersUpto3Digits}
                                required={checkValidCondition()}
                                rules={
                                    checkValidCondition()
                                        ? {
                                            required: ENTER_VALUE,
                                            validate: (value) => {
                                                clearErrors(`${name}.attributeTo`);
                                                if (isBet) {
                                                    let val = value?.replace(/,/g, '');
                                                    return parseFloat(attributeFrom, 10) > parseInt(val, 10)
                                                        ? ENTER_GREATER_VALUE
                                                        : true;
                                                }
                                            },
                                        }
                                        : {}
                                }
                                handleOnBlur={(e) => {
                                    // setValue(`${name}.attributeValue`, numberWithCommas(e.target.value));
                                    setValue(`${name}.attributeValue`, e.target.value.replace(/,/g, ''));
                                    setDuplicateRule({
                                        index: 0,
                                        show: false,
                                    });
                                    handleDuplicateCheck();
                                }}
                            />
                        )}
                    </Col>
                </Row>
            );
        case 'NR':
            return (
                <Row className={inputDropDownClassName}>
                    <Col sm={5}>
                        <RSKendoDropDown
                            control={control}
                            name={`${name}.attributeComparison`}
                            handleChange={(e) => {
                                handleOperatorChange(e.value, {
                                    includeAttributeTo: true,
                                    triggerValidation: true,
                                });
                            }}
                            data={Object.values(comparisonTypeConfig?.number_Decimal)}
                            required={checkValidCondition()}
                            label="Type"
                            // defaultValue={'Before'}
                            rules={
                                checkValidCondition()
                                    ? {
                                        required: SELECT_Type,
                                    }
                                    : {}
                            }
                            handleOnBlur={() => {
                                handleDuplicateCheck();
                            }}
                        />
                    </Col>
                    {attributeComp === 'Between' && (
                        <>
                            <Col className="pr5">
                                <RSInput
                                    name={`${name}.attributeTo`}
                                    control={control}
                                    required={checkValidCondition()}
                                    label="From"
                                    id="rs_RenderField_amountattribute"
                                    rules={
                                        checkValidCondition()
                                            ? {
                                                required: ENTER_VALUE,
                                                validate: (value) => {
                                                    let val = value?.replace(/,/g, '');
                                                    clearErrors(`${name}.attributeValue`);
                                                    if (isBet)
                                                        return parseInt(val, 10) > parseInt(attributeTo, 10)
                                                            ? ENTER_LESSER_VALUE
                                                            : true;
                                                },
                                            }
                                            : {}
                                    }
                                    handleOnBlur={(e) => {
                                        // setValue(`${name}.attributeTo`, numberWithCommas(e.target.value));
                                        setValue(`${name}.attributeTo`, e.target.value.replace(/,/g, ''));
                                        handleDuplicateCheck();
                                    }}
                                    onKeyDown={onlyNumbers}
                                />
                            </Col>
                            <Col sm={1} className="text-center p0">
                                <span>To</span>
                            </Col>
                        </>
                    )}
                    <Col className={`${isBet ? 'pl5' : ''}`} sm={isBet ? '' : 7}>
                        {isHasValueOperator(attributeComp) ? (
                            renderHasValueInput('rs_RenderField_hasValueInputNR', '', 'NR')
                        ) : (
                            <RSInput
                                key={`normal-${attributeComp}-${name}`}
                                name={`${name}.attributeValue`}
                                control={control}
                                label={isBet ? 'To' : 'Enter value'}
                                id="rs_RenderField_rangeattribute"
                                onKeyDown={onlyNumbers}
                                required={checkValidCondition()}
                                rules={
                                    !isHasValueOperator(attributeComp) && checkValidCondition()
                                        ? {
                                            required: ENTER_VALUE,
                                            validate: (value) => {
                                                clearErrors(`${name}.attributeTo`);
                                                if (isBet) {
                                                    let val = value?.replace(/,/g, '');
                                                    return parseInt(attributeFrom, 10) > parseInt(val, 10)
                                                        ? ENTER_GREATER_VALUE
                                                        : true;
                                                }
                                            },
                                        }
                                        : {}
                                }
                                handleOnBlur={(e) => {
                                    // setValue(`${name}.attributeValue`, numberWithCommas(e.target.value));
                                    setValue(`${name}.attributeValue`, e.target.value.replace(/,/g, ''));
                                    setDuplicateRule({
                                        index: 0,
                                        show: false,
                                    });
                                    handleDuplicateCheck();
                                }}
                            />
                        )}
                    </Col>
                </Row>
            );
        case 'TR':
            return (
                <Row className={inputDropDownClassName}>
                    <Col sm={6}>
                        <RSKendoDropDown
                            control={control}
                            name={`${name}.attributeComparison`}
                            handleChange={(e) => {
                                handleOperatorChange(e.value, {
                                    includeAttributeTo: true,
                                    triggerValidation: true,
                                });
                            }}
                            data={Object.values(comparisonTypeConfig?.number_Decimal)}
                            required={checkValidCondition()}
                            label="Type"
                            // defaultValue={'Before'}
                            rules={
                                checkValidCondition()
                                    ? {
                                        required: SELECT_Type,
                                    }
                                    : {}
                            }
                            handleOnBlur={() => {
                                handleDuplicateCheck();
                            }}
                        />
                    </Col>
                    {attributeComp === 'Between' && (
                        <>
                            <Col className="pr5">
                                <RSTimePicker
                                    name={`${name}.attributeTo`}
                                    required={checkValidCondition()}
                                    control={control}
                                    label="From value"
                                    format={'HH:mm:ss'}
                                    rules={
                                        checkValidCondition()
                                            ? {
                                                required: ENTER_TIME,
                                            }
                                            : {}
                                    }
                                />
                            </Col>
                            <Col sm={1} className="text-center p0">
                                <span>To</span>
                            </Col>
                        </>
                    )}
                    <Col className={`${isBet ? 'pl5' : ''}`} sm={isBet ? '' : 8}>
                        {isHasValueOperator(attributeComp) ? (
                            renderHasValueInput('rs_RenderField_hasValueInputTR', '', 'TR')
                        ) : (
                            <RSTimePicker
                                name={`${name}.attributeValue`}
                                handleChange={() =>
                                    setDuplicateRule({
                                        index: 0,
                                        show: false,
                                    })
                                }
                                control={control}
                                required={checkValidCondition()}
                                label={isBet ? 'To value' : 'Set Time'}
                                format={'HH:mm:ss'}
                                rules={
                                    checkValidCondition()
                                        ? {
                                            required: ENTER_TIME,
                                            validate: (data) =>
                                                attributeFrom - attributeTo > 0 ? ENTER_TIME : true,
                                        }
                                        : {}
                                }
                            />
                        )}
                    </Col>
                </Row>
            );
        case '4D':
            return formatName(attributeName) === 'beacon' ? (
                <DynamicListBeacon
                    attribute={attribute}
                    className={inputDropDownClassName}
                    index={index}
                    name={name}
                    setDuplicateRule={setDuplicateRule}
                    handleDuplicateCheck={handleDuplicateCheck}
                    checkValidCondition={checkValidCondition}
                    currentRuleIndex={currentRuleIndex}
                />
            ) : null;
        default:
            return (
                <Fragment>
                    <RSInput
                        control={control}
                        name={`${name}.attributeValue`}
                        id="rs_RenderField_actionattribute"
                        required
                        label="Action"
                        disabled
                        placeholder={'All'}
                        rules={{
                            required: ENTER_ATTRIBUTE,
                        }}
                        handleOnBlur={() => {
                            handleDuplicateCheck();
                        }}
                    />

                    {/* <Col sm={1}>
                        <i className=""></i>{' '}
                    </Col> */}
                </Fragment>
            );
    }
};

export default memo(RenderField);
