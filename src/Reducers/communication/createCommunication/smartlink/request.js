import { GET_MOBILE_APPS, GET_SCREEN_LIST, GET_SMARTLINK_CUSTOM_FIELDS, GET_SMARTURL_DETAIL_BY_CHANNEL, GET_SMART_URL, GET_SUB_SCREEN_LIST, SAVE_SMART_URL, VALIDATE_WEBSITE } from 'Constants/EndPoints';
import _map from 'lodash/map';
import _get from 'lodash/get';
import request from 'Utils/Http';
import _find from 'lodash/find';
import _forEach from 'lodash/forEach';

import {
    showTabsSmartlink,
    updateCustomFields,
    updateEditFlow,
    updateGeneratedLink,
    updateMobileAppId,
    updateMobileApps,
    updateScreenList,
    updateSubScreenList,
    updateSmartLinkFriendlyName,
    updateSmartLinkDetailLoading
} from './reducer';
import { getDeviceType } from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Create/Component/SmartLinkModal/Component/GenerateSmartLink/constant';
import { update_isMobileAppData, update_isMobileAppId } from 'Reducers/globalState/reducer';
import { updateSmartLinkCreated } from '../Create/reducer';
import { getPersonalizationFields } from '../Create/request';

export const validateDomainUrl =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: VALIDATE_WEBSITE,
                payload,
                // loading: true,
            }),
        );

export const getMobileApps =
    ({ payload , loading = false, isDashboard = false}) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_MOBILE_APPS,
                payload,
                loading: loading,
                ok: ({ data }) => {
                    const { data: res, status } = data;
                    const response = status ? res : [];
                    dispatch(updateMobileApps(response));
                    if (isDashboard){
                        const defaultApps = [...(response ?? [])].sort((a, b) => (b?.IsDefault || 0) - (a?.IsDefault || 0)) ?? [];
                        const defaultApp = defaultApps?.[0] ?? {};
                        dispatch(update_isMobileAppData(defaultApps));
                        dispatch(update_isMobileAppId(defaultApp));
                    }
                },
            }),
        );

export const getSmartlinkCustomFields =
    ({ payload }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_SMARTLINK_CUSTOM_FIELDS,
                payload,
                loading: true,
                ok: ({ data }) => {
                    const { data: res, status } = data;
                    const response = status ? res : [];
                    dispatch(updateCustomFields(response));
                },
            }),
        );

export const getScreenList =
    ({ payload, field, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_SCREEN_LIST,
                payload,
                loading,
                ok: ({ data }) => {
                    const { data: res, status } = data;
                    let response = status ? _get(res, 'screenList', []) : [];
                    const appStoreURL = _get(res, 'appStoreURL', '');
                    if (status) {
                        response = _map(response, (screen) => ({
                            ...screen,
                            appStoreURL,
                        }));
                    }
                    if(field){
                    dispatch(
                        updateScreenList({
                            data: response,
                            field,
                        }),
                    );
                }
                },
            }),
        );

export const getSubScreenList =
    ({ payload, field, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_SUB_SCREEN_LIST,
                payload,
                loading,
                ok: ({ data }) => {
                    const { data: res, status } = data;
                    let response = status ? _get(res, 'subScreenList', []) : [];
                    if (status) {
                        // response = _map(response, (screen) => ({
                        //     ...screen,
                        //     deepLinkURL: _get(res, 'deepLinkURL', ''),
                        // }));
                        response = response?.map(screen => screen.subScreenName)
                    }
                    if(field){
                    dispatch(
                        updateSubScreenList({
                            data: response,
                            field,
                        }),
                    );
                }
                },
            }),
        );

export const getSmartUrlDetailByChannel =
    ({ payload, failCheck = true, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: GET_SMARTURL_DETAIL_BY_CHANNEL,
                payload,
                loading,
                isToast: false,
                isFailureCheck: failCheck,
            }),
        );

 

