export const DOMAIN_HOVER_TEXT =
    'You can register a new domain by choosing  Manage->Settings from the menu or clicking Add';

export const FORM_INITIAL_STATE = {
    defaultValues: {
        analyticsPlatform: '',
        isEdit: false,
        domain: '',
        goalEngagement: '',
        goalConversion: '',
        engagementType: '',
        conversionType: '',
        conversionCategory: '',
        engagementSubscriptionForm: '',
        engagementCategory: '',
        conversionSubscriptionForm: '',
        engagementPages: [{ url: '' }],
        conversionPages: [{ url: '' }],
        engagementUrl: [],
        eventTracking: [{ eventname: '', trackingType: '', inputType: '', description: '' }],
        eventSecGoal: [{ conversionUrl: '', isDelete: false }],
        goalDefaultTab: 0,
        conversionManualType: true,
        conversionCustomValueType: 'manualValue',
        conversionManualValue: '',
    },
    mode: 'onTouched',
};

export const goalContentFields = [
    'ManualValue',
    'ManualType',
    'CustomEvents',
    'CustomValueType',
    'Pricing',
    'Action',
    'Category',
    'SubscriptionForm',
    'Pages',
    'CustomEventsValue'
]


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
    // if (type?.includes(13) || type?.includes(3)) result.push('URL');
    // if (type?.includes(8)) result?.push('Forms');
    // if (type?.includes(6)) result?.push('Conversion');
    // if (!!customRes) result.push('Custom events');
    // return result;

     var customId = ['LP', 'FS', 'CE', 'TP', 'L', 'R'];
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

export const buildPayload = (formState, isEngagement, isConverison, campaignId, userId) => {
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
    } = formState;
    let tempEngagementTypes = goalEngagement
        ? engagementType?.map((item) => ({
              engagementTypeName: item?.FriendlyName,
              engagementTypeId: item?.ConversionTypeID,
              engagementName: item?.ConversionName
          }))
        : [];
    let tempConversionTypes = goalConversion
        ? conversionType?.map((item) => ({
              conversionTypeName: item?.FriendlyName,
              conversionTypeId: item?.ConversionTypeID,
              conversionName: item?.ConversionName
          }))
        : [];
    let urlName = '';
    let tempEngagementData = goalEngagement
        ? getInputType(
              engagementType?.map((item) => {
                  if (item?.ConversionName === 'LP'|| item?.ConversionName === 'L' || item?.ConversionName === 'TP') urlName = item?.FriendlyName;
                  return item?.ConversionName;
              }),
          )?.map((type, idx) => {
              if (type === 'URL') {
                  return {
                      type: urlName,
                      urls:
                          engagementPages
                              ?.map((item) => {
                                  if (!!item?.url) return { pageurl: item?.url, fieldTrackInfo: '' };
                                  return null;
                              })
                              .filter(Boolean) || [],
                  };
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
                      EventName: engagementCustomEvents?.join(','),
                  };
              }
          })
        : [];
      const webFieldLSEventData = localStorage?.__webFieldTrackEventData ? JSON.parse(localStorage?.__webFieldTrackEventData) : {}
    if (
        tempEngagementData?.length &&
        tempEngagementData[0]?.urls?.length &&
        webFieldLSEventData?.engagement
    ) {
        tempEngagementData[0].urls[0].fieldTrackInfo = webFieldLSEventData.engagement;
    }

    let tempConversionData = goalConversion
        ? getInputType(
              conversionType?.map((item) => {
                  if (item?.ConversionName === 'LP'|| item?.ConversionName === 'L' || item?.ConversionName === 'TP') urlName = item?.FriendlyName;
                  return item?.ConversionName;
              }),
          )?.map((type, idx) => {
              if (type === 'URL') {
                  return {
                      type: urlName,
                      urls:
                          conversionPages
                              ?.map((item) => {
                                  if (!!item?.url) return { pageurl: item?.url, fieldTrackInfo: '' };
                                  return null;
                              })
                              .filter(Boolean) || [],
                  };
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

        if (
            tempConversionData?.length &&
            tempConversionData[0]?.urls?.length &&
            webFieldLSEventData?.conversion
        ) {
            tempConversionData[0].urls[0].fieldTrackInfo = webFieldLSEventData.conversion;
        }
    var temp = {
        webanalyticsCampaign: {
            // analytics: {
            //     name: analyticsPlatform?.analyticsDomainName,
            //     id: analyticsPlatform?.analyticsDomainId,
            //     domainName: domain?.value,
            //     domainId: domain?.id,
            // },
            userId,
            domainUrlList: [
                {
                    analyticsSettingsId: domain?.id,
                    domainNameURL: domain?.value,
                },
            ],
            campaignId: campaignId,
            domainType: analyticsPlatform?.domainType,
            channelId: '6',

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
                    // currency: conversionPricing?.currencyFormat + conversionPricing?.currenySymbol,
                    currency: conversionPricing?.currencyID,
                },
            },
        },
    };
    // console.log('Temp payload ::: ', temp);
    return temp;
};

