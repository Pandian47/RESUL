import { ADUSER_EXISTS, AGENCY_ACCOUNT_ACTIVATION, AGENCY_SUBMIT_LICENSE_KEY, AGENCY_VERIFY_LICENSE_KEY, COMFIRM_LOGIN, EMAIL_EXIST, FORGOT_PASSWORD, GETJWTDESKPRO, KYAKOFORMSUBMISSION, LICENSE_STATUS, LOGIN_VALIDATE, LOGOUT, SUBMIT_LICENSE_KEY, UPDATE_PASSWORD, VALIDATE_LOGIN_OTP, VALIDATE_OTP, VERIFY_LICENSE_KEY } from 'Constants/EndPoints';
import request from 'Utils/Http';
import { v4 as uuid } from 'uuid';
import { encodeUrl, encryptWithAES, clearAllQueryStates } from 'Utils/modules/crypto';
import { formatName } from 'Utils/modules/formatters';
import { replacePlusWithEncoded } from 'Utils/modules/display';
import { getDayDifference, getRenewalMessage } from 'Utils/modules/renewal';
import { getBrowserName, getFirefoxVersion } from 'Utils/modules/browserUtils';
import { getEnvironment } from 'Utils/modules/environment';

import { showToast } from 'Components/CustomToast/CustomToast';
import {
    updateLicenseKeyState,
    updateOTPState,
    updateOtpValidState,
    resendLoginOTP,
    isForgotState,
    resetLoginFormState,
    isAgencyState,
    resendEmail,
    updateQrCode,
    updateOtpToken,
    updateisAuthQrScan
} from './reducer';
import { resetGlobalState, updateAccountAdmin, updateAuth, updateBUList, updateBuAndDepId, updateClientBranch, updateClientList, updateSessionModal, updateisClientID, updatedisLicenseId, updateBUByClient, updateBUByClientCompany, updateIndustryId, updateCurrentPageConfig, update_user_email_id, updateRenewalData, getGlobalStateValue, notifySessionRecovered, reset_global_loading } from 'Reducers/globalState/reducer';

import { resetdashboardState } from 'Reducers/dashboard/dashboardReducer';
import { resetTargetListData } from 'Reducers/audience/targetList/reducer';
import { getIsPartnerDataEnable } from 'Reducers/audience/masterdata/request';
import { isAgencyBrandState, resetNewUserFormState } from '../newUser/reducer';
import { updateHQData } from 'Reducers/preferences/accountSettings/request';
import { setWelcomeModal } from 'Reducers/preferences/myProfile/reducer';
import CacheManager from 'Utils/cacheManager';
import { mountFullAppReducer } from 'Store/mountFullAppReducer';
import { getStoreInstance } from 'Store/storeRef';
import { prefetchPostLoginShell, resolvePostLoginTarget, SESSION_RECOVERED_EVENT } from 'Utils/modules/postLoginShell';