export const getSmartUrl =
    ({ payload, listData = null, screenListObj = null, reduceLoad, loading, iconFieldLoader = false }) =>
    async (dispatch) => {
        const resolvedLoading = loading ?? (reduceLoad ? false : true);
        if (iconFieldLoader) {
            dispatch(updateSmartLinkDetailLoading(true));
        }
        try {
            return await dispatch(
            request.post({
                url: GET_SMART_URL,
                payload,
                loading: resolvedLoading,
                ok: async ({ data }) => {
                    const { data: response, status } = data;
                    if (status) {
                        await dispatch(showTabsSmartlink(true));
                        if (reduceLoad === undefined) {
                            const request = {
                                clientId: payload.clientId,
                                departmentId: payload.departmentId,
                                userId: payload.userId,
                            };
                            let parameterList = [];
                            let mobileAppList = [];
                            if (!!listData && !!Object.keys(listData)?.length) {
                                parameterList = listData?.personalization;
                                mobileAppList = listData?.mobileApps;
                            } else {
                                const prom = [
                                    dispatch(getPersonalizationFields({ payload: request, loading: false })),
                                    // dispatch(getSmartlinkCustomFields({ payload: request })),
                                    dispatch(getMobileApps({ payload: request, loading: false })),
                                ];
                                const [parameters, mobileApp] = await Promise.all(prom);
                                if (parameters?.status) parameterList = parameters.data;
                                if (mobileApp?.status) mobileAppList = mobileApp.data;
                            }
                            let screenList = {},
                                subScreenList = {};
                            async function buildSmartLink(_) {
                                try {
                                    const { smartAppStoreUrl } = _;
                                    const appStoreUrl = JSON.parse(smartAppStoreUrl);
                                    // console.log('App store arr :::: ', appStoreUrl);
                                    return Promise.all(
                                        _map(appStoreUrl, async (appStore, index) => {
                                            const {
                                                UTMParameter,
                                                Alldevice,
                                                Andrioddevice,
                                                Iosdevice,
                                                Parameter,
                                                deferdeeplinking,
                                                PhoneType,
                                                MobileApp,
                                                AppStoreUrl,
                                                Section,
                                                customAppScreen,
                                                AppDpUrl,
                                                smartlinkFriendlyname = '',
                                                AppScreenName = ''
                                            } = appStore;
                                            const appScreenConfig = AppScreenName ? AppScreenName : AppStoreUrl;
                                            if (!!MobileApp) dispatch(updateMobileAppId(MobileApp));
                                            else dispatch(updateMobileAppId(''));

                                            const temp = {};
                                            const utmParameters = UTMParameter.slice(0, 1);
                                            const all = Alldevice.slice(0, 1);
                                            const isAndroid = Andrioddevice.slice(0, 1);
                                            const isIOS = Iosdevice.slice(0, 1);
                                            if (index === 0 || index === 1) {
                                                temp.all = all === 'Y';
                                                temp.isAndroid = isAndroid === 'Y';
                                                temp.isIOS = isIOS === 'Y';
                                            }
                                            if (index === 0) {
                                                temp.type = 'WEB';
                                                temp.utmParameters = utmParameters === 'Y';
                                                temp.domain = _.smartUrl;
                                                temp.adaptiveUrl = _.smartAdaptive;
                                            } else {
                                                // debugger;
                                                const mobileRequest = [];
                                                if (deferdeeplinking === 'Y') {
                                                    if (appScreenConfig && !screenList?.[appScreenConfig]) {
                                                        const payload = {
                                                            ...request,
                                                            mobileAppId: MobileApp,
                                                            mobileplatformId: getDeviceType(PhoneType),
                                                            mobileType: PhoneType,
                                                            isdeferdeeplinkchecked: deferdeeplinking,
                                                            isEmailMobileSelected: 'Y', //-- S
                                                        };
                                                        if (
                                                            false //  Same app guiid updated in screen list reducer - sam 
                                                            // !!screenListObj?.screenList &&
                                                            // !!Object.keys(screenListObj?.screenList)?.length
                                                        ) {
                                                            let getAppStoreUrl = screenListObj?.screenList[
                                                                MobileApp
                                                            ]?.find((e) => e.screenName === AppStoreUrl);
                                                            let newScreeen = {
                                                                status: true,
                                                                data: {
                                                                    screenList: screenListObj?.screenList[MobileApp],
                                                                    appStoreURL: getAppStoreUrl?.activityName || '',
                                                                },
                                                            };
                                                            mobileRequest[0] = newScreeen;
                                                        } else {
                                                            mobileRequest[0] = await dispatch(
                                                                getScreenList({
                                                                    payload,
                                                                    field: `${MobileApp}${PhoneType}`,
                                                                    loading: false,
                                                                }),
                                                            );
                                                        }
                                                    }
                                                    if (Section && !subScreenList?.[Section]) {
                                                        const payload = {
                                                            ...request,
                                                            mobileAppId: MobileApp,
                                                            deviceType: getDeviceType(PhoneType),
                                                            screenName: appScreenConfig,
                                                            mobileType: PhoneType,
                                                        };
                                                        if (
                                                            false
                                                            // !!screenListObj?.subScreenList 
                                                            // !!Object.keys(screenListObj?.subScreenList)?.length
                                                        ) {
                                                            let deepLink = screenListObj?.subScreenList[
                                                                AppStoreUrl
                                                            ]?.find((e) => e.subScreenName === Section);
                                                            let newSubScreeen = {
                                                                status: true,
                                                                data: {
                                                                    subScreenList:
                                                                        screenListObj?.subScreenList[AppStoreUrl],
                                                                    deepLinkURL: deepLink?.deepLinkURL || '',
                                                                },
                                                            };
                                                            mobileRequest[1] = newSubScreeen;
                                                        } else {
                                                            mobileRequest[1] = await dispatch(
                                                                getSubScreenList({
                                                                    payload,
                                                                    field: AppStoreUrl,
                                                                    loading: false,
                                                                }),
                                                            );
                                                        }
                                                    }
                                                }
                                                await Promise.all(mobileRequest).then((response) => {
                                                    // console.log('response: ', response);
                                                    const [screen, subScreen] = response;
                                                    if (screen?.status) {
                                                        let response = _get(screen, 'data.screenList', []);
                                                        const appStoreURL = _get(screen, 'data.appStoreURL', '');
                                                        response = _map(response, (screen) => ({
                                                            ...screen,
                                                            appStoreURL,
                                                        }));
                                                        // console.log('response: ', response);
                                                        // screenList[AppStoreUrl] = response;
                                                        screenList[appScreenConfig] = response?.find(
                                                            (item) => item?.screenName === appScreenConfig,
                                                        );
                                                    }
                                                    if (subScreen?.status) {
                                                        let response = _get(subScreen, 'data.subScreenList', []);
                                                        const deepLinkURL = _get(subScreen, 'data.deepLinkURL', '');
                                                        response = _map(response, (screen) => ({
                                                            ...screen,
                                                            deepLinkURL,
                                                        }));
                                                        // subScreenList[Section] = response;
                                                        subScreenList[Section] = response?.find(
                                                            (item) => item?.subScreenName === Section,
                                                        );
                                                    }
                                                });
                                                // debugger;
                                                temp.isURIParameter = utmParameters === 'Y';
                                                temp.deferredDeepLink = deferdeeplinking === 'Y';
                                                temp.mobilePlatform = PhoneType;
                                                temp.mobileApp = _find(mobileAppList, ['appGuid', MobileApp]);
                                                const currentScreen = _get(screenList, appScreenConfig, []);
                                                //const currentSubScreen = _get(subScreenList, Section, []);
                                                // temp.appScreen = customAppScreen ? AppStoreUrl : currentScreen;
                                                // temp.subappScreen = customAppScreen ? Section : currentSubScreen;
                                                temp.appScreen = currentScreen;
                                                temp.subappScreen =  Section;
                                                temp.appScreenNew = customAppScreen ? appScreenConfig : '';
                                                temp.subappScreenNew = customAppScreen ? Section : '';
                                                temp.customAppScreen = customAppScreen;
                                                temp.appDpURL = AppDpUrl;
                                                // temp.generateFlag = true;
                                                if (index === 1) {
                                                    temp.mobileAppName = _find(mobileAppList, ['appGuid', MobileApp]);
                                                }
                                            }
                                            temp.parameters =
                                                utmParameters === 'Y'
                                                    ? _map(Parameter, (params) => {
                                                          const isCustom = params.perattrtype === 'Custom';
                                                          return {
                                                              tags: isCustom
                                                                  ? ''
                                                                  : _find(parameterList, [
                                                                        'attributeName',
                                                                        params.perattr,
                                                                    ]),
                                                              tagValue: params.pertag,
                                                              isUTMParameterInput: isCustom,
                                                              customValue: params.perattr,
                                                              isOffer: params?.isOffer || false
                                                          };
                                                      })
                                                    : [
                                                          {
                                                              tags: '',
                                                              tagValue: '',
                                                              isUTMParameterInput: false,
                                                              customValue: '',
                                                          },
                                                      ];
                                            temp.isNew = false;
                                            temp.smartlinkFriendlyname = smartlinkFriendlyname;
                                            // console.log(temp, 'TEMP');
                                            return temp;
                                        }),
                                    );
                                } catch (err) {
                                                                    }
                            }
                            async function getData() {
                                const generatedLink = {};
                                const data = await Promise.all(
                                    _map(response, async (smartLink, index) => {
                                        const name = `smartLink${index + 1}`;
                                        const data = await buildSmartLink(smartLink);
                                        generatedLink[name] = `${smartLink.smartHttpPath}${smartLink.smartCode}`;
                                        return data;
                                    }),
                                );
                                return {
                                    edit: data.reduce((acc, current, index) => {
                                        const name = `smartLink${index + 1}`;
                                        acc[name] = current;
                                        return acc;
                                    }, {}),
                                    generatedLink,
                                };
                            }
                            const { generatedLink, edit } = await getData();

                            const friendlyName = {};
                            _forEach(response, ({ smartHttpPath, smartCode }, index) => {
                                const key = `smartLink${index + 1}`;
                                const trimmedFriendly = String(edit[key]?.[0]?.smartlinkFriendlyname ?? '').trim();
                                friendlyName[key] = {
                                    url: `${smartHttpPath}${smartCode}`,
                                    goalNo: index + 1,
                                    ...(trimmedFriendly ? { label: trimmedFriendly } : {}),
                                };
                            });

                            dispatch(
                                updateEditFlow({
                                    edit,
                                    generatedLink,
                                    generateFlag: true,
                                    isAppAnalyticsEventTrack: response?.isAppAnalyticsEventTrack ?? false
                                }),
                            );
                            dispatch(updateSmartLinkFriendlyName(friendlyName));
                        }
                    } else {
                        // await dispatch(showTabsSmartlink(false));

                        // dispatch(
                        //     updateEditFlow({
                        //         edit: {},
                        //         generatedLink: {
                        //             smartLink1: '',
                        //             // smartLink2: '',
                        //         },
                        //     }),
                        // );
                    }
                },
                //isFailureCheck: true
            }),
        );
        } finally {
            if (iconFieldLoader) {
                dispatch(updateSmartLinkDetailLoading(false));
            }
        }
    };

