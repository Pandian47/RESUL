import { ADHOCATTRIBUTES, MATCHLISTATTRIBUTES, MAX_LENGTH, MAX_LENGTH10, MAX_LENGTH100, MAX_LENGTH200, MAX_LENGTH255, MAX_LENGTH50, MAX_LENGTH500, MIN_LENGTH, SEEDLISTATTRIBUTES, SEEDLISTAUDIENCE, TARGETATTRIBUTES } from 'Constants/GlobalConstant/Regex';
// COMPONENTS VALIDATION MESSAGES
export const ENTER_CAPTCHA = 'Enter captcha';
export const TYPE_IS_REQUIRED = 'Type is required';
export const THIS_FIELD_IS_REQUIRED = 'This field is required';

//VALIDATION MESSAGE
export const ENTER_COMPANY = 'Enter company';
export const ENTER_FOOTER = 'Enter email footer name';
export const ENTER_WA_FOOTER = 'Enter footer';
export const ENTER_WA_HEADER = 'Enter header';
export const ENTER_PARENT_COMPANY = 'Enter parent company';
export const EMAIL_ID_ALREADY_EXIST = 'Email address already exists';
export const ENTER_VALID_EMAIL_ADDRESS = 'Enter a valid email address';
export const ENTER_VALID_EMAIL = 'Business email is required';
export const ENTER_VALID_PASSWORD = 'Enter a valid password';
export const ENTER_VALID_MOBILE_NUMBER = 'Enter a valid mobile number';
export const ENTER_CORRECT_ANSWER = 'Enter the correct answer';
export const ENTER_ANSWER = 'Enter answer';
export const ANSWER = 'Answer';
export const ENTER_PROPER_TIME = 'Enter time in the correct format';
export const ACCEPT_TERMS = 'Please accept the terms & conditions to proceed'; //'Please accept the terms & conditions to proceed';
export const ENTER_FIRST_NAME = 'Enter first name';
export const VALID_FIRSTNAME = 'Enter a valid first name';
export const REMOVE_WHITESPACE = 'Remove unwanted spaces';
export const MAX_EMAILLENGTH = `Enter characters below ${MAX_LENGTH100} characters`;
export const VALID_LASTNAME = 'Enter a valid last name';
export const ENTER_LAST_NAME = 'Enter last name';
export const ENTER_ADDRESS = 'Enter address';
export const ENTER_EMAIL_MESSAGE = 'Enter email message';
export const ENTER_PASSWORD = 'Enter password';
export const ENTER_CURRENT_PASSWORD = 'Enter current password';
export const ENTER_NEW_PASSWORD = 'Enter new password';
export const CONFIRM_NEW_PASSWORD = 'Re-enter password';
export const ENTER_CONFIRM_PASSWORD = 'Confirm password';
export const PASSWORD_NOT_MATCH = 'Passwords do not match';
export const CONFIRM_PASSWORD_NOT_MATCH = 'Passwords do not match';
export const ENTER_COMUNICATION_NAME = 'Enter communication name';
export const SELECT_COMMUNICATION_TYPE = 'Select communication type';
export const SELECT_URL_TYPE = 'Select URL Type';
export const SELECT_BUTTON_TYPE = 'Select button type';
export const SELECT_BUTTON_TEXT = 'Select button text';
export const SELECT_PRODUCT_TYPE = 'Select product type';
export const SELECT_SUB_PRODUCT_TYPE = 'Select sub-product type';
export const SELECT_PRIMARY_GOAL = 'Select primary goal';
export const SELECT_PRIMARY_GOAL_TYPE = 'Select primary goal type';
export const ENTER_GOAL_PERCENTAGE = 'Enter goal percentage';
export const SELECT_CONVERSION_TYPE = 'Select conversion type';
export const SELECT_ENGAGEMENT_TYPE = 'Select engagement type';
export const SELECT_SECONDARY_GOAL = 'Select secondary goal';
export const SELECT_SECONDARY_GOAL_TYPE = 'Select secondary goal type';
export const SELECT_START_DATE = 'Select start date';
export const SELECT_END_DATE = 'Select end date';
export const SELECT_CHANNEL_TYPE = 'Select at least one channel';
export const SELECT_ANALYTICS_TYPE = 'Select at least one analytics type';
export const SELECT_DYNAMIC_LIST = 'Select dynamic list';
export const SELECT_JOBFUNCTION = 'Select job title';
export const ENTER_PHONE = 'Enter mobile number';
export const ENTER_CITY = 'Enter city';
export const ENTER_ZIP = 'Enter zip code';
export const SELECT_DATE_FORMAT = 'Select date format';
export const SELECT_TIME_FORMAT = 'Select time format';
export const SELECT_TIMEZONE = 'Select time zone';
export const SELECT_USERROLE = 'Select user role';
export const ENTER_ROLE = 'Enter role';
export const ENTER_STATE = 'Enter state/province';
export const ENTER_SECRECT_ID = 'Enter app secret ID';
export const SELECT_COUNTRY = 'Select country';
export const SELECT_INDUSTRY = 'Select industry';
export const SELECT_TITLE = 'Select';
export const SELECT_CURRENCY = 'Select currency';
export const SELECT_CURRENCY_FORMAT = 'Select currency format'
export const SELECT_LANGUAGE = 'Select language';
export const SELECT_KYC = 'Select KYC';
export const UPLOAD_PROFILE_IMAGE = 'Upload profile picture';
export const UPLOAD_AGENCY_LOGO = 'Upload agency logo';
export const UPLOAD_COMPANY_IMAGE = 'Upload company logo';
export const AGENCY_GROUP = 'Enter agency group';
export const AGENCY_NAME = 'Enter agency name';
export const ENTER_WEBSITE = 'Enter website';
export const ENTER_AGENCY_REPORT_NAME = 'Agency report Name';
export const ENTER_REPORT_TITLE = 'Report title';
export const ENTER_OTP = 'Enter OTP';
export const ENTER_VALID_OTP = 'Enter the valid OTP';
export const ENTER_VALID_ZIP = 'Enter a valid zip code';
export const ENTER_VALID_WEBSITE = 'Enter a valid website URL';
export const ENTER_DOUBLE_OPT_IN_STATEMENT = 'Enter double opt-in statement';
export const SELECT_COMPANY_BRAND = 'Select'; //Select company branch'
export const SELECT_REGION = 'Select entity region';
export const SELECT_PERIOD = 'Select period'
export const SELECT_BUSINESS_TYPE = 'Select business type';
export const SELECT_BUSINESS_POSITION = 'Select brand position';
export const ENTER_VALID_PERCENTAGE = 'Enter a valid percentage';
export const ENTER_TAGS = 'Enter tags';
export const SPECIAL_CHATACTERS_NOT_ALlOWED = 'Only (_ & -) are allowed';
export const NO_SPECIAL_CHARS_ALLOWED = 'Special characters not allowed'
export const ENTER_IMPORT_DESCRIPTION = 'Enter import description';
export const SELECT_COMPANY_LIST = 'Select company list';
export const REDIRECTION_URL = 'Enter valid redirection URL';
export const CLIENTNAME_ALREADY_EXISTS = 'Client name already exists';
export const CLIENTNAME_SHOULD_NOT_MATCH = 'Parent & child companies cannot be the same';
export const SHOULD_EXISTS_IN_PREFERRED_REGION = 'Selected region should be present in your preferred regions';

