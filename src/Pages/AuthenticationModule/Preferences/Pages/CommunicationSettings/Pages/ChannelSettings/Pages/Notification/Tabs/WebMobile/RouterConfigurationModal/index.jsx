import { charNumUnderScore } from 'Utils/modules/inputValidators';
import { MAXL_LENGTH1024, MAX_LENGTH50, URLPATTERN } from 'Constants/GlobalConstant/Regex';
import { ACTIONS, ANDROID_APP_SCREEN, ANDROID_SUB_APP_SCREEN, CLOSE, DELETE, EDIT, ENTER_NEW_SUB_SCREEN, IOS_APP_SCREEN, ROUTER_CONFIGURATION, ROUTER_KEY, WEB_URL } from 'Constants/GlobalConstant/Placeholders';
import { close_mini, delete_medium, pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import RSModal from 'Components/RSModal';
import RSConfirmationModal from 'Components/ConfirmationModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { Col, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import RSInput from 'Components/FormFields/RSInput';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import { getScreenList, getSubScreenList } from 'Reducers/communication/createCommunication/smartlink/request';
import { getSessionId } from 'Reducers/globalState/selector';

import KendoGrid from 'Components/RSKendoGrid';
import RSTooltip from 'Components/RSTooltip';
import usePermission from 'Hooks/usePersmission.js';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig, NONE_LOADER_CONFIG as noLoaderConfig } from 'Hooks/loaderTypes';
import RSDropdownFooterBtn from 'Components/DropdownFooterBtn';

import {
    getDomainAppSettingsList,
    upsertDomainAppSettings,
    deleteDomainAppSettings,
} from 'Reducers/preferences/CommunicationSettings/request';

const INITIAL_STATE = {
    routerKey: '',
    webURL: '',
    appScreen: '',
    subAppScreen: '',
    IOSScreen: '',
    customAppScreen: false,
    customIOSScreen: false,
    IOSScreenNew: '',
    subappScreenNew: '',
    appScreenNew: '',
};

