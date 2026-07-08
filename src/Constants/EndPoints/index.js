export const BASEDEVWIZURL = 'https://devwiz.resul.team/';
export const BASEURLTEAM = 'https://wiz.resul.io/';
export const BASEURLSTG = 'https://dwizstg.resul.io/';
export const BASEURLRUN = 'https://runwiz.resul.io/';
export const BASEURLRUN19 = 'https://runwizv5.resul.io/';
export const BASEURLRUNHF = 'https://runwizv5b.resul.io/';
export const BASELIVEDASHBOARDURL = 'https://sdk.resul.team/';
export const BASELIVEDASHBOARDURLRUN = 'https://sdk.resul.io/';
export const WEBLIVESOCKETURL = 'https://websoc.resu.io';
export const MOBILELIVESOCKETURL = 'https://soc.resu.io';
export const PREVIOUSVERSIONURL = 'https://run.resulticks.com/v48/';

export const baseURL =   BASEURLRUN;
export const GET_MASTER_DATA = 'AccountSetup/GetMasterData';
export const GET_IP_ADDRESS_DATA = 'AccountSetup/GetIPData';
export const GET_BU_DATA = 'User/GetDepartmentList';
export const CLIENT_ID_CHANGE_DATA = 'AccountSetup/ClientDataChange';
export const DEPARTMENT_ID_CHANGE_DATA = 'AccountSetup/DepartmentChange';
export const GET_UTC_TIME_NOW = 'Audience/GetUtcTimeJson';

//New User Creation:

export const SAVE_SIGN_UP = 'AccountSetup/SaveSignUp';
export const GET_LICENSE_INFO = 'AccountSetup/LicenseInfo';
export const GET_LICENSE_KEY = 'AccountSetup/GetLicenseKeyData';
export const UPGRADE_ACCOUNT = 'AccountSetup/UpgradeAccount';
export const GET_CLIENT_PAYMENT = 'AccountSetup/GetClientPayment'
export const CHECK_CLIENT_NAME_EXISTS = 'AccountSetup/CheckClientNameExists';
export const GET_KEY_CONTACT_EMAIL = 'AccountSetup/GetKeyContactEmail';
export const REQUEST_PARENT_NAME_OTP = 'AccountSetup/RequestParentNameOtp';
export const VALIDATE_WEBSITE = 'Home/CheckValidateWebsite';
export const VALIDATE_OTP = 'Home/ValidateOTP';
export const REQUEST_OTP = 'Home/RequestOTP';
export const GET_COUNTRY_DETAILS = 'AccountSetup/GetCountryDetails';
export const GET_COUNTRY_DETAILS_BY_REGION = 'AccountSetup/GetCountryDetailsByRegion';
export const BRAND_CLIENT_CREATION = 'AccountSetup/ClientCreation';
export const NEW_USER_EMAIL_EXISTS = 'AccountSetup/CheckAccountEmailExists';
export const NEW_USER_VALIDATE_EMAIL_OTP = 'Home/ValidateEmailOTP';

// Existing user

export const EMAIL_EXIST = 'AccountSetup/CheckEmailExists';
export const LOGIN_VALIDATE = 'Home/LoginValidate';
export const VALIDATE_LOGIN_OTP = 'Home/LoginValidateOTP';
export const COMFIRM_LOGIN = 'Home/LoginValidateConfirm';
export const FORGOT_PASSWORD = 'Home/ForgotPassword';
export const UPDATE_PASSWORD = 'Home/UpdatePassword';
export const LOGOUT = 'Home/Logout';
export const KYAKOFORMSUBMISSION = 'Home/KyakoFormsSubmission';
export const GETJWTDESKPRO = 'Home/GetJWTDeskpro';
export const ADUSER_EXISTS = 'User/CheckADuser';
export const LICENSE_STATUS = 'AccountSetup/GetLicenseRenewalStatus';
// Payment flow:
export const GET_AUTHORIZATION_CODE = 'Home/GetAuthorizationCode';
export const VERIFY_AUTHORIZATION_CODE = 'Home/VerifyAuthorizationCode';
export const CONFIRM_AUTHORIZATION_CODE = 'Home/ConfirmVerificationCode';
export const PAYMENT_SUBMIT = 'AccountSetup/PaymentSubmit';
export const GET_AMOUNT_ENCRYPTED = 'User/GetEncrypted';

// Admin flow::
export const ACCOUNT_ACTIVATION = 'AccountSetup/AccountActivation';
export const SAVE_PRICING = 'AccountSetup/SavePricingDetails';
export const VERIFY_LICENSE_KEY = 'Home/ValidateLicenseKey';
export const SUBMIT_LICENSE_KEY = 'AccountSetup/SubmitLicenseKey';

// Agency flow:
export const AGENCY_VERIFY_LICENSE_KEY = 'AccountSetup/VerifyLicenseKey';
export const AGENCY_SUBMIT_LICENSE_KEY = 'AccountSetup/AgencySubmitLicenseKey';
export const AGENCY_CLIENT_CREATION = 'AccountSetup/AgencyClientCreation'; //changed
export const AGENCY_ACCOUNT_ACTIVATION = 'AccountSetup/AgencyActivation';

// Authentication Module:

// Audience

// Data Catalogue
export const DATA_CATALOGUE_ATTRIBUTES = 'Audience/GetDataCatelogue';
export const GET_CHANNEL_LIST = 'CommunicationSummaryReport/GetChannelList';
export const DATA_CATALOGUE_FILTER_GROUPS = 'Audience/GetFilterGroups';
export const DATA_CATALOGUE_CLASSIFICATIONS = 'Audience/GetDataClassifications';
export const DATA_CATALOGUE_DATA_TYPES = 'Audience/GetInputDataType';
export const DATA_CATALOGUE_INPUT_TYPES = 'Audience/GetDataattributeInputDataTypes';
export const DATA_CATALOGUE_DATEFORMATS = 'Audience/GetDataattributeFormat';
export const DATA_CATALOGUE_CHECK_UI_PRINTABLE_EXISTS = 'Audience/IsDataAttributeUIPrintableNameExist';
export const DATA_CATALOGUE_SAVE_ATTRIBUTE = 'Audience/SaveDataattribute';
export const DATA_CATALOGUE_UPDATE_ATTRIBUTE = 'Audience/UpdateDataattributes';
export const DATA_CATALOGUE_UPDATE_CLASSIFICATIONS = 'Audience/UpdateDataClassifications';
export const DATA_CATALOGUE_UPDATE_CLASSIFICATION_FALLBACK = 'Audience/saveFallbackNamefromEditPersonalisation';
export const DATA_CATALOGUE_ATTRIBUTE_BYID = 'Audience/GetDataattributeById';
export const GET_CHILD_LISTINGS = 'Audience/CatTypeListing';
export const IS_CAT_TYPE_NAME_EXISTS = 'Audience/CatTypeNameExist';
export const SAVE_CAT_TYPE = 'Audience/SaveCatType';
export const DATA_CATALOGUE_UPDATE_FILTERGROUP = 'Audience/UpdateFilterGroupClassifications';
export const DATA_CATALOGUE_GRID = 'Audience/GetDatacataloguegridview';
export const UPDATE_FILTER_GROUP = 'Audience/CreateorUpdateFilterGroup';
// ---- Master Data
export const IS_PARTNER_DATA_ENABLE = 'Audience/IsPartnerDataEnable';
export const MASTER_DATA_AUDIENCE = 'Audience/GetAudienceDashBoardandGridjson';
export const GET_AUDIENCE_GRID = 'Audience/audiencegridfield';
export const MASTER_DATA_BIND_AUDIENCE_CHART = 'Audience/BindAudienceChart';
export const MASTER_DATA_LISTACTIVITY = 'Audience/GetListAcquistions';
export const MASTER_DATA_RECIPIENT_ACQUISITION = 'Audience/GetRecipientAcquistions';
export const MASTER_DATA_MAKE_ACQUISITION = 'Audience/MakeAcquistionEventNote';
export const MASTER_DATA_GET_AUDIENCE_LIST_ATTRIBUTES = 'Audience/GetDataAttributesByDepartmenID';
export const MASTER_DATA_UPDATE_AUDIENCE_LIST_ATTRIBUTES = 'Audience/InsertdataattributeFiltergroup';
export const GET_LIST_ACQUISITION = 'Audience/GetListAcquisition';
export const GET_RECOMMENDATION_JSON = 'Audience/GetRecommendationJson';

//Sync history
export const GET_SYNC_HISTORY = 'Audience/GetSyncHistory';
export const GET_EXPORT_SYNC_HISTORY = 'Audience/GetExportSyncHistory';
export const GET_SYNC_HISTORY_INVALID_AUDIENCE = 'Audience/GetSyncHistoryInvalidAudience';
export const GET_LIST_ANALYSIS = 'Audience/GetListAnalysis';
export const GET_FILE_TYPE_STATUS_LIST = 'Audience/GetFileTypeDropdownvalues';

// -- Import
export const IMPORT_DESCRIPTION_EXISTS = 'Audience/IsImportDescriptionExist';
export const AUDIENCE_UPLOAD_VALIDATION = 'Audience/AudienceUploadValidation';
export const AUDIENCE_UPLOAD_ADHOC_VALIDATION = 'Audience/ValidateAdhocListFile';
export const AUDIENCE_UPLOAD_FILES = 'Audience/AudienceUploadForFiles';
export const AUDIENCE_IMPORT_SOURCE = 'Audience/AudienceImportSource';
export const AUDIENCE_FILENAME_EXISTS = 'Audience/IsFilenameExist';
export const GET_DEDUP_ATTRIBUTE = 'Audience/Getdedup_attributes';
export const SAVE_DEDUP_ATTRIBUTE_SETTING = 'Audience/SaveDedupsetting';
export const GET_DEDUPE_SETTING_BY_ID = 'Audience/GetDedupdetailsById';
export const GET_AUDIENCE_LIST_COUNT = 'Audience/GetAudienceListCount';
export const RETURN_TO_ADD_AUDIENCE = 'Audience/Return_to_AddAudience';
export const AUDIENCE_LIST_INSIGHT = 'Audience/Generate_ListInsights';
// -- Data attributes
export const AUDIENCE_GET_ATTRIBUTES = 'Audience/GetDataattribute';
export const AUDIENCE_GET_PERSONALIZED_ATTRIBUTES = 'Audience/GetPersonalisationDataAttributes';
export const AUDIENCE_ATTRIBUTES_MAPPING = 'Audience/AttributeMapping';
export const AUDIENCE_SAVE_COLUMN_MAPPING = 'Audience/SaveAudienceColumnMapping';
export const AUDIENCE_SAVE_MYSQL_COLUMN_MAPPING = 'Audience/UpdateRemoteColumn';

//Remote data source
// SQL
export const GET_TABLE_DATA = `Audience/GetTables`;
export const GET_TABLE_COL = `Audience/Getcolumn`;
// export const UPLOAD_COLUMNS = `Audience/UpdateRemoteColumn`;
export const SAVE_MYSQL = `Audience/InsertRemoteSettingAndColumn`;
export const DB_CONNECTIONS_EXIST = `Audience/DBConnectionExist`;
export const GET_TABLES_FROM_DB = `Audience/GetTablesFromDB`;
export const GET_COLUMN_TABLES = 'Audience/GetColumnsByTableFromDB';
export const GET_DATA_FROM_TABLES = 'Audience/GetDataFromTables';
export const UPDATE_DEDUPE_SETTING_RDS = 'Audience/UpdateDedupeinputsettingForRDS';

//CRM
export const CRMDB_CONNECTIONS_EXIST = `Audience/CheckDynamicCrmConnections`;
export const CRM_GET_TABLES = 'Audience/GetDynamicCrmTable';
export const CRM_GET_COLUMN_TABLES = 'Audience/GetDynamicCrmTableColumns';
export const CRM_CONNECT_TABLES = 'Audience/GetTableData';
export const CRM_CONNECT_CATEGORY = 'Connector/SyncTables';
export const CRM_TABLE_COLUMNS = 'Connector/SyncTableColumns';
export const CRM_TABLES = 'Connector/SyncCrmTables';
export const GET_CRM_TABLE_COLUMNS = 'Connector/SyncCrmTableColumns';
export const SYNC_CRM_DATA = 'Connector/SyncDataFetching';
export const SYNC_CRM_CUSTOM_DATA = 'Connector/SyncCrmCustomObjects';
export const GET_CONNECTION_TYPE = 'Connector/ConnectionType';
export const CUSTOM_TABLE_EXISTS = 'Connector/IsCustomTableExists';
export const SYNC_CRM_EXISTING = 'Connector/SyncCrmExistingObjects';

export const DATAEXCHANGE_CONNECT_EXIST = 'Connector/Connection';
export const GET_ORGANIZATION_LIST = 'Connector/GetOrganizationsList';

