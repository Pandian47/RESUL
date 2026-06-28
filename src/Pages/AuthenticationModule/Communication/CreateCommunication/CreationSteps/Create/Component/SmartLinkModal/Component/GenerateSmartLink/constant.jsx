import { cloneElement } from 'react';
import { UpdateState } from 'Utils/modules/misc';
import { circle_plus_fill_medium } from 'Constants/GlobalConstant/Glyphicons';
export const renderItem = (li, callback) => {
    const isExpectedItem = li.props.children[0]?.props?.children === 'Custom tag/parameter';
    return cloneElement(
        li,
        li.props,
        <span
            className="d-flex justify-content-between w-100 px-10"
            onClick={() => {
                if (isExpectedItem) {
                    callback(true);
                }
            }}
        >
            {isExpectedItem ? 'Custom tag/parameter' : li.props.children}
            {/* {isExpectedItem && <i className={`${circle_plus_fill_medium} icon-md color-primary-blue`}></i>} */}
        </span>,
    );
};

export const renderItemAppScreen = (li, callback) => {
    const isExpectedItem = li.props.children[0]?.props?.children === '';
    return cloneElement(
        li,
        li.props,
        <span
            className="d-flex justify-content-between w-100 px-10"
            onClick={() => {
                if (isExpectedItem) callback(true);
            }}
        >
            {isExpectedItem ? 'Enter new app screen' : li.props.children}
        </span>,
    );
};
export const renderItemAppSubScreen = (li, callback) => {
    const isExpectedItem = li.props.children[0]?.props?.children === '';
    return cloneElement(
        li,
        li.props,
        <span
            className="d-flex justify-content-between w-100 px-10"
            onClick={() => {
                if (isExpectedItem) callback(true);
            }}
        >
            {isExpectedItem ? 'Enter new app sub screen' : li.props.children}
        </span>,
    );
};
const copyTextToClipboard = async (text) => {
    if ('clipboard' in navigator) {
        return await navigator.clipboard.writeText(text);
    }
};
export const disableUTMParameters = ({ currentLink, webLink }) => {
    return (currentLink?.mobilePlatform?.toLowerCase()?.includes('android') && webLink?.isAndroid) ||
        (currentLink?.mobilePlatform?.toLowerCase().startsWith('ip') && webLink?.isIOS)
        ? 'click-off'
        : '';
};

export const handleCopyClick = (copyText, copyTextIndex, state, setState) => {
    copyTextToClipboard(copyText)
        .then(() => {
            let temp = { ...state };
            temp.smartLinks[copyTextIndex].isCopied = true;
            UpdateState(setState, 'smartLinks', temp.smartLinks);
            setTimeout(() => {
                temp.smartLinks[copyTextIndex].isCopied = false;
                UpdateState(setState, 'smartLinks', temp.smartLinks);
            }, 1500);
        })
        .catch((err) => {
        });
};

export const TABS_NAME = [
    {
        title: 'Web',
        type: 'WEB',
    },
    // {
    //     title: 'Mobile',
    //     type: 'MOBILE',
    // },
    // {
    //     title: 'Mobile',
    //     type: 'MOBILE',
    // },
    // {
    //     title: 'Mobile',
    //     type: 'MOBILE',
    // },
    // {
    //     title: 'Mobile',
    //     type: 'MOBILE',
    // },
];

export const PARAMETERS = ['EmailID', 'MobileNo', 'Age', 'Age group', 'Gender', 'City', ''];

export const MOBILE_PLATFORM = ['Android phone', 'Android tablet', 'iPhone', 'iPad'];

export const MOBILE_APPS = ['Apple', 'RRTestApps', 'Sgmrun'];

export const APP_SCREEN = ['Analyzer', 'Screen'];

export const getDeviceType = (device) => {
    if (device.startsWith('Android')) {
        return 'Android';
    }
    return 'iOS';
};

// SmartLink duplication methods

export const getBase_url = (arr1) => {
    return arr1.map((e) => e.split('?')[0]);
};
// export const get_dublicate_base = (arr, val) => {
//     return arr.findIndex((e) => e === val);
// };

export const get_dublicate_base = (arr, val) => {
    if (Array.isArray(val) && val.length) {
        return val.some((v) => arr.includes(v));
    } else {
        return false;
    }
};

export const get_key_val = (arr) => {
    return arr.map((e, i) => {
        let get_query_val = e.substring(e.indexOf('?') + 1).split('&');
        let obj = {};
        get_query_val.map((a) => {
            let key = a.substring(0, a.indexOf('='));

            obj[key] = a.substring(a.lastIndexOf('[') + 1, a.indexOf(']'));
        });
        return {
            ...obj,
            base_url: e.split('?')[0],
        };
    });
};

export const get_validate_params = (arr, obj) => {
    let exist_val = false;
    for (let i = 0; i < arr?.length; i++) {
        if (get_key_valid(obj, arr[i])) {
            exist_val = true;
            break;
        } else {
            false;
        }
    }
    return exist_val;
};

export const get_key_valid = (obj1, obj2) => {
    let valid = false;
    if (Object.keys(obj1)?.length !== Object.keys(obj2)?.length) return valid;
    for (let key in obj1) {
        if (obj1[key] === obj2[key]) {
            valid = true;
        } else {
            valid = false;
            break;
        }
    }
    return valid;
};
