import { CONNECT_BQ, CRMDB_CONNECTIONS_EXIST, CRM_CONNECT_CATEGORY, CRM_CONNECT_TABLES, CRM_GET_COLUMN_TABLES, CRM_GET_TABLES, CRM_TABLES, CRM_TABLE_COLUMNS, DATAEXCHANGE_CONNECT_EXIST, DATAEXCHANGE_DATA_FROM_TABLES, DATAEXCHANGE_GET_COLUMN_TABLES, DATAEXCHANGE_GET_TABLES, DB_CONNECTIONS_EXIST, FRIENDLYNAME_CHECK, GET_BLACKBAUD_LOGIN, GET_BQ_TABLE, GET_BQ_TABLECOLUMN, GET_COLUMN_TABLES, GET_CONNECTION_TYPE, GET_CONNECTORS_VERSIUM, GET_CONNECTORS_VERSIUM_BYID, GET_CONNECTORS_VERSIUM_RECENCY, GET_CONNECTORS_VERSIUM_UPDATEDCOLUMNS, GET_DATASET_LIST, GET_DATA_ATTRIBUTE_GROUPNAME, GET_DATA_FROM_TABLES, GET_ORGANIZATION_LIST, GET_PARTNER_CONNECTION_DETAILS, GET_PROJECT_LIST, GET_TABLES_FROM_DB, GET_TABLE_COL, GET_TABLE_DATA, GET_UPDATE_CYCLE, GET_WEBEX_DATAS, GET_WEBINAR_DATAS, GET_WEBINAR_LOGIN, GET_WISTIA_MEDIA, GET_ZEROUNBOUNCE_CONNECT, RENXT_TOKEN_VALIDATION, SAVE_CONNECTORS_VERSIUM_ATTRIBUTES, SAVE_CONNECTORS_VERSIUM_ATTRIBUTES_COUNT, SAVE_CONNECTORS_VERSIUM_ATTRIBUTE_FILTERJSON, SYNC_CRM_CUSTOM_DATA, SYNC_CRM_DATA, UPDATE_DEDUPE_SETTING_RDS, UPDATE_PARTNER_CONNECTION_DETAILS } from 'Constants/EndPoints';
import request from 'Utils/Http';
import {
    connectBQprojectList,
    connectToBQ,
    getBQColumnStatus,
    getBQDataSetList,
    getBQTableStatus,
    getShowTableColumn,
    getTableColumnDetails,
    getTableDropDown,
    updateCycleFrequency,
    updateOrganizationList,
    updateWistiaMedia,
    versiumDataUpdate,
} from './reducer';

export const getColumnDetails =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_TABLE_COL,
                payload,
                loading: true,
                ok: ({ data }) => {
                    if (data.status) {
                        const { status, data: res } = data;
                        if (status) {
                            dispatch(getTableColumnDetails(res));
                            dispatch(getShowTableColumn(status));
                        }
                    }
                },
                fail: (err) => {},
            }),
        );

export const getBQprojectList =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_PROJECT_LIST,
                payload,
                loading: true,
                ok: ({ data }) => {
                    if (data.status) {
                        const { status, data: res } = data;
                        if (status) {
                            dispatch(connectBQprojectList(res));
                        }
                    }
                },
                fail: (err) => {},
            }),
        );

export const getBQDataSets =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_DATASET_LIST,
                payload,
                loading: true,
                ok: ({ data }) => {
                    if (data.status) {
                        const { status, data: res } = data;
                        if (status) {
                            dispatch(getBQDataSetList(res));
                        }
                    }
                },
                fail: (err) => {},
            }),
        );

export const getBQcolumns =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_BQ_TABLE,
                payload,
                loading: true,
                ok: ({ data }) => {
                    if (data.status) {
                        dispatch(getBQTableStatus(data));
                    }
                },
                fail: (err) => {},
            }),
        );
    };

export const getBQTableColumn =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_BQ_TABLECOLUMN,
                payload,
                loading: true,
                ok: ({ data }) => {
                    if (data.status) {
                        const { status, data: res } = data;
                        if (status) {
                            dispatch(getBQColumnStatus(res));
                        }
                    }
                },
                fail: (err) => {},
            }),
        );
    };

export const checkFriendlyNameExists =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: FRIENDLYNAME_CHECK,
                payload,
                //loading: true,
                isToast: false,
                ok: ({ data }) => {},
                fail: (err) => {},
            }),
        );
    };
