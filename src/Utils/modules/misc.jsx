export function dispatchMultipleAction(action) {
    return (dispatch) => action.forEach((act) => dispatch(act));
}
export function UpdateState(setState, key, value) {
    if (Array.isArray(key) && Array.isArray(value)) {
        setState((prev) => {
            var state = structuredClone(prev);
            key.forEach((item, index) => {
                state = {
                    ...state,
                    [item]: value[index],
                };
            });
            return state;
        });
    } else {
        setState((prev) => {
            return {
                ...prev,
                [key]: value,
            };
        });
    }
}
export function _isObject(objValue) {
    return objValue && typeof objValue === 'object' && objValue.constructor === Object;
}

/** Object.keys for nullable / non-object values — returns [] instead of throwing. */
export const safeObjectKeys = (value) =>
    value != null && typeof value === 'object' ? Object.keys(value) : [];

export function getKeyByValue(object, value) {
    return Object.keys(object).find((key) => object[key] === value);
}

export const versiumConfigData = [
    {
        url: 'http://10.150.0.206/Connector',
        userName: 'Versiumconnect',
        password: 'ImQlfj1BTXxneHpuSnZNbWshRXwqfQ==',
    },
];

export const versiumConfigContactData = [
    'First Name',
    'FirstName',
    'firstname',
    'Last Name',
    'LastName',
    'lastname',
    'EmailID',
    'Email ID',
    'Mobile No',
    'MobileNo',
];
