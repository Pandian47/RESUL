import { createResulGenieHostRedux } from 'resul-genie-ui';

import { baseURL } from 'Constants/EndPoints';
import request from 'Utils/Http';
import userImg from 'Assets/Images/user.svg';

const host = createResulGenieHostRedux({
    post: (cfg) => request.post(cfg),
    baseURL,
    initialStateOptions: { defaultUserImg: userImg },
});

export default host.reducer;

export const {
    updatePrevPromptLoading,
    updateSearchInputRespond,
    updateSelectedChat,
    updateGenieChats,
    updateGenieNewID,
    resetGenie,
    updateGalleryPrompts,
    updategenieChatloading,
    updateEditedPromptNames,
    updateUI,
    updateChat,
    updateAudio,
    updateUser,
    updateSideNav,
    updateGlobalGenieLoading,
    updateSettings,
    updateWorkingsSegment,
    updateTokenUsage,
    updateInsights,
    updateInsightsLoading,
    updateListAttributes,
    updateThinkingStream,
    setThinkingStreamComplete,
    setThinkingStreamEnabled,
    clearThinkingStream,
    setStreamContextResolved,
} = host.actions;

export const {
    getGenieChatID,
    getGenieChat,
    getSelectedChat,
    getSearchInput,
    getgalleryPrompts,
    getTextToSpeech,
    getTokenUsages,
    getTokens,
    getWorkingsSegment,
    getAnalyticsWorkings,
    getInsights,
    getListAttributes,
    saveToTemplateGenie,
    getContextDetail,
    getVoiceToCorrectedText,
    getContextDetailRelated,
    UpdateChatRecordGenie,
    searchSampleRecord,
    getThinkingStream,
} = host.thunks;
