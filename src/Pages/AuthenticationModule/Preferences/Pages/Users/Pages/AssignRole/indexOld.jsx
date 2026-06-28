import { bar_filter_medium, bar_filter_mini, circle_minus_fill_medium, circle_plus_fill_edge_medium, circle_question_mark_medium, crown_fill_medium, filter_large } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import _map from 'lodash/map';
import _get from 'lodash/get';
import _omit from 'lodash/omit';
import _orderBy from 'lodash/orderBy';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFormContext, useFieldArray, useWatch } from 'react-hook-form';

import RSTooltip from 'Components/RSTooltip';
import RSPPophover from 'Components/RSPPophover';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';

import { companyPopOverText, getAssignedUsers, getDropOptions, getManipulatedData } from './constants';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { assignRoleToUser, getSecurityGroupList, getUserList, getAssignUserList, removeAssignUser } from 'Reducers/preferences/users/request';
import { getUserDetails } from 'Utils/modules/crypto';
import { getUserRoles, getUsersList } from 'Reducers/preferences/users/selectors';
import { SELECT_ROLE } from 'Constants/GlobalConstant/ValidationMessage';
import { getSessionId } from 'Reducers/globalState/selector';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';
import { mapTree } from '@progress/kendo-react-common';
import usePermission from 'Hooks/usePersmission';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';
import WarningModal from '../Component/WarningModal/WarningModal';
export const processTreeData = (data, state, fields) => {
    const { expanded } = state;
    return mapTree(data, 'items', (item) => {
        const props = {
            expanded: expanded.includes(item.id),
        };
        return {
            ...item,
            ...props,
        };
    });
};

export const expandedState = (item = [], expanded) => {
    const nextExpanded = expanded.slice();
    const itemKey = item?.['id'] || 0;
    const index = expanded?.indexOf(itemKey);
    index === -1 ? nextExpanded?.push(itemKey) : nextExpanded?.splice(index, 1);
    return nextExpanded;
};

