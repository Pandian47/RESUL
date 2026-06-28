import { DELETE, EDIT } from 'Constants/GlobalConstant/Placeholders';
import { circle_plus_fill_edge_large, delete_medium, pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import KendoGrid from 'Components/RSKendoGrid';
import RSTooltip from 'Components/RSTooltip';

import usePermission from 'Hooks/usePersmission';
import { getLineSelector } from 'Reducers/preferences/CommunicationSettings/selector';
import { getSessionId } from 'Reducers/globalState/selector';
import { getLineData } from 'Reducers/preferences/CommunicationSettings/request';
import Create from './Create';
import { CommunicationSettingsSmtpTableSkeleton } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';

const LINE = () => {
    const dispatch = useDispatch();

    const { permissions } = usePermission();
    const { addAccess, updateAccess, deleteAccess } = permissions || {};

    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const lineGrid = useSelector((state) => getLineSelector(state));

    const [create, setCreate] = useState(null);
    const [isGridLoading, setIsGridLoading] = useState(false);

    const handleCreateComponent = useCallback(() => {
        setCreate(null);
    }, []);

    useEffect(() => {
        dispatch(getLineData({ clientId, userId, departmentId }, setIsGridLoading));
    }, [clientId, userId, departmentId, dispatch]);

    const handleDelete = async (vmsId) => {
        const payload = { clientId, userId, vmsId, departmentId };
    };

    return (
        <div className="rsv-tabs-content">
            <div className="box-design bd-top-border">
                {!!create ? (
                    <Create handleCreateComponent={handleCreateComponent} create={create} />
                ) : (
                    <Fragment>
                        <div className="rs-sub-heading">
                            <div className="d-flex justify-content-between align-items-center">
                                <h4 className="mb0">Line</h4>
                                <RSTooltip position="top" text="Add" className="lh0">
                                    <i
                                        className={`icon-lg color-primary-blue icon-hover-shadow-primary ${
                                            circle_plus_fill_edge_large
                                        } ${!addAccess ? 'click-off' : ''}`}
                                        onClick={() => {
                                            if (addAccess) setCreate(true);
                                        }}
                                        id="rs_data_circle_plus_fill_edge"
                                    ></i>
                                </RSTooltip>
                            </div>
                        </div>
                        {isGridLoading ? (
                            <CommunicationSettingsSmtpTableSkeleton />
                        ) : (
                        <KendoGrid
                            data={lineGrid}
                            noBoxShadow
                            isFailure={!lineGrid?.length}
                            loading={false}
                            isLoading={false}
                            settings={{
                                total: lineGrid?.length,
                            }}
                            isCustomBox
                            column={[
                                {
                                    field: 'serviceProviderName',
                                    title: 'Service provider',
                                    filter:'text',
                                },
                                {
                                    field: 'postUrl',
                                    title: 'Post URL',
                                    filter:'text',
                                },
                                {
                                    field: 'action',
                                    title: 'Action',
                                    width: 200,
                                    cell: ({ dataItem }) => {
                                        return (
                                            <td>
                                                <ul className="rs-list-inline rli-space-15 grid-view-icons">
                                                    <li>
                                                        <RSTooltip text={EDIT} position="top">
                                                            <div className={`${
                                                                    !updateAccess ? 'pe-none click-off' : ''
                                                                }`}>
                                                            <i
                                                                id="rs_data_pencil_edit"
                                                                className={`${
                                                                    pencil_edit_medium
                                                                }  icon-md color-primary-blue`}
                                                                onClick={() => {
                                                                    setCreate(dataItem?.clientLineId);
                                                                    //setCreate(dataItem?.vmsId)
                                                                }}
                                                            ></i></div>
                                                        </RSTooltip>
                                                    </li>
                                                    <li>
                                                        <RSTooltip text={DELETE} position="top">
                                                            <div className={`${
                                                                    !deleteAccess ? 'pe-none click-off' : ''
                                                                }`}>
                                                            <i
                                                                id="rs_data_delete"
                                                                className={`${
                                                                    delete_medium
                                                                } icon-md color-primary-blue`}
                                                                onClick={() => handleDelete(dataItem?.vmsId)}
                                                            ></i></div>
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
                    </Fragment>
                )}
            </div>
        </div>
    );
};

export default LINE;
