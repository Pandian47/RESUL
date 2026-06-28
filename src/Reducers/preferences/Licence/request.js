import { GET_CLIENT_PAYMENT, GET_LICENSE_INFO, GET_LICENSE_KEY, UPGRADE_ACCOUNT } from 'Constants/EndPoints';
import request from 'Utils/Http';
// import { updatelicence } from './reducer';
import { encodeUrl } from 'Utils/modules/crypto';


export const getLicenseInfo =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_LICENSE_INFO,
                payload,
                loading: false,
                ok: ({ data }) => {
                    return data;
                },
                fail: (err) => {},
            }),
        );

export const getLicenceKey =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_LICENSE_KEY,
                payload,
                loading,
                ok: ({ data }) => {
                    return data;
                },
                fail: (err) => {},
            }),
        );

export const upgradeAccount =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: UPGRADE_ACCOUNT,
                payload,
                loading,
                ok: ({ data }) => {
                    return data;
                },
                fail: (err) => {},
            }),
        );
export const GetClientPaymentDetails =
    ({ payload, loading = true }, navigate, upgradePayload = {}) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_CLIENT_PAYMENT,
                payload,
                loading,
                ok: ({ data }) => {
                    const { data: res, status } = data;
                    if (status) {
                        let url = '/payment';
                        const state = {
                            clientId: payload?.clientId,
                            userId: payload.userId,
                            amount: res?.amount || 0,
                            licenseTypeID: payload?.licenseTypeId || 2,
                            frequencyId: res?.frequency,
                            clientName: res?.clientName,
                            monthlyCharge: res?.salePrice,
                            tenantShortCode: res?.tenantShortCode || '',
                            orderId: res?.orderId || '',
                            commitment: res?.commitment || '',
                            upgradePayload: upgradePayload,
                            fromClientUpgrade: true
                        };
                        const encryptState = encodeUrl(state);
                        navigate(`${url}?q=${encryptState}`, {
                            state,
                        });
                    }
                },
                fail: (err) => {},
            }),
        );