export const accountResponse = async (response, navigate, dispatch, lastURL = '') => {
    const {
        licenseTypeId,
        isAgency,
        permissionList,
        clientList,
        departmentList,
        accessToken,
        reqs,
        clientId,
        timeZoneId,
        timeFormatId,
        dateFormatId,
        industryId,
        jwtToken,
    } = response;
    const UniqueID = uuid();
    let temp = {};
    permissionList.forEach((permission) => {
        temp[permission.featureId.toString()] = permission;
    });
    CacheManager.set('permissions', temp);
    temp = encryptWithAES(JSON.stringify(temp));
    const tempMasterData = localStorage.getItem('masterData');
    const tempipAddressData = localStorage.getItem('ipAddressData');
    const tempdisable_plugin_last_shown = localStorage.getItem('disable_plugin_last_shown');
    const tempNewVersionConfirm = localStorage.getItem('newVersionConfirm');
    let temp_session_credentials = localStorage.getItem('sessionCredentials');
    localStorage.clear();
    // if (tempMasterData) {
    //     localStorage.setItem('masterData', tempMasterData);
    // }
    if (tempipAddressData) {
        localStorage.setItem('ipAddressData', tempipAddressData);
    }
    if (tempdisable_plugin_last_shown) {
        localStorage.setItem('disable_plugin_last_shown', tempdisable_plugin_last_shown);
    }
    if (temp_session_credentials) {
        localStorage.setItem('sessionCredentials', temp_session_credentials);
    }
    localStorage.setItem('newVersionConfirm', tempNewVersionConfirm);
    dispatch(updatedisLicenseId(parseInt(licenseTypeId, 10)));
    dispatch(updateIndustryId(industryId));
    localStorage.setItem('licenseTypeId', encryptWithAES(licenseTypeId));
    const { clientList: clientListData, ...rest } = response;
    localStorage.setItem('userInfo', encryptWithAES(JSON.stringify(rest)));
    CacheManager.set('userDetails', rest);
    localStorage.setItem('permissions', temp);
    localStorage.setItem('uuiD', UniqueID);
    localStorage.setItem('accessToken', reqs);
    // localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('jwtToken', jwtToken);
    //localStorage.removeItem('captchaRetry');
    localStorage.setItem('timeFormatId', timeFormatId);
    localStorage.setItem('dateFormatId', dateFormatId);
    localStorage.setItem('timeZoneId', timeZoneId);

    // Firefox browser support notification
    const ffVersion = getFirefoxVersion();
    // if (getBrowserName() === 'Firefox' && ffVersion >= 148) {
    //     showToast(`Some Kendo features unsupported in Firefox 148+.`, null, null, false, null, true, 5000);
    // }

    // Trigger storage event to notify other tabs about login
    localStorage.setItem('loginEvent', Date.now().toString());

    const getDepartmentsExcludingAll = parseInt(licenseTypeId, 10) === 3 ? response?.departmentList?.filter(
        (list) => formatName(list.departmentName) !== 'all',
    ) : departmentList;

    const getDepartmentAll = parseInt(licenseTypeId, 10) === 3 ? response?.departmentList?.filter(
        (list) => formatName(list.departmentName) === 'all',
    ) || [] : departmentList;
    dispatch(updateClientList(response?.clientList || []));
    dispatch(updateAccountAdmin(response?.accountAdmin || {}));

    dispatch(updateBUList(getDepartmentsExcludingAll || []));
    setTimeout(() => {
        dispatch(resetLoginFormState());
    }, 1000)
    dispatch(
        updateBUByClient({
            clientId: clientId,
            departmentId: getDepartmentsExcludingAll?.[0] || {},
            departmentList: getDepartmentsExcludingAll,
        }),
    );

    dispatch(
        updateBUByClientCompany({
            company_clientId: clientList?.[0],
            company_departmentId: getDepartmentsExcludingAll?.[0] || getDepartmentAll?.[0] || {},
            company_departmentList: [...getDepartmentAll, ...getDepartmentsExcludingAll],
        }),
    );
    if (licenseTypeId === '3' || isAgency) {
        dispatch(
            updateBuAndDepId({
                clientId: clientList?.[0] || {},
                departmentId: getDepartmentsExcludingAll?.[0] || {},
                parentClientId: clientId,
                rfaStatus: getDepartmentsExcludingAll?.[0]?.isRFA,
            }),
        );
    } else {
        dispatch(
            updateBuAndDepId({
                clientId: {
                    clientId: clientId,
                    clientName: '',
                },
                departmentId: getDepartmentsExcludingAll?.[0] || {},
                rfaStatus: getDepartmentsExcludingAll?.[0]?.isRFA,
            }),
        );
    }
    const firstDept = getDepartmentsExcludingAll?.[0];
    const depId = firstDept?.departmentId;
    const cliId = licenseTypeId === '3' || isAgency ? clientList?.[0]?.clientId : clientId;
    const uid = response?.userId;
    const isRun = getEnvironment() === 'RUN';
    dispatch(getGlobalStateValue({ field: 'userId', data: uid }));

    const branchTypeStatus = new URLSearchParams(window.location.search).get('branchTypeStatus');
    if (branchTypeStatus !== null) {
        const hqPayload = {
            clientId: parseInt(atob(branchTypeStatus).split('&')[0], 10),
            clientBranchTypeId: parseInt(atob(branchTypeStatus).split('&')[1], 10),
        };
        void mountFullAppReducer().then(() =>
            dispatch(updateHQData({ payload: hqPayload })).then((res) => {
                dispatch(updateClientBranch(res?.status ? res.status : false));
            }),
        );
    } else {
        dispatch(updateisClientID(false));
    }

    const postLoginTarget = resolvePostLoginTarget(response, lastURL, licenseTypeId, departmentList);
    void mountFullAppReducer();
    void prefetchPostLoginShell(postLoginTarget);

    dispatch(updateAuth(true));

    if (lastURL !== '') {
        navigate(lastURL, {
            state: { from: 'login' },
        });
    } else if (response?.isCampaign && response?.isAudience === 1) {
        (window.location.hostname === 'run.resulticks.com' ||
            window.location.hostname === 'run19.resulticks.com') &&
            localStorage.setItem('previousVersionModal', true);
        const encryptState = encodeUrl({ index: 0 });
        navigate(`${'/dashboard'}?q=${encryptState}`, {
            state: { from: 'login' },
        });
    } else if (!response?.isCampaign && response?.isAudience === 1) {
        const encryptState = encodeUrl({ index: 0 });
        navigate(`/audience?q=${encryptState}`, {
            state: { index: 0, from: 'login' },
        });
    } else if (licenseTypeId === '3') {
        const isDepartmentListInvalid = departmentList?.every(
            (department) => parseInt(department?.departmentId, 10) === 0,
        );

        if ((departmentList?.length === 1 && isDepartmentListInvalid) || !departmentList?.length) {
            const url = '/preferences/company-list/add-companies';
            const state = {
                isBu: true,
                clientId: clientList?.[0].clientId,
                mode: 'edit',
                page: 'NEW_COMPANY',
                licenseTypeId,
                currClientId: clientList?.[0].clientId,
                currClient: clientList?.[0],
                fromLogin: true,
                from: 'login',
                needBUs: true,
            };
            const encryptState = encodeUrl(state);
            navigate(`${url}?q=${encryptState}`, {
                state,
            });
            dispatch(updateCurrentPageConfig({ state }));
        } else {
            navigate('/launch-pad', {
                state: { from: 'login' },
            });
        }
    } else {
        navigate('/launch-pad', {
            state: { from: 'login' },
        });
    }
    // dispatch(getIsPartnerDataEnable({ departmentId: depId, clientId: cliId, userId: uid }));
    dispatch(checkRenewalStatus({ payload: { clientId: clientId } }));
    dispatch(
        updateOtpValidState({
            isOtpValid: true,
            showFlag: true,
            accessToken: accessToken || '',
        }),
    );

    const pendingSessionRecovery = getStoreInstance()?.getState()?.globalstate?.pendingSessionRecovery;
    if (pendingSessionRecovery || lastURL !== '') {
        dispatch(reset_global_loading());
        dispatch(notifySessionRecovered());
        window.dispatchEvent(new CustomEvent(SESSION_RECOVERED_EVENT));
    }
};

