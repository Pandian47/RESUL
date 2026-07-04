import { encryptWithAES, iv } from 'Utils/modules/crypto';
import { GeneratePasswordpseudorandom } from 'Utils/modules/passwordUtils';
import {validateHttpsUrl} from 'Utils/modules/urlQuery';
import { MAX_LENGTH25, MAX_LENGTH250, MAX_LENGTH255 } from 'Constants/GlobalConstant/Regex';
import { API_KEY as API_KEY_MSG, AUTH_TOKEN as AUTH_TOKEN_MSG, DOMAIN_NAME as DOMAIN_NAME_MSG, FCM_ID as FCM_ID_MSG, FCM_KEY as FCM_KEY_MSG, MESUREMENT as MESUREMENT_MSG, PROJECT_ID as PROJECT_ID_MSG, STORAGE_BUCKET as STORAGE_BUCKET_MSG, UPLOAD_FILE } from 'Constants/GlobalConstant/ValidationMessage';
import { LIST_NAME_RULES, WEBSITE_RULES } from 'Constants/GlobalConstant/Rules';
import { API_KEY, AUTH_TOKEN, DOMAIN_NAME, DOMAIN_URL, FCM_ID, FCM_KEY, FCM_POPOVER_TEXT, MESUREMENT, PROJECT_ID, STORAGE_BUCKET, UPLOAD_145_LOGO, VAPID } from 'Constants/GlobalConstant/Placeholders';
import { alert_medium, builder_upload_large, circle_info_medium, circle_question_mark_mini, code_medium, file_tick_large, folder_medium, tick_circle_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useRef, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Row, Col, Card } from 'react-bootstrap';
import CryptoJS from 'crypto-js';

import RSInput from 'Components/FormFields/RSInput';
import RSFileUpload from 'Components/FormFields/RSFileUpload';
import RSRadioButton from 'Components/FormFields/RSRadioButton';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSPPophover from 'Components/RSPPophover';
import ListNameExists from 'Components/ListNameExists';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import './FirebaseUploadStyles.scss';

import { FORM_INITIAL_STATE, DOMAIN_FLAVOUR } from '../../../constant';
import {
    GetWebPushbyID,
    getWebPushAnalyticsList,
    UpsertWebPushSettings,
    getWebPushDomainNameExist,
    getWebPushDomainURLExist,
    SaveWebPushConfig,
    GetWebPushConfig,
} from 'Reducers/preferences/CommunicationSettings/request';
import { getSessionId } from 'Reducers/globalState/selector';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import useOnlyDepChangeEffect from 'Hooks/useOnlyDepChangeEffect';

import usePermission from 'Hooks/usePersmission';
import RSProgressSteps from 'Components/ProgressSteps';
import SDKHealthCheck from '../../../../../Components/SDKHealthCheck/SDKHealthCheck';
import { validateFCMCredentials } from 'Utils/fcmValidator';
import detectTechnology from './utils/detectTechnology';

