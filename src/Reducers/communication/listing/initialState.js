import { EMPTY_COMMUNICATION_LISTING_DATA } from 'Pages/AuthenticationModule/Communication/CommunicationLists/communicationListingDefaults';
const initialState = {
    data: { ...EMPTY_COMMUNICATION_LISTING_DATA },
    isLoading: true,
    isFailure: false,
    campaignStatus: [],
    isDuplicate: false,
    campaignDetail: {},
    popupContent: []
};

export default initialState;