//CRM
export const crm_getColumnTables =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: CRM_GET_COLUMN_TABLES,
                payload,
                loading: true,
                ok: ({ data }) => {
                    if (data.status) {
                        const { status, data: res } = data;
                        if (status) {
                            dispatch(getTableColumnDetails(res));
                            dispatch(getShowTableColumn(status));
                        }
                    }
                },
                fail: (err) => {},
            }),
        );
export const dataExchange_SaveData =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: DATAEXCHANGE_DATA_FROM_TABLES,
                payload,
                loading,
                // isFailureCheck: true,
                ok: ({ data }) => {},
                fail: (err) => {},
            }),
        );
export const GetCRM_Categories =
    ({ payload, dispatchState, isLoading = false }) =>
    async (dispatch) => {
        dispatchState({
            type: 'UPDATE',
            field: 'tableData',
            payload: { loading: true, data: [] },
        });
        return dispatch(
            request.post({
                url: CRM_CONNECT_CATEGORY,
                payload,
                loading: isLoading,
                ok: ({ data }) => {
                    if (data?.status) {
                        let res = data?.data || [];
                        res = res.map((item, ind) => ({
                            type: item,
                            typeId: ind + 1,
                        }));
                        dispatchState({
                            type: 'UPDATE',
                            field: 'tableData',
                            payload: { loading: false, data: res },
                        });
                    } else {
                        dispatchState({
                            type: 'UPDATE',
                            field: 'tableData',
                            payload: { loading: false, data: [] },
                        });
                    }
                },
                fail: () => {
                    dispatchState({
                        type: 'UPDATE',
                        field: 'tableData',
                        payload: { loading: false, data: [] },
                    });
                },
            }),
        );
    };
export const GetCRM_TableColumns =
    ({ payload, dispatchState, loading = false }) =>
    async (dispatch) => {
        // dispatchState({
        //     type: 'UPDATE',
        //     field: 'categoryData',
        //     payload: { loading: true, data: [] },
        // });

        return dispatch(
            request.post({
                url: CRM_TABLE_COLUMNS,
                payload,
                loading,
                ok: ({ data }) => {
                    if (data?.status) {
                    } else {
                        // dispatchState({
                        //     type: 'UPDATE',
                        //     field: 'categoryData',
                        //     payload: { loading: false, data: [] },
                        // });
                    }
                },
                fail: () => {
                    // dispatchState({
                    //     type: 'UPDATE',
                    //     field: 'categoryData',
                    //     payload: { loading: false, data: [] },
                    // });
                },
            }),
        );
    };

export const GetCRM_Tables =
    ({ payload, dispatchState, loading = false }) =>
    async (dispatch) => {
        dispatchState({
            type: 'UPDATE',
            field: 'crmTables',
            payload: { loading: true, data: [] },
        });

        return dispatch(
            request.post({
                url: CRM_TABLES,
                payload,
                loading,
                ok: ({ data }) => {
                    if (data?.status) {
                        let res = data?.data || [];
                        res = res.map((item, ind) => {
                            const isObject = typeof item === 'object' && item !== null;

                            return {
                                type: isObject ? item.uiLabelName : item,
                                typeId: ind + 1,
                                objectName: isObject ? item.objectName : item,
                                uiLabelName: isObject ? item.uiLabelName : item,
                            };
                        });
                        dispatchState({
                            type: 'UPDATE',
                            field: 'crmTables',
                            payload: { loading: false, data: res },
                        });
                    } else {
                        dispatchState({
                            type: 'UPDATE',
                            field: 'crmTables',
                            payload: { loading: false, data: [] },
                        });
                    }
                },
                fail: () => {
                    dispatchState({
                        type: 'UPDATE',
                        field: 'crmTables',
                        payload: { loading: false, data: [] },
                    });
                },
            }),
        );
    };

export const Sync_CRM_Data =
    ({ payload, loading = false }) =>
    async (dispatch) => {
        // dispatchState({
        //     type: 'UPDATE',
        //     field: 'crmTables',
        //     payload: { loading: true, data: [] },
        // });

        return dispatch(
            request.post({
                url: SYNC_CRM_DATA,
                payload,
                loading,
                ok: ({ data }) => {
                    if (data?.status) {
                        //  let res = data?.data || [];
                        // res = res.map((item, ind) => ({
                        //     type: item,
                        //     typeId: ind + 1,
                        // }));
                        // dispatchState({
                        //     type: 'UPDATE',
                        //     field: 'crmTables',
                        //     payload: { loading: false, data: res },
                        // });
                    } else {
                        // dispatchState({
                        //     type: 'UPDATE',
                        //     field: 'crmTables',
                        //     payload: { loading: false, data: [] },
                        // });
                    }
                },
                fail: () => {
                    //  dispatchState({
                    //         type: 'UPDATE',
                    //         field: 'crmTables',
                    //         payload: { loading: false, data: [] },
                    //     });
                },
            }),
        );
    };

