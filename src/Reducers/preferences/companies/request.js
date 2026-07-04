import { BRAND_CLIENT_CREATION, CHECK_BU_EXISTS, CLIENT_UNMAPPING, COMPANY_SUBMIT_LICENSEKEY, GET_ADD_COMPANY_SUPPORT, GET_AGENCY_CLIENT_DETAILS, GET_BU_SHARE, GET_CLIENT_DETAILS, GET_COMPANY_LIST, GET_ENTITY_INFO, GET_LOCALIZATION_SETTINGS, GET_USER_LISTING_COMPANY, NEW_COMPANY_VALIDATION, UPDATE_BU_LOCK, UPDATE_BU_SHARE, UPDATE_CLIENT_STATUS, UPDATE_LOCALIZATION_SETTINGS } from 'Constants/EndPoints';
import request from 'Utils/Http';

import {
    updateCompaniesList,
    updateLoadingCompany,
    updateClientDetails,
    updateFailureCompany,
    updateLocalizationDetails,
    updateshareBus,
    updateCompanyAddSupportDatas,
    resetCompaniesReducer,
} from './reducer';
import { savePricingConfig } from 'Reducers/login/newUser/request';
import { updateClientList, updateCompanyList } from 'Reducers/globalState/reducer';
import { resetNewUserFormState } from 'Reducers/login/newUser/reducer';
import { encodeUrl, encryptWithAES, decryptWithAES } from 'Utils/modules/crypto';
import CacheManager from 'Utils/cacheManager';
export const getCompanyDetails =
    ({ payload, loading = false }) =>
        async (dispatch, getState) => {
            dispatch(updateLoadingCompany(true));
            return dispatch(
                request.post({
                    url: GET_COMPANY_LIST,
                    payload,
                    loading: loading,
                    ok: ({ data }) => {
                        const { status, data: response } = data;
                        const list = status ? response : [];
                        dispatch(updateCompaniesList(list));
                        if (status) {
                            dispatch(updateCompanyList(response));
                            try {
                                const currentClientList = getState().globalstate.clientList || [];
                                const updatedClientList = [...currentClientList];
                                response.forEach((company) => {
                                    if (company.isActivated || company.isActivated === 1) {
                                        const index = updatedClientList.findIndex((c) => c.clientId === company.clientId);
                                        const mappedCompany = {
                                            clientId: company.clientId,
                                            clientName: company.clientName,
                                            logoPath: company.logoPath || company.logo || '',
                                            licenseTypeId: company.licenseTypeId,
                                            parentClientId: company.parentclientId || company.parentClientId || null,
                                        };
                                        if (index > -1) {
                                            updatedClientList[index] = {
                                                ...updatedClientList[index],
                                                ...mappedCompany,
                                            };
                                        } else {
                                            updatedClientList.push(mappedCompany);
                                        }
                                    }
                                });
                                dispatch(updateClientList(updatedClientList));
                                const userInfoStr = localStorage.getItem('userInfo');
                                if (userInfoStr) {
                                    const userInfo = JSON.parse(decryptWithAES(userInfoStr));
                                    userInfo.clientList = updatedClientList;
                                    localStorage.setItem('userInfo', encryptWithAES(JSON.stringify(userInfo)));
                                    CacheManager.set('userDetails', userInfo);
                                }
                            } catch (err) {
                                console.error('Failed to sync clientList from GET_COMPANY_LIST response', err);
                            }
                        }
                        if (!status) dispatch(updateFailureCompany(true));
                    },
                    fail: (wrr) => {
                        dispatch(updateFailureCompany(true));
                    },
                    final: () => dispatch(updateLoadingCompany(false)),
                }),
            );
        };
export const getCompanyClientDetails =
    ({ payload, isAgency, loading = true }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: isAgency ? GET_AGENCY_CLIENT_DETAILS : GET_CLIENT_DETAILS,
                payload,
                loading,
                ok: ({ data }) => {
                    const { status, data: res } = data;
                    if (status) {
                        dispatch(updateClientDetails(res));
                    } else {
                        dispatch(updateClientDetails({}));
                    }
                },
                fail: () => {},
            }),
        );
    };

