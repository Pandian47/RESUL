import { getCreatedDate } from 'Utils/modules/dateTime';
import { getmasterData } from 'Utils/modules/masterData';
import { circle_minus_fill_medium, circle_plus_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment } from 'react';
import { map as _map,get as _get,find as _find,uniqBy as _uniqBy } from 'Utils/modules/lodashReplacements';
import SplitAB from './Component/SplitAB/SplitAB';
import {
    SPLIT_AB_NAME,
    formatDateScheculer,
    handleAllChannelPayload,
    handleAllChannelTimeZonePayload,
    handleMDCExtraPayload,
    audienceTypeList,
    handleUpdateEditAudienceCount,
    COMMUNICATION_CHANNEL_ID,
    resolveSplitSliderPayload,
    resolveLocalBlastDateTime,
} from '../../constant';

import { SCHEDULE_START_TIME_MENU } from '../Email/constant';
import { mapSmartLinksWithLabelsToButtonOptions } from '../MobileNotification/constant';

export const getContentType = {
    0: 'R',
    1: 'Z',
    2: 'T',
};
export const getContentInput = {
    R: { value: 'create', id: 0 },
    Z: { value: 'import', id: 1 },
    T: { value: 'template', id: 2 },
};
export const splitObj = {
    0: 'A',
    1: 'B',
    2: 'C',
    3: 'D',
};
export const carouselObj = {
    0: 'C1',
    1: 'C2',
    2: 'C3',
    3: 'C4',
};

const SUPPORTED_MEDIA_EXTENSIONS = new Set([
    'jpg',
    'jpeg',
    'png',
    'gif',
    'webp',
    'bmp',
    'svg',
    'avif',
    'mp4',
    'mp3',
    'webm',
    'ogg',
    'mov',
]);

const normalizeMediaExtension = (value = '') => {
    const normalizedValue = String(value || '').toLowerCase();
    return SUPPORTED_MEDIA_EXTENSIONS.has(normalizedValue) ? normalizedValue : '';
};

/** Extension from a single URL string only (no HTML scan, no recursion). */
const getExtensionFromUrl = (urlString = '') => {
    const trimmed = String(urlString || '').trim();
    if (!trimmed || !/^https?:\/\//i.test(trimmed)) {
        return '';
    }
    try {
        const pathname = new URL(trimmed).pathname || '';
        const segment = pathname.split('.').pop() || '';
        return normalizeMediaExtension(segment);
    } catch (error) {
        return '';
    }
};

