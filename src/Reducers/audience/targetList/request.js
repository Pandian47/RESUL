import { AUDIENCE_LIST_VIEW, EDIT_NAME_SAVE, GET_ADVANCE_ANALYTICS_DOWNLOAD, GET_ADVANCE_ANALYTICS_GRID, GET_ADVANCE_ANALYTICS_LIST, GET_ATTRIBUTE_NAME, GET_AUDIENCE_CSV_DOWNLOAD, GET_AUDIENCE_DATA_SERVICE, GET_AUDIENCE_SELECTEDCOLS, GET_AUDIENCE_VERSION_HISTORY, GET_DATA_ATTRIBUTEGROUPS, GET_DATA_ATTRIBUTE_GROUPNAME, GET_ONLINE_AUDIENCE, GET_SEG_SCHEDULE, GET_SFTP_CREDENTIALS, GET_TARGET_INFO, GET_TL_DL_USERLIST, GET_TL_SAMPLELIST, GET_TL_SHARELIST, GET_TL_SHARE_UPLOAD, MATCH_INPUT_LIST, ML_LIST_SAVE, REMOVE_TL_SEEDLIST, SAVESFT, SAVE_DATA_AUGMENTATION, STOP_SEG_SCHEDULE, TARGET_LIST_DOWNLOAD_ATTRIBUTES, TARGET_LIST_DOWNLOAD_FILES, TARGET_LIST_DUPLICATE, TARGET_LIST_SEARCH_NAME, TL_CGTG_ONOFF, UPDATE_ARCHIVAL_STATUS, UPDATE_CG_TG_VALUE } from 'Constants/EndPoints';
import request from 'Utils/Http';
import { parseAudienceJsonArray } from 'Pages/AuthenticationModule/Audience/audienceDefaults';

import { get_target_list, target_list_update, target_list_view } from './reducer';

/** API expects `filteration.listType` as a string (e.g. user id for “My list”); session `userId` is often numeric. */
function normalizeTargetListViewPayload(payload) {
    if (!payload?.filteration) return payload;
    const lt = payload.filteration.listType;
    const listType =
        lt === '' || lt === null || lt === undefined ? '' : String(lt);
    return {
        ...payload,
        filteration: {
            ...payload.filteration,
            listType,
        },
    };
}

export const getTargetListView = (payload) => async (dispatch) => {
    dispatch(target_list_view({ field: 'listLoading', data: true }));
    dispatch(target_list_view({ field: 'listFailure', data: false }));
    const postPayload = normalizeTargetListViewPayload(payload);
    return dispatch(
        request.post({
            url: AUDIENCE_LIST_VIEW,
            payload: postPayload,
            loading: false,
            ok: (res) => {
                const {
                    data: { status, message = 'No data available' },
                } = res;
                if (status) {
                    dispatch(target_list_update(res?.data));
                    if(res?.data?.data?.length > 0) {
                        dispatch(target_list_view({ field: 'listFailure', data: false }));
                    } else {
                        dispatch(target_list_view({ field: 'listFailure', data: true }));
                    }
                } else {
                    dispatch(target_list_update({ data: [], totalListCount: 0 }));
                    dispatch(target_list_view({ field: 'listFailure', data: true }));
                }
            },
            fail: (err) => {
                dispatch(target_list_view({ field: 'listFailure', data: true }));
            },
            final: () => {
                dispatch(target_list_view({ field: 'listLoading', data: false }));
            },
        }),
    );
};

export const updateArchivalStatus = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: UPDATE_ARCHIVAL_STATUS,
            payload,
            loading,
            ok: (res) => {
                const {
                    data: { data, status, message = 'No data available' },
                } = res;
                
            },
            isFailureCheck: true,
            fail: ({ response }) => {
                const {
                    data: { status, message = 'No data available' },
                } = response;
        

                            },
        }),
    );
};
 
export const getDownloadAttributes =
    ({ payload, loading = false }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: TARGET_LIST_DOWNLOAD_ATTRIBUTES,
                payload,
                loading,
                ok: (res) => {
                    const {
                        data: { data, status },
                    } = res;
                    if (status) {
                        dispatch(target_list_view({ field: 'downloadAttributes', data: data }));
                    } else {
                        dispatch(target_list_view({ field: 'downloadAttributes', data: [] }));
                    }
                    return { status, data: data ?? [] };
                },
                fail: () => {
                    dispatch(target_list_view({ field: 'downloadAttributes', data: [] }));
                    return { status: false, data: [] };
                },
            }),
        );
    };

