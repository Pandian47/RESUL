import { iv, encryptWithAES } from 'Utils/modules/crypto';
import { GeneratePasswordpseudorandom } from 'Utils/modules/passwordUtils';
import _get from 'lodash/get';
import CryptoJS from 'crypto-js';
export const INITIAL_STATE = {
    title: '',
    firstName: '',
    lastName: '',
    phoneNo: '',
    emailId: '',
    jobFunction: '',
    password: '',
    welcomeMessage: 'Welcome to RESUL !',
    generatePassword: false,
    otpenableForclient: false,
    adUser: false,
};
let hasValue = GeneratePasswordpseudorandom(16); //GeneratePassword16Char();
let byteHash = CryptoJS.enc.Utf8.parse(hasValue);
let tempiv = iv;
export const buildPayload = (formState) => {
    const {
        title,
        firstName,
        lastName,
        phoneNo,
        emailId,
        jobFunction,
        password,
        welcomeMessage,
        otpenableForclient,
        departmentId,
        userId,
        clientId,
        dialCode,
        adUser,
        mode,
        companies
    } = formState;
    // const inputs = mode !== 'edit' ? { firstName, email: emailId, password, adUser } : {};
    return {
        userId: mode !== 'edit' ? 0 : userId,
        title: 0,
        clientId,
        jobFunctionId: _get(jobFunction, 'jobFunctionID', 0),
        firstName: (firstName || '')?.trim(),
        email: encryptWithAES(CryptoJS.enc.Utf8.parse((emailId || '').trim()), byteHash, tempiv),
        password: mode === 'edit' && !companies ? '' : encryptWithAES(CryptoJS.enc.Utf8.parse(password), byteHash, tempiv), //made it '' on ragav feedback
        adUser,
        lastName: (lastName || '')?.trim(),
        phoneNo: phoneNo?.slice(dialCode?.length),
        countryCodemobile: dialCode?.length && dialCode?.includes('+')
                ? dialCode.split('+')?.[1]
                : dialCode || '',
        welcomeMessage,
        otpenableForclient,
        departmentId,
        createdby: userId,
        hashval: btoa(GeneratePasswordpseudorandom(3) + hasValue + GeneratePasswordpseudorandom(3)),
    };
};