//Planning Error Messages:
export const ENTER_MONTHS = 'Enter months';
export const SELECT_MONTHLY_CONDITION = 'Select monthly condition';
export const SELECT_WEB_TO_PROCEED = 'Select web to proceed';
export const SELECT_WEB_TO_Analytics = 'Select analytics type';
export const SELECT_FREQUENCY = 'Select frequency';
export const ENTER_TIME = 'Enter time';
export const ENTER_DAYS = 'Enter days';
export const ENTER_WEEK_DAYS = 'Enter week days'
export const ENTER_WEEKS = 'Enter weeks';
export const ENTER_HOURS = 'Enter hours';
export const SELECT_DAYS = 'Select days';
export const SELECT_HOURS = 'Select hours';
export const SELECT_TIME = 'Select time';
export const SELECT_WEEK = 'Select a day of the week';
export const ENTER_SENDER_NAME = 'Enter sender name';
export const Select_SENDER_NAME = 'Select sender name';
export const ENTER_VALID_SENDER_NAME = 'Enter a valid sender name';
export const ENTER_SUBJECT_LINE = 'Enter subject line';
export const ENTER_SENDER_ID = 'Enter sender ID';
export const SELECT_SENDER_ID = 'Select sender ID';
export const ENTER_Inbound_number = 'Enter inbound number';
export const ENTER_KEYWORD = 'Enter keyword';
export const ENTER_TITLE_TEXT = 'Enter title text';
export const ENTER_TEMPLATE_NAME = 'Enter template name';
export const SELECT_TEMPLATE_TYPE = 'Select template Type';
export const ENTER_TEMPLATE_LANGUAGE = 'Enter template language';
export const SELECT_TEMPLATE_LANGUAGE = 'Select template language';
export const ENTER_TWEET_TEXT = 'Enter tweet text';
export const ENTER_AUDIENCE = 'Enter audience';
export const SELECT_AUDIENCE = 'Select audience';
export const ENTER_LANGUAGE = 'Select language';
export const ENTER_TEMPLATE_ID = 'Enter template ID';
export const ENTER_HASHTAG = 'Enter hashtag';
export const SELECT_LINK = 'Enter link';
export const ENTER_VALID_SUBJECT_LINE = 'Enter a valid subject line';
export const ENTER_INBOX_FIRSTLINE_PREVIEW = 'Enter inbox preview text';
export const SELECT_APPROVER_NAME = `Select reviewer's email address`;
export const ENTER_DOMAIN = 'Enter domain name';
export const ENTER_POTENTIAL_BASE = 'Enter potential audience base size';
export const ENTER_AVAILABLE_AUDIENCE = 'Enter available audience size';
export const ENTER_CLUSTER = 'Enter number of clusters';
export const ENTER_SENDEREMAILADDRESS = 'Enter sender email address ';
export const ENTER_SERVER = 'Enter number of servers';
export const ENTER_WARMUP = 'Enter warmup';
export const ENTER_LOW = 'Enter low';
export const ENTER_MEDIUM = 'Enter medium';
export const ENTER_HIGH = 'Enter high' ;
export const ENTER_VALID_DOMAIN = 'Enter a valid domain';
export const ENTER_URL = 'Enter URL';
export const ENTER_TRANSFER_METHOD = 'Enter transfer method';
export const SELECT_AUDIENCE_BUNCH_LIST = 'Selected audience bunch is empty. Please add audience or select another bunch';
export const SELECT_SEND_PUSH = 'Select send push';
export const SELECT_MOBILE_APP = 'Select mobile app'; 
export const SELECT_DELIVERYTYPE = 'Select delivery type';
export const SELECT_PUSHTYPE = 'Select push type';
export const SELECT_INBOX_CLASSIFICATION = 'Select inbox classification';
export const SELECT_LAYOUT_POSITION = 'Select layout position';
export const SELECT_POSITION = 'Select position';
export const ENTER_AUTHORIZATION_KEY = 'Enter authorization key';
export const ENTER_SEVER_NAME_IP_ADDRESS = 'Enter server name/IP address';
export const IP_ADDRESS_EXISTS = 'IP address already exists';
export const SELECT_SCHEDULE_DATE_AND_TIME = 'Select date and time';
export const SELECT_GROUPING_ID = 'Select grouping ID';
export const ENTER_GROUPING_ID = 'Enter grouping ID';
export const SELECT_PRIORITY = 'Select priority';
export const SELECT_IMPRESSIONS = 'Select impressions';
export const ENTER_PRODUCT_MANAGER = 'Enter product manager';
export const ENTER_EDITOR_TEXT = 'Enter message';
export const ENTER_OFFER_DESCRIPTION = 'Enter offer description';
export const ENTER_OFFER_DETAILS = 'Enter offer details';
export const ENTER_TERMS_AND_CONDITION = 'Enter terms and condition';
export const ENTER_BODY_TEXT = 'Enter body text';
export const ENTER_LENGTH_3_TO_12 = 'Enter length 6 to equal to 12';

