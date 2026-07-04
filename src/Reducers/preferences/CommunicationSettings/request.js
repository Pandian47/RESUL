import { CHECK_MOBILEPUSH_GOALNAME, CHECK_PLAYSTORE_URL, CHECK_QUIET_HOURS_NAME_EXISTS, CHECK_SMTP_DOMAIN_EXISTS, CHECK_SUBSCRIPTION_NAME, CHECK_UNSUBSCRIPTION_NAME, CHECK_VENDOR_NAME_EXISTS, CHECK_WEBPUSH_GOALNAME, CLIENT_SMS_OPT_STATUS_CHANGE, COMM_CHECK_DOMAIN_EXIST, COMM_GET_DKIM_VALUES, COMM_RESTORE_DOMAIN_NAME, COMM_SEND_DKIM_DETAILS_MAIL, CREATE_RCS_SETTINGS, CREATE_WA_SETTINGS, DELETE_DOMAIN_APP_SETTING, DELETE_EMAIL_FOOTER_BY_ID, DELETE_QUIET_HOURS_SETTINGS, DELETE_RCS_SETTINGS, DELETE_SMS_KEYWORD_SETTING, DELETE_SMTP_DOMAIN_SETTINGS, DELETE_VMS_DATA_BYID, DELETE_WA_SETTINGS, DELETE_WEBMOBILE_LIST, DELETE_WEBPUSH_DATA, DKIM_VALIDATION, DOWNLOAD_INTEGRATION_FILES, DUPLICATE_QUIET_HOURS_SETTINGS, ENCODE_MOBILEPUSH_SETTINGS_DEVICESETUP_DATA, GETCREATIVE_DIGIPOP, GET_CLIENT_SMS_OPT_BY_ID, GET_CLIENT_SMS_OPT_SETTING, GET_CLIENT_SMTP_BY_ID, GET_CLIENT_SMTP_SETTINGS, GET_COMMUNICATION_TYPE_LIST, GET_CONFIG_DETAILS, GET_CREATIVE_DIGIPOP_NAMES, GET_DEFAULT_SMS_KEYWORD, GET_DOMAIN_APP_LIST, GET_DOMAIN_APP_SETTING, GET_DOUBLE_OPT_IN, GET_DOUBLE_OPT_IN_BY_ID, GET_EMAIL_FOOTER, GET_EMAIL_FOOTER_BY_ID, GET_EMAIL_FOOTER_NAME_EXIST, GET_FREQUENCY_CAP, GET_FREQUENCY_CAP_AUDIENCEGROUP_LIST, GET_FREQUENCY_CAP_BY_ID, GET_FREQUENCY_CAP_SELECT_AUDIENCE_GROUP, GET_INBOUND_ACTION_VALUE, GET_INBOUND_KEYS, GET_INBOUND_NO_LIST, GET_LIFETIME_CAP, GET_LIFETIME_CAP_ACTIONS, GET_LINE_CAMPAIGN_BY_ID, GET_LINE_DATA, GET_MOBILEPUSH_ANALYSIS_DATA, GET_MOBILEPUSH_BY_ID, GET_MOBILEPUSH_DATA, GET_MOBILEPUSH_DEVICELIST, GET_MOBILEPUSH_DOMAIN_EXISIT, GET_MOBILEPUSH_GOALSETTINGS_BYID_DATA, GET_MOBILEPUSH_GOALSETTINGS_DATA, GET_MOBILEPUSH_GOALSETTINGS_MASTERDATA, GET_MOBILEPUSH_LANGUAGE_DATA, GET_MOBILEPUSH_SETTINGS_BYID_DATA, GET_MOBILEPUSH_SETTINGS_DATA, GET_MOBILEPUSH_SETTINGS_DEVICELIST_DATA, GET_MOBILEPUSH_SETTINGS_USERINFO_DATA, GET_OPT_IN_OUT_BY_ID, GET_OPT_IN_OUT_LIST, GET_QUIET_HOURS_LOOKUPS, GET_QUIET_HOURS_SETTINGS, GET_QUIET_HOURS_SETTINGS_BY_ID, GET_RCS_CREATE_PROVIDERS, GET_RCS_GRID, GET_RCS_UPDATE_RECORD_DATA, GET_RULENAME_EXIST, GET_RULE_TYPE_LIST, GET_SCREEN_NAME_LIST, GET_SDK_HEALTH_CHECK, GET_SEGMENT_LIST, GET_SENDER_ID_LIST, GET_SERVICE_PROVIDERS, GET_SMS_GRID, GET_SMS_KEYWORD, GET_SMS_OPTOUT_FALLBACK_KEYWORDS, GET_SMS_SETTINGS_BY_ID, GET_SMS_TEMPLATE_BY_ID, GET_SMS_TEMPLATE_LIST, GET_SMTP_DOMAIN_SETTINGS_GRID, GET_SMTP_HOUSE, GET_SMTP_THROTTLE, GET_SUBSCRIPTION, GET_SUBSCRIPTION_BY_ID, GET_SUB_SCREEN_NAME_LIST, GET_UNSUBSCRIPTION, GET_UNSUBSCRIPTION_BY_ID, GET_VMS_DATA, GET_VMS_DATA_BYID, GET_WA_CREATE_PROVIDERS, GET_WA_GRID, GET_WA_UPDATE_RECORD_DATA, GET_WEBMOBILE_DOMAIN_LIST, GET_WEBMOBILE_MOBILE_LIST, GET_WEBPUSH_ANLAYTICS_DATA, GET_WEBPUSH_CONFIG, GET_WEBPUSH_DATA, GET_WEBPUSH_DOMAIN_EXIST, GET_WEBPUSH_EDIT_DATA, GET_WEBPUSH_GOALEVENTS_DATA, GET_WEBPUSH_GOALEVENTS_DATABYID, GET_WEBPUSH_GOAL_DATA, GET_WEBPUSH_SETTINGS_DATA, GET_WEBPUSH_TENANT_DATA, GET_WEBPUSH_URL_EXIST, INSERT_SMS_KEYWORD, ISNAME_CREATIVE_DIGIPOP, IS_TEMPLATE_NAME_EXISTS, ONBOARD_COMPLIANCE_DETAILS, ONBOARD_OPT_IN_OUT, REMOVE_APPSTORE, REMOVE_MOBILEPUSH_DATA, REMOVE_MOBILEPUSH_SETTINGS_DEVICESETUP_DATA, SAVE_CREATIVE_DIGIPOP, SAVE_DOUBLE_OPT_IN, SAVE_EMAIL_FOOTER, SAVE_FREQUENCY_CAP_DATA, SAVE_INBOUND_NUMBERS, SAVE_LIFETIME_CAP, SAVE_LINE_DATA, SAVE_MOBILEPUSH_DATA, SAVE_MOBILEPUSH_GOALSETTINGS_DATA, SAVE_MOBILEPUSH_SETTINGS_DATA, SAVE_MOBILEPUSH_SETTINGS_DEVICESETUP_DATA, SAVE_SMS_TEMPLATES, SAVE_SUBSCRIPTION, SAVE_UNSUBSCRIPTION, SAVE_VMS_DATA, SAVE_WEBMOBILE_LIST, SAVE_WEBPUSH_CONFIG, SAVE_WEBPUSH_DATA, SAVE_WEBPUSH_GOALEVENTS_DATA, SAVE_WEBPUSH_SETTINGS_DATA, SEND_SMSMAIL, SEND_SMTPMAIL, SMTP_DOMAIN_SETTINGS_BY_ID, STATUS_MOBILEPUSH_GOALSETTINGS_DATA, STATUS_WEBPUSH_GOALSETTINGS_DATA, SUB_UNSUB_IMPORT_EDM_URL, SUB_UNSUB_UPLOAD_EDM_FILE, UPDATE_CREATIVE_DIGIPOP, UPDATE_MOBILEPUSH_DEFAULT, UPDATE_QUIET_HOURS_STATUS, UPDATE_SETTING_STATUS, UPDATE_SMS_KEYWORD, UPDATE_SMS_OPTOUT_FALLBACK_KEYWORDS, UPDATE_SMTP_DOMAIN, UPDATE_SMTP_SETTINGS, UPDATE_TEMPLATE_STATUS, UPDATE_WEBPUSH_DEFAULT, UPLOAD_PREFERENCE_IMAGE, UPSERT_DOMAIN_APP_SETTING, UPSERT_QUIET_HOURS_SETTINGS, UPSERT_SMS_SETTINGS_SMPP, UPSERT_WHATSAPP_SETTINGS, UPSER_CLIENT_SMS_OPT_SETTING, VALIDATE_ATOP_NAME, VALIDATE_FRIENDLY_NAME, CREATE_OR_UPDATE_CUSTOM_EVENT, GET_CUSTOM_EVENT_LIST, GET_CUSTOM_EVENT_BY_ID, DELETE_CUSTOM_EVENT, CHECK_CUSTOM_EVENT_NAME_EXIST, COMM_SEND_DOMAIN_DETAILS_MAIL } from 'Constants/EndPoints';
import request from 'Utils/Http';

