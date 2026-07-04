import { formatName } from 'Utils/modules/formatters';
import { URL } from 'Constants/GlobalConstant/Placeholders';
import AdsListing from './Pages/Listing/index.jsx';

export const initialImageSetting = {
    title: '',
    text: '',
    action: '',
    image: '',
    deviceType: '',
    size: '',
    imageUrl: '',
    isPreviewImageUrl: false,
    selectImport: false,
};
export const initialVideoSetting = {
    duration: '5s',
    completionUrl: '',
    errorUrl: '',
    firstQuartileUrl: '',
    midpointUrl: '',
    skipUrl: '',
    startUrl: '',
    thirdQuartileUrl: '',
    video: '',
    selectImport: false,
    companion: '',
};
export const initialAudioSetting = {
    audio: '',
    selectImport: false,
};
export const initialOptionalSetting = {
    top: '',
    bottom: '',
    left: '',
    right: '',
    color: '',
    fontSize: '',
};

export const initialNativeSetting = {
    text: '',
    nativeResolution: [
        {
            id: 1,
            imageContent: {
                imageType: '',
                image: '',
            },
            imageResolution: { id: 1, size: '300x300' },
        },
    ],
    selectImport: false,
};
export const initialPushNotifySetting = {
    text: '',
    pushNotifyResolution: [
        {
            id: 1,
            imageContent: {
                imageType: 'URL',
                image: '',
            },
            imageResolution: { id: 1, size: '192x192' },
            isRequired: true,
        },
        {
            id: 2,
            imageContent: {
                imageType: 'URL',
                image: '',
            },
            imageResolution: { id: 2, size: '360x180' },
            isRequired: true,
        },
        {
            id: 3,
            imageContent: {
                imageType: 'URL',
                image: '',
            },
            imageResolution: { id: 3, size: '600x400' },
            isRequired: true,
        },
        {
            id: 5,
            imageContent: {
                imageType: 'URL',
                image: '',
            },
            imageResolution: { id: 5, size: '1080x576' },
            isRequired: true,
        },
        {
            id: 6,
            imageContent: {
                imageType: 'URL',
                image: '',
            },
            imageResolution: { id: 6, size: '492x328' },
            isRequired: true,
        },
    ],
    pushNotifyDefaultTab: 0,
};
export const metaAdsSetting = {
    title: '',
    metaResolution: [
        {
            id: 1,
            imageContent: {
                imageType: 'URL',
                image: '',
                imageUrl: '',
            },
            imageResolution: { id: 1, name: 'Square' },
            isRequired: true,
            required:true
        },
    ],
    metaDefaultTab: 0,
    description: '',
    clickURL: '',
    caption: '',
    pixelURL: '',
};

export const initialHTMLSetting = {
    isMarid: true,
    isResponsive: false,
    isSecure: true,
    html: '',
    thumbnailUrl: 'URL',
};

export const formInitialState = {
    digipop: {
        name: '',
        description: '',
        attribute: [],
        type: '',
        optionalSetting: {
            ...initialOptionalSetting,
        },
        imageSetting: {
            ...initialImageSetting,
        },
        audioSetting: {
            ...initialAudioSetting,
        },
        videoSetting: {
            ...initialVideoSetting,
        },
        nativeSetting: {
            ...initialNativeSetting,
        },
        pushNotifySetting: {
            ...initialPushNotifySetting,
        },
        htmlSetting: {
            ...initialHTMLSetting,
        },
        metaSetting: {
            ...metaAdsSetting,
        },
    },
};

export const digipopType = [
    {
        id: 1,
        type: 'image',
        name: 'Image',
    },
    // {
    //     id: 2,
    //     type: 'native',
    //     name: 'Native',
    // },
    {
        id: 3,
        type: 'video',
        name: 'Video',
    },
    // {
    //     id: 4,
    //     type: 'audio',
    //     name: 'Audio',
    // },
    // {
    //     id: 5,
    //     type: 'html',
    //     name: 'HTML',
    // },
    {
        id: 6,
        type: 'pushnotif',
        name: 'Push notification',
    },
    {
        id: 7,
        type: 'meta',
        name: 'Meta ads',
    },
];

