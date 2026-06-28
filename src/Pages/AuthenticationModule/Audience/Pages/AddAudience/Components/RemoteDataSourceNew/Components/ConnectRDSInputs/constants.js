import { RDS_FIELD_LABEL } from '../../../../rdsConnectFieldLabels';
import { RDS_VALIDATION_MSG } from '../../../../rdsConnectValidationMessages';
const {
    ACCESSKEY,
    ACCESSTOKEN,
    ACCOUNT,
    APIHOST,
    APITOKEN,
    API_KEY,
    AUTH_URL,
    CATALOG,
    CLIENTID,
    CLIENTSECRET,
    CONSUMER_KEY,
    CONSUMER_SECRET,
    DATABASE,
    DATABASE_NAME,
    DATASETINFO,
    DOMAIN_URL,
    EMAIL,
    ENTER_URL,
    HOST,
    HTTPPATH,
    HUBID,
    KEY,
    KEYSPACE,
    NAMESPACE,
    PASSWORD,
    PORT,
    PROJECTINFO,
    PROJECTKEY,
    PROJECTNAME,
    RESOURCEURL,
    SCHEMA,
    SECRETKEY,
    SECURITYTOKEN,
    SERVER,
    SHOPNAME,
    SITEID,
    SPREADSHEETID,
    STOREHASH,
    STORENAME,
    STOREURL,
    TENANTID,
    USER_NAME,
} = RDS_FIELD_LABEL;

const {
    ACCESSKEY_MSG,
    ACCESSTOKEN_MSG,
    ACCOUNT_MSG,
    API,
    APIHOST_MSG,
    APITOKEN_MSG,
    API_KEY_MSG,
    AUTH_URL_MSG,
    CATALOG_MSG,
    CLIENTID_MSG,
    CLIENTSECRET_MSG,
    CONSUMER_KEY_MSG,
    CONSUMER_SECRET_MSG,
    DATABASE_MSG,
    DATABASE_NAME_MSG,
    DATASETINFO_MSG,
    DOMAIN_URL_MSG,
    EMAILADDRESS,
    ENTER_PASSWORD,
    HOST_MSG,
    HTTPPATH_MSG,
    HUBID_MSG,
    KEY_MSG,
    KEYSPACE_MSG,
    NAMESPACE_MSG,
    PORT_MSG,
    PROJECTINFO_MSG,
    PROJECTKEY_MSG,
    PROJECTNAME_MSG,
    RESOURCEURL_MSG,
    SCHEMA_MSG,
    SECURITYTOKEN_MSG,
    SERVER_MSG,
    SHOPNAME_MSG,
    SITE_ID,
    SPREADSHEETID_MSG,
    STOREHASH_MSG,
    STORENAME_MSG,
    STOREURL_MSG,
    TENANTID_MSG,
    USER_NAME_MSG,
} = RDS_VALIDATION_MSG;
export const FormatEnum = {
    UnSpecified: 0,
    Sql: 2,
    mysql: 2,
    mssql: 1,
    Oracle: 3,
    Ftp: 4,
    SalesForce: 5,
    Xml: 6,
    Csv: 7,
    Sftp: 8,
    Magento: 21,
    Shopify: 22,
    BigCommerce: 23,
    Facebook: 24,
    Twitter: 26,
    DynamicCRM: 28,
    Prestashop: 29,
    SubscriptionForm: 30,
    InternalRecipients: 31,
    ManualEntry: 32,
    TangStats: 33,
};