// const WEB_FIELD_TRACK_INITIAL_STATE = {
//     copy: false,
//     webanalyticsCampaign: {
//         domainUrlList: [
//             {
//                 analyticsSettingsId: 2,
//                 domainNameURL: 'https://www.resulticks.com',
//             },
//         ],
//         campaignId: 1337,
//         domainType: 'RA',
//         channelId: '6',
//         engagement: {
//             isPrimary: true,
//             isSecondary: false,
//             engagementTypes: [
//                 {
//                     engagementTypeName: 'formSubmission',
//                     engagementTypeId: '1',
//                 },
//                 {
//                     engagementTypeName: 'add to cart',
//                     engagementTypeId: '2',
//                 },
//                 {
//                     engagementTypeName: 'Landing Page',
//                     engagementTypeId: '3',
//                 },
//             ],
//             data: [
//                 {
//                     type: 'form',
//                     formName: 'RegisterationForm',
//                     subscriptionformId: 31,
//                     actionName: 'submitted',
//                 },
//                 {
//                     type: 'CustomEvent',
//                     EventName: 'Add to cart,asdasd',
//                 },
//                 {
//                     type: 'landingPage',
//                     urls: [
//                         {
//                             pageurl: 'page1',
//                             fieldTrackInfo: {},
//                         },
//                         {
//                             pageurl: 'page2',
//                             fieldTrackInfo: {},
//                         },
//                     ],
//                 },
//             ],
//         },
//         conversion: {
//             isPrimary: true,
//             isSecondary: false,
//             conversionTypes: [
//                 {
//                     conversionTypeName: 'formSubmission',
//                     conversionTypeId: '1',
//                 },
//                 {
//                     conversionTypeName: 'add to cart',
//                     conversionTypeId: '2',
//                 },
//                 {
//                     conversionTypeName: 'Thank you Page',
//                     conversionTypeId: '3',
//                 },
//             ],
//             data: [
//                 {
//                     type: 'form',
//                     formName: 'RegisterationForm',
//                     subscriptionformId: 31,
//                     actionName: 'submitted',
//                 },
//                 {
//                     type: 'CustomEvent',
//                     eventName: 'Add to cart',
//                 },
//                 {
//                     type: 'Thank you Page',
//                     urls: [
//                         {
//                             pageurl: 'page1',
//                             fieldTrackInfo: {},
//                         },
//                         {
//                             pageurl: 'page2',
//                             fieldTrackInfo: {},
//                         },
//                     ],
//                 },
//             ],
//             conversionValue: {
//                 type: 'customevent|manualValue|Form',
//                 attributeName: 'pricing',
//                 manualValue: '10',
//                 currency: 'USD$',
//             },
//         },
//     },
// };

const WEB_FIELD_TRACK_INITIAL_STATE = {
    channelType: 'E',
    appGuid: '',
    deviceOs: '',
    deviceType: 'Web',
    goalType: '',
    linkURL: '',
    formFieldsToCapture: { campaignStartDate: '', campaignEndDate: '', fieldCaptureList: [], minDuration: '' },
    domainName: '',
};
export const buildWebFieldTrackPayload = (userDetails) => {
    return { ...userDetails, ...WEB_FIELD_TRACK_INITIAL_STATE };
};
