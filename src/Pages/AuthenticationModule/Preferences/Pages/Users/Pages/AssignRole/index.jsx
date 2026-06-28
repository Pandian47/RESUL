import { getPermissions } from 'Utils/modules/crypto';

import { assignUser } from 'Assets/Images';
import { ADD_NEW_USER, BUSINESS_UNIT, CANCEL, SAVE, SELECT_BU } from 'Constants/GlobalConstant/Placeholders';
import { circle_info_mini, circle_minus_fill_medium, circle_plus_fill_edge_medium, circle_question_mark_mini, retarget_list_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import _get from 'lodash/get';
import _find from 'lodash/find';
import _orderBy from 'lodash/orderBy';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFormContext, useFieldArray, useWatch } from 'react-hook-form';
import RSTooltip from 'Components/RSTooltip';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { assignRoleToUser, removeAssignUser, getUserLimit, getUserListing } from 'Reducers/preferences/users/request';
import { getUserDetails } from 'Utils/modules/crypto';
import { getUserRoles, getUsersCount, getUsersList, getActiveUsersCount } from 'Reducers/preferences/users/selectors';
import { getSessionId } from 'Reducers/globalState/selector';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';
import usePermission from 'Hooks/usePersmission';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';
import RSConfirmationModal from 'Components/ConfirmationModal';
import { buildPayloadAssignUser } from '../../constant';

import RenderFields from './RenderFields';
import RSModal from 'Components/RSModal';
import RSSearchField from 'Components/RSSearchField';
import usePreferencesSubPageApi from 'Hooks/usePreferencesSubPageApi';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';
import PreferencesSubPageSkeletonGate from 'Components/Skeleton/Components/PreferencesSubPageSkeletonGate';
import { PREFERENCES_SUBPAGE_VARIANT } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';

export const expandedState = (item = [], expanded) => {
    const nextExpanded = expanded.slice();
    const itemKey = item?.['id'] || 0;
    const index = expanded?.indexOf(itemKey);
    index === -1 ? nextExpanded?.push(itemKey) : nextExpanded?.splice(index, 1);
    return nextExpanded;
};