export const getSearchDropdownDataTargetList =
    ({ payload, loading = true }) =>
        async (dispatch) =>
            dispatch(
                request.post({
                    url: TARGET_LIST_SEARCH_NAME,
                    payload,
                    loading,
                    ok: ({ data }) => {
                        if (data.status) {
                            let temp = parseAudienceJsonArray(data?.data, []);
                            // console.log('Temp result ::::::::::::::: ', temp);
                            dispatch(get_target_list({ field: 'advSearchDropdown', data: [...temp] }));
                            // setDropdownData(data?.data);
                        } else {
                            dispatch(get_target_list({ field: 'advSearchDropdown', data: [] }));
                        }
                    },
                    fail: (err) => {
                        // console.log('Payload ', payload);
                    },
                }),
            );

export const getSftpList =
    (payload, { loading = true } = {}) =>
        async (dispatch) =>
            dispatch(
                request.post({
                    url: GET_SFTP_CREDENTIALS,
                    payload,
                    loading,
                    ok: (res) => {
                        const {
                            data: { data, status },
                        } = res;
                        if (status) {
                            // dispatch(target_list_view({ field: 'downloadAttributes', data: data }));
                        }
                    },
                    fail: (err) => {
                    },
                }),
            );

export const saveFtf = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SAVESFT,
            payload,
            loading: true,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
                if (status) {
                    // dispatch(target_list_view({ field: 'downloadAttributes', data: data }));
                }
            },
            fail: (err) => {
            },
        }),
    );
};

export const downloadTargetListFiles = (payload, loading = true) => async (dispatch) => {
    return dispatch(
        request.post({
            url: TARGET_LIST_DOWNLOAD_FILES,
            payload,
            loading: loading,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
                if (status) {
                    // dispatch(target_list_view({ field: 'downloadAttributes', data: data }));
                }
            },
            fail: (err) => {
            },
        }),
    );
};
export const getSegScheduleDetails = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_SEG_SCHEDULE,
            payload,
            loading: loading,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
                if (status) {
                }
            },
            fail: (err) => {},
        }),
    );
};
export const stopSegSchedule = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: STOP_SEG_SCHEDULE,
            payload,
            loading,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
                if (status) {
                }
            },
            fail: (err) => {},
        }),
    );
};



export const duplicateTargetList = (payload, loading = true) => async (dispatch) => {
    return dispatch(
        request.post({
            url: TARGET_LIST_DUPLICATE,
            payload,
            loading,
            ok: (res) => {
                const {
                    data: { data, status, message = 'No data available' },
                } = res;
                if (status) {
                    const { clientId, userId, departmentId } = payload;
                    // dispatch(
                    //     getTargetListView({
                    //         clientId,
                    //         userId,
                    //         departmentId,
                    //         pagination: {
                    //             pageNo: 1,
                    //             pageSize: 9,
                    //         },
                    //         isFilteration: false,
                    //         isAdvanceSearch: false,
                    //         filteration: {
                    //             listName: '',
                    //             listType: userId,
                    //             createdBy: '',
                    //             approvalStatus: 0,
                    //             searchBy: '',
                    //             searchValue: '',
                    //             isContains: false,
                    //             isDateFilter: false,
                    //             dateFilter: {
                    //                 fromDate: getYYMMDD(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER)),
                    //                 toDate: getYYMMDD(new Date()),
                    //             },
                    //         },
                    //     }),
                    // );
                    // dispatch(update_failures_API_Errors({ field: 'DuplicateList', message: '' }));
                } else {
                    // dispatch(
                    //     update_failures_API_Errors({
                    //         field: 'DuplicateList',
                    //         message: message || 'No data available',
                    //     }),
                    // );
                }
            },
            fail: (err) => {
            },
            isFailureCheck: true
        }),
    );
};

