
const INITIAL_STATE = {
    availableSystems: [],
    renderComponent: '',
};

const STATE_REDUCER = (state, action) => {
    const { payload, type, field } = action;
    switch (type) {
        case 'UPDATE':
            return {
                ...state,
                [field]: payload,
            };
        default:
            return state;
    }
};

const addTabType = (arr, type) => {
    let _arr = arr?.map((e) => ({ ...e, type }));
    return _arr;
};

export {  INITIAL_STATE, STATE_REDUCER };
