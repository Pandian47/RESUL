import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { ACTIONS, EDIT, SENDER_ID, STATUS } from 'Constants/GlobalConstant/Placeholders';
import { pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import { Switch } from '@progress/kendo-react-inputs';
import { useSelector, useDispatch } from 'react-redux';

import RSTooltip from 'Components/RSTooltip';
import KendoGrid from 'Components/RSKendoGrid';
import usePermission from 'Hooks/usePersmission';
import { getClientSMSOptSetting, updateClientSMSOptStatus } from 'Reducers/preferences/CommunicationSettings/request';
import { getSessionId } from 'Reducers/globalState/selector';
import { globalStateSelector } from 'Utils/Selectors/app';
import { OptInOptOutProvider } from './Context';
import OptInOptOutCreate from './Create';

import { ACTION_INITIAL_STATE } from '../../constant';

const OptInOptOut = () => {
    const { permissions } = usePermission();
    const { updateAccess } = permissions || {};
    const dispatch = useDispatch();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const { loading } = useSelector((state) => globalStateSelector(state));
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const [gridData, setGridData] = useState([]);
    const [gridLoading, setGridLoading] = useState(false);
    const [failedApi, setFailedApi] = useState('');
    const [gridCreate, setGridCreate] = useState(ACTION_INITIAL_STATE);
    const value = { setGridCreate, gridCreate };

    useEffect(() => {
        const payload = {
            departmentId,
            clientId,
            userId,
        };
        fetchOptInOptOutData(payload);
    }, [departmentId, clientId, userId]);

    const fetchOptInOptOutData = async (payload) => {
        const response = await dispatch(getClientSMSOptSetting(payload, setGridLoading));
        // Response structure: { status, data: [...], message, totalRows }
        if (response?.status && Array.isArray(response?.data)) {
            setGridData(response?.data);
        } else {
            setGridData([]);
        }
    };

    const handleSwitch = async (e, data) => {
        const payload = {
            ClientSMSSenderID: data.clientSmsSenderID,
            isActive: e.value,
            clientId,
            userId,
            departmentId,
        };
        const { status } = await dispatch(updateClientSMSOptStatus(payload));
        if (status) {
            setGridData((prev) => {
                return prev.map((res) => {
                    if (res.clientSmsSenderID === data.clientSmsSenderID) {
                        return { ...res, status: e.value };
                    }
                    return res;
                });
            });
        }
    };

    const handleErrClose = () => {
        if (failedApi === 'GetClientSMSOptById') {
            setGridCreate(ACTION_INITIAL_STATE);
        }
        setFailedApi('');
    };

    const handleEdit = (dataItem) => {
        if (updateAccess) {
            setGridCreate((prev) => ({
                ...prev,
                showGrid: false,
                smppAction: {
                    edit: {
                        editState: dataItem,
                        isEdit: true,
                    },
                    create: false,
                },
            }));
        }
    };

    return (
        <OptInOptOutProvider.Provider value={value}>
            {gridCreate.showGrid ? (
                <>
                    <div className="rs-sub-heading">
                        <div className="align-items-center d-flex justify-content-between">
                            <h4 className="mb0">Opt in / Opt out</h4>
                        </div>
                    </div>
                    {/* {gridData?.length === 0 && !gridLoading ? (
                <RSSkeletonTable
                    text
                    message="No Opt in / Opt out settings found."
                    isCustombox
                    isAlertIcon={false}
                />
            ) : ( */}
                <KendoGrid
                    data={gridData}
                    isLoading={gridLoading}
                    noBoxShadow
                    isFailure={!gridData?.length}
                    settings={{ total: gridData?.length }}
                    isCustomBox
                    noDataText = {'No Opt in / Opt out settings found.'}
                    column={[
                        {
                            field: 'senderID',
                            title: SENDER_ID,
                            // filter: 'text',
                            cell: ({ dataItem }) => (
                                <td>
                                    {dataItem?.senderID ? (
                                        <RSTooltip
                                            text={dataItem?.senderID}
                                            position="top"
                                            className="d-inline-block"
                                        >
                                            <span className="m0">{dataItem?.senderID}</span>
                                        </RSTooltip>
                                    ) : (
                                        <span className="m0">{dataItem?.senderID || ''}</span>
                                    )}
                                </td>
                            ),
                        },
                        {
                            field: 'status',
                            title: STATUS,
                            width: 130,
                            cell: (props) => {
                                return (
                                    <td className="text-left">
                                        <Switch
                                            checked={props.dataItem?.status}
                                            onChange={(e) => handleSwitch(e, props.dataItem)}
                                        />
                                    </td>
                                );
                            },
                        },
                        {
                            field: 'action',
                            title: ACTIONS,
                            width: 100,
                            cell: (props) => {
                                return (
                                    <td>
                                        <ul className="rs-list-inline rli-space-15 grid-view-icons">
                                            <li
                                                onClick={() => {
                                                    if (updateAccess) {
                                                        handleEdit(props.dataItem);
                                                    }
                                                }}
                                            >
                                                <RSTooltip text={EDIT} position="top">
                                                    <div className={`${!updateAccess ? 'pe-none click-off' : ''}`}>
                                                        <i
                                                            id="rs_data_pencil_edit"
                                                            className={`${pencil_edit_medium} icon-md color-primary-blue`}
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
                    {/* )} */}
                </>
            ) : (
                <OptInOptOutCreate
                    config={gridCreate.smppAction.edit.editState}
                    handleCancel={(status) => {
                        if (status) {
                            setGridCreate((prev) => ({
                                ...prev,
                                showGrid: status,
                                smppAction: {
                                    edit: {
                                        editState: [],
                                        isEdit: false,
                                    },
                                    create: false,
                                },
                            }));
                        }
                    }}
                    setFailedApi={setFailedApi}
                />
            )}
            {getWarningPopupMessage(failureApiErrors, dispatch, handleErrClose)}
        </OptInOptOutProvider.Provider>
    );
};

export default OptInOptOut;