export const updateCGTGValue = (payload, loading = true) => async (dispatch) => {
    return dispatch(
        request.post({
            url: UPDATE_CG_TG_VALUE,
            payload,
            loading,
            ok: (res) => {
                const {
                    data: { data, status, message = 'No data available' },
                } = res;
                if (status) {
                } else {
                    // dispatch(
                    //     update_failures_API_Errors({
                    //         field: 'UpdateSegmentCGTGValue',
                    //         message: message || 'No data available',
                    //     }),
                    // );
                }
            },
            isFailureCheck: true,
            fail: ({ response }) => {
                const {
                    data: { status, message = 'No data available' },
                } = response;
                // if (status) {
                //     dispatch(update_failures_API_Errors({ field: 'UpdateSegmentCGTGValue', message: '' }));
                // } else {
                //     dispatch(
                //         update_failures_API_Errors({
                //             field: 'UpdateSegmentCGTGValue',
                //             message: message || 'No data available',
                //         }),
                //     );
                // }

            },
        }),
    );
};

export const tl_CGTGONOFF =
    ({ payload, loading = true }) =>
        async (dispatch) =>
            dispatch(
                request.post({
                    url: TL_CGTG_ONOFF,
                    payload,
                    loading,
                    isFailureCheck: true,
                    ok: (res) => {
                        const {
                            data: { data, status, message = 'No data available' },
                        } = res;
                        // if (status) {
                        //     dispatch(update_failures_API_Errors({ field: 'IsCGTGONOFF', message: '' }));
                        // } else {
                        //     dispatch(
                        //         update_failures_API_Errors({
                        //             field: 'IsCGTGONOFF',
                        //             message: message || 'No data available',
                        //         }),
                        //     );
                        // }
                    },
                    fail: (err) => {
                    },
                }),
            );
export const getTargetInfo =
    ({ payload, loading = false }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_TARGET_INFO,
                payload,
                loading,
                ok: (res) => {
                    const {
                        data: { data, status, message = 'No data available' },
                    } = res;
                    if (status) {
                        dispatch(target_list_view({ field: 'targetInfo', data: data }));
                    } else {
                        dispatch(target_list_view({ field: 'targetInfo', data: [] }));
                    }
                    return { status, data, message };
                },
                fail: () => {
                    dispatch(target_list_view({ field: 'targetInfo', data: [] }));
                    return { status: false, data: [] };
                },
            }),
        );
    };
const formatAdvanceAnalyticsGridData = (data) =>
    data?.map((item) => {
        const { Count, ...otherProps } = item;
        return { ...otherProps, Count };
    });

export const getAdvanceAnalyticsList =
    ({ payload, loading = false }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_ADVANCE_ANALYTICS_LIST,
                payload,
                loading,
                ok: (res) => {
                    const {
                        data: { data, status },
                    } = res;
                    if (status) {
                        let tempData = parseAudienceJsonArray(data, []);
                        tempData.sort((a, b) => {
                            if (a.attributeName < b.attributeName) return -1;
                            if (a.attributeName > b.attributeName) return 1;
                            return 0;
                        });
                        dispatch(target_list_view({ field: 'GetAdvanceAnalyticsList', data: tempData }));
                        return { status, data: tempData };
                    }
                    dispatch(target_list_view({ field: 'GetAdvanceAnalyticsList', data: [] }));
                    return { status: false, data: [] };
                },
                fail: () => {
                    dispatch(target_list_view({ field: 'GetAdvanceAnalyticsList', data: [] }));
                    return { status: false, data: [] };
                },
            }),
        );
    };

export const getAdvanceAnalyticsGrid =
    ({ payload, loading = false }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_ADVANCE_ANALYTICS_GRID,
                payload,
                loading,
                ok: (res) => {
                    const {
                        data: { data, status },
                    } = res;
                    if (status) {
                        const tempJsonData = formatAdvanceAnalyticsGridData(JSON.parse(data));
                        dispatch(target_list_view({ field: 'getAdvAnalyticsGrid', data: tempJsonData }));
                        return { status, data: tempJsonData };
                    }
                    dispatch(target_list_view({ field: 'getAdvAnalyticsGrid', data: [] }));
                    return { status: false, data: [] };
                },
                fail: () => {
                    dispatch(target_list_view({ field: 'getAdvAnalyticsGrid', data: [] }));
                    return { status: false, data: [] };
                },
            }),
        );
    };
