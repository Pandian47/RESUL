
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

export {  INITIAL_STATE, STATE_REDUCER };