export const RenderConnecter = ({ remoteDataSourceID }) => {

    switch (remoteDataSourceID) {
        case 45:
            return hubSpot;
        case 50:
            return pipeDrive;
        case 5:
            return salesForce;
        case 156:
            return leadsQuared;
        case 28:
            return dynamicsCRM;
        case 22:
            return shopify;
        case 49:
            return storeHippo;
        case 46:
            return wix;
        case 21:
            return magento;
        case 29:
            return prestaShop;
        case 52:
            return postgresSQL;
        case 3:
            return oracle;
        case 1:
            return MSSQL;
        case 2:
            return MYSQL;
        case 41:
            return mongoDB;
        case 48:
            return aeroSpike;
        case 51:
            return cassandra;
        case 39:
            return snowFlake;
        case 55:
            return blackBaud;
        case 43:
            return bigQuery;
        case 53:
            return Databricks;
        case 47:
            return wooCommerce;
        case 23:
            return bigCommerce;
        case 40:
            return versium;
        case 160:
            return insightly;
        case 158:
            return gotowebinar;
        case 106:
            return webex;
        case 159:
            return PestoDb;
        case 166:
            return Commercetools;
        case 155:
            return digipop;
        case 168:
            return googleSheet;
        case 170: 
            return cNl;
        default:
            return null;
    }
};
export const digipop = {
    name: 'digipop',
    id: '',
    fields: [
        {
            name: 'userName',
            type: 'text',
            placeHolder: USER_NAME,
            value: '',
            required: USER_NAME_MSG,
            viewEye: false,
        },
        {
            name: 'password',
            type: 'password',
            placeHolder: PASSWORD,
            value: '',
            required: ENTER_PASSWORD,
            viewEye: true,
        },
    ],
};
export const hubSpot = {
    name: 'hubSpot',
    id: '',
    fields: [
        {
            name: 'hubid',
            type: 'text',
            placeHolder: HUBID,
            value: '',
            required: HUBID_MSG,
            viewEye: false,
        },
        {
            name: 'accesstoken',
            type: 'text',
            placeHolder: ACCESSTOKEN,
            value: '',
            required: ACCESSTOKEN_MSG,
            viewEye: false,
        },
    ],
};
export const googleSheet = {
    name: 'googleSheet',
    id: '',
    fields: [
        {
            name: 'spreadsheetId',
            type: 'text',
            placeHolder: SPREADSHEETID,
            value: '',
            required: SPREADSHEETID_MSG,
            viewEye: false,
        },
    ],
};
export const cNl = {
    name: 'hubSpot',
    id: '',
    fields: [
        {
            name: 'accesstoken',
            type: 'text',
            placeHolder: ACCESSTOKEN,
            value: '',
            required: ACCESSTOKEN_MSG,
            viewEye: false,
        },
    ],
};
export const pipeDrive = {
    name: 'pipeDrive',
    id: '',
    fields: [
        {
            name: 'resource',
            type: 'text',
            placeHolder: APITOKEN,
            value: '',
            required: APITOKEN_MSG,
            viewEye: false,
        },
    ],
};

export const salesForce = {
    name: 'salesForce',
    id: '',
    fields: [
         {
            name: 'userName',
            type: 'text',
            placeHolder: USER_NAME,
            value: '',
            required: USER_NAME_MSG,
            viewEye: false,
        },
        {
            name: 'password',
            type: 'password',
            placeHolder: PASSWORD,
            value: '',
            required: ENTER_PASSWORD,
            viewEye: true,
        },
        {
            name: 'securityToken',
            type: 'text',
            placeHolder: SECURITYTOKEN,
            value: '',
            required: SECURITYTOKEN_MSG,
            viewEye: false,
        },
       
    ],
};

export const leadsQuared = {
    name: 'leadsQuared',
    id: '',
    fields: [
        {
            name: 'apiHost',
            type: 'text',
            placeHolder: APIHOST,
            value: '',
            required: APIHOST_MSG,
            viewEye: false,
        },
        {
            name: 'accessKey',
            type: 'text',
            placeHolder: ACCESSKEY,
            value: '',
            required: ACCESSKEY_MSG,
            viewEye: false,
        },
        {
            name: 'secretKey',
            type: 'text',
            placeHolder: SECRETKEY,
            value: '',
            placeHolder: SECRETKEY,
            viewEye: false,
        },
    ],
};
export const Commercetools = {
    name: 'commercetools',
    id: '',
    fields: [
        {
            name: 'clientDomain',
            type: 'text',
            placeHolder: CLIENTID,
            value: '',
            required: CLIENTID_MSG,
            viewEye: false,
        },
        {
            name: 'clientSecret',
            type: 'text',
            placeHolder: CLIENTSECRET,
            value: '',
            required: CLIENTSECRET_MSG,
            viewEye: false,
        },
        {
            name: 'projectName',
            type: 'text',
            placeHolder: PROJECTKEY,
            value: '',
            required: PROJECTKEY_MSG,
            viewEye: false,
        },
        {
            name: 'resource',
            type: 'text',
            placeHolder: AUTH_URL,
            value: '',
            required: AUTH_URL_MSG,
            viewEye: false,
        },
    ],
};
export const dynamicsCRM = {
    name: 'dynamicsCRM',
    id: '',
    fields: [
         {
            name: 'resource',
            type: 'text',
            placeHolder: RESOURCEURL,
            value: '',
            required: RESOURCEURL_MSG,
            viewEye: false,
        },
        {
            name: 'tenantDomain',
            type: 'text',
            placeHolder: TENANTID,
            value: '',
            required: TENANTID_MSG,
            viewEye: false,
        },
        {
            name: 'clientDomain',
            type: 'text',
            placeHolder: CLIENTID,
            value: '',
            required: CLIENTID_MSG,
            viewEye: false,
        },
        {
            name: 'clientSecret',
            type: 'text',
            placeHolder: CLIENTSECRET,
            value: '',
            required: CLIENTSECRET_MSG,
            viewEye: false,
        },
    ],
};

