import { encryptWithAES, iv } from 'Utils/modules/crypto';
import { GeneratePasswordpseudorandom } from 'Utils/modules/passwordUtils';
import { MAX_LENGTH15, MAX_LENGTH25, MAX_LENGTH250, MAX_LENGTH255 } from 'Constants/GlobalConstant/Regex';
import { API_KEY as API_KEY_MSG, AUTH_TOKEN as AUTH_TOKEN_MSG, DATA_BASE_URL, DOMAIN_NAME as DOMAIN_NAME_MSG, DOMAIN_URL as DOMAIN_URL_MSG, MESUREMENT as MESUREMENT_MSG, PROJECT_ID as PROJECT_ID_MSG, SELECT, STORAGE_BUCKET as STORAGE_BUCKET_MSG, UPLOAD_FILE } from 'Constants/GlobalConstant/ValidationMessage';
import { LIST_NAME_RULES, WEBSITE_RULES } from 'Constants/GlobalConstant/Rules';
import { API_KEY, AUTH_TOKEN, DATA_BASE, DOMAIN_NAME, DOMAIN_URL, MESUREMENT, PROJECT_ID, STORAGE_BUCKET, UPLOAD_145_LOGO, VAPID } from 'Constants/GlobalConstant/Placeholders';
import { circle_question_mark_mini } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { Row, Col } from 'react-bootstrap';

import RSInput from 'Components/FormFields/RSInput';
import RSFileUpload from 'Components/FormFields/RSFileUpload';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';

import usePermission from 'Hooks/usePersmission';
import ListNameExists from 'Components/ListNameExists';

import FirebaseJSONUploadModal from './Component/FirebaseJSONUploadModal';
import FCMGuidelinesModal from './Component/FCMGuidelinesModal';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSModal from 'Components/RSModal';
import { FORM_INITIAL_STATE, DOMAIN_FLAVOUR, WEB_FORM_ACTIONS_PORTAL_ID } from '../../../constant';

import { getSessionId } from 'Reducers/globalState/selector';
import CryptoJS from 'crypto-js';
import {
    GetWebPushbyID,
    getWebPushAnalyticsList,
    UpsertWebPushSettings,
    getWebPushDomainNameExist,
    getWebPushDomainURLExist,
    getConfigDetails,
} from 'Reducers/preferences/CommunicationSettings/request';
import { useSelector, useDispatch, useStore } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';
import { CommunicationSettingsEditSkeletonGate } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';


const PUSH_WEB_CREATE_FORM_ID = 'rs_PushWebCreate_Form';

