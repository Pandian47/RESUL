import { getCreatedDate } from 'Utils/modules/dateTime';
import { getmasterData } from 'Utils/modules/masterData';
import { circle_minus_fill_medium, circle_plus_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment } from 'react';
import { map as _map,get as _get,find as _find } from 'Utils/modules/lodashReplacements';

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
import {
    buildInPageSplitInitFromForm,
    isInPageBannerSelected,
    IN_PAGE_SPLIT_CONTENT_DEFAULTS,
    shouldShowSplitABSwitch,
    shouldEnableSplitSize,
    mapInPageBannerFromContentItem,
    mapInPageImportFromContentItem,
    getSplitTabKeysForValidation,
    isSplitImportTabActive,
    getSplitImportValidationError,
} from '../Notification/constant';

export {
    buildInPageSplitInitFromForm,
    isInPageBannerSelected,
    IN_PAGE_SPLIT_CONTENT_DEFAULTS,
    shouldShowSplitABSwitch,
    shouldEnableSplitSize,
    mapInPageBannerFromContentItem,
    mapInPageImportFromContentItem,
    getSplitTabKeysForValidation,
    isSplitImportTabActive,
    getSplitImportValidationError,
};

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

const resolveMobileMediaUrlType = ({
    importUrl = '',
    mobMediaURLType = '',
    mobMediaURL = '',
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
            getUrlTypeFromSource(mobMediaURL) ||
            getUrlTypeFromSource(edmContent) ||
            getUrlTypeFromSource(mobMediaURLType) ||
            'html'
        );
    }

    return getUrlTypeFromSource(mobMediaURLType) || getUrlTypeFromSource(mobMediaURL) || '';
};

