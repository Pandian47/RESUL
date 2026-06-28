import { useEffect, useCallback, useMemo, useState, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { process } from '@progress/kendo-data-query';
import ResGrid from 'Pages/KendoDocs/CommonComponents/ResGrid';
import {
    circle_plus_fill_edge_large,
    circle_plus_fill_edge_medium,
} from 'Constants/GlobalConstant/Glyphicons';
import { MOBILEPUSH_APPLIST_INITIALSTATE, GridDetailComponent } from './constant';
import { MOBILE_NOTIFICATION_SETTINGS, ADD } from 'Constants/GlobalConstant/Placeholders';
import { PushMobileContext } from '../context';
import RSTooltip from 'Components/RSTooltip';
import usePermission from 'Hooks/usePersmission';
import { getSessionId } from 'Reducers/globalState/selector';
import {
    GetMobilePush,
    saveWebPushTenantData,
    downloadIntegrationFiles,
} from 'Reducers/preferences/CommunicationSettings/request';
import SDKHealthCheck from '../../../../../Components/SDKHealthCheck/SDKHealthCheck';
import RSModal from 'Components/RSModal';
import AppListRowCell from './Component/AppListRowCell/AppListRowCell';
import IntegrationDocumentInfo from '../../../../../Components/IntegrationDocumentInfo';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';

const AppNotificationGrid = () => {
    const context = useContext(PushMobileContext);
    const dispatch = useDispatch();
    const { clientId, userId, departmentId } = useSelector(getSessionId);
    const { permissions } = usePermission();
    const { addAccess } = permissions || {};

    const [data, setData] = useState([]);
    const [gridDataState, setGridDataState] = useState(MOBILEPUSH_APPLIST_INITIALSTATE.dataState);
    const [sdkStatus, setSdkStatus] = useState(false);
    const [selectData, setSelectData] = useState(null);
    const [credentialsModal, setCredentialsModal] = useState({ show: false, data: {} });
    const [isDownloading, setIsDownloading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const getData = useCallback(async () => {
        setIsLoading(true);
        const { status, data: responseData } = await dispatch(GetMobilePush({ clientId, userId, departmentId }));

        setGridDataState((prev) => ({
            ...prev,
            skip: 0,
            take: 5,
        }));

        setData(status ? responseData : []);
        setIsLoading(false);
    }, [dispatch, clientId, userId, departmentId]);

    const getTenantId = useCallback(
        async (pushNotifySettingId, dataItem) => {
            const { status } = await dispatch(
                saveWebPushTenantData({
                    clientId,
                    userId,
                    departmentId,
                    webnotifySettingId: pushNotifySettingId,
                }),
            );

            if (status) {
                setCredentialsModal({ show: true, data: dataItem });
            }

            return { status };
        },
        [clientId, userId, departmentId, dispatch],
    );

    const dataStateChange = useCallback((event) => {
        setGridDataState(event.dataState);
    }, []);

    const expandChange = useCallback((event) => {
        setData((prevData) =>
            prevData.map((item) => ({
                ...item,
                expanded: item.appId === event.dataItem?.appId ? !event.dataItem?.expanded : item.expanded,
            })),
        );
    }, []);

    const healthCheckData = useCallback((value) => {
        setSelectData(value);
        setSdkStatus(true);
    }, []);

    const handleCloseCredentialsModal = useCallback(() => {
        setCredentialsModal({ show: false, data: {} });
    }, []);

    const handleAddClick = useCallback(() => {
        if (addAccess) {
            context.setGridCreate((prev) => ({
                ...prev,
                showGrid: false,
                pushMobileAction: {
                    edit: { editState: [], isEdit: false },
                    create: true,
                    show: true,
                },
                pushMobileGoalAction: {
                    edit: { editState: [], isEdit: false },
                    create: false,
                    showGrid: false,
                    show: false,
                },
            }));
        }
    }, [addAccess, context]);

    useEffect(() => {
        getData();
    }, [getData]);

    const processedList = useMemo(
        () => process(data, gridDataState),
        [data, gridDataState],
    );

    const handleDownloadAndShowModal = useCallback(
        async (dataItem) => {
            if (isDownloading) return;
            setIsDownloading(true);
            let deviceList = [''];
            if (dataItem?.device?.length > 0) {
                deviceList = dataItem?.device?.map((device) =>
                    device?.language?.length > 0 ? device?.language : 'Native',
                );
            } else {
                deviceList = ['Native'];
            }
            try {
                await dispatch(
                    downloadIntegrationFiles({
                        departmentId,
                        pushNotifySettingId: dataItem?.pushNotifySettingId,
                        name: dataItem?.appName,
                        appId: dataItem?.appId,
                        deviceList: deviceList,
                    }),
                );
                setCredentialsModal({ show: true, data: dataItem });
            } catch (e) {
            } finally {
                setIsDownloading(false);
            }
        },
        [dispatch, departmentId, isDownloading],
    );

    const AddButton = useMemo(
        () => (
            <RSTooltip position="top" text={ADD} className="lh0">
                <i
                    onClick={handleAddClick}
                    className={`icon-lg color-primary-blue icon-hover-shadow-primary ${circle_plus_fill_edge_large} ${
                        !addAccess ? 'click-off' : ''
                    }`}
                    id="rs_data_circle_plus_fill_edge"
                />
            </RSTooltip>
        ),
        [handleAddClick, addAccess],
    );

    const EmptyStateMessage = useMemo(
        () => (
            <>
                Click
                <i
                    onClick={handleAddClick}
                    className={`icon-md color-primary-blue icon-hover-shadow-primary ${circle_plus_fill_edge_medium} ${
                        !addAccess ? 'click-off' : ''
                    } mx5`}
                    id="rs_data_circle_plus_fill_edge"
                />
                to configure your mobile app notification settings.
            </>
        ),
        [handleAddClick, addAccess],
    );

    const emptyContent = useMemo(
        () => <NoDataAvailableRender message={EmptyStateMessage} isShowIcon={false} />,
        [EmptyStateMessage],
    );

    const listColumns = useMemo(
        () => [
            {
                cell: (props) => (
                    <AppListRowCell
                        {...props}
                        getData={getData}
                        healthCheckData={healthCheckData}
                        getTenantId={getTenantId}
                        onDownloadIntegration={handleDownloadAndShowModal}
                        fullGridData={data}
                    />
                ),
            },
        ],
        [getData, healthCheckData, getTenantId, handleDownloadAndShowModal, data],
    );

    return (
        <>
            {sdkStatus && (
                <SDKHealthCheck
                    show={sdkStatus}
                    type="mobile"
                    title="Mobile push"
                    data={selectData}
                    domainUrl=""
                    appId={selectData?.appId}
                    close={() => setSdkStatus(false)}
                />
            )}

            <div className="rs-sub-heading">
                <div className="align-items-center d-flex justify-content-between">
                    <h4 className="mb0">{MOBILE_NOTIFICATION_SETTINGS}</h4>
                    {AddButton}
                </div>
            </div>

            <ResGrid
                layout="list"
                listPreset="app"
                listConfig={{ rowGap: 21, detailOverlap: 22, wrapperPlatformClass: 'rs-grid-listing rsgdv-plain' }}
                skeletonVariant="app"
                skeletonRows={5}
                loading={isLoading}
                data={processedList.data}
                columns={listColumns}
                dataItemKey="appId"
                detail={(props) =>
                    GridDetailComponent(props, false, getData, (dataItem) => expandChange({ dataItem }))
                }
                expandField="expanded"
                onExpandChange={expandChange}
                sortable
                pageable={data.length > 5 ? MOBILEPUSH_APPLIST_INITIALSTATE.PAGERSETTINGS : false}
                scrollable="none"
                dataState={gridDataState}
                onDataStateChange={dataStateChange}
                total={data.length}
                isServerSide
                emptyContent={emptyContent}
                emptyShowIcon={false}
                // wrapperClassName={!isLoading && data.length > 0 ? 'mt-21' : ''}
            />

            <RSModal
                show={credentialsModal.show}
                size="lg"
                header="Confirmation"
                handleClose={handleCloseCredentialsModal}
                body={
                    <div>
                        <IntegrationDocumentInfo
                            type={'mobile'}
                            isDownloading={isDownloading}
                            onDownloadClick={handleCloseCredentialsModal}
                        />
                    </div>
                }
            />
        </>
    );
};

export default AppNotificationGrid;