//Hubspot/CRM
export const DATAEXCHANGE_GET_TABLES = 'Connector/GetTables';
export const DATAEXCHANGE_GET_COLUMN_TABLES = 'Connector/GetTableColumns';
export const DATAEXCHANGE_DATA_FROM_TABLES = 'Connector/GetDataFromTables';
export const DATAEXCHANGE_ATTRIBUTES_SAVE = 'Connector/SaveRemoteColumnMapping';
export const GET_UPDATE_CYCLE = 'Connector/GetUpdateCycleFrequency';
export const GET_WISTIA_MEDIA = 'Connector/GetWistiaMedias';
///BQ

export const CONNECT_BQ = 'Audience/ConnectBigQuery';
export const GET_PROJECT_LIST = 'Audience/GetBqProjects';
export const GET_DATASET_LIST = 'Audience/GetBqDataSets';
export const GET_BQ_TABLE = 'Audience/GetBqTables';
export const GET_BQ_TABLECOLUMN = 'Audience/GetBqTableColumns';
//Bigquery
export const GET_BIGQUERY_DETAILS = 'Connector/SaveBigQueryJsonFile';
////FTP/SFTP

///Web Analytics
export const GET_MATOMO_SITES = 'Connector/GetMatomoSites';
export const GET_MATOMO_INSIGHTS = 'Connector/GetMatomoInsigths';

export const FRIENDLYNAME_CHECK = 'Audience/IsFriendlyNameAlreadyExist';
export const CONNECT_FTP = 'Audience/ConnectFTP';
////FTP/SFTP - TL
export const CONNECT_TL_FTP = 'Audience/SftpAudienceUpload';
export const TL_FTP_ATTRIBUTES_MAPPING = 'Audience/sftpattributemapping';
export const TL_FTP_ATTRIBUTES_SAVE = 'Audience/SaveRemoteColumnMapping';

//---Target list
export const GET_SFTP_CREDENTIALS = 'Audience/GetSFTPCredentials';
export const SAVESFT = 'Audience/SaveSFTPCredentials';
export const AUDIENCE_LIST_VIEW = 'Audience/GetAudienceList';
export const UPDATE_ARCHIVAL_STATUS = 'Audience/UpdateArchivalStatus';
export const TARGET_LIST_DOWNLOAD_ATTRIBUTES = 'Audience/GetActiveDataattributesForDownload';
export const GET_KEY_PERSON_INFO_OTP = 'Home/GetKeyPersonInfo';
export const REQUEST_KEY_PERSON_OTP = 'Home/RequestKeyPersonOtp';
export const TARGET_LIST_DOWNLOAD_FILES = 'Audience/ScheduleForSegmentationListSave';
export const GET_SEG_SCHEDULE = 'Audience/GetSegmentationScheduleDetails';
export const STOP_SEG_SCHEDULE = 'Audience/StopSchedulefrequency';
export const TARGET_LIST_DUPLICATE = 'Audience/DuplicateList';
export const TARGET_LIST_SEARCH_NAME = 'Audience/TargetlistSearchName';
export const TARGET_LIST_LEFT_SIDE_PANEL = 'Audience/TargetlistLeftSidePanelJson';
export const GET_VIRTUAL_FIELD_DATA = 'Audience/GetVirtualFieldValues';
export const TARGET_LIST_NAME_EXIST = 'Audience/IsListNameExist';
export const GET_ALL_GROUP_AUDIENCE_COUNT = 'Audience/GetAllGroupAudienceCountsFromResEngine';
export const GET_ATTRIBUTE_VALUES = 'Audience/GetUniqueAttributeValuesFromResEngine';
export const GET_ATTRIBUTE_VALUES_EDIT = 'Audience/EditGetUniqueAttributeValuesFromResEngine';
export const UPDATE_SAVE_TARGET_LIST = 'Audience/UpdatedOrSaveTargetlistOptimization';
export const UPDATE_SAVE_TARGET_LIST_NEW = 'Audience/UpdatedOrSaveTargetlistOptimizationNew';
export const UPDATE_TARGET_LIST_NAME = 'Audience/ListNameChange';
export const GET_EDIT_LIST = 'Audience/GetEditList'; //'Audience/GetEditListNew';
export const GET_EDIT_LIST_NEW = 'Audience/GetEditListNew';
export const UPDATE_CG_TG_VALUE = 'Audience/UpdateSegmentCGTGValue';
export const GET_TARGET_INFO = 'Audience/GetListMoreInfo';
export const GET_ADVANCE_ANALYTICS_LIST = 'Audience/GetAdvanceAnalyticsList';
export const GET_ANALYTICS_QUERY_OPTIONS = '/CommunicationSummaryListing/GetAnalyticsQueryOptions'
export const GET_ADVANCE_ANALYTICS_GRID = 'Audience/GetAdvanceAnalyticsjson';
export const GET_AUDIENCE_CSV_DOWNLOAD = 'audience/downloadfile';
export const GET_ADVANCE_ANALYTICS_DOWNLOAD = 'audience/AdvanceAnalyticsSaveList';
export const GET_TL_SHARELIST = 'Audience/Sharelist';
export const GET_ONLINE_AUDIENCE = 'Audience/GetOnlineAudienceCustomAttributes';
export const GET_TL_SHARE_UPLOAD = 'Audience/SocialMediaAudienceUpload';
export const GET_TL_SAMPLELIST = 'Audience/GetListSampleRecords';
export const REMOVE_TL_SEEDLIST = 'Audience/Seedlistdelete';
export const GET_COMMNUICATION_NAMES = 'Audience/GetCommunicationNames';
export const GET_SUBSCRIPTION_FORM_NAMES = 'Audience/GetFormName';
export const GET_FULL_JSON_ATTRIBUTE_VALUES = 'Audience/FulljsonDownloadGetUniqueAttributeValues';
export const GET_AUDIENCE_DATA_SERVICE = 'Audience/GetDataService';
export const GET_DATA_ATTRIBUTEGROUPS = 'Audience/GetAttributeGroups';
export const GET_DATA_ATTRIBUTE_GROUPNAME = 'Audience/GetAttributesByAttributeGroupName';
export const GET_AUDIENCE_SELECTEDCOLS = 'Audience/GetSelectedCols';
export const GET_AUDIENCE_VERSION_HISTORY = 'Audience/GetVersionHistory';
export const SAVE_DATA_AUGMENTATION = 'Audience/GetSaveAPI';
export const GET_TL_DL_USERLIST = 'Audience/getUserNameByList';
//Partner Data
export const GET_ALL_GROUP_AUDIENCE_COUNT_PARTNER = 'Digipop/GetPotentialAudience';
export const UPDATE_SAVE_TARGET_LIST_PARTNER = 'Audience/UpdatedOrSaveTargetlistOptimizationPartner';
export const GET_DIGIPOP_ENABLED = 'Digipop/GetDigipopEnabled';
export const GET_DIGIPOP_GROUPATTRIBUTES = 'Digipop/GetDigipopGroupAttributes';
export const SAVE_DIGIPIP_ATTRIBUTES = 'Audience/SaveorUpdatePartnerDigipopRemotesetting';

//Zeroday files
export const GET_ALL_ZERODAY_FILES = 'Audience/GetFileNameZeroFlatFiles';
export const GET_ZERODAY_HEADER_DATA = 'Audience/GetFileHeaderZeroFlatFiles';
export const GET_ZERODAY_HEADER_VALUES = 'Audience/GetFileHeaderValues';

// TargetList SubSegment
export const GET_SEGMENT_EXPRESSION_BYIDS = 'Audience/GetSegmentationExpressionByListId';
export const SAVE_SUBSEGMENT_RULE = 'Audience/SaveOrUpdateSubsegment';
export const GET_SUBSEGMENT_WATERFALLCOUNT = 'Audience/GetSubSegmentWaterfallCount';
export const TARGETLIST_SUBSEGMENT_BY_ID = 'Audience/GetSubsegemntById';
export const ADHOCLISTID_BY_ATTRIBUTES = 'Audience/GetAttributesByAdhocListId';
export const ADHOCLIST_VALUES_BY_ATTRIBUTE_NAME = 'Audience/GetValuesByAttributeName';
export const ADHOCLIST_VALUES_BY_WATERFALLCOUNT = 'Audience/GetAdhocListSubSegmentWaterfallCount';

// ---------------Match list------------------
export const MATCH_INPUT_LIST = 'Audience/GetMatchsupInputList';
export const GET_ATTRIBUTE_NAME = 'Audience/GetAttributeNameBySegListId';
export const ML_LIST_SAVE = 'Audience/MLSLOutputListSave';
export const EDIT_NAME_SAVE = 'Audience/MLSLNameSave';
// RFA
export const RFA_TARGET_LIST_APPROVE = 'Audience/ApproveTargetListRequest';
export const RFA_TARGET_LIST_REJECT = 'Audience/TargetListRejectRequest';
//CGTG
export const TL_CGTG_ONOFF = 'Audience/IsCGTGONOFF';
//---Dynamic list
export const DYNAMIC_LIST_GET_TRIGGER_SOURCE = 'Audience/GetTriggerSource';
export const DYNAMIC_LIST_GET_TRIGGER_ATTRIBUTES = 'Audience/GetTriggerAttributes';
export const DYNAMIC_LIST_GET_TRIGGER_BASE_DDL = 'Audience/GetTriggerBaseDDLData';
export const DYNAMIC_LIST_GET_TRIGGER_ATTRIBUTES_VALUES = 'Audience/GetTriggerAttributeValues';
export const DYNAMIC_LIST_GET_CUSTOM_EVENTS_VALUE = 'Audience/CustomEventsValue';
export const CREATE_DYNAMIC_LIST = 'Audience/CreateDynamicList';
export const GET_DYNAMIC_LISTS = 'Audience/GetDynamicList';
export const GET_DYNAMIC_LISTS_BY_ID = 'Audience/GetDynamicListById';
export const IS_LIST_NAME_EXIST = 'Audience/IsDynamicListNameExists';
export const DUPLICATE_DYNAMIC_LIST = 'Audience/DynamiclistDuplication';
export const DYNAMIC_LIST_MORE_INFO = 'Audience/DynamicListMoreinfo';
export const DYNAMIC_LIST_SEARCH_NAME = 'Audience/SearchName';
export const DYNAMIC_LIST_SEARCH_COUNT = 'Audience/GetdynamicListCount';
export const DYNAMIC_LIST_DOWNLOAD = 'Audience/SaveDynamiclistRequestDownloadConfig';
export const DYNAMIC_LIST_DOWNLOAD_FILE = 'Audience/dynamiclistdownload';
export const GET_DYNAMIC_LIST_SCHEDULE = 'Audience/GetdynamiclistScheduleDetails';
export const STOP_DYNAMIC_LIST_SCHEDULE = 'Audience/Stopdynamiclistfrequency';
export const DYNAMIC_TIME_ZONE_DETAILS = 'Audience/GetTimezoneDetails';
export const GET_GEO_FENCES_LISTS = 'MobilePush/GetGeoFencesLists';
export const GET_GEO_FENCE_DETAILS_BY_ID = 'MobilePush/GetGeoFenceDetailsByID';
export const GET_COMMUNICATION_BYCHANNEL = 'Audience/Getcommunicationchannel';
// RFA
export const RFA_DYNAMIC_LIST_APPROVE = 'Audience/ApproveDynamicListRequest';
export const RFA_DYNAMIC_LIST_REJECT = 'Audience/DynamicListRejectRequest';
//Dashboard
export const GET_RECENT_CAMPAIGNS = 'Dashboard/GetActiveCampaigns';
export const GET_ROI_DATA = 'Dashboard/GetRoiData';
export const GET_CHANNEL_PERFORMACE = 'Dashboard/GetChannelPerformance';
export const GET_AUDIENCE_BEHAVIOUR_DATA = 'Dashboard/GetCustomPropensityData';
export const GET_TOP_PERFORMANCES_DATA = 'Dashboard/GetTopPerformanceCampaigns';
export const GET_TOP_EARNING_DATA = 'Dashboard/GetTopRevenueCampaigns';
export const GET_AVG_TIME_DATA = 'Dashboard/GetAvgTimeToConvertion';
export const GET_LEADS_CHANGE_DATA = 'Dashboard/GetLeadsSourceData';
export const GET_SEGMENTS_DATA = 'Dashboard/GetSegmentAndIndustryReport';
export const GET_ALL_DASHBOARD_DATA = 'Dashboard/GetDashboard';

//Twin

export const GET_ALL_DASHBOARD_DATA_TWINS = 'DashboardTwin/GetDashboard';

//Web Live Dashboard

export const GET_WEB_AUDIENCE_COUNT = 'Home/GetAudienceCount';
export const GET_WEBDASHBOARD = 'Home/GetWebDashboardFeather';
export const GET_WEB_LIVECOUNT = 'Home/GetLiveCountBQ';
export const GET_WEB_PATHANALYSER = 'home/GetPathAnalyzerFeather';
export const GET_PATHANALYSER_DDL = 'communication/GetPathAnalyzerDDLData';

// Mobile live dashboard
export const GET_MOBILE_LIVEDATA = 'Home/GetMobileAppDashboardFeather';
export const GET_MOBILE_PATHANALYSER = 'home/GetPathAnalyzerFeatherMobile';

//Communication