export const emailExist =
    ({ payload, setError, value, loading = true }) =>
        async (dispatch) =>
            dispatch(
                request.post({
                    url: EMAIL_EXIST,
                    payload,
                    isToast: false,
                    loading,
                    ok: ({ data }) => {
                        if (!data.status) {
                            setError('emailId', {
                                type: 'server',
                                message: data.message,
                            });
                        }
                        dispatch(resendEmail({ forgotEmail: value }))
                    },
                    fail: (err) => { },
                }),
            );

export const checkADUserExists =
    ({ payload, setError, value, loading = false }) =>
        async (dispatch) =>
            dispatch(
                request.post({
                    url: ADUSER_EXISTS,
                    payload,
                    isToast: false,
                    loading,
                    ok: ({ data }) => {
                        if (!data.status) {
                            setError('emailId', {
                                type: 'server',
                                message: data.message,
                            });
                        }
                    },
                    fail: (err) => { },
                }),
            );
export const loginExistingUser =
    ({ payload, navigate, setError, setValue, isLoading = true, setMsg, resend = false, setIsUserBlocked = false, emailId = '', password = '', rememberMe }) =>
        async (dispatch) => {
            return dispatch(
                request.post({
                    url: LOGIN_VALIDATE,
                    payload,
                    isToast: false,
                    loading: isLoading,
                    ok: async ({ data }) => {
                        const { data: response } = data;
                        if (data?.qrCode) {
                            dispatch(updateQrCode(data.qrCode));
                        } else {
                            dispatch(updateQrCode(""));
                        }
                        if (data?.otpToken) {
                            dispatch(updateOtpToken(data.otpToken));
                        } else {
                            dispatch(updateOtpToken(""));
                        }
                        if (data?.status) {
                            dispatch(updateisAuthQrScan(data?.isAuthQRScan));
                        } else {
                            dispatch(updateisAuthQrScan(false));
                        }
                        if (!data.status) {
                            if (data.message === 'Payment not completed') {
                                let url = '/payment';
                                const state = {
                                    clientId: data?.clientId,
                                    userId: data.userId,
                                    amount: data?.amount,
                                    licenseTypeID: data.licenseTypeId,
                                    frequencyId: data?.frequency,
                                    clientName: data?.clientName,
                                    monthlyCharge: data?.salePrice,
                                    tenantShortCode: data?.tenantShortCode,
                                    orderId: data?.orderId,
                                    commitment: data?.commitment,
                                };
                                const encryptState = encodeUrl(state);
                                navigate(`${url}?q=${encryptState}`, {
                                    state,
                                });
                                // navigate('/payment', {
                                //     state: {
                                //         clientId: data?.clientId,
                                //         userId: data.userId,
                                //         amount: data?.amount,
                                //         // invoiceID: data.invoiceData.invoiceID,
                                //         //  licenseTypeID: data.invoiceinfo?.licenseType,
                                //         licenseTypeID: data.licenseTypeId,
                                //         frequencyId: data?.frequency,
                                //         clientName: data?.clientName,
                                //         // annualCharge: data.invoiceData.annualCharge,
                                //         //  monthlyCharge: data.invoiceinfo?.salePrice,
                                //         monthlyCharge: data?.salePrice,
                                //         tenantShortCode: data?.tenantShortCode,
                                //         orderId: data?.orderId,
                                //         //totalAmount: data.invoiceData.totalAmount,
                                //         //  discountCode: data.invoiceinfo.discountCode,
                                //         // discountamt: data.invoiceinfo.discountamt,
                                //     },
                                // });
                            } else if (data.message === 'Account not activated') {
                                setError('emailId', {
                                    type: 'custom',
                                    message: data.message,
                                });
                                setValue('password', '');
                            } else if (data.message === 'Licensekey not validated') {
                                let url = '/account-activate';
                                let state;
                                if (
                                    parseInt(atob(new URLSearchParams(window.location.search).get('id')), 10) ===
                                    data.clientId
                                ) {
                                    state = {
                                        ipAddress: payload?.ipAddress,
                                        countryName: payload.countryName,
                                        countryCode: payload.countryCode,
                                        hashval: replacePlusWithEncoded(payload?.hashval), //
                                        userAgent: payload?.userAgent,
                                        clientId: data.clientId,
                                        LoginName: replacePlusWithEncoded(payload.loginName), //
                                        LoginPassword: replacePlusWithEncoded(payload.loginPassword), //replace + change to %2B
                                        isLicenseKeyValue: atob(new URLSearchParams(window.location.search).get('lkey')),
                                        from: 'login'
                                    };
                                } else {
                                    state = {
                                        ipAddress: payload?.ipAddress,
                                        countryName: payload.countryName,
                                        countryCode: payload.countryCode,
                                        hashval: replacePlusWithEncoded(payload?.hashval), //
                                        clientId: data.clientId,
                                        LoginName: replacePlusWithEncoded(payload.loginName),
                                        LoginPassword: replacePlusWithEncoded(payload.loginPassword),
                                        isLicenseKeyValue: '',
                                        userAgent: payload?.userAgent,
                                    };
                                }
                                const encryptState = encodeUrl(state);
                                navigate(`${url}?q=${encryptState}`, {
                                    state,
                                });
                                // navigate('/account-activate', {
                                //     state: {
                                //         clientId: data.clientId,
                                //         LoginName: payload.loginName,
                                //         LoginPassword: payload.loginPassword,
                                //     },
                                // });
                                //dispatch(isAgencyState({ isAgency: true }));
                            } else if (data.message === 'Agency Licensekey not validated') {
                                let url = '/account-activate';
                                const state = {
                                    clientId: data.clientId,
                                    isAgency: data.isAgency,
                                    ipAddress: payload?.ipAddress,
                                    countryName: payload.countryName,
                                    countryCode: payload.countryCode,
                                    hashval: replacePlusWithEncoded(payload?.hashval),
                                    LoginName: replacePlusWithEncoded(payload.loginName),
                                    LoginPassword: replacePlusWithEncoded(payload.loginPassword),
                                    isLicenseKeyValue: '',
                                    userAgent: payload?.userAgent,
                                    from: 'login'
                                };
                                const encryptState = encodeUrl(state);
                                navigate(`${url}?q=${encryptState}`, {
                                    state,
                                });
                                //      navigate('/account-activate', {
                                //     state: {
                                //         clientId: data.clientId,
                                //         isAgency: data.isAgency,
                                //     },
                                // });
                            } else if (data.message === 'Agency account not activated') {
                                setError('emailId', {
                                    type: 'custom',
                                    message: data.message,
                                });
                                setValue('password', '');
                                // Agency acc
                                const payload = {
                                    isAgency: true,
                                    isChildAccount: false,
                                    agencyId: data.clientId,
                                };
                                // dispatch(agencyAccountActivation({ payload, navigate }));
                            } else if (data.message === 'Clients not created') {
                                // Agency acc
                                dispatch(isAgencyState({ isAgency: true }));
                                dispatch(
                                    isAgencyBrandState({
                                        agencyId: data.clientId,
                                        userId: data.userId,
                                        isAgencyBrand: true,
                                    }),
                                );
                                const userInfo = { isAgency: true };
                                localStorage.setItem('userInfo', encryptWithAES(JSON.stringify(userInfo)));
                                CacheManager.set('userDetails', userInfo);
                                navigate('/account-setup');
                            }
                            else {
                                let messagecustom = data.message
                                    .replace(/please login after 5 minutes\.?/i, '')
                                    .replace(/passwords/gi, 'pwd')
                                    .trim();
                                const lowerCaseMsg = messagecustom.toLowerCase();
                                const isBlockedOrLocked = lowerCaseMsg.includes("blocked") || lowerCaseMsg.includes("locked");
                                setError('emailId', {
                                    type: 'custom',
                                    message: isBlockedOrLocked ? messagecustom : data?.message,
                                });

                                setValue('password', '');
                                setValue('captcha', '');
                                // setValue('emailId', '');
                                let attempts = parseInt(localStorage.getItem('captchaRetry'), 10);

                                if (isBlockedOrLocked) {
                                    setIsUserBlocked(isBlockedOrLocked);
                                }
                                if (attempts >= 0) {
                                    localStorage.setItem('captchaRetry', ++attempts);
                                } else {
                                    localStorage.setItem('captchaRetry', 0);
                                    setIsUserBlocked(false)
                                }
                            }
                        } else {
                            if (data?.data?.isProfileUpdate === false) {
                                dispatch(updateSessionModal(false));
                                dispatch(update_user_email_id(emailId));
                                dispatch(setWelcomeModal(true));
                                await accountResponse(response, navigate, dispatch, '/preferences/my-profile');
                                return;
                            }
                            if (data.message !== 'OTP Required') {
                                // if (data.statusCode === 124) {

                                // console.log('Vennila deployment check');
                                if (new URLSearchParams(window.location.search).get('lkey') !== null &&
                                    new URLSearchParams(window.location.search).get('id') !== null &&
                                    response?.clientList.some((client) => client.clientId === parseInt(atob(new URLSearchParams(window.location.search).get('id')), 10))) {
                                    let url = '/account-activate';
                                    let state = {
                                        ipAddress: payload?.ipAddress,
                                        countryName: payload.countryName,
                                        countryCode: payload.countryCode,
                                        hashval: replacePlusWithEncoded(payload?.hashval), //
                                        userAgent: payload?.userAgent,
                                        clientId: parseInt(atob(new URLSearchParams(window.location.search).get('id')), 10),//data.clientId,
                                        LoginName: replacePlusWithEncoded(payload.loginName), //
                                        LoginPassword: replacePlusWithEncoded(payload.loginPassword), //replace + change to %2B
                                        isLicenseKeyValue: atob(new URLSearchParams(window.location.search).get('lkey')),
                                        from: 'login'
                                    };
                                    const encryptState = encodeUrl(state);
                                    navigate(`${url}?q=${encryptState}`, {
                                        state,
                                    });
                                }
                                else {
                                    dispatch(updateSessionModal(false));
                                    dispatch(update_user_email_id(emailId));
                                    await accountResponse(response, navigate, dispatch, payload?.lastURL);
                                }
                            } else {
                                if (!resend) {
                                    // setMsg('OTP sent successfully');
                                    dispatch(
                                        updateOTPState({
                                            isValid: true,
                                            token: data?.data,
                                            prefix: data?.prefix || ''
                                        }),
                                    );
                                    dispatch(
                                        updateOtpValidState({
                                            isOtpValid: false,
                                            showFlag: false,
                                            otpMessage: 'OTP sent successfully',
                                        }),
                                    );
                                    dispatch(update_user_email_id(emailId));
                                    dispatch(
                                        resendLoginOTP({
                                            loginEmail: replacePlusWithEncoded(payload.loginName),
                                            loginPwd: replacePlusWithEncoded(payload.loginPassword),
                                            hashval: replacePlusWithEncoded(payload?.hashval),
                                            userAgent: payload.userAgent,
                                            ipAddress: payload.ipAddress,
                                            countryName: payload.countryName,
                                            countryCode: payload.countryCode,
                                            countryName: payload.countryName,
                                            countryCode: payload.countryCode,
                                            oauth: payload.oauth,
                                            IsADuser: payload?.IsADuser,
                                            emailID: emailId
                                        }),
                                    );
                                    // setTimeout(() => {
                                    //     dispatch(
                                    //         updateOtpValidState({
                                    //             otpMessage: '',
                                    //         }),
                                    //     );
                                    //     // setMsg('');
                                    // }, 1000);
                                } else {
                                    dispatch(
                                        updateOTPState({
                                            isValid: true,
                                            token: data?.data,
                                        }),
                                    );
                                    dispatch(
                                        resendLoginOTP({
                                            loginEmail: replacePlusWithEncoded(payload.loginName),
                                            loginPwd: replacePlusWithEncoded(payload.loginPassword),
                                            hashval: replacePlusWithEncoded(payload?.hashval),
                                            userAgent: payload.userAgent,
                                            ipAddress: payload.ipAddress,
                                            countryName: payload.countryName,
                                            countryCode: payload.countryCode,
                                        }),
                                    );
                                }
                            }
                            const sessionCredentials = {
                                email: emailId,
                                password: password,
                                rememberMe: rememberMe
                            };
                            localStorage.setItem('sessionCredentials', encryptWithAES(JSON.stringify(sessionCredentials)));
                            // dispatch(requestOTP({}));
                        }
                    },
                    fail: (err) => { },
                }),
            );
        };