export const digipopAttribute = [
    { id: 1, attributeType: 'Audio autoplay' },
    { id: 2, attributeType: 'Audio user initiated' },
    { id: 3, attributeType: 'Expandable (auto)' },
    { id: 4, attributeType: 'Expandable (user initiated / click)' },
    { id: 5, attributeType: 'Expandable (user initiated / rollover)' },
    { id: 6, attributeType: 'In-banner video (autoplay)' },
    { id: 7, attributeType: 'In-banner video (user initiated)' },
    { id: 8, attributeType: 'Pop-up (over, under, exit)' },
    { id: 9, attributeType: 'Provocative or suggestive' },
    { id: 10, attributeType: 'Shaky, flashing, extreme animations' },
    { id: 11, attributeType: 'Surveys' },
    { id: 12, attributeType: 'Text only' },
    { id: 13, attributeType: 'Embedded game' },
    { id: 14, attributeType: 'Window dialog/alert' },
    { id: 15, attributeType: 'Has audio on/off control' },
    { id: 16, attributeType: 'Ad can be skipped' },
];

export const digipopDeviceType = [
    {
        id: 1,
        type: 'iphone',
        name: 'Iphone',
    },
    {
        id: 2,
        type: 'android',
        name: 'Android',
    },
    {
        id: 3,
        type: 'generic',
        name: 'Generic',
    },
    {
        id: 4,
        type: 'tablet',
        name: 'Tablet',
    },
];

export const digipopImageResolution = {
    iphone: [
        { id: 1, size: '320x50' },
        { id: 2, size: '300x50' },
        { id: 3, size: '320x480' },
        { id: 4, size: '300x250' },
        { id: 5, size: '480x320' },
    ],
    android: [
        { id: 1, size: '320x50' },
        { id: 2, size: '300x50' },
        { id: 3, size: '320x480' },
        { id: 4, size: '300x250' },
        { id: 5, size: '480x320' },
    ],
    generic: [
        { id: 1, size: '320x50' },
        { id: 2, size: '300x50' },
        { id: 3, size: '320x480' },
        { id: 4, size: '300x250' },
        { id: 5, size: '480x320' },
    ],
    tablet: [
        { id: 1, size: '728x90' },
        { id: 2, size: '468x60' },
        { id: 3, size: '768x1024' },
        { id: 4, size: '300x250' },
    ],
};

// export const ImageSettingCommonResolution = [
//     { id: 1, size: '300x600' },
//     { id: 2, size: '320x480' },
//     { id: 3, size: '240x400' },
//     { id: 4, size: '336x280' },
//     { id: 5, size: '120x240' },
//     { id: 6, size: '120x90' },
//     { id: 7, size: '120x60' },
//     { id: 8, size: '300x100' },
//     { id: 9, size: '250x250' },
//     { id: 10, size: '720x300' },
//     { id: 10, size: '468x60' },
//     { id: 11, size: '234x60' },
//     { id: 12, size: '728x90' },
//     { id: 13, size: '160x600' },
//     { id: 14, size: '300x250' },
//     { id: 15, size: '120x600' },
//     { id: 16, size: '970x90' },
// ];
export const ImageSettingCommonResolution = [
    { id: 1, size: '120x240' },
    { id: 2, size: '120x90' },
    { id: 3, size: '120x60' },
    { id: 4, size: '120x600' },
    { id: 5, size: '240x400' },
    { id: 6, size: '234x60' },
    { id: 7, size: '250x250' },
    { id: 8, size: '300x250' },
    { id: 9, size: '300x100' },
    { id: 10, size: '300x600' },
    { id: 11, size: '336x280' },
    { id: 12, size: '320x480' },
    { id: 13, size: '468x60' },
    { id: 14, size: '720x300' },   
    { id: 15, size: '160x600' },
    { id: 16, size: '728x90' },
    { id: 17, size: '970x90' }
  ];
  
export const MetaSettingResolution = [
    { id: 1, name: 'Square' },
    { id: 2, size: '1080x1920', name: 'Portrait' },
    { id: 3, size: '1080x566', name: 'Landscape' },
];

export const metaResolutionList = [
    { id: 1, name: 'Square' },
    { id: 2, size: '1080x1920', name: 'Portrait' },
    { id: 3, size: '1080x566', name: 'Landscape' },
];

