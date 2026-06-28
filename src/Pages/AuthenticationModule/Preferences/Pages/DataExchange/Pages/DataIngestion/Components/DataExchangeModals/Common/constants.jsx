import { charNumUnderScore } from 'Utils/modules/inputValidators';
import { ACCESSTOKEN as ACCESSTOKEN_MSG, ACCOUNTS, AUTHTOKEN, DOMAIN_URL, ENTER_PASSWORD, ENTER_SECRECT_ID, ENTER_URL, INSTANCE_NAME, ORGANIZAION_NAME, SELECT_END_DATE, SELECT_START_DATE, SELECT_UPDATE_CYCLE, SERVICE_ACCOUNT_NAME as SERVICE_ACCOUNT_NAME_MSG, SERVICE_ACCOUNT_SECRET as SERVICE_ACCOUNT_SECRET_MSG, UPLOAD_FILE, API_KEY } from 'Constants/GlobalConstant/ValidationMessage';
import { ACCESSTOKEN, ACCOUNT, APP_ID, END_DATE, INSIGHTS, MEDIA, PROPERTY, SECRECT_ID, SECRETKEY, SERVICE_ACCOUNT_NAME, SERVICE_ACCOUNT_SECRET, SITE, START_DATE } from 'Constants/GlobalConstant/Placeholders';
import { LIST_NAME_RULES } from 'Constants/GlobalConstant/Rules';
import { get_matomoinsights, get_matomosites, get_webhooknameExist } from 'Reducers/preferences/DataExchange/request';
import {
    checkFriendlyNameExists,
    getOrganizationList,
    dataExchange_get_tables_from_DB,
    getWistiaMedia,
} from 'Reducers/remoteDataSource/request';
// const updateCycle = [
//     { name: 'Select', id: 0 },
//     { name: 'Immediate', id: 1 },
//     { name: '15 minutes', id: 2 },
//     { name: '30 minutes', id: 3 },
//     { name: 'Hourly', id: 4 },
//     { name: 'Daily', id: 5 },
//     { name: 'Weekly', id: 6 },
//     { name: 'Monthly', id: 7 },
// ];
const adobeanalytics = {
    name: 'adobeAnalytics',
    fields: [
        {
            name: 'Usernametoken',
            type: 'text',
            placeHolder: 'User name token',
            value: '',
            size: 4,
        },
        {
            name: 'apiUsername',
            placeHolder: 'API user name',
            value: '',
            type: 'text',
            size: 4,
        },
        {
            name: 'apiPassword',
            placeHolder: 'API password',
            value: '',
            type: 'text',
            size: 4,
        },
    ],
};

const webtrends = {
    name: 'webtrends',
    fields: [
        {
            name: 'Usernametoken',
            type: 'text',
            placeHolder: 'User name token',
            value: '',
            size: 4,
        },
        {
            name: 'apiUsername',
            placeHolder: 'API user name',
            value: '',
            type: 'text',
            size: 4,
        },
    ],
};

const googleanalytics = {
    name: 'Google Analytics',
    fields: [
        {
            name: 'friendlyName',
            placeHolder: 'Friendly name',
            value: '',
            type: 'friendlyName',
            size: 4,
            rules: LIST_NAME_RULES(INSTANCE_NAME),
            required: true,
            requiredMsg: INSTANCE_NAME,
            apiConnection: checkFriendlyNameExists,
            onkey: charNumUnderScore,
        },
        {
            name: 'jsonFilePath',
            placeHolder: 'jsonFilePath',
            value: '',
            type: 'upload',
            size: 10485760,
            required: true,
            requiredMsg: UPLOAD_FILE,
        },
        {
            name: 'property',
            placeHolder: PROPERTY,
            value: '',
            type: 'dropdown',
            // size: 4,
            // rules: '',
            required: true,
            requiredMsg: PROPERTY,
            apiConnection: '',
        },
    ],
};

const googletagmanager = {
    name: 'GoogleTagManager',
    fields: [
        {
            name: 'friendlyName',
            placeHolder: 'Friendly name',
            value: '',
            type: 'friendlyName',
            size: 4,
            rules: LIST_NAME_RULES(INSTANCE_NAME),
            required: true,
            requiredMsg: INSTANCE_NAME,
            apiConnection: checkFriendlyNameExists,
            onkey: charNumUnderScore,
        },
        {
            name: 'jsonFilePath',
            placeHolder: 'jsonFilePath',
            value: '',
            type: 'upload',
            size: 10485760,
            required: true,
            requiredMsg: UPLOAD_FILE,
        },
        {
            name: 'account',
            placeHolder: ACCOUNT,
            value: '',
            type: 'dropdown',
            // size: 4,
            // rules: '',
            required: true,
            requiredMsg: ACCOUNTS,
            apiConnection: '',
        },
    ],
};