export const getCompanySettingsDetails =
    ({ payload, loading = true }) =>
        async (dispatch) =>
            dispatch(
                request.post({
                    url: GET_LOCALIZATION_SETTINGS,
                    payload,
                    loading,
                    ok: ({ data }) => {
                        const { status, data: res } = data;
                        if (status) {
                            dispatch(updateLocalizationDetails(res));
                        } else {
                            dispatch(updateLocalizationDetails({}));
                        }
                    },
                    fail: () => { },
                }),
            );

export const updateLocalization =
    (payload, navigate, clientBranchTypeId, isAccountSettings, loading = false) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: UPDATE_LOCALIZATION_SETTINGS,
                payload,
                loading,
            ok: ({ data }) => {
                const { status, data: res } = data;
                if (status) {
                    //dispatch(getBUList({ userId: payload.userId, clientId: payload?.clientId }),);
                    dispatch(resetCompaniesReducer());

                    if (isAccountSettings || parseInt(clientBranchTypeId, 10) === 3) {
                        navigate('/preferences');
                    } else {
                        navigate('/preferences/company-list');
                    }
                }
            },
            fail: (err) => {
            },
        }),
    );
}

export const updateBULock = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: UPDATE_BU_LOCK,
            payload,
            loading: true,
            ok: () => { },
            fail: (err) => {
            },
        }),
    );
};

export const getShareBUDatas = (payload) => async (dispatch) => {
    dispatch(
        request.post({
            url: GET_BU_SHARE,
            payload,
            loading: true,
            ok: ({ data }) => {
                if (data?.status) dispatch(updateshareBus(data?.data));
            },
            fail: (err) => {
            },
        }),
    );
};

export const updateShareBU = (payload) => async (dispatch) => {
    dispatch(
        request.post({
            url: UPDATE_BU_SHARE,
            payload,
            loading: true,
            ok: () => { },
            fail: (err) => {
            },
        }),
    );
};

export const checkIsBUExists =
    ({ payload }) =>
        async (dispatch) => {
            return dispatch(
                request.post({
                    url: CHECK_BU_EXISTS,
                    payload,
                    isToast: false,
                    ok: (res) => { },
                    fail: (err) => { },
                }),
            );
        };

export const getAddCompanyDatas =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_ADD_COMPANY_SUPPORT,
                payload,
                loading,
                ok: ({ data }) => {
                    if (data?.status) dispatch(updateCompanyAddSupportDatas(data?.data));
                },
                fail: () => {},
            }),
        );

export const addCompany = (payload, navigate) => async (dispatch) => {
    return dispatch(
        request.post({
            url: BRAND_CLIENT_CREATION,
            payload,
            loading: true,
            isFailureCheck: true,
            ok: ({ data }) => {
                if (data?.status) {
                    const payloadSave = savePricingConfig(data?.data?.clientId, payload.CompanyDetail[0].licenseTypeId);
                    // dispatch(savePricingDetails({ payloadSave, navigate, from: 'companies' }));
                    dispatch(resetNewUserFormState());
                    navigate('/preferences/company-list');
                }
            },
            fail: (err) => {
            },
        }),
    );
};