import { updateCommunicationSettings } from './reducer';
import { update_failures_API_Errors } from 'Reducers/globalState/reducer';

// Frequency Cap
export const getCSFrequencyCap = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_FREQUENCY_CAP,
            payload,
            // loading: true,
            fail: (err) => {
                            },
        }),
    );
};

export const getSegmentationList = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_SEGMENT_LIST,
            payload,
            loading: true,
            ok: ({ data }) => {
                const { status, data: res } = data;
                if (status) dispatch(updateCommunicationSettings({ field: 'segmentList', payload: res }));
                else dispatch(updateCommunicationSettings({ field: 'segmentList', payload: [] }));
            },
            fail: (err) => {
                            },
        }),
    );
};

export const getAudienceGroupList = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_FREQUENCY_CAP_AUDIENCEGROUP_LIST,
            payload,
            loading: false,
            ok: ({ data }) => {
                const { status, data: res } = data;
                if (status) dispatch(updateCommunicationSettings({ field: 'audienceGroupList', payload: res }));
                else dispatch(updateCommunicationSettings({ field: 'audienceGroupList', payload: [] }));
            },
            fail: (err) => {
                            },
        }),
    );
};

export const getSelectAudienceGroup = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_FREQUENCY_CAP_SELECT_AUDIENCE_GROUP,
            payload,
            loading: false,
            ok: ({ data }) => {
                const { status, data: res } = data;
                if (status) dispatch(updateCommunicationSettings({ field: 'selectAudienceGroup', payload: res }));
                else dispatch(updateCommunicationSettings({ field: 'selectAudienceGroup', payload: [] }));
            },
            fail: (err) => {
                            },
        }),
    );
};

export const getCommunicationTypeLists = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_COMMUNICATION_TYPE_LIST,
            payload,
            loading: false,
            ok: ({ data }) => {
                const { status, data: res } = data;
                if (status) dispatch(updateCommunicationSettings({ field: 'communicationTypes', payload: res }));
                else dispatch(updateCommunicationSettings({ field: 'communicationTypes', payload: [] }));
            },
            fail: (err) => {
                            },
        }),
    );
};

export const saveFrequencyCapData = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SAVE_FREQUENCY_CAP_DATA,
            payload,
            loading,
            isFailureCheck: true,
              ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
            },
            fail: (err) => {
                            },
        }),
    );
};

export const getFrequencyById = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_FREQUENCY_CAP_BY_ID,
            payload,
            loading: false,
            isFailureCheck: true,
              ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
            },
            fail: (err) => {
                            },
        }),
    );
};

export const getFrequencyRuleExisit =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_RULENAME_EXIST,
                payload,
                // loading: true,
                fail: (err) => {
                                    },
            }),
        );
    };

export const getRuleTypeList = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_RULE_TYPE_LIST,
            payload,
            loading: false,
            ok: ({ data }) => {
                const { status, data: res } = data;
                if (status) dispatch(updateCommunicationSettings({ field: 'ruleTypeList', payload: res }));
                else dispatch(updateCommunicationSettings({ field: 'ruleTypeList', payload: [] }));
            },
            fail: (err) => {
                            },
        }),
    );
};

// SMS
export const getCSSMSGridData =(payload, setGridLoading = () => {}) => async (dispatch) => {
    setGridLoading(true);
    dispatch(
        request.post({
            url: GET_SMS_GRID,
            payload,
            loading: false,
            ok: ({ data }) => {
                const { status, data: res, isCreated } = data;

                   if(isCreated != undefined){
              dispatch(updateCommunicationSettings({ field: 'isCreated', payload: false }));
                }

                if (status) dispatch(updateCommunicationSettings({ field: 'smsData', payload: res }));
                else{
                    dispatch(updateCommunicationSettings({ field: 'smsData', payload: [] }));
                }
            },
            fail: (err) => {
                            },
            final:() =>{
                setGridLoading(false);
            }
        }),
    );
}

export const getClientSMSOptSetting = (payload, setGridLoading = () => {}) => async (dispatch) => {
    setGridLoading(true);
    return dispatch(
        request.post({
            url: GET_CLIENT_SMS_OPT_SETTING,
            payload,
            loading: false,
            ok: ({ data }) => {
                // Response structure: { status, data: [...], message, totalRows }
                return data;
            },
            fail: (err) => {
                            },
            final: () => {
                setGridLoading(false);
            },
        }),
    );
};

export const updateClientSMSOptStatus = (payload) => async (dispatch) =>
    dispatch(
        request.post({
            url: CLIENT_SMS_OPT_STATUS_CHANGE,
            payload,
            loading: true,
            isFailureCheck: true,
            ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
                if (!status) {
                    dispatch(
                        update_failures_API_Errors({
                            field: CLIENT_SMS_OPT_STATUS_CHANGE,
                            message: message,
                        }),
                    );
                }
            },
            fail: (err) => {
                            },
        }),
    );

export const getClientSMSOptById = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_CLIENT_SMS_OPT_BY_ID,
            payload,
            loading: true,
            isFailureCheck: true,
            ok: ({ data }) => {
                                return data;
            },
            fail: (err) => {
                            },
        }),
    );
};

export const validateFriendlyName = ({ payload }) => async (dispatch) => {
    const payloadData = payload?.payload || payload;
    const res = await dispatch(
        request.post({
            url: VALIDATE_FRIENDLY_NAME,
            payload: payloadData,
            loading: false,
            isToast: false,
        }),
    );
    return res?.data ?? res ?? { status: false };
};

export const validateAtoPName = (payload) => async (dispatch) => {
    const res = await dispatch(
        request.post({
            url: VALIDATE_ATOP_NAME,
            payload,
            loading: false,
            isToast: false,
        }),
    );
    return res?.data ?? res ?? { status: false };
};

export const insertSMSKeyword = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: INSERT_SMS_KEYWORD,
            payload,
            loading,
            isFailureCheck: true,
            ok: ({ data }) => {
                return data;
            },
            fail: (err) => {
                            },
        }),
    );
};

export const updateSMSKeyword = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: UPDATE_SMS_KEYWORD,
            payload,
            loading,
            isFailureCheck: true,
            ok: ({ data }) => {
                return data;
            },
            fail: (err) => {
                            },
        }),
    );
};

export const getInboundActionValue = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_INBOUND_ACTION_VALUE,
            payload,
            loading: false,
            ok: ({ data }) => {
                const { status, data: res } = data;
                if (status && Array.isArray(res)) {
                    dispatch(updateCommunicationSettings({ field: 'inboundActionTypes', payload: res }));
                } else {
                    dispatch(updateCommunicationSettings({ field: 'inboundActionTypes', payload: [] }));
                }
                return data;
            },
            fail: (err) => {
                            },
        }),
    );
};

export const deleteSMSKeywordSetting = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: DELETE_SMS_KEYWORD_SETTING,
            payload,
            loading: true,
            isFailureCheck: true,
            ok: ({ data }) => {
                return data;
            },
            fail: (err) => {
                            },
        }),
    );
};

export const getSMSKeyword = (payload) => async (dispatch) => {
    dispatch(updateCommunicationSettings({ field: 'customKeywordsLoading', payload: true }));
    const result = await dispatch(
        request.post({
            url: GET_SMS_KEYWORD,
            payload,
            loading: false,
            ok: ({ data }) => {
                const { status, data: res } = data;
                if (status && Array.isArray(res)) {
                    dispatch(updateCommunicationSettings({ field: 'customKeywordsList', payload: res }));
                } else {
                    dispatch(updateCommunicationSettings({ field: 'customKeywordsList', payload: [] }));
                }
                return data;
            },
            fail: (err) => {
                            },
        }),
    );
    dispatch(updateCommunicationSettings({ field: 'customKeywordsLoading', payload: false }));
    return result;
};

export const updateSmsOptoutFallbackKeywords = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: UPDATE_SMS_OPTOUT_FALLBACK_KEYWORDS,
            payload,
            loading,
            isFailureCheck: true,
            ok: ({ data }) => {
                return data;
            },
            fail: (err) => {
                            },
        }),
    );
};