const AndroidPhone = [
    {
        name: 'Serviceaccountemail',
        placeHolder: 'Client secret ID',
        value: '',
        type: '',
        lable: 'Service account email',
    },
    {
        name: 'Appkey',
        placeHolder: 'App key',
        value: '',
        type: 'text',
        lable: 'App key',
    },
    ,
    {
        name: 'App secret ID',
        placeHolder: 'App secret ID',
        value: '',
        type: 'text',
        lable: 'App secret ID',
    },
];

const mobileApp = [
    {
        name: 'appaName',
        placeHolder: 'Select',
        value: '',
        type: 'select',
        lable: 'App name',
    },
    {
        name: 'googleMobileAnalytics',
        placeHolder: 'Google mobile analytics',
        value: '',
        type: 'text',
        lable: 'Analytics platform',
    },
];

const mobileAppAalytics = [
    {
        headName: 'Mobile App analytics',
        fields: mobileApp,
    },
    {
        headName: 'Android phone',
        fields: AndroidPhone,
    },
    {
        headName: 'Android tab',
        fields: AndroidPhone,
    },
    {
        headName: 'iPhone',
        fields: AndroidPhone,
    },
    {
        headName: 'iPad',
        fields: AndroidPhone,
    },
];

const crm = {
    name: 'crm',
    fields: [
        {
            name: 'friendlyName',
            type: 'friendlyName',
            placeHolder: '-- Friendly name-- ',
            value: '',
            size: 4,
        },
        {
            name: 'api',
            placeHolder: 'API',
            value: '',
            type: 'text',
            size: 4,
        },
        {
            name: 'User name',
            placeHolder: 'User name',
            value: '',
            type: 'text',
            size: 4,
        },
        {
            name: 'password',
            placeHolder: 'Password',
            value: '',
            type: 'text',
            size: 4,
        },
    ],
};

const siebel = {
    name: 'siebel',
    fields: [
        {
            name: 'hostAddress',
            type: 'text',
            placeHolder: 'Host address',
            value: '',
            size: 4,
        },
        {
            name: 'userName',
            placeHolder: 'Username',
            value: '',
            type: 'text',
            size: 4,
        },
        {
            name: 'password',
            placeHolder: 'Password',
            value: '',
            type: 'password',
            size: 4,
        },
    ],
};

const salesforce = {
    name: 'salesforce',
    fields: [
        {
            name: 'friendlyName',
            type: 'friendlyName',
            placeHolder: '-- Friendly name-- ',
            value: '',
            size: 4,
        },
        {
            name: 'api',
            placeHolder: 'API',
            value: 'https://na16.salesforce.com/services/data/v36.0/',
            type: 'text',
            size: 4,
        },
        {
            name: 'userid',
            placeHolder: 'userid',
            value: '',
            type: 'userid',
            size: 4,
        },
        {
            name: 'password',
            placeHolder: 'password',
            value: '*********',
            type: 'password',
            size: 4,
        },
    ],
};

const common = {
    apiurl: {
        name: 'apiurl',
        type: 'text',
        placeHolder: 'API URL',
        value: '',
        size: 4,
    },
    api_username: {
        name: 'apiusername',
        placeHolder: 'API username',
        value: ' ',
        type: 'text',
        size: 4,
    },
    api_password: {
        name: 'apiPassword',
        placeHolder: 'API password',
        value: '',
        type: 'password',
        size: 4,
    },
    account: {
        name: 'Account',
        placeHolder: 'Account',
        value: '',
        type: 'text',
        size: 3,
    },
    api_token: {
        name: 'apiToken',
        placeHolder: 'API token',
        value: '',
        type: 'text',
        size: 4,
    },
    api_key: {
        name: 'apikey',
        placeHolder: 'API key',
        value: '',
        type: 'text',
        size: 4,
    },
    password: {
        name: 'password',
        placeHolder: 'password',
        value: '*********',
        type: 'password',
        size: 4,
    },
    url: {
        name: 'url',
        placeHolder: 'URL',
        value: '',
        type: 'text',
        size: 4,
    },
    secrect_key: {
        name: 'Secret key',
        placeHolder: 'Secret key',
        value: '',
        type: 'text',
        size: 4,
    },
    application_name: {
        name: 'Application name',
        placeHolder: 'Application name',
        value: '',
        type: 'text',
        size: 4,
    },
};
const bigcommerce = {
    name: 'salesforce',
    fields: [
        common.apiurl,
        {
            name: 'apiusername',
            placeHolder: 'API username',
            value: 'https://na16.salesforce.com/services/data/v36.0/',
            type: 'text',
            size: 4,
        },
        common.api_token,
    ],
};
const shopify = {
    name: 'shopify',
    fields: [common.apiurl, common.api_username, common.api_password],
};
const magento = {
    name: 'magento',
    fields: [
        common.apiurl,
        common.api_username,
        common.api_password,
        {
            name: 'Consumerkey',
            placeHolder: 'Consumer key',
            value: '',
            type: 'password',
            size: 3,
        },
        {
            name: 'Consumersecretkey',
            placeHolder: 'Consumer secret key',
            value: '',
            type: 'password',
            size: 3,
        },
    ],
};

