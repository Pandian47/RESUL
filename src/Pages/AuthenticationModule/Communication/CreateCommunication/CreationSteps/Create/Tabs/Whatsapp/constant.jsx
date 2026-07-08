
import { circle_plus_edge_medium } from 'Constants/GlobalConstant/Glyphicons';
import { map as _map, get as _get } from 'Utils/modules/lodashReplacements';

import SplitAB from './Component/SplitAB/SplitAB';
import { formatDateScheculer, handleAllChannelPayload, handleAllChannelTimeZonePayload, handleMDCExtraPayload, resolveLocalBlastDateTime, resolveMdcSchedule } from '../../constant';
import { getUserDetails, textFormatter, getUserCurrentFormat, isValidDate } from 'Utils/index';
import { extractPlaceholders } from '../RCS/constant';
import { mapImage } from 'Assets/Images';
import {
    ensureArray,
    ensureObject,
    sanitizeChannelCount,
    sumAudienceCountByField,
} from 'Pages/AuthenticationModule/Communication/CreateCommunication/communicationDefaults';

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
        headerParams = [],
        footerParams = [],
        templateContentParams = [],
        header,
        footer,
        actions,
        carouselTabs,
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
    const channelDetailId = _get(ensureArray(content), '[0].smsChannelDetailId', 0) || 0;

    const isWorkflowEnabled = _get(approvalList, 'requestApproval', false);
    const approvarList = isWorkflowEnabled
        ? _map(ensureArray(_get(approvalList, 'name', [])), ({ approverName, isCustom, mandatory } = {}) => ({
            approvarId: isCustom ? 0 : approverName?.userId ?? 0,
            approvarName: isCustom ? approverName : approverName?.email ?? '',
            flag: mandatory || false,
        }))
        : [];

    const autoSchedule = _get(splitscehdule, 'autoSchedule', false);
    const totalAudience = sumAudienceCountByField(audience, 'recipientCountMobile');

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
        parentChannelDetailType: campaignType === 'M' ? parentChannelDetailType : 'WA',
        actionTime, //--	s
        activeChannel: 21,
        actionTimeDuration, //--	s
        channelFriendlyName, //--	s
        channelDetailType: 'WA',
        channelId, //--	s
        flowChannel: campaignType === 'M' ? flowChannel : 21,
        ...handleMDCExtraPayload(location),
    };

    const buildSmsPayload = () => ({
        senderId: _get(senderId, 'clientSmsSettingId', 0),
        // languageId: _get(language, 'languageID', 0),
        languageId: _get(language, 'languageCode', 'en'),
        isFlashMessageEnabled: flashMessage,
        testSmsMobileNo:
            isSendTestSMS === 4
                ? formState?.userKeyPersonInfo?.[0].phoneNo + '|' + formState.passportID || ''
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
                    templateId,
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
                    templateId,
                    smsChannelDetailId: ensureArray(content)?.[index]?.smsChannelDetailId || 0,
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
            splitPercentage: sanitizeChannelCount(_get(splitABCount, 'percentage', 0)),
            splitAudience: Math.floor(sanitizeChannelCount(_get(splitABCount, 'count', 0))),
            totalAudience: totalAudience || 0,
            splitWidth: sanitizeChannelCount(_get(splitABCount, 'width', 0)),
        },
        smsAutoSchedule: {
            splitScheduleId: smsAutoSchedule?.splitScheduleId || 0,
            autoSchedule,
            performedBy: 2, //--s
            startIn: _get(splitscehdule, 'duration') || 0,
            periodRange: autoSchedule ? _get(splitscehdule, 'time.id', 1) : 0,
        },
    });

    const buildWhatsAppPayload1 = () => ({
        senderId: _get(senderName, 'clientWASenderId', 0),
        // testWAMobileNo: phoneNumber.slice(countryCodeMobile?.length),
        testWAMobileNo:
            isSendTestSMS === 2
                ? approvalList?.isEmail ? approvalList?.testEmail || '' : approvalList?.testPhoneNumber?.slice(approvalList?.dialCode?.length + 1)
                : isSendTestSMS === 4
                    ? formState?.userKeyPersonInfo?.[0]?.phoneNo + '|' + formState?.passportID || ''
                    : '',
        countryCodeMobile:
            approvalList?.dialCode?.length && approvalList?.dialCode.includes('+')
                ? approvalList?.dialCode.split('+')[1]
                : approvalList?.dialCode,
        isSendTestWA: isSendTestSMS,
        actionId, //--	s
        waSplit: {
            smsChannelId: 0,
            splitPercentage: 0,
            splitAudience: 0,
            totalAudience: 0,
            splitWidth: 0,
        },
        waAutoSchedule: {
            splitScheduleId: 0,
            autoSchedule: false,
            performedBy: 1, //--s
            startIn: 0,
            periodRange: 0,
        },
        content: [
            {
                templateName: _get(templateName, 'templateName', ''),
                waChannelDetailId: _get(content?.[0], 'waChannelDetailId', 0),
                templateContent: editorText,
                // languageId: _get(templateLanguage, 'languageId', 0) || 0,
                languageId: _get(templateLanguage, 'languageCode', 'en') || 'en',
                waTemplateId: _get(templateName, 'waTemplateId', 0),
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
                blastDateTime: schedule ? formatDateScheculer(schedule) : '',
                splitType: '',
                isUnicode: false,
                waImagePath: previewImage === '' ? waMediaURL || '' : previewImage || '',
                waMediaURL: previewImage === '' ? waMediaURL || '' : previewImage || '',
                waMediaURLType:
                    previewImage === '' ? waMediaURLType || '' : previewImage?.split('.').pop().toUpperCase() || '',
                isDaylightSavings: daylightSavings || false,
            },
        ],
    });

    const extractFromBraces = (placeholder = '') => {
        if (!placeholder) return '';
        return placeholder?.replace(/\{\{|\}\}/g, '')?.trim();
    };

    const getWhatsAppContentMediaFields = (isHeaderType, mediaType, headerType, previewImage, waMediaURL, waMediaURLType) => {
        const isLocation = mediaType === 'location';
        const locationData =
            isLocation &&
            headerType &&
            (headerType.latitude != null || headerType.longitude != null || headerType.locationName || headerType.locationAddress);
        if (locationData) {
            const mediaValueObj = {
                latitude: String(headerType.latitude ?? ''),
                longitude: String(headerType.longitude ?? ''),
                name: String(headerType.locationName ?? ''),
                address: String(headerType.locationAddress ?? ''),
            };
            return {
                mediaValue: JSON.stringify(mediaValueObj),
                mediaURL: JSON.stringify(mediaValueObj),
                waImagePath: JSON.stringify(mediaValueObj),
                waMediaURL: JSON.stringify(mediaValueObj),
                waMediaURLType: 'LOCATION',
            };
        }
        return {
            mediaURL: previewImage === '' ? waMediaURL || '' : previewImage || '',
            waImagePath: previewImage === '' ? waMediaURL || '' : previewImage || '',
            waMediaURL: previewImage === '' ? waMediaURL || '' : previewImage || '',
            waMediaURLType:
                previewImage === '' ? waMediaURLType || '' : previewImage?.split('.').pop().toUpperCase() || '',
        };
    };

    const buildWhatsAppPayload = () => ({
        senderId: _get(senderName, 'clientWASenderId', 0),
        // testWAMobileNo: phoneNumber.slice(countryCodeMobile?.length),
        testWAMobileNo:
            isSendTestSMS === 4
                ? `${formState?.userKeyPersonInfo?.[0]?.phoneNo || ''}|${formState?.passportID || ''}`
                : approvalList?.isEmail
                    ? approvalList?.testEmail || ''
                    : approvalList?.testPhoneNumber
                        ? approvalList?.testPhoneNumber?.slice(approvalList?.dialCode?.length + 1)
                        : '',
        countryCodeMobile:
            approvalList?.dialCode?.length && approvalList?.dialCode.includes('+')
                ? approvalList?.dialCode.split('+')[1]
                : approvalList?.dialCode,
        isSendTestWA: isSendTestSMS,
        actionId, //--	s
        waSplit: {
            // smsChannelId: smsSplit?.smsChannelId || 0,
            splitPercentage: _get(splitABCount, 'percentage', 0),
            splitAudience: Math.floor(_get(splitABCount, 'count', 0)),
            totalAudience: totalAudience || 0,
            splitWidth: _get(splitABCount, 'width', 0),
        },
        waAutoSchedule: {
            splitScheduleId: smsAutoSchedule?.splitScheduleId || 0,
            autoSchedule,
            performedBy: 2, //--s
            startIn: _get(splitscehdule, 'duration') || 0,
            periodRange: autoSchedule ? _get(splitscehdule, 'time.id', 1) : 0
        },
        content: splitTest
            ? _map(splitTabs, (tabs, index) => {
                const {
                    templateName = {},
                    editorText = '',
                    schedule = '',
                    timezone,
                    daylightSavings,
                    header = '',
                    footer = '',
                    actions = [],
                    previewImage = '',
                    templateLanguage = {},
                    headerType = {},
                } = restState[tabs];
                const isHeaderType = _get(templateName, 'isHeaderType', '');
                const mediaType = _get(templateName, 'mediaType', '');
                const mediaFields = getWhatsAppContentMediaFields(
                    isHeaderType,
                    mediaType,
                    headerType,
                    previewImage,
                    waMediaURL,
                    waMediaURLType,
                );
                return {
                    templateName: _get(templateName, 'templateName', ''),
                    waChannelDetailId: _get(content?.[index], 'waChannelDetailId', 0),
                    templateContent: editorText,
                    bodyTags: extractPlaceholders(editorText)?.map((item) => extractFromBraces(item?.placeholder)),
                    header: header,
                    headerTags: extractPlaceholders(header)?.map((item) => extractFromBraces(item?.placeholder)),
                    footer: footer,
                    footerTags: extractPlaceholders(footer)?.map((item) => extractFromBraces(item?.placeholder)),
                    isAction: _get(templateName, 'isAction', false),
                    actions: actions,
                    isCarousel: _get(templateName, 'isCarousel', false),
                    carousel: _map(carouselTabs?.[tabs], (tab, index) => {
                        const {
                            actions = [],
                            editorText = '',
                            interactivity = false,
                            previewImage = '',
                        } = restState?.[tab?.splitName]?.[tab?.carouselName];
                        return {
                            cardIndex: templateName?.carousel[index]?.cardIndex,
                            cardBody: editorText,
                            bodyTags: extractPlaceholders(editorText)?.map((item) =>
                                extractFromBraces(item?.placeholder),
                            ),
                            mediaValue: previewImage,
                            actions: actions,
                        };
                    }),
                    ...mediaFields,

                    // languageId: _get(templateLanguage, 'languageId', 0) || 0,
                    languageId: _get(templateLanguage, 'languageCode', 'en') || 'en',
                    waTemplateId: _get(templateName, 'waTemplateId', 0),
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
                    blastDateTime: schedule ? formatDateScheculer(schedule) : '',
                    splitType: tabs?.slice?.(-1) ?? '',
                    isUnicode: false,
                    isDaylightSavings: daylightSavings || false,
                };
            })
            : (() => {
                const isHeaderType = _get(templateName, 'isHeaderType', '');
                const mediaType = _get(templateName, 'mediaType', '');
                const headerType = formState?.headerType || {};
                const mediaFields = getWhatsAppContentMediaFields(
                    isHeaderType,
                    mediaType,
                    headerType,
                    previewImage,
                    waMediaURL,
                    waMediaURLType,
                );
                return [
                    {
                        templateName: _get(templateName, 'templateName', ''),
                        waChannelDetailId: _get(content?.[0], 'waChannelDetailId', 0),
                        templateContent: editorText,
                        bodyTags: extractPlaceholders(editorText)?.map((item) =>
                            extractFromBraces(item?.placeholder),
                        ),
                        header: header,
                        headerTags: extractPlaceholders(header)?.map((item) =>
                            extractFromBraces(item?.placeholder),
                        ),
                        footer: footer,
                        footerTags: extractPlaceholders(footer)?.map((item) =>
                            extractFromBraces(item?.placeholder),
                        ),
                        isAction: _get(templateName, 'isAction', false),
                        actions: actions,
                        isCarousel: _get(templateName, 'isCarousel', false),
                        carousel: _map(carouselTabs?.['carousel'], (tabs, index) => {
                            const { actions = [], editorText = '', previewImage = '' } =
                                restState[tabs?.carouselName];
                            return {
                                cardIndex: templateName?.carousel[index]?.cardIndex,
                                cardBody: editorText,
                                bodyTags: extractPlaceholders(editorText)?.map((item) =>
                                    extractFromBraces(item?.placeholder),
                                ),
                                mediaValue: previewImage,
                                actions: actions,
                            };
                        }),
                        ...mediaFields,

                        // languageId: _get(templateLanguage, 'languageId', 0) || 0,
                        languageId: _get(templateLanguage, 'languageCode', 'en') || 'en',
                        waTemplateId: _get(templateName, 'waTemplateId', 0),
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
                        blastDateTime: schedule ? formatDateScheculer(schedule) : '',
                        splitType: '',
                        isUnicode: false,
                        isDaylightSavings: daylightSavings || false,
                    },
                ];
            })(),
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
        waCampaign: {
            ...commonPayload,
            ...buildWhatsAppPayload(),
            ...requestApproval,
            ...handleAllChannelPayload('whatsapp', formState),
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
            waCampaign: {},
        };
    }
};

