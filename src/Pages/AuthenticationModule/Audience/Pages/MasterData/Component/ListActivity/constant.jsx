import Charts from './Components/Charts';

import { getChannelId } from 'Utils/modules/communicationChannels';

export const getListActivityChannelDisplayLabel = (seriesName = '', channelId = '') => {
    if (channelId) {
        const channelById = getChannelId(channelId);
        if (channelById?.label) return channelById.label;
    }

    if (!seriesName) return '';

    const lookupKey = seriesName === 'Mobile' ? 'sms' : seriesName;
    const channelByName = getChannelId(lookupKey);
    if (channelByName?.label) return channelByName.label;

    return seriesName?.charAt(0)?.toUpperCase() + seriesName?.slice(1);
};

export const ACTIVITY_TYPE_MAP = {
    0: 'activity',      // List activity tab
    1: 'acquisition',   // List acquisition tab
    2: 'attrition'      // List attrition tab
};

/** Matches areaspline chart height + tab chrome so loading/no-data states match loaded chart. */
export const MDM_LIST_ACTIVITY_PORTLET_HEIGHT = 429;
export const MDM_LIST_ACTIVITY_CHART_HEIGHT = 335;

export const LIST_TAB_CONFIG = [
    { id: 1001, text: 'List activity', disable: true, component: () => <Charts type="LIST_ACTIVITY" /> },
    { id: 1002, text: 'List acquisition', disable: false, component: () => <Charts type="LIST_ACQUISITION" /> },
    { id: 1003, text: 'List attrition', disable: true, component: () => <Charts type="LIST_ATTRIBUTION" /> },
];

 

export const transformListAcquisitionData = (newData) => {
    if (!newData || typeof newData !== 'object') {
        return {
            dateRanges: [],
            recipientListSeries: []
        };
    }

    const allDatesSet = new Set();
    Object.values(newData).forEach(channelData => {
        Object.keys(channelData).forEach(date => allDatesSet.add(date));
    });

    const dateRanges = Array.from(allDatesSet).sort((a, b) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        return dateA - dateB;
    });

    const recipientListSeries = Object.entries(newData).map(([channelKey, dateValues]) => {
        const underscoreIndex = channelKey.indexOf('_');
        const channelId = underscoreIndex > -1 ? channelKey.slice(0, underscoreIndex) : '';
        const seriesName = underscoreIndex > -1 ? channelKey.slice(underscoreIndex + 1) : channelKey;
        const displayName = getListActivityChannelDisplayLabel(seriesName, channelId);

        const seriesData = dateRanges.map(date => dateValues[date] || 0);

        return {
            seriesName,
            displayName,
            seriesData
        };
    });

    return {
        dateRanges,
        recipientListSeries,
        allImportedSources: Object.entries(newData).map(([channelKey]) => {
            const underscoreIndex = channelKey.indexOf('_');
            const channelId = underscoreIndex > -1 ? channelKey.slice(0, underscoreIndex) : '';
            const seriesName = underscoreIndex > -1 ? channelKey.slice(underscoreIndex + 1) : channelKey;
            return `${channelId}:${seriesName}`;
        })
    };
};