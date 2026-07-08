import { charNumUnderScore } from 'Utils/modules/inputValidators';
import { MAX_LENGTH, MAX_LENGTH150, MAX_LENGTH256, MAX_LENGTH75, URLPATTERN } from 'Constants/GlobalConstant/Regex';
import { ENTER_VALID_URL, UPLOAD_FILE } from 'Constants/GlobalConstant/ValidationMessage';
import { CANCEL } from 'Constants/GlobalConstant/Placeholders';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { updateQueryParams } from 'Utils/modules/urlQuery';
import { validateIsCustomNavigate } from 'Utils/modules/navigation';
import useQueryParams from 'Hooks/useQueryParams';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';



import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSInput from 'Components/FormFields/RSInput';
import { FORM_INITIAL_STATE, RCS_FORM_ACTIONS_PORTAL_ID } from '../constants';
import { RCSProvider } from '../Context';

import usePermission from 'Hooks/usePersmission';
import {
    createCSRCSSettings,
    getCSRCSCreateProviders,
    getCSRCSUpdateGet,
    checkRCSFriendlyNameExist,
} from 'Reducers/preferences/CommunicationSettings/request';
import { getCSServiceProvidersData } from 'Reducers/preferences/CommunicationSettings/selector';
import { getSessionId } from 'Reducers/globalState/selector';
import { RenderVendors } from './constant';
import { LIST_NAME_RULES } from 'Constants/GlobalConstant/Rules';
import ListNameExists from 'Components/ListNameExists';
import RSFileUpload from 'Components/FormFields/RSFileUpload';
import { uploadMessagingImage } from 'Reducers/communication/createCommunication/Create/request';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';
import { CommunicationSettingsEditSkeletonGate } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';


const RCS_VENDOR_CREATE_FORM_ID = 'rs_RCSCreate_Form';

const ADD_VENDOR_COMM_QUERY_KEYS_TO_CLEAR = {
    backNavigationDetails: null,
    backAction: null,
    mode: null,
    from: null,
    campaignType: null,
};

