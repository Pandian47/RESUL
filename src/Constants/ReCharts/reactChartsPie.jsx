import { memo, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    PieChart,
    Pie,
    Cell,
    Sector,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import {
    ch_color1,
    ch_color2,
    ch_color3,
    ch_color4,
    ch_color5,
    ch_color6,
    ch_color7,
    ch_color8,
    ch_color9,
    ch_legendtextSize,
    ch_primary_black,
} from 'Constants/GlobalConstant/Colors/colorsVariable';
import { seriesNameField, commonColorCode } from 'Constants/Charts/commonFunction';
import { formatPercentageDisplay } from 'Utils/modules/formatters';
import { formatNumber } from 'Utils/modules/campaignUtils';
import { truncateTitle } from 'Utils/modules/displayCore';

// ─── Default chart colour palette ───────────────────────────────────────────
const DEFAULT_COLORS = [
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

// ─── Outer radius constant (% of container) ──────────────────────────────────
// Inner radius is derived as a fraction of this, matching Highcharts behaviour
// where innerSize is relative to the outer ring diameter, not the container.
const OUTER_RADIUS_PCT = 75;

/**
 * Strips JSON-stringified array brackets from a name string.
 * e.g.  '["Financial Services"]'  →  'Financial Services'
 */
const sanitizeName = (name) => {
    if (!name || typeof name !== 'string') return name ?? '';
    const trimmed = name.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return String(parsed[0]);
            }
        } catch {
            // manual strip: remove [ ] and surrounding quotes
            return trimmed
                .slice(1, -1)
                .replace(/^"|"$/g, '')
                .replace(/^'|'$/g, '')
                .trim();
        }
    }
    return trimmed;
};

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, seriesName }) => {
    if (!active || !payload || payload.length === 0) return null;

    const entry = payload[0];
    const { name, value, payload: entryPayload } = entry;
    const color = entryPayload?.color ?? entry.color;
    const formattedValue = formatNumber(value ?? 0);
    const isPercentage =
        String(seriesName || '').toLowerCase().includes('percentage') ||
        String(seriesName || '').toLowerCase().includes('percent');
    const suffix = isPercentage ? '%' : '';

    return (
        <div
            style={{
                background: '#ffffff',
                border: '1px solid #e0e0e0',
                borderRadius: 6,
                padding: '8px 12px',
                fontSize: 12,
                fontFamily: 'MuktaRegular, sans-serif',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                minWidth: 140,
                maxWidth: 240,
            }}
        >
            <span className="font-xs" style={{ fontWeight: 600 }}>
                {name}
            </span>
            <hr style={{ margin: '4px 0', borderColor: '#e0e0e0' }} />
            <span style={{ color }}>&#9679;</span>&nbsp;
            <span className="font-xs">{seriesName || 'Count'}: </span>
            <span className="font-xs" style={{ fontWeight: 600 }}>
                {formattedValue}
                {suffix}
            </span>
        </div>
    );
};

CustomTooltip.propTypes = {
    active: PropTypes.bool,
    payload: PropTypes.array,
    seriesName: PropTypes.string,
};

// ─── Custom Legend ───────────────────────────────────────────────────────────────────
// allData   – full dataset (including hidden slices) so legend always shows all items
// hiddenKeys – Set of slice names that are toggled off
// onToggle  – callback(name) to flip a slice's hidden state
const CustomLegend = ({ allData, totalItems, hiddenKeys, onToggle }) => {
    const items = allData ?? [];
    if (!items.length) return null;

    return (
        <ul
            style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '4px 16px',
                marginTop: 8,
            }}
        >
            {items.map((entry, index) => {
                const isHidden = hiddenKeys?.has(entry.name);
                let displayName = entry.name;
                if (totalItems > 4 && entry.name?.length > 10) {
                    try {
                        const result = truncateTitle(entry.name, 10);
                        if (typeof result === 'string') {
                            displayName = result;
                        } else if (result?.props?.text) {
                            displayName = `${result.props.text.slice(0, 10)}...`;
                        } else {
                            displayName = `${entry.name.slice(0, 10)}...`;
                        }
                    } catch {
                        displayName = `${entry.name.slice(0, 10)}...`;
                    }
                }

                return (
                    <li
                        key={`legend-${index}`}
                        title={entry.name}
                        onClick={() => onToggle?.(entry.name)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            cursor: 'pointer',
                            userSelect: 'none',
                            fontSize: ch_legendtextSize,
                            fontFamily: 'MuktaRegular, sans-serif',
                            fontWeight: 'normal',
                            color: ch_primary_black,
                            opacity: isHidden ? 0.38 : 1,
                            transition: 'opacity 0.2s ease',
                        }}
                    >
                        <span
                            style={{
                                display: 'inline-block',
                                width: 9,
                                height: 9,
                                borderRadius: 2,
                                backgroundColor: entry.color,
                                flexShrink: 0,
                                transition: 'background-color 0.2s ease',
                            }}
                        />
                        <span
                            style={{
                                textDecoration: isHidden ? 'line-through' : 'none',
                                transition: 'text-decoration 0.2s ease',
                            }}
                        >
                            {displayName}
                        </span>
                    </li>
                );
            })}
        </ul>
    );
};

