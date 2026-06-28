import { getUserList } from 'Reducers/preferences/users/request';
var dataExists = true;

export const busLevel = ['All', 'Personal', 'Business', 'Privilege'];
export const companyPopOverText = (
    <>
        <p className="border-bottom pb5 mb3">
            <b>User -</b> Can view analytics
        </p>
        <p className="border-bottom pb5 mb3">
            <b>Super user: </b> Can import audience data, manage communications, and view analytics
        </p>
        <b>Admin: </b> Can manage account settings and all platform modules
    </>
);
export const userRole = [
    {
        securityGroupId: 4,
        securityGroupName: 'Admin',
    },
    {
        securityGroupId: 5,
        securityGroupName: 'Superuser',
    },
    {
        securityGroupId: 6,
        securityGroupName: 'User',
    },
];

export const getUsersBasedOnType = (item, itemIndex, dispatch, clientId, userId) => {
    let payload = { clientId, userId, departmentId: 0 };
    if (itemIndex > 2) {
        payload['departmentId'] = item?.departmentId;
        dataExists = false;
        dispatch(getUserList({ payload, loading: true }));
    } else if (!dataExists) {
        dispatch(getUserList({ payload, loading: true }));
        dataExists = true;
    }
};

export const getManipulatedData = (
    tempClients,
    tempDepartment,
    assignUsers,
    allUsers,
    stateClientId,
    stateClientName,
    userListWithoutRole,
    assignRole,
    update,
    setuserListWithoutRole,
    companies,
) => {
    // debugger;
    tempDepartment = tempDepartment?.filter((item) => item?.departmentId !== 0);
    let tempAllUsers = update ? userListWithoutRole : allUsers;
    let tempAssignUsers = update ? assignRole : assignUsers;
    let tempParentAssignUsers = [];
    let parentClientName = tempClients?.filter((clients) => clients?.isParent === true)?.[0]?.clientName;
    let tempNotAssignedUsers = tempAllUsers?.filter((user) => {
        let count = 0;
        for (let n = 0; n < tempAssignUsers?.length; n++) {
            if (user?.userId !== tempAssignUsers[n]?.userId) {
                count = count + 1;
            }
            if (user?.clientId === stateClientId) {
                let tempParent = {
                    ...user,
                    clientName: 'as',
                    departmentName: 'All',
                    groupId: stateClientId,
                };
                tempParentAssignUsers.push(tempParent);
            }
        }
        if (count === tempAssignUsers?.length) return user;
    });

    let dropdownClients = [];
    let index = [];
    let result = [];
    let parentUsersList = [];
    let parentUsers = tempNotAssignedUsers?.filter((user, ind) => {
        // let cName = '';
        // let dName = '';
        // for (var k = 0; k < tempDepartment?.length; k++) {
        //     if (tempDepartment[k]?.departmentId === user?.departmentId) {
        //         dName = tempDepartment[k]?.departmentName;
        //     }
        // }
        // // for (var l = 0; l < self?.length; l++) {
        // //     if (self[l]?.clientId === user?.clientId) {
        // //         cName = self[l]?.clientName;
        // //     }
        // // }
        if (user?.clientId === stateClientId) {
            let tempParentUser = {
                ...user,
                clientName: parentClientName,
                departmentName: 'All',
                groupId: parentClientName + ' - All',
            };
            parentUsersList.push(tempParentUser);
            return tempParentUser;
        }
    });
    let entireUsers = [];

    let temp = tempClients?.filter((item, ind, self) => {
        if (stateClientId !== item?.clientId) {
            dropdownClients.push(item?.clientName);
            index.push(ind);

            let usersList = [];
            let usersAssignList = [];
            let depClientUsers = [];
            let depClientAssignUsers = [];
            let deps = [];
            let depUsers = [];
            let assignedUsersList = [];
            if (tempDepartment?.length !== 0) {
                let departmentsList = tempDepartment?.filter((dep) => {
                    // debugger;
                    let tempDeparmentList = [];
                    if (item?.clientId === dep?.clientId) {
                        index.push(index[index?.length - 1]);
                        dropdownClients.push(dep?.departmentName);
                        let tempDepClientUsers = tempNotAssignedUsers?.filter((users) => {
                            // debugger;
                            if (users?.clientId === item?.clientId && users?.departmentId === dep?.departmentId) {
                                let tempDept = {
                                    ...users,
                                    departmentName: dep?.departmentName,
                                    clientName: item?.clientName,
                                    groupId: item?.clientName + ' - ' + dep?.departmentName,
                                    departmentSaveId: dep?.departmentId,
                                    clientSaveId: item?.clientId,
                                };
                                tempDeparmentList.push(tempDept);
                                usersList.push({
                                    ...tempDept,
                                    groupId: item?.clientName + ' - All',
                                    // departmentSaveId: 0,
                                    clientSaveId: item?.clientId,
                                });
                                depClientUsers.push(tempDept);
                                // console.log('tempDept: ', tempDept);
                                return tempDept;
                            } else if (users?.departmentId === 0 && users?.clientId === item?.clientId) {
                                let tempUserDep0 = {
                                    ...users,
                                    groupId: item?.clientName + ' - ' + 'All',
                                    clientName: item?.clientName,
                                    departmentName: 'All',
                                    departmentSaveId: 0,
                                    clientSaveId: item?.clientId,
                                };
                                // tempDeparmentList.push(tempUserDep0);

                                usersList.push({
                                    ...tempUserDep0,
                                    groupId: item?.clientName + ' - All',
                                    departmentSaveId: 0,
                                    clientSaveId: item?.clientId,
                                });
                                // parentUsers.push({
                                //     ...tempUserDep0,
                                //     groupId: item?.clientName + ' - All',
                                //     departmentSaveId: 0,
                                //     clientSaveId: item?.clientId,
                                // });
                                return tempUserDep0;
                            }
                        });
                        // let tempDepAssignClientUsers = tempAssignUsers?.filter((users) => {
                        //     if (users?.clientId === item?.clientId && users?.departmentId === dep?.departmentId) {
                        //         let tempDept = {
                        //             ...users,
                        //             departmentName: dep?.departmentName,
                        //             clientName: item?.clientName,
                        //             groupId: users?.clientId,
                        //         };
                        //         depClientAssignUsers.push(tempDept);
                        //         return tempDept;
                        //     }
                        // });
                        let tempDep = {
                            ...dep,
                            departmentId: dep?.departmentId,
                            usersList: [
                                ...tempDeparmentList,
                                ...parentUsers?.map((pu) => ({
                                    ...pu,
                                    groupId: item?.clientName + ' - ' + dep?.departmentName,
                                    departmentSaveId: dep?.departmentId,
                                    clientSaveId: item?.clientId,
                                })),
                                ...entireUsers?.map((eu) => ({
                                    ...eu,
                                    groupId: item?.clientName + ' - ' + dep?.departmentName,
                                    departmentSaveId: dep?.departmentId,
                                    clientSaveId: item?.clientId,
                                })),
                            ],
                        };
                        // usersList = [...usersList, ...tempDeparmentList];
                        // console.log('Temp dep ::: ', entireUsers, tempDep);
                        deps.push(tempDep);
                        return dep;
                    } else {
                        // let userList = [...res?.data?.UserDetails];
                        // for (var m = 0; m < userList?.length; m++) {
                        //     if (userList[m]?.clientId === item?.clientId) {
                        //         let temp = {
                        //             ...userList[m],
                        //             clientName: item?.clientName,
                        //             departmentName: '',
                        //             groupId: userList[m]?.clientId,
                        //         };
                        //         usersList.push(temp);
                        //         // return temp;
                        //     }
                        // }
                        usersList = tempNotAssignedUsers
                            ?.filter((users) => {
                                if (users?.clientId === item?.clientId) {
                                    let temp = {
                                        ...users,
                                        clientName: item?.clientName,
                                        departmentName: '',
                                        groupId: item?.clientName + ' - All',
                                        departmentSaveId: 0,
                                        clientSaveId: item?.clientId,
                                    };
                                    // usersList.push(temp);
                                    return temp;
                                }
                            })
                            ?.map((mapUser) => ({
                                ...mapUser,
                                clientName: item?.clientName,
                                departmentName: '',
                                groupId: item?.clientName + ' - All',
                                departmentSaveId: 0,
                                clientSaveId: item?.clientId,
                            }));

                        // usersAssignList = tempAssignUsers
                        //     ?.filter((users) => {
                        //         if (users?.clientId === item?.clientId) {
                        //             let temp = {
                        //                 ...users,
                        //                 clientName: item?.clientName,
                        //                 departmentName: '',
                        //                 groupId: users?.clientId,
                        //             };
                        //             // usersList.push(temp);
                        //             return temp;
                        //         }
                        //     })
                        //     ?.map((mapUser) => ({
                        //         ...mapUser,
                        //         clientName: item?.clientName,
                        //         departmentName: '',
                        //         groupId: mapUser?.clientId,
                        //     }));
                        // usersList = [...res?.data?.UserDetails]?.filter(
                        //     (users) => users?.clientId === item?.clientId,
                        // );
                    }
                });
            } else {
                usersList = tempNotAssignedUsers
                    ?.filter((users) => {
                        if (users?.clientId === item?.clientId) {
                            let temp = {
                                ...users,
                                clientName: item?.clientName,
                                departmentName: '',
                                groupId: item?.clientName + ' - All',
                                departmentSaveId: 0,
                                clientSaveId: item?.clientId,
                            };
                            // usersList.push(temp);
                            return temp;
                        }
                    })
                    ?.map((mapUser) => ({
                        ...mapUser,
                        clientName: item?.clientName,
                        departmentName: '',
                        groupId: item?.clientName + ' - All',
                        departmentSaveId: 0,
                        clientSaveId: item?.clientId,
                    }));
            }
            parentUsers = parentUsers?.map((pu) => ({
                ...pu,
                groupId: item?.clientName + ' - All',
                departmentSaveId: 0,
                clientSaveId: item?.clientId,
                clientName: item?.clientName,
                departmentName: '',
            }));
            let userUnique = usersList?.filter((value, index) => {
                return index === usersList?.findIndex((obj) => value?.userId === obj?.userId);
            });

            let clientuserUnique =
                userUnique?.length !== 0
                    ? userUnique?.filter((value, index) => {
                          return value?.departmentId === 0;
                      })
                    : userUnique;

            // console.log('parentUsers: ', userUnique);
            // console.log('clientuserUnique: ', clientuserUnique);
            // deps = [...deps, ...parentUsers];
            entireUsers = [...entireUsers, ...clientuserUnique];

            let resul = {
                client: item,
                department: deps,
                //usersList: [...userUnique], // for duplicate parent user remove
                usersList: [...entireUsers, ...parentUsers], // for duplicate parent user remove
                // usersList: [...parentUsers, ...userUnique],
                // usersAssignList: [...usersAssignList],
                // depClientUsers: [...parentUsers, ...depClientUsers],
                // depClientAssignUsers: [...depClientAssignUsers],
                index: dropdownClients?.length - 1,
                assignedUsers: [],
            };
            result.push(resul);
            return resul;
        } else {
            setuserListWithoutRole(parentUsersList);
            result.push({
                client: item,
                department: [],
                // usersAssignList: tempParentAssignUsers,
                // depClientAssignUsers: [],
                usersList: parentUsersList,
            });
        }
    });
    // console.log(':TEmp :::::: ', temp, result);
    
    // return { dropOptions, tempAssignUsersList, tempNotAssignedUsers, parentUsersList };
    return result;
};