const prestashop = {
    name: 'magento',
    fields: [common.apiurl, common.account, common.password],
};
const saphybris = {
    name: 'magento',
    fields: [googleanalytics.fields[0], bigcommerce.fields[0], bigcommerce.fields[1], common.api_password],
};
const pinterest = {
    name: 'pinterest',
    fields: [
        {
            name: 'Pinterestid',
            placeHolder: 'Pinterest ID',
            value: '',
            type: 'text',
            size: 6,
        },
        {
            name: 'Access Key',
            placeHolder: 'Access Key',
            value: '',
            type: 'text',
            size: 6,
        },
    ],
};
const instagram = {
    name: 'instagram',
    fields: [
        {
            name: 'Instagram ID',
            placeHolder: 'Instagram ID',
            value: '',
            type: 'text',
            size: 6,
        },
        {
            name: 'Access Key',
            placeHolder: 'Access Key',
            value: '',
            type: 'text',
            size: 6,
        },
    ],
};
const youtube = {
    name: 'pinterest',
    fields: [
        {
            name: 'Youtube ID',
            placeHolder: 'Youtube ID',
            value: '',
            type: 'text',
            size: 6,
        },
        {
            name: 'Access Key',
            placeHolder: 'Access Key',
            value: '',
            type: 'text',
            size: 6,
        },
    ],
};
const vuer = {
    name: 'vuer',
    fields: [
        {
            name: 'Vuer name',
            placeHolder: 'Vuer name',
            value: '',
            type: 'text',
            size: 4,
        },
        common.url,
        common.secrect_key,
    ],
};
const adobeaudiencemanager = {
    name: 'adobeaudiencemanager',
    fields: [
        {
            name: 'IP Address',
            placeHolder: 'IP Address',
            value: 'xxx.x.xx.x',
            type: 'text',
            size: 4,
        },
        {
            name: 'Port number',
            placeHolder: 'Port number',
            value: '99',
            type: 'text',
            size: 4,
        },
        {
            name: 'Database name',
            placeHolder: 'Database name',
            value: 'Customer Communication',
            type: 'text',
            size: 4,
        },
        {
            name: 'Instance name',
            placeHolder: 'Instance name',
            value: 'Customer_Core',
            type: 'text',
            size: 4,
        },
        {
            name: 'User name',
            placeHolder: 'User name',
            value: 'theuserid',
            type: 'text',
            size: 4,
        },
        {
            name: 'Password',
            placeHolder: 'Password',
            value: '******',
            type: 'text',
            size: 4,
        },
    ],
};
const neustar = {
    name: 'neustar',
    fields: [
        {
            name: 'API url',
            placeHolder: 'API URL',
            value: 'api.crwdcntrl.net',
            type: 'text',
            size: 4,
        },
        {
            name: 'API username',
            placeHolder: 'API username',
            value: 'theuserid',
            type: 'text',
            size: 4,
        },
        {
            name: 'API password',
            placeHolder: 'API password',
            value: 'theuserid',
            type: 'text',
            size: 4,
        },
        {
            name: 'Consumer key',
            placeHolder: 'Consumer key',
            value: 'consumer_key',
            type: 'password',
            size: 4,
        },
        {
            name: 'Consumer secret key',
            placeHolder: 'Consumer secret key',
            value: 'Consumer secret key',
            type: 'password',
            size: 4,
        },
    ],
};
const kbm = {
    name: 'kbm',
    fields: neustar.fields,
};
const bluekai = {
    name: 'bluekai',
    fields: neustar.fields,
};
const lotame = {
    name: 'lotame',
    fields: neustar.fields,
};
const exelate = {
    name: 'exelate',
    fields: neustar.fields,
};
const acxiom = {
    name: 'acxiom',
    fields: adobeaudiencemanager.fields,
};
const dataaxle = {
    name: 'dataaxle',
    fields: [
        {
            name: 'IP Address',
            placeHolder: 'IP Address',
            value: 'xxx.x.xx.x',
            type: 'text',
            size: 4,
        },
        {
            name: 'Port number',
            placeHolder: 'Port number',
            value: '99',
            type: 'text',
            size: 4,
        },
        {
            name: 'Database name',
            placeHolder: 'Database name',
            value: 'Customer Communication',
            type: 'text',
            size: 4,
        },
        {
            name: 'Instance name',
            placeHolder: 'Instance name',
            value: 'Customer_Core',
            type: 'text',
            size: 4,
        },
        {
            name: 'User name',
            placeHolder: 'User name',
            value: 'theuserid',
            type: 'text',
            size: 4,
        },
        {
            name: 'Password',
            placeHolder: 'Password',
            value: '******',
            type: 'text',
            size: 4,
        },
    ],
};