export const Sync_CRM_Custom_Data =
    ({ payload, loading = false }) =>
    async (dispatch) => {
        // dispatchState({
        //     type: 'UPDATE',
        //     field: 'crmTables',
        //     payload: { loading: true, data: [] },
        // });

        return dispatch(
            request.post({
                url: SYNC_CRM_CUSTOM_DATA,
                payload,
                loading,
                ok: ({ data }) => {
                    if (data?.status) {
                        //  let res = data?.data || [];
                        // res = res.map((item, ind) => ({
                        //     type: item,
                        //     typeId: ind + 1,
                        // }));
                        // dispatchState({
                        //     type: 'UPDATE',
                        //     field: 'crmTables',
                        //     payload: { loading: false, data: res },
                        // });
                    } else {
                        // dispatchState({
                        //     type: 'UPDATE',
                        //     field: 'crmTables',
                        //     payload: { loading: false, data: [] },
                        // });
                    }
                },
                fail: () => {
                    //  dispatchState({
                    //         type: 'UPDATE',
                    //         field: 'crmTables',
                    //         payload: { loading: false, data: [] },
                    //     });
                },
            }),
        );
    };

//CRM
export const db_connection_exist =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: DB_CONNECTIONS_EXIST,
                payload,
                loading: loading,
                ok: ({ data }) => {
                    if (data.status) {
                        const { status, data: res } = data;
                        if (status) {
                        }
                    }
                },
                fail: (err) => {},
            }),
        );

export const get_tables_from_DB =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_TABLES_FROM_DB,
                payload,
                loading: true,
                ok: ({ data }) => {
                    if (data.status) {
                        const { status, data: res } = data;
                        if (status) {
                            dispatch(getTableDropDown(res));
                        }
                    }
                },
                fail: (err) => {},
            }),
        );

export const get_tables_from_DB1 =
    ({ payload, isLoading = false, dispatchState }) =>
    async (dispatch) => {
        dispatchState({
            type: 'UPDATE',
            field: 'tableData',
            payload: { loading: true, data: [] },
        });
        return dispatch(
            request.post({
                url: GET_TABLES_FROM_DB,
                payload,
                loading: isLoading,
                ok: ({ data }) => {
                    if (data?.status) {
                        let res = data?.data || [];
                        res = res.map((item, ind) => ({
                            type: item,
                            typeId: ind + 1,
                        }));
                        dispatchState({
                            type: 'UPDATE',
                            field: 'tableData',
                            payload: { loading: false, data: res },
                        });
                    } else {
                        dispatchState({
                            type: 'UPDATE',
                            field: 'tableData',
                            payload: { loading: false, data: [] },
                        });
                    }
                },
                fail: () => {
                    dispatchState({
                        type: 'UPDATE',
                        field: 'tableData',
                        payload: { loading: false, data: [] },
                    });
                },
            }),
        );
    };
export const getColumnTables =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_COLUMN_TABLES,
                payload,
                loading: loading,
                ok: ({ data }) => {
                    if (data.status) {
                        const { status, data: res } = data;
                        if (status) {
                            dispatch(getTableColumnDetails(res));
                            dispatch(getShowTableColumn(status));
                        }
                    }
                },
                fail: (err) => {},
            }),
        );
export const getColumnTables1 =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_COLUMN_TABLES,
                payload,
                loading: loading,
                ok: ({ data }) => {
                    if (data.status) {
                        const { status, data: res } = data;
                        if (status) {
                            dispatch(getTableColumnDetails(res));
                            dispatch(getShowTableColumn(status));
                        }
                    }
                },
                fail: (err) => {},
            }),
        );

export const consfirmMYSQLData =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_DATA_FROM_TABLES,
                payload,
                loading,
                // isFailureCheck: true,
                ok: ({ data }) => {},
                fail: (err) => {},
            }),
        );

//hubspot
export const dataExchange_connection_exist =
    ({ payload , loading = false}) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: DATAEXCHANGE_CONNECT_EXIST,
                payload,
                loading: loading,
                ok: ({ data }) => {
                    if (data.status) {
                        const { status, data: res } = data;
                        if (status) {
                        }
                    }
                },
                fail: (err) => {},
            }),
        );

