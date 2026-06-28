import { useMemo, useEffect, useCallback, useRef, useState } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSModal from 'Components/RSModal';
import { Col, Row } from 'react-bootstrap';
import RSInput from 'Components/FormFields/RSInput';
import { useForm, FormProvider } from 'react-hook-form';
import { GOOGLE_MAPS_API_KEY } from './constant';
import { getDefaultCenterFromTimezone } from './timezoneDefault';
import './LocationMapModal.css';

const DEFAULT_ZOOM = 12;
const PLACES_AUTOCOMPLETE_DEBOUNCE_MS = 300;
const NOMINATIM_HEADERS = { Accept: 'application/json', 'User-Agent': 'RESUL-App/1.0' };

/** Places API (New) - Autocomplete REST; no legacy JS library. */
const fetchPlacesSuggestionsGoogle = async (input, center) => {
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
        const list = suggestions || [];
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

/** Nominatim (OpenStreetMap) – free place search, no API key. Used when Google Places is unavailable. */
const fetchPlacesSuggestionsNominatim = async (input) => {
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
        return map((item) => {
            const placeName = item.name || item.address?.name || item.address?.neighbourhood || item.address?.suburb || (item.display_name || '').split(',')[0]?.trim() || '';
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

/** Try Google Places first; fall back to free Nominatim if Google returns nothing. */
const fetchPlacesSuggestions = async (input, center) => {
    const googleList = await fetchPlacesSuggestionsGoogle(input, center);
    if (googleList.length > 0) return googleList;
    const nominatimList = await fetchPlacesSuggestionsNominatim(input);
    return nominatimList;
};

/** Places API (New) - Place Details REST to get location and address. */
const fetchPlaceDetails = async (placeId) => {
    if (!placeId) return null;
    try {
        const res = await fetch(
            `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
            {
                headers: {
                    'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
                    'X-Goog-FieldMask': 'location,displayName,formattedAddress',
                },
            }
        );
        if (!res.ok) return null;
        const data = await res.json();
        const loc = location;
        const lat = loc?.latitude != null ? Number(loc.latitude) : null;
        const lng = loc?.longitude != null ? Number(loc.longitude) : null;
        if (lat == null || lng == null) return null;
        return {
            lat,
            lng,
            placeName: displayName?.text || displayName || '',
            address: formattedAddress || '',
        };
    } catch {
        return null;
    }
};

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

/** Google Geocoding REST API - try first (reliable from browser when Geocoding API is enabled). */
const reverseGeocodeGoogleRest = async (lat, lng) => {
    try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${encodeURIComponent(lat)},${encodeURIComponent(lng)}&key=${GOOGLE_MAPS_API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        if (status !== 'OK' || !results?.[0]) return null;
        return parseGoogleGeocodeResult(results[0]);
    } catch {
        return null;
    }
};

/** Same as Leaflet: Nominatim (OpenStreetMap) - no API key, always works from browser. */
const reverseGeocodeNominatim = async (lat, lng) => {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
            { headers: { Accept: 'application/json' } }
        );
        const data = await res.json();
        if (!data) return null;
        const displayName = data.display_name || '';
        const name =
            data.name ||
            data.address?.name ||
            data.address?.neighbourhood ||
            data.address?.suburb ||
            (displayName.split(',')[0] || '').trim();
        return { placeName: name || (displayName.split(',')[0] || '').trim(), address: displayName };
    } catch {
        return null;
    }
};

/**
 * Reverse geocode so Place name and Address bind when user selects (same as Leaflet).
 * Tries Google REST first, then in-page Geocoder, then Nominatim fallback.
 */
const reverseGeocodeWithGoogle = async (lat, lng) => {
    if (typeof lat !== 'number' || typeof lng !== 'number' || Number.isNaN(lat) || Number.isNaN(lng)) {
        return { placeName: '', address: '' };
    }
    let result = await reverseGeocodeGoogleRest(lat, lng);
    if (result && (result.address || result.placeName)) return result;
    if (typeof window !== 'undefined' && window.google?.maps?.Geocoder) {
        try {
            result = await new Promise((resolve) => {
                const geocoder = new window.google.maps.Geocoder();
                geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                    if (status === 'OK' && results?.[0]) resolve(parseGoogleGeocodeResult(results[0]));
                    else resolve(null);
                });
            });
            if (result && (result.address || result.placeName)) return result;
        } catch (_) {}
    }
    result = await reverseGeocodeNominatim(lat, lng);
    return result || { placeName: '', address: '' };
};

const triggerMapResize = (map, delays = [0, 100, 350, 600]) => {
    if (!map || !window.google?.maps?.event) return;
    delays.forEach((ms) => {
        if (ms === 0) {
            window.google.maps.event.trigger(map, 'resize');
        } else {
            setTimeout(() => window.google.maps.event.trigger(map, 'resize'), ms);
        }
    });
};

const LocationMapModal = ({ show, handleClose, initialValues = {}, onSave }) => {
    const defaultCenter = useMemo(() => {
        const [lat, lng] = getDefaultCenterFromTimezone();
        return { lat, lng };
    }, []);

    const [mapReady, setMapReady] = useState(false);
    const mapRef = useRef(null);

    useEffect(() => {
        if (!show) {
            setMapReady(false);
            mapRef.current = null;
            return;
        }
        const t = setTimeout(() => setMapReady(true), 300);
        return () => clearTimeout(t);
    }, [show]);

    useEffect(() => {
        if (!show || !mapRef.current) return;
        const t = setTimeout(() => triggerMapResize(mapRef.current), 400);
        return () => clearTimeout(t);
    }, [show, mapReady]);

    const defaultValues = useMemo(
        () => ({
            regionName: initialValues.regionName ?? initialValues.locationName ?? '',
            address: initialValues.address ?? initialValues.locationAddress ?? '',
            latitude: initialValues.latitude ?? '',
            longitude: initialValues.longitude ?? '',
        }),
        [
            initialValues.regionName,
            initialValues.locationName,
            initialValues.address,
            initialValues.locationAddress,
            initialValues.latitude,
            initialValues.longitude,
        ],
    );

    const methods = useForm({
        defaultValues,
        mode: 'onTouched',
    });

    const { control, watch, setValue, getValues, reset, formState: { errors ,isValid}, trigger, clearErrors} = methods;
    const latitude = watch('latitude');
    const longitude = watch('longitude');
    const regionName = watch('regionName');
    const lastGeocodedRef = useRef({ lat: null, lng: null });
    const [placeSuggestions, setPlaceSuggestions] = useState([]);
    const [placeSuggestionsOpen, setPlaceSuggestionsOpen] = useState(false);
    const placeSearchDebounceRef = useRef(null);

    const { isLoaded, loadError } = useLoadScript({
        id: 'google-map-script-communication-location',
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    });

    useEffect(() => {
        if (show) {
            reset(defaultValues);
            lastGeocodedRef.current = { lat: null, lng: null };
            setPlaceSuggestions([]);
            setPlaceSuggestionsOpen(false);
        }
    }, [show, reset, defaultValues]);

    // When modal is open and we have valid coordinates (from initialValues or manual entry), bind Place name and Address via reverse geocode
    useEffect(() => {
        if (!show || !isLoaded) return;
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        if (latitude === '' || longitude === '' || Number.isNaN(lat) || Number.isNaN(lng)) return;
        if (lastGeocodedRef.current.lat === lat && lastGeocodedRef.current.lng === lng) return;
        lastGeocodedRef.current = { lat, lng };
        let cancelled = false;
        reverseGeocodeWithGoogle(lat, lng).then(({ placeName, address }) => {
            if (cancelled) return;
            setValue('regionName', placeName ?? '', { shouldValidate: false });
            setValue('address', address ?? '', { shouldValidate: false });
        });
        return () => { cancelled = true; };
    }, [show, isLoaded, latitude, longitude, setValue]);

    const center = useMemo(() => {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
            return { lat, lng };
        }
        return defaultCenter;
    }, [latitude, longitude, defaultCenter]);

    const markerPosition = useMemo(() => {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        if (latitude !== '' && longitude !== '' && !Number.isNaN(lat) && !Number.isNaN(lng)) {
            return { lat, lng };
        }
        return null;
    }, [latitude, longitude]);

    const mapContainerStyle = useMemo(
        () => ({ width: '100%', height: '400px', minHeight: '400px' }),
        [],
    );

    const handleMapLoad = useCallback((map) => {
        mapRef.current = map;
        triggerMapResize(map);
    }, []);

    const handleLocationSelect = useCallback(
        async (e) => {
            const lat = e.latLng?.lat();
            const lng = e.latLng?.lng();
            if (typeof lat !== 'number' || typeof lng !== 'number') return;
            lastGeocodedRef.current = { lat, lng };
            setValue('latitude', lat, { shouldValidate: true });
            setValue('longitude', lng, { shouldValidate: true });
            const { placeName, address } = await reverseGeocodeWithGoogle(lat, lng);
            setValue('regionName', placeName ?? '', { shouldValidate: false });
            setValue('address', address ?? '', { shouldValidate: false });
            clearErrors()
        },
        [setValue],
    );

    const searchCenter = useMemo(() => {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        if (!Number.isNaN(lat) && !Number.isNaN(lng)) return { lat, lng };
        return defaultCenter;
    }, [latitude, longitude, defaultCenter]);

    const onPlaceNameInputChange = useCallback(
        (e) => {
            const value = e.target.value;
            setValue('regionName', value, { shouldValidate: true });
            if (placeSearchDebounceRef.current) clearTimeout(placeSearchDebounceRef.current);
            if (!value.trim()) {
                setPlaceSuggestions([]);
                setPlaceSuggestionsOpen(false);
                return;
            }
            placeSearchDebounceRef.current = setTimeout(() => {
                fetchPlacesSuggestions(value, searchCenter).then((list) => {
                    setPlaceSuggestions(list);
                    setPlaceSuggestionsOpen(list.length > 0);
                });
            }, PLACES_AUTOCOMPLETE_DEBOUNCE_MS);
        },
        [setValue, searchCenter],
    );

    const onPlaceSuggestionSelect = useCallback(
        async (item) => {
            setPlaceSuggestions([]);
            setPlaceSuggestionsOpen(false);
            if (item.isNominatim) {
                lastGeocodedRef.current = { lat: item.lat, lng: item.lng };
                setValue('latitude', item.lat, { shouldValidate: true });
                setValue('longitude', item.lng, { shouldValidate: true });
                setValue('regionName', item.placeName || '', { shouldValidate: false });
                setValue('address', item.address || '', { shouldValidate: false });
                return;
            }
            const details = await fetchPlaceDetails(item.placeId);
            if (!details) return;
            lastGeocodedRef.current = { lat: details.lat, lng: details.lng };
            setValue('latitude', details.lat, { shouldValidate: true });
            setValue('longitude', details.lng, { shouldValidate: true });
            setValue('regionName', details.placeName || item.mainText || item.text, { shouldValidate: false });
            setValue('address', details.address || item.text, { shouldValidate: false });
        },
        [setValue],
    );

    const handleSave = async () => {
        await trigger()
        if (Object.keys(errors)?.length) return
        
        const values = getValues();
        const lat = values.latitude;
        const lng = values.longitude;
        if (lat != null && lat !== '' && lng != null && lng !== '') {
            onSave?.({
                latitude: lat,
                longitude: lng,
                regionName: values.regionName ?? '',
                address: values.address ?? '',
            });
            reset({ regionName: '', address: '', latitude: '', longitude: '' });
            handleClose();
        }
    };

    const handleCancel = () => {
        reset(defaultValues);
        handleClose();
    };

    const canSave =
        latitude != null &&
        latitude !== '' &&
        longitude != null &&
        longitude !== '' &&
        !Number.isNaN(parseFloat(latitude)) &&
        !Number.isNaN(parseFloat(longitude));

    return (
        <RSModal
            show={show}
            handleClose={handleCancel}
            size="xxlg"
            header="Map Location"
            body={
                <FormProvider {...methods}>
                <div className="location-map-modal-container">
                    <Row className="mb20">
                        <Col sm={8}>
                            <div className="map-wrapper" style={{ minHeight: '400px' }}>
                                <div
                                    style={{
                                        width: '100%',
                                        height: '400px',
                                        borderRadius: '4px',
                                        overflow: 'hidden',
                                        border: '1px solid #ddd',
                                    }}
                                >
                                    {loadError ? (
                                        <div style={{ padding: '24px', textAlign: 'center', color: '#dc3545' }}>
                                            <p>Error loading Google Maps. Please check your API key and ensure Maps JavaScript API is enabled.</p>
                                            <small>Set REACT_APP_GOOGLE_MAPS_API_KEY in .env or verify the key in Google Cloud Console.</small>
                                        </div>
                                    ) : !isLoaded ? (
                                        <div style={{ padding: '24px', textAlign: 'center' }}>
                                            <p>Loading map...</p>
                                        </div>
                                    ) : show && !mapReady ? (
                                        <div style={{ width: '100%', height: '400px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <p className="text-muted mb-0">Preparing map...</p>
                                        </div>
                                    ) : show && mapReady ? (
                                        <GoogleMap
                                            mapContainerStyle={mapContainerStyle}
                                            mapContainerClassName="map-container"
                                            center={center}
                                            zoom={DEFAULT_ZOOM}
                                            onLoad={handleMapLoad}
                                            onClick={handleLocationSelect}
                                            options={{
                                                zoomControl: true,
                                                zoomControlOptions: { position: 1 },
                                                mapTypeControl: false,
                                                scaleControl: false,
                                                streetViewControl: false,
                                                fullscreenControl: false,
                                            }}
                                        >
                                            {markerPosition && <Marker position={markerPosition} />}
                                        </GoogleMap>
                                    ) : (
                                        <div style={{ width: '100%', height: '400px', background: '#f5f5f5' }} />
                                    )}
                                </div>
                            </div>
                        </Col>
                        <Col sm={4}>
                            <div className="form-group">
                                <h3 className="rsmdc-header mb10">Location details</h3>
                                <div className="box-design no-box-shadow">
                                    <div className="form-group mt10 relative">
                                        <RSInput
                                            control={control}
                                            name={`regionName`}
                                            placeholder="Place name"
                                            maxLength={75}
                                            required
                                            rules={{
                                                required: 'Enter place name',
                                                maxLength: {
                                                    value: 75,
                                                    message: `Max ${75} characters`,
                                                },
                                            }}
                                            handleOnchange={onPlaceNameInputChange}
                                            handleOnFocus={() => placeSuggestions.length > 0 && setPlaceSuggestionsOpen(true)}
                                            handleOnBlur={() => setTimeout(() => setPlaceSuggestionsOpen(false), 200)}
                                        />
                                        {placeSuggestionsOpen && placeSuggestions.length > 0 && (
                                            <ul
                                                className="list-group"
                                                style={{
                                                    position: 'absolute',
                                                    zIndex: 10,
                                                    width: '100%',
                                                    maxHeight: '200px',
                                                    overflowY: 'auto',
                                                    marginTop: 2,
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                    borderRadius: 4,
                                                }}
                                            >
                                                {placeSuggestions.map((item, idx) => (
                                                    <li
                                                        key={item.isNominatim ? `nom-${item.lat}-${item.lng}-${idx}` : (item.placeId || '') + idx}
                                                        className="list-group-item list-group-item-action"
                                                        style={{ cursor: 'pointer', fontSize: '13px' }}
                                                        onMouseDown={(e) => {
                                                            e.preventDefault();
                                                            onPlaceSuggestionSelect(item);
                                                        }}
                                                    >
                                                        {item.mainText && (
                                                            <div className="fw-semibold">{item.mainText}</div>
                                                        )}
                                                        {(item.secondaryText || item.text) && (
                                                            <div className="text-muted small">
                                                                {item.secondaryText || item.text}
                                                            </div>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    <div className="form-group mt10">
                                        <RSInput
                                            control={control}
                                            name="address"
                                            label="Address"
                                            maxLength={200}
                                            required
                                            rules={{
                                                required: 'Enter address',
                                                maxLength: {
                                                    value: 200,
                                                    message: `Max ${200} characters`,
                                                },
                                            }}
                                        />
                                    </div>
                                    <Row className="form-group">
                                        <Col>
                                            <RSInput
                                                control={control}
                                                name="latitude"
                                                label="Latitude"
                                                required
                                                rules={{
                                                    required: 'Enter latitude',
                                                    validate: (v) => {
                                                        const num =
                                                            v !== '' && v !== null && v !== undefined ? Number(v) : NaN;
                                                        if (isNaN(num)) return 'Latitude must be numeric.';
                                                        if (num < -90 || num > 90) return 'Latitude range is -90 and 90';
                                                        return true;
                                                    },
                                                }}
                                            />
                                        </Col>
                                        <Col>
                                            <RSInput
                                                control={control}
                                                name="longitude"
                                                label="Longitude"
                                                required
                                                rules={{
                                                    required: 'Enter longitude',
                                                    validate: (v) => {
                                                        const num =
                                                            v !== '' && v !== null && v !== undefined ? Number(v) : NaN;
                                                        if (isNaN(num)) return 'Longitude must be numeric.';
                                                        if (num < -180 || num > 180) return 'Longitude range is -180 to 180';
                                                        return true;
                                                    },
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                    <p className="text-muted small mb-0">
                                        Click on the map to set location or enter coordinates manually.
                                    </p>
                                </div>
                            </div>
                        </Col>
                    </Row>
                    </div>
                </FormProvider>
            }
            footer={
                    <div className="buttons-holder m0">
                        <RSSecondaryButton onClick={handleCancel}>Cancel</RSSecondaryButton>
                        <RSPrimaryButton
                            onClick={handleSave}
                            className={!canSave || Object.keys(errors)?.length? 'click-off pe-none' : ''}
                            
                        >
                            Add
                        </RSPrimaryButton>
                    </div>
            }
        />
    );
};

export default LocationMapModal;
