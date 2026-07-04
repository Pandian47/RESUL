import { commonColorCode, seriesNameField } from 'Constants/Charts/commonFunction';
import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { ch_color1, ch_color2, ch_color3, ch_color4, ch_color5, ch_color6, ch_primary_black } from 'Constants/GlobalConstant/Colors/colorsVariable';
import PropTypes from 'prop-types';

const SERIES_COLORS = [
    ch_color1,
    ch_color2,
    ch_color3,
    ch_color4,
    ch_color5,
    ch_color6,
];

const SQUARE_MARKER = { symbol: 'square', radius: 4, enabled: true };

const toNumbers = (data) => {
    if (typeof data === 'string') {
        try {
            return toNumbers(eval(data));
        } catch {
            return [];
        }
    }
    if (!Array.isArray(data)) return [];
    return data.map((point) => (Array.isArray(point) ? Number(point[1]) || 0 : Number(point) || 0));
};

const parseUniqueUtcDates = (categories) => {
    if (typeof categories !== 'string') return [];
    const seen = new Set();
    return (categories.match(/Date\.UTC\([^)]+\)/g) || [])
        .map((dateStr) => eval(dateStr))
        .filter((date) => {
            const ts = new Date(date).getTime();
            if (seen.has(ts)) return false;
            seen.add(ts);
            return true;
        });
};

const getTimeLabels = (series, categories) => {
    if (Array.isArray(categories) && categories.length && !String(categories[0]).includes('Date.UTC')) {
        return [...categories];
    }

    let dates = [];
    try {
        const raw = series?.[0]?.data;
        if (raw) {
            const parsed = typeof raw === 'string' ? eval(raw) : raw;
            dates = (parsed || []).map((pair) => pair?.[0]).filter(Boolean);
        }
    } catch (_) {}

    if (!dates.length) dates = parseUniqueUtcDates(categories);
    if (!dates.length) return [];

    const firstDay = getUserCurrentFormat(dates[0], { noConversion: true })?.dateFormat;
    const sameDay = dates.every(
        (date) => getUserCurrentFormat(date, { noConversion: true })?.dateFormat === firstDay,
    );

    return dates.map((date) => {
        const formatted = getUserCurrentFormat(date, { noConversion: true });
        return sameDay ? formatted?.dateTimeFormat : formatted?.dateFormat;
    });
};

const buildChartData = ({ series = [], categories }) => {
    const channels = series.map(({ name, data }) => ({ name, data: toNumbers(data) }));
    const times = getTimeLabels(series, categories);

    const shouldTranspose =
        times.length > 0 &&
        channels.length >= times.length &&
        channels.every((channel) => (channel?.data?.length ?? 0) === times.length);

    if (!shouldTranspose) {
        return {
            categories: Array.isArray(categories) ? [...categories] : times,
            series: channels,
        };
    }

    return {
        categories: channels.map((channel) => channel.name),
        series: times.map((name, timeIndex) => ({
            name,
            data: channels.map((channel) => channel?.data?.[timeIndex] ?? 0),
        })),
    };
};

const getYScale = (series) => {
    const max = Math.max(0, ...series.flatMap((item) => item.data));
    const tickInterval = max <= 5 ? 1 : max <= 25 ? 5 : max <= 100 ? 10 : max <= 500 ? 50 : 500;
    const yMax =
        max === 0 ? tickInterval : Math.max(Math.ceil((max + tickInterval) / tickInterval) * tickInterval, max + 1);

    return { tickInterval, max: yMax };
};

const getColorPalette = (items) => {
    const mapped = commonColorCode(
        items.map((item) => ({ name: seriesNameField(item?.name ?? item) })),
    );
    return items.map((_, index) => mapped[index] || SERIES_COLORS[index % SERIES_COLORS.length]);
};

const radarChartOptions = (args = {}) => {
    const { categories, series } = buildChartData(args);
    const { tickInterval, max: yMax } = getYScale(series);
    const channelColors = getColorPalette(categories);
    const seriesColors = getColorPalette(series);

    const chartSeries = [...series]
        .map((item, index) => ({ item, index, peak: Math.max(...item.data, 0) }))
        .sort((a, b) => a.peak - b.peak)
        .map(({ item, index }) => {
            const color = item.color ?? seriesColors[index];

            return {
                name: item.name,
                type: 'area',
                color,
                legendSymbol: 'lineMarker',
                data: item.data.map((y, channelIndex) => ({
                    y,
                    marker: {
                        ...SQUARE_MARKER,
                        fillColor: channelColors[channelIndex] || color,
                        lineColor: channelColors[channelIndex] || color,
                    },
                })),
                pointPlacement: 'on',
                connectEnds: true,
                fillOpacity: 0.08,
                lineWidth: 2,
                marker: { ...SQUARE_MARKER, fillColor: color, lineColor: color },
            };
        });

    return {
        chart: {
            type: 'area',
            polar: true,
            height: args.height ?? 360,
            marginBottom: 80,
            spacingBottom: 16,
        },
        boost: { enabled: false },
        pane: { size: '82%' },
        xAxis: { categories: [...categories], tickmarkPlacement: 'on', lineWidth: 1 },
        yAxis: {
            min: 0,
            max: yMax,
            gridLineInterpolation: 'polygon',
            gridLineDashStyle: 'solid',
            gridLineWidth: 2,
            tickInterval,
        },
        legend: {
            symbolRadius: 2,
            symbolHeight: 9,
            symbolWidth: 9,
            itemStyle: { color: ch_primary_black },
            align: 'center',
            verticalAlign: 'bottom',
            y: 4,
            margin: 20,
            itemMarginTop: 6,
            itemMarginBottom: 6,
            padding: 8,
        },
        tooltip: {
            shared: false,
            formatter() {
                const channel = categories[this.point?.index];
                return channel
                    ? `<b>${channel}</b><br/>${this.series.name}<br/>Value: ${this.y}`
                    : `<b>${this.series.name}</b><br/>Value: ${this.y}`;
            },
        },
        plotOptions: {
            area: { fillOpacity: 0.08, lineWidth: 2, connectEnds: true, marker: SQUARE_MARKER },
            series: { connectEnds: true, marker: SQUARE_MARKER },
        },
        series: chartSeries,
    };
};

export default radarChartOptions;

radarChartOptions.propTypes = {
    series: PropTypes.array,
};