export const validateForgotUserOTP =
    ({ payload, handleSubmit, loading = false }) =>
        async (dispatch) =>
            dispatch(
                request.post({
                    url: VALIDATE_OTP,
                    payload,
                    loading,
                    ok: ({ data }) => {
                        const { status } = data;
                        if (status) {
                            dispatch(
                                updateOtpValidState({
                                    isOtpValid: true,
                                    showFlag: true,
                                }),
                            );
                            handleSubmit()
                        } else {
                            dispatch(
                                updateOtpValidState({
                                    isOtpValid: false,
                                    showFlag: true,
                                    otpMessage: data.message,
                                }),
                            );
                        }
                    },
                    fail: (err) => {
                        dispatch(
                            updateOtpValidState({
                                isOtpValid: false,
                                showFlag: true,
                            }),
                        );
                    },
                }),
            );

export const validateOTP =
    ({ payload, handleSubmit, loading = false }) =>
        async (dispatch) =>
            dispatch(
                request.post({
                    url: VALIDATE_LOGIN_OTP,
                    payload,
                    loading,
                    ok: ({ data }) => {
                        const { status, data: response } = data;
                        if (status) {
                            dispatch(
                                updateOtpValidState({
                                    isOtpValid: true,
                                    showFlag: true,
                                }),
                            );
                            handleSubmit()
                        } else {
                            dispatch(
                                updateOtpValidState({
                                    isOtpValid: false,
                                    showFlag: true,
                                    otpMessage: data.message,
                                }),
                            );
                        }
                    },
                    fail: (err) => { },
                }),
            );

