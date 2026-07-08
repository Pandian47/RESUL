
import { getUserDetails } from 'Utils/modules/crypto';
import { circle_plus_medium } from 'Constants/GlobalConstant/Glyphicons';
import { map as _map, get as _get } from 'Utils/modules/lodashReplacements';

import {
    ensureArray,
    ensureObject,
    sanitizeChannelCount,
    sumAudienceCountByField,
    ensureCampaignContent,
    ensureSegmentationListIds,
    normalizeChannelCampaignData,
    hasCampaignDetails,
    getCampaignStatusId,
} from '../../../../communicationDefaults';

import SplitAB from './Component/SplitAB/SplitAB';
import { handleAllChannelPayload, handleAllChannelTimeZonePayload, handleMDCExtraPayload, resolveLocalBlastDateTime , resolveMdcSchedule} from '../../constant';
export const sanitizeMessagingCount = sanitizeChannelCount;

export const sumMobileAudienceCount = (audienceList) =>
    sumAudienceCountByField(audienceList, 'recipientCountMobile');

export const ensureMessagingContent = ensureCampaignContent;

export { ensureSegmentationListIds };

/** Normalize edit-fetch payload so UI never receives non-array content/segment ids. */
export const normalizeMessagingCampaignData = (data) =>
    normalizeChannelCampaignData(data, ['smsSplit', 'smsAutoSchedule']);

export const hasMessagingCampaignDetails = hasCampaignDetails;