const RCSVendorCreate = ({ type, config, handleCancel, setFailedApi }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const queryState = useQueryParams('/preferences/communication-settings');
    const { addVendorFromComm } = useContext(RCSProvider) || {};
    const isNavigatingBackToCommRef = useRef(false);
    const methods = useForm(FORM_INITIAL_STATE);
    const { permissions } = usePermission();
    const { addAccess } = permissions || {};
    const [countries, setCountries] = useState([]);
    const [initialFriendlyName, setInitialFriendlyName] = useState('');

    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const RCSsettingsProviders = useSelector((state) => getCSServiceProvidersData(state));
    const isUpdate = type === 'edit';
    const sessionReady = Boolean(clientId && userId != null && departmentId != null);
    const pageLoadApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const saveApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const isSaveLoading = saveApi.isFetching;
    const showFieldLoader = pageLoadApi.isLoading && !isUpdate;

    const {
        control,
        handleSubmit,
        setValue,
        reset,
        watch,
        clearErrors,
        setError,
        formState: { errors },
    } = methods;

        const [provider, brandLogoUrl] = useWatch({
        control,
        name: ['provider', 'brandLogoUrl'],
    });

    const handleBrandLogoUpload = async ({ base64, fileName, contentLength }) => {
        const payloadData = {
            base64Image: base64,
            imageFormat: fileName.split('.')?.pop(),
            contentLength,
            departmentId,
            clientId,
            userId,
            fileName: fileName,
            channelId: 41,
        };

        try {
            const { data, status } = await dispatch(uploadMessagingImage({ payload: payloadData }));
            if (status) {
                setValue('brandLogoUrl', data, {
                    shouldValidate: true,
                    shouldDirty: true,
                });
                clearErrors('brandLogoUrl');
            } else {
                setError('brandLogoUrl', {
                    type: 'custom',
                    message: 'Exception occurs',
                });
            }
        } catch (err) {
            setError('brandLogoUrl', {
                type: 'custom',
                message: 'Exception occurs',
            });
        }
    };

    const getUpdateData = useCallback(
        async (providersList = []) => {
        const res = await dispatch(
            getCSRCSUpdateGet({ clientRCSSettingId: config?.clientRCSSettingId || 0, departmentId, clientId, userId }),
        );
        const { status, data } = res;
        if (status) {
            let {
                serviceProviderId,
                friendlyName = '',
                credentials = [],
                agentConfig = {},
                callbacks = {},
                countryCode = '',
            } = data;
            const tempProviders = providersList?.length ? providersList : [];
            let tempProvider = tempProviders?.find((item) => item?.serviceProviderId === serviceProviderId);

            setInitialFriendlyName(friendlyName || '');

            reset(
                (prev) => ({
                    ...prev,
                    provider: tempProvider,
                    vendorFriendlyName: friendlyName,
                    agentId: agentConfig?.agentId || '',
                    agentName: agentConfig?.agentName || '',
                    brandName: agentConfig?.brandName || '',
                    brandLogoUrl: agentConfig?.brandLogoUrl || '',
                    websiteUrl: agentConfig?.websiteUrl || '',
                    privacyPolicyUrl: callbacks?.privacyPolicyUrl || '',
                    messageStatusCallbackUrl: callbacks?.messageStatusCallbackUrl || '',
                    userInteractionCallbackUrl: callbacks?.userInteractionCallbackUrl || '',
                    optOutCallbackUrl: callbacks?.optOutCallbackUrl || '',
                    countryCode: countryCode || '',
                }),
                { keepIsValid: true },
            );

            // Set credentials dynamically
            credentials.forEach((item) => {
                const key = item.key;
                const value = item.value;
                setValue(key, value);
            });
        } else {
            setFailedApi('GetRCSSettigByID');
        }
    },
        [
            dispatch,
            config?.clientRCSSettingId,
            departmentId,
            clientId,
            userId,
            reset,
            setValue,
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
                    getCSRCSCreateProviders({ type: 'R', departmentId, clientId, userId }),
                );
                if (isUpdate) {
                    await getUpdateData(providersRes?.data ?? []);
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
        dispatch,
        pageLoadApi.refetch,
        getUpdateData,
    ]);

    const bootstrapPageRef = useRef(bootstrapPage);
    bootstrapPageRef.current = bootstrapPage;

    useEffect(() => {
        if (!sessionReady) return undefined;
        bootstrapPageRef.current();
    }, [sessionReady, departmentId, clientId, userId, isUpdate, config?.clientRCSSettingId]);

    const handleFormSubmit = async (formState) => {
        if (saveApi.isFetching) return;
        const vendorFields = RenderVendors(provider)?.fields || [];

        // Build credentials array with key-value pairs
        const credentialsArray = [];
        vendorFields.forEach((field) => {
            if (
                field.name !== 'countryCode' &&
                formState[field.name] !== undefined &&
                formState[field.name] !== null &&
                formState[field.name] !== ''
            ) {
                credentialsArray.push({
                    key: field.name,
                    value: formState[field.name],
                });
            }
        });

        // Build agentConfig object
        const agentConfig = {
            agentId: formState.agentId || '',
            agentName: formState.agentName || '',
            brandName: formState.brandName || '',
            brandLogoUrl: formState.brandLogoUrl || '',
            websiteUrl: formState.websiteUrl || '',
        };

        // Build callbacks object
        const callbacks = {
            privacyPolicyUrl: formState.privacyPolicyUrl || '',
            messageStatusCallbackUrl: formState.messageStatusCallbackUrl || '',
            userInteractionCallbackUrl: formState.userInteractionCallbackUrl || '',
            optOutCallbackUrl: formState.optOutCallbackUrl || '',
        };

        const payload = {
            departmentId,
            clientId,
            userId,
            clientRCSSettingId: isUpdate ? config.clientRCSSettingId : 0,
            friendlyName: formState.vendorFriendlyName,
            serviceProviderId: formState.provider?.serviceProviderId,
            countryCode: formState.countryCode || formState.country?.countryCode || '',
            credentials: credentialsArray,
            agentConfig,
            callbacks,
            customParams: [],
            senderId: formState.agentId || '',
            senderName: formState.agentName || '',
            vendorId: formState.provider?.configuration?.customData?.vendorID || '',
        };
        await saveApi.refetch({
            fetcher: () => dispatch(createCSRCSSettings(payload, handleSaveComplete, false)),
            loaderConfig: fieldLoaderConfig,
            mode: 'create',
        });
    };

    const handleReturn = () => {
        if (addVendorFromComm) {
            isNavigatingBackToCommRef.current = true;
            validateIsCustomNavigate(queryState, queryState, navigate, () => {
                handleCancel(true);
            }, { dispatch });
            return;
        }
        handleCancel(true);
    };

    const handleSaveComplete = (status) => {
        if (status) handleReturn();
    };

    const vendorFields = RenderVendors(provider)?.fields || [];
    const hasDynamicCountry = vendorFields.some((f) => f.name === 'countryCode');

    const [actionsPortalTarget, setActionsPortalTarget] = useState(null);

    useEffect(() => {
        setActionsPortalTarget(document.getElementById(RCS_FORM_ACTIONS_PORTAL_ID));

        return () => {
            setActionsPortalTarget(null);
            if (addVendorFromComm && !isNavigatingBackToCommRef.current) {
                updateQueryParams(ADD_VENDOR_COMM_QUERY_KEYS_TO_CLEAR);
            }
        };
    }, []);

    const renderFormActions = () => (
        <div className="buttons-holder pref-cs-buttons-outside mt20">
            <RSSecondaryButton
                type="button"
                blockInteraction={isSaveLoading}
                onClick={() => {
                    if (isSaveLoading) return;
                    handleReturn();
                }}
                id="rs_RCSCreate_Cancel"
            >
                {CANCEL}
            </RSSecondaryButton>
            {addAccess && (
                <RSPrimaryButton
                    type="submit"
                    form={RCS_VENDOR_CREATE_FORM_ID}
                    isLoading={isSaveLoading}
                    blockBodyPointerEvents={isSaveLoading}
                    id="rs_RCSCreate_Update"
                >
                    {isUpdate ? 'Update' : 'Save'}
                </RSPrimaryButton>
            )}
        </div>
    );

    const formActions = actionsPortalTarget ? createPortal(renderFormActions(), actionsPortalTarget) : null;

    return (
        <>
            <CommunicationSettingsEditSkeletonGate
                isLoading={pageLoadApi.isFetching}
                isEditMode={isUpdate}
                actionsPortalId={RCS_FORM_ACTIONS_PORTAL_ID}
                formSkeletonVariant="messaging-vendor"
            >
        <FormProvider {...methods}>
            <form id={RCS_VENDOR_CREATE_FORM_ID} onSubmit={handleSubmit(handleFormSubmit)}>
                <>
                    {/* RCS vendor configuration */}
                    <div className="rs-sub-heading">
                        <div className="rss-left">
                            <h4>{'RCS vendor configuration'}</h4>
                        </div>
                    </div>
                    <div className="form-group">
                        <Row>
                            <Col sm={6}>
                                <ListNameExists
                                    name="vendorFriendlyName"
                                    control={control}
                                    field="friendlyName"
                                    apiCallback={checkRCSFriendlyNameExist}
                                    condition={(status) => {
                                        return !status?.status;
                                    }}
                                    extraPayload={{
                                        channel: 41,
                                    }}
                                    placeholder={'Vendor friendly name'}
                                    rules={{
                                        ...LIST_NAME_RULES('Enter vendor friendly name'),
                                    }}
                                    maxLength={MAX_LENGTH}
                                    currentValue={isUpdate ? initialFriendlyName : ''}
                                />
                            </Col>
                            <Col sm={6}>
                                <RSKendoDropDownList
                                    name={'provider'}
                                    data={RCSsettingsProviders}
                                    control={control}
                                    textField={'serviceProviderName'}
                                    dataItemKey={'serviceProviderId'}
                                    label={'RCS vendor'}
                                    required
                                    isLoading={showFieldLoader}
                                    handleChange={() => {
                                        vendorFields?.forEach((item) => {
                                            setValue(item?.name, '');
                                        });
                                    }}
                                    rules={{
                                        required: 'Select vendor',
                                    }}
                                />
                            </Col>
                        </Row>
                    </div>

                    {/* Vendor credentials */}
                    {!!provider && (
                        <>
                            <div className="rs-sub-heading">
                                <div className="rss-left">
                                    <h4>{'Vendor credentials'}</h4>
                                </div>
                            </div>
                            <div className="form-group">
                                <Row>
                                    {vendorFields?.length > 0 ? (
                                        vendorFields.map((field, index) => {
                                            const fieldValue = watch(field.name);
                                            return (
                                                <Col key={field.name} sm={4}>
                                                    {field.type === 'dropdown' ? (
                                                        <RSKendoDropDownList
                                                            name={field.name}
                                                            data={field.options}
                                                            control={control}
                                                            textField="label"
                                                            dataItemKey="value"
                                                            label={field.placeHolder}
                                                            required
                                                            rules={{
                                                                required: field.required,
                                                            }}
                                                        />
                                                    ) : field.type === 'fileUpload' ? (
                                                        <RSFileUpload
                                                            control={control}
                                                            name={field.name}
                                                            id={`rs_RCSVendorCreate_${field.name}`}
                                                            text="Upload"
                                                            placeholder={
                                                                errors[field.name] &&
                                                                errors[field.name].type === 'required'
                                                                    ? 'Upload file'
                                                                    : type === 'edit'
                                                                    ? fieldValue
                                                                    : `Upload ${field.placeHolder}`
                                                            }
                                                            accept={'.json'}
                                                            clearErrors={clearErrors}
                                                            setError={setError}
                                                            required
                                                            size={500000}
                                                            rules={{
                                                                required: UPLOAD_FILE,
                                                            }}
                                                            isbase64
                                                            watch={watch}
                                                            handleChange={(e) => {
                                                                setValue(
                                                                    `${field.name}FileName`,
                                                                    e.target.value.split('\\').pop(),
                                                                );
                                                                clearErrors(field.name);
                                                            }}
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
                                                            }}
                                                            maxLength={MAX_LENGTH256}
                                                            viewEye={field.viewEye}
                                                            handleOnBlur={(e) => {
                                                                setValue(field.name, e.target.value?.trim(), {
                                                                    shouldValidate: true,
                                                                    shouldDirty: true,
                                                                });
                                                            }}
                                                            handleOnPaste={(e) => {
                                                                e.preventDefault();
                                                                const pastedData = e.clipboardData.getData('text');
                                                                const cleaned = pastedData.trim();
                                                                setValue(field.name, cleaned, {
                                                                    shouldValidate: true,
                                                                    shouldDirty: true,
                                                                });
                                                            }}
                                                        />
                                                    )}
                                                </Col>
                                            );
                                        })
                                    ) : (
                                        <>
                                            <NoDataAvailableRender
                                                message={'No credentials details available'}
                                                isShowIcon={false}
                                                className="w-25"
                                            />
                                        </>
                                    )}
                                </Row>
                            </div>
                        </>
                    )}

                    {/* Agent (Brand) configuration */}
                    <div className="rs-sub-heading">
                        <div className="rss-left">
                            <h4>{'Agent (Brand) configuration'}</h4>
                        </div>
                    </div>
                    <div className="form-group">
                        <Row>
                            <Col sm={4}>
                                <RSInput
                                    type={'text'}
                                    name={'agentId'}
                                    placeholder={'Agent ID'}
                                    control={control}
                                    required
                                    rules={{ required: 'Enter agent ID' }}
                                    onKeyDown={charNumUnderScore}
                                    maxLength={MAX_LENGTH75}
                                />
                            </Col>
                            <Col sm={4}>
                                <RSInput
                                    type={'text'}
                                    name={'agentName'}
                                    placeholder={'Agent name'}
                                    control={control}
                                    required
                                    rules={{ required: 'Enter agent name' }}
                                    onKeyDown={charNumUnderScore}
                                    maxLength={MAX_LENGTH75}
                                />
                            </Col>
                            <Col sm={4}>
                                <RSInput
                                    type={'text'}
                                    name={'brandName'}
                                    placeholder={'Brand name'}
                                    control={control}
                                    required
                                    rules={{ required: 'Enter brand name' }}
                                    onKeyDown={charNumUnderScore}
                                    maxLength={MAX_LENGTH150}
                                />
                            </Col>
                        </Row>
                    </div>
                    <div className="form-group">
                        <Row>
                            <Col sm={4}>
                                <RSInput
                                    type={'text'}
                                    name={'websiteUrl'}
                                    placeholder={'Website URL'}
                                    control={control}
                                    required
                                    rules={{
                                        required: 'Enter website URL',
                                        pattern: { value: URLPATTERN, message: ENTER_VALID_URL },
                                    }}
                                />
                            </Col>
                            <Col sm={4}>
                                <RSFileUpload
                                    control={control}
                                    name="brandLogoUrl"
                                    id="rs_RCSVendorCreate_brandLogoUrl"
                                    text="Upload"
                                    placeholder={
                                        brandLogoUrl && brandLogoUrl.type === 'required'
                                            ? 'Upload file'
                                            : type === 'edit'
                                            ? brandLogoUrl
                                            : 'Upload brand logo'
                                    }
                                    accept={'.png,.jpg,.jpeg'}
                                    clearErrors={clearErrors}
                                    setError={setError}
                                    required
                                    size={500000}
                                    rules={{
                                        required: UPLOAD_FILE,
                                    }}
                                    isbase64
                                    isPrefix
                                    fileType="img"
                                    watch={watch}
                                    base64Data={async (base64, fileName, contentLength) => {
                                        await handleBrandLogoUpload({ base64, fileName, contentLength });
                                    }}
                                    isBase64Status
                                    handleChange={(e) => {
                                        setValue('brandLogoImageName', e.target.value.split('\\').pop());
                                        clearErrors('brandLogoUrl');
                                    }}
                                />
                            </Col>
                            {/* <Col sm={4}>
                                <RSInput
                                    type={'text'}
                                    name={'privacyPolicyUrl'}
                                    placeholder={'Privacy policy URL'}
                                    control={control}
                                    required
                                    rules={{
                                        required: 'Enter privacy policy URL',
                                        pattern: { value: URLPATTERN, message: ENTER_VALID_URL },
                                    }}
                                />
                            </Col> */}
                        </Row>
                    </div>

                    {/* Callbacks */}
                    {/* <div className="rs-sub-heading">
                        <div className="rss-left">
                            <h4>{'Callbacks'}</h4>
                        </div>
                    </div>
                    <div className="form-group pb15">
                        <Row>
                            <Col sm={4}>
                                <RSInput
                                    type={'text'}
                                    name={'messageStatusCallbackUrl'}
                                    placeholder={'Message status callback URL'}
                                    control={control}
                                    required
                                    rules={{
                                        required: 'Enter message status callback URL',
                                        pattern: { value: URLPATTERN, message: ENTER_VALID_URL },
                                    }}
                                />
                            </Col>
                            <Col sm={4}>
                                <RSInput
                                    type={'text'}
                                    name={'userInteractionCallbackUrl'}
                                    placeholder={'User interaction callback URL'}
                                    control={control}
                                    required
                                    rules={{
                                        required: 'Enter user interaction callback URL',
                                        pattern: { value: URLPATTERN, message: ENTER_VALID_URL },
                                    }}
                                />
                            </Col>
                            <Col sm={4}>
                                <RSInput
                                    type={'text'}
                                    name={'optOutCallbackUrl'}
                                    placeholder={'Opt-out callback URL'}
                                    control={control}
                                    required
                                    rules={{
                                        required: 'Enter opt-out callback URL',
                                        pattern: { value: URLPATTERN, message: ENTER_VALID_URL },
                                    }}
                                />
                            </Col>
                        </Row>
                    </div> */}
                </>
            </form>
        </FormProvider>
            </CommunicationSettingsEditSkeletonGate>
            {formActions}
        </>
    );
};

export default RCSVendorCreate;