export const ENTER_AUDIENCE_REACH_NUMBER = 'Enter audience reach size';
export const ENTER_COMUNICATION_TEXT = 'Enter communication text';
export const SELECT_AGE_FROM = 'Select age from';
export const SELECT_AGE_TO = 'Select age to';
export const ENTER_VALID_PHONE_NO = 'Enter a valid mobile number';
export const ENTER_VALID_DIAL_CODE = 'Enter a valid dial code';

export const ENTER_CAMPAIGN_MANAGER = 'Enter communication manager’s name';
export const ENTER_PRODUCT = 'Enter product';
export const ENTER_CAF_NUMBER = 'Enter CAF number';
export const ENTER_MARKETING = 'Enter marketing';
export const ENTER_COSTCODE = 'Enter cost code';
export const ENTER_OFFER_TYPE = 'Enter offer type';
export const ENTER_COUNTRY = 'Enter country';
export const SELECT_DOMAIN_NAME = 'Select domain name';
export const SELECT_WEB_URL = 'Select web URL';
export const ENTER_VOLUME = 'Enter volume';
export const SELECT_DOCKET_FILE = 'Select the docket file';
export const ENABLE_UNSUBSCRIPTION = 'Enable unsubscription';
export const SELECT_UNSUBSCRIPTION_BUTTON_MESSAGE = 'Select unsubscription message';
export const PARAMETER_ALREADY_EXISTS = 'Parameter already exists';
export const SELECT_EXPIRY_TIME = 'Select expiry time';
export const EXCEED_EXPIRY_TIME = 'Expiry time must be after end date';
export const SELECT_EXPIRY_VALUE = 'Enter expiry value';
export const SELECT_APP_SCREEN = 'Select app screen';
export const SELECT_SUB_APP_SCREEN = 'Select sub app screen';
export const SELECT_AUDIENCE_LIST = 'Select audience list';
export const SELECT_AUDIENCE_LIST_TYPE = 'Select audience type';
export const SELECT_POST_ON = 'Select post on';
export const ENTER_VALID_LINK = 'Enter a valid link';
export const COLUMN_COUNT_MISMATCH = 'All rows must have the same number of columns as the header';
export const ENTER_BUTTON_NAME = 'Enter button name';
export const ENTER_VALID_URL = 'Enter a valid URL';
export const ENTER_EXPIRY_TIME = 'Enter expiry time';
export const ENTER_VALIDATE_WEEK = 'Enter valid weeks';
export const ENTER_VALIDATE_TIME  = 'Enter valid time';
export const ENTER_VALIDATE_DAYS = 'Enter valid days';
export const ENTER_VALIDATE_MONTH = 'Enter valid months';
export const ENTER_SECURED_WEBSITE = 'Enter a secured website URL';
export const DOMAIN_NOT_ONBOARDED = 'The provided URL’s domain is not onboarded';
export const MORE_THAN_5_LISTS= 'At most 5 lists are allowed';
export const MAXIMUM_CATEGORIES_ALLOWED = 'Maximum 20 categories allowed';

//
export const IMAGE_SIZE_MAX1 = 'Max image size: 1MB';

// # Social Post
export const ENTER_SOCIAL_POST = 'Enter post name';
export const ENTER_POST_LINK = 'Enter post link';
export const ENTER_TRENDING_TOPICS = 'Enter trending topics';
export const AGE_TO_EQUALS = 'Select a value greater than age from' ;

//Voice
export const ENTER_DESCRIPTION = 'Enter description';
export const SELECT_AUDIO_FILE = 'Select audio file';
export const SELECT_REPEAT_TIMES = 'Select repeat times';
export const SELECT_RETRY_TIMES = 'Select retry times';

//VMS
export const SELECT_PROVIDER = 'Select provider';
export const SELECT_VENDOR_NAME = 'Select vendor name';
export const SELECT_TEMPLATE_NAME = 'Select template name';

//Webhooks
export const SELECT_VALID_TYPE = 'Select valid type';
export const AGREE_TO_TRANSFER_DATA = 'Agree to transfer data';

//ADS
export const SELECT_AD_TYPE = 'Select Ad type';

//Analytics
export const SELECT_ANALYTICS_PLATFORM = 'Select analytics platform';
export const SELECT_DOMAIN = 'Select domain';
export const SELECT_CONVERSION_CATEGORY = 'Select conversion category';
export const SELECT_SUBSCRPTION_FORM = 'Select subscription form';
export const ENTER_CONVERSION_URL = 'Enter conversion URL';
export const ENTER_EVENT_NAME = 'Enter event name';
export const SELECT_TRACKING_TYPE = 'Select tracking type';
export const ENTER_ORM_PROFILE_NAME = 'Enter ORM profile name';
export const EXIST_ORM_PROFILE_NAME = 'ORM profile name already exists';
export const SELECT_CHANNEL_NAME = 'Select channel name';
export const ENTER_YOUTUBE_URL = 'Enter YouTube URL';
export const SELECT_ATTRIBUTION_ROI = 'Select ROI attribution type';
export const SELECT_CONVERSION_FORM = 'Select conversion form';
export const SELECT_CONVERSION_VALUE = 'Select conversion value';
export const ENTER_GRACE_PERIOD = 'Enter grace period';
export const ENTER_VALID_GRACE_PERIOD = 'Grace period cannot exceed 180 days';
export const ENTER_CONVERSION_VALUE = 'Enter conversion value';
export const ENTER_VALID_CONVERSION_URL = 'Enter a valid conversion URL';
export const SELECT_ATTRIBUTE = 'Select proper attribute';
export const SELECT_FORM_NAME = 'Select form name';
export const SELECT_FORM_STATUS = 'Select form status';
export const SELECT_Rule_Type = 'Select rule type';
export const SELECT_Type = 'Select condition';
export const SELECT_ATTRIBUTE_Name = 'Select name';
export const SELECT_PROPER_VALUES = 'Select values';
export const ENTER_ATTRIBUTE = 'Enter value';
export const ENTER_PAGE_NAME = 'Enter page name';
export const ENTER_PAGE_URL = 'Enter page URL';
export const ENTER_ATTRIBUTE_VALUE = 'Enter attribute value';
export const ENTER_ACTION_TYPE = 'Select type';
export const ENTER_VALID_DATE = 'Select a valid date';