export const buildTabContent = (formState, timeZoneId, location, mobileNotificationEditData) => {
    let interactiveButtons = formState?.buttonText?.map((item, idx) => {
        // console.log('item ===================>>>>>> ', item);

        // if (item?.text?.id >= 5) {
        //     let value = '';
        //     if (item?.text?.id >= 5 && item?.text?.id <= 9) {
        //         value = item?.text?.value[item?.text?.value?.length - 1];
        //     } else if (item?.isNewLink) {
        //         value = item?.link;
        //     }
        //     return {
        //         key: item?.customText,
        //         value,
        //         type: item?.text?.value,
        //     };
        // }

        if (item?.text?.id >= 1 && item?.text?.id <= 9) {
            return {
                key: item?.customText,
                value: item?.text?.id >= 5 && item?.text?.id <= 9 ? Number(item?.text?.id) - 4 : item?.text?.id,
                type: item?.text?.value,
            };
        } else if (!!item?.link || item?.isNewLink) {
            return {
                key: item?.customText,
                value: item?.link,
                type: item?.text?.value,
            };
        }
    });

    const handleScheduleTime = (formState, mobileNotificationEditData, location) => {
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
            const statusId = mobileNotificationEditData?.content?.[0]?.statusId ?? location?.statusId;
            const dateResult = resolveLocalBlastDateTime({
                campaignType: formState?.campaignType,
                statusId,
                triggerPlayPauseStatus: mobileNotificationEditData?.triggerPlayPauseStatus,
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

    let tempContent = [];
    let expiryTime = formState?.expiry ? formState?.expiryTime?.value : '';
    let tempContentImport = !!formState?.edmContent ? formState?.edmContent : '';
    let tempContentCreate = !!formState?.editorText ? formState?.editorText : '';
    let templateContent = !!formState?.templateContent ? formState?.templateContent : '';
    let titleText = !!formState?.title?.text ? formState?.title?.text : '';
    let shortDescText = !!formState?.shortDesc?.text ? formState?.shortDesc?.text : '';
    let scheduleTime = !!formState?.schedule ? getCreatedDate(formState?.schedule, 'campaign') : '';
    scheduleTime = handleScheduleTime(formState, mobileNotificationEditData, location) ?? '';

    // scheduleTime =
    //     formState?.dataSource === 'DL' || formState?.campaignType === 'T'
    //         ? getCreatedDate(new Date(), 'campaign')
    //         : formState?.levelNumber > 1
    //         ? formatDateScheculer(formState?.scheduleDate)
    //         : formState?.schedule
    //         ? getCreatedDate(formState?.schedule, 'campaign')
    //         : '';

    let pushImagepath = '';
    if (!!formState?.previewImage && !formState?.previewVideo) pushImagepath = formState?.previewImage;
    else if (!!formState?.browserImage && !formState?.previewVideo) pushImagepath = formState?.browserImage;
    else if (!!formState?.previewVideo) pushImagepath = formState?.previewVideo;
    // let tempWebContent = {
    //     webMediaURL: !!formState?.uploadImage ? '' : pushImagepath,
    //     webMediaURLType: !!formState?.uploadImage
    //         ? ''
    //         : pushImagepath?.split('.')?.[formState?.previewImage?.split('.')?.length - 1],
    //     bgOverlayEnabled: formState?.bgOverlay === true ? true : false,
    //     bgOverlayColor: !!formState?.bgOverlayColor?.color ? formState?.bgOverlayColor?.color : '',
    //     bgOverlayOpacity: !!formState?.bgOverlayColor?.opacity ? formState?.bgOverlayColor?.opacity : '',
    //     webPushexpirySchedule: !!formState?.expiryTime?.value ? expiryTime : '',
    //     webPushExpiryhours: formState?.expiryValue,
    //     contentUrl: !!formState?.importUrl ? formState?.importUrl : '',
    //     hashTag: formState?.hashtag?.length !== 0 ? formState?.hashtag?.join() : '',
    //     cBgColour2: !!formState?.buttonText?.[1]?.backgroundColor ? formState?.buttonText?.[1]?.backgroundColor : '',
    // };
    const getInteractiveHours = () => {
        let obj = { frequencyType: '', frequencyValue: '' };
        formState?.buttonText?.forEach((item) => {
            if (item?.text?.id == 1) {
                obj.frequencyType = formState?.frequency?.value || '';
                obj.frequencyValue = formState?.rating || '';
            }
        });
        return obj;
    };
    let tempMobileContent = {
        subTitle: !!formState?.subtitleText ? formState?.subtitleText : '',
        isTimerEnabled: !!formState?.timerEnabled ? formState?.timerEnabled : formState?.timer ? true : false,
        timerTTL: !!formState?.timer ? formatDateScheculer(formState?.timer) : '',
        timerTextColor: !!formState?.timerTextColor ? formState?.timerTextColor : '',
        timerBgColor: !!formState?.timerBgColor ? formState?.timerBgColor : '',
        mobMediaURL: pushImagepath ? pushImagepath : '',
        mobMediaURLType:
            formState?.uploadImage?.length <= 0
                ? ''
                : pushImagepath?.split('.')?.[formState?.previewImage?.split('.')?.length - 1] || '',
        reschedule: !!formState?.frequency0?.text ? formState?.frequency0?.text : '',
        reschedule2: !!formState?.frequency1?.text ? formState?.frequency1?.text : '',
        textContent: '',
        contentURL: !!formState?.importUrl ? formState?.importUrl : '',
        hashtag: formState?.hashtag?.length !== 0 ? formState?.hashtag?.join() : '',

        // interactivehours: !!formState?.rating0 ? formState?.rating0 : 0,
        // interactivehours2: !!formState?.rating1 ? formState?.rating1 : 0,
        interactivehours: getInteractiveHours()?.frequencyType,
        interactivehours2: getInteractiveHours()?.frequencyValue,
        caBgColour2: !!formState?.buttonText?.[1]?.backgroundColor ? formState?.buttonText?.[1]?.backgroundColor : '',

        rating: false,
        pushexpirySchedule: !!formState?.expiryTime?.value ? expiryTime : '',
        pushExpiryhours: formState?.expiryValue,
        audioId: !!formState?.alertSoundValue?.PushNotifyAudioID ? formState?.alertSoundValue?.PushNotifyAudioID : '',
        audioName: !!formState?.alertSoundValue?.AudioName ? formState?.alertSoundValue?.AudioName : '',
        isDaylightSavings: _get(formState, 'daylightSavings', false),
    };
    // let interactiveValue =
    //     formState?.buttonText?.[0]?.text?.id >= 5 && formState?.buttonText?.[0]?.text?.id < 10
    //         ? 9 - formState?.buttonText?.[0]?.text?.id
    //         : formState?.buttonText?.[0]?.text?.id;
    // let interactiveValue2 =
    //     formState?.buttonText?.[1]?.text?.id >= 5 && formState?.buttonText?.[1]?.text?.id < 10
    //         ? 9 - formState?.buttonText?.[1]?.text?.id
    //         : formState?.buttonText?.[1]?.text?.id;
    // let interactiveValue =
    //     formState?.buttonText?.[0]?.text?.id === 1 ||
    //     formState?.buttonText?.[0]?.text?.id === 2 ||
    //     formState?.buttonText?.[0]?.text?.id === 4
    //         ? formState?.buttonText?.[0]?.text?.id
    //         : 3;
    // let interactiveValue2 =
    //     formState?.buttonText?.[1]?.text?.id === 2 ||
    //     formState?.buttonText?.[1]?.text?.id === 1 ||
    //     formState?.buttonText?.[1]?.text?.id === 4
    //         ? formState?.buttonText?.[1]?.text?.id
    //         : 3;

    let interactiveValue = formState?.buttonText?.[0]?.text?.id;
    let interactiveValue2 = formState?.buttonText?.[1]?.text?.id;

    const getInterActiveIdButton = (btnId, btnLevel) => {
        // unsubscribe -  4
        // dismiss -  2
        // web url - 3
        // smart link 1 to smart link 5  ===>  3
        // may be later - 1
        // call - 3
        // share - 3
        if (btnId >= 5 && btnId <= 9) return 3;
        else if (btnId === 10 || btnId === 11 || btnId === 12 || btnId === 13) return 3;
        else return btnLevel === 1 ? interactiveValue : interactiveValue2;
    };
    // let interactiveValue = formState?.buttonText?.[0]?.text?.id;
    // let interactiveValue2 = formState?.buttonText?.[1]?.text?.id;
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
        content: getContentType[formState?.currentTabIndex] === 'R' ? tempContentCreate : getContentType[formState?.currentTabIndex] === 'Z' ? tempContentImport : getContentType[formState?.currentTabIndex] === 'T' ? templateContent : tempContentCreate,
        contentTextColour: !!formState?.customization?.color ? formState?.customization?.color : '',
        contentBgColour: !!formState?.customization?.background ? (formState?.customization?.background === 'transparent' ? '#00000000' : formState?.customization?.background) : '',
        splitType: '',

        isInteractivebuttonEnabled: formState?.interactivity,
        interactivebuttonTypes: !!formState?.buttonText?.[0]?.type ? formState?.buttonText?.[0]?.type : '',
        // interactivebuttonValue: !!formState?.buttonText?.[0]?.text?.id ? formState?.buttonText?.[0]?.text?.id : '',
        interactivebuttonValue: !!formState?.buttonText?.[0]?.text?.id
            ? getInterActiveIdButton(formState?.buttonText?.[0]?.text?.id, 1)
            : '',

        caTextColour: !!formState?.buttonText?.[0]?.fontColor ? formState?.buttonText?.[0]?.fontColor : '',
        caBgColour: !!formState?.buttonText?.[0]?.backgroundColor ? formState?.buttonText?.[0]?.backgroundColor : '',
        interactivebuttonTypes2: !!formState?.buttonText?.[1]?.type ? formState?.buttonText?.[1]?.type : '',
        // interactivebuttonValue2: !!formState?.buttonText?.[1]?.text?.id ? formState?.buttonText?.[1]?.text?.id : '',
        interactivebuttonValue2: !!formState?.buttonText?.[1]?.text?.id
            ? getInterActiveIdButton(formState?.buttonText?.[1]?.text?.id, 2)
            : '',

        caTextColour2: !!formState?.buttonText?.[1]?.fontColor ? formState?.buttonText?.[1]?.fontColor : '',
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
    };
    if (!formState?.splitTest && formState?.layoutPosition?.value !== 'Carousel') {
        // if (type === 'web') {
        //     tempObj = {
        //         ...tempObj,
        //         ...tempWebContent,
        //     };
        // } else {
        tempObj = {
            ...tempObj,
            ...tempMobileContent,
        };
        // }

        tempContent.push(tempObj);
    } else {
        let splitList = formState?.splitTabList?.length ? formState?.splitTabList : formState?.splitTabs
        for (var i = 0; i < splitList?.length; i++) {
            // console.log('Split type :::: ', formstateSplit);
            const formstateSplit = formState?.[`split${splitObj[i]}`];

            // unsubscribe -  4
            // dismiss -  2
            // web url - 3
            // smart link 1 to smart link 5  ===>  3
            // may be later - 1
            // call - 3
            // share - 3

            // carousel or split flow interactive id
            const getSplitInterActiveIdButton = (btnId) => {
                const updateBtnId = Number(btnId);
                if (updateBtnId >= 5 && updateBtnId <= 9) return 3;
                else if (btnId === 10 || btnId === 11 || btnId === 12 || btnId === 13) return 3;
                else return updateBtnId;
            };

            const getSplitCustomButtonValue = (buttonText) => {
                return buttonText?.map((item, idx) => {
                    // save payload interactiveBtn id changes
                    // smartlink -  3
                    // unsubscribe -  4
                    // dismiss -  2
                    // may be later - 1

                    if (item?.text?.id >= 1 && item?.text?.id <= 9) {
                        return {
                            key: item?.customText,
                            value:
                                item?.text?.id >= 5 && item?.text?.id <= 9
                                    ? Number(item?.text?.id) - 4
                                    : item?.text?.id,
                            type: item?.text?.value,
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
            let scheduleTimeCarousel = handleScheduleTime(formState, mobileNotificationEditData, location);
            let scheduleTimeSplit = !!formstateSplit?.schedule
                ? getCreatedDate(formstateSplit?.schedule, 'campaign')
                : '';
            let scheduleTimeValue = isCarousel ? scheduleTimeCarousel : scheduleTimeSplit;
            let textContent =
                getContentType[formstateSplit?.currentTabIndex] === 'R'
                    ? tempContentCreateSplit
                    : getContentType[formstateSplit?.currentTabIndex] === 'Z' ? tempContentImportSplit : getContentType[formstateSplit?.currentTabIndex] === 'T' ? tempContentTemplateSplit : tempContentCreateSplit

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
            // let tempWebContentSplit = {
            //     contentUrl: !!formstateSplit?.importUrl ? formstateSplit?.importUrl : '',
            //     hashTag: isCarousel ? hashtagCarousel : hashtagSplit,
            //     webMediaURL: !!formstateSplit?.uploadImage ? '' : pushImagepath,
            //     webMediaURLType: !!formstateSplit?.uploadImage ? '' : pushImagepath?.split('.')?.pop(),
            //     bgOverlayEnabled: formstateSplit?.bgOverlay === true ? true : false,
            //     bgOverlayColor: !!formstateSplit?.bgOverlayColor?.color ? formstateSplit?.bgOverlayColor?.color : '',
            //     bgOverlayOpacity: !!formstateSplit?.bgOverlayColor?.opacity
            //         ? formstateSplit?.bgOverlayColor?.opacity
            //         : '',
            //     cBgColour2: !!formstateSplit?.buttonText?.[1]?.backgroundColor
            //         ? formstateSplit?.buttonText?.[1]?.backgroundColor
            //         : '',
            //     // webPushexpirySchedule: !!formstateSplit?.expiryTime?.value ? expiryTime : '',
            //     webPushexpirySchedule: isCarousel ? expiryTimeCarousel : expiryTimeSplit,
            //     webPushExpiryhours: isCarousel ? formState?.expiryValue : formstateSplit?.expiryValue,
            // };
            let tempMobileContentSplit = {
                contentURL: !!formstateSplit?.importUrl ? formstateSplit?.importUrl : '',
                hashtag: isCarousel ? hashtagCarousel : hashtagSplit,
                subTitle: !!formstateSplit?.subtitleText ? formstateSplit?.subtitleText : '',
                textContent: isCarousel ? textContent : '',
                isTimerEnabled: !!formstateSplit?.timerEnabled ? formstateSplit?.timerEnabled : false,
                timerTTL: !!formstateSplit?.timer ? formatDateScheculer(formstateSplit?.timer) : '',
                timerTextColor: !!formstateSplit?.timerTextColor ? formstateSplit?.timerTextColor : '',
                timerBgColor: !!formstateSplit?.timerBgColor ? formstateSplit?.timerBgColor : '',
                caBgColour2: !!formstateSplit?.buttonText?.[1]?.backgroundColor
                    ? formstateSplit?.buttonText?.[1]?.backgroundColor
                    : '',
                mobMediaURL: pushImagepath ? pushImagepath : '',
                mobMediaURLType: !!formstateSplit?.uploadImage ? '' : pushImagepath?.split('.')?.pop(),
                reschedule: !!formstateSplit?.frequency0?.value ? formstateSplit?.frequency0?.value : '',
                interactivehours: !!formstateSplit?.frequency?.value ? formstateSplit?.frequency?.value : '',
                reschedule2: !!formstateSplit?.frequency1?.value ? formstateSplit?.frequency1?.value : '',
                interactivehours2: !!formstateSplit?.rating ? formstateSplit?.rating : 0,
                rating: false,
                // pushexpirySchedule: !!formstateSplit?.expiryTime?.value ? expirySplit : '',
                pushexpirySchedule: isCarousel ? expiryTimeCarousel : formstateSplit?.expiryTime?.value || '',
                pushExpiryhours: isCarousel ? formState?.expiryValue : formstateSplit?.expiryValue,
                audioId: isCarousel
                    ? formState?.alertSoundValue?.PushNotifyAudioID ?? ''
                    : !!formstateSplit?.alertSoundValue?.PushNotifyAudioID
                        ? formstateSplit?.alertSoundValue?.PushNotifyAudioID
                        : '',
                audioName: isCarousel
                    ? formState?.alertSoundValue?.AudioName ?? ''
                    : !!formstateSplit?.alertSoundValue?.AudioName
                        ? formstateSplit?.alertSoundValue?.AudioName
                        : '',
                isDaylightSavings: _get(formstateSplit, 'daylightSavings', false),
            };
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
                        : getContentType[formstateSplit?.currentTabIndex] === 'Z' ? tempContentImportSplit : getContentType[formstateSplit?.currentTabIndex] === 'T' ? tempContentTemplateSplit : tempContentCreateSplit,
                contentTextColour: !!formstateSplit?.customization?.color ? formstateSplit?.customization?.color : '',
                contentBgColour: !!formstateSplit?.customization?.background
                    ? formstateSplit?.customization?.background
                    : '',

                splitType: formState?.layoutPosition?.value === 'Carousel' ? carouselObj[i] : splitObj[i],

                bgOverlayEnabled: formstateSplit?.bgOverlay,
                bgOverlayColor: !!formstateSplit?.bgOverlayColor?.color ? formstateSplit?.bgOverlayColor?.color : '',
                bgOverlayOpacity: !!formstateSplit?.bgOverlayColor?.opacity
                    ? formstateSplit?.bgOverlayColor?.opacity
                    : '',
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
                pushImagePath: pushImagepath,
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
            };
            // if (type === 'web') {
            //     tempObjSplit = {
            //         ...tempObjSplit,
            //         ...tempWebContentSplit,
            //     };
            // } else {
            tempObjSplit = {
                ...tempObjSplit,
                ...tempMobileContentSplit,
            };
            // }
            // debugger;
            tempContent.push(tempObjSplit);
        }
    }
    const isInPageDelivery = formState?.deliveryType?.id === 5;
    if (isInPageDelivery && Array.isArray(tempContent) && tempContent.length) {
        tempContent = tempContent.map((contentItem, index) => {
            const splitData = formState?.[`split${splitObj[index]}`] || {};
            const rootBanner = formState?.inPageBanner;
            const resolvedMobMediaURLType = resolveMobileMediaUrlType({
                importUrl: contentItem?.contentURL || splitData?.importUrl || formState?.importUrl,
                mobMediaURLType: contentItem?.mobMediaURLType,
                mobMediaURL: contentItem?.mobMediaURL || contentItem?.pushImagePath,
                edmContent:
                    contentItem?.contentType === 'Z'
                        ? contentItem?.content || splitData?.edmContent || formState?.edmContent
                        : splitData?.edmContent || formState?.edmContent,
                isInPageBanner: true,
            });

            return {
                ...contentItem,
                mobMediaURLType: resolvedMobMediaURLType,
                bannerId: rootBanner?.bannerId || contentItem?.bannerId || '',
                bannerName: rootBanner?.bannerName || contentItem?.bannerName || '',
            };
        });
    }

    return tempContent;
};

export const buildPayload = (formState, timeZoneId, mobileApp, location, mobileNotificationEditData) => {
    //console.log('formState', formState);
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
        isAutoRefereshenabled,
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

    let tempMobile = {
        deviceOsId: '',
        custParSmartLink: '',
        mobileAppId: !!formState?.mobileApp?.mobileAppId ? formState?.mobileApp?.mobileAppId : '',
        isMobCarouselON: formState?.layoutPosition?.value === 'Carousel',
        pushTypeId: !!formState?.deliveryType ? formState?.deliveryType?.id : 0,
        deliveryTypeId: 0,

        inboxclassificationType: !!formState?.inboxClassification
            ? formState?.inboxClassification?.classificationId
            : '',
        inboxclassificationId: !!formState?.inboxClassification ? formState?.inboxClassification?.cdId : 0,
        layout: !!formState?.layoutPosition ? formState?.layoutPosition?.value : '',
        layoutId: !!formState?.layoutPosition ? formState?.layoutPosition?.id : 0,
        position: !!formState?.position ? formState?.position?.value : '',
        allAnyOption: 'ALL',
        testCampaignEmailAddress: !!sendMail ? sendMail : '',
        mobileAppGuId: mobileApp?.appGuId,
        bannerId: !!formState?.inPageBanner?.bannerId ? Number(formState.inPageBanner.bannerId) : 0,
        bannerName: !!formState?.inPageBanner?.bannerName ? formState?.inPageBanner?.bannerName : '',
        mobSplit: {
            pushChannelId: 0,
            ...resolveSplitSliderPayload({
                splitTest: formState?.splitTest,
                isCarousel: formState?.layoutPosition?.value === 'Carousel',
                audienceList: formState?.audience,
                countField: 'recipientCountMobilePush',
                sliderSplitter: formState?.sliderSplitter,
                splitTabList: formState?.splitTabList,
            }),
        },
        mobAutoSchedule: {
            splitScheduleID: formState?.splitscehdule?.splitScheduleID ?? 0,
            autoSchedule: !!formState?.splitscehdule?.autoSchedule ? formState?.splitscehdule?.autoSchedule : false,
            performedBy: 2,
            startIn: !!formState?.splitscehdule?.duration ? formState?.splitscehdule?.duration : '',
            periodRange: !!formState?.splitscehdule?.time?.id ? formState?.splitscehdule?.time?.id : '',
        },
    };

    // let tempWeb = {
    //     domainUrl: !!formState?.domain?.domainUrl ? formState?.domain?.domainUrl : '',
    //     inboxClassification: !!formState?.inboxClassification ? formState?.inboxClassification?.classificationId : '',
    //     inboxClassificationId: !!formState?.inboxClassification ? formState?.inboxClassification?.cdId : 0,
    //     pushLayoutValue: !!formState?.layoutPosition ? formState?.layoutPosition?.value : '',
    //     pushLayoutId: !!formState?.layoutPosition ? formState?.layoutPosition?.id : 0,
    //     positionValue: !!formState?.position ? formState?.position?.value : '',
    //     pushTypeId: !!formState?.sendwebPushTo?.id ? formState?.sendwebPushTo?.id : 0,
    //     deliveryTypeId: !!formState?.deliveryType ? formState?.deliveryType?.id : 0,
    //     allOrAny: 'ALL',
    //     testPushCampaignEmailAddres: !!sendMail ? sendMail : '',
    //     webSplit: {
    //         pushChannelId: 0,
    //         splitPercentage: !!formState.sliderSplitter?.percentage ? formState.sliderSplitter?.percentage : 1,
    //         splitAudience: !!formState.sliderSplitter?.audienceCount ? formState.sliderSplitter?.audienceCount : 0,
    //         totalAudience: !!formState.sliderSplitter?.totalCount ? formState.sliderSplitter?.totalCount : 0,
    //         splitWidth: 0,
    //     },
    //     webAutoSchedule: {
    //         splitScheduleID: 0,
    //         autoSchedule: !!formState?.splitscehdule?.autoSchedule ? formState?.splitscehdule?.autoSchedule : false,
    //         performedBy: 1,
    //         startIn: !!formState?.splitscehdule?.duration ? formState?.splitscehdule?.duration : '',
    //         periodRange: !!formState?.splitscehdule?.time?.id ? formState?.splitscehdule?.time?.id : '',
    //     },
    // };
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
        positionId: !!formState?.position ? formState?.position?.id : 0,
        isCarousel: formState?.layoutPosition?.value === 'Carousel',
        isSplit: formState?.layoutPosition?.value === 'Carousel' ? false : formState?.splitTest,
        isSendTestMail: !!formState?.isSendTestMail ? formState?.isSendTestMail : 0,

        parentChannelDetailId: parentChannelDetailId,
        parentChannelDetailType: parentChannelDetailType,
        actionId: actionId,
        actionTime: actionTime,
        actionTimeDuration: actionTimeDuration,
        levelNumber: levelNumber,
        domId: domId,
        channelFriendlyName: channelFriendlyName,
        flowChannel: flowChannel,
        addOnLevel: addOnLevel,
        allOrAny: isALLorAny,
        dynamiclistId: dynamiclistId,
        channelId: channelId,
        channelDetailType: channelDetailType,
        activeChannel: activeChannel,
        isSendTimeOptEnable: false,
        isSecureMessageON: formState?.isSecureMessage ? true : false,

        ...requestApproval,

        ...handleMDCExtraPayload(location),
        ...handleAllChannelPayload('mobileNotification', formState),

        segmentationListId: !!formState?.audience ? formState?.audience?.map((item) => item?.segmentationListId) : [],
        content: buildTabContent(formState, timeZoneId, location, mobileNotificationEditData),
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
        //     interactivebuttonTypes: formState?.buttonText?.[0]?.type,
        //     interactivebuttonValue: formState?.buttonText?.[0]?.text?.value,
        //     caTextColour: formState?.buttonText?.[0]?.fontColor,
        //     caBgColour: formState?.buttonText?.[0]?.backgroundColor,
        //     interactivebuttonTypes2: formState?.buttonText?.[1]?.type,
        //     interactivebuttonValue2: formState?.buttonText?.[1]?.text?.value,
        //     caTextColour2: formState?.buttonText?.[1]?.fontColor,
        //     cBgColour2: formState?.buttonText?.[1]?.backgroundColor,
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

    // if (type === 'web') {
    //     temp = {
    //         ...temp,
    //         ...tempWeb,
    //     };
    // } else {
    temp = {
        ...temp,
        ...tempMobile,
    };
    // }

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

export const mapSmartLinksWithLabelsToButtonOptions = (smartLinksWithLabels = []) =>
    smartLinksWithLabels?.map((item, ind) => {
        const tech = (item.smartLinkTitle || item.id || '').trim();
        let friendly = (item.friendlyName || '').trim();
        if (
            !friendly ||
            friendly.toLowerCase() === tech.toLowerCase() ||
            /^smartlink\d+$/i.test(friendly) ||
            /^smart\s*link\s*\d+$/i.test(friendly)
        ) {
            friendly = '';
        }
        return {
            id: ind + 5,
            value: item.id,
            displayLabel: friendly || tech,
            subLabel: friendly ? tech : '',
        };
    }) ?? [];

export const getMobileEditFormData = async (
    data,
    getAudienceData,
    mobileAppData,
    getInboxClassificationData,
    updateTabState,
    getAlertSoundValues,
    usersList,
    inboxData,
    smartLinksWithLabels,
    audienceListData,
    setDirtyReset,
    setEditAutoScheduleDetails,
    mobileAppId,
    isTemplateFlow
) => {
    const { timeZoneList } = getmasterData();
    const {
        mobileAppId: dataMobileAppId,
        inboxclassificationId,
        requestForApproval,
        testCampaignEmailAddress,
        segmentationListId,
        savedAudienceCountList,
        pushTypeId,
        positionId,
        layoutId,
        isAutoRefereshenabled,
        isSplitAbEnabled,
        isSecureMessageON,
        isSendTimeOptEnable,
        content,
        mobAutoSchedule,
    } = data || {};
    // debugger;
    const mAppId = isTemplateFlow ? mobileAppId : dataMobileAppId;
    const domains = mobileAppData?.filter((item) =>
        isTemplateFlow
            ? item?.appGuId === mAppId
            : item?.mobileAppId === mAppId
    );
    let defaultAudienceList = !audienceListData?.length ? await getAudienceData(domains?.[0], '') : audienceListData;
    let alertSoundsList = await getAlertSoundValues(domains?.[0]);
    // let testEmail = {};
    let inboxClassificationList =
        // inboxData?.length === 0 || inboxData === undefined
        await getInboxClassificationData({ mobileApp: domains?.[0], edit: true }, '', 'isEdit');
    // : inboxData;
    let inboxClassification = inboxClassificationList?.filter((item) => item?.cdId === inboxclassificationId);
    // let testUsersList = !!testCampaignEmailAddress
    //     ? usersList?.filter((item) => {
    //           if (item?.email === testCampaignEmailAddress) {
    //               testEmail = tempReturn;
    //               return tempReturn;
    //           }
    //       })
    //     : [];

    // Process request for approval data - using same pattern as Email component
    const testEmail = _find(usersList, ['email', testCampaignEmailAddress]) || '';
    const isApprovalInputEmail = !testEmail && testCampaignEmailAddress ? true : false;
    let audienceMap = [];
    const seenIds = new Set();
    let audience = segmentationListId?.map((item) => {
        for (var i = 0; i < defaultAudienceList?.length; i++) {
            if (defaultAudienceList[i].segmentationListId === item && !seenIds.has(item)) {
                audienceMap.push(defaultAudienceList[i]);
                seenIds.add(item);
            }
        }
    });
    let segmentFilterAudienceList =
        !audienceMap?.length && segmentationListId?.length
            ? await getAudienceData(domains?.[0], segmentationListId)
            : [];
    audienceMap = segmentFilterAudienceList?.length ? segmentFilterAudienceList : audienceMap;

    // Deduplicate audienceMap based on segmentationListId
    if (audienceMap?.length > 0) {
        const uniqueAudienceMap = [];
        const uniqueIds = new Set();
        audienceMap.forEach((audienceItem) => {
            const id = audienceItem?.segmentationListId;
            if (id && !uniqueIds.has(id)) {
                uniqueAudienceMap.push(audienceItem);
                uniqueIds.add(id);
            }
        });
        audienceMap = uniqueAudienceMap;
    }

    audienceMap = handleUpdateEditAudienceCount({
        channelId: COMMUNICATION_CHANNEL_ID.MOBILE_NOTIFICATION,
        audience: audienceMap,
        savedAudienceCountList: savedAudienceCountList || [],
        statusId: content?.[0]?.statusId,
    });

    let deliveryType = DELIVERY_TYPE_FOR_MOBILE.filter((item) => item?.id === pushTypeId);
    let position = MODAL_POSISTION_FOR_MOBILE.filter((item) => item?.id === positionId);
    let layoutPosition = findLayoutPositionData(deliveryType?.[0]).filter((item) => item?.id === layoutId);
    var tempTabs = [];

    let smartLinksData = mapSmartLinksWithLabelsToButtonOptions(smartLinksWithLabels);
    let urlType = URL_TYPE_FOR_MOBILE?.map((item, index) => {
        return {
            id: index + 10,
            value: item?.value,
        };
    });
    let buttonTextData = [...BUTTON_TEXT_FOR_MOBILE(deliveryType?.[0]?.id), ...smartLinksData, ...urlType];
    // console.log(
    //     'Mobile App data :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::',
    //     mobileAppData,
    //     alertSoundsList,
    //     testUsersList,
    //     usersList,
    // );
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

    const isCarousel = layoutPosition[0]?.id === 4 ? true : false;
    const matchAudienceType = audienceTypeList?.filter((typeList) =>
        audienceMap?.map((aud) => aud?.listType)?.includes(typeList?.id),
    );
    const requestApproval = requestForApproval?.isWorkflowEnabled || parseInt(deliveryType?.[0]?.id, 10) === 5 || false;
    let tempEdit = {
        sendwebPushTo: '',
        isAutoRefereshenabled: isAutoRefereshenabled,
        mobileApp: domains?.[0],
        domain: domains?.[0],
        audience: audienceMap,
        audienceType: matchAudienceType?.length ? matchAudienceType : [audienceTypeList[0]],
        approvalList: {
            testEmail: isApprovalInputEmail ? testCampaignEmailAddress : testEmail,
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
        deliveryType: deliveryType?.[0],
        contentInput: '',
        interactivity: false,
        expiry: false,
        currentSplitTab: 0,
        channelType: '',
        splitTest: isCarousel ? true : isSplitAbEnabled,
        secureMessage: isSecureMessageON,
        expiryTime: 'hour(s)',
        expiryValue: '',
        inboxClassification: !!inboxClassification ? inboxClassification?.[0] : '',
        layoutPosition: layoutPosition?.[0],
        position: position?.[0],
        inPageBanner: mapInPageBannerFromContentItem(content?.[0]),
        hashtag: [],
        alert: false,
        sendTimeRecommendation: isSendTimeOptEnable,
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
        editorTextLength: 0,
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
        // debugger;
        let buttonText = [];
        const timeZone = _find(timeZoneList, ['timeZoneID', content?.[i]?.timezoneId]);
        let interactiveCustJSON = !!content?.[i]?.interactiveCustParameter
            ? JSON.parse(content?.[i]?.interactiveCustParameter)
            : '';
        let interactiveCustJSON2 = !!content?.[i]?.interactiveCustParameter2
            ? JSON.parse(content?.[i]?.interactiveCustParameter2)
            : '';

        let interactiveCustValue1 =
            interactiveCustJSON?.length > 0 && interactiveCustJSON?.[0].type?.startsWith('Smart Link')
                ? 'smartLink' + interactiveCustJSON[0].type[interactiveCustJSON[0]?.type?.length - 1]
                : interactiveCustJSON?.[0]?.value;
        let interactiveCustValue2 =
            interactiveCustJSON2?.length > 0 && interactiveCustJSON2?.[0]?.type?.startsWith('Smart Link')
                ? 'smartLink' + interactiveCustJSON2[0].type[interactiveCustJSON2[0]?.type?.length - 1]
                : interactiveCustJSON2?.[0]?.value;
        // let interactiveCustValue1 =
        //     interactiveCustJSON?.[0]?.type === 0
        //         ? 'smartLink' + interactiveCustJSON?.[0]?.value
        //         : interactiveCustJSON?.[0]?.value;
        // let interactiveCustValue2 =
        //     interactiveCustJSON2?.[0]?.type === 0
        //         ? 'smartLink' + interactiveCustJSON2?.[0]?.value
        //         : interactiveCustJSON2?.[0]?.value;
        // console.log(
        //     'Check custom value :::::]][[[[[[[[[[[][][][[[[[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]] :::::::::::: ',
        //     interactiveCustJSON2,
        //     '::::: ',
        //     interactiveCustValue2,
        // );
        let alertSound = alertSoundsList?.filter((item) => item?.PushNotifyAudioID === content?.[i]?.audioId);
        let expiryTime = EXPIRE_CONFIG?.filter((item) => item?.value === content?.[i]?.pushexpirySchedule);
        let hashTagData = content?.[i]?.hashtag ? content?.[i]?.hashtag?.split(',') : [];

        if (!!content?.[i]?.interactivebuttonTypes) {
            let customText = !!getParseData(content?.[i]?.interactiveCustParameter)
                ? getParseData(content?.[i]?.interactiveCustParameter)[0]?.key
                : buttonTextData.filter((item) => item.id === Number(content?.[i]?.interactivebuttonValue))?.[0]
                    ?.value;
            buttonText.push({
                type: content?.[i]?.interactivebuttonTypes,
                urlType: !!content?.[i]?.interactiveCustParameter
                    ? URL_TYPE_FOR_MOBILE?.filter(
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
                    ? URL_TYPE_FOR_MOBILE?.filter(
                        (item) =>
                            item?.value === JSON.parse(content?.[i]?.interactiveCustParameter2)?.[0]?.type,
                    )?.[0]
                    : '',
                customText: customText2,
                link: !!content?.[i]?.interactiveCustParameter2 ? interactiveCustValue2 : '',
                fontColor: !!content?.[i]?.caTextColour2 ? content?.[i]?.caTextColour2 : '',
                backgroundColor: !!content?.[i]?.caBgColour2 ? content?.[i]?.caBgColour2 : '',
                isNewLink: !!content?.[i]?.interactiveCustParameter2
                    ? !!JSON.parse(content?.[i]?.interactiveCustParameter2)?.[0]?.type
                    : false,
                show: false,
            });
        }
        if (content?.length === 1 && content?.[i]?.splitType === '') {
            tempEdit = {
                ...tempEdit,
                contentInput: !!content?.[i]?.contentType
                    ? getContentInput[content?.[i]?.contentType]?.value
                    : '',
                alertSound: content?.[i]?.audioId !== 0,
                alertSoundValue: content?.[i]?.audioId !== 0 ? alertSound?.[0] : '',
                edmContent: !!content?.[i] && content?.[i]?.contentType === 'Z' ? content?.[i]?.content : '',
                frequency0: !!content?.[i]?.reschedule
                    ? EXPIRE_CONFIG_FOR_MOBILE?.filter((item) => item?.text === content?.[i]?.reschedule)?.[0]
                    : '',
                frequency1: !!content?.[i]?.reschedule2
                    ? EXPIRE_CONFIG_FOR_MOBILE?.filter((item) => item?.text === content?.[i]?.reschedule2)?.[0]
                    : '',
                rating0: !!content?.[i]?.interactivehours ? content?.[i]?.interactivehours : 0,
                rating1: !!content?.[i]?.interactivehours2 ? content?.[i]?.interactivehours2 : 0,

                interactivity: content?.[i]?.isInteractivebuttonEnabled === 1,
                // currentSplitTab: i,
                currentTab: !!content?.[i]?.contentType
                    ? getContentInput[content?.[i]?.contentType]?.id
                    : 0,
                currentTabIndex: !!content?.[i]?.contentType
                    ? getContentInput[content?.[i]?.contentType]?.id
                    : 0,
                expiry: content?.[i]?.isExpiryButtonEnabled === 1,
                expiryTime: !!content?.[i]?.pushexpirySchedule ? expiryTime?.[0] : {},
                expiryValue: !!content?.[i]?.pushExpiryhours ? content?.[i]?.pushExpiryhours : '',
                // inboxClassification: !!inboxClassification ? inboxClassification?.[i] : '',
                pushNotifyChannelDetailId: !!content?.[i]?.pushNotifyChannelDetailId
                    ? content?.[i]?.pushNotifyChannelDetailId
                    : 0,
                hashtag: !!content?.[i]?.hashtag ? content?.[i]?.hashtag?.split(',') : [],
                buttonText: buttonText,
                frequency: !!content?.[i]?.interactivehours
                    ? EXPIRE_CONFIG_FOR_MOBILE?.filter((item) => item?.value === content?.[i]?.interactivehours)?.[0]
                    : '',
                rating: content?.[i]?.interactivehours2 || '',
                // bgOverlayColor: !!content?.[i]?.bgOverlayColor ? content?.[i]?.bgOverlayColor : '',
                // bgOverlay: content?.[i]?.bgOverlayEnabled === 1,
                title: {
                    text: !!content?.[i]?.title ? content?.[i]?.title : '',
                    fontColor: !!content?.[i]?.titleColor ? content?.[i]?.titleColor : '',
                },
                subtitleText: !!content?.[i]?.subTitle ? content?.[i]?.subTitle : '',
                customization: {
                    background: !!content?.[i]?.contentBgColour ? content?.[i]?.contentBgColour : '',
                    color: !!content?.[i]?.contentTextColour ? content?.[i]?.contentTextColour : '',
                },
                editorText: !!content?.[i]?.content ? content?.[i]?.content : '',
                editorTextLength: !!content?.[i]?.content ? content?.[i]?.content?.length : 0,
                timezone: !!content?.[i]?.timezoneId
                    ? _find(timeZoneList, ['timeZoneID', content?.[i]?.timezoneId])
                    : '',
                schedule: !!content?.[i]?.localscheduleDateTime
                    ? new Date(content?.[i]?.localscheduleDateTime)
                    : '',
                browserImage: !!content?.[i]?.pushImagePath ? content?.[i]?.pushImagePath : '',
                previewImage: !!content?.[i]?.pushImagePath ? content?.[i]?.pushImagePath : '',
                makeAlert: content?.[i]?.isTitleON === 0 ? false : true,
                shortDesc: !!content?.[i]?.shortDesc
                    ? {
                        text: content?.[i]?.shortDesc,
                    }
                    : '',
                timeZone: timeZone,
                timer: content?.[i]?.isTimerEnabled !== 0 ? new Date(content?.[i]?.timerTTL) : '',
                timerTextColor: !!content?.[i]?.timerTextColor ? content?.[i]?.timerTextColor : '',
                timerBgColor: !!content?.[i]?.timerBgColor ? content?.[i]?.timerBgColor : '',
                remainingTime:
                    content?.[i]?.isTimerEnabled !== 0
                        ? caluculateTimer(new Date(content?.[i]?.timerTTL))
                        : '',
                splitscehdule: {
                    autoSchedule: mobAutoSchedule?.autoSchedule ?? false,
                    communicationPerformanceBy: 'Content',
                    duration: Number(mobAutoSchedule?.startIn ?? 0),
                    time: _find(SCHEDULE_START_TIME_MENU, ['id', Number(mobAutoSchedule?.periodRange ?? 0)]),
                    splitScheduleID: mobAutoSchedule?.splitScheduleID ?? 0,
                },
                ...mapInPageImportFromContentItem(content?.[i]),
                thumbnailUrl: {
                    selectImport: true,
                    imageUrl: content?.[i]?.thumbnailImagePath || '',
                    defaulPreview: true,
                    image: content?.[i]?.thumbnailImagePath || '',
                    imageType: 'URL'
                },
                impressions: !!content?.[i]?.impressionCount
                    ? {
                        id: Number(content?.[i]?.impressionCount),
                        value: String(content?.[i]?.impressionCount),
                    }
                    : '',
                priority: !!content?.[i]?.priority
                    ? { id: Number(content?.[i]?.priority), value: String(content?.[i]?.priority) }
                    : '',
                templateContent: !!content?.[i] && content?.[i]?.contentType === 'T' ? content?.[i]?.content : '',
                contentType: content?.[i]?.contentType || 'R'
            };
        } else {
            //debugger;
            tempEdit = {
                ...tempEdit,
                hashtag: isCarousel && content?.[i]?.hashtag ? content?.[i]?.hashtag?.split(',') : [],
                expiry: isCarousel ? content?.[i]?.isExpiryButtonEnabled === 1 : false,
                expiryValue:
                    isCarousel && !!content?.[i]?.pushExpiryhours ? content?.[i]?.pushExpiryhours : '',
                expiryTime: isCarousel && !!content?.[i]?.pushexpirySchedule ? expiryTime?.[0] : {},
                alertSound: isCarousel && content?.[i]?.audioId !== 0,
                alertSoundValue: isCarousel && content?.[i]?.audioId !== 0 ? alertSound?.[0] : '',
                splitscehdule: {
                    autoSchedule: mobAutoSchedule?.autoSchedule ?? false,
                    communicationPerformanceBy: 'Content',
                    duration: Number(mobAutoSchedule?.startIn ?? 0),
                    time: _find(SCHEDULE_START_TIME_MENU, ['id', Number(mobAutoSchedule?.periodRange ?? 0)]),
                    splitScheduleID: mobAutoSchedule?.splitScheduleID ?? 0,
                },
                splitLength: i + 1,
                timezone:
                    isCarousel === true && !!content?.[0]?.timezoneId
                        ? timeZoneList?.filter((item) => item?.timeZoneID === content?.[0]?.timezoneId)[0]
                        : '',
                schedule:
                    isCarousel === true && !!content?.[0]?.localscheduleDateTime
                        ? new Date(content?.[0]?.localscheduleDateTime)
                        : '',
                [`split${splitObj[i]}`]: {
                    interactivity: content?.[i]?.isInteractivebuttonEnabled === 1,
                    alertSound: content?.[i]?.audioId !== 0,
                    alertSoundValue: content?.[i]?.audioId !== 0 ? alertSound?.[0] : '',
                    edmContent: !!content?.[i] && content?.[i]?.contentType === 'Z' ? content?.[i]?.content : '',
                    frequency: !!content?.[i]?.interactivehours
                        ? EXPIRE_CONFIG_FOR_MOBILE?.filter(
                            (item) => item?.value === content?.[i]?.interactivehours,
                        )?.[0]
                        : '',
                    rating: content?.[i]?.interactivehours2 || '',
                    frequency0: !!content?.[i]?.reschedule
                        ? EXPIRE_CONFIG_FOR_MOBILE?.filter(
                            (item) => item?.value === content?.[i]?.reschedule,
                        )?.[0]
                        : '',
                    frequency1: !!content?.[i]?.reschedule2
                        ? EXPIRE_CONFIG_FOR_MOBILE?.filter(
                            (item) => item?.value === content?.[i]?.reschedule2,
                        )?.[0]
                        : '',
                    rating0: !!content?.[i]?.interactivehours ? content?.[i]?.interactivehours : 0,
                    rating1: !!content?.[i]?.interactivehours2 ? content?.[i]?.interactivehours2 : 0,
                    contentInput: !!content?.[i]?.contentType
                        ? getContentInput[content?.[i]?.contentType]?.value
                        : '',

                    expiry: content?.[i]?.isExpiryButtonEnabled === 1,
                    expiryTime: !!content?.[i]?.pushexpirySchedule ? expiryTime?.[0] : {},
                    expiryValue: !!content?.[i]?.pushExpiryhours ? content?.[i]?.pushExpiryhours : '',
                    pushNotifyChannelDetailId: !!content?.[i]?.pushNotifyChannelDetailId
                        ? content?.[i]?.pushNotifyChannelDetailId
                        : 0,
                    // inboxClassification: !!inboxClassification ? inboxClassification?.[i] : '',
                    hashtag: !!content?.[i]?.hashtag ? content?.[i]?.hashtag?.split(',') : [],
                    buttonText: buttonText,
                    // currentSplitTab: i,
                    currentTabIndex: !!content?.[i]?.contentType
                        ? getContentInput[content?.[i]?.contentType]?.id
                        : 0,
                    bgOverlayColor: !!content?.[i]?.bgOverlayColor
                        ? {
                            color: content?.[i]?.bgOverlayColor,
                            opacity: Number(content?.[i]?.bgOverlayOpacity) || 1,
                        }
                        : '',
                    bgOverlay: content?.[i]?.bgOverlayEnabled === 1,
                    title: {
                        text: !!content?.[i]?.title ? content?.[i]?.title : '',
                        fontColor: !!content?.[i]?.titleColor ? content?.[i]?.titleColor : '',
                    },
                    subtitleText: !!content?.[i]?.subTitle ? content?.[i]?.subTitle : '',

                    customization: {
                        background: !!content?.[i]?.contentBgColour ? content?.[i]?.contentBgColour : '',
                        color: !!content?.[i]?.contentTextColour ? content?.[i]?.contentTextColour : '',
                    },
                    editorText: !!content?.[i]?.content ? content?.[i]?.content : '',
                    editorTextLength: !!content?.[i]?.content ? content?.[i]?.content?.length : 0,
                    timezone: !!content?.[i]?.timezoneId
                        ? _find(timeZoneList, ['timeZoneID', content?.[i]?.timezoneId])
                        : '',
                    schedule: !!content?.[i]?.localscheduleDateTime
                        ? new Date(content?.[i]?.localscheduleDateTime)
                        : '',
                    browserImage: !!content?.[i]?.pushImagePath ? content?.[i]?.pushImagePath : '',
                    previewImage: !!content?.[i]?.pushImagePath ? content?.[i]?.pushImagePath : '',

                    makeAlert: content?.[i]?.isTitleON === 0 ? false : true,
                    shortDesc: !!content?.[i]?.shortDesc
                        ? {
                            text: content?.[i]?.shortDesc,
                        }
                        : '',
                    timeZone: timeZone,
                    timer: content?.[i]?.isTimerEnabled !== 0 ? new Date(content?.[i]?.timerTTL) : '',
                    timerTextColor: !!content?.[i]?.timerTextColor ? content?.[i]?.timerTextColor : '',
                    timerBgColor: !!content?.[i]?.timerBgColor ? content?.[i]?.timerBgColor : '',
                    remainingTime:
                        content?.[i]?.isTimerEnabled !== 0
                            ? caluculateTimer(new Date(content?.[i]?.timerTTL))
                            : '',
                    ...mapInPageImportFromContentItem(content?.[i]),
                    thumbnailUrl: {
                        selectImport: true,
                        imageUrl: content?.[i]?.thumbnailImagePath || '',
                        defaulPreview: true,
                        image: content?.[i]?.thumbnailImagePath || '',
                        imageType: 'URL'
                    },
                    impressions: !!content?.[i]?.impressionCount
                        ? {
                            id: Number(content?.[i]?.impressionCount),
                            value: String(content?.[i]?.impressionCount),
                        }
                        : '',
                    priority: !!content?.[i]?.priority
                        ? { id: Number(content?.[i]?.priority), value: String(content?.[i]?.priority) }
                        : '',
                    templateContent: !!content?.[i] && content?.[i]?.contentType === 'T' ? content?.[i]?.content : '',
                    contentType: content?.[i]?.contentType || 'R'
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
    // console.log('Edit data ::: ', tempEdit);
    return tempEdit;
};

const caluculateTimer = (data) => {
    let currentDate = new Date().getTime();
    let selectedDate = new Date(data).getTime();
    var differenceInHours = (selectedDate - currentDate) / (1000 * 60 * 60);
    var days = Math.floor(differenceInHours / 24);

    // Calculate remaining hours
    var remainingHours = differenceInHours % 24;

    // Calculate remaining minutes and seconds
    var totalMinutes = remainingHours * 60;
    var minutes = Math.floor(totalMinutes % 60);
    var seconds = Math.floor((totalMinutes * 60) % 60);

    var result = days + ':' + Math.floor(remainingHours) + ':' + minutes + ':' + seconds;
    // setValue(remainingTimeName, result);
    return result;
};

export const FORM_INITIAL_STATE = {
    mode: 'onSubmit',
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
        currentTabIndex: null,

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
            editorTextLength: 0,
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
            editorTextLength: 0,
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
            editorTextLength: 0,
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
            editorTextLength: 0,
        },
        approvalList: {
            name: [{ approverName: '', mandatory: false }],
            requestApproval: false,
            approvalFrom: 'All',
            approvalCount: '',
            dialCode: '',
            followHierarchy: false,
            testPhoneNumber: '',
        },
    },
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
    currentTabIndex: null,
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
        editorTextLength: 0,
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
        editorTextLength: 0,
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
        editorTextLength: 0,
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
        editorTextLength: 0,
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
    currentTabIndex: null,
    templateContent: ''
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
    hashtag: [],
    editorText: '',
    edmContent: '',
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
    currentTabIndex: null,
    browserImage: '',
    previewVideo: '',
    timer: '',
    remainingTime: '',
    timerTextColor: '',
    timerBgColor: '',
    templateContent: ''
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
    'position',
    'inPageBanner',
    'totalAudience'
];

export const DELIVERY_TYPE = [
    { id: 1, value: 'Alert/rich push' },
    { id: 3, value: 'In-page overlay' },
];
export const DELIVERY_TYPE_FOR_MOBILE = [
    { id: 1, value: 'Alert/rich push' },
    { id: 2, value: 'In-app messaging' },
    { id: 5, value: 'In-page content' },
    { id: 4, value: 'In-app inbox' },
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
    // { id: 3, text: 'Day(s)', value: 'D' },
];

export const URL_TYPE_FOR_MOBILE = [
    { id: 1, value: 'Call' },
    { id: 2, value: 'Share' },
    { id: 3, value: 'WebURL' },
];

export const URL_TYPE = [{ id: 1, value: 'WebURL' }];

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
    //1--> may be later ==> custom text && frequency && rating
    // 2--> dismiss ====> only custom text
    // 4--> unsubscribe ====> only custom text
    // 5-9 --> smart link 1 to smart link 5  ====> only custom text
    // 10--> web url ===>  custom text &&  isNewlink
    // 11--> share ===>  custom text &&  isNewlink
    // 12--> call ===>  custom text &&  isNewlink
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
                    if (!button.text || !button.customText) {
                        return handleErrorTab(index, 'text');
                    }

                    if (
                        button?.isNewLink &&
                        !button.link &&
                        button.text.id !== 1 &&
                        button.text.value !== 'Maybe later'
                    ) {
                        return handleErrorTab(index, 'link');
                    }

                    if (
                        button.text.id === 1 &&
                        button.text.value === 'Maybe later' &&
                        (!formState?.frequency || !formState?.rating)
                    ) {
                        return handleErrorTab(index, 'frequency');
                    }

                    return true;
                });
            }
            return true;
        default:
            return true;
    }
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

/** Import tab file validation — supports zip, in-page media (edmContent / server URLs). */
export const hasMobileImportFileContent = (tabState = {}) => {
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

export const getMobileSplitImportValidationError = (params) =>
    getSplitImportValidationError({
        ...params,
        hasImportContent: hasMobileImportFileContent,
    });

/** In-page content (id 5) does not use layout position — avoid click-off on normal flow. */
export const getMobileNotificationContentClickOffClass = ({ deliveryType, layoutPosition, isTemplateFlow }) => {
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

export const isMobileNotificationContentVisible = ({ deliveryType, inPageBanner }) => {
    if (deliveryType?.id !== 5) {
        return true;
    }
    return isInPageBannerSelected(inPageBanner);
};

export const getCreateContentRenderConfig = (deliveryType, layoutPosition, position, splitTest) => {
    const response = { isSplitAB: false, status: false };
    if (splitTest) return { isSplitAB: true, status: true };

    if (!deliveryType) return response;

    const { id: deliveryId } = deliveryType;
    const layoutId = layoutPosition?.id;
    const hasPosition = !!position;

    switch (deliveryId) {
        case 1: // Alert/rich push
            if (layoutId === 5) return { isSplitAB: false, status: true };
            if (layoutId === 4) return { isSplitAB: true, status: true };
            break;

        case 2: // In-app messaging
            if (layoutId === 1) return { isSplitAB: false, status: true };
            if ([3].includes(layoutId) && hasPosition) return { isSplitAB: false, status: true };
            if ([4].includes(layoutId) && hasPosition) return { isSplitAB: true, status: true };
            break;

        case 4: // In-app inbox
            return { isSplitAB: false, status: true };
        case 5: // In-page content
            return { isSplitAB: !!splitTest, status: true };
    }

    return response;
};
