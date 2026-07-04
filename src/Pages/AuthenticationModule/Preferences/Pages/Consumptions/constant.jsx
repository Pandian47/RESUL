import { circle_paid_media_large, communication_response_sync_large, custom_event_large, email_large, messaging_rcs_large, mobile_notification_large, mobile_sms_large, qrcode_large, smart_link_large, social_post_large, social_vms_large, social_whatsapp_large, web_notification_large } from 'Constants/GlobalConstant/Glyphicons';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell';
import { sanitizeDisplayText } from 'Utils/index';


export const CHANNEL_IMAGE = {
    1: email_large,
    2: mobile_sms_large,
    7: social_post_large,
    8: web_notification_large,
    9: mobile_notification_large,
    14: mobile_notification_large,
    120: smart_link_large,
    3: qrcode_large,
    10: circle_paid_media_large,
    21: social_whatsapp_large,
    25: social_vms_large,
    39: custom_event_large,
    40: communication_response_sync_large,
    41: messaging_rcs_large,
};
 
export const getBandwidthChart = (bandwidth,isCustom) => {
    const bandwidthMatch = bandwidth?.match(/([0-9.]+)\s*([A-Za-z]+)/);
    const number = bandwidthMatch ? parseFloat(bandwidthMatch[1]) : 0;
    const unit = bandwidthMatch ? bandwidthMatch[2] : '';

    return {
        height:isCustom? 350: 400,
        className: isCustom ? 'mx-auto mt-15':'mx-auto mt25',
        yAxis: {
            tickPixelInterval: 100,
            labels: {
                step: 1,
                distance: -45,
                y: 0,
            },
        },
        status: 'Bandwidth',
        performanceScore: number,
        valueDecimals: 1,
        valueSuffix: unit ? ` ${unit}` : ' MB',
        reverseColors: true,
        customTooltip: {
            formatter: function () {
                const pointColor = this?.point?.color || this?.series?.color || '#000000';
                return `<span class="font-monospace" style="color:${pointColor}">\u25CF</span>&nbsp;<span class="font-xs">Bandwidth: </span><span class="font-xs"><b>${number} ${unit}</b></span>`;
            }
        }
    };
};

export const dataStorageData = {
    height: 310,
    className: '',
    name: 'Data Storage',
    data: [
        // ["Comunication response", 20],
        // ["Assets and templates", 12],
        // ["Audience base", 8],
    ],
};

export const getDataStorageChart = (data,isCustom) => {
    const format = data?.map((item) => [item?.dbName, item?.dataUsage]);
    return {
        height: isCustom ? 250 : 310,
        className: '',
        name: 'Data Storage',
        data: format,
        neckWidth: isCustom ? 120 : 150,
        width: isCustom ? 120 : 150,
        left: isCustom ? -50 : '',
    };
};
export const numericParentSumCell =
    (field, isParentRow,numberWithCommas) =>
    ({ dataItem }) => {
        if (isParentRow(dataItem) && Array.isArray(dataItem?.expandDetails)) {
            const total = dataItem?.expandDetails.reduce((sum, item) => sum + Number(item[field] || 0), 0);
 
            return <td className="text-right font-weight-bold">{numberWithCommas(total)}</td>;
        }
 
        return <td className="text-right">{numberWithCommas(dataItem?.[field] || 0)}</td>;
    };

// Sanitize text to remove special characters from API responses
export const sanitizeText = (text) => {
    if (!text) return text;
    return sanitizeDisplayText(text).replace(/\[C\*\]/g, '');
};

export const truncateCell =
    (getValue, maxLength = 30, options = {}) =>
    ({ dataItem, field }) => {
        const rawValue = typeof getValue === 'function' ? getValue({ dataItem, field }) : dataItem?.[field];
        const value = Array.isArray(rawValue) ? rawValue.filter(Boolean).join(', ') : rawValue ?? '';
        const cleanedText = sanitizeText(value);
        const text = String(cleanedText);
        const ellipsis = '...';
        const displayValue =
            typeof maxLength === 'number' && maxLength > 0 && text.length > maxLength
                ? `${text.slice(0, Math.max(0, maxLength - ellipsis.length))}${ellipsis}`
                : text;
        return (
            <TruncatedCell
                value={displayValue}
                alignRight={Boolean(options?.alignRight)}
                tooltipPosition={options?.tooltipPosition || 'top'}
            />
        );
    };

export const truncatedTextColumn = ({
    field,
    title,
    width = 250,
    maxLength = 30,
    filter = 'text',
    getValue,
    cellOptions,
} = {}) => {
    if (!field) return {};

    return {
        field,
        title: title ?? field,
        width,
        filter,
        cell: truncateCell(
            typeof getValue === 'function' ? getValue : ({ dataItem, field: f }) => dataItem?.[f],
            maxLength,
            cellOptions,
        ),
    };
};

export const tagsColumn = ({ width = 250, maxLength = 30, title = 'Tags' } = {}) => ({
    ...truncatedTextColumn({
        field: 'tags',
        title,
        width,
        maxLength,
    }),
});

export const commonConsumptionColumns = (opts = {}) => {
    const { order = ['tags'], tags = {} } = opts;

    const registry = {
        tags: () => tagsColumn(tags),
    };

    return order.map((key) => registry[key]?.()).filter(Boolean);
};
