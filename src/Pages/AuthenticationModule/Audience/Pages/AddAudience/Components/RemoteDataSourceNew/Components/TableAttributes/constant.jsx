import { AUDIENCE_GLYPH as G } from 'Pages/AuthenticationModule/Audience/audienceGlyphs';
import { mySqlUpdate, mySqlDataUpdate } from 'Reducers/remoteDataSource/reducer';
import { INTEGRATED_SQL_CONNECTOR_IDS } from '../constants';

export const INITIAL_STATE = {
    showDropDownTableFlag: false,
    getAttributes: {},
    dedupeFlag: false,
    confirmPopup: false,
    apiErrorPopup: { show: false, message: '' },
    dataSyncModal: false,
    showAttributeError: false,
    tableMismatchError: false,
    connectionFlag: false,
    firstCheck: true,
    dataRemovePopup: { status: false, event: null },
    tabledd: [],
    primaryDropDown: [],
    foreignDropDown: [],
    projectList: [],
    dataSetList: [],
    bqColumnList: [],
    categoryData: {
        loading: false,
        data: []
    },
    tableColumnsData: {},
    finalConfig: {},
    crmTables: {},
    showCrmCreateTableName: false,
    connectorPayload : {},
    tableData: {
        loading: false,
        data: [],
        versiumConfig: null,
    },
    connectionType: {
        loading: false,
        data: []
    },
    isEditLoading: false
};

export const MYSQL_STATE_REDUCER = (state, action) => {
    const { type, field, payload, mode} = action;
    switch (type) {
        case 'UPDATE':
            return {
                ...state,
                [field]: payload,
            };
        case 'ATTRIBUTES_UPDATE':
            return {
                ...state,
                getAttributes: payload,
                showAttributeError: false,
            };
        case 'HANDLE_CONFIRM_POPUP':
            return {
                ...state,
                showAttributeError: false,
                confirmPopup: true,
            };
        case 'UPDATE_TABLE_COLUMNS':
            return {
                ...state,
                tableColumnsData: {...state.tableColumnsData, ...payload},
            };
        case 'UPDATE_FINAL_CONFIG': {
            if (mode === 'replace') {
                return {
                    ...state,
                    finalConfig: { ...payload },
                };
            }
            return {
                ...state,
                finalConfig: {...state.finalConfig, ...payload},
            };
        }
        case 'RESET':
            return {
                ...INITIAL_STATE,
                tableData: state.tableData,
                categoryData: state.categoryData,
                connectionType: state.connectionType,
                connectorPayload: state.connectorPayload
            };
        default:
            return state;
    }
};
export const CHECK_UPDATE_DATE_TIME_TYPES = [
    'DATETIME',
    'TIMESTAMP',
    'DATE',
    'TIMESTAMP(6) WITH TIME ZONE(13)',
    'DATETIME2',
    'timestamp without time zone',
];

export const isValidDateTimeType = (dataType) => {
    if (!dataType) return false;
    return CHECK_UPDATE_DATE_TIME_TYPES.some(
        (type) => dataType === type || dataType.toLowerCase() === type.toLowerCase(),
    );
};

export const checkTableChange = (
    getValues,
    attributes,
    mySql,
    trigger,
    firstCheck,
    dispatchState,
    dispatch,
    pathState,
    event,
    reset,
    proceedResetPrimary,
    primaryDropDown
) => {
    const remoteSourceId = pathState?.data?.remoteDataSourceID || 0;
    const mySqlLength = Object.keys(mySql)?.length;
    const { table, primaryKey, foreignKey, checkUpdate, checkValid_prime_date, isTouched } = getValues();
    const primaryKeyTable = mySql?.[table?.type]?.foreignKey === '';
    const tmpAttrs = { ...attributes };
    tmpAttrs.rightAttributes = tmpAttrs.rightAttributes.filter((attr) => attr.table === table.type);
    if (remoteSourceId === 40) {
        if (tmpAttrs?.rightAttributes?.length > 0) {
            const data = {
                primaryKey,
                foreignKey,
                checkUpdate,
                attributes: tmpAttrs,
            };
            dispatch(mySqlUpdate({ [table.type]: { ...data, id: table.id } }));
            return true;
        } else if (tmpAttrs?.rightAttributes?.length === 0 && Object.keys(mySql)?.includes(table.type)) {
            const sqlData = { ...mySql }; 
            delete sqlData[table.type];     
            dispatch(mySqlDataUpdate(sqlData));
            return true;
        }
        return true;
    }
    if (proceedResetPrimary) {
        reset((prev) => ({
            ...prev,
            primaryKey: '',
        }));
        return true;
    }
    if (!isTouched) return true;
    if (firstCheck) {
        dispatchState({ type: 'UPDATE', field: 'firstCheck', payload: false });
        return true;
    } else if (
        !mySqlLength &&
        (!getValues('primaryKey') || !checkUpdate) &&
        !checkValid_prime_date &&
        tmpAttrs.rightAttributes?.length &&
        (pathState?.data?.remoteDataSourceID === 1 ||
            pathState?.data?.remoteDataSourceID === 2 ||
            pathState?.data?.remoteDataSourceID === 3 ||
            pathState?.data?.remoteDataSourceID === 52 ||
            pathState?.data?.remoteDataSourceID === 53)
    ) {
        trigger(['primaryKey', 'checkUpdate'], { shouldFocus: true });
    } else if (
        mySqlLength &&
        !checkUpdate &&
        !checkValid_prime_date &&
        tmpAttrs.rightAttributes?.length &&
        primaryDropDown?.filter((el) => isValidDateTimeType(el['dataType']))?.length > 0 && 
        (pathState?.data?.remoteDataSourceID === 1 ||
            pathState?.data?.remoteDataSourceID === 2 ||
            pathState?.data?.remoteDataSourceID === 3 ||
            pathState?.data?.remoteDataSourceID === 52 ||
            pathState?.data?.remoteDataSourceID === 53 ||
            pathState?.data?.remoteDataSourceID === 28||
            pathState?.data?.remoteDataSourceID === 45||
            pathState?.data?.remoteDataSourceID === 5)
    ) {
        trigger(['checkUpdate'], { shouldFocus: true });
    } else if (
        tmpAttrs.rightAttributes?.length &&
        !getValues('primaryKey') &&
        pathState?.data?.remoteDataSourceID !== 40 &&
        (pathState?.data?.remoteDataSourceID === 45 ||
            pathState?.data?.remoteDataSourceID === 28 ||
            pathState?.data?.remoteDataSourceID === 22 ||
            pathState?.data?.remoteDataSourceID === 5 ||
            pathState?.data?.remoteDataSourceID === 50 ||
            pathState?.data?.remoteDataSourceID === 51 ||
            pathState?.data?.remoteDataSourceID === 48 ||
            pathState?.data?.remoteDataSourceID === 41 ||
            pathState?.data?.remoteDataSourceID === 49 ||
            pathState?.data?.remoteDataSourceID === 54 ||
            pathState?.data?.remoteDataSourceID === 23 ||
            pathState?.data?.remoteDataSourceID === 29 ||
            pathState?.data?.remoteDataSourceID === 156 ||
            pathState?.data?.remoteDataSourceID === 55 ||
            pathState?.data?.remoteDataSourceID === 21 ||
            pathState?.data?.remoteDataSourceID === 47 ||
            pathState?.data?.remoteDataSourceID === 46 ||
            pathState?.data?.remoteDataSourceID === 43 ||
            pathState?.data?.remoteDataSourceID === 160 ||
            pathState?.data?.remoteDataSourceID === 158 ||
            pathState?.data?.remoteDataSourceID === 106 ||
            pathState?.data?.remoteDataSourceID === 159 ||
            pathState?.data?.remoteDataSourceID === 166 ||
            pathState?.data?.remoteDataSourceID === 39 ||
            pathState?.data?.remoteDataSourceID === 168)
    ) {
        trigger(['primaryKey'], { shouldFocus: true });
    } else if (
        !primaryKeyTable &&
        mySqlLength &&
        getValues('foreignKey') === '' &&
        pathState?.data?.remoteDataSourceID !== 40 &&
        (pathState?.data?.remoteDataSourceID === 28 ||
            pathState?.data?.remoteDataSourceID === 45 ||
            pathState?.data?.remoteDataSourceID === 22 ||
            pathState?.data?.remoteDataSourceID === 5 ||
            pathState?.data?.remoteDataSourceID === 50 ||
            pathState?.data?.remoteDataSourceID === 51 ||
            pathState?.data?.remoteDataSourceID === 48 ||
            pathState?.data?.remoteDataSourceID === 41 ||
            pathState?.data?.remoteDataSourceID === 49 ||
            pathState?.data?.remoteDataSourceID === 54 ||
            pathState?.data?.remoteDataSourceID === 23 ||
            pathState?.data?.remoteDataSourceID === 29 ||
            pathState?.data?.remoteDataSourceID === 55 ||
            pathState?.data?.remoteDataSourceID === 156 ||
            pathState?.data?.remoteDataSourceID === 21 ||
            pathState?.data?.remoteDataSourceID === 47 ||
            pathState?.data?.remoteDataSourceID === 46 ||
            pathState?.data?.remoteDataSourceID === 43 ||
            pathState?.data?.remoteDataSourceID === 160 ||
            pathState?.data?.remoteDataSourceID === 158 ||
            pathState?.data?.remoteDataSourceID === 106  ||
            pathState?.data?.remoteDataSourceID === 159 ||
            pathState?.data?.remoteDataSourceID === 166 ||
            pathState?.data?.remoteDataSourceID === 39||
            pathState?.data?.remoteDataSourceID === 168) &&
        tmpAttrs.rightAttributes?.length
    ) {
        trigger(['foreignKey'], { shouldFocus: true });
    }
    // else if (
    //     mySqlLength &&
    //     (!foreignKey || !checkUpdate) &&
    //     !checkValid_prime_date &&
    //     pathState?.data?.remoteDataSourceID !== 45 &&
    //     pathState?.data?.remoteDataSourceID !== 28 &&
    //     pathState?.data?.remoteDataSourceID !== 40
    // ) {
    // }
    else if (!tmpAttrs.rightAttributes?.length && !getValues('primaryKey')) {
        return true;
    } else if (!mySqlLength && !tmpAttrs.rightAttributes?.length && getValues('primaryKey')) {
        reset((prev) => ({
            ...prev,
            primaryKey: '',
        }));
        return true;
        //dispatchState({ type: 'UPDATE', field: 'showAttributeError', payload: true });
    } else if (!tmpAttrs.rightAttributes?.length && !getValues('foreignKey')) {
        return true;
    } else if (!tmpAttrs.rightAttributes?.length && getValues('foreignKey')) {
        reset((prev) => ({
            ...prev,
            foreignKey: '',
        }));
        return true;
        //dispatchState({ type: 'UPDATE', field: 'showAttributeError', payload: true });
    } else {
        const data = {
            primaryKey,
            foreignKey,
            checkUpdate,
            attributes: tmpAttrs,
        };
        dispatch(mySqlUpdate({ [table.type]: { ...data, id: table.id } }));
        return true;
    }
    return false;
};

