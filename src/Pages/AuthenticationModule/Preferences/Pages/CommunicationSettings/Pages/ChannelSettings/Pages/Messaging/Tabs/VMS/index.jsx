import { truncateTitle } from 'Utils/modules/displayCore';
import { DELETE, EDIT } from 'Constants/GlobalConstant/Placeholders';
import { circle_plus_fill_edge_large, circle_plus_fill_edge_medium, delete_medium, pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import KendoGrid from 'Components/RSKendoGrid';
import RSTooltip from 'Components/RSTooltip';

import usePermission from 'Hooks/usePersmission';
import { getVMSSelector, isCreatedValue } from 'Reducers/preferences/CommunicationSettings/selector';
import { getSessionId } from 'Reducers/globalState/selector';
import { deleteVMSDataById, getVMSData } from 'Reducers/preferences/CommunicationSettings/request';
import Create from './Create';
import { updateCommunicationSettings } from 'Reducers/preferences/CommunicationSettings/reducer';
import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';
import { CommunicationSettingsSmtpTableSkeleton } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';


const VMS = () => {
    const dispatch = useDispatch();

    const { permissions } = usePermission();
    const { addAccess, updateAccess, deleteAccess } = permissions || {};

    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const VMSGrid = useSelector((state) => getVMSSelector(state));

    const [create, setCreate] = useState(null);

    const [isGridLoading, setIsGridLoading] = useState(false);
    const isCreated = useSelector((state) => isCreatedValue(state));

    const handleCreateComponent = useCallback(() => {
        setCreate(null);
    }, []);

    useEffect(() => {
        dispatch(getVMSData({ clientId, userId, departmentId }, setIsGridLoading));
    }, []);

    useEffect(() => {
        return () => {
            dispatch(updateCommunicationSettings({ field: 'vmsData', payload: [] }));
            dispatch(updateCommunicationSettings({ field: 'isCreated', payload: false }));
        };
    }, []);

    const handleDelete = async (vmsId) => {
        const payload = { clientId, userId, vmsId, departmentId };
        const { status } = await dispatch(deleteVMSDataById(payload));
        if (status) {
            const updatedVMS = VMSGrid?.filter((res) => res.vmsId !== vmsId);
            dispatch(updateCommunicationSettings({ field: 'vmsData', payload: updatedVMS }));
        }
    };

    return (
        <div className="rsv-tabs-content">
            <>
                {!!create ? (
                    <Create handleCreateComponent={handleCreateComponent} create={create} />
                ) : (
                    <Fragment>
                        <div className="box-design bd-top-border">
                            <div className="rs-sub-heading">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h4 className="mb0">Voice messaging service</h4>
                                    <RSTooltip position="top" text="Add" className="lh0">
                                        <div className={`${!addAccess ? 'pe-none click-off' : ''}`}>
                                        <i
                                            className={`icon-lg color-primary-blue icon-hover-shadow-primary ${
                                                circle_plus_fill_edge_large
                                            }`}
                                            onClick={() => {
                                                if (addAccess) setCreate(true);
                                            }}
                                            id="rs_data_circle_plus_fill_edge"
                                        ></i>
                                        </div>
                                    </RSTooltip>
                                </div>
                            </div>

                            {isCreated && VMSGrid?.length == 0 ? (
                                <RSSkeletonTable
                                    text
                                    message={
                                        <>
                                            Click
                                            <i
                                                id="rs_data_circle_plus_fill_edge"
                                                className={`icon-md color-primary-blue icon-hover-shadow-primary ${
                                                    circle_plus_fill_edge_medium
                                                } ${!addAccess ? 'click-off' : ''} ${
                                                    VMSGrid?.length > 0 ? '' : 'click-off'
                                                } mx5`}
                                                onClick={() => {
                                                    if (addAccess) {
                                                        setActions({ type: 'SMTP Create', state: {} });
                                                        // setActions('SMTP Create');
                                                        setSmtpToggle('add');
                                                    }
                                                }}
                                            ></i>
                                            to configure your SMTP settings.
                                        </>
                                    }
                                    isCustombox
                                    isAlertIcon={false}
                                />
                            ) : isGridLoading ? (
                                <CommunicationSettingsSmtpTableSkeleton />
                            ) : (
                                <KendoGrid
                                    data={VMSGrid}
                                    isLoading={false}
                                    loading={false}
                                    noBoxShadow
                                    settings={{
                                        total: VMSGrid?.length,
                                    }}
                                    isCustomBox
                                    column={[
                                        {
                                            field: 'serviceProviderName',
                                            title: 'Server provider',
                                            filter: 'text',
                                        },
                                        {
                                            field: 'templateapi',
                                            title: 'Template API',
                                            filter: 'text',
                                        },
                                        {
                                            field: 'broadcastapi',
                                            title: 'Broadcast API',
                                            filter: 'text',
                                        },
                                        {
                                            field: 'userName',
                                            title: 'User name',
                                            filter: 'text',
                                            // cell: ({ dataItem }) => {
                                            //     return (
                                            //         <td>
                                            //             {dataItem?.userName?.length > 17 ? (
                                            //                 <RSTooltip text={dataItem?.userName} position="top">
                                            //                     <span>{truncateTitle(dataItem?.userName, 17)}</span>
                                            //                 </RSTooltip>
                                            //             ) : (
                                            //                 <span>{dataItem?.userName}</span>
                                            //             )}
                                            //         </td>
                                            //     );
                                            // },
                                        },
                                        {
                                            field: 'action',
                                            title: 'Actions',
                                            width: 200,
                                            sortable: false,
                                            cell: ({ dataItem }) => {
                                                return (
                                                    <td>
                                                        <ul className="rs-list-inline rli-space-15 grid-view-icons">
                                                            <li>
                                                                <RSTooltip text={EDIT} position="top">
                                                                    <div
                                                                        className={`${
                                                                            !updateAccess ? 'pe-none click-off' : ''
                                                                        }`}
                                                                    >
                                                                        <i
                                                                            id="rs_data_pencil_edit"
                                                                            className={`${pencil_edit_medium}  icon-md color-primary-blue`}
                                                                            onClick={() => setCreate(dataItem?.vmsId)}
                                                                        ></i>
                                                                    </div>
                                                                </RSTooltip>
                                                            </li>
                                                            <li>
                                                                <RSTooltip text={DELETE} position="top">
                                                                    <div
                                                                        className={`${
                                                                            !deleteAccess ? 'pe-none click-off' : ''
                                                                        }`}
                                                                    >
                                                                        <i
                                                                            id="rs_data_delete"
                                                                            className={`${delete_medium} icon-md color-primary-red`}
                                                                            onClick={() =>
                                                                                handleDelete(dataItem?.vmsId)
                                                                            }
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
                        </div>
                    </Fragment>
                )}
            </>
        </div>
    );
};

export default VMS;