const getUrlTypeFromSource = (source = '') => {
    if (!source || typeof source !== 'string') return '';
    const cleanedSource = source.trim();
    if (!cleanedSource) return '';

    // Whole input is one URL — parse once; do not re-match and recurse on the same string.
    if (/^https?:\/\/[^\s"'<>]+$/i.test(cleanedSource)) {
        return getExtensionFromUrl(cleanedSource);
    }

    const urlMatches = cleanedSource.match(/https?:\/\/[^\s"'<>]+/gi) || [];
    for (const urlValue of urlMatches) {
        const extensionFromUrl = getExtensionFromUrl(urlValue);
        if (extensionFromUrl) return extensionFromUrl;
    }

    const extensionPattern = /\.([a-zA-Z]{2,5})(?:[\?#"'\s]|$)/gi;
    let extensionMatch = extensionPattern.exec(cleanedSource);
    while (extensionMatch) {
        const normalizedExtension = normalizeMediaExtension(extensionMatch[1]);
        if (normalizedExtension) return normalizedExtension;
        extensionMatch = extensionPattern.exec(cleanedSource);
    }

    return '';
};

const resolveWebMediaUrlType = ({
    importUrl = '',
    webMediaURLType = '',
    webMediaURL = '',
    edmContent = '',
    isInPageBanner = false,
}) => {
    if (isInPageBanner) {
        const normalizedEdmContent = edmContent?.trim() || '';
        const hasImportUrlType = !!getUrlTypeFromSource(importUrl);
        const edmMediaType = getUrlTypeFromSource(normalizedEdmContent);
        const isHtmlDocument =
            /<!doctype\s+html/i.test(normalizedEdmContent) ||
            /<html[\s>]/i.test(normalizedEdmContent) ||
            /<head[\s>]/i.test(normalizedEdmContent) ||
            /<body[\s>]/i.test(normalizedEdmContent);

        if (!hasImportUrlType && normalizedEdmContent) {
            if (isHtmlDocument && !edmMediaType) return 'html';
            if (edmMediaType) return edmMediaType;
        }

        return (
            getUrlTypeFromSource(importUrl) ||
            getUrlTypeFromSource(webMediaURL) ||
            getUrlTypeFromSource(edmContent) ||
            getUrlTypeFromSource(webMediaURLType) ||
            'html'
        );
    }

    return getUrlTypeFromSource(webMediaURLType) || getUrlTypeFromSource(webMediaURL) || '';
};

export const buildTabContent = (formState, _type, timeZoneId, location, notificationEditData) => {
    const formStateBtnText = formState?.buttonText;

    let interactiveButtons = formStateBtnText?.map((item, idx) => {
        // save payload interactiveBtn id changes
        // smartlink -  3
        // unsubscribe -  4
        // dismiss -  2
        // may be later - 1

        if (item?.text?.id >= 2 && item?.text?.id <= 9) {
            // return {
            //     key: item?.customText,
            //     value: item?.isNewLink ? item?.link : item?.link[item?.link?.length - 1],
            //     type: item?.isNewLink ? item.text?.value : 0,
            // };
            return {
                key: item?.customText,
                value: item?.text?.id >= 5 && item?.text?.id <= 9 ? Number(item?.text?.id) - 4 : Number(item?.text?.id),
                type: item.text?.value,
            };
        } else if (!!item?.link || item?.isNewLink) {
            return {
                key: item?.customText,
                value: item?.link,
                type: item.text?.value,
            };
        }
    });

    let tempContent = [];
    let expiryTime = formState?.expiry ? formState?.expiryTime?.value : '';
    let tempContentImport = !!formState?.edmContent ? formState?.edmContent : '';
    let tempContentCreate = !!formState?.editorText ? formState?.editorText : '';
    let tempContentTemplate = !!formState?.templateContent ? formState?.templateContent : '';
    let titleText = !!formState?.title?.text ? formState?.title?.text : '';
    let shortDescText = !!formState?.shortDesc?.text ? formState?.shortDesc?.text : '';
    let scheduleTime = !!formState?.schedule ? getCreatedDate(formState?.schedule, 'campaign') : '';

    scheduleTime = getScheduleDate(formState, notificationEditData);

    let pushImagepath = '';
    if (!!formState?.previewImage && !formState?.previewVideo) pushImagepath = formState?.previewImage;
    else if (!!formState?.browserImage && !formState?.previewVideo) pushImagepath = formState?.browserImage;
    else if (!!formState?.previewVideo) pushImagepath = formState?.previewVideo;

    // Use server image URL if available, fallback to original pushImagepath
    let serverImagePath = formState?.serverImageURL || formState?.serverVideoURL || pushImagepath;

    let tempWebContent = {
        webMediaURL: !!formState?.uploadImage ? '' : serverImagePath,
        webMediaURLType: !!formState?.uploadImage
            ? ''
            : serverImagePath?.split('.')?.[formState?.previewImage?.split('.')?.length - 1],
        bgOverlayEnabled: formState?.bgOverlay === true ? true : false,
        bgOverlayColor: !!formState?.bgOverlayColor?.color ? formState?.bgOverlayColor?.color : '',
        bgOverlayOpacity: !!formState?.bgOverlayColor?.opacity ? formState?.bgOverlayColor?.opacity : 0,
        webPushexpirySchedule: !!formState?.expiryTime?.value ? expiryTime : '',
        webPushExpiryhours: formState?.expiryValue || '',
        contentUrl: !!formState?.importUrl ? formState?.importUrl : '',
        hashTag: formState?.hashtag?.length !== 0 ? formState?.hashtag?.join() : '',
        cBgColour2: !!formStateBtnText?.[1]?.backgroundColor ? formStateBtnText?.[1]?.backgroundColor : '',
        isDaylightSavings: formState?.daylightSavings || false,
    };
    // let interactiveValue =
    //     formStateBtnText?.[0]?.text?.id >= 5 && formStateBtnText?.[0]?.text?.id < 10
    //         ? 9 - formStateBtnText?.[0]?.text?.id
    //         : formStateBtnText?.[0]?.text?.id;
    // let interactiveValue2 =
    //     formStateBtnText?.[1]?.text?.id >= 5 && formStateBtnText?.[1]?.text?.id < 10
    //         ? 9 - formStateBtnText?.[1]?.text?.id
    //         : formStateBtnText?.[1]?.text?.id;

    let interactiveValue = formStateBtnText?.[0]?.text?.id;
    let interactiveValue2 = formStateBtnText?.[1]?.text?.id;

    const getInterActiveIdButton = (btnId, btnLevel) => {
        // smartLink1 to smarrLink5 ===> 5 to 9
        // unsubscribe ===> 4
        // dismiss ===> 2
        // web url ===> 10

        if (btnId >= 5 && btnId <= 9) return 3;
        else if (btnId === 10 || btnId === 12 || btnId === 13) return 3;
        else return btnLevel === 1 ? interactiveValue : interactiveValue2;
    };
    let _urlType = resolveWebMediaUrlType({
        importUrl: formState?.importUrl,
        webMediaURLType: tempWebContent?.webMediaURLType,
        webMediaURL: tempWebContent?.webMediaURL,
        edmContent: formState?.edmContent,
        isInPageBanner: !!formState?.inPageBanner?.bannerName,
    });

    let tempObj = {
        // localscheduleDateTime: formState?.isSendTestMail === 2 ? '' : scheduleTime,
        localscheduleDateTime: scheduleTime,
        timezoneId: handleAllChannelTimeZonePayload(
            formState?.campaignType,
            location?.timeZoneId,
            formState?.timezone,
            timeZoneId,
            location,
        ),
        zipFileName: !!formState?.zipFileText ? formState?.zipFileText : '',
        pushNotifyChannelDetailId: !!formState?.pushNotifyChannelDetailId ? formState?.pushNotifyChannelDetailId : 0,
        templateId: 0,
        contentType: getContentType[formState?.currentTabIndex] || '',
        title: titleText,
        titleColor: !!formState?.title?.fontColor ? formState?.title?.fontColor : '',
        content:
            getContentType[formState?.currentTabIndex] === 'R'
                ? tempContentCreate
                : getContentType[formState?.currentTabIndex] === 'Z'
                    ? tempContentImport
                    : getContentType[formState?.currentTabIndex] === 'T'
                        ? tempContentTemplate
                        : tempContentCreate,
        contentTextColour: !!formState?.customization?.color ? formState?.customization?.color : '',
        contentBgColour: !!formState?.customization?.background
            ? formState?.customization?.background === 'transparent'
                ? '#00000000'
                : formState?.customization?.background
            : '#00000000',
        splitType: '',

        isInteractivebuttonEnabled: formState?.interactivity,
        interactivebuttonTypes: !!formStateBtnText?.[0]?.type ? formStateBtnText?.[0]?.type : '',
        interactivebuttonValue: !!interactiveValue ? String(getInterActiveIdButton(interactiveValue, 1)) : '',
        caTextColour: !!formStateBtnText?.[0]?.fontColor ? formStateBtnText?.[0]?.fontColor : '',
        caBgColour: !!formStateBtnText?.[0]?.backgroundColor ? formStateBtnText?.[0]?.backgroundColor : '',
        interactivebuttonTypes2: !!formStateBtnText?.[1]?.type ? formStateBtnText?.[1]?.type : '',
        interactivebuttonValue2: !!interactiveValue2 ? String(getInterActiveIdButton(interactiveValue2, 2)) : '',
        caTextColour2: !!formStateBtnText?.[1]?.fontColor ? formStateBtnText?.[1]?.fontColor : '',
        interactiveCustParameter: !!interactiveButtons?.[0] ? '[' + JSON.stringify(interactiveButtons[0]) + ']' : '',
        interactiveCustParameter2: !!interactiveButtons?.[1] ? '[' + JSON.stringify(interactiveButtons[1]) + ']' : '',
        isExpiryButtonEnabled: formState?.expiry,

        pushImagePath: pushImagepath,
        shortDesc: getContentType[formState?.currentTabIndex] === 'Z' && formState?.makeAlert ? shortDescText : '',
        isTitleON: getContentType[formState?.currentTabIndex] === 'Z' ? formState?.makeAlert : false,
        thumbnailImagePath:
            getContentType[formState?.currentTabIndex] === 'Z' &&
                formState?.makeAlert &&
                formState?.thumbnailUrl?.imageUrl
                ? formState?.thumbnailUrl?.imageUrl
                : '',
        impressionCount: !!formState?.impressions?.value ? Number(formState?.impressions?.value) : 0,
        priority: !!formState?.priority?.value ? Number(formState?.priority?.value) : 0,
        bannerId: !!formState?.inPageBanner?.bannerId ? Number(formState.inPageBanner.bannerId) : 0,
        bannerName: !!formState?.inPageBanner?.bannerName ? formState?.inPageBanner?.bannerName : '',
        webMediaURLType: _urlType,
    };
    if (!formState?.splitTest && formState?.layoutPosition?.value !== 'Carousel') {
        tempObj = {
            ...tempObj,
            ...tempWebContent,
        };
        tempObj.webMediaURLType = _urlType;
        tempContent.push(tempObj);
    } else {
        let splitList = formState?.splitTabList?.length ? formState?.splitTabList : formState?.splitTabs;
        for (var i = 0; i < splitList?.length; i++) {
            // console.log('Split type :::: ', formstateSplit);

            const formstateSplit = formState?.[`split${splitObj[i]}`];

            // carousel or split flow interactive id
            const getSplitInterActiveIdButton = (btnId) => {
                // smartLink1 to smarrLink5 ===> 5 to 9
                // unsubscribe ===> 4
                // dismiss ===> 2
                // web url ===> 10
                const updateBtnId = Number(btnId);
                if (updateBtnId >= 5 && updateBtnId <= 9) return '3';
                else return String(updateBtnId);
            };

            const getSplitCustomButtonValue = (buttonText) => {
                return buttonText?.map((item, idx) => {
                    // save payload interactiveBtn id changes
                    // smartlink -  3
                    // unsubscribe -  4
                    // dismiss -  2
                    // may be later - 1

                    if (item?.text?.id >= 2 && item?.text?.id <= 9) {
                        return {
                            key: item?.customText,
                            value:
                                item?.text?.id >= 5 && item?.text?.id <= 9
                                    ? Number(item?.text?.id) - 4
                                    : Number(item?.text?.id),
                            type: item.text?.value,
                        };
                    } else if (!!item?.link || item?.isNewLink) {
                        return {
                            key: item?.customText,
                            value: item?.link,
                            type: item.text?.value,
                        };
                    }
                });
            };

            const interactiveButtonsSplit = getSplitCustomButtonValue(formstateSplit?.buttonText);

            let isCarousel = formState?.layoutPosition?.value === 'Carousel';
            let expirySplit = formstateSplit?.expiry ? formstateSplit?.expiryTime?.value : '';
            let tempContentImportSplit = !!formstateSplit?.edmContent ? formstateSplit?.edmContent : '';
            let tempContentCreateSplit = !!formstateSplit?.editorText ? formstateSplit?.editorText : '';
            let tempContentTemplateSplit = !!formstateSplit?.templateContent ? formstateSplit?.templateContent : '';
            // let interactiveButtonsSplit = formstateSplit?.buttonText?.map((item, idx) => {
            //     if (item?.text?.value === 'Custom action')
            //         return {
            //             key: item?.customText,
            //             value: item?.isNewLink ? item?.link : item?.link.slice(-1),
            //             type: item?.isNewLink ? item?.urlType?.value : 0,
            //         };
            // });
            let scheduleTimeCarousel = getScheduleDate(formState);
            let scheduleTimeSplit = !!formstateSplit?.schedule
                ? getCreatedDate(formstateSplit?.schedule, 'campaign')
                : '';
            let scheduleTimeValue = isCarousel ? scheduleTimeCarousel : scheduleTimeSplit;
            let textContent =
                getContentType[formstateSplit?.currentTabIndex] === 'R'
                    ? tempContentCreateSplit
                    : getContentType[formstateSplit?.currentTabIndex] === 'Z'
                        ? tempContentImportSplit
                        : getContentType[formstateSplit?.currentTabIndex] === 'T'
                            ? tempContentTemplateSplit
                            : tempContentCreateSplit;

            let pushImagepath = '';
            if (!!formstateSplit?.previewImage && !formstateSplit?.previewVideo)
                pushImagepath = formstateSplit?.previewImage;
            else if (!!formstateSplit?.browserImage && !formstateSplit?.previewVideo)
                pushImagepath = formstateSplit?.browserImage;
            else if (!!formstateSplit?.previewVideo) pushImagepath = formstateSplit?.previewVideo;

            let titleTextSplit = !!formstateSplit?.title?.text ? formstateSplit?.title?.text : '';
            let shortDescTextSplit = !!formstateSplit?.shortDesc?.text ? formstateSplit?.shortDesc?.text : '';
            let hashtagCarousel = formState?.hashtag?.length !== 0 ? formState?.hashtag?.join() : '';
            let hashtagSplit = formstateSplit?.hashtag?.length !== 0 ? formstateSplit?.hashtag?.join() : '';
            let expiryTimeCarousel = !!formState?.expiryTime?.value ? expiryTime : '';
            let expiryTimeSplit = !!formstateSplit?.expiryTime?.value ? expiryTime : '';
            let interativeSplitValue = getSplitInterActiveIdButton(formstateSplit?.buttonText?.[0]?.text?.id);
            let interativeSplitValue2 = getSplitInterActiveIdButton(formstateSplit?.buttonText?.[1]?.text?.id);
            let tempWebContentSplit = {
                contentUrl: !!formstateSplit?.importUrl ? formstateSplit?.importUrl : '',
                hashTag: isCarousel ? hashtagCarousel : hashtagSplit,
                webMediaURL: !!formstateSplit?.uploadImage
                    ? ''
                    : !!formstateSplit?.serverImageURL
                        ? formstateSplit?.serverImageURL
                        : pushImagepath,
                webMediaURLType: !!formstateSplit?.uploadImage
                    ? ''
                    : !!formstateSplit?.serverImageURL
                        ? formstateSplit?.serverImageURL?.split('.')?.pop()
                        : pushImagepath?.split('.')?.pop(),
                bgOverlayEnabled: formstateSplit?.bgOverlay === true ? true : false,
                bgOverlayColor: !!formstateSplit?.bgOverlayColor?.color ? formstateSplit?.bgOverlayColor?.color : '',
                bgOverlayOpacity: !!formstateSplit?.bgOverlayColor?.opacity
                    ? formstateSplit?.bgOverlayColor?.opacity
                    : 0,
                cBgColour2: !!formstateSplit?.buttonText?.[1]?.backgroundColor
                    ? formstateSplit?.buttonText?.[1]?.backgroundColor
                    : '',
                // webPushexpirySchedule: !!formstateSplit?.expiryTime?.value ? expiryTime : '',
                webPushexpirySchedule: isCarousel ? expiryTimeCarousel : formstateSplit?.expiryTime?.value || '',
                webPushExpiryhours: isCarousel ? formState?.expiryValue : formstateSplit?.expiryValue,
                isDaylightSavings: formstateSplit?.daylightSavings || false,
            };
            let _urlType = resolveWebMediaUrlType({
                importUrl: formstateSplit?.importUrl || formState?.importUrl,
                webMediaURLType: tempWebContentSplit?.webMediaURLType,
                webMediaURL: tempWebContentSplit?.webMediaURL,
                edmContent: formstateSplit?.edmContent,
                isInPageBanner: !!formState?.inPageBanner?.bannerName,
            });

            let tempObjSplit = {
                // localscheduleDateTime: formState?.isSendTestMail === 2 ? '' : scheduleTimeValue,
                localscheduleDateTime: scheduleTimeValue,
                timezoneId: handleAllChannelTimeZonePayload(
                    formState?.campaignType,
                    location?.timeZoneId,
                    isCarousel ? formState?.timezone : formstateSplit?.timezone,
                    timeZoneId,
                    location,
                ),
                zipFileName: !!formstateSplit?.zipFileText ? formstateSplit?.zipFileText : '',
                pushNotifyChannelDetailId: !!formstateSplit?.pushNotifyChannelDetailId
                    ? formstateSplit?.pushNotifyChannelDetailId
                    : 0,
                templateId: 0,
                contentType: getContentType[formstateSplit?.currentTabIndex] || '',
                title: !!formstateSplit?.title?.text ? formstateSplit?.title?.text : '',
                titleColor: !!formstateSplit?.title?.fontColor ? formstateSplit?.title?.fontColor : '',
                content:
                    getContentType[formstateSplit?.currentTabIndex] === 'R'
                        ? tempContentCreateSplit
                        : getContentType[formstateSplit?.currentTabIndex] === 'Z'
                            ? tempContentImportSplit
                            : getContentType[formstateSplit?.currentTabIndex] === 'T'
                                ? tempContentTemplateSplit
                                : tempContentCreateSplit,
                contentTextColour: !!formstateSplit?.customization?.color ? formstateSplit?.customization?.color : '',
                contentBgColour: !!formstateSplit?.customization?.background
                    ? formstateSplit?.customization?.background === 'transparent'
                        ? '#00000000'
                        : formstateSplit?.customization?.background
                    : '',

                // splitType: formState?.layoutPosition?.value === 'Carousel' ? '' : splitObj[i],
                splitType: formState?.layoutPosition?.value === 'Carousel' ? carouselObj[i] : splitObj[i],

                bgOverlayEnabled: formstateSplit?.bgOverlay,
                bgOverlayColor: !!formstateSplit?.bgOverlayColor?.color ? formstateSplit?.bgOverlayColor?.color : '',
                bgOverlayOpacity: !!formstateSplit?.bgOverlayColor?.opacity
                    ? formstateSplit?.bgOverlayColor?.opacity
                    : 0,
                isInteractivebuttonEnabled: formstateSplit?.interactivity,
                interactivebuttonTypes: !!formstateSplit?.buttonText?.[0]?.type
                    ? formstateSplit?.buttonText?.[0]?.type
                    : '',
                interactivebuttonValue: !!formstateSplit?.buttonText?.[0]?.text?.value ? interativeSplitValue : '',
                caTextColour: !!formstateSplit?.buttonText?.[0]?.fontColor
                    ? formstateSplit?.buttonText?.[0]?.fontColor
                    : '',
                caBgColour: !!formstateSplit?.buttonText?.[0]?.backgroundColor
                    ? formstateSplit?.buttonText?.[0]?.backgroundColor
                    : '',
                interactivebuttonTypes2: !!formstateSplit?.buttonText?.[1]?.type
                    ? formstateSplit?.buttonText?.[1]?.type
                    : '',
                interactivebuttonValue2: !!formstateSplit?.buttonText?.[1]?.text?.value ? interativeSplitValue2 : '',
                caTextColour2: !!formstateSplit?.buttonText?.[1]?.fontColor
                    ? formstateSplit?.buttonText?.[1]?.fontColor
                    : '',

                interactiveCustParameter: !!interactiveButtonsSplit?.[0]
                    ? '[' + JSON.stringify(interactiveButtonsSplit[0]) + ']'
                    : '',
                interactiveCustParameter2: !!interactiveButtonsSplit?.[1]
                    ? '[' + JSON.stringify(interactiveButtonsSplit[1]) + ']'
                    : '',
                isExpiryButtonEnabled: isCarousel ? formState?.expiry : formstateSplit?.expiry,
                // webPushexpirySchedule: !!formstateSplit?.expiryTime?.value ? expirySplit : '',
                // webPushExpiryhours: !!formstateSplit?.expiryValue
                //     ? formstateSplit?.expiryValue
                //     : '',
                pushImagePath: !!formstateSplit?.serverImageURL
                    ? formstateSplit?.serverImageURL
                    : !!formstateSplit?.serverVideoURL
                        ? formstateSplit?.serverVideoURL
                        : pushImagepath,
                shortDesc:
                    getContentType[formstateSplit?.currentTabIndex] === 'Z' && formstateSplit?.makeAlert
                        ? shortDescTextSplit
                        : '',
                isTitleON: getContentType[formstateSplit?.currentTabIndex] === 'Z' && formstateSplit?.makeAlert,
                thumbnailImagePath:
                    getContentType[formstateSplit?.currentTabIndex] === 'Z' &&
                        formstateSplit?.makeAlert &&
                        formstateSplit?.thumbnailUrl?.imageUrl
                        ? formstateSplit?.thumbnailUrl?.imageUrl
                        : '',
                impressionCount: !!formstateSplit?.impressions?.value ? Number(formstateSplit?.impressions?.value) : 0,
                priority: !!formstateSplit?.priority?.value ? Number(formstateSplit?.priority?.value) : 0,
                bannerId: !!formState?.inPageBanner?.bannerId ? Number(formState.inPageBanner.bannerId) : 0,
                bannerName: !!formState?.inPageBanner?.bannerName ? formState.inPageBanner.bannerName : '',
                webMediaURLType: _urlType,
            };
            tempObjSplit = {
                ...tempObjSplit,
                ...tempWebContentSplit,
            };
            tempObjSplit.webMediaURLType = _urlType;

            // debugger;
            tempContent.push(tempObjSplit);
        }
    }
    return tempContent;
};

export const buildPayload = (formState, _type, timeZoneId, mobileApp, location, notificationEditData) => {
    let sendMail = formState?.approvalList?.isApprovalInputEmail
        ? formState?.approvalList?.testEmail
        : formState?.approvalList?.testEmail?.email;
    // console.log('Formstate :::: ', formState);
    const {
        parentChannelDetailId = 0,
        parentChannelDetailType = '',
        levelNumber = 1,
        isALLorAny = 'ALL',
        flowChannel = 0,
        domId = '',
        dynamiclistId = 0,
        channelId = '',
        channelFriendlyName = '',
        channelDetailType = '',
        channelDetailId,
        addOnLevel = 0,
        activeChannel = '',
        actionTimeDuration = '',
        actionTime = '-1',
        actionId = 0,
        dataSource = 'TL',
        isAutoRefereshenabled = false,
        approvalList,
    } = formState;
    const isWorkflowEnabled = _get(approvalList, 'requestApproval', false);
    const approvarList = isWorkflowEnabled
        ? _map(_get(approvalList, 'name', []), ({ approverName, isCustom, mandatory }) => {
            return {
                approvarId: isCustom ? 0 : approverName.userId,
                approvarName: isCustom ? approverName : approverName.email,
                flag: mandatory || false,
            };
        })
        : [];
    let tempWeb = {
        domainUrl: !!formState?.domain?.domainUrl ? formState?.domain?.domainUrl : '',
        inboxClassification: !!formState?.inboxClassification ? formState?.inboxClassification?.classificationId : '',
        inboxClassificationId: !!formState?.inboxClassification ? formState?.inboxClassification?.cdId : 0,
        pushLayoutValue: !!formState?.layoutPosition ? formState?.layoutPosition?.value : '',
        pushLayoutId: !!formState?.layoutPosition ? formState?.layoutPosition?.id : 0,
        positionValue: !!formState?.position ? formState?.position?.value : '',
        pushTypeId: !!formState?.sendwebPushTo?.id ? formState?.sendwebPushTo?.id : 0,
        deliveryTypeId: !!formState?.deliveryType ? formState?.deliveryType?.id : 0,
        allOrAny: 'ALL',
        testPushCampaignEmailAddres: !!sendMail ? sendMail : '',
        bannerId: !!formState?.inPageBanner?.bannerId ? Number(formState.inPageBanner.bannerId) : 0,
        bannerName: !!formState?.inPageBanner?.bannerName ? formState?.inPageBanner?.bannerName : '',
        webSplit: {
            pushChannelId: 0,
            ...resolveSplitSliderPayload({
                splitTest: formState?.splitTest,
                isCarousel: formState?.layoutPosition?.value === 'Carousel',
                audienceList: formState?.audience,
                countField: 'recipientCountWebPush',
                sliderSplitter: formState?.sliderSplitter,
                splitTabList: formState?.splitTabList,
            }),
        },
        webAutoSchedule: {
            splitScheduleID: formState?.splitscehdule?.splitScheduleID ?? 0,
            autoSchedule: !!formState?.splitscehdule?.autoSchedule ? formState?.splitscehdule?.autoSchedule : false,
            performedBy: 2,
            startIn: !!formState?.splitscehdule?.duration ? formState?.splitscehdule?.duration : '',
            periodRange: !!formState?.splitscehdule?.time?.id ? formState?.splitscehdule?.time?.id : '',
        },
    };
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
    let temp = {
        copy: false,
        isAutoRefereshenabled,
        dataSource: formState?.campaignType === 'T' ? 'DL' : dataSource,
        positionId: !!formState?.position ? Number(formState?.position?.id) : 0,
        isCarousel: formState?.layoutPosition?.value === 'Carousel',
        isSplit: formState?.layoutPosition?.value === 'Carousel' ? false : formState?.splitTest,
        isSendTestMail: !!formState?.isSendTestMail ? Number(formState?.isSendTestMail) : 0,

        parentChannelDetailId: Number(parentChannelDetailId),
        parentChannelDetailType: parentChannelDetailType,
        actionId: Number(actionId),
        actionTime: String(actionTime),
        actionTimeDuration: actionTimeDuration,
        levelNumber: Number(levelNumber),
        domId: String(domId),
        channelFriendlyName: channelFriendlyName,
        flowChannel: Number(flowChannel),
        addOnLevel: Number(addOnLevel),
        allOrAny: isALLorAny,
        dynamiclistId: Number(dynamiclistId),
        channelId: String(channelId),
        channelDetailType: channelDetailType,
        activeChannel: String(activeChannel),
        isSendTimeOptEnable: false,
        isSecureMessageON: formState?.isSecureMessage ? true : false,

        ...requestApproval,

        ...handleMDCExtraPayload(location),
        ...handleAllChannelPayload('notification', formState),

        segmentationListId: !!formState?.audience ? formState?.audience?.map((item) => item?.segmentationListId) : [],
        content: buildTabContent(formState, 'web', timeZoneId, location, notificationEditData),
        // [
        // {
        //     localscheduleDateTime: formState?.schedule,
        //     timezoneId: formState?.timezone?.timeZoneID,
        //     zipFileName: formState?.zipFile,
        //     pushNotifyChannelDetailId: 0,
        //     templateId: 0,
        //     contentType: getContentType[formState?.currentTab],
        //     title: formState?.title?.text,
        //     titleColor: formState?.title?.fontColor,
        //     content: formState?.edmContent,
        //     contentTextColour: '',
        //     contentBgColour: formState?.bgOverlayColor,
        //     contentUrl: formState?.importUrl,
        //     splitType: '',
        //     webMediaURL: null,
        //     webMediaURLType: null,
        //     hashTag: formState?.hashTag?.join(),
        //     bgOverlayEnabled: formState?.bgOverLay,
        //     bgOverlayColor: formState?.bgOverlayColor,
        //     bgOverlayOpacity: 3,
        //     isInteractivebuttonEnabled: formState?.interactivity,
        //     interactivebuttonTypes: formStateBtnText?.[0]?.type,
        //     interactivebuttonValue: formStateBtnText?.[0]?.text?.value,
        //     caTextColour: formStateBtnText?.[0]?.fontColor,
        //     caBgColour: formStateBtnText?.[0]?.backgroundColor,
        //     interactivebuttonTypes2: formStateBtnText?.[1]?.type,
        //     interactivebuttonValue2: formStateBtnText?.[1]?.text?.value,
        //     caTextColour2: formStateBtnText?.[1]?.fontColor,
        //     cBgColour2: formStateBtnText?.[1]?.backgroundColor,
        //     interactiveCustParameter: '[{"key":"Custom1","value":"1","type":"0"}]',
        //     interactiveCustParameter2:
        //         '[{"key":"Custome2","value":"https://run19.resulticks.com/","type":"WebURL"}]',
        //     isExpiryButtonEnabled: formState?.expiry,
        //     webPushexpirySchedule: formState?.expirytime?.includes('hour') ? 'H' : 'D',
        //     webPushExpiryhours: formState?.expiryValue,
        //     pushImagePath: formState?.upLoadImage,
        //     shortDesc: '',
        //     isTitleON: '',
        // },
        // ],
    };

    temp = {
        ...temp,
        ...tempWeb,
    };

    return temp;

    // const {
    //     mobileApp,
    //     sendwebPushTo,
    //     domain,
    //     audience,
    //     deliveryType,
    //     splitTest,
    //     isSecureMessage,
    //     inboxClassification,
    //     layoutPosition,
    //     position,
    //     splitscehdule,
    //     splitTabs,
    //     splitABCount,
    //     isScheduled,
    //     ...restState
    // } = formState;
    // const getSourceType = (id) => {
    //     if (id === 0) return 'R';
    //     else if (id === 1) return 'Z';
    //     return 'T';
    // };
    // const buildTabPayload = (state) => {
    //     const payload = {
    //         schedule: state.schedule,
    //         timezone: _get(state, 'timezone.timezoneId', 0),
    //         sendTimeRecommendation: state.sendTimeRecommendation,
    //         isDaylightSavings: _get(state, 'daylightSavings', false),
    //         viewInBrowser: state.viewInBrowser,
    //         image: state.previewImage,
    //         isExpiry: state.expiry,
    //         title: state.title.text,
    //         isInteractivity: state.interactivity,
    //         hashtag: state.hashtag,
    //         isAlert: state.alert,
    //         contentSourceType: getSourceType(state.currentTab),
    //         ...(type === 'mobile' && {
    //             titleCustomization: {
    //                 fontColor: state.title.fontColor,
    //             },
    //             textCustomization: state.customization,
    //         }),
    //         ...(state.expiry && { expiryTime: state.expiryTime, expiryValue: state.expiryValue }),
    //         ...(state.interactivity && {
    //             buttonText: _map(state.buttonText, ({ type, text, customText, link, fontColor, backgroundColor }) => {
    //                 return {
    //                     type,
    //                     text: customText ? customText : text,
    //                     customization: { fontColor, backgroundColor },
    //                     customLink: link,
    //                 };
    //             }),
    //         }),
    //         ...(state.currentTab === 0 && { editorText: state.editorText }),
    //     };
    //     if (state.currentTab === 1) {
    //         if (state.importType === 'url') payload.importUrl = state.importUrl;
    //         else payload.zipFile = state.zipFile;
    //     }
    //     return payload;
    // };

    // return {
    //     ...(type === 'mobile' && { mobileApp }),
    //     ...(type === 'web' && { sendwebPushTo, domain }),
    //     audience,
    //     deliveryType,
    //     splitTest,
    //     isSecureMessage,
    //     inboxClassification,
    //     layoutPosition,
    //     position,
    //     isScheduled,
    //     isSplit: splitTest,
    //     ...(!splitTest && { ...buildTabPayload(restState) }),
    //     ...(splitTest && {
    //         splitTabs: _map(splitTabs, (tabName) => buildTabPayload(formState[tabName])),
    //         ...(splitscehdule.autoSchedule && { autoSchedule: splitscehdule }),
    //         ...(Object.keys(splitABCount)?.length && { splitCount: splitABCount }),
    //     }),
    // };
};

export const getEditFormData = async (
    data,
    getAudienceData,
    handleSendPushTo,
    getInboxClassificationData,
    updateTabState,
    usersList,
    inboxData,
    smartLinksWithLabels,
    audienceListData,
    setDirtyReset,
    setEditAutoScheduleDetails,
) => {
    const { timeZoneList } = getmasterData();
    const {
        domainUrl,
        inboxClassificationId,
        requestForApproval,
        testPushCampaignEmailAddres,
        segmentationListId,
        deliveryTypeId,
        positionId,
        pushLayoutId,
        savedAudienceCountList,
        audienceCount,
        pushTypeId,
        isAutoRefereshenabled,
        isSplitAbEnabled,
        isSecureMessageON,
        isSendTimeOptEnable,
        isCGTGEnabled,
        content,
        isCarousel,
        webAutoSchedule,
    } = data || {};

    let domainList = await handleSendPushTo();
    let domains = domainList?.webNotifydomain?.filter((item) => {
        // console.log('item ::::: ', item?.domainUrl, domainUrl, item?.domainUrl === domainUrl);
        return item?.domainUrl === domainUrl;
    });

    let defaultAudienceList = !audienceListData?.length ? await getAudienceData(domains?.[0], '') : audienceListData;
    let audienceMap = [];
    let inboxClassificationList =
        // inboxData?.length === 0 || inboxData === undefined
        await getInboxClassificationData({ domain: domains[0], edit: true }, '', 'isEdit');
    // : inboxData;
    let inboxClassification = inboxClassificationList?.filter((item) => item?.cdId === inboxClassificationId);
    // let testEmail = {};
    // let testUsersList = !!testPushCampaignEmailAddres
    //     ? usersList?.filter((item) => {
    //           if (item?.email === testPushCampaignEmailAddres) {
    //               let tempReturn = {
    //                   ...item,
    //                   name: item?.firstName + ' (' + item?.email + ')',
    //               };
    //               //   console.log('Return ::::: ', tempReturn);
    //               testEmail = tempReturn;
    //               return tempReturn;
    //           }
    //       })
    //     : [];
    // console.log('Return users ::::::::::: ', testUsersList);

    // Process request for approval data - using same pattern as Email component
    const testEmail = _find(usersList, ['email', testPushCampaignEmailAddres]) || '';
    const isApprovalInputEmail = !testEmail && testPushCampaignEmailAddres ? true : false;

    segmentationListId?.map((item) => {
        for (var i = 0; i < defaultAudienceList?.length; i++) {
            if (defaultAudienceList[i].segmentationListId === item) audienceMap.push(defaultAudienceList[i]);
        }
    });
    let segmentFilterAudienceList =
        !audienceMap?.length && segmentationListId?.length
            ? await getAudienceData(domains?.[0], segmentationListId)
            : [];

    let deliveryType = DELIVERY_TYPE.filter((item) => item?.id === deliveryTypeId);
    let position = MODAL_POSISTION.filter((item) => item?.id === positionId);
    let layoutPosition = LAYOUT_POSITION.filter((item) => item?.id === pushLayoutId);
    var tempTabs = [];
    let smartLinksData = mapSmartLinksWithLabelsToButtonOptions(smartLinksWithLabels);
    let urlType = URL_TYPE?.map((item, index) => {
        return {
            id: index + 10,
            value: item?.value,
        };
    });
    let buttonTextData = [...BUTTON_TEXT, ...smartLinksData, ...urlType];

    const getEditFlowButtonText = (btnId, smartLinkData, btnLevel) => {
        if (Number(btnId) === 3 && smartLinkData?.length) {
            const findValue = buttonTextData?.find(
                (btnTxt) =>
                    btnTxt?.value?.replaceAll(' ', '')?.toLowerCase() ===
                    smartLinkData[0]?.type?.replaceAll(' ', '')?.toLowerCase(),
            );
            return { ...findValue, displayLabel: findValue?.value };
        } else {
            const findValue = buttonTextData.find(
                (item) =>
                    item.id ===
                    (btnLevel === 1
                        ? Number(content?.[i]?.interactivebuttonValue)
                        : Number(content?.[i]?.interactivebuttonValue2)),
            );
            return { ...findValue, displayLabel: findValue?.value };
        }
    };

    const getParseData = (CustParameter) => {
        if (!!CustParameter) {
            return JSON.parse(CustParameter);
        } else {
            return null;
        }
    };

    const finalAudienceList = audienceMap?.length ? audienceMap : segmentFilterAudienceList;
    const requestApproval = requestForApproval?.isWorkflowEnabled || parseInt(deliveryType?.[0]?.id, 10) === 5 || false;

    const matchAudienceType = audienceTypeList?.filter((typeList) =>
        finalAudienceList?.map((aud) => aud?.listType)?.includes(typeList?.id),
    );
    let uniqueList = _uniqBy(finalAudienceList, 'segmentationListId');
    uniqueList = handleUpdateEditAudienceCount({
        channelId: COMMUNICATION_CHANNEL_ID.WEB_NOTIFICATION,
        audience: uniqueList,
        savedAudienceCountList: savedAudienceCountList || [],
        statusId: content?.[0]?.statusId,
    });
    let tempEdit = {
        totalAudience: audienceCount || 0,
        sendwebPushTo: SEND_PUSH.filter((item) => item?.id === Number(pushTypeId))?.[0],
        isAutoRefereshenabled: isAutoRefereshenabled,
        mobileApp: '',
        approvalList: {
            testEmail: isApprovalInputEmail ? testPushCampaignEmailAddres : testEmail,
            isApprovalInputEmail,
            requestApproval,
            ...(requestApproval && {
                name: _map(requestForApproval.approvarList, ({ approvarName, flag }) => {
                    const approver = _find(usersList, ['email', approvarName]);
                    const name = !approver ? approvarName : approver;
                    const isMandatory = flag ? flag : false;
                    return { approverName: name, mandatory: isMandatory, isCustom: !approver };
                }),
            }),
            followHierarchy: requestForApproval?.isFollowHierarchy || false,
            approvalFrom: requestForApproval?.approvalFrom || 'All',
        },
        domain: domains?.[0],
        audience: uniqueList,
        audienceType: matchAudienceType?.length ? matchAudienceType : [audienceTypeList[0]],
        deliveryType: deliveryType?.[0],
        contentInput: '',
        interactivity: false,
        expiry: false,
        currentSplitTab: 0,
        channelType: '',
        splitTest: layoutPosition?.[0]?.value === 'Carousel' || isSplitAbEnabled,
        secureMessage: isSecureMessageON,
        expiryTime: 'hour(s)',
        expiryValue: '',
        inboxClassification: !!inboxClassification ? inboxClassification?.[0] : '',
        newInboxName: data?.inboxClassification ? data.inboxClassification : '',
        newInbox: false,
        layoutPosition: layoutPosition?.[0],
        position: position?.[0],
        inPageBanner: mapInPageBannerFromContentItem(content?.[0]),
        hashtag: [],
        alert: false,
        sendTimeRecommendation: isSendTimeOptEnable,
        isCGTGEnabled: isCGTGEnabled ?? false,
        currentTab: null,
        schedule: null,
        title: {
            text: '',
            fontColor: '',
        },
        previewImage: '',
        customization: {
            background: null,
            color: null,
        },
        splitscehdule: {
            autoSchedule: false,
            communicationPerformanceBy: 'SubjectLine',
            duration: '',
            time: 'Hour(s)',
        },
        buttonText: [
            {
                type: 'Button',
                text: '',
                customText: '',
                link: '',
                fontColor: '',
                backgroundColor: '',
                isNewLink: false,
                show: false,
            },
        ],
        editorText: '',
        //For Import
        importUrl: '',
        zipFile: '',
        edmContent: '',
        importType: 'url',
        viewInBrowser: '',
        pushNotifyChannelDetailId: 0,
        bgOverlayColor: '',
        bgOverlay: '',
        splitA: {
            expiry: false,
            expiryTime: 'hour(s)',
            expiryValue: '',
            buttonText: [
                {
                    type: 'Button',
                    text: '',
                    customText: '',
                    link: '',
                    fontColor: '',
                    backgroundColor: '',
                    isNewLink: false,
                    show: false,
                },
            ],
            customization: {
                background: null,
                color: null,
            },
            interactivity: false,
            hashtag: [],
            editorText: '',
            currentTab: null,
            title: {
                text: '',
                fontColor: '',
            },
            tabErrorText: '',
            schedule: null,
            sendTimeRecommendation: false,
            alert: false,
            previewImage: '',
            //For Import
            importUrl: '',
            zipFile: '',
            edmContent: '',
            importType: 'url',
            viewInBrowser: '',
            pushNotifyChannelDetailId: 0,
            bgOverlayColor: '',
            bgOverlay: '',
        },
        splitB: {
            expiry: false,
            expiryTime: 'hour(s)',
            expiryValue: '',
            buttonText: [
                {
                    type: 'Button',
                    text: '',
                    customText: '',
                    link: '',
                    fontColor: '',
                    backgroundColor: '',
                    isNewLink: false,
                    show: false,
                },
            ],
            customization: {
                background: null,
                color: null,
            },
            interactivity: false,
            hashtag: [],
            schedule: null,
            editorText: '',
            currentTab: null,
            title: {
                text: '',
                fontColor: '',
            },
            tabErrorText: '',
            alert: false,
            previewImage: '',
            //For Import
            importUrl: '',
            zipFile: '',
            edmContent: '',
            importType: 'url',
            viewInBrowser: '',
            sendTimeRecommendation: false,
            pushNotifyChannelDetailId: 0,
            bgOverlayColor: '',
            bgOverlay: '',
        },
        splitC: {
            expiry: false,
            expiryTime: 'hour(s)',
            schedule: null,
            expiryValue: '',
            customization: {
                background: null,
                color: null,
            },
            buttonText: [
                {
                    type: 'Button',
                    text: '',
                    customText: '',
                    link: '',
                    fontColor: '',
                    backgroundColor: '',
                    isNewLink: false,
                    show: false,
                },
            ],
            interactivity: false,
            hashtag: [],
            editorText: '',
            currentTab: null,
            title: {
                text: '',
                fontColor: '',
            },
            tabErrorText: '',
            alert: false,
            previewImage: '',
            //For Import
            importUrl: '',
            zipFile: '',
            edmContent: '',
            importType: 'url',
            viewInBrowser: '',
            sendTimeRecommendation: false,
            pushNotifyChannelDetailId: 0,
            bgOverlayColor: '',
            bgOverlay: '',
        },
        splitD: {
            expiry: false,
            expiryTime: 'hour(s)',
            expiryValue: '',
            schedule: null,
            customization: {
                background: null,
                color: null,
            },
            buttonText: [
                {
                    type: 'Button',
                    text: '',
                    customText: '',
                    link: '',
                    fontColor: '',
                    backgroundColor: '',
                    isNewLink: false,
                    show: false,
                },
            ],
            interactivity: false,
            hashtag: [],
            editorText: '',
            currentTab: null,
            title: {
                text: '',
                fontColor: '',
            },
            tabErrorText: '',
            alert: false,
            previewImage: '',
            //For Import
            importUrl: '',
            zipFile: '',
            edmContent: '',
            importType: 'url',
            viewInBrowser: '',
            sendTimeRecommendation: false,
            pushNotifyChannelDetailId: 0,
            bgOverlayColor: '',
            bgOverlay: '',
        },
    };
    // content?.reverse();
    for (var i = 0; i < content?.length; i++) {
        let buttonText = [];
        const timeZone = _find(timeZoneList, ['timeZoneID', content?.[i]?.timezoneId]);
        let interactiveCustJSON = !!content?.[i]?.interactiveCustParameter
            ? JSON.parse(content?.[i]?.interactiveCustParameter)
            : '';
        let interactiveCustJSON2 = !!content?.[i]?.interactiveCustParameter2
            ? JSON.parse(content?.[i]?.interactiveCustParameter2)
            : '';

        let interactiveCustValue1 =
            interactiveCustJSON?.[0]?.type === 0
                ? 'smartLink' + interactiveCustJSON?.[0]?.value
                : interactiveCustJSON?.[0]?.value;
        let interactiveCustValue2 =
            interactiveCustJSON2?.[0]?.type === 0
                ? 'smartLink' + interactiveCustJSON2?.[0]?.value
                : interactiveCustJSON2?.[0]?.value;
        // console.log(
        //     'Check custom value :::::]][[[[[[[[[[[][][][[[[[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]] :::::::::::: ',
        //     interactiveCustJSON2,
        //     interactiveCustValue2,
        // );
        let expiryData = isCarousel == true ? EXPIRE_CONFIG_FOR_MOBILE : EXPIRE_CONFIG;
        let expiryTime = expiryData?.filter((item) => item?.value === content?.[i]?.webPushexpirySchedule);
        if (!!content?.[i]?.interactivebuttonTypes) {
            let customText = !!getParseData(content?.[i]?.interactiveCustParameter)
                ? getParseData(content?.[i]?.interactiveCustParameter)[0]?.key
                : buttonTextData.filter((item) => item.id === Number(content?.[i]?.interactivebuttonValue))?.[0]
                    ?.value;
            buttonText.push({
                type: content?.[i]?.interactivebuttonTypes,
                urlType: !!content?.[i]?.interactiveCustParameter
                    ? URL_TYPE?.filter(
                        (item) => item?.value === JSON.parse(content?.[i]?.interactiveCustParameter)?.[0]?.type,
                    )?.[0]
                    : '',
                text: getEditFlowButtonText(
                    content?.[i]?.interactivebuttonValue,
                    !!content?.[i]?.interactiveCustParameter &&
                    JSON.parse(content?.[i]?.interactiveCustParameter),
                    1,
                ),
                customText: customText,
                link: !!content?.[i]?.interactiveCustParameter ? interactiveCustValue1 : '',
                fontColor: !!content?.[i]?.caTextColour ? content?.[i]?.caTextColour : '',
                backgroundColor: !!content?.[i]?.caBgColour ? content?.[i]?.caBgColour : '',
                isNewLink: !!content?.[i]?.interactiveCustParameter
                    ? !!JSON.parse(content?.[i]?.interactiveCustParameter)?.[0]?.type
                    : false,
                show: false,
            });
        }
        if (!!content?.[i]?.interactivebuttonTypes2) {
            // debugger;
            let customText2 = !!getParseData(content?.[i]?.interactiveCustParameter2)
                ? getParseData(content?.[i]?.interactiveCustParameter2)[0]?.key
                : buttonTextData.filter((item) => item.id === Number(content?.[i]?.interactivebuttonValue2))?.[0]
                    ?.value;
            buttonText.push({
                type: content?.[i]?.interactivebuttonTypes2,
                text: getEditFlowButtonText(
                    content?.[i]?.interactivebuttonValue2,
                    !!content?.[i]?.interactiveCustParameter2 &&
                    JSON.parse(content?.[i]?.interactiveCustParameter2),
                    2,
                ),
                urlType: !!content?.[i]?.interactiveCustParameter2
                    ? URL_TYPE?.filter(
                        (item) =>
                            item?.value === JSON.parse(content?.[i]?.interactiveCustParameter2)?.[0]?.type,
                    )?.[0]
                    : '',
                customText: customText2,
                link: !!content?.[i]?.interactiveCustParameter2 ? interactiveCustValue2 : '',
                fontColor: !!content?.[i]?.caTextColour2 ? content?.[i]?.caTextColour2 : '',
                backgroundColor: !!content?.[i]?.cBgColour2 ? content?.[i]?.cBgColour2 : '',
                isNewLink: !!content?.[i]?.interactiveCustParameter2
                    ? !!JSON.parse(content?.[i]?.interactiveCustParameter2)?.[0]?.type
                    : false,
                show: false,
            });
        }
        if (content?.length === 1 && content?.[i]?.splitType === '') {
            // debugger;
            tempEdit = {
                ...tempEdit,
                contentInput: !!content?.[i]?.contentType
                    ? getContentInput[content?.[i]?.contentType]?.value
                    : '',
                interactivity: content?.[i]?.isInteractivebuttonEnabled === 1,
                // currentSplitTab: i,
                edmContent:
                    !!content?.[i] && content?.[i].contentType === 'Z' ? content?.[i]?.content : '',

                currentTabIndex: !!content?.[i]?.contentType
                    ? getContentInput[content?.[i]?.contentType]?.id
                    : 0,
                expiry: content?.[i]?.isExpiryButtonEnabled === 1,
                expiryTime: !!content?.[i]?.webPushexpirySchedule ? expiryTime?.[0] : {},
                expiryValue: !!content?.[i]?.webPushExpiryhours ? content?.[i]?.webPushExpiryhours : '',
                // inboxClassification: !!inboxClassification ? inboxClassification?.[i] : '',
                pushNotifyChannelDetailId: !!content?.[i]?.pushNotifyChannelDetailId
                    ? content?.[i]?.pushNotifyChannelDetailId
                    : 0,
                hashtag: !!content?.[i]?.hashTag ? content?.[i]?.hashTag?.split(',') : [],
                buttonText: buttonText,
                bgOverlayColor: !!content?.[i]?.bgOverlayColor
                    ? {
                        color: content?.[i]?.bgOverlayColor,
                        opacity: Number(content?.[i]?.bgOverlayOpacity) || 1,
                    }
                    : '',
                bgOverlay: content?.[i]?.bgOverlayEnabled || false,
                title: {
                    text: !!content?.[i]?.title ? content?.[i]?.title : '',
                    fontColor: !!content?.[i]?.titleColor ? content?.[i]?.titleColor : '',
                },
                customization: {
                    background: !!content?.[i]?.contentBgColour ? content?.[i]?.contentBgColour : '',
                    color: !!content?.[i]?.contentTextColour ? content?.[i]?.contentTextColour : '',
                },
                editorText:
                    content?.[i]?.contentType === 'R' && !!content?.[i]?.content
                        ? content?.[i]?.content
                        : '',
                templateContent:
                    content?.[i]?.contentType === 'T' && !!content?.[i]?.content
                        ? content?.[i]?.content
                        : '',
                contentType: !!content?.[i]?.contentType ? content?.[i]?.contentType : '',
                editorTextLength: !!content?.[i]?.content ? content?.[i]?.content?.length : 0,
                timezone: !!content?.[i]?.timezoneId
                    ? timeZoneList?.filter((item) => item?.timeZoneID === content?.[i]?.timezoneId)[0]
                    : '',
                schedule: !!content?.[i]?.localscheduleDateTime
                    ? new Date(content?.[i]?.localscheduleDateTime)
                    : '',
                browserImage: !!content?.[i]?.pushImagePath ? content?.[i]?.pushImagePath : '',
                previewImage: !!content?.[i]?.pushImagePath ? content?.[i]?.pushImagePath : '',
                previewImage_video:
                    !!content?.[i]?.pushImagePath &&
                        ['mp4', 'mp3'].includes(content?.[i]?.pushImagePath?.split('.')?.pop())
                        ? content?.[i]?.pushImagePath
                        : '',
                makeAlert: content?.[i]?.isTitleON === 0 ? false : true,
                shortDesc: !!content?.[i]?.shortDesc
                    ? {
                        text: content?.[i]?.shortDesc,
                    }
                    : '',
                thumbnailUrl: {
                    selectImport: true,
                    imageUrl: content?.[i]?.thumbnailImagePath || '',
                    defaulPreview: true,
                },
                timeZone: timeZone,
                splitscehdule: {
                    autoSchedule: webAutoSchedule?.autoSchedule ?? false,
                    communicationPerformanceBy: 'Content',
                    duration: Number(webAutoSchedule?.startIn ?? 0),
                    time: _find(SCHEDULE_START_TIME_MENU, ['id', Number(webAutoSchedule?.periodRange ?? 0)]),
                    splitScheduleID: webAutoSchedule?.splitScheduleID ?? 0,
                },
                ...mapInPageImportFromContentItem(content?.[i]),
                impressions: !!content?.[i]?.impressionCount
                    ? {
                        id: Number(content?.[i]?.impressionCount),
                        value: String(content?.[i]?.impressionCount),
                    }
                    : '',
                priority: !!content?.[i]?.priority
                    ? { id: Number(content?.[i]?.priority), value: String(content?.[i]?.priority) }
                    : '',
            };
        } else {
            tempEdit = {
                ...tempEdit,
                splitscehdule: {
                    autoSchedule: webAutoSchedule?.autoSchedule ?? false,
                    communicationPerformanceBy: 'Content',
                    duration: Number(webAutoSchedule?.startIn ?? 0),
                    time: _find(SCHEDULE_START_TIME_MENU, ['id', Number(webAutoSchedule?.periodRange ?? 1)]),
                    splitScheduleID: webAutoSchedule?.splitScheduleID ?? 0,
                },
                expiry: isCarousel === true && content?.[i]?.isExpiryButtonEnabled === 1,
                expiryTime:
                    isCarousel === true && !!content?.[i]?.webPushexpirySchedule ? expiryTime?.[0] : {},
                expiryValue:
                    isCarousel === true && !!content?.[i]?.webPushExpiryhours
                        ? content?.[i]?.webPushExpiryhours
                        : '',
                hashtag:
                    isCarousel === true && !!content?.[i]?.hashTag
                        ? content?.[i]?.hashTag?.split(',')
                        : [],
                timezone:
                    isCarousel === true && !!content?.[0]?.timezoneId
                        ? timeZoneList?.filter((item) => item?.timeZoneID === content?.[0]?.timezoneId)[0]
                        : '',
                schedule:
                    isCarousel === true && !!content?.[0]?.localscheduleDateTime
                        ? new Date(content?.[0]?.localscheduleDateTime)
                        : '',
                splitLength: i + 1,
                [`split${splitObj[i]}`]: {
                    interactivity: content?.[i]?.isInteractivebuttonEnabled === 1,
                    contentInput: !!content?.[i]?.contentType
                        ? getContentInput[content?.[i]?.contentType]?.value
                        : '',

                    expiry: content?.[i]?.isExpiryButtonEnabled === 1,
                    expiryTime: !!content?.[i]?.webPushexpirySchedule ? expiryTime?.[0] : {},
                    expiryValue: !!content?.[i]?.webPushExpiryhours ? content?.[i]?.webPushExpiryhours : '',
                    pushNotifyChannelDetailId: !!content?.[i]?.pushNotifyChannelDetailId
                        ? content?.[i]?.pushNotifyChannelDetailId
                        : 0,
                    edmContent:
                        content?.[i].contentType === 'Z' && !!content?.[i]
                            ? content?.[i]?.content
                            : '',

                    // inboxClassification: !!inboxClassification ? inboxClassification?.[i] : '',
                    hashtag: !!content?.[i]?.hashTag ? content?.[i]?.hashTag?.split(',') : [],
                    buttonText: buttonText,
                    // currentSplitTab: i,
                    currentTab: !!content?.[i]?.contentType
                        ? getContentInput[content?.[i]?.contentType]?.id
                        : 0,
                    currentTabIndex: !!content?.[i]?.contentType
                        ? getContentInput[content?.[i]?.contentType]?.id
                        : 0,
                    bgOverlayColor: !!content?.[i]?.bgOverlayColor
                        ? {
                            color: content?.[i]?.bgOverlayColor,
                            opacity: Number(content?.[i]?.bgOverlayOpacity) || 1,
                        }
                        : '',
                    bgOverlay: content?.[i]?.bgOverlayEnabled || false,
                    title: {
                        text: !!content?.[i]?.title ? content?.[i]?.title : '',
                        fontColor: !!content?.[i]?.titleColor ? content?.[i]?.titleColor : '',
                    },
                    customization: {
                        background: !!content?.[i]?.contentBgColour ? content?.[i]?.contentBgColour : '',
                        color: !!content?.[i]?.contentTextColour ? content?.[i]?.contentTextColour : '',
                    },
                    editorText:
                        content?.[i]?.contentType === 'R' && !!content?.[i]?.content
                            ? content?.[i]?.content
                            : '',
                    templateContent:
                        content?.[i]?.contentType === 'T' && !!content?.[i]?.content
                            ? content?.[i]?.content
                            : '',
                    editorTextLength: !!content?.[i]?.content ? content?.[i]?.content?.length : 0,
                    timezone: !!content?.[i]?.timezoneId
                        ? timeZoneList?.filter((item) => item?.timeZoneID === content?.[i]?.timezoneId)[0]
                        : '',
                    schedule: !!content?.[i]?.localscheduleDateTime
                        ? new Date(content?.[i]?.localscheduleDateTime)
                        : '',
                    browserImage: !!content?.[i]?.pushImagePath ? content?.[i]?.pushImagePath : '',
                    previewImage: !!content?.[i]?.pushImagePath ? content?.[i]?.pushImagePath : '',
                    previewImage_video:
                        !!content?.[i]?.pushImagePath &&
                            ['mp4', 'mp3'].includes(content?.[i]?.pushImagePath?.split('.')?.pop())
                            ? content?.[i]?.pushImagePath
                            : '',
                    makeAlert: content?.[i]?.isTitleON === 0 ? false : true,
                    shortDesc: !!content?.[i]?.shortDesc
                        ? {
                            text: content?.[i]?.shortDesc,
                        }
                        : '',
                    timeZone: timeZone,
                    thumbnailUrl: {
                        selectImport: true,
                        imageUrl: content?.[i]?.thumbnailImagePath || '',
                        defaulPreview: true,
                    },
                    ...mapInPageImportFromContentItem(content?.[i]),
                    impressions: !!content?.[i]?.impressionCount
                        ? {
                            id: Number(content?.[i]?.impressionCount),
                            value: String(content?.[i]?.impressionCount),
                        }
                        : '',
                    priority: !!content?.[i]?.priority
                        ? { id: Number(content?.[i]?.priority), value: String(content?.[i]?.priority) }
                        : '',
                },
            };
            const getSplitName = layoutPosition?.[0]?.value === 'Carousel' ? CAUROSEL_NAME[i] : SPLIT_AB_NAME[i];
            delete tempTabs[tempTabs?.length - 1]?.add;
            delete tempTabs[tempTabs?.length - 1]?.remove;
            tempTabs.push({
                ...getSplitName,
                component: () => (
                    <SplitAB
                        fieldName={getSplitName?.key || getSplitName?.id}
                        key={getSplitName?.id}
                        isSplit={true}
                        index={i}
                        setDirtyReset={setDirtyReset}
                    />
                ),
                ...(tempTabs?.length >= 3 && { remove: circle_minus_fill_medium }),
            });

            updateTabState(tempTabs, true);
        }
    }
    if (isSplitAbEnabled && content?.length > 1) {
        tempEdit.splitTabList = content.map((_, idx) => `split${splitObj[idx]}`);
    }
    setEditAutoScheduleDetails(tempEdit?.splitscehdule);
    // console.log('Edit data ::: ', tempEdit, testEmail, usersList);
    return tempEdit;
};

export const FORM_INITIAL_STATE = {
    defaultValues: {
        sendwebPushTo: '',
        scheduleAlert: false,
        isAutoRefereshenabled: false,
        mobileApp: '',
        domain: '',
        audience: [],
        isCGTGEnabled: false,
        isCGTGConfirm: false,
        deliveryType: '',
        contentInput: '',
        interactivity: false,
        expiry: false,
        currentSplitTab: 0,
        splitTabList: ['splitA', 'splitB'],
        channelType: '',
        splitTest: false,
        secureMessage: false,
        expiryTime: '',
        expiryValue: '',
        inboxClassification: '',
        layoutPosition: '',
        position: '',
        hashtag: [],
        alert: false,
        makeAlert: false,
        sendTimeRecommendation: false,
        currentTab: null,
        schedule: null,
        title: {
            text: '',
            fontColor: '',
        },
        previewImage: '',
        uploadImage: '',
        customization: {
            background: null,
            color: null,
        },
        splitscehdule: {
            autoSchedule: false,
            communicationPerformanceBy: 'SubjectLine',
            duration: '',
            time: 'Hour(s)',
        },
        buttonText: [
            {
                type: 'Button',
                text: '',
                customText: '',
                link: '',
                fontColor: '',
                backgroundColor: '',
                isNewLink: false,
                show: false,
            },
        ],
        editorText: '',
        editorTextLength: 0,

        //For Import
        importUrl: '',
        zipFile: '',
        edmContent: '',
        importType: 'url',
        viewInBrowser: '',
        pushNotifyChannelDetailId: 0,
        serverImageURL: '', // Server image URL returned from API
        serverVideoURL: '', // Server video URL returned from API
        approvalList: {
            requestApproval: false,
            name: [{ approverName: '', mandatory: false }],
            approvalFrom: 'All',
            approvalCount: '',
            followHierarchy: false,
            testEmail: '',
        },
        splitA: {
            expiry: false,
            expiryTime: '',
            expiryValue: '',
            buttonText: [
                {
                    type: 'Button',
                    text: '',
                    customText: '',
                    link: '',
                    fontColor: '',
                    backgroundColor: '',
                    isNewLink: false,
                    show: false,
                },
            ],
            customization: {
                background: null,
                color: null,
            },
            interactivity: false,
            hashtag: [],
            editorText: '',
            currentTabIndex: null,
            title: {
                text: '',
                fontColor: '',
            },
            tabErrorText: '',
            schedule: null,
            sendTimeRecommendation: false,
            alert: false,
            makeAlert: false,
            previewImage: '',
            uploadImage: '',

            //For Import
            importUrl: '',
            zipFile: '',
            edmContent: '',
            importType: 'url',
            viewInBrowser: '',
            pushNotifyChannelDetailId: 0,
            serverImageURL: '',
            serverVideoURL: '',
        },
        splitB: {
            expiry: false,
            expiryTime: '',
            expiryValue: '',
            buttonText: [
                {
                    type: 'Button',
                    text: '',
                    customText: '',
                    link: '',
                    fontColor: '',
                    backgroundColor: '',
                    isNewLink: false,
                    show: false,
                },
            ],
            customization: {
                background: null,
                color: null,
            },
            interactivity: false,
            hashtag: [],
            schedule: null,
            editorText: '',
            currentTabIndex: null,
            title: {
                text: '',
                fontColor: '',
            },
            tabErrorText: '',
            alert: false,
            makeAlert: false,
            previewImage: '',
            uploadImage: '',

            //For Import
            importUrl: '',
            zipFile: '',
            edmContent: '',
            importType: 'url',
            viewInBrowser: '',
            sendTimeRecommendation: false,
            pushNotifyChannelDetailId: 0,
            serverImageURL: '',
            serverVideoURL: '',
        },
        splitC: {
            expiry: false,
            expiryTime: '',
            schedule: null,
            expiryValue: '',
            customization: {
                background: null,
                color: null,
            },
            buttonText: [
                {
                    type: 'Button',
                    text: '',
                    customText: '',
                    link: '',
                    fontColor: '',
                    backgroundColor: '',
                    isNewLink: false,
                    show: false,
                },
            ],
            interactivity: false,
            hashtag: [],
            editorText: '',
            currentTabIndex: null,
            title: {
                text: '',
                fontColor: '',
            },
            tabErrorText: '',
            alert: false,
            makeAlert: false,
            previewImage: '',
            uploadImage: '',

            //For Import
            importUrl: '',
            zipFile: '',
            edmContent: '',
            importType: 'url',
            viewInBrowser: '',
            sendTimeRecommendation: false,
            pushNotifyChannelDetailId: 0,
            serverImageURL: '',
            serverVideoURL: '',
        },
        splitD: {
            expiry: false,
            expiryTime: '',
            expiryValue: '',
            schedule: null,
            customization: {
                background: null,
                color: null,
            },
            buttonText: [
                {
                    type: 'Button',
                    text: '',
                    customText: '',
                    link: '',
                    fontColor: '',
                    backgroundColor: '',
                    isNewLink: false,
                    show: false,
                },
            ],
            interactivity: false,
            hashtag: [],
            editorText: '',
            currentTabIndex: null,
            title: {
                text: '',
                fontColor: '',
            },
            tabErrorText: '',
            alert: false,
            makeAlert: false,
            previewImage: '',
            uploadImage: '',

            //For Import
            importUrl: '',
            zipFile: '',
            edmContent: '',
            importType: 'url',
            viewInBrowser: '',
            sendTimeRecommendation: false,
            pushNotifyChannelDetailId: 0,
            serverImageURL: '',
            serverVideoURL: '',
        },
    },
    mode: 'onTouched',
};

export const refreshLayoutPosition = {
    interactivity: false,
    expiry: false,
    currentSplitTab: 0,
    channelType: '',
    expiryTime: 'hour(s)',
    expiryValue: '',
    hashtag: [],
    alert: false,
    makeAlert: false,
    sendTimeRecommendation: false,
    currentTab: null,
    schedule: null,
    title: {
        text: '',
        fontColor: '',
    },
    previewImage: '',
    uploadImage: '',
    customization: {
        background: null,
        color: null,
    },
    splitscehdule: {
        autoSchedule: false,
        communicationPerformanceBy: 'SubjectLine',
        duration: '',
        time: 'Hour(s)',
    },
    buttonText: [
        {
            type: 'Button',
            text: '',
            customText: '',
            link: '',
            fontColor: '',
            backgroundColor: '',
            isNewLink: false,
            show: false,
        },
    ],
    editorText: '',
    editorTextLength: 0,

    //For Import
    importUrl: '',
    zipFile: '',
    edmContent: '',
    importType: 'url',
    viewInBrowser: '',
    pushNotifyChannelDetailId: 0,
    splitA: {
        expiry: false,
        expiryTime: 'hour(s)',
        expiryValue: '',
        buttonText: [
            {
                type: 'Button',
                text: '',
                customText: '',
                link: '',
                fontColor: '',
                backgroundColor: '',
                isNewLink: false,
                show: false,
            },
        ],
        customization: {
            background: null,
            color: null,
        },
        interactivity: false,
        hashtag: [],
        editorText: '',
        currentTab: null,
        title: {
            text: '',
            fontColor: '',
        },
        tabErrorText: '',
        schedule: null,
        sendTimeRecommendation: false,
        alert: false,
        makeAlert: false,
        previewImage: '',
        uploadImage: '',

        //For Import
        importUrl: '',
        zipFile: '',
        edmContent: '',
        importType: 'url',
        viewInBrowser: '',
        pushNotifyChannelDetailId: 0,
    },
    splitB: {
        expiry: false,
        expiryTime: 'hour(s)',
        expiryValue: '',
        buttonText: [
            {
                type: 'Button',
                text: '',
                customText: '',
                link: '',
                fontColor: '',
                backgroundColor: '',
                isNewLink: false,
                show: false,
            },
        ],
        customization: {
            background: null,
            color: null,
        },
        interactivity: false,
        hashtag: [],
        schedule: null,
        editorText: '',
        currentTab: null,
        title: {
            text: '',
            fontColor: '',
        },
        tabErrorText: '',
        alert: false,
        makeAlert: false,
        previewImage: '',
        uploadImage: '',

        //For Import
        importUrl: '',
        zipFile: '',
        edmContent: '',
        importType: 'url',
        viewInBrowser: '',
        sendTimeRecommendation: false,
        pushNotifyChannelDetailId: 0,
    },
    splitC: {
        expiry: false,
        expiryTime: 'hour(s)',
        schedule: null,
        expiryValue: '',
        customization: {
            background: null,
            color: null,
        },
        buttonText: [
            {
                type: 'Button',
                text: '',
                customText: '',
                link: '',
                fontColor: '',
                backgroundColor: '',
                isNewLink: false,
                show: false,
            },
        ],
        interactivity: false,
        hashtag: [],
        editorText: '',
        currentTab: null,
        title: {
            text: '',
            fontColor: '',
        },
        tabErrorText: '',
        alert: false,
        makeAlert: false,
        previewImage: '',
        uploadImage: '',

        //For Import
        importUrl: '',
        zipFile: '',
        edmContent: '',
        importType: 'url',
        viewInBrowser: '',
        sendTimeRecommendation: false,
        pushNotifyChannelDetailId: 0,
    },
    splitD: {
        expiry: false,
        expiryTime: 'hour(s)',
        expiryValue: '',
        schedule: null,
        customization: {
            background: null,
            color: null,
        },
        buttonText: [
            {
                type: 'Button',
                text: '',
                customText: '',
                link: '',
                fontColor: '',
                backgroundColor: '',
                isNewLink: false,
                show: false,
            },
        ],
        interactivity: false,
        hashtag: [],
        editorText: '',
        currentTab: null,
        title: {
            text: '',
            fontColor: '',
        },
        tabErrorText: '',
        alert: false,
        makeAlert: false,
        previewImage: '',
        uploadImage: '',

        //For Import
        importUrl: '',
        zipFile: '',
        edmContent: '',
        importType: 'url',
        viewInBrowser: '',
        sendTimeRecommendation: false,
        pushNotifyChannelDetailId: 0,
    },
};

export const refreshFields = {
    interactivity: false,
    expiry: false,
    secureMessage: false,
    expiryTime: 'hour(s)',
    expiryValue: '',
    hashtag: [],
    alert: false,
    currentTab: null,
    schedule: null,
    title: {
        text: '',
        fontColor: '',
    },
    previewImage: '',
    customization: {
        background: null,
        color: null,
    },
    buttonText: [
        {
            type: 'Button',
            text: '',
            customText: '',
            link: '',
            fontColor: '',
            backgroundColor: '',
            isNewLink: false,
            show: false,
        },
    ],
    editorText: '',
    templateContent: '',
};

/** Map API content item to in-page banner form value (create/edit). */
export const mapInPageBannerFromContentItem = (contentItem) => {
    if (!contentItem?.bannerId) {
        return null;
    }
    return {
        bannerId: contentItem.bannerId,
        bannerName: contentItem.bannerName || '',
    };
};

/** Map API content item to in-page import fields (edmContent, url, server preview). */
export const mapInPageImportFromContentItem = (contentItem) => {
    if (!contentItem) {
        return {};
    }
    const contentUrl = contentItem.contentURL || contentItem.contentUrl || '';
    const hasUrl = typeof contentUrl === 'string' && contentUrl.trim().length > 0;
    const isImportContent =
        contentItem.contentType === 'Z' &&
        typeof contentItem.content === 'string' &&
        contentItem.content.trim().length > 0;
    return {
        edmContent: isImportContent ? contentItem.content : '',
        importUrl: contentUrl,
        importType: hasUrl ? 'url' : isImportContent ? 'import' : 'url',
        serverImageURL: contentUrl || contentItem.pushImagePath || '',
        zipFile: '',
        zipFileText: contentItem.zipFileName || '',
    };
};

const hasNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const hasZipFileValue = (zipFile, zipFileText) => {
    if (hasNonEmptyString(zipFileText)) {
        return true;
    }
    if (zipFile && typeof zipFile === 'object') {
        return Object.keys(zipFile).length > 0;
    }
    return hasNonEmptyString(zipFile);
};

export const hasWebImportFileContent = (tabState = {}) => {
    if (!tabState) {
        return false;
    }
    if (hasNonEmptyString(tabState.edmContent)) {
        return true;
    }
    if (hasNonEmptyString(tabState.importUrl)) {
        return true;
    }
    if (hasNonEmptyString(tabState.serverImageURL)) {
        return true;
    }
    if (hasNonEmptyString(tabState.serverVideoURL)) {
        return true;
    }
    return hasZipFileValue(tabState.zipFile, tabState.zipFileText);
};

export const getSplitTabKeysForValidation = (formState, fallbackTabs = ['splitA', 'splitB']) => {
    if (Array.isArray(formState?.splitTabList) && formState.splitTabList.length > 0) {
        return formState.splitTabList;
    }
    if (Array.isArray(formState?.splitTabs) && formState.splitTabs.length > 0) {
        return formState.splitTabs;
    }
    if (Array.isArray(fallbackTabs) && fallbackTabs.length > 0) {
        return fallbackTabs;
    }
    return ['splitA', 'splitB'];
};

export const isSplitImportTabActive = (splitTabState = {}, deliveryTypeId) => {
    if (!splitTabState) {
        return false;
    }
    if (Number(deliveryTypeId) === 5) {
        return splitTabState.contentInput === 'import' || splitTabState.currentTabIndex === 1;
    }
    return splitTabState.contentInput === 'import';
};

export const getSplitImportValidationError = ({
    splitTabState,
    splitKey,
    deliveryTypeId,
    hasImportContent = hasWebImportFileContent,
}) => {
    if (!isSplitImportTabActive(splitTabState, deliveryTypeId)) {
        return null;
    }
    if (hasImportContent(splitTabState)) {
        return null;
    }
    const isInPage = Number(deliveryTypeId) === 5;
    if (
        !isInPage &&
        splitTabState?.importType === 'url' &&
        !(splitTabState?.importUrl && String(splitTabState.importUrl).trim())
    ) {
        return {
            field: `${splitKey}.importUrl`,
            focusField: `${splitKey}.importUrl`,
            type: 'url',
        };
    }
    return {
        field: `${splitKey}.zipFile`,
        focusField: `${splitKey}.zipFile`,
        type: 'upload',
    };
};

export const getInPageBannerFieldName = () => 'inPageBanner';

export const isInPageBannerSelected = (inPageBanner) => {
    if (!inPageBanner) {
        return false;
    }
    const id = inPageBanner.bannerId;
    if (id !== undefined && id !== null && id !== '' && Number(id) !== 0) {
        return true;
    }
    const name = inPageBanner.bannerName;
    return typeof name === 'string' && name.trim().length > 0;
};

/** In-page content (id 5) does not use layout position — avoid click-off on normal flow. */
export const getNotificationContentClickOffClass = ({ deliveryType, layoutPosition, isTemplateFlow }) => {
    if (!deliveryType && !isTemplateFlow) {
        return 'click-off';
    }
    if (deliveryType?.id === 1 || deliveryType?.id === 5) {
        return '';
    }
    if (!layoutPosition && !isTemplateFlow) {
        return 'click-off';
    }
    return '';
};

export const isNotificationContentVisible = ({ deliveryType, inPageBanner }) => {
    if (deliveryType?.id !== 5) {
        return true;
    }
    return isInPageBannerSelected(inPageBanner);
};

/** Default in-page content tab state per split (Import tab). */
export const IN_PAGE_SPLIT_CONTENT_DEFAULTS = {
    contentInput: 'import',
    currentTabIndex: 1,
    currentTab: 1,
};

export const refreshFieldsOnSplitAB = {
    expiry: false,
    expiryTime: 'minutes(s)',
    expiryValue: '',
    subtitleText: '',
    buttonText: [
        {
            type: 'Button',
            text: '',
            customText: '',
            link: '',
            fontColor: '',
            backgroundColor: '',
            isNewLink: false,
            show: false,
        },
    ],
    customization: {
        background: null,
        color: null,
    },
    interactivity: false,
    edmContent: '',
    importUrl: '',
    hashtag: [],
    editorText: '',
    currentTab: null,
    title: {
        text: '',
        fontColor: '',
    },
    tabErrorText: '',
    schedule: null,
    sendTimeRecommendation: '',
    alert: false,
    previewImage: '',
    browserImage: '',
    previewVideo: '',
    templateContent: '',
    contentInput: '',
    currentTabIndex: null,
    inPageBanner: null,
};

/** Initialize per-split in-page content when Split A/B is turned on (delivery type 5). Banner stays at form root. */
export const buildInPageSplitInitFromForm = (formState) => {
    const defaults = { ...IN_PAGE_SPLIT_CONTENT_DEFAULTS };
    const rootHasContent =
        formState?.contentInput ||
        formState?.edmContent ||
        formState?.importUrl ||
        formState?.editorText ||
        formState?.templateContent;

    const rootContent = rootHasContent
        ? {
            contentInput: formState.contentInput || defaults.contentInput,
            currentTabIndex: formState.currentTabIndex ?? defaults.currentTabIndex,
            currentTab: formState.currentTab ?? defaults.currentTab,
            edmContent: formState.edmContent || '',
            importUrl: formState.importUrl || '',
            importType: formState.importType || 'url',
            zipFile: formState.zipFile || '',
            zipFileText: formState.zipFileText || '',
            editorText: formState.editorText || '',
            templateContent: formState.templateContent || '',
            previewImage: formState.previewImage || '',
            browserImage: formState.browserImage || '',
            previewVideo: formState.previewVideo || '',
        }
        : defaults;

    const emptySplit = {
        ...refreshFieldsOnSplitAB,
        ...defaults,
    };

    const splitKeys = formState?.splitTabList?.length ? formState.splitTabList : ['splitA', 'splitB'];

    return splitKeys.reduce((acc, key, index) => {
        const existing = formState?.[key] || {};
        const hasExisting =
            existing?.contentInput ||
            existing?.edmContent ||
            existing?.importUrl ||
            existing?.editorText ||
            existing?.templateContent;

        const { inPageBanner: _ignoredBanner, ...existingWithoutBanner } = hasExisting ? existing : {};

        acc[key] = {
            ...emptySplit,
            ...(hasExisting ? existingWithoutBanner : index === 0 ? rootContent : defaults),
            pushNotifyChannelDetailId:
                existing?.pushNotifyChannelDetailId || (index === 0 ? formState?.pushNotifyChannelDetailId : 0) || 0,
        };
        return acc;
    }, {});
};

export const WATCHLIST = [
    'sendwebPushTo',
    'deliveryType',
    'layoutPosition',
    'audience',
    'splitTest',
    'inboxClassification',
    'approvalList',
    'mobileApp',
    'domain',
    'newInbox',
    'isAutoRefereshenabled',
    'position',
    'inPageBanner',
    'totalAudience',
];

export const DELIVERY_TYPE = [
    { id: 1, value: 'Alert/rich push' },
    { id: 3, value: 'In-page overlay' },
    { id: 5, value: 'In-page content' },
];
export const DELIVERY_TYPE_FOR_MOBILE = [
    { id: 1, value: 'Alert/rich push' },
    { id: 2, value: 'In-app messaging' },
    { id: 4, value: 'In-app inbox' },
    { id: 5, value: 'In-page content' },
];

export const findLayoutPositionData = (deliveryType) => {
    if (deliveryType?.id === 1) return LAYOUT_POSITION_FOR_ALERT;
    else if (deliveryType?.id === 2) return LAYOUT_POSITION;
    else return [];
};

export const LAYOUT_POSITION = [
    { id: 1, value: 'Full screen' },
    { id: 3, value: 'Modal' },
    { id: 4, value: 'Carousel' },
];

export const LAYOUT_POSITION_FOR_ALERT = [
    { id: 5, value: 'Default' },
    { id: 4, value: 'Carousel' },
];

export const MODAL_POSISTION = [
    { id: 1, value: 'Top left' },
    { id: 2, value: 'Top center' },
    { id: 3, value: 'Top right' },
    { id: 4, value: 'Center' },
    { id: 5, value: 'Center left' },
    { id: 6, value: 'Center right' },
    { id: 7, value: 'Bottom left' },
    { id: 8, value: 'Bottom center' },
    { id: 9, value: 'Bottom right' },
];

export const MODAL_POSISTION_FOR_MOBILE = [
    { id: 1, value: 'Top' },
    { id: 2, value: 'Bottom' },
    { id: 3, value: 'Center' },
];

// export const SEND_PUSH = ['Domain', 'Specific page on the domain'];

export const SEND_PUSH = [{ id: 1, value: 'Domain' }];

export const BUTTON_TEXT = [
    { id: 2, value: 'Dismiss' },
    { id: 4, value: 'Unsubscribe' },
    // { id: 3, value: 'Custom action' },
];

export const BUTTON_TEXT_FOR_MOBILE = (type) => {
    if (type === 4) {
        return [
            { id: 4, value: 'Unsubscribe' },
            // { id: 3, value: 'Custom action' },
        ];
    } else
        return [
            { id: 1, value: 'Maybe later' },
            { id: 2, value: 'Dismiss' },
            { id: 4, value: 'Unsubscribe' },
            // { id: 3, value: 'Custom action' },
        ];
};

export const EXPIRE_CONFIG = [
    { id: 2, text: 'Hour(s)', value: 'H' },
    { id: 3, text: 'Day(s)', value: 'D' },
];

export const EXPIRE_CONFIG_FOR_MOBILE = [
    { id: 1, text: 'Minute(s)', value: 'M' },
    { id: 2, text: 'Hour(s)', value: 'H' },
    { id: 3, text: 'Day(s)', value: 'D' },
];

export const URL_TYPE_FOR_MOBILE = [
    { id: 1, value: 'Call' },
    { id: 2, value: 'Share' },
    { id: 3, value: 'WebURL' },
];

export const URL_TYPE = [{ id: 10, value: 'WebURL' }];

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

export const INITIAL_SPLIT_AB_STATE = (setDirtyReset) => [
    {
        id: 'splitA',
        text: 'Split A',
        component: () => (
            <SplitAB fieldName={'splitA'} key={'splitA'} isSplit={true} index={0} setDirtyReset={setDirtyReset} />
        ),
    },
    {
        id: 'splitB',
        text: 'Split B',
        component: () => (
            <SplitAB fieldName={'splitB'} key={'splitB'} isSplit={true} index={1} setDirtyReset={setDirtyReset} />
        ),
        add: circle_plus_medium,
    },
];

export const INITIAL_CAROUSEL_STATE = (setDirtyReset) => [
    {
        id: 'cauroselA',
        text: 'Carousel A',
        key: 'splitA',
        component: () => (
            <SplitAB fieldName={'splitA'} key={'cauroselA'} isSplit index={0} setDirtyReset={setDirtyReset} />
        ),
    },
    {
        id: 'cauroselB',
        text: 'Carousel B',
        key: 'splitB',
        component: () => (
            <SplitAB fieldName={'splitB'} key={'cauroselB'} isSplit index={1} setDirtyReset={setDirtyReset} />
        ),
        add: circle_plus_medium,
    },
];

export const CAUROSEL_NAME = {
    0: {
        id: 'cauroselA',
        key: 'splitA',
        text: 'Carousel A',
        color: 'red',
    },
    1: {
        id: 'cauroselB',
        text: 'Carousel B',
        key: 'splitB',
        add: circle_plus_medium,
        color: 'blue',
    },
    2: {
        id: 'cauroselC',
        text: 'Carousel C',
        key: 'splitC',
        remove: circle_minus_fill_medium,
        add: circle_plus_medium,
    },
    3: {
        id: 'cauroselD',
        text: 'Carousel D',
        key: 'splitD',
        remove: circle_minus_fill_medium,
    },
};

const getScheduleDate = (formState, notificationEditData) => {
    if (formState?.campaignType === 'M') {
        if (formState?.dataSource === 'DL') {
            if (formState?.levelNumber > 1) {
                return formatDateScheculer(formState?.scheduleDate);
            }
            return getCreatedDate(new Date(), 'campaign');
        } else {
            if (formState?.levelNumber > 1) {
                return formatDateScheculer(formState?.scheduleDate);
            }
            if (formState?.schedule) {
                return getCreatedDate(formState?.schedule, 'campaign');
            } else {
                return '';
            }
        }
    } else if (formState?.campaignType === 'T') {
        const statusId = notificationEditData?.content?.[0]?.statusId ?? location?.statusId;
        const dateResult = resolveLocalBlastDateTime({
            campaignType: formState?.campaignType,
            statusId,
            triggerPlayPauseStatus: notificationEditData?.triggerPlayPauseStatus,
            schedule: formState?.schedule,
        });
        return getCreatedDate(dateResult, 'campaign');
    } else {
        if (formState?.schedule) {
            return getCreatedDate(formState?.schedule, 'campaign');
        } else {
            return '';
        }
    }
};

export const handleFieldValueCheck = (
    formState,
    currentIndex,
    splitType,
    fieldName,
    setTabs,
    audienceRef,
    trigger,
    setError,
) => {
    // button id detail

    // 2--> dismiss ====> only custom text
    // 4--> unsubscribe ====> only custom text
    // 5-9 --> smart link 1 to smart link 5  ====> only custom text
    // 10--> web url ===>  custom text &&  isNewlink
    const handleErrorTab = (index, field) => {
        setTabs((prev) => ({
            ...prev,
            currentTab: currentIndex,
        }));
        if (audienceRef.current) {
            audienceRef.current.scrollIntoView({
                behavior: 'smooth',
            });
        }
        return false;
    };

    switch (fieldName) {
        case 'interactivity':
            if (formState?.interactivity) {
                return formState?.buttonText?.every((button, index) => {
                    if (!button.text  && !button.value) {
                        return handleErrorTab(index, 'text');
                    }
                    if(((button.text  && button.value)) && !button.customText ) {
                        return handleErrorTab(index, 'text');
                    }

                    if (button?.isNewLink && !button.link) {
                        return handleErrorTab(index, 'link');
                    }

                    return true;
                });
            }
            return true;
        default:
            return true;
    }
};

export const getCreateContentRenderConfig = (deliveryType, layoutPosition, position, splitTest, location) => {
    const response = { isSplitAB: false, status: false };

    if (splitTest) return { isSplitAB: true, status: true };

    if (!deliveryType) return response;

    const { id: deliveryId } = deliveryType;
    const layoutId = layoutPosition?.id;
    const hasPosition = !!position;

    switch (deliveryId) {
        case 1: // Alert/rich push
            return { isSplitAB: false, status: true };

        case 5: // In-page content
            return { isSplitAB: !!splitTest, status: true };

        case 3: // In-page overlay
            if (layoutId === 1) return { isSplitAB: false, status: true };
            if (layoutId === 3 && hasPosition) return { isSplitAB: false, status: true };
            if ([4].includes(layoutId) && hasPosition) return { isSplitAB: true, status: true };
            break;
        // case 4:
        //     return { isSplitAB: false, status: true };
    }

    return response;
};

const handleButtonTextErrorMessage = (isDuplicate, value) => {
    const isExist = isDuplicate?.find((duplicate) => duplicate?.text?.id === value?.id);
    return isExist ? 'Duplicate button text' : true;
};

export const handleButtonTextDuplicates = (buttonList, value) => {
    let tempSet = new Set();

    const isDuplicate = buttonList.filter((button) => {
        if (button?.text?.id) {
            if (tempSet.has(button.text.id)) {
                return true;
            }
            tempSet.add(button.text.id);
            return false;
        }
    });

    return handleButtonTextErrorMessage(isDuplicate, value);
};

export const shouldShowSplitABSwitch = ({
    isLayoutCarousel,
    campaignType = 'S',
    dataSource,
    levelNumber,
    deliveryTypeId,
}) => {
    if (isLayoutCarousel) {
        return false;
    }
    if (campaignType === 'S') {
        return true;
    }
    if (campaignType === 'M') {
        return dataSource !== 'DL' && levelNumber === 1;
    }
    return false;
};

/** Split size requires audience >= 100; in-page content (id 5) uses auto schedule only. */
export const shouldEnableSplitSize = ({ deliveryTypeId, audienceCount }) => {
    if (deliveryTypeId === 5) {
        return false;
    }
    return !isNaN(audienceCount) ? audienceCount >= 100 : true;
};
