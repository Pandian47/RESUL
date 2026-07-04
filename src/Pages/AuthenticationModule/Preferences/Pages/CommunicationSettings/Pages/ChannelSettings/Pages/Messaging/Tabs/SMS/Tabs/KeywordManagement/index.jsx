import { getmasterData } from 'Utils/modules/masterData';
import { A2P_10_DLC, A2P_NUMBER_TYPES, ACTIONS, ADD, EDIT, FRIENDLY_NAME, INBOUND_NUMBERS, NO_OPT_IN_OPT_OUT_SETTINGS, OPT_IN_OPT_OUT, SENDER_ID, SERVICE_PROVIDER, TOLL_FREE, VIEW } from 'Constants/GlobalConstant/Placeholders';
import { circle_plus_fill_edge_large, eye_medium, pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import RSTooltip from 'Components/RSTooltip';
import KendoGrid from 'Components/RSKendoGrid';
import usePermission from 'Hooks/usePersmission';
import { CommunicationSettingsSmtpTableSkeleton } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';
import { getSessionId } from 'Reducers/globalState/selector';
import { getOptInOutList } from 'Reducers/preferences/CommunicationSettings/request';
import { KEYWORD_MANAGEMENT_INITIAL_STATE } from './constant';
import KeywordManagementCreate from './Create';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell';


const KeywordManagement = () => {
    const { countryMasterList } = getmasterData();
    const dispatch = useDispatch();
    const { clientId, departmentId, userId } = useSelector((state) => getSessionId(state));
    const gridData = useSelector((state) => state.communicationSettingsReducer.optInOutList);
    const isLoading = useSelector((state) => state.communicationSettingsReducer.keywordManagementLoading);
    const countryId = useSelector((state) => state.communicationSettingsReducer.optInOutCountryId);
    const country = countryMasterList?.find((c) => c?.countryID === countryId)?.country;
    const { permissions } = usePermission();
    const { updateAccess, addAccess } = permissions || {};

    const [gridCreate, setGridCreate] = useState(KEYWORD_MANAGEMENT_INITIAL_STATE);

    const fetchGridData = useCallback(async () => {
        await dispatch(getOptInOutList({ clientId, departmentId, userId }));
    }, [clientId, departmentId, userId, dispatch]);

    useEffect(() => {
        fetchGridData();
    }, []);

    const handleCreate = () => {
        if (addAccess) {
            setGridCreate((prev) => ({
                ...prev,
                showGrid: false,
                action: {
                    edit: { editState: [], isEdit: false, isView: false },
                    create: true,
                },
            }));
        }
    };

    const handleEdit = (dataItem) => {
        setGridCreate((prev) => ({
            ...prev,
            showGrid: false,
            action: {
                edit: {
                    editState: dataItem,
                    isEdit: true,
                    isView: false,
                },
                create: false,
            },
        }));
    };

    const handleView = (dataItem) => {
        setGridCreate((prev) => ({
            ...prev,
            showGrid: false,
            action: {
                edit: {
                    editState: dataItem,
                    isEdit: false,
                    isView: true,
                },
                create: false,
            },
        }));
    };

    return (
        <>
            {gridCreate.showGrid ? (
                <>
                    <div className="rs-sub-heading">
                        <div className="align-items-center d-flex justify-content-between">
                            <div>
                                <h4 className="mb0">{OPT_IN_OPT_OUT}</h4>
                                <span className="text-muted">{ country ? `Location: ${country}` : ''}</span>
                            </div>
                            <RSTooltip position="top" text={ADD} className="lh0">
                                <i
                                    onClick={handleCreate}
                                    className={`icon-lg color-primary-blue icon-hover-shadow-primary ${
                                        circle_plus_fill_edge_large
                                    } ${!addAccess ? 'click-off' : ''}`}
                                    id="rs_data_circle_plus_fill_edge"
                                ></i>
                            </RSTooltip>
                        </div>
                    </div>
                    {isLoading ? (
                        <CommunicationSettingsSmtpTableSkeleton />
                    ) : (
                    <KendoGrid
                        data={gridData}
                        isLoading={false}
                        loading={false}
                        noBoxShadow
                        isFailure={!gridData?.length}
                        settings={{ total: gridData?.length }}
                        isCustomBox
                        noDataText={NO_OPT_IN_OPT_OUT_SETTINGS}
                        column={[
                            {
                                field: 'friendlyName',
                                title: FRIENDLY_NAME,
                                cell: ({ dataItem }) => <TruncatedCell value={dataItem?.circleName} />,
                            },
                            {
                                field: 'senderID',
                                title: SENDER_ID,
                                cell: ({ dataItem }) => <TruncatedCell value={dataItem?.senderID} />,
                            },
                            {
                                field: 'inboundNumber',
                                title: INBOUND_NUMBERS,
                                
                                cell: ({ dataItem }) => <TruncatedCell value={dataItem?.inboundNumber} />,
                            },
                            {
                                field: 'a2pNumberType',
                                title: A2P_NUMBER_TYPES,
                                width: 200,
                                cell: ({ dataItem }) => (
                                    <TruncatedCell value={dataItem?.isDLCNo ? A2P_10_DLC : TOLL_FREE} />
                                ),
                            },
                            {
                                field: 'serviceProvider',
                                title: SERVICE_PROVIDER,
                                width: 200,
                                cell: ({ dataItem }) => <TruncatedCell value={dataItem?.serviceProviderName} />,
                            },
                            {
                                field: 'action',
                                title: ACTIONS,
                                width: 100,
                                cell: (props) => (
                                    <td>
                                        <ul className="rs-list-inline rli-space-15 grid-view-icons">
                                            <li onClick={() => updateAccess ? handleEdit(props.dataItem) : handleView(props.dataItem)}>
                                                <RSTooltip text={updateAccess ? EDIT : VIEW} position="top">
                                                    <i
                                                        id='action_edit'
                                                        className={`${updateAccess ? pencil_edit_medium : eye_medium} icon-md color-primary-blue`}
                                                    />
                                                </RSTooltip>
                                            </li>
                                        </ul>
                                    </td>
                                ),
                            },
                        ]}
                    />
                    )}
                </>
            ) : (
                <KeywordManagementCreate
                    config={gridCreate.action.edit.editState}
                    isCreate={gridCreate.action.create}
                    isUpdate={gridCreate.action.edit.isEdit}
                    isView={gridCreate.action.edit.isView || false}
                    handleCancel={(status) => {
                        if (status) {
                            fetchGridData();
                            setGridCreate((prev) => ({
                                ...prev,
                                showGrid: status,
                                action: {
                                    edit: {
                                        editState: [],
                                        isEdit: false,
                                        isView: false,
                                    },
                                    create: false,
                                },
                            }));
                        }
                    }}
                />
            )}
        </>
    );
};

export default KeywordManagement;