const liveramp = {
    name: 'liveramp',
    fields: [
        {
            name: 'IP Address',
            placeHolder: 'IP Address',
            value: 'xxx.x.xx.x',
            type: 'text',
            size: 4,
        },
        {
            name: 'Port number',
            placeHolder: 'Port number',
            value: '99',
            type: 'text',
            size: 4,
        },
        {
            name: 'Database name',
            placeHolder: 'Database name',
            value: 'Customer Communication',
            type: 'text',
            size: 4,
        },
        {
            name: 'Instance name',
            placeHolder: 'Instance name',
            value: 'Customer_Core',
            type: 'text',
            size: 4,
        },
        {
            name: 'User name',
            placeHolder: 'User name',
            value: 'theuserid',
            type: 'text',
            size: 4,
        },
        {
            name: 'Password',
            placeHolder: 'Password',
            value: '******',
            type: 'text',
            size: 4,
        },
    ],
};
const versium = {
    name: 'liveramp',
    fields: [
        {
            name: 'IP Address',
            placeHolder: 'IP Address',
            value: 'xxx.x.xx.x',
            type: 'text',
            size: 4,
        },
        {
            name: 'Port number',
            placeHolder: 'Port number',
            value: '99',
            type: 'text',
            size: 4,
        },
        dataaxle.fields[2],
    ],
};
const webex = {
    name: 'webex',
    fields: [
        {
            name: 'Site name',
            placeHolder: 'Site name',
            value: 'xxx.x.xx.x',
            type: 'text',
            size: 4,
        },
        {
            name: 'Partner ID',
            placeHolder: 'Partner ID',
            value: '99',
            type: 'text',
            size: 4,
        },
        {
            name: 'Webex login ID',
            placeHolder: 'Webex login ID',
            value: ' ',
            type: 'text',
            size: 4,
        },
        {
            name: 'password',
            placeHolder: 'password',
            value: '',
            type: 'password',
            size: 4,
        },
    ],
};
const evenbrite = {
    name: 'evenbrite',
    fields: [
        {
            name: 'User login ID',
            placeHolder: 'User login ID',
            value: '',
            type: 'text',
            size: 4,
        },
        common.password,
    ],
};
const gotomeeting = {
    name: 'gotomeeting',
    fields: [
        {
            name: 'Meeting ID',
            placeHolder: 'Meeting ID',
            value: '',
            type: 'text',
            size: 4,
        },
        common.password,
        common.api_key,
    ],
};

