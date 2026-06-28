import { APP_ANALYTICS_CONTENT, APP_ANALYTICS_SAVE_MOBILE_CAPTURE_FIELDS, CHECK_EMAIL_SPAM, CLIENT_SENDER_ID_EMAIL, GET_ALL_VIDEOANALYTICS_CONTENT, GET_ANALYTICS_CAPTURE_FIELDS, GET_ATTRIBUTE_VALUES, GET_AUDIO_LIST_BY_APP, GET_CALL_CENTER_BY_ID, GET_CAMPAIGN_BLAST_DETAILS, GET_CDM_TRANSFERMRTHOD, GET_COMMUNICATION_IMPORTCAMPAIGN, GET_CONTACT_BY_USERID, GET_CONVERSION_MATCHING_KEY, GET_CROSS_BU_STATUS, GET_DIGIPOP_AUDIENCE, GET_DIGIPOP_COMMUNICATION, GET_DIGIPOP_IMPRESSIONBALANCE, GET_DIRECTMAIL, GET_DOMIAN_LIST, GET_EMAIL_COMMUNICATION, GET_EMAIL_FOOTER_LIST, GET_FACEBOOK_CITIES_BASED_COUNTRY, GET_FACEBOOK_COUNTRIES, GET_HSM_TEMPLATE, GET_HSM_TEMPLATE_NEW, GET_INBOX_CLASSIFICATIONS, GET_MOBILE_PUSH_BY_ID, GET_OFFLINECONVERSION_ATTRIBUTES, GET_OFFLINECONVERSION_DETAILS, GET_OFFLINECONVERSION_VALUES, GET_OFFLINE_CONVERSION_BU, GET_PAID_MEDIA_LIST, GET_PAID_MEDIA_POST, GET_PAID_MEDIA_SAVE_LIST, GET_PERSONALIZATION_FIELDS, GET_PUSH_NOTIFY_DOMAIN, GET_QR_CODE_CAMAPIGN, GET_QR_CODE_DOWNLOAD, GET_RCS_CAMPAIGN_BYID, GET_RCS_CONTENT_TEMPLATEID, GET_RCS_SENDERNAME, GET_RCS_TEMPLATE, GET_RECIPIENT_COMMUNICATION, GET_RECIPIENT_FORMS_CAMPAIGN, GET_RECIPIENT_FORMS_ID, GET_SCREEN_LIST, GET_SENDER_NAME, GET_SENDLIVETEST, GET_SMS_CAMPAIGN_BY_ID, GET_SMS_LANGUAGE, GET_SMS_SETTINGS, GET_SMS_SETTINGS_DETAIL, GET_SMTP_SETTINGS, GET_SOCIAL_MEDIA_APP_KEYS, GET_SOCIAL_MEDIA_SETUP, GET_SOCIAL_POST_BY_LEVEL, GET_SUB_SCREEN_LIST, GET_SYNC_BANNER_DETAILS, GET_TEMPLATE_LANGUAGE, GET_UNSUBSCRIPTION, GET_UPLOADSIZE, GET_VENDOR_FROM_REMOTESETTING, GET_VMS_CAMPAIGN_BY_ID, GET_VMS_LANGUAGE, GET_VMS_SENDER_NAME, GET_VMS_TEMPLATE_LIST, GET_WEBANALYTICS, GET_WEB_NOTIFY_DOMAINS, GET_WEB_PUSH_BY_ID, GET_WHATSAPP_CAMPAIGN_BY_ID, GET_WHATSAPP_CAMPAIGN_BY_ID_NEW, IMG_UPLOAD_SOCIAL_POST, MANAGE_SOCIAL_POST, SAVE_AND_UPDATE_PAID_MEDIA, SAVE_CALL_CENTER, SAVE_DIGIPOP_COMMUNICATION, SAVE_DIRECTMAIL, SAVE_EMAIL_COMMUNICATION, SAVE_EMAIL_TEMPLATE_CONTENT, SAVE_MOBILE_ANALYTICS, SAVE_MOBILE_PUSH, SAVE_OFFLINECONVERSION, SAVE_RCS_CAMPAIGN, SAVE_SMS_CAMPAIGN, SAVE_VIDEO_CAMPAIGN, SAVE_VMS, SAVE_WEB_PUSH, SAVE_WHATSAPP_CAMPAIGN, SAVE_WHATSAPP_CAMPAIGN_NEW, SENTIMENT_GET, SENTIMENT_NAME_EXIST, SENTIMENT_SAVE, SUBJECT_ANALYSIS, SUBJECT_ANALYSIS_ENABLE, UPDATE_DIGIPOP_COMMUNICATION, UPDATE_QR_CODE, UPDATE_SENDER_DETAILS, UPLOAD_AUDIO_FILE, UPLOAD_COMMUNICATIONFILE, UPLOAD_COMMUNICATIONFILE_WEB, UPLOAD_IMAGE, UPLOAD_IMG_QR, UPLOAD_MOBILE_PUSH, UPLOAD_RICHIMAGEFILE, UPLOAD_VIDEO_DOCUMENT, UPLOAD_WEB_PUSH, VIDEO_ANALYTICS_DOMAIN_LIST, VIDEO_UPLOAD_SOCIAL_POST, VIDEO_VALIDATION, WEBANALYTICS_DOMAIN_LIST, WEBANALYTICS_LIST, WEBANALYTICS_SAVE, WEBANALYTICS_SAVE_CAPTURE_FIELDS, WEBANALYTICS_SUBSCRPTION_FORMLIST } from 'Constants/EndPoints';
import request from 'Utils/Http';
import _map from 'lodash/map';
import _uniqBy from 'lodash/uniqBy';

import { updateAudience, updateEmailList, updateSmsList, updatePersonaLization, updateVoiceList, updateDirectMailList, updateVmsList, updateSocialMediaSetUp, updateQr, updateWebAnalytics, updateORMAnalytics, updateVideoAnalytics, updateNotificationWeb, updateNotificationMobile, updateOfflineConversion, updateOfflineConversionAttributes, updateSpamScore, updateFilterAudience, updateRCSList, updateListTypeWisePersonaLization, updateWATemplateList } from './reducer';

import { mapAudienceWithChannelLabels } from 'Utils/modules/formatters';
import { ensureArray, ensureObject } from 'Pages/AuthenticationModule/Audience/audienceDefaults';
import { normalizeChannelCampaignData } from 'Pages/AuthenticationModule/Communication/CreateCommunication/communicationDefaults';
import { update_campaign_details } from '../execute/reducer';
import { updateSaveChannelsId, setCampaignBlastDetails } from '../plan/reducer';
import { update_failures_API_Errors } from 'Reducers/globalState/reducer';

/** Use `loading: false` (or `isEnableLoader: false`) while authoring edit skeleton is shown. */
const resolveRequestGlobalLoading = (loading = true, isEnableLoader) =>
    isEnableLoader ?? loading;

const toSafeArray = (value, status) => (status ? ensureArray(value) : []);

const toSafeObject = (value, status) => (status ? ensureObject(value) : {});

const runSafeOkHandler = (handler, fallbackDispatch) => {
    try {
        handler();
    } catch {
        fallbackDispatch?.();
    }
};

export const getAudienceList =
    ({ payload, isFilter = false, audienceList = [], loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_RECIPIENT_COMMUNICATION,
                payload,
                loading: loading,
                ok: ({ data }) => {
                    runSafeOkHandler(() => {
                        let { status, data: res, message } = data || {};
                        if (status) {
                            const list = _map(toSafeArray(res, true), mapAudienceWithChannelLabels);
                            if (!isFilter) {
                                const finalList = list.filter(
                                    (item) =>
                                        !ensureArray(audienceList).some(
                                            (listItem) => listItem?.segmentationListId === item?.segmentationListId,
                                        ),
                                );
                                const uniqueList = _uniqBy(finalList, 'segmentationListId');
                                dispatch(updateAudience(uniqueList));
                            } else {
                                const finalList = list.filter(
                                    (item) =>
                                        !ensureArray(audienceList).some(
                                            (listItem) => listItem?.segmentationListId === item?.segmentationListId,
                                        ),
                                );
                                payload?.searchText || ensureArray(payload?.segmentIds)?.length
                                    ? dispatch(updateFilterAudience(finalList))
                                    : dispatch(updateFilterAudience([]));
                            }
                        } else if (!isFilter) {
                            dispatch(updateAudience([]));
                        } else {
                            dispatch(
                                update_failures_API_Errors({
                                    field: GET_RECIPIENT_COMMUNICATION,
                                    message: message ?? 'No data available',
                                }),
                            );
                        }
                    }, () => {
                        if (!isFilter) {
                            dispatch(updateAudience([]));
                        } else {
                            dispatch(updateFilterAudience([]));
                        }
                    });
                },
            }),
        );

