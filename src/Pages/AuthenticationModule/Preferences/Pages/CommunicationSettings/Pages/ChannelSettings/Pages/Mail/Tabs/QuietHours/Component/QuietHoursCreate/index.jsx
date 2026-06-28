import { BACK, CANCEL, CHANNEL, QUIET_HOURS_ACCOUNT_TIMEZONE_NOTE, QUIET_HOURS_ADD_RULE, QUIET_HOURS_BOTH_MESSAGE_WARNING, QUIET_HOURS_BRAND_SHORTER_THAN_REGULATORY, QUIET_HOURS_COUNTRY_REGION, QUIET_HOURS_DAYS_OF_WEEK, QUIET_HOURS_DISCARD, QUIET_HOURS_DUPLICATE_RULE, QUIET_HOURS_EDIT_RULE, QUIET_HOURS_MESSAGE_TYPE, QUIET_HOURS_PRIORITY_OVERRIDE, QUIET_HOURS_PRIORITY_OVERRIDE_TOOLTIP, QUIET_HOURS_PROMO_DELIVERY_NOTE, QUIET_HOURS_QUEUE_AND_SEND, QUIET_HOURS_QUEUE_EXPIRY, QUIET_HOURS_SELECT_DAYS_REQUIRED, QUIET_HOURS_STATUS_OFF, QUIET_HOURS_STATUS_ON, QUIET_HOURS_SUPPRESSION_BEHAVIOUR, QUIET_HOURS_USA_TCPA_BOTH_WARNING, QUIET_HOURS_VIEW_RULE, QUIET_HOURS_WINDOW_END, QUIET_HOURS_WINDOW_START, RULENAME, SAVE, UNABLE_TOLOAD_DATA } from 'Constants/GlobalConstant/Placeholders';
import { circle_question_mark_mini } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useForm, useWatch, Controller, FormProvider } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import ListNameExists from 'Components/ListNameExists';
import RSInput from 'Components/FormFields/RSInput';
import RSTimePicker from 'Components/FormFields/RSTimePicker';
import RSRadioButton from 'Components/FormFields/RSRadioButton';
import RSTooltip from 'Components/RSTooltip';
import RSSwitch from 'Components/FormFields/RSSwitch';
import RSPPophover from 'Components/RSPPophover';
import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';
import RSAlertWarning from 'Components/RSAlertWarning';
import { CommunicationSettingsQuietHoursEditSkeletonGate } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';

import { getUserDetails } from 'Utils/modules/crypto';
import { getSessionId } from 'Reducers/globalState/selector';
import {
    checkQuietHoursNameExists,
    duplicateQuietHoursSettings,
    getQuietHoursLookups,
    getQuietHoursSettings,
    getQuietHoursSettingsById,
    upsertQuietHoursSettings,
} from 'Reducers/preferences/CommunicationSettings/request';
import { QuietHoursProvider } from '../..';
import {
    API_RULE_TYPES,
    BEHAVIOR_OPTIONS,
    EMPTY_LOOKUPS,
    QUIET_HOURS_API_KEYS,
    QUIET_HOURS_CHANNEL_KEYS,
    RULE_TYPES,
    WEEK_DAY_OPTIONS,
    buildQuietHoursByIdPayload,
    buildQuietHoursDuplicatePayload,
    buildQuietHoursListPayload,
    buildQuietHoursLookupsPayload,
    buildQuietHoursUpsertPayload,
    buildSuggestedDuplicateRuleName,
    alignQuietHoursFormLookups,
    extractQuietHoursDetailData,
    extractRegulatoryRowsFromList,
    isUsaQuietHoursRegion,
    getBrandCountryOptions,
    getChannelOptionForKey,
    isQuietHoursAdminRole,
    getFormInitialState,
    getRegulatoryCountryOptions,
    hasQuietHoursDaysSelected,
    isDiscardBehavior,
    isQueueBehaviorValue,
    isBothMessageTypeCode,
    mapQuietHoursDetailToForm,
    normalizeQuietHoursLookupResponse,
    parseQuietHoursApiResponse,
    validateBrandWindowAgainstRegulatory,
    QUIET_HOURS_BOTH_BEHAVIOR_TOOLTIP,
    QUIET_HOURS_REGULATORY_READONLY_TOOLTIP,
    validateQuietHoursWindowEndField,
    validateQuietHoursWindowStartField,
    validateQuietHoursRuleName,
    isQuietHoursWindowEndBeforeStartError,
} from '../../constant';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';


