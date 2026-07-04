import { brandCompanystatus } from 'Constants/GlobalConstant';
import { get as _get, map as _map } from 'Utils/modules/lodashReplacements';

export const INITIAL_STATE = {
    mode: 'onTouched',
    defaultValues: {
        profile: '',
        parentCompany: '',
        preferredRegions: [],
        defaultRegions: false,
        companyName: '',
        companyStatus: brandCompanystatus?.[2],
        companyWebsite: 'https://',
        companiesList: '',
        companyAddress: '',
        companyCity: '',
        companyZipcode: '',
        companyCountry: '',
        companyRegion: '',
        companyIndustry: '',
        businessType: '',
        BrandPosition: '',
        isHybrid: false,
        bus: [],
    },
};

export const buildPayload = ({
    clientId,
    userId,
    companyWebsite,
    profile,
    companyAddress,
    companyCity,
    companyZipcode,
    licenseTypeId,
    dateFormat,
    timeFormat,
    timezone,
    preferredRegions,
    companyRegion,
    bus,
    isHybrid,
    regionList,
    state,
    companyCountry,
}) => {
    let data = {
        clientId,
        userId: userId,
        website: companyWebsite,
        clientLogo: profile,
        address: companyAddress,
        city: companyCity,
        zipCode: companyZipcode,
        state: _get(state, 'state', state || ''),
        countryId: _get(companyCountry, 'countryID', companyCountry || 0),
        isHybrid: isHybrid,
        // businessTypeId: licenseTypeId === '3' ? 0 : 0,
        businessTypeId: 0,
        dateFormatId: _get(dateFormat, 'dateFormatID', 4),
        timeFormatId: _get(timeFormat, 'timeFormatID', 0),
        timeZoneId: _get(timezone, 'timeZoneID', 0),
        clientBranchTypeId: 1,
        clientLocalization: {
            regionalStructure: _map(preferredRegions, 'regionName').join(','),
            // regionId: 0,
            // regionName: '',

           regionId: regionList?.some((region) => region?.regionID === companyRegion?.regionID) ? companyRegion?.regionID : 0,
            //regionId:  companyRegion?.regionID || 0,
            regionName: companyRegion?.regionName || '',
        },
        businessUnit: _map(bus, (res) => ({
            industryId: res?.SelectIndustry?.industryID,
            businessTypeId: res?.SelectBUType?.businessTypeID,
            brandPositionId: res?.SelectBrandPosition?.brandPositionID,
            departmentId: res?.departmentId || 0,
            departmentName: res?.buName,
            isLock: res?.isLock || false,
        })),
    };
    return data;
};
