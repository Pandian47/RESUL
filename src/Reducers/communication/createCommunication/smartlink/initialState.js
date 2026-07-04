const initialState = {
    customFields: [],
    mobileApps: [],
    screenList: {},
    subScreenList: {},
    generatedLink: {
        smartLink1: '',
        smartLink2: '',
        smartLink3: '',
        smartLink4: '',
        smartLink5: '',
    },
    SmartLinks: {},
    editFlow: {},
    generateFlag: false,
    mobileAppId: '',
    tabSmartLink_Flag: null,
    mobileChangeConfirm: {
          isConfirmNotSaved: false, 
          isConfirmSaved: false, 
    },
    eventTrackData: {
        conversionPrimaryGoal: [],
        engagementPrimaryGoal: []
    },
    savedSmartLinkPayload: {},
    isAppEventTrack: false,
    isSmartLinkDetailLoading: false,
    isSmartLinkDetailFetched: false,
    fetchedCampaignId: 0,
};

export default initialState;
