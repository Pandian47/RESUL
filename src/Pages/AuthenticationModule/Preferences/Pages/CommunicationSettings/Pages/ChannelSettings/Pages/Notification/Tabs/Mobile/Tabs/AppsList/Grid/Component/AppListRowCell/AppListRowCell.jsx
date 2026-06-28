import { encodeUrl, getUserDetails } from 'Utils/modules/crypto';
import { getUserCurrentFormat } from 'Utils/modules/dateTime';

import { EDIT, PRIORITY, SETTING } from 'Constants/GlobalConstant/Placeholders';
import { circle_arrow_down_medium, crown_medium, delete_medium, download_medium, eye_medium, goal_achieved_medium, industry_healthcare_medium, pencil_edit_medium, settings_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useContext, useMemo, useState } from 'react';
import RSTooltip from 'Components/RSTooltip';

import { PushMobileContext } from '../../../context';
import { useNavigate } from 'react-router-dom';
import { BootstrapDropdown } from 'Components/RSBootstrapDropDown';
import usePermission from 'Hooks/usePersmission';
import { deleteMobileAppList, updateMobilePushDefault } from 'Reducers/preferences/CommunicationSettings/request';
import { getSessionId } from 'Reducers/globalState/selector';


import { useSelector, useDispatch } from 'react-redux';
import RSConfirmationModal from 'Components/ConfirmationModal';

import TruncateCell from 'Components/RSKendoGrid/TruncateCell';
import { GRID_TOOLTIP_PROPS } from 'Pages/KendoDocs/CommonComponents/ResGrid/config';