const getKeyValue = (obj) => {
    let keyVal = '';
    if (!obj.foreignKey || obj.foreignKey?.value === '') keyVal = obj.primaryKey?.value;
    else keyVal = obj.foreignKey?.value;
    return keyVal;
};

export const getSelectedTables = (mySql) => {
    return Object.entries(mySql).map(([key, res]) => {
        return {
            table: key,
            selectedKey: getKeyValue(res),
            dateType: res?.checkUpdate?.value,
            count: res?.attributes?.rightAttributes?.length || 0
        };
    });
};

export const generateRightAttributes = (mySql) => {
    const tmpMysqlm = { ...mySql };
    let allAttr = Object.values(tmpMysqlm).map((res) => {
        return res.attributes.rightAttributes.map((attr) => attr);
    });
    return allAttr.flat(Infinity);
};
export const getLeftAttributes = (mySql) => {
    const tmpMysqlm = { ...mySql };
    let allAttr = Object.values(tmpMysqlm).map((res) => {
        return res.attributes.leftAttributes.map((attr) => attr);
    });
    return allAttr.flat(Infinity);
};

export const generateLeftAttributes = (left = [], right = [], tableVal = '') => {
    const table = tableVal || left?.[0]?.table;

    const leftAttr = left.filter((item) => item?.table === table);
    const rightAttr = right.filter((item) => item?.table === table);

    return leftAttr.filter(
        (item) => !rightAttr.some((r) => r.name === item.name)
    );
};

export const parseVersiumTableLabels = (tableName = '') =>
    String(tableName)
        .split(',')
        .map((name) => name?.trim()?.replaceAll('!', ','))
        .filter(Boolean);

/** Right-side attributes to keep when column metadata is refreshed for the active table. */
export const getPreservedRightAttributes = (attributes = {}) => attributes?.rightAttributes || [];
export const getPreviewData = (mySql) => {
    return Object.entries(mySql).map(([key, res]) => {
        return {
            table: key,
            selectedKey: getKeyValue(res),
            dateType: res?.checkUpdate?.value,
            attrs: res.attributes.rightAttributes?.map(({ name }) => name)?.join(', ') || '',
        };
    });
};

export const finalPayload_mySQL = (mySql, getValues, type) => {
    const {
        data: { sourceName, remoteDataSourceID },
    } = type;
    const { ipAddress, userName, password, databaseName, portNumber, instanceName, updatedCycle, primaryKey, foreignKey } = getValues();
    const tableName = Object.entries(mySql).map(([key, res]) => {
        if (res.foreignKey) return key + '.' + getKeyValue(res);
    });
    const columname = Object.entries(mySql).map(([key, res]) => {
        return key + '.' + getKeyValue(res);
    });
    const updateDatecolumn = Object.entries(mySql).map(([key, res]) => {
        return key + '.' + getKeyValue(res) + '.' + res.checkUpdate.type;
    });
    const primaryKeyTable = Object.keys(mySql)[0];
    const primaryKeyObj = mySql[primaryKeyTable];
    const rightAtt = [];
    let columnName = Object.keys(mySql).map((ele, ind) => {
        let keys = mySql[ele];
        rightAtt.push(...keys.attributes.rightAttributes);

        return {
            tableName: ele,
            columns: keys.attributes.rightAttributes.map((e) => e.name && e.name).join(),
            primaryKey:
                ind === 0 ? (keys?.primaryKey?.value === undefined ? primaryKey?.value : keys?.primaryKey?.value) : '',
            foreignKey:
                ind === 0
                    ? ''
                    : keys?.foreignKey?.value === undefined
                    ? foreignKey?.value
                    : keys?.foreignKey?.value || '',
            relationTable: ind === 0 ? '' : Object.keys(mySql)[ind - 1],
            updateDate: keys?.checkUpdate?.value || '',
        };
    });
    return {
        username: userName,
        password: password,
        host: ipAddress,
        port: portNumber,
        dbName: databaseName,

        friendlyName: instanceName,
        listType: 5,
        sourceType: remoteDataSourceID,
        connectionType: 'open',
        dbTypeName: type?.type === 'mysql' ? 'mysql' : 'mssql', // 'mysql',
        scheduleFrequency: updatedCycle.typeId,
        columnName: columnName,
        temp: rightAtt,
    };
};
export const finalPayload_oracle = (mySql, getValues, type) => {
    const {
        ipAddress,
        userName,
        password,
        databaseName,
        portNumber,
        instanceName,
        updatedCycle,
        primaryKey,
        foreignKey,
    } = getValues();
    const {
        data: { sourceName, remoteDataSourceID },
    } = type;

    const rightAtt = [];

    let columnName = Object.keys(mySql).map((ele, ind) => {
        let keys = mySql[ele];
        rightAtt.push(...keys.attributes.rightAttributes);
        return {
            tableName: ele,
            columns: keys.attributes.rightAttributes.map((e) => e.name && e.name).join(),
            // primaryKey: ind === 0 ? keys?.primaryKey?.value : keys?.foreignKey?.value,
            // foreignKey: ind === 0 ? '' : keys?.primaryKey?.value,

            primaryKey:
                ind === 0 ? (keys?.primaryKey?.value === undefined ? primaryKey?.value : keys?.primaryKey?.value) : '',
            foreignKey:
                ind === 0
                    ? ''
                    : keys?.foreignKey?.value === undefined
                    ? foreignKey?.value
                    : keys?.foreignKey?.value || '',
            relationTable: ind === 0 ? '' : Object.keys(mySql)[ind - 1],
            updateDate: keys?.checkUpdate?.value || '',
        };
    });
    return {
        host: ipAddress,
        schema: databaseName,
        username: userName,
        password: password,
        port: portNumber,
        connectorName: sourceName,
        connectorId: remoteDataSourceID,
        serverName: '',
        databaseName: '',
        friendlyName: instanceName,
        listType: 5,
        sourceType: 2,
        scheduleFrequency: updatedCycle.typeId,
        columnName: columnName,
        temp: rightAtt,
    };
};