export const dataExchange_get_tables_from_DB =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: DATAEXCHANGE_GET_TABLES,
                payload,
                loading: true,
                ok: ({ data }) => {
                    if (data.status) {
                        const { status, data: res } = data;
                        if (status) {
                            if (
                                payload?.connectorId === 55 ||
                                payload?.connectorId === 158 ||
                                payload?.connectorId === 106
                            ) {
                                dispatch(getTableDropDown(res?.tables));
                            } else {
                                dispatch(getTableDropDown(res));
                            }
                        }
                    } else {
                        dispatch(getTableDropDown([]));
                    }
                },
                fail: (err) => {},
            }),
        );
export const dataExchange_get_tables_from_DB1 =
    ({ payload, dispatchState }) =>
    async (dispatch) => {
        dispatchState({
            type: 'UPDATE',
            field: 'tableData',
            payload: { loading: true, data: [] },
        });

        return dispatch(
            request.post({
                url: DATAEXCHANGE_GET_TABLES,
                payload,

                ok: ({ data }) => {
                    if (data?.status) {
                        let raw = data?.tables ?? data?.data ?? [];

                        if (typeof raw === 'string') {
                            try {
                                raw = JSON.parse(raw);
                            } catch (e) {
                                raw = [];
                            }
                        }

                        const tableData = Array.isArray(raw) ? raw : [];

                        const formattedData = tableData
                            .map((table, index) => {
                                let objectName = '';
                                let uiLabelName = '';

                                if (typeof table === 'string') {
                                    objectName = table;
                                    uiLabelName = table;
                                } else if (table?.objectName) {
                                    objectName = table.objectName;
                                    uiLabelName = table.uiLabelName || table.objectName;
                                } else if (table?.type) {
                                    const typeObj = table.type;

                                    if (typeof typeObj === 'string') {
                                        objectName = typeObj;
                                        uiLabelName = typeObj;
                                    } else {
                                        objectName = typeObj?.objectName;
                                        uiLabelName = typeObj?.uiLabelName || typeObj?.objectName;
                                    }
                                }

                                return {
                                    ...(typeof table === 'object' ? table : {}),
                                    type: objectName,
                                    objectName,
                                    uiLabelName,
                                    typeId: index + 1,
                                };
                            })
                            .filter((item) => item?.objectName)
                            .sort((a, b) => (a.objectName || '').localeCompare(b.objectName || ''));

                        dispatchState({
                            type: 'UPDATE',
                            field: 'tableData',
                            payload: {
                                loading: false,
                                data: formattedData,
                            },
                        });
                    } else {
                        dispatchState({
                            type: 'UPDATE',
                            field: 'tableData',
                            payload: { loading: false, data: [] },
                        });
                    }
                },

                fail: () => {
                    dispatchState({
                        type: 'UPDATE',
                        field: 'tableData',
                        payload: { loading: false, data: [] },
                    });
                },
            }),
        );
    };

export const getConnectionType =
    ({ payload, dispatchState, isLoading = false }) =>
    async (dispatch) => {
        dispatchState({
            type: 'UPDATE',
            field: 'connectionType',
            payload: { loading: true, data: [] },
        });

        dispatch(
            request.post({
                url: GET_CONNECTION_TYPE,
                payload,
                loading: isLoading,
                ok: ({ data }) => {
                    if (data?.status) {
                        let res = data?.data || [];
                        res = res.map((item, ind) => ({
                            type: item,
                            typeId: ind + 1,
                        }));
                        dispatchState({
                            type: 'UPDATE',
                            field: 'connectionType',
                            payload: { loading: false, data: res },
                        });
                    } else {
                        dispatchState({
                            type: 'UPDATE',
                            field: 'connectionType',
                            payload: { loading: false, data: [] },
                        });
                    }
                },
                fail: () => {
                    dispatchState({
                        type: 'UPDATE',
                        field: 'connectionType',
                        payload: { loading: false, data: [] },
                    });
                },
            }),
        );
    };

