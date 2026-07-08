import { statusIdCheck, isCompletedCampaign, getCampaignStatusIdFromRoute } from 'Utils/modules/campaignUtils';
import { updateQueryParams } from 'Utils/modules/urlQuery';
import { isValidDate } from 'Utils/modules/uiToast';
import { convertUserTimezoneToTarget } from 'Utils/modules/dateTime';
import { getmasterData } from 'Utils/modules/masterData';
import { getUserDetails } from 'Utils/modules/crypto';
import { getEnvironment } from 'Utils/modules/environment';
import { numberWithCommas } from 'Utils/modules/formatters';
import { EDIT_CURLY_BRACES, PAST_COMMUNICATION_DURATION_SCHEDULE } from 'Constants/GlobalConstant/Placeholders';
import { alexa_large, app_store_large, calendar_large, circle_paid_media_large, circle_plus_fill_medium, circle_plus_medium, circle_question_mark_medium, email_large, email_list_large, google_home_large, ivr_large, map_large, messaging_large, messaging_rcs_large, mms_large, mobile_analytics_large, mobile_notification_large, mobile_sms_large, notification_large, offline_conversion_large, qrcode_large, qrcode_mini, sentiment_large, social_digipop_large, social_facebook_large, social_google_ad_large, social_instagram_large, social_line_large, social_linkedin_large, social_pinterest_large, social_post_large, social_twitter_large, social_viber_large, social_vms_large, social_vuer_large, social_whatsapp_large, text_document_large, user_call_center_large, user_large, video_share_large, voice_assistant_large, web_analytics_large, web_notification_large, webinar_large } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useMemo, useState } from 'react';
import moment from 'moment';

import DirectMail from './Tabs/DirectMail/DirectMail';
import Email from './Tabs/Email/Email.jsx';
import Messaging from './Tabs/Messaging/Messaging.jsx';
import Whatsapp from './Tabs/Whatsapp/Messaging.jsx';

import Mail from './pages/Mail/index.jsx';
import MessagingTab from './pages/Messaging/index.jsx';
import Voice from './pages/Voice';
import Notification from './pages/Notification';
import SocialPost from './pages/SocialPost';
import Ads from './pages/Ads';
import QR from './pages/QR';
import Analytics from './pages/Analytics';
import VMS from './Tabs/VMS';
import VoiceTab from './Tabs/Voice';
import AdsTab from './Tabs/Ads/Ads';
import DigipopCommunication from './Tabs/Ads/Digipop';
import QRContent from './Tabs/QR';
import SocialPostTab from './Tabs/SocialPost/SocialPost';
import NotificationTab from './Tabs/Notification/Notification';
import AnalticsWeb from './Tabs/Analytics/WebAnalytics/WebAnalytics';
import Sentiment from './Tabs/Analytics/Sentiment/Sentiment';
import AppAnalytics from './Tabs/Analytics/AppAnalytics/AppAnalytics';
import VideoAnalytics from './Tabs/Analytics/VideoAnalytics/VideoAnalytics';
import WebinarAnalytics from './Tabs/Analytics/WebinarAnalytics/WebinarAnalytics';
import OfflineConversion from './Tabs/Analytics/OfflineConversion/OfflineConversion';

import MobileNotification from './Tabs/MobileNotification/MobileNotification';
import { debounce,  get as _get,find as _find } from 'Utils/modules/lodashReplacements';
import {
    getAudienceList,
    getPersonalizationFields,
    getRecipientForNotification,
} from 'Reducers/communication/createCommunication/Create/request';
import { getRecipientList } from 'Reducers/communication/createCommunication/Mdc/Canvas/request';
import { AUTHORING_FIELD_LOADER_CONFIG } from 'Components/Skeleton/pages/communication/authoring';
import { setTabforEdit, updateTab, updateVerticalTab } from 'Reducers/communication/createCommunication/Create/reducer';
import RCS from './Tabs/RCS/RCS';
import { AUDIENCE, NEW_AUDIENCE_LIST, SELECT_SEGMENT_LIST } from 'Constants/GlobalConstant/Placeholders';
import { MORE_THAN_5_LISTS } from 'Constants/GlobalConstant/ValidationMessage';
import { useSelector, useDispatch } from 'react-redux';
import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
import { Col, Row } from 'react-bootstrap';
import { audienceListValidator } from 'Utils/HookFormValidate';
import RSConfirmationModal from 'Components/ConfirmationModal';
import { useNavigate } from 'react-router-dom';
import RSPPophover from 'Components/RSPPophover';
import { sourceAndChannelList } from '../MdcComponents/WorkFlow/constant.js';
import { getCustomizedReceipientList } from '../../../CreateCommunication/CreationSteps/MdcComponents/WorkFlow/Components/PotentialAudience/PotentialConst.js';
import { COMMUNICATION_AVAILABLE_TABS } from '../../communicationDefaults';

export const AUDIENCE_TOOLTIP_TEXT = (
    <Fragment>
        <ul className="rs-tooltip-text-multi">
            <li>
                <p className='d-inline-block font-bold fs13 mr5'>Known user:</p>
                <span>
                    Returning Visitor who has given consent but the generated token hasn't been associated with a brand
                    ID
                </span>
            </li>
            <li>
                <p className='d-inline-block font-bold fs13 mr5'>Identified:</p>
                <span>
                    Visitor who has given consent and the generated token has been associated with their brand ID
                </span>
            </li>
        </ul>
    </Fragment>
);

export const COMMUNICATION_CHANNEL_ID = {
    EMAIL: 1,
    WEB_NOTIFICATION: 8,
    MOBILE_NOTIFICATION: 14,
};

export function getSavedPushChannelFlagPayload(channelTypeOrId) {
    const raw =
        channelTypeOrId && typeof channelTypeOrId === 'object'
            ? channelTypeOrId?.type ?? channelTypeOrId?.channelType ?? channelTypeOrId?.channelId
            : channelTypeOrId;

    const value =
        typeof raw === 'string'
            ? raw.trim().toLowerCase()
            : raw != null
              ? Number(raw)
              : null;

    if (
        value === COMMUNICATION_CHANNEL_ID.WEB_NOTIFICATION ||
        value === 'web' ||
        value === 'webpush' ||
        value === 'web_push'
    ) {
        return { isSavedWebPushChannel: true,fromSource: 'communication' };
    }

    if (
        value === COMMUNICATION_CHANNEL_ID.MOBILE_NOTIFICATION ||
        value === 'mobile' ||
        value === 'mobilepush' ||
        value === 'mobile_push'
    ) {
        return { isSavedMobilePushChannel: true ,fromSource: 'communication'};
    }

    return {fromSource: 'communication'};
}

export function hasTemplateTabContent(tabState) {
    if (!tabState) return false;
    const tpl = tabState.templateContent;
    if (tpl != null && tpl !== '') {
        if (typeof tpl === 'string') return tpl.trim().length > 0;
        return true;
    }
    return false;
}

function hasMeaningfulTemplateEmail(tpl) {
    if (!tpl) return false;
    return typeof tpl === 'string' ? tpl.trim().length > 0 : true;
}

function isNotificationStyleChannelId(channelId) {
    return (
        channelId === COMMUNICATION_CHANNEL_ID.WEB_NOTIFICATION ||
        channelId === COMMUNICATION_CHANNEL_ID.MOBILE_NOTIFICATION
    );
}
export const shouldHandleEditCallApi = (location, savedChannel) => {
    if (!savedChannel) {
        return false;
    }
    const campaignType = _get(location, 'campaignType', 'S');
    if (campaignType === 'S' || campaignType === 'T') {
        return true;
    }
    return _get(location, 'mode', 'create') === 'edit';
};

const NOTIFICATION_CAROUSEL_TAB_TO_FORM_KEY = {
    cauroselA: 'splitA',
    cauroselB: 'splitB',
    cauroselC: 'splitC',
    cauroselD: 'splitD',
    carouselA: 'splitA',
    carouselB: 'splitB',
    carouselC: 'splitC',
    carouselD: 'splitD',
};

function resolveNotificationSplitFormKey(name) {
    if (!name || typeof name !== 'string') return '';
    return NOTIFICATION_CAROUSEL_TAB_TO_FORM_KEY[name] || name;
}

function notificationTabContentComplete(tab) {
    const currentTabIndex = tab?.currentTabIndex;
    const contentInput = tab?.contentInput;

    if (currentTabIndex === null || currentTabIndex === undefined) return false;
    if (currentTabIndex === 0) return true;

    const isImport = contentInput === 'import' || currentTabIndex === 1;
    if (isImport) {
        const importUrl = tab?.importUrl ?? '';
        const edmContent = tab?.edmContent;
        const zipFileText = tab?.zipFileText;
        return (
            (typeof importUrl === 'string' && importUrl.trim().length > 0) ||
            !!edmContent ||
            !!zipFileText
        );
    }

    const isTemplate = contentInput === 'template' || currentTabIndex === 2;
    if (isTemplate) return hasTemplateTabContent(tab);

    return false;
}

function emailSplitSliceComplete(tab) {
    const currentPage = tab?.currentPage;
    const edmContent = tab?.edmContent;
    const templateContent = tab?.templateContent;
    if (currentPage === null) return false;
    if (currentPage === 0) return true;
    const hasImportContent = currentPage === 1 && !!edmContent;
    return hasImportContent || !!templateContent;
}

function emailNonSplitComplete(formState) {
    const currentPage = formState?.currentPage;
    if (currentPage === 0) return true;
    const hasImportContent = currentPage === 1 && (formState?.edmContent ?? '') !== '';
    return hasImportContent || hasMeaningfulTemplateEmail(formState?.templateContent);
}

function splitModeByChannel(formState, channelId) {
    if (channelId === COMMUNICATION_CHANNEL_ID.EMAIL) {
        return !!formState?.splitTest;
    }
    return !!formState?.splitTest || formState?.layoutPosition?.value === 'Carousel';
}

function combinedSplitMode(formState) {
    return !!formState?.splitTest || formState?.layoutPosition?.value === 'Carousel';
}

function resolveSplitTabList(formState, optionsSplitTabList) {
    if (Array.isArray(optionsSplitTabList) && optionsSplitTabList.length > 0) {
        return optionsSplitTabList;
    }
    if (Array.isArray(formState?.splitTabList) && formState.splitTabList.length > 0) {
        return formState.splitTabList;
    }
    return null;
}