export const shopify = {
    name: 'shopify',
    id: '',
    fields: [
        {
            name: 'resource',
            type: 'text',
            placeHolder: API_KEY,
            value: '',
            required: API_KEY_MSG,
            viewEye: false,
        },
        {
            name: 'accesstoken',
            type: 'text',
            placeHolder: ACCESSTOKEN,
            value: '',
            required: ACCESSTOKEN_MSG,
            viewEye: false,
        },
        {
            name: 'shopName',
            type: 'text',
            placeHolder: SHOPNAME,
            value: '',
            required: SHOPNAME_MSG,
            viewEye: false,
        },
    ],
};

export const storeHippo = {
    name: 'storeHippo',
    id: '',
    fields: [
        {
            name: 'shopName',
            type: 'text',
            placeHolder: STORENAME,
            value: '',
            required: STORENAME_MSG,
            viewEye: false,
        },
        {
            name: 'accesstoken',
            type: 'text',
            placeHolder: ACCESSKEY,
            value: '',
            required: ACCESSKEY_MSG,
            viewEye: false,
        },
    ],
};

export const wix = {
    name: 'wix',
    id: '',
    fields: [
        {
            name: 'siteId',
            type: 'text',
            placeHolder: SITEID,
            value: '',
            required: SITE_ID,
            viewEye: false,
        },
        {
            name: 'authId',
            type: 'text',
            placeHolder: API_KEY,
            value: '',
            required: API_KEY_MSG,
            viewEye: false,
        },
    ],
};

export const magento = {
    name: 'magento',
    id: '',
    fields: [
        {
            name: 'resource',
            type: 'text',
            placeHolder: STOREURL,
            value: '',
            required: STOREURL_MSG,
            viewEye: false,
        },
        {
            name: 'accesstoken',
            type: 'text',
            placeHolder: ACCESSTOKEN,
            value: '',
            required: ACCESSTOKEN_MSG,
            viewEye: false,
        },
        {
            name: 'userName',
            type: 'text',
            placeHolder: USER_NAME,
            value: '',
            required: USER_NAME_MSG,
            viewEye: false,
        },
        {
            name: 'password',
            type: 'password',
            placeHolder: PASSWORD,
            value: '',
            required: ENTER_PASSWORD,
            viewEye: true,
        },
    ],
};

export const prestaShop = {
    name: 'prestaShop',
    id: '',
    fields: [
        {
            name: 'shopName',
            type: 'text',
            placeHolder: STOREURL,
            value: '',
            required: STOREURL_MSG,
            viewEye: false,
        },
        {
            name: 'resource',
            type: 'text',
            placeHolder: KEY,
            value: '',
            required: KEY_MSG,
            viewEye: false,
        },
    ],
};

export const postgresSQL = {
    name: 'postgresSQL',
    id: '',
    fields: [
        {
            name: 'ipAddress',
            type: 'text',
            placeHolder: HOST,
            value: '',
            required: HOST_MSG,
            viewEye: false,
        },
        {
            name: 'portNumber',
            type: 'text',
            placeHolder: PORT,
            value: '',
            required: PORT_MSG,
            viewEye: false,
        },
         {
            name: 'userName',
            type: 'text',
            placeHolder: USER_NAME,
            value: '',
            required: USER_NAME_MSG,
            viewEye: false,
        },
        {
            name: 'password',
            type: 'password',
            placeHolder: PASSWORD,
            value: '',
            required: ENTER_PASSWORD,
            viewEye: true,
        },
        {
            name: 'databaseName',
            type: 'text',
            placeHolder: DATABASE,
            value: '',
            required: DATABASE_MSG,
            viewEye: false,
        },
         {
            name: 'schema',
            type: 'text',
            placeHolder: SCHEMA,
            value: '',
            required: SCHEMA_MSG,
            viewEye: false,
        },
    ],
};

