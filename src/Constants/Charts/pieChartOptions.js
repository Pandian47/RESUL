import { chartSizing, commonColorCode, seriesNameField } from 'Constants/Charts/commonFunction';
import { formatPercentageDisplay } from 'Utils/modules/formatters';
import { formatNumber } from 'Utils/modules/campaignUtils';
import { truncateTitle } from 'Utils/modules/displayCore';
import { ch_color1, ch_color2, ch_color3, ch_color4, ch_color5, ch_color6, ch_color7, ch_color8, ch_color9, ch_legendtextSize, ch_primary_black } from 'Constants/GlobalConstant/Colors/colorsVariable';
const pieChartOptions = (args, position) => {
    return {
        chart: {
            type: 'pie',
            height: args?.height ?? chartSizing['pie'],
            className: position ? 'piechart-position-render' : 'piechart-default-render',
        },
        title: {
            text: args?.image ? args?.image : '',
            useHTML: args?.image ? true : false,
            verticalAlign: args?.image ? 'middle' : '',
        },
        credits: {
            enabled: false,
        },
        // tooltip: { enabled: false },
        tooltip: args?.tooltip || {
            // followPointer: false
            enabled: true,
            // formatter: function () {
            //     return this.point.y + '%';
            // }
            // pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y}</b>'
            headerFormat: '<span class="font-xs">{point.key}',
            pointFormat:
                '<br/><hr /><span class="font-monospace" style="color:{point.color}">\u25CF</span>&nbsp;<span class="font-xs">{series.name}: </span>' +
                '<span class="font-xs" style="text-align: right;">{point.y:,.0f}</span>', // {point.y:.1f}
            footerFormat: '</span>',
            formatter: function () {
                const formattedValue = formatNumber(this?.point?.y ?? 0);
                const isPercentage = String(this?.series?.name || '').toLowerCase().includes('percentage') || String(this?.series?.name || '').toLowerCase().includes('percent');
                const suffix = isPercentage ? '%' : '';
                return `<span class="font-xs">${this?.point?.name ?? ''}</span><br/><hr /><span class="font-monospace" style="color:${this?.point?.color ?? ''}">\u25CF</span>&nbsp;<span class="font-xs">${this?.series?.name ?? ''}: </span><span class="font-xs" style="text-align: right;">${formattedValue}${suffix}</span>`;
            }
        },
        colors: [
            ch_color1,
            ch_color2,
            ch_color3,
            ch_color4,
            ch_color5,
            ch_color6,
            ch_color7,
            ch_color8,
            ch_color9,
        ],
        plotOptions: {
            pie: {
                borderWidth: 2,
                startAngle: args?.angle ?? 45,
                animation: false,
                dataLabels: {
                    enabled: args?.dataLabels?.enabled ?? true,
                    distance: 30,
                    padding: 0,
                    y: -5,
                    // Custom connector shape function: draws a diagonal from the slice to an elbow,
                    // a perfectly straight horizontal line, and a solid filled dot (3 concentric circles).
                    connectorShape: function (labelPosition, connectorPosition, options) {
                        const touchingSliceAt = connectorPosition.touchingSliceAt;
                        const labelX = labelPosition.x;
                        const labelY = labelPosition.y;
                        
                        // In Highcharts:
                        // - alignment 'left' means left-aligned text, which is on the RIGHT side of the chart.
                        //   So the connector line should meet the label on the left (isRight = true).
                        // - alignment 'right' means right-aligned text, which is on the LEFT side of the chart.
                        //   So the connector line should meet the label on the right (isRight = false).
                        const isRight = labelPosition.alignment === 'left';
                        
                        // Determine if label is on the right or left of the slice connection point
                        // const isRight = labelX > touchingSliceAt.x;
                        
                        // Center of the dot: 10px offset from the label boundary
                        const dotX = labelX + (isRight ? -5 : -5);
                        
                        // horizontal line offset (the horizontal tail length)
                        const offset = isRight ? -16 : 20;
                        let elbowX = labelX + offset;

                        // Check for top/bottom crossover (zig-zag):
                        // If the first segment and the second segment go in opposite directions,
                        // we force elbowX to match touchingSliceAt.x. This results in a perfectly vertical line
                        // going straight up/down, followed by a flat horizontal line, creating a clean L-shape.
                        if (isRight && touchingSliceAt.x > elbowX) {
                            elbowX = touchingSliceAt.x;
                        } else if (!isRight && touchingSliceAt.x < elbowX) {
                            elbowX = touchingSliceAt.x;
                        }

                        // Concentric circles centered at (dotX, labelY) to create a solid filled 6.5px dot
                        return [
                            'M', touchingSliceAt.x, touchingSliceAt.y,
                            'L', elbowX, labelY,
                            'L', dotX, labelY,
                            
                            // Circle 1 (r = 0.5)
                            'M', dotX - 0.5, labelY,
                            'A', 0.5, 0.5, 0, 1, 0, dotX + 0.5, labelY,
                            'A', 0.5, 0.5, 0, 1, 0, dotX - 0.5, labelY,

                            // Circle 2 (r = 1.5)
                            'M', dotX - 1.5, labelY,
                            'A', 1.5, 1.5, 0, 1, 0, dotX + 1.5, labelY,
                            'A', 1.5, 1.5, 0, 1, 0, dotX - 1.5, labelY,

                            // Circle 3 (r = 2.5)
                            'M', dotX - 2.5, labelY,
                            'A', 2.5, 2.5, 0, 1, 0, dotX + 2.5, labelY,
                            'A', 2.5, 2.5, 0, 1, 0, dotX - 2.5, labelY
                        ];
                    },
                    connectorWidth: 1.5,
                    useHTML: true,
                    style: {
                        fontFamily: 'MuktaRegular',
                        fontWeight: '400',
                        fontSize:   '13px',
                        color:      ch_primary_black,
                        textOutline: 'none',
                    },
                    formatter: function () {
                        const name           = this.point.name ?? '';
                        const formattedValue = formatNumber(this.point.y ?? 0);
                        const pct            = formatPercentageDisplay(this.percentage);
                        const isPercentage   = String(this?.series?.name || '').toLowerCase().includes('percent');
                        const valueSuffix    = isPercentage ? '%' : '';
                        
                        // Line 1 (bold name + value)
                        // Line 2 (Rate X.XX%) in muted grey
                        return (
                            `${name}&nbsp;&nbsp;` +
                            // `<span style="font-weight:400">${formattedValue}${valueSuffix}</span>` +
                            `<br/>` +
                            `<span style="color:#888888;font-weight:400">(${pct}<span style="font-size:11px">%</span>)</span>`
                        );
                    },
                },
            },
        },
        legend: {
            enabled: args?.legend?.enabled ?? true,
            itemMarginTop: args?.legend?.itemMarginTop ?? 10,
            y: args?.legend?.y ?? 10,

            // align: 'left',
            // verticalAlign: 'middle',
            // floating: false,
            // width: 500,
            // layout: 'horizontal',

            itemStyle: {
                fontFamily: 'MuktaRegular',
                fontWeight: 'normal',
                fontSize: ch_legendtextSize,
                color: ch_primary_black,
                // wordWrap: 'break-word'
            },
            marker: { symbol: 'square', verticalAlign: 'middle', radius: '5' },
            symbolHeight: 9,
            symbolWidth: 8,
            symbolRadius: 2,
            useHTML: true,
            labelFormatter: function () {
                let truncatedName = this.name;
                if (this.series?.data?.length > 4 && this?.name?.length > 10) {
                    const result = truncateTitle(this.name, 10);
                    if (typeof result === 'string') {
                        truncatedName = result;
                    } else if (result?.props?.text) {
                        truncatedName = `${result.props.text.slice(0, 10)}...`;
                    } else {
                        truncatedName = `${this.name.slice(0, 10)}...`;
                    }
                }
                return `<span title="${this.name}">${truncatedName}</span>`;
            },
        },
        series: [
            {
                name: args?.seriesName ?? 'Count',
                showInLegend: true,
                size: '100%',
                height: '100%',
                innerSize: args?.innerSize ?? '47%',
                data: (() => {
                    const filteredSeries = (args?.series ?? [])
                        .filter((item) => Number(item?.value || item?.y || item?.doubleValue || item?.intValue) > 0);
                    return filteredSeries.map((item, index) => ({
                        name: seriesNameField(item.name),
                        y: Number(item.y) || Number(item.value) || Number(item.intValue),
                        color: item?.color ?? commonColorCode(filteredSeries)[index],
                        ...(item?.count != null && { count: Number(item.count) }),
                    }));
                })(),
                shadow: false,
            },
            {
                name: 'shadow',
                borderWidth: 0,
                size: args?.size2 ?? '50%',
                innerSize: args?.innerSize2 ?? '87%',
                data: [
                    { color: 'rgba(0,0,0,0.15)', y: 31 },
                    { color: 'rgba(0,0,0,0.15)', y: 21 },
                    { color: 'rgba(0,0,0,0.15)', y: 12 },
                    { color: 'rgba(0,0,0,0.15)', y: 36 },
                ],
                shadow: false,
                dataLabels: { enabled: false },
                enableMouseTracking: false,
            },
        ],
    };
};
export default pieChartOptions;