const WebOnboardingNew = ({ type, handleCancel, config, setFailedApi }) => {
    // Progress steps configuration
    const [progressSteps, setProgressSteps] = useState([
        {
            step: 1,
            status: 'inprogress',
            stepTitle: 'Domain Setup',
        },
        {
            step: 2,
            status: '',
            stepTitle: 'Framework',
        },
        {
            step: 3,
            status: '',
            stepTitle: 'Generate SDK',
        },
        {
            step: 4,
            status: '',
            stepTitle: 'Verification',
        },
        {
            step: 5,
            status: '',
            stepTitle: 'Push Config',
        },
    ]);

    const steps = [
        { title: 'Domain Setup', stepTitle: 'Domain Setup', mandatory: true },
        { title: 'Framework', stepTitle: 'Framework', mandatory: true },
        { title: 'Generate SDK', stepTitle: 'Generate SDK', mandatory: false },
        { title: 'Verification', stepTitle: 'Verification', mandatory: false },
        { title: 'Push Config', stepTitle: 'Push Config', mandatory: false },
    ];

    const [currentStep, setCurrentStep] = useState(0);
    const [sdkHealthCheckModal, setSdkHealthCheckModal] = useState(false);
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
        trigger,
        formState: { errors },
    } = methods;
    const { permissions } = usePermission();
    const { addAccess } = permissions || {};
    const dispatch = useDispatch();
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    let notificationProviderControl = watch('notificationProvider', 'FCM');
    const { getWebPushAnalyticsListData } = useSelector(
        ({ communicationSettingsReducer }) => communicationSettingsReducer,
    );
    const [fcmJSONFile, domainLogo] = watch(['fcmJSONFile', 'domainLogo']);
    const [websiteLoading, setWebsiteLoading] = useState({ loading: false, valid: false });
    const [showJSONUploadModal, setShowJSONUploadModal] = useState(false);
    const [isDraggingJSON, setIsDraggingJSON] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [isTestingFCM, setIsTestingFCM] = useState(false);
    const [fcmTestResult, setFcmTestResult] = useState(null);
    const fileInputRef = useRef(null);
    const brandWebsiteHasError = Object.hasOwn(errors, 'domainUrl');

    // Auto-hide success/failure messages after 3 seconds
    useEffect(() => {
        if (fcmTestResult && !isTestingFCM) {
            const timer = setTimeout(() => {
                if (!fcmTestResult?.success) {
                    setValue('fcmJSONFile', '');
                    setValue('jsonName', '');
                }
                setFcmTestResult(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [fcmTestResult, isTestingFCM]);

    useEffect(() => {
        const payload = {
            departmentId,
            userId,
            clientId,
        };
        dispatch(getWebPushAnalyticsList(payload));
    }, [departmentId, clientId]);

    useOnlyDepChangeEffect(() => {
        if (type === 'edit') {
            // getData();
        }
    }, [getWebPushAnalyticsListData]);

    // Call GetWebPushConfig API on initial render
    useEffect(() => {
        const getWebPushConfigData = async () => {
            if (config?.webNotifySettingId) {
                const payload = {
                    clientId,
                    userId,
                    departmentId,
                    webnotifySettingId: config.webNotifySettingId,
                };

                const result = await dispatch(GetWebPushConfig(payload));

                if (result?.status && result?.data) {
                    const data = result?.data;

                    // Find the domain flavour object from DOMAIN_FLAVOUR array
                    let domainFlavourObj = data?.framework
                        ? DOMAIN_FLAVOUR.find(
                              (flavour) => flavour.name === data.framework || flavour.id === data.framework,
                          )
                        : '';

                    // Process fcmConfig if available
                    const fcmConfig = data?.fcmConfig || {};

                    // Determine notification provider
                    const notificationProviderData = fcmConfig?.isV1 ? 'V1 HTTP' : 'FCM';

                    // Process JSON file path - if it's a filename, keep it; if it's base64, convert to data URL
                    let fcmJSONFileValue = '';
                    let jsonNameValue = '';
                    if (fcmConfig?.jsonPath) {
                        // Check if it's a filename or base64 content
                        if (fcmConfig.jsonPath.includes('data:application/json;base64')) {
                            fcmJSONFileValue = fcmConfig.jsonPath;
                            jsonNameValue = fcmConfig.jsonName || '';
                        } else if (fcmConfig.jsonPath.length > 100) {
                            // Likely base64 content
                            fcmJSONFileValue = `data:application/json;base64,${fcmConfig.jsonPath}`;
                            jsonNameValue = fcmConfig.jsonName || '';
                        } else {
                            // Likely a filename
                            jsonNameValue = fcmConfig.jsonPath;
                            fcmJSONFileValue = fcmConfig.jsonPath;
                        }
                    } else if (fcmConfig?.jsonName) {
                        jsonNameValue = fcmConfig.jsonName;
                    }

                    // Reset form with all the data
                    reset({
                        domainName: data?.domainName || '',
                        domainUrl: data?.domainUrl || '',
                        domainFlavour: domainFlavourObj || '',
                        domainLogo: data?.imagePath || '',
                        imageName: data?.imageName || '',
                        notificationProvider: notificationProviderData,
                        fcmJSONFile: fcmJSONFileValue,
                        jsonName: jsonNameValue,
                        fcmSenderId: fcmConfig?.fcmsenderId || '',
                        fcmServerKey: fcmConfig?.fcmserverkey || '',
                        appId: fcmConfig?.appId || '',
                        apiKey: fcmConfig?.apiKey || '',
                        authDomain: fcmConfig?.authDomain || '',
                        databaseUrl: fcmConfig?.databaseUrl || '',
                        projectId: fcmConfig?.projectId || '',
                        storageBucket: fcmConfig?.storageBucket || '',
                        measurementId: fcmConfig?.messagingSenderId || '',
                        vapid: fcmConfig?.vapid || '',
                        webanalyticsetting: data?.AppAnalytics || [],
                        webanalyticssetting: data?.isAppAnalytics || false,
                    });
                }
            }
        };

        getWebPushConfigData();
    }, [clientId, userId, departmentId, config?.webNotifySettingId, dispatch, reset]);

    const getData = async () => {
        const { status, data } = await dispatch(
            GetWebPushbyID({ clientId, userId, departmentId, webnotifySettingId: config?.webNotifySettingId }),
        );
        if (status) {
            let notificationProviderData = data?.isV1 ? 'V1 HTTP' : 'FCM';
            let senderDetails = data?.AppAnalytics?.map((item) => {
                let tempAction = getWebPushAnalyticsListData?.filter(
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

            // Find the domain flavour object from DOMAIN_FLAVOUR array based on saved data
            let domainFlavourObj = data?.framework
                ? DOMAIN_FLAVOUR.find((flavour) => flavour.name === data.framework || flavour.id === data.framework)
                : '';

            reset({
                domainName: data?.domainName,
                domainUrl: data?.domainUrl,
                domainFlavour: domainFlavourObj || '',
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
        } else {
            setFailedApi('GetWebPushbyID');
        }
    };

    const handleFormSubmit = (formState) => {
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
            framework: formState?.domainFlavour?.name || formState?.domainFlavour || '',
            imagePath: formState?.domainLogo,
            imageName: formState?.imageName,
            isV1: formState?.notificationProvider === 'FCM' ? false : true,
            V1Http: {
                jsonName: formState?.jsonName || '',
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
        dispatch(UpsertWebPushSettings(payload)).then((result) => {
            if (result?.status) {
                if (state?.from === 'WN') {
                    const locationState = state?.locationState;
                    const encryptState = encodeURIComponent(
                        encryptWithAES(JSON.stringify(locationState).replace(/\+/g, '%2B')),
                    );
                    navigate(`/communication/create-communication?q=${encryptState}`);
                }
                handleCancel(true);
            }
        });
    };

    // Handle Firebase JSON upload from modal
    const handleFirebaseJSONUpload = async ({ fileName, content, jsonData, fcmTestPassed }) => {
        setValue('fcmJSONFile', content);
        setValue('jsonName', fileName);
        clearErrors('fcmJSONFile');
        setUploadError('');

        // Test FCM credentials if jsonData is provided
        if (jsonData) {
            await testFCMCredentials(jsonData);
        }
    };

    // Validate Firebase JSON file (matching NewFirebaseServiceAccount.jsx)
    const validateFirebaseJSON = (jsonContent) => {
        try {
            const parsed = JSON.parse(jsonContent);

            // Required fields for Firebase service account
            const requiredFields = [
                'type',
                'project_id',
                'private_key_id',
                'private_key',
                'client_email',
                'client_id',
                'auth_uri',
                'token_uri',
                'auth_provider_x509_cert_url',
                'client_x509_cert_url',
            ];

            const missingFields = requiredFields.filter((field) => !parsed[field]);

            if (missingFields.length > 0) {
                return {
                    valid: false,
                    error: `Invalid Firebase service account JSON. Missing fields: ${missingFields.join(', ')}`,
                };
            }

            if (parsed.type !== 'service_account') {
                return {
                    valid: false,
                    error: 'Invalid Firebase service account JSON. Type must be "service_account"',
                };
            }

            return { valid: true, data: parsed };
        } catch (err) {
            return {
                valid: false,
                error: 'Invalid JSON format. Please upload a valid Firebase service account JSON file.',
            };
        }
    };

    // Test FCM credentials using native REST APIs
    const testFCMCredentials = async (serviceAccount) => {
        try {
            setIsTestingFCM(true);
            setFcmTestResult(null);
            setUploadError('');

            const result = await validateFCMCredentials(serviceAccount);

            setFcmTestResult({
                success: result.success,
                message: result.message,
                data: result?.data,
            });

            return result.success;
        } catch (err) {
            setFcmTestResult({
                success: false,
                message: err.message || 'Failed to test FCM credentials',
            });
            return false;
        } finally {
            setIsTestingFCM(false);
        }
    };

    // Handle inline file upload
    const handleInlineFileUpload = async (file) => {
        setUploadError('');
        setFcmTestResult(null);

        if (!file) {
            return;
        }

        // Check file type
        if (!file.name.endsWith('.json')) {
            setUploadError('Only .json files are supported');
            return;
        }

        // Check file size (500KB max)
        if (file.size > 500000) {
            setUploadError('File size must be less than 500KB');
            return;
        }

        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const content = e.target.result;
                const validation = validateFirebaseJSON(content);

                if (!validation.valid) {
                    setUploadError(validation.error);
                    setFcmTestResult(null);
                    return;
                }

                // Convert to base64
                const base64Content = btoa(content);
                const dataUrl = `data:application/json;base64,${base64Content}`;

                setValue('fcmJSONFile', dataUrl);
                setValue('jsonName', file.name);
                clearErrors('fcmJSONFile');

                // Automatically test FCM credentials
                await testFCMCredentials(validation.data);
            } catch (error) {
                setUploadError('Failed to read file');
                setFcmTestResult(null);
            }
        };

        reader.onerror = () => {
            setUploadError('Error reading file. Please try again.');
            setFcmTestResult(null);
        };

        reader.readAsText(file);
    };

    // Drag and drop handlers
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingJSON(true);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.currentTarget === e.target) {
            setIsDraggingJSON(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingJSON(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleInlineFileUpload(files[0]);
        }
    };

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileInputChange = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleInlineFileUpload(files[0]);
        }
    };

    const handleRemoveFile = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setValue('fcmJSONFile', '');
        setValue('jsonName', '');
        setUploadError('');
        setFcmTestResult(null);
        setIsTestingFCM(false);
        clearErrors('fcmJSONFile');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Stepper navigation handlers
    const handleNext = async () => {
        let fieldsToValidate = [];

        // Validate fields for each step
        if (currentStep === 0) {
            fieldsToValidate = ['domainName', 'domainUrl'];
        } else if (currentStep === 1) {
            fieldsToValidate = ['domainFlavour', 'domainLogo'];
        } else if (currentStep === 2) {
            fieldsToValidate =
                notificationProviderControl === 'FCM' ? ['fcmSenderId', 'fcmServerKey'] : ['fcmJSONFile'];
        } else if (currentStep === 3) {
            // Verification step - no specific validation
            fieldsToValidate = [];
        } else if (currentStep === 4) {
            fieldsToValidate = [
                'apiKey',
                'authDomain',
                'vapid',
                'projectId',
                'storageBucket',
                'measurementId',
                'appId',
            ];
        }

        const result = fieldsToValidate.length > 0 ? await methods.trigger(fieldsToValidate) : true;
        if (result) {
            if (currentStep < steps.length - 1) {
                setCurrentStep(currentStep + 1);
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    const handleSkip = () => {
        if (!steps[currentStep].mandatory && currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleStepClick = (index) => {
        // Allow navigation to completed or current steps
        if (index <= currentStep || !steps[index].mandatory) {
            setCurrentStep(index);
        }
    };

    // Detect technology from domain URL
    const detectDomainTechnology = async (url) => {
        if (!url || url.trim() === 'https://' || url.trim() === '') {
            return null;
        }
        const detectedTechnology = await detectTechnology(url, DOMAIN_FLAVOUR);

        setValue('domainFlavour', detectedTechnology);

        return detectedTechnology;
    };

    // Generate SDK Snippet
    const generateSDKButtonClick = async () => {
        const isValid = await trigger(['domainName', 'domainUrl', 'domainFlavour', 'domainLogo']);

        if (isValid) {
            // Get form values
            const formValues = watch();
            const domainFlavourValue = formValues.domainFlavour?.name || formValues.domainFlavour || '';

            // Check if FCM details exist
            const hasFcmDetails =
                (formValues?.fcmJSONFile && formValues.fcmJSONFile.length > 0) ||
                (formValues?.jsonName && formValues.jsonName.length > 0) ||
                (formValues?.fcmSenderId && formValues.fcmSenderId.length > 0) ||
                (formValues?.fcmServerKey && formValues.fcmServerKey.length > 0) ||
                (formValues?.apiKey && formValues.apiKey.length > 0) ||
                (formValues?.authDomain && formValues.authDomain.length > 0) ||
                (formValues?.vapid && formValues.vapid.length > 0) ||
                (formValues?.projectId && formValues.projectId.length > 0) ||
                (formValues?.storageBucket && formValues.storageBucket.length > 0) ||
                (formValues?.measurementId && formValues.measurementId.length > 0) ||
                (formValues?.appId && formValues.appId.length > 0);

            // Build base payload for SaveWebPushConfig API
            const payload = {
                clientId,
                userId,
                departmentId,
                webnotifySettingId: type === 'edit' ? config?.webNotifySettingId : 0,
                domainName: formValues.domainName,
                domainUrl: formValues.domainUrl,
                framework: domainFlavourValue,
                imagePath: formValues.domainLogo || '',
                imageName: formValues.imageName || '',
                isAppAnalytics: formValues.webanalyticssetting || false,
                AppAnalytics: formValues.webanalyticsetting || [],
                createdBy: userId,
            };

            // Only add fcmConfig if FCM details exist
            if (hasFcmDetails) {
                // Process fcmJSONFile - extract base64 content if it's a data URL
                let tempfcmJSONFile = formValues?.fcmJSONFile?.includes('data:application/json;base64')
                    ? formValues?.fcmJSONFile.split('data:application/json;base64,')[1]
                    : formValues?.fcmJSONFile;

                // Determine if V1 based on notificationProvider or if JSON file exists
                const isV1 =
                    formValues?.notificationProvider === 'V1 HTTP' ||
                    (formValues?.fcmJSONFile && formValues?.fcmJSONFile.length > 0) ||
                    (formValues?.jsonName && formValues?.jsonName.length > 0);

                // jsonPath: always use base64 content
                const jsonPath = formValues?.fcmJSONFile?.length > 0 ? tempfcmJSONFile : '';

                // Build fcmConfig object
                payload.fcmConfig = {
                    isV1: isV1,
                    jsonName: formValues?.jsonName || '',
                    jsonPath: jsonPath,
                    fcmsenderId: formValues?.fcmSenderId || null,
                    fcmserverkey: formValues?.fcmServerKey || null,
                    apiKey: formValues?.apiKey || '',
                    authDomain: formValues?.authDomain || '',
                    databaseUrl: formValues?.databaseUrl || '',
                    projectId: formValues?.projectId || '',
                    storageBucket: formValues?.storageBucket || '',
                    messagingSenderId: formValues?.measurementId || '',
                    vapid: formValues?.vapid || '',
                    appId: formValues?.appId || '',
                };
            }

            // Call SaveWebPushConfig API
            const result = await dispatch(SaveWebPushConfig(payload));

            // Only proceed to step 3 if API response status is true
            if (result?.status) {
                setCurrentStep(3);
                setTimeout(() => {
                    let _tempProg = [...progressSteps];
                    _tempProg[2].status = 'completed';
                    _tempProg[3].status = 'inprogress';
                    setProgressSteps(_tempProg);
                }, 100);
            }
        }
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <Card className="border shadow-sm">
                    <Card.Body className="p-4">
                        <RSProgressSteps stepsData={progressSteps} />
                        <div className="p-4">
                            {/* Step 1: Domain Setup */}
                            {currentStep === 0 && (
                                <div>
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
                                                    rules={LIST_NAME_RULES(DOMAIN_NAME_MSG)}
                                                    customErrorMessage={DOMAIN_NAME_MSG}
                                                />
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
                                                        setValue(
                                                            'domainUrl',
                                                            validateHttpsUrl.formatUrl(e.target.value),
                                                        );
                                                    }}
                                                    handleOnPaste={(e) => {
                                                        e.preventDefault();
                                                        const finalValue = validateHttpsUrl.handlePaste(e);
                                                        setValue('domainUrl', finalValue);
                                                    }}
                                                    handleOnBlur={async ({ target: { value } }) => {
                                                        if (!value || value.trim() === 'https://') {
                                                            setWebsiteLoading({ loading: false, valid: false });
                                                            return;
                                                        }

                                                        // Detect technology from domain URL and pre-fill domainFlavour
                                                        const detectedTechnology = detectDomainTechnology(value);

                                                        let hasValue = GeneratePasswordpseudorandom(16);
                                                        let byteHash = CryptoJS.enc.Utf8.parse(hasValue);
                                                        let tempiv = iv;

                                                        if (!brandWebsiteHasError) {
                                                            setWebsiteLoading((prev) => ({ ...prev, loading: true }));
                                                            const { status } = await dispatch(
                                                                getWebPushDomainURLExist({
                                                                    payload: {
                                                                        domainUrl: value,
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
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                    <div className="form-group">
                                        <Row>
                                            <Col sm={6}>
                                                <RSKendoDropDownList
                                                    name={'domainFlavour'}
                                                    data={DOMAIN_FLAVOUR}
                                                    control={control}
                                                    textField={'name'}
                                                    dataItemKey={'id'}
                                                    label={'Website Technology / Framework'}
                                                    placeholder="Select your website technology"
                                                    required
                                                    handleChange={(e) => {
                                                        let _tempProg = [...progressSteps];
                                                        _tempProg[0].status = 'completed';
                                                        _tempProg[1].status = 'completed';
                                                        _tempProg[2].status = 'inprogress';
                                                        setProgressSteps(_tempProg);
                                                        // Optional: Handle change if needed
                                                    }}
                                                />
                                                <small className="text-muted">
                                                    Select the technology used to build your website
                                                </small>
                                            </Col>

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
                                                            ? watch('domainLogo')
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
                                                    isbase64
                                                    watch={watch}
                                                    handleChange={(e) => {
                                                        setValue('imageName', e.target.value.split('\\').pop());
                                                        clearErrors('logoUpload');
                                                    }}
                                                />
                                            </Col>
                                        </Row>
                                    </div>

                                    {/* Generate SDK Snippet Section */}
                                    <div className="form-group mt-4">
                                        <div
                                            className="border border-2 rounded p-4 text-center"
                                            style={{
                                                borderStyle: 'dashed',
                                                borderColor: '#d0d0d0',
                                                backgroundColor: '#fafafa',
                                            }}
                                        >
                                            <p className="text-muted mb-3">
                                                Configure your domain and framework above to generate your unique SDK
                                                snippet.
                                            </p>
                                            <RSPrimaryButton
                                                type="button"
                                                id="rs_PushWebCreate_GenerateSDK"
                                                onClick={async () => {
                                                    generateSDKButtonClick();
                                                }}
                                            >
                                                <i className={`${code_medium} me-2`}></i>
                                                Generate SDK Snippet
                                            </RSPrimaryButton>
                                        </div>
                                    </div>

                                    {/* Cancel and Next buttons for edit flow */}
                                    {type === 'edit' && (
                                        <div className="form-group mt-3 d-flex justify-content-between align-items-center">
                                            <RSSecondaryButton
                                                type="button"
                                                onClick={() => {
                                                    handleCancel(true);
                                                }}
                                            >
                                                Cancel
                                            </RSSecondaryButton>
                                            <RSPrimaryButton
                                                type="button"
                                                onClick={async () => {
                                                    generateSDKButtonClick();
                                                }}
                                            >
                                                Next
                                            </RSPrimaryButton>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 2: Framework */}
                            {currentStep === 1 && (
                                <div>
                                    <div className="form-group">
                                        <Row>
                                            <Col sm={6}>
                                                <RSKendoDropDownList
                                                    name={'domainFlavour'}
                                                    data={DOMAIN_FLAVOUR}
                                                    control={control}
                                                    textField={'name'}
                                                    dataItemKey={'id'}
                                                    label={'Website Technology / Framework'}
                                                    placeholder="Select your website technology"
                                                    required
                                                    handleChange={(e) => {
                                                        // Optional: Handle change if needed
                                                    }}
                                                />
                                                <small className="text-muted">
                                                    Select the technology used to build your website
                                                </small>
                                            </Col>
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
                                </div>
                            )}

                            {/* Step 3: Generate SDK (Firebase Cloud Messaging) */}
                            {currentStep === 2 && (
                                <div>
                                    <div className="d-flex align-items-center mb-3">
                                        <h5 className="mb-0 me-2">Firebase Cloud Messaging Configuration</h5>
                                        <RSPPophover pophover={FCM_POPOVER_TEXT}>
                                            <i
                                                className={`${circle_question_mark_mini} color-primary-blue icon-xs`}
                                                id="circle_question_mark"
                                            />
                                        </RSPPophover>
                                    </div>
                                    <div className="form-group d-none">
                                        <Row>
                                            <Col sm={6}>
                                                <RSRadioButton
                                                    control={control}
                                                    id="rs_PushWebCreate_notificationProvider"
                                                    name={`notificationProvider`}
                                                    defaultValue={notificationProviderControl}
                                                    labelName={'FCM'}
                                                />
                                            </Col>
                                            <Col sm={6}>
                                                <RSRadioButton
                                                    control={control}
                                                    defaultValue={notificationProviderControl}
                                                    id="rs_PushWebCreate_notificationProvider"
                                                    name={`notificationProvider`}
                                                    labelName={'V1 HTTP'}
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                    <div className="form-group">
                                        {notificationProviderControl === 'FCM' && (
                                            <div className="form-group">
                                                <Row>
                                                    <Col sm={6}>
                                                        <RSInput
                                                            name={'fcmSenderId'}
                                                            placeholder={FCM_ID}
                                                            id="rs_PushWebCreate_fcmSenderId"
                                                            control={control}
                                                            required
                                                            maxLength={MAX_LENGTH250}
                                                            rules={{ required: FCM_ID_MSG }}
                                                        />
                                                    </Col>
                                                    <Col sm={6}>
                                                        <RSInput
                                                            name={'fcmServerKey'}
                                                            id="rs_PushWebCreate_fcmServerkey"
                                                            placeholder={FCM_KEY}
                                                            control={control}
                                                            required
                                                            maxLength={MAX_LENGTH250}
                                                            rules={{ required: FCM_KEY_MSG }}
                                                        />
                                                    </Col>
                                                </Row>
                                            </div>
                                        )}
                                        <Row>
                                            <Col sm={12}>
                                                <label className="form-label fw-semibold mb-2">
                                                    Firebase Service Account JSON
                                                    <span className="text-danger ms-1">*</span>
                                                </label>

                                                {!watch('jsonName')?.length > 0 ? (
                                                    <div
                                                        className={`firebase-dropzone ${
                                                            isDraggingJSON ? 'dragging' : ''
                                                        } ${uploadError || fcmJSONFile ? 'error' : ''}`}
                                                        onDragEnter={handleDragEnter}
                                                        onDragOver={handleDragOver}
                                                        onDragLeave={handleDragLeave}
                                                        onDrop={handleDrop}
                                                        onClick={handleBrowseClick}
                                                    >
                                                        <input
                                                            ref={fileInputRef}
                                                            type="file"
                                                            accept=".json"
                                                            onChange={handleFileInputChange}
                                                            style={{ display: 'none' }}
                                                        />

                                                        <div className="dropzone-content">
                                                            <div className="mb-3">
                                                                <i
                                                                    className={`${builder_upload_large} icon-xxlg text-primary`}
                                                                ></i>
                                                            </div>
                                                            <h5 className="mb-2">
                                                                {isDraggingJSON
                                                                    ? 'Drop your file here'
                                                                    : 'Drag & Drop your JSON file here'}
                                                            </h5>
                                                            <p className="text-muted mb-3">or</p>
                                                            <RSSecondaryButton
                                                                type="button"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleBrowseClick();
                                                                }}
                                                            >
                                                                <i className={`${folder_medium} me-2`}></i>
                                                                Browse Files
                                                            </RSSecondaryButton>
                                                            <p
                                                                className="text-muted mt-3 mb-0"
                                                                style={{ fontSize: '12px' }}
                                                            >
                                                                <i className={`${circle_info_medium} me-1`}></i>
                                                                Only .json files • Max 500KB
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="firebase-file-selected">
                                                        <div className="d-flex align-items-center justify-content-between p-3">
                                                            <div className="d-flex align-items-center flex-grow-1">
                                                                <div
                                                                    className="file-icon me-3"
                                                                    style={{
                                                                        width: '48px',
                                                                        height: '48px',
                                                                        backgroundColor: '#dcfce7',
                                                                        borderRadius: '8px',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                    }}
                                                                >
                                                                    <i
                                                                        className={`${file_tick_large} icon-lg text-success`}
                                                                    ></i>
                                                                </div>
                                                                <div className="flex-grow-1">
                                                                    <div className="d-flex align-items-center">
                                                                        <span className="fw-semibold me-2">
                                                                            {watch('jsonName')}
                                                                        </span>
                                                                        <i
                                                                            className={`${tick_circle_medium} icon-sm text-success`}
                                                                            title="Valid Firebase service account JSON"
                                                                        ></i>
                                                                    </div>
                                                                </div>
                                                                <div
                                                                    className="ms-3"
                                                                    style={{ position: 'relative', zIndex: 10 }}
                                                                >
                                                                    <RSPrimaryButton
                                                                        type="button"
                                                                        onClick={(e) => handleRemoveFile(e)}
                                                                        style={{ cursor: 'pointer' }}
                                                                    >
                                                                        Remove
                                                                    </RSPrimaryButton>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Inline Messages Below File Upload */}
                                                <div className="mt-2">
                                                    {/* FCM Testing Status */}
                                                    {isTestingFCM && (
                                                        <div
                                                            className="alert alert-info py-2 px-3 mb-2"
                                                            role="alert"
                                                            style={{ animation: 'fadeIn 0.3s ease-in' }}
                                                        >
                                                            <div className="d-flex align-items-center">
                                                                <div
                                                                    className="spinner-border spinner-border-sm me-2"
                                                                    role="status"
                                                                >
                                                                    <span className="visually-hidden">Loading...</span>
                                                                </div>
                                                                <small>Testing FCM credentials...</small>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* FCM Test Result - Success */}
                                                    {fcmTestResult &&
                                                        fcmTestResult.success &&
                                                        !isTestingFCM &&
                                                        watch('jsonName') && (
                                                            <div
                                                                className="alert alert-success py-2 px-3 mb-2"
                                                                role="alert"
                                                                style={{ animation: 'fadeIn 0.3s ease-in' }}
                                                            >
                                                                <div className="d-flex align-items-center">
                                                                    <i
                                                                        className={`${tick_circle_medium} me-2`}
                                                                    ></i>
                                                                    <small>
                                                                        <strong>Success!</strong> Valid Firebase service
                                                                        account JSON file. FCM credentials are working
                                                                        correctly.
                                                                    </small>
                                                                </div>
                                                            </div>
                                                        )}

                                                    {/* FCM Test Result - Warning (only if fileName is not empty) */}
                                                    {fcmTestResult &&
                                                        !fcmTestResult.success &&
                                                        !isTestingFCM &&
                                                        watch('jsonName') &&
                                                        watch('jsonName').length > 0 && (
                                                            <div
                                                                className="alert alert-warning py-2 px-3 mb-2"
                                                                role="alert"
                                                                style={{ animation: 'fadeIn 0.3s ease-in' }}
                                                            >
                                                                <div className="d-flex align-items-center">
                                                                    <i className={`${alert_medium} me-2`}></i>
                                                                    <small>
                                                                        <strong>Warning:</strong>{' '}
                                                                        {fcmTestResult.message}
                                                                    </small>
                                                                </div>
                                                            </div>
                                                        )}

                                                    {/* Upload Error */}
                                                    {(uploadError || fcmJSONFile) && (
                                                        <div className="alert alert-danger py-2 px-3 mb-2" role="alert">
                                                            <small>
                                                                <i className={`${alert_medium} me-1`}></i>
                                                                {uploadError ||
                                                                    fcmJSONFile?.message ||
                                                                    UPLOAD_FILE}
                                                            </small>
                                                        </div>
                                                    )}
                                                </div>

                                                <input
                                                    type="hidden"
                                                    {...methods.register('fcmJSONFile', {
                                                        required: UPLOAD_FILE,
                                                    })}
                                                />

                                                <div className="mt-3 p-3 bg-light rounded">
                                                    <small className="text-muted d-block mb-2">
                                                        <i className={`${circle_info_medium} me-1`}></i>
                                                        <strong>How to get your Firebase service account JSON:</strong>
                                                    </small>
                                                    <small className="text-muted">
                                                        1. Go to Firebase Console → Project Settings → Service Accounts
                                                        <br />
                                                        2. Click "Generate New Private Key"
                                                        <br />
                                                        3. Download the JSON file and upload it here
                                                    </small>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Verification */}
                            {currentStep === 3 && (
                                <div>
                                    {/* Install SDK Section */}
                                    <div className="mb-4">
                                        <h5 className="mb-3 fw-semibold">Install SDK</h5>
                                        <div
                                            className="p-4 rounded"
                                            style={{
                                                backgroundColor: '#2d2d2d',
                                                color: '#e0e0e0',
                                                fontFamily: 'monospace',
                                                fontSize: '14px',
                                                lineHeight: '1.6',
                                            }}
                                        >
                                            <div>import &#123;init&#125; from "@vision-sdk/react";</div>
                                            <div>init (&#123;</div>
                                            <div style={{ paddingLeft: '20px' }}>apikey: "pk_live_12345",</div>
                                            <div style={{ paddingLeft: '20px' }}>region: "us-east-1"</div>
                                            <div>&#125;);</div>
                                        </div>
                                    </div>

                                    {/* Integration Guidelines Section */}
                                    <div className="mb-4">
                                        <h5 className="mb-3 fw-semibold">Integration Guidelines</h5>
                                        <div className="p-4 rounded" style={{ backgroundColor: '#e8f4f8' }}>
                                            <p className="mb-3" style={{ color: '#5a5a5a', lineHeight: '1.6' }}>
                                                To complete the installation, copy the code snippet above and paste it
                                                into the &lt;head&gt; section of your website's HTML. For specific
                                                instructions on how to integrate with React, please refer to our
                                                detailed guides below.
                                            </p>
                                            <div className="text-end">
                                                <RSSecondaryButton
                                                    type="button"
                                                    id="rs_PushWebCreate_WatchTutorial"
                                                    style={{
                                                        borderColor: '#4a90e2',
                                                        color: '#4a90e2',
                                                    }}
                                                >
                                                    Watch Video Tutorial
                                                </RSSecondaryButton>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Step 2: Verify Installation Section */}
                                    <div className="mb-4">
                                        <h5 className="mb-3 fw-semibold">Step 2: Verify installation</h5>
                                        <p style={{ color: '#5a5a5a', marginBottom: '16px' }}>
                                            Once you have embedded the code in your website, return here and click "Run
                                            Health Check" to confirm that the SDK is active and sending data correctly.
                                        </p>
                                        <div
                                            className="p-4 rounded d-flex justify-content-between align-items-center"
                                            style={{ backgroundColor: '#e8f4f8' }}
                                        >
                                            <div>
                                                <strong style={{ color: '#333' }}>Current Status:</strong>
                                                <span style={{ color: '#5a5a5a', marginLeft: '8px' }}>
                                                    Pending Verification
                                                </span>
                                            </div>
                                            <RSPrimaryButton
                                                type="button"
                                                id="rs_PushWebCreate_HealthCheck"
                                                onClick={() => setSdkHealthCheckModal(true)}
                                            >
                                                Run Health Check
                                            </RSPrimaryButton>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <RSSecondaryButton
                                            onClick={() => {
                                                setCurrentStep(0);
                                            }}
                                        >
                                            Cancel
                                        </RSSecondaryButton>
                                        <RSPrimaryButton
                                            onClick={() => {
                                                setCurrentStep(4);
                                                setTimeout(() => {
                                                    let _temp = [...progressSteps];
                                                    _temp[3].status = 'completed';
                                                    _temp[4].status = 'inprogress';
                                                    setProgressSteps(_temp);
                                                }, 1000);
                                            }}
                                        >
                                            Next
                                        </RSPrimaryButton>
                                    </div>
                                </div>
                            )}

                            {/* Step 5: Push Config (Firebase Project Details) */}
                            {currentStep === 4 && (
                                <div>
                                    <div className="form-group">
                                        <h5 className="mb-3">Firebase Project Configuration</h5>
                                    </div>
                                    <Row>
                                        <Col md={6}>
                                            <div className="form-group">
                                                {!watch('jsonName') ? (
                                                    // <NewFirebaseServiceAccount />
                                                    <div
                                                        className={`firebase-dropzone ${
                                                            isDraggingJSON ? 'dragging' : ''
                                                        } ${uploadError || fcmJSONFile ? 'error' : ''}`}
                                                        onDragEnter={handleDragEnter}
                                                        onDragOver={handleDragOver}
                                                        onDragLeave={handleDragLeave}
                                                        onDrop={handleDrop}
                                                        onClick={handleBrowseClick}
                                                    >
                                                        <input
                                                            ref={fileInputRef}
                                                            type="file"
                                                            accept=".json"
                                                            onChange={handleFileInputChange}
                                                            style={{ display: 'none' }}
                                                        />

                                                        <div className="dropzone-content">
                                                            <div className="mb-3">
                                                                <i
                                                                    className={`${builder_upload_large} icon-xxlg text-primary`}
                                                                ></i>
                                                            </div>
                                                            <h5 className="mb-2">
                                                                {isDraggingJSON
                                                                    ? 'Drop your file here'
                                                                    : 'Drag & Drop your JSON file here'}
                                                            </h5>
                                                            <p className="text-muted mb-3">or</p>
                                                            <RSSecondaryButton
                                                                type="button"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleBrowseClick();
                                                                }}
                                                            >
                                                                <i className={`${folder_medium} me-2`}></i>
                                                                Browse Files
                                                            </RSSecondaryButton>
                                                            <p
                                                                className="text-muted mt-3 mb-0"
                                                                style={{ fontSize: '12px' }}
                                                            >
                                                                <i className={`${circle_info_medium} me-1`}></i>
                                                                Only .json files • Max 500KB
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="firebase-file-selected">
                                                        <div className="d-flex align-items-center justify-content-between p-3">
                                                            <div className="d-flex align-items-center flex-grow-1">
                                                                <div
                                                                    className="file-icon me-3"
                                                                    style={{
                                                                        width: '48px',
                                                                        height: '48px',
                                                                        backgroundColor: '#dcfce7',
                                                                        borderRadius: '8px',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                    }}
                                                                >
                                                                    <i
                                                                        className={`${file_tick_large} icon-lg text-success`}
                                                                    ></i>
                                                                </div>
                                                                <div className="flex-grow-1">
                                                                    <div className="d-flex align-items-center">
                                                                        <span className="fw-semibold me-2">
                                                                            {watch('jsonName')}
                                                                        </span>
                                                                        <i
                                                                            className={`${tick_circle_medium} icon-sm text-success`}
                                                                            title="Valid Firebase service account JSON"
                                                                        ></i>
                                                                    </div>
                                                                </div>
                                                                <div
                                                                    className="ms-3"
                                                                    style={{ position: 'relative', zIndex: 10 }}
                                                                >
                                                                    <RSPrimaryButton
                                                                        type="button"
                                                                        onClick={(e) => handleRemoveFile(e)}
                                                                        style={{ cursor: 'pointer' }}
                                                                    >
                                                                        Remove
                                                                    </RSPrimaryButton>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Inline Messages Below File Upload */}
                                                <div className="mt-2">
                                                    {/* FCM Testing Status */}
                                                    {isTestingFCM && (
                                                        <div
                                                            className="alert alert-info py-2 px-3 mb-2"
                                                            role="alert"
                                                            style={{ animation: 'fadeIn 0.3s ease-in' }}
                                                        >
                                                            <div className="d-flex align-items-center">
                                                                <div
                                                                    className="spinner-border spinner-border-sm me-2"
                                                                    role="status"
                                                                >
                                                                    <span className="visually-hidden">Loading...</span>
                                                                </div>
                                                                <small>Testing FCM credentials...</small>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* FCM Test Result - Success */}
                                                    {fcmTestResult &&
                                                        fcmTestResult.success &&
                                                        !isTestingFCM &&
                                                        watch('jsonName') && (
                                                            <div
                                                                className="alert alert-success py-2 px-3 mb-2"
                                                                role="alert"
                                                                style={{ animation: 'fadeIn 0.3s ease-in' }}
                                                            >
                                                                <div className="d-flex align-items-center">
                                                                    <i
                                                                        className={`${tick_circle_medium} me-2`}
                                                                    ></i>
                                                                    <small>
                                                                        <strong>Success!</strong> Valid Firebase service
                                                                        account JSON file. FCM credentials are working
                                                                        correctly.
                                                                    </small>
                                                                </div>
                                                            </div>
                                                        )}

                                                    {/* FCM Test Result - Warning (only if fileName is not empty) */}
                                                    {fcmTestResult &&
                                                        !fcmTestResult.success &&
                                                        !isTestingFCM &&
                                                        watch('jsonName') &&
                                                        watch('jsonName').length > 0 && (
                                                            <div
                                                                className="alert alert-warning py-2 px-3 mb-2"
                                                                role="alert"
                                                                style={{ animation: 'fadeIn 0.3s ease-in' }}
                                                            >
                                                                <div className="d-flex align-items-center">
                                                                    <i className={`${alert_medium} me-2`}></i>
                                                                    <small>
                                                                        <strong>Warning:</strong>{' '}
                                                                        {fcmTestResult.message}
                                                                    </small>
                                                                </div>
                                                            </div>
                                                        )}

                                                    {/* Upload Error */}
                                                    {uploadError && (
                                                        <div className="alert alert-danger py-2 px-3 mb-2" role="alert">
                                                            <small>
                                                                <i className={`${alert_medium} me-1`}></i>
                                                                {uploadError}
                                                            </small>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* <FirebaseJSONUploadModal
                                                    show={showJSONUploadModal}
                                                    onHide={() => setShowJSONUploadModal(false)}
                                                    onFileUpload={handleFirebaseJSONUpload}
                                                    currentFile={watch('jsonName')}
                                                /> */}
                                            </div>
                                        </Col>
                                        <Col md={6}>
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
                                                    </Col>
                                                </Row>
                                            </div>
                                        </Col>
                                    </Row>

                                    <div className="form-group d-flex justify-content-between align-items-center">
                                        <RSSecondaryButton
                                            type="button"
                                            onClick={() => {
                                                handleCancel(true);
                                            }}
                                        >
                                            Skip for now
                                        </RSSecondaryButton>
                                        <RSPrimaryButton
                                            type="button"
                                            onClick={async () => {
                                                // Validate all required fields for step 4
                                                const fieldsToValidate = [
                                                    'apiKey',
                                                    'authDomain',
                                                    'vapid',
                                                    'projectId',
                                                    'storageBucket',
                                                    'measurementId',
                                                    'appId',
                                                ];

                                                // Only validate fcmJSONFile if it's not already uploaded
                                                if (!watch('jsonName') || !watch('jsonName').length > 0) {
                                                    fieldsToValidate.push('fcmJSONFile');
                                                }

                                                const isValid = await trigger(fieldsToValidate);

                                                if (isValid) {
                                                    // Get form values
                                                    const formValues = watch();
                                                    const domainFlavourValue =
                                                        formValues.domainFlavour?.name ||
                                                        formValues.domainFlavour ||
                                                        '';

                                                    // Process fcmJSONFile - extract base64 content if it's a data URL
                                                    let tempfcmJSONFile = formValues?.fcmJSONFile?.includes(
                                                        'data:application/json;base64',
                                                    )
                                                        ? formValues?.fcmJSONFile.split(
                                                              'data:application/json;base64,',
                                                          )[1]
                                                        : formValues?.fcmJSONFile;

                                                    // Determine if V1 based on notificationProvider or if JSON file exists
                                                    const isV1 =
                                                        formValues?.notificationProvider === 'V1 HTTP' ||
                                                        (formValues?.fcmJSONFile &&
                                                            formValues?.fcmJSONFile.length > 0) ||
                                                        (formValues?.jsonName && formValues?.jsonName.length > 0);

                                                    // jsonPath: always use base64 content
                                                    const jsonPath =
                                                        formValues?.fcmJSONFile?.length > 0 ? tempfcmJSONFile : '';

                                                    // Build fcmConfig object
                                                    const fcmConfig = {
                                                        isV1: isV1,
                                                        jsonName: formValues?.jsonName || '',
                                                        jsonPath: jsonPath,
                                                        fcmsenderId: formValues?.fcmSenderId || null,
                                                        fcmserverkey: formValues?.fcmServerKey || null,
                                                        apiKey: formValues?.apiKey || '',
                                                        authDomain: formValues?.authDomain || '',
                                                        databaseUrl: formValues?.databaseUrl || '',
                                                        projectId: formValues?.projectId || '',
                                                        storageBucket: formValues?.storageBucket || '',
                                                        messagingSenderId: formValues?.measurementId || '',
                                                        vapid: formValues?.vapid || '',
                                                        appId: formValues?.appId || '',
                                                    };

                                                    // Build payload for SaveWebPushConfig API
                                                    const payload = {
                                                        clientId,
                                                        userId,
                                                        departmentId,
                                                        webnotifySettingId:
                                                            type === 'edit' ? config?.webNotifySettingId : 0,
                                                        domainName: formValues.domainName,
                                                        domainUrl: formValues.domainUrl,
                                                        framework: domainFlavourValue,
                                                        imagePath: formValues.domainLogo || '',
                                                        imageName: formValues.imageName || '',
                                                        fcmConfig: fcmConfig,
                                                        isAppAnalytics: formValues.webanalyticssetting || false,
                                                        AppAnalytics: formValues.webanalyticsetting || [],
                                                        createdBy: userId,
                                                    };

                                                    // Call SaveWebPushConfig API
                                                    const result = await dispatch(SaveWebPushConfig(payload));

                                                    // If API call is successful, proceed with form submission
                                                    if (result?.status) {
                                                        handleSubmit(handleFormSubmit)();
                                                    }
                                                }
                                            }}
                                        >
                                            Confirm
                                        </RSPrimaryButton>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card.Body>
                </Card>

                {/* Firebase JSON Upload Modal */}

                {/* SDK Health Check Modal */}
                {sdkHealthCheckModal && (
                    <SDKHealthCheck
                        show={sdkHealthCheckModal}
                        type="web"
                        data={{ domainName: watch('domainName') }}
                        domainUrl={watch('domainUrl') || ''}
                        close={() => setSdkHealthCheckModal(false)}
                    />
                )}
            </form>
        </FormProvider>
    );
};

export default WebOnboardingNew;
