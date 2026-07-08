import { validateIsCustomNavigate } from 'Utils/modules/navigation';
import { updateQueryParams } from 'Utils/modules/urlQuery';
import { MAX_LENGTH50 } from 'Constants/GlobalConstant/Regex';
import { APP_NAME as APP_NAME_MSG, UPLOAD_FILE } from 'Constants/GlobalConstant/ValidationMessage';
import { APP_LOGO, APP_NAME, UPLOAD_145_LOGO } from 'Constants/GlobalConstant/Placeholders';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { Row, Col } from 'react-bootstrap';

import ListNameExists from 'Components/ListNameExists';
import DeviceIntegration from './Component/DeviceIntegration/DeviceIntegration';
import {
    getDomainMobilePushExist,
    UpsertMobilePushData,
    GetMobilePushDataById,
    getDeviceMobilePush,
    getLanguageMobilePush,
    getAnalysisMobilePush,
} from 'Reducers/preferences/CommunicationSettings/request';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { MOBILEAPP_ONBOARDING_INITIALSTATE } from './constant';
import { MOBILE_FORM_ACTIONS_PORTAL_ID } from '../../../constant';
import usePermission from 'Hooks/usePersmission';
import { getSessionId } from 'Reducers/globalState/selector';
import { useSelector, useDispatch, useStore } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import useApiLoader from 'Hooks/useApiLoader';
import useQueryParams from 'Hooks/useQueryParams';
import useOnlyDepChangeEffect from 'Hooks/useOnlyDepChangeEffect';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';
import { CommunicationSettingsEditSkeletonGate } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';
import RSFileUpload from 'Components/FormFields/RSFileUpload';
import IntegrationSuccessModal from '../../../../../Components/IntegrationSuccessModal';

const APP_NOTIFICATION_ONBOARDING_FORM_ID = 'rs_AppNotificationOnBoarding_Form';

const MOBILE_ADD_QUERY_KEYS_TO_CLEAR = {
    backNavigationDetails: null,
    backAction: null,
    mode: null,
    subfrom: null,
};

