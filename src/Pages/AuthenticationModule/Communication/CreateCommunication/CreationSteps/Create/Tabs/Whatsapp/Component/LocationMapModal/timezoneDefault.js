

const TIMEZONE_CENTERS = {
    // Asia
    'Asia/Kolkata': [13.0827, 80.2707],
    'Asia/Calcutta': [13.0827, 80.2707],
    'Asia/Singapore': [1.3521, 103.8198],
    'Asia/Dubai': [25.2048, 55.2708],
    'Asia/Bangkok': [13.7563, 100.5018],
    'Asia/Jakarta': [-6.2088, 106.8456],
    'Asia/Kuala_Lumpur': [3.139, 101.6869],
    'Asia/Hong_Kong': [22.3193, 114.1694],
    'Asia/Tokyo': [35.6762, 139.6503],
    'Asia/Shanghai': [31.2304, 121.4737],
    'Asia/Seoul': [37.5665, 126.978],
    // Americas
    'America/New_York': [40.7128, -74.006],
    'America/Chicago': [41.8781, -87.6298],
    'America/Denver': [39.7392, -104.9903],
    'America/Los_Angeles': [34.0522, -118.2437],
    'America/Toronto': [43.6532, -79.3832],
    'America/Mexico_City': [19.4326, -99.1332],
    'America/Sao_Paulo': [-23.5505, -46.6333],
    // Europe
    'Europe/London': [51.5074, -0.1278],
    'Europe/Paris': [48.8566, 2.3522],
    'Europe/Berlin': [52.52, 13.405],
    'Europe/Madrid': [40.4168, -3.7038],
    'Europe/Amsterdam': [52.3676, 4.9041],
    'Europe/Moscow': [55.7558, 37.6173],
    // Oceania
    'Australia/Sydney': [-33.8688, 151.2093],
    'Australia/Melbourne': [-37.8136, 144.9631],
    'Pacific/Auckland': [-36.8509, 174.7645],
};

const FALLBACK_CENTER = [13.0827, 80.2707]; // Chennai, India

export const getUserTimezone = () => {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    } catch {
        return '';
    }
};

export const getDefaultCenterFromTimezone = () => {
    const tz = getUserTimezone();
    if (!tz) return FALLBACK_CENTER;
    const center = TIMEZONE_CENTERS[tz];
    if (center) return center;
    const region = tz.split('/')[0];
    const regionMatch = Object.keys(TIMEZONE_CENTERS).find((k) => k.startsWith(region + '/'));
    return regionMatch ? TIMEZONE_CENTERS[regionMatch] : FALLBACK_CENTER;
};