export const finalPayload_snowflake = (mySql, getValues, type) => {
    const {
        ipAddress,
        userName,
        password,
        databaseName,
        portNumber,
        instanceName,
        updatedCycle,
        primaryKey,
        foreignKey,
        accountName,
        schema,
    } = getValues();
    const {
        data: { sourceName, remoteDataSourceID },
    } = type;

    const rightAtt = [];

    let columnName = Object.keys(mySql).map((ele, ind) => {
        let keys = mySql[ele];
        rightAtt.push(...keys.attributes.rightAttributes);
        return {
            tableName: ele,
            columns: keys.attributes.rightAttributes.map((e) => e.name && e.name).join(),

            primaryKey:
                ind === 0 ? (keys?.primaryKey?.value === undefined ? primaryKey?.value : keys?.primaryKey?.value) : '',
            foreignKey:
                ind === 0
                    ? ''
                    : keys?.foreignKey?.value === undefined
                    ? foreignKey?.value
                    : keys?.foreignKey?.value || '',
            relationTable: ind === 0 ? '' : Object.keys(mySql)[ind - 1],
            updateDate: keys?.checkUpdate?.value || '',
        };
    });
    return {
        username: userName,
        password: password,
        account: accountName,
        database: databaseName,
        schema: schema,
        connectorName: sourceName,
        connectorId: remoteDataSourceID,
        serverName: '',
        friendlyName: instanceName,
        databaseName: '',
        listType: 5,
        sourceType: 2,
        scheduleFrequency: updatedCycle.typeId,
        columnName: columnName,
        temp: rightAtt,
    };
};
export const finalPayload_hubspot = (mySql, getValues, type, tabledata) => {
    const { instanceName, updatedCycle, accesstoken, hubid, connection } = getValues();
    const {
        data: { sourceName, remoteDataSourceID },
    } = type;

    const tableName = Object.keys(mySql);
    const rightAtt = [];
    let columnName = Object.keys(mySql).map((ele, ind) => {
        let keys = mySql[ele];
        rightAtt.push(...keys.attributes.rightAttributes);
        return {
            tableName: ele,
            columns: keys?.attributes?.rightAttributes
                ? keys.attributes.rightAttributes.map((e) => e.name || '').join()
                : '',
            primaryKey:
                ind === 0 ? (keys?.primaryKey?.value === undefined ? primaryKey?.value : keys?.primaryKey?.value) : '',
            foreignKey:
                ind === 0
                    ? ''
                    : keys?.foreignKey?.value === undefined
                    ? foreignKey?.value
                    : keys?.foreignKey?.value || '',
            relationTable: ind === 0 ? '' : Object.keys(mySql)[ind - 1],
            updateDate: keys?.checkUpdate?.value || '',
        };
    });

    return {
        hubId: hubid,
        accessToken: accesstoken,
        connectorName: sourceName,
        connectorId: remoteDataSourceID,
        scheduleFrequency: updatedCycle.typeId,
        listType: 5,
        sourceType: '2',
        friendlyName: instanceName,
        columnName: columnName,
        temp: rightAtt,
        ConnectionType: connection?.type
    };
};
export const finalPayload_salesForce = (mySql, getValues, type, tabledata) => {
    const { userName, password, instanceName, updatedCycle, securityToken } = getValues();
    const {
        data: { sourceName, remoteDataSourceID },
    } = type;

    const tableName = Object.keys(mySql);

    const rightAtt = [];
    let columnName = Object.keys(mySql).map((ele, ind) => {
        let keys = mySql[ele];
        rightAtt.push(...keys.attributes.rightAttributes);
        let finalColumns = {};
        keys.attributes.rightAttributes.forEach(
            (attribute) => (finalColumns[attribute?.columnFieldName] = attribute.name),
        );

        const primaryKeyValue =
            keys?.primaryKey?.columnFieldName && keys?.primaryKey?.value
                ? {
                      [`${keys?.primaryKey?.columnFieldName}`]: keys?.primaryKey?.value,
                  }
                : '';
        const foreignKeyValue =
            keys?.foreignKey?.columnFieldName && keys?.foreignKey?.value
                ? {
                      [`${keys?.foreignKey?.columnFieldName}`]: keys?.foreignKey?.value,
                  }
                : '';
        return {
            tableName: ele,
            columns: finalColumns,
            primaryKey: foreignKeyValue ? '' : primaryKeyValue || '',
            foreignKey:  foreignKeyValue || '',
            relationTable: ind === 0 ? '' : Object.keys(mySql)[ind - 1],
            updateDate: keys?.checkUpdate?.value || '',
        };
    });

    // "username":"k.pragadeesh@resulticksmail.com",
    // "password":"Welcome@123",
    // "securityToken":"NlpTm6wyS9d9P3xUwlK05TqUu",
    // "connectorName":"SalesForce",
    // "connectorId":5,
    // "serverName":"34.23.252.1",
    // "databaseName":"cust_cac046a5_5950_45c6_9a0d_da88713a537c",
    // "scheduleFrequency":"5",
    // "departmentId":1,
    // "listType":5,
    // "sourceType":"2",
    // "friendlyName":"testing",

    return {
        username: userName,
        password: password,
        securityToken: securityToken,
        connectorName: sourceName,
        connectorId: remoteDataSourceID,
        serverName: '',
        databaseName: '',
        friendlyName: instanceName,
        listType: 5,
        sourceType: '2',
        scheduleFrequency: updatedCycle.typeId,
        columnName: columnName,
        temp: rightAtt,
    };
};
export const finalPayload_shopify = (mySql, getValues, type, tabledata) => {
    const {
        resource, //apikey
        instanceName,
        shopName,
        updatedCycle,
        accesstoken,
    } = getValues();
    const {
        data: { sourceName, remoteDataSourceID },
    } = type;

    const tableName = Object.keys(mySql);
    const rightAtt = [];

    let columnName = Object.keys(mySql).map((ele, ind) => {
        let keys = mySql[ele];
        rightAtt.push(...keys.attributes.rightAttributes);
        return {
            tableName: ele,
            columns: keys?.attributes?.rightAttributes
                ? keys.attributes.rightAttributes.map((e) => e.name || '').join()
                : '',
            primaryKey:
                ind === 0 ? (keys?.primaryKey?.value === undefined ? primaryKey?.value : keys?.primaryKey?.value) : '',
            foreignKey:
                ind === 0
                    ? ''
                    : keys?.foreignKey?.value === undefined
                    ? foreignKey?.value
                    : keys?.foreignKey?.value || '',
            relationTable: ind === 0 ? '' : Object.keys(mySql)[ind - 1],
            updateDate: keys?.checkUpdate?.value || '',
        };
    });

    // "apiKey":"e6c991f08d6eb5e630bca9fe1598e7e8",
    // "accessToken":"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",
    // "shopName":"quickstart-1c585dd4.myshopify.com",
    // "connectorId":22,
    // "connectorName":"Shopify",
    // "serverName":"34.23.252.1",
    // "databaseName":"cust_cac046a5_5950_45c6_9a0d_da88713a537c",
    // "scheduleFrequency":"5",
    // "departmentId":1,
    // "listType":5,
    // "sourceType":"2",
    // "friendlyName":"test"

    return {
        apiKey: resource,
        accessToken: accesstoken,
        shopName: shopName,
        connectorId: remoteDataSourceID,
        connectorName: sourceName,
        serverName: '',
        databaseName: '',
        friendlyName: instanceName,
        listType: 5,
        sourceType: '2',
        scheduleFrequency: updatedCycle.typeId,
        columnName: columnName,
        temp: rightAtt,
    };
};
export const finalPayload_pipeDrive = (mySql, getValues, type, tabledata) => {
    const {
        resource, //apikey
        instanceName,
        updatedCycle,
    } = getValues();
    const {
        data: { sourceName, remoteDataSourceID },
    } = type;

    const tableName = Object.keys(mySql);
    const rightAtt = [];

    let columnName = Object.keys(mySql).map((ele, ind) => {
        let keys = mySql[ele];
        rightAtt.push(...keys.attributes.rightAttributes);
        return {
            tableName: ele,
            columns: keys?.attributes?.rightAttributes
                ? keys.attributes.rightAttributes.map((e) => e.name || '').join()
                : '',
            primaryKey:
                ind === 0 ? (keys?.primaryKey?.value === undefined ? primaryKey?.value : keys?.primaryKey?.value) : '',
            foreignKey:
                ind === 0
                    ? ''
                    : keys?.foreignKey?.value === undefined
                    ? foreignKey?.value
                    : keys?.foreignKey?.value || '',
            relationTable: ind === 0 ? '' : Object.keys(mySql)[ind - 1],
            updateDate: keys?.checkUpdate?.value || '',
        };
    });

    return {
        apiToken: resource,
        connectorId: remoteDataSourceID,
        connectorName: sourceName,
        friendlyName: instanceName,
        listType: 5,
        sourceType: '2',
        scheduleFrequency: updatedCycle.typeId,
        columnName: columnName,
        temp: rightAtt,
    };
};