//Listing
export const GET_COMMUNICATION_LIST = 'Communication/CommunicationList';
export const GET_COMMUNICATION_LIST_EXTENSION = 'Communication/CommunicationListextension';
export const GET_CAMPAINGN_STATUS = 'Communication/GetCampaignStatus';
export const GET_CAMPAINGN_STATUS_EXTENSION = 'Communication/GetCampaignStatusExtensionByID ';
export const DUPLICATE_COMMUNICATION = 'Communication/DuplicateCommunication';
export const MDC_DUPLICATE_COMMUNICATION = 'Communication/MDCDuplicateCommunication';
export const SHOW_SELECTED_DETAILS = 'Communication/GetEDMDetails';
export const DELETE_CHANNEL = 'Communication/DeleteChannel'; // Not used
export const DELETE_BY_CHANNEL = 'Communication/DeletebyChannel'; // Not used
export const TIGGER_PAUSE_AND_PLAY_CAMPAIGN = 'Communication/PlayPauseTrigger';
export const LISTNAME_SEARCH = 'Communication/CommunicationlistSearchName';
export const ANALYTICS_LISTNAME_SEARCH = 'CommunicationSummaryListing/GetAnalyticsListSearchName';
export const ARHIVE_COMMUNICATION = 'Communication/ArchiveCampaign';
export const UNARHIVE_COMMUNICATION = 'Communication/UnArchiveCampaign';
export const DELETE_COMMUNICATION = 'Communication/DeleteCampaign';
export const DELETE_CHANNEL_BY_ID = 'Communication/DeleteChannelById';
export const GET_COMM_TAGS = 'Communication/GetTags';
export const GET_COMM_SPLIT_POPUP = 'Communication/GetSplitABTestingResult';
export const GET_COMM_SPLITAB_PROCESS_RECIPIENTS = 'Communication/SplitABTestProcessRemainingRecipients';
export const GET_CAMPAIGN_MAKE_CHANGES = 'Communication/GetCampaignMakechanges';
export const GET_CAMPAIGN_REJECTS_COMMENTS = 'Communication/GetCampaignRejects';
export const GET_PREVIEW_BY_CHANNEL = 'Communication/GetListingPreviewImage';
export const GET_LISTING_USER_LIST = 'Communication/GetUserListCommunication';

//Gallery
export const GET_GALLERY_LIST = 'Communication/GetCampaignGalleryList';
export const GET_INFO_LIST = 'Communication/GetChannelFact';

//Planner
export const GET_PLANNER_EVENTS = 'Communication/GetCampaignPlannerListPrevNext';
export const GET_PLANNER_SINGLE_EVENTS = 'Communication/GetCampaignPlannerListSingle';

//Plan:
export const CAMPAIGN_NAME_EXISTS = 'Communication/IsCampaignNameExists  ';
export const GET_COMMUNICATION_TYPES = 'Communication/GetCommunicationTypes';
export const GET_COMMUNICATION_PRODUCTS = 'Communication/GetCommunicationProducts';
export const GET_COMMUNICATION_SUB_PRODUCTS = 'Communication/GetCommunicationSubProducts';
export const GET_COMMUNICATION_ATTRIBUTES = 'Communication/GetCommunicationAttributes';
export const GET_BENCHMARK_DETAILS = 'Communication/GetBenchMarkdetails';
export const CREATE_CAMPAIGN_PLAN = 'Communication/CreateCampaignPlan';
export const GET_CONVERSION_TYPE_LIST = 'Communication/GetConversionTypesList';
export const GET_DYNAMIC_LIST_COMMUNICATION = 'Communication/GetDynamicListforCommunication';
export const GET_COMMUNICATION_REFERENCE = 'Communication/GetCommunicationreference';
export const UPLOAD_COMMUNICATION_DOCKET = 'Communication/UploadCampaignFileDocket';
export const GET_CAMPAIGN_BY_ID = 'Communication/GetCampaignPlanByID';
export const GET_TRIGGER_DYNAMICLIST = 'Communication/GetTriggerDynamicList';
export const SAVE_PRODUCT_CATEGORY = 'User/InsertProductCategory';
export const SAVE_SUB_PRODUCT_CATEGORY = 'User/InsertSubProductCategory';
export const GET_USER_LIST_CAMPAIGN = 'Communication/GetUserListCampaign';
//Communication

//Create communication -

//SmartLink
export const GET_MOBILE_APPS = 'Communication/GetMobileApps';
export const GET_SMARTLINK_CUSTOM_FIELDS = 'Communication/GetSmartlinkCustomFieldsvalues';
export const GET_SCREEN_LIST = 'Communication/GetScreenList';
export const GET_SUB_SCREEN_LIST = 'Communication/GetSubScreenList';
export const GET_SMARTURL_DETAIL_BY_CHANNEL = 'Communication/GetSmartUrlDetailByChannel';
export const SAVE_SMART_URL = 'Communication/SaveSmartUrl';
export const GET_SMART_URL = 'Communication/GetSmartUrlDetailByCampaignID';

//SMS:

export const GET_SENDLIVETEST = 'Communication/SendLiveTest';
export const GET_RECIPIENT_COMMUNICATION = 'Communication/GetRecipientsForCommunication';
export const GET_CAMPAIGN_BLAST_DETAILS = 'Communication/GetCampaignBlastDetails';
export const GET_SMS_SETTINGS = 'Communication/GetSMSSettings';
export const GET_SMS_SETTINGS_DETAIL = 'Communication/GetSMSSettingsDetail';
export const GET_PERSONALIZATION_FIELDS = '/Communication/GetPersonalizationFields';
export const SAVE_SMS_CAMPAIGN = 'Communication/SaveSMSCampaign';
export const GET_SMS_CAMPAIGN_BY_ID = 'Communication/GetSMSCampaignById';
export const GET_SMS_LANGUAGE = 'Communication/GetSMSLanguages';
// SMS - Whatsapp
export const GET_HSM_TEMPLATE = 'Communication/GetHSMTemplate';
export const SAVE_WHATSAPP_CAMPAIGN = 'Communication/SaveWACampaign';
export const GET_WHATSAPP_CAMPAIGN_BY_ID = 'Communication/GetWACampaignById';
export const GET_SENDER_NAME = 'Communication/GetWASenderName';
export const GET_TEMPLATE_LANGUAGE = 'Communication/GetWaLanguages';
export const GET_UPLOADSIZE = 'Communication/StorageSizeOfUrl';
export const GET_CONTACT_BY_USERID = 'Communication/GetContactByUserID';
export const UPLOAD_IMAGE = 'Communication/UploadWhatsApp';
export const UPLOAD_VIDEO_DOCUMENT = 'Communication/UploadDocuments';

// RCS
export const GET_RCS_SENDERNAME = 'Communication/GetRCSSenderName';
export const GET_RCS_TEMPLATE = 'Communication/GetRcsTemplate';
export const GET_RCS_CONTENT_TEMPLATEID = 'Communication/GetContentforRcsTemplateID';
export const SAVE_RCS_CAMPAIGN = 'Communication/SaveRcsCampaign';
export const GET_RCS_CAMPAIGN_BYID = 'Communication/GetRCSCampaignById';

//Email

export const CLIENT_SENDER_ID_EMAIL = 'Communication/GetClientSmtpSenderIDSetting';
export const CHECK_EMAIL_SPAM = 'Communication/CheckSpam';
export const GET_SMTP_SETTINGS = 'Communication/GetSmtpSetting';
export const SUBJECT_ANALYSIS = 'Communication/SubjectAnalysis';
export const SUBJECT_ANALYSIS_ENABLE = 'Communication/IsEmailSubjectEnable';
export const GET_EMAIL_FOOTER_LIST = 'Communication/GetEmailFootersList';
export const GET_EMAIL_COMMUNICATION = 'Communication/GetEmailCommunication';
export const SAVE_EMAIL_COMMUNICATION = 'Communication/SaveEmailCommunication';
export const SAVE_EMAIL_TEMPLATE_CONTENT = 'Communication/SaveEmailTemplateContent';
// export const SAVE_EMAIL_COMMUNICATION = 'Communication/SaveEmailCommunicationBGT'; //RS-6076
export const UPLOAD_COMMUNICATIONFILE = 'Communication/UploadCommunicationFile';
export const UPLOAD_COMMUNICATIONFILE_WEB = 'Communication/UploadCampaignFileWeb';
export const UPLOAD_RICHIMAGEFILE = 'Communication/UploadEmailImageText';

//Direct mail

export const GET_CDM_TRANSFERMRTHOD = 'Communication/GetCDMTransferMethod';
export const SAVE_DIRECTMAIL = 'Communication/SaveDirectMailCampaign';
export const GET_DIRECTMAIL = 'Communication/GetDirectMailCampaignByID';
export const GET_VENDOR_FROM_REMOTESETTING = 'Communication/GetVendorFromRemoteSetting';
//Social post:

export const GET_SOCIAL_MEDIA_SETUP = 'Communication/GetSocialMediaSetupDrpDwn';
export const GET_FACEBOOK_COUNTRIES = 'Communication/GetFacebookCountries';
export const GET_FACEBOOK_CITIES_BASED_COUNTRY = 'Communication/GetFacebookCitiesbasedCountry';
export const MANAGE_SOCIAL_POST = 'Communication/ManageSocialMediaPost ';
export const GET_SOCIAL_POST_BY_LEVEL = 'Communication/GetSocialMediaPostsByLevel';
export const IMG_UPLOAD_SOCIAL_POST = 'Communication/Upload';
export const VIDEO_UPLOAD_SOCIAL_POST = 'Communication/UploadLinkedInVideo';

//Voice
export const SAVE_CALL_CENTER = 'Communication/SaveVCC';
export const GET_CALL_CENTER_BY_ID = 'Communication/GetCallCenterCampaignById';

//Paid media
export const GET_PAID_MEDIA_LIST = 'Communication/GetPaidMediaSetupList';
export const GET_PAID_MEDIA_POST = 'SocialMedia/GetSocialMediaPostNameByCampaign';
export const GET_SOCIAL_MEDIA_APP_KEYS = 'SocialMedia/SaveSocialmediaAppKeys';
export const SAVE_AND_UPDATE_PAID_MEDIA = 'Communication/SavePaidMediaCommunication';
export const GET_PAID_MEDIA_SAVE_LIST = 'Communication/GetSocialMediaPaidPost';
export const SAVE_DIGIPOP_COMMUNICATION = 'digipop/SaveCampaign';
export const GET_DIGIPOP_COMMUNICATION = 'digipop/GetCampaign';
export const UPDATE_DIGIPOP_COMMUNICATION = 'digipop/UpdateCampaign';
export const GET_DIGIPOP_AUDIENCE = 'digipop/GetAudience';
export const GET_DIGIPOP_IMPRESSIONBALANCE = 'digipop/GetBalance';

//VMS

export const GET_VMS_SENDER_NAME = 'Communication/GetVMSSenderName';
export const GET_VMS_TEMPLATE_LIST = 'Communication/GetVMSTemplateList';
export const GET_VMS_LANGUAGE = 'Communication/GetVMSLanguages';
export const SAVE_VMS = 'Communication/SaveVMS';
export const GET_VMS_CAMPAIGN_BY_ID = 'Communication/GetVMSCampaignById';
export const UPLOAD_AUDIO_FILE = 'Communication/Uploadaudiofile';

//Web push Notification

export const GET_WEB_NOTIFY_DOMAINS = 'Communication/GetWebNotifyDomain';
export const GET_INBOX_CLASSIFICATIONS = 'Communication/GetInBoxClassifications';
export const UPLOAD_WEB_PUSH = 'Communication/UploadWebPush';
export const SAVE_WEB_PUSH = 'Communication/SaveWebNotification';
export const GET_WEB_PUSH_BY_ID = 'Communication/GetWebNotifyCampaignById';

export const GET_COMMUNICATION_IMPORTCAMPAIGN = 'Communication/ImportCampaign';
//Mobile push Notification
export const GET_PUSH_NOTIFY_DOMAIN = 'Communication/GetPushNotifyDomain';
export const UPLOAD_MOBILE_PUSH = 'Communication/UploadMobilePush';
export const GET_AUDIO_LIST_BY_APP = 'Communication/GetAudioListbyApp';
export const SAVE_MOBILE_PUSH = 'Communication/SaveMobileNotification';
export const GET_MOBILE_PUSH_BY_ID = 'Communication/GetMobileNotifyCampaignById';
export const GET_SYNC_BANNER_DETAILS = 'Communication/SyncBannerDetails';

//Web Analytics

export const GET_WEBANALYTICS = 'Communication/GetWebAnalyticsContent';
export const WEBANALYTICS_LIST = 'Communication/GetAnalyticsDomains';
export const WEBANALYTICS_DOMAIN_LIST = 'Communication/GetAnalyticsSettingDetails';
export const WEBANALYTICS_SAVE = 'Communication/CreateWebAnalyticsChannel';
export const WEBANALYTICS_SUBSCRPTION_FORMLIST = 'Communication/GetSubscriptionFormList';
export const WEBANALYTICS_SAVE_CAPTURE_FIELDS = 'Communication/SaveWebCaptureFields';
export const GET_ANALYTICS_CAPTURE_FIELDS = 'Communication/GetFieldTrackList';