export const getCampaignBlastDetails =
    ({ payload, loading = false }) =>
    async (dispatch) => {
        const response = await dispatch(
            request.post({
                url: GET_CAMPAIGN_BLAST_DETAILS,
                payload: {
                    clientId: payload?.clientId,
                    departmentId: payload?.departmentId,
                    userId: payload?.userId,
                    campaignId: payload?.campaignId,
                },
                loading,
                ok: ({ data }) => {
                    if (!data?.status) {
                        dispatch(setCampaignBlastDetails(null));
                        return;
                    }
                    const raw = data?.data;
                    if (Array.isArray(raw)) {
                        dispatch(setCampaignBlastDetails(raw.length ? raw : null));
                    } else if (raw && typeof raw === 'object') {
                        dispatch(setCampaignBlastDetails([raw]));
                    } else {
                        dispatch(setCampaignBlastDetails(null));
                    }
                },
            }),
        );
        return response;
    };

export const getSmsSettings =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_SMS_SETTINGS,
                payload,
                loading: true,
                ok: ({ data }) => {
                    try {
                        let { data: res, status } = data || {};
                        res = status && Array.isArray(res) ? res : [];
                        dispatch(updateSmsList({ data: res, field: 'smsSettings' }));
                    } catch {
                        dispatch(updateSmsList({ data: [], field: 'smsSettings' }));
                    }
                },
            }),
        );

export const getSmsSettingsDetail =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_SMS_SETTINGS_DETAIL,
                payload,
                loading,
                ok: ({ data }) => {
                    try {
                        let { data: res, status } = data || {};
                        res = toSafeArray(res, status);
                        const modifiedRes = res.map((item) => ({
                            ...ensureObject(item),
                            subLabel: item?.friendlyName || '',
                        }));
                        dispatch(updateSmsList({ data: modifiedRes, field: 'smsSettings' }));
                    } catch {
                        dispatch(updateSmsList({ data: [], field: 'smsSettings' }));
                    }
                }
            }),
        );

export const getEmailSenderIdEmail =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: CLIENT_SENDER_ID_EMAIL,
                payload,
                loading: true,
                ok: ({ data }) => {
                    let { data: res, status } = data;
                    res = toSafeArray(res, status);
                    dispatch(updateEmailList({ data: res, field: 'senderid_email' }));
                },
            }),
        );

let lastSubjectLineAnalysisSignature = null;

const buildSubjectLineAnalysisSignature = (payload = {}) =>
    JSON.stringify({
        campaignType: payload?.campaignType ?? '',
        productType: payload?.productType ?? '',
        subjectLine: payload?.subjectLine ?? '',
    });

export const resetSubjectLineAnalysisCache = () => {
    lastSubjectLineAnalysisSignature = null;
};

export const getSubjectLineAnalysis =
    ({ payload, loading = true, forceRefetch = false }) =>
    async (dispatch) => {
        const signature = buildSubjectLineAnalysisSignature(payload);

        if (!forceRefetch && lastSubjectLineAnalysisSignature === signature) {
            return;
        }

        lastSubjectLineAnalysisSignature = signature;

        return dispatch(
            request.post({
                url: SUBJECT_ANALYSIS,
                payload,
                loading,
                ok: ({ data }) => {
                    let { data: res, status } = data;
                    res = toSafeArray(res, status);
                    dispatch(updateEmailList({ data: res, field: 'subjectLine_Analysis' }));
                },
                fail: () => {
                    lastSubjectLineAnalysisSignature = null;
                },
            }),
        );
    };
export const getSubjectLineAnalysisEnable =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: SUBJECT_ANALYSIS_ENABLE,
                payload,
                // loading: true,
                ok: ({ data }) => {},
            }),
        );
const lastCheckSpamSignatureByKey = {};

const buildCheckSpamSignature = (payload = {}) =>
    JSON.stringify({
        campaignId: payload?.campaignId ?? '',
        body: payload?.body ?? '',
        body1: payload?.body1 ?? '',
        emailFooterRawcode: payload?.emailFooterRawcode ?? '',
        preHeaderMessage: payload?.preHeaderMessage ?? '',
        subjectLine: payload?.subjectLine ?? '',
    });

export const resetCheckSpamCache = (key) => {
    if (key) {
        delete lastCheckSpamSignatureByKey[key];
    } else {
        Object.keys(lastCheckSpamSignatureByKey).forEach((k) => delete lastCheckSpamSignatureByKey[k]);
    }
};

export const getCheckSpam =
    ({ payload, loading = true, forceRefetch = false }) =>
    async (dispatch) => {
        const cacheKey = `${payload?.spamScore ?? 'default'}::${payload?.top3 ?? 'default'}`;
        const signature = buildCheckSpamSignature(payload);

        if (!forceRefetch && lastCheckSpamSignatureByKey[cacheKey] === signature) {
            return;
        }

        lastCheckSpamSignatureByKey[cacheKey] = signature;

        return dispatch(
            request.post({
                url: CHECK_EMAIL_SPAM,
                payload,
                loading,
                ok: ({ data }) => {
                    runSafeOkHandler(() => {
                        let { data: res, status } = data || {};
                        const spamData = toSafeObject(res, status);
                        const updateSpamRuleList = ensureArray(spamData?.spamRuleList).map((item) => ({
                            ...ensureObject(item),
                            spamScore: item?.spamScore != null ? item.spamScore : parseFloat(item?.pts) || 0,
                        }));
                        const top3 = [...updateSpamRuleList]
                            .sort((a, b) => (b?.spamScore ?? 0) - (a?.spamScore ?? 0))
                            .slice(0, 3);
                        payload?.setValue?.(payload?.spamScore, spamData);
                        payload?.setValue?.(payload?.top3, top3);
                        dispatch(updateSpamScore({ data: spamData, field: payload?.spamScore }));
                        dispatch(updateSpamScore({ data: top3, field: payload?.top3 }));
                        dispatch(update_campaign_details({ data: spamData, field: 'spamScore' }));
                    });
                },
                fail: () => {
                    delete lastCheckSpamSignatureByKey[cacheKey];
                },
            }),
        );
    };

export const getSenderName =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_SENDER_NAME,
                payload,
                loading,
                ok: ({ data }) => {
                    runSafeOkHandler(() => {
                        let { data: res, status } = data || {};
                        const modifiedRes = toSafeArray(res, status).map((item) => ({
                            ...ensureObject(item),
                            subLabel: item?.friendlyName || '',
                        }));
                        dispatch(updateSmsList({ data: modifiedRes, field: 'senderName' }));
                    }, () => dispatch(updateSmsList({ data: [], field: 'senderName' })));
                },
            }),
        );

export const getTemplateLanguage =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_TEMPLATE_LANGUAGE,
                payload,
                loading,
                ok: ({ data }) => {
                    runSafeOkHandler(() => {
                        let { data: res, status } = data || {};
                        dispatch(updateSmsList({ data: toSafeArray(res, status), field: 'templateLanguage' }));
                    }, () => dispatch(updateSmsList({ data: [], field: 'templateLanguage' })));
                },
            }),
        );
export const getSMSTemplateLanguage =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_SMS_LANGUAGE,
                payload,
                loading: true,
                ok: ({ data }) => {
                    runSafeOkHandler(() => {
                        let { data: res, status } = data || {};
                        dispatch(updateSmsList({ data: toSafeArray(res, status), field: 'templateSMSLanguage' }));
                    }, () => dispatch(updateSmsList({ data: [], field: 'templateSMSLanguage' })));
                },
            }),
        );

export const getPersonalizationFields =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_PERSONALIZATION_FIELDS,
                payload,
                loading,
                ok: ({ data }) => {
                    runSafeOkHandler(() => {
                        let { data: res, status } = data || {};
                        if (status) {
                            const personalization = toSafeArray(res, true).map((item) => {
                                const safeItem = ensureObject(item);
                                const finalFallbackAttributeName =
                                    safeItem?.fallbackAttributeName && payload?.ListType != 1
                                        ? ` | [[${safeItem.fallbackAttributeName}]]`
                                        : '';
                                return {
                                    ...safeItem,
                                    personalizationKey: `[[${safeItem?.attributeName}]]${finalFallbackAttributeName}`,
                                    key: `[[${safeItem?.attributeName}]]`,
                                };
                            });
                            if (payload?.ListType) {
                                dispatch(
                                    updateListTypeWisePersonaLization({
                                        listType: `${payload?.ListType}|${payload?.ListID}`,
                                        data: personalization,
                                    }),
                                );
                            } else {
                                dispatch(updatePersonaLization(personalization));
                            }
                        } else {
                            if (!payload?.ListType) dispatch(updatePersonaLization([]));
                            dispatch(
                                updateListTypeWisePersonaLization({
                                    listType: `${payload?.ListType}|${payload?.ListID}`,
                                    data: [],
                                }),
                            );
                        }
                    }, () => {
                        if (!payload?.ListType) dispatch(updatePersonaLization([]));
                        dispatch(
                            updateListTypeWisePersonaLization({
                                listType: `${payload?.ListType}|${payload?.ListID}`,
                                data: [],
                            }),
                        );
                    });
                },
            }),
        );

