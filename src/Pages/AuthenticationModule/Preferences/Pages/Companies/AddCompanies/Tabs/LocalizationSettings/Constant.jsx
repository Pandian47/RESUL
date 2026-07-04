import { get as _get, filter as _filter } from 'Utils/modules/lodashReplacements';

export const normalizeToArray = (value) => {
    if (Array.isArray(value)) return value;
    if (value == null || value === '') return [];
    if (typeof value === 'object') return Object.values(value);
    return [];
};

export const getFieldValue = (localizationSettings, key) => {
    switch (key) {
        case 'clientinfo':
            return _get(localizationSettings, 'clientinfo', {});
        case 'conversionTypes':
            return _filter(
                normalizeToArray(_get(localizationSettings, 'conversionTypes', [])),
                (type) => type?.goalType === "C"
            );
        case 'engagementTypes':
            return  _filter(
                normalizeToArray(_get(localizationSettings, 'conversionTypes', [])),
                (type) => type?.goalType === "E"
            );
        case 'offerTypes':
            return normalizeToArray(_get(localizationSettings, 'offerTypes', []));
        case 'communicationReference':
            return normalizeToArray(_get(localizationSettings, 'communicationReference', []));
        case 'subscriptionCategory':
            return normalizeToArray(_get(localizationSettings, 'subscriptionCategory', []));
        case 'productCategories':
            return normalizeToArray(_get(localizationSettings, 'productCategories', []));
        case 'smartLink':
            return _get(localizationSettings, 'smartLink', '');
        case 'customCommunicationLink':
            return _get(localizationSettings, 'customCommunicationLink', '');
        case 'jobServicesExecution':
            return _get(localizationSettings, 'jobServicesExecution', {});
        case 'analyticsCalculation':
            return _get(localizationSettings, 'analyticsCalculation', {});
        case 'multidimensionCampaignsetup':
            return _get(localizationSettings, 'multidimensionCampaignsetup[0]', {});
        case 'campaignAttributes':
            return normalizeToArray(_get(localizationSettings, 'campaignAttributes', []));
        case 'subCategories':
            return normalizeToArray(_get(localizationSettings, 'subCategories', []));
        default:
            break;
    }
};

export const conversionTypes = [
    { title: 'By Reach', titleId: 4 },
    { title: 'By Engagement', titleId: 5 }
]

export const analyticsCalculationSetup = {
    1: { title: 'By Target', titleId: 1 },
    2: { title: 'By Sent', titleId: 2 },
    3: { title: 'By Delivered', titleId: 3 },
    4: { title: 'By Reach', titleId: 4 },
    5: { title: 'By Engagement', titleId: 5 }
}