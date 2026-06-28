import { NUMBER_WITH_COMMA_REGEX } from 'Constants/GlobalConstant/Regex';
export function isEmpty(str) {
    return str === '';
}

// For color in charts

/** Display percentage: drop .00 decimals only; keep full precision otherwise (e.g. 50.04, 50.50). */
export function formatPercentageDisplay(value, decimals = 2) {
    if (value === null || value === undefined || value === '') return 0;
    const num = Number(value);
    if (Number.isNaN(num)) return 0;
    if (num === 0 || num === 100) return num;
    const fixed = num.toFixed(decimals);
    const decimalPart = fixed.split('.')[1];
    if (!decimalPart || /^0+$/.test(decimalPart)) {
        return Math.trunc(parseFloat(fixed));
    }
    return fixed;
}

export function showPercentage(value, count = 2) {
    return formatPercentageDisplay(value, count);
}


export function numberWithCommas(x) {
    if (x == null || x === '') return 0;
    const parts = String(x).split('.');
    parts[0] = parts[0].replace(NUMBER_WITH_COMMA_REGEX, ',');
    return parts.join('.');
}

export function parseFormattedNumber(value, defaultValue = 0) {
    if (value == null || value === '') return defaultValue;
    const numeric = Number(String(value).replace(/,/g, ''));
    return Number.isNaN(numeric) ? defaultValue : numeric;
}

export const formatAudienceChannelLabel = (bunchName, count) =>
    `${bunchName} (${numberWithCommas(count)})`;

export const mapAudienceWithChannelLabels = (audience) => ({
    ...audience,
    audienceEmail: formatAudienceChannelLabel(audience.recipientsBunchName, audience.recipientCountEmail),
    audienceMobile: formatAudienceChannelLabel(audience.recipientsBunchName, audience.recipientCountMobile),
    audienceWhatsapp: formatAudienceChannelLabel(audience.recipientsBunchName, audience.recipientCountMobile),
    audienceVMS: formatAudienceChannelLabel(audience.recipientsBunchName, audience.recipientCountVMS),
    audienceRCS: formatAudienceChannelLabel(audience.recipientsBunchName, audience.recipientCountRCS),
});

export function formatMaxFileSizeBinaryMb(bytes) {
    if (typeof bytes !== 'number' || bytes <= 0 || Number.isNaN(bytes)) {
        return '';
    }
    return numberWithCommas(Math.round(bytes / (1024 * 1024)));
}

export function formatMaxFileSizeDisplay(bytes) {
    if (typeof bytes !== 'number' || bytes <= 0 || Number.isNaN(bytes)) {
        return '';
    }
    const mib = 1024 * 1024;
    const gib = mib * 1024;
    if (bytes >= gib) {
        return `${numberWithCommas(Math.round(bytes / gib))} GB`;
    }
    return `${numberWithCommas(Math.round(bytes / mib))} MB`;
}
export function numberWithCommasformatCurrency(x) {
    if (x == null || x === '' || Number.isNaN(Number(x))) return '$0.00';
    return (
        '$' +
        parseFloat(x)
            .toFixed(2)
            .replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
    );
}

export function numberToWords(num) {
    const words = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];

    if (num == null || Number.isNaN(Number(num))) return '';
    if (num >= 0 && num <= 9) {
        return words[num];
    } else {
        return ''; // Handle out-of-range input
    }
}
export function paymentCommitmentEnum(num) {
    const words = ['', 'One month ', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];

    if (num == null || Number.isNaN(Number(num))) return '';
    if (num >= 0 && num <= 9) {
        return words[num];
    } else {
        return ''; // Handle out-of-range input
    }
}
export function formatName(name) {
    const updatedName = name?.toLowerCase()?.replaceAll(/\s+/g, '');
    return updatedName;
}
export function formatPercentage(inputValue) {
    if (inputValue == null || inputValue === '') return 0;
    const sanitizedInput = String(inputValue).replace('%', '').trim();
    const numericValue = parseFloat(sanitizedInput);
    return isNaN(numericValue) ? 0 : parseFloat(numericValue.toFixed(2));
}
export function chartFormatPercentage(value) {
    if (value === null || value === undefined || isNaN(value)) return '0%';
    if (value % 1 === 0) {
        return value + '%';
    }
    const rounded = Math.round(value * 10) / 10;
    if (rounded % 1 === 0) {
        return rounded + '%';
    }

    return rounded + '%';
}

/** Numeric percentage for chart labels (matches pie chart rounding). */
export function formatChartPercentageLabelValue(value) {
    return formatPercentageDisplay(value, 2);
}

const CHART_PERCENT_SUB_CLASS = 'fs11 percent-xs';

/** Data-label HTML: font-sm value + font-xs % (same as pieChartOptions). */
export function chartPercentageDataLabelHtml(value) {
    if (value === null || value === undefined || isNaN(value) || Number(value) <= 0) return '';
    const formattedPercentage = formatChartPercentageLabelValue(value);
    return `<span class="font-sm">${formattedPercentage}</span><sub class="font-xs">%</sub>`;
}

/** Y-axis percentage label HTML — number matches axis size; only % is smaller (sub). */
export function chartPercentageAxisLabelHtml(value) {
    if (value === null || value === undefined || isNaN(value)) return '';
    const formatted = formatChartPercentageLabelValue(value);
    return `<span>${formatted}</span><sub class="${CHART_PERCENT_SUB_CLASS}">%</sub>`;
}

/** Tooltip percentage value — same size as tooltip text; only % is smaller (sub). */
export function chartPercentageTooltipPercentHtml(value, decimals = 1) {
    const num = Number(value);
    if (value === null || value === undefined || isNaN(num)) return '';
    const formatted = formatPercentageDisplay(num, decimals);
    return `<span class="font-xs">${formatted}</span><sub class="${CHART_PERCENT_SUB_CLASS}">%</sub>`;
}

export function chartFormatNumber(value) {
    if (value == null || value === undefined || Number.isNaN(Number(value))) return '0';
    if (value >= 1e6) {
        const formatted = (value / 1e6).toFixed(1);
        return formatted.endsWith('.0') ? formatted.slice(0, -2) + 'm' : formatted + 'm';
    } else if (value >= 1e3) {
        const formatted = (value / 1e3).toFixed(1);
        return formatted.endsWith('.0') ? formatted.slice(0, -2) + 'k' : formatted + 'k';
    }
    return String(value);
}
//get numbers
export function getNumbersSubset(count) {
    return Array.from({ length: count }, (_, i) => i + 1);
}