export const getMessagingCampaignStatusId = getCampaignStatusId;
export const buildPayload = (formState, type, location) => {
    try {
    let {
        senderName,
        serviceProvider,
        isAutoRefereshenabled,
        language,
        senderId,
        audience,
        splitTest,
        templateLanguage,
        sendTimeRecommendation,
        templateName,
        splitTabs,
        flashMessage,
        phoneNumber,
        splitABCount,
        approvalList,
        splitscehdule,
        departmentId = 0,
        clientId = 0,
        userId,
        campaignId = 0,
        campaignType,
        templateId,
        editorText,
        schedule,
        timezone,
        countryCodeMobile,
        campaignDetails,
        dataSource = 'TL',
        levelNumber = 1,
        addOnLevel = 1,
        isALLorAny = 'ALL',
        parentChannelDetailId = 0,
        parentChannelDetailType = 'S',
        actionId = 1,
        actionTime = 1,
        activeChannel = 2,
        actionTimeDuration = 'D',
        channelFriendlyName = '',
        channelDetailType = 'S',
        channelId = '',
        domId = '',
        flowChannel = 2,
        smsSplit = {},
        smsAutoSchedule = {},
        content,
        previewImage,
        uploadImage,
        isSendTestSMS,
        dialCode,
        mobile,
        dynamiclistId = 0,
        waMediaURL,
        waMediaURLType,
        daylightSavings,
        ...restState
    } = ensureObject(formState);


    schedule = resolveMdcSchedule(formState, location, levelNumber, campaignType, dataSource, schedule);

    // if (type === 'whatsapp') {
    //     parentChannelDetailType = 'WA';
    //     channelDetailType = 'WA';
    //     channelId = 'ch0021';
    //     flowChannel = 21;
    //     activeChannel = 21;
    // }

    const { timeZoneId = 0 } = getUserDetails();
    const channelDetailId = _get(ensureMessagingContent(content), '[0].smsChannelDetailId', 0) || 0;

    const isWorkflowEnabled = _get(approvalList, 'requestApproval', false);
    const approvarList = isWorkflowEnabled
        ? _map(ensureArray(_get(approvalList, 'name', [])), ({ approverName, isCustom, mandatory } = {}) => ({
              approvarId: isCustom ? 0 : approverName?.userId ?? 0,
              approvarName: isCustom ? approverName : approverName?.email ?? '',
              flag: mandatory || false,
          }))
        : [];

    const autoSchedule = _get(splitscehdule, 'autoSchedule', false);
    const totalAudience = sumMobileAudienceCount(audience);

    const commonPayload = {
        campaignId,
        campaignType,
        totalAudience,
        levelNumber, //--s
        isSendTimeOptEnable: sendTimeRecommendation,
        isSplitAbEnabled: campaignType === 'T' ? false : splitTest,
        dynamiclistId, //--	s
        domId, //--	s
        addOnLevel, //--	s
        isALLorAny, //--	s
        parentChannelDetailId, //--	s
        parentChannelDetailType: campaignType === 'M' ? parentChannelDetailType : type === 'sms' ? 'S' : 'WA', //--	s
        actionTime, //--	s
        activeChannel: type === 'sms' ? 2 : 21, //--	s
        actionTimeDuration, //--	s
        channelFriendlyName, //--	s
        channelDetailType: type === 'sms' ? 'S' : 'WA', //--	s
        channelId, //--	s
        flowChannel: campaignType === 'M' ? flowChannel : type === 'sms' ? 2 : 21, //--	s
        ...handleMDCExtraPayload(location),
    };

    const buildSmsPayload = () => ({
        senderId: _get(senderId, 'clientSmsSettingId', 0),
        // languageId: _get(language, 'languageID', 0),
        languageId: _get(language, 'languageCode', 'en'),
        isFlashMessageEnabled: flashMessage,
        testSmsMobileNo:
            isSendTestSMS === 4
                ? `${formState?.userKeyPersonInfo?.[0]?.phoneNo || ''}|${formState?.passportID || ''}`
                : approvalList?.testPhoneNumber
                    ? approvalList?.testPhoneNumber?.slice(approvalList?.dialCode?.length + 1)
                    : '',
        // testSmsMobileNo: mobile,
        countryCodeMobile:
            approvalList?.dialCode?.length && approvalList?.dialCode.includes('+')
                ? approvalList?.dialCode.split('+')[1]
                : approvalList?.dialCode,
        isSendTestSMS: isSendTestSMS, //--- 0- save, 1- request for approval, 2 - test preview,4 live preview
        actionId, //--	s
        content: !splitTest
            ? [
                {
                    templateId: _get(templateId, 'dltTemplateID', templateId),
                    smsChannelDetailId: channelDetailId,
                    body: editorText,
                    timeZoneId: handleAllChannelTimeZonePayload(
                        campaignType,
                        location?.timeZoneId,
                        timezone,
                        timeZoneId,
                        location,
                    ),
                    localBlastDateTime: resolveLocalBlastDateTime({
                        campaignType,
                        statusId: _get(content?.[0], 'statusId', 0),
                        triggerPlayPauseStatus: formState?.triggerPlayPauseStatus,
                        schedule,
                    }),
                    splitType: '',
                    isUnicode: false,
                    isDaylightSavings: daylightSavings || false,
                },
            ]
            : _map(ensureArray(splitTabs), (tabs, index) => {
                  const tabState = restState?.[tabs] || {};
                const { templateId, editorText, schedule, timezone, daylightSavings } = tabState;
                return {
                    templateId: _get(templateId, 'dltTemplateID', templateId),
                    smsChannelDetailId: ensureMessagingContent(content)?.[index]?.smsChannelDetailId || 0,
                    body: editorText ?? '',
                    timeZoneId: handleAllChannelTimeZonePayload(
                        campaignType,
                        location?.timeZoneId,
                        timezone,
                        timeZoneId,
                        location,
                    ),
                    localBlastDateTime: resolveLocalBlastDateTime({
                        campaignType,
                        statusId: _get(content?.[index], 'statusId', 0),
                        triggerPlayPauseStatus: formState?.triggerPlayPauseStatus,
                        schedule,
                    }),
                    splitType: tabs?.slice?.(-1) ?? '',
                    isUnicode: false,
                    isDaylightSavings: daylightSavings || false,
                };
            }),
        smsSplit: {
            smsChannelId: smsSplit?.smsChannelId || 0,
            splitPercentage: sanitizeMessagingCount(_get(splitABCount, 'percentage', 0)),
            splitAudience: Math.floor(sanitizeMessagingCount(_get(splitABCount, 'count', 0))),
            totalAudience: totalAudience || 0,
            splitWidth: sanitizeMessagingCount(_get(splitABCount, 'width', 0)),
        },
        smsAutoSchedule: {
            splitScheduleId: smsAutoSchedule?.splitScheduleId || 0,
            autoSchedule,
            performedBy: 2, //--s
            startIn: _get(splitscehdule, 'duration') || 0,
            periodRange: autoSchedule ? _get(splitscehdule, 'time.id', 1) : 0,
        },
    });

    const requestApproval = {
        requestForApproval: {
            isWorkflowEnabled,
            approvarList,
            noOfApprovers: approvalList?.name?.length ?? 0,
            approvalFrom: _get(approvalList, 'approvalFrom', 'ALL'),
            isFollowHierarchy: _get(approvalList, 'followHierarchy', false),
            approverCount:
                _get(approvalList, 'approvalFrom', 'ALL') === 'Any'
                    ? _get(approvalList, 'approvalCount', 0)
                    : approvalList?.name?.length,
        },
    };
    // debugger;
    return {
        departmentId,
        clientId,
        copy: false,
        createdBy: userId,
        userId,
        segmentationListId: _map(ensureArray(audience), 'segmentationListId'),
        dataSource: campaignType === 'T' ? 'DL' : dataSource, //--	s
        isAutoRefereshenabled,
        smsCampaign: {
            ...commonPayload,
            ...buildSmsPayload(),
            ...requestApproval,
            ...handleAllChannelPayload('sms', formState),
        },
    };
    } catch {
        return {
            departmentId: 0,
            clientId: 0,
            copy: false,
            createdBy: 0,
            userId: 0,
            segmentationListId: [],
            dataSource: 'TL',
            isAutoRefereshenabled: false,
            smsCampaign: {},
        };
    }
};

