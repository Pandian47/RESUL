import { getUserDetails } from 'Utils/modules/crypto';
import { getUserCurrentFormat } from 'Utils/modules/dateTime';

import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { CustomSkeleton } from 'Components/Skeleton/Components/SkeletonOverall';
import { CANCEL, DEACTIVATE_USER, JOB_FUNCTION, NO_RECORDS_FOUND, USER_DEACTIVATE_CONFIRMATION_DIALOG, USER_DEACTIVATE_PERMANENT_WARNING_1, USER_DEACTIVATE_PERMANENT_WARNING_2, USER_DEACTIVATE_PERMANENT_WARNING_TOOLTIP, USER_NAME } from 'Constants/GlobalConstant/Placeholders';
import { circle_plus_fill_medium, crown_fill_medium, pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useMemo, useState } from 'react';
import { get as _get } from 'Utils/modules/lodashReplacements';

import { Switch } from '@progress/kendo-react-inputs';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import KendoGrid from 'Components/RSKendoGrid';
import RSTooltip from 'Components/RSTooltip';
import usePermission from 'Hooks/usePersmission.js';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';
import RSModal from 'Components/RSModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';


import TruncatedCell from 'Components/RSKendoGrid/TruncateCell';

import { getSessionId, getGlobalBUList } from 'Reducers/globalState/selector';
import {
    assignRoleToUserCompanies,
    getUserList,
    getUserListNew,
    updateUserStatus,
} from 'Reducers/preferences/users/request';
import { updateUserLoadingState, updateUsersData } from 'Reducers/preferences/users/reducer';
import { updateCurrentPageConfig } from 'Reducers/globalState/reducer';
import { getUsersCount } from 'Reducers/preferences/users/selectors';
import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';

