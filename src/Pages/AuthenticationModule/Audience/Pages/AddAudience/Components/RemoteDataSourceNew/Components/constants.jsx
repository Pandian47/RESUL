import { DEFAULT_IMPORT_PREFERENCE } from '../../../importPreferenceDefault';
import { createContext } from 'react';
export const RDSContext = createContext({
    reducerState: {},
    dispatchState: () => {},
});
export const ODBC_MYSQL_STATE = {
    ipAddress: '',
    portNumber: '',
    databaseName: '',
    instanceName: '',
    userName: '',
    password: '',
    checkValid_prime_date: false,
    isTouched: false,
    isImportPreference: DEFAULT_IMPORT_PREFERENCE,
    credentials: ''
};

export const GOOGLE_BQ_QUERY = {
    friendlyName: '',
    fileName: '',
};

export const rightAttributes = [
    { id: 7, name: 'Channel' },
    { id: 8, name: 'Back end' },
];
export const leftAttributes = [
    { id: 1, name: 'Remote data source' },
    { id: 2, name: 'Subscription forms' },
    { id: 3, name: 'Manual entry' },
    { id: 4, name: 'XML' },
    { id: 5, name: 'E-Commerce' },
    { id: 6, name: 'CSV' },
];

export const TABLE_DETAILS = [
    { type: 'Table details', typeId: 0 },
    { type: 'MUser details', typeId: 1 },
    { type: 'Fixed deposites', typeId: 2 },
    { type: 'Credit card', typeId: 3 },
    { type: 'Loans', typeId: 4 },
    { type: 'Wealth', typeId: 5 },
];

export const CHECK_UPDATE = [{ type: 'Modified date & time', typeId: 1, value: 'Modified date & time' }];

export const COLUMN_DATA_DEDUPE = [
    { id: 1, name: 'Name', status: true, filter: 'text' },
    { id: 2, name: 'EmailID', status: false, filter: 'text' },
    { id: 3, name: 'MobileNo', status: true, filter: 'text' },
    { id: 4, name: 'Gender', status: true, filter: 'text' },
    { id: 5, name: 'City', status: false, filter: 'text' },
];

export const CONNECTION_TYPE = [
    { type: 'CRM to RESUL', typeId: 1 },
    { type: 'RESUL to CRM', typeId: 2 },
];

export const mutateAPIData = (apiData, dispatchState, index) => {
    if (apiData?.length > 0) {
        let data = [];
        apiData.forEach((el, key) => {
            for (let j = 0; j < el.split(' ')?.length; j++) {
                data.push({ type: el.split(' ')[index], typeId: key });
                break;
            }
        });
        dispatchState({ type: 'UPDATE', field: 'dataSetList', payload: data });
    }
};

export const INTEGRATED_NOSQL_CONNECTOR_IDS = new Set([
    45, 28, 5, 50, 51, 48, 41, 49, 54, 23, 29, 156, 55, 21, 22, 47, 46, 43, 160, 158, 106, 159, 166, 39, 168, 170
]);
export const INTEGRATED_SQL_CONNECTOR_IDS = new Set([
    1, 2, 3, 52, 53
]);
export const BI_DIRECTION_ENABLED_IDS = new Set([45, 28, 5]);
