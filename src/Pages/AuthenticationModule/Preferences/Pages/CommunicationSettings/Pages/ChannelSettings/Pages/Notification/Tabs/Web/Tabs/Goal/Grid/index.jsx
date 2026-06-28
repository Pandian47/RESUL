import { arrow_left_mini, circle_plus_fill_edge_large, pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import KendoGrid from 'Components/RSKendoGrid';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';
import { CommunicationSettingsSmtpTableSkeleton } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';
import RSTooltip from 'Components/RSTooltip';
import usePermission from 'Hooks/usePersmission';
import { Switch } from '@progress/kendo-react-inputs';
import { Push_WebContext } from '../../Web/Context';
import { useNavigate } from 'react-router-dom';

import { useSelector, useDispatch } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import {
    change_webPush_GoalDataByStatus,
    getWebPushGoalData,
} from 'Reducers/preferences/CommunicationSettings/request';

const WebPushGoalSettingsGrid = ({ config }) => {
    // console.log('props: ', config);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const context = useContext(Push_WebContext);

    const { permissions } = usePermission();
    const { addAccess, updateAccess, deleteAccess } = permissions || {};
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const [gridData, setGridData] = useState({ domainName: '', datas: [], webNotifySettingId: '' });
    const fieldLoaderConfig = { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.FIELD };
    const goalListApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });

    const webNotifySettingId = config?.webNotifySettingId;
    const domainName = config?.domainName;

    const loadGoalGrid = useCallback(() => {
        if (!webNotifySettingId) {
            return undefined;
        }
        return goalListApi.refetch({
            fetcher: () =>
                dispatch(
                    getWebPushGoalData({
                        clientId,
                        userId,
                        departmentId,
                        domainName,
                        webnotifySettingId: webNotifySettingId,
                    }),
                ),
            loaderConfig: fieldLoaderConfig,
            mode: 'create',
            onSuccess: (res) => {
                const { status, data, webnotifySettingId: resolvedId, domainName: resolvedName, domainURL } =
                    res || {};
                if (status) {
                    setGridData({
                        webNotifySettingId: resolvedId,
                        datas: data,
                        domainName: resolvedName,
                        domainURL,
                    });
                } else {
                    setGridData({
                        webNotifySettingId: 0,
                        datas: [],
                        domainName: resolvedName || '',
                        domainURL,
                    });
                }
            },
        });
    }, [clientId, userId, departmentId, domainName, webNotifySettingId, dispatch]);

    const loadGoalGridRef = useRef(loadGoalGrid);
    loadGoalGridRef.current = loadGoalGrid;

    useEffect(() => {
        if (!webNotifySettingId) {
            return undefined;
        }
        loadGoalGridRef.current();
    }, [clientId, userId, departmentId, webNotifySettingId, domainName]);
    const handleDelete = async (props) => {
        const { status, data } = await dispatch(
            DeleteWebPush({
                clientId,
                userId,
                departmentId,
                webnotifySettingId: props?.webnotifyGoalSettingId,
                isActive: false,
            }),
        );
        if (status) loadGoalGrid();
    };
    const handleChange = async (props, datas) => {
        const { status, data, message } = await dispatch(
            change_webPush_GoalDataByStatus({
                clientId,
                userId,
                departmentId,
                webnotifyGoalSettingId: datas?.webnotifyGoalSettingId,
                status: props,
            }),
        );
        if (status) {
            setGridData((prev) => {
                if (!prev?.datas) return prev;
                return {
                    ...prev,
                    datas: prev.datas.map((res) => {
                        if (res?.webnotifyGoalSettingId === datas?.webnotifyGoalSettingId) {
                            return { ...res, status: !res?.status };
                        }
                        return res;
                    }),
                };
            });
        }
    };
    return (
        <div className="">
            <div className="align-items-center d-flex justify-content-between mt20 mb19">
                    <h4 className='mb0'>Goal settings: {gridData?.domainName}</h4>
                <div className="d-flex align-items-center gap-2">
                    <RSTooltip position="top" text="Add" className="lh0">
                        <div className={`${!addAccess ? 'pe-none click-off' : ''}`}>
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
                                            create: false,
                                            show: false,
                                        },
                                        pushWebGoalAction: {
                                            edit: {
                                                editState: config,
                                                isEdit: false,
                                            },
                                            create: false,
                                            showGrid: false,
                                            show: true,
                                        },
                                        domainUrl: gridData?.domainURL,
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
                                pushWebAction: {
                                    edit: {
                                        editState: [],
                                        isEdit: false,
                                    },
                                    create: false,
                                    show: false,
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
                        }}
                    >
                        <i className={`icon-mini color-primary-blue  ${arrow_left_mini}`}></i>
                        <span className="color-secondary-blue">Back</span>
                    </div>
                </div>
            </div>

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
                    // {
                    //     field: 'domainName',
                    //     title: 'Domain name',
                    // },
                    {
                        field: 'goalName',
                        title: 'Goal name',
                        filter:'text',
                        cell: (props) => {
                            return (
                                <td>
                                    <div className="d-flex justify-content-between">
                                        <span
                                            className="cursor-pointer"
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
                                                            create: false,
                                                            show: false,
                                                        },
                                                        pushWebGoalAction: {
                                                            edit: {
                                                                editState: {
                                                                    ...props?.dataItem,
                                                                    webNotifySettingId: gridData?.webNotifySettingId,
                                                                    domainName: gridData?.domainName,
                                                                },
                                                                // editState: props?.dataItem,

                                                                isEdit: true,
                                                            },
                                                            create: false,
                                                            showGrid: false,
                                                            show: true,
                                                        },
                                                    }));
                                                }
                                            }}
                                        >
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
                        cell: (props) => {
                            return (
                                <td>
                                    <ul className="rs-list-inline rli-space-5">
                                        <li>
                                            {/* <RSTooltip text="Edit" position="top">
                                                <i
                                                    className={`${
                                                        pencil_edit_medium
                                                    }  icon-md color-primary-blue ${
                                                        !updateAccess ? 'click-off' : ''
                                                    }`}
                                                ></i>
                                            </RSTooltip> */}
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
        </div>
    );
};

export default WebPushGoalSettingsGrid;
