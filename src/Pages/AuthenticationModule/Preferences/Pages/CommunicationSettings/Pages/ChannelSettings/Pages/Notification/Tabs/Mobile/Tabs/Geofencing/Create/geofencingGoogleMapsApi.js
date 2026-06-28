import { GOOGLE_MAPS_API_KEY } from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Create/Tabs/Whatsapp/Component/LocationMapModal/constant';
export { GOOGLE_MAPS_API_KEY };

export const GOOGLE_MAPS_SCRIPT_ID = 'google-map-script-communication-location';

/** Nominatim (OpenStreetMap) – same policy as WhatsApp LocationMapModal. */
const NOMINATIM_HEADERS = { Accept: 'application/json', 'User-Agent': 'RESUL-App/1.0' };

const parseGoogleGeocodeResult = (r) => {
    const address = r.formatted_address || '';
    const ac = r.address_components || [];
    const placeName =
        ac.find((c) => c.types.includes('establishment'))?.long_name ||
        ac.find((c) => c.types.includes('point_of_interest'))?.long_name ||
        ac.find((c) => c.types.includes('sublocality_level_1'))?.long_name ||
        ac.find((c) => c.types.includes('sublocality'))?.long_name ||
        ac.find((c) => c.types.includes('neighborhood'))?.long_name ||
        ac.find((c) => c.types.includes('locality'))?.long_name ||
        ac.find((c) => c.types.includes('administrative_area_level_2'))?.long_name ||
        (address.split(',')[0] || '').trim();
    return { placeName: placeName || (address.split(',')[0] || '').trim() || '', address };
};

/**
 * Google Places API (New) – autocomplete suggestions.
 */
export const fetchPlacesAutocompleteSuggestions = async (input, center) => {
    if (!input || input.trim().length < 2) return [];
    try {
        const body = { input: input.trim() };
        if (center && typeof center.lat === 'number' && typeof center.lng === 'number') {
            body.locationBias = {
                circle: {
                    center: { latitude: center.lat, longitude: center.lng },
                    radius: 50000,
                },
            };
        }
        const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
                'X-Goog-FieldMask': 'suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat',
            },
            body: JSON.stringify(body),
        });
        if (!res.ok) return [];
        const data = await res.json();
        const list = data.suggestions || [];
        return list.filter((s) => s.placePrediction).map((s) => ({
            placeId: (s.placePrediction.place || '').replace(/^places\//, '') || s.placePrediction.placeId,
            text: s.placePrediction.text?.text || '',
            mainText: s.placePrediction.structuredFormat?.mainText?.text || '',
            secondaryText: s.placePrediction.structuredFormat?.secondaryText?.text || '',
        }));
    } catch {
        return [];
    }
};

export const mapGoogleTypesToLocationType = (types = []) => {
    if (!Array.isArray(types) || types.length === 0) return 'Location';
    const t = new Set(types);
    if (t.has('country')) return 'Country';
    if (t.has('administrative_area_level_1')) return 'State';
    if (t.has('locality') || t.has('postal_town')) return 'City';
    if (t.has('administrative_area_level_2')) return 'Region';
    if (t.has('neighborhood') || t.has('sublocality') || t.has('sublocality_level_1')) return 'Locality';
    return 'Location';
};

/**
 * Google Places API (New) – place details for coordinates and labels.
 */
export const fetchPlaceDetailsById = async (placeId) => {
    if (!placeId) return null;
    try {
        const res = await fetch(
            `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
            {
                headers: {
                    'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
                    'X-Goog-FieldMask': 'location,displayName,formattedAddress,types',
                },
            }
        );
        if (!res.ok) return null;
        const data = await res.json();
        const loc = data.location;
        const lat = loc?.latitude != null ? Number(loc.latitude) : null;
        const lng = loc?.longitude != null ? Number(loc.longitude) : null;
        if (lat == null || lng == null) return null;
        const types = data.types || [];
        return {
            lat,
            lng,
            placeName: data.displayName?.text || data.displayName || '',
            address: data.formattedAddress || '',
            types,
            locationType: mapGoogleTypesToLocationType(types),
        };
    } catch {
        return null;
    }
};

/**
 * Nominatim search (OpenStreetMap) – used when Google Places returns no results.
 * Shape matches WhatsApp LocationMapModal for shared selection handling.
 */
export const fetchPlacesSuggestionsNominatim = async (input) => {
    if (!input || input.trim().length < 2) return [];
    try {
        const url = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
            q: input.trim(),
            format: 'json',
            addressdetails: 1,
            limit: 8,
        })}`;
        const res = await fetch(url, { headers: NOMINATIM_HEADERS });
        const data = await res.json();
        if (!Array.isArray(data)) return [];
        return data.map((item) => {
            const placeName =
                item.name ||
                item.address?.name ||
                item.address?.neighbourhood ||
                item.address?.suburb ||
                (item.display_name || '').split(',')[0]?.trim() ||
                '';
            const address = item.display_name || '';
            return {
                isNominatim: true,
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon),
                placeName,
                address,
                mainText: placeName,
                secondaryText: address,
                text: address,
            };
        });
    } catch {
        return [];
    }
};

/**
 * Try Google Places first; if no results, fall back to Nominatim (same flow as WhatsApp location modal).
 */