export const oracle = {
    name: 'oracle',
    id: '',
    fields: [
        {
            name: 'ipAddress',
            type: 'text',
            placeHolder: HOST,
            value: '',
            required: HOST_MSG,
            viewEye: false,
        },
        {
            name: 'databaseName',
            type: 'text',
            placeHolder: SCHEMA,
            value: '',
            required: SCHEMA_MSG,
            viewEye: false,
        },
        {
            name: 'portNumber',
            type: 'text',
            placeHolder: PORT,
            value: '',
            required: PORT_MSG,
            viewEye: false,
        },
        {
            name: 'userName',
            type: 'text',
            placeHolder: USER_NAME,
            value: '',
            required: USER_NAME_MSG,
            viewEye: false,
        },
        {
            name: 'password',
            type: 'password',
            placeHolder: PASSWORD,
            value: '',
            required: ENTER_PASSWORD,
            viewEye: true,
        },
    ],
};

export const MSSQL = {
    name: 'MsSQL',
    id: '',
    fields: [
        {
            name: 'ipAddress',
            type: 'text',
            placeHolder: SERVER,
            value: '',
            required: SERVER_MSG,
            viewEye: false,
        },
        {
            name: 'portNumber',
            type: 'text',
            placeHolder: PORT,
            value: '',
            required: PORT_MSG,
            viewEye: false,
        },
        {
            name: 'databaseName',
            type: 'text',
            placeHolder: DATABASE_NAME,
            value: '',
            required: DATABASE_NAME_MSG,
            viewEye: false,
        },
        {
            name: 'userName',
            type: 'text',
            placeHolder: USER_NAME,
            value: '',
            required: USER_NAME_MSG,
            viewEye: false,
        },
        {
            name: 'password',
            type: 'password',
            placeHolder: PASSWORD,
            value: '',
            required: ENTER_PASSWORD,
            viewEye: true,
        },
    ],
};

export const PestoDb = {
    name: 'PresToDb',
    id: '',
    fields: [
        {
            name: 'resource',
            type: 'text',
            placeHolder: HOST,
            value: '',
            required: HOST_MSG,
            viewEye: false,
        },
        {
            name: 'portNumber',
            type: 'text',
            placeHolder: PORT,
            value: '',
            required: PORT_MSG,
            viewEye: false,
        },
        {
            name: 'userName',
            type: 'text',
            placeHolder: USER_NAME,
            value: '',
            required: USER_NAME_MSG,
            viewEye: false,
        },
        {
            name: 'catalog',
            type: 'text',
            placeHolder: CATALOG,
            value: '',
            required: CATALOG_MSG,
            viewEye: false,
        },
        {
            name: 'schema',
            type: 'text',
            placeHolder: SCHEMA,
            value: '',
            required: SCHEMA_MSG,
            viewEye: false,
        }
    ],
};

