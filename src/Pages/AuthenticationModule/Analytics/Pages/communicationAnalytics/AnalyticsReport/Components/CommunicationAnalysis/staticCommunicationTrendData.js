import moment from 'moment';

export const STATIC_DATE_FORMAT = 'MMM DD, YYYY, HH:mm';

/** Use static trend data instead of API response (temporary for chart development). */
export const USE_STATIC_TREND_DATA = false;

/** Default sample size for line and bar trend charts. */
export const STATIC_TREND_SAMPLE_RECORD_COUNT = 7200; // 5 days * 24 hours * 60 minutes

/** Upper bound for n (1 lakh). */
export const MAX_TREND_RECORD_COUNT = 100000;

const SAMPLE_START_DATE = 'Jun 29, 2026';
const MINUTE_MS = 60000;
const SAMPLE_START_MS = moment(SAMPLE_START_DATE, 'MMM DD, YYYY').startOf('day').valueOf();

export const STATIC_COMMUNICATION_CHANNELS = [
    { id: 1, name: 'Email' },
    { id: 2, name: 'SMS' },
    { id: 21, name: 'WhatsApp' },
    { id: 8, name: 'Web push' },
    { id: 10, name: 'LinkedIn Ads' },
    { id: 11, name: 'Google Ads' },
];

/** Resolve n from API payload, categories, or series length. */
export const resolveTrendRecordCount = (source) => {
    if (typeof source === 'number' && source > 0) {
        return Math.min(Math.floor(source), MAX_TREND_RECORD_COUNT);
    }
    if (source?.meta?.totalRecordCount > 0) {
        return Math.min(source.meta.totalRecordCount, MAX_TREND_RECORD_COUNT);
    }
    if (source?.categories?.length > 0) {
        return Math.min(source.categories.length, MAX_TREND_RECORD_COUNT);
    }
    const seriesLen = source?.series?.reduce(
        (max, item) => Math.max(max, (item?.data ?? item?.datas ?? []).length),
        0,
    );
    if (seriesLen > 0) {
        return Math.min(seriesLen, MAX_TREND_RECORD_COUNT);
    }
    return 0;
};

/** Estimate n from date range (hourly points) — capped at 1 lakh. */
export const estimateRecordCountFromDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = moment(startDate);
    const end = moment(endDate);
    if (!start.isValid() || !end.isValid()) return 0;
    const hours = Math.max(1, end.diff(start, 'hours'));
    return Math.min(hours, MAX_TREND_RECORD_COUNT);
};

/**
 * Dynamic render cap from n — never draws all 1L points; scales smoothly.
 * n ≤ 1500 → all points | n = 8k → ~1500 | n = 1L → ~2500
 */
export const getMaxChartRenderPoints = (recordCount) => {
    const n = Math.max(0, recordCount);
    if (n <= 1500) return n;
    if (n <= 10000) return 1500;
    if (n <= 50000) return 2000;
    return 2500;
};

/** Evenly spaced indices across [0, total - 1] — preserves full date range in fewer points. */
export const getDownsampleIndices = (total, maxPoints) => {
    if (!total || total <= 0) return [];
    if (total <= maxPoints) {
        return Array.from({ length: total }, (_, i) => i);
    }
    const indices = [];
    for (let i = 0; i < maxPoints; i++) {
        indices.push(Math.round((i * (total - 1)) / (maxPoints - 1)));
    }
    return [...new Set(indices)];
};

const formatCategoryAtIndex = (index) =>
    moment(SAMPLE_START_MS + index * MINUTE_MS).format(STATIC_DATE_FORMAT);

const getSeriesValue = (index, channelIndex) => ((index + channelIndex * 17) % 100) + 1;

const toTrendNumericValue = (value) => {
    if (typeof value === 'object' && value !== null && 'y' in value) {
        const num = Number(value.y);
        return Number.isNaN(num) ? 0 : num;
    }
    const num = Number(value);
    return Number.isNaN(num) ? 0 : num;
};

/**
 * Sum series values per unique date key — one bar per date per series.
 */
