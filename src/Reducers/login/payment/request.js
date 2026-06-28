import { ACCOUNT_ACTIVATION, CONFIRM_AUTHORIZATION_CODE, GET_AMOUNT_ENCRYPTED, GET_AUTHORIZATION_CODE, PAYMENT_SUBMIT, VERIFY_AUTHORIZATION_CODE } from 'Constants/EndPoints';
import request from 'Utils/Http';

import { resetLoginFormState, updateInvoiceState, updatePaymentState } from '../existingUser/reducer';

export const getAuthorizationCode =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_AUTHORIZATION_CODE,
                payload,
                loading,
                ok: ({ data }) => {
                    const { status } = data;
                    if (status) {
                        dispatch(updateInvoiceState(true));
                    }
                },
                fail: (err) => {},
            }),
        );

export const verifyAuthorizationCode =
    ({ payload, setError, clearErrors, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: VERIFY_AUTHORIZATION_CODE,
                payload,
                loading,
                ok: ({ data }) => {
                    localStorage.removeItem('captchaRetry');
                    const { status } = data;
                    if (!status) {
                        setError('authenticationcode', {
                            type: 'custom',
                            message: data.message,
                        });
                        dispatch(
                            updatePaymentState({
                                ispaymentEnable: false,
                                isPaymentAuthCode: false,
                            }),
                        );
                        // dispatch(updatePaymentState(true));
                        //  dispatch(updateInvoiceState(true));
                    } else {
                        clearErrors('authenticationcode');
                        dispatch(
                            updatePaymentState({
                                ispaymentEnable: true,
                                isPaymentAuthCode: true,
                                authKey: payload.authKey,
                            }),
                        );
                    }
                },
                fail: (err) => {},
            }),
        );

export const confirmAuthorizationCode =
    ({ payload, navigate, from, isInvoice = false, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: CONFIRM_AUTHORIZATION_CODE,
                payload,
                loading,
                ok: ({ data }) => {
                    const { status } = data;
                    if (status) {
                        localStorage.removeItem('captchaRetry');
                        // navigate('/setup-complete');
                        //                         const payloads = {
                        //                             // invoiceId: payload.invoiceID,
                        //                             // paymentModeId: 3,
                        //                             // clientName: payload.clientName,
                        //                             // authorizationCode: payload.authKey,
                        //                             // accountType: payload.licenseTypeID,
                        //                             // cardholderName: 'dhoni11',
                        //                             // cardNumber: '4111111111111111',
                        //                             // month: '12',
                        //                             // year: '2022',
                        //                             // cvv: 123,
                        //                             // clientId: payload.clientId,
                        //                             // userId: payload.userId,
                        //                             // Amount: 200.0,
                        // // -- Payment submit - resul pay/paypall/invoice - lawrance
                        //                             // clientId: payload.clientId,
                        //                             // userId: payload.userId,
                        //                             // licenseTypeId: payload.licenseTypeID,
                        //                             // authorizationCode: payload.authKey,
                        //                             // paymentMode: 3,

                        //                             // address: 'Chennai',
                        //                             // listPrice: 1999.0,
                        //                             // salePrice: 1999.0,
                        //                             // paymentTerms: '15 days',
                        //                             // commitment: '1 Year',
                        //                             // discountAmt: 0.0,
                        //                             // firstName: 'raghav',
                        //                             // lastName: 'startup',
                        //                             // clientName: 'testCompany',
                        //                             // emailId: 'testentraoent1@resulticksmail.com',
                        //                             // mobileNo: '7871925207',
                        //                             // amount: 1002.22,
                        //                             // paymentFrequency: 1,
                        //                             // cardTransDetails: {
                        //                             //     cardHolderName: 'vinoth',
                        //                             //     cardNumber: '4111111111111111',
                        //                             //     expirationMonth: '12',
                        //                             //     expirationYear: '2028',
                        //                             //     cvv: '432',
                        //                             // },
                        //                             // invTrasDetails: {
                        //                             //     invoiceGenCode: '',
                        //                             // },
                        //                             // accountNo: 'INBS-RagRag-34601',

                        // clientId: payload.clientId,
                        //  orderId: payload.orderId,userId: payload?.userId,
                        //                             authorizationCode: payload.authKey,
                        //                             paymentMode: payload?.paymentMode,

                        //                         };
                        //                         dispatch(paymentSubmit({ payloads, navigate, from, isInvoice }));
                    }
                },
                fail: (err) => {},
            }),
        );

export const paymentSubmit =
    ({ payloads, navigate, from, isInvoice , fromClientUpgrade = false, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: PAYMENT_SUBMIT,
                payload: payloads,
                loading,
                ok: ({ data }) => {
                    const { status } = data;
                    if(!fromClientUpgrade){
                        if (status) {
                            localStorage.removeItem('captchaRetry');
                            const payload = {
                                clientId: payloads.clientId,
                                userId: payloads.userId,
                                statusID: 3,
                            };
                            //  dispatch(accountActivation({ payload, navigate, from }));
                            navigate('/setup-complete', {
                                state: { status: 'success', isLicense: true, from, isInvoice: isInvoice },
                            });
                        } else {
                            navigate('/setup-complete', {
                                state: { status: 'failure', isPayment: false, from, isInvoice: isInvoice },
                            });
                        }
                }
                },
                fail: (err) => {},
            }),
        );

export const accountActivation =
    ({ payload, navigate, from }) =>
    async (dispatch) => {
        dispatch(
            request.post({
                url: ACCOUNT_ACTIVATION,
                payload,
                loading: true,
                ok: ({ data }) => {
                    const { status } = data;
                    if (status) {
                        if (from === 'companies') {
                            dispatch(resetLoginFormState());
                            navigate('/preferences/company-list');
                        } else {
                            localStorage.removeItem('captchaRetry');
                            dispatch(resetLoginFormState());
                            // navigate('/setup-complete');
                            navigate('/setup-complete', { state: { status: 'success', isLicense: true } });
                        }
                    }
                    // else {
                    //     dispatch(accountActivation({ payload, navigate, from }));
                    // }
                    else {
                        navigate('/setup-complete', { state: { status: 'success', isPayment: true } });
                    }
                },
                fail: (err) => {},
            }),
        );
    };

export const get_amountEncrypted =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_AMOUNT_ENCRYPTED,
                payload,
                loading,
                ok: ({ data }) => {
                    const { status } = data;
                    if (!status) {
                        localStorage.setItem('final', '');
                    } else {
                        localStorage.setItem('final', data?.data);
                    }
                },
                fail: (err) => {},
            }),
        );
