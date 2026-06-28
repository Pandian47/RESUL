import { BRAND_CLIENT_CREATION, CHECK_CLIENT_NAME_EXISTS, EMAIL_EXIST, GET_COUNTRY_DETAILS, GET_COUNTRY_DETAILS_BY_REGION, GET_KEY_CONTACT_EMAIL, NEW_USER_EMAIL_EXISTS, NEW_USER_VALIDATE_EMAIL_OTP, REQUEST_OTP, REQUEST_PARENT_NAME_OTP, SAVE_PRICING, SAVE_SIGN_UP, VALIDATE_OTP, VALIDATE_WEBSITE } from 'Constants/EndPoints';
import request from 'Utils/Http';

import { updateCountryDetails, updateOtpToken, updateOtpValidState, updateUserFormState, resetNewUserFormState, updateOtpPrefix } from './reducer';
import { updateCompanyCountryDetails } from 'Reducers/companySetup/reducer';

const buildCountryDetailsPayload = (payload = {}) => ({
    countryID: payload.countryID ?? payload.countryId ?? 0,
    stateID: payload.stateID ?? payload.stateId ?? 0,
});

const normalizeCountryDetails = (data = {}) => ({
    ...data,
    stateID: data.stateID ?? data.stateId ?? null,
});

export const savePricingConfig = (clientId, licenseTypeId) => {
    return {
        pricingId: 0,
        clientId,
        licenseType: licenseTypeId,
        //  companyName: 'testbrandproductionunit2',
        // address: 'abcdpark',
        discountCode: 'null',
        listPrice: 1999.0,
        salePrice: 1999.0,
        paymentTerms: '15 days',
        commitment: '1 Year',
        discountamt: 0.0,
        frequencyId: 1,
        // paymentFrequency: 1,
        pricingDetail: [
            {
                consumableId: 1,
                charges: 0.002,
                pricingDetailsId: 0,
            },
            {
                consumableId: 2,
                charges: 0.025,
                pricingDetailsId: 0,
            },
            {
                consumableId: 3,
                charges: 0.03,
                pricingDetailsId: 0,
            },
            {
                consumableId: 4,
                charges: 0.04,
                pricingDetailsId: 0,
            },
            {
                consumableId: 5,
                charges: 10.0,
                pricingDetailsId: 0,
            },
            {
                consumableId: 6,
                charges: 10.0,
                pricingDetailsId: 0,
            },
            {
                consumableId: 7,
                charges: 10.0,
                pricingDetailsId: 0,
            },
            {
                consumableId: 8,
                charges: 50.0,
                pricingDetailsId: 0,
            },
            {
                consumableId: 9,
                charges: 1200.0,
                pricingDetailsId: 0,
            },
            {
                consumableId: 10,
                charges: 0.004,
                pricingDetailsId: 0,
            },
            {
                consumableId: 11,
                charges: 200.0,
                pricingDetailsId: 0,
            },
            {
                consumableId: 12,
                charges: 100.0,
                pricingDetailsId: 0,
            },
            {
                consumableId: 13,
                charges: 1999.0,
                pricingDetailsId: 0,
            },
            {
                consumableId: 14,
                charges: 50.0,
                pricingDetailsId: 0,
            },
            {
                consumableId: 15,
                charges: 100.0,
                pricingDetailsId: 0,
            },
        ],
    };
};

export const emailExist =
    ({ payload, setError }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: EMAIL_EXIST,
                payload,
                isToast: false,
                ok: ({ data }) => {
                    if (data.message === 'Invalid domain name' || data.message === 'Invalid email ID' || data.message === 'Invalid email address' || data.status) {
                        setError('emailId', {
                            type: 'server',
                            message: data.message,
                        });
                        // dispatch(updateEmailFormState({ isValidEmailId: true }));
                    } else {
                        // dispatch(updateEmailFormState({ isValidEmailId: false }));
                    }
                },
                fail: (err) => {},
            }),
        );

export const saveNewUserEmail =
    ({ payload, setError, navigate, loading = false }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: SAVE_SIGN_UP,
                payload,
                loading,
                ok: ({ data }) => {
                    if (!data.status) {
                        setError('emailId', {
                            type: 'server',
                            message: data.message,
                        });
                        return;
                    } else {
                        navigate('/account-setup');
                        sessionStorage.setItem('accountSetup', true);
                        dispatch(resetNewUserFormState());
                        dispatch(updateUserFormState({ emailId: payload.w_emaild }));
                    }
                },
                fail: (err) => {},
            }),
        );
    };