export const saveMessagingCampaign =
    ({ payload, type, savedChannelsId, channelId, loading = true }) =>
    async (dispatch) => {
        let url;
        if (type === 'sms') url = SAVE_SMS_CAMPAIGN;
        else if (type === 'whatsapp') url = SAVE_WHATSAPP_CAMPAIGN;
        return dispatch(
            request.post({
                url,
                payload,
                loading,
                ok: ({ data }) => {
                    try {
                        const { status } = data || {};
                        if (status) {
                            const safeSavedChannelsId = ensureObject(savedChannelsId);
                            const finalSavedChannelId = { ...safeSavedChannelsId };
                            if (safeSavedChannelsId[channelId]?.includes(channelId)) {
                                finalSavedChannelId[channelId] = [...safeSavedChannelsId[channelId]];
                            } else {
                                finalSavedChannelId[channelId] = [...(safeSavedChannelsId[channelId] || []), channelId];
                            }
                            dispatch(updateSaveChannelsId(finalSavedChannelId));
                        }
                    } catch {
                        // Save succeeded at API level; skip local channel-id bookkeeping on malformed response.
                    }
                },
            }),
        );
    };
export const saveMessagingCampaignNew =
    ({ payload, type, savedChannelsId, channelId, loading = true }) =>
    async (dispatch) => {
        let url;
        if (type === 'sms') url = SAVE_SMS_CAMPAIGN;
        else if (type === 'whatsapp') url = SAVE_WHATSAPP_CAMPAIGN_NEW;
        return dispatch(
            request.post({
                url,
                payload,
                loading,
                ok: ({ data }) => {
                    try {
                        const { status } = data || {};
                        if (status) {
                            const safeSavedChannelsId = ensureObject(savedChannelsId);
                            const finalSavedChannelId = { ...safeSavedChannelsId };
                            if (safeSavedChannelsId[channelId]?.includes(channelId)) {
                                finalSavedChannelId[channelId] = [...safeSavedChannelsId[channelId]];
                            } else {
                                finalSavedChannelId[channelId] = [...(safeSavedChannelsId[channelId] || []), channelId];
                            }
                            dispatch(updateSaveChannelsId(finalSavedChannelId));
                        }
                    } catch {
                        // Save succeeded at API level; skip local channel-id bookkeeping on malformed response.
                    }
                },
            }),
        );
    };
export const uploadMessagingImage = ({ payload, loading = true }) => {
    return async (dispatch) => {
        return dispatch(
            request.post({
                url: UPLOAD_IMAGE,
                payload,
                loading,
                ok: ({ data }) => {
                    // let { data: response, status } = data;
                    // response = status ? response : {};
                    // dispatch(updateSmsList({ data: response, field: 'campaignDetails' }));
                },
            }),
        );
    };
};

export const uploadMessagingVideoDocument = ({ payload, loading = true }) => {
    return async (dispatch) => {
        return dispatch(
            request.post({
                url: UPLOAD_VIDEO_DOCUMENT,
                payload,
                loading,
                ok: () => {},
            }),
        );
    };
};

const normalizeMessagingCampaignResponse = (response, status) => {
    try {
        if (!status || !response || typeof response !== 'object') return {};
        return normalizeChannelCampaignData(response, ['smsSplit', 'smsAutoSchedule', 'waSplit', 'waAutoSchedule']);
    } catch {
        return {};
    }
};

const normalizeRcsCampaignResponse = (response, status) => {
    try {
        if (!status || !response || typeof response !== 'object') return {};
        return normalizeChannelCampaignData(response, ['rcsSplit', 'rcsAutoSchedule']);
    } catch {
        return {};
    }
};

const normalizeVmsCampaignResponse = (response, status) => {
    try {
        if (!status || !response || typeof response !== 'object') return {};
        return normalizeChannelCampaignData(response);
    } catch {
        return {};
    }
};

const dispatchSafeMessagingCampaignDetails = (dispatch, response, status) => {
    try {
        const normalized = normalizeMessagingCampaignResponse(response, status);
        dispatch(updateSmsList({ data: normalized, field: 'campaignDetails' }));
    } catch {
        dispatch(updateSmsList({ data: {}, field: 'campaignDetails' }));
    }
};

export const getMessagingCampaignById = ({ payload, type, campaignType, isEnableLoader = false }) => {
    return async (dispatch) => {
        if (campaignType === 'M') {
            let channelDetailId = type === 'sms' ? payload.smsChannelDetailId : payload.waChannelDetailId;
            if (!channelDetailId || channelDetailId < 1) {
                return Promise.resolve({});
            }
        }
        let url;
        if (type === 'sms') url = GET_SMS_CAMPAIGN_BY_ID;
        else if (type === 'whatsapp') url = GET_WHATSAPP_CAMPAIGN_BY_ID;
        return dispatch(
            request.post({
                url,
                payload,
                loading: isEnableLoader,
                isFailureCheck: true,
                ok: ({ data }) => {
                    const { data: response, status } = data || {};
                    dispatchSafeMessagingCampaignDetails(dispatch, response, status);
                },
                fail: () => {
                    dispatchSafeMessagingCampaignDetails(dispatch, null, false);
                },
            }),
        );
    };
};

export const getMessagingCampaignByIdNew = ({ payload, type, campaignType, isEnableLoader = false }) => {
    return async (dispatch) => {
        if (campaignType === 'M') {
            let channelDetailId = type === 'sms' ? payload.smsChannelDetailId : payload.waChannelDetailId;
            if (!channelDetailId || channelDetailId < 1) {
                return Promise.resolve({});
            }
        }
        let url;
        if (type === 'sms') url = GET_SMS_CAMPAIGN_BY_ID;
        else if (type === 'whatsapp') url = GET_WHATSAPP_CAMPAIGN_BY_ID_NEW;
        return dispatch(
            request.post({
                url,
                payload,
                loading: isEnableLoader,
                isFailureCheck: true,
                ok: ({ data }) => {
                    const { data: response, status } = data || {};
                    dispatchSafeMessagingCampaignDetails(dispatch, response, status);
                },
                fail: () => {
                    dispatchSafeMessagingCampaignDetails(dispatch, null, false);
                },
            }),
        );
    };
};
//Email Channel:

export const getUnSubscriptionList =
    ({ payload, loading = false }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_UNSUBSCRIPTION,
                payload,
                loading,
                ok: ({ data }) => {
                    runSafeOkHandler(() => {
                        let { data: response, status } = data || {};
                        dispatch(updateEmailList({ data: toSafeArray(response, status), field: 'unSubscriptionList' }));
                    }, () => dispatch(updateEmailList({ data: [], field: 'unSubscriptionList' })));
                },
            }),
        );

export const getEmailFooterList =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_EMAIL_FOOTER_LIST,
                payload,
                loading,
                ok: ({ data }) => {
                    runSafeOkHandler(() => {
                        let { data: response, status } = data || {};
                        const list = toSafeArray(response, status);
                        dispatch(updateEmailList({ data: list.length ? list : [], field: 'emailFooter' }));
                    }, () => dispatch(updateEmailList({ data: [], field: 'emailFooter' })));
                },
            }),
        );
export const getDomainNameList =
    ({ payload, loading = true }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_DOMIAN_LIST,
                payload,
                loading,
                ok: ({ data }) => {
                    try {
                        let { data: response, status } = data || {};
                        response = status
                            ? ensureArray(response)
                                  .filter((item) => typeof item?.domainName === 'string' && !!item?.domainName)
                                  .map((item) => ({
                                      ...ensureObject(item),
                                      senderUserName: item?.senderEmailID
                                          ? item.senderEmailID?.split('@')?.[0] ?? ''
                                          : '',
                                      senderName: item?.senderName ?? '',
                                  }))
                            : [];
                        dispatch(updateEmailList({ data: response?.length ? response : [], field: 'domainNameList' }));
                    } catch {
                        dispatch(updateEmailList({ data: [], field: 'domainNameList' }));
                    }
                },
                fail: (err) => {
                                    },
            }),
        );
    };