const AssignRole = ({
    back,
    companies = false,
    currentPage,
    companyBack,
    c_clientId,
    isAgencyValue = false,
    currentLicenseTypeId,
    setCurrentPage,
    onAssignRolePageLoadingChange,
}) => {
    const { control, setValue, handleSubmit, getValues, watch } = useFormContext();
    // console.log('watch: ', watch());

    const {
        fields: userFields,
        remove,
        replace,
    } = useFieldArray({
        control,
        name: 'assignRole',
    });
    // console.log('userFields: ', userFields);
    const brandCompanystatus = {
        1: 'GHQ',
        2: 'RHQ',
        3: 'LOC',
    };
    const branchTypeConfig = {
        1: { type: 'GHQ', level: 0 },
        2: { type: 'RHQ', level: 1 },
        3: { type: 'LOC', level: 2 },
    };

    const assignRole = useWatch({
        control,
        name: 'assignRole',
    });
    // console.log('assignRole: ', assignRole);
    const { permissions } = usePermission();
    const permissionList = getPermissions();
    const { deleteAccess, addAccess, updateAccess, viewAccess } = _find(permissionList, { featureId: 12 });
    const assignRoleData = watch('assignRole');
    // const deleteAccess = _get(permissions, 'deleteAccess', true);
    // const addAccess = _get(permissions, 'addAccess', true);
    const location = useLocation();
    const [confirmationModal, setConfimrationModal] = useState(false);
    const { licenseTypeId, parentClientId, isAgency, isEnterprisePlus, clientId: AgencyClientID } = getUserDetails();
    const { userId, departmentId, clientId, departmentName } = useSelector((state) => getSessionId(state));
    const { clientDetails } = useSelector(({ companiesReducer }) => companiesReducer);
    const { company_departmentId, company_clientId, company_departmentList, currentPageConfig } = useSelector(
        ({ globalstate }) => globalstate,
    );
    const fromUser = currentPageConfig?.state?.from === 'userGrid';
    const [currClient, setCurrClient] = useState(company_clientId?.clientId || clientId);
    const [currDepartment, setCurrDepartment] = useState(0);
    const [currType, setCurrType] = useState(null);

    const { isFailure, userLimitFailure, totalUsers } = useSelector(({ userReducer }) => userReducer);
    const users = useSelector((state) => getUsersList(state));
    const activeUsersCount = useSelector((state) => getActiveUsersCount(state));
    const userRoles = useSelector((state) => getUserRoles(state));
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [userCreate, setUserCreate] = useState(false);
    const [dropdownData, setDropdownData] = useState([]);
    const [userListWithoutRole, setuserListWithoutRole] = useState([]);
    // console.log('userListWithoutRole: ', userListWithoutRole);
    const [responseApiData, setResponseApiData] = useState({});
    const [warningModal, setWarningModal] = useState({
        show: false,
        data: {},
        index: null,
        userId: null,
    });
    const [confirmedSelectedBUIds, setConfirmedSelectedBUIds] = useState([]);
    const [tempSelectedBUIds, setTempSelectedBUIds] = useState([]);
    const [defName, setDefName] = useState({
        id: 0,
        name: '',
        departmentId: null,
    });
    const [active, setActive] = useState([]);
    const [selectedUserPopupId, setSelectedUserPopupId] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [checkedEntityIds, setCheckedEntityIds] = useState([]);
    const [entityDropdownOpen, setEntityDropdownOpen] = useState(false);

    const usersCount = useSelector((state) => getUsersCount(state));
    const { licenseValue } = usersCount;

    const effectiveLicenseTypeId = useMemo(() => {
        const stateVal = location?.state?.licenseTypeId;
        const candidate = currentLicenseTypeId ?? stateVal ?? licenseTypeId;
        const parsed = parseInt(candidate, 10);
        return Number.isFinite(parsed) ? parsed : null;
    }, [currentLicenseTypeId, location?.state?.licenseTypeId, licenseTypeId]);

    const isLicenseType12 = effectiveLicenseTypeId === 1 || effectiveLicenseTypeId === 2;

    const unifiedUserList = useMemo(() => {
        const { userList = [], assignUser = [], clientDetails = [] } = responseApiData;

        // ✅ Map using composite key: clientID_departmentID and clientNameMap
        const deptMap = {};
        const clientNameMap = {};

        clientDetails.forEach((client) => {
            const clientId = client.clientID;
            clientNameMap[clientId] = client.clientName;

            (client.departmentList || []).forEach((dept) => {
                const key = `${clientId}_${dept.departmentID}`;
                deptMap[key] = dept.departmentName;
            });
        });

        // ✅ Group assignments by userID
        const assignmentsByUser = {};

        assignUser.forEach((assign) => {
            if (!assignmentsByUser[assign.userID]) {
                assignmentsByUser[assign.userID] = [];
            }

            if (assign.departmentId > 0) {
                const deptKey = `${assign.clientID}_${assign.departmentId}`;

                assignmentsByUser[assign.userID].push({
                    ...assign,
                    departmentName: deptMap[deptKey] || 'Unknown BU',
                    clientName: clientNameMap[assign.clientID] || 'Unknown Entity',
                });
            }
        });

        let list = userList.map((user) => {
            const userId = user.userID;
            const assignments = assignmentsByUser[userId] || [];

            return {
                ...user,
                assignments,
                isAssigned: assignments.length > 0,
            };
        });

        const { type, clientID, departmentID } = currType || {};

        // ✅ Filtering logic
        if (type === 'RHQ' || type === 'LOC') {
            list = list.filter((user) => user.clientID === clientID);
        } else if (type === 'BU') {
            list = list.filter((user) =>
                user.assignments.some((assign) => assign.clientID === clientID && assign.departmentId === departmentID),
            );
        }

        if (searchText) {
            const query = searchText.toLowerCase();
            list = list.filter(
                (user) =>
                    user.firstName?.toLowerCase().includes(query) ||
                    user.lastName?.toLowerCase().includes(query) ||
                    `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(query),
            );
        }

        return list;
    }, [responseApiData, currClient, currDepartment, currType, searchText]);

    const modalUser = useMemo(() => {
        return unifiedUserList.find((u) => (u.userID || u.userId) === selectedUserPopupId);
    }, [unifiedUserList, selectedUserPopupId]);

    // console.log('unifiedUserList: ', unifiedUserList);
    useEffect(() => {
        if (unifiedUserList) {
            setValue('unifiedUserList', unifiedUserList);
        }
    }, [unifiedUserList]);
    const stateClientName = _get(location, 'state.clientName', clientDetails?.childClientName);
    const stateClientId = parentClientId;

    const clientRes = responseApiData?.clientDetails || [];
    const clientDatata = useMemo(() => {
        if (!Array.isArray(clientRes) || clientRes === 0) {
            return [];
        }

        const result = [];

        clientRes.forEach((client) => {
            if (!client) return;

            const { clientName = '', clientBranchTypeID, departmentList, ...rest } = client;

            const config = branchTypeConfig?.[clientBranchTypeID] || {};
            const type = config.type || '';
            const hierarchyLevel = config.level ?? 0;

            // Main client row
            result.push({
                ...rest,
                clientID: client.clientID,
                name: type ? `${clientName} (${type})` : clientName,
                type,
                hierarchyLevel,
            });

            // Department rows (BU)
            if (Array.isArray(departmentList) && departmentList.length > 0) {
                departmentList.forEach((dept) => {
                    if (!dept) return;

                    result.push({
                        clientID: client.clientID,
                        name: dept.departmentName || '',
                        departmentID: dept.departmentID,
                        type: 'BU',
                        hierarchyLevel: 3,
                    });
                });
            }
        });

        // First pass: assign stable ids
        const withIds = result.map((item, ind) => ({
            ...item,
            id: `${item?.clientID}-${item?.type}-${ind}`,
        }));

        // Build a map: clientID → id of the first non-BU entry for that client
        const companyIdByClientID = {};
        withIds.forEach((item) => {
            if (item.type !== 'BU' && !companyIdByClientID[item.clientID]) {
                companyIdByClientID[item.clientID] = item.id;
            }
        });

        // Second pass: add parentId so the tree renderer can build the hierarchy
        return withIds.map((item) => {
            if (item.type === 'BU') {
                // BU → parent is the company with the same clientID
                return { ...item, parentId: companyIdByClientID[item.clientID] || null };
            }
            // Company (GHQ/RHQ/LOC) → use parentClientId from API if available
            const parentClientId = item.parentClientId ?? null;
            const resolvedParentId =
                parentClientId != null ? companyIdByClientID[parentClientId] ?? null : null;
            return { ...item, parentId: resolvedParentId };
        });
    }, [clientRes]);

    useEffect(() => {
        if (!!clientDatata?.length) {
            const res = clientDatata?.find((item) => item?.type === 'GHQ') || clientDatata?.[0];
            setCurrType(res);
        }
    }, [clientDatata]);
    // console.log('clientDatata: ', clientDatata);

    const getAssignUserData = async (clientIdToUse = null, departmentIdToUse = null) => {
        let payload = {};
        const targetClientId = clientIdToUse !== null ? clientIdToUse : currClient;
        const targetDepartmentId = departmentIdToUse !== null ? departmentIdToUse : currDepartment;

        if ((companies === undefined || !companies) && !fromUser) {
            payload = {
                clientId: targetClientId,
                departmentId: targetDepartmentId,
                userId,
            };
        } else if (isAgencyValue) {
            payload = {
                departmentId: 0,
                clientId: AgencyClientID,
            };
        } else {
            payload = {
                departmentId: targetDepartmentId,
                clientId: targetClientId,
            };
        }

        //const ressponse = await dispatch(getAssignUserList({ payload }));
        const response = await dispatch(
            getUserListing({ payload: { ...payload, userId }, loading: false }),
        );
        if (response?.status) {
            setResponseApiData(response?.data);
        } else {
            setResponseApiData({});
        }
        if (response?.totalUser > 0) {
            setUserCreate(true);
        } else {
            setUserCreate(false);
        }
    };

    const assignRolePageApi = usePreferencesSubPageApi({
        deps: [
            company_clientId?.clientId,
            company_departmentId?.departmentId,
            userId,
            effectiveLicenseTypeId,
            isAgencyValue,
            companies,
            fromUser,
        ],
        fetcher: async () => {
            await getAssignUserData();
            const limitPayload = {
                licenseTypeId: isAgencyValue
                    ? 0
                    : effectiveLicenseTypeId ?? parseInt(licenseTypeId, 10),
                licenseFeatureId: isAgencyValue ? 39 : 40,
            };
            await dispatch(getUserLimit({ payload: limitPayload, loading: false }));
        },
    });
    const assignRoleSaveApi = useApiLoader({ autoFetch: false });
    const isAssignRoleSaveLoading = assignRoleSaveApi.isFetching;

    useEffect(() => {
        if (companies) {
            onAssignRolePageLoadingChange?.(assignRolePageApi.isPageLoading);
        }
    }, [companies, onAssignRolePageLoadingChange, assignRolePageApi.isPageLoading]);

    const addNewRole = (currentDropDown) => {
        let unAssignedUserList = [];
        let withRole = [...assignRole];
        // console.log(userListWithoutRole, 'userListWithoutRole');
        userListWithoutRole.forEach((user) => {
            if (active.includes(user.userId)) {
                if (user?.departmentId === 0) {
                    const matched = assignRole.filter((assign) => {
                        return (
                            currentDropDown?.name?.toLowerCase()?.replace(/\s+/g, '') ===
                            assign?.groupId?.toLowerCase()?.replace(/\s+/g, '')
                        );
                    });
                    if (matched?.length === 0 || !matched.some((match) => match?.userId === user?.userId)) {
                        withRole.push({
                            ...user,
                            selectedRole: '',
                            clientId:
                                currentDropDown?.clientId === user?.clientId ? user?.clientId : currentDropDown?.id,
                            groupId: currentDropDown?.name,
                            departmentId: currentDropDown?.departmentId ?? 0,
                        });
                    }
                } else {
                    const alreadyAssigned = withRole.some(
                        (role) => role.userId === user.userId && role.groupId === currentDropDown?.name,
                    );
                    if (!alreadyAssigned) {
                        withRole.push({
                            ...user,
                            selectedRole: '',
                            clientId:
                                currentDropDown?.clientId === user?.clientId ? user?.clientId : currentDropDown?.id,
                            groupId: currentDropDown?.name,
                            departmentId: currentDropDown?.departmentId ?? 0,
                        });
                    }
                }
            } else {
                unAssignedUserList.push(user);
            }
        });
        withRole = _orderBy(withRole, ['groupId'], ['asc']);
        withRole = _orderBy(withRole, ['clientId'], ['asc']);
        replace(withRole);
        setuserListWithoutRole(unAssignedUserList);
        setActive([]);
    };

    const handleRemoveUserRole = async (data, index, currentDropDown) => {
        // debugger;
        if (
            data?.groupId?.toLowerCase()?.replaceAll(/\s+/g, '') !==
                currentDropDown?.toLowerCase()?.replaceAll(/\s+/g, '') &&
            data?.departmentId > 0
        ) {
            setuserListWithoutRole((pre) => [...pre]);
        } else if (data?.departmentId === 0) {
            if (data?.clientId === Number(parentClientId) + 1) {
                setuserListWithoutRole((pre) => {
                    return [...pre, data];
                });
            } else {
                setuserListWithoutRole((pre) => [
                    ...pre,
                    {
                        ...data,
                        clientId: Number(parentClientId) + 1,
                    },
                ]);
            }
        } else {
            setuserListWithoutRole((pre) => [...pre, data]);
        }

        remove(index);
    };

    const addNewRoleFunc = () => {
        let newAssignUser = [...assignRole];

        const selectedUsers = userListWithoutRole?.filter((user) => active.includes(user.userID)) || [];
        const confirmedBUs = clientDatata?.filter((bu) => confirmedSelectedBUIds.includes(bu.id)) || [];

        if (confirmedBUs.length === 0) {
            // Fallback for single selection if no multiple BUs confirmed
            if (currDepartment !== 0) {
                const singleBU = clientDatata.find((b) => b.departmentID === currDepartment && b.type === 'BU');
                if (singleBU) confirmedBUs.push(singleBU);
            }
        }

        confirmedBUs.forEach((bu) => {
            selectedUsers.forEach((user) => {
                const alreadyAssigned = newAssignUser.some(
                    (role) => role.userID === user.userID && role.groupId === bu.name,
                );
                if (!alreadyAssigned) {
                    newAssignUser.push({
                        ...user,
                        selectedRole: '',
                        clientId: bu.clientID,
                        groupId: bu.name,
                        departmentId: bu.departmentID ?? 0,
                    });
                }
            });
        });

        const remaining = userListWithoutRole.filter((user) => !active.includes(user.userID));
        setuserListWithoutRole(remaining);
        replace(_orderBy(newAssignUser, ['groupId'], ['asc']));
        setActive([]);
    };

    const handleRemoveUserRoleFunc = async (field, index) => {
        let RemainingAssignUser = [];
        const targetUserId = field?.userID || field?.userId;
        const targetRoleId = field?.roleID || field?.roleId;

        let newUnAssignUser = [];
        if (field?.isEnabled || field?.roleID) {
            const payload = {
                userId, // current session user
                departmentId: field?.departmentId,
                clientId: isAgencyValue
                    ? clientDetails?.clientId
                    : companies || fromUser
                    ? company_clientId?.clientId
                    : clientId,
                userRoleList: [
                    {
                        userId: targetUserId,
                        roleId: targetRoleId,
                        clientId: field?.clientID || field?.clientId,
                        IsKeyPerson: field?.isKeyPerson,
                    },
                ],
            };
            const { status, data: result } = await dispatch(removeAssignUser({ payload }));
            if (status) {
                await getAssignUserData();
            }
        } else {
            assignRole?.forEach((assignUser) => {
                if (assignUser?.userId === field?.userId) {
                    {
                        (field.isKeyPerson = false), (field.selectedRole = {});
                        field.userTypeId = 4;
                    }
                    // console.log('field:@@@@ ', field);
                    newUnAssignUser.push(field);
                } else {
                    RemainingAssignUser.push(assignUser);
                }
            });

            const orderByAssignUser = _orderBy(RemainingAssignUser, [(data) => data?.firstName], ['asc']);
            const orderByUnAssignUser = _orderBy(newUnAssignUser, [(data) => data?.firstName], ['asc']);

            replace(orderByAssignUser);
            setuserListWithoutRole((pre) => [...pre, orderByUnAssignUser[0]]);
        }
    };


    useEffect(() => {
        // replace([]);
        //setuserListWithoutRole([]);
    }, [company_departmentId, c_clientId]);
    const [pophoveHide, setPophoveHide] = useState(false);
    const scrollDivRef = useRef(null);
    const handleScroll = () => {
        setPophoveHide(scrollDivRef.current.scrollTop > 0);
    };

    const clientList = useMemo(() => {
        return (
            responseApiData?.clientDetails?.map((item) => ({
                ...item,
                clientName: `${item?.clientName} (${brandCompanystatus?.[item?.clientBranchTypeID] || ''})`,
            })) || []
        );
    }, [responseApiData?.clientDetails, brandCompanystatus]);

    const defaultCompany = useMemo(() => {
        // Find in clientDatata since it has the hierarchy items including BUs
        return clientDatata?.find((item) => item?.id === currType?.id);
    }, [currType, clientDatata]);

    const depList = useMemo(() => {
        const firstClient = responseApiData?.clientDetails?.[0];
        const list = firstClient?.departmentList || [];
        return [
            { departmentName: 'Select BU', departmentId: 0 },
            ...(list.filter((item) => item?.departmentName?.toLowerCase() !== 'all') || []),
        ];
    }, [responseApiData?.clientDetails]);

    const defaultDepartment = useMemo(() => {
        //return responseApiData?.DepartmentDetails?.find((item) => item.clientId === currDepartment);
        const dep = depList?.filter((item) => item.departmentName.toLowerCase() !== 'all') || [];
        const currDep = dep?.find((item) => item.departmentId == currDepartment) || dep?.[0];

        return currDep || {};
    }, [currDepartment, depList]);

    // Check if first dropdown has RHQ selected (clientBranchtypeId === 2)
    const isFirstDropdownRHQ = useMemo(() => {
        return defaultCompany?.clientBranchtypeId === 2;
    }, [defaultCompany]);

    // Check if first dropdown has LOC selected (clientBranchtypeId === 3)
    const isFirstDropdownLOC = useMemo(() => {
        return defaultCompany?.clientBranchtypeId === 3;
    }, [defaultCompany]);

    const handleEntityCheck = (item, checked) => {
        setCheckedEntityIds((prev) =>
            checked ? [...prev, item.id] : prev.filter((id) => id !== item.id),
        );
    };

    const handleCancelSelection = () => {
        setCheckedEntityIds([]);
        setEntityDropdownOpen(false);
    };

    const handleAssign = () => {
        const selectedUsers = unifiedUserList?.filter((user) => active.includes(user.userID)) || [];
        const selectedEntitiesRaw = clientDatata?.filter((it) => checkedEntityIds.includes(it.id)) || [];
        const selectedEntities = isLicenseType12
            ? selectedEntitiesRaw
                  .filter((it) => it?.type !== 'BU')
                  .map((it) => ({ ...it, departmentID: 1 }))
            : selectedEntitiesRaw.filter((it) => it?.type === 'BU');

        if (selectedUsers.length === 0 || selectedEntities.length === 0) return;
        let currentAssignedData = [...(getValues('assignRole') || [])];

        selectedUsers.forEach((user) => {
            const existingUserIndex = currentAssignedData.findIndex((u) => u.userID === user.userID);

            // Convert pre-existing DB assignments into form structure
            const preExistingBUs = (user.assignments || []).map((assign) => {
                const uId =
                    clientDatata?.find(
                        (item) =>
                            item?.type === 'BU' &&
                            item?.name === assign?.departmentName &&
                            item?.clientID === assign?.clientID,
                    )?.id || `${assign.clientID}-BU-${assign.departmentId}`;
                return {
                    id: uId,
                    name: assign.departmentName,
                    departmentID: assign.departmentId,
                    clientID: assign.clientID,
                    roleId: assign.roleID,
                    role: assign.roleName,
                    isKeyPerson: assign.isKeyPerson,
                    isEnabled: true,
                    selectedRole: { groupId: assign.roleID, groupSecurity: assign.roleName },
                };
            });

            const combinedBUs = [...preExistingBUs, ...selectedEntities].reduce((acc, current) => {
                const x = acc.find((item) => item.id === current.id);
                return x ? acc : acc.concat([current]);
            }, []);

            if (existingUserIndex > -1) {
                const stagedBUs = currentAssignedData[existingUserIndex].selectedBUs || [];
                const finalBUs = [...stagedBUs, ...combinedBUs].reduce((acc, current) => {
                    const x = acc.find((item) => item.id === current.id);
                    return x ? acc : acc.concat([current]);
                }, []);
                currentAssignedData[existingUserIndex] = {
                    ...currentAssignedData[existingUserIndex],
                    selectedBUs: finalBUs,
                };
            } else {
                currentAssignedData.push({ ...user, selectedBUs: combinedBUs });
            }
        });

        replace(currentAssignedData);
        setActive([]);
        setCheckedEntityIds([]);
        setEntityDropdownOpen(false);
    };

    const handleSaveAssignRole = async (formState) => {
        const { assignRole, unifiedUserList = [] } = formState;
        const client = isAgencyValue
            ? clientDetails?.clientId
            : companies || fromUser
            ? company_clientId?.clientId
            : clientId;
        const department = isAgencyValue
            ? 0
            : isLicenseType12
            ? 1
            : companies
            ? company_departmentId?.departmentId
            : company_departmentId?.departmentId;
        const payload = buildPayloadAssignUser(assignRole, client, department, userId, unifiedUserList);

        await assignRoleSaveApi.refetch({
            fetcher: () => dispatch(assignRoleToUser(payload, undefined, false)),
            loaderConfig: { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.GLOBAL },
        });
    };

    const assignRoleBody = (
        <Fragment>
            {true ? (
                <div className="box-design rs-box rs-assign-role">
                    <Row className="mb10 res-gx-0">
                        {true && (
                            <>
                                <Col md={3} className="pr0 ">
                                    <div className="d-flex justify-content-between align-items-center position-relative">
                                        {/* First Dropdown - All Companies (GHQ + RHQ + LOC + BU) */}
                                        <div className="mr3">
                                            <RSBootstrapdown
                                                data={clientDatata || []}
                                                isObject
                                                isActive
                                                fieldKey="name"
                                                idKey="id"
                                                isCustomHover
                                                showSearch
                                                alignRight
                                                isFullHierarchyUI
                                                isTruncateTitle
                                                truncateTitleLength={16}
                                                defaultItem={defaultCompany}
                                                onSelect={async (value, index) => {
                                                    if (!value) return;
                                                    setCurrClient(value.clientID);
                                                    setCurrDepartment(value.departmentID || 0);
                                                    setCurrType(value);
                                                    setActive([]); // Clear selection when filter changes
                                                }}
                                            />
                                        </div>
                                        <RSSearchField
                                            searchedText={(val) => setSearchText(val)}
                                            placeholder="Search.."
                                            debounceOnChange
                                        />
                                    </div>
                                </Col>
                                <Col md={1}></Col>
                                <Col
                                    md={7}
                                    className="d-flex justify-content-between gap-2"
                                >
                                    <RSBootstrapdown
                                        data={
                                            isLicenseType12
                                                ? (clientDatata?.filter((item) => item?.type !== 'BU') || [])
                                                : (clientDatata || [])
                                        }
                                        isObject
                                        isActive
                                        fieldKey="name"
                                        idKey="id"
                                        filterable
                                        isFullHierarchyUI
                                        isCheckbox
                                        checkedItems={checkedEntityIds}
                                        onCheckChange={handleEntityCheck}
                                        disabledTypes={isLicenseType12 ? [] : ['GHQ', 'RHQ', 'LOC']}
                                        isCustomHover
                                        alignRight
                                        disabled={active?.length === 0}
                                        controlledShow={entityDropdownOpen}
                                        onToggle={(next) => setEntityDropdownOpen(next)}
                                        defaultItem={{
                                            name: isLicenseType12 ? 'Select Company(s)' : 'Select Business unit(s)',
                                        }}
                                        onSelect={() => {}}
                                        footerContent={
                                            <div className="align-items-center d-flex justify-content-end mt5 mr7">
                                                <RSSecondaryButton onClick={handleCancelSelection}     className="rs-cancel-btn"
>
                                                    Cancel
                                                </RSSecondaryButton>
                                                <RSPrimaryButton onClick={handleAssign} className="rs-assign-btn">
                                                    Select
                                                </RSPrimaryButton>
                                            </div>
                                        }
                                    />
                                </Col>
                            </>
                        )}
                        <Col>
                            <ul className="rs-list-group-horizontal jc-right">
                                <li
                                    className={
                                        !addAccess
                                            ? 'click-off'
                                            : activeUsersCount >= licenseValue || userLimitFailure
                                                ? 'click-off'
                                                : ''
                                    }
                                    onClick={() => {
                                        if (addAccess) back('ADDUSER');
                                    }}
                                >
                                    <RSTooltip position="top" text={ADD_NEW_USER}>
                                        <i
                                            id="rs_data_circle_plus_fill_edge"
                                            className={`${circle_plus_fill_edge_medium} icon-md primary-color icon-hover-shadow-primary`}
                                        ></i>
                                    </RSTooltip>
                                </li>
                            </ul>
                        </Col>
                    </Row>

                    <Row className={`res-gx-0 ${!addAccess ? 'pe-none' : ''} `}>
                        <Col
                            md={3}
                            className="box-design assign-roleusers-list css-scrollbar p0 position-relative no-box-shadow"
                        >
                            {/* <UnAssignList /> */}
                            {unifiedUserList?.length ? (
                                <ul className="list-group">
                                    {unifiedUserList?.map((user, index) => {
                                        const fullName = `${user?.firstName} ${user?.lastName}`;
                                        const isSelected = active.includes(user?.userID);
                                        const assignmentsCount = user.assignments?.length || 0;

                                        return (
                                            <li
                                                key={user?.userID}
                                                className={`list-group-item assign-user-card cp ${
                                                    active.includes(user?.userID) ? 'active' : ''
                                                }`}
                                                onClick={(e) => {
                                                    const userId = user.userID;
                                                    if (e.ctrlKey || e.metaKey) {
                                                        setActive((prev) =>
                                                            prev.includes(userId)
                                                                ? prev.filter((id) => id !== userId)
                                                                : [...prev, userId],
                                                        );
                                                    } else {
                                                        setActive((prev) =>
                                                            prev.includes(userId) && prev.length === 1 ? [] : [userId],
                                                        );
                                                    }
                                                }}
                                            >
                                                <div className="assign-user-card-info">
                                                    <span className="assign-user-card-name">{fullName}</span>
                                                    <span className="assign-user-card-status">
                                                        {user?.isAssigned ? (
                                                            <>
                                                                <small className="assign-status-assigned ">
                                                                    Assigned
                                                                </small>
                                                                <small>|</small>

                                                                <small
                                                                    className="align-items-center assign-entity-link cp d-flex gap-1"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedUserPopupId(
                                                                            user.userID || user.userId,
                                                                        );
                                                                    }}
                                                                >
                                                                    {assignmentsCount}{' '}
                                                                    {assignmentsCount > 1 ? 'BU(s)' : 'BU'}
                                                                    <i
                                                                        className={`${retarget_list_medium} icon-xs color-primary-blue`}
                                                                    />
                                                                </small>
                                                            </>
                                                        ) : (
                                                            <small className="assign-status-unassigned ">
                                                                Unassigned
                                                            </small>
                                                        )}
                                                    </span>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <NoDataAvailableRender isShowIcon={false} message={<span>No users found.</span>} />
                            )}
                        </Col>

                        <Col md={1} className="d-flex justify-content-center align-self-xl-center"></Col>

                        <Col md={8}>
                            <div
                                className="box-design assign-roleusers-list css-scrollbar p0 no-box-shadow position-relative"
                                ref={scrollDivRef}
                                onScroll={handleScroll}
                            >
                                {userFields?.length > 0 ? (
                                    <div className="assign-entity-cards-container">
                                        {userFields.map((field, index, fields) => {
                                            const currentState = assignRole?.[index];
                                            const isKeyPerson = currentState?.isKeyPerson
                                                ? 'color-primary-orange'
                                                : 'color-primary-grey';
                                            const isSuperAdmin = _get(currentState, 'selectedRole.groupId', 0);
                                            const deleteKey = field?.selectedRole === '' ? false : true;
                                            const currentUserID = field?.userID;
                                            const isDifferentUser =
                                                index === 0 ? true : fields[index - 1]?.userID !== currentUserID;

                                            const currKeyperson = assignRole?.filter(
                                                (setting) =>
                                                    setting.isKeyPerson === true &&
                                                    isSuperAdmin === setting?.selectedRole?.groupId,
                                            );

                                            const name = `${field?.firstName || field?.FirstName || ''} ${
                                                field?.lastName || field?.LastName || ''
                                            }`;
                                            const buCount = currentState?.selectedBUs.length || 0;
                                            return (
                                                <Fragment key={field.id}>
                                                    {buCount > 0 && (
                                                        <div className="assign-entity-wrapper mb15">
                                                            <div className="assign-entity-header">
                                                                <div className="assign-entity-header-left">
                                                                    <div className="assign-entity-user-info">
                                                                        {/* <small className="assign-entity-label">Assigned user</small> */}
                                                                        <span className="assign-entity-name">
                                                                            {name}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <small className="white">
                                                                    {buCount}{' '}
                                                                    {buCount > 1 ? 'Business unit(s)' : 'Business unit'}
                                                                </small>
                                                            </div>
                                                            {
                                                                <RenderFields
                                                                    index={index}
                                                                    responseApiData={responseApiData}
                                                                    removeUser={() => remove(index)}
                                                                />
                                                            }
                                                        </div>
                                                    )}
                                                </Fragment>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    userFields.length === 0 && (
                                        <NoDataAvailableRender
                                            message={
                                                active.length === 0
                                                    ? 'Select one or more users to assign.'
                                                    : 'Select business unit(s) to assign users.'
                                            }
                                            isShowIcon={false}
                                        />
                                    )
                                )}
                            </div>
                        </Col>
                    </Row>
                    <small className="align-items-center d-flex mt10">
                        {/* <i className={`${circle_info_mini} icon-xs color-primary-blue mr5`} /> */}
                        Hold Ctrl/Cmd to select multiple users.
                    </small>
                </div>
            ) : (
                <>
                    <div className="box-design rs-box px24 py50">
                        <Row className="res-gx-2">
                            <Col md={3} sm={4} xs={12} className="py100">
                                <div className="rs-user-box">
                                    <img
                                        src={assignUser}
                                        alt={'Assign user'}
                                        className="rs-assign-user-image"
                                    />
                                    <div className="rs-user-text font-weight-600 font-size-18 mt20">
                                        {'Assign permissions to your team'}
                                    </div>
                                    <div className="rs-user-subtext font-size-14 mt10 color-secondary-grey px20">
                                        {'Start by selecting a user to assign roles and manage access.'}
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </>
            )}

            {!!modalUser && (
                <RSModal
                    show={!!modalUser}
                    handleClose={() => setSelectedUserPopupId(null)}
                    size="md"
                    className="assign-entity-modal"
                    header={
                        <div className="assign-modal-header-content">
                            <div className="assign-modal-user-info">
                                <span className="assign-modal-user-name">
                                    {modalUser.firstName} {modalUser.lastName}
                                </span>
                            </div>
                        </div>
                    }
                    body={
                        <div
                            className="assign-modal-entity-list css-scrollbar pr10"
                            style={{ maxHeight: '382px'}}
                        >
                            {modalUser.assignments?.length > 0 ? (
                                modalUser.assignments.map((assign, idx) => (
                                    <div key={idx} className="assign-modal-entity-row">
                                        <div className="assign-modal-entity-left">
                                            <div className="assign-modal-entity-icon">
                                                <i className="icon-rs-company-medium icon-md  color-primary-blue"></i>
                                            </div>
                                            <div className="assign-modal-entity-info">
                                                <span className="assign-modal-entity-name d-flex gap-2 align-items-center">
                                                    {assign.departmentName}
                                                    <RSTooltip
                                                        text={`${assign.clientName} - ${assign.departmentName}`}
                                                        position="top"
                                                    >
                                                        <i
                                                            className={`${circle_question_mark_mini} icon-xs color-primary-blue`}
                                                        />
                                                    </RSTooltip>
                                                </span>
                                                <small className="assign-modal-entity-role bottom5 position-relative">
                                                    {assign.roleName}
                                                </small>
                                            </div>
                                        </div>
                                        <RSTooltip text="Remove" position="top">
                                            <i
                                                onClick={() => {
                                                    setWarningModal((prev) => ({
                                                        ...prev,
                                                        show: true,
                                                        data: { ...assign, isEnabled: true },
                                                        userId: modalUser.userID || modalUser.userId,
                                                        index: null,
                                                    }));
                                                    setSelectedUserPopupId(null);
                                                }}
                                                className={`${circle_minus_fill_medium} color-primary-red icon-md cp`}
                                            ></i>
                                        </RSTooltip>
                                    </div>
                                ))
                            ) : (
                                <NoDataAvailableRender />
                            )}
                        </div>
                    }
                />
            )}

            {warningModal?.show && (
                <RSConfirmationModal
                    show={warningModal?.show}
                    handleClose={() =>
                        setWarningModal((prev) => ({
                            ...prev,
                            show: false,
                            data: {},
                            index: null,
                        }))
                    }
                    handleConfirm={async () => {
                        const targetUserId = warningModal?.userId;
                        await handleRemoveUserRoleFunc(warningModal?.data, warningModal?.index);
                        setWarningModal((prev) => ({ ...prev, show: false, data: {}, userId: null, index: null }));
                        setSelectedUserPopupId(targetUserId);
                    }}
                />
            )}
            {!companies && (
                <div className="buttons-holder">
                    <RSSecondaryButton
                        onClick={() => {
                            if (isAssignRoleSaveLoading) return;
                            navigate('/preferences/users');
                        }}
                        blockInteraction={isAssignRoleSaveLoading}
                    >
                        {CANCEL}
                    </RSSecondaryButton>
                    <RSPrimaryButton
                        onClick={() => {
                            if (isAssignRoleSaveLoading) return;
                            handleSubmit(handleSaveAssignRole)();
                        }}
                        isLoading={isAssignRoleSaveLoading}
                        blockBodyPointerEvents
                        className={`ml15 float-end ${
                            assignRoleData?.flatMap((u) => u.selectedBUs || [])?.some((bu) => !bu.selectedRole?.groupId)
                                ? 'click-off'
                                : ''
                        }`}
                    >
                        {SAVE}
                    </RSPrimaryButton>
                </div>
            )}

            <RSConfirmationModal
                show={confirmationModal}
                text={SELECT_BU}
                header={BUSINESS_UNIT}
                isBorder
                handleClose={() => {
                    setConfimrationModal(false);
                }}
                handleConfirm={() => {
                    setConfimrationModal(false);
                }}
                secondaryButton={false}
            />
        </Fragment>
    );

    return (
        <PreferencesSubPageSkeletonGate
            variant={PREFERENCES_SUBPAGE_VARIANT.COMPANY_ASSIGN_ROLE}
            isLoading={assignRolePageApi.isPageLoading}
        >
            {assignRoleBody}
        </PreferencesSubPageSkeletonGate>
    );
};

export default AssignRole;