export const checkNewCompanyValidation = (payload, navigate) => async (dispatch) => {
    dispatch(
        request.post({
            url: NEW_COMPANY_VALIDATION,
            payload,
            loading: true,
            ok: ({ data }) => {
                const { status, message } = data;
                if (!status) {
                    // if (message === 'Account not activated' || message === 'Payment not completed') {
                    if (message === 'Payment not completed') {
                        // navigate('payment', {
                        //     // state: {
                        //     //     clientId: data.clientId,
                        //     //     userId: data.userId,
                        //     //     invoiceID: data.invoiceData.invoiceID,
                        //     //     licenseTypeID: data.licenseTypeID,
                        //     //     clientName: data.clientName,
                        //     //     annualCharge: data.invoiceData.annualCharge,
                        //     //     monthlyCharge: data.invoiceData.monthlyCharge,
                        //     //     totalAmount: data.invoiceData.totalAmount,
                        //     //     discountCode: data.invoiceData.discountCode,
                        //     //     discountamt: data.invoiceData.discountamt,
                        //     //     from: 'companies',
                        //     // },
                        //     state: {
                        //         from: 'companies',
                        //         clientId: data.clientId,
                        //         userId: data.userId,
                        //         licenseTypeID: data.licenseTypeId,
                        //         frequencyId: data.frequency,
                        //         clientName: data.clientName,
                        //         amount: data?.amount,
                        //         monthlyCharge: data?.salePrice,
                        //         tenantShortCode: data?.tenantShortCode,
                        //         orderId: data?.orderId,
                        //     },
                        //  });
                        let url = '/payment';
                        const state = {
                            from: 'companies',
                            clientId: data.clientId,
                            userId: data.userId,
                            licenseTypeID: data.licenseTypeId,
                            frequencyId: data.frequency,
                            clientName: data.clientName,
                            amount: data?.amount,
                            monthlyCharge: data?.salePrice,
                            tenantShortCode: data?.tenantShortCode,
                            orderId: data?.orderId,
                            commitment: data?.commitment
                        }
                        const encryptState = encodeUrl(state);
                        navigate(`${url}?q=${encryptState}`, {
                            state,
                        });

                    } else if (message === 'Licensekey not validated') {
                        let url = '/preferences/company-list/account-activate';
                        const state = {
                            clientId: payload.clientId,
                            LoginName: '',
                            LoginPassword: '',
                            from: 'companies',
                        }
                        const encryptState = encodeUrl(state);
                        navigate(`${url}?q=${encryptState}`, {
                            state,
                        });
                        // navigate('/preferences/company-list/account-activate', {
                        //     state: {
                        //         clientId: data.clientId,
                        //         LoginName: '',
                        //         LoginPassword: '',
                        //         from: 'companies',
                        //     },
                        // });
                        //dispatch(isAgencyState({ isAgency: true }));
                    } else {
                        const payload = {
                            clientId: payload.parentClientId,
                            userId: payload.userId
                        };
                        dispatch(getCompanyDetails({ payload }));
                    }
                }
            },
            fail: (err) => {
            },
        }),
    );
};
export const getCompanyUserList =
    ({ payload, loading = true }) =>
    async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_USER_LISTING_COMPANY,
            payload,
            loading,
            ok: ({ data }) => {
                const { status, message } = data;

            },
            fail: (err) => {
            },
        }),
    );
};

export const companiesSubmitLicenskey = (payload, navigate, clientList, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: COMPANY_SUBMIT_LICENSEKEY,
            payload,
            loading,
            ok: ({ data }) => {
                if (data?.status) {
                    dispatch(updateClientList(clientList));
                    navigate('/preferences/company-list');
                }
            },
            fail: (err) => {
            },
        }),
    );
};

export const approveClientStatus = (payload, callback) => async (dispatch) => {
    dispatch(
        request.post({
            url: UPDATE_CLIENT_STATUS,
            payload,
            loading: true,
            ok: ({ data }) => {
                if (callback) callback(data);
            },
            fail: (err) => {
                console.error('approveClientStatus failed', err);
            },
        }),
    );
};

export const rejectClientMapping = (payload, callback) => async (dispatch) => {
    dispatch(
        request.post({
            url: CLIENT_UNMAPPING,
            payload,
            loading: true,
            ok: ({ data }) => {
                if (callback) callback(data);
            },
            fail: (err) => {
                console.error('rejectClientMapping failed', err);
            },
        }),
    );
};

export const getEntityInfo = (payload, callback) => async (dispatch) => {
    dispatch(
        request.post({
            url: GET_ENTITY_INFO,
            payload,
            loading: true,
            ok: ({ data }) => {
                if (callback) callback(data);
            },
            fail: (err) => {
                console.error('getEntityInfo failed', err);
            },
        }),
    );
};