export const finalPayload_cassandra = (mySql, getValues, type, tabledata) => {
    const {
        resource, //apikey
        instanceName,
        updatedCycle,
        accesstoken,
        ipAddress,
        portNumber,
        databaseName,
        userName,
        password,
    } = getValues();
    const {
        data: { sourceName, remoteDataSourceID },
    } = type;

    const tableName = Object.keys(mySql);
    const rightAtt = [];
    let columnName = Object.keys(mySql).map((ele, ind) => {
        let keys = mySql[ele];
        rightAtt.push(...keys.attributes.rightAttributes);
        return {
            tableName: ele,
            columns: keys?.attributes?.rightAttributes
                ? keys.attributes.rightAttributes.map((e) => e.name || '').join()
                : '',
            primaryKey:
                ind === 0 ? (keys?.primaryKey?.value === undefined ? primaryKey?.value : keys?.primaryKey?.value) : '',
            foreignKey:
                ind === 0
                    ? ''
                    : keys?.foreignKey?.value === undefined
                    ? foreignKey?.value
                    : keys?.foreignKey?.value || '',
            relationTable: ind === 0 ? '' : Object.keys(mySql)[ind - 1],
            updateDate: keys?.checkUpdate?.value || '',
        };
    });

    return {
        username: userName,
        password: password,
        server: ipAddress,
        port: portNumber,
        keyspaces: databaseName,
        connectorId: remoteDataSourceID,
        connectorName: sourceName,
        friendlyName: instanceName,
        listType: 5,
        sourceType: '2',
        scheduleFrequency: updatedCycle.typeId,
        columnName: columnName,
        temp: rightAtt,
    };
};
export const finalPayload_aeroSpike = (mySql, getValues, type, tabledata) => {
    const {
        resource, //apikey
        instanceName,
        updatedCycle,
        accesstoken,
        ipAddress,
        portNumber,
        databaseName,
        userName,
        password,
    } = getValues();
    const {
        data: { sourceName, remoteDataSourceID },
    } = type;

    const tableName = Object.keys(mySql);
    const rightAtt = [];
    let columnName = Object.keys(mySql).map((ele, ind) => {
        let keys = mySql[ele];
        rightAtt.push(...keys.attributes.rightAttributes);
        return {
            tableName: ele,
            columns: keys?.attributes?.rightAttributes
                ? keys.attributes.rightAttributes.map((e) => e.name || '').join()
                : '',
            primaryKey:
                ind === 0 ? (keys?.primaryKey?.value === undefined ? primaryKey?.value : keys?.primaryKey?.value) : '',
            foreignKey:
                ind === 0
                    ? ''
                    : keys?.foreignKey?.value === undefined
                    ? foreignKey?.value
                    : keys?.foreignKey?.value || '',
            relationTable: ind === 0 ? '' : Object.keys(mySql)[ind - 1],
            updateDate: keys?.checkUpdate?.value || '',
        };
    });

    return {
        username: userName,
        password: password,
        host: ipAddress,
        port: portNumber,
        namespace: databaseName,
        connectorId: remoteDataSourceID,
        connectorName: sourceName,
        friendlyName: instanceName,
        listType: 5,
        sourceType: '2',
        scheduleFrequency: updatedCycle.typeId,
        columnName: columnName,
        temp: rightAtt,
    };
};
export const finalPayload_mongodb = (mySql, getValues, type, tabledata) => {
    const {
        resource, //apikey
        instanceName,
        updatedCycle,
        accesstoken,
        ipAddress,
        portNumber,
        databaseName,
        userName,
        password,
    } = getValues();
    const {
        data: { sourceName, remoteDataSourceID },
    } = type;

    const rightAtt = [];
    let columnName = Object.keys(mySql).map((ele, ind) => {
        let keys = mySql[ele];
        rightAtt.push(...keys.attributes.rightAttributes);
        return {
            tableName: ele,
            columns: keys?.attributes?.rightAttributes
                ? keys.attributes.rightAttributes.map((e) => e.name || '').join()
                : '',
            primaryKey:
                ind === 0 ? (keys?.primaryKey?.value === undefined ? primaryKey?.value : keys?.primaryKey?.value) : '',
            foreignKey:
                ind === 0
                    ? ''
                    : keys?.foreignKey?.value === undefined
                    ? foreignKey?.value
                    : keys?.foreignKey?.value || '',
            relationTable: ind === 0 ? '' : Object.keys(mySql)[ind - 1],
            updateDate: keys?.checkUpdate?.value || '',
        };
    });

    return {
        username: userName,
        password: password,
        server: ipAddress,
        port: portNumber,
        database: databaseName,
        connectorId: remoteDataSourceID,
        connectorName: sourceName,
        friendlyName: instanceName,
        listType: 5,
        sourceType: '2',
        scheduleFrequency: updatedCycle.typeId,
        columnName: columnName,
        temp: rightAtt,
    };
};
export const finalPayload_storehippo = (mySql, getValues, type, tabledata) => {
    const { instanceName, updatedCycle, shopName, accesstoken } = getValues();
    const {
        data: { sourceName, remoteDataSourceID },
    } = type;

    const rightAtt = [];
    let columnName = Object.keys(mySql).map((ele, ind) => {
        let keys = mySql[ele];
        rightAtt.push(...keys.attributes.rightAttributes);
        return {
            tableName: ele,
            columns: keys?.attributes?.rightAttributes
                ? keys.attributes.rightAttributes.map((e) => e.name || '').join()
                : '',
            primaryKey:
                ind === 0 ? (keys?.primaryKey?.value === undefined ? primaryKey?.value : keys?.primaryKey?.value) : '',
            foreignKey:
                ind === 0
                    ? ''
                    : keys?.foreignKey?.value === undefined
                    ? foreignKey?.value
                    : keys?.foreignKey?.value || '',
            relationTable: ind === 0 ? '' : Object.keys(mySql)[ind - 1],
            updateDate: keys?.checkUpdate?.value || '',
        };
    });

    return {
        shopName: shopName,
        accessKey: accesstoken,
        connectorId: remoteDataSourceID,
        connectorName: sourceName,
        listType: 5,
        sourceType: '2',
        scheduleFrequency: updatedCycle.typeId,
        columnName: columnName,
        friendlyName: instanceName,
        temp: rightAtt,
    };
};
export const finalPayload_postgresql = (mySql, getValues, type, tabledata) => {
    const { instanceName, userName, password, updatedCycle, ipAddress, schema, databaseName, portNumber } = getValues();
    const {
        data: { sourceName, remoteDataSourceID },
    } = type;

    const tableName = Object.keys(mySql);
    const rightAtt = [];

    let columnName = Object.keys(mySql).map((ele, ind) => {
        let keys = mySql[ele];
        rightAtt.push(...keys.attributes.rightAttributes);
        return {
            tableName: ele,
            columns: keys?.attributes?.rightAttributes
                ? keys.attributes.rightAttributes.map((e) => e.name || '').join()
                : '',
            primaryKey:
                ind === 0 ? (keys?.primaryKey?.value === undefined ? primaryKey?.value : keys?.primaryKey?.value) : '',
            foreignKey:
                ind === 0
                    ? ''
                    : keys?.foreignKey?.value === undefined
                    ? foreignKey?.value
                    : keys?.foreignKey?.value || '',
            relationTable: ind === 0 ? '' : Object.keys(mySql)[ind - 1],
            updateDate: keys?.checkUpdate?.value || '',
        };
    });

    return {
        username: userName,
        password: password,
        host: ipAddress,
        schema: schema,
        database: databaseName,
        port: portNumber,
        connectorId: remoteDataSourceID,
        connectorName: sourceName,
        listType: 5,
        sourceType: '2',
        scheduleFrequency: updatedCycle.typeId,
        columnName: columnName,
        friendlyName: instanceName,
        temp: rightAtt,
    };
};
export const finalPayload_dataBricks = (mySql, getValues, type, tabledata) => {
    const { instanceName, resource, httpPath, updatedCycle, accesstoken, schema, databaseName, portNumber } =
        getValues();
    const {
        data: { sourceName, remoteDataSourceID },
    } = type;

    const tableName = Object.keys(mySql);
    const rightAtt = [];

    let columnName = Object.keys(mySql).map((ele, ind) => {
        let keys = mySql[ele];
        rightAtt.push(...keys.attributes.rightAttributes);
        return {
            tableName: ele,
            columns: keys?.attributes?.rightAttributes
                ? keys.attributes.rightAttributes.map((e) => e.name || '').join()
                : '',
            primaryKey:
                ind === 0 ? (keys?.primaryKey?.value === undefined ? primaryKey?.value : keys?.primaryKey?.value) : '',
            foreignKey:
                ind === 0
                    ? ''
                    : keys?.foreignKey?.value === undefined
                    ? foreignKey?.value
                    : keys?.foreignKey?.value || '',
            relationTable: ind === 0 ? '' : Object.keys(mySql)[ind - 1],
            updateDate: keys?.checkUpdate?.value || '',
        };
    });

    return {
        host: resource,
        httpPath: httpPath,
        accessToken: accesstoken,
        database: databaseName,
        schema: schema,
        connectorId: remoteDataSourceID,
        connectorName: sourceName,
        listType: 5,
        sourceType: '2',
        scheduleFrequency: updatedCycle.typeId,
        columnName: columnName,
        friendlyName: instanceName,
        temp: rightAtt,
    };
};
export const finalPayload_eventbrite = (mySql, getValues, type, tabledata) => {
    const { instanceName, userName, password, updatedCycle, ipAddress, schema, databaseName, portNumber, accesstoken } =
        getValues();
    const {
        data: { sourceName, remoteDataSourceID },
    } = type;

    const tableName = Object.keys(mySql);
    const rightAtt = [];
    let columnName = Object.keys(mySql).map((ele, ind) => {
        let keys = mySql[ele];
        rightAtt.push(...keys.attributes.rightAttributes);
        return {
            tableName: ele,
            columns: keys?.attributes?.rightAttributes
                ? keys.attributes.rightAttributes.map((e) => e.name || '').join()
                : '',
            primaryKey:
                ind === 0 ? (keys?.primaryKey?.value === undefined ? primaryKey?.value : keys?.primaryKey?.value) : '',
            foreignKey:
                ind === 0
                    ? ''
                    : keys?.foreignKey?.value === undefined
                    ? foreignKey?.value
                    : keys?.foreignKey?.value || '',
            relationTable: ind === 0 ? '' : Object.keys(mySql)[ind - 1],
            updateDate: keys?.checkUpdate?.value || '',
        };
    });

    return {
        authToken: accesstoken,
        connectorId: remoteDataSourceID,
        connectorName: sourceName,
        listType: 5,
        sourceType: '2',
        scheduleFrequency: updatedCycle.typeId,
        columnName: columnName,
        friendlyName: instanceName,
        temp: rightAtt,
    };
};

