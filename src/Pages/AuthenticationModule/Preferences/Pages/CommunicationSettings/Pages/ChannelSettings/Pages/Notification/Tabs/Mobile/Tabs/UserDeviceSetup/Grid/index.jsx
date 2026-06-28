import { getUserCurrentFormat } from 'Utils/modules/dateTime';

import { ACTIONS, ADD, APP_NAME, CREATE_DATE, DELETE, EDIT, MOBILE_PLATFORM, USER_DEVICE_SUMMARY, USER_NAME } from 'Constants/GlobalConstant/Placeholders';
import { circle_plus_fill_edge_large, delete_medium, pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import moment from 'moment';
import KendoGrid from 'Components/RSKendoGrid';
import RSTooltip from 'Components/RSTooltip';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';
import { CommunicationSettingsSmtpTableSkeleton } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';

import { Push_MobileUserDeviceSetUpContext } from '../Context';

import usePermission from 'Hooks/usePersmission';
import { useSelector, useDispatch } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import {
    mobilePush_GetUserDeviceSetup,
    mobilePush_DeleteUserDevice,
} from 'Reducers/preferences/CommunicationSettings/request';

import RSConfirmationModal from 'Components/ConfirmationModal';

const UserDeviceSetupGrid = () => {
    const context = useContext(Push_MobileUserDeviceSetUpContext);
    const { permissions } = usePermission();
    const { addAccess, updateAccess, deleteAccess } = permissions || {};
    const dispatch = useDispatch();
    const [isDelete, setIsDelete] = useState({
        show: false,
        data: {},
    });
    const [initialPagination, setInitialPagination] = useState(false);
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const [gridData, setGridData] = useState([]);
    const fieldLoaderConfig = { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.FIELD };
    const listApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });

    const loadGrid = useCallback(() => {
        setInitialPagination(true);
        return listApi.refetch({
            fetcher: () =>
                dispatch(mobilePush_GetUserDeviceSetup({ clientId, userId, departmentId })),
            loaderConfig: fieldLoaderConfig,
            mode: 'create',
            onSuccess: (res) => {
                const { status, data } = res || {};
                setGridData(status ? data : []);
            },
        });
    }, [clientId, userId, departmentId, dispatch]);

    const loadGridRef = useRef(loadGrid);
    loadGridRef.current = loadGrid;

    useEffect(() => {
        loadGridRef.current();
    }, [departmentId, clientId, userId]);

    const getData = () => loadGridRef.current();
    const handleDelete = async (props) => {
        const { status, data, message } = await dispatch(
            mobilePush_DeleteUserDevice({
                clientId,
                userId,
                departmentId,
                userdeviceId: props?.userdeviceId,
                isActive: false,
            }),
        );
        if (status) {
            setIsDelete({
                show: false,
                data: {},
            });
            loadGridRef.current();
        } else {
            setIsDelete({
                show: false,
                data: {},
            });
        }
    };
    return (
        <>
            <div className="rs-sub-heading mt20">
                <div className="align-items-center d-flex justify-content-between">
                    <h4 className="mb0">{USER_DEVICE_SUMMARY}</h4>
                    <RSTooltip position="top" text={ADD} className="lh0">
                        <div  className={`${!addAccess ? 'pe-none click-off' : ''}`}>
                        <i
                            onClick={() => {
                                if (addAccess) {
                                    context.setGridCreate((prev) => ({
                                        ...prev,
                                        showGrid: false,
                                        pushMobileUserDeviceSetUpAction: {
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
                                }`}
                            id="rs_data_circle_plus_fill_edge"
                        ></i>
                        </div>
                    </RSTooltip>
                </div>
            </div>
            {listApi.isFetching ? (
                <CommunicationSettingsSmtpTableSkeleton />
            ) : (
            <KendoGrid
                data={gridData}
                noBoxShadow
                settings={{
                    total: gridData?.length,
                }}
                isCustomBox
                isFailure={!gridData?.length}
                isLoading={false}
                column={[
                    {
                        field: 'appName',
                        title: APP_NAME,
                        filter:'text'
                    },
                    {
                        field: 'userName',
                        title: USER_NAME,
                        width: 170,
                        filter:'text',
                    },
                    // {
                    //     field: 'userdeviceId',
                    //     title: 'User device',
                    // },
                    {
                        field: 'platformName',
                        title: MOBILE_PLATFORM,
                         filter:'text',
                    },
                    {
                        field: 'createddate',
                        title: CREATE_DATE,
                         filter:'date',
                        cell: (props) => {
                            return (
                                <td>
                                    {moment(props.dataItem?.createddate).isValid() && (
                                        <span className="rctcb-by-date">
                                            {getUserCurrentFormat(props?.dataItem?.createdDate)?.dateTimeFormat}
                                        </span>
                                    )}
                                </td>
                            );
                        },
                    },
                    {
                        field: 'action',
                        title: ACTIONS,
                        width: '200px',
                        sortable: false,
                        cell: (props) => {
                            return (
                                <td>
                                    <ul className="rs-list-inline rli-space-15 grid-view-icons">
                                        <li>
                                            <RSTooltip text={EDIT} position="top" className="lh0">
                                                <div className={`${!updateAccess ? 'pe-none click-off' : ''}`}>
                                                <i
                                                    onClick={() => {
                                                        if (updateAccess) {
                                                            context.setGridCreate((prev) => ({
                                                                ...prev,
                                                                showGrid: false,
                                                                pushMobileUserDeviceSetUpAction: {
                                                                    edit: {
                                                                        editState: props.dataItem,
                                                                        isEdit: true,
                                                                    },
                                                                    create: false,
                                                                },
                                                            }));
                                                        }
                                                    }}
                                                    className={`${
                                                        pencil_edit_medium
                                                        }  icon-md color-primary-blue`}
                                                ></i></div>
                                            </RSTooltip>
                                        </li>
                                        <li>
                                            <RSTooltip text={DELETE} position="top" className="lh0">
                                                <div  className={`${delete_medium} icon-md color-primary-blue ${
                                                        !deleteAccess ? 'pe-none click-off' : ''
                                                        }`}>
                                                <i
                                                    id="rs_data_delete"
                                                    className={`${delete_medium} icon-md color-primary-red`}
                                                    onClick={() => {
                                                        setIsDelete({
                                                            show: true,
                                                            data: props.dataItem,
                                                        });
                                                    }}
                                                ></i></div>
                                            </RSTooltip>
                                        </li>
                                    </ul>
                                </td>
                            );
                        },
                    },
                ]}
                pagerChange={initialPagination}
                setInitialPagination={setInitialPagination}

            />
            )}
            <RSConfirmationModal
                show={isDelete?.show}
                handleConfirm={(status) => {
                    if (status) {
                        handleDelete(isDelete?.data);
                        // setIsDelete({
                        //     show: false,
                        //     data: {},
                        // });
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

export default UserDeviceSetupGrid;
