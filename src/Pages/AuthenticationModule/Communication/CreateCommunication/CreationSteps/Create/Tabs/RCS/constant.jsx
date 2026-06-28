import { getUserDetails } from 'Utils/modules/crypto';
import { circle_plus_edge_medium } from 'Constants/GlobalConstant/Glyphicons';
import Carousel from './Components/Carousel/Carousel';
import TextContent from './Components/TextContent/TextContent';
import SplitAB from './Components/SplitAB/SplitAB';
import _get from 'lodash/get';
import _map from 'lodash/map';

import { formatDateScheculer, handleAllChannelPayload, handleAllChannelTimeZonePayload, handleMDCExtraPayload, resolveLocalBlastDateTime } from '../../constant';

import {
    ensureArray,
    ensureObject,
    sanitizeChannelCount,
    sumAudienceCountByField,
} from 'Pages/AuthenticationModule/Communication/CreateCommunication/communicationDefaults';

export const rcsFieldName = {
    senderName: 'senderName',
    audience: 'audience',
    templateName: 'templateName',
    currentTabIndex: 'currentTabIndex',
    phoneNumber: 'phoneNumber',
    approvalList: 'approvalList',
    splitTest: 'splitTest',
};

export const rcsFormInitialState = {
    defaultValues: {
        senderName: '',
        audience: '',
        audienceType: '',
        isCGTGEnabled: false,
        isCGTGConfirm: false,
        editActionId: null,
        templateName: '',
        editorText: '',
        titleText: '',
        currentTabIndex: null,
        customParams: '',
        actions: [],
        actionType: {},
        isAutoRefereshenabled: '',
        interactivity: '',
        schedule: '',
        splitTest: false,
        currentSplitTab: 0,
        approvalList: {
            testPhoneNumber: '',
            dialCode: '',
            name: [],
            requestApproval: false,
            approvalFrom: 'All',
            approvalCount: '',
            followHierarchy: false,
        },
        splitscehdule: {
            autoSchedule: false,
            communicationPerformanceBy: 'Content',
            duration: '',
            time: { id: 1, value: 'Hour(s)' },
        },
        splitA: {
            templateName: '',
            editorText: '',
            titleText: '',
            schedule: null,
            timezone: '',
            daylightSavings: '',
            customParams: [],
            actions: [],
            previewImage: '',
            uploadImageName: '',
        },
        splitB: {
            templateName: '',
            editorText: '',
            titleText: '',
            schedule: null,
            timezone: '',
            daylightSavings: '',
            customParams: [],
            actions: [],
            previewImage: '',
            uploadImageName: '',
        },
        splitC: {
            templateName: '',
            editorText: '',
            titleText: '',
            schedule: null,
            timezone: '',
            daylightSavings: '',
            customParams: [],
            actions: [],
            previewImage: '',
            uploadImageName: '',
        },
        splitD: {
            templateName: '',
            editorText: '',
            titleText: '',
            schedule: null,
            timezone: '',
            daylightSavings: '',
            customParams: [],
            actions: [],
            previewImage: '',
            uploadImageName: '',
        },
        carouselA: {},
        carouselB: {},
        carouselC: {},
        browserImage: '',
        carouselIndex: '',
        bannerImage: '',
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

export const SPLIT_AB_NAME = {
    0: {
        id: 'splitA',
        text: 'Split A',
    },
    1: {
        id: 'splitB',
        text: 'Split B',
    },
    2: {
        id: 'splitC',
        text: 'Split C',
    },
    3: {
        id: 'splitD',
        text: 'Split D',
    },
};

export const splitABRefreshFields = {
    templateName: '',
    editorText: '',
    titleText: '',
    schedule: null,
    timezone: '',
    daylightSavings: '',
    customParams: [],
    actions: [],
    previewImage: '',
    uploadImageName: '',
};

export const refreshFields = {
    templateName: '',
    editorText: '',
    titleText: '',
    customParams: [],
    actions: [],
    schedule: null,
    timezone: '',
    daylightSavings: '',
    previewImage: '',
    uploadImageName: '',
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
export const INTERACTIVITY_DATA = [
    { text: 'Call to action', value: 1 },
    { text: 'Reply', value: 2 },
    { text: 'Url Action', value: 3 },
    { text: 'Dialer Action', value: 4 },
    { text: 'View Location (Lat/Long)', value: 5 },
    { text: 'View Location (Query)', value: 6 },
    { text: 'Share Location', value: 7 },
    { text: 'Create Calendar Event', value: 8 },
];

export const CONTENT_TAB_DATA = [
    {
        id: 1,
        text: 'Text',
        component: () => <TextContent />,
        disable: true,
    },
    {
        id: 2,
        text: 'Rich text',
        component: () => <TextContent />,
        disable: true,
    },
    {
        id: 3,
        text: 'Carousel',
        component: () => <Carousel isSplit />,
        disable: true,
    },
];
export const RCS_CAROUSEL_NAME = {
    0: {
        id: 'carouselA',
        text: 'Carousel A',
    },
    1: {
        id: 'carouselB',
        text: 'Carousel B',
    },
    2: {
        id: 'carouselC',
        text: 'Carousel C',
    },
    3: {
        id: 'carouselD',
        text: 'Carousel D',
    },
    4: {
        id: 'carouselE',
        text: 'Carousel E',
    },
    5: {
        id: 'carouselF',
        text: 'Carousel F',
    },
    6: {
        id: 'carouselG',
        text: 'Carousel G',
    },
    7: {
        id: 'carouselH',
        text: 'Carousel H',
    },
    8: {
        id: 'carouselI',
        text: 'Carousel I',
    },
    9: {
        id: 'carouselJ',
        text: 'Carousel J',
    },
    10: {
        id: 'carouselK',
        text: 'Carousel K',
    },
};

export const extractPlaceholders = (text) => {
    const regex = /{{(.*?)}}/g;
    let match;
    const results = [];

    while ((match = regex.exec(text)) !== null) {
        const key = match[1].trim();
        results.push({
            placeholder: match?.[0],
            key,
            start: match.index,
            end: match.index + match?.[0]?.length - 1,
            value: '',
        });
    }

    return results;
};
function numberToLetter(n) {
    if (n < 1 || n > 26) return null;
    return String.fromCharCode(96 + n);
}

export const buildPayload = (formState, type, location) => {
    try {
    let {
        audience,
        schedule = '',
        timezone,
        userId,
        clientId,
        departmentId,
        campaignId = 0,
        campaignType = 'S',
        dataSource = 'TL',
        levelNumber = 1,
        dynamiclistId = 0,
        domId = '',
        addOnLevel = 1,
        isALLorAny = 'ALL',
        parentChannelDetailId = 0,
        parentChannelDetailType = 'S',
        actionId = 1,
        actionTime = 1,
        activeChannel = 41,
        actionTimeDuration = 'D',
        channelFriendlyName = '',
        channelDetailType = 'RCS',
        channelId = 'ch0041',
        flowChannel = 41,
        rcsChannelDetailId = 0,
        language,
        editorText = '',
        repeat,
        content,
        audioPath,
        voiceTestNumber,
        fileWeight = '',
        currentTab,
        daylightSavings,
        senderName,
        isSendTestRCS = 0,
        templateName,
        templateContentDetail,
        titleText,
        previewImage = '',
        isAutoRefereshenabled = false,
        uploadImageName = '',
        approvalList,
        splitTest,
        splitTabs,
        splitABCount,
        splitscehdule,
        rcsSplit = {},
        rcsAutoSchedule = {},
        carouselTabs,
        actions,
        ...restState
    } = ensureObject(formState);

    const totalAudience = sumAudienceCountByField(audience, 'recipientCountRCS');

    const { timeZoneId = 0 } = getUserDetails();
    let { dialCode, testPhoneNumber: mobile } = approvalList;
    schedule =
        levelNumber > 1
            ? new Date(formState.schedule)
            : campaignType === 'M' && dataSource === 'DL'
            ? new Date()
            : schedule;

    const getInteractiveData = (formState, location) => {
        let interactives = formState?.actions;

        return interactives?.map((item, ind) => {
            let accName = item?.actionName;
            let accType = item?.actionType;
            return {
                buttonType: accType?.value,
                typeOfAction: accType?.value,
                phoneNumberButtonText: accName,
                phoneNumber: '',
                websiteButtonText: !!accType?.ActionURL ? accType?.text : '',
                websiteUrl: accType?.ActionURL,
                actionUrl: item?.actionUrl || '',
                quickReplyButtonText: '',
                quickReplyResponse: '',
            };
        });
    };
    const isWorkflowEnabled = _get(approvalList, 'requestApproval', false);
    const approvarList = isWorkflowEnabled
        ? _map(ensureArray(_get(approvalList, 'name', [])), ({ approverName, isCustom, mandatory } = {}) => ({
                approvarId: isCustom ? 0 : approverName?.userId ?? 0,
                approvarName: isCustom ? approverName : approverName?.email ?? '',
                flag: mandatory || false,
            }))
        : [];
    const getFileExtension = (filename) => {
        if (!filename) return '';
        const parts = filename.split('.');
        return parts?.length > 1 ? parts.pop().toLowerCase() : '';
    };

    const getScheduleDate = (scheduleValue, timezoneValue, formState) => {
        if (formState?.campaignType === 'M') {
            if (formState?.dataSource === 'DL') {
                if (formState?.levelNumber > 1) {
                    return formatDateScheculer(formState?.scheduleDate);
                }
                return formatDateScheculer(new Date());
            } else {
                if (formState?.levelNumber > 1) {
                    return formatDateScheculer(formState?.scheduleDate);
                }
                if (scheduleValue) {
                    return formatDateScheculer(scheduleValue);
                } else {
                    return '';
                }
            }
        } else if (formState?.campaignType === 'T') {
            const resolvedStatusId = content?.[0]?.statusId ?? location?.statusId;
            return resolveLocalBlastDateTime({
                campaignType: formState?.campaignType,
                statusId: resolvedStatusId,
                triggerPlayPauseStatus: formState?.triggerPlayPauseStatus,
                schedule: scheduleValue,
            });
        } else {
            if (scheduleValue) {
                return formatDateScheculer(scheduleValue);
            } else {
                return '';
            }
        }
    };

    const getInteractivesForSplit = (splitData) => {
        let interactives = splitData?.actions || [];
        return interactives?.map((item, ind) => {
            let accName = item?.actionName;
            let accType = item?.actionType;
            return {
                buttonType: accType?.value,
                typeOfAction: accType?.value,
                phoneNumberButtonText: accName,
                phoneNumber: '',
                websiteButtonText: !!accType?.ActionURL ? accType?.text : '',
                websiteUrl: accType?.ActionURL,
                actionUrl: item?.actionUrl || '',
                quickReplyButtonText: '',
                quickReplyResponse: '',
            };
        });
    };

    const buildContent = (formState, location, isSplit = false, splitTabsList = []) => {
        if (isSplit && splitTabsList?.length) {
            // Build content for each split tab
            return _map(ensureArray(splitTabsList), (tabs, index) => {
                const splitData = restState?.[tabs] || {};
                const templateType = splitData?.templateName?.templateType;
                
                if (templateType === 3) {
                    // Handle carousel in split AB
                    const splitCarouselTabs = carouselTabs?.[tabs] || [];
                    
                    return {
                        templateType: templateType || 0,
                        rcsChannelDetailId: content?.[index]?.rcsChannelDetailId || 0,
                        templateContent: splitData?.editorText || '',
                        languageId: splitData?.templateName?.languageCode || 'en',
                        rcsTemplateId: splitData?.templateName?.rcsTemplateId || 0,
                        title: splitData?.titleText || '',
                        timeZoneId: handleAllChannelTimeZonePayload(
                            campaignType,
                            location?.timeZoneId,
                            splitData.timezone,
                            timeZoneId,
                            location,
                        ),
                        localBlastDateTime: resolveLocalBlastDateTime({
                            campaignType,
                            statusId: content?.[index]?.statusId ?? location?.statusId,
                            triggerPlayPauseStatus: formState?.triggerPlayPauseStatus,
                            schedule: splitData?.schedule,
                        }),
                        blastDateTime: splitData?.schedule ? formatDateScheculer(splitData?.schedule) : '',
                        splitType: tabs?.slice?.(-1) ?? '',
                        isUnicode: false,
                        rcsImagePath: splitData?.previewImage || '',
                        rcsMediaURL: splitData?.uploadImageName || '',
                        rcsMediaURLType: getFileExtension(splitData?.previewImage) || getFileExtension(splitData?.uploadImageName),
                        isDaylightSavings: splitData?.daylightSavings || false,
                        isCarousel: true,
                        carousel: _map(splitCarouselTabs, (carouselTab, carouselIndex) => {
                            const carouselData = restState?.[carouselTab?.splitName]?.[carouselTab?.carouselName];
                            return {
                                cardDesctiption: carouselData?.editorText || '',
                                cardTitle: carouselData?.titleText || '',
                                bannerValue: carouselData?.previewImage || '',
                                bannerType: carouselData?.bannerType || 'Image',
                                actions: carouselData?.actions || [],
                            };
                        }),
                        rcsInteractives: getInteractivesForSplit(splitData),
                    };
                } else {
                    // Handle text/rich text in split AB
                    return {
                        templateType: templateType || 0,
                        rcsChannelDetailId: content?.[index]?.rcsChannelDetailId || 0,
                        templateContent: splitData?.editorText || '',
                        languageId: splitData?.templateName?.languageCode || 'en',
                        rcsTemplateId: splitData?.templateName?.rcsTemplateId || 0,
                        title: splitData?.titleText || '',
                        isCarousel: false,
                        timeZoneId: handleAllChannelTimeZonePayload(
                            campaignType,
                            location?.timeZoneId,
                            splitData.timezone,
                            timeZoneId,
                            location,
                        ),
                        localBlastDateTime: resolveLocalBlastDateTime({
                            campaignType,
                            statusId: content?.[index]?.statusId ?? location?.statusId,
                            triggerPlayPauseStatus: formState?.triggerPlayPauseStatus,
                            schedule: splitData?.schedule,
                        }),
                        blastDateTime: splitData?.schedule ? formatDateScheculer(splitData?.schedule) : '',
                        splitType: tabs?.slice?.(-1) ?? '',
                        isUnicode: false,
                        rcsImagePath: splitData?.previewImage || '',
                        rcsMediaURL: splitData?.uploadImageName || '',
                        rcsMediaURLType: getFileExtension(splitData?.previewImage) || getFileExtension(splitData?.uploadImageName),
                        isDaylightSavings: splitData?.daylightSavings || false,
                        rcsInteractives: getInteractivesForSplit(splitData),
                        carousel: []
                    };
                }
            });
        }

        // Original non-split content building
        const templateType = formState?.templateName?.templateType;

        if (templateType === 3) {
            // Handle carousel for non-split
            const nonSplitCarouselTabs = carouselTabs?.['carousel'] || [];
            
            return [{
                templateType: templateType || 0,
                rcsChannelDetailId: rcsChannelDetailId,
                templateContent: formState?.editorText || '',
                languageId: formState?.templateName?.languageCode || 'en',
                rcsTemplateId: formState?.templateName?.rcsTemplateId || 0,
                title: formState?.titleText || '',
                timeZoneId: handleAllChannelTimeZonePayload(
                    location?.campaignType,
                    location?.timeZoneId,
                    formState?.timezone,
                    timeZoneId,
                    location,
                ),
                localBlastDateTime: getScheduleDate(formState?.schedule, formState?.timezone, formState),
                blastDateTime: getScheduleDate(formState?.schedule, formState?.timezone, formState),
                splitType: '',
                isUnicode: false,
                rcsImagePath: formState?.previewImage || '',
                rcsMediaURL: formState?.uploadImageName || '',
                rcsMediaURLType: getFileExtension(formState?.previewImage) || getFileExtension(formState?.uploadImageName),
                isDaylightSavings: daylightSavings || false,
                isCarousel: true,
                carousel: _map(nonSplitCarouselTabs, (carouselTab, carouselIndex) => {
                    const carouselData = restState?.[carouselTab?.carouselName];
                    return {
                        cardDesctiption: carouselData?.editorText || '',
                        cardTitle: carouselData?.titleText || '',
                        bannerValue: carouselData?.previewImage || '',
                        bannerType: carouselData?.bannerType || 'Image',
                        actions: carouselData?.actions || [],
                    };
                }),
                rcsInteractives: getInteractiveData(formState, location),
            }];
        } else {
            const templateDetail = formState?.templateContentDetail?.[0] || {};
            const {
                LanguageCode = '',
                RCSCarouselTemplateID = '',
                RCSTemplateID = '',
                TemplateType = '',
                RCSImagePath = '',
                RCSTemplateJsonDetailModels = [],
            } = templateDetail;

            return [
                {
                    templateType: templateType || 0,
                    rcsChannelDetailId: rcsChannelDetailId,
                    templateContent: formState?.editorText || '',
                    languageId: LanguageCode,
                    rcsTemplateId: RCSTemplateID,
                    title: formState?.titleText || '',
                    timeZoneId: handleAllChannelTimeZonePayload(
                        location?.campaignType,
                        location?.timeZoneId,
                        formState?.timezone,
                        timeZoneId,
                        location,
                    ),
                    localBlastDateTime: getScheduleDate(formState?.schedule, formState?.timezone, formState),
                    blastDateTime: getScheduleDate(formState?.schedule, formState?.timezone, formState),
                    splitType: '',
                    isUnicode: false,
                    rcsImagePath: formState?.previewImage || '',
                    rcsMediaURL: formState?.uploadImageName || '',
                    rcsMediaURLType:
                        getFileExtension(formState?.previewImage) || getFileExtension(formState?.uploadImageName),
                    isDaylightSavings: daylightSavings || false,
                    rcsInteractives: getInteractiveData(formState, location),
                    isCarousel: false,
                    carousel: [],
                },
            ];
        }
    };
    const autoSchedule = _get(splitscehdule, 'autoSchedule', false);
    
    return {
        departmentId,
        clientId,
        isAutoRefereshenabled,
        copy: false,
        createdBy: userId,
        userId,
        segmentationListId: _map(ensureArray(audience), 'segmentationListId'),
        dataSource: campaignType === 'T' ? 'DL' : dataSource,
        rcsCampaign: {
            campaignId,
            campaignType,
            totalAudience,
            levelNumber,
            isSendTimeOptEnable: false,
            isSplitAbEnabled: campaignType === 'T' ? false : splitTest,
            dynamiclistId,
            domId,
            addOnLevel,
            isALLorAny,
            parentChannelDetailId,
            parentChannelDetailType,
            actionTime: Number(actionTime),
            activeChannel,
            actionTimeDuration,
            channelFriendlyName,
            channelDetailType,
            channelId,
            flowChannel,
            senderId: _get(senderName, 'clientRCSSenderId', 0) || 0,
            testRCSMobileNo:
                isSendTestRCS === 4
                    ? `${formState?.userKeyPersonInfo?.[0]?.phoneNo || ''}|${formState?.passportID || ''}`
                    : approvalList?.testPhoneNumber
                    ? approvalList?.testPhoneNumber?.slice(approvalList?.dialCode?.length + 1)
                    : '',
            countryCodeMobile:
                approvalList?.dialCode?.length && approvalList?.dialCode.includes('+')
                    ? approvalList?.dialCode.split('+')[1]
                    : approvalList?.dialCode || '',
            isSendTestRcs: isSendTestRCS,
            actionId,
            isSplit: splitTest || false,
            rcsSplit: {
                rcsChannelId: rcsSplit?.rcsChannelId || 0,
                splitPercentage: sanitizeChannelCount(_get(splitABCount, 'percentage', 0)),
                splitAudience: Math.floor(sanitizeChannelCount(_get(splitABCount, 'count', 0))),
                totalAudience: totalAudience || 0,
                splitWidth: sanitizeChannelCount(_get(splitABCount, 'width', 0)),
            },
            rcsAutoSchedule: {
                splitScheduleId: rcsAutoSchedule?.splitScheduleId || 0,
                autoSchedule,
                performedBy: 2,
                startIn: _get(splitscehdule, 'duration') || 0,
                periodRange: autoSchedule ? _get(splitscehdule, 'time.id', 1) : 0,
            },
            content: splitTest 
                ? buildContent(formState, location, true, splitTabs)
                : buildContent(formState, location, false),
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
            ...handleMDCExtraPayload(location),
            ...handleAllChannelPayload('rcs', formState),
        },
    };
    } catch {
        return {
            departmentId: 0,
            clientId: 0,
            isAutoRefereshenabled: false,
            copy: false,
            createdBy: 0,
            userId: 0,
            segmentationListId: [],
            dataSource: 'TL',
            rcsCampaign: {},
        };
    }
};

export const sanitizeJsonString = (jsonString) => {
    return jsonString
        .replace(/[\n\r\t]/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
};