// Mobile analytics
export const SAVE_MOBILE_ANALYTICS = 'Communication/saveAppCampaign';
export const APP_ANALYTICS_CONTENT = 'Communication/GetAppAnalyticsContent';
export const APP_ANALYTICS_SAVE_MOBILE_CAPTURE_FIELDS = 'Communication/SaveMobileCaptureFields';

//// video analytics

export const VIDEO_ANALYTICS_DOMAIN_LIST = 'Communication/GetVideoSocialMediaLists';
export const VIDEO_VALIDATION = 'Communication/IsVideoValid';
export const SAVE_VIDEO_CAMPAIGN = 'Communication/SaveVideoCampaign';
export const GET_ALL_VIDEOANALYTICS_CONTENT = 'Communication/GetVideoAnalyticsContent';

//Sentiment/ORM
export const SENTIMENT_NAME_EXIST = 'Communication/IsORMProfileNamePresent';
export const SENTIMENT_SAVE = 'Communication/AddOrmProfile';
export const SENTIMENT_GET = 'Communication/GetOrmProfileByCampaignId';

//Offline conversion
export const GET_OFFLINECONVERSION_ATTRIBUTES = 'Communication/GetOfflineConversionAttributes';
export const SAVE_OFFLINECONVERSION = 'Communication/SaveOfflineConversion';
export const GET_OFFLINECONVERSION_VALUES = 'Communication/SelectedOfflineConversionvalues';
export const GET_OFFLINECONVERSION_DETAILS = 'Communication/GetOfflineConversionDetails';
export const GET_CROSS_BU_STATUS = 'Audience/GetCrossBUStatus';
export const GET_OFFLINE_CONVERSION_BU = 'Audience/GetBusinessUnits';
export const GET_CONVERSION_MATCHING_KEY = 'Audience/GetConversionMatchingKey';

//MDC workflow

export const GET_MDC_CANVAS_TEMPLATE_LIST = 'MDC/GetMdcTemplateList';
export const SAVE_MDC_CANVAS_DATA = 'MDC/SaveCanvasData';
export const GET_MDC_CANVAS_DATA = 'MDC/GetMDCJsonData';
export const GET_MDC_CHANNEL_RESPONSE_DATA = 'MDC/GetChannelResponceData';
export const SAVE_CHANNEL_FRIENDLY_NAME = 'MDC/SaveChannelFriendlyName';
export const UPDATE_CASCADING_SCHEDULE = 'MDC/UpdateCascadingSchedules';
export const GET_MDC_CANVAS_FLOW_CONFIG = 'MDC/GetMDCCanvasFlowConfig';
export const DELETE_MDC_CHANNELS = 'MDC/DeleteMDCChannels';
export const SAVE_AS_TEMPLATE_MDC = 'MDC/SaveasTemplateMDC';
export const GET_SELECTED_MDC_TEMPLATE_DATA = 'MDC/GetSelectedMdcTemplateData';
export const UPDATE_ALL_OR_ANY = '/MDC/UpdateAllorAny';
export const ADD_OR_REMOVE_ATTR = '/MDC/AddorRemoveAttributeCondition';
export const SAVE_TRIGGER_CANVAS_DATA = '/MDC/SaveTriggerCanvasData';
export const SUBSEGMENT_AGANIST_CHANNEL_COUNT_ADHOCLIST = 'Audience/GetSubSegmentChannelCount';
export const SUBSEGMENT_AGANIST_CHANNEL_COUNT_TARGETLIST = 'Audience/GetChannelCounts';
export const SUBSEGMENT_DISABLE_CHANNELS = 'MDC/DisableMDCSubsegmentChannels';
export const SUBSEGMENT_ENABLE_CHANNELS = 'MDC/EnableMDCSubsegmentChannels';

//MDC workflow subsegment
export const UPSERT_SUB_SEGMENT_JOURNEY = '/MDC/UpsertSubsegmentJourney';
export const SAVE_PRIORITY_SEGMENTS = '/MDC/SavePrioritySegments';

//MDC Landing page preferences/analytics
export const GET_SUBSCRIPTION_ACTIVE_FORM = '/MDC/GetActiveForms';
export const GET_CONVERSION_CATEGORY = 'Communication/GetConversionCategory';
export const SET_LANDING_PAGE = 'MDC/SetLandingPage';
export const GET_LANDING_PAGE = 'MDC/GetConversionByCampaignid';
export const GET_MDC_OFFLINE_CONVERSION_EDIT = '/MDC/getOfflineConversionLandingPage';

//MDC Webhooks
export const GET_WEBHOOK_LIST = 'MDC/GetWebHookLists';
export const GET_WEBHOOK_ATTRIBUTE_NAME = 'MDC/GetWebHookAttributeName';
export const SAVE_WEBHOOK = 'MDC/CreateWebHook';
export const GET_WEBHOOK = 'MDC/GetWebHook';

// ROI
export const GET_CAMPAIGN_ROI = 'Communication/GetCampaignRoi';
export const GET_CAMPAIGN_ROI_DETAILS = 'Communication/GetCampaignRoiDetails';
export const GET_BENCHMARK_BY_CAMPAIGN_ID = 'Communication/GetBenchmarkValueByCampaignId';
export const SAVE_CAMPAIGN_ROI = 'Communication/SaveCampaignRoi';

//Execute
export const GET_CAMPAIGN_ANALYZE_LIST = 'Communication/GetCampaignAnalyzeList';
export const GET_ADVANCED_CUSTOM_FIELDS = 'Communication/GetAdvancedCustomFields';
export const SAVE_ADVANCE_ANALYTICS = 'Communication/SaveAdvanceAnalytics';
export const UPDATE_SCRUB_RULES = 'Communication/UpdateScrubRules';
// export const FREQUENCY_CAP_ON_OFF = 'Communication/getfrequencycap';
export const SAVE_FREQUENCY_CAP = 'Communication/SaveFrequencyCappingForCampaign';
export const DELETE_FREQUENCY_CAP = 'Communication/UpdateFrequencyCappingForCampaign';
export const SAVE_LIMIT_LIST = 'Communication/UpdatePrecampaignsummaryMLcounts';
export const GET_LIMIT_LIST = 'Communication/GetLimitList';
export const GET_FREQUENCY_CAP_EDIT = 'Communication/GetFrequencyCapEditForCampaign';
export const UPDATE_CGTG_COMMUNICATION = 'Communication/UpdateCampaignCGTGValue';

// Analytics

//Analytics Listing
export const GET_COMMUNICATION_INFO_LIST = 'CommunicationSummaryListing/GetCampaignChannelInfoList';
export const GET_COMMUNICATION_INFO_GRID = 'CommunicationSummaryListing/GetCommunicationSummaryListGridview';
export const GET_COMMUNICATION_SUMMARY_LIST = 'CommunicationSummaryListing/GetCommunicationSummaryList';
export const GET_TOP_DEVICES = 'CommunicationSummaryReport/TopDevice';
export const COMMUNICATION_SUMMARY = 'CommunicationSummaryReport/CommunicationSummaryReport';
export const GET_BENCHMARK = 'GoalsandBenchmark/GetBenchmark';
export const GET_COMMUNICATION_PRE_BLAST = 'CommunicationSummaryReport/GetCommunicationPreBlast';
export const GET_COMMUNICATION_TRENDS = 'CommunicationSummaryReport/GetCommunicationTrends';
export const GET_GEOGRAPHY = 'CommunicationSummaryReport/GetGeography';
export const GET_DEMOGRAPHICS = 'CommunicationSummaryReport/GetDemographics';
export const GET_SEGMENT_INDUSTRY = 'CommunicationSummaryReport/GetSegmentIndustry';
export const SET_GOLDEN_CAMPAIGN = 'CommunicationSummaryReport/SetGoldenCampaign';
export const NEW_CONTACT_LIST = 'CommunicationSummaryReport/GetNewContact';
export const UNKNOWN_TO_KNOWN_CONVERSION = 'CommunicationSummaryReport/UnknownToKnownConversion';
export const GET_KNOWN_AND_UNKNOWN = 'CommunicationSummaryReport/GetKnownandUnknown';
export const COMMUNICATION_RECOMMENDATIONS = 'CommunicationSummaryReport/CommunicationRecommendations';
export const GET_RETARGETLIST_STATUS = 'CommunicationSummaryReport/GetRetargetListStatus';
export const GET_SNAP_NAME_LIST = 'CommunicationSummaryReport/GetSnapNameList';
export const SAVE_SNAPSHOTS = 'CommunicationSummaryReport/SaveSnapshots';
export const GET_SNAP_DETAILS = 'CommunicationSummaryReport/GetSnapDetails';
export const BIND_LINK_CSV_DOWNLOAD = 'CommunicationSummaryDetail/BindTopLinkClicksDownloadCSV';
export const GET_SHOWLINK = 'CommunicationSummaryDetail/GetShowLink';
export const SAVE_RETARGETLIST = 'Audience/CreateReTargetlist';
//PDF download

export const GET_CSR_PDFDOWNLOAD = 'CommunicationSummaryReport/PDFDownload';
export const GET_ATTRIBUTION_FOR_ROI = 'CommunicationSummaryReport/GetSingleandMultiTouch';
//Detail page
export const DETAIL_REPORT = 'CommunicationSummaryDetail/Report';
export const CLICK_ACTIVITY_DETAILS = 'CommunicationSummaryDetail/BindTopLinkClicksDetail';
export const COMMUNICATION_STATUS = 'CommunicationSummaryDetail/BindActivityList';
export const DETAIL_REPORT_CHANNELDETAILS = 'CommunicationSummaryDetail/GetCampaignChannelDetails';
export const DETAIL_REPORT_CONTENTDETAILS = 'CommunicationSummaryDetail/GetCampaignContentDetails';
export const DETAIL_REPORT_OVERVIEWDETAILS = 'CommunicationSummaryDetail/GetCampaignOverviewDetails';
export const DETAIL_REPORT_OVERVIEWDETAILSSSE = 'CommunicationSummaryDetail/GetSSECampaignOverviewDetails';
export const GET_ANALYTICSUSER_JOURNEY = 'CommunicationSummaryDetail/GetAnalyticsUserJourney';
export const DETAIL_REPORT_SEGMENTDETAILS = 'CommunicationSummaryDetail/GetCampaignSegmentationDetails';
export const DETAIL_REPORT_OTPTOKEN_VALID = 'CommunicationSummaryDetail/ValidateOTP';
export const DETAIL_REPORT_OTPTOKEN = 'CommunicationSummaryDetail/SendOTP';
export const DETAIL_REPORT_DOWNLOAD = 'CommunicationSummaryDetail/SubmitCSVDownload';
export const DETAIL_DOCKET = 'CommunicationSummaryDetail/GetCampaignDocket';
export const DETAIL_DOCKET_DOWNLOAD = 'CommunicationSummaryDetail/GetCampaignDocketDownload';
export const DETAIL_EMAIL_HEATMAP_REPORT = 'CommunicationSummaryDetail/EmailHeatMapReport';
export const DETAIL_DOWNLOAD_COMM_STATUS_ACTIVITY = 'CommunicationSummaryDetail/DataDownloadActivity';
export const DETAIL_ADVANCE_SEARCH = 'CommunicationSummaryDetail/AdvanceSearchFilter';
export const DETAIL_ADVANCE_SEARCH_DATA = 'CommunicationSummaryDetail/AdvanceAnalyticsFilter';
export const DETAIL_GET_KYC_COUNT = 'Form/GetKYCCount';
//AA360

export const AA360_OVERVIEW = 'UserAnalytics360/Overview';
export const AA360_USERINFO = 'UserAnalytics360/UserInfo';
export const AA360_USERREPORT_LIST = 'UserAnalytics360/UserReportList';
export const AA360_USER_TIMELINE = 'UserAnalytics360/TimeLine';
export const AA360_USER_DATAATTRIBUTES = 'UserAnalytics360/GetDataAttributs';
export const AA360_USER_GETPASSPORT_SEARCH = 'UserAnalytics360/GetPassportID';
export const AA360_GET_WEB_NOTIFY_GOAL_SETTING = 'UserAnalytics360/GetWebnotifyGoalSetting';
export const AA360_GET_GOAL_PATH_CONVERSION_DATA = 'UserAnalytics360/GetGoalpathConversionData';
export const AA360_SAVE_RETARGETLIST = 'Audience/UpdatedOrSaveReTargetlist';

//Audit log

export const AUDIT_LOG = 'AuditLogs/GetAuditLogsData';

// Analytics Digital twins

//Analytics Listing
export const GET_COMMUNICATION_INFO_LIST_TWINS = 'CommunicationSummaryListingTwin/GetCampaignChannelInfoList';
export const GET_COMMUNICATION_INFO_GRID_TWINS = 'CommunicationSummaryListingTwin/GetCommunicationSummaryListGridview';
export const GET_COMMUNICATION_SUMMARY_LIST_TWINS = 'CommunicationSummaryListingTwin/GetCommunicationSummaryList';