export const finalPayload_bigCommerce = (mySql, getValues, type, tabledata) => {
    const {
        instanceName,
        userName,
        password,
        updatedCycle,
        ipAddress,
        schema,
        databaseName,
        portNumber,
        accesstoken,
        storehash,
        shopName,
    } = getValues();
    const {
        data: { sourceName, remoteDataSourceID },
    } = type;

    const tableName = Object.keys(mySql);

    const rightAtt = [];
    let columnName = Object.keys(mySql).map((ele, ind) => {
        let keys = mySql[ele];
        rightAtt.push(...keys.attributes.rightAttributes);
        return {
            tableName: ele,
            columns: keys.attributes.rightAttributes.map((e) => e.name && e.name).join(),
            primaryKey:
                ind === 0 ? (keys?.primaryKey?.value === undefined ? primaryKey?.value : keys?.primaryKey?.value) : '',
            foreignKey:
                ind === 0
                    ? ''
                    : keys?.foreignKey?.value === undefined
                    ? foreignKey?.value
                    : keys?.foreignKey?.value || '',
            relationTable: ind === 0 ? '' : Object.keys(mySql)[ind - 1],
            updateDate: keys?.checkUpdate?.value || '',
        };
    });

    return {
        accessToken: accesstoken,
        storeHash: storehash,
        shopName: shopName,
        connectorId: remoteDataSourceID,
        connectorName: sourceName,
        listType: 5,
        sourceType: '2',
        scheduleFrequency: updatedCycle.typeId,
        columnName: columnName,
        friendlyName: instanceName,
        temp: rightAtt,
    };
};
export const finalPayload_prestashop = (mySql, getValues, type, tabledata) => {
    const {
        instanceName,
        userName,
        password,
        updatedCycle,
        ipAddress,
        schema,
        databaseName,
        portNumber,
        accesstoken,
        storehash,
        shopName,
        resource,
    } = getValues();
    const {
        data: { sourceName, remoteDataSourceID },
    } = type;

    const tableName = Object.keys(mySql);

    const rightAtt = [];
    let columnName = Object.keys(mySql).map((ele, ind) => {
        let keys = mySql[ele];
        rightAtt.push(...keys.attributes.rightAttributes);
        return {
            tableName: ele,
            columns: keys.attributes.rightAttributes.map((e) => e.name && e.name).join(),
            primaryKey:
                ind === 0 ? (keys?.primaryKey?.value === undefined ? primaryKey?.value : keys?.primaryKey?.value) : '',
            foreignKey:
                ind === 0
                    ? ''
                    : keys?.foreignKey?.value === undefined
                    ? foreignKey?.value
                    : keys?.foreignKey?.value || '',
            relationTable: ind === 0 ? '' : Object.keys(mySql)[ind - 1],
            updateDate: keys?.checkUpdate?.value || '',
        };
    });

    return {
        prestashopUrl: shopName,
        apiKey: resource,
        connectorId: remoteDataSourceID,
        connectorName: sourceName,
        listType: 5,
        sourceType: '2',
        scheduleFrequency: updatedCycle.typeId,
        columnName: columnName,
        friendlyName: instanceName,
        temp: rightAtt,
    };
};

export const finalPayload_blackBaud = (mySql, getValues, type, tabledata) => {
    const {
        instanceName,
        userName,
        password,
        updatedCycle,
        ipAddress,
        schema,
        databaseName,
        portNumber,
        accesstoken,
        storehash,
        shopName,
        resource,
    } = getValues();
    const {
        data: { sourceName, remoteDataSourceID, remoteSettingId },
    } = type;

    const tableName = Object.keys(mySql);

    const rightAtt = [];
    let columnName = Object.keys(mySql).map((ele, ind) => {
        let keys = mySql[ele];
        rightAtt.push(...keys.attributes.rightAttributes);
        return {
            tableName: ele,
            columns: keys.attributes.rightAttributes.map((e) => e.name && e.name).join(),
            primaryKey:
                ind === 0 ? (keys?.primaryKey?.value === undefined ? primaryKey?.value : keys?.primaryKey?.value) : '',
            foreignKey:
                ind === 0
                    ? ''
                    : keys?.foreignKey?.value === undefined
                    ? foreignKey?.value
                    : keys?.foreignKey?.value || '',
            relationTable: ind === 0 ? '' : Object.keys(mySql)[ind - 1],
            updateDate: keys?.checkUpdate?.value || '',
        };
    });

    return {
        connectorId: remoteDataSourceID,
        connectorName: sourceName,
        remoteSettingId: remoteSettingId,
        listType: 5,
        sourceType: '2',
        scheduleFrequency: updatedCycle.typeId,
        columnName: columnName,
        friendlyName: instanceName,
        temp: rightAtt,
    };
};
export const finalPayload_magento = (mySql, getValues, type, tabledata) => {
    const { instanceName, userName, password, updatedCycle, accesstoken, resource } = getValues();
    const {
        data: { sourceName, remoteDataSourceID },
    } = type;

    const tableName = Object.keys(mySql);

    const rightAtt = [];
    let columnName = Object.keys(mySql).map((ele, ind) => {
        let keys = mySql[ele];
        rightAtt.push(...keys.attributes.rightAttributes);
        return {
            tableName: ele,
            columns: keys.attributes.rightAttributes.map((e) => e.name && e.name).join(),
            primaryKey:
                ind === 0 ? (keys?.primaryKey?.value === undefined ? primaryKey?.value : keys?.primaryKey?.value) : '',
            foreignKey:
                ind === 0
                    ? ''
                    : keys?.foreignKey?.value === undefined
                    ? foreignKey?.value
                    : keys?.foreignKey?.value || '',
            relationTable: ind === 0 ? '' : Object.keys(mySql)[ind - 1],
            updateDate: keys?.checkUpdate?.value || '',
        };
    });

    return {
        username: userName,
        password: password,
        magentoUrl: resource,
        accessToken: accesstoken,
        connectorId: remoteDataSourceID,
        connectorName: sourceName,
        listType: 5,
        sourceType: '2',
        scheduleFrequency: updatedCycle.typeId,
        columnName: columnName,
        friendlyName: instanceName,
        temp: rightAtt,
    };
};