export const confirm_login =
    ({ payload, navigate, loading = false }) =>
        async (dispatch) => {
            dispatch(
                request.post({
                    url: COMFIRM_LOGIN,
                    payload,
                    loading,
                    ok: async ({ data }) => {
                        const { status, data: response } = data;
                        if (status) {
                            if (data?.data?.isProfileUpdate === false) {
                                dispatch(updateSessionModal(false));
                                dispatch(setWelcomeModal(true));
                                await accountResponse(response, navigate, dispatch, '/preferences/my-profile');
                                return;
                            }
                            await accountResponse(response, navigate, dispatch);
                            dispatch(updateSessionModal(false));
                            /* const {
                                    licenseTypeId,
                                    isAgency,
                                    permissionList,
                                    clientList,
                                    departmentList,
                                    accessToken,
                                    clientId,
                                } = response;
                                let temp = {};
                                permissionList.forEach((permission) => {
                                    temp[permission.featureId.toString()] = permission;
                                });
        
                                temp = encryptWithAES(JSON.stringify(temp));
                                localStorage.setItem('licenseTypeId', encryptWithAES(licenseTypeId));
                                localStorage.setItem('userInfo', encryptWithAES(JSON.stringify(response)));
                                localStorage.setItem('permissions', temp);
                                localStorage.setItem('accessToken', accessToken);
                                localStorage.removeItem('captchaRetry');
                                await mountFullAppReducer();
    dispatch(updateAuth(true));
                                dispatch(resetLoginFormState());
                                if (licenseTypeId === '3' || isAgency) {
                                    dispatch(
                                        updateBuAndDepId({
                                            clientId: clientList?.[0] || {},
                                            departmentId: departmentList?.[0] || {},
                                            parentClientId: clientId,
                                        }),
                                    );
                                } else {
                                    dispatch(
                                        updateBuAndDepId({
                                            clientId: {
                                                clientId: clientId,
                                                clientName: '',
                                            },
                                            departmentId: departmentList?.[0] || {},
                                        }),
                                    );
                                }
                                if (response?.isCampaign) navigate('/dashboard');
                                else navigate('/launch-pad');
                                props.onChangeIsOpen(false);
                                dispatch(
                                    updateOtpValidState({
                                        isOtpValid: true,
                                        showFlag: true,
                                        accessToken: accessToken || '',
                                    }),
                                );*/
                        }
                    },
                    fail: (err) => { },
                }),
            );
        };

