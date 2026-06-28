import { Buffer } from 'buffer';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import { BASE64CHECK } from 'Constants/GlobalConstant/Regex';
import CacheManager from 'Utils/cacheManager';

const passphrase = 'resul5.0';
export const iv = '8080808080808080';
let tempIVData = '';

export function convertObjectToBase64(obj) {
    let objJsonStr = JSON.stringify(obj);
    let objJsonB64 = Buffer.from(objJsonStr).toString('base64');
    return objJsonB64;
}
export function converBase64ToText(base64) {
    let base64Text = Buffer.from(base64, 'base64');
    return base64Text.toString();
}
export function isBase64(text) {
    return BASE64CHECK.test(text);
}

export function deCodeId(encodedString) {
    if (encodedString !== undefined) {
        const decodedBuffer = Buffer.from(encodedString, 'base64');
        const decodedString = decodedBuffer.toString('utf-8');
        return decodedString;
    }
}

export function encryptWithAES(text = '', passphrases = passphrase, tempiv = '') {
    if (tempiv === '') {
        tempIVData = iv;
    } else {
        tempIVData = CryptoJS.enc.Utf8.parse(tempiv);
    }
    return CryptoJS.AES.encrypt(text, passphrases, {
        keySize: 128 / 8,
        iv: tempIVData,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    }).toString();
}
export function encodeUrlLegacy(text) {
    return encodeURIComponent(encryptWithAES(JSON.stringify(text).replace(/\+/g, '%2B')));
}
export function encodeUrl(text) {
    try {
        const legacyEncoded = encodeUrlLegacy(text);
        const SAFE_QUERY_LIMIT = 2000;

        if (legacyEncoded.length > SAFE_QUERY_LIMIT) {
            return encodeLargeState(text);
        }
        return legacyEncoded;
    } catch (err) {
        return encodeLargeState(text);
    }
}
export function decodeUrl(encodedText) {
    try {
        const normalizedParam = encodedText.replaceAll(' ', '+');
        const decryptedState = decryptWithAES(decodeURIComponent(normalizedParam));
        return JSON.parse(decryptedState);
    } catch (err) {
        return null;
    }
}

