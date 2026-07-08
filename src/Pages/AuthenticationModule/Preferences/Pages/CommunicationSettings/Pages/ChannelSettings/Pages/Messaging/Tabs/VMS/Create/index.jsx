import { MAX_LENGTH15, MAX_LENGTH50 } from 'Constants/GlobalConstant/Regex';
import { SELECT_PROVIDER } from 'Constants/GlobalConstant/ValidationMessage';
import { BROADCAST_API, CANCEL, PASSWORD, SAVE, SELECT, TEMPLATE_API, USER_NAME, VOICE_MESSAGING_SERVICE } from 'Constants/GlobalConstant/Placeholders';
import { useCallback, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Col, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { isNumber as _isNumber } from 'Utils/modules/lodashReplacements';
import { updateQueryParams } from 'Utils/modules/urlQuery';
import { validateIsCustomNavigate } from 'Utils/modules/navigation';
import useQueryParams from 'Hooks/useQueryParams';

import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import RSInput from 'Components/FormFields/RSInput';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import {
    getCSWACreateProviders,
    getVMSDataById,
    saveVMSData,
} from 'Reducers/preferences/CommunicationSettings/request';
import { getSessionId } from 'Reducers/globalState/selector';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';
import { CommunicationSettingsEditSkeletonGate } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';



const ADD_VMS_COMM_QUERY_KEYS_TO_CLEAR = {
    backNavigationDetails: null,
    backAction: null,
    mode: null,
    from: null,
    campaignType: null,
};

const CMSCreate = ({ create, handleCreateComponent, addVmsFromComm }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const queryState = useQueryParams('/preferences/communication-settings');
    const isNavigatingBackToCommRef = useRef(false);
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const providers = useSelector((state) => state.communicationSettingsReducer?.settingsProviders ?? []);

    const { control, handleSubmit, reset } = useForm();

    const isEdit = _isNumber(create);
    const sessionReady = Boolean(clientId && userId != null && departmentId != null);
    const pageLoadApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const saveApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const isSaveLoading = saveApi.isFetching;
    const showFieldLoader = pageLoadApi.isLoading && !isEdit;

    const applyEditData = useCallback(
        (providersList, editData) => {
            const tempServiceProvider = providersList?.filter(
                (item) => item?.serviceProviderId === editData?.[0]?.serviceProviderId,
            );
            reset({ ...editData?.[0], serviceProviderId: tempServiceProvider?.[0] });
        },
        [reset],
    );

    const bootstrapPage = useCallback(() => {
        if (!sessionReady) {
            return undefined;
        }
        return pageLoadApi.refetch({
            fetcher: async () => {
                const { status, data } = await dispatch(
                    getCSWACreateProviders({ type: 'VMS', clientId, userId, departmentId }),
                );
                if (status && isEdit) {
                    const editRes = await dispatch(
                        getVMSDataById({ clientId, userId, vmsId: create, departmentId }),
                    );
                    if (editRes?.status) {
                        applyEditData(data, editRes.data);
                    }
                }
                return { status, data };
            },
            loaderConfig: fieldLoaderConfig,
            mode: isEdit ? 'edit' : 'create',
        });
    }, [
        sessionReady,
        clientId,
        userId,
        departmentId,
        isEdit,
        create,
        dispatch,
        pageLoadApi.refetch,
        applyEditData,
    ]);

    useEffect(() => {
        bootstrapPage();
    }, [bootstrapPage]);

    const handleReturn = () => {
        if (addVmsFromComm) {
            isNavigatingBackToCommRef.current = true;
            validateIsCustomNavigate(queryState, queryState, navigate, () => {
                handleCreateComponent();
            }, { dispatch });
            return;
        }
        handleCreateComponent();
    };

    useEffect(() => {
        return () => {
            if (addVmsFromComm && !isNavigatingBackToCommRef.current) {
                updateQueryParams(ADD_VMS_COMM_QUERY_KEYS_TO_CLEAR);
            }
        };
    }, [addVmsFromComm]);

    const handleSave = async (data) => {
        if (saveApi.isFetching) return;
        let payload = {
            ...data,
            clientId,
            departmentId,
            userId,
            vmsId: 0,
            serviceProviderId: data?.serviceProviderId?.serviceProviderId,
        };
        if (isEdit) payload['vmsId'] = create;
        const res = await saveApi.refetch({
            fetcher: () => dispatch(saveVMSData(payload, false)),
            loaderConfig: fieldLoaderConfig,
            mode: 'create',
        });
        const { status } = res || {};
        if (status) handleReturn();
    };

    return (
        <CommunicationSettingsEditSkeletonGate
            isLoading={pageLoadApi.isFetching}
            isEditMode={isEdit}
            formSkeletonVariant="boxed"
        >
            <form onSubmit={handleSubmit(handleSave)}>
                <div className="box-design bd-top-border mt5">
                    <h4>{VOICE_MESSAGING_SERVICE}</h4>
                    <div className="form-group">
                        <Row>
                            <Col sm={6}>
                                <RSKendoDropdown
                                    name="serviceProviderId"
                                    control={control}
                                    data={providers}
                                    textField="serviceProviderName"
                                    dataItemKey="serviceProviderId"
                                    label={SELECT}
                                    isLoading={showFieldLoader}
                                    rules={{
                                        required: SELECT_PROVIDER,
                                    }}
                                />
                            </Col>
                        </Row>
                    </div>
                    <div className="form-group">
                        <Row>
                            <Col sm={6}>
                                <RSInput
                                    control={control}
                                    name="templateapi"
                                    maxLength={MAX_LENGTH50}
                                    label={TEMPLATE_API}
                                    rules={{
                                        required: TEMPLATE_API,
                                    }}
                                />
                            </Col>

                            <Col sm={6}>
                                <RSInput
                                    control={control}
                                    name="broadcastapi"
                                    maxLength={MAX_LENGTH50}
                                    label={BROADCAST_API}
                                    rules={{
                                        required: BROADCAST_API,
                                    }}
                                />
                            </Col>
                        </Row>
                    </div>
                    <div className="form-group">
                        <Row>
                            <Col sm={6}>
                                <RSInput
                                    control={control}
                                    name="userName"
                                    maxLength={MAX_LENGTH50}
                                    label={USER_NAME}
                                    rules={{
                                        required: USER_NAME,
                                    }}
                                />
                            </Col>
                            <Col sm={6}>
                                <RSInput
                                    control={control}
                                    name="password"
                                    type={'password'}
                                    maxLength={MAX_LENGTH15}
                                    viewEye
                                    label={PASSWORD}
                                    rules={{
                                        required: PASSWORD,
                                    }}
                                />
                            </Col>
                        </Row>
                    </div>
                </div>
                <Row className="buttons-holder">
                    <Col>
                        <RSSecondaryButton
                            blockInteraction={isSaveLoading}
                            onClick={() => {
                                if (isSaveLoading) return;
                                handleReturn();
                            }}
                        >
                            {CANCEL}
                        </RSSecondaryButton>
                        <RSPrimaryButton
                            type="submit"
                            isLoading={isSaveLoading}
                            blockBodyPointerEvents={isSaveLoading}
                        >
                            {SAVE}
                        </RSPrimaryButton>
                    </Col>
                </Row>
            </form>
        </CommunicationSettingsEditSkeletonGate>
    );
};

export default CMSCreate;