export const NativeResolution = [
    { id: 1, size: '300x300' },
    { id: 2, size: '1060x225' },
    { id: 3, size: '1200x627' },
    { id: 4, size: '138x115' },
    { id: 5, size: '180x60' },
    { id: 6, size: '240x200' },
    { id: 7, size: '356x200' },
    { id: 8, size: '580x480' },
    { id: 9, size: '640x480' },
    { id: 10, size: '72x60' },
    { id: 11, size: '90x75' },
];

export const PushNotifyResolution = [
    { id: 1, size: '192x192' },
    { id: 2, size: '360x180' },
    { id: 3, size: '600x400' },
    { id: 4, size: '1080x576' },
    { id: 5, size: '492x328' },
];

export const commonResolution = [
    { id: 1, size: '192x192' },
    { id: 2, size: '1060x225' },
    { id: 3, size: '1200x627' },
    { id: 4, size: '138x115' },
    { id: 5, size: '180x60' },
    { id: 6, size: '240x200' },
    { id: 7, size: '356x200' },
    { id: 8, size: '580x480' },
    { id: 9, size: '640x480' },
    { id: 10, size: '72x60' },
    { id: 11, size: '90x75' },
    { id: 12, size: '360x180' },
    { id: 13, size: '600x400' },
    { id: 14, size: '1080x576' },
    { id: 15, size: '492x328' },
];
export const commonResolutionPreview = [
    { id: 1, size: '192x192' },
    { id: 16, size: '300x300' },
    { id: 2, size: '1060x225' },
    { id: 3, size: '1200x627' },
    { id: 4, size: '138x115' },
    { id: 5, size: '180x60' },
    { id: 6, size: '240x200' },
    { id: 7, size: '356x200' },
    { id: 8, size: '580x480' },
    { id: 9, size: '640x480' },
    { id: 10, size: '72x60' },
    { id: 11, size: '90x75' },
    { id: 12, size: '360x180' },
    { id: 13, size: '600x400' },
    { id: 14, size: '1080x576' },
    { id: 15, size: '492x328' },
];
export const optionalPushNotifyResolution = [{ id: 7, size: '400x250', isOptional: true }];

export const getNativeRating = (length) => {
    const tempRating = Array.from({ length }, (_, index) => ({
        id: index + 1,
        value: index + 1,
    }));

    return tempRating;
};

export const pushnotificationResolution = [
    { id: 1, size: '192x192' },
    { id: 2, size: '1080x576' },
    { id: 3, size: '360x180' },
    { id: 4, size: '400x250' },
    { id: 5, size: '492x328' },
    { id: 6, size: '600x400' },
];

export const getFormatNumber = (value) => {
    return parseInt(value, 10);
};

