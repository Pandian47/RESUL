import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { areachangeToBase64, changeToBase64, pieChartOption } from '../communicationAnalytics/DetailedAnalytics/constants';
// Chart Data Validation
export const isValidChartData = (chartJson) => {
    return (
        chartJson &&
        typeof chartJson === 'object' &&
        chartJson !== null &&
        Array.isArray(chartJson.categories) &&
        chartJson.categories.length > 0 &&
        Array.isArray(chartJson.series) &&
        chartJson.series.length > 0
    );
};

// Format chart data to JSON string
export const formatChartDataToString = (chartJson) => {
    if (!isValidChartData(chartJson)) {
        return '';
    }
    try {
        return JSON.stringify(chartJson);
    } catch (error) {
        return '';
    }
};

// Safely parse chart data with error handling
export const safeParseChartData = (dataString, parseFunction) => {
    if (!dataString || dataString === '' || typeof dataString !== 'string') {
        return {};
    }
    try {
        return parseFunction(dataString);
    } catch (error) {
        return {};
    }
};

// Check if data array is valid
export const hasValidData = (data) => {
    return data !== undefined && data !== null && Array.isArray(data) && data.length > 0;
};

// Extract numeric value from item (prioritizes doubleValue, then value)
export const getNumericValue = (item) => {
    if (item?.doubleValue !== undefined && item.doubleValue !== null) {
        return Number(item.doubleValue);
    }
    if (item?.value !== undefined && item.value !== null) {
        return Number(item.value);
    }
    return 0;
};

// Get top value from sorted array
export const getTopValueFromArray = (dataArray) => {
    if (!hasValidData(dataArray)) {
        return { value: 0, name: '' };
    }
    const sorted = [...dataArray].sort((a, b) => getNumericValue(b) - getNumericValue(a));
    const top = sorted[0];
    return {
        value: getNumericValue(top),
        name: top?.name || 'Unknown',
    };
};

// Format percentage value
export const formatPercentage = (value) => {
    if (!value) return 0;
    const numValue = parseFloat(value);
    return Number.isInteger(numValue) ? numValue : numValue.toFixed(1);
};

// Format table data with custom formatter
export const formatTableData = (dataArray, formatter) => {
    if (!Array.isArray(dataArray)) return [];
    return dataArray.map((item, index) => ({
        rowNo: index + 1,
        ...formatter(item),
    }));
};

// Process reach chart data
export const processReachChartData = (reachPerformanceJson, reachPerformanceHrsJson) => {
    const reachDataString = formatChartDataToString(reachPerformanceJson);
    const reachData = reachDataString
        ? safeParseChartData(reachDataString, (str) => changeToBase64(str, 'area'))
        : {};

    const reachHrsDataString = formatChartDataToString(reachPerformanceHrsJson);
    const reachHrsData = reachHrsDataString
        ? safeParseChartData(reachHrsDataString, (str) => changeToBase64(str, 'area'))
        : {};

    return { reach: reachData, reachHrs: reachHrsData };
};

// Process engagement chart data
export const processEngagementChartData = (engagementPerformanceJson, engagementPerformanceHrsJson) => {
    const engagementDataString = formatChartDataToString(engagementPerformanceJson);
    const engagementData = engagementDataString
        ? safeParseChartData(engagementDataString, (str) => areachangeToBase64(str, 'areaFooter'))
        : {};

    const engagementHrsDataString = formatChartDataToString(engagementPerformanceHrsJson);
    const engagementHrsData = engagementHrsDataString
        ? safeParseChartData(engagementHrsDataString, (str) => areachangeToBase64(str, 'areaFooter'))
        : {};

    return { engagement: engagementData, engagementHrs: engagementHrsData };
};

// Process conversion chart data
export const processConversionChartData = (conversionPerformanceJson) => {
    const conversionDataString = formatChartDataToString(conversionPerformanceJson);
    const conversionData = conversionDataString
        ? safeParseChartData(conversionDataString, (str) => changeToBase64(str, 'columnFooter'))
        : {};

    return { conversion: conversionData };
};

// Process pie chart data
export const processPieChartData = (deviceJson, browserJson) => {
    const hasDeviceData = hasValidData(deviceJson?.data);
    const hasBrowserData = hasValidData(browserJson?.data);

    const deviceChartData = hasDeviceData
        ? pieChartOption(JSON.stringify(deviceJson.data), 'pieFooter', true)
        : {};

    const browserChartData = hasBrowserData
        ? pieChartOption(JSON.stringify(browserJson.data), 'pieFooter', true)
        : {};

    const topDevice = getTopValueFromArray(deviceJson?.data);
    const topBrowser = getTopValueFromArray(browserJson?.data);

    return {
        device: {
            chartData: deviceChartData,
            topValue: topDevice,
            hasData: hasDeviceData,
        },
        browser: {
            chartData: browserChartData,
            topValue: topBrowser,
            hasData: hasBrowserData,
        },
    };
};

// Format communication summary data
export const formatCommunicationData = (communicationSummary) => {
    const formatCommunication = (item) => ({
        name: item?.name || '',
        startDate: item?.startDate ? getUserCurrentFormat(item.startDate)?.dateFormat : '',
        endDate: item?.endDate ? getUserCurrentFormat(item.endDate)?.dateFormat : '',
        submissionCount: item?.submissionCount || 0,
        uniqueSubmissionCount: item?.uniqueSubmissionCount || 0,
    });

    return formatTableData(communicationSummary, formatCommunication);
};

// Format landing page summary data
export const formatLandingPageData = (landingPageSummary) => {
    const formatLandingPage = (item) => ({
        url: item?.url || '',
        totalSubmissionCount: item?.totalSubmissionCount || 0,
        uniqueSubmissionCount: item?.uniqueSubmissionCount || 0,
    });

    return formatTableData(landingPageSummary, formatLandingPage);
};

// Format user summary data
export const formatUserData = (userSummary) => {
    const formatUser = (item) => ({
        name: item?.name || '',
        emailId: item?.emailId || '',
        mobileNo: item?.mobileNo || '',
        communicationName: item?.communicationName || '',
        city: item?.city || '',
        gender: item?.gender || '',
    });

    return formatTableData(userSummary, formatUser);
};