//Analytics Report
export const GET_TOP_DEVICES_TWINS = 'CommunicationSummaryReportTwin/TopDevice';
export const COMMUNICATION_SUMMARY_TWINS = 'CommunicationSummaryReportTwin/CommunicationSummaryReport';
export const GET_BENCHMARK_TWINS = 'GoalsandBenchmarkTwin/GetBenchmark';
export const GET_COMMUNICATION_PRE_BLAST_TWINS = 'CommunicationSummaryReportTwin/GetCommunicationPreBlast';
export const GET_COMMUNICATION_TRENDS_TWINS = 'CommunicationSummaryReportTwin/GetCommunicationTrends';
export const GET_GEOGRAPHY_TWINS = 'CommunicationSummaryReportTwin/GetGeography';
export const GET_DEMOGRAPHICS_TWINS = 'CommunicationSummaryReportTwin/GetDemographics';
export const GET_SEGMENT_INDUSTRY_TWINS = 'CommunicationSummaryReportTwin/GetSegmentIndustry';
export const SET_GOLDEN_CAMPAIGN_TWINS = 'CommunicationSummaryReportTwin/SetGoldenCampaign';
export const NEW_CONTACT_LIST_TWINS = 'CommunicationSummaryReportTwin/GetNewContact';
export const UNKNOWN_TO_KNOWN_CONVERSION_TWINS = 'CommunicationSummaryReportTwin/UnknownToKnownConversion';
export const GET_KNOWN_AND_UNKNOWN_TWINS = 'CommunicationSummaryReportTwin/GetKnownandUnknown';
export const COMMUNICATION_RECOMMENDATIONS_TWINS = 'CommunicationSummaryReportTwin/CommunicationRecommendations';
export const GET_RETARGETLIST_STATUS_TWINS = 'CommunicationSummaryReportTwin/GetRetargetListStatus';
export const GET_SNAP_NAME_LIST_TWINS = 'CommunicationSummaryReportTwin/GetSnapNameList';
export const SAVE_SNAPSHOTS_TWINS = 'CommunicationSummaryReportTwin/SaveSnapshots';
export const GET_SNAP_DETAILS_TWINS = 'CommunicationSummaryReportTwin/GetSnapDetails';
export const BIND_LINK_CSV_DOWNLOAD_TWINS = 'CommunicationSummaryDetailTwin/BindTopLinkClicksDownloadCSV';
export const GET_SHOWLINK_TWINS = 'CommunicationSummaryDetailTwin/GetShowLink';
export const GET_ATTRIBUTION_FOR_ROI_TWINS = 'CommunicationSummaryReportTwin/GetSingleandMultiTouch';

//Analytics Report Details
export const DETAIL_REPORT_OVERVIEWDETAILS_TWINS = 'CommunicationSummaryDetailTwin/GetCampaignOverviewDetails';
export const CLICK_ACTIVITY_DETAILS_TWINS = 'CommunicationSummaryDetailTwin/BindTopLinkClicksDetail';
export const DETAIL_REPORT_SEGMENTDETAILS_TWINS = 'CommunicationSummaryDetailTwin/GetCampaignSegmentationDetails';
export const COMMUNICATION_STATUS_TWINS = 'CommunicationSummaryDetailTwin/BindActivityList';
export const DETAIL_REPORT_CHANNELDETAILS_TWINS = 'CommunicationSummaryDetailTwin/GetCampaignChannelDetails';

//Preferences

//My-profile
export const GET_MY_PROFILE = 'MyProfile/GetMyProfile';
export const SAVE_MY_PROFILE = 'MyProfile/ProfileUpdate';
export const UPDATE_MOBILE_NUMBER = 'MyProfile/UpdateMobileNumber';
export const CHANGE_MOBILE_NUMBER = 'MyProfile/ChangeMobileNumber';
export const CHANGE_PASSWORD = 'MyProfile/ChangePassword';
export const VALIDATE_PASSWORD = 'MyProfile/ValidatePassword';
export const CONFIRM_PASSWORD = 'MyProfile/ConfirmPassword';

//Account-Companies
export const GET_AGENCY_CLIENT_DETAILS = 'AccountSetup/GetAgencyDetails';
export const GET_CLIENT_DETAILS = 'AccountSetup/GetClientDetails';
export const UPDATE_CLIENT_DETAILS = 'AccountSetup/UpdateClientDetails';
export const UPDATE_CLIENT_STATUS = 'AccountSetup/UpdateClientStatus';
export const CLIENT_UNMAPPING = 'AccountSetup/ClientUnMapping';
export const GET_IP_WHITELIST = 'AccountSetup/GetIpWhiteList';
export const UPSERT_IP_WHITELIST = 'AccountSetup/UpsertIpWhiteList';
export const GET_LOCALIZATION_SETTINGS = 'AccountSetup/GetLocalizationSettings';
export const UPDATE_LOCALIZATION_SETTINGS = 'AccountSetup/UpdateLocalizationSettings';
export const UPDATE_BU_LOCK = 'AccountSetup/UpdateDepartmentLock';
export const GET_BU_SHARE = 'AccountSetup/GetDepartmentListLock';
export const UPDATE_BU_SHARE = 'AccountSetup/SaveAssignSharedBU';
export const CHECK_BU_EXISTS = 'User/CheckDepartmentNameExists';
export const GET_ADD_COMPANY_SUPPORT = 'AccountSetup/GetCompany';
export const GET_COMPANY_LIST = 'AccountSetup/GetCompanyList';
export const GET_ENTITY_INFO = 'AccountSetup/GetEntityInfo';
export const ADD_COMPANY = 'AccountSetup/AddCompany'; // changes
export const NEW_COMPANY_VALIDATION = 'AccountSetup/CompanyValidation';
export const COMPANY_SUBMIT_LICENSEKEY = 'AccountSetup/CompanySubmitLicenseKey';
export const CHANGE_HQ = 'AccountSetup/EntPlusChangeRequest';
export const UPDATE_HQ = 'AccountSetup/updateEnterprisePlus';
export const GET_DEPARTMENT_LIMIT = 'AccountSetup/GetDepartmentLimit';
//Roles and Permissions
export const SECURITY_GROUP_NAME_EXISTS = 'User/SecurityGroupNameExist';
export const SAVE_SECURITY_GROUP = 'User/UpsertSecurityGroup';
export const GET_SECURITY_GROUP_LIST = 'User/GetSecurityGroupList';
export const GET_ASSIGN_USER_LIST = 'User/GetAssignUserData';
export const DELETE_ASSIGN_ROLE = 'User/DeleteAssignRole';
export const GET_SECURITY_GROUP_BY_ID = 'User/GetSecurityGroupByID';
export const GET_SECURITY_GROUP = 'User/GetSecurityGroup';
export const DELETE_USER = 'AccountSetup/DeleteUser';
export const DELETE_SECURITY_GROUP = 'User/DeleteSecurityGroup';
export const CLIENT_HIERACHY = 'User/GetClientHierarchy';
export const HIERARCY_USER_LIST = 'User/GetHierarchyUserList';

//BenchMark
export const BENCHMAKR_LIST = 'GoalsandBenchmark/GetBenchmarkList';
export const GET_BENCHMARK_LIST = 'GoalsandBenchmark/GetAdminBenchmark';
export const UPDATE_BENCHMARK_DETAILS = 'GoalsandBenchmark/UpdateBenchmarkDetails';
export const ISNAME_EXITS = 'GoalsandBenchmark/CheckBenchmarknameExits';
export const EDIT_BENCHMARK_DETAILS = 'GoalsandBenchmark/EditBenchmarkDetails';
export const ADD_COMMUNICATION_TYPES = 'AccountSetup/AddAccountAttributes';
export const CHECK_ACCOUNT_ATTRIBUTE_EXISTS = 'AccountSetup/CheckAccountAttributeExists';

//Users
export const ADD_USER = 'User/AddUser';
export const USER_ASSIGN_ROLES = 'User/UserAssignRole';
export const GET_USER_LIST = 'User/GetUserList';
export const SEND_SELECTED_USER_INFO_MAIL = 'Home/SendSelectedUserInfoMail';
export const GET_USER_DETAILS = 'Audience/GetUserDetails';
export const GET_USER_LIMIT = 'AccountSetup/GetUserLimit';
export const GET_USER_BY_ID = 'User/GetUserById';
export const GET_USERLIST_BY_CLIENTID = 'User/getUserAssignedList';
export const GET_ADUSER = 'User/GetadUser';
export const SAVE_ADUSER = 'User/Aduser';
export const GET_USER_LISTING = 'User/GetUserClientMapping';
export const GET_USER_LISTING_COMPANY = 'User/UserListCompany';


//Alerts and Notifications
export const GET_NOTIFICATION_STATUS = 'AlertAndNotifications/GetAlertNotificationStatus';
export const UPDATE_NOTIFICATION_STATUS = 'AlertAndNotifications/UpdateAlertNotificationStatus';
export const GET_NOTIFICATION = 'AlertAndNotifications/GetAlertNotificationDetail';
export const MARK_ALL_AS_READ = 'AlertAndNotifications/MarkAllAsRead';
export const GET_UNREAD_COUNT = 'AlertAndNotifications/GetUnreadCount';
export const MARK_NOTIFICATION_AS_READ_BY_ID = 'AlertAndNotifications/MarkNotificationAsReadById';

// Communication Settings
export const GET_SERVICE_PROVIDERS = 'CommunicationSetting/GetServiceProvider';
export const DKIM_VALIDATION = 'CommunicationSetting/DkimValidation';
export const COMM_GET_DKIM_VALUES = 'Communication/GetDkimValues';
export const COMM_SEND_DKIM_DETAILS_MAIL = 'Communication/SendDKIMDetailsMail';
export const COMM_SEND_DOMAIN_DETAILS_MAIL = 'CommunicationSetting/DomainDetailsMail';
export const COMM_CHECK_DOMAIN_EXIST = 'Communication/CheckDomainExist';
export const COMM_RESTORE_DOMAIN_NAME = 'Communication/RestoreDomainName';

// Frequency Cap
export const GET_FREQUENCY_CAP = 'CommunicationSetting/GetFrequencyCap';
export const GET_SEGMENT_LIST = 'CommunicationSetting/Segmentationlist';
export const GET_COMMUNICATION_TYPE_LIST = 'CommunicationSetting/GetCommunicationType';
export const SAVE_FREQUENCY_CAP_DATA = 'CommunicationSetting/UpsertFrequencyCap';
export const GET_FREQUENCY_CAP_BY_ID = 'CommunicationSetting/GetFrequencyCapByID';
export const GET_RULENAME_EXIST = 'CommunicationSetting/RuleNameCheckExist';
export const GET_FREQUENCY_CAP_AUDIENCEGROUP_LIST = 'CommunicationSetting/getAudienceGroupDropDownList';
export const GET_FREQUENCY_CAP_SELECT_AUDIENCE_GROUP = 'CommunicationSetting/GetAudienceGroupList';
export const GET_RULE_TYPE_LIST = 'CommunicationSetting/GetRuleTypeList';

// -- Messaging/SMS
export const GET_SMS_GRID = 'CommunicationSetting/GetClientSMSSetting';
export const CREATE_SMS_SETTINGS = 'CommunicationSetting/UpsertClientSmsSettings';
export const UPSERT_SMS_SETTINGS_SMPP = 'CommunicationSetting/UpsertSMSSettings';
export const GET_UPDATE_RECORD_DATA = 'CommunicationSetting/GetClientSMSSettingsbyID';
export const SAVE_SMS_TEMPLATES = 'CommunicationSetting/SaveSMSTemplates';
export const GET_SMS_TEMPLATE_LIST = 'CommunicationSetting/GetSMSTemplateList';
export const UPDATE_SETTING_STATUS = 'CommunicationSetting/UpdateSettingStatus';
export const UPDATE_TEMPLATE_STATUS = 'CommunicationSetting/UpdateTemplateStatus';
export const GET_SMS_TEMPLATE_BY_ID = 'CommunicationSetting/GetSMSTemplatesByTemplateID';
export const GET_SMS_SETTINGS_BY_ID = 'CommunicationSetting/GetSMSSettingsbyID';
export const GET_CLIENT_SMS_OPT_SETTING = 'CommunicationSetting/GetClientSMSOptSetting';
export const CLIENT_SMS_OPT_STATUS_CHANGE = 'CommunicationSetting/ClientSMSOptStatusChange';
export const GET_CLIENT_SMS_OPT_BY_ID = 'CommunicationSetting/GetClientSMSOptById';
export const GET_INBOUND_NO_LIST = 'CommunicationSetting/GetInboundNoList';
export const GET_OPT_IN_OUT_LIST = 'CommunicationSetting/OptInOutList';
export const GET_SENDER_ID_LIST = 'CommunicationSetting/GetSenderID';
export const ONBOARD_OPT_IN_OUT = 'CommunicationSetting/OnboardOptInOut';
export const ONBOARD_COMPLIANCE_DETAILS = 'CommunicationSetting/OnboardComplianceDetails';
export const GET_OPT_IN_OUT_BY_ID = 'CommunicationSetting/OptInOutByID';
export const SAVE_INBOUND_NUMBERS = 'CommunicationSetting/SaveInboundNumbers';
export const VALIDATE_ATOP_NAME = 'CommunicationSetting/ValidateAtoPName';
export const GET_DEFAULT_SMS_KEYWORD = 'CommunicationSetting/DefaultSMSKeyword';
export const GET_SMS_OPTOUT_FALLBACK_KEYWORDS = 'CommunicationSetting/GetSmsoptoutFallbackKeywords';
export const UPDATE_SMS_OPTOUT_FALLBACK_KEYWORDS = 'CommunicationSetting/updateSmsoptoutFallbackKeywords';
export const GET_SMS_KEYWORD = 'CommunicationSetting/SMSKeyword';
export const DELETE_SMS_KEYWORD_SETTING = 'CommunicationSetting/DeleteSMSKeywordSetting';
export const GET_INBOUND_ACTION_VALUE = 'CommunicationSetting/Getinboundactionvalue';
export const UPDATE_SMS_KEYWORD = 'CommunicationSetting/UpdateSMSkeyword';
export const INSERT_SMS_KEYWORD = 'CommunicationSetting/InsertSMSKeyword';
export const VALIDATE_FRIENDLY_NAME = 'CommunicationSetting/ValidateFriendlyName';
export const GET_INBOUND_KEYS = 'CommunicationSetting/GetInboundkeys';
export const CHECK_SMS_FRIENDLY_NAME_EXISTS = 'CommunicationSetting/CheckSMSFriendlyNameExists';
export const CHECK_VENDOR_NAME_EXISTS = 'CommunicationSetting/CheckVendorNameExists';
export const IS_TEMPLATE_NAME_EXISTS = 'CommunicationSetting/IsTemplateNameExists';
export const UPSER_CLIENT_SMS_OPT_SETTING = 'CommunicationSetting/UpserClientSMSOptSetting';
export const SEND_SMSMAIL = 'CommunicationSetting/EditsmsMailSend';