export const FORM_INITIAL_STATE = {
    defaultValues: {
        senderName: '',
        senderId: '',
        titleText: '',
        language: '',
        flashMessage: false,
        isAutoRefereshenabled: false,
        serviceProvider: '',
        audience: [],
        editActionId: null,
        isCGTGEnabled: false,
        isCGTGConfirm: false,
        templateLanguage: '',
        templateName: '',
        currentSplitTab: 0,
        channelType: 'sms',
        splitTest: false,
        editorText: '',
        schedule: null,
        sendTimeRecommendation: false,
        templateId: '',
        approvalList: {
            name: [{ approverName: '', mandatory: false }],
            requestApproval: false,
            approvalFrom: 'All',
            approvalCount: '',
            dialCode: '',
            followHierarchy: false,
            testPhoneNumber: ''
        },
        splitscehdule: {
            autoSchedule: false,
            communicationPerformanceBy: 'Content',
            duration: '',
            time: { id: 1, value: 'Hour(s)' },
        },
        splitA: {
            editorText: '',
            schedule: null,
            timezone: '',
            templateId: '',
            daylightSavings: '',
        },
        splitB: {
            editorText: '',
            schedule: null,
            timezone: '',
            templateId: '',
            daylightSavings: '',
        },
        splitC: {
            editorText: '',
            schedule: null,
            timezone: '',
            templateId: null,
            daylightSavings: '',
        },
        splitD: {
            editorText: '',
            schedule: null,
            timezone: '',
            templateId: null,
            daylightSavings: '',
        },
        mobile: '',
        dialCode: '91',
        phoneNumber: '',
        getCountryVal: {},
        numbers: '',
        err: null,
        browserImage: '',
        previewImage_video: '',
        previewImage: '',
        waMediaURLType: '',
        waMediaURL: '',
        uploadImageName: '',
        uploadImage: '',
        totalAudience: 0
    },
    mode: 'onTouched',
};

export const SPLIT_TABS = [
    {
        id: 'splitA',
        text: 'Split A',
        component: () => <SplitAB key={'splitA'} fieldName={'splitA'} />,
    },
    {
        id: 'splitB',
        text: 'Split B',
        component: () => <SplitAB key={'splitB'} fieldName={'splitB'} />,
        add: circle_plus_medium,
    },
];

export const INITIAL_STATE = {
    isShowScheduleModal: false,
    issplitOffConfirmationModal: false,
    showSchedulerModal: false,
    isScheduled: false,
    sentCommunicationModal: false,
    isNavigationConfirmation: false,
    isSmartLink: false,
    testSentCommunicationModal: false,
    requestFalse: '',
    isWhatsAppError: { message: '', show: false },
};

export const splitABRefreshFields = {
    editorText: '',
    scheduler: null,
    sendTimeRecommendation: '',
    timezone: '',
    daylightSavings: '',
};

export const refreshFields = {
    titleText: '',
    flashMessage: false,
    templateId: null,
    serviceProvider: '',
    templateLanguage: '',
    templateName: '',
    // phoneNumber: '',
    requestApproval: false,
    editorText: '',
    scheduler: null,
    approvalList: {
        name: [{ approverName: '', mandatory: false }],
        requestApproval: false,
        approvalFrom: 'All',
        approvalCount: '2',
        followHierarchy: false,
    },
    splitscehdule: {
        autoSchedule: false,
        communicationPerformanceBy: 'Content',
        duration: '',
        time: 'Hour(s)',
    },
};

export const stateReducer = (state, action) => {
    const { payload, type } = action;
    switch (type) {
        case 'UPDATE':
            return {
                ...state,
                [action.field]: payload,
            };
        default:
            return state;
    }
};