export const getSmsOptoutFallbackKeywords = (payload) => async (dispatch) => {
    dispatch(updateCommunicationSettings({ field: 'fallbackMessageLoading', payload: true }));
    const result = await dispatch(
        request.post({
            url: GET_SMS_OPTOUT_FALLBACK_KEYWORDS,
            payload,
            loading: false,
            ok: ({ data }) => {
                const { status, data: res } = data;
                if (status && res) {
                    dispatch(updateCommunicationSettings({ field: 'fallbackMessageData', payload: [res] }));
                } else {
                    dispatch(updateCommunicationSettings({ field: 'fallbackMessageData', payload: [] }));
                }
                return data;
            },
            fail: (err) => {
                            },
        }),
    );
    dispatch(updateCommunicationSettings({ field: 'fallbackMessageLoading', payload: false }));
    return result;
};

export const getOnboardComplianceDetails = (payload) => async (dispatch) => {
    dispatch(updateCommunicationSettings({ field: 'complianceKeywordsLoading', payload: true }));
    dispatch(updateCommunicationSettings({ field: 'fallbackMessageLoading', payload: true }));
    dispatch(updateCommunicationSettings({ field: 'complianceKeywordsList', payload: [] }));
    dispatch(updateCommunicationSettings({ field: 'fallbackMessageData', payload: [] }));

    const result = await dispatch(
        request.post({
            url: ONBOARD_COMPLIANCE_DETAILS,
            payload,
            loading: false,
            ok: ({ data }) => {
                const { status, data: res } = data;
                if (status && res) {
                    const complianceKeywords = Array.isArray(res.complianceKeywords)
                        ? res.complianceKeywords.map((item) => ({
                              keyName: item.topic,
                              keyValue: item.type,
                              message: item.message,
                          }))
                        : [];
                    dispatch(updateCommunicationSettings({ field: 'complianceKeywordsList', payload: complianceKeywords }));
                    const fallbackData = res?.fallbackMessage ? [{ message: res?.fallbackMessage }] : [];
                    dispatch(updateCommunicationSettings({ field: 'fallbackMessageData', payload: fallbackData }));
                } else {
                    dispatch(updateCommunicationSettings({ field: 'complianceKeywordsList', payload: [] }));
                    dispatch(updateCommunicationSettings({ field: 'fallbackMessageData', payload: [] }));
                }
                return data;
            },
            fail: (_err) => {
                // Lists stay empty; loading flags will be cleared below.
            },
        }),
    );

    dispatch(updateCommunicationSettings({ field: 'complianceKeywordsLoading', payload: false }));
    dispatch(updateCommunicationSettings({ field: 'fallbackMessageLoading', payload: false }));
    return result;
};

export const getDefaultSMSKeyword = (payload) => async (dispatch) => {
    dispatch(updateCommunicationSettings({ field: 'complianceKeywordsLoading', payload: true }));
    const result = await dispatch(
        request.post({
            url: GET_DEFAULT_SMS_KEYWORD,
            payload,
            loading: false,
            ok: ({ data }) => {
                const { status, data: res } = data;
                if (status && Array.isArray(res)) {
                    dispatch(updateCommunicationSettings({ field: 'complianceKeywordsList', payload: res }));
                } else {
                    dispatch(updateCommunicationSettings({ field: 'complianceKeywordsList', payload: [] }));
                }
                return data;
            },
            fail: (err) => {
                            },
        }),
    );
    dispatch(updateCommunicationSettings({ field: 'complianceKeywordsLoading', payload: false }));
    return result;
};

export const saveInboundNumbers = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SAVE_INBOUND_NUMBERS,
            payload,
            loading,
            isFailureCheck: true,
            ok: ({ data }) => {
                return data;
            },
            fail: (err) => {
                            },
        }),
    );
};

export const getOptInOutByID = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_OPT_IN_OUT_BY_ID,
            payload,
            loading: false,
            ok: ({ data }) => {
                return data;
            },
            fail: (err) => {
                            },
        }),
    );
};

export const onboardOptInOut = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: ONBOARD_OPT_IN_OUT,
            payload,
            loading,
            isFailureCheck: true,
            ok: ({ data }) => {
                return data;
            },
            fail: (err) => {
                            },
        }),
    );
};

export const getSenderIDList = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_SENDER_ID_LIST,
            payload,
            loading: false,
            ok: ({ data }) => {
                const { status, data: res } = data;
                if (status && Array.isArray(res)) {
                    dispatch(updateCommunicationSettings({ field: 'optInOutSenderList', payload: res }));
                } else {
                    dispatch(updateCommunicationSettings({ field: 'optInOutSenderList', payload: [] }));
                }
                return data;
            },
            fail: (err) => {
                            },
        }),
    );
};

export const getOptInOutList = (payload) => async (dispatch) => {
    dispatch(updateCommunicationSettings({ field: 'keywordManagementLoading', payload: true }));
    const result = await dispatch(
        request.post({
            url: GET_OPT_IN_OUT_LIST,
            payload,
            loading: false,
            ok: ({ data }) => {
                const { status, data: res, countryId } = data;
                if (status && Array.isArray(res)) {
                    dispatch(updateCommunicationSettings({ field: 'optInOutList', payload: res }));
                } else {
                    dispatch(updateCommunicationSettings({ field: 'optInOutList', payload: [] }));
                }
                if (countryId) {
                    dispatch(updateCommunicationSettings({ field: 'optInOutCountryId', payload: countryId }));
                }
                return data;
            },
            fail: (err) => {
                            },
        }),
    );
    dispatch(updateCommunicationSettings({ field: 'keywordManagementLoading', payload: false }));
    return result;
};

export const getInboundNoList = (payload) => async (dispatch) => {
    dispatch(updateCommunicationSettings({ field: 'inboundListLoading', payload: true }));
    const result = await dispatch(
        request.post({
            url: GET_INBOUND_NO_LIST,
            payload,
            loading: false,
            ok: ({ data }) => {
                return data;
            },
            fail: (err) => {
                            },
        }),
    );
    dispatch(updateCommunicationSettings({ field: 'inboundListLoading', payload: false }));
    return result;
};

export const getInboundKeys = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_INBOUND_KEYS,
            payload,
            loading: true,
            ok: ({ data }) => {
                                return data;
            },
            fail: (err) => {
                            },
        }),
    );
};

export const upserClientSMSOptSetting = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: UPSER_CLIENT_SMS_OPT_SETTING,
            payload,
            loading: true,
            isFailureCheck: true,
            ok: ({ data }) => {
                                return data;
            },
            fail: (err) => {
                            },
        }),
    );
};

export const updateCSSMSGridDataStatus = (payload) => async (dispatch) =>
    dispatch(
        request.post({
            url: UPDATE_SETTING_STATUS,
            payload,
            // loading: true,
              ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
                if (!status) {
                    dispatch(
                        update_failures_API_Errors({
                            field: UPDATE_SETTING_STATUS,
                            message: message,
                        }),
                    );
                }
            },
            fail: (err) => {
                            },
        }),
    );

// export const updateSettingStatus = (payload) => async (dispatch) => {
//    return dispatch(
//         request.post({
//             url: UPDATE_SETTING_STATUS,
//             payload,
//             loading: true,
//             ok: ({ data }) => {
//                 const { status, data: res } = data;

//             },
//             fail: (err) => {
//             },
//         }),
//     );
// }

export const getCSServiceProviders = (payload) => async (dispatch) => {
   return dispatch(
        request.post({
            url: GET_SERVICE_PROVIDERS,
            payload,
            loading: false,
            ok: ({ data }) => {
                const { status, data: res } = data;
                if (status) dispatch(updateCommunicationSettings({ field: 'settingsProviders', payload: res }));
                else{
                    dispatch(updateCommunicationSettings({ field: 'settingsProviders', payload: [] }));
                }
            },
            fail: (err) => {
                            },
        }),
    );
}

export const upsertSMPPSMSSetting = (payload, handleCancel, loading = false) => async (dispatch) =>
    dispatch(
        request.post({
            url: UPSERT_SMS_SETTINGS_SMPP,
            payload,
            loading,
              ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
                if (!status) {
                    dispatch(
                        update_failures_API_Errors({
                            field: UPSERT_SMS_SETTINGS_SMPP,
                            message: message,
                        }),
                    );
                }
            },
            fail: (err) => {
                            },
        }),
    );

export const getSMSSettingsById = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_SMS_SETTINGS_BY_ID,
            payload,
            loading: false,
            ok: () => {},
            isFailureCheck: true,
            fail: (err) => {
                            },
        }),
    );
};