export const saveSmartLink =
    ({ payload, loading = true }) =>
    async (dispatch) =>
        dispatch(
            request.post({
                url: SAVE_SMART_URL,
                payload,
                loading,
                isFailureCheck: true,
                ok: ({ data }) => {
                    const { data: response, status, message = 'No data available'} = data;
                    if (status) {
                        dispatch(showTabsSmartlink(true));
                        // const { smartHttpPath, smartCode, smartCodeB } = response;
                        // const smartLink1 = smartCode ? `${smartHttpPath}${smartCode}` : '';
                        // const smartLink2 = smartCodeB ? `${smartHttpPath}${smartCodeB}` : '';
                        // const links = {
                        //     smartLink1,
                        //     smartLink2,
                        // };
                        dispatch(updateSmartLinkCreated(true));
                        const links = {};
                        const friendlyName = {};
                        _forEach(response?.smartLink, ({ smartHttpPath, goalNo, smartCode }, index) => {
                            const url = `${smartHttpPath}${smartCode}`;
                            links[`smartLink${goalNo}`] = url;
                            const trimmedFriendly = String(payload.smartLink[index]?.smartlinkFriendlyname ?? '').trim();
                            friendlyName[`smartLink${goalNo}`] = {
                                url,
                                goalNo,
                                ...(trimmedFriendly ? { label: trimmedFriendly } : {}),
                            };
                        });
                        dispatch(updateGeneratedLink(links));
                        dispatch(updateSmartLinkFriendlyName(friendlyName));
                    }
                },
            }),
        );
 
