
export const FORM_INITIAL_STATE = {
    defaultValues: {
        adType: '',
        postOn: '',
        adsName: [{ name: '', url: '' }],
    },
    mode: 'onTouched',
};

export const DIGIPOP_INITIAL_STATE = {
    defaultValues: {
        audience: [],
        achievedImpression: '',
        channel: '',
        clickUrl: '',
        defaultClickUrl: '',
        description: '',
        deviceTypeOptions: '',
        startdate: '',
        enddate: '',
        maxImpression: '',
        ott: true,
        remainingImpression: '',
        spentDistribution: 'Uniform',
        supplyTypeOptions: [],
        timing: {
            mon: false,
            tue: false,
            wed: false,
            thu: false,
            fri: false,
            sat: false,
            sun: false,
            weekdayEnabled: false,
            startedTimeAt: '',
            finishedTimeAt: '',
        },
        creatives: [{ type: '', typeVal: '' }],
    },
    mode: 'onTouched',
};
export const RESET_WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri'];
export const RESET_ON_TYPECHANGE = {
    maxImpression: '',
    ott: false,
    timing: {
        mon: true,
        tue: true,
        wed: true,
        thu: true,
        fri: true,
        sat: false,
        sun: false,
        weekdayEnabled: true,
        startedTimeAt: new Date(new Date().setHours(19, 0, 0, 0)),
        finishedTimeAt: new Date(new Date().setHours(23, 0, 0, 0)),
    },
    creatives: [{ type: '', typeVal: '' }],
}
export const digipopTypeSettings = {
    image: 'imageSetting',
    native: 'nativeSetting',
    video: 'videoSetting',
    audio: 'audioSetting',
    html: 'htmlSetting',
    pushnotif: 'pushnotifSetting',
    meta: 'metaSetting'
};
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
        name: 'IPhone',
    },
    {
        id: 2,
        type: 'andriod',
        name: 'Android',
    },
];
export const getPostChannelId = (type) => {
    switch (type) {
        case 'google':
            return 1;
        case 'facebook':
            return 2;
        case 'twitter':
            return 3;
        case 'linkedIn':
            return 4;
        case 'others':
            return 5;
        case 'vue':
            return 6;
        case 'digipop':
            return 9;
    }
};

export const getSocialPostId = (type) => {
    switch (type) {
        case 'facebook':
            return 1;
        case 'twitter':
            return 3;
        case 'linkedIn':
            return 8;
    }
};

export const getSmartPostChannelId = (type) => {
    switch (type) {
        case 'googleAddName0':
            return 15;
        case 'googleAddName1':
            return 16;
        case 'googleAddName2':
            return 17;
        case 'facebookAddName0':
            return 18;
        case 'facebookAddName1':
            return 19;
        case 'facebookAddName2':
            return 20;
        case 'twitterAddName0':
            return 51;
        case 'twitterAddName1':
            return 52;
        case 'twitterAddName2':
            return 53;
        case 'linkedInAddName0':
            return 24;
        case 'linkedInAddName1':
            return 25;
        case 'linkedInAddName2':
            return 26;
        case 'vueAddName0':
            return 35;
        case 'vueAddName1':
            return 36;
        case 'vueAddName2':
            return 37;
    }
};

export const buildDigipopPayload = (formState) => {
    const {
        audience,
        achievedImpression,
        channel,
        clickUrl,
        defaultClickUrl,
        description,
        deviceTypeOptions,
        startdate,
        enddate,
        maxImpression,
        ott,
        remainingImpression,
        spentDistribution,
        supplyTypeOptions,
        timing,
        creatives,
        url,
        channelType
    } = formState || {};
    
    let timingData = {
        finishedTimeAt:
            new Date(timing?.finishedTimeAt).getHours() + ':' + new Date(timing?.finishedTimeAt).getMinutes(),
        startedTimeAt: new Date(timing?.startedTimeAt).getHours() + ':' + new Date(timing?.startedTimeAt).getMinutes(),
        monday: timing?.mon,
        tuesday: timing?.tue,
        wednesday: timing?.wed,
        thursday: timing?.thu,
        friday: timing?.fri,
        saturday: timing?.sat,
        sunday: timing?.sun,
    };

    let creativeData = creatives?.map((item) => item?.typeVal?.creativeId);
    return {
        audiences: audience?.map((item) => item?.audienceID),
        achievedImpression: Number(achievedImpression),
        channel: channel?.type ?? '',
        // clickUrl: clickUrl,
        // defaultClickUrl: defaultClickUrl,
        description: description,
        // deviceTypeOptions: deviceTypeOptions,
        // startDate: getYYMMDD(startdate),
        // endDate: getYYMMDD(enddate),
        maxImpression: Number(maxImpression),
        ott: ott ? 1 : 0,
        remainingImpression: Number(remainingImpression),
        spentDistribution: spentDistribution,
        // supplyTypeOptions: supplyTypeOptions,
        timing: [timingData],
        creatives: creativeData,
        weekdayEnabled: timing?.weekdayEnabled,
        clickUrl: url ?? '',
        subChannelType: channelType?.name || '',
        sourceType: creatives?.map((item) => item?.type?.type)?.toString(),
    };
};

export const digipopChannel = [
    {
        id: 1,
        type: 'programmatic',
        name: 'Programmatic Ads',
    },
    {
        id: 2,
        type: 'metaads',
        name: 'Meta ads',
    },
    // {
    //     id: 3,
    //     type: 'googleaads',
    //     name: 'Google ads',
    // },
];
export const digipopChannelType = [
    {
        id: 1,
        type: 'generic',
        name: 'Generic',
    },
    {
        id: 2,
        type: 'connectedtv',
        name: 'Connected TV',
    },
    {
        id: 3,
        type: 'pushnotif',
        name: 'Push notification',
    },
];