//Data catalogue
export const ENTER_ATTRIBUTE_NAME = 'Enter attribute name';
export const VALID_ATTRIBUTE_NAME = 'Special characters and multiple spaces are not allowed';
export const ENTER_FALLBACK_ATTRIBUTE_NAME = 'Enter default fallback attribute name';
export const VALID_FALLBACK_ATTRIBUTE_NAME = 'Enter a valid fallback attribute name';
export const SELECT_INPUT_TYPE = 'Select input type';
export const SELECT_DATA_TYPE = 'Select data type';
export const SELECT_FILTER_GROUP = 'Select filter group';
export const SELECT_CLASSIFICATION = 'Select classification';
export const UI_PRINTABLE_NAME_EXISTS = 'Attribute name already exists';

// Audience
export const SELECT_SFTP = 'Select SFTP';
export const SELECT_IMPORT_PREFERENCE = 'Select import preference';
export const HEADERS_MINLENGTH = 'A min. of 5 headers is required';
export const HEADERS_MAXLENGTH = 'More than 25 headers are not allowed';
export const ATLEAST_ONE_ROW = 'Add at least one row of data and proceed';
export const NO_SPECIAL_CHARS = 'First row should not contain any special characters';
export const MANDATORY_FIELDS = 'Invalid format; please refer to the sample format.';
export const DESCRIPTION_EXISTS = 'Import description already exists';
export const FIRST_ROW_COLUMN_HEADER = 'First row should be used as column header';
export const ENTER_AUDIENCE_DETAILS = 'Enter audience data';
export const CONFIRM_OPT_IN = 'Confirm double opt-in subscription';
export const SELECT_DIFFERENT_ATTRIBUTE = 'Select different attribute';
export const BRAND_ATTRIBUTE_NOT_SELECTED = 'Brand attribute does not selected';
export const BRAND_ATTRIBUTE_NOT_EXIST = 'Brand Id does not exist in the selected file';
export const NOT_BRAND_LOGO = 'Selected attribute does not a brand ID';
export const SELECT_LIST_TYPE = 'Select list type';
export const SELECT_CAT_TYPE = 'Select category type';
export const ENTER_LIST_NAME = 'Enter list name';
export const NAME_CANNOT_BE_EMPTY = 'Name cannot be empty';
export const MAX_FILESIZE = 'Select file lesser than 10MB';
export const MAX_CSV_FILES = 'Max. of 5 file(s) can only be chosen';
export const CONTAINS_INVALID_FILES = 'Upload a valid audience file';
export const MAX_TARGET_COLUMNS = 'Max. of ' + TARGETATTRIBUTES + ' columns can only be chosen';
export const MAX_ADHOC_COLUMNS = 'More than ' + ADHOCATTRIBUTES + ' columns are not allowed';
export const MAX_SEED_COLUMNS = 'Max. of ' + SEEDLISTATTRIBUTES + ' columns can only be chosen';
export const MAX_MATCH_SUPPRESSION_COLUMNS = 'Max. of ' + MATCHLISTATTRIBUTES + ' columns can only be chosen';
export const MAX_SEED_AUDIENCE_LIST = 'Max. ' + SEEDLISTAUDIENCE + ' audiences per list';
export const HEADERS_NOT_MATCHED = 'Mismatched headers are found';
export const FILENAME_EXIST = 'File name already exists';
export const SELECT_SOURCE = 'Select source';
export const ENTER_FRIENDLY_NAME = 'Enter friendly name';
export const ENTER_VALID_FRIENDLYNAME = 'Enter valid friendly name';
export const ENTER_VALID_IP_ADDRESS = 'Enter valid IP address';
export const ENTER_VALID_ACCESS_POINT = 'Enter valid access point';
export const ENTER_VALID_PORT_NUMBER = 'Invalid port number';
export const ENTER_USERNAME = 'Enter user name';
export const ENTER_SENDER_USERNAME = 'Enter sender user name';
export const ENTER_FOLDER_PATH = 'Enter folder path';
export const SET_UNIQUE_IDENTIFIER = 'Set unique identifier to proceed';
export const SELECT_INPUT_VALUES = 'Select input value';
export const SELECT_INPUT_Domain = 'Select domain';
export const SELECT_APP = 'Select app';
export const ENTER_INPUT_VALUES = 'Enter proper input value';
export const ENTER_VALID_NUMBER = 'Enter valid number';
export const ENTER_GREATEST_VALUE = 'Enter greater value';
export const ENTER_LESSER_VALUE = 'Enter lesser value';
export const ENTER_TRIGGER_CONDITION = 'Enter the no. of condition(s)';
export const ENTER_SINGLE_WORD = 'Single word only allowed';
export const SELECT_TRIGGER_SOURCE = 'Select source';
export const SELECT_SUBVALUES = 'Select sub values';
export const ENTER_PERSONA_NAME = 'Enter persona name';
export const UPLOAD_CSV_FILE_TO_PROCEED = 'Upload CSV files to proceed';
export const MAX_CSV_FILES_ADHOCLIST = 'Max. of 5 file(s) can only be chosen';
export const MAX_CSV_FILES_SEEDLIST = 'Max. of 1 file can only be chosen';
export const MAX_CSV_FILES_TARGETLIST = 'Max. of 6 file(s) can only be chosen';
export const MAX_CSV_FILES_MATCHINPUTLIST = 'Max. of 6 file(s) can only be chosen';
export const MAX_CSV_FILES_SUPPRESSIONINPUTLIST = 'Max. of 6 file(s) can only be chosen';
export const ENTER_EXTRACTION_LIMIT = 'Enter extraction limit';
// REMOTE DATA SOURCE
export const SELECT_PRIMARY_KEY = 'Select primary key';
export const SELECT_FOREIGN_KEY = 'Select foreign key';