export const FORM_INITIAL_STATE = {
    defaultValues: {
        senderName: '',
        senderId: '',
        titleText: '',
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
            testPhoneNumber: '',
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
            templateType: '',
            daylightSavings: '',
            templateName: '',
            templateLanguage: '',
        },
        splitB: {
            editorText: '',
            schedule: null,
            timezone: '',
            templateType: '',
            daylightSavings: '',
            templateName: '',
            templateLanguage: '',
        },
        splitC: {
            editorText: '',
            schedule: null,
            timezone: '',
            templateType: '',
            daylightSavings: '',
            templateName: '',
            templateLanguage: '',
        },
        splitD: {
            editorText: '',
            schedule: null,
            timezone: '',
            templateType: '',
            daylightSavings: '',
            templateName: '',
            templateLanguage: '',
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
        templateType: '',
        totalAudience: 0
    },
    mode: 'onTouched',
};

export const SPLIT_TABS = [
    {
        id: 'splitA',
        text: 'Split A',
        component: () => <SplitAB key={'splitA'} fieldName={'splitA'} isSplitTabs />,
    },
    {
        id: 'splitB',
        text: 'Split B',
        component: () => <SplitAB key={'splitB'} fieldName={'splitB'} isSplitTabs />,
        add: circle_plus_edge_medium,
    },
];

