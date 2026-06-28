import GoalDetails from './Component/GoalDetails/GoalDetails';

export const formInitialState = {
    defaultValues: {
        roi: '',
        analyticsPlatform: '',
        conversionForm: '',
        conversionValue: '',
        isEdit: false,
        primaryGoal: [
            {
                mobilePlatform: 'Android phone',
                mobileApp: 'Vision Bank 1',
                isURIParameter: false,
                deferredDeepLink: false,
                appScreen: 'Launch Activity',
                appSubScreen: 'Dashboard fragment',
                events: [],
                eventstemp: [],
                show: false,
                appGuid: '402af9dc-b105-4f2f-96af-3198dbc1dada',
            },
            {
                mobilePlatform: 'Android tab',
                mobileApp: 'Vision Bank 2',
                isURIParameter: false,
                deferredDeepLink: false,
                appScreen: '',
                appSubScreen: '',
                events: [],
                eventstemp: [],
                show: false,
                appGuid: 'f53d7ed1-5fca-49bd-97d1-431fa9b147512',
            },
            {
                mobilePlatform: 'iPad',
                mobileApp: 'Vision Bank 3',
                isURIParameter: false,
                deferredDeepLink: false,
                appScreen: 'Launch activity',
                appSubScreen: '',
                events: [],
                eventstemp: [],
                show: false,
                appGuid: 'f53d7ed1-5fca-49bd-97d1-431fa9b14751',
            },
        ],
        secondaryGoal: [
            {
                mobilePlatform: 'IPhone',
                mobileApp: 'Sample Bank',
                isURIParameter: false,
                deferredDeepLink: false,
                appScreen: 'Launching App',
                appSubScreen: 'Dashboard Fragment',
                events: [],
                eventstemp: [],
                show: false,
                appGuid: '',
            },
        ],
        conversionManualType: true,
        conversionCustomValueType: 'manualValue',
        conversionManualValue: '',
    },
    mode: 'onTouched',
};

export const getInputType = (type) => {
    // let type = val?.map((item) => item?.ConversionTypeID);
    // var customId = [13, 3, 8, 6];
    // let customRes = '';
    // for (let i = 0; i < type?.length; i++) {
    //     if (!customId.includes(type[i])) {
    //         customRes = 'Custom events';
    //     }
    // }

    // // debugger;
    // var result = [];
    // if (type.includes(13) || type.includes(3)) result.push('URL');
    // if (type.includes(8)) result.push('Forms');
    // if (type.includes(6)) result.push('Conversion');
    // if (!!customRes) result.push('Custom events');
    // return result;


    var customId = ['LP', 'FS', 'CE', 'TP'];
    let customRes = '';
    for (let i = 0; i < type?.length; i++) {
        if (!customId.includes(type[i])) {
            customRes = 'Custom events';
        }
    }

    // debugger;
    var result = [];
    if (type?.includes('LP') || type?.includes('TP') ||  type?.includes('L')) result.push('URL');
    if (type?.includes('FS') || type?.includes('R')) result?.push('Forms');
    //if (type?.includes(6)) result?.push('Conversion');
    if(type?.includes('CE')) result.push('Custom events');
    if (!!customRes) result.push('Custom events');
    return result;
};