export const getDropOptions = (result, stateClientId, isUpdate, user, action, setSelectedClientName, withRole) => {
    let dropOptions = [];
    if (!isUpdate) {
        dropOptions = result?.map((item, index) => {
            // debugger;
            return {
                id: index,
                text: (
                    // <ul>
                    <div className="">
                        {item?.client?.clientId === stateClientId && <small>Parent company</small>}
                        {/* {index === 1 && <small>Child company</small>} */}
                        <p>{item?.client?.clientName}</p>
                        {/* <ul>
                                {item?.department?.map((dep) => {
                                    return (
                                        <li>
                                            <span>{dep?.departmentName}</span>
                                        </li>
                                    );
                                })}
                            </ul> */}
                    </div>
                    // </ul>
                ),
                items: item?.department?.map((dep, ind) => ({
                    id: ind,
                    text: dep?.departmentName,
                    departmentId: dep?.departmentId,
                    value:
                        stateClientId + 1 === dep?.clientId ? [...item?.usersList, ...dep?.usersList] : item?.usersList,
                    name: { name: item?.client?.clientName + ' - ' + dep?.departmentName, id: item?.client?.clientId },
                    // assignUsers: item?.depClientAssignUsers,
                })),
                value: item?.usersList,
                name: { name: item?.client?.clientName + ' - All', id: item?.client?.clientId },
                // assignUsers: item?.usersAssignList,
            };
        });
        return dropOptions;
    } else {
        let assinedUsers = withRole?.map((user) => user?.userId);
        let tempParentUsers = [stateClientId];
        let resultMap = result?.map((item, idx) => {
            // console.log('Item ::: ', item);
            // if (item?.client?.clientId !== stateClientId) {

            let tempUser = [],
                tempDeptUser = [],
                tempDep = [],
                tempDepAssignUser = [];
            if (action === 'remove') {
                tempUser = item?.usersList?.filter((res, idx) => res?.userId !== user?.userId);
                tempDep = item?.department?.map((dep) => ({
                    ...dep,
                    usersList: dep?.usersList?.filter((ul) => ul?.userId !== user?.userId),
                }));
                // tempAssignUser = item?.usersAssignList?.length !== 0 ? [item?.usersAssignList, user] : [user];
                // tempDeptUser = item?.depClientUsers?.filter((res, idx) => res?.userId !== user?.userId);
                // tempDepAssignUser =
                //     item?.depClientAssignUsers?.length !== 0 ? [item?.depClientAssignUsers, user] : [user];
            } else if (action === 'add') {
                // debugger;
                if (item?.client?.clientId !== stateClientId) tempParentUsers.push(item?.client?.clientId);
                if (item?.client?.clientId === user?.clientId || tempParentUsers?.includes(user?.clientId)) {
                    if (tempParentUsers?.includes(user?.clientId)) {
                        tempUser = [item?.usersList, { ...user, groupId: item?.usersList?.[0]?.groupId }];
                    } else {
                        tempUser =
                            item?.usersList?.[0]?.groupId === user?.groupId
                                ? [item?.usersList, user]
                                : [item?.usersList];
                    }

                    // tempAssignUser = item?.usersAssignList?.filter((res, idx) => res?.userId !== user?.userId);
                    tempDep = item?.department?.map((dep) => {
                        // debugger;
                        // console.log('Dep ::::::::::::: ', dep);

                        if (tempParentUsers?.includes(user?.clientId)) {
                            return {
                                ...dep,
                                usersList: [dep?.usersList, { ...user, groupId: dep?.usersList?.[0]?.groupId }]?.flat(),
                            };
                        } else {
                            return {
                                ...dep,
                                usersList:
                                    dep?.usersList?.[0]?.groupId === user?.groupId
                                        ? [dep?.usersList, user]?.flat()
                                        : dep?.usersList,
                            };
                        }
                    });
                    // tempDeptUser = item?.client?.clientId === stateClientId ? [] : [item?.depClientUsers, user];
                    // tempDepAssignUser = item?.depClientAssignUsers?.filter((res, idx) => res?.userId !== user?.userId);

                    // tempUser?.push(user);
                    // tempDeptUser?.push(user);
                } else {
                    tempDep = item?.department;
                    tempUser = item?.usersList;
                }
            }

            // tempUser = tempUser?;
            // tempDeptUser = tempDeptUser?.filter((res, idx) => res?.userId !== user?.userId);

            return {
                client: item?.client,
                department: tempDep,
                // depClientUsers: tempDeptUser?.flat(),
                // depClientAssignUsers: tempDepAssignUser?.flat(),
                usersList: tempUser?.flat(),
                // usersAssignList: tempAssignUser?.flat(),
            };
            // } else {
            //     return {
            //         ...item,
            //     };
            // }
        });
        // console.log('Result map :::::::: ', resultMap);
        setSelectedClientName([...resultMap]);
        dropOptions = resultMap?.map((item, index) => {
            let assignDepUsers =
                item?.client?.clientId === stateClientId
                    ? item?.depClientAssignUsers
                    : item?.depClientAssignUsers?.filter((da) => da?.clientId === item?.client?.clientId);
            let assignUsers =
                item?.client?.clientId === stateClientId
                    ? item?.usersAssignList
                    : item?.usersAssignList?.filter((ua) => ua?.clientId === item?.client?.clientId);
            return {
                id: index,
                text: (
                    // <ul>
                    <div className="">
                        {item?.client?.clientId === stateClientId && <small>Parent company</small>}
                        {index === 1 && <small>Child company</small>}
                        <p>{item?.client?.clientName}</p>
                        {/* <ul>
                                {item?.department?.map((dep) => {
                                    return (
                                        <li>
                                            <span>{dep?.departmentName}</span>
                                        </li>
                                    );
                                })}
                            </ul> */}
                    </div>
                    // </ul>
                ),
                items: item?.department?.map((dep, ind) => ({
                    id: ind,
                    text: dep?.departmentName,
                    departmentId: dep?.departmentId,
                    value: dep?.usersList,
                    name: { name: item?.client?.clientName + ' - ' + dep?.departmentName, id: item?.client?.clientId },
                    // assignUsers: assignDepUsers?.length === 0 ? [] : assignDepUsers,
                })),
                value: item?.usersList,
                name: { name: item?.client?.clientName, id: item?.client?.clientId },
                // assignUsers: assignUsers?.length === 0 ? [] : assignUsers,
            };
        });
    }

    return dropOptions;
};

