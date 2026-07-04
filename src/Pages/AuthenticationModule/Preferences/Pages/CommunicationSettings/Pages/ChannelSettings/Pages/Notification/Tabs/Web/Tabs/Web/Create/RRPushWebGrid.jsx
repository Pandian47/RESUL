import { encryptWithAES, iv } from 'Utils/modules/crypto';
import { GeneratePasswordpseudorandom } from 'Utils/modules/passwordUtils';
import {validateHttpsUrl} from 'Utils/modules/urlQuery';
import { MAX_LENGTH25, MAX_LENGTH250, MAX_LENGTH255 } from 'Constants/GlobalConstant/Regex';
import { API_KEY as API_KEY_MSG, AUTH_TOKEN as AUTH_TOKEN_MSG, DOMAIN_NAME as DOMAIN_NAME_MSG, FCM_ID as FCM_ID_MSG, FCM_KEY as FCM_KEY_MSG, MESUREMENT as MESUREMENT_MSG, PROJECT_ID as PROJECT_ID_MSG, STORAGE_BUCKET as STORAGE_BUCKET_MSG, UPLOAD_FILE } from 'Constants/GlobalConstant/ValidationMessage';
import { LIST_NAME_RULES, WEBSITE_RULES } from 'Constants/GlobalConstant/Rules';
import { API_KEY, AUTH_TOKEN, DOMAIN_NAME, DOMAIN_URL, FCM_ID, FCM_KEY, FCM_POPOVER_TEXT, MESUREMENT, PROJECT_ID, STORAGE_BUCKET, UPLOAD_145_LOGO, VAPID } from 'Constants/GlobalConstant/Placeholders';
import { alert_medium, builder_upload_large, chevron_left, chevron_right, circle_info_medium, circle_question_mark_mini, file_tick_large, folder_medium, save, shield_tick_medium, tick_circle_medium, tick_small, trash_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useRef, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Row, Col, Card, ListGroup } from 'react-bootstrap';
import CryptoJS from 'crypto-js';

import RSInput from 'Components/FormFields/RSInput';
import RSFileUpload from 'Components/FormFields/RSFileUpload';
import RSRadioButton from 'Components/FormFields/RSRadioButton';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSPPophover from 'Components/RSPPophover';
import ListNameExists from 'Components/ListNameExists';
import FirebaseJSONUploadModal from './Component/FirebaseJSONUploadModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import './FirebaseUploadStyles.scss';

import { FORM_INITIAL_STATE, DOMAIN_FLAVOUR } from '../../../constant';
import {
    GetWebPushbyID,
    getWebPushAnalyticsList,
    UpsertWebPushSettings,
    getWebPushDomainNameExist,
    getWebPushDomainURLExist,
} from 'Reducers/preferences/CommunicationSettings/request';
import { getSessionId } from 'Reducers/globalState/selector';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import useOnlyDepChangeEffect from 'Hooks/useOnlyDepChangeEffect';

import usePermission from 'Hooks/usePersmission';