function resolveSplitFieldName(fieldName, splitTabList, { normalizeCarouselKeys = false } = {}) {
    const normalize = (key) => (normalizeCarouselKeys ? resolveNotificationSplitFormKey(key) : key);
    const name = typeof fieldName === 'string' ? normalize(fieldName) : '';
    const normalizedList = splitTabList?.length ? splitTabList.map((tab) => normalize(tab)) : null;
    if (name) {
        if (normalizedList?.length && !normalizedList.includes(name)) {
            return { field: '', invalid: true };
        }
        return { field: name, invalid: false };
    }
    if (normalizedList?.length) {
        return { field: normalizedList?.[0], invalid: false };
    }
    return { field: '', invalid: false };
}
export function getContentSetupStatus(formState, fieldName = '', options = {}) {
    const rawId = options.channelId;
    const channelId = rawId != null ? Number(rawId) : null;

    if (channelId == null || Number.isNaN(channelId)) {
        return typeof options.resolveContentComplete === 'function'
            ? !!options.resolveContentComplete(formState, fieldName, {
                  isSplit: combinedSplitMode(formState),
                  channelId: NaN,
              })
            : false;
    }

    const isSplit = splitModeByChannel(formState, channelId);
    const splitTabList = resolveSplitTabList(formState, options.splitTabList);
    const normalizeCarouselKeys = isNotificationStyleChannelId(channelId);
    const { field: splitField, invalid: splitFieldInvalid } = resolveSplitFieldName(fieldName, splitTabList, {
        normalizeCarouselKeys,
    });

    if (isSplit && splitFieldInvalid) {
        return false;
    }

    if (channelId === COMMUNICATION_CHANNEL_ID.EMAIL) {
        if (!isSplit) return emailNonSplitComplete(formState);
        if (!splitField) return false;
        return emailSplitSliceComplete(formState?.[splitField]);
    }

    if (isNotificationStyleChannelId(channelId)) {
        if (isSplit) {
            const key = resolveNotificationSplitFormKey(splitField || fieldName);
            if (!key) return false;
            return notificationTabContentComplete(formState?.[key]);
        }
        return notificationTabContentComplete(formState);
    }

    return typeof options.resolveContentComplete === 'function'
        ? !!options.resolveContentComplete(formState, fieldName, { isSplit, channelId })
        : false;
}

export const getContentStatus = getContentSetupStatus;

/**
 * Builds/merges channel audiences for communication plan reducer.
 * Use when saving a campaign: store audience per channel as { Email: [...], SMS: [...], Whatsapp: [] }.
 * @param {string} channelKey - Channel name: 'Email' | 'SMS' | 'Whatsapp'
 * @param {Array} audienceList - Selected audience list for this channel
 * @param {Object} existingChannelAudiences - Current channelAudiences from reducer
 * @returns {Object} New channelAudiences to dispatch (updateChannelAudiences)
 */
export const mergeChannelAudiences = (channelKey, audienceList, existingChannelAudiences = {}) => {
    const list = Array.isArray(audienceList) ? audienceList : [];
    return {
        ...existingChannelAudiences,
        [channelKey]: list,
    };
};

/**
 * Returns true if every audience across all channels in channelAudiences is Adhoc list (listType === 1).
 * Used to disable Offline Conversion tab in Analytics when all selected audiences are adhoc.
 * @param {Object} channelAudiences - { Email: [...], SMS: [...], Whatsapp: [] } from plan reducer
 * @returns {boolean} true = all adhoc (disable offline conversion); false = mixed or no audiences (keep tab as-is)
 */
export const areAllChannelAudiencesAdhoc = (channelAudiences = {}) => {
    if (!channelAudiences || typeof channelAudiences !== 'object') return false;
    const allAudiences = Object.values(channelAudiences).flat();
    if (allAudiences.length === 0) return false;
    return allAudiences.every((aud) => Number(aud?.listType) === 1);
};

/**
 * Returns true when there is a mismatched audience selection across channels (e.g. one channel has target list, another has adhoc).
 * Used to show the Offline Conversion info modal when user has 2+ audiences and at least one is adhoc (listType === 1).
 * @param {Object} channelAudiences - { Email: [...], SMS: [...], ... } from plan reducer
 * @returns {boolean}
 */
export const hasMismatchedChannelAudienceForOfflineConversion = (channelAudiences = {}) => {
    if (!channelAudiences || typeof channelAudiences !== 'object') return false;
    const allAudiences = Object.values(channelAudiences).flat();
    if (allAudiences.length < 2) return false;
    return allAudiences.some((aud) => Number(aud?.listType) === 1);
};

export const formatDateScheculer = (day) => {
    return moment(day).format('YYYY-MM-DD HH:mm:ss');
};

export const PAST_PLAN_DURATION_ERROR_TYPE = 'pastDuration';
export const PAST_PLAN_DURATION_CLICK_OFF_CLASS = 'pe-none click-off';

const getProfileTimezoneGmtOffset = () => {
    const { timeZoneId } = getUserDetails();
    const { timeZoneList } = getmasterData();
    return _find(timeZoneList, ['timeZoneID', timeZoneId])?.gmtOffset;
};

export const isPastCommunicationPlanDuration = ({
    campaignType,
    startDate,
    endDate,
    selectedGmtOffset,
    profileGmtOffset,
    currentUtcTime,
}) => {
    if (campaignType === 'T' || !startDate || !endDate) return false;

    const referenceTime = currentUtcTime
        ? new Date(String(currentUtcTime).replace('Z', ''))
        : new Date();
    const resolvedSelectedGmtOffset = selectedGmtOffset || profileGmtOffset || '(GMT) ';
    const resolvedProfileGmtOffset = profileGmtOffset || resolvedSelectedGmtOffset;

    const convertedNowInSelectedTz = convertUserTimezoneToTarget(
        referenceTime,
        '(GMT) ',
        resolvedSelectedGmtOffset,
        false,
    );
    const currentDateOnly = new Date(
        convertedNowInSelectedTz.getFullYear(),
        convertedNowInSelectedTz.getMonth(),
        convertedNowInSelectedTz.getDate(),
    );

    const getPlanDateOnly = (dateStr) => {
        const parsedDate = new Date(`${dateStr}T00:00:00`);
        if (resolvedSelectedGmtOffset && resolvedProfileGmtOffset) {
            const adjustedDate = convertUserTimezoneToTarget(
                parsedDate,
                resolvedProfileGmtOffset,
                resolvedSelectedGmtOffset,
                false,
            );
            return new Date(
                adjustedDate.getFullYear(),
                adjustedDate.getMonth(),
                adjustedDate.getDate(),
            );
        }
        parsedDate.setHours(0, 0, 0, 0);
        return parsedDate;
    };

    const planStartDateOnly = getPlanDateOnly(startDate);
    const planEndDateOnly = getPlanDateOnly(endDate);

    return (
        planStartDateOnly.getTime() < currentDateOnly.getTime() &&
        planEndDateOnly.getTime() < currentDateOnly.getTime()
    );
};

export const getPastPlanDurationBlockedState = ({ location = {}, timezone, currentUtcTime } = {}) => {
    if (isCompletedCampaign(getCampaignStatusIdFromRoute())) {
        return false;
    }
    const profileGmtOffset = getProfileTimezoneGmtOffset();
    return isPastCommunicationPlanDuration({
        campaignType: location?.campaignType,
        startDate: location?.startDate,
        endDate: location?.endDate,
        selectedGmtOffset: timezone?.gmtOffset || profileGmtOffset,
        profileGmtOffset,
        currentUtcTime,
    });
};

export const validatePastPlanDurationOnSubmit = ({
    location = {},
    formState = {},
    setError,
    currentUtcTime,
    splitTest = false,
    splitTabList = [],
}) => {
    if (isCompletedCampaign(getCampaignStatusIdFromRoute())) {
        return false;
    }
    const profileGmtOffset = getProfileTimezoneGmtOffset();
    const isPast = isPastCommunicationPlanDuration({
        campaignType: location?.campaignType,
        startDate: location?.startDate,
        endDate: location?.endDate,
        selectedGmtOffset: formState?.timezone?.gmtOffset || profileGmtOffset,
        profileGmtOffset,
        currentUtcTime,
    });

    if (!isPast) return false;

    const errorPayload = {
        type: PAST_PLAN_DURATION_ERROR_TYPE,
        message: PAST_COMMUNICATION_DURATION_SCHEDULE,
    };

    if (splitTest && splitTabList?.length) {
        splitTabList.forEach((tab) => setError(`${tab}.schedule`, errorPayload));
    } else {
        setError('schedule', errorPayload);
    }

    return true;
};

export const getChanelName = (id) => {
    switch (id) {
        case 1:
            return 'email';
        case 2:
            return 'messaging';
        case 21:
            return 'messaging';
        case 41:
            return 'messaging';
        case 8:
            return 'notifications';
        case 14:
            return 'notifications';
        case 7:
            return 'socialpost';
        case 26:
            return 'voice';
        case 10:
            return 'ads';
        case 3:
            return 'qr';
        default:
            return '';
    }
};

export const availableTabs = COMMUNICATION_AVAILABLE_TABS;
export const communicationChannels = [
    'email',
    'messaging',
    'notifications',
    'socialpost',
    'voice',
    'ads',
    'qr',
    'analytics',
];

const SOCIAL_POST_REMOTE_SOURCE_TAB_MAP = {
    24: 'facebook',
    26: 'twitter',
    82: 'pinterest',
    83: 'linked in',
    85: 'instagram',
};

export const SOCIAL_POST_REFRESH_POST_ON_LIST_KEY = 'socialPostRefreshPostOnList';

export const navigateBackToCommunicationSocialPost = (dispatch, navigate, queries = {}) => {
    const tabValueName = 'socialPost';
    const verticalTabIndex = VERTICAL_TAB_CONFIG.findIndex((tab) => tab.id === 'socialpost');
    const selectedArray = availableTabs[tabValueName] || [];
    const selectedTabName =
        SOCIAL_POST_REMOTE_SOURCE_TAB_MAP[Number(queries?.remoteDataSourceID)] || selectedArray[0];
    const tabIndex = Math.max(selectedArray.indexOf(selectedTabName), 0);
    const resolvedVerticalTab = verticalTabIndex >= 0 ? verticalTabIndex : 3;

    dispatch(
        updateVerticalTab({
            tabs: {
                type: 'socialpost',
                currentTab: resolvedVerticalTab,
            },
        }),
    );
    dispatch(
        setTabforEdit({
            type: 'socialpost',
            currentTab: resolvedVerticalTab,
        }),
    );
    dispatch(
        updateTab({
            field: tabValueName,
            data: {
                tabName: selectedArray[tabIndex] ?? selectedTabName,
                currentIndex: tabIndex,
            },
        }),
    );
    localStorage.setItem(SOCIAL_POST_REFRESH_POST_ON_LIST_KEY, 'true');
    navigate('/communication/create-communication' + (queries?.backPath || ''));
    localStorage.removeItem('socialPostQuery');
};