export const getAssignedUsers = (tempAssignUsers, tempClients, tempDepartment) => {
    let tempAssignUsersList = tempAssignUsers.map((item, index) => {
        let clientName = '';
        let departmentName = '';
        // debugger;

        for (var i = 0; i < tempClients?.length; i++) {
            if (tempClients[i]?.clientId === item?.clientId) {
                clientName = tempClients[i]?.clientName;
            }
        }
        for (var j = 0; j < tempDepartment?.length; j++) {
            if (
                tempDepartment[j]?.departmentId === item?.departmentId &&
                tempDepartment[j]?.clientId === item?.clientId
            ) {
                departmentName = tempDepartment[j]?.departmentName;
            }
        }
        return {
            ...item,
            clientName: clientName,
            departmentName: departmentName,
            groupId: clientName + ' - ' + (!!departmentName ? departmentName : 'All'),
            clientSaveId: item?.clientId,
        };
    });

    return tempAssignUsersList;
};

// lakshmi

export const generateFilterOptions = (
    data,
    setuserListWithoutRole,
    stateClientId,
    withRole,
    companies,
    pageHeaderdepartmentName,
    pageHeaderdepartmentId,
    licenseTypeId,
    isAgency,
) => {
    const clients = data.ClientDetails || [];
    const departments = data.DepartmentDetails || [];
    const users = data.UserDetails || [];
    const assignUserList = data.AssignUser;
    let parentCommonUser1 = users.filter(
        (user) =>
            user.clientId === (Number(licenseTypeId) === 3 ? stateClientId + 1 : stateClientId) &&
            user.departmentId === 0,
    );
    let parentCommonUser2 = [];
    if (Number(licenseTypeId) === 3 || isAgency) {
        parentCommonUser2 = users.filter((user) => user.clientId === stateClientId && user.departmentId === 0);
    }
    const parentCommonUser = [...parentCommonUser1, ...parentCommonUser2];
    const filterOptions = clients
        .filter((client) => !client.isParent)
        .map((client) => {
            // console.log(client, 'client');
            const clientDepartments = departments.filter(
                (dept) => dept.clientId === client.clientId && dept.departmentName !== 'All',
            );
            const items = clientDepartments.map((dept) => {
                let deptUsers = users.filter(
                    (user) =>
                        (user.clientId === client.clientId &&
                            (user.departmentId === dept.departmentId || user.departmentId === 0)) ||
                        (user.clientId !== client.clientId &&
                            clients.find((c) => c.clientId === user.clientId)?.isParent),
                );

                if (client.clientId === stateClientId + 1) {
                    deptUsers = [...deptUsers];
                } else {
                    deptUsers = [...parentCommonUser, ...deptUsers];
                }

                return {
                    id: dept.departmentId,
                    text: dept.departmentName,
                    departmentId: dept.departmentId,
                    value: deptUsers.map((user) => ({
                        ...user,
                        groupId: `${client.clientName} - ${dept.departmentName}`,
                        departmentSaveId: dept.departmentId,
                        clientSaveId: client.clientId,
                    })),
                    name: {
                        name: `${client.clientName} - ${dept.departmentName}`,
                        id: client.clientId,
                    },
                };
            });

            let allMainUser = [];
            if (client.clientId === stateClientId + 1) {
                allMainUser = users.filter((user) => user.clientId === client.clientId && user.departmentId === 0);
            } else {
                allMainUser = [
                    ...parentCommonUser,
                    ...users.filter(
                        (user) =>
                            (user.clientId === client.clientId && user.departmentId === 0) ||
                            (user.clientId !== client.clientId &&
                                clients.find((item) => item.clientId === user.clientId)?.isParent),
                    ),
                ];
            }

            return {
                id: client.clientId,
                text: (
                    <div>
                        <p>{client.clientName}</p>
                    </div>
                ),
                items,
                value: allMainUser,
                name: {
                    name: `${client.clientName} - All`,
                    id: client.clientId,
                },
            };
        });

    if (assignUserList?.length > 0 || withRole?.length > 0) {
        let initialOption;
        const parentassignUserList = assignUserList?.filter(
            (assign) => assign.clientId === Number(stateClientId + 1) && assign.departmentId === 0,
        );

        if (companies === undefined) {
            // debugger;
            if (pageHeaderdepartmentId !== 0) {
                const filterAssignUser = assignUserList?.filter(
                    (assign) => assign.departmentId === pageHeaderdepartmentId,
                );
                const filterAllUser = filterOptions[0]?.items?.filter(
                    (options) =>
                        options?.text.toLowerCase()?.replaceAll(/\s+/g, '') ===
                            pageHeaderdepartmentName.toLowerCase()?.replaceAll(/\s+/g, '') &&
                        options?.departmentId === pageHeaderdepartmentId,
                )[0]?.value;
                initialOption = filterAllUser?.filter(
                    (user) =>
                        !filterAssignUser?.some(
                            (assign) => assign?.userId === user?.userId && assign?.clientId === user?.clientId,
                        ),
                );
            } else {
                const filterAssignUser = assignUserList?.filter(
                    (assign) => assign.departmentId === pageHeaderdepartmentId,
                );
                initialOption = filterOptions[0]?.value?.filter(
                    (user) =>
                        !filterAssignUser?.some(
                            (assign) => assign?.userId === user?.userId && assign?.clientId === user?.clientId,
                        ),
                );
            }
        } else if (companies) {
            if (parentassignUserList?.length > 0) {
                initialOption = filterOptions[0]?.value.filter(
                    (option) =>
                        !parentassignUserList.some(
                            (role) =>
                                role.userId === option.userId &&
                                role.clientId === option.clientId &&
                                role?.departmentId === option?.departmentId,
                        ),
                );
            } else {
                initialOption = filterOptions[0]?.value.filter(
                    (option) =>
                        !withRole.some(
                            (role) =>
                                role.userId === option.userId &&
                                role.clientId === option.clientId &&
                                role?.departmentId === option?.departmentId,
                        ),
                );
            }
        } else {
            initialOption = filterOptions[0]?.value.filter(
                (option) =>
                    !withRole.some(
                        (role) =>
                            role.userId === option.userId &&
                            role.clientId === option.clientId &&
                            role?.departmentId === option?.departmentId,
                    ),
            );
        }

        // console.log(filterOptions[0]?.value, 'filterOptions[0]?.value');

        setuserListWithoutRole(initialOption);
    } else {
        // console.log(filterOptions[0], 'filterOptions');
        if (companies === undefined) {
            const filterAllUser = filterOptions[0]?.items?.filter(
                (options) =>
                    options?.text.toLowerCase()?.replaceAll(/\s+/g, '') ===
                        pageHeaderdepartmentName.toLowerCase()?.replaceAll(/\s+/g, '') &&
                    options?.departmentId === pageHeaderdepartmentId,
            )[0]?.value;
            setuserListWithoutRole(filterAllUser);
        } else {
            setuserListWithoutRole(filterOptions[0]?.value);
        }
    }
    return filterOptions;
};