// RDS

export const IP_ADDRESS = 'Enter IP address';
export const PORT_NUMBER = 'Enter port number';
export const DATABASE_NAME = 'Enter database name';
export const KEY_SPACES = 'Enter key spaces';
export const NAME_SPACE = 'Enter name space';
export const ACCOUNT_NAME = 'Enter account name';
export const SCHEMA = 'Enter schema';
export const INSTANCE_NAME = 'Enter instance/friendly name';
export const CONSUMER_KEY = 'Enter consumer key';
export const FRIENDLY_NAME = 'Enter friendly name';
export const API = 'Enter API';
export const STOREHASH = 'Enter Store hash';
export const HTTPPATH = 'Enter HTTP path';
export const USER_NAME = 'Enter username';
export const CONSUMER_SECRET = 'Enter consumer secret';
export const AUTH_ID = 'Enter auth ID';
export const AUTH_URL = 'Enter auth URL';
export const SITE_ID = 'Enter site ID';
export const PROJECTINFO ='Enter project Info';
export const SPREADSHEETID ='Enter spreadsheet ID';
export const DATASETINFO ='Enter dataset Info';
export const PROJECTNAME ='Enter project Name';
export const PROJECTKEY ='Enter project key';
export const HUBID = "Enter hub ID"
export const ACCESSTOKEN = "Enter access token";
export const APITOKEN = "Enter api token"
export const SECURITYTOKEN = "Enter security token"
export const ACCESSKEY = "Enter access key"
export const SECRETKEY = "Enter secret key"
export const APIHOST = "Enter api host"
export const TENANTID = "Enter tenant ID"
export const CLIENTID = "Enter client ID"
export const CLIENTSECRET ="Enter client secret"
export const RESOURCEURL = "Enter resource URL"
export const SHOPNAME = "Enter shop Name"
export const STORENAME = "Enter store Name"
export const STOREURL = "Enter store URL"
export const KEY = "Enter key"
export const HOST = "Enter host"
export const PORT = "Enter port"
export const DATABASE = "Enter database"
export const SERVER = "Enter server"
export const NAMESPACE = "Enter name space"
export const KEYSPACE = 'Enter key space';
export const ACCOUNT = 'Enter account';
export const PRIVATETOKEN = 'Enter private token';
export const EMAILADDRESS = 'Enter email address';
export const AUTHTOKEN = 'Enter auth token';
export const ORGANIZAION_NAME = 'Select organization name';
export const CATALOG = 'Enter catalog';
// Channel settings- Notification- App

export const PLATFORMNAME = 'Select platform';
export const SELECT_MOBILE_PLATFORM = 'Select mobile platform';
export const PLAYSTORE_URL = 'Enter playstore URL';
export const APPSTORE_URL = 'Enter appstore URL';
export const FCM_SENDERID = 'Enter FCM senderID';
export const FCM_SEVERKEY = 'Enter FCM server key';
export const APNS_CERTPASSWORD = 'Enter CERT password';
export const APNS_FILENAME = 'Upload file';
export const APNS_TEAM_ID_REQUIRED = 'Enter team id';
export const APNS_KEY_ID_REQUIRED = 'Enter key id';
export const APNS_APPLE_ID_INVALID = 'Must be exactly 10 characters (A–Z and 0–9)';
export const NOTIFICATION_APP_KEY = 'Enter notification app key';
export const SERVICE_ACCOUNT_NAME = 'Enter service account name';
export const SERVICE_ACCOUNT_SECRET = 'Enter service account secret';

// Frequency cap
export const RULENAME = 'Enter rule name';
export const SELECT = 'Select';
export const AUDIENCEGROUP = 'Select audience group';
export const AUDIENCEGROUP_LIST = 'Select audience group list';
export const APPLYRULEON = 'Select type';
export const LIMIT = 'Select limit';
export const TIMEINTERVAL = 'Select time interval';
export const SELECT_APP_NAME = 'Select app name';
export const SELECT_USER = 'Select user';
export const PROPERTY = 'Select property';
export const ACCOUNTS = 'Select Account';
export const MEDIA = 'Select media';
export const SITE = 'Select site name';
export const INSIGHTS = 'Select insights';

// preference ===> create offer