export const checkVendorNameExists = ({ payload }) => async (dispatch) => {
    const payloadData = payload?.payload || payload;
    const friendlyName = payloadData?.friendlyName != null ? String(payloadData.friendlyName).trim() : '';
    const apiPayload = {
        friendlyName,
        channel: payloadData?.channel ?? 21,
    };
    const res = await dispatch(
        request.post({
            url: CHECK_VENDOR_NAME_EXISTS,
            payload: apiPayload,
            loading: false,
            isToast: false,
        }),
    );
    return res?.data ?? res ?? { status: false };
};

export const checkTemplateNameExists = ({ payload }) => async (dispatch) => {
    const res = await dispatch(
        request.post({
            url: IS_TEMPLATE_NAME_EXISTS,
            payload: payload?.payload || payload,
            loading: false,
            isToast: false,
        }),
    );
    return res?.data ?? res ?? { status: false };
};

// WhatsApp
export const getWAGrid = (payload, setGridLoading = () => {}) => async (dispatch) => {
    setGridLoading(true);
    dispatch(
        request.post({
            url: GET_WA_GRID,
            payload,
             loading: false,
            ok: ({ data }) => {
                const { status, data: res , isCreated } = data;
                    if(isCreated != undefined){
                        dispatch(updateCommunicationSettings({ field: 'isCreated', payload: false }));
                    }
                    if (status) dispatch(updateCommunicationSettings({ field: 'whatsAppGrid', payload: res }));
                    else{
                        dispatch(updateCommunicationSettings({ field: 'whatsAppGrid', payload: [] }));
                    }
            },
            fail: (err) => {
                            },
            final:(data)=>{
                 setGridLoading(false);
            }
        }),
    );
}

export const getCSWAUpdateGet = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_WA_UPDATE_RECORD_DATA,
            payload,
            loading: false,
            isFailureCheck: true,
              ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
            },
            fail: (err) => {
                            },
        }),
    );
};

export const getCSWACreateProviders = (payload) => async (dispatch) =>
    dispatch(
        request.post({
            url: GET_WA_CREATE_PROVIDERS,
            payload,
            loading: false,
            ok: ({ data }) => {
                const { status, data: res } = data;
                if (status) dispatch(updateCommunicationSettings({ field: 'settingsProviders', payload: res }));
                else{
                    dispatch(updateCommunicationSettings({ field: 'settingsProviders', payload: [] }));
                }
            },
            fail: (err) => {
                            },
        }),
    );

export const createCSWASettings = (payload, handleCancel, loading = false) => async (dispatch) =>
    dispatch(
        request.post({
            url: CREATE_WA_SETTINGS,
            payload,
            loading,
            ok: ({ data }) => {
                const { status, message='No data available'} = data;
                if (status) handleCancel(true);
                else{
                     dispatch(
                        update_failures_API_Errors({
                            field: CREATE_WA_SETTINGS,
                            message: message,
                        }),
                    );
                }
            },
            fail: (err) => {
                            },
        }),
    );

export const upsertWhatsAppSettings = (payload, handleCancel, loading = false) => async (dispatch) =>
    dispatch(
        request.post({
            url: UPSERT_WHATSAPP_SETTINGS,
            payload,
            loading,
            ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
                if (status) handleCancel(true);
                else {
                    dispatch(
                        update_failures_API_Errors({
                            field: UPSERT_WHATSAPP_SETTINGS,
                            message: message,
                        }),
                    );
                }
            },
            fail: (err) => {
                            },
        }),
    );

export const checkWhatsAppFriendlyNameExist = ({ payload, setError, clearErrors }) => async (dispatch) => {
    const { vendorFriendlyName, ...rest } = payload || {};
    const apiPayload = {
        friendlyName: vendorFriendlyName?.trim() ?? '',
        ...rest,
    };
    return dispatch(
        request.post({
            url: CHECK_VENDOR_NAME_EXISTS,
            payload: apiPayload,
            loading: false,
            isToast: false,
            ok: ({ data }) => data,
            fail: (err) => {
                                return { status: false };
            },
        }),
    );
};

export const checkRCSFriendlyNameExist = ({ payload}) => async (dispatch) => {
    return dispatch(
        request.post({
            url: CHECK_VENDOR_NAME_EXISTS,
            payload,
            loading: false,
            isToast: false,
            ok: ({ data }) => data,
            fail: (err) => {
                return { status: false };
            },
        }),
    );
};

export const deleteCSWA = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: DELETE_WA_SETTINGS,
            payload,
            loading: true,
            isFailureCheck: true,
            ok: () => {},
            fail: (err) => {
                            },
        }),
    );
};

// RCS
export const getRCSGrid = (payload, setGridLoading = () => {}) => async (dispatch) => {
    setGridLoading(true);
    dispatch(
        request.post({
            url: GET_RCS_GRID,
            payload,
             loading: false,
            ok: ({ data }) => {
                const { status, data: res , isCreated } = data;
                    if(isCreated != undefined){
                        dispatch(updateCommunicationSettings({ field: 'isCreated', payload: false }));
                    }
                    if (status) dispatch(updateCommunicationSettings({ field: 'rcsGrid', payload: res }));
                    else{
                        dispatch(updateCommunicationSettings({ field: 'rcsGrid', payload: [] }));
                    }
            },
            fail: (err) => {
                            },
            final:(data)=>{
                 setGridLoading(false);
            }
        }),
    );
}

export const getCSRCSUpdateGet = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_RCS_UPDATE_RECORD_DATA,
            payload,
            loading: false,
            isFailureCheck: true,
              ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
            },
            fail: (err) => {
                            },
        }),
    );
};

export const getCSRCSCreateProviders = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_RCS_CREATE_PROVIDERS,
            payload,
            loading: false,
            ok: ({ data }) => {
                const { status, data: res } = data;
                if (status) dispatch(updateCommunicationSettings({ field: 'RCSsettingsProviders', payload: res }));
                else{
                    dispatch(updateCommunicationSettings({ field: 'RCSsettingsProviders', payload: [] }));
                }
            },
            fail: (err) => {
                            },
        }),
    );
};

export const createCSRCSSettings = (payload, handleCancel, loading = false) => async (dispatch) =>
    dispatch(
        request.post({
            url: CREATE_RCS_SETTINGS,
            payload,
            loading,
            ok: ({ data }) => {
                const { status, message='No data available'} = data;
                if (status) handleCancel(true);
                // else{
                //      dispatch(
                //         update_failures_API_Errors({
                //             field: CREATE_RCS_SETTINGS,
                //             message: message,
                //         }),
                //     );
                // }
            },
            fail: (err) => {
                            },
        }),
    );

export const deleteCSRCS = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: DELETE_RCS_SETTINGS,
            payload,
            loading: true,
            isFailureCheck: true,
            ok: () => {},
            fail: (err) => {
                            },
        }),
    );
};

// Email - Subscribe
export const checkSubscriptionExists =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: payload?.subscribeName ? CHECK_SUBSCRIPTION_NAME : CHECK_UNSUBSCRIPTION_NAME,
                payload,
                //loading: true,
                isToast: false,
                ok: () => {},
                fail: (err) => {
                                    },
            }),
        );
    };

export const saveSubscription = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SAVE_SUBSCRIPTION,
            payload,
            loading,
            isFailureCheck: true,
             ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
                
            },
            fail: (err) => {
                            },
        }),
    );
};

export const saveUnSubscription = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SAVE_UNSUBSCRIPTION,
            payload,
            loading,
            ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
                if (!status) {
                    dispatch(
                        update_failures_API_Errors({
                            field: SAVE_UNSUBSCRIPTION,
                            message: message,
                        }),
                    );
                }
            },
            fail: (err) => {
                            },
        }),
    );
};

export const getSubscriptions = (payload, setIsLoading = () => {}) => async (dispatch) => {
        setIsLoading(true)
        return dispatch(
        request.post({
            url: GET_SUBSCRIPTION,
            payload,
            loading: false,
            ok: ({ data }) => {
                const { status, data: res , isCreated } = data;
                if(isCreated != undefined){
              dispatch(updateCommunicationSettings({ field: 'isCreated', payload: false }));
                }                
                if (status) {
                    dispatch(updateCommunicationSettings({ field: 'subscribeData', payload: res }));
                }
                else {
                    dispatch(updateCommunicationSettings({ field: 'subscribeData', payload: [] }));
                }
                return data
            },
            fail: (err) => {
                                 return err
            },
            final: (err) => {
                                setIsLoading(false)
            },
        }),
    );
};