export const finalPayload_leadSquare = (mySql, getValues, type, tabledata) => {
    const { instanceName, apiHost, accessKey, userName, updatedCycle, secretKey } = getValues();
    const {
        data: { sourceName, remoteDataSourceID },
    } = type;

    const tableName = Object.keys(mySql);

    const rightAtt = [];
    let columnName = Object.keys(mySql).map((ele, ind) => {
        let keys = mySql[ele];
        rightAtt.push(...keys.attributes.rightAttributes);
        return {
            tableName: ele,
            columns: keys.attributes.rightAttributes.map((e) => e.name && e.name).join(),
            primaryKey:
                ind === 0 ? (keys?.primaryKey?.value === undefined ? primaryKey?.value : keys?.primaryKey?.value) : '',
            foreignKey:
                ind === 0
                    ? ''
                    : keys?.foreignKey?.value === undefined
                    ? foreignKey?.value
                    : keys?.foreignKey?.value || '',
            relationTable: ind === 0 ? '' : Object.keys(mySql)[ind - 1],
            updateDate: keys?.checkUpdate?.value || '',
        };
    });

    return {
        apiHost: apiHost,
        accessKey: accessKey,
        secretKey: secretKey,
        connectorId: remoteDataSourceID,
        connectorName: sourceName,
        listType: 5,
        sourceType: '2',
        scheduleFrequency: updatedCycle.typeId,
        columnName: columnName,
        friendlyName: instanceName,
        temp: rightAtt,
    };
};
export const finalPayload_cNl = (mySql, getValues, type, tabledata) => {
    const { instanceName, accesstoken, userName, updatedCycle } = getValues();
    const {
        data: { sourceName, remoteDataSourceID },
    } = type;

    const tableName = Object.keys(mySql);

    const rightAtt = [];
    let columnName = Object.keys(mySql).map((ele, ind) => {
        let keys = mySql[ele];
        rightAtt.push(...keys.attributes.rightAttributes);
        return {
            tableName: ele,
            columns: keys.attributes.rightAttributes.map((e) => e.name && e.name).join(),
            primaryKey:
                ind === 0 ? (keys?.primaryKey?.value === undefined ? primaryKey?.value : keys?.primaryKey?.value) : '',
            foreignKey:
                ind === 0
                    ? ''
                    : keys?.foreignKey?.value === undefined
                    ? foreignKey?.value
                    : keys?.foreignKey?.value || '',
            relationTable: ind === 0 ? '' : Object.keys(mySql)[ind - 1],
            updateDate: keys?.checkUpdate?.value || '',
        };
    });

    return {
        apiKey: accesstoken,
        connectorId: remoteDataSourceID,
        connectorName: sourceName,
        listType: 5,
        sourceType: '2',
        scheduleFrequency: updatedCycle.typeId,
        columnName: columnName,
        friendlyName: instanceName,
        temp: rightAtt,
    };
};
export const finalPayload_wooCommerce = (mySql, getValues, type, tabledata) => {
    const { instanceName, apiHost, accessKey, userName, updatedCycle, secretKey } = getValues();
    const {
        data: { sourceName, remoteDataSourceID },
    } = type;

    const tableName = Object.keys(mySql);

    const rightAtt = [];
    let columnName = Object.keys(mySql).map((ele, ind) => {
        let keys = mySql[ele];
        rightAtt.push(...keys.attributes.rightAttributes);
        return {
            tableName: ele,
            columns: keys.attributes.rightAttributes.map((e) => e.name && e.name).join(),
            primaryKey:
                ind === 0 ? (keys?.primaryKey?.value === undefined ? primaryKey?.value : keys?.primaryKey?.value) : '',
            foreignKey:
                ind === 0
                    ? ''
                    : keys?.foreignKey?.value === undefined
                    ? foreignKey?.value
                    : keys?.foreignKey?.value || '',
            relationTable: ind === 0 ? '' : Object.keys(mySql)[ind - 1],
            updateDate: keys?.checkUpdate?.value || '',
        };
    });

    return {
        domainUrl: apiHost,
        consumerKey: accessKey,
        consumerSecret: secretKey,
        connectorId: remoteDataSourceID,
        connectorName: sourceName,
        listType: 5,
        sourceType: '2',
        scheduleFrequency: updatedCycle.typeId,
        columnName: columnName,
        friendlyName: instanceName,
        temp: rightAtt,
    };
};

export const finalPayload_wix = (mySql, getValues, type, tabledata) => {
    const { instanceName, apiHost, authId, siteId, updatedCycle, secretKey } = getValues();
    const {
        data: { sourceName, remoteDataSourceID },
    } = type;

    const tableName = Object.keys(mySql);

    const rightAtt = [];
    let columnName = Object.keys(mySql).map((ele, ind) => {
        let keys = mySql[ele];
        rightAtt.push(...keys.attributes.rightAttributes);
        return {
            tableName: ele,
            columns: keys.attributes.rightAttributes.map((e) => e.name && e.name).join(),
            primaryKey:
                ind === 0 ? (keys?.primaryKey?.value === undefined ? primaryKey?.value : keys?.primaryKey?.value) : '',
            foreignKey:
                ind === 0
                    ? ''
                    : keys?.foreignKey?.value === undefined
                    ? foreignKey?.value
                    : keys?.foreignKey?.value || '',
            relationTable: ind === 0 ? '' : Object.keys(mySql)[ind - 1],
            updateDate: keys?.checkUpdate?.value || '',
        };
    });

    return {
        authId: authId,
        siteId: siteId,
        connectorId: remoteDataSourceID,
        connectorName: sourceName,
        listType: 5,
        sourceType: '2',
        scheduleFrequency: updatedCycle.typeId,
        columnName: columnName,
        friendlyName: instanceName,
        temp: rightAtt,
    };
};