import {
    validateFirebaseServiceAccountJson,
    extractBase64PayloadFromDataUrl,
} from 'Utils/firebaseServiceAccountJson';
import detectTechnology from './utils/detectTechnology';
import IntegrationSuccessModal from '../../../../../Components/IntegrationSuccessModal';
const PushWebCreate = ({ type, handleCancel, config, setFailedApi }) => {
    const methods = useForm(FORM_INITIAL_STATE);
    const { state } = useLocation();
    const navigate = useNavigate();
    const {
        control,
        handleSubmit,
        setError,
        clearErrors,
        reset,
        watch,
        setValue,
        getValues,
        formState: { errors },
    } = methods;
    const { permissions } = usePermission();
    const { addAccess } = permissions || {};
    const dispatch = useDispatch();
    const store = useStore();
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const sessionReady = Boolean(clientId && userId != null && departmentId != null);
    const pageLoadApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const saveApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const isSaveLoading = saveApi.isFetching;
    const watchWebAnalytics = watch('webanalyticssetting');
    let notificationProviderControl = watch('notificationProvider', 'FCM');
    const { getWebPushAnalyticsListData } = useSelector(
        ({ communicationSettingsReducer }) => communicationSettingsReducer,
    );
    const [ fcmJSONFile, domainLogo, jsonName] = watch(['fcmJSONFile', 'domainLogo', 'jsonName']);
    // console.log('domainLogo: ', domainLogo);
    // console.log('fcmJSONFile: ', fcmJSONFile);
    const [websiteLoading, setWebsiteLoading] = useState({ loading: false, valid: false });
    const [technologyDetecting, setTechnologyDetecting] = useState(false);
    const [showJSONUploadModal, setShowJSONUploadModal] = useState(false);
    const [uploadBootstrap, setUploadBootstrap] = useState(null);
    const fcmJsonProcessedRef = useRef('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showFCMGuidelinesModal, setShowFCMGuidelinesModal] = useState(false);
    const brandWebsiteHasError = Object.hasOwn(errors, 'domainUrl');

    // Handler to clear errors when notification provider changes
    const handleClearErrorFCM = () => {
        clearErrors('fcmSenderId');
        clearErrors('fcmServerKey');
    };

    const handleClearErrorV1HTTP = () => {
        clearErrors('fcmJSONFile');
        clearErrors('jsonName');
    };
    const loadEditDomain = useCallback(async () => {
        const analyticsList =
            store.getState().communicationSettingsReducer?.getWebPushAnalyticsListData ?? [];
        const { status, data } = await dispatch(
            GetWebPushbyID({ clientId, userId, departmentId, webnotifySettingId: config?.webNotifySettingId }),
        );
        if (status) {
            let notificationProviderData = data?.isV1 ? 'FCM(V1HTTP)' : 'FCM';
            let senderDetails = data?.AppAnalytics?.map((item) => {
                let tempAction = analyticsList?.filter(
                    (action) => item?.analyticsplatformId === action?.analyticsDomainId,
                );

                return {
                    webanalyticsId: item?.webanalyticsId,
                    analyticsplatformId: tempAction?.[0],
                    serviceAccountEmail: item?.serviceAccountEmail,
                    appSecretId: item?.appsecretId,
                    appKey: item?.appKey,
                };
            });

            let frameworkObj = data?.framework
                ? DOMAIN_FLAVOUR.find((flavour) => flavour.name === data.framework || flavour.id === data.framework)
                : '';

            reset({
                domainName: data?.domainName,
                domainUrl: data?.domainUrl,
                framework: frameworkObj || '',
                domainLogo: data?.imagePath,
                imageName: data?.imagePath?.split('/').pop(),
                notificationProvider: notificationProviderData,
                fcmJSONFile: data?.V1Http?.jsonPath === null ? '' : data?.V1Http?.jsonPath,
                jsonName: data?.V1Http?.jsonPath?.split('/').pop(),
                fcmSenderId: data?.Fcm?.fcmsenderId,
                fcmServerKey: data?.Fcm?.fcmserverkey,
                appId: data?.Firebase?.appId,
                apiKey: data?.Firebase?.apiKey,
                authDomain: data?.Firebase?.authDomain,
                databaseUrl: data?.Firebase?.databaseUrl,
                projectId: data?.Firebase?.projectId,
                storageBucket: data?.Firebase?.storageBucket,
                measurementId: data?.Firebase?.messagingSenderId,
                vapid: data?.Firebase?.vapid,
                webanalyticsetting: senderDetails,
                webanalyticssetting: data?.isAppAnalytics,
            });
        } else if (setFailedApi) {
            setFailedApi('GetWebPushbyID');
        }
    }, [clientId, userId, departmentId, config?.webNotifySettingId, dispatch, reset, setFailedApi, store]);

    const bootstrapPage = useCallback(() => {
        if (!sessionReady) {
            return undefined;
        }
        return pageLoadApi.refetch({
            fetcher: async () => {
                await dispatch(getWebPushAnalyticsList({ departmentId, userId, clientId }));
                if (type === 'edit' && config?.webNotifySettingId) {
                    await loadEditDomain();
                }
            },
            loaderConfig: fieldLoaderConfig,
            mode: type === 'edit' ? 'edit' : 'create',
        });
    }, [
        sessionReady,
        departmentId,
        userId,
        clientId,
        type,
        config?.webNotifySettingId,
        dispatch,
        pageLoadApi.refetch,
        loadEditDomain,
    ]);

    const bootstrapPageRef = useRef(bootstrapPage);
    bootstrapPageRef.current = bootstrapPage;

    useEffect(() => {
        if (!sessionReady) return undefined;
        bootstrapPageRef.current();
    }, [sessionReady, departmentId, userId, clientId, type, config?.webNotifySettingId]);

    useEffect(() => {
        if (type === 'edit') {
            return;
        }
        if (!fcmJSONFile || typeof fcmJSONFile !== 'string' || !fcmJSONFile.trim()) {
            fcmJsonProcessedRef.current = '';
            return;
        }
        if (fcmJSONFile.startsWith('http://') || fcmJSONFile.startsWith('https://')) {
            return;
        }

        const rawB64 = extractBase64PayloadFromDataUrl(fcmJSONFile);
        if (!rawB64) {
            setError('fcmJSONFile', {
                type: 'custom',
                message:
                    'Invalid file format. Please upload a valid JSON file (Firebase service account).',
            });
            setValue('fcmJSONFile', '');
            setValue('jsonName', '');
            fcmJsonProcessedRef.current = '';
            return;
        }

        const dedupeKey = `${notificationProviderControl}|${fcmJSONFile}`;
        if (fcmJsonProcessedRef.current === dedupeKey) {
            return;
        }

        let jsonText;
        try {
            jsonText = atob(rawB64);
        } catch {
            setError('fcmJSONFile', { type: 'custom', message: 'Invalid JSON file encoding' });
            setValue('fcmJSONFile', '');
            setValue('jsonName', '');
            fcmJsonProcessedRef.current = '';
            return;
        }

        const validation = validateFirebaseServiceAccountJson(jsonText);
        if (!validation.valid) {
            setError('fcmJSONFile', { type: 'custom', message: validation.error });
            setValue('fcmJSONFile', '');
            setValue('jsonName', '');
            fcmJsonProcessedRef.current = '';
            return;
        }

        clearErrors('fcmJSONFile');
        fcmJsonProcessedRef.current = dedupeKey;

        if (notificationProviderControl !== 'FCM(V1HTTP)') {
            return;
        }

        const processedFor = fcmJSONFile;

        dispatch(getConfigDetails({ jsonPath: rawB64 }))
            .then((result) => {
                if (getValues('fcmJSONFile') !== processedFor) {
                    return;
                }
                if (!result?.status) {
                    setError('fcmJSONFile', {
                        type: 'custom',
                        message: result?.message || 'Failed to fetch config details',
                    });
                    fcmJsonProcessedRef.current = '';
                    return;
                }
                const content =
                    fcmJSONFile.startsWith('data:') && fcmJSONFile.includes('base64,')
                    ? fcmJSONFile
                    : `data:application/json;base64,${rawB64}`;
                setUploadBootstrap({
                    fileName: getValues('jsonName') || 'service-account.json',
                    content,
                    jsonData: validation.data,
                    configDetails: result?.data,
                });
                setShowJSONUploadModal(true);
            })
            .catch(() => {
                if (getValues('fcmJSONFile') !== processedFor) {
                    return;
                }
                setError('fcmJSONFile', {
                    type: 'custom',
                    message: 'Error fetching config details. Please try again.',
                });
                fcmJsonProcessedRef.current = '';
            });
    }, [
        fcmJSONFile,
        notificationProviderControl,
        dispatch,
        setError,
        setValue,
        getValues,
        clearErrors,
        type,
    ]);

    const handleFormSubmit = async (formState) => {
        if (isSaveLoading) return;
                let tempfcmJSONFile = formState?.fcmJSONFile?.includes('data:application/json;base64')
            ? formState?.fcmJSONFile.split('data:application/json;base64,')[1]
            : formState?.fcmJSONFile;
        let webAnalyticsplatformData = formState?.webanalyticsetting?.map((res) => ({
            ...res,
            analyticsplatformId: res?.analyticsplatformId?.analyticsDomainId,
            webanalyticsId: res?.webanalyticsId || 0,
        }));
        const payload = {
            clientId,
            userId,
            departmentId,
            webnotifySettingId: type === 'edit' ? config?.webNotifySettingId : 0,
            domainName: formState?.domainName,
            domainUrl: formState?.domainUrl,
            framework: formState?.framework?.name || formState?.framework || '',
            // userIdentifier: formState?.userIdentifier,
            imagePath: formState?.domainLogo,
            imageName: formState?.imageName,
            isV1:  true ,
            V1Http: {
                jsonName: formState?.jsonName || '',
                // jsonPath:
                //     formState?.fcmJSONFile?.length > 0
                //         ? type === 'edit'
                //             ? formState?.fcmJSONFile
                //             : formState?.fcmJSONFile.split('data:application/json;base64,')[1]
                //         : '',
                jsonPath: formState?.fcmJSONFile?.length > 0 ? tempfcmJSONFile : '',
            },
            Fcm: {
                fcmsenderId: formState?.fcmSenderId,
                fcmserverkey: formState?.fcmServerKey,
            },
            Firebase: {
                apiKey: formState?.apiKey,
                authDomain: formState?.authDomain,
                databaseUrl: formState?.databaseUrl,
                projectId: formState?.projectId,
                storageBucket: formState?.storageBucket,
                messagingSenderId: formState?.measurementId,
                vapid: formState?.vapid,
                appId: formState?.appId,
            },
            isAppAnalytics: formState?.webanalyticssetting,
            AppAnalytics: webAnalyticsplatformData,
            createdBy: userId,
        };
        const result = await saveApi.refetch({
            fetcher: () => dispatch(UpsertWebPushSettings(payload, false)),
            loaderConfig: fieldLoaderConfig,
            mode: 'create',
        });
        if (result?.status) {
            if (type === 'edit') {
                handleSuccessModalOkay();
                return;
            }
            setShowSuccessModal(true);
        }
    };

    // Handle Firebase JSON upload from modal
    const handleFirebaseJSONUpload = ({ fileName, content, jsonData, selectedApp, configDetails }) => {
        setValue('fcmJSONFile', content);
        setValue('jsonName', fileName);
        clearErrors('fcmJSONFile');
        
        // Auto-fill Firebase messaging fields if app is selected
        if (selectedApp && selectedApp.config) {
            const config = selectedApp.config;
            
            // Map config fields to form fields
            if (config.apiKey) {
                setValue('apiKey', config.apiKey);
                clearErrors('apiKey');
            }
            if (config.authDomain) {
                setValue('authDomain', config.authDomain);
                clearErrors('authDomain');
            }
            if (config.projectId) {
                setValue('projectId', config.projectId);
                clearErrors('projectId');
            }
            if (config.storageBucket) {
                setValue('storageBucket', config.storageBucket);
                clearErrors('storageBucket');
            }
            // measurementId form field maps to messagingSenderId in payload
            // Use messagingSenderId from config for the form field
            if (config.messagingSenderId) {
                setValue('measurementId', config.messagingSenderId);
                clearErrors('measurementId');
            }
            if (config.appId) {
                setValue('appId', config.appId);
                clearErrors('appId');
            }
            // VAPID key is in selectedApp.vapidKey, not in config
            if (selectedApp.vapidKey) {
                setValue('vapid', selectedApp.vapidKey);
                clearErrors('vapid');
            }
        }
    };

    // Handle success modal okay button click
    const handleSuccessModalOkay = () => {
        setShowSuccessModal(false);
        if (state?.from === 'WN') {
            const locationState = state?.locationState;
            const encryptState = encodeURIComponent(
                encryptWithAES(JSON.stringify(locationState).replace(/\+/g, '%2B')),
            );
            navigate(`/communication/create-communication?q=${encryptState}`);
        }
        handleCancel(true);
    };

    const [actionsPortalTarget, setActionsPortalTarget] = useState(null);

    useEffect(() => {
        setActionsPortalTarget(document.getElementById(WEB_FORM_ACTIONS_PORTAL_ID));

        return () => {
            setActionsPortalTarget(null);
        };
    }, []);

    const handleCancelClick = () => {
        if (isSaveLoading) return;
        if (state?.from === 'WN') {
            const locationState = state?.locationState;
            const encryptState = encodeURIComponent(
                encryptWithAES(JSON.stringify(locationState).replace(/\+/g, '%2B')),
            );
            navigate(`/communication/create-communication?q=${encryptState}`);
        }
        handleCancel(true);
    };

    const renderFormActions = () => (
        <div className="buttons-holder pref-cs-buttons-outside mt20">
            <RSSecondaryButton
                id="rs_PushWebCreate_Cancel"
                type="button"
                blockInteraction={isSaveLoading}
                onClick={handleCancelClick}
            >
                Cancel
            </RSSecondaryButton>
            {addAccess && (
                <RSPrimaryButton
                    type="submit"
                    form={PUSH_WEB_CREATE_FORM_ID}
                    id="rs_PushWebCreate_submit"
                    isLoading={isSaveLoading}
                    blockBodyPointerEvents={isSaveLoading}
                >
                    {type === 'edit' ? 'Update' : 'Save'}
                </RSPrimaryButton>
            )}
        </div>
    );

    const formActions = actionsPortalTarget ? createPortal(renderFormActions(), actionsPortalTarget) : null;

    return (
        <>
            <CommunicationSettingsEditSkeletonGate
                isLoading={pageLoadApi.isFetching}
                isEditMode={type === 'edit'}
                actionsPortalId={WEB_FORM_ACTIONS_PORTAL_ID}
            >
        <FormProvider {...methods}>
            <form id={PUSH_WEB_CREATE_FORM_ID} onSubmit={handleSubmit(handleFormSubmit)}>
                <>
                    {/* Content starts */}
                    <div className="rs-sub-heading">
                        <div className="rss-left">
                            <h4>Domain onboarding</h4>
                        </div>
                        <div className="form-group">
                            <Row>
                                <Col sm={6}>
                                    <ListNameExists
                                        name={'domainName'}
                                        field="domainName"
                                        isDomain
                                        apiCallback={getWebPushDomainNameExist}
                                        condition={(status) => {
                                            return !status?.status;
                                        }}
                                        maxLength={MAX_LENGTH25}
                                        placeholder={DOMAIN_NAME}
                                        //  extraPayload={{ departmentId: 0 }}
                                        rules={LIST_NAME_RULES(DOMAIN_NAME_MSG)}
                                        customErrorMessage={DOMAIN_NAME_MSG}
                                    />
                                    {/* <RSInput
                                        name={'domainName'}
                                        placeholder={DOMAIN_NAME}
                                        control={control}
                                        required
                                        maxLength={MAX_LENGTH15}
                                        rules={{ required: DOMAIN_NAME_MSG }}
                                    /> */}
                                </Col>
                                <Col sm={6}>
                                    <RSInput
                                        name={'domainUrl'}
                                        id="rs_PushWebCreate_domainUrl"
                                        placeholder={DOMAIN_URL}
                                        control={control}
                                        required
                                        rules={WEBSITE_RULES}
                                        maxLength={MAX_LENGTH255}
                                        isLoading={websiteLoading.loading}
                                        isValidIcon={websiteLoading.valid}
                                        onKeyDown={(e) => {
                                            const result = validateHttpsUrl.handleKeyDown(e);
                                            if (result.preventDefault) {
                                                e.preventDefault();
                                                if (result.value) {
                                                    setValue('domainUrl', result.value);
                                                }
                                                if (result.selectionStart !== undefined) {
                                                    e.target.setSelectionRange(
                                                        result.selectionStart,
                                                        result.selectionEnd,
                                                    );
                                                }
                                            }
                                        }}
                                        onChange={(e) => {
                                            setValue('domainUrl', validateHttpsUrl.formatUrl(e.target.value));
                                        }}
                                        handleOnPaste={(e) => {
                                            e.preventDefault();
                                            const finalValue = validateHttpsUrl.handlePaste(e);
                                            setValue('domainUrl', finalValue);
                                        }}
                                        handleOnBlur={async ({ target: { value: rawValue } }) => {
                                            let value = validateHttpsUrl.formatUrl(rawValue);
                                            if (value !== rawValue) {
                                                setValue('domainUrl', value);
                                            }

                                            if (!value || value.trim() === 'https://') {
                                                setWebsiteLoading({ loading: false, valid: false });
                                                return;
                                            }

                                            let domainOnlyUrl = value;
                                            try {
                                                const urlObj = new URL(value);
                                                const hostname = urlObj.hostname.replace(/^(www\.)/, '');
                                                domainOnlyUrl = `${urlObj.protocol}//${hostname}`;
                                                setValue('domainUrl', domainOnlyUrl);
                                            } catch (error) {
                                                                                            }

                                            // Start technology detection in parallel
                                            setTechnologyDetecting(true);
                                            detectTechnology(domainOnlyUrl, DOMAIN_FLAVOUR)
                                                .then((detectedFlavor) => {
                                                    if (detectedFlavor) {
                                                                                                                setValue('framework', detectedFlavor);
                                                    } else {
                                                                                                            }
                                                })
                                                .catch((error) => {
                                                })
                                                .finally(() => {
                                                    setTechnologyDetecting(false);
                                                });

                                            let hasValue = GeneratePasswordpseudorandom(16);
                                            let byteHash = CryptoJS.enc.Utf8.parse(hasValue);
                                            let tempiv = iv;

                                            if (!brandWebsiteHasError) {
                                                setWebsiteLoading((prev) => ({ ...prev, loading: true }));
                                                const { status } = await dispatch(
                                                    getWebPushDomainURLExist({
                                                        payload: {
                                                            domainUrl: domainOnlyUrl,
                                                            //  encryptWithAES(
                                                            //     CryptoJS.enc.Utf8.parse(value),
                                                            //     byteHash,
                                                            //     tempiv,
                                                            // ),
                                                            //   //  hashval: btoa(
                                                            //         GeneratePasswordpseudorandom(3) +
                                                            //             hasValue +
                                                            //             GeneratePasswordpseudorandom(3),
                                                            //     ),
                                                            clientId,
                                                            departmentId,
                                                            userId,
                                                        },
                                                        setError,
                                                        clearErrors,
                                                        name: 'domainUrl',
                                                    }),
                                                );
                                                if (!status) {
                                                    setWebsiteLoading({ loading: false, valid: true });
                                                } else {
                                                    setWebsiteLoading({ loading: false, valid: false });
                                                }
                                            }
                                        }}
                                    // rules={{ required: DOMAIN_URL_MSG }}
                                    />
                                    {/* <ListNameExists
                                        name={'domainUrl'}
                                        field="domainUrl"
                                        apiCallback={getWebPushDomainURLExist}
                                        condition={(status) => {
                                            return !status?.status;
                                        }}
                                        isEmail
                                        maxLength={MAX_LENGTH255}
                                        placeholder={DOMAIN_URL}
                                        //  extraPayload={{ departmentId: 0 }}
                                        rules={WEBSITE_RULES}
                                    /> */}
                                </Col>
                            </Row>
                        </div>
                        <div className="form-group">
                            <Row>
                                <Col sm={6}>
                                    <RSKendoDropDownList
                                        name={'framework'}
                                        data={DOMAIN_FLAVOUR}
                                        control={control}
                                        textField={'name'}
                                        dataItemKey={'id'}
                                        label={'Website Technology / Framework'}
                                        placeholder={
                                            technologyDetecting
                                                ? 'Detecting technology...'
                                                : 'Select your website technology'
                                        }
                                        required
                                        disabled={technologyDetecting}
                                        isLoading={technologyDetecting}
                                        handleChange={(e) => {
                                            // Optional: Handle change if needed
                                        }}
                                    />
                                </Col>
                                {/* <Col sm={6}>
                                    <RSKendoDropDownList
                                        name={'userIdentifier'}
                                        data={['Email id', 'Mobile number', 'Brand id (brand defined unique id)']}
                                        control={control}
                                        label={'User identifier'}
                                        required
                                        rules={{
                                            required: SELECT,
                                        }}
                                    />
                                </Col> */}
                                <Col sm={6} className="notification-upload">
                                    <RSFileUpload
                                        control={control}
                                        name="domainLogo"
                                        id="rs_PushWebCreate_domainlogo"
                                        text="Upload"
                                        placeholder={
                                            domainLogo && domainLogo.type === 'required'
                                                ? 'Upload file'
                                                : type === 'edit'
                                                    ? domainLogo
                                                    : 'Upload your logo'
                                        }
                                        accept={'.png,.svg,.jpg,.jpeg'}
                                        clearErrors={clearErrors}
                                        setError={setError}
                                        required
                                        size={500000}
                                        rules={{
                                            required: UPLOAD_FILE,
                                        }}
                                        // handleChange={handleLogoUpload}
                                        isbase64
                                        watch={watch}
                                        handleChange={(e) => {
                                            setValue('imageName', e.target.value.split('\\').pop());
                                            clearErrors('logoUpload');
                                        }}
                                    />
                                    <small>{UPLOAD_145_LOGO}</small>
                                </Col>
                            </Row>
                        </div>
                        {/* {notificationProviderControl === 'V1 HTTP' && ( */}

                        {/* <Row style={{ width: '100%' }}> */}
                        {/* <div>
                                    <span className="d-flex align-items-center">
                                        <h4>Firebase cloud messaging</h4>
                                       
                                    </span>
                                </div> */}


                        {/* </Row> */}
                        {/* )} */}


                        {/* <h3 className="mt30">FCM project details</h3> */}
                        <h4>Firebase project details
                            <i
                                className={`${circle_question_mark_mini} color-primary-blue icon-xs position-relative ml5 cursor-pointer`}
                                id="circle_question_mark"
                                onClick={() => setShowFCMGuidelinesModal(true)}
                                style={{ cursor: 'pointer' }}
                                title="Click to view FCM setup guide"
                            />
                        </h4>
                        <div className="form-group">
                            <Row>
                                <Col sm={6}>
                                    <RSInput
                                        name={'apiKey'}
                                        id="rs_PushWebCreate_apikey"
                                        placeholder={API_KEY}
                                        control={control}
                                        required
                                        maxLength={MAX_LENGTH250}
                                        rules={{ required: API_KEY_MSG }}
                                    />
                                </Col>
                                <Col sm={6}>
                                    <RSInput
                                        name={'authDomain'}
                                        id="rs_PushWebCreate_authDomain"
                                        placeholder={AUTH_TOKEN}
                                        control={control}
                                        required
                                        maxLength={MAX_LENGTH250}
                                        rules={{ required: AUTH_TOKEN_MSG }}
                                    />
                                </Col>
                            </Row>
                        </div>
                        <div className="form-group">
                            <Row>
                                {/* <Col sm={6}>
                                    <RSInput
                                        name={'databaseUrl'}
                                        id="rs_PushWebCreate_databaseUrl"
                                        placeholder={DATA_BASE}
                                        control={control}
                                        // required
                                        // rules={{ required: DATA_BASE_URL }}
                                    />
                                </Col> */}
                                <Col sm={6}>
                                    <RSInput
                                        name={'vapid'}
                                        id="rs_PushWebCreate_vapId"
                                        placeholder={VAPID}
                                        control={control}
                                        required
                                        maxLength={MAX_LENGTH250}
                                        rules={{ required: 'Vap ID' }}
                                    />
                                </Col>
                                <Col sm={6}>
                                    <RSInput
                                        name={'projectId'}
                                        id="rs_PushWebCreate_projectId"
                                        placeholder={PROJECT_ID}
                                        control={control}
                                        required
                                        maxLength={MAX_LENGTH250}
                                        rules={{ required: PROJECT_ID_MSG }}
                                    />
                                </Col>
                            </Row>
                        </div>
                        <div className="form-group">
                            <Row>
                                <Col sm={6}>
                                    <RSInput
                                        name={'storageBucket'}
                                        placeholder={STORAGE_BUCKET}
                                        id="rs_PushWebCreate_storageBucket"
                                        control={control}
                                        required
                                        maxLength={MAX_LENGTH250}
                                        rules={{ required: STORAGE_BUCKET_MSG }}
                                    />
                                </Col>
                                <Col sm={6}>
                                    <RSInput
                                        name={'measurementId'}
                                        id="rs_PushWebCreate_measurementId"
                                        placeholder={MESUREMENT}
                                        control={control}
                                        required
                                        maxLength={MAX_LENGTH250}
                                        rules={{ required: MESUREMENT_MSG }}
                                    />
                                </Col>
                            </Row>
                        </div>
                        <div className="form-group">
                            <Row>
                                <Col sm={6}>
                                    <RSInput
                                        name={'appId'}
                                        id="rs_PushWebCreate_appId"
                                        placeholder={'App ID'}
                                        control={control}
                                        required
                                        maxLength={MAX_LENGTH250}
                                        rules={{ required: 'Enter app id' }}
                                    />
                                </Col>{' '}
                                <Col md={6} className="notification-upload">
                                    <RSFileUpload
                                        control={control}
                                        name="fcmJSONFile"
                                        id="rs_PushWebCreate_fcmJSONFile"
                                        text="Upload"
                                        accept={'.json'}
                                        clearErrors={clearErrors}
                                        setError={setError}
                                        size={500000}
                                        required
                                        isbase64
                                        watch={watch}
                                        rules={
                                            type === 'edit'
                                                ? {}
                                                : {
                                                      required: UPLOAD_FILE,
                                                  }
                                        }
                                        placeholder={
                                            fcmJSONFile && fcmJSONFile.type === 'required'
                                                ? 'Upload file'
                                                : jsonName || 'Choose file'
                                        }
                                        handleChange={(e) => {
                                            const path = e.target?.value;
                                            if (path) {
                                                setValue('jsonName', path.split('\\').pop());
                                            }
                                            clearErrors('fcmJSONFile');
                                            fcmJsonProcessedRef.current = '';
                                        }}
                                    />
                                    <input type="hidden" {...methods.register('jsonName')} />
                                    <small>Upload service account JSON file</small>
                                </Col>
                                {/* {notificationProviderControl === 'V1 HTTP' && ( */}
                                {/* <Col sm={6}>
                                    <RSInput
                                        name={'vapid'}
                                        id="rs_PushWebCreate_vapId"
                                        placeholder={VAPID}
                                        control={control}
                                        required
                                        maxLength={MAX_LENGTH250}
                                        rules={{ required: 'Vap ID' }}
                                    />
                                </Col> */}
                                {/* )} */}
                            </Row>
                        </div>

                    </div>
                </>
            </form>

            {/* Firebase JSON Upload Modal */}
            <FirebaseJSONUploadModal
                type={'web'}
                show={showJSONUploadModal}
                uploadBootstrap={uploadBootstrap}
                onHide={() => {
                    setShowJSONUploadModal(false);
                    setUploadBootstrap(null);
                }}
                onFileUpload={handleFirebaseJSONUpload}
                currentFile={watch('jsonName')}
            />

            {/* Success Modal */}
            <IntegrationSuccessModal
                show={showSuccessModal}
                settingsId={81}
                type="web"
                domainName={watch('domainName')}
                framework={watch('framework')?.name || watch('framework')}
                onClose={handleSuccessModalOkay}
            />

            {/* FCM Guidelines Modal */}
            <RSModal
                show={showFCMGuidelinesModal}
                handleClose={() => setShowFCMGuidelinesModal(false)}
                header="Firebase Configuration (Web)"
                size="xl"
                body={
                    <FCMGuidelinesModal
                        show={showFCMGuidelinesModal}
                        onHide={() => setShowFCMGuidelinesModal(false)}
                    />
                }
                isCloseButton={true}
                isHeaderTitle={true}
            />

        </FormProvider>
            </CommunicationSettingsEditSkeletonGate>
            {formActions}
        </>
    );
};

export default PushWebCreate;