import { GET_INVOICEINFO_ID, GET_INVOICELIST } from 'Constants/EndPoints';
import request from 'Utils/Http';

export const get_invoiceList =
    (payload ) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_INVOICELIST,
                payload,
                loading: false,
                isToast: false,
                ok: ({ data }) => {
                                    },
                fail: (err) => {},
            }),
        );
    };
    export const get_invoiceListbyID =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_INVOICEINFO_ID,
                payload,
                loading: false,
                isToast: false,
                ok: ({ data }) => {
                                    },
                fail: (err) => {},
            }),
        );
    };