export const buildPayload = (formState, userDetails, isSaveOrUpdate) => {
    const { digipop } = formState;
    const { userId, clientId, departmentId, partnerId, id } = userDetails;
    const { name, description, type, attribute } = digipop;

    const { top, bottom, color, left, right, fontSize } = digipop?.optionalSetting;

    const handleAttribute = (data) => {
        const updateAttributeId = data?.length
            ? data.map((item) => {
                  return item.id;
              })
            : [];
        return updateAttributeId?.length ? updateAttributeId : [];
    };

    const handleSettingPayload = (formState) => {
        const { digipop } = formState;
        const { type } = digipop?.type;
        const updateType = type === 'pushnotif' ? 'pushNotify' : type;
        const currentSettingDetails = digipop?.[`${updateType}Setting`];
        const currentTypeSetting = `${type}Setting`;
        if (currentTypeSetting === 'imageSetting') {
            const {
                image = '',
                title = '',
                text = '',
                action = '',
                deviceType = '',
                size = 0,
                imageType = '',
                imageUrl = '',
            } = currentSettingDetails;
            return {
                imageSetting: {
                    image: imageType === 'URL' ? imageUrl : image,
                    title,
                    text,
                    action,
                    // deviceType: deviceType?.type,
                    imageSize: size?.size,
                },
            };
        } else if (currentTypeSetting === 'videoSetting') {
            const {
                duration = 0,
                completionUrl = '',
                errorUrl = '',
                midpointUrl = '',
                skipUrl = '',
                thirdQuartileUrl = '',
                firstQuartileUrl = '',
                startUrl = '',
                video = '',
                videoUrl = '',
                videoType = '',
            } = currentSettingDetails;

            return {
                videoSetting: {
                    duration: getFormatNumber(duration),
                    // video_completion_url: completionUrl,
                    // video_error_url: errorUrl,
                    // video_first_quartile_url: firstQuartileUrl,
                    // video_midpoint_url: midpointUrl,
                    // video_skip_url: skipUrl,
                    // video_start_url: startUrl,
                    // video_third_quartile_url: thirdQuartileUrl,
                    videoSource: videoType === 'URL' ? videoUrl : video,
                },
            };
        } else if (currentTypeSetting === 'audioSetting') {
            const { audio } = currentSettingDetails;
            return {
                audioSetting: {
                    audioSource: audio,
                },
            };
        } else if (currentTypeSetting === 'nativeSetting') {
            const { action = '', rating = '', text = '', title = '', nativeResolution = [] } = currentSettingDetails;

            let resolutionPayload = {};
            nativeResolution?.map((resolution) => {
                const typeName = resolution?.id === 1 ? 'icon' : 'image';
                resolutionPayload[`${typeName}${resolution?.imageResolution?.size}`] = resolution?.imageContent?.image;
            });

            return {
                nativeSetting: {
                    action,
                    rating: rating?.value.toString(),
                    text,
                    title,
                    ...resolutionPayload,
                },
            };
        } else if (currentTypeSetting === 'pushnotifSetting') {
            const {
                clickUrl = '',
                description = '',
                targetClick = '',
                targetDailyClick = '',
                title = '',
                trackerUrl = '',
                pushNotifyResolution = [],
                optionalImageResolution = {},
            } = currentSettingDetails;

            let resolutionPayload = {};
            pushNotifyResolution?.map((resolution, index) => {
                const typeName = index === 0 ? 'icon' : 'image';
                resolutionPayload[`${typeName}${resolution?.imageResolution?.size}`] = resolution?.imageContent?.image;
            });
            return {
                pushnotifSetting: {
                    clickUrl,
                    description,
                    title,
                    trackerUrl,
                    ...resolutionPayload,
                },
            };
        } else if (currentTypeSetting === 'htmlSetting') {
            const {
                isResponsive = false,
                isSecure = true,
                isMarid = true,
                thumbnailUrl = '',
                responsiveSize: respSize = [],
                htmlContent = {},
            } = currentSettingDetails;

            const handleResponsiveSize = (currentSize) => {
                if (currentSize?.length && isResponsive) {
                    const getSize = currentSize?.map((item) => {
                        return item.size;
                    });
                    const responsiveSize = {};
                    responsiveSize['responsiveSizes'] = getSize;
                    return responsiveSize;
                } else {
                    return;
                }
            };
            const responsiveSize = handleResponsiveSize(respSize);

            return {
                htmlSetting: {
                    html: htmlContent?.edmContent ?? '',
                    isResponsive: isResponsive.toString(),
                    isSecure: isSecure.toString(),
                    isMraid: isMarid.toString(),
                    thumbnailUrl: thumbnailUrl?.image ?? '',
                    responsiveSizes: responsiveSize ? responsiveSize : undefined,
                },
            };
        } else if (currentTypeSetting === 'metaSetting') {
            const {
                clickURL = '',
                description = '',
                caption = '',
                title = '',
                pixelURL = '',
                metaResolution = [],
            } = currentSettingDetails;

            let resolutionPayload = {};
            metaResolution?.map((resolution, index) => {
                resolutionPayload[`${resolution?.imageResolution?.name}`] =
                    resolution?.imageContent?.image || resolution?.imageContent?.imageUrl;
            });
            return {
                metaSetting: {
                    actionButton: '',
                    caption,
                    clickUrl: clickURL,
                    description,
                    pixelUrl: pixelURL,
                    square: resolutionPayload?.Square ?? undefined,
                    portrait: resolutionPayload?.Portrait ?? undefined,
                    landscape: resolutionPayload?.Landscape ?? undefined,
                    title,
                },
            };
        }
    };

    const settingPayload = handleSettingPayload(formState);
    const handleOptionalSetting = (formState) => {
        const { digipop } = formState;
        if (digipop?.isOptionSetting) {
            return {
                bottom: getFormatNumber(bottom),
                color: color,
                fontSize: getFormatNumber(fontSize) || 0,
                left: getFormatNumber(left),
                right: getFormatNumber(right),
                top: getFormatNumber(top),
            };
        } else {
            return;
        }
    };

    const optionalSettingPayload = handleOptionalSetting(formState);

    const handleId = (currentId, status) => {
        if (status) {
            return {
                currentId,
            };
        } else {
            return;
        }
    };

    let videoBanner = {
        companionBanner: (digipop?.videoSetting?.imageUrl || digipop?.videoSetting?.image) ?? undefined,
        companionHeight: digipop?.videoSetting?.companionHeight,
        companionHtml: digipop?.videoSetting?.htmlContent?.edmContent ?? undefined,
        companionUrl: digipop?.videoSetting?.companionUrl,
        companionWidth: digipop?.videoSetting?.companionWidth,
    };
    return {
        userId,
        clientId,
        departmentId,
        name: name,
        description: description,
        type: type?.type,
        partnerId: partnerId,
        id: handleId(id, isSaveOrUpdate)?.currentId,
        ...(type?.type === 'video' ? videoBanner : {}),
        // attributes: handleAttribute(attribute),
        ...settingPayload,
        optionalSetting: optionalSettingPayload,
    };
};