export const NAME = 'Enter name';
export const OFFER_TYPE = 'Enter offer type';
export const COMMUNICATION_TYPE = 'Enter communication type';
export const ENTER_DISCOUNT_VALUE = 'Enter discount value';
export const ENTER_DISCOUNT_PERCENTAGE = 'Enter discount percentage';
export const ENTER_MINIMUM_PURCHASE_VALUE = 'Enter min.purchase value';
export const ENTER_MAXIMUM_PURCHASE_DISCOUNT = 'Enter maximum purchase discount';
export const ENTER_MAXIMUM_DISCOUNT_CAP = 'Enter maximum discount cap';
export const ENTER_MINIMUM_PURCHASE_CAP = 'Enter minimum purchase cap';
export const SELECT_BRAND = 'Select brand';
export const ENTER_BRAND = 'Enter brand name';
export const ENTER_SHORT_NAME = 'Enter short name';
export const ENTER_LEGAL_NAME = 'Enter legal name';
export const SELECT_SHOP = 'Select shop';
export const SELECT_REFERRER_REWARD = 'Select referrer reward';
export const SELECT_REFEREE_REWARD = 'Select referee reward';
export const SELECT_PERCENTAGE_OR_AMOUNT = 'Select percentage or amount';
export const ENTER_USAGE_CLAIM_LIMIT = 'Enter usage claim limit';
export const SELECT_LIMIT_BY_DURATION = 'Select limit by duration';
export const ENTER_TOTAL_REDEMPTION = 'Enter total redemption';
export const SELECT_APPLICABLE_DAYS = 'Select applicable days';
export const ENTER_APPLICABLE_TIME = 'Enter applicable time';
export const ENTER_DISPLAY_NAME = 'Enter display name';
export const UPLOAD_LOGO = 'Upload logo';
export const UPLOAD_BANNER_IMAGE = 'Upload at least one banner image';
export const ENTER_VALID_VOLUME = 'Enter valid volume';
export const VALUE_CANNOT_BE_ZERO = 'Value cannot be zero';
export const PRODUCT_TYPE = 'Enter product type';
export const OFFER_CODE_TYPE = 'Choose offer code type';
export const OFFER_CODE = 'Enter offer code';
export const VOLUME = 'Enter volume';
export const ADD_OFFER_CODE = 'Enter offer code';
export const LENGTH = 'Enter length';
export const FORMAT = 'Enter format';
export const COMPOSE_USING = 'Enter compose using';
export const CODE_PATTERN = 'Enter code pattern';
export const DISPLAY_AS = 'Enter display as';
export const SELECT_DISPLAY_AS = 'Select display as';
export const SELECT_FILE = 'Select file';
export const ENTER_BRANDLATITUDE = 'Enter latitude';
export const ENTER_BRANDLONGITUDE = 'Enter longitude';
export const ENTER_SUBCATEGORY = 'Select sub category';

// preference ===> Audience Score
export const ENTER_VALID_DATA = 'Enter valid data';
export const SHOULD_BE_LESS = 'It should be less than or equal to ' + MAX_LENGTH100 + '';

export const FORM_FIELDS_REQUIRED = 'Form fields are required';
export const CAMPAIGNS_ARE_REQUIRED = 'Communications are required';
export const ENTER_ROLE_NAME = 'Enter role name';
export const SELECT_TEMPLATE_CATEGORY = 'Select template category';
export const ENTER_IMAGE_URL = 'Enter image URL';
export const ENTER_LINK = 'Enter a link';

// ADD USER
export const ENTER_PROPER_URL = 'Enter a valid URL';
export const ENTER_WELCOME_MESSAGE = 'Enter welcome message';
export const ENTER_DIRECTORY_ID = 'Enter directory ID';
export const ENTER_APPLICATION_ID = 'Enter application ID';
export const ENTER_APPLICATION_SECRET = 'Enter application secret';
export const ENTER_GROUP_ID = 'Enter group ID';
export const ENTER_ADFS_URL = 'Enter ADFS URL';
export const ENTER_ENDPOINT_URL = 'Enter end point URL';
export const ENTER_PATH = 'Enter path';
export const SELECT_ROLE = 'Select role';
export const ENTER_AUTHENTICATION_CODE = 'Enter authenticate code';

export const CANNOT_BE_SAME_AS_CURRENT_PASSWORD = 'New password cannot be same as current password';

//Company
export const DEPARTMENT_NAME = 'Department name';
export const BUSINESS_UNIT = 'Business unit';


//Goals & benchmark
export const BENCHMARK_NAME = 'Enter benchmark name';
export const VALID_BENCHMARK_NAME = 'Enter valid benchmark name';

//common message
export const MINLENGTH = 'Min. ' + MIN_LENGTH + ' characters';
export const MAXLENGTH = 'Max. ' + MAX_LENGTH50 + ' characters';
export const MAX75LENGTH = 'Max. ' + MAX_LENGTH + ' characters';
export const MAX10LENGTH = 'Max. ' + MAX_LENGTH10 + ' characters';
export const MAX500LENGTH = 'Max. ' + MAX_LENGTH500 + ' characters';
export const MAX255LENGTH = 'Max. ' + MAX_LENGTH255 + ' characters';
export const MAX200LENGTH = 'Max. ' + MAX_LENGTH200 + ' characters';
export const ENTER_ALT_TEXT = 'Enter alternate text';
export const UPLOAD_FILE = 'Upload file';
export const ENTER_EMAIL_ID = '';
export const ENTER_EMAIL = 'Enter email address';
('Enter email address');

//Localization settings
export const ENTER_SMART_LINK = 'Enter smart link';
export const ENTER_COMMUNICATION_LINK = 'Enter communication link';
export const ENTER_ASSOCIATES = 'Enter associates';
export const ENTER_CALCULATION_SETUP = 'Analytics calculation setup';
export const SELECT_CONVERSION = 'Enter conversion';
export const SELECT_ENGAGEMENT = 'Enter engagement';
export const SELECT_REACH = 'Enter reach';
export const SELECT_MAX_WAVES = 'Enter waves';
export const ENTER_SINGLE_DIMENSION = 'Enter single dimension';
export const ENTER_Multi_DIMENSION = 'Enter multi dimension';
export const ENTER_EVENT_TRIGGER = 'Enter event trigger';
export const HOURS = 'Hours';
export const DATE_FORMAT = 'Select the format';

