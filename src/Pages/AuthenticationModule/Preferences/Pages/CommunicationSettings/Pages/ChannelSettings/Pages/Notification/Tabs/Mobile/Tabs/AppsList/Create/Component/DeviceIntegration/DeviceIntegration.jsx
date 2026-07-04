import { MAX_LENGTH250, MAX_LENGTH255, MAXL_LENGTH1024 } from 'Constants/GlobalConstant/Regex';
import { APNS_APPLE_ID_INVALID, APNS_KEY_ID_REQUIRED, APNS_TEAM_ID_REQUIRED, BUNDLE_ID_REQUIRED, CHOOSE_FILE, FCM_SENDERID as FCM_SENDERID_MSG, FCM_SEVERKEY as FCM_SEVERKEY_MSG, SELECT_LANGUAGE, SELECT_MOBILE_PLATFORM, SELECT_PROVIDER } from 'Constants/GlobalConstant/ValidationMessage';
import { APNS_KEY_ID, APNS_TEAM_ID, APPSTORE_URL, BUNDLE_ID, ENVIRONMENT_HELP_TEXT, FCM_SENDERID, FCM_SEVERKEY, LANGUAGE, MOBILE_PLATFORM, PLAYSTORE_URL } from 'Constants/GlobalConstant/Placeholders';
import { circle_minus_fill_medium, circle_plus_fill_edge_medium, circle_question_mark_mini } from 'Constants/GlobalConstant/Glyphicons';
import { useState } from 'react';
import { cloneDeep as _cloneDeep } from 'Utils/modules/lodashReplacements';
import { Accordion, Row, Col } from 'react-bootstrap';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import { UpdateState } from 'Utils/modules/misc';
import { accordianIcon } from 'Utils/modules/display';
import { charNumDotWithoutSpecialCharacters } from 'Utils/modules/inputValidators';

