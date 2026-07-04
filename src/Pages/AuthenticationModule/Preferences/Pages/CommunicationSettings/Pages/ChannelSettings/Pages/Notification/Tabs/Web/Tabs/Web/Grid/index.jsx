import { encodeUrl, getUserDetails } from 'Utils/modules/crypto';
import { getUserCurrentFormat, momentIsValid } from 'Utils/modules/dateTime';
import { truncateTitle } from 'Utils/modules/displayCore';
import { csvlinkDownloadWithoutBaseUrl } from 'Utils/modules/download';
import { getEnvironment } from 'Utils/modules/environment';
import { useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import KendoGrid from 'Components/RSKendoGrid';
import RSTooltip from 'Components/RSTooltip';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';
import { Push_WebContext } from '../Context';
import usePermission from 'Hooks/usePersmission';
import { getSessionId } from 'Reducers/globalState/selector';
import {
    GetWebPush,
    DeleteWebPush,
    saveWebPushTenantData,
    downloadWebPushIntegrationDocument,
    downloadIntegrationFiles,
    updateWebPushDefault,
} from 'Reducers/preferences/CommunicationSettings/request';
import { updateCommunicationSettings } from 'Reducers/preferences/CommunicationSettings/reducer';

import { BootstrapDropdown } from 'Components/RSBootstrapDropDown';
import { circle_plus_fill_edge_large, pencil_edit_medium, goal_achieved_medium, crown_medium, circle_arrow_down_medium, circle_plus_fill_edge_medium, industry_healthcare_medium } from 'Constants/GlobalConstant/Glyphicons';
import { WEB_NOTIFICATIONS_SETTINGS, ADD, SELECT_DOMAIN_NAME, CREATED_BY, CREATE_DATE, ANALYTIC_PLATFORM, ACTIONS, EDIT, GOAL, PRIORITY } from 'Constants/GlobalConstant/Placeholders';

import RSConfirmationModal from 'Components/ConfirmationModal';
import RSModal from 'Components/RSModal';
import { CommunicationSettingsSmtpTableSkeleton } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';
import SDKHealthCheck from '../../../../../Components/SDKHealthCheck/SDKHealthCheck';

import IntegrationDocumentInfo from '../../../../../Components/IntegrationDocumentInfo';



const PushWebGrid = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const context = useContext(Push_WebContext);
    const { permissions } = usePermission();
    const { addAccess, updateAccess, deleteAccess } = permissions || {};

    const { licenseTypeId, roleId = 0 } = getUserDetails();
    const { clientId, userId, departmentId, departmentName } = useSelector(getSessionId);

    const [gridData, setGridData] = useState([]);
    const [initialPagination, setInitialPagination] = useState(false);
    const [sdkStatus, setSdkStatus] = useState(false);
    const [selectData, setSelectData] = useState(null);
    const [isDelete, setIsDelete] = useState({ show: false, data: {} });
    const [sdkModal, setSdkModal] = useState({ show: false, data: {} });
    const [priorityModal, setPriorityModal] = useState({ show: false, data: null });
    const [tenantId, setTenantId] = useState(null);
    const [isLoadingTenant, setIsLoadingTenant] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const listApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const priorityUpdateApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const isGridLoading = listApi.isFetching;
    const isPriorityUpdateLoading = priorityUpdateApi.isFetching;

    const env = getEnvironment();
    const urlBase = `sdk.resul.${env === 'TEAM' ? 'team' : 'io'}`;
    const options = useMemo(() => ['Settings', 'Download', 'Delete'], []);

    // Check if add button should be disabled
    const isAddDisabled = !addAccess || (departmentName?.toLowerCase() === 'all' && licenseTypeId === '3');

    const loadGrid = useCallback(() => {
        setInitialPagination(true);
        return listApi.refetch({
            fetcher: () => dispatch(GetWebPush({ clientId, userId, departmentId })),
            loaderConfig: fieldLoaderConfig,
            mode: 'create',
            onSuccess: (res) => {
                const { status, data } = res || {};
                const listData = status ? data : [];
                setGridData(listData);
                dispatch(updateCommunicationSettings({ field: 'webDomainCount', payload: listData.length }));
            },
        });
    }, [clientId, userId, departmentId, dispatch, listApi.refetch]);

    const loadGridRef = useRef(loadGrid);
    loadGridRef.current = loadGrid;

    useEffect(() => {
        loadGridRef.current();
    }, [departmentId, clientId, userId]);

    const getData = () => loadGridRef.current();

    // Handle delete action
    const handleDelete = useCallback(
        async (props) => {
            const { status } = await dispatch(
                DeleteWebPush({
                    clientId,
                    userId,
                    departmentId,
                    webnotifySettingId: props?.webNotifySettingId,
                    isActive: false,
                }),
            );

            if (status) getData();
            setIsDelete({ show: false, data: {} });
        },
        [dispatch, clientId, userId, departmentId, getData],
    );

    // Get tenant ID for SDK modal
    const getTenantId = useCallback(
        async (webnotifySettingId, dataItem) => {
            setIsLoadingTenant(true);
            const { status, tenantId: newTenantId } = await dispatch(
                saveWebPushTenantData({ clientId, userId, departmentId, webnotifySettingId }),
            );

            if (status) {
                setTenantId(newTenantId);
                setSdkModal({ show: true, data: dataItem });
            }
            setIsLoadingTenant(false);
        },
        [dispatch, clientId, userId, departmentId],
    );

    // Reset context for new/edit
    const resetContext = useCallback(
        (config) => {
            context.setGridCreate((prev) => ({ ...prev, showGrid: false, ...config }));
        },
        [context],
    );

    // Handle add button click
    const handleAddClick = useCallback(() => {
        if (isAddDisabled) return;

        resetContext({
            pushWebAction: {
                edit: { editState: [], isEdit: false },
                create: true,
                show: true,
            },
            pushWebGoalAction: {
                edit: { editState: [], isEdit: false },
                create: false,
                showGrid: false,
                show: false,
            },
        });
    }, [isAddDisabled, resetContext]);

    const emptyGridMessage = (
        <>
            Click
            <span
                className={`rs-nodata-icon-wrap position-relative bottom1 mx5 pt2${
                    isAddDisabled ? ' cursor-not-allowed' : ''
                }`}
            >
                <i
                    id="rs_data_circle_plus_fill_edge"
                    className={`icon-md color-primary-blue icon-hover-shadow-primary ${circle_plus_fill_edge_medium}${
                        isAddDisabled ? ' click-off' : ''
                    }`}
                    onClick={(event) => {
                        event.stopPropagation();
                        handleAddClick();
                    }}
                />
            </span>
            to configure your web notification settings.
        </>
    );

    // Handle edit button click
    const handleEditClick = useCallback(
        (dataItem) => {
            if (updateAccess) {
                resetContext({
                    pushWebAction: {
                        edit: { editState: dataItem, isEdit: true },
                        create: false,
                        show: true,
                    },
                    pushWebGoalAction: {
                        edit: { editState: [], isEdit: false },
                        create: false,
                        showGrid: false,
                        show: false,
                    },
                });
            }
        },
        [updateAccess, resetContext],
    );

    // Handle goal button click
    const handleGoalClick = useCallback(
        (dataItem) => {
            resetContext({
                pushWebAction: {
                    edit: { editState: dataItem, isEdit: false },
                    create: false,
                    show: false,
                },
                pushWebGoalAction: {
                    edit: { editState: [], isEdit: false },
                    create: false,
                    showGrid: true,
                    show: false,
                },
            });
        },
        [resetContext],
    );

    // Handle dropdown item selection
    const handleDropdownSelect = useCallback(
        async (item, dataItem) => {
            switch (item) {
                case 'Goal':
                    handleGoalClick(dataItem);
                    break;
                case 'Info':
                    if (!isLoadingTenant) {
                        getTenantId(dataItem?.webNotifySettingId, dataItem);
                    }
                    break;
                case 'Download':
                    if (isDownloading) break;
                    try {
                        setIsDownloading(true);
                        await dispatch(
                            downloadIntegrationFiles({
                                departmentId,
                                webnotifySettingId: dataItem?.webNotifySettingId,
                                domainName: dataItem?.domainName,
                                name: dataItem?.domainName,
                                framework: dataItem?.framework,
                            }),
                        );
                        setSdkModal({ show: true, data: dataItem });
                    } catch (e) {
                    } finally {
                        setIsDownloading(false);
                    }
                    break;
                case 'Settings':
                    navigate(
                        `/preferences/communication-settings/web-push-permissions?q=${encodeUrl({
                            id: dataItem?.webNotifySettingId,
                        })}`,
                        { state: { id: dataItem?.webNotifySettingId } },
                    );
                    break;
                case 'Delete':
                    setIsDelete({ show: true, data: dataItem });
                    break;
                default:
                    break;
            }
        },
        [handleGoalClick, getTenantId, isLoadingTenant, navigate, dispatch, departmentId, isDownloading],
    );

    // Handle SDK status click
    const handleSDKStatusClick = useCallback((dataItem) => {
        setSelectData(dataItem);
        setTimeout(() => setSdkStatus(true), 1);
    }, []);

    // Handle copy to clipboard
    const handleCopyScript = useCallback(() => {
        const scriptText = `<script fcm_service_path="/firebase-messaging-sw.js"
src="https://${urlBase}/handlers/${tenantId || clientId}.sdk" defer="defer">
</script>`;
        navigator.clipboard.writeText(scriptText);
    }, [urlBase, tenantId, clientId]);

    // Close SDK modal
    const closeSdkModal = useCallback(() => {
        setSdkModal({ show: false, data: {} });
        setIsLoadingTenant(false);
        setTenantId(null);
    }, []);

    // Handle download integration document
    const handleDownloadIntegrationDocument = useCallback(async () => {
        if (!sdkModal.data?.webNotifySettingId || isDownloading) return;

        setIsDownloading(true);
        try {
            const response = await dispatch(
                downloadWebPushIntegrationDocument({
                    clientId,
                    userId,
                    departmentId,
                    webnotifySettingId: sdkModal.data.webNotifySettingId,
                }),
            );

            if (response?.status) {
                // Check various possible response structures for the document URL
                const documentUrl =
                    response?.documentUrl ||
                    response?.url ||
                    response?.data?.documentUrl ||
                    response?.data?.url ||
                    response?.data?.data?.documentUrl ||
                    response?.data?.data?.url;

                if (documentUrl) {
                    csvlinkDownloadWithoutBaseUrl(documentUrl, 'integration-document.pdf');
                } else {
                }
            }
        } catch (error) {
        } finally {
            setIsDownloading(false);
        }
    }, [dispatch, clientId, userId, departmentId, sdkModal.data, isDownloading]);

    // Handle priority change confirmation
    const handleConfirmPriorityChange = useCallback(async () => {
        if (!priorityModal.data?.webNotifySettingId || isPriorityUpdateLoading) {
            if (!priorityModal.data?.webNotifySettingId) {
                setPriorityModal({ show: false, data: null });
            }
            return;
        }

        const { status } = await priorityUpdateApi.refetch({
            fetcher: () =>
                dispatch(
                    updateWebPushDefault(
                        {
                            clientId,
                            userId,
                            DepartmentId: departmentId,
                            WebNotifySettingID: priorityModal.data.webNotifySettingId,
                            IsDefault: !priorityModal.data.isDefault,
                        },
                        false,
                    ),
                ),
            loaderConfig: fieldLoaderConfig,
            mode: 'create',
        });

        if (status) {
            getData();
            setPriorityModal({ show: false, data: null });
        }
    }, [clientId, userId, departmentId, dispatch, getData, priorityModal.data, isPriorityUpdateLoading, priorityUpdateApi.refetch]);

    // Grid columns configuration
    const handleSetDefault = useCallback(
        (dataItem) => {
            if (!dataItem?.webNotifySettingId || isPriorityUpdateLoading) return;
            setPriorityModal({ show: true, data: dataItem });
        },
        [isPriorityUpdateLoading],
    );

    const columns = useMemo(
        () => [
            {
                field: 'domainName',
                title: SELECT_DOMAIN_NAME,
                filter: 'text',
                // cell: ({ dataItem }) => (
                //     <td>
                //         {dataItem?.domainName?.length > 15 ? (
                //             <RSTooltip text={dataItem?.domainName} position="top" className="d-inline-block">
                //                 <span className="m0">{truncateTitle(dataItem?.domainName, 15)}</span>
                //             </RSTooltip>
                //         ) : (
                //             <span className="m0">{dataItem?.domainName}</span>
                //         )}
                //     </td>
                // ),
            },
            {
                field: 'userName',
                title: CREATED_BY,
                filter: 'text',
                // cell: ({ dataItem }) => (
                //     <td>
                //         {dataItem?.userName?.length > 15 ? (
                //             <RSTooltip text={dataItem?.userName} position="top" className="d-inline-block">
                //                 <span className="m0">{truncateTitle(dataItem?.userName, 15)}</span>
                //             </RSTooltip>
                //         ) : (
                //             <span className="m0">{dataItem?.userName}</span>
                //         )}
                //     </td>
                // ),
            },
            {
                field: 'createdDate',
                title: CREATE_DATE,
                width: 240,
                filter: 'date',
                cell: ({ dataItem }) => (
                    <td>
                        {momentIsValid(dataItem?.createdDate) && (
                            <span className="rctcb-by-date">
                                {getUserCurrentFormat(dataItem?.createdDate)?.dateTimeFormat}
                            </span>
                        )}
                    </td>
                ),
            },
            {
                field: 'analyticsPlatform',
                title: ANALYTIC_PLATFORM,
                isTooltip: true,
                filter: 'text',
                cell: ({ dataItem }) => <td>{dataItem?.analyticsPlatform ?? 'NA'}</td>,
            },
            // {
            //     field: 'sdkStatus',
            //     title: SDK_STATUS,
            //     filter: 'text',
            //     cell: ({ dataItem }) => (
            //         <td onClick={() => handleSDKStatusClick(dataItem)}>
            //             {dataItem?.sdkStatus ?? 'NA'}
            //         </td>
            //     ),
            // },
            {
                field: 'action',
                title: ACTIONS,
                width: '250px',
                 sortable: false,
                cell: ({ dataItem }) => (
                    <td style={{ overflow: 'inherit' }}>
                        <ul
                            className={`rs-list-inline rli-space-15 grid-view-icons${
                                isPriorityUpdateLoading ? ' pe-none click-off' : ''
                            }`}
                        >
                            <li onClick={() => handleEditClick(dataItem)}>
                                <RSTooltip text={EDIT} position="top">
                                    <div className={!updateAccess ? 'pe-none click-off' : ''}>
                                        <i
                                            id="rs_data_pencil_edit"
                                            className={`${pencil_edit_medium} icon-md color-primary-blue`}
                                        />
                                    </div>
                                </RSTooltip>
                            </li>
                            <li>
                                <RSTooltip text={GOAL} position="top">
                                    <i
                                        onClick={() => handleGoalClick(dataItem)}
                                        className={`${goal_achieved_medium} icon-md color-primary-blue`}
                                    />
                                </RSTooltip>
                            </li>
                            <li>
                                <RSTooltip text={'Health check'} position="top">
                                    <i
                                        onClick={() => handleSDKStatusClick(dataItem)}
                                        id="rs_PushWebGrid_Health"
                                        className={`${industry_healthcare_medium} icon-md color-primary-blue`}
                                    />
                                </RSTooltip>
                            </li>
                            <li>
                                <RSTooltip text={PRIORITY} position="top">
                                    <div
                                        className={
                                            roleId !== 7 && !updateAccess
                                                ? 'pe-none click-off'
                                                : isPriorityUpdateLoading
                                                  ? 'pe-none click-off'
                                                  : ''
                                        }
                                    >
                                        <i
                                            onClick={() => handleSetDefault(dataItem)}
                                            id="rs_PushWebGrid_Crown"
                                            className={`${crown_medium} icon-md ${
                                                dataItem?.isDefault ? 'color-yellow-medium pe-none' : 'color-primary-blue'
                                            }`}
                                        />
                                    </div>
                                </RSTooltip>
                            </li>
                            <li>
                                <BootstrapDropdown
                                    data={options}
                                    showUpdate={false}
                                    disbleItems={deleteAccess ? [] : ['Delete']}
                                    defaultItem={
                                        <i
                                            id="rs_PushWebGrid_arrowdown"
                                            className={`${circle_arrow_down_medium} icon-md color-primary-blue`}
                                        />
                                    }
                                    className="no_caret"
                                    alignRight
                                    flatIcon
                                    onSelect={(item) => handleDropdownSelect(item, dataItem)}
                                />
                            </li>
                        </ul>
                    </td>
                ),
            },
        ],
        [handleEditClick, handleGoalClick, handleDropdownSelect, handleSetDefault, updateAccess, deleteAccess, options, isPriorityUpdateLoading, roleId],
    );

    return (
        <>
            {/* SDK Health Check */}
            {sdkStatus && (
                <SDKHealthCheck
                    show={sdkStatus}
                    type="web"
                    title="Web push"
                    data={selectData}
                    domainUrl={selectData?.sdkDomain || ''}
                    close={() => setSdkStatus(false)}
                />
            )}

            <div className="rs-sub-heading">
                <div className="align-items-center d-flex justify-content-between">
                    {/* <h4 className="mb0">{WEB_NOTIFICATIONS_SETTINGS}</h4>
                    <div className="d-flex align-items-center gap-3">
                        <Form.Check
                            type="switch"
                            id="stepper-view-toggle"
                            label="Stepper View"
                            checked={context?.useStepperView || false}
                            onChange={(e) => {
                                context?.setUseStepperView(e.target.checked);
                            }}
                            className="mb-0"
                        />
                        <RSTooltip position="top" text={ADD} className="lh0">
                            <i
                                onClick={() => {
                                    if (addAccess) {
                                        context.setGridCreate((prev) => ({
                                            ...prev,
                                            showGrid: false,
                                            pushWebAction: {
                                                edit: {
                                                    editState: [],
                                                    isEdit: false,
                                                },
                                                create: true,
                                                show: true,
                                            },
                                            pushWebGoalAction: {
                                                edit: {
                                                    editState: [],
                                                    isEdit: false,
                                                },
                                                create: false,
                                                showGrid: false,
                                                show: false,
                                            },
                                        }));
                                    }
                                }}
                                className={`icon-lg color-primary-blue icon-hover-shadow-primary ${circle_plus_fill_edge_large
                                    } ${!addAccess ? 'click-off' : ''} ${departmentName?.toLowerCase() === 'all' && licenseTypeId === '3' ? 'click-off' : ''
                                    }`}
                                id="rs_data_circle_plus_fill_edge"
                            ></i>
                        </RSTooltip>
                    </div> */}
                    <h4 className="mb0">{WEB_NOTIFICATIONS_SETTINGS}</h4>
                    <RSTooltip position="top" text={ADD} className="lh0">
                        <div className={` ${
                                isAddDisabled ? 'pe-none click-off' : ''
                            }`}>
                        <i
                            onClick={handleAddClick}
                            className={`icon-lg color-primary-blue icon-hover-shadow-primary ${circle_plus_fill_edge_large}`}
                            id="rs_data_circle_plus_fill_edge"
                        />
                        </div>
                    </RSTooltip>
                </div>
            </div>

            {isGridLoading ? (
                <CommunicationSettingsSmtpTableSkeleton />
            ) : (
                <div className="rs-grid-border-radius">
                    <KendoGrid
                        data={gridData}
                        settings={{ total: gridData.length }}
                        isFailure={!gridData.length}
                        noBoxShadow
                        isCustomBox
                        column={columns}
                        pagerChange={initialPagination}
                        setInitialPagination={setInitialPagination}
                        isLoading={false}
                        loading={false}
                        noDataText={emptyGridMessage}
                        noDataShowIcon={false}
                    />
                </div>
            )}

            <RSConfirmationModal
                show={isDelete.show}
                handleConfirm={(status) => status && deleteAccess && handleDelete(isDelete.data)}
                handleClose={() => setIsDelete({ show: false, data: {} })}
            />

            {priorityModal.show && (() => {
                const hasDefaultPriority = gridData?.some((item) => item?.isDefault);
                const headerText = hasDefaultPriority ? 'Change priority?' : 'Set priority?';
                const actionText = hasDefaultPriority ? 'change' : 'set';
                
                return (
                    <RSConfirmationModal
                        show={priorityModal.show}
                        header={headerText}
                        htmlContent={
                            <p className="text-center">
                                {`Are you sure you want to ${actionText} priority`}
                                <br />
                                {`to ${priorityModal.data?.domainName || ''}`}?
                            </p>
                        }
                        primaryButtonText="Confirm"
                        secondaryButtonText="Cancel"
                        handleConfirm={() => {
                            if (isPriorityUpdateLoading) return;
                            handleConfirmPriorityChange();
                        }}
                        handleClose={() => {
                            if (isPriorityUpdateLoading) return;
                            setPriorityModal({ show: false, data: null });
                        }}
                        isLoading={isPriorityUpdateLoading}
                        blockBodyPointerEvents
                    />
                );
            })()}

            <RSModal
                show={sdkModal.show}
                size="lg"
                header="Confirmation"
                handleClose={closeSdkModal}
                body={
                    <div>
                        {/* <div className="mb20">
                            <label className="font-weight-bold">One line SDK</label>
                        </div>
                        <div className="bg-green-600 border border-r7 p19 position-relative mb20">
                            <pre className="mb0">
                                {`<script fcm_service_path="/firebase-messaging-sw.js"
src="https://${urlBase}/handlers/${tenantId || clientId}.sdk" defer="defer">
</script>`}
                            </pre>
                            <RSTooltip position="top" text="Copy" className="lh0 position-absolute right10 top10">
                                <i
                                    className={`${copy_medium} icon-md color-primary-blue`}
                                    onClick={handleCopyScript}
                                />
                            </RSTooltip>
                        </div> */}
                        <IntegrationDocumentInfo
                            type={'web'}
                            settingsId={98}
                            isDownloading={isDownloading}
                            onDownloadClick={closeSdkModal}
                        />
                    </div>
                }
            />
        </>
    );
};

export default PushWebGrid;