const UserListing = ({
    companies = false,
    fromUserManagement = false,
    deferInitialFetch = false,
    isAgencyValue = false,
    onFilterChange,
}) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const isAccountSettings = location?.pathname?.split('/')?.pop() === 'account-settings';
    const { users, isLoading, userLimitFailure, totalUsers } = useSelector(({ userReducer }) => userReducer);
    const { clientDetails } = useSelector(({ companiesReducer }) => companiesReducer);
    const { permissions } = usePermission();
    const usersCount = useSelector((state) => getUsersCount(state));
    const { licenseValue } = usersCount;
    const { updateAccess, addAccess } = permissions || {};
    const [initialPagination, setInitialPagination] = useState(false);
    const [userToDeactivate, setUserToDeactivate] = useState(null);

    const { licenseTypeId, isEnterprisePlus, isAgency, isclientUser } = getUserDetails();
    const { clientId, userId, departmentId, parentClientId, departmentName } = useSelector((state) =>
        getSessionId(state),
    );
    const { company_departmentId, company_clientId, company_departmentList } = useSelector(
        ({ globalstate }) => globalstate,
    );
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const departmentList = useSelector((state) => getGlobalBUList(state));
    const userListApi = useApiLoader({
        autoFetch: false,
        loaderConfig: { create: LOADER_TYPE.FIELD },
        mode: 'create',
    });
    const gridIsLoading = companies ? userListApi.isLoading || userListApi.isFetching : isLoading;

    useEffect(() => {
        if (deferInitialFetch) {
            setInitialPagination(true);
            return;
        }
        if (companies) {
            userListApi.refetch({
                fetcher: () =>
                    dispatch(
                        getUserListNew({
                            payload: {
                                clientId: isAgencyValue
                                    ? clientDetails?.clientId
                                    : companies
                                      ? company_clientId?.clientId
                                      : clientId,
                                departmentId: isAgencyValue
                                    ? 0
                                    : companies
                                      ? company_departmentId?.departmentId
                                      : departmentId,
                            },
                            loading: false,
                        }),
                    ),
                loaderConfig: { create: LOADER_TYPE.FIELD },
                mode: 'create',
            });
        } else {
            const payload = { clientId, userId, departmentId };
            payload.clientId = fromUserManagement
                ? company_clientId?.clientId
                : _get(clientDetails, 'clientId', clientId);
            payload.departmentId = fromUserManagement ? company_departmentId?.departmentId : departmentId;
            dispatch(getUserList({ payload }));
            dispatch(updateUserLoadingState(true));
        }
        setInitialPagination(true);
    }, [
        clientId,
        userId,
        departmentId,
        company_departmentId?.departmentId,
        company_clientId?.clientId,
        deferInitialFetch,
    ]);
    const getAssignUserDataCompanies = async () => {
        const payload = {
            clientId: parentClientId,
            // userId,
            // departmentId,
        };
        const res = await dispatch(assignRoleToUserCompanies({ payload }));
        if (res?.status) {
            setuserGridData(users.AssignUser);
        } else {
            setuserGridData([]);
        }
    };
    // useEffect(() => {
    //     //   getAssignUserDataCompanies();
    // }, [companies]);

    const handleChange = async (value, index, data) => {
        if (!value) {
            // Turning OFF -> show confirmation modal
            setUserToDeactivate(data);
            return;
        }

        // Turning ON -> proceed without confirmation
        const payload = {
            userId: data.userId,
            statusId: 1,
            clientId,
        };
        const { message, status } = await dispatch(updateUserStatus({ payload }));
        if (status) {
            dispatch(
                getUserList({
                    payload: {
                        clientId: fromUserManagement
                            ? company_clientId?.clientId
                            : _get(clientDetails, 'clientId', clientId),
                        departmentId: fromUserManagement ? company_departmentId?.departmentId : departmentId,
                        userId,
                    },
                    loading: fromUserManagement ? false : true,
                }),
            );
        }
    };

    const confirmDeactivation = async () => {
        if (!userToDeactivate) return;

        const payload = {
            userId: userToDeactivate.userId,
            statusId: 2,
            clientId,
        };
        const { status } = await dispatch(updateUserStatus({ payload }));
        if (status) {
            dispatch(
                getUserList({
                    payload: {
                        clientId: fromUserManagement
                            ? company_clientId?.clientId
                            : _get(clientDetails, 'clientId', clientId),
                        departmentId: fromUserManagement ? company_departmentId?.departmentId : departmentId,
                        userId,
                    },
                    loading: fromUserManagement ? false : true,
                }),
            );
        }
        setUserToDeactivate(null);
    };
    const gridData = useMemo(
        () => users?.map((user) => ({ ...user, statusLabel: user.statusId === 1 ? 'Active' : 'Inactive' })),
        [users],
    );

    const activeOnlyFilter = useMemo(
        () =>
            fromUserManagement
                ? {
                      logic: 'and',
                      filters: [
                          {
                              logic: 'or',
                              filters: [{ field: 'statusLabel', operator: 'eq', value: 'Active' }],
                          },
                      ],
                  }
                : null,
        [fromUserManagement],
    );

    useEffect(() => {
        if (activeOnlyFilter) {
            onFilterChange?.(activeOnlyFilter);
        }
        return () => {
            dispatch(updateUsersData([]));
        };
    }, []);

    if (!gridIsLoading && Array.isArray(users) && users.length === 0) {
        return (
            <RSSkeletonTable
                count={7}
                isAlertIcon={false}
                text
                message={
                    !fromUserManagement ? (
                        <>{NO_RECORDS_FOUND}</>
                    ) : (
                        <span
                            className={
                                !addAccess || totalUsers >= licenseValue || userLimitFailure ? 'pe-none click-off' : ''
                            }
                        >
                            Click
                            <i
                                onClick={() => {
                                    if (addAccess) {
                                        let LocationState = {
                                            mode: 'create',
                                            clientId: company_clientId?.clientId,
                                            from: 'userGrid',
                                        };
                                        navigate('/preferences/users/add-user', {
                                            state: LocationState,
                                        });
                                        dispatch(updateCurrentPageConfig({ state: LocationState }));
                                    }
                                }}
                                className={`${circle_plus_fill_medium} icon-md px5 color-primary-blue position-relative top4`}
                                id="rs_data_circle_plus_fill"
                            ></i>
                            to add a new user.
                        </span>
                    )
                }
            />
        );
    }
    return (
        <div>
            {/* filter value ["text","numeric","boolean","date"]. */}
            <KendoGrid
                data={gridData}
                noBoxShadow={companies}
                // pageable={true}
                scrollable={companies ? 'scrollable' : 'none'}
                isLoading={gridIsLoading}
                isFailure={!gridIsLoading && !users?.length}
                settings={{
                    total: gridData?.length,
                }}
                initialFilter={activeOnlyFilter}
                callbackFilterChange={(filter) => onFilterChange?.(filter)}
                isCustomBox={fromUserManagement ? false : true}
                isCustomClass="rs-userListing-grid"
                column={[
                    {
                        field: 'firstName',
                        filter: 'text',
                        title: 'Name',
                        width: !companies ? 170 : 200,
                        cell: (props) => {
                            return (
                                <td>
                                    {companies || userId === props?.dataItem?.userId ? (
                                        <div className="d-inline-flex">
                                            <TruncatedCell value={props.dataItem?.firstName} noTable={true} />
                                        </div>
                                    ) : (
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="editable-container">
                                                <TruncatedCell value={props.dataItem?.firstName} noTable={true} />
                                            </div>
                                            {props.dataItem?.isKeyPerson &&
                                                (props.dataItem?.role === 'Superuser' ||
                                                    props.dataItem?.role === 'Admin') && (
                                                    <RSTooltip text="Key contact" position="top" innerContent={false}>
                                                        <i
                                                            className={`${crown_fill_medium} color-primary-orange icon-md cursor-normal ml5`}
                                                        />
                                                    </RSTooltip>
                                                )}
                                        </div>
                                    )}
                                </td>
                            );
                        },
                    },
                    {
                        field: 'jobFunction',
                        filter: 'text',
                        title: 'Job title',
                        width: !companies ? 200 : 201,
                    },
                    {
                        field: 'role',
                        filter: 'text',
                        title: 'Role',
                        width: !companies ? 150 : 200,
                        cell: (props) => {
                            return (
                                <td>
                                    <div>
                                        <span>{props?.dataItem?.role ? props?.dataItem?.role : 'Not Assigned'}</span>
                                    </div>
                                </td>
                            );
                        },
                    },

                    ...((licenseTypeId === '3' && company_departmentId?.departmentName?.toLowerCase() === 'all') ||
                    companies
                        ? [
                              {
                                  field: 'departmentName',
                                  filter: 'text',
                                  title: 'Business unit',
                                  width: !companies ? 180 : 200,
                                  cell: (props) => <TruncatedCell value={props.dataItem?.departmentName} />,
                              },
                          ]
                        : []),
                    ...(isEnterprisePlus
                        ? [
                              {
                                  field: 'clientName',
                                  filter: 'text',
                                  title: 'Company',
                                  width: !companies ? 180 : 250,
                                  cell: (props) => <TruncatedCell value={props.dataItem?.clientName} />,
                              },
                          ]
                        : []),
                    ...(isAgencyValue
                        ? [
                              {
                                  field: 'clientName',
                                  filter: 'text',
                                  title: 'Clients',
                                  width: !companies ? 200 : 250,
                                  cell: (props) => <TruncatedCell value={props.dataItem?.clientName} />,
                              },
                          ]
                        : []),
                    ...(!companies
                        ? [
                              {
                                  field: 'lastLogInTime',
                                  filter: 'date',
                                  title: 'Last login time',
                                  width: 200,
                                  cell: (props) => {
                                      return (
                                          <td>
                                              <div>
                                                  {/* <span>{props?.dataItem?.lastLogInTime ? getUserDateTimeFormat(props?.dataItem?.lastLogInTime, 'formatDateTime')  : 'NA'}</span> */}
                                                  <span>
                                                      {props?.dataItem?.lastLogInTime
                                                          ? getUserCurrentFormat(props?.dataItem?.lastLogInTime)
                                                                ?.dateTimeFormat
                                                          : 'NA'}
                                                  </span>
                                              </div>
                                          </td>
                                      );
                                  },
                              },
                          ]
                        : []),
                    ...(!companies
                        ? [
                              {
                                  field: 'statusLabel',
                                  filter: 'text',
                                  title: 'Status',
                                  width: !companies ? 110 : 130,
                                  sortable: false,
                                  cell: (props) => {
                                      const statusSwitch = (
                                          <Switch
                                              className="mt0 ml-0"
                                              disabled={!updateAccess || userId === props?.dataItem?.userId}
                                              onChange={(e) =>
                                                  handleChange(e.target.value, props.dataIndex, props.dataItem)
                                              }
                                              checked={props.dataItem?.statusId === 1 ? true : false}
                                          />
                                      );

                                      const statusContent = (
                                          <div className="d-flex align-items-center">
                                              <div
                                                  className={
                                                      (props.dataItem?.statusId !== 1 && totalUsers >= licenseValue) ||
                                                      !updateAccess ||
                                                      userId === props?.dataItem?.userId ||
                                                      userLimitFailure
                                                          ? 'pe-none click-off'
                                                          : ''
                                                  }
                                              >
                                                  {statusSwitch}
                                              </div>
                                          </div>
                                      );

                                      return (
                                          <td>
                                              {props.dataItem?.statusId !== 1 ? (
                                                  <RSTooltip
                                                      text={USER_DEACTIVATE_PERMANENT_WARNING_TOOLTIP}
                                                      position="top"
                                                      className="rs-userListing-status-switch"
                                                  >
                                                      {statusContent}
                                                  </RSTooltip>
                                              ) : (
                                                  statusContent
                                              )}
                                              {/* <span>{props.dataItem?.statusId === 1 ? 'Active' : 'Inactive'}</span> */}
                                          </td>
                                      );
                                  },
                              },
                          ]
                        : []),
                    ...(!companies
                        ? [
                              {
                                  field: 'status',
                                  //   filter: 'text', //'boolean',
                                  title: 'Actions',
                                  sortable: false,
                                  width: !companies ? 120 : 200,
                                  cell: (props) => {
                                      return (
                                          <td>
                                              <div className="d-flex align-items-center ">
                                                  {userId !== props?.dataItem?.userId && (
                                                      <span
                                                          className="mr17"
                                                          onClick={() => {
                                                              const LocationState = {
                                                                  mode: 'edit',
                                                                  userId: props.dataItem?.userId,
                                                                  clientId: company_clientId?.clientId,
                                                                  from: 'userGrid',
                                                              };
                                                              navigate('/preferences/users/add-user', {
                                                                  state: LocationState,
                                                              });
                                                              dispatch(
                                                                  updateCurrentPageConfig({ state: LocationState }),
                                                              );
                                                          }}
                                                      >
                                                          {/* <div className="editable-container"> */}
                                                          {/* <div className="edit-icon-wrapper"> */}
                                                          <RSTooltip
                                                              text="Edit user"
                                                              position="top"
                                                              innerContent={false}
                                                          >
                                                              <i
                                                                  className={`${pencil_edit_medium} color-primary-blue edit-icon icon-md lh0 position-relative top5`}
                                                              />
                                                          </RSTooltip>
                                                          {/* </div> */}
                                                          {/* </div> */}
                                                      </span>
                                                  )}
                                              </div>
                                          </td>
                                      );
                                  },
                              },
                          ]
                        : []),
                ]}
                pagerChange={initialPagination}
                setInitialPagination={setInitialPagination}
            />

            {userToDeactivate && (
                <RSModal
                    show={!!userToDeactivate}
                    handleClose={() => setUserToDeactivate(null)}
                    header={USER_DEACTIVATE_CONFIRMATION_DIALOG}
                    size="lg"
                    body={
                        <div className="">
                            <div className="d-flex mb21 align-items-center">
                                <label className="control-label-left mb0" style={{ minWidth: '120px' }}>
                                    {USER_NAME}
                                </label>
                                <span className="mr10">:</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    {' '}
                                    <TruncatedCell
                                        value={`${userToDeactivate?.firstName || ''} ${userToDeactivate?.lastName || ''}`.trim()}
                                        noTable
                                    />
                                </div>
                            </div>
                            <div className="d-flex mb21 align-items-center">
                                <label className="control-label-left mb0" style={{ minWidth: '120px' }}>
                                    {JOB_FUNCTION}
                                </label>
                                <span className="mr10">:</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    {' '}
                                    <TruncatedCell value={userToDeactivate?.jobFunction || 'NA'} noTable />
                                </div>
                            </div>

                            <p>{USER_DEACTIVATE_PERMANENT_WARNING_1}</p>
                            <p>{USER_DEACTIVATE_PERMANENT_WARNING_2}</p>
                        </div>
                    }
                    footer={
                        <div className="buttons-holder mt0">
                            <RSSecondaryButton onClick={() => setUserToDeactivate(null)}>
                                {CANCEL}
                            </RSSecondaryButton>
                            <RSPrimaryButton onClick={confirmDeactivation}>
                                {DEACTIVATE_USER}
                            </RSPrimaryButton>
                        </div>
                    }
                />
            )}
            {getWarningPopupMessage(failureApiErrors, dispatch)}
        </div>
    );
};

export default UserListing;