export const aggregateTrendDataByDate = (trendData, getDateKey) => {
    const categories = trendData?.categories ?? [];
    if (!categories.length) return trendData;

    const toKey = getDateKey ?? ((category) => String(category ?? ''));
    const uniqueKeys = [];
    const keyToIndex = new Map();
    const categoryIndexToKeyIndex = new Array(categories.length);

    for (let i = 0; i < categories.length; i++) {
        const key = toKey(categories[i]);
        if (!keyToIndex.has(key)) {
            keyToIndex.set(key, uniqueKeys.length);
            uniqueKeys.push(key);
        }
        categoryIndexToKeyIndex[i] = keyToIndex.get(key);
    }

    const aggregatedSeries = (trendData?.series ?? []).map((item) => {
        const data = item?.data ?? item?.datas ?? [];
        const sums = new Array(uniqueKeys.length).fill(0);

        for (let i = 0; i < categories.length; i++) {
            if (i >= data.length) continue;
            const value = toTrendNumericValue(data[i]);
            if (!value) continue;
            sums[categoryIndexToKeyIndex[i]] += value;
        }

        return { ...item, data: sums };
    });

    return {
        ...trendData,
        categories: uniqueKeys,
        series: aggregatedSeries,
    };
};

/** Aggregate by date; optional downsample (skip when loading full data for zoom). */
export const prepareBarTrendChartData = (trendData, getDateKey, skipDownsample = false) => {
    const aggregated = aggregateTrendDataByDate(trendData, getDateKey);
    return skipDownsample ? aggregated : downsampleTrendDataForChart(aggregated);
};

/**
 * Build chart payload for dynamic n using at most getMaxChartRenderPoints(n).
 */
export const buildChartTrendData = (
    channels,
    recordCount,
    maxRenderPoints = getMaxChartRenderPoints(recordCount),
) => {
    const safeCount = Math.min(Math.max(1, recordCount), MAX_TREND_RECORD_COUNT);
    const indices = getDownsampleIndices(safeCount, maxRenderPoints);
    const renderCount = indices.length;
    const categories = new Array(renderCount);

    for (let j = 0; j < renderCount; j++) {
        categories[j] = formatCategoryAtIndex(indices[j]);
    }

    const series = channels.map((channel, channelIndex) => {
        const data = new Array(renderCount);
        for (let j = 0; j < renderCount; j++) {
            data[j] = getSeriesValue(indices[j], channelIndex);
        }
        return {
            point: { events: {} },
            data,
            name: channel.name,
        };
    });

    return {
        categories,
        series,
        meta: {
            totalRecordCount: safeCount,
            renderPointCount: renderCount,
            isDownsampled: safeCount > renderCount,
        },
    };
};

/** Downsample live/API trend data using dynamic render cap from its own n. */
export const downsampleTrendDataForChart = (trendData, maxRenderPoints) => {
    const categories = trendData?.categories ?? [];
    const total = resolveTrendRecordCount(trendData) || categories.length;
    const renderCap = maxRenderPoints ?? getMaxChartRenderPoints(total);

    if (!total || total <= renderCap) {
        return {
            ...trendData,
            meta: {
                totalRecordCount: total,
                renderPointCount: total,
                isDownsampled: false,
            },
        };
    }

    const indices = getDownsampleIndices(total, renderCap);
    return {
        categories: indices.map((i) => categories[i]),
        series: (trendData?.series ?? []).map((item) => {
            const source = item?.data ?? item?.datas ?? [];
            return {
                ...item,
                data: indices.map((i) => source[i]),
            };
        }),
        meta: {
            totalRecordCount: total,
            renderPointCount: indices.length,
            isDownsampled: true,
        },
    };
};

const trendDataCache = new Map();

/** Static/demo data — always 2k records for line and bar charts. */
export const getStaticCommunicationTrendData = (recordCount = STATIC_TREND_SAMPLE_RECORD_COUNT, loadFullData = true) => {
    const safeCount = Math.min(
        Math.max(1, resolveTrendRecordCount(recordCount) || STATIC_TREND_SAMPLE_RECORD_COUNT),
        MAX_TREND_RECORD_COUNT,
    );
    const cacheKey = loadFullData ? `full-${safeCount}` : safeCount;

    if (!trendDataCache.has(cacheKey)) {
        const maxRenderPoints = loadFullData ? safeCount : getMaxChartRenderPoints(safeCount);
        trendDataCache.set(
            cacheKey,
            buildChartTrendData(STATIC_COMMUNICATION_CHANNELS, safeCount, maxRenderPoints),
        );
    }
    return trendDataCache.get(cacheKey);
};

/**
 * Single entry: static trends for now; API when USE_STATIC_TREND_DATA is false.
 */
export const getCommunicationTrendChartData = ({
    apiTrendData,
    recordCount,
    startDate,
    endDate,
    skipDownsample = false,
    loadFullData = false,
}) => {
    const useFullData = loadFullData || skipDownsample;

    if (!USE_STATIC_TREND_DATA) {
        return useFullData ? apiTrendData : downsampleTrendDataForChart(apiTrendData);
    }

    return getStaticCommunicationTrendData(STATIC_TREND_SAMPLE_RECORD_COUNT, true);
};