export const getSubscribeEditData = (payload) => async (dispatch) =>
    dispatch(
        request.post({
            url: GET_SUBSCRIPTION_BY_ID,
            payload,
            loading: false,
            isFailureCheck: true,
            ok: ({ data }) => {
                const { status, data: res, message='No data available' } = data;
                if (status){
                    dispatch(updateCommunicationSettings({ field: 'subscribeUpdateData', payload: res?.[0] || {} }));
                }else{
                    dispatch(updateCommunicationSettings({ field: 'subscribeUpdateData', payload: {}}));
                }
            },
            fail: (err) => {
                            },
        }),
    );

// Email - UnSubscribe
export const getUnSubscriptions = (payload, setIsLoading = () => {}) => async (dispatch) => {
    setIsLoading(true);
    return dispatch(
        request.post({
            url: GET_UNSUBSCRIPTION,
            payload,
            loading: false,
            ok: ({ data }) => {
                const { status, data: res } = data;
                if (status){
                  dispatch(updateCommunicationSettings({ field: 'unSubscribeData', payload: res }));
                }else{
                  dispatch(updateCommunicationSettings({ field: 'unSubscribeData', payload: [] }));
                }
                return data;
            },
            fail: (err) => {
                                return err;
            },
            final: () => {
                setIsLoading(false);
            },
        }),
    );
};

export const getUnSubscribeEditData = (payload, { loading = false } = {}) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_UNSUBSCRIPTION_BY_ID,
            payload,
            loading,
            ok: ({ data }) => {
                const { status, data: res
                      , message='No data available' 
                      } = data;
                if (status)
                    dispatch(updateCommunicationSettings({ field: 'subscribeUpdateData', payload: res?.[0] || {} }));
                else{
                     dispatch(updateCommunicationSettings({ field: 'subscribeUpdateData', payload: {} }));
                     dispatch(
                        update_failures_API_Errors({
                            field: GET_UNSUBSCRIPTION_BY_ID,
                            message: message,
                        }),
                    );

                }
            },
            fail: (err) => {
                            },
        }),
    );
};

//SMTP Settings:


export const getClientSmtpSettings = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_CLIENT_SMTP_SETTINGS,
            payload,
            // loading: true,
            fail: (err) => {
                            },
        }),
    );
};
export const sendEmailSMTP = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SEND_SMTPMAIL,
            payload,
            loading: false,
            isFailureCheck: true,
             ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
                
            },
            fail: (err) => {
                            },
        }),
    );
};
// SDK Health Check
export const getSdkHealthCheck = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_SDK_HEALTH_CHECK,
            payload,
            loading: false,
            fail: (err) => {
                            },
        }),
    );
};

export const sendSMSSMPP = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SEND_SMSMAIL,
            payload,
            loading: true,
            isFailureCheck: true,
            ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
            },
            fail: (err) => {
                            },
        }),
    );
};

export const getSmtpDomainSettingsById = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SMTP_DOMAIN_SETTINGS_BY_ID,
            payload,
            loading: false,
            isFailureCheck: true,
             ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
                
            },
            fail: (err) => {
                            },
        }),
    );
};

export const updateSmtpSettings = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: UPDATE_SMTP_DOMAIN,
            payload,
            loading,
            isFailureCheck: true,
             ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
               
            },
            fail: (err) => {
                            },
        }),
    );
};

// --- SMS Templates ---

export const saveSmsTemplates = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SAVE_SMS_TEMPLATES,
            payload,
            loading,
            isFailureCheck: true,
            ok: ({ data }) => {
                return data;
            },
            fail: (err) => {
                            },
        }),
    );
};

export const getSmsTemplateById =
    (payload) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_SMS_TEMPLATE_BY_ID,
                payload,
                loading: false,
                isFailureCheck: true,
                ok: ({ data }) => data, // { status, data: {...}, message }
                fail: (err) => {
                                    },
            }),
        );
    };

export const getSmsTemplateList =
    (payload,loading) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_SMS_TEMPLATE_LIST,
                payload,
                loading: loading ?? false,
                // isFailureCheck: true,
                ok: ({ data }) => data, // { status, data: [...], message, totalRows }
                fail: (err) => {
                                    },
            }),
        );
    };

export const updateSettingStatus =
    (payload) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: UPDATE_SETTING_STATUS,
                payload,
                loading: true,
                isFailureCheck: true,
                ok: ({ data }) => data, // { status, message }
                fail: (err) => {
                                    },
            }),
        );
    };

export const updateTemplateStatus =
    (payload, loading = false) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: UPDATE_TEMPLATE_STATUS,
                payload,
                loading,
                isFailureCheck: true,
                ok: ({ data }) => data,
                fail: (err) => {
                                    },
            }),
        );
    };

export const getSmtpDomainSettingsGrid = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_SMTP_DOMAIN_SETTINGS_GRID,
            payload,
            // loading: true,
            fail: (err) => {
                            },
        }),
    );
};

export const checkSMTPDomainExists = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: CHECK_SMTP_DOMAIN_EXISTS,
            payload,
            loading: false,
            isToast: false,
            fail: (err) => {
                            },
        }),
    );
};

export const deleteSmtpDomainSettingsById = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: DELETE_SMTP_DOMAIN_SETTINGS,
            payload,
            loading: false,
            isFailureCheck: true,
             ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
            },
            fail: (err) => {
                            },
        }),
    );
};

export const getClientSMTPById = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_CLIENT_SMTP_BY_ID,
            payload,
            loading: false,
            isFailureCheck: true,
             ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
            },
            fail: (err) => {
                            },
        }),
    );
};

export const getDomainSmtpDomain = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_SMTP_DOMAIN_SETTINGS_GRID,
            payload,
            loading: false,
            fail: (err) => {
                            },
        }),
    );
};

export const getThrottleList = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_SMTP_THROTTLE,
            payload,
            loading: false,
            fail: (err) => {
                            },
        }),
    );
};

export const getHouseList = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_SMTP_HOUSE,
            payload,
            loading: false,
            fail: (err) => {
                            },
        }),
    );
};

export const updateClientSmtpSettings = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: UPDATE_SMTP_SETTINGS,
            payload,
            loading,
            isFailureCheck: true,
             ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
            },
            fail: (err) => {
                            },
        }),
    );
};

// Double Opt In
export const getDoubleOptInData = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_DOUBLE_OPT_IN,
            payload,
            loading: true,
            fail: (err) => {
                            },
        }),
    );
};

export const getDoubleOptInById = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_DOUBLE_OPT_IN_BY_ID,
            payload,
            loading: true,
            isFailureCheck: true,
              ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
                
            },
            fail: (err) => {
                            },
        }),
    );
};

export const saveDoubleOptIn = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SAVE_DOUBLE_OPT_IN,
            payload,
            loading,
            isFailureCheck: true,
              ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
            },
            fail: (err) => {
                            },
        }),
    );
};

// Custom Event
export const createOrUpdateCustomEvent = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: CREATE_OR_UPDATE_CUSTOM_EVENT,
            payload,
            loading: true,
            fail: (err) => {},
        }),
    );
};

export const getCustomEventList = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_CUSTOM_EVENT_LIST,
            payload,
            loading: false,
            fail: (err) => {},
        }),
    );
};

export const getCustomEventById = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_CUSTOM_EVENT_BY_ID,
            payload,
            loading: true,
            fail: (err) => {},
        }),
    );
};

export const deleteCustomEvent = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: DELETE_CUSTOM_EVENT,
            payload,
            loading: false,
            fail: (err) => {},
        }),
    );
};

export const checkCustomEventNameExist = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: CHECK_CUSTOM_EVENT_NAME_EXIST,
            payload,
            loading: true,
            fail: (err) => {},
        }),
    );
};

// VMS
export const getVMSData = (payload, setGridLoading = () => {}) => async (dispatch) => {
    setGridLoading(true)
    dispatch(
        request.post({
            url: GET_VMS_DATA,
            payload,
            loading: false,
            ok: ({ data: { data, status , isCreated } }) => {
                if(isCreated != undefined){
                    dispatch(updateCommunicationSettings({ field: 'isCreated', payload: false }));
                }
                if (status) dispatch(updateCommunicationSettings({ field: 'vmsData', payload: data }));
            },
            fail: (err) => {},
            final: () =>{setGridLoading(false)}
        }),
    );
};

export const saveVMSData = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SAVE_VMS_DATA,
            payload,
            loading,
            fail: (err) => {
                            },
        }),
    );
};

export const getVMSDataById = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_VMS_DATA_BYID,
            payload,
            loading: false,
            fail: (err) => {
                            },
        }),
    );
};

