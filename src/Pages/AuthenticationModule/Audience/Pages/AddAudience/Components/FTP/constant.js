const INITIAL_STATE = {
    isAdhocModal: false,
    show: false,
    isTLtype: false,
};
const LIST_TYPE = [['Ad-hoc list', 'Target list']];

const getListType = (audRefData) => {
   // 
    if (!audRefData?.length) {
        return [];
    }

    const attrs = audRefData.map((data) => {
        switch (data?.type) {
            case "Adhoc List":
                return 'Ad-hoc list';
            case "Target List":
                return 'Target list';
            default:
                return null;
        }
    })?.filter(Boolean); 

    return attrs;

}

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

const getDisableStatus = (listType) => {
    let isValid = false;
    if (listType?.toLowerCase()?.includes('ad-hoc list')) {
        isValid = true;
    } else if (listType?.toLowerCase()?.includes('target list')) {
        isValid = true;
    }
    return isValid;
};
const getDisableCatStatus = (catType) => {
    let isValid = false;
    if (catType?.toLowerCase()?.includes('parent')) {
        isValid = true;
    } else if (catType?.toLowerCase()?.includes('child')) {
        isValid = true;
    }
    return isValid;
};

export const UPDATED_CYCLE = [
    { type: 'Immediate', typeId: 1 },
    { type: '15 Minutes', typeId: 2 },
    { type: '30 Minutes', typeId: 3 },
    { type: 'Hourly', typeId: 4 },
    { type: 'Daily', typeId: 5 },
];

export const CHECK_UPDATE = [{ type: 'Modified date & time', typeId: 1, value: 'Modified date & time' }];
export { INITIAL_STATE, STATE_REDUCER, getDisableStatus, getDisableCatStatus, getListType };