const webhook = {
    name: 'webhook',
    fields: [
        {
            name: 'webHookName',
            placeHolder: 'Webhook name',
            value: '',
            type: 'text',
            size: 4,
            rules: LIST_NAME_RULES(INSTANCE_NAME),
            required: true,
            requiredMsg: 'Pls name',
            apiConnection: get_webhooknameExist,
            onkey: charNumUnderScore,
        },
        {
            name: 'webHookURL',
            placeHolder: 'URL',
            value: '',
            type: 'text',
            size: 4,
            rules: LIST_NAME_RULES(ENTER_URL),
            required: true,
            requiredMsg: 'Pls url',
            apiConnection: '',
            onkey: '',
        },
        {
            name: 'secretKey',
            placeHolder: SECRETKEY,
            value: '',
            type: 'password',
            size: 4,
            rules: LIST_NAME_RULES(ENTER_PASSWORD),
            required: true,
            requiredMsg: 'Pls se',
            apiConnection: '',
            onkey: '',
        },
        {
            name: 'description',
            placeHolder: 'Description',
            value: '',
            type: 'textArea',
            size: 4,
            rules: '',
            required: true,
            requiredMsg: 'Pls des',
            apiConnection: '',
            onkey: '',
        },
    ],
};
const ZeroBounce = {
    name: 'ZeroBounce',
    fields: [
        {
            name: 'friendlyName',
            placeHolder: 'Friendly name',
            value: '',
            type: 'text',
            size: 6,
            rules: LIST_NAME_RULES(INSTANCE_NAME),
            required: true,
            requiredMsg: 'Pls name',
            apiConnection: get_webhooknameExist,
            onkey: charNumUnderScore,
        }, 
        {
            name: 'apiKey',
           placeHolder: 'Api key',
            value: '',
            type: 'password',
            size: 6,
            rules: LIST_NAME_RULES(ENTER_PASSWORD),
            required: true,
            requiredMsg: 'Pls se',
            apiConnection: '',
            onkey: '',
        }, 
    ],
};
const eventbrite = {
    name: 'eventbrite',
    fields: [
        {
            name: 'friendlyName',
            placeHolder: 'Friendly name',
            value: '',
            type: 'friendlyName',
            size: 4,
            rules: LIST_NAME_RULES(INSTANCE_NAME),
            required: true,
            requiredMsg: INSTANCE_NAME,
            apiConnection: checkFriendlyNameExists,
            onkey: charNumUnderScore,
        },
        {
            name: 'authToken',
            placeHolder: 'Auth token',
            value: '',
            type: 'text',
            size: 4,
            rules: { required: AUTHTOKEN },
            required: true,
            requiredMsg: AUTHTOKEN,
            apiConnection: getOrganizationList,
            onkey: () => {},
        },
        {
            name: 'organizationName',
            placeHolder: 'Organization name',
            value: '',
            type: 'dropdown',
            size: 4,
            rules: '',
            required: true,
            requiredMsg: ORGANIZAION_NAME,
            apiConnection: '',
        },
        {
            name: 'updateCycle',
            placeHolder: 'Update cycle',
            value: [],
            type: 'dropdown',
            size: 4,
            required: true,
            requiredMsg: SELECT_UPDATE_CYCLE,
        },
    ],
};
const eventzilla = {
    name: 'eventzilla',
    fields: [
        {
            name: 'friendlyName',
            placeHolder: 'Friendly name',
            value: '',
            type: 'friendlyName',
            size: 4,
            rules: LIST_NAME_RULES(INSTANCE_NAME),
            required: true,
            requiredMsg: INSTANCE_NAME,
            apiConnection: checkFriendlyNameExists,
            onkey: charNumUnderScore,
        },
        {
            name: 'apiKey',
            placeHolder: 'Api key',
            value: '',
            type: 'text',
            size: 4,
            rules: LIST_NAME_RULES(API_KEY),
            required: true,
            requiredMsg: API_KEY,
            apiConnection: dataExchange_get_tables_from_DB,
            onkey: () => {},
        },
        {
            name: 'eventZillaTable',
            placeHolder: 'Table name',
            value: '',
            type: 'dropdown',
            size: 4,
            rules: '',
            required: true,
            // requiredMsg: ORGANIZAION_NAME,
            apiConnection: '',
        },
        {
            name: 'eventZillaColumn',
            placeHolder: 'Column name',
            value: '',
            type: 'dropdown',
            size: 4,
            rules: '',
            required: true,
            // requiredMsg: ORGANIZAION_NAME,
            apiConnection: '',
        },
    ],
};
const digipop = {
    name: 'digipop',
    fields: [
        {
            name: 'friendlyName',
            placeHolder: 'Friendly name',
            value: '',
            type: 'friendlyName',
            size: 4,
            rules: LIST_NAME_RULES(INSTANCE_NAME),
            required: true,
            requiredMsg: 'Pls name',
            // apiConnection: get_DigipopnameExist,
            apiConnection: checkFriendlyNameExists,
            onkey: charNumUnderScore,
        },
        {
            name: 'userName',
            placeHolder: 'User name',
            value: '',
            type: 'text',
            size: 4,
            rules: LIST_NAME_RULES(ENTER_URL),
            required: true,
            requiredMsg: 'Pls url',
            apiConnection: '',
            onkey: '',
        },
        {
            name: 'password',
            placeHolder: 'Password',
            value: '',
            type: 'password',
            size: 4,
            rules: LIST_NAME_RULES(ENTER_PASSWORD),
            required: true,
            requiredMsg: 'Pls se',
            apiConnection: '',
            onkey: '',
        },
    ],
};
const callcenter = {
    name: 'callcenter',
    fields: [
        {
            name: 'webHookName',
            placeHolder: 'Callcenter name',
            value: '',
            type: 'text',
            size: 4,
            rules: LIST_NAME_RULES(INSTANCE_NAME),
            required: true,
            requiredMsg: 'Pls name',
            apiConnection: get_webhooknameExist,
            onkey: charNumUnderScore,
        },
        {
            name: 'webHookURL',
            placeHolder: 'URL',
            value: '',
            type: 'text',
            size: 4,
            rules: LIST_NAME_RULES(ENTER_URL),
            required: true,
            requiredMsg: 'Pls url',
            apiConnection: '',
            onkey: charNumUnderScore,
        },
        {
            name: 'secretKey',
            placeHolder: SECRETKEY,
            value: '',
            type: 'password',
            size: 4,
            rules: LIST_NAME_RULES(ENTER_PASSWORD),
            required: true,
            requiredMsg: 'Pls se',
            apiConnection: '',
            onkey: '',
        },
        {
            name: 'description',
            placeHolder: 'Description',
            value: '',
            type: 'textArea',
            size: 4,
            rules: '',
            required: true,
            requiredMsg: 'Pls des',
            apiConnection: '',
            onkey: '',
        },
    ],
};
const api = {
    name: 'api',
    fields: [
        {
            name: 'Application/Source',
            placeHolder: 'Application/Source',
            value: '',
            type: 'text',
            size: 4,
        },
        common.apiurl,
        common.api_key,
    ],
};
const microsoftazure = {
    name: 'microsoftazure',
    fields: api.fields,
};

const calendly = {
    name: 'calendly',
    fields: [common.apiurl, common.api_username, common.api_password],
};
const pos = {
    name: 'pos',
    fields: [
        {
            name: 'IP Address',
            placeHolder: 'IP Address',
            value: '',
            type: 'text',
            size: 4,
        },
        {
            name: 'Port number',
            placeHolder: 'Port number',
            value: '',
            type: 'text',
            size: 4,
        },
        {
            name: 'TopicName',
            placeHolder: 'TopicName',
            value: 'Customer Communication',
            type: 'text',
            size: 4,
        },
        {
            name: 'Partition',
            placeHolder: 'Partition',
            value: '',
            type: 'text',
            size: 4,
        },
        {
            name: 'OffSet',
            placeHolder: 'OffSet',
            value: '',
            type: 'text',
            size: 4,
        },
        {
            name: 'DataMode',
            placeHolder: 'DataMode',
            value: '',
            type: 'text',
            size: 4,
        },
    ],
};
const kiosk = {
    name: 'kiosk',
    fields: pos.fields,
};