export const validateLicenseKey =
    ({ payload, loading = false }) =>
        async (dispatch) => {
            return dispatch(
                request.post({
                    url: VERIFY_LICENSE_KEY,
                    payload,
                    loading,
                    ok: ({ data }) => {
                        const { status } = data;
                        localStorage.removeItem('captchaRetry');
                        dispatch(
                            updateLicenseKeyState({
                                isLicenseKey: status,
                                isValidLicenseKey: true,
                                isValidLicenseKeyData: data?.data,
                            }),
                        );
                        // if (fromCompanies) navigate('/preferences/company-list');
                    },
                    fail: (err) => {
                        dispatch(
                            updateLicenseKeyState({
                                isLicenseKey: false,
                                isValidLicenseKey: false,
                                isValidLicenseKeyData: data?.message,
                            }),
                        );
                    },
                }),
            );
        };

export const agencyValidateLicenseKey =
    ({ payload, loading = false }) =>
        async (dispatch) => {
            return dispatch(
                request.post({
                    url: AGENCY_VERIFY_LICENSE_KEY,
                    payload,
                    loading,
                    ok: ({ data }) => {
                        localStorage.removeItem('captchaRetry');
                        const { status } = data;
                        dispatch(
                            updateLicenseKeyState({
                                isLicenseKey: status,
                                isValidLicenseKey: true,
                                isValidLicenseKeyData: data?.data,
                            }),
                        );
                    },
                    fail: (err) => { },
                }),
            );
        };