export const normalizeTabName = (name = '') => name?.replace(/\s+/g, '').toLowerCase();

export const MESSAGING_TAB_CHANNEL_MAP = {
    sms: 2,
    whatsapp: 21,
    rcs: 41,
};

export const NOTIFICATION_TAB_CHANNEL_MAP = {
    web: 8,
    mobile: 14,
};

export const EMAIL_TAB_CHANNEL_MAP = {
    email: 1,
    directmail: 33,
};

export const getNextEligibleTabIndex = ({
    startIndex = 0,
    availableTabList = [],
    eligibleChannelIds = [],
    tabChannelMap = {},
    campaignType,
}) => {
    const hasEligibleFilter =
        campaignType === 'T' && Array.isArray(eligibleChannelIds) && eligibleChannelIds.length > 0;

    const isEventTriggerWithoutFilter = campaignType === 'T' && !hasEligibleFilter;

    if (!hasEligibleFilter && !isEventTriggerWithoutFilter && !(eligibleChannelIds?.includes(8) || eligibleChannelIds?.includes(14))) return startIndex;

    for (let index = startIndex; index < availableTabList?.length; index++) {
        const tabName = availableTabList[index];
        const normalizedTabName = normalizeTabName(tabName);
        const channelId = tabChannelMap?.[normalizedTabName];

        // For Event Trigger without filter, skip Direct Mail (channel 33)
        if (isEventTriggerWithoutFilter) {
            if (channelId !== 33) {
                return index;
            }
        } else if (!channelId || eligibleChannelIds.includes(channelId)) {
            return index;
        }
    }

    return availableTabList?.length ?? startIndex;
};

export const VERTICAL_TAB_CONFIG = [
    {
        id: 'email',
        text: `${'Email'}`,
        iconLeft: `${email_large} icon-lg`,
        component: () => <Mail key={'createMail'} />,
    },
    {
        id: 'messaging',
        text: 'Messaging',
        iconLeft: `${messaging_large} icon-lg`,
        component: () => <MessagingTab key={'createMessaging'} />,
    },

    {
        id: 'notifications',
        text: 'Notification',
        iconLeft: `${notification_large} icon-lg`,
        component: () => <Notification key={'createNotification'} />,
    },

    {
        id: 'socialpost',
        text: 'Social post',
        iconLeft: `${social_post_large} icon-lg`,
        component: () => <SocialPost key={'createSocialPost'} />,
    },

    {
        id: 'voice',
        text: 'Voice',
        iconLeft: `${voice_assistant_large} icon-lg`,
        component: () => <Voice key={'createVoice'} />,
    },

    {
        id: 'ads',
        text: 'Ad',
        iconLeft: `${circle_paid_media_large} icon-lg`,
        component: () => <Ads key={'createAds'} />,
    },

    {
        id: 'qr',
        text: 'QR',
        iconLeft: `${qrcode_large} icon-lg`,
        component: () => <QR key={'createQr'} />,
    },

    {
        id: 'analytics',
        text: 'Analytics',
        iconLeft: `${web_analytics_large} icon-lg`,
        component: () => <Analytics key={'createAnalytics'} />,
    },
];

export const MAIL_TAB_CONFIG = [
    { id: 'email', text: 'Email', icon: `${email_large} icon-lg color-primary-blue`, component: () => <Email /> },
    {
        id: 'directMail',
        text: 'Direct mail',
        icon: `${email_list_large} icon-lg color-primary-blue`,
        component: () => <DirectMail />,
        disable: false,
    },
];
export const NO_PRE_CAMPAIGN = [3,33, 26, 10, 7];

export const getPreCampaignStatus = (savedChannelId) => {
    let channelIds = [];
    for (let key in savedChannelId) {
        const id = Number(key);
        if (id !== 6 && id !== 16) {
            channelIds.push(id);
        }
    }
    if (channelIds?.length === 0) {
        return false;
    }
    let status = true;
    for (let i = 0; i < channelIds?.length; i++) {
        if (!NO_PRE_CAMPAIGN.includes(channelIds[i])) {
            status = false;
            break;
        }
    }
    return status;
};

export const MESSAGING_TAB_CONFIG = [
    {
        id: 'sms',
        text: 'SMS',
        icon: `${mobile_sms_large} icon-lg color-primary-blue`,
        component: () => <Messaging type="sms" channelId={2} />,
    },

    {
        id: 'whatsapp',
        text: 'WhatsApp',
        icon: `${social_whatsapp_large} icon-lg color-primary-blue`,
        component: () => <Whatsapp type="whatsapp" key={'Whatsapp'} channelId={21} />,
    },
    // {
    //     id: 'whatsapp',
    //     text: 'WhatsApp_New',
    //     icon: `${social_whatsapp_large} icon-lg color-primary-blue`,
    //     component: () => <Messaging_New type="whatsapp" key={'Whatsapp'} channelId={21} />,
    //     //disable: true,
    // },
    {
        id: 'vms',
        text: 'VMS',
        icon: `${social_vms_large} icon-lg color-primary-blue`,
        component: () => <VMS channelId={25} />,
    },
    {
        id: 'rcs',
        text: 'RCS',
        icon: `${messaging_rcs_large} icon-lg color-primary-blue`,
        component: () => <RCS channelId={41} />,
    },
    // {
    //     id: 'line',
    //     text: 'Line',
    //     icon: `${social_line_large} icon-lg color-primary-blue`,
    //     component: () => <Messaging type="line" key={'Line'} />,
    //     disable: true,
    // },
    // {
    //     id: 'mms',
    //     text: 'MMS',
    //     icon: `${mms_large} icon-lg color-primary-blue`,
    //     component: () => <Messaging type="MMS" key={'MMS'} />,
    //     disable: true,
    // },
    // {
    //     id: 'viber',
    //     text: 'Viber',
    //     icon: `${social_viber_large} icon-lg color-primary-blue`,
    //     component: () => <Messaging type="Viber" key={'Viber'} />,
    //     disable: true,
    // },
];

export const VOICE_TAB_CONFIG = [
    {
        id: 'callCenter',
        text: 'Call center',
        icon: `${user_call_center_large} icon-lg color-primary-blue`,
        component: () => <VoiceTab type="callCenter" />,
    },

    // {
    //     id: 'vms',
    //     text: 'VMS',
    //     icon: `${voice_assistant_large} icon-lg color-primary-blue`,
    //     component: () => <VMS />,
    // },
    // {
    //     id: 'IVR',
    //     text: 'IVR',
    //     icon: `${ivr_large} icon-lg color-primary-blue`,
    //     component:() => <VoiceTab type="IVR" />,
    // },

    // {
    //     id: 'Alexa',
    //     text: 'Alexa',
    //     icon: `${alexa_large} icon-lg color-primary-blue`,
    //     component:() => <VoiceTab type="ALEXA" />,
    // },
    // {
    //     id: 'Google home',
    //     text: 'Google home',
    //     icon: `${google_home_large} icon-lg color-primary-blue`,
    //     component:() => <VoiceTab type="GOOGLE_HOME" />,
    // },
];

export const NOTIFICATION_TAB_CONFIG = [
    {
        id: 'web',
        text: 'Web',
        notifyType: 6,
        icon: `${web_notification_large} icon-lg color-primary-blue`,
        component: () => <NotificationTab type="web" />,
        disable: true,
    },
    {
        id: 'mobile',
        text: 'Mobile',
        notifyType: 16,
        icon: `${mobile_notification_large} icon-lg color-primary-blue`,
        // component: () => <NotificationTab type="mobile" />,
        component: () => <MobileNotification />,
        disable: true,
    },
];

export const SOCIAL_POST_TAB_CONFIG = [
    {
        id: 'facebook',
        text: 'Facebook',
        icon: `${social_facebook_large} icon-lg color-primary-blue`,
        component: () => <SocialPostTab type="facebook" subChannelId={1} />,
    },
    {
        id: 'twitter',
        text: 'X',
        icon: `${social_twitter_large} icon-lg color-primary-blue`,
        component: () => <SocialPostTab type="twitter" subChannelId={3} />,
    },

    {
        id: 'instagram',
        text: 'Instagram',
        icon: `${social_instagram_large} icon-lg color-primary-blue`,
        component: () => <SocialPostTab type="instagram" subChannelId={6} />,
    },
    {
        id: 'linkedIn',
        text: 'LinkedIn',
        icon: `${social_linkedin_large} icon-lg color-primary-blue`,
        component: () => <SocialPostTab type="linkedIn" subChannelId={8} />,
        // disable: true,
    },
    {
        id: 'pinterest',
        text: 'Pinterest',
        icon: `${social_pinterest_large} icon-lg color-primary-blue`,
        component: () => <SocialPostTab type="pinterest" subChannelId={5} />,
    },
];

export const ADS_TAB_CONFIG = () => {
    const currentUserDetail = getUserDetails();
    return [
        // {
        //     id: 'DMP',
        //     text: 'DMP',
        //     icon: `${google_home_large} icon-lg`,
        //     component: 'DMP',
        // },
        {
            id: 'google',
            text: 'Google',
            icon: `${social_google_ad_large} icon-lg color-primary-blue`,
            component: () => <AdsTab type="google" isMutiField typeId={1} />,
        },
        {
            id: 'facebook',
            text: 'Facebook',
            icon: `${social_facebook_large} icon-lg color-primary-blue`,
            component: () => <AdsTab type="facebook" isMutiField typeId={2} />,
        },
        {
            id: 'twitter',
            text: 'X',
            icon: `${social_twitter_large} icon-lg color-primary-blue`,
            component: () => <AdsTab type="twitter" isMutiField typeId={3} />,
        },
        {
            id: 'linkedIn',
            text: 'LinkedIn',
            icon: `${social_linkedin_large} icon-lg color-primary-blue`,
            component: () => <AdsTab type="linkedIn" isMutiField typeId={4} />,
        },
        // {
        //     id: 'vuer',
        //     text: 'Vuer',
        //     icon: `${social_vuer_large} icon-lg color-primary-blue`,
        //     component: () => <AdsTab type="vue" isMutiField typeId={6} />,
        // },
        {
            id: 'digipop',
            text: 'Digipop',
            icon: `${social_digipop_large} icon-lg color-primary-blue`,
            component: () => <DigipopCommunication type="digipop" />,
            disable: currentUserDetail?.ispartnerDigipop ? false : true,
        },
    ];
};