export const checkClientNameExists =
    ({ payload, setError, name, clearErrors }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: CHECK_CLIENT_NAME_EXISTS,
                payload,
                isToast: false,
                ok: ({ data }) => {
                    if (data.status) {
                        setError(name, {
                            type: 'server',
                            message: data.message,
                        });
                    } else {
                        clearErrors(name);
                    }
                },
                fail: (err) => {},
            }),
        );
    };

export const getKeyContactEmail =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_KEY_CONTACT_EMAIL,
                payload,
                isToast: false,
                ok: () => {},
                fail: () => {},
            }),
        );

export const requestParentNameOtp =
    ({ payload, setMessage = () => {}, resend = false, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: REQUEST_PARENT_NAME_OTP,
                payload,
                loading,
                ok: ({ data }) => {
                    const { status, otpToken, prefix = '', data: otpTokenData } = data;
                    if (status) {
                        dispatch(updateOtpToken(otpToken || otpTokenData || ''));
                        dispatch(updateOtpPrefix(prefix));
                        setMessage(resend ? 'OTP resent successfully' : 'OTP sent successfully');
                    } else {
                        dispatch(updateOtpPrefix(''));
                        setMessage(data.message || 'Request OTP method fail');
                    }
                },
                fail: () => {},
            }),
        );

export const validateWebsite =
    ({ payload, setError, name,loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: VALIDATE_WEBSITE,
                payload,
                isToast: false,
                loading: loading ?? false,
                ok: ({ data }) => {
                    if (!data.status) {
                        setError(name, {
                            type: 'server',
                            message: data.message,
                        });
                    }
                },
                fail: (err) => {},
            }),
        );

export const clientCreation =
    ({ payload, type, navigate, loading = false }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: BRAND_CLIENT_CREATION,
                payload,
                loading,
                ok: ({ data }) => {
                    if (data.status) {
                        const payloadSave = savePricingConfig(
                            data?.data?.clientId,
                            payload.CompanyDetail[0].licenseTypeId,
                        );
                        dispatch(resetNewUserFormState());
                        if (!payload.isAgency) {
                            navigate('/setup-complete', { state: { status: 'success', isSignUp: true } });
                        } else {
                            navigate('/setup-complete', { state: { status: 'success', isSignUp: false } });
                        }
                        //   navigate('/setup-complete', { state: { status: 'success', isSignUp: true } });
                        // if (!payload.isAgency) {
                        //     dispatch(savePricingDetails({ payloadSave, navigate }));
                        // } else {
                        //     dispatch(resetNewUserFormState());
                        //     // navigate('/setup-complete');
                        //     navigate('/setup-complete', { state: { status: 'success' } });
                        // }
                    } else {
                        dispatch(resetNewUserFormState());
                        navigate('/setup-complete', { state: { status: 'failure', isSignUp: false } });
                    }
                },
                fail: (err) => {
                                    },
            }),
        );
    };

export const agencyClientCreation =
    ({ payload, type, navigate, loading = false }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: BRAND_CLIENT_CREATION,
                payload,
                loading,
                ok: ({ data }) => {
                    if (data.status) {
                        const payloadSave = savePricingConfig(
                            data?.data?.clientId,
                            payload.CompanyDetail[0].licenseTypeId,
                        );
                        //  dispatch(savePricingDetails({ payloadSave, navigate }));
                        dispatch(resetNewUserFormState());
                        navigate('/setup-complete', { state: { status: 'success', isSignUp: true } });
                    } else {
                        dispatch(resetNewUserFormState());
                        navigate('/setup-complete', { state: { status: 'failure', isSignUp: false } });
                    }
                },
                fail: (err) => {
                                    },
            }),
        );
    };

export const savePricingDetails =
    ({ payloadSave, navigate, from }) =>
    async (dispatch) => {
        dispatch(
            request.post({
                url: SAVE_PRICING,
                payload: payloadSave,
                loading: true,
                ok: ({ data }) => {
                    if (data.status) {
                        dispatch(resetNewUserFormState());
                        if (from !== 'companies') navigate('/setup-complete', { state: { status: 'success' } });
                    }
                    // if (data.status) {
                    //     dispatch(resetNewUserFormState());
                    //     navigate('/setup-complete');
                    // }
                },
                fail: (err) => {
                                    },
            }),
        );
    };

