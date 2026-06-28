import _get from 'lodash/get';
import _map from 'lodash/map';
import _filter from 'lodash/filter';
import _forEach from 'lodash/forEach';


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
            perattr: isUTMParameterInput ? customValue : _get(tags, 'attributeName', ''),
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
            MobileApp: _get(mobileApp, 'appGuid', ''),
            AppScreen: _get(appScreen, 'activityName', ''), // _get(appScreen, 'appStoreURL', '')
            AppScreenName: _get(appScreen, 'screenName', ''),
            AppDpUrl: appDpURL || '', //_get(subappScreen, 'deepLinkURL', ''),
            //Store Url
            AppStoreUrl: typeof appScreen === 'string' ? appScreen : _get(appScreen, 'appStoreURL', ''),
            Section: typeof subappScreen === 'string' ? subappScreen : _get(subappScreen, 'subScreenName', ''),
            Parameter: UTMParameter ? _map(parameters, mapParams) : [],
            customAppScreen: !!isappScreenNew,
            smartlinkFriendlyname,
        };
    };

    const buildWebStorePayload = (content, smartlinkFriendlyname = '') => {
        const { parameters, all, isAndroid, isIOS, utmParameters } = content;
        return {
            Parameter: utmParameters ? _map(parameters, mapParams) : [],
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

    const tabList = _filter(tabs, (name) => {
        const isLinkValid = _get(formState[name]?.[0], 'domain', '');
        return isLinkValid;
    });
    return {
        departmentId,
        userId,
        clientId,
        campaignId,
        smartLink: _map(tabList, (tab, index) => {
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
                smartAdaptive: _get(currentTab?.[0], 'adaptiveUrl', ''),
                smartAppStoreUrl: JSON.stringify(
                    _map(currentTab, (link, idx, arr) => mapSmartLink(link, idx, arr, smartlinkFriendlyname)),
                ),
                smartURL: _get(currentTab?.[0], 'domain', ''),
                smartlinkFriendlyname,
            };
        }),
        isAppAnalyticsEventTrack: isEventTrack,
    };
};

export const getExistingLinks = (formState) => {
    const {  tabs } = formState;
    const tabList = _filter(tabs, (name) => {
        const isLinkValid = _get(formState[name]?.[0], 'domain', '');
        return isLinkValid;
    });
    const links = {};
     _forEach(tabList, (tab, index) => {
        const currentTab = formState[tab];
        links[`smartLink${index + 1}`] = {
                goalNo: index + 1,
                smartURL: _get(currentTab?.[0], 'domain', ''),
                isNew: _get(currentTab?.[0], 'isNew', false),
            };
        });
    return links
};
