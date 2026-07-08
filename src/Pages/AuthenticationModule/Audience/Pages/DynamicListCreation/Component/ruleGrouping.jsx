import {
    createCommunicationSettingsNavState,
    handleCustomNavigationDetails,
    NOTIFICATION_TAB_ID,
} from 'Utils/modules/navigation';
import { encodeUrl } from 'Utils/modules/crypto';
import { selectIcon } from 'Utils/modules/display';
import { formatName } from 'Utils/modules/formatters';
import { onlyNumbers } from 'Utils/modules/inputValidators';
import { ENTER_TRIGGER_CONDITION, SELECT_APP, SELECT_INPUT_Domain, SELECT_PROPER_VALUES, SELECT_Rule_Type, SELECT_TRIGGER_SOURCE } from 'Constants/GlobalConstant/ValidationMessage';
import { ADD_MOBILE_APP, ADD_TARGET_LIST, ADD_WEB_DOMAIN, ALL, ANY, APP_NAME, ARE_YOU_SURE_DELETE, ARE_YOU_SURE_REMOVE, ARE_YOU_SURE_WANT_TO_RESET, CONFIRMATION, DYNAMICLIST_ANY, DYNAMIC_ANNUAL_REMINDER_CONTENT, MARKED_ANNUAL_REMAINDER, OK, REMOVE, RESET, TRIGGER_SOURCE, URL, WAITING_FOR_EVENT_SET, CLICK_TO_CONFIGURE, sameTriggerSourceNotAllowed } from 'Constants/GlobalConstant/Placeholders';
import { circle_question_mark_mini, delete_medium, mandatory_mini, map_medium, restart_medium, timer_medium, event_tracking_medium } from 'Constants/GlobalConstant/Glyphicons';
import React, { Fragment, memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useFormContext, useFieldArray, useWatch } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { buildDynamicListSessionKey, getTrrComm_ChannelValues } from 'Reducers/audience/dynamicList/request';
import { findIndex as _findIndex, get as _get } from 'Utils/modules/lodashReplacements';

import { useNavigate } from 'react-router-dom';
import {
    MatchTypeCheck,
    RULE_ATTRIBUTES_LENGTH_CONFIG,
    buildFieldTriggerValuesKey,
    formatFieldTriggerValuesData,
    getAudienceBaseFilterValues,
    getAudienceBaseValuesFromFullJson,
    applyFullAttributeJSONToDynamicListState,
    resolveAudienceBaseFieldName,
    isAudienceBaseDropdownFieldType,
    periodRangeValues,
    repeatedGroupValuesCheck,
    repeatedValuesCheck,
    resolveCustomEventsStateFromRedux,
    shouldSkipTriggerAttributeValuesApi,
    shouldFetchTriggerAttributeValuesForRule,
    validateDuplicateTriggerSource,
    COMMUNICATION_NAME_TRIGGER_ID,
    buildChannelOptionsFromCommunicationChannels,
} from '../constant';



import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSRadioButton from 'Components/FormFields/RSRadioButton';
import RenderSwitchButton from './RenderSwitchButton/RenderSwitchButton';
import WarningModal from './WarningModal/WarningModal';
import RSTooltip from 'Components/RSTooltip';
import RSInput from 'Components/FormFields/RSInput';
import useQueryParams from 'Hooks/useQueryParams';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';
import RSConfirmationModal from 'Components/ConfirmationModal';
import RSPPophover from 'Components/RSPPophover';
import { DynamicListCreateContext } from '..';
import RenderField from './RenderField/RenderField';
import CustomEvents from './CustomEvents/CustomEvents';
import MapModal from './MapModal/MapModal';
import TimerModal from './TimerModal/TimerModal';

import RSModal from 'Components/RSModal';
import RSAlert from 'Components/RSAlert';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { ScriptBlock } from 'Assets/Images';

import NewAttributeBtn from 'Pages/AuthenticationModule/Audience/Pages/AddImportAudience/Components/CustomHeaderColumn/NewAttributeBtn';
import { getAttributeValues } from 'Reducers/audience/targetListCreation/request';
import { getDynamicListFullAttributeJSONValues } from 'Reducers/audience/dynamicList/request';
import { parseAudienceJson } from 'Pages/AuthenticationModule/Audience/audienceDefaults';