const buildDeviceList = (urlName, deviceList) => {
    let androidPhone = deviceList?.filter((screen) => screen?.mobilePlatform === 'Android phone');
    let androidTablet = deviceList?.filter((screen) => screen?.mobilePlatform === 'Android tablet');
    let iphone = deviceList?.filter((screen) => screen?.mobilePlatform === 'iPhone');
    let ipad = deviceList?.filter((screen) => screen?.mobilePlatform === 'iPad');

    const buildDeviceList = () => {
        const deviceList = [];
        androidPhone?.forEach((device, deviceIndex) => {
            deviceList.push({
                screenName: device?.appScreen?.length === 0 ? device?.appScreenNew : device?.appScreen?.activityName || '',
                SubcreenName: device?.appSubScreen?.length === 0 ? device?.subappScreenNew : device?.appSubScreen?.subScreenName || '',
                deviceType: 'Android Phone',
                appId:device?.appGuid||'',
                mobileDataJSON: [{
                    MobileplatformType: 'Android phone',
                    AndridSelectscreen: device?.appScreen?.length === 0 ? device?.appScreenNew : device?.appScreen?.activityName || '',
                    AndridSelectsSubcreen: device?.appSubScreen?.length === 0 ? device?.subappScreenNew : device?.appSubScreen?.subScreenName || '',
                    IOSSelectscreen: '',
                    IOSSelectsSubcreen: '',
                }],
                eventGoalData: device?.events || [],
            });
        });
        iphone?.forEach((device, deviceIndex) => {
            deviceList.push({
                screenName: device?.appScreen?.length === 0 ? device?.appScreenNew : device?.appScreen?.activityName || '',
                SubcreenName: device?.appSubScreen?.length === 0 ? device?.subappScreenNew : device?.appSubScreen?.subScreenName || '',
                deviceType: 'iPhone',
                 appId:device?.appGuid||'',
                mobileDataJSON: [{
                    MobileplatformType: 'iPhone',
                    AndridSelectscreen: device?.appScreen?.length === 0 ? device?.appScreenNew : device?.appScreen?.activityName || '',
                    AndridSelectsSubcreen: device?.appSubScreen?.length === 0 ? device?.subappScreenNew : device?.appSubScreen?.subScreenName || '',
                    IOSSelectscreen: '',
                    IOSSelectsSubcreen: '',
                }],
                eventGoalData: device?.events || [],
            });
        });
        ipad?.forEach((device, deviceIndex) => {
            deviceList.push({
                screenName: device?.appScreen?.length === 0 ? device?.appScreenNew : device?.appScreen?.activityName || '',
                SubcreenName: device?.appSubScreen?.length === 0 ? device?.subappScreenNew : device?.appSubScreen?.subScreenName || '',
                deviceType: 'iPad',
                 appId:device?.appGuid||'',
                mobileDataJSON: [{
                    MobileplatformType: 'iPad',
                    AndridSelectscreen: device?.appScreen?.length === 0 ? device?.appScreenNew : device?.appScreen?.activityName || '',
                    AndridSelectsSubcreen: device?.appSubScreen?.length === 0 ? device?.subappScreenNew : device?.appSubScreen?.subScreenName || '',
                    IOSSelectscreen: '',
                    IOSSelectsSubcreen: '',
                }],
                eventGoalData: device?.events || [],
            });
        });
        androidTablet?.forEach((device, deviceIndex) => {
            deviceList.push({
                screenName: device?.appScreen?.length === 0 ? device?.appScreenNew : device?.appScreen?.activityName || '',
                SubcreenName: device?.appSubScreen?.length === 0 ? device?.subappScreenNew : device?.appSubScreen?.subScreenName || '',
                deviceType: 'Android tablet',
                appId:device?.appGuid||'',
                mobileDataJSON: [{
                    MobileplatformType: 'Android tablet',
                    AndridSelectscreen: device?.appScreen?.length === 0 ? device?.appScreenNew : device?.appScreen?.activityName || '',
                    AndridSelectsSubcreen: device?.appSubScreen?.length === 0 ? device?.subappScreenNew : device?.appSubScreen?.subScreenName || '',
                    IOSSelectscreen: '',
                    IOSSelectsSubcreen: '',
                }],
                eventGoalData: device?.events || [],
            });
        });

        return deviceList;
    };

    return {
        type: urlName,
        deviceList: buildDeviceList(),
    };
};