export const QR_TAB_CONFIG = [
    {
        id: 'url',
        text: 'URL',
        disable: false,
        icon: `${user_large} icon-lg color-primary-blue`,
        component: () => <QRContent tab={'url'} />,
    },
    {
        id: 'facebook',
        text: 'Facebook',
        disable: true,
        icon: `${social_facebook_large} icon-lg color-primary-blue`,
        component: () => <QRContent tab={'facebook'} />,
    },
    {
        id: 'twitter',
        text: 'X',
        disable: true,
        icon: `${social_twitter_large} icon-lg color-primary-blue`,
        component: () => <QRContent tab={'twitter'} />,
    },

    {
        id: 'text',
        text: 'Text',
        disable: true,
        icon: `${text_document_large} icon-lg color-primary-blue`,
        component: () => <QRContent tab={'text'} />,
    },
    {
        id: 'sms',
        text: 'SMS',
        disable: false,
        icon: `${mobile_sms_large} icon-lg color-primary-blue`,
        component: () => <QRContent tab={'sms'} />,
    },
    // {
    //     id: 'email',
    //     text: 'Email',
    //     icon: `${email_large} icon-lg color-primary-blue`,
    //     component: () => <QRContent tab={'email'} />,
    // },
    {
        id: 'maps',
        text: 'Maps',
        icon: `${map_large} icon-lg color-primary-blue`,
        component: () => <QRContent tab={'maps'} />,
        disable: true,
    },
    {
        id: 'appStore',
        text: 'App store',
        icon: `${app_store_large} icon-lg color-primary-blue`,
        component: () => <QRContent tab={'appStore'} />,
        disable: true,
    },
    {
        id: 'calender',
        text: 'Calender',
        icon: `${calendar_large} icon-lg color-primary-blue`,
        component: () => <QRContent tab={'calendar'} />,
        disable: true,
    },
];

export const UPDATE_QR_TAB_CONFIG = (tab) => {
    const updateQrTab = QR_TAB_CONFIG?.map((currentTab) => {
        if (currentTab.id === tab) {
            return { ...currentTab, disable: false };
        } else {
            return { ...currentTab, disable: true };
        }
    });
    return updateQrTab;
};

export const ANALYTICS_TAB_CONFIG = [
    {
        id: 'web analytics',
        text: 'Web',
        icon: `${web_analytics_large} icon-lg color-primary-blue`,
        component: () => <AnalticsWeb />,
        disable: false,
    },
    {
        id: 'app',
        text: 'App analytics',
        icon: `${mobile_analytics_large} icon-lg color-primary-blue`,
        component: () => <AppAnalytics />,
        disable: false,
    },
    {
        id: 'offlineConversion',
        text: 'Offline conversion',
        icon: `${offline_conversion_large} icon-lg color-primary-blue`,
        component: () => <OfflineConversion />,
        disable: false,
    },
    // {
    //     id: 'social',
    //     text: 'Social',
    //     icon: `${qrcode_mini} icon-lg color-primary-blue`,
    //     component: () => <AnalticsSocial />,
    //     disable: true,
    // },
    {
        id: 'orm',
        text: 'Sentiment',
        icon: `${sentiment_large} icon-lg color-primary-blue`,
        component: () => <Sentiment />,
        disable: false,
    },
    {
        id: 'video',
        text: 'Video',
        icon: `${video_share_large} icon-lg color-primary-blue`,
        component: () => <VideoAnalytics />,
        disable: false,
    },
    {
        id: 'events',
        text: 'Events',
        icon: `${webinar_large} icon-lg color-primary-blue`,
        component: () => <WebinarAnalytics />,
        disable: true,
    },
];

export function getCreateCommSubTabMaxIndex(tabsStateField) {
    switch (tabsStateField) {
        case 'email':
            return getEnvironment() === 'RUN' ? 0 : MAIL_TAB_CONFIG.length - 1;
        case 'messaging':
            return MESSAGING_TAB_CONFIG.length - 1;
        case 'notification':
            return NOTIFICATION_TAB_CONFIG.length - 1;
        case 'socialPost':
            return SOCIAL_POST_TAB_CONFIG.length - 1;
        case 'voice':
            return VOICE_TAB_CONFIG.length - 1;
        case 'ads':
            return Math.max(0, ADS_TAB_CONFIG().length - 1);
        case 'qr':
            return QR_TAB_CONFIG.length - 1;
        case 'analytics':
            return ANALYTICS_TAB_CONFIG.length - 1;
        default:
            return 0;
    }
}

export function isSharedCreateCommIndexForeignToVertical(
    targetField,
    rawIndex,
    tabsState,
    targetReduxIndex,
) {
    const rawNum = Number(rawIndex);
    const targetIdx = Number(targetReduxIndex);
    const maxTarget = getCreateCommSubTabMaxIndex(targetField);
    if (!Number.isFinite(rawNum) || rawNum < 0 || rawNum > maxTarget) return false;
    if (rawNum === targetIdx) return false;
    for (const key of Object.keys(tabsState || {})) {
        if (key === targetField) continue;
        const maxForKey = getCreateCommSubTabMaxIndex(key);
        if (!Number.isFinite(maxForKey) || rawNum > maxForKey) continue;
        const other = Number(tabsState[key]?.currentIndex);
        if (Number.isFinite(other) && other === rawNum) {
            return true;
        }
    }
    return false;
}

export const CREATE_COMM_NOTIFICATION_VERTICAL_TYPE = 'notification';

export function getCreateCommNotificationSubTabIndexFromEditSource(mainChannelId, _subChannelId = 0) {
    const main = Number(mainChannelId);
    if (!Number.isFinite(main)) return null;
    if (main === 8) return 0;
    if (main === 14) return 1;
    return null;
}

function hasExplicitNotificationSubTabIntent(location) {
    const search = typeof window !== 'undefined' ? window.location.search : '';
    const params = new URLSearchParams(search);
    const channelIdParam = params.get('channelId');
    const typeIdParam = params.get('typeId');
    return channelIdParam === '8' || channelIdParam === '14' || Boolean(typeIdParam?.length);
}

/** True when edit opened from a non-notification channel — location.currentIndex is another vertical's sub-tab. */
function isLocationIndexPollutedByNonNotificationEdit(location) {
    const mainEdit = Number(_get(location, 'editSourceChannelId', NaN));
    if (!Number.isFinite(mainEdit) || mainEdit === 8 || mainEdit === 14) return false;
    return !hasExplicitNotificationSubTabIntent(location);
}

/** Default Web (0) vs Mobile (1) from plan analyticsTypes (6/16) or saved channel ids (8/14). */
export function getDefaultNotificationSubTabIndexFromPlan(location) {
    const analyticsTypes = _get(location, 'analyticsTypes', []) || [];
    const channels = _get(location, 'channels', []) || [];
    const hasWeb = analyticsTypes.includes(6) || channels.includes(8);
    const hasMobile = analyticsTypes.includes(16) || channels.includes(14);
    if (hasWeb && !hasMobile) return 0;
    if (hasMobile && !hasWeb) return 1;
    return 0;
}

/** When plan allows only Web or only Mobile, snap index to that tab (create + edit). */
export function coerceNotificationSubTabIndexToPlan(fromIndex, location) {
    const analyticsTypes = _get(location, 'analyticsTypes', []) || [];
    const channels = _get(location, 'channels', []) || [];
    const hasWeb = analyticsTypes.includes(6) || channels.includes(8);
    const hasMobile = analyticsTypes.includes(16) || channels.includes(14);

    if (hasWeb && !hasMobile) return 0;
    if (hasMobile && !hasWeb) return 1;

    const idx = Number(fromIndex);
    if (!Number.isNaN(idx) && idx >= 0 && idx <= NOTIFICATION_TAB_CONFIG.length - 1) {
        return idx;
    }
    return getDefaultNotificationSubTabIndexFromPlan(location);
}

function peekCreateCommNotificationRawIndexFromLocation(location) {
    const search = typeof window !== 'undefined' ? window.location.search : '';
    const qparam = new URLSearchParams(search);
    let raw =
        qparam.get('typeId')?.length > 0 ? parseInt(qparam.get('typeId'), 10) : _get(location, 'currentIndex', null);
    const params = new URLSearchParams(search);
    const channelIdParam = params.get('channelId');
    if (channelIdParam) {
        raw = channelIdParam == 8 ? 0 : channelIdParam == 14 ? 1 : raw;
    }
    return raw;
}

export function resolveNotificationSubTabIndexFromSharedState({
    location,
    tabsState,
    notificationReduxIndex,
    verticalTabType = CREATE_COMM_NOTIFICATION_VERTICAL_TYPE,
} = {}) {
    const mainEdit = Number(_get(location, 'editSourceChannelId', NaN));
    const subEdit = Number(_get(location, 'editSourceSubChannelId', 0)) || 0;
    const isEditNotificationChannel = Number.isFinite(mainEdit) && (mainEdit === 8 || mainEdit === 14);
    const indexPollutedByEdit = isLocationIndexPollutedByNonNotificationEdit(location);

    const rawLocationCurrentIndex = _get(location, 'currentIndex', null);
    const peekRaw = peekCreateCommNotificationRawIndexFromLocation(location);
    const peekNum = Number(peekRaw);
    const maxNotificationIdx = NOTIFICATION_TAB_CONFIG.length - 1;
    const peekOutOfRange =
        peekRaw == null || Number.isNaN(peekNum) || peekNum < 0 || peekNum > maxNotificationIdx;
    const peekInRange =
        peekRaw != null && !Number.isNaN(peekNum) && peekNum >= 0 && peekNum <= maxNotificationIdx;
    const peekForeign =
        verticalTabType === CREATE_COMM_NOTIFICATION_VERTICAL_TYPE &&
        peekInRange &&
        (indexPollutedByEdit ||
            isSharedCreateCommIndexForeignToVertical('notification', peekNum, tabsState, notificationReduxIndex));

    if (verticalTabType === CREATE_COMM_NOTIFICATION_VERTICAL_TYPE && isEditNotificationChannel) {
        const fromEdit = getCreateCommNotificationSubTabIndexFromEditSource(mainEdit, subEdit);
        if (fromEdit != null && (peekOutOfRange || peekForeign)) {
            return {
                fromIndex: fromEdit,
                rawLocationCurrentIndex,
                channelId: null,
                usedEditSource: true,
            };
        }
    }

    const search = typeof window !== 'undefined' ? window.location.search : '';
    const qparam = new URLSearchParams(search);
    let fromIndex =
        qparam.get('typeId')?.length > 0 ? parseInt(qparam.get('typeId'), 10) : rawLocationCurrentIndex;
    const params = new URLSearchParams(search);
    const channelId = params.get('channelId');
    if (channelId) {
        fromIndex = channelId == 8 ? 0 : channelId == 14 ? 1 : fromIndex;
    }
    const rawNum = Number(fromIndex);
    const inNotificationRange =
        fromIndex != null && !Number.isNaN(rawNum) && rawNum >= 0 && rawNum <= maxNotificationIdx;
    const sharedForeign =
        verticalTabType === CREATE_COMM_NOTIFICATION_VERTICAL_TYPE &&
        inNotificationRange &&
        (indexPollutedByEdit ||
            isSharedCreateCommIndexForeignToVertical('notification', rawNum, tabsState, notificationReduxIndex));
    if (
        fromIndex == null ||
        Number.isNaN(rawNum) ||
        rawNum < 0 ||
        rawNum > maxNotificationIdx ||
        sharedForeign
    ) {
        const planDefault = getDefaultNotificationSubTabIndexFromPlan(location);
        const analyticsTypes = _get(location, 'analyticsTypes', []) || [];
        const channels = _get(location, 'channels', []) || [];
        const hasWeb = analyticsTypes.includes(6) || channels.includes(8);
        const hasMobile = analyticsTypes.includes(16) || channels.includes(14);
        const planAllowsBoth = hasWeb && hasMobile;

        if (planAllowsBoth) {
            const reduxIdx = Number(notificationReduxIndex);
            if (Number.isFinite(reduxIdx) && reduxIdx >= 0 && reduxIdx <= maxNotificationIdx) {
                fromIndex = reduxIdx;
            } else {
                fromIndex = planDefault;
            }
        } else {
            fromIndex = planDefault;
        }
    }

    fromIndex = coerceNotificationSubTabIndexToPlan(fromIndex, location);

    return {
        fromIndex: Number(fromIndex),
        rawLocationCurrentIndex,
        channelId,
        usedEditSource: false,
    };
}