export const finalPayload_Versium = (mySql, getValues, type) => {
    const { ipAddress, userName, password, databaseName, portNumber, instanceName, api, updatedCycle, resource, credentials } =
        getValues();
    const tableName = Object.keys(mySql).map((key) => key.replaceAll(',', '!'));
    let columnName = Object.keys(mySql).map((ele, ind) => {
        let keys = mySql[ele];
        return {
            tableName: ele,
            columns: keys.attributes.rightAttributes.map((e) => e?.id + '|' + e?.name + '|' + e?.fieldName).join(),
        };
    });

    return {
        userName: userName,
        password: password,
        url: resource,
        connectorId: type?.data.remoteDataSourceID,
        connectorName: type?.data.sourceName,
        tableName: tableName.toString(),
        columnName: columnName,
        // mySQLData: JSON.stringify(mySql),
        mySQLData: mySql,
        partnerConfigId: credentials?.PartnerConfigId || 0
    };
};
export const finalPayload_VersiumUpload = (mySql, getValues, type, tableDropDown) => {
    const {
        ipAddress,
        userName,
        password,
        databaseName,
        portNumber,
        instanceName,
        api,
        updatedCycle,
        resource,
        versium_volume,
        checkUpdate,
        credentials
    } = getValues();
    const tableName = Object.keys(mySql);
    let columnName = Object.keys(mySql).map((ele, ind) => {
        let keys = mySql[ele];
        return {
            tableName: ele,
            columns: keys.attributes.rightAttributes.map((e) => e?.id + '|' + e?.name + '|' + e?.fieldName).join(),
        };
    });

    return {
        userName: userName,
        password: password,
        url: resource,
        connectorId: type?.data.remoteDataSourceID,
        connectorName: type?.data.sourceName,
        partnerConfigId: credentials?.PartnerConfigId || 0,
        tableName: tableName.toString(),
        columnName: columnName,
        remotesettingID: type?.id?.remoteSettingId,
        rowLimit: versium_volume,
        recency: updatedCycle?.id,
        tempPremoteSettingId: 0, //have to change
        finalAudienceCount:
            tableDropDown.filterCount +
            '||' +
            JSON.stringify(
                tableDropDown.filterAttributes?.map((e, ind) => {
                    return {
                        id: ind,
                        name: e?.pVAttributeValue,
                        value: e?.pVAttributeValue,
                    };
                }),
            ),
        filterRuleJson: {},
        // mySQLData: JSON.stringify(mySql),
        mySQLData: mySql,
        fieldsUpdatedBy:
            checkUpdate?.partnerDataAttributeID + '|' + checkUpdate?.uIPrintableName + '|' + checkUpdate?.sOLRFieldName,
    };
};
export const finalPayload_Digipop = (mySql, getValues, type, tableDropDown) => {
    const {
        ipAddress,
        userName,
        password,
        databaseName,
        portNumber,
        instanceName,
        api,
        updatedCycle,
        resource,
        versium_volume,
        checkUpdate,
    } = getValues();
    const tableName = Object.keys(mySql);
    let columnName = Object.keys(mySql).map((ele, ind) => {
        let keys = mySql[ele];
        return {
            tableName: ele,
            columns: keys.attributes.rightAttributes.map((e) => e?.id + '|' + e?.name + '|' + e?.fieldName).join(),
        };
    });
    return {
        userName: userName, //userName,
        password: btoa(password),
        url: "https://marketinghub.digipop.ai/v1", //resource,
        connectorId: type?.data.remoteDataSourceID,
        connectorName: type?.data.sourceName,
        tableName: tableName.toString(),
        columnName: columnName,
        remotesettingID: type?.id?.remoteSettingId,
        rowLimit: versium_volume,
        recency: updatedCycle?.id,
        tempPremoteSettingId: 0, //have to change
        finalAudienceCount:
            tableDropDown.baseCount,
        filterRuleJson: {},
        // mySQLData: JSON.stringify(mySql),
        mySQLData: mySql,
        fieldsUpdatedBy: "659|Last Updated Date|d_lastupdateddate_dt"
           
    };
};
export const finalPayload_DyCRM = (mySql, getValues, type) => {
    const {
        ipAddress,
        userName,
        password,
        databaseName,
        portNumber,
        instanceName,
        api,
        updatedCycle,
        tenantDomain,
        clientDomain,
        clientSecret,
        resource,
        foreignKey,
        primaryKey,
    } = getValues();
    const tableName = Object.keys(mySql);
    const rightAtt = [];
    let columnName = Object.keys(mySql).map((ele, ind) => {
        let keys = mySql[ele];
        rightAtt.push(...keys.attributes.rightAttributes);
        let finalColumns = {};
        keys.attributes.rightAttributes.forEach(
            (attribute) => (finalColumns[attribute?.columnFieldName] = attribute.name),
        );

        const primaryKeyValue =
            keys?.primaryKey?.columnFieldName && keys?.primaryKey?.value
                ? {
                      [`${keys?.primaryKey?.columnFieldName}`]: keys?.primaryKey?.value,
                  }
                : '';
        const foreignKeyValue =
            keys?.foreignKey?.columnFieldName && keys?.foreignKey?.value
                ? {
                      [`${keys?.foreignKey?.columnFieldName}`]: keys?.foreignKey?.value,
                  }
                : '';
        return {
            tableName: ele,
            columns: finalColumns,
            primaryKey: foreignKeyValue ? '' : primaryKeyValue || '',
            foreignKey:  foreignKeyValue || '',
            relationTable: ind === 0 ? '' : Object.keys(mySql)[ind - 1],
            updateDate: keys?.checkUpdate?.value || '',
        };
    });
    // console.log('columnName: ', columnName);
    return {
        tenantDomain,
        clientDomain,
        clientSecret,
        resource,
        connectorName: type?.data.sourceName,
        friendlyName: instanceName,
        listType: 5,
        sourceType: '2',
        connectorId: type?.data.remoteDataSourceID,
        scheduleFrequency: updatedCycle.typeId,
        columnName: columnName,
        tableName: tableName.toString(),
        temp: rightAtt,
    };
};
export const finalPayload_googleBigQuery = (mySql, getValues, type, tabledata) => {
    const { instanceName, apiHost, authId, siteId, updatedCycle, secretKey, projectInfo, datasetInfo, projectName } =
        getValues();

    const {
        data: { sourceName, remoteDataSourceID },
    } = type;

    const tableName = Object.keys(mySql);

    const rightAtt = [];
    let columnName = Object.keys(mySql).map((ele, ind) => {
        let keys = mySql[ele];
        rightAtt.push(...keys.attributes.rightAttributes);
        return {
            tableName: ele,
            columns: keys.attributes.rightAttributes.map((e) => e.name && e.name).join(),
            primaryKey:
                ind === 0 ? (keys?.primaryKey?.value === undefined ? primaryKey?.value : keys?.primaryKey?.value) : '',
            foreignKey:
                ind === 0
                    ? ''
                    : keys?.foreignKey?.value === undefined
                    ? foreignKey?.value
                    : keys?.foreignKey?.value || '',
            relationTable: ind === 0 ? '' : Object.keys(mySql)[ind - 1],
            updateDate: keys?.checkUpdate?.value || '',
        };
    });

    return {
        projectInfo: projectInfo,
        datasetInfo: datasetInfo,
        projectName: projectName,
        connectorId: remoteDataSourceID,
        connectorName: sourceName,
        columnName: columnName,
        listType: 5,
        scheduleFrequency: updatedCycle?.typeId,
        sourceType: '2',
        friendlyName: instanceName,
        temp: rightAtt,
    };
};
export const finalPayload_Insightly = (mySql, getValues, type, tabledata) => {
    const { resource, updatedCycle, instanceName } = getValues();

    const {
        data: { sourceName, remoteDataSourceID },
    } = type;

    const tableName = Object.keys(mySql);

    const rightAtt = [];
    let columnName = Object.keys(mySql).map((ele, ind) => {
        let keys = mySql[ele];
        rightAtt.push(...keys.attributes.rightAttributes);
        return {
            tableName: ele,
            columns: keys.attributes.rightAttributes.map((e) => e.name && e.name).join(),
            primaryKey:
                ind === 0 ? (keys?.primaryKey?.value === undefined ? primaryKey?.value : keys?.primaryKey?.value) : '',
            foreignKey:
                ind === 0
                    ? ''
                    : keys?.foreignKey?.value === undefined
                    ? foreignKey?.value
                    : keys?.foreignKey?.value || '',
            relationTable: ind === 0 ? '' : Object.keys(mySql)[ind - 1],
            updateDate: keys?.checkUpdate?.value || '',
        };
    });

    return {
        apiKey: resource,
        connectorId: remoteDataSourceID,
        connectorName: sourceName,
        columnName: columnName,
        listType: 5,
        scheduleFrequency: updatedCycle?.typeId,
        sourceType: '2',
        friendlyName: instanceName,
        temp: rightAtt,
    };
};
export const finalPayload_Webinar = (mySql, getValues, type, tabledata) => {
    const { resource, updatedCycle, instanceName, webinar } = getValues();

    const {
        data: { sourceName, remoteDataSourceID, remoteSettingId, schemaName },
    } = type;

    const tableName = Object.keys(mySql);

    const rightAtt = [];
    let columnName = Object.keys(mySql).map((ele, ind) => {
        let keys = mySql[ele];
        rightAtt.push(...keys.attributes.rightAttributes);
        return {
            tableName: ele,
            columns: keys.attributes.rightAttributes.map((e) => e.name && e.name).join(),
            primaryKey:
                ind === 0 ? (keys?.primaryKey?.value === undefined ? primaryKey?.value : keys?.primaryKey?.value) : '',
            foreignKey:
                ind === 0
                    ? ''
                    : keys?.foreignKey?.value === undefined
                    ? foreignKey?.value
                    : keys?.foreignKey?.value || '',
            relationTable: ind === 0 ? '' : Object.keys(mySql)[ind - 1],
            updateDate: keys?.checkUpdate?.value || '',
        };
    });

    return {
        connectorId: remoteDataSourceID,
        connectorName: sourceName,
        remoteSettingId: remoteSettingId,
        webinar: webinar.name,
        listType: 5,
        scheduleFrequency: updatedCycle?.typeId,
        sourceType: '2',
        friendlyName: instanceName,
        columnName: columnName,
        temp: rightAtt,
    };
};
export const finalPayload_Webex = (mySql, getValues, type, tabledata) => {
    const { resource, updatedCycle, instanceName, webex } = getValues();

    const {
        data: { sourceName, remoteDataSourceID, remoteSettingId, schemaName },
    } = type;

    const tableName = Object.keys(mySql);

    const rightAtt = [];
    let columnName = Object.keys(mySql).map((ele, ind) => {
        let keys = mySql[ele];
        rightAtt.push(...keys.attributes.rightAttributes);
        return {
            tableName: ele,
            columns: keys.attributes.rightAttributes.map((e) => e.name && e.name).join(),
            primaryKey:
                ind === 0 ? (keys?.primaryKey?.value === undefined ? primaryKey?.value : keys?.primaryKey?.value) : '',
            foreignKey:
                ind === 0
                    ? ''
                    : keys?.foreignKey?.value === undefined
                    ? foreignKey?.value
                    : keys?.foreignKey?.value || '',
            relationTable: ind === 0 ? '' : Object.keys(mySql)[ind - 1],
            updateDate: keys?.checkUpdate?.value || '',
        };
    });

    return {
        connectorId: remoteDataSourceID,
        connectorName: sourceName,
        remoteSettingId: remoteSettingId,
        meeting: webex.name,
        listType: 5,
        scheduleFrequency: updatedCycle?.typeId,
        sourceType: '2',
        friendlyName: instanceName,
        columnName: columnName,
        temp: rightAtt,
    };
};

