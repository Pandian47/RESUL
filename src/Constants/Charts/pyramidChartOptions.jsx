import { chartSizing, commonColorCode, seriesNameField } from 'Constants/Charts/commonFunction';
import { ch_labelSize } from 'Constants/GlobalConstant/Fonts/Fonts';
import { chartColorCode } from 'Constants/GlobalConstant/Colors/colorsVariable';
import { formatNumber } from 'Utils/modules/campaignUtils';
import { formatChartPercentageLabelValue } from 'Utils/modules/formatters';
const pyramidChartOptions = ({ ...args }) => {
    const minPercent = Number(args?.minPercent ?? 5);
    const minFraction = minPercent > 0 ? minPercent / 100 : 0;

    const getStableMinThreshold = (values = [], minFrac = 0) => {
        if (!minFrac || minFrac <= 0) return null;
        const total = values.reduce((sum, v) => sum + v, 0);
        if (!total) return null;
        let S = new Set(values.map((v, i) => (v / total < minFrac ? i : null)).filter((i) => i !== null));
        let threshold = null;

        for (let guard = 0; guard < 20; guard++) {
            const k = S.size;
            const denom = 1 - k * minFrac;
            if (denom <= 0) return null;

            const sumOthers = values.reduce((sum, v, i) => (S.has(i) ? sum : sum + v), 0);
            const displayTotal = sumOthers / denom;
            const nextThreshold = minFrac * displayTotal;
            const nextS = new Set(values.map((v, i) => (v < nextThreshold ? i : null)).filter((i) => i !== null));

            const isSame = nextS.size === S.size && Array.from(nextS).every((idx) => S.has(idx));
            S = nextS;
            threshold = nextThreshold;
            if (isSame) break;
        }

        return { indices: S, threshold };
    };

    const filteredSeries = (args?.series ?? []).filter((item) => Number(item?.y) > 0);
    const normalizedSeries = filteredSeries.map((item) => ({
        ...item,
        name: seriesNameField(item.name),
    }));
    const seriesColors = commonColorCode(normalizedSeries);

    const rawSeries = normalizedSeries.map((item, index) => ({
        name: item.name,
        y: Number(item?.y),
        originalValue: item?.originalValue,
        color: item?.color ?? seriesColors[index],
    }));
    const yValues = rawSeries.map((p) => p.y);
    const ySum = yValues.reduce((sum, v) => sum + v, 0);
    const looksLikePercent =
        yValues.length > 0 && yValues.every((v) => Number.isFinite(v) && v >= 0 && v <= 100) && ySum <= 110;

    const basisValues = looksLikePercent
        ? yValues
        : rawSeries.map((p) => Number(p.originalValue ?? p.y));
    const basisTotal = basisValues.reduce((sum, v) => sum + v, 0);

    const minThreshold = minFraction > 0 ? getStableMinThreshold(basisValues, minFraction) : null;
    const inflateIndices = minThreshold?.indices ?? new Set();
    const inflateTo = minThreshold?.threshold;

    const showActualPercent = (args?.useActualPercent ?? true) || minFraction > 0;

    const seriesData = rawSeries.map((p, idx) => {
        const actualValue = looksLikePercent ? p.y : Number(p.originalValue ?? p.y);
        const actualPercent = looksLikePercent ? p.y : (basisTotal ? (actualValue / basisTotal) * 100 : 0);
        const displayY = minFraction > 0 && inflateTo != null && inflateIndices.has(idx) ? inflateTo : p.y;
        const dataPoint = {
            name: p.name,
            y: displayY,
            color: p.color,
        };
        if (p.originalValue !== undefined || minFraction > 0) {
            dataPoint.originalValue = actualValue;
        }
        if (showActualPercent) {
            dataPoint.actualPercent = actualPercent;
        }

        return dataPoint;
    });

    return {
        chart: {
            type: 'pyramid',
            height: args?.height ?? chartSizing['pyramid'],
            className: 'pyramidchart-default-render',
        },
        title: {
            text: '',
            x: -50,
        },
        credits: {
            enabled: false,
        },
        tooltip: {
            useHTML: true,
            headerFormat: '<span class="font-xs">{point.key}',
            pointFormatter: function() {
                const valueToShow =
                    (minFraction > 0 && this.originalValue !== undefined)
                        ? this.originalValue
                        : ((args?.showOriginalValue && this.originalValue !== undefined) ? this.originalValue : this.y);
                const formattedValue = formatNumber(valueToShow);
                return `<br/><hr /><span class="font-monospace" style="color:${this.color}">\u25CF</span>&nbsp;<span class="font-xs">${this.series.name}: </span>` +
                       `<span class="font-xs">${formattedValue}</span><br/>`
            },
            footerFormat: '</span>',
        },
        plotOptions: {
            series: {
                dataLabels: {
                    enabled: true,
                    ...(args?.showValueInLabel
                        ? {
                              useHTML: true,
                              formatter: function () {
                                  const val = this?.point?.originalValue ?? this?.y;
                                  const name = this?.point?.name ?? this?.key ?? '';
                                  const valStr = formatNumber(val);
                                  return `<span class="fs14 color-primary-black">${name} (${valStr})</span>`;
                              },
                          }
                        : showActualPercent
                          ? {
                                useHTML: true,
                                formatter: function () {
                                    const pct =
                                        this?.point?.actualPercent ??
                                        this?.point?.options?.actualPercent ??
                                        this?.percentage ??
                                        0;
                                    const name = this?.point?.name ?? this?.key ?? '';
                                    const pctLabel = formatChartPercentageLabelValue(pct);
                                    return `<span class="fs14 color-primary-black">${name} (${pctLabel}</span><sub class="fs11 percent-xs color-primary-black">%</sub><span class="fs14 color-primary-black">)</span>`;
                                },
                            }
                          : {
                                format: '<span class="fs14 color-primary-black">{point.name} ({point.percentage:.2f}</span><sub class="fs11 percent-xs color-primary-black">%</sub><span class="fs14 color-primary-black">)</span>',
                            }),
                    color: '#111',
                    style: { color: chartColorCode, fontSize: ch_labelSize, fontWeight: 'normal' },
                    allowOverlap: args?.allowOverlap ?? (minFraction > 0),
                    crop: false,
                    overflow: 'allow',
                },
                center: args?.center ?? ['45%', '50%'],
                width: args?.width ?? '60%',
                height: '90%',
            },
            pyramid: { reversed: args?.reversed ?? false },
        },
        series: [
            {
                name: 'Value',
                borderWidth: 5,
                data: seriesData,
            },
        ],
    };
};

export default pyramidChartOptions;
