import { CLIENT_ID_CHANGE_DATA, DEPARTMENT_ID_CHANGE_DATA, GET_ACTIVE_DST_TIMEZONES, GET_BU_DATA, GET_IP_ADDRESS_DATA, GET_KEY_PERSON_INFO_OTP, GET_MASTER_DATA, GET_USER_DETAILS, GET_USER_LIST_CAMPAIGN, GET_UTC_TIME_NOW, REQUEST_KEY_PERSON_OTP } from 'Constants/EndPoints';
import request from 'Utils/Http';
import {
    updateApprovalList,
    updateBUByClient,
    getKeyUserInfo,
    updateBUByClientCompany,
    updateUtcTimeData,
    setDepartmentChangePending,
    getGlobalStateValue,
} from 'Reducers/globalState/reducer';
import { getUserDetails } from 'Utils/modules/crypto';
import { formatName } from 'Utils/modules/formatters';
import { updateDepartmentList } from 'Utils/modules/brandStorage';

const normalizeDepartmentResponse = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.departmentList)) return value.departmentList;
    return [];
};

const getDepartmentsExcludingAll = (departments = []) =>
    departments.filter((list) => list && formatName(list?.departmentName) !== 'all');

export const getMasterData = (loading = false) => async (dispatch) => {
    const result = await dispatch(
        request.post({
            url: GET_MASTER_DATA,
            loading: loading,
            ok: ({ data }) => {
                const masterPayload = data?.data ?? data;
                if (masterPayload && Object.keys(masterPayload)?.length) {
                    localStorage.setItem('masterData', JSON.stringify(masterPayload));
                }
            },
            fail: (err) => {},
        }),
    );
    try {
        const cached = localStorage.getItem('masterData');
        if (cached) return JSON.parse(cached);
    } catch {
        // ignore parse errors
    }
    return result?.data ?? result;
};
export const getIpAddressData =
    ({ payload }) =>
    async (dispatch) => {
        dispatch(
            request.post({
                url: GET_IP_ADDRESS_DATA,
                payload,
                ok: ({ data }) => {
                    const { status, data: response } = data;
                    if (Object.keys(response)?.length) {
                        localStorage.setItem('ipAddressData', JSON.stringify(response));
                    }
                },
                fail: (err) => {},
            }),
        );
    };
export const getUserListCampaign =
    ({ payload ,loading = true}) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_USER_LIST_CAMPAIGN,
                payload,
                loading: loading,
                ok: ({ data }) => {
                    const { status, data: response , message = 'No data available' } = data;
                    if (status) {
                        dispatch(updateApprovalList(response));
                        // dispatch(
                        //     update_failures_API_Errors({
                        //         field: 'approvaluserList',
                        //         message: '',
                        //     }),
                        // );
                    } else {
                        // dispatch(
                        //     update_failures_API_Errors({
                        //         field: 'approvaluserList',
                        //         message: message || 'No data available',
                        //     }),
                        // );
                        dispatch(updateApprovalList([]));
                    }
                },
            }),
        );
    };

export const getRequestApprovalUserDetails =
    ({ payload ,loading = false}) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_USER_DETAILS,
                payload,
                loading: loading,
                ok: ({ data }) => {
                    const { status, data: response } = data;
                    if (status) {
                        dispatch(updateApprovalList(response));
                    } else {
                        dispatch(updateApprovalList([]));
                    }
                },
                fail: (err) => {
                                    },
            }),
        );

export const clientIdChangeData = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: CLIENT_ID_CHANGE_DATA,
            payload,
            loading: true,
            ok: ({ data }) => {
                const { status, accessToken } = data;
                if (status) {
                    // localStorage.setItem('accessToken', accessToken);
                }
            },
            fail: (err) => {},
        }),
    );
};

export const departmentIdChangeData = (payload, loading = true) => async (dispatch) => {
    dispatch(setDepartmentChangePending(true));
    try {
        return await dispatch(
            request.post({
                url: DEPARTMENT_ID_CHANGE_DATA,
                payload,
                loading: loading,
                ok: ({ data }) => {
                    const { status, accessToken } = data;
                    if (status) {
                        // localStorage.setItem('accessToken', accessToken);
                    }
                },
                fail: (err) => {},
            }),
        );
    } finally {
        dispatch(setDepartmentChangePending(false));
    }
};