export const dataExchange_getColumnTables =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: DATAEXCHANGE_GET_COLUMN_TABLES,
                payload,
                loading: true,
                isFailureCheck: true,
                ok: ({ data }) => {
                    if (data.status) {
                        const { status, data: res } = data;
                        if (status) {
                            if (payload?.connectorId === 55) {
                                dispatch(getTableColumnDetails(res?.columns));
                            } else if (payload?.connectorId === 158 || payload?.connectorId === 106) {
                                dispatch(getTableColumnDetails(res?.tableColumns));
                            } else {
                                dispatch(getTableColumnDetails(res));
                            }
                            dispatch(getShowTableColumn(status));
                        } else {
                            dispatch(getTableColumnDetails([]));
                            dispatch(getShowTableColumn(status));
                        }
                    } else {
                        dispatch(getTableColumnDetails([]));
                        dispatch(getShowTableColumn(true));
                    }
                },
                fail: (err) => {},
            }),
        );
export const dataExchange_getColumnTables1 =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: DATAEXCHANGE_GET_COLUMN_TABLES,
                payload,
                loading: loading,
                isFailureCheck: true,
                ok: ({ data }) => {
                    if (data.status) {
                        const { status, data: res } = data;
                        if (status) {
                            // if (payload?.connectorId === 55) {
                            //     dispatch(getTableColumnDetails(res?.columns));
                            // } else if (payload?.connectorId === 158 || payload?.connectorId === 106) {
                            //     dispatch(getTableColumnDetails(res?.tableColumns));
                            // } else {
                            //     dispatch(getTableColumnDetails(res));
                            // }
                            // dispatch(getShowTableColumn(status));
                        } else {
                            dispatch(getTableColumnDetails([]));
                            dispatch(getShowTableColumn(status));
                        }
                    } else {
                        dispatch(getTableColumnDetails([]));
                        dispatch(getShowTableColumn(true));
                    }
                },
                fail: (err) => {},
            }),
        );

//Versium

export const db_connection_Versium =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_CONNECTORS_VERSIUM,
                payload,
                loading: true,
                ok: ({ data }) => {
                    if (data.status) {
                        const { status, data: res } = data;
                        if (status) {
                        }
                    }
                },
                fail: (err) => {},
            }),
        );
export const db_connection_Versium1 =
    ({ payload , loading = false}) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_CONNECTORS_VERSIUM,
                payload,
                loading: loading,
                ok: ({ data }) => {
                    if (data.status) {
                        const { status, data: res } = data;
                        if (status) {
                        }
                    }
                },
                fail: (err) => {},
            }),
        );
        

export const getColumnTables_Versium =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_DATA_ATTRIBUTE_GROUPNAME,
                payload,
                loading: true,
                ok: ({ data }) => {
                    if (data.status) {
                        const { status, data: res } = data;
                        if (status) {
                            dispatch(getTableColumnDetails(res));
                            dispatch(getShowTableColumn(status));
                        }
                    }
                },
                fail: (err) => {},
            }),
        );
export const getColumnTables_Versium1 =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_DATA_ATTRIBUTE_GROUPNAME,
                payload,
                loading: loading,
                ok: ({ data }) => {
                    if (data.status) {
                        const { status, data: res } = data;
                        if (status) {
                            dispatch(getTableColumnDetails(res));
                            dispatch(getShowTableColumn(status));
                        }
                    }
                },
                fail: (err) => {},
            }),
        );
export const getRecency_Versium =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_CONNECTORS_VERSIUM_RECENCY,
                payload,
                loading: loading,
                ok: ({ data }) => {
                    if (data.status) {
                        const { status, data: res } = data;
                        if (status) {
                        }
                    }
                },
                fail: (err) => {},
            }),
        );
export const getUpdatedColumn_Versium =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_CONNECTORS_VERSIUM_UPDATEDCOLUMNS,
                payload,
                loading: loading,
                ok: ({ data }) => {
                    if (data.status) {
                        const { status, data: res } = data;
                        if (status) {
                        }
                    }
                },
                fail: (err) => {},
            }),
        );
export const saveBaseCount_Versium =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: SAVE_CONNECTORS_VERSIUM_ATTRIBUTES_COUNT,
                payload,
                loading: true,
                isFailureCheck: true,
                ok: ({ data }) => {
                    if (data.status) {
                        const { status, data: res } = data;
                        if (status) {
                        }
                    }
                },
                fail: (err) => {},
            }),
        );
export const saveFilterJSON_Versium =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: SAVE_CONNECTORS_VERSIUM_ATTRIBUTE_FILTERJSON,
                payload,
                loading,
                ok: ({ data }) => {
                    if (data.status) {
                        const { status, data: res } = data;
                        if (status) {
                        }
                    }
                },
                fail: (err) => {},
            }),
        );
