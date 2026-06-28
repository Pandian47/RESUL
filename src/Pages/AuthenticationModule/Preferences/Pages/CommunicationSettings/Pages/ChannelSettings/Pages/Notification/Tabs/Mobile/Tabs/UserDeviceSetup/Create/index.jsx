import { MAX_LENGTH250 } from 'Constants/GlobalConstant/Regex';
import { ENTER_DESCRIPTION, FRIENDLY_NAME, SELECT_APP_NAME, SELECT_USER } from 'Constants/GlobalConstant/ValidationMessage';
import { APP_NAME, CANCEL, DESCRIPTION, SAVE, SEND, SENT_SUCCESS, UPDATE, USER, USER_DEVICE_SETUP } from 'Constants/GlobalConstant/Placeholders';
import { restart_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { Row, Col } from 'react-bootstrap';

import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSTextarea from 'Components/FormFields/RSTextarea';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { MOBILE_USERDEVICE_FORM_INITIAL_STATE, MOBILE_FORM_ACTIONS_PORTAL_ID } from '../../../constant';
import RSInput from 'Components/FormFields/RSInput';
import usePermission from 'Hooks/usePersmission';
import RSTooltip from 'Components/RSTooltip';
import { CommunicationSettingsEditSkeletonGate } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';

import { useSelector, useDispatch } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import {
    mobilePush_UserDeviceMaster,
    mobilePush_UpsertUserDeviceSetup,
    mobilePush_GetUserDeviceSetupById,
    mobilePush_EncodeUserDevice,
} from 'Reducers/preferences/CommunicationSettings/request';


const USER_DEVICE_SETUP_FORM_ID = 'rs_UserDeviceSetupCreate_Form';
const UserDeviceSetupCreate = ({ type, handleCancel, config, setFailedApi }) => {
    const methods = useForm(MOBILE_USERDEVICE_FORM_INITIAL_STATE);
    const {
        control,
        handleSubmit,
        setValue,
        getValues,
        reset,
        formState: { isValid },
    } = methods;
    const [desc, setDesc] = useState(false);
    const [friendly, setFriendly] = useState(false);
    const { permissions } = usePermission();
    const [showSuccessMsg, setShowSuccessMsg] = useState(false);
    const { addAccess, updateAccess } = permissions || {};
    const dispatch = useDispatch();
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const [masterData, setMasterData] = useState({});

    const isEditMode = type === 'edit';
    const sessionReady = Boolean(clientId && userId != null && departmentId != null);
    const pageLoadApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const saveApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const isSaveLoading = saveApi.isFetching;
    const showFieldLoader = pageLoadApi.isLoading && !isEditMode;

    const applyEditForm = useCallback(
        (data, gridMaster) => {
            setFriendly(true);
            setDesc(true);
            const tempAppData = gridMaster?.appList?.filter(
                (action) => data?.pushNotifySettingId === action?.pushNotifySettingId,
            );
            const tempUserData = gridMaster?.userList?.filter((action) => data?.userMId === action?.userId);

            reset({
                appName: tempAppData?.[0],
                userName: tempUserData?.[0],
                description: data?.sendlink,
                friendlyName: data?.friendlyName,
                friendlyDesc: data?.description,
                userdeviceId: data?.userdeviceId,
            });
        },
        [reset],
    );

    const bootstrapPage = useCallback(() => {
        if (!sessionReady) {
            return undefined;
        }
        const payload = { clientId, userId, departmentId };

        return pageLoadApi.refetch({
            fetcher: async () => {
                const masterRes = await dispatch(mobilePush_UserDeviceMaster(payload));
                const master = masterRes?.status ? masterRes.data : {};
                setMasterData(master);

                if (isEditMode && config?.userdeviceId) {
                    const editRes = await dispatch(
                        mobilePush_GetUserDeviceSetupById({
                            ...payload,
                            userdeviceId: config.userdeviceId,
                        }),
                    );
                    if (editRes?.status) {
                        applyEditForm(editRes.data, master);
                    } else {
                        setFailedApi?.('GetUserDeviceSetupById');
                    }
                    return editRes;
                }

                return masterRes;
            },
            loaderConfig: fieldLoaderConfig,
            mode: isEditMode ? 'edit' : 'create',
        });
    }, [
        sessionReady,
        clientId,
        userId,
        departmentId,
        dispatch,
        isEditMode,
        config?.userdeviceId,
        applyEditForm,
        setFailedApi,
    ]);

    const bootstrapPageRef = useRef(bootstrapPage);
    bootstrapPageRef.current = bootstrapPage;

    useEffect(() => {
        if (!sessionReady) {
            return undefined;
        }
        bootstrapPageRef.current();
    }, [sessionReady, clientId, userId, departmentId, isEditMode, config?.userdeviceId]);

    const GenerateSMS = async (data, id) => {
        const res = await dispatch(
            mobilePush_EncodeUserDevice({
                clientId,
                userId,
                departmentId,
                userdeviceId: id?.pushNotifySettingId,
                username: data?.firstName,
            }),
        );
        if (res?.status) {
            setValue('description', res?.data);
            setDesc(true);
        } else {
            setValue('description', '');
            setDesc(false);
        }
    };

    const SendSMStoUserDevice = () => {
        setFriendly(true);
        setShowSuccessMsg(true);
        setTimeout(() => {
            setShowSuccessMsg(false);
        }, 1500);
    };

    const handleFormSubmit = async (formState) => {
        if (isSaveLoading) return;
        const payload = {
            clientId,
            userId,
            departmentId,
            userMId: formState?.userName?.userId,
            userdeviceId: type === 'edit' ? formState?.userdeviceId : 0,
            pushNotifySettingId: formState?.appName?.pushNotifySettingId,
            sendlink: formState?.description,
            friendlyName: formState?.friendlyName,
            description: formState?.friendlyDesc,
        };

        const { status } = await saveApi.refetch({
            fetcher: () => dispatch(mobilePush_UpsertUserDeviceSetup(payload, false)),
            loaderConfig: fieldLoaderConfig,
            mode: 'create',
        });

        if (status) {
            handleCancel(true);
        }
    };

    const [actionsPortalTarget, setActionsPortalTarget] = useState(null);

    useEffect(() => {
        setActionsPortalTarget(document.getElementById(MOBILE_FORM_ACTIONS_PORTAL_ID));

        return () => {
            setActionsPortalTarget(null);
        };
    }, []);

    const renderFormActions = () => (
        <div className="buttons-holder pref-cs-buttons-outside mt20">
            <RSSecondaryButton
                type="button"
                blockInteraction={isSaveLoading}
                onClick={() => {
                    if (isSaveLoading) return;
                    handleCancel(true);
                }}
                id="rs_UserDeviceSetupCreate_Cancel"
            >
                {CANCEL}
            </RSSecondaryButton>
            {((type === 'edit' && updateAccess) || addAccess) && (
                <RSPrimaryButton
                    type="submit"
                    form={USER_DEVICE_SETUP_FORM_ID}
                    disabledClass={`  ${isValid ? '' : 'pe-none click-off'}  ${!friendly ? 'pe-none click-off' : ''}`}
                    id="rs_UserDeviceSetupCreate_Save"
                    isLoading={isSaveLoading}
                    blockBodyPointerEvents
                >
                    {type === 'edit' ? UPDATE : SAVE}
                </RSPrimaryButton>
            )}
        </div>
    );

    const formActions = actionsPortalTarget ? createPortal(renderFormActions(), actionsPortalTarget) : null;

    return (
        <>
            <CommunicationSettingsEditSkeletonGate
                isLoading={pageLoadApi.isFetching}
                isEditMode={isEditMode}
                actionsPortalId={MOBILE_FORM_ACTIONS_PORTAL_ID}
            >
        <FormProvider {...methods}>
            <form id={USER_DEVICE_SETUP_FORM_ID} onSubmit={handleSubmit(handleFormSubmit)}>                <>
                    {/* Content starts */}
                    <div className="rs-sub-heading">
                        <div className="rss-left">
                            <h4>{USER_DEVICE_SETUP}</h4>
                        </div>
                    </div>
                    <div className="form-group">
                        <Row>
                            <Col sm={3} className="text-right">
                                <label className="control-label-left">
                                   {APP_NAME}
                                </label>
                            </Col>
                            <Col sm={{ span: 6, offset: 0 }} id="rs_UserDeviceSetupCreate_appName">
                                <RSKendoDropDownList
                                    name={'appName'}
                                    data={masterData?.appList}
                                    control={control}
                                    textField={'appName'}
                                    dataItemKey={'pushNotifySettingId'}
                                    label={APP_NAME}
                                    required
                                    isLoading={showFieldLoader}
                                    rules={{
                                        required: SELECT_APP_NAME,
                                    }}
                                />
                            </Col>
                        </Row>
                    </div>
                    <div className="form-group">
                        <Row>
                            <Col sm={3} className="text-right">
                                <label className="control-label-left">
                                     {USER}
                                </label>
                            </Col>
                            <Col sm={{ span: 6, offset: 0 }} id="rs_UserDeviceSetupCreate_userName">
                                <RSKendoDropDownList
                                    name={'userName'}
                                    data={masterData?.userList}
                                    control={control}
                                    textField={'firstName'}
                                    dataItemKey={'userId'}
                                    label={USER}
                                    required
                                    isLoading={showFieldLoader}
                                    rules={{
                                        required: SELECT_USER,
                                    }}
                                    handleChange={(data) => {
                                        GenerateSMS(data.value, getValues('appName'));
                                    }}
                                />
                            </Col>
                            {isValid && friendly && (
                                <Col sm={1} className='fg-icons-wrapper pl0'>
                                    <div className='fg-icons'>
                                    <RSTooltip text="Reset" position="top" className="lh0">
                                    <i className={`${restart_medium} icon-md color-primary-blue`} />
                                    </RSTooltip>
                                     </div>
                                </Col>
                            )}
                        </Row>
                    </div>
                    {desc && (
                        <>
                            <div className="form-group">
                                <Row>
                                    <Col sm={{ offset: 3, span: 6 }}>
                                        <RSTextarea
                                            control={control}
                                            className={'click-off'}
                                            name={'description'}
                                            row={3}
                                            placeholder={DESCRIPTION}
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={{ offset: 3, span: 6 }}>
                                        <div className="buttons-holder d-flex justify-content-end">
                                            {showSuccessMsg && (
                                                <p className="color-primary-green">
                                                    {SENT_SUCCESS}
                                                </p>
                                            )}
                                            <RSPrimaryButton
                                                disabledClass={`${isValid ? '' : 'pe-none click-off'
                                                    } ${!friendly ? '' : 'pe-none click-off'}`}
                                                className={`bg-primary-btn `}
                                                onClick={() => SendSMStoUserDevice()}
                                                id="rs_UserDeviceSetupCreate_Send"
                                            >
                                                {SEND}
                                            </RSPrimaryButton>

                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </>
                    )}
                    {friendly && (
                        <>
                            <div className="form-group">
                                <Row>
                                         <Col sm={3} className="text-right">
                                <label className="control-label-left">
                                    Friendly name
                                </label>
                            </Col>
                                    <Col sm={{ offset: 0, span: 6 }}>
                                        <RSInput
                                            placeholder={'Friendly name'}
                                            id="rs_UserDeviceSetupCreate_FriendlyName"
                                            required
                                            control={control}
                                            name="friendlyName"
                                            maxLength={MAX_LENGTH250}
                                            rules={{
                                                required: FRIENDLY_NAME,
                                            }}
                                        />
                                    </Col>
                                </Row>
                            </div>
                            <div className="form-group">
                                <Row>
                                    <Col sm={{ offset: 3, span: 6 }}>
                                        <RSTextarea
                                            placeholder={'Description'}
                                            required
                                            control={control}
                                            name="friendlyDesc"
                                            rules={{
                                                required: ENTER_DESCRIPTION,
                                            }}
                                        />
                                    </Col>
                                </Row>
                            </div>
                        </>
                    )}

                </>
            </form>
        </FormProvider>
            </CommunicationSettingsEditSkeletonGate>
            {formActions}
        </>
    );
};

export default UserDeviceSetupCreate;