export const updateSenderDetails =
    (payload) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: UPDATE_SENDER_DETAILS,
                payload,
                loading: true,
                isFailureCheck: false,
                fail: () => {},
            }),
        );

export const uploadCommunicationFile =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: UPLOAD_COMMUNICATIONFILE,
                payload,
                loading,
            }),
        );
export const uploadImageCommunicationFile =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: UPLOAD_RICHIMAGEFILE,
                payload,
                loading: true,
                isFailureCheck: true,
            }),
        );

export const uploadCommunicationFileWeb =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: UPLOAD_COMMUNICATIONFILE_WEB,
                payload,
                loading,
                ok: ({ data }) => {
                                        if (data?.status) {
                        dispatch(updateNotificationWeb({ data: data?.data?.edmGuid, field: 'edmGuid' }));
                        dispatch(updateNotificationMobile({ data: data?.data?.edmGuid, field: 'edmGuid' }));
                    } else {
                        dispatch(updateNotificationWeb({ data: '', field: 'edmGuid' }));
                        dispatch(updateNotificationMobile({ data: '', field: 'edmGuid' }));
                    }
                },
            }),
        );

export const getSmtpSetting =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_SMTP_SETTINGS,
                payload,
                loading: true,
                ok: ({ data }) => {
                    let { data: response, status } = data;
                    response = toSafeArray(response, status);
                    dispatch(updateEmailList({ data: response, field: 'smtpSettings' }));
                },
            }),
        );
export const saveEmailCampaign =
    ({ payload, savedChannelsId, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: SAVE_EMAIL_COMMUNICATION,
                payload,
                loading,
                isFailureCheck: true,
                ok: ({ data }) => {
                                        const { status } = data;
                    if (status) {
                        const channelId = 1;
                        const finalSavedChannelId = { ...savedChannelsId };
                        if (savedChannelsId[channelId]?.includes(channelId)) {
                            finalSavedChannelId[channelId] = [...savedChannelsId[channelId]];
                        } else {
                            finalSavedChannelId[channelId] = [...(savedChannelsId[channelId] || []), channelId];
                        }
                        dispatch(updateSaveChannelsId(finalSavedChannelId));
                    }
                },
            }),
        );

export const saveEmailTemplateContent =
    ({ payload, savedChannelsId }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: SAVE_EMAIL_TEMPLATE_CONTENT,
                payload,
                loading: true,
                isFailureCheck: true,
                ok: ({ data }) => {
                    const { status } = data;
                    if (status) {
                        const channelId = 1;
                        const finalSavedChannelId = { ...savedChannelsId };
                        if (savedChannelsId[channelId]?.includes(channelId)) {
                            finalSavedChannelId[channelId] = [...savedChannelsId[channelId]];
                        } else {
                            finalSavedChannelId[channelId] = [...(savedChannelsId[channelId] || []), channelId];
                        }
                        dispatch(updateSaveChannelsId(finalSavedChannelId));
                    }
                },
            }),
        );

export const getEmailCommunicationById =
    ({ payload, testCampaignPayload, loading = false, isEnableLoader }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_EMAIL_COMMUNICATION,
                payload,
                loading: resolveRequestGlobalLoading(loading, isEnableLoader),
                isFailureCheck: true,
                ok: ({ data }) => {
                    const { status, data: response } = data;
                    let payload = toSafeObject(response, status);
                    if (testCampaignPayload && Object.keys(testCampaignPayload)?.length) {
                        // if (payload?.isSplitAB) {
                        //     const { schedule, testCampaignEmailAddress } = testCampaignPayload;
                        //     payload = { ...payload, testCampaignEmailAddress };
                        //     schedule.forEach((item, index) => {
                        //         payload['content'][index] = { ...payload['content'][index], localBlastDateTime: item };
                        //     });
                        // } else {
                        const { testCampaignEmailAddress } = testCampaignPayload;
                        payload = { ...payload, testCampaignEmailAddress };
                        // payload['content'][0] = { ...payload['content'][0], localBlastDateTime: schedule };
                        // }
                                            }
                    dispatch(updateEmailList({ data: payload, field: 'campaignDetails' }));
                },
            }),
        );
    };

export const getHsmTemplate =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_HSM_TEMPLATE,
                payload,
                loading: true,
                ok: ({ data }) => {
                    const { status, data: response } = data;
                    const payload = toSafeArray(response, status);
                    dispatch(updateSmsList({ data: payload, field: 'hsmTemplate' }));
                },
            }),
        );

export const getHsmTemplateNew =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_HSM_TEMPLATE_NEW,
                payload,
                loading,
                ok: ({ data }) => {
                    const { status, data: response } = data;
                    const payloadData = status ? { [payload?.languageId]: response } : { [payload?.languageId]: [] };
                    dispatch(updateWATemplateList({ data: payloadData, field: 'hsmTemplateList' }));
                },
            }),
        );
export const getFileUploadSize =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_UPLOADSIZE,
                payload,
                loading,
                ok: ({ data }) => {
                    const { status, data: response } = data;
                    const payload = toSafeArray(response, status);
                    dispatch(updateSmsList({ data: payload, field: 'uploadSize' }));
                },
            }),
        );

//Social post:

export const getSocialMedia =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_SOCIAL_MEDIA_SETUP,
                payload,
                loading,
                ok: ({ data }) => {
                    const { status, data: response } = data;
                    const list = toSafeArray(response, status);
                    dispatch(updateSocialMediaSetUp({ data: list, field: 'socialMediaDropDown' }));
                    return { status, data: list ?? [] };
                },
                fail: () => {
                    dispatch(updateSocialMediaSetUp({ data: [], field: 'socialMediaDropDown' }));
                    return { status: false, data: [] };
                },
            }),
        );

export const getFacebookCountries =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_FACEBOOK_COUNTRIES,
                payload,
                loading,
                ok: ({ data }) => {
                    const { status, data: response } = data;
                    const payload = toSafeArray(response, status);
                    dispatch(updateSocialMediaSetUp({ data: payload, field: 'fbCountries' }));
                },
            }),
        );

export const getFacebookBasedCities = (payload) => async (dispatch) =>
    dispatch(
        request.post({
            url: GET_FACEBOOK_CITIES_BASED_COUNTRY,
            payload,
            loading: true,
            ok: ({ data }) => {
                const { status, data: response } = data;
                const payload = toSafeArray(response, status);
                dispatch(updateSocialMediaSetUp({ data: payload, field: 'cityCountries' }));
            },
        }),
    );
export const saveSocialPost = (payload, { loading = true } = {}) => async (dispatch) => {
    return dispatch(
        request.post({
            url: MANAGE_SOCIAL_POST,
            payload,
            loading,
            isFailureCheck: true,
            ok: () => {},
            fail: (error) => {},
        }),
    );
};

export const getDatafromSocialPost =
    ({ payload, loading = false, isEnableLoader }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_SOCIAL_POST_BY_LEVEL,
                payload,
                loading: resolveRequestGlobalLoading(loading, isEnableLoader),
                isFailureCheck: true,
                ok: ({ data }) => {
                    const { status, data: response } = data;
                    const payload = toSafeArray(response, status);
                    dispatch(updateSocialMediaSetUp({ data: payload, field: 'fetchSocilaData' }));
                },
                fail: (error) => {},
            }),
        );

export const imageUplodaSocilaPost = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: IMG_UPLOAD_SOCIAL_POST,
            payload,
            loading: true,
            ok: ({ data }) => {},
            fail: (error) => {},
        }),
    );
};

export const videoUploadSocialPost = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: VIDEO_UPLOAD_SOCIAL_POST,
            payload,
            loading: true,
            isFailureCheck: true,
            ok: ({ data }) => {},
            fail: (error) => {},
        }),
    );
};

/** Social post uploads: images (multi), PDFs, and videos — FormData key `File` to `Communication/UploadDocuments`. */
export const uploadSocialPostDocuments =
    ({ payload ,loading}) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: UPLOAD_VIDEO_DOCUMENT,
                payload,
                loading: loading ?? true,
                ok: () => {},
                fail: () => {},
            }),
        );

export const uploadWebPushImage = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: UPLOAD_WEB_PUSH,
            payload,
            loading: true,
            isFailureCheck: true,
            ok: ({ data }) => {},
            fail: (error) => {},
        }),
    );
};

//Voice