const AppNotificationOnBoarding = ({ type, handleCancel, config, setFailedApi }) => {
    const methods = useForm(MOBILEAPP_ONBOARDING_INITIALSTATE);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const queryState = useQueryParams('/preferences/communication-settings');
    const isNavigatingBackRef = useRef(false);
    const isAddFromExternalFlow =
        queryState?.mode === 'add' && queryState?.backNavigationDetails?.isCustomNavigate;
    const store = useStore();
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const sessionReady = Boolean(clientId && userId != null && departmentId != null);
    const pageLoadApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const saveApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const isSaveLoading = saveApi.isFetching;
    const showFieldLoader = pageLoadApi.isLoading && type !== 'edit';
    const { appDeviceList, appLanguageList, analyticsListMobile } = useSelector(
        ({ communicationSettingsReducer }) => communicationSettingsReducer,
    );
    const { control, handleSubmit, reset,setValue, watch,clearErrors, setError , formState: {errors}} = methods;
    const [HTTPFilePath, apnsFilePath, appLogo] = watch(['HTTPFilePath', 'apnsFilePath', 'appLogo']);
    const { permissions } = usePermission();
    const { addAccess } = permissions || {};
    const [Device, setDevice] = useState(appDeviceList);
    const [Analysis, setAnalysis] = useState(analyticsListMobile);
    const [Language, setLanguage] = useState(appLanguageList);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [appGuid, setAppGuid] = useState('');
    const [appData, setAppData] = useState({
        appGuid: '',
        pushNotifySettingId: 0
    });
    useOnlyDepChangeEffect(() => {
        setDevice(appDeviceList);
    }, [appDeviceList]);
    useOnlyDepChangeEffect(() => {
        setAnalysis(analyticsListMobile);
    }, [analyticsListMobile]);
    useOnlyDepChangeEffect(() => {
        setLanguage(appLanguageList);
    }, [appLanguageList]);

    const loadEditNotifyData = useCallback(async () => {
        const { appDeviceList: deviceList, appLanguageList: languageList, analyticsListMobile: analysisList } =
            store.getState().communicationSettingsReducer;
        const payload = { clientId, userId, departmentId, pushNotifySettingId: config?.pushNotifySettingId };
        const { status, data } = await dispatch(GetMobilePushDataById(payload));
        if (status) {
            const record = data ?? {};
            const deviceRows = record.device ?? record.Device ?? [];
            let tempAppDetails = deviceRows.map((item) => {
                const mobilePlatform = item?.mobilePlatform ?? item?.MobilePlatform ?? {};
                const notificationProviderRaw =
                    item?.notificationProvider ?? item?.NotificationProvider ?? {};
                const apnsRaw = notificationProviderRaw?.apns ?? notificationProviderRaw?.Apns ?? {};
                const v1Raw = notificationProviderRaw?.v1Http ?? notificationProviderRaw?.V1Http ?? {};
                const fcmRaw = notificationProviderRaw?.fcm ?? notificationProviderRaw?.Fcm ?? {};
                const appDeviceId = mobilePlatform?.appDeviceId ?? mobilePlatform?.AppDeviceId;
                let tempDeviceAction = deviceList?.filter(
                    (action) => parseInt(appDeviceId, 10) === action?.appDeviceId,
                );
                let tempLanguageAction = item?.isNative
                    ? 0
                    : languageList?.filter((action) => parseInt(item?.languageId, 10) === action?.languageId);

                let mobAnalyticsList = item.mobAnalytics ?? item.MobAnalytics ?? [];
                let tempAppAnalytics =
                    mobAnalyticsList?.length === 0
                        ? [{ analyticsID: '', accountMail: '', appKey: '', appSecretID: '', isActive: true }]
                        : mobAnalyticsList.map((res) => {
                              let tempAnalysisAction = analysisList?.filter(
                                  (action) => res?.analyticsDomainId === action?.analyticsDomainId,
                              );
                              return {
                                  analyticsID: tempAnalysisAction[0],
                                  appanalyticsId: res?.appanalyticsId,
                                  accountMail: res?.serviceAccountEmail,
                                  appKey: res?.appKey,
                                  appSecretID: res?.appSecretId,
                                  isActive: true,
                              };
                          });

                const apnsPathStored =
                    apnsRaw.filePath ??
                    apnsRaw.FilePath ??
                    apnsRaw.filepath ??
                    apnsRaw.Filepath ??
                    '';

                const apnsBundleId = String(
                    apnsRaw.bundleId ?? '',
                ).trim();

                const prodVal = apnsRaw.isProduction ?? apnsRaw.IsProduction;
                const isSandbox =
                    prodVal === false ||
                    prodVal === 'false' ||
                    prodVal === 0 ||
                    prodVal === '0';

                const rawNotifType =
                    notificationProviderRaw.notificationType ??
                    notificationProviderRaw.NotificationType ??
                    '';
                const notificationProviderVal =
                    rawNotifType === 'V1' || rawNotifType === 'v1'
                        ? 'FCM(V1HTTP)'
                        : typeof rawNotifType === 'string' && rawNotifType.toUpperCase() === 'APNS'
                          ? 'APNS'
                          : rawNotifType;

                return {
                    mobplatformName: tempDeviceAction[0],
                    appStoreUrl: mobilePlatform?.playStoreUrl ?? mobilePlatform?.PlayStoreUrl,
                    notificationProvider: notificationProviderVal,
                    fcmSenderId:
                        fcmRaw.fcmsenderId ?? fcmRaw.FcmsenderId ?? fcmRaw.fcmSenderId ?? fcmRaw.FcmSenderId,
                    fcmServerkey:
                        fcmRaw.fcmserverkey ??
                        fcmRaw.Fcmserverkey ??
                        fcmRaw.fcmServerKey ??
                        fcmRaw.FcmServerKey,

                    bundleId: apnsBundleId,
                    apnsTeamId: String(apnsRaw.teamId ?? apnsRaw.TeamId ?? '').trim(),
                    apnsKeyId: String(apnsRaw.keyId ?? apnsRaw.KeyId ?? '').trim(),
                    apnsEnvironment: isSandbox ? 'Sandbox' : 'Production',
                    apnsFilePath: apnsPathStored,
                    filepath: apnsPathStored,
                    jsonPath: v1Raw.jsonPath ?? v1Raw.JsonPath,
                    HTTPFilePath: v1Raw.jsonPath ?? v1Raw.JsonPath,
                    languageId: item?.isNative ? 'Native' : 'Hybrid',
                    languageType: tempLanguageAction[0], //'N'
                    isAppAnalytics: item?.isAppAnalytics,
                    isActive: true,
                    pushNotifyAppStoreID: item?.pushNotifyAppStoreID ?? item?.PushNotifyAppStoreID,
                    appanalyticsetting: tempAppAnalytics,
                    isNative: item?.isNative,
                };
            });
            const imagePath = record.imagePath ?? record.ImagePath ?? '';
            reset({
                appName: record.appName ?? record.AppName,
                devices: tempAppDetails,
                appLogo: imagePath,
                imageName: imagePath.split('/').pop(),
            });
        } else if (setFailedApi) {
            setFailedApi('GetMobilePushById');
        }
    }, [
        clientId,
        userId,
        departmentId,
        config?.pushNotifySettingId,
        dispatch,
        reset,
        setFailedApi,
        store,
    ]);

    const bootstrapPage = useCallback(() => {
        if (!sessionReady) {
            return undefined;
        }
        return pageLoadApi.refetch({
            fetcher: async () => {
                const payload = { clientId, userId, departmentId };
                const { appDeviceList: devices, appLanguageList: langs, analyticsListMobile: analysis } =
                    store.getState().communicationSettingsReducer;
                const promises = [];
                if (!devices?.length) {
                    promises.push(dispatch(getDeviceMobilePush(payload)));
                }
                if (!langs?.length) {
                    promises.push(dispatch(getLanguageMobilePush(payload)));
                }
                if (!analysis?.length) {
                    promises.push(dispatch(getAnalysisMobilePush(payload)));
                }
                if (promises.length) {
                    const results = await Promise.all(promises);
                    const hasFailed = results.some((res) => res?.status === false);
                    if (hasFailed && setFailedApi) {
                        setFailedApi('GetMobilePushById');
                    }
                }
                if (type === 'edit' && config?.pushNotifySettingId) {
                    await loadEditNotifyData();
                }
            },
            loaderConfig: fieldLoaderConfig,
            mode: type === 'edit' ? 'edit' : 'create',
        });
    }, [
        sessionReady,
        clientId,
        userId,
        departmentId,
        type,
        config?.pushNotifySettingId,
        dispatch,
        pageLoadApi.refetch,
        loadEditNotifyData,
        setFailedApi,
        store,
    ]);

    const bootstrapPageRef = useRef(bootstrapPage);
    bootstrapPageRef.current = bootstrapPage;

    useEffect(() => {
        if (!sessionReady) return undefined;
        bootstrapPageRef.current();
    }, [sessionReady, clientId, userId, departmentId, type, config?.pushNotifySettingId]);

    const handleFormSubmit = async (formState) => {
        if (isSaveLoading) return;
        let appDeviceData = formState?.devices?.map((res) => {
            let tempHTTPFilePath =
                typeof res?.HTTPFilePath === 'string' ?
                res.HTTPFilePath.includes('data:application/json;base64,')
                    ? res.HTTPFilePath.split('data:application/json;base64,')[1]
                    : res?.HTTPFilePath : '';
            const getApnsFileEncode = (apnsFilePath) => {
                if (!apnsFilePath || typeof apnsFilePath !== 'string') return '';
                if (apnsFilePath.includes('base64,')) {
                    return apnsFilePath.split('base64,').pop() || '';
                }
                return '';
            };
            const tempAPNSFileEncode = getApnsFileEncode(res?.apnsFilePath || '');
            return {
                pushNotifyAppStoreID: res?.pushNotifyAppStoreID,
                mobilePlatform: {
                    appDeviceId: res?.mobplatformName?.appDeviceId,
                    playStoreUrl: res?.appStoreUrl,
                },
                notificationProvider: {
                    notificationType: res?.notificationProvider === 'FCM(V1HTTP)' ? 'V1' : res?.notificationProvider,
                    fcm: {
                        fcmsenderId: res?.fcmSenderId || '',
                        fcmserverKey: res?.fcmServerkey || '',
                    },
                    v1Http: {
                        jsonPath: res?.jsonPath || '',
                        // jsonEncode:
                        //     res?.HTTPFilePath?.length > 0
                        //         ? res?.HTTPFilePath.split('data:application/json;base64,')[1]
                        //         : '',
                        jsonEncode: tempHTTPFilePath || '',
                    },
                    apns: {
                        bundleId:
                            res?.notificationProvider === 'APNS' ? (res?.bundleId || '').trim() : '',
                        teamId:
                            res?.notificationProvider === 'APNS' ? (res?.apnsTeamId || '').toUpperCase() : '',
                        keyId:
                            res?.notificationProvider === 'APNS' ? (res?.apnsKeyId || '').toUpperCase() : '',
                        filePath: res?.notificationProvider === 'APNS' ? res?.filepath || '' : '',
                        isProduction:
                            res?.notificationProvider === 'APNS' &&
                            res?.apnsEnvironment === 'Production',
                        ...(res?.notificationProvider === 'APNS'
                            ? { fileEncode: tempAPNSFileEncode || '' }
                            : {}),
                    },
                },
                languageId: res?.languageType?.languageId || 0,
                isNative: res?.languageId === 'Native' ? true : false,
                isAppAnalytics: res?.isAppAnalytics,
                mobAnalytics: res?.isAppAnalytics
                    ? res?.appanalyticsetting?.map((resdata) => ({
                          appanalyticsId: resdata?.appanalyticsId || 0,
                          analyticsDomainId: resdata?.analyticsID?.analyticsDomainId,
                          serviceAccountEmail: resdata?.accountMail,
                          appSecretId: resdata?.appSecretID,
                          appKey: resdata?.appKey,
                          isActive: resdata?.isActive,
                      }))
                    : [],
                isActive: res?.isActive,
            };
        });

        const payload = {
            clientId,
            userId,
            departmentId,
            pushNotifySettingId: type === 'edit' ? config?.pushNotifySettingId : 0,
            appName: formState?.appName,
            createdBy: userId,
            device: appDeviceData,
            imageName: formState?.imageName || '',
            imagePath: formState?.appLogo || ''
        };
        // console.log('payload: ', payload);
        const { status, data } = await saveApi.refetch({
            fetcher: () => dispatch(UpsertMobilePushData(payload, false)),
            loaderConfig: fieldLoaderConfig,
            mode: 'create',
        });

        if (status) {
            if(type === 'edit'){
                handleSuccessModalClose()
                //setShowSuccessModal(true);
                return
            }
            if(data?.appGuid?.length > 0){
                // setAppGuid(data?.appGuid);
                setAppData({
                    appGuid: data?.appGuid,
                    pushNotifySettingId: data?.pushNotifySettingId
                })
                setTimeout(() => {
                    setShowSuccessModal(true);
                },1000)
            }
           
        }
    };

    const handleReturn = () => {
        if (isAddFromExternalFlow) {
            isNavigatingBackRef.current = true;
            validateIsCustomNavigate(queryState, queryState, navigate, () => {
                handleCancel(true);
            }, { dispatch });
            return;
        }
        handleCancel(true);
    };

    // Handle success modal close
    const handleSuccessModalClose = () => {
        setShowSuccessModal(false);
        handleReturn();
    };

    const [actionsPortalTarget, setActionsPortalTarget] = useState(null);

    useEffect(() => {
        setActionsPortalTarget(document.getElementById(MOBILE_FORM_ACTIONS_PORTAL_ID));

        return () => {
            setActionsPortalTarget(null);
            if (isAddFromExternalFlow && !isNavigatingBackRef.current) {
                updateQueryParams(MOBILE_ADD_QUERY_KEYS_TO_CLEAR);
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
                id="rs_AppNotificationOnBoarding_Cancel"
            >
                Cancel
            </RSSecondaryButton>
            {addAccess && (
                <RSPrimaryButton
                    type="submit"
                    form={APP_NOTIFICATION_ONBOARDING_FORM_ID}
                    className={``}
                    id="rs_AppNotificationOnBoarding_Save"
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
                actionsPortalId={MOBILE_FORM_ACTIONS_PORTAL_ID}
            >
        <FormProvider {...methods}>
            <form id={APP_NOTIFICATION_ONBOARDING_FORM_ID} onSubmit={handleSubmit(handleFormSubmit)}>
                <>
                    {/* Content starts */}

                    <div className="rs-sub-heading">
                        <div className="rss-left">
                            <h4>Apps on boarding</h4>
                        </div>
                        <>
                            <div className='form-group'>
                            <Row>
                                <Col sm={3} className="text-right pr10">
                                    <label className="control-label-left">{APP_NAME}</label>
                                </Col>
                                <Col sm={8} className='pl24 pr80'>
                                      <ListNameExists
                                                name="appName"
                                                control={control}
                                                placeholder={APP_NAME}
                                                rules={{ required: APP_NAME_MSG }}
                                                customErrorMessage={APP_NAME_MSG}
                                                apiCallback={getDomainMobilePushExist}
                                                field="domainName"
                                                maxLength={MAX_LENGTH50}
                                                condition={(data) => {
                                                    const { status, message } = data;
                                                    if (status) return false;
                                                    else if (!status) return true;
                                                    else return false;
                                                }}
                                            />
                                         
                                            {/* 
                                    <RSInput
                                        name={'appName'}
                                        placeholder={APP_NAME}
                                        control={control}
                                        required
                                        maxLength={MAX_LENGTH50}
                                        rules={{ required: APP_NAME_MSG }}
                                    /> */}
                                      
                                </Col>
                                 </Row>
                                 </div>
                                 <div className='form-group'>
                                 <Row>
                                 <Col sm={3} className="text-right pr10">
                                    <label className="control-label-left">{APP_LOGO}</label>
                                </Col>
                                <Col sm={8} className="notification-upload pl24 pr80">
                                
                                <RSFileUpload
                                    control={control}
                                    name="appLogo"
                                    id="rs_PushWebCreate_Applogo"
                                    text="Upload"
                                    placeholder={
                                        appLogo && appLogo.type === 'required'
                                            ? 'Upload file'
                                            : type === 'edit'
                                            ? appLogo
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
                                    }}
                                />
                                <small>{UPLOAD_145_LOGO}</small>
                            </Col>
                            </Row>
                           
                            </div>
                            
                            {(showFieldLoader ||
                                (Device?.length > 0 && Analysis?.length > 0 && Language?.length > 0)) && (
                                <Row>
                                    <Col>
                                        <DeviceIntegration
                                            ddlDevice={Device}
                                            ddlLanguage={Language}
                                            ddlAnalysis={Analysis}
                                            dropdownFieldLoading={showFieldLoader}
                                        />
                                    </Col>
                                </Row>
                            )}
                        </>
                    </div>
                </>
            </form>

            {/* Success Modal */}
            <IntegrationSuccessModal
                show={showSuccessModal}
                settingsId={appData?.pushNotifySettingId}
                type="mobile"
                name={watch('appName')}
                appId={appData?.appGuid}
                deviceList={(watch('devices') || [])}
                onClose={handleSuccessModalClose}
            />
        </FormProvider>
            </CommunicationSettingsEditSkeletonGate>
            {formActions}
        </>
    );
};

export default AppNotificationOnBoarding;
