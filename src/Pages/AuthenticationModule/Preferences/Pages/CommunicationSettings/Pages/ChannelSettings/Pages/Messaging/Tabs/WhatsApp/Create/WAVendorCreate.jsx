import { LIST_NAME_CREATION, MAX_LENGTH, MAX_LENGTH100, MAX_LENGTH150, MAX_LENGTH500, MAX_LENGTH75 } from 'Constants/GlobalConstant/Regex';
import { DUPLICATE_VALUE, ENTER_TEMPLATE_ID, ENTER_TEMPLATE_NAME } from 'Constants/GlobalConstant/ValidationMessage';
import { CANCEL, FRIENDLY_NAME, MIN_3_CHARACTERS, TEMPLATE, TEMPLATE_NAME } from 'Constants/GlobalConstant/Placeholders';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import { useForm, FormProvider, useFieldArray, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { updateQueryParams } from 'Utils/modules/urlQuery';
import { validateIsCustomNavigate } from 'Utils/modules/navigation';
import useQueryParams from 'Hooks/useQueryParams';


import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSInput from 'Components/FormFields/RSInput';
import RSReactPhoneInput from 'Components/FormFields/RSPhoneInput/RSReactPhoneInput';
import { FORM_INITIAL_STATE, WHATSAPP_FORM_ACTIONS_PORTAL_ID } from '../constants';
import { WhatsAppProvider } from '../Context';
import { LIST_NAME_RULES } from 'Constants/GlobalConstant/Rules';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';

import usePermission from 'Hooks/usePersmission';
import {
    checkWhatsAppFriendlyNameExist,
    getCSServiceProviders,
    getCSWAUpdateGet,
    upsertWhatsAppSettings,
} from 'Reducers/preferences/CommunicationSettings/request';
import { getSessionId } from 'Reducers/globalState/selector';
import ListNameExists from 'Components/ListNameExists';
import { RenderVendors } from './constant';
import { updateCommunicationSettings } from 'Reducers/preferences/CommunicationSettings/reducer';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';
import { CommunicationSettingsEditSkeletonGate } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';


const WA_VENDOR_CREATE_FORM_ID = 'rs_WhatsAppCreate_Form';

const ADD_VENDOR_COMM_QUERY_KEYS_TO_CLEAR = {
    backNavigationDetails: null,
    backAction: null,
    mode: null,
    from: null,
    campaignType: null,
};

const WAVendorCreate = ({ type, config, handleCancel, setFailedApi }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const queryState = useQueryParams('/preferences/communication-settings');
    const { addVendorFromComm } = useContext(WhatsAppProvider) || {};
    const isNavigatingBackToCommRef = useRef(false);
    const methods = useForm(FORM_INITIAL_STATE);
    const { permissions } = usePermission();
    const { addAccess } = permissions || {};
    const [senderAndResponse, setSenderAndResponse] = useState({
        sender: [],
        response: [],
    });
    const [initialFriendlyName, setInitialFriendlyName] = useState('');

    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const settingsProviders = useSelector((state) => state.communicationSettingsReducer?.settingsProviders ?? []);
    const isUpdate = type === 'edit';
    const sessionReady = Boolean(clientId && userId != null && departmentId != null);
    const pageLoadApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const saveApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const isSaveLoading = saveApi.isFetching;
    const showFieldLoader = pageLoadApi.isLoading && !isUpdate;

    const {
        control,
        handleSubmit,
        trigger,
        setValue,
        reset,
        watch,
        setError,
        clearErrors,
        formState: { errors },
    } = methods;

    const {
        fields: senderFields,
        append: senderAppend,
        remove: senderRemove,
    } = useFieldArray({
        control,
        name: 'senderDetails',
    });
    const [provider] = watch(['provider']);
    const senderDetailsWatch = useWatch({
        control,
        name: 'senderDetails',
    });

    const getUpdateData = useCallback(
        async (providersList = []) => {
        const res = await dispatch(
            getCSWAUpdateGet({ clientWASettingID: config?.clientWASettingID || 0, departmentId, clientId, userId }),
        );
        const { status, data } = res;
        if (status) {
            let { serviceProviderID, friendlyName = '', credentials = [], wabaDetails = {} } = data;
            const tempProviders = providersList?.length ? providersList : [];
            let tempProvider = tempProviders?.find((item) => item?.serviceProviderId === serviceProviderID);

            setInitialFriendlyName(friendlyName || '');

            reset(
                (prev) => ({
                    ...prev,
                    provider: tempProvider,
                    vendorFriendlyName: friendlyName,
                    wabaId: wabaDetails?.wabaId || '',
                    displayName: wabaDetails?.displayName || '',
                    mobileNumberID: wabaDetails?.phoneNumberId || '',
                }),
                { keepIsValid: true },
            );
            credentials.forEach((item) => {
                const key = item.key;
                const value = item.value;
                setValue(key, value);
            });
        } else {
            setFailedApi('GetWhatsAppSettigByID');
        }
    },
        [
            dispatch,
            config?.clientWASettingID,
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
                    getCSServiceProviders({ channel: 21, departmentId, clientId, userId }),
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
        return () => {
            dispatch(updateCommunicationSettings({ field: 'settingsProviders', payload: [] }));
        };
    }, [sessionReady, departmentId, clientId, userId, isUpdate, config?.clientWASettingID, dispatch]);

    // const addsenderDetails = (index) => {
    //     if (index === 0) {
    //         let validationState = senderDetailsWatch.findIndex((list) => {
    //             let values = Object.values(list);
    //             return values.includes('');
    //         });

    //         if (validationState === -1) {
    //             senderAppend({ senderId: '', senderName: '', isDelete: false });
    //         } else {
    //             trigger(`senderDetails[${validationState}]`);
    //         }
    //     } else {
    //         // setValue(`senderDetails.${index}.isDelete`, true);
    //         let temp = senderDetailsWatch[index];
    //         temp.isDelete = true;
    //         // temp.clientwaSenderId = 0;
    //         setSenderAndResponse((prev) => ({
    //             ...prev,
    //             sender: [...senderAndResponse?.sender, temp],
    //         }));
    //         senderRemove(index);
    //         console.log('Deleter ::: ', index);
    //     }
    // };

    // const {
    //     fields: responseFields,
    //     append: responseAppend,
    //     remove: responseRemove,
    // } = useFieldArray({
    //     control,
    //     name: 'whatsAppResponse',
    // });

    // const whatsAppResponseWatch = useWatch({
    //     control,
    //     name: 'whatsAppResponse',
    // });

    // console.log('Sender :::: ', senderDetailsWatch);

    // const addwhatsAppResponse = (index) => {
    //     if (index === 0) {
    //         let validationState = whatsAppResponseWatch.findIndex((list) => {
    //             console.log('list: ', list);
    //             let values = Object.values(list);
    //             return values.includes('');
    //         });
    //         console.log('=======');
    //         console.log('validationState: ', validationState);
    //         if (validationState === -1) {
    //             responseAppend({ template: '', templateName: '', isDelete: false });
    //         } else {
    //             trigger(`whatsAppResponse[${validationState}]`);
    //         }
    //     } else {
    //         let temp = whatsAppResponseWatch[index];
    //         temp.isDelete = true;
    //         // temp.clientWAResponseId = 0;
    //         // setValue(`whatsAppResponse.${index}.isDelete`, true);
    //         setSenderAndResponse((prev) => ({
    //             ...prev,
    //             response: [...senderAndResponse?.response, temp],
    //         }));
    //         responseRemove(index);
    //     }
    // };

    const handleFormSubmit = async (formState) => {
        if (saveApi.isFetching) return;
        const selectedProvider = formState.provider;
        const credentialKeys = selectedProvider?.configuration?.credentials ?? [];

        // Build credentials array dynamically from selected provider's configuration
        const credentials = credentialKeys.map((cred) => ({
            key: cred.key,
            value: formState[cred.key] ?? '',
        }));

        const payload = {
            clientWASettingID: isUpdate ? config?.clientWASettingID || 0 : 0,
            serviceProviderID: selectedProvider?.serviceProviderId || 0,
            friendlyName: formState.vendorFriendlyName ?? '',
            vendor: selectedProvider?.serviceProviderName ?? '',
            credentials,
            wabaDetails: {
                wabaId: formState.wabaId ?? '',
                phoneNumberId: formState.mobileNumberID ?? '',
                displayName: formState.displayName ?? '',
            },
            status: 'active',
        };

        await saveApi.refetch({
            fetcher: () => dispatch(upsertWhatsAppSettings(payload, handleSaveComplete, false)),
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

    const [actionsPortalTarget, setActionsPortalTarget] = useState(null);

    useEffect(() => {
        setActionsPortalTarget(document.getElementById(WHATSAPP_FORM_ACTIONS_PORTAL_ID));

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
                id="rs_WhatsAppCreate_Cancel"
            >
                {CANCEL}
            </RSSecondaryButton>
            {addAccess && (
                <RSPrimaryButton
                    type="submit"
                    form={WA_VENDOR_CREATE_FORM_ID}
                    isLoading={isSaveLoading}
                    blockBodyPointerEvents={isSaveLoading}
                    id="rs_WhatsAppCreate_Update"
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
                actionsPortalId={WHATSAPP_FORM_ACTIONS_PORTAL_ID}
                formSkeletonVariant="messaging-vendor"
            >
                <FormProvider {...methods}>
                    <form id={WA_VENDOR_CREATE_FORM_ID} onSubmit={handleSubmit(handleFormSubmit)}>
                    <div className="rs-sub-heading">
                        <div className="rss-left">
                            <h4>{'WhatsApp vendor configuration'}</h4>
                        </div>
                    </div>
                    <div className="form-group">
                        <Row>
                            <Col sm={6} id="rs_WhatsAppCreate_vendorFriendlyName">
                                <ListNameExists
                                    name="vendorFriendlyName"
                                    control={control}
                                    field="vendorFriendlyName"
                                    apiCallback={checkWhatsAppFriendlyNameExist}
                                    condition={(status) => {
                                        return !status?.status;
                                    }}
                                    extraPayload={{
                                        channel: 21,
                                    }}
                                    maxLength={MAX_LENGTH}
                                    placeholder={FRIENDLY_NAME || 'Vendor friendly name'}
                                    rules={{
                                        ...LIST_NAME_RULES('Enter friendly name'),
                                    }}
                                    currentValue={isUpdate ? initialFriendlyName : ''}
                                />
                            </Col>
                            <Col sm={6} id="rs_WhatsAppCreate_provider">
                                <RSKendoDropDownList
                                    name={'provider'}
                                    data={settingsProviders}
                                    control={control}
                                    textField={'serviceProviderName'}
                                    dataItemKey={'serviceProviderId'}
                                    label={'Vendor'}
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

                    {!!provider && (
                        <>
                            <div className="rs-sub-heading">
                                <div className="rss-left">
                                    <h4>{'Vendor credentials'}</h4>
                                </div>
                            </div>
                            <div className="form-group">
                                <Row>
                                    {RenderVendors(provider)?.fields?.length > 0 ? (
                                        RenderVendors(provider)?.fields?.map((field, index) => (
                                            <Col key={field.name} sm={6}>
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
                                                ) : (
                                                    <RSInput
                                                        label={field.placeHolder}
                                                        name={field.name}
                                                        control={control}
                                                        required
                                                        type={field.type}
                                                        rules={{
                                                            required: field.required,
                                                            maxLength: {
                                                                value: MAX_LENGTH150,
                                                                message: 'Maximum 150 characters allowed',
                                                            },
                                                        }}
                                                        maxLength={MAX_LENGTH150}
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
                                        ))
                                    ) : (
                                        <>
                                           <NoDataAvailableRender message={'No credentials details available'} isShowIcon={false} className='w-25'/>
                                        </>
                                    )}
                                </Row>
                            </div>
                        </>
                    )}

                    <div className="rs-sub-heading">
                        <div className="rss-left">
                            <h4>{'WhatsApp business account (WABA)'}</h4>
                        </div>
                    </div>
                    <div className="form-group">
                        <Row>
                            <Col sm={4}>
                                <RSInput
                                    type={'text'}
                                    name={'wabaId'}
                                    placeholder={'WABA ID'}
                                    control={control}
                                    required
                                    maxLength={MAX_LENGTH150}
                                    rules={{
                                        required: 'Enter WABA ID',
                                        maxLength: {
                                            value: MAX_LENGTH150,
                                            message: 'Maximum 150 characters allowed',
                                        },
                                    }}
                                />
                            </Col>
                            <Col sm={4}>
                                <RSReactPhoneInput
                                    name={'mobileNumberID'}
                                    control={control}
                                    setError={setError}
                                    clearErrors={clearErrors}
                                    label={'Mobile number'}
                                    required
                                    rules={{
                                        required: 'Enter mobile number',
                                    }}
                                />
                            </Col>
                            <Col sm={4}>
                                <RSInput
                                    type={'text'}
                                    name={'displayName'}
                                    placeholder={'Display name'}
                                    control={control}
                                    required
                                    maxLength={MAX_LENGTH75}
                                    rules={{
                                        required: 'Enter display name',
                                        minLength: {
                                            value: 3,
                                            message: MIN_3_CHARACTERS,
                                        },
                                        pattern: {
                                            value: LIST_NAME_CREATION,
                                            message:
                                                'Double spaces, hyphens, and underscores are not allowed.',
                                        },
                                        maxLength: {
                                            value: MAX_LENGTH75,
                                            message: 'Maximum 75 characters allowed',
                                        },
                                    }}
                                />
                            </Col>
                        </Row>
                    </div>
                    {/* {responseFields.map(
                        (field, index) =>
                            !field?.isDelete && (
                                <div className="whatsAppResponseContainer form-group rs-mb-nm0 mb30" key={field.id}>
                                    <Row>
                                        <Col sm={6}>
                                            <RSInput
                                                control={control}
                                                name={`whatsAppResponse[${index}].template`}
                                                placeholder={TEMPLATE}
                                                id="rs_WhatsAppCreate_Template"
                                                required
                                                rules={{
                                                    required: ENTER_TEMPLATE_ID,
                                                    validate: () => {
                                                        const [status, _] = findDuplicates(
                                                            whatsAppResponseWatch,
                                                            'template',
                                                        );
                                                        return status ? DUPLICATE_VALUE : true;
                                                    },
                                                }}
                                                maxLength={MAX_LENGTH500}
                                            />
                                        </Col>
                                        <Col sm={6}>
                                            <Row>
                                                <Col sm={11} className="pr0">
                                                    <RSInput
                                                        control={control}
                                                        name={`whatsAppResponse[${index}].templateName`}
                                                        placeholder={TEMPLATE_NAME}
                                                        id="rs_WhatsAppCreate_TemplateName"
                                                        required
                                                        rules={{
                                                            required: ENTER_TEMPLATE_NAME,
                                                        }}
                                                        maxLength={MAX_LENGTH100}
                                                    />
                                                </Col>
                                                <Col sm={1} className="fg-icons-wrapper position-relative right8">
                                                    <div className="fg-icons">
                                                        <RSTooltip text={index === 0 ? 'Add' : 'Delete'} position="top">
                                                            <i
                                                                onClick={() => addwhatsAppResponse(index)}
                                                                className={`${selectIcon(index)} icon-md cp ${
                                                                    responseFields?.length > 4 && index == 0
                                                                        ? 'click-off'
                                                                        : ''
                                                                }`}
                                                            ></i>
                                                        </RSTooltip>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </div>
                            ),
                    )} */}
                    </form>
                </FormProvider>
            </CommunicationSettingsEditSkeletonGate>
            {formActions}
        </>
    );
};

export default WAVendorCreate;
