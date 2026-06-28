import { getUserDetails } from 'Utils/modules/crypto';
import { createSelector } from 'reselect';
export const authState = createSelector(
    (state) => state.globalstate,
    (state) => state.isAuth,
);
export const getRequestApprovalList = createSelector(
    (state) => state.globalstate,
    (state) => state.approvalList,
);
export const getSessionId = createSelector( 
    (state) => state.globalstate,
    (state) => {
        const { userId, licenseTypeId
              ,  isAgency 
              ,  clientId: userClientId
              ,  departmentId: userDepartmentId
              ,  departmentName: userDepartmentName
              ,  parentClientId: userParentClientId
              } = getUserDetails();
        const departmentSource = state?.departmentId ?? userDepartmentId ?? {};
        const clientSource = state?.clientId ?? userClientId ?? {};
        const resolvedDepartmentId = departmentSource?.departmentId ?? (typeof departmentSource === 'number' ? departmentSource : 0);
        const resolvedClientId = clientSource?.clientId ?? (typeof clientSource === 'number' ? clientSource : 0);
        return {
            departmentId: resolvedDepartmentId,
            clientId: resolvedClientId,
            parentClientId: state?.parentClientId ?? userParentClientId ?? 0,
            departmentName: departmentSource?.departmentName ?? userDepartmentName ?? '',
            userId: userId,
            isAgency: isAgency,
        };
    },
);
export const getGlobalClientList = createSelector(
    (state) => state.globalstate,
    (state) => state.clientList,
);

export const getGlobalAccountAdmin = createSelector(
    (state) => state.globalstate,
    (state) => state.accountAdmin,
);
export const getGlobalBUList = createSelector(
    (state) => state.globalstate,
    (state) => state.departmentList,
);
export const getGlobalCompanyBUList = createSelector(
    (state) => state.globalstate,
    (state) => state.company_departmentList,
);

export const getUtcTimeData = createSelector(
    (state) => state.globalstate,
    (state) => state.utcTimeData,
);