export const deleteVMSDataById = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: DELETE_VMS_DATA_BYID,
            payload,
            loading: true,
            fail: (err) => {
                            },
        }),
    );
};

// Line
export const getLineData = (payload, setGridLoading = () => {}) => async (dispatch) => {
    setGridLoading(true);
    dispatch(
        request.post({
            url: GET_LINE_DATA,
            payload,
            loading: false,
            ok: ({ data: { data, status } }) => {
                if (status) dispatch(updateCommunicationSettings({ field: 'lineData', payload: data }));
            },
            fail: (err) => {},
            final: () => {
                setGridLoading(false);
            },
        }),
    );
};
export const saveLineData = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SAVE_LINE_DATA,
            payload,
            loading,
            fail: (err) => {
                            },
        }),
    );
};

export const getLineDataById = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_LINE_CAMPAIGN_BY_ID,
            payload,
            loading: false,
            fail: (err) => {
                            },
        }),
    );
};
// Email - footer
export const getEmailFooterData = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_EMAIL_FOOTER,
            payload,
            loading: false,
            fail: (err) => {
                            },
        }),
    );
};

export const saveEmailFooterData = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SAVE_EMAIL_FOOTER,
            payload,
            loading,
            isFailureCheck: true,
              ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
            },
            fail: (err) => {
                            },
        }),
    );
};

export const getEmailFooterById = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_EMAIL_FOOTER_BY_ID,
            payload,
            loading: false,
            isFailureCheck: true,
              ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
                
            },
            fail: (err) => {
                            },
        }),
    );
};

export const deleteEmailFooterById = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: DELETE_EMAIL_FOOTER_BY_ID,
            payload,
            loading: false,
            isFailureCheck: true,
              ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
            },
            fail: (err) => {
                            },
        }),
    );
};

export const getEmailFooterNameExist =
    ({ payload, setError, name }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_EMAIL_FOOTER_NAME_EXIST,
                payload,
                isToast: false,
                // loading: true,
                ok: ({ data }) => {
                    if (data.status) {
                        setError(name, {
                            type: 'server',
                            message: data.message,
                        });
                    }
                },
                fail: (err) => {},
            }),
        );
    };

// Lifetime cap
export const getLifetimeCapActionsData = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_LIFETIME_CAP_ACTIONS,
            payload,
            loading: false,
            fail: (err) => {
                            },
        }),
    );
};

export const getLifetimeCapData = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_LIFETIME_CAP,
            payload,
            loading: false,
            fail: (err) => {
                            },
        }),
    );
};

export const saveLifetimeCap = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SAVE_LIFETIME_CAP,
            payload,
            loading,
            fail: (err) => {
                            },
        }),
    );
};

// Quiet Hours
export const getQuietHoursSettings = (payload, { loading = true } = {}) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_QUIET_HOURS_SETTINGS,
            payload,
            loading: false,
            isFailureCheck: false,
            fail: () => {},
        }),
    );
};

export const getQuietHoursSettingsById = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_QUIET_HOURS_SETTINGS_BY_ID,
            payload,
            loading: false,
            isFailureCheck: false,
            suppressErrorToast: true,
            fail: () => {},
        }),
    );
};

export const checkQuietHoursNameExists = ({ payload }) => async (dispatch) => {
    const payloadData = payload?.payload || payload;
    const channelId = Number(payloadData?.channelId ?? payloadData?.ChannelID);
    const departmentId = Number(payloadData?.departmentId ?? payloadData?.DepartmentID);

    if (!Number.isFinite(channelId) || channelId <= 0 || !Number.isFinite(departmentId) || departmentId <= 0) {
        return { status: false, message: 'Unable to verify rule name.' };
    }

    const res = await dispatch(
        request.post({
            url: CHECK_QUIET_HOURS_NAME_EXISTS,
            payload: {
                ruleName: (payloadData?.ruleName ?? payloadData?.RuleName ?? '').trim(),
                channelId,
                departmentId,
                clientId: payloadData?.clientId,
                userId: payloadData?.userId,
                ...(payloadData?.ruleId != null || payloadData?.RuleID != null
                    ? { ruleId: Number(payloadData?.ruleId ?? payloadData?.RuleID) }
                    : {}),
            },
            loading: false,
            isToast: false,
        }),
    );

    if (res == null || res === false) {
        return { status: false, message: 'Unable to verify rule name.' };
    }

    const body = res?.data != null && typeof res.data === 'object' ? res.data : res;
    if (body && typeof body === 'object') {
        const rawStatus = body.status ?? body.Status;
        return {
            status:
                rawStatus === true ||
                rawStatus === 1 ||
                rawStatus === '1' ||
                String(rawStatus).toLowerCase() === 'true',
            message: body.message ?? body.Message ?? '',
        };
    }

    return { status: false, message: 'Unable to verify rule name.' };
};

export const upsertQuietHoursSettings = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: UPSERT_QUIET_HOURS_SETTINGS,
            payload,
            loading,
            fail: () => {},
        }),
    );
};

export const updateQuietHoursStatus = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: UPDATE_QUIET_HOURS_STATUS,
            payload,
            loading: true,
            fail: () => {},
        }),
    );
};

export const deleteQuietHoursSettings = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: DELETE_QUIET_HOURS_SETTINGS,
            payload,
            loading: true,
            fail: () => {},
        }),
    );
};

export const duplicateQuietHoursSettings = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: DUPLICATE_QUIET_HOURS_SETTINGS,
            payload,
            loading,
            fail: () => {},
        }),
    );
};

export const getQuietHoursLookups = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_QUIET_HOURS_LOOKUPS,
            payload,
            loading: false,
            isFailureCheck: false,
            suppressErrorToast: true,
            fail: () => {},
        }),
    );
};

//Web push
export const webPush_goalNameExists = ({ payload }) => {
    return async (dispatch) => {
        return dispatch(
            request.post({
                url: CHECK_WEBPUSH_GOALNAME,
                payload,
                ok: ({ data }) => {},
            }),
        );
    };
};

export const GetWebPush = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_WEBPUSH_DATA,
            payload,
            loading,
            fail: (err) => {
                            },
        }),
    );
};
export const GetWebPushbyID = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_WEBPUSH_EDIT_DATA,
            payload,
            loading: false,
            isFailureCheck: true,
              ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
            },
            // ok: (res) => {
            //     const {
            //         data: { data, status },
            //     } = res;
            //     if (status) {
            //         dispatch(updateCommunicationSettings({ field: 'Get_WebPushbyID', data: data }));
            //     }
            // },

            fail: (err) => {
                            },
        }),
    );
};
export const UpsertWebPushSettings = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SAVE_WEBPUSH_DATA,
            payload,
            loading,
            isFailureCheck: true,
              ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
            },
            fail: (err) => {
                            },
        }),
    );
};

export const SaveWebPushConfig = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SAVE_WEBPUSH_CONFIG,
            payload,
            loading,
            isFailureCheck: true,
            ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
            },
            fail: (err) => {
                            },
        }),
    );
};

export const GetWebPushConfig = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_WEBPUSH_CONFIG,
            payload,
            loading: true,
            isFailureCheck: true,
            ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
            },
            fail: (err) => {
                            },
        }),
    );
};
export const DeleteWebPush = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: DELETE_WEBPUSH_DATA,
            payload,
            loading: true,
            isFailureCheck: true,
              ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
            },
            fail: (err) => {
                            },
        }),
    );
};

export const updateWebPushDefault = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: UPDATE_WEBPUSH_DEFAULT,
            payload,
            loading,
            isFailureCheck: true,
            ok: ({ data }) => data,
            fail: (err) => {
                            },
        }),
    );
};
export const getWebPushAnalyticsList = (payload) => async (dispatch) =>
    dispatch(
        request.post({
            url: GET_WEBPUSH_ANLAYTICS_DATA,
            payload,
            loading: false,
            ok: ({ data }) => {
                const { status, data: res } = data;
                if (status)
                    dispatch(updateCommunicationSettings({ field: 'getWebPushAnalyticsListData', payload: res }));
                else{
                    dispatch(updateCommunicationSettings({ field: 'getWebPushAnalyticsListData', payload: [] }));
                }
            },
            fail: (err) => {
                            },
        }),
    );