const handleUploadURL = (value) => {
    const currentType = value?.includes('http') ? URL : 'Upload';
    return currentType;
};

const handleNativeResolution = (otherSizeResolution) => {
    let finalNativeResolution = [];
    Object.entries(otherSizeResolution)?.forEach(([key, value]) => {
        if (value) {
            const splitValues = key.startsWith('icon') ? key.split('icon') : key.split('image');
            const currentSizeValue = splitValues?.length ? splitValues[1] : '';
            const currentType = handleUploadURL(value);
            const findSize = NativeResolution?.find(
                (resolution) => formatName(resolution?.size) === formatName(currentSizeValue),
            );
            const tempNativeValue = {
                imageResolution: findSize,
                imageContent: {
                    imageType: currentType,
                    image: value,
                    imageUrl: currentType === 'URL' ? value : '',
                    fileName: value,
                    isPreviewImageUrl: currentType === 'URL' ? true : false,
                    selectImport: currentType === 'URL' ? true : false,
                },
            };
            finalNativeResolution.push(tempNativeValue);
        }
    });
    return finalNativeResolution;
};

const handleMoveLastToOptionalResolution = (resolutionList, target) => {
    const findMatchItem = resolutionList.find((item) => item?.imageResolution?.size === target);

    const notMatchList = resolutionList.filter(
        (item) => item?.imageResolution?.size !== findMatchItem?.imageResolution?.size,
    );

    if (findMatchItem) notMatchList.push(findMatchItem);

    return notMatchList;
};

const handlePushNotifyResolution = (otherSizeResolution) => {
    let finalPushNotifyResolution = [];
    Object.entries(otherSizeResolution).forEach(([key, value]) => {
        const splitValues = key.startsWith('icon') ? key.split('icon') : key.split('image');
        const currentSizeValue = splitValues?.length ? splitValues[1] : '';
        const currentType = handleUploadURL(value);
        const findSize = PushNotifyResolution?.find(
            (resolution) => formatName(resolution?.size) === formatName(currentSizeValue),
        );
        const isOptionalSize = currentSizeValue ? formatName(currentSizeValue) === '400x250' : false;

        const tempPushNotifyValue = findSize
            ? {
                  imageResolution: findSize,
                  imageContent: {
                      imageType: currentType,
                      image: value,
                      fileName: value,
                      imageUrl: currentType === 'URL' ? value : '',
                  },
              }
            : isOptionalSize && value
            ? {
                  imageResolution: { ...optionalPushNotifyResolution[0] },
                  imageContent: {
                      imageType: value ? currentType : '',
                      image: value || '',
                      fileName: value,
                      imageUrl: value && currentType === 'URL' ? value : '',
                  },
              }
            : {
                  imageResolution: '',
                  imageContent: {
                      imageType: '',
                      image: '',
                  },
              };
        finalPushNotifyResolution.push(tempPushNotifyValue);
    });
    const filterResolution = finalPushNotifyResolution?.filter((resolution) => resolution?.imageResolution);
    const finalResolution = handleMoveLastToOptionalResolution(filterResolution, '400x250', 'size');
    return finalResolution;
};
const handleMetaResolution = (metaData, form) => {
    return form
        .map((item, ind) => {
            let imageKey = item?.name?.toLowerCase();
            if (!metaData[imageKey]) return null;
            return {
                id: ind,
                imageContent: {
                    imageType: handleUploadURL(metaData[imageKey]),
                    image: '',
                    imageUrl: metaData[imageKey] || '',
                    isPreviewImageUrl: true,
                },
                imageResolution: { ...item },
                isRequired: item?.name === 'Square',
                isOptional: item?.name !== 'Square',
            };
        })
        .filter(Boolean);
};