// Misse validation message for all components
export const INVALID_FORMAT = 'Invalid file format';
export const SELECT_LESS_THAN = 'Select file less than ';
export const FILE_SIZE_EXCEED = 'File size should not exceed ';
export const IMG_SIZE_500KB = 'Image size should be less than 500kb.';
export const SELECT_CAMPAIN = 'Select communication';
export const CREDIT_CARD = 'Credit card acquisition';
export const PREFERENCE = 'Import preference';
export const UPDATE_CYCLE = 'Update cycle';
export const SELECT_UPDATE_CYCLE = 'Select update cycle';
export const UPDATE_RECENCY = 'Select recency';
export const CHECK_UPDATE = 'Select update column attribute';
export const SEGMENT_NAME = 'Enter segmentation name';
export const SELECT_YOUR_DEVICE = 'Select your device';
export const SELECT_TAG = 'Select tag';
export const ENTER_VALUE = 'Enter value';
export const ENTER_TAG = 'Enter tag';
export const ENTER_NUMBER = 'Enter number';
export const SELECT_VALUE = 'Select value';
export const SELECT_DATE = 'Select date';
export const DOMAIN_URL = 'Enter domain URL';
export const ENTER_ADAPTIVE = 'Enter adaptive URL';
export const ENTER_DEVICE_TYPE = 'Enter device type';
export const AUTO_SCHEDULE = 'Auto schedule';
export const DURATION = 'Enter duration';
export const ENTER_TIME_INTERVAL = 'Enter time interval';
export const COMMUNICATION_URL = 'Enter communication URL';
export const SELECT_ACTION = 'Select action';
export const SERVER_EMAIL = 'Enter server from email';
export const SERVER_BOUNCE = 'Enter server bounce email';
export const DOMAIN_KEY = 'Enter domain key';
export const THROTTLE_SETTINGS = 'Select throttle setting';
export const SMPT_HOUSING = 'Select SMTP housing';
export const TERMS_COND = 'Agree Terms & conditions';
export const DUPLICATE_VALUE = 'Duplicate value';
export const ACCESS_POINT = 'Enter access point';
export const OPERATOR_CODE = 'Operator code';
export const ANALYTIC_PLATFORM = 'Select analytics platform';
export const ACCOUNT_MAIL = 'Enter account mail';
export const GOAL_NAME = 'Enter goal name';
export const FRIENDLY_NAME_EMOJI_ONLY = 'Friendly name cannot be only emoji.';
export const APP_KEY = 'Enter app key';
export const SECTRECT_ID = 'Enter secret ID';
export const APP_NAME = 'Enter app name';
export const APP_ID = 'Enter app id';
export const DOMAIN_NAME = 'Enter domain name';
export const FCM_ID = 'Enter FCM sender ID';
export const FCM_KEY = 'Enter FCM server key';
export const API_KEY = 'Enter API key';
export const AUTH_TOKEN = 'Enter auth domain';
export const DATA_BASE_URL = 'Enter database URL';
export const PROJECT_ID = 'Enter project ID';
export const STORAGE_BUCKET = 'Enter storage bucket';
export const MESUREMENT = 'Enter measurement ID';
export const OFFER_NAME = 'Enter offer name';

// New messages
export const CHOOSE_FILE = 'Choose file';
export const NO_RESULTS_FOUND = 'No results found';
export const ENTER_GREATER_VALUE = 'Enter a greater value';
export const INVALID_CAPTCHA = 'Invalid captcha';
export const RETARGET_LIST_SUCCESSFUL = 'Retarget list generated successfully';
export const RETARGET_LIST_FAILURE = 'Retarget list not generated';
export const LIST_NAME_EXISTS = 'List name already exists';
export const LIST_NAME_MUST_DIFFER = 'Enter a different list name';
export const COMMUNICATION_NAME_MUST_DIFFER = 'Enter a different communication name';
export const DOMAIN_NAME_EXISTS = 'Domain already exists';
export const BU_NAME_EXISTS = 'Business unit already exists';
export const ENTER_VALID_DAYS = 'Enter the valid days';
export const ENTER_VALID_DURATION = 'Enter valid duration';
export const ENTER_VALID_POS_DATA = 'Enter the valid POS data';
export const SAVE_TAGS = 'Press ENTER to save the tags';
export const SAVE_LABELS = 'Press ENTER to save the labels';
export const SAVE_CATEGORIES = 'Press ENTER to save the categories';
export const CATEGORY_NAME_MIN_LENGTH = 'Category name must be at least 3 characters';
export const CATEGORY_NAME_ALLOWED_CHARACTERS = 'Only letters, numbers, and special characters (_-/&) are allowed';
export const ENTER_RETARGET_LIST_NAME = 'Enter retarget list name';
export const SELECT_ONE_CATEGORY = 'Select at least one category';
export const DESSELECT_ALL_CATEGORIES = 'Deselect "All" to choose specific categories';
export const NO_DATA_FOUND = 'No data found';

// digipop

export const DIGIPOP_NAME = 'Enter name';
export const DIGIPOP_IMAGE_UPLOAD = 'Upload image';
export const DIGIPOP_ATTRIBUTE = 'Select attribute';
export const DIGIPOP_TYPE = 'Select source type';
export const DIGIPOP_TEXT = 'Enter text';
export const DIGIPOP_TITLE = 'Enter title';
export const DIGIPOP_ADS_DESCRIPTION = 'Enter ads description';
export const DIGIPOP_CAPTION = 'Enter caption';
export const DIGIPOP_ADS_TITLE = 'Enter ads title';
export const DIGIPOP_ACTION = 'Enter action';
export const DIGIPOP_DEVICE_TYPE = 'Select device';
export const DIGIPOP_SIZE = 'Select size';
export const DIGIPOP_IAMGE_UPLOAD = 'Upload image';
export const DIGIPOP_VIDEO_UPLOAD = 'Upload video';
export const DIGIPOP_PDF_UPLOAD = 'Upload pdf';
export const DIGIPOP_AUDIO_UPLOAD = 'Upload Audio';
export const DIGIPOP_IMAGE_URL = 'Enter image URL';
export const DIGIPOP_AUDIO_URL = 'Enter audio URL';
export const DIGIPOP_VIDEO_URL = 'Enter video URL';
export const DIGIPOP_PDF_URL = 'Enter pdf URL';
export const DIGIPOP_VALUE = 'Enter value';
export const DIGIPOP_DURATION = 'Enter duration';
export const DIGIPOP_VIDEO_SOURCE = 'Enter video source ';
export const DIGIPOP_RATING = 'Enter rating';
export const DIGIPOP_CLICK_URL = 'Enter click URL';
export const DIGIPOP_RESPONSIVE_SIZE = 'Enter responsive size';
export const DIGIPOP_THUMBNAIL_URL = 'Enter thumbnail URL';
export const DIGIPOP_MARID = 'Select marid';
export const DIGIPOP_SECURE = 'Select secure';
export const DIGIPOP_CLICK = 'Enter click';
export const DIGIPOP_IMPRESSION = 'Enter impression value';
export const ENTER_NEW_ALERT_SOUND = 'Enter new alert sound';