export const getBUList = (
    payload,
    agency = false,
    company = false,
    currDepId,
    fromCompanies = false,
    loading = true,
) => async (dispatch) => {
  return  dispatch(
        request.post({
            url: GET_BU_DATA,
            payload,
            loading,
            ok: ({ data }) => {
                const { status, data: res } = data;
                const departmentList = normalizeDepartmentResponse(res);
                if (status) {
                    if (company) {
                        dispatch(
                            updateBUByClientCompany({
                                company_clientId: agency,
                                company_departmentId: departmentList[0],
                                company_departmentList: departmentList,
                            }),
                        );
                    } else {
                        const departmentsExcludingAll = getDepartmentsExcludingAll(departmentList);
                        const currentDepartment =
                            departmentsExcludingAll.find((item) => item?.departmentId === currDepId) ||
                            departmentsExcludingAll[0] ||
                            departmentList[0];
                        dispatch(
                            updateBUByClient({
                                clientId: agency,
                                departmentId: currentDepartment,
                                departmentList: departmentsExcludingAll,
                            }),
                        );
                        dispatch(
                            updateBUByClientCompany({
                                company_clientId: agency,
                                company_departmentId: departmentList[0],
                                company_departmentList: departmentList,
                            }),
                        );
                        updateDepartmentList(departmentsExcludingAll);
                    }
                } else {
                    dispatch(
                        updateBUByClient({
                            clientId: agency,
                            departmentId: {},
                            departmentList: [],
                        }),
                    );
                    dispatch(
                        updateBUByClientCompany({
                            company_clientId: agency,
                            company_departmentId: {},
                            company_departmentList: [],
                        }),
                    );
                }
            },
            fail: (err) => {},
        }),
    );
};

export const repairPersistedGlobalListsIfNeeded = () => async (dispatch, getState) => {
    if (!localStorage.getItem('accessToken')) return;

    const { licenseTypeId, isAgency, userId: profileUserId } = getUserDetails();
    const licenseNum = parseInt(licenseTypeId, 10);
    if (!Number.isFinite(licenseNum) || licenseNum <= 0) return;

    const gs = getState()?.globalstate;
    const profileUid = Number(profileUserId);
    let userId = Number(gs.userId) > 0 ? Number(gs.userId) : profileUid;
    if (!Number.isFinite(userId) || userId <= 0) {
        if (Number.isFinite(profileUid) && profileUid > 0) {
            dispatch(getGlobalStateValue({ field: 'userId', data: profileUid }));
            userId = profileUid;
        }
    }
    if (!Number.isFinite(userId) || userId <= 0) return;

    const agency = gs.company_clientId?.clientId != null ? gs.company_clientId : gs.clientId;
    const clientIdNum =
        agency && typeof agency === 'object' && agency.clientId != null
            ? Number(agency.clientId)
            : Number(agency);
    if (!Number.isFinite(clientIdNum) || clientIdNum <= 0) return;

    const deptEmpty = !Array.isArray(gs.departmentList) || gs.departmentList.length === 0;
    const companyDeptEmpty = !Array.isArray(gs.company_departmentList) || gs.company_departmentList.length === 0;
    if (!deptEmpty && !companyDeptEmpty) return;

    const wantsBuData = licenseNum === 3 || isAgency === true;
    if (!wantsBuData) return;

    const agencyArg =
        agency && typeof agency === 'object' && agency.clientId != null ? agency : { clientId: clientIdNum };

    await dispatch(getBUList({ userId, clientId: clientIdNum }, agencyArg, false, undefined, false, false));
};

export const getUserInfoDetailsForOTP = (payload, loading = true) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_KEY_PERSON_INFO_OTP,
            payload,
            loading: loading,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
                if (status) {
                    dispatch(getKeyUserInfo({ field: 'userOTPInfo', data: data }));
                }else{
                    dispatch(getKeyUserInfo({ field: 'userOTPInfo', data: {} }));
                }
            },
            fail: (err) => {
                            },
        }),
    );
};
export const requestKeyPersonOTP = (payload, setMessage, resend = false, loading = true) => async (dispatch) => {
    return dispatch(
        request.post({
            url: REQUEST_KEY_PERSON_OTP,
            payload,
            loading,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
                if (status) {
                    dispatch(getKeyUserInfo({ field: 'userOTPToken', data: data }));
                    if(resend){setMessage('OTP resent successfully');}
                   else {setMessage('OTP sent successfully');}
                    setTimeout(() => {
                        setMessage(null);
                    }, 2000);
                }
            },
            fail: (err) => {
                            },
        }),
    );
};

export const getUtcTimeNow = (loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_UTC_TIME_NOW,
            loading: loading,
            ok: ({ data }) => {
                dispatch(updateUtcTimeData(data));
            },
            fail: (err) => {
                            },
        }),
    );
};

export const getActiveDSTTimezones = (loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_ACTIVE_DST_TIMEZONES,
            loading: loading,
            ok: ({ data }) => {},
            fail: (err) => {},
        }),
    );
};