export const Databricks = {
    name: 'Databricks',
    id: '',
    fields: [
        {
            name: 'resource',
            type: 'text',
            placeHolder: HOST,
            value: '',
            required: HOST_MSG,
            viewEye: false,
        },
        {
            name: 'httpPath',
            type: 'text',
            placeHolder: HTTPPATH,
            value: '',
            required: HTTPPATH_MSG,
            viewEye: false,
        },
         {
            name: 'accesstoken',
            type: 'text',
            placeHolder: ACCESSTOKEN,
            value: '',
            required: ACCESSTOKEN_MSG,
            viewEye: false,
        },
        {
            name: 'databaseName',
            type: 'text',
            placeHolder: DATABASE_NAME,
            value: '',
            required: DATABASE_NAME_MSG,
            viewEye: false,
        },
        {
            name: 'schema',
            type: 'text',
            placeHolder: SCHEMA,
            value: '',
            required: SCHEMA_MSG,
            viewEye: false,
        }
    ],
};
export const MYSQL = {
    name: 'MYSQL',
    id: '',
    fields: [
        {
            name: 'ipAddress',
            type: 'text',
            placeHolder: SERVER,
            value: '',
            required: SERVER_MSG,
            viewEye: false,
        },
        {
            name: 'portNumber',
            type: 'text',
            placeHolder: PORT,
            value: '',
            required: PORT_MSG,
            viewEye: false,
        },
        {
            name: 'databaseName',
            type: 'text',
            placeHolder: DATABASE_NAME,
            value: '',
            required: DATABASE_NAME_MSG,
            viewEye: false,
        },
        {
            name: 'userName',
            type: 'text',
            placeHolder: USER_NAME,
            value: '',
            required: USER_NAME_MSG,
            viewEye: false,
        },
        {
            name: 'password',
            type: 'password',
            placeHolder: PASSWORD,
            value: '',
            required: ENTER_PASSWORD,
            viewEye: true,
        },
    ],
};

export const mongoDB = {
    name: 'mongoDB',
    id: '',
    fields: [
        {
            name: 'ipAddress',
            type: 'text',
            placeHolder: SERVER,
            value: '',
            required: SERVER_MSG,
            viewEye: false,
        },
        {
            name: 'portNumber',
            type: 'text',
            placeHolder: PORT,
            value: '',
            required: PORT_MSG,
            viewEye: false,
        },
         {
            name: 'userName',
            type: 'text',
            placeHolder: USER_NAME,
            value: '',
            required: USER_NAME_MSG,
            viewEye: false,
        },
        {
            name: 'password',
            type: 'password',
            placeHolder: PASSWORD,
            value: '',
            required: ENTER_PASSWORD,
            viewEye: true,
        },
        {
            name: 'databaseName',
            type: 'text',
            placeHolder: DATABASE_NAME,
            value: '',
            required: DATABASE_NAME_MSG,
            viewEye: false,
        },
       
    ],
};

export const aeroSpike = {
    name: 'aeroSpike',
    id: '',
    fields: [
        {
            name: 'ipAddress',
            type: 'text',
            placeHolder: HOST,
            value: '',
            required: HOST_MSG,
            viewEye: false,
        },
        {
            name: 'portNumber',
            type: 'text',
            placeHolder: PORT,
            value: '',
            required: PORT_MSG,
            viewEye: false,
        },
        {
            name: 'userName',
            type: 'text',
            placeHolder: USER_NAME,
            value: '',
            required: USER_NAME_MSG,
            viewEye: false,
        },
        {
            name: 'password',
            type: 'password',
            placeHolder: PASSWORD,
            value: '',
            required: ENTER_PASSWORD,
            viewEye: true,
        },
        {
            name: 'databaseName',
            type: 'text',
            placeHolder: NAMESPACE,
            value: '',
            required: NAMESPACE_MSG,
            viewEye: false,
        },
    ],
};

export const cassandra = {
    name: 'cassandra',
    id: '',
    fields: [
        {
            name: 'ipAddress',
            type: 'text',
            placeHolder: SERVER,
            value: '',
            required: SERVER_MSG,
            viewEye: false,
        },
        {
            name: 'portNumber',
            type: 'text',
            placeHolder: PORT,
            value: '',
            required: PORT_MSG,
            viewEye: false,
        },
        {
            name: 'userName',
            type: 'text',
            placeHolder: USER_NAME,
            value: '',
            required: USER_NAME_MSG,
            viewEye: false,
        },
        {
            name: 'password',
            type: 'password',
            placeHolder: PASSWORD,
            value: '',
            required: ENTER_PASSWORD,
            viewEye: true,
        },
        {
            name: 'databaseName',
            type: 'text',
            placeHolder: KEYSPACE,
            value: '',
            required: KEYSPACE_MSG,
            viewEye: false,
        },
    ],
};