// Data base server

const sqlserver = {
    name: 'sqlserver',
    fields: dataaxle.fields,
};
const mysql = {
    name: 'mysql',
    fields: dataaxle.fields,
};
const oracle = {
    name: 'oracle',
    fields: dataaxle.fields,
};

//digital asset
const data_asset = [common.application_name, common.apiurl, common.api_username, common.api_password];

const informatica = {
    name: 'informatica',
    fields: data_asset,
};
const reversand = {
    name: 'reversand',
    fields: data_asset,
};
const stibosystem = {
    name: 'stibosystem',
    fields: data_asset,
};
const orchestra = {
    name: 'orchestra',
    fields: data_asset,
};
const pimcore = {
    name: 'pimcore',
    fields: data_asset,
};
const enterworks = {
    name: 'enterworks',
    fields: data_asset,
};
const marcomcentral = {
    name: 'marcomcentral',
    fields: data_asset,
};
const workfront = {
    name: 'workfront',
    fields: data_asset,
};
const webdam = {
    name: 'webdam',
    fields: data_asset,
};
const widen = {
    name: 'widen',
    fields: data_asset,
};
const bynder = {
    name: 'bynder',
    fields: data_asset,
};
// const saphybris  ={
//     name : "",
//     fields : data_asset
// }
const drupal = {
    name: 'drupal',
    fields: data_asset,
};
const sitecore = {
    name: 'sitecore',
    fields: data_asset,
};
const kentico = {
    name: 'kentico',
    fields: data_asset,
};
const opentext = {
    name: 'opentext',
    fields: data_asset,
};
const sdl = {
    name: 'sdl',
    fields: data_asset,
};
const adobexperiencemanager = {
    name: 'adobexperiencemanager',
    fields: data_asset,
};
const hotjar = {
    name: 'hotjar',
    fields: data_asset,
};
const unbounce = {
    name: 'unbounce',
    fields: data_asset,
};
const sensor = [
    { name: '-- Protocol --', id: 0 },
    { name: 'MQTT / TCP', id: 1 },
    { name: 'MQTT / WebSockets', id: 2 },
];
const mqtt = {
    name: 'mqtt',
    fields: [
        {
            name: 'Client name',
            placeHolder: 'Client name',
            value: '',
            type: 'text',
            size: 4,
        },
        {
            name: 'Client ID',
            placeHolder: 'Client ID',
            value: '',
            type: 'text',
            size: 4,
        },
        {
            name: 'protocal',
            placeHolder: '-- Protocol --',
            value: sensor,
            type: 'dropdown',
            size: 4,
        },
        {
            name: 'Hostname',
            placeHolder: 'Hostname',
            value: '',
            type: 'text',
            size: 4,
        },
        {
            name: 'User name',
            placeHolder: 'User name',
            value: '',
            type: 'text',
            size: 4,
        },
        {
            name: 'password',
            placeHolder: 'password',
            value: '',
            type: 'password',
            size: 4,
        },
        {
            name: 'KeepAlive (seconds)',
            placeHolder: 'KeepAlive (seconds)',
            value: '',
            type: 'text',
            size: 4,
        },
        {
            name: 'Connect timeout (milliseconds)',
            placeHolder: 'Connect timeout (milliseconds)',
            value: '',
            type: 'text',
            size: 4,
        },
        {
            name: 'Reconnect period (milliseconds)',
            placeHolder: 'Reconnect period (milliseconds)',
            value: '',
            type: 'text',
            size: 4,
        },
        {
            name: 'Auto connect on app launch',
            placeHolder: 'Auto connect on app launch',
            value: '',
            type: 'checkbox',
            size: 4,
        },
        {
            name: 'Broker is MQTT v3.1.1 compliant',
            placeHolder: 'Broker is MQTT v3.1.1 compliant',
            value: '',
            type: 'checkbox',
            size: 4,
        },
    ],
};

const cnn = {
    name: 'cnn',
    fields: data_asset,
};
const toi = {
    name: 'toi',
    fields: data_asset,
};

const thehindu = {
    name: 'thehindu',
    fields: data_asset,
};

const viketan = {
    name: 'viketan',
    fields: data_asset,
};

const ndtv = {
    name: 'viketan',
    fields: data_asset,
};

const news18 = {
    name: 'news18',
    fields: data_asset,
};

const abb = {
    name: 'abb',
    fields: data_asset,
};