export const getConfigDetails = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_CONFIG_DETAILS,
            payload,
            loading: false,
            isFailureCheck: true,
            ok: ({ data }) => {
                return data;
            },
            fail: (err) => {
                                return { status: false, message: err?.message || 'Failed to get config details' };
            },
        }),
    );
};
export const getWebPushDomainNameExist =
    ({ payload, setError, name, clearErrors }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_WEBPUSH_DOMAIN_EXIST,
                payload,
                isToast: false,
                ok: ({ data }) => {
                    // if (data.status) {
                    //     setError(name, {
                    //         type: 'server',
                    //         message: data.message,
                    //     });
                    // } else {
                    //     clearErrors(domainName);
                    // }
                },
                fail: (err) => {},
            }),
        );
    };
export const getWebPushDomainURLExist =
    ({ payload, setError, name, clearErrors }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_WEBPUSH_URL_EXIST,
                payload,
                isToast: false,
                ok: ({ data }) => {
                    if (data.status) {
                        setError(name, {
                            type: 'server',
                            message: data.message,
                        });
                    } else {
                        clearErrors(name);
                    }
                },
                fail: (err) => {},
            }),
        );
    };
//Permission
export const getWebPushSettingData = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_WEBPUSH_SETTINGS_DATA,
            payload,
            loading: false,
            fail: (err) => {
                            },
        }),
    );
};
export const UpsertWebPushPermission = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SAVE_WEBPUSH_SETTINGS_DATA,
            payload,
            loading,
            isFailureCheck: true,
              ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
            },
            fail: (err) => {
                            },
        }),
    );
};
//Goal settings
export const getWebPushGoalData = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_WEBPUSH_GOAL_DATA,
            payload,
            loading: false,
            fail: (err) => {
                            },
        }),
    );
};
export const getWebPushEventData = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_WEBPUSH_GOALEVENTS_DATA,
            payload,
            loading: false,
            fail: (err) => {
                            },
        }),
    );
};
export const getWebPushGoalEventDataById = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_WEBPUSH_GOALEVENTS_DATABYID,
            payload,
            loading: false,
            isFailureCheck: true,
              ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
            },
            fail: (err) => {
                            },
        }),
    );
};
export const saveWebPushGoalData = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SAVE_WEBPUSH_GOALEVENTS_DATA,
            payload,
            loading,
            isFailureCheck: true,
              ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
            },
            fail: (err) => {
                            },
        }),
    );
};
export const saveWebPushTenantData = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_WEBPUSH_TENANT_DATA,
            payload,
            loading: false,
             ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
                if (!status) {
                    dispatch(
                        update_failures_API_Errors({
                            field: GET_WEBPUSH_TENANT_DATA,
                            message: message,
                        }),
                    );
                }
            },
            fail: (err) => {
                            },
        }),
    );
};

export const downloadWebPushIntegrationDocument = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_WEBPUSH_TENANT_DATA, // TODO: Replace with actual download endpoint when available
            payload,
            loading: false,
            ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
                if (!status) {
                    dispatch(
                        update_failures_API_Errors({
                            field: GET_WEBPUSH_TENANT_DATA,
                            message: message,
                        }),
                    );
                }
            },
            fail: (err) => {
                            },
        }),
    );
};

//Mobile push
export const GetMobilePush = (payload, options = {}) => async (dispatch) => {
    const { loading = false } = options;
    return dispatch(
        request.post({
            url: GET_MOBILEPUSH_DATA,
            payload,
            loading,

            fail: (err) => {
                            },
        }),
    );
};

export const getDomainMobilePushExist =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_MOBILEPUSH_DOMAIN_EXISIT,
                payload,
                //loading: true,
                ok: ({ data }) => {
                                    },
                fail: (err) => {
                                    },
            }),
        );
    };

export const getDeviceMobilePush = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_MOBILEPUSH_DEVICELIST,
            payload,
            loading: false,
            isFailureCheck: true,
            ok: ({ data }) => {
                const { status, data: res } = data;
                const result = status ? res : []
                dispatch(updateCommunicationSettings({ field: 'appDeviceList', payload: result }));
            },
            fail: (err) => {
                            },
        }),
    );
};
export const getAnalysisMobilePush = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_MOBILEPUSH_ANALYSIS_DATA,
            payload,
            loading: false,
            isFailureCheck: true,
            ok: ({ data }) => {
                const { status, data: res } = data;
                const result = status ? res : []
                dispatch(updateCommunicationSettings({ field: 'analyticsListMobile', payload: result }));
            },
            fail: (err) => {
                            },
        }),
    );
};
export const getLanguageMobilePush = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_MOBILEPUSH_LANGUAGE_DATA,
            payload,
            loading: false,
            isFailureCheck: true,
            ok: ({ data }) => {
                const { status, data: res } = data;
                const result = status ? res : []
                dispatch(updateCommunicationSettings({ field: 'appLanguageList', payload: result }));
            },
            fail: (err) => {
                            },
        }),
    );
};

//Web/Mobile

export const GetWebMobileList = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_WEBMOBILE_MOBILE_LIST,
            payload,
            loading: true,

            fail: (err) => {
                            },
        }),
    );
};
export const GetWebDomainList = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_WEBMOBILE_DOMAIN_LIST,
            payload,
            loading: true,

            fail: (err) => {
                            },
        }),
    );
};
export const GetDomainAppList = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_DOMAIN_APP_LIST,
            payload,
            loading: false,
            fail: (err) => {
                            },
        }),
    );
};
export const saveWebAppList = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SAVE_WEBMOBILE_LIST,
            payload,
            loading: false,
            isFailureCheck: true,
            ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
            },
            fail: (err) => {
                            },
        }),
    );
};
export const deleteWebMobileAppList = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: DELETE_WEBMOBILE_LIST,
            payload,
            loading: false,
            isFailureCheck: true,
               ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
            },
            fail: (err) => {
                            },
        }),
    );
};

export const getDomainAppSettingsList = (payload, loading = true) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_DOMAIN_APP_SETTING,
            payload,
            loading,
               ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
            },
            fail: (err) => {
                            },
        }),
    );
};
export const upsertDomainAppSettings = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: UPSERT_DOMAIN_APP_SETTING,
            payload,
            loading,
               ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
            },
            fail: (err) => {
                            },
        }),
    );
};
export const deleteDomainAppSettings = (payload, loading = true) => async (dispatch) => {
    return dispatch(
        request.post({
            url: DELETE_DOMAIN_APP_SETTING,
            payload,
            loading,
               ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
            },
            fail: (err) => {
                            },
        }),
    );
};
export const deleteMobileAppList = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: REMOVE_MOBILEPUSH_DATA,
            payload,
            loading: true,
            isFailureCheck: true,
             ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
            },
            fail: (err) => {
                            },
        }),
    );
};

// Mobile push -User device summary

export const mobilePush_UserDeviceMaster = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_MOBILEPUSH_SETTINGS_USERINFO_DATA,
            payload,
            loading: false,

            fail: (err) => {
                            },
        }),
    );
};
export const mobilePush_GetUserDeviceSetup = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_MOBILEPUSH_SETTINGS_DEVICELIST_DATA,
            payload,
            // loading: true,

            fail: (err) => {
                            },
        }),
    );
};
export const mobilePush_GetUserDeviceSetupById = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_MOBILEPUSH_SETTINGS_BYID_DATA,
            payload,
            loading: false,
            isFailureCheck: true,
            fail: (err) => {
                            },
        }),
    );
};
export const mobilePush_UpsertUserDeviceSetup = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SAVE_MOBILEPUSH_SETTINGS_DEVICESETUP_DATA,
            payload,
            loading,
            isFailureCheck: true,
             ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
            },
            fail: (err) => {
                            },
        }),
    );
};
export const mobilePush_DeleteUserDevice = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: REMOVE_MOBILEPUSH_SETTINGS_DEVICESETUP_DATA,
            payload,
            loading: true,
              ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
                if (!status) {
                    dispatch(
                        update_failures_API_Errors({
                            field: REMOVE_MOBILEPUSH_SETTINGS_DEVICESETUP_DATA,
                            message: message,
                        }),
                    );
                }
            },
            fail: (err) => {
                            },
        }),
    );
};
export const mobilePush_EncodeUserDevice = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: ENCODE_MOBILEPUSH_SETTINGS_DEVICESETUP_DATA,
            payload,
            loading: true,
            isFailureCheck: true,
             ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
            },
            fail: (err) => {
                            },
        }),
    );
};
export const get_mobilePush_GoalData = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_MOBILEPUSH_GOALSETTINGS_DATA,
            payload,
            loading: false,

            fail: (err) => {
                            },
        }),
    );
};
export const save_mobilePush_GoalData = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SAVE_MOBILEPUSH_GOALSETTINGS_DATA,
            payload,
            loading,
            isFailureCheck: true,
            ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
            },
            fail: (err) => {
                            },
        }),
    );
};
export const get_mobilePush_GoalDataByID = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_MOBILEPUSH_GOALSETTINGS_BYID_DATA,
            payload,
            loading: false,
            isFailureCheck: true,
             ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
            },
            fail: (err) => {
                            },
        }),
    );
};
export const change_mobilePush_GoalDataByStatus = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: STATUS_MOBILEPUSH_GOALSETTINGS_DATA,
            payload,
            loading: true,
            isFailureCheck: true,
             ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
            },
            fail: (err) => {
                            },
        }),
    );
};
export const change_webPush_GoalDataByStatus = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: STATUS_WEBPUSH_GOALSETTINGS_DATA,
            payload,
            loading: true,
            isFailureCheck: true,
             ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
            },
            fail: (err) => {
                            },
        }),
    );
};
export const get_mobilePush_GoalDataByMaster = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_MOBILEPUSH_GOALSETTINGS_MASTERDATA,
            payload,
            loading: false,

            fail: (err) => {
                            },
        }),
    );
};

