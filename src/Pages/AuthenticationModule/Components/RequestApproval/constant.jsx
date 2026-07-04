import { cloneElement, isValidElement } from 'react';
import { NEW_EMAIL_REGEX } from 'Constants/GlobalConstant/Regex';
import { map as _map, method as _method } from 'Utils/modules/lodashReplacements';
export const validateTestEmail = (value = '') => {
        let isValid = [false, ''];

    const mutipleEmailCheck = typeof value != 'object' ? value?.includes(',') : false;
    if (mutipleEmailCheck) {
        const splitting = value.split(',');
        const isDuplicate = new Set(_map(splitting, _method('toLowerCase'))).size !== splitting?.length;
        if (splitting?.length > 10) {
            isValid = [true, 'Should not have more than 10 emails'];
        } else if (isDuplicate) {
            isValid = [true, 'Should not contain duplicate values'];
        } else {
            isValid = [!splitting.every((item) => NEW_EMAIL_REGEX.test(item)), 'Enter valid email'];
        }
    } else {
        isValid = [!NEW_EMAIL_REGEX.test(typeof value != 'object' ? value : value.email), 'Enter valid email'];
    }
    return isValid;
};

export const renderItem = (li, callback) => {
    if (!li || !isValidElement(li)) {
        return li ?? null;
    }

    const children = li.props?.children;
    const firstChild = Array.isArray(children) ? children[0] : children;
    const isExpectedItem = firstChild?.props?.children === '';

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
            {li.props.children}
        </span>,
    );
};

export const INITIAL_STATE = {
    disableRequestApproval: true,
    approvalInputEmailList: [],
    currentIndex: 0,
    isApprovalSettingsModal: false,
};
export const COUNTRY_DIALCODE = {
    US: { countryCode: '1', minLength: 10, maxLength: 10 },
    CA: { countryCode: '1', minLength: 10, maxLength: 10 },
    GB: { countryCode: '44', minLength: 10, maxLength: 10 },
    DE: { countryCode: '49', minLength: 7, maxLength: 12 },
    FR: { countryCode: '33', minLength: 9, maxLength: 9 },
    IN: { countryCode: '91', minLength: 10, maxLength: 10 },
    ID: { countryCode: '62', minLength: 10, maxLength: 14 },
    AU: { countryCode: '61', minLength: 9, maxLength: 9 },
    BR: { countryCode: '55', minLength: 10, maxLength: 11 },
    RU: { countryCode: '7', minLength: 10, maxLength: 10 },
    JP: { countryCode: '81', minLength: 9, maxLength: 10 },
    CN: { countryCode: '86', minLength: 11, maxLength: 11 },
    ZA: { countryCode: '27', minLength: 9, maxLength: 10 },
    NG: { countryCode: '234', minLength: 10, maxLength: 10 },
    MX: { countryCode: '52', minLength: 10, maxLength: 10 },
    AR: { countryCode: '54', minLength: 10, maxLength: 11 },
    ES: { countryCode: '34', minLength: 9, maxLength: 9 },
    IT: { countryCode: '39', minLength: 9, maxLength: 10 },
    NL: { countryCode: '31', minLength: 9, maxLength: 10 },
    SE: { countryCode: '46', minLength: 7, maxLength: 12 },
    SA: { countryCode: '966', minLength: 9, maxLength: 9 },
    AE: { countryCode: '971', minLength: 9, maxLength: 9 },
    PK: { countryCode: '92', minLength: 9, maxLength: 10 },
    KR: { countryCode: '82', minLength: 9, maxLength: 11 },
    TR: { countryCode: '90', minLength: 10, maxLength: 10 },
    PL: { countryCode: '48', minLength: 9, maxLength: 9 },
    BE: { countryCode: '32', minLength: 9, maxLength: 9 },
    CH: { countryCode: '41', minLength: 9, maxLength: 9 },
};

export const restFieldList = ['approvalFrom', 'approvalCount', 'followHierarchy'];