const RouterConfigurationModal = ({ show, onClose = () => {}, data = {} }) => {
    const dispatch = useDispatch();
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const [listData, setListData] = useState({
        appScreenList: [],
        subAppScreenList: [],
        iosScreenList: [],
    });
    const [gridData, setGridData] = useState([]);
    const [editConfig, setEditConfig] = useState({
        isEdit: false,
        data: {},
    });
    const [isDelete, setIsDelete] = useState({
        show: false,
        data: {},
    });

    const { permissions } = usePermission();
    const { updateAccess } = permissions || {};
    const screenListApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const subScreenApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const gridApi = useApiLoader({ autoFetch: false, loaderConfig: noLoaderConfig, mode: 'create' });
    const saveApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const deleteApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });

    const showScreenFieldLoader = screenListApi.isLoading;
    const showSubScreenFieldLoader = subScreenApi.isLoading;
    const isSaveLoading = saveApi.isFetching;
    const isDeleteLoading = deleteApi.isFetching;
    const isGridLoading = gridApi.isFetching;

    const { control, handleSubmit, reset, watch, setValue, unregister, clearErrors } = useForm({
        mode: 'onTouched',
        defaultValues: INITIAL_STATE,
    });

    const [customAppScreen, customIOSScreen] = watch(['customAppScreen', 'customIOSScreen']);

    const fetchScreenLists = useCallback(() => {
        if (!show || !clientId || !data?.appId) {
            return undefined;
        }

        return screenListApi.refetch({
            fetcher: async () => {
                const appTypes = [
                    { mobileType: 'Android phone', mobileplatformId: 'Android' },
                    { mobileType: 'iPhone', mobileplatformId: 'iOS' },
                ];

                const responses = await Promise.all(
                    appTypes.map((type) => {
                        const payload = {
                            clientId,
                            userId,
                            departmentId,
                            mobileAppId: data.appId,
                            mobileplatformId: type.mobileplatformId,
                            mobileType: type.mobileType,
                            isdeferdeeplinkchecked: 'Y',
                        };

                        return dispatch(getScreenList({ payload, loading: false }));
                    }),
                );

                setListData((prev) => ({
                    ...prev,
                    appScreenList: Array.isArray(responses[0]?.data?.screenList) ? responses[0].data.screenList : [],
                    iosScreenList: Array.isArray(responses[1]?.data?.screenList) ? responses[1].data.screenList : [],
                }));

                return responses;
            },
            loaderConfig: fieldLoaderConfig,
            mode: 'create',
        });
    }, [show, clientId, userId, departmentId, data?.appId, dispatch, screenListApi.refetch]);

    const fetchConfigurationGrid = useCallback(() => {
        if (!show || !clientId) {
            return undefined;
        }

        return gridApi.refetch({
            fetcher: () =>
                dispatch(
                    getDomainAppSettingsList({ clientId, userId, departmentId, appDomainMapID: data?.id || '' }, false),
                ),
            loaderConfig: noLoaderConfig,
            mode: 'create',
            onSuccess: (res) => {
                setGridData(Array.isArray(res?.data) ? res.data : []);
            },
            onError: () => {
                setGridData([]);
            },
        });
    }, [show, clientId, userId, departmentId, data?.id, dispatch, gridApi.refetch]);

    const fetchSubScreenList = useCallback(
        async (screenName) => {
            const payload = {
                mobileAppId: data?.appId,
                deviceType: 'Android',
                screenName,
                mobileType: 'Android phone',
            };

            const res = await subScreenApi.refetch({
                fetcher: () => dispatch(getSubScreenList({ payload, loading: false })),
                loaderConfig: fieldLoaderConfig,
                mode: 'create',
            });

            const subScreens = Array.isArray(res?.data?.subScreenList) ? res.data.subScreenList : [];
            setListData((prev) => ({
                ...prev,
                subAppScreenList: subScreens,
            }));

            return subScreens;
        },
        [data?.appId, dispatch, subScreenApi.refetch],
    );

    useEffect(() => {
        if (!show) {
            reset({ ...INITIAL_STATE });
            clearErrors();
            setEditConfig({ isEdit: false, data: {} });
            return undefined;
        }

        fetchScreenLists();
        fetchConfigurationGrid();

        return () => {
            screenListApi.reset();
            subScreenApi.reset();
            gridApi.reset();
        };
    }, [show, fetchScreenLists, fetchConfigurationGrid, screenListApi.reset, subScreenApi.reset, gridApi.reset, reset, clearErrors]);

    const onSubmit = async (formState) => {
        if (isSaveLoading) return;

        const payload = {
            id: editConfig?.isEdit ? editConfig?.data?.id : 0,
            appDomainMapID: data?.id,
            routerkey: formState?.routerKey || '',
            webURL: formState?.webURL || '',
            androidAppScreen: formState?.appScreen?.screenName || '',
            androidSubScreen: formState?.subAppScreen?.subScreenName || '',
            iOSAppScreen: formState?.IOSScreen?.screenName || '',
        };

        const res = await saveApi.refetch({
            fetcher: () => dispatch(upsertDomainAppSettings(payload, false)),
            loaderConfig: fieldLoaderConfig,
            mode: 'create',
        });

        if (res?.status) {
            fetchConfigurationGrid();
            handleCancel();
        }
    };

    const handleEdit = async (dataItem) => {
        let selectedAppScreen = listData.appScreenList?.find((item) => item?.screenName === dataItem?.androidAppScreen);

        let selectedSubScreen = listData.subAppScreenList?.find(
            (item) => item?.subScreenName === dataItem?.androidSubScreen,
        );

        let selectedIOSScreen = listData.iosScreenList?.find((item) => item?.screenName === dataItem?.iosAppScreen);

        if (!selectedSubScreen && dataItem?.androidSubScreen && selectedAppScreen) {
            const subScreens = await fetchSubScreenList(selectedAppScreen?.screenName);
            selectedSubScreen = subScreens.find((item) => item?.subScreenName === dataItem?.androidSubScreen);
        }

        const additionalKeys = {};
        if (!!dataItem?.androidAppScreen && !selectedAppScreen) {
            selectedAppScreen = { screenName: dataItem?.androidAppScreen, activityName: '' };
            additionalKeys.customAppScreen = true;
            additionalKeys.appScreenNew = dataItem?.androidAppScreen;
        }
        if (!!dataItem?.androidSubScreen && !selectedSubScreen) {
            selectedSubScreen = { subScreenName: dataItem?.androidSubScreen };
            additionalKeys.subappScreenNew = dataItem?.androidSubScreen;
        } else {
            additionalKeys.subappScreenNew = '';
        }
        if (!!dataItem?.iosAppScreen && !selectedIOSScreen) {
            selectedIOSScreen = { screenName: dataItem?.iosAppScreen, activityName: '' };
            additionalKeys.customIOSScreen = true;
            additionalKeys.IOSScreenNew = dataItem?.iosAppScreen;
        }

        reset({
            routerKey: dataItem?.routerKey || '',
            webURL: dataItem?.webURL || '',
            appScreen: selectedAppScreen || null,
            subAppScreen: selectedSubScreen || null,
            IOSScreen: selectedIOSScreen || null,
            ...additionalKeys,
        });
        clearErrors();
    };

    const handleCancel = () => {
        reset({ ...INITIAL_STATE });
        clearErrors();
        setEditConfig({
            isEdit: false,
            data: {},
        });
    };

    const handleEnterNewAndroidAppScreen = () => {
        setValue('appScreen', '');
        setValue('subAppScreen', '');
        setValue('subappScreenNew', '');
        setValue('customAppScreen', true);
        clearErrors(['appScreen', 'subAppScreen']);
    };

    const handleEnterNewIOSAppScreen = () => {
        setValue('IOSScreen', '');
        setValue('customIOSScreen', true);
        clearErrors('IOSScreen');
    };

    const handleEnterNewSubAppScreen = () => {
        const currentAppScreen = watch('appScreen');
        setValue('subAppScreen', '');
        setValue('subappScreenNew', '');
        clearErrors(['subAppScreen', 'subappScreenNew']);
        if (currentAppScreen?.screenName) {
            setValue('customAppScreen', true);
            setValue('appScreenNew', currentAppScreen.screenName);
            setValue('appScreen', currentAppScreen);
            clearErrors('appScreen');
        }
    };

    const handleDelete = async (dataItem) => {
        if (!dataItem?.id || isDeleteLoading) return;

        const payload = {
            id: dataItem.id,
            userId,
            clientId,
            departmentId,
        };
        const res = await deleteApi.refetch({
            fetcher: () => dispatch(deleteDomainAppSettings(payload, false)),
            loaderConfig: fieldLoaderConfig,
            mode: 'create',
        });

        if (res?.status) {
            fetchConfigurationGrid();
            setIsDelete({
                show: false,
                data: {},
            });
        }
    };

    return (
        <>
            <RSModal
                show={show}
                size="xlg"
                header={ROUTER_CONFIGURATION}
                handleClose={onClose}
                isCloseButton={true}
                body={
                    <>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="form-group">
                                <Row>
                                    <Col sm={4} className="position-relative pb20">
                                        <RSInput
                                            name="routerKey"
                                            control={control}
                                            placeholder={ROUTER_KEY}
                                            required={true}
                                            rules={{ required: 'Enter Router key' }}
                                            handleOnBlur={(e) => {}}
                                            onKeyDown={charNumUnderScore}
                                            maxLength={MAX_LENGTH50}
                                            showTypeCount
                                        />
                                    </Col>
                                    <Col sm={8} className="position-relative pb20">
                                        <RSInput
                                            name="webURL"
                                            control={control}
                                            placeholder={WEB_URL}
                                            required={true}
                                            rules={{
                                                required: 'Enter a URL',
                                                pattern: {
                                                    value: URLPATTERN,
                                                    message: 'Enter valid URL',
                                                },
                                            }}
                                            maxLength={MAXL_LENGTH1024}
                                            showTypeCount
                                        />
                                    </Col>
                                </Row>
                            </div>

                            <div className="form-group mb30">
                                <Row>
                                    {customAppScreen ? (
                                        <>
                                            <Col sm={4} className={'position-relative'}>
                                                <RSInput
                                                    control={control}
                                                    name={`appScreenNew`}
                                                    placeholder={'New app screen'}
                                                    required
                                                    rules={{
                                                        required: 'Enter new app screen',
                                                    }}
                                                    handleOnBlur={(e) => {
                                                        let temp = {
                                                            activityName: 0,
                                                            screenName: e.target.value,
                                                        };
                                                        setValue(`appScreen`, temp);
                                                    }}
                                                    
                                                />

                                                <RSTooltip
                                                    position="top"
                                                    text={CLOSE}
                                                    className="lh0 position-absolute top7 right16 zIndex2"
                                                >
                                                    <i
                                                        className={`${close_mini} color-primary-red icon-xs`}
                                                        id="rs_GenerateSmartLink_close"
                                                        onClick={() => {
                                                            setValue('subAppScreen', '');
                                                            setValue('subappScreenNew', '');
                                                            setValue('customAppScreen', false);
                                                            setValue('appScreen', '');
                                                            unregister('appScreenNew');
                                                            clearErrors([
                                                                'appScreenNew',
                                                                'appScreen',
                                                                'subAppScreen',
                                                                'subappScreenNew',
                                                            ]);
                                                        }}
                                                    ></i>
                                                </RSTooltip>
                                            </Col>
                                            <Col sm={4}>
                                                <RSInput
                                                    control={control}
                                                    name={`subappScreenNew`}
                                                    placeholder={ENTER_NEW_SUB_SCREEN}
                                                    handleOnBlur={(e) => {
                                                        let temp = {
                                                            subScreenName: e.target.value,
                                                        };
                                                        setValue(`subAppScreen`, temp);
                                                    }}
                                                />
                                            </Col>
                                        </>
                                    ) : (
                                        <>
                                            <Col sm={4}>
                                                <RSKendoDropdown
                                                    data={listData?.appScreenList}
                                                    textField={'screenName'}
                                                    name="appScreen"
                                                    required
                                                    rules={{
                                                        required: 'Select android app screen',
                                                    }}
                                                    label={ANDROID_APP_SCREEN}
                                                    control={control}
                                                    isLoading={showScreenFieldLoader}
                                                    footer={
                                                        <RSDropdownFooterBtn
                                                            title="New app screen"
                                                            handleClick={handleEnterNewAndroidAppScreen}
                                                        />
                                                    }
                                                    handleChange={async (e) => {
                                                        setValue('subAppScreen', '');
                                                        setValue('subappScreenNew', '');
                                                        clearErrors(['subAppScreen', 'subappScreenNew']);
                                                        if (e?.value?.screenName) {
                                                            clearErrors('appScreen');
                                                            await fetchSubScreenList(e.value.screenName);
                                                        }
                                                    }}
                                                />
                                            </Col>
                                            <Col sm={4}>
                                                <RSKendoDropdown
                                                    data={listData?.subAppScreenList}
                                                    textField={'subScreenName'}
                                                    name="subAppScreen"
                                                    label={ANDROID_SUB_APP_SCREEN}
                                                    control={control}
                                                    isLoading={showSubScreenFieldLoader}
                                                    footer={
                                                        <RSDropdownFooterBtn
                                                            title={ENTER_NEW_SUB_SCREEN}
                                                            handleClick={handleEnterNewSubAppScreen}
                                                        />
                                                    }
                                                />
                                            </Col>
                                        </>
                                    )}

                                    {customIOSScreen ? (
                                        <>
                                            <Col sm={4}>
                                                <RSInput
                                                    control={control}
                                                    name={`IOSScreenNew`}
                                                    placeholder={ENTER_NEW_SUB_SCREEN}
                                                    handleOnBlur={(e) => {
                                                        let temp = {
                                                            screenName: e.target.value,
                                                            activityName: '',
                                                        };
                                                        setValue(`IOSScreen`, temp);
                                                    }}
                                                    required
                                                    rules={{
                                                        required: 'Enter new app screen',
                                                    }}
                                                />
                                            </Col>
                                        </>
                                    ) : (
                                        <>
                                            <Col sm={4}>
                                                <RSKendoDropdown
                                                    data={listData?.iosScreenList}
                                                    textField={'screenName'}
                                                    name="IOSScreen"
                                                    required
                                                    label={IOS_APP_SCREEN}
                                                    control={control}
                                                    isLoading={showScreenFieldLoader}
                                                    footer={
                                                        <RSDropdownFooterBtn
                                                            title="New app screen"
                                                            handleClick={handleEnterNewIOSAppScreen}
                                                        />
                                                    }
                                                    rules={{
                                                        required: 'Select IOS app screen',
                                                    }}
                                                />
                                            </Col>
                                        </>
                                    )}
                                </Row>
                            </div>
                            <div className="text-end">
                                <div className="buttons-holder">
                                    {editConfig?.isEdit && (
                                        <RSSecondaryButton onClick={handleCancel} blockInteraction={isSaveLoading}>
                                            {'Cancel'}
                                        </RSSecondaryButton>
                                    )}
                                    <RSPrimaryButton type="submit" isLoading={isSaveLoading} blockBodyPointerEvents>
                                        {editConfig?.isEdit ? 'Update' : 'Add'}
                                    </RSPrimaryButton>
                                </div>
                            </div>

                            <Row className="mt30">
                                <KendoGrid
                                    data={gridData}
                                    settings={{
                                        total: gridData?.length || 0,
                                    }}
                                    pageable={true}
                                    isFailure={!gridData?.length && !isGridLoading}
                                    isLoading={isGridLoading}
                                    skeletonColumns={6}
                                    skeletonRows={5}
                                    isCustomBox
                                    isScrollTop={false}
                                    scrollable={true}
                                    pagable={true}
                                    column={[
                                        {
                                            field: 'routerKey',
                                            title: ROUTER_KEY,
                                            width: 150,
                                        },
                                        {
                                            field: 'webURL',
                                            title: WEB_URL,
                                            width: 250,
                                        },
                                        {
                                            field: 'androidAppScreen',
                                            title: ANDROID_APP_SCREEN,
                                        },
                                        {
                                            field: 'androidSubScreen',
                                            title: ANDROID_SUB_APP_SCREEN,
                                        },
                                        {
                                            field: 'iosAppScreen',
                                            title: IOS_APP_SCREEN,
                                        },

                                        {
                                            field: 'action',
                                            title: ACTIONS,
                                            width: 120,
                                            cell: (props) => {
                                                const isRowBeingEdited =
                                                    editConfig?.isEdit &&
                                                    editConfig?.data?.id === props?.dataItem?.id;
                                                const isRowDeleteBlocked =
                                                    isRowBeingEdited || isDeleteLoading;

                                                return (
                                                    <td>
                                                        <ul className="rs-list-inline rli-space-15 grid-view-icons">
                                                            <li>
                                                                <RSTooltip
                                                                    text={EDIT}
                                                                    position="top"
                                                                    innerContent={false}
                                                                    tooltipOverlayClass={'toolTipOverlayZindexCSS'}
                                                                >
                                                                    <div
                                                                        className={`${!updateAccess ? 'pe-none click-off' : ''}`}
                                                                    >
                                                                        <i
                                                                            onClick={() => {
                                                                                if (updateAccess) {
                                                                                    setEditConfig({
                                                                                        isEdit: true,
                                                                                        data: props?.dataItem,
                                                                                    });
                                                                                    handleEdit({
                                                                                        ...props?.dataItem,
                                                                                        isEdit: true,
                                                                                    });
                                                                                }
                                                                            }}
                                                                            className={`${pencil_edit_medium} icon-md color-primary-blue`}
                                                                            id="rs_data_pencil_edit"
                                                                        ></i>
                                                                    </div>
                                                                </RSTooltip>
                                                            </li>

                                                            <li
                                                                className={
                                                                    isRowDeleteBlocked ? 'pe-none click-off' : ''
                                                                }
                                                            >
                                                                <RSTooltip
                                                                    text={DELETE}
                                                                    position="top"
                                                                    innerContent={false}
                                                                    tooltipOverlayClass={'toolTipOverlayZindexCSS'}
                                                                >
                                                                    <i
                                                                        onClick={() => {
                                                                            if (isRowDeleteBlocked) return;
                                                                            setIsDelete({
                                                                                show: true,
                                                                                data: props?.dataItem,
                                                                            });
                                                                        }}
                                                                        className={`${delete_medium} icon-md color-primary-red `}
                                                                        id="rs_data_delete"
                                                                    ></i>
                                                                </RSTooltip>
                                                            </li>
                                                        </ul>
                                                    </td>
                                                );
                                            },
                                        },
                                    ]}
                                />
                            </Row>
                        </form>
                    </>
                }
            />
            <RSConfirmationModal
                show={isDelete?.show}
                handleConfirm={(status) => {
                    if (isDeleteLoading) return;
                    if (status) {
                        handleDelete(isDelete?.data);
                    }
                }}
                handleClose={() => {
                    if (isDeleteLoading) return;
                    setIsDelete({
                        show: false,
                        data: {},
                    });
                }}
                isLoading={isDeleteLoading}
                blockBodyPointerEvents
            />
        </>
    );
};

export default RouterConfigurationModal;