import { handleQuietHoursApiFailure, QuietHoursValidationModal } from '../../quietHoursApiError';

const wrapQuietHoursDisabledControl = (node, { disabled, tooltip }) => {
    if (!disabled || !tooltip) {
        return node;
    }

    return (
        <RSTooltip text={tooltip} position="top" className="d-inline-block">
            <span className="pe-none click-off d-inline-block">{node}</span>
        </RSTooltip>
    );
};

const QuietHoursCreate = ({ config, type, handleCancel, setFailedApi }) => {
    const context = useContext(QuietHoursProvider);
    const dispatch = useDispatch();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const gridRow = config || context?.gridCreate?.quietHoursAction?.edit?.editState || {};
    const channelKey = context?.channelKey || QUIET_HOURS_CHANNEL_KEYS.EMAIL;
    const channelId = context?.channelId;
    const embedded = context?.embedded;

    const isDuplicate = type === 'duplicate';
    const isCreate = type === 'create' || isDuplicate;
    const isUpdate = type === 'edit' && Boolean(gridRow?.ruleId);

    const roleId = getUserDetails()?.roleId;
    const isAdmin = isQuietHoursAdminRole(roleId);

    const [ruleMeta, setRuleMeta] = useState({
        ruleType: gridRow?.ruleType || RULE_TYPES.BRAND,
        ruleId: gridRow?.ruleId,
        sourceRuleId: isDuplicate ? gridRow?.ruleId : undefined,
    });
    const [lookups, setLookups] = useState(EMPTY_LOOKUPS);
    const [lookupsError, setLookupsError] = useState('');
    const [initialRuleName, setInitialRuleName] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [regulatoryBaselines, setRegulatoryBaselines] = useState([]);
    const [validationModal, setValidationModal] = useState({ show: false, message: '' });

    const showValidationModal = useCallback((message) => {
        if (!message) return;
        setValidationModal({ show: true, message });
    }, []);

    const closeValidationModal = useCallback(() => {
        setValidationModal({ show: false, message: '' });
    }, []);

    const pageLoadApi = useApiLoader({
        autoFetch: false,
        loaderConfig: fieldLoaderConfig,
        mode: isUpdate || isDuplicate ? 'edit' : 'create',
    });
    const saveApi = useApiLoader({
        autoFetch: false,
        loaderConfig: fieldLoaderConfig,
        mode: isUpdate ? 'edit' : 'create',
    });
    const isSaveLoading = saveApi.isFetching;
    const isPageLoading = pageLoadApi.isFetching;

    const isRegulatory = ruleMeta.ruleType === RULE_TYPES.REGULATORY;
    const isRegulatoryViewOnly = isRegulatory && isUpdate;
    const isEditMode = !isRegulatory && isUpdate;
    const isReadOnly = isRegulatoryViewOnly;
    const showRegulatoryRequired = isRegulatoryViewOnly;
    const showNameExistsCheck = !isReadOnly && !isRegulatory && (isCreate || isEditMode);

    const methods = useForm(getFormInitialState(EMPTY_LOOKUPS));
    const {
        control,
        handleSubmit,
        reset,
        setValue,
        getValues,
        trigger,
        setError,
        clearErrors,
        formState: { isValid },
        getFieldState,
    } = methods;
    const hasUiValidationErrors = !isValid;

    const behavior = useWatch({ control, name: 'behavior' });
    const messageType = useWatch({ control, name: 'messageType' });
    const countryRegion = useWatch({ control, name: 'countryRegion' });
    const daysCustomValue = useWatch({ control, name: 'daysCustom' });
    const windowStartValue = useWatch({ control, name: 'windowStart' });
    const windowEndValue = useWatch({ control, name: 'windowEnd' });
    const windowEndInteractionAfterInvalidPairRef = useRef(false);

    const applyInvalidWindowPairReset = useCallback(
        (start, end) => {
            const pairError = validateQuietHoursWindowStartField(start, end);
            if (!isQuietHoursWindowEndBeforeStartError(pairError)) {
                return false;
            }
            windowEndInteractionAfterInvalidPairRef.current = false;
            clearErrors('windowEnd');
            setValue('windowEnd', null, { shouldValidate: false, shouldTouch: false, shouldDirty: true });
            setError('windowStart', { type: 'invalidPair', message: pairError });
            return true;
        },
        [clearErrors, setError, setValue],
    );

    const runWindowFieldValidation = useCallback(() => {
        window.setTimeout(() => {
            const start = getValues('windowStart');
            const end = getValues('windowEnd');
            if (start != null && end != null) {
                if (applyInvalidWindowPairReset(start, end)) {
                    return;
                }
                void trigger(['windowStart', 'windowEnd']);
                return;
            }
            const startFieldError = getFieldState('windowStart').error;
            if (start != null && startFieldError?.type !== 'invalidPair') {
                void trigger('windowStart');
            } else if (start == null) {
                void trigger('windowStart');
            }
            if (end != null) {
                void trigger('windowEnd');
            } else if (getFieldState('windowStart').error?.type !== 'invalidPair') {
                void trigger('windowEnd');
            }
        }, 0);
    }, [applyInvalidWindowPairReset, getFieldState, getValues, trigger]);

    useEffect(() => {
        if (isReadOnly || isRegulatory) return;
        runWindowFieldValidation();
    }, [windowStartValue, windowEndValue, isReadOnly, isRegulatory, runWindowFieldValidation]);
    const isQueueBehavior = isQueueBehaviorValue(behavior);
    const isBothMessageType = isBothMessageTypeCode(messageType);
    const showUsaTcpaBothWarning = isBothMessageType && isUsaQuietHoursRegion(countryRegion);
    const isBehaviorDisabled = isReadOnly || isRegulatory || isBothMessageType;
    const isQueueExpiryDisabled = isReadOnly || isRegulatory;
    const behaviorDisabledTooltip = isBothMessageType ? QUIET_HOURS_BOTH_BEHAVIOR_TOOLTIP : '';
    const queueExpiryDisabledTooltip =
        isReadOnly || isRegulatory ? QUIET_HOURS_REGULATORY_READONLY_TOOLTIP : '';

    const brandCountryOptions = getBrandCountryOptions(lookups.countryRegions);
    const regulatoryCountryOptions = getRegulatoryCountryOptions(lookups.countryRegions);
    const countryOptions = isRegulatory ? regulatoryCountryOptions : brandCountryOptions;

    const pageTitle = isRegulatoryViewOnly
        ? QUIET_HOURS_VIEW_RULE
        : isDuplicate
            ? QUIET_HOURS_DUPLICATE_RULE
            : isEditMode
                ? QUIET_HOURS_EDIT_RULE
                : QUIET_HOURS_ADD_RULE;

    const fetchLookups = useCallback(async () => {
        try {
            const response = await dispatch(
                getQuietHoursLookups(
                    buildQuietHoursLookupsPayload({
                        clientId,
                        userId,
                        departmentId,
                            channelId,
                        includeAllCountries: true,
                    }),
                ),
            );
            const { status, countryRegions, messageTypes, queueExpiryOptions, message } =
                normalizeQuietHoursLookupResponse(response);

            if (status && (countryRegions.length || messageTypes.length || queueExpiryOptions.length)) {
                const mapped = { countryRegions, messageTypes, queueExpiryOptions };
                setLookups(mapped);
                return { data: mapped, success: true };
            }

            setLookups(EMPTY_LOOKUPS);
            return { data: EMPTY_LOOKUPS, success: false, message };
        } catch {
            setLookups(EMPTY_LOOKUPS);
            return { data: EMPTY_LOOKUPS, success: false };
        }
    }, [clientId, departmentId, dispatch, userId]);

    const fetchRegulatoryBaselines = useCallback(async () => {
        const response = await dispatch(
            getQuietHoursSettings(
                buildQuietHoursListPayload({
                    clientId,
                    userId,
                    departmentId,
                    channelId,
                    pageNo: 1,
                    pageSize: 500,
                }),
            ),
        );
        const { status, data } = parseQuietHoursApiResponse(response);
        if (!status) return [];
        return extractRegulatoryRowsFromList(data);
    }, [channelId, clientId, departmentId, dispatch, userId]);

    const resolveGridRuleTypeApi = useCallback(() => {
        const ruleTypeRaw =
            gridRow?.ruleType === RULE_TYPES.REGULATORY
                ? API_RULE_TYPES.REGULATORY
                : gridRow?.raw?.ruleType ?? gridRow?.ruleType;
        return String(ruleTypeRaw || API_RULE_TYPES.BRAND).toUpperCase() === API_RULE_TYPES.REGULATORY
            ? API_RULE_TYPES.REGULATORY
            : API_RULE_TYPES.BRAND;
    }, [gridRow?.raw?.ruleType, gridRow?.ruleType]);

    const applyDetailToForm = useCallback(
        (detailData, lookupData) => {
            if (!detailData) return false;

            try {
                let formValues = mapQuietHoursDetailToForm(detailData, lookupData);
                formValues = alignQuietHoursFormLookups(formValues, lookupData, {
                    isRegulatory: formValues.ruleType === RULE_TYPES.REGULATORY,
                });

                const sourceRuleId = formValues.ruleId;
                const duplicateName = isDuplicate
                    ? buildSuggestedDuplicateRuleName(formValues.ruleName)
                    : formValues.ruleName;

                setRuleMeta({
                    ruleType: isDuplicate ? RULE_TYPES.BRAND : formValues.ruleType,
                    ruleId: isDuplicate ? undefined : formValues.ruleId,
                    sourceRuleId: isDuplicate ? sourceRuleId : undefined,
                });
                setInitialRuleName(isDuplicate ? '' : formValues.ruleName || '');
                reset({
                    ...formValues,
                    ruleName: duplicateName,
                    ruleId: isDuplicate ? undefined : formValues.ruleId,
                    ruleType: isDuplicate ? RULE_TYPES.BRAND : formValues.ruleType,
                    sourceRuleId: isDuplicate ? sourceRuleId : undefined,
                });
                return true;
            } catch {
                return false;
            }
        },
        [isDuplicate, reset],
    );

    const checkDuplicateRuleNameOnce = useCallback(
        async (ruleName) => {
            const trimmed = String(ruleName || '').trim();
            if (!trimmed) return;

            try {
                const data = await dispatch(
                    checkQuietHoursNameExists({
                        payload: {
                            ruleName: trimmed,
                            channelId,
                            clientId,
                            userId,
                            departmentId,
                        },
                    }),
                );
                if (data?.status) {
                    setError('ruleName', {
                        type: 'server',
                        message: 'A rule with this name already exists for this channel.',
                    });
                } else {
                    clearErrors('ruleName');
                }
            } catch {
                // Name availability will be re-checked on blur/save if this call fails.
            }
        },
        [channelId, clearErrors, clientId, departmentId, dispatch, setError, userId],
    );

    const fetchQuietHoursDetailResponse = useCallback(async () => {
        if ((!isUpdate && !isDuplicate) || gridRow?.ruleId == null) {
            return { success: false, data: null, message: '' };
        }

        try {
            const response = await dispatch(
                getQuietHoursSettingsById(
                    buildQuietHoursByIdPayload({
                        clientId,
                        userId,
                        departmentId,
                        channelId,
                        ruleId: gridRow.ruleId,
                        ruleType: resolveGridRuleTypeApi(),
                    }),
                ),
            );
            const parsed = parseQuietHoursApiResponse(response);
            const data = extractQuietHoursDetailData(parsed);
            return {
                success: Boolean(data),
                data,
                message: parsed.message,
                response,
            };
        } catch (error) {
            return {
                success: false,
                data: null,
                message: UNABLE_TOLOAD_DATA,
                response: error,
            };
        }
    }, [
        channelId,
        clientId,
        departmentId,
        dispatch,
        gridRow?.ruleId,
        isDuplicate,
        isUpdate,
        resolveGridRuleTypeApi,
        userId,
    ]);

    const bootstrapPage = useCallback(() => {
        return pageLoadApi.refetch({
            fetcher: async () => {
                setSubmitError('');

                if (isUpdate || isDuplicate) {
                    const [lookupResult, detailResponse] = await Promise.all([
                        fetchLookups(),
                        fetchQuietHoursDetailResponse(),
                    ]);
                    return { mode: 'edit', lookupResult, detailResponse };
                }

                const lookupResult = await fetchLookups();
                return { mode: 'create', lookupResult };
            },
            loaderConfig: fieldLoaderConfig,
            mode: isUpdate || isDuplicate ? 'edit' : 'create',
            onSuccess: (result) => {
                if (result?.mode === 'edit') {
                    const { lookupResult, detailResponse } = result;
                    const lookupData = lookupResult?.data ?? EMPTY_LOOKUPS;

                    if (detailResponse?.data) {
                        applyDetailToForm(detailResponse.data, lookupData);
                    }
                    return;
                }

                const lookupData = result?.lookupResult?.data ?? EMPTY_LOOKUPS;
                reset(getFormInitialState(lookupData, channelKey).defaultValues);
            },
        });
    }, [
        applyDetailToForm,
        channelKey,
        checkDuplicateRuleNameOnce,
        closeValidationModal,
        fetchLookups,
        fetchQuietHoursDetailResponse,
        getValues,
        isDuplicate,
        isUpdate,
        pageLoadApi.refetch,
        reset,
    ]);

    useEffect(() => {
        bootstrapPage();
        return () => {
            pageLoadApi.reset();
        };
    }, [bootstrapPage, pageLoadApi.reset]);

    const handleSaveFailure = useCallback(
        (response, apiKey) => {
            handleQuietHoursApiFailure(response, {
                setFailedApi,
                showValidationModal,
                apiKey,
            });
        },
        [setFailedApi, showValidationModal],
    );

    const fetchQuietHoursListSettings = useCallback(async () => {
        try {
            const response = await dispatch(
                getQuietHoursSettings(
                    buildQuietHoursListPayload({
                        clientId,
                        userId,
                        departmentId,
                        channelId,
                        pageNo: 1,
                        pageSize: 500,
                    }),
                ),
            );
            const { status, data } = parseQuietHoursApiResponse(response);
            if (!status) {
                setFailedApi(QUIET_HOURS_API_KEYS.LIST);
                return null;
            }
            return data;
        } catch {
            setFailedApi(QUIET_HOURS_API_KEYS.LIST);
            return null;
        }
    }, [channelId, clientId, departmentId, dispatch, setFailedApi, userId]);

    const closeFormAndRefreshGrid = useCallback(() => {
        handleCancel?.();
    }, [handleCancel]);

    const handleCancelClick = useCallback(() => {
        if (isSaveLoading) return;
        handleCancel?.();
    }, [handleCancel, isSaveLoading]);

    useEffect(() => {
        if (!isBothMessageType) return;

        if (isDiscardBehavior(behavior)) {
            setValue('behavior', BEHAVIOR_OPTIONS[0].label);
        }
    }, [behavior, isBothMessageType, setValue]);

    const handleFormSubmit = async (formValues) => {
        if (isReadOnly || isSaveLoading) return;

        if (isRegulatory) {
            return;
        }

        let baselines = regulatoryBaselines;
        if (!baselines.length) {
            baselines = await fetchRegulatoryBaselines();
            setRegulatoryBaselines(baselines);
        }

        const brandWindowError = validateBrandWindowAgainstRegulatory(
            formValues,
            baselines,
            QUIET_HOURS_BRAND_SHORTER_THAN_REGULATORY,
        );
        if (brandWindowError) {
            setSubmitError(brandWindowError);
            return;
        }

        if (isDuplicate) {
            const payload = buildQuietHoursDuplicatePayload(formValues, {
                clientId,
                userId,
                departmentId,
                channelId,
                sourceRuleId: ruleMeta.sourceRuleId,
            });

            const duplicateResponse = await dispatch(duplicateQuietHoursSettings(payload));
            const parsed = parseQuietHoursApiResponse(duplicateResponse);

            if (parsed.status) {
                closeFormAndRefreshGrid();
            } else {
                handleSaveFailure(duplicateResponse, QUIET_HOURS_API_KEYS.DUPLICATE);
            }
            return;
        }

        const payload = buildQuietHoursUpsertPayload(formValues, {
            clientId,
            userId,
            departmentId,
            channelId,
            ruleId: isEditMode ? Number(ruleMeta.ruleId ?? formValues?.ruleId ?? 0) : 0,
        });

        try {
            const upsertResponse = await saveApi.refetch({
                fetcher: () => dispatch(upsertQuietHoursSettings(payload, false)),
                loaderConfig: fieldLoaderConfig,
                mode: isUpdate ? 'edit' : 'create',
            });
            const parsed = parseQuietHoursApiResponse(upsertResponse);

            if (!parsed.status) {
                handleSaveFailure(upsertResponse, QUIET_HOURS_API_KEYS.UPSERT);
                return;
            }

            context?.closeQuietHoursForm?.();
        } catch (error) {
            handleSaveFailure(error, QUIET_HOURS_API_KEYS.UPSERT);
        }
    };

    const handleRuleNameChange = useCallback(
        (value) => {
            if (!(value || '').trim()) {
                void trigger('ruleName');
                return;
            }
            const err = validateQuietHoursRuleName(value);
            if (err !== true) {
                setError('ruleName', { type: 'validate', message: err });
            } else {
                void trigger('ruleName');
            }
        },
        [setError, trigger],
    );

    const handleToggleDay = useCallback(
        (dayKey) => {
            if (isReadOnly || isRegulatory) return;

            const days = getValues('daysCustom') || {};
            setValue(
                'daysCustom',
                { ...days, [dayKey]: !days[dayKey] },
                { shouldValidate: true, shouldTouch: true },
            );
        },
        [getValues, isReadOnly, isRegulatory, setValue],
    );

    const handleWindowStartRemove = useCallback(() => {
        runWindowFieldValidation();
    }, [runWindowFieldValidation]);

    const handleWindowEndRemove = useCallback(() => {
        runWindowFieldValidation();
    }, [runWindowFieldValidation]);

    const handleWindowEndFocus = useCallback(() => {
        windowEndInteractionAfterInvalidPairRef.current = true;
    }, []);

    const canSave = !isReadOnly && isAdmin && (isCreate || isEditMode);
    const canEditWindowStart = isCreate || isEditMode;
    const canEditWindowEnd = isCreate || isEditMode;

    const windowStartRules = useMemo(
        () => ({
            required: canEditWindowStart ? 'Please select a start time.' : false,
            validate: (value) =>
                validateQuietHoursWindowStartField(value, getValues('windowEnd')),
        }),
        [canEditWindowStart, getValues],
    );

    const windowEndRules = useMemo(
        () => ({
            validate: (value) => {
                const startError = getFieldState('windowStart').error;
                const suppressRequired =
                    startError?.type === 'invalidPair' &&
                    !windowEndInteractionAfterInvalidPairRef.current;
                if ((value == null || value === '') && canEditWindowEnd) {
                    if (suppressRequired) {
                        return true;
                    }
                    return 'Please select an end time.';
                }
                return validateQuietHoursWindowEndField(
                    getValues('windowStart'),
                    value,
                );
            },
        }),
        [canEditWindowEnd, getFieldState, getValues],
    );

    const formBoxClass = embedded ? 'quiet-hours-form' : 'box-design bd-top-border quiet-hours-form';

    const quietHoursFormAlertClass = 'alert mb15 mt10 align-items-stretch border-r7';

    if (isPageLoading) {
        return (
            <div className="rsv-tabs-content">
                <RSSkeletonTable count={6} isCustombox isAlertIcon={false} />
            </div>
        );
    }

    if (lookupsError && !lookups.countryRegions.length) {
        return (
            <div className="rsv-tabs-content">
                <div className={embedded ? 'quiet-hours-form' : 'box-design bd-top-border quiet-hours-form'} />
                <div className="buttons-holder">
                    <RSSecondaryButton type="button" onClick={handleCancelClick}>
                        {BACK}
                    </RSSecondaryButton>
                </div>
                <QuietHoursValidationModal
                    show
                    message={lookupsError}
                    onClose={() => {
                        setLookupsError('');
                        handleCancel?.();
                    }}
                />
            </div>
        );
    }

    return (
        <CommunicationSettingsQuietHoursEditSkeletonGate
            isLoading={isPageLoading}
            embedded={embedded}
        >
        <FormProvider {...methods}>
            <form
                className={embedded ? '' : 'rsv-tabs-content'}
                onSubmit={handleSubmit(handleFormSubmit)}
            >
                <div className={formBoxClass}>
                    <div className="rs-sub-heading">
                        <div className="rss-left d-flex align-items-center">
                            <h4 className="mb0">{pageTitle}</h4>
                        </div>
                    </div>

                    {submitError ? <div className="alert alert-danger mt10">{submitError}</div> : null}

                    {isBothMessageType ? (
                        <RSAlertWarning
                            show
                            message={
                                showUsaTcpaBothWarning
                                    ? QUIET_HOURS_USA_TCPA_BOTH_WARNING
                                    : QUIET_HOURS_BOTH_MESSAGE_WARNING
                            }
                            containerClass="px0"
                            alertClass={`${quietHoursFormAlertClass} alert-warning`}
                        />
                    ) : null}

                    <Row>
                        <Col md={10}>
                    <Row className="form-group mt20">
                        <Col sm={12}>
                            {showNameExistsCheck ? (
                                <ListNameExists
                                    name="ruleName"
                                    field="ruleName"
                                    placeholder={RULENAME}
                                    apiCallback={checkQuietHoursNameExists}
                                    condition={(data) => !data?.status}
                                    rules={{
                                        required: 'Please enter a unique rule name.',
                                        maxLength: {
                                            value: 100,
                                            message: 'Rule name must be 100 characters or fewer.',
                                        },
                                    }}
                                    customError="A rule with this name already exists for this channel."
                                    extraPayload={{
                                        channelId,
                                        ...(isEditMode && ruleMeta.ruleId != null
                                            ? { ruleId: ruleMeta.ruleId }
                                            : {}),
                                    }}
                                    maxLength={100}
                                    currentValue={initialRuleName}
                                    noEmoji
                                />
                            ) : (
                                <RSInput
                                    control={control}
                                    name="ruleName"
                                    label={RULENAME}
                                    disabled
                                    maxLength={100}
                                />
                            )}
                        </Col>
                    </Row>

                    <Row className="form-group">
                        <Col sm={6}>
                            <RSKendoDropDownList
                                control={control}
                                name="channel"
                                label={CHANNEL}
                                data={[getChannelOptionForKey(channelKey)]}
                                textField="channelName"
                                dataItemKey="channelId"
                                disabled
                                required={!isReadOnly}
                                rules={isReadOnly ? {} : { required: 'Channel cannot be empty.' }}
                            />
                        </Col>
                        <Col sm={6}>
                            <RSKendoDropDownList
                                control={control}
                                name="countryRegion"
                                label={QUIET_HOURS_COUNTRY_REGION}
                                data={countryOptions}
                                textField="label"
                                dataItemKey="countryRegionId"
                                disabled={isReadOnly || isRegulatory}
                                rules={
                                    isReadOnly || isRegulatory
                                        ? {}
                                        : { required: 'Please select a country or region.' }
                                }
                            />
                        </Col>
                    </Row>

                    <Row className="form-group">
                        <Col sm={6}>
                            <RSTimePicker
                                control={control}
                                name="windowStart"
                                label={QUIET_HOURS_WINDOW_START}
                                format="HH:mm"
                                valueFormat="HH:mm"
                                steps={{ hour: 1, minute: 1 }}
                                required={canEditWindowStart}
                                disabled={!canEditWindowStart}
                                rules={{
                                    required: canEditWindowStart ? 'Please select a start time.' : false,
                                }}
                            />
                        </Col>
                        <Col sm={6}>
                            <RSTimePicker
                                control={control}
                                name="windowEnd"
                                label={QUIET_HOURS_WINDOW_END}
                                format="HH:mm"
                                valueFormat="HH:mm"
                                steps={{ hour: 1, minute: 1 }}
                                required={canEditWindowEnd}
                                disabled={!canEditWindowEnd}
                                rules={{
                                    required: canEditWindowEnd ? 'Please select an end time.' : false,
                                }}
                            />
                        </Col>
                    </Row>
                    <small className="text-muted d-block mb15">{QUIET_HOURS_ACCOUNT_TIMEZONE_NOTE}</small>

                    <div className="form-group">
                        <Controller
                            control={control}
                            name="daysCustom"
                            rules={{
                                validate: (days) => {
                                    if (isReadOnly || isRegulatory) return true;
                                    return (
                                        hasQuietHoursDaysSelected(days) ||
                                        QUIET_HOURS_SELECT_DAYS_REQUIRED
                                    );
                                },
                            }}
                            render={({ fieldState: { error } }) => {
                                const days = daysCustomValue || {};
                                const showError = Boolean(error?.message);

                                return (
                                    <>
                                        <label
                                            className={`control-label d-block mb20 ${showError ? '' : 'color-secondary-grey'
                                                } ${showRegulatoryRequired ? 'required' : ''}`}
                                        >
                                            {QUIET_HOURS_DAYS_OF_WEEK}
                                        </label>
                                        <div className="rs-quiet-hours-days d-flex flex-wrap">
                                            {WEEK_DAY_OPTIONS.map(({ key, label }) => (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    className={`rs-quiet-hours-day ${days[key]
                                                            ? 'rs-quiet-hours-day--active'
                                                            : 'rs-quiet-hours-day--inactive'
                                                        }`}
                                                    disabled={isReadOnly || isRegulatory}
                                                    onClick={() => handleToggleDay(key)}
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                        {showError ? (
                                            <small className="fs11 d-block position-absolute top27 color-primary-red">{error.message}</small>
                                        ) : null}
                                    </>
                                );
                            }}
                        />
                    </div>

                    <Row className="form-group">
                                <Col sm={12}>
                                    <RSKendoDropDownList
                                        control={control}
                                        name="messageType"
                                        label={QUIET_HOURS_MESSAGE_TYPE}
                                        data={lookups.messageTypes}
                                        textField="label"
                                        dataItemKey="messageTypeCode"
                                        required={showRegulatoryRequired || (!isReadOnly && !isRegulatory)}
                                        disabled={isReadOnly || isRegulatory}
                                        rules={
                                            isReadOnly || isRegulatory
                                                ? {}
                                                : { required: 'Please select a message type.' }
                                        }
                                    />
                                    <small className="text-muted d-block lh-sm mt5">{QUIET_HOURS_PROMO_DELIVERY_NOTE}</small>
                                </Col>
                            </Row>

                            <Row className='form-group'>
                                <Col sm={3}>
                                    <label className={`control-label d-block ${showRegulatoryRequired ? 'required' : ''}`}>
                                        {QUIET_HOURS_SUPPRESSION_BEHAVIOUR}
                                    </label>
                                </Col>
                                <>
                                    <Col sm={3} className='mt6 pr0'>
                                        {wrapQuietHoursDisabledControl(
                                            <RSRadioButton
                                                control={control}
                                                name="behavior"
                                                id="quiet_hours_behavior_queue"
                                                labelName={QUIET_HOURS_QUEUE_AND_SEND}
                                                disabled={isBehaviorDisabled}
                                            />,
                                            {
                                                disabled: isBehaviorDisabled,
                                                tooltip: behaviorDisabledTooltip,
                                            },
                                        )}
                                    </Col>
                                    <Col sm={2} className='mt6 pl0'>
                                        {wrapQuietHoursDisabledControl(
                                            <RSRadioButton
                                                control={control}
                                                name="behavior"
                                                id="quiet_hours_behavior_discard"
                                                labelName={QUIET_HOURS_DISCARD}
                                                disabled={isBehaviorDisabled}
                                            />,
                                            {
                                                disabled: isBehaviorDisabled,
                                                tooltip: behaviorDisabledTooltip,
                                            },
                                        )}
                                    </Col>
                                    {isQueueBehavior ? (
                                        <Col sm={4} className='position-relative top-1 '>
                                            {wrapQuietHoursDisabledControl(
                                                <RSKendoDropDownList
                                                    control={control}
                                                    name="queueExpiry"
                                                    label={QUIET_HOURS_QUEUE_EXPIRY}
                                                    data={lookups.queueExpiryOptions}
                                                    textField="label"
                                                    dataItemKey="queueExpiryCode"
                                                    required={
                                                        showRegulatoryRequired ||
                                                        (!isReadOnly && !isRegulatory && isQueueBehavior)
                                                    }
                                                    disabled={isQueueExpiryDisabled}
                                                    rules={
                                                        isReadOnly || isRegulatory || !isQueueBehavior
                                                            ? {}
                                                            : { required: 'Please select a queue expiry duration.' }
                                                    }
                                                />,
                                                {
                                                    disabled: isQueueExpiryDisabled,
                                                    tooltip: queueExpiryDisabledTooltip,
                                                },
                                            )}
                                        </Col>
                                    ) : null}
                                </>
                            </Row>

                            {!isRegulatory ? (
                                <Row className="form-group align-items-center">
                                    <Col sm={3}>
                                        <label className="control-label  d-block">
                                            {QUIET_HOURS_PRIORITY_OVERRIDE}
                                        </label>
                                    </Col>

                                    <Col sm={3} className='align-items-center d-flex position-relative top-2'>

                                        <RSSwitch
                                            control={control}
                                            name="priorityOverride"
                                            onLabel={QUIET_HOURS_STATUS_ON}
                                            offLabel={QUIET_HOURS_STATUS_OFF}
                                            disabled={isReadOnly}
                                        />
                                        <RSPPophover
                                            text={QUIET_HOURS_PRIORITY_OVERRIDE_TOOLTIP}
                                            position="top"
                                        >
                                            <i
                                                className={`${circle_question_mark_mini} icon-xs color-primary-blue ml10`}
                                            />
                                        </RSPPophover>


                                    </Col>


                                </Row>
                            ) : null}
                        </Col>
                    </Row>
                </div>

                <div className="buttons-holder">
                    <RSSecondaryButton type="button" onClick={handleCancelClick} blockInteraction={isSaveLoading}>
                        {isReadOnly ? BACK : CANCEL}
                    </RSSecondaryButton>
                    {canSave ? (
                        <RSPrimaryButton
                            type="submit"
                            disabled={isSaveLoading}
                            isLoading={isSaveLoading || hasUiValidationErrors}
                            disabledClass={hasUiValidationErrors ? 'pe-none click-off' : ''}
                        >
                            {SAVE}
                        </RSPrimaryButton>
                    ) : null}
                </div>
            </form>
            <QuietHoursValidationModal
                show={validationModal.show}
                message={validationModal.message}
                onClose={closeValidationModal}
            />
        </FormProvider>
        </CommunicationSettingsQuietHoursEditSkeletonGate>
    );
};

export default QuietHoursCreate;