export const getAudienceDownloadFile = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_AUDIENCE_CSV_DOWNLOAD,
            payload,
            loading: true,
            ok: (res) => {
                // const {
                //     data: { data, status },
                // } = res;
                // if (status) {
                //     dispatch(target_list_view({ field: 'getAudienceDownloadCSVFileName', data: data }));
                // } else {
                //     dispatch(target_list_view({ field: 'getAudienceDownloadCSVFileName', data: data }));
                // }
            },
            fail: (err) => {
            },
        }),
    );
};

export const getAdvAnlayticsDownloadFile = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_ADVANCE_ANALYTICS_DOWNLOAD,
            payload,
            loading: true,
            ok: (res) => {
                const {
                    data: { data, status },
                } = res;
                if (status) {
                    // dispatch(target_list_view({ field: 'getAdvAnlayticsDownload', data: JSON.parse(data) }));
                }
            },
            fail: (err) => {
            },
        }),
    );
};
export const getTLShareList =
    ({ payload, loading = false }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_TL_SHARELIST,
                payload,
                loading,
                ok: (res) => {
                    const {
                        data: { data, status },
                    } = res;
                    if (status) {
                        dispatch(target_list_view({ field: 'socialShareList', data: data }));
                    } else {
                        dispatch(target_list_view({ field: 'socialShareList', data: [] }));
                    }
                    return { status, data: data ?? [] };
                },
                fail: () => {
                    dispatch(target_list_view({ field: 'socialShareList', data: [] }));
                    return { status: false, data: [] };
                },
                isFailureCheck: false,
            }),
        );
    };
export const getTLShareUpload = (payload, loading = true) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_TL_SHARE_UPLOAD,
            payload,
            loading,
            isFailureCheck : true,
        }),
    );
};
export const getOnlineAudience = (payload, loading = true) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_ONLINE_AUDIENCE,
            payload,
            loading,
        }),
    );
};

export const getTLSampleRecords =
    ({ payload, loading = false }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_TL_SAMPLELIST,
                payload,
                loading,
            }),
        );
    };
export const removeSeedlist = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: REMOVE_TL_SEEDLIST,
            payload,
            loading: true,
        }),
    );
};

// ----------match list apis in target list------------//

export const get_match_list =
    ({ payload }) =>
        async (dispatch) => {
            return dispatch(
                request.post({
                    url: MATCH_INPUT_LIST,
                    payload,
                    isToast: false,
                    loading: true,
                    ok: (res) => {
                        const {
                            data: { status, message = 'No data available' },
                        } = res;

                    },
                    fail: (err) => {
                    },
                    isFailureCheck: false
                }),
            );
        };

export const get_attribute_name =
    ({ payload }) =>
        async (dispatch) => {
            return dispatch(
                request.post({
                    url: GET_ATTRIBUTE_NAME,
                    payload,
                    isToast: false,
                    loading: true,
                ok: () => {},
                    fail: (err) => {
                    },
                }),
            );
        };
export const ml_list_save =
    ({ payload }) =>
        async (dispatch) => {
            return dispatch(
                request.post({
                    url: ML_LIST_SAVE,
                    payload,
                    isToast: false,
                    loading: true,
                    ok: (res) => {
                        const {
                            data: { status, message = 'No data available' },
                        } = res;

                    },
                    isFailureCheck: true,
                    fail: ({ response }) => {
                        const {
                            data: { status, message = 'No data available' },
                        } = response;

                    },
                }),
            );
        };
export const edit_recipientBunchName =
    ({ payload, loading = false }) =>
        async (dispatch) => {
            return dispatch(
                request.post({
                    url: EDIT_NAME_SAVE,
                    payload,
                    isToast: false,
                    loading,
                ok: () => {},
                    fail: (err) => {
                    },
                }),
            );
        };
export const getDataService =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_AUDIENCE_DATA_SERVICE,
                payload,
                loading,
                ok: (res) => {
                    const {
                        data: { status, data },
                    } = res;
                    const result = status ? data : [];
                    dispatch(target_list_view({ field: 'dataService', data: result }));
                    return { status, data: result };
                },
                fail: () => {
                    dispatch(target_list_view({ field: 'dataService', data: [] }));
                    return { status: false, data: [] };
                },
            }),
        );

