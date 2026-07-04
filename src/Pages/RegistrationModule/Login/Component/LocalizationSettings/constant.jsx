import { getUserDetails, encryptWithAES, decryptWithAES, iv } from 'Utils/modules/crypto';
import { GeneratePasswordpseudorandom } from 'Utils/modules/passwordUtils';
import { get as _get, map as _map } from 'Utils/modules/lodashReplacements';
import CryptoJS from 'crypto-js';
let hasValue = GeneratePasswordpseudorandom(16); //GeneratePassword16Char();
let byteHash = CryptoJS.enc.Utf8.parse(hasValue);
let tempiv = iv;

const resolveParentClientIdFromKeyContact = (parentClientId, clientId) => {
    const parentId = Number(parentClientId) || 0;
    const contactClientId = Number(clientId) || 0;
    return parentId > 0 ? parentId : contactClientId;
};

export const buildPayload = (payload, type,selectedState) => {
    // console.log('payload: ', payload);
    const countryCodeMobile = _get(payload, 'countryDetails.dialCode', '');
    const contactInfo = {
        title: _get(payload, 'title.titleDataid', 0),
        firstName: _get(payload, 'firstname', ''),
        middleName: _get(payload, 'middlename', ''),
        lastName: _get(payload, 'lastname', ''),
        // password: _get(payload, 'password', ''),
        password: encryptWithAES(CryptoJS.enc.Utf8.parse(_get(payload, 'password', '')), byteHash, tempiv),
        emailIddecryption: decryptWithAES(
            encryptWithAES(CryptoJS.enc.Utf8.parse(_get(payload, 'emailId', '')), byteHash, tempiv),
            hasValue,
        ),
        emailId: encryptWithAES(CryptoJS.enc.Utf8.parse(_get(payload, 'emailId', '')), byteHash, tempiv),
        countryCodeMobile,
        phoneNo: _get(payload, 'phoneNo', '').slice(countryCodeMobile?.length),
        otpValue: _get(payload, 'otp', ''),
        jobFunctionID: _get(payload, 'jobFunction.jobFunctionID', ''),
        jobFunctionValue: _get(payload, 'jobFunction.jobFunctionName', ''),
        profilePath: _get(payload, 'profile', ''),
    };
    const localizationSettings = {
        timeZoneId: _get(payload, 'timezone.timeZoneID', 0),
        timeFormatId: _get(payload, 'timeFormat.timeFormatID', 0),
        dateFormatId: _get(payload, 'dateFormat.dateFormatID', 4),
        currencyId: _get(payload, 'currency.currencyID', 0),
        languageId: _get(payload, 'langauge.languageID', 0),
        isDayLight: _get(payload, 'timezone.isDayLight', false),
    };
    switch (type) {
        case 'agency': {
            return {
                isCpPortal: localStorage.getItem('cpCode')?.length > 0,
                cpCode: localStorage.getItem('cpCode'),
                promoCode: localStorage.getItem('promoCode'),
                hashval: btoa(GeneratePasswordpseudorandom(3) + hasValue + GeneratePasswordpseudorandom(3)),
                isAgency: true,
                agencyId: 0,
                parentClientId: 0,
                // gid: _get(payload, 'apiClientId', 0) > 0 ? _get(payload, 'apiClientId', 0) : (getUserDetails()?.clientId || 0),
                isChildAccount: false,
                userId: 0,
                lmaId: 0,
                isPayment: false,
                isActive: false,
                ContactInfo: [{ ...contactInfo }],
                GlobalSetting: [{ ...localizationSettings }],
                CompanyDetail: [
                    {
                        companyName: _get(payload, 'agencyName', ''),
                        website: _get(payload, 'agencyWebsite', ''),
                        address: _get(payload, 'agencyAddress', ''),
                        city: _get(payload, 'agencyCity', ''),
                        state: selectedState?.state|| _get(payload, 'state.state' , ''),
                        zipCode: _get(payload, 'agencyZipcode', ''),
                        companyLogo: _get(payload, 'agencyPhoto'),
                        countryId: _get(payload, 'countryLocation.countryID', ''),
                        regionId: 0,
                        regionName: '',
                        parentCompanyName: _get(payload, 'agencyGroup', ''),
                        licenseTypeId: 0,
                        clientBranchTypeId: 0,
                        brandPositionId: 0,
                        industryId: 0,
                        businessTypeId: 0,
                        accountTypeId: 0,
                        isHybrid: false,
                        regionStructure: '',
                        reportDirectUrl: '',
                        reportTitle: '',
                    },
                ],
            };
        }
        case 'brand': {
            //let isAgencyBrands = _get(payload, 'isAgencyBrand', false);
            const currentRegionID = _get(payload, 'brandRegion.regionID', 0);
            let finalRegionId;
            if (currentRegionID.toString()?.length > 3) {
                finalRegionId = 0;
            } else {
                finalRegionId = currentRegionID;
            }

            const isNotify = payload.isNotify === true;
            const keyContactParentClientId = _get(payload, 'parentClientId', 0);
            const keyContactClientId = _get(payload, 'apiClientId', 0);

            const finalParentClientId = isNotify
                ? resolveParentClientIdFromKeyContact(keyContactParentClientId, keyContactClientId)
                : _get(payload, 'parentClientId', 0) ||
                  _get(payload, 'companiesList.clientId', 0) ||
                  _get(payload, 'agencyId', 0) ||
                  0;

            const apiClientId = _get(payload, 'apiClientId', 0);
            const globalClientId = _get(payload, 'clientId', getUserDetails()?.clientId || 0);

            const finalGid =
                finalParentClientId > 0
                    ? finalParentClientId
                    : apiClientId > 0
                      ? apiClientId
                      : globalClientId;

            return {
                hashval: btoa(GeneratePasswordpseudorandom(3) + hasValue + GeneratePasswordpseudorandom(3)),
                isCpPortal: localStorage.getItem('cpCode')?.length > 0,
                cpCode: localStorage.getItem('cpCode'),
                promoCode: localStorage.getItem('promoCode'),
                isAgency: _get(payload, 'isAgencyBrand', false),
                agencyId: _get(payload, 'agencyId', 0) || 0,
                parentClientId: isNotify ? finalParentClientId : _get(payload, 'agencyId', 0) || 0  ,
                // gid: finalGid,
                isChildAccount: isNotify ? isNotify : _get(payload, 'isAgencyBrand', false) ? true : false,
                isNotify,
                userId: _get(payload, 'userId', 0) || 0,
                lmaId: 0,
                isPayment: false,
                isActive: false,
                GlobalSetting: [{ ...localizationSettings }],
                CompanyDetail: [
                    {
                        companyName: _get(payload, 'brandCompany', ''),
                        website: _get(payload, 'brandWebsite', ''),
                        address: _get(payload, 'brandAddress', ''),
                        city: _get(payload, 'brandCity', ''),
                        zipCode: _get(payload, 'brandZipcode', ''),
                        companyLogo: _get(payload, 'brandProfile'),
                        state: selectedState?.state || _get(payload, 'state.state', '') || _get(payload, 'brandState', ''),
                        countryId: _get(payload, 'countryLocation.countryID', ''),
                        regionId: finalRegionId,
                        regionName: _get(payload, 'brandRegion.regionName', ''),
                        parentCompanyName: _get(payload, 'parentCompany', ''),
                        licenseTypeId: _get(payload, 'licenseTypeId', ''),
                        clientBranchTypeId: _get(payload, 'brandCompanyStatus.titleId', 0),
                        brandPositionId: _get(payload, 'BrandPosition.brandPositionID', 0) || 0,
                        industryId: _get(payload, 'brandIndustry.industryID', 0) || 0,
                        businessTypeId: _get(payload, 'businessType.businessTypeID', 0) || 0,
                        // accountTypeId: _get(payload, 'accountType.accountTypeId', 0),
                        isHybrid: _get(payload, 'isHybrid', false),
                        regionStructure: _get(payload, 'preferredRegions', [])
                            .map((region) => region.regionName)
                            .join(','),
                        reportDirectUrl: '',
                        reportTitle: '',
                        //preferredRegions
                    },
                ],
                ...(!_get(payload, 'isAgencyBrand', false) && { ContactInfo: [{ ...contactInfo }] }),
            };
        }
        case 'company':
            const { userId, clientId: globalClientId, isAgency } = getUserDetails();
            const clientId = _get(payload, 'clientId', globalClientId);
            const licenseTypeId = isAgency ? _get(payload, 'licenseTypeId', 0) : 3;
            const preferredRegions =
                licenseTypeId === 3 ? _map(_get(payload, 'preferredRegions', ''), 'regionName')?.join(',') : '';
            return {
                isCpPortal: localStorage.getItem('cpCode')?.length > 0,
                cpCode: localStorage.getItem('cpCode'),
                promoCode: localStorage.getItem('promoCode'),
                parentClientId: _get(payload, 'companiesList.clientId', clientId),
                isChildAccount: true,
                userId: userId || 0,
                agencyId: isAgency ? _get(payload, 'companiesList.clientId', clientId) : 0,
                lmaId: 0,
                isPayment: false,
                isActive: false,
                isAgency: isAgency,
                GlobalSetting: [{ ...localizationSettings }],
                CompanyDetail: [
                    {
                        companyName: _get(payload, 'companyName', ''),
                        website: _get(payload, 'companyWebsite', ''),
                        address: _get(payload, 'companyAddress', ''),
                        city: _get(payload, 'companyCity', ''),
                        state: selectedState?.state ||_get(payload, 'state.state' , ''),
                        zipCode: _get(payload, 'companyZipcode', ''),
                        companyLogo: _get(payload, 'profile', ''),
                       // countryId: _get(payload, 'countryLocation.countryID', ''),
                         countryId: _get(payload, 'countryID', 0),
                        regionId: _get(payload, 'companyRegion.regionID', 0),
                        regionName: _get(payload, 'companyRegion.regionName', ''),
                        parentCompanyName: _get(payload, 'parentCompany', ''),
                        mappingId: _get(payload, 'parentCompany', ''),
                        licenseTypeId: isAgency ? licenseTypeId : 3,
                        clientBranchTypeId: _get(payload, 'companyStatus.titleId', 0),
                        brandPositionId: _get(payload, 'BrandPosition.brandPositionID', 0),
                        industryId: _get(payload, 'companyIndustry.industryID', 0),
                        businessTypeId: _get(payload, 'businessType.businessTypeID', 0),
                        isHybrid: _get(payload, 'isHybrid', true),
                        regionStructure: preferredRegions,
                    },
                ],
            };

        default:
            return {};
    }
};