export const getCurrentUnAssignUser = (currentUser, assignedUserList, stateClientId, currentDropDown) => {
    // debugger;
    if (!assignedUserList || assignedUserList?.length === 0) {
        return currentUser;
    }

    const matched = assignedUserList?.filter(
        (ass) =>
            ass?.groupId?.toLowerCase()?.replaceAll(/\s+/g, '') ===
            currentDropDown?.toLowerCase()?.replaceAll(/\s+/g, ''),
    );

    const filterCurrentUser = currentUser?.filter(
        (current) => !matched?.some((match) => match.userId === current?.userId),
    );

    const unAssignedUserList = filterCurrentUser.filter(
        (user) =>
            !assignedUserList.some(
                (assign) =>
                    user.userId === assign.userId &&
                    user?.clientId === Number(stateClientId + 1) &&
                    user.departmentId > 0,
            ),
    );

    // console.log(unAssignedUserList, 'unAssignedUserList');
    return unAssignedUserList;
};

export const getSecurityGroup = (data) => {
    const formatSecurityData = Object?.entries(data)?.map(([key, value]) => {
        return {
            groupId: Number(key),
            groupSecurity: value,
        };
    });

    return formatSecurityData;
};

export const getAssignedUsersList = (data) => {
    const { ClientDetails, DepartmentDetails, SecurityGroup, AssignUser } = data;
    const securityData = SecurityGroup && getSecurityGroup(SecurityGroup);

    const result = AssignUser?.map((assign) => {
        const client = ClientDetails.find((client) => client.clientId === assign.clientId);
        const department = DepartmentDetails.find(
            (department) => department.clientId === assign.clientId && department.departmentId === assign.departmentId,
        );
        const security = securityData.find((security) => Number(security.groupId) == Number(assign.roleId));

        let groupId =
            assign.departmentId === 0
                ? `${client.clientName} - All`
                : `${client.clientName} - ${department.departmentName}`;

        return {
            clientId: assign.clientId,
            departmentId: assign.departmentId,
            firstName: assign.firstName,
            lastName: assign.lastName,
            userId: assign.userId,
            groupId: groupId,
            departmentSaveId: assign.departmentId,
            clientSaveId: assign.clientId,
            userTypeId: 4,
            selectedRole: {
                groupId: security ? security.groupId : '',
                groupSecurity: security ? security.groupSecurity : '',
            },
            isKeyPerson: assign.isKeyPerson,
        };
    });

    // console.log(result, 'resutl');

    return result;
};

export const getCurrentUnAssignUserFunc = (data, assignRole, currClient) => {
    const { AssignUser, UserDetails, ClientDetails } = data;
    UserDetails?.forEach(client => {
        const matchingClient = ClientDetails.find(info => info?.clientId === client?.clientId);
        if (matchingClient) {
            client.clientName = matchingClient?.clientName;
            client.isAgency = matchingClient?.isAgency;
        }
    });
    
    if (AssignUser?.length > 0) {
        return UserDetails?.filter(
            (user) =>
                !AssignUser?.some((assign) => user?.clientId === assign?.clientId && user?.userId === assign?.userId),
        );
    } 
    // else if (assignRole?.length > 0) {
    //     return UserDetails?.filter((user) => !assignRole?.some((assign) => assign?.userId === user?.userId));
    // } 
    else {
        return UserDetails;
    }
};

export const getCurrentUnAssignUserList = (data = [], currClientId) => {
  return data?.filter((item) => item.clientId === currClientId);
};


export const getFormatAssignedUser = (assignList) => {
    return assignList?.map((assign) => {
        return {
            ...assign,
            selectedRole: {
                groupId: assign.roleId,
                groupSecurity: assign.role,
            },
        };
    });
};
