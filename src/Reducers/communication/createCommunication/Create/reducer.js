import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';

const toSerializableState = (value) => {
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value.toISOString();
    }
    if (Array.isArray(value)) {
        return value.map(toSerializableState);
    }
    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value).map(([key, entry]) => [key, toSerializableState(entry)]),
        );
    }
    return value;
};

const createCommunicationReducer = createSlice({
    name: 'CREATE_COMMUNICATION',
    initialState,
    reducers: {
        updateVerticalTab: (state, { payload }) => ({
            ...state,
            verticalTab: payload.tabs ?? state.verticalTab ?? initialState.verticalTab,
            ...(payload?.activeTabs && { activeTabs: payload.activeTabs }),
        }),
        updateSmartLinkModalState: (state, { payload }) => ({
            ...state,
            showSmartLink: payload,
        }),
        updateSmartLinkAutoAdd: (state, { payload }) => ({
            ...state,
            smartLinkAutoAdd: payload,
        }),
        updateDirtyState: (state, { payload }) => ({ ...state, isDirty: payload }),
        updateSmartLink: (state, { payload }) => ({
            ...state,
            smartLink: payload,
        }),
        updateTab: (state, { payload }) => {
            const { field, data } = payload;
            return {
                ...state,
                tabsState: {
                    ...state.tabsState,
                    [field]: data,
                },
            };
        },
        updateEmail: (state, { payload }) => ({
            ...state,
            mail: {
                ...state.mail,
                email: payload,
            },
        }),
        updateMessaging: (state, { payload: { field, data } }) => {
            return {
                ...state,
                messaging: {
                    ...state.messaging,
                    [field]: toSerializableState(data),
                },
            };
        },
        updateNotificationWeb: (state, { payload: { field, data, isFailure = false } }) => {
            return {
                ...state,
                notification: {
                    ...state.notification,
                    web: {
                        ...state.notification.web,
                        [field]:
                            field === 'audienceList' && !isFailure
                                ? [...data, ...state.notification.web.audienceList]
                                : data,
                    },
                },
            };
        },
        updateNotificationMobile: (state, { payload: { field, data, isFailure = false } }) => {
            return {
                ...state,
                notification: {
                    ...state.notification,
                    mobile: {
                        ...state.notification.mobile,
                        [field]:
                            field === 'audienceList' && !isFailure
                                ? [...data, ...state.notification.mobile.audienceList]
                                : data,
                    },
                },
            };
        },
        updateSocialPost: (state, { payload: { field, data } }) => {
            return {
                ...state,
                socialPost: {
                    ...state.socialPost,
                    [field]: data,
                },
            };
        },
        updateVoice: (state, { payload: { field, data } }) => {
            return {
                ...state,
                voice: {
                    ...state.voice,
                    [field]: data,
                },
            };
        },
        updateAds: (state, { payload: { field, data } }) => {
            return {
                ...state,
                ads: {
                    ...state.ads,
                    [field]: data,
                },
            };
        },
        updateQr: (state, { payload: { field, data } }) => {
            return {
                ...state,
                qr: {
                    ...state.qr,
                    url: {
                        ...state.qr.url,
                        [field]: data,
                    },
                },
            };
        },
        updateAnalytics: (state, { payload: { field, data } }) => {
            return {
                ...state,
                analytics: {
                    ...state.analytics,
                    [field]: data,
                },
            };
        },
        updateAudience: (state, { payload }) => ({ ...state, audience: [...payload, ...state.audience] }),
        updateFilterAudience: (state, { payload }) => ({ ...state, filterAudience: payload }),
        updatePersonaLization: (state, { payload }) => ({ ...state, personalization: payload }),
        updateListTypeWisePersonaLization: (state, { payload }) => {
            return {
                ...state,
                listTypeWisePersonlization: {
                    ...state.listTypeWisePersonlization,
                    [payload?.listType]: payload?.data,
                },
            };
        },
        updateUserList: (state, { payload }) => ({ ...state, userList: payload }),
        updateSmsList: (state, { payload }) => {
            const { data, field } = payload;
            return {
                ...state,
                smsList: {
                    ...state.smsList,
                    [field]: data,
                },
            };
        },
        updateWATemplateList: (state, { payload }) => {
            const { data, field } = payload;
            return {
                ...state,
                smsList: {
                    ...state.smsList,
                    [field]: { ...state.smsList?.[field], ...data },
                },
            };
        },
        updateEmailList: (state, { payload }) => {
            const { data, field } = payload;
            return {
                ...state,
                emailList: {
                    ...state.emailList,
                    [field]: data,
                },
            };
        },
        updateSpamScore: (state, { payload }) => {
            const { data, field } = payload;
            return {
                ...state,
                emailList: {
                    ...state.emailList,
                    checkSpam: {
                        ...state.emailList.checkSpam,
                        [field]: data,
                    },
                },
            };
        },
        updateVoiceList: (state, { payload }) => {
            const { data, field } = payload;
            return {
                ...state,
                voiceList: {
                    ...state.voiceList,
                    [field]: data,
                },
            };
        },
        resetVoiceList: (state, { payload }) => {
            return {
                ...state,
                voiceList: {
                    campaignDetails: payload,
                },
            };
        },
        updateDirectMailList: (state, { payload }) => {
            const { data, field, isReset = true } = payload;
            return {
                ...state,
                directMailList: {
                    ...state.directMailList,
                    [field]: isReset
                        ? { ...data }
                        : {
                              ...state.directMailList?.[field],
                              ...data,
                          },
                },
            };
        },
        updateVmsList: (state, { payload }) => {
            const { data, field } = payload;
            return {
                ...state,
                vmsList: {
                    ...state.vmsList,
                    [field]: data,
                },
            };
        },
        updateRCSEditorContent: (state, { payload }) => {
            const { data, reset } = payload;
            return {
                ...state,
                rcsList: {
                    ...state.rcsList,
                    editorContent: reset
                        ? { ...data }
                        : {
                            ...state.rcsList.editorContent,
                            ...data,
                          },
                },
            };
        },

        updateRCSList: (state, { payload }) => {
            const { data, field } = payload;
            return {
                ...state,
                rcsList: {
                    ...state.rcsList,
                    [field]: data,
                },
            };
        },
        resetRCSList: (state, payload) => {
            return {
                ...state,
                rcsList: initialState.rcsList,
            };
        },
        updateSocialMediaSetUp: (state, { payload }) => {
            const { data, field } = payload;
            return {
                ...state,
                socialMediaPost: {
                    ...state.socialMediaPost,
                    [field]: data,
                },
            };
        },

        updateWebAnalytics: (state, { payload }) => {
            const { data, field } = payload;
            return {
                ...state,
                WebAnalytics: {
                    ...state.WebAnalytics,
                    [field]: data,
                },
            };
        },
        updateVideoAnalytics: (state, { payload }) => {
            const { data, field } = payload;
            return {
                ...state,
                VideoAnalytics: {
                    ...state.VideoAnalytics,
                    [field]: data,
                },
            };
        },
        updateOfflineConversion: (state, { payload }) => {
            const { data, field } = payload;
            return {
                ...state,
                OfflineConversion: {
                    ...state.OfflineConversion,
                    [field]: data,
                },
            };
        },
        updateOfflineConversionAttributes: (state, { payload }) => {
            const { data, field } = payload;
            return {
                ...state,
                offlineConversionAttributes: {
                    ...state.offlineConversionAttributes,
                    [field]: data,
                },
            };
        },
        updateSmartLinkCreated: (state, { payload }) => ({
            ...state,
            isSmartLinkCreated: payload,
        }),
        resetCreateCommunication: () => ({ ...initialState }),
        // resetCreateCommunication: () => initialState,
        redirectToTab: (state, { payload }) => ({
            ...state,
            redirectionTab: payload,
        }),
        setTabforEdit: (state, { payload }) => ({
            ...state,
            selectedTabforEdit: payload,
        }),
        updateQREnableTab: (state, { payload }) => {
            return {
                ...state,
                enableTab: {
                    tabName: payload.tabName,
                    refreshStatus: payload.refreshStatus,
                },
            };
        },
        updateORMAnalytics: (state, { payload }) => {
            const { data, field } = payload;
            return {
                ...state,
                ORMAnalytics: {
                    ...state.ORMAnalytics,
                    [field]: data,
                },
            };
        },
        updateMDCEditMode: (state, { payload }) => {
            return {
                ...state,
                isMDCEditMode: payload,
            };
        },
        updateTotalAudienceCount: (state, { payload }) => {
            return {
                ...state,
                totalAudienceCount: payload,
            };
        },
    },
});