const AppListRowCell = (props) => {
    const { getData, getTenantId, isLoadingTenant, onToggleExpand } = props;

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { roleId = 0 } = getUserDetails();
    const [isDelete, setIsDelete] = useState({
        show: false,
        data: {},
    });
    const [priorityModal, setPriorityModal] = useState({ show: false, data: null });
    const [sdkStatus, setSdkStatus] = useState(false);
    const [selectData, setSelectData] = useState(null);
    let dataItem = props.dataItem;

    const context = useContext(PushMobileContext);
    const { permissions } = usePermission();
    const { updateAccess, deleteAccess } = permissions || {};
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));

    const actionMenuItems = useMemo(() => ['Info', 'Download', 'Goal', 'Delete'], []);
    const actionMenuDisabledItems = useMemo(() => {
        const disabled = [];
        if (!updateAccess) disabled.push('Goal');
        if (!deleteAccess) disabled.push('Delete');
        return disabled;
    }, [updateAccess, deleteAccess]);

    // Handle priority change confirmation
    const handleConfirmPriorityChange = async () => {
        if (!priorityModal.data?.pushNotifySettingId) {
            setPriorityModal({ show: false, data: null });
            return;
        }

        const { status } = await dispatch(
            updateMobilePushDefault({
                clientId,
                userId,
                DepartmentId: departmentId,
                pushNotifySettingId: priorityModal.data.pushNotifySettingId,
                IsDefault: !priorityModal.data.isDefault,
            }),
        );

        if (status) {
            getData();
        }
        setPriorityModal({ show: false, data: null });
    };

    const handleSetDefault = (data) => {
        if (!data?.pushNotifySettingId) return;
        // Show confirmation modal instead of directly updating
        setPriorityModal({ show: true, data });
    };
    const handleExpandClick = useCallback(
        (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (onToggleExpand) {
                onToggleExpand(dataItem);
                return;
            }

            const tr = e.currentTarget.closest('tr');
            if (!tr) return;
            const expandTarget = tr.querySelector(
                '.k-hierarchy-cell .k-icon-button, .k-hierarchy-cell a, .k-hierarchy-cell button, .k-hierarchy-cell .k-icon',
            );
            expandTarget?.click();
        },
        [dataItem, onToggleExpand],
    );

    const handleDelete = async (data) => {
        const { status } = await dispatch(
            deleteMobileAppList({
                clientId,
                userId,
                departmentId,
                pushNotifySettingId: data?.pushNotifySettingId,
                isActive: false,
            }),
        );
        if (status) {
            getData();
            setIsDelete({
                show: false,
                data: {},
            });
        } else {
            setIsDelete({
                show: false,
                data: {},
            });
        }
    };

    return (
        <td>
            {/* <RSConfirmationModal
                show={sdkStatus}
                handleConfirm={(status) => {
                    if (status) {
                        handleDelete(isDelete?.data);
                    }
                }}
                handleClose={() => {
                    setIsDelete({
                        show: false,
                        data: {},
                    });
                }}
            /> */}

            <div className={`rs-list-grid-wrapper${dataItem?.expanded ? ' sp-grid-expanded' : ''}`}>
                <div className="rslgw-content">
                    <small>App name</small>
                    <div className="d-flex">
                        <TruncateCell value={dataItem?.appName} noTable={true} />
                    </div>
                </div>

                <div className="rslgw-content">
                    <small>Created by</small>
                    <div className="d-flex">
                        <TruncateCell value={dataItem?.createdBy || ''} noTable={true} />
                    </div>
                </div>

                <div className="rslgw-content">
                    <small>Created date</small>
                    {/* <h4>{dateTimeFormat(dataItem?.createdDate, false)}</h4> */}
                    <p>{getUserCurrentFormat(dataItem?.createdDate)?.dateTimeFormatWithSeconds}</p>
                </div>

                <div className="rslgw-content">
                    <small>SDK status</small>
                    <p>{dataItem?.isEnabled}</p>
                </div>

                <div className="rslgw-content">
                    <ul className="rs-list-inline rli-space-15 d-flex grid-view-icons">
                        <li
                            onClick={() => {
                                if (updateAccess) {
                                    context.setGridCreate((prev) => ({
                                        ...prev,
                                        showGrid: false,
                                        pushMobileAction: {
                                            edit: {
                                                editState: dataItem,
                                                isEdit: true,
                                            },
                                            create: false,
                                            show: true,
                                        },
                                        pushMobileGoalAction: {
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
                        >
                            <RSTooltip text={EDIT} position="top" {...GRID_TOOLTIP_PROPS}>
                                <div className={`${!updateAccess ? 'pe-none click-off' : ''}`}>
                                    <i
                                        id="rs_data_pencil_edit"
                                        className={`${pencil_edit_medium} icon-md color-primary-blue`}
                                    ></i>
                                </div>
                            </RSTooltip>
                        </li>
                        <li>
                            <RSTooltip text={'Health check'} position="top" {...GRID_TOOLTIP_PROPS}>
                                <i
                                    onClick={() => props?.healthCheckData(dataItem)}
                                    className={`${industry_healthcare_medium} icon-md color-primary-blue cursor-pointer`}
                                />
                            </RSTooltip>
                        </li>
                        <li>
                            <RSTooltip text={PRIORITY} position="top" {...GRID_TOOLTIP_PROPS}>
                                <div className={(roleId !== 7 && !updateAccess) ? 'pe-none click-off' : ''}>
                                    <i
                                        onClick={() => handleSetDefault(dataItem)}
                                        className={`${crown_medium} icon-md ${dataItem?.isDefault ? 'color-yellow-medium pe-none' : 'color-primary-blue'
                                            } cursor-pointer`}
                                    />
                                </div>
                            </RSTooltip>
                        </li>
                        {/* <li>
                            <RSTooltip text="Goal" position="top" className="lh0">
                                <i
                                    id="rs_AppListRowCell_Goal"
                                    onClick={() => {
                                        context.setGridCreate((prev) => ({
                                            ...prev,
                                            showGrid: false,
                                            pushMobileAction: {
                                                edit: {
                                                    editState: props.dataItem,
                                                    isEdit: false,
                                                },
                                                create: false,
                                                show: false,
                                            },
                                            pushMobileGoalAction: {
                                                edit: {
                                                    editState: [],
                                                    isEdit: false,
                                                },
                                                create: false,
                                                showGrid: true,
                                                show: false,
                                            },
                                        }));
                                    }}
                                    className={`${goal_achieved_medium}  icon-md color-primary-blue`}
                                ></i>
                            </RSTooltip>
                        </li> */}
                        <li
                            onClick={() => {
                                let url = '/preferences/communication-settings/mobile-push-permissions';
                                const state = {
                                    id: props.dataItem?.pushNotifySettingId,
                                };
                                const encryptState = encodeUrl(state);
                                navigate(`${url}?q=${encryptState}`, {
                                    state,
                                });
                                // navigate('/preferences/channel-settings/mobile-push-permissions');
                            }}
                        >
                            <RSTooltip text={SETTING} position="top" {...GRID_TOOLTIP_PROPS}>
                                <i
                                    id="rs_AppListRowCell_Settings"
                                    className={`${settings_medium} icon-md color-primary-blue`}
                                ></i>
                            </RSTooltip>
                        </li>
                        {/* <li
                            onClick={() => {
                            }}
                        >
                            <RSTooltip text="Priority" position="top">
                                <i className={`${crown_medium} icon-md color-primary-blue`}></i>
                            </RSTooltip>
                        </li> */}
                        {/* <li
                            onClick={() => {
                                let url = '/preferences/channel-settings/mobile-push-SDK-integration';
                                const state = {
                                    id: props.dataItem?.pushNotifySettingId,
                                };
                                const encryptState = encodeUrl(state);
                                navigate(`${url}?q=${encryptState}`, {
                                    state,
                                });
                                // navigate('/preferences/channel-settings/mobile-push-SDK-integration');
                            }}
                        >
                            <RSTooltip text="view" position="top">
                                <i className={`${eye_medium} icon-md color-primary-blue`}></i>
                            </RSTooltip>
                        </li>

                       <li>
                            <RSTooltip text="Download" position="top">
                                <i className={`${download_medium} icon-md color-primary-blue`}></i>
                            </RSTooltip>
                        </li>
                        <li>
                            <RSTooltip text="Delete" position="top">
                                <i className={`${delete_medium} icon-md color-primary-blue`}></i>
                            </RSTooltip>
                        </li>*/}
                        <li>
                            <BootstrapDropdown
                                data={actionMenuItems}
                                disbleItems={actionMenuDisabledItems}
                                flatIcon
                                defaultItem={
                                    <i
                                        id="rs_AppListRowCell_Arrowdown"
                                        className={`${circle_arrow_down_medium} icon-md color-primary-blueue`}
                                    />
                                }
                                showUpdate={false}
                                className="no_caret"
                                alignRight
                                onSelect={(label) => {
                                    if (actionMenuDisabledItems.includes(label)) return;
                                    if (label === 'Info') {
                                        // Get tenant ID first, then show credentials modal on success
                                        if (!isLoadingTenant && getTenantId) {
                                            getTenantId(props.dataItem?.pushNotifySettingId, props.dataItem);
                                        } else {
                                        }
                                    } else if (label === 'Download') {
                                        if (props.onDownloadIntegration) {
                                            props.onDownloadIntegration(props.dataItem);
                                        }
                                    } else if (label === 'Goal') {
                                        context.setGridCreate((prev) => ({
                                            ...prev,
                                            showGrid: false,
                                            pushMobileAction: {
                                                edit: {
                                                    editState: props.dataItem,
                                                    isEdit: false,
                                                },
                                                create: false,
                                                show: false,
                                            },
                                            pushMobileGoalAction: {
                                                edit: {
                                                    editState: [],
                                                    isEdit: false,
                                                },
                                                create: false,
                                                showGrid: true,
                                                show: false,
                                            },
                                        }));
                                    } else if (label === 'Health check') {
                                        props?.healthCheckData(props?.dataItem);
                                        // setSelectData(props?.dataItem);
                                        // setSdkStatus(true);
                                    } else if (label === 'Delete') {
                                        if (deleteAccess) {
                                            setIsDelete({
                                                show: true,
                                                data: props?.dataItem,
                                            });
                                        }
                                    }
                                }}
                            />
                        </li>
                    </ul>
                </div>

                {dataItem?.expanded !== true && (
                    <div
                        className="expand-plus"
                        onClick={handleExpandClick}
                        role="button"
                        aria-label="Expand row"
                        style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                    >
                        <ul className="rs-icon-panel">
                            <li>
                                <i className="k-icon k-i-plus" style={{ pointerEvents: 'auto' }} />
                            </li>
                        </ul>
                    </div>
                )}
            </div>

            {/* {sdkStatus && <SDKHealthCheck 
                show={sdkStatus}
                type={'mobile'}
                title={"Mobile push"}
                data={selectData}
                domainUrl={''}
                appId={selectData?.appId}
                close={() => {
                    setSdkStatus(false);
                }}
            />} */}

            <RSConfirmationModal
                show={isDelete?.show}
                handleConfirm={(status) => {
                    if (status) {
                        handleDelete(isDelete?.data);
                    }
                }}
                handleClose={() => {
                    setIsDelete({
                        show: false,
                        data: {},
                    });
                }}
            />

            {priorityModal.show && (() => {
                const gridDataForPriority = props?.fullGridData ?? props?.gridData;
                const hasDefaultPriority = gridDataForPriority?.some((item) => item?.isDefault);
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
                                {`to ${priorityModal.data?.appName || ''}`}?
                            </p>
                        }
                        primaryButtonText="Confirm"
                        secondaryButtonText="Cancel"
                        handleConfirm={handleConfirmPriorityChange}
                        handleClose={() => setPriorityModal({ show: false, data: null })}
                    />
                );
            })()}
        </td>
    );
};

export default AppListRowCell;
