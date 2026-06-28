import Charts from './Components/Charts';
 
import moment from 'moment';
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

 

export const reachOverallChart = (data, callBack, acquisitionNotes) => {
    let maxValue = null;
    data?.recipientListSeries?.forEach((item) => {
        item?.seriesData.forEach((item) => {
            maxValue = Math.max(item, maxValue);
        });
    });
    const dateTempValue = [];
    if (acquisitionNotes?.length) {
        acquisitionNotes?.forEach((item) => {
            const date = new Date(item?.eventDate);
            if (!isNaN(date.getTime())) {
                dateTempValue.push([
                    // `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
                    moment(date).format('YYYY-MM-DD'),
                    item?.eventChannelName,
                ]);
            }
        });
    }
    const getIndexofDateItems = [];
    data?.dateRanges?.length &&
        dateTempValue?.length &&
        dateTempValue.forEach((item) => {
            const index = data?.dateRanges.findIndex((date) => date === item[0]);
            if (index !== -1 && !getIndexofDateItems.includes(index)) {
                getIndexofDateItems.push([index, item[1]]);
            }
        });

    const chartOptions = {
        chart: { type: 'areaspline' },
        xAxis: {
            title: 'Date',
            tickInterval: data?.dateRanges?.length < 30 ? 4 : Math.floor(data?.dateRanges?.length / 6),
            categories: data?.dateRanges,
            plotLines: [
                {
                    color: '#eeeeee',
                    value: 12,
                    width: 1,
                    label: {
                        useHTML: true,
                        className: '',
                        verticalAlign: 'bottom',
                        text: '<i class="chart-icon-plot">&nbsp;</i>',
                    },
                },
            ],
            plotOptions: {
                series: {
                    marker: {
                        enabled: true,
                        symbol: 'square',
                        radius: 1,
                    },
                },
            },

            labels: {
                formatter: function () {
                    return this.value;
                },
            },
        },
        yAxis: {
            title: 'Count',
            tickInterval: maxValue,
        },
        legend: {
            itemStyle: { width: '150px' },
        },
        series: data?.recipientListSeries?.map((item, index) => {
            const color = ['#2896f0', '#fd8f40'];
            return {
                cursor: 'pointer',
                point: {
                    events: {
                        click: (e) => {
                            const FilterAcqusitionNotes = acquisitionNotes?.filter(
                                (filteritem) =>
                                    filteritem?.eventDate === e?.point?.category &&
                                    item.seriesName === filteritem.eventChannelName,
                            );
                            return callBack(e?.point, item, FilterAcqusitionNotes);
                        },
                    },
                },
                name: item.seriesName,
                color: color[index],
                marker: {
                    lineColor: color[index],
                    fillColor: 'white',
                },
                data: item.seriesData.map((data, index) => {
                    const findItem = getIndexofDateItems.some(
                        (series) => series[0] === index && series[1] === item?.seriesName,
                    );
                    if (findItem) {
                        return {
                            y: data,
                            marker: {
                                symbol: 'url(https://run.resulticks.com/Images/icon-bookmark-blue.png)',
                            },
                        };
                    }
                    return data;
                }),
                dateRange: item.dateRanges,
            };
        }),
    };
    return chartOptions;
};

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