export const saveCallCenter =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: SAVE_CALL_CENTER,
                payload,
                loading,
                isFailureCheck: true,
            }),
        );

export const getCallCenter =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_CALL_CENTER_BY_ID,
                payload,
                loading,
                ok: ({ data }) => {
                    const { data: response, status } = data;
                    const payload = toSafeObject(response, status);
                    dispatch(updateVoiceList({ data: payload, field: 'campaignDetails' }));

                },
            }),
        );

//VMS:

export const getVmsSenderName =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_VMS_SENDER_NAME,
                payload,
                loading,
                ok: ({ data }) => {
                    const { data: res, status } = data;
                    const response = toSafeArray(res, status);
                    dispatch(
                        updateVmsList({
                            data: response,
                            field: 'senderName',
                        }),
                    );
                },
            }),
        );
export const getVMSTemplate =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_VMS_TEMPLATE_LIST,
                payload,
                loading,
                ok: ({ data }) => {
                    const { data: res, status } = data;
                    const response = toSafeArray(res, status);
                    dispatch(
                        updateVmsList({
                            data: response,
                            field: 'template',
                        }),
                    );
                },
            }),
        );
export const getVmsLanguage =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_VMS_LANGUAGE,
                payload,
                loading,
                ok: ({ data }) => {
                    runSafeOkHandler(() => {
                        const { data: res, status } = data || {};
                        const response = toSafeArray(res, status).filter((item, index) => index < 500);
                        dispatch(
                            updateVmsList({
                                data: response,
                                field: 'language',
                            }),
                        );
                    }, () => dispatch(updateVmsList({ data: [], field: 'language' })));
                },
            }),
        );
export const saveVms =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: SAVE_VMS,
                payload,
                loading,
                ok: ({ data }) => {
                                    },
            }),
        );
export const getVmsCampaign =
    ({ payload, loading = false, isEnableLoader }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_VMS_CAMPAIGN_BY_ID,
                payload,
                loading: resolveRequestGlobalLoading(loading, isEnableLoader),
                isFailureCheck: true,
                ok: ({ data }) => {
                    runSafeOkHandler(() => {
                        const { data: res, status } = data || {};
                        dispatch(
                            updateVmsList({
                                data: normalizeVmsCampaignResponse(res, status),
                                field: 'campaignDetails',
                            }),
                        );
                    }, () => dispatch(updateVmsList({ data: {}, field: 'campaignDetails' })));
                },
                fail: () => {
                    dispatch(updateVmsList({ data: {}, field: 'campaignDetails' }));
                },
            }),
        );
    };

export const uploadAudioFile =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: UPLOAD_AUDIO_FILE,
                payload,
                loading: true,
            }),
        );

//Paid media

export const getAdListTypes = (payload, { loading = true } = {}) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_PAID_MEDIA_LIST,
            payload,
            loading,
            ok: ({ data }) => {},
        }),
    );
};

export const paidMediaPost =
    ({ loading = true, isEnableLoader, ...payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_PAID_MEDIA_POST,
                payload,
                loading: resolveRequestGlobalLoading(loading, isEnableLoader),
                ok: ({ data }) => {},
            }),
        );
    };

export const socialMediaAppKeys = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_SOCIAL_MEDIA_APP_KEYS,
            payload,
            loading: true,
            ok: ({ data }) => {},
        }),
    );
};

export const saveAndUpdatePaidMedia = (payload, { loading = true } = {}) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SAVE_AND_UPDATE_PAID_MEDIA,
            payload,
            loading,
            isFailureCheck: true,
            ok: ({ data }) => {},
        }),
    );
};

export const getPaidMediaSavedData =
    ({ loading = true, isEnableLoader, ...payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_PAID_MEDIA_SAVE_LIST,
                payload,
                loading: resolveRequestGlobalLoading(loading, isEnableLoader),
                isFailureCheck: true,
                ok: ({ data }) => {},
            }),
        );
    };

export const getWebAnalyticsDomainList =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: WEBANALYTICS_DOMAIN_LIST,
                payload,
                loading: true,
                ok: ({ data }) => {
                    const { data: res, status } = data;
                    const response = toSafeArray(res, status);
                    dispatch(
                        updateWebAnalytics({
                            data: response,
                            field: 'webAnalyticsDomainList',
                        }),
                    );
                },
            }),
        );
    };
export const getWebAnalyticsData =
    ({ payload, loading = true, isEnableLoader }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_WEBANALYTICS,
                payload,
                loading: resolveRequestGlobalLoading(loading, isEnableLoader),
                // isFailureCheck: true,
                ok: ({ data }) => {
                    const { data: res, status } = data;
                    const response = toSafeArray(res, status);
                    dispatch(
                        updateWebAnalytics({
                            data: response?.webAnalyticsCampaign,
                            field: 'webAnalyticsData',
                        }),
                    );
                },
            }),
        );
    };

export const getWebAnalyticsFormList =
    ({ payload, loading = true }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: WEBANALYTICS_SUBSCRPTION_FORMLIST,
                payload,
                loading,
                ok: ({ data }) => {
                    const { data: res, status } = data;
                    const response = toSafeArray(res, status);
                    dispatch(
                        updateWebAnalytics({
                            data: response,
                            field: 'webAnalyticsFormList',
                        }),
                    );
                },
            }),
        );
    };

export const getWebAnalyticsList =
    ({ payload, loading = true }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: WEBANALYTICS_LIST,
                payload,
                loading,
                ok: ({ data }) => {
                    const { data: res, status } = data;
                    const response = toSafeArray(res, status);
                    dispatch(
                        updateWebAnalytics({
                            data: response,
                            field: 'webAnalyticsList',
                        }),
                    );
                },
            }),
        );
    };

export const getMobileAnalyticsList =
    ({ payload, loading = true }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: WEBANALYTICS_LIST,
                payload,
                loading,
                ok: ({ data }) => {
                                    },
            }),
        );
    };

export const getAppAnalyticsContent =
    ({ payload, loading = true, isEnableLoader }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: APP_ANALYTICS_CONTENT,
                payload,
                loading: resolveRequestGlobalLoading(loading, isEnableLoader),
                ok: ({ data }) => {
                                    },
            }),
        );
    };

export const saveMOBILEAnalyticsChannel =
    ({ payload, savedChannelsId, loading = true }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: SAVE_MOBILE_ANALYTICS,
                payload,
                loading,
                ok: async ({ data }) => {
                                        if (data?.status) {
                        if (data?.status) {
                            const channelId = 16;
                            const finalSavedChannelId = { ...savedChannelsId };
                            if (finalSavedChannelId[channelId]?.includes(channelId)) {
                                finalSavedChannelId;
                            } else {
                                finalSavedChannelId[channelId] = [channelId];
                            }
                            await dispatch(updateSaveChannelsId(finalSavedChannelId));
                        }
                    }
                },
            }),
        );
    };
export const saveWebAnalyticsChannel =
    ({ payload, savedChannelsId, loading = true }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: WEBANALYTICS_SAVE,
                payload,
                loading,
                isFailureCheck: true,
                ok: async ({ data }) => {
                    if (data?.status) {
                        const channelId = 6;
                        const finalSavedChannelId = { ...savedChannelsId };
                        if (finalSavedChannelId[channelId]?.includes(channelId)) {
                            finalSavedChannelId;
                        } else {
                            finalSavedChannelId[channelId] = [channelId];
                        }
                        await dispatch(updateSaveChannelsId(finalSavedChannelId));
                        localStorage.setItem('savedChannel', JSON.stringify(finalSavedChannelId));
                    }
                },
            }),
        );
    };
export const nameSentimentORMExistChannel =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: SENTIMENT_NAME_EXIST,
                payload,
                loading: true,
                ok: ({ data }) => {},
            }),
        );
    };
export const editSentimentORMChannel =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: SENTIMENT_GET,
                payload,
                loading: true,
                ok: ({ data }) => {
                    const { status, data: response } = data;
                    const payload = toSafeObject(response, status);
                    dispatch(updateORMAnalytics({ data: payload, field: 'ormData' }));
                },
            }),
        );
    };
export const saveSentimentORMChannel =
    ({ payload, loading = true }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: SENTIMENT_SAVE,
                payload,
                loading,
                ok: ({ data }) => {},
            }),
        );
    };
export const getQRCodeCampaign =
    ({ payload, failCheck = false, loading = true }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_QR_CODE_CAMAPIGN,
                payload,
                loading,
                isFailureCheck: failCheck,
                ok: ({ data }) => {
                    const { data: res, status } = data;
                    const response = toSafeObject(res, status);
                    dispatch(
                        updateQr({
                            data: response,
                            field: 'qrcodeCampaign',
                        }),
                    );
                },
            }),
        );
    };

