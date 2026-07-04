const editUser = (props) => {
    return <span>{props}</span>;
};

export { editUser };

const handleKeyInfoPersonValue = (roleId, keyPersonValue) => {
    if (roleId === 5 || roleId === 4) { // superUser //Admin
        return keyPersonValue;
    } else {
        return false;
    }
};

export const buildPayloadAssignUser = (assignRole, clientId, departmentId, currentUserId, unifiedUserList) => {
    const existingRoleList = (unifiedUserList || []).flatMap((user) => {
        const userID = user.userID || user.userId;
        return (user.assignments || []).map((assign) => ({
            userId: userID,
            roleId: assign.roleID || assign.roleId,
            clientId: assign.clientID || assign.clientId,
            departmentId: assign.departmentID || assign.departmentId,
            IsKeyPerson: handleKeyInfoPersonValue(assign.roleID || assign.roleId, assign.isKeyPerson) || false,
        }));
    });

    const stagedRoleList = (assignRole || []).flatMap((user) => {
        const userID = user.userID || user.userId;
        return (user.selectedBUs || []).map((bu) => {
            const roleId = bu?.selectedRole?.groupId ?? (bu.roleId || 0);
            return {
                userId: userID,
                roleId: roleId,
                clientId: bu.clientID || bu.clientId || clientId,
                departmentId: bu.departmentID || bu.departmentId || departmentId,
                IsKeyPerson: handleKeyInfoPersonValue(roleId, bu.isKeyPerson) || false,
            };
        });
    });

    const userRoleList = [...stagedRoleList, ...existingRoleList].reduce((acc, current) => {
        const exists = acc.find(
            (item) =>
                item.userId === current.userId &&
                item.clientId === current.clientId &&
                item.departmentId === current.departmentId
        );
        if (!exists) {
            acc.push(current);
        }
        return acc;
    }, []);

    const payload = {
        userId: currentUserId,
        clientId: clientId,
        userRoleList,
    };

    return payload;
};
