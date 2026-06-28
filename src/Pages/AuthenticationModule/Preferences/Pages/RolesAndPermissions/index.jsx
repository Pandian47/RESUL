
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { deleteReducer, getAccessStatus } from './constant';
import { ADD_USER_ROLES, ARE_YOU_SURE_DELETE, DELETE, DELETE_USER_ROLE, EDIT, VIEW } from 'Constants/GlobalConstant/Placeholders';
import { circle_plus_fill_edge_large, delete_medium, eye_medium, pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useReducer } from 'react';
import { Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import KendoGrid from 'Components/RSKendoGrid';
import RSTooltip from 'Components/RSTooltip';
import RSPageHeader from 'Components/RSPageHeader';
import PreferencesSubPageSkeletonGate from 'Components/Skeleton/Components/PreferencesSubPageSkeletonGate';
import { PREFERENCES_SUBPAGE_VARIANT } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';
import usePreferencesSubPageApi from 'Hooks/usePreferencesSubPageApi';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';

import { securityUsersList } from 'Reducers/preferences/rolesAndPermissions/selectors';
import { deleteSecurityGroup, getSecuritygroupList } from 'Reducers/preferences/rolesAndPermissions/request';
import { updateRolesLoadingState, updateRoles } from 'Reducers/preferences/rolesAndPermissions/reducer';
import { getSessionId } from 'Reducers/globalState/selector';
import RSConfirmationModal from 'Components/ConfirmationModal';
import { HorizontalSkeleton } from 'Components/Skeleton/Skeleton';


const RolesAndPermissions = ({ permissions }) => {
    const { addAccess, updateAccess, viewAccess, deleteAccess } = permissions || {};
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);

    const { roles, isFailure } = useSelector((state) => securityUsersList(state));
    const { clientId, userId } = useSelector((state) => getSessionId(state));
    const [internalState, dispatchState] = useReducer(deleteReducer, {
        securityGroupId: null,
        index: null,
        isDelete: false,
    });

    const rolesApi = usePreferencesSubPageApi({
        mode: 'edit',
        deps: [clientId, userId],
        fetcher: async () => {
            dispatch(updateRolesLoadingState(true));
            try {
                return await dispatch(
                    getSecuritygroupList({
                        payload: { clientId, userId },
                        loading: false,
                    }),
                );
            } finally {
                dispatch(updateRolesLoadingState(false));
            }
        },
    });
    const deleteRoleApi = useApiLoader({ autoFetch: false });
    const isDeleteRoleLoading = deleteRoleApi.isFetching;

    const closeDeleteModal = () => {
        dispatchState({
            type: 'UPDATE_DELETE',
            payload: {
                isDelete: false,
            },
        });
    };

    const handleDeleteGroup = async () => {
        const payload = {
            clientId,
            userId,
            securityGroupId: internalState.securityGroupId,
        };
        const res = await deleteRoleApi.refetch({
            fetcher: () => dispatch(deleteSecurityGroup({ payload, loading: false })),
            loaderConfig: { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.GLOBAL },
        });
        if (res?.status) {
            const tempRoles = [...roles].filter((_, roleIndex) => roleIndex !== internalState.index);
            dispatch(updateRoles(tempRoles));
            closeDeleteModal();
        }
    };

    return (
        <div className="page-content-holder">
            <RSPageHeader title="Roles and permissions" isBack backPath="/preferences" />

            <Container fluid>
                <div className="page-content">
                    <Container className="px0">
                        <PreferencesSubPageSkeletonGate
                            variant={PREFERENCES_SUBPAGE_VARIANT.ROLES}
                            isLoading={rolesApi.isPageLoading}
                        >
                            <div className="flex-row mt0 top-sub-heading">
                                <div className="fr flex-right tsh-icons">
                                    <ul className="rs-list-group-horizontal jc-right">
                                        <li>
                                            <RSTooltip position="top" text={ADD_USER_ROLES} className="lh0">
                                                <div className={!addAccess ? 'pe-none click-off' : ''}>
                                                    <i
                                                        id="rs_RolesAndPermissions_circle_plus_fill"
                                                        className={`${circle_plus_fill_edge_large} icon-lg color-primary-blue icon-hover-shadow-primary`}
                                                        onClick={() => {
                                                            if (addAccess)
                                                                navigate(
                                                                    '/preferences/roles-and-permissions/add-permissions',
                                                                    { state: { mode: 'new' } },
                                                                );
                                                        }}
                                                    />
                                                </div>
                                            </RSTooltip>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div>
                                {/* {!roles?.length ? (
                                    <div className="portlet-container">
                                        <HorizontalSkeleton isError={true} />
                                    </div>
                                ) : ( */}
                                    <KendoGrid
                                        data={roles}
                                        pageable={true}
                                        noBoxShadow={true}
                                        settings={{
                                            total: roles?.length,
                                        }}
                                        sortable={false}
                                        column={[
                                            {
                                                field: 'securityGroupName',
                                                title: 'User role',
                                                filter: 'text',
                                                cell: ({ dataItem }) => (
                                                    <td>
                                                   {dataItem?.securityGroupName}
                                                    </td>
                                                ),
                                            },
                                            {
                                                field: 'action',
                                                title: 'Actions',
                                                width: 170,
                                                cell: ({ dataItem, dataIndex }) => {
                                                    const { isEditable, securityGroupId } = dataItem;
                                                    return (
                                                        <td>
                                                            <ul className="rs-list-inline rli-space-10 grid-view-icons">
                                                                <li>
                                                                    <RSTooltip
                                                                        text={
                                                                            isEditable ? EDIT : VIEW
                                                                        }
                                                                        position="top"
                                                                    >
                                                                        <div
                                                                            className={`
                                                                        ${
                                                                            getAccessStatus(
                                                                                isEditable,
                                                                                permissions,
                                                                            )
                                                                                ? ''
                                                                                : 'pe-none click-off'
                                                                        }
                                                                        `}
                                                                        >
                                                                            <i
                                                                                className={`${
                                                                                    isEditable
                                                                                        ? pencil_edit_medium
                                                                                        : eye_medium
                                                                                } icon-md color-primary-blue
                                                                        `}
                                                                                onClick={() => {
                                                                                    navigate(
                                                                                        '/preferences/roles-and-permissions/add-permissions',
                                                                                        {
                                                                                            state: {
                                                                                                mode: isEditable
                                                                                                    ? 'edit'
                                                                                                    : 'view',
                                                                                                data: dataItem,
                                                                                            },
                                                                                        },
                                                                                    );
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </RSTooltip>
                                                                </li>
                                                                {isEditable ? (
                                                                    <li>
                                                                        <RSTooltip text={DELETE} position="top">
                                                                            <div
                                                                                className={`${
                                                                                    !deleteAccess ? 'pe-none click-off' : ''
                                                                                }`}
                                                                            >
                                                                                <i
                                                                                    id="rs_RolesAndPermissions_delete"
                                                                                    className={`${delete_medium}  icon-md color-primary-red`}
                                                                                    onClick={() => {
                                                                                        if (deleteAccess) {
                                                                                            dispatchState({
                                                                                                type: 'UPDATE_DELETE_CONFIRMATION',
                                                                                                payload: {
                                                                                                    securityGroupId,
                                                                                                    index: dataIndex,
                                                                                                    isDelete: true,
                                                                                                },
                                                                                            });
                                                                                        }
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        </RSTooltip>
                                                                    </li>
                                                                ) : (
                                                                    <li className="pe-none click-off">
                                                                        <i
                                                                            id="rs_RolesAndPermissions_delete"
                                                                            className={`${delete_medium} icon-md color-primary-blue `}
                                                                        />
                                                                    </li>
                                                                )}
                                                            </ul>
                                                        </td>
                                                    );
                                                },
                                            },
                                        ]}
                                    />
                                {/* )} */}
                            </div>
                        </PreferencesSubPageSkeletonGate>
                    </Container>
                </div>
            </Container>

            <RSConfirmationModal
                show={internalState.isDelete}
                header={DELETE_USER_ROLE}
                isBorder
                text={ARE_YOU_SURE_DELETE}
                isLoading={isDeleteRoleLoading}
                blockBodyPointerEvents
                handleClose={() => {
                    if (isDeleteRoleLoading) return;
                    closeDeleteModal();
                }}
                handleConfirm={() => {
                    if (isDeleteRoleLoading) return;
                    handleDeleteGroup();
                }}
            />
            {getWarningPopupMessage(failureApiErrors, dispatch)}
        </div>
    );
};

export default RolesAndPermissions;