export const getRecipientFormsCampaign =
    ({ payload, loading = true }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_RECIPIENT_FORMS_CAMPAIGN,
                payload,
                loading,
                ok: ({ data }) => {
                    const { data: res, status } = data;
                    const response = toSafeObject(res, status);
                    dispatch(
                        updateQr({
                            data: !!response && !!response?.length ? response : [{ formId: 0, formName: 'Select KYC' }],
                            field: 'getKYClist',
                        }),
                    );
                },
            }),
        );
    };

export const getRecipientFormByFormId = ({ payload, field, fromAnalytics = false, loading = true }) => {
    return async (dispatch) =>
        dispatch(
            request.post({
                url: GET_RECIPIENT_FORMS_ID,
                payload,
                loading,
                isFailureCheck: true,
                ok: ({ data }) => {
                    const { data: res, status } = data;
                    const response = toSafeObject(res, status);
                    if (!fromAnalytics) {
                        dispatch(
                            updateQr({
                                data: response,
                                field: 'getKYClistID',
                            }),
                        );
                    }
                },
            }),
        );
};

export const uploadImageQR =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: UPLOAD_IMG_QR,
                payload,
                loading: true,
                ok: ({ data }) => {
                    const { data: res, status } = data;
                    const response = toSafeObject(res, status);
                    dispatch(
                        updateQr({
                            data: response,
                            field: 'uploadImg',
                        }),
                    );
                },
            }),
        );
export const getQRCodeDownloadURL =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_QR_CODE_DOWNLOAD,
                payload,
                loading: true,
                isFailureCheck: true,
                ok: ({ data }) => {
                    const { data: res, status } = data;
                    const response = toSafeObject(res, status);
                    dispatch(
                        updateQr({
                            data: response,
                            field: 'getDownkoadURL',
                        }),
                    );
                },
            }),
        );
    };

export const updateQRCode =
    ({ payload, loading = true }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: UPDATE_QR_CODE,
                payload,
                loading,
                isFailureCheck: true,
                ok: ({ data }) => {
                    const { data: res, status } = data;
                    const response = toSafeObject(res, status);
                    dispatch(
                        updateQr({
                            data: response,
                            field: 'saveqrCode',
                        }),
                    );
                },
            }),
        );
    };

export const getVideoAnalyticsList =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: WEBANALYTICS_LIST,
                payload,
                loading: true,
                ok: ({ data }) => {
                    const { data: res, status } = data;
                    const response = toSafeObject(res, status);
                    dispatch(
                        updateVideoAnalytics({
                            data: response,
                            field: 'videoAnalyticsList',
                        }),
                    );
                },
            }),
        );
    };

export const getVideoAnalyticsDomainList =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: VIDEO_ANALYTICS_DOMAIN_LIST,
                payload,
                loading: true,
                ok: ({ data }) => {
                    const { data: res, status } = data;
                    const response = toSafeArray(res, status);
                    dispatch(
                        updateVideoAnalytics({
                            data: response,
                            field: 'videoAnalyticsDomainList',
                        }),
                    );
                },
            }),
        );
    };

export const validateVideo =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: VIDEO_VALIDATION,
                payload,
                loading: true,
                ok: ({ data }) => {},
            }),
        );
    };

export const saveVideoCampaign =
    ({ payload, loading = true }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: SAVE_VIDEO_CAMPAIGN,
                payload,
                loading,
                ok: ({ data }) => {},
            }),
        );
    };

export const getAllVideoAnalyticsContent =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_ALL_VIDEOANALYTICS_CONTENT,
                payload,
                loading: true,
                ok: ({ data }) => {},
            }),
        );
    };

//Notifications - Web push

export const getNotificationWebPush =
    ({ payload, loading = true }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_WEB_NOTIFY_DOMAINS,
                payload,
                loading,
                ok: ({ data }) => {
                    runSafeOkHandler(() => {
                        if (data?.status) {
                            function extractDomain(url) {
                                const regex = /^https?:\/\/[^/]+/;

                                if (!url || typeof url !== 'string') {
                                    return url;
                                }

                                const match = url.match(regex);

                                return match ? match[0] : url;
                            }

                            const finalDomainUrlData = ensureArray(data?.data?.webNotifydomain).map((domainItem) => {
                                const safeItem = ensureObject(domainItem);
                                const finalDomailUrl = extractDomain(safeItem?.domainUrl);
                                return {
                                    ...safeItem,
                                    labelDomainUrl: finalDomailUrl || safeItem?.domainUrl,
                                };
                            });
                            dispatch(updateNotificationWeb({ data: finalDomainUrlData, field: 'domainsList' }));
                            dispatch(updateNotificationWeb({ data: data?.data?.campaignGUId ?? '', field: 'campaignGuId' }));
                        } else {
                            dispatch(updateNotificationWeb({ data: [], field: 'domainsList' }));
                            dispatch(updateNotificationWeb({ data: '', field: 'campaignGuId' }));
                        }
                    }, () => {
                        dispatch(updateNotificationWeb({ data: [], field: 'domainsList' }));
                        dispatch(updateNotificationWeb({ data: '', field: 'campaignGuId' }));
                    });
                },
                fail: (err) => {
                                        dispatch(updateNotificationWeb({ data: [], field: 'domainsList' }));
                    dispatch(updateNotificationWeb({ data: '', field: 'campaignGuId' }));
                },
            }),
        );
    };

export const getRecipientForNotification =
    ({ payload, fromDomainChange = false, audienceList = [], loading = true }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_RECIPIENT_COMMUNICATION,
                payload,
                loading,
                ok: ({ data }) => {
                    runSafeOkHandler(() => {
                        if (data?.status) {
                            const sourceList = ensureArray(data?.data);
                            const finalList = sourceList.filter(
                                (item) =>
                                    !ensureArray(audienceList).some(
                                        (listItem) => listItem?.segmentationListId === item?.segmentationListId,
                                    ),
                            );
                            if (payload?.channelType === 'WN') {
                                dispatch(
                                    updateNotificationWeb({
                                        data: finalList,
                                        field: 'audienceList',
                                        isFailure: fromDomainChange ? true : false,
                                    }),
                                );
                            } else {
                                dispatch(
                                    updateNotificationMobile({
                                        data: finalList,
                                        field: 'audienceList',
                                        isFailure: fromDomainChange ? true : false,
                                    }),
                                );
                            }
                        } else if (payload?.channelType === 'WN') {
                            dispatch(updateNotificationWeb({ data: [], field: 'audienceList', isFailure: true }));
                        } else {
                            dispatch(updateNotificationMobile({ data: [], field: 'audienceList', isFailure: true }));
                        }
                    }, () => {
                        if (payload?.channelType === 'WN') {
                            dispatch(updateNotificationWeb({ data: [], field: 'audienceList', isFailure: true }));
                        } else {
                            dispatch(updateNotificationMobile({ data: [], field: 'audienceList', isFailure: true }));
                        }
                    });
                },
            }),
        );
    };

export const getInboxClassification =
    ({ payload, edit, loading = true }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_INBOX_CLASSIFICATIONS,
                payload,
                loading,
                ok: ({ data }) => {
                    // debugger;
                    if (data?.status && edit === undefined) {
                        if (payload.channelType === 'WN')
                            dispatch(updateNotificationWeb({ data: data?.data, field: 'inboxClassifications' }));
                        else dispatch(updateNotificationMobile({ data: data?.data, field: 'inboxClassifications' }));
                        // } else {
                        //     if (payload.channelType === 'WN')
                        //         dispatch(updateNotificationWeb({ data: [], field: 'inboxClassifications' }));
                        //     else dispatch(updateNotificationMobile({ data: [], field: 'inboxClassifications' }));
                    } else {
                        dispatch(updateNotificationWeb({ data: [], field: 'inboxClassifications' }));
                    }
                },
                fail: (err) => {
                                        dispatch(updateNotificationWeb({ data: [], field: 'inboxClassifications' }));
                    dispatch(updateNotificationMobile({ data: [], field: 'inboxClassifications' }));
                },
            }),
        );
    };

export const uploadWebPush =
    ({ payload, loading = true }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: UPLOAD_WEB_PUSH,
                payload,
                loading,
                ok: ({ data }) => {
                                        // if (data?.status) {
                    //     if (payload.channelType === 'WN')
                    //         dispatch(updateNotificationWeb({ data: data?.data, field: 'inboxClassifications' }));
                    //     else dispatch(updateNotificationMobile({ data: [], field: 'inboxClassifications' }));
                    // } else {
                    //     dispatch(updateNotificationWeb({ data: [], field: 'inboxClassifications' }));
                    // }
                },
                fail: (err) => {},
            }),
        );
    };