CustomLegend.propTypes = {
    allData: PropTypes.array,
    totalItems: PropTypes.number,
    hiddenKeys: PropTypes.instanceOf(Set),
    onToggle: PropTypes.func,
};

// ─── Custom Data Label – kept for reference / fallback (not used when activeShape is on)
// const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, percent }) => { ... };

// ─── Main Component ───────────────────────────────────────────────────────────────────────
/**
 * ReactChartsPie
 *
 * A recharts-based Pie / Donut chart that mirrors the options shape consumed by
 * the Highcharts `pieChartOptions` helper so it can be swapped in place.
 *
 * @param {object}  args             - Same "args" object passed to pieChartOptions.
 * @param {number}  [args.height]    - Chart height in px (default 335).
 * @param {Array}   [args.series]    - Data array: [{ name, y|value|intValue, color? }].
 * @param {string}  [args.seriesName]- Series label shown in tooltip.
 * @param {string}  [args.innerSize] - Donut inner radius, e.g. "47%" (default "47%").
 * @param {number}  [args.angle]     - Start angle in degrees (default 45).
 * @param {string}  [args.image]     - HTML string rendered in the donut centre.
 * @param {object}  [args.legend]    - Legend config: { enabled, itemMarginTop, y }.
 * @param {object}  [args.dataLabels]- Data labels config: { enabled }.
 * @param {boolean} [position]       - (unused, kept for API parity).
 */
