import { truncateTitle } from 'Utils/modules/displayCore';
import { ACTIONS, ADD, DELETE, EDIT, WHATS_APP } from 'Constants/GlobalConstant/Placeholders';
import { circle_plus_fill_edge_large, circle_plus_fill_edge_medium, delete_medium, pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import KendoGrid from 'Components/RSKendoGrid';
import RSTooltip from 'Components/RSTooltip';

import { WhatsAppProvider } from '../Context';
import usePermission from 'Hooks/usePersmission';
import { deleteCSWA, getWAGrid, updateSettingStatus } from 'Reducers/preferences/CommunicationSettings/request';
import { getSessionId } from 'Reducers/globalState/selector';
import { getCSWAGrid, isCreatedValue } from 'Reducers/preferences/CommunicationSettings/selector';

import RSConfirmationModal from 'Components/ConfirmationModal';
import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';
import { updateCommunicationSettings } from 'Reducers/preferences/CommunicationSettings/reducer';
import { Switch } from '@progress/kendo-react-inputs';
import { canEditMessagingChannel } from '../../../../../constant';
import { CommunicationSettingsSmtpTableSkeleton } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';

const WhatsAppGrid = () => {
    const { permissions } = usePermission();
    const { addAccess, updateAccess, deleteAccess } = permissions || {};
    const context = useContext(WhatsAppProvider);
    const dispatch = useDispatch();
    const waGrid = useSelector((state) => getCSWAGrid(state));
    const isCreated = useSelector((state) => isCreatedValue(state));
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const [isDelete, setIsDelete] = useState({
        show: false,
        data: {},
    });
    const handleChange = async (props, datas) => {
        const { status } = await dispatch(
            updateSettingStatus({
                clientId,
                userId,
                departmentId,
                channel: 21,
                settingId: datas?.clientWASettingID,
                isActive: props,
            }),
        );
        if (status) {
            const updatedGrid = (waGrid || []).map((item) =>
                item?.clientWASettingID === datas?.clientWASettingID
                    ? { ...item, Status: props }
                    : item,
            );
            dispatch(
                updateCommunicationSettings({
                    field: 'whatsAppGrid',
                    payload: updatedGrid,
                }),
            );
        }
    };
    const [isGridLoading, setIsGridLoading] = useState(false);
    useEffect(() => {
        dispatch(getWAGrid({ clientId, userId, departmentId }, setIsGridLoading));
    }, [departmentId, clientId, userId]);

    useEffect(() => {
        return () => {
            dispatch(updateCommunicationSettings({ field: 'whatsAppGrid', payload: [] }));
            dispatch(updateCommunicationSettings({ field: 'isCreated', payload: false }));
        };
    }, []);

    const handleDelete = async (record) => {
        const res = await dispatch(
            deleteCSWA({
                clientWASettingID: record.clientWASettingID,
                status: false,
                departmentId,
                clientId,
                userId,
            }),
        );
        const { status } = res;
        if (status) dispatch(getWAGrid({ clientId, userId, departmentId }, setIsGridLoading));
    };

    return (
        <>
            {/* Content starts */}
            <div className="rs-sub-heading">
                <div className="align-items-center d-flex justify-content-between">
                    <h4 className="mb0">{WHATS_APP}</h4>
                    <RSTooltip position="top" text={ADD} className="lh0">
                        <i
                            onClick={() => {
                                if (addAccess) {
                                    context.setGridCreate((prev) => ({
                                        ...prev,
                                        showGrid: false,
                                        whatsAppAction: {
                                            edit: {
                                                editState: [],
                                                isEdit: false,
                                            },
                                            create: true,
                                        },
                                    }));
                                }
                            }}
                            className={`icon-lg color-primary-blue icon-hover-shadow-primary ${
                                circle_plus_fill_edge_large
                            } ${!addAccess ? 'click-off' : ''}`}
                            id="rs_data_circle_plus_fill_edge"
                        ></i>
                    </RSTooltip>
                </div>
            </div>
            {isCreated && waGrid?.length == 0 ? (
                <RSSkeletonTable
                    text
                    message={
                        <>
                            Click
                            <i
                                id="rs_data_circle_plus_fill_edge"
                                className={`icon-md color-primary-blue icon-hover-shadow-primary ${
                                    circle_plus_fill_edge_medium
                                } ${!addAccess ? 'click-off' : ''} mx5`}
                                onClick={() => {
                                    if (addAccess) {
                                        context.setGridCreate((prev) => ({
                                            ...prev,
                                            showGrid: false,
                                            whatsAppAction: {
                                                edit: {
                                                    editState: [],
                                                    isEdit: false,
                                                },
                                                create: true,
                                            },
                                        }));
                                    }
                                }}
                            ></i>
                            to configure your WhatsApp settings.
                        </>
                    }
                    isCustombox
                    isAlertIcon={false}
                />
            ) : isGridLoading ? (
                <CommunicationSettingsSmtpTableSkeleton />
            ) : (
                <KendoGrid
                    data={waGrid}
                    isLoading={false}
                    loading={false}
                    noBoxShadow
                    isFailure={!waGrid?.length}
                    settings={{ total: waGrid?.length }}
                    isCustomBox
                    column={[
                        {
                            field: 'friendlyName',
                            title: 'Friendly name',
                            filter: 'text',
                            cell: ({ dataItem }) => (
                                <td>
                                    {dataItem?.friendlyName?.length > 30 ? (
                                        <RSTooltip
                                            text={dataItem?.friendlyName}
                                            position="top"
                                            className="d-inline-block"
                                        >
                                            <span className="m0">{truncateTitle(dataItem?.friendlyName, 30)}</span>
                                        </RSTooltip>
                                    ) : (
                                        <span className="m0">{dataItem?.friendlyName}</span>
                                    )}
                                </td>
                            ),
                        },
                        {
                            field: 'vendor',
                            title: 'Vendor',
                            filter: 'text',
                            cell: ({ dataItem }) => (
                                <td>
                                    {dataItem?.vendor?.length > 30 ? (
                                        <RSTooltip text={dataItem?.vendor} position="top" className="d-inline-block">
                                            <span className="m0">{truncateTitle(dataItem?.vendor, 30)}</span>
                                        </RSTooltip>
                                    ) : (
                                        <span className="m0">{dataItem?.vendor}</span>
                                    )}
                                </td>
                            ),
                        },
                        {
                            field: 'Status',
                            title: 'Status',
                            width: 165,
                            cell: (props) => {
                                return (
                                    <td>
                                        <ul className="rs-list-inline rli-space-5 pe-none click-off">
                                            <li>
                                                <Switch
                                                    className="mt0"
                                                    disabled={!updateAccess}
                                                    onChange={(e) => handleChange(e.target.value, props.dataItem)}
                                                    checked={props.dataItem?.Status}
                                                />
                                            </li>
                                        </ul>
                                    </td>
                                );
                            },
                        },
                        {
                            field: 'action',
                            title: ACTIONS,
                            width: 165,
                            sortable: false,
                            cell: (props) => {
                                const isDisabled = !updateAccess || !canEditMessagingChannel(props.dataItem);
                                return (
                                    <td>
                                        <ul className="rs-list-inline rli-space-15 grid-view-icons">
                                            <li
                                                onClick={() => {
                                                    if (!isDisabled) {
                                                        context.setGridCreate((prev) => ({
                                                            ...prev,
                                                            showGrid: false,
                                                            whatsAppAction: {
                                                                edit: {
                                                                    editState: props.dataItem,
                                                                    isEdit: true,
                                                                },
                                                                create: false,
                                                            },
                                                        }));
                                                    }
                                                }}
                                            >
                                                <RSTooltip text={EDIT} position="top">
                                                    <div className={`${isDisabled ? 'pe-none click-off' : ''}`}>
                                                        <i
                                                            id="rs_data_pencil_edit"
                                                            className={`${pencil_edit_medium}  icon-md color-primary-blue`}
                                                        ></i>
                                                    </div>
                                                </RSTooltip>
                                            </li>
                                            <li className='d-none'>
                                                <RSTooltip text={DELETE} position="top">
                                                    <div className={`${true ? 'pe-none click-off' : ''}`}>
                                                        <i
                                                            id="rs_data_delete"
                                                            className={`${delete_medium} icon-md color-primary-blue`}
                                                            onClick={() => {
                                                                setIsDelete({
                                                                    show: true,
                                                                    data: props?.dataItem,
                                                                });
                                                                //handleDelete(props?.dataItem)
                                                            }}
                                                        ></i>
                                                    </div>
                                                </RSTooltip>
                                            </li>
                                        </ul>
                                    </td>
                                );
                            },
                        },
                    ]}
                />
            )}
            {/* /Content ends */}
            {/* /Modals*/}
            <RSConfirmationModal
                show={isDelete?.show}
                handleConfirm={(status) => {
                    if (status) {
                        handleDelete(isDelete?.data);
                        setIsDelete({
                            show: false,
                            data: {},
                        });
                    }
                }}
                handleClose={() => {
                    setIsDelete({
                        show: false,
                        data: {},
                    });
                }}
            />
        </>
    );
};

export default WhatsAppGrid;
