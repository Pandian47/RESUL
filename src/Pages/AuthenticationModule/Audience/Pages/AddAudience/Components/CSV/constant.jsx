import { getEnvironment } from 'Utils/modules/environment';
const LIST_TYPE = ['Ad-hoc list', 'Seed list', 'Target list', 'Match input list', 'Suppression input list'];
const getListType = (audRefData) => {
    //
    if (!audRefData?.length) {
        return [];
    }

    const attrs = audRefData
        .map((data) => {
            switch (data?.type) {
                case 'Adhoc List':
                    return 'Ad-hoc list';
                case 'Seed List':
                    return 'Seed list';
                case 'Target List':
                    return 'Target list';
                case "Match Input List":
                    return 'Match input list';
                case "Suppression Input List":
                    return 'Suppression input list';
                default:
                    return null;
            }
        })
        ?.filter(Boolean);
    const excluded = ['Match input list', 'Suppression input list'];
    const finalAttrList = attrs?.filter(att => !excluded.includes(att))
    return getEnvironment() === 'TEAM'
        ? finalAttrList
        : attrs;
};
const INITIAL_STATE = {
    isAdhocModal: false,
    isMatchListModal: false,
    isSuppressionListModal: false,
    audienceLists: [],
};

const STATE_REDUCER = (state, action) => {
    const { payload, type } = action;
    switch (type) {
        case 'UPDATE':
            return {
                ...state,
                [action.field]: payload,
            };
        default:
            return state;
    }
};

const errorMessages = [
    'Kindly provide valid headers',
    'No data found in the CSV file',
    'Header row is mismatch',
    'Invalid list type',
    'EmailID is duplicated',
    'EmailID & MobileNo are duplicated',
    'MobileNo is duplicated',
    'Rows are not valid',
    'Uploaded file contains invalid encoding or corrupted data'
];

const getErrorMessage = (msg) => {
    if (errorMessages.includes(msg)) return msg;
    return 'No data found in the CSV file';
};

export const modalType = (state) => {
    let finalValue;
    let listType = '';
    switch (state.type) {
        case 'adhoc-list':
            finalValue = 'ad-hoc list';
            listType = 'Ad-hoc list';
            break;
        case 'seed-list':
            finalValue = 'seed list';
            listType = 'Seed list';
            break;
        case 'match-list':
            finalValue = 'match list';
            listType = 'Match input list';
            break;
        case 'suppression-list':
            finalValue = 'suppression list';
            listType = 'Suppression input list';
            break;
        default:
            listType = '';
            finalValue = '';
    }
    return {
        listType,
        finalValue,
    };
};

const limitConfigBUWiseList = (type) => {
    let maxConfig = { 3: 100 };
    return maxConfig[type] || 0;
};

export { LIST_TYPE, STATE_REDUCER, INITIAL_STATE, getErrorMessage, getListType, limitConfigBUWiseList };