import { useSelector, useDispatch } from 'react-redux';
import RSInput from 'Components/FormFields/RSInput';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSRadioButton from 'Components/FormFields/RSRadioButton';
import RSFileUpload from 'Components/FormFields/RSFileUpload';
import RSTooltip from 'Components/RSTooltip';
import AppAnalyticsSetting from '../AppAnalyticsSetting/AppAnalyticsSetting';
import { checkAppStoreUrl } from 'Reducers/preferences/CommunicationSettings/request';
import { getSessionId } from 'Reducers/globalState/selector';
import { INITIAL_DEVICE_STATE } from '../../constant';
import ListNameExists from 'Components/ListNameExists';
import RSModal from 'Components/RSModal';
import MobileFCMGuidelines from './MobileFCMGuidelines';
const DeviceIntegration = ({ ddlDevice, ddlLanguage, ddlAnalysis, dropdownFieldLoading = false }) => {
    const dispatch = useDispatch();
    const [Device, setDevice] = useState(ddlDevice);

    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));

    const {
        control,
        trigger,
        setError,
        clearErrors,
        setValue,
        watch,
        formState: { isValid, errors },
    } = useFormContext();

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'devices',
    });

    const watchLink = useWatch({
        control,
        name: 'devices',
    });

    const [activeIndex, setActiveIndex] = useState(0);
    const [platforms, setPlatforms] = useState(Device);
    const [state, setState] = useState({
        tabs: [
            {
                title: 'Mobile',
                type: 'MOBILE',
            },
        ],
        mobilePlatform: Device,
    });
    const [showFCMGuidelinesModal, setShowFCMGuidelinesModal] = useState(false);
    const [currentGuidelinesIndex, setCurrentGuidelinesIndex] = useState(null);

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
            return { valid: true };
        } catch (e) {
            return {
                valid: false,
                error: 'Invalid JSON format. Please upload a valid Firebase service account JSON file.',
            };
        }
    };

    const handleClearErrorFCM = (idx) => {
        clearErrors(`devices[${idx}].HTTPFilePath`);
        clearErrors(`devices[${idx}].bundleId`);
        clearErrors(`devices[${idx}].apnsTeamId`);
        clearErrors(`devices[${idx}].apnsKeyId`);
        clearErrors(`devices[${idx}].apnsFilePath`);
        clearErrors(`devices[${idx}].apnsEnvironment`);
    };

    const handleClearErrorV1HTTP = (idx) => {
        clearErrors(`devices[${idx}].bundleId`);
        clearErrors(`devices[${idx}].apnsTeamId`);
        clearErrors(`devices[${idx}].apnsKeyId`);
        clearErrors(`devices[${idx}].apnsFilePath`);
        clearErrors(`devices[${idx}].apnsEnvironment`);
        clearErrors(`devices[${idx}].fcmSenderId`);
        clearErrors(`devices[${idx}].fcmServerkey`);
    };

    const handleClearErrorAPNS = (idx) => {
        clearErrors(`devices[${idx}].fcmSenderId`, '');
        clearErrors(`devices[${idx}].fcmServerkey`, '');
        clearErrors(`devices[${idx}].HTTPFilePath`, '');
    };

    const resetDeviceRowOnPlatformChange = (idx) => {
        const initial = _cloneDeep(INITIAL_DEVICE_STATE);
        Object.keys(initial).forEach((key) => {
            if (key === 'mobplatformName') return;
            setValue(`devices[${idx}].${key}`, initial[key]);
            clearErrors(`devices[${idx}].${key}`);
        });
    };

    const handleMobilePlaformChange = (e, idx) => {
        const { value } = e.target;
        const temp = { ...state };
        temp.tabs[idx].title = value;
        UpdateState(setState, 'tabs', temp.tabs);
        resetDeviceRowOnPlatformChange(idx);
    };
    const addPlatform = (idx) => {
        if (isValid) {
            const tempState = { ...state };
            tempState.tabs.push({
                title: 'Mobile',
                type: 'MOBILE',
            });
            const tempPlatforms = [...platforms];

            //  const platformIndex = tempPlatforms.indexOf(state.tabs[idx].title);
            //  tempPlatforms.splice(platformIndex, 1);
            append(_cloneDeep(INITIAL_DEVICE_STATE));
            clearErrors();
            setDevice(Device.filter((e) => e?.deviceName !== watchLink[idx].mobplatformName.deviceName));
            // setPlatforms(tempPlatforms);
            setState(tempState);
            setActiveIndex(idx + 1);
        } else {
            trigger();
            setActiveIndex(idx);
        }
    };
    const removePlatform = (idx) => {
        if (idx !== 0) {
            const removedPlatform = watchLink?.[idx]?.mobplatformName;
            const temp = { ...state };
            temp.tabs.splice(idx, 1);
            setDevice((prev) => {
                if (!removedPlatform || typeof removedPlatform !== 'object') return prev;
                const id = removedPlatform.appDeviceId;
                const name = removedPlatform.deviceName;
                if (name == null && id == null) return prev;
                const exists = prev.some(
                    (d) =>
                        (id != null && d?.appDeviceId === id) ||
                        (name != null && d?.deviceName === name),
                );
                if (exists) return prev;
                return [...prev, removedPlatform];
            });
            setState(temp);
        }
        remove(idx);
    };

    return (
        <div>
            {fields?.map((field, idx) => {
                const currentValue = watchLink[idx];
                // const title = state.tabs[idx].title;
                const title = !!currentValue?.mobplatformName?.deviceName
                    ? currentValue?.mobplatformName?.deviceName
                    : 'Mobile';
                // console.log('title: ', title);
                return (
                    <Row className="position-relative mb30" key={field.id}>
                        <Col sm={12} className="mobile-notification create-app-grid">
                            <Accordion activeKey={activeIndex} key={field.id} className="no-box-shadow">
                                <Accordion.Item eventKey={idx}>
                                    <Accordion.Header
                                        onClick={(e) => {
                                            if (activeIndex === idx) {
                                                setActiveIndex(null);
                                            } else {
                                                setActiveIndex(idx);
                                            }
                                        }}
                                    >
                                        <i className={`${accordianIcon(idx, activeIndex)}`} />{' '}
                                        <span>{title}</span>
                                        <div className="mb25 position-absolute right15 top10 z-3">
                                            <RSTooltip text="Delete" position="top" className="lh0">
                                                <i
                                                    className={`${idx !== 0 &&
                                                        `${circle_minus_fill_medium} icon-md color-primary-red rs-accordion-item-remove-del`
                                                        }`}
                                                    onClick={() => removePlatform(idx)}
                                                />
                                            </RSTooltip>
                                        </div>
                                    </Accordion.Header>
                                    <Accordion.Body>
                                        <div className="form-group mt11">
                                            <Row>
                                                <Col sm={3} className="text-right">
                                                    <label className="control-label-left">Mobile platform</label>
                                                </Col>
                                                <Col sm={8} id="rs_DeviceIntegration_mobileplatform">
                                                    <RSKendoDropDownList
                                                        control={control}
                                                        name={`devices[${idx}].mobplatformName`}
                                                        data={Device}
                                                        label={MOBILE_PLATFORM}
                                                        textField={'deviceName'}
                                                        dataItemKey={'appDeviceId'}
                                                        required
                                                        isLoading={dropdownFieldLoading}
                                                        rules={{
                                                            required: SELECT_MOBILE_PLATFORM,
                                                        }}
                                                        handleChange={(e) => handleMobilePlaformChange(e, idx)}
                                                    />
                                                </Col>
                                            </Row>
                                        </div>
                                        <div className="form-group">
                                            <Row>
                                                <Col sm={{ span: 8, offset: 3 }}>
                                                    {/* <RSInput
                                                        control={control}
                                                        id="rs_DeviceIntegration_appStoreUrl"
                                                        name={`devices[${idx}].appStoreUrl`}
                                                        placeholder={
                                                            title.includes('Android')
                                                                ? PLAYSTORE_URL
                                                                : APPSTORE_URL
                                                        }
                                                        required
                                                        rules={{
                                                            required: title.includes('Android')
                                                                ? PLAYSTORE_URL
                                                                : APPSTORE_URL,
                                                            validate: (value) => {
                                                                if (!value) return true; // Let required rule handle empty values
                                                                
                                                                const isAndroid = title.includes('Android');
                                                                const isPlayStoreUrl = value.toLowerCase().includes('play.google.com') || value.toLowerCase().includes('playstore');
                                                                const isAppStoreUrl = value.toLowerCase().includes('apps.apple.com') || value.toLowerCase().includes('appstore');
                                                                
                                                                if (isAndroid && isAppStoreUrl) {
                                                                    return 'Please enter a valid Play Store URL for Android devices';
                                                                }
                                                                if (!isAndroid && isPlayStoreUrl) {
                                                                    return 'Please enter a valid App Store URL for iOS devices';
                                                                }
                                                                
                                                                return true;
                                                            }
                                                        }}
                                                        handleOnBlur={(e)=>{

                                                        }}
                                                    /> */}

                                                    <ListNameExists
                                                        name={`devices[${idx}].appStoreUrl`}
                                                        field="Url"
                                                        apiCallback={checkAppStoreUrl}
                                                        condition={(data) => {
                                                            const { status, message } = data;
                                                            return status;
                                                        }}
                                                        maxLength={MAXL_LENGTH1024}
                                                        placeholder={
                                                            title.includes('Android')
                                                                ? PLAYSTORE_URL
                                                                : APPSTORE_URL
                                                        }
                                                        required
                                                        rules={{
                                                            required: title.includes('Android')
                                                                ? PLAYSTORE_URL
                                                                : APPSTORE_URL,
                                                        }}
                                                        validate={{
                                                            urlValidation: (value) => {
                                                                if (!value) return true;
                                                                const isAndroid = title.includes('Android');
                                                                const isPlayStoreUrl = value.toLowerCase().includes('play.google.com') || value.toLowerCase().includes('playstore');
                                                                const isAppStoreUrl = value.toLowerCase().includes('apps.apple.com') || value.toLowerCase().includes('appstore');

                                                                if (isAndroid && isAppStoreUrl) {
                                                                    return 'Enter valid URL';
                                                                }
                                                                if (!isAndroid && isPlayStoreUrl) {
                                                                    return 'Enter valid URL';
                                                                }

                                                                return true;
                                                            }
                                                        }}
                                                        isSpecialCharacter={false}
                                                    />
                                                </Col>
                                            </Row>
                                        </div>
                                        <div
                                            className={`form-group ${currentValue?.notificationProvider ? '' : ''
                                                }`}
                                        >
                                            <Row>
                                                <Col sm={3} className="text-right">
                                                    <label className="control-label-left">Notification provider</label>
                                                </Col>
                                                <Col sm={8}>
                                                    <ul className="rs-list-inline rli-space-10 d-flex gap-3">
                                                        {/* <li>
                                                            <RSRadioButton
                                                                control={control}
                                                                name={`devices[${idx}].notificationProvider`}
                                                                labelName="FCM"
                                                                rules={{
                                                                    required: SELECT_PROVIDER,
                                                                }}
                                                                handleChange={() => handleClearErrorFCM(idx)}
                                                                id="rs_DeviceIntegration_FCM"
                                                            />
                                                        </li> */}
                                                        <li className='align-items-center d-flex'>
                                                            <RSRadioButton
                                                                control={control}
                                                                name={`devices[${idx}].notificationProvider`}
                                                                labelName="FCM(V1HTTP)"
                                                                id={`rs_DeviceIntegration_V1HTTP_${idx}`}
                                                                handleChange={() => handleClearErrorV1HTTP(idx)}
                                                                radio_wrapper_class="mt0"
                                                                rules={{
                                                                    required: SELECT_PROVIDER,
                                                                }}
                                                            />
                                                            {currentValue?.mobplatformName?.deviceName?.length > 0 && (
                                                                <i
                                                                    className={`${circle_question_mark_mini} color-primary-blue icon-xs position-relative lh0  cursor-pointer right2`}
                                                                    id="circle_question_mark"
                                                                    onClick={() => {
                                                                        setCurrentGuidelinesIndex(idx);
                                                                        setShowFCMGuidelinesModal(true);
                                                                    }}
                                                                />
                                                            )}
                                                        </li>
                                                        {title.startsWith('i') && (
                                                            <li>
                                                                <RSRadioButton
                                                                    control={control}
                                                                    name={`devices[${idx}].notificationProvider`}
                                                                    labelName="APNS"
                                                                    id={`rs_DeviceIntegration_APNS_${idx}`}
                                                                    handleChange={() => handleClearErrorAPNS(idx)}
                                                                    radio_wrapper_class="mt0"
                                                                    isError={false}
                                                                />
                                                            </li>
                                                        )}
                                                    </ul>
                                                </Col>
                                            </Row>
                                        </div>
                                       
                                            <Row>
                                                <Col sm={{ span: 8, offset: 3 }}>
                                                    {currentValue?.notificationProvider === 'FCM'  && (
                                                        <div className='form-group'>
                                                        <Row>
                                                            <Col sm={6}>
                                                                <RSInput
                                                                    control={control}
                                                                    name={`devices[${idx}].fcmSenderId`}
                                                                    placeholder={FCM_SENDERID}
                                                                    id="rs_DeviceIntegration_FCMSenderID"
                                                                    required
                                                                    maxLength={MAX_LENGTH250}
                                                                    rules={{
                                                                        required: FCM_SENDERID_MSG,
                                                                    }}
                                                                />
                                                            </Col>
                                                            <Col sm={6}>
                                                                <RSInput
                                                                    control={control}
                                                                    name={`devices[${idx}].fcmServerkey`}
                                                                    id="rs_DeviceIntegration_FCMSurveyKey"
                                                                    placeholder={FCM_SEVERKEY}
                                                                    required
                                                                    maxLength={MAX_LENGTH250}
                                                                    rules={{
                                                                        required: FCM_SEVERKEY_MSG,
                                                                    }}
                                                                />
                                                            </Col>
                                                        </Row>
                                                        </div>
                                                    )}{' '}
                                                    {currentValue?.notificationProvider === 'APNS' && (
                                                        <>
                                                            <div className='form-group'>
                                                                <Row>
                                                                    <Col sm={6} className='position-relative top2'>
                                                                        <RSInput
                                                                            control={control}
                                                                            id="rs_DeviceIntegration_bundleId"
                                                                            name={`devices[${idx}].bundleId`}
                                                                            placeholder={BUNDLE_ID}
                                                                            maxLength={MAX_LENGTH255}
                                                                            onKeyDown={charNumDotWithoutSpecialCharacters}
                                                                            rules={{
                                                                                required: BUNDLE_ID_REQUIRED,
                                                                            }}
                                                                        />
                                                                    </Col>
                                                                    <Col sm={6} className='position-relative top2'>
                                                                    <RSInput
                                                                            control={control}
                                                                            id="rs_DeviceIntegration_apnsTeamId"
                                                                            name={`devices[${idx}].apnsTeamId`}
                                                                            placeholder={APNS_TEAM_ID}
                                                                            required
                                                                            maxLength={10}
                                                                            rules={{
                                                                                required: APNS_TEAM_ID_REQUIRED,
                                                                                validate: (value) => {
                                                                                    const v = (value || '').trim();
                                                                                    if (!v) return true;
                                                                                    if (/[a-z]/.test(v)) {
                                                                                        return 'Use A-Z and 0-9 only';
                                                                                    }
                                                                                    return (
                                                                                        /^[A-Z0-9]{10}$/.test(v) ||
                                                                                        APNS_APPLE_ID_INVALID
                                                                                    );
                                                                                },
                                                                            }}
                                                                            handleOnchange={(e) => {
                                                                                const fieldPath = `devices[${idx}].apnsTeamId`;
                                                                                const v = (e?.target?.value || '').trim();
                                                                                if (/[a-z]/.test(v)) {
                                                                                    setError(fieldPath, {
                                                                                        type: 'custom',
                                                                                        message: 'Use A-Z and 0-9 only',
                                                                                    });
                                                                                } else {
                                                                                    clearErrors(fieldPath);
                                                                                }
                                                                                trigger(fieldPath);
                                                                            }}
                                                                        />
                                                                    </Col>
                                                                </Row>
                                                            </div>
                                                            <div className='form-group'>
                                                                <Row>
                                                                    <Col sm={6}>
                                                                    <RSInput
                                                                            control={control}
                                                                            id="rs_DeviceIntegration_apnsKeyId"
                                                                            name={`devices[${idx}].apnsKeyId`}
                                                                            placeholder={APNS_KEY_ID}
                                                                            required
                                                                            maxLength={10}
                                                                            rules={{
                                                                                required: APNS_KEY_ID_REQUIRED,
                                                                                validate: (value) => {
                                                                                    const v = (value || '').trim();
                                                                                    if (!v) return true;
                                                                                    if (/[a-z]/.test(v)) {
                                                                                        return 'Use A-Z and 0-9 only';
                                                                                    }
                                                                                    return (
                                                                                        /^[A-Z0-9]{10}$/.test(v) ||
                                                                                        APNS_APPLE_ID_INVALID
                                                                                    );
                                                                                },
                                                                            }}
                                                                            handleOnchange={(e) => {
                                                                                const fieldPath = `devices[${idx}].apnsKeyId`;
                                                                                const v = (e?.target?.value || '').trim();
                                                                                if (/[a-z]/.test(v)) {
                                                                                    setError(fieldPath, {
                                                                                        type: 'custom',
                                                                                        message: 'Use A-Z and 0-9 only',
                                                                                    });
                                                                                } else {
                                                                                    clearErrors(fieldPath);
                                                                                }
                                                                                trigger(fieldPath);
                                                                            }}
                                                                        />
                                                                    </Col>
                                                                    <Col sm={6}>
                                                                    <RSFileUpload
                                                                            control={control}
                                                                            id="rs_DeviceIntegration_apnsfilepath"
                                                                            name={`devices[${idx}].apnsFilePath`}
                                                                            text="Upload"
                                                                            accept={'.p8'}
                                                                            placeholder={(() => {
                                                                                const raw =
                                                                                    currentValue?.filepath ||
                                                                                    (typeof currentValue?.apnsFilePath ===
                                                                                        'string' &&
                                                                                        !currentValue.apnsFilePath.startsWith(
                                                                                            'data:',
                                                                                        )
                                                                                        ? currentValue.apnsFilePath
                                                                                        : '');
                                                                                if (!raw) return 'Certificate p8 path';
                                                                                const name = String(raw)
                                                                                    .replace(/\\/g, '/')
                                                                                    .split('/')
                                                                                    .pop();
                                                                                return name || 'Certificate p8 path';
                                                                            })()}
                                                                            clearErrors={clearErrors}
                                                                            setError={setError}
                                                                            size={500000}
                                                                            isbase64
                                                                            handleChange={(e) => {
                                                                                setValue(
                                                                                    `devices[${idx}].filepath`,
                                                                                    e.target.value.split('\\').pop(),
                                                                                );

                                                                                clearErrors(`devices[${idx}].apnsFilePath`);
                                                                            }}
                                                                            required
                                                                            rules={{
                                                                                required: 'Upload p8 file',
                                                                            }}
                                                                            watch={watch}
                                                                        />
                                                                    </Col>
                                                                </Row>
                                                            </div>
                                                            <div className='form-group'>
                                                                <Row>
                                                                    <Col sm={8}>
                                                                        <ul className="rs-list-inline rli-space-10 d-flex align-items-center">
                                                                            <li>
                                                                                <RSRadioButton
                                                                                    control={control}
                                                                                    name={`devices[${idx}].apnsEnvironment`}
                                                                                    labelName="Sandbox"
                                                                                    id={`rs_DeviceIntegration_APNS_Sandbox_${idx}`}
                                                                                    rules={{
                                                                                        required: 'Select environment',
                                                                                    }}
                                                                                    handleChange={() => {
                                                                                        clearErrors(`devices[${idx}].apnsEnvironment`, '');
                                                                                    }}
                                                                                    radio_wrapper_class="mt0"
                                                                                />
                                                                            </li>
                                                                            <li>
                                                                                <RSRadioButton
                                                                                    control={control}
                                                                                    name={`devices[${idx}].apnsEnvironment`}
                                                                                    labelName="Production"
                                                                                    id={`rs_DeviceIntegration_APNS_Production_${idx}`}
                                                                                    radio_wrapper_class="mt0"
                                                                                />
                                                                            </li>
                                                                               <RSTooltip text={ENVIRONMENT_HELP_TEXT} position="top" className='position-relative top3'>
                                                                                     <i
                                                                                                        className={`${circle_question_mark_mini} icon-xs color-primary-blue ml5 position-relative`}
                                                                                                        id="rs_compliance_keywords_info"
                                                                                     />
                                                                                </RSTooltip>
                                                                        </ul>
                                                                    </Col>
                                                                </Row>
                                                            </div>
                                                        </>
                                                    )}{' '}
                                                    {currentValue?.notificationProvider === 'FCM(V1HTTP)' && (
                                                        <div className='form-group'>
                                                        <Row>
                                                            <Col sm={12}>
                                                                <RSFileUpload
                                                                        control={control}
                                                                        id={`rs_DeviceIntegration_HTTPFilepath_${idx}`}
                                                                        name={`devices[${idx}].HTTPFilePath`}
                                                                        text="Browse"
                                                                        accept={'.json'}
                                                                        placeholder={(() => {
                                                                            const raw =
                                                                                currentValue?.jsonPath ||
                                                                                (typeof currentValue?.HTTPFilePath === 'string' &&
                                                                                !currentValue.HTTPFilePath.startsWith('data:')
                                                                                    ? currentValue.HTTPFilePath
                                                                                    : '');
                                                                            if (!raw) return '';
                                                                            const name = String(raw)
                                                                                .replace(/\\/g, '/')
                                                                                .split('/')
                                                                                .pop();
                                                                            return name || '';
                                                                        })()}
                                                                        clearErrors={clearErrors}
                                                                        setError={setError}
                                                                        size={500000}
                                                                        isbase64
                                                                        handleChange={(e) => {
                                                                            const selectedFile = e?.target?.files?.[0];
                                                                            const fileName = e?.target?.value?.split('\\').pop() || '';
                                                                            if (!selectedFile) return;
                                                                            const reader = new FileReader();
                                                                            reader.onload = (event) => {
                                                                                const content = event?.target?.result;
                                                                                const validation = validateFirebaseJSON(content);
                                                                                if (!validation.valid) {
                                                                                    setError(`devices[${idx}].HTTPFilePath`, {
                                                                                        type: 'custom',
                                                                                        message: validation.error,
                                                                                    });
                                                                                    setValue(`devices[${idx}].HTTPFilePath`, '');
                                                                                    setValue(`devices[${idx}].jsonPath`, '');
                                                                                    return;
                                                                                }
                                                                                setValue(`devices[${idx}].jsonPath`, fileName);
                                                                                clearErrors(`devices[${idx}].HTTPFilePath`);
                                                                            };
                                                                            reader.onerror = () => {
                                                                                setError(`devices[${idx}].HTTPFilePath`, {
                                                                                    type: 'custom',
                                                                                    message: 'Error reading file. Please try again.',
                                                                                });
                                                                                setValue(`devices[${idx}].HTTPFilePath`, '');
                                                                                setValue(`devices[${idx}].jsonPath`, '');
                                                                            };
                                                                            reader.readAsText(selectedFile);
                                                                        }}
                                                                        required
                                                                        rules={{
                                                                            required: CHOOSE_FILE,
                                                                        }}
                                                                        watch={watch}
                                                                    />
                                                            </Col>
                                                            <Col sm={12}>
                                                                <small>Upload service account JSON file</small>
                                                            </Col>
                                                        </Row>
                                                        </div>
                                                    )}
                                                </Col>
                                            </Row>
                                        
                                        {currentValue?.notificationProvider === 'FCM' && (
                                            <div className='form-group'>
                                            <Row>
                                                <Col sm={{ span: 8, offset: 3 }}>
                                                    <div className="alert-note p19 border-r10 lh-sm border">
                                                        <Row className='align-items-center'>
                                                            <Col sm={8} className='apns-text'>
                                                                <p>
                                                                    Provide your FCM details to trigger communications on your
                                                                    mobile app.{' '}

                                                                </p>

                                                            </Col>
                                                            <Col sm={4} >
                                                                <a
                                                                    href={{ pathname: 'https://firebase.google.com/' }}
                                                                    target="_blank"
                                                                    className=""
                                                                >
                                                                    {'Copy from firebase console'}
                                                                </a>
                                                            </Col>
                                                        </Row>

                                                    </div>
                                                </Col>
                                            </Row>
                                            </div>
                                        )}{' '}
                                        {currentValue?.notificationProvider === 'APNS' && (
                                            <div className='form-group'>
                                            <Row>
                                                <Col sm={{ span: 8, offset: 3 }}>
                                                    <div className="alert-note p19 border-r10 lh-sm border">
                                                        <Row className='align-items-center'>
                                                            <Col sm={8} className='apns-text'>
                                                                <p>
                                                                    The APNS .p8 is used for delivery the notification for iOS
                                                                    device provide valid p8 file and password.{' '}

                                                                </p>
                                                            </Col>
                                                            <Col sm={4} >
                                                                <a
                                                                    href="https://idmsa.apple.com/IDMSWebAuth/signin?appIdKey=891bd3417a7776362562d2197f89480a8547b108fd934911bcbea0110d07f757&path=%2Faccount%2F&rv=1"
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    Download .p8 file from Apple Developer account.
                                                                </a>
                                                            </Col>

                                                        </Row>

                                                    </div>
                                                </Col>
                                            </Row>
                                            </div>
                                        )}
                                        <div className="form-group mb5">
                                            <Row>
                                                <Col sm={3} className="text-right">
                                                    <label className="control-label-left">Language</label>
                                                </Col>
                                                <Col sm={3}>
                                                    <ul className="rs-list-inline rli-space-10 d-flex">
                                                        <li>
                                                            <RSRadioButton
                                                                control={control}
                                                                required
                                                                name={`devices[${idx}].languageId`}
                                                                labelName="Native"
                                                                rules={{
                                                                    required: SELECT_LANGUAGE,
                                                                }}
                                                                handleChange={() => {
                                                                    clearErrors(`devices[${idx}].languageType`, '');
                                                                }}
                                                                id={`rs_DeviceIntegration_Native_${idx}`}
                                                                radio_wrapper_class="mt0"
                                                            />
                                                        </li>
                                                        <li>
                                                            <RSRadioButton
                                                                control={control}
                                                                name={`devices[${idx}].languageId`}
                                                                labelName="Hybrid"
                                                                id={`rs_DeviceIntegration_Hybrid_${idx}`}
                                                                isError={false}
                                                                radio_wrapper_class="mt0"
                                                            />
                                                        </li>
                                                    </ul>
                                                </Col>
                                                <Col sm={5} id="rs_DeviceIntegration_languagename">
                                                    {currentValue?.languageId === 'Hybrid' && (
                                                        <RSKendoDropDownList
                                                            control={control}
                                                            name={`devices[${idx}].languageType`}
                                                            data={ddlLanguage}
                                                            textField={'languageName'}
                                                            dataItemKey={'languageId'}
                                                            label={LANGUAGE}
                                                            required
                                                            isLoading={dropdownFieldLoading}
                                                            rules={{
                                                                required: SELECT_LANGUAGE,
                                                            }}
                                                        />
                                                    )}
                                                </Col>
                                            </Row>
                                        </div>
                                        {/* <div className="form-group mb0">
                                            <Row>
                                                <Col sm={3} className="text-right">
                                                    <label className="control-label-left">App analytics</label>
                                                </Col>
                                                <Col sm={8}>
                                                    <RSSwitch
                                                        control={control}
                                                        id="rs_DeviceIntegration_isAppAnalyticsswitch"
                                                        name={`devices[${idx}].isAppAnalytics`}
                                                        handleChange={(e) => {
                                                            if (!e) {
                                                                clearErrors(`devices[${idx}].appanalyticsetting`, '');
                                                            }
                                                        }}
                                                    />
                                                </Col>
                                            </Row>
                                        </div> */}
                                        {currentValue?.isAppAnalytics && (
                                            <div className="form-group mb0">
                                                <Row>
                                                    <Col sm={{ offset: 3, span: 9 }}>
                                                        <AppAnalyticsSetting
                                                            control={control}
                                                            currentIndex={idx}
                                                            fieldName={'devices'}
                                                            ddlData={ddlAnalysis}
                                                            dropdownFieldLoading={dropdownFieldLoading}
                                                        />
                                                    </Col>
                                                </Row>
                                            </div>
                                        )}
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                            <div className="rs-sl-add-icon position-absolute bottom5 right15 lh0">
                                {fields?.length - 1 === idx && fields?.length < 4 && (
                                    <RSTooltip text="Add mobile device" position="top">
                                        <div className={`${Object.keys(errors)?.length === 0 ? '' : 'pe-none click-off'
                                            }`}>
                                            <i
                                                className={`${circle_plus_fill_edge_medium
                                                    } icon-md color-primary-blue`}
                                                onClick={(e) => {
                                                    if (Object.keys(errors)?.length === 0) {
                                                        addPlatform(idx);
                                                    }
                                                }}
                                                id="rs_data_circle_plus_fill_edge"
                                            />
                                        </div>
                                    </RSTooltip>
                                )}
                            </div>
                        </Col>
                    </Row>
                );
            })}

            {/* Mobile FCM Guidelines Modal */}
            <RSModal
                show={showFCMGuidelinesModal}
                handleClose={() => setShowFCMGuidelinesModal(false)}
                header="FCM Guidelines"
                size="lg"
                body={
                    <MobileFCMGuidelines
                        show={showFCMGuidelinesModal}
                        onHide={() => setShowFCMGuidelinesModal(false)}
                        platformName={currentGuidelinesIndex !== null ? (watchLink[currentGuidelinesIndex]?.mobplatformName?.deviceName || '') : ''}
                    />
                }
            />
        </div>
    );
};

export default DeviceIntegration;
