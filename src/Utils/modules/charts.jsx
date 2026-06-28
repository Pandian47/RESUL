import { ch_color1, ch_color2, ch_color3, ch_color4, ch_color5, ch_color6, ch_color7, ch_color8, ch_color9 } from 'Constants/GlobalConstant/Colors/colorsVariable';
import { colorCommonCode } from 'Constants/Charts/commonFunction';
import moment from 'moment';

export function getChartColor(name) {
    // Default 9 chart colors for fallback
    const defaultChartColors = [
        ch_color1,
        ch_color2,
        ch_color3,
        ch_color4,
        ch_color5,
        ch_color6,
        ch_color7,
        ch_color8,
        ch_color9,
    ];

    if (!name) {
        return defaultChartColors[Math.floor(Math.random() * defaultChartColors.length)];
    }

    const normalizedName = name.toLowerCase().trim();

    let lookupKey = normalizedName;

    if (normalizedName.includes('web notification') || normalizedName === 'web notification') {
        lookupKey = 'web notification';
    } else if (normalizedName.includes('mobile push notification') || normalizedName === 'mobile push notification') {
        lookupKey = 'mobile push notification';
    } else if (normalizedName === 'socialmedia' || normalizedName === 'social media') {
        lookupKey = normalizedName === 'social media' ? 'social media' : 'socialmedia';
    } else if (normalizedName.includes('notification') && !normalizedName.includes('mobile push')) {
        lookupKey = 'web notification';
    }

    let matchingValue = colorCommonCode[lookupKey];

    if (!matchingValue) {
        matchingValue = colorCommonCode[normalizedName];
    }

    if (!matchingValue) {
        for (let key in colorCommonCode) {
            if (normalizedName.includes(key) || key.includes(normalizedName)) {
                matchingValue = colorCommonCode[key];
                break;
            }
        }
    }

    if (!matchingValue) {
        for (let key in colors) {
            const colorKey = key.toLowerCase();
            if (
                colorKey.includes('ch_' + normalizedName.replace(/\s+/g, '_')) ||
                colorKey.includes('ch_' + normalizedName.replace(/\s+/g, ''))
            ) {
                matchingValue = colors[key];
                break;
            }
        }
    }

    if (!matchingValue) {
        matchingValue = defaultChartColors[Math.floor(Math.random() * defaultChartColors.length)];
    }

    return matchingValue;
}

export function chartBookMark(recipientAcquisition, dateRanges) {
    const dateTempValue = [];
    if (recipientAcquisition?.length) {
        recipientAcquisition?.forEach((item) => {
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
    dateRanges?.length &&
        dateTempValue?.length &&
        dateTempValue.forEach((item) => {
            const index = dateRanges.findIndex(
                (date) => new Date(date).toLocaleDateString() === new Date(item[0]).toLocaleDateString(),
            );

            if (index !== -1 && !getIndexofDateItems.includes(index)) {
                getIndexofDateItems.push([index, item[1]]);
            }
        });

    return getIndexofDateItems;
}

export function hasNonZeroEngagementData(data) {
    try {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        const series = parsed?.series;
        if (!Array.isArray(series) || series.length === 0) return false;

        return series.some((serie) => {
            const values = Array.isArray(serie?.datas) ? serie?.datas : Array.isArray(serie?.data) ? serie?.data : [];
            return values.some((value) => Number(value) !== 0);
        });
    } catch (e) {
        return false;
    }
}
export function hasValidPieChartData(data) {
    if (!data) return false;
    let parsedData = typeof data === 'string' ? JSON.parse(data) : data;
    if (!Array.isArray(parsedData) || parsedData.length === 0) return false;
    return parsedData.some((item) => Number(item?.value || item?.y || item?.doubleValue || item?.intValue) > 0);
}

/** True when transformed pie chart config has at least one slice with a value > 0. */
export function hasNonZeroPieChartSeriesData(chartData) {
    if (!chartData?.series?.length) return false;
    return chartData.series.some(
        (item) => Number(item?.y ?? item?.value ?? item?.doubleValue ?? item?.intValue ?? 0) > 0,
    );
}

/** Alias for area/column/reach/conversion JSON or transformed chart objects. */
export function hasNonZeroSeriesChartData(data) {
    return hasNonZeroEngagementData(data);
}

/** True when data is empty or every numeric field across all rows is zero (skips labels/dates). */
export function isAllValuesZero(data) {
    if (!data || (Array.isArray(data) && data.length === 0)) return true;
    if (!Array.isArray(data)) return true;

    return data.every((item) =>
        Object.values(item || {}).every((value) => {
            if (value == null || value === '') return true;
            const num = Number(value);
            if (Number.isNaN(num)) return true;
            return num === 0;
        }),
    );
}

export function hasChartData(data) {
    return !isAllValuesZero(data);
}