//Permission
export const getMobilePushSettingData = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_MOBILEPUSH_SETTINGS_DATA,
            payload,
            loading: false,
            fail: (err) => {
                            },
        }),
    );
};
export const UpsertMobilePushPermission = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SAVE_MOBILEPUSH_SETTINGS_DATA,
            payload,
            loading,
            isFailureCheck: true,
              ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
            },
            fail: (err) => {
                            },
        }),
    );
};
export const UpsertMobilePushData = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SAVE_MOBILEPUSH_DATA,
            payload,
            loading,
            isFailureCheck: true,
              ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
            },
            fail: (err) => {
                            },
        }),
    );
};
export const GetMobilePushDataById = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_MOBILEPUSH_BY_ID,
            payload,
            loading: false,
            isFailureCheck: true,
             ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
            },
            fail: (err) => {
                            },
        }),
    );
};

export const updateMobilePushDefault = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: UPDATE_MOBILEPUSH_DEFAULT,
            payload,
            loading: true,
            isFailureCheck: true,
            ok: ({ data }) => data,
            fail: (err) => {
                            },
        }),
    );
};

export const uploadPreferenceImage = ({ payload }) => {
    return async (dispatch) => {
        return dispatch(
            request.post({
                url: UPLOAD_PREFERENCE_IMAGE,
                payload,
                loading: true,
                ok: ({ data }) => {},
            }),
        );
    };
};
export const mobilePush_goalNameExists = ({ payload }) => {
    return async (dispatch) => {
        return dispatch(
            request.post({
                url: CHECK_MOBILEPUSH_GOALNAME,
                payload,
                // loading: true,
                ok: ({ data }) => {},
            }),
        );
    };
};
export const remove_AppStore = ({ payload }) => {
    return async (dispatch) => {
        return dispatch(
            request.post({
                url: REMOVE_APPSTORE,
                payload,
                loading: true,
                isFailureCheck: true,
                  ok: ({ data }) => {
                const { status, message = 'No data available' } = data;
            },
                ok: ({ data }) => {},
            }),
        );
    };
};



export const checkAppStoreUrl = ({payload}) => async (dispatch) => {
    return dispatch(
        request.post({
            url: CHECK_PLAYSTORE_URL,
            payload,
            ok: ({ data }) => {},
            fail: (err) => {
                            },
        }),
    );
};

export const getScreenNameList = ({payload}) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_SCREEN_NAME_LIST,
            payload,
            loading: false,
            ok: ({ data }) => {},
            fail: (err) => {
                            },
        }),
    );
};

export const getSubScreenNameList = ({payload}) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_SUB_SCREEN_NAME_LIST,
            payload,
            loading: false,
            ok: ({ data }) => {},
            fail: (err) => {
                            },
        }),
    );
};
export const GetDigiPop_grid = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GETCREATIVE_DIGIPOP,
            payload,
            loading: true,
           

            fail: (err) => {
                            },
        }),
    );
};
export const GetDigiPop_CreaiveNames = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_CREATIVE_DIGIPOP_NAMES,
            payload,
            loading: true,
           

            fail: (err) => {
                            },
        }),
    );
};
export const SaveDigiPop_Creative = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SAVE_CREATIVE_DIGIPOP,
            payload,
            loading,
            isFailureCheck: true,
            fail: (err) => {
                            },
        }),
    );
};
export const UpdateDigiPop_Creative = (payload, loading = false) => async (dispatch) => {
    return dispatch(
        request.post({
            url: UPDATE_CREATIVE_DIGIPOP,
            payload,
            loading,
            isFailureCheck: true,
            fail: (err) => {
                            },
        }),
    );
};

export const getDigiPopCreative_NameExisit =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: ISNAME_CREATIVE_DIGIPOP,
                payload,
                loading: true,
                fail: (err) => {
                                    },
            }),
        );
    };

export const dkimValidation = (payload) => async (dispatch) =>
    dispatch(
        request.post({
            url: DKIM_VALIDATION,
            payload,
            loading: false,
            ok: () => {},
            fail: (err) => {
                            },
        }),
    );

export const getDkimValues = (payload) => async (dispatch) =>
    dispatch(
        request.post({
            url: COMM_GET_DKIM_VALUES,
            payload,
            loading: false,
            fail: (err) => {
                            },
        }),
    );

export const sendDkimDetailsMail = (payload) => async (dispatch) =>
    dispatch(
        request.post({
            url: COMM_SEND_DKIM_DETAILS_MAIL,
            payload,
            loading: false,
            isFailureCheck: true,
            fail: (err) => {
                            },
        }),
    );

export const sendDomainDetailsMail = (payload) => async (dispatch) =>
    dispatch(
        request.post({
            url: COMM_SEND_DOMAIN_DETAILS_MAIL,
            payload,
            loading: true,
            isFailureCheck: true,
            fail: (err) => {
                            },
        }),
    );

export const checkDomainExist = (payload,loading=false) => async (dispatch) =>
    dispatch(
        request.post({
            url: COMM_CHECK_DOMAIN_EXIST,
            payload,
            loading: loading ?? false,
            fail: (err) => {
                            },
        }),
    );

export const restoreDomainName = (payload) => async (dispatch) =>
    dispatch(
        request.post({
            url: COMM_RESTORE_DOMAIN_NAME,
            payload,
            loading: false,
            // Missing `status` is falsy in HTTP layer; false positive failure blocks edit prefill.
            isFailureCheck: false,
            fail: (err) => {
                            },
        }),
    );

// Download Integration Files for Web/Mobile Push test
export const downloadIntegrationFiles = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: DOWNLOAD_INTEGRATION_FILES,
            payload,
            loading: false,
            config: { responseType: 'blob' },
            ok: (response) => {
                const { data, headers } = response || {};
                const contentType = headers?.['content-type'] || headers?.get?.('content-type');
                const disposition = headers?.['content-disposition'] || headers?.get?.('content-disposition');

                let tempfileName = `${payload?.name || 'integration-files'}_${
                    payload?.domainName?.length > 0 ? 'Web' : 'Mobile'
                }_Integration-files`;

                const match = disposition ? /filename\s*=\s*"?([^";]+)"?/i.exec(disposition) : null;
                const fileName = tempfileName; //(match && match[1]) || 'integration-files.zip';

                if (
                    data instanceof Blob ||
                    (contentType && (contentType.includes('application/') || contentType.includes('octet-stream')))
                ) {
                    const blob =
                        data instanceof Blob
                            ? data
                            : new Blob([data], { type: contentType || 'application/octet-stream' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    return;
                }

                const asJson = typeof data === 'object' ? data : null;
                if (asJson?.data?.downloadUrl) {
                    const a = document.createElement('a');
                    a.href = asJson?.data?.downloadUrl;
                    a.download = asJson?.data?.fileName || fileName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    return;
                }

                dispatch(
                    update_failures_API_Errors({
                        field: DOWNLOAD_INTEGRATION_FILES,
                        message: 'No data available',
                    }),
                );
            },
            fail: (err) => {
                            },
        }),
    );
};


export const uploadFileEDMInEmailSubUnsub = ({payload}) => async (dispatch) =>
    dispatch(
        request.post({
                url: SUB_UNSUB_UPLOAD_EDM_FILE,
            payload,
            loading: true,
            ok: () => {},
            fail: (err) => {
                            },
        }),
    );
export const uploadURLEDMInEmailSubUnsub = ({payload}) => async (dispatch) =>
    dispatch(
        request.post({
            url: SUB_UNSUB_IMPORT_EDM_URL,
            payload,
            loading: true,
            ok: () => {},
            fail: (err) => {
                            },
        }),
    );