export const SPLIT_AB_NAME = {
    0: {
        id: 'splitA',
        text: 'Split A',
        color: 'red',
    },
    1: {
        id: 'splitB',
        text: 'Split B',
        add: circle_plus_medium,
        color: 'blue',
    },
    2: {
        id: 'splitC',
        text: 'Split C',
        add: circle_plus_medium,
    },
    3: {
        id: 'splitD',
        text: 'Split D',
    },
};

export const calculateDefaultSplittedCount = (tabsCount, audienceCount, splitTabsList = []) => {
    if (!tabsCount || !audienceCount || tabsCount < 2) {
        return {};
    }

    const calculateCount = audienceCount * 0.2;
    const countPerTab = calculateCount / tabsCount;
    const percentage = Math.round((calculateCount / audienceCount / tabsCount) * 100);

    const baseWidth = 980;
    const calculateWidth = baseWidth * (0.2 / tabsCount);
    const width = Math.round(calculateWidth);

    // Default split tabs if not provided
    const defaultTabs = ['splitA', 'splitB'];
    const tabs = splitTabsList.length > 0 ? splitTabsList : defaultTabs.slice(0, tabsCount);

    return {
        count: countPerTab,
        totalCount: calculateCount,
        tabs,
        audienceCount,
        percentage,
        width,
    };
};

export const sumAudienceRecipientCount = (audienceList = [], countField = 'recipientCountWebPush') =>
    (Array.isArray(audienceList) ? audienceList : []).reduce(
        (sum, item) => sum + Number(item?.[countField] || 0),
        0,
    );

export const resolveSplitSliderPayload = ({
    splitTest = false,
    isCarousel = false,
    audienceList = [],
    countField = 'recipientCountWebPush',
    sliderSplitter = {},
    splitTabList = [],
}) => {
    const liveCount = sumAudienceRecipientCount(audienceList, countField);
    const tabs =
        Array.isArray(splitTabList) && splitTabList.length >= 2 ? splitTabList : ['splitA', 'splitB'];

    if (splitTest && !isCarousel && liveCount > 0) {
        const fresh = calculateDefaultSplittedCount(tabs.length, liveCount, tabs);
        if (fresh && Object.keys(fresh).length) {
            return {
                splitPercentage: fresh.percentage ?? 1,
                splitAudience: Math.floor(fresh.count || 0),
                totalAudience: liveCount,
                splitWidth: fresh.width ?? 0,
            };
        }
    }

    return {
        splitPercentage: Number(sliderSplitter?.percentage) || 1,
        splitAudience: sliderSplitter?.count ? Math.floor(sliderSplitter.count) : 0,
        totalAudience: liveCount > 0 ? liveCount : Number(sliderSplitter?.audienceCount) || 0,
        splitWidth: Number(sliderSplitter?.width) || 0,
    };
};

export const debouncedHandleAudienceFilterChange = debounce(
    async (dispatch, payload, audienceList, setIsFilterLoading) => {
        if (payload?.searchText?.length <= 3) return;
        setIsFilterLoading?.(true);
        try {
            await dispatch(
                getAudienceList({
                    payload,
                    isFilter: false,
                    audienceList,
                    loading: false,
                }),
            );
        } finally {
            setIsFilterLoading?.(false);
        }
    },
    1000,
);

export const debouncedHandleMDCAudienceFilterChange = debounce(async (refetch, dispatch, payload) => {
    if (payload?.searchText?.length <= 3 || typeof refetch !== 'function') return;

    await refetch({
        fetcher: ({ payload: requestPayload }) =>
            dispatch(getRecipientList({ payload: requestPayload, loading: false })),
        mode: 'create',
        loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
        params: { payload },
    });
}, 1000);

export const debouncedHandleAudienceWebMobileFilterChange = debounce(async (dispatch, payload, audienceList) => {
    if (payload?.searchText?.length > 3) {
        await dispatch(
            getRecipientForNotification({
                payload,
                audienceList,
            }),
        );
    }
}, 1000);

export const handleAllChannelTimeZonePayload = (
    campaignType,
    locationStateTimeZoneId,
    formStateTimeZoneId,
    currentUserTimeZoneId,
    locationState,
    channelType,
) => {
    const MDClevelNumber = _get(locationState?.mdcContentSetupDetails, 'levelNumber', 1);
    const MDCDataSource = _get(locationState?.mdcContentSetupDetails, 'dataSource', 'TL');
    const handleTimeZoneId = () => {
        const currentUserDetails = getUserDetails();
        if (campaignType === 'T') {
            return locationStateTimeZoneId ?? currentUserDetails?.timeZoneId;
        } else if (campaignType === 'M') {
            if (MDCDataSource === 'TL') {
                if (MDClevelNumber === 1) {
                    // In MDC'TL' and level 1 first priority to formstate after formstate null get location or user timeZone id
                    if (formStateTimeZoneId) {
                        return _get(formStateTimeZoneId, 'timeZoneID', 0);
                    } else {
                        return locationStateTimeZoneId || currentUserDetails?.timeZoneId;
                    }
                } else {
                    // In MDC'TL' first priority to locationState after location null get formstate or user timeZone id
                    if (locationStateTimeZoneId) {
                        return locationStateTimeZoneId;
                    } else {
                        if (formStateTimeZoneId) {
                            return _get(formStateTimeZoneId, 'timeZoneID', 0);
                        } else {
                            return locationStateTimeZoneId || currentUserDetails?.timeZoneId;
                        }
                    }
                }
            } else {
                // In MDC'DL' first priority to locationState after location null get formstate or user timeZone id
                if (locationStateTimeZoneId) {
                    return locationStateTimeZoneId;
                } else {
                    if (formStateTimeZoneId) {
                        return _get(formStateTimeZoneId, 'timeZoneID', 0);
                    } else {
                        return locationStateTimeZoneId || currentUserDetails?.timeZoneId;
                    }
                }
            }
        } else {
            return _get(formStateTimeZoneId, 'timeZoneID', 0) || currentUserDetails?.timeZoneId;
        }
    };

    switch (channelType) {
        // case 'email':
        //     return handleTimeZoneId();
        // case 'sms':
        //     return handleTimeZoneId();
        // case 'whatsApp':
        //     return handleTimeZoneId();
        // case 'vms':
        //     return handleTimeZoneId();
        // case 'web':
        //     return handleTimeZoneId();
        // case 'mobile':
        //     return handleTimeZoneId();
        // case 'socialPost':
        //     return handleTimeZoneId();
        default:
            return handleTimeZoneId();
    }
};

export const handleAutoRefreshClickOff = (audience) => {
    // only  TargetList for auto refresh (listType = 5 )
    if (audience?.length) {
        const isExistAllOrknown = audience?.find(
            (aud) =>
                Number(aud?.segmentationListId) === -2 || Number(aud?.segmentationListId) === -1 || aud?.listType !== 5,
        );
        if (isExistAllOrknown) {
            return true;
        } else {
            return false;
        }
    } else {
        return true;
    }
};

export const validateAudienceCount = ({
    audienceCount = 0,
    isAutoRefereshenabled = false,
    campaignType = 'S',
    levelNumber = 1,
}) => {
    if (campaignType === 'T') return { valid: true };
    if (campaignType === 'M' && levelNumber >= 2 && levelNumber <= 6) return { valid: true };
    if (Number(audienceCount) === 0 && !isAutoRefereshenabled) return { valid: false };
    return { valid: true };
};

export const handlesubSegmentClickOff = (audience) => {
    const eligibleSubsegmentList = [1, 5, 11, 17];
    if (!Array.isArray(audience) || audience.length === 0) {
        return true;
    }
    return audience.some((aud) => {
        const listType = Number(aud?.listType);
        if (!eligibleSubsegmentList.includes(listType)) {
            return true;
        }
        if (listType !== 1) {
            return false;
        } else {
            return !(aud?.segmentationListId > 0);
        }
    });
};

export const handleMDCExtraPayload = (location) => {
    const mdcContentSetupDetails = _get(location, 'mdcContentSetupDetails', {});

    return {
        subSegmentId: mdcContentSetupDetails?.subSegmentId ?? 0,
        subSegmentAudienceCount: mdcContentSetupDetails?.finalSubSegmentAudience?.recipientCount || 0,
        subSegmentLevel: mdcContentSetupDetails?.subSegmentLevel || 0,
        subsegmentGroupingEnabled: mdcContentSetupDetails?.isGroupCommunication ?? false,
        isSubsegmentEnabled: mdcContentSetupDetails?.isSubsegmentJoureny ?? false,
        priority: mdcContentSetupDetails?.priority || 0,
        ...(location?.campaignType === 'M' && {
            isAutoRefereshenabled: mdcContentSetupDetails?.isAutoRefereshenabled ?? false,
        }),
    };
};