const mixpanel = {
    name: 'mixpanel',
    fields: [
        {
            name: 'friendlyName',
            placeHolder: 'Friendly name',
            value: '',
            type: 'friendlyName',
            size: 4,
            rules: LIST_NAME_RULES(INSTANCE_NAME),
            required: true,
            requiredMsg: INSTANCE_NAME,
            apiConnection: checkFriendlyNameExists,
            onkey: charNumUnderScore,
        },
        {
            name: 'DomainName',
            placeHolder: 'Domain name',
            value: '',
            type: 'text',
            lable: 'Domain name',
            required: DOMAIN_URL,
            head: 'RESUL analytics',
            apiConnection: '',
        },
        {
            name: 'Serviceaccountname',
            placeHolder: SERVICE_ACCOUNT_NAME,
            value: '',
            type: 'text',
            required: SERVICE_ACCOUNT_NAME_MSG,
            lable: 'Service account name',
            apiConnection: '',
        },
        {
            name: 'ServiceAccountSecret',
            placeHolder: SERVICE_ACCOUNT_SECRET,
            value: '',
            type: 'text',
            required: SERVICE_ACCOUNT_SECRET_MSG,
            lable: 'service account secret',
            apiConnection: '',
        },
        {
            name: 'updateCycle',
            placeHolder: 'Update cycle',
            value: [],
            type: 'dropdown',
            size: 4,
            required: true,
            requiredMsg: SELECT_UPDATE_CYCLE,
            apiConnection: '',
        },
    ],
};

const vimeo = {
    name: 'vimeo',
    fields: [
        {
            name: 'friendlyName',
            placeHolder: 'Friendly name',
            value: '',
            type: 'friendlyName',
            size: 4,
            rules: LIST_NAME_RULES(INSTANCE_NAME),
            required: true,
            requiredMsg: INSTANCE_NAME,
            apiConnection: checkFriendlyNameExists,
            onkey: charNumUnderScore,
        },
        {
            name: 'accesstoken',
            type: 'text',
            placeHolder: ACCESSTOKEN,
            value: '',
            required: ACCESSTOKEN_MSG,
            viewEye: false,
            apiConnection: '',
        },
    ],
};

const wistia = {
    name: 'wistia',
    fields: [
        {
            name: 'friendlyName',
            placeHolder: 'Friendly name',
            value: '',
            type: 'friendlyName',
            size: 4,
            rules: LIST_NAME_RULES(INSTANCE_NAME),
            required: true,
            requiredMsg: INSTANCE_NAME,
            apiConnection: checkFriendlyNameExists,
            onkey: charNumUnderScore,
        },
        {
            name: 'accesstoken',
            type: 'text',
            placeHolder: ACCESSTOKEN,
            value: '',
            required: ACCESSTOKEN_MSG,
            viewEye: false,
            apiConnection: getWistiaMedia,
        },
        {
            name: 'media',
            placeHolder: MEDIA,
            value: '',
            type: 'dropdown',
            required: true,
            requiredMsg: MEDIA,
            apiConnection: '',
        },
        {
            name: 'updateCycle',
            placeHolder: 'Update cycle',
            value: [],
            type: 'dropdown',
            size: 4,
            required: true,
            requiredMsg: SELECT_UPDATE_CYCLE,
            apiConnection: '',
        },
    ],
};

const matomo = {
    name: 'Matomo',
    fields: [
        {
            name: 'friendlyName',
            placeHolder: 'Friendly name',
            value: '',
            type: 'friendlyName',
            size: 4,
            rules: LIST_NAME_RULES(INSTANCE_NAME),
            required: true,
            requiredMsg: INSTANCE_NAME,
            apiConnection: checkFriendlyNameExists,
            onkey: charNumUnderScore,
        },
        {
            name: 'DomainName',
            placeHolder: 'Domain name',
            value: '',
            type: 'text',
            lable: 'Domain name',
            required: DOMAIN_URL,
            head: 'RESUL analytics',
            apiConnection: '',
        },
        {
            name: 'accesstoken',
            type: 'text',
            placeHolder: ACCESSTOKEN,
            value: '',
            required: ACCESSTOKEN_MSG,
            viewEye: false,
            apiConnection: get_matomosites,
        },
        {
            name: 'sitename',
            placeHolder: SITE,
            value: '',
            type: 'dropdown',
            required: true,
            requiredMsg: SITE,
            apiConnection: get_matomoinsights,
        },
        {
            name: 'insights',
            placeHolder: INSIGHTS,
            value: '',
            type: 'dropdown',
            required: true,
            requiredMsg: INSIGHTS,
            apiConnection: '',
        },
        {
            name: 'from_date',
            type: 'date',
            placeHolder: START_DATE,
            value: '',
            required: SELECT_START_DATE,
            viewEye: false,
            apiConnection: '',
        },
        {
            name: 'to_date',
            type: 'date',
            placeHolder: END_DATE,
            value: '',
            required: SELECT_END_DATE,
            viewEye: false,
            apiConnection: '',
        },
        // {
        //     name: 'updateCycle',
        //     placeHolder: 'Update cycle',
        //     value: [],
        //     type: 'dropdown',
        //     size: 4,
        //     required: true,
        //     requiredMsg: SELECT_UPDATE_CYCLE,
        // },
    ],
};