const ReactChartsPie = ({ args = {}, position }) => {
    // Suppress unused-variable lint for position (API parity)
    void position;

    const height = args?.height ?? 335;
    const seriesName = args?.seriesName ?? 'Count';
    const innerSizeRaw = args?.innerSize ?? '47%';
    const showLegend = args?.legend?.enabled ?? true;
    const showDataLabels = args?.dataLabels?.enabled ?? true;
    const startAngleDeg = args?.angle ?? 45;
    const centerImage = args?.image ?? null;

    // Toggle state: Set of slice names that are currently hidden
    const [hiddenKeys, setHiddenKeys] = useState(new Set());
    const toggleKey = (name) => {
        setHiddenKeys((prev) => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name);
            else next.add(name);
            return next;
        });
    };

    // Active shape hover state
    const [activeIndex, setActiveIndex] = useState(null);

    // ─── Default label: elbow polyline + dot + % (matches active-shape line style) ────────────
    // Defined as a closure so it can read activeIndex and skip the active slice.
    const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, percent, index, fill, payload }) => {
        if (index === activeIndex) return null; // active shape handles its own label
        if (percent < 0.02) return null;        // skip slivers too small to label

        const RADIAN = Math.PI / 180;
        const cos = Math.cos(-midAngle * RADIAN);
        const sin = Math.sin(-midAngle * RADIAN);

        // Same elbow-polyline geometry as the active shape (shorter distances)
        const sx = cx + (outerRadius + 2)  * cos;  // start at ring edge
        const sy = cy + (outerRadius + 2)  * sin;
        const mx = cx + (outerRadius + 20) * cos;  // diagonal segment end
        const my = cy + (outerRadius + 20) * sin;
        const ex = mx + (cos >= 0 ? 1 : -1) * 18; // horizontal elbow end
        const ey = my;
        const textAnchor = cos >= 0 ? 'start' : 'end';
        const textX = ex + (cos >= 0 ? 8 : -8);

        // Use the slice's own colour for the line + dot
        const lineColor = payload?.color ?? fill ?? '#aaaaaa';
        const formattedPct = formatPercentageDisplay(percent * 100);

        return (
            <g>
                {/* Elbow polyline: diagonal → horizontal */}
                <path
                    d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
                    stroke={lineColor}
                    fill="none"
                    strokeWidth={1.5}
                />
                {/* Dot at label endpoint */}
                <circle cx={ex} cy={ey} r={2.5} fill={lineColor} stroke="none" />
                {/* Percentage text */}
                <text
                    x={textX}
                    y={ey}
                    textAnchor={textAnchor}
                    dominantBaseline="central"
                    fontSize={14}
                    fontWeight="600"
                    fontFamily="MuktaRegular, sans-serif"
                    fill={ch_primary_black}
                >
                    {formattedPct}
                    <tspan fontSize={11} fontWeight="400">%</tspan>
                </text>
            </g>
        );
    };

    // ─── Custom Active Shape ────────────────────────────────────────────────────
    // Defined inside the component so it can close over seriesName / formatters.
    // On hover: the active slice expands, a polyline label with name + rate appears.
    const renderActiveShape = (props) => {
        const {
            cx, cy, innerRadius, outerRadius,
            startAngle, endAngle, fill, payload, percent, value,
        } = props;
        const RADIAN = Math.PI / 180;
        const midAngle = (startAngle + endAngle) / 2;
        const sin = Math.sin(-RADIAN * midAngle);
        const cos = Math.cos(-RADIAN * midAngle);

        // Polyline control points
        const sx  = cx + (outerRadius + 4)  * cos;
        const sy  = cy + (outerRadius + 4)  * sin;
        const mx  = cx + (outerRadius + 32) * cos;
        const my  = cy + (outerRadius + 32) * sin;
        const ex  = mx + (cos >= 0 ? 1 : -1) * 22;
        const ey  = my;
        const textAnchor = cos >= 0 ? 'start' : 'end';
        const textX = ex + (cos >= 0 ? 10 : -10);

        const formattedValue = formatNumber(value ?? 0);
        const pct = formatPercentageDisplay(percent * 100);
        const isPercentage =
            String(seriesName || '').toLowerCase().includes('percentage') ||
            String(seriesName || '').toLowerCase().includes('percent');
        const valueSuffix = isPercentage ? '%' : '';

        return (
            <g>
                {/* Expanded active sector */}
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius + 8}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                    stroke="#ffffff"
                    strokeWidth={2}
                />
                {/* Thin outer ring accent */}
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={outerRadius + 10}
                    outerRadius={outerRadius + 13}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                    opacity={0.45}
                />
                {/* Polyline from slice to label */}
                <path
                    d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
                    stroke={fill}
                    fill="none"
                    strokeWidth={1.5}
                />
                {/* Dot at label endpoint */}
                <circle cx={ex} cy={ey} r={3} fill={fill} stroke="none" />
                {/* Line 1: name + value */}
                <text
                    x={textX}
                    y={ey - 5}
                    textAnchor={textAnchor}
                    fontSize={13}
                    fontWeight="700"
                    fontFamily="MuktaRegular, sans-serif"
                    fill="#111111"
                >
                    {payload.name}{'  '}
                    <tspan fontWeight="400" fill="#444444">
                        {formattedValue}{valueSuffix}
                    </tspan>
                </text>
                {/* Line 2: (Rate X.XX%) */}
                <text
                    x={textX}
                    y={ey + 13}
                    textAnchor={textAnchor}
                    fontSize={12}
                    fontFamily="MuktaRegular, sans-serif"
                    fill="#888888"
                >
                    (Rate {pct}%)
                </text>
            </g>
        );
    };

    // Compute innerRadius to match Highcharts' convention:
    // In Highcharts, innerSize (e.g. "47%") is a fraction of the outer ring diameter.
    // Recharts expects both innerRadius and outerRadius as % of the container.
    // So: innerRadius_container = (innerSize_fraction) * OUTER_RADIUS_PCT
    const innerRadiusPct = useMemo(() => {
        let fraction = 0.47; // default 47%
        if (typeof innerSizeRaw === 'string' && innerSizeRaw.endsWith('%')) {
            fraction = parseInt(innerSizeRaw, 10) / 100;
        } else if (typeof innerSizeRaw === 'number') {
            fraction = innerSizeRaw > 1 ? innerSizeRaw / 100 : innerSizeRaw;
        }
        return Math.round(fraction * OUTER_RADIUS_PCT);
    }, [innerSizeRaw]);

    // Process data - filter out zero/falsy values, identical to pieChartOptions.
    // sanitizeName strips JSON-array brackets that appear in raw series names.
    const chartData = useMemo(() => {
        const rawSeries = args?.series ?? [];
        const filteredSeries = rawSeries.filter(
            (item) =>
                Number(item?.value || item?.y || item?.doubleValue || item?.intValue) > 0,
        );
        const autoColors = commonColorCode(filteredSeries);
        return filteredSeries.map((item, index) => ({
            name: sanitizeName(seriesNameField(item.name)),
            value: Number(item.y) || Number(item.value) || Number(item.intValue),
            color: item?.color ?? autoColors[index] ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length],
            ...(item?.count != null && { count: Number(item.count) }),
        }));
    }, [args?.series]);

    // All chart data used for the legend (never filtered so all items always show)
    // Visible chart data filters out toggled-off slices for the Pie render
    const visibleChartData = useMemo(
        () => (hiddenKeys.size === 0 ? chartData : chartData.filter((d) => !hiddenKeys.has(d.name))),
        [chartData, hiddenKeys],
    );

    // Recharts angles: Highcharts startAngle rotates the pie; recharts uses
    // startAngle (counterclockwise from 3 o'clock) and endAngle.
    // Map Highcharts angle → recharts startAngle (recharts is CCW from east;
    // Highcharts is CW from top)
    const rcStartAngle = 90 - startAngleDeg;
    const rcEndAngle = rcStartAngle - 360;

    if (!chartData.length) {
        return (
            <div
                style={{
                    height,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: ch_primary_black,
                    fontFamily: 'MuktaRegular, sans-serif',
                    fontSize: 13,
                }}
            >
                No data available
            </div>
        );
    }

    return (
        <div
            style={{
                position: 'relative',
                width: '100%',
                height,
                fontFamily: 'MuktaRegular, sans-serif',
            }}
        >
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={visibleChartData}
                        cx="50%"
                        cy="50%"
                        startAngle={rcStartAngle}
                        endAngle={rcEndAngle}
                        innerRadius={`${innerRadiusPct}%`}
                        outerRadius={`${OUTER_RADIUS_PCT}%`}
                        paddingAngle={1}
                        dataKey="value"
                        isAnimationActive={false}
                        activeIndex={activeIndex ?? undefined}
                        activeShape={renderActiveShape}
                        label={renderCustomLabel}
                        labelLine={false}
                        onMouseEnter={(_, index) => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                    >
                        {visibleChartData.map((entry, index) => (
                            <Cell
                                key={`cell-${entry.name}-${index}`}
                                fill={entry.color}
                                stroke="#ffffff"
                                strokeWidth={2}
                            />
                        ))}
                    </Pie>

                    {/* Tooltip only shown when no active shape is displayed */}
                    {activeIndex === null && (
                        <Tooltip
                            content={(props) => <CustomTooltip {...props} seriesName={seriesName} />}
                            wrapperStyle={{ outline: 'none', zIndex: 10 }}
                            contentStyle={{
                                background: 'transparent',
                                border: 'none',
                                boxShadow: 'none',
                                padding: 0,
                            }}
                            cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                        />
                    )}

                    {showLegend && (
                        <Legend
                            content={(props) => (
                                <CustomLegend
                                    {...props}
                                    allData={chartData}
                                    totalItems={chartData.length}
                                    hiddenKeys={hiddenKeys}
                                    onToggle={toggleKey}
                                />
                            )}
                            verticalAlign="bottom"
                            wrapperStyle={{ paddingTop: 8 }}
                        />
                    )}
                </PieChart>
            </ResponsiveContainer>

            {/* Donut centre text overlay */}
            {innerRadiusPct > 0 && (
                <div
                    style={{
                        position: 'absolute',
                        top: showLegend ? '44%' : '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none',
                        textAlign: 'center',
                        maxWidth: `${innerRadiusPct * 1.2}%`,
                        overflow: 'hidden',
                    }}
                >
                    {centerImage ? (
                        <div dangerouslySetInnerHTML={{ __html: centerImage }} />
                    ) : (
                        <span
                            style={{
                                fontSize: 13,
                                fontFamily: 'MuktaRegular, sans-serif',
                                fontWeight: 500,
                                color: activeIndex !== null
                                    ? (visibleChartData[activeIndex]?.color ?? '#666')
                                    : '#888888',
                                display: 'block',
                                lineHeight: 1.3,
                                wordBreak: 'break-word',
                                transition: 'color 0.2s ease',
                            }}
                        >
                            {activeIndex !== null
                                ? visibleChartData[activeIndex]?.name ?? seriesName
                                : seriesName}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

ReactChartsPie.displayName = 'ReactChartsPie';

ReactChartsPie.propTypes = {
    /** Same args shape accepted by the Highcharts pieChartOptions helper */
    args: PropTypes.shape({
        height: PropTypes.number,
        series: PropTypes.arrayOf(
            PropTypes.shape({
                name: PropTypes.string,
                y: PropTypes.number,
                value: PropTypes.number,
                intValue: PropTypes.number,
                doubleValue: PropTypes.number,
                color: PropTypes.string,
                count: PropTypes.number,
            }),
        ),
        seriesName: PropTypes.string,
        innerSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        angle: PropTypes.number,
        image: PropTypes.string,
        legend: PropTypes.shape({
            enabled: PropTypes.bool,
            itemMarginTop: PropTypes.number,
            y: PropTypes.number,
        }),
        dataLabels: PropTypes.shape({
            enabled: PropTypes.bool,
        }),
        tooltip: PropTypes.object,
    }),
    /** Kept for API parity with pieChartOptions(args, position) */
    position: PropTypes.bool,
};

export default memo(ReactChartsPie);