export const validateNewUserOTP =
    ({ payload, setMessage = () =>{}, handleSubmit = () => {}, loading = false }) =>
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
                        dispatch(updateUserFormState({ otp: payload.otp }));
                        handleSubmit();
                    } else {
                        const errorMsg = data.message || 'Invalid OTP';
                        dispatch(
                            updateOtpValidState({
                                isOtpValid: false,
                                showFlag: true,
                                otpMessage: errorMsg,
                            }),
                        );
                        setMessage('');
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

export const requestOTP =
    ({ payload, setMessage = () => {}, resend, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: REQUEST_OTP,
                payload,
                loading,
                ok: ({ data }) => {
                                        const { status, otpToken, prefix = '' } = data;
                    if (status) {
                        dispatch(updateOtpToken(otpToken));
                        dispatch(updateOtpPrefix(prefix));
                        dispatch(updateUserFormState({phoneNo: payload.phoneNo}))
                        setMessage(resend ? 'OTP resent successfully' : 'OTP sent successfully');
                        // setTimeout(() => {
                        //     setMessage(null);
                        // }, 4000);
                    } else {
                        dispatch(updateOtpPrefix(''));
                        setMessage('Request OTP method fail');
                        setTimeout(() => {
                            setMessage(null);
                        }, 4000);
                    }
                },
                fail: (err) => {},
            }),
        );

export const getCountryCoordinates = (payload = {}) => async (dispatch) => {
    const { loading = false, ...countryPayload } = payload;
    const requestPayload = buildCountryDetailsPayload(countryPayload);

    return dispatch(
        request.post({
            url: GET_COUNTRY_DETAILS,
            payload: requestPayload,
            loading,
            ok: ({ data: responseData }) => {
                const { status, data } = responseData;
                if (status) {
                    const countryDetails = normalizeCountryDetails(data);
                    dispatch(updateCountryDetails(countryDetails));
                    dispatch(updateCompanyCountryDetails(countryDetails));
                    return countryDetails;
                }
                dispatch(updateCountryDetails({}));
                dispatch(updateCompanyCountryDetails({}));
                return null;
            },
            fail: (err) => {},
        }),
    );
};

export const parseCountriesByRegionResponse = (data) => {
    if (!Array.isArray(data) || data.length === 0) return [];

    if (Array.isArray(data[0]?.countries)) {
        const countryMap = new Map();
        data.forEach((region) => {
            (region.countries || []).forEach((country) => {
                if (country?.countryID != null) {
                    countryMap.set(country.countryID, country);
                }
            });
        });
        return Array.from(countryMap.values());
    }

    return data.filter((item) => item?.countryID != null);
};

export const getCountryCoordinatesByRegion = (payload = {}) => async (dispatch) => {
    const { loading = false, signal, ...regionPayload } = payload;

    return dispatch(
        request.post({
            url: GET_COUNTRY_DETAILS_BY_REGION,
            payload: regionPayload,
            signal,
            loading,
            ok: () => {},
            fail: (err) => {},
        }),
    );
};

export const checkNewUserEmailOTP =
    ({ payload, uniqueId, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: NEW_USER_EMAIL_EXISTS,
                payload,
                loading,
                ok: ({ data: response }) => {
                    const { status, data, message, prefix = '' } = response;
                    if (status) {
                        dispatch(
                            updateOtpToken({
                                token: data,
                            }),
                        );
                        
                        dispatch(
                            updateOtpPrefix(prefix),
                        );
                    } else {
                        dispatch(
                            updateOtpToken({
                                token: '',
                            }),
                        );
                        dispatch(
                            updateOtpPrefix(''),
                        );
                        dispatch(
                            updateOtpValidState({
                                isOtpValid: false,
                                showFlag: true,
                                otpMessage: message,
                            }),
                        );
                    }
                },
                fail: (err) => {},
                customHeadConfig: {'X-Forwarded-For' : uniqueId || null},
                isCustomHeadConfig: true
            }),
        );

export const checkNewUserValidateEmailOTP =
    ({ payload, handleSubmit, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: NEW_USER_VALIDATE_EMAIL_OTP,
                payload,
                loading,
                ok: ({ data: response }) => {
                    const { status, message } = response;
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
                                otpMessage: message,
                            }),
                        );
                    }
                },
                fail: (err) => {},
            }),
        );
