import _get from 'lodash/get';
import _map from 'lodash/map';

export const buildPayload = ({
    clientId,
    userId,
    industry,
    logoPath,
    website,
    city,
    zipCode,
    address,
    licenseTypeId,
    preferredRegions,
    dateFormat,
    country,
    timeFormat,
    timezone,
}) => {
    return {
        clientId,
        userId: userId,
        website: website,
        clientLogo: logoPath,
        address,
        city,
        zipCode,
        // businessTypeId: licenseTypeId === '3' ? 0 : 0,
        businessTypeId: 0,
        dateFormatId: _get(dateFormat, 'dateFormatID', 0),
        timeFormatId: _get(timeFormat, 'timeFormatID', 0),
        timeZoneId: _get(timezone, 'timeZoneID', 0),
        clientLocalization: {
            regionalStructure: _map(preferredRegions, 'regionName').join(','),
            regionId: 0,
            regionName: '',
        },
        businessUnit: [],
    };
};