// -- Messaging/WA
export const GET_WA_GRID = 'CommunicationSetting/GetWhatsAppSettings';
export const GET_WA_UPDATE_RECORD_DATA = 'CommunicationSetting/GetWhatsAppSettingsByID';
export const GET_WA_CREATE_PROVIDERS = 'CommunicationSetting/GetServiceProviderWA';
export const CREATE_WA_SETTINGS = 'CommunicationSetting/UpsertWhatsAppSetting';
export const UPSERT_WHATSAPP_SETTINGS = 'CommunicationSetting/UpsertWhatsAppSettings';
export const DELETE_WA_SETTINGS = 'CommunicationSetting/WhatsappStatusChange';

// -- Messaging/VMS
export const GET_VMS_DATA = 'CommunicationSetting/GetVMSSettings';
export const SAVE_VMS_DATA = 'CommunicationSetting/UpsertVMSSettings';
export const GET_VMS_DATA_BYID = 'CommunicationSetting/GetVMSSettingByID';
export const DELETE_VMS_DATA_BYID = 'CommunicationSetting/DeleteVmsSettings';
// -- Messaging/RCS
export const GET_RCS_CREATE_PROVIDERS = 'CommunicationSetting/GetRCSProvider';
export const CREATE_RCS_SETTINGS = 'CommunicationSetting/UpsertRcsSettings';
export const GET_RCS_UPDATE_RECORD_DATA = 'CommunicationSetting/GetRcsSettingsByID';
export const GET_RCS_GRID = 'CommunicationSetting/GetRCSSettings';
//Line
export const GET_LINE_DATA = 'CommunicationSetting/GetClientLineItems';
export const SAVE_LINE_DATA = 'CommunicationSetting/UpsertClientLineItems';
export const DELETE_LINE_DATA_BYID = 'CommunicationSetting/';
export const GET_LINE_CAMPAIGN_BY_ID = 'CommunicationSetting/GetClientLineItemsByID';

//CS - Web push
export const GET_WEBPUSH_DATA = 'CommunicationSetting/GetWebPush';
export const GET_WEBPUSH_DOMAIN_EXIST = 'CommunicationSetting/CheckwebDomainNameExist';
export const GET_WEBPUSH_URL_EXIST = 'CommunicationSetting/CheckmWebDomainUrl';
export const GET_WEBPUSH_EDIT_DATA = 'CommunicationSetting/GetWebPushbyID';
export const SAVE_WEBPUSH_DATA = 'CommunicationSetting/UpsertWebPush'; //
export const DELETE_WEBPUSH_DATA = 'CommunicationSetting/DeleteWebPush';
export const GET_WEBPUSH_ANLAYTICS_DATA = 'CommunicationSetting/GetAnalyticsListWeb';
export const UPDATE_WEBPUSH_DEFAULT = 'CommunicationSetting/UpdateWebPushDefault';
//CS - Web push settings
export const GET_WEBPUSH_SETTINGS_DATA = 'CommunicationSetting/GetWebPushSettings';
export const SAVE_WEBPUSH_SETTINGS_DATA = 'CommunicationSetting/UpsertWebPushSettings';
export const SAVE_WEBPUSH_CONFIG = 'CommunicationSetting/SaveWebPushConfig';
export const GET_WEBPUSH_CONFIG = 'CommunicationSetting/GetWebPushConfig';

export const CHECK_PLAYSTORE_URL = 'CommunicationSetting/CheckPlaystoreUrl';
export const GET_CONFIG_DETAILS = 'CommunicationSetting/GetConfigDetails';

//Goal settings
export const GET_WEBPUSH_GOAL_DATA = 'CommunicationSetting/GetWebNotifyGoalSetting';
export const GET_WEBPUSH_GOALEVENTS_DATA = 'CommunicationSetting/GetWebEventsList';
export const SAVE_WEBPUSH_GOALEVENTS_DATA = 'CommunicationSetting/InsertWebNotifyGoalSetting';
export const GET_WEBPUSH_TENANT_DATA = 'CommunicationSetting/GetTenantId';
export const GET_WEBPUSH_GOALEVENTS_DATABYID = 'CommunicationSetting/GetWebnotifyGoalSettingbyID';
export const CHECK_WEBPUSH_GOALNAME = 'CommunicationSetting/CheckWebGoalNameExist';

// CS - Geofencing
export const GET_GEOFENCES_LISTS = 'CommunicationSetting/GetGeoFencesLists';
export const SYNC_GEOFENCE = 'CommunicationSetting/SyncGeoFence';
export const GET_GEOFENCE_DETAILS_BY_ID = 'CommunicationSetting/GetGeoFenceDetailsByID';
export const DELETE_REGION_BY_ID = 'CommunicationSettings/DeleteRegionByID';
export const CHECK_GEOFENCE_NAME_EXISTS = 'CommunicationSetting/IsExistGeoFence';
export const SAVE_GEOFENCE = 'CommunicationSetting/SaveGeoFence';
export const CHECK_VALID_GEOFENCE = 'CommunicationSetting/CheckValidGeoFence';

// CS - Beacons
export const GET_BEACON_LISTS = 'CommunicationSetting/GetBeaconLists';
export const GET_BEACON_BY_ID = 'CommunicationSetting/GetBeaconById';
export const SAVE_BEACON_DETAILS = 'CommunicationSetting/SaveBeaconDetails';
export const SAVE_BEACON_DETAILS_BULK = 'CommunicationSetting/SaveBeaconDetails';
export const CHECK_BEACON_EXISTS = 'CommunicationSetting/CheckBeaconExists';
export const UPDATE_BEACON_STATUS = 'CommunicationSetting/UpdateBeaconStatus';

//CS - Mobile push settings
export const REMOVE_APPSTORE = 'CommunicationSetting/DeleteAppStore';
export const GET_MOBILEPUSH_DATA = 'CommunicationSetting/GetMobilePush';
export const SAVE_MOBILEPUSH_DATA = 'CommunicationSetting/UpsertMobilePush';
export const REMOVE_MOBILEPUSH_DATA = 'CommunicationSetting/DeleteMobilePush';
export const GET_MOBILEPUSH_BY_ID = 'CommunicationSetting/GetMobilePushById';
export const GET_MOBILEPUSH_ANALYSIS_DATA = 'CommunicationSetting/GetAnalyticsListMobile';
export const GET_MOBILEPUSH_LANGUAGE_DATA = 'CommunicationSetting/GetLanguageList';
// CS - Mobile push create
export const GET_MOBILEPUSH_DEVICELIST = 'CommunicationSetting/GetDeviceList';
export const GET_MOBILEPUSH_DOMAIN_EXISIT = 'CommunicationSetting/CheckmobDomainNameExist';
// Settings
export const GET_MOBILEPUSH_SETTINGS_DATA = 'CommunicationSetting/GetMobPushSettings';
export const SAVE_MOBILEPUSH_SETTINGS_DATA = 'CommunicationSetting/UpsertMobPushSettings';
export const UPDATE_MOBILEPUSH_DEFAULT = 'CommunicationSetting/UpdateMobPushDefault';
// Settings  GOAL
export const GET_MOBILEPUSH_GOALSETTINGS_DATA = 'CommunicationSetting/GetPushNotifyGoalSetting';
export const SAVE_MOBILEPUSH_GOALSETTINGS_DATA = 'CommunicationSetting/InsertPushNotifyGoalSetting';
export const STATUS_WEBPUSH_GOALSETTINGS_DATA = 'CommunicationSetting/WebGoalStatusChange';
export const GET_MOBILEPUSH_GOALSETTINGS_BYID_DATA = 'CommunicationSetting/GetPushnotifyGoalSettingbyID';
export const STATUS_MOBILEPUSH_GOALSETTINGS_DATA = 'CommunicationSetting/PushGoalStatusChange';
export const GET_MOBILEPUSH_GOALSETTINGS_MASTERDATA = 'CommunicationSetting/GetMobGoalMaster';
export const CHECK_MOBILEPUSH_GOALNAME = 'CommunicationSetting/CheckMobileGoalNameExist';
export const GET_SCREEN_NAME_LIST = 'CommunicationSetting/getScreenNameList';
export const GET_SUB_SCREEN_NAME_LIST = 'CommunicationSetting/getSubScreenNameList';

// User device summary
export const GET_MOBILEPUSH_SETTINGS_USERINFO_DATA = 'CommunicationSetting/GetUserDeviceMaster';
export const GET_MOBILEPUSH_SETTINGS_DEVICELIST_DATA = 'CommunicationSetting/GetUserDeviceSetup';
export const GET_MOBILEPUSH_SETTINGS_BYID_DATA = 'CommunicationSetting/GetUserDeviceSetupById';
export const SAVE_MOBILEPUSH_SETTINGS_DEVICESETUP_DATA = 'CommunicationSetting/UpsertUserDeviceSetup';
export const REMOVE_MOBILEPUSH_SETTINGS_DEVICESETUP_DATA = 'CommunicationSetting/DeleteUserDevice';
export const ENCODE_MOBILEPUSH_SETTINGS_DEVICESETUP_DATA = 'CommunicationSetting/GetUserEncode';

// SDK Health Check test commit
export const GET_SDK_HEALTH_CHECK = 'CommunicationSetting/GetSdkHealthCheck';

//CS- Web/Mobile
export const GET_WEBMOBILE_LIST = 'CommunicationSetting/GetMobileAppList';
export const GET_WEBMOBILE_DOMAIN_LIST = 'CommunicationSetting/GetWebDomainList';
export const GET_WEBMOBILE_MOBILE_LIST = 'CommunicationSetting/GetWebMobileList';
export const SAVE_WEBMOBILE_LIST = 'CommunicationSetting/InsertWebMobile';
export const DELETE_WEBMOBILE_LIST = 'CommunicationSetting/DeleteWebMobile';
export const GET_DOMAIN_APP_SETTING = 'CommunicationSetting/DomainAppSettingsList';
export const UPSERT_DOMAIN_APP_SETTING = 'CommunicationSetting/UpsertDomainAppSettings';
export const DELETE_DOMAIN_APP_SETTING = 'CommunicationSetting/DeleteDomainAppSettings';


// -- Mail/Subscribe
export const CHECK_SUBSCRIPTION_NAME = 'CommunicationSetting/CheckSubscribeNameExists';
export const SAVE_SUBSCRIPTION = 'CommunicationSetting/UpsertSubscribeSetting';
export const GET_SUBSCRIPTION = 'CommunicationSetting/GetSubscribeSetting';
export const GET_SUBSCRIPTION_BY_ID = 'CommunicationSetting/GetSubscribeSettingByID';
export const CHECK_UNSUBSCRIPTION_NAME = 'CommunicationSetting/CheckUnSubscribeNameExists';
export const GET_UNSUBSCRIPTION = 'CommunicationSetting/GetUnSubscribeSetting';
export const GET_UNSUBSCRIPTION_BY_ID = 'CommunicationSetting/GetUnSubscribeSettingByID';
export const SAVE_UNSUBSCRIPTION = 'CommunicationSetting/UpsertUnSubscribeSetting';
export const SUB_UNSUB_UPLOAD_EDM_FILE = '/CommunicationSetting/UploadEdmFile';
export const SUB_UNSUB_IMPORT_EDM_URL = 'CommunicationSetting/ImportEdmUrl';