const RRPushWebGrid = ({ type, handleCancel, config, setFailedApi }) => {
    const steps = [
        { title: 'Domain Onboarding', mandatory: true },
        { title: 'Firebase Cloud Messaging', mandatory: false },
        { title: 'Firebase Project Details', mandatory: false },
    ];

    const [currentStep, setCurrentStep] = useState(0);
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
    const fileInputRef = useRef(null);
    const brandWebsiteHasError = Object.hasOwn(errors, 'domainUrl');

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
            getData();
        }
    }, [getWebPushAnalyticsListData]);

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
            let domainFlavourObj = data?.domainFlavour 
                ? DOMAIN_FLAVOUR.find(flavour => flavour.name === data.domainFlavour || flavour.id === data.domainFlavour)
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
            domainFlavour: formState?.domainFlavour?.name || formState?.domainFlavour || '',
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
    const handleFirebaseJSONUpload = ({ fileName, content, jsonData }) => {
        setValue('fcmJSONFile', content);
        setValue('jsonName', fileName);
        clearErrors('fcmJSONFile');
        setUploadError('');
    };

    // Validate Firebase JSON file
    const validateFirebaseJSON = (jsonContent) => {
        try {
            const parsed = JSON.parse(jsonContent);
            const requiredFields = [
                'type',
                'project_id',
                'private_key_id',
                'private_key',
                'client_email',
                'client_id',
            ];

            const missingFields = requiredFields.filter((field) => !parsed[field]);

            if (missingFields.length > 0) {
                return {
                    valid: false,
                    error: `Missing fields: ${missingFields.join(', ')}`,
                };
            }

            if (parsed.type !== 'service_account') {
                return {
                    valid: false,
                    error: 'Type must be "service_account"',
                };
            }

            return { valid: true, data: parsed };
        } catch (err) {
            return {
                valid: false,
                error: 'Invalid JSON format',
            };
        }
    };

    // Handle inline file upload
    const handleInlineFileUpload = (file) => {
        setUploadError('');

        if (!file) {
            return;
        }

        // Check file type
        if (!file.name.endsWith('.json')) {
            setUploadError('Please upload a JSON file');
            return;
        }

        // Check file size (500KB max)
        if (file.size > 500000) {
            setUploadError('File size must be less than 500KB');
            return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const content = e.target.result;
                const validation = validateFirebaseJSON(content);

                if (!validation.valid) {
                    setUploadError(validation.error);
                    return;
                }

                // Convert to base64
                const base64Content = btoa(content);
                const dataUrl = `data:application/json;base64,${base64Content}`;

                setValue('fcmJSONFile', dataUrl);
                setValue('jsonName', file.name);
                clearErrors('fcmJSONFile');
            } catch (error) {
                setUploadError('Failed to read file');
            }
        };

        reader.onerror = () => {
            setUploadError('Failed to read file');
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

    const handleRemoveFile = () => {
        setValue('fcmJSONFile', '');
        setValue('jsonName', '');
        setUploadError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Stepper navigation handlers
    const handleNext = async () => {
        let fieldsToValidate = [];

        // Validate fields for each step
        if (currentStep === 0) {
            fieldsToValidate = ['domainName', 'domainUrl', 'domainLogo'];
        } else if (currentStep === 1) {
            fieldsToValidate =
                notificationProviderControl === 'FCM' ? ['fcmSenderId', 'fcmServerKey'] : ['fcmJSONFile'];
        } else if (currentStep === 2) {
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

        const result = await methods.trigger(fieldsToValidate);
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

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <Card className="border shadow-sm">
                    <Card.Body className="p-0">
                        <Row className="g-0">
                            {/* Vertical Stepper Sidebar */}
                            <Col md={3} className="border-end bg-light">
                                <div className="p-4">
                                    <h5 className="mb-4 text-muted">Configuration Steps</h5>
                                    <ListGroup variant="flush">
                                        {steps.map((step, index) => (
                                            <ListGroup.Item
                                                key={index}
                                                action
                                                active={index === currentStep}
                                                onClick={() => handleStepClick(index)}
                                                className={`border-0 py-3 px-2 bg-transparent ${
                                                    index === currentStep
                                                        ? 'border-start border-primary border-3'
                                                        : ''
                                                }`}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className="d-flex align-items-start">
                                                    <div
                                                        className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${
                                                            index === currentStep
                                                                ? 'bg-primary text-white'
                                                                : index < currentStep
                                                                ? 'bg-success text-white'
                                                                : 'bg-secondary-subtle text-muted'
                                                        }`}
                                                        style={{
                                                            width: '32px',
                                                            height: '32px',
                                                            minWidth: '32px',
                                                            fontSize: '13px',
                                                            fontWeight: 'bold',
                                                        }}
                                                    >
                                                        {index < currentStep ? (
                                                            <i className={`${tick_small}`}></i>
                                                        ) : (
                                                            index + 1
                                                        )}
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <div
                                                            className={`fw-semibold ${
                                                                index === currentStep
                                                                    ? 'text-primary'
                                                                    : 'text-dark'
                                                            }`}
                                                            style={{ fontSize: '14px' }}
                                                        >
                                                            {step.title}
                                                        </div>
                                                        {step.mandatory && (
                                                            <small className="text-danger">*Required</small>
                                                        )}
                                                        {!step.mandatory && (
                                                            <small className="text-muted">Optional</small>
                                                        )}
                                                    </div>
                                                </div>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                </div>
                            </Col>

                            {/* Step Content Area */}
                            <Col md={9}>
                                <div className="p-4">
                                    <div className="mb-4 pb-3 border-bottom">
                                        <h4 className="mb-1">{steps[currentStep].title}</h4>
                                        <small className="text-muted">
                                            Step {currentStep + 1} of {steps.length}
                                        </small>
                                    </div>

                                    {/* Step 1: Domain Onboarding */}
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
                                                                setValue('domainUrl', validateHttpsUrl.formatUrl(e.target.value));
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
                                                                // Optional: Handle change if needed
                                                            }}
                                                        />
                                                        <small className="text-muted">Select the technology used to build your website</small>
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

                                    {/* Step 2: Firebase Cloud Messaging */}
                                    {currentStep === 1 && (
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

                                                        {!watch('jsonName') ? (
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
                                                                        <i className={`${builder_upload_large} icon-xxlg text-primary`}></i>
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
                                                                    <p className="text-muted mt-3 mb-0" style={{ fontSize: '12px' }}>
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
                                                                            <small className="text-success">
                                                                                <i className={`${shield_tick_medium} me-1`}></i>
                                                                                Valid Firebase configuration
                                                                            </small>
                                                                        </div>
                                                                        <div className="ms-3">
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-sm btn-outline-danger"
                                                                                onClick={handleRemoveFile}
                                                                                title="Remove file"
                                                                            >
                                                                                <i className={`${trash_medium} me-1`}></i>
                                                                                Remove
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {(uploadError || fcmJSONFile) && (
                                                            <div className="alert alert-danger mt-2 mb-0 py-2 px-3" role="alert">
                                                                <small>
                                                                    <i className={`${alert_medium} me-1`}></i>
                                                                    {uploadError || fcmJSONFile?.message || UPLOAD_FILE}
                                                                </small>
                                                            </div>
                                                        )}

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

                                    {/* Step 3: Firebase Project Details */}
                                    {currentStep === 2 && (
                                        <div>
                                            <h5 className="mb-3">Firebase Project Configuration</h5>
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
                                        </div>
                                    )}

                                    {/* Navigation Buttons */}
                                    <div className="d-flex justify-content-between mt-4 pt-4 border-top">
                                        <div>
                                            <RSSecondaryButton
                                                id="rs_PushWebCreate_Back"
                                                type="button"
                                                onClick={handleBack}
                                                disabled={currentStep === 0}
                                                className="me-2"
                                            >
                                                <i className={`${chevron_left} me-1`}></i>
                                                Back
                                            </RSSecondaryButton>
                                            <RSSecondaryButton
                                                id="rs_PushWebCreate_Cancel"
                                                type="button"
                                                onClick={() => {
                                                    if (state?.from === 'WN') {
                                                        const locationState = state?.locationState;
                                                        const encryptState = encodeURIComponent(
                                                            encryptWithAES(
                                                                JSON.stringify(locationState).replace(/\+/g, '%2B'),
                                                            ),
                                                        );
                                                        navigate(`/communication/create-communication?q=${encryptState}`);
                                                    }
                                                    handleCancel(true);
                                                }}
                                            >
                                                Cancel
                                            </RSSecondaryButton>
                                        </div>
                                        <div>
                                            {!steps[currentStep].mandatory && currentStep < steps.length - 1 && (
                                                <RSSecondaryButton
                                                    id="rs_PushWebCreate_Skip"
                                                    type="button"
                                                    onClick={handleSkip}
                                                    className="me-2"
                                                >
                                                    Skip
                                                    <i className={`${chevron_right} ms-1`}></i>
                                                </RSSecondaryButton>
                                            )}
                                            {currentStep < steps.length - 1 ? (
                                                <RSPrimaryButton
                                                    id="rs_PushWebCreate_Next"
                                                    type="button"
                                                    onClick={handleNext}
                                                >
                                                    Next
                                                    <i className={`${chevron_right} ms-1`}></i>
                                                </RSPrimaryButton>
                                            ) : (
                                                addAccess && (
                                                    <RSPrimaryButton type="submit" id="rs_PushWebCreate_submit">
                                                        <i className={`${save} me-1`}></i>
                                                        {type === 'edit' ? 'Update' : 'Save'}
                                                    </RSPrimaryButton>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Firebase JSON Upload Modal */}
                <FirebaseJSONUploadModal
                    show={showJSONUploadModal}
                    onHide={() => setShowJSONUploadModal(false)}
                    onFileUpload={handleFirebaseJSONUpload}
                    currentFile={watch('jsonName')}
                />
            </form>
        </FormProvider>
    );
};

export default RRPushWebGrid;