export const save_Versium_data =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: SAVE_CONNECTORS_VERSIUM_ATTRIBUTES,
                payload,
                loading,
                ok: ({ data }) => {
                    if (data.status) {
                        const { status, data: res } = data;
                        if (status) {
                        }
                    }
                },
                fail: (err) => {},
            }),
        );

export const get_Versium_databyID =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_CONNECTORS_VERSIUM_BYID,
                payload,
                loading: loading,
                ok: ({ data }) => {
                    if (data.status) {
                        const { status, data: res } = data;
                        if (status) {
                            dispatch(versiumDataUpdate(res));
                        }
                    }
                },
                fail: (err) => {},
            }),
        );
export const get_Partner_Connection_details =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_PARTNER_CONNECTION_DETAILS,
                payload,
                loading: loading,
                ok: ({ data }) => {
                    if (data.status) {
                        const { status, data: res } = data;
                    }
                },
                fail: (err) => {},
            }),
        );
export const Update_Partner_Connection_details =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: UPDATE_PARTNER_CONNECTION_DETAILS,
                payload,
                loading: true,
                ok: ({ data }) => {
                    if (data.status) {
                        const { status, data: res } = data;
                    }
                },
                fail: (err) => {},
            }),
        );

//blackbaud

export const dataExchange_connection_blackbaud_login =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_BLACKBAUD_LOGIN,
                payload,
                loading: true,
                ok: ({ data }) => {
                    if (data.status) {
                        const { status, data: res } = data;
                        if (status) {
                        }
                    }
                },
                fail: (err) => {},
            }),
        );
//Webinar
export const dataExchange_connection_Webinar_login =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_WEBINAR_LOGIN,
                payload,
                loading: true,
                ok: ({ data }) => {
                    if (data.status) {
                        const { status, data: res } = data;
                        if (status) {
                        }
                    }
                },
                fail: (err) => {},
            }),
        );

export const dataExchange_get_Webinar =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_WEBINAR_DATAS,
                payload,
                loading: true,
                ok: ({ data }) => {
                    if (data.status) {
                        const { status, data: res } = data;
                        if (status) {
                        }
                    }
                },
                fail: (err) => {},
            }),
        );

//Webex
export const dataExchange_get_Webex =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_WEBEX_DATAS,
                payload,
                loading: true,
                ok: ({ data }) => {
                    if (data.status) {
                        const { status, data: res } = data;
                        if (status) {
                        }
                    }
                },
                fail: (err) => {},
            }),
        );

export const dataExchange_connection_blackbaud_Token =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: RENXT_TOKEN_VALIDATION,
                payload,
                loading: true,
                ok: ({ data }) => {
                    if (data.status) {
                        const { status, data: res } = data;
                        if (status) {
                        }
                    }
                },
                fail: (err) => {},
            }),
        );

export const getUpdateCycleFrequency =
    ({ payload, loading = false }) =>
    async (dispatch) => {
        return dispatch(
            request.get({
                url: GET_UPDATE_CYCLE,
                payload,
                loading: loading,
                ok: ({ data }) => {
                    if (data.status) {
                        const res = data?.data;
                        dispatch(updateCycleFrequency(res));
                    } else {
                        dispatch(updateCycleFrequency([]));
                    }
                },
                fail: (err) => {},
            }),
        );
    };

export const getWistiaMedia =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_WISTIA_MEDIA,
                payload,
                loading: true,
                ok: ({ data }) => {
                    if (data.status) {
                        const { status, data: res } = data;
                        if (status) {
                            dispatch(updateWistiaMedia(res));
                        } else {
                            dispatch(updateWistiaMedia([]));
                        }
                    }
                },
                fail: (err) => {},
            }),
        );
    };

export const getOrganizationList =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_ORGANIZATION_LIST,
                payload,
                loading: true,
                ok: ({ data }) => {
                    if (data.status) {
                        const res = data?.data;
                        dispatch(updateOrganizationList(res));
                    } else {
                        dispatch(updateOrganizationList([]));
                    }
                },
                fail: (err) => {},
            }),
        );
    };

export const updateDedupeRDS =
    ({ payload, loading = true }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: UPDATE_DEDUPE_SETTING_RDS,
                payload,
                loading: loading,
                ok: ({ data }) => {},
                fail: (err) => {},
            }),
        );
    };
 

        export const Update_Zerobounce_Connection_details =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_ZEROUNBOUNCE_CONNECT,
                payload,
                loading: true,
                ok: ({ data }) => {
                    if (data.status) {
                        const { status, data: res } = data;
                        if (status) {
                        }
                    }
                },
                fail: (err) => {},
            }),
        );