const facebook = {
    name: 'facebook',
    fields: [
        {
            name: 'appId',
            placeHolder: APP_ID,
            value: '',
            type: 'text',
            required: true,
            requiredMsg: APP_ID,
            apiConnection: '',
        },
        {
            name: 'appSecret',
            type: 'text',
            placeHolder: SECRECT_ID,
            value: '',
            required: true,
            requiredMsg: ENTER_SECRECT_ID,
            viewEye: false,
            apiConnection: '',
        },
    ],
};
const facebookads = {
    name: 'facebookAds',
    fields: [
        {
            name: 'appId',
            placeHolder: APP_ID,
            value: '',
            type: 'text',
            required: true,
            requiredMsg: APP_ID,
            apiConnection: '',
        },
        {
            name: 'appSecret',
            type: 'text',
            placeHolder: SECRECT_ID,
            value: '',
            required: true,
            requiredMsg: ENTER_SECRECT_ID,
            viewEye: false,
            apiConnection: '',
        },
    ],
};
const instagramOauth = {
    name: 'instagram',
    fields: [
        {
            name: 'appId',
            placeHolder: APP_ID,
            value: '',
            type: 'text',
            required: true,
            requiredMsg: APP_ID,
            apiConnection: '',
        },
        {
            name: 'appSecret',
            type: 'text',
            placeHolder: SECRECT_ID,
            value: '',
            required: true,
            requiredMsg: ENTER_SECRECT_ID,
            viewEye: false,
            apiConnection: '',
        },
    ],
};

export const connectFieldsLists = {
    cnn,
    toi,
    viketan,
    news18,
    abb,
    ndtv,
    thehindu,
    adobeanalytics,
    webtrends,
    'google analytics': googleanalytics,
    'google tag manager': googletagmanager,
    mobileAppAalytics,
    crm,
    siebel,
    salesforce,
    sugarcrm: siebel,
    bigcommerce,
    shopify,
    magento,
    prestashop,
    pinterest,
    youtube,
    vuer,
    adobeaudiencemanager,
    neustar,
    kbm,
    bluekai,
    lotame,
    exelate,
    acxiom,
    dataaxle,
    liveramp,
    versium,
    webex,
    gotomeeting,
    evenbrite,
    informatica,
    reversand,
    stibosystem,
    orchestra,
    pimcore,
    enterworks,
    marcomcentral,
    workfront,
    webdam,
    widen,
    bynder,
    saphybris,
    drupal,
    sitecore,
    kentico,
    opentext,
    sdl,
    adobexperiencemanager,
    hotjar,
    unbounce,
    webhook,
    callcenter,
    api,
    microsoftazure,
    calendly,
    kiosk,
    pos,
    sqlserver,
    mysql,
    oracle,
    mqtt,
    digipop,
    eventbrite,
    eventzilla,
    mixpanel,
    vimeo,
    wistia,
    matomo,
    facebook,
    instagram: instagramOauth,
    'facebook ads': facebookads,
    'zero bounce':  ZeroBounce
};

export const resulticksAnalytics = [
    {
        name: 'DomainName',
        placeHolder: 'Domain name',
        value: 'test url',
        type: 'text',
        lable: 'Domain name',
        head: 'RESUL analytics',
    },
];

export const adobeTabManagement = [
    {
        name: 'Tag name',
        placeHolder: 'Tag name',
        value: '',
        type: 'text',
        lable: 'Tag name',
        head: 'Adobe tag management',
    },
    {
        name: 'Tag type',
        placeHolder: 'Tag type',
        value: 'Custom HTML tag',
        type: 'text',
        lable: 'Tag type',
    },
    {
        name: 'User name',
        placeHolder: 'User name',
        value: '',
        type: 'text',
        lable: 'User name',
    },
    {
        name: 'Password',
        placeHolder: 'Password',
        value: '',
        type: 'password',
        lable: 'Password',
    },
];

// selva murugan table attr constants

export const ODBC_MYSQL_STATE = {
    ipAddress: '',
    portNumber: '',
    databaseName: '',
    instanceName: '',
    userName: '',
    password: '',
};

export const GOOGLE_BQ_QUERY = {
    friendlyName: '',
    fileName: '',
};

export const COLUMN_DATA_DEDUPE = [
    { id: 1, name: 'Name', status: true, filter: 'text' },
    { id: 2, name: 'EmailID', status: false, filter: 'text' },
    { id: 3, name: 'MobileNo', status: true, filter: 'text' },
    { id: 4, name: 'Gender', status: true, filter: 'text' },
    { id: 5, name: 'City', status: false, filter: 'text' },
];

export const CONNECTION_TYPE = [
    { type: 'Select', typeId: 0 },
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

export const numberOfDays = [
    { type: 'Select days', typeId: 0 },
    { type: 'ImmediateLast 30 days', typeId: 1 },
    { type: 'Last 60 days', typeId: 2 },
    { type: 'Last 90 days', typeId: 3 },
];

export const checkUpdate = [{ type: 'Modified date & time', typeId: 0 }];