export const getDataAttributeGroup =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_DATA_ATTRIBUTEGROUPS,
                payload,
                loading,
                ok: (res) => {
                    const {
                        data: { status, data },
                    } = res;
                    const result = status ? data : [];
                    dispatch(target_list_view({ field: 'attributeGroups', data: result }));
                    return { status, data: result };
                },
                fail: () => {
                    dispatch(target_list_view({ field: 'attributeGroups', data: [] }));
                    return { status: false, data: [] };
                },
            }),
        );

export const getDataAttributeGroupName =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_DATA_ATTRIBUTE_GROUPNAME,
                payload,
                loading,
                ok: (res) => {
                    const {
                        data: { status, data },
                    } = res;
                    const result = status ? data : [];
                    dispatch(target_list_view({ field: 'augArrtibutes', data: result }));
                    return { status, data: result };
                },
                fail: () => {
                    dispatch(target_list_view({ field: 'augArrtibutes', data: [] }));
                    return { status: false, data: [] };
                },
            }),
        );

export const getSelectedColumns =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_AUDIENCE_SELECTEDCOLS,
                payload,
                loading,
                ok: (res) => {
                    const {
                        data: { status, data },
                    } = res;
                    const result = status ? data : [];
                    dispatch(target_list_view({ field: 'selectedCols', data: result }));
                    return { status, data: result };
                },
                fail: () => {
                    dispatch(target_list_view({ field: 'selectedCols', data: [] }));
                    return { status: false, data: [] };
                },
            }),
        );

export const getAudVersionHistory =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_AUDIENCE_VERSION_HISTORY,
                payload,
                loading,
                ok: (res) => {
                    const {
                        data: { status, data },
                    } = res;
                    return { status, data: data ?? [] };
                },
                fail: () => ({ status: false, data: [] }),
            }),
        );

export const saveDataAugmentation =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: SAVE_DATA_AUGMENTATION,
                payload,
                loading,
                ok: (res) => {
                    const {
                        data: { status, data, message },
                    } = res;
                    return { status, data, message };
                },
                fail: () => ({ status: false, data: null }),
            }),
        );
/**
 * Target List / Dynamic List — “Created by” options (`Audience/getUserNameByList`).
 * Payload: `{ clientId, userId, departmentId }`.
 * Resolves to API envelope `{ status, message?, data }` (same as `Utils/Http` post).
 */
export const getTLDLUserNameList =
    ({ payload, loading = false }) =>
        async (dispatch) =>
            dispatch(
                request.post({
                    url: GET_TL_DL_USERLIST,
                    payload,
                    loading,
                    ok: (res) => { 
                    if (res?.data?.status) {
                        const rows = normalizeTLDLUserListRows(res.data);
                        dispatch(target_list_view({ field: 'tldlUserList', data: rows }));
                    } else {
                        dispatch(target_list_view({ field: 'tldlUserList', data: [] }));
                    }
                    return res?.data;
                },
                    fail: () => { 
                    dispatch(target_list_view({ field: 'tldlUserList', data: [] }));
                    return { status: false, data: [] };
                },
                }),
            );

/**
 * Normalizes `getUserNameByList` `data` into rows `{ userId, firstName }` for advance search + API mapping.
 */
export function normalizeTLDLUserListRows(apiEnvelope) {
    if (!apiEnvelope?.status) return [];
    let raw = apiEnvelope.data;
    if (typeof raw === 'string') {
        raw = parseAudienceJsonArray(raw, []);
    }
    const rows = Array.isArray(raw) ? raw : raw != null && typeof raw === 'object' && Array.isArray(raw.userList) ? raw.userList : [];
    return rows
        .map((row) => {
            if (row == null) return null;
            if (typeof row === 'string') {
                const s = row.trim();
                return s ? { userId: s, firstName: s } : null;
            }
            const firstName = String(
                row.firstName ??
                row.FirstName ??
                row.userName ??
                row.UserName ??
                row.name ??
                row.Name ??
                '',
            ).trim();
            if (!firstName) return null;
            const userId = row.userId ?? row.UserId ?? row.userID ?? row.UserID ?? row.id ?? row.Id ?? '';
            return { userId, firstName };
        })
        .filter(Boolean);
}