// New helpers to handle large state via sessionStorage while keeping URLs small
export function encodeLargeState(state) {
    try {
        const SESSION_KEY_PREFIX = 'qstate:';
        const generateStateId = () => `qst-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

        const jsonString = JSON.stringify(state);
        const stateId = generateStateId();
        if (typeof window !== 'undefined' && window.sessionStorage) {
            try {
                window.sessionStorage.setItem(`${SESSION_KEY_PREFIX}${stateId}`, jsonString);
                const pointerPayload = { __v: 2, __sid: stateId };
                return encodeURIComponent(encryptWithAES(JSON.stringify(pointerPayload)));
            } catch (e) {
                return encodeUrlLegacy(state);
            }
        }
        return encodeUrlLegacy(state);
    } catch (e) {
        return encodeUrlLegacy(state);
    }
}
export function decodeLargeState(encodedText) {
    try {
        const normalizedParam = encodedText.replaceAll(' ', '+');
        const decrypted = decryptWithAES(decodeURIComponent(normalizedParam));
        const parsed = JSON.parse(decrypted);
        if (parsed && parsed.__v === 2 && parsed.__sid) {
            const SESSION_KEY_PREFIX = 'qstate:';
            if (typeof window !== 'undefined' && window.sessionStorage) {
                const stored = window.sessionStorage.getItem(`${SESSION_KEY_PREFIX}${parsed.__sid}`);
                if (stored) {
                    cleanupOldQueryStates();
                    return JSON.parse(stored);
                }
            }
            return null;
        }
        // If not pointer format, try legacy/current decode
        return JSON.parse(decrypted);
    } catch (e) {
        return null;
    }
}
export function cleanupOldQueryStates() {
    if (typeof window === 'undefined' || !window.sessionStorage) return;

    try {
        const SESSION_KEY_PREFIX = 'qstate:';
        const MAX_AGE_MS = 60 * 60 * 1000; // 1 hour
        const now = Date.now();

        const keysToRemove = [];
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && key.startsWith(SESSION_KEY_PREFIX)) {
                const match = key.match(/qstate:qst-(\d+)-/);
                if (match) {
                    const timestamp = parseInt(match[1], 10);
                    const age = now - timestamp;

                    if (age > MAX_AGE_MS) {
                        keysToRemove.push(key);
                    }
                }
            }
        }

        keysToRemove.forEach((key) => {
            sessionStorage.removeItem(key);
        });
    } catch (err) {
    }
}
export function clearAllQueryStates() {
    if (typeof window === 'undefined' || !window.sessionStorage) return;

    try {
        const SESSION_KEY_PREFIX = 'qstate:';
        const keysToRemove = [];

        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && key.startsWith(SESSION_KEY_PREFIX)) {
                keysToRemove.push(key);
            }
        }

        keysToRemove.forEach((key) => {
            sessionStorage.removeItem(key);
        });

    } catch (err) {
    }
}
export function decryptWithAES(ciphertext = '', secretPhase = passphrase) {
    // console.log('secretPhase: ', secretPhase);
    // iv = CryptoJS.enc.Base64.parse(iv);
    if (!ciphertext) return '';

    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, secretPhase, {
            keySize: 128 / 8,
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        // console.log('originalText: ', originalText);
        return originalText;
    } catch (err) {
        return '';
    }
}

// export const getUserDetails = () => {
//     try {
//         const user = localStorage.getItem('userInfo') || '{}';
//         const decryptUser = decryptWithAES(user) || '{}';
//         // console.log(JSON.parse(decryptUser), 'JSON.parse(decryptUser);');
//         return JSON.parse(decryptUser);
//     } catch (err) {
//         return {};
//     }
// };

export function getUserDetails() {
    if (CacheManager.has('userDetails')) {
        return CacheManager.get('userDetails');
    }

    try {
        const user = localStorage.getItem('userInfo') || '{}';
        const decryptUser = decryptWithAES(user) || '{}';
        const parsedUser = JSON.parse(decryptUser);
        CacheManager.set('userDetails', parsedUser);
        return parsedUser;
    } catch (err) {
        const emptyUser = {};
        CacheManager.set('userDetails', emptyUser);
        return emptyUser;
    }
}

function isGenieEnabledOnDepartment(department) {
    if (department == null || typeof department !== 'object') {
        return false;
    }
    const flag = department.isGenieEnabled;
    return flag === true;
}

/** True when LoginValidate `departmentList` includes at least one BU with Genie explicitly enabled. */
export function hasGenieEnabledDepartment(departmentList) {
    if (!Array.isArray(departmentList) || departmentList.length === 0) {
        return false;
    }
    return departmentList.some((d) => isGenieEnabledOnDepartment(d));
}

/** True only when the currently selected BU has Genie enabled. */
export function isGenieEnabledForSelectedDepartment(departmentList, selectedDepartmentId) {
    if (!Array.isArray(departmentList) || departmentList.length === 0) {
        return false;
    }

    const selectedId = Number(selectedDepartmentId);
    if (!Number.isFinite(selectedId) || selectedId <= 0) {
        return false;
    }

    const selectedDepartment = departmentList.find(
        (department) => Number(department?.departmentId) === selectedId,
    );
    if (!selectedDepartment) {
        return false;
    }
    return isGenieEnabledOnDepartment(selectedDepartment);
}

export function getPermissions() {
    if (CacheManager.has('permissions')) {
        return CacheManager.get('permissions');
    }

    try {
        const permissions = localStorage.getItem('permissions') || '{}';
        const decryptPermission = decryptWithAES(permissions) || '{}';
        const parsedPermissions = JSON.parse(decryptPermission);
        CacheManager.set('permissions', parsedPermissions);
        return parsedPermissions;
    } catch (err) {
        const emptyPermissions = {};
        CacheManager.set('permissions', emptyPermissions);
        return emptyPermissions;
    }
}

// Function to clear cache when needed (like during logout)
export function clearCache(key) {
    CacheManager.clear(key);
}
export function updateUserDetailsPartnerFlag(enabled) {
    try {
        const userDetails = getUserDetails();
        const existingPartnerFlag =
            userDetails?.isPartnerDataEnabled != null &&
            typeof userDetails?.isPartnerDataEnabled === 'object' &&
            !Array.isArray(userDetails?.isPartnerDataEnabled)
                ? userDetails.isPartnerDataEnabled
                : {};
        const latestEnabled = Object.values(enabled || {})[0] === true;
        const updated = {
            ...userDetails,
            isPartnerDataEnabled: {
                ...existingPartnerFlag,
                ...(enabled || {}),
            },
        };
        localStorage.setItem('userInfo', encryptWithAES(JSON.stringify(updated)));
        CacheManager.set('userDetails', updated);
        if (typeof window !== 'undefined' && window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('partnerDataEnabledUpdated', { detail: latestEnabled }));
        }
    } catch (err) {
    }
}
export function updatedPermissionList(permissionList) {
    let temp = {};
    permissionList?.forEach((permission) => {
        if (permission?.featureId == null) return;
        temp[String(permission.featureId)] = permission;
    });
    CacheManager.set('permissions', temp);
    temp = encryptWithAES(JSON.stringify(temp));
    localStorage.setItem('permissions', temp);
}

function makeId(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function encryptCredentials(username, password) {
    const dynamicKey = makeId(16);

    const key = CryptoJS.enc.Utf8.parse(dynamicKey);
    const iv = CryptoJS.enc.Utf8.parse('8080808080808080');

    const encryptedUsername = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(username), key, {
        keySize: 128 / 8,
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    }).toString();

    const encryptedPassword = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(password), key, {
        keySize: 128 / 8,
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    }).toString();

    return {
        key: dynamicKey,
        encryptedUsername,
        encryptedPassword,
    };
}
export async function handlePreviousVersionNavigation() {
    const configMap = {
        //   'liv.resul.io': {
        //     apiUrl: 'https://run.resulticks.com/v48/Home/LoginValidate',
        //     redirectUrl: 'https://run.resulticks.com/v48',
        //   },
        'run19.resulticks.com': {
            apiUrl: 'https://run19.resulticks.com/v48/Home2/LoginValidate',
            redirectUrl: 'https://run19.resulticks.com/v48',
        },
        'run.resulticks.com': {
            apiUrl: 'https://run.resulticks.com/v48/Home2/LoginValidate',
            redirectUrl: 'https://run.resulticks.com/v48',
        },
    };
    const hostname = window.location.hostname;
    const configDetail = configMap?.[hostname] || configMap?.['run.resulticks.com'];
    try {
        const encryptAdUserDetails = localStorage.getItem('adUserDetails') || '{}';
        const decryptAdUserDetails = decryptWithAES(encryptAdUserDetails) || '{}';
        const parsedAdUserDetails = JSON.parse(decryptAdUserDetails);

        if (parsedAdUserDetails?.isAdUser) {
            window.location.href = `${configDetail.redirectUrl}/Home/ChannelAccessADToken?#id_token=${parsedAdUserDetails.token}`;
            return;
        }

        const storedCredentials = localStorage.getItem('sessionCredentials');
        if (!storedCredentials) throw new Error('No credentials found in localStorage.');

        const decrypted = decryptWithAES(storedCredentials);
        if (!decrypted) throw new Error('Failed to decrypt credentials.');

        const credentialsObj = JSON.parse(decrypted);
        if (!credentialsObj?.email || !credentialsObj?.password) {
            throw new Error('Invalid credentials data.');
        }

        const result = encryptCredentials(credentialsObj.email, credentialsObj.password);

        await axios.post(
            configDetail?.apiUrl,
            new URLSearchParams({
                LoginUserName: result.encryptedUsername,
                LoginPassword: result.encryptedPassword,
                RememberMe: credentialsObj?.rememberMe ? JSON.stringify(credentialsObj?.rememberMe) : 'false',
                NoOfAttempts: '1',
                capchastring: '',
                keyvalue: '0',
                hdnDataDownload: '',
                IsAAD: 'true',
                Hashval: result.key,
                isOTP: 'false',
                IsV5Login: 'true',
            }),
            {
                headers: {
                    Accept: '*/*',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                withCredentials: true,
            },
        );

        window.location.href = configDetail?.redirectUrl;
    } catch (error) {
        window.location.href = configDetail?.redirectUrl;
    }
}