export const agencySubmitLicenseKey =
    ({ payload, navigate, fromCompanies, loading = false }) =>
        async (dispatch) => {
            return dispatch(
                request.post({
                    url: AGENCY_SUBMIT_LICENSE_KEY,
                    payload,
                    loading,
                    ok: ({ data }) => {
                        localStorage.removeItem('captchaRetry');
                        const { status } = data;
                        if (status) {
                            // dispatch(
                            //     updateLicenseKeyState({
                            //         isLicenseKey: status,
                            //         isValidLicenseKey: true,
                            //     }),
                            // );
                            if (fromCompanies) navigate('/preferences/company-list');
                            else {
                                dispatch(isAgencyState({ isAgency: true }));
                                dispatch(
                                    isAgencyBrandState({
                                        agencyId: data?.data?.clientId,
                                        userId: data?.data?.userId,
                                        isAgencyBrand: true,
                                    }),
                                );
                                const userInfo = { isAgency: true };
                                localStorage.setItem('userInfo', encryptWithAES(JSON.stringify(userInfo)));
                                CacheManager.set('userDetails', userInfo);
                                navigate('/account-setup');
                                // navigate('/Licensetype');
                            }
                        }
                    },
                    fail: (err) => { },
                }),
            );
        };

export const submitLicenseKey =
    ({ payload, navigate, originalEmail, loading = false }) =>
        async (dispatch) => {
            return dispatch(
                request.post({
                    url: SUBMIT_LICENSE_KEY,
                    payload,
                    loading,
                    ok: ({ data }) => {
                        const { status, data: response } = data;
                        if (status) {
                            /* const {
                                    licenseTypeId,
                                    isAgency,
                                    permissionList,
                                    clientList,
                                    departmentList,
                                    accessToken,
                                    clientId,
                                } = response;
                                let temp = {};
                                permissionList.forEach((permission) => {
                                    temp[permission.featureId.toString()] = permission;
                                });
                                temp = encryptWithAES(JSON.stringify(temp));
                                localStorage.setItem('licenseTypeId', encryptWithAES(licenseTypeId));
                                localStorage.setItem('userInfo', encryptWithAES(JSON.stringify(response)));
                                localStorage.setItem('permissions', temp);
                                localStorage.setItem('accessToken', accessToken);
                                localStorage.removeItem('captchaRetry');
                                await mountFullAppReducer();
    dispatch(updateAuth(true));
                                dispatch(resetLoginFormState());
                                if (licenseTypeId === '3' || isAgency) {
                                    dispatch(
                                        updateBuAndDepId({
                                            clientId: clientList?.[0] || {},
                                            departmentId: departmentList?.[0] || {},
                                            parentClientId: clientId,
                                        }),
                                    );
                                } else {
                                    dispatch(
                                        updateBuAndDepId({
                                            clientId: {
                                                clientId: clientId,
                                                clientName: '',
                                            },
                                            departmentId: departmentList?.[0] || {},
                                        }),
                                    );
                                }
        
                                dispatch(
                                    updateOtpValidState({
                                        isOtpValid: true,
                                        showFlag: true,
                                        accessToken: accessToken || '',
                                    }),
                                );*/
                            dispatch(update_user_email_id(originalEmail || payload.LoginName));
                            accountResponse(response, navigate, dispatch);
                            const { licenseTypeId, clientId } = response;
                            // if (licenseTypeId === 3) {
                            //     history.replace('/preferences/company-list/add-companies', {
                            //         clientId: clientId,
                            //         mode: 'edit',
                            //         licenseTypeId: licenseTypeId,
                            //         page: 'NEW_COMPANY',
                            //     });
                            // } else {
                            //     history.replace('/launch-pad');
                            // }
                            // history.replace('/launch-pad');
                        }
                    },
                    fail: (err) => { },
                }),
            );
        };

export const forgotPassword =
    ({ payload, setError, loading = false }) =>
        async (dispatch) =>
            dispatch(
                request.post({
                    url: FORGOT_PASSWORD,
                    payload,
                    isToast: false,
                    loading,
                    ok: ({ data }) => {
                        const { status } = data;
                        if (status) {
                            dispatch(
                                updateOTPState({
                                    isValid: true,
                                    token: data.otpToken,
                                    prefix: data.prefix,
                                }),
                            );
                            dispatch(
                                updateOtpValidState({
                                    isOtpValid: false,
                                    showFlag: false,
                                    otpMessage: 'OTP sent successfully',
                                }),
                            );
                            dispatch(
                                resendLoginOTP({
                                    loginEmail: payload.emailId,
                                    hashval: replacePlusWithEncoded(payload?.hashval),
                                }),
                            );

                            dispatch(
                                isForgotState({
                                    isForgot: true,
                                }),
                            );

                            // navigate('/setup-complete');
                        }
                        else {
                            setError('emailId', {
                                type: 'custom',
                                message: data?.message || 'Something went wrong. Please try again.',
                            });
                        }
                    },
                    fail: (err) => { },
                }),
            );

export const updatePassword =
    ({ payload }) =>
        async (dispatch) => {
            dispatch(
                request.post({
                    url: UPDATE_PASSWORD,
                    payload,
                    loading: true,
                    ok: ({ data }) => {
                        const { status } = data;
                        if (status) {
                            dispatch(resetLoginFormState());
                        }
                    },
                    fail: (err) => { },
                }),
            );
        };