//Request for approval
export const REQUEST_APPROVAL_EMAIL_ID = `Select a reviewer's email address`;
export const REQUEST_APPROVAL_DUPLICATE_EMAIL = 'Duplicate email is not allowed';
export const REQUEST_APPROVAL_DUPLICATE_NUMBER = 'Duplicate number';
export const REQUEST_APPROVAL_INVALID_NUMBER = 'Invalid number';
export const REQUEST_APPROVAL_VALDIATE_NUMBER = 'Enter valdiate phone number';
export const REQUEST_APPROVAL_VALD_EMAIL = 'Enter valid email';
export const REQUEST_APPROVAL_SELECT_EMAIL = 'Select email';
export const REQUEST_APPROVAL_1_EMAIL = 'Enter only 1 valid email-id';
export const REQUEST_APPROVAL_MAX_5_NUMBERS = 'At most 5 mobile numbers allowed';

//Communication
export const MUST_BE_2_DAYS = 'Must be 2 days before comm. end date.';
export const ENTER_SHARABLE_CONTENT= 'Enter sharable content';
export const SELECT_ALERT_SOUND= 'Select alert sound';
export const ADD_CUSTOM_ALERT_SOUND= 'Add custom alert sound';

//Preferences
export const SELECT_ONE_PERMISSION = 'Select atleast one permission'

//QR
export const COMMUNICATION_DESCRIPTION='Enter communication description'
// KPI
export const SELECTED_ATTRIBUTE='Select attribute'
export const SELECTED_ATTRIBUTES='Select attributes'
export const SELECTED_KPI_TYPE='Select KPI type'


//Form Buiulder
export const FORM_LABEL='At least one contact point (email ID or mobile number) must be provided and marked as mandatory for form creation.'
export const FORM_MAPPING='At least one contact point attribute (email ID or mobile number) must be mapped and set as mandatory for form creation.'
export const FORM_MANDATORY='At least one contact point (email ID or mobile number) must be marked as mandatory for form creation.'
export const FORM_ONE_MANDATORY='At least one  must be marked as mandatory for form creation.'
export const FORM_AT_LEAST_ONE_FIELD='At least one field must be available for form creation.'
export const ENTAER_VALID='Enter valid'
export const PROGRESSIVE_PROFILING_FIELD_COUNT_MISMATCH='The number of visible fields in the form is less than the total number specified in progressive profiling settings. Please add more fields or adjust the settings.'

//CAsupport
export const SEVERITY = 'Select severity'
export const SUBJECT = 'Enter a subject'

export const CATEGORY_NAME_IS_REQUIRED = 'Category name is required'
export const CATEGORY_NAME_MUST_3 = 'Category name must be at least 3 characters'
export const CATEGORY_NAME_MUST_20 = 'Category name cannot exceed 20 characters'
export const ONLY_LETTERS = 'Only letters, numbers, and special characters (_-/&) are allowed'
export const SELECT_CATEGORY = 'Select category'
export const ENTER_CATEGORY = 'Enter a category name'
export const ENTER_NEW_SUB_SCREEN = 'Enter new sub screen'
export const ENTER_INBOX_CLASSIFICATION = 'Enter inbox classification'
export const ENTER_COMMENTS= 'Enter comments'
export const SELECT_SATE_TIME= 'Select date/time'
export const SUBJECTLINE_SHOULD_NOT_BE_SAME= 'Subjectline should not be same'
export const SELECT_ZIPFILE_URL= 'Select zip file Url to proceed'
export const SELECT_IMPORT_URL= 'Select import Url to proceed'
export const SELECT_CONTENT_TYPE= 'Select content type to proceed'
export const SELECT_A_SCHEDULE_TIME= 'Select a schedule time'
export const ENTER_CUSTOM_VALUE= 'Enter custom value'
export const ENTER_AN_URL= 'Enter an URL'
export const COUNT_EXCEEDS_POTENTIAL_AUDIENCE= 'Count exceeds potential audience'
export const ENTER_VALID_VOLUME_PER_DAY= 'Enter valid volume per day'
export const ENTER_BASE_VOLUME= 'Enter base volume'
export const ENTER_INCREMENTAL= 'Enter incremental %'
export const EXCEPTION_OCCURRED = 'Exception has occurred'
export const SELECT_DEVICE_TYPE = 'Select device type'
export const ENTER_CAPTCHA_TYPE = 'Enter Capture type'
export const SELECT_OPERATIONAL_REGION = 'Select operational region'
export const ENTER_SNAPSHOT_NAME ='Enter snapshot name'
export const PLAN_PRODUCT_DUPLICATE_NAME = 'Product Type already exists'
export const PLAN_SUB_PRODUCT_DUPLICATE_NAME = 'Sub Product Type already exists for this Product Type'

// Opt In / Opt Out - Keywords settings
export const MESSAGE_IS_REQUIRED = 'Message is required';
export const KEYWORD_ALREADY_EXISTS = 'Keyword already exist';
export const ONLY_NUMBERS_ALLOWED = 'Only numbers are allowed';
export const INBOUND_MAX_LENGTH = 'Max. 15 digits allowed';
export const INBOUND_NUMBER_ALREADY_EXISTS = 'Inbound number already exists';
export const MESSAGE_CANNOT_BE_WHITESPACE_ONLY =
    'The message cannot be only spaces or line breaks. Enter at least one visible character.';
export const BUNDLE_ID_REQUIRED = 'Enter valid bundle ID';
export const CONTENT_SUBSTITUTION_LIMIT_EXCEEDED = 'The content length after variable substitution exceeds the maximum allowed character limit. Please modify the template content accordingly.';