const handleOptionalResolution = (resolution) => {
    const findResolution = resolution?.find(
        (res) => formatName(res?.imageResolution.size) === formatName(optionalPushNotifyResolution[0]?.size),
    );
    return findResolution?.imageResolution;
};

const handleHtmlResponsiveSize = (size = []) => {
    const findSize = size && commonResolution?.filter((resoultion) => size.includes(resoultion?.size));
    return findSize;
};

export const handleSettingEditData = (editData) => {
    const { requestBody } = editData[0];
    const { type } = requestBody;
    if (type === 'image') {
        const {
            action = '',
            image = '',
            imageSize = '',
            text = '',
            title = '',
            deviceType = '',
        } = requestBody?.imageSetting;

        const findDeviceType = digipopDeviceType?.find((device) => device.type === deviceType);
        const findResolutionSize = ImageSettingCommonResolution?.find(
            (resolution) => formatName(resolution?.size) === formatName(imageSize),
        );
        const currentType = handleUploadURL(image);
        return {
            imageSetting: {
                action,
                image: currentType === 'URL' ? '' : image,
                size: findResolutionSize || {},
                text,
                title,
                deviceType: findDeviceType || {},
                imageType: currentType,
                fileName: image,
                imageUrl: currentType === 'URL' ? image : '',
                isPreviewImageUrl: currentType === 'URL' ? true : false,
                selectImport: currentType === 'URL' ? true : false,
            },
        };
    } else if (type === 'video') {
        const {
            duration = '',
            // video_completion_url = '',
            // video_error_url = '',
            // video_first_quartile_url = '',
            // video_midpoint_url = '',
            // video_skip_url = '',
            // video_start_url = '',
            // video_third_quartile_url = '',
            videoSource = '',
        } = requestBody?.videoSetting;
        const currentType = handleUploadURL(videoSource);
        return {
            videoSetting: {
                duration: `${duration}s`,
                // completionUrl: video_completion_url,
                // errorUrl: video_error_url,
                // firstQuartileUrl: video_first_quartile_url,
                // midpointUrl: video_midpoint_url,
                // skipUrl: video_skip_url,
                // startUrl: video_start_url,
                // thirdQuartileUrl: video_third_quartile_url,
                video: videoSource,
                videoUrl: currentType === 'URL' ? videoSource : '',
                videoType: currentType,
                fileName: videoSource,
                selectImport: currentType === 'URL' ? true : false,
                companion: requestBody?.companionHtml?.length ? 'HTML' : 'Banner',
                companionHeight: requestBody?.companionHeight,
                companionWidth: requestBody?.companionWidth,
                htmlContent: {
                    importType: requestBody?.companionHtml?.length ? 'import' : 'url',
                    edmContent: requestBody?.companionHtml,
                },
                imageType: 'url',
                // selectImport: false,
                imageUrl: requestBody?.companionBanner,
                image: requestBody?.companionBanner,
                isPreviewImageUrl: !!requestBody?.companionBanner,
                // imageUrl
                defaulPreview: !!requestBody?.companionBanner,
                companionUrl: requestBody?.companionUrl,
            },
        };
    } else if (type === 'audio') {
        const { audioSource = '' } = requestBody?.audioSetting;
        const currentType = handleUploadURL(audioSource);
        return {
            audioSetting: {
                audio: audioSource,
                audioType: currentType,
                fileName: audioSource,
                audioUrl: currentType === 'URL' ? audioSource : '',
                selectImport: currentType === 'URL' ? true : false,
            },
        };
    } else if (type === 'native') {
        const {
            action = '',
            rating = '',
            text = '',
            title = '',
            duration,
            ...otherSizeResolution
        } = requestBody?.nativeSetting;

        const finalNativeResolution = handleNativeResolution(otherSizeResolution);
        return {
            nativeSetting: {
                action,
                rating: {
                    id: rating,
                    value: rating,
                },
                text,
                title,
                nativeResolution: finalNativeResolution,
            },
        };
    } else if (type === 'pushnotif') {
        const {
            clickUrl = '',
            description = '',
            trackerUrl = '',
            title = '',
            targetClick,
            targetDailyClick,
            text,
            ...otherSizeResolution
        } = requestBody?.pushnotifSetting;

        const finalPushNotifyResolution = handlePushNotifyResolution(otherSizeResolution);
        return {
            pushNotifySetting: {
                clickUrl,
                description,
                text,
                title,
                trackUrl: trackerUrl,
                targetClick,
                targetDailyClick: targetDailyClick,
                pushNotifyResolution: finalPushNotifyResolution,
                optionalImageResolution: handleOptionalResolution(finalPushNotifyResolution),
                // selectImport: currentType === 'URL' ? true : false,
            },
        };
    } else if (type === 'html') {
        const {
            isSecure = false,
            isResponsive = false,
            isMraid = false,
            thumbnailUrl = '',
            responsiveSizes = {},
            html,
        } = requestBody?.htmlSetting;

        const currentType = handleUploadURL(html);

        return {
            htmlSetting: {
                isSecure: JSON.parse(isSecure),
                isResponsive: JSON.parse(isResponsive),
                isMarid: JSON.parse(isMraid),
                thumbnailUrl: {
                    image: currentType === 'URL' ? '' : thumbnailUrl,
                    imageUrl: currentType === 'URL' ? thumbnailUrl : '',
                    isPreviewImageUrl: currentType === 'URL' ? true : false,
                    selectImport: currentType === 'URL' ? true : false,
                    imageType: currentType,
                },
                responsiveSize: handleHtmlResponsiveSize(responsiveSizes?.responsiveSizes),
                htmlContent: {
                    edmContent: html,
                    importType: 'import',
                },
                selectImport: currentType === 'URL' ? true : false,
            },
        };
    } else if (type === 'meta') {
        const {
            caption = '',

            clickUrl = '',
            description = '',
            landscape = '',
            pixelUrl = '',
            portrait = '',
            square = '',
            trackerUrl = '',
            title = '',

            text,
            ...otherSizeResolution
        } = requestBody?.metaSetting;

        const finalMetaResolution = handleMetaResolution(requestBody?.metaSetting, MetaSettingResolution);
        return {
            metaSetting: {
                clickURL: clickUrl,
                description,
                text,
                title,
                caption,
                pixelURL: pixelUrl,
                metaResolution: finalMetaResolution,
                // selectImport: currentType === 'URL' ? true : false,
            },
        };
    }
};