export const snowFlake = {
    name: 'snowFlake',
    id: '',
    fields: [
        {
            name: 'accountName',
            type: 'text',
            placeHolder: ACCOUNT,
            value: '',
            required: ACCOUNT_MSG,
            viewEye: false,
        },
        {
            name: 'databaseName',
            type: 'text',
            placeHolder: DATABASE_NAME,
            value: '',
            required: DATABASE_NAME_MSG,
            viewEye: false,
        },
        {
            name: 'schema',
            type: 'text',
            placeHolder: SCHEMA,
            value: '',
            required: SCHEMA_MSG,
            viewEye: false,
        },
        {
            name: 'userName',
            type: 'text',
            placeHolder: USER_NAME,
            value: '',
            required: USER_NAME_MSG,
            viewEye: false,
        },
        {
            name: 'password',
            type: 'password',
            placeHolder: PASSWORD,
            value: '',
            required: ENTER_PASSWORD,
            viewEye: true,
        },
    ],
};

export const blackBaud = {
    name: 'blackBaud',
    id: '',
    fields: [
        {
            name: 'userName',
            type: 'text',
            placeHolder: EMAIL,
            value: '',
            required: EMAILADDRESS,
            viewEye: false,
        },
    ],
};

export const bigQuery = {
    name: 'bigQuery',
    id: '',
    fields: [
        {
            name: 'projectInfo',
            type: 'text',
            placeHolder: PROJECTINFO,
            value: '',
            required: PROJECTINFO_MSG,
            viewEye: false,
        },
        {
            name: 'datasetInfo',
            type: 'text',
            placeHolder: DATASETINFO,
            value: '',
            required: DATASETINFO_MSG,
            viewEye: false,
        },
        {
            name: 'projectName',
            type: 'text',
            placeHolder: PROJECTNAME,
            value: '',
            required: PROJECTNAME_MSG,
            viewEye: false,
        },
    ],
};

export const wooCommerce = {
    name: 'wooCommerce',
    id: '',
    fields: [
        {
            name: 'accessKey',
            type: 'text',
            placeHolder: CONSUMER_KEY,
            value: '',
            required: CONSUMER_KEY_MSG,
            viewEye: false,
        },
        {
            name: 'secretKey',
            type: 'text',
            placeHolder: CONSUMER_SECRET,
            value: '',
            required: CONSUMER_SECRET_MSG,
            viewEye: false,
        },
         {
            name: 'apiHost',
            type: 'text',
            placeHolder: DOMAIN_URL,
            value: '',
            required: DOMAIN_URL_MSG,
            viewEye: false,
        },
    ],
};

export const bigCommerce = {
    name: 'bigCommerce',
    id: '',
    fields: [
        {
            name: 'storehash',
            type: 'text',
            placeHolder: STOREHASH,
            value: '',
            required: STOREHASH_MSG,
            viewEye: false,
        },
        {
            name: 'accesstoken',
            type: 'text',
            placeHolder: ACCESSTOKEN,
            value: '',
            required: ACCESSTOKEN_MSG,
            viewEye: false,
        },
        {
            name: 'shopName',
            type: 'text',
            placeHolder: SHOPNAME,
            value: '',
            required: SHOPNAME_MSG,
            viewEye: false,
        },
    ],
};
export const insightly = {
    name: 'insightly',
    id: '',
    fields: [
        {
            name: 'resource',
            type: 'text',
            placeHolder: API_KEY,
            value: '',
            required: API_KEY_MSG,
            viewEye: false,
        },
    ],
};
export const gotowebinar = {
    name: 'gotowebinar',
    id: '',
    fields: [
        {
            name: 'userName',
            type: 'text',
            placeHolder: EMAIL,
            value: '',
            required: EMAILADDRESS,
            viewEye: false,
        },
    ],
};
export const webex = {
    name: 'webex',
    id: '',
    fields: [
        // {
        //     name: 'userName',
        //     type: 'text',
        //     placeHolder: EMAIL,
        //     value: '',
        //     required: EMAILADDRESS,
        //     viewEye: false,
        // }
    ],
};
export const versium = {
    name: 'versium',
    id: '',
    fields: [
        {
            name: 'resource',
            type: 'text',
            placeHolder: ENTER_URL,
            value: '',
            required: API,
            viewEye: false,
        },
        {
            name: 'userName',
            type: 'text',
            placeHolder: USER_NAME,
            value: '',
            required: USER_NAME_MSG,
            viewEye: false,
        },
        {
            name: 'password',
            type: 'password',
            placeHolder: PASSWORD,
            value: '',
            required: ENTER_PASSWORD,
            viewEye: false,
        },
    ],
};
 