export const buildPayload = (formState, isEngagement, isConverison, campaignId) => {
    const {
        analyticsPlatform,
        conversionCustomEvents,
        conversionPages,
        engagementPages,
        conversionType,
        engagementType,
        conversionSubscriptionForm,
        engagementSubscriptionForm,
        domain,
        engagementAction,
        conversionAction,
        engagementCustomEvents,
        conversionManualType,
        conversionManualValue,
        conversionPricing,
        conversionCustomEventsValue,
        goalConversion,
        goalEngagement,
        conversionCustomValueType,
        engagementPrimaryGoal,
        conversionPrimaryGoal,
    } = formState;
    let tempEngagementTypes = goalEngagement
        ? engagementType?.map((item) => ({
              engagementTypeName: item?.FriendlyName,
              engagementTypeId: item?.ConversionTypeID,
          }))
        : [];
    let tempConversionTypes = goalConversion
        ? conversionType?.map((item) => ({
              conversionTypeName: item?.FriendlyName,
              conversionTypeId: item?.ConversionTypeID,
          }))
        : [];
    let urlName = '';
    let tempEngagementData = goalEngagement
        ? getInputType(
              engagementType?.map((item) => {
                  if (item?.ConversionName === 'LP'|| item?.ConversionName === 'TP') urlName = item?.FriendlyName;
                  return item?.ConversionName;
              }),
          )?.map((type, idx) => {
              if (type === 'URL') {
                  // let androidPhone = engagementPrimaryGoal?.filter((screen) => screen?.mobilePlatform === 'Android phone');
                  // let androidTablet = engagementPrimaryGoal?.filter((screen) => screen?.mobilePlatform === 'Android tablet');
                  // let iphone = engagementPrimaryGoal?.filter((screen) => screen?.mobilePlatform === 'iPhone');
                  // let ipad = engagementPrimaryGoal?.filter((screen) => screen?.mobilePlatform === 'iPad');

                  //   return {
                  //       type: urlName,
                  //       deviceList: [
                  //           {
                  //               screenName: androidPhone?.length !==0 ? androidPhone?.[0]?.appScreen?.screenName : '',
                  //               SubcreenName: androidPhone?.length !==0 ? androidPhone?.[0]?.appSubScreen?.subScreenName : '',
                  //               deviceType: 'Android Phone',
                  //               appId: '',
                  //               mobileDataJSON: androidPhone?.length !==0 ? [
                  //                   {
                  //                       MobileplatformType: 'Android phone',
                  //                       AndridSelectscreen:  androidPhone?.length !==0 ? androidPhone?.[0]?.appScreen?.activityName : '',
                  //                       AndridSelectsSubcreen: androidPhone?.length !==0 ? androidPhone?.[0]?.appSubScreen?.subScreenName : '',
                  //                       IOSSelectscreen: '',
                  //                       IOSSelectsSubcreen: '',
                  //                   },
                  //               ] :[],
                  //               eventGoalData: [],
                  //           },
                  //           {
                  //             screenName: iphone?.length !==0 ? iphone?.[0]?.appScreen?.screenName : '',
                  //             SubcreenName: iphone?.length !==0 ? iphone?.[0]?.appSubScreen?.subScreenName : '',
                  //             deviceType: 'iPhone',
                  //             appId: '',
                  //             mobileDataJSON: iphone?.length !== 0 ?  [
                  //                 {
                  //                     MobileplatformType: 'iPhone',
                  //                     AndridSelectscreen:  iphone?.length !==0 ? iphone?.[0]?.appScreen?.activityName : '',
                  //                     AndridSelectsSubcreen: iphone?.length !==0 ? iphone?.[0]?.appSubScreen?.subScreenName : '',
                  //                     IOSSelectscreen: '',
                  //                     IOSSelectsSubcreen: '',
                  //                 },
                  //             ] : [],
                  //             eventGoalData: [],
                  //         },
                  //         {
                  //             screenName: ipad?.length !==0 ? ipad?.[0]?.appScreen?.screenName : '',
                  //             SubcreenName: ipad?.length !==0 ? ipad?.[0]?.appSubScreen?.subScreenName : '',
                  //             deviceType: 'iPad',
                  //             appId: '',
                  //             mobileDataJSON: ipad?.length !== 0 ?  [
                  //                 {
                  //                     MobileplatformType: 'iPad',
                  //                     AndridSelectscreen:  ipad?.length !==0 ? ipad?.[0]?.appScreen?.activityName : '',
                  //                     AndridSelectsSubcreen: ipad?.length !==0 ? ipad?.[0]?.appSubScreen?.subScreenName : '',
                  //                     IOSSelectscreen: '',
                  //                     IOSSelectsSubcreen: '',
                  //                 },
                  //             ] : [],
                  //             eventGoalData: [],
                  //         },
                  //         {
                  //             screenName: androidTablet?.length !==0 ? androidTablet?.[0]?.appScreen?.screenName : '',
                  //             SubcreenName: androidTablet?.length !==0 ? androidTablet?.[0]?.appSubScreen?.subScreenName : '',
                  //             deviceType: 'Android tablet',
                  //             appId: '',
                  //             mobileDataJSON: androidTablet?.length !==0 ? [
                  //                 {
                  //                     MobileplatformType: 'Android tablet',
                  //                     AndridSelectscreen:  androidTablet?.length !==0 ? androidTablet?.[0]?.appScreen?.activityName : '',
                  //                     AndridSelectsSubcreen: androidTablet?.length !==0 ? androidTablet?.[0]?.appSubScreen?.subScreenName : '',
                  //                     IOSSelectscreen: '',
                  //                     IOSSelectsSubcreen: '',
                  //                 },
                  //             ] :[],
                  //             eventGoalData: [],
                  //         },
                  //       ],
                  //   };
                  let tempDeviceList = buildDeviceList(urlName, engagementPrimaryGoal);
                  return tempDeviceList;
              } else if (type === 'Forms') {
                  return {
                      type: 'form',
                      formName: engagementSubscriptionForm?.formName,
                      formId: engagementSubscriptionForm?.formId,
                      actionName: engagementAction,
                  };
              } else {
                  return {
                      type: 'CustomEvent',
                      eventName: engagementCustomEvents?.join(','),
                  };
              }
          })
        : [];

    let tempConversionData = goalConversion
        ? getInputType(
              conversionType?.map((item) => {
                  if (item?.ConversionName === 'LP'|| item?.ConversionName === 'TP') urlName = item?.FriendlyName;
                  return item?.ConversionName;
              }),
          )?.map((type, idx) => {
              if (type === 'URL') {
                  let tempDeviceList = buildDeviceList(urlName, conversionPrimaryGoal);
                  return tempDeviceList;
              } else if (type === 'Forms') {
                  return {
                      type: 'form',
                      formName: conversionSubscriptionForm?.formName,
                      formId: conversionSubscriptionForm?.formId,
                      actionName: conversionAction,
                  };
              } else {
                  return {
                      type: 'CustomEvent',
                      EventName: conversionCustomEvents?.join(','),
                  };
              }
          })
        : [];
    var temp = {
        // userId: userId,
        // departmentId: departmentId,
        // clientId: clientId,
        // copy: false,
        appanalyticsCampaign: {
            // analytics: {
            //     name: analyticsPlatform?.analyticsDomainName,
            //     id: analyticsPlatform?.analyticsDomainId,
            //     domainName: domain?.value,
            //     domainId: domain?.id,
            // },
            // domainUrlList: [
            //     {
            //         analyticsSettingsId: domain?.id,
            //         domainNameURL: domain?.value,
            //     },
            // ],
            campaignId: campaignId,
            analyticsType: analyticsPlatform?.domainType,
            channelId: '16',
            // goalType: 'P',
            engagement: {
                isPrimary: isEngagement,
                isSecondary: false,

                engagementTypes: goalEngagement ? tempEngagementTypes : [],
                data: goalEngagement ? tempEngagementData : [],
            },
            conversion: {
                isPrimary: isConverison,
                isSecondary: false,

                conversionTypes: goalConversion ? tempConversionTypes : [],
                data: goalConversion ? tempConversionData : [],
                conversionValue: {
                    type: conversionCustomValueType,
                    attributeName: conversionCustomEventsValue,
                    manualValue: conversionManualType ? conversionManualValue : '',
                    currency: conversionPricing?.currencyID
                },
            },
        },
    };
    // console.log('Temp payload ::: ', temp);
    return temp;
};

export const secGoal = [
    {
        id: 'secondaryGoal',
        text: 'Secondary Goal',
        component: () => <GoalDetails fieldName="secondaryGoal" key="secondaryGoal" />,
    },
];
export const appGoalList = [
    {
        id: 'primaryGoal',
        text: 'Primary Goal',
        component: () => <GoalDetails fieldName="primaryGoal" key="primaryGoal" />,
    },
];