export const fetchPlacesSuggestions = async (input, center) => {
    const googleList = await fetchPlacesAutocompleteSuggestions(input, center);
    if (googleList.length > 0) return googleList;
    return fetchPlacesSuggestionsNominatim(input);
};

const geocodeResultIsUseful = (r) =>
    r && (String(r.placeName || '').trim().length > 0 || String(r.address || '').trim().length > 0);

/** Google Geocoding REST (often blocked or denied from browser without Geocoding API). */
const reverseGeocodeGoogleRest = async (lat, lng) => {
    try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${encodeURIComponent(lat)},${encodeURIComponent(lng)}&key=${GOOGLE_MAPS_API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.status !== 'OK' || !data.results?.[0]) return null;
        return parseGoogleGeocodeResult(data.results[0]);
    } catch {
        return null;
    }
};

/** Nominatim reverse – reliable fallback when Google REST/JS geocoder do not return a label. */
const reverseGeocodeNominatimLatLng = async (lat, lng) => {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&addressdetails=1&zoom=18`,
            { headers: NOMINATIM_HEADERS }
        );
        const data = await res.json();
        if (!data) return null;
        const displayName = data.display_name || '';
        const name =
            data.name ||
            data.address?.name ||
            data.address?.neighbourhood ||
            data.address?.suburb ||
            data.address?.road ||
            (displayName.split(',')[0] || '').trim();
        const placeName = (name || (displayName.split(',')[0] || '').trim()) || '';
        return { placeName, address: displayName };
    } catch {
        return null;
    }
};

/**
 * Reverse geocode for place name: Google REST → Maps JS Geocoder (if map loaded) → Nominatim.
 * Same strategy as WhatsApp LocationMapModal so map clicks get a readable name, not raw coordinates.
 */
export const reverseGeocodeLatLng = async (lat, lng) => {
    if (typeof lat !== 'number' || typeof lng !== 'number' || Number.isNaN(lat) || Number.isNaN(lng)) {
        return null;
    }

    let result = await reverseGeocodeGoogleRest(lat, lng);
    if (geocodeResultIsUseful(result)) return result;

    if (typeof window !== 'undefined' && window.google?.maps?.Geocoder) {
        try {
            result = await new Promise((resolve) => {
                const geocoder = new window.google.maps.Geocoder();
                geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                    if (status === 'OK' && results?.[0]) resolve(parseGoogleGeocodeResult(results[0]));
                    else resolve(null);
                });
            });
            if (geocodeResultIsUseful(result)) return result;
        } catch {
            /* ignore */
        }
    }

    result = await reverseGeocodeNominatimLatLng(lat, lng);
    if (geocodeResultIsUseful(result)) return result;

    return null;
};

/** First non-empty line for UI: placeName, else first segment of formatted address. */
export const pickDisplayPlaceName = (geo, lat, lng, fractionDigits = 6) => {
    const fromName = geo?.placeName?.trim();
    if (fromName) return fromName.split(',')[0].trim();
    const fromAddr = geo?.address?.trim();
    if (fromAddr) return fromAddr.split(',')[0].trim();
    return `Location: ${lat.toFixed(fractionDigits)}, ${lng.toFixed(fractionDigits)}`;
};

/** Chennai – used only when `ipAddressData` is missing or invalid. */
export const FALLBACK_GEOFENCING_MAP_CENTER = { lat: 13.0827, lng: 80.2707 };

/**
 * Default map center from `localStorage.ipAddressData` (set at login / global init).
 * Matches keys used in globalState and login flows: latitude, longitude.
 */
export const getMapCenterFromIpAddressData = () => {
    try {
        if (typeof localStorage === 'undefined') return FALLBACK_GEOFENCING_MAP_CENTER;
        const raw = localStorage.getItem('ipAddressData');
        if (!raw || raw === 'null') return FALLBACK_GEOFENCING_MAP_CENTER;
        const data = JSON.parse(raw);
        const lat = parseFloat(
            data?.latitude ?? data?.Latitude ?? data?.lat ?? data?.Lat
        );
        const lng = parseFloat(data?.longitude ?? data?.Longitude ?? data?.lng ?? data?.Lon);
        if (Number.isNaN(lat) || Number.isNaN(lng)) return FALLBACK_GEOFENCING_MAP_CENTER;
        const nLat = Math.max(-85, Math.min(85, lat));
        const nLng = ((((lng + 180) % 360) + 360) % 360) - 180;
        return { lat: nLat, lng: nLng };
    } catch {
        return FALLBACK_GEOFENCING_MAP_CENTER;
    }
};

const normalizeCenter = (lat, lng) => ({
    lat: Math.max(-85, Math.min(85, lat)),
    lng: ((((lng + 180) % 360) + 360) % 360) - 180,
});

/**
 * Map default center without requiring the user to click the map: browser GPS first, then ipAddressData, then fallback.
 */
export const resolveDefaultMapCenter = () =>
    new Promise((resolve) => {
        if (typeof navigator !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    if (Number.isFinite(lat) && Number.isFinite(lng)) {
                        resolve(normalizeCenter(lat, lng));
                        return;
                    }
                    resolve(getMapCenterFromIpAddressData());
                },
                () => resolve(getMapCenterFromIpAddressData()),
                { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 }
            );
        } else {
            resolve(getMapCenterFromIpAddressData());
        }
    });