export const {
    setTabforEdit,
    redirectToTab,
    updateEmail,
    updateVerticalTab,
    updateTab,
    updateMessaging,
    updateNotificationWeb,
    updateNotificationMobile,
    updateSocialPost,
    updateAds,
    updateVoice,
    updateAnalytics,
    updateQr,
    updateSmartLink,
    updateSmartLinkModalState,
    updateSmartLinkAutoAdd,
    updateDirtyState,
    updateAudience,
    updateSmsList,
    updateEmailList,
    updateSpamScore,
    updatePersonaLization,
    updateVoiceList,
    updateVmsList,
    resetVoiceList,
    updateSocialMediaSetUp,
    updateUserList,
    updateWebAnalytics,
    updateORMAnalytics,
    resetCreateCommunication,
    updateVideoAnalytics,
    updateOfflineConversion,
    updateOfflineConversionAttributes,
    updateQREnableTab,
    updateFilterAudience,
    updateSmartLinkCreated,
    updateMDCEditMode,
    updateRCSList,
    resetRCSList,
    updateTotalAudienceCount,
    updateListTypeWisePersonaLization,
    updateWATemplateList,
    updateRCSEditorContent,
    updateDirectMailList,
} = createCommunicationReducer.actions;

export default createCommunicationReducer.reducer;

//Validate an email with regex and ignore all the url params in python
