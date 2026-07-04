import { SELECT_PROVIDER } from 'Constants/GlobalConstant/ValidationMessage';
import { BROADCAST_API, SELECT, TEMPLATE_API, USER_NAME } from 'Constants/GlobalConstant/Placeholders';
import { useCallback, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { isNumber as _isNumber } from 'Utils/modules/lodashReplacements';
import { useDispatch, useSelector } from 'react-redux';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSInput from 'Components/FormFields/RSInput';
import {
    getCSWACreateProviders,
    getLineDataById,
    saveLineData,
} from 'Reducers/preferences/CommunicationSettings/request';
import { getSessionId } from 'Reducers/globalState/selector';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';
import { CommunicationSettingsEditSkeletonGate } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';



const LINE = ({ create, handleCreateComponent }) => {
    const dispatch = useDispatch();
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
        (providersList, row) => {
            const tempServiceProvider = providersList?.filter(
                (item) => item?.serviceProviderId === row?.[0]?.serviceProviderId,
            );
            reset({
                serviceProviderId: tempServiceProvider?.[0],
                AuthorizationKey: row?.[0]?.authorizationKey,
                CallbackUrl: row?.[0]?.callbackUrl,
                clientLineId: row?.[0]?.clientLineId,
                PostUrl: row?.[0]?.postUrl,
            });
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
                    getCSWACreateProviders({ type: 'L', clientId, userId, departmentId }),
                );
                if (status && isEdit) {
                    const editRes = await dispatch(
                        getLineDataById({ clientId, userId, clientlineId: create, departmentId }),
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

    const handleSave = async (data) => {
        if (saveApi.isFetching) return;
        let payload = {
            clientId,
            departmentId,
            userId,
            clientLineId: isEdit ? data?.clientLineId : 0,
            postUrl: data.PostUrl,
            callbackUrl: data.CallbackUrl,
            authorizationKey: data.AuthorizationKey,
            serviceProviderId: data?.serviceProviderId?.serviceProviderId,
        };
        const res = await saveApi.refetch({
            fetcher: () => dispatch(saveLineData(payload, false)),
            loaderConfig: fieldLoaderConfig,
            mode: 'create',
        });
        const { status } = res || {};
        if (status) handleCreateComponent('save');
    };

    return (
        <CommunicationSettingsEditSkeletonGate isLoading={pageLoadApi.isFetching} isEditMode={isEdit}>
            <form onSubmit={handleSubmit(handleSave)}>
                <div className="rs-sub-heading">
                    <div className="rss-left">
                        <h4>Line settings</h4>
                    </div>
                </div>

                <Row>
                    <Col sm={6}>
                        <RSKendoDropDownList
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
                <Row className="mt50">
                    <Col sm={6}>
                        <RSInput
                            control={control}
                            name="PostUrl"
                            label={'Post URL'}
                            rules={{
                                required: TEMPLATE_API,
                            }}
                        />
                    </Col>
                    <Col sm={6}>
                        <RSInput
                            control={control}
                            name="CallbackUrl"
                            label={'Call back URL'}
                            rules={{
                                required: BROADCAST_API,
                            }}
                        />
                    </Col>
                </Row>
                <Row className="mt50">
                    <Col sm={6}>
                        <RSInput
                            control={control}
                            name="AuthorizationKey"
                            label={'AuthorizationKey'}
                            rules={{
                                required: USER_NAME,
                            }}
                        />
                    </Col>
                </Row>
                <Row className="float-end mt50">
                    <Col>
                        <RSSecondaryButton
                            blockInteraction={isSaveLoading}
                            onClick={() => {
                                if (isSaveLoading) return;
                                handleCreateComponent();
                            }}
                        >
                            Cancel
                        </RSSecondaryButton>
                        <RSPrimaryButton
                            type="submit"
                            isLoading={isSaveLoading}
                            blockBodyPointerEvents={isSaveLoading}
                        >
                            Save
                        </RSPrimaryButton>
                    </Col>
                </Row>
            </form>
        </CommunicationSettingsEditSkeletonGate>
    );
};

export default LINE;