export const INITIAL_STATE = {
    isShowScheduleModal: false,
    issplitOffConfirmationModal: false,
    showSchedulerModal: false,
    isScheduled: false,
    sentCommunicationModal: false,
    isLivePreview: false,
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
    templateLanguage: '',
    templateName: '',
    // phoneNumber: '',
    requestApproval: false,
    editorText: '',
    scheduler: null,
    splitscehdule: {
        autoSchedule: false,
        communicationPerformanceBy: 'Content',
        duration: '',
        time: 'Hour(s)',
    },
    splitA: {
        editorText: '',
        schedule: null,
        timezone: '',
        templateType: '',
        daylightSavings: '',
        templateName: '',
        templateLanguage: '',
        actions: [],
        interactivity: false,
        previewImage: '',
        headerType: {},
        header: '',
        footer: '',
        headerParams: [],
        footerParam: [],
    },
    splitB: {
        editorText: '',
        schedule: null,
        timezone: '',
        templateType: '',
        daylightSavings: '',
        templateName: '',
        templateLanguage: '',
        actions: [],
        interactivity: false,
        previewImage: '',
        headerType: {},
        header: '',
        footer: '',
        headerParams: [],
        footerParam: [],
    },
    splitC: {
        editorText: '',
        schedule: null,
        timezone: '',
        templateType: '',
        daylightSavings: '',
        templateName: '',
        templateLanguage: '',
        actions: [],
        interactivity: false,
        previewImage: '',
        headerType: {},
        header: '',
        footer: '',
        headerParams: [],
        footerParam: [],
    },
    splitD: {
        editorText: '',
        schedule: null,
        timezone: '',
        templateType: '',
        daylightSavings: '',
        templateName: '',
        templateLanguage: '',
        actions: [],
        interactivity: false,
        previewImage: '',
        headerType: {},
        header: '',
        footer: '',
        headerParams: [],
        footerParam: [],
    },
};
export const refreshContent = {
    editorText: '',
    templateType: '',
    templateName: '',
    actions: [],
    interactivity: false,
    previewImage: '',
    headerType: {},
    header: '',
    footer: '',
    headerParams: [],
    footerParam: [],
    uploadImage: '',
    uploadImageName: '',
    templateContentParams: [],
    previewImage_video: '',
    browserImage: ''
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

export const templateTypeConfig = [
    { templateId: 0, templateType: 'text' },
    { templateId: 2, templateType: 'image' },
    { templateId: 3, templateType: 'pdf' },
    { templateId: 4, templateType: 'video' },
    { templateId: 5, templateType: 'location' },
];

export function detectFileType(url) {
    const ext = url.split('?')[0].split('#')[0].split('.').pop().toLowerCase();

    const imageExt = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'];
    const videoExt = ['mp4', 'webm', 'ogg', 'mov', 'mkv'];
    const audioExt = ['mp3', 'wav', 'ogg', 'm4a'];
    const pdfExt = ['pdf'];

    if (imageExt.includes(ext)) return 'image';
    if (videoExt.includes(ext)) return 'video';
    if (audioExt.includes(ext)) return 'audio';
    if (pdfExt.includes(ext)) return 'pdf';

    return false;
}


export const locationPreview = ({
    locationName,
    locationAddress,
    editorText,
    footer,
    isFooter,
    actionList,
    schedule,
    isTimeStamp,
    isCarousel
}) => {
    const timeStamp = () => {
        return (isTimeStamp && <small className={`text-end fs11 ${isCarousel
            ? 'mt10' : ''}`}>
            {getUserCurrentFormat(schedule)?.formatTime}
        </small>)
    };
    return (
        <>
            <div className="mb15 text-center">
                <img
                    src={mapImage}
                    alt="Location"
                    className="mx-auto"
                    width={'45'}
                />
            </div>



            {(locationName || locationAddress) && (
                <div className="pe-none mb15">
                    {locationName && (
                        <div className="fw-medium fs14">
                            {locationName}
                        </div>
                    )}

                    {locationAddress && (
                        <div
                            className="text-muted"
                            style={{ fontSize: "12px" }}
                        >
                            {`${locationAddress.slice(0, 40)}...`}
                        </div>
                    )}
                </div>
            )}
            <p className="mb15 fs15 text-left text-wrap whatsapp-content" dangerouslySetInnerHTML={{ __html: textFormatter(editorText) }} />
            {isFooter && (
                <small className="mb15">
                    {footer}
                </small>
            )}
            {timeStamp()}
            {actionList}
        </>
    );
};