// -- Mail/SMTP
export const GET_CLIENT_SMTP_SETTINGS = 'CommunicationSetting/GetClientSmtpSetting';
export const GET_SMTP_DOMAIN_SETTINGS_GRID = 'CommunicationSetting/GetSmtpDomainSetting';
export const DELETE_SMTP_DOMAIN_SETTINGS = 'CommunicationSetting/DeleteSmtpDomain';
export const SMTP_DOMAIN_SETTINGS_BY_ID = 'CommunicationSetting/GetSmtpDomainbyID';
export const GET_SMTP_HOUSE = 'CommunicationSetting/GetSmtpHouse';
export const GET_SMTP_THROTTLE = 'CommunicationSetting/GetSmtpThrottle';
export const UPDATE_SMTP_SETTINGS = 'CommunicationSetting/UpsertClientSmtpSetting';
export const CHECK_SMTP_DOMAIN_EXISTS = 'CommunicationSetting/CheckSMTPDomainExists';
export const GET_CLIENT_SMTP_BY_ID = 'CommunicationSetting/GetClientSmtpbyId';
export const SEND_SMTPMAIL = 'CommunicationSetting/EmailEditmailsend';
export const GET_DOMIAN_LIST = 'CommunicationSetting/DomainNameList';
export const UPDATE_SENDER_DETAILS = 'Communication/UpdateSenderDetails';

// --Mail/SMTP -Settings
export const UPDATE_SMTP_DOMAIN = 'CommunicationSetting/UpsertSmtpDomainSetting';

// --Custom event 
export const CREATE_OR_UPDATE_CUSTOM_EVENT = 'CommunicationSetting/SaveCustomEvent';
export const GET_CUSTOM_EVENT_LIST = 'CommunicationSetting/GetCustomEventList';
export const GET_CUSTOM_EVENT_BY_ID = 'CommunicationSetting/GetCustomEventById';
export const DELETE_CUSTOM_EVENT = 'CommunicationSetting/DeleteCustomEvent';
export const CHECK_CUSTOM_EVENT_NAME_EXIST = 'CommunicationSetting/CheckCustomEventNameExist';

// --Double Opt-In
export const GET_DOUBLE_OPT_IN = 'CommunicationSetting/GetDoubleOptIn';
export const GET_DOUBLE_OPT_IN_BY_ID = 'CommunicationSetting/GetDoubleOptInById';
export const SAVE_DOUBLE_OPT_IN = 'CommunicationSetting/UpsertDoubleOptIn';

// --Email Footer
export const GET_EMAIL_FOOTER = 'CommunicationSetting/GetEmailFooter';
export const SAVE_EMAIL_FOOTER = 'CommunicationSetting/UpsertEmailFooter';
export const GET_EMAIL_FOOTER_BY_ID = 'CommunicationSetting/GetEmailFooterById';
export const GET_EMAIL_FOOTER_NAME_EXIST = 'CommunicationSetting/CheckEmailFooterNameExist';
export const DELETE_EMAIL_FOOTER_BY_ID = 'CommunicationSetting/DeleteEmailFooter';
export const UPLOAD_PREFERENCE_IMAGE = 'CommunicationSetting/UploadImageFile';

// --Lifetime Cap
export const GET_LIFETIME_CAP_ACTIONS = 'CommunicationSetting/GetLifeTimeCapActions';
export const GET_LIFETIME_CAP = 'CommunicationSetting/GetLifeTimeCap';
export const SAVE_LIFETIME_CAP = 'CommunicationSetting/UpsertLifeTimeCap';

// Quiet Hours
export const GET_QUIET_HOURS_SETTINGS = 'CommunicationSetting/GetQuietHoursSettings';
export const GET_QUIET_HOURS_SETTINGS_BY_ID = 'CommunicationSetting/GetQuietHoursSettingsId';
export const CHECK_QUIET_HOURS_NAME_EXISTS = 'CommunicationSetting/CheckQuietHoursNameExists';
export const UPSERT_QUIET_HOURS_SETTINGS = 'CommunicationSetting/UpsertQuietHoursSettings';
export const UPDATE_QUIET_HOURS_STATUS = 'CommunicationSetting/UpdateQuietHoursStatus';
export const DELETE_QUIET_HOURS_SETTINGS = 'CommunicationSetting/DeleteQuietHoursSettings';
export const DUPLICATE_QUIET_HOURS_SETTINGS = 'CommunicationSetting/DuplicateQuietHoursSettings';
export const EXTEND_QUIET_HOURS_REGULATORY = 'CommunicationSetting/ExtendRegulatoryRule';
export const GET_QUIET_HOURS_LOOKUPS = 'CommunicationSetting/GetQuietHoursLookups';

// CS-Ads
//Digipop
export const GETCREATIVE_DIGIPOP = 'digipop/GetCreative';
export const ISNAME_CREATIVE_DIGIPOP = 'digipop/CheckCreativeNameExists';
export const SAVE_CREATIVE_DIGIPOP = 'digipop/SaveCreative';
export const UPDATE_CREATIVE_DIGIPOP = 'digipop/UpdateCreative';
export const GET_CREATIVE_DIGIPOP_NAMES = 'digipop/GetCreativeName';
export const GET_DIGIPOP_REPORT = 'digipop/GetDigipopReport';

// qr in url
export const GET_QR_CODE_CAMAPIGN = 'Communication/GetQRCodeCampaign';
export const GET_RECIPIENT_FORMS_CAMPAIGN = 'Communication/GetRecipientFormsCampaign';
export const GET_RECIPIENT_FORMS_ID = 'Communication/GetRecipientFormByFormId';
export const UPLOAD_IMG_QR = 'Communication/UploadImage';
export const GET_QR_CODE_DOWNLOAD = 'Communication/GetQRCodeDownloadURL';
export const UPDATE_QR_CODE = 'Communication/UpdateQRCode';

//Consumptions
export const CONSUMPTION_COUNT = 'Consumption/AccountStatus';
export const CONSUMPTION_CHANNEL_DETAILS = 'Consumption/GetConsumptionDetails';
export const CONSUMPTION_CHANNEL_DETAILS_DOWNLOAD = 'Consumption/DownloadActivityListCsv';
export const CONSUMPTION_STATUS = 'Consumption/GetConsumptionStatus';
export const CONSUMPTION_ACCOUNT_DB = 'Consumption/GetAccDBConsumption ';
export const CONSUMPTION_CSV_REPORT_API = 'Consumption/GetCustomReport ';
export const CONSUMPTION_CSV_REPORT_DOWNLOAD = 'Consumption/DownloadCustomReportCSV';
export const CONSUMPTION_COMMUNICATION_SENT = 'Consumption/CampaignSummaryReport/GetCommunicationsent ';
export const VERSAR_CONSUMPTION = 'Audience/Get_versar_consumption';
export const GET_LINE_CART = 'Consumption/GetLineCart';
export const SFTP_CONSUMPTION = 'Audience/Sftpconsumptiondata';


//Consumptions Twins
export const CONSUMPTION_TWIN_ACCOUNT_STATUS = 'ConsumptionTwin/AccountStatus';
export const CONSUMPTION_TWIN_GET_CONSUMPTION_DETAILS = 'ConsumptionTwin/GetConsumptionDetails';
export const CONSUMPTION_TWIN_DOWNLOAD_ACTIVITY_LIST_CSV = 'ConsumptionTwin/DownloadActivityListCsv';
export const CONSUMPTION_TWIN_GET_CONSUMPTION_STATUS = 'ConsumptionTwin/GetConsumptionStatus';
export const CONSUMPTION_TWIN_DOWNLOAD_CUSTOM_REPORT_CSV = 'ConsumptionTwin/DownloadCustomReportCSV';
export const CONSUMPTION_TWIN_GET_CHANNEL_WISE_COUNT = 'ConsumptionTwin/GetChannelWiseCount';  //new
export const CONSUMPTION_TWIN_GET_ACC_DB_CONSUMPTION = 'ConsumptionTwin/GetAccDBConsumption';
export const CONSUMPTION_TWIN_GET_CSV_REPORT_API = 'ConsumptionTwin/GetCsvReportApi';   //new
export const CONSUMPTION_TWIN_GET_CAMPAIGN_DOCKET = 'ConsumptionTwin/GetCampaignDocket';   //new
export const CONSUMPTION_TWIN_GET_API_STORAGE_CONSUMPTION = 'ConsumptionTwin/GetAPIStorageConsumption';   //new
export const CONSUMPTION_TWIN_GET_LINE_CART = 'ConsumptionTwin/GetLineCart';

//Offer Management
export const CHECK_OFFERNAME_EXIST = 'Offer/IsOfferPresent';
export const GET_OFFER_TYPE = 'Offer/GetOfferTypes';
export const GET_OFFER_LIST = 'Offer/GetOfferGrid';
export const GET_OFFER_GRID_NEW = 'Offer/GetOfferGridNew';
export const GET_OFFER_ANALYTICS = 'Offer/GetOfferAnalytics';
export const PUBLISH_OFFER = 'Offer/PublishOffer';
export const GET_OFFER_BYID = 'Offer/GetOfferByID';
export const FETCH_OFFER = 'Offer/FetchOffer';
export const RENDER_PUBLISHED_OFFER = 'Offer/RenderPublished';
export const SAVE_OFFER = 'Offer/SaveOffer';
export const CREATE_OFFER = 'Offer/CreateOffer';
export const SAVE_BRAND_OFFER = 'Offer/SaveBrandOffer';
export const DUPLICATE_BRAND = 'Offer/HandleDuplicateBrand';
export const DUPLICATE_STORE = 'Offer/HandleDuplicateStore';
export const SAVE_STORE_OFFER = 'Offer/SaveStoreOffer';
export const DELETE_BRAND_OFFER = 'Offer/DeleteBrandOffer';
export const DELETE_STORE_OFFER = 'Offer/DeleteStoreOffer';
export const DUPLICATE_OFFER = 'Offer/DuplicateOffer';
export const DUPLICATE_OFFER_NEW = 'Offer/DuplicateOfferNew';
export const DELETED_OFFER = 'Offer/DeleteOffer';
export const DELETE_OFFER_NEW = 'Offer/DeleteOfferNew';
export const SAVE_OFFERCODEFILE = 'Offer/SaveOfferCodeFile';
export const FETCH_OFFER_BRAND = 'Offer/FetchOfferBrand';
export const FETCH_OFFER_STORE = 'Offer/FetchOfferStore';
export const FETCH_OFFER_CATEGORY = 'Offer/FetchOfferCategory';
export const FETCH_OFFER_SUBCATEGORY = 'Offer/FetchOfferSubCategory';
export const FETCH_OFFER_TYPES = 'Offer/FetchOfferTypes';
export const COUPON_CODE_GENERATION = 'Offer/CouponCodeGenerationForOffer';
export const COUPON_CODE_GENERATION_CSV = 'Offer/csvGenerationForCouponCode';
export const GET_OFFER_NAMELIST = 'Offer/GetOfferNameList';
export const GET_DATABEST_OFFER = 'Offer/GetDataNextBestOffer';
export const SAVE_BEST_OFFER = 'Offer/SaveNextBestOffer';
export const OFFER_CODE_COUNT = 'Offer/GetOfferCodeCount';
export const OFFER_CATEGORY_SAVE = 'Offer/OfferSubCategorySave';

//Forms
export const GET_FORM_LISTS = 'Form/GetFormList';
export const DUPLICATE_FORM_ID = 'Form/DuplicateFormById';
export const GET_FORMNAME_EXIST = 'Form/CheckFormNameExist';
export const SAVEUPDATE_FORM_VALUES = 'Form/SaveFormValues';
export const GET_FORM_VALUES = 'Form/GetFormValues';
export const PUBLISH_FORM_VALUES = 'Form/FormPublish';
export const DELETE_FORM_VALUES = 'Form/DeleteForm';
export const GET_CSV_DOWNLOAD = 'Form/formCsvDownload';
export const GET_CSV_FORMFIELDS = 'Form/getFormFields';
export const GET_CSS_FORMDATA = 'Form/GetFormCss';
export const SAVE_CSS_FORMDATA = 'Form/UpsertFormCSS';
export const GET_CSV_FORMDATA = 'Form/GetFormCsv';
export const DISABLE_FORM_CSV_SCHEDULE = 'Form/DisableFormCsvSchedule';
export const SAVE_BRAND_OWNED_FORMS = `Form/SaveBrandOwnFormValues`;
export const SEARCH_FORM_LIST = `/Form/SearchFormName`;
export const GET_FORM_ANALYTICS = 'Form/GetFormAnalytics';
export const FORM_DOWNLOAD_RM = 'Form/formCsvDownloadRM';
export const GET_FORM_RM = 'Form/StatusRM';
export const GET_FORM_PROGRESSIVE_PROFILE = 'Form/GetProgressiveProfile';
/** Advanced forms list (RESUL.RestAPI Form/GetFormListFF). */
export const GET_FORM_LIST_FF = 'Form/GetFormListFF';
export const GET_FORM_PUBLISH_DETAILS_FF = 'Form/GetFormPublishDetailsFF';
export const WARM_UP_FORM_FORGE_FF = 'Form/WarmUpFormForgeFF';
/** New survey / forge redirect — Advanced forms Create → Survey only. */
export const GET_NEW_FORM_REDIRECT_URL = 'Form/GetNewFormRedirectURL';
/** Edit link for advanced forms (returns URL to open). */
export const GET_FORM_EDIT_URL = 'Form/GetFormEditURL';
/** Analytics SSO URL for advanced forms (returns URL for new tab). */
export const GET_FORM_ANALYTICS_URL = 'Form/GetFormAnalyticsURL';
export const GET_FORM_FIELDS_AND_NOTIFY_FF = 'Form/GetFormFieldsAndNotifyFF';
export const UPDATE_FORM_NOTIFIER_FF = 'Form/UpdateFormNotifierFF';


