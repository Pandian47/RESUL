/** Routes where Smart Link is view-only (Execute ROI + pre-campaign summary). */
export const SMART_LINK_VIEW_ONLY_PATHS = ['/communication/execute'];

export const isSmartLinkViewOnly = (pathname = '') => SMART_LINK_VIEW_ONLY_PATHS.includes(pathname);

const createSmartLinkEntry = () => ([
    {
        type: 'WEB',
        domain: '',
        adaptiveUrl: '',
        utmParameters: false,
        all: false,
        isAndroid: false,
        isIOS: false,
        customAppScreen: false,
        parameters: [
            {
                tags: '',
                tagValue: '',
                isUTMParameterInput: false,
                customValue: '',
            },
        ],
        isNew: true
    },
]);

const generateSmartLinkDefaults = (count = 19) => {
    const smartLinks = {};
    for (let i = 1; i <= count; i++) {
        smartLinks[`smartLink${i}`] = createSmartLinkEntry();
    }
    return smartLinks;
};


export const FORM_INITIAL_STATE = {
    defaultValues: {
        count: 0,
        ...generateSmartLinkDefaults(19),
        saveFlag: false,
        generateFlag: false,
    },
    mode: 'onChange',
};
export const buildSmartLinkPayload = (formState, isEventTrack = false) => {
    const { departmentId, userId, clientId, campaignId, tabs, allTabs = [] } = formState;

    function mapParams({ tags, tagValue, isUTMParameterInput, customValue, isOffer = false }) {
        return {
            perattr: isUTMParameterInput ? customValue : (tags?.attributeName ?? ''),
            perattrtype: isUTMParameterInput ? 'Custom' : 'UTM',
            pertag: tagValue,
            isOffer: isOffer
        };
    }

    const buildAppStorePayload = (content, web, params, smartlinkFriendlyname = '') => {
        const {
            deferredDeepLink,
            parameters,
            mobileApp,
            appScreen,
            subappScreen,
            mobilePlatform,
            isURIParameter,
            isappScreenNew,
            appDpURL,
        } = content;
        const { all, isAndroid, isIOS } = params;
        const { all: webAll, isAndroid: webAndroid, isIOS: webIos, utmParameters: webUtm } = web;
        const Alldevice = `${all ? 'Y' : 'N'}|${webAll ? 'D' : 'N'}`;
        const Andrioddevice = `${isAndroid ? 'Y' : 'N'}|${webAndroid ? 'D' : 'N'}`;
        const Iosdevice = `${isIOS ? 'Y' : 'N'}|${webIos ? 'D' : 'N'}`;
        const UTMParameter = `${isURIParameter ? 'Y' : 'N'}|${webUtm ? 'D' : 'N'}`;
        let appScreenObj = {
            activityName: 0,
            screenName: '',
        };
        return {
            Alldevice,
            UTMParameter,
            Andrioddevice,
            Iosdevice,
            deferdeeplinking: deferredDeepLink ? 'Y' : 'N',
            PhoneType: mobilePlatform,
            MobileApp: mobileApp?.appGuid ?? '',
            AppScreen: appScreen?.activityName ?? '', // appScreen?.appStoreURL ?? ''
            AppScreenName: appScreen?.screenName ?? '',
            AppDpUrl: appDpURL || '', //subappScreen?.deepLinkURL ?? '',
            //Store Url
            AppStoreUrl: typeof appScreen === 'string' ? appScreen : (appScreen?.appStoreURL ?? ''),
            Section: typeof subappScreen === 'string' ? subappScreen : (subappScreen?.subScreenName ?? ''),
            Parameter: UTMParameter ? (parameters || []).map(mapParams) : [],
            customAppScreen: !!isappScreenNew,
            smartlinkFriendlyname,
        };
    };

    const buildWebStorePayload = (content, smartlinkFriendlyname = '') => {
        const { parameters, all, isAndroid, isIOS, utmParameters } = content;
        return {
            Parameter: utmParameters ? (parameters || []).map(mapParams) : [],
            UTMParameter: utmParameters ? 'Y' : 'N' + '|N',
            Alldevice: all ? 'Y' : 'N' + '|N',
            Andrioddevice: isAndroid ? 'Y' : 'N' + '|N',
            Iosdevice: isIOS ? 'Y' : 'N' + '|N',
            smartlinkFriendlyname
        };
    };

    const mapSmartLink = (link, index, smartlink, smartlinkFriendlyname = '') => {
        const platformParams = smartlink?.[1] || {};
        if (index === 0) return buildWebStorePayload(link, smartlinkFriendlyname);
        return buildAppStorePayload(link, smartlink[0], platformParams, smartlinkFriendlyname);
    };

    const tabList = (tabs || []).filter((name) => {
        const isLinkValid = formState[name]?.[0]?.domain ?? '';
        return isLinkValid;
    });
    return {
        departmentId,
        userId,
        clientId,
        campaignId,
        smartLink: tabList.map((tab, index) => {
            const currentTab = formState[tab];
            const tabMeta = Array.isArray(allTabs) ? allTabs.find((t) => t?.id === tab) : null;
            const fromTabMeta =
                tabMeta?.friendlyName != null && String(tabMeta.friendlyName).trim() !== ''
                    ? String(tabMeta.friendlyName).trim()
                    : tabMeta?.text != null && String(tabMeta.text).trim() !== ''
                        ? String(tabMeta.text).trim()
                        : '';
            const fromFormField = String(formState[`${tab}_friendlyName`] ?? '').trim();
            const smartlinkFriendlyname = fromTabMeta || fromFormField;
            return {
                goalNo: index + 1,
                smartAdaptive: currentTab?.[0]?.adaptiveUrl ?? '',
                smartAppStoreUrl: JSON.stringify(
                    (currentTab || []).map((link, idx, arr) => mapSmartLink(link, idx, arr, smartlinkFriendlyname)),
                ),
                smartURL: currentTab?.[0]?.domain ?? '',
                smartlinkFriendlyname,
            };
        }),
        isAppAnalyticsEventTrack: isEventTrack,
    };
};

export const getExistingLinks = (formState) => {
    const {  tabs } = formState;
    const tabList = (tabs || []).filter((name) => {
        const isLinkValid = formState[name]?.[0]?.domain ?? '';
        return isLinkValid;
    });
    const links = {};
    tabList.forEach((tab, index) => {
        const currentTab = formState[tab];
        links[`smartLink${index + 1}`] = {
                goalNo: index + 1,
                smartURL: currentTab?.[0]?.domain ?? '',
                isNew: currentTab?.[0]?.isNew ?? false,
            };
        });
    return links
};