export const finalPayload_Prestodb = (mySql, getValues, type, tabledata) => {
    const { resource, updatedCycle, instanceName, userName, portNumber, catalog, schema } = getValues();
    

    const {
        data: { sourceName, remoteDataSourceID, remoteSettingId, schemaName },
    } = type;

    const tableName = Object.keys(mySql);

    const rightAtt = [];
    let columnName = Object.keys(mySql).map((ele, ind) => {
        let keys = mySql[ele];
        rightAtt.push(...keys.attributes.rightAttributes);
        return {
            tableName: ele,
            columns: keys.attributes.rightAttributes.map((e) => e.name && e.name).join(),
            primaryKey:
                ind === 0 ? (keys?.primaryKey?.value === undefined ? primaryKey?.value : keys?.primaryKey?.value) : '',
            foreignKey:
                ind === 0
                    ? ''
                    : keys?.foreignKey?.value === undefined
                    ? foreignKey?.value
                    : keys?.foreignKey?.value || '',
            relationTable: ind === 0 ? '' : Object.keys(mySql)[ind - 1],
            updateDate: keys?.checkUpdate?.value || '',
        };
    });

    return {
        host: resource,
        port: Number(portNumber),
        user: userName,
        catalog: catalog,
        schema: schema,
        connectorId: 159,
        connectorName: 'PrestoDB',
        departmentId: 1,
        listType: 5,
        scheduleFrequency: updatedCycle?.typeId,
        sourceType: '2',
        columnName: columnName,
        friendlyName: instanceName,
        temp: rightAtt,
    };
};
export const finalPayload_Commercetools = (mySql, getValues, type, tabledata) => {
    const { resource, updatedCycle, instanceName, clientDomain, clientSecret, projectName, schema } = getValues();
    

    const {
        data: { sourceName, remoteDataSourceID, remoteSettingId, schemaName },
    } = type;

    const tableName = Object.keys(mySql);

    const rightAtt = [];
    let columnName = Object.keys(mySql).map((ele, ind) => {
        let keys = mySql[ele];
        rightAtt.push(...keys.attributes.rightAttributes);
        return {
            tableName: ele,
            columns: keys.attributes.rightAttributes.map((e) => e.name && e.name).join(),
            primaryKey:
                ind === 0 ? (keys?.primaryKey?.value === undefined ? primaryKey?.value : keys?.primaryKey?.value) : '',
            foreignKey:
                ind === 0
                    ? ''
                    : keys?.foreignKey?.value === undefined
                    ? foreignKey?.value
                    : keys?.foreignKey?.value || '',
            relationTable: ind === 0 ? '' : Object.keys(mySql)[ind - 1],
            updateDate: keys?.checkUpdate?.value || '',
        };
    });

    return {
        clientId: clientDomain,
        clientSecret: clientSecret,
        projectKey: projectName,
        authHost: resource,
        connectorId: remoteDataSourceID,
        connectorName: sourceName,
        columnName: columnName,
        listType: 5,
        scheduleFrequency: updatedCycle?.typeId,
        sourceType: '2',
        friendlyName: instanceName,
        temp: rightAtt,
    };
};
export const finalPayload_GoogleSheets = (mySql, getValues, type, tabledata) => {
    const { resource, updatedCycle, instanceName, jsonFilePath, spreadsheetId, projectName, schema } = getValues();
    

    const {
        data: { sourceName, remoteDataSourceID, remoteSettingId, schemaName },
    } = type;

    const tableName = Object.keys(mySql);

    const rightAtt = [];
    let columnName = Object.keys(mySql).map((ele, ind) => {
        let keys = mySql[ele];
        rightAtt.push(...keys.attributes.rightAttributes);
        return {
            tableName: ele,
            columns: keys.attributes.rightAttributes.map((e) => e.name && e.name).join(),
            primaryKey:
                ind === 0 ? (keys?.primaryKey?.value === undefined ? primaryKey?.value : keys?.primaryKey?.value) : '',
            foreignKey:
                ind === 0
                    ? ''
                    : keys?.foreignKey?.value === undefined
                    ? foreignKey?.value
                    : keys?.foreignKey?.value || '',
            relationTable: ind === 0 ? '' : Object.keys(mySql)[ind - 1],
            updateDate: keys?.checkUpdate?.value || '',
        };
    });

    return {
        spreadsheetId: spreadsheetId,
        credentialsPath: jsonFilePath,
        connectorId: remoteDataSourceID,
        connectorName: sourceName,
        columnName: columnName,
        listType: 5,
        scheduleFrequency: updatedCycle?.typeId,
        sourceType: '2',
        friendlyName: instanceName,
        temp: rightAtt,
    };
};
export const finalPayload = (mySql, getValues) => {
    //remotesourceid :1&2
    const { ipAddress, userName, password, instanceName, updatedCycle } = getValues();
    const tableName = Object.entries(mySql).map(([key, res]) => {
        if (res.foreignKey) return key + '.' + getKeyValue(res);
    });
    const columname = Object.entries(mySql).map(([key, res]) => {
        return key + '.' + getKeyValue(res);
    });
    const updateDatecolumn = Object.entries(mySql).map(([key, res]) => {
        return key + '.' + getKeyValue(res) + '.' + res.checkUpdate.type;
    });
    const primaryKeyTable = Object.keys(mySql)[0];
    const primaryKeyObj = mySql[primaryKeyTable];
    return {
        iPAddress: ipAddress,
        userName: userName,
        password: password,
        friendlyName: instanceName,
        fileLocation: '',
        scheduleFrequency: updatedCycle.typeId, //'1',
        connectionType: 'C',
        remotesettingID: 0,
        remoteDataSourceID: '2',
        isUpdated: 'True',
        dataBaseType: 'MySQL',
        tableName: Object.keys(mySql).join(','),
        columname: columname.join(','), // TABLE.COLUMN
        updateDatecolumn: updateDatecolumn.join(','), //TABLE.KEY.UPDATECHECK
        primaryTableName: primaryKeyTable,
        primaryKeyColumn: primaryKeyObj.primaryKey.type,
        foreignKeyColumn: tableName.filter(Boolean).join(','),
    };
};

export const Component = ({ dataItem, ...others }, table) => {
    return (
        <li {...others} key={others.id} className={`${others.className} d-block`}>
            {table && <i className="small">{table && (dataItem?.tableUiLabelName || dataItem?.table)}</i>}
            {dataItem?.name}
            {dataItem?.primaryKey && <i className={`${G.key_fill_mini} icon-xs ml10 color-primaryKey`}></i>}
            {dataItem?.foreignKey && <i className={`${G.key_fill_mini} icon-xs ml10 color-foreignKey`}></i>}
        </li>
    );
};

export const attributeColumn = (RDSID, isDateFieldAvailable = false) => {
    return [
        {
            field: 'table',
            title: 'Table name',
        },
        {
            field: 'selectedKey',
            title: 'Key column',
        },
        ...(INTEGRATED_SQL_CONNECTOR_IDS.has(RDSID) || isDateFieldAvailable ? [{
            field: 'dateType',
            title: 'Date field',
        }] : []),
        {
            title: 'Attributes',
            field: 'attrs',
        },
    ];
};

export const attributeColumnVersium = [
    {
        field: 'table',
        title: 'Category name',
        width: 200,
    },

    {
        title: 'Attributes',
        field: 'attrs',
    },
];

export const checkCustomTableColumnConfig = (remoteDataSourceID) => {
    const customTableConfig = [5, 28];
    const isCustomTableConfig = customTableConfig?.includes(parseInt(remoteDataSourceID, 10));
    return isCustomTableConfig;
};

export const addUniqueKey = (list = [], key = '_uid') => {
    return list.map((item, index) => ({
        ...item,
        [key]:
            item.key ||
            `${item.name || ''}_${item.table || ''}_${index}`
    }));
};
export const removeUniqueKey = (list = [], key = '_uid') => {
    return list.map((item) => {
        const { [key]: _, ...rest } = item;
        return rest;
    });
};
export const createFilterRuleJson = (data) => {
  const attribute = data.filterAttributes[0];

  return {
    filterRuleJson: {
      RuleCondition: "AND",
      TargetFilterGroup: "All",
      LAApercentage: 0,
      segmentationListId: 0,
      RecipientCount: "0",
      IsRequestApproval: false,
      zerodaycampaign: "",
      RequestApproval: [],
      departmentId: 1,
      Uid: 8537,
      userId: 8537,
      clientId: 4650,
      premotesettingId: 76,
      partnerID: 40,
      remoteSettingId: 76,
      IsSaveLaterFlag: false,
      extractionLimit: 0,

      OriginalBaseExprVal: {
        GroupingOperator: "AND",
        FilterGroup: "OriginalBase",
        TotalIncusionQuery: "",
        TotalInclusionCount: "",
        IsLastLi: false,
        LiIndex: 0,
        partnerID: 0,
        remoteSettingId: 0,

        Expressions: [
          {
            SequenceId: 0,
            Category: "source",
            Field: attribute.pVUIPrintableName,
            Value: `'${attribute.pVAttributeValue}'`,

            dateValue: [
              {
                id: 30,
                count: 0,
                data: attribute.pVAttributeValue
              }
            ],

            typeStatus: [],
            ConditionOperator: "isequalto",
            ExpressionOperator: "And",
            QueryType: "hsearch",
            LiId: "filterBuildComp0",
            ParentdivId: "crbGroupContainer0",
            ParentChildIdentify: null,
            SOLRFieldName: "v_contact_state_s",
            SOLRCountValue: 10,
            LiwaterfallCount: String(data.filterCount),

            LiremainingCount:
              data.baseCount - data.filterCount,

            LiarithmeticSymbol: "-",

            LiUIPrintableName:
              attribute.pVUIPrintableName,

            WithInOperator: null,
            WithInOperatorCountdisable: null,
            WithInOperatorCountStart: null,
            WithInOperatorCountEnd: null,
            restype: null,
            SourceFrom: null,
            IsVirtualField: false,
            partnerId: 0
          }
        ]
      },

      FilterGroup2ExprVal: {
        GroupingOperator: "OR",
        FilterGroup: "MultipleFilter",
        TotalIncusionQuery: "",
        TotalInclusionCount: "",
        IsLastLi: false,
        LiIndex: 1,
        partnerID: 0,
        remoteSettingId: 0,
        Expressions: []
      },

      Exclusion1ExprVal: {
        GroupingOperator: "NOT",
        FilterGroup: "ExclusionFilter",
        TotalIncusionQuery: "",
        TotalInclusionCount: "",
        IsLastLi: false,
        LiIndex: 2,
        partnerID: 0,
        remoteSettingId: 0,
        Expressions: []
      },

      LookALikeExprVal: {
        GroupingOperator: "OR",
        FilterGroup: "IG_LookALike",
        TotalIncusionQuery: "",
        TotalInclusionCount: "",
        IsLastLi: true,
        LiIndex: 3,
        partnerID: 0,
        remoteSettingId: 0,
        Expressions: []
      },

      finalAudienceCount:
        `${data.filterCount}||` +
        `[{"id":0,"name":"${attribute.pVUIPrintableName}","value":"${attribute.pVAttributeValue}"}]||[]||[]`
    },

   // filterCount: data.filterCount,
   // jobId: data.jobId
  };
};