//API consumption
export const SAVE_API_CONSUMPTION = 'Audience/InsertApiConsumptions';
export const GET_API_CONSUMPTION = 'Audience/GetAPIConsumptionDetail';

//Data exchange
export const GET_DATAEXCHANGE_ACTIVEELEMENTS = 'Audience/GetRemoteConnectionActive';
export const GET_CONNECTOR_DETAILS = 'Connector/GetConnectorDetailsById';
export const GET_GOOGLE_ANALYTICS_ACCOUNTS_LISTS = 'Connector/GoogleAnalyticsAccountsList';

//Social media
export const GET_SOCIALMEDIA_OAUTHURL = 'SocialMedia/GetSocialMediaOauthUrl';
export const SAVE_SOCIAL_USERSETUP_DETAILS = 'SocialMedia/SaveUserSetupDetails';
export const GET_EXTENDED_ACCESSTOKEN = 'Communication/GetExtendedAccessToken';
export const GET_GOOGLE_ADS_ACCESSTOKEN = 'SocialMedia/GoogleAdsAccessToken';
export const GET_YOUTUBE_ACCESSTOKEN = 'SocialMedia/GetYoutubeAccessToken';
//Facebookads
export const GET_FACEBOOK_ADS = 'SocialMedia/GetFacebookAdsList';
export const GET_GOOGLE_ADS = 'SocialMedia/GoogleAdsAccounts';
export const GET_YOUTUBE_ACCOUNTS = 'Connector/GetYoutubeAccounts';

//Facebook
export const GET_FACEBOOK_PAGES = 'SocialMedia/GetFacebookPages';
//Twitter
export const GET_EXTENDED_TWITTER_ACCESSTOKEN = 'Communication/GetTwitterAccessToken';
export const GET_TWITTER_USERDETAILS = 'Communication/GetTwitterUserDetails';

// LinkedIn
export const GET_COMM_LINKEDIN_ACCESSTOKEN = 'Communication/GetLinkedinAccessToken ';
export const GET_LINKEDIN_PAGES = 'Communication/GetLinkedinPages';

// Insta
export const GET_INSTAGRAM_ACCOUNTS = 'SocialMedia/GetInstagramAccounts';
export const GET_INSTAGRAM_PAGES = 'SocialMedia/GetInstagramPages';

//pinterest
export const GET_PINTEREST_ACCESSTOKEN = 'Socialmedia/GetPinterestAccessToken';
export const GET_PINTEREST_BOARDSLIST = 'Socialmedia/GetPinterestBoardsList';

//Webhook
export const CHECK_EXTENDED_NAMEEXISIT = 'CommunicationSetting/CheckNameExist';
export const UPDATE_EXTENDED_NAMEEXISIT = 'CommunicationSetting/UpsertExtendedSystem';
export const GET_EXTENDED_VALUES = 'CommunicationSetting/GetExtendedSystemByID';
export const GET_EXTENDED_SYSTEM = 'CommunicationSetting/GetExtendedSystem';

export const GET_ZEROUNBOUNCE_CONNECT = 'Audience/GetZeroBounceConnect';

export const GET_CONNECTORS_LIST = 'Connector/GetConnectors';

//Versium
export const GET_PARTNER_CONNECTION_DETAILS = 'Audience/GetPartnerConnectionDetails';
export const UPDATE_PARTNER_CONNECTION_DETAILS = 'Audience/UpdatePartnerConnectionDetails';
export const GET_CONNECTORS_VERSIUM = 'Audience/VersiumConnect';
export const GET_CONNECTORS_VERSIUM_BYID = 'Audience/GetPartnerdataById';
export const SAVE_CONNECTORS_VERSIUM_ATTRIBUTES = 'Audience/SaveorUpdatePartnerRemotesetting';
export const SAVE_CONNECTORS_VERSIUM_ATTRIBUTES_COUNT = 'Audience/SavePartnerRemoteSetting';
export const GET_CONNECTORS_VERSIUM_RECENCY = 'Audience/GetPartnerRecency';
export const GET_CONNECTORS_VERSIUM_UPDATEDCOLUMNS = 'Audience/GetUpdatedColumnAttributes';
export const SAVE_CONNECTORS_VERSIUM_ATTRIBUTE_FILTERJSON = 'Audience/SaveorUpdateFilterJson';

//Digipop
export const GET_DATA_TABLES_DIGIPOP = 'Connector/GetDataFromTablesDigipop';
export const GET_DIGIPOP_CONNECTOR_ID = 'Connector/GetDigipopConnectorByID';

//Blackbaud
export const GET_BLACKBAUD_LOGIN = 'Connector/BlackbaudLoginPage';

//Webinar
export const GET_WEBINAR_LOGIN = 'Connector/GetRemoteDataConnectorOauthUrl';
export const RENXT_TOKEN_VALIDATION = 'Connector/RenxtTokenValidation';
export const GET_WEBINAR_DATAS = 'Connector/GetWebinars';

//Webex
export const GET_WEBEX_DATAS = 'Connector/GetMeetings';

//Audience score--persona
export const GET_PERSONA = 'Audience/GetPersona';
export const GET_PERSONABY_ID = 'Audience/GetPersonaByID';
export const SAVE_PERSONA = 'Audience/SavePersona';
export const UPDATE_PERSONA = 'Audience/UpdatePersona';
export const SAVE_PERSONA_GRADE = 'Audience/UpdatePersonaById';
export const GET_PERSONA_NAME = 'Audience/IsPersonaNameExisit';
export const GET_PERSONA_GRADE = 'Audience/GetPersonaGrade';
// Purchase pattern
export const GET_PURCHASEPATTERN = 'Audience/GetPurchasePattern';
export const SAVE_PURCHASEPATTERN = 'Audience/SavePurchasePattern';
export const UPDATE_PURCHASEPATTERN = 'Audience/UpdatePurchasePattern';
//Audience laddering
export const GET_AUDIENCELADDERING = 'CommunicationSetting/GetAudienceLadderingdata';
export const SAVE_AUDIENCELADDERING = 'CommunicationSetting/CreateOrUpdateAudienceLaddering';
export const GET_SENTIMENTKEYS = 'CommunicationSetting/GetSentimentKeys';
export const GET_LADDERKEYS = 'CommunicationSetting/GetLadderingkeys';
//Communication response
export const EDIT_COMMUNICATION_RESPONSE = 'CommunicationSetting/GetcampaignResponse';
export const EDIT_COMMUNICATION_RESPONSE_DATA = 'CommunicationSetting/GetcampaignResponsedata';
export const SAVE_COMMUNICATION_RESPONSE = 'CommunicationSetting/Createcampaignresponse';
export const GET_PERIOD_KEYS = 'CommunicationSetting/Getperiodattributes';
//Profile Data
export const GET_PROFILE_DATA_CHANNEL_NAME = 'Audience/GetChannelNames';
export const GET_PROFILE_DATA_CLASSFICATION_ATTRIBUTES_BY_ID = 'Audience/GetDataClassficationAttributesById';
export const GET_PROFILE_DATA = 'Audience/GetProfileData';
export const UPDATE_PROFILE_DATA = 'Audience/UpdateProfileData';
export const SAVE_PROFILE_DATA = 'Audience/SaveProfileData';

// Email builder

export const TEMPLATE_GALLERY_LIST = 'Communication/GetTemplateGalleryList';
export const DUPLICATE_TEMPLATES = 'Communication/CopyTemplate';
export const EMAIL_TEMPLATENAME_EXIST = 'Communication/IsExistsTemplateName';
export const LP_TEMPLATE_PREVIEW = 'Communication/GetTemplateForPreview';
export const LP_TEMPLATE_PUBLISH = 'Communication/InsertLPPublish';

// Preferences - invoice

export const GET_INVOICELIST = 'Admin/InvoiceList';
export const GET_INVOICEINFO_ID = 'Admin/InvoiceValue';

// AI Builder

export const GET_AIEMAIL_BUILDER_TEMPLATES = 'Communication/GetTemplateLists';
export const SAVE_AIEMAIL_BUILDER_TEMPLATES = 'Communication/SaveTemplates';
export const GET_AIEMAIL_BUILDER_TEMPLATE_BYID = 'Communication/FetchTemplateById';
export const DELETE_AIEMAIL_BUILDER_TEMPLATE_BYID = 'Communication/DeleteTemplateByID';
export const IS_EMAILBUILDER_TEMPLATES = 'Communication/CheckTemplateNameExists';
export const DUPLICATE_EMAILBUILDER_TEMPLATES_BYID = 'Communication/DuplicateTemplateById';
export const GET_EMAILBUILDER_TEMPLATES_BYIMG = 'Communication/GetEBuilderImg';
export const UPLOAD_EMAILBUILDER_TEMPLATES_IMG = 'Communication/UploadTemplateImg';
export const MANAGE_AIEMAIL_BUILDER_CATEGORIES = 'Communication/UpsertTemplateCategories';
export const DELETE_EMAILBUILDER_TEMPLATES_IMG = 'Communication/TemplateImgDelete';
export const GET_AIEMAIL_BUILDER_CATEGORIES = 'Communication/GetTemplateCategories';
export const GET_SNIPPET_NAMEEXIST = 'Communication/CheckSnippetNameExists';
export const DELETE_SNIPPET_BYID = 'Communication/DeleteSnippetByID';
export const FETCH_SNIPPET_BYID = 'Communication/FetchSnippetById';
export const SAVE_SNIPPET_BYID = 'Communication/SaveSnippets';
export const GET_SNIPPET_LISTS = 'Communication/GetSnippetLists';
export const EMAIL_ATTACHMENT = 'Communication/UploadFiles';

// offer Builder
export const OFFER_SAVE_SNIPPET = 'Offer/SaveOfferSnippets';
export const OFFER_SNIPPET_NAMEEXIST = 'Offer/CheckOfferSnippetNameExists';
export const DELETE_OFFERSNIPPET_BYID = 'Offer/DeleteOfferSnippetByID';
export const FETCH_OFFERSNIPPET_BYID = 'Offer/FetchOfferSnippetById';
export const GET_OFFERSNIPPET_LISTS = 'Offer/GetOfferSnippetLists';

export const GET_HSM_TEMPLATE_NEW = 'communication/GetHSMTemplateNew';
export const SAVE_WHATSAPP_CAMPAIGN_NEW = 'communication/SaveWACampaignNew';
export const GET_WHATSAPP_CAMPAIGN_BY_ID_NEW = 'communication/GetWACampaignByIdNew';
export const LINK_VERIFICATION = 'Communication/LinksVerificationToTemplateBuilder';
export const SEND_TO_ME = 'Communication/SendTemplateTestEmailPreview';
export const DOWNLOAD_INTEGRATION_FILES = 'CommunicationSetting/DownloadIntegrationFiles';
export const DOMAIN_APP_LIST = 'CommunicationSetting/GetDomainAppList';
export const GET_DOMAIN_APP_LIST = 'CommunicationSetting/DomainAppList';

//Template_V4_Url_Config
export const URL_PREFIX_LINK = 'https://cdn.resulticks.com';

//LandingPage Builder
export const DEVLANDINGPAGE = 'http://localhost:7510/';
export const TEAMLANDINGPAGE = 'https://reacuixlp.resul.io/';
export const RUN19LANDINGPAGE = 'https://reacuixlprun19.resul.io/';
export const RUNLANDINGPAGE = 'https://reacuixlprun.resul.io/';

const HOST = window.location.hostname;
export const LANDING_BUILDER_REDIRECT_URL = HOST.includes('localhost')
    ? DEVLANDINGPAGE
    : HOST.includes('reacuix.resul.io')
        ? TEAMLANDINGPAGE
        : HOST.includes('run19.resulticks.com')
            ? RUN19LANDINGPAGE
            : HOST.includes('run.resulticks.com')
                ? RUNLANDINGPAGE
                : DEVLANDINGPAGE;

// Aliases restored after namespace-import codemod
export const GET_ACTIVE_DST_TIMEZONES = 'AccountSetup/GetActiveDSTTimezones';
export const DELETE_RCS_SETTINGS = 'CommunicationSetting/DeleteRcsSettings';