export const saveWebPush =
    ({ payload, savedChannelsId, loading = true }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: SAVE_WEB_PUSH,
                payload,
                loading,
                ok: async ({ data }) => {
                    // if (data?.status) {
                    //     if (payload.channelType === 'WN')
                    //         dispatch(updateNotificationWeb({ data: data?.data, field: 'inboxClassifications' }));
                    //     else dispatch(updateNotificationMobile({ data: [], field: 'inboxClassifications' }));
                    // } else {
                    //     dispatch(updateNotificationWeb({ data: [], field: 'inboxClassifications' }));
                    // }
                    if (data?.status) {
                        const channelId = 8;
                        const finalSavedChannelId = { ...savedChannelsId };
                        if (finalSavedChannelId[channelId]?.includes(channelId)) {
                            finalSavedChannelId;
                        } else {
                            finalSavedChannelId[channelId] = [channelId];
                        }
                        await dispatch(updateSaveChannelsId(finalSavedChannelId));
                    }
                },
                fail: (err) => {},
            }),
        );
    };

export const getWebPushById =
    ({ payload, loading = false, isEnableLoader }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_WEB_PUSH_BY_ID,
                payload,
                loading: resolveRequestGlobalLoading(loading, isEnableLoader),
                ok: ({ data }) => {
                                        // debugger;
                    if (data?.status) {
                        if (payload.channelType === 'WN')
                            dispatch(updateNotificationWeb({ data: data?.data, field: 'inboxClassifications' }));
                        else dispatch(updateNotificationMobile({ data: [], field: 'inboxClassifications' }));
                    } else {
                        // dispatch(updateNotificationWeb({ data: [], field: 'inboxClassifications' }));
                    }
                },
                fail: (err) => {},
                isFailureCheck: true,
            }),
        );
    };

// Notifications Mobile push

export const getMobileApp =
    ({ payload, loading = true }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_PUSH_NOTIFY_DOMAIN,
                payload,
                loading,
                ok: ({ data }) => {
                                        if (data?.status) {
                        dispatch(updateNotificationMobile({ data: data?.data, field: 'notifyDomain' }));
                    } else {
                        dispatch(updateNotificationMobile({ data: [], field: 'notifyDomain' }));
                    }
                },
                fail: (err) => {},
            }),
        );
    };

export const uploadMobilePush =
    ({ payload, loading = true }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: UPLOAD_MOBILE_PUSH,
                payload,
                loading,
                ok: ({ data }) => {
                                        // if (data?.status) {
                    //     if (payload.channelType === 'WN')
                    //         dispatch(updateNotificationWeb({ data: data?.data, field: 'inboxClassifications' }));
                    //     else dispatch(updateNotificationMobile({ data: [], field: 'inboxClassifications' }));
                    // } else {
                    //     dispatch(updateNotificationWeb({ data: [], field: 'inboxClassifications' }));
                    // }
                },
                fail: (err) => {},
            }),
        );
    };

export const getAudioListByApp =
    ({ payload, edit , loading = false }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_AUDIO_LIST_BY_APP,
                payload,
                loading: loading,
                ok: ({ data }) => {
                                        if (data?.status && edit === undefined) {
                        dispatch(updateNotificationMobile({ data: data?.data, field: 'audioSounds' }));
                    } else {
                        dispatch(updateNotificationMobile({ data: [], field: 'audioSounds' }));
                    }
                },
                fail: (err) => {},
            }),
        );
    };
export const saveMobilePush =
    ({ payload, savedChannelsId, loading = true }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: SAVE_MOBILE_PUSH,
                payload,
                loading,
                ok: async ({ data }) => {
                                        // if (data?.status) {
                    //     if (payload.channelType === 'WN')
                    //         dispatch(updateNotificationWeb({ data: data?.data, field: 'inboxClassifications' }));
                    //     else dispatch(updateNotificationMobile({ data: [], field: 'inboxClassifications' }));
                    // } else {
                    //     dispatch(updateNotificationWeb({ data: [], field: 'inboxClassifications' }));
                    // }
                    if (data?.status) {
                        const channelId = 14;
                        const finalSavedChannelId = { ...savedChannelsId };
                        if (finalSavedChannelId[channelId]?.includes(channelId)) {
                            finalSavedChannelId;
                        } else {
                            finalSavedChannelId[channelId] = [channelId];
                        }
                        await dispatch(updateSaveChannelsId(finalSavedChannelId));
                    }
                },
                fail: (err) => {},
            }),
        );
    };

export const getMobilePushById =
    ({ payload, loading = false, isEnableLoader }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_MOBILE_PUSH_BY_ID,
                payload,
                loading: resolveRequestGlobalLoading(loading, isEnableLoader),
                isFailureCheck: true,
                ok: ({ data }) => {
                                        // if (data?.status) {
                    //     if (payload.channelType === 'WN')
                    //         dispatch(updateNotificationWeb({ data: data?.data, field: 'inboxClassifications' }));
                    //     else dispatch(updateNotificationMobile({ data: [], field: 'inboxClassifications' }));
                    // } else {
                    //     dispatch(updateNotificationWeb({ data: [], field: 'inboxClassifications' }));
                    // }
                },
                fail: (err) => {},
            }),
        );
    };

export const getSyncBannerDetails =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_SYNC_BANNER_DETAILS,
                payload,
                loading: false,
                ok: ({ data }) => {
                                    },
                fail: (err) => {},
            }),
        );
    };

// App analytics
export const getAppScreenList =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_SCREEN_LIST,
                payload,
                loading: true,
                ok: ({ data }) => {},
            }),
        );
    };

export const getAppSubScreenList =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_SUB_SCREEN_LIST,
                payload,
                loading: true,
                ok: ({ data }) => {},
            }),
        );
    };

export const GetOfflineConversionDetails =
    (payload, loading = true) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_OFFLINECONVERSION_DETAILS,
                payload,
                loading,
            ok: ({ data }) => {
                const { data: res, status } = data;
                const response = toSafeArray(res, status);
                dispatch(
                    updateOfflineConversion({
                        data: response,
                        field: 'OfflineConversionEdit',
                    }),
                );
            },
        }),
    );
};
export const GetOfflineConversionAttributes =
    ({ payload, loading = true }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_OFFLINECONVERSION_ATTRIBUTES,
                payload,
                loading,
                ok: ({ data }) => {
                    const { data: res, status } = data;
                    const response = toSafeArray(res, status);
                    dispatch(
                        updateOfflineConversion({
                            data: response,
                            field: 'OfflineConversionAttributes',
                        }),
                    );
                },
            }),
        );
    };
export const GetOfflineConversionValues =
    (payload, loading = true) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_OFFLINECONVERSION_VALUES,
                payload,
                loading,
            ok: ({ data }) => {
                const { data: res, status } = data;
                const response = toSafeArray(res, status);
                dispatch(
                    updateOfflineConversion({
                        data: response,
                        field: 'OfflineConversionValues',
                    }),
                );
            },
        }),
    );
};

export const GetOfflineAttributeValues =
    (payload, loading = true) =>
    (dispatch) => {
        return dispatch(
            request.post({
                url: GET_ATTRIBUTE_VALUES,
                payload,
                loading,
            ok: ({ data }) => {
                                if (data?.status) {
                    const attrsValue = JSON.parse(data?.data);
                    // setDataValue(Object.keys(JSON.parse(attrsValue)));
                    dispatch(
                        updateOfflineConversionAttributes({
                            field: payload?.attributeName,
                            data: Object.keys(JSON.parse(attrsValue)),
                        }),
                    );
                } else {
                    dispatch(updateOfflineConversionAttributes({ field: payload?.attributeName, data: [] }));
                }
            },
            fail: (err) => {
                            },
        }),
    );
};

export const saveOfflineConversionChannel =
    ({ payload, loading = true }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: SAVE_OFFLINECONVERSION,
                payload,
                loading,
                isFailureCheck: true,
                ok: ({ data }) => {},
            }),
        );
    };
export const getContactByUserId =
    ({ payload, loading = true }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_CONTACT_BY_USERID,
                payload,
                loading,
                ok: ({ data }) => {
                                    },
            }),
        );
    };

export const getLiveTest = (payload, { loading = false } = {}) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_SENDLIVETEST,
            payload,
            loading,
            isToast: false,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};