const RuleGrouping = ({
    index,
    title,
    isTriggerSourceLoading = false,
    isClickOff = false,
}) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const {
        control,
        trigger,
        resetField,
        setValue,
        watch,
        getValues,
        formState: { isValid, errors },
        unregister,
        clearErrors,
        setError,
    } = useFormContext();
    const { dispatchState, ensureTimeZoneDetail, triggerSourceData: sourceData, removeRule, getTriggerAttributesData, getTriggerBaseDDL, ListState,
        duplicateRule, setDuplicateRule, setErrorGroup, errorGroup, controllEditModeApiCall, setControllEditModeApiCall, setErrorCustomGroup,
        errorCustomGroup, dispatchTriggerAttributeValues,
    } = useContext(DynamicListCreateContext);
    const queryParamDetails = useQueryParams('/audience');
    console.log('ListState: ', ListState);

    const locationState = useQueryParams();
    const { formAttributes, mandatory } = ListState ? ListState : {};
    const [modifiedSourceData, setModifiedSourceData] = useState([]);
    // const [currentRule, setCurrentRule] = useState(null);
    const [valueModal, setValueModal] = useState({
        timer: false,
        map: false,
        analytics: false,
    });
    const [showReset, setShowReset] = useState({
        show: false,
        type: '',
        index: 0,
    });

    const { formAttributeId = {} } = ListState || {};
    const [showTrackingAgreement, setShowTrackingAgreement] = React.useState(false);
    const [isShowAlert, setShowAlert] = React.useState(false);
    const openedTabRef = React.useRef(null);
    const tabClosePollRef = React.useRef(null);

    React.useEffect(() => {
        return () => {
            if (tabClosePollRef.current) {
                window.clearInterval(tabClosePollRef.current);
                tabClosePollRef.current = null;
            }
        };
    }, []);

    const handleEventTrackSubmit = () => {
        const getUrl = pages?.value || '';
        if (getUrl) {
            localStorage.setItem('__brandOwnedFormData', JSON.stringify({
                platform: { id: 'web', value: 'Web' },
                eventTrackingUrl: getUrl
            }));
            setTimeout(() => {
                setShowAlert(true);
            }, 350);
            let campaignId = Math.floor(Math.random() * 1000 + 1);
            const reqs = localStorage.getItem('accessToken') || '';
            const formName = '';
            const domain = window.location.host;
            const redurl = `${domain}${window.location.pathname}${window.location.search}`;
            let path = window.location.pathname;
            const currentFormId = formAttributeId[TriggerName?.triggerName]?.formId || 0;
            const paramsToEncrypt = `cevent|${reqs}|${currentFormId}|${departmentId}|${formName}|${redurl}`;
            const encryptedParams = 'rfg' + btoa(paramsToEncrypt) + 'rd';
            const cleanUrl = getUrl.replace(/\/$/, '');
            let urlStr = `${cleanUrl}?_sdxFormId=${btoa(campaignId.toString())}&sdk_mode=${encryptedParams}&path=${encodeURIComponent(path)}&webft=true&bofadd=true`;
            localStorage.setItem('fdomain', urlStr);
            const opened = window.open(urlStr, '_blank');
            opened?.focus();
            openedTabRef.current = opened || null;

            if (tabClosePollRef.current) {
                window.clearInterval(tabClosePollRef.current);
                tabClosePollRef.current = null;
            }

            if (openedTabRef.current) {
                tabClosePollRef.current = window.setInterval(() => {
                    if (!openedTabRef.current || openedTabRef.current.closed) {
                        if (tabClosePollRef.current) {
                            window.clearInterval(tabClosePollRef.current);
                            tabClosePollRef.current = null;
                        }
                        openedTabRef.current = null;
                        setShowAlert(false);
                    }
                }, 1000);
            }
        }
    };

    const attributeCustomFieldActionsRef = useRef({});
    const triggerPagesAPI = useApiLoader({
        autoFetch: false,
        mode: 'create',
        loaderConfig: fieldLoaderConfig,
    });
    const ruleTypeListAPI = useApiLoader({
        autoFetch: false,
        mode: 'create',
        loaderConfig: fieldLoaderConfig,
    });
    const audienceBaseOptionsAPI = useApiLoader({
        autoFetch: false,
        mode: 'create',
        loaderConfig: fieldLoaderConfig,
    });
    const isPagesLoading = triggerPagesAPI.isLoading;
    const isRuleTypeListLoading = ruleTypeListAPI.isLoading;
    const isRuleGroupLoading = isPagesLoading || isRuleTypeListLoading;
    const isInteractionDisabled = isClickOff || isRuleGroupLoading;
    useEffect(() => {
        return () => {
            triggerPagesAPI.reset();
            ruleTypeListAPI.reset();
            audienceBaseOptionsAPI.reset();
        };
    }, [triggerPagesAPI.reset, ruleTypeListAPI.reset, audienceBaseOptionsAPI.reset]);
    useEffect(() => {
        if (sourceData?.length) {
            // setModifiedSourceData([...sourceData, { isDDLExist: 0, triggerId: 1000, triggerName: 'Location' }]);  //6303
            setModifiedSourceData([...sourceData]);
        }
        if (queryParamDetails && Object?.keys(queryParamDetails)?.length && queryParamDetails?.fromCampaign === 'M') {
            let eligibleSourceInMDC = ['Target list', 'Subscription Form', 'Audience base'];
            const formattedEligibleSources = eligibleSourceInMDC.map(formatName);
            const finalSourceInMDC = sourceData?.filter((source) => {
                if (formattedEligibleSources.includes(formatName(source.triggerName))) {
                    return source;
                }
            });
            setModifiedSourceData(finalSourceInMDC);
        } else {
            setModifiedSourceData(sourceData);
        }
    }, [sourceData, queryParamDetails]);
    const { MatchType, RuleAttributes, TriggerName, pages } = useWatch({ control, name: `rule.${index}` });
    const [rule] = watch([`rule.${index}`]);
    const allRule = watch(`rule`);
    const { customAttributes } = useSelector(({ dynamicListReducer }) => dynamicListReducer);
    const {
        fields: typeFields,
        append: typeAppend,
        remove: typeRemove,
        update: typeUpdate,
    } = useFieldArray({ control, name: `rule.${index}.RuleAttributes` });
    const fieldName = `rule.${index}`;
    const savedRuleType = watch(`${fieldName}.RuleType`);
    const ruleGroupTitle = title || savedRuleType || (index === 0 ? 'Rule' : '');
    const [customState, setCustomState] = useState(() => resolveCustomEventsStateFromRedux(customAttributes));

    useEffect(() => {
        setCustomState((prev) => {
            const nextState = resolveCustomEventsStateFromRedux(customAttributes);
            if (!nextState.field) {
                return prev?.field ? prev : nextState;
            }
            if (!nextState.data?.length && prev?.field === nextState.field && prev?.data?.length) {
                return prev;
            }
            return nextState;
        });
    }, [customAttributes]);

    const customEventFieldProps = {
        customState,
        setCustomState,
    };

    const ruleAttributes = `rule.${index}.RuleAttributes`;

    const [warningShow, setWarningShow] = useState({
        text: '',
        show: false,
        isDelete: false,
    });
    const { triggerAttributes, triggerBaseDDL } = useSelector(({ dynamicListReducer }) => dynamicListReducer);

    const triggerPagesOptions = useMemo(() => {
        const sessionKey = buildDynamicListSessionKey({ clientId, departmentId });
        const options =
            triggerBaseDDL?.[sessionKey]?.[TriggerName?.triggerId] ||
            triggerBaseDDL?.[TriggerName?.triggerId] ||
            [];
        return options
            .map((item, idx) => ({
                ...item,
                id: item?.id ?? item?.appId ?? item?.AppId ?? item?.appID ?? item?.recipientFormId ?? idx + 1,
                value:
                    item?.value ??
                    item?.appName ??
                    item?.name ??
                    item?.label ??
                    String(item?.id ?? item?.appId ?? idx + 1),
            }))
            .filter((item) => item.id != null && item.id !== '');
    }, [triggerBaseDDL, TriggerName?.triggerId, clientId, departmentId]);

    const addAttribute = async (idx, title) => {
        if (!idx) {
            //Checking whether the entered values are unique otherwise throws an error by triggering the field
            const duplicateStatus = repeatedGroupValuesCheck(
                allRule,
                `rule[${index}].RuleAttributes`,
                TriggerName?.triggerId,
            );
            // console.log('duplicateStatus: ', duplicateStatus);
            setErrorGroup(title);
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

            var check = repeatedValuesCheck(
                getValues(`rule.${index}.RuleAttributes`),
                `rule[${index}].RuleAttributes`,
                TriggerName?.triggerId,
            );
            var matchTypeCheck = MatchTypeCheck(rule?.RuleAttributes, rule?.MatchType, rule?.MatchCount);
            // console.log('Check ::::: ', matchTypeCheck, check, isValid);
            if (duplicateStatus?.duplicateIndex < 0) {
                if (matchTypeCheck) {
                    const isRuleValid = await trigger(fieldName);
                    if (
                        (check[0] && isRuleValid) ||
                        (check[0] && Number(rule?.MatchCount) >= RuleAttributes?.length && MatchType === 'Any')
                    ) {
                        typeAppend({
                            attributeName: {
                                fieldtype: '',
                                id: '',
                                value: '',
                            },
                            attributeValue: '',
                            attributeType: '',
                            attributeMultipleValues: [],
                            attributeComparison: '',
                            attributeCustom: [],
                            mandatory: false,
                        });
                        setDuplicateRule({
                            show: false,
                            index: 0,
                        });
                        if (Number(rule?.MatchCount) === RuleAttributes?.length && MatchType === 'Any') {
                            trigger(`${fieldName}.MatchCount`);
                        }
                    } else {
                        if (check?.length === 1) {
                            trigger(fieldName);
                        } else {
                            // setValue(check[1], check[2]);
                            setDuplicateRule({
                                show: true,
                                index: check[3],
                            });
                            setErrorGroup(title);
                            // trigger(check[1]);
                        }
                    }
                }
            }
        } else {
            setDuplicateRule({
                show: false,
                idx: null,
            });
            dispatchState({
                type: 'REMOVE_ATTRIBUTE_FIELD_TRIGGER_VALUES',
                payload: { ruleIndex: index, attributeIndex: idx },
            });
            typeRemove(idx);
            if (Number(rule?.MatchCount) === RuleAttributes?.length - 1 && MatchType === 'Any') {
                trigger(`${fieldName}.MatchCount`);
            }
        }
    };

    useEffect(() => {
        if (title) {
            setValue(`${fieldName}.RuleType`, title);
        }
    }, [title, fieldName, setValue]);
    const dataToSort = useMemo(() => {
        const triggerId = TriggerName?.triggerId;
        if (triggerId == null) return undefined;
        const sessionKey = buildDynamicListSessionKey({ clientId, departmentId });
        const sessionEntry = triggerAttributes?.[sessionKey];
        const entry = sessionEntry?.[triggerId] ?? triggerAttributes?.[triggerId];
        const cacheKey = TriggerName?.isDDLExist ? (pages?.id ?? '') : '';
        const resolved = Array.isArray(entry) ? entry : entry?.[cacheKey];
        return Array.isArray(resolved) && resolved.length > 0 ? resolved : undefined;
    }, [TriggerName?.triggerId, TriggerName?.isDDLExist, triggerAttributes, pages?.id, clientId, departmentId]);
    let sortedData = [];
    if (Array.isArray(dataToSort)) {
        sortedData = dataToSort.slice().sort((a, b) => {
            const valueA = a?.value.toLowerCase();
            const valueB = b?.value.toLowerCase();
            if (valueA < valueB) return -1;
            if (valueA > valueB) return 1;
            return 0;
        });
    }

    const handleMandatory = () => {
        if (rule?.RuleAttributes?.length > 0) {
            rule?.RuleAttributes?.forEach((item, idx) => {
                setValue(`${fieldName}.RuleAttributes.${idx}.mandatory`, false);
            });
        }
    };

    const handleDuplicateCheck = () => {
        const getAllRule = getValues('rule');
        const duplicateStatus = repeatedGroupValuesCheck(
            getAllRule,
            `rule[${index}].RuleAttributes`,
            TriggerName?.triggerId,
        );
        setErrorGroup(title);
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

        let check = repeatedValuesCheck(
            getValues(`rule.${index}.RuleAttributes`),
            `rule[${index}].RuleAttributes`,
            TriggerName?.triggerId,
            false,
            true,
        );
        let matchTypeCheck = MatchTypeCheck(
            getValues(`rule.${index}.RuleAttributes`),
            rule?.MatchType,
            rule?.MatchCount,
        );
        if (duplicateStatus?.duplicateIndex < 0) {
            if (matchTypeCheck) {
                if (!check[0]) {
                    setDuplicateRule({
                        show: true,
                        index: check[3],
                    });
                    setErrorGroup(title);
                }
            }
        }
    };



    const handleDropDownValuesFormOrEventBrite = (currentIdx) => {
        const isForm = TriggerName?.triggerId === 13;
        const isEventBrite = TriggerName?.triggerId === 27;
        const type = isEventBrite ? 'eventbrite' : 'forms';
        let baseData = [];
        if (isForm || isEventBrite) {
            const isExist = typeFields?.find((field) => formatName(field?.attributeName?.value) === type);
            if (typeFields?.length === 1 && isExist) {
                baseData = sortedData || [];
            } else if (isExist && typeFields?.length > 1) {
                baseData = sortedData?.filter((item) => formatName(item.value) !== formatName(type)) || [];
            } else {
                baseData = sortedData || [];
            }
        } else {
            baseData = sortedData || [];
        }
        // If Geofence is already selected in another rule type (not current), exclude it from this dropdown.
        const geofenceAlreadySelectedElsewhere = (rule?.RuleAttributes || []).some(
            (attr, i) =>
                i !== currentIdx && attr?.attributeName?.value && formatName(attr.attributeName.value) === 'geofence',
        );
        if (geofenceAlreadySelectedElsewhere) {
            baseData = baseData.filter((item) => formatName(item?.value) !== 'geofence');
        }
        const beaconAlreadySelectedElsewhere = (rule?.RuleAttributes || []).some(
            (attr, i) =>
                i !== currentIdx && attr?.attributeName?.value && formatName(attr.attributeName.value) === 'beacon',
        );
        if (beaconAlreadySelectedElsewhere) {
            baseData = baseData.filter((item) => formatName(item?.value) !== 'beacon');
        }
        return baseData;
    };

    const checkErrorExist = () => {
        const currentRuleErrors = _get(errors, `rule.${index}`, {});
        if (currentRuleErrors?.TriggerName?.message === sameTriggerSourceNotAllowed) {
            return true;
        } else {
            return false;
        }
    };

    const shouldFetchTriggerValuesForRuleType = useCallback(
        (selectedRuleType, fldname) => {
            if (!selectedRuleType?.value) {
                return false;
            }

            if (TriggerName?.triggerId === COMMUNICATION_NAME_TRIGGER_ID) {
                return true;
            }

            const fieldType = selectedRuleType?.fieldType ?? selectedRuleType?.fieldtype;
            const normalizedValue = formatName(selectedRuleType?.value);
            const storageKey = buildFieldTriggerValuesKey(fldname, fieldType, 1);
            const fieldTriggerEntry = ListState?.fieldTriggerValues?.[storageKey];
            const triggerValues = fieldTriggerEntry?.triggerValues;

            const getLoadedValues = () => {
                if (Array.isArray(triggerValues)) {
                    return triggerValues;
                }
                return (
                    triggerValues?.[selectedRuleType?.value] ??
                    triggerValues?.Geofence ??
                    triggerValues?.Beacon ??
                    null
                );
            };

            const isGeofence = normalizedValue === 'geofence';
            if (isGeofence) {
                const loadedValues = getLoadedValues();
                return !loadedValues?.length && !fieldTriggerEntry?.isLoading;
            }

            const isBeacon = normalizedValue === 'beacon';
            if (isBeacon) {
                const loadedValues = getLoadedValues();
                return !loadedValues?.length && !fieldTriggerEntry?.isLoading;
            }

            if (!shouldFetchTriggerAttributeValuesForRule(selectedRuleType, TriggerName?.triggerId)) {
                return false;
            }

            if (TriggerName?.triggerId === 13 || TriggerName?.triggerId === 27) {
                const isForm = TriggerName?.triggerId === 13;
                if (isForm) {
                    if (RuleAttributes?.length === 1 && normalizedValue === 'forms') {
                        return true;
                    }
                    if (RuleAttributes?.length > 1 && normalizedValue !== 'forms') {
                        return true;
                    }
                    return false;
                }

                if (RuleAttributes?.length === 1 && normalizedValue === 'eventbrite') {
                    return true;
                }
                if (RuleAttributes?.length > 1 && normalizedValue !== 'eventbrite') {
                    return true;
                }
                return false;
            }

            const isForms = normalizedValue === 'forms';
            const isLevel1Loaded = !!getLoadedValues()?.length;
            return !(isForms && isLevel1Loaded);
        },
        [RuleAttributes?.length, TriggerName?.triggerId, ListState?.fieldTriggerValues],
    );

    const handleAudienceBaseApi = useCallback(
        async (selectedRuleType, fldname) => {
            const fieldNameKey = resolveAudienceBaseFieldName(selectedRuleType);
            const fieldType = selectedRuleType?.fieldType ?? selectedRuleType?.fieldtype ?? 'T';
            if (!fldname || !fieldNameKey || !isAudienceBaseDropdownFieldType(fieldType)) {
                return;
            }

            const payload = {
                attributeName: fieldNameKey,
                fieldType,
                departmentId,
                clientId,
                userId,
                partnerID: 0,
                levelNo: 1,
            };
            const storageKey = buildFieldTriggerValuesKey(fldname, fieldType, 1);

            const applyOptions = (options = []) => {
                dispatchState({
                    type: 'UPDATE_FIELD_TRIGGER_VALUES',
                    payload: {
                        fieldName: storageKey,
                        isLoading: false,
                        triggerValues: formatFieldTriggerValuesData(
                            { ...payload, fieldType: 'T' },
                            options,
                        ),
                    },
                });
            };

            const fromFilterLabels = getAudienceBaseFilterValues(ListState?.filterLabels?.[fieldNameKey]);
            if (fromFilterLabels.length) {
                applyOptions(fromFilterLabels);
                return;
            }

            const fromStoredFullJson = getAudienceBaseValuesFromFullJson(
                ListState?.fullAttributeJSONValues,
                fieldNameKey,
            );
            if (fromStoredFullJson.length) {
                applyOptions(fromStoredFullJson);
                return;
            }

            dispatchState({
                type: 'UPDATE_FIELD_TRIGGER_VALUES',
                payload: { fieldName: storageKey, isLoading: true },
            });

            try {
                let fullJsonResponse = null;
                if (!audienceBaseOptionsAPI.isFetching) {
                    fullJsonResponse = await audienceBaseOptionsAPI.refetch({
                        fetcher: () =>
                            dispatch(
                                getDynamicListFullAttributeJSONValues({
                                    payload: {
                                        clientId,
                                        userId,
                                        departmentId,
                                    },
                                    loading: false,
                                }),
                            ),
                        mode: 'create',
                        loaderConfig: fieldLoaderConfig,
                        params: { fieldNameKey },
                    });
                }

                const liveFullJsonValues = applyFullAttributeJSONToDynamicListState(
                    fullJsonResponse,
                    dispatchState,
                );
                const fromLiveFullJson = getAudienceBaseValuesFromFullJson(
                    liveFullJsonValues,
                    fieldNameKey,
                );
                if (fromLiveFullJson.length) {
                    applyOptions(fromLiveFullJson);
                    return;
                }

                const response = await dispatch(
                    getAttributeValues(
                        {
                            attributeName: fieldNameKey,
                            departmentId,
                            clientId,
                            userId,
                            partnerID: 0,
                        },
                        dispatchState,
                        fieldNameKey,
                        null,
                        false,
                    ),
                );

                let options = [];
                if (response?.status) {
                    try {
                        const parsedAudienceBaseData = parseAudienceJson(response?.data, {});
                        const nextLevelParseAudienceBaseData = parseAudienceJson(parsedAudienceBaseData, {});
                        options = Object.keys(nextLevelParseAudienceBaseData);
                    } catch {
                        const attrsValue = parseAudienceJson(response?.data, {});
                        options = Object.keys(parseAudienceJson(attrsValue, {}));
                    }
                }

                applyOptions(options);
            } catch {
                applyOptions([]);
            }
        },
        [
            ListState?.filterLabels,
            ListState?.fullAttributeJSONValues,
            audienceBaseOptionsAPI,
            clientId,
            departmentId,
            dispatch,
            dispatchState,
            userId,
        ],
    );

    const getTriggerAttributeValuesForRuleType = useCallback(
        (selectedRuleType, fldname, overrides = {}) => {
            if (!selectedRuleType?.value || !fldname) {
                return;
            }

            const triggerSource =
                overrides.triggerSource ?? TriggerName ?? getValues(`${fieldName}.TriggerName`);
            const triggerId = triggerSource?.triggerId;

            if (!triggerId) {
                return;
            }

            if (triggerId === COMMUNICATION_NAME_TRIGGER_ID) {
                const payload = {
                    departmentId,
                    clientId,
                    userId,
                    triggerSourceId: triggerId,
                    id: selectedRuleType?.id,
                };
                dispatch(getTrrComm_ChannelValues({ payload, loading: false })).then((res) => {
                    const options = res?.status
                        ? buildChannelOptionsFromCommunicationChannels(res?.data)
                        : [];
                    dispatchState({
                        type: 'UPDATE',
                        field: 'communicationChannelOptions',
                        payload: options,
                    });
                });
                return;
            }

            if (shouldSkipTriggerAttributeValuesApi(triggerId)) {
                return;
            }

            if (!shouldFetchTriggerAttributeValuesForRule(selectedRuleType, triggerId)) {
                return;
            }

            const { formAttributeId = {}, dataAttributeId: listDataAttributeId = {} } = ListState ?? {};
            const levelNo = overrides.levelNo ?? 1;
            const resolvedFormId =
                overrides.formId ??
                overrides.selectedId ??
                formAttributeId?.[triggerId] ??
                '';

            const payload = {
                triggerddlValue: triggerId === 15 ? pages?.value : pages?.id || '',
                attributeName:
                    triggerId === 14 ? selectedRuleType?.fieldName : selectedRuleType?.value,
                triggerSourceId: triggerId,
                fieldType: selectedRuleType?.fieldType ?? selectedRuleType?.fieldtype,
                departmentId,
                clientId,
                userId,
                levelNo,
                formId: resolvedFormId,
                columnName: overrides.columnName ?? '',
            };

            if (overrides.dataAttributeId != null) {
                payload.dataAttributeId = overrides.dataAttributeId;
            } else if (selectedRuleType?.value === 'Attributes' && levelNo === 2) {
                payload.dataAttributeId = listDataAttributeId?.[triggerId] ?? 0;
            }

            if (triggerId === 13 && levelNo === 2 && resolvedFormId && overrides.comparisonValue) {
                payload.columnName = overrides.comparisonValue;
            }

            dispatchTriggerAttributeValues(payload, fldname, selectedRuleType, {
                skipCache: overrides.skipCache,
            });
        },
        [
            TriggerName,
            pages?.id,
            pages?.value,
            departmentId,
            clientId,
            userId,
            fieldName,
            getValues,
            ListState,
            dispatchTriggerAttributeValues,
            dispatch,
            dispatchState,
        ],
    );

    const handleFormSelect = (data = [], fldName, triggerSource) => {
        if (!data?.length || !triggerSource?.triggerId) {
            return;
        }
        const form = data.find((item) => formatName(item?.value) === 'forms');
        if (!form) {
            return;
        }
        setValue(fldName, form);
        getTriggerAttributeValuesForRuleType(form, `${fieldName}.RuleAttributes[0]`, {
            triggerSource,
        });
    };
    return (
        <Fragment>
            {<RenderSwitchButton group={index} title={ruleGroupTitle} />}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h4>{ruleGroupTitle === 'Rule' ? 'Rule Group' : ruleGroupTitle}</h4>
                {index !== 0 && (
                    <div className="groupCloseIcon">
                        <RSTooltip position="top" text="Delete group" className="lh0">
                            <i
                                id="rs_RuleGrouping_closegroup"
                                className={`${delete_medium} icon-md color-primary-red`}
                                onClick={() => {
                                    setWarningShow((prev) => ({
                                        ...prev,
                                        show: true,
                                        text: ARE_YOU_SURE_DELETE,
                                        isDelete: true,
                                    }));
                                }}
                            />
                        </RSTooltip>
                    </div>
                )}
            </div>
            <Row className="mb30 dynamiclistError">
                <Col sm={2}>Match type</Col>
                <Col sm={2} className={`mr76 ${isInteractionDisabled ? 'click-off pe-none' : ''}`}>
                    <div className="d-flex align-items-end h32">
                        <RSRadioButton
                            control={control}
                            name={`${fieldName}.MatchType`}
                            labelName={ALL}
                            id={index + 'ID1'}
                            required
                            handleChange={() => {
                                setValue(`${fieldName}.MatchCount`, '');
                            }}
                        />
                        <RSRadioButton
                            className={`ml45`}
                            control={control}
                            name={`${fieldName}.MatchType`}
                            labelName={ANY}
                            id={index + 'ID2'}
                            required
                            rules={{
                                required: '*',
                            }}
                            handleChange={() => {
                                setValue(`${fieldName}.MatchCount`, '');
                            }}
                        />
                    </div>
                </Col>
                {MatchType === 'Any' && (
                    <Col sm={3} className="ml-23">
                        <RSInput
                            control={control}
                            name={`${fieldName}.MatchCount`}
                            placeholder={DYNAMICLIST_ANY}
                            type={'numbers'}
                            rules={{
                                required: ENTER_TRIGGER_CONDITION,

                                maxLength: {
                                    value: 2,
                                    message: 'Enter a proper value',
                                },
                                validate: (num) => {
                                    const parsedNum = parseInt(num, 10);

                                    if (parsedNum < 1 || parsedNum > 14) {
                                        return 'No. of condition(s) must be between 1 and 14';
                                    }
                                    if (
                                        parsedNum > 0 &&
                                        parsedNum >=
                                        (rule?.RuleAttributes?.length || (0 && rule?.RuleAttributes?.length))
                                    ) {
                                        return 'Enter no. of condition(s) less than trigger attributes';
                                    }

                                    return true;
                                },
                            }}
                            maxLength={2}
                            handleOnchange={() => {
                                handleMandatory();
                            }}
                            onKeyDown={(e) => onlyNumbers(e)}
                            // defaultValue={isUpdate ? 'editListName' : ''}
                            required
                        />
                    </Col>
                )}
            </Row>
            <Row>
                <Col sm={2}>{TRIGGER_SOURCE}</Col>
                <Col sm={9}>
                    <Row>
                        <Col sm={10}>
                            <Row>
                                <Col sm={4}>
                                    <RSKendoDropDownList
                                        control={control}
                                        required
                                        label={TRIGGER_SOURCE}
                                        name={`${fieldName}.TriggerName`}
                                        textField={'triggerName'}
                                        dataItemKey={'triggerId'}
                                        data={modifiedSourceData}
                                        className={`${isInteractionDisabled ? 'click-off pe-none' : ''}`}
                                        handleChange={async (e) => {
                                            const selectedValue = e?.value ?? e?.target?.value;
                                            if (
                                                validateDuplicateTriggerSource(selectedValue, index, allRule) !== true
                                            ) {
                                                setError(`${fieldName}.TriggerName`, {
                                                    type: 'manual',
                                                    message: sameTriggerSourceNotAllowed,
                                                });
                                                return;
                                            } else {
                                                clearErrors(`${fieldName}.TriggerName`);
                                                if (selectedValue?.isDDLExist) {
                                                    triggerPagesAPI.refetch({
                                                        fetcher: () => getTriggerBaseDDL(selectedValue),
                                                        mode: 'create',
                                                        loaderConfig: fieldLoaderConfig,
                                                    });
                                                } else {
                                                    const attributeList = await ruleTypeListAPI.refetch({
                                                        fetcher: () => getTriggerAttributesData(selectedValue),
                                                        mode: 'create',
                                                        loaderConfig: fieldLoaderConfig,
                                                    });
                                                    const isForm = selectedValue?.triggerId === 13;
                                                    if (isForm) {
                                                        handleFormSelect(
                                                            attributeList || [],
                                                            `${fieldName}.RuleAttributes[0].attributeName`,
                                                            selectedValue,
                                                        );
                                                    }
                                                }
                                            }
                                        }}
                                        rules={{
                                            required: SELECT_TRIGGER_SOURCE,
                                            validate: {
                                                duplicateTrigger: (value) =>
                                                    validateDuplicateTriggerSource(value, index, allRule),
                                            },
                                        }}
                                        disabled={!!TriggerName && !checkErrorExist()}
                                        isLoading={isTriggerSourceLoading}
                                    />
                                </Col>

                                {TriggerName?.isDDLExist === 1 && !checkErrorExist() && (
                                    <Col sm={8}>
                                        <RSKendoDropDownList
                                            control={control}
                                            required
                                            label={
                                                TriggerName?.triggerName === 'Mobile App'
                                                    ? APP_NAME
                                                    : URL
                                            }
                                            name={`${fieldName}.pages`}
                                            textField={'value'}
                                            dataItemKey={'id'}
                                            rules={{
                                                required:
                                                    TriggerName?.triggerName === 'Mobile App'
                                                        ? SELECT_APP
                                                        : SELECT_INPUT_Domain,
                                            }}
                                            data={triggerPagesOptions}
                                            className={`${isInteractionDisabled ? 'click-off pe-none' : ''}`}
                                            isLoading={isPagesLoading}
                                            handleChange={(e) => {
                                                ruleTypeListAPI.refetch({
                                                    fetcher: () => getTriggerAttributesData(TriggerName, e.value),
                                                    mode: 'create',
                                                    loaderConfig: fieldLoaderConfig,
                                                });
                                            }}
                                            disabled={!!pages || isPagesLoading}
                                            footer={
                                                TriggerName?.triggerName === 'Mobile App' ||
                                                    TriggerName?.triggerName === 'Website' ? (
                                                    <NewAttributeBtn
                                                        title={
                                                            TriggerName?.triggerName === 'Mobile App'
                                                                ? ADD_MOBILE_APP
                                                                : ADD_WEB_DOMAIN
                                                        }
                                                        handleModalAttribute={() => {
                                                            const isMobileApp =
                                                                TriggerName?.triggerName === 'Mobile App';
                                                            const navState = createCommunicationSettingsNavState(
                                                                'notification',
                                                                {
                                                                    mode: 'add',
                                                                    subfrom: isMobileApp ? 'MP' : 'WP',
                                                                    notificationTabId: isMobileApp
                                                                        ? NOTIFICATION_TAB_ID.MOBILE
                                                                        : NOTIFICATION_TAB_ID.WEB,
                                                                    ...(isMobileApp
                                                                        ? { mobileTabId: 'appsList' }
                                                                        : { webTabId: 'web' }),
                                                                    backAction: window.location.search,
                                                                },
                                                                locationState,
                                                                getValues,
                                                            );
                                                            navigate(
                                                                `/preferences/communication-settings?q=${encodeUrl(navState)}`,
                                                                { state: {} },
                                                            );
                                                        }}
                                                    />
                                                ) : null
                                            }
                                        />
                                    </Col>
                                )}
                            </Row>
                        </Col>
                        {TriggerName && !checkErrorExist() && (
                            <Col sm={2} className="pl0">
                                <div className="fg-icons mt9">
                                    <RSTooltip text={RESET} position="top">
                                        <div className={`${isInteractionDisabled ? 'click-off pe-none' : ''}`}>
                                            <i
                                                onClick={() => {
                                                    setShowReset({
                                                        show: true,
                                                        type: 'reset',
                                                        index: 0,
                                                    });
                                                }}
                                                className={`${restart_medium}  icon-md color-primary-blue`}
                                                id="rs_data_refresh"
                                            ></i>
                                        </div>
                                    </RSTooltip>
                                </div>
                            </Col>
                        )}
                    </Row>
                </Col>
            </Row>
            {(TriggerName?.isDDLExist !== 0 ? !!pages : TriggerName) && (
                <Row className="triggerRules">
                    <Col sm={{ span: 10, offset: 2 }}>
                        {typeFields.map((attr, idx) => {

                            const currentAttr = RuleAttributes[idx];
                            const isCustomEventsContains =
                                currentAttr?.attributeComparison === 'Contains' &&
                                currentAttr?.attributeName?.value === 'Custom events';
                            const hasRecencyFrequency =
                                !!currentAttr?.attributeComparison &&
                                !!currentAttr?.attributeName?.isRecencyFrequency;



                            const isCustomEvent = currentAttr?.attributeName?.value === 'Custom events';

                            const commonProps = {
                                attribute: currentAttr,
                                isClickOff: isInteractionDisabled,
                                index: idx,
                                name: `${fieldName}.RuleAttributes[${idx}]`,
                                fieldName,
                                TriggerName,
                                pages,
                                setDuplicateRule,
                                formId: attr.formId,
                                controllEditModeApiCall,
                                typeRemove,
                                typeUpdate,
                                title,
                                setErrorGroup,
                                errorCustomGroup,
                                setErrorCustomGroup,
                                currentRuleIndex: index,
                                clearAttributeCustom: () => {
                                    attributeCustomFieldActionsRef.current[idx]?.replace?.([]);
                                    attributeCustomFieldActionsRef.current[idx]?.clearErrors?.();
                                },
                                className: isCustomEvent
                                    ? TriggerName?.triggerId >= 9 && TriggerName?.triggerId <= 11
                                        ? 'click-off'
                                        : ''
                                    : TriggerName?.triggerId === 9 || TriggerName?.triggerId === 11
                                        ? 'click-off align-items-end'
                                        : '',
                                fieldType: isCustomEvent
                                    ? currentAttr?.attributeName?.FieldType || ''
                                    : currentAttr?.attributeName?.fieldtype || '',
                                getTriggerAttributeValuesForRuleType,
                                ...customEventFieldProps,
                            };

                            const renderFieldNode = <RenderField {...commonProps} />;

                            return (
                                <Row
                                    key={attr.id}
                                    className={`align-items-start ${isCustomEventsContains
                                        ? 'customEventGroup'
                                        : ''
                                        }`}
                                >
                                    {/* duplicate error custom event  new flow */}
                                    {duplicateRule?.show &&
                                        duplicateRule?.index === idx &&
                                        title === errorGroup &&
                                        !duplicateRule?.isCustomDuplicateError && (
                                            <span className="mb20 color-primary-red">
                                                Duplicate entries are not allowed
                                            </span>
                                        )}
                                    <Col sm={9}>
                                        <Row
                                            className={`align-items-start ${isCustomEventsContains
                                                ? 'customEventRow first'
                                                : ''
                                                }`}
                                        >
                                            <Col
                                                sm={4}
                                                className={`${isCustomEventsContains
                                                    ? 'customEventColoum4'
                                                    : ''
                                                    }`}
                                                title={currentAttr?.attributeName?.value || 'Select rule type'}
                                            >
                                                <RSKendoDropDownList
                                                    control={control}
                                                    name={`${fieldName}.RuleAttributes[${idx}].attributeName`}
                                                    textField="value"
                                                    dataItemKey="id"
                                                    label="Rule type"
                                                    required
                                                    isTagRender
                                                    isLoading={isRuleTypeListLoading}
                                                    // data={triggerAttributes[TriggerName.triggerId]}
                                                    data={handleDropDownValuesFormOrEventBrite(idx)}
                                                    className={`${isInteractionDisabled ? 'click-off pe-none' : ''}`}
                                                    rules={{
                                                        required: SELECT_Rule_Type,
                                                        validate: (value) =>
                                                            value?.value !== '' || SELECT_Rule_Type,
                                                    }}
                                                    handleChange={(e) => {
                                                        if (controllEditModeApiCall) {
                                                            return;
                                                        }
                                                        const selectedRuleType = e?.value ?? e?.target?.value;
                                                        const value = selectedRuleType?.value;
                                                        const ruleAttributePath = `${fieldName}.RuleAttributes[${idx}]`;
                                                        setControllEditModeApiCall(false);
                                                        const updateValue = formatName(value);
                                                        const isForm = TriggerName?.triggerId === 13;
                                                        const isEventBrite = TriggerName?.triggerId === 27;
                                                        if (
                                                            (TriggerName?.triggerId === 13 &&
                                                                idx === 0 &&
                                                                formatName(updateValue) !== 'forms') ||
                                                            (TriggerName?.triggerId === 27 &&
                                                                idx === 0 &&
                                                                updateValue !== 'eventbrite')
                                                        ) {
                                                            setWarningShow((prev) => ({
                                                                ...prev,
                                                                show: true,
                                                                text: `Select ${isEventBrite ? 'Event brite' : 'Forms'
                                                                    } before ${value}`,
                                                                isDelete: false,
                                                            }));

                                                            dispatchState({
                                                                type: 'UPDATE',
                                                                payload: true,
                                                                field: 'formAttributes',
                                                            });
                                                        } else {
                                                            dispatchState({
                                                                type: 'UPDATE',
                                                                payload: false,
                                                                field: 'formAttributes',
                                                            });
                                                        }
                                                        resetField(
                                                            `${fieldName}.RuleAttributes[${idx}].attributeComparison`,
                                                        );
                                                        resetField(
                                                            `${fieldName}.RuleAttributes[${idx}].attributeValue`,
                                                        );
                                                        resetField(`${fieldName}.RuleAttributes[${idx}].attributeFrom`);
                                                        resetField(`${fieldName}.RuleAttributes[${idx}].attributeTo`);
                                                        resetField(
                                                            `${fieldName}.RuleAttributes[${idx}].attributeMultipleValues`,
                                                        );

                                                        setValue(
                                                            `${fieldName}.RuleAttributes[${idx}].attributeMultipleValues`,
                                                            [],
                                                        );
                                                        setValue(
                                                            `${fieldName}.RuleAttributes[${idx}].attributeValue`,
                                                            '',
                                                        );
                                                        resetField(
                                                            `${fieldName}.RuleAttributes[${idx}].attributeValue`,
                                                        );
                                                        unregister(
                                                            `${fieldName}.RuleAttributes[${idx}].attributeValue`,
                                                        );
                                                        unregister(
                                                            `${fieldName}.RuleAttributes[${idx}].attributeComparison`,
                                                        );
                                                        const isSubscriptionFormAttributes =
                                                            isForm && updateValue === 'attributes';
                                                        if (isSubscriptionFormAttributes) {
                                                            dispatchState({
                                                                type: 'CLEAR_FIELD_TRIGGER_VALUES_KEYS',
                                                                payload: {
                                                                    keys: [
                                                                        buildFieldTriggerValuesKey(
                                                                            ruleAttributePath,
                                                                            '2D',
                                                                            1,
                                                                        ),
                                                                        buildFieldTriggerValuesKey(
                                                                            ruleAttributePath,
                                                                            '2D',
                                                                            2,
                                                                        ),
                                                                    ],
                                                                },
                                                            });
                                                            getTriggerAttributeValuesForRuleType(
                                                                selectedRuleType,
                                                                ruleAttributePath,
                                                                {
                                                                    levelNo: 1,
                                                                    formId:
                                                                        ListState?.formAttributeId?.[
                                                                        TriggerName?.triggerId
                                                                        ],
                                                                    skipCache: true,
                                                                },
                                                            );
                                                        } else if (TriggerName?.triggerId === 14) {
                                                            handleAudienceBaseApi(selectedRuleType, ruleAttributePath);
                                                        } else if (
                                                            shouldFetchTriggerValuesForRuleType(
                                                                selectedRuleType,
                                                                ruleAttributePath,
                                                            )
                                                        ) {
                                                            getTriggerAttributeValuesForRuleType(
                                                                selectedRuleType,
                                                                ruleAttributePath,
                                                            );
                                                        }
                                                        queueMicrotask(() => handleDuplicateCheck());
                                                    }}
                                                    handleOnBlur={() => {
                                                        handleDuplicateCheck();
                                                    }}
                                                    footer={
                                                        (TriggerName?.triggerId === 9 ||
                                                            TriggerName?.triggerId === 14) && (
                                                            <NewAttributeBtn
                                                                title={
                                                                    TriggerName?.triggerId === 9
                                                                        ? ADD_TARGET_LIST
                                                                        : 'Add audience base'
                                                                }
                                                                handleModalAttribute={() => {
                                                                    TriggerName?.triggerId === 9
                                                                        ? navigate('/audience/create-target-list', {
                                                                            state: {
                                                                                mode: 'add',
                                                                                ...handleCustomNavigationDetails({
                                                                                    ...locationState,
                                                                                    ...getValues(),
                                                                                }),
                                                                            },
                                                                        })
                                                                        : navigate('/preferences/data-catalogue', {
                                                                            state: {
                                                                                tab: 1,
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
                                            {isCustomEvent ? (
                                                renderFieldNode
                                            ) : (
                                                <Col sm={8} className={formAttributes ? 'click-off' : ''}>
                                                    {renderFieldNode}
                                                </Col>
                                            )}
                                        </Row>
                                        <CustomEvents
                                            fieldName={fieldName}
                                            ruleAttributeIndex={idx}
                                            currentAttr={currentAttr}
                                            commonProps={commonProps}
                                            customState={customState}
                                            title={title}
                                            duplicateRule={duplicateRule}
                                            errorGroup={errorGroup}
                                            errorCustomGroup={errorCustomGroup}
                                            attributeCustomFieldActionsRef={attributeCustomFieldActionsRef}
                                        />
                                    </Col>
                                    <Col
                                        sm={2}
                                        className={`triggerAddRemoveIcon pl0 gap-2 d-flex gap-3 ${isCustomEventsContains ? 'pt30' : 'rule-type-icons-offset'
                                            }`}
                                    >
                                        <div className="trigger-action-icons d-flex align-items-center gap-2">
                                            {RuleAttributes[idx]?.attributeName?.value === 'Location URL' && (
                                                <i
                                                    className={`${map_medium} icon-md color-primary-blue`}
                                                    onClick={() =>
                                                        setValueModal({
                                                            timer: false,
                                                            map: true,
                                                            analytics: false,
                                                            currentRuleTypeIndex: idx,
                                                        })
                                                    }
                                                />
                                            )}

                                            {!!currentAttr?.attributeComparison &&
                                                !!currentAttr?.attributeName?.isPeriod ? (
                                                <RSKendoDropDownList
                                                    control={control}
                                                    label={'Periods'}
                                                    name={`${fieldName}.RuleAttributes[${idx}].isPeroidValue`}
                                                    data={periodRangeValues}
                                                    textField={'value'}
                                                    dataItemKey={'key'}
                                                    handleOnBlur={() => {
                                                        handleDuplicateCheck();
                                                    }}
                                                />
                                            ) : null}
                                            {hasRecencyFrequency ? (
                                                <RSTooltip text={'Recency'} position="top" className="lh0">
                                                    <i
                                                        className={`${timer_medium} icon-md color-primary-blue`}
                                                        onClick={() => {
                                                            void ensureTimeZoneDetail?.();
                                                            setValueModal({
                                                                timer: true,
                                                                map: false,
                                                                analytics: false,
                                                                currentRuleTypeIndex: idx,
                                                            });
                                                        }}
                                                        id="rs_RuleGrouping_timer"
                                                    />
                                                </RSTooltip>
                                            ) : null}

                                            <div
                                                className={`d-flex align-items-center flex-nowrap ${isCustomEventsContains ? '' : 'fg-icons'
                                                    }`}
                                            >
                                                <RSTooltip
                                                    text={idx === 0 ? 'Add rule type' : 'Remove rule type'}
                                                    position="top"
                                                    className="lh0"
                                                >
                                                    <div className={`${isInteractionDisabled ? 'click-off pe-none' : ''}`}>
                                                        <i
                                                            className={`${selectIcon(idx)} ${RuleAttributes?.length > RULE_ATTRIBUTES_LENGTH_CONFIG &&
                                                                !idx
                                                                ? 'click-off'
                                                                : ''
                                                                } icon-md`}
                                                            onClick={() => {
                                                                dispatchState({
                                                                    type: 'UPDATE_FORM_DROP_DOWN',
                                                                    payload: false,
                                                                });
                                                                if (idx === 0) {
                                                                    addAttribute(idx, title);
                                                                } else {
                                                                    setShowReset({
                                                                        show: true,
                                                                        type: 'remove',
                                                                        index: idx,
                                                                    });
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </RSTooltip>
                                                {TriggerName?.triggerName === 'Website' && RuleAttributes[idx]?.attributeName?.value === 'Custom events' && (
                                                    <div className="ml10">
                                                        <RSTooltip text={CLICK_TO_CONFIGURE} position="top">
                                                            <i
                                                                className={`${event_tracking_medium} icon-md color-primary-blue cursor-pointer`}
                                                                onClick={() => setShowTrackingAgreement(true)}
                                                            />
                                                        </RSTooltip>
                                                    </div>
                                                )}
                                                {MatchType === 'Any' && (
                                                    <RSTooltip text={'Mandatory'} position="top" className="cp ml15">
                                                        <div
                                                            className={
                                                                // mandatory[TriggerName?.triggerId]?.includes(idx)
                                                                getValues(`${ruleAttributes}[${idx}].mandatory`)
                                                                    ? `color-primary-red font-lg cp`
                                                                    : `color-primary-blue font-lg cp`
                                                            }
                                                            onClick={() => {
                                                                let temp =
                                                                    !!mandatory[TriggerName?.triggerId] &&
                                                                        mandatory[TriggerName?.triggerId]?.length !== 0
                                                                        ? [...mandatory[TriggerName?.triggerId]]
                                                                        : [];
                                                                if (temp?.includes(idx)) {
                                                                    let findIndex = _findIndex(
                                                                        temp,
                                                                        (item) => item === idx,
                                                                    );
                                                                    temp?.splice(findIndex, 1);
                                                                    setValue(`${ruleAttributes}[${idx}].mandatory`, false);
                                                                } else {
                                                                    if (temp?.length < rule?.MatchCount) {
                                                                        temp.push(idx);
                                                                        setValue(
                                                                            `${ruleAttributes}[${idx}].mandatory`,
                                                                            true,
                                                                        );
                                                                    } else {
                                                                        setValue(
                                                                            `${ruleAttributes}[${temp[temp?.length - 1]
                                                                            }].mandatory`,
                                                                            false,
                                                                        );
                                                                        temp.splice(temp?.length - 1, 1, idx);
                                                                        setValue(
                                                                            `${ruleAttributes}[${idx}].mandatory`,
                                                                            true,
                                                                        );
                                                                    }
                                                                }
                                                                dispatchState({
                                                                    type: 'UPDATE_MANDATORY',
                                                                    payload: temp,
                                                                    field: `${TriggerName?.triggerId}`,
                                                                });
                                                            }}
                                                        >
                                                            <i className={`${mandatory_mini} font-xxs`}></i>
                                                        </div>
                                                    </RSTooltip>
                                                )}
                                            </div>
                                        </div>
                                    </Col>
                                    {currentAttr?.attributeName?.fieldName &&
                                        currentAttr?.attributeName?.isAnnualReminder ? (
                                        <div className="align-items-center d-flex ">
                                            <small>{MARKED_ANNUAL_REMAINDER}</small>
                                            <span>
                                                <RSPPophover
                                                    position="top"
                                                    className="rs-tooltip-text-multi"
                                                    text={DYNAMIC_ANNUAL_REMINDER_CONTENT}
                                                >
                                                    <i
                                                        className={`${circle_question_mark_mini} icon-xs blue cp color-primary-blue ml10`}
                                                        id="circle_question_mark"
                                                    ></i>
                                                </RSPPophover>
                                            </span>
                                        </div>
                                    ) : null}
                                    {/* )} */}
                                </Row>
                            );
                        })}
                    </Col>
                </Row>
            )}
            {valueModal?.timer ? (
                <TimerModal
                    show={valueModal.timer}
                    handleClose={() =>
                        setValueModal({
                            timer: false,
                            map: false,
                            analytics: false,
                            currentRuleTypeIndex: 0,
                        })
                    }
                    name={`${fieldName}.RuleAttributes[${valueModal?.currentRuleTypeIndex}]`}
                />
            ) : null}
            {warningShow?.show && <WarningModal
                show={warningShow?.show}
                handleClose={() => {
                    setWarningShow((prev) => ({
                        ...prev,
                        show: false,
                        isDelete: false,
                    }));
                }}
                removeRule={() => removeRule(index, warningShow?.isDelete)}
                value={warningShow?.text}
                isFooter={true}
                header={CONFIRMATION}
            />}
            {valueModal?.map ? (
                <MapModal
                    show={valueModal.map}
                    handleClose={() =>
                        setValueModal({
                            timer: false,
                            map: false,
                            analytics: false,
                            currentRuleTypeIndex: 0,
                        })
                    }
                    name={`${fieldName}.RuleAttributes[${valueModal?.currentRuleTypeIndex}]`}
                />
            ) : null}
            {showReset?.show && (
                <RSConfirmationModal
                    header={showReset?.type === 'reset' ? RESET : REMOVE}
                    show={showReset?.show}
                    text={
                        showReset?.type === 'reset'
                            ? ARE_YOU_SURE_WANT_TO_RESET
                            : ARE_YOU_SURE_REMOVE
                    }
                    primaryButtonText={OK}
                    isBorder
                    handleClose={() => {
                        setShowReset({
                            show: false,
                            type: '',
                            index: 0,
                        });
                    }}
                    handleConfirm={(status) => {
                        if (status) {
                            if (showReset?.type === 'reset') {
                                dispatchState({
                                    type: 'CLEAR_RULE_FIELD_TRIGGER_VALUES',
                                    payload: { ruleIndex: index },
                                });
                                resetField(`${fieldName}.TriggerName`);
                                resetField(`${fieldName}.RuleAttributes`);

                                resetField(`${fieldName}.pages`);
                                // reset((prev) => ({
                                //     ...prev,
                                //     [`${fieldName}.TriggerName`]: '',
                                //     [`${fieldName}.RuleAttributes`]: [
                                //         {
                                //             attributeName: '',
                                //             attributeValue: '',
                                //             attributeType: '',
                                //             attributeMultipleValues: [],
                                //             attributeComparison: '',
                                //             attributeTo: '',
                                //             attributeCustom: [],
                                //             mandatory: false,
                                //         },
                                //     ],
                                //     [`${fieldName}.pages`]: '',
                                // }));
                                setValue(`${fieldName}.TriggerName`, '');
                                setValue(`${fieldName}.RuleAttributes`, [
                                    {
                                        attributeName: '',
                                        attributeValue: '',
                                        attributeType: '',
                                        attributeMultipleValues: [],
                                        attributeComparison: '',
                                        attributeTo: '',
                                        attributeCustom: [],
                                        mandatory: false,
                                    },
                                ]);

                                setValue(`${fieldName}.pages`, '');
                                setDuplicateRule({
                                    show: false,
                                    idx: null,
                                });
                                clearErrors();
                            } else {
                                addAttribute(showReset?.index, title);
                            }
                            setShowReset({
                                show: false,
                                type: '',
                                index: 0,
                            });
                        }
                    }}
                />
            )}
            <RSModal
                settings={{ animation: false }}
                show={showTrackingAgreement}
                handleClose={() => setShowTrackingAgreement(false)}
                header={'Custom event tracking'}
                size="lg"
                body={
                    <div>
                        <p>
                            By proceeding, you acknowledge that Custom event tracking is supported only with static IDs.
                            Dynamic IDs are not supported and may result in unreliable event tracking.
                            You are solely responsible for the accuracy and integrity of all captured data and events.
                        </p>
                    </div>
                }
                footer={
                    <div className="d-flex gap-2">
                        <RSSecondaryButton
                            type="button"
                            onClick={() => setShowTrackingAgreement(false)}
                        >
                            Disagree
                        </RSSecondaryButton>
                        <RSPrimaryButton
                            type="button"
                            onClick={() => {
                                setShowTrackingAgreement(false);
                                handleEventTrackSubmit();
                            }}
                        >
                            I Agree
                        </RSPrimaryButton>
                    </div>
                }
            />
            <RSAlert
                show={isShowAlert}
                header={false}
                containerClass="py0"
                body={
                    <div className="d-flex align-items-center justify-content-center">
                        <div>
                            <img src={ScriptBlock} alt="scriptBlock" width={100} height={100} />
                        </div>
                        <div className="my20">
                            <h1 className="mb0">{WAITING_FOR_EVENT_SET}</h1>
                        </div>
                        <div className="ml30">
                            <RSPrimaryButton
                                id="proceedBtnCustomEvent"
                                onClick={() => {
                                    setShowAlert(false);
                                }}
                            >
                                Proceed
                            </RSPrimaryButton>
                        </div>
                    </div>
                }
            />
        </Fragment>
    );
};

export default memo(RuleGrouping);