export const validateCurlyBraces = (inputValue = '', templateValue = '') => {
    const inputHasCustom = !!isCustomParmIncluded(inputValue);
    const templateHasCustom = !!isCustomParmIncluded(templateValue);

    if (!inputHasCustom) {
        if (templateHasCustom) {
            return EDIT_CURLY_BRACES;
        }

        return true;
    }

    const templateVariableRegex = /{{.*?}}/g;

  const cleanInputText = (inputValue || '')
    .replace(templateVariableRegex, '')
    .replace(/\r/g, '');

    if (templateValue) {
    const cleanTemplateText = templateValue
      .replace(templateVariableRegex, '')
      .replace(/\r/g, '');

    const isValid =
      cleanInputText === cleanTemplateText ||
      cleanTemplateText === '';

        return isValid || EDIT_CURLY_BRACES;
    }

    return true;
};

export const isCustomParmIncluded = (description) => {
    const checkRegex = /\{\{.*?\}\}/g;
    const match = description?.match(checkRegex);
    return match;
};

export const handlePersonalization = (onlyPersonalization, audience, listTypeWisePersonlization) => {
    const handleTargetListValue = () => {
        const targetEntry = Object.entries(listTypeWisePersonlization || {}).find(([key, value]) => {
            const [listType] = key.split('|');
            return parseInt(listType) === 5 && value?.length > 0;
        });

        if (targetEntry) {
            const [, value] = targetEntry;
            return value;
        }

        return onlyPersonalization?.length ? onlyPersonalization : [];
    };

    if (audience?.length) {
        const isAdhocExist = audience.find((aud) => aud?.listType === 1 && aud?.segmentationListId > 0);

        if (isAdhocExist) {
            const key = `1|${isAdhocExist.segmentationListId}`;

            return listTypeWisePersonlization[key]?.length
                ? listTypeWisePersonlization[key]
                : onlyPersonalization?.length
                ? onlyPersonalization
                : [];
        } else {
            return handleTargetListValue();
        }
    }

    return handleTargetListValue();
};

export const handlePersonalizationFetchApiCall = async ({
    audience,
    errors,
    dispatch,
    payloadParams,
    listTypeWisePersonlization,
}) => {
    if (!Object.keys(errors)?.includes('audience')) {
        const isAdhocExist = audience?.find((aud) => aud?.listType === 1);
        const isTargetListExist = audience?.find((aud) => aud?.listType === 5);
        const finalListType = isAdhocExist ? 1 : 5;
        if (isTargetListExist || isAdhocExist) {
            const payload = {
                ...payloadParams,
                ListType: isAdhocExist ? isAdhocExist?.listType : isTargetListExist?.listType,
                ListID: isAdhocExist ? isAdhocExist?.segmentationListId : isTargetListExist?.segmentationListId,
            };
            if (payload?.ListID > 0) {
                if (isAdhocExist) {
                    await dispatch(getPersonalizationFields({ payload }));
                } else if (isTargetListExist) {
                    if (!listTypeWisePersonlization[finalListType]?.length) {
                        await dispatch(getPersonalizationFields({ payload }));
                    }
                } else if (finalListType !== 1 && finalListType !== 5) {
                    if (!listTypeWisePersonlization?.[5]?.length) {
                        await dispatch(getPersonalizationFields({ payload }));
                    }
                }
            }
        }
    }
};

export const audienceTypeList = [
    { id: 5, type: 'Target list' },
    { id: 1, type: 'Ad-hoc list' },
    // { id: 2, type: 'Match list' },
    { id: 3, type: 'Seed list' },
    // { id: 4, type: 'Suppression list' },
    { id: 10, type: 'ReTarget list' },
];

export const handleCheckCTGT = (audienceList) => {
    if (!audienceList || audienceList.length === 0) {
        return false;
    }

    const nonSeedLists = audienceList.filter((list) => list?.listType !== 3);

    if (nonSeedLists.length === 0) {
        return false;
    }

    if (nonSeedLists.length < 2) {
        return false;
    }

    const isCTGTEnableOn = nonSeedLists?.some((list) => list?.isCGTGEnabled === true);
    const isCTGTEnableOff = nonSeedLists?.some((list) => list?.isCGTGEnabled === false);
    const allHaveCGTGEnabled = nonSeedLists.every((list) => list?.isCGTGEnabled === true);
    const allHaveCGTGDisabled = nonSeedLists.every((list) => list?.isCGTGEnabled === false);

    if (allHaveCGTGDisabled) {
        return false;
    }

    if (allHaveCGTGEnabled || (isCTGTEnableOn && isCTGTEnableOff)) {
        return true;
    }

    return false;
};

const handleTwoStateCheckSame = (a, b) => {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;

    const normalize = (item) => (typeof item === 'object' && item !== null ? JSON.stringify(item) : item);

    const arr1 = a.map(normalize).sort();
    const arr2 = b.map(normalize).sort();

    return arr1.every((val, i) => val === arr2[i]);
};

export const getChannelNavigationValues = (type) => {
    const navigationMap = {
        email: { tabValueName: 'email', tabValue: 'email' },
        directmail: { tabValueName: 'email', tabValue: 'directmail' },
        sms: { tabValueName: 'messaging', tabValue: 'sms' },
        whatsapp: { tabValueName: 'messaging', tabValue: 'whats app' },
        rcs: { tabValueName: 'messaging', tabValue: 'rcs' },
        vms: { tabValueName: 'messaging', tabValue: 'vms' },
        notification: { tabValueName: 'notification', tabValue: 'web' },
        mobileNotification: { tabValueName: 'notification', tabValue: 'mobile' },
        callCenter: { tabValueName: 'voice', tabValue: 'call center' },
    };
    return navigationMap[type] || { tabValueName: 'email', tabValue: 'email' };
};

