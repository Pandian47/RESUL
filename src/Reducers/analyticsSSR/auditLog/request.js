import { AUDIT_LOG } from 'Constants/EndPoints';
import request from 'Utils/Http';

import { getAuditLogLoading, getAuditLogFailure } from './reducer';


export const getAuditLogList =
    (payload) =>
        async (dispatch) => {
            getAuditLogLoading(true); 
            return dispatch(
                request.post({
                    url: AUDIT_LOG,
                    payload,
                    //loading:true,
                    ok: () => {
                        dispatch(getAuditLogLoading(false));
                    },
                    fail: (err) => {
                                                dispatch(getAuditLogLoading(false));
                        dispatch(getAuditLogFailure(true));
                    },
                }),
            )
        };




