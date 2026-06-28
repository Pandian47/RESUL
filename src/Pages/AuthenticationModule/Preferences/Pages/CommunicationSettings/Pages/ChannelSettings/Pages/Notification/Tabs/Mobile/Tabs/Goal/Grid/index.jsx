import { arrow_left_mini, circle_plus_fill_edge_large, pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import KendoGrid from 'Components/RSKendoGrid';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';
import { CommunicationSettingsSmtpTableSkeleton } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';
import RSTooltip from 'Components/RSTooltip';
import usePermission from 'Hooks/usePersmission';
import { Switch } from '@progress/kendo-react-inputs';
import { PushMobileContext } from '../../AppsList/context';
import { useNavigate } from 'react-router-dom';

import { useSelector, useDispatch } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import {
    get_mobilePush_GoalData,
    change_mobilePush_GoalDataByStatus,
} from 'Reducers/preferences/CommunicationSettings/request';

const MobilePushGoalSettingsGrid = ({ config }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const context = useContext(PushMobileContext);

    const { permissions } = usePermission();
    const { addAccess, updateAccess, deleteAccess } = permissions || {};
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const [gridData, setGridData] = useState({ appName: '', datas: [], appGuid: '' });
    const fieldLoaderConfig = { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.FIELD };
    const goalListApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });

    const pushNotifySettingId = config?.pushNotifySettingId;

    const loadGoalGrid = useCallback(() => {
        if (!pushNotifySettingId) {
            return undefined;
        }
        return goalListApi.refetch({
            fetcher: () =>
                dispatch(
                    get_mobilePush_GoalData({
                        clientId,
                        userId,
                        departmentId,
                        pushNotifySettingId,
                    }),
                ),
            loaderConfig: fieldLoaderConfig,
            mode: 'create',
            onSuccess: (res) => {
                const { status, data, appGuid, appName } = res || {};
                if (status) {
                    setGridData({ appGuid, datas: data, appName });
                } else {
                    setGridData({ appGuid: '', datas: [], appName: '' });
                }
            },
        });
    }, [clientId, userId, departmentId, pushNotifySettingId, dispatch]);

    const loadGoalGridRef = useRef(loadGoalGrid);
    loadGoalGridRef.current = loadGoalGrid;

    useEffect(() => {
        if (!pushNotifySettingId) {
            return undefined;
        }
        loadGoalGridRef.current();
    }, [clientId, userId, departmentId, pushNotifySettingId]);

    const handleChange = async (props, datas) => {
        const { status } = await dispatch(
            change_mobilePush_GoalDataByStatus({
                clientId,
                userId,
                departmentId,
                pushNotifyGoalSettingId: datas?.pushNotifyGoalSettingId,
                status: props,
            }),
        );
        if (status) {
            setGridData((prev) => {
                if (!prev?.datas) return prev;
                return {
                    ...prev,
                    datas: prev.datas.map((res) => {
                        if (res.pushNotifyGoalSettingId === datas?.pushNotifyGoalSettingId) {
                            return { ...res, status: !res?.status };
                        }
                        return res;
                    }),
                };
            });
        }
    };
    return (
        <>
            <>
                <div className="align-items-center d-flex justify-content-between mt20 mb19">
                    <h4 className='mb0'>Goal settings: {gridData?.appName}</h4>
              
                 <div className="d-flex align-items-center gap-2">
                    <RSTooltip position="top" text="Add" className="lh0">
                        <div className={`${!addAccess ? 'pe-none click-off' : ''}`}>
                        <i
                            onClick={() => {
                                if (addAccess) {
                                    context.setGridCreate((prev) => ({
                                        ...prev,
                                        showGrid: false,
                                        pushMobileAction: {
                                            edit: {
                                                editState: [],
                                                isEdit: false,
                                            },
                                            create: false,
                                            show: false,
                                        },
                                        pushMobileGoalAction: {
                                            edit: {
                                                editState: config,
                                                isEdit: false,
                                            },
                                            create: false,
                                            showGrid: false,
                                            show: true,
                                        },
                                    }));
                                }
                            }}
                            className={`icon-lg color-primary-blue icon-hover-shadow-primary ${
                                circle_plus_fill_edge_large
                            }`}
                            id="rs_data_circle_plus_fill_edge"
                        ></i>
                        </div>
                    </RSTooltip>
                    <div
                        className="align-items-center cp d-flex"
                        onClick={() => {
                            context.setGridCreate((prev) => ({
                                ...prev,
                                showGrid: true,
                                pushMobileAction: {
                                    edit: {
                                        editState: [],
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
                                    showGrid: false,
                                    show: false,
                                },
                            }));
                        }}
                    >
                        <i className={`icon-mini color-primary-blue ${arrow_left_mini}`}></i>
                        <span className="color-secondary-blue">Back</span>
                    </div>
                </div>
                  </div>
            </>

            {goalListApi.isFetching ? (
                <CommunicationSettingsSmtpTableSkeleton />
            ) : (
                <KendoGrid
                    data={gridData?.datas}
                    settings={{
                        total: gridData?.datas?.length,
                    }}
                    isFailure={!gridData?.datas?.length}
                    loading={false}
                    isLoading={false}
                    noBoxShadow
                    column={[
                        {
                            field: 'goalName',
                            title: 'Goal name',
                            filter: 'text',
                            cell: (props) => {
                                return (
                                    <td>
                                        <div className="d-flex justify-content-between">
                                            <span>
                                                <RSTooltip text="Edit goal" position="top">
                                                    <span>{props.dataItem?.goalName}</span>
                                                </RSTooltip>
                                            </span>
                                        </div>
                                    </td>
                                );
                            },
                        },

                        {
                            field: 'action',
                            title: 'Action',
                            width: '200px',
                            sortable: false,
                            cell: (props) => {
                                return (
                                    <td>
                                        <ul className="rs-list-inline rli-space-5 grid-view-icons">
                                            <li className="d-flex gap-5">
                                                <RSTooltip text="Edit goal" position="top">
                                                    <i
                                                        id="rs_data_pencil_edit"
                                                        className={`${pencil_edit_medium}  icon-md color-primary-blue `}
                                                        onClick={() => {
                                                            if (addAccess) {
                                                                context.setGridCreate((prev) => ({
                                                                    ...prev,
                                                                    showGrid: false,
                                                                    pushMobileAction: {
                                                                        edit: {
                                                                            editState: [],
                                                                            isEdit: false,
                                                                        },
                                                                        create: false,
                                                                        show: false,
                                                                    },
                                                                    pushMobileGoalAction: {
                                                                        edit: {
                                                                            editState: {
                                                                                ...props?.dataItem,
                                                                                appId: gridData?.appGuid,
                                                                            },
                                                                            isEdit: true,
                                                                        },
                                                                        create: false,
                                                                        showGrid: false,
                                                                        show: true,
                                                                    },
                                                                }));
                                                            }
                                                        }}
                                                    ></i>
                                                </RSTooltip>
                                                <Switch
                                                    className="mt0"
                                                    disabled={!updateAccess}
                                                    onChange={(e) => handleChange(e.target.value, props.dataItem)}
                                                    checked={props.dataItem?.status}
                                                />
                                            </li>
                                        </ul>
                                    </td>
                                );
                            },
                        },
                    ]}
                />
            )}
        </>
    );
};

export default MobilePushGoalSettingsGrid;