const AssignRole = ({ back, companies, currentPage, companyBack }) => {
    // console.log('currentPage: ', currentPage);
    const location = useLocation();
    // console.log('Loc ::::::::::::::::: ', location);
    const isAccountSettings = location?.pathname?.split('/')?.pop() === 'account-settings';
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { licenseTypeId, parentClientId, isAgency } = getUserDetails();
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    // console.log('clientId: ', clientId);
    // console.log('parentClientId: ', parentClientId);
    const { clientDetails } = useSelector(({ companiesReducer }) => companiesReducer);
    const users = useSelector((state) => getUsersList(state));
    const userRoles = useSelector((state) => getUserRoles(state));

    const [active, setActive] = useState([]);
    const [userListWithoutRole, setuserListWithoutRole] = useState([]);
    const [selectedClientName, setSelectedClientName] = useState([]);
    const [filterOptions, setFilterOptions] = useState([]);
    const [warningModal, setWarningModal] = useState({
        show: false,
        data: {},
        index: null,
    });
    const [defName, setDefName] = useState({
        id: 0,
        name: '',
    });
    const { control, setValue, handleSubmit, getValues } = useFormContext();
    const { fields, remove, replace } = useFieldArray({
        control,
        name: 'assignRole',
    });

    const assignRole = useWatch({
        control,
        name: 'assignRole',
    });
    const { permissions } = usePermission();

    const deleteAccess = _get(permissions, 'deleteAccess', true);
    const addAccess = _get(permissions, 'addAccess', true);

    const stateClientName = _get(location, 'state.clientName', clientDetails?.childClientName); // 'AgencyTest';
    const stateClientId = parentClientId;
    //  _get(location, 'state.clientId', clientId);
    //1442;
    const stateLicenseTypeId = _get(location, 'state.licenseTypeId', 0);

    const getAssignUserData = async () => {
        // console.log('parentclientID ::: ', parentClientId, getUserDetails());
        const payload = {
            clientId: parentClientId,
            // parentClientId,
        };
        const res = await dispatch(getAssignUserList({ payload }));
        if (res?.status) {
            let tempClients = isAgency
                ? [...res?.data?.ClientDetails]
                : res?.data?.ClientDetails?.filter((e) => e?.isParent !== true); //[...res?.data?.ClientDetails];

            let tempDepartment = [...res?.data?.DepartmentDetails];
            let tempAssignUsers = _orderBy([...res?.data?.AssignUser], ['departmentId'], ['asc']);
            setValue('assignedUsers', tempAssignUsers);
            let tempAllUsers = [...res?.data?.UserDetails];
            const resultData = getManipulatedData(
                tempClients,
                tempDepartment,
                tempAssignUsers,
                tempAllUsers,
                stateClientId,
                stateClientName,
                userListWithoutRole,
                assignRole,
                false,
                setuserListWithoutRole,
                companies,
            );
            // console.log('resultData: ', resultData);
            setSelectedClientName([...resultData]);
            const dropOptions = getDropOptions(resultData, stateClientId, false);
            var tempAssignUsersList = getAssignedUsers(tempAssignUsers, tempClients, tempDepartment);

            // setSelectedClientName((prev) => ({
            //     ...prev,
            //     clientDetails: tempClients,
            //     departmentDetails: tempDepartment,
            //     assignedUsers: result?.tempAssignUsersList,
            //     nonAssignedUsers: result?.tempNotAssignedUsers,
            //     parentUsers: result?.parentUsersList,
            // }));
            // console.log('Temp client list ::::::::::: ', tempAssignUsersList);
            tempAssignUsersList = _orderBy(tempAssignUsersList, ['groupId'], ['asc']);
            tempAssignUsersList = _orderBy(tempAssignUsersList, ['clientId'], ['asc']);

            replace(tempAssignUsersList);

            setFilterOptions(dropOptions);
            // let filtered = dropOptions?.filter((item) => {
            //     if (item?.name?.id === clientId) {
            //         let depFilter = item?.items?.filter((dep) => dep?.id === departmentId);
            //         if (depFilter?.length === 1) {
            //             return item;
            //         }
            //     }
            // });
            
            if (!companies) {
                let filtered = dropOptions?.filter((item) => {
                    if (item?.name?.id === clientId) {
                        if (departmentId === 0) {
                            setuserListWithoutRole(item?.value);
                            return item;
                        } else {
                            let depFilter = item?.items?.filter((dep) => dep?.departmentId === departmentId);
                            if (depFilter?.length === 1) {
                                setuserListWithoutRole(depFilter?.[0]?.value);
                                return item;
                            }
                        }
                    }
                });

                setDefName({
                    name: filtered?.[0]?.name?.name,
                    id: filtered?.[0]?.name?.id,
                });
            } else {
                setuserListWithoutRole(dropOptions?.[0]?.value);
                setDefName({
                    name: dropOptions?.[0]?.name?.name,
                    id: dropOptions?.[0]?.name?.id,
                });
            }

            // setSelectedClientName((prev) => ({
            //     ...prev,
            //     clientList: [...temp],
            // }));
        } else {
            // setSelectedClientName((prev) => ({
            //     ...prev,
            //     clientList: [],
            // }));
        }
    };

    useEffect(() => {
        let payload = { clientId, userId, departmentId };
        if (companies) {
            payload['clientId'] = stateClientId;
            payload['departmentId'] = stateLicenseTypeId === 3 ? departmentId : 0;
        }
        const fetchData = async () => {
            const { data, status } = await dispatch(getUserList({ payload, loading: true }));
            if (data?.length) {
                let tempDepartment = data?.filter((item) => item?.departmentId === departmentId);

                let assignedUsers = tempDepartment
                    ?.filter((item) => item?.roleId !== 0)
                    ?.map((item) => ({
                        ...item,
                        groupId: clientId,
                        clientId: clientId,
                    }));
                setValue('assignedUsers', assignedUsers);

                let notAssignedUsers = tempDepartment
                    ?.filter((item) => item?.roleId === 0)
                    ?.map((item) => ({
                        ...item,
                        groupId: clientId,
                        clientId,
                    }));
                // console.log('Check :::: ', assignedUsers, notAssignedUsers, tempDepartment);
                let dropOptions = [
                    {
                        client: {
                            clientId,
                            clientName: stateClientName,
                        },
                        department: tempDepartment,
                        usersList: notAssignedUsers,
                    },
                ];
                setFilterOptions(dropOptions);
                replace(assignedUsers);
                setuserListWithoutRole(notAssignedUsers);
            }
            if (companies && (!data?.length || !status)) back('CREATE');
        };
        // if (location?.pathname?.split('/')?.pop() !== 'add-companies') fetchData();
        // else
        getAssignUserData();
        dispatch(getSecurityGroupList({ payload }));
        // if (_get(location, 'state.licenseTypeId', '') === 3) {
        // handleClientHierachy();
        // getAssignUserData();
        // }
    }, [departmentId]);

    // const handleClientHierachy = async () => {
    //     const payload = {
    //         clientId: companies ? _get(location, 'state.clientId', clientId) : clientId,
    //         userId,
    //         //licensetypeId: licenseTypeId,
    //     };
    //     const res = await dispatch(getClientHieracy({ payload }));
    //     if (res?.status) {
    //         setSelectedClientName((pre) => ({
    //             ...pre,
    //             clientList: res?.data?.departmentList || [],
    //             parentClientname: res?.data?.parentClient || '',
    //             clientName: res?.data?.clientName,
    //         }));
    //         // stateClientName = res?.data?.sessionClient[0].clientName;
    //     } else {
    //         setSelectedClientName((pre) => ({ ...pre, clientList: [], clientName: '', parentClientname: '' }));
    //     }
    // };

    const handleHierarchyUserList = async (seletedId) => {
                // const payload = { clientId: seletedId, userId }
        // const res = await dispatch(getHierarchyUserList({ payload }));
        // if (res?.status) {
        //     setSelectedClientName(pre => ({ ...pre, userList: res?.data }));
        // } else {
        //     setSelectedClientName(pre => ({ ...pre, userList: [] }));
        // }
    };

    const handleRemoveUserRole = async (data, index) => {
        let isExistAssign = getValues('assignedUsers')?.filter((item) => item?.userId === data?.userId);
        // console.log('Data Remove :::::: ', data, data?.selectedRole, !!data?.selectedRole, isExistAssign);

        if (!!data?.selectedRole && isExistAssign?.length !== 0) {
            const payload = {
                userId,
                departmentId,
                clientId, //: 1158,
                userRoleList: [
                    {
                        userId: data?.userId,
                        roleId: data?.selectedRole?.securityGroupId,
                        clientId: data?.clientSaveId, //: 1158,
                        IsKeyPerson: !!data?.iskeyPerson ? data?.iskeyPerson : false,
                    },
                ],
            };
            const { status, data: result } = await dispatch(removeAssignUser({ payload }));
            if (status) {
                // console.log('Result ::::::::: ', result);
            } else {
                return;
            }
        }
        // debugger;
        const dropOptions = getDropOptions(selectedClientName, stateClientId, true, data, 'add', setSelectedClientName);
        // console.log('Drop Option ::::::::::::::::::::::::::::::::::: ', dropOptions);
        setFilterOptions(dropOptions);
        remove(index);
    };

    const addNewRole = () => {
        // debugger;
        let unAssignedUserList = [],
            withRole = [...assignRole];
        let tempUser = '';
        userListWithoutRole.forEach((user) => {
            if (active.includes(user.userId)) {
                withRole.push({ ...user, selectedRole: '', groupId: defName?.name });
                tempUser = { ...user, groupId: defName?.name };
            } else {
                unAssignedUserList.push(user);
            }
        });
        withRole = _orderBy(withRole, ['groupId'], ['asc']);
        withRole = _orderBy(withRole, ['clientId'], ['asc']);

        // console.log('With role :::: ', withRole, unAssignedUserList);
        replace(withRole);
        setuserListWithoutRole(unAssignedUserList);
        const dropdown = getDropOptions(
            selectedClientName,
            stateClientId,
            true,
            tempUser,
            'remove',
            setSelectedClientName,
            withRole,
        );
        setFilterOptions(dropdown);
        setActive([]);
    };

    const [expanded, setExpanded] = useState([3]);
    const [value, setValues] = useState(null);

    const onExpandChange = useCallback((event) => setExpanded(expandedState(event.item, expanded)), [expanded]);

    // const filterOptions = [
    //     {
    //         id: 1,
    //         text: (
    //             <ul>
    //                 <li>
    //                     <span>Client name</span>
    //                     <p>{stateClientName}</p>
    //                 </li>
    //             </ul>
    //         ),
    //         items: selectedClientName.clientList?.map((res) => ({
    //             ...res,
    //             id: res.departmentId,
    //             text: res.departmentName,
    //         })),
    //     },
    // ];

    // const clientList = selectedClientName.clientList?.map((res) => ({
    //     ...res,
    //     id: res.departmentId,
    //     text: res.departmentName,
    // }));

    const treeData = useMemo(
        () =>
            processTreeData(
                filterOptions,
                {
                    expanded,
                    value,
                },
                fields,
            ),
        [expanded, value],
    );
    return (
        <Fragment>
            <div className="box-design rs-box">
                {/* {companies && ( */}
                <Row className="mb10 res-gx-0">
                    {companies && (
                        <Col md={3} className="pr0 d-flex">
                            {/* <KendoIconDropdown
                            icon={` ${bar_filter_medium} icon-xs cp color-primary-blue`}
                            onItemClick={({ item, itemIndex }) => {
                                getUsersBasedOnType(item, itemIndex, dispatch, clientId, userId);
                            }}
                            data={filterOptions}
                            isCustomRender
                            itemRender={(props) => (
                                <RenderAttribute item={props} selectedClientName={selectedClientName} />
                            )}
                        /> */}
                            {/* <DropDownTree
                            style={{
                                width: '300px',
                            }}
                            data={treeData}
                            onChange={onChange}
                            placeholder="All"
                            textField={'text'}
                            dataItemKey={'id'}
                            selectField={'selected'}
                            expandField={'expanded'}
                            onExpandChange={onExpandChange}
                        /> */}
                            <span>{defName?.name}</span>
                            <RSBootstrapdown
                                showUpdate={false}
                                data={filterOptions}
                                isObject
                                fieldKey="text"
                                innerItems={'items'}
                                isUserRole
                                // defaultItem={{ id: 0, text: filterOptions?.[0]?.name?.name }}
                                onSelect={(value, index) => {
                                    // console.log('value: ', value);
                                    // console.log('Checking ::::::::::::::: ', value, index);
                                    // dispatch(updateUsersData(value?.value));
                                    setDefName({ name: value?.name?.name, id: value?.name?.id });
                                    setuserListWithoutRole(value?.value);
                                    // replace(value?.assignUsers);

                                    // let payload = { clientId: stateClientId, userId, departmentId: _get(value, 'id', 0) };
                                    // dispatch(getUserList({ payload, loading: true }));
                                }}
                            />
                            {/* <BootstrapDropdown
                            data={filterOptions}
                            defaultItem={
                                <RSTooltip position="top" text="Snapshot">
                                    <i className={`${bar_filter_mini} icon-lg color-whites`} />
                                </RSTooltip>
                            }
                            alignRight
                            customAlignRight={true}
                            showUpdate={false}
                            title={<i className={`${filter_large} icon-lg color-primary-blue`} />}
                            className="mr15 no_caret mb30"
                            onSelect={(item, index) => {
                                // setValue('selectedtype', '');
                                // setValue('searchInput', '');
                                // setSelectedFilterList((pre) => ({
                                //     ...pre,
                                //     filterList: filterOptionsData[item],
                                //     searchKey: item,
                                // }));
                            }}
                        /> */}
                        </Col>
                    )}
                    <Col md={licenseTypeId === '3' ? 9 : 12}>
                        <ul className="rs-list-group-horizontal jc-right">
                            <li onClick={() => back('ADDUSER')}>
                                <RSTooltip position="top" text="Add user">
                                    <i
                                        id="rs_data_circle_plus_fill_edge"
                                        className={`${circle_plus_fill_edge_medium} icon-md primary-color icon-hover-shadow-primary`}
                                    ></i>
                                </RSTooltip>
                            </li>
                        </ul>
                    </Col>
                </Row>
                {/* )} */}

                <Row className="res-gx-0">
                    <Col
                        md={3}
                        className="box-design assign-roleusers-list css-scrollbar p0 position-relative no-box-shadow"
                    >
                        {/* <UnAssignList /> */}
                        {userListWithoutRole?.length ? (
                            <ul className="list-group">
                                {userListWithoutRole?.map((user, index) => (
                                    <li
                                        key={user.userId}
                                        list={index}
                                        className={`list-group-item cp ${active.includes(user.userId) ? 'active' : ''}`}
                                        onClick={() => {
                                            if (!active.includes(user.userId)) {
                                                setActive((prev) => [...prev, user.userId]);
                                            } else {
                                                let tempData = [...active];
                                                tempData = tempData.filter((list) => user.userId !== list);
                                                setActive(tempData);
                                            }
                                        }}
                                    >
                                        <span>
                                            {
                                                user.firstName + ' ' + user?.lastName //+ ' ' + user?.userId
                                            }
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <NoDataAvailableRender />
                        )}
                    </Col>
                    <Col md={1} className="d-flex justify-content-center align-self-xl-center">
                        <div
                            className={`rs-select-arrow-icon-right cp ${addAccess ? '' : ' click-off'}`}
                            onClick={(e) => addNewRole()}
                        ></div>
                    </Col>
                    <Col md={8}>
                        <div className="box-design assign-roleusers-list css-scrollbar p0 no-box-shadow">
                            <div className="p10">
                                Company
                                <RSPPophover position={'top'} pophover={companyPopOverText}>
                                    <i
                                        className={`${circle_question_mark_medium} color-primary-blue icon-md left6 position-relative top5`}
                                        id="circle_question_mark"
                                    />
                                </RSPPophover>
                            </div>
                            {fields?.length ? (
                                <ul>
                                    {fields.map((field, index, fields) => {
                                        const currentState = assignRole?.[index];
                                        const isKeyPerson = currentState?.isKeyPerson
                                            ? 'color-primary-orange'
                                            : 'color-primary-grey';
                                        
                                        const isSuperAdmin = _get(currentState, 'selectedRole.securityGroupId', 0);
                                        const deleteKey = field?.selectedRole === '' ? false : true;
                                        //
                                        const isDifferentClientName =
                                            fields[index - 1]?.groupId !== fields[index]?.groupId;
                                        const isDifferentDepartment =
                                            fields[index - 1]?.departmentId !== fields[index]?.departmentId;
                                        const isDifferentGroup = fields[index - 1]?.groupId !== fields[index]?.groupId;
                                        return (
                                            <Fragment>
                                                {/* {(isDifferentClientName || isDifferentDepartment) &&
                                                    licenseTypeId === '3' && (
                                                        <li>
                                                            {field?.clientName} - {field.departmentName || 'All'}
                                                        </li>
                                                    )} */}
                                                {isDifferentGroup && <li>{field?.groupId}</li>}
                                                <li key={field.id} className="align-items-center d-flex pt22">
                                                    <div className="col-3 label">
                                                        {
                                                            (field.firstName || field.FirstName) +
                                                                ' ' +
                                                                (field?.lastName || field?.LastName)
                                                            //+
                                                            // ' ' +
                                                            // field?.userId
                                                        }
                                                    </div>
                                                    <div className="col-6 form-group mb0">
                                                        <RSKendoDropDownList
                                                            data={_orderBy(userRoles, 'securityGroupName', 'asc')}
                                                            control={control}
                                                            name={`assignRole[${index}].selectedRole`}
                                                            label={'User role'}
                                                            dataItemKey={'securityGroupId'}
                                                            textField={'securityGroupName'}
                                                            defaultValue={{
                                                                securityGroupName: field.role,
                                                                securityGroupId: field.roleId,
                                                            }}
                                                            // required
                                                            rules={{
                                                                required: SELECT_ROLE,
                                                            }}
                                                        />
                                                        {isSuperAdmin === 5 && (
                                                            <i
                                                                onClick={() =>
                                                                    setValue(
                                                                        `assignRole[${index}].isKeyPerson`,
                                                                        !currentState?.isKeyPerson,
                                                                    )
                                                                }
                                                                className={`${crown_fill_medium} ${isKeyPerson} icon-md position-absolute right-40 bottom-0`}
                                                            />
                                                        )}
                                                    </div>
                                                    <div
                                                        className={`${
                                                            !deleteAccess && ''
                                                        }align-items-center col-3 d-flex justify-content-end`}
                                                    >
                                                        <RSTooltip text="Remove" position="top">
                                                            <i
                                                                onClick={() => {
                                                                    if (currentState?.isKeyPerson) {
                                                                        setWarningModal((prev) => ({
                                                                            ...prev,
                                                                            show: true,
                                                                            data: currentState,
                                                                            index: index,
                                                                        }));
                                                                    } else {
                                                                        handleRemoveUserRole(currentState, index);
                                                                        if (defName?.name === currentState?.groupId) {
                                                                            const tempRole = [...userListWithoutRole];
                                                                            tempRole.push(_omit(field, 'selectedRole'));
                                                                            setuserListWithoutRole(tempRole);
                                                                        }
                                                                    }
                                                                }}
                                                                //     className={`${
                                                                //         circle_minus_fill_medium
                                                                //     } color-primary-red icon-md
                                                                // ${field?.selectedRole !== '' ? 'click-off' : ''}
                                                                // `}
                                                                className={`${circle_minus_fill_medium} color-primary-red icon-md`}
                                                                id="rs_data_circle_minus_fill"
                                                            />
                                                        </RSTooltip>
                                                    </div>
                                                </li>
                                            </Fragment>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <div className="text-center position-relative h-75">
                                    <NoDataAvailableRender />
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>
                <WarningModal
                    show={warningModal?.show}
                    handleClose={(status) => {
                        if (status) {
                            handleRemoveUserRole(warningModal?.data, warningModal?.index);
                            const tempRole = [...userListWithoutRole];
                            tempRole.push(_omit(warningModal?.data, 'selectedRole'));
                            setuserListWithoutRole(tempRole);
                        }
                        setWarningModal((prev) => ({
                            ...prev,
                            show: false,
                        }));
                    }}
                />
            </div>
            {_get(location, 'state.mode', 'new') !== 'edit' && !isAccountSettings && (
                <div className="buttons-holder">
                    <RSSecondaryButton
                        onClick={() => {
                            navigate('/preferences/users');
                        }}
                    >
                        Cancel
                    </RSSecondaryButton>
                    <RSPrimaryButton
                        onClick={handleSubmit((formState) => {
                            const { assignRole } = formState;
                            // console.log('assignRole: ', assignRole);
                            //  debugger;
                            const payload = {
                                userId,
                                departmentId,
                                clientId, //: 1158,
                                userRoleList: _map(assignRole, ({ userId, selectedRole, isKeyPerson }) => ({
                                    userId,
                                    roleId: _get(selectedRole, 'securityGroupId', 0),
                                    clientId, //: 1158,
                                    IsKeyPerson: isKeyPerson || false,
                                })),
                            };
                            dispatch(assignRoleToUser(payload));
                        })}
                        className={`ml15 float-end  ${!assignRole?.length ? 'click-off' : ''}`}
                    >
                        Save
                    </RSPrimaryButton>
                </div>
            )}
        </Fragment>
    );
};

export default AssignRole;
