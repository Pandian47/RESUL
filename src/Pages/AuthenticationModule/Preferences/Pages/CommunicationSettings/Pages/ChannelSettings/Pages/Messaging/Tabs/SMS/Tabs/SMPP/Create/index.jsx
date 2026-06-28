import { selectIcon } from 'Utils/modules/display';
import { MIN_LENGTH } from 'Constants/GlobalConstant/Regex';
import { ENTER_FRIENDLY_NAME, ENTER_KEYWORD, MINLENGTH, SELECT_COUNTRY, SELECT_PROVIDER } from 'Constants/GlobalConstant/ValidationMessage';
import { ADD, CANCEL, COUNTRY, FRIENDLY_NAME, PROMOTIONAL, REMOVE, SAVE, SENDER_ID, TRANSACTIONAL, UPDATE } from 'Constants/GlobalConstant/Placeholders';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm, FormProvider, useFieldArray, useWatch } from 'react-hook-form';
import { Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { RenderVendors } from './constant';
import RSTooltip from 'Components/RSTooltip';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSInput from 'Components/FormFields/RSInput';
import RSRadioButton from 'Components/FormFields/RSRadioButton';
import RSSwitch from 'Components/FormFields/RSSwitch';
import ListNameExists from 'Components/ListNameExists';

import { FORM_INITIAL_STATE, SMS_TYPES, SMS_VENDOR_FORM_ACTIONS_PORTAL_ID, getSenderIdRules } from '../../../constant';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import usePermission from 'Hooks/usePersmission';
import { getCSServiceProviders, getSMSSettingsById, checkVendorNameExists, upsertSMPPSMSSetting } from 'Reducers/preferences/CommunicationSettings/request';
import { getSessionId } from 'Reducers/globalState/selector';
import { updateCommunicationSettings } from 'Reducers/preferences/CommunicationSettings/reducer';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';
import { CommunicationSettingsEditSkeletonGate } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';


const SMPP_CREATE_FORM_ID = 'rs_SMPPCreate_Form';

// ─── Constants ─────────────────────────────────────────────────────────────
let providerId = '';

const DEFAULT_SENDER_DETAIL = {
    clientsmsSenderName: '',
    clientfriendlyName: '',
    keyword: '',
    isActive: true,
    isDelete: false,
};

// ─── Component ─────────────────────────────────────────────────────────────
const SMPPCreate = ({ type, handleCancel, config, setFailedApi }) => {
    // ─── Redux & Session ───────────────────────────────────────────────────
    const dispatch = useDispatch();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const { settingsProviders } = useSelector(({ communicationSettingsReducer }) => communicationSettingsReducer);
    const { permissions } = usePermission();
    const { addAccess } = permissions || {};

    // ─── Form Setup ────────────────────────────────────────────────────────
    const methods = useForm(FORM_INITIAL_STATE);
    const {
        control,
        handleSubmit,
        trigger,
        watch,
        reset,
        setValue,
        clearErrors,
        formState: { isValid, errors },
        getValues,
    } = methods;

    const {
        fields: senderFields,
        append: senderAppend,
        remove: senderRemove,
        update: senderUpdate,
    } = useFieldArray({
        control,
        name: 'senderDetails',
    });

    const senderDetailsWatch = useWatch({ control, name: 'senderDetails' });
    const [senderDetailsList, setSenderDetailsList] = useState([]);
    const [initialFriendlyName, setInitialFriendlyName] = useState('');

    // ─── Derived State ─────────────────────────────────────────────────────
    const isUpdate = type === 'edit';
    const sessionReady = Boolean(clientId && userId != null && departmentId != null);
    const pageLoadApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const saveApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const isSaveLoading = saveApi.isFetching;
    const showFieldLoader = pageLoadApi.isLoading && !isUpdate;
    const isTwoWaySMS = watch('settingType.TwoWaySMS') === true;
    const isDltEnabled = watch('dltEnabled') === true;
    const [provider] = watch(['provider']);
    const countryCode = watch('countryCode');
    const vendorConfig = provider ? RenderVendors(provider) : { fields: [], countryOptions: [] };
    const isIndia = countryCode?.value === 'IN' || (typeof countryCode === 'string' && countryCode === 'IN');

    // ─── Effects ───────────────────────────────────────────────────────────
    const fetchUpdateData = useCallback(
        async (providersList = []) => {
        const res = await dispatch(
            getSMSSettingsById({ clientSmsSettingId: config?.clientSmsSettingId, clientId, userId, departmentId }),
        );
        const { status, data } = res;

        if (!status) {
            setFailedApi('GetSMSSettingsbyID');
            return;
        }

        const {
            senderId,
            accessPoint,
            userName,
            password,
            settingType: apiSettingType,
            operatorCode,
            clientSMSSender,
            clientTwoWaySMS,
            twoway: apiTwoway,
            serviceProviderId,
            serviceProviderID,
            friendlyName,
            country: apiCountry,
            isDLTenable,
            dlt: apiDlt,
            credentials: apiCredentials,
            messageTypes: apiMessageTypes,
            isTwowayEnabled,
        } = data;

        const resolvedProviderId = serviceProviderId ?? serviceProviderID;
        providerId = resolvedProviderId;
        const tempProvider = providersList?.find((item) => item?.serviceProviderId === resolvedProviderId);
        const credFields = tempProvider ? RenderVendors(tempProvider).fields : [];
        const credentialValues = {};
        (apiCredentials || []).forEach((c) => {
            if (!c?.key) return;
            const matchedField = credFields.find(
                (f) => f.name === c.key || (typeof c.key === 'string' && f.name?.toLowerCase() === c.key.toLowerCase()),
            );
            const formKey = matchedField ? matchedField.name : c.key;
            credentialValues[formKey] = c.value ?? '';
        });
        if (!Object.keys(credentialValues).length) {
            credFields.forEach((f) => {
                if (f.name === 'account_sid' || f.name === 'userName' || f.name?.toLowerCase() === 'username')
                    credentialValues[f.name] = userName ?? '';
                if (f.name === 'auth_token' || f.name === 'password') credentialValues[f.name] = password ?? '';
            });
        } else {
            credFields.forEach((f) => {
                if (credentialValues[f.name] !== undefined) return;
                if (f.name === 'account_sid' || f.name === 'userName' || f.name?.toLowerCase() === 'username')
                    credentialValues[f.name] = userName ?? '';
                if (f.name === 'auth_token' || f.name === 'password') credentialValues[f.name] = '';
            });
        }
        const countryOptions = tempProvider ? RenderVendors(tempProvider).countryOptions || [] : [];
        const countryCodeValue =
            typeof apiCountry === 'object' && apiCountry?.value != null
                ? apiCountry.value
                : typeof apiCountry === 'string'
                ? apiCountry
                : '';
        const countryOption =
            countryOptions.find((o) => o.value === countryCodeValue || o.label === countryCodeValue) ||
            (typeof apiCountry === 'object' && apiCountry?.label && apiCountry?.value ? apiCountry : '');

        const settingTypeLabel = apiSettingType
            ? SMS_TYPES[apiSettingType]
            : isTwowayEnabled
            ? 'Two way SMS'
            : apiMessageTypes?.includes?.('P')
            ? 'Promotional'
            : apiMessageTypes?.includes?.('T')
            ? 'Transactional'
            : '';
        const isEditTwoWay = settingTypeLabel === 'Two way SMS' || !!isTwowayEnabled;

        const twowayList = Array.isArray(apiTwoway) ? apiTwoway : Array.isArray(clientTwoWaySMS) ? clientTwoWaySMS : [];
        const clientSMSSenderList = Array.isArray(clientSMSSender)
            ? clientSMSSender
            : typeof clientSMSSender === 'string' && clientSMSSender.trim()
            ? clientSMSSender.split(',').map((s) => ({ clientSMSSenderName: s.trim(), clientfriendlyName: '' }))
            : [];
        const senderDetails = isEditTwoWay
            ? twowayList.map((item) => ({
                  ...item,
                  clientsmsSenderName: item?.senderID ?? item?.inboundNumber ?? '',
                  keyword: item?.keyword ?? '',
                  clientfriendlyName: item?.FriendlyName ?? item?.conditions ?? '',
                  isActive: true,
                  isDelete: false,
              }))
            : clientSMSSenderList.map((item) => ({
                  ...item,
                  clientsmsSenderId: item?.clientsmsSenderId,
                  clientsmsSenderName: item?.clientSMSSenderName ?? item?.clientSMSSender ?? '',
                  clientfriendlyName: item?.clientFriendlyName ?? item?.clientfriendlyName ?? '',
                  isActive: true,
                  isDelete: false,
              }));

        const messageTypeValue = apiMessageTypes?.includes?.('T')
            ? 'Transactional'
            : apiMessageTypes?.includes?.('P')
            ? 'Promotional'
            : '';
        const settingTypeMap = apiMessageTypes?.length
            ? {
                  messageType: messageTypeValue,
                  promotional: apiMessageTypes.includes('P'),
                  Transactional: apiMessageTypes.includes('T'),
                  TwoWaySMS: apiMessageTypes.includes('TWO') || !!isTwowayEnabled,
              }
            : {
                  messageType:
                      messageTypeValue ||
                      (settingTypeLabel === 'Transactional'
                          ? 'Transactional'
                          : settingTypeLabel === 'Promotional'
                          ? 'Promotional'
                          : ''),
                  promotional: settingTypeLabel === 'Promotional',
                  Transactional: settingTypeLabel === 'Transactional',
                  TwoWaySMS: settingTypeLabel === 'Two way SMS' || !!isTwowayEnabled,
              };

        setInitialFriendlyName(friendlyName ?? '');

        reset(
            (prev) => ({
                ...prev,
                ...credentialValues,
                smsFriendlyName: friendlyName ?? prev.smsFriendlyName,
                accessPoint,
                settingType: { ...prev.settingType, ...settingTypeMap },
                operatorCode,
                senderDetails: senderDetails?.length ? senderDetails : prev.senderDetails,
                provider: tempProvider,
                countryCode: countryOption,
                dltEnabled: !!isDLTenable,
                dltTemplateId: apiDlt?.id ?? '',
                dltEntityId: apiDlt?.entityId ?? '',
                dltHeaderId: apiDlt?.headerId ?? '',
                senderId:
                    typeof clientSMSSender === 'string'
                        ? clientSMSSender
                        : Array.isArray(clientSMSSender)
                        ? clientSMSSender
                              .map((s) => s?.clientSMSSenderName ?? s?.clientSMSSender ?? s)
                              .filter(Boolean)
                              .join(', ')
                        : '',
            }),
            { keepIsValid: true },
        );
    },
        [
            dispatch,
            config?.clientSmsSettingId,
            clientId,
            userId,
            departmentId,
            reset,
            setFailedApi,
        ],
    );

    const bootstrapPage = useCallback(() => {
        if (!sessionReady) {
            return undefined;
        }
        return pageLoadApi.refetch({
            fetcher: async () => {
                const providersRes = await dispatch(
                    getCSServiceProviders({ departmentId, clientId, userId }),
                );
                const providersList = providersRes?.data ?? [];
                if (isUpdate && config?.clientSmsSettingId) {
                    await fetchUpdateData(providersList);
                }
                return providersRes;
            },
            loaderConfig: fieldLoaderConfig,
            mode: isUpdate ? 'edit' : 'create',
        });
    }, [
        sessionReady,
        departmentId,
        clientId,
        userId,
        isUpdate,
        config?.clientSmsSettingId,
        dispatch,
        pageLoadApi.refetch,
        fetchUpdateData,
    ]);

    const bootstrapPageRef = useRef(bootstrapPage);
    bootstrapPageRef.current = bootstrapPage;

    useEffect(() => {
        if (!sessionReady) return undefined;
        bootstrapPageRef.current();
        return () => {
            dispatch(updateCommunicationSettings({ field: 'settingsProviders', payload: [] }));
        };
    }, [sessionReady, departmentId, clientId, userId, isUpdate, config?.clientSmsSettingId, dispatch]);

    useEffect(() => {
        if (isIndia) setValue('dltEnabled', true, { shouldValidate: true });
    }, [isIndia]);

    // ─── Handlers ──────────────────────────────────────────────────────────
    const handleAddOrRemoveSender = async (index) => {
        if (index === 0) {
            const result = await trigger('senderDetails');
            if (!errors?.senderDetails) {
                senderAppend({ ...DEFAULT_SENDER_DETAIL });
            } else {
                if (errors?.senderDetails) {
                    trigger('senderDetails');
                }
            }
            return;
        }
        const item = { ...senderDetailsWatch?.[index], isDelete: true };
        if (isUpdate) senderUpdate(index, { ...getValues(`senderDetails[${index}]`), isActive: false });
        setSenderDetailsList((prev) => [...prev, item]);
        senderRemove(index);
    };

    const handleDltChange = (val) => {
        if (!val) {
            setValue('dltTemplateId', '');
            setValue('dltEntityId', '');
            setValue('dltHeaderId', '');
        }
        clearErrors(['dltTemplateId', 'dltEntityId', 'dltHeaderId', 'dltEnabled']);
    };

    const handleTwoWaySMSChange = (val) => {
        if (!val) {
            setValue('senderDetails', [{ ...DEFAULT_SENDER_DETAIL }]);
        }
        clearErrors(['senderDetails']);
    };

    const buildPayload = (formState) => {
        const { provider: selectedProvider } = formState;
        const credFields = selectedProvider ? RenderVendors(selectedProvider).fields : [];

        // credentials: [{ key, value }] from vendor config fields
        const credentials = credFields
            .filter((f) => f.type !== 'dropdown')
            .map((f) => ({ key: f.name, value: formState[f.name] ?? '' }));

        // messageTypes: ["P", "T", "TWO"] from message type radio + TwoWaySMS switch
        const messageTypes = [];
        const msgType = formState.settingType?.messageType;
        if (msgType === PROMOTIONAL) messageTypes.push('P');
        if (msgType === TRANSACTIONAL) messageTypes.push('T');
        // if (formState.settingType?.TwoWaySMS) messageTypes.push('TWO');

        // clientSMSSender: comma-separated when NOT two-way (e.g. "Test1,Test2") - from Sender ID text area
        const clientSMSSender = !formState.settingType?.TwoWaySMS ? (formState.senderId || '').trim() : '';

        // twoway: [{ senderID, keyword, FriendlyName }]
        const twoway = formState.settingType?.TwoWaySMS
            ? [...(formState.senderDetails || []), ...senderDetailsList]
                  .filter((s) => !s?.isDelete)
                  .map((s) => ({
                      senderID: s.clientsmsSenderName || '',
                      keyword: s.keyword || '',
                      FriendlyName: s.clientfriendlyName || '',
                  }))
            : [];

        const countryVal = formState.countryCode;
        const country =
            countryVal && typeof countryVal === 'object' && 'label' in countryVal && 'value' in countryVal
                ? countryVal?.value
                : (() => {
                      const opts = selectedProvider ? RenderVendors(selectedProvider).countryOptions || [] : [];
                      const match = opts.find((o) => o.value === countryVal || o.label === countryVal);
                      return match || (countryVal ? { label: countryVal, value: countryVal } : '');
                  })();

        return {
            friendlyName: formState.smsFriendlyName || '',
            serviceProviderID: selectedProvider?.serviceProviderId ?? 0,
            clientsmsSettingId: isUpdate ? config?.clientSmsSettingId : 0,
            vendor: selectedProvider?.serviceProviderName || '',
            country: typeof country === 'object' ? country?.value || '' : country || '',
            isDLTenable: formState.dltEnabled ?? false,
            dlt: formState.dltEnabled
                ? {
                      //   id: formState.dltTemplateId || '',
                      entityId: formState.dltEntityId || '',
                      //   headerId: formState.dltHeaderId || '',
                  }
                : {},
            isTwowayEnabled: formState.settingType?.TwoWaySMS ?? false,
            twoway,
            credentials,
            messageTypes: messageTypes?.join(''),
            clientSMSSender: formState?.senderId || '',
        };
    };

    const handleFormSubmit = async (formState) => {
        if (saveApi.isFetching) return;
        const payload = { clientId, departmentId, userId, ...buildPayload(formState) };
        const res = await saveApi.refetch({
            fetcher: () => dispatch(upsertSMPPSMSSetting(payload, false)),
            loaderConfig: fieldLoaderConfig,
            mode: 'create',
        });
        const { status } = res || {};
        if (status) handleCancel(true);
        else trigger();
    };

    // ─── Validation Rules ───────────────────────────────────────────────────
    const isValueDuplicated = (key, value) => {
        const trimmed = (value || '').trim();
        if (!trimmed) return false;
        const list = senderDetailsWatch || [];
        const count = list.filter((s) => (s?.[key] || '').trim() === trimmed).length;
        return count > 1;
    };

    const getFriendlyNameRules = () => ({
        required: ENTER_FRIENDLY_NAME,
        validate: (value) => {
            const trimmed = (value || '').trim();
            if (trimmed && trimmed.length < MIN_LENGTH) return MINLENGTH;
            return isValueDuplicated('clientfriendlyName', value) ? 'Duplicate friendly name' : true;
        },
    });

    const getKeywordRules = () => ({
        required: ENTER_KEYWORD,
        validate: (value) => {
            const trimmed = (value || '').trim();
            if (trimmed && trimmed.length < MIN_LENGTH) return MINLENGTH;
            return isValueDuplicated('keyword', value) ? 'Duplicate keyword' : true;
        },
    });

    const senderIdRules = {
        ...getSenderIdRules(),
        validate: (value) => {
            const result = getSenderIdRules().validate(value);
            if (result !== true) return result;
            return true;
        },
    };

    const canAddMoreSenders = (isUpdate ? senderFields?.filter((r) => r.isActive)?.length : senderFields?.length) > 4;

    const [actionsPortalTarget, setActionsPortalTarget] = useState(null);

    useEffect(() => {
        setActionsPortalTarget(document.getElementById(SMS_VENDOR_FORM_ACTIONS_PORTAL_ID));

        return () => {
            setActionsPortalTarget(null);
        };
    }, []);

    // ─── Render: Vendor Config Section ──────────────────────────────────────
    const renderVendorConfig = () => (
        <>
        <div className="rs-sub-heading">
            <div className="rss-left">
                <h4>SMS vendor configuration</h4>
            </div>
            </div>
            <div className="form-group">
                <Row>
                    <Col sm={4}>
                        <ListNameExists
                            name="smsFriendlyName"
                            field="friendlyName"
                            placeholder="Friendly name"
                            apiCallback={checkVendorNameExists}
                            condition={(data) => !data?.status}
                            rules={{
                                required: 'Enter friendly name',
                                minLength: { value: MIN_LENGTH, message: MINLENGTH },
                            }}
                            customErrorMessage="Enter friendly name"
                            extraPayload={{ channel: 2, departmentId, clientId, userId }}
                            maxLength={150}
                            noEmoji={true}
                            currentValue={isUpdate ? initialFriendlyName : ''}
                        />
                    </Col>
                    <Col sm={4} id="rs_SMPPCreate_provider">
                        <RSKendoDropDownList
                            name="provider"
                            data={settingsProviders}
                            control={control}
                            textField="serviceProviderName"
                            dataItemKey="serviceProviderId"
                            label="SMS vendor"
                            required
                            isLoading={showFieldLoader}
                            rules={{ required: SELECT_PROVIDER }}
                            handleChange={() => {
                                setValue('countryCode', '');
                            }}
                        />
                    </Col>
                    <Col sm={4}>
                        <RSKendoDropDownList
                            name="countryCode"
                            data={vendorConfig.countryOptions || []}
                            control={control}
                            textField="label"
                            dataItemKey="value"
                            label={COUNTRY}
                            isLoading={showFieldLoader}
                            required={!!vendorConfig.countryOptions?.length}
                            rules={vendorConfig.countryOptions?.length ? { required: SELECT_COUNTRY } : {}}
                        />
                    </Col>
                </Row>
            </div>

            {!!provider && vendorConfig.fields?.length > 0 && (
                <>
                    <div className="rs-sub-heading">
                        <div className="rss-left">
                            <h4>Vendor credentials</h4>
                        </div>
                    </div>
                    <div className='form-group row'>
                        {vendorConfig.fields.map((field, idx) => (
                            <Col key={field.name || idx} sm={4}>
                                {field.type === 'dropdown' ? (
                                    <RSKendoDropDownList
                                        name={field.name}
                                        data={field.options}
                                        control={control}
                                        textField="label"
                                        dataItemKey="value"
                                        label={field.placeHolder}
                                        required
                                        rules={{ required: field.required }}
                                    />
                                ) : (
                                    <RSInput
                                        label={field.placeHolder}
                                        name={field.name}
                                        control={control}
                                        required
                                        type={field.type}
                                        rules={{
                                            required: field.required,
                                            minLength: { value: MIN_LENGTH, message: MINLENGTH },
                                        }}
                                        maxLength={150}
                                        viewEye={field.viewEye}
                                        handleOnBlur={(e) =>
                                            setValue(field.name, e.target.value?.trim(), {
                                                shouldValidate: true,
                                                shouldDirty: true,
                                            })
                                        }
                                        handleOnPaste={(e) => {
                                            e.preventDefault();
                                            setValue(field.name, e.clipboardData.getData('text').trim(), {
                                                shouldValidate: true,
                                                shouldDirty: true,
                                            });
                                        }}
                                    />
                                )}
                            </Col>
                        ))}
                    </div>
                </>
            )}
        </>
    );

    // ─── Render: Message Type & Sender ID ───────────────────────────────────
    const renderMessageTypeSection = () => (
        <>
            <div className="form-group">
                <Row className="align-items-center lh-sm">
                    <Col sm={4}>
                        <h4 className="m0">Message type</h4>
                    </Col>
                    <Col sm={6} className="d-flex gap-4">
                        <RSRadioButton
                            control={control}
                            name="settingType.messageType"
                            labelName={TRANSACTIONAL}
                            rules={{ required: 'Select message type' }}
                        />
                        <RSRadioButton
                            control={control}
                            name="settingType.messageType"
                            labelName={PROMOTIONAL}
                        />
                    </Col>
                </Row>
            </div>
            <div className="form-group">
                <Row>
                     <Col sm={{offset:4,span:4}}>
                        <RSInput
                            control={control}
                            name="senderId"
                            placeholder={SENDER_ID}
                            maxLength={20}
                            required
                            rules={getSenderIdRules()}
                            noEmoji={true}
                        />
                    </Col>
                </Row>
            </div>
        </>
    );

    // ─── Render: DLT Section ────────────────────────────────────────────────
    const renderDltSection = () => (
        <div className="form-group">
            <Row className="align-items-center">
                <Col sm={4}>
                    <div className="d-flex align-items-center gap-3">
                        <label className="fs19 text-break" style={{ width: '35%' }}>
                            DLT enabled
                        </label>
                        <RSSwitch
                            control={control}
                            name="dltEnabled"
                            disabled={isIndia}
                            handleChange={handleDltChange}
                        />
                    </div>
                </Col>
                <Col sm={4}>
                    {isDltEnabled && (
                        <>
                                <RSInput
                                    name="dltEntityId"
                                    placeholder="DLT entity ID (PE ID)"
                                    control={control}
                                    required
                                    maxLength={150}
                                    rules={{ required: 'Enter DLT entity ID (PE ID)', minLength: { value: MIN_LENGTH, message: MINLENGTH }, }}
                                    noEmoji={true}
                                />
                            </>
                    )}
                </Col>
            </Row>
        </div>
    );

    // ─── Render: Two Way SMS Section (toggle + Friendly name | Enter keyword | Sender ID | + on same row) ─
    const renderTwoWaySection = () => (
        <div className="form-group">
            <Row className="">
                <Col sm={4}>
                    <div className="d-flex align-items-center gap-3">
                        <label className="fs19 text-break" style={{ width: '35%' }}>
                            Two way SMS
                        </label>
                        <RSSwitch control={control} name="settingType.TwoWaySMS" handleChange={handleTwoWaySMSChange} />
                    </div>
                </Col>
                {isTwoWaySMS && (
                    <Col sm={8}>
                        {senderFields.map((field, index) => {
                            if (isUpdate && !field?.isActive) return null;
                            if (field?.isDelete) return null;

                            return (
                                <Row key={field.id} className={index >= 1 ? 'mt41' : ''}>
                                    <Col>
                                        <RSInput
                                            control={control}
                                            name={`senderDetails[${index}].clientfriendlyName`}
                                            id="rs_SMPPCreate_condition_Name"
                                            placeholder={FRIENDLY_NAME}
                                            required
                                            maxLength={150}
                                            rules={getFriendlyNameRules()}
                                            noEmoji={true}
                                        />
                                    </Col>
                                    <Col>
                                        <RSInput
                                            control={control}
                                            name={`senderDetails[${index}].keyword`}
                                            id="rs_SMPPCreate_Keyword"
                                            placeholder="Enter keyword"
                                            required
                                            maxLength={150}
                                            rules={getKeywordRules()}
                                            noEmoji={true}
                                        />
                                    </Col>
                                    <Col className="pr0 error-text-block">
                                        <RSInput
                                            control={control}
                                            name={`senderDetails[${index}].clientsmsSenderName`}
                                            placeholder={SENDER_ID}
                                            id="rs_SMPPCreate_Inboundnumber"
                                            required
                                            maxLength={20}
                                            rules={senderIdRules}
                                            noEmoji={true}
                                        />
                                    </Col>
                                    <div style={{ width: '8%' }}>
                                        <RSTooltip
                                            text={index === 0 ? ADD : REMOVE}
                                            position="top"
                                            className="lh0 float-end position-relative top5"
                                        >
                                            <div     className={`${
                                                    (canAddMoreSenders && index === 0) ||
                                                    (errors?.senderDetails && index === 0)
                                                        ? 'pe-none click-off'
                                                        : ''
                                                }`}>
                                            <i
                                                onClick={() => handleAddOrRemoveSender(index)}
                                                className={`${selectIcon(index)} icon-md pointer`}
                                            />
                                            </div>
                                        </RSTooltip>
                                    </div>
                                </Row>
                            );
                        })}
                    </Col>
                )}
            </Row>
        </div>
    );

    // ─── Render: Form Actions ───────────────────────────────────────────────
    const renderFormActions = () => (
        <div className="buttons-holder pref-cs-buttons-outside mt20">
            <RSSecondaryButton
                type="button"
                blockInteraction={isSaveLoading}
                onClick={() => {
                    if (isSaveLoading) return;
                    handleCancel(true);
                }}
                id="rs_SMPPCreate_Cancel"
            >
                {CANCEL}
            </RSSecondaryButton>
            {addAccess && (
                <RSPrimaryButton
                    type="submit"
                    form={SMPP_CREATE_FORM_ID}
                    isLoading={isSaveLoading}
                    blockBodyPointerEvents={isSaveLoading}
                    disabledClass={`${Object?.keys(errors)?.length ? 'pe-none click-off' : ''}`}
                    id="rs_SMPPCreate_Save"
                >
                    {isUpdate ? UPDATE : SAVE}
                </RSPrimaryButton>
            )}
        </div>
    );

    // ─── Main Render ────────────────────────────────────────────────────────
    const formActions = actionsPortalTarget ? createPortal(renderFormActions(), actionsPortalTarget) : null;

    return (
        <>
            <CommunicationSettingsEditSkeletonGate
                isLoading={pageLoadApi.isFetching}
                isEditMode={isUpdate}
                actionsPortalId={SMS_VENDOR_FORM_ACTIONS_PORTAL_ID}
                formSkeletonVariant="messaging-vendor"
            >
                <FormProvider {...methods}>
                    <form id={SMPP_CREATE_FORM_ID} onSubmit={handleSubmit(handleFormSubmit)}>
                        {renderVendorConfig()}
                        {renderMessageTypeSection()}
                        {renderDltSection()}
                        {renderTwoWaySection()}
                    </form>
                </FormProvider>
            </CommunicationSettingsEditSkeletonGate>
            {formActions}
        </>
    );
};

export default SMPPCreate;
