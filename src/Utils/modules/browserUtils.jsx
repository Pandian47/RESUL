
export function getBrowserName() {
    let browserInfo = navigator.userAgent;
    let browser;
    if (browserInfo.includes('Opera') || browserInfo.includes('Opr')) {
        browser = 'Opera';
    } else if (browserInfo.includes('Edg')) {
        browser = 'Edge';
    } else if (browserInfo.includes('Chrome')) {
        browser = 'Chrome';
    } else if (browserInfo.includes('Safari')) {
        browser = 'Safari';
    } else if (browserInfo.includes('Firefox')) {
        browser = 'Firefox';
    } else {
        browser = 'unknown';
    }
    return browser;
}
export function getFirefoxVersion() {
    let userAgent = navigator.userAgent;
    let match = userAgent.match(/Firefox\/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
}
export function getCsvListType(type) {
    switch (type) {
        case 'Ad-hoc list':
            return 1;
        case 'Seed list':
            return 3;
        case 'Target list':
            return 5;
        case 'Match input list':
        case 'Match list':
            return 2;
        case 'Suppression input list':
        case 'Suppression list':
            return 4;
        case 'Hash match list':
            return 6;
        case 'Hash adhoc List':
            return 7;
        case 'Auto cluster list':
            return 8;
        case 'Auto adhoc match list':
            return 9;
        case 'ReTarget list':
            return 10;
        case 'Zero Day Campaign List':
            return 11;
        case 'UUID List':
            return 12;
        case 'BQ Zero Day Campaign List':
            return 13;
        case 'Partner Data List':
            return 14;
        case 'SDKReTarget List':
            return 15;
        default:
            return 5;
    }
}