export const agencyAccountActivation =
    ({ payload, navigate }) =>
        async (dispatch) => {
            dispatch(
                request.post({
                    url: AGENCY_ACCOUNT_ACTIVATION,
                    payload,
                    loading: true,
                    ok: ({ data }) => {
                        const { status } = data;
                        if (status) {
                            navigate('/account-activate', {
                                state: {
                                    clientId: payload.agencyId,
                                    isAgency: payload.isAgency,
                                },
                            });
                            // dispatch(updateLicenceSessionId(res));
                        }
                    },
                    fail: (err) => { },
                }),
            );
        };

export const clearClientSessionForLoginRedirect = (dispatch) => {
    const tempMasterData = localStorage.getItem('masterData');
    const tempipAddressData = localStorage.getItem('ipAddressData');
    const tempdisable_plugin_last_shown = localStorage.getItem('disable_plugin_last_shown');
    const temp_session_credentials = localStorage.getItem('sessionCredentials');
    const tempNewVersionConfirm = localStorage.getItem('newVersionConfirm');

    localStorage.clear();

    // if (tempMasterData) {
    //     localStorage.setItem('masterData', tempMasterData);
    // }
    if (tempipAddressData) {
        localStorage.setItem('ipAddressData', tempipAddressData);
    }
    if (tempdisable_plugin_last_shown) {
        localStorage.setItem('disable_plugin_last_shown', tempdisable_plugin_last_shown);
    }
    if (temp_session_credentials) {
        localStorage.setItem('sessionCredentials', temp_session_credentials);
    }
    localStorage.setItem('newVersionConfirm', tempNewVersionConfirm);

    sessionStorage.clear();
    clearAllQueryStates();

    dispatch(resetGlobalState());
    dispatch(resetdashboardState());
    dispatch(resetTargetListData());
    dispatch(resetLoginFormState());
    dispatch(resetNewUserFormState());

    CacheManager.clear();
    localStorage.setItem('logoutEvent', Date.now().toString());
};

/** Clear client session then route to login without a full page reload. */
export const navigateToLoginAfterSessionClear = (dispatch, navigate) => {
    clearClientSessionForLoginRedirect(dispatch);
    if (typeof navigate === 'function') {
        navigate('/', { replace: true });
        return;
    }
    if (typeof window !== 'undefined') {
        window.location.href = '/';
    }
};

export const logOut =
    ({ payload, navigate, setShow, loading = false }) =>
        async (dispatch) => {
            return dispatch(
                request.post({
                    url: LOGOUT,
                    payload,
                    loading,
                    ok: () => {
                        try {
                            setShow(false);
                            navigateToLoginAfterSessionClear(dispatch, navigate);
                        } catch (error) {
                            setShow(false);
                        }
                    },
                    fail: (err) => {
                        setShow(false);
                    },
                }),
            );
        };

export const KyakoFormsSubmission =
    ({ payload, navigate }) =>
        async (dispatch) => {
            return dispatch(
                request.post({
                    url: KYAKOFORMSUBMISSION,
                    payload,
                    loading: true,
                    ok: ({ data }) => {
                        const { status } = data;
                        if (status) {
                            // navigate('/account-activate', {
                            //     state: {
                            //         clientId: payload.agencyId,
                            //         isAgency: payload.isAgency,
                            //     },
                            // });

                            // dispatch(updateLicenceSessionId(res));
                        }
                    },
                    fail: (err) => { },
                }),
            );
        };

export const GetJWTDeskpro =
    ({ payload, navigate }) =>
        async (dispatch) => {
            return dispatch(
                request.post({
                    url: GETJWTDESKPRO,
                    payload,
                    loading: true,
                    ok: ({ data }) => {
                        const { status } = data;
                        if (status) {
                            // navigate('/account-activate', {
                            //     state: {
                            //         clientId: payload.agencyId,
                            //         isAgency: payload.isAgency,
                            //     },
                            // });

                            // dispatch(updateLicenceSessionId(res));
                        }
                    },
                    fail: (err) => { },
                }),
            );
        };

export const checkRenewalStatus =
    ({ payload, loading = false }) =>
        async (dispatch) => {

            let result = null; // 👈 store return value here

            await dispatch(
                request.post({
                    url: LICENSE_STATUS,
                    payload,
                    loading,
                    ok: ({ data }) => {
                        const { status, renewalDate } = data;
                        if (status) {

                            if (!renewalDate) return;

                            const daysDiff = getDayDifference(renewalDate);
                            const content = getRenewalMessage(daysDiff);

                            if (!content) return;

                            const autoClose = daysDiff >= 1 && daysDiff <= 3 ? 600000 : false;

                            // ✅ assign result
                            result = {
                                content,
                                autoClose,
                                daysDiff,
                                renewalDate,
                                isRenewal: true
                            };

                            dispatch(updateRenewalData(result));
                            //  dispatch(getGlobalStateValue({ field: 'renewalData', data: result }));

                        }

                    },


                })
            );



            // ✅ return final computed data
            return result;
        };