export const handleOptionalSettingEditData = (optionalSetting) => {
    const { bottom = '', color = '', fontSize = '', left = '', right = '', top = '' } = optionalSetting;
    return {
        optionalSetting: {
            bottom: getFormatNumber(bottom),
            color,
            fontSize: getFormatNumber(fontSize),
            left: getFormatNumber(left),
            right: getFormatNumber(right),
            top: getFormatNumber(top),
        },
    };
};

const ALL_TEMPLATES = 'All templates';
const MY_TEMPLATES = 'My templates';
const CREATE_NEW_TEMPLATES = 'Create new templates';

export const adsTabData = (updateUserId, addAccess) => {
    return [
        {
            id: 1,
            text: ALL_TEMPLATES,
            component: () => <AdsListing currentUserId={updateUserId} />,
        },
        {
            id: 2,
            text: MY_TEMPLATES,
            component: () => <AdsListing currentUserId={updateUserId} />,
        },
        {
            id: 3,
            text: CREATE_NEW_TEMPLATES,
            component: () => {
                navigate('create_ads', {
                    state: {
                        currentEditId: null,
                    },
                });
            },
            disable: !addAccess
        },
    ];
};

export const videoSettingDuration = [
    {
        id: 1,
        labelName: '5s',
    },
    {
        id: 2,
        labelName: '15s',
    },
    {
        id: 3,
        labelName: '30s',
    },
    {
        id: 4,
        labelName: '60s',
    },
    {
        id: 5,
        labelName: '120s',
    },
];