export const getImportCampaign = (payload, { loading = true } = {}) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_COMMUNICATION_IMPORTCAMPAIGN,
            payload,
            loading,
            ok: ({ data }) => {
                            },
            fail: (err) => {},
        }),
    );
};
export const save_digipop_Communication = (payload, { loading = true } = {}) => async (dispatch) => {
    return dispatch(
        request.post({
            url: SAVE_DIGIPOP_COMMUNICATION,
            payload,
            loading,
            isFailureCheck: true,
            ok: ({ data }) => {},
            fail: (err) => {},
        }),
    );
};
export const get_digipop_Communication =
    ({ loading = true, isEnableLoader, ...payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_DIGIPOP_COMMUNICATION,
                payload,
                loading: resolveRequestGlobalLoading(loading, isEnableLoader),
            isFailureCheck: true,
            ok: ({ data }) => {},
            fail: (err) => {},
        }),
    );
    };
export const update_digipop_Communication = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: UPDATE_DIGIPOP_COMMUNICATION,
            payload,
            loading: true,
            isFailureCheck: true,
            ok: ({ data }) => {},
            fail: (err) => {},
        }),
    );
};
export const get_digipop_Audience = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_DIGIPOP_AUDIENCE,
            payload,
            loading: true,
            ok: ({ data }) => {},
            fail: (err) => {},
        }),
    );
};
export const get_digipop_BalanceImpression = (payload) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_DIGIPOP_IMPRESSIONBALANCE,
            payload,
            loading: true,
            ok: ({ data }) => {},
            fail: (err) => {},
        }),
    );
};

//RCS
export const get_Rcs_Sendername =
    ({ payload, loading = true }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_RCS_SENDERNAME,
                payload,
                loading,
                ok: ({ data }) => {
                    runSafeOkHandler(() => {
                        let { data: res, status } = data || {};
                        const modifiedRes = toSafeArray(res, status).map((item) => ({
                            ...ensureObject(item),
                            subLabel: item?.friendlyName || '',
                        }));
                        dispatch(updateRCSList({ data: modifiedRes, field: 'senderName' }));
                    }, () => dispatch(updateRCSList({ data: [], field: 'senderName' })));
                },
                fail: (err) => {},
            }),
        );
    };
export const get_Rcs_Template = ({ payload, loading = true }) => async (dispatch) => {
    return dispatch(
        request.post({
            url: GET_RCS_TEMPLATE,
            payload,
            loading,
            ok: ({ data }) => {
                runSafeOkHandler(() => {
                    let { data: res, status } = data || {};
                    dispatch(updateRCSList({ data: toSafeArray(res, status), field: 'templateList' }));
                }, () => dispatch(updateRCSList({ data: [], field: 'templateList' })));
            },
            fail: (err) => {},
        }),
    );
};
export const get_Rcs_Content_Template =
    ({ payload, loading = true }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_RCS_CONTENT_TEMPLATEID,
                payload,
                loading,
                ok: ({ data }) => {
                    // let { data: res, status } = data;
                    // res = toSafeArray(res, status);
                    dispatch(updateRCSList({ data: data, field: 'templateContentDetail' }));
                },
                fail: (err) => {},
            }),
        );
    };
export const save_Rcs_Campaign =
    ({ payload, loading = true }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: SAVE_RCS_CAMPAIGN,
                payload,
                loading,
                // isFailureCheck: true,
                ok: ({ data }) => {

                },
                fail: (err) => {},
            }),
        );
    };

export const Get_RCS_Campaign =
    ({ payload, loading = false, isEnableLoader }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_RCS_CAMPAIGN_BYID,
                payload,
                loading: resolveRequestGlobalLoading(loading, isEnableLoader),
                isFailureCheck: true,
                ok: ({ data }) => {
                    runSafeOkHandler(() => {
                        let { data: res, status } = data || {};
                        dispatch(updateRCSList({ data: normalizeRcsCampaignResponse(res, status), field: 'campaignDetails' }));
                    }, () => dispatch(updateRCSList({ data: {}, field: 'campaignDetails' })));
                },
                fail: () => {
                    dispatch(updateRCSList({ data: {}, field: 'campaignDetails' }));
                },
            }),
        );
    };


 export const getCrossBUStatus =
    ({ payload, loading = true }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_CROSS_BU_STATUS,
                payload,
                // isFailureCheck: true,
                loading,
                ok: ({ data }) => {
                },
                fail: (err) => {},
            }),
        );
    };
 export const getOfflineConversionBUList =
    ({ payload, loading = true }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_OFFLINE_CONVERSION_BU,
                payload,
                // isFailureCheck: true,
                loading,
                ok: ({ data }) => {
                },
                fail: (err) => {},
            }),
        );
    };

export const getConversionMatchingKey =
    ({ payload, loading = true }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_CONVERSION_MATCHING_KEY,
                payload: {
                    departmentId: payload.departmentId,
                    clientId: payload.clientId,
                    userId: payload.userId,
                    isCrossBU: Boolean(payload.isCrossBU),
                    crossBUDepartmentId: payload.crossBUDepartmentId ?? payload.departmentId,
                },
                loading,
                ok: ({ data }) => {
                    const { data: res, status } = data;
                    const response = status && res?.length ? res : [];
                    dispatch(
                        updateOfflineConversion({
                            data: response,
                            field: 'OfflineConversionMatchingKey',
                        }),
                    );
                },
                fail: (err) => {
                    dispatch(updateOfflineConversion({ data: [], field: 'OfflineConversionMatchingKey' }));
                },
            }),
        );
    };
export const saveWebAnalyticsCaptureFields =
    ({ payload, loading = true }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: WEBANALYTICS_SAVE_CAPTURE_FIELDS,
                payload,
                loading,
                ok: ({ data }) => {},
            }),
        );
    };
export const saveMobileAppAnalyticsCaptureFields =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: APP_ANALYTICS_SAVE_MOBILE_CAPTURE_FIELDS,
                payload,
                loading: true,
                ok: ({ data }) => {},
            }),
        );
    };

export const getAnalyticsCaptureData =
    ({ payload }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_ANALYTICS_CAPTURE_FIELDS,
                payload,
                loading: true,
                ok: ({ data }) => {},
            }),
        );
    };


export const getCDMTansferMethod =
    ({ payload, loading = true }) =>
    async (dispatch) => {
        dispatch(updateDirectMailList({ data: {loading: true, data: []}, field: 'transferMethods' }));

        return dispatch(
            request.post({
                url: GET_CDM_TRANSFERMRTHOD,
                payload,
                loading,
                ok: ({ data }) => {
                    const { data: response, status } = data;
                    if (status && response) {
                        // Handle different response structures
                        if (Array.isArray(response)) {
                            const res = response[0]?.DMTransferMethod || response || []
                            dispatch(updateDirectMailList({ data : {loading: false, data: res}, field: 'transferMethods' }));

                        } else if (typeof response === 'object') {
                            dispatch(updateDirectMailList({data :{loading: false, data: response}, field: 'transferMethods' }));
                        }
                    }
                },
                final: () => {
                    dispatch(updateDirectMailList({ data: {loading: false}, field: 'transferMethods', isReset: false }));
                }
            }),
        );
    };
export const getVendorDetails =
    ({ payload , loading = false}) =>
    async (dispatch) => {
        dispatch(updateDirectMailList({ data: {loading: true, data: []}, field: 'vendors' }));

        return dispatch(
            request.post({
                url: GET_VENDOR_FROM_REMOTESETTING,
                payload,
                loading: loading,
                ok: ({ data }) => {
                    const { data: response, status } = data;
                    if (status && response) {
                        // Handle different response structures
                        if (Array.isArray(response)) {
                            const res = response[0]?.DMTransferMethod || response || []
                            dispatch(updateDirectMailList({ data : {loading: false, data: res}, field: 'vendors' }));

                        } else if (typeof response === 'object') {
                            dispatch(updateDirectMailList({data :{loading: false, data: response}, field: 'vendors' }));
                        }
                    }
                },
                final: () => {
                    dispatch(updateDirectMailList({ data: {loading: false}, field: 'vendors', isReset: false }));
                }
            }),
        );
    };
    
export const savDirectmail =
    ({ payload, loading = true }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: SAVE_DIRECTMAIL,
                payload,
                loading,
                ok: ({ data }) => {},
            }),
        );
    };
export const getDirectmail =
    ({ payload, loading = false, isEnableLoader }) =>
    async (dispatch) => {
        return dispatch(
            request.post({
                url: GET_DIRECTMAIL,
                payload,
                isFailureCheck: true,
                loading: resolveRequestGlobalLoading(loading, isEnableLoader),
                ok: ({ data }) => {
                },
            }),
        );
    };