export const AudienceFieldRenderComponent = ({
    audienceList,
    userDetails = {},
    type,
    methods,
    name,
    audienceFieldClassName,
    children,
    audienceTextField,
    handleAudienceFieldOnChange = () => {},
    campaignId,
    customHandleFilterChange,
    customFilterPayload,
    audienceValidatorParam = false,
    isAudienceLoading = false,
}) => {
    const {
        watch,
        setError,
        control,
        clearErrors,
        formState: { errors },
        setValue,
        getValues,
    } = methods;
    const { departmentId, userId, clientId } = userDetails;
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { listTypeWisePersonlization, campaign, personalization } = useSelector(
        ({ createCommunicationReducer }) => createCommunicationReducer,
    );
    const [isCGTGModal, setIsCGTGModal] = useState(false);
    const [isAudienceFilterLoading, setIsAudienceFilterLoading] = useState(false);
    const [checkAudienceState, setCheckAudienceState] = useState([]);
    const audienceType = watch('audienceType');
    const uniqueAudienceList = useMemo(() => {
        if (!audienceList?.length) return [];
        const seen = new Set();
        return audienceList.filter((item) => {
            const key = item?.segmentationListId;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, [audienceList]);
    const finalAudienceList = useMemo(() => {
        return audienceList;
        if (!audienceType?.length) {
            return [];
        }
        const availableType = audienceType?.map((type) => type?.id);
        if (availableType?.includes(0)) {
            return audienceList;
        } else {
            return audienceList?.filter((list) => availableType?.includes(list?.listType));
        }
    }, [audienceType]);

    return (
        <>
            {/* <div className="form-group">
                <Row>
                    <Col sm={{ offset: 1, span: 2 }}>
                        <label className="control-label-left">{LIST_TYPE}</label>
                    </Col>
                    <Col sm={6}>
                        <RSMultiSelect
                            control={control}
                            name={'audienceType'}
                            textField={'type'}
                            dataItemKey={'id'}
                            label={LIST_TYPE}
                            required
                            rules={{
                                required: SELECT_LIST_TYPE,
                                validate: (value) => {
                                    const combinationStatus = ListTypeCombinationCheck(value?.map((val) => val.id));
                                    if (!combinationStatus?.status) {
                                        return combinationStatus?.message;
                                    }
                                },
                            }}
                            data={audienceTypeList}
                            handleChange={async ({ value }) => {
                                const channelTypeMap = {
                                    email: 'E',
                                    directmail: 'E',
                                    sms: 'S',
                                    whatsapp: 'WA',
                                    rcs: 'rcs',
                                    notification: 'WN',
                                    mobileNotification: 'MP',
                                    vms: 'VMS',
                                    callCenter: 'CC',
                                };
                                let payload = {
                                    clientId,
                                    userId,
                                    campaignId: campaignId || campaign?.campaignId || 0,
                                    departmentId,
                                    searchText: '',
                                    segmentIds: [],
                                    channelType: channelTypeMap[type] || 'E',
                                    listType: value?.map((val) => val.id)?.join(','),
                                };
                                const combinationCheck = ListTypeCombinationCheck(value?.map((val) => val.id));
                                if (combinationCheck?.status && value?.length) {
                                    await dispatch(
                                        getRecipientList({
                                            payload,
                                        }),
                                    );
                                }
                            }}
                        />
                    </Col>
                </Row>
            </div> */}
            <div >
                <Row className="align-items-end">
                    <Col sm={{ offset: 1, span: 2 }}>
                        <label className="control-label-left">{AUDIENCE}</label>
                    </Col>
                    <Col sm={6} className={`${audienceFieldClassName}`}>
                        {/* Audience footer: custom row + filled plus (not NewAttributeFormBtn / NewAttributeBtn) */}
                        <RSMultiSelect
                            control={control}
                            name={name || 'audience'}
                            textField={audienceTextField || 'audienceEmail'}
                            dataItemKey={'segmentationListId'}
                            data={uniqueAudienceList || []}
                            label={SELECT_SEGMENT_LIST}
                            required
                            loading={isAudienceLoading || isAudienceFilterLoading}
                            rules={{
                                required: SELECT_SEGMENT_LIST,
                                validate: (audience) => audienceListValidator(audience, audienceValidatorParam),
                            }}
                            isCustomOnchange
                            setError={setError}
                            footer={() => (
                                <div
                                    className="d-flex align-items-center justify-content-between px-10 py-8 cp rs-kendo-footer-add-new"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const { tabValueName, tabValue } = getChannelNavigationValues(type);
                                        navigate('/audience/create-target-list', {
                                            state: {
                                                mode: 'add',
                                                backAction: window.location.search,
                                                tabValueName,
                                                tabValue,
                                            },
                                        });
                                    }}
                                >
                                    <span className="text-primary-blue">{NEW_AUDIENCE_LIST}</span>
                                    <i
                                        className={`${circle_plus_fill_medium} icon-md color-primary-blue`}
                                        id="rs_audience_multiselect_new_list_footer"
                                    />
                                </div>
                            )}
                            handleChange={async (e) => {
                                const dd = audienceListValidator(e.value, false);
                                const payloadParams = {
                                    departmentId,
                                    clientId,
                                    userId,
                                };
                                const hasAnyTargetListData = Object.keys(listTypeWisePersonlization || {})
                                    .filter((key) => key.startsWith('5|'))
                                    .some((key) => listTypeWisePersonlization[key]?.length > 0);

                                const hasType5 = Object.keys(listTypeWisePersonlization || {}).some((key) =>
                                    key.startsWith('5|'),
                                );

                                const shouldCallAdhocApi = e.value?.some((item) => {
                                    if (item.listType === 1) {
                                        const key = `1|${item.segmentListId}`;
                                        return !listTypeWisePersonlization[key]?.length;
                                    }
                                    return false;
                                });

                                const shouldCallTargetApi =
                                    !hasType5 && !hasAnyTargetListData && !personalization?.length;
                                if ((shouldCallTargetApi || shouldCallAdhocApi) && dd === true) {
                                    await handlePersonalizationFetchApiCall({
                                        audience: e.value,
                                        errors,
                                        dispatch,
                                        payloadParams,
                                        listTypeWisePersonlization,
                                    });
                                }
                                if (e.value?.length === 1) {
                                    const selectedAudience = e.value[0];
                                    const isSeedList = selectedAudience?.listType === 3;
                                    setValue('isCGTGEnabled', isSeedList ? false : (selectedAudience?.isCGTGEnabled ?? false));
                                    setValue('isCGTGConfirm', false); // Reset confirmation
                                } else if (e.value?.length >= 2) {
                                    setValue('isCGTGConfirm', false);
                                    const nonSeedLists = e.value.filter((list) => list?.listType !== 3);

                                    if (nonSeedLists.length > 0) {
                                        const allNonSeedListsHaveCGTGEnabled = nonSeedLists.every((list) => list?.isCGTGEnabled === true);
                                        const allNonSeedListsHaveCGTGDisabled = nonSeedLists.every((list) => list?.isCGTGEnabled === false);

                                        // If all have isCGTGEnabled: false, set to false (no modal will show)
                                        if (allNonSeedListsHaveCGTGDisabled) {
                                            setValue('isCGTGEnabled', false);
                                        } else {
                                            setValue('isCGTGEnabled', allNonSeedListsHaveCGTGEnabled);
                                        }
                                    } else {
                                        setValue('isCGTGEnabled', false);
                                    }
                                } else {
                                    setValue('isCGTGEnabled', false);
                                    setValue('isCGTGConfirm', false);
                                }
                                handleAudienceFieldOnChange();
                            }}
                            handleFilterChange={(event) => {
                                if (customHandleFilterChange) {
                                    const payload = customFilterPayload
                                        ? customFilterPayload(event)
                                        : {
                                              userId,
                                              clientId,
                                              departmentId,
                                              searchText: event?.filter?.value ?? '',
                                              segmentIds: [],
                                          };
                                    customHandleFilterChange(dispatch, payload, uniqueAudienceList);
                                } else {
                                    const channelTypeMap = {
                                        email: 'E',
                                        directmail: 'E',
                                        sms: 'S',
                                        whatsapp: 'WA',
                                        rcs: 'rcs',
                                        notification: 'WN',
                                        mobileNotification: 'MP',
                                        vms: 'VMS',
                                        callCenter: 'CC',
                                    };
                                    let payload = {
                                        clientId,
                                        userId,
                                        campaignId: campaignId || campaign?.campaignId || 0,
                                        departmentId,
                                        searchText: event?.filter?.value ?? '',
                                        segmentIds: [],
                                        channelType: channelTypeMap[type] || 'E',
                                    };
                                    debouncedHandleAudienceFilterChange(
                                        dispatch,
                                        payload,
                                        uniqueAudienceList,
                                        setIsAudienceFilterLoading,
                                    );
                                }
                            }}
                            clearErrors={clearErrors}
                            customErrorMessage={MORE_THAN_5_LISTS}
                            handleOnBlur={({ value }) => {
                                
                                if (value?.length === 1) {
                                    const selectedAudience = value[0];
                                    const isSeedList = selectedAudience?.listType === 3;
                                    setValue('isCGTGEnabled', isSeedList ? false : (selectedAudience?.isCGTGEnabled ?? false));
                                    setValue('isCGTGConfirm', false); // Reset confirmation
                                    return;
                                }

                                if (value?.length >= 2) {
                                    const currentIsCGTGConfirm = getValues('isCGTGConfirm');
                                    if (!currentIsCGTGConfirm) {
                                        const nonSeedLists = value.filter((list) => list?.listType !== 3);
                                        if (nonSeedLists.length > 0) {
                                            const allNonSeedListsHaveCGTGEnabled = nonSeedLists.every((list) => list?.isCGTGEnabled === true);
                                            const allNonSeedListsHaveCGTGDisabled = nonSeedLists.every((list) => list?.isCGTGEnabled === false);

                                            if (allNonSeedListsHaveCGTGDisabled) {
                                                setValue('isCGTGEnabled', false);
                                            } else {
                                                setValue('isCGTGEnabled', allNonSeedListsHaveCGTGEnabled);
                                            }
                                        } else {
                                            setValue('isCGTGEnabled', false);
                                        }
                                    }
                                }

                                const isCTGTConfirm = handleCheckCTGT(value);
                                const SegmentIdList = value?.map((val) => val?.segmentationListId);
                                let checkIsValidChannelEnv =true;// getEnvironment() === 'RUN' && ['whatsapp', 'rcs']?.includes(type?.toLowerCase()) ? false : true
                                if (
                                    isCTGTConfirm &&
                                    !errors?.[name || 'audience'] &&
                                    !handleTwoStateCheckSame(SegmentIdList, checkAudienceState) && checkIsValidChannelEnv
                                ) {
                                    setIsCGTGModal(isCTGTConfirm);
                                }
                            }}
                        />
                    </Col>
                    <Col sm={3} className={`p0 d-flex align-items-end pb1 ${audienceFieldClassName}`}>
                        {['notification', 'mobileNotification']?.includes(type) ? (
                            <RSPPophover pophover={AUDIENCE_TOOLTIP_TEXT} className="lh0">
                                <i
                                    className={`${circle_question_mark_medium} icon-md color-primary-blue`}
                                    id="circle_question_mark"
                                ></i>
                            </RSPPophover>
                        ) : null}
                    </Col>
                </Row>
                <Row>
                    {' '}
                    <Col sm={{ offset: 3, span: 6 }}>{children}</Col>
                </Row>
                {isCGTGModal && (
                    <RSConfirmationModal
                        show={isCGTGModal}
                        header="Mixed Control Group Settings Detected"
                        text="Selected lists have different Control Group settings and won't be applied now. Enable it in Pre-Campaign Summary to apply to all lists."
                        primaryButtonText="Proceed"
                        secondaryButtonText="Cancel"
                        handleClose={() => {
                            setIsCGTGModal(false);
                            setValue('isCGTGConfirm', false);
                            setCheckAudienceState(watch('audience')?.map((list) => list?.segmentationListId));
                        }}
                        handleConfirm={async () => {
                            setIsCGTGModal(false);
                            setValue('isCGTGConfirm', true);
                            setValue('isCGTGEnabled', false);
                            setCheckAudienceState(watch('audience')?.map((list) => list?.segmentationListId));
                        }}
                    />
                )}
            </div>
        </>
    );
};

export const channelConfig = {
    email: ['isCGTGEnabled', 'cgValue', 'tgValue', 'savedAudienceCountList', 'editActionId'],
    sms: ['isCGTGEnabled', 'cgValue', 'tgValue', 'savedAudienceCountList', 'editActionId'],
    whatsapp: ['isCGTGEnabled', 'cgValue', 'tgValue', 'savedAudienceCountList', 'editActionId'],
    rcs: ['isCGTGEnabled', 'cgValue', 'tgValue', 'savedAudienceCountList', 'editActionId'],
    notification: ['isCGTGEnabled', 'cgValue', 'tgValue', 'savedAudienceCountList'],
    mobileNotification: ['isCGTGEnabled', 'cgValue', 'tgValue', 'savedAudienceCountList'],
    vms: ['isCGTGEnabled', 'cgValue', 'tgValue', 'savedAudienceCountList'],
    callCenter: ['isCGTGEnabled', 'cgValue', 'tgValue', 'savedAudienceCountList'],
    socialPost: [],
    qr: [],
};

const SAVED_AUDIENCE_COUNT_FIELD_BY_CHANNEL_TYPE = {
    email: 'recipientCountEmail',
    sms: 'recipientCountMobile',
    whatsapp: 'recipientCountMobile',
    rcs: 'recipientCountMobile',
    notification: 'recipientCountWebPush',
    mobileNotification: 'recipientCountMobilePush',
    vms: 'recipientCountEmail',
    callCenter: 'recipientCountEmail',
};

export const calculateCGTGValues = (audience) => {
    if (!audience || !Array.isArray(audience) || audience.length === 0) {
        return { cgValue: 0, tgValue: 0 };
    }

    const nonSeedLists = audience.filter((list) => list?.listType !== 3);

    if (nonSeedLists.length === 0) {
        return { cgValue: 0, tgValue: 0 };
    }

    if (nonSeedLists.length === 1) {
        return {
            cgValue: nonSeedLists[0]?.cG ?? 0,
            tgValue: nonSeedLists[0]?.tG ?? 0,
        };
    }

    const firstAudience = nonSeedLists[0];
    const firstCG = firstAudience?.cG ?? 0;
    const firstTG = firstAudience?.tG ?? 0;

    const allSameValues = nonSeedLists.every((aud) => {
        const audCG = aud?.cG ?? 0;
        const audTG = aud?.tG ?? 0;
        return audCG === firstCG && audTG === firstTG;
    });

    if (allSameValues) {
        return {
            cgValue: firstCG,
            tgValue: firstTG,
        };
    } else {
        return {
            cgValue: 0,
            tgValue: 0,
        };
    }
};

export const resolveEditActionIdForPayload = (formState) => {
    const raw = formState?.editActionId;
    if (raw == null || raw === '' || raw === undefined) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
};

export const editActionIdFromCommunicationResponse = (response) => {
    if (!response || typeof response !== 'object') return null;
    const raw = response.editActionId ?? response.actionId;
    if (raw == null || raw === '') return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
};

export const handleAllChannelPayload = (channelType, formState) => {
    const allowedKeys = channelConfig[channelType] || [];
    const payload = {};

    const needsCGTGValues = allowedKeys.includes('cgValue') || allowedKeys.includes('tgValue');
    const cgtgValues = needsCGTGValues ? calculateCGTGValues(formState?.audience) : null;

    allowedKeys.forEach((key) => {
        switch (key) {
            case 'isCGTGEnabled':
                let isCGTGEnabledValue = formState?.isCGTGEnabled ?? false;

                if (formState?.audience?.length === 1) {
                    const selectedAudience = formState.audience[0];
                    if (selectedAudience?.listType === 3) {
                        isCGTGEnabledValue = false;
                    } else {
                        isCGTGEnabledValue = selectedAudience?.isCGTGEnabled ?? false;
                    }
                }
                payload[key] = isCGTGEnabledValue;
                break;
            case 'cgValue':
                payload.cgValue = cgtgValues?.cgValue ?? 0;
                break;
            case 'tgValue':
                payload.tgValue = cgtgValues?.tgValue ?? 0;
                break;
            case 'savedAudienceCountList': {
                const countField = SAVED_AUDIENCE_COUNT_FIELD_BY_CHANNEL_TYPE[channelType];
                if (countField) {
                    payload.savedAudienceCountList = (formState?.audience || []).map((aud) => ({
                        segmentationListId: aud?.segmentationListId,
                        count: aud?.[countField],
                    }));
                }
                break;
            }
            case 'editActionId':
                payload.editActionId = resolveEditActionIdForPayload(formState);
                break;
            default:
                break;
        }
    });

    return payload;
};

export const handleMDCQueryParamsUpdate = (contentDetails, location, sourceAndChannelList) => {
    const audienceList = contentDetails?.audience?.length
        ? contentDetails.audience
        : location?.audience?.length
        ? location.audience
        : [];

    const currentChannelName = sourceAndChannelList?.channelList?.find(
        (channel) => channel.id === contentDetails?.channelId,
    )?.label;

    const potentialAudience =
        getCustomizedReceipientList({ receipientList: audienceList })
            ?.customizedList?.find((list) => list.channelName === currentChannelName)?.count ?? 0;

    const existingDetails = location?.mdcContentSetupDetails || {};

    const queryState = {
        ...location,
        mdcContentSetupDetails: {
            ...existingDetails,
            channelFriendlyName: contentDetails?.channelFriendlyName ?? '',
            domId: existingDetails?.domId ?? contentDetails?.domId ?? '',
            contentThumbnailPath: contentDetails?.contentThumbnailPath ?? '',
            flowChannel: contentDetails?.flowChannel ?? '',
            parentChannelDetailId: contentDetails?.parentChannelDetailId ?? 0,
            parentChannelDetailType: contentDetails?.parentChannelDetailType ?? '',
            actionTime: existingDetails?.actionTime ?? contentDetails?.actionTime ?? '',
            activeChannel: contentDetails?.activeChannel ?? '',
            actionTimeDuration:
                existingDetails?.actionTimeDuration ?? contentDetails?.actionTimeDuration ?? '',
            isSplitAbEnabled: contentDetails?.isSplitAbEnabled ?? false,
            addOnLevel: contentDetails?.addOnLevel ?? '',
            timezoneId: contentDetails?.timezone?.timeZoneID ?? '',
            isALLorAny: contentDetails?.isALLorAny ?? '',
            isAutoRefereshenabled: contentDetails?.isAutoRefereshenabled ?? false,
        },
        audience: audienceList,
        selectedSegementIds: audienceList.map((aud) => aud?.segmentationListId),
        potentialAudience,
        savedAudienceCountList: contentDetails?.savedAudienceCountList,
        mdcContentStatusId: contentDetails?.content?.[0]?.statusId,
    };

    return updateQueryParams(queryState);
};

export const ListTypeCombinationCheck = (selectedIds) => {
    const hasAdhoc = selectedIds.includes(1);
    const hasTarget = selectedIds.includes(5);
    const hasSeed = selectedIds.includes(3);
    const hasMatch = selectedIds.includes(10);

    if (hasAdhoc && selectedIds.length > 1) {
        return {
            status: false,
            message: 'Ad-hoc list cannot be selected with other lists.',
        };
    }

    return {
        status: true,
        message: 'Valid combination.',
    };
};


const EDIT_RESTORE_COUNT_FIELD_BY_CHANNEL_ID = {
    [COMMUNICATION_CHANNEL_ID.EMAIL]: 'recipientCountEmail',
    33: 'recipientCountEmail', // direct mail
    2: 'recipientCountMobile', // SMS
    21: 'recipientCountMobile', // WhatsApp
    41: 'recipientCountRCS', // RCS
    25: 'recipientCountEmail', // VMS
    26: 'recipientCountEmail', // voice / call center
    [COMMUNICATION_CHANNEL_ID.WEB_NOTIFICATION]: 'recipientCountWebPush',
    [COMMUNICATION_CHANNEL_ID.MOBILE_NOTIFICATION]: 'recipientCountMobilePush',
};

/** RSMultiSelect `textField` on audience lists, keyed by numeric channel id (same ids as EDIT_RESTORE_COUNT_FIELD_BY_CHANNEL_ID). */
const AUDIENCE_TEXT_FIELD_BY_CHANNEL_ID = {
    [COMMUNICATION_CHANNEL_ID.EMAIL]: 'audienceEmail',
    33: 'audienceEmail', // direct mail
    2: 'audienceMobile', // SMS
    21: 'audienceWhatsapp', // WhatsApp
    41: 'audienceRCS', // RCS
    25: 'audienceVMS', // VMS
    26: 'audienceEmail', // voice / call center (default label field)
    [COMMUNICATION_CHANNEL_ID.WEB_NOTIFICATION]: 'recipientsBunchName',
    [COMMUNICATION_CHANNEL_ID.MOBILE_NOTIFICATION]: 'recipientsBunchName',
};

export const eligibleStatusIdAudienceUpdateCount = [5, 9];

export const getRecipientCountFieldForNumericChannelId = (channelId) =>
    EDIT_RESTORE_COUNT_FIELD_BY_CHANNEL_ID[Number(channelId)];

export const handleUpdateEditAudienceCount = ({ channelId, audience, savedAudienceCountList, statusId }) => {
    if (!savedAudienceCountList?.length) return audience;
    if (!eligibleStatusIdAudienceUpdateCount?.includes(statusId)) return audience;
    if (!Array.isArray(audience)) return audience;

    const textField = AUDIENCE_TEXT_FIELD_BY_CHANNEL_ID[Number(channelId)];
    const recipientCountField = EDIT_RESTORE_COUNT_FIELD_BY_CHANNEL_ID[Number(channelId)];
    if (!textField || !recipientCountField) return audience;

    return audience.map((aud) => {
        const saved = savedAudienceCountList.find(
            (list) => list?.segmentationListId === aud?.segmentationListId,
        );
        if (!saved) return aud;
        const count = saved?.count ?? aud?.[recipientCountField];
        return {
            ...aud,
            [textField]: `${aud.recipientsBunchName} (${numberWithCommas(count)})`,
        };
    });
};

export const handleTotalAudienceCount = (campaignDetails,watchtotalAudience,calucateAudienceCount) => {
    const statusId = campaignDetails?.content?.[0]?.statusId || 0
    const isTotalAudienceCount = [5,9]?.includes(statusId)
    return numberWithCommas(
        isTotalAudienceCount ? watchtotalAudience ?? 0 : calucateAudienceCount ?? 0,
    )
}

export const handleCGTGModalCheck = (statusId) => {
    if([5,9]?.includes(statusId)) {
        return true
    } else {
        return false
    }
}

/** Completed campaign (status 9) — read-only authoring; no confirmation modals. */
export const shouldShowAuthoringTabChangeConfirmation = (isDirty) =>
    Boolean(isDirty) && statusIdCheck();

export const shouldPromptSkipChannelConfirmation = () => statusIdCheck();

/** Read-only / completed — Next navigates only; no save, validation, or confirmation popups. */
export const shouldBypassAuthoringChannelSubmit = (isClickOff = false) =>
    Boolean(isClickOff) || !shouldPromptSkipChannelConfirmation();

/** Email footer warning before save/next — skip when authoring is read-only or completed. */
export const shouldPromptEmailFooterConfirmation = (isClickOff = false) =>
    !shouldBypassAuthoringChannelSubmit(isClickOff);

export const resolveLocalBlastDateTime = ({
    campaignType,
    statusId,
    triggerPlayPauseStatus,
    schedule,
}) => {
    const PAUSED_STATUS_ID = 5;
    const PAUSED_TRIGGER_PLAY_PAUSE_STATUS_ID = 27;
    const resolvedStatusId = Number(statusId);
    
    if (campaignType === 'T') {
        const isPaused =
            Number(triggerPlayPauseStatus) === PAUSED_TRIGGER_PLAY_PAUSE_STATUS_ID &&
            (resolvedStatusId === PAUSED_STATUS_ID);

        if (isPaused) {
            return isValidDate(schedule) ? formatDateScheculer(schedule) : '';
        }
        return new Date();
    } else {
        return isValidDate(schedule) ? formatDateScheculer(schedule) : '';
    }
};

export const parseMdcScheduleDate = (dateVal) => {
    if (!dateVal) return null;
    if (dateVal instanceof Date) return dateVal;
    if (typeof dateVal === 'string' && dateVal.includes(',')) {
        const parts = dateVal.split(',');
        if (parts.length >= 5) {
            const [d, m, y, h, min] = parts;
            return new Date(Number(y), Number(m) - 1, Number(d), Number(h), Number(min));
        }
    }
    const d = new Date(dateVal);
    return !isNaN(d.getTime()) ? d : null;
};

export const resolveMdcSchedule = (formState, location, levelNumber, campaignType, dataSource, currentSchedule) => {
    if (campaignType !== 'M') return currentSchedule;
    
    if (levelNumber > 1) {
        const mdcScheduleDate = location?.state?.mdcContentSetupDetails?.ScheduleDate || 
                               location?.state?.mdcContentSetupDetails?.scheduleDate ||
                               location?.mdcContentSetupDetails?.ScheduleDate || 
                               location?.mdcContentSetupDetails?.scheduleDate;
        const parsed = parseMdcScheduleDate(currentSchedule) || parseMdcScheduleDate(mdcScheduleDate);
        return parsed || new Date();
    } else {
        if (dataSource === 'DL') {
            return new Date();
        }
        const campaignStart = location?.startDate || 
                             location?.state?.startDate || 
                             formState?.campaignDetails?.startDate || 
                             formState?.campaign?.startDate;
        const parsed = parseMdcScheduleDate(currentSchedule) || parseMdcScheduleDate(campaignStart);
        return parsed || new Date();
    }
};